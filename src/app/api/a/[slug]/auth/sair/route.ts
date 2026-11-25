import { logoutStudent } from '@/server/auth';
import { ok, route } from '@/server/http';

export const POST = route<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => {
  await logoutStudent((await params).slug);
  return ok();
});
