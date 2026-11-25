import { and, isNotNull, lt, or, sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import { schema, systemDb } from '@/server/db';
import { route } from '@/server/http';
import { seedDemo } from '@/server/seed-demo';

/**
 * Rotina diária (Vercel Cron, ver vercel.json):
 *  - volta o studio de demonstração ao começo (visitantes mexem nele o dia todo)
 *  - apaga códigos, sessões e contadores vencidos
 */
export const GET = route(async (req: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
  await systemDb.delete(schema.otpCodes).where(lt(schema.otpCodes.createdAt, dayAgo));
  await systemDb.delete(schema.rateLimits).where(lt(schema.rateLimits.windowStart, dayAgo));
  await systemDb
    .delete(schema.sessions)
    .where(or(lt(schema.sessions.expiresAt, new Date()), and(isNotNull(schema.sessions.revokedAt), lt(schema.sessions.revokedAt, dayAgo))));
  await systemDb.delete(schema.auditLogs).where(lt(schema.auditLogs.createdAt, sql`now() - interval '180 days'`));
  const demo = await seedDemo(systemDb);
  return NextResponse.json({ ok: true, demo: demo.slug });
});
