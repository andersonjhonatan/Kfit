'use client';

/**
 * Motor do protótipo navegável do KFit.
 *
 * O protótipo é escrito como um template HTML com marcações simples:
 *   {{ caminho }}               → valor vindo de renderVals()
 *   <sc-if value="{{ x }}">     → mostra o conteúdo se x for verdadeiro
 *   <sc-for list="{{ xs }}" as="x"> → repete o conteúdo para cada item
 * e uma classe de lógica (estado + renderVals). Aqui o template é lido uma vez,
 * vira uma árvore leve e é desenhado com React a cada mudança de estado.
 */

import { createElement, Fragment, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

type Vals = Record<string, unknown>;
type Scope = Vals[];

export class DCLogic<S extends Vals = Vals> {
  props: Vals;
  state = {} as S;
  _update?: () => void;
  constructor(props: Vals) {
    this.props = props;
  }
  setState(patch: Partial<S> | ((s: S) => Partial<S>)) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
    this._update?.();
  }
  renderVals(): Vals {
    return {};
  }
}

// ── árvore compilada ──
type Attr = { name: string; parts: (string | { path: string })[]; single: boolean };
type Node =
  | { k: 'text'; parts: (string | { path: string })[] }
  | { k: 'if'; path: string; kids: Node[] }
  | { k: 'for'; path: string; as: string; kids: Node[] }
  | { k: 'raw'; tag: 'style'; text: string }
  | { k: 'el'; tag: string; attrs: Attr[]; kids: Node[] };

const BIND = /\{\{\s*([^}]+?)\s*\}\}/g;

function splitBindings(s: string): (string | { path: string })[] {
  const out: (string | { path: string })[] = [];
  let last = 0;
  for (const m of s.matchAll(BIND)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    out.push({ path: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

const VOID = new Set(['input', 'br', 'img', 'hr', 'meta', 'link', 'source', 'wbr']);

function compile(node: globalThis.Node): Node[] {
  const out: Node[] = [];
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) {
      let txt = c.textContent ?? '';
      if (!txt.trim()) {
        if (/\n/.test(txt)) return; // quebra de linha da indentação: ignora
        txt = ' ';
      }
      out.push({ k: 'text', parts: splitBindings(txt.replace(/\s+/g, ' ')) });
      return;
    }
    if (c.nodeType !== 1) return;
    const el = c as Element;
    const tag = el.namespaceURI === 'http://www.w3.org/2000/svg' ? el.localName : el.localName.toLowerCase();
    if (tag === 'sc-if') {
      out.push({ k: 'if', path: pathOf(el.getAttribute('value')), kids: compile(el) });
      return;
    }
    if (tag === 'sc-for') {
      out.push({ k: 'for', path: pathOf(el.getAttribute('list')), as: el.getAttribute('as') || 'item', kids: compile(el) });
      return;
    }
    if (tag === 'helmet') {
      out.push(...compile(el));
      return;
    }
    if (tag === 'style') {
      out.push({ k: 'raw', tag: 'style', text: el.textContent ?? '' });
      return;
    }
    const attrs: Attr[] = [];
    for (const a of Array.from(el.attributes)) {
      if (a.name.startsWith('hint-placeholder')) continue;
      const parts = splitBindings(a.value);
      attrs.push({ name: a.name, parts, single: parts.length === 1 && typeof parts[0] !== 'string' });
    }
    out.push({ k: 'el', tag, attrs, kids: VOID.has(tag) ? [] : compile(el) });
  });
  return out;
}

function pathOf(v: string | null) {
  const m = /\{\{\s*([^}]+?)\s*\}\}/.exec(v || '');
  return m ? m[1] : '';
}

function lookup(path: string, scope: Scope): unknown {
  const segs = path.split('.');
  for (let i = scope.length - 1; i >= 0; i--) {
    const frame = scope[i];
    if (frame && segs[0] in frame) {
      let v: unknown = frame[segs[0]];
      for (let j = 1; j < segs.length; j++) v = v == null ? undefined : (v as Vals)[segs[j]];
      return v;
    }
  }
  return undefined;
}

function str(v: unknown) {
  return v == null || v === false ? '' : String(v);
}

// ── atributos HTML/SVG → props do React ──
const RENAME: Record<string, string> = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', maxlength: 'maxLength', minlength: 'minLength',
  inputmode: 'inputMode', autocomplete: 'autoComplete', readonly: 'readOnly', autofocus: 'autoFocus',
  enterkeyhint: 'enterKeyHint', spellcheck: 'spellCheck', autocapitalize: 'autoCapitalize', colspan: 'colSpan',
  rowspan: 'rowSpan', crossorigin: 'crossOrigin', srcset: 'srcSet', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace',
};
const EVENTS: Record<string, string> = {
  onclick: 'onClick', onchange: 'onChange', oninput: 'onInput', onsubmit: 'onSubmit', onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp', onfocus: 'onFocus', onblur: 'onBlur', onpointerdown: 'onPointerDown', onpointerup: 'onPointerUp',
};
const BOOL = new Set(['disabled', 'checked', 'readOnly', 'required', 'autoFocus', 'hidden', 'multiple', 'selected', 'open']);

