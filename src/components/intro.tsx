'use client';

/**
 * Abertura do site (1ª visita da sessão): a barra aparece, as anilhas batem dos
 * dois lados, o K e o Fit entram, o arco passa e o halter é "levantado",
 * abrindo a cortina para o site. ~2,6 s. Toque em qualquer lugar para pular.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { ARC_PATH, FIT_PATH, K_PATH, LOGO_DEFS } from '@/lib/brand-svg';

const KEY = 'kfit-intro-v1';

export function Intro() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'build' | 'lift' | 'open'>('build');
  const shake = useAnimationControls();

  useEffect(() => {
    const el = document.documentElement;
    if (el.getAttribute('data-intro') !== 'pending') return;
    setShow(true);
    el.setAttribute('data-intro', 'playing');
    const t: number[] = [];
    // impacto das anilhas: tremidinha na tela
    t.push(window.setTimeout(() => shake.start({ x: [0, -5, 4, -2, 0], transition: { duration: 0.22 } }), 420));
    t.push(window.setTimeout(() => shake.start({ x: [0, 6, -4, 2, 0], transition: { duration: 0.22 } }), 640));
    t.push(window.setTimeout(() => setPhase('lift'), 1850));
    t.push(window.setTimeout(() => setPhase('open'), 2250));
    t.push(window.setTimeout(() => finish(), 2900));
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {}
    document.documentElement.setAttribute('data-intro', 'done');
    setShow(false);
  }

  const plate = (delay: number, from: number) => ({
    initial: { x: from, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 700, damping: 22, mass: 1.1, delay },
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] cursor-pointer"
          onClick={finish}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          role="presentation"
        >
          {/* cortina em duas metades */}
          <motion.div
            className="gym-floor absolute inset-x-0 top-0 h-1/2 bg-ink"
            animate={phase === 'open' ? { y: '-100%' } : { y: 0 }}
            transition={{ duration: 0.65, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.div
            className="gym-floor absolute inset-x-0 bottom-0 h-1/2 bg-ink"
            animate={phase === 'open' ? { y: '100%' } : { y: 0 }}
            transition={{ duration: 0.65, ease: [0.7, 0, 0.2, 1] }}
          />
          {/* brilho azul atrás */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgb(37 99 235 / 0.35), transparent 65%)' }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={phase === 'open' ? { opacity: 0 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
          />

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
            animate={phase === 'open' ? { opacity: 0, scale: 1.08 } : {}}
            transition={{ duration: 0.4 }}
          >
            <motion.div animate={shake} className="w-full max-w-[560px]">
              <motion.svg
                viewBox="-8 -160 458.7 190"
                className="w-full overflow-visible"
                aria-label="KFit"
                animate={phase !== 'build' ? { y: -46, scale: 1.04 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 14 }}
              >
                <g dangerouslySetInnerHTML={{ __html: LOGO_DEFS }} />
                {/* barra crescendo do centro */}
                <motion.rect
                  x="45" y="-57" width="352.7" height="14" rx="3" fill="#9AA3AF"
                  style={{ transformOrigin: '221px -50px' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1, opacity: [1, 1, 0] }}
                  transition={{ scaleX: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }, opacity: { delay: 0.95, duration: 0.2, times: [0, 0.5, 1] } }}
                />
                {/* anilhas esquerdas (prata) */}
                <motion.g {...plate(0.32, -180)}>
                  <rect x="23" y="-125" width="24" height="150" rx="7" fill="url(#sglogo)" />
                  <rect x="45" y="-57" width="28" height="14" rx="3" fill="#9AA3AF" />
                </motion.g>
                <motion.g {...plate(0.54, -220)}>
                  <rect x="0" y="-102" width="17" height="104" rx="6" fill="#8E97A4" />
                </motion.g>
                {/* anilhas direitas (azuis) */}
                <motion.g {...plate(0.32, 180)}>
                  <rect x="395.7" y="-125" width="24" height="150" rx="7" fill="#2563EB" />
                  <rect x="369.7" y="-57" width="28" height="14" rx="3" fill="#2563EB" />
                </motion.g>
                <motion.g {...plate(0.54, 220)}>
                  <rect x="425.7" y="-102" width="17" height="104" rx="6" fill="#3B82F6" />
                </motion.g>
                {/* clarão do impacto */}
                {[60, 382].map((cx, i) => (
                  <motion.circle key={cx} cx={cx} cy={-50} r={40} fill="white"
                    initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: [0, 0.5, 0], scale: [0.2, 1.6, 2] }}
                    transition={{ duration: 0.4, delay: 0.42 + i * 0.01 }} style={{ transformOrigin: `${cx}px -50px` }} />
                ))}
                <g transform="translate(81 0)">
                  <motion.path d={K_PATH} fill="url(#kglogo)"
                    initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 20, delay: 0.82 }} />
                  <motion.path d={FIT_PATH} fill="url(#fglogo)"
                    initial={{ x: 70, opacity: 0, skewX: -14 }} animate={{ x: 0, opacity: 1, skewX: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24, delay: 1.0 }} />
                  <motion.path d={ARC_PATH} fill="url(#aglogo)"
                    initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.2 }} />
                </g>
              </motion.svg>
            </motion.div>
            <motion.p
              className="display text-center text-sm tracking-[0.35em] text-mute sm:text-base"
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, letterSpacing: '0.35em' }}
              transition={{ duration: 0.7, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
            >
              Treine. Gerencie. <span className="text-blue-2">Evolua.</span>
            </motion.p>
          </motion.div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-6 right-6 rounded-full border border-line px-4 py-2 text-xs font-semibold text-mute"
          >
            Pular
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

