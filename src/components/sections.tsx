'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import {
  Activity, Bot, CalendarCheck, ChevronDown, ClipboardCheck, Dumbbell as DumbbellIcon, FileSignature, Flame,
  MessageCircle, MonitorPlay, QrCode, Ruler, Timer, UserPlus, Wallet,
} from 'lucide-react';
import { DEMO_BRANDS, SITE, whatsappLink } from '@/lib/site';
import { BrandBadge, Dumbbell, Symbol } from './brand';
import { CountUp, Reveal, RevealItem, EASE } from './motion';
import { PhoneFrame, WorkoutScreen } from './phone';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-ice">
      <span className="h-1.5 w-6 rounded-full bg-blue" /> {children}
    </span>
  );
}

// ───────────── 3 · Faixas de recursos passando ─────────────
const BAND_A = ['Ficha com vídeo', 'Meta de carga', 'O aluno anota o que pegou', 'Avaliação física', 'Pollock 3 e 7 dobras', 'PAR-Q', 'Contrato digital', 'Pix automático'];
const BAND_B = ['WhatsApp', 'Inteligência artificial', 'Agenda e link', 'Hábitos', 'Conquistas', 'Modo TV', 'Turmas e check-in', 'Sua marca'];

export function Marquee() {
  const row = (items: string[], dark: boolean) => (
    <div className="flex w-max items-center">
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center gap-6 pr-6">
          <span className={`display whitespace-nowrap text-lg sm:text-2xl ${dark ? 'text-[#0b0b0c]' : 'text-chalk'}`}>{t}</span>
          <Dumbbell className="h-4 w-9 flex-none" color={dark ? '#0b0b0c' : '#3B82F6'} />
        </span>
      ))}
    </div>
  );
  return (
    <section aria-label="Recursos do KFit" className="relative z-10 -my-4 overflow-hidden py-10">
      <div className="-rotate-2 bg-blue py-4 shadow-[0_20px_60px_-20px_rgb(37_99_235/0.8)]">
        <div className="marquee">{row(BAND_A, true)}</div>
      </div>
      <div className="mt-[-6px] rotate-1 border-y border-line bg-ink-3 py-4">
        <div className="marquee-rev">{row(BAND_B, false)}</div>
      </div>
    </section>
  );
}

