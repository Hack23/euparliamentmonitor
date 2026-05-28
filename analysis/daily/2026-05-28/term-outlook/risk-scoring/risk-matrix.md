# Risk Matrix — Term Outlook 2026-05-28

> Quantitative risk matrix for the residual EP10 mandate, scoring every
> identified risk on probability × impact axes, ranked by combined
> exposure.

## 1. Risk matrix (Mermaid)

```mermaid
quadrantChart
    title Term-outlook risk matrix
    x-axis Low likelihood --> High likelihood
    y-axis Low impact --> High impact
    quadrant-1 Mitigate (HIGH × HIGH)
    quadrant-2 Monitor (LOW × HIGH)
    quadrant-3 Accept (LOW × LOW)
    quadrant-4 Manage (HIGH × LOW)
    R1 Climate-2040 fracture: [0.65, 0.85]
    R2 Migration shock: [0.55, 0.80]
    R3 Coalition cordon breach: [0.20, 0.95]
    R4 vdL II reshuffle: [0.50, 0.75]
    R5 Trilogue deadlock: [0.55, 0.75]
    R6 Council unanimity collapse: [0.45, 0.80]
    R7 EA recession: [0.25, 0.85]
    R8 Snap MS election cascade: [0.30, 0.70]
    R9 Lobby capture: [0.55, 0.55]
    R10 Treaty-change signal: [0.15, 0.45]
    R11 MCP/EP data outage: [0.30, 0.30]
```

## 2. Ranked risk register

| Rank | # | Risk | P | I | P×I | Mitigation |
|---|---|---|:---:|:---:|---:|---|
| 1 | R1 | Climate-2040 fracture | 0.65 | 0.85 | 0.55 | Phased target negotiation |
| 2 | R2 | Migration shock | 0.55 | 0.80 | 0.44 | Pre-stage migration package |
| 3 | R5 | Trilogue deadlock cascade | 0.55 | 0.75 | 0.41 | COREPER triage |
| 4 | R4 | vdL II reshuffle | 0.50 | 0.75 | 0.38 | Rapporteur continuity |
| 5 | R6 | Council unanimity collapse | 0.45 | 0.80 | 0.36 | QMV alternative |
| 6 | R9 | Lobby capture | 0.55 | 0.55 | 0.30 | Counter-balancing |
| 7 | R8 | Snap MS election | 0.30 | 0.70 | 0.21 | Presidency handover |
| 8 | R7 | EA recession | 0.25 | 0.85 | 0.21 | MFF mid-term acceleration |
| 9 | R3 | Coalition cordon breach | 0.20 | 0.95 | 0.19 | S&D + Renew anchoring |
| 10 | R11 | MCP/EP data outage | 0.30 | 0.30 | 0.09 | Proxy reconstruction |
| 11 | R10 | Treaty-change signal | 0.15 | 0.45 | 0.07 | Pre-positioning |

## 3. Risk × scenario mapping

| Risk | Pessimistic | Central | Optimistic |
|---|:---:|:---:|:---:|
| R1 Climate fracture | activates | partial | absent |
| R2 Migration shock | activates | partial | absent |
| R3 Cordon breach | activates | absent | absent |
| R4 vdL reshuffle | absorbed | absent | absent |
| R5 Trilogue deadlock | activates | partial | absent |
| R6 Council unanimity | activates | partial | absent |
| R7 EA recession | activates | absent | absent |

## 4. Risk exposure aggregation

- **High-exposure cluster** (P×I ≥ 0.35): R1, R2, R4, R5, R6 — five
  risks demanding active mitigation.
- **Medium-exposure cluster** (P×I 0.15-0.34): R3, R7, R8, R9 — four
  risks for monitoring + contingency planning.
- **Low-exposure cluster** (P×I < 0.15): R10, R11 — two risks accepted
  with passive monitoring.

## 5. SATs applied

- **Risk Matrix** — formal P×I quadrant analysis.
- **Premortem** — pessimistic-scenario risk inventory.
- **What-If Analysis** — risk × scenario mapping.

## 6. WEP / Admiralty grading

- Risk identification: 🟢 HIGH (covers wildcards + threats), A2.
- Probability × impact scoring: 🟡 MEDIUM, B3.
- Mitigation recommendations: 🟡 MEDIUM, B2.

## 7. Cross-references

- `intelligence/wildcards-blackswans.md` — risk source.
- `intelligence/threat-model.md` — STRIDE adaptation source.
- `intelligence/scenario-forecast.md` — scenario branching consistency.
- `risk-scoring/quantitative-swot.md` — risk → SWOT translation.

## 8. Risk-mitigation playbook

### 8.1 R1 Climate-2040 fracture

- **Pre-positioning**: phased target negotiation; sectoral
  flexibility clauses; CAP-bridge funding.
- **In-event**: rapid EPP+S&D bilateral; Renew brokerage.
- **Post-event**: amendment-package re-stitching; trilogue acceleration.

### 8.2 R2 Migration shock

- **Pre-positioning**: migration-package pre-staging; S&D + Greens
  conditional-support text.
- **In-event**: emergency Council formation; Commission rapid response.
- **Post-event**: implementation acceleration; MS-level capacity build.

### 8.3 R5 Trilogue deadlock

- **Pre-positioning**: COREPER triage capacity build; rapporteur
  continuity.
- **In-event**: presidency-level brokerage; technical-level fallback.
- **Post-event**: file-bundling for next presidency.

## 9. Risk-acceptance criteria

For LOW-exposure risks (R10, R11), acceptance criteria:

- R10 Treaty-change signal: monitor EUCO conclusions for re-emergence;
  no action required at <0.20 probability.
- R11 MCP/EP data outage: proxy reconstruction methodology
  documented (`procedures-proxy.md`); accept reduced data-quality
  grade.

## 10. Risk-velocity assessment

Some risks have *faster* unfolding than others:

| Risk | Velocity | Time-to-impact |
|---|---|---|
| R2 Migration shock | High | days |
| R7 EA recession | Medium | months |
| R1 Climate fracture | Medium | weeks (vote-driven) |
| R5 Trilogue deadlock | Low | months (cumulative) |
| R10 Treaty-change | Very low | years |

## 11. Re-evaluation cadence

Risk matrix refreshed at every term-outlook semi-annual cron. P×I
scores refreshed quarterly via plenary roll-call + Council reads.
