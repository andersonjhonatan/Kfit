import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { systemDb } from './db';

/** Registro de acesso e ações sensíveis (aparece em Segurança e acesso). Nunca derruba a requisição. */
export async function audit(e: {
  tenantId: string | null;
  actorKind: 'staff' | 'student' | 'system';
  actorId?: string | null;
  action: string;
  meta?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await systemDb.auditLog.create({
      data: {
        tenantId: e.tenantId,
        actorKind: e.actorKind,
        actorId: e.actorId ?? null,
        action: e.action,
        meta: (e.meta ?? {}) as object,
        ip: (e.ip ?? '').slice(0, 64),
      },
    });
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'audit' } });
  }
}
