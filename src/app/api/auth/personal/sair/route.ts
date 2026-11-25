import { logoutStaff } from '@/server/auth';
import { ok, route } from '@/server/http';

export const POST = route(async () => {
  await logoutStaff();
  return ok();
});
