'use client';

import { Card, ddmm, Eyebrow, MONTHS, Spinner, useData } from '../kit';
import type { Ctx } from './app';

type A = { id: string; day: string; weightKg: number; bodyFatPct: number | null; heightCm: number | null; measures: Record<string, number> };
const LABEL: Record<string, string> = { cintura: 'Cintura', abdomen: 'Abdômen', quadril: 'Quadril', peito: 'Peito', braco: 'Braço', coxa: 'Coxa', panturrilha: 'Panturrilha' };
const f1 = (n: number) => n.toFixed(1).replace('.', ',');

export function Evolucao({ ctx }: { ctx: Ctx }) {
  const { data, error } = useData<{ assessments: A[] }>(`/api/a/${ctx.slug}/evolucao`, ctx.auth);
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;
  const av = data.assessments;
  if (!av.length)
    return (
      <>
        <h1 className="kx text-[25px]">Minha evolução</h1>
        <Card>
          <p className="text-sm text-[#A1A1AA]">Sua primeira avaliação ainda não foi lançada. Depois dela, sua evolução aparece aqui.</p>
        </Card>
      </>
    );
  const first = av[0];
  const last = av[av.length - 1];
  const pts = av.map((a) => a.weightKg);
  const min = Math.min(...pts) - 1;
  const max = Math.max(...pts) + 1;
  const xy = (p: number, i: number) => [(i / Math.max(1, pts.length - 1)) * 296 + 12, 112 - ((p - min) / (max - min || 1)) * 96] as const;
  const line = pts.map((p, i) => xy(p, i).join(',')).join(' ');
  const diff = last.weightKg - first.weightKg;

  return (
    <>
      <h1 className="kx text-[25px]">Minha evolução</h1>
      <Card>
        <p className="text-xs text-[#A1A1AA]">Peso</p>
        <p className="kx text-[28px]">
          {f1(last.weightKg)} kg{' '}
          {av.length > 1 && (
            <span className={`font-sans text-[13px] not-italic ${diff <= 0 ? 'text-emerald-300' : 'text-amber-200'}`}>
              {diff > 0 ? '+' : ''}
              {f1(diff)} kg desde {ddmm(first.day)}
            </span>
          )}
        </p>
        {pts.length > 1 && (
          <svg viewBox="0 0 320 130" className="mt-3 h-32 w-full" role="img" aria-label="Seu peso em cada avaliação">
            <polygon points={`12,120 ${line} 308,120`} fill="color-mix(in srgb, var(--tc) 22%, transparent)" />
            <polyline points={line} fill="none" stroke="var(--tc2)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => {
              const [x, y] = xy(p, i);
              return <circle key={i} cx={x} cy={y} r="4.5" fill="#0B0B0C" stroke="var(--tc2)" strokeWidth="2.5" />;
            })}
          </svg>
        )}
        <div className="mt-1 flex justify-between text-[11px] text-[#71717A]">
          {av.map((a) => (
            <span key={a.id}>{MONTHS[Number(a.day.slice(5, 7)) - 1]}</span>
          ))}
        </div>
      </Card>
      {last.bodyFatPct !== null && (
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="p-3.5">
            <p className="text-xs text-[#A1A1AA]">Gordura</p>
            <p className="kx text-xl">{f1(last.bodyFatPct)}%</p>
            {first.bodyFatPct !== null && av.length > 1 && <p className="text-xs font-bold text-emerald-300">{f1(last.bodyFatPct - first.bodyFatPct)} p.p.</p>}
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-[#A1A1AA]">Avaliações</p>
            <p className="kx text-xl">{av.length}</p>
            <p className="text-xs text-[#A1A1AA]">última em {ddmm(last.day)}</p>
          </Card>
        </div>
      )}
      {Object.keys(last.measures).length > 0 && (
        <Card className="flex flex-col">
          <Eyebrow className="mb-1">Medidas (cm)</Eyebrow>
          {Object.entries(last.measures).map(([k, v]) => {
            const d = first.measures[k] !== undefined && av.length > 1 ? v - first.measures[k] : null;
            return (
              <div key={k} className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0">
                <span className="text-sm">{LABEL[k] ?? k}</span>
                <span className="flex items-baseline gap-3">
                  <b className="text-sm">{f1(v)}</b>
                  <span className={`w-12 text-right text-xs font-bold ${d !== null && d > 0 ? 'text-amber-200' : 'text-emerald-300'}`}>{d ? `${d > 0 ? '+' : ''}${f1(d)}` : ''}</span>
                </span>
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}
