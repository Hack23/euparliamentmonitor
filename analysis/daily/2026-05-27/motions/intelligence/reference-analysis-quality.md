<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🏆 Reference Analysis Quality — EP Motions | 2026-05-27

**Run ID:** motions-run276-1779868581 | **Article Type:** motions | **Date:** 2026-05-27
**Data Mode:** `degraded-voting` | **Admiralty Grade:** A1

---

## 🎯 Purpose

Self-assessment of analysis quality against EU Parliament Monitor standards. Tradecraft quality signals, depth evaluation, and improvement roadmap.

---

## 📊 Quality Scorecard

| Dimension | Score (0–10) | Target | Status |
|-----------|-------------|--------|--------|
| Data sourcing accuracy | 8.5 | ≥7 | 🟢 PASS |
| Evidence citation density | 7.5 | ≥7 | 🟢 PASS |
| Political group attribution | 6.5 | ≥7 | 🟡 MARGINAL |
| Named MEP specificity | 6.0 | ≥7 | 🟡 MARGINAL |
| Quantitative evidence | 6.5 | ≥7 | 🟡 MARGINAL |
| Temporal horizon coverage | 8.5 | ≥7 | 🟢 PASS |
| Mermaid diagrams present | 5 of 5 required | ≥4 | 🟢 PASS |
| Confidence labelling | Complete | Required | 🟢 PASS |
| Cross-references | Complete | Required | 🟢 PASS |
| IMF economic context | Reference data used | Live data preferred | 🟡 MARGINAL |

**Overall quality score: 7.2/10 — PASS (degraded-voting context)**

---

## 🔴 Known Quality Limitations

### L1: No Roll-Call Vote Data (DOCEO lag)
**Severity:** 🟠 HIGH
**Affected artifacts:** `intelligence/voting-patterns.md`, `intelligence/voting-patterns.degraded.md`, stakeholder map cohesion estimates, all political group attribution
**Mitigation:** All voting behavior inferences clearly labelled as estimates; confidence grades reflect uncertainty; `degraded-voting` data mode declared throughout

### L2: Named MEP Specificity for May Rapporteurs
**Severity:** 🟡 MEDIUM
**Affected artifacts:** Stakeholder map, deep analysis, synthesis summary
**Description:** Specific rapporteur names for TA-10-2026-0183 (AI-trade) and TA-10-2026-0180 (SAFE) could not be confirmed from the EP Open Data Portal in this run (committee documents feed degraded; procedures feed degraded). Named MEPs referenced (Lange, Loiseau, Gahler, Ferber, Hahn) are established stakeholders in their domains based on EP10 committee assignments, but specific rapporteur confirmation requires the procedures/committee-documents endpoint.
**Mitigation:** Named MEPs are described as "known stakeholders" rather than confirmed rapporteurs where certainty is lacking.

### L3: Live IMF Data Absent
**Severity:** 🟡 MEDIUM
**Affected artifacts:** Economic context, PESTLE economic dimension
**Mitigation:** IMF WEO April 2026 public reference data used; figures are directionally accurate for the analysis horizon.

---

## 🟢 Quality Strengths

### S1: Comprehensive Thematic Coverage
All five thematic clusters from the May 19–20 session are analyzed: AI-trade governance, defence-industrial cooperation, fisheries partnerships, Uzbekistan external partnership, and parliamentary immunity proceedings.

### S2: Deep Historical Contextualization
The `intelligence/historical-baseline.md` artifact provides genuine EP9–EP10 comparative analysis, including precedent analysis for each major motion category.

### S3: Structured Scenario Analysis
Three major scenario sets (AI-trade, SAFE, Uzbekistan) with probability weighting and trigger conditions — above the minimum requirement for motions-type analysis.

### S4: Geopolitical Intelligence Depth
The PESTLE and threat model artifacts engage seriously with Russia-Ukraine war context, US-EU AI trade tensions, China competition, and Central Asian geopolitics — not just surface-level description of EP procedures.

---

## 📈 Tradecraft Quality Signals (TQS)

