import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { audit } from '@/server/audit';
import { schema } from '@/server/db';
import { staffRead, staffWrite } from '@/server/guard';
import { ApiError, body, ipOf, ok, route } from '@/server/http';
import { studentsList } from '@/server/queries';
import { LIMITS, limit } from '@/server/ratelimit';
import { assertStudentLimit } from '@/server/rules';
import { normalizePhone } from '@/server/security';

export const GET = route(async (req) => {
  const { c, db } = await staffRead(req);
  return ok({ students: await db((tx) => studentsList(tx, c.tenant.id)) });
});

const New = z.object({
  name: z.string().trim().min(3, 'Digite o nome completo.').max(80),
  phone: z.string().max(30),
  goal: z.string().max(40).default(''),
  sex: z.enum(['F', 'M', '']).default(''),
  heightCm: z.coerce.number().int().min(100).max(230).nullable().optional(),
  days: z.string().max(60).default(''),
  planName: z.enum(['Mensal', 'Trimestral', 'Semestral', 'Avulso']).default('Mensal'),
  priceCents: z.coerce.number().int().min(0).max(10_000_000).default(0),
  dueDay: z.coerce.number().int().min(1).max(28).default(10),
});

export const POST = route(async (req) => {
  const { c, db } = await staffWrite(req);
  const v = await body(req, New);
  const phone = normalizePhone(v.phone);
  if (!phone) throw new ApiError(400, 'WhatsApp inválido. Use DDD + número.');
  await limit(`novo-aluno:${c.tenant.id}`, ...LIMITS.newStudentsDay, 'Muitos cadastros hoje. Tente amanhã ou fale com a TresK.');
  const created = await db(async (tx) => {
    const [{ n }] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.students)
      .where(and(eq(schema.students.tenantId, c.tenant.id), eq(schema.students.status, 'ativo')));
    assertStudentLimit(c.tenant, n);
    const [dup] = await tx
      .select({ id: schema.students.id })
      .from(schema.students)
      .where(and(eq(schema.students.tenantId, c.tenant.id), eq(schema.students.phone, phone)))
      .limit(1);
    if (dup) throw new ApiError(409, 'Já existe um aluno com esse WhatsApp.');
    const [s] = await tx
      .insert(schema.students)
      .values({ tenantId: c.tenant.id, name: v.name, phone, goal: v.goal, sex: v.sex, heightCm: v.heightCm ?? null, days: v.days, planName: v.planName, priceCents: v.priceCents, dueDay: v.dueDay })
      .returning();
    return s;
  });
  await audit({ tenantId: c.tenant.id, actorKind: 'staff', actorId: c.staff.id, action: 'aluno_cadastrado', meta: { aluno: created.name }, ip: ipOf(req) });
  const link = `${req.nextUrl.origin}/a/${c.tenant.slug}`;
  const text = `Oi, ${created.name.split(' ')[0]}! Aqui é o ${c.staff.name.split(' ')[0]}. Seu app de treino já está pronto: ${link}\nEntre com este número de WhatsApp. Na primeira vez chega um código para você criar a sua senha.`;
  return ok({ id: created.id, invite: `https://wa.me/55${phone}?text=${encodeURIComponent(text)}` }, { status: 201 });
});
