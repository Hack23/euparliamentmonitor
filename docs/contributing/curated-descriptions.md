# Contributing — Curated Political-Intelligence Descriptions

This guide explains how to add or edit a curated card on the
`political-intelligence_<lang>.html` landing page for a methodology,
template, or reference Markdown file under `analysis/**`.

## Where the data lives

The political-intelligence landing page renders one card per Markdown
file under `analysis/methodologies/`, `analysis/templates/`,
`analysis/reference/`, `analysis/imf/`, and `analysis/worldbank/`. Each
card has:

- A **title** (`<h2>`) — preferably localized in all 14 languages.
- A **description** (paragraph) — localized in all 14 languages.
- An **icon** + per-domain category (handled elsewhere).

The 14-language overlays for titles and descriptions are split per
document category so editors of one category don't conflict with
editors of another (Refactor 8/8 — the single 3324-LOC monolith was
broken up in April 2026):

```
src/generators/political-intelligence/descriptions/
├── desc-methodologies.ts        ← descriptions for analysis/methodologies/*.md
├── desc-templates.ts            ← descriptions for analysis/templates/*.md
├── desc-references.ts           ← descriptions for analysis/reference|imf|worldbank/*.md
├── titles-methodologies.ts      ← 14-language titles for analysis/methodologies/*.md
├── titles-references.ts         ← 14-language titles for analysis/reference|imf|worldbank/*.md
├── titles-templates-a.ts        ← 14-language titles for analysis/templates/ (A–M)
├── titles-templates-b.ts        ← 14-language titles for analysis/templates/ (M–Z)
├── run-types-titles.ts          ← 14-language titles per canonical run-type slug
├── run-types-descriptions.ts    ← 14-language descriptions per canonical run-type slug
├── curated-descriptions.ts      ← aggregator (CURATED_DESCRIPTIONS map)
├── curated-titles.ts            ← aggregator (CURATED_TITLES map)
├── fallback.ts                  ← localized "kind" words + generic-fallback builder
├── lookup.ts                    ← getCuratedDescription / getCuratedTitle / has*
├── run-types.ts                 ← parseRunSlug / getRunTypeInfo / canonicalizeArtifactStem
├── artifact-info.ts             ← getArtifactInfo + FEED_PREFIX_LABELS + ORPHAN_ARTIFACT_INFO
├── types.ts                     ← shared TextI18n + CuratedDescription interfaces
└── index.ts                     ← public barrel
```

## How to add a curated description

When a new methodology / template / reference Markdown file lands under
`analysis/`, the card is rendered with a **localized generic fallback
sentence** ("{title} — methodology in the EU Parliament Monitor analysis
library." in all 14 languages). To replace it with a curated description:

1. Identify the **category** of the file. Pick the matching file:
   - `analysis/methodologies/*.md` → `desc-methodologies.ts`
   - `analysis/templates/*.md` → `desc-templates.ts`
   - `analysis/reference|imf|worldbank/*.md` → `desc-references.ts`
2. Add an entry keyed by the **repository-relative path** with the
   English `description` field, plus optional `i18n` overlay:
   ```ts
   'analysis/methodologies/my-new-methodology.md': {
     description: 'One-sentence English description (≤ ~220 chars).',
     i18n: {
       sv: 'En meningsbeskrivning på svenska.',
       de: 'Eine Beschreibung auf Deutsch.',
       // ... 11 more languages (optional — missing languages get the
       // localized generic fallback sentence built from the title)
     },
   },
   ```
3. For a localized **title**, add an entry to the matching titles file
   (`titles-methodologies.ts`, `titles-references.ts`, or one of
   `titles-templates-{a,b}.ts`):
   ```ts
   'analysis/methodologies/my-new-methodology.md': {
     en: 'My New Methodology',
     sv: 'Min nya metodik',
     // ... 12 more languages
   },
   ```
4. Run `npm run generate-sitemap` and visually check the rendered card
   in `political-intelligence_<lang>.html` for at least 2 languages.
5. Run `npm run test -- --run political-intelligence` to confirm the
   drift-guards still pass.

## Choosing the right split for a template title

`titles-templates-a.ts` covers `analysis/templates/README.md` through
`analysis/templates/mcp-reliability-audit.md` (alphabetical), and
`titles-templates-b.ts` covers `analysis/templates/media-framing-analysis.md`
through `analysis/templates/workflow-audit.md`. Insert a new template
title in the file whose **alphabetical range** contains it. The
drift-guard `political-intelligence-descriptions-split.test.js` asserts
that A and B have **no overlap** and that they together cover every key
in `CURATED_TITLES` that points at `analysis/templates/`.

## Quality rules

- Keep titles ≤ 60 chars, free of emoji (emoji comes from `doc.icon`).
- Keep descriptions ≤ ~220 chars, factual, present tense, no marketing
  superlatives.
- Don't mix concerns — descriptions describe **what the file is**, not
  **how to use it**.
- For non-English entries, prefer native-speaker translations over
  machine translations; the agentic translation pipeline (see
  `news-translate.md`) is for article prose, not for these short
  editorial labels.
- Always provide an `en` entry. Missing-language entries fall back to
  the English canonical for English readers and to the localized
  generic-fallback sentence for non-English readers.

## Run-type and per-artifact labels

Daily-analysis run cards (e.g. `breaking-run192`) and per-artifact cards
(`swot-analysis.md`, `adoptedtexts-foo-bar-analysis.md`) resolve their
labels through `run-types.ts` + `run-types-{titles,descriptions}.ts` and
`artifact-info.ts` respectively. The same 14-language coverage rule
applies — extend those files if a new run-type slug or canonical artifact
stem appears.

## Drift-guards

- `test/unit/political-intelligence-descriptions-split.test.js` —
  asserts barrel parity, per-category coverage, and
  description/title completeness across all 14 languages for every
  shipped `analysis/{methodologies,templates,reference}/*.md` file.
- `test/integration/sitemap-cli-byte-equality.test.js` — asserts
  `political-intelligence_<lang>.html` is byte-identical across two
  consecutive `npm run generate-sitemap` invocations (modulo build
  metadata).

If either drift-guard fails after your edit, you have either:
- left a path uncovered in one language (add the missing overlay), or
- introduced a key that does not point at a real file under `analysis/`
  (remove the stale curated entry), or
- broken the per-category invariant for `desc-references.ts` /
  `titles-templates-{a,b}.ts` (move the entry to the right file).
