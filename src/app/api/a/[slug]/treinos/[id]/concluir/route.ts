import { z } from 'zod';
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
    const n = await tx.setLog.count({ where: { sessionId: s.id } });
    if (n === 0) throw new ApiError(400, 'Anote pelo menos uma série antes de concluir.');
    await tx.trainingSession.update({ where: { id: s.id }, data: { finishedAt: new Date() } });
  });
  return ok();
});
