# Forward Projection — Legislative Output & Coalition Trajectory (2026-05-10 → 2031-05-09)

> Confidence: 🟢 HIGH for trend-based output curve (precomputed
> `get_all_generated_stats` predictions 2027-2031);
> 🟡 MEDIUM for coalition decomposition; 🔴 LOW for post-2029 EP11 specifics.
> Required for long-horizon prospective slugs.

## 1. Five-Year Output Projection (2026-05-10 → 2031-05-09)

| Year | Predicted legislative acts | Plenary sessions | RC votes | Committee meetings | Source |
|------|---------------------------|-------------------|----------|--------------------|--------|
| 2026 | 105 | 12 | ~390 | ~660 | get_all_generated_stats |
| 2027 | 120 | 12 | ~430 | ~700 | get_all_generated_stats |
| 2028 | 125 (peak) | 12 | ~440 | ~705 | get_all_generated_stats |
| 2029 | 78 (election dip) | 8 | ~210 | ~410 | get_all_generated_stats |
| 2030 | 94 | 12 | ~360 | ~640 | get_all_generated_stats |
| 2031 | 114 | 12 | ~400 | ~680 | get_all_generated_stats |

## 2. Decomposition by Policy Area (Predicted 2026-2031)

| Area | Cumulative acts | Share | Top committee |
|------|------------------|-------|----------------|
| Single Market & Industry | ~120 | 19% | ITRE / IMCO |
| Climate, Environment, Energy | ~110 | 18% | ENVI / ITRE |
| Justice & Home Affairs (incl. Migration) | ~85 | 14% | LIBE |
| External Action & Defence | ~75 | 12% | AFET / SEDE / INTA |
| Economy & Finance | ~65 | 10% | ECON / BUDG |
| Agriculture & Rural | ~45 | 7% | AGRI |
| Transport & Tourism | ~38 | 6% | TRAN |
| Social, Employment, Culture | ~35 | 6% | EMPL / CULT |
| Health, Food Safety | ~28 | 4% | ENVI / SANT |
| Constitutional, Petitions, Inst. | ~25 | 4% | AFCO / PETI |

## 3. Coalition-Trajectory Projection

### Phase 1 — Delivery I (2025-26 → 2026-27)
- Grand coalition default; 65-70% roll-call cohesion projected.
- File-specific defections: PfE on migration (with EPP swing); Greens on
  climate adaptation; Left on austerity instruments.

### Phase 2 — Delivery II (2027-28)
- Defence-Compass alignment tightens EPP+Renew+ECR around competitiveness.
- MFF 2028-34 negotiation forces grand-coalition resolution; S&D leverages
  vote on own-resources package.
- Coalition discipline: 70% cohesion expected on flagship files; 55% on
  controversial files (migration, agriculture).

### Phase 3 — Pre-election (2028-Q4 → 2029-H1)
- Discipline erosion: 50-55% cohesion on contested files.
- Rapporteur first-reading rate falls; second-reading conciliation
  becomes more common.
- Plenary theatre rises; written-procedure files multiply.

### Phase 4 — EP11 (2029-Q4 → 2031)
- Re-set coalition mathematics (see `seat-projection.md`).
- New rapporteur landscape — likely 12-18% turnover at file level.
- New plenary leadership; group-leader continuity uncertain.

## 4. Productivity by Procedure Type (Predicted)

| Procedure | 2026 | 2027 | 2028 | 2029 | 2030 | 2031 |
|-----------|------|------|------|------|------|------|
| Ordinary legislative (COD) | 78 | 88 | 92 | 56 | 70 | 84 |
| Consent (APP) | 8 | 9 | 10 | 6 | 7 | 9 |
| Consultation (CNS) | 12 | 14 | 14 | 11 | 11 | 13 |
| Implementing/Delegated (DEL/IMP) | 7 | 9 | 9 | 5 | 6 | 8 |

## 5. Roll-Call Volume Projection

- Aggregate ~390 → ~440 RC votes/year (delivery years).
- ~210 RC votes in election year 2029.
- Per-month median across delivery years: 32-37 RC votes.
- Coalition-pivot RC votes (where grand coalition splits): ~28% of total.

