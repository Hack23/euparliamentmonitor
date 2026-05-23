<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Session Baseline — EP Motions (existing/)
**Article type:** motions | **Date:** 2026-05-06 | **Run:** motions-run431-1778097237

---

## Session State at Artifact Production

This is the `existing/` folder's session baseline — capturing the pre-existing knowledge and structural assumptions that underpin all artifacts in this analysis run.

---

## 1. Pre-Existing Structural Knowledge Applied

### EP10 Composition (Confirmed from precomputed stats)

The following group seat allocation was the baseline for all coalition arithmetic in this run:

| Group | Seats | Ideology | Coalition role(s) |
|-------|-------|---------|-------------------|
| EPP | 188 | Centre-right | Pivotal; chairs most committees |
| S&D | 136 | Centre-left | Main opposition; coalition partner on rights/social |
| RE | 77 | Liberal | Swing bloc; often decisive |
| ECR | 78 | Conservative | EPP partner on defence/migration |
| PfE | 84 | Far-right nationalist | Mostly opposition; procedural obstruction |
| Greens/EFA | 53 | Green/regionalist | Opposition; often YES on solidarity |
| GUE/NGL | 46 | Left | Opposition; unpredictable cross-file |
| ESN | 28 | Hard nationalist | Consistent opposition |
| NI | 33 | Various | Vote-by-vote; no group discipline |
| **Total** | **720** | | |
| **Majority threshold** | **361** | | |

---

## 2. EP10 Institutional Baselines

### Legislative Activity Baseline (from precomputed stats)
- Roll-call votes 2024: 399
- Projected roll-call votes 2026: 567 (estimated based on EP10 trajectory)
- Committee meetings 2024: EP-average for term
- ENP (effective number of parties): 6.59

### Coalition Architecture Baseline
- EPP-ECR-RE: defence/migration/industrial majority (340+ seats)
- EPP-S&D-RE: rights/social majority (401 seats — highly variable cohesion)
- Neither coalition is stable across all files; EPP must switch coalition partners by policy area

---

## 3. Economic Context Baseline (World Bank, collected this run)

| Country | GDP growth 2024 | GDP growth 2023 | Trend |
|---------|----------------|----------------|-------|
| Germany | -0.50% | -0.10% | ↓ Contracting |
| France | +1.19% | +0.91% | → Slow growth |
| Italy | +0.69% | +0.93% | → Slow growth |
| Spain | +3.46% | +2.49% | ↑ Growing |
| EU average (est.) | ~1.0% | ~0.5% | → Recovering |

DE inflation 2024: 2.26% (declining from 8.7% peak in 2022)

---

## 4. Known Limitations Baseline

These limitations were known BEFORE artifact production and shaped the analytical choices made:

1. **No live vote records:** EP API degraded; structural/historical inference only
2. **No MEP roster:** Pagination failed; group-level analysis only
3. **No committee documents:** Cannot verify rapporteur assignments or amendment texts
4. **No IMF data:** Fiscal/trade/monetary analysis incomplete
5. **No DOCEO XML votes:** Latest votes endpoint returned empty for this date range

These limitations are consistently disclosed in confidence ratings and methodology notes across all artifacts.

---

## 5. Analytical Framework Baselines

Frameworks applied consistently across this run:
- **PESTLE:** 6 dimensions, ≥3 paragraphs each
- **Risk Matrix:** P×I×V×R×E weighted scoring
- **SWOT:** Quantitative weighted scoring with net position
- **Political Threat Landscape:** 6-dimension model
- **Attack Trees:** Probability-weighted branches
- **Diamond Model:** Adversary/Capability/Infrastructure/Victim vertices
- **ICO Threat Profiling:** Intent × Capability × Opportunity scoring
- **Political Kill Chain:** 7 stages (not STRIDE/Cyber kill chain)

All frameworks sourced from: `analysis/methodologies/per-artifact-methodologies.md`, `analysis/methodologies/ai-driven-analysis-guide.md`.

---

## 6. Scope Boundaries Baseline

**In scope:** EP10 motions dynamics, coalition analysis, structural intelligence, economic context, forward-looking political forecasting

**Out of scope:** Specific legislative text (not available), MEP biographies (not available), lobby group activity (not available from EP API), media framing analysis

**Article type specific:** "Motions" analysis focuses on voting outcomes, coalition mathematics, and parliamentary procedure — not on EU policy substance in the manner of a deep policy analysis paper.

*Generated: 2026-05-06T20:29Z | existing/session-baseline.md*
