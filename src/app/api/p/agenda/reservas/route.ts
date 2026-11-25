import { z } from 'zod';
import { toDay } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

/** O personal marca um aluno num horário. */
export const POST = route(async (req) => {
  const { c, db } = await staffWrite(req);
  const v = await body(req, z.object({ studentId: z.uuid(), day: z.iso.date(), time: z.string().regex(/^\d{2}:\d{2}$/) }));
  await db(async (tx) => {
    const wd = new Date(v.day + 'T12:00:00').getDay();
    const slot = await tx.slot.findFirst({ where: { weekday: wd, time: v.time } });
    if (!slot) throw new ApiError(400, 'Esse horário não existe na sua agenda.');
    const n = await tx.booking.count({ where: { day: toDay(v.day), time: v.time, status: { in: ['confirmado', 'pedido'] } } });
    if (n >= slot.capacity) throw new ApiError(409, 'Horário lotado.');
    const s = await tx.student.findUnique({ where: { id: v.studentId }, select: { id: true } });
    if (!s) throw new ApiError(404, 'Aluno não encontrado.');
    await tx.booking.create({ data: { tenantId: c.tenant.id, studentId: v.studentId, day: toDay(v.day), time: v.time, status: 'confirmado' } });
  });
  return ok({}, { status: 201 });
});
