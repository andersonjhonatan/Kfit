import { z } from 'zod';
import { audit } from '@/server/audit';
import { revokeStudentSessions } from '@/server/auth';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ipOf, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };
const Body = z.object({ action: z.enum(['pausar', 'liberar', 'zerar']) });

/** O personal pausa, libera ou zera a senha do aluno. Pausar e zerar derrubam o aluno na hora. */
export const POST = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const { action } = await body(req, Body);
  const s = await db(async (tx) => {
    const cur = await tx.student.findUnique({ where: { id } });
    if (!cur) throw new ApiError(404, 'Aluno não encontrado.');
    const data =
      action === 'pausar'
        ? { accessStatus: 'pausado' }
        : action === 'liberar'
          ? { accessStatus: cur.passwordHash ? 'ativo' : 'pendente' }
          : { accessStatus: 'pendente', passwordHash: null, passwordSetAt: null, failedLogins: 0, lockedUntil: null };
    return tx.student.update({ where: { id }, data });
  });
  if (action !== 'liberar') await revokeStudentSessions(id);
  await audit({ tenantId: c.tenant.id, actorKind: 'staff', actorId: c.staff.id, action: `acesso_${action}`, meta: { aluno: s.name }, ip: ipOf(req) });
  return ok({ access: s.accessStatus });
});
