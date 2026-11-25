'use client';

/** Peças de interface do app (painel do personal e app do aluno). Tema escuro, toque grande. */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Delete, Loader2, X } from 'lucide-react';

// ───────── API ─────────
export class ApiErr extends Error {
  constructor(
    public status: number,
    message: string,
    public data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export async function api<T = Record<string, any>>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiErr(0, 'Sem conexão. Confira a internet e tente de novo.');
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, any>;
  if (!res.ok) throw new ApiErr(res.status, data.error || 'Algo deu errado.', data);
  return data as T;
}

// ───────── formatos ─────────
export const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const kg = (v: number | null | undefined) => (v === null || v === undefined ? '–' : `${String(v).replace('.', ',')} kg`);
export function phoneMask(d: string) {
  const x = d.replace(/\D/g, '').slice(0, 11);
  if (x.length <= 2) return x;
  if (x.length <= 7) return `(${x.slice(0, 2)}) ${x.slice(2)}`;
  return `(${x.slice(0, 2)}) ${x.slice(2, x.length - 4)}-${x.slice(-4)}`;
}
export const ago = (iso: string | Date | null) => {
  if (!iso) return 'nunca';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 2) return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ontem' : `há ${d} dias`;
};

// ───────── aviso rápido (toast) ─────────
const ToastCtx = createContext<(t: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = useCallback((t: string) => {
    setMsg(t);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div role="status" className="fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 animate-[kIn_.25s_ease]">
          <div className="flex max-w-sm items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0B0B0C] shadow-2xl">
            <Check className="h-4 w-4 flex-none text-emerald-600" /> {msg}
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

// ───────── botões e campos ─────────
export function Btn({
  children,
  onClick,
  kind = 'primary',
  busy,
  disabled,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'primary' | 'ghost' | 'danger' | 'soft' | 'white' | 'green';
  busy?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const k = {
    primary: 'bg-[var(--tc)] text-white',
    white: 'bg-white text-[#0B0B0C]',
    green: 'bg-[#16A34A] text-white',
    soft: 'bg-white/[0.07] text-[#F5F5F7]',
    ghost: 'border border-white/15 text-[#F5F5F7]',
    danger: 'border border-red-300/35 text-red-300',
  }[kind];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[.97] disabled:opacity-40 ${k} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#D4D4D8]">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-[#71717A]">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'h-12 w-full rounded-xl border border-white/15 bg-[#141418] px-3.5 text-base text-[#F5F5F7] outline-none placeholder:text-[#52525B] focus:border-[var(--tc2)]';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] bg-[#141418] p-4 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9CED6] ${className}`}>{children}</p>;
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <h1 className="kx text-[25px] leading-tight">{children}</h1>
      {sub && <p className="mt-1 text-[13px] text-[#A1A1AA]">{sub}</p>}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-center text-[13px] font-semibold leading-snug text-red-300">
      {children}
    </p>
  );
}

export function Chip({ kind, children }: { kind: 'ok' | 'warn' | 'late' | 'info' | 'mute'; children: ReactNode }) {
  const c = {
    ok: 'bg-emerald-400/15 text-emerald-300',
    warn: 'bg-amber-300/15 text-amber-200',
    late: 'bg-red-400/15 text-red-300',
    info: 'bg-[var(--tc)]/20 text-[var(--tcL)]',
    mute: 'bg-white/10 text-[#C9CED6]',
  }[kind];
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${c}`}>{children}</span>;
}

// ───────── folha que sobe de baixo ─────────
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 animate-[kFade_.2s_ease]" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-[#141418] px-5 pb-8 pt-4 animate-[kUp_.3s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="kx text-xl">{title}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ───────── teclado do PIN ─────────
export function PinPad({ value, onChange, length = 4, onBio }: { value: string; onChange: (v: string) => void; length?: number; onBio?: () => void }) {
  const press = (k: string) => {
    if (k === 'del') return onChange(value.slice(0, -1));
    if (value.length < length) onChange(value + k);
  };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4" aria-label={`${value.length} de ${length} números`}>
        {Array.from({ length }).map((_, i) => (
          <span key={i} className={`h-4 w-4 rounded-full ${i < value.length ? 'bg-[var(--tc2)]' : 'border-2 border-white/30'}`} />
        ))}
      </div>
      <div className="grid w-full max-w-[300px] grid-cols-3 gap-x-5 gap-y-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'].map((k) =>
          k === 'bio' ? (
            <span key={k} />
          ) : (
            <button
              key={k}
              type="button"
              aria-label={k === 'del' ? 'Apagar' : k}
              onClick={() => press(k)}
              className={`grid h-16 place-items-center rounded-full text-2xl font-semibold active:scale-95 ${k === 'del' ? '' : 'bg-[#17171B]'}`}
            >
              {k === 'del' ? <Delete className="h-6 w-6" /> : k}
            </button>
          ),
        )}
      </div>
      {onBio && null}
    </div>
  );
}

/** Notificação de exemplo do WhatsApp (studio de demonstração / desenvolvimento). */
export function DemoWhatsApp({ from, text }: { from: string; text?: string }) {
  if (!text) return null;
  return (
    <div role="status" className="flex gap-3 rounded-2xl bg-[#1F2C34] p-3.5 shadow-2xl animate-[kDrop_.45s_cubic-bezier(.16,1,.3,1)]">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#25D366] text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <b className="truncate text-[13px] text-[#E9EDEF]">{from}</b>
          <span className="flex-none text-[11px] text-[#8696A0]">exemplo · agora</span>
        </div>
        <p className="mt-0.5 text-[13px] leading-snug text-[#D1D7DB]">{text}</p>
      </div>
    </div>
  );
}

/** Regras da senha (as mesmas do servidor). */
export function passwordRules(p: string, p2: string) {
  return [
    { ok: p.length >= 6, t: 'Pelo menos 6 caracteres' },
    { ok: /[a-zA-Z]/.test(p) && /\d/.test(p), t: 'Letras e números' },
    { ok: p.length > 0 && !['123456', 'senha123', 'abc123', '654321'].includes(p.toLowerCase()), t: 'Nada fácil, como 123456' },
    { ok: p.length > 0 && p === p2, t: 'As duas senhas iguais' },
  ];
}

export function Rules({ items }: { items: { ok: boolean; t: string }[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((r) => (
        <li key={r.t} className={`flex items-center gap-2 text-[13px] ${r.ok ? 'text-emerald-300' : 'text-[#A1A1AA]'}`}>
          <span className={`h-2 w-2 rounded-full ${r.ok ? 'bg-emerald-300' : 'bg-white/20'}`} /> {r.t}
        </li>
      ))}
    </ul>
  );
}

export function Spinner() {
  return (
    <div className="grid flex-1 place-items-center py-20">
      <Loader2 className="h-7 w-7 animate-spin text-[var(--tc2)]" />
    </div>
  );
}

/** Carrega dados de uma rota e expõe recarregar. */
export function useData<T>(path: string | null, onAuth?: (e: ApiErr) => void) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return;
    let alive = true;
    api<T>(path)
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e: ApiErr) => {
        if (!alive) return;
        if ((e.status === 401 || e.status === 423) && onAuth) onAuth(e);
        else setError(e.message);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick]);
  return { data, error, reload: () => setTick((x) => x + 1), setData };
}
