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

## 1 · Precondition

> **Do not start Stage D before Stage C exits 0.** If you are reading this
> before a green completeness gate, return to Stage B and run Pass 2 on the
> artifacts the validator flagged.

In the current **unified** `news-<type>.md` workflow (Stages A → B → C → D → E
in one session), Stage D runs inline after the Stage-C gate exits 0. The
agent has just written the full artifact set under
`${ANALYSIS_DIR}=analysis/daily/${DATE}/${TYPE}/` (canonical stable folder, no
`-run<NN>` suffix — repeated runs reuse the same folder and append to
`manifest.json.history[]` per `02 §2`) and the `manifest.json` has its latest
`history[]` entry stamped `GREEN`.

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
| **Stage-C review** (agent-side, Pass 2) | Depth floors, IMF economic-context presence, artifact citations, manifest schema | Render HTML; post-publish policing |

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

### 4.1 · Confidence Labels Are Horizon-Conditional

Every WEP-graded judgement in the article (and the analysis artifacts that
feed it) MUST use the floor band that matches the **dominant horizon of the
claim**, not the run's filing cadence. A `news-week-ahead` article uses the
`T+7d` band for next-plenary forecasts and the `T+EP-election ±6m` band for
any structural-break aside in the same body. A `news-month-in-review`
retrospective whose forward section reaches into the next Strasbourg cycle
uses the `T+30d` / `T+90d` bands accordingly.

