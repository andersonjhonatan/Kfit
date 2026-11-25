// Passo 5 dos 5: MONITOR DE ERRO. Liga sozinho quando SENTRY_DSN estiver definido.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
  });
}

// Erros não tratados em páginas e rotas também vão para o monitor.
export const onRequestError = Sentry.captureRequestError;
