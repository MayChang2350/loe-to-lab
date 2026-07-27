# From Patent Cliff to Pilot Batch

A CDMO decision chain, end to end — built as the closing project of the Technical Services participant programme at Bora Pharmaceuticals / TWi, summer 2026.

**Live:** https://maychang2350.github.io/loe-to-lab/

---

## What this is

A CDMO gets asked two questions that are usually answered by two different departments and rarely joined up. Business development asks *which molecule should we start?* Technical services asks *how do we make it?* The gap between those questions is where projects are lost — a product gets selected on market size and only later turns out to require a clinical endpoint trial, or a process gets designed for a formulation whose composition disqualifies the cheap regulatory route.

This site closes that gap in one continuous chain, on one molecule, from a line in a patent database to a spray rate on a fluid-bed control panel.

| # | Module | What it does |
|---|--------|--------------|
| 01 | **LOE screener** | 21 molecules losing US exclusivity 2026–2033, scored against weights you control. Technical difficulty is scored **twice, with opposite signs** — as a barrier that deters rivals and as an execution risk that may sink you. |
| 02 | **Pathway engine** | A four-question decision tree across 505(b)(1) / 505(b)(2) / ANDA 505(j) / 351(k), plus an exclusivity-and-entry clock and a programme-economics model built on FY2026 statutory user fees. |
| 03 | **Product dossier** | Linaclotide (LINZESS, NDA 202811): regulatory reading, QTPP, formulation design target, CQA register, analytical package, phased development plan with gates. |
| 04 | **Pilot batch coach** | A step-by-step Wurster drug-layering protocol whose quantities recalculate from batch size, with parameter rationales, in-process controls, decision branches, and a troubleshooting engine that ends each entry with the instinctive move that makes things worse. |
| 05 | **Process lab** | Seven live machines from the real manufacturing chain. Move a slider and equations decide what comes out — including what goes wrong and what you would see on the bench when it does. |
| 06 | **Transfer & validation** | URS → DQ → FAT/SAT → IQ/OQ/PQ → PPQ → CPV, plus a seven-point gap assessment for technology transfer. |

Fully bilingual (English / 繁體中文) with a single toggle — every panel, every rationale, every alert.

### Navigation

The site opens on a **map** of how a medicine reaches a patient: the innovator's twelve-to-fifteen-year chain along the top, the loss-of-exclusivity junction in the middle, and the six modules of this project along the bottom. Click any module to jump into it, or skip past and read normally. The map is reachable again from the header at any time.

It is injected by JavaScript over the finished page rather than being part of the markup, so search engines and anyone without JavaScript get the whole site with no gate — and if that code ever breaks, the site still works. Esc, the skip link and the backdrop all close it, and the choice can be remembered.

### Product figures

Selecting any of the 21 products draws its actual dosage form. Eleven distinct builders cover hard capsules, drug-layered beads, delayed-release pellets, film-coated tablets, osmotic and matrix extended-release tablets, softgels, ophthalmic emulsions, nanocrystal suspensions, oral solutions and sterile vials — each alongside how that form is made, what makes it hard, and the unit operations it needs.

**Only LINZESS carries verified appearance** (white to off-white opaque hard gelatin capsule, grey "FL 145" imprint), because that is the one product whose label text was checked directly. Every other figure draws the correct *structure* in neutral colours with no invented imprint, says so on the figure, and links to the official DailyMed photograph. Colour and debossing are product-specific facts and are not guessed here.

### Motion

Scroll reveals, an animated map, staggered prose and a pulse on the section you land in. Everything is under 300 ms and the whole layer switches off for anyone whose system asks for `prefers-reduced-motion`.

---

## Why linaclotide

It is not the largest opportunity in the screening set. It is the one where the ratio of *what you must prove* to *what you must spend* is most favourable, and where what you must prove happens to be the thing a technically strong CDMO is already good at.

The May 2022 product-specific guidance offers two mutually exclusive routes to bioequivalence:

- **Option 2** — a randomised, double-blind, placebo-controlled clinical endpoint trial in chronic idiopathic constipation, run separately for 72 mcg and 145 mcg.
- **Option 1** — twelve capsules of test and twelve of reference, in four media, sampled four times, with f2 ≥ 50.

Option 1 has one condition: the test formulation must be qualitatively and quantitatively the same as the RLD. The whole programme collapses into that sentence. Reverse-engineer Q1/Q2 sameness on a peptide layer that is roughly two parts per thousand of the bead by weight, and you delete two clinical trials. Fail, and you are running a Phase 3 without a Phase 3 budget.

