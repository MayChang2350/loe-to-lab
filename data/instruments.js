/* ============================================================================
   instruments.js — five analytical instruments, in the same shape as
   data/unitops.js (id, name, tagline, why, tryThis, controls, solve,
   readouts, verdict, deep, animate) so they slot into the process-lab tab
   shell exactly like the six unit operations and the fluid bed do.
   ----------------------------------------------------------------------------
   These sit next to the unit operations rather than in a separate gallery:
   the unit ops model the machines that MAKE the batch, these model the
   instruments that MEASURE it. Same teaching-instrument caveat as
   unitops.js applies — lumped, empirical, illustrative of direction and
   rough magnitude, not a vendor's real instrument firmware.
   ========================================================================== */

/* ============================================================================
   7 · HPLC — HIGH-PERFORMANCE LIQUID CHROMATOGRAPHY
   ========================================================================== */

const OP_HPLC = {
  id: 'hplc',
  icon: 'hplc',
  name: { en: 'HPLC', zh: '高效液相層析儀 (HPLC)' },
  tagline: { en: 'Separating and quantifying — the workhorse assay', zh: '分離與定量——最主要的分析方法' },
  why: {
    en: 'A pump drives the sample through a packed column under high pressure. Different compounds travel through the packing at different speeds, so they reach the detector at different times — separated instead of mixed. Retention time identifies what a peak is; peak area says how much of it there is. This one instrument runs assay, purity/related-substances and most dissolution-sample analysis behind this site\'s specs.',
    zh: '幫浦以高壓將樣品推送通過填充管柱。不同化合物在填充物中移動的速度不同，因此會在不同時間抵達偵測器——被分離而非混在一起。滯留時間判斷這是什麼波峰；波峰面積判斷含量多少。這一台儀器包辦了本站規格背後大部分的含量分析、純度／相關物質分析與多數溶離樣品分析。'
  },
  tryThis: {
    en: 'Drop the organic modifier toward 10% and watch retention time climb as everything sticks harder to the column. Then push injection volume to the top and see resolution quietly degrade even though nothing else changed.',
    zh: '把有機溶劑比例降到接近 10%，看滯留時間如何攀升——因為所有東西都更緊抓著管柱不放。接著把注入體積推到最高，看解析度在其他條件都沒變的情況下悄悄變差。'
  },
  controls: [
    { id: 'flow', label: { en: 'Flow rate', zh: '流速' }, unit: 'mL/min', min: 0.3, max: 2.5, step: 0.1, def: 1.0,
      help: { en: 'How fast the mobile phase is pumped through. Faster elutes everything sooner but gives the column less time to separate anything.', zh: '流動相被幫浦推送的速度。越快所有物質洗脫得越快，但管柱能用來分離的時間也越少。' } },
    { id: 'colLen', label: { en: 'Column length', zh: '管柱長度' }, unit: 'mm', min: 50, max: 250, step: 10, def: 150,
      help: { en: 'A longer column has more theoretical plates — more chances to separate two similar compounds — at the cost of a longer run.', zh: '管柱越長，理論板數越多——分離兩個相近化合物的機會也越多——代價是分析時間變長。' } },
    { id: 'organic', label: { en: 'Mobile phase, % organic', zh: '流動相有機溶劑比例' }, unit: '%', min: 10, max: 95, step: 5, def: 65,
      help: { en: 'On a reversed-phase column, more organic modifier elutes compounds faster. Too little and everything sticks; too much and everything runs together at the front.', zh: '在逆相管柱上，有機溶劑比例越高，化合物洗脫越快。太少，所有東西都黏著不動；太多，所有東西又會一起在前端擠出。' } },
    { id: 'injVol', label: { en: 'Injection volume', zh: '注入體積' }, unit: 'µL', min: 2, max: 50, step: 1, def: 20,
      help: { en: 'A bigger injection gives a stronger signal for a dilute sample — and a physically wider band on the column, which is resolution you are giving away for sensitivity.', zh: '較大的注入體積能為稀薄樣品帶來更強的訊號——但也會在管柱上形成物理上更寬的波帶，這是你用解析度換來的靈敏度。' } }
  ],
  solve(p) {
    const t0 = p.colLen / (p.flow * 60);                       // dead time, min
    const k = 0.8 + (95 - p.organic) / 12;                      // retention factor
    const tR = t0 * (1 + k);
    // simplified van Deemter shape: efficiency peaks near 1 mL/min on a
    // 4.6 mm column and falls off on either side (longitudinal diffusion
    // at low flow, mass-transfer resistance at high flow)
    const flowPenalty = Math.max(0.55, 1 - Math.abs(p.flow - 1.0) * 0.15);
    const N = 400 * p.colLen * flowPenalty;                     // theoretical plates
    const widthFactor = 1 + p.injVol / 100;
    const peakWidth = 4 * tR / Math.sqrt(N) * widthFactor;
    const Rs = (Math.sqrt(N) / 140) * (k / (1 + k)) / widthFactor;
    const runTime = tR * 2.2;
    return { t0, k, tR, N, peakWidth, Rs, runTime };
  },
  readouts: r => [
    { k: 'Retention time', v: r.tR.toFixed(2), u: 'min', cls: r.tR < 1.5 ? 'warn' : 'ok' },
    { k: 'Theoretical plates', v: Math.round(r.N).toLocaleString(), u: '' },
    { k: 'Resolution Rs', v: r.Rs.toFixed(2), u: '', cls: r.Rs < 1.0 ? 'bad' : r.Rs < 1.5 ? 'warn' : 'ok' },
    { k: 'Peak width', v: r.peakWidth.toFixed(2), u: 'min' },
    { k: 'Run time', v: r.runTime.toFixed(1), u: 'min' }
  ],
  verdict(r) {
    if (r.tR < 1.5) return { tone: 'bad',
      en: `Retention time is only ${r.tR.toFixed(1)} minutes — close enough to the column dead volume that the peak of interest can co-elute with unretained matrix. Increase retention (less organic, or a longer column) before trusting this peak.`,
      zh: `滯留時間僅 ${r.tR.toFixed(1)} 分鐘——太接近管柱死體積，目標波峰可能與未滯留的基質共同洗脫。在信任這個波峰之前，先增加滯留（降低有機溶劑比例，或延長管柱）。` };
    if (r.Rs < 1.0) return { tone: 'bad',
      en: `Resolution is ${r.Rs.toFixed(2)} — the peaks are running into each other. Integration will not be reproducible between analysts, and this method would not survive validation.`,
      zh: `解析度為 ${r.Rs.toFixed(2)}——波峰互相重疊。不同分析員之間的積分結果不會一致，這個方法通不過驗證。` };
    if (r.Rs < 1.5) return { tone: 'warn',
      en: `Resolution is ${r.Rs.toFixed(2)}, below the conventional 1.5 target. Usable for a quick look, not for a method you would defend to an assessor.`,
      zh: `解析度為 ${r.Rs.toFixed(2)}，低於慣例的 1.5 目標。可用於快速查看，但不是一個你敢拿去給查廠官辯護的方法。` };
    return { tone: 'ok',
      en: `Baseline-resolved: Rs ${r.Rs.toFixed(2)}, ${Math.round(r.N).toLocaleString()} plates, eluting at ${r.tR.toFixed(1)} minutes. A method you could take to validation.`,
      zh: `達到基線解析：Rs ${r.Rs.toFixed(2)}、${Math.round(r.N).toLocaleString()} 理論板數，於 ${r.tR.toFixed(1)} 分鐘洗脫。這是一個可以送去驗證的方法。` };
  },
  deep: {
    en: [
      'Resolution between two peaks depends on three things that trade against each other: how many theoretical plates the column offers, how selectively the two compounds are retained relative to each other, and how retained the later peak is relative to the dead volume. A longer column buys plates linearly but run time linearly too. Changing the organic percentage buys selectivity for free in some regions and costs it in others — which is why method development spends most of its time on the mobile phase, not the column.',
      'Injection volume is the control everyone under-respects. A bigger injection puts more mass of analyte into the column, which helps sensitivity for a dilute sample — but it also injects a physically wider slug of liquid, and that slug width adds directly to the peak width that comes out the other end. Push it too far and you are trading resolution for sensitivity without meaning to, which is exactly the failure mode this simulator is built to make visible.'
    ],
    zh: [
      '兩個波峰之間的解析度取決於三個彼此拉鋸的因素：管柱提供的理論板數、兩化合物之間的相對滯留選擇性，以及較晚波峰相對於死體積的滯留程度。管柱加長，板數線性增加，但分析時間也線性增加。改變有機溶劑比例，在某些區間能無代價地換得選擇性，在另一些區間則要付出代價——這正是為什麼方法開發大部分時間花在流動相上，而不是管柱本身。',
      '注入體積是最常被輕忽的控制項。較大的注入量能為稀薄樣品增加待測物質量、提升靈敏度——但同時也注入了物理上更寬的一段液體，而這段寬度會直接加到出峰時的波峰寬度上。推得太過頭，你就是在不知不覺中用解析度換取靈敏度——這正是本模擬器想讓你看清楚的失效模式。'
    ]
  },
  /* Live schematic: reciprocating pump, an analyte band travelling the
     column at a speed set by retention time, and a detector trace that
     draws a peak the instant the band exits — so the readouts and the
     picture are driven by the exact same solve() output. */
  animate(x, W, H, t, p, r) {
    const pumpX = W * 0.06, pumpY = H * 0.5;
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(pumpX - 12, pumpY - 15, 24, 30);
    x.fillStyle = '#2fc2c8';
    x.beginPath(); x.arc(pumpX, pumpY + Math.sin(t * 6) * 6, 4, 0, Math.PI * 2); x.fill();
    const colX0 = W * 0.2, colX1 = W * 0.6, colY = H * 0.5;
    x.strokeStyle = '#2e3742'; x.lineWidth = 2;
    x.strokeRect(colX0, colY - 15, colX1 - colX0, 30);
    const speed = 1 / Math.max(r.tR, 1);
    const bandPh = (t * speed * 0.5) % 1;
    x.fillStyle = '#4a8fd6';
    x.beginPath(); x.arc(colX0 + bandPh * (colX1 - colX0), colY, 5, 0, Math.PI * 2); x.fill();
    const detX0 = colX1 + 26, detX1 = W - 12;
    x.strokeStyle = '#4a5563';
    x.strokeRect(detX0, H * 0.12, detX1 - detX0, H * 0.76);
    const baseY = H * 0.78;
    x.beginPath();
    for (let i = 0; i <= 60; i++) {
      const xf = i / 60;
      const xx = detX0 + 4 + xf * (detX1 - detX0 - 8);
      const peak = bandPh > 0.85 ? Math.exp(-Math.pow((xf - 0.5) * 10, 2)) * (H * 0.45) : 0;
      const yy = baseY - peak;
      xf ? x.lineTo(xx, yy) : x.moveTo(xx, yy);
    }
    x.strokeStyle = '#2fc2c8'; x.lineWidth = 2; x.stroke();
  }
};

