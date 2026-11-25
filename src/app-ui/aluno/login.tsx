'use client';

import { useState } from 'react';
import { Lock, MessageCircle, ShieldCheck } from 'lucide-react';
import { api, ApiErr, Btn, DemoWhatsApp, ErrorText, Field, inputCls, passwordRules, phoneMask, Rules } from '../kit';
import { Badge, type Brand } from './app';

type Step = 'phone' | 'code' | 'password' | 'create' | 'blocked';

export function StudentLogin({ slug, brand, onDone, initialError }: { slug: string; brand: Brand; onDone: () => void; initialError?: string }) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState<'first' | 'reset'>('first');
  const [ticket, setTicket] = useState('');
  const [pw, setPw] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [first, setFirst] = useState('');
  const [mask, setMask] = useState('');
  const [demo, setDemo] = useState<string | undefined>();
  const [err, setErr] = useState(initialError ?? '');
  const [busy, setBusy] = useState(false);
  const base = `/api/a/${slug}/auth`;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
    } catch (e) {
      const ae = e as ApiErr;
      if (ae.data.need === 'blocked') setStep('blocked');
      setErr(ae.message);
    } finally {
      setBusy(false);
    }
  };

  const gotCode = (r: { phoneMask?: string; demoText?: string; purpose?: 'first' | 'reset' }) => {
    setMask(r.phoneMask ?? '');
    setDemo(r.demoText);
    setPurpose(r.purpose ?? 'first');
    setCode('');
    setStep('code');
  };

  const Hero = ({ icon, title, sub }: { icon: 'brand' | 'chat' | 'shield' | 'lock'; title: string; sub: string }) => (
    <div className="flex flex-col items-center gap-2.5 text-center">
      {icon === 'brand' ? (
        <Badge brand={brand} size={68} />
      ) : (
        <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--tc)]/15 text-[var(--tcL)]">
          {icon === 'chat' ? <MessageCircle className="h-8 w-8" /> : icon === 'shield' ? <ShieldCheck className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
        </span>
      )}
      <h1 className="kx mt-1 text-[26px]">{title}</h1>
      <p className="max-w-[330px] text-sm leading-relaxed text-[#A1A1AA]">{sub}</p>
    </div>
  );

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col gap-5 px-5 pb-8 pt-8">
      {demo && step === 'code' && <DemoWhatsApp from={brand.name} text={demo} />}
      {children}
    </div>
  );

  if (step === 'phone')
    return shell(
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ step: string; firstName?: string; phoneMask?: string; demoText?: string; purpose?: 'first' }>(`${base}/inicio`, 'POST', { phone });
            if (r.step === 'code') gotCode(r);
            else {
              setFirst(r.firstName ?? '');
              setPw('');
              setStep('password');
            }
          });
        }}
      >
        <Hero icon="brand" title="Entrar no app" sub={`Treinos do ${brand.name}. Digite o número de WhatsApp que você passou para o seu personal.`} />
        <Field label="Seu WhatsApp">
          <input className={inputCls} inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(phoneMask(e.target.value))} placeholder="(87) 9 0000-0000" />
        </Field>
        <ErrorText>{err}</ErrorText>
        <Btn type="submit" busy={busy} disabled={phone.replace(/\D/g, '').length < 10} className="h-14 text-base">
          Continuar
        </Btn>
        <p className="mt-auto rounded-2xl bg-[#141418] p-3.5 text-xs leading-relaxed text-[#A1A1AA]">
          Primeira vez? Vamos mandar um código no seu WhatsApp para confirmar que o número é seu.
        </p>
      </form>,
    );

  if (step === 'code')
    return shell(
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ ticket: string }>(`${base}/codigo`, 'POST', { phone, code, purpose });
            setTicket(r.ticket);
            setP1('');
            setP2('');
            setStep('create');
          });
        }}
      >
        <Hero icon="chat" title="Digite o código" sub={`Mandamos 6 números no WhatsApp ${mask}.`} />
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
        <button
          type="button"
          className="mx-auto min-h-10 text-sm font-semibold text-[var(--tcL)]"
          onClick={() => run(async () => gotCode(await api(`${base}/${purpose === 'first' ? 'inicio' : 'esqueci'}`, 'POST', { phone })))}
        >
          Não chegou? Mandar de novo
        </button>
        <button type="button" className="mx-auto min-h-10 text-sm text-[#A1A1AA]" onClick={() => setStep('phone')}>
          Voltar
        </button>
      </form>,
    );

  if (step === 'create') {
    const rules = passwordRules(p1, p2);
    return shell(
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            await api(`${base}/senha`, 'POST', { phone, ticket, password: p1 });
            onDone();
          });
        }}
      >
        <Hero icon="shield" title={purpose === 'reset' ? 'Crie uma senha nova' : 'Crie sua senha'} sub="Daqui pra frente você entra só com o telefone e essa senha." />
        <Field label="Senha">
          <input className={inputCls} type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} />
        </Field>
        <Field label="Repita a senha">
          <input className={inputCls} type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} />
        </Field>
        <Rules items={rules} />
        <ErrorText>{err}</ErrorText>
        <Btn type="submit" busy={busy} disabled={!rules.every((r) => r.ok)} className="h-14 text-base">
          Criar senha e entrar
        </Btn>
        <p className="rounded-2xl bg-[#141418] p-3.5 text-xs leading-relaxed text-[#A1A1AA]">A senha é guardada embaralhada. Nem o personal nem a TresK conseguem ver.</p>
      </form>,
    );
  }

  if (step === 'blocked')
    return shell(
      <div className="mt-6 flex flex-col gap-4">
        <Hero icon="lock" title="Login travado por 15 minutos" sub="Erraram a senha 5 vezes. Para proteger seus dados, ninguém entra agora. Se foi você, recupere pelo WhatsApp." />
        <Btn className="h-14 text-base" busy={busy} onClick={() => run(async () => gotCode(await api(`${base}/esqueci`, 'POST', { phone })))}>
          Recuperar pelo WhatsApp
        </Btn>
        <button type="button" className="mx-auto min-h-10 text-sm text-[#A1A1AA]" onClick={() => (setErr(''), setStep('phone'))}>
          Voltar
        </button>
      </div>,
    );

  // password
  return shell(
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          await api(`${base}/entrar`, 'POST', { phone, password: pw });
          onDone();
        });
      }}
    >
      <Hero icon="brand" title={`Oi, ${first}!`} sub="Digite sua senha para entrar." />
      <Field label="Senha">
        <input className={inputCls} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </Field>
      <ErrorText>{err}</ErrorText>
      <Btn type="submit" busy={busy} disabled={!pw} className="h-14 text-base">
        Entrar
      </Btn>
      <button type="button" className="mx-auto min-h-10 text-sm font-semibold text-[var(--tcL)]" onClick={() => run(async () => gotCode(await api(`${base}/esqueci`, 'POST', { phone })))}>
        Esqueci minha senha
      </button>
      <button type="button" className="mx-auto min-h-10 text-sm text-[#A1A1AA]" onClick={() => (setErr(''), setStep('phone'))}>
        Não é você? Trocar número
      </button>
    </form>,
  );
}
