'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Timer, Trophy } from 'lucide-react';
import { api, ApiErr, Btn, Card, kg, Spinner, useData, useToast } from '../kit';
import type { Ctx } from './app';

type Item = {
  id: string;
  name: string;
  muscle: string;
  videoUrl: string;
  sets: number;
  reps: string;
  targetKg: number | null;
  restSec: number;
  notes: string;
  last: { sets: { kg: number | null; reps: number | null }[]; pse: number | null } | null;
  today: { setNo: number; kg: number | null; reps: number | null }[];
  pse: number | null;
};
type W = { id: string; name: string; finished: boolean; items: Item[] };

const FEEL = [
  { t: 'Leve', d: 'dava pra mais', pse: 4 },
  { t: 'Na medida', d: 'cansou, mas foi', pse: 6 },
  { t: 'Pesado', d: 'no limite', pse: 8 },
  { t: 'Não deu', d: 'não consegui', pse: 10 },
];

export function Treino({ ctx, initial }: { ctx: Ctx; initial: string | null }) {
  const list = useData<{ workouts: { id: string; name: string; lastDay: string | null; count: number }[]; suggested: string | null }>(`/api/a/${ctx.slug}/treinos`, ctx.auth);
  const [sel, setSel] = useState<string | null>(initial);
  const id = sel ?? list.data?.suggested ?? list.data?.workouts[0]?.id ?? null;

  if (list.error) return <p className="text-sm text-red-300">{list.error}</p>;
  if (!list.data) return <Spinner />;
  if (!list.data.workouts.length)
    return (
      <Card>
        <p className="text-sm text-[#A1A1AA]">Seu personal ainda está montando o seu treino.</p>
      </Card>
    );

  return (
    <>
      <h1 className="kx text-[25px]">Treino de hoje</h1>
      {list.data.workouts.length > 1 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {list.data.workouts.map((w) => (
            <button key={w.id} type="button" onClick={() => setSel(w.id)} className={`min-h-10 flex-none rounded-full px-4 text-[13px] font-semibold ${w.id === id ? 'bg-[var(--tc)] text-white' : 'border border-white/15 text-[#D4D4D8]'}`}>
              {w.name}
            </button>
          ))}
        </div>
      )}
      {id && <Workout key={id} ctx={ctx} id={id} />}
    </>
  );
}