/* ============================================================================
   8 · DSC — DIFFERENTIAL SCANNING CALORIMETRY
   ========================================================================== */

const OP_DSC = {
  id: 'dsc',
  icon: 'dsc',
  name: { en: 'DSC', zh: '示差掃描熱量儀 (DSC)' },
  tagline: { en: 'Heating a milligram to find out what it is', zh: '加熱一毫克樣品，找出它究竟是什麼' },
  why: {
    en: 'A few milligrams of sample and an empty reference pan are heated at exactly the same rate, and the instrument measures the extra heat flow the sample needs to keep up. A sharp dip is a clean melt. An extra or shifted dip means a second polymorphic form, a hydrate, or an incompatibility with an excipient — the kind of finding that changes a formulation before it ever reaches the fluid bed.',
    zh: '將數毫克樣品與一個空的參考盤以完全相同的速率加熱，儀器量測樣品為了跟上升溫所需的額外熱流。一個尖銳的凹陷代表乾淨的熔化。多出來或偏移的凹陷則代表存在第二種多晶型、水合物，或與賦形劑不相容——這種發現會在處方進入流體床之前就改變它。'
  },
  tryThis: {
    en: 'Push the heat rate to the top. The peak both shifts to a higher temperature and smears wider — that is thermal lag, not a different material.',
    zh: '把升溫速率推到最高。波峰會同時往更高溫偏移並變寬——這是熱滯後，不是換了一種材料。'
  },
  controls: [
    { id: 'heatRate', label: { en: 'Heating rate', zh: '升溫速率' }, unit: '°C/min', min: 2, max: 20, step: 1, def: 10,
      help: { en: 'Faster gets you an answer sooner but gives the sample less time to stay in thermal equilibrium with the pan — the classic sensitivity-versus-resolution trade.', zh: '越快能越早得到答案，但樣品與盤子維持熱平衡的時間也越短——這是靈敏度與解析度之間的經典取捨。' } },
    { id: 'sampleMass', label: { en: 'Sample mass', zh: '樣品質量' }, unit: 'mg', min: 1, max: 10, step: 0.5, def: 3,
      help: { en: 'More sample gives a bigger, easier-to-integrate signal — and a bigger internal temperature gradient across the sample itself.', zh: '樣品越多，訊號越大、越容易積分——但樣品本身內部的溫度梯度也越大。' } },
    { id: 'startTemp', label: { en: 'Start temperature', zh: '起始溫度' }, unit: '°C', min: 20, max: 100, step: 5, def: 30,
      help: { en: 'Where the ramp begins. Has to sit below anything you expect to see.', zh: '升溫起點。必須低於任何你預期會看到的事件。' } },
    { id: 'endTemp', label: { en: 'End temperature', zh: '終止溫度' }, unit: '°C', min: 150, max: 250, step: 5, def: 200,
      help: { en: 'Where the ramp stops. Has to clear the melt with margin, or you cut the peak off mid-integration.', zh: '升溫終點。必須有足夠餘裕越過熔化事件，否則會在積分中途把波峰切斷。' } }
  ],
  solve(p) {
    const peakTemp = 150 + p.heatRate * 0.15 + p.sampleMass * 0.3;
    const peakWidth = 2 + p.heatRate * 0.25 + p.sampleMass * 0.4;
    const onsetTemp = peakTemp - peakWidth * 0.6;
    const enthalpy = p.sampleMass * 80;
    const runTime = Math.max(1, (p.endTemp - p.startTemp) / p.heatRate);
    return { peakTemp, peakWidth, onsetTemp, enthalpy, runTime };
  },
  readouts: r => [
    { k: 'Onset temperature', v: r.onsetTemp.toFixed(1), u: '°C' },
    { k: 'Peak temperature', v: r.peakTemp.toFixed(1), u: '°C' },
    { k: 'Peak width', v: r.peakWidth.toFixed(1), u: '°C', cls: r.peakWidth > 8 ? 'bad' : r.peakWidth > 5 ? 'warn' : 'ok' },
    { k: 'ΔH', v: r.enthalpy.toFixed(0), u: 'mJ' },
    { k: 'Run time', v: r.runTime.toFixed(1), u: 'min' }
  ],
  verdict(r) {
    if (r.peakWidth > 8) return { tone: 'bad',
      en: `Peak width is ${r.peakWidth.toFixed(1)} °C — badly smeared. At this rate and mass the sample cannot stay in thermal equilibrium with the pan, and the onset you are reading is shifted from the true value, not just imprecise.`,
      zh: `波峰寬度達 ${r.peakWidth.toFixed(1)} °C——嚴重糊化。在此升溫速率與質量下，樣品無法與盤子維持熱平衡，你讀到的起始溫度已經偏移，而不只是不夠精確。` };
    if (r.peakWidth > 5) return { tone: 'warn',
      en: `Peak is broadening (${r.peakWidth.toFixed(1)} °C wide). Fine for a quick polymorph screen, too soft an edge for a validated melting-point determination.`,
      zh: `波峰正在變寬（${r.peakWidth.toFixed(1)} °C）。用於快速多晶型篩選還可以，但邊緣太軟，不足以作為已驗證的熔點測定。` };
    return { tone: 'ok',
      en: `A sharp, well-resolved endotherm: onset ${r.onsetTemp.toFixed(1)} °C, peak ${r.peakTemp.toFixed(1)} °C. This is the shape a single, pure polymorphic form should give.`,
      zh: `一個尖銳、解析良好的吸熱峰：起始 ${r.onsetTemp.toFixed(1)} °C、峰值 ${r.peakTemp.toFixed(1)} °C。這正是單一純多晶型應有的形狀。` };
  },
  deep: {
    en: [
      'DSC measures heat flow, not temperature directly, and the gap between the two is where the instrument\'s limitations live. Heat has to conduct from the furnace, through the pan, into the sample — and that conduction takes time. At a fast ramp the sample genuinely lags the programmed furnace temperature, so the recorded peak sits at a higher apparent temperature than the sample\'s real melting point, and it is wider because different parts of the sample bed are at slightly different temperatures at any instant.',
      'This is why a proper polymorph or compatibility screen runs the same sample at two or three heating rates rather than one. A true polymorphic transition shifts with rate in a predictable, extrapolatable way; a spurious shoulder that only appears at one rate is usually an instrument artefact, not a second form. The rate you pick in routine QC work is a compromise between throughput and the resolution you need to tell those two apart.'
    ],
    zh: [
      'DSC 量測的是熱流而非直接量測溫度，而兩者之間的落差正是儀器限制的所在。熱必須從爐體傳導、經過坩鍋、進入樣品——而這個傳導需要時間。在快速升溫下，樣品確實會落後於程式設定的爐溫，因此記錄到的波峰會出現在比樣品真實熔點更高的表觀溫度，而且會更寬，因為樣品床的不同部位在同一瞬間處於略微不同的溫度。',
      '這正是為什麼一個嚴謹的多晶型或相容性篩選，會以兩到三種升溫速率測試同一樣品，而非只測一種。真正的多晶型轉變會隨速率以可預測、可外推的方式偏移；只在單一速率下出現的異常肩峰，通常是儀器假象而非第二種型態。例行品管工作中選擇的速率，是產能與「足以區分這兩者」的解析度之間的折衷。'
    ]
  },
  /* Live schematic: sample pan wobbles gently on the ramp beside a static
     reference pan; a pen sweeps left to right drawing the heat-flow trace,
     dipping into the endotherm at the live onset/peak/width readouts. */
  animate(x, W, H, t, p, r) {
    const panX = W * 0.16, panY = H * 0.3;
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(panX - 16, panY - 9 + Math.sin(t * 3) * 2, 32, 18);
    x.strokeRect(panX + 46 - 16, panY - 9, 32, 18);
    x.fillStyle = '#8b95a1'; x.font = '9px monospace'; x.textAlign = 'center';
    x.fillText('sample', panX, panY + 24);
    x.fillText('ref', panX + 46, panY + 24);
    x.textAlign = 'left';
    const gx0 = W * 0.06, gx1 = W * 0.96, gy = H * 0.86, gh = H * 0.42;
    x.strokeStyle = '#2e3742'; x.beginPath(); x.moveTo(gx0, gy); x.lineTo(gx1, gy); x.stroke();
    const sweep = (t * (p.heatRate / 6)) % 1;
    const range = Math.max(1, p.endTemp - p.startTemp);
    const peakFrac = (r.peakTemp - p.startTemp) / range;
    const widthFrac = Math.max(0.01, r.peakWidth / range);
    x.beginPath();
    for (let i = 0; i <= 80; i++) {
      const xf = i / 80;
      const xx = gx0 + xf * (gx1 - gx0);
      const dip = Math.exp(-Math.pow((xf - peakFrac) / widthFrac, 2)) * (gh * 0.75);
      const yy = gy - (xf <= sweep ? dip : 0);
      xf ? x.lineTo(xx, yy) : x.moveTo(xx, yy);
    }
    x.strokeStyle = '#2fc2c8'; x.lineWidth = 2; x.stroke();
    x.strokeStyle = 'rgba(74,143,214,.7)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(gx0 + sweep * (gx1 - gx0), gy - gh); x.lineTo(gx0 + sweep * (gx1 - gx0), gy); x.stroke();
  }
};

