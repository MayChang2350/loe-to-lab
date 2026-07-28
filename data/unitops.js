/* ============================================================================
   unitops.js — interactive models for six unit operations
   ----------------------------------------------------------------------------
   Each operation is a self-contained object:

     id, name, tagline, why      what it is, in plain language
     tryThis                     a prompt telling you what to go and break
     controls[]                  sliders and selects, with a help note each
     solve(p)                    the model — returns numbers
     readouts(r)                 what to show on the panel
     verdict(r)                  plain-language "what you'd see on the bench"
     deep                        the reasoning, hidden until asked for

   The models are lumped and empirical. They reproduce the DIRECTION and rough
   magnitude of every response and put the failure modes in the right place.
   They are teaching instruments, not process models of any real product.
   ========================================================================== */

/* ---------- shared maths ------------------------------------------------ */

const clamp01u = x => Math.max(0, Math.min(1, x));
// standard normal CDF (Abramowitz & Stegun 26.2.17)
function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
// log-normal volume distribution helpers
const lnD10 = (d50, sg) => d50 * Math.pow(sg, -1.2816);
const lnD90 = (d50, sg) => d50 * Math.pow(sg, 1.2816);
const lnBelow = (x, d50, sg) => normCdf(Math.log(x / d50) / Math.log(sg));

/* f2 similarity factor. Returns {f2, valid, reason} — the validity rule
   matters as much as the number: f2 is only meaningful with no more than one
   mean point above 85 % in either profile. */
function f2Factor(ref, test) {
  const n = ref.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.pow(ref[i] - test[i], 2);
  const f2 = 50 * Math.log10(100 / Math.sqrt(1 + sum / n));
  const above = a => a.filter(v => v > 85).length;
  const valid = above(ref) <= 1 && above(test) <= 1;
  return { f2: Math.min(100, f2), valid };
}

/* ============================================================================
   1 · MILLING AND PARTICLE SIZE
   ========================================================================== */

const OP_PSD = {
  id: 'psd',
  icon: 'psd',
  name: { en: 'Milling & particle size', zh: '整粒與粒徑分佈' },
  tagline: { en: 'Turning lumps into a controlled size distribution', zh: '把結塊變成受控的粒徑分佈' },
  why: {
    en: 'After granulation you have a mixture of fine powder and hard lumps. A mill pushes everything through a screen so that what comes out has a predictable size. Size decides almost everything downstream — how the powder flows into a tablet die, how evenly the drug is spread through the batch, and how fast the finished product dissolves.',
    zh: '造粒之後，你手上是細粉與硬塊的混合物。整粒機讓所有物料通過篩網，使產出具有可預期的粒徑。粒徑幾乎決定了下游的一切——粉體如何流入模孔、藥物在批次中分佈得多均勻，以及成品溶離得多快。'
  },
  tryThis: {
    en: 'Push the rotor speed to the top and watch the fines climb. Then look at what happens to flow — this is the trade every formulator argues about.',
    zh: '把轉子速度推到最高，看細粉如何攀升。然後看流動性發生了什麼——這正是每個處方人員爭論不休的取捨。'
  },
  controls: [
    { id: 'screen', label: { en: 'Screen aperture', zh: '篩網孔徑' }, unit: 'µm', min: 250, max: 1500, step: 25, def: 800,
      help: { en: 'The size of the holes the material is forced through. The coarsest single control you have.', zh: '物料被迫通過的孔洞大小。這是你手上最粗略的一個控制項。' } },
    { id: 'rpm', label: { en: 'Rotor speed', zh: '轉子速度' }, unit: 'rpm', min: 500, max: 8000, step: 100, def: 2500,
      help: { en: 'How hard the impeller hits the material. More speed means smaller particles — and more fines you did not ask for.', zh: '葉輪撞擊物料的力度。轉速越高粒子越小——同時產生你並未要求的細粉。' } },
    { id: 'feed', label: { en: 'Feed rate', zh: '進料速率' }, unit: 'kg/h', min: 5, max: 80, step: 1, def: 25,
      help: { en: 'Feed too fast and material passes through half-milled; feed too slow and it is beaten longer than it needs.', zh: '進料太快，物料只被磨到一半就通過；進料太慢，物料被打得比需要的更久。' } },
    { id: 'friab', label: { en: 'Granule friability', zh: '顆粒脆性' }, unit: '1–5', min: 1, max: 5, step: 1, def: 3,
      help: { en: 'A material property, not a machine setting. Soft granules shatter into fines; hard ones resist. This is set upstream, in granulation.', zh: '這是物料性質而非機台設定。軟顆粒會碎成細粉，硬顆粒則抗碎。它在上游的造粒階段就決定了。' } }
  ],
  solve(p) {
    const d50 = p.screen * 0.42 * Math.pow(2500 / p.rpm, 0.30) * (1 + (5 - p.friab) * 0.06) * (1 + p.feed / 400);
    const sg = 1.50 + p.rpm / 14000 + p.friab * 0.055 + p.feed / 900;
    const d10 = lnD10(d50, sg);
    // The screen is a hard cut, not a suggestion: the upper tail is truncated
    // near the aperture rather than running on as an untruncated lognormal.
    const d90 = Math.min(lnD90(d50, sg), p.screen * 1.15);
    const span = (d90 - d10) / d50;
    // fines: lognormal tail plus impact attrition that a pure lognormal misses
    const finesLN = lnBelow(45, d50, sg) * 100;
    const finesAttr = Math.pow(p.rpm / 8000, 1.5) * 9 * (p.friab / 3);
    const fines = Math.min(45, finesLN + finesAttr);
    // Oversize is bypass — material shoved through half-milled because the mill
    // is overloaded or turning too slowly. It is a throughput failure, not a
    // property of where the median happens to sit.
    const oversize = Math.min(30, 0.6 + 5.5 * Math.pow(p.feed / 80, 1.4) * Math.pow(2500 / p.rpm, 0.5));

    // downstream consequences
    const flowIndex = clamp01u(1 - fines / 22 - Math.max(0, (200 - d50)) / 320);   // 1 = free flowing
    const carr = 8 + (1 - flowIndex) * 26;                                          // Carr compressibility index %
    const segRisk = clamp01u((span - 1.4) / 1.8);
    const dissolRate = Math.pow(250 / Math.max(d50, 30), 0.5);                      // relative, vs 250 µm ref
    return { d50, sg, d10, d90, span, fines, oversize, flowIndex, carr, segRisk, dissolRate };
  },
  readouts: r => [
    { k: 'D10', v: r.d10.toFixed(0), u: 'µm' },
    { k: 'D50', v: r.d50.toFixed(0), u: 'µm' },
    { k: 'D90', v: r.d90.toFixed(0), u: 'µm' },
    { k: 'Span', v: r.span.toFixed(2), u: '', cls: r.span > 2.4 ? 'warn' : 'ok' },
    { k: 'Fines <45µm', v: r.fines.toFixed(1), u: '%', cls: r.fines > 14 ? 'bad' : r.fines > 8 ? 'warn' : 'ok' },
    { k: 'Carr index', v: r.carr.toFixed(0), u: '%', cls: r.carr > 25 ? 'bad' : r.carr > 18 ? 'warn' : 'ok' },
    { k: 'Segregation risk', v: r.segRisk.toFixed(2), u: '', cls: r.segRisk > 0.6 ? 'bad' : r.segRisk > 0.35 ? 'warn' : 'ok' },
    { k: 'Rel. dissolution', v: r.dissolRate.toFixed(2), u: '×', cls: 'ok' }
  ],
  verdict(r) {
    if (r.fines > 16) return { tone: 'bad',
      en: `About ${r.fines.toFixed(0)} % of this batch is dust. On the bench you would see it cling to the sides of the container and puff up when you pour. It will bridge in the tablet hopper, weight variation will drift, and a good part of your drug is now in the dust collector.`,
      zh: `這批約有 ${r.fines.toFixed(0)} % 是細粉。在現場你會看到它黏在容器壁上、傾倒時揚起粉塵。它會在壓錠機料斗中架橋，錠重會漂移，而你相當一部分的藥物現在在集塵機裡。` };
    if (r.d50 < 120) return { tone: 'warn',
      en: `A very fine powder at D50 ${r.d50.toFixed(0)} µm. It will dissolve quickly, which is good, but it will not flow, which is not. Expect to need a glidant, or to granulate rather than compress directly.`,
      zh: `D50 僅 ${r.d50.toFixed(0)} µm，非常細。它會溶離得很快，這是好事；但它不會流動，這不是。預期你會需要助流劑，或者改用造粒而非直接壓錠。` };
    if (r.span > 2.6) return { tone: 'warn',
      en: `A wide distribution — span ${r.span.toFixed(1)}. Big and small particles travel differently in a moving container, so this batch will separate again on its way to the press however well you blended it.`,
      zh: `分佈很寬，span 為 ${r.span.toFixed(1)}。大顆粒與小顆粒在移動的容器中行為不同，因此無論你混合得多好，這批物料在前往壓錠機的路上會再次分層。` };
    if (r.oversize > 4) return { tone: 'warn',
      en: `${r.oversize.toFixed(1)} % is still coarser than the screen. Material is passing through half-milled — slow the feed or the mill is simply a conveyor.`,
      zh: `仍有 ${r.oversize.toFixed(1)} % 比篩網孔徑更粗。物料只被磨到一半就通過了——降低進料速率，否則整粒機只是一台輸送機。` };
    return { tone: 'ok',
      en: `A well-behaved distribution: D50 ${r.d50.toFixed(0)} µm, span ${r.span.toFixed(1)}, ${r.fines.toFixed(1)} % fines. This would pour cleanly, fill a die reproducibly, and give you a dissolution profile you can defend.`,
      zh: `分佈良好：D50 ${r.d50.toFixed(0)} µm、span ${r.span.toFixed(1)}、細粉 ${r.fines.toFixed(1)} %。這樣的物料會流暢傾倒、可重現地填滿模孔，並給你一條站得住腳的溶離曲線。` };
  },
  /* Live schematic: a spinning rotor flings particles across the gap toward
     a screen; particle size and colour track the live d50/fines readouts so
     the picture changes with the sliders, not just the numbers beside it. */
  animate(x, W, H, t, p, r) {
    const cx = W * 0.22, cy = H * 0.52, R = Math.min(W, H) * 0.26;
    x.strokeStyle = '#2e3742'; x.lineWidth = 2;
    x.beginPath(); x.arc(cx, cy, R + 12, 0, Math.PI * 2); x.stroke();
    x.save(); x.translate(cx, cy); x.rotate(t * (p.rpm / 60) * Math.PI * 2);
    x.strokeStyle = '#2fc2c8'; x.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * R, Math.sin(a) * R); x.stroke();
    }
    x.restore();
    const n = 16, ex0 = cx + R + 16, span = W * 0.62;
    for (let i = 0; i < n; i++) {
      const ph = (t * 1.3 + i / n) % 1;
      const ex = ex0 + ph * span;
      const ey = cy + Math.sin(ph * 9 + i * 2) * (H * 0.22);
      const size = Math.max(1.2, Math.min(5, r.d50 / 90));
      x.fillStyle = r.fines > 16 ? '#d9614f' : r.fines > 8 ? '#d8a13c' : '#2fc2c8';
      x.beginPath(); x.arc(ex, ey, size, 0, Math.PI * 2); x.fill();
    }
    const sx = W * 0.92;
    x.strokeStyle = '#4a5563'; x.lineWidth = 1;
    for (let y = 6; y < H - 6; y += 9) { x.beginPath(); x.moveTo(sx - 7, y); x.lineTo(sx + 7, y); x.stroke(); }
  },
  deep: {
    en: [
      'A mill has exactly one job that matters: it does not make particles a single size, it makes them a distribution. Everyone quotes D50 because it is one number, but the two numbers that actually cause trouble sit at the ends. D90 tells you about the lumps that will not dissolve on time. D10 and the fines fraction tell you about the dust that will not flow, will segregate, and will carry drug into the dust collector.',
      'The awkward part is that the two things you want move in opposite directions. Smaller particles dissolve faster and distribute a low-dose drug more evenly. Smaller particles also flow worse, because as you go below roughly 100 µm the cohesive forces between particles start to beat gravity. Every formulator has had the argument, and there is no setting that wins it — there is only a compromise you can defend with data.',
      'Span, the width of the distribution, is the quieter problem. A wide distribution segregates: in any moving container, large and small particles find different resting places, so a batch that was uniform in the blender arrives at the tablet press stratified. That is why a blend uniformity result and a content uniformity result can disagree, and why the second one is the one that fails.'
    ],
    zh: [
      '整粒機真正重要的工作只有一件：它並不是把粒子做成單一尺寸，而是做成一個分佈。所有人都引用 D50，因為那是一個數字；但真正會惹麻煩的兩個數字在分佈的兩端。D90 告訴你那些無法及時溶離的結塊；D10 與細粉比例則告訴你那些不會流動、會分層、並把藥物帶進集塵機的粉塵。',
      '尷尬之處在於，你想要的兩件事往方向相反的地方移動。粒子越小溶離越快，低劑量藥物也分佈得越均勻；但粒子越小流動性越差，因為當粒徑降到約 100 µm 以下，粒子間的內聚力開始勝過重力。每個處方人員都吵過這一架，而沒有任何一組設定能贏——只有一個你能用數據辯護的折衷。',
      'Span（分佈寬度）是比較安靜的那個問題。寬分佈會分層：在任何移動的容器中，大顆粒與小顆粒會找到不同的停留位置，因此在混合機裡均勻的批次，抵達壓錠機時已經分層。這正是為什麼混合均勻度的結果與含量均勻度的結果會不一致——而失敗的總是後者。'
    ]
  }
};

