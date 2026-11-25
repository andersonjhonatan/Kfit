import { z } from 'zod';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };

export const PATCH = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const { name } = await body(req, z.object({ name: z.string().trim().min(2).max(60) }));
  const r = await db((tx) => tx.workout.updateMany({ where: { id }, data: { name } }));
  if (!r.count) throw new ApiError(404, 'Treino não encontrado.');
  return ok();
});

/** Arquiva (não apaga): o histórico de cargas do aluno continua. */
export const DELETE = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const r = await db((tx) => tx.workout.updateMany({ where: { id }, data: { archived: true } }));
  if (!r.count) throw new ApiError(404, 'Treino não encontrado.');
  return ok();
});
