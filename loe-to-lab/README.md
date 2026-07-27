# From Patent Cliff to Pilot Batch

A CDMO decision chain, end to end — built as the closing project of the Technical Services participant programme at Bora Pharmaceuticals / TWi, summer 2026.

**Live:** `https://<your-github-username>.github.io/loe-to-lab/`

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
| 05 | **Fluid-bed simulator** | A live heat-and-mass balance with fluidisation mechanics, wired to an animated cross-section. Move a control and every number and every particle responds. Includes an operating-window map and four graded training scenarios. |
| 06 | **Transfer & validation** | URS → DQ → FAT/SAT → IQ/OQ/PQ → PPQ → CPV, plus a seven-point gap assessment for technology transfer. |

Fully bilingual (English / 繁體中文) with a single toggle — every panel, every rationale, every alert.

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

1. Create a repository (e.g. `loe-to-lab`) and push this folder to the default branch.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/loe-to-lab/`.

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
data/fluidbed.js      physics engine, knob dictionary, scenarios, validation content
tools/domshim.js      minimal DOM shim (testing only)
tools/test-render.js  headless render + interaction test
DATA_SOURCES.md       evidence log
```

### Tests

```bash
node tools/test-render.js
```

Loads the real page and the real application code against a minimal DOM shim, then checks every module renders, the language toggle round-trips, the interactions fire, and that no `undefined`, `NaN` or `[object Object]` reaches the screen in either language.

---

## The physics engine

`data/fluidbed.js` is a lumped first-principles model, not CFD. Every correlation is published and checkable:

| Quantity | Correlation |
|---|---|
| Minimum fluidisation velocity | Wen & Yu (1966), from the Archimedes number |
| Terminal settling velocity | Haider & Levenspiel, with sphericity |
| Air viscosity | Sutherland |
| Saturation vapour pressure | Magnus / Tetens |
| Moist-air enthalpy, humidity ratio | Standard psychrometrics |
| Droplet Sauter mean diameter | Empirical, from air-to-liquid mass ratio |
| Coating uniformity | Variance ∝ 1/√N over N passes through the spray zone |

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
