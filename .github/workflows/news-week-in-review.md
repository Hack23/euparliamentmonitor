---
name: "News: EU Parliament Week in Review — Unified"
description: Generates a single PR containing analysis artifacts and the rendered week-in-review article (Stages A → B → C → D → E in one workflow).
strict: false
on:
  schedule:
    - cron: "0 9 * * 6"  # Saturdays around 09:00 UTC
  workflow_dispatch:
    inputs:
      force_generation:
        description: Force generation even if recent analysis exists
        type: boolean
        required: false
        default: true

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  discussions: read
  security-events: read

# Hard safety cap. Two distinct deadlines drive this workflow's schedule:
#
#   1. **Stage C exit deadline = minute 22 elapsed.** This is the latest
#      point at which Stage C must hand off to Stage D (or skip Stage D
#      and jump to Stage E). The minute-22 elapsed-time tripwire in the
#      prompt body enforces this regardless of GREEN/RED — even a freshly
#      GREEN gate at minute 22 must fall through to ANALYSIS_ONLY so
#      Stage D + E still have reserved time before the PR-call deadline.
#      Local stage ceilings (A ≤ 4, B 12–15, C ≤ 3) sum to 22 — the
#      tripwire backstops any per-stage overrun.
#
#   2. **safe-outputs PR-call deadline = minute ≤ 25 (target ≤ 22).**
#      This is the deadline for the single safe-outputs
#      `create_pull_request` call. Stage D ≤ 2 min and Stage E ≤ 1–2 min
#      must fit between the Stage C exit (≤ minute 22) and this deadline.
#
# Sized for the ~28–30 min safeoutputs MCP session TTL: agent must call
# create_pull_request by minute ≤ 25 (target ≤ 22), leaving ~20 min of
# headroom for npm setup, render, and git push under the 45-min cap.
# Tightened from the previous 25 / ≤28 split after run #24963129839
# (news-week-in-review): Stage B suffered two context compactions, the
# tripwire fired at minute 28, and the safe-outputs PR call landed at
# minute 29 → `session not found` HTTP 404 → zero safe outputs. The
# unified 22 / ≤25 budget mirrors the proven fix already in place for
# news-month-in-review (#1444) and news-month-ahead (#24957585804).
timeout-minutes: 45

features:
  mcp-gateway: true

sandbox:
  agent: awf
  mcp:
    port: 8080
    # `keepalive-interval` (seconds) for HTTP MCP backends — see upstream
    # reference/mcp-gateway.md §4.1.3.5. Gateway default is 1500 (25 min);
    # we override to 300 so the gateway pings each backend (european-parliament,
    # world-bank, memory, sequential-thinking) every 5 minutes. This keeps
    # backend HTTP sessions warm during the 45-minute Stage B/C/D window
    # without triggering EP-side rate limits. Setting to -1 would disable
    # pings; 0/unset would silently default to 1500 — both unsafe for
    # long-running news runs that can idle on MCP for 10+ minutes during
    # Stage B Pass 2 prose review.
    keepalive-interval: 300

imports:
  - .github/agents/news-generation.agent.md
  - shared/mcp/news-mcp-servers.md

concurrency:
  group: "news-week-in-review"
  cancel-in-progress: false

runtimes:
  node:
    version: "25"

# Network allowlist — uses ecosystem identifiers where possible (per
# upstream docs/reference/network.md §"Ecosystem Identifiers"):
#   - `defaults` — basic infrastructure (certs, JSON schema, package mirrors)
#   - `github`   — all GitHub domains (replaces explicit github.com/api.github.com)
#   - `node`     — npm/npx ecosystem (needed for MCP server boot via npx)
# Plus EP/IMF/WB data sources and Hack23 publication targets as explicit domains.
network:
  allowed:
    - defaults
    - github
    - node
    - data.europarl.europa.eu
    - dataservices.imf.org
    - api.worldbank.org
    - "*.europa.eu"
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com

