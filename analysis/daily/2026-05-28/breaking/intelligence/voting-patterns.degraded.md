# Voting Patterns — Degraded Mode Attestation
**Date:** 2026-05-28 | **Mode:** degraded-voting

---

This artifact attests that the voting patterns analysis for 2026-05-28 breaking news run was conducted in degraded mode due to DOCEO roll-call data publication lag.

## Degraded Mode Confirmation

**DOCEO data status:** NOT AVAILABLE for May 19–21, 2026 plenary session
**Expected availability:** ~June 5–15, 2026 (standard 2–4 week lag)
**Degraded mode activated:** YES — `degraded-voting` condition met per data-mode protocol

## Fallback Methodology Applied

Primary voting analysis is in `intelligence/voting-patterns.md` using C2-grade proxy methodology:
1. Seat distribution modelling (720 seats, EP10 composition)
2. Historical EP10 DOCEO patterns (from 2024 sessions where data is available)
3. Group cohesion estimates (per-group historical averages)
4. Historical vote type baselines (trade, urgency, assent)

## Vote Estimates (Degraded)

| Text | Estimated FOR | Estimated AGAINST | Confidence | WEP >400 FOR |
|---|---|---|---|---|
| TA-10-2026-0183 (AI Trade) | ~471 | ~106 | C2 (LOW-MOD) | 88% |
| TA-10-2026-0186 (Afghanistan) | ~625 | ~50 | C2 (MODERATE) | 93% |
| TA-10-2026-0180 (EU-Canada SAFE) | ~453 | ~122 | C2 (MODERATE) | 87% |

## Data Limitation Attestation

Per `data-availability-assessment.md`: DOCEO voting data is classified as `degraded-voting` (0.85 factor per data mode table), but since `degraded-feeds` (0.80 factor) takes precedence as the primary declared data mode, the overall line-floor factor applied to all artifacts is 0.80.

This attestation document certifies that the voting analysis methodology was applied correctly and that all uncertainty is clearly flagged throughout the analysis artifacts.

**Analyst attestation:** Voting pattern analysis completed with appropriate degraded-mode methodology; all coalition claims flagged as C2-grade inference; DOCEO follow-up monitoring scheduled for ~June 5–15, 2026.

---

*Degraded-voting mode | 2026-05-28 | Run: breaking-run265-1779932393*
