import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };

export const PATCH = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const { name } = await body(req, z.object({ name: z.string().trim().min(2).max(60) }));
  const [w] = await db((tx) => tx.update(schema.workouts).set({ name }).where(eq(schema.workouts.id, id)).returning());
  if (!w) throw new ApiError(404, 'Treino não encontrado.');
  return ok();
});

/** Arquiva (não apaga): o histórico de cargas do aluno continua. */
export const DELETE = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const [w] = await db((tx) => tx.update(schema.workouts).set({ archived: true }).where(eq(schema.workouts.id, id)).returning());
  if (!w) throw new ApiError(404, 'Treino não encontrado.');
  return ok();
});
