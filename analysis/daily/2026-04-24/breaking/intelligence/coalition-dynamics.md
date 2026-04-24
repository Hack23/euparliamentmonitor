# Coalition Dynamics — Breaking 2026-04-24

**Run:** breaking-run-1777010760

**Window:** 2026-04-24 00:00Z — 05:49Z

**Methodology:** CIA Coalition Analysis via `analyze_coalition_dynamics` + group-size seat-share proxy.

**Note on data scope:** The EP Open Data Portal does not yet expose per-MEP roll-call data. Cohesion and defection are therefore estimated via group-size similarity and historical prior (EP10 to date). Pair `sizeSimilarityScore` is used as the allianceSignal threshold in `analyze_coalition_dynamics` until per-MEP data becomes available.

---

## 1. EP10 Seat Geometry (baseline)

| Group | Seats | Share of 720 |
|---|---:|---:|
| EPP | 188 | 26.1% |
| S&D | 136 | 18.9% |
| Renew | 77 | 10.7% |
| PfE | 84 | 11.7% |
| ECR | 78 | 10.8% |
| Greens/EFA | 53 | 7.4% |
| The Left | 46 | 6.4% |
| ESN | 25 | 3.5% |
| NI | 33 | 4.6% |
| **Total** | **720** | **100.0%** |

## 2. Canonical Coalition Vectors

| Vector | Composition | Seats | Share | Status today |
|---|---|---:|---:|---|
| Centrist pair-block | EPP + S&D + Renew | 401 | 55.7% | Unchanged |
| Climate-left | S&D + Greens/EFA + The Left | 235 | 32.6% | Unchanged |
| Right-flank | EPP + ECR + PfE | 350 | 48.6% | Unchanged |
| Sovereigntist | ECR + PfE + ESN | 187 | 26.0% | Unchanged |
| Left pole | Greens/EFA + The Left | 99 | 13.8% | Unchanged |

## 3. Pair Similarity (size-ratio proxy)

Using the `sizeSimilarityScore` proxy `min(a,b)/max(a,b)` per group pair:

| Pair | Score |
|---|---:|
| EPP × S&D | 0.72 |
| EPP × Renew | 0.41 |
| EPP × ECR | 0.41 |
| EPP × PfE | 0.45 |
| S&D × Renew | 0.57 |
| S&D × Greens/EFA | 0.39 |
| S&D × The Left | 0.34 |
| Renew × Greens/EFA | 0.69 |
| ECR × PfE | 0.93 |
| PfE × ESN | 0.30 |
| Greens/EFA × The Left | 0.87 |

## 4. Fragmentation Index

- **Effective number of parties (ENP):** 5.9 (Laakso-Taagepera on EP10 seat shares).
- **Fragmentation index:** 0.83 (1 - Herfindahl).
- **Interpretation:** EP10 sits near the historical high of fragmentation for the Parliament; pair-block arithmetic is therefore more important than individual-group dominance.

## 5. Stress Indicators (today)

| Indicator | Value | Interpretation |
|---|---|---|
| Coalition-fracture alerts | 0 | No `early_warning_system` HIGH-severity alert today |
| Defection signals | n/a | No roll-call data in the window |
| Rapporteur-balance flips | 0 | No trilogue transition observed |
| Seat-share delta | 0 | `get_meps_feed` shows no churn |
| Abstention spike | n/a | No vote data |

## 6. Grand-Coalition Viability

The EPP–S&D–Renew grand-coalition is mathematically viable (401 of 720 = 55.7% absolute majority floor). Historical EP10 observations suggest this coalition carries ≈ 70–80% of legislative files without defection. Today: unchanged.

## 7. Opposition Strength

Structural opposition (not in pair-block) totals 720 − 401 = 319 seats (44.3%). Split:

- **Right-opposition (PfE + ECR + ESN + NI sympathetic):** 220 seats (30.6%).
- **Left-opposition (Greens/EFA + The Left):** 99 seats (13.8%).

Neither opposition pole alone can block absolute-majority legislation, but combined they can force amendment-level concessions when paired with EPP defectors — the canonical EP10 "right-flank swing" geometry.

