/* ============================================================================
   i18n.js — interface strings and long-form narrative copy
   ========================================================================== */

const UI = {

  siteTitle:   { en: 'From Patent Cliff to Pilot Batch', zh: '從專利懸崖到中試批' },
  siteSub:     { en: 'A CDMO decision chain, end to end', zh: '一條 CDMO 決策鏈，從頭到尾' },
  byline:      { en: 'May Chang · Bora Pharmaceuticals / TWi · R&D Summer Internship 2026', zh: 'May Chang · 保瑞藥業／安成生技 · 2026 R&D暑期實習' },

  nav: {
    thesis:   { en: 'Premise', zh: '前提' },
    screener: { en: '1 · Screen', zh: '1 · 篩選' },
    pathway:  { en: '2 · Pathway', zh: '2 · 路徑' },
    dossier:  { en: '3 · Dossier', zh: '3 · 產品評估' },
    protocol: { en: '4 · Pilot Batch', zh: '4 · 中試批' },
    fluidbed: { en: '5 · Process Lab', zh: '5 · 製程實驗室' },
    validation: { en: '6 · Transfer', zh: '6 · 技術移轉' },
    method:   { en: 'Method & Limits', zh: '方法與限制' }
  },

  heroLead: {
    en: 'A medicine loses its patent. Someone else has to be ready to make it. This site follows one molecule through every decision that takes — from a line in a patent database to a number on a machine.',
    zh: '一款藥失去專利保護，就得有人準備好接手製造。這個網站追隨同一個分子，走過這件事所需的每一個決定——從專利資料庫裡的一行，到機台上的一個數字。'
  },

  heroBody: {
    en: [
      'This site starts with twenty-one medicines losing protection between 2026 and 2033 and ranks them by criteria you can change yourself. Then it follows the winner all the way down: which legal route to file under, what has to be proven, how the first batch is actually made, and what the machines are doing while they make it.',
    ],
    zh: [
      '這個網站從 2026 至 2033 年間失去保護的二十一款藥開始，依你可以自行更改的標準排序；接著把勝出的那一個一路帶到底：該依哪一條法規路徑送件、必須證明什麼、第一批要怎麼做出來，以及製造時機器在做什麼。',
    ]
  },

  howToRead: {
    label: { en: 'How to read this', zh: '如何閱讀' },
    items: [
      { t: { en: '3 minutes', zh: '3 分鐘' }, d: { en: 'Skim the six headers below. Each section opens with two sentences.', zh: '瀏覽下方六個標題。每一節都以兩句話開場。' } },
      { t: { en: '15 minutes', zh: '15 分鐘' }, d: { en: 'Go to the process lab and break something. Every machine tells you what you would see.', zh: '前往製程實驗室，把某個東西弄壞。每台機器都會告訴你，你會看到什麼。' } },
      { t: { en: '45 minutes', zh: '45 分鐘' }, d: { en: 'Open the "why this matters" panels. That is where the reasoning lives.', zh: '打開「為什麼這重要」面板。推理都在那裡。' } }
    ]
  },

  chainSteps: [
    { n: '01', t: { en: 'Which molecule?', zh: '選哪個分子？' }, d: { en: 'Exclusivity dates, competitor count, technical barrier', zh: '專屬權日期、競爭者數量、技術門檻' } },
    { n: '02', t: { en: 'Which pathway?', zh: '走哪條路徑？' }, d: { en: '505(b)(1) · 505(b)(2) · ANDA · 351(k)', zh: '505(b)(1) · 505(b)(2) · ANDA · 351(k)' } },
    { n: '03', t: { en: 'What must we prove?', zh: '必須證明什麼？' }, d: { en: 'PSG, Q1/Q2, CQAs, analytical package', zh: 'PSG、Q1/Q2、CQA、分析組合' } },
    { n: '04', t: { en: 'How do we make it?', zh: '要怎麼做出來？' }, d: { en: 'Pilot batch protocol with decision branches', zh: '含決策分支的中試批操作程序' } },
    { n: '05', t: { en: 'What do the machines do?', zh: '機器在做什麼？' }, d: { en: 'Seven live simulators — move a slider, watch it break', zh: '七台即時模擬器——拖動滑桿，看它壞掉' } },
    { n: '06', t: { en: 'How do we prove it stays right?', zh: '如何證明它持續正確？' }, d: { en: 'URS → PPQ → CPV, and the transfer gaps', zh: 'URS → PPQ → CPV，以及移轉落差' } }
  ],

  /* --- Screener --- */
  scr: {
    title:   { en: 'Loss-of-exclusivity screener', zh: '專屬權到期篩選' },
    lead:    { en: 'Twenty-one molecules, scored against a weighting you control. Drag the sliders and watch the ranking change.', zh: '二十一個分子，依你所控制的權重評分。拖動滑桿，看排名如何改變。' },
    weights: { en: 'Scoring weights', zh: '評分權重' },
    preset:  { en: 'Presets', zh: '預設情境' },
    presets: {
      cdmo:  { en: 'Complex-generic CDMO', zh: '複雜學名藥 CDMO' },
      volume:{ en: 'Volume manufacturer', zh: '量產型製造商' },
      risk:  { en: 'Risk-averse', zh: '風險趨避' },
      flat:  { en: 'Everything equal', zh: '全部等權' }
    },
    w: {
      market:      { en: 'Market size', zh: '市場規模' },
      timing:      { en: 'Entry timing fit', zh: '進場時機契合度' },
      legal:       { en: 'Low legal risk', zh: '低法律風險' },
      barrier:     { en: 'Technical barrier (deters rivals)', zh: '技術門檻（嚇阻競爭者）' },
      exec:        { en: 'Low execution risk', zh: '低執行風險' },
      competition: { en: 'Empty field', zh: '賽道空曠' },
      fit:         { en: 'Capability fit', zh: '能力契合度' }
    },
    barrierNote: {
      en: 'Technical difficulty appears twice, with opposite signs. It keeps competitors out, and it may keep you out too. Screeners that use a single "complexity" number cannot express that, and end up recommending either commodity tablets or things nobody can make.',
      zh: '技術難度出現兩次，符號相反。它把競爭者擋在外面，也可能把你擋在外面。使用單一「複雜度」數值的篩選系統無法表達這一點，最後推薦的不是大宗錠劑，就是沒有人做得出來的東西。'
    },
    th: {
      rank: { en: '#', zh: '#' }, brand: { en: 'Product', zh: '產品' }, app: { en: 'Application', zh: '申請案' },
      sales: { en: 'US$M', zh: '百萬美元' }, entry: { en: 'Earliest entry', zh: '最早進場' },
      route: { en: 'Route', zh: '路徑' }, barrier: { en: 'Barrier', zh: '門檻' },
      comp: { en: 'Rivals', zh: '競爭' }, score: { en: 'Score', zh: '分數' }
    },
    clickHint: { en: 'Select a row for the full reading', zh: '點選任一列查看完整判讀' },
    verify: { en: 'Re-verify before any gate', zh: '任何決策關卡前重查' }
  },

  /* --- Pathway --- */
  pw: {
    title: { en: 'Regulatory pathway engine', zh: '法規路徑引擎' },
    lead:  { en: 'Four questions that decide which statute you are filing under, followed by a clock that shows when you could actually launch.', zh: '四個問題決定你依哪一部法律送件，接著是一個顯示你實際何時能上市的時鐘。' },
    restart: { en: 'Start over', zh: '重新開始' },
    result: { en: 'Indicated pathway', zh: '建議路徑' },
    clockTitle: { en: 'Exclusivity and entry clock', zh: '專屬權與進場時鐘' },
    clockLead: { en: 'Patents and regulatory exclusivities run on separate clocks and are read separately. Set the inputs and see which one is actually binding.', zh: '專利與法規專屬權各自獨立計時、獨立判讀。設定輸入值，看看真正產生拘束力的是哪一個。' },
    costTitle: { en: 'Programme economics', zh: '專案經濟效益' },
    costLead:  { en: 'FY2026 statutory user fees, development cost, and a price-erosion curve driven by competitor count rather than by time.', zh: '2026 會計年度法定使用者費用、開發成本，以及由競爭者數量而非時間驅動的價格侵蝕曲線。' },
    jurLabel:  { en: 'Which regulator are you filing with?', zh: '你要向哪個主管機關送件？' },
    litTitle:  { en: 'Patent life and litigation status', zh: '專利存續期與訴訟狀態' },
    litLead:   { en: 'What the screening snapshot actually says about this molecule\'s patent and litigation position, for the product currently selected in the screener.', zh: '目前於篩選器中選取的產品，其專利與訴訟狀態在篩選快照中的實際記載。' },
    litScope:  { en: 'Litigation and settlement tracking in this snapshot is U.S.-only (Orange Book / Paragraph IV filings and settlement disclosures). Taiwan and EU patent status are NOT tracked here — use the official registers linked above to check them directly for any molecule before a decision gate.', zh: '本快照的訴訟與和解追蹤僅涵蓋美國（Orange Book／Paragraph IV 申請與和解揭露）。台灣與歐盟的專利狀態「未」於此追蹤——任何決策關卡前，請使用上方連結的官方資料庫直接查詢。' },
    litLinkUS: { en: 'US — Orange Book patent listing', zh: '美國——Orange Book 專利清單' },
    litLinkTW: { en: 'Taiwan — TIPO patent search', zh: '台灣——TIPO 專利檢索' },
    litLinkEU: { en: 'Europe — Espacenet / EPO register', zh: '歐洲——Espacenet／EPO 專利註冊簿' },
    litAll: { en: 'View all 21 products →', zh: '檢視全部 21 項產品 →' }
  },

  lit: {
    clean: { en: 'clean', zh: '乾淨' },
    moderate: { en: 'moderate', zh: '中等' },
    active: { en: 'active litigation risk', zh: '活躍訴訟風險' }
  },

  /* --- Dossier --- */
  dd: {
    title: { en: 'Product dossier', zh: '產品評估報告' },
    why:   { en: 'Why this molecule', zh: '為什麼是這個分子' },
    reg:   { en: 'Regulatory reading', zh: '法規判讀' },
    qtpp:  { en: 'Quality target product profile', zh: '目標產品品質輪廓' },
    form:  { en: 'Formulation design target', zh: '處方設計目標' },
    cqa:   { en: 'Critical quality attributes', zh: '關鍵品質屬性' },
    ana:   { en: 'Analytical package', zh: '分析方法組合' },
    plan:  { en: 'Development plan and gates', zh: '開發計畫與關卡' },
    planLead: { en: 'The regulatory basis and analytical package that justify the phased plan below — both collapsed by default, expand either to see the full detail.', zh: '支撐下方分階段計畫的法規依據與分析方法組合——預設皆為收合狀態，展開即可檢視完整內容。' },
    planSub: { en: 'Phased plan and gates', zh: '分階段計畫與關卡' },
    anaTest: { en: 'Test', zh: '測試項目' },
    anaMethod: { en: 'Method', zh: '方法' },
    anaPurpose: { en: 'Purpose', zh: '目的' },
    cqaTeaser: { en: 'critical quality attributes identified, each with its driver, control and in-process check.', zh: '項關鍵品質屬性，各附驅動因子、管制方式與製程中檢驗。' }
  },

  /* --- Protocol --- */
  pr: {
    title: { en: 'Pilot batch protocol', zh: '中試批操作程序' },
    lead:  { en: 'Set a batch size and the quantities recalculate.', zh: '設定批量後，各項數量會自動重新計算。' },
    batch: { en: 'Batch size', zh: '批量' },
    capsules: { en: 'capsules', zh: '顆膠囊' },
    formula: { en: 'Batch formula', zh: '批次配方' },
    component: { en: 'Component', zh: '成分' },
    perCap: { en: 'Per capsule', zh: '每顆膠囊' },
    perBatch: { en: 'Per batch', zh: '每批' },
    derived: { en: 'Derived process quantities', zh: '衍生製程數量' },
    purpose: { en: 'Purpose', zh: '目的' },
    equipment: { en: 'Equipment', zh: '設備' },
    params: { en: 'Parameters', zh: '參數' },
    watch: { en: 'What to watch', zh: '觀察重點' },
    branch: { en: 'Decision branches', zh: '決策分支' },
    gmpNote: { en: 'GMP and documentation', zh: 'GMP 與文件' },
    tsTitle: { en: 'Troubleshooting', zh: '異常排除' },
    tsLead: { en: 'Select what you observed. Each entry ends with the thing people try first that makes it worse.', zh: '選擇你觀察到的現象。每一則的結尾都是「人們最先嘗試、但會讓情況更糟」的那個做法。' },
    root: { en: 'What is actually happening', zh: '實際發生了什麼' },
    checks: { en: 'Check these first', zh: '先檢查這些' },
    actions: { en: 'Actions, in order', zh: '處置措施，依順序' },
    wrong: { en: 'The instinctive move that makes it worse', zh: '會讓情況更糟的直覺反應' },
    disclaimer: { en: 'Not a validated master batch record. A real MBR is a controlled GMP document with revision control, approvals and signature blocks.', zh: '這不是已驗證的主批次紀錄。真正的 MBR 是具版本控制、核准與簽章欄位的受控 GMP 文件。' }
  },

  /* --- Process lab (tab shell around the seven simulators) --- */
  lab: {
    title: { en: 'Process lab', zh: '製程實驗室' },
    pick: { en: 'Pick a machine', zh: '選擇機台' },
    tryThis: { en: 'Try this', zh: '試試看' },
    controls: { en: 'Controls', zh: '控制項' },
    results: { en: 'Results', zh: '結果' },
    onBench: { en: 'What you would see', zh: '你會看到什麼' },
    deep: { en: 'Why this matters', zh: '為什麼這重要' },
    reset: { en: 'Reset', zh: '重設' },
    chainNote: { en: 'Some outputs feed the next machine. Particle size from the mill, hardness from the press and coating level all reappear as inputs to the dissolution test — which is the point.', zh: '部分輸出會餵給下一台機器。整粒機的粒徑、壓錠機的硬度與包衣量，都會再度出現在溶離試驗的輸入端——這正是重點。' },
    carry: { en: 'Carried from', zh: '沿用自' },
    fixTitle: { en: 'If this went sideways, run this comparison next', zh: '若結果失控，接下來跑這個比較試驗' },
    download: { en: 'Download protocol sheet', zh: '下載操作記錄表' }
  },

  /* --- Fluid bed --- */
  fb: {
    title: { en: 'Fluid bed — Wurster & granulation', zh: '流體床——Wurster 與造粒' },
    lead:  { en: 'A live heat and mass balance with fluidisation mechanics, wired to a cross-section you can watch. Move a control and every number and every particle responds.', zh: '一個即時的熱質平衡模型，結合流化力學，並連動到可觀看的剖面動畫。移動任一控制項，所有數字與所有顆粒都會反應。' },
    mode: { en: 'Configuration', zh: '機台配置' },
    wurster: { en: 'Wurster bottom spray', zh: 'Wurster 底噴' },
    topspray: { en: 'Top spray granulation', zh: '頂噴造粒' },
    controls: { en: 'Controls', zh: '控制' },
    readouts: { en: 'Readouts', zh: '讀值' },
    thermo: { en: 'Heat and mass balance', zh: '熱質平衡' },
    hydro: { en: 'Fluidisation', zh: '流化狀態' },
    quality: { en: 'Predicted quality', zh: '品質預測' },
    window: { en: 'Operating window', zh: '操作窗口' },
    windowLead: { en: 'Spray rate against product temperature. The failures are on opposite sides and the usable region is what you are developing.', zh: '噴速對物料溫度。失敗落在相對的兩側，中間可用的區域就是你正在開發的東西。' },
    knobs: { en: 'What each control actually does', zh: '每個控制項實際在做什麼' },
    principles: { en: 'The physics underneath', zh: '底層的物理' },
    scenarios: { en: 'Training scenarios', zh: '訓練情境' },
    scenLead: { en: 'Load a failing set of conditions and fix it. The debrief appears when the target is met.', zh: '載入一組失敗的條件並修正它。達成目標時會顯示檢討說明。' },
    load: { en: 'Load scenario', zh: '載入情境' },
    goal: { en: 'Target', zh: '目標' },
    solved: { en: 'Target met', zh: '目標達成' },
    debrief: { en: 'Debrief', zh: '檢討' },
    does: { en: 'What it does', zh: '它做什麼' },
    reads: { en: 'How to read it', zh: '如何判讀' },
    trap: { en: 'Where people go wrong', zh: '常見的錯誤' },
    affects: { en: 'Affects', zh: '影響' },
    reset: { en: 'Reset to baseline', zh: '回復基準值' },
    modelNote: {
      en: 'A lumped first-principles model using Wen & Yu, Haider & Levenspiel, Sutherland and standard psychrometrics. It reproduces the direction and rough magnitude of every response and the location of the failure modes. It is not CFD and it is not your machine — a real operating window comes from your own development batches.',
      zh: '一個採用 Wen & Yu、Haider & Levenspiel、Sutherland 與標準濕空氣性質的集總第一原理模型。它能重現每個響應的方向與大致量級，以及各失效模式的位置。它不是 CFD，也不是你的機台——真正的操作窗口來自你自己的開發批次。'
    }
  },

  /* --- Validation --- */
  vl: {
    title: { en: 'Validation and technology transfer', zh: '驗證與技術移轉' },
    lead:  { en: 'The lifecycle that turns a process that worked once into a process that is allowed to run.', zh: '把「曾經成功過一次的製程」變成「被允許持續運行的製程」的生命週期。' },
    gaps:  { en: 'Gap assessment: the seven questions before a transfer', zh: '差異評估：移轉前的七個問題' },
    gapsLead: { en: 'A transfer fails on the item nobody assessed, and it is almost never the equipment.', zh: '移轉失敗在沒有人評估過的那一項上，而那幾乎從來不是設備。' }
  },

  /* --- Method --- */
  mt: {
    title: { en: 'Method, sources and limitations', zh: '方法、來源與限制' },
    dataTitle: { en: 'What the data is and is not', zh: '資料是什麼、不是什麼' },
    data: {
      en: [
        'FDA publishes no public API for Orange Book patent and exclusivity data. The screening dataset is therefore a hand-compiled snapshot dated 27 July 2026, not a live feed. Every row carries its sources and a confidence flag, and every entry-date claim should be re-verified in Drugs@FDA and the Orange Book before any decision gate — which is precisely the discipline the project-evaluation curriculum insists on.',
        'Sales figures marked medium confidence are order-of-magnitude, drawn from company filings and trade press. They are adequate for ranking and inadequate for a business case.',
        'The linaclotide formulation shown is a design target constructed from the label\'s inactive-ingredient list, the FDA product-specific guidance and standard drug-layering practice. It is not the innovator\'s composition, which is not public. Establishing Q1/Q2 sameness is listed in the development plan as work to be done, not presented as a result.',
        'The fluid-bed model is a lumped first-principles calculation, not a simulation of any specific machine. Geometry is representative of a GPCG-5 class unit with a Wurster insert.'
      ],
      zh: [
        'FDA 並未提供 Orange Book 專利與專屬權資料的公開 API。因此篩選資料集是一份日期為 2026 年 7 月 27 日的人工彙整快照，不是即時資料流。每一列都附有來源與信心標記，所有進場日期的主張都應在任何決策關卡前於 Drugs@FDA 與 Orange Book 重新查證——這正是專案評估課程所堅持的紀律。',
        '標記為中等信心的銷售數字屬於數量級估計，取自公司財報與產業媒體。用於排序足夠，用於商業計畫則不足。',
        '所呈現的 linaclotide 處方是依標示的賦形劑清單、FDA 產品專屬指引與標準藥物層積實務所建構的設計目標。它不是原開發廠的組成，該組成並未公開。建立 Q1/Q2 相同性在開發計畫中被列為「待完成的工作」，而非呈現為「已得到的結果」。',
        '流體床模型是集總的第一原理計算，不是任何特定機台的模擬。幾何條件代表配有 Wurster 內筒的 GPCG-5 級機組。'
      ]
    },
    srcTitle: { en: 'Primary sources', zh: '主要來源' },
    curTitle: { en: 'Curriculum this is built on', zh: '本作品所依據的課程' },
    curLead: { en: 'Fourteen sessions of the Bora / TWi technical development programme, June to July 2026, plus my own evaluation outputs.', zh: '保瑞／安成技術培育計畫 2026 年 6 至 7 月的十四場課程，以及我自己的評估產出。' },
    closingTitle: { en: 'What I took from it', zh: '我從中帶走了什麼' },
    closing: {
      en: [
        'The single idea that reorganised everything else for me is that the hard problem in this industry is almost never the chemistry. It is that a decision made in business development in month one determines what the process engineer is allowed to do in month thirty, and neither of them is usually in the room when the other decides.',
        'Choosing linaclotide over apixaban is not a chemistry judgement. It is the observation that one product\'s guidance offers an in vitro route and the other\'s does not, that the in vitro route converts clinical spend into analytical capability, and that analytical capability is a barrier which keeps the field at one competitor instead of twenty-five. That reasoning has to survive intact all the way down to a spray rate on a control panel, or it was never a strategy.',
        'The other thing I learned is smaller and more practical: raising the inlet temperature when the bed gets wet feels like control and is actually avoidance. Most process mistakes have that shape — a fast action on the symptom that closes off the slower correct action on the cause. Learning to notice the shape is, I think, most of what technical services is.'
      ],
      zh: [
        '真正把其他一切重新組織起來的那個想法是：這個產業裡困難的問題幾乎從來不是化學。困難的是，第一個月由業務開發做出的決定，決定了第三十個月製程工程師被允許做什麼——而通常另一方做決定時，這一方並不在場。',
        '選擇 linaclotide 而非 apixaban 不是化學判斷。而是觀察到：一個產品的指引提供了體外路徑，另一個沒有；體外路徑把臨床支出轉換成分析能力；而分析能力是一道門檻，使賽道上只剩一個競爭者而不是二十五個。這串推理必須完整地一路存活到控制面板上的一個噴速設定值，否則它從來就不是策略。',
        '另一件學到的事比較小、比較實用：床體變濕時提高進風溫度，感覺像是在控制，實際上是在迴避。多數製程錯誤都有這個形狀——對症狀採取快速行動，因而堵住了對原因採取的較慢但正確的行動。學會辨認這個形狀，我想，就是技術服務工作的絕大部分。'
      ]
    }
  },

  map: {
    kicker: { en: 'How a medicine reaches a patient', zh: '一款藥如何走到病人手上' },
    title: { en: 'Where Contract Development and Manufacturing Organization (CDMO) sits', zh: '這個專案的位置' },
    lead: {
      en: 'Pick anywhere to start.',
      zh: '請點選想要進任的階段。'
    },
    innovatorLane: { en: 'Innovator · creating the molecule', zh: '原開發廠 · 創造分子' },
    genericLane: { en: 'CDMO · copying it, once the law allows', zh: 'CDMO · 在法律允許後複製它' },
    cliff: { en: 'Loss of exclusivity', zh: '專屬權到期' },
    cliffSub: { en: 'the moment the second row becomes legal', zh: '第二排在此刻成為合法' },
    notCovered: { en: 'Not covered here', zh: '本站未涵蓋' },
    covered: { en: 'Click to open', zh: '點擊進入' },
    skip: { en: 'Skip and read the site', zh: '略過，直接閱讀' },
    dontShow: { en: "Don't show this again", zh: '不要再顯示' },
    reopen: { en: 'Map', zh: '地圖' },
    esc: { en: 'Esc to close', zh: '按 Esc 關閉' },
    close: { en: 'Close', zh: '關閉' },
    litKicker: { en: 'The junction on the map', zh: '地圖上的關鍵節點' },
    litPageTitle: { en: 'Loss of exclusivity — patent life and litigation status', zh: '專屬權到期——專利存續期與訴訟狀態' },
    litPageLead: { en: 'All 21 screened products, read against the same U.S. patent and settlement data as the Pathway module. Select any card to open that product everywhere else on the site.', zh: '所有 21 個篩選產品，依與「路徑」模組相同的美國專利與和解資料判讀。點選任一卡片，即可在站內其他各處切換到該產品。' },
    innovator: [
      { t: { en: 'Discovery', zh: '藥物發現' }, d: { en: 'Find a molecule that|does something useful', zh: '找到一個|有用的分子' } },
      { t: { en: 'Preclinical', zh: '臨床前' }, d: { en: 'Test it in the lab|and in animals', zh: '在實驗室與|動物身上測試' } },
      { t: { en: 'Clinical trials', zh: '臨床試驗' }, d: { en: 'Three phases,|thousands of patients', zh: '三個階段，|數千位受試者' } },
      { t: { en: 'Approval', zh: '核准' }, d: { en: 'The regulator says yes,|and grants exclusivity', zh: '主管機關同意，|並給予專屬權' } },
      { t: { en: 'Patent life', zh: '專利期' }, d: { en: 'Sole supplier,|protected price', zh: '獨家供應，|價格受保護' } }
    ]
  },

  fig: {
    capTitle: { en: 'What the product actually is', zh: '這個產品實際上是什麼' },
    pickHint: { en: 'Select any product in the table above to see what it physically is and how that decides the way it gets made.', zh: '點選上方表格中的任一產品，即可看到它實際上的樣子，以及那如何決定它的製造方式。' },
    howMade: { en: 'How it is made', zh: '如何製造' },
    whatsHard: { en: 'What makes it hard', zh: '難在哪裡' },
    unitOps: { en: 'Unit operations', zh: '單元操作' },
    neutralNote: { en: 'Dosage form drawn accurately; colour and imprint are neutral and not product-specific. Only LINZESS carries verified appearance from its FDA label.', zh: '劑型為精確繪製；顏色與刻字為中性，並非該產品實際外觀。僅 LINZESS 採用其 FDA 標示中經查證的外觀。' },
    capLead: {
      en: 'Drawn to the FDA-approved label description: a white to off-white opaque hard gelatin capsule with a grey "FL 145" imprint. Inside are not powder but thousands of tiny spheres, each one carrying a peptide film about two parts per thousand of its own weight.',
      zh: '依 FDA 核准標示的描述繪製：白色至類白色不透明硬膠囊，印有灰色「FL 145」字樣。裡面裝的不是粉末，而是數千顆微丸，每一顆都帶著一層約佔自身重量千分之二的胜肽薄膜。'
    },
    parts: [
      { t: { en: 'Hard gelatin capsule', zh: '硬明膠膠囊殼' }, d: { en: 'Gelatin and titanium dioxide. Holds the dose and nothing else.', zh: '明膠與二氧化鈦。只負責裝載劑量，別無其他。' } },
      { t: { en: 'Drug-layered beads', zh: '藥物層積微丸' }, d: { en: 'Roughly 65 mg of them per capsule. Small enough to pass through an 8 French feeding tube.', zh: '每顆膠囊約 65 mg。小到足以通過 8 French 的餵食管。' } },
      { t: { en: 'Inert cellulose core', zh: '惰性纖維素核心' }, d: { en: '150–300 µm sphere. Carries no drug — it is just something to spray onto.', zh: '150–300 µm 的球體。不含藥物——它只是一個可以被噴附的載體。' } },
      { t: { en: 'Peptide film', zh: '胜肽薄膜' }, d: { en: '145 micrograms of linaclotide per capsule, spread over thousands of beads. That is 0.22 % by weight.', zh: '每顆膠囊 145 微克的 linaclotide，分佈在數千顆微丸上。以重量計為 0.22 %。' } }
    ],
    official: { en: 'Official product photograph on DailyMed', zh: 'DailyMed 上的官方產品照片' },
    officialUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=09beda19-56d6-4a56-afdc-9a77b70b2ef3',
    disclaimer: { en: 'Diagram drawn from the label text, not a photograph. Bead structure is schematic.', zh: '本圖依標示文字繪製，非照片。微丸結構為示意圖。' }
  },

  common: {
    source:   { en: 'Source', zh: '來源' },
    more:     { en: 'Why this matters', zh: '為什麼這重要' },
    less:     { en: 'Close', zh: '收合' },
    showAll:  { en: 'Show all columns', zh: '顯示所有欄位' },
    showLess: { en: 'Simplify table', zh: '簡化表格' },
    sources:  { en: 'Sources', zh: '來源' },
    note:     { en: 'Note', zh: '註' },
    snapshot: { en: 'Data snapshot', zh: '資料快照' },
    conf:     { en: 'Confidence', zh: '信心' },
    high:     { en: 'high', zh: '高' },
    medium:   { en: 'medium', zh: '中' },
    thesisLbl:{ en: 'Reading', zh: '判讀' },
    close:    { en: 'Close', zh: '關閉' }
  },

  sourceList: [
    { t: 'Drugs@FDA', u: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm' },
    { t: 'Orange Book — Approved Drug Products with Therapeutic Equivalence Evaluations', u: 'https://www.accessdata.fda.gov/scripts/cder/ob/index.cfm' },
    { t: 'Purple Book', u: 'https://purplebooksearch.fda.gov/' },
    { t: 'Product-Specific Guidances for Generic Drug Development', u: 'https://www.accessdata.fda.gov/scripts/cder/psg/index.cfm' },
    { t: 'FDA Draft Guidance on Linaclotide (PSG_202811, revised May 2022)', u: 'https://www.accessdata.fda.gov/drugsatfda_docs/psg/PSG_202811.pdf' },
    { t: 'FDA Dissolution Methods Database', u: 'https://www.accessdata.fda.gov/scripts/cder/dissolution/' },
    { t: 'FDA Inactive Ingredient Database', u: 'https://www.fda.gov/drugs/drug-approvals-and-databases/inactive-ingredients-database-download' },
    { t: 'DailyMed', u: 'https://dailymed.nlm.nih.gov/dailymed/' },
    { t: 'Generic Drug User Fee Rates for Fiscal Year 2026 (90 FR, 30 July 2025)', u: 'https://www.federalregister.gov/documents/2025/07/30/2025-14411/generic-drug-user-fee-rates-for-fiscal-year-2026' },
    { t: 'Prescription Drug User Fee Rates for Fiscal Year 2026 (90 FR, 30 July 2025)', u: 'https://www.federalregister.gov/documents/2025/07/30/2025-14413/prescription-drug-user-fee-rates-for-fiscal-year-2026' },
    { t: 'Ironwood and Allergan settlement with Teva resolving LINZESS patent litigation (22 Jan 2020)', u: 'https://investor.ironwoodpharma.com/press-releases/press-release-details/2020/Ironwood-and-Allergan-Announce-Settlement-with-Teva-Resolving-LINZESS-linaclotide-Patent-Litigation/default.aspx' },
    { t: 'Ironwood Pharmaceuticals FY2025 results and FY2026 outlook', u: 'https://investor.ironwoodpharma.com/press-releases/press-release-details/2026/Ironwood-Pharmaceuticals-Reports-Fourth-Quarter-and-Full-Year-2025-Results-Achieves-2025-Financial-Guidance-and-Reiterates-Strong-2026-Outlook/default.aspx' },
    { t: 'Fierce Pharma — The top 10 drugs losing US exclusivity in 2026', u: 'https://www.fiercepharma.com/special-reports/top-10-drugs-losing-us-exclusivity-2026' },
    { t: 'GEN — Top 20 Drugs Heading for the Patent Cliff, 2026–2029', u: 'https://www.genengnews.com/topics/drug-discovery/top-20-drugs-heading-for-the-patent-cliff-2026-2029/' },
    { t: 'Glatt — fluid bed granulation, Wurster coating technology pages', u: 'https://www.glatt.com/technologies/coating/' }
  ]
};