## 6. Parliamentary Question Flow

| Year | Predicted PQs (written + oral) | Top topics |
|------|--------------------------------|------------|
| 2026 | ~14,500 | Defence, energy, migration |
| 2027 | ~15,200 | Defence, AI Act enforcement, migration |
| 2028 | ~15,000 | MFF, defence, climate adaptation |
| 2029 | ~9,500 (election) | Economy, election security, AI |
| 2030 | ~13,000 | EP11 ramp-up topics |
| 2031 | ~14,200 | Stabilising agenda |

## 7. Risks to the Projection

| Risk | Likelihood | Effect on output curve |
|------|------------|------------------------|
| Coalition collapse mid-term | Low | -25 acts in collapse year |
| MFF deadlock (cliff-edge) | Medium-Low | -15 acts in 2028 |
| Black-swan event (security, climate) | Medium | Mixed: shifts mix, not total |
| Commission censure (Rule 119) | Very Low | -30 acts during inter-Commission |
| Treaty change negotiation | Low | -10 acts (procedural absorption) |

## 8. Forward-Indicator Watch (Trigger Levels)

1. EP committee meeting count falls > 15% YoY → coalition stress.
2. Rapporteur cross-group rate falls below 35% → coalition fracture.
3. First-reading agreement rate drops below 40% → procedural deadlock.
4. PQ volume drops > 20% YoY → cycle shifting to election mode early.
5. Plenary calendar trim of > 1 session → leadership signal.

## 9. Long-Horizon Calibration

- Predictions for 2027-2031 derive from `get_all_generated_stats`
  (vintage 2026-05); each year's prediction includes a quantitative
  trend-based extrapolation of EP6-EP10 historical baseline.
- Standard deviation per year approx ±12 acts based on historical
  EP6-EP9 residual error.
- Confidence narrows in 2030-2031 to ±18 acts (longer-horizon).

## 10. Counterfactual Scenarios

### Scenario A — Linear-Delivery (50%)
Output curve as above; coalition pivots manageable.

### Scenario B — Defence-Tilt Acceleration (25%)
- 2027-28 acts shift toward AFET/SEDE; defence-financing files dominate.
- +10 acts above central in 2027.

### Scenario C — Pre-Electoral Stall (15%)
- 2028 H2 slowdown (-10 acts vs central).
- Coalition fracture on MFF intensifies; conciliation rate up.

### Scenario D — Crisis Reset (10%)
- External crisis (sec/econ) reshuffles agenda; total stays similar
  but mix shifts heavily to AFET, INTA, ITRE.

## 11. Falsification Triggers

- 2027 acts < 100 (1 standard-deviation below central) → scenario revision.
- 2028 plenary count < 10 → presidency / coalition disruption.
- 2029 acts > 100 (would imply election cycle absent) → check methodology.

## 12. Cross-Reference Map

- [`intelligence/term-arc.md`](./term-arc.md) — phase context.
- [`intelligence/scenario-forecast.md`](./scenario-forecast.md) — narrative branches.
- [`intelligence/coalition-dynamics.md`](./coalition-dynamics.md) — discipline assumptions.
- [`intelligence/historical-baseline.md`](./historical-baseline.md) — EP6-EP9 reference points.
- [`extended/forward-indicators.md`](../extended/forward-indicators.md) — quantitative tripwires.

## 13. Confidence Annotations

🟢 HIGH: aggregate trajectory, peak 2028 prediction.
🟡 MEDIUM: per-year decomposition, procedure-type splits.
🔴 LOW: 2030-2031 mix, coalition discipline post-election.

## 14. Methodology Notes

- Source: `get_all_generated_stats` precomputed predictions (vintage 2026-05),
  smoothed with EP6-EP9 historical baseline.
- Procedure-type split inferred from EP10 mid-term ratios.
- Election-year dip calibrated to EP9 → EP10 historical example.
- All numbers are point predictions; confidence intervals indicative.
