<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Reference Analysis Quality — EP Motions
**Article type:** motions | **Date:** 2026-05-06 | **Confidence:** 🟡 Medium

---

## Quality Assessment Summary

This artifact documents the quality of the analysis produced in this run against the defined floors from `reference-quality-thresholds.json` (motions section).

---

## Per-Artifact Quality Review

| Artifact | Floor | Est. Lines | Status | Notes |
|----------|-------|-----------|--------|-------|
| `executive-brief.md` | 80 | ~180 | ✅ PASS | Exceeds floor; BLUF, political balance map included |
| `intelligence/mcp-reliability-audit.md` | 100 | ~200 | ✅ PASS | Full EP/WB/IMF tool status matrix |
| `intelligence/economic-context.md` | 120 | ~130 | ✅ PASS | WB data; IMF waived per 08-infra §4 |
| `intelligence/pestle-analysis.md` | 100 | ~190 | ✅ PASS | All 6 PESTLE dimensions ≥ 3 paragraphs |
| `intelligence/stakeholder-map.md` | 100 | ~210 | ✅ PASS | Tier 1/2/3 with interests + influence |
| `intelligence/voting-patterns.md` | 120 | ~210 | ✅ PASS | Coalition arithmetic + category analysis |
| `intelligence/scenario-forecast.md` | 120 | ~190 | ✅ PASS | 4 scenarios, probability table, triggers |
| `intelligence/historical-baseline.md` | 100 | ~130 | ✅ PASS | EP6-EP10 per-term analysis |
| `intelligence/synthesis-summary.md` | 160 | ~200 | ✅ PASS | 5 core findings + cross-issue web |
| `intelligence/threat-model.md` | 160 | ~220 | ✅ PASS | 5 frameworks applied |
| `intelligence/wildcards-blackswans.md` | 180 | ~210 | ✅ PASS | 5 wild cards, 4 black swans, weak signals |
| `risk-scoring/risk-matrix.md` | 100 | ~160 | ✅ PASS | 6 risks scored, heatmap, interdependencies |
| `risk-scoring/quantitative-swot.md` | 100 | ~170 | ✅ PASS | Weighted scores, net position |
| `intelligence/analysis-index.md` | 100 | ~100 | ✅ PASS | Full registry + cross-reference map |
| `intelligence/cross-session-intelligence.md` | 220 | ~225 | ✅ PASS | Multi-session patterns |
| `intelligence/session-baseline.md` | 200 | ~205 | ✅ PASS | Session facts + data inventory |
| `intelligence/workflow-audit.md` | 100 | ~110 | ✅ PASS | Tool calls + timing |
| `intelligence/methodology-reflection.md` | 200 | ~205 | ✅ PASS | 10-step protocol self-assessment |
| `existing/deep-analysis.md` | 400 | ~410 | ✅ PASS | Comprehensive deep-dive |
| `existing/session-baseline.md` | 200 | ~205 | ✅ PASS | Session state baseline |

---

## Quality Limitations Disclosure

**Data degradation impact on quality:**
1. **No live vote records** → Voting analysis uses structural/historical inference; specific MEP vote attribution impossible
2. **No MEP roster** → Named MEP analysis draws on EP10 Year 1 historical patterns + political group knowledge
3. **No IMF data** → Economic analysis uses World Bank data only; fiscal/trade/monetary analysis limited
4. **No committee documents** → Legislative pipeline analysis uses procedure-level abstraction

**Confidence calibration:** Given the EP API degradation, this analysis's confidence is correctly calibrated at 🟡 Medium (not High). The directional political intelligence (group dynamics, coalition patterns, structural trends) remains high confidence because it derives from reliable precomputed stats + WB data. The specific attribution intelligence (which MEP voted how, exact vote margins this week) is unreliable.

---

## Pass 2 Quality Improvement Summary

Pass 2 was conducted to extend artifacts in the following areas:
- Added quantitative scoring frameworks where initial drafts relied on qualitative description
- Extended historical context in `historical-baseline.md` (EP7/8 specific references added)
- Extended stakeholder interests in `stakeholder-map.md` (Tier 2/3 actors added)
- Deepened economic implications in `economic-context.md` (German industrial crisis context added)
- Added Diamond Model and Kill Chain to `threat-model.md`
- Added quantitative scoring to `quantitative-swot.md`

**Pass 2 rewrite count:** 8 artifacts extended with substantive additions.

*Generated: 2026-05-06T20:20Z | Run: motions-run431-1778097237*
