import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
const Body = z.object({ name: z.string().trim().min(2, 'Dê um nome ao treino.').max(60) });

export const POST = route<P>(async (req, { params }) => {
  const studentId = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const { name } = await body(req, Body);
  const w = await db(async (tx) => {
    const [s] = await tx.select({ id: schema.students.id }).from(schema.students).where(eq(schema.students.id, studentId)).limit(1);
    if (!s) throw new ApiError(404, 'Aluno não encontrado.');
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(schema.workouts).where(eq(schema.workouts.studentId, studentId));
    if (n >= 12) throw new ApiError(400, 'Limite de 12 treinos por aluno.');
    const [row] = await tx.insert(schema.workouts).values({ tenantId: c.tenant.id, studentId, name, position: n }).returning();
    return row;
  });
  return ok({ id: w.id }, { status: 201 });
});
