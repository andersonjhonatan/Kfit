import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { env } from '../env';

export type Tx = Prisma.TransactionClient;

const make = (url: string, max: number) => new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max }) });

const g = globalThis as unknown as { __kfitPrisma?: { system: PrismaClient; app: PrismaClient } };
const clients = g.__kfitPrisma ?? (g.__kfitPrisma = { system: make(env.DATABASE_URL, 5), app: make(env.DATABASE_APP_URL, 10) });

/**
 * Conexão de SISTEMA (dono das tabelas, ignora RLS).
 * Só para o que acontece antes do login ou não pertence a um studio:
 * conferir senha, códigos, sessões, limites de uso, auditoria.
 * NUNCA use para ler ou mudar dados de negócio de um studio.
 */
export const systemDb = clients.system;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Scope = { tenantId: string; studentId?: string | null };

/**
 * Porta de entrada para os dados de um studio. Abre uma transação com o papel
 * restrito (kfit_app) e liga a trava do banco para o studio — e para o aluno,
 * quando a requisição vem do app do aluno. As consultas ainda filtram por
 * tenantId no código (defesa em dobro).
 */
export function withScope<T>(scope: Scope, fn: (db: Tx) => Promise<T>): Promise<T> {
  if (!UUID.test(scope.tenantId)) throw new Error('studio inválido');
  if (scope.studentId && !UUID.test(scope.studentId)) throw new Error('aluno inválido');
  return clients.app.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${scope.tenantId}, true), set_config('app.student_id', ${scope.studentId ?? ''}, true)`;
      return fn(tx);
    },
    { timeout: 15_000, maxWait: 10_000 },
  );
}

/** Datas (coluna date) no formato AAAA-MM-DD. */
export const toDay = (s: string) => new Date(`${s}T00:00:00.000Z`);
export const fromDay = (d: Date) => d.toISOString().slice(0, 10);
