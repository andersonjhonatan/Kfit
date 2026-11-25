import { staffRead } from '@/server/guard';
import { ok, route } from '@/server/http';
import { addDays, agendaWeek, iso, today } from '@/server/queries';

export const GET = route(async (req) => {
  const { c, db } = await staffRead(req);
  const q = req.nextUrl.searchParams.get('inicio') ?? '';
  let start = /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : today();
  // começa na segunda-feira
  const d = new Date(start + 'T12:00:00');
  start = iso(addDays(d, -((d.getDay() + 6) % 7)));
  return ok({ start, today: today(), days: await db((tx) => agendaWeek(tx, c.tenant.id, start)) });
});
