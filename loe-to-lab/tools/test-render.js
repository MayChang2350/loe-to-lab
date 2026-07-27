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
vm.createContext(sandbox);

const errs = [];
const files = ['data/i18n.js', 'data/molecules.js', 'data/pathway.js', 'data/deepdive.js', 'data/protocol.js', 'data/fluidbed.js', 'assets/app.js'];
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
  h = bad(doc.body.textContent);
  chk('post-interaction: no undefined / NaN', h.length === 0, h.join(','));
} catch (e) { chk('interaction threw', false, e.stack.split('\n').slice(0, 3).join(' | ')); }

console.log(rep.join('\n'));
console.log(`\n--- runtime errors (${errs.length}) ---`);
errs.forEach(e => console.log(e));
console.log(`\n${fails === 0 && errs.length === 0 ? 'ALL CHECKS PASSED' : fails + ' FAILURES'}`);
process.exit(fails || errs.length ? 1 : 0);
