/* ============================================================================
   dosageforms.js — what each product physically is, and why the form decides
   how it gets made
   ----------------------------------------------------------------------------
   APPEARANCE HONESTY NOTE, stated once and meant:

   Only LINZESS carries verified appearance detail (white to off-white opaque
   hard gelatin capsule, grey "FL 145" imprint) because that is the one product
   whose label text I checked directly. Every other figure is an accurate
   drawing of the DOSAGE FORM — correct structure, correct relative scale,
   correct internal architecture — in neutral colours, with no invented imprint.
   Colour and debossing are product-specific facts and are not guessed here.
   Each figure links to the official DailyMed photograph.
   ========================================================================== */

/* ---------- the forms themselves ---------------------------------------- */

const FORM_INFO = {

  'capsule-beads': {
    name: { en: 'Hard capsule, drug-layered beads', zh: '硬膠囊，藥物層積微丸' },
    made: {
      en: 'The drug is sprayed as a solution onto thousands of inert cellulose spheres in a fluid bed, then the coated beads are filled into capsules. Nothing is compressed, so the dose is spread across thousands of independent carriers rather than one compact.',
      zh: '藥物以溶液形式在流體床中噴附到數千顆惰性纖維素球上，包衣後的微丸再充填入膠囊。全程不經壓製，因此劑量分散在數千個獨立載體上，而非單一壓實體。'
    },
    hard: {
      en: 'Uniformity is decided during spraying, not during filling — if a bead was under-coated there is no downstream step that can fix it.',
      zh: '均勻度在噴霧階段就決定了，而非充填階段——若某顆微丸包衣不足，下游沒有任何步驟能補救。'
    },
    ops: ['Wurster fluid bed', 'Sieving', 'Capsule filling']
  },

  'capsule': {
    name: { en: 'Hard capsule, powder or granule fill', zh: '硬膠囊，粉末或顆粒填充' },
    made: {
      en: 'A blend of drug and excipients is metered volumetrically into the capsule body and the cap is pushed on. The simplest oral solid there is: no compression forces, no film, nothing to crack.',
      zh: '藥物與賦形劑的混合物以體積計量填入膠囊體，再套上帽蓋。這是最單純的口服固體劑型：沒有壓製力、沒有膜衣、沒有可以裂開的東西。'
    },
    hard: {
      en: 'Because filling is volumetric, weight control depends entirely on the powder keeping a constant bulk density — which it will not do if the hopper level drifts.',
      zh: '由於充填以體積計量，重量控制完全取決於粉體維持恆定的堆積密度——而料位一旦漂移，它就做不到。'
    },
    ops: ['Blending', 'Capsule filling', 'Checkweighing']
  },

  'capsule-dr': {
    name: { en: 'Delayed-release capsule, coated pellets', zh: '延遲釋放膠囊，包衣微丸' },
    made: {
      en: 'Drug-loaded pellets receive an acid-resistant polymer coat so they survive the stomach, then two populations with different coat thicknesses are blended and filled together to give two separate release pulses.',
      zh: '載藥微丸先包覆耐酸性高分子以通過胃部，接著把兩種不同膜厚的族群混合後一起充填，以產生兩次獨立的釋放脈衝。'
    },
    hard: {
      en: 'You are controlling two release profiles inside one capsule. The ratio between the two populations is a dose-critical parameter that no single assay will detect if it drifts.',
      zh: '你在一顆膠囊裡同時控制兩條釋放曲線。兩個族群的比例是攸關劑量的關鍵參數，一旦漂移，任何單一含量測定都偵測不到。'
    },
    ops: ['Wurster enteric coating', 'Dual-population blending', 'Capsule filling']
  },

  'tablet-fc': {
    name: { en: 'Film-coated tablet', zh: '膜衣錠' },
    made: {
      en: 'Powder is granulated to make it flow, compressed between two punches into a compact, then tumbled in a perforated drum while a thin polymer film is sprayed on for protection, taste and colour.',
      zh: '粉體先造粒以改善流動性，在上下沖頭之間壓製成壓實體，再於打孔的包衣鍋中翻滾，噴上一層薄的高分子膜以達到保護、遮味與著色的目的。'
    },
    hard: {
      en: 'The workhorse form, and the reason it attracts every generic filer: nothing here is a barrier. Which is exactly why the price collapses when they all arrive on the same day.',
      zh: '這是最主流的劑型，也正是它吸引所有學名藥申請者的原因：這裡沒有任何門檻。而這也正是為什麼當他們同一天全部上市時，價格會崩潰。'
    },
    ops: ['Granulation', 'Compression', 'Film coating']
  },

  'tablet-er-osmotic': {
    name: { en: 'Osmotic extended-release tablet', zh: '滲透壓型持續釋放錠' },
    made: {
      en: 'A two-layer core — drug on one side, a swelling push layer on the other — is coated in a semipermeable membrane, and a hole is drilled through the membrane with a laser. Water enters through the membrane, the push layer swells, and drug is squeezed out of the hole at a near-constant rate.',
      zh: '雙層錠芯——一側為藥物層，另一側為會膨脹的推進層——外包半透膜，再以雷射在膜上鑽出一個孔。水分經半透膜進入，推進層膨脹，藥物便以近乎恆定的速率從該孔被擠出。'
    },
    hard: {
      en: 'A genuinely hard form to copy. Membrane permeability, orifice diameter and push-layer swelling all have to be reproduced together, and laser drilling is capital most sites do not have.',
      zh: '這是真正難以複製的劑型。膜的透過性、孔徑與推進層的膨脹必須同時重現，而雷射鑽孔所需的設備投資是多數廠區所沒有的。'
    },
    ops: ['Bilayer compression', 'Membrane coating', 'Laser drilling']
  },

  'tablet-er-matrix': {
    name: { en: 'Matrix extended-release tablet', zh: '基質型持續釋放錠' },
    made: {
      en: 'Drug is embedded in a polymer that gels when it meets water. The gel layer thickens from the outside in and the drug has to diffuse through it, which slows release without any coating or drilling.',
      zh: '藥物被包埋在遇水會形成凝膠的高分子中。凝膠層由外向內增厚，藥物必須擴散穿過它，因而在不需包衣或鑽孔的情況下減緩釋放。'
    },
    hard: {
      en: 'Deceptively simple to make and difficult to match. Release depends on polymer grade, viscosity and particle size, and small changes in any of them move the whole dissolution curve.',
      zh: '看似容易製造，實則難以匹配。釋放取決於高分子的等級、黏度與粒徑，其中任一項的微小改變都會使整條溶離曲線移動。'
    },
    ops: ['Matrix blending', 'Compression', 'Optional film coat']
  },

  'softgel': {
    name: { en: 'Soft gelatin capsule', zh: '軟明膠膠囊' },
    made: {
      en: 'A drug dissolved or suspended in oil is injected between two ribbons of wet gelatin, which are sealed and cut in the same motion, then dried for days. Used when a drug will not dissolve in water on its own.',
      zh: '將溶解或懸浮於油相中的藥物注入兩片濕明膠膠片之間，在同一個動作中完成封合與切割，再乾燥數日。適用於本身不溶於水的藥物。'
    },
    hard: {
      en: 'Specialised capacity you either already own or must buy. Fill and shell interact chemically over shelf life, so the stability programme is doing more work than it looks.',
      zh: '這是專屬產能，你要嘛已經擁有，要嘛必須購置。內容物與膠殼在效期內會發生化學交互作用，因此安定性試驗承擔的工作比表面上看起來更多。'
    },
    ops: ['Gelatin ribbon casting', 'Rotary die encapsulation', 'Tunnel drying']
  },

  'emulsion-oph': {
    name: { en: 'Sterile ophthalmic emulsion', zh: '無菌眼用乳劑' },
    made: {
      en: 'An oily drug is broken into sub-micron droplets suspended in water using a high-pressure homogeniser, sterile-filtered, and filled aseptically into single-use vials that contain no preservative.',
      zh: '以高壓均質機把油性藥物打散成懸浮於水中的次微米液滴，經無菌過濾後，於無菌條件下充填至不含防腐劑的單次使用容器中。'
    },
    hard: {
      en: 'The droplet size distribution is not a quality attribute here — it is the evidence FDA accepts in place of a clinical trial. Getting it to match the reference product is the whole programme.',
      zh: '此處的液滴粒徑分佈不只是品質屬性——它就是 FDA 用來取代臨床試驗的那份證據。讓它與參考產品相符，就是整個專案本身。'
    },
    ops: ['High-pressure homogenisation', 'Sterile filtration', 'Aseptic filling']
  },

  'suspension': {
    name: { en: 'Oral nanocrystal suspension', zh: '口服奈米結晶懸液' },
    made: {
      en: 'Drug crystals are milled in liquid with tiny beads until they are a few hundred nanometres across, then stabilised with polymers so they stay dispersed and can be poured out again evenly.',
      zh: '藥物結晶在液相中以微小研磨珠濕磨至數百奈米，再以高分子安定，使其保持分散並能被均勻倒出。'
    },
    hard: {
      en: 'Every dose is poured, not counted. If particles settle and do not redisperse, the first spoonful and the last from the same bottle are different doses.',
      zh: '每一劑是「倒」出來的，不是「數」出來的。若粒子沉降且無法再分散，同一瓶的第一匙與最後一匙就是不同的劑量。'
    },
    ops: ['Wet media milling', 'Homogenisation', 'Bottle filling']
  },

  'solution': {
    name: { en: 'Oral solution', zh: '口服溶液' },
    made: {
      en: 'The drug is fully dissolved in water with buffers, preservatives and flavour, filtered, and filled into bottles. The simplest form to manufacture and often the hardest to make stable.',
      zh: '藥物完全溶解於含緩衝劑、防腐劑與矯味劑的水中，過濾後充填入瓶。這是製造上最單純的劑型，卻往往是最難維持安定的。'
    },
    hard: {
      en: 'Nothing protects the molecule. It sits in water for the whole shelf life, so degradation, pH drift and preservative loss all have two years to happen.',
      zh: '沒有任何東西保護該分子。它在整個效期內都泡在水中，因此降解、pH 漂移與防腐效能流失都有兩年的時間可以發生。'
    },
    ops: ['Compounding', 'Filtration', 'Bottle filling']
  },

  'vial-iv': {
    name: { en: 'Sterile solution for infusion', zh: '無菌輸注液' },
    made: {
      en: 'A protein made by living cells is purified over many chromatography steps, formulated, sterile-filtered and filled aseptically into glass vials that are stoppered and capped without ever being opened to room air.',
      zh: '由活細胞製造的蛋白質經多道層析步驟純化、配製、無菌過濾後，於無菌條件下充填入玻璃瓶，並在全程未接觸室內空氣的情況下加塞封蓋。'
    },
    hard: {
      en: 'This is not a generic problem at all. A protein cannot be copied exactly, so the comparison is biosimilarity rather than sameness — a different statute, a different book, a different decade of work.',
      zh: '這根本不是學名藥的問題。蛋白質無法被完全複製，因此比較的是「生物相似性」而非「相同性」——不同的法律、不同的資料庫、不同的十年。'
    },
    ops: ['Cell culture', 'Purification', 'Aseptic fill-finish']
  }
};

