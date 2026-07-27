/* ============================================================================
   pathway.js — regulatory route selection, exclusivity clock, and cost model
   ----------------------------------------------------------------------------
   Built from internship decks 8 and 9 (NDA / ANDA / BLA Regulation Part 1+2)
   and deck 5 (Project Evaluation). Fee figures are FY2026 statutory rates.
   ========================================================================== */

/* ---------- 1. Route decision tree -------------------------------------- */

const PATHWAY_TREE = {
  start: 'q_statute',
  nodes: {
    q_statute: {
      q: {
        en: 'Under which statute was the reference product approved?',
        zh: '參考產品當初是依哪一部法律核准的？'
      },
      why: {
        en: 'This is the first question, not the second. Molecule size is a clue, not the rule: semaglutide and linaclotide are peptides approved under NDAs, so their copies are ANDAs. Insulin moved from NDA to BLA by statute in 2020, so its copies became 351(k). Read the application number, not the molecular weight.',
        zh: '這是第一個問題，不是第二個。分子大小只是線索而非規則：semaglutide 與 linaclotide 都是以 NDA 核准的胜肽，因此其學名藥走 ANDA。胰島素則在 2020 年依法由 NDA 轉為 BLA，其後續產品因而變成 351(k)。要看的是申請案號，不是分子量。'
      },
      opts: [
        { label: { en: 'FD&C Act §505 — it has an NDA number and appears in the Orange Book', zh: 'FD&C Act §505——有 NDA 案號，且列於 Orange Book' }, next: 'q_sameness' },
        { label: { en: 'PHS Act §351(a) — it has a BLA number and appears in the Purple Book', zh: 'PHS Act §351(a)——有 BLA 案號，且列於 Purple Book' }, next: 'q_biosim' },
        { label: { en: 'There is no approved reference product — this is a new molecular entity', zh: '沒有已核准的參考產品——這是新分子實體' }, next: 'r_505b1' }
      ]
    },

    q_sameness: {
      q: {
        en: 'Relative to the RLD, will your product be the same in active ingredient, dosage form, route, strength, and conditions of use?',
        zh: '相對於 RLD，你的產品在活性成分、劑型、給藥途徑、規格與使用條件上是否完全相同？'
      },
      why: {
        en: 'This is the §505(j) sameness gate. Note what is NOT on the list: solid-state form. FDA does not read "same active ingredient" as "same polymorph", which is why polymorph patents are — in principle — designable-around, at the cost of owning a different dissolution and stability file.',
        zh: '這是 §505(j) 的 sameness 關卡。請注意清單上「沒有」的東西：固態晶型。FDA 並不把「相同活性成分」解讀為「相同多晶型」，這正是晶型專利原則上可以迴避設計的原因——代價是你從此擁有一份不同的溶離與安定性檔案。'
      },
      opts: [
        { label: { en: 'Yes — same in all five respects', zh: '是——五個面向全部相同' }, next: 'q_be' },
        { label: { en: 'No — I am changing strength, dosage form, route, or indication', zh: '否——我要改變規格、劑型、途徑或適應症' }, next: 'r_505b2' },
        { label: { en: 'Only the dosage form or route differs, and it is a listed suitability change', zh: '僅劑型或途徑不同，且屬可提 suitability petition 的變更' }, next: 'r_suitability' }
      ]
    },

    q_be: {
      q: {
        en: 'Can bioequivalence be shown by systemic PK measurement in plasma?',
        zh: '生體相等性能否以血漿中的全身性 PK 來證明？'
      },
      why: {
        en: 'For a locally acting or non-absorbed product, plasma concentration is not the bridge to equivalence. Read the PSG before assuming a fasting/fed crossover will do — that assumption is what turns an 18-month programme into a 5-year one.',
        zh: '對局部作用或不吸收的產品而言，血漿濃度並非等效性的橋樑。在假設「做個空腹／飯後交叉試驗就好」之前，先讀 PSG——正是這個假設會把 18 個月的專案變成 5 年。'
      },
      opts: [
        { label: { en: 'Yes — the drug is systemically absorbed and PK is the endpoint', zh: '是——藥物經全身吸收，以 PK 為終點' }, next: 'r_anda_pk' },
        { label: { en: 'No — it acts locally, and the PSG offers an in vitro route', zh: '否——局部作用，且 PSG 提供體外路徑' }, next: 'r_anda_invitro' },
        { label: { en: 'No — and the PSG requires a clinical endpoint study', zh: '否——且 PSG 要求以臨床療效為終點的試驗' }, next: 'r_anda_clinical' }
      ]
    },

    q_biosim: {
      q: {
        en: 'Are you seeking biosimilarity only, or interchangeability?',
        zh: '你要申請的是「生物相似性」，還是「可互換性」？'
      },
      why: {
        en: 'Biosimilar and interchangeable are two separate FDA determinations. Interchangeability permits pharmacy-level substitution without prescriber intervention and historically required switching studies; the evidentiary bar and the commercial value are both higher.',
        zh: '生物相似性與可互換性是 FDA 的兩個獨立認定。可互換性允許藥局層級在無需處方醫師介入下替換，歷來需要 switching study；其證據門檻與商業價值都更高。'
      },
      opts: [
        { label: { en: 'Biosimilarity — analytical, PK, and comparative clinical similarity', zh: '生物相似性——分析、PK 與比較性臨床相似性' }, next: 'r_351k' },
        { label: { en: 'Interchangeability — substitutable at the pharmacy counter', zh: '可互換性——可在藥局櫃檯直接替換' }, next: 'r_351k_ix' }
      ]
    }
  },

  results: {
    r_505b1: {
      title: '505(b)(1) — Stand-alone NDA',
      body: {
        en: 'You own and generate the full reports of investigations. No reliance on anyone else\'s data, and no right of reference required. In exchange you carry the entire nonclinical and clinical burden and the full PDUFA fee. If the molecule is genuinely new you may earn 5-year NCE exclusivity, during which no ANDA may even be submitted (4 years if accompanied by a Paragraph IV certification).',
        zh: '你自行擁有並產出完整的研究報告，不依賴他人資料，也不需要 right of reference。代價是你承擔全部的非臨床與臨床負擔，以及完整的 PDUFA 費用。若分子確實是新的，可取得 5 年 NCE 專屬權，期間任何 ANDA 都不得提出（若附 Paragraph IV 認證則為 4 年）。'
      },
      fee: 4682003, feeLabel: 'PDUFA FY2026, application requiring clinical data',
      typicalMonths: 96, clinicalCost: 200000000
    },
    r_505b2: {
      title: '505(b)(2) — NDA relying in part on data not owned by the applicant',
      body: {
        en: 'The pathway people underuse. You bridge to published literature or to FDA\'s previous findings of safety and effectiveness for a listed drug, and you supply only the studies your change requires. A new strength, a new route, a ready-to-use presentation, or a paediatric solution can each qualify. Critically, this route can EARN 3-year new-clinical-investigation exclusivity of its own — you build a barrier instead of waiting for someone else\'s to fall. You must, however, certify against the listed drug\'s Orange Book patents exactly as an ANDA does.',
        zh: '一條被低估的路徑。你橋接到已發表文獻，或 FDA 對某已列名藥品既有的安全性與有效性認定，只需補上你所做的變更所要求的研究。新規格、新途徑、即用型呈現、兒科溶液，都可能適用。關鍵是這條路徑可以「賺到」自己的 3 年新臨床研究專屬權——你在建立門檻，而不是等別人的門檻倒下。但你仍必須如同 ANDA 一樣，針對已列名藥品的 Orange Book 專利提出認證。'
      },
      fee: 4682003, feeLabel: 'PDUFA FY2026 (2,341,002 if no clinical data required)',
      typicalMonths: 48, clinicalCost: 15000000
    },
    r_suitability: {
      title: 'ANDA via suitability petition — §505(j)(2)(C)',
      body: {
        en: 'A narrow door. FDA may permit an ANDA for a change in dosage form, route, strength, or one active ingredient in a combination, if it decides no new clinical studies are needed. Petitions are slow and frequently denied, and a denial pushes you to 505(b)(2) having lost the time. Plan the fallback before you file the petition.',
        zh: '一扇窄門。若 FDA 認定不需新的臨床研究，可允許就劑型、途徑、規格或複方中單一成分的變更提出 ANDA。此類請願審查緩慢且常被駁回，而駁回會把你推回 505(b)(2)，同時損失了時間。提出請願之前先規劃好備案。'
      },
      fee: 358247, feeLabel: 'GDUFA FY2026 ANDA application fee',
      typicalMonths: 54, clinicalCost: 2000000
    },
    r_anda_pk: {
      title: 'ANDA 505(j) — PK bioequivalence',
      body: {
        en: 'The conventional route: fasting and, where the label requires it, fed crossover studies with 90% confidence intervals for AUC and Cmax within 80.00–125.00%. Lower strengths may be waived on proportional similarity plus acceptable comparative dissolution. Cheapest and fastest — and precisely because of that, the most crowded.',
        zh: '常規路徑：空腹，以及在標示要求時的飯後交叉試驗，AUC 與 Cmax 的 90% 信賴區間須落在 80.00–125.00% 之內。低規格可依比例相似性加上可接受的比較性溶離申請 waiver。最便宜也最快——正因如此，也最擁擠。'
      },
      fee: 358247, feeLabel: 'GDUFA FY2026 ANDA application fee',
      typicalMonths: 36, clinicalCost: 1500000
    },
    r_anda_invitro: {
      title: 'ANDA 505(j) — in vitro bioequivalence',
      body: {
        en: 'The most valuable sentence in any PSG. If FDA will accept in vitro sameness — Q1/Q2 formulation identity plus a discriminating physicochemical package — you delete an entire clinical trial from the budget and the timeline. The cost migrates into analytical method development, reference-product characterisation, and reverse engineering. That is a trade a technically strong CDMO should take every time it is offered, because the resulting barrier keeps the field small.',
        zh: '任何 PSG 中最有價值的一句話。若 FDA 願意接受體外相同性——Q1/Q2 處方完全相同，加上具鑑別力的理化試驗組合——你就從預算與時程中刪掉了一整個臨床試驗。成本轉移到分析方法開發、參考產品特性鑑定與逆向工程。只要有人提供，技術型 CDMO 每次都該接受這筆交易，因為由此產生的門檻會讓賽道保持稀疏。'
      },
      fee: 358247, feeLabel: 'GDUFA FY2026 ANDA application fee',
      typicalMonths: 42, clinicalCost: 3500000
    },
    r_anda_clinical: {
      title: 'ANDA 505(j) — clinical endpoint bioequivalence',
      body: {
        en: 'A randomised, double-blind, placebo-controlled parallel trial in patients, powered to show equivalence on a clinical endpoint. Structurally a Phase 3 in everything but name, at a fraction of an NDA\'s price and none of its exclusivity. Where the PSG offers this as the alternative to an in vitro route, the whole programme economics turn on whether you can achieve Q1/Q2 sameness.',
        zh: '一項在病人身上進行的隨機、雙盲、安慰劑對照平行試驗，需有足夠檢定力證明臨床終點的等效性。除了名稱之外，結構上就是一個三期試驗，價格只是 NDA 的一小部分，且完全沒有專屬權。當 PSG 把它列為體外路徑的替代方案時，整個專案的經濟效益就取決於你能否達成 Q1/Q2 相同。'
      },
      fee: 358247, feeLabel: 'GDUFA FY2026 ANDA application fee',
      typicalMonths: 60, clinicalCost: 25000000
    },
    r_351k: {
      title: '351(k) — Biosimilar',
      body: {
        en: 'Analytical similarity first and heaviest, then PK/PD similarity, then a comparative clinical study only where residual uncertainty remains. There is no Orange Book and no PSG here; the reference product carries 12 years of exclusivity from first licensure and 4 years before an application may even be submitted. Patent disputes run through the BPCIA "patent dance" rather than Paragraph IV.',
        zh: '分析相似性最先也最重，其次是 PK/PD 相似性，最後只在仍有殘餘不確定性時才做比較性臨床試驗。這裡沒有 Orange Book 也沒有 PSG；參考產品自首次許可起享有 12 年專屬權，且前 4 年內連申請都不能提出。專利爭議循 BPCIA 的「專利之舞」而非 Paragraph IV。'
      },
      fee: 1200794, feeLabel: 'BsUFA FY2026, 351(k) with clinical data (600,397 without)',
      typicalMonths: 84, clinicalCost: 120000000
    },
    r_351k_ix: {
      title: '351(k) with interchangeability',
      body: {
        en: 'Everything in the biosimilar package, plus evidence that switching between the biosimilar and the reference product does not increase risk. The first interchangeable biosimilar for a given reference product earns its own period of exclusivity against later interchangeables. Higher bar, higher pharmacy-level substitution rate, higher price realisation.',
        zh: '生物相似性的全部內容，再加上「在生物相似藥與參考產品之間切換不會增加風險」的證據。針對特定參考產品的第一個可互換生物相似藥，可對後續的可互換產品取得自己的專屬期。門檻更高、藥局替換率更高、價格實現也更高。'
      },
      fee: 1200794, feeLabel: 'BsUFA FY2026, 351(k) with clinical data (600,397 without)',
      typicalMonths: 96, clinicalCost: 160000000
    }
  }
};

