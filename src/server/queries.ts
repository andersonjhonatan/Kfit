import 'server-only';
import type { Prisma } from '@prisma/client';
import { fromDay, toDay, type Tx } from './db';
import { ApiError } from './http';

/** Datas no fuso do Nordeste (sem horário de verão). */
export const TZ = 'America/Recife';
const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export const iso = (d: Date) => fmtDay.format(d);
export const today = () => iso(new Date());
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
export const num = (v: Prisma.Decimal | number | string | null | undefined) => (v === null || v === undefined ? null : Number(v));

/** Fichas de um aluno com exercícios, meta e o que foi feito da última vez. */
export async function workoutsOf(db: Tx, studentId: string) {
  const ws = await db.workout.findMany({
    where: { studentId, archived: false },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    include: { items: { orderBy: { position: 'asc' }, include: { exercise: true } } },
  });
  if (!ws.length) return [];
  // última sessão concluída de cada ficha
  const finished = await db.trainingSession.findMany({
    where: { studentId, finishedAt: { not: null } },
    orderBy: { day: 'desc' },
    distinct: ['workoutId'],
    select: { id: true, workoutId: true, day: true },
  });
  const lastIds = finished.map((s) => s.id);
  const sets = lastIds.length ? await db.setLog.findMany({ where: { sessionId: { in: lastIds } }, orderBy: { setNo: 'asc' } }) : [];
  const fb = lastIds.length ? await db.itemFeedback.findMany({ where: { sessionId: { in: lastIds } } }) : [];

  return ws.map((w) => {
    const last = finished.find((s) => s.workoutId === w.id) ?? null;
    return {
      id: w.id,
      name: w.name,
      lastDay: last ? fromDay(last.day) : null,
      items: w.items.map((it) => {
        const done = sets.filter((s) => s.itemId === it.id);
        const pse = fb.find((f) => f.itemId === it.id)?.pse ?? null;
        const target = num(it.targetKg);
        const best = done.reduce<number | null>((m, s) => (s.kg === null ? m : Math.max(m ?? 0, Number(s.kg))), null);
        const below = target !== null && done.some((s) => s.kg !== null && Number(s.kg) < target);
        const above = target !== null && best !== null && best > target;
        return {
          id: it.id,
          exerciseId: it.exercise.id,
          name: it.exercise.name,
          muscle: it.exercise.muscle,
          videoUrl: it.exercise.videoUrl,
          sets: it.sets,
          reps: it.reps,
          targetKg: target,
          restSec: it.restSec,
          notes: it.notes,
          last: done.length ? { sets: done.map((s) => ({ kg: num(s.kg), reps: s.reps })), pse, verdict: below ? 'abaixo' : above ? 'acima' : 'na meta' } : null,
        };
      }),
    };
  });
}

export async function assessmentsOf(db: Tx, studentId: string) {
  const rows = await db.assessment.findMany({ where: { studentId }, orderBy: { day: 'asc' } });
  return rows.map((a) => ({
    id: a.id,
    day: fromDay(a.day),
    weightKg: Number(a.weightKg),
    heightCm: a.heightCm,
    bodyFatPct: num(a.bodyFatPct),
    measures: a.measures as Record<string, number>,
    notes: a.notes,
  }));
}

/** Garante a mensalidade do mês corrente de cada aluno ativo (idempotente). */
export async function ensureMonthPayments(db: Tx, tenantId: string, now = new Date()) {
  const t = today();
  const [y, m] = [Number(t.slice(0, 4)), Number(t.slice(5, 7))];
  const period = t.slice(0, 7);
  const act = await db.student.findMany({ where: { tenantId, status: 'ativo', priceCents: { gt: 0 } } });
  if (!act.length) return;
  await db.payment.createMany({
    data: act.map((s) => ({
      tenantId,
      studentId: s.id,
      period,
      dueDate: toDay(`${y}-${String(m).padStart(2, '0')}-${String(s.dueDay).padStart(2, '0')}`),
      amountCents: s.planName === 'Trimestral' ? Math.round(s.priceCents / 3) : s.planName === 'Semestral' ? Math.round(s.priceCents / 6) : s.priceCents,
    })),
    skipDuplicates: true,
  });
  void now;
}