That is a CMC problem, not a clinical-spend problem — and the same barrier that stands between you and approval stands between eleven other filers and approval. Which is why the Orange Book shows one tentative approval on this molecule, and nineteen on empagliflozin.

---

## Running it

Pure static HTML, CSS and JavaScript. No build step, no framework, no bundler, no dependencies at runtime.

```bash
# open directly
open index.html

# or serve locally
python3 -m http.server 8000
```

### Deploying to GitHub Pages

`index.html` sits at the repository root, so Pages serves it directly.

1. Push to the default branch: `git push`
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at https://maychang2350.github.io/loe-to-lab/ within a minute or two.

If you ever move the files into a subfolder again, the site moves with them — Pages serves whatever is at the root of the branch, so `index.html` has to stay here.

Because the scripts are plain `<script>` tags rather than ES modules, the page also works when opened straight from the filesystem — useful for offline demos.

---

## Structure

```
index.html            page skeleton
assets/styles.css     design system
assets/app.js         rendering, interaction, canvas animation
data/i18n.js          interface strings + long-form narrative, EN/繁中
data/molecules.js     LOE screening dataset + scoring model
data/pathway.js       route decision tree, exclusivity catalogue, fee & erosion model
data/deepdive.js      linaclotide dossier
data/protocol.js      pilot batch protocol + troubleshooting engine
data/fluidbed.js      fluid-bed physics, knob dictionary, scenarios, validation content
data/unitops.js       six unit-operation models, controls, verdicts and teaching notes
data/dosageforms.js   what each product physically is, and why the form decides how it is made
assets/forms.js       eleven dosage-form drawings
tools/domshim.js      minimal DOM shim (testing only)
tools/test-models.js  physics + figure geometry tests
tools/test-render.js  headless render + interaction test
DATA_SOURCES.md       evidence log
```

### Tests

```bash
node tools/test-models.js       # 164 checks — physics and figure geometry
node tools/test-render.js       # 164 checks — rendering and interaction
node tools/test-interactive.js  # is anything invisible covering the page?
```

`test-models.js` checks every model against literature values (minimum fluidisation and terminal velocity for a 250 µm sphere, compaction pressure at a given force and punch size, droplet size at a given homogenising pressure) and then verifies the *direction* of every response — more force gives a stronger and slower tablet, faster rotor gives smaller particles and more fines, a surfactant-starved emulsion does not improve with pressure. It also confirms every verdict is reachable, bilingual, and free of `NaN`.

`test-models.js` also audits the figures geometrically: every drawing must be well-formed, carry no dangling clip-path reference, contain no truncated text, and keep every label inside the canvas once group transforms are applied. That last check is transform-aware, because two labels legitimately live at `x="0"` inside a translated group.

`test-render.js` loads the real page and the real application code against a minimal DOM shim, then checks every module renders, all seven simulators swap and respond, all 21 product figures draw cleanly, the map opens with every node pointing at a real section, the language toggle round-trips, and that no `undefined`, `NaN` or `[object Object]` reaches the screen in either language.

`test-interactive.js` exists because of a bug that shipped. The landing map faded to `opacity: 0` on dismissal but stayed in the document — and a `position: fixed; inset: 0` element still covers the viewport at zero opacity, so every button and slider on the page silently stopped responding while the site looked completely normal. There is no layout engine in these tests, so nothing could hit-test it. This suite instead audits the *cause*: it finds every full-viewport fixed layer in the stylesheet, checks each is click-through unless deliberately shown, confirms the overlay is removed from the DOM on close, and then drives a slider and a button to confirm they still respond.

The general lesson, kept here deliberately: a headless DOM cannot tell you what is on top of what. Anything that positions itself over the whole page needs `pointer-events` reasoned about explicitly, not tested for after the fact.

---

## The process lab

Seven machines, each with its own model, its own chart, and a plain-language verdict that tells you what you would actually see if you ran those settings.