/* ============================================================================
   9 · KARL FISCHER TITRATOR
   ========================================================================== */

const OP_KF = {
  id: 'kf',
  icon: 'kf',
  name: { en: 'Karl Fischer titrator', zh: '卡爾費雪滴定儀' },
  tagline: { en: 'Titrating water, stoichiometrically, to the microgram', zh: '以化學計量方式滴定水分，精確到微克' },
  why: {
    en: 'Karl Fischer reagent reacts with water in a fixed stoichiometry, so the volume of reagent needed to reach the endpoint converts directly to a moisture content. It is one of the few assays that is genuinely selective for water rather than "loss on drying", which also drives off solvents and volatiles. Moisture content sets drying-step endpoints and is itself a critical quality attribute for a hygroscopic API.',
    zh: '卡爾費雪試劑與水以固定的化學計量反應，因此到達終點所需的試劑體積可直接換算成水分含量。這是少數真正對水具有選擇性的分析方法之一，不同於「乾燥減重」——那還會一併帶走溶劑與揮發物。水分含量決定乾燥步驟的終點，對吸濕性原料藥而言，它本身就是一項關鍵品質屬性。'
  },
  tryThis: {
    en: 'Drop the sample mass to its minimum and watch the relative uncertainty climb — a titration is only as good as the volume of titrant it actually gets to measure.',
    zh: '把樣品質量降到最低，看相對不確定度如何攀升——一次滴定的好壞，取決於它實際能量測到的滴定劑體積。'
  },
  controls: [
    { id: 'sampleMass', label: { en: 'Sample mass', zh: '樣品質量' }, unit: 'g', min: 0.1, max: 2, step: 0.05, def: 0.5,
      help: { en: 'A bigger sample delivers more titrant volume for the same moisture level, which is what actually controls precision here — not the instrument.', zh: '樣品越大，在相同水分含量下能滴出的試劑體積就越多，而這正是決定精密度的關鍵——不是儀器本身。' } },
    { id: 'titrantTiter', label: { en: 'Titrant titer', zh: '滴定劑力價' }, unit: 'mg H₂O/mL', min: 2, max: 6, step: 0.5, def: 5,
      help: { en: 'How much water one millilitre of reagent can react with. A weaker titer gives a bigger, easier-to-read volume for a low-moisture sample.', zh: '一毫升試劑能反應掉的水量。力價較弱時，對低水分樣品能給出較大、較易讀取的滴定體積。' } },
    { id: 'stirRpm', label: { en: 'Stir rate', zh: '攪拌速率' }, unit: 'rpm', min: 200, max: 800, step: 25, def: 500,
      help: { en: 'Poor mixing makes the endpoint drift instead of arriving cleanly — the electrode reads a local, not a representative, concentration.', zh: '攪拌不足會讓終點漂移而非乾淨地到達——電極讀到的是局部濃度，而非有代表性的濃度。' } }
  ],
  solve(p) {
    const trueMoisturePct = 0.35;  // a fixed generic reference sample for this teaching instrument
    const titrantVol = p.sampleMass * 1000 * trueMoisturePct / 100 / p.titrantTiter;
    const relError = Math.min(60, 6 / Math.max(p.sampleMass, 0.05));
    const titrationTime = Math.max(0.3, titrantVol * 0.9 + 0.4) * (500 / Math.max(p.stirRpm, 100));
    return { titrantVol, relError, titrationTime, measuredMoisture: trueMoisturePct, titrantTiter: p.titrantTiter };
  },
  readouts: r => [
    { k: 'Titrant volume', v: r.titrantVol.toFixed(3), u: 'mL', cls: r.titrantVol < 0.1 ? 'bad' : r.titrantVol < 0.3 ? 'warn' : 'ok' },
    { k: 'Titration time', v: r.titrationTime.toFixed(1), u: 'min' },
    { k: 'Measured moisture', v: r.measuredMoisture.toFixed(2), u: '%' },
    { k: 'Relative uncertainty', v: r.relError.toFixed(0), u: '%', cls: r.relError > 25 ? 'bad' : r.relError > 12 ? 'warn' : 'ok' },
    { k: 'Titrant titer', v: r.titrantTiter.toFixed(1), u: 'mg H₂O/mL' }
  ],
  verdict(r) {
    if (r.titrantVol < 0.1) return { tone: 'bad',
      en: `Only ${r.titrantVol.toFixed(3)} mL of titrant is being consumed — below what most burettes can dose or read reliably. Increase sample mass or switch to a weaker titer before trusting this number.`,
      zh: `僅消耗 ${r.titrantVol.toFixed(3)} mL 滴定劑——低於多數滴定管能可靠加液或讀取的範圍。在信任這個數字之前，先增加樣品質量或換用力價較弱的試劑。` };
    if (r.relError > 25) return { tone: 'warn',
      en: `Relative uncertainty is ${r.relError.toFixed(0)} %. At this sample size, drift from ambient humidity while weighing can matter as much as the result itself.`,
      zh: `相對不確定度為 ${r.relError.toFixed(0)} %。在此樣品量下，秤重過程中環境濕度造成的漂移，其影響可能不亞於量測結果本身。` };
    if (r.stirRpm < 250) return { tone: 'warn',
      en: 'Stirring is sluggish. Expect the endpoint to drift rather than arrive cleanly, and different analysts will call the endpoint at slightly different volumes.',
      zh: '攪拌偏弱。預期終點會漂移而非乾淨到達，不同分析員判定終點時所讀取的體積也會略有不同。' };
    return { tone: 'ok',
      en: `A clean titration: ${r.titrantVol.toFixed(3)} mL of titrant, ${r.relError.toFixed(0)} % relative uncertainty. Reliable enough to set a drying-step endpoint against.`,
      zh: `一次乾淨的滴定：消耗 ${r.titrantVol.toFixed(3)} mL 滴定劑、相對不確定度 ${r.relError.toFixed(0)} %。可靠到足以作為設定乾燥終點的依據。` };
  },
  deep: {
    en: [
      'Karl Fischer chemistry is a two-step redox reaction in which iodine oxidises sulfur dioxide, and that reaction only proceeds in the presence of water in an exact 1:1 relationship with the water consumed. That stoichiometric relationship is what makes the method absolute — it does not need a calibration curve built from standards the way a chromatographic assay does, only a titer that is itself checked against a water standard.',
      'The practical failure mode is almost always sample size, not chemistry. A titration reports a volume, and a volume has an absolute reading uncertainty set by the burette regardless of how small the true quantity is. Shrink the sample and you shrink the titrant volume proportionally, so the relative uncertainty grows — which is why a moisture spec written for a 1 g sample cannot simply be run on 100 mg and trusted to the same number of decimal places.'
    ],
    zh: [
      '卡爾費雪化學反應是一個兩步驟的氧化還原反應，其中碘氧化二氧化硫，而這個反應僅在有水存在時才會進行，且與消耗的水呈精確的 1:1 關係。正是這個化學計量關係使這個方法成為一種絕對方法——它不像層析分析那樣需要用標準品建立校正曲線，只需要一個本身已對水標準品校驗過的力價。',
      '實務上的失效模式幾乎總是樣品量的問題，而非化學問題。滴定報告的是一個體積，而體積有一個由滴定管決定的絕對讀取不確定度，無論真實含量有多小都一樣。縮小樣品，滴定劑體積也會按比例縮小，因此相對不確定度會上升——這正是為什麼針對 1 克樣品所寫的水分規格，不能直接拿 100 毫克來跑，還期待得到相同小數位數的可信結果。'
    ]
  },
  /* Live schematic: titrant drops fall from the burette into the beaker at
     a rate tied to the stir setting; the liquid tints amber once the cycle
     nears the endpoint, then resets — a visual stand-in for one titration. */
  animate(x, W, H, t, p, r) {
    const bx = W * 0.5, burTop = H * 0.05, burBot = H * 0.36;
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(bx - 6, burTop, 12, burBot - burTop);
    const cycle = (t * (0.4 + p.stirRpm / 1500)) % 1;
    if (cycle < 0.85) {
      const dropY = burBot + (cycle / 0.85) * (H * 0.28);
      x.fillStyle = '#4a8fd6';
      x.beginPath(); x.arc(bx, dropY, 3, 0, Math.PI * 2); x.fill();
    }
    const by0 = H * 0.6, by1 = H * 0.92, bw = W * 0.22;
    x.strokeStyle = '#2e3742';
    x.beginPath();
    x.moveTo(bx - bw, by0); x.lineTo(bx - bw, by1 - 10);
    x.quadraticCurveTo(bx - bw, by1, bx - bw + 10, by1);
    x.lineTo(bx + bw - 10, by1);
    x.quadraticCurveTo(bx + bw, by1, bx + bw, by1 - 10);
    x.lineTo(bx + bw, by0);
    x.stroke();
    const nearEnd = cycle > 0.8;
    x.fillStyle = nearEnd ? 'rgba(216,161,60,.55)' : 'rgba(74,143,214,.32)';
    x.fillRect(bx - bw + 2, by0 + 16, bw * 2 - 4, by1 - by0 - 18);
    const sxp = bx + Math.cos(t * (p.stirRpm / 60)) * bw * 0.55;
    x.fillStyle = '#8b95a1';
    x.beginPath(); x.ellipse(sxp, by1 - 7, 6, 2, 0, 0, Math.PI * 2); x.fill();
  }
};

