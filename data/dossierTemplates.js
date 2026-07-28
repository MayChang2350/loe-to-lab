/* ============================================================================
   dossierTemplates.js — generated Dossier content for the 20 products that
   are NOT the flagship linaclotide deep-dive.
   ----------------------------------------------------------------------------
   HONESTY NOTE, stated once and meant seriously, matching the convention set
   in dosageforms.js for drug appearance:

   The linaclotide Dossier (data/deepdive.js) is hand-researched: every QTPP
   target, CQA driver, and analytical method was built from the FDA label,
   the product-specific guidance, and standard unit-operation practice for
   THAT molecule. Doing that for all 21 products is a multi-week research
   project on its own, which this internship-length build cannot honestly
   claim to have done.

   What this file does instead: it takes the fields that WERE verified for
   every product in the Screener (pathway, PSG text, entry timing, unit
   operations, sources) and arranges them into the same dossier shape, using
   GENERIC quality-by-design patterns for each unit operation and dosage
   form rather than invented, molecule-specific numbers. Every generated
   section says so explicitly and points back to the linaclotide dossier as
   the worked example of what full-depth technical work looks like.
   ========================================================================== */

/* ---------- generic CQA templates, keyed by a keyword found in unitOps ---- */
const OP_CQA = [
  { key: /wurster|drug.layer|coating|enteric pellet/i,
    cqa: { en: 'Coat/layer uniformity', zh: '包覆／層積均勻度' },
    driver: { en: 'Spray-zone residence time distribution, bed circulation rate, number of passes through the spray zone', zh: '噴霧區停留時間分佈、物料床循環速率、通過噴霧區次數' },
    control: { en: 'Fix the number of coating passes rather than coating time; uniformity improves roughly as 1/√N with N passes.', zh: '固定通過次數而非包衣時間；均勻度大致隨通過次數 N 以 1/√N 改善。' },
    ipc: { en: 'Stratified sampling through the coating run; assay at 25/50/75/100% of spray solution applied', zh: '包衣過程中分層取樣；於噴液施用 25/50/75/100% 時分析含量' } },
  { key: /granulation|blend/i,
    cqa: { en: 'Blend / granule uniformity', zh: '混合／顆粒均勻度' },
    driver: { en: 'Mix time, powder flow, particle size mismatch between API and excipients, segregation potential', zh: '混合時間、粉體流動性、API 與賦形劑粒徑落差、分層風險' },
    control: { en: 'Set mix time and speed from a blend-uniformity study, not from a fixed recipe; verify a stable RSD plateau before moving on.', zh: '混合時間與速度依混合均勻度研究訂定，而非固定配方；確認 RSD 進入穩定平原後才前進下一步。' },
    ipc: { en: 'Stratified blend sampling (top/middle/bottom); RSD acceptance before granulation or compression', zh: '分層取樣（上／中／下）；進入製粒或壓錠前的 RSD 接受標準' } },
  { key: /compression|direct compression|roller compaction/i,
    cqa: { en: 'Tablet strength / disintegration', zh: '錠劑強度／崩解' },
    driver: { en: 'Main compression force, dwell time, granule compactibility, lubricant level', zh: '主壓力、停留時間、顆粒可壓縮性、潤滑劑用量' },
    control: { en: 'Map tensile strength and disintegration across the compression-force range to find the usable operating window, with capping risk as the upper bound.', zh: '在壓力範圍內描繪抗張強度與崩解，找出可用操作窗口，並以 capping 風險作為上限。' },
    ipc: { en: 'In-line weight/hardness checks; periodic disintegration and friability', zh: '線上重量／硬度檢測；定期崩解與脆度試驗' } },
  { key: /aseptic|sterile|fill.finish/i,
    cqa: { en: 'Sterility assurance / container closure integrity', zh: '無菌保證／容器封閉完整性' },
    driver: { en: 'Bioburden into the sterilizing filter, fill-line environmental control, stopper/seal integrity', zh: '進入滅菌過濾器前的生物負荷、充填線環境管制、栓塞／封蓋完整性' },
    control: { en: 'Media fill qualification of the fill line; environmental monitoring at grade A/B; validated CCIT method.', zh: '充填線的模擬培養基填充驗證；A/B 級環境監測；經驗證的 CCIT 方法。' },
    ipc: { en: 'Bioburden pre-filtration; filter integrity (bubble point); 100% visual inspection', zh: '過濾前生物負荷；濾器完整性（起泡點）試驗；100% 目視檢查' } },
  { key: /homogenis|emulsion/i,
    cqa: { en: 'Droplet / particle size and stability', zh: '液滴／粒徑與安定性' },
    driver: { en: 'Homogenising pressure/energy, surfactant coverage, number of passes', zh: '均質壓力／能量、界面活性劑覆蓋率、通過次數' },
    control: { en: 'Ensure surfactant is not the limiting reagent — below a coverage floor, droplets recoalesce regardless of energy input.', zh: '確保界面活性劑不是限制因子——低於覆蓋率下限時，無論輸入多少能量，液滴都會再合併。' },
    ipc: { en: 'Laser diffraction particle size (d10/d50/d90); creaming/phase-separation check on stability', zh: '雷射繞射粒徑分析（d10/d50/d90）；安定性試驗中檢查乳析／分層' } },
  { key: /milling/i,
    cqa: { en: 'Particle size distribution', zh: '粒徑分佈' },
    driver: { en: 'Mill energy input, feed rate, screen/gap size, residence time', zh: '研磨機能量輸入、進料速率、篩網／間隙尺寸、停留時間' },
    control: { en: 'Both tails of the distribution matter — fines drive dissolution and content-uniformity risk, oversize drives dose-form performance risk.', zh: '分佈兩端都重要——細粉影響溶離與含量均勻度風險，過粗影響劑型性能風險。' },
    ipc: { en: 'Laser diffraction or sieve analysis at discharge', zh: '出料時雷射繞射或篩分分析' } },
  { key: /crystallis/i,
    cqa: { en: 'Polymorphic form / crystal habit', zh: '多晶型／晶癖' },
    driver: { en: 'Cooling/anti-solvent addition rate, seeding, supersaturation control', zh: '降溫／反溶劑添加速率、晶種投入、過飽和度控制' },
    control: { en: 'Seed deliberately and control supersaturation; an uncontrolled crystallisation can deliver the wrong polymorph with a different dissolution and stability profile even at identical chemical purity.', zh: '刻意投入晶種並控制過飽和度；未受控的結晶即使化學純度相同，也可能得到晶型不同、溶離與安定性表現不同的產物。' },
    ipc: { en: 'XRPD / DSC on isolated solid at each batch', zh: '每批分離固體皆做 XRPD／DSC' } },
  { key: /cell culture|purification|mammalian/i,
    cqa: { en: 'Product-related and process-related impurities', zh: '產品相關與製程相關雜質' },
    driver: { en: 'Cell culture conditions, harvest timing, purification train recovery and clearance', zh: '細胞培養條件、收穫時機、純化製程回收率與清除能力' },
    control: { en: 'Characterise charge variants, aggregates and host-cell protein/DNA clearance across the purification train; comparability to the reference product is analytical, not just clinical.', zh: '在純化製程中鑑定電荷變異體、聚集體與宿主細胞蛋白／DNA 清除；與參考產品的可比性屬分析層次，不只是臨床層次。' },
    ipc: { en: 'SEC/CEX for aggregates and charge variants; HCP/DNA ELISA at each purification step', zh: '每個純化步驟以 SEC/CEX 檢測聚集體與電荷變異體；HCP/DNA ELISA' } },
  { key: /capsule filling|softgel/i,
    cqa: { en: 'Fill weight / content uniformity', zh: '填充量／含量均勻度' },
    driver: { en: 'Bead/powder flow and bulk density, dosator or tamping-pin settings, hopper level', zh: '微丸／粉體流動性與堆積密度、dosator 或壓塞針設定、料斗料位' },
    control: { en: '100% in-line checkweighing with a reject loop, backed by periodic manual weight checks.', zh: '線上 100% 檢重並設剔除迴路，另加定期人工秤重。' },
    ipc: { en: 'In-line checkweigher; manual n=20 at intervals', zh: '線上檢重機；定期人工 n=20' } },
  { key: /osmotic|semipermeable|laser drill/i,
    cqa: { en: 'Membrane integrity and orifice performance', zh: '膜完整性與孔口性能' },
    driver: { en: 'Membrane coating thickness/permeability, laser-drilled orifice size and position', zh: '膜衣厚度／通透性、雷射鑽孔孔徑與位置' },
    control: { en: 'Release rate is set by the membrane and orifice, not by the core — control both independently and verify zero-order release is actually achieved.', zh: '釋放速率由膜與孔口決定，而非核心——需分別管制兩者，並驗證確實達到零級釋放。' },
    ipc: { en: 'Orifice diameter inspection; drug release profile at multiple time points', zh: '孔口直徑檢查；多時間點藥物釋放曲線' } },
  { key: /containment|cytotoxic|hormonal/i,
    cqa: { en: 'Operator exposure / cross-contamination control', zh: '操作者暴露／交叉污染管制' },
    driver: { en: 'Potent-compound handling category, containment equipment performance, cleaning validation', zh: '高活性化合物分級、圍堵設備效能、清潔驗證' },
    control: { en: 'Containment is a CQA of the manufacturing system, not the product, but a cleaning-validation failure becomes a product cross-contamination CQA immediately.', zh: '圍堵本身是製造系統的 CQA 而非產品的，但清潔驗證一旦失敗，會立即變成產品交叉污染的 CQA。' },
    ipc: { en: 'Surface swab / airborne exposure monitoring; cleaning validation swab and rinse limits', zh: '表面擦拭／空氣暴露監測；清潔驗證擦拭與沖淋限值' } }
];
const OP_CQA_DEFAULT = {
  cqa: { en: 'Process consistency', zh: '製程一致性' },
  driver: { en: 'Equipment settings, in-process material attributes, operator technique', zh: '設備設定、製程中物料屬性、操作技術' },
  control: { en: 'Define a design space for the operation from development-scale studies before locking commercial-scale parameters.', zh: '在鎖定商業規模參數前，先以開發規模研究定義該操作的設計空間。' },
  ipc: { en: 'In-process sampling per the applicable USP/ICH method for this unit operation', zh: '依適用之 USP／ICH 方法進行製程中取樣' }
};

