# KFit · site de vendas

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