/* ---------- 2. Exclusivity catalogue (deck 5, slide 19) ------------------ */

const EXCLUSIVITIES = [
  { code: 'NCE', name: { en: 'New Chemical Entity', zh: '新化學實體' }, months: 60,
    note: { en: 'No ANDA may be submitted for 5 years — 4 years if the ANDA carries a Paragraph IV certification. This is a submission bar, not merely a marketing bar, and it is the single most schedule-critical date in generic planning.', zh: '5 年內不得提出 ANDA——若 ANDA 附 Paragraph IV 認證則為 4 年。這是「提交」的禁令而非僅是「上市」的禁令，也是學名藥規劃中最影響時程的一個日期。' } },
  { code: 'NCI', name: { en: 'New Clinical Investigation', zh: '新臨床研究' }, months: 36,
    note: { en: 'Three years for a new indication, new dosage form, new strength, or new route supported by new clinical work. Blocks approval of that specific change only — the rest of the molecule stays open.', zh: '新適應症、新劑型、新規格或新途徑，若有新的臨床研究支持，可得 3 年。僅阻擋該特定變更的核准——分子的其餘部分仍然開放。' } },
  { code: 'ODE', name: { en: 'Orphan Drug Exclusivity', zh: '孤兒藥專屬權' }, months: 84,
    note: { en: 'Seven years, tied to the designated rare-disease indication. Blocks approval of the same drug for the same indication regardless of application type.', zh: '7 年，綁定於指定的罕見疾病適應症。不論申請類型，均阻擋相同藥品用於相同適應症的核准。' } },
  { code: 'PED', name: { en: 'Pediatric Exclusivity', zh: '兒科專屬權' }, months: 6,
    note: { en: 'Six months bolted onto the tail of every existing patent and exclusivity for that active moiety. Small in duration, enormous in value — six months of brand pricing on a blockbuster routinely exceeds the cost of the paediatric study by two orders of magnitude.', zh: '6 個月，附加在該活性部分所有現存專利與專屬權的尾端。期間短，價值極大——暢銷藥多 6 個月的原廠定價，通常比兒科試驗成本高出兩個數量級。' } },
  { code: 'QIDP', name: { en: 'Qualified Infectious Disease Product (GAIN)', zh: '合格抗感染產品' }, months: 60,
    note: { en: 'Five additional years stacked on NCE or ODE for qualifying antibacterials and antifungals.', zh: '符合資格的抗菌與抗真菌藥品，可在 NCE 或 ODE 之上再疊加 5 年。' } },
  { code: 'PC180', name: { en: 'First-applicant 180-day exclusivity', zh: '首家申請者 180 天專屬權' }, months: 6,
    note: { en: 'The generic industry\'s own prize: 180 days of protection from subsequent ANDAs, awarded to the first substantially complete ANDA with a Paragraph IV certification. Forfeitable — failure to market within statutory deadlines loses it.', zh: '學名藥產業自己的獎品：首家提出實質完整且附 Paragraph IV 認證之 ANDA 者，可獲 180 天不受後續 ANDA 競爭的保護。可被沒收——未在法定期限內上市即喪失。' } },
  { code: 'CGT', name: { en: 'Competitive Generic Therapy', zh: '競爭性學名藥療法' }, months: 6,
    note: { en: '180 days for the first approved CGT where there is inadequate generic competition — designed to attract filers to small, unattractive markets.', zh: '在學名藥競爭不足時，首家獲核准的 CGT 可得 180 天——用意在吸引申請者進入小而不具吸引力的市場。' } },
  { code: 'NPP', name: { en: 'New Patient Population', zh: '新病人族群' }, months: 36,
    note: { en: 'Three years where approval extends the drug to a population never previously approved.', zh: '若核准將藥品擴及過去從未核准過的族群，可得 3 年。' } },
  { code: 'BLA12', name: { en: 'BLA reference product exclusivity', zh: 'BLA 參考產品專屬權' }, months: 144,
    note: { en: 'Twelve years from first licensure, with no 351(k) application accepted in the first four. The longest protection in the U.S. system.', zh: '自首次許可起 12 年，前 4 年內不受理任何 351(k) 申請。美國制度中最長的保護。' } }
];

