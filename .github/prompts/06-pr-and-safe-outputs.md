<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 06 — PR and Safe Outputs (Stage E)

**Summary:** One PR per workflow. At the very end. After every file is written.
Never a checkpoint PR, never a keep-alive heartbeat, never a progressive safe
output. If you run out of time, ship whatever is complete in the single PR and
stop. `news-translate.md` is the one exception — it uses the multi-call flush
pattern with `max-patch-size`.

## 1 · The Single-PR Rule (ABSOLUTE)

> Every article-generating workflow calls `safeoutputs___create_pull_request`
> **exactly once**, at the end of the run, after every file has been written.

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

| Outcome | When | What the single PR contains |
|---------|------|----------------------------|
| **Article + analysis PR** | Stage C green AND Stage D validators exit 0 | `news/${DATE}-${TYPE}-en.html` + `analysis/daily/${DATE}/${TYPE}-run${NN}/**` |
| **Analysis-only PR** | Stage C ultimately fails (after Pass 3) OR No-Publish rule triggers | `analysis/daily/${DATE}/${TYPE}-run${NN}/**` only, with a PR body that states the reason |
| **`safeoutputs___noop`** | MCP server unreachable AND zero data collected AND `get_all_generated_stats` also fails | Full diagnostic message per §5 |

Exactly one of the three is called per run.

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

## 5 · Noop Diagnostic (required content)

`safeoutputs___noop` is called only when MCP is completely unreachable AND zero
data was collected AND `get_all_generated_stats` also fails. A bare "MCP
unavailable" message is rejected. Include the output of
`scripts/awf-firewall-diagnostic.sh` (see
[`09-troubleshooting.md`](09-troubleshooting.md)) plus:

```
MCP CONNECTIVITY DIAGNOSTIC — {workflow-name}
Timestamp: {ISO-8601 UTC}
MCP Server: european-parliament-mcp-server@1.2.11
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

Every article-generating workflow carries:

```yaml
safe-outputs:
  allowed-domains: [data.europarl.europa.eu, www.europarl.europa.eu, github.com,
                    hack23.com, www.hack23.com, riksdagsmonitor.com, www.riksdagsmonitor.com,
                    euparliamentmonitor.com, www.euparliamentmonitor.com]
  create-pull-request:
    title-prefix: "[news] "
    labels: [agentic-news, analysis-data]
    draft: false
    expires: 14d
    allowed-base-branches: ["main"]
  add-comment:
    max: 1
```

`create-pull-request.max` defaults to 1 — leave it default. `news-translate.md`
sets `excluded-files` + uses the flush pattern; nothing else does.

## 7 · Exception — `news-translate.md`

Translation workflows translate one file at a time across 90 minutes and up to
13 target languages. Losing all translations after minute 20 is unacceptable.
`news-translate.md` (and only it) uses the repeated-flush pattern: each
`safeoutputs___create_pull_request` call overwrites the PR patch with the
latest snapshot. See that file for the exact cadence. The lint rule exempts
`news-translate.md`.
