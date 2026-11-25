import { z } from 'zod';
import { audit } from '@/server/audit';
import { systemDb } from '@/server/db';
import { staffRead } from '@/server/guard';
import { ApiError, ipOf, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };

export const DELETE = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { c } = await staffRead(req);
  if (id === c.deviceId) throw new ApiError(400, 'Para sair deste aparelho, use "Sair da conta".');
  const d = await systemDb.device.findFirst({ where: { id, staffId: c.staff.id } });
  if (!d) throw new ApiError(404, 'Aparelho não encontrado.');
  await systemDb.session.updateMany({ where: { deviceId: id, revokedAt: null }, data: { revokedAt: new Date() } });
  await systemDb.device.delete({ where: { id } });
  await audit({ tenantId: c.tenant.id, actorKind: 'staff', actorId: c.staff.id, action: 'aparelho_desconectado', meta: { aparelho: d.label }, ip: ipOf(req) });
  return ok();
});
