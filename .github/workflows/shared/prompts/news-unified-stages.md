---
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Shared per-slug **Stages narrative** for the 14 unified `news-*.md` article
# workflows. Owns:
#
#   - 🗓️ Date Context + Stable Folder Resolution (MANDATORY first bash block)
#   - Stage B — Analysis (re-run merge rule, Pass 1, Pass 2, PREFLIGHT_ATTESTATION)
#   - Stage C — Completeness Gate (gate lines + elapsed-time tripwire callout)
#   - Stage D — Deterministic Article Render (`npm run generate-article`)
#   - Stage E — Single PR (SINGLE_PR_ATTESTATION + create_pull_request spec)
#   - ⏱️ MCP session lifetime callout
#   - 🚫 Never section
#
# These 7 sections were byte-identical (modulo the article-type slug literal)
# across all 14 article workflows — ~170+ duplicated lines per workflow,
# ~2,400 lines total. They now live here and are pulled into each workflow
# via `import-schema: slug` with `${{ github.aw.import-inputs.slug }}`
# interpolating the active slug into every reference (run id prefix, branch
# name, PR title, manifest articleType, file paths, banned-pattern callouts).
#
# Slug interpolation in markdown body text was verified to work on
# gh-aw v0.74.3 — see PR description "Phase 2 prototype" note for the
# test-compile output. The compiled `.lock.yml` shows the literal slug
# (e.g. `breaking`) byte-for-byte where the source uses
# `${{ github.aw.import-inputs.slug }}`.
#
# Slug-specific content that stays in the importing workflow body (NOT here):
#   - 🔖 Workflow Parameters table (data window + primary feeds vary by slug)
#   - 🎯 Article-Type Specifics bullets (per-slug intelligence requirements)
#   - ### Stage A — Data Collection body (per-slug bash extensions:
#     week-ahead's 4-day fan-out + forward-statements seed; news-motions'
#     urgency sweep; news-committee-reports' committee-document deep-fetch;
#     long-horizon scenario-forecast extras; etc.)
#
# Drift-guard: test/unit/agentic-workflows-threat-detection.test.js asserts
#   - every article workflow imports this file with a `with: slug:` value,
#   - no workflow body re-inlines STAGE_C_GATE / SINGLE_PR_ATTESTATION /
#     PREFLIGHT_ATTESTATION / the Date-Context bash block / the `## 🚫 Never`
#     header (those live exclusively here).

import-schema:
  slug:
    type: string
    required: true
    description: 'Article-type slug (e.g. "breaking", "motions", "week-ahead"). Substituted into run id, branch name, PR title, manifest articleType, news/* paths, and 🚫 Never bullets. Compile-time substitution — the slug value flows in through the with map of the calling workflow uses directive for shared/prompts/news-unified-stages.md.'
---

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="${{ github.aw.import-inputs.slug }}-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" ${{ github.aw.import-inputs.slug }})
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=${{ github.aw.import-inputs.slug }}"  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH`. Never
> hard-code a year.

