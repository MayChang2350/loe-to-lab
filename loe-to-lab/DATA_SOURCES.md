# Evidence log

**Snapshot date: 2026-07-27.** Everything below was checked or organised on that date. Regulatory data is volatile; re-verify before any decision gate.

This file exists because the project-evaluation curriculum insists on it: *"任何『核准、可替代、專利到期、BE 要求』的結論，都要保留官方來源、版本／日期與查詢證據"* — any conclusion about approval, substitutability, patent expiry or BE requirements must retain its official source, its version and date, and the evidence of the search.

---

## Confidence scale

| Flag | Meaning |
|---|---|
| **high** | Taken from a named primary source, or from a trade report quoting a specific figure |
| **medium** | Directionally reliable, order-of-magnitude; from secondary trackers or recalled industry figures |

Secondary patent trackers (DrugPatentWatch, Pharsight/GreyB, PatSnap) are used **only as leads**. They are not official. Any conclusion drawn from them must be confirmed in the Orange Book, the Purple Book or Drugs@FDA before it enters a business case.

---

## Primary regulatory sources

| Source | Used for | URL |
|---|---|---|
| Drugs@FDA | Approval status, application numbers, approval history, FDA-approved labeling | https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm |
| Orange Book | RLD / RS, TE codes, patent and exclusivity listings | https://www.accessdata.fda.gov/scripts/cder/ob/index.cfm |
| Purple Book | BLA reference products, biosimilarity, interchangeability | https://purplebooksearch.fda.gov/ |
| Product-Specific Guidances | BE study design requirements per product | https://www.accessdata.fda.gov/scripts/cder/psg/index.cfm |
| FDA Dissolution Methods Database | Recommended dissolution conditions where no USP method exists | https://www.accessdata.fda.gov/scripts/cder/dissolution/ |
| Inactive Ingredient Database | Excipient precedent by route, dosage form and potency | https://www.fda.gov/drugs/drug-approvals-and-databases/inactive-ingredients-database-download |
| DailyMed | Current in-use SPL labeling, NDC, packaging | https://dailymed.nlm.nih.gov/dailymed/ |

**Reading rule carried through the whole site:** approval and indication → Drugs@FDA. Packaging, NDC and SPL → DailyMed. Where they disagree, compare version dates and supplement status. DailyMed coverage includes products that are *not* FDA-approved, so its presence in DailyMed proves nothing about approval.

---

## Deep-dive case: linaclotide

| Claim | Source | Confidence |
|---|---|---|
| NDA 202811; capsule; oral; 72 / 145 / 290 mcg | Drugs@FDA | high |
| PSG: API sameness (primary sequence, 3 disulfide bonds, in vitro bioactivity) **plus** either one in vitro comparative dissolution study **or** one in vivo clinical-endpoint BE study | FDA PSG_202811, recommended Dec 2018, revised May 2022 — https://www.accessdata.fda.gov/drugsatfda_docs/psg/PSG_202811.pdf | high |
| Dissolution conditions: USP Apparatus 1, 500 mL, 50 rpm, 37 °C; water, 0.1N HCl, pH 4.5, pH 6.8; sampling 10 / 15 / 20 / 30 min; n = 12; f2 ≥ 50, waived if both products release ≥ 85 % in ≤ 15 min in all four media | same PSG | high |
| 290 mcg in vivo waiver on 145 mcg BE + dissolution of both strengths + proportional similarity | same PSG | high |
| Feeding-tube in vitro testing: NG 8 Fr and G 12 Fr, at 72 and 290 mcg, 30 mL bottled water, 0 and 15 min, comparative recovery plus sedimentation volume and redispersibility | same PSG | high |
| 72 mcg uses a **different formulation** from 145 / 290 mcg; Q1/Q2 comparison must be per strength | PSG footnote 1; FDA-approved label | high |
| Inactives, 145 / 290 mcg: calcium chloride dihydrate, hypromellose, L-leucine, microcrystalline cellulose | FDA-approved label, NDA 202811 | high |
| Inactives, 72 mcg: calcium chloride dihydrate, L-histidine, microcrystalline cellulose, polyvinyl alcohol, talc | FDA-approved label, NDA 202811 | high |
| Product is linaclotide-coated beads in a hard capsule; shell contains gelatin and titanium dioxide | FDA-approved label | high |
| FY2025 US net sales guidance US$860–890M; FY2026 guidance US$1,125–1,175M | Ironwood Pharmaceuticals FY2025 results / FY2026 outlook, Jan 2026 | high |
| 2020 settlement licenses Teva from 31-Mar-2029 (72, 145 and 290 mcg) | Ironwood/Allergan press release, 22-Jan-2020 — https://investor.ironwoodpharma.com/press-releases/press-release-details/2020/Ironwood-and-Allergan-Announce-Settlement-with-Teva-Resolving-LINZESS-linaclotide-Patent-Litigation/default.aspx | high |
| Aurobindo licensed from 05-Aug-2030; Sun from 01-Feb-2031 | Trade press reporting on settlements | medium |
| Orange Book formulation patents to 30-Oct-2031 (145/290) and 16-Aug-2033 (72 mcg); compound patent expired 2025 | Secondary trackers — **VERIFY IN ORANGE BOOK** | medium |
| One tentative approval on file; no approved generic | Secondary trackers — **VERIFY IN DRUGS@FDA** | medium |

**Known disagreement between sources.** Secondary trackers differ on whether the practical first-generic date is 2029 or 2030. The site uses 31-Mar-2029 as the modelled entry date and states the disagreement explicitly, because a screener that hides an unresolved conflict is worse than one that has no data at all.

---

## User fees (FY2026 statutory rates)

