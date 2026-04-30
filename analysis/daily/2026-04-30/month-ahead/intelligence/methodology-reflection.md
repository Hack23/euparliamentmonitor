<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Methodology Reflection — EU Parliament Month-Ahead: 2026-04-30

**Step 10.5 — Mandatory Final Artifact per AI-Driven Analysis Guide**  
**Run ID:** month-ahead-run-1777536024  
**Date:** 2026-04-30

---

## Overview

This methodology reflection is the mandatory final artifact (Step 10.5) produced at the conclusion of Stage B. It documents the analytical choices made during this run, identifies methodological limitations, and records quality attestations and pass2 information.

---

## Pass 2 Attestation

**pass2.startedAt:** After initial artifact creation (approximately minute 16-18)  
**pass2.endedAt:** Before Stage C gate  
**pass2.rewriteCount:** 3 — the following artifacts were reviewed and expanded:
1. **synthesis-summary.md:** Added cross-artifact convergence strength ratings and IMF integration status confirmation
2. **coalition-dynamics.md:** Added EPP pivot portfolio quantification (% of votes by coalition type) and defection risk section
3. **economic-context.md:** Verified all IMF data is explicitly labelled as "projections/forecasts" rather than facts — corrected labelling in one paragraph

**Quality attestation:** All artifacts reviewed end-to-end. No `[AI_ANALYSIS_REQUIRED]` markers remain. All forward-looking claims are labelled as projections/estimates/forecasts. 🟢/🟡/🔴 confidence indicators are present in all artifacts.

---

## Analytical Choices and Rationale

### Choice 1: ACH Framework for Scenarios Rather Than Simple Probability Tree
**Rationale:** The Analysis of Competing Hypotheses approach was chosen for scenario-forecast.md because it forces explicit consideration of each hypothesis's counterfactual — "what would need to be true for this scenario NOT to occur?" This reduces confirmation bias compared to a simple probability tree where the analyst starts from a preferred outcome.

**Trade-off:** ACH is more verbose and requires discipline to maintain in long artifact sets. For a 30-day forward window, the added epistemic rigour justifies the length.

### Choice 2: Seat-Share Proxy for Coalition Cohesion
**Rationale:** EP Open Data Portal does not expose per-MEP roll-call positions (confirmed via `analyze_coalition_dynamics` returning NULL cohesion data). The analysis used seat-share similarity scores as a proxy for coalition viability, supplemented by historical coalition pattern analysis.

**Limitation:** Seat-share proximity does not equal voting cohesion. EPP and PfE have similar economic policy positions (both market-oriented) but dramatically different voting patterns on rule-of-law matters. This proxy understates ideological distance on specific dossiers.

**Mitigation:** All coalition assessments include explicit 🟡 MEDIUM confidence labels and note the data limitation. No coalition probability estimates exceed 65% certainty given this constraint.

### Choice 3: IMF WEO April 2026 as Sole Macro Authoritative Source
**Rationale:** Per custom instructions, IMF is the sole authoritative source for macro/fiscal/monetary/trade/FDI/exchange-rate/banking-soundness claims in policy articles. World Bank economic data was used as complementary context only (clearly labelled). This creates analytical discipline that prevents inconsistent economic forecasting claims.

**Trade-off:** IMF WEO April 2026 projections for some smaller EU member states have limited detail. For Germany, France, Italy — the major economies most relevant to EP political dynamics — the IMF data is comprehensive.

### Choice 4: Forward Statement Carry-Forward from Prior Runs
**Rationale:** Four open forward statements from prior runs (FS-2026-004 through FS-2026-007) were reviewed and updated rather than ignored. The April 28 Budget Guidelines adoption allowed a confidence upgrade for FS-2026-005 from 🟡 to 🟢 HIGH.

**Quality impact:** Forward statement continuity ensures analytical coherence across runs and allows readers to track the evolution of key political dynamics over time.

### Choice 5: Historical Baseline Using EP10 Generalised Stats
**Rationale:** The `get_all_generated_stats` tool provides the most comprehensive EP historical dataset available. The year-on-year comparisons in historical-baseline.md are based on this authoritative source.

**Limitation:** The stats cover aggregate output measures (acts, votes, meetings) but not the qualitative character of legislative work. Two years with identical act counts may have very different political dynamics.

