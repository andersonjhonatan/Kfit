import 'server-only';
import { sql } from 'drizzle-orm';
import { systemDb } from './db';
import { ApiError } from './http';

/**
 * Passo 4 dos 5: LIMITE DE USO.
 * Contador por janela, guardado no próprio Postgres (funciona com várias instâncias na Vercel).
 */
export async function hit(key: string, max: number, windowSec: number): Promise<{ ok: boolean; retryAfter: number }> {
  const res = await systemDb.execute<{ count: number; window_start: Date }>(sql`
    INSERT INTO rate_limits (key, window_start, count) VALUES (${key}, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSec}) THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSec}) THEN now() ELSE rate_limits.window_start END
    RETURNING count, window_start`);
  const row = res.rows[0];
  const ok = row.count <= max;
  const retryAfter = ok ? 0 : Math.max(1, Math.ceil(windowSec - (Date.now() - new Date(row.window_start).getTime()) / 1000));
  return { ok, retryAfter };
}

/** Lança 429 quando passar do limite. */
export async function limit(key: string, max: number, windowSec: number, message = 'Muitas tentativas. Espere um pouco e tente de novo.') {
  const r = await hit(key, max, windowSec);
  if (!r.ok) throw new ApiError(429, message, { retryAfter: r.retryAfter });
}

/** Limites do KFit, num lugar só. */
export const LIMITS = {
  /** login por IP */
  loginIp: [20, 60] as const,
  /** login por telefone */
  loginPhone: [8, 15 * 60] as const,
  /** códigos de WhatsApp por telefone por hora */
  otpPhone: [4, 60 * 60] as const,
  /** códigos de WhatsApp por IP por hora */
  otpIp: [15, 60 * 60] as const,
  /** alunos novos por studio por dia */
  newStudentsDay: [60, 24 * 60 * 60] as const,
  /** escrita geral por sessão por minuto */
  writesMinute: [120, 60] as const,
};
