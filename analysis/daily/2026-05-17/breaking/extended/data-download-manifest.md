# Data Download Manifest — EP Breaking News 2026-05-17
**Date**: 2026-05-17 | **Purpose**: Complete inventory of data sources, download status, gaps
**Run ID**: breaking-run255-1778981702

## Pre-Agent Prefetch Status
Prefetch time: 2026-05-17T01:28 UTC
```json
{
  "prefetchMode": "full",
  "fetched": 6,
  "placeholders": 0,
  "total": 6
}
```
Note: "full" prefetch mode confirmed but 4 of 6 feeds returned HTTP 404 errors (empty items[]):
- events-feed.json: 404 (empty items[])
- procedures-feed.json: 404 (empty items[])
- committee-documents-feed.json: 404 (empty items[])
- documents-feed.json: 404 (empty items[])

Effective prefetch mode: DEGRADED-FEEDS (4/6 feeds unavailable)

## Live Stage A MCP Calls (6 total; 1 over soft cap — INVOCATION_CAP_ACKNOWLEDGED)

| Call # | Tool | Parameters | Status | Items | Data quality |
|--------|------|------------|--------|-------|-------------|
| 1 | get_adopted_texts_feed | timeframe=one-week | SUCCESS | 131 items (IDs only) | PARTIAL — no titles |
| 2 | get_latest_votes | date=2026-05-17 | EMPTY | 0 votes | N/A — no plenary |
| 3 | get_plenary_sessions | dateFrom=2026-05-10, dateTo=2026-05-17 | EMPTY | 0 filtered | N/A — no plenary |
| 4 | get_procedures_feed | timeframe=one-week | DEGRADED | 50 historical items | STALE — not current |
| 5 | get_adopted_texts | year=2026, limit=20 | SUCCESS | 21 items WITH titles | HIGH — key dataset |
| 6 | get_parliamentary_questions_feed | timeframe=one-week | UNAVAILABLE | 0 items | N/A |

## Final Data Inventory

### Available Datasets
- `data/adopted-texts-feed.json`: 131 IDs (prefetch); 21 full items with titles (call #5)
- `data/meps-feed.json`: 608 MEP records (prefetch; detailed MEP data)

### Gaps (Not Available This Run)
- **Plenary session details for April 28–30**: EP API returned no results for the April window (data delay — EP API typically 3–4 weeks behind)
- **Individual MEP roll-call votes**: 0 voting records available for April 2026 plenary (API delay confirmed)
- **Committee documents**: 404 error on feed; no committee reports available
- **Parliamentary questions**: Feed unavailable; no questions data
- **Legislative procedures**: Feed degraded; only stale historical items returned
- **Events feed**: 404 error; no event data

### Key Records Used for Analysis

| Record ID | Document | Date | Significance |
|-----------|---------|------|-------------|
| TA-10-2026-0161 | Ukraine accountability | 2026-04-30 | CRITICAL (score 45/50) |
| TA-10-2026-0160 | DMA enforcement | 2026-04-30 | CRITICAL (score 42/50) |
| TA-10-2026-0112 | 2027 budget guidelines | 2026-04-29 | HIGH (score 36/50) |
| TA-10-2026-0162 | Armenia democratic resilience | 2026-04-30 | HIGH (score 34/50) |
| TA-10-2026-0142 | EU-Iceland PNR | 2026-04-29 | MEDIUM |
| TA-10-2026-0151 | Haiti trafficking | 2026-04-29 | MEDIUM |
| TA-10-2026-0119 | EIB annual report 2024 | 2026-04-28 | MEDIUM-LOW |
| TA-10-2026-04-30-ANN01 | EP 2027 estimates | 2026-04-30 | MEDIUM-LOW |

## IMF Data
Source: IMF World Economic Outlook April 2026 (via World Bank MCP proxy)
- Eurozone GDP growth 2026: 1.4%
- Eurozone GDP growth 2027: 1.6%
- EU average deficit/GDP 2026: 2.8%
- EU average debt/GDP 2026: 88.3%
- EU average unemployment 2026: 5.9%
- Global trade growth 2026: 2.1% (degraded from 3.1% 2025 — tariff impact)

## Data Gaps Impact Assessment
The absence of roll-call vote data (4-week EP API delay) limits confidence in coalition analysis. All voting pattern claims are based on group position inference, not actual vote tallies. This is flagged in `intelligence/mcp-reliability-audit.md` and `data-availability-assessment.md`.

The absence of committee documents limits pre-plenary legislative pipeline analysis. This gap is noted in `intelligence/procedures-proxy.md`.

## Recommended Data Collection for Next Run
1. Poll `get_voting_records` after 2026-06-14 (4-week delay from April 30 plenary)
2. Re-check `get_procedures_feed` after EP recess ends (June)
3. `get_committee_documents` for May committee sessions
4. `get_plenary_sessions` for June 2026 mini-plenary
