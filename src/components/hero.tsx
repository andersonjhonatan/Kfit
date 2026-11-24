'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Play, Timer, Trophy } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/site';
import { Reveal, RevealItem, SlamWords, useIntroReady } from './motion';
import { PhoneFrame, WorkoutScreen } from './phone';
import { Symbol } from './brand';

/** Linha de batimento cardíaco desenhando sem parar */
function Heartbeat() {
  const d = 'M0 30 H70 L80 30 L88 8 L98 52 L108 18 L116 30 H190 L198 30 L206 4 L216 56 L226 22 L234 30 H320';
  return (
    <svg viewBox="0 0 320 60" className="h-10 w-full max-w-[420px]" aria-hidden="true">
      <path d={d} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="3" />
      <motion.path
        d={d}
        fill="none"
        stroke="url(#ecg)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: [0, 0.35, 0.35], pathOffset: [0, 0.65, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      />
      <defs>
        <linearGradient id="ecg" x1="0" x2="1">
          <stop offset="0" stopColor="#2563EB" stopOpacity="0" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Timer de descanso girando */
function RestTimer() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink-3/90 px-3.5 py-2.5 backdrop-blur">
      <div className="relative h-10 w-10">
        <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="4" />
          <motion.circle
            cx="20" cy="20" r="16" fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"
            strokeDasharray="100.5"
            animate={{ strokeDashoffset: [0, 100.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
        <Timer className="absolute inset-0 m-auto h-4 w-4 text-ice" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-dim">Descanso</p>
        <p className="display text-lg normal-case">0:45</p>
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bigX = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ready = useIntroReady();

  return (
    <section ref={ref} className="gym-floor relative overflow-hidden pt-28 sm:pt-32">
      {/* letreiro gigante vazado passando no fundo */}
      <motion.p style={{ x: bigX }} aria-hidden="true" className="display outline-text pointer-events-none absolute -bottom-6 left-0 whitespace-nowrap text-[28vw] leading-none sm:text-[22vw]">
        Treine Gerencie Evolua
      </motion.p>
      {/* linhas de velocidade */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-10 top-40 flex -skew-x-[24deg] flex-col gap-3 opacity-60">
        {[260, 210, 160, 110].map((w, i) => (
          <motion.span key={w} className="block h-3 rounded-sm bg-blue/70" style={{ width: w }}
            initial={{ x: -300, opacity: 0 }} animate={ready ? { x: 0, opacity: 1 - i * 0.2 } : {}}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 md:grid-cols-[1.15fr_0.85fr] md:pb-28">
        <div>
          <Reveal trigger="intro">
            <RevealItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue/40 bg-blue/10 px-3 py-1.5 text-xs font-semibold text-ice">
                <Symbol className="h-3.5 w-auto" /> App para personal trainer e studio
              </span>
            </RevealItem>
          </Reveal>
          <SlamWords
            trigger="intro"
            className="display mt-5 text-[17vw] sm:text-7xl lg:text-[5.6rem]"
            words={[
              { text: 'Treine.' },
              { text: 'Gerencie.', className: 'chalk' },
              { text: 'Evolua.', className: 'text-blue-2' },
            ]}
          />
          <Heartbeat />
          <Reveal trigger="intro" delay={0.5}>
            <RevealItem>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
                Ficha com vídeo e <b className="text-chalk">meta de carga</b>, o aluno anota o que pegou, avaliação física, anamnese e contrato no WhatsApp,
                Pix e IA. Tudo com <b className="text-chalk">a sua marca</b>.
              </p>
            </RevealItem>
            <RevealItem className="mt-7 flex flex-wrap gap-3">
              <a href={whatsappLink('Olá! Quero testar o KFit no meu studio.')} className="btn-lift inline-flex h-14 items-center gap-2 rounded-2xl px-6 text-base font-semibold text-white">
                Testar {SITE.trialDays} dias grátis <ArrowRight className="h-5 w-5" />
              </a>
              <a href="#como-funciona" className="inline-flex h-14 items-center gap-2 rounded-2xl border border-line bg-white/[0.03] px-5 text-base font-semibold text-chalk hover:bg-white/[0.06]">
                <Play className="h-4 w-4 fill-current" /> Ver como funciona
              </a>
            </RevealItem>
            <RevealItem className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-mute">
              <span><b className="display text-2xl normal-case text-chalk">173</b> exercícios com vídeo</span>
              <span><b className="display text-2xl normal-case text-chalk">11</b> medidas na avaliação</span>
              <span><b className="display text-2xl normal-case text-chalk">0</b> papel</span>
            </RevealItem>
          </Reveal>
        </div>

        {/* 4 · celular flutuando com paralaxe */}
        <motion.div style={{ y: phoneY }} className="relative mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 4 }}
            animate={ready ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <PhoneFrame>
                <WorkoutScreen mono={<Symbol className="h-7 w-auto" />} brandName="KFit" />
              </PhoneFrame>
            </motion.div>
          </motion.div>
          <motion.div className="absolute -left-20 bottom-44 hidden sm:block" animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <RestTimer />
          </motion.div>
          <motion.div
            className="absolute -right-8 bottom-28 flex items-center gap-2 rounded-2xl bg-pr px-3.5 py-2.5 text-sm font-bold text-ink shadow-xl"
            initial={{ scale: 0, rotate: -12 }}
            animate={ready ? { scale: 1, rotate: -6 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 1.4 }}
          >
            <Trophy className="h-4 w-4" /> NOVO RECORDE
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
