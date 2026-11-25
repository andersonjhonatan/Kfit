import { z } from 'zod';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
const ItemBody = z.object({
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
    const w = await tx.workout.findUnique({ where: { id: workoutId } });
    if (!w) throw new ApiError(404, 'Treino não encontrado.');
    const ex = await tx.exercise.findFirst({ where: { id: v.exerciseId, OR: [{ tenantId: null }, { tenantId: c.tenant.id }] }, select: { id: true } });
    if (!ex) throw new ApiError(400, 'Exercício não encontrado.');
    const n = await tx.workoutItem.count({ where: { workoutId } });
    if (n >= 20) throw new ApiError(400, 'Limite de 20 exercícios por treino.');
    return tx.workoutItem.create({
      data: { tenantId: c.tenant.id, studentId: w.studentId, workoutId, exerciseId: v.exerciseId, position: n, sets: v.sets, reps: v.reps, targetKg: v.targetKg ?? null, restSec: v.restSec, notes: v.notes },
    });
  });
  return ok({ id: it.id }, { status: 201 });
});
