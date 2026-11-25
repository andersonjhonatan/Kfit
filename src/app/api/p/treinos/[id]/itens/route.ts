import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
export const ItemBody = z.object({
  exerciseId: z.uuid('Escolha um exercício.'),
  sets: z.coerce.number().int().min(1).max(12).default(3),
  reps: z.string().trim().min(1).max(12).default('10'),
  targetKg: z.coerce.number().min(0).max(1000).nullable().optional(),
  restSec: z.coerce.number().int().min(0).max(600).default(60),
  notes: z.string().max(200).default(''),
});

export const POST = route<P>(async (req, { params }) => {
  const workoutId = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const v = await body(req, ItemBody);
  const it = await db(async (tx) => {
    const [w] = await tx.select().from(schema.workouts).where(eq(schema.workouts.id, workoutId)).limit(1);
    if (!w) throw new ApiError(404, 'Treino não encontrado.');
    const [ex] = await tx
      .select({ id: schema.exercises.id })
      .from(schema.exercises)
      .where(and(eq(schema.exercises.id, v.exerciseId), or(isNull(schema.exercises.tenantId), eq(schema.exercises.tenantId, c.tenant.id))))
      .limit(1);
    if (!ex) throw new ApiError(400, 'Exercício não encontrado.');
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(schema.workoutItems).where(eq(schema.workoutItems.workoutId, workoutId));
    if (n >= 20) throw new ApiError(400, 'Limite de 20 exercícios por treino.');
    const [row] = await tx
      .insert(schema.workoutItems)
      .values({ tenantId: c.tenant.id, studentId: w.studentId, workoutId, exerciseId: v.exerciseId, position: n, sets: v.sets, reps: v.reps, targetKg: v.targetKg == null ? null : String(v.targetKg), restSec: v.restSec, notes: v.notes })
      .returning();
    return row;
  });
  return ok({ id: it.id }, { status: 201 });
});