export function payState(p: { status: string; dueDate: string } | undefined, now = today()) {
  if (!p) return { kind: 'ok', label: 'Sem cobrança' };
  if (p.status === 'pago') return { kind: 'ok', label: 'Em dia' };
  if (p.dueDate < now) return { kind: 'late', label: 'Atrasado' };
  return { kind: 'warn', label: `Vence ${p.dueDate.slice(8, 10)}/${p.dueDate.slice(5, 7)}` };
}

/** Painel "Hoje" do personal. */
export async function dashboard(db: Tx, tenantId: string) {
  await ensureMonthPayments(db, tenantId);
  const t = today();
  const act = await db.student.findMany({ where: { tenantId, status: 'ativo' }, orderBy: { name: 'asc' } });
  const todayBookings = await db.booking.findMany({
    where: { tenantId, day: toDay(t), status: { in: ['confirmado', 'pedido'] } },
    include: { student: { select: { name: true } } },
    orderBy: { time: 'asc' },
  });
  const requests = await db.booking.findMany({
    where: { tenantId, status: 'pedido', day: { gte: toDay(t) } },
    include: { student: { select: { name: true } } },
    orderBy: [{ day: 'asc' }, { time: 'asc' }],
  });
  const pays = await db.payment.findMany({ where: { tenantId, period: t.slice(0, 7) } });
  const lastTrain = await db.trainingSession.groupBy({
    by: ['studentId'],
    where: { tenantId, finishedAt: { not: null } },
    _max: { day: true },
  });

  const missing = act
    .map((s) => {
      const d = lastTrain.find((l) => l.studentId === s.id)?._max.day ?? null;
      const days = d ? Math.round((new Date(t).getTime() - d.getTime()) / 86_400_000) : null;
      return { id: s.id, name: s.name, phone: s.phone, days, never: d === null };
    })
    .filter((m) => m.days === null || m.days >= 7)
    .sort((a, b) => (b.days ?? 999) - (a.days ?? 999));

  // cargas fora da meta na última sessão de cada aluno
  const weekAgo = iso(addDays(new Date(), -7));
  const alerts: { studentId: string; name: string; exercise: string; verdict: string; detail: string }[] = [];
  for (const s of act) {
    const ws = await workoutsOf(db, s.id);
    for (const w of ws)
      for (const it of w.items)
        if (it.last && it.last.verdict !== 'na meta' && w.lastDay && w.lastDay >= weekAgo) {
          alerts.push({
            studentId: s.id,
            name: s.name,
            exercise: it.name,
            verdict: it.last.verdict,
            detail: `Meta ${it.sets} × ${it.reps} · ${it.targetKg} kg. Fez: ${it.last.sets.map((x) => (x.kg === null ? `${x.reps ?? '–'} reps` : `${x.kg} kg × ${x.reps ?? '–'}`)).join(' · ')}${it.last.pse !== null ? ` · PSE ${it.last.pse}` : ''}`,
          });
        }
  }

  const open = pays.filter((p) => p.status === 'aberto');
  return {
    kpis: {
      todayCount: todayBookings.length,
      students: act.length,
      toReceive: open.length,
      toReceiveCents: open.reduce((a, p) => a + p.amountCents, 0),
      late: open.filter((p) => fromDay(p.dueDate) < t).length,
    },
    today: todayBookings.map((b) => ({ id: b.id, time: b.time, name: b.student.name, status: b.status })),
    requests: requests.map((b) => ({ id: b.id, day: fromDay(b.day), time: b.time, name: b.student.name })),
    missing,
    alerts,
  };
}

export async function studentsList(db: Tx, tenantId: string) {
  await ensureMonthPayments(db, tenantId);
  const t = today();
  const rows = await db.student.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  const pays = await db.payment.findMany({ where: { tenantId, period: t.slice(0, 7) } });
  return rows.map((s) => {
    const p = pays.find((x) => x.studentId === s.id);
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      goal: s.goal,
      days: s.days,
      status: s.status,
      access: s.accessStatus,
      pay: payState(p ? { status: p.status, dueDate: fromDay(p.dueDate) } : undefined, t),
    };
  });
}

