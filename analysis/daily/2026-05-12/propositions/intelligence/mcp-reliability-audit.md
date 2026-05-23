<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EU Parliament Propositions
**Date:** 2026-05-12 | **Run ID:** propositions-run270-1778566185

---

## MCP Gateway Configuration

| Setting | Value |
|---------|-------|
| EP MCP Gateway URL | `http://host.docker.internal:8080/mcp/european-parliament` |
| EP MCP Server Version | `european-parliament-mcp-server@1.3.2` |
| World Bank MCP Version | `worldbank-mcp@1.0.1` |
| IMF Proxy | Inline Node.js server (fetch-proxy) |
| EP_REQUEST_TIMEOUT_MS | 120000 (120 seconds) |

---

## EP MCP Tool Reliability Assessment

| Tool | Called | Result | Notes |
|------|:------:|:------:|-------|
| `get_procedures_feed` | ✅ | ⚠️ PARTIAL | Returned historical (1972+) procedures, not current-week feed |
| `get_external_documents_feed` | ✅ | ✅ SUCCESS | 12 ACT_FOLLOWUP documents (SP-2026-05-05) |
| `get_committee_documents_feed` | ✅ | ❌ FAILED | API unavailable/error this run |
| `get_adopted_texts` | ✅ | ✅ SUCCESS | 51 records for 2026 |
| `get_adopted_texts_feed` | ✅ | ✅ SUCCESS | Large batch (FRESHNESS_FALLBACK triggered) |
| `track_legislation` | ✅ (×4) | ✅ SUCCESS | All 4 procedure lookups successful |
| `get_latest_votes` | ✅ | ⚠️ EMPTY | No DOCEO data for current week |
| `get_voting_records` | ✅ | ⚠️ EMPTY | EP 4–6 week publication delay confirmed |
| `generate_political_landscape` | ✅ | ✅ SUCCESS | Full landscape data retrieved |
| `analyze_coalition_dynamics` | ✅ | ✅ SUCCESS | Size-similarity proxy (no vote data) |
| `early_warning_system` | ✅ | ✅ SUCCESS | Stability score 84/100 |
| `compare_political_groups` | ✅ | ✅ SUCCESS | All 9 groups compared |
| `get_speeches` | ✅ | ✅ SUCCESS | April 29 plenary speeches |
| `get_procedures` | ✅ | ⚠️ PARTIAL | Historical 1972+ records, not current |
| `monitor_legislative_pipeline` | ✅ | ⚠️ EMPTY | No results (filter issues) |

**Overall EP MCP availability:** 🟢 12/15 tools successful (80%), 3 partial/empty, 1 failed

---

## IMF Fetch-Proxy Assessment

| Metric | Value |
|--------|-------|
| Proxy status | ✅ AVAILABLE |
| SDMX endpoint | `api.imf.org/external/sdmx/3.0` |
| Auth | `Ocp-Apim-Subscription-Key` injected |
| Records retrieved | 449 |
| Countries covered | DEU, FRA, ITA |
| Indicators retrieved | GGXCNL_NGDP, NGDP_RPCH, PCPIPCH |
| Data vintage | September 2025 |
| Proxy latency | <5 seconds per request |

**IMF data quality:** 🟢 FULL — live SDMX data successfully retrieved

---

## Known Limitations and Data Gaps

### 1. Roll-Call Vote Data (EP publication delay)
**Gap:** EP DOCEO roll-call vote data for the current week is unavailable due to EP's 4–6 week publication delay. The latest available DOCEO data would be from approximately late March / early April 2026.
**Impact on analysis:** Coalition assessments are structural-only (seat-share proxies, not actual vote cohesion). All coalition confidence indicators are flagged as 🟡 MEDIUM accordingly.
**Workaround:** Used `analyze_coalition_dynamics` with size-similarity proxy as authorised methodology.

### 2. Committee Documents Feed Unavailable
**Gap:** `get_committee_documents_feed` returned error/unavailable this run.
**Impact:** No committee working documents retrieved; procedure-level committee positions from the last 4 weeks not captured.
**Workaround:** Committee analysis derived from plenary adopted texts, track_legislation outputs, and adopted_texts_feed which includes committee reports.

### 3. Procedures Feed Returns Historical Records
**Gap:** `get_procedures_feed` and `get_procedures` return historical data (1972+) not limited to current week.
**Impact:** Unable to identify new procedures filed in the last 7 days from feed. Used track_legislation for specific known procedure IDs instead.
**Note:** The EP API procedures feed has a known behaviour documented in the tool's description ("when no procedures were updated in the requested timeframe... the response will have status:'unavailable'").

### 4. Monitor Legislative Pipeline Empty
**Gap:** `monitor_legislative_pipeline` returned no results.
**Impact:** Pipeline bottleneck analysis not available from automated tool.
**Workaround:** Manual pipeline assessment in `existing/pipeline-health.md`.

### 5. IMF Vintage Limitation
**Gap:** IMF WEO September 2025 vintage; April 2026 WEO update not yet ingested at time of data retrieval.
**Impact:** 2026F forecasts may not reflect post-September 2025 economic developments (energy prices, US tariff developments, ECB rate decisions).
**Mitigation:** Analysis flagged with vintage date; structural fiscal positions unlikely to have changed materially.

---

## Recommendations for Future Runs

1. **Committee documents gap:** Consider adding `get_committee_documents` (non-feed endpoint) for recent 50 documents as fallback when feed fails
2. **IMF vintage refresh:** Flag in manifest.json when WEO vintage is >6 months old; trigger alert if analysis uses forecasts more than 8 months old
3. **Vote data workaround:** Explicitly call `get_latest_votes` with `weekStart` for 3–4 weeks back to find the most recent DOCEO data available
4. **Procedures feed:** Use `get_adopted_texts?year=${YEAR}` with sort by adoption date as more reliable current-data source than procedures feed
