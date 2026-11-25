import { fromDay } from '@/server/db';
import { staffRead } from '@/server/guard';
import { ok, route } from '@/server/http';
import { ensureMonthPayments, payState, today } from '@/server/queries';

export const GET = route(async (req) => {
  const { c, db } = await staffRead(req);
  const t = today();
  const q = req.nextUrl.searchParams.get('mes') ?? '';
  const period = /^\d{4}-\d{2}$/.test(q) ? q : t.slice(0, 7);
  const rows = await db(async (tx) => {
    await ensureMonthPayments(tx, c.tenant.id);
    return tx.payment.findMany({
      where: { tenantId: c.tenant.id, period },
      include: { student: { select: { name: true, phone: true } } },
      orderBy: [{ dueDate: 'asc' }, { student: { name: 'asc' } }],
    });
  });
  const list = rows.map((p) => {
    const dueDate = fromDay(p.dueDate);
    return { id: p.id, name: p.student.name, phone: p.student.phone, amountCents: p.amountCents, dueDate, status: p.status, state: payState({ status: p.status, dueDate }, t) };
  });
  const sum = (f: (x: (typeof list)[number]) => boolean) => list.filter(f).reduce((a, x) => a + x.amountCents, 0);
  return ok({
    period,
    pixKey: c.tenant.pixKey,
    totals: { paid: sum((x) => x.status === 'pago'), open: sum((x) => x.status === 'aberto'), late: sum((x) => x.state.kind === 'late') },
    counts: { paid: list.filter((x) => x.status === 'pago').length, total: list.length },
    list,
  });
});
