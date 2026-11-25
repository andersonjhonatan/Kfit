/**
 * Passo 1: TRAVA EM TODA TABELA — testado com dois studios e dois alunos.
 * Roda contra o Postgres do .env (pnpm test).
 */
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema, systemDb, withScope } from '@/server/db';

let A: string, B: string, a1: string, a2: string, b1: string, wA1: string;

beforeAll(async () => {
  await systemDb.delete(schema.tenants).where(sql`${schema.tenants.slug} like 'teste-%'`);
  const [ta, tb] = await systemDb
    .insert(schema.tenants)
    .values([{ slug: 'teste-a', name: 'Studio A' }, { slug: 'teste-b', name: 'Studio B' }])
    .returning();
  A = ta.id;
  B = tb.id;
  const st = await systemDb
    .insert(schema.students)
    .values([
      { tenantId: A, name: 'Aluno A1', phone: '87900000001' },
      { tenantId: A, name: 'Aluno A2', phone: '87900000002' },
      { tenantId: B, name: 'Aluno B1', phone: '87900000003' },
    ])
    .returning();
  [a1, a2, b1] = st.map((s) => s.id);
  await systemDb.insert(schema.staff).values([
    { tenantId: A, name: 'Personal A', phone: '87911110001', passwordHash: 'x' },
    { tenantId: B, name: 'Personal B', phone: '87911110002', passwordHash: 'x' },
  ]);
  const [w1] = await systemDb.insert(schema.workouts).values({ tenantId: A, studentId: a1, name: 'Treino do A1' }).returning();
  await systemDb.insert(schema.workouts).values([
    { tenantId: A, studentId: a2, name: 'Treino do A2' },
    { tenantId: B, studentId: b1, name: 'Treino do B1' },
  ]);
  wA1 = w1.id;
});

afterAll(async () => {
  await systemDb.delete(schema.tenants).where(sql`${schema.tenants.slug} like 'teste-%'`);
});

describe('dois studios', () => {
  it('o personal A só vê os alunos do studio A', async () => {
    const rows = await withScope({ tenantId: A }, (db) => db.select().from(schema.students));
    expect(rows.map((r) => r.name).sort()).toEqual(['Aluno A1', 'Aluno A2']);
  });

  it('pedir um aluno do studio B pelo id não devolve nada', async () => {
    const rows = await withScope({ tenantId: A }, (db) => db.select().from(schema.students).where(eq(schema.students.id, b1)));
    expect(rows).toHaveLength(0);
  });

  it('o studio A não consegue alterar nem criar dados no studio B', async () => {
    const upd = await withScope({ tenantId: A }, (db) =>
      db.update(schema.students).set({ name: 'invadido' }).where(eq(schema.students.id, b1)).returning(),
    );
    expect(upd).toHaveLength(0);
    await expect(
      withScope({ tenantId: A }, (db) => db.insert(schema.students).values({ tenantId: B, name: 'intruso', phone: '87900000099' })),
    ).rejects.toThrow();
    const [b] = await systemDb.select().from(schema.students).where(eq(schema.students.id, b1));
    expect(b.name).toBe('Aluno B1');
  });

  it('o studio só enxerga a si mesmo e a própria equipe', async () => {
    const t = await withScope({ tenantId: B }, (db) => db.select().from(schema.tenants));
    expect(t.map((x) => x.name)).toEqual(['Studio B']);
    const s = await withScope({ tenantId: B }, (db) => db.select().from(schema.staff));
    expect(s.map((x) => x.name)).toEqual(['Personal B']);
  });
});

describe('dois alunos do mesmo studio', () => {
  it('o aluno A1 só vê a si mesmo e o próprio treino', async () => {
    const me = await withScope({ tenantId: A, studentId: a1 }, (db) => db.select().from(schema.students));
    expect(me.map((r) => r.id)).toEqual([a1]);
    const ws = await withScope({ tenantId: A, studentId: a1 }, (db) => db.select().from(schema.workouts));
    expect(ws.map((w) => w.name)).toEqual(['Treino do A1']);
  });

  it('o aluno não lê a equipe (senhas, PIN) nem muda a agenda', async () => {
    const s = await withScope({ tenantId: A, studentId: a1 }, (db) => db.select().from(schema.staff));
    expect(s).toHaveLength(0);
    await expect(
      withScope({ tenantId: A, studentId: a1 }, (db) => db.insert(schema.slots).values({ tenantId: A, weekday: 1, time: '05:00' })),
    ).rejects.toThrow();
  });

  it('o aluno A2 não registra treino no lugar do A1', async () => {
    await expect(
      withScope({ tenantId: A, studentId: a2 }, (db) =>
        db.insert(schema.trainingSessions).values({ tenantId: A, studentId: a1, workoutId: wA1, day: '2026-11-25' }),
      ),
    ).rejects.toThrow();
  });
});

describe('papel da aplicação', () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_APP_URL });
  afterAll(() => pool.end());

  it('sem studio definido, não vê nada', async () => {
    const r = await drizzle(pool, { schema }).select().from(schema.students);
    expect(r).toHaveLength(0);
  });

  it('não tem acesso às tabelas de sessão, códigos e limites', async () => {
    for (const t of ['sessions', 'otp_codes', 'rate_limits', 'devices', 'audit_logs']) {
      await expect(pool.query(`select 1 from ${t} limit 1`)).rejects.toThrow(/permission denied/);
    }
  });

  it('não ignora a trava (NOBYPASSRLS) e não é superusuário', async () => {
    const r = await pool.query("select rolbypassrls, rolsuper from pg_roles where rolname = current_user");
    expect(r.rows[0]).toEqual({ rolbypassrls: false, rolsuper: false });
  });
});
