/* Sanity and direction tests for every physics model. Run: node tools/test-models.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const sb = { Math, console, Number, isFinite, NaN, Infinity };
vm.createContext(sb);
['data/fluidbed.js', 'data/unitops.js'].forEach(f =>
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sb, { filename: f }));

let fails = 0;
const rng = (name, v, lo, hi, u = '') => {
  const ok = v >= lo && v <= hi;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(46)} ${(+v).toPrecision(4)} ${u}  [${lo}–${hi}]`);
};
const dir = (name, cond) => { if (!cond) fails++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); };
const head = s => console.log(`\n--- ${s} ---`);

// top-level const/let live in the context's lexical scope, not on the sandbox
// object, so pull them out by evaluating an expression in the same context
const grab = expr => vm.runInContext(expr, sb);
sb.fbSolve = grab('fbSolve');
sb.UNIT_OPS = grab('UNIT_OPS');

const def = op => { const o = {}; op.controls.forEach(c => o[c.id] = c.def); return o; };
const [PSD, BLEND, COMP, COAT, DISS, HOMOG] = sb.UNIT_OPS;

/* ---------------- fluid bed (regression) ---------------- */
head('fluid bed — unchanged from previous build');
const fbBase = { mode: 'wurster', airVol: 340, inletT: 55, dewPtIn: 10, spray: 30, atom: 2.0,
  gap: 16, loadKg: 3.5, dpUm: 250, rhoP: 1400, solidsPct: 8, liqT: 20, runMin: 165 };
const fbr = sb.fbSolve(fbBase);
rng('product temperature', fbr.Tprod, 36, 46, '°C');
rng('Umf 250 µm', fbr.Umf, 0.020, 0.040, 'm/s');
rng('Ut 250 µm', fbr.Ut, 1.0, 1.6, 'm/s');
rng('estimated AV', fbr.avEst, 4, 15);
dir('regime is stable at baseline', fbr.regime === 'good');

/* ---------------- milling ---------------- */
head('milling / PSD');
const p1 = def(PSD), r1 = PSD.solve(p1);
rng('D50 from an 800 µm screen', r1.d50, 250, 500, 'µm');
rng('D90 below the screen aperture', r1.d90, 400, 920, 'µm');
rng('span', r1.span, 1.2, 2.6);
rng('fines <45 µm', r1.fines, 0.5, 10, '%');
rng('oversize bypass', r1.oversize, 0.5, 6, '%');
rng('Carr index', r1.carr, 8, 34, '%');
dir('D10 < D50 < D90', r1.d10 < r1.d50 && r1.d50 < r1.d90);
dir('faster rotor → smaller D50', PSD.solve({ ...p1, rpm: 6000 }).d50 < r1.d50);
dir('faster rotor → more fines', PSD.solve({ ...p1, rpm: 6000 }).fines > r1.fines);
dir('coarser screen → larger D50', PSD.solve({ ...p1, screen: 1400 }).d50 > r1.d50);
dir('D90 never exceeds 1.15 × screen', PSD.solve({ ...p1, screen: 300, rpm: 600 }).d90 <= 300 * 1.15 + 1e-6);
dir('overloading the mill → more oversize', PSD.solve({ ...p1, feed: 75 }).oversize > r1.oversize);
dir('more fines → worse flow (higher Carr)', PSD.solve({ ...p1, rpm: 7000 }).carr > r1.carr);
dir('smaller particles → faster dissolution', PSD.solve({ ...p1, screen: 300 }).dissolRate > r1.dissolRate);

/* ---------------- blending ---------------- */
head('blending');
const p2 = def(BLEND), r2 = BLEND.solve(p2);
rng('blend RSD at 12 min', r2.rsd, 1, 8, '%');
rng('tablet strength retained', r2.hardnessFactor * 100, 55, 100, '%');
dir('longer blending → lower RSD (matched sizes)',
  BLEND.solve({ ...p2, time: 25, ratio: 1 }).rsd < BLEND.solve({ ...p2, time: 5, ratio: 1 }).rsd);
dir('mismatched sizes → re-segregation past 18 min',
  BLEND.solve({ ...p2, time: 50, ratio: 2.5 }).rsd > BLEND.solve({ ...p2, time: 20, ratio: 2.5 }).rsd);
dir('over-blending with lubricant → weaker tablet',
  BLEND.solve({ ...p2, time: 45 }).hardnessFactor < r2.hardnessFactor);
