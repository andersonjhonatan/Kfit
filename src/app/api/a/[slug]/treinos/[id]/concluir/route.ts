import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { studentWrite } from '@/server/guard';
import { ApiError, ok, route } from '@/server/http';
import { openSession } from '@/server/queries';

type P = { params: Promise<{ slug: string; id: string }> };

export const POST = route<P>(async (_req, { params }) => {
  const p = await params;
  const workoutId = z.uuid().parse(p.id);
  const { c, db } = await studentWrite(p.slug);
  await db(async (tx) => {
    const s = await openSession(tx, c.tenant.id, c.student.id, workoutId);
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(schema.setLogs).where(eq(schema.setLogs.sessionId, s.id));
    if (n === 0) throw new ApiError(400, 'Anote pelo menos uma série antes de concluir.');
    await tx.update(schema.trainingSessions).set({ finishedAt: new Date() }).where(eq(schema.trainingSessions.id, s.id));
  });
  return ok();
});
