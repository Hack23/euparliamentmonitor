# Data Availability Assessment — EP Breaking News 2026-05-25

---

## Summary
- **dataMode**: degraded-feeds
- **Line-floor factor**: 0.80
- **Date**: 2026-05-25
- **Assessment by**: Stage A data collection audit

## Available Data
- EP adopted texts 2026 (31 items via direct endpoint) ✅
- IMF WEO April 2026 (economic context) ✅
- EP group composition (from memory/context) ✅

## Unavailable Data
- Today/one-week EP feeds (all returned 0 items)
- Events feed (404 error)
- DOCEO voting records May 2026 (publication lag)
- Procedures feed 2026 entries (historical-tail degradation)

## Impact Assessment
Primary analytical depth is MAINTAINED because adopted texts provide sufficient substantive data.
Coalition and voting analysis is DEGRADED but explicitly flagged.
Economic context is FULL (IMF data unaffected by EP feed issues).

## Recommendation
All artifacts sized to 0.80 floor factor given degraded-feeds mode.

---

## Extended Data Availability Analysis

### Feed Health Matrix (2026-05-25 Run 2 Assessment)

| Feed | Status | Items Available | Quality | Impact on Analysis |
|------|--------|----------------|---------|-------------------|
| adopted-texts-feed | ✅ OPERATIONAL | 500 items (8 from May 2026) | HIGH | PRIMARY source — breaking news core |
| meps-feed | ✅ OPERATIONAL | 720+ MEPs | MEDIUM | Membership confirmation only |
| committee-documents-feed | ❌ UNAVAILABLE (404) | 0 | N/A | LOW impact — committee docs available by direct query |
| procedures-feed | ❌ DEGRADED (pre-2020 data) | ~50 items (historical only) | VERY LOW | HIGH impact — active procedures invisible |
| events-feed | ❌ UNAVAILABLE (404) | 0 | N/A | MEDIUM impact — no EP event schedule for May 20 |
| DOCEO RCV votes | ❌ UNAVAILABLE (2-4 week lag) | 0 | N/A | HIGH impact — no individual MEP votes available |
| IMF WEO April 2026 | ✅ OPERATIONAL | Full WEO dataset | HIGH | SECONDARY source — economic context complete |

### Impact Mitigation

**For degraded procedures-feed**: Used adopted text procedure references as proxy. Mapped 5 procedure types from TA metadata. Gap: active committee-stage procedures invisible.

**For missing DOCEO votes**: Used historical group cohesion patterns (EP8/EP9 base rates) to estimate May 2026 voting. Clearly labeled as estimated (Admiralty C2).

**For missing events-feed**: EP plenary calendar is public knowledge (19–22 May 2026 Strasbourg week confirmed from adopted text dates).

### Data Grade: MEDIUM-HIGH despite degradation

The adopted texts feed provides direct observation of EP legislative output — the highest-value signal for breaking news analysis. The procedures and events feed gaps are secondary given that post-plenary analysis requires output tracking, not schedule-forward tracking.

**Overall data mode**: `degraded-feeds` | Grade: B+ | Line-floor reduction factor: 0.80 applied to all Stage C thresholds.

*Data Availability Assessment v2.0 — Pass 2 extended | Feed health matrix | Impact mitigation documented | 2026-05-25 | Admiralty A1 (direct operational data)*
