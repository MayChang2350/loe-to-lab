/* ============================================================================
   fluidbed.js — GPCG-class fluid bed: physics engine + teaching content
   ----------------------------------------------------------------------------
   The engine below is a first-principles lumped model, not a CFD simulation.
   It is built from published correlations that any process engineer can check:

     Wen & Yu (1966)        — minimum fluidisation velocity from Archimedes no.
     Haider & Levenspiel    — terminal settling velocity with sphericity
     Sutherland             — air viscosity as a function of temperature
     Magnus / Tetens        — saturation vapour pressure over water
     ASHRAE psychrometrics  — moist-air enthalpy and humidity ratio

   What it will tell you correctly: the direction and rough magnitude of every
   response, the location of the operating window, and which failure mode you
   are approaching. What it will not tell you: your actual batch. Fluid beds
   are geometry-specific and the only trustworthy operating window is the one
   your own development batches drew.
   ========================================================================== */

/* ---------- Geometry (GPCG-5 class, Wurster insert) --------------------- */

const FB_GEOM = {
  wurster: {
    bowlDia: 0.38,       // m, at distributor plate
    tubeDia: 0.152,      // m, Wurster partition inner diameter
    tubeHeight: 0.45,    // m
    partitionAirFrac: 0.93, // fraction of total air through the high-open-area zone
    expansionDia: 0.70   // m, freeboard/expansion chamber
  },
  topspray: {
    bowlDia: 0.38,
    tubeDia: 0,
    tubeHeight: 0,
    partitionAirFrac: 1.0,
    expansionDia: 0.70
  }
};

const P_ATM = 101325;    // Pa

/* ---------- Fundamental property correlations -------------------------- */

// Saturation vapour pressure over water, Pa. Magnus form, T in °C.
function pSat(T) { return 610.94 * Math.exp(17.625 * T / (T + 243.04)); }

// Inverse: dew point °C from vapour pressure Pa.
function dewPoint(pv) {
  if (pv <= 0) return -60;
  const a = Math.log(pv / 610.94);
  return 243.04 * a / (17.625 - a);
}

// Humidity ratio (kg water / kg dry air) from dew point °C.
function humidityRatio(Tdp) {
  const pv = pSat(Tdp);
  return 0.622 * pv / (P_ATM - pv);
}

// Dry-air density, kg/m³, T in °C.
function airDensity(T) { return P_ATM / (287.06 * (T + 273.15)); }

// Dynamic viscosity of air, Pa·s. Sutherland, T in °C.
function airViscosity(T) {
  const Tk = T + 273.15;
  return 1.458e-6 * Math.pow(Tk, 1.5) / (Tk + 110.4);
}

// Moist-air specific enthalpy, kJ per kg dry air.
function moistEnthalpy(T, W) { return 1.006 * T + W * (2501 + 1.86 * T); }

/* ---------- Fluidisation ------------------------------------------------ */

// Minimum fluidisation velocity, m/s. Wen & Yu correlation.
function uMf(dp, rhoP, rhoG, mu) {
  const Ar = rhoG * (rhoP - rhoG) * 9.81 * Math.pow(dp, 3) / (mu * mu);
  const Remf = Math.sqrt(33.7 * 33.7 + 0.0408 * Ar) - 33.7;
  return Remf * mu / (rhoG * dp);
}

// Terminal settling velocity, m/s. Haider & Levenspiel with sphericity phi.
function uTerminal(dp, rhoP, rhoG, mu, phi) {
  const g = 9.81;
  const dStar = dp * Math.pow(rhoG * (rhoP - rhoG) * g / (mu * mu), 1 / 3);
  const uStar = 1 / (18 / (dStar * dStar) + (2.335 - 1.744 * phi) / Math.sqrt(dStar));
  return uStar * Math.pow(mu * (rhoP - rhoG) * g / (rhoG * rhoG), 1 / 3);
}

/* ---------- Atomisation ------------------------------------------------- */

// Atomising-air mass flow, kg/h, for a ~1.2 mm binary nozzle. Approximately
// linear in gauge pressure over 0.5–3 bar.
function atomAirFlow(pBar) { return 3.2 * pBar; }

// Sauter mean droplet diameter, µm, as a function of air-to-liquid mass ratio.
// Empirical form: finer droplets at higher ALR, asymptotically limited.
function dropletSMD(pBar, sprayGmin) {
  const liqKgH = sprayGmin * 60 / 1000;
  const alr = liqKgH > 0 ? atomAirFlow(pBar) / liqKgH : 50;
  return 12 + 55 / Math.pow(Math.max(alr, 0.2), 0.9);
}

