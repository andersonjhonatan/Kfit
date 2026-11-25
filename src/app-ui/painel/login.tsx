'use client';

import { useState } from 'react';
import { Lock, MessageCircle, ShieldCheck } from 'lucide-react';
import { api, ApiErr, Btn, DemoWhatsApp, ErrorText, Field, inputCls, passwordRules, phoneMask, PinPad, Rules } from '../kit';

type Step = 'login' | 'code' | 'forgot' | 'forgot_code' | 'new_password';

function Hero({ icon, title, sub }: { icon: 'lock' | 'chat' | 'shield'; title: string; sub: string }) {
  const I = icon === 'lock' ? Lock : icon === 'chat' ? MessageCircle : ShieldCheck;
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--tc)]/15 text-[var(--tcL)]">
        <I className="h-8 w-8" />
      </span>
      <h1 className="kx mt-1 text-[26px]">{title}</h1>
      <p className="max-w-[330px] text-sm leading-relaxed text-[#A1A1AA]">{sub}</p>
    </div>
  );
}

/** Entrada do personal: telefone + senha; num aparelho novo, código no WhatsApp. */
export function StaffLogin({ onDone, initialError }: { onDone: () => void; initialError?: string }) {
  const [step, setStep] = useState<Step>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [ticket, setTicket] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [mask, setMask] = useState('');
  const [demo, setDemo] = useState<string | undefined>();
  const [err, setErr] = useState(initialError ?? '');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
    } catch (e) {
      setErr((e as ApiErr).message);
    } finally {
      setBusy(false);
    }
  };

  const gotCode = (r: { phoneMask?: string; demoText?: string }, next: Step) => {
    setMask(r.phoneMask ?? '');
    setDemo(r.demoText);
    setCode('');
    setStep(next);
  };

  const wrap = (children: React.ReactNode) => (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col gap-5 px-5 pb-8 pt-6">
      <img src="/icon.svg" alt="" className="h-9 w-9 self-start opacity-90" />
      {demo && (step === 'code' || step === 'forgot_code') && <DemoWhatsApp from="KFit · Segurança" text={demo} />}
      {children}
    </div>
  );

  if (step === 'login')
    return wrap(
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ step: string; phoneMask?: string; demoText?: string }>('/api/auth/personal/entrar', 'POST', { phone, password });
            if (r.step === 'code') gotCode(r, 'code');
            else onDone();
          });
        }}
      >
        <Hero icon="lock" title="Entrar no KFit" sub="Área do personal. Aqui ficam os dados de todos os seus alunos, por isso a entrada é protegida." />
        <Field label="Seu WhatsApp">
          <input className={inputCls} inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(phoneMask(e.target.value))} placeholder="(87) 9 0000-0000" />
        </Field>
        <Field label="Senha">
          <input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <ErrorText>{err}</ErrorText>
        <Btn type="submit" busy={busy} disabled={!password || phone.replace(/\D/g, '').length < 10} className="h-14 text-base">
          Entrar
        </Btn>
        <button type="button" className="mx-auto min-h-10 text-sm font-semibold text-[var(--tcL)]" onClick={() => (setErr(''), setStep('forgot'))}>
          Esqueci minha senha
        </button>
      </form>,
    );

  if (step === 'forgot')
    return wrap(
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => gotCode(await api('/api/auth/personal/esqueci', 'POST', { phone }), 'forgot_code'));
        }}
      >
        <Hero icon="chat" title="Recuperar a senha" sub="Mandamos um código no seu WhatsApp para você criar uma senha nova." />
        <Field label="Seu WhatsApp">
          <input className={inputCls} inputMode="tel" value={phone} onChange={(e) => setPhone(phoneMask(e.target.value))} />
        </Field>
        <ErrorText>{err}</ErrorText>
        <Btn type="submit" busy={busy} className="h-14 text-base">
          Mandar código
        </Btn>
        <button type="button" className="mx-auto min-h-10 text-sm font-semibold text-[var(--tcL)]" onClick={() => setStep('login')}>
          Voltar
        </button>
      </form>,
    );

  if (step === 'code' || step === 'forgot_code')
    return wrap(
      <form
        className="mt-2 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ step: string; ticket?: string }>('/api/auth/personal/codigo', 'POST', { phone, code, purpose: step === 'code' ? 'device' : 'reset' });
            if (r.ticket) {
              setTicket(r.ticket);
              setStep('new_password');
            } else onDone();
          });
        }}
      >
        <Hero icon="chat" title="Digite o código" sub={`${step === 'code' ? 'Aparelho novo. ' : ''}Mandamos 6 números no WhatsApp ${mask}.`} />
        <Field label="Código de 6 números">
          <input
            className={`${inputCls} h-16 text-center text-[26px] font-bold tracking-[0.5em]`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </Field>
        <ErrorText>{err}</ErrorText>
        <Btn type="submit" busy={busy} disabled={code.length !== 6} className="h-14 text-base">
          Confirmar
        </Btn>
        <button type="button" className="mx-auto min-h-10 text-sm font-semibold text-[var(--tcL)]" onClick={() => setStep('login')}>
          Voltar
        </button>
        <p className="mt-auto rounded-2xl bg-[#141418] p-3.5 text-xs leading-relaxed text-[#A1A1AA]">
          O código vale por 10 minutos e só pode ser usado uma vez. Ninguém do KFit vai pedir esse código para você.
        </p>
      </form>,
    );

  // new_password
  const rules = passwordRules(p1, p2);
  return wrap(
    <form
      className="mt-2 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          await api('/api/auth/personal/senha', 'POST', { phone, ticket, password: p1 });
          onDone();
        });
      }}
    >
      <Hero icon="shield" title="Crie uma senha nova" sub="Os outros aparelhos serão desconectados." />
      <Field label="Senha nova">
        <input className={inputCls} type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} />
      </Field>
      <Field label="Repita a senha">
        <input className={inputCls} type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} />
      </Field>
      <Rules items={rules} />
      <ErrorText>{err}</ErrorText>
      <Btn type="submit" busy={busy} disabled={!rules.every((r) => r.ok)} className="h-14 text-base">
        Salvar senha
      </Btn>
    </form>,
  );
}

