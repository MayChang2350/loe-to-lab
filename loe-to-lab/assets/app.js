/* ============================================================================
   app.js — rendering, interaction, and the fluid-bed animation
   ========================================================================== */

'use strict';

/* ---------- language ---------------------------------------------------- */

let LANG = (localStorage.getItem('loelang') === 'zh') ? 'zh' : 'en';
const t = v => (v == null) ? '' : (typeof v === 'string' ? v : (v[LANG] ?? v.en ?? ''));
const dig = (o, path) => path.split('.').reduce((a, k) => (a ? a[k] : undefined), o);
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const TODAY = new Date('2026-07-27T00:00:00');

function applyStatic() {
  document.body.classList.toggle('zh', LANG === 'zh');
  document.documentElement.lang = LANG === 'zh' ? 'zh-Hant' : 'en';
  $$('[data-t]').forEach(n => { n.textContent = t(dig(UI, n.dataset.t)); });
}

/* ---------- nav --------------------------------------------------------- */

function buildNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  Object.entries(UI.nav).forEach(([id, label]) => {
    const a = el('a'); a.href = '#' + id; a.textContent = t(label); a.dataset.sec = id;
    nav.appendChild(a);
  });
}

function scrollSpy() {
  const secs = $$('.sec');
  const prog = $('#scrollProgress');
  const onScroll = () => {
    const h = document.documentElement;
    prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    let cur = secs[0]?.id;
    secs.forEach(s => { if (s.getBoundingClientRect().top <= 140) cur = s.id; });
    $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.sec === cur));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- hero -------------------------------------------------------- */

function renderHero() {
  $('#heroBody').innerHTML = t(UI.heroBody).map(p => `<p>${esc(p)}</p>`).join('');
  $('#chain').innerHTML = UI.chainSteps.map(s =>
    `<div class="chain-item"><div class="n">${s.n}</div><div class="t">${esc(t(s.t))}</div><div class="d">${esc(t(s.d))}</div></div>`
  ).join('');
  $('#footSnapshot').textContent = t(UI.common.snapshot) + ': ' + SNAPSHOT_DATE;
}

/* ============================================================================
   1 · SCREENER
   ========================================================================== */

let weights = { ...DEFAULT_WEIGHTS };
let selectedMol = 'linaclotide';

const PRESETS = {
  cdmo:   { market: 20, timing: 25, legal: 15, barrier: 22, exec: 10, competition: 20, fit: 15 },
  volume: { market: 35, timing: 20, legal: 12, barrier: 3,  exec: 22, competition: 5,  fit: 10 },
  risk:   { market: 12, timing: 20, legal: 28, barrier: 8,  exec: 25, competition: 15, fit: 12 },
  flat:   { market: 15, timing: 15, legal: 15, barrier: 15, exec: 15, competition: 15, fit: 15 }
};

function renderWeightUI() {
  const p = $('#presets'); p.innerHTML = '';
  Object.entries(UI.scr.presets).forEach(([k, label]) => {
    const c = el('button', 'chip', esc(t(label)));
    c.onclick = () => { weights = { ...PRESETS[k] }; renderWeightUI(); renderTable(); };
    if (JSON.stringify(weights) === JSON.stringify(PRESETS[k])) c.classList.add('on');
    p.appendChild(c);
  });

  const box = $('#wSliders'); box.innerHTML = '';
  Object.keys(DEFAULT_WEIGHTS).forEach(k => {
    const row = el('div', 'wrow');
    row.innerHTML = `<div class="wrow-top"><label>${esc(t(UI.scr.w[k]))}</label><span class="v">${weights[k]}</span></div>`;
    const inp = el('input'); inp.type = 'range'; inp.min = 0; inp.max = 40; inp.step = 1; inp.value = weights[k];
    inp.oninput = () => {
      weights[k] = +inp.value;
      row.querySelector('.v').textContent = weights[k];
      $$('#presets .chip').forEach(c => c.classList.remove('on'));
      renderTable();
    };
    row.appendChild(inp); box.appendChild(row);
  });
}

function dots(n, max, rev) {
  let s = `<span class="dots${rev ? ' rev' : ''}">`;
  for (let i = 1; i <= max; i++) s += `<i class="${i <= n ? 'f' : ''}"></i>`;
  return s + '</span>';
}

function renderTable() {
  const head = $('#molHead');
  head.innerHTML = ['rank', 'brand', 'app', 'sales', 'entry', 'route', 'barrier', 'comp', 'score']
    .map(k => `<th>${esc(t(UI.scr.th[k]))}</th>`).join('');

  const scored = MOLECULES.map(m => ({ m, ...scoreMolecule(m, weights, TODAY) }))
    .sort((a, b) => b.score - a.score);

  const max = scored[0]?.score || 1;
  const body = $('#molBody'); body.innerHTML = '';

  scored.forEach((row, i) => {
    const m = row.m;
    const tr = el('tr');
    if (m.id === selectedMol) tr.classList.add('on');
    const pillCls = m.pathway === 'ANDA' ? 'anda' : m.pathway === '351(k)' ? 'k' : 'b2';
    const entry = new Date(m.entryDate);
    const past = entry < TODAY;
    tr.innerHTML =
      `<td class="rank">${String(i + 1).padStart(2, '0')}</td>` +
      `<td><span class="bname">${esc(m.brand)}</span><br><span class="binn">${esc(t(m.inn))}</span></td>` +
      `<td class="mono" style="font-size:11px;color:var(--ink3)">${esc(m.app)}</td>` +
      `<td class="num">${fmt(m.usSalesM)}</td>` +
      `<td class="mono" style="font-size:11.5px;${past ? 'color:var(--bad)' : ''}">${m.entryDate.slice(0, 7)}</td>` +
      `<td><span class="pill ${pillCls}">${esc(m.pathway)}</span></td>` +
      `<td>${dots(m.techBarrier, 5)}</td>` +
      `<td>${dots(m.competition, 5, true)}</td>` +
      `<td><div class="bar"><i style="width:${(row.score / max * 100).toFixed(0)}%"></i></div>` +
      `<span class="mono" style="font-size:10.5px;color:var(--ink3)">${row.score.toFixed(0)}</span></td>`;
    tr.onclick = () => { selectedMol = m.id; renderTable(); renderDetail(m, row); $('#molDetail').scrollIntoView({ block: 'nearest' }); };
    body.appendChild(tr);
  });

  const sel = scored.find(r => r.m.id === selectedMol);
  if (sel) renderDetail(sel.m, sel);
}

function renderDetail(m, row) {
  const d = $('#molDetail'); d.hidden = false;
  const confLabel = m.confidence === 'high' ? t(UI.common.high) : t(UI.common.medium);
  d.innerHTML = `
    <div class="dp-head">
      <div class="dp-title"><b>${esc(m.brand)}</b><span>${esc(t(m.inn))} · ${esc(m.app)} · ${esc(m.sponsor)}</span></div>
      <div class="dp-score"><b>${row.score.toFixed(0)}</b><span>SCORE</span></div>
    </div>
    <dl class="kv">
      <dt>Form</dt><dd>${esc(t(m.form))} · ${esc(m.strengths)}</dd>
      <dt>US$M</dt><dd>${fmt(m.usSalesM)} — ${esc(t(m.salesNote))}</dd>
      <dt>Entry</dt><dd><b class="mono">${esc(m.entryDate)}</b> — ${esc(t(m.entryBasis))}</dd>
      <dt>Evidence</dt><dd>${esc(t(m.psg))}</dd>
      <dt>Field</dt><dd>${m.genericsApproved} approved · ${m.tentativeApprovals} tentative · TE ${esc(m.teCode)}</dd>
      <dt>Unit ops</dt><dd>${m.unitOps.map(u => `<span class="pill">${esc(u)}</span>`).join(' ')}</dd>
    </dl>
    <div class="callout"><b>${esc(t(UI.common.thesisLbl))}</b>${esc(t(m.thesis))}</div>
    <div class="srcs"><b>${esc(t(UI.common.sources))}</b> · ${esc(t(UI.common.conf))}: ${esc(confLabel)}<br>${m.sources.map(esc).join(' · ')}</div>`;
}

