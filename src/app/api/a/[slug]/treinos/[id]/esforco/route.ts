import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
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
    const [it] = await tx.select().from(schema.workoutItems).where(and(eq(schema.workoutItems.id, v.itemId), eq(schema.workoutItems.workoutId, workoutId))).limit(1);
    if (!it) throw new ApiError(404, 'Exercício não encontrado.');
    const s = await openSession(tx, c.tenant.id, c.student.id, workoutId);
    await tx
      .insert(schema.itemFeedback)
      .values({ tenantId: c.tenant.id, studentId: c.student.id, sessionId: s.id, itemId: it.id, pse: v.pse })
      .onConflictDoUpdate({ target: [schema.itemFeedback.sessionId, schema.itemFeedback.itemId], set: { pse: v.pse } });
  });
  return ok();
});
