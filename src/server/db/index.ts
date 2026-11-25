import 'server-only';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import { env } from '../env';
import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema>;

const g = globalThis as unknown as { __kfitPools?: { system: Pool; app: Pool } };
const pools =
  g.__kfitPools ??
  (g.__kfitPools = {
    system: new Pool({ connectionString: env.DATABASE_URL, max: 5 }),
    app: new Pool({ connectionString: env.DATABASE_APP_URL, max: 10 }),
  });

/**
 * Conexão de SISTEMA (dono das tabelas, ignora RLS).
 * Só para o que acontece antes do login ou não pertence a um studio:
 * conferir senha, códigos, sessões, limites de uso, auditoria.
 * NUNCA use para ler ou mudar dados de negócio de um studio.
 */
export const systemDb: Db = drizzle(pools.system, { schema });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Scope = { tenantId: string; studentId?: string | null };

/**
 * Porta de entrada para os dados de um studio. Abre uma transação com o papel
 * restrito (kfit_app) e liga a trava do banco para o studio — e para o aluno,
 * quando a requisição vem do app do aluno. As consultas ainda filtram por
 * tenant_id no código (defesa em dobro).
 */
export async function withScope<T>(scope: Scope, fn: (db: Db) => Promise<T>): Promise<T> {
  if (!UUID.test(scope.tenantId)) throw new Error('studio inválido');
  if (scope.studentId && !UUID.test(scope.studentId)) throw new Error('aluno inválido');
  const client: PoolClient = await pools.app.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true), set_config('app.student_id', $2, true)", [
      scope.tenantId,
      scope.studentId ?? '',
    ]);
    const result = await fn(drizzle(client, { schema }));
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export { schema };
