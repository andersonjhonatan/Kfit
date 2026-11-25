import { NextResponse, type NextRequest } from 'next/server';
import { systemDb } from '@/server/db';
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
  await systemDb.otpCode.deleteMany({ where: { createdAt: { lt: dayAgo } } });
  await systemDb.rateLimit.deleteMany({ where: { windowStart: { lt: dayAgo } } });
  await systemDb.session.deleteMany({ where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: dayAgo } }] } });
  await systemDb.auditLog.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 180 * 86_400_000) } } });
  const demo = await seedDemo(systemDb);
  return NextResponse.json({ ok: true, demo: demo.slug });
});