/* ---------- Main solver ------------------------------------------------- */
/*
   Inputs (object):
     mode        'wurster' | 'topspray'
     airVol      m³/h
     inletT      °C
     dewPtIn     °C
     spray       g/min
     atom        bar
     gap         mm  (Wurster only)
     loadKg      kg
     dpUm        µm  (current mean particle size)
     rhoP        kg/m³
     solidsPct   % w/w in spray liquid
     liqT        °C
     runMin      min elapsed / planned
*/
function fbSolve(inp) {
  const G = FB_GEOM[inp.mode];
  const aBowl = Math.PI / 4 * G.bowlDia * G.bowlDia;
  const aTube = G.tubeDia ? Math.PI / 4 * G.tubeDia * G.tubeDia : 0;
  const aAnn = aBowl - aTube;
  const aExp = Math.PI / 4 * G.expansionDia * G.expansionDia;

  const dp = inp.dpUm * 1e-6;
  const solidsFrac = inp.solidsPct / 100;

  /* --- Mass and energy balance ------------------------------------- */
  const Win = humidityRatio(inp.dewPtIn);
  const rhoIn = airDensity(inp.inletT);
  const mMoist = (inp.airVol / 3600) * rhoIn;          // kg/s moist air
  const mDry = mMoist / (1 + Win);                     // kg/s dry air

  const mLiq = inp.spray / 1000 / 60;                  // kg/s total liquid
  const mWater = mLiq * (1 - solidsFrac);              // kg/s water to evaporate
  const mSolids = mLiq * solidsFrac;                   // kg/s solids delivered

  const Wout = Win + (mDry > 0 ? mWater / mDry : 0);

  const hIn = moistEnthalpy(inp.inletT, Win);
  const qLiqIn = mLiq * 4.18 * inp.liqT;               // kW
  const qLoss = 0.06 * mDry * 1.006 * Math.max(inp.inletT - 20, 0); // kW, wall losses
  const rhs = hIn + (mDry > 0 ? (qLiqIn - qLoss) / mDry : 0);

  // Solve moistEnthalpy(Tout, Wout) = rhs for Tout
  const Tout = (rhs - 2501 * Wout) / (1.006 + 1.86 * Wout);

  // Product temperature sits slightly below outlet air in the wet zone.
  const Tprod = Tout - (mWater > 0 ? 1.5 : 0);

  const pvOut = P_ATM * Wout / (0.622 + Wout);
  const rhOut = Math.min(100, 100 * pvOut / pSat(Tout));
  const dpOut = dewPoint(pvOut);
  const dryingForce = Tout - dpOut;   // K — the thermodynamic driving force

  /* --- Fluidisation ------------------------------------------------- */
  const rhoG = airDensity(Tprod);
  const mu = airViscosity(Tprod);
  const Umf = uMf(dp, inp.rhoP, rhoG, mu);
  const Ut = uTerminal(dp, inp.rhoP, rhoG, mu, 0.95);

  const qTot = inp.airVol / 3600;                       // m³/s
  const Usup = qTot / aBowl;                            // superficial, whole plate
  const Uexp = qTot / aExp;                             // freeboard velocity
  const Utube = aTube ? (G.partitionAirFrac * qTot) / aTube : 0;
  const Uann = aAnn ? ((1 - G.partitionAirFrac) * qTot) / aAnn : Usup;

  const FN = Usup / Umf;                                // fluidisation number
  const annRatio = Uann / Umf;
  const transportOK = inp.mode === 'wurster' ? Utube > Ut * 1.3 : true;
  const elutriating = Uexp > Ut;

  /* --- Circulation and coating uniformity (Wurster) ------------------ */
  let cycleS = null, passes = null, coatCV = null, avEst = null;
  if (inp.mode === 'wurster') {
    const rhoBulk = inp.rhoP * 0.58;                    // bulk from true density
    const aGap = Math.PI * G.tubeDia * (inp.gap / 1000);
    const vEntrain = 0.35 * Utube;
    const W = 0.08 * rhoBulk * aGap * vEntrain;         // kg/s solids circulated
    cycleS = W > 0 ? inp.loadKg / W : Infinity;
    passes = cycleS > 0 && isFinite(cycleS) ? (inp.runMin * 60) / cycleS : 0;
    // Coating variance falls as 1/sqrt(N passes); k folds in droplet-scale scatter
    coatCV = passes > 0 ? 100 * Math.sqrt(2.0 / passes) : 100;
    if (!transportOK) coatCV *= 2.5;                    // stalled circulation destroys it
    avEst = 2.4 * coatCV;                               // AV ≈ k·s for n=10, mean on target
  }

  /* --- Droplets and risk indices ------------------------------------ */
  const smd = dropletSMD(inp.atom, inp.spray);

  const clamp01 = x => Math.max(0, Math.min(1, x));
  const overWet = clamp01(
    0.6 * (rhOut - 12) / 38 + 0.4 * (28 - dryingForce) / 28
  );
  const sprayDry = clamp01(
    0.40 * (Tprod - 38) / 22 + 0.40 * (40 - smd) / 30 + 0.20 * (20 - rhOut) / 20
  );
  // Shear on the particle surface: in a Wurster it is set by transport velocity
  // in the partition; in a bubbling bed by how hard the bed is fluidised.
  const shearTerm = inp.mode === 'wurster'
    ? (Utube / Ut - 2.5) / 5
    : (FN - 3) / 6;
  const attrition = clamp01(0.5 * (inp.atom - 1.0) / 2.0 + 0.5 * shearTerm);

  /* --- Efficiency and throughput ------------------------------------ */
  const effSprayDry = 1 - 0.35 * sprayDry;
  const effElutri = elutriating ? 0.90 : 0.985;
  const coatEff = Math.max(0.4, effSprayDry * effElutri);
  const evapCapKgH = mDry * (humidityRatio(Tout - 8) - Win) * 3600; // rough headroom
  const solidsRateGmin = mSolids * 60 * 1000 * coatEff;

  /* --- Regime classification ----------------------------------------
     Deliberately different for the two configurations, because the
     superficial velocity over the whole plate means completely different
     things in each. In a Wurster, 30 x Umf across the plate is normal and
     correct — the air is concentrated under the partition on purpose. What
     matters there is whether the up-bed transports and whether the annulus
     stays a slowly descending aerated moving bed. In a top-spray bed there
     is no partition, so the classic fluidisation number applies.          */
  let regime, regimeClass;
  if (inp.mode === 'wurster') {
    if (Utube < Ut) { regime = 'fixed'; regimeClass = 'bad'; }
    else if (!transportOK) { regime = 'stalled'; regimeClass = 'bad'; }
    else if (annRatio > 6) { regime = 'annulusFluid'; regimeClass = 'warn'; }
    else if (annRatio < 0.35) { regime = 'annulusStagnant'; regimeClass = 'warn'; }
    else if (elutriating) { regime = 'elutriating'; regimeClass = 'warn'; }
    else { regime = 'good'; regimeClass = 'ok'; }
  } else {
    if (FN < 1) { regime = 'fixed'; regimeClass = 'bad'; }
    else if (FN < 2) { regime = 'minimal'; regimeClass = 'warn'; }
    else if (elutriating) { regime = 'elutriating'; regimeClass = 'warn'; }
    else if (FN > 9) { regime = 'slugging'; regimeClass = 'warn'; }
    else { regime = 'good'; regimeClass = 'ok'; }
  }

  return {
    Win, Wout, mDry, mWater, mSolids,
    Tout, Tprod, rhOut, dpOut, dryingForce,
    Umf, Ut, Usup, Utube, Uann, Uexp, FN, annRatio, transportOK, elutriating,
    cycleS, passes, coatCV, avEst,
    smd, alr: atomAirFlow(inp.atom) / Math.max(inp.spray * 60 / 1000, 0.01),
    overWet, sprayDry, attrition,
    coatEff, evapCapKgH, solidsRateGmin,
    regime, regimeClass,
    aBowl, aTube, aAnn
  };
}

