/* ============================================================================
   forms.js — dosage-form drawings
   ----------------------------------------------------------------------------
   Each builder returns an SVG string on a 470 x 300 canvas.

   APPEARANCE HONESTY: only LINZESS carries verified colour and imprint, taken
   from its FDA-approved label. Every other figure draws the correct dosage
   form — structure, architecture and relative scale — in neutral colours with
   no invented imprint.

   LAYOUT CONTRACT, so nothing collides:
     zone A  y  26 – 138   the product itself
     zone B  y 148 – 172   scale bar, left-aligned under the product
     zone C  y 150 – 250   detail / magnifier, kept to x > 250 where the scale
                           bar occupies the left
     zone D  y 264 – 292   note lines, centred at x = 235
   Note lines are capped at 60 characters: mono at 11px is ~6.6px per character,
   so 60 characters centred at 235 spans 37–433 and stays inside the canvas.
   ========================================================================== */

const FSVG = {};

const F_DEFS = `
<defs>
  <linearGradient id="shellG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f4f6f8"/><stop offset="0.45" stop-color="#e2e7ec"/><stop offset="1" stop-color="#b9c2cb"/>
  </linearGradient>
  <linearGradient id="tabG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#eef2f5"/><stop offset="0.5" stop-color="#d5dce3"/><stop offset="1" stop-color="#aab4bf"/>
  </linearGradient>
  <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="rgba(180,200,210,.30)"/><stop offset="0.35" stop-color="rgba(230,244,248,.14)"/>
    <stop offset="1" stop-color="rgba(150,172,186,.30)"/>
  </linearGradient>
  <linearGradient id="liqG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3ea6a8"/><stop offset="1" stop-color="#1d7f88"/>
  </linearGradient>
  <radialGradient id="filmG" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#7fe3dd"/><stop offset="1" stop-color="#2fc2c8"/>
  </radialGradient>
  <linearGradient id="oilG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8fe0da"/><stop offset="1" stop-color="#2fc2c8"/>
  </linearGradient>
  <marker id="ah" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M 0 0 L 8 4 L 0 8 z" fill="#4a8fd6"/>
  </marker>
</defs>`;

const wrap = (inner, label) =>
  `<svg viewBox="0 0 470 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${F_DEFS}${inner}</svg>`;

function seeded(seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; }

const LBL = (x, y, txt, col = '#77828d', size = 10, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-family="IBM Plex Mono, monospace" font-size="${size}" fill="${col}" text-anchor="${anchor}">${txt}</text>`;
const CALL = (x1, y1, x2, y2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2fc2c8" stroke-width="1" stroke-dasharray="3 3"/>`;

/* zone B — scale bar, left-aligned so zone C stays clear on the right */
const SCALE = (x1, x2, txt, y = 152) =>
  `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#3a444e" stroke-width="1"/>
   <line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}" stroke="#3a444e" stroke-width="1"/>
   <line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}" stroke="#3a444e" stroke-width="1"/>
   ${LBL((x1 + x2) / 2, y + 16, txt, '#6a7683', 9.5)}`;

/* zone D — note lines. Text is trimmed to the contract length. */
const NOTE = (lines, col = '#97a3b0', y0 = 268) =>
  lines.map((l, i) => LBL(235, y0 + i * 17, l.length > 60 ? l.slice(0, 59) + '…' : l, col, 11)).join('');

/* ---------- 1. hard capsule with drug-layered beads (LINZESS) ----------- */
FSVG['capsule-beads'] = (o) => {
  const rnd = seeded(7); const beads = [];
  for (let i = 0; i < 170; i++) {
    const bx = 236 + rnd() * 176, by = 34 + rnd() * 62;
    const dx = (bx - 324) / 88, dy = (by - 65) / 31;
    if (dx * dx + dy * dy > 0.93) continue;
    beads.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(3.0 + rnd() * 1.5).toFixed(1)}" fill="#cfd6dd" stroke="#2fc2c8" stroke-width="0.9" opacity="${(0.7 + rnd() * 0.3).toFixed(2)}"/>`);
  }
  return wrap(`
  <rect x="54" y="32" width="200" height="68" rx="34" fill="url(#shellG)"/>
  <rect x="222" y="32" width="194" height="68" rx="34" fill="url(#shellG)"/>
  <rect x="222" y="32" width="10" height="68" fill="#a7b2bc" opacity="0.55"/>
  <rect x="66" y="42" width="176" height="13" rx="7" fill="#fff" opacity="0.5"/>
  <rect x="238" y="42" width="166" height="13" rx="7" fill="#fff" opacity="0.5"/>
  ${o.imprint ? `<text x="140" y="74" font-family="IBM Plex Mono, monospace" font-size="21" fill="#6d7883" letter-spacing="2" text-anchor="middle">${o.imprint}</text>` : ''}
  <rect x="236" y="32" width="180" height="68" rx="34" fill="#0f1319"/><g>${beads.join('')}</g>
  <rect x="236" y="32" width="180" height="68" rx="34" fill="none" stroke="#2fc2c8" stroke-width="1.4" stroke-dasharray="5 4"/>
  ${SCALE(54, 216, o.sizeLabel)}
  ${CALL(316, 100, 320, 156)}${CALL(392, 100, 388, 156)}
  <circle cx="354" cy="204" r="48" fill="url(#filmG)"/>
  <circle cx="354" cy="204" r="41" fill="#cfd6dd"/>
  ${LBL(354, 202, 'inert core', '#5a6570', 10)}${LBL(354, 216, '150–300 µm', '#77828d', 9.5)}
  ${LBL(288, 186, 'peptide film', '#2fc2c8', 10, 'end')}
  ${LBL(288, 199, '0.22 % w/w', '#2fc2c8', 10, 'end')}
  <line x1="292" y1="192" x2="308" y2="192" stroke="#2fc2c8" stroke-width="1"/>
  ${NOTE(['145 micrograms of peptide, spread over thousands of beads.'])}`,
    'capsule with drug-layered beads');
};

