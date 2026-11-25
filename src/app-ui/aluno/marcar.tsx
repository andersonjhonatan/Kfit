'use client';

import { useState } from 'react';
import { api, ApiErr, Btn, Card, ddmm, Spinner, useData, useToast, WEEK } from '../kit';
import { Badge, type Ctx } from './app';

type D = { day: string; weekday: number; slots: { time: string; free: boolean; mine: string | null }[] };

export function Marcar({ ctx }: { ctx: Ctx }) {
  const { data, error, reload } = useData<{ days: D[] }>(`/api/a/${ctx.slug}/horarios`, ctx.auth);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;
  const days = data.days.filter((d) => d.slots.length);
  const cur = days.find((d) => d.day === day) ?? days[0];
  const mine = data.days.flatMap((d) => d.slots.filter((s) => s.mine).map((s) => ({ day: d.day, time: s.time, status: s.mine })));

  const request = async () => {
    if (!cur || !time) return;
    setBusy(true);
    try {
      await api(`/api/a/${ctx.slug}/horarios`, 'POST', { day: cur.day, time });
      toast('Pedido enviado. O personal confirma pelo app.');
      setTime(null);
      reload();
    } catch (e) {
      ctx.auth(e as ApiErr);
      toast((e as ApiErr).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card className="flex items-center gap-3">
        <Badge brand={ctx.brand} size={48} />
        <div>
          <p className="kx text-lg">{ctx.brand.name}</p>
          <p className="text-xs text-[#A1A1AA]">{ctx.brand.tagline}</p>
        </div>
      </Card>
      <h1 className="kx text-[25px]">Escolha um horário</h1>
      {mine.length > 0 && (
        <Card className="flex flex-col gap-1.5">
          {mine.map((m) => (
            <p key={m.day + m.time} className="text-sm">
              {WEEK[new Date(m.day + 'T12:00:00').getDay()]}, {ddmm(m.day)} às <b>{m.time}</b> · <span className={m.status === 'confirmado' ? 'text-emerald-300' : 'text-amber-200'}>{m.status === 'confirmado' ? 'confirmado' : 'aguardando o personal'}</span>
            </p>
          ))}
        </Card>
      )}
      {!cur ? (
        <Card>
          <p className="text-sm text-[#A1A1AA]">Sem horários abertos nos próximos dias.</p>
        </Card>
      ) : (
        <>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {days.map((d) => (
              <button key={d.day} type="button" onClick={() => (setDay(d.day), setTime(null))} className={`flex min-w-[58px] flex-col items-center rounded-2xl py-2.5 ${d.day === cur.day ? 'bg-[var(--tc)] text-white' : 'bg-[#141418]'}`}>
                <span className={`text-[11px] ${d.day === cur.day ? 'text-white/80' : 'text-[#71717A]'}`}>{WEEK[d.weekday]}</span>
                <span className="kx text-lg">{d.day.slice(8, 10)}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {cur.slots.map((s) => (
              <button
                key={s.time}
                type="button"
                disabled={!s.free || !!s.mine}
                onClick={() => setTime(s.time)}
                className={`h-12 rounded-xl text-[15px] font-semibold ${time === s.time ? 'bg-[var(--tc)] text-white' : s.mine ? 'border border-emerald-400/50 text-emerald-300' : s.free ? 'border border-white/15' : 'text-[#52525B] line-through'}`}
              >
                {s.time}
              </button>
            ))}
          </div>
          <Btn className="h-14 text-base" busy={busy} disabled={!time} onClick={request}>
            {time ? `Pedir ${WEEK[cur.weekday]}, ${ddmm(cur.day)} às ${time}` : 'Escolha um horário livre'}
          </Btn>
        </>
      )}
    </>
  );
}