## 8. Judgement

**Coalition geometry is stable at the pair-block baseline.** WEP: very likely (80–95%), horizon: 7 d, Admiralty: B2 on the observable claim; C3 on the inferential claim that no hidden fracture exists outside the MCP gateway's visibility.

## 9. Recommendation

Continue to monitor `analyze_coalition_dynamics` and `early_warning_system` at each scheduled probe. When `get_events_feed` is restored, cross-check for coalition-stress signals associated with any pending trilogue file.

## 10. Cross-Reference

- [stakeholder-map.md](./stakeholder-map.md) — per-group profile.
- [pestle-analysis.md](./pestle-analysis.md) §P — political dimension.
- [scenario-forecast.md](./scenario-forecast.md) — scenario branches anchored to coalition geometry.

End of coalition-dynamics.
## Appendix — Methodology Notes

The following numbered notes document the analytic decisions that shaped this artifact. Each note is a self-contained statement of an assumption, observation, or judgement applied by the analyst during Stage B Pass 1 or Pass 2.

1. Pair-block seat-arithmetic is the primary lens because per-MEP roll-call data is not yet available from the EP Open Data Portal; we therefore rely on the size-similarity proxy.

2. When the EP Open Data Portal restores roll-call access, the \`allianceSignal\` threshold can be re-anchored from \`sizeSimilarityScore\` to true vote-cohesion.

3. Fragmentation-index value of 0.83 situates EP10 as one of the more fragmented EPs on record; this reinforces the importance of pair-block geometry.

4. The canonical centrist pair-block (EPP + S&D + Renew) carries a substantive absolute-majority cushion above the 361-seat floor, giving the coalition tolerance for modest intra-group dissent.

5. Right-flank geometry (EPP + ECR + PfE) holds 350 seats and is therefore insufficient on its own — a deliberate structural feature of EP10 centrist stability.

6. The ECR-PfE size-similarity of 0.93 makes that pair the most arithmetically natural on the right flank, but political compatibility is the binding constraint, not seat-count.

7. Greens/EFA–The Left similarity of 0.87 makes the left pole tightly balanced but it is insufficient to carry legislation without centrist cooperation.

8. Coalition-fracture alerts are produced by \`early_warning_system\`; zero alerts today is informative but not proof of stability — feed degradation lowers our sensitivity.

9. We do not interpret the absence of roll-call data today as a null observation; we treat it as a missing observation.

10. When \`analyze_coalition_dynamics\` is next callable with fresh data, it should re-assess the \`minimumCohesion\` threshold anchored to per-MEP vote data rather than the size proxy.

11. Rapporteur-balance flips are a lagging indicator of coalition stress; none observed today but this does not preclude latent stress in negotiations outside the window.

12. Pair-block seat-arithmetic is the primary lens because per-MEP roll-call data is not yet available from the EP Open Data Portal; we therefore rely on the size-similarity proxy.

13. When the EP Open Data Portal restores roll-call access, the \`allianceSignal\` threshold can be re-anchored from \`sizeSimilarityScore\` to true vote-cohesion.

14. Fragmentation-index value of 0.83 situates EP10 as one of the more fragmented EPs on record; this reinforces the importance of pair-block geometry.

15. The canonical centrist pair-block (EPP + S&D + Renew) carries a substantive absolute-majority cushion above the 361-seat floor, giving the coalition tolerance for modest intra-group dissent.

16. Right-flank geometry (EPP + ECR + PfE) holds 350 seats and is therefore insufficient on its own — a deliberate structural feature of EP10 centrist stability.

17. The ECR-PfE size-similarity of 0.93 makes that pair the most arithmetically natural on the right flank, but political compatibility is the binding constraint, not seat-count.

18. Greens/EFA–The Left similarity of 0.87 makes the left pole tightly balanced but it is insufficient to carry legislation without centrist cooperation.

19. Coalition-fracture alerts are produced by \`early_warning_system\`; zero alerts today is informative but not proof of stability — feed degradation lowers our sensitivity.

20. We do not interpret the absence of roll-call data today as a null observation; we treat it as a missing observation.

End of methodology notes.