/* ============================================================================
   2 · BLENDING
   ========================================================================== */

const OP_BLEND = {
  id: 'blend',
  icon: 'blend',
  name: { en: 'Blending & lubrication', zh: '混合與潤滑' },
  tagline: { en: 'The step where more is definitely not better', zh: '一個「越多絕對不會越好」的步驟' },
  why: {
    en: 'Everything in a tablet has to be spread evenly before it is compressed, so the batch is tumbled in a rotating container. Near the end a lubricant is added so tablets release from the punches. The catch is that the lubricant is a waxy powder that coats every particle — blend it too long and the tablet becomes weak and slow to dissolve.',
    zh: '錠劑中的所有成分在壓製之前都必須均勻分佈，因此批料會在旋轉容器中翻滾。接近尾聲時加入潤滑劑，使錠劑能從沖頭上脫離。麻煩在於潤滑劑是一種蠟質粉末，會包覆每一顆粒子——混合太久，錠劑就會變弱且溶離變慢。'
  },
  tryThis: {
    en: 'Find the sweet spot: drag blend time from 2 minutes upward. Uniformity improves, then the tablet quietly starts falling apart. There is a window, and it is narrower than people expect.',
    zh: '找出甜蜜點：把混合時間從 2 分鐘往上拖。均勻度先改善，接著錠劑會悄悄開始崩壞。窗口存在，而且比一般人以為的更窄。'
  },
  controls: [
    { id: 'time', label: { en: 'Total blend time', zh: '總混合時間' }, unit: 'min', min: 1, max: 60, step: 1, def: 12,
      help: { en: 'Time in the blender after the lubricant goes in. The single most over-set parameter in solid dosage manufacture.', zh: '潤滑劑加入後在混合機中的時間。這是固體製劑製造中最常被設定過頭的一個參數。' } },
    { id: 'rpm', label: { en: 'Blender speed', zh: '混合機轉速' }, unit: 'rpm', min: 4, max: 30, step: 1, def: 12,
      help: { en: 'Faster is not better. Above the point where the bed tumbles, extra speed mostly grinds lubricant onto particle surfaces.', zh: '轉速越快不代表越好。超過床體翻滾的臨界點後，額外的轉速主要只是把潤滑劑碾磨到粒子表面。' } },
    { id: 'fill', label: { en: 'Fill level', zh: '裝載率' }, unit: '%', min: 20, max: 90, step: 5, def: 55,
      help: { en: 'A blender needs empty space to tumble into. Too full and the bed slides as a block; too empty and material just slumps.', zh: '混合機需要空間才能翻滾。裝得太滿，床體會整塊滑動；裝得太空，物料只是塌落。' } },
    { id: 'lub', label: { en: 'Magnesium stearate', zh: '硬脂酸鎂' }, unit: '% w/w', min: 0.25, max: 3, step: 0.05, def: 0.75,
      help: { en: 'The lubricant. Necessary, and hydrophobic — every particle it coats is a particle water has to get past.', zh: '潤滑劑。必要，且具疏水性——它包覆的每一顆粒子，都是水必須先繞過的一顆粒子。' } },
    { id: 'ratio', label: { en: 'API : excipient size ratio', zh: 'API 與賦形劑粒徑比' }, unit: '×', min: 0.2, max: 3, step: 0.1, def: 1,
      help: { en: 'When the drug and the filler are different sizes, they separate again as soon as the container moves. 1.0 means matched.', zh: '當主成分與賦形劑粒徑不同，容器一移動它們就會再度分離。1.0 代表匹配。' } }
  ],
  solve(p) {
    const fillPenalty = Math.max(0.18, 1 - Math.pow((p.fill - 55) / 55, 2) * 1.3);
    // A bin blender reaches uniformity in tens of revolutions, so mixing is fast
    // relative to the lubrication damage that runs alongside it. That contrast
    // is the whole point of this operation.
    const k = 0.55 * Math.pow(p.rpm / 12, 0.7) * fillPenalty;
    const mismatch = Math.abs(Math.log(p.ratio)) ;
    const rsdFloor = 1.1 + mismatch * 2.4;
    const rsdMix = rsdFloor + (26 - rsdFloor) * Math.exp(-k * p.time);
    // re-segregation of a free-flowing mismatched blend on prolonged tumbling
    const reseg = mismatch * Math.max(0, p.time - 18) * 0.16 * (p.rpm / 12);
    const rsd = rsdMix + reseg;
    const av = 2.4 * rsd;

    // lubrication extent — a shear-time-concentration product
    const lubNumber = p.lub * p.time * Math.pow(p.rpm / 12, 0.8);
    const hardnessFactor = Math.exp(-lubNumber / 26);        // × of unlubricated strength
    const dissolDelay = 1 + lubNumber / 22;                  // × longer to release
    const ejectionOK = clamp01u(lubNumber / 4);              // needs enough to release cleanly
    return { rsd, av, k, lubNumber, hardnessFactor, dissolDelay, ejectionOK, rsdFloor, reseg };
  },
  readouts: r => [
    { k: 'Blend RSD', v: r.rsd.toFixed(1), u: '%', cls: r.rsd > 5 ? 'bad' : r.rsd > 3 ? 'warn' : 'ok' },
    { k: 'Est. AV', v: r.av.toFixed(1), u: '', cls: r.av > 15 ? 'bad' : r.av > 12 ? 'warn' : 'ok' },
    { k: 'Lubrication no.', v: r.lubNumber.toFixed(1), u: '', cls: r.lubNumber > 26 ? 'bad' : r.lubNumber > 16 ? 'warn' : 'ok' },
    { k: 'Tablet strength', v: (r.hardnessFactor * 100).toFixed(0), u: '%', cls: r.hardnessFactor < 0.55 ? 'bad' : r.hardnessFactor < 0.75 ? 'warn' : 'ok' },
    { k: 'Dissolution delay', v: r.dissolDelay.toFixed(2), u: '×', cls: r.dissolDelay > 2 ? 'bad' : r.dissolDelay > 1.5 ? 'warn' : 'ok' },
    { k: 'Ejection', v: r.ejectionOK > 0.9 ? 'clean' : r.ejectionOK > 0.5 ? 'marginal' : 'sticking', u: '', cls: r.ejectionOK > 0.9 ? 'ok' : r.ejectionOK > 0.5 ? 'warn' : 'bad' }
  ],
  verdict(r) {
    if (r.ejectionOK < 0.5) return { tone: 'bad',
      en: 'Not enough lubrication has been worked in. Tablets will stick in the die and the press will start knocking — you will hear it before you see it on a chart.',
      zh: '潤滑作用不足。錠劑會黏在模孔中，壓錠機會開始出現敲擊聲——你會先聽到它，然後才在圖表上看到。' };
    if (r.hardnessFactor < 0.55) return { tone: 'bad',
      en: `Over-lubricated. Tablet strength is down to ${(r.hardnessFactor * 100).toFixed(0)} % and release is ${r.dissolDelay.toFixed(1)}× slower. The blend looks perfect and the product fails dissolution — this is the classic way a batch is lost in a step everybody thought was safe.`,
      zh: `過度潤滑。錠劑強度只剩 ${(r.hardnessFactor * 100).toFixed(0)} %，釋放慢了 ${r.dissolDelay.toFixed(1)} 倍。混合看起來完美，產品卻溶離不合格——這是一批產品在「大家都以為很安全的步驟」中輸掉的經典方式。` };
    if (r.rsd > 5) return { tone: 'warn',
      en: `Still under-mixed at RSD ${r.rsd.toFixed(1)} %. Sample the top, middle and bottom of the bin and you would get three different answers.`,
      zh: `RSD 為 ${r.rsd.toFixed(1)} %，仍然混合不足。從料桶的上、中、下層取樣，你會得到三個不同的答案。` };
    if (r.reseg > 1.5) return { tone: 'warn',
      en: 'Uniformity is now getting worse, not better. With mismatched particle sizes, prolonged tumbling separates the blend again — the curve on the left has turned back up.',
      zh: '均勻度現在正在變差而不是變好。當粒徑不匹配時，長時間翻滾會使混合物再度分離——左邊的曲線已經回頭向上。' };
    return { tone: 'ok',
      en: `Inside the window: RSD ${r.rsd.toFixed(1)} %, strength retained at ${(r.hardnessFactor * 100).toFixed(0)} %, clean ejection. This is the compromise you would write into the batch record.`,
      zh: `落在窗口內：RSD ${r.rsd.toFixed(1)} %、強度保留 ${(r.hardnessFactor * 100).toFixed(0)} %、脫模乾淨。這就是你會寫進批次紀錄的那個折衷點。` };
  },
  /* Live schematic: a tumbling drum of two-colour dots. How intermingled the
     colours look tracks the live RSD — clustered and separated at high RSD,
     well interspersed once mixed; dots dim toward brown as lubrication rises. */
  animate(x, W, H, t, p, r) {
    const cx = W * 0.34, cy = H * 0.5, R = Math.min(W, H) * 0.32;
    const spin = t * (p.rpm / 12) * 0.9;
    x.strokeStyle = '#2e3742'; x.lineWidth = 2;
    x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
    const mixedness = Math.max(0, Math.min(1, 1 - (r.rsd - 1) / 20));
    const n = 70;
    for (let i = 0; i < n; i++) {
      // clustered placement at low mixedness: dots for colour A bias to one
      // half of the drum; as mixedness rises they spread uniformly
      const isA = i % 2 === 0;
      const baseAngle = (i / n) * Math.PI * 2 + spin;
      const clusterBias = isA ? -0.6 : 0.6;
      const angle = baseAngle + clusterBias * (1 - mixedness) * 1.2;
      const rad = R * (0.25 + 0.7 * ((i * 37) % 100) / 100);
      const px = cx + Math.cos(angle) * rad;
      const py = cy + Math.sin(angle) * rad * 0.9;
      const lube = Math.min(1, r.lubNumber / 30);
      x.fillStyle = isA
        ? `rgba(47,194,200,${0.9 - lube * 0.3})`
        : `rgba(150,150,160,${0.85})`;
      x.beginPath(); x.arc(px, py, 2.6, 0, Math.PI * 2); x.fill();
    }
  },
  deep: {
    en: [
      'Blending is the only unit operation in this set where the objective function is not monotonic. Everywhere else, more of the good thing gets you closer to the target until it saturates. Here, the curve turns around and goes back the way it came, for two independent reasons that happen to point the same direction.',
      'The first is re-segregation. Mixing and separating are the same process running in opposite directions, and which one wins depends on whether the particles are similar enough to travel together. If the drug and the filler differ in size or density, a tumbling blender will demix them just as efficiently as it mixed them. That is why blend time is not "as long as convenient" — it is a number you establish and then defend.',
      'The second is lubrication. Magnesium stearate works by shearing into a molecular film over the surfaces it touches, and shear is the product of concentration, speed and time. That film is what lets the tablet leave the die, and it is also hydrophobic, so it slows water reaching the disintegrant. Over-lubricate and you get a tablet that is weaker, slower to disintegrate and slower to dissolve — three separate specification failures from one parameter set five minutes too high.',
      'The practical consequence is a rule most sites follow without always knowing why: blend the main powders for as long as they need, then add the lubricant last and blend it for a short, fixed, validated time. It is not a tradition. It is the only way to control two things that respond to the same knob.'
    ],
    zh: [
      '混合是本組唯一目標函數「非單調」的單元操作。其他每一個操作，好東西越多就越接近目標，直到飽和為止。這裡，曲線會轉頭往回走，而且是出於兩個各自獨立、卻恰好指向同一方向的理由。',
      '第一個是再分層。混合與分離是同一個過程往相反方向運行，誰會贏取決於粒子是否相似到足以一起移動。若主成分與賦形劑在粒徑或密度上不同，翻滾式混合機會以與混合同樣的效率把它們再分開。這正是為什麼混合時間不能是「方便就久一點」——它是一個你必須建立並加以辯護的數字。',
      '第二個是潤滑。硬脂酸鎂的作用機制是在它接觸到的表面上被剪切成分子層薄膜，而剪切量是濃度、轉速與時間的乘積。那層膜讓錠劑得以離開模孔，同時它也是疏水的，因此會延緩水分抵達崩散劑。過度潤滑會得到一顆更弱、崩解更慢、溶離也更慢的錠劑——一個設定得太高五分鐘的參數，造成三項各自獨立的規格不合格。',
      '實務上的結果是一條多數廠區都遵守、卻不總是知道原因的規則：主要粉體想混多久就混多久，然後最後才加潤滑劑，並以短暫、固定、已驗證的時間混合。這不是傳統，而是同時控制兩個「對同一個旋鈕有反應」的東西的唯一辦法。'
    ]
  }
};