/* ---------- 2. plain hard capsule --------------------------------------- */
FSVG['capsule'] = (o) => {
  const rnd = seeded(19); const grains = [];
  for (let i = 0; i < 250; i++) {
    const bx = 240 + rnd() * 168, by = 38 + rnd() * 54;
    const dx = (bx - 324) / 84, dy = (by - 65) / 27;
    if (dx * dx + dy * dy > 0.92) continue;
    grains.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(1.1 + rnd() * 1.4).toFixed(1)}" fill="#9aa5b0" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`);
  }
  const rnd2 = seeded(31); const zoom = [];
  for (let i = 0; i < 170; i++)
    zoom.push(`<circle cx="${(268 + rnd2() * 168).toFixed(1)}" cy="${(166 + rnd2() * 70).toFixed(1)}" r="${(1.6 + rnd2() * 3).toFixed(1)}" fill="#aab4bf" opacity="${(0.35 + rnd2() * 0.6).toFixed(2)}"/>`);
  return wrap(`
  <rect x="54" y="32" width="200" height="68" rx="34" fill="url(#shellG)"/>
  <rect x="222" y="32" width="194" height="68" rx="34" fill="url(#shellG)"/>
  <rect x="222" y="32" width="10" height="68" fill="#a7b2bc" opacity="0.55"/>
  <rect x="66" y="42" width="176" height="13" rx="7" fill="#fff" opacity="0.5"/>
  <rect x="236" y="32" width="180" height="68" rx="34" fill="#141a20"/><g>${grains.join('')}</g>
  <rect x="236" y="32" width="180" height="68" rx="34" fill="none" stroke="#2fc2c8" stroke-width="1.4" stroke-dasharray="5 4"/>
  ${SCALE(54, 216, o.sizeLabel)}
  ${CALL(330, 100, 340, 158)}
  <rect x="264" y="162" width="176" height="78" rx="6" fill="#0f1319" stroke="#2b333c"/>
  ${zoom.join('')}
  ${LBL(352, 254, 'blended powder', '#2fc2c8', 10)}
  ${NOTE(['Filled by volume, not by weight — so bulk density is the',
          'thing that has to stay constant, not the powder itself.'])}`,
    'hard capsule with powder fill');
};

