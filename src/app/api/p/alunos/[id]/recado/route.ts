import { z } from 'zod';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
const Body = z.object({ text: z.string().trim().min(2).max(500) });

export const POST = route<P>(async (req, { params }) => {
  const studentId = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const { text } = await body(req, Body);
  await db(async (tx) => {
    const s = await tx.student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!s) throw new ApiError(404, 'Aluno não encontrado.');
    await tx.coachNote.create({ data: { tenantId: c.tenant.id, studentId, text } });
  });
  return ok({}, { status: 201 });
});