> **⏱️ MCP session lifetime**: `engine.mcp.session-timeout` is
> NOT set — the gh-aw v0.71.3 compiler advertises the field but
> the bundled gateway image `ghcr.io/github/gh-aw-mcpg:v0.3.1`
> rejects it (`additionalProperties 'sessionTimeout' not
> allowed`, run #25275823699 fingerprint). The MCP gateway uses
> the upstream default session lifetime, and the gateway pings
> backends at the upstream default interval so
> EP / IMF / world-bank / memory sessions stay warm
> across the 60-min run. The Stage C exit tripwire still fires
> at the slug-specific elapsed-minute mark in
> `src/config/article-horizons.ts` so Stage D + E retain enough
> budget to land the single PR call by minute ≤ 45. See
> [`09-troubleshooting.md`](../../../prompts/09-troubleshooting.md) §5
> for run #24963129839 historical context.

### Stage B — Analysis (Ref: 02 §"Re-run improve/extend rule" — never no-op; see also [`02a-rerun-merge.md`](../../../prompts/02a-rerun-merge.md))

**If `${ANALYSIS_DIR}/manifest.json` already exists with non-empty `history[]`
from a prior run today, the re-run is *never* a no-op — apply the re-run
improve/extend rule from [`02a-rerun-merge.md`](../../../prompts/02a-rerun-merge.md):**

1. Always run `npm run prior-run-diff -- "${ANALYSIS_DIR}"` (always-on; the
   helper no longer reads `ENABLE_PRIOR_RUN_MERGE`). Persist the plan to
   `${ANALYSIS_DIR}/runs/prior-run-diff.json`. The plan classifies every
   prior artifact as a must-extend target (`carryForward[]`) with
   `priorLines` + `extendFloor` exposed, or a below-floor target
   (`rewrite[]`).
2. For every `carryForward[]` entry, **extend & deepen** the artifact —
   skip-writes are forbidden. Each must reach its `extendFloor`
   (`= max(threshold floor, priorLines + 20)`) AND add at least one of:
   a new section, ≥3 new evidence citations, or ≥1 new chart/diagram.
   Log one line per extended artifact:
   `[EXTEND-FROM-PRIOR: <relativePath> prior=<priorLines>L → new=<newLines>L (+<delta>)]`.
3. For every `rewrite[]` entry, write a stronger version (overwriting the
   prior file) sized to the catalog floor.
4. Append a new entry to `manifest.json.history[]` (written automatically
   by `runAnalysisStage` via `mergeManifestHistory`). On a re-run,
   `manifest.pass2.rewriteCount` MUST equal the total artifact count —
   `rewriteCount === 0` on a re-run is a Stage-C hard RED.

**Pass 1 (~60% of analysis time):** Apply every methodology and template
(`analysis/methodologies/` + `analysis/templates/`) to every downloaded
data file. Write every mandatory artifact. Populate `manifest.json` with
top-level `articleType: ${{ github.aw.import-inputs.slug }}` and every produced file under `files.*`.

**Pass 2 (~40% of analysis time):** Read every file you wrote, end to end.
Expand shallow sections, add evidence citations, add 🟢/🟡/🔴 confidence
labels, add cross-references. No `[AI_ANALYSIS_REQUIRED]` markers may
remain.

Emit before Stage C:

```
PREFLIGHT_ATTESTATION: read N/N artifacts from ${ANALYSIS_DIR} (LINES lines, FRAMEWORKS frameworks)
```

### Stage C — Completeness Gate (Ref: 03) — **BLOCKING**

Run `npm run validate-analysis "${ANALYSIS_DIR}"` — it compares every manifest-listed artifact against the thresholds cache (`runs/thresholds-cache.json`, written by `cache-analysis-thresholds.sh` at Stage B start), the artifact catalog, and the IMF/SEO rules in prompts 01, 03, and 04. Emit exactly one gate line:

```text
STAGE_C_GATE: GREEN articleType=${ARTICLE_TYPE_SLUG} artifacts=<N> lines=<L> imf=<pass|not_required>
STAGE_C_GATE: ANALYSIS_ONLY articleType=${ARTICLE_TYPE_SLUG} reason="<why no article render>"
STAGE_C_GATE: RED articleType=${ARTICLE_TYPE_SLUG} missing=<N> short=<N> placeholders=<N>
```

- **GREEN** → set `GATE_RESULT=GREEN` and proceed to Stage D.
- **RED (first)** → run Pass 3 on the named artifacts, re-run Stage C.
- **RED (second)** → set `GATE_RESULT=ANALYSIS_ONLY`, skip full article render, and ship analysis-only in the single PR.

> **⏱️ Elapsed-Time Tripwire**: At the top of every Stage C iteration,
> compute the elapsed minutes (mirror the safe two-step pattern from
> `news-translate.md` — no nested expansions):
>
> ```bash
> NOW_EPOCH=$(date -u +%s)
> ELAPSED_MIN=$(( (NOW_EPOCH - WORKFLOW_START_EPOCH) / 60 ))
> ```
>
> **Look up the slug-specific Stage C exit tripwire in
> `src/config/article-horizons.ts`** — short/mid prospective &
> retrospective slugs trip at **minute 36**, long-horizon
> prospective slugs at **minute 39**, long-horizon retrospective
> slugs at **minute 38**, electoral-overlay slugs at **minute 42**. **If `ELAPSED_MIN ≥ tripwire`, immediately
> set `GATE_RESULT=ANALYSIS_ONLY` — even if Stage C has just emitted
> GREEN.** Stage D + E need ≥ 4 min of budget before the PR-call
> deadline at minute ≤ 45. Emit the gate line as a single unbroken
> record (note the mandatory `articleType=` field — required by the
> contract above and by `scripts/validate-analysis-completeness.js`):
>
> ```text
> STAGE_C_GATE: ANALYSIS_ONLY articleType=${ARTICLE_TYPE_SLUG} reason="elapsed-time tripwire at minute ${ELAPSED_MIN}; reserve remaining budget for Stage D+E PR-call deadline"
> ```
>
> Then skip Pass 3 and **all** Stage D render attempts and proceed
> straight to Stage E. Shipping ANALYSIS_ONLY at the tripwire is
> strictly better than blowing the 60-min `timeout-minutes` cap.
> The MCP gateway uses upstream default session lifetime
> (`engine.mcp.session-timeout` is not set due to an upstream
> gh-aw v0.71.3 / gateway-v0.3.1 schema bug — see frontmatter
> comment); the workflow hard-caps at 60 minutes regardless. See [`09-troubleshooting.md`](../../../prompts/09-troubleshooting.md) §5
> for run #24963129839 (`session not found` at minute 29 under the
> old 45-min schedule) — historical context for the new design.