function cqasForOps(unitOps) {
  const seen = new Set();
  const out = [];
  unitOps.forEach(op => {
    const hit = OP_CQA.find(t => t.key.test(op));
    const entry = hit || OP_CQA_DEFAULT;
    const label = t => t.cqa ? t.cqa.en : t.en;
    if (seen.has(label(entry))) return;
    seen.add(label(entry));
    out.push({ cqa: entry.cqa, sev: hit ? 4 : 3, driver: entry.driver, control: entry.control, ipc: entry.ipc, fromOp: op });
  });
  return out.slice(0, 6);
}

/* ---------- generic analytics package by modality ------------------------- */
const ANALYTICS_BASE = [
  { test: { en: 'Identification', zh: '鑑別' }, method: 'Compendial ID (IR/UV or chromatographic retention match to reference standard)',
    purpose: { en: 'Confirms the active is what the label says it is, against a qualified reference standard.', zh: '對照合格參考標準，確認活性成分與標示相符。' } },
  { test: { en: 'Assay / potency', zh: '含量／效價' }, method: 'Validated HPLC or UPLC assay, or compendial bioassay where the modality requires it',
    purpose: { en: 'Establishes label-claim accuracy and is the anchor method for content-uniformity and stability results.', zh: '確立標示含量的準確性，也是含量均勻度與安定性結果的基準方法。' } },
  { test: { en: 'Related substances / impurities', zh: '有關物質／雑質' }, method: 'Stability-indicating chromatographic method per ICH Q3',
    purpose: { en: 'Every degradation route relevant to this modality (oxidation, hydrolysis, and for peptides/biologics, aggregation and sequence variants) needs its own validated detection.', zh: '此劑型相關的每一條降解途徑（氧化、水解，若為胜肽／生物製劑則含聚集與序列變異體）都需要各自經驗證的檢測方法。' } },
  { test: { en: 'Drug release / dissolution', zh: '藥物釋放／溶離' }, method: 'USP apparatus and media per the product-specific guidance where one exists',
    purpose: { en: 'The PSG for this molecule specifies the apparatus, media and acceptance criteria; the FDA Dissolution Methods database should be checked for the current entry.', zh: '本分子的 PSG 已載明裝置、介質與接受標準；應查閱 FDA Dissolution Methods 資料庫取得現行條目。' } },
  { test: { en: 'Microbial limits / sterility', zh: '微生物限量／無菌' }, method: 'USP <61>/<62> for non-sterile, USP <71> sterility test plus endotoxin for parenteral/ophthalmic',
    purpose: { en: 'Route of administration decides the standard: an injectable or ophthalmic product needs sterility and endotoxin testing that an oral solid does not.', zh: '給藥途徑決定適用標準：注射或眼用產品需要口服固體劑型不需要的無菌與內毒素試驗。' } }
];

