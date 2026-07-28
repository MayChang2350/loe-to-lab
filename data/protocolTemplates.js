/* ============================================================================
   protocolTemplates.js — generic pilot-batch overview for the 20 products
   that are NOT the linaclotide worked example.
   ----------------------------------------------------------------------------
   HONESTY NOTE: the numeric batch-record calculator in section 4 (charge
   weights, coating solution mass, spray time...) is wired to the physics of
   Wurster drug-layering onto capsule beads. It does not generalise to a
   tablet, an aseptic injectable or a biologic without rebuilding the
   underlying model for each unit operation — a large undertaking on its own.

   What this file gives instead, for every other product: a generic,
   honestly-labelled step OVERVIEW built from the product's own unit
   operations list (purpose / what a coach would tell a first-time operator
   to watch), without invented quantities. The linaclotide section remains
   the one fully worked numeric example. The process lab (section 5) is
   where the real physics for coating, blending, compression, dissolution,
   homogenisation and PSD can actually be explored numerically for any
   product's unit operations.
   ========================================================================== */

const OP_STEP = [
  { key: /wurster|drug.layer|coating|enteric pellet|film coating/i,
    title: { en: 'Coating / drug layering', zh: '包衣／藥物層積' },
    purpose: { en: 'Deposit an even film or drug layer onto the core, controlling product temperature and spray rate so the film forms without over-wetting or drying-before-landing.', zh: '在核心上沉積均勻薄膜或藥物層，控制物料溫度與噴速，使成膜過程既不過濕也不會液滴未落地就先乾掉。' },
    equipment: { en: 'Fluid bed with Wurster or top-spray insert, or a pan coater depending on the product', zh: '依產品而定，使用 Wurster 或頂噴流體床，或包衣鍋' },
    watch: { en: ['Product temperature trend, not the instantaneous reading', 'Bed pressure drop for agglomeration or filter blinding', 'Spray rate ramped up gradually rather than started at target'], zh: ['觀察物料溫度趨勢而非瞬時值', '床體壓差是否顯示結塊或濾袋阻塞', '噴速是否逐步爬升而非一開始就設在目標值'] } },
  { key: /granulation|blend/i,
    title: { en: 'Granulation / blending', zh: '製粒／混合' },
    purpose: { en: 'Achieve a uniform, flowable intermediate before the next unit operation. Mean content is set by charge accuracy; variance is set by mixing adequacy.', zh: '在進入下一個單元操作前，得到均勻且流動性佳的中間體。平均含量由投料準確度決定，變異則由混合是否充分決定。' },
    equipment: { en: 'High-shear or fluid-bed granulator, or a diffusion/bin blender for a dry blend', zh: '高剪切或流體床製粒機，或用於乾式混合的擴散式／料桶混合機' },
    watch: { en: ['Torque or power draw as a granulation endpoint indicator', 'Stratified sampling to check for segregation before compression or filling'], zh: ['以扭矩或功率作為製粒終點指標', '進入壓錠或充填前以分層取樣檢查是否分層'] } },
  { key: /compression|direct compression|roller compaction/i,
    title: { en: 'Compression', zh: '壓錠' },
    purpose: { en: 'Form tablets at the target weight, hardness and disintegration within an operating window bounded by capping risk at the high end.', zh: '在以頂裂風險為上限的操作窗口內，壓製出符合目標重量、硬度與崩解時間的錠劑。' },
    equipment: { en: 'Rotary tablet press with in-die or post-compression hardness testing', zh: '旋轉式壓錠機，具模內或壓後硬度測試功能' },
    watch: { en: ['Weight and hardness trend across the compression run', 'Capping or lamination at the top of the force range'], zh: ['壓錠過程中重量與硬度的趨勢', '壓力範圍上緣是否出現頂裂或分層'] } },
  { key: /aseptic|sterile|fill.finish/i,
    title: { en: 'Aseptic fill-finish', zh: '無菌充填封裝' },
    purpose: { en: 'Fill and seal under conditions that maintain sterility from bulk solution to sealed container, with environmental and personnel controls as part of the process, not an afterthought.', zh: '在維持從批量溶液到密封容器全程無菌的條件下進行充填與封裝，環境與人員管制是製程本身的一部分，而非事後補救。' },
    equipment: { en: 'Isolator or RABS-protected filling line; pre-use sterilising-grade filter integrity testing', zh: '隔離器或 RABS 防護之充填線；使用前進行滅菌級濾器完整性測試' },
    watch: { en: ['Environmental monitoring results in real time, not just at batch release', 'Media fill qualification status of the line before the batch starts'], zh: ['即時環境監測結果，而非僅於批次放行時查看', '批次開始前確認充填線的模擬培養基填充驗證狀態'] } },
  { key: /homogenis|emulsion/i,
    title: { en: 'Homogenisation', zh: '均質' },
    purpose: { en: 'Reduce droplet or particle size to the target range and hold it there through processing and storage.', zh: '將液滴或粒子尺寸降至目標範圍，並在製程與儲存期間維持穩定。' },
    equipment: { en: 'High-pressure or rotor-stator homogeniser', zh: '高壓或轉子-定子均質機' },
    watch: { en: ['Particle size distribution at multiple passes, not just the final one', 'Signs of recoalescence on hold, which points to insufficient surfactant coverage'], zh: ['多次通過的粒徑分佈，而非只看最終結果', '靜置後是否出現再合併現象，這指向界面活性劑覆蓋不足'] } },
  { key: /milling/i,
    title: { en: 'Milling', zh: '研磨' },
    purpose: { en: 'Reduce particle size distribution to the range the downstream process and dosage form require, on both the fine and coarse ends.', zh: '將粒徑分佈降至下游製程與劑型所需範圍，同時兼顧細粉與過粗兩端。' },
    equipment: { en: 'Jet mill, pin mill or media mill depending on target size and material properties', zh: '依目標粒徑與物料特性選用氣流粉碎機、針磨機或介質研磨機' },
    watch: { en: ['Particle size distribution at discharge', 'Local heating during milling for thermally sensitive actives'], zh: ['出料時的粒徑分佈', '對熱敏感原料藥而言，研磨過程中的局部升溫'] } },
  { key: /crystallis/i,
    title: { en: 'Crystallisation', zh: '結晶' },
    purpose: { en: 'Isolate the correct polymorph and crystal habit under controlled supersaturation, not an uncontrolled precipitation.', zh: '在受控的過飽和條件下分離出正確的多晶型與晶癖，而非未受控的沉澱。' },
    equipment: { en: 'Jacketed crystalliser with controlled cooling or anti-solvent addition and in-line PAT where available', zh: '附夾套之結晶槽，具受控降溫或反溶劑添加，並視情況配備線上 PAT' },
    watch: { en: ['Seeding point and supersaturation profile', 'Solid-form confirmation (XRPD/DSC) on every isolated batch'], zh: ['投種時機與過飽和度曲線', '每一分離批次皆做固態形式確認（XRPD／DSC）'] } },
  { key: /cell culture|purification|mammalian/i,
    title: { en: 'Cell culture and purification', zh: '細胞培養與純化' },
    purpose: { en: 'Grow, harvest and purify the biologic while tracking product-related variants through every step of the purification train.', zh: '培養、收穫與純化生物製劑，並在純化製程的每一步追蹤產品相關變異體。' },
    equipment: { en: 'Bioreactor train and chromatography/filtration purification skids', zh: '生物反應器系統與層析／過濾純化設備組' },
    watch: { en: ['Cell viability and titre trend through the culture', 'Step yield and impurity clearance at each purification step'], zh: ['培養過程中細胞存活率與效價趨勢', '每個純化步驟的產率與雜質清除效果'] } },
  { key: /capsule filling|softgel/i,
    title: { en: 'Encapsulation', zh: '膠囊充填' },
    purpose: { en: 'Fill at the correct weight within tolerance, with in-line checkweighing rather than end-of-run sampling alone.', zh: '在公差範圍內以正確重量充填，並以線上檢重取代僅靠批次末端取樣。' },
    equipment: { en: 'Dosator or tamping-pin capsule filler, or a softgel encapsulation line', zh: 'dosator 或壓塞針式膠囊充填機，或軟膠囊充填線' },
    watch: { en: ['Weight trend versus scatter — trend points to a machine/hopper issue, scatter to a flow issue', 'Capsule/shell appearance for under- or over-fill'], zh: ['重量趨勢對比散佈——趨勢指向機台／料位問題，散佈指向流動性問題', '膠囊／殼外觀是否顯示充填不足或過量'] } },
  { key: /osmotic|semipermeable|laser drill/i,
    title: { en: 'Membrane coating and orifice formation', zh: '膜衣包覆與孔口成形' },
    purpose: { en: 'Apply a controlled-permeability membrane and, where required, drill a precisely sized and positioned orifice that sets the release rate.', zh: '施加具受控通透性的膜衣，並於需要時鑽出尺寸與位置精確的孔口，以決定釋放速率。' },
    equipment: { en: 'Pan or fluid-bed coater for the membrane; laser drilling station for the orifice', zh: '用於膜衣的包衣鍋或流體床；用於孔口的雷射鑽孔設備' },
    watch: { en: ['Membrane thickness/weight gain uniformity', 'Orifice diameter and position against specification'], zh: ['膜衣厚度／增重均勻度', '孔口直徑與位置是否符合規格'] } },
  { key: /containment|cytotoxic|hormonal/i,
    title: { en: 'Potent-compound handling', zh: '高活性化合物操作' },
    purpose: { en: 'Run the primary unit operations inside qualified containment, treating operator exposure and cleaning validation as CQAs of the manufacturing system.', zh: '在合格圍堵設備內執行主要單元操作，將操作者暴露與清潔驗證視為製造系統本身的 CQA。' },
    equipment: { en: 'Isolator- or containment-booth-integrated processing equipment appropriate to the OEB rating', zh: '依 OEB 分級選用整合隔離器或圍堵室之製程設備' },
    watch: { en: ['Containment performance verification before the batch starts', 'Cleaning validation swab/rinse results before changeover'], zh: ['批次開始前的圍堵效能驗證', '換線前的清潔驗證擦拭／沖淋結果'] } }
];
const OP_STEP_DEFAULT = {
  title: { en: 'Process step', zh: '製程步驟' },
  purpose: { en: 'A unit operation specific to this product\'s manufacturing route — see the process lab for the general physics of related operations.', zh: '此產品製程路線特有的單元操作——相關操作的一般物理原理可參見製程實驗室。' },
  equipment: { en: 'Per the equipment train for this dosage form', zh: '依此劑型之設備配置而定' },
  watch: { en: ['In-process controls appropriate to this operation'], zh: ['適用於此操作的製程中管制'] }
};

function stepsOverviewFor(unitOps) {
  const seen = new Set();
  const out = [];
  unitOps.forEach(op => {
    const hit = OP_STEP.find(s => s.key.test(op));
    const entry = hit || OP_STEP_DEFAULT;
    if (seen.has(entry.title.en)) return;
    seen.add(entry.title.en);
    out.push({ ...entry, fromOp: op });
  });
  return out;
}
