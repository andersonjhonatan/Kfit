import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { body, ok, route } from '@/server/http';

const Body = z.object({
  name: z.string().trim().min(3).max(50).optional(),
  tagline: z.string().trim().max(60).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida.').optional(),
  mono: z.string().trim().min(1).max(3).optional(),
  shape: z.enum(['round', 'square', 'shield']).optional(),
  pixKey: z.string().trim().max(100).optional(),
});

export const PATCH = route(async (req) => {
  const { c, db } = await staffWrite(req);
  const v = await body(req, Body);
  await db((tx) =>
    tx
      .update(schema.tenants)
      .set({ name: v.name, tagline: v.tagline, brandColor: v.color, brandMono: v.mono?.toUpperCase(), brandShape: v.shape, pixKey: v.pixKey })
      .where(eq(schema.tenants.id, c.tenant.id)),
  );
  return ok();
});