/* ============================================================================
   10 · LASER DIFFRACTION PARTICLE SIZE ANALYZER
   ========================================================================== */

const OP_PSA = {
  id: 'psa',
  icon: 'psa',
  name: { en: 'Laser diffraction PSD analyzer', zh: '雷射繞射粒徑分析儀' },
  tagline: { en: 'Reading particle size off a scattering pattern', zh: '從散射圖樣讀出粒徑' },
  why: {
    en: 'A laser beam passes through a dispersed stream of particles; each particle scatters light at an angle that depends on its size — small particles scatter wide, large particles scatter narrow. A detector ring captures the whole pattern and the software inverts it into a size distribution in seconds. This is the instrument that checks whether the mill down the hall actually hit its target.',
    zh: '雷射光束穿過一股分散的顆粒流；每顆顆粒依其大小以不同角度散射光線——小顆粒散射角度寬，大顆粒散射角度窄。環形偵測器擷取整個散射圖樣，軟體在數秒內將其反演為粒徑分布。這台儀器負責檢查隔壁的整粒機是否真的打中了目標。'
  },
  tryThis: {
    en: 'Start the dispersion pressure low and watch D50 read high — agglomerates, not primary particles. Then push pressure past 3 bar and watch D50 fall further than it should, for the wrong reason.',
    zh: '一開始把分散壓力調低，看 D50 讀值偏高——那是團聚體，不是初級顆粒。接著把壓力推過 3 bar，看 D50 因為錯誤的原因而下降得比它該有的更多。'
  },
  controls: [
    { id: 'dispersionPressure', label: { en: 'Dispersion pressure', zh: '分散壓力' }, unit: 'bar', min: 0.5, max: 4, step: 0.1, def: 2,
      help: { en: 'The air pressure used to break agglomerates apart before they cross the beam. Too little and you measure clumps; too much and you measure fragments you created yourself.', zh: '在顆粒通過光束前，用來打散團聚體的空氣壓力。太低會量到團塊；太高則會量到自己打碎出來的碎片。' } },
    { id: 'obscuration', label: { en: 'Obscuration', zh: '遮蔽率' }, unit: '%', min: 5, max: 30, step: 1, def: 12,
      help: { en: 'How much of the laser the sample stream blocks. Too little is noisy; too much causes multiple scattering that the software cannot correct for.', zh: '樣品流遮蔽雷射的比例。太低訊噪比差；太高會產生軟體無法校正的多重散射。' } }
  ],
  solve(p) {
    const baseD50 = 250;
    let d50 = baseD50 * (1 + 3 * Math.exp(-p.dispersionPressure * 1.2));
    if (p.dispersionPressure > 2.5) d50 -= (p.dispersionPressure - 2.5) * 15;
    d50 = Math.max(30, d50);
    const span = 1.0 + Math.max(0, 2.5 - p.dispersionPressure) * 0.6 + Math.max(0, p.dispersionPressure - 2.5) * 0.5;
    const d10 = d50 / (1 + span * 0.5);
    const d90 = d50 * (1 + span * 0.55);
    const obscurationLow = p.obscuration < 8;
    const obscurationHigh = p.obscuration > 20;
    return { d50, d10, d90, span, obscurationLow, obscurationHigh, obscuration: p.obscuration };
  },
  readouts: r => [
    { k: 'D10', v: r.d10.toFixed(0), u: 'µm' },
    { k: 'D50', v: r.d50.toFixed(0), u: 'µm' },
    { k: 'D90', v: r.d90.toFixed(0), u: 'µm' },
    { k: 'Span', v: r.span.toFixed(2), u: '', cls: r.span > 2 ? 'warn' : 'ok' },
    { k: 'Obscuration', v: r.obscuration.toFixed(0), u: '%', cls: (r.obscurationLow || r.obscurationHigh) ? 'bad' : 'ok' },
    { k: 'Measurement status', v: r.obscurationHigh ? 'multiple scattering' : r.obscurationLow ? 'signal too weak' : 'valid', u: '' }
  ],
  verdict(r) {
    if (r.obscurationHigh) return { tone: 'bad',
      en: `Obscuration is ${r.obscuration.toFixed(0)} % — high enough that light scattered by one particle is being rescattered by another before it reaches the detector. The reported D50 is biased and the software cannot correct for it. Dilute the dispersion.`,
      zh: `遮蔽率為 ${r.obscuration.toFixed(0)} %——高到一顆顆粒散射的光在抵達偵測器前又被另一顆顆粒重新散射。回報的 D50 已有偏差，軟體無法校正。請稀釋分散液。` };
    if (r.obscurationLow) return { tone: 'warn',
      en: `Obscuration is only ${r.obscuration.toFixed(0)} % — too little sample in the beam for a reliable signal-to-noise ratio. Add more sample before reading the result.`,
      zh: `遮蔽率僅 ${r.obscuration.toFixed(0)} %——光束中的樣品量太少，訊噪比不可靠。請先增加樣品量再讀取結果。` };
    if (r.span > 2.2) return { tone: 'warn',
      en: `Span is ${r.span.toFixed(1)} — either the dispersion pressure has not fully broken up agglomerates, or it has overshot into attrition. Neither error looks different from a genuinely wide powder without checking the pressure setting.`,
      zh: `Span 為 ${r.span.toFixed(1)}——分散壓力可能未完全打散團聚體，也可能已過度打碎產生磨耗。若不檢查壓力設定，這兩種誤差看起來都與真正寬分佈的粉體無異。` };
    return { tone: 'ok',
      en: `D50 ${r.d50.toFixed(0)} µm, span ${r.span.toFixed(2)}, obscuration in range. A reading you can compare directly against the mill's own D50 readout.`,
      zh: `D50 為 ${r.d50.toFixed(0)} µm、span ${r.span.toFixed(2)}、遮蔽率落在範圍內。這個讀值可以直接拿去和整粒機自己的 D50 讀值比較。` };
  },
  deep: {
    en: [
      'Laser diffraction measures an optical signal, not particle size directly — the software assumes a scattering model (typically Mie theory, with Fraunhofer as a simplification for large, opaque particles) and inverts the observed pattern into a size distribution under that assumption. That inversion is only as good as the dispersion in front of it: the instrument cannot tell the difference between one real 400 µm particle and ten real 100 µm particles stuck together, because both scatter light the same way.',
      'This is why dispersion pressure is not a nuisance setting to standardise once and forget — it is the actual measurement variable. Too little pressure and you are measuring agglomerate size, not the primary particle size the mill was actually trying to hit. Too much and the air stream itself becomes a miniature mill, fracturing genuinely large particles into fragments that were never there in the powder. The right pressure is the one where D50 stops changing as you increase it further — the plateau is the signal that agglomerates are broken and attrition has not yet started.'
    ],
    zh: [
      '雷射繞射量測的是光學訊號，而非直接量測粒徑——軟體假設一種散射模型（通常是 Mie 理論，對於大而不透光的顆粒則簡化為 Fraunhofer 近似），並在此假設下將觀測到的圖樣反演為粒徑分布。這個反演的好壞，取決於它前面的分散做得好不好：儀器無法分辨「一顆真正 400 µm 的顆粒」與「十顆黏在一起的真正 100 µm 顆粒」，因為兩者散射光的方式完全相同。',
      '這正是為什麼分散壓力不是一個「校準一次就不用管」的次要設定——它本身就是實際的量測變數。壓力太低，你量到的是團聚體大小，而不是整粒機真正想打中的初級顆粒大小。壓力太高，氣流本身就變成一台微型整粒機，把原本真正的大顆粒打碎成粉體中根本不存在的碎片。正確的壓力，是「再增加也不會讓 D50 繼續改變」的那個點——這個平台期正是「團聚體已打散、磨耗尚未開始」的訊號。'
    ]
  },
  /* Live schematic: laser through a sample cell, scattering rings pulsing
     outward at a spread tied to the live D50 — smaller particles scatter
     wider, matching the physical principle rather than just naming it. */
  animate(x, W, H, t, p, r) {
    const lx = W * 0.08, ly = H * 0.5;
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(lx - 10, ly - 8, 20, 16);
    x.strokeStyle = 'rgba(74,143,214,.7)'; x.setLineDash([3, 3]); x.lineWidth = 1;
    x.beginPath(); x.moveTo(lx + 10, ly); x.lineTo(W * 0.42, ly); x.stroke(); x.setLineDash([]);
    const cx = W * 0.5, cy = H * 0.5;
    x.fillStyle = '#8b95a1';
    x.beginPath(); x.arc(cx, cy, 9, 0, Math.PI * 2); x.fill();
    const maxSpread = Math.min(W, H) * 0.32;
    const s = Math.min(maxSpread, (280 / Math.max(r.d50, 40)) * 24);
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.7) + i / 3) % 1;
      x.strokeStyle = `rgba(47,194,200,${(1 - ph).toFixed(2)})`;
      x.lineWidth = 2;
      x.beginPath(); x.arc(cx, cy, 12 + ph * s, 0, Math.PI * 2); x.stroke();
    }
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(W * 0.8, H * 0.16, W * 0.14, H * 0.68);
  }
};