/* ============================================================================
   3 · TABLET COMPRESSION
   ========================================================================== */

const OP_COMPRESS = {
  id: 'compress',
  icon: 'compress',
  name: { en: 'Tablet compression', zh: '壓錠' },
  tagline: { en: 'Powder into a dose, thirty times a second', zh: '每秒三十次，把粉末變成一個劑量' },
  why: {
    en: 'A rotary press fills a hole with powder, squeezes it between two punches, and pushes out a tablet. Everything you can measure about that tablet — how hard it is, how fast it breaks up, whether it survives the bottle — comes from how hard and how long you squeezed.',
    zh: '旋轉式壓錠機把粉末填入模孔，在上下兩個沖頭之間壓緊，然後把錠劑頂出。關於這顆錠劑你能量測的一切——硬度、崩解速度、能否撐過瓶裝運輸——都來自你壓得多用力、壓了多久。'
  },
  tryThis: {
    en: 'Wind the main compression force up from 4 kN and watch two things fight: the tablet gets stronger, and it gets slower to break up. Somewhere in the middle is the answer. Then drop the pre-compression to zero and see the cap appear.',
    zh: '把主壓力從 4 kN 往上調，看兩件事互相拉鋸：錠劑變得更強，同時崩解變得更慢。答案在中間某處。接著把預壓降到零，看頂裂如何出現。'
  },
  controls: [
    { id: 'force', label: { en: 'Main compression force', zh: '主壓力' }, unit: 'kN', min: 2, max: 35, step: 0.5, def: 14,
      help: { en: 'The squeeze. Sets density, and density sets everything else.', zh: '壓緊的力道。決定密度，而密度決定其餘一切。' } },
    { id: 'pre', label: { en: 'Pre-compression force', zh: '預壓力' }, unit: 'kN', min: 0, max: 8, step: 0.25, def: 2,
      help: { en: 'A gentle first squeeze that lets trapped air escape. Cheap insurance against the tablet splitting later.', zh: '一次輕柔的預先壓緊，讓夾帶的空氣逸出。這是防止錠劑之後裂開的廉價保險。' } },
    { id: 'turret', label: { en: 'Turret speed', zh: '轉盤速度' }, unit: 'rpm', min: 10, max: 100, step: 2, def: 40,
      help: { en: 'Output rate — and the enemy of quality. Faster turret means less time under pressure for the powder to rearrange.', zh: '產能——同時也是品質的敵人。轉盤越快，粉體在壓力下重新排列的時間越短。' } },
    { id: 'weight', label: { en: 'Tablet weight', zh: '錠重' }, unit: 'mg', min: 80, max: 800, step: 10, def: 250,
      help: { en: 'How much powder goes into the die. Together with the punch size it sets how thick the tablet is.', zh: '進入模孔的粉量。與沖頭尺寸共同決定錠劑厚度。' } },
    { id: 'dia', label: { en: 'Punch diameter', zh: '沖頭直徑' }, unit: 'mm', min: 5, max: 14, step: 0.5, def: 9,
      help: { en: 'Sets the area the force acts over. The same 15 kN is a gentle press on a 12 mm tablet and a brutal one on a 6 mm tablet.', zh: '決定壓力作用的面積。同樣是 15 kN，對 12 mm 錠劑是溫和的壓製，對 6 mm 錠劑則是殘暴的。' } },
    { id: 'lod', label: { en: 'Granule moisture (LOD)', zh: '顆粒含水量（LOD）' }, unit: '%', min: 0.5, max: 5, step: 0.1, def: 2.2,
      help: { en: 'Water plasticises the granule. Too dry and it springs back and caps; too wet and it sticks to the punch faces.', zh: '水分使顆粒塑化。太乾會彈回並頂裂；太濕則會黏在沖頭表面。' } }
  ],
  solve(p) {
    const area = Math.PI / 4 * p.dia * p.dia;            // mm²
    const pressure = p.force * 1000 / area;               // N/mm² = MPa
    const dwell = 1000 * (0.0035 * 60) / (p.turret * 0.0035 * 60 / 1000 + 1e-9); // placeholder, replaced below
    const dwellMs = 1900 / p.turret;                      // ms, representative of a mid-size turret
    const Py = 120 * (1 - (p.lod - 2.2) * 0.06);          // yield pressure, moisture plasticises
    const eMin = 0.05;
    const porosity = eMin + (0.42 - eMin) * Math.exp(-pressure / Py) * (1 + Math.max(0, (30 - dwellMs)) * 0.004);
    const SF = 1 - porosity;
    const sigmaT = 7.0 * Math.exp(-9 * porosity);         // tensile strength, MPa
    // volume -> thickness. True density 1.35 g/cm³ = 1.35 mg/mm³, so a weight
    // in mg divided by 1.35 gives mm³ directly.
    const trueVol = p.weight / 1.35;                       // mm³
    const vol = trueVol / SF;
    const thick = vol / area;
    const hardnessN = sigmaT * Math.PI * p.dia * thick / 2;
    const disint = 12 * Math.exp(8.2 * (SF - 0.82));
    const friab = Math.min(4, 1.5 * Math.exp(-5.2 * Math.max(sigmaT - 0.6, 0)));
    const capping = clamp01u(
      0.38 * (pressure / 420) + 0.30 * (1 - Math.min(dwellMs, 45) / 45) +
      0.20 * (1 - Math.min(p.pre, 6) / 6) + 0.12 * (1 - Math.min(p.lod, 3.5) / 3.5));
    const sticking = clamp01u((p.lod - 3.2) / 2.2);
    const wtRsd = 0.6 + Math.pow(p.turret / 40, 1.3) * 0.9;
    return { area, pressure, dwellMs, porosity, SF, sigmaT, thick, hardnessN, disint, friab, capping, sticking, wtRsd };
  },
  readouts: r => [
    { k: 'Pressure', v: r.pressure.toFixed(0), u: 'MPa' },
    { k: 'Dwell time', v: r.dwellMs.toFixed(0), u: 'ms', cls: r.dwellMs < 20 ? 'warn' : 'ok' },
    { k: 'Tensile strength', v: r.sigmaT.toFixed(2), u: 'MPa', cls: r.sigmaT < 1.0 ? 'bad' : r.sigmaT > 4.2 ? 'warn' : 'ok' },
    { k: 'Hardness', v: r.hardnessN.toFixed(0), u: 'N' },
    { k: 'Thickness', v: r.thick.toFixed(2), u: 'mm' },
    { k: 'Porosity', v: (r.porosity * 100).toFixed(1), u: '%' },
    { k: 'Disintegration', v: r.disint.toFixed(0), u: 's', cls: r.disint > 900 ? 'bad' : r.disint > 300 ? 'warn' : 'ok' },
    { k: 'Friability', v: r.friab.toFixed(2), u: '%', cls: r.friab > 1 ? 'bad' : r.friab > 0.6 ? 'warn' : 'ok' },
    { k: 'Capping risk', v: r.capping.toFixed(2), u: '', cls: r.capping > 0.6 ? 'bad' : r.capping > 0.4 ? 'warn' : 'ok' },
    { k: 'Weight RSD', v: r.wtRsd.toFixed(1), u: '%', cls: r.wtRsd > 2 ? 'bad' : r.wtRsd > 1.3 ? 'warn' : 'ok' }
  ],
  verdict(r) {
    if (r.capping > 0.62) return { tone: 'bad',
      en: 'Capping. The top of the tablet lifts off like a lid, usually within a minute of leaving the press and sometimes not until the friability test. Air is trapped in the compact and springs back on ejection — more force will not fix it, more pre-compression and a slower turret will.',
      zh: '頂裂。錠劑頂端會像蓋子一樣掀開，通常在離開壓錠機一分鐘內發生，有時要到脆碎度試驗才顯現。空氣被封在壓實體中，並在頂出時彈回——加大壓力救不了它，增加預壓與放慢轉盤才可以。' };
    if (r.friab > 1.0) return { tone: 'bad',
      en: `Too soft. Friability ${r.friab.toFixed(1)} % means edges will round off in the coating pan and the bottle will arrive full of powder. Compendial limit is 1.0 %.`,
      zh: `太軟。脆碎度 ${r.friab.toFixed(1)} % 代表錠劑邊緣會在包衣鍋中磨圓，瓶子送達時裡面滿是粉末。藥典限值為 1.0 %。` };
    if (r.disint > 600) return { tone: 'warn',
      en: `Very hard and very slow: ${r.disint.toFixed(0)} seconds to break up. You have compressed a pebble. It will pass friability and fail dissolution.`,
      zh: `非常硬也非常慢：崩解需 ${r.disint.toFixed(0)} 秒。你壓出了一顆石頭。它會通過脆碎度，然後溶離不合格。` };
    if (r.sticking > 0.5) return { tone: 'warn',
      en: 'Granule is too wet. Expect material to build on the punch faces and the embossing to fill in — you will see it as a dull patch and a fuzzy logo.',
      zh: '顆粒太濕。預期物料會堆積在沖頭表面、刻字被填滿——你會看到一塊霧面斑點與模糊的商標。' };
    if (r.dwellMs < 18) return { tone: 'warn',
      en: `Only ${r.dwellMs.toFixed(0)} ms under pressure. At this turret speed the powder has no time to deform plastically, so you are relying on brute force where you should be relying on time.`,
      zh: `受壓時間僅 ${r.dwellMs.toFixed(0)} ms。在此轉盤速度下，粉體沒有時間發生塑性變形，你只能靠蠻力，而本該靠時間。` };
    return { tone: 'ok',
      en: `A good tablet: ${r.hardnessN.toFixed(0)} N, ${r.thick.toFixed(2)} mm thick, disintegrating in ${r.disint.toFixed(0)} s with ${r.friab.toFixed(2)} % friability. Strong enough to ship, loose enough to work.`,
      zh: `一顆好錠劑：硬度 ${r.hardnessN.toFixed(0)} N、厚度 ${r.thick.toFixed(2)} mm、${r.disint.toFixed(0)} 秒崩解、脆碎度 ${r.friab.toFixed(2)} %。強到能出貨，鬆到能作用。` };
  },
  /* Live schematic: an upper punch drives down into a die at the turret's
     cyclic rate, compressing a powder bed into a tablet whose thickness
     reflects the live porosity; the tablet ejects and a fresh charge refills. */
  animate(x, W, H, t, p, r) {
    const cx = W * 0.3, dieTop = H * 0.32, dieBot = H * 0.86, dieHalf = 42;
    const cycle = (t * (p.turret / 60) * 2) % 1;   // one down-up cycle
    // punch position: 0 = fully up, 1 = fully down (bottom of stroke)
    const downFrac = cycle < 0.5 ? Math.sin(cycle * Math.PI) : 0;
    const tabThickPx = Math.max(6, 30 - r.porosity * 40);
    const bedTopY = dieBot - tabThickPx;
    const punchTipY = cycle < 0.5 ? (dieTop + (bedTopY - dieTop) * downFrac) : dieTop;
    x.strokeStyle = '#4a5563'; x.lineWidth = 2;
    x.strokeRect(cx - dieHalf, dieTop, dieHalf * 2, dieBot - dieTop);
    x.fillStyle = r.capping > 0.6 ? 'rgba(217,97,79,.65)' : '#2fc2c8';
    x.fillRect(cx - dieHalf + 2, bedTopY, dieHalf * 2 - 4, dieBot - bedTopY - 2);
    x.fillStyle = '#8b95a1';
    x.fillRect(cx - dieHalf + 3, punchTipY, dieHalf * 2 - 6, 14);
    // ejected tablet sliding away during the back half of the cycle
    if (cycle > 0.55) {
      const slide = (cycle - 0.55) / 0.45;
      x.fillStyle = r.friab > 1 ? 'rgba(216,161,60,.85)' : '#5fc08a';
      x.fillRect(cx + dieHalf + 10 + slide * (W * 0.4), dieBot - tabThickPx - 2, 30, tabThickPx);
    }
  },
  deep: {
    en: [
      'Compression is a porosity problem wearing a force costume. What you actually control is how much air you remove from a bed of granules; everything measurable follows from the porosity you end up with. Tensile strength rises roughly exponentially as porosity falls, which is why the hardness-versus-force curve bends over and why chasing an extra 20 N of hardness at the top of the curve costs far more force than it did at the bottom.',
      'Disintegration moves the opposite way for the same reason. Water enters a tablet through its pore network, so the denser you make it the fewer routes water has. This is the single most common conflict on a compression trial: the specification wants hardness above one number and disintegration below another, and those two constraints are the same variable pulling in opposite directions.',
      'Dwell time is the parameter operators most often forget they are changing. Powders deform partly plastically — a rearrangement that takes time — and partly elastically, which springs back the moment the punch lifts. Running the turret faster shortens the plastic contribution and leaves the elastic contribution untouched, so a formulation that was fine in development caps in production purely because production runs at three times the speed. Pre-compression is the cheapest defence: a small first squeeze lets air out of the compact before the main event, and air is what most caps are made of.'
    ],
    zh: [
      '壓錠是一個穿著「壓力」外衣的孔隙率問題。你真正控制的是從顆粒床中排除多少空氣；所有可量測的性質都由最終得到的孔隙率推導而來。抗張強度隨孔隙率下降大致呈指數上升，這解釋了為什麼「硬度對壓力」的曲線會彎折，也解釋了為什麼在曲線頂端多追求 20 N 的硬度，所需的壓力遠高於在底端時。',
      '崩解基於同樣的理由往相反方向移動。水是透過孔隙網路進入錠劑的，你把它壓得越密實，水能走的路徑就越少。這是壓錠試驗中最常見的單一衝突：規格要求硬度高於某個數字、崩解低於另一個數字，而這兩項限制其實是同一個變數在往兩邊拉。',
      '受壓時間（dwell time）是操作者最常忘記自己正在改變的參數。粉體的變形一部分是塑性的——一種需要時間的重新排列——一部分是彈性的，會在沖頭抬起的瞬間彈回。把轉盤跑快會縮短塑性的貢獻，卻完全不影響彈性的貢獻；因此一個在開發階段沒問題的處方，會純粹因為量產速度是開發的三倍而在生產線上頂裂。預壓是最便宜的防禦：在正式壓製之前先輕壓一次，讓空氣離開壓實體——而多數頂裂正是由空氣造成的。'
    ]
  }
};