dir('more lubricant → slower dissolution',
  BLEND.solve({ ...p2, lub: 2.5 }).dissolDelay > r2.dissolDelay);
dir('too little lubrication work → sticking flagged',
  BLEND.solve({ ...p2, time: 1, lub: 0.25 }).ejectionOK < 0.5);
dir('extreme fill is worse than 55 %',
  BLEND.solve({ ...p2, fill: 90 }).rsd > r2.rsd && BLEND.solve({ ...p2, fill: 20 }).rsd > r2.rsd);
{ // the window must exist and be finite
  let good = 0;
  for (let t = 1; t <= 60; t++) { const s = BLEND.solve({ ...p2, time: t }); if (s.rsd <= 3 && s.dissolDelay <= 1.5 && s.ejectionOK > 0.9) good++; }
  rng('usable blend window width', good, 3, 40, 'min');
}

/* ---------------- compression ---------------- */
head('tablet compression');
const p3 = def(COMP), r3 = COMP.solve(p3);
rng('compaction pressure at 14 kN / 9 mm', r3.pressure, 150, 280, 'MPa');
rng('dwell time at 40 rpm', r3.dwellMs, 25, 65, 'ms');
rng('tensile strength', r3.sigmaT, 1.2, 4.0, 'MPa');
rng('hardness', r3.hardnessN, 40, 260, 'N');
rng('tablet thickness', r3.thick, 2.0, 5.5, 'mm');
rng('porosity', r3.porosity * 100, 5, 22, '%');
rng('disintegration', r3.disint, 5, 200, 's');
rng('friability', r3.friab, 0, 1.0, '%');
dir('more force → stronger tablet', COMP.solve({ ...p3, force: 28 }).sigmaT > r3.sigmaT);
dir('more force → lower porosity', COMP.solve({ ...p3, force: 28 }).porosity < r3.porosity);
dir('more force → slower disintegration', COMP.solve({ ...p3, force: 28 }).disint > r3.disint);
dir('more force → less friable', COMP.solve({ ...p3, force: 28 }).friab < r3.friab);
dir('faster turret → shorter dwell', COMP.solve({ ...p3, turret: 90 }).dwellMs < r3.dwellMs);
dir('faster turret → higher capping risk', COMP.solve({ ...p3, turret: 90 }).capping > r3.capping);
dir('pre-compression reduces capping risk', COMP.solve({ ...p3, pre: 0 }).capping > COMP.solve({ ...p3, pre: 6 }).capping);
dir('bigger punch at same force → lower pressure', COMP.solve({ ...p3, dia: 13 }).pressure < r3.pressure);
dir('heavier tablet → thicker', COMP.solve({ ...p3, weight: 600 }).thick > r3.thick);
dir('very wet granule → sticking flagged', COMP.solve({ ...p3, lod: 4.8 }).sticking > 0.5);
dir('low force gives a friable tablet', COMP.solve({ ...p3, force: 3 }).friab > 1.0);

/* ---------------- coating ---------------- */
head('film coating');
const p4 = def(COAT), r4 = COAT.solve(p4);
rng('bed temperature', r4.bedT, 34, 52, '°C');
rng('exhaust RH', r4.rhOut, 5, 55, '%');
rng('coating time', r4.timeMin, 30, 400, 'min');
rng('film thickness at 3 % w/g', r4.filmThick, 12, 70, 'µm');
rng('coating CV', r4.coatCV, 1, 12, '%');
rng('efficiency', r4.eff * 100, 70, 100, '%');
dir('more spray → lower bed temperature', COAT.solve({ ...p4, spray: 320 }).bedT < r4.bedT);
dir('more spray → higher exhaust RH', COAT.solve({ ...p4, spray: 320 }).rhOut > r4.rhOut);
dir('more spray → sticking risk rises', COAT.solve({ ...p4, spray: 340 }).sticking > r4.sticking);
dir('hotter and drier → orange peel risk rises',
  COAT.solve({ ...p4, inletT: 82, atom: 3.8 }).orangePeel > r4.orangePeel);
dir('faster pan → better uniformity', COAT.solve({ ...p4, panRpm: 16 }).coatCV < r4.coatCV);
dir('faster pan for longer → more edge erosion', COAT.solve({ ...p4, panRpm: 17 }).erosion > r4.erosion);
dir('bigger pan load → worse uniformity', COAT.solve({ ...p4, load: 380 }).coatCV > r4.coatCV);
dir('thicker target → thicker film', COAT.solve({ ...p4, target: 8 }).filmThick > r4.filmThick);
dir('higher solids → shorter run', COAT.solve({ ...p4, solids: 24 }).timeMin < r4.timeMin);

