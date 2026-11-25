import { z } from 'zod';
import { unlockWithPin } from '@/server/auth';
import { body, ok, route } from '@/server/http';
import { checkPassword } from '@/server/security';

const Body = z.object({ pin: z.string().regex(/^\d{4}$/, 'O PIN tem 4 números.') });

export const POST = route(async (req) => {
  const { pin } = await body(req, Body);
  await unlockWithPin(req, pin, checkPassword);
  return ok();
});