/* ============================================================================
   4 · FILM COATING
   ========================================================================== */

const OP_COATING = {
  id: 'coating',
  icon: 'coating',
  name: { en: 'Film coating', zh: '膜衣包衣' },
  tagline: { en: 'Spraying a 30-micron skin onto a tumbling bed', zh: '在翻滾的錠劑床上噴出一層 30 微米的皮膜' },
  why: {
    en: 'Tablets are tumbled in a perforated drum while a polymer solution is sprayed onto them and warm air dries it. The film hides taste, keeps moisture out, carries the colour, and on some products controls how the drug is released. The whole job is a race: the droplet has to land, spread and stick before it dries.',
    zh: '錠劑在打孔的包衣鍋中翻滾，同時被噴上高分子溶液，再由熱風將其乾燥。膜衣可遮味、防潮、帶來顏色，在某些產品上還控制藥物的釋放。整件事是一場競賽：液滴必須在乾掉之前落下、鋪展並黏附。'
  },
  tryThis: {
    en: 'Turn the spray rate up to finish faster. Watch the tablets start sticking to each other. Then fix it with air temperature and notice what you broke instead.',
    zh: '把噴速調高以求早點完工。看錠劑開始互相黏連。接著用風溫去修正它，並注意你反而弄壞了什麼。'
  },
  controls: [
    { id: 'spray', label: { en: 'Spray rate per gun', zh: '每支噴槍的噴液速率' }, unit: 'g/min', min: 10, max: 120, step: 2.5, def: 55,
      help: { en: 'Set per gun, not per machine — that is how coating scales. The number of guns follows the pan size, so total spray rises with the batch automatically.', zh: '以「每支噴槍」而非「每台機器」設定——包衣就是這樣放大的。噴槍數量隨鍋體大小而定，因此總噴量會隨批量自動增加。' } },
    { id: 'inletT', label: { en: 'Inlet air temperature', zh: '進風溫度' }, unit: '°C', min: 35, max: 85, step: 1, def: 60,
      help: { en: 'The drying energy. What you actually care about is the tablet bed temperature it produces.', zh: '乾燥能量。你真正在意的是它所產生的錠劑床溫度。' } },
    { id: 'airVol', label: { en: 'Air volume', zh: '風量' }, unit: 'm³/h', min: 400, max: 3000, step: 25, def: 1400,
      help: { en: 'How much air is available to carry water away. Doubling it roughly doubles evaporative capacity.', zh: '可用來帶走水分的空氣量。加倍大致使蒸發能力加倍。' } },
    { id: 'panRpm', label: { en: 'Pan speed', zh: '鍋速' }, unit: 'rpm', min: 2, max: 18, step: 0.5, def: 8,
      help: { en: 'How often each tablet visits the spray zone. More visits means a more even film — and more abrasion.', zh: '每顆錠劑造訪噴霧區的頻率。造訪次數越多，膜衣越均勻——磨耗也越多。' } },
    { id: 'atom', label: { en: 'Atomisation pressure', zh: '霧化壓力' }, unit: 'bar', min: 0.5, max: 4, step: 0.1, def: 2.2,
      help: { en: 'Droplet size. Fine droplets spread better but dry in flight; coarse droplets land wet and stick.', zh: '液滴大小。細液滴鋪展較好但會在飛行中乾掉；粗液滴落下時仍濕，會造成沾黏。' } },
    { id: 'target', label: { en: 'Target weight gain', zh: '目標增重' }, unit: '%', min: 1, max: 12, step: 0.5, def: 3,
      help: { en: 'How much film you want. Cosmetic coats are 2–4 %; functional and moisture-barrier coats need more.', zh: '你想要多少膜。外觀包衣約 2–4 %；功能性與防潮包衣則需要更多。' } },
    { id: 'load', label: { en: 'Pan load', zh: '裝鍋量' }, unit: 'kg', min: 20, max: 400, step: 5, def: 150,
      help: { en: 'Batch size. A bigger bed means each tablet spends proportionally less time in the spray zone.', zh: '批量。床體越大，每顆錠劑待在噴霧區的時間比例就越少。' } },
    { id: 'solids', label: { en: 'Suspension solids', zh: '噴液固含量' }, unit: '% w/w', min: 8, max: 25, step: 0.5, def: 15,
      help: { en: 'Concentration of the coating suspension. Higher means less water to evaporate per gram of film.', zh: '包衣懸浮液的濃度。越高代表每克膜衣所需蒸發的水越少。' } }
  ],
  solve(p) {
    // Guns scale with the pan, exactly as they do on a real coating line. This
    // is why a process transferred at "the same spray rate" behaves differently
    // at a different batch size — the intensive quantity is per gun.
    const guns = Math.max(2, Math.min(10, p.load / 50));
    const sprayTotal = p.spray * guns;

    // --- thermodynamics, same psychrometric basis as the fluid bed ---
    const Win = humidityRatio(10);
    const rhoIn = airDensity(p.inletT);
    const mDry = (p.airVol / 3600) * rhoIn / (1 + Win);
    const mLiq = sprayTotal / 1000 / 60;
    const mWater = mLiq * (1 - p.solids / 100);
    const Wout = Win + mWater / mDry;
    const hIn = moistEnthalpy(p.inletT, Win);
    const qLoss = 0.07 * mDry * 1.006 * Math.max(p.inletT - 20, 0);
    const rhs = hIn + (mLiq * 4.18 * 20 - qLoss) / mDry;
    const Tout = (rhs - 2501 * Wout) / (1.006 + 1.86 * Wout);
    const bedT = Tout - 2.0;
    const pvOut = 101325 * Wout / (0.622 + Wout);
    const rhOut = Math.min(100, 100 * pvOut / pSat(Tout));
    const dryingForce = Tout - dewPoint(pvOut);

    // --- coverage and uniformity ---
    const smd = dropletSMD(p.atom, p.spray);              // already per gun
    const solidsRate = mLiq * p.solids / 100 * 60000;     // g/min of film solids
    const filmNeeded = p.load * 1000 * p.target / 100;    // g
    const sprayDryLoss = clamp01u(0.35 * (bedT - 42) / 20 + 0.35 * (32 - smd) / 26 + 0.15 * (20 - rhOut) / 20);
    const eff = Math.max(0.55, 1 - 0.30 * sprayDryLoss);
    const timeMin = filmNeeded / (solidsRate * eff);
    // Only tablets currently at the bed surface can be sprayed. That exposed
    // fraction falls as the bed gets deeper, which is the real reason coating
    // uniformity degrades on scale-up.
    const surfFrac = Math.min(0.34, 0.30 * Math.pow(60 / p.load, 0.33));
    const passes = timeMin * p.panRpm * surfFrac;
    const coatCV = 100 * Math.sqrt(1.0 / Math.max(passes, 1));

    // --- film geometry ---
    const tabWeight = 250, tabDia = 9, tabThick = 4.2;
    const tabArea = 2 * Math.PI * Math.pow(tabDia / 2, 2) + Math.PI * tabDia * tabThick;   // mm²
    const filmMass = tabWeight * p.target / 100;          // mg
    const filmThick = (filmMass / 1.25) / tabArea * 1000;  // µm

    // --- defects ---
    const sticking = clamp01u(0.55 * (rhOut - 28) / 34 + 0.45 * (40 - bedT) / 16);
    const orangePeel = clamp01u(0.5 * (smd - 38) / 30 + 0.5 * (bedT - 46) / 16);
    const erosion = clamp01u(0.55 * (p.panRpm - 9) / 9 + 0.45 * (timeMin - 120) / 160);
    const twinning = clamp01u((sticking - 0.35) * 1.6 + (p.load / 400) * 0.25);
    return { Tout, bedT, rhOut, dryingForce, smd, eff, timeMin, passes, coatCV,
             filmThick, sticking, orangePeel, erosion, twinning, solidsRate, sprayDryLoss };
  },
  readouts: r => [
    { k: 'Bed temperature', v: r.bedT.toFixed(1), u: '°C', cls: r.bedT < 38 ? 'warn' : r.bedT > 50 ? 'warn' : 'ok' },
    { k: 'Exhaust RH', v: r.rhOut.toFixed(0), u: '%', cls: r.rhOut > 50 ? 'bad' : r.rhOut > 35 ? 'warn' : 'ok' },
    { k: 'Drying force', v: r.dryingForce.toFixed(0), u: 'K', cls: r.dryingForce < 12 ? 'bad' : 'ok' },
    { k: 'Coating time', v: r.timeMin.toFixed(0), u: 'min', cls: r.timeMin > 240 ? 'warn' : 'ok' },
    { k: 'Film thickness', v: r.filmThick.toFixed(0), u: 'µm' },
    { k: 'Spray-zone passes', v: r.passes.toFixed(0), u: '', cls: r.passes < 120 ? 'warn' : 'ok' },
    { k: 'Coating CV', v: r.coatCV.toFixed(1), u: '%', cls: r.coatCV > 8 ? 'bad' : r.coatCV > 5 ? 'warn' : 'ok' },
    { k: 'Efficiency', v: (r.eff * 100).toFixed(0), u: '%', cls: r.eff < 0.75 ? 'bad' : r.eff < 0.88 ? 'warn' : 'ok' }
  ],
  verdict(r) {
    if (r.twinning > 0.5) return { tone: 'bad',
      en: 'Twinning. Tablets are arriving in the spray zone still wet and gluing to each other in pairs — you will find them in the discharge as figure-of-eights, and both faces will be unusable.',
      zh: '雙錠沾黏。錠劑抵達噴霧區時仍是濕的，兩兩黏在一起——你會在出料時看到「8」字形的雙錠，兩個接觸面都不能用。' };
    if (r.sticking > 0.55) return { tone: 'bad',
      en: 'The bed is running wet. Tablets pick up material from each other and from the drum wall; logos fill in and the surface goes tacky. Reduce spray rate before you reach for the heater.',
      zh: '床體太濕。錠劑會從彼此與鍋壁上沾附物料，刻字被填滿、表面發黏。在伸手去調加熱器之前，先降低噴速。' };
    if (r.orangePeel > 0.55) return { tone: 'warn',
      en: 'Orange peel. Droplets are drying before they can spread, so the film sets as a stippled surface rather than a smooth one. It looks matte under the light and it is a coating defect, not a cosmetic preference.',
      zh: '橘皮。液滴在鋪展之前就乾掉，膜衣因而凝固成點狀而非平滑的表面。在燈光下呈霧面——這是包衣缺陷，不是外觀偏好。' };
    if (r.coatCV > 8) return { tone: 'warn',
      en: `Coating CV ${r.coatCV.toFixed(1)} %. Some tablets have twice the film of others. For a cosmetic coat you would see colour variation; for a functional coat you would see it in dissolution.`,
      zh: `包衣 CV 為 ${r.coatCV.toFixed(1)} %。有些錠劑的膜厚是其他的兩倍。若是外觀包衣，你會看到色差；若是功能性包衣，你會在溶離上看到它。` };
    if (r.erosion > 0.6) return { tone: 'warn',
      en: 'The pan is running fast and long. Edges will abrade and you will see coating dust in the exhaust filters and rounded logos on the tablets.',
      zh: '鍋速快且時間長。錠劑邊緣會磨損，你會在排風濾網中看到包衣粉塵，錠劑上的刻字也會變圓。' };
    return { tone: 'ok',
      en: `A clean coat: ${r.filmThick.toFixed(0)} µm film, CV ${r.coatCV.toFixed(1)} %, ${r.timeMin.toFixed(0)} minutes, ${(r.eff * 100).toFixed(0)} % of what you sprayed ended up on a tablet.`,
      zh: `一次乾淨的包衣：膜厚 ${r.filmThick.toFixed(0)} µm、CV ${r.coatCV.toFixed(1)} %、耗時 ${r.timeMin.toFixed(0)} 分鐘，噴出去的有 ${(r.eff * 100).toFixed(0)} % 留在錠劑上。` };
  },
  /* Live schematic: a rotating pan of tumbling tablets under a spray nozzle;
     tablets darken toward the target colour as coating time/CV improve, and
     droplets fall faster with spray rate. */
  animate(x, W, H, t, p, r) {
    const cx = W * 0.5, cy = H * 0.56, R = Math.min(W, H) * 0.4;
    x.strokeStyle = '#2e3742'; x.lineWidth = 2;
    x.beginPath(); x.ellipse(cx, cy, R, R * 0.62, 0, 0, Math.PI * 2); x.stroke();
    const spin = t * (p.panRpm / 8) * 1.1;
    const n = 22;
    const coatFrac = Math.min(1, (r.filmThick || 0) / 30);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + spin;
      const rad = R * (0.35 + 0.55 * ((i * 53) % 100) / 100);
      const px = cx + Math.cos(a) * rad;
      const py = cy + Math.sin(a) * rad * 0.62;
      const tone = r.sticking > 0.5 ? '217,97,79' : r.orangePeel > 0.5 ? '216,161,60' : '95,192,138';
      x.fillStyle = '#8b95a1';
      x.beginPath(); x.arc(px, py, 4, 0, Math.PI * 2); x.fill();
      x.fillStyle = `rgba(${tone},${0.2 + coatFrac * 0.7})`;
      x.beginPath(); x.arc(px, py, 4, 0, Math.PI * 2); x.fill();
    }
    // spray nozzle + droplets
    const nx = cx, ny = cy - R * 0.9;
    x.strokeStyle = '#4a5563'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(nx, ny - 14); x.lineTo(nx, ny); x.stroke();
    const dn = 5;
    for (let i = 0; i < dn; i++) {
      const ph = (t * (1 + p.spray / 60) * 2 + i / dn) % 1;
      x.fillStyle = 'rgba(74,143,214,.8)';
      x.beginPath(); x.arc(nx + (i - dn / 2) * 5, ny + ph * (cy - ny - 10), 2, 0, Math.PI * 2); x.fill();
    }
  },
  deep: {
    en: [
      'A pan coater is the same physics as the Wurster, arranged differently and with a much worse statistical starting point. In a Wurster every particle is forced through the spray zone in a near-identical trajectory; in a pan, tablets tumble and only the ones currently at the bed surface get sprayed. Whether any given tablet gets its fair share is a matter of probability, and probability needs repetitions to converge.',
      'That is why pan speed matters more than it looks. Coating variance falls as roughly one over the square root of the number of spray-zone passes, and passes are the product of run time, pan speed and the fraction of the bed that is at the surface. Scale up the batch and that surface fraction drops — which is why a coating process transferred to a larger pan at the same settings comes back with worse uniformity for no reason anybody can see in the batch record.',
      'The wet-versus-dry balance is identical to the fluid bed and the failure modes have the same shape. Too wet and tablets stick to each other and to the drum. Too dry and the droplets solidify in flight and the film sets rough — orange peel, which is not a cosmetic complaint but evidence that your coating never properly coalesced. The window between them is real, narrow, and the thing you are actually developing.'
    ],
    zh: [
      '包衣鍋的物理與 Wurster 相同，只是排列方式不同，而且統計上的起點差得多。在 Wurster 中，每顆粒子都被迫以近乎相同的軌跡通過噴霧區；在包衣鍋中，錠劑翻滾，只有當下位於床體表面的那些才會被噴到。任一顆錠劑是否拿到它應得的份額，是機率問題，而機率需要重複次數才會收斂。',
      '這正是為什麼鍋速比它看起來更重要。包衣變異大致隨噴霧區通過次數的平方根倒數下降，而通過次數是作業時間、鍋速與「床體表面比例」三者的乘積。批量放大後，該表面比例會下降——這解釋了為什麼一個以相同設定移轉到更大包衣鍋的製程，會回報更差的均勻度，而批次紀錄上看不出任何原因。',
      '乾濕平衡與流體床完全相同，失效模式也是同樣的形狀。太濕，錠劑會彼此沾黏並黏在鍋壁上；太乾，液滴會在飛行中固化、膜衣凝固得粗糙——也就是橘皮，那不是外觀上的抱怨，而是你的膜衣從未真正聚結成膜的證據。兩者之間的窗口是真實存在的、狹窄的，也正是你真正在開發的東西。'
    ]
  }
};