---

## Data Quality Impact on Analysis Confidence

| Data Gap | Impact on Confidence | Affected Artifacts |
|---------|--------------------|--------------------|
| Events feed unavailable | -1 level (reduced contextual richness) | PESTLE §Social, Wildcard |
| Procedures feed historical | -1 level (no current pipeline data) | Historical baseline, synthesis |
| Voting records empty | -0.5 level (no recent voting validation) | Coalition dynamics, threat model |
| Vote cohesion absent | -1 level (proxy only for coalitions) | Coalition dynamics, quantitative SWOT |
| May 18-21 agenda unpublished | -0.5 level (estimated not confirmed) | Executive brief, scenario forecast |

**Net assessment:** Analysis operates at approximately 70-75% of ideal data quality. The strategic-level assessments (coalition architecture, scenario probabilities, key risk identifications) are robust. The tactical-level assessments (specific vote counts, exact agenda items) carry higher uncertainty.

---

## Methodological Framework Coverage

| Framework | Applied In | Coverage |
|----------|-----------|----------|
| PESTLE | pestle-analysis.md | Full 6 dimensions |
| ACH | scenario-forecast.md | 3 primary + 4 sub-scenarios |
| PTF v4.0 | threat-model.md | 5 threat pillars, all threats |
| CAM | coalition-dynamics.md | MWC analysis, pivot dynamics |
| FATE | wildcards-blackswans.md | 5 wildcards + 1 grey rhino |
| ISO 31000 Risk Matrix | risk-matrix.md | 7 risks, 5×5 matrix |
| Quantitative SWOT | quantitative-swot.md | Full SWOT, weighted scoring |
| Historical Comparative | historical-baseline.md | EP6-EP10 comparison |
| 6-Lens Stakeholder | stakeholder-map.md | 9+ actors, Mermaid diagram |
| IMF WEO Integration | economic-context.md | GDP, inflation, trade projections |

---

## Rules Compliance Check (Rules 1–22)

| Rule Group | Compliance Status |
|-----------|-----------------|
| Rule 1-5: Data sourcing and citation | ✅ Compliant — all claims cited to EP MCP or IMF sources |
| Rule 6-10: Confidence calibration | ✅ Compliant — 🟢/🟡/🔴 on all assessments |
| Rule 11-15: AI-First quality | ✅ Compliant — all analysis AI-authored; no placeholder text |
| Rule 16-18: Chart.js/Mermaid visualizations | ✅ Compliant — Chart.js in economic-context.md; Mermaid in stakeholder-map, scenario-forecast, wildcards, executive-brief |
| Rule 19: Analysis index | ✅ Compliant — analysis-index.md created as mandatory navigation entry point |
| Rule 20-21: Forward statements | ✅ Compliant — 4 open items reviewed; 3 new statements generated |
| Rule 22 (Step 10.5): Methodology reflection | ✅ This artifact |

---

## Lessons Learned for Future Runs

1. **Tight time budget for month-ahead:** The 30-day forward window generates more MCP calls and more data to synthesise than other article types. The Stage A ≤4 min budget may need extending to 5-6 min for month-ahead runs to avoid partial data collection.

2. **Parallel IMF probe pattern:** Launching `scripts/imf-mcp-probe.sh` as a background process during EP MCP collection effectively parallelised data collection. This pattern should be maintained.

3. **Forward statement registry:** The pre-seeding of forward statements from prior runs proved highly valuable — it provided continuity and context that would have been lost without the registry mechanism.

4. **MCP degradation is chronic for month-ahead:** The events feed and procedures feed failures are structural, not transient. Future runs should immediately pivot to compensating data sources rather than retrying these tools.

---

## Quality Gate Pre-Assessment

Based on this methodology reflection, the analysis is expected to pass Stage C:
- All mandatory artifacts produced: ✅
- No `[AI_ANALYSIS_REQUIRED]` markers: ✅  
- IMF economic context present: ✅
- Chart.js visualization present: ✅
- Mermaid diagrams present: ✅ (multiple)
- Forward statements reviewed and updated: ✅
- Confidence calibration throughout: ✅
- pass2.rewriteCount ≥ 1: ✅ (3 rewrites)
- Line count floors: To be confirmed by `npm run validate-analysis`
