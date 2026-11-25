'use client';

import { ChevronRight, MessageCircle, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { api, ApiErr, brl, Btn, Card, Chip, ddmm, Eyebrow, Spinner, Title, useData, useToast, WEEK } from '../kit';
import type { Nav } from './painel';

type Dash = {
  kpis: { todayCount: number; students: number; toReceive: number; toReceiveCents: number; late: number };
  today: { id: string; time: string; name: string; status: string }[];
  requests: { id: string; day: string; time: string; name: string }[];
  missing: { id: string; name: string; phone: string; days: number | null; never: boolean }[];
  alerts: { studentId: string; name: string; exercise: string; verdict: string; detail: string }[];
};

const hello = () => {
  const h = Number(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Recife' }).format(new Date()));
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
};
const todayLabel = () => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Recife' }).format(new Date());

export function Hoje({ nav }: { nav: Nav }) {
  const { data, error, reload } = useData<Dash>('/api/p/hoje', nav.auth);
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;

  const answer = async (id: string, status: 'confirmado' | 'cancelado') => {
    setBusy(id);
    try {
      await api(`/api/p/agenda/reservas/${id}`, 'POST', { status });
      toast(status === 'confirmado' ? 'Horário confirmado' : 'Pedido recusado');
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    } finally {
      setBusy(null);
    }
  };

  const invite = (m: Dash['missing'][number]) => {
    const text = m.never
      ? `Oi, ${m.name.split(' ')[0]}! Seu app de treino está te esperando: ${location.origin}/a/${nav.me.studio.slug} 💪`
      : `Oi, ${m.name.split(' ')[0]}! Senti sua falta nos treinos. Bora voltar esta semana? Me diz o melhor horário que eu já reservo pra você 💪`;
    window.open(`https://wa.me/55${m.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div>
        <p className="text-[13px] capitalize text-[#A1A1AA]">{todayLabel()}</p>
        <Title>
          {hello()}, {nav.me.staff.firstName}
        </Title>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          ['Treinos hoje', data.kpis.todayCount],
          ['Alunos ativos', data.kpis.students],
          ['A receber', data.kpis.toReceive],
        ].map(([l, v]) => (
          <Card key={l as string} className="p-3.5">
            <p className="text-[11px] text-[#A1A1AA]">{l}</p>
            <p className="kx mt-1 text-[24px]">{v}</p>
          </Card>
        ))}
      </div>

      {data.requests.length > 0 && (
        <Card className="flex flex-col gap-3 border border-[var(--tc2)]/40">
          <Eyebrow className="text-[var(--tcL)]">Pedidos de horário</Eyebrow>
          {data.requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-[#A1A1AA]">
                  {WEEK[new Date(r.day + 'T12:00:00').getDay()]}, {ddmm(r.day)} às {r.time}
                </p>
              </div>
              <Btn kind="ghost" className="min-h-9 px-3 text-xs" busy={busy === r.id} onClick={() => answer(r.id, 'cancelado')}>
                Recusar
              </Btn>
              <Btn className="min-h-9 px-3 text-xs" busy={busy === r.id} onClick={() => answer(r.id, 'confirmado')}>
                Aceitar
              </Btn>
            </div>
          ))}
        </Card>
      )}

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Eyebrow>Hoje na agenda</Eyebrow>
          <button className="text-xs font-semibold text-[var(--tcL)]" onClick={() => nav.go('agenda')}>
            Ver semana
          </button>
        </div>
        {data.today.length === 0 && <p className="text-sm text-[#A1A1AA]">Nenhum horário marcado para hoje.</p>}
        {data.today.map((t) => (
          <div key={t.id} className="flex items-center gap-3 border-b border-white/[0.06] py-2 last:border-0">
            <span className="kx w-14 text-base text-[var(--tcL)]">{t.time}</span>
            <span className="flex-1 text-sm font-semibold">{t.name}</span>
            {t.status === 'pedido' && <Chip kind="warn">Pedido</Chip>}
          </div>
        ))}
      </Card>

      {nav.me.features.ai && (
        <button
          type="button"
          onClick={() => nav.go('ia')}
          className="flex items-center gap-3 rounded-[20px] bg-gradient-to-br from-[#1D4ED8] to-[var(--tc)] p-4 text-left text-white"
        >
          <Sparkles className="h-6 w-6 flex-none" />
          <span className="flex-1">
            <span className="block text-sm font-semibold">Assistente KFit</span>
            <span className="text-xs text-white/85">Monte treinos, ache aluno sumido e escreva mensagens.</span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {data.alerts.length > 0 && (
        <Card className="flex flex-col gap-2.5 border border-amber-300/30">
          <div className="flex items-center justify-between">
            <Eyebrow className="text-amber-200">Cargas fora da meta</Eyebrow>
            <span className="text-xs text-[#A1A1AA]">{data.alerts.length} nesta semana</span>
          </div>
          {data.alerts.slice(0, 6).map((a, i) => (
            <button key={i} type="button" onClick={() => nav.go('aluno', a.studentId)} className="flex gap-3 rounded-xl bg-[#1B1B21] p-3 text-left">
              {a.verdict === 'abaixo' ? <TrendingDown className="mt-0.5 h-5 w-5 flex-none text-red-300" /> : <TrendingUp className="mt-0.5 h-5 w-5 flex-none text-emerald-300" />}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {a.name} · {a.exercise}
                </span>
                <span className="block text-xs leading-snug text-[#A1A1AA]">{a.detail}</span>
              </span>
            </button>
          ))}
        </Card>
      )}

      {data.missing.length > 0 && (
        <Card className="flex flex-col gap-2.5">
          <Eyebrow>Precisam de atenção</Eyebrow>
          {data.missing.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => nav.go('aluno', m.id)}>
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-[#A1A1AA]">{m.never ? 'Ainda não treinou pelo app' : `Sem treinar há ${m.days} dias`}</p>
              </button>
              <Btn kind="green" className="min-h-9 px-3 text-xs" onClick={() => invite(m)}>
                <MessageCircle className="h-4 w-4" /> Chamar
              </Btn>
            </div>
          ))}
        </Card>
      )}

      {data.kpis.toReceive > 0 && (
        <button type="button" onClick={() => nav.go('financeiro')} className="flex items-center justify-between rounded-[20px] bg-[#141418] p-4 text-left">
          <span>
            <span className="block text-sm font-semibold">Mensalidades em aberto</span>
            <span className="text-xs text-[#A1A1AA]">
              {data.kpis.toReceive} no mês · {brl(data.kpis.toReceiveCents)}
              {data.kpis.late ? ` · ${data.kpis.late} atrasada${data.kpis.late > 1 ? 's' : ''}` : ''}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-[#71717A]" />
        </button>
      )}
    </>
  );
}
