import { z } from 'zod';
import { audit } from '@/server/audit';
import { requireStaff } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { hashPassword, pinProblem } from '@/server/security';

const Body = z.object({ pin: z.string() });

/** Cria o PIN (primeira vez) ou troca (com o app desbloqueado). */
export const POST = route(async (req) => {
  const { pin } = await body(req, Body);
  const first = await requireStaff(req, { allowLocked: true });
  // trocar um PIN que já existe exige o app desbloqueado
  const ctx = first.staff.pinHash ? await requireStaff(req) : first;
  const problem = pinProblem(pin);
  if (problem) throw new ApiError(400, problem);
  await systemDb.staff.update({ where: { id: ctx.staff.id }, data: { pinHash: await hashPassword(pin) } });
  await systemDb.session.update({ where: { id: ctx.sessionId }, data: { pinOkAt: new Date(), pinFails: 0, lastSeenAt: new Date() } });
  await audit({ tenantId: ctx.tenant.id, actorKind: 'staff', actorId: ctx.staff.id, action: first.staff.pinHash ? 'pin_trocado' : 'pin_criado', ip: ipOf(req) });
  return ok();
});
