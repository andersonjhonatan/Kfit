'use client';

import { useState } from 'react';
import { ChevronLeft, Lock, MessageCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ago, api, ApiErr, brl, Btn, Card, Chip, ddmm, ErrorText, Eyebrow, Field, inputCls, kg, MONTHS, Sheet, Spinner, useData, useToast } from '../kit';
import { initials } from './alunos';
import type { Nav } from './painel';

type Item = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  targetKg: number | null;
  restSec: number;
  notes: string;
  last: { sets: { kg: number | null; reps: number | null }[]; pse: number | null; verdict: string } | null;
};
type Workout = { id: string; name: string; lastDay: string | null; items: Item[] };
type Detail = {
  student: { id: string; name: string; phone: string; goal: string; days: string; planName: string; priceCents: number; dueDay: number; status: string; access: string; passwordSetAt: string | null; lastAccessAt: string | null; heightCm: number | null };
  workouts: Workout[];
  assessments: { id: string; day: string; weightKg: number; bodyFatPct: number | null; heightCm: number | null; measures: Record<string, number> }[];
  payments: { id: string; period: string; dueDate: string; amountCents: number; status: string }[];
  note: { text: string; reaction: string | null; at: string } | null;
};

const TABS = ['Treino', 'Avaliação', 'Pagamentos', 'Recado'] as const;

