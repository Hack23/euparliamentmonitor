# Data Availability Assessment — EU Parliament Breaking News 2026-05-21
**Framework**: Stage A Data Quality Assessment
**Date**: 2026-05-21 | **DataMode**: degraded-voting | **Admiralty**: B2

## Prefetch Status

| Feed | Status | Items | Quality |
|------|--------|-------|---------|
| adopted-texts-feed | ✅ SUCCESS | 500 items (340 EP10) | HIGH |
| meps-feed | ✅ SUCCESS | 610 current MEPs | HIGH |
| committee-documents-feed | ⚠️ PARTIAL | Feed returned 0 items | DEGRADED |
| events-feed | ❌ FAILED | 404 error from EP API | UNAVAILABLE |
| procedures-feed | ❌ FAILED | 0 bytes returned | UNAVAILABLE |
| documents-feed | ⚠️ PARTIAL | 0 structured items | DEGRADED |

**Prefetch Mode**: full (per prefetch-status.json — 6 fetched, 0 placeholders)
**Effective Coverage**: 2 of 6 feeds providing substantive data

## Data Mode Determination

| Axis | Condition | Applicable? |
|------|-----------|-------------|
| full | All feeds OK + IMF + voting | NO |
| degraded-feeds | 1+ feeds unavailable | YES |
| degraded-imf | IMF data unavailable | NO (fallback used) |
| degraded-voting | EP DOCEO roll-call unavailable | YES |
| minimal | Most EP feeds + IMF absent | NO |

**Selected Mode**: `degraded-voting` (15% floor reduction applied — more severe than degraded-feeds 20% reduction because DOCEO voting data is the analytically critical gap for a breaking news session covering legislative adoption events)

## IMF Data Status

**Source**: World Bank and IMF MCP tools — fallback economic context available
**Coverage**: GDP projections, trade volumes, Euro area monetary data
**Vintage**: 2025 (most recent available)
**Gap**: No 2026 Q1 vintage available yet; using IMF WEO April 2025 projections

## EP API Status Assessment

**Critical Gap — DOCEO Voting Data**:
- All 8 May 19-20 texts were confirmed adopted via EP Open Data Portal adopted-texts endpoint
- Individual vote tallies (For/Against/Abstain per group) are ESTIMATED from text characteristics and historical voting pattern analysis
- DOCEO XML files are not available via MCP for May 2026 sessions (expected 4-6 week publication lag)
- Confidence in vote tally estimates: MEDIUM (Admiralty C3 for individual group tallies)

**Procedures API Gap**:
- T10-0183, T10-0174 procedure history unavailable
- Rapporteur identities could not be confirmed
- Committee report vote dates could not be confirmed
- Mitigation: using document identifier patterns to infer procedure type

## Analytical Impact

**What we know with HIGH confidence**:
- All 8 texts were adopted (confirmed from adopted-texts-feed)
- Legislative document identifiers and labels are accurate
- MEP composition and group membership is current (MEPs API available)
- IMF economic context data available (with vintage note)

**What is ESTIMATED (MEDIUM confidence)**:
- Group-level voting tallies
- Specific amendment outcomes
- Rapporteur identities

**What is UNKNOWN**:
- Individual MEP voting positions
- Procedural history details
- Committee vote details

---
*Data Availability Assessment | DataMode=degraded-voting | 0.85 floor factor | Admiralty B2 | 2026-05-21*

## Re-Run Data Probe Results (breaking-run261)

Stage A MCP probes in this re-run confirmed the following data availability:

| Probe | Tool | Result | Impact |
|-------|------|--------|--------|
| Adopted texts feed (today) | get_adopted_texts_feed | 58 texts confirmed | HIGH value |
| Latest votes | get_latest_votes | 0 records; 4 dates unavailable | Confirms degraded-voting |
| Plenary sessions (May 19-21) | get_plenary_sessions | 0 filtered results | Confirms API gap |
| Single text content (T10-0183) | get_adopted_texts | UPSTREAM_404 | Confirms content lag |
| Procedures feed | get_procedures_feed | Historical data only (STALENESS_WARNING) | Low value |

**Final dataMode**: `degraded-voting` (unchanged from prior run)
**Floor factor**: 0.85 (unchanged)
**Net information gain from re-run probes**: Confirmation that prior run assessment was correct; no new substantive information about the texts themselves.
