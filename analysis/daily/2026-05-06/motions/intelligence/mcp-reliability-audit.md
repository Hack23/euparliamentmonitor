<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit
**Article type:** motions | **Date:** 2026-05-06 | **Run:** motions-run431-1778097237

---

## 1. EP MCP Server Status

**Server version:** european-parliament-mcp-server@1.3.0  
**Health check:** `{"status":"unhealthy"}` — server reports unhealthy at time of collection (2026-05-06T19:54:58Z)  
**Uptime at query time:** 29 seconds (server recently restarted)

### Tool-level reliability matrix

| Tool | Status | HTTP Code | Retry attempted | Result |
|------|--------|-----------|-----------------|--------|
| `get_server_health` | ✅ SUCCESS | 200 | N/A | Unhealthy status, uptime=29s |
| `get_all_generated_stats` | ✅ SUCCESS | 200 | N/A | Full stats returned (85.6KB) |
| `get_voting_records` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_adopted_texts_feed` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_adopted_texts` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_plenary_sessions` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_current_meps` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_meps` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_procedures` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_plenary_documents` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_parliamentary_questions` | ❌ FAIL | 502 | Yes | Upstream server error |
| `search_documents` | ❌ FAIL | 502 | Yes | Upstream server error |
| `get_latest_votes` | ⚠️ PARTIAL | 200 | N/A | Empty — no DOCEO XML data for dates 2026-05-04 to 2026-05-07 |
| `generate_political_landscape` | ⚠️ PARTIAL | 200 | N/A | Returns but MEP pagination failed; 0 MEPs |
| `analyze_coalition_dynamics` | ⚠️ PARTIAL | 200 | N/A | Returns but all memberCounts=0 |
| `compare_political_groups` | ❌ FAIL | 502 | Yes | EP API 502 |
| `early_warning_system` | ❌ FAIL | 502 | Yes | Upstream server error |
| `monitor_legislative_pipeline` | ❌ FAIL | 502 | Yes | EP API 502 |

**Overall EP API availability:** 2/17 tools fully functional (12%); 3/17 partially functional; 12/17 failed.

### Root cause analysis

The EP Open Data Portal (`data.europarl.europa.eu`) appears to be experiencing a widespread service degradation at the time of this run. The HTTP 502 Bad Gateway errors are upstream — the MCP server itself is responding but forwarding failures from the EP API backend. The `get_all_generated_stats` endpoint uses a cached/precomputed pathway that bypasses the live EP API, which is why it alone succeeded fully.

The DOCEO XML pathway (`get_latest_votes`) returned an empty dataset — no plenary sessions were scheduled for 2026-05-04 to 2026-05-07 (the week following 29 April appears to have been a committee week, not a full plenary session week).

### Degraded mode classification

Per `08-infrastructure.md` §4, this run operates in **EP-API degraded mode**:
- Analysis relies on precomputed `get_all_generated_stats` data (generated 2026-05-04T07:03:17Z)
- No live feed data collected
- No real-time vote results available
- Economic context uses World Bank API (not IMF primary; IMF fetch-proxy also unavailable)

**IMF probe status:** `available: false` — fetch-proxy MCP tool returned `McpError: fetch failed`. IMF minimums waived per 08-infrastructure.md §4 IMF-unavailable degraded mode. The waiver does NOT apply to WB economic data already retrieved.

---

## 2. World Bank MCP Server Status

| Tool | Status | Data returned |
|------|--------|---------------|
| `get-economic-data` (DE, GDP_GROWTH) | ✅ SUCCESS | 2024: -0.496%, 2023: -0.87% |
| `get-economic-data` (FR, GDP_GROWTH) | ✅ SUCCESS | 2024: +1.19%, 2023: +1.44% |
| `get-economic-data` (IT, GDP_GROWTH) | ✅ SUCCESS | 2024: +0.693%, 2023: +0.976% |
| `get-economic-data` (ES, GDP_GROWTH) | ✅ SUCCESS | 2024: +3.455%, 2023: +2.46% |
| `get-economic-data` (DE, INFLATION) | ✅ SUCCESS | 2024: 2.256%, 2023: 5.946% |
| `get-economic-data` (EU, GDP_GROWTH) | ❌ FAIL | Country code "EU" not found |
| `get-economic-data` (EUU) | ❌ FAIL | Country code "EUU" not found |

**World Bank availability:** 5/7 (71%). EU-aggregate indicator codes are not supported; country-level data available.

---

## 3. IMF/Fetch-proxy Status

| Tool | Status | Notes |
|------|--------|-------|
| `fetch_url` (IMF SDMX 3.0) | ❌ FAIL | `McpError: MCP error -1: fetch failed` |

**IMF status:** UNAVAILABLE. AWF network firewall may be blocking `dataservices.imf.org`, or the fetch-proxy MCP server failed to initialize. Per protocol, IMF data minimums are waived; economic context sourced from World Bank only.

---

## 4. Impact Assessment on Analysis Quality

| Artifact | Impact of degraded EP API | Mitigation |
|----------|--------------------------|------------|
| `voting-patterns.md` | HIGH — no live vote records | Use historical EP10 stats + structural analysis |
| `stakeholder-map.md` | MEDIUM — no current MEP details | Use group-level analysis from precomputed data |
| `economic-context.md` | MEDIUM — no IMF data | World Bank GDP data covers major EU economies |
| `synthesis-summary.md` | LOW — structural analysis unaffected | Full artifact deliverable |
| `pestle-analysis.md` | LOW — structural/political context available | Full artifact deliverable |
| `historical-baseline.md` | LOW — historical data in precomputed stats | Full artifact deliverable |

---

## 5. Reliability Scoring

| Dimension | Score (0-10) | Justification |
|-----------|-------------|---------------|
| Data freshness | 4/10 | Latest data from 2026-05-04; no live feed |
| Coverage completeness | 3/10 | Only precomputed stats + WB data available |
| Source authority | 7/10 | EP official precomputed stats are authoritative |
| Cross-validation | 5/10 | Multiple WB sources cross-validate economic data |
| **Overall reliability** | **4.75/10** | **Degraded mode — analysis valid for structural intelligence** |

---

## 6. Methodology Compliance Notes

Per `06-pr-and-safe-outputs.md` §5, if `get_all_generated_stats` succeeds, the MCP server is operational for the purposes of analysis delivery and an analysis-only PR is appropriate. This run will proceed to Stage C gate.

**ANALYSIS CONFIDENCE FLOOR:** 🟡 Medium. Structural analysis of EP10 political dynamics, coalition mathematics, and legislative trajectory is high confidence. Specific vote outcomes for the week of 29 Apr–6 May 2026 are inferred from structural patterns; actual vote records were unavailable.

---

## 7. Recovery Recommendations

For future runs:
1. Retry `get_voting_records` and `get_adopted_texts_feed` at 6-hour intervals
2. IMF probe should be retried with increased timeout (current failure may be transient)
3. Consider caching last-successful feed responses in repo-memory for graceful degradation
4. `get_latest_votes` with `weekStart: "2026-04-28"` may succeed when DOCEO XML is updated

*Generated: 2026-05-06T19:57Z | Run: motions-run431-1778097237*
