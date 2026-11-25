'use client';

/**
 * Cabeçalho + menu "de academia".
 * O botão é feito de 3 halteres; ao abrir, o do meio sai de lado e os outros dois
 * cruzam formando um X. O menu desce como a porta de aço do studio e cada item
 * cai como uma placa da torre de pesos (estação de musculação), com o pino
 * marcando a escolha. Ao fechar, as placas sobem de volta e a porta recolhe.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/site';
import { Logo } from './brand';
import { ThemeToggle } from './theme';

const LINKS = [
  ['Como funciona', '#como-funciona', 10],
  ['Recursos', '#recursos', 20],
  ['Sua marca', '#sua-marca', 30],
  ['Planos', '#planos', 40],
  ['Dúvidas', '#duvidas', 50],
  ['Demonstração', '/demo', 60],
  ['Entrar', '/painel', 70],
] as const;

/** Um halter pequeno desenhado em SVG */
function MiniDumbbell({ w = 22 }: { w?: number }) {
  return (
    <svg viewBox="0 0 26 7" style={{ width: w, height: (w / 26) * 7 }} aria-hidden="true">
      <rect x="0" y="1.5" width="2.2" height="4" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="2.8" y="0" width="3" height="7" rx="1.2" fill="currentColor" />
      <rect x="5.8" y="2.7" width="14.4" height="1.6" rx="0.8" fill="currentColor" opacity="0.8" />
      <rect x="20.2" y="0" width="3" height="7" rx="1.2" fill="#3B82F6" />
      <rect x="23.8" y="1.5" width="2.2" height="4" rx="1" fill="#3B82F6" opacity="0.8" />
    </svg>
  );
}

/** Botão do menu: 3 halteres que viram um X */
function DumbbellButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  const spring = { type: 'spring' as const, stiffness: 420, damping: 26 };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      aria-expanded={open}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-card text-chalk md:hidden"
    >
      {/* suporte de halteres: três tamanhos, levemente desencontrados */}
      <motion.span className="absolute flex" animate={open ? { x: 0, y: 0, rotate: 45 } : { x: -2, y: -7, rotate: 0 }} transition={spring}>
        <MiniDumbbell w={open ? 22 : 18} />
      </motion.span>
      <motion.span className="absolute flex" animate={open ? { x: 28, opacity: 0, rotate: 25 } : { x: 2, y: 0, opacity: 1, rotate: 0 }} transition={spring}>
        <MiniDumbbell w={22} />
      </motion.span>
      <motion.span className="absolute flex" animate={open ? { x: 0, y: 0, rotate: -45 } : { x: -1, y: 7, rotate: 0 }} transition={spring}>
        <MiniDumbbell w={open ? 22 : 20} />
      </motion.span>
    </button>
  );
}