/* ============================================================================
   2 · PATHWAY
   ========================================================================== */

let treeNode = PATHWAY_TREE.start;
let treeTrail = [];

function renderTree() {
  const trail = $('#treeTrail');
  trail.innerHTML = treeTrail.map(s => `<span>${esc(s)}</span>`).join('');
  const body = $('#treeBody'); body.innerHTML = '';

  if (PATHWAY_TREE.results[treeNode]) {
    const r = PATHWAY_TREE.results[treeNode];
    const card = el('div', 'res-card');
    card.innerHTML = `<h4>${esc(r.title)}</h4><p style="color:var(--ink2);font-size:13.5px;line-height:1.75;max-width:86ch">${esc(t(r.body))}</p>
      <div class="res-meta">
        <div><b>US$${fmt(r.fee)}</b>${esc(r.feeLabel)}</div>
        <div><b>${r.typicalMonths} mo</b>typical development to approval</div>
        <div><b>US$${fmt(r.clinicalCost / 1e6)}M</b>indicative clinical / BE spend</div>
      </div>`;
    body.appendChild(card);
    activeRoute = treeNode;
    renderCost();
    return;
  }

  const node = PATHWAY_TREE.nodes[treeNode];
  if (!node) return;
  body.appendChild(el('div', 'q-title', esc(t(node.q))));
  body.appendChild(el('div', 'q-why', `<b>${esc(t(UI.pw.why))}</b>${esc(t(node.why))}`));
  const opts = el('div', 'opts');
  node.opts.forEach(o => {
    const b = el('button', 'opt', esc(t(o.label)));
    b.onclick = () => { treeTrail.push(t(o.label)); treeNode = o.next; renderTree(); };
    opts.appendChild(b);
  });
  body.appendChild(opts);
}

/* ---------- exclusivity clock ------------------------------------------- */

const clockState = {
  approval: '2012-08-30', nce: true, ped: true, ode: false,
  patent: '2031-10-30', piv: '', devMonths: 42
};

function renderClockControls() {
  const c = $('#clockControls'); c.innerHTML = '';
  const add = (label, node) => { const w = el('div', 'ctrl'); w.appendChild(el('label', null, label)); w.appendChild(node); c.appendChild(w); };
  const mk = (type, key, extra = {}) => {
    const i = el('input'); i.type = type; i.value = clockState[key];
    Object.assign(i, extra);
    i.oninput = () => { clockState[key] = i.value; drawClock(); };
    return i;
  };
  add('RLD approval date', mk('date', 'approval'));
  add('Key patent expiry', mk('date', 'patent'));
  add('Paragraph IV notice (optional)', mk('date', 'piv'));
  add('Our development time (months)', mk('number', 'devMonths', { min: 12, max: 96, step: 1 }));

  [['nce', 'NCE 5-year exclusivity'], ['ped', 'Pediatric +6 months'], ['ode', 'Orphan 7-year']].forEach(([k, lbl]) => {
    const w = el('div', 'ctrl check');
    const i = el('input'); i.type = 'checkbox'; i.checked = clockState[k];
    i.onchange = () => { clockState[k] = i.checked; drawClock(); };
    w.appendChild(i); w.appendChild(el('label', null, lbl)); c.appendChild(w);
  });
}

function addMonths(d, m) { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; }
function ymd(d) { return d.toISOString().slice(0, 10); }

function drawClock() {
  const ap = new Date(clockState.approval);
  const pat = new Date(clockState.patent);
  const ped = clockState.ped ? 6 : 0;

  const bars = [];
  if (clockState.nce) bars.push({ cls: 'excl', lbl: 'NCE 5 yr' + (ped ? ' +PED' : ''), a: ap, b: addMonths(ap, 60 + ped) });
  if (clockState.ode) bars.push({ cls: 'excl', lbl: 'Orphan 7 yr' + (ped ? ' +PED' : ''), a: ap, b: addMonths(ap, 84 + ped) });
  bars.push({ cls: 'patent', lbl: 'Patent' + (ped ? ' +PED' : ''), a: ap, b: addMonths(pat, ped) });

  let stayEnd = null;
  if (clockState.piv) {
    const piv = new Date(clockState.piv);
    stayEnd = addMonths(piv, 30);
    bars.push({ cls: 'stay', lbl: '30-month stay', a: piv, b: stayEnd });
  }

  const devStart = TODAY;
  const devEnd = addMonths(TODAY, +clockState.devMonths);
  bars.push({ cls: 'dev', lbl: 'Our development', a: devStart, b: devEnd });

  const blockers = [addMonths(pat, ped)];
  if (clockState.nce) blockers.push(addMonths(ap, 60 + ped));
  if (clockState.ode) blockers.push(addMonths(ap, 84 + ped));
  if (stayEnd) blockers.push(stayEnd);
  const legalEarliest = new Date(Math.max(...blockers.map(d => d.getTime())));
  const readyAt = devEnd;
  const entry = new Date(Math.max(legalEarliest.getTime(), readyAt.getTime()));
  const binding = readyAt > legalEarliest ? 'capability' : 'law';

  const t0 = Math.min(ap.getTime(), TODAY.getTime());
  const t1 = Math.max(entry.getTime(), ...bars.map(b => b.b.getTime())) + 1000 * 3600 * 24 * 200;
  const pct = d => ((d.getTime() - t0) / (t1 - t0) * 100);

  $('#clockChart').innerHTML = bars.map(b =>
    `<div class="gbar"><span class="lbl">${esc(b.lbl)}</span><div class="gtrack">
      <div class="gfill ${b.cls}" style="left:${pct(b.a).toFixed(2)}%;width:${(pct(b.b) - pct(b.a)).toFixed(2)}%"></div>
      <div class="gnow" style="left:${pct(TODAY).toFixed(2)}%"></div>
    </div></div>`).join('') +
    `<div class="gbar"><span class="lbl">Earliest entry</span><div class="gtrack">
      <div class="gfill" style="left:${pct(entry).toFixed(2)}%;width:2px;background:var(--acc)"></div>
      <div class="gnow" style="left:${pct(TODAY).toFixed(2)}%"></div></div></div>`;

  const msg = LANG === 'zh'
    ? (binding === 'law'
      ? `最早進場日為 <b>${ymd(entry)}</b>，由<b>法律</b>決定。你的開發能在 ${ymd(readyAt)} 就緒，因此有 ${Math.round((entry - readyAt) / 2.63e9)} 個月的緩衝——這段時間應該用來把 PPQ 與查廠準備做完，而不是拿來拖延啟動。`
      : `最早進場日為 <b>${ymd(entry)}</b>，由<b>你的開發速度</b>決定，而非法律。法律上 ${ymd(legalEarliest)} 就可以進場，你遲到了 ${Math.round((readyAt - legalEarliest) / 2.63e9)} 個月——在多來源市場上，這幾個月正是價格侵蝕最劇烈的時期。`)
    : (binding === 'law'
      ? `Earliest entry is <b>${ymd(entry)}</b>, and it is set by <b>law</b>. Your development is ready at ${ymd(readyAt)}, giving ${Math.round((entry - readyAt) / 2.63e9)} months of slack — which should be spent finishing PPQ and inspection readiness, not spent starting later.`
      : `Earliest entry is <b>${ymd(entry)}</b>, and it is set by <b>your own development speed</b>, not by law. The legal door opens ${ymd(legalEarliest)} and you arrive ${Math.round((readyAt - legalEarliest) / 2.63e9)} months late — in a multi-source market those are the months in which the price falls fastest.`);
  $('#clockVerdict').innerHTML = msg;
}

/* ---------- cost model --------------------------------------------------- */

let activeRoute = 'r_anda_invitro';
const costState = { brandSales: 875, share: 22, rivals: 1, cogs: 38, devCost: 9 };

