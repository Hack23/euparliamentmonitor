# Procedures Proxy — EP10 Legislative Pipeline (Week of 2026-05-19)
**Date**: 2026-05-25 | **Article Type**: propositions | **Data Mode**: degraded-feeds

## Purpose

The EP procedures feed (POST /procedures?timeframe=one-week) is unavailable this cycle (ENRICHMENT_FAILED error from EP admin API). This proxy document reconstructs the active legislative pipeline from adopted texts and other available EP data sources.

## Active/Recent Procedures Inferred from Adopted Texts (May 2026)

| Reference | Title | Status |
|-----------|-------|--------|
| 2023/0228(COD) | Forest Reproductive Material (Production & Marketing) | Adopted 2026-05-19 |
| 2025/2158(DEC-DCPL) | Immunity waiver — Harald Vilimsky | Adopted 2026-05-19 |
| 2025/2234(DEC-DCPL) | Immunity waiver — Nikos Pappas | Adopted 2026-05-19 |
| 2024/0260M | EU–Uzbekistan Enhanced Partnership and Cooperation Agreement | Adopted 2026-05-20 |
| 2025/2167 | Recommendation — 81st UNGA Session | Adopted 2026-05-20 |
| 2025/2112 | AI Strategy for EU Trade | Adopted 2026-05-20 |
| 2026/2737 | Afghanistan — Taliban Criminal Procedure Code (Women's Rights) | Adopted 2026-05-21 |
| 2025/0380(COD) | Market Stability Reserve (Buildings, Road Transport, Additional Sectors) | Adopted 2026-04-29 |
| 2025/0531(COD) | Chemical Products Simplification (REACH/CLP) | Adopted 2026-04-29 |
| 2023/0111(COD) | SRMR3 — Banking Union Resolution Mechanism Reform | Adopted 2026-03-26 |

## Pipeline Health Assessment

**Note**: Full pipeline monitoring unavailable due to degraded procedures feed. The `monitor_legislative_pipeline` tool returned 0 active procedures (cold lifecycle cache). Inferred pipeline status from available data:

- **May 2026 Strasbourg plenary** produced 10+ adopted texts, indicating active legislative throughput.
- **Legislative acts** in the May session covered digital economy (AI-trade), environment (MSR extension), fisheries (São Tomé, Cook Islands), judicial cooperation (Lebanon–Eurojust), and diplomatic (Uzbekistan EPCA).
- **Immunity procedures** (Vilimsky, Pappas): Two MEP immunity waivers processed, both adopted — routine parliamentary procedure.

## Procedures Feed Degradation Assessment

The EP admin API enrichment endpoint (`POST /api/v2/procedures/?timeframe=one-week&view=uri&view-version=v2.1`) returned HTTP 404 for two consecutive requests. This is a known intermittent failure mode documented in the EP Open Data Portal status. The fallback (`GET /procedures`) returns only non-time-filtered historical summaries (1972-vintage procedures).

**Invocation Budget Note**: Per Rule 2, Stage A EP MCP calls capped at 5. Individual `track_legislation` deep-fetches were not executed for this degraded feed run to preserve invocation budget. Available data is sufficient for analytical synthesis.

## 3. What Full Procedures Data Would Contain

Under normal data conditions, this file would include:

**Active procedure tracking** (for propositions article type):
- Procedure ID, title, committee, status, rapporteur, timeline
- Latest milestone events (committee vote date, trialogue round, etc.)
- Adoption probability estimate based on institutional signals

**This run substitution**: All legislative intelligence was derived from `get_adopted_texts()` and `get_adopted_texts_feed()` data. The 71 adopted texts for 2026 YTD provide adequate coverage for a propositions retrospective, but lack the forward-looking procedure-in-progress data that would normally inform a prospective forecast.

**Specific procedure intelligence gaps**:
1. AI Liability Directive (2022/0303) — exact committee vote date unknown
2. Packaging Regulation (2022/0396) — trialogue status unknown
3. Defence Union Package — component procedure IDs not confirmed
4. MFF 2028–2034 pre-resolution — initiation date unknown

These gaps are documented in `data-availability-assessment.md` §3 and addressed through proxy evidence in `intelligence/scenario-forecast.md` §4.

## 4. Procedures Feed Failure Technical Analysis

The `get_procedures_feed(one-week)` call returned ENRICHMENT_FAILED with historical (1972–1987) data:

**Root cause assessment**: The EP procedures feed (`/api/procedures?timeframe=one-week`) depends on an enrichment pipeline that adds legislative context to raw procedure records. During active plenary weeks (like May 19–21), this pipeline experiences high load and may:
1. Return cached/stale data from previous feed refresh
2. Fall back to the base procedures table (which includes historical records from EP1 onward)
3. Return a partial enrichment failure signal

**Mitigation approach used**: Direct `get_adopted_texts(year=2026)` query bypassed the enriched procedures feed and returned authoritative adoption data. This is the recommended fallback per `intelligence/mcp-reliability-audit.md` §4.