export async function studentDetail(db: Tx, id: string) {
  const s = await db.student.findUnique({ where: { id } });
  if (!s) return null;
  const pays = await db.payment.findMany({ where: { studentId: id }, orderBy: { period: 'desc' }, take: 12 });
  const note = await db.coachNote.findFirst({ where: { studentId: id }, orderBy: { createdAt: 'desc' } });
  return {
    student: {
      id: s.id,
      name: s.name,
      phone: s.phone,
      goal: s.goal,
      sex: s.sex,
      birth: s.birth ? fromDay(s.birth) : null,
      heightCm: s.heightCm,
      days: s.days,
      planName: s.planName,
      priceCents: s.priceCents,
      dueDay: s.dueDay,
      status: s.status,
      access: s.accessStatus,
      passwordSetAt: s.passwordSetAt,
      lastAccessAt: s.lastAccessAt,
    },
    workouts: await workoutsOf(db, id),
    assessments: await assessmentsOf(db, id),
    payments: pays.map((p) => ({ id: p.id, period: p.period, dueDate: fromDay(p.dueDate), amountCents: p.amountCents, status: p.status, paidAt: p.paidAt })),
    note: note ? { text: note.text, reaction: note.reaction, at: note.createdAt } : null,
  };
}

/** Semana da agenda (segunda a domingo) a partir de `start`. */
export async function agendaWeek(db: Tx, tenantId: string, start: string) {
  const days = Array.from({ length: 7 }, (_, i) => iso(addDays(new Date(start + 'T12:00:00'), i)));
  const sl = await db.slot.findMany({ where: { tenantId }, orderBy: [{ weekday: 'asc' }, { time: 'asc' }] });
  const bk = await db.booking.findMany({
    where: { tenantId, day: { in: days.map(toDay) }, status: { in: ['confirmado', 'pedido'] } },
    include: { student: { select: { name: true } } },
  });
  return days.map((day) => {
    const wd = new Date(day + 'T12:00:00').getDay();
    return {
      day,
      weekday: wd,
      slots: sl
        .filter((s) => s.weekday === wd)
        .map((s) => ({
          time: s.time,
          capacity: s.capacity,
          bookings: bk.filter((b) => fromDay(b.day) === day && b.time === s.time).map((b) => ({ id: b.id, name: b.student.name, status: b.status })),
        })),
    };
  });
}

// ───────── app do aluno ─────────

/** Próximo treino na sequência (depois do último concluído). */
export function nextWorkout<T extends { id: string; lastDay: string | null }>(ws: T[]): T | null {
  if (!ws.length) return null;
  const done = ws.filter((w) => w.lastDay);
  if (!done.length) return ws[0];
  const last = done.reduce((a, b) => (a.lastDay! >= b.lastDay! ? a : b));
  if (last.lastDay === today()) return last;
  return ws[(ws.indexOf(last) + 1) % ws.length];
}

export async function todaySession(db: Tx, studentId: string, workoutId: string) {
  const s = await db.trainingSession.findUnique({ where: { studentId_workoutId_day: { studentId, workoutId, day: toDay(today()) } } });
  if (!s) return { session: null, sets: [], feedback: [] };
  const sets = await db.setLog.findMany({ where: { sessionId: s.id }, orderBy: { setNo: 'asc' } });
  const feedback = await db.itemFeedback.findMany({ where: { sessionId: s.id } });
  return { session: s, sets, feedback };
}

export async function studentStreak(db: Tx, studentId: string) {
  const rows = await db.trainingSession.findMany({
    where: { studentId, finishedAt: { not: null } },
    distinct: ['day'],
    orderBy: { day: 'desc' },
    take: 60,
    select: { day: true },
  });
  return rows.map((r) => fromDay(r.day));
}

/** Abre (se preciso) a sessão de hoje desse treino. */
export async function openSession(db: Tx, tenantId: string, studentId: string, workoutId: string) {
  const w = await db.workout.findUnique({ where: { id: workoutId } });
  if (!w || w.archived) throw new ApiError(404, 'Treino não encontrado.');
  const day = toDay(today());
  // ON CONFLICT DO NOTHING: várias séries anotadas ao mesmo tempo não brigam pela mesma sessão
  await db.trainingSession.createMany({ data: [{ tenantId, studentId, workoutId, day }], skipDuplicates: true });
  return db.trainingSession.findUniqueOrThrow({ where: { studentId_workoutId_day: { studentId, workoutId, day } } });
}