/* ============================================================================
   5 · DISSOLUTION TESTING
   ========================================================================== */

const OP_DISSOL = {
  id: 'dissol',
  icon: 'dissol',
  name: { en: 'Dissolution testing', zh: '溶離試驗' },
  tagline: { en: 'The test that decides whether a generic is a generic', zh: '決定一個學名藥是不是學名藥的那項試驗' },
  why: {
    en: 'A tablet or capsule is dropped into a heated vessel of fluid that is stirred at a fixed speed, and you measure how much drug has come out at set times. For a generic, this curve is compared against the brand. If the two curves are close enough — measured by a number called f2 — that comparison can replace a clinical trial.',
    zh: '把錠劑或膠囊放入以固定轉速攪拌的恆溫介質中，量測在特定時間點有多少藥物釋出。對學名藥而言，這條曲線會與原廠品比較。若兩條曲線夠接近——以一個稱為 f2 的數值衡量——這個比較就可以取代一項臨床試驗。'
  },
  tryThis: {
    en: 'Nudge the hardness and particle size a little and watch f2 fall off a cliff. This is why the manufacturing parameters two sections up are a regulatory issue, not just an engineering one.',
    zh: '把硬度與粒徑稍微動一下，看 f2 如何斷崖式下跌。這就是為什麼上面兩節的製造參數是法規問題，而不只是工程問題。'
  },
  controls: [
    { id: 'app', label: { en: 'Apparatus', zh: '裝置' }, unit: '', type: 'select', def: 1,
      options: [{ v: 1, l: { en: 'USP 1 — basket', zh: 'USP 1 — 轉籃' } }, { v: 2, l: { en: 'USP 2 — paddle', zh: 'USP 2 — 槳' } }],
      help: { en: 'Basket for capsules and floating dosage forms; paddle for most tablets. The PSG for linaclotide specifies Apparatus 1.', zh: '轉籃用於膠囊與會漂浮的劑型；槳法用於多數錠劑。Linaclotide 的 PSG 指定使用裝置一。' } },
    { id: 'rpm', label: { en: 'Rotation speed', zh: '轉速' }, unit: 'rpm', min: 25, max: 150, step: 5, def: 50,
      help: { en: 'How vigorously the medium is stirred. Higher speed hides formulation differences — which is why a method that discriminates is worth more than a method that passes.', zh: '介質被攪動的劇烈程度。轉速越高越能掩蓋處方差異——這正是為什麼「有鑑別力的方法」比「會通過的方法」更有價值。' } },
    { id: 'medium', label: { en: 'Medium', zh: '介質' }, unit: '', type: 'select', def: 0,
      options: [{ v: 0, l: { en: 'Water', zh: '水' } }, { v: 1, l: { en: '0.1 N HCl (pH 1.2)', zh: '0.1 N 鹽酸（pH 1.2）' } },
                { v: 2, l: { en: 'pH 4.5 buffer', zh: 'pH 4.5 緩衝液' } }, { v: 3, l: { en: 'pH 6.8 buffer', zh: 'pH 6.8 緩衝液' } }],
      help: { en: 'The PSG requires all four. A product that matches in one medium and not another has a formulation difference you have not found yet.', zh: 'PSG 要求四種全做。若產品在某一介質中相符、在另一介質中不符，代表存在一個你尚未找到的處方差異。' } },
    { id: 'phDep', label: { en: 'Drug pH dependence', zh: '藥物的 pH 依賴性' }, unit: '', type: 'select', def: 0,
      options: [{ v: 0, l: { en: 'None — freely soluble', zh: '無——易溶' } }, { v: 1, l: { en: 'Weak base — acid soluble', zh: '弱鹼——酸中易溶' } },
                { v: 2, l: { en: 'Weak acid — base soluble', zh: '弱酸——鹼中易溶' } }],
      help: { en: 'A molecular property, not a setting. It is why the four-medium requirement exists.', zh: '這是分子性質而非設定。它正是四介質要求存在的原因。' } },
    { id: 'd50', label: { en: 'Particle size D50', zh: '粒徑 D50' }, unit: 'µm', min: 30, max: 800, step: 10, def: 250,
      help: { en: 'Carried straight over from the milling simulator. Smaller particles have more surface, so they dissolve faster.', zh: '直接沿用整粒模擬器的結果。粒子越小表面積越大，因此溶離越快。' } },
    { id: 'hardness', label: { en: 'Tablet tensile strength', zh: '錠劑抗張強度' }, unit: 'MPa', min: 0.5, max: 5, step: 0.1, def: 2,
      help: { en: 'Carried over from compression. Denser tablets have fewer pores for water to enter through.', zh: '沿用壓錠的結果。錠劑越密實，水能進入的孔隙越少。' } },
    { id: 'coat', label: { en: 'Coating level', zh: '包衣量' }, unit: '%', min: 0, max: 12, step: 0.5, def: 0,
      help: { en: 'Carried over from coating. A film has to hydrate and rupture before anything else can happen.', zh: '沿用包衣的結果。膜衣必須先水合並破裂，其他事情才能開始。' } },
    { id: 'disint', label: { en: 'Disintegrant level', zh: '崩散劑用量' }, unit: '%', min: 0.5, max: 10, step: 0.5, def: 4,
      help: { en: 'The excipient whose job is to swell and blow the tablet apart when it gets wet.', zh: '其任務是在遇水時膨脹並把錠劑撐開的賦形劑。' } }
  ],
  solve(p) {
    const solFactor = (() => {
      if (p.phDep === 0) return 1;
      if (p.phDep === 1) return [1.25, 0.72, 1.05, 1.55][p.medium];   // weak base: fast in acid
      return [1.05, 1.75, 1.25, 0.75][p.medium];                       // weak acid: fast at pH 6.8
    })();
    const Td = 6.0
      * Math.pow(50 / p.rpm, 0.55)
      * Math.pow(p.d50 / 250, 0.45)
      * (1 + p.coat / 7)
      * Math.pow(2 / Math.max(p.hardness, 0.3), -0.45)
      * Math.pow(4 / Math.max(p.disint, 0.5), 0.35)
      * (p.app === 1 ? 1.15 : 1.0)
      * solFactor;
    const lag = 0.8 + p.coat * 0.55 + p.hardness * 0.35;
    const b = 1.15 + p.coat * 0.05;

    const times = [5, 10, 15, 20, 30, 45, 60];
    const curve = times.map(t => {
      const tt = Math.max(0, t - lag);
      return { t, pct: 100 * (1 - Math.exp(-Math.pow(tt / Td, b))) };
    });
    // reference profile: a well-behaved immediate-release product
    const refTd = 6.0, refLag = 1.2, refB = 1.3;
    const ref = times.map(t => {
      const tt = Math.max(0, t - refLag);
      return { t, pct: 100 * (1 - Math.exp(-Math.pow(tt / refTd, refB))) };
    });

    // f2 at the PSG sampling times for linaclotide: 10, 15, 20, 30 min
    const psgT = [10, 15, 20, 30];
    const pick = arr => psgT.map(tt => arr.find(x => x.t === tt).pct);
    const { f2, valid } = f2Factor(pick(ref), pick(curve));
    const at15 = curve.find(x => x.t === 15).pct;
    const ref15 = ref.find(x => x.t === 15).pct;
    const bothFast = at15 >= 85 && ref15 >= 85;
    const q30 = curve.find(x => x.t === 30).pct;
    return { Td, lag, b, curve, ref, f2, f2valid: valid, at15, ref15, bothFast, q30, solFactor };
  },
  readouts: r => [
    { k: 'Q at 15 min', v: r.at15.toFixed(0), u: '%', cls: r.at15 >= 85 ? 'ok' : r.at15 >= 70 ? 'warn' : 'bad' },
    { k: 'Q at 30 min', v: r.q30.toFixed(0), u: '%', cls: r.q30 >= 85 ? 'ok' : 'warn' },
    { k: 'Reference at 15', v: r.ref15.toFixed(0), u: '%' },
    { k: 'Lag time', v: r.lag.toFixed(1), u: 'min' },
    { k: 'f2', v: r.bothFast ? 'n/r' : r.f2.toFixed(0), u: '', cls: r.bothFast ? 'ok' : r.f2 >= 50 ? 'ok' : 'bad' },
    { k: 'f2 valid?', v: r.bothFast ? 'waived' : (r.f2valid ? 'yes' : 'no'), u: '', cls: r.bothFast ? 'ok' : (r.f2valid ? 'ok' : 'warn') }
  ],
  verdict(r) {
    if (r.bothFast) return { tone: 'ok',
      en: `Both products release more than 85 % within 15 minutes, so under the linaclotide guidance no f2 comparison is required at all. This is the cheapest possible outcome and it is a formulation design objective, not luck — build a product that releases fast and completely and the statistics stop mattering.`,
      zh: `兩者都在 15 分鐘內釋放超過 85 %，因此依 linaclotide 指引，完全不需要做 f2 比較。這是成本最低的結果，而且它是處方設計目標而非運氣——做出一個快速且完全釋放的產品，統計就不再重要了。` };
    if (!r.f2valid) return { tone: 'warn',
      en: 'f2 cannot be used here. The rule allows only one mean point above 85 % in each profile, and this comparison breaks it. The number the software prints is not a result you can submit.',
      zh: '此處不能使用 f2。規則規定每條曲線在 85 % 以上最多只能有一個平均點，而這個比較違反了它。軟體印出來的數字不是你能送件的結果。' };
    if (r.f2 < 50) return { tone: 'bad',
      en: `f2 is ${r.f2.toFixed(0)}, below the acceptance value of 50. The two profiles are not similar and this batch would not support an in vitro bioequivalence claim. Look upstream — hardness, particle size and coating level are all in the model, and all three came from decisions made hours before this test.`,
      zh: `f2 為 ${r.f2.toFixed(0)}，低於接受值 50。兩條曲線不相似，這批產品無法支持體外生體相等性的主張。往上游看——硬度、粒徑與包衣量都在模型裡，而這三者都來自這項試驗之前數小時就做下的決定。` };
    if (r.f2 < 60) return { tone: 'warn',
      en: `f2 is ${r.f2.toFixed(0)} — a pass, but not one you would want to defend across three registration batches and a change of API supplier.`,
      zh: `f2 為 ${r.f2.toFixed(0)}——通過了，但這不是一個你會想在三批註冊批加上一次原料藥供應商變更之後還要去辯護的數字。` };
    return { tone: 'ok',
      en: `f2 is ${r.f2.toFixed(0)}. The profiles are similar with comfortable margin. Note that a comfortable f2 in one medium proves very little — the guidance asks for four.`,
      zh: `f2 為 ${r.f2.toFixed(0)}。兩條曲線相似且餘裕充足。但請注意，在單一介質中漂亮的 f2 證明不了什麼——指引要求四種介質。` };
  },
  /* Live schematic: a paddle rotates in a vessel of medium around a
     dissolving unit whose radius shrinks in real time using the same Td/lag/b
     Weibull parameters as the analytical curve, so the picture and the
     Q-at-15/30 readouts are the same model, not two different ones. */
  animate(x, W, H, t, p, r) {
    const cx = W * 0.5, top = H * 0.1, bot = H * 0.92, halfW = W * 0.22;
    x.strokeStyle = '#2e3742'; x.lineWidth = 2;
    x.beginPath();
    x.moveTo(cx - halfW, top); x.lineTo(cx - halfW, bot - 14);
    x.quadraticCurveTo(cx - halfW, bot, cx - halfW + 14, bot);
    x.lineTo(cx + halfW - 14, bot);
    x.quadraticCurveTo(cx + halfW, bot, cx + halfW, bot - 14);
    x.lineTo(cx + halfW, top);
    x.stroke();
    x.fillStyle = 'rgba(74,143,214,.10)';
    x.fillRect(cx - halfW, top + 8, halfW * 2, bot - top - 8);
    // paddle shaft + blade rotating at rpm
    const spin = t * (p.rpm / 30) * Math.PI * 2;
    const midY = (top + bot) / 2;
    x.strokeStyle = '#8b95a1'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(cx, top - 8); x.lineTo(cx, midY); x.stroke();
    x.save(); x.translate(cx, midY); x.rotate(spin);
    x.fillStyle = '#8b95a1'; x.fillRect(-26, -3, 52, 6);
    x.restore();
    // dissolving unit: radius shrinks over a repeating 60-second-scaled loop
    // using the same Weibull shape as solve(), so bench and chart agree
    const loopT = (t * 6) % 60;                      // compress ~60 min into a loop
    const ttL = Math.max(0, loopT - r.lag);
    const pct = 100 * (1 - Math.exp(-Math.pow(ttL / Math.max(r.Td, 0.5), r.b)));
    const rad = Math.max(2, 16 * (1 - pct / 100));
    x.fillStyle = '#2fc2c8';
    x.beginPath(); x.arc(cx, bot - 26, rad, 0, Math.PI * 2); x.fill();
  },
  deep: {
    en: [
      'Dissolution is the only test in this whole site that is simultaneously a quality control check, a development tool and a regulatory substitute for a clinical trial, and it behaves differently in each role. As a QC check it only has to detect a batch that has gone wrong. As a development tool it has to discriminate — to change when the formulation changes — which is the opposite of a method designed to pass. As a regulatory bridge it has to do both while being reproducible in someone else\'s laboratory.',
      'The f2 similarity factor is a deceptively simple statistic: it compares the mean difference between two profiles at matched time points and returns 50 if they differ by about 10 % on average. What trips people is not the arithmetic but the validity rule. f2 is only meaningful when no more than one mean point in each profile exceeds 85 %, because once both curves are nearly complete the differences shrink and f2 inflates towards 100 regardless of whether the products are alike.',
      'Which produces the most useful result in the whole exercise. If both products release more than 85 % in fifteen minutes, the linaclotide guidance waives f2 entirely — there is nothing left to compare. So the cheapest regulatory outcome available on this programme is not a clever statistical argument. It is a formulation that releases fast and completely, which is a manufacturing objective you can chase with particle size, hardness and disintegrant level. That is the whole thesis of this site in one test result.'
    ],
    zh: [
      '溶離是整個網站中唯一同時身兼三種角色的試驗：品管檢查、開發工具，以及取代臨床試驗的法規橋樑；而它在每種角色中的行為都不一樣。作為品管檢查，它只需要偵測出走偏的批次。作為開發工具，它必須具備鑑別力——處方一變，它就要變——這與「設計成會通過的方法」恰好相反。作為法規橋樑，它必須同時做到這兩件事，還要能在別人的實驗室裡重現。',
      'f2 相似因子是一個看似簡單、實則暗藏玄機的統計量：它比較兩條曲線在對應時間點的平均差異，若平均相差約 10 % 則回傳 50。絆倒人的不是算術，而是有效性規則。f2 只有在兩條曲線各自最多只有一個平均點超過 85 % 時才有意義，因為一旦兩條曲線都接近完成，差異會縮小，f2 便會不論產品是否相似都膨脹趨近 100。',
      '而這帶來整個練習中最有用的結果。如果兩個產品都在十五分鐘內釋放超過 85 %，linaclotide 指引就完全免除 f2——已經沒有東西需要比較了。因此本專案上成本最低的法規結果，並不是一個聰明的統計論證，而是一個「釋放得又快又完全」的處方；而那是一個你可以用粒徑、硬度與崩散劑用量去追求的製造目標。這整個網站的論點，就濃縮在這一份試驗結果裡。'
    ]
  }
};

