# MCP Reliability Audit — Month-in-Review Run 5
## articleType: month-in-review | runId: 5 | date: 2026-04-19
**Framework**: Data Source Validation + Confidence Adjustment + Gap Analysis
**Confidence**: 🟢 HIGH (meta-analysis of data pipeline reliability is itself well-evidenced)

---

## Data Sources Overview

This month-in-review analysis relied on three primary data sources, each with distinct availability profiles during the review period (March 1 – April 19, 2026):

| Data Source | Type | Status (April 19) | Coverage Period | Reliability |
|------------|------|-------------------|-----------------|-------------|
| European Parliament MCP | Primary | ⚠️ DEGRADED (Tier 1 only) | March–April 2026 | 🟡 MEDIUM |
| World Bank MCP | Secondary | ✅ OPERATIONAL | 2022–2024 annual data | 🟢 HIGH |
| AI Agentic Workflow | Tertiary | ✅ OPERATIONAL | Internal analysis chain | 🟢 HIGH |
| EP Generated Statistics | Secondary | ✅ OPERATIONAL | 2004–2026 historical | 🟢 HIGH |

---

## European Parliament MCP — Detailed Endpoint Audit

### Endpoints Successfully Queried

| Endpoint | Query Type | Results Count | Confidence | Notes |
|----------|-----------|:------------:|:----------:|-------|
| `get_adopted_texts_feed` | one-month feed | 252 items | 🟢 HIGH | Tier 1 operational; all 18 March 26 texts confirmed |
| `get_current_meps` | full listing | 720 MEPs | 🟡 MEDIUM | EPP returns 0 (defect #2); S&D/ECR/Renew/Left/NI correct |
| `get_plenary_sessions` | year 2026 | 6 sessions | 🟢 HIGH | March 9-12 + March 25-26 confirmed |
| `get_speeches` | March 26 sitting | 21 speeches | 🟡 MEDIUM | Partial coverage; some speeches missing from feed |
| `get_all_generated_stats` | 2004–2026 | Full dataset | 🟢 HIGH | Static weekly refresh; comprehensive historical data |
| `analyze_coalition_dynamics` | current | Seat arithmetic | 🟡 MEDIUM | Defects #2, #3 affect outputs |
| `get_meps_feed` | one-week | ~15 updates | 🟢 HIGH | Feed operational |

### Endpoints Returning Degraded/Empty Results

| Endpoint | Query Type | Expected | Actual | Gap Impact |
|----------|-----------|----------|--------|-----------|
| `get_adopted_texts({docId})` | per-text detail | Full content | Empty string | 6 texts inaccessible (TA-10-2026-0099–0104) |
| `get_voting_records` | March 2026 | Roll-call data | Empty (delayed) | Coalition behaviour inferred not confirmed |
| `get_committee_info` | all current | Full composition | Partial (Tier 2 offline) | Committee rapporteur verification limited |
| `get_parliamentary_questions` | Q1 2026 | Full listing | Partial | PQ analysis incomplete |
| `compare_political_groups` | all groups | Full comparison | Degraded (defect #2) | EPP/Greens/PfE/ESN memberCount=0 |
| `network_analysis` | committee co-membership | Network graph | Degraded | Centrality analysis unreliable |

### Known Defects (Carried from Run 184)

Seven defects identified in `analysis/daily/2026-04-18/breaking-run184/intelligence/mcp-reliability-audit.md` remain active:

| # | Defect | Severity | Impact on This Run |
|---|--------|----------|-------------------|
| 1 | `get_server_health` underreports (0/13 vs 2/13 actual) | 🔴 HIGH | Health monitoring unreliable |
| 2 | Coalition `memberCount=0` for EPP/Greens/PfE/ESN | 🔴 HIGH | Group seat data must be manually inferred |
| 3 | Coalition `cohesion` is size-ratio artifact | 🟠 MEDIUM | Cohesion scores in this run are analyst estimates |
| 4 | `get_adopted_texts({docId})` returns empty string | 🟠 MEDIUM | 6/18 texts have no accessible content |
| 5 | Inconsistent error signalling (200 OK with empty body) | 🟠 MEDIUM | Cannot distinguish "no data" from "API error" |
| 6 | `effectiveNumberOfParties` computed over incomplete data | 🟡 LOW | ENP figure requires manual correction |
| 7 | Feed responses lack metadata (lastModified/ETag/itemCount) | 🟡 LOW | Cannot verify data freshness |

---

## World Bank MCP — Endpoint Audit

| Endpoint | Country | Indicator | Years | Results | Confidence |
|----------|---------|-----------|:-----:|:-------:|:----------:|
| `get-economic-data` | DE (Germany) | GDP_GROWTH | 10 | ✅ 2015–2024 | 🟢 HIGH |
| `get-economic-data` | DE (Germany) | GDP | 10 | ✅ 2015–2024 | 🟢 HIGH |
| `get-economic-data` | FR (France) | GDP_GROWTH | 10 | ✅ 2015–2024 | 🟢 HIGH |
| `get-economic-data` | EU aggregate | GDP_GROWTH | 5 | ✅ 2020–2024 | 🟢 HIGH |
| `get-economic-data` | DE | UNEMPLOYMENT | 5 | ✅ 2020–2024 | 🟢 HIGH |
| `get-economic-data` | EU aggregate | INFLATION | 3 | ✅ 2022–2024 | 🟢 HIGH |
| `get-economic-data` | EU aggregate | EXPORTS_GDP | 5 | ✅ 2020–2024 | 🟡 MEDIUM |

**World Bank Data Vintage**: Most recent year is 2024 (confirmed data); 2025 data not yet available in World Bank database. All economic context figures in this run use 2024 as the most recent confirmed year.

**Staleness Assessment**: For Q1 2026 analysis, the 2024 World Bank data is approximately 3-15 months old depending on publication timing. This is acceptable for structural economic context (GDP trends, unemployment trajectories) but means 2025 Q4 and 2026 Q1 economic developments are not captured. The ECB rate-cutting cycle data (cited in economic context) is sourced from public ECB communications rather than World Bank.

---

## EP Roll-Call Vote Data Availability

A critical limitation for this month-in-review: the European Parliament publishes detailed roll-call voting data with a delay of approximately 6-8 weeks from the plenary session. For the March 26, 2026 session:

- **Expected roll-call publication**: Approximately May 7-21, 2026
- **Current status**: NOT AVAILABLE (as of April 19, 2026)
- **Impact on analysis**: All claims about specific political group voting behaviour are INFERRED from:
  - Committee-stage votes (ECON, LIBE, INTA, ENVI committees)
  - Rapporteur political group assignment
  - Public group statements and press releases
  - Historical voting patterns on comparable legislation
  - EP speech data from March 26 sitting

This structural delay means the coalition dynamics analysis in this run carries 🟡 MEDIUM confidence rather than 🟢 HIGH. A validation pass should be performed when roll-call data becomes available in May 2026.

---

## Confidence Adjustment Table

Based on the data source audit above, the following confidence adjustments were applied to this run's analytical artifacts:

| Artifact | Nominal Confidence | Adjusted Confidence | Reason for Adjustment |
|----------|:-----------------:|:------------------:|----------------------|
| analysis-index.md | HIGH | 🟢 HIGH | All headline facts EP-confirmed |
| deep-analysis.md | HIGH | 🟡 MEDIUM | Coalition claims lack roll-call verification |
| synthesis-summary.md | HIGH | 🟡 MEDIUM | Forward scenarios depend on unverified assumptions |
| pestle-analysis.md | HIGH | 🟡 MEDIUM | Political dimension uses inferred group positions |
| stakeholder-map.md | HIGH | 🟡 MEDIUM | Group strategies inferred from public statements |
| scenario-forecast.md | MEDIUM | 🟡 MEDIUM | Unchanged — already calibrated for uncertainty |
| threat-model.md | MEDIUM | 🟡 MEDIUM | Unchanged |
| historical-baseline.md | HIGH | 🟢 HIGH | Uses `get_all_generated_stats` (operational) |
| economic-context.md | HIGH | 🟢 HIGH | World Bank fully operational |
| wildcards-blackswans.md | LOW | 🔴 LOW | Inherently speculative by design |
| coalition-dynamics.md | MEDIUM | 🟡 MEDIUM | Roll-call gap + defect #2/#3 |
| significance-scoring.md | MEDIUM | 🟡 MEDIUM | 6 texts lack content for scoring |
| cross-run-diff.md | HIGH | 🟢 HIGH | Internal comparison (no external dependency) |
| mcp-reliability-audit.md | HIGH | 🟢 HIGH | This file (meta-audit) |
| cross-daily-synthesis.md | HIGH | 🟢 HIGH | Internal analysis artifacts |
| political-classification.md | MEDIUM | 🟡 MEDIUM | Some texts lack content for classification |
| quantitative-swot.md | MEDIUM | 🟡 MEDIUM | Some SWOT items depend on inferred data |
| document-analysis-index.md | MEDIUM | 🟡 MEDIUM | 6 texts content-inaccessible |
| risk-matrix.md | MEDIUM | 🟡 MEDIUM | Probability estimates partially inferred |
| swot-analysis.md | HIGH | 🟡 MEDIUM | Coalition claims adjusted |
| stakeholder-impact.md | HIGH | 🟡 MEDIUM | Group strategies inferred |
| synthesis/synthesis-summary.md | MEDIUM | 🟡 MEDIUM | Unchanged |

---

## Coverage Gaps and Mitigation

### Gap 1: Six Adopted Texts Without Content (TA-10-2026-0099 to 0104)

**Cause**: EP API Tier 3 endpoints remain offline. The `get_adopted_texts({docId})` endpoint returns empty strings for these six texts despite confirming their existence in the feed.

**Mitigation**: Texts scored with estimated values in significance-scoring.md, classified as "content pending" in political-classification.md, and flagged in document-analysis-index.md. Projected Tier 3 restoration: April 25-27.

### Gap 2: No Per-MEP Roll-Call Voting Data

**Cause**: Structural EP publication delay (~6-8 weeks post-session).

**Mitigation**: Coalition dynamics analysis uses multi-source inference (committee votes, rapporteur groups, speeches, historical patterns). All coalition behaviour claims carry 🟡 MEDIUM confidence with explicit methodology transparency.

### Gap 3: EPP/Greens/PfE/ESN Seat Count Anomaly

**Cause**: EP MCP defect #2 returns `memberCount=0` for four political groups.

**Mitigation**: Seat counts manually sourced from EP institutional data (EPP=185, Greens=53, PfE=84, ESN=27). Discrepancy documented in all files referencing group composition.

### Gap 4: Committee Rapporteur Verification Limited

**Cause**: `get_committee_info` partially offline (Tier 2).

**Mitigation**: Rapporteur assignments verified through adopted text metadata and speech data where available. Some rapporteur attributions carry 🟡 MEDIUM confidence.

---

## Recommendations for Next Run

1. **Re-query TA-10-2026-0099 through 0104** when Tier 3 restoration occurs (projected April 25-27)
2. **Validate coalition claims** against roll-call data when published (~May 7-21)
3. **Cross-reference EPP seat count** against next `get_current_meps` successful query
4. **Monitor `get_server_health`** for transition from 2/13 to higher operational count
5. **Update significance scores** for the 6 pending texts upon content availability

---

## Cross-Reference to Prior Reliability Audits

- Defect inventory inherited from `analysis/daily/2026-04-18/breaking-run184/intelligence/mcp-reliability-audit.md` (7 defects, all still active)
- Tier recovery model from same source: Tier 2 projected April 21-23, Tier 3 projected April 25-27
- Previous audits: `analysis/daily/2026-04-18/breaking-run185/intelligence/mcp-reliability-audit.md` (confirms degraded state unchanged over 24h)
- World Bank stability confirmed across all daily runs April 1-19 (zero failures documented)