export function AlunoDetalhe({ nav, id }: { nav: Nav; id: string }) {
  const { data, error, reload } = useData<Detail>(`/api/p/alunos/${id}`, nav.auth);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Treino');
  const toast = useToast();

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;
  const s = data.student;

  const call = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast(msg);
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };

  return (
    <>
      <button type="button" onClick={() => nav.go('alunos')} className="flex min-h-9 w-fit items-center gap-1 text-[13px] text-[#A1A1AA]">
        <ChevronLeft className="h-4 w-4" /> Alunos
      </button>
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 flex-none place-items-center rounded-full bg-[var(--tc)]/20 text-lg font-bold text-[var(--tcL)]">{initials(s.name)}</span>
        <div className="min-w-0 flex-1">
          <h1 className="kx truncate text-[24px]">{s.name}</h1>
          <p className="truncate text-[13px] text-[#A1A1AA]">
            {s.goal || 'Sem objetivo'}
            {s.days ? ` · ${s.days}` : ''}
          </p>
        </div>
        <a href={`https://wa.me/55${s.phone}`} target="_blank" rel="noreferrer" aria-label="Conversar no WhatsApp" className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>

      <Card className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[13px] font-semibold">
            <Lock className="h-4 w-4 text-[var(--tcL)]" /> Acesso ao app
          </span>
          <Chip kind={s.access === 'ativo' ? 'ok' : s.access === 'pausado' ? 'late' : 'mute'}>
            {s.access === 'ativo' ? 'Ativo' : s.access === 'pausado' ? 'Pausado' : 'Primeiro acesso pendente'}
          </Chip>
        </div>
        <p className="text-xs leading-snug text-[#A1A1AA]">
          {s.access === 'ativo'
            ? `Senha criada · último acesso ${ago(s.lastAccessAt)}`
            : s.access === 'pausado'
              ? 'Não consegue entrar no app até você liberar.'
              : 'Ainda não entrou. No primeiro acesso, recebe um código no WhatsApp e cria a senha.'}
        </p>
        <div className="flex gap-2">
          {s.access === 'ativo' && (
            <Btn kind="ghost" className="min-h-9 flex-1 text-xs" onClick={() => call(() => api(`/api/p/alunos/${id}/acesso`, 'POST', { action: 'zerar' }), `Senha zerada. No próximo acesso ${s.name.split(' ')[0]} recebe um código.`)}>
              Zerar senha
            </Btn>
          )}
          {s.access === 'pendente' && (
            <Btn
              kind="ghost"
              className="min-h-9 flex-1 text-xs"
              onClick={() =>
                window.open(
                  `https://wa.me/55${s.phone}?text=${encodeURIComponent(`Oi, ${s.name.split(' ')[0]}! Seu app de treino: ${location.origin}/a/${nav.me.studio.slug}\nEntre com este número. Na primeira vez chega um código para criar a sua senha.`)}`,
                  '_blank',
                )
              }
            >
              Reenviar convite
            </Btn>
          )}
          {s.access === 'pausado' ? (
            <Btn kind="ghost" className="min-h-9 flex-1 text-xs" onClick={() => call(() => api(`/api/p/alunos/${id}/acesso`, 'POST', { action: 'liberar' }), 'Acesso liberado')}>
              Liberar acesso
            </Btn>
          ) : (
            <Btn kind="danger" className="min-h-9 flex-1 text-xs" onClick={() => call(() => api(`/api/p/alunos/${id}/acesso`, 'POST', { action: 'pausar' }), `Acesso pausado. ${s.name.split(' ')[0]} foi desconectado(a).`)}>
              Pausar acesso
            </Btn>
          )}
        </div>
      </Card>

      <div role="tablist" className="grid grid-cols-4 gap-1 rounded-2xl bg-[#141418] p-1">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`min-h-10 rounded-xl text-[13px] font-semibold ${tab === t ? 'bg-[var(--tc)] text-white' : 'text-[#A1A1AA]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Treino' && <Treinos nav={nav} data={data} reload={reload} />}
      {tab === 'Avaliação' && <Avaliacoes nav={nav} data={data} reload={reload} />}
      {tab === 'Pagamentos' && <Pagamentos nav={nav} data={data} reload={reload} />}
      {tab === 'Recado' && <Recado nav={nav} data={data} reload={reload} />}
    </>
  );
}

type TabProps = { nav: Nav; data: Detail; reload: () => void };

// ───────── Treino ─────────
function Treinos({ nav, data, reload }: TabProps) {
  const toast = useToast();
  const [edit, setEdit] = useState<Item | null>(null);
  const [addTo, setAddTo] = useState<string | null>(null);
  const [newW, setNewW] = useState(false);
  const [wName, setWName] = useState('');
  const [rename, setRename] = useState<Workout | null>(null);

  const call = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast(msg);
      reload();
      return true;
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
      return false;
    }
  };

  return (
    <>
      {data.workouts.length === 0 && <p className="py-4 text-center text-sm text-[#A1A1AA]">Ainda sem treino. Crie o primeiro.</p>}
      {data.workouts.map((w) => (
        <Card key={w.id} className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="kx text-lg">{w.name}</p>
              <p className="text-xs text-[#71717A]">{w.lastDay ? `Último treino ${ddmm(w.lastDay)}` : 'Ainda não treinou'}</p>
            </div>
            <button type="button" aria-label="Renomear treino" onClick={() => (setRename(w), setWName(w.name))} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06]">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          {w.items.map((it) => (
            <button key={it.id} type="button" onClick={() => setEdit(it)} className="flex flex-col gap-1.5 rounded-2xl bg-[#1B1B21] p-3 text-left">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{it.name}</span>
                {it.last && <Chip kind={it.last.verdict === 'abaixo' ? 'late' : it.last.verdict === 'acima' ? 'ok' : 'info'}>{it.last.verdict === 'na meta' ? 'Na meta' : it.last.verdict === 'abaixo' ? 'Abaixo da meta' : 'Acima da meta'}</Chip>}
              </div>
              <span className="text-xs text-[#D4D4D8]">
                Meta: <b>{it.sets} × {it.reps}</b>
                {it.targetKg !== null ? ` · ${kg(it.targetKg)}` : ''} · descanso {it.restSec}s
              </span>
              {it.last && (
                <span className="text-xs text-[#A1A1AA]">
                  Fez: {it.last.sets.map((x) => (x.kg === null ? `${x.reps ?? '–'} reps` : `${String(x.kg).replace('.', ',')}×${x.reps ?? '–'}`)).join(' · ')}
                  {it.last.pse !== null ? ` · PSE ${it.last.pse}` : ''}
                </span>
              )}
            </button>
          ))}
          <Btn kind="soft" onClick={() => setAddTo(w.id)}>
            <Plus className="h-4 w-4" /> Adicionar exercício
          </Btn>
        </Card>
      ))}
      <Btn kind="ghost" onClick={() => (setNewW(true), setWName(''))}>
        <Plus className="h-4 w-4" /> Novo treino
      </Btn>

      <Sheet open={newW} onClose={() => setNewW(false)} title="Novo treino">
        <div className="flex flex-col gap-4">
          <Field label="Nome do treino">
            <input className={inputCls} value={wName} onChange={(e) => setWName(e.target.value)} placeholder="Ex.: Treino A · Inferiores" />
          </Field>
          <Btn className="h-12" disabled={wName.trim().length < 2} onClick={async () => (await call(() => api(`/api/p/alunos/${data.student.id}/treinos`, 'POST', { name: wName }), 'Treino criado')) && setNewW(false)}>
            Criar treino
          </Btn>
        </div>
      </Sheet>

      <Sheet open={!!rename} onClose={() => setRename(null)} title="Treino">
        {rename && (
          <div className="flex flex-col gap-4">
            <Field label="Nome">
              <input className={inputCls} value={wName} onChange={(e) => setWName(e.target.value)} />
            </Field>
            <Btn className="h-12" onClick={async () => (await call(() => api(`/api/p/treinos/${rename.id}`, 'PATCH', { name: wName }), 'Treino renomeado')) && setRename(null)}>
              Salvar
            </Btn>
            <Btn kind="danger" onClick={async () => (await call(() => api(`/api/p/treinos/${rename.id}`, 'DELETE'), 'Treino arquivado. O histórico continua salvo.')) && setRename(null)}>
              <Trash2 className="h-4 w-4" /> Arquivar treino
            </Btn>
          </div>
        )}
      </Sheet>

      <ItemSheet item={edit} onClose={() => setEdit(null)} call={call} />
      <AddExercise workoutId={addTo} onClose={() => setAddTo(null)} call={call} nav={nav} />
    </>
  );
}

function ItemSheet({ item, onClose, call }: { item: Item | null; onClose: () => void; call: (fn: () => Promise<unknown>, msg: string) => Promise<boolean> }) {
  const [f, setF] = useState({ sets: '', reps: '', kg: '', rest: '' });
  const [loaded, setLoaded] = useState<string | null>(null);
  if (item && loaded !== item.id) {
    setLoaded(item.id);
    setF({ sets: String(item.sets), reps: item.reps, kg: item.targetKg === null ? '' : String(item.targetKg).replace('.', ','), rest: String(item.restSec) });
  }
  return (
    <Sheet open={!!item} onClose={() => (setLoaded(null), onClose())} title={item?.name ?? ''}>
      {item && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] leading-snug text-[#A1A1AA]">A meta de carga aparece para o aluno. O que ele anotar fica comparado com a meta.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Séries">
              <input className={inputCls} inputMode="numeric" value={f.sets} onChange={(e) => setF({ ...f, sets: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
            </Field>
            <Field label="Repetições">
              <input className={inputCls} value={f.reps} onChange={(e) => setF({ ...f, reps: e.target.value.slice(0, 12) })} />
            </Field>
            <Field label="Meta de carga (kg)">
              <input className={inputCls} inputMode="decimal" value={f.kg} placeholder="sem carga" onChange={(e) => setF({ ...f, kg: e.target.value.replace(/[^\d,]/g, '') })} />
            </Field>
            <Field label="Descanso (s)">
              <input className={inputCls} inputMode="numeric" value={f.rest} onChange={(e) => setF({ ...f, rest: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
            </Field>
          </div>
          <Btn
            className="h-12"
            onClick={async () =>
              (await call(
                () => api(`/api/p/itens/${item.id}`, 'PATCH', { sets: Number(f.sets), reps: f.reps, targetKg: f.kg ? Number(f.kg.replace(',', '.')) : null, restSec: Number(f.rest || 0) }),
                'Meta atualizada',
              )) && (setLoaded(null), onClose())
            }
          >
            Salvar
          </Btn>
          <Btn kind="danger" onClick={async () => (await call(() => api(`/api/p/itens/${item.id}`, 'DELETE'), 'Exercício removido')) && (setLoaded(null), onClose())}>
            <Trash2 className="h-4 w-4" /> Remover do treino
          </Btn>
        </div>
      )}
    </Sheet>
  );
}

function AddExercise({ workoutId, onClose, call, nav }: { workoutId: string | null; onClose: () => void; call: (fn: () => Promise<unknown>, msg: string) => Promise<boolean>; nav: Nav }) {
  const { data } = useData<{ exercises: { id: string; name: string; muscle: string }[] }>(workoutId ? '/api/p/exercicios' : null, nav.auth);
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<{ id: string; name: string } | null>(null);
  const [f, setF] = useState({ sets: '3', reps: '10', kg: '', rest: '60' });
  const close = () => {
    setPick(null);
    setQ('');
    onClose();
  };
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = (data?.exercises ?? []).filter((e) => !q || norm(e.name + ' ' + e.muscle).includes(norm(q)));
  return (
    <Sheet open={!!workoutId} onClose={close} title={pick ? pick.name : 'Adicionar exercício'}>
      {!pick ? (
        <div className="flex flex-col gap-3">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input autoFocus className={`${inputCls} pl-10`} placeholder="Buscar: agachamento, costas…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="flex max-h-[50dvh] flex-col overflow-y-auto">
            {list.map((e) => (
              <button key={e.id} type="button" onClick={() => setPick(e)} className="flex items-center justify-between border-b border-white/[0.06] py-3 text-left">
                <span className="text-sm font-semibold">{e.name}</span>
                <span className="text-xs text-[#71717A]">{e.muscle}</span>
              </button>
            ))}
            {!data && <Spinner />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Séries">
              <input className={inputCls} inputMode="numeric" value={f.sets} onChange={(e) => setF({ ...f, sets: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
            </Field>
            <Field label="Repetições">
              <input className={inputCls} value={f.reps} onChange={(e) => setF({ ...f, reps: e.target.value.slice(0, 12) })} />
            </Field>
            <Field label="Meta de carga (kg)">
              <input className={inputCls} inputMode="decimal" value={f.kg} placeholder="sem carga" onChange={(e) => setF({ ...f, kg: e.target.value.replace(/[^\d,]/g, '') })} />
            </Field>
            <Field label="Descanso (s)">
              <input className={inputCls} inputMode="numeric" value={f.rest} onChange={(e) => setF({ ...f, rest: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
            </Field>
          </div>
          <Btn
            className="h-12"
            onClick={async () =>
              (await call(
                () => api(`/api/p/treinos/${workoutId}/itens`, 'POST', { exerciseId: pick.id, sets: Number(f.sets || 3), reps: f.reps || '10', targetKg: f.kg ? Number(f.kg.replace(',', '.')) : null, restSec: Number(f.rest || 0) }),
                'Exercício adicionado',
              )) && close()
            }
          >
            Adicionar ao treino
          </Btn>
          <Btn kind="ghost" onClick={() => setPick(null)}>
            Escolher outro
          </Btn>
        </div>
      )}
    </Sheet>
  );
}

// ───────── Avaliação ─────────
const MEASURES = [
  ['cintura', 'Cintura'],
  ['abdomen', 'Abdômen'],
  ['quadril', 'Quadril'],
  ['peito', 'Peito'],
  ['braco', 'Braço'],
  ['coxa', 'Coxa'],
  ['panturrilha', 'Panturrilha'],
] as const;

function Avaliacoes({ nav, data, reload }: TabProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const av = data.assessments;
  const last = av[av.length - 1];
  const first = av[0];
  const h = last?.heightCm ?? data.student.heightCm;
  const imc = last && h ? last.weightKg / (h / 100) ** 2 : null;

  const save = async () => {
    setBusy(true);
    setErr('');
    try {
      const n = (k: string) => (f[k] ? Number(f[k].replace(',', '.')) : undefined);
      const measures: Record<string, number> = {};
      for (const [k] of MEASURES) if (n(k) !== undefined) measures[k] = n(k)!;
      await api(`/api/p/alunos/${data.student.id}/avaliacoes`, 'POST', { weightKg: n('peso'), bodyFatPct: n('gordura') ?? null, heightCm: n('altura') ?? null, measures });
      toast('Avaliação salva');
      setOpen(false);
      setF({});
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      setErr((e as ApiErr).message);
    } finally {
      setBusy(false);
    }
  };

  const pts = av.map((a) => a.weightKg);
  const min = Math.min(...pts) - 1;
  const max = Math.max(...pts) + 1;
  const line = pts.map((p, i) => `${(i / Math.max(1, pts.length - 1)) * 300 + 10},${110 - ((p - min) / (max - min || 1)) * 90}`).join(' ');

  return (
    <>
      <Btn className="h-12" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nova avaliação
      </Btn>
      {!last && <p className="py-4 text-center text-sm text-[#A1A1AA]">Nenhuma avaliação ainda.</p>}
      {last && (
        <>
          <Card className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <Eyebrow>Última avaliação</Eyebrow>
              <span className="text-xs text-[#71717A]">{ddmm(last.day)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Peso', `${String(last.weightKg).replace('.', ',')} kg`, first !== last ? `${last.weightKg - first.weightKg > 0 ? '+' : ''}${(last.weightKg - first.weightKg).toFixed(1).replace('.', ',')} kg` : ''],
                ['IMC', imc ? imc.toFixed(1).replace('.', ',') : '–', ''],
                ['Gordura', last.bodyFatPct !== null ? `${String(last.bodyFatPct).replace('.', ',')}%` : '–', first.bodyFatPct !== null && last.bodyFatPct !== null && first !== last ? `${(last.bodyFatPct - first.bodyFatPct).toFixed(1).replace('.', ',')} p.p.` : ''],
              ].map(([l, v, d]) => (
                <div key={l} className="rounded-xl bg-[#1B1B21] p-3">
                  <p className="text-[11px] text-[#A1A1AA]">{l}</p>
                  <p className="kx text-lg">{v}</p>
                  {d && <p className="text-[11px] font-semibold text-emerald-300">{d}</p>}
                </div>
              ))}
            </div>
            {pts.length > 1 && (
              <svg viewBox="0 0 320 120" className="h-28 w-full" role="img" aria-label="Peso por avaliação">
                <polyline points={line} fill="none" stroke="var(--tc2)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={(i / Math.max(1, pts.length - 1)) * 300 + 10} cy={110 - ((p - min) / (max - min || 1)) * 90} r="4" fill="#0B0B0C" stroke="var(--tc2)" strokeWidth="2.5" />
                ))}
              </svg>
            )}
          </Card>
          <Card className="flex flex-col">
            <Eyebrow className="mb-2">Medidas (cm)</Eyebrow>
            {MEASURES.filter(([k]) => last.measures[k] !== undefined).map(([k, l]) => {
              const d = first.measures[k] !== undefined && first !== last ? last.measures[k] - first.measures[k] : null;
              return (
                <div key={k} className="flex items-center justify-between border-b border-white/[0.06] py-2.5 last:border-0">
                  <span className="text-sm">{l}</span>
                  <span className="flex items-baseline gap-3">
                    <b className="text-sm">{String(last.measures[k]).replace('.', ',')}</b>
                    <span className={`w-12 text-right text-xs font-semibold ${d && d > 0 ? 'text-amber-200' : 'text-emerald-300'}`}>{d ? `${d > 0 ? '+' : ''}${d.toFixed(1).replace('.', ',')}` : ''}</span>
                  </span>
                </div>
              );
            })}
          </Card>
          <Card>
            <Eyebrow className="mb-2">Histórico</Eyebrow>
            {[...av].reverse().map((a) => (
              <div key={a.id} className="flex justify-between border-b border-white/[0.06] py-2 text-sm last:border-0">
                <span className="text-[#A1A1AA]">
                  {Number(a.day.slice(8, 10))} {MONTHS[Number(a.day.slice(5, 7)) - 1]} {a.day.slice(0, 4)}
                </span>
                <span>
                  {String(a.weightKg).replace('.', ',')} kg{a.bodyFatPct !== null ? ` · ${String(a.bodyFatPct).replace('.', ',')}%` : ''}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Nova avaliação">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              ['peso', 'Peso (kg)'],
              ['altura', 'Altura (cm)'],
              ['gordura', '% gordura'],
            ].map(([k, l]) => (
              <Field key={k} label={l}>
                <input className={inputCls} inputMode="decimal" value={f[k] ?? (k === 'altura' && h ? String(h) : '')} onChange={(e) => setF({ ...f, [k]: e.target.value.replace(/[^\d,]/g, '') })} />
              </Field>
            ))}
          </div>
          <Eyebrow>Perímetros (cm)</Eyebrow>
          <div className="grid grid-cols-2 gap-3">
            {MEASURES.map(([k, l]) => (
              <Field key={k} label={l}>
                <input className={inputCls} inputMode="decimal" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value.replace(/[^\d,]/g, '') })} />
              </Field>
            ))}
          </div>
          <ErrorText>{err}</ErrorText>
          <Btn className="h-12" busy={busy} disabled={!f.peso} onClick={save}>
            Salvar avaliação
          </Btn>
        </div>
      </Sheet>
    </>
  );
}

// ───────── Pagamentos ─────────
function Pagamentos({ nav, data, reload }: TabProps) {
  const toast = useToast();
  const s = data.student;
  const mark = async (id: string, status: 'pago' | 'aberto') => {
    try {
      await api(`/api/p/pagamentos/${id}`, 'POST', { status });
      toast(status === 'pago' ? 'Pagamento registrado' : 'Mensalidade reaberta');
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };
  return (
    <>
      <Card>
        <p className="text-xs text-[#A1A1AA]">Plano</p>
        <p className="kx text-xl">
          {s.planName} · {brl(s.priceCents)}
        </p>
        <p className="text-[13px] text-[#A1A1AA]">Vence todo dia {s.dueDay}</p>
      </Card>
      <Card className="flex flex-col">
        {data.payments.length === 0 && <p className="text-sm text-[#A1A1AA]">Sem mensalidades ainda.</p>}
        {data.payments.map((p) => {
          const late = p.status === 'aberto' && p.dueDate < new Date().toISOString().slice(0, 10);
          return (
            <div key={p.id} className="flex items-center gap-3 border-b border-white/[0.06] py-3 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize">
                  {MONTHS[Number(p.period.slice(5, 7)) - 1]} {p.period.slice(0, 4)}
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  {brl(p.amountCents)} · vence {ddmm(p.dueDate)}
                </p>
              </div>
              {p.status === 'pago' ? (
                <button type="button" onClick={() => mark(p.id, 'aberto')}>
                  <Chip kind="ok">Pago</Chip>
                </button>
              ) : (
                <>
                  <Chip kind={late ? 'late' : 'warn'}>{late ? 'Atrasado' : 'Em aberto'}</Chip>
                  <Btn className="min-h-9 px-3 text-xs" onClick={() => mark(p.id, 'pago')}>
                    Recebi
                  </Btn>
                </>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
}

// ───────── Recado ─────────
function Recado({ nav, data, reload }: TabProps) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <>
      {data.note && (
        <Card className="flex flex-col gap-2">
          <Eyebrow>Último recado · {ago(data.note.at)}</Eyebrow>
          <p className="text-sm leading-relaxed text-[#E4E4E7]">{data.note.text}</p>
          {data.note.reaction && <p className="text-xs text-[#A1A1AA]">Resposta do aluno: {data.note.reaction}</p>}
        </Card>
      )}
      <Field label="Novo recado" hint="Aparece na tela inicial do app do aluno.">
        <textarea className={`${inputCls} h-28 py-3`} value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} placeholder="Ex.: Hoje capricha no agachamento, desce devagar!" />
      </Field>
      <Btn
        className="h-12"
        busy={busy}
        disabled={text.trim().length < 2}
        onClick={async () => {
          setBusy(true);
          try {
            await api(`/api/p/alunos/${data.student.id}/recado`, 'POST', { text });
            setText('');
            toast('Recado enviado para o app');
            reload();
          } catch (e) {
            nav.auth(e as ApiErr);
            toast((e as ApiErr).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Enviar recado
      </Btn>
    </>
  );
}
