import { z } from 'zod';
import { studentWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';
import { openSession } from '@/server/queries';

type P = { params: Promise<{ slug: string; id: string }> };
const Body = z.object({
  itemId: z.uuid(),
  setNo: z.coerce.number().int().min(1).max(12),
  kg: z.coerce.number().min(0).max(1000).nullable(),
  reps: z.coerce.number().int().min(0).max(500).nullable(),
  undo: z.boolean().default(false),
});

/** O aluno anota o que pegou em cada série. */
export const POST = route<P>(async (req, { params }) => {
  const p = await params;
  const workoutId = z.uuid().parse(p.id);
  const { c, db } = await studentWrite(p.slug);
  const v = await body(req, Body);
  await db(async (tx) => {
    const it = await tx.workoutItem.findFirst({ where: { id: v.itemId, workoutId } });
    if (!it) throw new ApiError(404, 'Exercício não encontrado.');
    if (v.setNo > it.sets) throw new ApiError(400, 'Essa série não está no seu treino.');
    const s = await openSession(tx, c.tenant.id, c.student.id, workoutId);
    if (v.undo) {
      await tx.setLog.deleteMany({ where: { sessionId: s.id, itemId: it.id, setNo: v.setNo } });
      return;
    }
    const key = { sessionId: s.id, itemId: it.id, setNo: v.setNo };
    await tx.setLog.createMany({ data: [{ tenantId: c.tenant.id, studentId: c.student.id, ...key, kg: v.kg, reps: v.reps }], skipDuplicates: true });
    await tx.setLog.updateMany({ where: key, data: { kg: v.kg, reps: v.reps } });
  });
  return ok();
});
