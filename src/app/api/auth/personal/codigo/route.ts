import { z } from 'zod';
import { audit } from '@/server/audit';
import { checkOtp, startStaffSession, trustNewDevice, useTicket } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { limit } from '@/server/ratelimit';
import { normalizePhone } from '@/server/security';
import { sendWhatsApp } from '@/server/whatsapp';

const Body = z.object({ phone: z.string().max(30), code: z.string().regex(/^\d{6}$/, 'O código tem 6 números.'), purpose: z.enum(['device', 'reset']) });

export const POST = route(async (req) => {
  const { phone: raw, code, purpose } = await body(req, Body);
  const phone = normalizePhone(raw);
  if (!phone) throw new ApiError(400, 'Telefone inválido.');
  await limit(`otpcheck:ip:${ipOf(req)}`, 30, 600);
  const st = await systemDb.staff.findUnique({ where: { phone }, include: { tenant: true } });
  if (!st) throw new ApiError(400, 'Esse código não vale mais. Peça um novo.');
  const ticket = await checkOtp(st.id, purpose, code);
  if (purpose === 'reset') return ok({ step: 'new_password', ticket });

  await useTicket(st.id, ticket);
  const device = await trustNewDevice(st, req);
  await startStaffSession(st, device.id, false);
  await audit({ tenantId: st.tenantId, actorKind: 'staff', actorId: st.id, action: 'aparelho_novo', meta: { aparelho: device.label }, ip: ipOf(req) });
  if (st.alertNewDevice && !st.tenant.isDemo) {
    await sendWhatsApp(st.phone, `KFit: sua conta foi acessada num aparelho novo (${device.label}). Se não foi você, entre e toque em "Sair de todos os outros aparelhos".`);
  }
  return ok({ step: st.pinHash ? 'pin' : 'pin_create' });
});
