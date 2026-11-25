import { z } from 'zod';
import { sendOtp } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { normalizePhone } from '@/server/security';

const Body = z.object({ phone: z.string().max(30) });

export const POST = route(async (req) => {
  const phone = normalizePhone((await body(req, Body)).phone);
  if (!phone) throw new ApiError(400, 'Digite o número com DDD.');
  const st = await systemDb.staff.findUnique({ where: { phone }, include: { tenant: true } });
  // Não revela se o número existe: a resposta é a mesma.
  if (!st) return ok({ step: 'code', phoneMask: '(••) •••••-' + phone.slice(-4) });
  const sent = await sendOtp({ tenantId: st.tenantId, subject: 'staff', subjectId: st.id, phone, isDemo: st.tenant.isDemo }, 'reset', ipOf(req), 'KFit');
  return ok({ step: 'code', ...sent });
});
