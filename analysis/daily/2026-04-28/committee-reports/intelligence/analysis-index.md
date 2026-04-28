<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EP Committee Reports | 28 April 2026

**Run date:** 2026-04-28 | **Article type:** committee-reports | **Data window:** 2026-04-21 to 2026-04-28

## Artifact Set Overview

This index maps each analysis artifact produced in this run to its methodology, primary data sources, and Stage B completion status.

| Artifact | Status | Lines (est.) | Key Finding |
|----------|--------|-------------|-------------|
| `executive-brief.md` | ✅ Pass 1 | ~100 | Trilogue on 2025/0261 is most consequential open file |
| `intelligence/analysis-index.md` | ✅ Pass 1 | ~100 | (this file) |
| `intelligence/synthesis-summary.md` | ✅ Pass 1 | ~170 | Multi-track legislative pressure convergence |
| `intelligence/historical-baseline.md` | ✅ Pass 1 | ~140 | EP10 committee productivity patterns |
| `intelligence/economic-context.md` | ✅ Pass 1 | ~130 | ECB oversight, US-EU trade exposure |
| `intelligence/pestle-analysis.md` | ✅ Pass 1 | ~190 | EU digital sovereignty and trade geopolitics |
| `intelligence/stakeholder-map.md` | ✅ Pass 1 | ~210 | Committee chairs, MEP rapporteurs, industry lobbies |
| `intelligence/scenario-forecast.md` | ✅ Pass 1 | ~190 | Mercosur trilogue scenarios; US tariff escalation |
| `intelligence/threat-model.md` | ✅ Pass 1 | ~170 | Procedural delays, political fragmentation risks |
| `intelligence/wildcards-blackswans.md` | ✅ Pass 1 | ~185 | Snap US escalation; ECB policy pivot |
| `intelligence/mcp-reliability-audit.md` | ✅ Pass 1 | ~210 | Feed degradation documented; fallback used |
| `intelligence/reference-analysis-quality.md` | ✅ Pass 1 | ~145 | Quality signals for this run |
| `intelligence/methodology-reflection.md` | ✅ Pass 1 | ~190 | SAT attestation and tradecraft compliance |
| `classification/impact-matrix.md` | ✅ Pass 1 | ~130 | Multi-stakeholder impact of committee output |
| `classification/forces-analysis.md` | ✅ Pass 1 | ~130 | Driving/restraining forces on EP legislative pace |
| `classification/actor-mapping.md` | ✅ Pass 1 | ~140 | Institutional actors in current legislative cycle |
| `risk-scoring/risk-matrix.md` | ✅ Pass 1 | ~110 | Combined risk landscape |
| `risk-scoring/quantitative-swot.md` | ✅ Pass 1 | ~110 | SWOT with quantified scoring |
| `risk-scoring/political-capital-risk.md` | ✅ Pass 1 | ~130 | Capital exposure for EPP, S&D, INTA |
| `risk-scoring/legislative-velocity-risk.md` | ✅ Pass 1 | ~130 | Velocity risks for Mercosur and Green Deal |
| `threat-assessment/actor-threat-profiles.md` | ✅ Pass 1 | ~150 | Threat actors in trade and digital files |
| `threat-assessment/legislative-disruption.md` | ✅ Pass 1 | ~150 | Disruption scenarios for INTA and LIBE |
| `threat-assessment/consequence-trees.md` | ✅ Pass 1 | ~150 | Consequence mapping for key threats |
| `existing/committee-productivity.md` | ✅ Pass 1 | ~130 | Committee output rates and benchmarking |

## Primary Data Sources

| Source | Tool | Quality | Notes |
|--------|------|---------|-------|
| EP Adopted Texts 2026 | `get_adopted_texts(year:2026)` | 🟢 HIGH | 30 texts with full metadata |
| EP Adopted Texts Feed | `get_adopted_texts_feed(one-week)` | 🟡 MEDIUM | 133 items, EP10=120, no title metadata |
| Procedure timeline (4 procedures) | `track_legislation` | 🟡 MEDIUM | Timeline events available; enrichment failed |
| Committee activity (ECON/ENVI/ITRE) | `analyze_committee_activity` | 🟡 MEDIUM | Workload proxy only; meeting data unavailable |
| Political landscape | `generate_political_landscape` | 🟢 HIGH | 719 MEPs, all 9 groups |
| Coalition dynamics | `analyze_coalition_dynamics` | 🔴 LOW | Size-similarity proxy only; no vote-level data |
| Voting records | `get_voting_records` | 🔴 UNAVAILABLE | EP roll-call delay 4–6 weeks |
| Committee docs feed | `get_committee_documents_feed` | 🔴 FAILED | EP API error; fell back to direct endpoint |
| Committee docs direct | `get_committee_documents` | 🟡 MEDIUM | 50 AFCO documents; no date metadata |
| Legislative pipeline | `monitor_legislative_pipeline` | 🔴 LOW | 0 active procedures returned (enrichment gap) |

## Key Intelligence Threads

### Thread 1: EU-Mercosur Trilogue (INTA committee)
**2025/0261(COD)** — Bilateral safeguard clause for agricultural products. Procedure entered first trilogue meeting on 2026-04-13 following plenary referral back to INTA on 2026-03-26. This is the only procedure tracked in this run that has active inter-institutional negotiations. The INTA rapporteur secured the committee mandate in March 2026, endorsed by plenary with amendments. Council position expected to be presented at second trilogue (estimated May 2026).

### Thread 2: Completed Legislation — Implementation Watch
Three major procedures completed in Q1 2026:
- **Measuring Instruments Directive** (2024/0311): Published OJ 2026-03-20 — IMCO committee product
- **Safe Third Country Concept** (2025/0132): Published OJ 2026-02-26 — LIBE committee; migration law update
- **Ukraine loan enhancement** (2025/0431): EP plenary decision 2026-01-21 — fast-tracked NLE

These represent strong legislative throughput; implementation monitoring now falls to the relevant committees.

### Thread 3: Digital/AI Legislation Package
Three adopted texts form a de facto digital legislative cluster:
- **Tech sovereignty** (TA-10-2026-0022, Jan 2026) — ITRE position
- **Copyright & AI** (TA-10-2026-0066, Mar 2026) — JURI position
- **Better law-making** (TA-10-2026-0063, Mar 2026) — JURI/AFCO horizontal

This cluster reflects EP's attempt to shape a coherent position ahead of anticipated Commission legislative proposals on AI liability and platform infrastructure.

### Thread 4: ECB Governance Cycle
Three ECON committee-driven outputs in rapid succession (Jan–Mar 2026):
- Vice-Chair Supervisory Board appointment (TA-10-2026-0033)
- Vice-President appointment (TA-10-2026-0060)
- ECB Annual Report 2025 resolution (TA-10-2026-0034)

This pattern signals an active ECON-ECB dialogue period, coinciding with monetary policy uncertainty driven by US tariff impact on EU inflation outlook.

## Data Quality Summary

Feed degradation affected this run:
- `get_committee_documents_feed`: UNAVAILABLE (EP API error-in-body)
- `get_events_feed`: UNAVAILABLE (EP API error-in-body)
- `get_procedures_feed`: STALE (returned 1972–1980 historical procedures — known recess/archive-ordering mode)
- `monitor_legislative_pipeline`: Returned 0 active procedures despite active dateFrom/dateTo — enrichment metadata gap

Fallbacks activated: `get_adopted_texts(year:2026)`, `track_legislation` for 4 key procedures, `get_committee_documents` direct endpoint.