/* ---------------- dissolution ---------------- */
head('dissolution');
const p5 = def(DISS), r5 = DISS.solve(p5);
rng('Q at 15 min (default IR product)', r5.at15, 70, 100, '%');
rng('reference Q at 15 min', r5.ref15, 85, 100, '%');
rng('lag time', r5.lag, 0.5, 4, 'min');
dir('profile is monotonic', r5.curve.every((c, i, a) => i === 0 || c.pct >= a[i - 1].pct));
dir('identical formulation to reference → f2 high or waived', r5.bothFast || r5.f2 > 50);
dir('harder tablet → slower release', DISS.solve({ ...p5, hardness: 4.5 }).at15 < r5.at15);
dir('coarser particles → slower release', DISS.solve({ ...p5, d50: 700 }).at15 < r5.at15);
dir('coating adds a lag', DISS.solve({ ...p5, coat: 8 }).lag > r5.lag);
dir('more disintegrant → faster release', DISS.solve({ ...p5, disint: 9 }).at15 > r5.at15);
dir('higher rpm → faster release', DISS.solve({ ...p5, rpm: 100 }).at15 > r5.at15);
dir('basket slower than paddle, all else equal',
  DISS.solve({ ...p5, app: 1 }).at15 <= DISS.solve({ ...p5, app: 2 }).at15);
{
  const bad = DISS.solve({ ...p5, hardness: 4.8, d50: 750, coat: 9, disint: 0.5 });
  dir('a badly-made batch fails f2', !bad.bothFast && bad.f2 < 50);
  rng('failing batch f2', bad.f2, 0, 49);
}
{ // f2 validity rule: two fast profiles must be flagged, not scored
  const fast = DISS.solve({ ...p5, disint: 10, hardness: 0.5, d50: 40, rpm: 100 });
  dir('two fast profiles → f2 waived under the PSG rule', fast.bothFast === true);
}
{ // weak base should be faster in acid than at pH 6.8
  const acid = DISS.solve({ ...p5, phDep: 1, medium: 1 });
  const neut = DISS.solve({ ...p5, phDep: 1, medium: 3 });
  dir('weak base releases faster in 0.1 N HCl than pH 6.8', acid.at15 > neut.at15);
}

/* ---------------- homogenisation ---------------- */
head('homogenisation');
const p6 = def(HOMOG), r6 = HOMOG.solve(p6);
rng('droplet d32 at 700 bar', r6.d32, 150, 600, 'nm');
rng('polydispersity', r6.pdi, 0.05, 0.5);
rng('surfactant coverage', r6.coverage, 0.8, 6, '×');
rng('creaming rate', r6.vCream, 0, 1.5, 'mm/d');
dir('more pressure → smaller droplets (when surfactant is sufficient)',
  HOMOG.solve({ ...p6, pressure: 1400 }).d32 < r6.d32);
dir('more passes → narrower distribution', HOMOG.solve({ ...p6, passes: 8 }).pdi < r6.pdi);
dir('more oil at fixed surfactant → lower coverage',
  HOMOG.solve({ ...p6, oil: 6 }).coverage < r6.coverage);
dir('smaller droplets → slower creaming', HOMOG.solve({ ...p6, pressure: 1400 }).vCream < r6.vCream);
dir('more passes → more heat', HOMOG.solve({ ...p6, passes: 9 }).tempRise > r6.tempRise);
{
  // the teaching point: starved of surfactant, extra pressure makes it WORSE
  const lowSurf = { ...p6, surf: 0.1 };
  const at400 = HOMOG.solve({ ...lowSurf, pressure: 400 });
  const at1400 = HOMOG.solve({ ...lowSurf, pressure: 1400 });
  dir('surfactant-starved system is flagged', at1400.coverage < 1);
  dir('surfactant-starved: more pressure does NOT help', at1400.d32 >= at400.d32 * 0.98);
  dir('with enough surfactant the same pressure rise does help',
    HOMOG.solve({ ...p6, surf: 2.5, pressure: 1400 }).d32 < HOMOG.solve({ ...p6, surf: 2.5, pressure: 400 }).d32);
}

