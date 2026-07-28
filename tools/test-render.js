/* Headless render + interaction test for the site. Run: node tools/test-render.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeDocument } = require('./domshim.js');

const root = path.join(__dirname, '..');

const doc = makeDocument(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));

const store = {};
const sandbox = {
  document: doc,
  window: null,
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => store[k] = String(v) },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => { },
  // run timers synchronously so throttled redraws are exercised in-test
  setTimeout: (fn) => { fn(); return 1; },
  clearTimeout: () => { },
  console,
  Math, Date, JSON, Number, String, Array, Object, Intl, isFinite, parseInt, parseFloat, NaN, Infinity
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.addEventListener = () => { };
sandbox.removeEventListener = () => { };
sandbox.matchMedia = () => ({ matches: false });
vm.createContext(sandbox);

const errs = [];
const files = ['data/i18n.js', 'data/molecules.js', 'data/pathway.js', 'data/deepdive.js', 'data/protocol.js', 'data/dosageforms.js', 'data/fluidbed.js', 'data/unitops.js', 'assets/forms.js', 'assets/app.js'];
files.forEach(f => {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f }); }
  catch (e) { errs.push(`LOAD ${f}: ${e.message}`); }
});
try { doc.dispatchEvent({ type: 'DOMContentLoaded' }); }
catch (e) { errs.push('DOMContentLoaded: ' + e.stack.split('\n').slice(0, 3).join(' | ')); }

const $ = s => doc.querySelector(s);
const rep = [];
let fails = 0;
const chk = (name, cond, extra = '') => { if (!cond) fails++; rep.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };
const n = s => ($(s) ? $(s).children.length : -1);

rep.push('=== structure ===');
chk('nav links = 8', n('#nav') === 8, `got ${n('#nav')}`);
chk('hero paragraphs >= 3', n('#heroBody') >= 3, `got ${n('#heroBody')}`);
chk('chain items = 6', n('#chain') === 6, `got ${n('#chain')}`);
chk('molecule rows = 21', n('#molBody') === 21, `got ${n('#molBody')}`);
chk('weight sliders = 7', n('#wSliders') === 7, `got ${n('#wSliders')}`);
chk('preset chips = 4', n('#presets') === 4, `got ${n('#presets')}`);
chk('detail panel populated', $('#molDetail').innerHTML.length > 800);
chk('pathway question rendered', $('#treeBody').textContent.length > 200);
chk('clock bars >= 4', n('#clockChart') >= 4, `got ${n('#clockChart')}`);
chk('clock verdict text', $('#clockVerdict').textContent.length > 60);
chk('cost readouts = 6', n('#costOut') === 6, `got ${n('#costOut')}`);

rep.push('=== dossier ===');
chk('dd header fields = 6', n('#ddHeader') === 6, `got ${n('#ddHeader')}`);
chk('regulatory items = 6', n('#ddReg') === 6, `got ${n('#ddReg')}`);
chk('qtpp rows = 8', n('#ddQtpp') === 8, `got ${n('#ddQtpp')}`);
chk('cqa rows = 8', n('#ddCqa') === 8, `got ${n('#ddCqa')}`);
chk('analytics rows = 9', n('#ddAna') === 9, `got ${n('#ddAna')}`);
chk('plan phases = 5', n('#ddPlan') === 5, `got ${n('#ddPlan')}`);

rep.push('=== protocol ===');
chk('default ranking puts LINZESS first', $('#molBody tr:nth-child(1)').textContent.includes('LINZESS'),
  `top: ${$('#molBody tr:nth-child(1)').textContent.slice(0, 26).trim()}`);
chk('formula rows = 6', n('#formulaBody') === 6, `got ${n('#formulaBody')}`);
chk('API charge ≈ 8.15 g at 50k caps', /^8\.1\d g$/.test($('#apiCharge').textContent), `got "${$('#apiCharge').textContent}"`);
chk('MCC core shown in kg', /3\.3\d\d kg/.test($('#formulaBody').textContent), 'core charge row');
chk('derived readouts = 8', n('#derivedOut') === 8, `got ${n('#derivedOut')}`);
chk('protocol steps = 8', n('#steps') === 8, `got ${n('#steps')}`);
chk('API charge computed', /\d+\.\d+ g/.test($('#apiCharge') ? $('#apiCharge').textContent : ''), `got "${$('#apiCharge') && $('#apiCharge').textContent}"`);
chk('trouble chips = 6', n('#tsChips') === 6, `got ${n('#tsChips')}`);
chk('trouble body populated', $('#tsBody').textContent.length > 500);

rep.push('=== new: readability + figure ===');
chk('how-to-read strip = 4 cells', n('#howToRead') === 4, `got ${n('#howToRead')}`);
chk('screener table starts compact (5 cols)', n('#molHead') === 5, `got ${n('#molHead')}`);
chk('disclosures exist', doc.querySelectorAll('[data-disc]').length >= 4, `got ${doc.querySelectorAll('[data-disc]').length}`);
chk('disclosures start closed', doc.querySelectorAll('[data-disc].open').length === 0);
chk('dossier lead is one paragraph', n('#ddWhyLead') === 1, `got ${n('#ddWhyLead')}`);
chk('capsule svg rendered', $('#capsuleFig').innerHTML.includes('<svg'));
chk('capsule imprint matches label', $('#capsuleFig').innerHTML.includes('FL 145'));
chk('figure has 3 notes + unit ops', n('#capsuleParts') === 4, `got ${n('#capsuleParts')}`);
chk('figure names the selected product', $('#figWho').textContent.includes('LINZESS'));
chk('DailyMed link set', ($('#dmLink').getAttribute('href') || '').includes('dailymed'));

rep.push('=== landing map ===');
chk('overlay opens on first visit', !!$('#mapOverlay'));
chk('overlay is not in the served markup (JS-injected)',
  !fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('mapOverlay'));
chk('map has 5 innovator + 6 module nodes', doc.querySelectorAll('#mapOverlay .mnode').length === 11,
  `got ${doc.querySelectorAll('#mapOverlay .mnode').length}`);
chk('six nodes are clickable', doc.querySelectorAll('#mapOverlay [data-go]').length === 6,
  `got ${doc.querySelectorAll('#mapOverlay [data-go]').length}`);
chk('every clickable node targets a real section',
  doc.querySelectorAll('#mapOverlay [data-go]').every(g => !!doc.querySelector('#' + g.dataset.go)));
chk('patent-cliff junction present', $('#mapOverlay').textContent.toLowerCase().includes('exclusivity'));
chk('skip control present', !!$('#mapOverlay .map-skip'));
chk('map reopen button labelled', $('#mapBtn').textContent.length > 0);
chk('body scroll locked while open', doc.body.classList.contains('locked'));
$('#mapOverlay .map-skip').click();
chk('skip closes and unlocks', !doc.body.classList.contains('locked'));
// regression: a dismissed overlay that stays in the document is a transparent
// fixed layer over the whole page, and every button and slider stops working
chk('closing REMOVES the overlay from the document', !$('#mapOverlay'));
chk('overlay css cannot intercept clicks unless shown', (() => {
  const css = fs.readFileSync(path.join(root, 'assets/styles.css'), 'utf8');
  const base = css.match(/\.map-ov\{([^}]*)\}/);
  const shown = css.match(/\.map-ov\.show\{([^}]*)\}/);
  return base && shown &&
    /pointer-events\s*:\s*none/.test(base[1]) &&
    /pointer-events\s*:\s*auto/.test(shown[1]);
})());
chk('no other full-screen fixed layer can swallow clicks', (() => {
  const css = fs.readFileSync(path.join(root, 'assets/styles.css'), 'utf8');
  // every rule that pins itself over the viewport must either be click-through
  // or be the overlay, which is handled above
  return [...css.matchAll(/([^{}]+)\{([^}]*position\s*:\s*fixed[^}]*)\}/g)].every(m => {
    const sel = m[1].trim(), body = m[2];
    if (!/inset\s*:\s*0/.test(body)) return true;
    return /pointer-events\s*:\s*none/.test(body) || sel.includes('.map-ov');
  });
})());

rep.push('=== opens straight from the filesystem ===');
chk('no fetch / XHR / ES modules — needs no web server', (() => {
  const files = ['index.html', 'assets/app.js', 'assets/forms.js']
    .concat(fs.readdirSync(path.join(root, 'data')).map(f => 'data/' + f));
  return files.every(f => !/fetch\(|XMLHttpRequest|type="module"|\bimport\s+.*\bfrom\b/
    .test(fs.readFileSync(path.join(root, f), 'utf8')));
})());
chk('every asset path is relative, so file:// resolves it', (() => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  return [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(m => m[1])
    .every(u => u.startsWith('#') || u.startsWith('https://') || !/^(\/|[a-z]+:)/i.test(u));
})());
chk('storage is wrapped, so a SecurityError cannot kill the page', (() => {
  const js = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
  // every localStorage reference must sit inside a try block
  return [...js.matchAll(/localStorage\.\w+\(/g)].every(m => {
    const line = js.slice(js.lastIndexOf('\n', m.index), js.indexOf('\n', m.index));
    return /try\s*\{/.test(line);
  });
})());

rep.push('=== motion layer ===');
chk('reveal classes applied', doc.querySelectorAll('.reveal').length > 30,
  `got ${doc.querySelectorAll('.reveal').length}`);
chk('reveals fall back to visible without IntersectionObserver',
  doc.querySelectorAll('.reveal.in').length === doc.querySelectorAll('.reveal').length);
// anything the stylesheet hides must have a matching rule that shows it again,
// or content can end up permanently invisible with no error anywhere
chk('every opacity:0 rule has a paired rule that restores it', (() => {
  const css = fs.readFileSync(path.join(root, 'assets/styles.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');                       // strip comments first
  const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
    .map(m => ({ sel: m[1].trim(), body: m[2] }));
  // classes that some rule restores to a non-zero opacity
  const restored = new Set();
  rules.forEach(r => {
    if (/opacity\s*:\s*(?!0\s*[;}])[\d.]/.test(r.body))
      (r.sel.match(/\.[\w-]+/g) || []).forEach(c => restored.add(c));
  });
  const unpaired = rules.filter(r =>
    /opacity\s*:\s*0\s*[;}]/.test(r.body) &&
    !r.sel.startsWith('@') &&
    !(r.sel.match(/\.[\w-]+/g) || []).some(c => restored.has(c)));
  if (unpaired.length) console.log('  unpaired:', unpaired.map(u => u.sel).join(' | '));
  return unpaired.length === 0;
})());

rep.push('=== process lab ===');
chk('lab tabs = 7', n('#labTabs') === 7, `got ${n('#labTabs')}`);
chk('fluid bed shown first', $('#fbStage').hidden === false && $('#opStage').hidden === true);

rep.push('=== fluid bed ===');
chk('fb sliders = 9 (wurster)', n('#fbSliders') === 9, `got ${n('#fbSliders')}`);
chk('thermo readouts = 6', n('#fbThermo') === 6, `got ${n('#fbThermo')}`);
chk('hydro readouts = 7', n('#fbHydro') === 7, `got ${n('#fbHydro')}`);
chk('quality readouts = 8', n('#fbQuality') === 8, `got ${n('#fbQuality')}`);
chk('regime badge set', $('#fbRegime').textContent.length > 3, `"${$('#fbRegime').textContent}"`);
chk('alerts >= 1', n('#fbAlerts') >= 1, `got ${n('#fbAlerts')}`);
chk('scenarios = 4', n('#scenList') === 4, `got ${n('#scenList')}`);
chk('knobs = 8', n('#knobList') === 8, `got ${n('#knobList')}`);
chk('principles = 5', n('#principleList') === 5, `got ${n('#principleList')}`);

rep.push('=== transfer + method ===');
chk('validation stages = 8', n('#vlChain') === 8, `got ${n('#vlChain')}`);
chk('gap items = 7', n('#gapList') === 7, `got ${n('#gapList')}`);
chk('source links = 15', n('#mtSources') === 15, `got ${n('#mtSources')}`);
chk('curriculum = 10', n('#mtCurriculum') === 10, `got ${n('#mtCurriculum')}`);
chk('closing paragraphs = 3', n('#mtClosing') === 3, `got ${n('#mtClosing')}`);

const bad = txt => {
  const hits = [];
  ['undefined', '[object Object]', 'NaN', 'Infinity'].forEach(k => { if (txt.includes(k)) hits.push(k); });
  return hits;
};
rep.push('=== content hygiene (EN) ===');
let h = bad(doc.body.textContent);
chk('no undefined / [object Object] / NaN in rendered text', h.length === 0, h.join(','));

rep.push('=== language switch ===');
try {
  $('#langBtn').click();
  chk('body has zh class', doc.body.classList.contains('zh'));
  chk('zh: rows still 21', n('#molBody') === 21, `got ${n('#molBody')}`);
  chk('zh: hero is Chinese', /[一-鿿]/.test($('#heroBody').textContent));
  chk('zh: steps are Chinese', /[一-鿿]/.test($('#steps').textContent));
  chk('zh: knobs are Chinese', /[一-鿿]/.test($('#knobList').textContent));
  chk('zh: alerts are Chinese', /[一-鿿]/.test($('#fbAlerts').textContent));
  chk('zh: verdict is Chinese', /[一-鿿]/.test($('#clockVerdict').textContent));
  h = bad(doc.body.textContent);
  chk('zh: no undefined / NaN', h.length === 0, h.join(','));
  chk('zh: no stray English-only fallback in dossier', /[一-鿿]/.test($('#ddCqa').textContent));
  chk('zh: nothing left invisible after a re-render',
    doc.querySelectorAll('.reveal').every(n => n.classList.contains('in')),
    `${doc.querySelectorAll('.reveal').filter(n => !n.classList.contains('in')).length} stuck at opacity 0`);
  $('#langBtn').click();
  chk('switched back to EN', !doc.body.classList.contains('zh'));
} catch (e) { chk('language switch threw', false, e.message); }

rep.push('=== interactions ===');
try {
  $('#treeBody .opt').click();
  chk('tree advances', n('#treeTrail') === 1, `got ${n('#treeTrail')}`);
  $('#treeBody .opt').click();
  $('#treeBody .opt').click();
  chk('tree reaches a result', $('#treeBody').textContent.length > 300);
  $('#treeReset').click();
  chk('tree resets', n('#treeTrail') === 0);

  const before = $('#molBody tr:nth-child(1)').textContent;
  doc.querySelectorAll('#presets .chip')[1].click();
  chk('preset changes ranking', $('#molBody tr:nth-child(1)').textContent !== before,
    `top now: ${$('#molBody tr:nth-child(1)').textContent.slice(0, 24).trim()}`);
  doc.querySelectorAll('#presets .chip')[0].click();

  $('#molBody tr:nth-child(5)').click();
  chk('row selection updates detail', $('#molDetail').innerHTML.length > 800);

  rep.push('=== per-drug figures ===');
  const VIZ = vm.runInContext('DRUG_VIZ', sandbox);
  const INFO = vm.runInContext('FORM_INFO', sandbox);
  const MOLS = vm.runInContext('MOLECULES', sandbox);
  chk('every molecule has a figure defined', MOLS.every(m => !!VIZ[m.id]),
    MOLS.filter(m => !VIZ[m.id]).map(m => m.id).join(','));
  chk('every figure references a known form', Object.values(VIZ).every(v => !!INFO[v.form]),
    Object.values(VIZ).filter(v => !INFO[v.form]).map(v => v.form).join(','));
  chk('every form has bilingual copy', Object.values(INFO).every(f =>
    f.name.en && f.name.zh && f.made.en && f.made.zh && f.hard.en && f.hard.zh && f.ops.length));
  chk('only LINZESS claims verified appearance',
    Object.entries(VIZ).filter(([, v]) => v.verified).map(([k]) => k).join(',') === 'linaclotide');
  chk('no other figure carries an imprint',
    Object.entries(VIZ).every(([k, v]) => !v.imprint || k === 'linaclotide'));

  const formsSeen = new Set();
  let figFails = [];
  MOLS.forEach((m, i) => {
    const rows = doc.querySelectorAll('#molBody tr');
    // find this molecule's row by brand and click it
    const row = rows.find(r => r.textContent.includes(m.brand.split(' ')[0]));
    if (!row) { figFails.push(m.id + ':norow'); return; }
    row.click();
    const svg = $('#capsuleFig').innerHTML;
    if (!svg.includes('<svg') || svg.length < 400) figFails.push(m.id + ':nosvg');
    if (bad($('#capsuleParts').textContent).length) figFails.push(m.id + ':dirty');
    if (!$('#figWho').textContent.trim()) figFails.push(m.id + ':nolabel');
    formsSeen.add(VIZ[m.id].form);
  });
  chk('all 21 products render a figure cleanly', figFails.length === 0, figFails.join(' '));
  chk('at least 9 distinct dosage forms drawn', formsSeen.size >= 9, `got ${formsSeen.size}: ${[...formsSeen].join(',')}`);
  chk('every drawn form produces distinct SVG', (() => {
    const draw = vm.runInContext('drawDosageForm', sandbox);
    const seen = new Set();
    Object.keys(INFO).forEach(f => seen.add(draw(f, { sizeLabel: 'x' }).length));
    return seen.size >= Object.keys(INFO).length - 1;
  })());

  const bs = $('#batchSize'); bs.value = 120000; bs.dispatchEvent({ type: 'input', target: bs });
  chk('batch size recalculates', $('#batchOut').textContent.includes('120,000'), `"${$('#batchOut').textContent}"`);
  chk('formula scales', $('#formulaBody').textContent.includes('kg'));

  const t0 = $('#tsBody').textContent;
  doc.querySelectorAll('#tsChips .chip')[3].click();
  chk('troubleshooting switches', $('#tsBody').textContent !== t0);

  $('#scenList .btn').click();
  chk('scenario loads controls', n('#fbSliders') === 9);
  chk('scenario changes readouts', $('#fbThermo').textContent.length > 20);
  $('#fbReset').click();

  doc.querySelectorAll('#fbMode .chip')[1].click();
  chk('top-spray: sliders = 8', n('#fbSliders') === 8, `got ${n('#fbSliders')}`);
  chk('top-spray: hydro readouts = 4', n('#fbHydro') === 4, `got ${n('#fbHydro')}`);
  chk('top-spray: quality readouts = 5', n('#fbQuality') === 5, `got ${n('#fbQuality')}`);
  doc.querySelectorAll('#fbMode .chip')[0].click();
  chk('back to wurster', n('#fbSliders') === 9);

  const sl = doc.querySelectorAll('#fbSliders input')[3];
  sl.value = 70; sl.dispatchEvent({ type: 'input', target: sl });
  chk('moving a fluid-bed slider updates alerts', n('#fbAlerts') >= 1);

  rep.push('=== each unit operation ===');
  const tabs = doc.querySelectorAll('#labTabs .labtab');
  const expectCtl = { psd: 4, blend: 5, compress: 6, coating: 8, dissol: 8, homog: 5 };
  const ops = ['psd', 'blend', 'compress', 'coating', 'dissol', 'homog'];
  ops.forEach((id, idx) => {
    tabs[idx + 1].click();
    const ok = $('#opStage').hidden === false && $('#fbStage').hidden === true;
    chk(`${id}: stage swaps`, ok);
    // regression: panels hidden at boot never intersect, so their reveal never
    // fires and the whole tab would open blank
    chk(`${id}: revealed content is visible, not stuck at opacity 0`,
      doc.querySelectorAll('#opStage .reveal').every(n => n.classList.contains('in')),
      `${doc.querySelectorAll('#opStage .reveal').filter(n => !n.classList.contains('in')).length} stuck`);
    chk(`${id}: controls = ${expectCtl[id]}`, n('#opControls') === expectCtl[id], `got ${n('#opControls')}`);
    chk(`${id}: readouts rendered`, n('#opReadouts') >= 5, `got ${n('#opReadouts')}`);
    chk(`${id}: verdict has text`, $('#opVerdict').textContent.length > 80);
    chk(`${id}: help notes on every control`, doc.querySelectorAll('#opControls .ctrl-help').length === expectCtl[id]);
    const inputs = doc.querySelectorAll('#opControls input');
    if (inputs.length) {
      const a = $('#opReadouts').textContent;
      inputs[0].value = +inputs[0].getAttribute('max');
      inputs[0].dispatchEvent({ type: 'input', target: inputs[0] });
      chk(`${id}: readouts respond to a slider`, $('#opReadouts').textContent !== a);
      const b = $('#opVerdict').textContent;
      inputs[0].value = +inputs[0].getAttribute('min');
      inputs[0].dispatchEvent({ type: 'input', target: inputs[0] });
      chk(`${id}: verdict changes at the other extreme`, $('#opVerdict').textContent !== b);
    }
    $('#opReset').click();
    const hits = bad($('#opReadouts').textContent + $('#opVerdict').textContent);
    chk(`${id}: clean numbers`, hits.length === 0, hits.join(','));
  });
  tabs[0].click();
  chk('back to fluid bed', $('#fbStage').hidden === false);

  rep.push('=== disclosure + column toggle ===');
  const d0 = doc.querySelectorAll('[data-disc]')[0];
  d0.querySelector('.disc-btn').click();
  chk('disclosure opens', d0.classList.contains('open'));
  d0.querySelector('.disc-btn').click();
  chk('disclosure closes', !d0.classList.contains('open'));
  $('#colToggle').click();
  chk('column toggle expands to 9', n('#molHead') === 9, `got ${n('#molHead')}`);
  chk('rows still render wide', doc.querySelectorAll('#molBody tr:nth-child(1) td').length === 9);
  $('#colToggle').click();
  chk('column toggle collapses to 5', n('#molHead') === 5);
  h = bad(doc.body.textContent);
  chk('post-interaction: no undefined / NaN', h.length === 0, h.join(','));
} catch (e) { chk('interaction threw', false, e.stack.split('\n').slice(0, 3).join(' | ')); }

console.log(rep.join('\n'));
console.log(`\n--- runtime errors (${errs.length}) ---`);
errs.forEach(e => console.log(e));
console.log(`\n${fails === 0 && errs.length === 0 ? 'ALL CHECKS PASSED' : fails + ' FAILURES'}`);
process.exit(fails || errs.length ? 1 : 0);
