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
