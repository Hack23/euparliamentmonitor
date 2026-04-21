<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 05 — Analysis-to-Article Data Contract (AI-First)

**Summary:** Scripts render structure + `AI_MARKER` sentinels only. The AI
agent reads every analysis `.md` in the run directory and authors all narrative
content directly in the HTML. The validator refuses to publish any article
where a fallback-template sentence leaks through.

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
| **AI agent** (news-* workflows) | Read every `analysis/daily/<date>/<run>/**/*.md`; author every stakeholder / outcome / impact slot; honour ≥ 150 words per perspective | Fabricate data the MCP did not return; skip reading intelligence/, synthesis/, classification/, risk/, existing/, documents/ |
| **Validator** (`src/utils/validate-analysis-completeness.ts`) | Refuse any article where `AI_MARKER` or a `FALLBACK_TEMPLATE_PATTERNS` sentence leaks | Render content; judge prose quality beyond depth floors |

## 3 · What the AI Agent MUST Do Before Drafting

1. Read every file under `files.*` in the run's `manifest.json`.
2. Also read files in `intelligence/`, `synthesis/`, `classification/`, `risk/`,
   `existing/`, `documents/` subdirectories (reference-quality runs place
   stakeholder-map, stakeholder-impact, pestle-analysis, impact-matrix,
   synthesis-summary here).
3. Author, in the rendered English HTML:
   - `reasoning` prose for each of the 6 stakeholder perspective cards
     (≥ 150 words), grounded in `stakeholder-map.md` / `stakeholder-impact.md`.
   - Every row `reason` cell of the stakeholder outcome matrix, drawing from
     `impact-matrix.md`.
   - The `political / economic / social / legal / geopolitical` dimensions of
     the Impact Assessment block, from `synthesis-summary.md` / `deep-analysis.md`.
   - Every `[AI_ANALYSIS_REQUIRED]` sentinel remaining in the document.
4. Never ship date-range topic strings (e.g. *"voting period 2026-03-21–2026-04-20"*)
   into stakeholder prose. Substitute the substantive policy topic.

## 4 · Per-Article-Type Required Inputs

| Article type | Required analysis inputs | AI-authored sections |
|---|---|---|
| `motions` | `existing/stakeholder-impact.md`, `classification/impact-matrix.md`, `synthesis/synthesis-summary.md`, `intelligence/stakeholder-map.md` | Stakeholder Perspectives, Stakeholder Outcome Matrix, Impact Assessment |
| `breaking` | `intelligence/stakeholder-map.md`, `intelligence/coalition-dynamics.md`, `intelligence/mcp-reliability-audit.md`, `synthesis-summary.md` | Stakeholder Perspectives, Impact Assessment, Coalition-shift narrative |
| `week-in-review` / `month-in-review` | `synthesis/synthesis-summary.md`, `intelligence/stakeholder-map.md`, `risk/risk-matrix.md` | Stakeholder Perspectives, Stakeholder Outcome Matrix, Outlook |
| `week-ahead` / `month-ahead` | `intelligence/scenario-forecast.md`, `intelligence/stakeholder-map.md`, `synthesis-summary.md` | Scenario cards, Stakeholder Perspectives, Impact Assessment |
| `committee-reports` | `existing/committee-productivity.md`, `classification/`, `risk-scoring/` | Stakeholder Perspectives, Outlook |
| `propositions` | `existing/pipeline-health.md`, `classification/`, `synthesis-summary.md` | Stakeholder Perspectives, Action → Consequence table |

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
