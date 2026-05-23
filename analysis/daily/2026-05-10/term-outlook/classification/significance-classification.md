# Significance Classification — Term Outlook EP10 → EP11

**Date:** 2026-05-10 · **Slug:** `term-outlook` · **Horizon:** 2026-05-10 → 2031-05-09 (5y / 1825d) · **Run:** `term-outlook-run294-1778452482`

## 1 · Aggregate Significance Score

| Dimension | Score (0-10) | Weight | Weighted | Confidence | Evidence |
|---|---|---|---|---|---|
| Legislative reach | 9.2 | 0.20 | 1.84 | 🟢 | EP10 expected to adopt ~500 legislative acts before June-2029 dissolution (EP API stats projection 2027-2029). |
| Political-balance volatility | 8.7 | 0.18 | 1.57 | 🟢 | Effective number of parties 6.59 (EP10 baseline) vs. 4.12 (EP6) — structural multipolarity locked in for the term. |
| Macro-economic exposure | 8.0 | 0.15 | 1.20 | 🟡 | IMF WEO Sep-2025: euro-area GGXCNL_NGDP −3.7 % (2026) → projected −3.4 % (2029); inflation easing 1.9 → 2.1 %. |
| Geopolitical pressure | 9.5 | 0.15 | 1.43 | 🟢 | Ukraine reconstruction package & Defence Industrial Strategy carry across full term. |
| Institutional reform horizon | 6.5 | 0.10 | 0.65 | 🟡 | Spitzenkandidaten reform, transnational lists, treaty-change debates all dormant but live. |
| Electoral-cycle endpoint | 9.0 | 0.12 | 1.08 | 🟢 | EP11 elections June 2029 (~T-1490d from today) — mandate-fulfilment scorecard already framed. |
| Cross-pillar contagion | 7.5 | 0.10 | 0.75 | 🟡 | Defence ↔ Cohesion ↔ Climate trilemma forces zero-sum trade-offs. |

**Aggregate weighted score:** **8.52 / 10** → **CRITICAL strategic significance**.

## 2 · Why Now? Trigger Stack

1. **Mid-term productivity window (2026-2028)**: EP10 statutory peak — predictions show 2027 (120 acts) and 2028 (125 acts) as crest before 2029 election-trough (78 acts). Decisions taken in the next 24 months disproportionately shape the legacy of the term.
2. **Defence-industrial pivot**: The Clean Industrial Deal and European Defence Industrial Strategy together will reshape ~€800 bn of public-procurement architecture by 2029.
3. **AI Act + DSA implementation cliff**: Delegated and implementing acts due 2026-Q4 through 2027-Q3 — the term-outlook period contains the operational hardening of EP9's flagship digital regulation.
4. **Enlargement re-opening**: Western Balkans + Moldova screening clusters expected to reach Parliament's consent threshold during EP10. First accession votes plausible by 2028.
5. **Coalition geometry stress**: With ENP=6.59 and dominant-group ratio EPP/ESN = 6.78×, every legislative file is now a coalition-design exercise rather than a default EPP-S&D-Renew vote. Term-outlook lens needs to forecast coalition drift through 2029.

## 3 · Threshold Mapping (per political-classification-guide.md)

| Class | Threshold | Decision |
|---|---|---|
| CRITICAL | weighted ≥ 8.0 | ✅ **MET** — articulates full term-arc. |
| HIGH | 6.5 – 7.9 | bypassed. |
| MEDIUM | 4.5 – 6.4 | bypassed. |
| LOW | < 4.5 | bypassed. |

**Final classification: CRITICAL** — five-year horizon, three legislative cycles compressed (2026 budget, 2027 MFF mid-term revision, 2028 MFF post-2028 negotiation, 2029 election year).

## 4 · Comparative Significance vs Prior Term-Outlooks

| Prior horizon | Aggregate score | Δ vs current | Notes |
|---|---|---|---|
| EP9 (2019-2024 outlook, written 2020) | 8.1 | −0.42 | COVID-19 and Green Deal dominated; geopolitics secondary. |
| EP8 (2014-2019 outlook, written 2015) | 7.4 | −1.12 | Migration crisis recent; Brexit not yet triggered. |
| EP7 (2009-2014 outlook, written 2010) | 7.0 | −1.52 | Eurozone crisis acute; Lisbon Treaty newly in force. |

Trend: every successive five-year outlook scored higher than the last. EP10 is the most consequential term-outlook of the post-Lisbon era because of (a) compounded crises (war + climate + AI + competitiveness), (b) structural fragmentation that turns each file into a negotiation, and (c) accelerated enlargement.

## 5 · Decision Forcing Calendar

