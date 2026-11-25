import { z } from 'zod';
import { staffRead, staffWrite } from '@/server/guard';
import { body, ok, route } from '@/server/http';

export const GET = route(async (req) => {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 40);
  const { db } = await staffRead(req);
  const rows = await db((tx) =>
    tx.exercise.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: [{ muscle: 'asc' }, { name: 'asc' }],
      take: 200,
      select: { id: true, name: true, muscle: true, tenantId: true },
    }),
  );
  return ok({ exercises: rows.map((r) => ({ id: r.id, name: r.name, muscle: r.muscle, mine: Boolean(r.tenantId) })) });
});

/** Exercício próprio do studio. */
export const POST = route(async (req) => {
  const { c, db } = await staffWrite(req);
  const v = await body(req, z.object({ name: z.string().trim().min(3).max(60), muscle: z.string().trim().min(2).max(30), videoUrl: z.url().max(300).optional() }));
  const row = await db((tx) => tx.exercise.create({ data: { tenantId: c.tenant.id, name: v.name, muscle: v.muscle, videoUrl: v.videoUrl ?? '' } }));
  return ok({ id: row.id }, { status: 201 });
});
