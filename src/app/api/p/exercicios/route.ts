import { asc, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffRead, staffWrite } from '@/server/guard';
import { body, ok, route } from '@/server/http';

export const GET = route(async (req) => {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 40);
  const { db } = await staffRead(req);
  const rows = await db((tx) =>
    tx
      .select({ id: schema.exercises.id, name: schema.exercises.name, muscle: schema.exercises.muscle, mine: schema.exercises.tenantId })
      .from(schema.exercises)
      .where(q ? ilike(schema.exercises.name, `%${q.replace(/[%_]/g, '')}%`) : undefined)
      .orderBy(asc(schema.exercises.muscle), asc(schema.exercises.name))
      .limit(200),
  );
  return ok({ exercises: rows.map((r) => ({ id: r.id, name: r.name, muscle: r.muscle, mine: Boolean(r.mine) })) });
});

/** Exercício próprio do studio. */
export const POST = route(async (req) => {
  const { c, db } = await staffWrite(req);
  const v = await body(req, z.object({ name: z.string().trim().min(3).max(60), muscle: z.string().trim().min(2).max(30), videoUrl: z.url().max(300).optional() }));
  const [row] = await db((tx) => tx.insert(schema.exercises).values({ tenantId: c.tenant.id, name: v.name, muscle: v.muscle, videoUrl: v.videoUrl ?? '' }).returning());
  return ok({ id: row.id }, { status: 201 });
});