/* ---------- which product is which form --------------------------------- */
/* dims are drawing hints, roughly to real scale relative to one another.    */

const DRUG_VIZ = {
  linaclotide: { form: 'capsule-beads', verified: true, imprint: 'FL 145', sizeLabel: 'size 2 capsule · approx. 18 mm',
    note: { en: 'The only figure here with verified appearance: the FDA label specifies a white to off-white opaque hard gelatin capsule with a grey "FL 145" imprint. Inside, 145 micrograms of peptide are spread across thousands of beads — about two parts per thousand by weight.', zh: '本頁唯一具經查證外觀的圖：FDA 標示指明為白色至類白色不透明硬明膠膠囊，印有灰色「FL 145」。內部的 145 微克胜肽分散在數千顆微丸上——以重量計約為千分之二。' } },
  apixaban: { form: 'tablet-fc', sizeLabel: 'round film-coated tablet',
    note: { en: 'A small, ordinary film-coated tablet. That is precisely the commercial problem: twenty-five filers can all make this, and on launch day they all do.', zh: '一顆小而平凡的膜衣錠。而這正是商業上的問題：二十五家申請者都做得出來，而在上市日他們全都會做。' } },
  empagliflozin: { form: 'tablet-fc', sizeLabel: 'round biconvex film-coated tablet',
    note: { en: 'Two strengths of a conventional immediate-release tablet. Nineteen tentative approvals are already queued behind it, which tells you everything about how hard it is to make.', zh: '兩個規格的常規速放錠。已有十九件暫時性核准排在後面，這已經說明了它有多難做。' } },
  ruxolitinib: { form: 'tablet-fc', sizeLabel: 'five strengths, uncoated to film-coated',
    note: { en: 'Five strengths means five dissolution profiles, five stability programmes and five sets of registration batches. Ordinary to make, expensive to register.', zh: '五個規格代表五條溶離曲線、五套安定性試驗與五組註冊批。製造平凡，註冊昂貴。' } },
  cariprazine: { form: 'capsule', sizeLabel: 'four strengths, hard capsule',
    note: { en: 'A simple capsule hiding a difficult clinical problem: the active metabolite has a half-life measured in weeks, which makes a conventional crossover PK study slow and expensive.', zh: '一顆簡單的膠囊，藏著一個困難的臨床問題：活性代謝物的半衰期以「週」計，使常規交叉設計的 PK 試驗既緩慢又昂貴。' } },
  rifaximin: { form: 'tablet-fc', sizeLabel: 'film-coated tablet, two strengths',
    note: { en: 'The tablet is unremarkable; the crystal form inside it is the entire legal case. Patents cover a specific polymorph, and an ANDA needs the same active ingredient — which FDA does not read as the same solid form.', zh: '錠劑本身不特別；真正構成整場法律戰的是裡面的晶型。專利涵蓋特定多晶型，而 ANDA 需要「相同的活性成分」——FDA 並不把它解讀為「相同的固態晶型」。' } },
  palbociclib: { form: 'capsule', sizeLabel: 'hard capsule and tablet presentations',
    note: { en: 'A cytotoxic-adjacent molecule, so the capsule itself is easy and the building is not. Handling this requires a containment suite you either already have or must construct.', zh: '這是接近細胞毒性的分子，因此膠囊本身容易，廠房卻不容易。處理它需要一套封閉產線——你要嘛已經有，要嘛必須新建。' } },
  sitagliptin: { form: 'tablet-fc', sizeLabel: 'round film-coated tablet, three strengths',
    note: { en: 'Three generics are already approved. The manufacturing is textbook; the window is what closed.', zh: '已有三家學名藥獲准。製造本身是教科書等級的；關上的是窗口，不是難度。' } },
  'sitagliptin-metformin': { form: 'tablet-fc', sizeLabel: 'oval film-coated tablet, fixed-dose combination',
    made: 'combo', sizeNote: 'large',
    note: { en: 'A fixed-dose combination with up to a gram of metformin in it, so the tablet is large and the granulation has to carry a high drug load. Harder than it looks, and still crowded.', zh: '這是一個含高達一公克 metformin 的複方，因此錠劑很大，造粒必須承載高藥物負載。比看起來難，但賽道依然擁擠。' } },
  tofacitinib: { form: 'tablet-er-osmotic', sizeLabel: 'osmotic ER tablet, laser-drilled',
    note: { en: 'The extended-release version is the interesting half. A semipermeable membrane with a laser-drilled orifice is a real barrier — but the window opened in 2025, so the barrier is genuine and the timing is not.', zh: '持續釋放版本才是有意思的那一半。半透膜加上雷射鑽孔是真正的門檻——但窗口已於 2025 年開啟，門檻是真的，時機不是。' } },
  dexlansoprazole: { form: 'capsule-dr', sizeLabel: 'dual-release enteric pellets',
    note: { en: 'Two pellet populations with different enteric coat thicknesses give two release pulses hours apart. Technically the closest analogue to the recommended project — same equipment, same physics, wrong decade.', zh: '兩種不同腸溶膜厚的微丸族群，產生相隔數小時的兩次釋放脈衝。技術上與最終建議的專案最為接近——相同設備、相同物理，錯誤的年代。' } },
  'cyclosporine-oph': { form: 'emulsion-oph', sizeLabel: '0.4 mL single-use vial',
    note: { en: 'The structural template for this whole set: the oil droplets have to be small enough to stay suspended through shelf life and matched closely enough to the reference product\'s droplet-size distribution that FDA accepts the in vitro comparison instead of a clinical trial.', zh: '本組的結構原型：油滴必須小到足以在保存期限內維持懸浮，且其粒徑分佈須與參考產品緊密相符，才能讓 FDA 願意以體外比較取代臨床試驗。' } },
  enzalutamide: { form: 'softgel', sizeLabel: 'oblong soft capsule, liquid fill',
    note: { en: 'A liquid-filled soft capsule, because the drug will not dissolve in water on its own. Softgel encapsulation is capacity, not skill — you either have the line or you are quoting someone else\'s.', zh: '液體填充的軟膠囊，因為該藥本身不溶於水。軟膠囊填充是「產能」而非「技術」——你要嘛擁有產線，要嘛是在報別人的價。' } },
  valbenazine: { form: 'capsule', sizeLabel: 'hard capsule, three strengths',
    note: { en: 'Straightforward to make and a long way from its entry date. The problem is not the capsule, it is five years of working capital before the first dollar.', zh: '製造直截了當，但距離進場日還很遠。問題不在膠囊，而在第一塊錢之前的五年營運資金。' } },
  'semaglutide-oral': { form: 'tablet-fc', sizeLabel: 'oral peptide tablet with permeation enhancer',
    note: { en: 'A peptide taken by mouth, which should not work — an absorption enhancer in the tablet gets it across the stomach lining. Approved under an NDA, so its copies are ANDAs, not biosimilars. Molecule size does not decide the pathway.', zh: '一個用口服的胜肽，照理不該有效——錠劑中的吸收促進劑讓它穿過胃壁。它以 NDA 核准，因此其學名藥走 ANDA 而非生物相似性藥品。決定路徑的不是分子大小。' } },
  pembrolizumab: { form: 'vial-iv', sizeLabel: '100 mg / 4 mL single-use vial',
    note: { en: 'The branch marker. Everything else on this list is decided in the Orange Book; this one is decided in the Purple Book. A screener that cannot tell those apart will confidently recommend an ANDA for a monoclonal antibody.', zh: '路徑分岔的標記。清單上其他所有品項都在 Orange Book 裡決定，只有這一項在 Purple Book 裡決定。分不清這兩本書的篩選系統，會自信地為單株抗體推薦 ANDA。' } },
  deutetrabenazine: { form: 'tablet-er-matrix', sizeLabel: 'coated tablet and ER presentation',
    note: { en: 'Deuterium substituted for hydrogen slows the body\'s metabolism of the drug. Chemically ingenious, and it raises awkward questions about what "same active ingredient" means.', zh: '以氘取代氫，減慢人體對藥物的代謝。化學上很巧妙，同時也對「相同活性成分」的定義提出了尷尬的問題。' } },
  ozanimod: { form: 'capsule', sizeLabel: 'sub-milligram capsule, titration pack',
    note: { en: 'Doses below one milligram, so content uniformity is the governing attribute — the same physics as the recommended project, in a market a fifth the size.', zh: '劑量低於一毫克，因此含量均勻度是主導屬性——與最終建議的專案物理相同，但市場只有五分之一大。' } },
  upadacitinib: { form: 'tablet-er-matrix', sizeLabel: 'extended-release tablet',
    note: { en: 'A gelling matrix releases the drug over the day. Large, growing, and the clock has not started — watchlist rather than pipeline.', zh: '凝膠基質使藥物在一天內緩慢釋放。規模大、仍在成長，但時鐘尚未啟動——屬於觀察名單而非產品線。' } },
  'vigabatrin-sol': { form: 'solution', sizeLabel: 'ready-to-use oral solution',
    note: { en: 'The most instructive item in the set for exclusivity strategy: turning an existing tablet into a ready-to-use oral solution is a 505(b)(2) that earns three years of New Clinical Investigation exclusivity of its own — building a barrier instead of waiting for someone else\'s to fall.', zh: '在專屬權策略上，本組中最具啟發性的一項：把既有錠劑改成即用型口服溶液屬於 505(b)(2)，可自行取得三年新臨床研究專屬權——這是建立門檻，而不是等別人的門檻倒下。' } },
  'megestrol-susp': { form: 'suspension', sizeLabel: 'nanocrystal oral suspension',
    note: { en: 'Drug crystals milled to a few hundred nanometres to increase dissolution surface area — the API is practically insoluble in water, so equivalence depends on particle size, redispersibility and settling volume rather than on chemistry.', zh: '藥物結晶被磨到數百奈米以增加溶離表面積——該 API 幾乎不溶於水，因此等效性取決於粒徑、再分散性與沉降體積，而非化學。' } }
};
