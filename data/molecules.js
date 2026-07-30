/* ============================================================================
   molecules.js — LOE screening dataset
   ----------------------------------------------------------------------------
   CURATED SNAPSHOT. Not a live feed. Every row carries a source and an access
   date. FDA publishes no public API for Orange Book patent / exclusivity data,
   so this file is a hand-verified snapshot compiled 2026-07-27 and must be
   re-verified at every decision gate (see 5. Project Evaluation, slide 25:
   "Gate review 前重查會變動的資料").

   Field conventions
     usSalesM      : most recent full-year U.S. net/branded sales, US$ millions
     entryDate     : earliest realistic U.S. generic/biosimilar entry (ISO)
     entryBasis    : WHY that date — patent expiry, settlement licence, or exclusivity
     legalRisk     : 1 (clean) .. 5 (active litigation / unsettled PIV / thicket)
     techBarrier   : 1 (commodity) .. 5 (complex generic, hard to copy). Kept as the
                     single number shown in the screener table's "Barrier" column.
                     NOTE: high techBarrier is a *defensive asset* for a CDMO —
                     it suppresses competitor count. It is scored positively.
     apiAvail      : 1 (API is a commodity, cheap and widely sourced) .. 5 (API is
                     scarce, proprietary-route, or expensive to secure)
     peptideRepro  : 1 (ordinary small-molecule synthesis, nothing to "reproduce")
                     .. 5 (a peptide/protein chain or biologic that must be matched
                     residue-for-residue). Scores low for almost every small
                     molecule in this set by design — that absence of a chain to
                     reproduce is itself the honest reading for those rows.
     rdDifficulty  : 1 (routine formulation/analytics) .. 5 (genuinely hard R&D —
                     polymorph control, osmotic engineering, aseptic/biologic
                     characterisation, novel permeation chemistry, etc.)
                     These three replace the screener's single "technical barrier"
                     weight with the specific sub-factors an intern actually asked
                     about; techBarrier itself is left in place, and was set to
                     track roughly the average of the three below.
     execRisk      : 1 (routine) .. 5 (we may fail to execute it) — scored negatively.
                     Separating these two is the whole point: "hard" is good for
                     margin and bad for delivery, and they are not the same number.
     competition   : 1 (empty field) .. 5 (crowded / already eroded)
     fitBora       : 1..5 fit to a Taiwan CDMO with oral solid + sterile/ophthalmic
                     capability and complex-generic ambition (TWi / Bora profile)
     confidence    : 'high'   = figure taken from a named source below
                     'medium' = directionally reliable, order-of-magnitude
   ========================================================================== */

const SNAPSHOT_DATE = '2026-07-27';