/* ---------- Knob dictionary --------------------------------------------- */

const FB_KNOBS = [
  {
    id: 'airVol',
    name: { en: 'Inlet air volume', zh: '進風風量' }, unit: 'm³/h',
    does: {
      en: 'Sets superficial gas velocity, and therefore everything: whether the bed fluidises at all, how fast beads travel up the partition, how much water the air can carry away, and how much fine material leaves through the filters.',
      zh: '決定表觀氣速，因而決定了一切：床體是否能流化、微丸沿內筒上升的速度、空氣能帶走多少水分，以及有多少細粉會經濾袋離開。'
    },
    reads: {
      en: 'Between minimum fluidisation and terminal velocity there is a working range. Below Umf the bed is a packed bed and nothing moves. Above the terminal velocity of your smallest particles, those particles leave.',
      zh: '在最小流化速度與終端速度之間存在一個工作區間。低於 Umf，床體就是一個填充床，什麼都不動。高於最小顆粒的終端速度，那些顆粒就會離開。'
    },
    trap: {
      en: 'Bed mass grows during a layering run, and the velocity that was correct at the start is too low by the end. If nobody adjusts it, circulation quietly slows, passes per unit time fall, and content uniformity degrades for a reason that never appears on the trend chart.',
      zh: '層積過程中床體質量會增加，起始時正確的氣速到結束時已經太低。若無人調整，循環會悄悄變慢、單位時間的通過次數下降，含量均勻度隨之惡化——而原因永遠不會出現在趨勢圖上。'
    },
    cqa: ['Content uniformity', 'Yield', 'PSD']
  },
  {
    id: 'inletT',
    name: { en: 'Inlet air temperature', zh: '進風溫度' }, unit: '°C',
    does: {
      en: 'Supplies the sensible heat that becomes latent heat of evaporation. It is the energy input to the whole water balance.',
      zh: '提供轉化為蒸發潛熱的顯熱，是整個水分收支的能量輸入。'
    },
    reads: {
      en: 'Inlet temperature is a means. Product temperature is the end. The same inlet temperature produces a different product temperature at a different spray rate, air volume or humidity — which is why the batch record should control to the product probe.',
      zh: '進風溫度是手段，物料溫度才是目的。在不同的噴速、風量或濕度下，相同的進風溫度會產生不同的物料溫度——這正是批次紀錄應以物料探棒作為控制依據的原因。'
    },
    trap: {
      en: 'Raising it is the instinctive response to a wet bed, and it is the wrong first move: it masks a negative water balance instead of correcting it, and for a thermally labile molecule you have paid in degradation for a cosmetic recovery.',
      zh: '床體過濕時，提高進風溫度是直覺反應，卻是錯誤的第一步：它掩蓋了負的水分收支而非修正它，而對熱不安定的分子而言，你是用降解換來一個表面上的回復。'
    },
    cqa: ['Related substances', 'LOD', 'Film morphology']
  },
  {
    id: 'dewPtIn',
    name: { en: 'Inlet air dew point', zh: '進風露點' }, unit: '°C',
    does: {
      en: 'Sets how much water the incoming air already carries, and therefore how much more it can absorb. It is the difference between a reproducible process and a seasonal one.',
      zh: '決定進風已經帶有多少水分，因而決定它還能吸收多少。它是「可重現的製程」與「隨季節變動的製程」之間的差別。'
    },
    reads: {
      en: 'Air at 8 °C dew point carries roughly 6.7 g of water per kg of dry air; at 22 °C it carries about 16.8 g. That difference is a quarter of the evaporative capacity of a typical Wurster run, taken away before you start.',
      zh: '露點 8 °C 的空氣每公斤乾空氣約帶 6.7 克水；露點 22 °C 時約帶 16.8 克。這個差距相當於典型 Wurster 作業約四分之一的蒸發能力，而且是在你開始之前就被拿走的。'
    },
    trap: {
      en: 'A process developed in a dry winter and transferred in a humid summer will fail at identical setpoints, and the batch record will show nothing wrong. This is the single most common reason a technology transfer that "should work" does not.',
      zh: '在乾燥冬季開發、於潮濕夏季移轉的製程，會在完全相同的設定值下失敗，而批次紀錄上看不出任何異常。這是「照理應該可行」的技術移轉卻失敗的最常見單一原因。'
    },
    cqa: ['LOD', 'Agglomeration', 'Batch-to-batch consistency']
  },
  {
    id: 'spray',
    name: { en: 'Spray rate', zh: '噴液速率' }, unit: 'g/min',
    does: {
      en: 'Delivers solids and water simultaneously. It is the throughput lever and the risk lever at the same time, which is why it is the parameter operators most want to raise and the one they should raise last.',
      zh: '同時輸送固體與水分。它既是產能槓桿也是風險槓桿，這正是為什麼它是操作者最想調高、卻應該最後才調高的參數。'
    },
    reads: {
      en: 'Every gram of spray at 8% solids delivers 0.08 g of film and 0.92 g of water the bed has to lose. Doubling spray rate roughly doubles the evaporative load and halves the run time, so it moves you toward over-wetting and away from good uniformity in the same motion.',
      zh: '在 8% 固含量下，每一克噴液帶來 0.08 克膜和 0.92 克必須被床體排除的水。噴速加倍大致使蒸發負荷加倍、作業時間減半，因此它在同一個動作中把你推向過濕，並推離良好的均勻度。'
    },
    trap: {
      en: 'Shortening a run by raising spray rate reduces the number of passes each bead makes through the spray zone. The same mass applied in fewer passes is the definition of a worse coating distribution, and it will show up as AV, not as assay.',
      zh: '靠提高噴速縮短作業時間，會減少每顆微丸通過噴霧區的次數。用更少的通過次數施用相同的質量，正是「更差的包衣分佈」的定義，而它會反映在 AV 上，不是含量上。'
    },
    cqa: ['Content uniformity', 'Agglomeration', 'LOD', 'Coating efficiency']
  },
  {
    id: 'atom',
    name: { en: 'Atomisation pressure', zh: '霧化壓力' }, unit: 'bar',
    does: {
      en: 'Sets the droplet size distribution through the air-to-liquid mass ratio at the nozzle.',
      zh: '透過噴嘴處的氣液質量比決定液滴粒徑分佈。'
    },
    reads: {
      en: 'Smaller droplets spread further and give a smoother, more even film. But below roughly 20 µm an increasing fraction dries before it lands — the solids that should have been film become airborne powder and leave through the filters. There is an optimum, and it is not "as fine as possible".',
      zh: '較小的液滴鋪展更好，可得到更平滑均勻的膜。但小於約 20 µm 後，越來越多液滴會在落下前乾掉——本應成膜的固體變成懸浮粉末並經濾袋離開。存在一個最佳值，而它不是「越細越好」。'
    },
    trap: {
      en: 'Atomisation pressure also drives attrition at the bead surface, and on a drug-layered bead attrition means potency in the filter bags. High pressure buys you a smooth film and charges you for it in yield.',
      zh: '霧化壓力同時驅動微丸表面的磨耗，而在藥物層積的微丸上，磨耗就等於效價跑進濾袋。高壓為你買來平滑的膜，並以收率向你收費。'
    },
    cqa: ['Coating efficiency', 'Surface morphology', 'Yield', 'Fines']
  },
  {
    id: 'gap',
    name: { en: 'Wurster gap (partition height)', zh: 'Wurster 間隙（內筒高度）' }, unit: 'mm',
    does: {
      en: 'Controls the rate at which beads are drawn from the down-bed into the up-bed. It is the throttle on the circulation loop.',
      zh: '控制微丸從下降區被吸入上升區的速率。它是循環迴路上的節流閥。'
    },
    reads: {
      en: 'Too small and the down-bed starves, circulation stalls, and beads sit in the annulus not getting coated. Too large and beads enter as a thick, poorly separated curtain, so the spray hits the outside of a clump instead of individual particles.',
      zh: '過小則下降區供料不足、循環停滯，微丸滯留在環隙區得不到包衣。過大則微丸以厚而分離不良的簾幕進入，噴霧打到的是一團微丸的外側，而不是個別顆粒。'
    },
    trap: {
      en: 'It is the least-adjusted setting on the machine because it requires opening the bowl, and it is the setting with the largest single effect on content uniformity. That combination is why uniformity problems get blamed on spray rate.',
      zh: '因為調整它必須打開機台，它是全機最少被調整的設定，卻是對含量均勻度單一影響最大的設定。這個組合正是為什麼均勻度問題總被歸咎於噴速。'
    },
    cqa: ['Content uniformity', 'Cycle time', 'Agglomeration']
  },
  {
    id: 'loadKg',
    name: { en: 'Bed load', zh: '床體裝載量' }, unit: 'kg',
    does: {
      en: 'Determines bed height, pressure drop, and how long a full circulation cycle takes.',
      zh: '決定床高、壓差，以及一次完整循環所需的時間。'
    },
    reads: {
      en: 'Cycle time scales roughly with load at constant circulation rate. Doubling the load without increasing air volume doubles the cycle time and halves the number of passes in a fixed run — the same coating, distributed half as evenly.',
      zh: '在循環速率固定時，循環時間大致與裝載量成正比。裝載量加倍而不提高風量，會使循環時間加倍，在固定作業時間內通過次數減半——同樣的包衣，均勻度只剩一半。'
    },
    trap: {
      en: 'Scale-up is not "run the bigger machine at the same settings". Hold spray rate per nozzle and air volume per kilogram constant, then verify circulation empirically. Copying setpoints across scales is the most reliable way to fail a pilot batch.',
      zh: '放大不是「用大機台跑同樣的設定值」。應維持「每支噴嘴的噴速」與「每公斤的風量」不變，再以實驗確認循環狀態。跨規模照抄設定值，是最可靠的中試批失敗方式。'
    },
    cqa: ['Content uniformity', 'Cycle time', 'Scale-up comparability']
  },
  {
    id: 'solidsPct',
    name: { en: 'Solution solids content', zh: '噴液固含量' }, unit: '% w/w',
    does: {
      en: 'Sets how much water accompanies each gram of film delivered.',
      zh: '決定每輸送一克膜材時伴隨多少水分。'
    },
    reads: {
      en: 'Raising solids from 8% to 12% cuts the water per gram of solids by a third — a large gain in evaporative headroom and run time, bought with higher viscosity, coarser droplets and a greater risk of nozzle bearding.',
      zh: '把固含量從 8% 提高到 12%，可使每克固體伴隨的水量減少三分之一——蒸發餘裕與作業時間都大幅改善，代價是黏度上升、液滴變粗，以及噴嘴結垢風險提高。'
    },
    trap: {
      en: 'Solids content is a formulation variable, not just a process one. Changing it changes the film-forming conditions and can change the dissolution profile, which for a Q1/Q2-constrained ANDA is a regulatory question, not an engineering one.',
      zh: '固含量是處方變數，不只是製程變數。改變它會改變成膜條件並可能改變溶離曲線，而對受 Q1/Q2 限制的 ANDA 而言，這是法規問題，不是工程問題。'
    },
    cqa: ['Dissolution', 'Film morphology', 'Run time']
  }
];

