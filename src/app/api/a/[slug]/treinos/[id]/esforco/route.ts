import { z } from 'zod';
import { studentWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';
import { openSession } from '@/server/queries';

type P = { params: Promise<{ slug: string; id: string }> };

/** "Como foi?" — o aluno escolhe uma palavra; o personal vê o PSE (0 a 10). */
export const POST = route<P>(async (req, { params }) => {
  const p = await params;
  const workoutId = z.uuid().parse(p.id);
  const { c, db } = await studentWrite(p.slug);
  const v = await body(req, z.object({ itemId: z.uuid(), pse: z.coerce.number().int().min(0).max(10) }));
  await db(async (tx) => {
    const it = await tx.workoutItem.findFirst({ where: { id: v.itemId, workoutId } });
    if (!it) throw new ApiError(404, 'Exercício não encontrado.');
    const s = await openSession(tx, c.tenant.id, c.student.id, workoutId);
    const key = { sessionId: s.id, itemId: it.id };
    await tx.itemFeedback.createMany({ data: [{ tenantId: c.tenant.id, studentId: c.student.id, ...key, pse: v.pse }], skipDuplicates: true });
    await tx.itemFeedback.updateMany({ where: key, data: { pse: v.pse } });
  });
  return ok();
});
