import { z } from 'zod';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
const Body = z.object({ name: z.string().trim().min(2, 'Dê um nome ao treino.').max(60) });

export const POST = route<P>(async (req, { params }) => {
  const studentId = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const { name } = await body(req, Body);
  const w = await db(async (tx) => {
    const s = await tx.student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!s) throw new ApiError(404, 'Aluno não encontrado.');
    const n = await tx.workout.count({ where: { studentId } });
    if (n >= 12) throw new ApiError(400, 'Limite de 12 treinos por aluno.');
    return tx.workout.create({ data: { tenantId: c.tenant.id, studentId, name, position: n } });
  });
  return ok({ id: w.id }, { status: 201 });
});
