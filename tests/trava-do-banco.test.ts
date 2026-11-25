/**
 * Passo 1: TRAVA EM TODA TABELA — testado com dois studios e dois alunos.
 * Roda contra o Postgres do .env (pnpm test).
 */
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { systemDb, toDay, withScope } from '@/server/db';

let A: string, B: string, a1: string, a2: string, b1: string, wA1: string;

beforeAll(async () => {
  await systemDb.tenant.deleteMany({ where: { slug: { startsWith: 'teste-' } } });
  A = (await systemDb.tenant.create({ data: { slug: 'teste-a', name: 'Studio A' } })).id;
  B = (await systemDb.tenant.create({ data: { slug: 'teste-b', name: 'Studio B' } })).id;
  a1 = (await systemDb.student.create({ data: { tenantId: A, name: 'Aluno A1', phone: '87900000001' } })).id;
  a2 = (await systemDb.student.create({ data: { tenantId: A, name: 'Aluno A2', phone: '87900000002' } })).id;
  b1 = (await systemDb.student.create({ data: { tenantId: B, name: 'Aluno B1', phone: '87900000003' } })).id;
  await systemDb.staff.createMany({
    data: [
      { tenantId: A, name: 'Personal A', phone: '87911110001', passwordHash: 'x' },
      { tenantId: B, name: 'Personal B', phone: '87911110002', passwordHash: 'x' },
    ],
  });
  wA1 = (await systemDb.workout.create({ data: { tenantId: A, studentId: a1, name: 'Treino do A1' } })).id;
  await systemDb.workout.createMany({
    data: [
      { tenantId: A, studentId: a2, name: 'Treino do A2' },
      { tenantId: B, studentId: b1, name: 'Treino do B1' },
    ],
  });
});

afterAll(async () => {
  await systemDb.tenant.deleteMany({ where: { slug: { startsWith: 'teste-' } } });
});

describe('dois studios', () => {
  it('o personal A só vê os alunos do studio A', async () => {
    const rows = await withScope({ tenantId: A }, (db) => db.student.findMany());
    expect(rows.map((r) => r.name).sort()).toEqual(['Aluno A1', 'Aluno A2']);
  });

  it('pedir um aluno do studio B pelo id não devolve nada', async () => {
    const row = await withScope({ tenantId: A }, (db) => db.student.findUnique({ where: { id: b1 } }));
    expect(row).toBeNull();
  });

  it('o studio A não consegue alterar nem criar dados no studio B', async () => {
    const upd = await withScope({ tenantId: A }, (db) => db.student.updateMany({ where: { id: b1 }, data: { name: 'invadido' } }));
    expect(upd.count).toBe(0);
    await expect(withScope({ tenantId: A }, (db) => db.student.create({ data: { tenantId: B, name: 'intruso', phone: '87900000099' } }))).rejects.toThrow();
    const b = await systemDb.student.findUnique({ where: { id: b1 } });
    expect(b?.name).toBe('Aluno B1');
  });

  it('o studio só enxerga a si mesmo e a própria equipe', async () => {
    const t = await withScope({ tenantId: B }, (db) => db.tenant.findMany());
    expect(t.map((x) => x.name)).toEqual(['Studio B']);
    const s = await withScope({ tenantId: B }, (db) => db.staff.findMany());
    expect(s.map((x) => x.name)).toEqual(['Personal B']);
  });
});

describe('dois alunos do mesmo studio', () => {
  it('o aluno A1 só vê a si mesmo e o próprio treino', async () => {
    const me = await withScope({ tenantId: A, studentId: a1 }, (db) => db.student.findMany());
    expect(me.map((r) => r.id)).toEqual([a1]);
    const ws = await withScope({ tenantId: A, studentId: a1 }, (db) => db.workout.findMany());
    expect(ws.map((w) => w.name)).toEqual(['Treino do A1']);
  });

  it('o aluno não lê a equipe (senhas, PIN) nem muda a agenda', async () => {
    const s = await withScope({ tenantId: A, studentId: a1 }, (db) => db.staff.findMany());
    expect(s).toHaveLength(0);
    await expect(withScope({ tenantId: A, studentId: a1 }, (db) => db.slot.create({ data: { tenantId: A, weekday: 1, time: '05:00' } }))).rejects.toThrow();
  });

  it('o aluno A2 não registra treino no lugar do A1', async () => {
    await expect(
      withScope({ tenantId: A, studentId: a2 }, (db) => db.trainingSession.create({ data: { tenantId: A, studentId: a1, workoutId: wA1, day: toDay('2026-11-25') } })),
    ).rejects.toThrow();
  });
});

describe('papel da aplicação', () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_APP_URL });
  afterAll(() => pool.end());

  it('sem studio definido, não vê nada', async () => {
    const r = await pool.query('select * from students');
    expect(r.rows).toHaveLength(0);
  });

  it('não tem acesso às tabelas de sessão, códigos e limites', async () => {
    for (const t of ['sessions', 'otp_codes', 'rate_limits', 'devices', 'audit_logs']) {
      await expect(pool.query(`select 1 from ${t} limit 1`)).rejects.toThrow(/permission denied/);
    }
  });

  it('não ignora a trava (NOBYPASSRLS) e não é superusuário', async () => {
    const r = await pool.query('select rolbypassrls, rolsuper from pg_roles where rolname = current_user');
    expect(r.rows[0]).toEqual({ rolbypassrls: false, rolsuper: false });
  });
});
