<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 04 — Article Generation (Stage D)

**Summary:** Stage D starts only after Stage C exits 0. Write prose-first,
synthesize analysis into the narrative, include ≥ 1 real chart and economic
context where policy dictates. Run all validators. Then — and only then — call
`safeoutputs___create_pull_request` exactly once (see
[`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md)).

## 1 · Precondition

> **Do not start Stage D before Stage C exits 0.** If you are reading this
> before a green completeness gate, return to Stage B and run Pass 2 on the
> artifacts the validator flagged.

**In a `news-<type>-article.md` workflow (split family):** Stage D is the
**only** stage that runs. The analysis has already been produced by the
paired `news-<type>-analysis.md` workflow and committed to `main` via a
merged analysis PR. The article workflow's first action is to read the
committed analysis folder:

```
ANALYSIS_DIR=analysis/daily/${DATE}/${TYPE}/
```

Then verify the Stage-C gate-result recorded in
`${ANALYSIS_DIR}/manifest.json.history[]` — the **last** entry's
`gateResult`:

| gate-result | action |
|-------------|--------|
| `GREEN` | Proceed with Stage D. |
| `GREEN_WITH_WARNINGS` | Exit cleanly (noop). Analysis wasn't strong enough to warrant an article; the analysis PR still contains valuable intelligence. |
| `ANALYSIS_ONLY` | Exit cleanly (noop) — analysis-only outcome, no article. |
| `PENDING` / missing | Exit cleanly (noop) — the paired analysis PR hasn't merged yet. |

Use `readLatestGateResult(manifestPath)` from
[`src/utils/file-utils.ts`](../../src/utils/file-utils.ts) to parse this
defensively.

**In a legacy monolithic workflow (pre-split):** Stages A–D run inline as
described below. Same 2-pass + validator rules apply.

## 2 · Generator Command

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true
npx tsx src/generators/news-enhanced.ts \
  --types={article-type-slug} \
  --title="AI-generated headline" \
  --description="AI-generated meta description" \
  --analysis \
  --analysis-methods=all \
  --analysis-dir="${ANALYSIS_DIR}"
```

Article-type slugs: `breaking`, `committee-reports`, `propositions`, `motions`,
`week-ahead`, `month-ahead`, `week-in-review`, `month-in-review`.

## 3 · Mandatory 2-Pass (Pass 1 + Pass 2)

| Pass | Action | Time |
|------|--------|:----:|
| **1 · Initial draft** | Generate HTML, replace every `[AI_ANALYSIS_REQUIRED]` marker with substantive prose. All sections present, prose-first. | ~50% |
| **2 · Read-back & rewrite** | Read the full HTML. For every section verify: ≥ 3 prose paragraphs of ≥ 50 words; cites specific EP data; names specific MEPs/groups; explains WHY not just WHAT. Rewrite anything that fails. | ~50% |

## 4 · Depth Floors (hard rules)

| Gate | Floor |
|------|-------|
| Prose ratio (`<p>` chars vs. `<li>` chars) | ≥ 60 % |
| Paragraphs per analytical section | ≥ 3, each ≥ 50 words |
| Lede paragraph | ≥ 80 words |
| SWOT items per quadrant | ≥ 3, each ≥ 80 words, with evidence and 🟢/🟡/🔴 |
| Stakeholder perspectives | ≥ 4 of 6, each ≥ 150 words |
| Risk outlook | ≥ 200 words, 2–3 probability-labelled scenarios |
| Charts | ≥ 1 `<canvas data-chart-config>` with a Chart.js type + ≥ 3 data points |
| Language switcher | All 14 `.lang-link` entries |
| Footer | Both `.footer-content` and `.footer-bottom` |
| Inline `<script>` in body | ❌ Banned (CSP `script-src 'self'`) |
| `[AI_ANALYSIS_REQUIRED]` markers | ❌ Zero |

## 5 · Economic & Non-Economic Context (Wave-2 policy)

Articles with measurable policy impact include **IMF (economic / fiscal
/ monetary / trade) or World Bank (non-economic: health, education,
social, environment, demographics, defence, agriculture, innovation,
governance)** data. Either source satisfies the validator OR-gate
(`articlePolicyHasEconomicContext`); **IMF is the preferred source for
economic context**, WB accepted for backward compatibility.

Follow the indicator-mapping files:
[`worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md)
(non-economic domains only) and
[`imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md)
(macro / fiscal / trade / monetary + WEO forecasts). **Do not** pass WB
aggregate codes (`EUU`, `EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF`)
to WB MCP tools — the server rejects them; cite IMF `EU`/`EA`
aggregates for EU-level framing instead. Render ≥ 1 Chart.js canvas AND
≥ 1 analytical paragraph (≥ 60 words) that interprets the data.

## 6 · Title · Description · Keywords

- **`<title>` / `<h1>`**: AI-generated from analysis, active voice, ≤ 70 chars,
  names actors. Never contains raw metrics, article-type labels, or date-centric
  formats.
- **`<meta name="description">`**: 150–160 chars, names most significant item +
  outcome + coalition dynamics. Never boilerplate; never repeats the title.
- **`<meta name="keywords">`**: policy terms, committee names, document IDs,
  group names only. ❌ Never section headings or navigation labels.

Pass title and description via CLI flags; never let the generator invent them.

## 7 · Analysis-to-Article Synthesis

Every analysis artifact referenced in `manifest.json` must appear in the
article prose. The `renderAnalysisTransparencySection(...)` helper renders the
footer section listing each artifact — pass the full `AnalysisFileEntry[]` so
every artifact links.

### 7.1 Artifact → Article-Section Map (Read-Before-Write)

Before drafting each article section, **open and cite** the corresponding
artifact(s). An article that does not cite a specific artifact file for each
analytical section fails the completeness gate.

| Article section | Primary artifact(s) | Supporting artifact(s) |
|---|---|---|
| Lede / headline rationale | `intelligence/synthesis-summary.md` | `classification/significance-classification.md`, `classification/significance-scoring.md` |
| Actors / forces paragraph | `classification/actor-mapping.md`, `classification/forces-analysis.md` | `intelligence/coalition-dynamics.md` |
| SWOT section | `risk-scoring/quantitative-swot.md` | `existing/deep-analysis.md` (SWOT framework narrative) |
| Stakeholder perspectives (6-lens) | `intelligence/stakeholder-map.md`, `existing/stakeholder-impact.md` | `classification/impact-matrix.md` |
| Stakeholder outcome matrix | `classification/impact-matrix.md` | `existing/stakeholder-impact.md` |
| Risk / threat outlook | `risk-scoring/risk-matrix.md`, `threat-assessment/political-threat-landscape.md` | `threat-assessment/actor-threat-profiles.md`, `threat-assessment/consequence-trees.md`, `risk-scoring/political-capital-risk.md`, `risk-scoring/legislative-velocity-risk.md` |
| Forecast / scenarios | `intelligence/scenario-forecast.md` | `intelligence/wildcards-blackswans.md` |
| PESTLE / policy context | `intelligence/pestle-analysis.md` | `intelligence/historical-baseline.md` |
| Economic context block (Wave-2) | `intelligence/economic-context.md` | `analysis/methodologies/worldbank-indicator-mapping.md`, `analysis/methodologies/imf-indicator-mapping.md` |
| Threat-model callout | `intelligence/threat-model.md` OR `intelligence/political-threat-landscape.md` | `threat-assessment/actor-threat-profiles.md` |
| Voting-pattern chart | `existing/voting-patterns.md` | `intelligence/coalition-dynamics.md` |
| Cross-session continuity | `existing/cross-session-intelligence.md`, `existing/cross-run-diff.md` | `existing/session-baseline.md` |
| Transparency footer | all `manifest.files.*` entries (linked via `renderAnalysisTransparencySection`) | `intelligence/analysis-index.md` |

Full contract (AI_MARKER sentinels, per-article-type inputs):
[`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md).

## 8 · Validators (run in order, all must exit 0)

```bash
# 1. Fallback-leak scan on rendered HTML
node scripts/utils/validate-analysis-completeness.js \
  --article-html="news/${TODAY}-${TYPE}-en.html"

# 2. Quality / structural validator
npx tsx src/utils/validate-articles.ts --date="$TODAY" --quality --strict
```

Non-zero exit from either blocks PR creation. Do NOT skip, do NOT `--warn-only`.

## 9 · No-Publish Rule

Do NOT publish an article when:
- Every feed returned empty/error AND no adopted texts exist
- Analysis contains only precomputed stats, zero feed-sourced data
- Article body would be entirely historical context with no news

Instead: ship analysis-only via the same single PR
([`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §3).

## 10 · Dashboard Rendering

If `monitor_legislative_pipeline` returns `health: 0%, throughput: 0`, that
means NO DATA, not "pipeline scored 0". Omit the dashboard panel or show
"Data unavailable for this period". Any metric that equals exactly 0 from an
analytical tool should be verified against feed data before rendering.

## 11 · Exit to Stage E (PR)

After all validators exit 0, read
[`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) and emit the PR
**exactly once**.
