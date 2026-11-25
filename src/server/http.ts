import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError, type ZodType } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export const ok = (data: unknown = { ok: true }, init?: ResponseInit) => NextResponse.json(data, init);

export function ipOf(req: NextRequest) {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
}

export async function body<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, 'Requisição inválida.');
  }
  return schema.parse(raw);
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

/**
 * Envolve toda rota da API: erros conhecidos viram resposta amigável;
 * erros inesperados vão para o monitor de erros (passo 5) e o usuário vê uma mensagem genérica.
 */
export function route<C = { params: Promise<Record<string, string>> }>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) {
        const headers: Record<string, string> = {};
        if (e.status === 429 && e.extra.retryAfter) headers['Retry-After'] = String(e.extra.retryAfter);
        return NextResponse.json({ error: e.message, ...e.extra }, { status: e.status, headers });
      }
      if (e instanceof ZodError) {
        return NextResponse.json({ error: e.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
      }
      Sentry.captureException(e, { tags: { route: req.nextUrl.pathname } });
      console.error('[api]', req.method, req.nextUrl.pathname, e);
      return NextResponse.json({ error: 'Algo deu errado do nosso lado. Já fomos avisados.' }, { status: 500 });
    }
  };
}
