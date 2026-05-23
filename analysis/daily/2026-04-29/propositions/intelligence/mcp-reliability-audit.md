<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EU Parliament Propositions
**Date:** 2026-04-29 | **Run:** propositions-run-1777442543

## Tool Call Summary

| Tool | Status | Data Quality | Notes |
|------|--------|-------------|-------|
| `get_procedures_feed` (one-week) | 🟡 DEGRADED | Historical archive | Returns 1970s-1990s data — known defect §11 row #5 |
| `get_external_documents_feed` (one-week) | 🟢 OK | April 22 documents | 6 Act Follow-Up documents |
| `get_committee_documents_feed` (one-week) | 🔴 FAIL | Unavailable | EP API error on this feed |
| `monitor_legislative_pipeline` | 🟡 DEGRADED | Empty enriched | 50 procedures excluded (no enrichment) |
| `get_adopted_texts` (year:2026) | 🟢 OK | Rich data | 44 texts including April 28 plenary |
| `get_plenary_sessions` (Apr 22-29) | 🟢 OK | Confirmed | 3 sessions identified |
| `get_adopted_texts_feed` (one-week) | 🟢 OK | Large dataset | Successfully retrieved |
| `get_meeting_decisions` | 🟢 OK | Partial (no titles) | Document IDs only in response |
| `get_voting_records` | 🔵 EXPECTED EMPTY | Delay defect | EP roll-call data 4-6 week delay; structural, not transient |
| `generate_political_landscape` | 🟢 OK | Full data | 719 MEPs, 9 groups |
| `analyze_coalition_dynamics` | 🟡 DEGRADED | Size-ratio proxy only | All cohesion metrics null (no voting data) |
| `get_speeches` (Apr 22-29) | 🟢 OK | Title-only | 20 speeches, no content |
| `track_legislation` (4 procedures) | 🟢 OK | Partial | Procedure IDs resolved |
| `get_meeting_foreseen_activities` | 🟢 OK | Title-only | 20 debate items |
| WB `get-economic-data` (EU) | 🔴 FAIL | Country not found | EU aggregate code rejected |
| WB `get-economic-data` (DE) | 🟢 OK | GDP data | Germany: -0.5% (2024), -0.9% (2023) |

## Known Defects (per §11 of 07-mcp-reference.md)

### Defect #5 — Procedures Feed Historical Archive
`get_procedures_feed` and `get_procedures` return historical archive data (1970s-1990s) as if they were recent procedures. This is a known upstream EP API defect. **Workaround:** Use `monitor_legislative_pipeline` with explicit `dateFrom`/`dateTo` for current procedures, plus `track_legislation` for known procedure IDs.

**Applied workaround:** Stage A used `monitor_legislative_pipeline` (April 1-29) and explicit `track_legislation` calls for procedures 2023/0447(COD), 2025/0261(COD), 2023/0135(COD), 2025/2246(BUI). Result: procedure data is based on known items from adopted texts and session data rather than the feed.

**Recess mode:** `detectProceduresFeedRecessMode` flag would fire on this dataset (all returned procedures ≤ 1995). Noted in data provenance.

### Defect #6 — Voting Records Delay
`get_voting_records` returns empty for current/recent sessions. EP publishes roll-call data with 4-6 week delay. This is confirmed structural behavior, not a transient error. **Workaround:** Use structural coalition analysis (seat shares, size-ratio proxies) and historical voting pattern inference.

**Applied workaround:** All coalition analysis in this run relies on structural seat-share analysis. Roll-call confirmation is not available and has been noted in every artifact with 🔴 caveat.

### Defect — World Bank Country Code Mismatch
WB MCP server rejects EU aggregate codes (`EU`, `EUU`, `EMU`, `ECA`) with "Country not found". Must use individual member-state codes. **Applied workaround:** DE (Germany) used as primary economic proxy; IMF WEO April 2026 cited as primary attribution for EU-level economic figures.

### Partial Data — Committee Documents Feed
`get_committee_documents_feed` returned an error (EP API upstream). This means committee-level document tracking for the propositions agenda is based on plenary session data only. The BUDG, INTA, and AGRI committee activity is inferred from adopted texts rather than from direct committee document feeds.

## Data Quality Classification

| Dimension | Rating | Rationale |
|-----------|--------|----------|
| Adopted texts coverage | 🟢 HIGH | 44 texts with titles and IDs |
| Procedure status | 🟡 MEDIUM | 4 procedures tracked; feed defect limits broader scan |
| Coalition/voting data | 🔴 LOW | Roll-call data unavailable; size-ratio proxies only |
| Economic data | 🟡 MEDIUM | Germany WB data available; IMF WEO cited for EU aggregate |
| Speech/debate content | 🟡 MEDIUM | Titles available; content not available |
| Committee activity | 🟡 MEDIUM | Plenary decisions available; committee documents feed failed |

## Recommendation
No upstream issues should be filed for:
- Voting records delay (🔵 structural/expected per §11)
- Procedures feed historical mode (🟡 known defect, documented workaround)

Flag for potential upstream follow-up:
- Committee documents feed failure (🔴 — first observed in this run; may be transient)
- World Bank EU aggregate code rejection (applies across all runs — known limitation of WB MCP server)

*Source: Stage A tool call observations | 07-mcp-reference.md §11 | Run: propositions-run-1777442543 | 2026-04-29*
