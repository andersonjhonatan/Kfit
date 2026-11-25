import { z } from 'zod';
import { systemDb } from '@/server/db';
import { staffRead } from '@/server/guard';
import { body, ok, route } from '@/server/http';

const LABEL: Record<string, string> = {
  entrou_senha: 'Entrou com senha',
  aparelho_novo: 'Entrou num aparelho novo (senha + código)',
  login_travado: 'Senha errada 5 vezes · login travado 15 min',
  pin_errado_3x: 'PIN errado 3 vezes · sessão encerrada',
  pin_criado: 'Criou o PIN do app',
  pin_trocado: 'Trocou o PIN',
  senha_trocada: 'Trocou a senha',
  aparelho_desconectado: 'Desconectou um aparelho',
  sair_todos: 'Saiu de todos os outros aparelhos',
  aluno_primeiro_acesso: 'Aluno fez o primeiro acesso',
  aluno_trocou_senha: 'Aluno trocou a senha',
  login_aluno_travado: 'Aluno errou a senha 5 vezes',
  acesso_pausar: 'Pausou o acesso de um aluno',
  acesso_liberar: 'Liberou o acesso de um aluno',
  acesso_zerar: 'Zerou a senha de um aluno',
  aluno_cadastrado: 'Cadastrou um aluno',
  pagamento_baixado: 'Deu baixa numa mensalidade',
  pagamento_reaberto: 'Reabriu uma mensalidade',
};

export const GET = route(async (req) => {
  const { c } = await staffRead(req);
  const [devs, logs, groups, live] = await Promise.all([
    systemDb.device.findMany({ where: { staffId: c.staff.id }, orderBy: { lastSeenAt: 'desc' } }),
    systemDb.auditLog.findMany({ where: { tenantId: c.tenant.id }, orderBy: { createdAt: 'desc' }, take: 25 }),
    systemDb.student.groupBy({ by: ['accessStatus'], where: { tenantId: c.tenant.id, status: 'ativo' }, _count: { _all: true } }),
    systemDb.session.findMany({ where: { staffId: c.staff.id, revokedAt: null, expiresAt: { gt: new Date() } }, select: { deviceId: true } }),
  ]);
  const count = (k: string) => groups.find((g) => g.accessStatus === k)?._count._all ?? 0;
  return ok({
    settings: { lockAfterMin: c.staff.lockAfterMin, alertNewDevice: c.staff.alertNewDevice },
    devices: devs.filter((d) => live.some((l) => l.deviceId === d.id)).map((d) => ({ id: d.id, label: d.label, lastSeenAt: d.lastSeenAt, current: d.id === c.deviceId })),
    log: logs.map((l) => {
      const m = (l.meta ?? {}) as Record<string, string>;
      return { at: l.createdAt, text: LABEL[l.action] ?? l.action, detail: m.aluno ?? m.aparelho ?? '', bad: /travado|errado/.test(l.action) };
    }),
    students: { active: count('ativo'), pending: count('pendente'), paused: count('pausado') },
  });
});

const Patch = z.object({ lockAfterMin: z.coerce.number().int().refine((v) => [1, 5, 15].includes(v)).optional(), alertNewDevice: z.boolean().optional() });

export const PATCH = route(async (req) => {
  const { c } = await staffRead(req);
  const v = await body(req, Patch);
  await systemDb.staff.update({ where: { id: c.staff.id }, data: v });
  return ok();
});
