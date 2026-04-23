<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 05 — Analysis-to-Article Data Contract (AI-First)

**Summary:** Scripts render structure + `AI_MARKER` sentinels only. The AI
agent reads every analysis `.md` in the run directory and authors all narrative
content directly in the HTML. The validator refuses to publish any article
where a fallback-template sentence leaks through.

## 0 · Cross-Workflow Contract (split-family)

When Stage D runs in a `news-<type>-article.md` workflow (not inline in a
monolithic workflow):

- The **producer** is the paired `news-<type>-analysis.md` workflow.
- The **consumer** (this article workflow) reads the producer's committed
  artifacts at `analysis/daily/${DATE}/${TYPE}/` from `HEAD` of `main`.
- The consumer **never re-runs Stage B**. It may run a bounded Stage-A
  freshness top-up (≤ 5 min, skipped if the analysis PR is < 6 hours old) to
  add new substantive data to `${ANALYSIS_DIR}/data/`, but it does not
  rewrite analysis artifacts.
- The consumer **never produces a second analysis PR**. It opens exactly one
  article PR and links back to the merged analysis PR in the PR body.

This contract guarantees:
- `news/*.html` articles always cite a specific, committed, reviewable
  analysis set.
- Analysis work is never lost if Stage D fails — the analysis PR is already
  merged.
- Repeated analysis runs sharpen a single canonical folder via
  `manifest.json.history[]` rather than scattering across `-run<NN>` dirs.

## 1 · Why This Contract Exists

The `2026-04-20-motions-run46-en.html` regression shipped six stakeholder cards
whose text looked AI-authored but was produced by `deriveStakeholderReasoning()`
(script-generated template prose). Meanwhile the rich AI-authored analysis
markdown was orphaned. This contract both prevents (at author time) and catches
(at publish time) that class of leak.

## 2 · Division of Responsibility

| Layer | Owns | Does NOT do |
|---|---|---|
| **Generator scripts** (`src/generators/**`) | Structural HTML scaffold, data-derived counts/IDs/dates, Mermaid charts, `AI_MARKER` sentinels for narrative slots | Parse analysis markdown; author stakeholder reasoning; invent topics from date ranges |
| **AI agent** (news-* workflows) | Read every `analysis/daily/<date>/<run>/**/*.md`; author every stakeholder / outcome / impact slot; honour ≥ 150 words per perspective | Fabricate data the MCP did not return; skip reading `intelligence/`, `classification/`, `risk-scoring/`, `threat-assessment/`, `existing/`, `documents/` |
| **Validator** (`src/utils/validate-analysis-completeness.ts`) | Refuse any article where `AI_MARKER` or a `FALLBACK_TEMPLATE_PATTERNS` sentence leaks | Render content; judge prose quality beyond depth floors |

## 3 · What the AI Agent MUST Do Before Drafting (Read-Before-Write)

**Rule:** The article agent MUST read every artifact produced in Stage B
before writing any prose. An article that does not cite a specific
`analysis/daily/<run>/…` artifact file for each analytical section fails the
completeness gate (see [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md)).

1. Open [`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md) §§ 8–9 (synthesis + Pass 2) and [`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md) for the master artifact map.
2. Read every file under `files.*` in the run's `manifest.json`. At minimum the following must be read in full:
   - `intelligence/synthesis-summary.md` — composes the seven reference-quality artifacts
   - `intelligence/analysis-index.md` — read-me-first entry (Rule 19)
   - `intelligence/stakeholder-map.md` + `existing/stakeholder-impact.md`
   - `classification/significance-classification.md`, `significance-scoring.md`, `impact-matrix.md`, `actor-mapping.md`
   - `risk-scoring/risk-matrix.md`, `quantitative-swot.md`
   - `threat-assessment/political-threat-landscape.md`
   - `intelligence/scenario-forecast.md`, `pestle-analysis.md`, `threat-model.md`, `historical-baseline.md`, `economic-context.md`, `wildcards-blackswans.md`
   - `existing/deep-analysis.md` (where present)
3. Also read every file under the canonical run subdirectories
   `intelligence/`, `classification/`, `risk-scoring/`, `threat-assessment/`,
   `existing/`, `documents/`. Older `motions-*` runs may additionally mirror
   `stakeholder-map`, `stakeholder-impact`, `pestle-analysis`, `impact-matrix`,
   and `synthesis-summary` into `existing/` — read those mirrors when
   present, but the canonical location enforced by
   `reference-quality-thresholds.json` is `intelligence/`.
4. Author, in the rendered English HTML:
   - `reasoning` prose for each of the 6 stakeholder perspective cards
     (≥ 150 words), grounded in `stakeholder-map.md` / `stakeholder-impact.md`.
   - Every row `reason` cell of the stakeholder outcome matrix, drawing from
     `impact-matrix.md`.
   - The `political / economic / social / legal / geopolitical` dimensions of
     the Impact Assessment block, from `intelligence/synthesis-summary.md` /
     `existing/deep-analysis.md`.
   - Every `[AI_ANALYSIS_REQUIRED]` sentinel remaining in the document.
5. Never ship date-range topic strings (e.g. *"voting period 2026-03-21–2026-04-20"*)
   into stakeholder prose. Substitute the substantive policy topic.
6. See the artifact → article-section map in
   [`04-article-generation.md`](04-article-generation.md) § 7.1 for per-section
   artifact citation requirements.

## 4 · Per-Article-Type Required Inputs

| Article type | Required analysis inputs | AI-authored sections |
|---|---|---|
| `motions` | `existing/stakeholder-impact.md`, `classification/impact-matrix.md`, `intelligence/synthesis-summary.md`, `intelligence/stakeholder-map.md` | Stakeholder Perspectives, Stakeholder Outcome Matrix, Impact Assessment |
| `breaking` | `intelligence/stakeholder-map.md`, `intelligence/coalition-dynamics.md`, `intelligence/mcp-reliability-audit.md`, `intelligence/synthesis-summary.md` | Stakeholder Perspectives, Impact Assessment, Coalition-shift narrative |
| `week-in-review` / `month-in-review` | `intelligence/synthesis-summary.md`, `intelligence/stakeholder-map.md`, `risk-scoring/risk-matrix.md` | Stakeholder Perspectives, Stakeholder Outcome Matrix, Outlook |
| `week-ahead` / `month-ahead` | `intelligence/scenario-forecast.md`, `intelligence/stakeholder-map.md`, `intelligence/synthesis-summary.md` | Scenario cards, Stakeholder Perspectives, Impact Assessment |
| `committee-reports` | `existing/committee-productivity.md`, `classification/`, `risk-scoring/` | Stakeholder Perspectives, Outlook |
| `propositions` | `existing/pipeline-health.md`, `classification/`, `intelligence/synthesis-summary.md` | Stakeholder Perspectives, Action → Consequence table |

Shipping an article of a given type without having read and authored from its
listed inputs is a contract violation.

## 5 · Validator Enforcement

```bash
node scripts/utils/validate-analysis-completeness.js \
  --article-html="news/${DATE}-${TYPE}-en.html"
```

Any `FALLBACK_TEMPLATE_PATTERNS` match → exit 1 → PR is blocked. A new
sentinel added to generator code MUST also be added to
`FALLBACK_TEMPLATE_PATTERNS` and `test/unit/validate-html-fallback.test.js` in
the same commit.

APIs: `scanHtmlForFallbackLeaks`, `scanArticleHtmlFiles`,
`FALLBACK_TEMPLATE_PATTERNS` — all exported from
[`src/utils/validate-analysis-completeness.ts`](../../src/utils/validate-analysis-completeness.ts).
