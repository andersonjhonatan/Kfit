import 'server-only';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** dono das tabelas: migrations e operações antes do login */
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  /** papel kfit_app (sem bypass de RLS): todas as rotas depois do login */
  DATABASE_APP_URL: z.string().min(1, 'DATABASE_APP_URL é obrigatória'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET precisa ter pelo menos 32 caracteres'),
  /** Evolution API (WhatsApp). Sem isso, os códigos só funcionam no studio de demonstração. */
  EVOLUTION_URL: z.string().optional(),
  EVOLUTION_API_KEY: z.string().optional(),
  EVOLUTION_INSTANCE: z.string().optional(),
  /** Só para desenvolvimento local: mostra o código na resposta para qualquer studio. */
  OTP_DEBUG: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  /** IA do assistente */
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-haiku-5-5'),
  /** Limites de uso */
  AI_DAILY_LIMIT: z.coerce.number().int().positive().default(60),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Configuração inválida:\n${issues}`);
}
export const env = parsed.data;
