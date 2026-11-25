import { ok, route } from '@/server/http';
import { requireStaff } from '@/server/auth';
import { accessOf, planOf } from '@/server/rules';
import { maskPhone } from '@/server/security';
import { publicBrand } from '@/server/tenant';

export const GET = route(async (req) => {
  const c = await requireStaff(req);
  const plan = planOf(c.tenant);
  return ok({
    staff: { name: c.staff.name, firstName: c.staff.name.split(' ')[0], phone: maskPhone(c.staff.phone), lockAfterMin: c.staff.lockAfterMin },
    studio: { ...publicBrand(c.tenant), plan: c.tenant.plan, planName: plan.name, access: accessOf(c.tenant), trialEndsAt: c.tenant.trialEndsAt, pixKey: c.tenant.pixKey },
    features: { ai: plan.ai },
  });
});
