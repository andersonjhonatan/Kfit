import { and, desc, eq, gte } from 'drizzle-orm';
import { schema } from '@/server/db';
import { studentRead } from '@/server/guard';
import { ok, route } from '@/server/http';
import { addDays, assessmentsOf, iso, nextWorkout, payState, studentStreak, today, todaySession, workoutsOf } from '@/server/queries';
import { publicBrand } from '@/server/tenant';

type P = { params: Promise<{ slug: string }> };

/** Tela Início do aluno. */
export const GET = route<P>(async (_req, { params }) => {
  const { c, db } = await studentRead((await params).slug);
  const st = c.student;
  const data = await db(async (tx) => {
    const ws = await workoutsOf(tx, st.id);
    const next = nextWorkout(ws);
    const ts = next ? await todaySession(tx, st.id, next.id) : null;
    const days = await studentStreak(tx, st.id);
    const ev = await assessmentsOf(tx, st.id);
    const [pay] = await tx.select().from(schema.payments).where(eq(schema.payments.studentId, st.id)).orderBy(desc(schema.payments.period)).limit(1);
    const [note] = await tx.select().from(schema.notes).where(eq(schema.notes.studentId, st.id)).orderBy(desc(schema.notes.createdAt)).limit(1);
    const [booking] = await tx
      .select()
      .from(schema.bookings)
      .where(and(eq(schema.bookings.studentId, st.id), gte(schema.bookings.day, today())))
      .orderBy(schema.bookings.day, schema.bookings.time)
      .limit(1);
    return { ws, next, ts, days, ev, pay, note, booking };
  });

  const t = today();
  const monday = addDays(new Date(t + 'T12:00:00'), -((new Date(t + 'T12:00:00').getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = iso(addDays(monday, i));
    return { day: d, done: data.days.includes(d), today: d === t };
  });
  // sequência: dias de treino seguidos sem passar 3 dias parado
  let streak = 0;
  let ref = t;
  for (const d of data.days) {
    const gap = Math.round((new Date(ref).getTime() - new Date(d).getTime()) / 86_400_000);
    if (gap > 3) break;
    streak++;
    ref = d;
  }
  const doneItems = data.next ? data.next.items.filter((it) => data.ts!.sets.filter((s) => s.itemId === it.id).length >= it.sets).length : 0;
  const first = data.ev[0];
  const lastEv = data.ev[data.ev.length - 1];
  const waterToday = st.waterDay === t ? st.water : 0;

  return ok({
    brand: publicBrand(c.tenant),
    me: { firstName: st.name.split(' ')[0], name: st.name, goal: st.goal },
    workout: data.next
      ? { id: data.next.id, name: data.next.name, total: data.next.items.length, done: doneItems, finished: Boolean(data.ts?.session?.finishedAt) }
      : null,
    week,
    streak,
    water: waterToday,
    weight: lastEv ? { now: lastEv.weightKg, diff: first && first !== lastEv ? Math.round((lastEv.weightKg - first.weightKg) * 10) / 10 : null, since: first?.day ?? null, series: data.ev.map((e) => e.weightKg) } : null,
    pay: data.pay ? { ...payState({ status: data.pay.status, dueDate: data.pay.dueDate }), amountCents: data.pay.amountCents, dueDate: data.pay.dueDate, pixKey: c.tenant.pixKey } : null,
    note: data.note ? { id: data.note.id, text: data.note.text, reaction: data.note.reaction, at: data.note.createdAt } : null,
    booking: data.booking ? { day: data.booking.day, time: data.booking.time, status: data.booking.status } : null,
  });
});
