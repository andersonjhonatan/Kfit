'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Home, LayoutGrid, Lock, Sparkles, Users } from 'lucide-react';
import { api, ApiErr, Spinner, ToastProvider } from '../kit';
import { PinScreen, StaffLogin } from './login';
import { Hoje } from './hoje';
import { Alunos } from './alunos';
import { AlunoDetalhe } from './aluno';
import { Agenda } from './agenda';
import { Assistente } from './ia';
import { Mais, Financeiro, Marca, Seguranca } from './mais';

export type Me = {
  staff: { name: string; firstName: string; phone: string; lockAfterMin: number };
  studio: { slug: string; name: string; tagline: string; color: string; mono: string; shape: string; isDemo: boolean; plan: string; planName: string; access: string; trialEndsAt: string | null; pixKey: string };
  features: { ai: boolean };
};

export type Nav = {
  go: (screen: Screen, studentId?: string) => void;
  auth: (e: ApiErr) => void;
  me: Me;
  reloadMe: () => void;
};

export type Screen = 'hoje' | 'agenda' | 'alunos' | 'aluno' | 'ia' | 'mais' | 'financeiro' | 'marca' | 'seguranca';

type State = { k: 'loading' } | { k: 'login'; msg?: string } | { k: 'pin' | 'pin_create'; name: string } | { k: 'in'; me: Me } | { k: 'error'; msg: string };

export function Painel() {
  const [st, setSt] = useState<State>({ k: 'loading' });
  const [screen, setScreen] = useState<Screen>('hoje');
  const [studentId, setStudentId] = useState<string | null>(null);
  const lastAct = useRef(Date.now());

  const check = useCallback(async () => {
    try {
      const me = await api<Me>('/api/p/me');
      setSt({ k: 'in', me });
    } catch (e) {
      const ae = e as ApiErr;
      if (ae.status === 401) setSt({ k: 'login', msg: ae.message === 'Entre na sua conta.' ? undefined : ae.message });
      else if (ae.status === 423) setSt({ k: (ae.data.need as 'pin' | 'pin_create') ?? 'pin', name: String(ae.data.name ?? '') });
      else setSt({ k: 'error', msg: ae.message });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const auth = useCallback(
    (e: ApiErr) => {
      if (e.status === 401 || e.status === 423) check();
    },
    [check],
  );

  const lock = useCallback(async () => {
    await api('/api/auth/personal/bloquear', 'POST').catch(() => {});
    check();
  }, [check]);

  // bloqueio automático: parado por X minutos, ou voltando ao app depois disso
  const lockAfter = st.k === 'in' ? st.me.staff.lockAfterMin : 0;
  useEffect(() => {
    if (!lockAfter) return;
    const limitMs = Math.max(1, lockAfter) * 60_000;
    const touch = () => (lastAct.current = Date.now());
    const tick = window.setInterval(() => {
      if (Date.now() - lastAct.current > limitMs) lock();
    }, 10_000);
    const vis = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastAct.current > limitMs) lock();
    };
    ['pointerdown', 'keydown', 'scroll'].forEach((ev) => window.addEventListener(ev, touch, { passive: true }));
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.clearInterval(tick);
      ['pointerdown', 'keydown', 'scroll'].forEach((ev) => window.removeEventListener(ev, touch));
      document.removeEventListener('visibilitychange', vis);
    };
  }, [lockAfter, lock]);

  const logout = async () => {
    await api('/api/auth/personal/sair', 'POST').catch(() => {});
    setSt({ k: 'login' });
    setScreen('hoje');
  };

  const go = (s: Screen, id?: string) => {
    if (id) setStudentId(id);
    setScreen(s);
    window.scrollTo({ top: 0 });
  };

  if (st.k === 'loading') return <Spinner />;
  if (st.k === 'error')
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center text-sm text-red-300">
        {st.msg}
        <button className="mt-4 text-[var(--tcL)]" onClick={check}>
          Tentar de novo
        </button>
      </div>
    );
  if (st.k === 'login') return <StaffLogin onDone={check} initialError={st.msg} />;
  if (st.k !== 'in') return <PinScreen mode={st.k} name={st.name} onDone={() => (lastAct.current = Date.now(), check())} onLogout={logout} />;

  const me = st.me;
  const nav: Nav = { go, auth, me, reloadMe: check };
  const tabs: { k: Screen; label: string; I: typeof Home }[] = [
    { k: 'hoje', label: 'Hoje', I: Home },
    { k: 'agenda', label: 'Agenda', I: CalendarDays },
    { k: 'alunos', label: 'Alunos', I: Users },
    ...(me.features.ai ? [{ k: 'ia' as Screen, label: 'IA', I: Sparkles }] : []),
    { k: 'mais', label: 'Mais', I: LayoutGrid },
  ];
  const active = screen === 'aluno' ? 'alunos' : ['financeiro', 'marca', 'seguranca'].includes(screen) ? 'mais' : screen;

  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0B0B0C]/90 px-5 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src="/icon.svg" alt="KFit" className="h-8 w-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{me.studio.name}</p>
              <p className="text-[11px] text-[#71717A]">
                Plano {me.studio.planName}
                {me.studio.isDemo ? ' · demonstração' : ''}
              </p>
            </div>
          </div>
          <button type="button" aria-label="Bloquear o app" title="Bloquear o app" onClick={lock} className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#17171B] text-[#D4D4D8]">
            <Lock className="h-[18px] w-[18px]" />
          </button>
        </header>

        {me.studio.access !== 'active' && (
          <div className="mx-5 mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-[13px] leading-snug text-amber-100">
            Seu período de uso terminou. Os dados continuam aqui e você ainda consulta tudo; para voltar a editar, fale com a TresK.
          </div>
        )}

        <main className="flex flex-1 flex-col gap-4 px-5 pb-28 pt-4 animate-[kIn_.3s_ease]" key={screen + (studentId ?? '')}>
          {screen === 'hoje' && <Hoje nav={nav} />}
          {screen === 'agenda' && <Agenda nav={nav} />}
          {screen === 'alunos' && <Alunos nav={nav} />}
          {screen === 'aluno' && studentId && <AlunoDetalhe nav={nav} id={studentId} />}
          {screen === 'ia' && <Assistente nav={nav} />}
          {screen === 'mais' && <Mais nav={nav} onLogout={logout} />}
          {screen === 'financeiro' && <Financeiro nav={nav} />}
          {screen === 'marca' && <Marca nav={nav} />}
          {screen === 'seguranca' && <Seguranca nav={nav} onLogout={logout} onLock={lock} />}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#0B0B0C]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto flex max-w-[560px]">
            {tabs.map(({ k, label, I }) => (
              <button
                key={k}
                type="button"
                onClick={() => go(k)}
                aria-current={active === k ? 'page' : undefined}
                className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active === k ? 'text-[var(--tc2)]' : 'text-[#71717A]'}`}
              >
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