/* ---------- 3. delayed-release capsule, two pellet populations ---------- */
FSVG['capsule-dr'] = (o) => {
  const rnd = seeded(11); const pellets = [];
  for (let i = 0; i < 150; i++) {
    const bx = 236 + rnd() * 176, by = 34 + rnd() * 62;
    const dx = (bx - 324) / 88, dy = (by - 65) / 31;
    if (dx * dx + dy * dy > 0.93) continue;
    const thick = rnd() > 0.5;
    pellets.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(3.4 + rnd() * 1.2).toFixed(1)}" fill="#cfd6dd" stroke="${thick ? '#2fc2c8' : '#4a8fd6'}" stroke-width="${thick ? 2.1 : 1.0}"/>`);
  }
  return wrap(`
  <rect x="54" y="32" width="200" height="68" rx="34" fill="url(#shellG)"/>
  <rect x="222" y="32" width="194" height="68" rx="34" fill="url(#shellG)"/>
  <rect x="222" y="32" width="10" height="68" fill="#a7b2bc" opacity="0.55"/>
  <rect x="236" y="32" width="180" height="68" rx="34" fill="#0f1319"/><g>${pellets.join('')}</g>
  <rect x="236" y="32" width="180" height="68" rx="34" fill="none" stroke="#2fc2c8" stroke-width="1.4" stroke-dasharray="5 4"/>
  ${SCALE(54, 216, o.sizeLabel)}
  ${CALL(300, 100, 300, 152)}${CALL(370, 100, 392, 152)}
  <circle cx="300" cy="196" r="36" fill="#cfd6dd" stroke="#4a8fd6" stroke-width="3"/>
  ${LBL(300, 244, 'thin coat', '#4a8fd6', 10)}${LBL(300, 256, 'releases first', '#4a8fd6', 9.5)}
  <circle cx="398" cy="196" r="36" fill="#cfd6dd" stroke="#2fc2c8" stroke-width="8"/>
  ${LBL(398, 244, 'thick coat', '#2fc2c8', 10)}${LBL(398, 256, 'releases later', '#2fc2c8', 9.5)}
  ${LBL(120, 196, 'One capsule,', '#97a3b0', 11)}${LBL(120, 212, 'two release pulses', '#97a3b0', 11)}
  ${LBL(120, 236, 'hours apart', '#6a7683', 10)}`,
    'delayed-release capsule with coated pellets');
};

/* ---------- 4. film-coated tablet --------------------------------------- */
FSVG['tablet-fc'] = (o) => {
  const big = o.sizeNote === 'large';
  const rw = big ? 74 : 54, rh = big ? 30 : 28;
  return wrap(`
  <ellipse cx="112" cy="72" rx="${rw}" ry="${rh}" fill="url(#tabG)" stroke="#9aa5b0"/>
  <ellipse cx="112" cy="72" rx="${rw - 5}" ry="${rh - 5}" fill="none" stroke="#fff" opacity="0.28"/>
  <line x1="${112 - rw * 0.66}" y1="72" x2="${112 + rw * 0.66}" y2="72" stroke="#8e99a4" stroke-width="1.6"/>
  ${LBL(112, 122, 'top view · score line', '#6a7683', 9.5)}
  <path d="M ${330 - rw * 1.5} 72 Q ${330 - rw * 1.5} 44 ${330} 44 Q ${330 + rw * 1.5} 44 ${330 + rw * 1.5} 72 Q ${330 + rw * 1.5} 100 ${330} 100 Q ${330 - rw * 1.5} 100 ${330 - rw * 1.5} 72 Z" fill="url(#tabG)" stroke="#2fc2c8" stroke-width="3"/>
  ${LBL(330, 122, 'side view · core inside a film', '#6a7683', 9.5)}
  ${SCALE(112 - rw, 112 + rw, o.sizeLabel)}
  ${CALL(330, 128, 330, 160)}
  <rect x="252" y="166" width="184" height="52" rx="3" fill="#cfd6dd"/>
  <rect x="252" y="158" width="184" height="8" fill="#2fc2c8"/>
  <rect x="252" y="218" width="184" height="8" fill="#2fc2c8"/>
  ${LBL(344, 196, 'compressed core', '#5a6570', 10)}
  ${LBL(246, 164, 'film', '#2fc2c8', 10, 'end')}
  ${NOTE(['The film is 20–60 µm — about one hundredth of the tablet.',
          'The rest is powder, squeezed hard enough to hold together.'])}`,
    'film-coated tablet');
};

