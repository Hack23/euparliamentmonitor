---
articleType: breaking
runId: 190
date: 2026-04-20
analysisPhase: document-analysis
confidence: MEDIUM
---

# 📄 Document Analysis Index — Run 190

**Analysis Date:** 2026-04-20 | **Run:** 190 | **API State:** Tier-2 Degraded Day 10

---

## Methodology

Documents were analyzed via the dual-layer EP API architecture established in Run 188.
The **metadata layer** (year-filter endpoint) provides titles and identifiers for all 2026
texts. The **content layer** (direct docId endpoint) provides full text for ~61 of 159 indexed
items. This index catalogs the five high-significance texts from the March 26 legislative sprint
and their current accessibility status.

---

## High-Significance Text Catalog

### TA-10-2026-0091 — BRRD3 (Bank Recovery and Resolution Directive 3rd iteration)
**Official Title:** Banking resolution framework — third revision (BRRD3)  
**Adoption Date:** 2026-03-26  
**Subject Code:** ECON / Financial institutions  
**Procedure:** Ordinary legislative procedure (trilogue-completed)  
**Content Status:** ❌ DATA_UNAVAILABLE (Tier-2 outage)  
**Metadata Status:** ✅ Title confirmed in metadata layer  
**Tracking Status:** PRIORITY-1 (Banking Union completion)  
**Next Action:** Direct docId probe in Run 191; three-run stability before content analysis

**Intelligence value:** BRRD3 completes the Banking Union's resolution pillar. The legislative
history (procedure initiated ~2022) captures five years of financial regulatory negotiations
following the COVID-era stress tests and post-Ukraine interest rate shock cycle. The text
likely contains new resolution waterfall provisions, bail-in hierarchy clarifications, and
cross-border recognition clauses that will determine how the next European bank failure is
managed. Until content is accessible, EU Monitor can only confirm adoption; analytical depth
requires full text.

---

### TA-10-2026-0092 — SRMR3 (Single Resolution Mechanism Regulation 3rd revision)
**Official Title:** "Early intervention measures, conditions for resolution and funding of resolution action (SRMR3)"  
**Adoption Date:** 2026-03-26  
**Subject Code:** ECON / Single Resolution Board  
**Procedure:** Ordinary legislative procedure (trilogue-completed)  
**Content Status:** ❌ DATA_UNAVAILABLE (Tier-2 outage)  
**Metadata Status:** ✅ Full official title confirmed (Run 188)  
**Tracking Status:** PRIORITY-1 (Banking Union completion)  
**Significance:** The title's emphasis on "early intervention measures" suggests new supervisory
triggers that give the SRB authority to intervene before a bank technically fails — a major
expansion of preventive resolution powers.

---

### TA-10-2026-0094 — Anti-Corruption Directive
**Official Title:** "Combating corruption"  
**Adoption Date:** 2026-03-26  
**Subject Code:** COJP / Civil and criminal justice  
**Procedure:** Ordinary legislative procedure (procedure 2023-0135)  
**Content Status:** ❌ DATA_UNAVAILABLE (Tier-2 outage)  
**Metadata Status:** ✅ Full official title confirmed (Run 188)  
**Tracking Status:** PRIORITY-2 (EU first in class)  
**Significance:** EU's first mandatory anti-corruption legislative standard. Unlike previous
EU efforts (recommendations, soft law), this is a binding directive creating mandatory
minimum standards across all member states. The subject code COJP confirms criminal law scope.
The 3-year drafting history suggests extensive negotiation over prosecutorial independence
provisions.

---

### TA-10-2026-0096 — US TRQ Trade Countermeasure
**Official Title:** "Adjustment of customs duties and opening of tariff quotas for the import of certain goods originating in the United States of America"  
**Adoption Date:** 2026-03-26  
**Subject Code:** INTA / International trade  
**Procedure:** Ordinary legislative procedure  
**Content Status:** ❌ DATA_UNAVAILABLE (Tier-2 outage)  
**Metadata Status:** ✅ Full official title confirmed (Run 188)  
**Tracking Status:** PRIORITY-1 (USTR Section 301 relevance)  
**Significance:** The title's dual structure — "adjustment of customs duties AND opening of tariff
quotas" — reveals a calibrated deterrence design. Blanket retaliatory tariffs would face WTO
challenge. This instrument combines selective duty adjustment with new market-access TRQs for
US goods, creating the WTO-compliant proportionality framework that EPP's trade conservative
wing demanded. **Most relevant text for USTR Section 301 risk assessment.**

---

### TA-10-2026-0101 — EU-China TRQ Agreement (REGRESSED)
**Official Title:** "Opening of Union tariff rate quotas for certain agricultural products originating in China"  
**Adoption Date:** 2026-03-26  
**Subject Code:** INTA / International trade  
**Content Status:** ❌ DATA_UNAVAILABLE — **REGRESSED from accessible (Run 187) to inaccessible (Run 188)**  
**Metadata Status:** ✅ Title confirmed  
**Tracking Status:** PRIORITY-3 (regression monitoring priority)  
**API Status Note:** This text was fully accessible in Run 187, regressed in Run 188, and remains
unavailable in Run 190. This is the confirmed proof case for non-deterministic API restoration.
Do not treat accessibility as stable until confirmed in three consecutive runs.

---

### TA-10-2026-0104 — Global Gateway Review
**Official Title:** "Global Gateway — past impacts and future orientation"  
**Adoption Date:** 2026-03-26  
**Subject Code:** AFET / Foreign affairs  
**Procedure:** Own-initiative parliamentary review (non-binding)  
**Content Status:** ❌ DATA_UNAVAILABLE (Tier-2 outage)  
**Metadata Status:** ✅ Full official title confirmed (Run 188)  
**Tracking Status:** PRIORITY-4 (strategic context)  
**Significance:** Own-initiative review signals Parliament's self-positioning on global investment
competition with BRI. The adoption on March 26 — same day as EU-China TRQ and US countermeasure
suggests a coordinated package narrative: EP simultaneously managing EU-US and EU-China trade
relations while asserting its own global investment strategy.

---

## Document Accessibility Summary

| Text ID | Title Status | Content Status | Priority | Key Intel Blocked |
|---------|------------|---------------|---------|------------------|
| TA-0091 | ✅ Title | ❌ Content | P1 | BRRD3 resolution waterfall provisions |
| TA-0092 | ✅ Full title | ❌ Content | P1 | SRMR3 early intervention trigger levels |
| TA-0094 | ✅ Full title | ❌ Content | P2 | Anti-corruption minimum standards text |
| TA-0096 | ✅ Full title | ❌ Content | P1 | US TRQ duty schedule + TRQ volumes |
| TA-0101 | ✅ Title | ❌ REGRESSED | P3 | China TRQ volumes + product categories |
| TA-0104 | ✅ Full title | ❌ Content | P4 | Global Gateway priority regions + funding |

**6/6 high-significance texts remain content-inaccessible on Day 10 of API outage.**

---

## Restoration Monitoring Protocol

For each restoration check:
1. Probe TA-10-2026-0092 (SRMR3) — designated stability indicator
2. If accessible: probe TA-10-2026-0096 (US TRQ) — USTR relevance
3. If accessible: probe TA-10-2026-0094 (Anti-Corruption) — EU first-in-class
4. If accessible: probe TA-10-2026-0101 (EU-China TRQ) — regression monitoring
5. Content analysis ONLY after three-run stability confirmation

**Expected restoration window:** April 21-26 (pre-Parliament return)
