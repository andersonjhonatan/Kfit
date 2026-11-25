import { z } from 'zod';
import { audit } from '@/server/audit';
import { startStaffSession, trustNewDevice, useTicket } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { hashPassword, normalizePhone, passwordProblem } from '@/server/security';

const Body = z.object({ phone: z.string().max(30), ticket: z.string().min(10).max(200), password: z.string().max(100) });

/** Troca de senha depois do código no WhatsApp. Derruba todas as outras sessões. */
export const POST = route(async (req) => {
  const { phone: raw, ticket, password } = await body(req, Body);
  const phone = normalizePhone(raw);
  if (!phone) throw new ApiError(400, 'Telefone inválido.');
  const st = await systemDb.staff.findUnique({ where: { phone } });
  if (!st) throw new ApiError(400, 'Esse passo expirou. Comece de novo.');
  const problem = passwordProblem(password, phone);
  if (problem) throw new ApiError(400, problem);
  const purpose = await useTicket(st.id, ticket);
  if (purpose !== 'reset') throw new ApiError(400, 'Esse passo expirou. Comece de novo.');
  await systemDb.staff.update({ where: { id: st.id }, data: { passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null } });
  await systemDb.session.updateMany({ where: { staffId: st.id, revokedAt: null }, data: { revokedAt: new Date() } });
  await systemDb.device.deleteMany({ where: { staffId: st.id } });
  const device = await trustNewDevice(st, req);
  await startStaffSession(st, device.id, false);
  await audit({ tenantId: st.tenantId, actorKind: 'staff', actorId: st.id, action: 'senha_trocada', ip: ipOf(req) });
  return ok({ step: st.pinHash ? 'pin' : 'pin_create' });
});
