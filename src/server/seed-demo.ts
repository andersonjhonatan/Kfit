/**
 * Studio de demonstração ("studio-demo") e biblioteca de exercícios do KFit.
 * Pode rodar quantas vezes quiser: apaga o studio de demonstração e cria de novo.
 * Usado por `pnpm db:seed` e pela rotina que limpa a demonstração todo dia.
 */
import bcrypt from 'bcryptjs';
import { eq, isNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './db/schema';

type Db = NodePgDatabase<typeof schema>;

export const DEMO_SLUG = 'studio-demo';
export const DEMO_STAFF_PHONE = '87999001234';
export const DEMO_STAFF_PASSWORD = 'kfit123';

const LIBRARY: [string, string][] = [
  ['Agachamento livre', 'Pernas'], ['Leg press 45°', 'Pernas'], ['Cadeira extensora', 'Pernas'], ['Mesa flexora', 'Pernas'],
  ['Stiff com halteres', 'Pernas'], ['Afundo com halteres', 'Pernas'], ['Agachamento búlgaro', 'Pernas'], ['Panturrilha em pé', 'Pernas'],
  ['Elevação pélvica', 'Glúteos'], ['Abdução na máquina', 'Glúteos'], ['Coice no cabo', 'Glúteos'], ['Levantamento terra', 'Costas'],
  ['Puxada frontal', 'Costas'], ['Remada baixa', 'Costas'], ['Remada curvada', 'Costas'], ['Barra fixa pronada', 'Costas'],
  ['Pulldown na corda', 'Costas'], ['Supino reto', 'Peito'], ['Supino inclinado com halteres', 'Peito'], ['Crucifixo na máquina', 'Peito'],
  ['Flexão de braço', 'Peito'], ['Crossover', 'Peito'], ['Desenvolvimento com halteres', 'Ombros'], ['Elevação lateral', 'Ombros'],
  ['Elevação frontal', 'Ombros'], ['Face pull', 'Ombros'], ['Rosca direta', 'Braços'], ['Rosca martelo', 'Braços'],
  ['Tríceps na polia', 'Braços'], ['Tríceps francês', 'Braços'], ['Mergulho no banco', 'Braços'], ['Prancha', 'Core'],
  ['Abdominal supra', 'Core'], ['Abdominal infra', 'Core'], ['Dead bug', 'Core'], ['Pallof press', 'Core'],
  ['Kettlebell swing', 'Funcional'], ['Burpee', 'Funcional'], ['Thruster', 'Funcional'], ['Wall ball', 'Funcional'],
  ['Corda naval', 'Funcional'], ['Box jump', 'Funcional'], ['Farmer walk', 'Funcional'], ['Bike ergométrica', 'Cardio'],
  ['Esteira', 'Cardio'], ['Remo ergômetro', 'Cardio'], ['Pular corda', 'Cardio'], ['Mobilidade de quadril', 'Mobilidade'],
  ['Mobilidade torácica', 'Mobilidade'], ['Alongamento de posteriores', 'Mobilidade'],
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

export async function ensureLibrary(db: Db) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.exercises).where(isNull(schema.exercises.tenantId));
  if (n > 0) return;
  await db.insert(schema.exercises).values(LIBRARY.map(([name, muscle]) => ({ name, muscle })));
}

