<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 05 — Analysis-to-Article Data Contract (Aggregator Era)

**Summary:** The aggregator renders the final article deterministically from
the committed Stage-B artifacts. Agents do **not** author HTML prose in
Stage D. The Stage-C completeness review refuses to stamp `GREEN` when an
artifact is missing, under its depth floor, or contains an
`[AI_ANALYSIS_REQUIRED]` marker.

## 1 · Why This Contract Exists

The `2026-04-20-motions-run46-en.html` regression shipped six stakeholder
cards whose text looked AI-authored but was produced by
`deriveStakeholderReasoning` — script-generated template prose that
survived into news/. The April-2026 aggregator-pipeline migration removed
that class of leak at the root by deleting every HTML-authoring path from
the generator (`src/generators/strategies/**`, `src/generators/builders/**`,
`src/utils/content-validator.ts`, `src/utils/validate-articles.ts`,
`src/utils/validate-analysis-completeness.ts`, `src/templates/article-template.ts`,
`src/generators/news-enhanced.ts`). There is no longer a template sentence
that a script could write into a published article. The aggregator only
reads what the AI wrote into the committed markdown artifacts.

This contract both documents the new division of responsibility and
pins the Read-Before-Write behaviour the Stage-B agent must follow so every
artifact the aggregator renders is present and substantive.

## 2 · Division of Responsibility

| Layer | Owns | Does NOT do |
|---|---|---|
| **AI agent** (Stages A–C, `news-<type>.md` workflows) | Every analysis artifact under `analysis/daily/<run>/**/*.md`; `manifest.json` (top-level `articleType` + `files`); Stage-C completeness self-review (Pass 2) | Draft HTML; invent narrative at render time; rely on a script to fill in stakeholder reasoning |
| **Aggregator CLI** (`src/aggregator/**`, `npm run generate-article`) | Walk manifest + artifacts in canonical order; clean front-matter/banners; demote headings; rewrite relative links; dedupe mermaid; render HTML via `markdown-it` + shared chrome + 14 hreflang | Judge prose quality; re-author missing sections; parse artifact prose for "the topic" |
| **Stage-C review** (agent-side, Pass 2, see [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md)) | Depth floors (`reference-quality-thresholds.json`), IMF economic-context presence, artifact citations, manifest schema validity | Render HTML; run post-publish scans |

## 3 · What the AI Agent MUST Do Before Closing Stage B (Read-Before-Write)

