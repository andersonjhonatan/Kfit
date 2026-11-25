'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, RotateCcw } from 'lucide-react';
import { DCHost } from './runtime';
import { TEMPLATE } from './template';
import Logic from './logic';
import { SITE, whatsappLink } from '@/lib/site';
import { Logo } from '@/components/brand';

const W = 390;
const H = 844;

/** Em telas pequenas o app ocupa a tela inteira; no computador, aparece num celular. */
function useLayout() {
  const [state, setState] = useState<{ phone: boolean; scale: number } | null>(null);
  useEffect(() => {
    const on = () => {
      const phone = window.innerWidth < 760;
      const scale = Math.min(1, (window.innerHeight - 48) / (H + 24));
      setState({ phone, scale });
    };
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return state;
}

const fluid = (v: Record<string, unknown>) => ({
  ...v,
  rootStyle: String(v.rootStyle).replace('width: 390px; height: 844px', 'width: 100%; height: 100%'),
});

export default function DemoClient() {
  const layout = useLayout();
  const [run, setRun] = useState(0);

  useEffect(() => {
    // a demonstração é sempre no tema escuro (o app é escuro), sem mexer na escolha salva do site
    const root = document.documentElement;
    const before = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'dark');
    root.style.background = '#0B0B0C';
    document.body.style.background = '#0B0B0C';
    return () => {
      if (before) root.setAttribute('data-theme', before);
      root.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  if (!layout) return <div style={{ minHeight: '100dvh', background: '#0B0B0C' }} />;

  const app = (
    <div className="kfit-proto" style={{ width: '100%', height: '100%' }}>
      <DCHost key={run} template={TEMPLATE} Logic={Logic as never} patch={fluid} />
    </div>
  );

  if (layout.phone) {
    return <div style={{ position: 'fixed', inset: 0, background: '#0B0B0C', overflow: 'hidden' }}>{app}</div>;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center gap-14 bg-[#0B0B0C] px-8 py-6 text-[#F5F5F7]">
      <aside className="flex max-w-[340px] flex-col gap-6">
        <a href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#A1A1AA] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </a>
        <Logo className="h-11 w-auto self-start" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#93C5FD]">Demonstração</p>
          <h1 className="display mt-2 text-3xl leading-tight">Veja o KFit funcionando</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
            Um studio de exemplo com alunos, fichas, avaliações e pagamentos. Toque em tudo: nada aqui é salvo.
          </p>
        </div>
        <ol className="flex flex-col gap-3 text-sm leading-relaxed text-[#D4D4D8]">
          <li className="rounded-2xl bg-[#141418] p-4">
            <b className="text-white">Personal.</b> Entre com a senha <b className="text-[#93C5FD]">kfit123</b>. O código chega numa
            notificação de exemplo e você cria o PIN do app.
          </li>
          <li className="rounded-2xl bg-[#141418] p-4">
            <b className="text-white">Aluno.</b> Toque em <b>Aluno</b> no topo. O número da Ana já vem preenchido: confirme o código e
            crie a senha. O app aparece com a marca do personal.
          </li>
        </ol>
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappLink('Olá! Vi a demonstração do KFit e quero saber mais.')}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> Quero o KFit
          </a>
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-[#D4D4D8] hover:bg-white/5"
          >
            <RotateCcw className="h-4 w-4" /> Recomeçar
          </button>
        </div>
        <p className="text-xs text-[#71717A]">
          {SITE.trialDays} dias grátis para testar com os seus alunos.
        </p>
      </aside>

      <div style={{ width: (W + 24) * layout.scale, height: (H + 24) * layout.scale, flex: 'none' }}>
        <div
          style={{
            width: W + 24,
            height: H + 24,
            transform: `scale(${layout.scale})`,
            transformOrigin: 'top left',
            padding: 12,
            borderRadius: 56,
            background: 'linear-gradient(150deg, #2a2d33, #121317 40%, #1c1e23)',
            boxShadow: '0 40px 80px -30px rgba(37,99,235,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset',
          }}
        >
          <div style={{ width: W, height: H, borderRadius: 44, overflow: 'hidden', position: 'relative', background: '#0B0B0C' }}>{app}</div>
        </div>
      </div>
    </div>
  );
}
