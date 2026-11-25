import { z } from 'zod';
import { studentRead } from '@/server/guard';
import { ApiError, ok, route } from '@/server/http';
import { num, todaySession, workoutsOf } from '@/server/queries';

type P = { params: Promise<{ slug: string; id: string }> };

/** Treino de hoje: meta do personal, última vez e o que já foi anotado hoje. */
export const GET = route<P>(async (_req, { params }) => {
  const p = await params;
  const id = z.uuid().parse(p.id);
  const { c, db } = await studentRead(p.slug);
  const { w, ts } = await db(async (tx) => {
    const w = (await workoutsOf(tx, c.student.id)).find((x) => x.id === id);
    if (!w) throw new ApiError(404, 'Treino não encontrado.');
    return { w, ts: await todaySession(tx, c.student.id, id) };
  });
  return ok({
    id: w.id,
    name: w.name,
    finished: Boolean(ts.session?.finishedAt),
    items: w.items.map((it) => ({
      ...it,
      today: ts.sets.filter((s) => s.itemId === it.id).map((s) => ({ setNo: s.setNo, kg: num(s.kg), reps: s.reps })),
      pse: ts.feedback.find((f) => f.itemId === it.id)?.pse ?? null,
    })),
  });
});
