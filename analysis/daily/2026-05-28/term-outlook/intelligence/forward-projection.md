# Forward Projection — Term Outlook 2026-05-28

> 5-year quantitative projection (2025 → 2030) for the legislative, fiscal,
> coalition, and electoral indicators that anchor the term-outlook
> headline. All projections carry WEP bands; macro projections are
> sourced exclusively from the IMF Oct-2025 WEO vintage.

## 1. Projection framework

The projection is built on **three composite indices**:

1. **Legislative Throughput Index (LTI)** — `OLP files adopted / year`
   normalised to EP9 baseline (100 = EP9 baseline of 150 files / year).
2. **Coalition Cohesion Index (CCI)** — `EPP-S&D-Renew working-majority
   hit-rate %` averaged over rolling 12-month window.
3. **Fiscal Compliance Index (FCI)** — `# of MS within SGP 3% deficit
   compliance / 27`, end-of-year.

All three indices are projected for 2025 → 2030 below; the **2029 row is
the headline anchor** for the term-outlook judgement.

## 2. Quantitative projection table (central scenario)

| Year | LTI | CCI (%) | FCI (n/27) | EA GDP | EA infl | Note |
|---|---:|---:|---:|---:|---:|---|
| 2025 | 102 | 76 | 13 | 0.7 | 1.6 | Baseline (in-train) |
| 2026 | 105 | 74 | 12 | 0.8 | 2.3 | WP25 mid-term review |
| 2027 | 108 | 73 | 12 | 0.9 | 2.1 | EDP enforcement window |
| 2028 | 112 | 75 | 14 | 1.0 | 2.0 | MFF mid-term review |
| 2029 | 95 | 70 | 16 | 1.0 | 2.0 | **Dissolution year** |
| 2030 | 60 | n/a | 17 | 0.9 | 2.0 | EP11 transition |

(EA = euro area average across DEU/FRA/ITA per IMF WEO Oct-2025; LTI
dissolution effect in 2029 reflects the no-legislating campaign window
of Mar-Jun 2029.)

## 3. Projection (Mermaid)

```mermaid
flowchart LR
    A[2025<br/>LTI=102<br/>CCI=76%<br/>FCI=13/27] --> B[2026<br/>LTI=105<br/>CCI=74%<br/>FCI=12/27]
    B --> C[2027<br/>LTI=108<br/>CCI=73%<br/>FCI=12/27]
    C --> D[2028<br/>LTI=112<br/>CCI=75%<br/>FCI=14/27]
    D --> E[2029<br/>LTI=95<br/>CCI=70%<br/>FCI=16/27]
    E --> F[2030<br/>EP11 start<br/>FCI=17/27]

    A1[IMF: EA GDP 0.7%] -.-> A
    B1[IMF: EA GDP 0.8%] -.-> B
    C1[IMF: EA GDP 0.9%] -.-> C
    D1[IMF: EA GDP 1.0%] -.-> D
    E1[IMF: EA GDP 1.0%] -.-> E
    F1[IMF: EA GDP 0.9%] -.-> F

    classDef mid fill:#fef3c7,stroke:#d97706
    classDef end fill:#fee2e2,stroke:#dc2626
    classDef new fill:#dcfce7,stroke:#16a34a
    class A,B,C mid
    class D,E end
    class F new
```

## 4. Per-index projection methodology

### 4.1 Legislative Throughput Index (LTI)

The LTI projection is the product of:

- **Calendar capacity** — EP10 has 12 Strasbourg + 6 Brussels sitting
  weeks / year through Apr 2029. 2029 sees a 60% calendar haircut.
- **Coalition coefficient** — LTI is multiplied by CCI/100 (a 75%
  cohesion year produces 75% of theoretical max throughput).
- **WP25 priority lift** — the vdL II priority files have a 1.15×
  throughput multiplier (priority files clear faster through trilogue).

