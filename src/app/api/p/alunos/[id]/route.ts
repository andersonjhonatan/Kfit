import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffRead, staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';
import { studentDetail } from '@/server/queries';
import { revokeStudentSessions } from '@/server/auth';

type P = { params: Promise<{ id: string }> };
const uuid = z.uuid('Aluno inválido.');

export const GET = route<P>(async (req, { params }) => {
  const id = uuid.parse((await params).id);
  const { db } = await staffRead(req);
  const d = await db((tx) => studentDetail(tx, id));
  if (!d) throw new ApiError(404, 'Aluno não encontrado.');
  return ok(d);
});

const Patch = z.object({
  name: z.string().trim().min(3).max(80).optional(),
  goal: z.string().max(40).optional(),
  days: z.string().max(60).optional(),
  heightCm: z.coerce.number().int().min(100).max(230).nullable().optional(),
  planName: z.enum(['Mensal', 'Trimestral', 'Semestral', 'Avulso']).optional(),
  priceCents: z.coerce.number().int().min(0).max(10_000_000).optional(),
  dueDay: z.coerce.number().int().min(1).max(28).optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
});

export const PATCH = route<P>(async (req, { params }) => {
  const id = uuid.parse((await params).id);
  const { db } = await staffWrite(req);
  const v = await body(req, Patch);
  const [s] = await db((tx) => tx.update(schema.students).set(v).where(eq(schema.students.id, id)).returning({ id: schema.students.id }));
  if (!s) throw new ApiError(404, 'Aluno não encontrado.');
  if (v.status === 'inativo') await revokeStudentSessions(id);
  return ok();
});
