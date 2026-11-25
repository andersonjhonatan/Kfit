/**
 * Banco do KFit. Toda tabela de negócio tem `tenant_id` (o studio) e fica travada por
 * Row Level Security (ver drizzle/0001_seguranca.sql). Tabelas com `student_id` também
 * travam por aluno quando a requisição é do app do aluno.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const id = () => uuid('id').primaryKey().default(sql`gen_random_uuid()`);
const tenantId = () => uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' });
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

// ───────── studio (tenant) ─────────
export const tenants = pgTable('tenants', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull().default(''),
  brandColor: text('brand_color').notNull().default('#2563EB'),
  brandMono: text('brand_mono').notNull().default('KF'),
  brandShape: text('brand_shape').notNull().default('round'),
  /** solo | pro | studio — o que o plano libera é decidido no servidor (server/rules.ts) */
  plan: text('plan').notNull().default('pro'),
  /** trial | active | past_due | blocked */
  status: text('status').notNull().default('trial'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  paidUntil: timestamp('paid_until', { withTimezone: true }),
  isDemo: boolean('is_demo').notNull().default(false),
  pixKey: text('pix_key').notNull().default(''),
  createdAt: createdAt(),
});

// ───────── personal (equipe do studio) ─────────
export const staff = pgTable('staff', {
  id: id(),
  tenantId: tenantId(),
  name: text('name').notNull(),
  /** só dígitos, com DDD (ex.: 87999001234). Login do personal. */
  phone: text('phone').notNull().unique(),
  role: text('role').notNull().default('owner'),
  passwordHash: text('password_hash').notNull(),
  pinHash: text('pin_hash'),
  /** minutos parado até o app pedir o PIN de novo (0 = sempre que abrir) */
  lockAfterMin: smallint('lock_after_min').notNull().default(1),
  bioEnabled: boolean('bio_enabled').notNull().default(true),
  alertNewDevice: boolean('alert_new_device').notNull().default(true),
  failedLogins: smallint('failed_logins').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: createdAt(),
});