Per `analysis/methodologies/reference-quality-thresholds.json`, the following TQS are confirmed present:

| Signal | Status | Evidence |
|--------|--------|---------|
| WEP (Weighted Evidence Probability) banding | ✅ Present | All scenarios have probability estimates |
| Admiralty grades | ✅ Present | All artifacts carry A1–C3 grades |
| Color-coded confidence labels | ✅ Present | 🟢/🟡/🔴 throughout |
| Mermaid diagrams | ✅ Present | 5 diagrams across artifacts |
| SAT (Structured Analytic Technique) count | 7 techniques applied | Target ≥ 10 — see below |
| Cross-artifact citations | ✅ Present | All major artifacts cross-referenced |

**SAT techniques applied:**
1. Competing hypotheses (scenario forecast)
2. Linchpin analysis (threat model critical threats)
3. PESTLE framework
4. Actor mapping (stakeholder map)
5. Black swan analysis (wildcards)
6. Historical precedent analysis (historical baseline)
7. Decision tree / scenario tree (scenario forecast quadrant chart)

**SAT target (≥10): 3 additional techniques recommended for Pass 2:**
8. Red-team analysis of EP motion implementation
9. Assumption validation for SAFE Instrument constitutionality
10. Key indicator tracking for Uzbekistan conditionality

---

*Reference Analysis Quality — EU Parliament Monitor | Run: motions-run276-1779868581*
*Self-assessment confidence: 🟢 HIGH | Score: 7.2/10 PASS*

---

## 🔍 Extended Reference Quality Assessment

### Source Hierarchy and Reliability Grades

**Tier 1 — Authoritative (Admiralty A1):**
- EP adopted-texts-feed.json: Official EP Open Data Portal; verified government source
- EP meps-feed.json: Official EP membership data; authoritative for current MEP information
- EP plenary session documents: Official record when available

**Tier 2 — High Reliability (Admiralty A2):**
- IMF World Economic Outlook (April 2026): Authoritative international economic reference
- WTO technical documentation: Official international trade law reference
- EPRS Research Service analysis: Independent professional analytical body
- European Defence Agency publications: Official EU defence data

**Tier 3 — Reliable Inference (Admiralty B2):**
- Historical EP voting pattern analysis: Derived from DOCEO archive data; high internal consistency
- Political group stated positions: Public political communication; reliable for group-level analysis
- EP committee deliberation records: When available through documents feed

**Tier 4 — Structural Analysis (Admiralty B3):**
- Voting behavior estimates: Structural inference from group size + historical patterns; no observed data
- Implementation probability estimates: Expert judgment + historical base rates
- Media framing analysis: Pattern-based prediction; moderate reliability

### Reference Gap Analysis

**Critical gaps:**
1. **Rapporteur identification (JURI, INTA, AFET):** Without procedures and documents feeds, specific rapporteurs cannot be confirmed. This is the most significant reference quality gap.
2. **Vote tallies:** DOCEO lag means FOR/AGAINST/ABSTAIN exact counts unavailable
3. **Committee deliberation detail:** Specific JURI immunity opinions' reasoning not available

**Quality ceiling:** This run's reference quality is capped at "ADEQUATE for political intelligence, INADEQUATE for parliamentary accountability journalism" due to the DOCEO lag and degraded feeds. This is documented in data-availability-assessment.md.

### Reference Quality Score by Artifact Category

| Category | Score | Gap |
|----------|-------|-----|
| Motion content analysis | 9.5/10 | Minimal — adopted text content is primary source |
| Political group analysis | 7.8/10 | Moderate — structural inference compensates |
| Voting behavior | 3.5/10 | HIGH — DOCEO lag is binding constraint |
| Economic context | 8.5/10 | Minimal — IMF WEO is authoritative |
| Geopolitical context | 8.0/10 | Low — well-established analytical framework |
| Procedural context | 5.5/10 | Moderate-high — procedures feed degraded |

---

*Reference Analysis Quality — EU Parliament Monitor | Run: motions-run276-1779868581 [extended]*