/* ---------- Principles panel -------------------------------------------- */

const FB_PRINCIPLES = [
  {
    title: { en: 'Fluid dynamics: the window between Umf and Ut', zh: '流體力學：Umf 與 Ut 之間的窗口' },
    body: {
      en: 'A particle bed fluidises when the pressure drop across it equals the bed weight per unit area. Below that superficial velocity — the minimum fluidisation velocity, predicted here by Wen & Yu from the Archimedes number — the bed is a packed bed and gas simply percolates through it. Above the terminal settling velocity of a given particle, that particle is carried out of the bed entirely. Every fluid-bed process lives in the window between those two numbers, and because both scale with particle size, the window moves as your product grows during the run.',
      zh: '當通過顆粒床的壓差等於單位面積的床重時，床體開始流化。低於該表觀氣速——即最小流化速度，此處以 Wen & Yu 由 Archimedes 數推得——床體只是一個填充床，氣體單純從中滲流而過。高於某顆粒的終端沉降速度，該顆粒就會被完全帶出床外。所有流體床製程都活在這兩個數字之間的窗口裡，而由於兩者都隨粒徑變化，窗口會隨著作業中產品長大而移動。'
    }
  },
  {
    title: { en: 'The Wurster: why a tube changes everything', zh: 'Wurster：為什麼一根管子改變了一切' },
    body: {
      en: 'A plain bubbling bed mixes chaotically, so the time any given particle spends in the spray zone is essentially random. The Wurster partition converts that chaos into a loop: a high-open-area plate section accelerates a dilute stream up through the tube past the nozzle, beads decelerate in the expansion chamber, fall into a dense slowly descending annulus, and re-enter through the gap. Each particle now makes a countable number of near-identical passes. Coating variance falls roughly as one over the square root of that count — which is the entire reason a Wurster exists and the reason circulation rate, not spray rate, governs content uniformity.',
      zh: '單純的鼓泡床是混沌混合的，因此任一顆粒停留在噴霧區的時間基本上是隨機的。Wurster 內筒把這種混沌轉換成一個迴路：分佈板上高開孔率的區段將稀相顆粒流加速通過內筒、經過噴嘴，微丸在擴張室減速，落入緻密而緩慢下沉的環隙區，再從間隙重新進入。此時每顆粒子都經歷了「可計數且近乎相同」的通過次數。包衣變異大致隨該次數的平方根倒數下降——這正是 Wurster 存在的全部理由，也是為什麼主導含量均勻度的是循環速率而非噴速。'
    }
  },
  {
    title: { en: 'Thermodynamics: you control a water balance, not a temperature', zh: '熱力學：你控制的是水分收支，不是溫度' },
    body: {
      en: 'Product temperature is not something you set. It is the answer to an energy balance: sensible heat arrives with the inlet air, latent heat leaves with evaporated water, and the bed settles wherever those two meet. That is why spray rate changes product temperature without anyone touching the heater, and why the same setpoints give a different result on a humid day. The number worth watching is not the product temperature itself but the gap between outlet temperature and outlet dew point — the thermodynamic driving force. When that gap closes, the air is saturated and the bed will start accumulating water no matter what the temperature reads.',
      zh: '物料溫度不是你設定的東西，而是一個能量平衡的答案：顯熱隨進風而來，潛熱隨蒸發的水而去，床體就停在兩者相遇之處。這正是為什麼改變噴速會改變物料溫度而沒有人碰過加熱器，也是為什麼相同的設定值在潮濕的日子會得到不同結果。真正值得盯住的數字不是物料溫度本身，而是排風溫度與排風露點之間的差距——熱力學驅動力。當這個差距收斂，空氣已經飽和，無論溫度讀數是多少，床體都將開始累積水分。'
    }
  },
  {
    title: { en: 'The operating window is a region, not a setpoint', zh: '操作窗口是一個區域，不是一個設定點' },
    body: {
      en: 'Plot spray rate against product temperature and the failures fall on opposite sides. Too much water and too little heat gives over-wetting: liquid bridges form, beads agglomerate, the bed defluidises. Too little water and too much heat gives spray drying: droplets solidify in flight, the film becomes porous and chalky, and yield leaves through the filters. The usable region between them is what you are actually developing, and the honest way to establish its edges is to run batches that fail at both — an operating window drawn only from successful batches is a description of luck.',
      zh: '把噴速對物料溫度作圖，失敗會落在相對的兩側。水太多、熱太少，就是過濕：形成液橋、微丸結塊、床體失流化。水太少、熱太多，就是噴霧乾燥：液滴在飛行中固化，膜變得多孔粉狀，收率從濾袋離開。兩者之間可用的區域，才是你真正在開發的東西；而誠實地界定其邊界的方法，是刻意跑出在兩端都失敗的批次——只由成功批次畫出的操作窗口，描述的是運氣。'
    }
  },
  {
    title: { en: 'Scale-up: transfer the physics, not the settings', zh: '放大：移轉物理，不是移轉設定值' },
    body: {
      en: 'A GPCG-1 and a GPCG-60 have different plate areas, different partition diameters, different numbers of nozzles and different wall-to-volume ratios. Copying setpoints across them transfers nothing. What should be held constant are the intensive quantities: air volume per kilogram of bed, spray rate per nozzle, droplet size at the nozzle, product temperature, and the number of passes each particle makes. Those five are the process. The setpoints are just how you obtained them on one particular machine.',
      zh: 'GPCG-1 與 GPCG-60 的分佈板面積不同、內筒直徑不同、噴嘴數量不同、壁面與體積比也不同。在兩者之間照抄設定值，什麼都沒有移轉。應該保持不變的是「強度量」：每公斤床體的風量、每支噴嘴的噴速、噴嘴處的液滴尺寸、物料溫度，以及每顆粒子的通過次數。這五項才是製程。設定值只不過是你在某一台特定機器上取得它們的方式。'
    }
  }
];

