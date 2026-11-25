// Aplica as migrations (pnpm db:migrate). Use a URL do DONO das tabelas (DATABASE_URL).
// Se KFIT_APP_PASSWORD estiver definida, também define a senha do papel kfit_app.
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não definida');
  const client = new Client({ connectionString: url });
  await client.connect();
  await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
  const pass = process.env.KFIT_APP_PASSWORD;
  if (pass) {
    await client.query(`ALTER ROLE kfit_app WITH LOGIN PASSWORD ${client.escapeLiteral(pass)}`);
    console.log('senha do papel kfit_app atualizada');
  }
  await client.end();
  console.log('banco atualizado');
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
