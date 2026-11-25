'use client';

import { useState } from 'react';
import { MessageCircle, Plus, Search } from 'lucide-react';
import { api, ApiErr, Btn, Chip, ErrorText, Field, inputCls, phoneMask, Sheet, Spinner, Title, useData, useToast } from '../kit';
import type { Nav } from './painel';

type Row = { id: string; name: string; phone: string; goal: string; days: string; status: string; access: string; pay: { kind: 'ok' | 'warn' | 'late'; label: string } };

export const initials = (n: string) =>
  n
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

export function Alunos({ nav }: { nav: Nav }) {
  const { data, error, reload } = useData<{ students: Row[] }>('/api/p/alunos', nav.auth);
  const [q, setQ] = useState('');
  const [novo, setNovo] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = data.students.filter((s) => (showInactive ? s.status !== 'ativo' : s.status === 'ativo')).filter((s) => !q || norm(s.name + ' ' + s.goal).includes(norm(q)));
  const active = data.students.filter((s) => s.status === 'ativo').length;

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <Title sub={`${active} ativos`}>Alunos</Title>
        <Btn onClick={() => setNovo(true)} className="min-h-10">
          <Plus className="h-4 w-4" /> Novo aluno
        </Btn>
      </div>
      <label className="relative">
        <span className="sr-only">Buscar aluno</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
        <input className={`${inputCls} pl-10`} placeholder="Buscar aluno ou objetivo" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="flex flex-col gap-2">
        {list.map((s) => (
          <button key={s.id} type="button" onClick={() => nav.go('aluno', s.id)} className="flex items-center gap-3 rounded-[18px] bg-[#141418] p-3 text-left">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[var(--tc)]/20 text-sm font-bold text-[var(--tcL)]">{initials(s.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{s.name}</span>
              <span className="block truncate text-xs text-[#A1A1AA]">
                {s.goal || 'Sem objetivo'}
                {s.days ? ` · ${s.days}` : ''}
              </span>
            </span>
            <span className="flex flex-col items-end gap-1">
              <Chip kind={s.pay.kind}>{s.pay.label}</Chip>
              {s.access === 'pendente' && <span className="text-[10px] text-[#71717A]">não entrou no app</span>}
              {s.access === 'pausado' && <span className="text-[10px] text-red-300">acesso pausado</span>}
            </span>
          </button>
        ))}
        {list.length === 0 && <p className="py-6 text-center text-sm text-[#A1A1AA]">{q ? 'Ninguém com esse nome.' : 'Nenhum aluno aqui ainda.'}</p>}
      </div>
      <button type="button" onClick={() => setShowInactive(!showInactive)} className="mx-auto min-h-10 text-xs font-semibold text-[#71717A]">
        {showInactive ? 'Ver alunos ativos' : 'Ver alunos inativos'}
      </button>
      <NovoAluno open={novo} onClose={() => setNovo(false)} nav={nav} onCreated={reload} />
    </>
  );
}

const GOALS = ['Emagrecimento', 'Hipertrofia', 'Condicionamento', 'Saúde e postura', 'Reabilitação', 'Performance'];
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function NovoAluno({ open, onClose, nav, onCreated }: { open: boolean; onClose: () => void; nav: Nav; onCreated: () => void }) {
  const toast = useToast();
  const empty = { name: '', phone: '', goal: '', sex: '', heightCm: '', days: [] as string[], planName: 'Mensal', price: '', dueDay: '10' };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; invite: string; name: string } | null>(null);
  const set = (k: keyof typeof empty, v: unknown) => setF((x) => ({ ...x, [k]: v }));

  const close = () => {
    setF(empty);
    setErr('');
    setDone(null);
    onClose();
  };

  const save = async () => {
    setBusy(true);
    setErr('');
    try {
      const r = await api<{ id: string; invite: string }>('/api/p/alunos', 'POST', {
        name: f.name,
        phone: f.phone,
        goal: f.goal,
        sex: f.sex,
        heightCm: f.heightCm ? Number(f.heightCm) : null,
        days: f.days.join(', '),
        planName: f.planName,
        priceCents: Math.round(Number(f.price.replace(/\./g, '').replace(',', '.') || 0) * 100),
        dueDay: Number(f.dueDay),
      });
      setDone({ ...r, name: f.name });
      onCreated();
      toast('Aluno cadastrado');
    } catch (e) {
      nav.auth(e as ApiErr);
      setErr((e as ApiErr).message);
    } finally {
      setBusy(false);
    }
  };

  const pill = (on: boolean) => `min-h-10 rounded-full px-3.5 text-[13px] font-semibold ${on ? 'bg-[var(--tc)] text-white' : 'border border-white/15 text-[#D4D4D8]'}`;

  return (
    <Sheet open={open} onClose={close} title={done ? 'Pronto!' : 'Novo aluno'}>
      {done ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-[#D4D4D8]">
            {done.name.split(' ')[0]} já pode entrar no app. Mande o convite: no primeiro acesso chega um código no WhatsApp dele para criar a senha.
          </p>
          <Btn kind="green" className="h-12" onClick={() => window.open(done.invite, '_blank')}>
            <MessageCircle className="h-4 w-4" /> Enviar convite no WhatsApp
          </Btn>
          <Btn kind="ghost" onClick={() => (close(), nav.go('aluno', done.id))}>
            Montar o treino
          </Btn>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Nome completo">
            <input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Maria Fernanda Silva" />
          </Field>
          <Field label="WhatsApp" hint="É com esse número que o aluno entra no app.">
            <input className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => set('phone', phoneMask(e.target.value))} placeholder="(87) 9 9999-9999" />
          </Field>
          <Field label="Objetivo">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button key={g} type="button" className={pill(f.goal === g)} onClick={() => set('goal', f.goal === g ? '' : g)}>
                  {g}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sexo (para a avaliação)">
              <div className="flex gap-2">
                {[
                  ['F', 'Fem.'],
                  ['M', 'Masc.'],
                ].map(([k, l]) => (
                  <button key={k} type="button" className={`${pill(f.sex === k)} flex-1`} onClick={() => set('sex', k)}>
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Altura (cm)">
              <input className={inputCls} inputMode="numeric" value={f.heightCm} onChange={(e) => set('heightCm', e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="165" />
            </Field>
          </div>
          <Field label="Dias de treino">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button key={d} type="button" className={pill(f.days.includes(d))} onClick={() => set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : DAYS.filter((x) => [...f.days, d].includes(x)))}>
                  {d}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Plano">
            <div className="flex flex-wrap gap-2">
              {['Mensal', 'Trimestral', 'Semestral', 'Avulso'].map((p) => (
                <button key={p} type="button" className={pill(f.planName === p)} onClick={() => set('planName', p)}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <input className={inputCls} inputMode="decimal" value={f.price} onChange={(e) => set('price', e.target.value.replace(/[^\d,]/g, ''))} placeholder="180,00" />
            </Field>
            <Field label="Vence todo dia">
              <input className={inputCls} inputMode="numeric" value={f.dueDay} onChange={(e) => set('dueDay', e.target.value.replace(/\D/g, '').slice(0, 2))} />
            </Field>
          </div>
          <ErrorText>{err}</ErrorText>
          <Btn className="h-12" busy={busy} onClick={save} disabled={f.name.trim().length < 3 || f.phone.replace(/\D/g, '').length < 10}>
            Cadastrar aluno
          </Btn>
        </div>
      )}
    </Sheet>
  );
}
