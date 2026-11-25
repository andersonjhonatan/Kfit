// pnpm db:seed — cria (ou recria) o studio de demonstração e a biblioteca de exercícios.
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../src/server/db/schema';
import { DEMO_STAFF_PASSWORD, DEMO_STAFF_PHONE, seedDemo } from '../src/server/seed-demo';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const r = await seedDemo(drizzle(client, { schema }));
  await client.end();
  console.log(`Studio de demonstração pronto: /a/${r.slug}`);
  console.log(`Personal: (87) 99900-1234 · senha ${DEMO_STAFF_PASSWORD} (${DEMO_STAFF_PHONE})`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
