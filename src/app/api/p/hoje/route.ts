import { ok, route } from '@/server/http';
import { staffRead } from '@/server/guard';
import { dashboard } from '@/server/queries';

export const GET = route(async (req) => {
  const { c, db } = await staffRead(req);
  return ok(await db((tx) => dashboard(tx, c.tenant.id)));
});