// ───────────── Como funciona: um treino em 3 séries ─────────────
const STEPS = [
  { icon: UserPlus, set: '1', t: 'Cadastre o aluno', d: 'Nome e WhatsApp. O KFit envia sozinho o convite do app, a anamnese com PAR-Q e o contrato para assinar com o dedo.' },
  { icon: ClipboardCheck, set: '2', t: 'Monte o treino com meta', d: 'Escolha entre 173 exercícios com vídeo, ou use um modelo pronto. Defina séries, repetições, carga e descanso.' },
  { icon: Activity, set: '3', t: 'Veja o que ele pegou', d: 'O aluno marca cada série e diz como foi. Você vê na hora quem ficou acima ou abaixo da meta, e sobe a carga com um toque.' },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const reps = useTransform(scrollYProgress, (v) => Math.min(12, Math.max(0, Math.round(v * 12))));
  const [rep, setRep] = useState(0);
  useEffect(() => reps.on('change', setRep), [reps]);
  return (
    <section id="como-funciona" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <RevealItem>
            <Eyebrow>Como funciona</Eyebrow>
            <h2 className="display mt-4 text-[2.15rem] leading-[0.95] sm:text-5xl lg:text-[3.4rem]">Um treino<br />em <span className="text-blue-2">3 séries</span></h2>
          </RevealItem>
          <RevealItem className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
            <span className="display text-4xl normal-case text-blue-2 tabular-nums">{String(rep).padStart(2, '0')}</span>
            <span className="text-sm leading-tight text-mute">repetições<br />enquanto você rola</span>
          </RevealItem>
        </Reveal>
        <div ref={ref} className="relative mt-14 grid gap-5 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-[38px] hidden h-1.5 overflow-hidden rounded-full bg-chalk/10 md:block">
            <motion.div style={{ scaleX: fill }} className="h-full origin-left rounded-full bg-gradient-to-r from-blue-3 via-blue to-ice" />
          </div>
          {STEPS.map((s, i) => (
            <Reveal key={s.set} delay={i * 0.12}>
              <RevealItem className="relative h-full rounded-3xl border border-line bg-card p-6 pt-5">
                <div className="flex items-center justify-between">
                  <span className="display relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-2xl bg-ink-3 text-4xl normal-case ring-4 ring-ink">
                    {s.set}<span className="text-lg text-dim">/3</span>
                  </span>
                  <s.icon className="h-7 w-7 text-ice" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-dim">Série {s.set}</p>
                <h3 className="display mt-1 text-2xl">{s.t}</h3>
                <p className="mt-3 leading-relaxed text-mute">{s.d}</p>
              </RevealItem>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────── Simulador: carregue a barra ─────────────
export function Simulator() {
  const META = 60;
  const [kg, setKg] = useState(50);
  const kind = kg > META ? 'above' : kg === META ? 'ok' : 'below';
  const palette = { above: ['var(--pr)', 'Acima da meta', `Pegou ${kg} kg. O KFit sugere subir a meta para ${kg} kg.`], ok: ['var(--ice)', 'Na meta', 'Fez exatamente o que você pediu.'], below: ['var(--low)', 'Abaixo da meta', `Caiu para ${kg} kg. Talvez baixar a meta ou corrigir a execução.`] } as const;
  const [color, label, text] = palette[kind];
  // anilhas por lado: 20 kg da barra, o resto dividido em anilhas de 10, 5 e 2,5
  const side = (kg - 20) / 2;
  const plates: number[] = [];
  let rest = side;
  for (const p of [20, 10, 5, 2.5]) while (rest >= p) { plates.push(p); rest -= p; }
  const plateH = { 20: 120, 10: 96, 5: 72, 2.5: 54 } as Record<number, number>;
  const plateC = { 20: '#2563EB', 10: '#C9CED6', 5: '#3B82F6', 2.5: '#8E97A4' } as Record<number, string>;
  const Side = ({ flip }: { flip?: boolean }) => (
    <div className={`flex items-center gap-[3px] ${flip ? 'flex-row-reverse' : ''}`}>
      <AnimatePresence initial={false}>
        {plates.map((p, i) => (
          <motion.span
            key={`${p}-${i}`}
            initial={{ x: flip ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: flip ? 60 : -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 26 }}
            className="block rounded-md"
            style={{ height: plateH[p], width: p >= 10 ? 16 : 11, background: plateC[p] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-2 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <Reveal>
          <RevealItem><Eyebrow>Teste aqui</Eyebrow></RevealItem>
          <RevealItem>
            <h2 className="display mt-4 text-[2.15rem] leading-[0.95] sm:text-5xl">Você põe a meta.<br /><span className="text-blue-2">Ele mostra o que pegou.</span></h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-5 max-w-lg leading-relaxed text-mute">
              A meta é 60 kg no agachamento. Arraste e carregue a barra como o aluno fez hoje: o KFit compara na hora e avisa você.
            </p>
          </RevealItem>
        </Reveal>
        <Reveal>
          <RevealItem className="rounded-3xl border border-line bg-card p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-mute">Agachamento livre · meta {META} kg</span>
              <span className="display text-4xl normal-case tabular-nums">{kg}<span className="text-xl text-dim"> kg</span></span>
            </div>
            <div className="my-8 flex h-32 items-center justify-center">
              <Side />
              <span className="mx-[2px] h-6 w-5 rounded-sm bg-[#9AA3AF]" />
              <span className="h-3 w-24 rounded-sm bg-gradient-to-b from-[#d4d8de] to-[#8e97a4] sm:w-40" />
              <span className="mx-[2px] h-6 w-5 rounded-sm bg-[#9AA3AF]" />
              <Side flip />
            </div>
            <label className="block">
              <span className="sr-only">Carga que o aluno pegou</span>
              <input type="range" min={20} max={100} step={5} value={kg} onChange={(e) => setKg(Number(e.target.value))} className="w-full accent-blue-600" />
            </label>
            <div className="mt-2 flex justify-between text-xs text-dim"><span>20 kg</span><span>100 kg</span></div>
            <motion.div key={kind} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}
              className="mt-6 rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 9%, transparent)` }}>
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color }}>{label}</span>
              <p className="mt-1 font-semibold" style={{ color }}>{text}</p>
              <p className="mt-1 text-xs text-mute">É isso que aparece para o personal no painel e no aviso do dia.</p>
            </motion.div>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}

// ───────────── Recursos (cartões em cascata) ─────────────
const FEATURES = [
  { icon: DumbbellIcon, t: 'Ficha com vídeo', d: '173 exercícios de musculação, funcional, cardio e mobilidade. E você grava os seus.', big: true },
  { icon: Ruler, t: 'Avaliação física', d: '11 perímetros, Pollock 3 e 7 dobras, IMC, RCQ e % de gordura calculados na hora.' },
  { icon: FileSignature, t: 'Anamnese, PAR-Q e contrato', d: 'Chegam no WhatsApp do aluno. Ele responde e assina com o dedo.' },
  { icon: Wallet, t: 'Pix e cobrança', d: 'Lembrete no dia certo e baixa automática. Chega de cobrar no grito.' },
  { icon: Bot, t: 'Assistente com IA', d: 'Monta treino, acha aluno sumido e escreve as mensagens por você.' },
  { icon: CalendarCheck, t: 'Agenda e link', d: 'O aluno vê os horários livres e marca pelo seu link.' },
  { icon: MonitorPlay, t: 'Modo TV do studio', d: 'AMRAP, EMOM e Tabata na televisão, com placar da turma.', big: true },
  { icon: Flame, t: 'Hábitos e conquistas', d: 'Água, sono, proteína, sequência de treinos e ranking da turma.' },
];

function TvTimer() {
  const [s, setS] = useState(720);
  useEffect(() => { const id = window.setInterval(() => setS((v) => (v <= 0 ? 720 : v - 1)), 1000); return () => clearInterval(id); }, []);
  return <span className="display text-4xl normal-case tabular-nums text-chalk">{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>;
}

export function Features() {
  return (
    <section id="recursos" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <RevealItem><Eyebrow>Recursos</Eyebrow></RevealItem>
          <RevealItem>
            <h2 className="display mt-4 max-w-3xl text-[2.15rem] leading-[0.95] sm:text-5xl lg:text-[3.4rem]">Tudo que o personal usa. <span className="text-blue-2">Num app só.</span></h2>
          </RevealItem>
        </Reveal>
        <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
          {FEATURES.map((f) => (
            <RevealItem key={f.t} className={`min-w-0 ${f.big ? 'sm:col-span-2' : ''}`}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-line bg-card p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue/0 blur-2xl transition-colors duration-500 group-hover:bg-blue/25" />
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/15 text-ice"><f.icon className="h-6 w-6" /></span>
                <h3 className="display mt-5 text-xl">{f.t}</h3>
                <p className="mt-2 leading-relaxed text-mute">{f.d}</p>
                {f.t === 'Modo TV do studio' && (
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-ink p-4">
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-ice">AMRAP 12 min</p><TvTimer /></div>
                    <div className="space-y-1.5 text-sm">
                      {[['Carla', 3], ['Felipe', 2], ['Ana', 2]].map(([n, r]) => (
                        <p key={n} className="flex items-center gap-3"><span className="w-14 text-mute">{n}</span><span className="display rounded-md bg-blue px-2 normal-case">{r}</span></p>
                      ))}
                    </div>
                  </div>
                )}
                {f.t === 'Ficha com vídeo' && (
                  <div className="mt-5 flex gap-2 overflow-hidden">
                    {['Agachamento', 'Kettlebell swing', 'Supino', 'Burpee', 'Remada'].map((n, i) => (
                      <motion.span key={n} className="flex flex-none items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm"
                        animate={{ x: [0, -40, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue/20"><span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-ice" /></span>{n}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ───────────── Evolução: números e barras ─────────────
export function Evolution() {
  const rows = [
    { k: 'Peso', from: 84.2, to: 78.2, unit: ' kg', pct: 0.7 },
    { k: 'Cintura', from: 92, to: 84.5, unit: ' cm', pct: 0.82 },
    { k: '% de gordura', from: 31, to: 26, unit: '%', pct: 0.62 },
    { k: 'Agachamento', from: 40, to: 70, unit: ' kg', pct: 0.95, up: true },
  ];
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 80% 30%, rgb(37 99 235 / 0.18), transparent)' }} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <Reveal>
          <RevealItem><Eyebrow>Avaliação e evolução</Eyebrow></RevealItem>
          <RevealItem><h2 className="display mt-4 text-[2.15rem] leading-[0.95] sm:text-5xl">O aluno <span className="text-blue-2">vê</span> que está evoluindo.</h2></RevealItem>
          <RevealItem>
            <p className="mt-5 max-w-lg leading-relaxed text-mute">
              Cada avaliação fica salva e comparada com a primeira. Peso, medidas, dobras e carga em gráfico. Aluno que enxerga resultado não cancela.
            </p>
          </RevealItem>
        </Reveal>
        <Reveal className="rounded-3xl border border-line bg-card p-6 sm:p-8" stagger={0.12}>
          <RevealItem className="mb-4 flex items-center justify-between text-sm text-mute"><span>Exemplo de aluna · junho → novembro</span><Ruler className="h-4 w-4" /></RevealItem>
          {rows.map((r) => (
            <RevealItem key={r.k} className="border-b border-line py-4 last:border-0">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{r.k}</span>
                <span className="text-sm text-dim">{String(r.from).replace('.', ',')}{r.unit} → <CountUp to={r.to} decimals={r.to % 1 ? 1 : 0} suffix={r.unit} className="display text-2xl normal-case text-chalk" /></span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-chalk/10">
                <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: r.pct }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE }}
                  className="h-full origin-left rounded-full" style={{ background: r.up ? 'linear-gradient(90deg,#059669,#6EE7B7)' : 'linear-gradient(90deg,#1D4ED8,#60A5FA)' }} />
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ───────────── Sua marca (multi-tenant) ─────────────
export function YourBrand() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % DEMO_BRANDS.length), 3200);
    return () => clearInterval(id);
  }, [auto]);
  const b = DEMO_BRANDS[i];
  return (
    <section id="sua-marca" className="relative scroll-mt-20 overflow-hidden border-y border-line bg-ink-2 py-24 sm:py-32">
      <motion.div className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full blur-3xl" animate={{ background: `${b.color}33` }} transition={{ duration: 0.8 }} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1fr_auto]">
        <Reveal className="min-w-0">
          <RevealItem><Eyebrow>Sua marca</Eyebrow></RevealItem>
          <RevealItem>
            <h2 className="display mt-4 text-[2.15rem] leading-[0.95] sm:text-5xl lg:text-[3.4rem]">O app é <span style={{ color: b.color }} className="transition-colors duration-500">seu.</span></h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-5 max-w-lg leading-relaxed text-mute">
              Seu logo, sua cor, seu nome e o seu link. O aluno abre o app do <b className="text-chalk">seu studio</b>, e o KFit aparece pequenininho: “feito com KFit”.
              Cada personal tem a própria conta: alunos, treinos e pagamentos nunca se misturam.
            </p>
          </RevealItem>
          <RevealItem className="mt-8 flex flex-wrap gap-2">
            {DEMO_BRANDS.map((x, k) => (
              <button key={x.id} type="button" onClick={() => { setI(k); setAuto(false); }}
                className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors"
                style={{ borderColor: k === i ? x.color : 'var(--line)', background: k === i ? `${x.color}1f` : 'transparent' }}>
                <BrandBadge mono={x.mono} color={x.color} shape={x.shape} size={28} /> {x.name}
              </button>
            ))}
          </RevealItem>
          <RevealItem className="mt-6 inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-1 break-all rounded-xl border border-line bg-card px-4 py-3 font-mono text-xs text-mute sm:text-sm">
            <QrCode className="h-4 w-4" /> {SITE.baseUrl}/p/<motion.b key={b.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ color: b.color }}>{b.slug}</motion.b>
          </RevealItem>
        </Reveal>
        <div className="relative mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={b.id} initial={{ opacity: 0, rotateY: -25, x: 30 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 25, x: -30 }}
              transition={{ duration: 0.5, ease: EASE }} style={{ perspective: 1000 }}>
              <PhoneFrame>
                <WorkoutScreen color={b.color} brandName={b.name} mono={<BrandBadge mono={b.mono} color={b.color} shape={b.shape} size={34} />} />
              </PhoneFrame>
            </motion.div>
          </AnimatePresence>
          <p className="mt-3 text-center text-xs text-dim">feito com <Symbol className="inline h-3 w-auto align-[-1px]" /> KFit</p>
        </div>
      </div>
    </section>
  );
}

// ───────────── 6 · Antes × Depois trocando sozinho ─────────────
const SWAPS = [
  { before: 'Ficha no papel que o aluno perde', after: 'Ficha no celular, com vídeo de cada exercício' },
  { before: 'Não sabe quanto o aluno pegou', after: 'Carga de cada série registrada, acima ou abaixo da meta' },
  { before: 'Cobrar mensalidade no constrangimento', after: 'Lembrete e Pix automáticos no WhatsApp' },
  { before: 'Anamnese e contrato em folha solta', after: 'Respondidos e assinados pelo celular' },
  { before: 'Aluno some e você nem percebe', after: 'A IA avisa quem faltou e manda o convite para voltar' },
];

export function BeforeAfter() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setI((v) => (v + 1) % SWAPS.length), 3600); return () => clearInterval(id); }, []);
  const s = SWAPS[i];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal className="text-center">
          <RevealItem><Eyebrow>Antes e depois</Eyebrow></RevealItem>
          <RevealItem><h2 className="display mt-4 text-[2.1rem] leading-[0.95] sm:text-5xl">A virada é no <span className="text-blue-2">seu negócio</span></h2></RevealItem>
        </Reveal>
        <div className="relative mt-12 grid min-h-[200px] gap-4 md:grid-cols-2" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={'b' + i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.45, ease: EASE }}
              className="rounded-3xl border border-low/30 bg-low/[0.06] p-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-low">Antes</p>
              <p className="display mt-3 text-[1.6rem] leading-[1.02] text-chalk/80 line-through decoration-low/60 decoration-2">{s.before}</p>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={'a' + i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
              className="rounded-3xl border border-pr/30 bg-pr/[0.07] p-7">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-pr">Com o KFit</p>
              <p className="display mt-3 text-[1.6rem] leading-[1.02]">{s.after}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {SWAPS.map((_, k) => (
            <button key={k} type="button" aria-label={`Mostrar ${k + 1}`} onClick={() => setI(k)} className="h-2 rounded-full transition-all" style={{ width: k === i ? 28 : 8, background: k === i ? '#3B82F6' : 'var(--line)' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────── 5 · Números contando ─────────────
export function Numbers() {
  const items = [
    { to: 173, label: 'exercícios com vídeo' },
    { to: 11, label: 'medidas por avaliação' },
    { to: 7, label: 'perguntas do PAR-Q' },
    { to: 5, label: 'reações do aluno a cada exercício' },
  ];
  return (
    <section className="border-y border-line bg-blue">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-blue-3/40 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="bg-blue px-5 py-10 text-center">
            <CountUp to={it.to} className="display block text-5xl normal-case text-white sm:text-6xl" />
            <p className="mt-2 text-sm font-semibold text-white/80">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ───────────── Planos ─────────────
export function Plans() {
  return (
    <section id="planos" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <RevealItem><Eyebrow>Planos</Eyebrow></RevealItem>
          <RevealItem><h2 className="display mt-4 text-[2.15rem] leading-[0.95] sm:text-5xl lg:text-[3.4rem]">Escolha sua <span className="text-blue-2">carga</span></h2></RevealItem>
          <RevealItem><p className="mx-auto mt-4 max-w-lg text-mute">{SITE.trialDays} dias grátis em qualquer plano. Sem cartão, sem fidelidade.</p></RevealItem>
        </Reveal>
        <Reveal className="mt-12 grid gap-5 md:grid-cols-3" stagger={0.1}>
          {SITE.plans.map((p, k) => (
            <RevealItem key={p.name}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={`relative flex h-full flex-col rounded-3xl border p-7 ${p.highlight ? 'border-blue bg-gradient-to-b from-blue/20 to-card shadow-[0_30px_80px_-30px_rgb(37_99_235/0.8)]' : 'border-line bg-card'}`}>
                {p.highlight && <span className="absolute -top-3 left-7 rounded-full bg-blue px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Mais escolhido</span>}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {Array.from({ length: k + 1 }).map((_, j) => <span key={j} className="h-8 w-2.5 rounded-sm" style={{ background: j % 2 ? '#C9CED6' : '#2563EB' }} />)}
                  <span className="h-2 w-10 rounded-sm bg-[#9AA3AF]" />
                </div>
                <h3 className="display mt-5 text-3xl">{p.name}</h3>
                <p className="mt-1 text-sm text-mute">{p.tag}</p>
                <p className="mt-5">
                  {p.price ? (<><span className="display text-4xl normal-case">R$ {p.price}</span><span className="text-mute"> /mês</span></>) : <span className="display text-2xl normal-case text-chalk/80">Preço no WhatsApp</span>}
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => <li key={f} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-blue-2" />{f}</li>)}
                </ul>
                <a href={whatsappLink(`Olá! Quero testar o KFit no plano ${p.name}.`)} className={`mt-8 flex h-13 min-h-[52px] items-center justify-center rounded-2xl font-semibold ${p.highlight ? 'btn-lift text-white' : 'border border-line hover:bg-white/5'}`}>
                  Começar no {p.name}
                </a>
              </motion.div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ───────────── Dúvidas ─────────────
const FAQ = [
  ['O aluno precisa baixar app da loja?', 'Não. O KFit abre pelo link no navegador e pode ser adicionado à tela inicial, como um app. Funciona em Android e iPhone.'],
  ['Consigo usar com a minha marca?', 'Sim. Você coloca seu logo, sua cor e seu nome, e ganha um link próprio. O aluno vê o seu studio; o KFit aparece só como “feito com KFit”.'],
  ['Serve para funcional e para musculação?', 'Serve para os dois: séries com carga, exercícios por tempo, circuitos, turmas com check-in e o Modo TV com AMRAP, EMOM e Tabata.'],
  ['Como funciona a meta de carga?', 'Você define séries, repetições e carga. O aluno anota o que pegou em cada série e diz como foi. Você vê quem ficou acima ou abaixo e ajusta com um toque.'],
  ['Os dados de saúde ficam seguros?', 'Ficam guardados com segurança, separados por personal, e só você e o aluno veem. O contrato já traz a cláusula de dados pessoais (LGPD).'],
  ['Preciso do WhatsApp Business?', 'Não. O KFit envia pelo seu número de WhatsApp depois que você conecta lendo um QR Code, uma vez só.'],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="duvidas" className="scroll-mt-20 border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal className="text-center">
          <RevealItem><Eyebrow>Dúvidas</Eyebrow></RevealItem>
          <RevealItem><h2 className="display mt-4 text-[2.15rem] leading-[0.95] sm:text-5xl">Perguntas de quem <span className="text-blue-2">treina gente</span></h2></RevealItem>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map(([q, a], k) => (
            <div key={q} className="overflow-hidden rounded-2xl border border-line bg-card">
              <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold">
                {q}
                <motion.span animate={{ rotate: open === k ? 180 : 0 }}><ChevronDown className="h-5 w-5 text-mute" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === k && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                    <p className="px-5 pb-5 leading-relaxed text-mute">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────── Chamada final ─────────────
export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 60% at 50% 100%, rgb(37 99 235 / 0.35), transparent)' }} />
      <div aria-hidden="true" className="display outline-text pointer-events-none absolute inset-x-0 top-6 text-center text-[24vw] leading-none">Bora</div>
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
        <RevealItem><h2 className="display text-[2.8rem] leading-[0.95] sm:text-6xl">Última série.<br /><span className="text-blue-2">Bora?</span></h2></RevealItem>
        <RevealItem><p className="mx-auto mt-5 max-w-md text-lg text-mute">Teste o KFit com seus alunos por {SITE.trialDays} dias. A gente configura tudo com você pelo WhatsApp.</p></RevealItem>
        <RevealItem className="mt-8 flex justify-center">
          <motion.a href={whatsappLink('Olá! Quero testar o KFit.')} whileTap={{ scale: 0.96 }}
            className="btn-lift inline-flex h-16 items-center gap-3 rounded-2xl px-8 text-lg font-semibold text-white">
            <MessageCircle className="h-5 w-5" /> Quero testar grátis
          </motion.a>
        </RevealItem>
        <RevealItem className="mt-6 flex items-center justify-center gap-2 text-sm text-dim"><Timer className="h-4 w-4" /> Atendimento direto com a TresK Tecnologia</RevealItem>
      </Reveal>
    </section>
  );
}
