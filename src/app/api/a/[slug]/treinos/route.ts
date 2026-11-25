import { studentRead } from '@/server/guard';
import { ok, route } from '@/server/http';
import { nextWorkout, workoutsOf } from '@/server/queries';

type P = { params: Promise<{ slug: string }> };

export const GET = route<P>(async (_req, { params }) => {
  const { c, db } = await studentRead((await params).slug);
  const ws = await db((tx) => workoutsOf(tx, c.student.id));
  return ok({ workouts: ws.map((w) => ({ id: w.id, name: w.name, lastDay: w.lastDay, count: w.items.length })), suggested: nextWorkout(ws)?.id ?? null });
});
