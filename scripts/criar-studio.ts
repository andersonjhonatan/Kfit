// Cadastra um cliente novo (studio + personal dono). Uso:
//   pnpm studio:criar --nome "VEV Funcional" --slug vev-funcional --personal "Victor Leonardo" --whatsapp 87999998888 [--plano pro] [--dias 14]
// Mostra uma senha provisória: o personal entra com ela (e um código no WhatsApp) e depois troca em "Esqueci minha senha".
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { ensureLibrary } from '../src/server/seed-demo';
import { prisma as db } from './db';

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`);
  const v = i >= 0 ? process.argv[i + 1] : fallback;
  if (v === undefined) throw new Error(`Faltou --${name}`);
  return v;
}

async function main() {
  const name = arg('nome');
  const slug = arg('slug').toLowerCase();
  const personal = arg('personal');
  let phone = arg('whatsapp').replace(/\D/g, '');
  if (phone.startsWith('55') && phone.length >= 12) phone = phone.slice(2);
  const plan = arg('plano', 'pro');
  const days = Number(arg('dias', '14'));
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) throw new Error('slug: só letras minúsculas, números e hífen');
  if (phone.length < 10 || phone.length > 11) throw new Error('WhatsApp com DDD, ex.: 87999998888');
  if (!['solo', 'pro', 'studio'].includes(plan)) throw new Error('plano: solo, pro ou studio');

  await ensureLibrary(db);
  const temp = randomBytes(6).toString('base64url').replace(/[^a-zA-Z0-9]/g, 'x') + '7k';
  const mono = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  const t = await db.tenant.create({ data: { slug, name, brandMono: mono, plan, status: 'trial', trialEndsAt: new Date(Date.now() + days * 86_400_000) } });
  await db.staff.create({ data: { tenantId: t.id, name: personal, phone, passwordHash: await bcrypt.hash(temp, 11) } });
  // horários padrão: seg a sex, 6h–9h e 16h–20h
  const times = ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  await db.slot.createMany({ data: [1, 2, 3, 4, 5].flatMap((wd) => times.map((time) => ({ tenantId: t.id, weekday: wd, time }))) });
  await db.$disconnect();
  console.log(`\nStudio criado: ${name}`);
  console.log(`  Link dos alunos: /a/${slug}`);
  console.log(`  Painel: /painel · WhatsApp ${phone} · senha provisória: ${temp}`);
  console.log(`  Plano ${plan} · teste grátis até ${new Date(Date.now() + days * 86_400_000).toLocaleDateString('pt-BR')}\n`);
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