/* ---------- 3. Cost model ------------------------------------------------ */

const FEES_FY2026 = {
  pdufaClinical: 4682003,
  pdufaNoClinical: 2341002,
  gdufaAnda: 358247,
  bsufaClinical: 1200794,
  bsufaNoClinical: 600397,
  note: {
    en: 'FY2026 statutory rates, effective 01-Oct-2025 through 30-Sep-2026, published in the Federal Register 30-Jul-2025. Program, facility, DMF and PLA fees are additional and are not modelled here.',
    zh: '2026 會計年度法定費率，自 2025-10-01 起至 2026-09-30 止，公告於 2025-07-30 聯邦公報。Program、廠房、DMF 與 PLA 費用另計，本模型未納入。'
  }
};

/* Price-erosion model. Erosion in a U.S. multi-source oral solid is driven by
   the NUMBER OF COMPETITORS, not by time. These coefficients are the widely
   cited approximate shape of the curve and should be treated as illustrative. */
function erodedPriceFraction(nCompetitors) {
  if (nCompetitors <= 0) return 1.00;
  if (nCompetitors === 1) return 0.61;
  if (nCompetitors === 2) return 0.46;
  if (nCompetitors === 3) return 0.34;
  if (nCompetitors === 4) return 0.26;
  if (nCompetitors <= 6) return 0.18;
  if (nCompetitors <= 9) return 0.12;
  return 0.08;
}
