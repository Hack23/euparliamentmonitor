<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 04 — Article Assembly (Stage D)

**Summary:** Stage D starts only after Stage C exits 0. The agent does **not**
author prose in Stage D any more — all narrative lives in the committed
Stage-B `analysis/` markdown artifacts. Stage D invokes the deterministic
aggregator CLI (`npm run generate-article`), which walks every artifact listed
in `manifest.json`, normalises it through `src/aggregator/clean-artifact.ts`,
and emits the final HTML via `src/aggregator/article-html.ts`. Then — and only
then — call `safeoutputs___create_pull_request` exactly once (see
[`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md)).

For the end-to-end article object, UI/UX export, `article.md` provenance, and
static-site publication contract, also read
[`Article-Generation.md`](../../Article-Generation.md). This prompt is the
operational Stage-D checklist; `Article-Generation.md` is the durable reference.

For the end-to-end article object, UI/UX export, `article.md` provenance, and
static-site publication contract, also read
[`Article-Generation.md`](../../Article-Generation.md). This prompt is the
operational Stage-D checklist; `Article-Generation.md` is the durable reference.

## 1 · Precondition

> **Do not start Stage D before Stage C exits 0.** If you are reading this
> before a green completeness gate, return to Stage B and run Pass 2 on the
> artifacts the validator flagged.

In the current **unified** `news-<type>.md` workflow (Stages A → B → C → D → E
in one session), Stage D runs inline after the Stage-C gate exits 0. The
agent has just written the full artifact set under
`${ANALYSIS_DIR}=analysis/daily/${DATE}/${TYPE}-run<NN>/` and the
`manifest.json` has its latest `history[]` entry stamped `GREEN`.

## 2 · Generator Command

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true
# Render article deterministically from committed analysis artifacts:
npm run generate-article -- --run "${ANALYSIS_DIR}"
```

Article-type slugs: `breaking`, `committee-reports`, `propositions`, `motions`,
`week-ahead`, `month-ahead`, `week-in-review`, `month-in-review`.

The aggregator CLI is the **sole** render step. It:

1. Writes `article.md` **into the analysis run directory** (`${ANALYSIS_DIR}/article.md`) — the canonical Markdown source co-located with the artifacts that produced it. This is excluded from future aggregation so the aggregator never recurses into its own output.
2. Writes `news/<slug>.en.md` for backwards compatibility with the news-index scripts.
3. Renders 14 language-variant HTML files under `news/` with the "View source Markdown" link pointing to `article.md` in the run directory.

There are no more per-type strategies, section-builders, or AI-authored HTML slots. The AI's job is done
when every mandatory artifact under
[`analysis/methodologies/artifact-catalog.md`](../../analysis/methodologies/artifact-catalog.md)
is present on disk and passes the Stage-C depth floors in
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json).

## 3 · Division of Responsibility

| Layer | Owns | Does NOT do |
|---|---|---|
| **AI agent** (Stages A–C) | Every analysis artifact under `analysis/daily/<run>/**/*.md`; manifest.json; Stage-C self-review | Draft article HTML; invent artifact-level prose at render time |
| **Aggregator CLI** (`src/aggregator/**`) | Read `manifest.json`; walk every artifact in canonical order; clean front-matter/banners/demote headings; rewrite relative links; dedupe mermaid diagrams; emit final HTML via shared chrome + 14 hreflang | Judge prose quality; re-author missing sections; silently fill gaps |
| **Stage-C review** (agent-side, Pass 2) | Depth floors, IMF economic-context presence (Wave-4 strict default — see below), artifact citations, manifest schema | Render HTML; post-publish policing |

The legacy `AI_MARKER` / `[AI_ANALYSIS_REQUIRED]` sentinel contract and the
`FALLBACK_TEMPLATE_PATTERNS` runtime scanner were removed with the
`src/generators/strategies/**`, `src/utils/content-validator.ts`,
`src/utils/validate-articles.ts`, and `src/utils/validate-analysis-completeness.ts`
modules in the April-2026 aggregator-pipeline purge. Those leaks cannot be
introduced by the aggregator because there is no HTML-authoring step to leak
from. The quality gate has moved to Stage-C editorial review over the markdown
artifacts themselves.

## 4 · Depth Floors (enforced at Stage C over the artifacts)

These floors live in
[`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json)
and are checked during the agent-side Stage-C completeness review (Pass 2):

| Gate | Floor |
|------|-------|
| Core artifact prose paragraphs | ≥ 3 per analytical section, each ≥ 50 words |
| Lede paragraph in `intelligence/synthesis-summary.md` | ≥ 80 words |
| SWOT items per quadrant (`risk-scoring/quantitative-swot.md`) | ≥ 3, each ≥ 80 words, with evidence and 🟢/🟡/🔴 |
| Stakeholder perspectives (`intelligence/stakeholder-map.md` + `existing/stakeholder-impact.md`) | ≥ 4 of 6 lenses, each ≥ 150 words |
| Risk outlook (`risk-scoring/risk-matrix.md`) | ≥ 200 words, 2–3 probability-labelled scenarios |
| Charts in committed artifacts | ≥ 1 Mermaid diagram or embedded Chart.js config in a canonical artifact |
| `[AI_ANALYSIS_REQUIRED]` markers | ❌ Zero — any marker in a committed artifact fails Stage C |

Shipping an article without the matching artifacts passing their floors is a
contract violation; the Stage-C gate must refuse to stamp `GREEN`.

## 5 · Economic & Non-Economic Context (Wave-4 IMF-strict default)

Articles with measurable policy impact MUST include **IMF economic context**
(GDP, inflation, unemployment, debt, deficit, trade, FDI, exchange rate,
monetary policy) as the primary anchor in
`intelligence/economic-context.md`. World Bank is retained for non-economic
domains only (health, education, social, environment, demographics, defence,
agriculture, innovation, governance).

**IMF is the required primary source for economic claims.** The legacy
runtime validator gates (`articlePolicyHasEconomicContext` /
`articlePolicyHasIMFEconomicEvidence`) lived in
`src/utils/content-validator.ts`, which was purged in the April-2026
aggregator-pipeline migration; enforcement is now editorial and happens
during Stage C completeness review.

Follow the indicator-mapping files:
[`imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md)
(macro / fiscal / trade / monetary + WEO forecasts + per-type indicator
minimums — mandatory primary source) and
[`worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md)
(non-economic domains only). **Do not** pass WB aggregate codes
(`EUU`, `EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF`) to WB MCP
tools — the server rejects them; cite IMF `EU`/`EA` aggregates for
EU-level framing instead.

Every IMF citation MUST include, in the
`intelligence/economic-context.md` artifact:

1. **Vintage in prose** (`IMF WEO April 2026`, `IMF Fiscal Monitor April 2026`).
2. **Forecast marker** within 30 words of any projected number
   (`forecast`, `projection`, `projects`, `expects`, etc.).
3. **Optimism-bias caveat** for horizons ≥ 3 years (sized per
   [`analysis/imf/forecast-accuracy-baseline.md`](../../analysis/imf/forecast-accuracy-baseline.md)).

At least one Mermaid diagram or Chart.js canvas block AND one analytical
paragraph (≥ 60 words) interpreting the data must be present in the artifact.

## 6 · SEO Title · Description · Search Intent

The aggregator derives the article `<title>` / `<meta name="description">`
through the 5-tier editorial-highlight resolver in
`src/aggregator/article-metadata.ts`. Tier ordering:

1. **Manifest override** (authored by you, Stage-B agent): when you have
   an editorial headline, write it into `manifest.json` alongside
   `articleType` + `files`:

   ```jsonc
   {
     "articleType": "breaking",
     "title": "Banking Union Breakthrough and Anti-Corruption Landmark",
     "description": "The plenary closes a six-year debate and triggers immediate criticism from two national delegations about implementation timelines.",
     "files": { /* … */ }
   }
   ```

   Both fields accept either a string (applied to all 14 language
   variants — recommended when only English prose exists) or a per-
   language object (e.g. `"title": { "en": "…", "sv": "…" }`). Missing
   languages transparently fall through to the lower tiers.
2. **First artefact H1** — the resolver promotes the first non-generic
   `# …` heading it finds by walking the manifest's file list in
   canonical order. Your synthesis-summary's first heading is therefore
   the de-facto headline when no manifest override is written.
3. **Aggregated-markdown H1** — any non-generic top-level heading.
4. **First strong prose paragraph** — with a tightened leak filter that
   blocks mermaid `%%{init}` blocks, `title …` directives, emoji-banner
   metadata, and `Analysis Date:` / `Classification:` / `Run:` /
   `Window:` / `Purpose:` / `BLUF (ICD-203):` / `Composition layer:`
   rows. Any paragraph beginning with such a prefix is skipped.
5. **Localized template** — last-resort `*_TITLES(date)` fallback from
   `src/constants/language-articles.ts`.

**Rule for Stage-B agents**: write `manifest.title` and
`manifest.description` **with the day's actual editorial highlight**
whenever possible. Required qualities:

- active voice, ≤ 70 chars, names the actor / institution / legislative file
- never contains raw metrics, article-type labels, or date-centric
  formats like `EU Parliament Breaking — 2026-04-14`
- never repeats the lede verbatim in the description — `description`
  must complement `title`, not echo it
- description target: 150–160 characters, one policy consequence, one named
  stakeholder impact, no markdown, no citation brackets, no unsupported
  probability claim
- search intent: ensure the title or first two headings contain the natural
  language terms citizens would search for (committee acronym, procedure title,
  policy area, and one named institution) without keyword stuffing
- never leaks `Run:`, `Purpose:`, `BLUF`, or `Composition layer` prefixes
  (these are filtered out of fallback tiers, but a manual override with
  one of these prefixes would be used verbatim)

When you DO NOT write a manifest override, make sure the first heading
of `intelligence/synthesis-summary.md` meets the same rules, because the
Tier-2 fallback will promote it into the `<title>`.

**SEO self-check before Stage D:**

| Check | Pass condition |
|---|---|
| Specificity | Title names an EP actor, committee, procedure, vote, or policy file. |
| Click value | Description explains why the development matters politically, not merely that it occurred. |
| Evidence hygiene | Title/description only use facts already present in `synthesis-summary.md` or `significance-scoring.md`. |
| IMF relevance | If the article has economic stakes, description alludes to the economic pressure only when `economic-context.md` cites IMF evidence. |
| Locale safety | Non-English rendered pages may fall back to English title until translation flush; never put English-only boilerplate in manifest per-language fields. |

The aggregator does not invent SEO copy. If the manifest and first synthesis H1
are generic, the published `<title>`, Open Graph headline, Twitter card, JSON-LD
headline, indexes, RSS, and sitemap-derived metadata will be generic too.

## 7 · Analysis-to-Article Artifact Map (authoritative)

Every analysis artifact referenced in `manifest.files.*` is walked by the
aggregator in canonical order (`src/aggregator/artifact-order.ts`) and
rendered into the final HTML. The article's section-to-artifact mapping
is therefore the same as the canonical artifact order — there is no
separate "article structure" to maintain.

| Article section (rendered) | Primary artifact(s) | Supporting artifact(s) |
|---|---|---|
| Lede / headline rationale | `intelligence/synthesis-summary.md` | `classification/significance-classification.md`, `classification/significance-scoring.md` |
| Actors / forces paragraph | `classification/actor-mapping.md`, `classification/forces-analysis.md` | `intelligence/coalition-dynamics.md` |
| SWOT section | `risk-scoring/quantitative-swot.md` | `existing/deep-analysis.md` (SWOT framework narrative) |
| Stakeholder perspectives (6-lens) | `intelligence/stakeholder-map.md`, `existing/stakeholder-impact.md` | `classification/impact-matrix.md` |
| Stakeholder outcome matrix | `classification/impact-matrix.md` | `existing/stakeholder-impact.md` |
| Risk / threat outlook | `risk-scoring/risk-matrix.md`, `threat-assessment/political-threat-landscape.md` | `threat-assessment/actor-threat-profiles.md`, `threat-assessment/consequence-trees.md`, `risk-scoring/political-capital-risk.md`, `risk-scoring/legislative-velocity-risk.md` |
| Forecast / scenarios | `intelligence/scenario-forecast.md` | `intelligence/wildcards-blackswans.md` |
| PESTLE / policy context | `intelligence/pestle-analysis.md` | `intelligence/historical-baseline.md` |
| Economic context block (Wave-4) | `intelligence/economic-context.md` | `analysis/methodologies/imf-indicator-mapping.md` (primary), `analysis/methodologies/worldbank-indicator-mapping.md` (non-economic only), `analysis/imf/forecast-accuracy-baseline.md` |
| Threat-model callout | `intelligence/threat-model.md` OR `intelligence/political-threat-landscape.md` | `threat-assessment/actor-threat-profiles.md` |
| Voting-pattern chart | `existing/voting-patterns.md` | `intelligence/coalition-dynamics.md` |
| Cross-session continuity | `existing/cross-session-intelligence.md`, `existing/cross-run-diff.md` | `existing/session-baseline.md` |
| Transparency footer | all `manifest.files.*` entries (linked by the aggregator) | `intelligence/analysis-index.md` |

Manifest schema (top-level `articleType` + `files` object) is documented in
[`DATA_MODEL.md`](../../DATA_MODEL.md) § Manifest Schema and enforced by the
Stage-C agent-side review — see
[`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md).

See [`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md)
for the read-before-write contract the Stage-B agent must follow so every
artifact the aggregator renders is present and substantive.

## 8 · Rendering Contract (summary)

The aggregator CLI (`npm run generate-article -- --run <analysis-run-dir>`)
is the sole render step. It:

- reads `manifest.json`
- walks every artifact listed under `files` in canonical order
  (`src/aggregator/artifact-order.ts`)
- normalises each artifact through `src/aggregator/clean-artifact.ts`
  (front-matter strip, heading demote, ReDoS-safe relative-link rewrite,
  FNV-1a-hashed mermaid dedup, HTML sanitisation)
- renders the aggregated markdown through `markdown-it` + plugins
  (`markdown-renderer.ts`) with a mermaid fence override
- emits the final HTML via `src/aggregator/article-html.ts` with the shared
  site chrome and 14-language `<link rel="alternate" hreflang>` entries

The legacy standalone validators (`scripts/utils/validate-analysis-completeness.js`
and `src/utils/validate-articles.ts`) were removed in the April-2026
aggregator-pipeline purge. Stage-C gating now runs agent-side during Pass 2
review and at manifest-write time — see
[`02-analysis-protocol.md`](02-analysis-protocol.md) §9.

## 9 · No-Publish Rule

Do NOT publish an article when:

- Every feed returned empty/error AND no adopted texts exist
- Analysis contains only precomputed stats, zero feed-sourced data
- Article body would be entirely historical context with no news

Instead: ship analysis-only via the same single PR
([`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §3). The Stage-C
gate stamps `ANALYSIS_ONLY` in the manifest and the aggregator skips HTML
emission; the PR still lands the analysis artifacts for reviewer audit.

## 10 · Dashboard Rendering

If `monitor_legislative_pipeline` returns `health: 0%, throughput: 0`, that
means NO DATA, not "pipeline scored 0". Omit the dashboard panel from the
artifact or show "Data unavailable for this period". Any metric that equals
exactly 0 from an analytical tool should be verified against feed data
before rendering.

## 11 · Exit to Stage E (PR)

After `npm run generate-article` exits 0, read
[`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) and emit the PR
**exactly once**.
