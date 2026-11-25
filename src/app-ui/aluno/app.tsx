'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { CalendarDays, Dumbbell, Home, LogOut, TrendingUp } from 'lucide-react';
import { api, ApiErr, Spinner, ToastProvider } from '../kit';
import { StudentLogin } from './login';
import { Inicio } from './inicio';
import { Treino } from './treino';
import { Evolucao } from './evolucao';
import { Marcar } from './marcar';

export type Brand = { slug: string; name: string; tagline: string; color: string; mono: string; shape: string; isDemo: boolean };
export type Tab = 'inicio' | 'treino' | 'evolucao' | 'marcar';
export type Ctx = { slug: string; brand: Brand; go: (t: Tab, workoutId?: string) => void; auth: (e: ApiErr) => void };

const mix = (hex: string, to: string, p: number) => {
  const a = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const b = to.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * p).toString(16).padStart(2, '0')).join('');
};

export function brandVars(color: string): CSSProperties {
  return { ['--tc' as string]: color, ['--tc2' as string]: mix(color, '#ffffff', 0.15), ['--tcL' as string]: mix(color, '#ffffff', 0.55) };
}

export function Badge({ brand, size = 40 }: { brand: Brand; size?: number }) {
  const r = brand.shape === 'round' ? '999px' : brand.shape === 'shield' ? `10px 10px ${size / 2}px ${size / 2}px` : '12px';
  return (
    <span className="kx grid flex-none place-items-center text-white" style={{ width: size, height: size, borderRadius: r, fontSize: size * 0.34, background: `linear-gradient(145deg, ${mix(brand.color, '#ffffff', 0.15)}, ${mix(brand.color, '#000000', 0.2)})` }}>
      {brand.mono}
    </span>
  );
}

export function AlunoApp({ slug }: { slug: string }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [state, setState] = useState<'loading' | 'login' | 'in' | 'notfound'>('loading');
  const [msg, setMsg] = useState<string | undefined>();
  const [tab, setTab] = useState<Tab>('inicio');
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      await api(`/api/a/${slug}/me`);
      setState('in');
    } catch (e) {
      const ae = e as ApiErr;
      setMsg(ae.status === 403 ? ae.message : undefined);
      setState('login');
    }
  }, [slug]);

  useEffect(() => {
    api<Brand>(`/api/a/${slug}/marca`)
      .then((b) => {
        setBrand(b);
        check();
      })
      .catch(() => setState('notfound'));
  }, [slug, check]);

  const auth = useCallback(
    (e: ApiErr) => {
      if (e.status === 401 || e.status === 403) {
        setMsg(e.status === 403 ? e.message : undefined);
        setState('login');
      }
    },
    [],
  );

  if (state === 'notfound') return <div className="grid min-h-dvh place-items-center p-6 text-center text-sm text-[#A1A1AA]">Studio não encontrado. Confira o link com o seu personal.</div>;
  if (!brand || state === 'loading') return <Spinner />;

  const style = brandVars(brand.color);
  if (state === 'login')
    return (
      <div style={style}>
        <StudentLogin slug={slug} brand={brand} initialError={msg} onDone={() => (setTab('inicio'), setState('in'))} />
      </div>
    );

  const go = (t: Tab, w?: string) => {
    if (w) setWorkoutId(w);
    setTab(t);
    window.scrollTo({ top: 0 });
  };
  const ctx: Ctx = { slug, brand, go, auth };
  const logout = async () => {
    await api(`/api/a/${slug}/auth/sair`, 'POST').catch(() => {});
    setState('login');
  };
  const tabs: { k: Tab; label: string; I: typeof Home }[] = [
    { k: 'inicio', label: 'Início', I: Home },
    { k: 'treino', label: 'Treino', I: Dumbbell },
    { k: 'evolucao', label: 'Evolução', I: TrendingUp },
    { k: 'marcar', label: 'Marcar', I: CalendarDays },
  ];

  return (
    <ToastProvider>
      <div style={style} className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0B0B0C]/90 px-5 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2.5">
            <Badge brand={brand} size={38} />
            <div className="min-w-0">
              <p className="kx truncate text-[15px]">{brand.name}</p>
              <p className="text-[10px] text-[#71717A]">feito com KFit</p>
            </div>
          </div>
          <button type="button" aria-label="Sair da conta" title="Sair da conta" onClick={logout} className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#17171B] text-[#D4D4D8]">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </header>
        <main className="flex flex-1 flex-col gap-4 px-5 pb-28 pt-4 animate-[kIn_.3s_ease]" key={tab}>
          {tab === 'inicio' && <Inicio ctx={ctx} />}
          {tab === 'treino' && <Treino ctx={ctx} initial={workoutId} />}
          {tab === 'evolucao' && <Evolucao ctx={ctx} />}
          {tab === 'marcar' && <Marcar ctx={ctx} />}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#0B0B0C]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto flex max-w-[560px]">
            {tabs.map(({ k, label, I }) => (
              <button key={k} type="button" onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined} className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${tab === k ? 'text-[var(--tc2)]' : 'text-[#71717A]'}`}>
                <I className="h-[22px] w-[22px]" />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </ToastProvider>
  );
}