/* ---------- 5. osmotic extended-release tablet -------------------------- */
FSVG['tablet-er-osmotic'] = (o) => wrap(`
  <ellipse cx="106" cy="72" rx="50" ry="46" fill="url(#tabG)" stroke="#9aa5b0"/>
  <circle cx="106" cy="72" r="4.5" fill="#0b0d10"/>
  <circle cx="106" cy="72" r="9" fill="none" stroke="#2fc2c8" stroke-width="1.2"/>
  ${CALL(115, 66, 168, 40)}
  ${LBL(172, 38, 'laser-drilled orifice', '#2fc2c8', 10, 'start')}
  ${LBL(106, 130, 'top view', '#6a7683', 9.5)}
  ${SCALE(56, 156, o.sizeLabel)}

  <g transform="translate(324,86)">
    <ellipse cx="0" cy="0" rx="82" ry="50" fill="#cfd6dd" stroke="#9aa5b0"/>
    <path d="M -82 0 A 82 50 0 0 1 82 0 Z" fill="#b9c2cb"/>
    <ellipse cx="0" cy="0" rx="82" ry="50" fill="none" stroke="#2fc2c8" stroke-width="4"/>
    <circle cx="0" cy="-50" r="4" fill="#0b0d10"/>
    ${LBL(0, -18, 'drug layer', '#4a5560', 10)}
    ${LBL(0, 28, 'push layer', '#4a5560', 10)}
  </g>
  <line x1="324" y1="30" x2="324" y2="16" stroke="#4a8fd6" stroke-width="2" marker-end="url(#ah)"/>
  ${LBL(324, 12, 'drug pushed out at a constant rate', '#4a8fd6', 9.5)}
  <path d="M 232 118 L 250 108" stroke="#5fc08a" stroke-width="1.6"/>
  <path d="M 416 118 L 398 108" stroke="#5fc08a" stroke-width="1.6"/>
  ${LBL(324, 156, 'water enters through the membrane', '#5fc08a', 9.5)}
  ${NOTE(['Release rate is set by membrane permeability and orifice',
          'size — not by how fast the tablet itself dissolves.'], '#97a3b0', 214)}
  ${LBL(235, 262, 'Laser drilling is capital most sites do not have.', '#2fc2c8', 11)}`,
  'osmotic extended release tablet');

/* ---------- 6. matrix extended-release tablet --------------------------- */
FSVG['tablet-er-matrix'] = (o) => {
  const rnd = seeded(23); const drug = [];
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
    drug.push(`<circle cx="${(324 + Math.cos(a) * rr * 70).toFixed(1)}" cy="${(84 + Math.sin(a) * rr * 40).toFixed(1)}" r="2.6" fill="#2fc2c8" opacity="0.85"/>`);
  }
  return wrap(`
  <ellipse cx="106" cy="76" rx="54" ry="46" fill="url(#tabG)" stroke="#9aa5b0"/>
  ${LBL(106, 134, 'top view', '#6a7683', 9.5)}
  ${SCALE(52, 160, o.sizeLabel)}
  <ellipse cx="324" cy="84" rx="82" ry="50" fill="#aab4bf" opacity="0.35"/>
  <ellipse cx="324" cy="84" rx="74" ry="44" fill="#cfd6dd"/>
  ${drug.join('')}
  <ellipse cx="324" cy="84" rx="82" ry="50" fill="none" stroke="#4a8fd6" stroke-width="7" opacity="0.45"/>
  ${CALL(400, 62, 434, 36)}
  ${LBL(438, 34, 'gel layer', '#4a8fd6', 10, 'end')}
  ${LBL(324, 152, 'polymer matrix + dispersed drug', '#5a6570', 9.5)}
  ${NOTE(['Water swells the outside into a gel. Drug has to diffuse out',
          'through it, so release slows as the gel thickens.'], '#97a3b0', 200)}
  ${LBL(235, 248, 'No coating, no drilling — the polymer grade is the design.', '#2fc2c8', 11)}`,
    'matrix extended release tablet');
};

/* ---------- 7. soft gelatin capsule ------------------------------------- */
FSVG['softgel'] = (o) => wrap(`
  <ellipse cx="196" cy="76" rx="120" ry="46" fill="url(#shellG)" stroke="#9aa5b0"/>
  <ellipse cx="196" cy="76" rx="110" ry="37" fill="url(#oilG)" opacity="0.55"/>
  <ellipse cx="158" cy="60" rx="42" ry="12" fill="#fff" opacity="0.35"/>
  <path d="M 76 76 L 62 76 M 316 76 L 330 76" stroke="#9aa5b0" stroke-width="2"/>
  ${LBL(196, 80, 'drug dissolved in oil', '#0b3238', 11)}
  ${SCALE(76, 216, o.sizeLabel)}
  ${CALL(300, 112, 330, 168)}
  <rect x="196" y="172" width="220" height="11" fill="#d3dae1"/>
  <rect x="196" y="214" width="220" height="11" fill="#d3dae1"/>
  <ellipse cx="306" cy="199" rx="50" ry="15" fill="url(#oilG)" opacity="0.6"/>
  <ellipse cx="306" cy="199" rx="50" ry="15" fill="none" stroke="#9aa5b0"/>
  ${LBL(190, 180, 'gelatin', '#6a7683', 10, 'end')}
  ${LBL(190, 193, 'ribbon', '#6a7683', 10, 'end')}
  ${LBL(306, 246, 'sealed and cut in one motion', '#2fc2c8', 10)}
  ${NOTE(['Two wet ribbons are joined around the fill, then dried for',
          'days. This is specialised capacity, not chemistry.'])}`,
  'soft gelatin capsule');

