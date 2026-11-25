import { z } from 'zod';
import { fromDay, systemDb, toDay } from '@/server/db';
import { studentRead, studentWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';
import { addDays, iso, today } from '@/server/queries';

type P = { params: Promise<{ slug: string }> };

/** Ocupação de cada horário: só contagem, sem nome de outros alunos. */
async function occupancy(tenantId: string, from: string, to: string) {
  const rows = await systemDb.booking.groupBy({
    by: ['day', 'time'],
    where: { tenantId, day: { gte: toDay(from), lte: toDay(to) }, status: { in: ['confirmado', 'pedido'] } },
    _count: { _all: true },
  });
  return rows.map((r) => ({ day: fromDay(r.day), time: r.time, n: r._count._all }));
}

export const GET = route<P>(async (_req, { params }) => {
  const { c, db } = await studentRead((await params).slug);
  const t = today();
  const days = Array.from({ length: 7 }, (_, i) => iso(addDays(new Date(t + 'T12:00:00'), i)));
  const { sl, mine } = await db(async (tx) => ({
    sl: await tx.slot.findMany({ orderBy: { time: 'asc' } }),
    mine: await tx.booking.findMany({ where: { day: { gte: toDay(t) }, status: { in: ['confirmado', 'pedido'] } } }),
  }));
  const occ = await occupancy(c.tenant.id, days[0], days[6]);
  const nowHm = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife', hour: '2-digit', minute: '2-digit' }).format(new Date());
  return ok({
    days: days.map((day) => {
      const wd = new Date(day + 'T12:00:00').getDay();
      return {
        day,
        weekday: wd,
        slots: sl
          .filter((s) => s.weekday === wd)
          .map((s) => {
            const taken = occ.find((o) => o.day === day && o.time === s.time)?.n ?? 0;
            const my = mine.find((m) => fromDay(m.day) === day && m.time === s.time);
            return { time: s.time, free: taken < s.capacity && !(day === t && s.time <= nowHm), mine: my ? my.status : null };
          }),
      };
    }),
  });
});

/** Pedido de horário: o personal confirma. */
export const POST = route<P>(async (req, { params }) => {
  const { c, db } = await studentWrite((await params).slug);
  const v = await body(req, z.object({ day: z.iso.date(), time: z.string().regex(/^\d{2}:\d{2}$/) }));
  const t = today();
  if (v.day < t || v.day > iso(addDays(new Date(t + 'T12:00:00'), 13))) throw new ApiError(400, 'Escolha um dia nas próximas 2 semanas.');
  const wd = new Date(v.day + 'T12:00:00').getDay();
  await db(async (tx) => {
    const slot = await tx.slot.findFirst({ where: { weekday: wd, time: v.time } });
    if (!slot) throw new ApiError(400, 'Esse horário não existe.');
    const mine = await tx.booking.count({ where: { day: toDay(v.day), status: { in: ['confirmado', 'pedido'] } } });
    if (mine) throw new ApiError(409, 'Você já tem um horário nesse dia.');
    const occ = await occupancy(c.tenant.id, v.day, v.day);
    if ((occ.find((o) => o.time === v.time)?.n ?? 0) >= slot.capacity) throw new ApiError(409, 'Esse horário acabou de ser ocupado. Escolha outro.');
    await tx.booking.create({ data: { tenantId: c.tenant.id, studentId: c.student.id, day: toDay(v.day), time: v.time, status: 'pedido' } });
  });
  return ok({}, { status: 201 });
});