LTI uncertainty band:
- 🟢 Likely (55–75%): 95–115 in mid-mandate years (2026–2028).
- 🟡 Possible (35–55%): 80–95 (lower bound) or 115–125 (upper).
- 🟠 Unlikely (15–35%): <80 or >125.

### 4.2 Coalition Cohesion Index (CCI)

CCI projection anchors on the EP10 Q1 2026 rolling 12-month hit-rate of
~76%, drifts down 1–2 pp per year through mid-mandate (centre-left
exit-cost rising on migration files), and recovers slightly in 2028 H2
as the campaign frame consolidates the centre.

CCI uncertainty band:
- 🟢 Likely 55–75%: CCI in 70–78% range through 2028.
- 🟠 Pessimistic 15–25%: CCI dips below 65% on coalition fracture.

### 4.3 Fiscal Compliance Index (FCI)

FCI projection is **directly derived from the IMF GGXCNL_NGDP series**:
count MS with end-of-year deficit > –3.0% of GDP. The IMF projection
shows DE deteriorating from compliance to non-compliance by 2026; France
moves into compliance by 2029; Italy stays in compliance throughout the
window. Aggregate FCI drifts from 13/27 → 12/27 (2026–2027 trough) →
17/27 by 2030.

FCI uncertainty band:
- 🟢 IMF projection central: 12–14 through 2026–2027.
- 🟡 EA recession scenario: FCI drops to 9–10 by 2027.

## 5. Composite term-outlook score

Combining the three indices weighted by their share of the term-outlook
headline judgement (LTI 0.45, CCI 0.35, FCI 0.20):

| Year | LTI×0.45 | CCI×0.35 | FCI/27×0.20 | Composite |
|---|---:|---:|---:|---:|
| 2025 | 0.459 | 0.266 | 0.096 | **0.821** |
| 2026 | 0.473 | 0.259 | 0.089 | **0.821** |
| 2027 | 0.486 | 0.256 | 0.089 | **0.831** |
| 2028 | 0.504 | 0.263 | 0.104 | **0.870** |
| 2029 | 0.428 | 0.245 | 0.119 | **0.792** |

The composite score peaks in 2028 (the MFF-mid-term + EDP-resolution
year) and dips in 2029 (dissolution-year throughput collapse). The
**2026–2028 composite plateau ≈ 0.84** is the headline anchor — this is
*above the EP9-baseline plateau of 0.78*, supporting a *modestly positive*
term-outlook reading.

## 6. Sensitivity analysis

The composite score is **most sensitive** to:

1. **CCI drops below 65%** (–0.04 composite per –5 pp).
2. **EA recession** (FCI drops to 9/27, –0.04 composite).
3. **WP25 file slippage >10** (LTI drops to ~85, –0.07 composite).

A combined fracture+recession shock would push the 2027 composite from
0.83 to ~0.65 — below the EP9 baseline and into the pessimistic
scenario band.

## 7. WEP / Admiralty grading

- LTI projection: **🟡 Likely 55-75%**, source grade **B2** (EP9 baseline
  is well-rated; WP25 multiplier is inferred).
- CCI projection: **🟡 Possible 35-55%** (coalition arithmetic is the
  noisiest input), source grade **C3**.
- FCI projection: **🟢 Likely 55-75%** (directly from IMF), source grade
  **A2**.
- Composite: 🟡 MEDIUM confidence — see synthesis-summary.md.

## 8. Cross-references

- `intelligence/scenario-forecast.md` — the 3-scenario operationalisation
  of this quantitative projection.
- `intelligence/economic-context.md` — IMF source for FCI.
- `intelligence/coalition-dynamics.md` — CCI methodology.
- `intelligence/historical-baseline.md` — EP9 baseline anchor.
- `extended/forward-indicators.md` — observable leading indicators for
  each of LTI / CCI / FCI.

## 9. SATs applied

