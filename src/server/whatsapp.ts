import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { env } from './env';

/** Envia uma mensagem de texto pelo WhatsApp (Evolution API). Devolve false se não deu. */
export async function sendWhatsApp(phoneDigits: string, text: string): Promise<boolean> {
  if (!env.EVOLUTION_URL || !env.EVOLUTION_API_KEY || !env.EVOLUTION_INSTANCE) return false;
  try {
    const res = await fetch(`${env.EVOLUTION_URL.replace(/\/$/, '')}/message/sendText/${env.EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: env.EVOLUTION_API_KEY },
      body: JSON.stringify({ number: `55${phoneDigits}`, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Evolution API respondeu ${res.status}`);
    return true;
  } catch (e) {
    Sentry.captureException(e, { tags: { area: 'whatsapp' } });
    return false;
  }
}

export const whatsappConfigured = () => Boolean(env.EVOLUTION_URL && env.EVOLUTION_API_KEY && env.EVOLUTION_INSTANCE);