function renderCostControls() {
  const c = $('#costControls'); c.innerHTML = '';
  const rows = [
    ['brandSales', 'Brand US sales, US$M', 10, 20000, 5],
    ['share', 'Our share of generic volume, %', 1, 80, 1],
    ['rivals', 'Competitors at our entry', 0, 12, 1],
    ['cogs', 'COGS as % of net price', 5, 90, 1],
    ['devCost', 'Internal development cost, US$M', 1, 120, 1]
  ];
  rows.forEach(([k, lbl, mn, mx, st]) => {
    const w = el('div', 'ctrl');
    w.appendChild(el('label', null, lbl));
    const i = el('input'); i.type = 'number'; i.min = mn; i.max = mx; i.step = st; i.value = costState[k];
    i.oninput = () => { costState[k] = +i.value || 0; renderCost(); };
    w.appendChild(i); c.appendChild(w);
  });
}

function renderCost() {
  const r = PATHWAY_TREE.results[activeRoute] || PATHWAY_TREE.results.r_anda_invitro;
  const priceFrac = erodedPriceFraction(costState.rivals);
  const genericMarket = costState.brandSales * priceFrac;
  const revenue = genericMarket * costState.share / 100;
  const gross = revenue * (1 - costState.cogs / 100);
  const invest = costState.devCost + (r.fee + r.clinicalCost) / 1e6;
  const payback = gross > 0 ? invest / gross : Infinity;

  const cls = payback < 1.5 ? 'ok' : payback < 3.5 ? 'warn' : 'bad';
  $('#costOut').innerHTML = `
    <div class="ro"><span class="k">Price retained</span><span class="v">${(priceFrac * 100).toFixed(0)}<span class="u">%</span></span></div>
    <div class="ro"><span class="k">Generic market</span><span class="v">${fmt(genericMarket)}<span class="u">$M</span></span></div>
    <div class="ro"><span class="k">Our revenue / yr</span><span class="v">${fmt(revenue, 1)}<span class="u">$M</span></span></div>
    <div class="ro"><span class="k">Gross profit / yr</span><span class="v">${fmt(gross, 1)}<span class="u">$M</span></span></div>
    <div class="ro"><span class="k">Total invested</span><span class="v">${fmt(invest, 1)}<span class="u">$M</span></span></div>
    <div class="ro ${cls}"><span class="k">Payback</span><span class="v">${isFinite(payback) ? payback.toFixed(1) : '∞'}<span class="u">yr</span></span></div>`;
  drawErosion();
}

function drawErosion() {
  const cv = $('#erosionCanvas'); if (!cv) return;
  const x = cv.getContext('2d'); const W = cv.width, H = cv.height;
  x.clearRect(0, 0, W, H);
  const pad = { l: 40, r: 14, t: 14, b: 26 };
  const px = i => pad.l + i / 12 * (W - pad.l - pad.r);
  const py = v => H - pad.b - v * (H - pad.t - pad.b);

  x.strokeStyle = '#232a32'; x.lineWidth = 1;
  for (let v = 0; v <= 1.0001; v += 0.25) {
    x.beginPath(); x.moveTo(pad.l, py(v)); x.lineTo(W - pad.r, py(v)); x.stroke();
    x.fillStyle = '#6a7683'; x.font = '10px "IBM Plex Mono", monospace'; x.textAlign = 'right';
    x.fillText((v * 100).toFixed(0) + '%', pad.l - 6, py(v) + 3);
  }
  x.beginPath();
  for (let i = 0; i <= 12; i++) { const y = py(erodedPriceFraction(i)); i ? x.lineTo(px(i), y) : x.moveTo(px(i), y); }
  x.strokeStyle = '#e0a338'; x.lineWidth = 2; x.stroke();

  for (let i = 0; i <= 12; i++) {
    x.beginPath(); x.arc(px(i), py(erodedPriceFraction(i)), i === costState.rivals ? 5 : 2.5, 0, 7);
    x.fillStyle = i === costState.rivals ? '#4fb3a5' : '#e0a338'; x.fill();
  }
  x.fillStyle = '#6a7683'; x.font = '10px "IBM Plex Mono", monospace'; x.textAlign = 'center';
  for (let i = 0; i <= 12; i += 2) x.fillText(i, px(i), H - 9);
  x.textAlign = 'left';
  x.fillText(LANG === 'zh' ? '競爭者數量 → 價格保留率' : 'competitors → price retained', pad.l + 4, pad.t + 10);
}

/* ============================================================================
   3 · DOSSIER
   ========================================================================== */

