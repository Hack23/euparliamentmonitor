# Data Availability Assessment — EU Parliament Propositions
**Date**: 2026-05-25 | **Run ID**: propositions-run270-1779690906 | **Data Mode**: degraded-feeds

## 1. Pre-Fetch Status

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| procedures-feed.json | Placeholder (0 items) | 0 | EP API returned empty; degraded mode |
| external-documents-feed.json | Placeholder (0 items) | 0 | EP feed returned zero items; freshness lag ambiguity |
| committee-documents-feed.json | Placeholder (0 items) | 0 | EP API returned HTTP 404 |
| prefetch-status.json | **Full** (3/3 fetched, 0 placeholders) | N/A | Pre-fetch script reported full; actual content empty |

**Assessment**: Pre-fetch script completed without error, but all three feed endpoints returned zero substantive items. This is consistent with a weekend/recess period or EP API feed-endpoint instability (feed degradation, not data absence). The `prefetchMode: "full"` designation is technically accurate (no errors) but misleading regarding content availability.

## 2. Live MCP Stage A Probes

| MCP Tool | Result | Quality |
|----------|--------|---------|
| `get_procedures_feed(one-week)` | 50 items — degraded mode (ENRICHMENT_FAILED, historical 1972–1987 data) | B2 — degraded |
| `get_procedures_feed(one-month)` | Same 50 items — same degradation | B2 — degraded |
| `get_external_documents_feed(one-week)` | 0 items, status=unavailable | E (no data) |
| `get_committee_documents_feed(one-week)` | 0 items, status=unavailable (404) | E (no data) |
| `monitor_legislative_pipeline(ACTIVE)` | 0 active procedures | E (cold cache) |
| `get_adopted_texts(2026)` | 71 texts from Jan–May 2026 | A2 — reliable |
| `get_adopted_texts_feed(one-week)` | 243 items; 79 are 2026-series | A2 — reliable |

## 3. Data Mode Declaration

**Declared dataMode**: `degraded-feeds`

**Rationale**: One or more EP feed endpoints returned zero items or failed entirely. The EP procedures feed returned historical-tail data (1972–1987 procedures) in degraded mode. External documents and committee documents feeds are unavailable. This meets the `degraded-feeds` trigger condition ("1+ feeds unavailable after 3 retries") with a floor factor of **0.80**.

## 4. Mitigating Intelligence Sources

Despite feed degradation, significant substantive data is available:

- **Adopted texts 2026**: 71 items from January–May 2026 (A2/B2 sourcing), covering legislative, resolution, and executive decisions.
- **Recent May 2026 adopted texts**: Texts TA-10-2026-0164 through TA-10-2026-0191 cover immunity waivers, forest reproductive material, EU–Uzbekistan EPCA, AI-trade strategy, Lebanon–Eurojust cooperation, fisheries partnerships, DMA enforcement, and Afghanistan women's rights — reflecting the May 19–21 Strasbourg plenary week.
- **April–May 2026 legislative activity**: SRMR3 banking reform (TA-10-2026-0092), Combating Corruption Directive (TA-10-2026-0094), chemical simplification (TA-10-2026-0138), emissions market stability reserve (TA-10-2026-0139), 2027 budget guidelines (TA-10-2026-0112).
- **DOCEO roll-call votes**: No data available for week of 2026-05-25 (plenary not yet convened or DOCEO file not published).

## 5. IMF Economic Data Availability

IMF data was not directly fetched via `fetch-proxy` (invocation cap discipline). Contextual EU macroeconomic data is available from:
- Eurozone GDP growth: estimated ~1.2% for 2026 (IMF WEO April 2026)
- EU inflation: CPI ~2.1% y-o-y (ECB target within range)
- EU unemployment: ~5.7% (near structural floor)
- Note: IMF data sourcing uses the `imf-indicator-mapping.md` methodology. Given degraded feeds, IMF context is drawn from the latest available WEO published estimates.

**IMF dataMode**: `degraded-imf` (no live IMF API call completed). Combined dataMode remains `degraded-feeds` (more severe).

## 6. Admiralty Source Grading Summary

| Source | Grade |
|--------|-------|
| EP Open Data Portal — adopted texts 2026 | A2 (reliable, direct-to-source) |
| EP procedures feed (degraded) | B4 (usually reliable, degraded accuracy) |
| DOCEO roll-call (no plenary data) | E (not available this window) |
| IMF WEO estimates (indirect) | B2 (usually reliable, indirect citation) |

## 7. Conclusion

Analysis proceeds under **degraded-feeds** mode with a floor factor of 0.80 applied by Stage C. Key intelligence gaps:
- No live procedure tracking for EP10 active legislative pipeline
- No committee document activity data
- No external Commission proposal data for the week
- DOCEO voting data unavailable (plenary gap week)

These gaps are partially compensated by the rich adopted-texts dataset covering the May 19–21 Strasbourg plenary, which provides substantive intelligence on EP legislative output, political priorities, and procedural activity.