/* ============================================================================
   6 · HOMOGENISATION (emulsions — the Restasis link)
   ========================================================================== */

const OP_HOMOG = {
  id: 'homog',
  icon: 'homog',
  name: { en: 'Homogenisation', zh: '均質' },
  tagline: { en: 'Making oil droplets small enough to stay suspended', zh: '把油滴打到小到足以保持懸浮' },
  why: {
    en: 'To put an oily drug into an eye drop you have to break the oil into droplets small enough that they do not float back to the top. A homogeniser forces the mixture through a narrow gap at high pressure, tearing the droplets apart. For a complex generic like Restasis, the size distribution of those droplets is not a quality attribute — it is the evidence that replaces a clinical trial.',
    zh: '要把油性藥物做成眼藥水，你必須把油相打成小到不會浮回液面的液滴。均質機以高壓迫使混合物通過狹窄的間隙，將液滴撕開。對 Restasis 這類複雜學名藥而言，這些液滴的粒徑分佈不只是品質屬性——它就是取代臨床試驗的那份證據。'
  },
  tryThis: {
    en: 'Drop the surfactant to 0.2 % and then push the pressure up. The droplets get smaller and then, at some point, start getting bigger again. Work out why before you read the verdict.',
    zh: '把界面活性劑降到 0.2 %，然後把壓力往上推。液滴會先變小，然後在某個點之後開始回頭變大。在看結論之前，先想清楚為什麼。'
  },
  controls: [
    { id: 'pressure', label: { en: 'Homogenising pressure', zh: '均質壓力' }, unit: 'bar', min: 100, max: 1500, step: 25, def: 700,
      help: { en: 'The energy you put in. Droplet size falls roughly as pressure to the power of minus 0.6.', zh: '你輸入的能量。液滴粒徑大致隨壓力的 −0.6 次方下降。' } },
    { id: 'passes', label: { en: 'Number of passes', zh: '循環次數' }, unit: '', min: 1, max: 10, step: 1, def: 3,
      help: { en: 'How many times the batch goes through. The first pass does most of the work; later passes narrow the distribution.', zh: '批料通過的次數。第一次循環完成大部分工作，後續循環則收窄分佈。' } },
    { id: 'oil', label: { en: 'Oil phase', zh: '油相' }, unit: '% w/w', min: 0.5, max: 8, step: 0.25, def: 1.25,
      help: { en: 'How much oil there is to disperse. More oil means more interface to stabilise with the same surfactant.', zh: '需要分散的油量。油越多，代表在相同界面活性劑用量下要穩定的界面越多。' } },
    { id: 'surf', label: { en: 'Surfactant', zh: '界面活性劑' }, unit: '% w/w', min: 0.05, max: 2.5, step: 0.05, def: 1,
      help: { en: 'Coats the new droplet surfaces the instant they form. Run out of it and droplets merge again faster than you can make them.', zh: '在新液滴表面形成的瞬間包覆它們。一旦用完，液滴重新合併的速度會快過你製造它們的速度。' } },
    { id: 'temp', label: { en: 'Process temperature', zh: '製程溫度' }, unit: '°C', min: 15, max: 70, step: 1, def: 40,
      help: { en: 'Warmer means lower viscosity and easier droplet break-up — and faster degradation of anything heat-sensitive.', zh: '溫度越高，黏度越低、液滴越容易被打散——但對熱敏感的成分降解也越快。' } }
  ],
  solve(p) {
    // interfacial area created, per unit volume: A ∝ oil / d32
    const dIdeal = 1500 * Math.pow(p.pressure / 100, -0.6)
      * Math.pow(1 + p.oil / 5, 0.35)
      * Math.pow(1 / Math.max(p.passes, 1), 0.25)
      * Math.pow(1 + (45 - p.temp) / 120, 1.0);
    /* Surfactant sets a FLOOR on droplet size, not a penalty on it. A given
       amount of surfactant can stabilise a fixed amount of interface, and
       interface per unit volume is oil fraction divided by droplet diameter.
       Below that floor, droplets recoalesce as fast as they are created — so
       energy stops buying size and starts buying heat. */
    const areaSupply = p.surf * 0.0156;                 // calibrated so coverage = 1 at ~0.2 % surfactant, 1.25 % oil, 400 nm
    const dLimit = p.oil / Math.max(areaSupply, 1e-6);  // smallest droplet the surfactant can hold
    const coverage = dIdeal / dLimit;                   // <1 means starved
    const d32 = coverage >= 1
      ? dIdeal
      : dLimit * (1 + (1 - coverage) * 0.35);           // starved: extra energy makes it worse
    const pdi = clamp01u(0.42 - p.passes * 0.035 + (coverage < 1 ? (1 - coverage) * 0.4 : 0) + p.oil / 60);
    const d90 = d32 * (1 + pdi * 2.1);
    // Stokes creaming velocity, mm per day — the practical stability signal
    const dm = d32 * 1e-9;
    const vCream = (2 * Math.pow(dm / 2, 2) * (1000 - 955) * 9.81 / (9 * 0.0009)) * 86400 * 1000;
    const tempRise = p.pressure / 1500 * 18 * p.passes / 3;
    const stability = clamp01u(1 - vCream / 3 - pdi * 0.6);
    // IVRT-style discriminating signal used for a complex-generic in vitro claim
    const ivrtMatch = clamp01u(1 - Math.abs(Math.log(d32 / 300)) * 0.9 - pdi * 0.5);
    return { d32, d90, pdi, coverage, vCream, tempRise, stability, ivrtMatch, dIdeal };
  },
  readouts: r => [
    { k: 'Droplet d₃₂', v: r.d32.toFixed(0), u: 'nm', cls: r.d32 > 900 ? 'bad' : r.d32 > 500 ? 'warn' : 'ok' },
    { k: 'D90', v: r.d90.toFixed(0), u: 'nm' },
    { k: 'Polydispersity', v: r.pdi.toFixed(2), u: '', cls: r.pdi > 0.4 ? 'bad' : r.pdi > 0.25 ? 'warn' : 'ok' },
    { k: 'Surfactant coverage', v: r.coverage.toFixed(2), u: '×', cls: r.coverage < 1 ? 'bad' : r.coverage < 1.3 ? 'warn' : 'ok' },
    { k: 'Creaming rate', v: r.vCream.toFixed(2), u: 'mm/d', cls: r.vCream > 2 ? 'bad' : r.vCream > 0.5 ? 'warn' : 'ok' },
    { k: 'Temperature rise', v: r.tempRise.toFixed(1), u: 'K', cls: r.tempRise > 20 ? 'warn' : 'ok' },
    { k: 'Globule-profile match', v: (r.ivrtMatch * 100).toFixed(0), u: '%', cls: r.ivrtMatch < 0.5 ? 'bad' : r.ivrtMatch < 0.75 ? 'warn' : 'ok' }
  ],
  verdict(r) {
    if (r.coverage < 1) return { tone: 'bad',
      en: `Surfactant-starved. There is only enough surfactant to cover ${(r.coverage * 100).toFixed(0)} % of the interface you are creating, so droplets merge back together as fast as the homogeniser splits them. Adding pressure here makes it worse, not better — you are creating more surface than you can pay for.`,
      zh: `界面活性劑不足。現有的量只夠覆蓋你所創造界面的 ${(r.coverage * 100).toFixed(0)} %，因此液滴重新合併的速度與均質機撕開它們的速度一樣快。此時加壓只會更糟——你正在創造超出自己負擔能力的表面積。` };
    if (r.vCream > 2) return { tone: 'bad',
      en: `Droplets are large enough to cream visibly. On the stability shelf you would see a layer separating within days, and a patient shaking the bottle is not a control strategy.`,
      zh: `液滴大到會出現明顯的乳析。在安定性試驗架上，你會在數天內看到分層，而「叫病人搖一搖瓶子」不是一套控制策略。` };
    if (r.pdi > 0.4) return { tone: 'warn',
      en: 'The distribution is too broad. For a complex generic this matters more than the mean: FDA compares the whole globule size distribution profile against the reference, not just D50.',
      zh: '分佈太寬。對複雜學名藥而言，這比平均值更重要：FDA 比較的是整條油滴粒徑分佈曲線與參考品的差異，而不只是 D50。' };
    if (r.tempRise > 22) return { tone: 'warn',
      en: `Each pass is putting ${r.tempRise.toFixed(0)} K into the batch. For a peptide or a thermolabile API you are buying droplet size with degradation, and you will find the bill in the impurity profile.`,
      zh: `每次循環為批料帶入 ${r.tempRise.toFixed(0)} K 的溫升。對胜肽或熱不安定的原料藥而言，你是用降解換取液滴粒徑，而帳單會出現在雜質圖譜上。` };
    return { tone: 'ok',
      en: `A stable emulsion: d₃₂ ${r.d32.toFixed(0)} nm, polydispersity ${r.pdi.toFixed(2)}, creaming ${r.vCream.toFixed(2)} mm per day. Fine enough to hold, narrow enough to defend against a reference profile.`,
      zh: `一個穩定的乳劑：d₃₂ 為 ${r.d32.toFixed(0)} nm、多分散度 ${r.pdi.toFixed(2)}、乳析速率每天 ${r.vCream.toFixed(2)} mm。細到能維持懸浮，窄到足以對參考曲線提出辯護。` };
  },
  /* Live schematic: a coarse oil droplet on the left is forced through a
     narrow homogenising valve and emerges as a cloud of small droplets
     sized off the live d32 — and, when surfactant-starved, some visibly
     recoalesce on the right, matching the 'extra pressure makes it worse'
     verdict rather than just asserting it in text. */
  animate(x, W, H, t, p, r) {
    const midY = H * 0.55, gapX = W * 0.42;
    x.strokeStyle = '#2e3742'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(gapX - 10, midY - 34); x.lineTo(gapX, midY - 6); x.lineTo(gapX, midY + 6); x.lineTo(gapX - 10, midY + 34); x.stroke();
    x.beginPath(); x.moveTo(gapX + 10, midY - 34); x.lineTo(gapX, midY - 6); x.lineTo(gapX, midY + 6); x.lineTo(gapX + 10, midY + 34); x.stroke();
    const starved = r.coverage < 1;
    const dSize = Math.max(1.4, Math.min(7, r.d32 / 130));
    const n = 10;
    for (let i = 0; i < n; i++) {
      const ph = (t * (0.4 + p.pressure / 900) + i / n) % 1;
      if (ph < 0.42) {
        const ex = 12 + ph / 0.42 * (gapX - 24);
        x.fillStyle = 'rgba(216,161,60,.85)';
        x.beginPath(); x.arc(ex, midY + Math.sin(i) * 14, 9, 0, Math.PI * 2); x.fill();
      } else {
        const past = (ph - 0.42) / 0.58;
        const ex = gapX + past * (W - gapX - 16);
        const jitter = Math.sin(i * 3 + t * 2) * 10;
        // starved case: droplets drift back together (recoalescence) as they travel right
        const merge = starved ? past * 0.5 : 0;
        for (let k = 0; k < (starved ? 2 : 4); k++) {
          const cx2 = ex + k * (starved ? (3 - merge * 6) : 7);
          const cy2 = midY + jitter + k * (starved ? (3 - merge * 6) : 6) - 8;
          x.fillStyle = starved ? 'rgba(217,97,79,.8)' : 'rgba(47,194,200,.85)';
          x.beginPath(); x.arc(cx2, cy2, dSize, 0, Math.PI * 2); x.fill();
        }
      }
    }
  },
  deep: {
    en: [
      'Emulsification is a two-step process that people usually describe as one. Step one is break-up: the homogeniser tears large droplets into small ones, and this is the part that responds to pressure. Step two is stabilisation: surfactant molecules have to reach the newly created surface and adsorb onto it before two fresh droplets find each other and merge. Break-up happens in microseconds. Adsorption does not.',
      'That is why the pressure curve turns around. Halving the droplet size doubles the interfacial area you have to cover, so the surfactant demand rises as you push harder. Past the point where the surfactant runs out, extra energy creates surface that immediately recoalesces, and the measured droplet size stops falling and starts climbing. Operators read this as "the homogeniser is not working" and turn the pressure up, which is precisely the wrong response.',
      'For a complex generic this stops being a process question and becomes the regulatory case. The Restasis product-specific guidance accepts an in vitro route in place of a clinical endpoint trial, and the evidence it asks for is the globule size distribution — the whole profile, compared against the reference product, not a single mean. So the distribution width is not a quality attribute you report. It is the thing you are trying to prove, and the homogeniser settings are the argument.'
    ],
    zh: [
      '乳化是一個兩步驟的過程，但人們通常把它說成一步。第一步是破碎：均質機把大液滴撕成小液滴，這是對壓力有反應的部分。第二步是安定化：界面活性劑分子必須在兩顆新生的液滴找到彼此並合併之前，抵達新創造的表面並吸附上去。破碎發生在微秒之間，吸附不會。',
      '這正是為什麼壓力曲線會轉頭。液滴粒徑減半，你必須覆蓋的界面面積就加倍，因此推得越用力，界面活性劑的需求就越高。一旦超過界面活性劑耗盡的那個點，額外的能量所創造的表面會立即重新合併，量測到的液滴粒徑便停止下降、開始攀升。操作者會把這讀成「均質機沒在作用」而把壓力調高，這恰恰是最錯誤的反應。',
      '對複雜學名藥而言，這不再是製程問題，而變成整個法規論證本身。Restasis 的產品專屬指引接受以體外路徑取代臨床終點試驗，而它要求的證據正是油滴粒徑分佈——是整條曲線與參考產品的比較，不是單一平均值。因此分佈寬度不是一個你「回報」的品質屬性，它就是你正在試圖證明的那件事，而均質機的設定就是你的論證。'
    ]
  }
};

const UNIT_OPS = [OP_PSD, OP_BLEND, OP_COMPRESS, OP_COATING, OP_DISSOL, OP_HOMOG];