Effective 01-Oct-2025 through 30-Sep-2026. Published in the Federal Register 30-Jul-2025.

| Fee | Amount | Source |
|---|---|---|
| PDUFA application, requiring clinical data | $4,682,003 | 90 FR, doc. 2025-14413 |
| PDUFA application, not requiring clinical data | $2,341,002 | 90 FR, doc. 2025-14413 |
| GDUFA ANDA application | $358,247 | 90 FR, doc. 2025-14411 |
| BsUFA 351(k), with clinical data | $1,200,794 | 90 FR, doc. 2025-14416 |
| BsUFA 351(k), without clinical data | $600,397 | 90 FR, doc. 2025-14416 |

Program, facility, DMF and PLA fees are additional and are **not** modelled on the site.

---

## Screening dataset — other molecules

| Product | Key claim | Source | Confidence |
|---|---|---|---|
| JANUVIA | US$2.255B most recent full year; US exclusivity lost May 2026; three generics already approved | Fierce Pharma, *The top 10 drugs losing US exclusivity in 2026* | high |
| JANUMET / XR | US$1.433B combined; LOE May 2026, XR July 2026 | Fierce Pharma, same report | high |
| XELJANZ | US$1.618B; first generic approved Aug 2025 | Fierce Pharma, same report | high |
| ELIQUIS | Settled launch 01-Apr-2028 for most filers; three litigants blocked to the 2031 formulation patent | Pfizer 10-K FY2025 | medium |
| JARDIANCE | Earliest reported settlement entry 01-Feb-2029; nineteen tentative approvals; active PIV litigation | Secondary trackers; PatSnap on *Boehringer v. Ipca* | medium |
| JAKAFI | Earliest reported entry 12-Dec-2028; alternative estimate 22-Mar-2029 | Secondary trackers; Incyte FY2025 | medium |
| IBRANCE | US patent term extension pushes key patent to March 2027 | GEN, *Top 20 Drugs Heading for the Patent Cliff, 2026–2029* | medium |
| KEYTRUDA | US compound patent expires December 2028; IRA pricing from January 2028; ~US$29.5B global 2023 | Merck FY2025 commentary; GEN report | medium |
| XTANDI | Patent reported to expire 2027, LOE effect 2028 | BioSpace patent-cliff coverage | medium |
| RESTASIS | 2016 PSG in vitro option; first generic 2022; Bora/Upsher-Smith approved and launched 2026 | My own evaluation deck, `restasis_final.pptx`, July 2026; FDA PSG | high |
| DEXILANT | Draft PSG rec. Jun 2011, rev. Oct 2016 / Feb 2018; three BE studies at 60 mg; NG 16 Fr testing | FDA Draft PSG; internship deck 5, slide 26 | high |
| VIGAFYDE, MEGACE ES, SABRIL | Homework evaluation set | Internship deck 5, slide 28 | medium |
| VRAYLAR, INGREZZA, ZEPOSIA, RINVOQ, AUSTEDO, XIFAXAN, RYBELSUS/OZEMPIC | LOE windows | Secondary trackers — **VERIFY IN ORANGE BOOK** | medium |

---

## Modelled, not sourced

These are transparent modelling choices, not facts. They are stated here so that a reader can disagree with the model rather than with the data.

- **Scoring weights and the timing curve.** A complex generic needs roughly 36–48 months from start to approval; the timing score peaks at 2.5–5 years to entry, falls sharply inside 18 months, and decays beyond 7 years as capital sits idle.
- **Technical difficulty scored twice.** `techBarrier` is scored positively (it deters rivals and protects price); `execRisk` is scored negatively (it may sink delivery). Collapsing them into one "complexity" number is the modelling error this whole module exists to avoid.
- **Price-erosion curve.** Erosion in a US multi-source oral solid is driven by competitor count, not elapsed time. The coefficients used are the widely cited approximate shape of that curve and should be treated as illustrative.
- **Fluid-bed geometry.** Representative of a GPCG-5 class unit with a Wurster insert: 0.38 m bowl, 0.152 m partition, 0.45 m partition height, 93 % of air through the high-open-area zone. Not any specific machine.
- **Linaclotide pilot formulation.** 65.0 mg fill weight, 8.0 % w/w coating load, coating solids split 2.80 / 47.2 / 22.0 / 28.0 between linaclotide, hypromellose, calcium chloride dihydrate and L-leucine, 12 % process overage. A starting design, to be replaced by reverse-engineered values once RLD deformulation is complete.
- **Peptide stability ceiling of 45 °C product temperature.** A defensible working assumption for a disulfide-bridged peptide, not a published limit for this molecule.

---

## Curriculum this was built on

Bora Pharmaceuticals / TWi technical development participant programme, June–July 2026:

1. Bora Group and TWi pharmaceutical introduction
2. Introduction of pharmaceutical company and product
3. Composition of pharmaceutical company departments
4. Introduction of pharmaceutical plant (GMP) — TFDA / PIC/S GMP / FDA inspection readiness
5. Introduction of project evaluation — FDA databases and the standardised evaluation workflow
8. NDA / ANDA / BLA regulation, part 1 — regulatory architecture, submission routes, user fees, protection architecture
9. NDA / ANDA / BLA regulation, part 2 — 505(b)(1), 505(b)(2), 351(a) BLA, ANDA, patent linkage
10. Common pharmaceutical processes, critical parameters and equipment qualification

Own outputs: `restasis_final.pptx`, `rechon_gmp_final.pptx`, `USP_overview.pptx`, `EMA.pptx`, `pharmaessentia_overview.pptx`, and the Technical Services presentation on technology transfer and process validation.
