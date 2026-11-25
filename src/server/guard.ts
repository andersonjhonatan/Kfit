import 'server-only';
import type { NextRequest } from 'next/server';
import { requireStaff, requireStudent, type StaffCtx, type StudentCtx } from './auth';
import { type Db, withScope } from './db';
import { LIMITS, limit } from './ratelimit';
import { assertCanWrite } from './rules';

/** Personal lendo: precisa estar logado e com o app desbloqueado. */
export async function staffRead(req: NextRequest) {
  const c = await requireStaff(req);
  return { c, db: <T>(fn: (db: Db) => Promise<T>) => withScope({ tenantId: c.tenant.id }, fn) };
}

/** Personal alterando: além disso, o plano precisa estar em dia e há limite de escrita. */
export async function staffWrite(req: NextRequest) {
  const r = await staffRead(req);
  assertCanWrite(r.c.tenant);
  await limit(`w:${r.c.sessionId}`, ...LIMITS.writesMinute);
  return r;
}

/** Aluno: tudo dentro da trava do próprio aluno. */
export async function studentRead(slug: string) {
  const c = await requireStudent(slug);
  return { c, db: <T>(fn: (db: Db) => Promise<T>) => withScope({ tenantId: c.tenant.id, studentId: c.student.id }, fn) };
}

export async function studentWrite(slug: string) {
  const r = await studentRead(slug);
  assertCanWrite(r.c.tenant);
  await limit(`w:${r.c.sessionId}`, ...LIMITS.writesMinute);
  return r;
}

export type { StaffCtx, StudentCtx };