/* ---------- 8. sterile ophthalmic emulsion ------------------------------ */
FSVG['emulsion-oph'] = (o) => {
  const rnd = seeded(5); const drops = [];
  for (let i = 0; i < 90; i++)
    drops.push(`<circle cx="${(262 + rnd() * 158).toFixed(1)}" cy="${(158 + rnd() * 82).toFixed(1)}" r="${(2 + rnd() * 5).toFixed(1)}" fill="url(#oilG)" opacity="${(0.45 + rnd() * 0.5).toFixed(2)}"/>`);
  return wrap(`
  <path d="M 96 36 L 96 50 Q 96 58 88 62 L 84 68 L 84 116 Q 84 138 116 138 Q 148 138 148 116 L 148 68 L 144 62 Q 136 58 136 50 L 136 36 Z"
        fill="url(#glassG)" stroke="#8794a1" stroke-width="1.4"/>
  <path d="M 86 86 L 146 86 L 146 116 Q 146 134 116 134 Q 86 134 86 116 Z" fill="url(#liqG)" opacity="0.75"/>
  <rect x="98" y="26" width="36" height="12" rx="3" fill="#8794a1"/>
  ${SCALE(84, 148, o.sizeLabel)}
  ${LBL(116, 186, 'single-use vial', '#6a7683', 10)}
  ${LBL(116, 200, 'no preservative', '#d8a13c', 10)}
  ${CALL(150, 110, 258, 152)}
  <rect x="256" y="148" width="172" height="98" rx="6" fill="#0f1319" stroke="#2b333c"/>
  ${drops.join('')}
  ${LBL(342, 138, 'oil droplets, a few hundred nm', '#2fc2c8', 10)}
  ${NOTE(['This droplet distribution is the evidence FDA accepts in',
          'place of a clinical trial. It is not just a specification.'])}`,
    'sterile ophthalmic emulsion');
};

/* ---------- 9. oral nanocrystal suspension ------------------------------ */
FSVG['suspension'] = (o) => {
  const rnd = seeded(13); const parts = [];
  for (let i = 0; i < 130; i++)
    parts.push(`<circle cx="${(268 + rnd() * 152).toFixed(1)}" cy="${(158 + rnd() * 84).toFixed(1)}" r="${(1.6 + rnd() * 3.4).toFixed(1)}" fill="#cfd6dd" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`);
  const rnd2 = seeded(29); const inBottle = [];
  for (let i = 0; i < 80; i++)
    inBottle.push(`<circle cx="${(84 + rnd2() * 56).toFixed(1)}" cy="${(84 + rnd2() * 48).toFixed(1)}" r="${(0.9 + rnd2() * 1.6).toFixed(1)}" fill="#e6eef2" opacity="${(0.3 + rnd2() * 0.6).toFixed(2)}"/>`);
  return wrap(`
  <path d="M 92 34 L 132 34 L 132 52 L 146 66 L 146 126 Q 146 138 134 138 L 90 138 Q 78 138 78 126 L 78 66 Z"
        fill="url(#glassG)" stroke="#8794a1" stroke-width="1.4"/>
  <path d="M 80 82 L 144 82 L 144 126 Q 144 136 134 136 L 90 136 Q 80 136 80 126 Z" fill="url(#liqG)" opacity="0.55"/>
  ${inBottle.join('')}
  <rect x="88" y="24" width="48" height="12" rx="3" fill="#8794a1"/>
  ${SCALE(78, 146, o.sizeLabel)}
  ${LBL(112, 186, 'shake before use', '#d8a13c', 10)}
  ${CALL(150, 108, 262, 152)}
  <rect x="260" y="148" width="168" height="100" rx="6" fill="#0f1319" stroke="#2b333c"/>
  ${parts.join('')}
  ${LBL(344, 138, 'milled crystals, a few hundred nm', '#2fc2c8', 10)}
  ${NOTE(['Every dose is poured, not counted. If the particles settle',
          'and will not redisperse, each spoonful is a different dose.'])}`,
    'oral nanocrystal suspension');
};