/* ============================================================================
   11 · FTIR SPECTROMETER
   ========================================================================== */

const OP_FTIR = {
  id: 'ftir',
  icon: 'ftir',
  name: { en: 'FTIR spectrometer', zh: 'FTIR 傅立葉轉換紅外光譜儀' },
  tagline: { en: 'Fingerprinting chemical bonds', zh: '為化學鍵結建立指紋圖譜' },
  why: {
    en: 'Infrared light is absorbed by molecular bonds at wavelengths specific to each bond type, so the resulting spectrum is close to a fingerprint of the compound. A moving mirror inside a Michelson interferometer scans and records an interference pattern for every wavelength simultaneously, and a Fourier transform converts that into the spectrum. It is the fastest way to confirm raw-material identity at goods receipt, and it can tell two polymorphs apart when other methods cannot.',
    zh: '紅外光會被分子鍵結在其特定波長吸收，因此所得光譜近似於該化合物的指紋。麥克森干涉儀內的移動鏡片掃描，同時為每個波長記錄干涉圖樣，再以傅立葉轉換將其轉為光譜。這是原料進廠時確認身分最快的方法，也能在其他方法無法區分時，分辨出兩種多晶型。'
  },
  tryThis: {
    en: 'Drop contact pressure to its minimum and watch the spectrum go weak and unstable. Then push scans to the maximum and watch the noise floor drop instead — signal averaging, not better contact, is what cleaned it up.',
    zh: '把接觸壓力調到最低，看光譜變弱且不穩定。接著把掃描次數推到最大，看雜訊基線反而下降——是訊號平均化把它變乾淨的，不是更好的接觸。'
  },
  controls: [
    { id: 'scans', label: { en: 'Co-added scans', zh: '共加掃描次數' }, unit: '', min: 4, max: 64, step: 4, def: 16,
      help: { en: 'Each scan is noisy on its own; averaging many together cancels random noise while the real spectrum reinforces itself. Doubling scans buys roughly √2 more signal-to-noise, not double.', zh: '每次單獨掃描都帶有雜訊；把多次平均起來會抵消隨機雜訊，而真實光譜則會相互加強。掃描次數加倍，訊噪比大約提升 √2 倍，而不是兩倍。' } },
    { id: 'resolution', label: { en: 'Spectral resolution', zh: '光譜解析度' }, unit: 'cm⁻¹', min: 1, max: 8, step: 1, def: 4,
      help: { en: 'A smaller number is finer resolution — narrower bands stay separated — but each scan takes longer and carries less energy per data point, which costs signal-to-noise.', zh: '數字越小代表解析度越細——較窄的譜帶能維持分離——但每次掃描耗時更長，且每個資料點所含的能量更少，會犧牲訊噪比。' } },
    { id: 'contactPressure', label: { en: 'ATR contact pressure', zh: 'ATR 接觸壓力' }, unit: '', min: 1, max: 5, step: 0.5, def: 3,
      help: { en: 'How firmly the sample is pressed onto the ATR crystal. Too little and the optical contact is poor; too much risks scratching the crystal or crushing a fragile sample.', zh: '樣品壓在 ATR 晶體上的力道。太輕，光學接觸不良；太重，可能刮傷晶體或壓碎脆弱的樣品。' } }
  ],
  solve(p) {
    const snr = 40 * Math.sqrt(p.scans) / p.resolution;
    const runTime = p.scans * (8 / p.resolution) * 0.35;
    const poorContact = p.contactPressure < 1.5;
    const excessPressure = p.contactPressure > 4.5;
    return { snr, runTime, poorContact, excessPressure, scans: p.scans, resolution: p.resolution };
  },
  readouts: r => [
    { k: 'Signal-to-noise', v: r.snr.toFixed(0), u: '', cls: r.snr < 15 ? 'bad' : r.snr < 30 ? 'warn' : 'ok' },
    { k: 'Run time', v: r.runTime.toFixed(0), u: 's' },
    { k: 'Resolution', v: r.resolution.toFixed(0), u: 'cm⁻¹' },
    { k: 'Scans co-added', v: r.scans.toFixed(0), u: '' },
    { k: 'Contact quality', v: r.excessPressure ? 'excessive' : r.poorContact ? 'poor' : 'good', u: '', cls: r.excessPressure ? 'warn' : r.poorContact ? 'bad' : 'ok' }
  ],
  verdict(r) {
    if (r.poorContact) return { tone: 'bad',
      en: 'Contact pressure is too low. Air gaps between the sample and the ATR crystal weaken and distort every band — this spectrum will under-report absorbance and cannot be trusted for identity confirmation.',
      zh: '接觸壓力過低。樣品與 ATR 晶體之間的空氣間隙會削弱並扭曲每一個譜帶——這份光譜的吸光度會被低估，不能用來確認身分。' };
    if (r.excessPressure) return { tone: 'warn',
      en: 'Contact pressure is high enough to risk scratching the crystal or crushing a soft sample. Back it off — you already have good optical contact well below this setting.',
      zh: '接觸壓力已高到有刮傷晶體或壓碎軟質樣品的風險。請降低壓力——遠低於此設定就已能得到良好的光學接觸。' };
    if (r.snr < 15) return { tone: 'warn',
      en: `Signal-to-noise is only ${r.snr.toFixed(0)}. Weak bands will be hard to distinguish from baseline noise — add more scans rather than pressing harder.`,
      zh: `訊噪比僅 ${r.snr.toFixed(0)}。較弱的譜帶會難以與基線雜訊區分——請增加掃描次數，而非加大壓力。` };
    return { tone: 'ok',
      en: `A clean spectrum: signal-to-noise ${r.snr.toFixed(0)}, good ATR contact. Bands are resolved enough to match confidently against a reference library.`,
      zh: `一份乾淨的光譜：訊噪比 ${r.snr.toFixed(0)}、ATR 接觸良好。譜帶解析度足以有信心地與參考資料庫比對。` };
  },
  deep: {
    en: [
      'Signal averaging is the whole trick behind FTIR\'s speed. A single scan is dominated by random detector and source noise; average N independent scans and the real signal — which is identical scan to scan — adds coherently while the noise, being random, only grows as the square root of N. That is why doubling scan count improves signal-to-noise by about 40 %, not 100 %, and why chasing a clean spectrum through scan count alone has diminishing returns.',
      'Resolution and signal-to-noise pull against each other through the interferometer\'s mirror travel. Finer resolution requires the mirror to travel further before the interferogram is captured, which spreads the same total energy over a longer scan and more data points — so at fixed measurement time, sharpening resolution costs signal-to-noise, and the two controls in this simulator are not independent even though they look like it.'
    ],
    zh: [
      '訊號平均化正是 FTIR 之所以快速的整個訣竅所在。單一次掃描主要受隨機的偵測器與光源雜訊主導；將 N 次獨立掃描平均起來，逐次相同的真實訊號會相干疊加，而隨機的雜訊則僅以 N 的平方根成長。這正是為什麼掃描次數加倍只能讓訊噪比提升約 40%，而不是 100%，也是為什麼單靠增加掃描次數來追求乾淨光譜的效益會遞減。',
      '解析度與訊噪比透過干涉儀的鏡片行程相互拉鋸。更細的解析度需要鏡片行進更遠才能擷取干涉圖，這會把相同的總能量分散到更長的掃描與更多的資料點上——因此在固定的量測時間下，提升解析度會犧牲訊噪比，本模擬器中這兩個控制項雖然看似獨立，實則並非如此。'
    ]
  },
  /* Live schematic: interferometer mirror sweeps back and forth; a spectrum
     trace draws with jitter proportional to (20 - SNR), so a genuinely
     noisy setting looks visibly noisy rather than just reading badly. */
  animate(x, W, H, t, p, r) {
    const bx = W * 0.08, by = H * 0.5;
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(bx - 8, by - 9, 16, 18);
    const mirrorX = W * 0.28 + Math.sin(t * 3) * 12;
    x.strokeStyle = '#2fc2c8'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(mirrorX, by - 15); x.lineTo(mirrorX, by + 15); x.stroke();
    x.strokeStyle = 'rgba(74,143,214,.6)'; x.lineWidth = 1; x.setLineDash([2, 3]);
    x.beginPath(); x.moveTo(bx + 8, by); x.lineTo(mirrorX, by); x.stroke();
    x.beginPath(); x.moveTo(mirrorX, by); x.lineTo(W * 0.5, by); x.stroke();
    x.setLineDash([]);
    const gx0 = W * 0.56, gx1 = W * 0.94, gy = H * 0.84, gh = H * 0.62;
    x.strokeStyle = '#2e3742'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(gx0, gy); x.lineTo(gx1, gy); x.stroke();
    const noise = Math.max(0, (20 - r.snr) / 20);
    x.beginPath();
    for (let i = 0; i <= 60; i++) {
      const xf = i / 60;
      const xx = gx0 + xf * (gx1 - gx0);
      const peak1 = Math.exp(-Math.pow((xf - 0.3) * 14, 2)) * gh * 0.55;
      const peak2 = Math.exp(-Math.pow((xf - 0.65) * 10, 2)) * gh * 0.75;
      const jitter = Math.sin(i * 13 + t * 20) * noise * gh * 0.14;
      const yy = gy - peak1 - peak2 - jitter;
      xf ? x.lineTo(xx, yy) : x.moveTo(xx, yy);
    }
    x.strokeStyle = '#4a8fd6'; x.lineWidth = 1.5; x.stroke();
  }
};

UNIT_OPS.push(OP_HPLC, OP_DSC, OP_KF, OP_PSA, OP_FTIR);
