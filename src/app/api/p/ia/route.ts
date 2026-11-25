import { z } from 'zod';
import { staffRead } from '@/server/guard';
import { env } from '@/server/env';
import { ApiError, body, ok, route } from '@/server/http';
import { dashboard, studentsList } from '@/server/queries';
import { limit } from '@/server/ratelimit';
import { assertCanWrite, assertFeature } from '@/server/rules';

const Body = z.object({
  message: z.string().trim().min(2).max(1000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) })).max(10).default([]),
});

/**
 * Assistente com IA. Regra no servidor: só no plano com IA, com limite por dia (passo 4),
 * e só recebe um resumo dos dados do próprio studio (passo 1 continua valendo).
 */
export const POST = route(async (req) => {
  const { c, db } = await staffRead(req);
  assertFeature(c.tenant, 'ai');
  assertCanWrite(c.tenant);
  if (!env.ANTHROPIC_API_KEY) throw new ApiError(503, 'O assistente ainda não foi ligado neste servidor (falta ANTHROPIC_API_KEY).');
  await limit(`ia:min:${c.sessionId}`, 8, 60, 'Calma! Espere alguns segundos entre as perguntas.');
  await limit(`ia:dia:${c.tenant.id}`, env.AI_DAILY_LIMIT, 24 * 3600, 'O assistente chegou ao limite de hoje. Volta amanhã.');
  const v = await body(req, Body);

  const { dash, list } = await db(async (tx) => ({ dash: await dashboard(tx, c.tenant.id), list: await studentsList(tx, c.tenant.id) }));
  const resumo = [
    `Studio: ${c.tenant.name}. Personal: ${c.staff.name}.`,
    `Alunos ativos (${list.filter((s) => s.status === 'ativo').length}): ` +
      list
        .filter((s) => s.status === 'ativo')
        .map((s) => `${s.name} (objetivo: ${s.goal || '—'}, dias: ${s.days || '—'}, mensalidade: ${s.pay.label})`)
        .join('; '),
    `Sem treinar há 7+ dias: ${dash.missing.map((m) => `${m.name} (${m.never ? 'nunca treinou no app' : m.days + ' dias'})`).join(', ') || 'ninguém'}.`,
    `Cargas fora da meta na última semana: ${dash.alerts.map((a) => `${a.name} · ${a.exercise}: ${a.verdict} (${a.detail})`).join('; ') || 'nenhuma'}.`,
    `Hoje: ${dash.today.map((t) => `${t.time} ${t.name}`).join(', ') || 'sem horários marcados'}. Mensalidades em aberto no mês: ${dash.kpis.toReceive}.`,
  ].join('\n');

  const system =
    'Você é o assistente do KFit, app de um personal trainer brasileiro. Responda em português do Brasil, curto, prático e gentil. ' +
    'Use só os dados do studio abaixo; se não souber, diga. Pode montar treinos, sugerir mensagens de WhatsApp para alunos e resumir a semana. ' +
    'Não faça diagnóstico médico nem prescreva dieta; para dor, lesão ou doença, oriente procurar um profissional de saúde.\n\nDados do studio:\n' +
    resumo;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 800,
      system,
      messages: [...v.history.map((h) => ({ role: h.role, content: h.text })), { role: 'user', content: v.message }],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`IA respondeu ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return ok({ text: text || 'Não consegui responder agora. Tente perguntar de outro jeito.' });
});