/* ---------- Training scenarios ------------------------------------------ */

const FB_SCENARIOS = [
  {
    id: 's1',
    title: { en: 'The bed is getting wet', zh: '床體正在變濕' },
    brief: {
      en: 'Thirty minutes into a layering run the product temperature has drifted from 40 °C down to 34 °C and bed pressure drop is climbing. Nothing on the panel has been changed. Bring the bed back under control without exceeding the 45 °C product-temperature limit.',
      zh: '層積作業進行三十分鐘後，物料溫度從 40 °C 緩降至 34 °C，床體壓差正在上升。面板上沒有任何設定被更動過。請在不超過 45 °C 物料溫度上限的前提下，把床體帶回控制狀態。'
    },
    setup: { airVol: 300, inletT: 52, dewPtIn: 16, spray: 42, atom: 2.0, gap: 16, loadKg: 3.5, solidsPct: 8 },
    goal: { en: 'Product temperature 38–42 °C, over-wetting index below 0.35, circulation still healthy', zh: '物料溫度 38–42 °C，過濕指數低於 0.35，且循環維持健康' },
    check: r => r.Tprod >= 38 && r.Tprod <= 42 && r.overWet < 0.35 && r.regimeClass !== 'bad',
    debrief: {
      en: 'The correct first move is to cut spray rate. That reduces the water entering the bed, which is the actual cause. Raising inlet temperature also recovers the product temperature — faster, in fact — but it does so by pushing harder against an unchanged water load, and on a peptide you have bought that recovery with thermal stress. Note also the inlet dew point of 16 °C: on a drier day the same settings would never have drifted. If you found yourself needing a large temperature increase, check the humidity before blaming the operator.',
      zh: '正確的第一步是降低噴速，因為那才是減少「原因」——進入床體的水。提高進風溫度同樣能讓物料溫度回升，而且更快，但那是在水分負荷不變的情況下更用力地推，對胜肽而言，這份回復是用熱應力買來的。另請注意 16 °C 的進風露點：在較乾燥的日子，相同的設定根本不會漂移。若你發現自己需要大幅提高溫度，先查濕度，再責怪操作者。'
    }
  },
  {
    id: 's2',
    title: { en: 'Assay is right, uniformity is not', zh: '含量是對的，均勻度不是' },
    brief: {
      en: 'The batch assayed on target but content uniformity came back with an acceptance value above 17. The total solids applied were correct. Find a set of conditions that would have produced an AV comfortably below 15 for the same total mass applied, without pushing the product temperature out of range.',
      zh: '該批含量達標，但含量均勻度回報的接受值超過 17。施用的總固體量是正確的。請找出一組條件，在施用相同總質量、且不使物料溫度超出範圍的前提下，能得到明顯低於 15 的 AV。'
    },
    setup: { airVol: 170, inletT: 58, dewPtIn: 10, spray: 28, atom: 2.0, gap: 8, loadKg: 5.5, solidsPct: 8 },
    goal: { en: 'Estimated AV below 12, circulation healthy, product temperature still 36–44 °C', zh: '估計 AV 低於 12，循環健康，物料溫度仍維持 36–44 °C' },
    check: r => r.avEst !== null && r.avEst < 12 && r.regimeClass !== 'bad' && r.Tprod >= 36 && r.Tprod <= 44,
    debrief: {
      en: 'Mean and variance are controlled by different variables. Total solids applied set the assay, and it was fine. The number of passes each bead made through the spray zone sets the uniformity, and that is governed by circulation rate — which here was throttled by an 8 mm gap and starved by 170 m³/h on a 5.5 kg bed, giving a cycle time of nearly half a minute. Open the gap, raise air volume, drop the spray rate and run longer. Same mass, more passes, better distribution. Raising spray rate to finish sooner does the exact opposite and is the most common thing people try.',
      zh: '平均值與變異數由不同變數控制。施用的總固體量決定含量，而它沒有問題。每顆微丸通過噴霧區的次數決定均勻度，而這由循環速率主導——此處被 8 mm 的間隙節流，又在 5.5 kg 床體上只給了 170 m³/h 的風量，使循環時間接近半分鐘。應加大間隙、提高風量、降低噴速並延長作業時間。相同質量、更多通過次數、更好的分佈。為了早點結束而提高噴速，效果完全相反——而那正是多數人會嘗試的做法。'
    }
  },
  {
    id: 's3',
    title: { en: 'Yield is missing and the beads look chalky', zh: '收率短少，且微丸外觀呈粉狀' },
    brief: {
      en: 'Coating efficiency has come out at about 70%. The filter bags are heavy, and under the microscope the bead surface is matte rather than glossy. Recover the efficiency above 90%.',
      zh: '包衣效率約為 70%。濾袋偏重，且顯微鏡下微丸表面呈霧面而非光澤。請把效率回復到 90% 以上。'
    },
    setup: { airVol: 420, inletT: 68, dewPtIn: 8, spray: 22, atom: 2.9, gap: 18, loadKg: 3.0, solidsPct: 6 },
    goal: { en: 'Coating efficiency above 0.90, spray-drying index below 0.25, product temperature 36–44 °C', zh: '包衣效率高於 0.90，噴霧乾燥指數低於 0.25，物料溫度 36–44 °C' },
    check: r => r.coatEff > 0.90 && r.sprayDry < 0.25 && r.Tprod >= 36 && r.Tprod <= 44 && r.regimeClass !== 'bad',
    debrief: {
      en: 'Three settings were each individually defensible and collectively fatal: 2.9 bar makes very fine droplets, 68 °C inlet gives them a hostile flight, and 6% solids means each droplet is mostly water with very little to leave behind. The film never formed; it dried in mid-air and went to the filters as powder. Reduce atomisation pressure, lower the inlet temperature, and raise solids content. The instinct to raise spray rate to compensate for low efficiency makes it worse — you cannot catch up by spraying more of something you are not capturing.',
      zh: '三個設定單獨看都說得過去，合起來卻是致命的：2.9 bar 產生極細的液滴，68 °C 的進風讓它們的飛行環境極為嚴苛，而 6% 的固含量意味著每一滴幾乎都是水、能留下的固體極少。膜從未形成；它在半空中乾掉，以粉末形式進入濾袋。應降低霧化壓力、降低進風溫度、提高固含量。想靠提高噴速來彌補低效率只會更糟——你無法藉由噴出更多「捕捉不到的東西」來追回損失。'
    }
  },
  {
    id: 's4',
    title: { en: 'Circulation has stalled', zh: '循環已經停滯' },
    brief: {
      en: 'Through the sight glass the fountain is weak and the down-bed appears almost static. Spraying has not started yet. Establish proper Wurster circulation before any liquid goes on.',
      zh: '從視窗看，噴泉微弱，下降區幾乎呈靜止狀。噴霧尚未開始。請在任何液體噴出之前先建立正常的 Wurster 循環。'
    },
    setup: { airVol: 110, inletT: 50, dewPtIn: 10, spray: 0, atom: 2.0, gap: 8, loadKg: 5.0, solidsPct: 8 },
    goal: { en: 'Transport established, cycle time under 12 s, and the annulus still a moving bed rather than fluidised', zh: '建立輸送、循環時間短於 12 秒，且環隙區仍為移動床而非流化床' },
    check: r => r.transportOK && r.cycleS < 12 && r.regimeClass === 'ok',
    debrief: {
      en: 'A 5 kg bed on 120 m³/h through a 8 mm gap is a packed annulus and a lazy fountain. The up-bed velocity has to exceed the terminal velocity of the beads by a comfortable margin or nothing is transported at all, and the gap has to be open enough to feed the loop. This is a five-minute check before spraying, and skipping it is how a batch is lost in the first ten minutes while everybody watches a temperature that looks perfectly normal.',
      zh: '5 公斤的床體、120 m³/h 的風量、8 mm 的間隙，得到的是一個填實的環隙區與一道無力的噴泉。上升區氣速必須明顯高於微丸的終端速度，否則根本無法輸送；而間隙也必須開得夠大才能餵養這個迴路。這是噴霧前五分鐘的檢查，略過它，就是一批產品在最初十分鐘裡輸掉，而所有人都在盯著一個看起來完全正常的溫度。'
    }
  }
];

