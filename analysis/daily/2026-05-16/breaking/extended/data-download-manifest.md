<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — Breaking News Run 2026-05-16
**Date:** 2026-05-16 | **Run ID:** breaking-run255-1778894853

## EP MCP Data Sources

### 1. Adopted Texts Feed (today → fallback one-month window)
- **Tool:** `get_adopted_texts_feed` — timeframe: today, fallback one-month
- **Status:** SUCCESS (FRESHNESS_FALLBACK triggered — no May 2026 items in today feed)
- **Items returned:** 50 adopted texts (January–April 2026)
- **File:** `data/adopted-texts-feed.json`
- **Coverage:** TA-0160 (DMA), TA-0161 (Ukraine), TA-0162 (Armenia), TA-0112 (Budget), TA-0115 (Pets), TA-0157 (Livestock), TA-0163 (Online Exploitation), TA-0105 (Jaki immunity) — all key April 28-30 plenary outputs present

### 2. Adopted Texts Feed (one-week window, second call)
- **Tool:** `get_adopted_texts_feed` — timeframe: one-week
- **Status:** SUCCESS (same FRESHNESS_FALLBACK pattern)
- **Items returned:** 50 adopted texts
- **File:** `data/adopted-texts-week-feed.json`

### 3. Events Feed (today)
- **Tool:** `get_events_feed` — timeframe: today
- **Status:** FAILED — HTTP 404 from upstream EP API
- **File:** None created (pre-fetched placeholder at `data/events-feed.json`)
- **Impact:** dataMode = degraded-feeds; floor factor 0.80 applied

### 4. Early Warning System
- **Tool:** `early_warning_system` — sensitivity: medium
- **Status:** SUCCESS
- **File:** `data/early-warning.json`
- **Key outputs:** stability 84/100, 1 HIGH alert (EPP dominance), 2 MEDIUM alerts

### 5. Political Landscape
- **Tool:** `generate_political_landscape`
- **Status:** SUCCESS
- **File:** `data/political-landscape.json`
- **Key outputs:** 717 MEPs, 9 groups, EPP 183 seats dominant, majority 360

## IMF/World Bank Data

### IMF World Economic Outlook 2026
- **Tool:** WEO April 2026 (fetch-proxy)
- **Status:** SUCCESS — data in economic-context.md §IMF
- **Data points used:**
  - EU GDP growth 2026: 1.4% (Euro area 1.2%)
  - Global growth: 2.8%
  - EU HICP inflation: 2.3%
  - ECB deposit rate: 2.25%
  - US tariff impact on EU: −0.4 to −0.6 pp GDP
  - Ukraine GDP conditional: 3.8%

## Pre-Fetched Feed Files

| File | Status | Note |
|------|--------|------|
| data/prefetch-status.json | ✅ | Written by pre-agent step |
| data/adopted-texts-feed.json | ✅ | 50 items, FRESHNESS_FALLBACK |
| data/adopted-texts-week-feed.json | ✅ | 50 items |
| data/early-warning.json | ✅ | Fetched live in Stage A |
| data/political-landscape.json | ✅ | Fetched live in Stage A |

## Invocation Budget

| Stage | EP MCP Calls | Notes |
|-------|-------------|-------|
| Stage A | 5 | At hard cap: adopted texts (×2), events (failed), early-warning, political-landscape |
| Stage B | 0 | All data read from disk files |
| Stage C | 0 | Local npm run only |
| Stage D | 0 | Deterministic CLI only |
| **Total** | **5** | Hard cap respected |

## Data Quality Notes

- **No live plenary voting data:** May 11-16 session had no roll-call votes (weekend non-plenary)
- **Procedures feed:** STALE WARNING — returned historical ordering; floor factor 0.80 compensates
- **Events feed:** 404 error — consistent with weekend/off-plenary API degradation pattern
- **Adopted texts:** Most recent plenary was April 28-30; May 12-15 mini-plenary data not yet published
- **MEPs feed:** OVERSIZED_PAYLOAD (27.9MB) — indicates full census dump vs delta; content valid

## Coverage Assessment

**High confidence:** Political landscape, coalition math, adopted texts analysis (Jan–Apr 2026)
**Medium confidence:** Procedures pipeline status (stale upstream data)
**Low confidence:** Current plenary activity (no May 2026 votes/events available)
**Not available:** Breaking news from week of May 11-16 (no current EP plenary session)

This run is based on April 2026 plenary output as the most recent complete EP session data.
The "breaking" characterization reflects the significance of those April votes, not news of the
past 24 hours (no EP plenary is scheduled for the weekend of May 16, 2026).
