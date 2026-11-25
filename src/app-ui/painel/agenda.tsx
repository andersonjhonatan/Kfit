'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, ApiErr, Btn, Card, Chip, ddmm, Sheet, Spinner, Title, useData, useToast, WEEK } from '../kit';
import type { Nav } from './painel';

type Day = { day: string; weekday: number; slots: { time: string; capacity: number; bookings: { id: string; name: string; status: string }[] }[] };

const shift = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export function Agenda({ nav }: { nav: Nav }) {
  const [start, setStart] = useState<string | null>(null);
  const { data, error, reload } = useData<{ start: string; today: string; days: Day[] }>(`/api/p/agenda${start ? `?inicio=${start}` : ''}`, nav.auth);
  const [sel, setSel] = useState<string | null>(null);
  const [book, setBook] = useState<{ day: string; time: string } | null>(null);
  const toast = useToast();

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;
  const day = data.days.find((d) => d.day === (sel ?? (data.days.some((x) => x.day === data.today) ? data.today : data.days[0].day))) ?? data.days[0];

  const answer = async (id: string, status: 'confirmado' | 'cancelado') => {
    try {
      await api(`/api/p/agenda/reservas/${id}`, 'POST', { status });
      toast(status === 'confirmado' ? 'Confirmado' : 'Horário liberado');
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <Title sub={`${ddmm(data.days[0].day)} a ${ddmm(data.days[6].day)}`}>Agenda</Title>
        <div className="flex gap-2">
          <button aria-label="Semana anterior" className="grid h-10 w-10 place-items-center rounded-full bg-[#141418]" onClick={() => (setStart(shift(data.start, -7)), setSel(null))}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button aria-label="Próxima semana" className="grid h-10 w-10 place-items-center rounded-full bg-[#141418]" onClick={() => (setStart(shift(data.start, 7)), setSel(null))}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {data.days.map((d) => {
          const n = d.slots.reduce((a, s) => a + s.bookings.length, 0);
          const on = d.day === day.day;
          return (
            <button key={d.day} type="button" onClick={() => setSel(d.day)} className={`flex flex-col items-center gap-0.5 rounded-2xl py-2.5 ${on ? 'bg-[var(--tc)] text-white' : 'bg-[#141418]'}`}>
              <span className={`text-[11px] ${on ? 'text-white/80' : 'text-[#71717A]'}`}>{WEEK[d.weekday]}</span>
              <span className="kx text-lg">{d.day.slice(8, 10)}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${n ? (on ? 'bg-white' : 'bg-[var(--tc2)]') : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>
      <Card className="flex flex-col">
        {day.slots.length === 0 && <p className="py-4 text-center text-sm text-[#A1A1AA]">Sem horários neste dia.</p>}
        {day.slots.map((s) => (
          <div key={s.time} className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0">
            <span className="kx w-14 text-base text-[var(--tcL)]">{s.time}</span>
            <div className="flex flex-1 flex-col gap-1.5">
              {s.bookings.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-semibold">{b.name}</span>
                  {b.status === 'pedido' ? (
                    <>
                      <Chip kind="warn">Pedido</Chip>
                      <Btn className="min-h-8 px-2.5 text-xs" onClick={() => answer(b.id, 'confirmado')}>
                        Aceitar
                      </Btn>
                    </>
                  ) : (
                    <button className="text-xs text-[#71717A]" onClick={() => answer(b.id, 'cancelado')}>
                      Desmarcar
                    </button>
                  )}
                </div>
              ))}
              {s.bookings.length < s.capacity && (
                <button type="button" onClick={() => setBook({ day: day.day, time: s.time })} className="w-fit text-left text-[13px] text-[#71717A]">
                  Livre · toque para marcar
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>
      <Marcar nav={nav} at={book} onClose={() => setBook(null)} onDone={reload} />
    </>
  );
}

function Marcar({ nav, at, onClose, onDone }: { nav: Nav; at: { day: string; time: string } | null; onClose: () => void; onDone: () => void }) {
  const { data } = useData<{ students: { id: string; name: string; status: string }[] }>(at ? '/api/p/alunos' : null, nav.auth);
  const toast = useToast();
  return (
    <Sheet open={!!at} onClose={onClose} title={at ? `${WEEK[new Date(at.day + 'T12:00:00').getDay()]}, ${ddmm(at.day)} às ${at.time}` : ''}>
      <div className="flex max-h-[60dvh] flex-col overflow-y-auto">
        {!data && <Spinner />}
        {data?.students
          .filter((s) => s.status === 'ativo')
          .map((s) => (
            <button
              key={s.id}
              type="button"
              className="border-b border-white/[0.06] py-3 text-left text-sm font-semibold"
              onClick={async () => {
                try {
                  await api('/api/p/agenda/reservas', 'POST', { studentId: s.id, ...at });
                  toast(`${s.name.split(' ')[0]} marcado(a)`);
                  onDone();
                  onClose();
                } catch (e) {
                  nav.auth(e as ApiErr);
                  toast((e as ApiErr).message);
                }
              }}
            >
              {s.name}
            </button>
          ))}
      </div>
    </Sheet>
  );
}
