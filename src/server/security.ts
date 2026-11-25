import 'server-only';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from './env';

export const digits = (s: string) => String(s ?? '').replace(/\D/g, '');

/** Telefone brasileiro só com dígitos, sem o 55: DDD + número (10 ou 11 dígitos). */
export function normalizePhone(s: string): string | null {
  let d = digits(s);
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  return d.length === 10 || d.length === 11 ? d : null;
}

export function maskPhone(d: string) {
  return `(${d.slice(0, 2)}) ${d.length === 11 ? d[2] : ''}••••-${d.slice(-4)}`;
}

export const newToken = () => randomBytes(32).toString('base64url');

/** Hash com segredo do servidor: um vazamento do banco não entrega tokens válidos. */
export const tokenHash = (t: string) => createHmac('sha256', env.SESSION_SECRET).update(t).digest('hex');

export const newCode = () => String(randomInt(100000, 1000000));
export const codeHash = (code: string, salt: string) =>
  createHash('sha256').update(`${env.SESSION_SECRET}:${salt}:${code}`).digest('hex');

export function sameHash(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const hashPassword = (p: string) => bcrypt.hash(p, 11);
let dummy: string | null = null;
/** Gasta o mesmo tempo de uma conferência de senha (não revela se o usuário existe). */
export async function dummyCheck() {
  dummy ??= await bcrypt.hash('kfit-dummy', 11);
  await bcrypt.compare('x', dummy);
}

export const checkPassword = (p: string, h: string | null | undefined) => (h ? bcrypt.compare(p, h) : Promise.resolve(false));

const WEAK = new Set(['123456', '1234567', '12345678', '123456789', '654321', '000000', '111111', 'senha123', 'abc123', 'kfit123456', 'qwerty']);

/** Regras da senha: as mesmas que a tela mostra, conferidas aqui no servidor. */
export function passwordProblem(p: string, phone: string): string | null {
  if (p.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (p.length > 72) return 'Senha longa demais.';
  if (!/[a-zA-Z]/.test(p) || !/\d/.test(p)) return 'Use letras e números.';
  if (WEAK.has(p.toLowerCase())) return 'Essa senha é fácil demais.';
  const dp = digits(p);
  if (dp.length >= 6 && phone.includes(dp)) return 'Não use o seu telefone como senha.';
  return null;
}

const WEAK_PIN = new Set(['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '1212', '2580']);
export function pinProblem(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) return 'O PIN tem 4 números.';
  if (WEAK_PIN.has(pin)) return 'PIN fácil demais. Escolha outro.';
  return null;
}