/* ---------- generic QTPP rows, generic across dosage forms ----------------- */
function qtppFor(m) {
  return [
    { attr: { en: 'Dosage form and route', zh: '劑型與途徑' }, target: t2(m.form), just: { en: 'Same dosage form and route is the baseline sameness requirement for the pathway this product follows.', zh: '相同劑型與途徑，是本產品所走路徑的基本 sameness 要求。' } },
    { attr: { en: 'Strength(s)', zh: '規格' }, target: { en: m.strengths, zh: m.strengths }, just: { en: 'All marketed strengths are typically needed for formulary parity with the reference product.', zh: '通常需涵蓋所有已上市規格，以與參考產品在處方集上取得對等地位。' } },
    { attr: { en: 'Bioequivalence / comparability route', zh: '生體相等性／可比性路徑' }, target: t2(m.psg), just: { en: 'Taken from the product-specific guidance or, for the biosimilar case, the analytical-first comparability framework.', zh: '取自產品專屬指引，或就生物相似藥而言，取自「分析優先」的可比性框架。' } },
    { attr: { en: 'Drug release / dissolution', zh: '藥物釋放／溶離' }, target: { en: 'Comparable to the reference product across the required media, per the PSG', zh: '依 PSG 於所需介質中與參考產品相當' }, just: { en: 'Generic target — the exact media, timepoints and acceptance criteria must be taken from the current PSG, not assumed.', zh: '通用目標——實際介質、取樣時間點與接受標準須取自現行 PSG，不可假設。' } },
    { attr: { en: 'Impurity profile', zh: '雜質圖譜' }, target: { en: 'Qualified against ICH Q3 thresholds through shelf life', zh: '效期內維持在 ICH Q3 已 qualify 的門檻內' }, just: { en: 'Applies to every modality; the specific degradation pathways to watch depend on the molecule\'s chemistry.', zh: '適用於所有劑型；實際須留意的降解途徑取決於分子本身的化學性質。' } }
  ];
}
function t2(x) { return x; }

