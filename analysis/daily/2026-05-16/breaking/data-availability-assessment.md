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