const MOLECULES = [
  {
    id: 'linaclotide',
    brand: 'LINZESS',
    inn: { en: 'Linaclotide', zh: '利那洛肽 Linaclotide' },
    app: 'NDA 202811',
    sponsor: 'Ironwood / AbbVie (Allergan)',
    form: { en: 'Capsule (drug-layered beads); oral', zh: '膠囊（藥物層積微丸）；口服' },
    strengths: '72 / 145 / 290 mcg',
    modality: 'peptide-smallmol',
    usSalesM: 875,
    salesNote: {
      en: 'FY2025 U.S. net sales guidance US$860–890M; FY2026 guidance US$1,125–1,175M.',
      zh: '2025 年美國淨銷售指引 8.60–8.90 億美元；2026 年指引 11.25–11.75 億美元。'
    },
    pathway: 'ANDA',
    entryDate: '2029-03-31',
    entryBasis: {
      en: 'Compound patent already expired (2025). Orange Book formulation patents are reported to run to 30-Oct-2031 (145/290 mcg) and 16-Aug-2033 (72 mcg). Entry is set by SETTLEMENT LICENCE, not by expiry: the 2020 Ironwood/Allergan–Teva settlement licenses Teva from 31-Mar-2029 for all three strengths; Aurobindo is reported at 05-Aug-2030 and Sun at 01-Feb-2031. Secondary trackers disagree on whether the practical first-generic date is 2029 or 2030 — which is itself the reason this row must be re-read in the Orange Book and the parties\' own filings before any gate.',
      zh: '化合物專利已於 2025 年到期。Orange Book 上的處方專利據報延伸至 2031-10-30（145/290 mcg）與 2033-08-16（72 mcg）。進場時間由「和解授權」決定而非專利到期：2020 年 Ironwood／Allergan 與 Teva 的和解，授權 Teva 自 2029-03-31 起銷售三個規格；Aurobindo 據報為 2030-08-05，Sun 為 2031-02-01。次級資料來源對「實際首家學名藥上市」究竟是 2029 還是 2030 並不一致——這本身就是本列必須在任何決策關卡前回到 Orange Book 與當事人自己的公告重新查閱的理由。'
    },
    psg: {
      en: 'PSG revised May 2022. API sameness (peptide sequence, 3 disulfide bonds, in vitro bioactivity) PLUS either (1) in vitro comparative dissolution — available only if Q1/Q2 same — or (2) in vivo clinical-endpoint BE in chronic idiopathic constipation. In vitro feeding-tube testing required.',
      zh: 'PSG 於 2022 年 5 月修訂。需證明 API sameness（胜肽序列、三對雙硫鍵、體外生物活性），加上二選一：(1) 體外比較性溶離——僅在 Q1/Q2 相同時可用；或 (2) 以慢性原發性便秘為終點的臨床療效 BE。另需體外餵食管試驗。'
    },
    teCode: 'n/a (no approved generic yet)',
    genericsApproved: 0,
    tentativeApprovals: 1,
    legalRisk: 2,
    techBarrier: 5,
    apiAvail: 5,
    peptideRepro: 5,
    rdDifficulty: 4,
    execRisk: 4,
    competition: 2,
    fitBora: 5,
    unitOps: ['Wurster drug layering (GPCG)', 'Bead sizing', 'Capsule filling', 'Peptide analytics'],
    thesis: {
      en: 'The clearest asymmetry in the set. The PSG offers an in vitro dissolution route that removes an entire clinical BE trial — but only if you can reverse-engineer Q1/Q2 sameness on a 0.18% w/w peptide layer. That is a CMC problem, not a clinical-spend problem, which is exactly the trade a technically strong CDMO wants: pay in analytical rigour, not in patients. Entry is licence-gated to 2029–2031, so a 2026 start is on schedule, not late.',
      zh: '本組中最明確的不對稱機會。PSG 提供體外溶離路徑，可省下整個臨床 BE 試驗——但前提是能對 0.18% w/w 的胜肽層做出 Q1/Q2 相同。這是 CMC 問題而非臨床燒錢問題，正是技術型 CDMO 想要的交換：用分析嚴謹度付費，而不是用受試者付費。進場受和解授權限制在 2029–2031，因此 2026 年啟動剛好，不算晚。'
    },
    sources: [
      'FDA PSG_202811 (Recommended Dec 2018; Revised May 2022)',
      'Ironwood Pharmaceuticals FY2025 results / FY2026 guidance (Jan 2026)',
      'Ironwood–Allergan–Teva settlement release (22-Jan-2020)',
      'DrugPatentWatch / Pharsight LINZESS patent listings — SECONDARY, verify in Orange Book'
    ],
    confidence: 'high'
  },

  {
    id: 'apixaban',
    brand: 'ELIQUIS',
    inn: { en: 'Apixaban', zh: '阿哌沙班 Apixaban' },
    app: 'NDA 202155',
    sponsor: 'BMS / Pfizer',
    form: { en: 'Film-coated tablet; oral', zh: '膜衣錠；口服' },
    strengths: '2.5 / 5 mg',
    modality: 'smallmol',
    usSalesM: 9000,
    salesNote: { en: 'Global >US$10B; U.S. share approximate.', zh: '全球逾 100 億美元；美國佔比為估計值。' },
    pathway: 'ANDA',
    entryDate: '2028-04-01',
    entryBasis: {
      en: 'Settled launch date 01-Apr-2028 for most ANDA filers. Three litigants who lost are blocked until the formulation patent expires in 2031.',
      zh: '多數 ANDA 申請者和解launch日為 2028-04-01。三家敗訴者須等到 2031 年處方專利到期。'
    },
    psg: { en: 'PSG available; conventional fasting/fed PK BE with dissolution.', zh: '有 PSG；常規空腹／飯後 PK BE 加溶離。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 25,
    legalRisk: 2,
    techBarrier: 1,
    apiAvail: 1,
    peptideRepro: 1,
    rdDifficulty: 1,
    execRisk: 1,
    competition: 5,
    fitBora: 2,
    unitOps: ['Wet granulation', 'Compression', 'Film coating'],
    thesis: {
      en: 'The largest prize and the worst trade. ~25 tentative approvals are queued on a single day-one launch; price erosion in a Day-1 multi-source oral solid routinely exceeds 90% within twelve months. Volume without differentiation is how a CDMO buys a price war.',
      zh: '最大的獎品，最差的交易。約 25 件暫時性核准同時卡在同一個上市日；多家同日上市的口服固體製劑，12 個月內價格侵蝕常超過 90%。沒有差異化的量能，就是 CDMO 買下一場價格戰的方式。'
    },
    sources: ['Pfizer 10-K FY2025', 'DrugPatentWatch ELIQUIS — SECONDARY'],
    confidence: 'medium'
  },

  {
    id: 'empagliflozin',
    brand: 'JARDIANCE',
    inn: { en: 'Empagliflozin', zh: '恩格列淨 Empagliflozin' },
    app: 'NDA 204629',
    sponsor: 'Boehringer Ingelheim / Lilly',
    form: { en: 'Film-coated tablet; oral', zh: '膜衣錠；口服' },
    strengths: '10 / 25 mg',
    modality: 'smallmol',
    usSalesM: 4000,
    salesNote: { en: 'U.S. figure approximate; verify in BI/Lilly filings.', zh: '美國數字為估計值；請於 BI／Lilly 財報查證。' },
    pathway: 'ANDA',
    entryDate: '2029-02-01',
    entryBasis: {
      en: 'Core U.S. patent ~2027–2028; earliest reported settlement entry 01-Feb-2029. Active PIV litigation (e.g. Boehringer v. Ipca consent judgment).',
      zh: '美國核心專利約 2027–2028；最早和解進場日報導為 2029-02-01。仍有進行中的 PIV 訴訟（例如 Boehringer 對 Ipca 的同意判決）。'
    },
    psg: { en: 'PSG available; fasting PK BE, biowaiver possible for lower strength.', zh: '有 PSG；空腹 PK BE，低規格可能可申請 biowaiver。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 19,
    legalRisk: 3,
    techBarrier: 1,
    apiAvail: 1,
    peptideRepro: 1,
    rdDifficulty: 2,
    execRisk: 1,
    competition: 5,
    fitBora: 2,
    unitOps: ['Fluid-bed / high-shear granulation', 'Compression', 'Film coating'],
    thesis: {
      en: 'Nineteen tentative approvals is the answer to the question. A simple immediate-release tablet with a large market attracts every filer on earth; the technical barrier that would protect margin does not exist here.',
      zh: '十九件暫時性核准本身就是答案。市場大又是簡單速放錠，全世界的申請者都會來；此處不存在能保護毛利的技術門檻。'
    },
    sources: ['Pharsight / DrugPatentWatch JARDIANCE — SECONDARY', 'PatSnap: Boehringer v. Ipca'],
    confidence: 'medium'
  },

  {
    id: 'ruxolitinib',
    brand: 'JAKAFI',
    inn: { en: 'Ruxolitinib', zh: '魯索利替尼 Ruxolitinib' },
    app: 'NDA 202192',
    sponsor: 'Incyte / Novartis',
    form: { en: 'Tablet; oral', zh: '錠劑；口服' },
    strengths: '5 / 10 / 15 / 20 / 25 mg',
    modality: 'smallmol',
    usSalesM: 2800,
    salesNote: { en: 'U.S. product revenue approximate.', zh: '美國產品營收為估計值。' },
    pathway: 'ANDA',
    entryDate: '2028-12-12',
    entryBasis: {
      en: 'Reported earliest generic entry 12-Dec-2028; other estimates 22-Mar-2029. Oncology/haematology label carries REMS-free but specialty distribution.',
      zh: '報導最早學名藥進場日為 2028-12-12；另有估計為 2029-03-22。血液腫瘤適應症走專科通路。'
    },
    psg: { en: 'PSG available; fasting PK BE.', zh: '有 PSG；空腹 PK BE。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 6,
    legalRisk: 3,
    techBarrier: 2,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 2,
    execRisk: 2,
    competition: 3,
    fitBora: 3,
    unitOps: ['Direct compression / dry granulation', 'Containment (cytotoxic-adjacent)'],
    thesis: {
      en: 'Middle of the field. Specialty distribution slows erosion and the five-strength matrix raises the analytical workload, but the dosage form itself is ordinary and the entry date is disputed between sources — which is itself a flag to re-verify in Orange Book before any gate.',
      zh: '中段班。專科通路使價格侵蝕較慢，五個規格也提高分析工作量，但劑型本身平凡，且進場日在不同來源間有出入——這本身就是決策前必須回 Orange Book 重查的訊號。'
    },
    sources: ['Pharsight / DrugPatentWatch JAKAFI — SECONDARY', 'Incyte FY2025 annual report'],
    confidence: 'medium'
  },

  {
    id: 'cariprazine',
    brand: 'VRAYLAR',
    inn: { en: 'Cariprazine', zh: '卡利拉嗪 Cariprazine' },
    app: 'NDA 204370',
    sponsor: 'AbbVie / Gedeon Richter',
    form: { en: 'Capsule; oral', zh: '膠囊；口服' },
    strengths: '1.5 / 3 / 4.5 / 6 mg',
    modality: 'smallmol',
    usSalesM: 3300,
    salesNote: { en: 'U.S. sales approximate; AbbVie neuroscience segment.', zh: '美國銷售為估計值；AbbVie 神經科學部門。' },
    pathway: 'ANDA',
    entryDate: '2029-09-01',
    entryBasis: {
      en: 'Reported LOE window 2029–2030 depending on secondary patents and pediatric extension. VERIFY — this row is the least certain in the set.',
      zh: '報導的 LOE 區間為 2029–2030，視次要專利與兒科延長而定。請查證——本列為全組最不確定者。'
    },
    psg: { en: 'PSG available; long half-life active metabolite complicates PK study design.', zh: '有 PSG；活性代謝物半衰期長，PK 試驗設計較複雜。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 4,
    legalRisk: 4,
    techBarrier: 2,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 2,
    execRisk: 3,
    competition: 3,
    fitBora: 3,
    unitOps: ['Blending', 'Capsule filling'],
    thesis: {
      en: 'The very long half-life of the didesmethyl metabolite (weeks) makes a conventional crossover PK BE study expensive and slow — a real, non-obvious cost driver that a screener based on sales alone would miss entirely.',
      zh: 'Didesmethyl 代謝物半衰期長達數週，使常規交叉設計 PK BE 試驗既昂貴又漫長——這是只看銷售額的篩選完全看不到的、真實而不顯眼的成本驅動因子。'
    },
    sources: ['Secondary patent trackers — VERIFY IN ORANGE BOOK'],
    confidence: 'medium'
  },

  {
    id: 'rifaximin',
    brand: 'XIFAXAN',
    inn: { en: 'Rifaximin', zh: '利福昔明 Rifaximin' },
    app: 'NDA 021361 / 022554',
    sponsor: 'Salix / Bausch Health',
    form: { en: 'Film-coated tablet; oral', zh: '膜衣錠；口服' },
    strengths: '200 / 550 mg',
    modality: 'smallmol',
    usSalesM: 2000,
    salesNote: { en: 'U.S. sales approximate.', zh: '美國銷售為估計值。' },
    pathway: 'ANDA',
    entryDate: '2028-01-01',
    entryBasis: {
      en: 'Compound patent long expired; the barrier is a POLYMORPH patent thicket (Form β). Entry date is litigation-dependent — treat as a range, not a date.',
      zh: '化合物專利早已到期；門檻在於「晶型專利」叢林（Form β）。進場日取決於訴訟結果——應視為區間而非日期。'
    },
    psg: {
      en: 'Non-systemically absorbed — plasma PK is not the equivalence bridge. Clinical endpoint or in vitro alternatives; historically one of the hardest ANDAs to design.',
      zh: '不經全身吸收——血漿 PK 不是等效橋樑。須用臨床終點或體外替代方法；歷來是最難設計的 ANDA 之一。'
    },
    teCode: 'n/a',
    genericsApproved: 0,
    tentativeApprovals: 2,
    legalRisk: 5,
    techBarrier: 5,
    apiAvail: 4,
    peptideRepro: 1,
    rdDifficulty: 5,
    execRisk: 5,
    competition: 1,
    fitBora: 2,
    unitOps: ['Polymorph-controlled crystallisation', 'Granulation', 'Coating'],
    thesis: {
      en: 'The best illustration in the set of a point most screeners get wrong: an ANDA needs the SAME ACTIVE INGREDIENT, and FDA does not read that as the same solid-state form. Polymorph patents are therefore designable-around in principle — but you then own a different dissolution profile, a different stability file, and a fight. High barrier, high legal cost, empty field: interesting, not investable for a first complex-generic programme.',
      zh: '本組最能說明一個多數篩選會弄錯的重點：ANDA 需要「相同的活性成分」，而 FDA 並不將其解讀為相同的固態晶型。因此晶型專利原則上可以迴避設計——但你隨即擁有不同的溶離曲線、不同的安定性檔案，以及一場官司。高門檻、高法律成本、空曠賽道：有趣，但不適合作為第一個複雜學名藥專案。'
    },
    sources: ['Orange Book patent listings — VERIFY', 'FDA ANDA same-active-ingredient policy'],
    confidence: 'medium'
  },

  {
    id: 'palbociclib',
    brand: 'IBRANCE',
    inn: { en: 'Palbociclib', zh: '哌柏西利 Palbociclib' },
    app: 'NDA 207103 (cap) / 212436 (tab)',
    sponsor: 'Pfizer',
    form: { en: 'Capsule and tablet; oral', zh: '膠囊與錠劑；口服' },
    strengths: '75 / 100 / 125 mg',
    modality: 'smallmol',
    usSalesM: 2200,
    salesNote: { en: 'U.S. sales declining; approximate.', zh: '美國銷售下滑中；為估計值。' },
    pathway: 'ANDA',
    entryDate: '2027-03-01',
    entryBasis: {
      en: 'Pfizer obtained a U.S. patent term extension pushing the key patent to March 2027.',
      zh: 'Pfizer 取得美國專利期間延長，將關鍵專利推至 2027 年 3 月。'
    },
    psg: { en: 'PSG available; capsule and tablet have separate reference standards.', zh: '有 PSG；膠囊與錠劑各有不同的 reference standard。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 8,
    legalRisk: 2,
    techBarrier: 2,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 3,
    execRisk: 3,
    competition: 4,
    fitBora: 2,
    unitOps: ['Containment (OEB 4–5 cytotoxic)', 'Capsule filling'],
    thesis: {
      en: 'Entry is close enough that a 2026 start is already late for first-wave economics, and OEB 4–5 containment is a facility decision, not a project decision. If you do not already have the suite, this is a capex conversation disguised as a product conversation.',
      zh: '進場日已近，2026 年才啟動趕不上第一波的經濟效益；而 OEB 4–5 的封閉性是廠房決策而非專案決策。若尚未擁有該產線，這其實是偽裝成產品議題的資本支出議題。'
    },
    sources: ['GEN "Top 20 Drugs Heading for the Patent Cliff, 2026-2029"'],
    confidence: 'medium'
  },

  {
    id: 'sitagliptin',
    brand: 'JANUVIA',
    inn: { en: 'Sitagliptin', zh: '西他列汀 Sitagliptin' },
    app: 'NDA 021995',
    sponsor: 'Merck',
    form: { en: 'Film-coated tablet; oral', zh: '膜衣錠；口服' },
    strengths: '25 / 50 / 100 mg',
    modality: 'smallmol',
    usSalesM: 2255,
    salesNote: { en: 'US$2.255B most recent full year (Fierce Pharma LOE-2026 report).', zh: '最近一個完整年度 22.55 億美元（Fierce Pharma 2026 LOE 專題）。' },
    pathway: 'ANDA',
    entryDate: '2026-05-01',
    entryBasis: {
      en: 'U.S. exclusivity lost May 2026. Three generic sitagliptin products already FDA-approved.',
      zh: '美國專屬權於 2026 年 5 月失效。已有三家學名藥獲 FDA 核准。'
    },
    psg: { en: 'PSG available; straightforward fasting PK BE.', zh: '有 PSG；單純的空腹 PK BE。' },
    teCode: 'AB',
    genericsApproved: 3,
    tentativeApprovals: 12,
    legalRisk: 1,
    techBarrier: 1,
    apiAvail: 1,
    peptideRepro: 1,
    rdDifficulty: 1,
    execRisk: 1,
    competition: 5,
    fitBora: 1,
    unitOps: ['Roller compaction / wet granulation', 'Compression', 'Film coating'],
    thesis: {
      en: 'Already gone. Included deliberately as a negative control: a screener that only reads "big sales, patent expiring" would surface this at the top, and it is the single worst thing you could start in 2026.',
      zh: '已經結束了。刻意納入作為負對照：只讀「銷售大、專利要到期」的篩選會把它排在最前面，而它恰恰是 2026 年最不該啟動的專案。'
    },
    sources: ['Fierce Pharma, "The top 10 drugs losing US exclusivity in 2026"'],
    confidence: 'high'
  },

  {
    id: 'sitagliptin-metformin',
    brand: 'JANUMET / JANUMET XR',
    inn: { en: 'Sitagliptin + metformin HCl', zh: '西他列汀＋二甲雙胍' },
    app: 'NDA 022044 / 023141',
    sponsor: 'Merck',
    form: { en: 'Film-coated tablet / ER tablet; oral', zh: '膜衣錠／持續釋放錠；口服' },
    strengths: '50/500, 50/1000 mg (+XR)',
    modality: 'smallmol',
    usSalesM: 1433,
    salesNote: { en: 'US$1.433B combined most recent full year.', zh: '最近一個完整年度合計 14.33 億美元。' },
    pathway: 'ANDA',
    entryDate: '2026-07-01',
    entryBasis: { en: 'Janumet LOE May 2026; Janumet XR follows July 2026.', zh: 'Janumet 於 2026 年 5 月失效；Janumet XR 隨後於 7 月。' },
    psg: { en: 'PSG available; the XR form requires ER dissolution profile comparison.', zh: '有 PSG；XR 劑型需做持續釋放溶離曲線比較。' },
    teCode: 'AB',
    genericsApproved: 0,
    tentativeApprovals: 10,
    legalRisk: 1,
    techBarrier: 2,
    apiAvail: 1,
    peptideRepro: 1,
    rdDifficulty: 2,
    execRisk: 2,
    competition: 5,
    fitBora: 2,
    unitOps: ['High-dose metformin granulation', 'ER matrix', 'Compression'],
    thesis: {
      en: 'The XR line is marginally more interesting than the IR line — a 1000 mg metformin ER matrix is a real granulation and compaction problem — but it arrives into the same 2026 erosion curve as the parent.',
      zh: 'XR 產品線比 IR 稍有意思——1000 mg metformin 持續釋放基質是真正的造粒與壓縮課題——但它進入的是與母品同一條 2026 年的侵蝕曲線。'
    },
    sources: ['Fierce Pharma, "The top 10 drugs losing US exclusivity in 2026"'],
    confidence: 'high'
  },

  {
    id: 'tofacitinib',
    brand: 'XELJANZ / XELJANZ XR',
    inn: { en: 'Tofacitinib citrate', zh: '托法替尼 Tofacitinib' },
    app: 'NDA 203214 / 208246',
    sponsor: 'Pfizer',
    form: { en: 'Film-coated tablet / ER osmotic tablet; oral', zh: '膜衣錠／滲透壓型持續釋放錠；口服' },
    strengths: '5 / 10 / 11 / 22 mg',
    modality: 'smallmol',
    usSalesM: 1618,
    salesNote: { en: 'US$1.618B most recent full year.', zh: '最近一個完整年度 16.18 億美元。' },
    pathway: 'ANDA',
    entryDate: '2025-08-01',
    entryBasis: { en: 'First generic approved August 2025; full penetration expected through 2026.', zh: '首家學名藥於 2025 年 8 月核准；預期 2026 年內完全滲透。' },
    psg: { en: 'IR straightforward. XR is a laser-drilled osmotic tablet — a genuinely hard, capital-specific process.', zh: 'IR 單純。XR 為雷射鑽孔滲透壓錠——是真正困難且需特定設備的製程。' },
    teCode: 'AB',
    genericsApproved: 1,
    tentativeApprovals: 9,
    legalRisk: 1,
    techBarrier: 4,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 5,
    execRisk: 4,
    competition: 4,
    fitBora: 2,
    unitOps: ['Osmotic core', 'Semipermeable membrane coating', 'Laser drilling'],
    thesis: {
      en: 'The XR osmotic tablet is the interesting half: a semipermeable-membrane coat plus laser-drilled orifice is a barrier most filers will not clear, and the IR generics do not substitute for it. But the window opened in 2025 — the barrier is real and the timing is not.',
      zh: '有意思的是 XR 這一半：半透膜包衣加雷射鑽孔是多數申請者跨不過的門檻，且 IR 學名藥無法替代它。但窗口已在 2025 年開啟——門檻是真的，時機不是。'
    },
    sources: ['Fierce Pharma, "The top 10 drugs losing US exclusivity in 2026"'],
    confidence: 'high'
  },

  {
    id: 'dexlansoprazole',
    brand: 'DEXILANT',
    inn: { en: 'Dexlansoprazole', zh: '右旋蘭索拉唑 Dexlansoprazole' },
    app: 'NDA 022287',
    sponsor: 'Takeda',
    form: { en: 'Delayed-release capsule (dual pulse); oral', zh: '延遲釋放膠囊（雙脈衝）；口服' },
    strengths: '30 / 60 mg',
    modality: 'smallmol',
    usSalesM: 250,
    salesNote: { en: 'Heavily eroded; multiple ANDAs on market.', zh: '已大幅侵蝕；市場上有多家 ANDA。' },
    pathway: 'ANDA',
    entryDate: '2022-01-01',
    entryBasis: { en: 'Already multi-source.', zh: '已為多來源市場。' },
    psg: {
      en: 'Draft PSG rec. Jun 2011, rev. Oct 2016 / Feb 2018. Three BE studies at 60 mg (fasting, fed, sprinkle-in-applesauce); 30 mg waiver; Apparatus I 100 rpm profiles at pH 4.5/6.0/6.8 and water; NG-tube 16 Fr testing.',
      zh: 'PSG 草案 2011-06 建議，2016-10／2018-02 修訂。60 mg 需三項 BE（空腹、飯後、撒於蘋果泥）；30 mg 可 waiver；Apparatus I 100 rpm 於 pH 4.5/6.0/6.8 與水中做曲線；NG tube 16 French 試驗。'
    },
    teCode: 'AB',
    genericsApproved: 6,
    tentativeApprovals: 0,
    legalRisk: 1,
    techBarrier: 4,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 4,
    execRisk: 4,
    competition: 5,
    fitBora: 3,
    unitOps: ['Enteric pellet coating (Wurster)', 'Dual-population blending', 'Capsule filling'],
    thesis: {
      en: 'The teaching case from the internship curriculum, kept in the set as a benchmark. Technically it is the closest analogue to the recommendation — a Wurster-coated multiparticulate whose difficulty sits in the dissolution profile rather than the PK — but its window closed years ago. Same physics, wrong decade.',
      zh: '實習課程中的教學案例，保留在此作為對照基準。技術上它與最終建議最為接近——同樣是 Wurster 包衣多微粒，難度同樣在溶離曲線而非 PK——但它的窗口早已關閉。相同的物理，錯誤的年代。'
    },
    sources: ['FDA Draft PSG on Dexlansoprazole (revised Feb 2018)', 'Internship deck 5, slide 26'],
    confidence: 'high'
  },

  {
    id: 'cyclosporine-oph',
    brand: 'RESTASIS',
    inn: { en: 'Cyclosporine ophthalmic emulsion', zh: '環孢素眼用乳劑' },
    app: 'NDA 050790',
    sponsor: 'AbbVie / Allergan',
    form: { en: 'Emulsion; ophthalmic', zh: '乳劑；眼用' },
    strengths: '0.05% (0.5 mg/mL)',
    modality: 'complex-oph',
    usSalesM: 400,
    salesNote: { en: 'Heavily eroded post-2022 first generic.', zh: '2022 年首家學名藥後大幅侵蝕。' },
    pathway: 'ANDA',
    entryDate: '2022-02-01',
    entryBasis: { en: 'First generic Mylan/Viatris 2022. Bora/Upsher-Smith approved and launched 2026.', zh: '首家學名藥 Mylan/Viatris 於 2022 年。Bora／Upsher-Smith 於 2026 年核准並上市。' },
    psg: {
      en: '2016 PSG: in vitro option (Q1/Q2 sameness, globule size distribution, viscosity vs shear, drug distribution across phases, IVRT) OR clinical endpoint.',
      zh: '2016 PSG：體外路徑（Q1/Q2 相同、油滴粒徑分佈、剪切下黏度、藥物於各相分佈、IVRT）或臨床終點。'
    },
    teCode: 'AB',
    genericsApproved: 8,
    tentativeApprovals: 0,
    legalRisk: 1,
    techBarrier: 5,
    apiAvail: 3,
    peptideRepro: 1,
    rdDifficulty: 5,
    execRisk: 4,
    competition: 5,
    fitBora: 5,
    unitOps: ['High-shear homogenisation', 'Sterile filtration', 'Aseptic fill', 'CCI'],
    thesis: {
      en: 'My own evaluation case from this internship, and Bora/Upsher-Smith launched it in 2026. Kept in the set because it is the structural template for the recommendation: a complex generic where FDA accepts in vitro sameness in place of a clinical trial, and where the moat is analytical rather than legal. Linaclotide is the same trade, seven years earlier in its life cycle.',
      zh: '這是我在本次實習中自己做的評估案例，而 Bora／Upsher-Smith 已於 2026 年上市。保留在此，是因為它正是最終建議的結構原型：一個 FDA 接受以體外相同性取代臨床試驗的複雜學名藥，其護城河來自分析能力而非法律。Linaclotide 是同一筆交易，只是在生命週期上早了七年。'
    },
    sources: ['restasis_final.pptx (own work, Jul 2026)', 'FDA PSG cyclosporine ophthalmic emulsion (2016)'],
    confidence: 'high'
  },

  {
    id: 'enzalutamide',
    brand: 'XTANDI',
    inn: { en: 'Enzalutamide', zh: '恩雜魯胺 Enzalutamide' },
    app: 'NDA 203415 / 213674',
    sponsor: 'Astellas / Pfizer',
    form: { en: 'Soft-gel capsule and tablet; oral', zh: '軟膠囊與錠劑；口服' },
    strengths: '40 / 80 mg',
    modality: 'smallmol',
    usSalesM: 2400,
    salesNote: { en: 'U.S. sales approximate.', zh: '美國銷售為估計值。' },
    pathway: 'ANDA',
    entryDate: '2027-08-01',
    entryBasis: { en: 'Key patent expiry reported 2027, LOE effect 2028.', zh: '關鍵專利報導於 2027 年到期，LOE 效應於 2028 年。' },
    psg: { en: 'PSG available. Soft-gel and tablet are separate reference standards.', zh: '有 PSG。軟膠囊與錠劑為不同的 reference standard。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 7,
    legalRisk: 3,
    techBarrier: 3,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 3,
    execRisk: 3,
    competition: 4,
    fitBora: 2,
    unitOps: ['Lipid softgel encapsulation', 'Hormonal containment'],
    thesis: {
      en: 'Softgel encapsulation is genuinely specialised capacity, but it is capacity you either have or must buy, and hormonal containment adds a second facility constraint on top.',
      zh: '軟膠囊填充確實是特殊產能，但那是「你有或必須買」的產能，而荷爾蒙類封閉性又在其上疊加第二層廠房限制。'
    },
    sources: ['BioSpace patent-cliff coverage — SECONDARY'],
    confidence: 'medium'
  },

  {
    id: 'valbenazine',
    brand: 'INGREZZA',
    inn: { en: 'Valbenazine tosylate', zh: '纈苯那嗪 Valbenazine' },
    app: 'NDA 209241',
    sponsor: 'Neurocrine',
    form: { en: 'Capsule; oral', zh: '膠囊；口服' },
    strengths: '40 / 60 / 80 mg',
    modality: 'smallmol',
    usSalesM: 2400,
    salesNote: { en: 'U.S. only product; sales approximate.', zh: '僅在美國銷售；數字為估計值。' },
    pathway: 'ANDA',
    entryDate: '2031-01-01',
    entryBasis: { en: 'Patent estate reported to run into the early 2030s. VERIFY.', zh: '專利組合報導可延續至 2030 年代初。請查證。' },
    psg: { en: 'PSG available.', zh: '有 PSG。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 2,
    legalRisk: 3,
    techBarrier: 2,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 2,
    execRisk: 2,
    competition: 2,
    fitBora: 3,
    unitOps: ['Blending', 'Capsule filling'],
    thesis: {
      en: 'Uncrowded and comfortably distant, which is the problem: a 2031 entry started in 2026 spends five years of working capital before the first dollar, and the patent estate has five more years in which to grow.',
      zh: '賽道不擁擠、時間也充裕，而這正是問題：2031 年進場、2026 年啟動，代表在第一塊錢之前要先投入五年營運資金，而對方的專利組合也還有五年可以繼續長大。'
    },
    sources: ['Secondary patent trackers — VERIFY'],
    confidence: 'medium'
  },

  {
    id: 'semaglutide-oral',
    brand: 'RYBELSUS / OZEMPIC',
    inn: { en: 'Semaglutide', zh: '司美格魯肽 Semaglutide' },
    app: 'NDA 213051 (oral) / 209637 (inj)',
    sponsor: 'Novo Nordisk',
    form: { en: 'Tablet (oral) / solution (SC injection)', zh: '錠劑（口服）／注射液（皮下）' },
    strengths: '3 / 7 / 14 mg oral',
    modality: 'peptide-smallmol',
    usSalesM: 12000,
    salesNote: { en: 'Franchise-level figure; U.S. share approximate.', zh: '為整個產品家族層級數字；美國佔比為估計值。' },
    pathway: 'ANDA',
    entryDate: '2031-01-01',
    entryBasis: {
      en: 'U.S. compound patent to 2031. Note: several ex-U.S. markets (Canada, India, Brazil, China) lose protection in 2026 — a different clock entirely.',
      zh: '美國化合物專利至 2031 年。注意：加拿大、印度、巴西、中國等數個非美市場於 2026 年即失去保護——完全是另一個時鐘。'
    },
    psg: { en: 'Peptide — API sameness by physicochemical + biological characterisation, as with linaclotide.', zh: '胜肽——與 linaclotide 同樣以理化與生物特性鑑定證明 API sameness。' },
    teCode: 'n/a',
    genericsApproved: 0,
    tentativeApprovals: 0,
    legalRisk: 5,
    techBarrier: 5,
    apiAvail: 5,
    peptideRepro: 5,
    rdDifficulty: 5,
    execRisk: 5,
    competition: 3,
    fitBora: 2,
    unitOps: ['Peptide API supply', 'SNAC permeation enhancer', 'Aseptic fill (inj)'],
    thesis: {
      en: 'Carried in the set for one reason: semaglutide is a PEPTIDE approved under an NDA, so its copies are ANDAs under 505(j) — not 351(k) biosimilars. Molecule size does not decide the pathway; the statute the original was approved under does. Getting that wrong is the single most expensive framing error available in this table.',
      zh: '納入本組只為一個理由：semaglutide 是以 NDA 核准的「胜肽」，因此其學名藥走 505(j) ANDA，而非 351(k) 生物相似性藥品。決定路徑的不是分子大小，而是原開發藥當初依哪一部法律核准。搞錯這件事，是本表中代價最高的一種認知錯誤。'
    },
    sources: ['FDA peptide ANDA guidance', 'Novo Nordisk filings — VERIFY'],
    confidence: 'medium'
  },

  {
    id: 'pembrolizumab',
    brand: 'KEYTRUDA',
    inn: { en: 'Pembrolizumab', zh: '派姆單抗 Pembrolizumab' },
    app: 'BLA 125514',
    sponsor: 'Merck',
    form: { en: 'Solution for IV infusion / SC', zh: '靜脈輸注液／皮下注射' },
    strengths: '100 mg/4 mL',
    modality: 'biologic',
    usSalesM: 16000,
    salesNote: { en: 'Global ~US$29.5B (2023); U.S. share approximate.', zh: '全球約 295 億美元（2023）；美國佔比為估計值。' },
    pathway: '351(k)',
    entryDate: '2028-12-01',
    entryBasis: {
      en: 'U.S. compound patent expires December 2028; IRA pricing begins to bite January 2028. 12-year BLA reference-product exclusivity long since run.',
      zh: '美國化合物專利於 2028 年 12 月到期；IRA 定價自 2028 年 1 月起發生作用。BLA 的 12 年參考產品專屬權早已屆滿。'
    },
    psg: { en: 'Not applicable — biosimilars follow 351(k): analytical similarity, PK similarity, and a comparative clinical study, not a PSG.', zh: '不適用——生物相似性藥品走 351(k)：分析相似性、PK 相似性與比較性臨床試驗，而非 PSG。' },
    teCode: 'Interchangeability requires separate designation',
    genericsApproved: 0,
    tentativeApprovals: 0,
    legalRisk: 4,
    techBarrier: 5,
    apiAvail: 5,
    peptideRepro: 5,
    rdDifficulty: 5,
    execRisk: 5,
    competition: 4,
    fitBora: 1,
    unitOps: ['Mammalian cell culture', 'Purification', 'Aseptic fill-finish'],
    thesis: {
      en: 'The branch marker. Everything else in this table is decided in the Orange Book; this one is decided in the Purple Book. A screener that cannot tell those two apart will confidently recommend an ANDA for a monoclonal antibody.',
      zh: '路徑分岔的標記。表中其他所有品項都在 Orange Book 裡決定，只有這一項在 Purple Book 裡決定。分不清這兩本書的篩選系統，會自信地為單株抗體推薦 ANDA。'
    },
    sources: ['Merck FY2025 guidance commentary', 'GEN patent-cliff report'],
    confidence: 'medium'
  },

  {
    id: 'deutetrabenazine',
    brand: 'AUSTEDO / AUSTEDO XR',
    inn: { en: 'Deutetrabenazine', zh: '氘丁苯那嗪 Deutetrabenazine' },
    app: 'NDA 208082 / 215422',
    sponsor: 'Teva',
    form: { en: 'Coated tablet / ER tablet; oral', zh: '包衣錠／持續釋放錠；口服' },
    strengths: '6 / 9 / 12 mg (+XR)',
    modality: 'smallmol',
    usSalesM: 1900,
    salesNote: { en: 'U.S. sales approximate, growing.', zh: '美國銷售為估計值，成長中。' },
    pathway: 'ANDA',
    entryDate: '2033-01-01',
    entryBasis: { en: 'Deuterium-substitution patents reported into the early 2030s.', zh: '氘取代相關專利報導可至 2030 年代初。' },
    psg: { en: 'PSG available; deuterated analogue raises API characterisation questions.', zh: '有 PSG；氘化類似物在 API 鑑定上帶來額外問題。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 0,
    legalRisk: 3,
    techBarrier: 3,
    apiAvail: 3,
    peptideRepro: 1,
    rdDifficulty: 3,
    execRisk: 3,
    competition: 1,
    fitBora: 2,
    unitOps: ['Coating', 'ER matrix', 'Compression'],
    thesis: {
      en: 'Too far out to plan around. Included to show what "no competition" looks like when it is simply a synonym for "no window yet".',
      zh: '太遠，無法據以規劃。納入此列是為了展示：所謂「沒有競爭」，有時只是「窗口還沒開」的同義詞。'
    },
    sources: ['Secondary patent trackers — VERIFY'],
    confidence: 'medium'
  },

  {
    id: 'ozanimod',
    brand: 'ZEPOSIA',
    inn: { en: 'Ozanimod', zh: '奧扎莫德 Ozanimod' },
    app: 'NDA 209899',
    sponsor: 'Bristol Myers Squibb',
    form: { en: 'Capsule; oral', zh: '膠囊；口服' },
    strengths: '0.23 / 0.46 / 0.92 mg',
    modality: 'smallmol',
    usSalesM: 550,
    salesNote: { en: 'U.S. sales approximate.', zh: '美國銷售為估計值。' },
    pathway: 'ANDA',
    entryDate: '2029-06-01',
    entryBasis: { en: 'Reported LOE window 2029–2031. VERIFY.', zh: '報導的 LOE 區間為 2029–2031。請查證。' },
    psg: { en: 'PSG available; titration pack presentation complicates packaging design.', zh: '有 PSG；起始劑量套組的呈現方式使包裝設計更複雜。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 1,
    legalRisk: 3,
    techBarrier: 3,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 3,
    execRisk: 2,
    competition: 2,
    fitBora: 3,
    unitOps: ['Low-dose blending', 'Capsule filling', 'Titration blister'],
    thesis: {
      en: 'Sub-milligram dosing makes content uniformity the governing CQA, which is the same physics as the recommendation — but the market is a fifth the size and the entry date is softer.',
      zh: '次毫克劑量使含量均勻度成為主導 CQA，物理上與最終建議相同——但市場只有五分之一大，進場日也較不確定。'
    },
    sources: ['Secondary patent trackers — VERIFY'],
    confidence: 'medium'
  },

  {
    id: 'upadacitinib',
    brand: 'RINVOQ',
    inn: { en: 'Upadacitinib', zh: '烏帕替尼 Upadacitinib' },
    app: 'NDA 211675',
    sponsor: 'AbbVie',
    form: { en: 'Extended-release tablet; oral', zh: '持續釋放錠；口服' },
    strengths: '15 / 30 / 45 mg',
    modality: 'smallmol',
    usSalesM: 5000,
    salesNote: { en: 'U.S. sales approximate, growing fast.', zh: '美國銷售為估計值，快速成長中。' },
    pathway: 'ANDA',
    entryDate: '2033-01-01',
    entryBasis: { en: 'Patent estate reported into the 2030s.', zh: '專利組合報導可延至 2030 年代。' },
    psg: { en: 'PSG available; ER matrix requires multi-medium profile comparison.', zh: '有 PSG；ER 基質需多介質溶離曲線比較。' },
    teCode: 'AB (expected)',
    genericsApproved: 0,
    tentativeApprovals: 0,
    legalRisk: 4,
    techBarrier: 3,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 3,
    execRisk: 3,
    competition: 1,
    fitBora: 2,
    unitOps: ['ER matrix granulation', 'Compression', 'Film coating'],
    thesis: {
      en: 'Large and growing, but the clock has not started. Watchlist, not pipeline.',
      zh: '規模大且仍在成長，但時鐘尚未啟動。屬於觀察名單，不是產品線。'
    },
    sources: ['Secondary patent trackers — VERIFY'],
    confidence: 'medium'
  },

  {
    id: 'vigabatrin-sol',
    brand: 'VIGAFYDE',
    inn: { en: 'Vigabatrin oral solution', zh: '氨己烯酸口服液' },
    app: 'NDA 217684',
    sponsor: 'Pyros Pharmaceuticals',
    form: { en: 'Solution; oral', zh: '溶液；口服' },
    strengths: '100 mg/mL',
    modality: 'smallmol',
    usSalesM: 60,
    salesNote: { en: 'Small orphan-adjacent market.', zh: '接近孤兒藥的小型市場。' },
    pathway: '505(b)(2)',
    entryDate: '2030-01-01',
    entryBasis: {
      en: 'Approved via 505(b)(2) as a ready-to-use solution referencing SABRIL. Carries new-product exclusivity plus a REMS.',
      zh: '以 505(b)(2) 參考 SABRIL 核准為即用型溶液。附帶新產品專屬權與 REMS。'
    },
    psg: { en: 'The instructive point is the reverse direction: this product IS the 505(b)(2), showing how a dosage-form change creates its own exclusivity rather than attacking someone else\'s.', zh: '有啟發性的是反方向：這個產品「本身就是」505(b)(2)，展示了劑型改變如何為自己創造專屬權，而不是去攻擊別人的。' },
    teCode: 'n/a',
    genericsApproved: 0,
    tentativeApprovals: 0,
    legalRisk: 2,
    techBarrier: 2,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 2,
    execRisk: 2,
    competition: 1,
    fitBora: 4,
    unitOps: ['Solution compounding', 'Filtration', 'Bottle filling'],
    thesis: {
      en: 'From my internship homework set (deck 5, slide 28). The strategic lesson is that a ready-to-use paediatric solution referencing an existing tablet is a 505(b)(2), earns 3-year NCI exclusivity of its own, and requires no BE against a competitor at all. Small revenue, but it is the template for building exclusivity rather than waiting for someone else\'s to lapse.',
      zh: '出自我的實習作業組（第 5 份簡報，第 28 頁）。策略上的啟發是：以現有錠劑為參考、開發即用型兒科溶液屬於 505(b)(2)，可自行取得 3 年 NCI 專屬權，且完全不需與競爭者做 BE。營收不大，但這是「自己建立專屬權」而非「等別人的專屬權失效」的範本。'
    },
    sources: ['Internship deck 5, slide 28 (homework set)', 'Drugs@FDA NDA 217684'],
    confidence: 'medium'
  },

  {
    id: 'megestrol-susp',
    brand: 'MEGACE ES',
    inn: { en: 'Megestrol acetate oral suspension', zh: '甲地孕酮口服懸液' },
    app: 'NDA 021778',
    sponsor: 'Endo / Par',
    form: { en: 'Suspension (nanocrystal); oral', zh: '懸液（奈米結晶）；口服' },
    strengths: '625 mg/5 mL',
    modality: 'complex-oral',
    usSalesM: 80,
    salesNote: { en: 'Small, multi-source.', zh: '市場小，已多來源。' },
    pathway: 'ANDA',
    entryDate: '2015-01-01',
    entryBasis: { en: 'Long multi-source.', zh: '早已多來源。' },
    psg: {
      en: 'A nanocrystal suspension: BE depends on particle size distribution, redispersibility and settling volume as much as on PK. Fed-state effects are pronounced.',
      zh: '奈米結晶懸液：BE 取決於粒徑分佈、再分散性與沉降體積，其重要性不亞於 PK。飯後效應明顯。'
    },
    teCode: 'AB',
    genericsApproved: 4,
    tentativeApprovals: 0,
    legalRisk: 1,
    techBarrier: 4,
    apiAvail: 2,
    peptideRepro: 1,
    rdDifficulty: 4,
    execRisk: 3,
    competition: 4,
    fitBora: 3,
    unitOps: ['Wet media milling', 'Homogenisation', 'Suspension filling'],
    thesis: {
      en: 'From the same homework set. Retained as the suspension counterpart to Restasis: another complex generic where the difficulty is physical (PSD, redispersibility, sedimentation volume) rather than pharmacological.',
      zh: '同一組作業中的品項。保留作為 Restasis 的懸液對照：另一個難度在物理（粒徑分佈、再分散性、沉降體積）而非藥理的複雜學名藥。'
    },
    sources: ['Internship deck 5, slide 28 (homework set)'],
    confidence: 'medium'
  }
];

/* --------------------------------------------------------------------------
   Scoring model
   --------------------------------------------------------------------------
   The deliberate design choice here is that technical difficulty enters the
   score TWICE, with opposite signs:

     + techBarrier  — difficulty deters competitors and protects price
     - execRisk     — difficulty may also mean we cannot deliver it

   Screeners that collapse these into one "complexity" number will always
   produce a portfolio of either commodity tablets or undeliverable ambitions.

   Timing is scored as a window, not a date. A programme needs roughly 36–48
   months from start to approval for a complex generic; entering more than
   ~7 years out means financing dead capital, and entering less than ~24 months
   out means arriving after the first wave has taken the price down.
   ------------------------------------------------------------------------ */

function timingScore(entryDate, today) {
  const months = (new Date(entryDate) - today) / (1000 * 60 * 60 * 24 * 30.44);
  if (months <= 0) return 0;            // window already open — first wave gone
  if (months < 18) return 0.15;         // cannot finish development in time
  if (months < 30) return 0.55;         // very tight for a complex generic
  if (months <= 60) return 1.0;         // the sweet spot: 2.5–5 years out
  if (months <= 84) return 0.7;         // financeable but capital sits idle
  if (months <= 120) return 0.35;
  return 0.12;
}

function marketScore(usSalesM) {
  // log-scaled: the difference between $80M and $800M matters far more than
  // the difference between $9B and $16B, because a CDMO cannot capture the top.
  return Math.min(1, Math.log10(Math.max(usSalesM, 10) / 10) / 3);
}

const DEFAULT_WEIGHTS = {
  market: 20,
  timing: 25,
  legal: 15,
  apiAvail: 7,
  peptideRepro: 7,
  rdDifficulty: 6,
  exec: 10,
  competition: 20,
  fit: 15
};

function scoreMolecule(m, w, today) {
  const parts = {
    market:       marketScore(m.usSalesM),
    timing:       timingScore(m.entryDate, today),
    legal:        (5 - m.legalRisk) / 4,
    // the old single "barrier" weight, split into the three specific factors
    // an intern actually has to weigh: can we even get the API, can we match
    // the molecule itself, and is the R&D genuinely hard. All three keep the
    // original barrier philosophy — difficulty is scored positively, because
    // it is what keeps rivals out.
    apiAvail:     (m.apiAvail - 1) / 4,
    peptideRepro: (m.peptideRepro - 1) / 4,
    rdDifficulty: (m.rdDifficulty - 1) / 4,
    exec:         (5 - m.execRisk) / 4,
    competition:  (5 - m.competition) / 4,
    fit:          (m.fitBora - 1) / 4
  };
  let total = 0, wsum = 0;
  for (const k in parts) { total += parts[k] * (w[k] || 0); wsum += (w[k] || 0); }
  return { score: wsum ? (total / wsum) * 100 : 0, parts };
}
