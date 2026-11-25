'use client';

import { ArrowUp, AtSign, Lock, Mail, MessageCircle, QrCode, Smartphone, Wallet } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/site';
import { Dumbbell, Logo } from './brand';
import { ThemeToggle } from './theme';

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

const COLS: { t: string; links: [string, string, boolean?][] }[] = [
  { t: 'Produto', links: [['Como funciona', '#como-funciona'], ['Ver demonstração', '/demo'], ['Recursos', '#recursos'], ['Sua marca', '#sua-marca'], ['Planos', '#planos'], ['Dúvidas', '#duvidas']] },
  { t: 'Recursos', links: [['Ficha com vídeo e meta de carga', '#recursos'], ['Avaliação física', '#recursos'], ['Anamnese, PAR-Q e contrato', '#recursos'], ['Pix e cobrança automática', '#recursos'], ['Assistente com IA', '#recursos'], ['Modo TV do studio', '#recursos']] },
  { t: 'Para quem', links: [['Personal trainer', whatsappLink('Olá! Sou personal trainer e quero conhecer o KFit.'), true], ['Studio de funcional', whatsappLink('Olá! Tenho um studio de funcional e quero conhecer o KFit.'), true], ['Consultoria online', whatsappLink('Olá! Faço consultoria online e quero conhecer o KFit.'), true], ['Pequenas academias', whatsappLink('Olá! Tenho uma academia e quero conhecer o KFit.'), true]] },
  { t: 'TresK Tecnologia', links: [['Sobre a TresK', 'https://www.tresktecnologia.com.br', true], ['KORT · agenda para barbearias', 'https://kort.tresktecnologia.com.br', true], ['KFOOD · pedidos para comida', whatsappLink('Olá! Quero saber do KFOOD.'), true]] },
];

const TRUST = [
  { icon: Lock, t: 'Dados separados por personal' },
  { icon: Smartphone, t: 'Feito para o celular' },
  { icon: Wallet, t: 'Cobrança por Pix' },
  { icon: QrCode, t: 'Link próprio do seu studio' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-2">
      <div aria-hidden="true" className="display outline-text pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 whitespace-nowrap text-[30vw] leading-none sm:text-[22vw]">
        KFit
      </div>

      {/* faixa de confiança */}
      <div className="relative border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-6 sm:grid-cols-4">
          {TRUST.map((x) => (
            <div key={x.t} className="flex items-center gap-3 py-2">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blue/15 text-ice"><x.icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold leading-tight text-chalk">{x.t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-40 pt-14 sm:pb-56 lg:grid-cols-[1.3fr_2.7fr]">
        <div>
          <Logo className="h-11 w-auto" />
          <p className="mt-5 max-w-xs leading-relaxed text-mute">
            O app do personal trainer e do studio. Treino com meta de carga, avaliação, contrato e cobrança, com a sua marca.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={whatsappLink('Olá! Quero conhecer o KFit.')} className="btn-lift inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white">
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
            <a href={`https://instagram.com/${SITE.instagram}`} aria-label="Instagram da TresK Tecnologia" className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card text-chalk hover:border-blue">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-mute">
            <li className="flex items-center gap-2.5"><MessageCircle className="h-4 w-4 text-ice" /> (87) 99110-4152</li>
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-ice" /> contato@tresktecnologia.com.br</li>
            <li className="flex items-center gap-2.5"><AtSign className="h-4 w-4 text-ice" /> @{SITE.instagram}</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {COLS.map((c) => (
            <nav key={c.t} aria-label={c.t}>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-chalk">
                <Dumbbell className="h-2.5 w-5" color="#3B82F6" /> {c.t}
              </p>
              <ul className="mt-4 space-y-3">
                {c.links.map(([l, h, ext]) => (
                  <li key={l}>
                    <a href={h} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="text-sm text-mute transition-colors hover:text-chalk">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="relative border-t border-line bg-ink-2/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-dim sm:flex-row">
          <p>© {new Date().getFullYear()} TresK Tecnologia · Ibimirim-PE · Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="#" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-4 font-semibold text-chalk hover:border-blue">
              <ArrowUp className="h-4 w-4" /> Voltar ao topo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