# Tools — all available read/edit/web/memory tools the agent needs for a
# resilient 45-min news-generation session. See upstream reference/tools.md
# and reference/github-tools.md.
tools:
  timeout: 300            # per-tool-call cap (bash, MCP, github, edit, web-fetch)
  startup-timeout: 90     # MCP server boot (npx package install) — covers
                          # european-parliament/world-bank/memory/sequential-thinking
  github:
    # `all` enables every read toolset EXCEPT `dependabot` (per upstream
    # docs — `dependabot` requires `vulnerability-alerts: read` which we
    # do not grant; news workflows do not need supply-chain alerts).
    toolsets:
      - all
  bash: true              # AWF-sandboxed shell — required for Stage A/D scripts
  edit:                   # explicit file-edit tool (analysis artifact authoring)
  web-fetch:              # fallback fetch for EP/IMF/WB pages when MCP miss
  agentic-workflows: true # workflow introspection (audit/log analysis)
  # Cache memory — restores partial analysis & data fetched in prior runs
  # so a failed safe-outputs PR call does not lose Stage A/B work. Per
  # upstream reference/cache-memory.md, the compiler auto-injects restore
  # and save steps using a workflow-scoped key.
  cache-memory:
    key: news-week-in-review-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".jsonl", ".txt", ".html"]
  repo-memory:
    branch-name: memory/news-generation
    allowed-extensions: [".md", ".json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200

safe-outputs:
  # Week-in-review analysis artifacts can exceed the 1024 KB default patch
  # limit; run 24961736954 produced a legitimate 5205 KB analysis-only patch.
  max-patch-size: 10240
  allowed-domains:
    - github                         # ecosystem: github.com + api.github.com (least-privilege; PR creation only)
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:week-in-review"]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
    max: 1
    # Resilience knobs (per upstream reference/safe-outputs-pull-requests.md):
    if-no-changes: warn              # noop runs warn instead of erroring
    fallback-as-issue: true          # if PR creation blocked, open issue link
    auto-close-issue: false          # not issue-triggered — never auto-close
    excluded-files:                  # never commit auto-generated artifacts
      - "**/*.lock"
      - "node_modules/**"
      - ".github/workflows/*.lock.yml"
  dispatch-workflow:
    workflows: [news-translate]
    max: 1

steps:
  - name: Setup Node.js
    uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6.3.0
    with:
      node-version: '25'

  - name: Install dependencies
    run: |
      npm ci --prefer-offline --no-audit

  - name: Build TypeScript
    run: |
      npm run build

  - name: Copy mermaid + chart vendor assets
    run: |
      npm run copy-vendor



jobs:
  pat-pr-fallback:
    name: Host-side PAT PR fallback
    needs: [agent]
    if: always() && needs.agent.result != 'skipped'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          ref: ${{ github.base_ref || github.event.pull_request.base.ref || github.ref_name || github.event.repository.default_branch }}
          token: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          persist-credentials: false
          fetch-depth: 1

      - name: Download agent artifact
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: agent
          path: /tmp/gh-aw/

      - name: Run host-side PAT PR fallback
        env:
          GH_TOKEN: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_PR_FALLBACK_TOKEN: ${{ secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
          GH_AW_PAT_FALLBACK_SLUG: week-in-review
          GH_AW_PAT_FALLBACK_WORKFLOW_NAME: "News: EU Parliament Week in Review — Unified"
          GH_AW_PAT_FALLBACK_RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: bash scripts/gh-aw-pat-pr-fallback.sh

engine:
  id: copilot
  model: claude-opus-4.7
  # max-continuations: 1 tells gh-aw NOT to enable autopilot mode — when this
  # equals 1 the compiler omits --autopilot from the Copilot CLI invocation so
  # the agent runs exactly once with no restarts.  Within-session runaway
  # protection is provided by tools.timeout (per-call cap) + timeout-minutes.
  max-continuations: 1
---
# 📰 EU Parliament Week in Review — Unified Workflow

You are the **Analysis Agent** for EU Parliament Monitor. This workflow runs
**Stages A → B → C → D → E** in a single agent session and ships **one PR**
containing both the analysis artifacts and the rendered article(s) for
this article type. There is no paired article workflow — Stage D is a
deterministic CLI invocation (`npm run generate-article`), not an agent
prose pass.

## 📚 Required Reading (read in this order, once per run)

1. [`.github/prompts/00-scope-and-ground-rules.md`](../prompts/00-scope-and-ground-rules.md) — workspace scope, forbidden/allowed edits, neutrality, **agent never writes article prose**
2. [`.github/prompts/08-infrastructure.md`](../prompts/08-infrastructure.md) — frontmatter, MCP gateway, stable folder layout, `--analysis-only` flag, `npm run generate-article`
3. [`.github/prompts/01-data-collection.md`](../prompts/01-data-collection.md) — Stage A
4. [`.github/prompts/07-mcp-reference.md`](../prompts/07-mcp-reference.md) — canonical tool tables
5. [`.github/prompts/02-analysis-protocol.md`](../prompts/02-analysis-protocol.md) — Stage B (2 passes; §2 re-run merge rule; §3 time budgets)
6. [`.github/prompts/03-analysis-completeness-gate.md`](../prompts/03-analysis-completeness-gate.md) — Stage C (blocking); §6b resuming a same-day folder
7. [`.github/prompts/04-article-generation.md`](../prompts/04-article-generation.md) — Stage D (deterministic CLI; metadata/SEO contract; agents do not author prose)
8. [`.github/prompts/05-analysis-to-article-contract.md`](../prompts/05-analysis-to-article-contract.md) — artifact-to-article contract and read-before-render duties
9. [`Article-Generation.md`](../../Article-Generation.md) — end-to-end article pipeline reference, UI/UX export contract, and `article.md` provenance
10. [`.github/prompts/06-pr-and-safe-outputs.md`](../prompts/06-pr-and-safe-outputs.md) — **single-PR rule**, unified-workflow PR contract
11. On error → [`.github/prompts/09-troubleshooting.md`](../prompts/09-troubleshooting.md)

## 🔖 Workflow Parameters

| Parameter | Value |
|-----------|-------|
| `ARTICLE_TYPE_SLUG` | `week-in-review` |
| Family | **Unified** (Stages A → B → C → D → E in one workflow) |
| Data window | last 7 days |
| Primary feeds | `get_adopted_texts_feed`, `get_events_feed`, `get_procedures_feed` with `timeframe: "one-week"`. |
| Stage A budget | ≤ 4 min |
| Stage B budget (2 passes) | **12–15 min — HARD CEILING** (do **not** exceed 15 min on Stage B even if Pass 2 still has shallow sections; force `GATE_RESULT=ANALYSIS_ONLY` instead) |
| Stage C budget (gate + optional Pass 3) | ≤ 3 min |
| Stage D budget | ≤ 2 min (deterministic) |
| Stage E budget (commit + single PR) | ≤ 1–2 min |
| **Stage C exit tripwire** | **minute 22 elapsed** — the **decision threshold** for forcing `GATE_RESULT=ANALYSIS_ONLY` and (if late) skipping Stage D so the run can still reach the PR call. Stages A → C local ceilings (4 + 15 + 3) sum to 22; the tripwire backstops any per-stage overrun. **Note:** 22 min is *not* the sum of Stages A → E — D + E run *after* this tripwire, between minute 22 and the PR-call deadline. |
| **Hard PR-call deadline** | **minute ≤ 25 elapsed** (target ≤ 22) — deadline for the single safe-outputs `create_pull_request` call. After this, the safeoutputs MCP HTTP session is at risk of being reaped (run #24963129839 lost the PR call at minute 29). |
| Hard safety cap | 45-min `timeout-minutes` |
| PR rule | **Exactly one** `[news]` PR at end of run |

> **⚠️ safeoutputs Session TTL**: The safeoutputs MCP HTTP session on
> `localhost:3001` has been observed to fail after roughly **28–30
> minutes** with no safeoutputs tool calls (agent activity on other
> tools does **not** refresh it). The schedule has **two distinct
> deadlines**:
>
> - **Stage C exit by minute ≤ 22** (Stage A ≤ 4 + Stage B 12–15 +
>   Stage C ≤ 3 = 22 min ceiling) — backstopped by the elapsed-time
>   tripwire below.
> - **Single PR call by minute ≤ 25** (Stage D ≤ 2 + Stage E ≤ 1–2 =
>   ~3 min after the Stage C exit) — well below the ~28–30 min
>   safeoutputs session TTL window that bit run #24963129839.
>
> As soon as Stage C exits (GREEN, RED-second-failure, or tripwire
> ANALYSIS_ONLY), run Stage D (`npm run generate-article`) and Stage E
> immediately and call the single PR without delay. **At minute 22,
> the elapsed-time tripwire fires unconditionally — even a freshly
> GREEN gate at minute 22 must fall through to ANALYSIS_ONLY so Stage
> D + E retain the budget needed to land the PR call by minute ≤ 25.
> Losing the article render is acceptable; losing the entire run to
> TTL is not.** See [`09-troubleshooting.md`](../prompts/09-troubleshooting.md) §5.

## 🎯 Article-Type Specifics

- Cross-reference prior week-ahead predictions — confirm or refute forward statements.
- Include `intelligence/historical-baseline.md` + `risk-scoring/risk-matrix.md` in the analysis set.

## 🗓️ Date Context + Stable Folder Resolution (MANDATORY — first bash block)

```bash
TODAY=$(date -u +%Y-%m-%d)
LAST_WEEK=$(date -u -d '7 days ago' +%Y-%m-%d)
LAST_MONTH=$(date -u -d '30 days ago' +%Y-%m-%d)
RUN_EPOCH=$(date -u +%s)
RUN_ID="week-in-review-run$$-$RUN_EPOCH"
# Canonical stable folder — no -run<NN> suffix. Repeated runs on the same
# date share this dir and append to manifest.json.history[].
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" week-in-review)
WORKFLOW_START_EPOCH=$RUN_EPOCH
echo "ARTICLE_TYPE_SLUG=week-in-review"                  >> "$GITHUB_ENV"
echo "TODAY=$TODAY"                               >> "$GITHUB_ENV"
echo "RUN_ID=$RUN_ID"                             >> "$GITHUB_ENV"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"                 >> "$GITHUB_ENV"
echo "WORKFLOW_START_EPOCH=$WORKFLOW_START_EPOCH" >> "$GITHUB_ENV"
```

> **⚠️ DATE GUARD**: When passing `dateFrom`/`dateTo` to any MCP tool,
> always derive dates from `$TODAY` / `$LAST_WEEK` / `$LAST_MONTH`. Never
> hard-code a year.

## 🔁 Stage Order (absolute)

```
Stage A · Data Collection (≤ 4 min — minute 0–4)
  → Stage B · Analysis (Pass 1 + Pass 2, 12–15 min HARD CEILING — minute 4–19)
    → Stage C · Completeness Gate (agent-side readback, ≤ 3 min — minute 19–22) — BLOCKING; minute-22 elapsed-time tripwire forces ANALYSIS_ONLY
      → Stage D · Article Render (npm run generate-article — deterministic, ≤ 2 min — minute 22–24)
        → Stage E · Single PR (≤ 1–2 min — minute ≤ 25; exactly once)
```

### Stage A — Data Collection (Ref: 01, 07)

Run the canonical gateway block from `08-infrastructure.md` §4. Source
`scripts/mcp-setup.sh`, then `scripts/wb-mcp-probe.sh` and
`scripts/imf-mcp-probe.sh`. Collect EP feed data first; fall back to
direct endpoints on failure. Deep-fetch up to 10 procedures / voting
records / meeting decisions into `${ANALYSIS_DIR}/data/`. Target ≤ 4 min.

### Stage B — Analysis (Ref: 02 §2 re-run merge rule)

**If `${ANALYSIS_DIR}/manifest.json` already exists from a prior run today,
do NOT rewrite it — apply the re-run merge rule from `02-analysis-protocol.md`
§2:**

1. Load prior `manifest.json` and inspect every artifact's line count vs.
   `reference-quality-thresholds.json` floor.
2. Carry forward at/above-floor artifacts unless new Stage-A data changes
   their conclusions.
3. Rewrite below-floor or missing artifacts with Pass 1 + Pass 2 output.
4. Append a new entry to `manifest.json.history[]` (written automatically
   by `runAnalysisStage` via `mergeManifestHistory`).

**Pass 1 (~60% of analysis time):** Apply every methodology and template
(`analysis/methodologies/` + `analysis/templates/`) to every downloaded
data file. Write every mandatory artifact. Populate `manifest.json` with
top-level `articleType: week-in-review` and every produced file under `files.*`.

**Pass 2 (~40% of analysis time):** Read every file you wrote, end to end.
Expand shallow sections, add evidence citations, add 🟢/🟡/🔴 confidence
labels, add cross-references. No `[AI_ANALYSIS_REQUIRED]` markers may
remain.

Emit before Stage C:

```
PREFLIGHT_ATTESTATION: read N/N artifacts from ${ANALYSIS_DIR} (LINES lines, FRAMEWORKS frameworks)
```

### Stage C — Completeness Gate (Ref: 03) — **BLOCKING**

Read every manifest-listed artifact and compare it with `reference-quality-thresholds.json`, the artifact catalog, and the IMF/SEO rules in prompts 01, 03, and 04. Emit exactly one gate line:

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
> **If `ELAPSED_MIN >= 22`, immediately set `GATE_RESULT=ANALYSIS_ONLY`
> — even if Stage C has just emitted GREEN.** Minute 22 is the latest
> safe Stage C exit because Stage D + E still need ~3 min of budget
> before the PR-call deadline at minute ≤ 25; honoring a late GREEN
> would push the PR call past the safeoutputs session TTL. Emit the
> gate line as a single unbroken record (note the mandatory
> `articleType=` field — required by the contract above and by
> `scripts/validate-analysis-completeness.js`):
>
> ```text
> STAGE_C_GATE: ANALYSIS_ONLY articleType=${ARTICLE_TYPE_SLUG} reason="elapsed-time tripwire at minute ${ELAPSED_MIN}; reserve remaining budget for Stage D+E PR-call deadline"
> ```
>
> Then skip Pass 3 and **all** Stage D render attempts and proceed
> straight to Stage E. Shipping ANALYSIS_ONLY at minute 22 is strictly
> better than losing the whole run to the safeoutputs session TTL —
> see #1444, run #24957585804, and run #24963129839 (the trigger for
> this tighter budget) for the failure mode this backstop prevents.

### Stage D — Deterministic Article Render (Refs: 04-article-generation + Article-Generation.md)

**Agents do not write article prose.** Stage D is a deterministic CLI
that aggregates the committed `analysis/**` artifacts into one canonical
markdown document, then renders it to localized HTML article(s).

```bash
source scripts/mcp-setup.sh
export USE_EP_MCP=true


# Deterministic article rendering from the committed analysis artifacts.
#    Emits news/<TODAY>-week-in-review.en.md (canonical aggregated markdown) plus
#    news/<TODAY>-week-in-review-en.html (rendered article). Idempotent — skips
#    writes when target mtime ≥ all source artifacts.
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
- `head: "news/${TODAY}-week-in-review-${RUN_ID}"`
- `title: "[news] week-in-review — ${TODAY} (run ${RUN_ID})"` *(append `(analysis-only)` suffix when `GATE_RESULT=ANALYSIS_ONLY`)*
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
  Agent edits to `news/<date>-week-in-review.en.md` after `npm run generate-article`
  exits are forbidden.
- Never edit anything under `news/**` outside of `npm run generate-article`.
- Never dispatch another workflow except via the `dispatch-workflow:`
  safe output (`news-translate`, exactly once after merge).
- See `00-scope-and-ground-rules.md` for the full list.
