import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';
import { today } from '@/server/queries';

type P = { params: Promise<{ id: string }> };
const cm = z.coerce.number().min(10).max(250);
const Body = z.object({
  day: z.iso.date().optional(),
  weightKg: z.coerce.number().min(20, 'Peso inválido.').max(350, 'Peso inválido.'),
  heightCm: z.coerce.number().int().min(100).max(230).nullable().optional(),
  bodyFatPct: z.coerce.number().min(2).max(70).nullable().optional(),
  measures: z.object({ cintura: cm, quadril: cm, braco: cm, coxa: cm, peito: cm, abdomen: cm, panturrilha: cm }).partial().default({}),
  notes: z.string().max(500).default(''),
});

export const POST = route<P>(async (req, { params }) => {
  const studentId = z.uuid().parse((await params).id);
  const { c, db } = await staffWrite(req);
  const v = await body(req, Body);
  const day = v.day ?? today();
  if (day > today()) throw new ApiError(400, 'A data não pode ser no futuro.');
  await db(async (tx) => {
    const [s] = await tx.select().from(schema.students).where(eq(schema.students.id, studentId)).limit(1);
    if (!s) throw new ApiError(404, 'Aluno não encontrado.');
    await tx.insert(schema.assessments).values({
      tenantId: c.tenant.id,
      studentId,
      day,
      weightKg: String(v.weightKg),
      heightCm: v.heightCm ?? s.heightCm,
      bodyFatPct: v.bodyFatPct == null ? null : String(v.bodyFatPct),
      measures: v.measures,
      notes: v.notes,
    });
    if (v.heightCm && v.heightCm !== s.heightCm) await tx.update(schema.students).set({ heightCm: v.heightCm }).where(eq(schema.students.id, studentId));
  });
  return ok({}, { status: 201 });
});
