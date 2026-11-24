'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';

/** Moldura de celular */
export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div data-theme="dark" className={`relative w-[290px] rounded-[46px] bg-[#1b1b20] p-[10px] shadow-[0_40px_90px_-20px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_255_255/0.06)] ${className}`}>
      <div className="relative h-[580px] overflow-hidden rounded-[38px] bg-ink">
        <div className="absolute left-1/2 top-2.5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

const SETS = [
  { kg: 60, reps: 10 },
  { kg: 60, reps: 10 },
  { kg: 65, reps: 10 },
  { kg: 65, reps: 10 },
];

/** O treino do aluno marcando série por série; a carga acima da meta acende */
export function WorkoutScreen({ color = '#2563EB', brandName = 'KFit', mono }: { color?: string; brandName?: string; mono?: ReactNode }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setDone((d) => (d >= SETS.length + 3 ? 0 : d + 1)), 900);
    return () => clearInterval(id);
  }, []);
  const finished = done >= SETS.length;
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-12 text-[13px]">
      <div className="flex items-center gap-2.5">
        {mono}
        <div className="min-w-0">
          <p className="display truncate text-[15px] normal-case">{brandName}</p>
          <p className="text-[10px] text-dim">Treino A · Inferiores</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-card p-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Agachamento livre</p>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-mute">{Math.min(done, 4)}/4</span>
        </div>
        <p className="mt-1 rounded-lg px-2 py-1.5 text-[11px]" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color: `color-mix(in srgb, ${color} 45%, white)` }}>
          <b>Meta do personal:</b> 4 × 10 com 60 kg
        </p>
        <div className="mt-2 grid grid-cols-[28px_1fr_1fr_34px] gap-1.5 text-[10px] text-dim">
          <span>Série</span><span>Carga</span><span>Reps</span><span />
        </div>
        {SETS.map((st, i) => {
          const on = i < done;
          const above = st.kg > 60;
          return (
            <div key={i} className="mt-1.5 grid grid-cols-[28px_1fr_1fr_34px] items-center gap-1.5">
              <span className="text-mute">{i + 1}</span>
              <span
                className="rounded-lg border px-2 py-1.5 font-semibold transition-colors"
                style={{ borderColor: on && above ? '#6EE7B7' : 'rgb(255 255 255 / 0.1)', color: on && above ? '#6EE7B7' : undefined }}
              >
                {st.kg} kg
              </span>
              <span className="rounded-lg border border-white/10 px-2 py-1.5 font-semibold">{st.reps}</span>
              <motion.span
                className="flex h-8 items-center justify-center rounded-lg"
                animate={{ backgroundColor: on ? color : 'rgba(0,0,0,0)', scale: on ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.3 }}
                style={{ border: on ? '0' : '1.5px solid rgb(255 255 255 / 0.2)' }}
              >
                <Check className={`h-3.5 w-3.5 ${on ? 'text-white' : 'text-dim'}`} strokeWidth={3} />
              </motion.span>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-3 rounded-2xl border border-pr/40 bg-pr/10 p-3 text-[11px] font-semibold text-pr"
          >
            Você pegou 65 kg, acima da meta de 60 kg. O personal foi avisado.
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-auto rounded-xl py-3 text-center text-[13px] font-semibold text-white" style={{ background: color }}>
        Concluir exercício
      </div>
    </div>
  );
}
