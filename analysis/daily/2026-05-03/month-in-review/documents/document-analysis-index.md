<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📋 Document Analysis Index — April 2026 Month in Review

**Article Type:** month-in-review | **Period:** 2026-04-03 to 2026-05-03
**Methodology:** Document Classification + Procedural Tracking
**Confidence:** 🟢 High

---

## Primary Documents Analyzed

### Adopted Texts (April–May 2026)

| Reference | Title (Summary) | Type | Date | Significance |
|-----------|----------------|------|------|-------------|
| TA-10-2026-0092 | SRMR3 — Banking Resolution Reform | Legislative Act | Mar 26 | 🔴 Tier 1 — Banking Union completion |
| TA-10-2026-0094 | Anti-Corruption Framework | Legislative Act | Mar 26 | 🟠 Tier 2 — Rule of Law mechanism |
| TA-10-2026-0096 | US Tariff Retaliation Regulation | Legislative Act | Mar 26 | 🔴 Tier 1 — Trade defense |
| TA-10-2026-0088 | Braun Immunity Waiver | Institutional | Mar 26 | 🟡 Tier 2 — ECR integrity |
| TA-10-2026-0105 | Jaki Immunity Waiver | Institutional | Apr 28 | 🟡 Tier 2 — ECR integrity |
| TA-10-2026-0112 | 2027 Budget Guidelines | Institutional | Apr 28 | 🔴 Tier 1 — Budget cycle initiation |
| TA-10-2026-0115 | Dog-Cat Welfare Regulation | Legislative Act | Apr 28 | 🟢 Tier 3 — Animal welfare |
| TA-10-2026-0119 | EIB Annual Report | Resolution | Apr 28 | 🟡 Tier 2 — Investment intelligence |
| TA-10-2026-0122 | Performance-Based Instruments | Legislative Act | Apr 28 | 🟡 Tier 2 — Financial tools |
| TA-10-2026-0132 | CoR Discharge | Institutional | Apr 29 | 🟢 Tier 3 — Discharge |
| TA-10-2026-0142 | EU-Iceland PNR Agreement | International | Apr 29 | 🟡 Tier 2 — Security cooperation |
| TA-10-2026-0151 | Haiti Trafficking Resolution | Resolution | Apr 30 | 🟡 Tier 2 — Human rights |
| TA-10-2026-0160 | DMA Enforcement Mandate | Resolution | Apr 30 | 🔴 Tier 1 — Digital markets |
| TA-10-2026-0161 | Ukraine Accountability | Resolution | Apr 30 | 🟡 Tier 2 — Foreign policy |
| TA-10-2026-0162 | Armenia Democracy | Resolution | Apr 30 | 🟡 Tier 2 — Foreign policy |

### Parliamentary Questions (April 2026 — Sample)

31 parliamentary questions filed in the monitoring period (dateFrom: 2026-04-03, dateTo: 2026-05-03). Questions covered:
- Trade policy (5): US tariffs, EU retaliation framework, Section 232 scope
- Digital regulation (4): DMA implementation, AI Act secondary acts, DSA enforcement
- Defence (4): EDIS progress, NATO contribution alignment, dual-use export controls
- Environmental (3): Green Deal implementation status, CBAM phase-in
- Social (3): Wage transparency directive implementation, platform workers
- Other (12): Mixed portfolio (agriculture, migration, justice, institutional)

### Committee Documents Referenced

- ECON committee: SRMR3 rapporteur report (2024 filing) → adopted March 2026
- IMCO committee: DMA enforcement framework, DMA rapporteur follow-up
- INTA committee: US tariff retaliation regulation, EU-Mercosur CJEU opinion request
- JURI committee: Braun immunity case (March), Jaki immunity case (April)
- BUDG committee: Budget 2027 guidelines preparation, OWN resources dossier

---

## Data Quality Assessment

| Data Source | Status | Quality | Notes |
|------------|--------|---------|-------|
| `get_adopted_texts_feed(one-month)` | ✅ Available | 🟢 High | 347 texts returned; includes historical; 2026 texts filtered to 51 |
| `get_adopted_texts(year:2026)` | ✅ Available | 🟢 High | 51 texts; clean year filter; used as primary 2026 source |
| `get_plenary_sessions(dates)` | ⚠️ Partial | 🟡 Medium | 21 sessions returned; filteredTotal=0 (EP API date filter issue) |
| `get_events_feed(one-month)` | ❌ Unavailable | 🔴 Error | Upstream EP API error; no events data available |
| `get_speeches(dates)` | ✅ Available | 🟡 Medium | 20 speeches from April 27 only; earlier speeches unavailable |
| `get_voting_records(dates)` | ⚠️ Empty | 🟡 Expected | 4–6 week EP delay; April votes not yet published |
| `monitor_legislative_pipeline` | ⚠️ Empty | 🟡 Expected | Pipeline filter excludes unenriched records |
| `generate_political_landscape` | ✅ Available | 🟢 High | Full group composition; 719 MEPs; 9 groups |
| `early_warning_system` | ✅ Available | 🟢 High | Stability 84/100; MEDIUM risk |
| `analyze_coalition_dynamics` | ⚠️ Partial | 🟡 Medium | Cohesion null (API limitation); ENP and seat data good |
| `compare_political_groups` | ⚠️ Partial | 🟡 Medium | Performance scores zero (voting data unavailable) |
| `get_parliamentary_questions` | ✅ Available | 🟢 High | 31 questions; metadata complete |
| `get_all_generated_stats` | ✅ Available | 🟢 High | Historical stats 2004–2026; trend data rich |

**Overall data quality:** 🟡 MEDIUM-HIGH — Primary legislative data (adopted texts) is strong; events and detailed voting data limited by EP API constraints. Analysis has been appropriately caveated where data is unavailable.

---

## Document Analysis Summary

**Total documents analyzed:** 51 adopted texts + 31 parliamentary questions + 10 committee document references + 20 speeches = **112 parliamentary documents**

**Thematic concentration:**
- Economic/Institutional: 30% (SRMR3, DMA, budget, US tariffs)
- Foreign Policy/Security: 25% (Ukraine, Armenia, Haiti, EU-Iceland PNR)
- Environmental/Agriculture: 15% (Green Deal questions, dog-cat welfare)
- Digital/Technology: 15% (DMA, AI Act questions)
- Social/Justice: 10% (anti-corruption, trafficking, wage transparency)
- Institutional/Procedural: 5% (immunity waivers, CoR discharge)
