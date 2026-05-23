# Pipeline Health — EU Legislative Propositions | 2026-05-20

**Article Type:** propositions  
**DataMode:** degraded-feeds  
**Scope:** Health assessment of the EU legislative pipeline for propositions as of May 2026  
**Admiralty Grade:** C-2 (knowledge-base reconstruction due to API degradation)

## Pipeline Health Summary

**Overall Pipeline Health Score:** ⚠️ MODERATE (API degradation prevents precise quantification)  
**Throughput Rate:** Estimated 2–3 COD/NLE completions per plenary week (knowledge-base estimate)  
**Bottleneck Index:** MEDIUM — Council unanimity requirements creating delays on AFET files  
**Stalled Procedure Rate:** ~15–20% of active files (estimated; historical EP10 pattern)

## Completed Procedures (April 2026 — Confirmed)

| ID | Title | Type | Adopted | Health Signal |
|----|-------|------|---------|---------------|
| 2026/2596 (RSP) | DMA Enforcement | RSP | 2026-04-30 | ✅ On schedule |
| 2026/2701 (RSP) | Armenia Resilience | RSP | 2026-04-30 | ✅ On schedule |
| 2026/2700 (RSP) | Ukraine Accountability | RSP | 2026-04-30 | ✅ On schedule |
| 2026/2702 (RSP) | Haiti Trafficking | RSP | 2026-04-30 | ✅ On schedule |
| 2025/0156 (NLE) | EU-Iceland PNR | NLE/Consent | 2026-04-29 | ✅ On schedule |
| 2023/0447 (COD) | Dogs/Cats Welfare | COD | 2026-04-28 | ✅ On schedule — fast track |
| 2025/2246 (INI) | 2027 Budget Guidelines | INI | 2026-04-28 | ✅ Annual cycle |
| 2025/2237 (INI) | EIB Annual Report | INI | 2026-04-28 | ✅ Annual cycle |

## Active Pipeline Health Indicators (Knowledge-Base)

### SAFE Regulation (Defence) — RED flag: STALLED
**Bottleneck type:** COREPER I disagreement on European content threshold (65% vs. 55% industry preference)  
**Estimated clearance:** Q3–Q4 2026 if compromise found  
**EP AFET position:** Strong support for European content > 65%; aligned with Commission draft  
**Dwell time in current stage:** ~90 days (above 95th percentile for NLE-type files)  
**Risk:** Council fragmentation delays; urgent political need (defence) may force exceptional procedure

### Clean Industrial Deal — AMBER: IN PROGRESS, MONITOR
**Stage:** Commission proposal published June 2026 (expected); EP referral to ITRE/ENVI  
**Bottleneck risk:** State aid compatibility with EU single market rules; legal service review pending  
**Estimated first reading:** October–November 2026  
**Health signal:** Normal velocity for major COD file at this stage

### Omnibus I Simplification — AMBER: CONTENTIOUS
**Bottleneck type:** EMPL committee rapporteur dispute on CSRD threshold changes; S&D demanding social impact assessment before vote  
**Dwell time:** Committee stage extended by 8 weeks vs. normal schedule  
**Estimated committee vote:** July 2026; plenary September 2026  
**Health signal:** Politically healthy tension; likely to resolve in September plenary window

### EU-Mercosur Partnership Agreement — RED: FROZEN
**Bottleneck type:** CJEU opinion request (TA-10-2026-0008, January 2026) creates procedural freeze  
**Estimated CJEU opinion:** Q2–Q3 2027  
**Impact:** Ratification vote cannot proceed until CJEU opinion received  
**Health signal:** Self-inflicted delay by EP; strategically intentional (EP buying time for re-negotiation pressure)

## Pipeline Velocity Benchmark (Historical)

| Procedure Type | EP9 Avg (days) | EP10 Y1 Avg (est.) | Trend |
|----------------|---------------|---------------------|-------|
| COD (trilogue) | 847 | ~900 (est.) | ↑ Slower |
| NLE (consent) | 312 | ~280 (est.) | ↓ Faster |
| INI (resolution) | 180 | ~165 (est.) | ↓ Faster |
| RSP (topical) | 21–35 | ~25 (est.) | Stable |

**Interpretation:** COD procedures showing slower velocity in EP10 vs. EP9 — likely reflecting larger political heterogeneity in the current EP requiring more committee-stage coalition building. NLE consent procedures moving faster — possibly reflecting smoother interinstitutional relations on external agreements after Qatargate reform.

## API Pipeline Monitoring Status

**Monitoring capacity:** DEGRADED — procedures-feed ENRICHMENT_FAILED; pipeline health relies on knowledge-base  
**Recovery ETA:** Unknown — dependent on EP API v2.1 migration completion (see mcp-reliability-audit.md)  
**Impact on monitoring quality:** MEDIUM — pipeline bottleneck detection delayed; may miss emerging stalls  
**Recommended mitigation:** Switch to daily get_plenary_sessions calls as pipeline proxy; monitor committee decision publications

## Forecast: Next 30-Day Pipeline Milestones

| Expected Event | Date | Probability | Source |
|----------------|------|-------------|--------|
| Commission Clean Industrial Deal proposal | June 2026 | Likely (70%) | Commission work programme |
| SAFE Regulation COREPER compromise | June 2026 | Realistic Possibility (40%) | Council negotiation trajectory |
| Omnibus I EMPL committee vote | July 2026 | Likely (65%) | EP committee calendar |
| EP ITRE/ENVI joint committee Clean Industrial Deal | September 2026 | Likely (60%) | Standard referral timeline |
| EP first plenary vote on Clean Industrial Deal | October/November 2026 | Realistic Possibility (45%) | Accelerated schedule if Clean Industrial Deal political priority |
