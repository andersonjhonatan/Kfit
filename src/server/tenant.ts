import 'server-only';
import { eq } from 'drizzle-orm';
import { schema, systemDb } from './db';
import { ApiError } from './http';

/** Studio público pelo link (/a/<slug>). Só dados de marca saem daqui. */
export async function tenantBySlug(slug: string) {
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) throw new ApiError(404, 'Studio não encontrado.');
  const [t] = await systemDb.select().from(schema.tenants).where(eq(schema.tenants.slug, slug)).limit(1);
  if (!t) throw new ApiError(404, 'Studio não encontrado.');
  return t;
}

export const publicBrand = (t: typeof schema.tenants.$inferSelect) => ({
  slug: t.slug,
  name: t.name,
  tagline: t.tagline,
  color: t.brandColor,
  mono: t.brandMono,
  shape: t.brandShape,
  isDemo: t.isDemo,
});
