import { and, eq, isNull, ne } from 'drizzle-orm';
import { audit } from '@/server/audit';
import { schema, systemDb } from '@/server/db';
import { staffRead } from '@/server/guard';
import { ipOf, ok, route } from '@/server/http';

export const POST = route(async (req) => {
  const { c } = await staffRead(req);
  await systemDb
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.sessions.staffId, c.staff.id), isNull(schema.sessions.revokedAt), ne(schema.sessions.id, c.sessionId)));
  if (c.deviceId) await systemDb.delete(schema.devices).where(and(eq(schema.devices.staffId, c.staff.id), ne(schema.devices.id, c.deviceId)));
  await audit({ tenantId: c.tenant.id, actorKind: 'staff', actorId: c.staff.id, action: 'sair_todos', ip: ipOf(req) });
  return ok();
});