| Machine | What you control | What breaks |
|---|---|---|
| **Fluid bed** (Wurster + top spray) | Air volume, inlet temperature, dew point, spray rate, atomisation, Wurster gap, load, solids | Over-wetting, spray drying, stalled circulation, elutriation |
| **Milling & particle size** | Screen aperture, rotor speed, feed rate, granule friability | Fines that will not flow, oversize bypass, wide-span segregation |
| **Blending & lubrication** | Blend time, speed, fill level, magnesium stearate, size mismatch | Under-mixing, re-segregation, over-lubrication |
| **Tablet compression** | Compression force, pre-compression, turret speed, weight, punch size, moisture | Capping, friability, over-hard tablets that never disintegrate |
| **Film coating** | Spray rate per gun, air temperature and volume, pan speed, atomisation, target gain, load, solids | Sticking, twinning, orange peel, edge erosion |
| **Dissolution testing** | Apparatus, rpm, medium, pH dependence, plus particle size, hardness and coating carried over | f2 failure, and the f2 validity rule most people get wrong |
| **Homogenisation** | Pressure, passes, oil phase, surfactant, temperature | Surfactant starvation, where more pressure makes it worse |

Three of the operations deliberately share variables. Particle size from the mill, tablet strength from the press and coating level from the coater all reappear as inputs to the dissolution test — so a decision made in one machine shows up as a regulatory result in another. That is the argument of the whole site, made operable.

Two failure modes are worth finding on purpose:

- **Blending** is the only operation here whose objective function is not monotonic. Uniformity improves, then over-lubrication quietly destroys the tablet. There is a usable window and the chart shades it.
- **Homogenisation** has a turning point. Below a certain surfactant level, extra pressure creates interface faster than the surfactant can stabilise it, and the droplets get *bigger*. The chart shows the ideal curve alongside the real one so you can see them separate.

## The physics engines

`data/fluidbed.js` and `data/unitops.js` are lumped first-principles models, not CFD. Every correlation is published and checkable:

| Quantity | Correlation |
|---|---|
| Minimum fluidisation velocity | Wen & Yu (1966), from the Archimedes number |
| Terminal settling velocity | Haider & Levenspiel, with sphericity |
| Air viscosity | Sutherland |
| Saturation vapour pressure | Magnus / Tetens |
| Moist-air enthalpy, humidity ratio | Standard psychrometrics |
| Droplet Sauter mean diameter | Empirical, from air-to-liquid mass ratio |
| Coating uniformity | Variance ∝ 1/√N over N passes through the spray zone |
| Particle size distribution | Log-normal, truncated at the screen aperture |
| Compaction | Exponential porosity decay under pressure; Ryshkewitch strength–porosity |
| Tablet hardness | Fell–Newton, from tensile strength and tablet geometry |
| Dissolution | Weibull release with lag; f2 per the FDA similarity rule and its validity condition |
| Emulsion droplet size | Energy scaling with a surfactant-coverage floor on interfacial area |
| Creaming | Stokes settling |

Spot values against literature (250 µm sphere, ρ = 1400 kg/m³, air at 45 °C): U<sub>mf</sub> = 0.027 m/s, U<sub>t</sub> = 1.27 m/s. Regime classification is deliberately different between Wurster and top-spray configurations, because superficial velocity over the whole distributor plate means completely different things in each.

**What it will tell you correctly:** the direction and rough magnitude of every response, the location of the operating window, and which failure mode you are approaching.

**What it will not tell you:** your actual batch. Fluid beds are geometry-specific and the only trustworthy operating window is the one your own development batches drew.

---

## Honesty notes

- FDA publishes no public API for Orange Book patent and exclusivity data. The screening dataset is a **hand-compiled snapshot dated 27 July 2026**, not a live feed. Every row carries sources and a confidence flag. Re-verify in Drugs@FDA and the Orange Book before any decision gate.
- Sales figures flagged *medium* confidence are order-of-magnitude. Adequate for ranking, inadequate for a business case.
- The linaclotide formulation is a **design target** built from the label's inactive-ingredient list, the PSG, the Inactive Ingredient Database and standard drug-layering practice. It is not the innovator's composition, which is not public. Establishing Q1/Q2 sameness appears in the development plan as work to be done, not as a result.
- The pilot batch protocol is **not a validated master batch record**. A real MBR is a controlled GMP document with revision control, approvals and signature blocks.
- Nothing here is proprietary to Bora, TWi or any client. Every regulatory fact traces to a public FDA source; see `DATA_SOURCES.md`.

---

## Built on

Fourteen sessions of the Bora / TWi technical development programme, June–July 2026 — company and product introduction, departmental structure, GMP plant and inspection readiness, FDA database project evaluation, NDA/ANDA/BLA regulation parts 1 and 2, and pharmaceutical processes and equipment — plus my own evaluation outputs (Restasis, Rechon GMP, USP, EMA, PharmaEssentia) and my Technical Services presentation on technology transfer and process validation.

**May Chang**, 2026.
