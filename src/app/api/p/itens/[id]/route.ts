import { z } from 'zod';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
const Patch = z.object({
  sets: z.coerce.number().int().min(1).max(12).optional(),
  reps: z.string().trim().min(1).max(12).optional(),
  targetKg: z.coerce.number().min(0).max(1000).nullable().optional(),
  restSec: z.coerce.number().int().min(0).max(600).optional(),
  notes: z.string().max(200).optional(),
});

/** Ajustar a meta de carga de um exercício. */
export const PATCH = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const v = await body(req, Patch);
  const r = await db((tx) => tx.workoutItem.updateMany({ where: { id }, data: v }));
  if (!r.count) throw new ApiError(404, 'Exercício não encontrado.');
  return ok();
});

export const DELETE = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const r = await db((tx) => tx.workoutItem.deleteMany({ where: { id } }));
  if (!r.count) throw new ApiError(404, 'Exercício não encontrado.');
  return ok();
});
