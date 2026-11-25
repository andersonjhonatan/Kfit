// Define a senha do papel kfit_app (criado pela migration de segurança).
// Uso: KFIT_APP_PASSWORD=<senha forte> pnpm db:senha-app   (com DATABASE_URL do dono das tabelas)
import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const pass = process.env.KFIT_APP_PASSWORD;
  if (!pass || pass.length < 8) throw new Error('Defina KFIT_APP_PASSWORD (8+ caracteres).');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`ALTER ROLE kfit_app WITH LOGIN PASSWORD ${client.escapeLiteral(pass)}`);
  await client.end();
  console.log('Senha do papel kfit_app definida. Use-a em DATABASE_APP_URL.');
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
