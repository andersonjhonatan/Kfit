import { audit } from '@/server/audit';
import { systemDb } from '@/server/db';
import { staffRead } from '@/server/guard';
import { ipOf, ok, route } from '@/server/http';

export const POST = route(async (req) => {
  const { c } = await staffRead(req);
  await systemDb.session.updateMany({ where: { staffId: c.staff.id, revokedAt: null, id: { not: c.sessionId } }, data: { revokedAt: new Date() } });
  if (c.deviceId) await systemDb.device.deleteMany({ where: { staffId: c.staff.id, id: { not: c.deviceId } } });
  await audit({ tenantId: c.tenant.id, actorKind: 'staff', actorId: c.staff.id, action: 'sair_todos', ip: ipOf(req) });
  return ok();
});
