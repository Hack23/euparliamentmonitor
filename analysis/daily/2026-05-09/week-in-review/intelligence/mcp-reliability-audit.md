<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — Week in Review (3 Apr – 1 May 2026)

**Purpose:** Documents MCP tool availability, data gaps, reliability issues, and workarounds applied during this run. Required artifact for metadata transparency and future run calibration.

---

## Tool Availability Summary

| MCP Tool | Status | Data Quality | Notes |
|---|---|---|---|
| `european-parliament-get_adopted_texts_feed` | ✅ Available | 🟢 GOOD | 430 texts returned; top 20 parsed |
| `european-parliament-get_adopted_texts` | ✅ Available | 🟢 GOOD | year=2026, limit=50: 51 texts returned |
| `european-parliament-get_adopted_texts` (single docId) | ❌ 404 DATA_UNAVAILABLE | 🔴 FAIL | Content not yet available for TA-10-2026-0160, 0161, 0092, 0094, 0112 |
| `european-parliament-get_plenary_sessions` (dateFrom/dateTo) | ❌ Empty data[] | 🔴 FAIL | Known EP API bug: dateFrom/dateTo filter not functional; year filter works |
| `european-parliament-get_plenary_sessions` (year=2026) | ⚠️ Partial | 🟡 MEDIUM | Sessions listed but limited content detail |
| `european-parliament-get_latest_votes` | ❌ Empty (lag) | 🔴 FAIL | DOCEO XML not published for May 2026; returns datesUnavailable |
| `european-parliament-get_voting_records` (dateFrom/dateTo) | ❌ Empty | 🔴 FAIL | EP roll-call publication lag 2–6 weeks confirmed |
| `european-parliament-get_speeches` | ✅ Available | 🟢 GOOD | April 27 plenary: 30 speeches returned |
| `european-parliament-analyze_coalition_dynamics` | ✅ Available | 🟢 GOOD | Full group composition; ENPP=6.58 |
| `european-parliament-generate_political_landscape` | ✅ Available | 🟢 GOOD | Full landscape; 717 MEPs confirmed |
| `european-parliament-early_warning_system` | ✅ Available | 🟢 GOOD | Stability=84, MEDIUM risk |
| `european-parliament-get_procedures_feed` | ✅ Available | 🟡 MEDIUM | Large output; timeframe one-month |
| `european-parliament-detect_voting_anomalies` | Not called | N/A | Voting data unavailable anyway |
| `world-bank-get-economic-data` | Available (not called for primary analysis) | N/A | Economic data from IMF sources |
| `fetch-proxy-fetch_url` (IMF SDMX) | ⚠️ Not verified | 🟡 UNKNOWN | API connectivity unverified in this run; IMF data sourced from published reports |
| `memory` MCP | ✅ Available | 🟢 GOOD | Session memory operational |
| `sequential-thinking` | ✅ Available | 🟢 GOOD | Reasoning tool operational |

---

## Critical Data Gaps

### Gap 1: Roll-Call Voting Data
**Severity: HIGH | Impact: Significant analytical limitation**

EP roll-call voting data for April 2026 plenary sessions is not available via:
- `get_latest_votes`: DOCEO XML published only after 2–4 week delay
- `get_voting_records`: Returns empty for the D-36→D-8 window
- Individual adopted text detail: 404 DATA_UNAVAILABLE for all April 28-30 adoptions

**Workaround applied:** Group position assessments derived from:
1. EP Open Data group composition (structural alignment inference)
2. EP speech records (April 27 plenary — debates before votes)
3. Historical group position patterns from EP9/EP10 precedent
4. Coalition dynamics analysis (structural coalition mathematics)

**Analytical impact:** Group cohesion scores and within-group dissent patterns cannot be quantified precisely. Statements about EPP/S&D/Renew coalition behaviour on specific votes are inferences, not vote-count verified facts. All such claims are labelled with appropriate confidence levels (🟡 Medium or 🔴 Low).

**Future run recommendation:** Run this article type at D-14 or later (shift DATE_FROM to D-42) to capture more published voting data. Alternatively, supplement with EP press releases and parliamentary committee reports (which record vote results) — these are not available via current MCP toolset.

---

### Gap 2: Individual Adopted Text Content
**Severity: MEDIUM | Impact: Moderate**

All April 28-30 Strasbourg session adopted texts (TA-10-2026-0160 through 0165) return 404 DATA_UNAVAILABLE when queried by docId. This means:
- Full legislative text unavailable for detailed analysis
- Vote counts (for/against/abstain) unavailable
- Amendment acceptance/rejection details unavailable

**Workaround applied:** Analysis based on:
1. Title and reference metadata (available from feed listing)
2. EP press release language (from speeches data)
3. Background procedure data where available
4. Historical legislative pattern (what these types of texts typically contain)

**Confidence level:** 🟡 Medium — analysis of significance and content is well-grounded but lacks primary source verification of vote counts and final text wording.

---

### Gap 3: Plenary Session Date-Filtering
**Severity: LOW | Impact: Minor (worked around)**

`get_plenary_sessions` with `dateFrom`/`dateTo` parameters returns empty `data[]` regardless of parameter values. This is a documented EP API bug. Year-based filtering (`year=2026`) returns full year data without date restriction.

**Workaround applied:** Used `year=2026` and applied client-side date filtering to identify relevant sessions (April 2026). No material analytical impact.

---

## Data Source Quality Assessment

| Source Type | Reliability | Coverage |
|---|---|---|
| EP adopted texts feed (titles/metadata) | 🟢 HIGH | April 2026 complete |
| EP coalition/group composition data | 🟢 HIGH | Current (real-time) |
| EP speech records | 🟢 HIGH | April 27 plenary complete |
| EP adopted text content (docId detail) | 🔴 LOW | April 28-30: NOT AVAILABLE |
| EP voting records | 🔴 LOW | D-36→D-8 window: NOT AVAILABLE |
| IMF economic data | 🟡 MEDIUM | Published reports (not real-time API) |
| Early warning system | 🟢 HIGH | Real-time; synthesised from available data |

---

## Run Performance Metrics

| Metric | Value |
|---|---|
| Stage A MCP calls | ~8 parallel tool calls |
| Stage A elapsed | ~5 minutes |
| MCP server availability | 100% (all configured servers responsive) |
| Data gaps encountered | 3 (voting, text content, plenary date-filter) |
| Workarounds applied | 3 (documented above) |
| Artifacts produced (B1 pass) | 16 as of audit time |
| Pass 2 rewrite pass | Initiated (see manifest.json) |

---

## Recommendations for Future Runs

1. **Shift reporting window**: For week-in-review, consider DATE_TO=D-14 instead of D-8 to capture more published voting data. Accept that the most recent 14 days (not 8) are excluded. Trade-off: more data vs. less recency.

2. **Add EP press release source**: EP press releases (publicly available, not behind API lag) contain vote count summaries. A web-fetch MCP tool for `www.europarl.europa.eu/news` would fill the voting gap.

3. **Pre-warm DOCEO XML cache**: `get_latest_votes` could be called for the D-14 to D-28 window (where DOCEO data is likely available) rather than the current reporting window edge.

4. **IMF real-time SDMX integration**: Verify `fetch-proxy-fetch_url` connectivity for `dataservices.imf.org/REST/SDMX_3.0/` at run start; if available, use real-time WEO/IFS data rather than published report values.

*MCP Server: european-parliament-mcp-server@1.3.1 | Run ID: week-in-review-run-$(date +%s)*
