import { studentRead } from '@/server/guard';
import { ok, route } from '@/server/http';
import { assessmentsOf } from '@/server/queries';

type P = { params: Promise<{ slug: string }> };

export const GET = route<P>(async (_req, { params }) => {
  const { c, db } = await studentRead((await params).slug);
  return ok({ assessments: await db((tx) => assessmentsOf(tx, c.student.id)) });
});
