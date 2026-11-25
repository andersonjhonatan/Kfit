import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { audit } from '@/server/audit';
import { startStudentSession } from '@/server/auth';
import { schema, systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { LIMITS, limit } from '@/server/ratelimit';
import { checkPassword, normalizePhone } from '@/server/security';
import { tenantBySlug } from '@/server/tenant';

const Body = z.object({ phone: z.string().max(30), password: z.string().min(1).max(100) });

export const POST = route<{ params: Promise<{ slug: string }> }>(async (req, { params }) => {
  const slug = (await params).slug;
  const tn = await tenantBySlug(slug);
  const { phone: raw, password } = await body(req, Body);
  const phone = normalizePhone(raw);
  const ip = ipOf(req);
  await limit(`login:ip:${ip}`, ...LIMITS.loginIp);
  if (!phone) throw new ApiError(400, 'Digite o número com DDD.');
  await limit(`login:student:${tn.id}:${phone}`, ...LIMITS.loginPhone);
  const [st] = await systemDb
    .select()
    .from(schema.students)
    .where(and(eq(schema.students.tenantId, tn.id), eq(schema.students.phone, phone)))
    .limit(1);
  if (!st || !st.passwordHash || st.status !== 'ativo') throw new ApiError(400, 'Telefone ou senha incorretos.');
  if (st.accessStatus === 'pausado') throw new ApiError(403, 'Seu acesso está pausado pelo personal. Fale com ele para liberar.');
  if (st.lockedUntil && st.lockedUntil > new Date()) {
    throw new ApiError(423, 'Login travado por 15 minutos depois de 5 senhas erradas. Se foi você, recupere pelo WhatsApp.', { need: 'blocked' });
  }
  if (!(await checkPassword(password, st.passwordHash))) {
    const fails = st.failedLogins + 1;
    const lock = fails >= 5;
    await systemDb
      .update(schema.students)
      .set({ failedLogins: lock ? 0 : fails, lockedUntil: lock ? new Date(Date.now() + 15 * 60_000) : null })
      .where(eq(schema.students.id, st.id));
    if (lock) {
      await audit({ tenantId: tn.id, actorKind: 'student', actorId: st.id, action: 'login_aluno_travado', ip });
      throw new ApiError(423, 'Senha errada 5 vezes. Para proteger seus dados, o login ficou travado por 15 minutos.', { need: 'blocked' });
    }
    throw new ApiError(400, `Senha errada. Restam ${5 - fails} tentativas.`);
  }
  await startStudentSession(slug, st);
  return ok({ step: 'in' });
});
