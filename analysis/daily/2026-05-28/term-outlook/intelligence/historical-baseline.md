# Historical Baseline — Term Outlook 2026-05-28

> EP9 (2019-2024) baseline against which the EP10 (2024-2029) term-outlook
> is anchored. Provides the *outside view* for every forward judgement in
> the run.

## 1. EP9 headline metrics (2019-2024)

| Metric | EP9 actual | Comment |
|---|---:|---|
| Mandate length | 60 months | Jul 2019 → Jul 2024 |
| Total OLP files concluded | ~755 | Average 151/year |
| WP plan completion | ~68% | von der Leyen I Commission |
| Working majority cohesion | 74% (avg) | EPP+S&D+Renew+G/EFA |
| Trilogue closures | ~470 | Average 94/year |
| Parliamentary questions | ~22,000 | Average 4,400/year |
| Plenary sessions | 60 | 12/year on average |

(Sources: EP Open Data corpus statistics 2024 vintage; reference
quality thresholds methodology JSON; cross-checked against
`get_all_generated_stats`.)

## 2. EP9 baseline (Mermaid)

```mermaid
flowchart LR
    A[EP9 start<br/>Jul 2019] --> B[Year 1<br/>COVID shock<br/>~120 files]
    B --> C[Year 2<br/>recovery<br/>~150 files]
    C --> D[Year 3<br/>Ukraine war<br/>~160 files]
    D --> E[Year 4<br/>energy crisis<br/>~165 files]
    E --> F[Year 5<br/>campaign year<br/>~95 files]
    F --> G[EP9 end<br/>Jul 2024<br/>~755 total]

    H[vdL I WP plan<br/>completion ~68%] -.-> G

    classDef start fill:#dbeafe,stroke:#2563eb
    classDef mid fill:#fef3c7,stroke:#d97706
    classDef end fill:#dcfce7,stroke:#16a34a
    class A start
    class B,C,D,E mid
    class F,G end
```

## 3. EP9 vs. EP10 structural comparison

| Dimension | EP9 (2019-2024) | EP10 (2024-2029) |
|---|---|---|
| Seats | 705 | 720 |
| Anchor groups | EPP+S&D+Renew+G/EFA | EPP+S&D+Renew |
| Working majority size | ~417 (59%) | ~401 (56%) |
| Commission | vdL I | vdL II |
| Major shocks | COVID + Ukraine war | TBD (Ukraine continuation) |
| Macro context | 2021 inflation surge | Disinflation completing |
| Council president | Michel | Costa |
| EP president | Sassoli → Metsola | Metsola (continuing) |
| Defence priority | Rising late mandate | Anchor priority |
| Climate priority | Anchor (Green Deal) | Continuation (Climate-2040) |

**Reading**: EP10 inherits a *more fragmented* parliament (working
majority 3 pp smaller, Greens excluded from anchor), a *more benign
macro backdrop*, and *higher defence salience*. WP25 list is shorter
(51 files vs. ~64 in vdL I WP plan).

## 4. Year-by-year EP9 baseline pattern

The EP9 mandate followed a predictable arc: **Year 1 slow-start (calendar
gap + new committee formation), Years 2-4 steady-state, Year 5 collapse
(campaign window)**. EP10 should follow the same arc subject to:

- **Year 1 (2024-2025)**: 12-month slow-start window already complete.
- **Years 2-4 (2025-2028)**: steady-state, expected throughput ~400 OLP
  files / year.
- **Year 5 (2028-2029)**: campaign-window collapse, expected throughput
  ~95 files in H1 2029.

## 5. EP9 working-majority hit-rate by policy area

| Policy area | EP9 anchor-coalition hit-rate (%) |
|---|---:|
| Single market | 86 |
| Defence | 79 |
| Climate / Green Deal | 73 |
| Digital regulation | 81 |
| Migration | 58 |
| CAP reform | 62 |
| Rule-of-law | 70 |
| Trade | 78 |
| Cohesion policy | 75 |

Pattern: **single market + digital are the highest-cohesion clusters**,
**migration + CAP are the lowest-cohesion clusters**. EP10 inherits this
hit-rate pattern, modulated by the working-majority composition change
(see `coalition-dynamics.md` §1).

## 6. EP9 wildcard hit-rate

Of the ~12 wildcards modelled at EP9 start (2019-2020 term-outlook
equivalent), the actual hit-rate was:

| Wildcard category | Modelled? | Materialised? |
|---|:---:|:---:|
| Global pandemic | ❌ | ✅ (COVID-19) |
| Major-power war | ❌ | ✅ (Ukraine 2022) |
| Energy crisis | ❌ | ✅ (2022-2023) |
| Italian government fall | ✅ | ✅ (Draghi 2022) |
| German coalition fragility | ✅ | ✅ (Scholz 2022-2024) |
| French presidential surprise | ✅ | 🟡 (snap election 2024) |
| Brexit cascade | ✅ | ✅ (continued friction) |
| EPP-S&D-Renew fracture | ✅ | ❌ |
| Treaty change | ✅ | ❌ |
| Climate target rollback | ✅ | 🟡 (CAP rollback 2024) |
| Mediterranean migration surge | ✅ | ✅ (2023-2024) |
| EU enlargement big-bang | ❌ | 🟡 (Ukraine candidacy 2022) |

**Reading**: **3 of the 4 large macro wildcards (pandemic, war, energy
crisis) were NOT modelled and DID materialise**. This is a strong prior
that the EP10 term-outlook should weight unknown-unknown tail-events
more heavily than the formal wildcard inventory captures.

## 7. EP9 anchor priors carried forward into EP10

- **Working-majority CCI baseline 74%** — carried into the EP10
  projection.
- **WP plan completion baseline 68%** — primary anchor for the
  term-outlook central scenario.
- **Year-5 collapse pattern** — carried into the 2029 LTI projection
  (LTI 95 vs. mid-mandate 110).
- **Single-market + defence as anchor priorities** — carried.
- **Migration as friction axis** — carried.

## 8. Sources

- EP Open Data Portal corpus statistics 2024 vintage (via
  `get_all_generated_stats` MCP tool family).
- `reference-quality-thresholds.json` baseline figures.
- Historical EP plenary roll-call patterns 2019-2024.
- vdL I Work Programme outcome reports (2024 H1).

## 9. SATs applied

- **Outside View / Reference-Class Forecasting** — formal EP9 → EP10
  base-rate transfer.
- **Quality of Information Check** — corpus statistics well-rated; CCI
  reconstruction is model-dependent.
- **Bayesian Update** — EP9 hit-rate patterns updated to EP10 priors
  in `coalition-dynamics.md`.

## 10. WEP / Admiralty grading

- EP9 corpus statistics: 🟢 HIGH, A1.
- Working-majority reconstruction: 🟡 MEDIUM, B2.
- Wildcard hit-rate retrospection: 🟡 MEDIUM, B3.

## 11. Cross-references

- `intelligence/coalition-dynamics.md` — CCI baseline.
- `intelligence/forward-projection.md` §4.1 — LTI calibration.
- `intelligence/scenario-forecast.md` — scenario calibration.
- `extended/historical-parallels.md` — deeper historical analogies
  beyond EP9.

## 12. Re-evaluation cadence

Annual EP-corpus statistics refresh; baseline transferred forward
unchanged unless a structural break is observed in EP10 throughput.