/* ---------- Validation lifecycle content -------------------------------- */

const VALIDATION = [
  { stage: 'URS', name: { en: 'User Requirement Specification', zh: '使用者需求規格' },
    body: { en: 'What the equipment must do, written by the people who will use it, before any vendor is contacted. Every downstream qualification test traces back to a line in this document — which means a vague URS produces an unqualifiable machine, and the vagueness is discovered at OQ.', zh: '設備必須做到什麼，由將來要使用它的人撰寫，且在接觸任何供應商之前完成。所有下游的驗證測試都可追溯到本文件中的某一行——這代表模糊的 URS 會產生一台無法驗證的機器，而模糊之處會在 OQ 時才被發現。' } },
  { stage: 'DQ', name: { en: 'Design Qualification', zh: '設計確認' },
    body: { en: 'Documented evidence that the proposed design meets the URS. This is where you catch the dead leg, the un-cleanable joint and the missing dew-point control — on paper, where changing them is free.', zh: '證明提出的設計符合 URS 的文件化證據。這是你在紙上抓到 dead leg、無法清潔的接點與缺漏的露點控制的階段——在這個階段修改是免費的。' } },
  { stage: 'FAT / SAT', name: { en: 'Factory / Site Acceptance Test', zh: '工廠／現場驗收測試' },
    body: { en: 'Testing at the vendor and again after installation. FAT findings are the vendor\'s problem; the same findings after shipment are yours. The economics of thoroughness are entirely decided by which side of the shipping crate you are on.', zh: '在供應商處測試，安裝後再測一次。FAT 階段發現的問題是供應商的問題；同樣的問題在出貨後發現就是你的問題。「做得多仔細」的經濟效益，完全取決於你站在貨櫃箱的哪一側。' } },
  { stage: 'IQ', name: { en: 'Installation Qualification', zh: '安裝確認' },
    body: { en: 'It is what the drawings say it is: correct model, correct materials of construction, correct utilities, correct instruments with calibration certificates, correct software version.', zh: '確認實體與圖面一致：型號正確、材質正確、公用系統正確、儀器正確且附校正證書、軟體版本正確。' } },
  { stage: 'OQ', name: { en: 'Operational Qualification', zh: '運轉確認' },
    body: { en: 'It does what it is supposed to do across the full intended operating range, empty of product. Alarms fire at the right thresholds, interlocks hold, air volume is delivered as displayed, temperature probes agree with a reference. Test the edges here, not the middle — the middle is where the process will live, and the edges are where the qualification has to hold.', zh: '在完整的預定操作範圍內、無產品的狀態下，確認設備執行其應有功能。警報在正確門檻觸發、連鎖有效、實際風量與顯示值一致、溫度探棒與標準器一致。此階段要測邊界而非中間——中間是製程將來運作的地方，邊界則是驗證必須成立的地方。' } },
  { stage: 'PQ', name: { en: 'Performance Qualification', zh: '性能確認' },
    body: { en: 'It does what it is supposed to do with real product, at the intended load, under production conditions and by production staff. If the qualification batches are run by the development team, you have qualified the development team.', zh: '在實際產品、預定裝載量、生產條件下，由生產人員操作，確認設備達到應有性能。若驗證批是由開發團隊執行的，你驗證的是開發團隊。' } },
  { stage: 'PPQ', name: { en: 'Process Performance Qualification', zh: '製程性能確認' },
    body: { en: 'FDA process validation lifecycle stage 2. Not three batches for the sake of three batches — a statistically defensible demonstration that the commercial process, at commercial scale, with commercial materials and procedures, reproducibly delivers the CQAs. The number of batches should follow from the variability you observed in development.', zh: 'FDA 製程驗證生命週期第二階段。不是為了湊三批而做三批——而是以統計上站得住腳的方式證明：商業製程在商業規模、使用商業物料與程序時，能可重現地達到 CQA。批數應由開發階段觀察到的變異性決定。' } },
  { stage: 'CPV', name: { en: 'Continued Process Verification', zh: '持續製程確認' },
    body: { en: 'Stage 3, and the one that is quietly abandoned most often. Control charts on the CQAs, trended across every commercial batch, reviewed on a defined cadence. A process that was validated in 2027 and never looked at again is not a validated process — it is a validated memory.', zh: '第三階段，也是最常被悄悄放棄的一個。對各項 CQA 建立管制圖，跨每一個商業批次追蹤趨勢，並依既定頻率審查。一個在 2027 年完成驗證、之後再也沒有人看過的製程，不是已驗證的製程——是已驗證的回憶。' } }
];

