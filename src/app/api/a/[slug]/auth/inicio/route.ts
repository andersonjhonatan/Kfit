import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { sendOtp } from '@/server/auth';
import { schema, systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { LIMITS, limit } from '@/server/ratelimit';
import { normalizePhone } from '@/server/security';
import { tenantBySlug } from '@/server/tenant';

const Body = z.object({ phone: z.string().max(30) });

/** Aluno digita o WhatsApp: primeira vez → código; já tem senha → pede a senha. */
export const POST = route<{ params: Promise<{ slug: string }> }>(async (req, { params }) => {
  const tn = await tenantBySlug((await params).slug);
  const phone = normalizePhone((await body(req, Body)).phone);
  const ip = ipOf(req);
  await limit(`login:ip:${ip}`, ...LIMITS.loginIp);
  if (!phone) throw new ApiError(400, 'Digite o número com DDD.');
  const [st] = await systemDb
    .select()
    .from(schema.students)
    .where(and(eq(schema.students.tenantId, tn.id), eq(schema.students.phone, phone)))
    .limit(1);
  if (!st || st.status !== 'ativo') throw new ApiError(404, 'Esse número não está cadastrado. Só entra no app quem o personal cadastrou. Fale com ele.');
  if (st.accessStatus === 'pausado') throw new ApiError(403, 'Seu acesso está pausado pelo personal. Fale com ele para liberar.');
  if (!st.passwordHash) {
    const sent = await sendOtp({ tenantId: tn.id, subject: 'student', subjectId: st.id, phone, isDemo: tn.isDemo }, 'first', ip, tn.name);
    return ok({ step: 'code', purpose: 'first', ...sent });
  }
  return ok({ step: 'password', firstName: st.name.split(' ')[0] });
});
