'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { api, ApiErr, Title } from '../kit';
import type { Nav } from './painel';

type Msg = { role: 'user' | 'assistant'; text: string };
const SUGGEST = ['Quem está sumido?', 'Resumo da semana', 'Montar treino para iniciante', 'Escrever mensagem de cobrança gentil'];

export function Assistente({ nav }: { nav: Nav }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: `Oi, ${nav.me.staff.firstName}! Eu conheço seus alunos, treinos e mensalidades. Posso montar treinos, achar quem sumiu, resumir a semana e escrever mensagens. Pergunte ou toque numa sugestão.` },
  ]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const send = async (q: string) => {
    if (!q.trim() || busy) return;
    const history = msgs.slice(1).slice(-8);
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setText('');
    setBusy(true);
    try {
      const r = await api<{ text: string }>('/api/p/ia', 'POST', { message: q, history });
      setMsgs((m) => [...m, { role: 'assistant', text: r.text }]);
    } catch (e) {
      nav.auth(e as ApiErr);
      setMsgs((m) => [...m, { role: 'assistant', text: (e as ApiErr).message }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#C9CED6] to-[#6B7280] text-[#0B0B0C]">
          <Sparkles className="h-5 w-5" />
        </span>
        <Title sub="Inteligência artificial que conhece seus alunos">Assistente KFit</Title>
      </div>
      <div className="flex flex-col gap-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${m.role === 'user' ? 'self-end rounded-br-md bg-[var(--tc)] text-white' : 'self-start rounded-bl-md bg-[#141418] text-[#E4E4E7]'}`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="flex gap-1.5 self-start rounded-2xl bg-[#141418] px-4 py-4">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-[#A1A1AA]" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGEST.map((s) => (
          <button key={s} type="button" onClick={() => send(s)} className="min-h-9 rounded-full border border-[var(--tc2)]/40 px-3.5 text-[13px] text-[var(--tcL)]">
            {s}
          </button>
        ))}
      </div>
      <form
        className="sticky bottom-20 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          placeholder="Pergunte sobre seus alunos…"
          className="h-12 flex-1 rounded-xl border border-white/15 bg-[#141418] px-4 text-[15px] outline-none focus:border-[var(--tc2)]"
        />
        <button type="submit" aria-label="Enviar" disabled={busy || !text.trim()} className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--tc)] text-white disabled:opacity-40">
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </>
  );
}