// A porta de aço desce primeiro; as placas caem depois, uma por uma.
// Na volta: as placas sobem (de baixo para cima) e só então a porta recolhe.
const gate: Variants = {
  closed: { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.42, ease: [0.7, 0, 0.84, 0], when: 'afterChildren', staggerChildren: 0.045, staggerDirection: -1 } },
  open: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], when: 'beforeChildren', staggerChildren: 0.07, delayChildren: 0.02 },
  },
};
const plate: Variants = {
  closed: { y: -70, opacity: 0, rotateX: 35, transition: { duration: 0.22, ease: [0.7, 0, 0.84, 0] } },
  open: { y: 0, opacity: 1, rotateX: 0, transition: { type: 'spring', stiffness: 520, damping: 22, mass: 1.1 } },
};
const fade: Variants = {
  closed: { opacity: 0, y: 16, transition: { duration: 0.15 } },
  open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState<number | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // trava a rolagem do site com o menu aberto
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) setPin(null);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const go = (k: number, href: string) => {
    setPin(k);
    // deixa ver o pino entrar na placa antes de fechar
    window.setTimeout(() => {
      setOpen(false);
      window.setTimeout(() => {
        if (href.startsWith('/')) window.location.href = href;
        else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 380);
    }, 260);
  };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled && !open ? 'border-b border-line bg-ink/90 backdrop-blur-xl' : 'border-b border-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-20">
          <a href="#" aria-label="KFit, início">
            <Logo className="h-9 w-auto sm:h-10" />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-mute md:flex">
            {LINKS.filter(([, h]) => h !== '/painel').map(([l, h]) => (
              <a key={h} href={h} className="transition-colors hover:text-chalk">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />
            <a href="/painel" className="hidden h-11 items-center rounded-xl px-3 text-sm font-semibold text-mute hover:text-chalk lg:inline-flex">
              Entrar
            </a>
            <a href={whatsappLink('Olá! Quero testar o KFit.')} className="btn-lift hidden h-11 items-center rounded-xl px-4 text-sm font-semibold text-white sm:inline-flex">
              Testar {SITE.trialDays} dias grátis
            </a>
            <DumbbellButton open={open} onClick={() => setOpen(!open)} />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="gym-menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink md:hidden"
            variants={gate}
            initial="closed"
            animate="open"
            exit="closed"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            {/* frisos da porta de aço + piso de borracha */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 22px, var(--line) 22px 23px)' }} />
            <div aria-hidden="true" className="gym-floor pointer-events-none absolute inset-0" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgb(37 99 235 / 0.25), transparent 65%)' }} />

            <div className="relative flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-20" style={{ perspective: 900 }}>
              <motion.p variants={fade} className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-dim">
                <span className="h-1.5 w-5 rounded-full bg-blue" /> Escolha a carga
              </motion.p>

              {/* torre de pesos: haste guia + placas */}
              <div className="relative">
                <div aria-hidden="true" className="absolute bottom-2 right-[30px] top-2 w-[6px] rounded-full bg-gradient-to-b from-[#d4d8de] to-[#8e97a4] opacity-80" />
                <div className="flex flex-col gap-2">
                  {LINKS.map(([label, href, kg], k) => {
                    const on = pin === k;
                    return (
                      <motion.a
                        key={href}
                        href={href}
                        variants={plate}
                        onClick={(e) => { e.preventDefault(); go(k, href); }}
                        whileTap={{ scale: 0.98, y: 2 }}
                        className="relative flex h-[62px] items-center gap-4 overflow-hidden rounded-[14px] border px-4 text-chalk"
                        style={{
                          transformOrigin: 'top center',
                          borderColor: on ? '#3B82F6' : 'var(--line)',
                          background: on
                            ? 'linear-gradient(180deg, rgb(37 99 235 / 0.28), rgb(37 99 235 / 0.12))'
                            : 'linear-gradient(180deg, var(--ink-3), var(--card))',
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.06), 0 6px 14px -8px rgb(0 0 0 / 0.5)',
                        }}
                      >
                        <span className="display w-12 flex-none text-left text-[13px] normal-case text-dim">
                          {kg}<span className="text-[10px]"> kg</span>
                        </span>
                        <span className="display flex-1 text-[19px] leading-none">{label}</span>
                        {/* furo da placa e o pino */}
                        <span className="relative mr-[11px] flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-line bg-ink">
                          <AnimatePresence>
                            {on && (
                              <motion.span
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 24 }}
                                className="absolute right-[-26px] h-[8px] w-[34px] rounded-full bg-blue shadow-[0_0_12px_rgb(59_130_246/0.8)]"
                              />
                            )}
                          </AnimatePresence>
                        </span>
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              <motion.div variants={fade} className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3">
                <span className="text-sm font-semibold text-mute">Tema claro ou escuro</span>
                <ThemeToggle />
              </motion.div>

              <motion.a
                variants={fade}
                href={whatsappLink('Olá! Quero testar o KFit.')}
                className="btn-lift mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl font-semibold text-white"
              >
                Testar {SITE.trialDays} dias grátis <ArrowRight className="h-5 w-5" />
              </motion.a>
              <motion.p variants={fade} className="mt-4 text-center text-xs text-dim">
                Treine. Gerencie. <span className="text-blue-2">Evolua.</span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