function Workout({ ctx, id }: { ctx: Ctx; id: string }) {
  const { data, error, reload, setData } = useData<W>(`/api/a/${ctx.slug}/treinos/${id}`, ctx.auth);
  const toast = useToast();
  const [rest, setRest] = useState<{ left: number; total: number } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => void (timer.current && window.clearInterval(timer.current)), []);
  const startRest = (sec: number) => {
    if (!sec) return;
    if (timer.current) window.clearInterval(timer.current);
    setRest({ left: sec, total: sec });
    timer.current = window.setInterval(() => {
      setRest((r) => {
        if (!r || r.left <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          if (r) toast('Descanso acabou. Próxima série!');
          return null;
        }
        return { ...r, left: r.left - 1 };
      });
    }, 1000);
  };

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;

  const doneItems = data.items.filter((it) => it.today.length >= it.sets).length;
  const allDone = doneItems === data.items.length;

  const finish = async () => {
    setFinishing(true);
    try {
      await api(`/api/a/${ctx.slug}/treinos/${id}/concluir`, 'POST');
      toast('Treino concluído! Seu personal já foi avisado 💪');
      reload();
    } catch (e) {
      ctx.auth(e as ApiErr);
      toast((e as ApiErr).message);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">{data.name}</span>
          <span className="text-[13px] text-[#A1A1AA]">
            {doneItems} de {data.items.length} feitos
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-[var(--tc2)] transition-all" style={{ width: `${data.items.length ? (doneItems / data.items.length) * 100 : 0}%` }} />
        </div>
      </Card>

      {data.items.map((it) => (
        <ItemCard
          key={it.id}
          ctx={ctx}
          workoutId={id}
          it={it}
          onSaved={(today, pse) => setData({ ...data, items: data.items.map((x) => (x.id === it.id ? { ...x, today, pse: pse === undefined ? x.pse : pse } : x)) })}
          onRest={() => startRest(it.restSec)}
        />
      ))}

      {data.finished ? (
        <div className="flex items-center gap-3 rounded-[20px] bg-emerald-500/15 p-4 text-emerald-200">
          <Trophy className="h-6 w-6" />
          <span className="text-sm font-semibold">Treino concluído hoje. Mandou bem!</span>
        </div>
      ) : (
        <Btn className="h-14 text-base" busy={finishing} disabled={doneItems === 0} onClick={finish}>
          {allDone ? 'Concluir treino' : `Concluir treino (${doneItems} de ${data.items.length})`}
        </Btn>
      )}

      {rest && (
        <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4">
          <div className="flex w-full max-w-[520px] items-center gap-3 rounded-2xl bg-[var(--tc)] p-3 text-white shadow-2xl">
            <Timer className="h-6 w-6" />
            <div className="flex-1">
              <p className="text-xs text-white/80">Descanso</p>
              <p className="kx text-2xl">
                {Math.floor(rest.left / 60)}:{String(rest.left % 60).padStart(2, '0')}
              </p>
            </div>
            <button className="h-10 rounded-xl bg-white/20 px-3 text-sm font-semibold" onClick={() => setRest((r) => (r ? { left: r.left + 15, total: r.total + 15 } : r))}>
              +15s
            </button>
            <button
              className="h-10 rounded-xl bg-white px-3 text-sm font-semibold text-[#0B0B0C]"
              onClick={() => {
                if (timer.current) window.clearInterval(timer.current);
                setRest(null);
              }}
            >
              Pular
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ItemCard({ ctx, workoutId, it, onSaved, onRest }: { ctx: Ctx; workoutId: string; it: Item; onSaved: (t: Item['today'], pse?: number) => void; onRest: () => void }) {
  const toast = useToast();
  const lastKg = it.last?.sets.find((s) => s.kg !== null)?.kg ?? null;
  const defaultKg = it.targetKg ?? lastKg;
  const repsNum = parseInt(it.reps, 10);
  const [vals, setVals] = useState(() =>
    Array.from({ length: it.sets }, (_, i) => {
      const t = it.today.find((x) => x.setNo === i + 1);
      return { kg: t ? (t.kg === null ? '' : String(t.kg).replace('.', ',')) : defaultKg === null ? '' : String(defaultKg).replace('.', ','), reps: t ? String(t.reps ?? '') : Number.isFinite(repsNum) ? String(repsNum) : '' };
    }),
  );
  const done = (n: number) => it.today.some((x) => x.setNo === n);
  const complete = it.today.length >= it.sets;

  const toggle = async (n: number) => {
    const v = vals[n - 1];
    const undo = done(n);
    const kgNum = v.kg ? Number(v.kg.replace(',', '.')) : null;
    const repsN = v.reps ? Number(v.reps) : null;
    const next = undo ? it.today.filter((x) => x.setNo !== n) : [...it.today.filter((x) => x.setNo !== n), { setNo: n, kg: kgNum, reps: repsN }];
    onSaved(next);
    try {
      await api(`/api/a/${ctx.slug}/treinos/${workoutId}/serie`, 'POST', { itemId: it.id, setNo: n, kg: kgNum, reps: repsN, undo });
      if (!undo && next.length < it.sets) onRest();
    } catch (e) {
      onSaved(it.today);
      ctx.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };

  const feel = async (pse: number) => {
    onSaved(it.today, pse);
    try {
      await api(`/api/a/${ctx.slug}/treinos/${workoutId}/esforco`, 'POST', { itemId: it.id, pse });
    } catch (e) {
      ctx.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };

  const below = it.targetKg !== null && it.today.some((s) => s.kg !== null && s.kg < it.targetKg!);
  const above = it.targetKg !== null && it.today.some((s) => s.kg !== null && s.kg > it.targetKg!);

  return (
    <Card className={`flex flex-col gap-3 ${complete ? 'ring-1 ring-emerald-400/40' : ''}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl text-[13px] font-bold ${complete ? 'bg-emerald-500 text-white' : 'border border-white/15 text-[#A1A1AA]'}`}>
          {complete ? <Check className="h-5 w-5" strokeWidth={3} /> : `${it.today.length}/${it.sets}`}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{it.name}</p>
          <p className="text-xs text-[#A1A1AA]">
            {it.sets} × {it.reps}
            {it.targetKg !== null ? ` · ${kg(it.targetKg)}` : ''}
            {lastKg !== null ? ` · última vez ${kg(lastKg)}` : ''}
          </p>
        </div>
      </div>
      {it.targetKg !== null && (
        <div className="rounded-xl border border-[var(--tc2)]/40 bg-[var(--tc)]/10 px-3 py-2 text-xs leading-snug text-[#D4D4D8]">
          <b className="text-[var(--tcL)]">Meta do personal:</b> {it.sets} séries de {it.reps} com {kg(it.targetKg)}. Anote o peso que você realmente pegou: se for mais ou menos, o personal fica sabendo.
        </div>
      )}
      {it.notes && <p className="text-xs text-[#A1A1AA]">Dica: {it.notes}</p>}
      <div className="grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-2 text-[11px] text-[#71717A]">
        <span>Série</span>
        <span>Carga (kg)</span>
        <span>Reps</span>
        <span />
        {vals.map((v, i) => {
          const n = i + 1;
          const d = done(n);
          return (
            <div key={n} className="contents">
              <span className="text-sm text-[#D4D4D8]">{n}</span>
              <input
                aria-label={`Carga da série ${n}`}
                inputMode="decimal"
                value={v.kg}
                disabled={d}
                onChange={(e) => setVals(vals.map((x, j) => (j === i ? { ...x, kg: e.target.value.replace(/[^\d,]/g, '') } : x)))}
                className="h-12 w-full min-w-0 rounded-xl border border-white/15 bg-[#0B0B0C] px-3 text-base font-semibold text-white disabled:opacity-70"
              />
              <input
                aria-label={`Repetições da série ${n}`}
                inputMode="numeric"
                value={v.reps}
                disabled={d}
                onChange={(e) => setVals(vals.map((x, j) => (j === i ? { ...x, reps: e.target.value.replace(/\D/g, '').slice(0, 3) } : x)))}
                className="h-12 w-full min-w-0 rounded-xl border border-white/15 bg-[#0B0B0C] px-3 text-base font-semibold text-white disabled:opacity-70"
              />
              <button
                type="button"
                aria-label={d ? `Desfazer série ${n}` : `Concluir série ${n}`}
                onClick={() => toggle(n)}
                className={`grid h-12 w-12 place-items-center rounded-xl ${d ? 'bg-emerald-500 text-white' : 'border border-white/15 text-[#71717A]'}`}
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
      {(below || above) && (
        <p className={`text-xs font-semibold ${below ? 'text-amber-200' : 'text-emerald-300'}`}>{below ? 'Abaixo da meta. Tudo bem: o personal vai ajustar.' : 'Acima da meta! O personal vai ver.'}</p>
      )}
      {complete && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold">Como foi esse exercício?</p>
          <div className="grid grid-cols-4 gap-1.5">
            {FEEL.map((f) => (
              <button key={f.pse} type="button" aria-pressed={it.pse === f.pse} onClick={() => feel(f.pse)} className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-1 ${it.pse === f.pse ? 'bg-[var(--tc)] text-white' : 'bg-white/[0.06] text-[#D4D4D8]'}`}>
                <span className="text-[13px] font-bold">{f.t}</span>
                <span className={`text-[10px] ${it.pse === f.pse ? 'text-white/80' : 'text-[#71717A]'}`}>{f.d}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
