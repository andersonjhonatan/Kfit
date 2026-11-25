import { z } from 'zod';
import { audit } from '@/server/audit';
import { sendOtp, startStaffSession, trustedDevice } from '@/server/auth';
import { systemDb } from '@/server/db';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { LIMITS, limit } from '@/server/ratelimit';
import { checkPassword, dummyCheck, normalizePhone } from '@/server/security';
import { sendWhatsApp } from '@/server/whatsapp';

const Body = z.object({ phone: z.string().max(30), password: z.string().min(1).max(100) });
const WRONG = 'Telefone ou senha incorretos.';

export const POST = route(async (req) => {
  const { phone: raw, password } = await body(req, Body);
  const ip = ipOf(req);
  const phone = normalizePhone(raw);
  await limit(`login:ip:${ip}`, ...LIMITS.loginIp);
  if (!phone) throw new ApiError(400, 'Digite o número com DDD.');
  await limit(`login:staff:${phone}`, ...LIMITS.loginPhone);

  const st = await systemDb.staff.findUnique({ where: { phone }, include: { tenant: true } });
  if (!st) {
    await dummyCheck(); // mesmo tempo de resposta: não revela se o número existe
    throw new ApiError(400, WRONG);
  }
  const tn = st.tenant;
  if (st.lockedUntil && st.lockedUntil > new Date()) {
    throw new ApiError(423, 'Conta protegida por 15 minutos depois de várias senhas erradas. Se não foi você, troque a senha pelo WhatsApp.', { need: 'blocked' });
  }
  if (!(await checkPassword(password, st.passwordHash))) {
    const fails = st.failedLogins + 1;
    const lock = fails >= 5;
    await systemDb.staff.update({
      where: { id: st.id },
      data: { failedLogins: lock ? 0 : fails, lockedUntil: lock ? new Date(Date.now() + 15 * 60_000) : null },
    });
    if (lock) {
      await audit({ tenantId: tn.id, actorKind: 'staff', actorId: st.id, action: 'login_travado', ip });
      if (!tn.isDemo) await sendWhatsApp(st.phone, 'KFit: erraram a senha da sua conta 5 vezes. O login ficou travado por 15 minutos. Se não foi você, troque a senha.');
      throw new ApiError(423, 'Senha errada 5 vezes. Para proteger os dados dos alunos, o login ficou travado por 15 minutos.', { need: 'blocked' });
    }
    throw new ApiError(400, `${WRONG} Restam ${5 - fails} tentativas.`);
  }
  await systemDb.staff.update({ where: { id: st.id }, data: { failedLogins: 0, lockedUntil: null } });

  const device = await trustedDevice(st.id);
  if (!device) {
    const sent = await sendOtp({ tenantId: tn.id, subject: 'staff', subjectId: st.id, phone: st.phone, isDemo: tn.isDemo }, 'device', ip, 'KFit');
    return ok({ step: 'code', ...sent });
  }
  await startStaffSession(st, device.id, Boolean(st.pinHash));
  await audit({ tenantId: tn.id, actorKind: 'staff', actorId: st.id, action: 'entrou_senha', meta: { aparelho: device.label }, ip });
  return ok({ step: st.pinHash ? 'in' : 'pin_create' });
});
