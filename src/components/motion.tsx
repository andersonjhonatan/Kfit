'use client';

/**
 * Animações do site do KFit (Motion). Tudo é decorativo: o texto já vem pronto do
 * servidor. Com "reduzir movimento" no sistema, os deslocamentos são desligados.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { animate, motion, MotionConfig, useInView, type Variants } from 'motion/react';

export const EASE = [0.16, 1, 0.3, 1] as const;
export const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -8% 0px' } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** `true` quando a abertura terminou (ou não tocou) */
export function useIntroReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const check = () => {
      const p = el.getAttribute('data-intro');
      if (p !== 'pending' && p !== 'playing') setReady(true);
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ['data-intro'] });
    return () => obs.disconnect();
  }, []);
  return ready;
}

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/** 1 e 2 · Entra ao rolar, filhos em cascata (como séries uma depois da outra) */
export function Reveal({
  children,
  className,
  style,
  stagger = 0.08,
  delay = 0,
  trigger = 'view',
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delay?: number;
  trigger?: 'view' | 'intro';
}) {
  const ready = useIntroReady();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const on = trigger === 'intro' ? ready : inView;
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={on ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={item}>
      {children}
    </motion.div>
  );
}

/** Palavras do título "batendo" uma de cada vez, como anilhas encaixando na barra */
export function SlamWords({ words, className, trigger = 'view' }: { words: { text: string; className?: string }[]; className?: string; trigger?: 'view' | 'intro' }) {
  const ready = useIntroReady();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const on = trigger === 'intro' ? ready : inView;
  return (
    <h1 ref={ref} className={className} aria-label={words.map((w) => w.text).join(' ')}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`block ${w.className ?? ''}`}
          initial={{ opacity: 0, x: i % 2 ? 80 : -80, skewX: -12 }}
          animate={on ? { opacity: 1, x: 0, skewX: 0 } : {}}
          transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.9, delay: 0.12 + i * 0.16 }}
        >
          {w.text}
        </motion.span>
      ))}
    </h1>
  );
}

/** 5 · Número contando até o valor quando aparece */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', className }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {v.toFixed(decimals).replace('.', ',')}
      {suffix}
    </span>
  );
}
