# KFit

Site de vendas, demonstração, painel do personal e app do aluno (TresK Tecnologia).

## Site de vendas

Página de vendas do KFit (TresK Tecnologia): Next.js 15, React 19, Motion e Tailwind 4.

```bash
pnpm install
pnpm dev            # http://localhost:3200
pnpm build          # produção (Vercel)
STATIC_EXPORT=1 pnpm build   # versão estática em /out
```

- Textos de venda, WhatsApp, planos e preços: `src/lib/site.ts` (`price: null` mostra "Preço no WhatsApp").
- Animações: `src/components/motion.tsx` (entrada ao rolar, cascata, palavras batendo, números contando),
  `intro.tsx` (abertura com o halter, 1ª visita da sessão), `hero.tsx`, `sections.tsx`.
- Tudo respeita "reduzir movimento" do sistema.
- Logo gerado do sistema de marca (opção 40): `src/lib/brand-svg.ts`.

## Demonstração (/demo)

O protótipo navegável do app fica em **/demo** (ex.: `kfit.tresktecnologia.com.br/demo`): painel do personal e app do aluno,
com um studio de exemplo. Nada é salvo; é para mostrar ao cliente.

- Senha do personal na demonstração: `kfit123`. Os códigos "do WhatsApp" aparecem numa notificação de exemplo.
- A fonte do protótipo é `prototipo/kfit.dc.html`. Depois de editar, rode `pnpm demo:sync` para gerar
  `src/demo/template.ts` e `src/demo/logic.ts` (arquivos gerados, não edite à mão).
- O motor que desenha o protótipo é `src/demo/runtime.tsx` (React, sem dependências externas).

## Sistema (painel do personal e app do aluno)

- **/painel**: área do personal (alunos, fichas com meta de carga, avaliação, agenda, mensalidades, IA, marca, segurança).
- **/a/<studio>**: app do aluno com a marca do personal (início, treino, evolução, marcar horário).
- Banco: Postgres + Drizzle (`src/server/db/schema.ts`, migrations em `drizzle/`).

### Rodar no computador

```bash
cp .env.example .env          # preencha DATABASE_URL, DATABASE_APP_URL, SESSION_SECRET; OTP_DEBUG=true
KFIT_APP_PASSWORD=kfit_app pnpm db:migrate
pnpm db:seed                  # studio de demonstração: /a/studio-demo · personal (87) 99900-1234 · senha kfit123
pnpm dev
pnpm test                     # trava do banco; com o servidor rodando: KFIT_URL=http://localhost:3200 pnpm test
```

### Os 5 passos de segurança

| Passo | Onde está | Como foi testado |
| --- | --- | --- |
| 1. Trava em toda tabela | RLS em todas as tabelas (`drizzle/0001_seguranca.sql`); toda rota depois do login usa o papel `kfit_app` sem bypass, travado por studio e, no app do aluno, pelo próprio aluno (`src/server/db/index.ts`) | `tests/trava-do-banco.test.ts`: 2 studios e 2 alunos tentando ler e alterar os dados um do outro |
| 2. Regra no servidor | Plano, teste grátis, limite de alunos, IA, PIN, acesso do aluno: `src/server/rules.ts`, `src/server/auth.ts` | `tests/api.e2e.test.ts`: teste vencido não cadastra, Solo sem IA, PIN errado 3× derruba a sessão, aluno pausado cai na hora |
| 3. Backup | `.github/workflows/backup.yml`: cópia diária criptografada (30 dias) e restauração de teste num banco vazio | o próprio workflow falha se a cópia não restaurar |
| 4. Limite de uso | `src/server/ratelimit.ts`: login por IP e por telefone, códigos de WhatsApp por número e por IP, cadastros por dia, escrita por minuto, IA por dia | `tests/api.e2e.test.ts`: 10 tentativas no mesmo número → 429 |
| 5. Aviso de erro | Sentry (`src/instrumentation.ts`, `src/instrumentation-client.ts`); toda rota passa por `src/server/http.ts`, que manda erro inesperado para o monitor | ligue `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN` |

### Colocar no ar (Vercel + Neon)

1. Crie um banco no **Neon** (região São Paulo). Copie a URL do dono para `DATABASE_URL`.
2. No computador, com essa URL no `.env`: `KFIT_APP_PASSWORD=<senha forte> pnpm db:migrate` e `pnpm db:seed`.
3. Na Vercel, importe o repositório e preencha as variáveis do `.env.example`:
   `DATABASE_APP_URL` é a URL com pool do Neon, mas com usuário `kfit_app` e a senha do passo 2.
   Gere `SESSION_SECRET` e `CRON_SECRET` com `openssl rand -hex 32`. **Não** ligue `OTP_DEBUG` em produção.
4. Ligue a Evolution API (`EVOLUTION_*`) para os códigos chegarem no WhatsApp. Sem ela, só o studio de demonstração funciona (o código aparece na tela).
5. Crie uma conta grátis no **Sentry** (projeto Next.js) e cole o DSN em `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN`.
6. No GitHub, em *Settings → Secrets → Actions*, crie `DATABASE_URL` e `BACKUP_PASSPHRASE` para o backup diário.
7. A rotina diária (`vercel.json`) volta o studio de demonstração ao começo e limpa códigos e sessões vencidas.

### Cliente novo

```bash
pnpm studio:criar --nome "VEV Funcional" --slug vev-funcional --personal "Victor Leonardo" --whatsapp 87999998888 --plano pro --dias 14
```

Mostra a senha provisória. O personal entra em /painel (com código no WhatsApp), cria o PIN e troca a senha em "Esqueci minha senha".
Para restaurar um backup: baixe o arquivo do GitHub Actions, `gpg -d kfit-AAAA-MM-DD.dump.gpg > kfit.dump` e `pg_restore -d "$URL" kfit.dump`.