// ───────── alunos ─────────
export const students = pgTable(
  'students',
  {
    id: id(),
    tenantId: tenantId(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    goal: text('goal').notNull().default(''),
    sex: text('sex').notNull().default(''),
    birth: date('birth'),
    heightCm: smallint('height_cm'),
    days: text('days').notNull().default(''),
    planName: text('plan_name').notNull().default('Mensal'),
    priceCents: integer('price_cents').notNull().default(0),
    dueDay: smallint('due_day').notNull().default(10),
    /** ativo | inativo */
    status: text('status').notNull().default('ativo'),
    /** pendente (nunca entrou) | ativo | pausado (o personal bloqueou) */
    accessStatus: text('access_status').notNull().default('pendente'),
    passwordHash: text('password_hash'),
    passwordSetAt: timestamp('password_set_at', { withTimezone: true }),
    failedLogins: smallint('failed_logins').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastAccessAt: timestamp('last_access_at', { withTimezone: true }),
    water: smallint('water').notNull().default(0),
    waterDay: date('water_day'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('students_tenant_phone').on(t.tenantId, t.phone)],
);

// ───────── sessões, aparelhos, códigos (só o servidor mexe) ─────────
export const devices = pgTable('devices', {
  id: id(),
  tenantId: tenantId(),
  staffId: uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  label: text('label').notNull().default(''),
  lastIp: text('last_ip').notNull().default(''),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: id(),
    tenantId: tenantId(),
    /** staff | student */
    kind: text('kind').notNull(),
    staffId: uuid('staff_id').references(() => staff.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    /** quando o PIN foi confirmado (personal). null = precisa do PIN */
    pinOkAt: timestamp('pin_ok_at', { withTimezone: true }),
    pinFails: smallint('pin_fails').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('sessions_staff').on(t.staffId), index('sessions_student').on(t.studentId)],
);

export const otpCodes = pgTable(
  'otp_codes',
  {
    id: id(),
    tenantId: tenantId(),
    /** staff | student */
    subject: text('subject').notNull(),
    subjectId: uuid('subject_id').notNull(),
    /** first | reset | device */
    purpose: text('purpose').notNull(),
    codeHash: text('code_hash').notNull(),
    attempts: smallint('attempts').notNull().default(0),
    /** depois de acertar o código, vira um "ticket" para criar a senha */
    ticketHash: text('ticket_hash'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('otp_subject').on(t.subjectId, t.purpose)],
);

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull(),
});

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: id(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    actorKind: text('actor_kind').notNull(),
    actorId: uuid('actor_id'),
    action: text('action').notNull(),
    meta: jsonb('meta').notNull().default({}),
    ip: text('ip').notNull().default(''),
    createdAt: createdAt(),
  },
  (t) => [index('audit_tenant').on(t.tenantId, t.createdAt)],
);

// ───────── treino ─────────
/** Biblioteca: tenant_id nulo = exercício do KFit, visível para todos os studios. */
export const exercises = pgTable('exercises', {
  id: id(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  muscle: text('muscle').notNull(),
  videoUrl: text('video_url').notNull().default(''),
  createdAt: createdAt(),
});

export const workouts = pgTable(
  'workouts',
  {
    id: id(),
    tenantId: tenantId(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: smallint('position').notNull().default(0),
    archived: boolean('archived').notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('workouts_student').on(t.studentId)],
);

export const workoutItems = pgTable('workout_items', {
  id: id(),
  tenantId: tenantId(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id),
  position: smallint('position').notNull().default(0),
  sets: smallint('sets').notNull().default(3),
  reps: text('reps').notNull().default('10'),
  targetKg: numeric('target_kg', { precision: 6, scale: 1 }),
  restSec: smallint('rest_sec').notNull().default(60),
  notes: text('notes').notNull().default(''),
});

export const trainingSessions = pgTable(
  'training_sessions',
  {
    id: id(),
    tenantId: tenantId(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
    day: date('day').notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('training_once_per_day').on(t.studentId, t.workoutId, t.day)],
);

export const setLogs = pgTable(
  'set_logs',
  {
    id: id(),
    tenantId: tenantId(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').notNull().references(() => trainingSessions.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull().references(() => workoutItems.id, { onDelete: 'cascade' }),
    setNo: smallint('set_no').notNull(),
    kg: numeric('kg', { precision: 6, scale: 1 }),
    reps: smallint('reps'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('set_once').on(t.sessionId, t.itemId, t.setNo)],
);

/** Como foi o exercício: o aluno escolhe uma palavra, o personal vê o PSE (escala de Borg CR-10). */
export const itemFeedback = pgTable(
  'item_feedback',
  {
    id: id(),
    tenantId: tenantId(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').notNull().references(() => trainingSessions.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull().references(() => workoutItems.id, { onDelete: 'cascade' }),
    pse: smallint('pse').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('feedback_once').on(t.sessionId, t.itemId)],
);

// ───────── avaliação, financeiro, agenda, recados ─────────
export const assessments = pgTable('assessments', {
  id: id(),
  tenantId: tenantId(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  day: date('day').notNull(),
  weightKg: numeric('weight_kg', { precision: 5, scale: 1 }).notNull(),
  heightCm: smallint('height_cm'),
  bodyFatPct: numeric('body_fat_pct', { precision: 4, scale: 1 }),
  /** perímetros em cm: { cintura, quadril, braco_d, coxa_d, ... } */
  measures: jsonb('measures').notNull().default({}),
  notes: text('notes').notNull().default(''),
  createdAt: createdAt(),
});

export const payments = pgTable(
  'payments',
  {
    id: id(),
    tenantId: tenantId(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    /** mês de referência, ex.: 2026-11 */
    period: text('period').notNull(),
    dueDate: date('due_date').notNull(),
    amountCents: integer('amount_cents').notNull(),
    /** aberto | pago */
    status: text('status').notNull().default('aberto'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('payment_once').on(t.studentId, t.period)],
);

export const slots = pgTable('slots', {
  id: id(),
  tenantId: tenantId(),
  /** 0 = domingo … 6 = sábado */
  weekday: smallint('weekday').notNull(),
  time: text('time').notNull(),
  capacity: smallint('capacity').notNull().default(1),
});

export const bookings = pgTable(
  'bookings',
  {
    id: id(),
    tenantId: tenantId(),
    studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    day: date('day').notNull(),
    time: text('time').notNull(),
    /** pedido | confirmado | cancelado */
    status: text('status').notNull().default('pedido'),
    createdAt: createdAt(),
  },
  (t) => [index('bookings_day').on(t.tenantId, t.day)],
);

export const notes = pgTable('coach_notes', {
  id: id(),
  tenantId: tenantId(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  reaction: text('reaction'),
  createdAt: createdAt(),
});
