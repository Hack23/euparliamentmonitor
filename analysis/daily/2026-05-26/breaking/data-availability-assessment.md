# Data Availability Assessment
**Date:** 2026-05-26 | **Article Type:** breaking
**dataMode:** degraded-feeds

---

## Summary

This assessment documents data availability, quality, and limitations for the May 2026 breaking analysis.

### Feed Availability

| Feed | Status | Items | Quality Impact |
|---|---|---|---|
| Adopted texts (primary) | ✅ AVAILABLE | 500 | Minimal — primary data confirmed |
| MEPs roster | ✅ AVAILABLE | 493 | Minimal — coalition analysis confirmed |
| Committee documents | ✅ AVAILABLE | Multiple | Minimal — background context |
| Documents feed | ✅ AVAILABLE | Multiple | Minimal — plenary documents |
| Events feed | ❌ 404 ERROR | 0 | MODERATE — no event schedule data |
| Procedures feed | ❌ 404 ERROR | 0 | MODERATE — no legislative procedure data |

### DOCEO Roll-Call Votes

**Status:** NOT PUBLISHED (expected delay 2-4 weeks post-session)
**Impact:** Coalition analysis uses estimated vote distributions
**Uncertainty range:** ±10 percentage points on group vote share estimates
**Mitigation:** Historical baseline provides strong prior; estimates bounded with documented uncertainty

### dataMode Classification

**dataMode: degraded-feeds**

Applied threshold reduction factor: 0.80 (20% reduction from full-data thresholds)

Rationale:
- 2 of 6 primary feeds unavailable (events, procedures)
- Roll-call data absent (expected, not error condition)
- Primary legislative record (adopted texts) confirmed — analysis not fundamentally compromised

### Quality Summary

The analysis is:
- HIGH quality for: factual record of adopted texts, coalition dynamics, strategic implications, economic context (IMF)
- MODERATE quality for: legislative procedure detail, exact vote shares, implementation timeline specifics
- LOW quality for: individual MEP position analysis, amendment process history

**Overall assessment:** SUFFICIENT for breaking analysis purposes. All degraded data areas are documented with uncertainty ranges.
