import { z } from 'zod';
import { audit } from '@/server/audit';
import { revokeStudentSessions, startStudentSession, useTicket } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { hashPassword, normalizePhone, passwordProblem } from '@/server/security';
import { tenantBySlug } from '@/server/tenant';

const Body = z.object({ phone: z.string().max(30), ticket: z.string().min(10).max(200), password: z.string().max(100) });

/** Cria a senha (primeiro acesso) ou troca (esqueci a senha), depois do código. */
export const POST = route<{ params: Promise<{ slug: string }> }>(async (req, { params }) => {
  const slug = (await params).slug;
  const tn = await tenantBySlug(slug);
  const { phone: raw, ticket, password } = await body(req, Body);
  const phone = normalizePhone(raw);
  if (!phone) throw new ApiError(400, 'Telefone inválido.');
  const st = await systemDb.student.findUnique({ where: { tenantId_phone: { tenantId: tn.id, phone } } });
  if (!st) throw new ApiError(400, 'Esse passo expirou. Comece de novo.');
  if (st.accessStatus === 'pausado') throw new ApiError(403, 'Seu acesso está pausado pelo personal.');
  const problem = passwordProblem(password, phone);
  if (problem) throw new ApiError(400, problem);
  const purpose = await useTicket(st.id, ticket);
  await revokeStudentSessions(st.id);
  await systemDb.student.update({
    where: { id: st.id },
    data: { passwordHash: await hashPassword(password), passwordSetAt: new Date(), accessStatus: 'ativo', failedLogins: 0, lockedUntil: null },
  });
  await startStudentSession(slug, st);
  await audit({ tenantId: tn.id, actorKind: 'student', actorId: st.id, action: purpose === 'first' ? 'aluno_primeiro_acesso' : 'aluno_trocou_senha', ip: ipOf(req) });
  return ok({ step: 'in' });
});