### Stage D — Deterministic Article Render (Refs: 04-article-generation + Article-Generation.md)

**Agents do not write article prose.** Stage D is a deterministic CLI
that aggregates the committed `analysis/**` artifacts into one canonical
markdown document, then renders it to localized HTML article(s).

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true


# Deterministic article rendering from the committed analysis artifacts.
#    Emits news/<TODAY>-${{ github.aw.import-inputs.slug }}.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-${{ github.aw.import-inputs.slug }}-en.html (rendered article). Always
#    regenerates article.md + HTML on every run (never no-op): the renderer
#    overwrites byte-for-byte from the freshly extended/rewritten Stage-B
#    analysis artifacts.
npm run generate-article -- --run "${ANALYSIS_DIR}"
```

The renderer is bounded to ≤ 2 min on a typical run. If the gate result is
`ANALYSIS_ONLY`, the renderer emits a short placeholder article documenting
the missing artifacts rather than a full prose article.

### Stage E — Single PR (Ref: 06)

Emit to stdout immediately before the single PR call:

```
SINGLE_PR_ATTESTATION: about to emit the only PR of this run at elapsed=<N>m with <X> analysis files + <Y> news files staged (gateResult=<GREEN|ANALYSIS_ONLY>)
```

Then invoke `safeoutputs___create_pull_request` **exactly once** with:

- `base: "main"`
- `head: "news/${TODAY}-${{ github.aw.import-inputs.slug }}-${RUN_ID}"`
- `title: "[news] ${{ github.aw.import-inputs.slug }} — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
- `body:` summarize the completeness-gate result, list produced
  analysis artifacts and emitted news files, diff vs. the prior same-day
  run if `manifest.json.history[].length > 1`. Cite every analysis file
  the rendered article consumed via the manifest. Do **not** author
  article prose in the PR body — that's the renderer's job.

> **Banned patterns**: see `06-pr-and-safe-outputs.md` §4. The repo CI
> lint (`scripts/lint-prompts.js`) fails the build if any banned
> pattern appears in this workflow. **Never** call the single-PR tool
> more than once per run.

## 🚫 Never

- Never invoke the single-PR tool more than once per run.
- Never author article prose — the deterministic renderer owns Stage D.
  Agent edits to `news/<date>-${{ github.aw.import-inputs.slug }}.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
