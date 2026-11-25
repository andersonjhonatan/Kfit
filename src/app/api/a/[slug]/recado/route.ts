import { z } from 'zod';
import { studentWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ slug: string }> };

export const POST = route<P>(async (req, { params }) => {
  const { db } = await studentWrite((await params).slug);
  const v = await body(req, z.object({ id: z.uuid(), reaction: z.enum(['👍', '💪', '❤️']) }));
  const n = await db((tx) => tx.coachNote.updateMany({ where: { id: v.id }, data: { reaction: v.reaction } }));
  if (!n.count) throw new ApiError(404, 'Recado não encontrado.');
  return ok();
});