/* ---------- 10. oral solution ------------------------------------------- */
FSVG['solution'] = (o) => wrap(`
  <path d="M 92 32 L 132 32 L 132 52 L 148 68 L 148 130 Q 148 142 134 142 L 90 142 Q 76 142 76 130 L 76 68 Z"
        fill="url(#glassG)" stroke="#8794a1" stroke-width="1.4"/>
  <path d="M 78 84 L 146 84 L 146 130 Q 146 140 134 140 L 90 140 Q 78 140 78 130 Z" fill="url(#liqG)" opacity="0.62"/>
  <rect x="88" y="22" width="48" height="12" rx="3" fill="#8794a1"/>
  ${SCALE(76, 148, o.sizeLabel)}
  ${LBL(112, 186, 'clear solution', '#6a7683', 10)}
  <rect x="232" y="62" width="164" height="20" rx="10" fill="#1a2027" stroke="#3a444e"/>
  <rect x="236" y="66" width="112" height="12" rx="6" fill="url(#liqG)" opacity="0.7"/>
  <rect x="396" y="66" width="32" height="12" rx="3" fill="#8794a1"/>
  <line x1="266" y1="56" x2="266" y2="88" stroke="#6a7683"/>
  <line x1="300" y1="56" x2="300" y2="88" stroke="#6a7683"/>
  <line x1="334" y1="56" x2="334" y2="88" stroke="#6a7683"/>
  ${LBL(314, 48, 'oral dosing syringe', '#6a7683', 10)}
  ${LBL(314, 112, 'Dose is measured by the patient,', '#97a3b0', 10)}
  ${LBL(314, 126, 'so the device matters as much', '#97a3b0', 10)}
  ${LBL(314, 140, 'as the formulation.', '#97a3b0', 10)}
  ${NOTE(['Nothing protects the molecule. It sits in water for the',
          'whole shelf life, so degradation has two years to happen.'], '#d8a13c', 224)}`,
  'oral solution with dosing syringe');

/* ---------- 11. sterile vial for infusion ------------------------------- */
FSVG['vial-iv'] = (o) => {
  const rnd = seeded(3); const mabs = [];
  for (let i = 0; i < 24; i++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 44;
    mabs.push(`<circle cx="${(340 + Math.cos(a) * rr).toFixed(1)}" cy="${(180 + Math.sin(a) * rr).toFixed(1)}" r="${(4 + rnd() * 5).toFixed(1)}" fill="url(#oilG)" opacity="0.7"/>`);
  }
  return wrap(`
  <path d="M 104 36 L 104 56 L 92 70 L 92 128 Q 92 142 106 142 L 154 142 Q 168 142 168 128 L 168 70 L 156 56 L 156 36 Z"
        fill="url(#glassG)" stroke="#8794a1" stroke-width="1.4"/>
  <path d="M 94 88 L 166 88 L 166 128 Q 166 140 154 140 L 106 140 Q 94 140 94 128 Z" fill="url(#liqG)" opacity="0.5"/>
  <rect x="98" y="26" width="64" height="14" rx="2" fill="#8794a1"/>
  <rect x="104" y="18" width="52" height="10" rx="4" fill="#6d7883"/>
  ${SCALE(92, 168, o.sizeLabel)}
  ${LBL(130, 186, 'stoppered and crimped', '#6a7683', 10)}
  ${LBL(130, 200, 'never opened to room air', '#6a7683', 10)}
  ${CALL(172, 104, 282, 150)}
  <circle cx="340" cy="180" r="54" fill="none" stroke="#2b333c"/>
  ${mabs.join('')}
  ${LBL(340, 112, 'monoclonal antibody', '#2fc2c8', 10)}
  ${NOTE(['Grown in living cells, so it cannot be copied exactly —',
          'the standard is biosimilarity, not sameness.'], '#97a3b0', 258)}
  ${LBL(340, 236, 'Purple Book, not Orange Book', '#d8a13c', 10)}`,
    'sterile vial for infusion');
};

/* ---------- dispatcher --------------------------------------------------- */
function drawDosageForm(formId, opts) {
  const fn = FSVG[formId] || FSVG['tablet-fc'];
  return fn(opts || {});
}
