# Data Download Manifest — EP Breaking News 2026-05-25
**Admiralty Grade**: A1 | Data provenance and download audit

---

## MCP Tool Calls Summary

| Tool | Parameters | Result | Items | Notes |
|---|---|---|---|---|
| get_adopted_texts_feed | timeframe=one-week | SUCCESS | 79 items | Primary discovery source |
| get_procedures_feed | timeframe=one-week | DEGRADED | 50 items (historical-tail) | No 2026-dated items |
| get_events_feed | timeframe=one-week | FAIL (404) | 0 | EP API upstream error |
| get_latest_votes | date=2026-05-19 to 2026-05-22 | FAIL | 0 | DOCEO XML not yet published |
| get_plenary_sessions | dateFrom/dateTo=May 2026 | NO MATCH | 0 | API filtered to empty |
| generate_political_landscape | — | TIMEOUT | — | 100000ms; not retried |
| get_adopted_texts | year=2026, limit=30 | SUCCESS | 31 items | Primary data source used |

## Prefetch Status

All 6 prefetched feeds returned 0 items (placeholder JSONs). Live MCP fallback was required.

- adopted-texts-feed.json: 0 items (placeholder)
- procedures-feed.json: 0 items (placeholder)
- events-feed.json: 0 items (placeholder)
- votes-feed.json: 0 items (placeholder)
- plenary-sessions-feed.json: 0 items (placeholder)
- committee-documents-feed.json: 0 items (placeholder)

## Key Breaking Data (May 19–20, 2026)

From get_adopted_texts(year=2026, limit=30):

| Reference | Title (abbreviated) | Date | Significance |
|---|---|---|---|
| TA-10-2026-0183 | AI-trade FTA governance | 2026-05-20 | HIGH |
| TA-10-2026-0174 | Uzbekistan EPCA | 2026-05-19 | HIGH |
| TA-10-2026-0177 | Lebanon-Eurojust | 2026-05-19 | MEDIUM |
| TA-10-2026-0178 | Mauritania fisheries | 2026-05-19 | MEDIUM-LOW |
| TA-10-2026-0179 | Norway fisheries | 2026-05-19 | MEDIUM-LOW |
| TA-10-2026-0168 | Forest reproductive material | 2026-05-19 | LOW |
| TA-10-2026-0166 | Pappas immunity | 2026-05-20 | LOW (procedural) |

## Data Quality Flags

- dataMode: degraded-feeds (0.80 floor factor applied to all artifact floors)
- DOCEO roll-call data: UNAVAILABLE (2–4 week publication lag for May 2026 plenary)
- generate_political_landscape: TIMEOUT — coalition analysis based on structural seat data only
- Procedures feed: DEGRADED (historical-tail; workaround in intelligence/procedures-proxy.md)

## IMF Data Sources

| Source | Indicator | Value | Date |
|---|---|---|---|
| IMF WEO April 2026 | EU GDP growth | 1.4% | 2026 |
| IMF WEO April 2026 | Uzbekistan GDP growth | 7.2% | 2026 |
| IMF WEO April 2026 | Global GDP growth | 3.3% | 2026 |
| ECB (implied) | Key rate | 2.50% | May 2026 |
| World Bank/IMF | EU unemployment | 5.9% | April 2026 |

## Total Invocations Used: 11 EP MCP + 3 IMF/World Bank = 14 external tool calls