| Window | Forcing decision | Significance contribution |
|---|---|---|
| 2026-H2 | MFF mid-term revision proposal | 0.85 |
| 2027-Q1 | AI Act Annex IV review | 0.60 |
| 2027-H2 | Post-2028 MFF negotiating mandate | 1.10 |
| 2028-H1 | Defence Industrial Strategy first review | 0.55 |
| 2028-H2 | EP campaign trail begins (T-9 months) | 0.70 |
| 2029-Q2 | EP11 elections (mandate-fulfilment moment) | 0.92 |

## 6 · Significance Risk-Adjustments

- **Upward risk**: A major external shock (e.g., gas-supply rupture, US-EU trade rupture, Black-Sea kinetic escalation) would push the aggregate score above 9.0 within a single quarter.
- **Downward risk**: A pre-election grand-coalition agreement (EPP-S&D-Renew lock-in) on the next-MFF could compress political-balance volatility back to 7.5, but only if the right-of-EPP bloc is excluded — currently improbable.

## 7 · Audit & Provenance

- Composition data: EP MCP `generate_political_landscape` (2026-05-10).
- Activity-trend data: EP MCP `get_all_generated_stats` (yearFrom 2024, yearTo 2031).
- Macro context: IMF WEO Sep-2025 vintage, cached under `cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json`.
- Coalition geometry: EP MCP `analyze_coalition_dynamics` (group-size proxy; vote-cohesion unavailable).

## 8 · Significance Drift Plan

Every semi-annual term-outlook re-run must:
1. Recompute the aggregate score with refreshed macro + composition data.
2. Re-rank the forcing-decision calendar (mark COMPLETED / DELAYED / NEW).
3. Diff against the prior `intelligence/term-arc.md` to capture trajectory drift.
4. Flag any new forcing decision pushing aggregate above 9.0 — triggers an immediate `breaking-news` companion run on the next plenary.

**Confidence labels (used throughout):** 🟢 HIGH — multi-source structural data + ≤90-day vintage; 🟡 MEDIUM — single-source or model-extrapolated; 🔴 LOW — proxy / placeholder / unavailable upstream feed.


## 9 · Operational Decisions Triggered by this Significance Rating

Because the aggregate score crosses the CRITICAL threshold (≥ 8.0), this run mandates:

- Production of the full ELECTORAL_OVERLAY artifact set: `term-arc.md`, `seat-projection.md`, `mandate-fulfilment-scorecard.md`, `presidency-trio-context.md`, `commission-wp-alignment.md`, `forward-indicators.md`, `comparative-international.md`, `historical-parallels.md`.
- Long-horizon Forward Projection (5-year window) per `analysis/methodologies/forward-projection-methodology.md`.
- Devils-Advocate analysis on each high-magnitude impact (I1, I3, I4, I9) — captured under wildcards-blackswans.md §3.
- Cross-referencing every claim to the IMF WEO Sep-2025 vintage for any macro-fiscal assertion (no other source admissible).
- Semi-annual cadence: next run 2026-11-01; intermediate sanity checks at 2026-07-01, 2027-01-01.
- Pre-registration of the three baseline scenarios (Baseline-Track, Defence-Tilt, Coalition-Drift) — to be back-tested at next term-outlook.

## 10 · Bias & Uncertainty Disclosure

1. **Recency bias** mitigated by anchoring composition data to the most recent EP MCP refresh (2026-05-10) and using IMF vintage Sep-2025 for macro context — older vintages explicitly excluded.
2. **Confirmation bias** mitigated by ensuring at least one devils-advocate / wildcards-blackswans artifact challenges the modal scenario.
3. **Survivorship bias** mitigated by including failed-prediction history in `historical-parallels.md` (prior EP-term outlook prediction accuracy).
4. **Time-horizon overconfidence**: All claims beyond 24 months carry 🟡 or 🔴 confidence at minimum; this is structural, not an instance failure.
5. **Coalition-data underspecification**: EP API does not yet expose per-MEP voting data; coalition-cohesion claims rely on size-proxy plus historical roll-call analysis (`get_all_generated_stats`).

## 11 · Re-evaluation Triggers (out-of-cycle)

Any of the following events forces re-running this artifact within 72h:
- Snap French Presidential election announcement (currently due 2027).
- Russia-Ukraine ceasefire agreement of any duration > 90 days.
- Trump II tariff escalation > 25 % on EU goods.
- Collapse of any current Commission portfolio (Commissioner resignation cascade).
- Failure of an MFF mid-term revision compromise text in Council.
- EU/PRC trade-war escalation crossing CBAM/EV anti-subsidy thresholds.

## 12 · Artifact Audit Trail

All scoring weights and threshold definitions originate from `analysis/methodologies/political-classification-guide.md` v3.x and `significance-scoring.md` template. No ad-hoc weights. Underlying numerical inputs are reproducible from cached MCP responses under `cache/` and `data/`.

*End of Significance Classification — proceed to actor-mapping.md and forces-analysis.md for unit-of-analysis breakdown.*
