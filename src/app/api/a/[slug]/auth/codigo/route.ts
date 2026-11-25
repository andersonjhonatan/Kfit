import { z } from 'zod';
import { checkOtp } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { limit } from '@/server/ratelimit';
import { normalizePhone } from '@/server/security';
import { tenantBySlug } from '@/server/tenant';

const Body = z.object({ phone: z.string().max(30), code: z.string().regex(/^\d{6}$/, 'O código tem 6 números.'), purpose: z.enum(['first', 'reset']) });

export const POST = route<{ params: Promise<{ slug: string }> }>(async (req, { params }) => {
  const tn = await tenantBySlug((await params).slug);
  const { phone: raw, code, purpose } = await body(req, Body);
  const phone = normalizePhone(raw);
  if (!phone) throw new ApiError(400, 'Telefone inválido.');
  await limit(`otpcheck:ip:${ipOf(req)}`, 30, 600);
  const st = await systemDb.student.findUnique({ where: { tenantId_phone: { tenantId: tn.id, phone } } });
  if (!st) throw new ApiError(400, 'Esse código não vale mais. Peça um novo.');
  const ticket = await checkOtp(st.id, purpose, code);
  return ok({ step: 'create', ticket });
});
