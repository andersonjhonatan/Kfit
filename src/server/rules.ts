import 'server-only';
import { ApiError } from './http';

/**
 * Passo 2 dos 5: REGRA NO SERVIDOR.
 * O que cada plano libera e se o studio pode usar o sistema é decidido aqui.
 * A tela só mostra o que o servidor devolve; mexer no navegador não muda nada.
 */
export const PLANS = {
  solo: { name: 'Solo', maxStudents: 30, ai: false, staff: 1 },
  pro: { name: 'Pro', maxStudents: 10_000, ai: true, staff: 1 },
  studio: { name: 'Studio', maxStudents: 10_000, ai: true, staff: 10 },
} as const;
export type PlanKey = keyof typeof PLANS;

export type TenantRow = {
  plan: string;
  status: string;
  trialEndsAt: Date | null;
  paidUntil: Date | null;
  isDemo: boolean;
};

export function planOf(t: TenantRow) {
  return PLANS[(t.plan as PlanKey) in PLANS ? (t.plan as PlanKey) : 'solo'];
}

/** active: tudo liberado · readonly: venceu, só consulta · blocked: suspenso */
export function accessOf(t: TenantRow, now = new Date()): 'active' | 'readonly' | 'blocked' {
  if (t.isDemo) return 'active';
  if (t.status === 'blocked') return 'blocked';
  if (t.status === 'trial') return t.trialEndsAt && t.trialEndsAt > now ? 'active' : 'readonly';
  if (t.status === 'active') return !t.paidUntil || t.paidUntil > now ? 'active' : 'readonly';
  return 'readonly'; // past_due
}

export function assertCanWrite(t: TenantRow) {
  const a = accessOf(t);
  if (a === 'blocked') throw new ApiError(403, 'Conta suspensa. Fale com a TresK Tecnologia.');
  if (a === 'readonly') throw new ApiError(402, 'Seu período de uso terminou. Os dados continuam aqui; renove para voltar a editar.');
}

export function assertFeature(t: TenantRow, feature: 'ai') {
  if (!planOf(t)[feature]) throw new ApiError(403, 'Esse recurso faz parte do plano Pro.');
}

export function assertStudentLimit(t: TenantRow, current: number) {
  const max = planOf(t).maxStudents;
  if (current >= max) throw new ApiError(403, `Seu plano permite até ${max} alunos ativos. Mude para o Pro para cadastrar mais.`);
}