**Rule:** The Stage-B agent MUST produce every canonical artifact
([`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md))
required by the article type before stamping the manifest `GREEN`. An
analysis run whose synthesis artifacts do not cite specific upstream
artifacts fails the Stage-C gate.

1. Open [`analysis/methodologies/ai-driven-analysis-guide.md`](../../analysis/methodologies/ai-driven-analysis-guide.md) §§ 8–9 (synthesis + Pass 2) and [`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md) for the master artifact map.
2. Produce every file under `files.*` in the run's `manifest.json`. At minimum the following are mandatory for every article type:
   - `executive-brief.md` at the run root — mandatory reader layer (BLUF, three decisions, 60-second read, top documents/procedures table, Mermaid risk snapshot, top forward trigger; floor 180 lines per `reference-quality-thresholds.json`)
   - `intelligence/synthesis-summary.md` — composes the seven reference-quality artifacts
   - `intelligence/analysis-index.md` — read-me-first entry (Rule 19)
   - `intelligence/stakeholder-map.md` + `existing/stakeholder-impact.md`
   - `classification/significance-classification.md`, `significance-scoring.md`, `impact-matrix.md`, `actor-mapping.md`
   - `risk-scoring/risk-matrix.md`, `quantitative-swot.md`
   - `threat-assessment/political-threat-landscape.md`
   - `intelligence/scenario-forecast.md`, `pestle-analysis.md`, `threat-model.md`, `historical-baseline.md`, `economic-context.md`, `wildcards-blackswans.md`
   - `existing/deep-analysis.md` (where the article type requires it)
   - `workflow-audit.md` and `methodology-reflection.md` at the run root — the **last two** artifacts of the run (`ai-driven-analysis-guide.md` Step 10.5)
3. Populate every file under the canonical run subdirectories
   `intelligence/`, `classification/`, `risk-scoring/`, `threat-assessment/`,
   `existing/`, `documents/`. Older `motions-*` runs may additionally mirror
   `stakeholder-map`, `stakeholder-impact`, `pestle-analysis`, `impact-matrix`,
   and `synthesis-summary` into `existing/` for back-compat — the canonical
   location enforced by `reference-quality-thresholds.json` remains
   `intelligence/`.
4. Inside each artifact, author prose directly — no sentinels, no
   `[AI_ANALYSIS_REQUIRED]` placeholders. Pass 2 of Stage B is the
   rewrite-shallow-sections pass:
   - `reasoning` prose for each of the 6 stakeholder perspective lenses
     (≥ 150 words in `intelligence/stakeholder-map.md`), grounded in
     substantive EP data.
   - Every row in the impact matrix (`classification/impact-matrix.md`)
     must carry a non-trivial `reason` cell.
   - The `political / economic / social / legal / geopolitical` dimensions
     of `intelligence/synthesis-summary.md` / `existing/deep-analysis.md`
     each carry ≥ 3 paragraphs of ≥ 50 words.
5. Never ship date-range topic strings (e.g. *"voting period 2026-03-21 – 2026-04-20"*)
   in lieu of substantive topics. The aggregator passes the artifact text
   through verbatim — whatever you commit is what readers see.
6. See the artifact → rendered-section map in
   [`04-article-generation.md`](04-article-generation.md) § 7 for the
   one-to-one mapping between artifacts and rendered article sections.

## 4 · Per-Article-Type Required Artifacts

| Article type | Required analysis inputs (must be GREEN at Stage C) |
|---|---|
| `motions` | `existing/stakeholder-impact.md`, `classification/impact-matrix.md`, `intelligence/synthesis-summary.md`, `intelligence/stakeholder-map.md` |
| `breaking` | `intelligence/stakeholder-map.md`, `intelligence/coalition-dynamics.md`, `intelligence/mcp-reliability-audit.md`, `intelligence/synthesis-summary.md` |
| `week-in-review` / `month-in-review` | `intelligence/synthesis-summary.md`, `intelligence/stakeholder-map.md`, `risk-scoring/risk-matrix.md` |
| `week-ahead` / `month-ahead` | `intelligence/scenario-forecast.md`, `intelligence/stakeholder-map.md`, `intelligence/synthesis-summary.md` |
| `committee-reports` | `existing/committee-productivity.md`, `classification/`, `risk-scoring/` |
| `propositions` | `existing/pipeline-health.md`, `classification/`, `intelligence/synthesis-summary.md` |

Shipping a run of a given type without the listed inputs is a Stage-C gate
violation; the Stage-C review must stamp `RED` and the aggregator must not
be invoked.

## 5 · Stage-C Enforcement

Stage C is enforced by the authoritative Node validator at
[`scripts/validate-analysis-completeness.js`](../../scripts/validate-analysis-completeness.js),
invoked as `npm run validate-analysis -- <runDir>` and fully documented in
[`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) §1.
The validator runs against:

- `analysis/methodologies/reference-quality-thresholds.json` (per-artifact
  minimum line floors)
- `analysis/methodologies/artifact-catalog.md` (mandatory-artifact index)
- the per-type matrix in §4 above

Refusal criteria (any one fails the gate — exit 1, stamp `RED`):

- any mandatory artifact under [§4](#4--per-article-type-required-artifacts) missing
- any mandatory artifact below its depth floor in
  `reference-quality-thresholds.json` (DEFAULT_MIN_LINES=30 fallback)
- any `[AI_ANALYSIS_REQUIRED]` / `AI_ANALYSIS_PENDING` / `[TBD]` / `TODO:`
  sentinel marker in a committed artifact
- mandatory mermaid presence missing under `intelligence/`,
  `classification/`, `risk-scoring/`, `threat-assessment/`
- missing Admiralty / WEP / SAT / BLUF tradecraft signals or required H2
  sections
- `manifest.json` missing top-level `articleType` or `files`
- `intelligence/economic-context.md` missing for a policy article
  (motions, propositions, committee-reports, month-ahead, month-in-review)

A second RED after Pass 3 routes the workflow to an analysis-only PR (see
[`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) §4)
and skips article render entirely.
