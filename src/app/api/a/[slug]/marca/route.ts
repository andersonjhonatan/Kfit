import { ok, route } from '@/server/http';
import { publicBrand, tenantBySlug } from '@/server/tenant';

export const GET = route<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => {
  const t = await tenantBySlug((await params).slug);
  return ok(publicBrand(t));
});
