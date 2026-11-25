'use client';

import { useState } from 'react';
import { CalendarDays, Check, Flame, Play } from 'lucide-react';
import { api, ApiErr, brl, Card, ddmm, Spinner, useData, useToast, WEEK } from '../kit';
import { Badge, type Ctx } from './app';

type Home = {
  me: { firstName: string };
  workout: { id: string; name: string; total: number; done: number; finished: boolean } | null;
  week: { day: string; done: boolean; today: boolean }[];
  streak: number;
  water: number;
  weight: { now: number; diff: number | null; since: string | null; series: number[] } | null;
  pay: { kind: string; label: string; amountCents: number; dueDate: string; pixKey: string } | null;
  note: { id: string; text: string; reaction: string | null; at: string } | null;
  booking: { day: string; time: string; status: string } | null;
};

const dateLine = () => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Recife' }).format(new Date());

function Ring({ r, p, color }: { r: number; p: number; color: string }) {
  const c = 2 * Math.PI * r;
  return (
    <>
      <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
      <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, p)))} style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)' }} />
    </>
  );
}

export function Inicio({ ctx }: { ctx: Ctx }) {
  const { data, error, setData } = useData<Home>(`/api/a/${ctx.slug}/me`, ctx.auth);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;

  const w = data.workout;
  const pct = w && w.total ? Math.round((w.done / w.total) * 100) : 0;

  const water = async (cups: number) => {
    if (busy) return;
    setBusy(true);
    setData({ ...data, water: cups });
    try {
      await api(`/api/a/${ctx.slug}/agua`, 'POST', { cups });
      if (cups === 8) toast('Meta de água batida!');
    } catch (e) {
      ctx.auth(e as ApiErr);
      toast((e as ApiErr).message);
    } finally {
      setBusy(false);
    }
  };
  const react = async (reaction: string) => {
    if (!data.note) return;
    setData({ ...data, note: { ...data.note, reaction } });
    try {
      await api(`/api/a/${ctx.slug}/recado`, 'POST', { id: data.note.id, reaction });
      toast('Seu personal vai ver sua resposta');
    } catch (e) {
      ctx.auth(e as ApiErr);
    }
  };

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] capitalize text-[#A1A1AA]">{dateLine()}</p>
          <h1 className="kx text-[27px]">Bora, {data.me.firstName}!</h1>
        </div>
        {data.streak > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-orange-400/15 px-3 py-1.5 text-[13px] font-bold text-orange-300">
            <Flame className="h-4 w-4 fill-current" /> {data.streak} seguidos
          </span>
        )}
      </div>

      {w ? (
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-[24px] p-5 text-white" style={{ background: 'linear-gradient(140deg, color-mix(in srgb, var(--tc) 70%, black), var(--tc) 60%, var(--tc2))', boxShadow: '0 18px 40px -18px var(--tc)' }}>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">{w.finished ? 'Treino de hoje · concluído' : w.done ? 'Treino de hoje · em andamento' : 'Treino de hoje'}</span>
          <p className="kx text-[26px] leading-tight">{w.finished ? 'Mandou bem! Treino feito.' : w.name}</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">{w.total} exercícios</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
              {w.done} de {w.total} feitos
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
          </div>
          <button type="button" onClick={() => ctx.go('treino', w.id)} className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-bold text-[#0B0B0C] active:scale-[.98]">
            <Play className="h-4 w-4 fill-current" /> {w.finished ? 'Ver o treino' : w.done ? 'Continuar treino' : 'Começar treino'}
          </button>
        </div>
      ) : (
        <Card>
          <p className="text-sm text-[#A1A1AA]">Seu personal ainda está montando o seu treino. Assim que ficar pronto, ele aparece aqui.</p>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-semibold">Sua semana</span>
          <span className="text-xs text-[#A1A1AA]">{data.week.filter((d) => d.done).length} treinos</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {data.week.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#71717A]">{WEEK[new Date(d.day + 'T12:00:00').getDay()][0]}</span>
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold ${d.done ? 'bg-[var(--tc)] text-white' : d.today ? 'border-2 border-[var(--tc2)]' : 'text-[#52525B]'}`}
              >
                {d.done ? <Check className="h-4 w-4" strokeWidth={3.5} /> : Number(d.day.slice(8, 10))}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <svg width="112" height="112" viewBox="0 0 112 112" className="flex-none -rotate-90" aria-hidden="true">
          <Ring r={48} p={w && w.total ? w.done / w.total : 0} color="var(--tc2)" />
          <Ring r={35} p={data.water / 8} color="#7DD3FC" />
        </svg>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--tc2)]" />
            <span className="flex-1">
              <span className="block text-xs text-[#A1A1AA]">Treino</span>
              <b className="text-sm">{w ? `${w.done} de ${w.total} exercícios` : '—'}</b>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7DD3FC]" />
            <span className="flex-1">
              <span className="block text-xs text-[#A1A1AA]">Água</span>
              <b className="text-sm">{data.water} de 8 copos</b>
            </span>
            <button type="button" aria-label="Adicionar um copo de água" disabled={data.water >= 8} onClick={() => water(data.water + 1)} className="h-9 rounded-xl bg-white/[0.08] px-3 text-xs font-bold disabled:opacity-40">
              + copo
            </button>
          </div>
        </div>
      </Card>

      {data.note && (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Badge brand={ctx.brand} size={36} />
            <span>
              <span className="block text-sm font-semibold">Recado do seu personal</span>
              <span className="text-[11px] text-[#71717A]">{new Date(data.note.at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
            </span>
          </div>
          <p className="rounded-[4px_16px_16px_16px] bg-[#1B1B21] px-4 py-3 text-sm leading-relaxed text-[#E4E4E7]">{data.note.text}</p>
          <div className="flex gap-2">
            {[
              ['👍', 'Combinado'],
              ['💪', 'Bora!'],
              ['❤️', 'Valeu'],
            ].map(([e, t]) => (
              <button key={e} type="button" onClick={() => react(e)} aria-pressed={data.note!.reaction === e} className={`h-10 flex-1 rounded-xl text-[13px] font-semibold ${data.note!.reaction === e ? 'bg-[var(--tc)] text-white' : 'border border-white/12 text-[#D4D4D8]'}`}>
                {e} {t}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={() => ctx.go('evolucao')} className="flex flex-col gap-1 rounded-[18px] bg-[#141418] p-3.5 text-left">
          <span className="text-xs text-[#A1A1AA]">Peso</span>
          <span className="kx text-xl">{data.weight ? `${String(data.weight.now).replace('.', ',')} kg` : '—'}</span>
          <span className="text-xs font-bold text-emerald-300">
            {data.weight?.diff ? `${data.weight.diff > 0 ? '+' : ''}${String(data.weight.diff).replace('.', ',')} kg desde ${ddmm(data.weight.since!)}` : 'ver evolução'}
          </span>
        </button>
        <div className="flex flex-col gap-1 rounded-[18px] bg-[#141418] p-3.5">
          <span className="text-xs text-[#A1A1AA]">Mensalidade</span>
          <span className={`kx text-xl ${data.pay?.kind === 'late' ? 'text-red-300' : data.pay?.kind === 'warn' ? 'text-amber-200' : 'text-emerald-300'}`}>
            {data.pay ? (data.pay.kind === 'ok' ? 'Em dia' : data.pay.kind === 'late' ? 'Atrasada' : 'A vencer') : '—'}
          </span>
          {data.pay && (
            <span className="text-xs text-[#A1A1AA]">
              {data.pay.kind === 'ok' ? 'Tudo certo' : `${brl(data.pay.amountCents)} · ${ddmm(data.pay.dueDate)}`}
            </span>
          )}
          {data.pay && data.pay.kind !== 'ok' && data.pay.pixKey && (
            <button
              type="button"
              className="mt-1 text-left text-xs font-bold text-[var(--tcL)]"
              onClick={() => {
                navigator.clipboard?.writeText(data.pay!.pixKey);
                toast('Chave Pix copiada');
              }}
            >
              Copiar Pix
            </button>
          )}
        </div>
      </div>

      <button type="button" onClick={() => ctx.go('marcar')} className="flex items-center gap-3 rounded-[18px] bg-[#141418] p-3.5 text-left">
        <CalendarDays className="h-6 w-6 text-[var(--tcL)]" />
        <span className="flex-1 text-sm">
          {data.booking ? (
            <>
              Próximo horário: <b>{WEEK[new Date(data.booking.day + 'T12:00:00').getDay()]}, {ddmm(data.booking.day)} às {data.booking.time}</b>
              {data.booking.status === 'pedido' ? ' (aguardando o personal)' : ''}
            </>
          ) : (
            'Marcar um horário com o personal'
          )}
        </span>
      </button>
    </>
  );
}
