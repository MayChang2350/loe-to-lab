/* ============================================================================
   jurisdictions.js — FDA / EMA / TFDA context layer
   ----------------------------------------------------------------------------
   HONESTY NOTE: the interactive decision tree in section 2 (PATHWAY_TREE) is
   built from FDA statute and stays FDA-only — reproducing the EMA centralised/
   decentralised procedure or TFDA's registration process at the same
   node-by-node decision-tree depth is a separate research project. What this
   file adds instead is a LIGHTER layer: pick a jurisdiction and get that
   agency's real name, review body, generic/biosimilar route terminology, and
   a short, honestly-scoped note on how it maps to the FDA tree above it —
   plus links to each agency's own official guidance, not fabricated ones.
   ========================================================================== */

const JURISDICTIONS = {
  FDA: {
    id: 'FDA',
    name: { en: 'United States — FDA', zh: '美國——FDA' },
    agency: { en: 'U.S. Food and Drug Administration', zh: '美國食品藥物管理局' },
    body: { en: 'Center for Drug Evaluation and Research (CDER)', zh: 'Center for Drug Evaluation and Research（CDER）' },
    genericRoute: { en: 'ANDA under FD&C Act §505(j), or 505(b)(2) for a changed NDA', zh: '依 FD&C Act §505(j) 之 ANDA，或用於變更型 NDA 的 505(b)(2)' },
    biosimRoute: { en: 'PHS Act §351(k) biosimilar / interchangeable pathway', zh: 'PHS Act §351(k) 生物相似藥／可互換途徑' },
    guidanceName: { en: 'Product-Specific Guidances (PSG)', zh: '產品專屬指引（PSG）' },
    form: {
      en: 'eCTD submission via the FDA Electronic Submissions Gateway (ESG), built around Form FDA 356h — the same cover form used for NDA, ANDA and BLA filings.',
      zh: '透過 FDA 電子送件閘道（ESG）以 eCTD 格式送件，以 FDA 356h 表格為核心——NDA、ANDA 與 BLA 均使用同一份封面表格。'
    },
    timeline: {
      en: 'GDUFA III goal: 10 months from submission for a standard original ANDA, 8 months if priority-eligible. NDA/BLA: 10–12 months standard review, 6–8 months priority. These are review-GOAL dates, not guarantees — a Complete Response Letter resets the clock.',
      zh: 'GDUFA III 目標：標準原始 ANDA 自送件起 10 個月，符合優先資格則 8 個月。NDA／BLA：標準審查 10–12 個月，優先審查 6–8 個月。這些是審查「目標」日期，不是保證——收到 Complete Response Letter 會使時鐘重新起算。'
    },
    approvalOdds: {
      en: 'Uneven by route. Novel-drug (NDA) applications have cleared in a single review cycle roughly 75–85% of the time in recent annual reports. Generic (ANDA) first-cycle approval is the exception rather than the rule — GAO found only about 12% of ANDAs historically cleared on the first cycle, though FDA has since added pre-submission communication tools to narrow that gap. Budget for at least one review cycle either way.',
      zh: '因路徑而異。近年年報顯示，新藥（NDA）申請約有 75–85% 於單一審查週期內過關。學名藥（ANDA）首週期核准則是例外而非常態——GAO 的研究發現歷來僅約 12% 的 ANDA 於首週期通過，儘管 FDA 之後已增加送件前溝通機制以縮小差距。無論哪條路徑，都應以至少一個審查週期來編列時程。'
    },
    contact: {
      en: 'Office of Generic Drugs (ANDA / 505(b)(2)): genericdrugs@fda.hhs.gov, +1 240-402-7920. General CDER questions: druginfo@fda.hhs.gov. Once an application is filed, the assigned regulatory project manager is the primary point of contact.',
      zh: '學名藥辦公室（ANDA／505(b)(2)）：genericdrugs@fda.hhs.gov，+1 240-402-7920。CDER 一般諮詢：druginfo@fda.hhs.gov。案件送件後，主要聯絡窗口為指派的 regulatory project manager。'
    },
    pathwayQ: {
      q: { en: 'Under which statute was the reference product approved?', zh: '參考產品當初是依哪一部法律核准的？' },
      opts: [
        { label: { en: 'FD&C Act §505 — it has an NDA number and appears in the Orange Book', zh: 'FD&C Act §505——有 NDA 案號，且列於 Orange Book' } },
        { label: { en: 'PHS Act §351(a) — it has a BLA number and appears in the Purple Book', zh: 'PHS Act §351(a)——有 BLA 案號，且列於 Purple Book' } },
        { label: { en: 'There is no approved reference product — this is a new molecular entity', zh: '沒有已核准的參考產品——這是新分子實體' } }
      ]
    },
    note: {
      en: 'This is the pathway this whole module is built from (internship decks 8–9, NDA/ANDA/BLA regulation). The decision tree in section 2 is FDA-specific — use it directly.',
      zh: '本模組即以此路徑建構而成（實習教材第 8–9 講，NDA／ANDA／BLA 法規）。第 2 節的決策樹即為 FDA 專屬版本——可直接使用。'
    },
    links: [
      { t: 'Orange Book — Approved Drug Products with Therapeutic Equivalence Evaluations', u: 'https://www.accessdata.fda.gov/scripts/cder/ob/index.cfm' },
      { t: 'Product-Specific Guidances for Generic Drug Development', u: 'https://www.accessdata.fda.gov/scripts/cder/psg/index.cfm' },
      { t: 'Purple Book (biosimilars / 351(k))', u: 'https://purplebooksearch.fda.gov/' },
      { t: 'Generic Drug User Fee Rates, FY2026', u: 'https://www.federalregister.gov/documents/2025/07/30/2025-14411/generic-drug-user-fee-rates-for-fiscal-year-2026' }
    ]
  },
  EMA: {
    id: 'EMA',
    name: { en: 'European Union — EMA', zh: '歐盟——EMA' },
    agency: { en: 'European Medicines Agency', zh: '歐洲藥品管理局' },
    body: { en: 'Committee for Medicinal Products for Human Use (CHMP)', zh: '人用藥品委員會（CHMP）' },
    genericRoute: { en: 'Generic application under Directive 2001/83/EC Art. 10(1), via the centralised, decentralised, mutual-recognition or national procedure', zh: '依 Directive 2001/83/EC 第 10(1) 條之學名藥申請，經集中、去中心化、相互承認或國家程序辦理' },
    biosimRoute: { en: 'Biosimilar application under Directive 2001/83/EC Art. 10(4)', zh: '依 Directive 2001/83/EC 第 10(4) 條之生物相似藥申請' },
    guidanceName: { en: 'Product-Specific Bioequivalence Guidance', zh: '產品專屬生體相等性指引' },
    form: {
      en: 'eCTD dossier submitted via the Common European Submission Platform (CESP) or IRIS, built around EU Module 1 and an EU-specific electronic Application Form (eAF) — there is no single cover form equivalent to FDA Form 356h.',
      zh: '透過 Common European Submission Platform（CESP）或 IRIS 送出 eCTD 資料，以歐盟 Module 1 與歐盟專屬的電子申請表（eAF）為核心——並無類似 FDA 356h 的單一封面表格。'
    },
    timeline: {
      en: 'Centralised-procedure evaluation runs up to 210 active days, excluding clock stops while the applicant prepares responses — so a generic/hybrid application typically takes well over a year of calendar time once clock stops are counted in.',
      zh: '集中程序的評估期上限為 210 個工作天，不含申請人準備回覆期間的「時鐘暫停」——因此計入時鐘暫停後，學名藥／混合型申請的實際日曆時間通常遠超過一年。'
    },
    approvalOdds: {
      en: 'This module does not have EMA-specific first-cycle approval-rate data verified to the same standard as the FDA figures above — treat that as a gap, not a zero, and check EMA\'s own annual reports for the current benchmark by procedure type.',
      zh: '本模組尚未取得與上方 FDA 數據同等查核標準的 EMA 專屬首週期核准率資料——請將此視為資料缺口而非數值為零，並查閱 EMA 自身年報以取得依程序類型分類的最新基準。'
    },
    contact: {
      en: 'There is no single applicant contact through a centralised procedure — correspondence runs through your assigned Rapporteur and the CHMP. For general enquiries, use EMA\'s public enquiries channel at ema.europa.eu.',
      zh: '集中程序並無單一申請人聯絡窗口——所有往來透過指派的 Rapporteur 與 CHMP 進行。一般諮詢請使用 ema.europa.eu 上的公眾諮詢管道。'
    },
    pathwayQ: {
      q: { en: 'Under which EU legal basis will the reference product\'s authorisation be relied upon?', zh: '將依歐盟哪一項法律依據來援引參考產品的許可？' },
      opts: [
        { label: { en: 'Full/mixed application (Art. 8(3)) — not relying on a reference product, or only partly', zh: '完整／混合型申請（第 8(3) 條）——不依賴或僅部分依賴參考產品' } },
        { label: { en: 'Generic or hybrid application (Art. 10(1) / 10(3))', zh: '學名藥或混合型申請（第 10(1)／10(3) 條）' } },
        { label: { en: 'Biosimilar application (Art. 10(4))', zh: '生物相似藥申請（第 10(4) 條）' } }
      ]
    },
    note: {
      en: 'The rough FDA-to-EU equivalence: an ANDA-style generic maps to an Art. 10(1) generic application, and product-specific bioequivalence guidance plays a similar role to a PSG. Data/market exclusivity periods, the review body, and procedural steps differ in ways this module does not model — treat this as orientation, not a substitute for EMA\'s own procedural guides linked below.',
      zh: '概略對應關係：ANDA 型學名藥對應歐盟第 10(1) 條學名藥申請，產品專屬生體相等性指引則扮演類似 PSG 的角色。資料／市場專屬權期間、審查機構與程序步驟均有本模組未建模的差異——請將此視為方向性說明，而非 EMA 自身程序指引的替代品（連結見下）。'
    },
    links: [
      { t: 'Pre-authorisation guidance (EMA)', u: 'https://www.ema.europa.eu/en/human-regulatory-overview/marketing-authorisation/pre-authorisation-guidance' },
      { t: 'Product-specific bioequivalence guidance', u: 'https://www.ema.europa.eu/en/human-regulatory-overview/research-and-development/scientific-guidelines/clinical-pharmacology-and-pharmacokinetics/product-specific-bioequivalence-guidance' },
      { t: 'Procedural advice for centralised generic/hybrid applications (PDF)', u: 'https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/european-medicines-agency-procedural-advice-users-centralised-procedure-generic-hybrid-applications_en.pdf' }
    ]
  },
  TFDA: {
    id: 'TFDA',
    name: { en: 'Taiwan — TFDA', zh: '台灣——TFDA' },
    agency: { en: 'Taiwan Food and Drug Administration (Ministry of Health and Welfare)', zh: '衛生福利部食品藥物管理署' },
    body: { en: 'Center for Drug Evaluation (CDE), Taiwan — conducts technical review for TFDA', zh: '財團法人醫藥品查驗中心（CDE）——為 TFDA 執行技術審查' },
    genericRoute: { en: 'Generic drug license application (學名藥查驗登記), identical active ingredient/dosage form/content/efficacy to an already-approved reference product', zh: '學名藥查驗登記，成分、劑型、含量與療效須與已核准之對照藥品相同' },
    biosimRoute: { en: 'Biosimilar registration pathway (生物相似性藥品)', zh: '生物相似性藥品查驗登記' },
    guidanceName: { en: 'CDE technical guidance documents (largely harmonised with ICH)', zh: 'CDE 技術性指引文件（大致與 ICH 調和）' },
    form: {
      en: '藥品查驗登記申請書 (Drug License Application) in Taiwan-specific CTD format. A foreign sponsor must appoint a Taiwan License Holder to file and hold the resulting license.',
      zh: '以台灣專屬 CTD 格式提出「藥品查驗登記申請書」。境外藥廠須委任台灣藥證持有人代為送件並持有藥證。'
    },
    timeline: {
      en: 'Center for Drug Evaluation (CDE) technical review: roughly 200 days for a generic dossier without new clinical efficacy/safety data, roughly 300 days if clinical data is required — before TFDA\'s own administrative processing on top.',
      zh: '財團法人醫藥品查驗中心（CDE）技術審查：不含新臨床療效／安全性資料的學名藥約 200 天，需臨床資料者約 300 天——此外還有 TFDA 自身的行政作業時間。'
    },
    approvalOdds: {
      en: 'This module does not have published TFDA first-cycle approval-rate statistics verified to the same standard as the FDA figures above — ask CDE directly (contact below) for current review-outcome benchmarks rather than assuming a number here.',
      zh: '本模組尚未取得與上方 FDA 數據同等查核標準的 TFDA 首週期核准率公開統計——請直接向 CDE 洽詢（見下方聯絡方式）取得目前的審查結果基準，而非在此假設一個數字。'
    },
    contact: {
      en: 'Center for Drug Evaluation (CDE) International: CDEinternational@cde.org.tw, +886 2 8170 6000. A Pre-ANDA-style meeting with CDE can resolve filing/format questions before submission.',
      zh: '財團法人醫藥品查驗中心（CDE）國際事務：CDEinternational@cde.org.tw，+886 2 8170 6000。送件前可與 CDE 安排會議，先行釐清送件與格式問題。'
    },
    pathwayQ: {
      q: { en: 'Which Taiwan registration category applies, relative to any approved reference product?', zh: '相對於已核准的對照藥品，適用哪一種台灣藥證分類？' },
      opts: [
        { label: { en: 'New drug (新藥) — no approved reference product in Taiwan', zh: '新藥——台灣尚無已核准的對照藥品' } },
        { label: { en: 'Generic drug (學名藥) — same active ingredient, dosage form, content and efficacy as an approved reference product', zh: '學名藥——成分、劑型、含量與療效與已核准之對照藥品相同' } },
        { label: { en: 'Biosimilar (生物相似性藥品)', zh: '生物相似性藥品' } }
      ]
    },
    note: {
      en: 'TFDA licenses are valid for five years and require a Taiwan License Holder for foreign sponsors. TFDA guidance leans heavily on ICH harmonisation, so much of the CQA/analytical thinking in this module transfers directly — but the application route, review body (CDE performs technical review, TFDA grants the license) and fee/timeline structure are distinct from both the FDA and EMA models above and are not built out here.',
      zh: 'TFDA 藥證效期為五年，境外藥廠須委任台灣藥證持有人。TFDA 指引高度依循 ICH 調和原則，因此本模組中大部分 CQA／分析思路可直接沿用——但申請途徑、審查機構（CDE 執行技術審查、TFDA 核發藥證）與費用／時程結構，均與上述 FDA 及 EMA 模型不同，本模組未針對此另行建模。'
    },
    links: [
      { t: 'TFDA official site (English)', u: 'https://www.fda.gov.tw/EN/index.aspx' },
      { t: 'Center for Drug Evaluation, Taiwan (CDE)', u: 'https://www.cde.org.tw/' },
      { t: 'Taiwan drug approval process — Ministry of Health and Welfare', u: 'https://www.mohw.gov.tw/cp-115-36753-2.html' }
    ]
  }
};

const JURISDICTION_ORDER = ['FDA', 'EMA', 'TFDA'];
