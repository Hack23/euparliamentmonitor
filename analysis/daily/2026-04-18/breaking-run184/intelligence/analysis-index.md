---
title: "📇 Analysis Index — Run 184 Read-Me-First Entry Point"
date: 2026-04-18
articleType: breaking
runId: 184
role: "Pre-flight reading index for article-generation workflows"
---

# 📇 Analysis Index — Run 184

![Role](https://img.shields.io/badge/Role-Read--Me--First_for_AI-gold?style=flat-square)
![Artifacts](https://img.shields.io/badge/Artifacts-17-green?style=flat-square)
![Lines](https://img.shields.io/badge/Total_Lines-3600%2B-blue?style=flat-square)
![Frameworks](https://img.shields.io/badge/Frameworks-13-blueviolet?style=flat-square)

> **This file is the single entry point for any article-generation workflow that
> consumes Run 184's analysis output.** Read this file first, then consume the listed
> artifacts in the recommended order. Article generation MUST NOT start until every
> mandatory artifact has been read in full.

---

## 🎯 Run Context (one-line summary)

**Easter Saturday, April 18, 2026 — EP in recess (Day 5 of 10). Newsworthiness gate:
FAIL. Mode: ANALYSIS_ONLY. This is the 6th consecutive analysis-only run of the
Easter recess series (Runs 179–184) and the designated reference-quality exemplar.**

### Top-of-mind findings (the 5 things every future article must know)

1. **TA-10-2026-0090 through 0098 adopted March 26** (Banking Union, Anti-Corruption,
   Critical Minerals Reserve, US Countermeasures, EU-Morocco, Digital Omnibus). **0099–0104 exist
   in feed but content is pending** (6 texts).
2. **EP MCP server is in API-degraded mode** since Day 1 of recess. Tier-1 feeds
   (adopted_texts_feed, meps_feed) operational; Tier-2/3 analytical tools down.
   Recovery projected April 21–27.
3. **Coalition integrity faces stress-tests on 4 axes** — trade (Section 301),
   banking (BRRD3 transposition), housing (Commission response), digital (ECJ
   challenge). EPP cohesion is the single most decisive unknown (`memberCount=0`
   data gap — see `mcp-reliability-audit.md`).
4. **4 probability-weighted scenarios** for the April 28 plenary:
   A (baseline, 40%), B (resolute response to USTR, 25%), C (muddled housing
   confrontation, 20%), D (compound crisis, 15%).
5. **Run 184 surfaces 3 historically novel analytical contributions** — sustained
   Diamond Model application, MCP reliability audit with upstream issues, and
   empirical API-tiered recovery model.

---

## 📚 Mandatory Reading Order for Article Generation

Article-generation workflows MUST read these 17 artifacts (plus `manifest.json`
as metadata) in this order. Expected total time: 15–20 minutes of active reading.
The list below enumerates 18 rows because row #1 is `manifest.json` (metadata, not
counted as an artifact) — all 17 artifact entries from row #2 through row #18 appear
in `manifest.files.*`.

### Stage 1 — Orientation (read first)

| # | Artifact | Purpose | Lines |
|:-:|----------|---------|:-----:|
| 1 | [`manifest.json`](../manifest.json) | Machine-readable metadata; list of all artifacts; analytical frameworks applied | — |
| 2 | [`intelligence/synthesis-summary.md`](synthesis-summary.md) | Consolidated picture + forward-monitoring priorities + full artifact index | 230+ |
| 3 | **(this file)** | Read-me-first pre-flight index | 200+ |

### Stage 2 — Core findings (read in any order)

| # | Artifact | Framework | Confidence | Lines |
|:-:|----------|-----------|:----------:|:-----:|
| 4 | [`classification/significance-scoring.md`](../classification/significance-scoring.md) | Newsworthiness gate + 100-point scoring | 🟢 High | 118 |
| 5 | [`risk-scoring/risk-matrix.md`](../risk-scoring/risk-matrix.md) | 5×5 Likelihood × Impact (6 vectors) | 🟡 Medium | 144 |
| 6 | [`risk-scoring/quantitative-swot.md`](../risk-scoring/quantitative-swot.md) | 3+3+3+3 SWOT with evidence anchors | 🟡 Medium | 159 |
| 7 | [`documents/document-analysis-index.md`](../documents/document-analysis-index.md) | Per-text status table for TA-10-2026-0090–0104 | 🟢 High | 109 |

### Stage 3 — Political intelligence (read in any order)

| # | Artifact | Framework | Confidence | Lines |
|:-:|----------|-----------|:----------:|:-----:|
| 8 | [`intelligence/coalition-dynamics.md`](coalition-dynamics.md) | Group composition + pair analysis | 🔴 Low (EPP gap) | 150 |
| 9 | [`intelligence/pestle-analysis.md`](pestle-analysis.md) | 6-dimension macro scan | 🟡 Medium | 282 |
| 10 | [`intelligence/stakeholder-map.md`](stakeholder-map.md) | Mendelow grid, 18 stakeholders | 🟡 Medium | 317 |
| 11 | [`intelligence/scenario-forecast.md`](scenario-forecast.md) | 2×2 + 4 probability-weighted scenarios | 🟡 Medium | 290 |
| 12 | [`intelligence/threat-model.md`](threat-model.md) | Diamond + Attack Trees + Kill Chain | 🟡 Medium | 254 |
| 13 | [`intelligence/historical-baseline.md`](historical-baseline.md) | EP10 vs EP8/EP9 (Rule 17) | 🟢 High | 211 |
| 14 | [`intelligence/economic-context.md`](economic-context.md) | World Bank data for DE/FR/IT/PL | 🟢 High | 211 |
| 15 | [`intelligence/wildcards-blackswans.md`](wildcards-blackswans.md) | 8 wildcards + Black Swan reserve | 🔴 Low (by design) | 285 |

### Stage 4 — Meta-analysis (read last)

| # | Artifact | Purpose | Lines |
|:-:|----------|---------|:-----:|
| 16 | [`intelligence/cross-run-diff.md`](cross-run-diff.md) | Delta vs Run 183; hypothesis-tracking | 112 |
| 17 | [`intelligence/mcp-reliability-audit.md`](mcp-reliability-audit.md) | 7 data-quality defects; upstream issues #366–#370 | 434 |
| 18 | [`intelligence/reference-analysis-quality.md`](reference-analysis-quality.md) | Quality-gate checklist (optional for authors) | 180+ |

---

## 🧭 Finding-Level Cross-Reference Map

When drafting a particular kind of passage, consult these specific artifacts:

| Article section you're writing | Primary sources | Supporting sources |
|--------------------------------|-----------------|--------------------|
| **Headline / lead** | `synthesis-summary.md` §Executive Summary | `classification/significance-scoring.md` |
| **News lede — trade angle** | `scenario-forecast.md` §Scenario B, §Decision Tree | `stakeholder-map.md` #5 (USTR), `pestle-analysis.md` §P1 |
| **News lede — banking angle** | `risk-scoring/risk-matrix.md` Risk #1 | `stakeholder-map.md` #4, #7, #8; `economic-context.md` §Germany |
| **News lede — housing angle** | `risk-scoring/risk-matrix.md` Risk #4 | `stakeholder-map.md` #17; `pestle-analysis.md` §S1 |
| **News lede — digital/AI angle** | `threat-model.md` §T2 context, `pestle-analysis.md` §L1 | `stakeholder-map.md` #16 |
| **Coalition dynamics passage** | `intelligence/coalition-dynamics.md` | `stakeholder-map.md` §Coalition-Formation Implications, `threat-model.md` §T3 |
| **Risk / opportunity language** | `risk-scoring/quantitative-swot.md` | `scenario-forecast.md`, `wildcards-blackswans.md` |
| **Historical-comparison paragraph** | `historical-baseline.md` | `get_all_generated_stats` MCP data |
| **Economic context sidebar** | `economic-context.md` | World Bank MCP direct calls |
| **Forward-monitoring / "what to watch" section** | `synthesis-summary.md` §Post-Recess First Run Instructions | `scenario-forecast.md` §Monitoring Priorities |
| **"What if things go very wrong" passage** | `wildcards-blackswans.md` | `scenario-forecast.md` §Scenario D |
| **Data-quality caveats** | `mcp-reliability-audit.md` | `coalition-dynamics.md` §Data-quality warning |

---

## 📝 Article Footer Requirements (MANDATORY)

Every article produced from Run 184 MUST include an **Analysis Sources** footer listing
every analysis artifact consumed. The `renderAnalysisTransparencySection` helper in
`src/templates/article-template.ts` generates this automatically from `manifest.json`
`files` entries — **do not bypass or customise away from this default**.

Minimum expectation: the rendered footer must link to:

1. The run directory: `analysis/daily/2026-04-18/breaking-run184/`
2. `manifest.json`
3. Every file listed in `manifest.files.classification`, `manifest.files.risk_scoring`,
   `manifest.files.intelligence`, `manifest.files.documents`
4. The methodology documents in `analysis/methodologies/`

If an article draft omits the Analysis Sources footer, **it MUST fail validation** and
the workflow MUST execute another pass to add it before publication.

---

## 🚫 Anti-Patterns Rejected

When reading this run, DO NOT:

1. **Skim-read only `synthesis-summary.md`** and treat it as a substitute for the
   underlying artifacts. Synthesis is compression; specifics live in the source files.
2. **Ignore the confidence taxonomy.** Every 🔴 Low finding must be flagged as such in
   article prose; every 🟡 Medium finding carries appropriate hedging language.
3. **Cite only a subset of artifacts.** The Analysis Sources footer exists precisely so
   readers can verify every claim — incomplete citation defeats transparency.
4. **Paraphrase data-quality caveats away.** The EPP `memberCount=0` gap, the
   cohesion-mislabelling defect, and the server-health discrepancy are mandatory
   disclosures in any article that quotes coalition arithmetic.
5. **Invent facts not present in these artifacts.** If a finding is needed but not
   here, trigger an MCP data call — don't fabricate.

---

## 📦 Machine-Readable Summary

```yaml
run_id: 184
date: 2026-04-18
article_type: breaking
mode: ANALYSIS_ONLY
newsworthiness: NO_BREAKING_NEWS
reference_analysis: true
artifacts_total: 17
lines_total: 3632
frameworks_applied: 13
confidence_distribution:
  high: 0.25
  medium: 0.55
  low: 0.20
must_read_before_article: true
citation_footer_mandatory: true
```

---

*Document role: Pre-flight reading index for article-generation workflows*
*Created: 2026-04-18 | Run 184 | Breaking workflow | Analysis-only mode*
*Superseded when: next reference-quality run produces its own `analysis-index.md`*
