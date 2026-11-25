import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { studentWrite } from '@/server/guard';
import { body, ok, route } from '@/server/http';
import { today } from '@/server/queries';

type P = { params: Promise<{ slug: string }> };

export const POST = route<P>(async (req, { params }) => {
  const { c, db } = await studentWrite((await params).slug);
  const { cups } = await body(req, z.object({ cups: z.coerce.number().int().min(0).max(12) }));
  await db((tx) => tx.update(schema.students).set({ water: cups, waterDay: today() }).where(eq(schema.students.id, c.student.id)));
  return ok({ water: cups });
});
