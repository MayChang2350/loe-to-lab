/* Minimal DOM shim — enough to execute app.js headlessly for testing.
   Not a browser. Supports: element tree, innerHTML parse, textContent,
   classList, dataset, querySelector(All) with #id / .class / tag /
   :nth-child(n) and descendant combinator, events, canvas stub. */
'use strict';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

class ClassList {
  constructor(el) { this.el = el; }
  get _s() { return (this.el.className || '').split(/\s+/).filter(Boolean); }
  _w(a) { this.el.className = a.join(' '); }
  add(...c) { const s = this._s; c.forEach(x => { if (!s.includes(x)) s.push(x); }); this._w(s); }
  remove(...c) { this._w(this._s.filter(x => !c.includes(x))); }
  contains(c) { return this._s.includes(c); }
  toggle(c, f) { const has = this.contains(c); const on = (f === undefined) ? !has : !!f; on ? this.add(c) : this.remove(c); return on; }
}

let UID = 0;
class El {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase();
    this.className = ''; this.children = []; this.parent = null;
    this._text = ''; this.attrs = {}; this.dataset = {}; this.style = {};
    this.classList = new ClassList(this);
    this._listeners = {}; this._uid = ++UID;
  }
  get id() { return this.attrs.id || ''; }
  set id(v) { this.attrs.id = v; }
  get value() { return this.attrs.value; }
  set value(v) { this.attrs.value = String(v); }
  get checked() { return !!this.attrs.checked; }
  set checked(v) { this.attrs.checked = !!v; }
  get hidden() { return !!this.attrs.hidden; }
  set hidden(v) { this.attrs.hidden = !!v; }
  setAttribute(k, v) {
    if (k === 'class') this.className = v;
    else if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
    else this.attrs[k] = v;
  }
  getAttribute(k) { return k === 'class' ? this.className : this.attrs[k]; }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); }
  get innerHTML() { return this._html || ''; }
  set innerHTML(h) {
    this._html = String(h); this.children = []; this._text = '';
    parseInto(this, this._html);
  }
  get textContent() {
    return this._text + this.children.map(c => c.textContent).join('');
  }
  set textContent(v) { this._text = String(v); this.children = []; this._html = ''; }
  get firstChild() { return this.children[0]; }
  querySelector(sel) { return query(this, sel)[0] || null; }
  querySelectorAll(sel) { return query(this, sel); }
  addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); }
  dispatchEvent(e) {
    const t = e.type;
    (this._listeners[t] || []).forEach(f => f.call(this, e));
    const h = this['on' + t]; if (h) h.call(this, e);
    return true;
  }
  click() { this.dispatchEvent({ type: 'click', target: this }); }
  scrollIntoView() { }
  getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }; }
  getContext() {
    const noop = () => { };
    const base = {
      createRadialGradient: () => ({ addColorStop: noop }),
      createLinearGradient: () => ({ addColorStop: noop }),
      measureText: () => ({ width: 10 }),
      canvas: this
    };
    return new Proxy(base, { get: (t, k) => (k in t ? t[k] : noop), set: () => true });
  }
}

function parseInto(root, str) {
  const stack = [root];
  const re = /<\/?([a-zA-Z0-9]+)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/g;
  let last = 0, m;
  const addText = txt => { const p = stack[stack.length - 1]; if (p) p._text += txt.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'); };
  while ((m = re.exec(str))) {
    if (m.index > last) addText(str.slice(last, m.index));
    last = re.lastIndex;
    const tag = m[1].toLowerCase();
    if (m[0][1] === '/') { if (stack.length > 1) stack.pop(); continue; }
    const e = new El(tag);
    const attrRe = /([a-zA-Z0-9_-]+)\s*=\s*"([^"]*)"/g; let a;
    while ((a = attrRe.exec(m[2]))) e.setAttribute(a[1], a[2]);
    const parent = stack[stack.length - 1];
    parent.appendChild(e);
    if (!(VOID.has(tag) || /\/>$/.test(m[0]))) stack.push(e);
  }
  if (last < str.length) addText(str.slice(last));
}

function matchOne(el, part) {
  const nth = part.match(/:nth-child\((\d+)\)/);
  const base = part.replace(/:nth-child\(\d+\)/, '');
  if (nth) {
    if (!el.parent) return false;
    if (el.parent.children.indexOf(el) !== (+nth[1] - 1)) return false;
  }
  if (!base) return true;
  const toks = base.match(/(^[a-zA-Z0-9]+)|(#[\w-]+)|(\.[\w-]+)|(\[[^\]]+\])/g) || [];
  if (!toks.length) return false;
  return toks.every(tk => {
    if (tk[0] === '#') return el.id === tk.slice(1);
    if (tk[0] === '.') return el.classList.contains(tk.slice(1));
    if (tk[0] === '[') {
      const m2 = tk.slice(1, -1).match(/^([\w-]+)(?:\s*=\s*"?([^"]*)"?)?$/);
      if (!m2) return false;
      const key = m2[1];
      const has = key.startsWith('data-')
        ? (el.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] !== undefined)
        : (el.attrs[key] !== undefined || (key === 'class' && el.className));
      if (m2[2] === undefined) return has;
      return String(el.getAttribute(key)) === m2[2];
    }
    return el.tagName === tk.toUpperCase();
  });
}

function walk(node, fn) { node.children.forEach(c => { fn(c); walk(c, fn); }); }

function query(root, sel) {
  const parts = sel.trim().split(/\s+/);
  let level = [root];
  parts.forEach(p => {
    const next = [];
    level.forEach(n => walk(n, c => { if (matchOne(c, p)) next.push(c); }));
    level = next;
  });
  return level;
}

function makeDocument(html) {
  const doc = new El('#document');
  parseInto(doc, html);
  const body = query(doc, 'body')[0] || doc;
  doc.body = body;
  doc.documentElement = query(doc, 'html')[0] || doc;
  doc.createElement = tag => new El(tag);
  doc.querySelector = sel => query(doc, sel)[0] || null;
  doc.querySelectorAll = sel => query(doc, sel);
  doc._listeners = {};
  doc.addEventListener = El.prototype.addEventListener.bind(doc);
  doc.dispatchEvent = El.prototype.dispatchEvent.bind(doc);
  return doc;
}

module.exports = { El, makeDocument, query };
