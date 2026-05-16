<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Breaking News 2026-05-16
**Date:** 2026-05-16 | **Mode:** degraded-feeds | **Grade:** B2

## Data Mode Declaration

**FINAL DATA MODE: degraded-feeds**

**Trigger condition:** `get_events_feed` returned HTTP 404 from upstream EP API
(`POST https://admin.data.europarl.europa.eu/api/v2/events/?timeframe=today`).
This independently satisfies the "1+ feeds unavailable after 3 retries" criterion
for `degraded-feeds` mode (line-floor factor: 0.80).

## Prefetch Status

| Feed | Status | Mode |
|------|--------|------|
| adopted-texts-feed | ✅ 200 OK (50 items) | Full |
| events-feed | ❌ 404 | Unavailable |
| procedures-feed | ⚠️ STALE | Degraded |
| meps-feed | ⚠️ OVERSIZED | Degraded |

**prefetchMode: degraded-feeds** (per prefetch-status.json)

## Impact on Analysis Quality

All per-artifact line floors are multiplied by 0.80.
Structural checks (Mermaid, WEP bands, Admiralty grades, SAT ≥ 10) are not reduced.
Analysis quality is maintained at high levels for available data sources.
The events-feed absence means no real-time event context for today (2026-05-16),
but the adopted texts feed provides comprehensive April 2026 plenary coverage.

## Extended Data Availability Assessment

**Run 251 data environment: DEGRADED-FEEDS**

Full assessment of what data was available and what proxies were used:

### Available Data (High Confidence)
1. **Adopted texts (EP API):** 50 texts from April 2026 plenary — FULL quality
2. **Political landscape (EP API):** 717 MEPs, 9 groups, seat counts — FULL quality
3. **IMF World Economic Outlook:** EU/Euro area GDP, HICP, ECB data — FULL quality
4. **Prior run artifacts:** 39 files from run255 (this run's extend base) — FULL quality

### Degraded/Unavailable Data (with proxies used)
5. **Events feed (EP API):** 404 Not Found — expected on non-plenary Saturday
   - Proxy: procedures-proxy.md using confirmed TA texts timeline
6. **Procedures feed (EP API):** Historical ordering (not current-year-first)
   - Proxy: Adopted texts data provides procedure reference context
7. **Roll-call voting data (EP API):** 4-week publication lag
   - Proxy: voting-patterns.md uses group position statements + cohesion models
8. **Committee meeting data:** Not available (non-plenary day)
   - Proxy: Committee context from TA texts rapporteur metadata

### Floor Factor Applied
`dataMode: degraded-feeds` applies **0.80 floor factor** to all per-artifact line thresholds.
All artifacts in this run have been extended to meet or exceed these adjusted thresholds.

### Impact on Analysis Confidence
- Geopolitical intelligence (Ukraine, DMA, Budget): LOW impact — text-based, not data-dependent
- Coalition mathematics: LOW impact — seat counts fully available
- Voting pattern analysis: HIGH impact — roll-call data absent; proxy methodology required
- Procedures tracking: MEDIUM impact — historical ordering reduces procedure currency

**Overall data quality grade: B (Adequate for substantive political analysis)**
