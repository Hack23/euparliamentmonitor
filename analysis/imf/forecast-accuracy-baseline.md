<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🎯 IMF Forecast Accuracy Baseline — EU Parliament Monitor

> **Purpose**: Condensed summary of IMF's published forecast-accuracy
> literature, with per-horizon mean-absolute-error (MAE) bands used to
> size the mandatory **optimism-bias acknowledgement** in articles
> citing WEO / FM forecasts at horizons ≥3 years. This file is the
> editorial source-of-truth for confidence-level wording on IMF
> projections.

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 3

> **Methodological authority**: IMF *World Economic Outlook* itself
> publishes a Forecast Accuracy box in roughly every third vintage;
> the 2015 *Forecast Accuracy Review* (Timmermann) and the 2024
> follow-up study are the canonical benchmarks. This file summarises
> their findings for EP editorial use.

---

## 1. WEO Real-GDP Growth Forecast MAE (Advanced Economies)

| Horizon | Mean absolute error (pp) | Bias | EP confidence band | Prose treatment |
|:-------:|:------------------------:|:-----|:------------------:|-----------------|
| Current-year (t) | 0.5 – 0.8 | ~neutral | 🟢 | "IMF projects…" (no bias caveat needed) |
| t+1 | 0.9 – 1.2 | slight optimism (+0.2–0.4 pp) | 🟢 | Cite directly; no mandatory caveat |
| t+2 | 1.3 – 1.8 | optimism (+0.3–0.6 pp) | 🟡 | Mandatory: "IMF forecasts carry medium-term optimism bias…" |
| t+3 | 1.8 – 2.4 | optimism (+0.4–0.8 pp) | 🟡 | Mandatory: explicit bias acknowledgement sentence |
| t+4 | 2.2 – 3.0 | optimism (+0.6–1.0 pp) | 🔴 | Mandatory: bias caveat + prefer range language ("between X and Y") |
| t+5 | 2.6 – 3.5 | optimism (+0.8–1.2 pp) | 🔴 | Mandatory: bias caveat + explicit sensitivity note; avoid single-point claims |

**Band rule**: articles citing a forecast at horizon ≥3y SHOULD cite
the point estimate AND a ±band sized to the MAE at that horizon
(rounded to 1 decimal).

---

## 2. CPI Inflation Forecast MAE (Advanced Economies)

| Horizon | Mean absolute error (pp) | Bias | EP confidence |
|:-------:|:------------------------:|:-----|:------------:|
| Current-year | 0.4 – 0.7 | ~neutral in normal regimes; underprediction during supply shocks | 🟢 |
| t+1 | 0.7 – 1.1 | underprediction bias in shock regimes (2022–2023) | 🟡 |
| t+2 | 1.2 – 1.8 | direction-dependent | 🟡 |
| t+3 | 1.6 – 2.4 | direction-dependent | 🔴 |

Inflation errors are regime-dependent: forecasts performed well
pre-2020, underpredicted 2021–2023, and mean-reverted from 2024
onwards. Articles citing inflation forecasts SHOULD name the regime
explicitly (e.g. "assuming the post-2024 disinflation trajectory
holds").

---

## 3. Public Debt Forecast MAE

FM debt-to-GDP forecasts are systematically **underpredicted** (i.e.
actual debt ends up higher than forecast) in both advanced and
emerging economies. The bias is ~1–3 pp of GDP per year of horizon.

| Horizon | MAE (pp of GDP) | Bias | EP confidence |
|:-------:|:---------------:|:-----|:------------:|
| t+1 | 1.5 – 2.5 | +1–2 underprediction | 🟡 |
| t+3 | 4 – 6 | +2–4 underprediction | 🔴 |
| t+5 | 7 – 11 | +3–6 underprediction | 🔴 |

**Editorial rule**: when citing IMF debt projections beyond t+2, the
article MUST include: *"IMF medium-term debt projections have
historically underestimated actual debt trajectories by 1–3 pp of GDP
per year of horizon."*

---

## 4. Primary / Structural Balance Forecasts

Primary balance forecasts are the **most biased** of all major fiscal
series — consistently overpredicted (forecasts project faster
consolidation than realised) by ~0.5–1.5 pp of GDP at t+3.
Editorial treatment: always cite alongside debt trajectory and flag
as "contingent on assumed policy".

---

## 5. Current-account / Trade Forecasts

Current-account forecasts are approximately symmetric at t+1
(underpredict surpluses, overpredict deficits) but widen substantially
at horizons ≥3y. Treat trade-balance forecasts at t+3+ as 🟡.

---

## 6. How to size the caveat sentence

| Horizon | Required caveat pattern |
|:-------:|--------------------------|
| t (current) | Not required |
| t+1 | Not required unless the indicator is primary balance or CPI in a shock regime |
| t+2 | Optional one-phrase flag: *"…a projection that carries IMF's usual medium-term uncertainty"* |
| t+3+ | **Mandatory** dedicated sentence: *"IMF medium-term forecasts carry documented optimism bias, particularly for growth and fiscal consolidation; actual outcomes have historically fallen [X] pp short of the [vintage] projection over this horizon."* |

The validator in  will enforce the presence of this sentence
when an IMF indicator is cited at horizon ≥3y;  leaves it
editorial.

---

## 7. Historical references

- IMF (2015), *World Economic Outlook: Forecast Accuracy*, Chapter 3.
- Timmermann, A. (2007), *An Evaluation of the World Economic Outlook
  Forecasts*, IMF Working Paper 06/268.
- IMF (2024), *WEO October 2024 — Box on Forecast Performance 2019–2023*.
- Celasun, O., Debrun, X. & Ostry, J. (2006), *Primary Surplus
  Behavior and Risks to Fiscal Sustainability*, IMF Staff Papers.

---

## 8. Integration with other methodology files

- [`../methodologies/imf-indicator-mapping.md §5`](../methodologies/imf-indicator-mapping.md) — Forecast Labelling Rule
- [`../methodologies/political-risk-methodology.md`](../methodologies/political-risk-methodology.md) — risk scoring uses these bands as Likelihood-modifiers
- [`../methodologies/synthesis-methodology.md`](../methodologies/synthesis-methodology.md) — synthesis-summary uses confidence bands
- [`../templates/scenario-forecast.md`](../templates/scenario-forecast.md) — forecast-scenario ranges
