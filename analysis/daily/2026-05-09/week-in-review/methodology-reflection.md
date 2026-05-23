<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — Week in Review (3 Apr – 1 May 2026)

**Purpose:** Step 10.5 of the 10-step AI-Driven Analysis Protocol. Self-critical assessment of methodology quality, data sufficiency, analytical limitations, and confidence calibration for this run.

---

## Protocol Compliance Assessment

### Step Completion Status

| Step | Description | Status | Quality |
|---|---|---|---|
| Step 1: Scope definition | Week-in-review, D-36→D-8 window | ✅ Complete | 🟢 |
| Step 2: Data collection (Stage A) | EP MCP tool calls, multiple sources | ✅ Complete | 🟡 (voting gap) |
| Step 3: Source assessment | MCP reliability audit filed | ✅ Complete | 🟢 |
| Step 4: Pattern identification | Coalition, legislative, geopolitical patterns | ✅ Complete | 🟢 |
| Step 5: Causal analysis | Forces analysis, PESTLE, stakeholder map | ✅ Complete | 🟢 |
| Step 6: Scenario development | 3 scenarios with probability weights | ✅ Complete | 🟢 |
| Step 7: Risk assessment | Risk matrix (7 items), SWOT, capital risk, velocity risk | ✅ Complete | 🟢 |
| Step 8: Synthesis | Synthesis summary + impact matrix | ✅ Complete | 🟢 |
| Step 9: Quality gate (Stage C) | Agent-side completeness check | ✅ Complete | 🟢 |
| Step 10: Article generation | CLI deterministic render | ✅ Complete | 🟢 |
| Step 10.5: Methodology reflection | This document | ✅ Complete | 🟢 |

---

## Analytical Strengths

**1. Comprehensive artifact coverage**
This run produced 20 distinct analysis artifacts covering PESTLE, stakeholder mapping, scenario forecasting, coalition dynamics, historical baseline, risk matrix, SWOT, forces analysis, impact matrix, threat landscape, wildcards, synthesis, economic context, MCP audit, political capital risk, legislative velocity risk, document index, and methodology reflection. Coverage is materially broader than minimum requirements.

**2. Coalition mathematics rigour**
EPP+S&D+Renew=396 majority (above 360 threshold); EPP+S&D=319 (below threshold) — these structural facts are correctly applied throughout all political analysis. No coalition arithmetic errors detected in Pass 2 review.

**3. Historical contextualisation depth**
Historical baseline covers EP9 vs. EP10 structural comparison, 5 historical parallels (EU-US trade 2018, DMA Brussels Effect, Banking Union political economy, Ukraine solidarity, far-right surge), and forward trajectory projection. This provides genuine analytical context rather than surface-level comparison.

**4. Confidence labelling consistency**
All claims are labelled with confidence signals (🟢 HIGH / 🟡 Medium / 🔴 LOW) reflecting data source quality. Inferred claims (from structural data rather than vote-level verification) are consistently flagged.

**5. Threat calibration**
Threat tier structure (Tier 1/2/3 by score), ACH methodology for top threats, consequence trees, and OSINT signal identification provide a multi-layered threat assessment that goes beyond simple risk listing.

---

## Analytical Limitations

**1. Voting data absence (PRIMARY LIMITATION)**
The fundamental constraint in this run is the absence of roll-call voting data. EP publishes voting data 2–6 weeks after the sitting. For the April 28-30 Strasbourg session (the most significant plenary of the review period), both individual MEP votes and aggregate vote counts are unavailable. This means:
- Group cohesion scores are structural inferences, not vote-count verified
- Within-group dissent cannot be quantified (only qualitatively estimated)
- Specific amendment outcomes and margins are unknown
- The "cross-partisan" characterisations of immunity waiver votes are historically consistent with EP practice but not data-verified for April 2026

**Confidence impact:** Reduces confidence in "coalition alignment" and "group voting behaviour" sections from 🟢 HIGH to 🟡 Medium throughout.

**Recommended action for future runs:** Shift analysis window to D-14 minimum cutoff, or supplement MCP data with EP press release scraping.

**2. Individual adopted text content unavailability**
All April 28-30 texts (0160–0165) returned 404. Analysis of their specific legislative content is therefore based on:
- Title metadata
- EP speech context (April 27 debates preceding votes)
- Committee report references
- Historical legislative pattern inference

This is adequate for significance classification but insufficient for detailed textual analysis (amendment-by-amendment tracking, specific legislative changes documented).

**3. IMF real-time data unverified**
Economic context artifact uses published IMF staff reports rather than real-time SDMX API data. IMF SDMX connectivity via fetch-proxy was not verified at run start. While published IMF projections are authoritative and recent (April 2026 WEO), real-time indicators (exchange rates, bond spreads, credit default swap levels) are not reflected.

**4. Plenary session incomplete contextualisation**
The April 2026 Strasbourg plenary (April 28-30) is the primary event in the review period, but detailed session context (exact agenda, debate minutes, committee rapporteur statements) was available only via the April 27 speech dataset (30 speeches). The April 28-30 plenary debates are not captured in the available data.

---

## Calibration Assessment

### Scenario probability calibration
- Scenario A (Measured Equilibrium): 40% — reasonable base case; validated by stability score 84/100
- Scenario B (Escalation Cascade): 30% — appropriate tail risk weight given actual US tariff trajectory
- Scenario C (Digital Sovereignty): 30% — slightly optimistic for a pure positive scenario; could argue 25%/35% split

### Risk score calibration
- 4 RED risks identified: EU-US trade conflict, DMA enforcement credibility, Green Deal attrition, parliamentary fragmentation spillover — all assessed at P×I ≥ 12. Assessment: appropriate calibration. None of these risks are being over-stated.
- 3 AMBER risks: manageable with monitoring. Assessment: appropriate.

### Threat tier calibration
- TH-001 (US tariffs): Score 15 — appropriate; genuinely systemic
- TH-002 (DMA delegitimisation): Score 12 — appropriate; high but dependent on US action
- TH-003 (Green Deal attrition): Score 12 — slightly aggressive; this is a slow-moving structural risk, not an acute threat. However, the cumulative nature justifies continued Tier 1 classification.

---

## Overall Analytical Quality Assessment

**Rating: 🟡 GOOD (target: EXCELLENT)**

The artifact set is comprehensive, methodologically coherent, and provides substantive political intelligence beyond surface-level description. The primary constraint — voting data absence — is inherent to the EP publication lag and cannot be resolved within this workflow's data collection capabilities.

**Limiting factors preventing EXCELLENT rating:**
1. Voting data gap reduces precision on coalition behaviour claims
2. Individual text content unavailability reduces legislative analysis depth
3. IMF real-time data gap reduces economic indicator precision

**Strengths justifying GOOD rating:**
1. Full 20-artifact coverage (exceeds minimum requirement)
2. Multi-framework analysis (PESTLE, ACH, Porter's Five Forces, SWOT, wild cards, impact matrix)
3. Rigorous coalition mathematics throughout
4. Consistent confidence labelling
5. Actionable recommendations with named institutional actors
6. Historical contextualisation with genuine analytical depth

**Final assessment:** This analysis provides a high-quality intelligence picture of the April 2026 EU Parliament period, with appropriate caveats on data limitations. The synthesis summary and executive brief provide article-generation-ready content at Economist-quality political intelligence level.

*Generated: 2026-05-09 | Run: week-in-review | Artifact: Step 10.5 methodology-reflection*
