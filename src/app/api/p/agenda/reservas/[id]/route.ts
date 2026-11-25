import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schema } from '@/server/db';
import { staffWrite } from '@/server/guard';
import { ApiError, body, ok, route } from '@/server/http';

type P = { params: Promise<{ id: string }> };

/** Aceitar ou cancelar um pedido de horário. */
export const POST = route<P>(async (req, { params }) => {
  const id = z.uuid().parse((await params).id);
  const { db } = await staffWrite(req);
  const { status } = await body(req, z.object({ status: z.enum(['confirmado', 'cancelado']) }));
  const [b] = await db((tx) => tx.update(schema.bookings).set({ status }).where(eq(schema.bookings.id, id)).returning());
  if (!b) throw new ApiError(404, 'Horário não encontrado.');
  return ok();
});
