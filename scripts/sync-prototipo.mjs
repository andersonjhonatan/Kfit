// Gera src/demo/template.ts e src/demo/logic.ts a partir de prototipo/kfit.dc.html
// Uso: pnpm demo:sync
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../prototipo/kfit.dc.html', import.meta.url), 'utf8');
let tpl = src.slice(src.indexOf('<x-dc>') + '<x-dc>'.length, src.indexOf('</x-dc>'));
// os estilos globais do protótipo valem só dentro dele (.kfit-proto), sem vazar para a página
tpl = tpl
  .replace('body{margin:0;background:#0B0B0C}', '')
  .replace('a{color:#3B82F6}a:hover{color:#93C5FD}', '.kfit-proto a{color:#3B82F6}.kfit-proto a:hover{color:#93C5FD}')
  .replace('button{font-family:inherit;', '.kfit-proto button{font-family:inherit;')
  .replace('button:active{', '.kfit-proto button:active{')
  .replace('input{font-family:inherit}', '.kfit-proto input{font-family:inherit}');
const s0 = src.indexOf('<script type="text/x-dc"');
const code = src.slice(src.indexOf('>', s0) + 1, src.indexOf('</script>', s0)).trim();
if (!code.startsWith('class Component extends DCLogic')) throw new Error('lógica do protótipo não encontrada');

const head = '// ARQUIVO GERADO por scripts/sync-prototipo.mjs — edite prototipo/kfit.dc.html\n';
writeFileSync(new URL('../src/demo/template.ts', import.meta.url), head + 'export const TEMPLATE = ' + JSON.stringify(tpl) + ';\n');
writeFileSync(
  new URL('../src/demo/logic.ts', import.meta.url),
  head + '/* eslint-disable */\n// @ts-nocheck\nimport { DCLogic } from \'./runtime\';\n\nexport default ' + code + '\n',
);
console.log('protótipo sincronizado:', (tpl.length / 1024).toFixed(0) + ' KB de template,', (code.length / 1024).toFixed(0) + ' KB de lógica');
