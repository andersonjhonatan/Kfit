import { lockStaff } from '@/server/auth';
import { ok, route } from '@/server/http';

export const POST = route(async (req) => {
  await lockStaff(req);
  return ok();
});