function camel(s: string) {
  return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

const styleCache = new Map<string, Record<string, string>>();
function parseStyle(css: string) {
  const hit = styleCache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  let depth = 0, quote = '', buf = '';
  const flush = () => {
    const i = buf.indexOf(':');
    if (i > 0) {
      const k = buf.slice(0, i).trim();
      const v = buf.slice(i + 1).trim();
      if (k && v) out[k.startsWith('--') ? k : camel(k.replace(/^-(webkit|moz|ms)-/, (_, p: string) => p[0].toUpperCase() + p.slice(1) + '-'))] = v;
    }
    buf = '';
  };
  for (const ch of css) {
    if (quote) { if (ch === quote) quote = ''; buf += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { flush(); continue; }
    buf += ch;
  }
  flush();
  if (styleCache.size > 4000) styleCache.clear();
  styleCache.set(css, out);
  return out;
}

function propsOf(n: Extract<Node, { k: 'el' }>, scope: Scope) {
  const p: Record<string, unknown> = {};
  let hasHandler = false;
  for (const a of n.attrs) {
    const val = a.single ? lookup((a.parts[0] as { path: string }).path, scope) : a.parts.map((x) => (typeof x === 'string' ? x : str(lookup(x.path, scope)))).join('');
    const ev = EVENTS[a.name];
    if (ev) {
      if (typeof val === 'function') {
        p[ev] = val;
        if (ev === 'onChange' || ev === 'onInput') hasHandler = true;
      }
      continue;
    }
    if (a.name === 'style') {
      if (typeof val === 'string' && val) p.style = parseStyle(val);
      continue;
    }
    let name = RENAME[a.name] ?? a.name;
    if (!name.startsWith('aria-') && !name.startsWith('data-') && name.includes('-')) name = camel(name);
    if (BOOL.has(name)) {
      p[name] = val === true || val === '' || val === name.toLowerCase() || val === 'true';
      continue;
    }
    if (val === undefined || val === null) continue;
    p[name] = typeof val === 'boolean' ? String(val) : val;
  }
  if ((n.tag === 'input' || n.tag === 'textarea') && 'value' in p && !hasHandler) p.readOnly = true;
  return p;
}

function render(nodes: Node[], scope: Scope, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  nodes.forEach((n, i) => {
    const key = keyBase + i;
    switch (n.k) {
      case 'text':
        out.push(n.parts.map((x) => (typeof x === 'string' ? x : str(lookup(x.path, scope)))).join(''));
        break;
      case 'if':
        if (lookup(n.path, scope)) out.push(createElement(Fragment, { key }, ...render(n.kids, scope, key + '.')));
        break;
      case 'for': {
        const list = lookup(n.path, scope);
        if (Array.isArray(list)) {
          list.forEach((item, j) => {
            out.push(createElement(Fragment, { key: key + ':' + j }, ...render(n.kids, [...scope, { [n.as]: item }], key + ':' + j + '.')));
          });
        }
        break;
      }
      case 'raw':
        out.push(createElement('style', { key, dangerouslySetInnerHTML: { __html: n.text } }));
        break;
      case 'el': {
        const props = propsOf(n, scope);
        props.key = key;
        out.push(n.kids.length ? createElement(n.tag, props, ...render(n.kids, scope, key + '.')) : createElement(n.tag, props));
        break;
      }
    }
  });
  return out;
}

export function compileTemplate(html: string): Node[] {
  const doc = new DOMParser().parseFromString('<!doctype html><html><body>' + html + '</body></html>', 'text/html');
  const root = doc.querySelector('x-dc') ?? doc.body;
  return compile(root);
}

export function DCHost({
  template,
  Logic,
  patch,
}: {
  template: string;
  Logic: new (props: Vals) => DCLogic;
  /** ajusta os valores antes de desenhar (ex.: tamanho da tela) */
  patch?: (v: Vals) => Vals;
}) {
  const tree = useMemo(() => compileTemplate(template), [template]);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const logic = useRef<DCLogic | null>(null);
  if (!logic.current) logic.current = new Logic({});

  useEffect(() => {
    const l = logic.current as DCLogic & { componentDidMount?: () => void; componentWillUnmount?: () => void };
    l._update = force;
    l.componentDidMount?.();
    return () => {
      l.componentWillUnmount?.();
      l._update = undefined;
    };
  }, []);

  let vals = logic.current.renderVals();
  if (patch) vals = patch(vals);
  return <>{render(tree, [vals], 'n')}</>;
}
