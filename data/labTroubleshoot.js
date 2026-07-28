/* ============================================================================
   labTroubleshoot.js — "it went sideways, what do I run next" popups for the
   process lab's six parametric unit operations.
   ----------------------------------------------------------------------------
   Each unit op's verdict() already tells you WHAT you'd see on the bench and
   WHY, branch by branch (data/unitops.js). This file adds the next question
   an operator actually asks when the bench view turns bad/warn: what is the
   comparison or follow-up experiment that would tell you which of the
   competing causes is the real one? These are operation-level (not
   branch-by-branch) — a lighter grain than the Pilot Batch troubleshooting
   engine in data/protocol.js, chosen so this stays honest about being a
   general diagnostic pattern rather than pretending to read the exact
   failure branch you happen to be looking at.
   ========================================================================== */

const LAB_FIXES = {
  psd: [
    { compare: { en: 'Hold screen and feed constant, vary rotor speed only. If fines rise together with rotor speed, you are over-milling (attrition), not under-milling — the fix is slower, not tighter.', zh: '固定篩網與進料，只改變轉子速度。若細粉隨轉速上升而增加，代表你正在過度研磨（磨耗），而非研磨不足——解法是放慢，而不是收緊。' } },
    { compare: { en: 'Split the batch: mill half at half the feed rate. If oversize fraction drops sharply, you were feed-rate limited (material passing half-milled), not screen limited — tightening the screen would only have made things worse.', zh: '將批次分半：一半以一半進料速率研磨。若過粗比例明顯下降，代表你受限於進料速率（物料半磨即通過），而非篩網孔徑——收緊篩網只會讓情況更糟。' } }
  ],
  blend: [
    { compare: { en: 'Run two short trials at the current blend time: one with lubricant added last for the validated short time, one with lubricant blended in from the start. If the "added last" trial is stronger and faster to disintegrate, you have confirmed over-lubrication rather than under-mixing.', zh: '以目前的混合時間做兩個短試驗：一個把潤滑劑最後加入並以已驗證的短時間混合，一個從一開始就混入潤滑劑。若「最後加入」那組更強、崩解更快，即可確認問題是過度潤滑而非混合不足。' } },
    { compare: { en: 'Stratified-sample the blend at three time points (short, current, extended). If RSD is still falling at the current time, you are under-mixed and need more time; if RSD bottoms out and then rises, you have found the re-segregation point and current time is already too long.', zh: '在三個時間點（短、目前、延長）對混合物分層取樣。若目前時間點的 RSD 仍在下降，代表混合不足、需要更久；若 RSD 先降到最低點後又回升，代表你已找到再分層點，目前的時間其實已經太長。' } }
  ],
  compress: [
    { compare: { en: 'Hold force constant and run the same tablet at two turret speeds (slow and fast). If capping only appears at the fast speed, the cause is dwell time, not force — raising pre-compression or slowing the turret is the fix, not backing off the main force.', zh: '固定壓力，以兩種轉盤速度（慢、快）壓製同一錠劑。若頂裂只在快速時出現，原因是受壓時間而非壓力——解法是提高預壓或放慢轉盤，而不是降低主壓力。' } },
    { compare: { en: 'Compare a batch at the current granule moisture (LOD) against one 0.5–1% drier. If sticking disappears at the drier LOD with hardness otherwise unchanged, the granule — not the press — was the source of the defect.', zh: '比較目前顆粒含水量（LOD）批次與含水量低 0.5–1% 的批次。若含水量較低時黏沖消失，而硬度大致不變，代表缺陷來源是顆粒而非壓錠機本身。' } }
  ],
  coating: [
    { compare: { en: 'Reduce atomisation pressure in one step and re-measure weight-gain uniformity at the same target. If uniformity improves, droplets were drying before landing (spray-drying), which atomisation pressure controls — raising spray rate instead would have made it worse, not better.', zh: '將霧化壓力調降一級，並在相同目標增重下重新量測均勻度。若均勻度改善，代表液滴在落地前已乾掉（噴霧乾燥），而這由霧化壓力控制——若改為提高噴速，只會使情況惡化而非改善。' } },
    { compare: { en: 'Run a short trial at the same spray rate but higher air volume. If ΔP and appearance both improve, you had an airflow/circulation problem, not a spray-rate problem — the two look identical on a weight-gain readout but need opposite fixes.', zh: '以相同噴速、提高風量進行短時間試驗。若壓差與外觀同時改善，代表問題出在風量／循環而非噴速——這兩種問題在增重讀數上看起來一樣，卻需要相反的解法。' } }
  ],
  dissol: [
    { compare: { en: 'Run the same tablet in a second medium (e.g. pH 4.5 if you tested pH 6.8). If release is fast in one medium and slow in another, you have a pH-dependent solubility issue that a single-medium spec would have missed entirely.', zh: '以第二種介質測試同一錠劑（例如原測 pH 6.8 則加測 pH 4.5）。若在一種介質中釋放快、另一種慢，代表存在 pH 依賴性溶解度問題，單一介質規格完全無法察覺。' } },
    { compare: { en: 'Crush one tablet and re-run dissolution on the powder. If the powder releases fast but the intact tablet is slow, the rate-limiting step is disintegration/coating, not intrinsic drug solubility — coating level or disintegrant is the lever, not particle size.', zh: '將一錠壓碎後重新測試溶離。若粉末釋放快、完整錠劑卻慢，代表限速步驟是崩散／包衣，而非藥物本身的溶解度——該調整的是包衣量或崩散劑，而非粒徑。' } }
  ],
  homog: [
    { compare: { en: 'Hold pressure constant and add one extra pass. If d32 keeps falling with more passes, you have not yet reached the surfactant-coverage floor; if it flattens, further passes are wasted energy and the real lever is surfactant, not pressure or passes.', zh: '固定壓力，增加一次循環。若 d32 隨循環次數增加持續下降，代表尚未達到界面活性劑覆蓋率下限；若已趨平，代表再多循環也是浪費能量，真正的槓桿是界面活性劑而非壓力或循環次數。' } },
    { compare: { en: 'Hold everything constant and only raise surfactant level one step. If droplet size drops and stops recoalescing on hold, you confirmed a surfactant-starved system — raising homogenising pressure instead would have cost more energy for a smaller gain.', zh: '固定其餘條件，只把界面活性劑用量調高一級。若粒徑下降且靜置後不再合併，即可確認原本是界面活性劑不足——若改為提高均質壓力，只會耗費更多能量卻得到更小的效益。' } }
  ]
};
