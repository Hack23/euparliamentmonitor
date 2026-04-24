# Analysis Index — Motions (2026-04-24)

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

**Run**: `motions-run-1777010709` · **Generated**: 2026-04-24 (UTC) ·
**Window**: 2026-03-25 → 2026-04-24 (30 days) · **Gate target**: GREEN ·
**Article type**: `motions` · **Stage contract**: A → B → C → analysis PR
(Stage D runs in paired `news-motions-article.md` on merge).

## 1 · Scope

This analysis covers motions for resolution, legislative resolutions and
associated non-legislative acts adopted by the European Parliament in the
observation window. The Parliament held two plenaries inside this window:

| Sitting | Location | Adopted decisions (reports + decisions) |
|---|---|---|
| 2026-03-25 | Brussels (mini) | 3 reports |
| 2026-03-26 | Brussels (mini) | 124 (102 reports + 22 decisions) |
| 2026-03-09 → 2026-03-12 | Strasbourg | 287 items across four sitting days, 112 on 2026-03-12 alone |

The Strasbourg sitting falls outside the strict 30-day window by 13-16
days but the adopted texts feed bundles the whole March plenary month;
this analysis treats the 2026-03-09 → 2026-03-26 span as one coherent
"March plenary cluster" and flags any dating drift per finding.

## 2 · Motion clusters identified

Stage-A data yielded a compact cluster of 13 high-visibility adopted
texts. They fall into six strategic bundles:

1. **Economic sovereignty bundle** — TA-10-2026-0096 (US tariff quotas),
   TA-10-2026-0092 (SRMR3 bank resolution), TA-10-2026-0060 (ECB
   Vice-President appointment), TA-10-2026-0034 (ECB 2025 annual report),
   TA-10-2026-0033 (ECB Supervisory Board VP). Together they form the
   Parliament's response to Trump-era trade pressure and a parallel
   tightening of the EU banking-resolution toolbox.
2. **Social cohesion bundle** — TA-10-2026-0064 (Housing crisis),
   TA-10-2026-0073 (EGF Tupperware Belgium), TA-10-2026-0103 (EGF
   KTM Austria), TA-10-2026-0050 (Subcontracting chains / worker
   protection).
3. **Rule-of-law bundle** — TA-10-2026-0094 (Combating corruption),
   TA-10-2026-0088 (Waiver of Braun immunity), TA-10-2026-0063 (Better
   Law-Making 2023-24).
4. **Foreign-policy bundle** — TA-10-2026-0083 (Georgian political
   prisoners), TA-10-2026-0053 (Northeast Syria ceasefire), TA-10-2026-0046
   (Iran oppression), TA-10-2026-0045 (Uganda / Bobi Wine), TA-10-2026-0024
   (Lithuania broadcaster takeover), TA-10-2026-0010 (Loan for Ukraine
   enhanced cooperation), TA-10-2026-0008 (CJEU opinion on EU-Mercosur).
5. **Digital policy bundle** — TA-10-2026-0066 (Copyright and generative
   AI).
6. **Climate-transport bundle** — TA-10-2026-0084 (Heavy-duty vehicle
   emission credits 2025-2029).

## 3 · Artifacts produced this run