/** App bloqueado (PIN) ou criação do PIN. */
export function PinScreen({ mode, name, onDone, onLogout }: { mode: 'pin' | 'pin_create'; name: string; onDone: () => void; onLogout: () => void }) {
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const change = async (v: string) => {
    setPin(v);
    setErr('');
    if (v.length < 4) return;
    setBusy(true);
    try {
      if (mode === 'pin') {
        await api('/api/auth/personal/desbloquear', 'POST', { pin: v });
        onDone();
      } else if (!first) {
        setFirst(v);
        setPin('');
      } else if (first !== v) {
        setErr('Os PINs não bateram. Comece de novo.');
        setFirst(null);
        setPin('');
      } else {
        await api('/api/auth/personal/pin', 'POST', { pin: v });
        onDone();
      }
    } catch (e) {
      const ae = e as ApiErr;
      setErr(ae.message);
      setPin('');
      setFirst(null);
      if (ae.status === 401) setTimeout(onLogout, 1500);
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'pin' ? name : first ? 'Repita o PIN' : 'Crie um PIN de 4 números';
  const sub =
    mode === 'pin'
      ? 'App bloqueado. Digite seu PIN.'
      : first
        ? 'Só para confirmar.'
        : 'O app pede esse PIN sempre que for aberto. Se alguém pegar seu celular, não vê os dados dos alunos.';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center gap-6 px-5 pb-8 pt-14">
      <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--tc)]/15 text-[var(--tcL)]">
        {mode === 'pin' ? <Lock className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
      </span>
      <div className="text-center">
        <h1 className="kx text-[26px]">{title}</h1>
        <p className="mx-auto mt-1 max-w-[320px] text-sm leading-relaxed text-[#A1A1AA]">{sub}</p>
      </div>
      <PinPad value={pin} onChange={busy ? () => {} : change} />
      <ErrorText>{err}</ErrorText>
      {mode === 'pin' && (
        <button type="button" onClick={onLogout} className="min-h-10 text-sm font-semibold text-[var(--tcL)]">
          Esqueci o PIN · entrar com a senha
        </button>
      )}
    </div>
  );
}
