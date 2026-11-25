import 'server-only';
import { and, asc, desc, eq, gte, inArray, isNotNull, sql } from 'drizzle-orm';
import type { Db } from './db';
import { ApiError } from './http';
import { schema } from './db';

const { students, workouts, workoutItems, exercises, trainingSessions, setLogs, itemFeedback, assessments, payments, bookings, slots, notes } = schema;

/** Datas no fuso do Nordeste (sem horário de verão). */
export const TZ = 'America/Recife';
const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export const iso = (d: Date) => fmtDay.format(d);
export const today = () => iso(new Date());
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
export const num = (v: string | null | undefined) => (v === null || v === undefined ? null : Number(v));

/** Fichas de um aluno com exercícios, meta e o que foi feito da última vez. */
export async function workoutsOf(db: Db, studentId: string) {
  const ws = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.studentId, studentId), eq(workouts.archived, false)))
    .orderBy(asc(workouts.position), asc(workouts.createdAt));
  if (!ws.length) return [];
  const items = await db
    .select({ it: workoutItems, ex: exercises })
    .from(workoutItems)
    .innerJoin(exercises, eq(exercises.id, workoutItems.exerciseId))
    .where(inArray(workoutItems.workoutId, ws.map((w) => w.id)))
    .orderBy(asc(workoutItems.position));
  // última sessão concluída de cada ficha
  const lastSessions = await db
    .selectDistinctOn([trainingSessions.workoutId], { id: trainingSessions.id, workoutId: trainingSessions.workoutId, day: trainingSessions.day })
    .from(trainingSessions)
    .where(and(eq(trainingSessions.studentId, studentId), isNotNull(trainingSessions.finishedAt)))
    .orderBy(trainingSessions.workoutId, desc(trainingSessions.day));
  const lastIds = lastSessions.map((s) => s.id);
  const sets = lastIds.length ? await db.select().from(setLogs).where(inArray(setLogs.sessionId, lastIds)).orderBy(asc(setLogs.setNo)) : [];
  const fb = lastIds.length ? await db.select().from(itemFeedback).where(inArray(itemFeedback.sessionId, lastIds)) : [];

  return ws.map((w) => {
    const last = lastSessions.find((s) => s.workoutId === w.id) ?? null;
    return {
      id: w.id,
      name: w.name,
      lastDay: last?.day ?? null,
      items: items
        .filter((x) => x.it.workoutId === w.id)
        .map(({ it, ex }) => {
          const done = sets.filter((s) => s.itemId === it.id);
          const pse = fb.find((f) => f.itemId === it.id)?.pse ?? null;
          const target = num(it.targetKg);
          const best = done.reduce<number | null>((m, s) => (s.kg === null ? m : Math.max(m ?? 0, Number(s.kg))), null);
          const below = target !== null && done.some((s) => s.kg !== null && Number(s.kg) < target);
          const above = target !== null && best !== null && best > target;
          return {
            id: it.id,
            exerciseId: ex.id,
            name: ex.name,
            muscle: ex.muscle,
            videoUrl: ex.videoUrl,
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

export async function assessmentsOf(db: Db, studentId: string) {
  const rows = await db.select().from(assessments).where(eq(assessments.studentId, studentId)).orderBy(asc(assessments.day));
  return rows.map((a) => ({
    id: a.id,
    day: a.day,
    weightKg: Number(a.weightKg),
    heightCm: a.heightCm,
    bodyFatPct: num(a.bodyFatPct),
    measures: a.measures as Record<string, number>,
    notes: a.notes,
  }));
}

/** Garante a mensalidade do mês corrente de cada aluno ativo (idempotente). */
export async function ensureMonthPayments(db: Db, tenantId: string, now = new Date()) {
  const act = await db.select().from(students).where(and(eq(students.tenantId, tenantId), eq(students.status, 'ativo')));
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const rows = act
    .filter((s) => s.priceCents > 0)
    .map((s) => ({
      tenantId,
      studentId: s.id,
      period,
      dueDate: iso(new Date(now.getFullYear(), now.getMonth(), s.dueDay)),
      amountCents: s.planName === 'Trimestral' ? Math.round(s.priceCents / 3) : s.planName === 'Semestral' ? Math.round(s.priceCents / 6) : s.priceCents,
    }));
  if (rows.length) await db.insert(payments).values(rows).onConflictDoNothing();
}

export function payState(p: { status: string; dueDate: string } | undefined, now = today()) {
  if (!p) return { kind: 'ok', label: 'Sem cobrança' };
  if (p.status === 'pago') return { kind: 'ok', label: 'Em dia' };
  if (p.dueDate < now) return { kind: 'late', label: 'Atrasado' };
  return { kind: 'warn', label: `Vence ${p.dueDate.slice(8, 10)}/${p.dueDate.slice(5, 7)}` };
}

/** Painel "Hoje" do personal. */
export async function dashboard(db: Db, tenantId: string) {
  await ensureMonthPayments(db, tenantId);
  const t = today();
  const act = await db.select().from(students).where(and(eq(students.tenantId, tenantId), eq(students.status, 'ativo'))).orderBy(asc(students.name));
  const todayBookings = await db
    .select({ b: bookings, name: students.name })
    .from(bookings)
    .innerJoin(students, eq(students.id, bookings.studentId))
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.day, t), inArray(bookings.status, ['confirmado', 'pedido'])))
    .orderBy(asc(bookings.time));
  const requests = await db
    .select({ b: bookings, name: students.name })
    .from(bookings)
    .innerJoin(students, eq(students.id, bookings.studentId))
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.status, 'pedido'), gte(bookings.day, t)))
    .orderBy(asc(bookings.day), asc(bookings.time));
  const period = t.slice(0, 7);
  const pays = await db.select().from(payments).where(and(eq(payments.tenantId, tenantId), eq(payments.period, period)));
  const lastTrain = await db
    .select({ studentId: trainingSessions.studentId, day: sql<string>`max(${trainingSessions.day})` })
    .from(trainingSessions)
    .where(and(eq(trainingSessions.tenantId, tenantId), isNotNull(trainingSessions.finishedAt)))
    .groupBy(trainingSessions.studentId);

  const missing = act
    .map((s) => {
      const d = lastTrain.find((l) => l.studentId === s.id)?.day ?? null;
      const days = d ? Math.round((new Date(t).getTime() - new Date(d).getTime()) / 86_400_000) : null;
      return { id: s.id, name: s.name, phone: s.phone, days, never: d === null };
    })
    .filter((m) => m.days === null || m.days >= 7)
    .sort((a, b) => (b.days ?? 999) - (a.days ?? 999));

  // cargas fora da meta na última sessão de cada aluno
  const alerts: { studentId: string; name: string; exercise: string; verdict: string; detail: string }[] = [];
  for (const s of act) {
    const ws = await workoutsOf(db, s.id);
    for (const w of ws)
      for (const it of w.items)
        if (it.last && it.last.verdict !== 'na meta' && w.lastDay && w.lastDay >= iso(addDays(new Date(), -7))) {
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
      late: open.filter((p) => p.dueDate < t).length,
    },
    today: todayBookings.map((x) => ({ id: x.b.id, time: x.b.time, name: x.name, status: x.b.status })),
    requests: requests.map((x) => ({ id: x.b.id, day: x.b.day, time: x.b.time, name: x.name })),
    missing,
    alerts,
  };
}

