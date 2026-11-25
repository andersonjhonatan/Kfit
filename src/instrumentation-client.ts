// Erros no navegador (painel e app do aluno) vão para o monitor quando NEXT_PUBLIC_SENTRY_DSN existir.
// Carregado sob demanda: sem DSN, o site não baixa nada do Sentry.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  import('@sentry/nextjs').then((Sentry) =>
    Sentry.init({ dsn, environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV, tracesSampleRate: 0 }),
  );
}
