/**
 * Passos 2 e 4 testados de ponta a ponta contra o servidor rodando (KFIT_URL, ex.: http://localhost:3200).
 * pnpm db:seed && KFIT_URL=http://localhost:3200 pnpm test
 */
import { eq, like } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema, systemDb } from '@/server/db';

const BASE = process.env.KFIT_URL;
const d = BASE ? describe : describe.skip;

class Client {
  jar = new Map<string, string>();
  async call(method: string, path: string, body?: unknown): Promise<Record<string, any>> {
    const res = await fetch(BASE + path, {
      method,
      headers: { 'content-type': 'application/json', cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '), 'x-forwarded-for': this.ip },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const c of res.headers.getSetCookie()) {
      const [kv] = c.split(';');
      const [k, ...v] = kv.split('=');
      const val = v.join('=');
      if (val) this.jar.set(k, val);
      else this.jar.delete(k);
    }
    const json = (await res.json().catch(() => ({}))) as Record<string, any>;
    return { status: res.status, ...json };
  }
  constructor(public ip = `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`) {}
}

async function staffLogin(c: Client, phone: string, password: string, pin = '4826') {
  const r1 = await c.call('POST', '/api/auth/personal/entrar', { phone, password });
  expect(r1.step).toBe('code');
  const r2 = await c.call('POST', '/api/auth/personal/codigo', { phone, code: r1.demoCode, purpose: 'device' });
  if (r2.step === 'pin_create') expect((await c.call('POST', '/api/auth/personal/pin', { pin })).status).toBe(200);
  else expect((await c.call('POST', '/api/auth/personal/desbloquear', { pin })).status).toBe(200);
}

let otherTenant: string;
d('servidor', () => {
  beforeAll(async () => {
    await systemDb.delete(schema.tenants).where(like(schema.tenants.slug, 'e2e-%'));
    await systemDb.delete(schema.rateLimits);
    const [t] = await systemDb.insert(schema.tenants).values({ slug: 'e2e-outro', name: 'Outro Studio', plan: 'solo', status: 'trial', trialEndsAt: new Date(Date.now() + 86400000), isDemo: true }).returning();
    otherTenant = t.id;
    await systemDb.insert(schema.staff).values({ tenantId: t.id, name: 'Outro Personal', phone: '87911112222', passwordHash: await bcrypt.hash('outro123', 11) });
  });
  afterAll(async () => {
    await systemDb.delete(schema.tenants).where(like(schema.tenants.slug, 'e2e-%'));
  });

  it('personal: senha → código → PIN → painel', async () => {
    const c = new Client();
    expect((await c.call('GET', '/api/p/hoje')).status).toBe(401);
    await staffLogin(c, '(87) 99900-1234', 'kfit123');
    const h = await c.call('GET', '/api/p/hoje');
    expect(h.status).toBe(200);
    expect(h.kpis.students).toBeGreaterThan(0);
  });

  it('app bloqueado: sem PIN não vê nada; PIN errado 3 vezes derruba a sessão', async () => {
    const c = new Client();
    await staffLogin(c, '87999001234', 'kfit123');
    await c.call('POST', '/api/auth/personal/bloquear');
    expect((await c.call('GET', '/api/p/alunos')).status).toBe(423);
    expect((await c.call('POST', '/api/auth/personal/desbloquear', { pin: '1111' })).status).toBe(400);
    expect((await c.call('POST', '/api/auth/personal/desbloquear', { pin: '1112' })).status).toBe(400);
    expect((await c.call('POST', '/api/auth/personal/desbloquear', { pin: '1113' })).status).toBe(401);
    expect((await c.call('GET', '/api/p/alunos')).status).toBe(401);
  });

  it('personal de outro studio não vê nem altera alunos do studio de demonstração', async () => {
    const lucas = new Client();
    await staffLogin(lucas, '87999001234', 'kfit123');
    const { students } = await lucas.call('GET', '/api/p/alunos');
    const ana = students.find((s: any) => s.name === 'Ana Clara');
    const outro = new Client();
    await staffLogin(outro, '87911112222', 'outro123');
    expect((await outro.call('GET', '/api/p/alunos')).students).toHaveLength(0);
    expect((await outro.call('GET', `/api/p/alunos/${ana.id}`)).status).toBe(404);
    expect((await outro.call('PATCH', `/api/p/alunos/${ana.id}`, { name: 'Invadido' })).status).toBe(404);
    expect((await outro.call('POST', `/api/p/alunos/${ana.id}/acesso`, { action: 'pausar' })).status).toBe(404);
    const again = await lucas.call('GET', `/api/p/alunos/${ana.id}`);
    expect(again.student.name).toBe('Ana Clara');
    expect(again.student.access).toBe('pendente');
  });

  it('regra no servidor: teste grátis vencido não deixa cadastrar; plano Solo não tem IA', async () => {
    const outro = new Client();
    await staffLogin(outro, '87911112222', 'outro123');
    expect((await outro.call('POST', '/api/p/ia', { message: 'oi' })).status).toBe(403);
    await systemDb.update(schema.tenants).set({ isDemo: false, trialEndsAt: new Date(Date.now() - 1000) }).where(eq(schema.tenants.id, otherTenant));
    const r = await outro.call('POST', '/api/p/alunos', { name: 'Fulano de Tal', phone: '87988887777' });
    expect(r.status).toBe(402);
    expect((await outro.call('GET', '/api/p/alunos')).status).toBe(200); // ainda consulta
    await systemDb.update(schema.tenants).set({ isDemo: true, trialEndsAt: new Date(Date.now() + 86400000) }).where(eq(schema.tenants.id, otherTenant));
  });

  it('limite de uso: muitas tentativas de login no mesmo número → 429', async () => {
    const c = new Client();
    const codes: number[] = [];
    for (let i = 0; i < 10; i++) codes.push((await c.call('POST', '/api/auth/personal/entrar', { phone: '87900000000', password: 'errada1' })).status);
    expect(codes.slice(0, 8).every((s) => s === 400)).toBe(true);
    expect(codes[9]).toBe(429);
  });

  it('aluno: primeiro acesso com código, cria senha, treina; pausado perde o acesso na hora', async () => {
    const a = new Client();
    const s1 = await a.call('POST', '/api/a/studio-demo/auth/inicio', { phone: '87998124410' });
    expect(s1.step).toBe('code');
    expect((await a.call('POST', '/api/a/studio-demo/auth/codigo', { phone: '87998124410', code: '000000', purpose: 'first' })).status).toBe(400);
    const s2 = await a.call('POST', '/api/a/studio-demo/auth/codigo', { phone: '87998124410', code: s1.demoCode, purpose: 'first' });
    expect(s2.step).toBe('create');
    expect((await a.call('POST', '/api/a/studio-demo/auth/senha', { phone: '87998124410', ticket: s2.ticket, password: '123456' })).status).toBe(400);
    expect((await a.call('POST', '/api/a/studio-demo/auth/senha', { phone: '87998124410', ticket: s2.ticket, password: 'treino10' })).step).toBe('in');
    // ticket é de uso único
    expect((await a.call('POST', '/api/a/studio-demo/auth/senha', { phone: '87998124410', ticket: s2.ticket, password: 'outra123' })).status).toBe(400);

    const me = await a.call('GET', '/api/a/studio-demo/me');
    expect(me.me.firstName).toBe('Ana');
    const w = await a.call('GET', `/api/a/studio-demo/treinos/${me.workout.id}`);
    const it0 = w.items[0];
    expect((await a.call('POST', `/api/a/studio-demo/treinos/${w.id}/serie`, { itemId: it0.id, setNo: 1, kg: 60, reps: 10 })).status).toBe(200);
    expect((await a.call('POST', `/api/a/studio-demo/treinos/${w.id}/serie`, { itemId: it0.id, setNo: 99, kg: 60, reps: 10 })).status).toBe(400);
    // aluno não acessa a área do personal
    expect((await a.call('GET', '/api/p/alunos')).status).toBe(401);

    // segunda vez: telefone e senha
    const b = new Client();
    expect((await b.call('POST', '/api/a/studio-demo/auth/inicio', { phone: '87998124410' })).step).toBe('password');
    expect((await b.call('POST', '/api/a/studio-demo/auth/entrar', { phone: '87998124410', password: 'treino10' })).step).toBe('in');

    // personal pausa → aluno cai fora
    const lucas = new Client();
    await staffLogin(lucas, '87999001234', 'kfit123');
    const { students } = await lucas.call('GET', '/api/p/alunos');
    const ana = students.find((s: any) => s.name === 'Ana Clara');
    await lucas.call('POST', `/api/p/alunos/${ana.id}/acesso`, { action: 'pausar' });
    expect((await b.call('GET', '/api/a/studio-demo/me')).status).toBe(401);
    expect((await b.call('POST', '/api/a/studio-demo/auth/entrar', { phone: '87998124410', password: 'treino10' })).status).toBe(403);
    await lucas.call('POST', `/api/p/alunos/${ana.id}/acesso`, { action: 'liberar' });
  });

  it('aluno de um studio não entra pelo link de outro', async () => {
    const a = new Client();
    expect((await a.call('POST', '/api/a/e2e-outro/auth/inicio', { phone: '87996550231' })).status).toBe(404);
  });
});