function renderDossier() {
  const h = DD.header;
  $('#ddHeader').innerHTML = [
    ['Brand', h.brand], ['INN', h.inn], ['Application', h.app],
    ['Form', t(h.form)], ['Strengths', h.strengths], ['Sponsor', h.sponsor]
  ].map(([k, v]) => `<div><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('');

  $('#ddWhy').innerHTML = t(DD.rationale).map(p => `<p>${esc(p)}</p>`).join('');

  $('#ddReg').innerHTML = DD.regulatory.map(r =>
    `<div class="qa"><div class="q">${esc(t(r.q))}</div><div class="src">${esc(r.src)}</div><div class="a">${esc(t(r.a))}</div></div>`
  ).join('');

  $('#ddQtpp').innerHTML = DD.qtpp.map(q =>
    `<div class="si"><div class="si-h"><b>${esc(t(q.attr))}</b><span class="meta">${esc(t(q.target))}</span></div><p>${esc(t(q.just))}</p></div>`
  ).join('');

  const f = DD.formulation;
  const coatMg = f.fillWeightMg * f.coatingLoadPct / 100;
  let rows = f.components.map(c => {
    let mg = '—';
    if (c.layer === 'coat') mg = (coatMg * c.pctOfCoat / 100).toFixed(3) + ' mg';
    else if (c.layer === 'core') mg = (f.fillWeightMg - coatMg).toFixed(2) + ' mg';
    return `<div class="si"><div class="si-h"><b>${esc(c.name)}</b><span class="meta">${mg}</span></div>
      <p class="tag">${esc(t(c.role))}</p><p>${esc(t(c.note))}</p></div>`;
  }).join('');
  $('#ddForm').innerHTML = `<p class="fine" style="margin-top:0;margin-bottom:12px">${esc(t(f.note))}</p>
    <div class="stack-list">${rows}</div>`;

  $('#ddCqa').innerHTML = DD.cqas.map(c => {
    let sev = '<span class="sev">'; for (let i = 1; i <= 5; i++) sev += `<i class="${i <= c.sev ? 'f' : ''}"></i>`; sev += '</span>';
    return `<div class="si"><div class="si-h"><b>${esc(t(c.cqa))}${sev}</b></div>
      <p><span class="tag">driver</span> ${esc(t(c.driver))}</p>
      <p><span class="tag">control</span> ${esc(t(c.control))}</p>
      <p><span class="tag">IPC</span> ${esc(t(c.ipc))}</p></div>`;
  }).join('');

  $('#ddAna').innerHTML = DD.analytics.map(a =>
    `<div class="si"><div class="si-h"><b>${esc(t(a.test))}</b><span class="meta">${esc(a.method)}</span></div><p>${esc(t(a.purpose))}</p></div>`
  ).join('');

  $('#ddPlan').innerHTML = DD.plan.map(p =>
    `<div class="pstep"><div class="ph"><b>${esc(t(p.phase))}</b><span>month ${esc(p.months)}</span></div>
     <div><ul>${t(p.items).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
     <div class="gate">${esc(t(p.gate))}</div></div></div>`
  ).join('');
}

/* ============================================================================
   4 · PROTOCOL
   ========================================================================== */

function computeBatch(nCaps) {
  const b = PROTOCOL.basis;
  const beadMgPerCap = b.fillWeightMg;
  const coatMgPerCap = beadMgPerCap * b.coatingLoadPct / 100;
  const coreMgPerCap = beadMgPerCap - coatMgPerCap;
  const ov = 1 + b.overagePct / 100;

  const comp = [];
  const cc = b.coatComposition;
  const names = {
    linaclotide: 'Linaclotide (potency-adjusted)',
    hypromellose: 'Hypromellose 2910, 6 cP',
    calciumChlorideDihydrate: 'Calcium chloride dihydrate',
    lLeucine: 'L-Leucine'
  };
  // perBatch is in GRAMS throughout (perCap is mg, so mg x count / 1000 = g)
  Object.keys(cc).forEach(k => {
    const perCap = coatMgPerCap * cc[k] / 100;
    comp.push({ name: names[k], perCap, perBatch: perCap * nCaps * ov / 1000 });
  });
  comp.push({ name: 'MCC spheres 150–300 µm (core)', perCap: coreMgPerCap, perBatch: coreMgPerCap * nCaps * ov / 1000 });
  comp.push({ name: 'Purified water (removed in process)', perCap: null, perBatch: null });

  const solidsG = coatMgPerCap * nCaps * ov / 1000;                 // g of applied solids
  const solutionKg = solidsG / (b.solutionSolidsPct / 100) / 1000;  // kg of coating solution
  const coreChargeKg = coreMgPerCap * nCaps * ov / 1e6;
  const beadYieldKg = beadMgPerCap * nCaps * ov / 1e6;
  const sprayGmin = 22;
  const sprayMin = solutionKg * 1000 / sprayGmin;
  const waterKg = solutionKg * (1 - b.solutionSolidsPct / 100);

  return { comp, solidsG, solutionKg, coreChargeKg, beadYieldKg, sprayMin, waterKg, sprayGmin, coatMgPerCap, coreMgPerCap, beadMgPerCap, nCaps, ov };
}

function renderProtocolNumbers() {
  const n = +$('#batchSize').value;
  $('#batchOut').textContent = fmt(n) + ' ' + t(UI.pr.capsules);
  const B = computeBatch(n);

  $('#formulaBody').innerHTML = B.comp.map(c =>
    `<tr><td>${esc(c.name)}</td>
     <td class="num">${c.perCap == null ? 'q.s.' : c.perCap.toFixed(4) + ' mg'}</td>
     <td class="num">${c.perBatch == null ? 'q.s.' : (c.perBatch >= 1000 ? (c.perBatch / 1000).toFixed(3) + ' kg' : c.perBatch.toFixed(1) + ' g')}</td></tr>`
  ).join('');

  $('#derivedOut').innerHTML = `
    <div class="ro"><span class="k">Core charge</span><span class="v">${B.coreChargeKg.toFixed(2)}<span class="u">kg</span></span></div>
    <div class="ro"><span class="k">Solids applied</span><span class="v">${B.solidsG.toFixed(0)}<span class="u">g</span></span></div>
    <div class="ro"><span class="k">Coating solution</span><span class="v">${B.solutionKg.toFixed(2)}<span class="u">kg</span></span></div>
    <div class="ro"><span class="k">Water to evaporate</span><span class="v">${B.waterKg.toFixed(2)}<span class="u">kg</span></span></div>
    <div class="ro"><span class="k">Spray time @${B.sprayGmin} g/min</span><span class="v">${(B.sprayMin / 60).toFixed(1)}<span class="u">h</span></span></div>
    <div class="ro"><span class="k">Bead yield (theor.)</span><span class="v">${B.beadYieldKg.toFixed(2)}<span class="u">kg</span></span></div>
    <div class="ro"><span class="k">Drug load</span><span class="v">${(PROTOCOL.basis.strength / 1000 / B.beadMgPerCap * 100).toFixed(3)}<span class="u">% w/w</span></span></div>
    <div class="ro"><span class="k">Overage applied</span><span class="v">${PROTOCOL.basis.overagePct}<span class="u">%</span></span></div>`;

  // API charge shown inside step 1 (perBatch is already grams)
  const t1 = $('#apiCharge'); if (t1) t1.textContent = B.comp[0].perBatch.toFixed(2) + ' g';
}

function renderSteps() {
  const box = $('#steps'); box.innerHTML = '';
  PROTOCOL.steps.forEach((s, idx) => {
    const d = el('div', 'step' + (idx === 0 ? ' open' : ''));
    const head = el('div', 'step-h');
    head.innerHTML = `<span class="step-n">${s.n}</span><span class="step-t">${esc(t(s.title))}</span><span class="step-x">+</span>`;
    head.onclick = () => d.classList.toggle('open');
    d.appendChild(head);

    const b = el('div', 'step-b');
    b.innerHTML =
      `<div class="sub"><h5>${esc(t(UI.pr.purpose))}</h5><p>${esc(t(s.purpose))}</p></div>` +
      `<div class="sub"><h5>${esc(t(UI.pr.equipment))}</h5><p>${esc(t(s.equipment))}</p></div>` +
      `<div class="sub"><h5>${esc(t(UI.pr.params))}</h5><table class="ptable">` +
      s.params.map(p => {
        const v = (p.v === 'computed' && s.id === 'dispensing') ? `<span id="apiCharge">—</span>`
          : (p.v === 'computed' ? '—' : esc(p.v));
        return `<tr><td class="pn">${esc(t(p.p))}</td><td class="pv">${v} ${esc(p.unit || '')}</td><td class="pr">${esc(t(p.rationale))}</td></tr>`;
      }).join('') + `</table></div>` +
      `<div class="sub"><h5>${esc(t(UI.pr.watch))}</h5><ul class="wlist">${t(s.watch).map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>` +
      (s.branch && s.branch.length ? `<div class="sub"><h5>${esc(t(UI.pr.branch))}</h5>` +
        s.branch.map(br => `<div class="branch"><div class="if">IF · ${esc(t(br.if))}</div><div class="then">${esc(t(br.then))}</div></div>`).join('') + `</div>` : '') +
      `<div class="gmp"><b>${esc(t(UI.pr.gmpNote))}</b> — ${esc(t(s.gmp))}</div>`;
    d.appendChild(b);
    box.appendChild(d);
  });
}

let tsSel = 'agglom';
function renderTrouble() {
  const chips = $('#tsChips'); chips.innerHTML = '';
  PROTOCOL.troubles.forEach(tr => {
    const c = el('button', 'chip' + (tr.id === tsSel ? ' on' : ''), esc(t(tr.obs).split(';')[0]));
    c.onclick = () => { tsSel = tr.id; renderTrouble(); };
    chips.appendChild(c);
  });
  const tr = PROTOCOL.troubles.find(x => x.id === tsSel);
  $('#tsBody').innerHTML = `<div class="ts-card">
    <div class="obs">${esc(t(tr.obs))}</div>
    <div class="sec-lbl">${esc(t(UI.pr.root))}</div><p>${esc(t(tr.root))}</p>
    <div class="sec-lbl">${esc(t(UI.pr.checks))}</div><ul class="wlist">${t(tr.checks).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <div class="sec-lbl">${esc(t(UI.pr.actions))}</div><ol>${t(tr.actions).map(a => `<li>${esc(a)}</li>`).join('')}</ol>
    <div class="ts-wrong"><div class="lbl">${esc(t(UI.pr.wrong))}</div><p>${esc(t(tr.wrong))}</p></div>
  </div>`;
}

/* ============================================================================
   5 · FLUID BED
   ========================================================================== */

const FB_BASE = {
  mode: 'wurster', airVol: 340, inletT: 55, dewPtIn: 10, spray: 30, atom: 2.0,
  gap: 16, loadKg: 3.5, dpUm: 250, rhoP: 1400, solidsPct: 8, liqT: 20, runMin: 165
};
let fb = { ...FB_BASE };
let activeScenario = null;

const FB_RANGE = {
  airVol:   [80, 620, 5, 'm³/h'],
  inletT:   [25, 85, 1, '°C'],
  dewPtIn:  [0, 24, 0.5, '°C'],
  spray:    [0, 80, 1, 'g/min'],
  atom:     [0.4, 3.2, 0.1, 'bar'],
  gap:      [6, 36, 1, 'mm'],
  loadKg:   [0.5, 9, 0.1, 'kg'],
  solidsPct:[4, 20, 0.5, '% w/w'],
  dpUm:     [80, 1200, 10, 'µm']
};

function renderFbControls() {
  const mode = $('#fbMode'); mode.innerHTML = '';
  [['wurster', UI.fb.wurster], ['topspray', UI.fb.topspray]].forEach(([k, lbl]) => {
    const c = el('button', 'chip' + (fb.mode === k ? ' on' : ''), esc(t(lbl)));
    c.onclick = () => { fb.mode = k; if (k === 'topspray') fb.dpUm = 180; renderFbControls(); fbUpdate(); };
    mode.appendChild(c);
  });

  const box = $('#fbSliders'); box.innerHTML = '';
  Object.keys(FB_RANGE).forEach(k => {
    if (k === 'gap' && fb.mode !== 'wurster') return;
    const [mn, mx, st, unit] = FB_RANGE[k];
    const knob = FB_KNOBS.find(x => x.id === k);
    const label = knob ? t(knob.name) : k;
    const row = el('div', 'wrow');
    row.innerHTML = `<div class="wrow-top"><label>${esc(label)}</label><span class="v">${fb[k]} ${esc(unit)}</span></div>`;
    const i = el('input'); i.type = 'range'; i.min = mn; i.max = mx; i.step = st; i.value = fb[k];
    i.oninput = () => { fb[k] = +i.value; row.querySelector('.v').textContent = fb[k] + ' ' + unit; fbUpdate(); };
    row.appendChild(i); box.appendChild(row);
  });
}

let lastSolve = null;

function fbUpdate() {
  const r = fbSolve(fb);
  lastSolve = r;

  const cls = (v, lo, hi) => (v < lo || v > hi) ? (v < lo * 0.8 || v > hi * 1.2 ? 'bad' : 'warn') : 'ok';
  const ro = (k, v, u, c) => `<div class="ro ${c || ''}"><span class="k">${k}</span><span class="v">${v}<span class="u">${u}</span></span></div>`;

  $('#fbThermo').innerHTML =
    ro('Product temp', r.Tprod.toFixed(1), '°C', cls(r.Tprod, 36, 44)) +
    ro('Outlet air', r.Tout.toFixed(1), '°C') +
    ro('Outlet RH', r.rhOut.toFixed(0), '%', r.rhOut > 55 ? 'bad' : r.rhOut > 38 ? 'warn' : 'ok') +
    ro('Outlet dew pt', r.dpOut.toFixed(1), '°C') +
    ro('Drying force', r.dryingForce.toFixed(0), 'K', r.dryingForce < 12 ? 'bad' : r.dryingForce < 20 ? 'warn' : 'ok') +
    ro('Water load', (r.mWater * 3600).toFixed(2), 'kg/h');

  $('#fbHydro').innerHTML =
    ro('U<sub>mf</sub>', r.Umf.toFixed(3), 'm/s') +
    ro('U<sub>t</sub>', r.Ut.toFixed(2), 'm/s') +
    ro('Superficial U', r.Usup.toFixed(2), 'm/s') +
    (fb.mode === 'wurster'
      ? ro('Up-bed U', r.Utube.toFixed(2), 'm/s', r.transportOK ? 'ok' : 'bad') +
        ro('U<sub>up</sub> / U<sub>t</sub>', (r.Utube / r.Ut).toFixed(1), '', r.transportOK ? 'ok' : 'bad') +
        ro('Annulus / U<sub>mf</sub>', r.annRatio.toFixed(1), '',
           r.annRatio < 0.35 ? 'warn' : r.annRatio > 6 ? 'warn' : 'ok') +
        ro('Cycle time', isFinite(r.cycleS) ? r.cycleS.toFixed(1) : '∞', 's', r.cycleS > 15 ? 'warn' : 'ok')
      : ro('U / U<sub>mf</sub>', r.FN.toFixed(1), '', r.FN < 1.5 ? 'bad' : r.FN > 9 ? 'warn' : 'ok'));

  $('#fbQuality').innerHTML =
    ro('Droplet d₃₂', r.smd.toFixed(0), 'µm', r.smd < 18 ? 'warn' : r.smd > 55 ? 'warn' : 'ok') +
    (fb.mode === 'wurster' ? ro('Passes', fmt(r.passes || 0), '', (r.passes || 0) < 600 ? 'warn' : 'ok') : '') +
    (fb.mode === 'wurster' ? ro('Coating CV', (r.coatCV || 0).toFixed(1), '%', (r.coatCV || 99) > 6 ? 'bad' : (r.coatCV || 99) > 4 ? 'warn' : 'ok') : '') +
    (fb.mode === 'wurster' ? ro('Est. AV', (r.avEst || 0).toFixed(1), '', (r.avEst || 99) > 15 ? 'bad' : (r.avEst || 99) > 12 ? 'warn' : 'ok') : '') +
    ro('Coating eff.', (r.coatEff * 100).toFixed(0), '%', r.coatEff < 0.8 ? 'bad' : r.coatEff < 0.9 ? 'warn' : 'ok') +
    ro('Over-wet idx', r.overWet.toFixed(2), '', r.overWet > 0.6 ? 'bad' : r.overWet > 0.35 ? 'warn' : 'ok') +
    ro('Spray-dry idx', r.sprayDry.toFixed(2), '', r.sprayDry > 0.6 ? 'bad' : r.sprayDry > 0.35 ? 'warn' : 'ok') +
    ro('Attrition idx', r.attrition.toFixed(2), '', r.attrition > 0.6 ? 'bad' : r.attrition > 0.4 ? 'warn' : 'ok');

  const REG = {
    fixed: { en: 'Fixed bed — not fluidised', zh: '填充床——未流化' },
    stalled: { en: 'Circulation stalled', zh: '循環停滯' },
    elutriating: { en: 'Elutriating to filters', zh: '正被帶出至濾袋' },
    minimal: { en: 'Marginal fluidisation', zh: '流化勉強' },
    slugging: { en: 'Over-fluidised / slugging', zh: '過度流化／節湧' },
    annulusFluid: { en: 'Annulus fluidising — plug flow lost', zh: '環隙區已流化——柱塞流消失' },
    annulusStagnant: { en: 'Annulus stagnant', zh: '環隙區停滯' },
    good: { en: 'Stable circulation', zh: '循環穩定' }
  };
  const badge = $('#fbRegime');
  badge.textContent = t(REG[r.regime]);
  badge.className = 'regime-badge ' + r.regimeClass;

  const alerts = [];
  const A = (c, en, zh) => alerts.push({ c, m: LANG === 'zh' ? zh : en });
  if (fb.mode === 'topspray' && r.FN < 1) A('bad', 'Superficial velocity is below minimum fluidisation. The bed is a packed bed; nothing circulates and spraying now will cake the distributor plate.', '表觀氣速低於最小流化速度。床體為填充床，毫無循環；此時噴霧會使分佈板結餅。');
  if (fb.mode === 'topspray' && r.FN > 9) A('warn', 'The bed is over-fluidised. Slugging gives violent mixing, high attrition and an unstable spray zone.', '床體過度流化。節湧造成劇烈混合、高磨耗與不穩定的噴霧區。');
  if (fb.mode === 'wurster' && !r.transportOK) A('bad', 'Up-bed velocity is not comfortably above the terminal velocity of the beads. Particles are not being transported through the partition — increase air volume before spraying.', '上升區氣速未明顯高於微丸終端速度。顆粒未被輸送通過內筒——噴霧前先提高風量。');
  if (fb.mode === 'wurster' && r.annRatio > 6) A('warn', 'The annulus is itself fluidising. The down-bed should be a dense, slowly descending moving bed — once it fluidises you lose the near-plug-flow that makes each pass comparable, and uniformity degrades even though circulation looks fast.', '環隙區本身正在流化。下降區應該是緻密、緩慢下沉的移動床——一旦流化，就失去了使每次通過可比的近柱塞流，即使循環看起來很快，均勻度仍會惡化。');
  if (fb.mode === 'wurster' && r.annRatio < 0.35) A('warn', 'The annulus is barely aerated and beads may bridge in the down-bed rather than descend.', '環隙區幾乎未被曝氣，微丸可能在下降區架橋而非下沉。');
  if (r.elutriating) A('warn', 'Freeboard velocity exceeds the terminal velocity of this particle size. Fines are leaving into the filters, taking potency with them.', '擴張區氣速超過此粒徑的終端速度。細粉正流失至濾袋，並帶走效價。');
  if (r.overWet > 0.55) A('bad', 'Over-wetting. Water is entering faster than the air can remove it — reduce spray rate first, not inlet temperature.', '過濕。水進入的速度快於空氣移除的速度——先降噴速，不是先升溫。');
  if (r.sprayDry > 0.55) A('bad', 'Spray drying. Droplets are solidifying before they land — reduce atomisation pressure and product temperature, and raise solids content.', '噴霧乾燥。液滴在落下前即固化——降低霧化壓力與物料溫度，並提高固含量。');
  if (r.dryingForce < 12) A('warn', 'The gap between outlet temperature and outlet dew point is closing. The air is approaching saturation and evaporative capacity is nearly exhausted.', '排風溫度與排風露點的差距正在收斂。空氣接近飽和，蒸發能力幾近耗盡。');
  if (r.Tprod > 46) A('warn', 'Product temperature is above the peptide stability ceiling used in this dossier. Extend drying time instead of raising the ceiling.', '物料溫度高於本評估所採用的胜肽安定性上限。應延長乾燥時間，而非提高上限。');
  if (fb.mode === 'wurster' && r.avEst != null && r.avEst > 15) A('warn', 'Predicted acceptance value exceeds 15. Uniformity is set by passes through the spray zone — open the gap, raise air volume, and lower spray rate to keep total mass constant.', '預測接受值超過 15。均勻度由通過噴霧區的次數決定——加大間隙、提高風量、降低噴速以維持總質量不變。');
  if (!alerts.length) A('ok', 'All indices within their working ranges for this configuration.', '在此配置下，所有指標均落在工作範圍內。');
  $('#fbAlerts').innerHTML = alerts.map(a => `<div class="alert ${a.c}">${esc(a.m)}</div>`).join('');

  queueWindow();
  checkScenario(r);
}

/* The operating-window map costs a few thousand solves per redraw, so throttle
   it during slider drags: at most one redraw every 180 ms, always with a
   trailing call so the final position is drawn. The readouts and the animation
   stay at full rate — only the map is rate-limited. */
let windowTimer = null, windowLast = 0;
function queueWindow() {
  const now = Date.now();
  if (windowTimer) return;
  const wait = Math.max(0, 180 - (now - windowLast));
  if (wait === 0) { windowLast = now; drawWindow(); return; }
  windowTimer = setTimeout(() => { windowTimer = null; windowLast = Date.now(); drawWindow(); }, wait);
}

/* ---------- animation --------------------------------------------------- */

const CANV = { W: 560, H: 620 };
let particles = [], droplets = [], rafId = null;

function initParticles() {
  particles = [];
  const n = Math.round(120 + fb.loadKg * 26);
  for (let i = 0; i < n; i++) {
    particles.push({
      x: 150 + Math.random() * 260,
      y: 300 + Math.random() * 180,
      vx: 0, vy: 0, phase: 'down', coat: Math.random() * 0.2, r: 2.2 + Math.random() * 1.1
    });
  }
}

function geomPx() {
  const plateY = 500, tubeTopY = 262, cx = 280, tubeHalf = 45;
  const gapPx = fb.mode === 'wurster' ? 8 + (fb.gap - 6) * 1.15 : 0;
  return { plateY, tubeTopY, cx, tubeHalf, gapPx, tubeBotY: plateY - gapPx, wallL: 132, wallR: 428 };
}

function drawVessel(x, g, r) {
  // filter housing
  x.fillStyle = '#0e1116'; x.strokeStyle = '#2b333c'; x.lineWidth = 1.4;
  x.beginPath(); x.rect(70, 26, 420, 62); x.fill(); x.stroke();
  for (let i = 0; i < 5; i++) {
    x.beginPath();
    x.moveTo(100 + i * 78, 88); x.lineTo(112 + i * 78, 34); x.lineTo(148 + i * 78, 34); x.lineTo(160 + i * 78, 88);
    x.closePath(); x.fillStyle = '#141a20'; x.fill(); x.strokeStyle = '#2b333c'; x.stroke();
  }
  x.fillStyle = '#4a5560'; x.font = '9px "IBM Plex Mono", monospace'; x.textAlign = 'left';
  x.fillText('FILTER', 78, 20);

  // expansion cone
  x.beginPath(); x.moveTo(70, 88); x.lineTo(g.wallL, 250); x.lineTo(g.wallR, 250); x.lineTo(490, 88);
  x.strokeStyle = '#2b333c'; x.lineWidth = 1.4; x.stroke();
  x.fillStyle = 'rgba(255,255,255,.012)'; x.fill();

  // product container
  x.beginPath(); x.rect(g.wallL, 250, g.wallR - g.wallL, g.plateY - 250);
  x.strokeStyle = '#2b333c'; x.stroke(); x.fillStyle = 'rgba(255,255,255,.012)'; x.fill();

  // distributor plate
  x.strokeStyle = '#3a4550'; x.lineWidth = 2.4;
  x.beginPath(); x.moveTo(g.wallL, g.plateY); x.lineTo(g.wallR, g.plateY); x.stroke();
  // plate open-area representation
  for (let px = g.wallL + 8; px < g.wallR; px += 9) {
    const central = fb.mode === 'wurster' && Math.abs(px - g.cx) < g.tubeHalf + 12;
    x.strokeStyle = central ? '#5d6d7a' : '#333d47';
    x.lineWidth = central ? 1.8 : 1;
    x.beginPath(); x.moveTo(px, g.plateY - 3); x.lineTo(px, g.plateY + 3); x.stroke();
  }

  // plenum
  x.beginPath(); x.moveTo(g.wallL, g.plateY); x.lineTo(180, 588); x.lineTo(380, 588); x.lineTo(g.wallR, g.plateY);
  x.strokeStyle = '#2b333c'; x.lineWidth = 1.4; x.stroke();

  // Wurster partition
  if (fb.mode === 'wurster') {
    x.strokeStyle = '#4a5560'; x.lineWidth = 2;
    x.beginPath();
    x.moveTo(g.cx - g.tubeHalf, g.tubeTopY); x.lineTo(g.cx - g.tubeHalf, g.tubeBotY);
    x.moveTo(g.cx + g.tubeHalf, g.tubeTopY); x.lineTo(g.cx + g.tubeHalf, g.tubeBotY);
    x.stroke();
    // gap indicator
    x.strokeStyle = 'rgba(224,163,56,.55)'; x.lineWidth = 1; x.setLineDash([3, 3]);
    x.beginPath(); x.moveTo(g.cx - g.tubeHalf - 26, g.tubeBotY); x.lineTo(g.cx - g.tubeHalf - 26, g.plateY); x.stroke();
    x.setLineDash([]);
    x.fillStyle = '#e0a338'; x.font = '9px "IBM Plex Mono", monospace'; x.textAlign = 'right';
    x.fillText(fb.gap + 'mm', g.cx - g.tubeHalf - 32, (g.tubeBotY + g.plateY) / 2 + 3);
  }

  // nozzle
  const ny = fb.mode === 'wurster' ? g.plateY + 4 : 150;
  x.fillStyle = '#59646f';
  x.beginPath();
  if (fb.mode === 'wurster') { x.moveTo(g.cx - 7, ny + 16); x.lineTo(g.cx + 7, ny + 16); x.lineTo(g.cx + 3, ny - 2); x.lineTo(g.cx - 3, ny - 2); }
  else { x.moveTo(g.cx - 7, ny - 16); x.lineTo(g.cx + 7, ny - 16); x.lineTo(g.cx + 3, ny + 2); x.lineTo(g.cx - 3, ny + 2); }
  x.closePath(); x.fill();

  // air arrows
  const aStr = Math.min(1, fb.airVol / 620);
  x.strokeStyle = `rgba(79,179,165,${0.15 + aStr * 0.4})`; x.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    const ax = 190 + i * 30;
    const central = fb.mode === 'wurster' && Math.abs(ax - g.cx) < g.tubeHalf + 12;
    x.lineWidth = central ? 2 : 1;
    x.beginPath(); x.moveTo(ax, 572); x.lineTo(ax, g.plateY + 8); x.stroke();
    x.beginPath(); x.moveTo(ax - 3, g.plateY + 13); x.lineTo(ax, g.plateY + 7); x.lineTo(ax + 3, g.plateY + 13); x.stroke();
  }
  x.fillStyle = '#4a5560'; x.font = '9px "IBM Plex Mono", monospace'; x.textAlign = 'center';
  x.fillText(fb.airVol + ' m³/h · ' + fb.inletT + '°C · DP ' + fb.dewPtIn + '°C', g.cx, 604);
}

function stepParticles(r) {
  const g = geomPx();
  const upSpeed = Math.min(9, r.Utube * 1.6 + 0.4);
  const downSpeed = Math.max(0.16, Math.min(1.6, r.Uann * 7 + 0.2));
  const bubbling = Math.min(1.4, Math.max(0, (r.FN - 1) * 0.28));
  const dead = r.FN < 1 || (fb.mode === 'wurster' && !r.transportOK);

  particles.forEach(p => {
    if (fb.mode === 'topspray') {
      if (dead) { p.vy += 0.22; p.y = Math.min(p.y + p.vy, g.plateY - p.r - Math.random() * 40); p.vy *= 0.5; return; }
      p.vx += (Math.random() - 0.5) * bubbling * 1.4;
      p.vy += (Math.random() - 0.55) * bubbling * 2.0 + 0.09;
      p.vx *= 0.92; p.vy *= 0.92;
      p.x += p.vx; p.y += p.vy;
      const bedTop = g.plateY - 40 - fb.loadKg * 16 - r.FN * 9;
      if (p.y > g.plateY - p.r) { p.y = g.plateY - p.r; p.vy = -Math.abs(p.vy) * 0.3; }
      if (p.y < bedTop) { p.vy += 0.35; }
      if (p.x < g.wallL + p.r) { p.x = g.wallL + p.r; p.vx = Math.abs(p.vx) * .5; }
      if (p.x > g.wallR - p.r) { p.x = g.wallR - p.r; p.vx = -Math.abs(p.vx) * .5; }
      if (p.y > 200 && p.y < g.plateY && fb.spray > 0) p.coat = Math.min(1, p.coat + fb.spray * 2.4e-6);
      return;
    }

    // ---- Wurster ----
    if (dead) {
      p.vy += 0.2;
      p.y = Math.min(p.y + p.vy, g.plateY - p.r - (Math.random() * 30));
      p.vy *= 0.5;
      return;
    }

    switch (p.phase) {
      case 'up':
        p.y -= upSpeed * (0.8 + Math.random() * 0.4);
        p.x += (g.cx - p.x) * 0.06 + (Math.random() - 0.5) * 1.4;
        if (fb.spray > 0 && p.y > g.tubeTopY && p.y < g.tubeBotY) {
          p.coat = Math.min(1, p.coat + fb.spray * 6e-6 * r.coatEff);
        }
        if (p.y < g.tubeTopY - 14) { p.phase = 'arc'; p.vx = (Math.random() - 0.5) * 5.2 + (p.x - g.cx) * 0.05; p.vy = -upSpeed * 0.36; }
        break;
      case 'arc':
        p.vy += 0.3; p.x += p.vx; p.y += p.vy; p.vx *= 0.985;
        if (p.x < g.wallL + 10) { p.x = g.wallL + 10; p.vx = Math.abs(p.vx) * 0.4; }
        if (p.x > g.wallR - 10) { p.x = g.wallR - 10; p.vx = -Math.abs(p.vx) * 0.4; }
        if (p.vy > 0 && p.y > g.tubeTopY + 12 && Math.abs(p.x - g.cx) > g.tubeHalf + 6) p.phase = 'down';
        if (p.y < 96 && r.elutriating) { p.phase = 'lost'; }
        break;
      case 'down':
        p.y += downSpeed * (0.7 + Math.random() * 0.6);
        p.x += (Math.random() - 0.5) * 0.5;
        if (Math.abs(p.x - g.cx) < g.tubeHalf + 5) p.x += (p.x > g.cx ? 1 : -1) * 1.6;
        if (p.y > g.tubeBotY + 2) p.phase = 'enter';
        break;
      case 'enter':
        p.y = Math.min(p.y + 0.5, g.plateY - p.r - 1);
        p.x += (g.cx - p.x) * 0.10 * (0.4 + fb.gap / 20);
        if (Math.abs(p.x - g.cx) < g.tubeHalf - 6) { p.phase = 'up'; p.y = g.plateY - 8; }
        break;
      case 'lost':
        p.y -= 1.6; p.x += (Math.random() - 0.5) * 1.2;
        if (p.y < 30) { p.phase = 'down'; p.y = 300; p.x = g.cx + (Math.random() > .5 ? 70 : -70); }
        break;
    }
  });

  // droplets
  if (fb.spray > 0) {
    const nNew = Math.max(0, Math.round(fb.spray / 9));
    for (let i = 0; i < nNew; i++) {
      const spread = 0.6 + (fb.atom / 3.2) * 1.5;
      droplets.push({
        x: g.cx + (Math.random() - 0.5) * 6,
        y: fb.mode === 'wurster' ? g.plateY - 2 : 166,
        vx: (Math.random() - 0.5) * spread * 2.4,
        vy: fb.mode === 'wurster' ? -(3.4 + Math.random() * 2.6) : (3.0 + Math.random() * 2.2),
        life: 1
      });
    }
  }
  droplets.forEach(d => { d.x += d.vx; d.y += d.vy; d.vy += fb.mode === 'wurster' ? 0.1 : 0.04; d.life -= 0.024; });
  droplets = droplets.filter(d => d.life > 0).slice(-460);
}

function drawParticles(x, r) {
  const g = geomPx();
  // spray cone glow
  if (fb.spray > 0) {
    const ny = fb.mode === 'wurster' ? g.plateY : 152;
    const grad = x.createRadialGradient(g.cx, ny, 4, g.cx, ny, 175);
    grad.addColorStop(0, `rgba(224,163,56,${0.10 + fb.spray / 400})`);
    grad.addColorStop(1, 'rgba(224,163,56,0)');
    x.fillStyle = grad; x.beginPath(); x.arc(g.cx, ny, 175, 0, 7); x.fill();
  }

  droplets.forEach(d => {
    x.fillStyle = `rgba(126,196,236,${d.life * 0.5})`;
    x.beginPath(); x.arc(d.x, d.y, 1.15, 0, 7); x.fill();
  });

  particles.forEach(p => {
    const c = p.coat;
    const rr = Math.round(150 + c * 74), gg = Math.round(154 - c * 6), bb = Math.round(160 - c * 88);
    x.fillStyle = `rgb(${rr},${gg},${bb})`;
    x.beginPath(); x.arc(p.x, p.y, p.r + c * 0.8, 0, 7); x.fill();
    if (c > 0.55) { x.strokeStyle = `rgba(224,163,56,${(c - 0.55) * 0.9})`; x.lineWidth = 0.8; x.stroke(); }
  });
}

function animate() {
  const cv = $('#fbCanvas'); if (!cv) return;
  const x = cv.getContext('2d');
  const r = lastSolve || fbSolve(fb);
  x.clearRect(0, 0, CANV.W, CANV.H);
  const g = geomPx();
  drawVessel(x, g, r);
  stepParticles(r);
  drawParticles(x, r);
  rafId = requestAnimationFrame(animate);
}

/* ---------- operating window chart -------------------------------------- */

function drawWindow() {
  const cv = $('#windowCanvas'); if (!cv) return;
  const x = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const pad = { l: 46, r: 16, t: 16, b: 34 };
  x.clearRect(0, 0, W, H);

  const SX = [0, 80], SY = [28, 85];   // spray g/min, inlet °C
  const px = v => pad.l + (v - SX[0]) / (SX[1] - SX[0]) * (W - pad.l - pad.r);
  const py = v => H - pad.b - (v - SY[0]) / (SY[1] - SY[0]) * (H - pad.t - pad.b);

  const CELL = 8;
  for (let sx = SX[0]; sx <= SX[1]; sx += 2.6) {
    for (let sy = SY[0]; sy <= SY[1]; sy += 2) {
      const r = fbSolve({ ...fb, spray: sx, inletT: sy });
      const risk = Math.max(r.overWet, r.sprayDry);
      let col;
      if (r.regimeClass === 'bad') col = 'rgba(217,97,79,.30)';
      else if (risk < 0.28) col = `rgba(87,184,148,${0.10 + (0.28 - risk) * 0.55})`;
      else if (risk < 0.55) col = `rgba(216,161,60,${(risk - 0.28) * 0.5})`;
      else col = `rgba(217,97,79,${0.12 + (risk - 0.55) * 0.5})`;
      x.fillStyle = col;
      x.fillRect(px(sx) - CELL / 2, py(sy) - CELL / 2, CELL + 1, CELL + 1);
    }
  }

  // product-temperature isotherms
  [35, 40, 45, 50].forEach(target => {
    x.beginPath(); let started = false;
    for (let sx = SX[0]; sx <= SX[1]; sx += 2.5) {
      let lo = SY[0], hi = SY[1], mid = 0;
      for (let k = 0; k < 12; k++) {
        mid = (lo + hi) / 2;
        const tp = fbSolve({ ...fb, spray: sx, inletT: mid }).Tprod;
        if (tp < target) lo = mid; else hi = mid;
      }
      if (mid > SY[0] + 0.4 && mid < SY[1] - 0.4) {
        started ? x.lineTo(px(sx), py(mid)) : (x.moveTo(px(sx), py(mid)), started = true);
      }
    }
    x.strokeStyle = 'rgba(220,227,234,.32)'; x.lineWidth = 1; x.setLineDash([4, 4]); x.stroke(); x.setLineDash([]);
    x.fillStyle = 'rgba(220,227,234,.5)'; x.font = '9px "IBM Plex Mono", monospace'; x.textAlign = 'left';
    let lo = SY[0], hi = SY[1], mid = 0;
    for (let k = 0; k < 12; k++) { mid = (lo + hi) / 2; if (fbSolve({ ...fb, spray: 74, inletT: mid }).Tprod < target) lo = mid; else hi = mid; }
    if (mid < SY[1] - 1) x.fillText(target + '°C', px(75) + 3, py(mid) + 3);
  });

  // axes
  x.strokeStyle = '#2e3742'; x.lineWidth = 1;
  x.beginPath(); x.moveTo(pad.l, pad.t); x.lineTo(pad.l, H - pad.b); x.lineTo(W - pad.r, H - pad.b); x.stroke();
  x.fillStyle = '#6a7683'; x.font = '10px "IBM Plex Mono", monospace';
  x.textAlign = 'center';
  for (let v = 0; v <= 80; v += 20) x.fillText(v, px(v), H - 14);
  x.fillText(LANG === 'zh' ? '噴速 g/min' : 'spray rate  g/min', (W + pad.l) / 2, H - 3);
  x.textAlign = 'right';
  for (let v = 30; v <= 85; v += 10) x.fillText(v, pad.l - 6, py(v) + 3);
  x.save(); x.translate(11, (H) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center';
  x.fillText(LANG === 'zh' ? '進風溫度 °C' : 'inlet air  °C', 0, 0); x.restore();

  // current point
  x.beginPath(); x.arc(px(fb.spray), py(fb.inletT), 6, 0, 7);
  x.fillStyle = '#e0a338'; x.fill();
  x.strokeStyle = '#0b0d10'; x.lineWidth = 2; x.stroke();
}

/* ---------- scenarios ---------------------------------------------------- */

function renderScenarios() {
  const box = $('#scenList'); box.innerHTML = '';
  FB_SCENARIOS.forEach(s => {
    const d = el('div', 'scen'); d.id = 'scen-' + s.id;
    d.innerHTML = `<b>${esc(t(s.title))}</b><p>${esc(t(s.brief))}</p>
      <div class="goal">${esc(t(UI.fb.goal))}: ${esc(t(s.goal))}</div>`;
    const b = el('button', 'btn', esc(t(UI.fb.load)));
    b.onclick = () => {
      Object.assign(fb, s.setup);
      activeScenario = s.id;
      renderFbControls(); initParticles(); fbUpdate();
      $('#fluidbed').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    d.appendChild(b);
    box.appendChild(d);
  });
}

function checkScenario(r) {
  if (!activeScenario) return;
  const s = FB_SCENARIOS.find(x => x.id === activeScenario);
  const node = $('#scen-' + s.id); if (!node) return;
  const ok = s.check(r);
  node.classList.toggle('done', ok);
  let db = node.querySelector('.scen-debrief');
  if (ok && !db) {
    db = el('div', 'scen-debrief',
      `<div class="lbl">${esc(t(UI.fb.solved))} · ${esc(t(UI.fb.debrief))}</div><p>${esc(t(s.debrief))}</p>`);
    node.appendChild(db);
  } else if (!ok && db) db.remove();
}

/* ---------- knobs & principles ------------------------------------------- */

function renderKnobs() {
  $('#knobList').innerHTML = FB_KNOBS.map(k =>
    `<div class="si"><div class="si-h"><b>${esc(t(k.name))}</b><span class="meta">${esc(k.unit)}</span></div>
      <p><span class="tag">${esc(t(UI.fb.does))}</span> ${esc(t(k.does))}</p>
      <p><span class="tag">${esc(t(UI.fb.reads))}</span> ${esc(t(k.reads))}</p>
      <p><span class="tag">${esc(t(UI.fb.trap))}</span> ${esc(t(k.trap))}</p>
      <p><span class="tag">${esc(t(UI.fb.affects))}</span> ${k.cqa.map(c => `<span class="pill">${esc(c)}</span>`).join(' ')}</p></div>`
  ).join('');

  $('#principleList').innerHTML = FB_PRINCIPLES.map(p =>
    `<div class="prin"><b>${esc(t(p.title))}</b><p>${esc(t(p.body))}</p></div>`
  ).join('');
}

/* ============================================================================
   6 · VALIDATION + METHOD
   ========================================================================== */

function renderValidation() {
  $('#vlChain').innerHTML = VALIDATION.map(v =>
    `<div class="vst"><div class="st">${esc(v.stage)}</div><div class="nm">${esc(t(v.name))}</div><p>${esc(t(v.body))}</p></div>`
  ).join('');
  $('#gapList').innerHTML = TRANSFER_GAPS.map(g =>
    `<div class="si"><div class="si-h"><b>${esc(t(g.item))}</b></div><p>${esc(t(g.ask))}</p></div>`
  ).join('');
}

function renderMethod() {
  $('#mtData').innerHTML = t(UI.mt.data).map(p => `<p>${esc(p)}</p>`).join('');
  $('#mtSources').innerHTML = UI.sourceList.map(s =>
    `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('');
  $('#mtCurriculum').innerHTML = UI.curriculum.map(c =>
    `<li><span>${esc(c.n)}</span>${esc(t(c.t))}</li>`).join('');
  $('#mtClosing').innerHTML = t(UI.mt.closing).map(p => `<p>${esc(p)}</p>`).join('');
}

/* ============================================================================
   BOOT
   ========================================================================== */

function renderAll() {
  applyStatic();
  buildNav();
  renderHero();
  renderWeightUI();
  renderTable();
  renderTree();
  renderClockControls(); drawClock();
  renderCostControls(); renderCost();
  renderDossier();
  renderProtocolNumbers(); renderSteps(); renderProtocolNumbers(); renderTrouble();
  renderFbControls(); fbUpdate();
  renderScenarios(); renderKnobs();
  renderValidation();
  renderMethod();
}

document.addEventListener('DOMContentLoaded', () => {
  $('#langBtn').onclick = () => {
    LANG = LANG === 'en' ? 'zh' : 'en';
    localStorage.setItem('loelang', LANG);
    renderAll();
  };
  $('#treeReset').onclick = () => { treeNode = PATHWAY_TREE.start; treeTrail = []; renderTree(); };
  $('#batchSize').oninput = renderProtocolNumbers;
  $('#fbReset').onclick = () => { fb = { ...FB_BASE }; activeScenario = null; renderFbControls(); initParticles(); fbUpdate(); renderScenarios(); };

  renderAll();
  initParticles();
  animate();
  scrollSpy();
});
