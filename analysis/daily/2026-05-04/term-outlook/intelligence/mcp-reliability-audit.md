<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EP10 Term Outlook Run
**Date:** 2026-05-04 | **Run ID:** term-outlook-run-1777895963

---

## 1. MCP Tool Invocation Summary

| Tool | Calls | Status | Latency | Data Quality |
|------|-------|--------|---------|-------------|
| `european-parliament-generate_political_landscape` | 1 | ✅ Success | ~8s | 🟢 High quality |
| `european-parliament-early_warning_system` | 1 | ✅ Success | ~6s | 🟢 Good |
| `european-parliament-get_all_generated_stats` | 1 | ✅ Success | ~10s | 🟢 High quality |
| `european-parliament-compare_political_groups` | 1 | ✅ Success | ~5s | 🟡 Limited (per-MEP data unavailable) |
| `european-parliament-get_adopted_texts` | 1 | ✅ Success | ~12s | 🟢 51 texts returned |
| `european-parliament-analyze_coalition_dynamics` | 1 | ✅ Success | ~8s | 🟡 Proxy-based (not vote-level) |
| `european-parliament-get_plenary_sessions` | 2 | ⚠️ Timeout then empty | >30s | 🔴 No data returned |
| `european-parliament-get_procedures_feed` | 1 | ⚠️ Timeout | >30s | 🔴 No data returned |
| `european-parliament-monitor_legislative_pipeline` | 1 | ⚠️ Empty result | ~5s | 🔴 No data |
| `european-parliament-get_current_meps` | 1 | ✅ Success | ~4s | 🟡 21 MEPs (partial) |
| IMF SDMX API (via curl) | 1 | ❌ Blocked (exit 28) | >28s | 🔴 Firewall block |

**Total EP MCP tool calls:** 11 | **Success rate:** 7/11 (64%) | **Failure/degraded:** 4/11 (36%)

---

## 2. Failure Analysis

### 2.1 IMF Availability (Critical)
**Status:** 🔴 Unavailable — AWF sandbox Squid proxy blocking external API access
**Impact:** All IMF macro/fiscal/monetary data absent from this run
**Mitigation applied:** Degraded mode per `08-infrastructure.md §4`; economic-context.md written with 🔴 unavailability notice; Stage C IMF minimums waived
**Recommendation:** IMF endpoint allowlisting in AWF firewall configuration; or pre-staging IMF data in cache-memory

### 2.2 `get_plenary_sessions` Timeout (High)
**Status:** ⚠️ Second call returned empty `data[]` after initial timeout
**Root cause hypothesis:** EP API year-filter + pagination combination unusually slow for 2026 sessions
**Fallback used:** `get_all_generated_stats` provides aggregate plenary session counts; `get_adopted_texts` provides specific legislative output
**Impact:** No specific plenary session agenda data; mitigation via alternative tools satisfactory
**Recommendation:** Use `get_plenary_sessions` with no date filter and smaller `limit` (≤10) before applying date filters

### 2.3 `get_procedures_feed` Timeout (Medium)
**Status:** ⚠️ Timeout after 30+ seconds
**Root cause hypothesis:** procedures/feed endpoint is documented as "significantly slower" per tool description; one-month queries can exceed 120s
**Fallback used:** `get_adopted_texts` year=2026 provides procedure outcomes; `early_warning_system` provides coalition dynamics
**Impact:** No specific procedure-level pipeline data; partial mitigation satisfactory
**Recommendation:** Use `get_procedures` (paginated endpoint) instead of `get_procedures_feed` for term-outlook runs

### 2.4 `monitor_legislative_pipeline` Empty Result (Medium)
**Status:** ⚠️ Tool returned empty result for ACTIVE procedures
**Root cause hypothesis:** Real-time pipeline data depends on specific EP database tables not populated for EP10 procedures yet
**Fallback used:** Qualitative analysis based on adopted texts and public information
**Impact:** No quantified pipeline metrics; partially mitigated by adopted texts analysis
**Recommendation:** Test `monitor_legislative_pipeline` with `status: "ALL"` or specific committee filter

---

## 3. Data Quality Assessment by Analysis Section

| Analysis Section | Primary Data Source | Quality | Notes |
|-----------------|---------------------|---------|-------|
| EP10 composition | `generate_political_landscape` | 🟢 High | EP10 group data confirmed; 720 MEPs, 8 groups |
| Coalition dynamics | `analyze_coalition_dynamics` + `compare_political_groups` | 🟡 Medium | Proxy-based; no vote-level cohesion |
| Legislative output | `get_all_generated_stats` + `get_adopted_texts` | 🟢 High | 2026 output data confirmed |
| External context | IMF (unavailable) | 🔴 Absent | Degraded mode activated |
| Political trends | `early_warning_system` | 🟢 Good | Stability 84/100, risk signals |
| Historical baseline | `get_all_generated_stats` EP6–EP10 | 🟢 High | Multi-term statistics available |
| Forward projections | Trend analysis from available data | 🟡 Medium | Inference-based; scenario planning |
| MEP-level analysis | `get_current_meps` (21 MEPs, partial) | 🔴 Insufficient for depth analysis | Limited dataset |

---

## 4. Admiralty Rating Justification

| Artifact Category | Data Strength | Admiralty Grade |
|------------------|---------------|----------------|
| EP10 composition and coalition data | Strong (direct API) | B2 |
| Historical baselines | Strong (statistical) | B3 |
| Economic context | Absent (IMF blocked) | C5 |
| Forward projections | Moderate (trend extrapolation) | C3 |
| External context | Agent knowledge + public data | C4 |
| Electoral projections (2029) | Trend extrapolation | C4 |

**Overall run Admiralty Grade: B3 / C3 mix** — direct EP data high quality; economic and forward projections dependent on agent knowledge due to IMF block.

---

## 5. Recommendations for Future Runs

1. **IMF data pre-staging:** Cache IMF World Economic Outlook data in `cache-memory/imf/` outside sandbox to avoid firewall block dependency
2. **Procedure timeline:** Use `get_procedures` paginated endpoint for current term procedures instead of `get_procedures_feed`
3. **Plenary sessions:** Use `get_plenary_sessions` with `year=2026` and `limit=10` (not 50) to avoid timeout
4. **MEP detail sampling:** For MEP-level analysis, use `get_meps` by group with `limit=25` rather than `get_current_meps` to get representative samples
5. **Coalition voting:** EP API does not provide per-MEP roll-call data — coalition analysis will always be proxy-based; document this limitation prominently