export async function seedDemo(db: Db, now = new Date()) {
  await ensureLibrary(db);
  await db.delete(schema.tenants).where(eq(schema.tenants.slug, DEMO_SLUG));
  await db.delete(schema.rateLimits).where(sql`${schema.rateLimits.key} like ${'%' + DEMO_STAFF_PHONE + '%'}`);

  const lib = new Map((await db.select().from(schema.exercises).where(isNull(schema.exercises.tenantId))).map((e) => [e.name, e.id]));
  const ex = (name: string) => {
    const id = lib.get(name);
    if (!id) throw new Error(`exercício não encontrado: ${name}`);
    return id;
  };

  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      slug: DEMO_SLUG,
      name: 'Lucas Martins Personal',
      tagline: 'Funcional e musculação',
      brandColor: '#2563EB',
      brandMono: 'LM',
      brandShape: 'round',
      plan: 'pro',
      status: 'active',
      isDemo: true,
      pixKey: 'lucas@studio.com.br',
    })
    .returning();
  const T = tenant.id;

  await db.insert(schema.staff).values({
    tenantId: T,
    name: 'Lucas Martins',
    phone: DEMO_STAFF_PHONE,
    passwordHash: await bcrypt.hash(DEMO_STAFF_PASSWORD, 11),
  });

  const studentRows = [
    { name: 'Ana Clara', phone: '87998124410', goal: 'Emagrecimento', sex: 'F', heightCm: 165, days: 'Seg, Ter, Qua, Sex', planName: 'Mensal', priceCents: 18000, dueDay: 5, access: 'pendente', pass: null },
    { name: 'Bruno Lima', phone: '87996550231', goal: 'Hipertrofia', sex: 'M', heightCm: 178, days: 'Seg, Ter, Qua, Qui, Sex', planName: 'Mensal', priceCents: 18000, dueDay: 25, access: 'ativo', pass: 'bruno123' },
    { name: 'Carla Souza', phone: '87997401188', goal: 'Condicionamento', sex: 'F', heightCm: 160, days: 'Seg, Qua, Sex', planName: 'Trimestral', priceCents: 48000, dueDay: 10, access: 'ativo', pass: 'carla123' },
    { name: 'Diego Alves', phone: '87999035512', goal: 'Hipertrofia', sex: 'M', heightCm: 182, days: 'Seg, Ter, Qui, Sex', planName: 'Mensal', priceCents: 18000, dueDay: 5, access: 'ativo', pass: 'diego123' },
    { name: 'Elaine Rocha', phone: '87996117720', goal: 'Saúde e postura', sex: 'F', heightCm: 158, days: 'Ter, Qui', planName: 'Mensal', priceCents: 18000, dueDay: 28, access: 'pendente', pass: null },
    { name: 'Felipe Nunes', phone: '87998773049', goal: 'Emagrecimento', sex: 'M', heightCm: 175, days: 'Seg, Qua, Sex', planName: 'Semestral', priceCents: 90000, dueDay: 15, access: 'ativo', pass: 'felipe123' },
  ];
  const studs = await db
    .insert(schema.students)
    .values(
      await Promise.all(
        studentRows.map(async (s) => ({
          tenantId: T,
          name: s.name,
          phone: s.phone,
          goal: s.goal,
          sex: s.sex,
          heightCm: s.heightCm,
          days: s.days,
          planName: s.planName,
          priceCents: s.priceCents,
          dueDay: s.dueDay,
          accessStatus: s.access,
          passwordHash: s.pass ? await bcrypt.hash(s.pass, 11) : null,
          passwordSetAt: s.pass ? addDays(now, -60) : null,
          lastAccessAt: s.pass ? addDays(now, s.name.startsWith('Diego') ? -9 : -1) : null,
        })),
      ),
    )
    .returning();
  const S = (first: string) => studs.find((s) => s.name.startsWith(first))!;

  // fichas: [aluno, nome, [exercício, séries, reps, kg, descanso]]
  const plans: [string, string, [string, number, string, number | null, number][]][] = [
    ['Ana', 'Treino A · Inferiores', [['Agachamento livre', 4, '10', 60, 90], ['Leg press 45°', 4, '12', 140, 90], ['Cadeira extensora', 3, '15', 35, 60], ['Stiff com halteres', 3, '12', 14, 60], ['Elevação pélvica', 4, '12', 50, 60], ['Panturrilha em pé', 4, '20', 40, 45]]],
    ['Ana', 'Treino B · Superiores', [['Puxada frontal', 4, '12', 35, 60], ['Supino inclinado com halteres', 3, '12', 10, 60], ['Remada baixa', 3, '12', 30, 60], ['Elevação lateral', 3, '15', 4, 45], ['Prancha', 3, '40s', null, 30]]],
    ['Bruno', 'Treino C · Costas e bíceps', [['Barra fixa pronada', 4, '8', null, 90], ['Remada curvada', 4, '10', 60, 90], ['Puxada frontal', 3, '12', 65, 60], ['Pulldown na corda', 3, '12', 30, 60], ['Rosca direta', 4, '10', 30, 60], ['Rosca martelo', 3, '12', 14, 45]]],
    ['Bruno', 'Treino A · Peito e tríceps', [['Supino reto', 4, '8', 80, 120], ['Supino inclinado com halteres', 4, '10', 28, 90], ['Crossover', 3, '12', 20, 60], ['Tríceps na polia', 4, '12', 35, 60]]],
    ['Carla', 'Funcional · Circuito', [['Kettlebell swing', 4, '15', 16, 45], ['Burpee', 4, '10', null, 45], ['Agachamento búlgaro', 3, '10', 8, 60], ['Corda naval', 4, '30s', null, 45], ['Prancha', 3, '45s', null, 30]]],
    ['Diego', 'Treino A · Peito', [['Supino reto', 4, '10', 70, 90], ['Crucifixo na máquina', 3, '12', 45, 60], ['Flexão de braço', 3, '15', null, 45], ['Tríceps francês', 3, '12', 12, 60]]],
    ['Elaine', 'Mobilidade e postura', [['Mobilidade torácica', 3, '10', null, 30], ['Mobilidade de quadril', 3, '10', null, 30], ['Dead bug', 3, '12', null, 30], ['Face pull', 3, '15', 10, 45], ['Alongamento de posteriores', 3, '30s', null, 30]]],
    ['Felipe', 'Treino B · Superiores', [['Supino reto', 4, '12', 50, 60], ['Puxada frontal', 4, '12', 50, 60], ['Desenvolvimento com halteres', 3, '12', 14, 60], ['Rosca direta', 3, '12', 20, 45], ['Tríceps na polia', 3, '12', 25, 45], ['Esteira', 1, '20min', null, 0]]],
  ];
  const itemsByWorkout = new Map<string, { id: string; sets: number; reps: string; targetKg: number | null }[]>();
  let pos = 0;
  for (const [who, name, items] of plans) {
    const st = S(who);
    const [w] = await db.insert(schema.workouts).values({ tenantId: T, studentId: st.id, name, position: pos++ }).returning();
    const rows = await db
      .insert(schema.workoutItems)
      .values(
        items.map(([exName, sets, reps, kg, rest], i) => ({
          tenantId: T,
          studentId: st.id,
          workoutId: w.id,
          exerciseId: ex(exName),
          position: i,
          sets,
          reps,
          targetKg: kg === null ? null : String(kg),
          restSec: rest,
        })),
      )
      .returning();
    itemsByWorkout.set(w.id, rows.map((r) => ({ id: r.id, sets: r.sets, reps: r.reps, targetKg: r.targetKg === null ? null : Number(r.targetKg) })));
  }

  // histórico de treinos das últimas 3 semanas (Diego some há 9 dias, Elaine nunca entrou)
  const workoutsAll = await db.select().from(schema.workouts).where(eq(schema.workouts.tenantId, T));
  for (const w of workoutsAll) {
    const st = studs.find((s) => s.id === w.studentId)!;
    if (st.accessStatus !== 'ativo') continue;
    const items = itemsByWorkout.get(w.id)!;
    const back = st.name.startsWith('Diego') ? [10, 13, 17] : [2, 5, 9, 12, 16];
    for (const daysAgo of back) {
      const [ts] = await db
        .insert(schema.trainingSessions)
        .values({ tenantId: T, studentId: st.id, workoutId: w.id, day: iso(addDays(now, -daysAgo)), finishedAt: addDays(now, -daysAgo) })
        .returning();
      const sets: (typeof schema.setLogs.$inferInsert)[] = [];
      items.forEach((it, idx) => {
        const reps = parseInt(it.reps, 10) || null;
        for (let n = 1; n <= it.sets; n++) {
          let kg = it.targetKg;
          // Bruno: na última vez a carga caiu na 2ª série da remada
          if (kg !== null && st.name.startsWith('Bruno') && daysAgo === 2 && idx === 1 && n >= 2) kg = kg - 5;
          sets.push({ tenantId: T, studentId: st.id, sessionId: ts.id, itemId: it.id, setNo: n, kg: kg === null ? null : String(kg), reps });
        }
      });
      await db.insert(schema.setLogs).values(sets);
      await db.insert(schema.itemFeedback).values(
        items.map((it, idx) => ({ tenantId: T, studentId: st.id, sessionId: ts.id, itemId: it.id, pse: st.name.startsWith('Bruno') && idx === 1 && daysAgo === 2 ? 10 : 6 + (idx % 3) })),
      );
    }
  }

  // avaliações: 3 por aluno, a cada ~6 semanas
  const evo: Record<string, [number, number][]> = {
    Ana: [[84.2, 34.5], [81.6, 32.1], [79.1, 30.2]],
    Bruno: [[74.0, 16.2], [75.3, 15.4], [76.8, 14.8]],
    Carla: [[63.5, 27.0], [62.8, 26.1], [62.1, 25.3]],
    Diego: [[80.2, 18.1], [81.0, 17.6]],
    Felipe: [[96.4, 29.8], [93.1, 28.0], [90.7, 26.5]],
  };
  for (const [who, list] of Object.entries(evo)) {
    const st = S(who);
    await db.insert(schema.assessments).values(
      list.map(([w, bf], i) => ({
        tenantId: T,
        studentId: st.id,
        day: iso(addDays(now, -(list.length - 1 - i) * 42 - 14)),
        weightKg: String(w),
        heightCm: st.heightCm,
        bodyFatPct: String(bf),
        measures: { cintura: Math.round(w * 0.95 * 10) / 10, quadril: Math.round(w * 1.2 * 10) / 10, braco: Math.round(w * 0.38 * 10) / 10, coxa: Math.round(w * 0.68 * 10) / 10 },
      })),
    );
  }

  // mensalidades dos últimos 3 meses
  for (const st of studs) {
    for (let m = 2; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, st.dueDay);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const late = st.name.startsWith('Diego') && m === 0;
      const open = m === 0 && (late || d > now);
      await db.insert(schema.payments).values({
        tenantId: T,
        studentId: st.id,
        period,
        dueDate: iso(d),
        amountCents: st.planName === 'Mensal' ? st.priceCents : Math.round(st.priceCents / (st.planName === 'Trimestral' ? 3 : 6)),
        status: open ? 'aberto' : 'pago',
        paidAt: open ? null : addDays(d, -1),
      });
    }
  }

  // agenda: seg a sáb, manhã e fim de tarde
  const times = ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00'];
  const slotRows: (typeof schema.slots.$inferInsert)[] = [];
  for (let wd = 1; wd <= 6; wd++) for (const t of times) if (!(wd === 6 && t >= '16:00')) slotRows.push({ tenantId: T, weekday: wd, time: t, capacity: 1 });
  await db.insert(schema.slots).values(slotRows);
  const booked: [string, number, string, string][] = [
    ['Carla', 0, '06:00', 'confirmado'], ['Ana', 0, '07:00', 'confirmado'], ['Felipe', 0, '08:00', 'confirmado'], ['Diego', 0, '17:00', 'confirmado'],
    ['Bruno', 0, '18:00', 'confirmado'], ['Bruno', 1, '18:00', 'pedido'], ['Ana', 1, '07:00', 'confirmado'],
  ];
  await db.insert(schema.bookings).values(booked.map(([who, d, time, status]) => ({ tenantId: T, studentId: S(who).id, day: iso(addDays(now, d)), time, status })));

  await db.insert(schema.notes).values({
    tenantId: T,
    studentId: S('Ana').id,
    text: 'Ana, hoje é dia de perna! A meta é 4 × 10 com 60 kg no agachamento: desce devagar e respira. Se não der, anota o que pegou que eu ajusto. 💪',
  });

  return { tenantId: T, slug: DEMO_SLUG };
}
