# Historical Baseline — Propositions — 2026-04-24

**Purpose**: establish a longitudinal baseline (2004–2026, 22 parliamentary
years) against which this month's propositions pipeline is judged.

## 1 · Method

Baseline draws on `european-parliament-get_all_generated_stats`
(methodology v2.0.0, generated 2026-04-20). Source data is
precomputed weekly by the EP's own agentic pipeline from the Open
Data Portal and covers plenary sessions, legislative acts adopted,
procedures opened, roll-call votes, resolutions, speeches, adopted
texts, documents, MEP turnover, and declarations.

For each year we compute:
- **Throughput**: `legislativeActsAdopted`, `procedures`
- **Intensity**: `legislativeOutputPerSession`, `legislativeOutputPerMEP`
- **Fragmentation**: `effectiveNumberOfParties` (ENP, Laakso–Taagepera),
  `herfindahlHirschmanIndex` (HHI), `topTwoGroupsConcentration` (CR₂)
- **Coalition arithmetic**: `minimumWinningCoalitionSize`,
  `grandCoalitionSurplusDeficit`
- **Bloc balance**: `leftBlocShare`, `rightBlocShare`, `euroscepticShare`

## 2 · Throughput Longitudinal (2024 → 2026)

| Year | Term | Acts adopted | Procedures | Plenary sessions | Acts/session | Acts/MEP |
|------|------|-------------:|-----------:|-----------------:|-------------:|---------:|
| 2024 | EP9→EP10 transition | 72  | 676  | 50 | 1.44 | 0.100 |
| 2025 | EP10 Year 1         | 78  | 923  | 53 | 1.47 | 0.108 |
| 2026 | EP10 Year 2 (proj)  | 114 | 935  | 54 | 2.11 | 0.159 |
| Δ 2026 vs 2025 | | **+46.2%** | +1.3% | +1.9% | +43.5% | +47.2% |

**Reading**: 2026 is projected to be the **highest** acts-per-session and
acts-per-MEP year in the full 2004–2026 window. The baseline 2004
figure (pre-Lisbon) was ≈ 0.92 acts/session. EP10 Year-2 is running at
**2.3× the 2004 productivity benchmark** on a per-session basis.

## 3 · Fragmentation Longitudinal

| Year | ENP | HHI | CR₂ | Min coalition | GC surplus/deficit |
|------|----:|----:|----:|:-------------:|-------------------:|
| 2004 | 4.12 | 0.2348 | 63.9% | 2 groups | surplus |
| 2014 | 5.32 | ~0.19 | 51.0% | 2 groups | borderline |
| 2019 | 6.10 | 0.1780 | 47.5% | **3 groups** | **deficit starts** |
| 2024 | 6.51 | 0.1536 | 45.0% | 3 groups | -5.0 |
| 2025 | 6.59 | 0.1517 | 44.5% | 3 groups | -5.5 |
| 2026 | 6.59 | 0.1515 | 44.5% | 3 groups | -5.5 |

**Reading**: the EP crossed a **structural regime change in 2019** when
CR₂ fell below 50% — no two-group majority has been feasible since.
For propositions, this means **every non-consensual file requires a
3-way coalition**. This is the single most important structural
baseline the propositions workflow tracks.

## 4 · Bloc-Balance Longitudinal

| Year | Left bloc | Centre bloc | Right bloc | Eurosceptic | Bipolar index |
|------|----------:|------------:|-----------:|------------:|--------------:|
| 2004 | 42.6% | 18.3% | 39.1% | 5.1% | 0.081 |
| 2014 | 36.0% | 13.5% | 50.5% | 9.8% | 0.142 |
| 2024 | 32.7% | 10.7% | 52.1% | 15.2% | 0.229 |
| 2025 | 32.6% | 10.6% | 52.3% | 15.6% | 0.232 |
| 2026 | 32.6% | 10.6% | 52.3% | 15.6% | 0.232 |

**Reading**: the right-bloc share crossed 50% in 2014 and has never
retreated. The eurosceptic sub-bloc tripled from 2004 to 2026
(5.1% → 15.6%). For propositions, the bloc-balance determines
**which rapporteur is winnable on which file** — a left-coded file
(e.g. social-pillar directives) is now structurally harder to pass
than a right-coded one (e.g. defence, enlargement, industrial
competitiveness).

## 5 · MEP Stability & Institutional Memory

| Year | MEP turnover | Stability idx | Inst. memory risk |
|------|-------------:|--------------:|-------------------|
| 2024 | 405 (56.3%) | 0.438 | HIGH |
| 2025 |  36 ( 5.0%) | 0.950 | LOW |
| 2026 |  39 ( 5.4%) | 0.946 | LOW |

**Reading**: 2024 was a once-in-5-year election reset. 2026 stability
is at the **highest end** of the historical range, which supports
higher throughput: experienced rapporteurs carry files faster through
committee stages. This baseline explains the 2026 projected act-count
spike beyond what raw demand alone would predict.

## 6 · Oversight vs Legislative Balance

| Year | Parl. Qs | MEP oversight intensity (Qs/MEP) | Oversight/legislation balance |
|------|---------:|---------------------------------:|------------------------------:|
| 2024 | 2,970 | 4.13 | 41.3 |
| 2025 | 4,946 | 6.87 | 63.4 |
| 2026 | 6,147 | 8.56 | 53.9 |

**Reading**: Commission-oversight intensity has nearly doubled since
2024. For propositions, this signals that MEPs are **instrumenting
proposition-relevant executive action** more aggressively — which
correlates with tighter Commission-Parliament feedback loops on
implementing regulations (a large share of the projected 114 2026 acts).

## 7 · Reference-Benchmark Positioning

The `reference-quality-thresholds.json` benchmark run is
`analysis/daily/2026-04-18/breaking-run184/` (Easter Saturday reference
run with 36 artifact floors established). This propositions baseline
inherits 14 of those floors (see `../intelligence/analysis-index.md §2`).

## 8 · Change Versus Prior Propositions Runs

Most recent same-type run with the canonical folder layout is
`analysis/daily/2026-04-17/propositions-run45/`. Key deltas to flag:
- **ENP** unchanged at 6.59 (stable)
- **Projected 2026 acts** updated from 78 (Run 45 projection) to
  **114** (current stats pull) — +46% upward revision driven by the
  Q1 2026 actuals absorbing into the projection model.
- **Right-bloc share** unchanged at 52.3% (no new group realignment).

## 9 · Limitations

- 2026 figures are **partial-year projections** with Q1 actuals +
  2021–2025 historical average extrapolation.
- EP9→EP10 fragmentation reporting methodology changed in 2024;
  pre-2024 figures use the legacy EP9 group taxonomy.

*— Historical Baseline · Pass 2 complete · 2026-04-24*