- **Author-facing surface (style):** [`political-style-guide.md` §Confidence Labels Are Horizon-Conditional](../../analysis/methodologies/political-style-guide.md#confidence-labels-are-horizon-conditional) — read this when authoring Stage-B analysis artifacts and calibrating horizon-conditional probability judgements (Stage D itself does not author prose; Stage-B is where the WEP-graded sentences are written).
- **Canonical decay table (numbers):** [`forward-projection-methodology.md` §3 — WEP Decay Table](../../analysis/methodologies/forward-projection-methodology.md#3-wep-decay-table) — single source of truth for the floor bands per horizon.
- **Pass-2 calibration check (editorial):** if the committed analysis/article output does not contain at least one judgement at the horizon's floor band — i.e. every band is *Roughly even chance* / *About even* — the analyst has avoided commitment and must revise the artifacts during Pass 2 / Stage-C completeness review before the run can be stamped `GREEN`. This is an editorial review criterion, not a deterministic rule currently enforced by `scripts/validate-analysis-completeness.js`.

## 5 · Economic & Non-Economic Context

Articles with measurable policy impact MUST include **IMF economic context**
(GDP, inflation, unemployment, debt, deficit, trade, FDI, exchange rate,
monetary policy) as the primary anchor in
`intelligence/economic-context.md`. World Bank is retained for non-economic
domains only (health, education, social, environment, demographics, defence,
agriculture, innovation, governance).

**IMF is the required primary source for economic claims.** Enforcement is editorial and happens during Stage C completeness review.

Follow the indicator-mapping files:
[`imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md)
(macro / fiscal / trade / monetary + WEO forecasts + per-type indicator
minimums — mandatory primary source) and
[`worldbank-indicator-mapping.md`](../../analysis/methodologies/worldbank-indicator-mapping.md)
(non-economic domains). **Do not** pass WB aggregate codes
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

### 6.1 · The executive brief is the single source of truth

Every published HTML variant (`news/<slug>-<lang>.html`) inherits its
`<title>`, `<meta name="description">`, Open Graph / Twitter card copy,
JSON-LD `headline` / `description`, news-index card, RSS entry, and sitemap
record from the **same resolved per-language metadata pair**. That pair
**must** be derived from the run's `executive-brief.md` (and, when present,
its localized siblings `executive-brief_<lang>.md`) — not from generic
templates, not from artifact-category H1s, and not from Stage-B preamble
banners. The brief is what an editor reads to decide whether to publish; if
the SEO surfaces don't reflect the brief's BLUF + 60-Second Read + Top
Documents/Procedures ranking, the article fails the editorial intent of the
pipeline even when the validator passes it.

The brief template at
[`analysis/templates/executive-brief.md`](../../analysis/templates/executive-brief.md)
already contains the canonical authoring surface in
**`## 🌍 14-Language SEO Metadata Pack`** — a 14-row table
(`en, sv, da, no, fi, de, fr, es, nl, ar, he, ja, ko, zh`) where each row
holds a `Title candidate (≤70 chars)` and a
`Description candidate (150–160 chars)` for that language. **Fill this table
before Stage D.** Every cell must be a fluent localized phrase that reflects
the brief's #1 significance-ranked finding — not English copied verbatim,
not machine-style transliteration, not a date/type boilerplate string.

### 6.2 · Localized-brief priority ladder

When the [`news-translate`](../../.github/workflows/news-translate.md)
workflow has produced sibling `executive-brief_<lang>.md` files (see
[`executive-brief-translation-guide.md`](../../analysis/methodologies/executive-brief-translation-guide.md)),
those translated briefs become the **authoritative** localized source for
their language. The Stage-B agent therefore resolves the `<lang>`
title/description pair as follows, **before** writing the manifest:

| Priority | Source for `manifest.title.<lang>` / `manifest.description.<lang>` |
|:--:|---|
| 1 | `analysis/daily/<date>/<slug>/executive-brief_<lang>.md` — its translated `# H1` (cleaned, ≤70 chars) **and** the translated lede paragraph under `## 📰 60-Second Read` / `## 🎯 BLUF`, trimmed to 150–160 chars. This is fully localized prose written by the translator. |
| 2 | The `<lang>` row of the English `executive-brief.md` `## 🌍 14-Language SEO Metadata Pack` table — when the Stage-B author filled the row but no localized brief exists yet. |
| 3 | The English `en` row of the same table, used **verbatim** for the missing locale. Document this in `manifest.metadataFallback[<lang>] = "en"` so the static-site layer can render an editorial note ("Published in English while localized brief is pending."). |
| 4 | Aggregator resolver tiers 2–5 in `src/aggregator/article-metadata.ts` (artifact H1, lede paragraph, aggregated H1, strong prose, localized template) — these are the deterministic safety net the renderer applies when the manifest has no override for a language. They must never be the *intended* outcome for a published article; reaching them means the Stage-B contract was not honored. |

**Rule of thumb:** prefer the highest-priority source available *per
language*. A run may legitimately have full English + Swedish + German
localized briefs (priority 1) while Finnish and Korean still resolve to
priority 2 or 3 — that asymmetry is acceptable. What is **not** acceptable
is leaving any locale on priority 4 when the brief carries the editorial
highlight that should have driven that locale's headline.

### 6.3 · Content rule: always context-based on brief highlights

Every title and every description **must** be derived from one of these
brief sections (verbatim phrases are not required; faithful summarization
is):

- `## 🎯 BLUF (Bottom Line Up Front)` — the journalist's headline judgement.
  Used as the **title backbone**: the named actor (committee, political
  group, MEP, institution) plus the concrete action plus the political
  consequence.
- `## 📰 60-Second Read` — the bullet that earned 🔴 / 🟠 priority. Used as
  the **description backbone**: one policy consequence + one named
  stakeholder impact.
- `## 🗂️ Top Documents / Procedures Table` — the rank-1 procedure / adopted
  text ID. Preserved verbatim in titles when it carries semantic load
  (e.g. `TA-10-2026-0096`, `2024/0001(COD)`).
- `## ⚠️ Risk & Threat Snapshot` and `## 🔮 Top Forward Trigger` — used to
  sharpen the description's "why it matters" angle, especially for
  forward-looking horizons (week-ahead, month-ahead, year-ahead,
  term-outlook).

Titles or descriptions that do not trace to one of these sections **fail
the editorial contract** and must be rewritten during Pass 2.

### 6.4 · Manifest authoring (Stage-B output)

After section 6.2 has chosen the right source per language, copy the
resolved pairs into `manifest.json` alongside `articleType` + `files`. This
is only metadata, not full article-body translation:

   ```jsonc
   {
     "articleType": "breaking",
     "title": {
       "en": "Banking Union Deal Tests EPP–S&D Discipline",
       "sv": "Bankunionsuppgörelse prövar EPP–S&D-disciplin",
       "da": "Bankunionsaftale tester EPP–S&D-disciplin",
       "no": "Bankunion-avtale tester EPP–S&D-disiplin",
       "fi": "Pankkiunionisopu testaa EPP–S&D-kuria",
       "de": "Bankenunion-Deal prüft EPP–S&D-Disziplin",
       "fr": "L’accord sur l’union bancaire teste EPP–S&D",
       "es": "El pacto de unión bancaria prueba al EPP–S&D",
       "nl": "Bankunieakkoord test EPP–S&D-discipline",
       "ar": "اتفاق الاتحاد المصرفي يختبر انضباط EPP وS&D",
       "he": "עסקת איחוד הבנקים בוחנת משמעת EPP–S&D",
       "ja": "銀行同盟合意がEPP・S&D規律を試す",
       "ko": "은행동맹 합의가 EPP–S&D 규율을 시험",
       "zh": "银行联盟协议考验EPP与S&D纪律"
     },
     "description": {
       "en": "Parliament’s banking-union compromise narrows supervision deadlines while exposing coalition pressure on EPP, S&D and Renew before the next plenary vote.",
       "sv": "Parlamentets bankunionskompromiss skärper tillsynsfrister och visar koalitionstryck på EPP, S&D och Renew inför nästa plenarröstning.",
       "da": "Parlamentets bankunionskompromis skærper tilsynsfrister og viser koalitionstryk på EPP, S&D og Renew før næste plenaraftemning.",
       "no": "Parlamentets bankunion-kompromiss skjerper tilsynsfrister og viser koalisjonspress på EPP, S&D og Renew før neste plenaravstemning.",
       "fi": "Parlamentin pankkiunionikompromissi kiristää valvontamääräaikoja ja paljastaa EPP:n, S&D:n ja Renew’n koalitiopaineen.",
       "de": "Der Bankenunion-Kompromiss verschärft Aufsichtsfristen und zeigt Koalitionsdruck auf EPP, S&D und Renew vor der nächsten Plenarabstimmung.",
       "fr": "Le compromis sur l’union bancaire resserre les délais de supervision et expose la pression sur EPP, S&D et Renew avant le prochain vote.",
       "es": "El compromiso sobre unión bancaria estrecha plazos de supervisión y expone presión sobre EPP, S&D y Renew antes del próximo voto plenario.",
       "nl": "Het bankuniecompromis verkort toezichtstermijnen en toont coalitiedruk op EPP, S&D en Renew vóór de volgende plenaire stemming.",
       "ar": "يضيق حلّ الاتحاد المصرفي مهل الرقابة ويكشف ضغط الائتلاف على EPP وS&D وRenew قبل التصويت العام المقبل.",
       "he": "פשרת איחוד הבנקים מצמצמת מועדי פיקוח וחושפת לחץ קואליציוני על EPP, S&D ו-Renew לפני ההצבעה הבאה.",
       "ja": "銀行同盟の妥協は監督期限を絞り、次回本会議投票前のEPP、S&D、Renewへの連立圧力を示す。",
       "ko": "은행동맹 절충안은 감독 기한을 좁히고 다음 본회의 표결 전 EPP, S&D, Renew의 연정 압박을 드러낸다.",
       "zh": "银行联盟折中方案压缩监管期限，并在下次全会投票前暴露EPP、S&D和Renew的联盟压力。"
     },
     "searchIntentTerms": ["banking union", "EPP", "S&D", "Renew", "plenary vote"],
     "files": { /* … */ }
   }
   ```

   Both fields still accept a string as an emergency degraded fallback, but
   the standard output is a complete object with exactly these 14 keys:
   `en`, `sv`, `da`, `no`, `fi`, `de`, `fr`, `es`, `nl`, `ar`, `he`, `ja`,
   `ko`, `zh`. Missing languages transparently fall through to the
   aggregator's deterministic resolver tiers, **but do not omit a language
   merely to save time**: a Stage-B run that has access to the English
   brief (always) and one or more localized briefs (when `news-translate`
   has run for this `<date>/<slug>`) has everything it needs to fill every
   key for those languages.

### 6.5 · Aggregator deterministic resolver (safety net)

The aggregator's resolver in `src/aggregator/article-metadata.ts` walks
the following tiers per language, in order, and stops at the first hit:

1. **Manifest override** — `manifest.title.<lang>` / `manifest.description.<lang>` (authored in § 6.4).
2. **First editorial-artefact H1** — promoted from the first non-generic `# …` heading by walking the manifest's file list in canonical order. `executive-brief.md` and `extended/executive-brief.md` come **before** `intelligence/synthesis-summary.md` in this list precisely so the brief's headline wins over Stage-B preamble.
3. **Editorial lede paragraph** — first qualifying prose paragraph under a `## 🎯 BLUF` / `## 📰 60-Second Read` / `## TL;DR` / `## Executive Summary` heading inside the editorial artefact, stripped of all-caps BLUF labels (`SITUATION:`, `BOTTOM LINE:`, `BLUF:`, …).
4. **Aggregated-markdown H1 / first strong prose paragraph** — last-resort scan with a tightened leak filter that blocks mermaid `%%{init}` blocks, `title …` directives, emoji-banner metadata, and `Analysis Date:` / `Classification:` / `Run:` / `Window:` / `Purpose:` / `BLUF (ICD-203):` / `Composition layer:` rows.
5. **Localized template** — last-resort `*_TITLES(date)` fallback from `src/constants/language-articles.ts`. Reaching this tier for an article that actually shipped means the Stage-B contract above was not honored; treat any production article with a tier-5 title/description as an editorial defect.

**Localized-brief resolver behavior (planned).** Tier 2 currently walks
`executive-brief.md` for **all** languages. When tier 1 falls through for a
language `<lang>` and `executive-brief_<lang>.md` exists in the run
directory, the resolver should prefer that file's translated H1 / lede over
the English brief's H1 / lede for that language only. Until that resolver
extension lands, the Stage-B agent achieves the same effect explicitly by
copying the localized brief's translated headline and lede into
`manifest.title.<lang>` / `manifest.description.<lang>` per § 6.2 priority 1.

### 6.6 · Required qualities of every (title, description) pair

Required qualities for **every** locale (English and every translated
locale, regardless of which priority tier produced the pair):

- active voice, ≤ 70 chars, names the actor / institution / legislative file
- never contains raw metrics, article-type labels, or date-centric
  formats like `EU Parliament Breaking — 2026-04-14`
- never repeats the lede verbatim in the description — `description`
  must complement `title`, not echo it
- description target: 150–160 characters, one policy consequence, one named
  stakeholder impact, no markdown, no citation brackets, no unsupported
  probability claim
- each locale gets its own fluent title/description pair; do not use one
  shared English string, literal machine-looking translation, or generic
  type/date boilerplate across variants
- preserve procedure IDs (`TA-10-2026-0096`, `2024/0001(COD)`),
  committee acronyms (`ECON`, `LIBE`, `ENVI`), political-group acronyms
  (`EPP`, `S&D`, `Renew`, `ID`, `ECR`, `Greens/EFA`, `The Left`), and named
  institutions; translate the reader-facing framing around them
- this is not full article translation — generate only title, description
  and optional `searchIntentTerms`
- search intent: ensure the title or first two headings contain the natural
  language terms citizens would search for (committee acronym, procedure title,
  policy area, and one named institution) without keyword stuffing
- never leaks `Run:`, `Purpose:`, `BLUF`, or `Composition layer` prefixes
  (these are filtered out of fallback tiers, but a manual override with
  one of these prefixes would be used verbatim)

When you DO NOT write a manifest override, make sure the first heading
of `executive-brief.md` (and the `# H1` of every translated
`executive-brief_<lang>.md` that exists for this run) meets the same
rules, because the Tier-2 fallback will promote that heading into the
`<title>`. **Generic artifact-category H1s such as
`# Executive Brief — Breaking News (2026-05-15)` are filtered out by
`isGenericHeading` and will fall through to the next tier** — author a
real editorial headline instead.

**SEO self-check before Stage D:**

| Check | Pass condition |
|---|---|
| Specificity | Title names an EP actor, committee, procedure, vote, or policy file. |
| Brief alignment | Title traces to the brief's `## 🎯 BLUF`; description traces to the brief's `## 📰 60-Second Read` or `## 🔮 Top Forward Trigger`. |
| Click value | Description explains why the development matters politically, not merely that it occurred. |
| Evidence hygiene | Title/description only use facts already present in `executive-brief.md` (or the relevant `executive-brief_<lang>.md`) — i.e. its BLUF, 60-Second Read, Top Documents/Procedures table, or Risk & Threat Snapshot. |
| IMF relevance | If the article has economic stakes, description alludes to the economic pressure only when `economic-context.md` cites IMF evidence. |
| Locale safety | `manifest.title` and `manifest.description` contain all 14 language keys; non-English fields are fluent localized metadata, not English boilerplate. |
| Translated-brief honored | For every `<lang>` where `executive-brief_<lang>.md` exists in the run directory, the manifest value for `<lang>` reflects the **translated** brief's headline and lede, not the English brief's row. |
| Fallback transparency | For every `<lang>` where no localized brief exists AND the English brief's `<lang>` row is empty, the manifest is filled from the English `en` row and `manifest.metadataFallback[<lang>] = "en"` is set. |

The aggregator does not invent SEO copy. If the manifest, the executive
brief, and the first synthesis H1 are all generic, the published
`<title>`, Open Graph headline, Twitter card, JSON-LD headline, indexes,
RSS, and sitemap-derived metadata will be generic too. The brief is what
fixes that — fill it, then mirror it into the manifest.

## 7 · Analysis-to-Article Artifact Map (authoritative)

Every analysis artifact referenced in `manifest.files.*` is walked by the
aggregator in canonical order (`src/aggregator/artifact-order.ts`) and
rendered into the final HTML. The article's section-to-artifact mapping
is therefore the same as the canonical artifact order — there is no
separate "article structure" to maintain.

The article begins with a generated **Reader Intelligence Guide** and then the
root-level `executive-brief.md` (or legacy `extended/executive-brief.md`
fallback). This mirrors the Riksdagsmonitor pattern: readers see BLUF,
decisions, 60-second read, risk snapshot, and top forward trigger before the
longer synthesis and audit appendices.

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
| Economic context block | `intelligence/economic-context.md` | `analysis/methodologies/imf-indicator-mapping.md` (primary), `analysis/methodologies/worldbank-indicator-mapping.md` (non-economic), `analysis/imf/forecast-accuracy-baseline.md` |
| Threat-model callout | `intelligence/threat-model.md` OR `intelligence/political-threat-landscape.md` | `threat-assessment/actor-threat-profiles.md` |
| Voting-pattern chart | `existing/voting-patterns.md` | `intelligence/coalition-dynamics.md` |
| Cross-session continuity | `existing/cross-session-intelligence.md`, `existing/cross-run-diff.md` | `existing/session-baseline.md` |
| **Carried-forward forward statements** (week/month-ahead) | `intelligence/synthesis-summary.md` §"Carried-forward forward statements" | `data/forward-statements-open.json` (registry seed) |
| **Forward projection** (all prospective ≥7d: week-ahead, month-ahead, quarter-ahead+) | `intelligence/forward-projection.md` | `intelligence/scenario-forecast.md`, `extended/forward-indicators.md` |
| **Pipeline & calendar** (≥90-day horizons) | `intelligence/legislative-pipeline-forecast.md`, `intelligence/parliamentary-calendar-projection.md` | `intelligence/forward-projection.md` |
| **Presidency & Commission context** (year-ahead, term-outlook, election-cycle) | `intelligence/presidency-trio-context.md`, `intelligence/commission-wp-alignment.md` | `intelligence/pestle-analysis.md` |
| **Term arc & mandate scorecard** (electoral-overlay) | `intelligence/term-arc.md`, `intelligence/mandate-fulfilment-scorecard.md` | `intelligence/historical-baseline.md`, `existing/voting-patterns.md` |
| **Seat projection** (electoral-overlay) | `intelligence/seat-projection.md` | `intelligence/coalition-dynamics.md`, `intelligence/scenario-forecast.md` |
| Transparency footer | all `manifest.files.*` entries (linked by the aggregator) | `intelligence/analysis-index.md` |

### 7.1 · Forward-Statements Registry Contract (week-ahead / month-ahead)

For `week-ahead` and `month-ahead` article types, the synthesis artifact
**must** cite the registry. The Stage-C gate enforces this when open items
exist in `data/forward-statements-open.json`:

1. **Read-before-write (mandatory):** Every Stage-B analysis pass must read
   `data/forward-statements-open.json` before writing
   `intelligence/synthesis-summary.md`. Do not author the synthesis without
   first surfacing open forward statements.

2. **"Carried-forward forward statements" section (mandatory when non-empty):**
   `intelligence/synthesis-summary.md` must contain a section whose heading
   contains `Carried-forward forward statements` when
   `data/forward-statements-open.json` is non-empty. The canonical template
   heading is `## 🔁 Carried-Forward Forward Statements (week-ahead /
   month-ahead only)`. Omission causes Stage C to emit RED.

3. **Per-item status update:** For each open item, assign an explicit status
   (`✅ IMPLEMENTED`, `🔄 SUPERSEDED`, `⏳ OPEN (carried)`, or
   `🔴 ABANDONED`) with an evidence reference or an explanation of absence.

4. **Registry update at end of Stage B:**
   ```bash
   # Mark items whose horizon has passed without evidence as abandoned:
   # (use updateEntry from scripts/aggregator/forward-statements-registry.js)
   node scripts/aggregator/forward-statements-registry.js update \
     --id <id> --status <new-status> [--evidence <ref>] \
     --date "$(date -u +%Y-%m-%d)"
   ```

5. **Append new forward statements to the registry at end of Stage B:**
   New predictions generated by this run must be appended to the registry
   so they are available to the next week-ahead / month-ahead run.

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

The legacy in-aggregator validators (`scripts/utils/validate-analysis-completeness.js`
and `src/utils/validate-articles.ts`) were removed in the April-2026
aggregator-pipeline purge. Stage-C gating is now performed by the standalone
validator at [`scripts/validate-analysis-completeness.js`](../../scripts/validate-analysis-completeness.js)
invoked as `npm run validate-analysis -- <runDir>` (see
[`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) §1)
plus the agent-side Pass 2 readback, both running over the committed
`analysis/daily/<run>/**/*.md` set before any Stage-D render.

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
