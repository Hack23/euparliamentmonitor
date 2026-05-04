<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 06 — PR and Safe Outputs (Stage E)

**Summary:** One PR per workflow. At the very end. After every file is written.
Never a checkpoint PR, never a keep-alive heartbeat, never a progressive safe
output. If you run out of time, ship whatever is complete in the single PR and
stop. `news-translate.md` is the one exception — it uses the multi-call flush
pattern with `max-patch-size`.

## 1 · The Single-PR Rule (ABSOLUTE)

> Every workflow in the `news-*` family calls
> `safeoutputs___create_pull_request` **exactly once**, at the end of the run,
> after every file has been written. Applies uniformly to:
> - unified `news-<type>.md` article workflows — one combined analysis + article PR
> - `news-translate.md` — the documented multi-call flush exception

Why: `safeoutputs___create_pull_request` takes a **synchronous** `git format-patch`
snapshot at call time (gh-aw v0.69 `createPullRequestHandler`). Files written or
commits made **after** the call are **NOT** in the PR. With
`create-pull-request.max: 1` no later call can extend it. Past breakage: PRs
#1313, #1316, #1323, #1326 all shipped with baseline-only content because they
called the tool at minute ~3 as a "checkpoint".

## 2 · Pre-PR Attestation (MANDATORY log line)

Immediately before the single call, emit to stdout:

```
SINGLE_PR_ATTESTATION: about to call safeoutputs___create_pull_request for the first and only time at elapsed=<N>m with <X> analysis files + <Y> article files staged
```

## 3 · Outcomes — Exactly One of These

### 3a · Unified `news-<type>.md` (combined analysis + article PR)

| Outcome | When | What the single PR contains |
|---------|------|----------------------------|
| **Article + analysis PR (GREEN)** | Stage C GREEN first or second attempt and Stage D render exits 0 | `analysis/daily/${DATE}/${TYPE}/**` including `${ANALYSIS_DIR}/article.md`, plus generated `news/**` outputs. Manifest carries `history[].gateResult=GREEN`. |
| **Analysis PR (ANALYSIS_ONLY)** | Stage C ultimately fails after Pass 3 or No-Publish rule triggers | Same analysis folder, manifest `history[].gateResult=ANALYSIS_ONLY`. PR body explains which artifacts fell short; no article HTML is rendered. |
| **`safeoutputs___noop`** | MCP unreachable AND zero data AND `get_all_generated_stats` fails | Full diagnostic per §5. |

Title: `"[news] <AI-generated headline>"`.
Labels: `[agentic-news, analysis-data, type:<type>]`.
Head: `news/<YYYY-MM-DD>-<type>`.
Body: links to `Article-Generation.md`, `${ANALYSIS_DIR}/article.md`, and the key artifacts that support the headline.

Exactly one outcome in §3a is emitted per run of each article workflow.

## 4 · Deadline Discipline (short)

Time is budgeted in [`02-analysis-protocol.md`](02-analysis-protocol.md) and
[`04-article-generation.md`](04-article-generation.md). Keep an eye on the
clock; do not start new slow calls (30–120s feeds, deep-fetch) past the
late-workflow window (roughly the last 10 minutes of the timeout budget). If
you run out of time, ship the PR with whatever is complete and stop — do not
attempt a second PR.

**Banned patterns (lint-enforced by `scripts/lint-prompts.js`):**

- "checkpoint PR" / "checkpoint-pr" / "checkpoint pr"
- "keep-alive" / "keepalive" / "keep alive"
- "heartbeat"
- "progressive safe output"
- `safeoutputs___push_repo_memory` (the heartbeat helper)
- More than one `safeoutputs___create_pull_request` reference in the same workflow
  file (exception: `news-translate.md`)

### 4a · Host-side PAT fallback for expired safeoutputs sessions

The 8 unified article workflow sources define a deterministic custom
`pat-pr-fallback` job that depends on the generated `agent` job. The fallback
is **not** an agent tool call and does **not** expose credentials to the
agent. It downloads the agent artifact and runs
`scripts/gh-aw-pat-pr-fallback.sh` with
`secrets.COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN` only when the normal
safeoutputs path failed with `session not found` and no
`create_pull_request` safeoutput item exists.

