/* ============================================================================
   protocol.js — pilot batch protocol coach
   ----------------------------------------------------------------------------
   Linaclotide 145 mcg capsules. Wurster drug layering on a Glatt GPCG-class
   fluid bed, followed by sieving and encapsulation.

   This is written the way a technical services engineer would brief someone
   running the batch for the first time: what the step is for, what to set,
   what to watch, what it means when the number moves, and what you are not
   allowed to do without QA. Quantities recalculate from batch size.

   NOT a validated master batch record. A real MBR is a controlled GMP
   document with revision control, signatures, and an approved change history.
   ========================================================================== */

const PROTOCOL = {

  basis: {
    strength: 145,                 // mcg per capsule
    fillWeightMg: 65.0,            // mg beads per capsule
    coatingLoadPct: 8.0,           // % w/w solids applied onto core
    solutionSolidsPct: 8.0,        // % w/w solids in coating solution
    coatComposition: {             // % of applied solids
      linaclotide: 2.80,
      hypromellose: 47.2,
      calciumChlorideDihydrate: 22.0,
      lLeucine: 28.0
    },
    overagePct: 12                 // process overage for sampling, holdup, losses
  },

  steps: [

    /* ---------------------------------------------------------------- 1 */
    {
      id: 'dispensing',
      n: 1,
      title: { en: 'Dispensing and potency-adjusted charge', zh: '秤料與效價校正投料' },
      purpose: {
        en: 'Convert a certificate of analysis into a charge weight. For a peptide this is not arithmetic on the label claim — the CoA reports peptide content, water, counter-ion and residual solvents separately, and the sum of those is not 100%.',
        zh: '把檢驗報告轉換成投料重量。對胜肽而言這不是把標示量拿來算術——檢驗報告會分別列出胜肽含量、水分、對離子與殘留溶劑，而這些加總並不等於 100%。'
      },
      equipment: { en: 'Calibrated balance in a dispensing booth under negative pressure; dedicated scoops; double verification', zh: '負壓秤量室中的校正天平；專用勺具；雙人覆核' },
      params: [
        { p: { en: 'API charge', zh: '原料藥投料量' }, v: 'computed', unit: 'g',
          rationale: { en: 'Charge = theoretical mass ÷ (peptide content as fraction). A CoA reading 87.4% peptide content requires a 14.4% larger charge than the label claim implies. Getting this wrong is a silent, uniform potency error that no in-process control will catch until assay.', zh: '投料量 = 理論質量 ÷（胜肽含量比例）。檢驗報告顯示 87.4% 胜肽含量時，投料量須比依標示量計算高出 14.4%。算錯的結果是一個沉默且全批一致的效價偏差，任何製程中管制都無法在含量分析之前發現。' } },
        { p: { en: 'Dispensing room RH', zh: '秤量室相對濕度' }, v: '≤ 45', unit: '%RH',
          rationale: { en: 'Calcium chloride dihydrate is hygroscopic and will pick up water on an open balance. Weigh it last and close the container immediately.', zh: '氯化鈣二水合物具吸濕性，在開放天平上會吸水。最後秤取並立即密封容器。' } },
        { p: { en: 'Verification', zh: '覆核' }, v: 'two-person', unit: '',
          rationale: { en: 'Second-person verification of identity, lot, expiry, and weight before transfer. Recorded contemporaneously — signing later is a data integrity finding, not a paperwork issue.', zh: '轉移前由第二人覆核品名、批號、效期與重量，並即時記錄。事後補簽屬資料完整性缺失，不是文書問題。' } }
      ],
      watch: {
        en: ['API appearance and any evidence of clumping — a peptide that has taken up water may have already begun to hydrolyse', 'Balance daily-check record present and current', 'Container closure integrity on the API bottle before and after'],
        zh: ['原料藥外觀與是否結塊——已吸水的胜肽可能已開始水解', '天平當日校驗紀錄存在且在有效期內', '原料藥瓶在取用前後的封蓋完整性']
      },
      branch: [
        { if: { en: 'API CoA water content is above the internal limit', zh: '原料藥檢驗報告水分高於內部限值' },
          then: { en: 'Do not proceed on a re-test alone. Quarantine and raise a deviation — water in the API is both a potency correction and a stability signal, and only one of those is fixed by recalculating.', zh: '不可僅憑複測就放行。隔離並開立偏差——原料藥中的水分同時是效價校正因子與安定性訊號，而重新計算只解決了其中一項。' } }
      ],
      gmp: { en: 'Batch record entries made at the time of the action. No pre-printed weights. No transcription from a scrap of paper.', zh: '批次紀錄於操作當下填寫。不得預先印上重量，不得由便條紙謄抄。' }
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: 'solution',
      n: 2,
      title: { en: 'Coating solution preparation', zh: '包衣液配製' },
      purpose: {
        en: 'Produce a clear, homogeneous, low-shear solution in which the peptide is stable for the duration of the spray. The solution is a hold-time-controlled intermediate, and the spray run is four hours long.',
        zh: '配製澄清、均質、低剪切的溶液，使胜肽在整個噴霧期間保持安定。此溶液是受持液時間管制的中間品，而噴霧作業長達四小時。'
      },
      equipment: { en: 'Jacketed stainless vessel with low-shear anchor or propeller stirrer; in-line 100 µm filter to the nozzle; calibrated pH meter', zh: '附夾套的不鏽鋼配製槽，配低剪切錨式或槳式攪拌；至噴嘴的線上 100 µm 濾器；校正過的 pH 計' },
      params: [
        { p: { en: 'Addition order', zh: '加料順序' }, v: 'water → HPMC → CaCl₂ → leucine → API', unit: '',
          rationale: { en: 'Hydrate the polymer first so it does not lump, dissolve the salts into a stable ionic environment, and add the peptide last into a finished, cooled solution so its total exposure time is the shortest of any component.', zh: '先讓高分子完全水合以免結塊，再溶入鹽類建立穩定的離子環境，最後才把胜肽加入已配好並降溫的溶液中，使其總暴露時間在所有成分中最短。' } },
        { p: { en: 'Solution temperature', zh: '溶液溫度' }, v: '15–25', unit: '°C',
          rationale: { en: 'HPMC hydrates best in cool water, and the peptide degrades faster in warm water. Both arguments point the same way.', zh: 'HPMC 在冷水中水合最好，而胜肽在溫水中降解更快。兩個理由指向同一個方向。' } },
        { p: { en: 'Stirrer speed', zh: '攪拌轉速' }, v: 'low, no vortex', unit: '',
          rationale: { en: 'A vortex entrains air. Air–water interface is where peptides unfold and aggregate, and the resulting multimers show up in your SEC trace, not in your visual check.', zh: '漩渦會捲入空氣。氣液界面正是胜肽解摺與聚集的地方，由此產生的多聚體會出現在 SEC 圖譜上，而不是在目視檢查中。' } },
        { p: { en: 'Solids content', zh: '固含量' }, v: '8.0', unit: '% w/w',
          rationale: { en: 'Sets the water load per unit of solids delivered. Raising solids reduces the water the bed must evaporate and shortens the run, but raises viscosity and coarsens the droplet — a direct trade against coating uniformity.', zh: '決定每單位固體所帶入的水量。提高固含量可降低床體需蒸發的水分並縮短作業時間，但會提高黏度並使液滴變粗——與包衣均勻度直接互換。' } },
        { p: { en: 'Hold time', zh: '持液時間' }, v: '≤ 8', unit: 'h',
          rationale: { en: 'Must be established by data, not assumed. Run a stability study on the solution at the intended temperature and set the limit from the purity trace. The limit belongs in the batch record as a hard stop.', zh: '必須以數據建立，不可假設。在預定溫度下對溶液做安定性試驗，並依純度圖譜訂定限值。此限值應以硬性停點的形式寫入批次紀錄。' } },
        { p: { en: 'Filtration', zh: '過濾' }, v: '100 µm in-line', unit: '',
          rationale: { en: 'Protects a 1.0–1.2 mm nozzle orifice from undissolved polymer. Verify filter compatibility and peptide adsorption before you rely on it — filters remove more than particulate.', zh: '保護 1.0–1.2 mm 的噴嘴孔徑不被未溶解的高分子堵塞。在依賴它之前先驗證濾材相容性與胜肽吸附——濾器移除的不只是微粒。' } }
      ],
      watch: {
        en: ['Solution clarity against a dark background — haze means undissolved polymer or the beginning of aggregation', 'Foam on the surface: if present, the stirrer is too fast or the vessel too shallow', 'Weight of solution consumed versus time, logged every 30 minutes — this is your real spray-rate record'],
        zh: ['以深色背景檢視溶液澄清度——霧狀代表高分子未溶解或聚集已開始', '液面泡沫：若出現，代表攪拌過快或槽體過淺', '每 30 分鐘記錄一次噴液消耗重量對時間——這才是真正的噴速紀錄']
      },
      branch: [
        { if: { en: 'Solution is hazy after full hydration time', zh: '足夠水合時間後溶液仍呈霧狀' },
          then: { en: 'Do not filter the haze away and continue. Sample for purity and particle count first; a hazy peptide solution is a candidate aggregation event and filtering it removes the evidence along with the particles.', zh: '不要靠過濾把霧狀去掉然後繼續。先取樣做純度與微粒計數；霧狀的胜肽溶液可能是聚集事件，過濾會把證據連同微粒一起移除。' } },
        { if: { en: 'Spray run will exceed the validated hold time', zh: '噴霧作業將超過已驗證的持液時間' },
          then: { en: 'Prepare in two sub-lots rather than extending the hold. Record both sub-lots in the batch record and sample both — do not average them.', zh: '分成兩個次批配製，而非延長持液時間。兩個次批都要記錄在批次紀錄中並各自取樣——不要平均。' } }
      ],
      gmp: { en: 'Solution preparation record includes each addition, its time, the operator, and the verifier. Hold-time start is the moment the API enters the vessel, not the moment the vessel is finished.', zh: '配製紀錄須包含每次加料的內容、時間、操作者與覆核者。持液時間的起算點是原料藥進入槽體的那一刻，而非配製完成的那一刻。' }
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: 'setup',
      n: 3,
      title: { en: 'Fluid bed set-up and pre-warming', zh: '流體床架設與預熱' },
      purpose: {
        en: 'Establish stable circulation before a single drop of solution is sprayed. Every uniformity problem that appears at the end of a Wurster run was decided in the first ten minutes.',
        zh: '在噴出第一滴液體之前先建立穩定循環。所有在 Wurster 作業末期出現的均勻度問題，都是在最初十分鐘裡決定的。'
      },
      equipment: { en: 'GPCG-class fluid bed with Wurster insert; bottom-spray nozzle 1.0–1.2 mm; distributor plate with high open area beneath the partition', zh: 'GPCG 級流體床配 Wurster 內筒；底噴噴嘴 1.0–1.2 mm；內筒下方為高開孔率的氣體分佈板' },
      params: [
        { p: { en: 'Wurster gap (partition height)', zh: 'Wurster 間隙（內筒高度）' }, v: '15–20', unit: 'mm',
          rationale: { en: 'The gap sets how fast beads are drawn into the up-bed. Too small and the down-bed starves and circulation stalls; too large and beads enter in a thick, poorly separated curtain and coat unevenly. This is the single most under-adjusted setting on the machine.', zh: '間隙決定微丸被吸入上升區的速率。過小則下降區供料不足、循環停滯；過大則微丸以厚而分離不良的簾幕進入，包衣不均。這是機台上最少被調整的一個設定。' } },
        { p: { en: 'Nozzle height above plate', zh: '噴嘴距分佈板高度' }, v: 'per equipment SOP', unit: 'mm',
          rationale: { en: 'Determines the distance a droplet travels before it meets a bead. Too high and droplets dry in flight; too low and the plate itself gets wet.', zh: '決定液滴在遇到微丸之前的飛行距離。過高則液滴在飛行中乾掉；過低則分佈板本身被打濕。' } },
        { p: { en: 'Pre-warm target product temperature', zh: '預熱目標物料溫度' }, v: '38–42', unit: '°C',
          rationale: { en: 'Bring the bed to the intended operating temperature before spraying so the first ten minutes are not run at an uncontrolled thermodynamic condition. The first beads coated are still in the batch.', zh: '在噴霧前先把床體帶到預定操作溫度，避免最初十分鐘在失控的熱力學條件下進行。最先被包衣的那些微丸仍然在這一批裡。' } },
        { p: { en: 'Inlet air dew point', zh: '進風露點' }, v: '8–12', unit: '°C',
          rationale: { en: 'Dehumidified inlet air is what makes a fluid-bed process reproducible between January and July. Without dew-point control, the same setpoints give a different product temperature in a Taiwanese summer than in a Taiwanese winter, and the batch record will not show why.', zh: '除濕後的進風，是讓流體床製程在一月與七月之間仍可重現的關鍵。沒有露點控制，相同的設定值在台灣的夏天與冬天會得到不同的物料溫度，而批次紀錄不會顯示原因。' } },
        { p: { en: 'Filter shake interval', zh: '濾袋抖動間隔' }, v: '60–120', unit: 's',
          rationale: { en: 'Returns elutriated fines to the bed and keeps pressure drop stable. Too infrequent and the filters blind, air volume falls, and the bed quietly stops circulating while the setpoint still reads correct.', zh: '將被帶出的細粉送回床體並維持壓差穩定。間隔太長會使濾袋阻塞、風量下降，床體悄悄停止循環，而設定值看起來仍然正常。' } }
      ],
      watch: {
        en: ['Bed pressure drop reading before any spray — record it; it is your baseline for the whole run', 'Fluidisation by eye through the sight glass: a healthy Wurster shows a fast, distinct fountain and a slow, dense down-bed', 'Nozzle atomising air flowing before liquid is started — always air first, always'],
        zh: ['噴霧前先記錄床體壓差——它是整個作業的基準值', '透過視窗目視流化狀態：健康的 Wurster 會呈現快速而清晰的噴泉，以及緩慢而緻密的下降區', '確認霧化空氣已在液體之前送出——永遠先開氣，沒有例外']
      },
      branch: [
        { if: { en: 'Down-bed looks static through the sight glass', zh: '從視窗看下降區呈靜止狀' },
          then: { en: 'Stop before spraying. Increase the gap in 2 mm steps or raise air volume until the down-bed visibly descends. Spraying into a static down-bed produces a bimodal potency distribution that no amount of blending afterwards will fix, because the beads are not blendable — they are individually wrong.', zh: '在噴霧前停止。以 2 mm 為級距加大間隙，或提高風量，直到下降區明顯下沉。對靜止的下降區噴霧會產生雙峰效價分佈，事後無論怎麼混合都無法修正，因為微丸不是混合的問題——是每一顆本身就錯了。' } },
        { if: { en: 'Ambient dew point exceeds the inlet dew point setpoint', zh: '環境露點高於進風露點設定值' },
          then: { en: 'Confirm the dehumidifier is in control before starting. Running a four-hour spray on uncontrolled humid air is how a batch that met all its setpoints ends up out of specification on water content.', zh: '開始前先確認除濕機處於控制狀態。在未受控的潮濕空氣下進行四小時噴霧，正是「所有設定值都達標的批次」最後含水量超規的原因。' } }
      ],
      gmp: { en: 'Equipment logbook entry: previous product, cleaning status and expiry of cleaned-hold, change parts fitted, and calibration status of the product temperature probe.', zh: '設備使用紀錄須登載：前一產品、清潔狀態與清潔後有效期限、所裝設的更換件，以及物料溫度探棒的校正狀態。' }
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: 'layering',
      n: 4,
      title: { en: 'Wurster drug layering', zh: 'Wurster 藥物層積' },
      purpose: {
        en: 'Deposit approximately 8% w/w of solids as an even film on every bead. The measure of success is not how much you applied but how evenly it distributed, and those two numbers are controlled by different variables.',
        zh: '把約 8% w/w 的固體均勻沉積成膜於每一顆微丸上。成功的指標不是你施用了多少，而是它分佈得多均勻，而這兩個數字由不同的變數控制。'
      },
      equipment: { en: 'Peristaltic or gear pump with mass flow feedback; bottom-spray binary nozzle', zh: '具質量流量回饋的蠕動泵或齒輪泵；底噴二流體噴嘴' },
      params: [
        { p: { en: 'Spray rate', zh: '噴液速率' }, v: 'ramped', unit: 'g/min',
          rationale: { en: 'Start at roughly 60% of target for the first 15 minutes, then ramp. Uncoated cores are more prone to sticking than partly coated ones, so the riskiest moment in the whole run is the very beginning, when the operator is least worried.', zh: '前 15 分鐘以目標值的約 60% 起噴，之後再爬升。未包衣的核心比部分包衣者更容易黏結，因此整個作業中風險最高的時刻就是最開始——而那正是操作者最不擔心的時候。' } },
        { p: { en: 'Inlet air temperature', zh: '進風溫度' }, v: '50–60', unit: '°C',
          rationale: { en: 'Inlet temperature is a means, not an end. What you are actually controlling is product temperature, and the same inlet temperature gives a different product temperature at a different spray rate. Control to the product probe.', zh: '進風溫度是手段而非目的。你真正控制的是物料溫度，而相同的進風溫度在不同噴速下會得到不同的物料溫度。應以物料探棒為控制依據。' } },
        { p: { en: 'Product temperature', zh: '物料溫度' }, v: '38–42', unit: '°C',
          rationale: { en: 'The real CPP. Below the lower bound the bed accumulates water and agglomerates; above the upper bound droplets dry before contact and the peptide sees unnecessary thermal stress. For a peptide the upper bound is a stability limit, not just a process preference.', zh: '真正的 CPP。低於下限，床體累積水分而結塊；高於上限，液滴在接觸前就乾掉，胜肽也承受不必要的熱應力。對胜肽而言，上限是安定性限值，不只是製程偏好。' } },
        { p: { en: 'Atomisation pressure', zh: '霧化壓力' }, v: '1.8–2.4', unit: 'bar',
          rationale: { en: 'Sets droplet size. Finer droplets spread better and coat more evenly, but below roughly 20 µm they increasingly dry before they land — you lose yield to spray drying and gain a rough, porous film. Higher pressure also means more attrition on the bead surface.', zh: '決定液滴尺寸。較細的液滴鋪展較好、包衣更均勻，但小於約 20 µm 後會越來越多在落下前就乾掉——收率損失於噴霧乾燥，並得到粗糙多孔的膜。壓力越高，微丸表面的磨耗也越大。' } },
        { p: { en: 'Air volume', zh: '風量' }, v: 'to maintain fountain', unit: 'm³/h',
          rationale: { en: 'Set it by what the bed does, not by a number. You want fast, complete transport up the partition and a dense, steadily descending annulus. Air volume must be increased as bead mass grows during the run — a setting that was correct at the start is too low by the end.', zh: '依床體的行為設定，而非依數字設定。你要的是沿內筒快速而完整的輸送，以及緻密且穩定下沉的環隙。作業中微丸質量會增加，風量必須隨之調高——起始時正確的設定，到結束時已經太低。' } }
      ],
      watch: {
        en: ['Product temperature trend, not the instantaneous value — a slow drift downward means water is accumulating faster than it is leaving', 'Bed pressure drop: a rise means agglomeration or filter blinding; a fall means you are losing mass to the filters', 'Outlet air humidity: this is your evaporation rate made visible', 'Nozzle tip at every filter shake — bearding starts small and ends as a blocked nozzle and a wet patch in the bed'],
        zh: ['觀察物料溫度的「趨勢」而非瞬時值——緩慢下降代表水分累積速度快於排出速度', '床體壓差：上升代表結塊或濾袋阻塞；下降代表質量正流失到濾袋', '排風濕度：這是把蒸發速率視覺化的指標', '每次抖袋時檢查噴嘴頭——結垢從小處開始，終點是噴嘴堵塞與床中一塊濕斑']
      },
      branch: [
        { if: { en: 'Product temperature falls below the lower limit', zh: '物料溫度低於下限' },
          then: { en: 'Reduce spray rate first. Raising inlet temperature is the instinct and the wrong first move: it treats the symptom, adds thermal stress to a peptide, and leaves the water balance still negative. Cut the water going in before you add heat to drive it off.', zh: '先降低噴速。提高進風溫度是直覺反應，卻是錯誤的第一步：它只處理症狀、對胜肽增加熱應力，而水分收支仍然是負的。先減少進入的水，再考慮加熱把水趕走。' } },
        { if: { en: 'Bed pressure drop rises steadily', zh: '床體壓差持續上升' },
          then: { en: 'Distinguish agglomeration from filter blinding before acting — they need opposite responses. Shake the filters and watch: if ΔP recovers, it was the filters; if it does not, you have agglomerates in the bed and should stop spraying and dry.', zh: '行動前先分辨是結塊還是濾袋阻塞——兩者需要相反的處置。抖袋後觀察：若壓差回復，是濾袋問題；若沒有回復，床中已有結塊，應停止噴霧並轉入乾燥。' } },
        { if: { en: 'Stratified sample assay is trending below target at 50% applied', zh: '施用 50% 時分層取樣含量低於目標' },
          then: { en: 'Do not increase the API in the remaining solution. That corrects the mean and worsens the distribution, because the beads that are already low stay low. Investigate coating efficiency — check the nozzle, the filters, and the wall deposits — and accept a potency-adjusted fill weight at encapsulation instead.', zh: '不要在剩餘噴液中加大原料藥量。那會修正平均值卻惡化分佈，因為已經偏低的微丸仍然偏低。應調查包衣效率——檢查噴嘴、濾袋與壁面沉積——並改以充填時的效價校正填充量來處理。' } }
      ],
      gmp: { en: 'Continuous data acquisition on inlet/outlet/product temperature, air volume, ΔP, spray rate and atomisation pressure, with audit trail. Manual readings every 30 minutes as an independent check on the automated record.', zh: '對進風／排風／物料溫度、風量、壓差、噴速與霧化壓進行連續資料擷取並保留稽核軌跡。每 30 分鐘另做人工讀值，作為對自動紀錄的獨立查核。' }
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: 'drying',
      n: 5,
      title: { en: 'Post-spray drying', zh: '噴霧後乾燥' },
      purpose: {
        en: 'Remove residual water to a defined endpoint without over-drying. For this product both directions are hazardous: water hydrolyses the peptide, and heat scrambles its disulfides.',
        zh: '把殘留水分除到明確的終點，且不過度乾燥。對本產品而言兩個方向都有風險：水分會使胜肽水解，而熱會使雙硫鍵重排。'
      },
      equipment: { en: 'Same fluid bed, spray off, reduced inlet temperature', zh: '同一台流體床，停止噴霧，降低進風溫度' },
      params: [
        { p: { en: 'Inlet temperature', zh: '進風溫度' }, v: '45–50', unit: '°C',
          rationale: { en: 'Reduced from the layering setpoint. Once spray stops, evaporative cooling stops with it, and an unchanged inlet temperature will take the bed straight past the product temperature limit within minutes.', zh: '較層積時的設定值降低。噴霧一停，蒸發冷卻也隨之停止，若進風溫度不變，床體會在數分鐘內直接衝過物料溫度上限。' } },
        { p: { en: 'Product temperature ceiling', zh: '物料溫度上限' }, v: '≤ 45', unit: '°C',
          rationale: { en: 'A hard limit driven by peptide stability, not by drying convenience. If the endpoint is not reached at this ceiling, extend the time — do not raise the ceiling.', zh: '這是由胜肽安定性決定的硬限值，不是為了乾燥方便。若在此上限下未達終點，應延長時間——不是提高上限。' } },
        { p: { en: 'Endpoint', zh: '終點' }, v: 'KF within spec', unit: '',
          rationale: { en: 'Endpoint by measurement, not by clock. Time-based drying is a convenience that only works when everything else is identical, which it never is between summer and winter.', zh: '以量測而非時間判定終點。以時間為基準的乾燥只是圖方便，只有在其他條件完全一致時才成立——而夏天與冬天之間從來就不一致。' } }
      ],
      watch: {
        en: ['Outlet dew point falling and flattening — the classic visual endpoint, seen before the KF result comes back', 'Product temperature rising toward inlet temperature: when the gap closes, evaporation has essentially stopped'],
        zh: ['排風露點下降並趨於平緩——經典的目視終點，在 KF 結果回來之前就能看到', '物料溫度朝進風溫度上升：當兩者差距收斂，蒸發實質上已經停止']
      },
      branch: [
        { if: { en: 'KF is above specification after the planned drying time', zh: '計畫乾燥時間後 KF 仍高於規格' },
          then: { en: 'Extend at the same temperature and re-test. Record the extension as a process observation. If extensions become routine, the problem is upstream in the water balance during layering, and the drying step is being asked to fix a spray-rate decision.', zh: '在相同溫度下延長時間並複測，並將延長情形記錄為製程觀察。若延長成為常態，問題出在上游層積階段的水分收支，而乾燥步驟正被要求去修補一個噴速決策。' } }
      ],
      gmp: { en: 'Drying endpoint criterion and the analytical method used are both specified in the batch record before the batch starts.', zh: '乾燥終點判定準則與所用分析方法，須於批次開始前即載明於批次紀錄中。' }
    },

    /* ---------------------------------------------------------------- 6 */
    {
      id: 'sieving',
      n: 6,
      title: { en: 'Discharge, sieving and yield reconciliation', zh: '出料、過篩與收率核對' },
      purpose: {
        en: 'Remove agglomerates and fines, and account for every gram. Yield reconciliation is not accounting — it is the first place a coating efficiency problem becomes visible as a number rather than a suspicion.',
        zh: '移除結塊與細粉，並交代每一公克的去向。收率核對不是會計工作——它是包衣效率問題第一次從「懷疑」變成「數字」的地方。'
      },
      equipment: { en: 'Vibratory sieve, upper and lower mesh; anti-static discharge; double polyethylene liner in a fibre drum with desiccant', zh: '振動篩，上下兩層篩網；防靜電出料；纖維桶內雙層 PE 袋並置乾燥劑' },
      params: [
        { p: { en: 'Upper mesh', zh: '上層篩網' }, v: '≈ 600', unit: 'µm',
          rationale: { en: 'Removes agglomerates. This limit is set by the feeding-tube requirement as much as by uniformity: beads that will not pass an 8 French tube must not reach a capsule.', zh: '移除結塊。此限值同時由餵食管要求與均勻度決定：無法通過 8 French 管的微丸不應進入膠囊。' } },
        { p: { en: 'Lower mesh', zh: '下層篩網' }, v: '≈ 150', unit: 'µm',
          rationale: { en: 'Removes fines and any uncoated core fragments. Fines carry a different potency per gram than intact beads, so leaving them in shifts both assay and uniformity.', zh: '移除細粉與未包衣的核心碎片。細粉每公克的效價與完整微丸不同，留下它們會同時偏移含量與均勻度。' } },
        { p: { en: 'Yield limits', zh: '收率限值' }, v: '95–102', unit: '%',
          rationale: { en: 'Set from development data. An out-of-range yield is a deviation regardless of whether the product passes testing — a batch that meets specification by accident has not demonstrated a controlled process.', zh: '依開發階段的數據訂定。收率超出範圍即為偏差，無論產品檢驗是否合格——一個「碰巧合格」的批次並未證明製程受控。' } }
      ],
      watch: {
        en: ['Agglomerate fraction by weight — trend it batch to batch; a rising trend predicts a future failure before any batch fails', 'Bead appearance under a stereo microscope: smooth and glossy is a well-controlled film; matte and chalky means you were spray drying', 'Room humidity during discharge, because the beads are now hygroscopic and unpackaged'],
        zh: ['結塊比例（重量）——逐批追蹤趨勢；上升趨勢會在任何批次失敗之前就先預告失敗', '在立體顯微鏡下觀察微丸外觀：光滑有光澤代表膜層控制良好；霧面粉狀代表當時在噴霧乾燥', '出料期間的室內濕度，因為此時微丸已具吸濕性且尚未包裝']
      },
      branch: [
        { if: { en: 'Agglomerates exceed the internal action limit', zh: '結塊超過內部行動限值' },
          then: { en: 'Do not simply sieve them out and carry on. The agglomerates contain drug, so removing them changes the potency of what remains, and their existence means part of the bed ran wet. Assay the agglomerate fraction separately — it tells you when in the run the excursion happened.', zh: '不要只是把它們篩掉然後繼續。結塊中含有藥物，移除它們會改變剩餘物的效價，而它們的存在代表床體有一部分曾處於過濕狀態。應單獨測定結塊部分的含量——它會告訴你偏移發生在作業的哪個時段。' } },
        { if: { en: 'Yield is below the lower limit', zh: '收率低於下限' },
          then: { en: 'Reconcile before releasing to the next step: weigh filter-bag contents, wall deposits and the nozzle assembly. Material has gone somewhere, and "somewhere" is usually the filters — which means your fines fraction and your potency loss are the same event seen twice.', zh: '在放行至下一步之前先完成核對：秤量濾袋內容物、壁面沉積與噴嘴組件。物料一定去了某處，而那個「某處」通常是濾袋——這代表細粉比例與效價損失是同一事件的兩種觀察。' } }
      ],
      gmp: { en: 'Reconciliation signed by production and reviewed by QA. Unexplained yield loss above the action limit requires a deviation and an investigation, not a comment.', zh: '核對表由生產簽署並經 QA 審查。超過行動限值且無法解釋的收率損失，須開立偏差並進行調查，而非僅加註說明。' }
    },

    /* ---------------------------------------------------------------- 7 */
    {
      id: 'ipc',
      n: 7,
      title: { en: 'Bead testing before encapsulation', zh: '充填前的微丸檢驗' },
      purpose: {
        en: 'Decide the capsule fill weight from measured potency. This is the step that converts an imperfect coating run into a compliant product, and it only works if you test before you fill.',
        zh: '依實測效價決定膠囊填充量。這一步能把不完美的包衣批轉換成合規產品，但前提是你在充填之前先檢驗。'
      },
      equipment: { en: 'QC laboratory: RP-UPLC, Karl Fischer, sieve stack, dissolution bath', zh: 'QC 實驗室：RP-UPLC、Karl Fischer、篩網組、溶離槽' },
      params: [
        { p: { en: 'Bead assay', zh: '微丸含量' }, v: 'n = 10 stratified', unit: '',
          rationale: { en: 'Sample from top, middle and bottom of the discharged drum. If a stratified sample shows a gradient, you have a segregation problem to solve before encapsulation, not a result to average away.', zh: '自出料桶的上、中、下層取樣。若分層取樣顯示梯度，代表你在充填前有一個必須解決的分層問題，而不是一個可以平均掉的數據。' } },
        { p: { en: 'Fill weight', zh: '填充量' }, v: 'computed', unit: 'mg',
          rationale: { en: 'Fill weight = label claim ÷ measured potency per mg. Adjusting fill weight to measured potency is standard, expected practice — but it must be a pre-approved decision rule in the batch record, not an improvisation on the day.', zh: '填充量 = 標示量 ÷ 每毫克實測效價。依實測效價調整填充量是標準且被預期的做法——但它必須是批次紀錄中預先核准的決策規則，而不是當天的臨場發揮。' } },
        { p: { en: 'Content uniformity', zh: '含量均勻度' }, v: 'AV ≤ 15.0', unit: '',
          rationale: { en: 'USP <905>. At this drug load, uniformity reflects the coating run and cannot be improved downstream. If AV is marginal here, it will not be better in the capsule.', zh: 'USP <905>。在此藥物負載下，均勻度反映的是包衣作業，下游無法改善。若此處 AV 已在邊緣，裝進膠囊後不會變好。' } }
      ],
      watch: {
        en: ['Whether uniformity variance is between sampling positions or within them — between-position variance is segregation, within-position variance is coating', 'Purity trace versus the pre-spray solution sample: any new peak is a process-induced degradant and needs identification, not a footnote'],
        zh: ['均勻度的變異是出現在取樣位置「之間」還是「之內」——位置之間的變異是分層，位置之內的變異是包衣', '與噴霧前溶液樣品的純度圖譜比對：任何新出現的峰都是製程誘發的降解物，需要鑑定，而非加個註腳']
      },
      branch: [
        { if: { en: 'AV is between 15 and 25', zh: 'AV 介於 15 與 25 之間' },
          then: { en: 'Stop. Do not encapsulate and hope the L2 stage rescues it. Investigate whether the cause is analytical (extraction recovery at 0.22% w/w is genuinely hard) or process (circulation rate during layering). Those two answers lead to completely different corrective actions and only one of them requires a new batch.', zh: '停下來。不要先充填、然後指望 L2 階段救回來。先調查原因是分析性的（在 0.22% w/w 下的萃取回收率確實困難）還是製程性的（層積期間的循環速率）。這兩個答案導向完全不同的矯正措施，而其中只有一個需要重做批次。' } }
      ],
      gmp: { en: 'The fill-weight adjustment rule, its permitted range, and who may approve it are all defined in the batch record before manufacture begins.', zh: '填充量調整規則、允許範圍與核准權限，均須於製造開始前定義於批次紀錄中。' }
    },

    /* ---------------------------------------------------------------- 8 */
    {
      id: 'encapsulation',
      n: 8,
      title: { en: 'Encapsulation and packaging', zh: '膠囊充填與包裝' },
      purpose: {
        en: 'Deliver the beads into capsules at the adjusted fill weight, and into a moisture-protective pack before they can take up water.',
        zh: '以校正後的填充量把微丸裝入膠囊，並在其吸水之前送進具防潮功能的包裝。'
      },
      equipment: { en: 'Dosator or tamping-pin capsule filler with pellet-dosing change parts; in-line checkweigher; HDPE bottles with induction seal and desiccant', zh: 'dosator 或壓塞針式膠囊充填機並配微丸給料更換件；線上檢重機；HDPE 瓶配電磁感應封口與乾燥劑' },
      params: [
        { p: { en: 'Room humidity', zh: '室內濕度' }, v: '≤ 40', unit: '%RH',
          rationale: { en: 'A CPP, not a comfort setting. The beads are hygroscopic and exposed from drum to sealed bottle, and everything they absorb in that window is in the product at release and again at 24 months.', zh: '這是 CPP，不是舒適度設定。微丸具吸濕性，從料桶到密封瓶之間全程暴露，而它們在這段窗口吸收的一切，會出現在放行時，也會再次出現在 24 個月時。' } },
        { p: { en: 'Fill weight tolerance', zh: '填充量公差' }, v: '± 5', unit: '%',
          rationale: { en: 'Pellets fill volumetrically, so weight control depends on bulk density staying constant. A change in hopper level changes bulk density, which is why hopper level is itself a controlled parameter.', zh: '微丸以體積計量充填，因此重量控制取決於堆積密度是否恆定。料位改變會改變堆積密度，這正是為什麼料位本身也是受控參數。' } },
        { p: { en: 'Checkweighing', zh: '檢重' }, v: '100% in-line', unit: '',
          rationale: { en: 'Plus manual gross/net checks at defined intervals as an independent verification of the automated system. Verify the checkweigher with test weights at start, middle and end, and record the false-reject rate.', zh: '另加定期人工毛重／淨重查核，作為對自動系統的獨立驗證。以測試砝碼在開始、中間與結束時驗證檢重機，並記錄誤剔除率。' } },
        { p: { en: 'Desiccant', zh: '乾燥劑' }, v: 'per stability data', unit: '',
          rationale: { en: 'The RLD label tells patients not to remove the desiccant and to keep the product in the original container. Your pack must earn the same instruction through your own stability data, not inherit it.', zh: 'RLD 標示要求病人不得取出乾燥劑並保存於原容器中。你的包裝必須用自己的安定性數據去贏得同樣的指示，而不是直接繼承。' } }
      ],
      watch: {
        en: ['Weight trend rather than individual weights — a drift is a machine or hopper-level issue, scatter is a bead flow issue', 'Capsule appearance: dented or incompletely closed capsules point to overfill or to bead bridging in the dosator', 'Seal integrity checks at defined intervals, with the challenge method recorded'],
        zh: ['觀察重量「趨勢」而非個別重量——漂移是機台或料位問題，散佈是微丸流動問題', '膠囊外觀：凹陷或未完全閉合，指向過量填充或微丸在 dosator 中架橋', '定期進行封口完整性檢查，並記錄所用的挑戰方法']
      },
      branch: [
        { if: { en: 'Weight scatter increases as the hopper empties', zh: '料斗變空時重量散佈變大' },
          then: { en: 'Define and enforce a minimum hopper level in the batch record. This is a routine finding and a routine fix, and it is also the reason head-and-tail material is sampled separately.', zh: '在批次紀錄中定義並執行最低料位。這是常見的發現與常見的處置，也正是頭尾料需要分別取樣的原因。' } }
      ],
      gmp: { en: 'Line clearance before and after, with independent verification. Reconciliation of capsule shells, printed labels and bottles. Batch number and expiry legibility verified on the line.', zh: '作業前後執行線清場並由第二人獨立確認。膠囊殼、印製標籤與瓶子須做數量核對。批號與效期的可讀性須於線上確認。' }
    }
  ],

  /* ---------- Troubleshooting engine ------------------------------------ */
  troubles: [
    {
      id: 'agglom',
      obs: { en: 'Agglomerates in the bed; ΔP rising; product temperature drifting down', zh: '床中出現結塊；壓差上升；物料溫度緩慢下降' },
      root: {
        en: 'Water is entering faster than the air can carry it away. The bed surface stays wet long enough for liquid bridges to form and consolidate. Almost always a water-balance problem, occasionally a circulation problem masquerading as one.',
        zh: '水進入的速度快於空氣帶走的速度。床體表面維持濕潤的時間足以形成並固化液橋。幾乎總是水分收支問題，偶爾是循環問題偽裝成的。'
      },
      checks: {
        en: ['Product temperature trend over the last 20 minutes, not the current value', 'Outlet dew point — if it is climbing toward the product temperature, evaporative capacity is exhausted', 'Filter ΔP — blinded filters cut air volume and therefore evaporation, without changing any setpoint', 'Inlet air dew point against setpoint'],
        zh: ['過去 20 分鐘的物料溫度趨勢，而非當前數值', '排風露點——若正朝物料溫度上升，代表蒸發能力已耗盡', '濾袋壓差——阻塞的濾袋會削減風量因而削減蒸發量，而任何設定值都不會改變', '進風露點與設定值的比較']
      },
      actions: {
        en: [
          'First: reduce spray rate by 20–30%. This is the only action that reduces the cause rather than compensating for it.',
          'Second: increase air volume if the bed can take it without excessive elutriation.',
          'Third and only then: raise inlet temperature, in small steps, watching the product-temperature ceiling.',
          'If ΔP does not recover after a filter shake, stop spraying and dry — you have solids in the bed, not vapour in the air.'
        ],
        zh: [
          '第一：把噴速降低 20–30%。這是唯一減少「原因」而非補償「結果」的動作。',
          '第二：若床體能承受而不致過度帶出，提高風量。',
            '第三，且僅在前兩者之後：小幅提高進風溫度，同時盯住物料溫度上限。',
          '若抖袋後壓差未回復，停止噴霧並轉入乾燥——床中已是固體，不是空氣中的水氣。'
        ]
      },
      wrong: { en: 'Raising inlet temperature first. It appears to work within minutes because the product temperature recovers, but the bed is still receiving more water than it can lose, and you have added thermal stress to a peptide to buy that appearance.', zh: '先提高進風溫度。它看起來幾分鐘內就見效，因為物料溫度回升了，但床體接收的水分仍多於它能排出的量，而你為了買下這個表象，對胜肽多加了一份熱應力。' }
    },
    {
      id: 'spraydry',
      obs: { en: 'Coating efficiency low; fines in the filters; beads matte and chalky rather than glossy', zh: '包衣效率偏低；濾袋中有細粉；微丸呈霧面粉狀而非光澤' },
      root: {
        en: 'Droplets are drying before they reach a bead. The solids that should have become film became airborne powder instead, and left with the exhaust.',
        zh: '液滴在到達微丸之前就乾掉了。本應形成膜的固體變成了懸浮粉末，並隨排氣離開。'
      },
      checks: {
        en: ['Atomisation pressure — high pressure makes fine droplets with a short survival distance', 'Product temperature against the upper limit', 'Nozzle-to-bed distance and whether the fountain is reaching the nozzle zone at all', 'Solution solids: very dilute solutions dry to nothing more easily'],
        zh: ['霧化壓力——高壓產生細液滴，其存活距離短', '物料溫度與上限的距離', '噴嘴至床體距離，以及噴泉是否確實到達噴嘴區', '噴液固含量：過稀的溶液更容易乾成無物']
      },
      actions: {
        en: [
          'Reduce atomisation pressure in 0.2 bar steps and re-check bead surface at the next sample.',
          'Lower product temperature toward the bottom of the range.',
          'Raise solution solids content, which reduces the water each droplet must survive.',
          'Verify the bead fountain is dense in the spray zone — a thin fountain means droplets have nothing to hit.'
        ],
        zh: [
          '以 0.2 bar 為級距降低霧化壓力，並在下一次取樣時重新檢視微丸表面。',
          '把物料溫度降到範圍下緣。',
          '提高噴液固含量，減少每滴液體必須熬過的水分。',
          '確認噴霧區的微丸噴泉夠緻密——稀疏的噴泉代表液滴無物可打。'
        ]
      },
      wrong: { en: 'Increasing spray rate to "put more on". You are already failing to capture what you spray, so a higher rate raises loss proportionally and moves you toward over-wetting at the same time.', zh: '提高噴速以「多噴一點上去」。你原本就沒能捕捉住噴出去的量，提高噴速只會等比例增加損失，同時把你推向過濕。' }
    },
    {
      id: 'uniformity',
      obs: { en: 'Assay on target but content-uniformity AV is high', zh: '含量達標，但含量均勻度 AV 偏高' },
      root: {
        en: 'The right total mass was applied and distributed unevenly. Mean and variance are controlled by different variables: mass applied sets the mean, number of passes through the spray zone sets the variance.',
        zh: '施用了正確的總質量，但分佈不均。平均值與變異數由不同變數控制：施用質量決定平均值，通過噴霧區的次數決定變異數。'
      },
      checks: {
        en: ['Whether variance is between stratified sampling positions or within them', 'Wurster gap and whether the down-bed was descending steadily throughout', 'Whether air volume was increased as bead mass grew during the run', 'Analytical method recovery at 0.22% w/w — verify the method is not the source before blaming the process'],
        zh: ['變異是出現在分層取樣位置之間還是之內', 'Wurster 間隙，以及下降區在全程是否穩定下沉', '作業中微丸質量增加時，風量是否隨之提高', '在 0.22% w/w 下的分析方法回收率——在責怪製程之前，先確認方法不是來源']
      },
      actions: {
        en: [
          'Increase circulation rate, not spray rate: open the gap slightly and raise air volume, then extend the run at a lower spray rate to keep the same total applied.',
          'Formally, coating variance scales roughly as 1/√N with N passes. Doubling the run time at half the spray rate applies the same mass in twice as many passes and cuts the coating CV by about 30%.',
          'Confirm the extraction and assay method is capable at this drug load before making any process change.'
        ],
        zh: [
          '提高的是循環速率而非噴速：略為加大間隙並提高風量，然後在較低噴速下延長作業時間，以維持相同的總施用量。',
          '形式上，包衣變異大致隨通過次數 N 以 1/√N 縮放。把作業時間加倍、噴速減半，等於用兩倍的通過次數施用相同質量，可使包衣 CV 降低約 30%。',
          '在做任何製程變更之前，先確認萃取與含量測定方法在此藥物負載下具備足夠能力。'
        ]
      },
      wrong: { en: 'Extending the spray at the same rate. That adds mass without adding passes per unit mass, so the mean rises out of specification while the variance stays where it was.', zh: '以相同噴速延長噴霧。那只增加質量而未增加每單位質量的通過次數，結果是平均值超規，變異數卻原地不動。' }
    },
    {
      id: 'defluid',
      obs: { en: 'Bed collapse; fountain stops; ΔP falls suddenly', zh: '床體崩塌；噴泉停止；壓差突然下降' },
      root: {
        en: 'Superficial air velocity has dropped below minimum fluidisation, or a wet mass has sintered at the distributor plate. The bed is no longer a fluid and no longer behaves like one.',
        zh: '表觀氣速已降到最小流化速度以下，或濕料在分佈板處固結。床體不再是流體，也不再表現得像流體。'
      },
      checks: {
        en: ['Air volume actually delivered versus setpoint — a blinded filter reduces delivered flow while the setpoint reads correct', 'Bed mass now versus at start: mass grows through the run and so does the required velocity', 'Whether the distributor plate is wet or caked'],
        zh: ['實際輸送的風量與設定值的差異——阻塞的濾袋會降低實際流量，而設定值看起來正常', '目前床體質量與起始時的比較：質量在作業中增加，所需氣速也隨之增加', '分佈板是否潮濕或結餅']
      },
      actions: {
        en: [
          'Stop spraying immediately. Everything else is secondary.',
          'Shake filters and restore air volume before attempting to re-fluidise.',
          'Re-fluidise gently and inspect the plate. If material has caked at the plate, the batch requires a deviation and a technical assessment, not a restart.'
        ],
        zh: [
          '立即停止噴霧。其餘都是次要的。',
          '在嘗試重新流化之前，先抖袋並恢復風量。',
          '緩慢重新流化並檢視分佈板。若物料已在板上結餅，該批次需要開立偏差並做技術評估，而不是直接重啟。'
        ]
      },
      wrong: { en: 'Increasing air volume abruptly to blast the bed back into motion. That fractures agglomerates into fines, sends potency to the filters, and destroys the particle size distribution you spent four hours building.', zh: '猛然加大風量把床體「轟」回運動狀態。那會把結塊打碎成細粉、把效價送進濾袋，並毀掉你花四小時建立起來的粒徑分佈。' }
    },
    {
      id: 'purity',
      obs: { en: 'New impurity peak appears after the coating run', zh: '包衣作業後出現新的雜質峰' },
      root: {
        en: 'Process-induced degradation. For this peptide the candidates are hydrolysis, oxidation, and disulfide scrambling — and scrambling produces isomers of identical mass that a single reversed-phase method may not separate.',
        zh: '製程誘發的降解。對這個胜肽而言，候選途徑是水解、氧化與雙硫鍵重排——而重排會產生質量完全相同的異構物，單一逆相方法可能無法分離。'
      },
      checks: {
        en: ['Sample the coating solution at start and end of spray: if the peak is already in the solution, it is a hold-time problem, not a fluid-bed problem', 'Maximum product temperature reached, including during post-spray drying', 'Whether the peak co-elutes on an orthogonal method — if it separates there, suspect an isomer'],
        zh: ['在噴霧開始與結束時各取一次噴液樣品：若該峰已存在於溶液中，那是持液時間問題，不是流體床問題', '所達到的最高物料溫度，包括噴霧後乾燥期間', '該峰在正交方法上是否共流出——若在該處分開，應懷疑是異構物']
      },
      actions: {
        en: [
          'Localise it in time before changing anything. A peak that grows in the vessel and a peak that grows in the bed have nothing in common except the chromatogram.',
          'If it is solution-borne: shorten hold time, lower solution temperature, reduce air entrainment during preparation.',
          'If it is bed-borne: lower the product-temperature ceiling and shorten the drying tail.',
          'Identify the impurity before qualifying a limit for it. An unidentified peak cannot be qualified, and an unqualified peak cannot be specified.'
        ],
        zh: [
          '在改動任何東西之前先在時間軸上定位它。在槽中長大的峰與在床中長大的峰，除了層析圖之外毫無共通之處。',
          '若源自溶液：縮短持液時間、降低溶液溫度、減少配製時的捲入空氣。',
          '若源自床體：降低物料溫度上限並縮短乾燥尾段。',
          '在為它訂定限值之前先鑑定該雜質。未鑑定的峰無法 qualify，未 qualify 的峰無法訂入規格。'
        ]
      },
      wrong: { en: 'Widening the specification to accommodate the peak. A specification is a statement about a controlled process; widening it to fit an uncontrolled one inverts the logic and will not survive review.', zh: '把規格放寬以容納該峰。規格是對「受控製程」的陳述；為了遷就一個失控的製程而放寬規格，是把邏輯倒過來，也無法通過審查。' }
    },
    {
      id: 'tube',
      obs: { en: 'Feeding-tube recovery below the reference product', zh: '餵食管回收率低於參考產品' },
      root: {
        en: 'Beads are too large, too tacky, or too dense to pass and be flushed through an 8 French tube. This is a formulation and process outcome presenting as an in-use test failure.',
        zh: '微丸過大、過黏或過重，無法通過 8 French 管並被沖洗出來。這是處方與製程的結果，以「使用中試驗失敗」的形式呈現。'
      },
      checks: {
        en: ['Particle size distribution against the reference product, both ends', 'Bead surface tackiness — a symptom of insufficient anti-tack or a slightly over-wet run', 'Whether beads are settling in the syringe before flushing, which points to density or wettability'],
        zh: ['與參考產品比較粒徑分佈的兩端', '微丸表面黏性——抗黏劑不足或作業略為過濕的徵兆', '微丸是否在沖洗前即於針筒中沉降，這指向密度或潤濕性問題']
      },
      actions: {
        en: [
          'Return to the core sphere specification, not the coating parameters, first. If the starting core is at the coarse end of its distribution, no coating adjustment will recover the tube result.',
          'Tighten the upper sieve cut and re-test.',
          'Review anti-tack level — but remember that changing it changes Q2, which changes your eligibility for the in vitro BE route. This is the moment where a process fix and a regulatory strategy collide, and the regulatory strategy wins.'
        ],
        zh: [
          '先回到核心球規格，而不是包衣參數。若起始核心落在粒徑分佈的粗端，任何包衣調整都救不回餵食管結果。',
          '收緊上層篩網切點並重測。',
          '檢討抗黏劑用量——但請記得，改變它就改變了 Q2，而改變 Q2 就改變了你走體外 BE 路徑的資格。這正是製程解法與法規策略相撞的時刻，而法規策略優先。'
        ]
      },
      wrong: { en: 'Adjusting the excipient ratio to fix the physical problem without checking the Q1/Q2 consequence. That is how a team solves a test and loses the pathway.', zh: '為了解決物理問題而調整賦形劑比例，卻沒有檢查 Q1/Q2 的後果。團隊就是這樣解決了一個試驗，卻輸掉了整條路徑。' }
    }
  ]
};