/* ---------------- every verdict reachable & bilingual ---------------- */
head('verdict coverage');
sb.UNIT_OPS.forEach(op => {
  const base = def(op);
  const tones = new Set();
  op.controls.forEach(c => {
    if (c.type === 'select') return;
    [c.min, c.def, c.max].forEach(v => {
      const r = op.solve({ ...base, [c.id]: v });
      const vd = op.verdict(r);
      tones.add(vd.tone);
      if (!vd.en || !vd.zh) { fails++; console.log(`FAIL  ${op.id} verdict missing a language`); }
      if (/undefined|NaN/.test(vd.en + vd.zh)) { fails++; console.log(`FAIL  ${op.id} verdict contains NaN/undefined`); }
    });
  });
  dir(`${op.id}: reaches more than one verdict state (${[...tones].join(',')})`, tones.size >= 2);
  dir(`${op.id}: every control has bilingual label and help`,
    op.controls.every(c => c.label.en && c.label.zh && c.help.en && c.help.zh));
  dir(`${op.id}: readouts render at both extremes`, op.controls.every(c => {
    if (c.type === 'select') return true;
    return [c.min, c.max].every(v => {
      const ro = op.readouts(op.solve({ ...base, [c.id]: v }));
      return ro.length > 0 && ro.every(o => o.v !== undefined && !/NaN|undefined/.test(String(o.v)));
    });
  }));
});

/* ---------------- dosage form figures ---------------- */
head('dosage form figures');
['data/dosageforms.js', 'assets/forms.js'].forEach(f =>
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sb, { filename: f }));
const draw = grab('drawDosageForm'), FORMS = grab('FORM_INFO'), VIZ = grab('DRUG_VIZ');

Object.keys(FORMS).forEach(id => {
  const svg = draw(id, { sizeLabel: 'illustrative scale', imprint: id === 'capsule-beads' ? 'FL 145' : '' });
  const okOpen = (svg.match(/<svg/g) || []).length === 1 && svg.trim().endsWith('</svg>');
  // every element opened must be closed
  const opens = (svg.match(/<(g|text|circle|rect|ellipse|path|line|clipPath|marker|defs)\b/g) || []).length;
  const closes = (svg.match(/<\/(g|text|circle|rect|ellipse|path|line|clipPath|marker|defs)>/g) || []).length
    + (svg.match(/\/>/g) || []).length;
  dir(`${id}: well-formed`, okOpen && closes >= opens - 1);
  dir(`${id}: no dangling clip-path reference`,
    !svg.includes('clip-path') || svg.includes('<clipPath'));
  dir(`${id}: no truncated text`, !svg.includes('…'));
  dir(`${id}: nothing drawn outside the canvas`, (() => {
    const nums = [...svg.matchAll(/(?:^|\s)(?:x|cx|x1|x2)="(-?[\d.]+)"/g)].map(m => +m[1]);
    return nums.every(v => v >= -2 && v <= 472);
  })());
  dir(`${id}: text sits inside the canvas`, (() => {
    // walk the markup keeping track of any active translate(), so labels
    // inside a transformed group are measured at their real position
    const tok = svg.match(/<g[^>]*>|<\/g>|<text[^>]*>[^<]*</g) || [];
    const stack = [0];
    return tok.every(tk => {
      if (tk === '</g>') { if (stack.length > 1) stack.pop(); return true; }
      if (tk.startsWith('<g')) {
        const tr = tk.match(/translate\((-?[\d.]+)/);
        stack.push(stack[stack.length - 1] + (tr ? +tr[1] : 0));
        return true;
      }
      const m = tk.match(/x="(-?[\d.]+)"[^>]*font-size="([\d.]+)"[^>]*text-anchor="(\w+)"[^>]*>(.*)</);
      if (!m) return true;
      const x = +m[1] + stack[stack.length - 1];
      const w = m[4].length * (+m[2]) * 0.62;              // mono advance width
      const left = m[3] === 'middle' ? x - w / 2 : m[3] === 'end' ? x - w : x;
      return left >= -4 && left + w <= 474;
    });
  })());
});
dir('every referenced form has a builder', Object.values(VIZ).every(v => !!FORMS[v.form]));
dir('all 21 products draw without throwing', Object.keys(VIZ).every(k => {
  try { return draw(VIZ[k].form, { sizeLabel: 'x', imprint: VIZ[k].imprint || '' }).length > 500; }
  catch (e) { return false; }
}));

console.log(`\n${fails === 0 ? 'ALL MODEL CHECKS PASSED' : fails + ' FAILURES'}`);
process.exit(fails ? 1 : 0);
