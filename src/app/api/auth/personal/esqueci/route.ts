import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { sendOtp } from '@/server/auth';
import { schema, systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { normalizePhone } from '@/server/security';

const Body = z.object({ phone: z.string().max(30) });

export const POST = route(async (req) => {
  const phone = normalizePhone((await body(req, Body)).phone);
  if (!phone) throw new ApiError(400, 'Digite o número com DDD.');
  const [row] = await systemDb
    .select({ st: schema.staff, tn: schema.tenants })
    .from(schema.staff)
    .innerJoin(schema.tenants, eq(schema.tenants.id, schema.staff.tenantId))
    .where(eq(schema.staff.phone, phone))
    .limit(1);
  // Não revela se o número existe: a resposta é a mesma.
  if (!row) return ok({ step: 'code', phoneMask: '(••) •••••-' + phone.slice(-4) });
  const sent = await sendOtp({ tenantId: row.tn.id, subject: 'staff', subjectId: row.st.id, phone, isDemo: row.tn.isDemo }, 'reset', ipOf(req), 'KFit');
  return ok({ step: 'code', ...sent });
});
