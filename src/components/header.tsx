'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/site';
import { Logo } from './brand';

const LINKS = [
  ['Como funciona', '#como-funciona'],
  ['Recursos', '#recursos'],
  ['Sua marca', '#sua-marca'],
  ['Planos', '#planos'],
  ['Dúvidas', '#duvidas'],
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'border-b border-line bg-ink/85 backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-20">
        <a href="#" aria-label="KFit, início">
          <Logo className="h-9 w-auto sm:h-10" />
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-mute md:flex">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} className="transition-colors hover:text-chalk">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={whatsappLink('Olá! Quero testar o KFit.')} className="btn-lift hidden h-11 items-center rounded-xl px-4 text-sm font-semibold text-white sm:inline-flex">
            Testar {SITE.trialDays} dias grátis
          </a>
          <button type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-line px-5 pb-5 md:hidden">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="display block border-b border-line py-4 text-2xl">{l}</a>
          ))}
          <a href={whatsappLink('Olá! Quero testar o KFit.')} className="btn-lift mt-5 flex h-14 items-center justify-center rounded-2xl font-semibold text-white">
            Testar {SITE.trialDays} dias grátis
          </a>
        </motion.nav>
      )}
    </header>
  );
}
