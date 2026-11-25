// pnpm db:seed — cria (ou recria) o studio de demonstração e a biblioteca de exercícios.
import { DEMO_STAFF_PASSWORD, seedDemo } from '../src/server/seed-demo';
import { prisma } from './db';

async function main() {
  const r = await seedDemo(prisma);
  console.log(`Studio de demonstração pronto: /a/${r.slug}`);
  console.log(`Personal: (87) 99900-1234 · senha ${DEMO_STAFF_PASSWORD}`);
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