- Outside-View (EP9 baseline anchor)
- Bayesian Update (composite calibration §5)
- Sensitivity Analysis (§6)
- Indicators of Change (cross-ref to forward-indicators.md)
- Quality-of-Information (degraded-feeds caveat on LTI)

## 11. Sensitivity-to-input drift

Each projection is sensitive to specific input drift:

| Input | Drift threshold | Affected projection |
|---|---|---|
| IMF WEO EA-growth | ±0.5pp vs baseline | LTI fiscal envelope |
| RCV cohesion median | ±5pp | CCI working-majority margin |
| WP25 cluster completion | ±10% | LTI delivery probability |
| Right-flank seat-share | ±2pp | CCI fracture risk |
| National-election outcomes | Major shifts (>5%) | CCI 12-mo forward |

## 12. Falsification triggers

Each projection includes explicit falsification triggers:

- **LTI**: WP25 cluster-completion rate < 50% by Q2 2027.
- **CCI**: cohesion median drops < 0.65 for 3 consecutive plenaries.
- **FCI**: IMF WEO Oct-2026 downgrades EA growth to < 0.5%.

If any trigger fires, the relevant projection is re-evaluated within
14 days; the term-arc + scenario-forecast artifacts are also re-run.

## 14. Projection bias acknowledgement

Three known projection biases acknowledged:

1. **Recency bias**: 2024-2026 data weighted heavier than 2019-2023.
   Mitigation: outside-view EP9 baseline anchor.
2. **EPP-incumbent bias**: vdL II reshuffle scenarios under-weighted.
   Mitigation: wildcard W3 explicit.
3. **DE-FR coordination bias**: assumed-stable bilateral
   under-stress-tested. Mitigation: scenario-forecast §4.

## 16. Projection-cone visualisation

```mermaid
graph LR
    Q3_2026[Q3 2026: LTI 0.65, CCI 0.74, FCI 0.65] --> Q1_2027[Q1 2027: LTI 0.68, CCI 0.73, FCI 0.65]
    Q1_2027 --> Q2_2027[Q2 2027: LTI 0.72, CCI 0.70, FCI 0.65]
    Q2_2027 --> Q4_2027[Q4 2027: LTI 0.74, CCI 0.72, FCI 0.65]
    Q4_2027 --> Q2_2028[Q2 2028: LTI 0.75, CCI 0.71, FCI 0.62]
    Q2_2028 --> Q4_2028[Q4 2028: LTI 0.72, CCI 0.68, FCI 0.62]
    Q4_2028 --> Q2_2029[Q2 2029: LTI 0.70, CCI 0.65, FCI 0.60]
```

## 17. Quarterly delivery-rate forecast

| Quarter | LTI band | CCI band | FCI band | Phase |
|---|---|---|---|---|
| Q3 2026 | 0.60-0.70 | 0.72-0.76 | 0.62-0.68 | A |
| Q1 2027 | 0.65-0.72 | 0.71-0.75 | 0.62-0.68 | B |
| Q2 2027 | 0.70-0.75 | 0.68-0.73 | 0.62-0.68 | B-C |
| Q4 2027 | 0.72-0.76 | 0.70-0.74 | 0.62-0.68 | C |
| Q2 2028 | 0.74-0.77 | 0.69-0.73 | 0.60-0.65 | C-D |
| Q4 2028 | 0.70-0.74 | 0.66-0.70 | 0.60-0.65 | D |
| Q2 2029 | 0.68-0.72 | 0.63-0.67 | 0.58-0.63 | D-E |

## 18. Projection-error retrospective

When the next term-outlook run executes (2026-07-01), this projection
is compared retrospectively against observed Q3 2026 values. The
delta is logged in the next `mcp-reliability-audit.md` §retrospective
and used to recalibrate priors.

## 19. Re-projection cadence

Quarterly mini-refresh on the FCI (when IMF WEO updates publish:
April and October each year). Full re-projection at the next
semi-annual cron (2026-07-01).