| Path | Purpose | Depth floor (motions) |
|---|---|---|
| `intelligence/analysis-index.md` | This file — navigation root | 100 |
| `intelligence/synthesis-summary.md` | One-page executive brief with BLUF | 160 |
| `intelligence/pestle-analysis.md` | PESTLE across all six bundles | 180 |
| `intelligence/stakeholder-map.md` | Named MEPs, rapporteurs, shadow rapporteurs, external actors | 200 |
| `intelligence/scenario-forecast.md` | 6-18 month scenarios per bundle | 180 |
| `intelligence/threat-model.md` | STRIDE-style political threat model | 160 |
| `intelligence/historical-baseline.md` | Comparable prior-term votes | 120 |
| `intelligence/economic-context.md` | World Bank / IMF indicators | 120 |
| `intelligence/wildcards-blackswans.md` | Low-probability / high-impact events | 180 |
| `intelligence/mcp-reliability-audit.md` | Stage-A probe + coverage log | 200 |
| `intelligence/reference-analysis-quality.md` | Self-review vs thresholds | 140 |
| `intelligence/voting-patterns.md` | Adopted-margin + bundle discipline | 200 |
| `intelligence/workflow-audit.md` | Run-level audit trail | 100 |
| `intelligence/cross-session-intelligence.md` | Continuity vs prior runs | 220 |
| `intelligence/methodology-reflection.md` | Step-10.5 SAT reflection | 200 |
| `existing/session-baseline.md` | Known-knowns baseline | 200 |
| `existing/deep-analysis.md` | ICD-203 BLUF on the corruption + housing motions | 400 |
| `existing/stakeholder-impact.md` | Per-bundle stakeholder impact | floor from common |
| `classification/impact-matrix.md` | Likelihood × impact heatmap | common |
| `risk-scoring/risk-matrix.md` | WEP-banded risk register | 100 |
| `risk-scoring/quantitative-swot.md` | Weighted SWOT | 100 |

## 4 · Validator target

`npm run validate-analysis -- --analysis-dir=analysis/daily/2026-04-24/motions --article-type=motions`

must exit 0. Each mandatory artifact meets the motions-row floor in
`analysis/methodologies/reference-quality-thresholds.json`; no
`[AI_ANALYSIS_REQUIRED]` markers remain in any file; the manifest is
auto-populated by `runAnalysisStage` during `--analysis-only` wrap-up.

## 5 · Dependency chain

```
data/adopted-texts-feed-month.json ──┐
data/adopted-texts-sample.json ──────┼──► intelligence/synthesis-summary.md
data/decisions-2026-03-26.json ──────┤        │
data/decisions-2026-03-25.json ──────┤        ├──► existing/deep-analysis.md
data/decisions-2026-03-12.json ──────┤        ├──► intelligence/stakeholder-map.md
data/plenary-sessions-2026.json  ────┤        ├──► intelligence/scenario-forecast.md
data/political-landscape.json ───────┘        ├──► risk-scoring/risk-matrix.md
                                              └──► classification/impact-matrix.md
```

Every downstream artifact cites its upstream data file in the body.

## 6 · Confidence ledger

🟢 **HIGH confidence** — motion titles, dates, procedure references,
committee of origin (direct from EP Open Data Portal).

🟡 **MEDIUM confidence** — political-group positions, rapporteur names
(inferred from standard rapporteur-by-committee pattern; EP API does not
expose per-motion rapporteur). Group-size data is current; per-MEP vote
positions are not exposed by the API and are synthesised from public
press patterns only where unambiguous.

🔴 **LOW confidence** — vote margins, defection counts, abstention
spikes. These require roll-call data that the EP Open Data Portal
does not expose in this window; analysis uses historical base rates
and flags every instance.

## 7 · Known data gaps

* EP API returned empty for `get_voting_records` in the window — normal
  (publication lag is typically 6-10 weeks; see `07-mcp-reference.md`).
* `decisions-2026-03-25.json` returned only 3 items — consistent with
  the 2026-03-25 Brussels mini-plenary being a procedural session
  preceding the 2026-03-26 vote day.
* World Bank and IMF MCP probes failed at Stage-A start (see
  `intelligence/mcp-reliability-audit.md`); economic-context falls back
  to the latest cached indicator snapshot committed in `docs/`.

## 8 · Forward monitoring pointers

* 2026-04-27 → 2026-04-30 Strasbourg part-session: confirm whether the
  SRMR3 trilogue result returns for a final-reading confirmation vote.
* 2026-05-12 Brussels mini: watch for rapporteur appointment on an
  anti-corruption follow-up (Parliament resolution TA-10-2026-0094
  called for Commission legislative proposal "without undue delay").
* Track EP roll-call publication for the 2026-03-26 window; expected
  data freshness ~2026-05-20.