/* ---------- generic 4-phase development plan, scaled by pathway ---------- */
const PLAN_MONTHS = {
  'ANDA': [[0, 6], [6, 16], [16, 26], [26, 40]],
  '505(b)(2)': [[0, 8], [8, 22], [22, 34], [34, 48]],
  '351(k)': [[0, 10], [10, 30], [30, 48], [48, 72]]
};
function planFor(m) {
  const mo = PLAN_MONTHS[m.pathway] || PLAN_MONTHS['ANDA'];
  return [
    { phase: { en: 'Phase 0 — Feasibility', zh: '第 0 階段——可行性' }, months: `${mo[0][0]}–${mo[0][1]}`,
      items: {
        en: ['Secure reference-product units across all strengths', 'Confirm the pathway and re-read the current PSG / comparability guidance in full', 'Establish stability-indicating analytical methods before any manufacturing'],
        zh: ['取得涵蓋所有規格的參考產品樣品', '確認法規路徑，並完整重讀現行 PSG／可比性指引', '在任何製造之前先建立安定性指示分析方法']
      },
      gate: { en: 'GATE: is the pathway, PSG and IP position still what the screening snapshot said it was?', zh: '關卡：法規路徑、PSG 與智財狀況是否仍與篩選快照相符？' } },
    { phase: { en: 'Phase 1 — Lab development', zh: '第 1 階段——實驗室開發' }, months: `${mo[1][0]}–${mo[1][1]}`,
      items: {
        en: ['Lab-scale trials on the listed unit operations, with a DoE on the parameters most likely to drive the CQAs below', 'Comparative testing against the reference product on the release/dissolution and impurity methods'],
        zh: ['對下列各單元操作進行實驗室規模試驗，並對最可能影響下方 CQA 的參數做 DoE', '以釋放／溶離與雜質方法對參考產品進行比較性測試']
      },
      gate: { en: 'GATE: lab-scale product is comparable to the reference product on the CQAs identified.', zh: '關卡：實驗室規模產品在已識別的 CQA 上與參考產品相當。' } },
    { phase: { en: 'Phase 2 — Pilot / scale-up', zh: '第 2 階段——中試／放大' }, months: `${mo[2][0]}–${mo[2][1]}`,
      items: {
        en: ['Pilot batches at meaningful fraction of commercial scale', 'Scale by the operation\'s governing physics (energy/mass per unit, not machine settings), per the unit-op notes below', 'Registration stability under ICH conditions in final pack'],
        zh: ['以具代表性之商業規模比例執行中試批', '依該操作的支配物理量放大（每單位能量／質量，而非機台設定值），見下方單元操作說明', '以最終包裝於 ICH 條件下進行註冊安定性試驗']
      },
      gate: { en: 'GATE: process is reproducible at pilot scale with a data-defined operating window.', zh: '關卡：製程在中試規模可重現，且操作窗口由數據界定。' } },
    { phase: { en: 'Phase 3 — Submission and validation', zh: '第 3 階段——送件與驗證' }, months: `${mo[3][0]}–${mo[3][1]}`,
      items: {
        en: ['Registration batches and PPQ per the applicable validation lifecycle stage', 'Full comparability/BE package assembled and cross-checked against the current guidance', 'Re-verify pathway, patent status and marketing status before filing — these move'],
        zh: ['依適用之驗證生命週期階段執行註冊批與 PPQ', '組建完整可比性／BE 資料包，並對照現行指引逐項核對', '送件前重新確認法規路徑、專利狀態與上市狀態——這些會變動']
      },
      gate: { en: 'GATE: approval held and launch quantities released.', zh: '關卡：取得核准並放行上市數量。' } }
  ];
}