The fallback preserves the single-PR rule by pushing only the canonical
`news/<YYYY-MM-DD>-<type>` branch, checking for an existing open PR for that
branch, updating it when present, and creating one PR only when none exists.
It stages only `analysis/daily/**` and `news/**` paths; protected paths and
lock files remain unstaged.

## 5 · Noop Diagnostic (required content)

`safeoutputs___noop` is called only when MCP is completely unreachable AND zero
data was collected AND `get_all_generated_stats` also fails. A bare "MCP
unavailable" message is rejected. Include the output of
`scripts/awf-firewall-diagnostic.sh` (see
[`09-troubleshooting.md`](09-troubleshooting.md)) plus:

```
MCP CONNECTIVITY DIAGNOSTIC — {workflow-name}
Timestamp: {ISO-8601 UTC}
MCP Server: european-parliament-mcp-server@1.2.21
AWF Firewall Check: {stdout from scripts/awf-firewall-diagnostic.sh}
MCP Health Gate:
  get_server_health: {PASS/FAIL}
  get_plenary_sessions({limit:1}): {PASS/FAIL}
  get_current_meps({limit:1}): {PASS/FAIL}
  get_adopted_texts_feed({timeframe:"one-week"}): {PASS/FAIL}
  get_all_generated_stats({category:"all"}): {PASS/FAIL}
  Error Category: {TIMEOUT/SERVER_ERROR/INTERNAL_ERROR/RATE_LIMIT/NOT_FOUND/DNS_FAILURE/CONNECTION_REFUSED/UNKNOWN}
Recovery Attempts: 1. ... 2. ... 3. ...
Resolution Hints: {per error category — see 09-troubleshooting.md}
```

**Before calling noop, ALWAYS try analysis-only PR first** — if
`get_all_generated_stats` succeeded, the MCP server is working and an
analysis-only PR with precomputed stats is valuable (Rule 5). Noop is the
last resort.

## 6 · Safe-Outputs Frontmatter Contract

Every article-generating workflow carries the following safe-outputs block.
This mirrors the actual frontmatter shipped in `news-breaking.md` and the
seven sibling `news-<type>.md` files; deviations cause silent runtime failures
(`Base branch override is not allowed`, `Too many items of type
'create_pull_request'`, etc.).

```yaml
safe-outputs:
  allowed-domains:
    - data.europarl.europa.eu
    - www.europarl.europa.eu
    - github.com
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data, "type:<slug>"]   # <slug> = breaking | committee-reports | …
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
    max: 1                                                 # exactly one PR per run (lint-enforced)
  dispatch-workflow:
    workflows: [news-translate]                            # exactly one downstream dispatch
    max: 1
```

Companion frontmatter (also required, documented in
[`08-infrastructure.md`](08-infrastructure.md) §1):

```yaml
tools:
  timeout: 300                                             # 5-min per-tool-call cap
```

Notes on the schema:

- `create-pull-request.max` must be set to `1` explicitly. The gh-aw default
  is `1`, but stating it in the workflow makes the single-PR rule visible to
  reviewers and to `scripts/lint-prompts.js`.
- `add-comment` is **not** part of the article-workflow contract — the
  combined PR is the single output. Only `news-translate.md` declares it.
- `dispatch-workflow` is exactly one `news-translate` dispatch per run; the
  translation workflow is the sole downstream consumer.
- The legacy `news-article-generator.md` multi-article helper was removed in
  the April-2026 aggregator-pipeline migration (see
  [`news-generation.agent.md`](../agents/news-generation.agent.md) § Shared
  Stage Contract). There is no longer a documented multi-PR exception in this
  family — `news-translate.md` remains the only multi-call workflow and uses
  the flush pattern (`max: 10` + `excluded-files`) described in §7 below.

## 7 · Exception — `news-translate.md`

Translation workflows translate one file at a time within a 60-minute hard
cap and up to 13 target languages. Losing all translations after the first
flush is unacceptable. `news-translate.md` (and only it) uses the repeated-
flush pattern: each `safeoutputs___create_pull_request` call overwrites the
PR patch with the latest snapshot. See that file for the exact cadence.
The lint rule exempts `news-translate.md`.
