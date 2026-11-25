import 'server-only';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { audit } from './audit';
import type { Staff, Student, Tenant } from '@prisma/client';
import { systemDb } from './db';
import { env } from './env';
import { ApiError, ipOf } from './http';
import { LIMITS, limit } from './ratelimit';
import { accessOf } from './rules';
import { codeHash, maskPhone, newCode, newToken, sameHash, tokenHash } from './security';
import { sendWhatsApp } from './whatsapp';

const STAFF_COOKIE = 'kf_staff';
const DEVICE_COOKIE = 'kf_dev';
export const studentCookie = (slug: string) => `kf_a_${slug.replace(/[^a-z0-9-]/g, '')}`;

const DAY = 24 * 60 * 60 * 1000;
const secure = env.NODE_ENV === 'production';

async function setCookie(name: string, value: string, maxAgeSec: number) {
  (await cookies()).set(name, value, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: maxAgeSec });
}
async function clearCookie(name: string) {
  (await cookies()).set(name, '', { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0 });
}

// ───────── códigos de 6 números ─────────

type OtpSubject = { tenantId: string; subject: 'staff' | 'student'; subjectId: string; phone: string; isDemo: boolean };

/** Cria e manda um código. No studio de demonstração, o código volta na resposta (não tem WhatsApp). */
export async function sendOtp(s: OtpSubject, purpose: 'first' | 'reset' | 'device', ip: string, brandName: string) {
  await limit(`otp:phone:${s.phone}`, ...LIMITS.otpPhone, 'Já mandamos vários códigos para esse número. Espere uma hora e tente de novo.');
  await limit(`otp:ip:${ip}`, ...LIMITS.otpIp);
  const code = newCode();
  // um código novo cancela os anteriores do mesmo tipo
  await systemDb.otpCode.updateMany({ where: { subjectId: s.subjectId, purpose, usedAt: null }, data: { usedAt: new Date() } });
  await systemDb.otpCode.create({
    data: {
      tenantId: s.tenantId,
      subject: s.subject,
      subjectId: s.subjectId,
      purpose,
      codeHash: codeHash(code, s.subjectId),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  const intro = purpose === 'device' ? 'Alguém está entrando na sua conta KFit num aparelho novo. ' : '';
  const text = `${brandName}: ${intro}seu código é ${code.slice(0, 3)} ${code.slice(3)}. Vale por 10 minutos. Não passe para ninguém.`;
  const showOnScreen = s.isDemo || env.OTP_DEBUG;
  if (!showOnScreen) {
    const sent = await sendWhatsApp(s.phone, text);
    if (!sent) throw new ApiError(503, 'Não conseguimos mandar o código pelo WhatsApp agora. Tente de novo em instantes.');
  }
  return { phoneMask: maskPhone(s.phone), ...(showOnScreen ? { demoCode: code, demoText: text } : {}) };
}

/** Confere o código. Acertou: devolve um ticket de uso único (15 min) para o próximo passo. */
export async function checkOtp(subjectId: string, purpose: string, code: string) {
  const row = await systemDb.otpCode.findFirst({
    where: { subjectId, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!row) throw new ApiError(400, 'Esse código não vale mais. Peça um novo.');
  if (!sameHash(row.codeHash, codeHash(code, subjectId))) {
    const attempts = row.attempts + 1;
    await systemDb.otpCode.update({ where: { id: row.id }, data: { attempts, ...(attempts >= 5 ? { usedAt: new Date() } : {}) } });
    if (attempts >= 5) throw new ApiError(400, 'Código errado 5 vezes. Por segurança, ele foi cancelado. Peça um novo.');
    throw new ApiError(400, `Código errado. Restam ${5 - attempts} tentativas.`);
  }
  const ticket = newToken();
  await systemDb.otpCode.update({ where: { id: row.id }, data: { usedAt: new Date(), ticketHash: tokenHash(ticket) } });
  return ticket;
}

/** Gasta o ticket (uso único, até 15 min depois do código). */
export async function useTicket(subjectId: string, ticket: string) {
  const row = await systemDb.otpCode.findFirst({
    where: { subjectId, ticketHash: tokenHash(ticket), usedAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } },
  });
  // uso único: só um pedido consegue apagar o ticket
  const used = row ? await systemDb.otpCode.updateMany({ where: { id: row.id, ticketHash: row.ticketHash }, data: { ticketHash: null } }) : { count: 0 };
  if (!row || used.count !== 1) throw new ApiError(400, 'Esse passo expirou. Comece de novo.');
  return row.purpose;
}

// ───────── sessões ─────────

export async function startStaffSession(st: { id: string; tenantId: string }, deviceId: string | null, pinOk: boolean) {
  const token = newToken();
  await systemDb.session.create({
    data: {
      tenantId: st.tenantId,
      kind: 'staff',
      staffId: st.id,
      deviceId,
      tokenHash: tokenHash(token),
      pinOkAt: pinOk ? new Date() : null,
      expiresAt: new Date(Date.now() + 30 * DAY),
    },
  });
  await setCookie(STAFF_COOKIE, token, 30 * 24 * 3600);
}

export async function startStudentSession(slug: string, st: { id: string; tenantId: string }) {
  const token = newToken();
  await systemDb.session.create({
    data: { tenantId: st.tenantId, kind: 'student', studentId: st.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 90 * DAY) },
  });
  await systemDb.student.update({ where: { id: st.id }, data: { lastAccessAt: new Date(), failedLogins: 0, lockedUntil: null } });
  await setCookie(studentCookie(slug), token, 90 * 24 * 3600);
}

/** Aparelho confiável do personal (cookie de 1 ano). Num aparelho novo, o login pede código. */
export async function trustedDevice(staffId: string) {
  const t = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!t) return null;
  return systemDb.device.findFirst({ where: { tokenHash: tokenHash(t), staffId } });
}

export async function trustNewDevice(st: { id: string; tenantId: string }, req: NextRequest) {
  const token = newToken();
  const label = deviceLabel(req.headers.get('user-agent') ?? '');
  const d = await systemDb.device.create({ data: { tenantId: st.tenantId, staffId: st.id, tokenHash: tokenHash(token), label, lastIp: ipOf(req) } });
  await setCookie(DEVICE_COOKIE, token, 365 * 24 * 3600);
  return d;
}

function deviceLabel(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'Aparelho';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : '';
  return br ? `${os} · ${br}` : os;
}

export type StaffCtx = {
  sessionId: string;
  staff: Staff;
  tenant: Tenant;
  deviceId: string | null;
};

/**
 * Exige personal logado e com o app desbloqueado (PIN).
 * 401 = precisa entrar · 423 = precisa do PIN (ou criar o PIN).
 */
export async function requireStaff(req: NextRequest, opts: { allowLocked?: boolean } = {}): Promise<StaffCtx> {
  const t = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!t) throw new ApiError(401, 'Entre na sua conta.');
  const s = await systemDb.session.findFirst({
    where: { tokenHash: tokenHash(t), kind: 'staff', revokedAt: null, expiresAt: { gt: new Date() } },
    include: { staff: true, tenant: true },
  });
  const row = s && s.staff ? { s, st: s.staff, tn: s.tenant } : null;
  if (!row) {
    await clearCookie(STAFF_COOKIE);
    throw new ApiError(401, 'Sua sessão terminou. Entre de novo.');
  }
  if (accessOf(row.tn) === 'blocked') throw new ApiError(403, 'Conta suspensa. Fale com a TresK Tecnologia.');

  const now = Date.now();
  const idleMs = now - row.s.lastSeenAt.getTime();
  const lockMs = Math.max(1, row.st.lockAfterMin) * 60 * 1000;
  const locked = !row.st.pinHash ? 'pin_create' : !row.s.pinOkAt || idleMs > lockMs ? 'pin' : null;

  if (locked && !opts.allowLocked) {
    if (locked === 'pin' && row.s.pinOkAt) await systemDb.session.update({ where: { id: row.s.id }, data: { pinOkAt: null } });
    throw new ApiError(423, locked === 'pin' ? 'App bloqueado. Digite seu PIN.' : 'Crie o PIN do app.', { need: locked, name: row.st.name });
  }
  if (!locked && idleMs > 20_000) {
    await systemDb.session.update({ where: { id: row.s.id }, data: { lastSeenAt: new Date() } });
  }
  if (row.s.deviceId && idleMs > 60_000) {
    await systemDb.device.updateMany({ where: { id: row.s.deviceId }, data: { lastSeenAt: new Date(), lastIp: ipOf(req) } });
  }
  return { sessionId: row.s.id, staff: row.st, tenant: row.tn, deviceId: row.s.deviceId };
}

export async function unlockWithPin(req: NextRequest, pin: string, checkPin: (pin: string, hash: string) => Promise<boolean>) {
  const ctx = await requireStaff(req, { allowLocked: true });
  if (!ctx.staff.pinHash) throw new ApiError(400, 'Crie o PIN primeiro.');
  await limit(`pin:${ctx.sessionId}`, 10, 60);
  const okPin = await checkPin(pin, ctx.staff.pinHash);
  if (okPin) {
    await systemDb.session.update({ where: { id: ctx.sessionId }, data: { pinOkAt: new Date(), pinFails: 0, lastSeenAt: new Date() } });
    return ctx;
  }
  const s = await systemDb.session.update({ where: { id: ctx.sessionId }, data: { pinFails: { increment: 1 } }, select: { pinFails: true } });
  const fails = s.pinFails;
  if (fails >= 3) {
    await systemDb.session.update({ where: { id: ctx.sessionId }, data: { revokedAt: new Date() } });
    await audit({ tenantId: ctx.tenant.id, actorKind: 'staff', actorId: ctx.staff.id, action: 'pin_errado_3x', ip: ipOf(req) });
    await clearCookie(STAFF_COOKIE);
    throw new ApiError(401, 'PIN errado 3 vezes. Por segurança, entre com a senha.');
  }
  throw new ApiError(400, `PIN errado. Restam ${3 - fails} tentativas.`);
}

export async function lockStaff(req: NextRequest) {
  const ctx = await requireStaff(req, { allowLocked: true });
  await systemDb.session.update({ where: { id: ctx.sessionId }, data: { pinOkAt: null } });
}

export async function logoutStaff() {
  const t = (await cookies()).get(STAFF_COOKIE)?.value;
  if (t) await systemDb.session.updateMany({ where: { tokenHash: tokenHash(t) }, data: { revokedAt: new Date() } });
  await clearCookie(STAFF_COOKIE);
}

export type StudentCtx = { sessionId: string; student: Student; tenant: Tenant };

/** Exige aluno logado neste studio, com acesso liberado pelo personal. */
export async function requireStudent(slug: string): Promise<StudentCtx> {
  const t = (await cookies()).get(studentCookie(slug))?.value;
  if (!t) throw new ApiError(401, 'Entre no app.');
  const s = await systemDb.session.findFirst({
    where: { tokenHash: tokenHash(t), kind: 'student', revokedAt: null, expiresAt: { gt: new Date() } },
    include: { student: true, tenant: true },
  });
  const row = s && s.student ? { s, st: s.student, tn: s.tenant } : null;
  if (!row || row.tn.slug !== slug) {
    await clearCookie(studentCookie(slug));
    throw new ApiError(401, 'Sua sessão terminou. Entre de novo.');
  }
  if (row.st.accessStatus === 'pausado' || row.st.status !== 'ativo') {
    await systemDb.session.update({ where: { id: row.s.id }, data: { revokedAt: new Date() } });
    await clearCookie(studentCookie(slug));
    throw new ApiError(403, 'Seu acesso está pausado pelo personal. Fale com ele para liberar.');
  }
  if (accessOf(row.tn) === 'blocked') throw new ApiError(403, 'O app deste studio está suspenso no momento.');
  if (Date.now() - row.s.lastSeenAt.getTime() > 5 * 60_000) {
    await systemDb.session.update({ where: { id: row.s.id }, data: { lastSeenAt: new Date() } });
    await systemDb.student.update({ where: { id: row.st.id }, data: { lastAccessAt: new Date() } });
  }
  return { sessionId: row.s.id, student: row.st, tenant: row.tn };
}

export async function logoutStudent(slug: string) {
  const t = (await cookies()).get(studentCookie(slug))?.value;
  if (t) await systemDb.session.updateMany({ where: { tokenHash: tokenHash(t) }, data: { revokedAt: new Date() } });
  await clearCookie(studentCookie(slug));
}

/** Derruba todas as sessões de um aluno (pausar acesso, zerar senha). */
export async function revokeStudentSessions(studentId: string) {
  await systemDb.session.updateMany({ where: { studentId, revokedAt: null }, data: { revokedAt: new Date() } });
}