/* ---------- regulatory Q&A, built entirely from already-verified fields --- */
function regulatoryFor(m) {
  return [
    { q: { en: 'Is it approved, and what exactly is approved?', zh: '是否已核准？核准的究竟是什麼？' }, src: 'Drugs@FDA',
      a: { en: `${m.app}, ${en(m.form)}, strengths ${m.strengths}. Sponsor of record: ${m.sponsor}.`, zh: `${m.app}，${zh(m.form)}，規格 ${m.strengths}。原廠：${m.sponsor}。` } },
    { q: { en: 'Who is the reference, and what generic/biosimilar field already exists?', zh: '參考品是誰？目前已存在的學名藥／生物相似藥情況為何？' }, src: 'Orange Book / Purple Book',
      a: { en: `${m.brand} is the reference product. ${m.genericsApproved} approved competitor(s) and ${m.tentativeApprovals} tentative approval(s) on file as of the screening snapshot; TE code ${m.teCode}.`, zh: `${m.brand} 為參考產品。截至篩選快照為止，已有 ${m.genericsApproved} 件核准競品與 ${m.tentativeApprovals} 件暫時性核准；TE code ${m.teCode}。` } },
    { q: { en: 'When can we actually enter?', zh: '我們實際上何時能進場？' }, src: 'Orange Book patents / exclusivity, screening snapshot',
      a: m.entryBasis },
    { q: { en: 'What does the agency require us to prove?', zh: '主管機關要求我們證明什麼？' }, src: 'Product-specific / comparability guidance', a: m.psg },
    { q: { en: 'What is the fit and risk for a CDMO taking this on?', zh: '對 CDMO 而言，承接此案的契合度與風險為何？' }, src: 'Internal screening model',
      a: { en: `Technical barrier ${m.techBarrier}/5, execution risk ${m.execRisk}/5, legal risk ${m.legalRisk}/5, competitive field ${m.competition}/5, fit to a Taiwan CDMO's oral-solid/sterile/complex-generic profile ${m.fitBora}/5. ${en(m.thesis)}`, zh: `技術門檻 ${m.techBarrier}/5、執行風險 ${m.execRisk}/5、法律風險 ${m.legalRisk}/5、競爭態勢 ${m.competition}/5，與台灣 CDMO 口服固體／無菌／複雜學名藥能力的契合度 ${m.fitBora}/5。${zh(m.thesis)}` } }
  ];
}
function en(x) { return x.en; }
function zh(x) { return x.zh; }