export async function studentsList(db: Db, tenantId: string) {
  await ensureMonthPayments(db, tenantId);
  const t = today();
  const rows = await db.select().from(students).where(eq(students.tenantId, tenantId)).orderBy(asc(students.name));
  const pays = await db.select().from(payments).where(and(eq(payments.tenantId, tenantId), eq(payments.period, t.slice(0, 7))));
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
      pay: payState(p ? { status: p.status, dueDate: p.dueDate } : undefined, t),
    };
  });
}

export async function studentDetail(db: Db, id: string) {
  const [s] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (!s) return null;
  const pays = await db.select().from(payments).where(eq(payments.studentId, id)).orderBy(desc(payments.period)).limit(12);
  const [note] = await db.select().from(notes).where(eq(notes.studentId, id)).orderBy(desc(notes.createdAt)).limit(1);
  return {
    student: {
      id: s.id,
      name: s.name,
      phone: s.phone,
      goal: s.goal,
      sex: s.sex,
      birth: s.birth,
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
    payments: pays.map((p) => ({ id: p.id, period: p.period, dueDate: p.dueDate, amountCents: p.amountCents, status: p.status, paidAt: p.paidAt })),
    note: note ? { text: note.text, reaction: note.reaction, at: note.createdAt } : null,
  };
}

/** Semana da agenda (segunda a domingo) a partir de `start`. */
export async function agendaWeek(db: Db, tenantId: string, start: string) {
  const days = Array.from({ length: 7 }, (_, i) => iso(addDays(new Date(start + 'T12:00:00'), i)));
  const sl = await db.select().from(slots).where(eq(slots.tenantId, tenantId)).orderBy(asc(slots.weekday), asc(slots.time));
  const bk = await db
    .select({ b: bookings, name: students.name })
    .from(bookings)
    .innerJoin(students, eq(students.id, bookings.studentId))
    .where(and(eq(bookings.tenantId, tenantId), inArray(bookings.day, days), inArray(bookings.status, ['confirmado', 'pedido'])));
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
          bookings: bk.filter((x) => x.b.day === day && x.b.time === s.time).map((x) => ({ id: x.b.id, name: x.name, status: x.b.status })),
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

export async function todaySession(db: Db, studentId: string, workoutId: string) {
  const [s] = await db
    .select()
    .from(trainingSessions)
    .where(and(eq(trainingSessions.studentId, studentId), eq(trainingSessions.workoutId, workoutId), eq(trainingSessions.day, today())))
    .limit(1);
  if (!s) return { session: null, sets: [], feedback: [] };
  const sets = await db.select().from(setLogs).where(eq(setLogs.sessionId, s.id)).orderBy(asc(setLogs.setNo));
  const feedback = await db.select().from(itemFeedback).where(eq(itemFeedback.sessionId, s.id));
  return { session: s, sets, feedback };
}

export async function studentStreak(db: Db, studentId: string) {
  const rows = await db
    .selectDistinct({ day: trainingSessions.day })
    .from(trainingSessions)
    .where(and(eq(trainingSessions.studentId, studentId), isNotNull(trainingSessions.finishedAt)))
    .orderBy(desc(trainingSessions.day))
    .limit(60);
  return rows.map((r) => r.day);
}

/** Abre (se preciso) a sessão de hoje desse treino. */
export async function openSession(tx: Db, tenantId: string, studentId: string, workoutId: string) {
  const [w] = await tx.select().from(schema.workouts).where(eq(schema.workouts.id, workoutId)).limit(1);
  if (!w || w.archived) throw new ApiError(404, 'Treino não encontrado.');
  await tx.insert(schema.trainingSessions).values({ tenantId, studentId, workoutId, day: today() }).onConflictDoNothing();
  const [s] = await tx
    .select()
    .from(schema.trainingSessions)
    .where(and(eq(schema.trainingSessions.studentId, studentId), eq(schema.trainingSessions.workoutId, workoutId), eq(schema.trainingSessions.day, today())))
    .limit(1);
  return s;
}

