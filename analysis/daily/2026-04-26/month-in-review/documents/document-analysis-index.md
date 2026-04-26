<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EU Parliament Month in Review: March 27 – April 26, 2026

**Framework:** Legislative Document Classification + Policy Network Analysis  
**Confidence:** 🟢 High (sourced from official EP records)  

---

## Primary Documents Analyzed

### Adopted Texts — March 26, 2026 Plenary

| Document ID | Title Summary | Type | Significance |
|------------|--------------|------|-------------|
| TA-10-2026-0090 | DGSD2 — Deposit Guarantee Schemes Dir. (revision) | Legislative | Tier 1 |
| TA-10-2026-0091 | BRRD3 — Bank Recovery and Resolution Dir. (revision) | Legislative | Tier 1 |
| TA-10-2026-0092 | SRMR3 — Single Resolution Mechanism Reg. (revision) | Legislative | Tier 1 |
| TA-10-2026-0094 | Anti-Corruption Directive | Legislative | Tier 2 |
| TA-10-2026-0096 | Tariff adjustment — US response | Legislative | Tier 2 |
| TA-10-2026-0098 | AI Act Omnibus — simplification | Legislative | Tier 1 |

### Adopted Texts — March 11-12, 2026 Plenary

| Document ID | Title Summary | Type | Significance |
|------------|--------------|------|-------------|
| TA-10-2026-0058 | EU Talent Pool — skilled migration | Legislative | Tier 2 |
| TA-10-2026-0064 | Housing Crisis Resolution | Non-legislative | Tier 3 |
| TA-10-2026-0066 | AI Copyright — creative sector | Legislative | Tier 3 |
| TA-10-2026-0071 | CoE AI Convention ratification | International | Tier 2 |
| TA-10-2026-0074 | Gender Pay Gap Transparency | Legislative | Tier 3 |
| TA-10-2026-0075 | European Semester — Economic | Non-legislative | Tier 3 |
| TA-10-2026-0076 | European Semester — Social | Non-legislative | Tier 3 |
| TA-10-2026-0077 | EU Enlargement Strategy | Non-legislative | Tier 3 |
| TA-10-2026-0079 | Defence Single Market Resolution | Non-legislative | Tier 2 |
| TA-10-2026-0080 | Flagship Defence Projects Resolution | Non-legislative | Tier 2 |
| TA-10-2026-0086 | WTO MC14 position | Non-legislative | Tier 3 |

---

## Document Analysis by Policy Cluster

### Cluster A: Financial Stability (0090+0091+0092)
**Network centrality:** HIGHEST — Banking Union package interconnected; SRMR3 depends on BRRD3 resolution trigger framework which depends on DGSD2 depositor protection  
**Cross-references identified:** SRMR3 references BRRD3 §6 for early intervention trigger conditions; DGSD2 references SRMR3 §18 for interoperability of guarantee and resolution funds  
**Legislative chain:** These three must be implemented as a coherent package by national authorities

### Cluster B: AI Governance (0071+0098+0066)
**Network centrality:** HIGH — AI Act Omnibus domestically + CoE Convention internationally + copyright AI cross-sector  
**Cross-references:** AI Act Article 53 (GPAI obligations) referenced in copyright text; CoE Convention Article 5 (accountability) consistent with but not identical to AI Act Annex III high-risk categories  
**Legislative chain:** National transposition of AI Act implementation measures must be consistent with CoE Convention obligations

### Cluster C: Economic Sovereignty (0096+0086)
**Network centrality:** MEDIUM — Tariff adjustment response + WTO multilateral position function as complementary instruments  
**Strategic coherence:** High — bilateral defensive capacity (0096) + multilateral preference (0086) represents effective two-track trade strategy

---

## Data Quality Assessment (EP API Source)

| Data Type | Source | Completeness | Reliability |
|-----------|--------|:------------:|:-----------:|
| Adopted texts metadata | EP Open Data Portal feed | 🟢 HIGH | 🟢 CONFIRMED |
| Vote counts (for/against) | EP MCP get_voting_records | 🔴 EMPTY (lag) | N/A |
| Plenary sessions | EP MCP get_plenary_sessions | 🟢 HIGH | 🟢 CONFIRMED |
| Parliamentary questions | EP MCP get_parliamentary_questions | 🟡 PARTIAL | 🟡 PROBABLE |
| Procedures | EP MCP get_procedures | 🔴 UNFILTERED | 🟡 PARTIAL |

**Net data quality for this analysis period:** 🟡 MEDIUM — Key gap is voting records (4-6 week publication lag), limiting quantitative vote analysis.
