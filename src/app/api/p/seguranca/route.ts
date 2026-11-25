import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { schema, systemDb } from '@/server/db';
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
  const devs = await systemDb.select().from(schema.devices).where(eq(schema.devices.staffId, c.staff.id)).orderBy(desc(schema.devices.lastSeenAt));
  const logs = await systemDb
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.tenantId, c.tenant.id))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(25);
  const [counts] = await systemDb
    .select({
      active: sql<number>`count(*) filter (where ${schema.students.accessStatus} = 'ativo')::int`,
      pending: sql<number>`count(*) filter (where ${schema.students.accessStatus} = 'pendente')::int`,
      paused: sql<number>`count(*) filter (where ${schema.students.accessStatus} = 'pausado')::int`,
    })
    .from(schema.students)
    .where(and(eq(schema.students.tenantId, c.tenant.id), eq(schema.students.status, 'ativo')));
  const live = await systemDb
    .select({ deviceId: schema.sessions.deviceId })
    .from(schema.sessions)
    .where(and(eq(schema.sessions.staffId, c.staff.id), isNull(schema.sessions.revokedAt), gt(schema.sessions.expiresAt, new Date())));
  return ok({
    settings: { lockAfterMin: c.staff.lockAfterMin, alertNewDevice: c.staff.alertNewDevice },
    devices: devs
      .filter((d) => live.some((l) => l.deviceId === d.id))
      .map((d) => ({ id: d.id, label: d.label, lastSeenAt: d.lastSeenAt, current: d.id === c.deviceId })),
    log: logs.map((l) => ({ at: l.createdAt, text: LABEL[l.action] ?? l.action, detail: (l.meta as Record<string, string>).aluno ?? (l.meta as Record<string, string>).aparelho ?? '', bad: /travado|errado/.test(l.action) })),
    students: counts,
  });
});

const Patch = z.object({ lockAfterMin: z.coerce.number().int().refine((v) => [1, 5, 15].includes(v)).optional(), alertNewDevice: z.boolean().optional() });

export const PATCH = route(async (req) => {
  const { c } = await staffRead(req);
  const v = await body(req, Patch);
  await systemDb.update(schema.staff).set(v).where(eq(schema.staff.id, c.staff.id));
  return ok();
});