const TRANSFER_GAPS = [
  { item: { en: 'Equipment', zh: '設備' }, ask: { en: 'Same principle, same geometry, same instrumentation? A GPCG-5 and a competitor fluid bed of identical nominal capacity are not interchangeable — plate design, partition geometry and nozzle position all differ.', zh: '原理相同、幾何相同、儀控相同嗎？GPCG-5 與另一家標稱容量相同的流體床並不能互換——分佈板設計、內筒幾何與噴嘴位置都不同。' } },
  { item: { en: 'Batch size', zh: '批量' }, ask: { en: 'Is the receiving site\'s batch within the qualified range of its equipment, and is the ratio to the sending site within a defensible scale-up factor? A tenfold jump is not a transfer, it is a development project.', zh: '接收廠的批量是否落在其設備已驗證的範圍內？與輸出廠的比例是否在可辯護的放大倍數之內？十倍的跳躍不是移轉，是一個開發專案。' } },
  { item: { en: 'Parameters', zh: '參數' }, ask: { en: 'Which parameters transfer as absolute values and which as intensive ratios? Product temperature transfers. Air volume in m³/h does not — air volume per kilogram does.', zh: '哪些參數以絕對值移轉，哪些以強度比值移轉？物料溫度可以直接移轉。以 m³/h 表示的風量不行——每公斤的風量才行。' } },
  { item: { en: 'Materials', zh: '物料' }, ask: { en: 'Same grade, same supplier, same particle size distribution? An excipient change that is invisible on the certificate of analysis can be plainly visible in the granulation.', zh: '等級相同、供應商相同、粒徑分佈相同嗎？一個在檢驗報告上看不出來的賦形劑變更，在造粒過程中可能一目瞭然。' } },
  { item: { en: 'Analytical methods', zh: '分析方法' }, ask: { en: 'Method transfer completed and comparability demonstrated before the first trial batch is tested? Testing a transfer batch with an untransferred method produces a result nobody can act on.', zh: '在第一批試製批送驗之前，方法移轉是否已完成並證明可比性？用未完成移轉的方法檢驗移轉批，得到的結果沒有人能據以行動。' } },
  { item: { en: 'Utilities', zh: '公用系統' }, ask: { en: 'Dehumidification capacity, compressed-air quality, water system. A site that cannot hold the inlet dew point cannot run the process, however good its operators are.', zh: '除濕能力、壓縮空氣品質、水系統。一個無法維持進風露點的廠區，無論操作人員多優秀，都無法執行這個製程。' } },
  { item: { en: 'People', zh: '人員' }, ask: { en: 'Who has run this before, and who is watching the first batch? Tacit process knowledge is the part of a transfer that no document captures and every failed transfer turns out to have been missing.', zh: '誰做過這個製程？第一批由誰在旁監看？隱性製程知識是移轉中沒有任何文件能捕捉的部分，而每一次失敗的移轉事後都證明缺的正是它。' } }
];
