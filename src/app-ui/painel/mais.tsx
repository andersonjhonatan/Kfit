'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, LogOut, MessageCircle, Palette, Shield, Wallet } from 'lucide-react';
import { ago, api, ApiErr, brl, Btn, Card, Chip, ddmm, ErrorText, Eyebrow, Field, inputCls, MONTHS, Spinner, Title, useData, useToast } from '../kit';
import type { Nav } from './painel';

function Back({ nav }: { nav: Nav }) {
  return (
    <button type="button" onClick={() => nav.go('mais')} className="flex min-h-9 w-fit items-center gap-1 text-[13px] text-[#A1A1AA]">
      <ChevronLeft className="h-4 w-4" /> Mais
    </button>
  );
}

export function Mais({ nav, onLogout }: { nav: Nav; onLogout: () => void }) {
  const items = [
    { k: 'financeiro' as const, I: Wallet, t: 'Financeiro', d: 'Mensalidades do mês, baixas e cobrança' },
    { k: 'marca' as const, I: Palette, t: 'Minha marca', d: `${nav.me.studio.name} · logo, cor e link` },
    { k: 'seguranca' as const, I: Shield, t: 'Segurança e acesso', d: 'PIN, aparelhos e login dos alunos' },
  ];
  return (
    <>
      <Title>Mais</Title>
      <div className="flex flex-col gap-2">
        {items.map(({ k, I, t, d }) => (
          <button key={k} type="button" onClick={() => nav.go(k)} className="flex items-center gap-3 rounded-[18px] bg-[#141418] p-3.5 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--tc)]/15 text-[var(--tcL)]">
              <I className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{t}</span>
              <span className="block truncate text-xs text-[#A1A1AA]">{d}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-[#71717A]" />
          </button>
        ))}
      </div>
      <Card>
        <Eyebrow>Seu plano · {nav.me.studio.planName}</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-[#D4D4D8]">
          {nav.me.studio.isDemo
            ? 'Studio de demonstração: os dados voltam ao começo todo dia.'
            : nav.me.studio.access === 'active'
              ? 'Tudo liberado.'
              : 'Período de uso terminou: você consulta tudo, mas não edita.'}
        </p>
      </Card>
      <Btn kind="ghost" onClick={onLogout}>
        <LogOut className="h-4 w-4" /> Sair da conta
      </Btn>
    </>
  );
}

// ───────── Financeiro ─────────
type Fin = {
  period: string;
  pixKey: string;
  totals: { paid: number; open: number; late: number };
  counts: { paid: number; total: number };
  list: { id: string; name: string; phone: string; amountCents: number; dueDate: string; status: string; state: { kind: 'ok' | 'warn' | 'late'; label: string } }[];
};

export function Financeiro({ nav }: { nav: Nav }) {
  const { data, error, reload } = useData<Fin>('/api/p/financeiro', nav.auth);
  const toast = useToast();
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;
  const pct = data.counts.total ? Math.round((data.counts.paid / data.counts.total) * 100) : 0;

  const mark = async (id: string, status: 'pago' | 'aberto') => {
    try {
      await api(`/api/p/pagamentos/${id}`, 'POST', { status });
      toast(status === 'pago' ? 'Pagamento registrado' : 'Reaberto');
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };
  const charge = (r: Fin['list'][number]) => {
    const text = `Oi, ${r.name.split(' ')[0]}! Sua mensalidade de ${brl(r.amountCents)} ${r.state.kind === 'late' ? `venceu em ${ddmm(r.dueDate)}` : `vence em ${ddmm(r.dueDate)}`}.${data.pixKey ? `\nPix: ${data.pixKey}` : ''}\nQualquer dúvida é só chamar 🙏`;
    window.open(`https://wa.me/55${r.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <Back nav={nav} />
      <Title sub={`${MONTHS[Number(data.period.slice(5, 7)) - 1]} de ${data.period.slice(0, 4)}`}>Mensalidades</Title>
      <Card className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">
            {data.counts.paid} de {data.counts.total} pagos
          </span>
          <span className="text-[#A1A1AA]">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Recebido', data.totals.paid, 'text-emerald-300'],
            ['Em aberto', data.totals.open, 'text-amber-200'],
            ['Atrasado', data.totals.late, 'text-red-300'],
          ].map(([l, v, c]) => (
            <div key={l as string}>
              <p className="text-[11px] text-[#A1A1AA]">{l}</p>
              <p className={`text-sm font-bold ${c}`}>{brl(v as number)}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex flex-col gap-2">
        {data.list.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-[18px] bg-[#141418] p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-[#A1A1AA]">
                {brl(r.amountCents)} · vence {ddmm(r.dueDate)}
              </p>
            </div>
            {r.status === 'pago' ? (
              <button type="button" onClick={() => mark(r.id, 'aberto')}>
                <Chip kind="ok">Pago</Chip>
              </button>
            ) : (
              <>
                <button type="button" aria-label={`Cobrar ${r.name} no WhatsApp`} onClick={() => charge(r)} className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <Btn className="min-h-9 px-3 text-xs" onClick={() => mark(r.id, 'pago')}>
                  Recebi
                </Btn>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ───────── Minha marca ─────────
const COLORS = ['#2563EB', '#DC2626', '#EA580C', '#16A34A', '#0D9488', '#7C3AED', '#DB2777', '#111827'];

export function Marca({ nav }: { nav: Nav }) {
  const s = nav.me.studio;
  const [f, setF] = useState({ name: s.name, tagline: s.tagline, color: s.color, mono: s.mono, shape: s.shape, pixKey: s.pixKey });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const link = typeof window !== 'undefined' ? `${location.origin}/a/${s.slug}` : '';
  const radius = f.shape === 'round' ? '999px' : f.shape === 'shield' ? '12px 12px 24px 24px' : '14px';

  return (
    <>
      <Back nav={nav} />
      <Title sub="Seus alunos veem a sua marca no app, não a do KFit.">Minha marca</Title>
      <Card className="flex items-center gap-3">
        <span className="kx grid h-14 w-14 flex-none place-items-center text-lg text-white" style={{ background: f.color, borderRadius: radius }}>
          {f.mono.toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="kx truncate text-lg">{f.name}</p>
          <p className="truncate text-xs text-[#A1A1AA]">{f.tagline}</p>
        </div>
      </Card>
      <Card className="flex flex-col gap-2">
        <Eyebrow>Link do app dos seus alunos</Eyebrow>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-[#0B0B0C] px-3 py-2.5 text-[13px]">{link}</code>
          <Btn
            kind="soft"
            className="min-h-10"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              toast('Link copiado');
            }}
          >
            <Copy className="h-4 w-4" />
          </Btn>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        <Field label="Nome do studio ou do personal">
          <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Frase">
          <input className={inputCls} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} placeholder="Funcional e musculação" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Iniciais (até 3)">
            <input className={inputCls} value={f.mono} maxLength={3} onChange={(e) => setF({ ...f, mono: e.target.value })} />
          </Field>
          <Field label="Formato">
            <div className="flex gap-2">
              {[
                ['round', 'Redondo'],
                ['square', 'Quadrado'],
                ['shield', 'Escudo'],
              ].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setF({ ...f, shape: k })} className={`min-h-12 flex-1 rounded-xl text-xs font-semibold ${f.shape === k ? 'bg-[var(--tc)] text-white' : 'border border-white/15'}`}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Cor">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button key={c} type="button" aria-label={`Cor ${c}`} aria-pressed={f.color === c} onClick={() => setF({ ...f, color: c })} className={`h-10 w-10 rounded-full ${f.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B0B0C]' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </Field>
        <Field label="Chave Pix (aparece na cobrança)">
          <input className={inputCls} value={f.pixKey} onChange={(e) => setF({ ...f, pixKey: e.target.value })} placeholder="e-mail, CPF, telefone ou aleatória" />
        </Field>
        <ErrorText>{err}</ErrorText>
        <Btn
          className="h-12"
          busy={busy}
          onClick={async () => {
            setBusy(true);
            setErr('');
            try {
              await api('/api/p/marca', 'PATCH', f);
              toast('Marca salva');
              nav.reloadMe();
            } catch (e) {
              nav.auth(e as ApiErr);
              setErr((e as ApiErr).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Salvar
        </Btn>
      </div>
    </>
  );
}

// ───────── Segurança ─────────
type Sec = {
  settings: { lockAfterMin: number; alertNewDevice: boolean };
  devices: { id: string; label: string; lastSeenAt: string; current: boolean }[];
  log: { at: string; text: string; detail: string; bad: boolean }[];
  students: { active: number; pending: number; paused: number };
};

export function Seguranca({ nav, onLogout, onLock }: { nav: Nav; onLogout: () => void; onLock: () => void }) {
  const { data, error, reload } = useData<Sec>('/api/p/seguranca', nav.auth);
  const toast = useToast();
  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!data) return <Spinner />;

  const patch = async (v: Partial<Sec['settings']>) => {
    try {
      await api('/api/p/seguranca', 'PATCH', v);
      reload();
      nav.reloadMe();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };
  const call = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast(msg);
      reload();
    } catch (e) {
      nav.auth(e as ApiErr);
      toast((e as ApiErr).message);
    }
  };

  return (
    <>
      <Back nav={nav} />
      <Title sub="Se alguém pegar seu celular, não entra nos dados dos alunos.">Segurança e acesso</Title>
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span>
            <span className="block text-[15px] font-semibold">PIN do app</span>
            <span className="text-xs text-[#A1A1AA]">Pede sempre que o app fica parado</span>
          </span>
          <Btn kind="ghost" className="min-h-10" onClick={onLock}>
            Bloquear agora
          </Btn>
        </div>
        <div>
          <p className="mb-2 text-xs text-[#A1A1AA]">Bloquear sozinho depois de parado por</p>
          <div className="flex gap-2">
            {[1, 5, 15].map((m) => (
              <button key={m} type="button" onClick={() => patch({ lockAfterMin: m })} className={`min-h-10 flex-1 rounded-xl text-[13px] font-semibold ${data.settings.lockAfterMin === m ? 'bg-[var(--tc)] text-white' : 'border border-white/15 text-[#D4D4D8]'}`}>
                {m} min
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3">
          <span className="flex-1">
            <span className="block text-sm font-semibold">Avisar quando entrarem num aparelho novo</span>
            <span className="text-xs text-[#A1A1AA]">Chega uma mensagem no seu WhatsApp na hora.</span>
          </span>
          <input type="checkbox" className="h-6 w-6 accent-[var(--tc)]" checked={data.settings.alertNewDevice} onChange={(e) => patch({ alertNewDevice: e.target.checked })} />
        </label>
      </Card>

      <Card className="flex flex-col gap-3">
        <Eyebrow>Aparelhos conectados</Eyebrow>
        {data.devices.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{d.label}</span>
              <span className="text-xs text-[#A1A1AA]">{d.current ? 'agora' : ago(d.lastSeenAt)}</span>
            </span>
            {d.current ? (
              <Chip kind="ok">Este</Chip>
            ) : (
              <Btn kind="danger" className="min-h-9 px-3 text-xs" onClick={() => call(() => api(`/api/p/seguranca/aparelhos/${d.id}`, 'DELETE'), `${d.label} desconectado`)}>
                Desconectar
              </Btn>
            )}
          </div>
        ))}
        {data.devices.length > 1 && (
          <Btn kind="danger" onClick={() => call(() => api('/api/p/seguranca/sair-todos', 'POST'), 'Os outros aparelhos foram desconectados')}>
            Sair de todos os outros aparelhos
          </Btn>
        )}
      </Card>

      <Card className="flex flex-col gap-2.5">
        <Eyebrow>Últimos acessos</Eyebrow>
        {data.log.length === 0 && <p className="text-sm text-[#A1A1AA]">Nada ainda.</p>}
        {data.log.slice(0, 12).map((l, i) => (
          <div key={i}>
            <p className="text-[11px] text-[#71717A]">{new Date(l.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
            <p className={`text-[13px] ${l.bad ? 'text-red-300' : 'text-[#D4D4D8]'}`}>
              {l.text}
              {l.detail ? ` · ${l.detail}` : ''}
            </p>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-2">
        <Eyebrow>Como o aluno entra</Eyebrow>
        <p className="text-xs text-[#A1A1AA]">
          {data.students.active} com senha · {data.students.pending} aguardando o primeiro acesso{data.students.paused ? ` · ${data.students.paused} pausado(s)` : ''}
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-snug text-[#D4D4D8]">
          <li>Só entra quem você cadastrou, pelo número de WhatsApp.</li>
          <li>Na primeira vez, recebe um código de 6 números no WhatsApp (vale 10 minutos e uma vez só) e cria a senha.</li>
          <li>Depois, entra com telefone e senha.</li>
          <li>Errou a senha 5 vezes: o login trava por 15 minutos.</li>
          <li>O aluno só vê os próprios treinos, avaliações e pagamentos.</li>
          <li>Você pode pausar o acesso de um aluno a qualquer hora, na ficha dele.</li>
        </ol>
      </Card>
      <Btn kind="ghost" onClick={onLogout}>
        <LogOut className="h-4 w-4" /> Sair da conta
      </Btn>
    </>
  );
}
