import { z } from 'zod';
import { audit } from '@/server/audit';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ipOf, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };

export const POST = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const { status } = await body(req, z.object({ status: z.enum(['pago', 'aberto']) }));
  const p = await db(async (tx) => {
    const r = await tx.payment.updateMany({ where: { id }, data: { status, paidAt: status === 'pago' ? new Date() : null } });
    return r.count ? tx.payment.findUnique({ where: { id } }) : null;
  });
  if (!p) throw new ApiError(404, 'Mensalidade não encontrada.');
  await audit({ tenantId: c.tenant.id, actorKind: 'staff', actorId: c.staff.id, action: status === 'pago' ? 'pagamento_baixado' : 'pagamento_reaberto', meta: { valor: p.amountCents }, ip: ipOf(req) });
  return ok();
});
