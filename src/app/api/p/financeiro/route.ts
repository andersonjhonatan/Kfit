import { and, asc, eq } from 'drizzle-orm';
import { schema } from '@/server/db';
import { staffRead } from '@/server/guard';
import { ok, route } from '@/server/http';
import { ensureMonthPayments, payState, today } from '@/server/queries';

export const GET = route(async (req) => {
  const { c, db } = await staffRead(req);
  const t = today();
  const period = /^\d{4}-\d{2}$/.test(req.nextUrl.searchParams.get('mes') ?? '') ? req.nextUrl.searchParams.get('mes')! : t.slice(0, 7);
  const rows = await db(async (tx) => {
    await ensureMonthPayments(tx, c.tenant.id);
    return tx
      .select({ p: schema.payments, name: schema.students.name, phone: schema.students.phone })
      .from(schema.payments)
      .innerJoin(schema.students, eq(schema.students.id, schema.payments.studentId))
      .where(and(eq(schema.payments.tenantId, c.tenant.id), eq(schema.payments.period, period)))
      .orderBy(asc(schema.payments.dueDate), asc(schema.students.name));
  });
  const list = rows.map((r) => ({
    id: r.p.id,
    name: r.name,
    phone: r.phone,
    amountCents: r.p.amountCents,
    dueDate: r.p.dueDate,
    status: r.p.status,
    state: payState({ status: r.p.status, dueDate: r.p.dueDate }, t),
  }));
  const sum = (f: (x: (typeof list)[number]) => boolean) => list.filter(f).reduce((a, x) => a + x.amountCents, 0);
  return ok({
    period,
    pixKey: c.tenant.pixKey,
    totals: { paid: sum((x) => x.status === 'pago'), open: sum((x) => x.status === 'aberto'), late: sum((x) => x.state.kind === 'late') },
    counts: { paid: list.filter((x) => x.status === 'pago').length, total: list.length },
    list,
  });
});