/* ---------- public entry point --------------------------------------------- */
function generateDossier(m) {
  return {
    templated: true,
    header: { brand: m.brand, inn: m.inn, app: m.app, form: m.form, strengths: m.strengths, sponsor: m.sponsor },
    rationale: {
      en: [
        en(m.thesis),
        `This dossier is a GENERATED FRAMEWORK, not molecule-specific technical research: the regulatory facts above come from the verified screening dataset, but the quality targets, CQAs and analytical plan below use generic quality-by-design patterns for this product's unit operations rather than numbers derived from studying ${m.brand} itself. See the linaclotide dossier for what full-depth, molecule-specific technical work looks like.`
      ],
      zh: [
        zh(m.thesis),
        `本頁為「生成式框架」，而非針對此分子的技術研究：以上法規事實取自已核實的篩選資料集，但以下品質目標、CQA 與分析計畫，是依此產品各單元操作的通用品質源於設計模式所建構，並非針對 ${m.brand} 本身研究所得的數值。完整深度、分子專屬的技術工作範例，請參見 linaclotide 產品評估。`
      ]
    },
    regulatory: regulatoryFor(m),
    qtpp: qtppFor(m),
    formulation: {
      note: {
        en: `No molecule-specific formulation has been reverse-engineered for ${m.brand}. Its unit operations are: ${m.unitOps.join(', ')}. A real programme would deformulate the reference product before proposing a composition — this dossier does not skip that step by inventing one.`,
        zh: `尚未針對 ${m.brand} 進行逆向工程處方解析。其單元操作為：${m.unitOps.join('、')}。實際專案應先對參考產品進行逆向解析，再提出處方組成——本頁不會以捏造組成的方式跳過此步驟。`
      },
      fillWeightMg: null, coatingLoadPct: null, components: []
    },
    cqas: cqasForOps(m.unitOps),
    analytics: ANALYTICS_BASE,
    plan: planFor(m)
  };
}
