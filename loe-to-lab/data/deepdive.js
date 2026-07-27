/* ============================================================================
   deepdive.js — Linaclotide capsule development dossier
   ----------------------------------------------------------------------------
   IMPORTANT SCOPE NOTE, stated once and meant seriously:

   The formulation below is a DESIGN TARGET constructed from public sources —
   the FDA-approved label's inactive-ingredient list, the FDA product-specific
   guidance, the Inactive Ingredient Database, and standard fluid-bed drug-
   layering practice. It is NOT the innovator's composition, which is not
   public. Under the PSG's Option 1 the applicant must establish Q1/Q2 sameness
   against the RLD by reverse engineering; that work is listed here as a task,
   not presented here as a result.
   ========================================================================== */

const DD = {

  header: {
    brand: 'LINZESS',
    inn: 'Linaclotide',
    app: 'NDA 202811',
    form: { en: 'Capsule (drug-layered beads); oral', zh: '膠囊（藥物層積微丸）；口服' },
    strengths: '72 mcg / 145 mcg / 290 mcg',
    sponsor: 'Ironwood Pharmaceuticals / AbbVie (Allergan)'
  },

  /* ---------- Why this one --------------------------------------------- */
  rationale: {
    en: [
      'Linaclotide is not the largest opportunity on the screening list. It is the one where the ratio of what you must prove to what you must spend is most favourable, and where what you must prove happens to be the thing a technically strong CDMO is already good at.',
      'The May 2022 product-specific guidance offers two mutually exclusive routes to bioequivalence. Option 2 is a randomised, double-blind, placebo-controlled clinical endpoint trial in chronic idiopathic constipation, powered on spontaneous bowel movements in week one, run separately for 72 mcg and 145 mcg. Option 1 is twelve capsules of test and twelve of reference, in four media, sampled four times, with f2 at least 50.',
      'Option 1 has one condition attached: the test formulation must be qualitatively and quantitatively the same as the RLD for the corresponding strength. Everything about this programme collapses into that single sentence. If you can reverse-engineer Q1/Q2 sameness on a peptide layer that is roughly two parts per thousand of the bead by weight, you delete two clinical trials. If you cannot, you are running a Phase 3 without a Phase 3 budget.',
      'That is why this is the right project for a technical services organisation rather than a commercial one. The barrier is analytical and process-based, which means the same barrier that stands between you and approval also stands between eleven other filers and approval — which is why there is exactly one tentative approval on file rather than nineteen.'
    ],
    zh: [
      'Linaclotide 不是篩選清單上最大的機會。它是「必須證明的事」與「必須花的錢」之間比例最有利的那一個，而且必須證明的那件事，恰好是技術型 CDMO 本來就擅長的。',
      '2022 年 5 月的產品專屬指引提供兩條互斥的等效性路徑。選項二是在慢性原發性便秘病人身上進行隨機、雙盲、安慰劑對照的臨床療效試驗，以第一週的自發性排便次數為檢定力基礎，且 72 mcg 與 145 mcg 須各做一次。選項一是測試品與參考品各十二顆膠囊，四種介質，四個取樣時間點，f2 至少 50。',
      '選項一附帶一個條件：測試處方在對應規格上，必須與 RLD 質性（Q1）與量性（Q2）完全相同。這個專案的一切都收斂到這一句話。如果你能對一層佔微丸重量約千分之二的胜肽層逆向工程出 Q1/Q2 相同，你就刪掉了兩個臨床試驗。如果不能，你就是在沒有三期預算的情況下做三期。',
      '這正是為什麼這個專案適合技術服務型組織而非商業導向組織。門檻是分析與製程性質的，這代表擋在你與核准之間的那道門檻，同樣擋在另外十一家申請者面前——這也是為什麼檔案上只有一件暫時性核准，而不是十九件。'
    ]
  },

  /* ---------- Regulatory position -------------------------------------- */
  regulatory: [
    {
      q: { en: 'Is it approved, and what exactly is approved?', zh: '是否已核准？核准的究竟是什麼？' },
      src: 'Drugs@FDA',
      a: {
        en: 'NDA 202811, capsule, oral, three strengths. Note that the 72 mcg strength uses a DIFFERENT formulation from 145 and 290 mcg — the label\'s inactive-ingredient lists diverge, and the PSG footnote says so explicitly. Q1/Q2 comparison must therefore be run per strength, not per product. Treating this as one formulation across three strengths is the first way to lose this programme.',
        zh: 'NDA 202811，膠囊，口服，三個規格。請注意 72 mcg 使用「不同」的處方，與 145、290 mcg 不同——標示上的賦形劑清單本身就有差異，PSG 的註腳也明白指出這一點。因此 Q1/Q2 比較必須逐一規格進行，而非以產品為單位。把三個規格當成同一個處方，是輸掉這個專案的第一種方式。'
      }
    },
    {
      q: { en: 'Who is the reference, and is there therapeutic equivalence to inherit?', zh: '參考品是誰？有無可繼承的療效等效性？' },
      src: 'Orange Book',
      a: {
        en: 'LINZESS is the RLD. No approved generic exists, so there is no TE code to read across and no established AB rating in this molecule. One tentative approval is on file, which tells you someone has already cleared FDA review and is waiting only on the calendar.',
        zh: 'LINZESS 為 RLD。目前無已核准學名藥，因此沒有可參照的 TE code，本分子也尚未建立 AB 等級。檔案上有一件暫時性核准，這告訴你已經有人通過 FDA 審查，只是在等日曆。'
      }
    },
    {
      q: { en: 'When can we actually enter?', zh: '我們實際上何時能進場？' },
      src: 'Orange Book patents + settlement disclosures',
      a: {
        en: 'The compound patent expired in 2025 and it is irrelevant. Orange Book formulation patents run to 30-Oct-2031 for 145/290 mcg and 16-Aug-2033 for 72 mcg, and the practical dates are set by settlement: Teva 31-Mar-2029 (72 mcg), Aurobindo 05-Aug-2030, Sun 01-Feb-2031. This is the single most important reading lesson in the whole evaluation — a patent-expiry date is not an entry date, and a molecule whose compound patent has lapsed can still be closed for another six years.',
        zh: '化合物專利已於 2025 年到期，而且無關緊要。Orange Book 上的處方專利延續至 145/290 mcg 的 2031-10-30 與 72 mcg 的 2033-08-16，實務日期則由和解決定：Teva 2029-03-31（72 mcg）、Aurobindo 2030-08-05、Sun 2031-02-01。這是整個評估中最重要的一堂閱讀課——專利到期日不是進場日，一個化合物專利已失效的分子，仍可能再被封閉六年。'
      }
    },
    {
      q: { en: 'What does FDA require us to prove?', zh: 'FDA 要求我們證明什麼？' },
      src: 'PSG_202811, revised May 2022',
      a: {
        en: 'API sameness, then bioequivalence by one of two routes, then in vitro feeding-tube performance. The API sameness requirement is unusual and specific: primary peptide sequence and related molecular properties, the configuration of all three disulfide bonds, and in vitro biological activity. That is a peptide characterisation package, and it is where a generic-chemistry organisation typically discovers it needs different instruments and different people.',
        zh: '先證明 API sameness，再以二選一的路徑證明生體相等性，最後做體外餵食管性能試驗。API sameness 的要求特殊而明確：一級胜肽序列與相關分子性質、三對雙硫鍵的組態，以及體外生物活性。這是一套胜肽特性鑑定，也正是傳統學名藥化學組織通常會發現自己需要不同儀器與不同人才的地方。'
      }
    },
    {
      q: { en: 'Do the excipients have precedent at this route and level?', zh: '賦形劑在此途徑與用量上有無核准先例？' },
      src: 'Inactive Ingredient Database',
      a: {
        en: 'All four listed inactives — calcium chloride dihydrate, hypromellose, L-leucine, microcrystalline cellulose — have oral capsule precedent well above the levels required here. IID precedent is a risk-reduction signal, not a safety approval: maximum potency in the database is not an automatic safe upper limit, and daily exposure and treatment duration still have to be assessed.',
        zh: '四種列出的賦形劑——氯化鈣二水合物、羥丙甲纖維素、L-白胺酸、微晶纖維素——在口服膠囊途徑上的核准先例均遠高於此處所需用量。IID 先例是降低風險的訊號，不是安全性核准：資料庫中的 max potency 並非自動的安全上限，每日暴露量與療程長度仍須評估。'
      }
    },
    {
      q: { en: 'What is the supply and market risk?', zh: '供應與市場風險為何？' },
      src: 'NDC Directory / Drug Shortages / commercial sources',
      a: {
        en: 'The governing supply risk is not the finished product, it is the API. Solid-phase synthesis of a 14-residue peptide with three disulfide bridges, at GMP, with a DMF, from a qualified second source, is a two-to-three-year qualification in its own right and should start on day one of the programme rather than after formulation lock.',
        zh: '主導性的供應風險不在成品，而在原料藥。以固相合成製造一個含三對雙硫鍵的 14 個胺基酸胜肽，符合 GMP、備有 DMF、並具備合格第二來源，本身就是兩到三年的認證工作，應該在專案第一天啟動，而不是在處方定案之後。'
      }
    }
  ],

  /* ---------- QTPP ------------------------------------------------------ */
  qtpp: [
    { attr: { en: 'Dosage form', zh: '劑型' }, target: { en: 'Hard capsule containing drug-layered beads', zh: '含藥物層積微丸之硬膠囊' },
      just: { en: 'Same dosage form is a §505(j) sameness requirement, and the bead format is what enables the sprinkle and feeding-tube administration in the RLD label.', zh: '相同劑型為 §505(j) 之 sameness 要求，而微丸型式正是 RLD 標示中可撒食與經餵食管給藥的基礎。' } },
    { attr: { en: 'Strengths', zh: '規格' }, target: { en: '72, 145, 290 mcg', zh: '72、145、290 mcg' },
      just: { en: 'All three needed for formulary parity. 290 mcg may be waived from in vivo testing on the strength of 145 mcg data plus dissolution plus proportional similarity.', zh: '三個規格皆需，以取得處方集上的對等地位。290 mcg 可依 145 mcg 的資料、溶離結果與比例相似性申請 in vivo 豁免。' } },
    { attr: { en: 'Q1/Q2 composition', zh: 'Q1/Q2 組成' }, target: { en: 'Qualitatively and quantitatively same as RLD, per strength, within ±5%', zh: '逐規格與 RLD 質性與量性相同，容許 ±5%' },
      just: { en: 'The gating condition for the in vitro BE route. Without it the programme is a clinical endpoint programme.', zh: '體外 BE 路徑的關鍵前提。沒有它，本專案就是一個臨床終點專案。' } },
    { attr: { en: 'Drug release', zh: '藥物釋放' }, target: { en: 'f2 ≥ 50 vs RLD in water, 0.1N HCl, pH 4.5 and pH 6.8; or both ≥85% at 15 min', zh: '於水、0.1N HCl、pH 4.5、pH 6.8 中對 RLD 之 f2 ≥ 50；或雙方於 15 分鐘均 ≥85%' },
      just: { en: 'Taken verbatim from the PSG. Note the escape clause: if both products release ≥85% in 15 minutes in all four media, no f2 is required at all — which makes rapid, complete release a formulation design objective, not just a test result.', zh: '逐字取自 PSG。請注意其中的豁免條款：若測試品與參考品在四種介質中皆於 15 分鐘內釋放 ≥85%，則完全不需計算 f2——這使「快速且完全釋放」成為處方設計目標，而不只是檢驗結果。' } },
    { attr: { en: 'Content uniformity', zh: '含量均勻度' }, target: { en: 'USP <905>, acceptance value ≤ 15.0 at L1', zh: 'USP <905>，L1 階段接受值 ≤ 15.0' },
      just: { en: 'At 145 mcg in a ~65 mg fill the drug is about 0.22% w/w. Uniformity is decided during drug layering, not during encapsulation, and it is the CQA most sensitive to fluid-bed control.', zh: '145 mcg 裝在約 65 mg 的填充量中，藥物約佔 0.22% w/w。均勻度在藥物層積時就決定了，而不是在充填時；它也是對流體床控制最敏感的 CQA。' } },
    { attr: { en: 'Degradation profile', zh: '降解物圖譜' }, target: { en: 'Hydrolysis, oxidation, and disulfide-isomer impurities within qualified limits through shelf life', zh: '水解、氧化與雙硫鍵異構物雜質於效期內維持在已 qualify 之限值內' },
      just: { en: 'A peptide with three disulfide bridges has degradation routes a small molecule does not: scrambling produces isomers of identical mass that a single RP method may not resolve. Orthogonal methods are not optional here.', zh: '含三對雙硫鍵的胜肽有小分子沒有的降解途徑：雙硫鍵重排會產生質量相同的異構物，單一逆相方法可能無法分離。此處的正交方法並非可選項。' } },
    { attr: { en: 'Water content', zh: '含水量' }, target: { en: 'Controlled at release and stability; desiccant-protected packaging', zh: '放行與安定性期間受控；包裝含乾燥劑保護' },
      just: { en: 'The RLD label instructs patients to keep the product in the original bottle with the desiccant and to protect from moisture. That instruction is a formulation confession: hydrolysis is the primary degradation route and water is the reagent.', zh: 'RLD 標示指示病人將產品保存在附乾燥劑的原瓶中並防潮。這條指示等於是處方的自白：水解是主要降解途徑，而水就是反應物。' } },
    { attr: { en: 'Feeding-tube performance', zh: '餵食管性能' }, target: { en: 'Comparative recovery, sedimentation volume and redispersibility, NG 8 Fr and G 12 Fr, at 72 and 290 mcg', zh: '比較性回收率、沉降體積與再分散性，NG 8 Fr 與 G 12 Fr，於 72 與 290 mcg' },
      just: { en: 'A PSG requirement in its own right. Bead size and surface properties determine whether beads pass an 8 French tube — which means an in-use performance test is quietly setting an upper limit on your particle size distribution.', zh: '這本身就是 PSG 的要求。微丸粒徑與表面性質決定它們能否通過 8 French 管——換言之，一項使用中性能試驗，悄悄地為你的粒徑分佈設下了上限。' } }
  ],

  /* ---------- Formulation design target -------------------------------- */
  formulation: {
    note: {
      en: 'Composition shown for the 145 mcg strength. Percentages are a starting design, to be replaced by reverse-engineered values once RLD deformulation is complete. The 72 mcg strength uses a different qualitative set (L-histidine, polyvinyl alcohol and talc in place of hypromellose and L-leucine) and must be developed as a separate formulation.',
      zh: '此處顯示 145 mcg 規格的組成。百分比為起始設計值，待 RLD 逆向解析完成後應以實測值取代。72 mcg 規格使用不同的質性組合（以 L-組胺酸、聚乙烯醇與滑石取代羥丙甲纖維素與 L-白胺酸），必須作為獨立處方開發。'
    },
    fillWeightMg: 65.0,
    coatingLoadPct: 8.0,
    components: [
      { name: 'Linaclotide', role: { en: 'Active — GC-C agonist, 14 residues, 3 disulfide bonds', zh: '主成分——GC-C 促效劑，14 個胺基酸，三對雙硫鍵' }, layer: 'coat', pctOfCoat: 2.80,
        note: { en: 'Minimally absorbed; acts locally on the intestinal epithelium. This is precisely why plasma PK cannot serve as the equivalence bridge and why the PSG offers an in vitro route.', zh: '幾乎不吸收，於腸道上皮局部作用。這正是血漿 PK 無法作為等效橋樑的原因，也是 PSG 提供體外路徑的原因。' } },
      { name: 'Hypromellose (HPMC 2910, 6 cP)', role: { en: 'Layering binder / film former', zh: '層積黏合劑／成膜劑' }, layer: 'coat', pctOfCoat: 47.2,
        note: { en: 'Controls suspension viscosity, droplet spreading and film cohesion. Grade and viscosity are Q2-relevant: substituting 15 cP for 6 cP changes spray-rate ceiling and film morphology even at identical mass.', zh: '控制噴液黏度、液滴鋪展與膜的內聚力。等級與黏度與 Q2 相關：即使質量相同，把 6 cP 換成 15 cP 也會改變噴速上限與膜的形態。' } },
      { name: 'Calcium chloride dihydrate', role: { en: 'Peptide stabiliser', zh: '胜肽安定劑' }, layer: 'coat', pctOfCoat: 22.0,
        note: { en: 'Divalent cation stabilisation of the folded peptide. Also hygroscopic, which is part of why the product requires desiccant packaging — the stabiliser and the moisture liability are the same molecule.', zh: '以二價陽離子安定摺疊後的胜肽。同時具吸濕性，這也是產品需要乾燥劑包裝的部分原因——安定劑與吸濕負擔來自同一個分子。' } },
      { name: 'L-Leucine', role: { en: 'Stabiliser / anti-tack', zh: '安定劑／抗黏' }, layer: 'coat', pctOfCoat: 28.0,
        note: { en: 'Reduces bead tackiness during layering and contributes to solid-state stabilisation of the peptide.', zh: '降低層積過程中微丸的黏性，並有助於胜肽的固態安定化。' } },
      { name: 'Microcrystalline cellulose spheres', role: { en: 'Inert core, 150–300 µm', zh: '惰性核心，150–300 µm' }, layer: 'core', pctOfCoat: null,
        note: { en: 'Sphericity and size distribution of the starting core propagate directly into coating uniformity and feeding-tube passage. Core specification is a CMA, not a purchasing detail.', zh: '起始核心的球形度與粒徑分佈會直接傳遞到包衣均勻度與餵食管通過性。核心規格是 CMA，不是採購細節。' } },
      { name: 'Hard capsule shell (gelatin, titanium dioxide)', role: { en: 'Container', zh: '容器' }, layer: 'shell', pctOfCoat: null,
        note: { en: 'Excluded from Q1/Q2 comparison of the fill, but relevant to moisture transfer and to global registration — TiO2 is restricted as a food additive in the EU, so a global programme should evaluate a TiO2-free shell early.', zh: '不列入填充物的 Q1/Q2 比較，但與水分傳遞及全球註冊相關——TiO2 在歐盟作為食品添加物已受限，因此全球性專案應及早評估無 TiO2 膠囊殼。' } }
    ]
  },

  /* ---------- CQA / risk register -------------------------------------- */
  cqas: [
    { cqa: { en: 'Content uniformity (AV)', zh: '含量均勻度（AV）' }, sev: 5,
      driver: { en: 'Spray-zone residence distribution in the Wurster; bead circulation rate; total number of passes through the spray zone', zh: 'Wurster 中噴霧區停留時間分佈；微丸循環速率；通過噴霧區的總次數' },
      control: { en: 'Fix the number of coating passes, not the coating time. Uniformity improves as roughly 1/√N with N passes, so a 20% drop in circulation rate costs more uniformity than a 20% change in spray rate.', zh: '固定「通過次數」而非「包衣時間」。均勻度大致以 1/√N 隨通過次數 N 改善，因此循環速率下降 20%，對均勻度的傷害大於噴速改變 20%。' },
      ipc: { en: 'Stratified bead sampling at 25/50/75/100% of spray solution applied; assay n=10 per point', zh: '於噴液施用 25/50/75/100% 時分層取樣；每點 n=10 含量分析' } },
    { cqa: { en: 'Assay / potency', zh: '含量／效價' }, sev: 5,
      driver: { en: 'Coating efficiency — losses to spray drying, wall deposition, filter carry-over and nozzle bearding', zh: '包衣效率——噴霧乾燥損失、壁面沉積、濾袋帶出與噴嘴結垢' },
      control: { en: 'Charge on a potency-adjusted basis using the API certificate of analysis (peptide content, water, counter-ion, residual solvents), then reconcile against measured bead assay before capsule fill weight is fixed.', zh: '依原料藥檢驗報告（胜肽含量、水分、對離子、殘留溶劑）以效價校正投料，並在決定膠囊填充量之前，與實測微丸含量進行核對。' },
      ipc: { en: 'Bead assay before encapsulation; fill weight set from measured, not theoretical, potency', zh: '充填前先測微丸含量；填充量依實測而非理論效價設定' } },
    { cqa: { en: 'Dissolution (4 media)', zh: '溶離（四種介質）' }, sev: 5,
      driver: { en: 'Film thickness and porosity; degree of over-wetting during layering; any incidental curing', zh: '膜厚與孔隙率；層積過程中的過濕程度；任何非預期的熟化' },
      control: { en: 'Keep the film hydrophilic and thin. Because the PSG waives f2 entirely when both products exceed 85% at 15 minutes, the design objective is to be comfortably above that threshold in all four media rather than to match a curve shape.', zh: '維持膜的親水性與薄度。由於 PSG 在雙方於 15 分鐘皆超過 85% 時完全免除 f2，設計目標應是在四種介質中都輕鬆超過該門檻，而非去擬合曲線形狀。' },
      ipc: { en: 'USP App 1, 500 mL, 50 rpm, 37 °C; sampling 10/15/20/30 min; n=12', zh: 'USP 裝置一，500 mL，50 rpm，37 °C；取樣 10/15/20/30 分鐘；n=12' } },
    { cqa: { en: 'Related substances / disulfide isomers', zh: '有關物質／雙硫鍵異構物' }, sev: 5,
      driver: { en: 'Solution hold time and temperature; local heat at the nozzle; oxidative stress; product-bed temperature during drying', zh: '噴液持液時間與溫度；噴嘴局部受熱；氧化壓力；乾燥期間的物料床溫度' },
      control: { en: 'Define and validate a coating-solution hold time. Keep the solution cool and protected, minimise shear during preparation, and cap the product temperature — the drying step you use to remove water is also the step that scrambles disulfides.', zh: '定義並驗證噴液持液時間。保持噴液低溫並加以保護，配製時降低剪切，並限制物料溫度上限——你用來除水的乾燥步驟，同時也是使雙硫鍵重排的步驟。' },
      ipc: { en: 'RP-UPLC purity at solution preparation, at end of spray, and post-drying', zh: '於噴液配製時、噴霧結束時、乾燥後各測一次 RP-UPLC 純度' } },
    { cqa: { en: 'Water content', zh: '含水量' }, sev: 4,
      driver: { en: 'Drying endpoint; calcium chloride hygroscopicity; ambient humidity at encapsulation', zh: '乾燥終點；氯化鈣的吸濕性；充填時的環境濕度' },
      control: { en: 'Karl Fischer, not loss on drying, because a hydrate-forming excipient makes LOD ambiguous. Control encapsulation-room humidity as a CPP, and package with desiccant.', zh: '用 Karl Fischer 而非乾燥失重，因為會形成水合物的賦形劑會使 LOD 的意義模糊。將充填室濕度列為 CPP 管制，並以乾燥劑包裝。' },
      ipc: { en: 'KF at discharge, after sieving, and pre-encapsulation', zh: '出料時、過篩後、充填前各測一次 KF' } },
    { cqa: { en: 'Bead particle size distribution', zh: '微丸粒徑分佈' }, sev: 4,
      driver: { en: 'Agglomeration during layering; attrition from over-fluidisation; fines generation', zh: '層積過程中的結塊；過度流化造成的磨耗；細粉產生' },
      control: { en: 'PSD is doubly constrained here: agglomerates fail the 8 French feeding-tube test, and fines carry potency into the filter bags. Both ends of the distribution are specification-relevant.', zh: '此處的粒徑分佈受雙重限制：結塊無法通過 8 French 餵食管試驗，而細粉會把效價帶進濾袋。分佈的兩端都與規格有關。' },
      ipc: { en: 'Sieve analysis at discharge; agglomerate fraction and fines fraction both reported', zh: '出料時做篩分分析；同時報告結塊比例與細粉比例' } },
    { cqa: { en: 'Capsule fill weight', zh: '膠囊填充量' }, sev: 3,
      driver: { en: 'Bead flow and bulk density; dosator or tamping pin settings; hopper level', zh: '微丸流動性與堆積密度；dosator 或壓塞針設定；料斗料位' },
      control: { en: '100% in-line checkweighing with a reject loop, plus periodic manual weight checks. Comparatively easy — but only because the difficult work was done upstream.', zh: '線上 100% 檢重並設剔除迴路，另加定期人工秤重。相對容易——但那只是因為困難的工作已在上游完成。' },
      ipc: { en: 'In-line checkweigher; manual n=20 every 30 minutes', zh: '線上檢重機；每 30 分鐘人工 n=20' } },
    { cqa: { en: 'Feeding-tube recovery and redispersibility', zh: '餵食管回收率與再分散性' }, sev: 3,
      driver: { en: 'Bead size, sphericity, surface tack and density', zh: '微丸粒徑、球形度、表面黏性與密度' },
      control: { en: 'Test early, not at the end. Discovering at the registration-batch stage that your beads bridge in an 8 French tube means reopening the core specification.', zh: '及早測試，不要留到最後。若在註冊批階段才發現微丸在 8 French 管中架橋，就得重新打開核心規格。' },
      ipc: { en: 'NG 8 Fr and G 12 Fr, 72 and 290 mcg, 30 mL water, 0 and 15 min', zh: 'NG 8 Fr 與 G 12 Fr，72 與 290 mcg，30 mL 水，0 與 15 分鐘' } }
  ],

  /* ---------- Analytical package ---------------------------------------- */
  analytics: [
    { test: { en: 'Primary sequence confirmation', zh: '一級序列確認' }, method: 'Peptide mapping (trypsin / Asp-N) with LC-MS/MS; amino acid analysis',
      purpose: { en: 'PSG API-sameness category 1: primary peptide sequence and related molecular properties.', zh: 'PSG API-sameness 第 1 類：一級胜肽序列與相關分子性質。' } },
    { test: { en: 'Disulfide bond assignment', zh: '雙硫鍵位置指認' }, method: 'Non-reduced vs reduced peptide map, differential alkylation, LC-MS/MS fragment assignment',
      purpose: { en: 'PSG category 2. Linaclotide has three bridges; scrambled isomers are isobaric with the correct form, so mass alone will not distinguish them. This is the analytical crux of the whole API-sameness argument.', zh: 'PSG 第 2 類。Linaclotide 有三對雙硫鍵；重排異構物與正確結構同重，僅靠質量無法區分。這是整個 API-sameness 論證的分析核心。' } },
    { test: { en: 'Higher-order structure', zh: '高階結構' }, method: 'Circular dichroism; specific optical rotation; 2D NMR fingerprint where warranted',
      purpose: { en: 'Supports "related molecular properties" and provides an orthogonal handle on folding equivalence.', zh: '支持「相關分子性質」，並為摺疊等效性提供正交的檢視角度。' } },
    { test: { en: 'In vitro biological activity', zh: '體外生物活性' }, method: 'GC-C receptor binding and cGMP functional response in T84 or equivalent cell line',
      purpose: { en: 'PSG category 3. Note this is a bioassay, with bioassay variability — the acceptance range must be set from reference-product replicates, not from a textbook.', zh: 'PSG 第 3 類。請注意這是生物檢定，具有生物檢定的變異性——接受範圍必須由參考產品的重複測定訂出，而非照教科書。' } },
    { test: { en: 'Purity and related substances', zh: '純度與有關物質' }, method: 'RP-UPLC (UV 220 nm) as primary; ion-exchange or HILIC as orthogonal; SEC for multimers',
      purpose: { en: 'A single reversed-phase method will co-elute at least one isomer class. Orthogonality is a requirement, not a refinement.', zh: '單一逆相方法至少會與一類異構物共流出。正交性是要求，不是加分項。' } },
    { test: { en: 'Assay at 0.22% w/w in matrix', zh: '基質中 0.22% w/w 的含量測定' }, method: 'Extraction recovery study; RP-UPLC with matrix-matched calibration',
      purpose: { en: 'The method must be accurate and precise at two parts per thousand against a large cellulose background. Method capability, not process capability, is the first thing that will limit your content-uniformity result.', zh: '方法必須在大量纖維素背景下對千分之二的濃度維持準確與精密。首先限制含量均勻度結果的是「方法能力」，不是「製程能力」。' } },
    { test: { en: 'Dissolution', zh: '溶離' }, method: 'USP Apparatus 1, 500 mL, 50 rpm, 37 °C, four media, 10/15/20/30 min, n=12',
      purpose: { en: 'Verbatim from the PSG. Check the FDA Dissolution Methods database for the current entry as well; the PSG points there explicitly.', zh: '逐字取自 PSG。同時應查 FDA Dissolution Methods 資料庫的現行條目；PSG 明確指向該處。' } },
    { test: { en: 'Water content', zh: '含水量' }, method: 'Karl Fischer, coulometric',
      purpose: { en: 'Chosen over loss on drying because calcium chloride dihydrate makes thermal water loss ambiguous.', zh: '選用此法而非乾燥失重，因為氯化鈣二水合物使熱重法的水分意義模糊。' } },
    { test: { en: 'Feeding-tube in vitro study', zh: '體外餵食管試驗' }, method: 'Per FDA guidance on oral products via enteral feeding tube; recovery, sedimentation volume, redispersibility',
      purpose: { en: 'Explicit PSG requirement at 72 and 290 mcg through NG 8 Fr and G 12 Fr.', zh: 'PSG 明確要求，於 72 與 290 mcg，經 NG 8 Fr 與 G 12 Fr 進行。' } }
  ],

  /* ---------- Development plan ------------------------------------------ */
  plan: [
    { phase: { en: 'Phase 0 — Feasibility', zh: '第 0 階段——可行性' }, months: '0–6',
      items: {
        en: ['Secure RLD units across three strengths and multiple lots', 'Begin API source qualification and DMF review — this is the long pole, start it first', 'Establish the RP-UPLC and orthogonal purity methods before any manufacturing', 'Deformulate the RLD: quantify all four inactives per strength'],
        zh: ['取得三個規格、多個批號的 RLD 樣品', '啟動 API 來源認證與 DMF 審閱——這是最長的關鍵路徑，應最先開始', '在任何製造之前先建立 RP-UPLC 與正交純度方法', '對 RLD 逆向解析：逐規格定量四種賦形劑']
      },
      gate: { en: 'GATE: can we credibly claim Q1/Q2 sameness? If no, stop or re-budget as a clinical-endpoint programme.', zh: '關卡：我們能否可信地主張 Q1/Q2 相同？若否，停止，或重新以臨床終點專案編列預算。' } },
    { phase: { en: 'Phase 1 — Lab development', zh: '第 1 階段——實驗室開發' }, months: '6–18',
      items: {
        en: ['GPCG-1 Wurster trials, 0.5–1 kg scale, DoE on spray rate × inlet temperature × atomisation', 'Coating-solution stability and hold-time study', 'Screen core sphere grades against feeding-tube passage early', 'Comparative dissolution against RLD in all four media'],
        zh: ['GPCG-1 Wurster 試驗，0.5–1 kg 規模，對噴速 × 進風溫度 × 霧化壓做 DoE', '噴液安定性與持液時間研究', '及早篩選核心球等級以確認餵食管通過性', '於四種介質中對 RLD 做比較性溶離']
      },
      gate: { en: 'GATE: dissolution comparable in all four media, AV ≤ 15 reproducibly, purity profile matched.', zh: '關卡：四種介質溶離皆可比、AV ≤ 15 可重現、純度圖譜相符。' } },
    { phase: { en: 'Phase 2 — Pilot and scale-up', zh: '第 2 階段——中試與放大' }, months: '18–30',
      items: {
        en: ['GPCG-5 pilot batches at 1/10 commercial scale', 'Scale spray rate per nozzle and air volume per kg, not the machine settings', 'Confirm operating window with edge-of-failure batches at both extremes', 'Registration stability, ICH conditions, in final pack with desiccant'],
        zh: ['GPCG-5 中試批，約商業規模的十分之一', '放大時依「每支噴嘴的噴速」與「每公斤的風量」，而非直接複製機台設定值', '以兩端極限的 edge-of-failure 批次確認操作窗口', '註冊安定性試驗，ICH 條件，以含乾燥劑的最終包裝進行']
      },
      gate: { en: 'GATE: process is reproducible at pilot scale and the operating window is defined by data, not by opinion.', zh: '關卡：製程在中試規模可重現，且操作窗口由數據而非意見界定。' } },
    { phase: { en: 'Phase 3 — Submission', zh: '第 3 階段——送件' }, months: '30–42',
      items: {
        en: ['Three registration batches per strength', 'API sameness package assembled and cross-reviewed against PSG categories 1–3', 'Feeding-tube in vitro studies at 72 and 290 mcg', 'CTD Module 3 authoring; re-verify PSG version, Orange Book patents and marketing status before filing'],
        zh: ['每規格三批註冊批', '組建 API sameness 資料包，並對照 PSG 第 1–3 類逐項交叉審查', '於 72 與 290 mcg 進行體外餵食管試驗', '撰寫 CTD Module 3；送件前重查 PSG 版本、Orange Book 專利與上市狀態']
      },
      gate: { en: 'GATE: Paragraph IV strategy decided — file against the formulation patents, or wait for the licensed date.', zh: '關卡：確定 Paragraph IV 策略——對處方專利提出挑戰，或等待授權日期。' } },
    { phase: { en: 'Phase 4 — Validation and launch readiness', zh: '第 4 階段——驗證與上市準備' }, months: '42–60',
      items: {
        en: ['PPQ per FDA process validation lifecycle stage 2', 'Continued process verification plan with control charts on AV, assay and PSD', 'Inspection readiness: batch records, data integrity, deviation and CAPA closure'],
        zh: ['依 FDA 製程驗證生命週期第二階段執行 PPQ', '建立持續製程確認計畫，對 AV、含量與粒徑分佈設管制圖', '查廠準備：批次紀錄、資料完整性、偏差與 CAPA 結案']
      },
      gate: { en: 'GATE: approval held, licence date reached, launch quantities released.', zh: '關卡：取得核准、到達授權日期、放行上市數量。' } }
  ]
};
