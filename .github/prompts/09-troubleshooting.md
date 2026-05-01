<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 09 — Troubleshooting

**Summary:** AWF firewall diagnostic block, error → root-cause table, and
recovery steps. The diagnostic bash lives in `scripts/awf-firewall-diagnostic.sh`
so prompts reference it rather than duplicating the script.

## 1 · When to Consult This File

- Any MCP tool returns a connection error, DNS failure, or timeout
- Before calling `safeoutputs___noop` (the diagnostic output is part of the
  noop message — see [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §5)

## 2 · AWF Firewall Diagnostic Script

Run:

```bash
bash scripts/awf-firewall-diagnostic.sh
```

The script checks:
1. DNS resolution of `data.europarl.europa.eu`
2. MCP gateway connectivity (`initialize` call via `curl` to
   `$EP_MCP_GATEWAY_URL`)
3. Direct EP API HTTP reachability
4. MCP server binary presence (`european-parliament-mcp-server`)
5. TCP reachability of `data.europarl.europa.eu:443`, `github.com:443`,
   `api.github.com:443`
6. Relevant env vars (`EP_REQUEST_TIMEOUT_MS`, `NODE_ENV`)

Pipe its output into the noop diagnostic message; do not inline the block
inside the workflow `.md`.

## 3 · `curl` exit-code → root cause

| curl exit | Meaning | Likely fix |
|----------:|---------|-----------|
| 0 | Success — check HTTP status code |
| 6 | DNS resolution failed | Add `data.europarl.europa.eu` / `"*.europa.eu"` to `network.allowed` |
| 7 | Connection refused | AWF blocking HTTPS — verify `network.allowed` and `node` entry |
| 28 | Operation timed out | EP API slow (not a firewall issue) — use direct endpoints + raise `EP_REQUEST_TIMEOUT_MS` |
| other | Transport/TLS error | Re-check `network.allowed`, TLS chain |

## 4 · Error-Category → Resolution Hints

| Category | Hints |
|----------|-------|
| `TIMEOUT` | EP API slow — use direct endpoint fallbacks (see [`07-mcp-reference.md`](07-mcp-reference.md) §6); raise `EP_REQUEST_TIMEOUT_MS` to `"120000"`; try `timeframe: "one-week"` instead of `"today"`. |
| `SERVER_ERROR` | EP API returning 5xx — retry in 1–2 hours. Verify with direct probe `https://data.europarl.europa.eu/api/v2/meps?format=application%2Fld%2Bjson&offset=0&limit=1`. |
| `INTERNAL_ERROR` | MCP server internal failure — verify `european-parliament-mcp-server@1.2.19` installed; check DNS for `data.europarl.europa.eu`. |
| `RATE_LIMIT` | Back off 5+ min; reduce call frequency. |
| `NOT_FOUND` | Tool name/params mismatch — see [`07-mcp-reference.md`](07-mcp-reference.md) §5. |
| `DNS_FAILURE` | Add `data.europarl.europa.eu` + `"*.europa.eu"` to `network.allowed`. |
| `CONNECTION_REFUSED` | AWF blocking HTTPS — verify `network.allowed` + `node` entry. |
| `UNKNOWN` | Run the full AWF diagnostic; attach output to noop. |

## 5 · Error-Pattern → Root-Cause Mapping

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| `Streamable HTTP error: session not found` / `tool call failed: session not found` (HTTP 404 from `routed:safeoutputs`) on `safeoutputs___create_pull_request` at end-of-run | safeoutputs MCP HTTP session (`localhost:3001`) reaped after ~28–30 min of no safeoutputs calls, OR killed earlier by a banned keep-alive pattern. See [§5a](#5a--safeoutputs-session-not-found--extended-context) for evidence and levers. | You cannot recover mid-run. **Hard limit: total wall-clock from agent start to the single PR call < 25 minutes; aim ≤ 22 minutes.** Surface `SINGLE_PR_ATTESTATION` early. Do NOT add a keep-alive pattern. |
| `container awf-api-proxy is unhealthy` | Transient AWF sandbox infra flake | Re-run the workflow; not a config bug. |
| **Engine Failure** — `copilot engine terminated unexpectedly` (agent job).<br>Fingerprint: `exitCode: 1`, `stdout: undefined`, `stderr: undefined`, agent-job duration < 3 min, MCP gateway healthy, post-step prints `No token usage data found, skipping summary`. | Transient gh-aw sandbox cold-start flake — Copilot CLI exits between MCP gateway init and first inference call. **Distinct fingerprint** from the `parse_error` flake but **same root-cause family**. | Confirm `lint:prompts` + `shell-safety` are green, then re-run the workflow once. Escalate only after 3 consecutive same-fingerprint runs — see [unified maintainer triage rule](../agents/agentic-workflows.agent.md#maintainer-triage--transient-gh-aw-sandbox-flakes). Forensic example: [run 25072577594](https://github.com/Hack23/euparliamentmonitor/actions/runs/25072577594). |
| `Expected ',' or '}' after property value in JSON` in Copilot `edit` | `old_str`/`new_str` > ~30 lines / ~5 KB | Regenerate via TS generator, split into ≤ 20-line edits. **Do NOT fall back to `cat > file << EOF` heredocs** — see next row. Prefer the native `create` / `Write` file tool (e.g. the Copilot CLI `Create <path>` action that successfully wrote artifacts in [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070)). |
| `Command not executed. The 'kill' command must specify at least one numeric PID. Usage: kill <PID> or kill -9 <PID>` in response to a `cat > file << 'EOF'` heredoc | **Copilot CLI bash-safety filter false-positive** — the filter scans the entire heredoc body for dangerous-command tokens. Political-analysis content routinely contains the literal word *"kill"* (e.g. *"motion to kill the bill"*, *"amendment killed in committee"*), which matches the bare-`kill`-no-PID pattern and rejects the entire write. Observed in cancelled [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070#step:27:20) at Stage B. | **Never use `cat > file << 'EOF'` to write analysis artifacts or article prose.** Use the native `create` / `Write` file tool available in the Copilot CLI — it bypasses the bash filter entirely. `cat > file` is still safe for short, keyword-free files (e.g. copying one artifact to `existing/`, writing `manifest.json` via `jq`). |
| `Base branch override is not allowed` | Missing `allowed-base-branches: ["main"]` in safe-outputs | Add to frontmatter (see [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §6). |
| `create_pull_request: No changes to commit - no commits found` | The working tree has nothing to snapshot at call time | You called the tool too early — one PR at end-of-run, after files are written. |

## 5a · safeoutputs `session not found` — quick reference

The `session not found` row above is the most load-bearing entry in §5. The
**preventive rules and time budget are authoritative in
[`02-analysis-protocol.md` §3](02-analysis-protocol.md)** (22 / ≤25 min split,
B1→B2 tripwire at minute 16, single-PR deadline at minute 22). The
**post-run recovery path** (host-side PAT fallback) is authoritative in
[`06-pr-and-safe-outputs.md` §4a](06-pr-and-safe-outputs.md). Do NOT
re-state those rules here — link to them.

**Two known triggers** (see 02 §3 for the time budget that prevents both):

- **(a) Banned keep-alive / heartbeat pattern** — lint-banned by
  `scripts/lint-prompts.js`; never reintroduce.
- **(b) Pure idle ≥ ~28–30 min** — agent activity on EP MCP, bash, `create`,
  or `edit` does **not** refresh the safeoutputs session.
  `sandbox.mcp.keepalive-interval` does **not** help — it pings HTTP MCP
  backends (gateway → backend), not the agent ↔ gateway streamable-HTTP
  session that emits `session not found`.

**Forensic runs** (kept here because the link economy is unique):

- [Run 24818921747](https://github.com/Hack23/euparliamentmonitor/actions/runs/24818921747) (news-propositions-analysis): ~28 min Stage B → end-of-run PR call failed.
- [Run 24819497608](https://github.com/Hack23/euparliamentmonitor/actions/runs/24819497608) (news-motions-analysis): connect 06:01:36, last SSE 06:06:41, PR call 06:35:09 → HTTP 404 every retry.
- [Run 24963129839](https://github.com/Hack23/euparliamentmonitor/actions/runs/24963129839) (news-week-in-review): elapsed-time tripwire fired at minute 28; PR landed at minute 29:13 → `session not found`. Motivated the uniform 22 / ≤25 budget.

**Where to find logs** for your own run — Workflow run → Artifacts → `agent.zip`:

- `agent-stdio.log` — Copilot CLI stdout (grep `safeoutputs___create_pull_request`, `SINGLE_PR_ATTESTATION`).
- `mcp-logs/mcp-gateway.log` — per-session MCP gateway trace (grep `routed:safeoutputs`).
- `mcp-logs/safeoutputs.log` — safeoutputs backend registration timing.

**Escalation:** if the symptom recurs after Stage B is already bounded
≤ 22 min, escalate to gh-aw upstream via
[`.github/agents/agentic-workflows.agent.md`](../agents/agentic-workflows.agent.md).

## 5b · Long-Horizon-Specific Failure Modes

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| `get_plenary_sessions` returns empty for far-future months (T+6m, T+12m) | EP API only publishes confirmed session dates ~3 months in advance; further-out dates are not yet scheduled. | **Expected behaviour for long-horizon fan-out.** Log the gap in `manifest.json` under `dataVerification.recessGaps[]`. Use the EP parliamentary calendar pattern (Strasbourg: one week per month, Sep–Jul; recess Aug) to infer future session slots. Widen WEP bands +5 percentage points for inferred (vs. confirmed) sessions. Do NOT retry or classify as a tool failure. |
| `get_external_documents` / `get_external_documents_feed` returns no Commission Work Programme or Trio Presidency document | The CWP is published once per year (typically Oct–Nov); the Trio programme once per 18 months. Outside those windows the feed will not contain fresh copies. | Use `get_external_documents({ limit: 100 })` with broader pagination to find the most recent CWP/Trio doc regardless of recency. Cache the document reference in `${ANALYSIS_DIR}/data/external-docs-horizon.json` and note the vintage date. Downgrade Admiralty source grade from A1 to A2 if the document is > 12 months old. |
| Electoral-overlay auto-trigger misfires (runs election-cycle workflow outside T-180 window) | `getElectionCalendarContext()` returns a stale `daysToNextElection` value because the next EP election date has not been formally confirmed by Council Decision, or a national election was misinterpreted as an EP election. | Verify the election date against [`electoral-cycle-methodology.md` §1](../../analysis/methodologies/electoral-cycle-methodology.md) EP-term anchors (EP10 ends ~Jun 2029; next EP election = second Sunday of June per Council Decision 2018/767). If `daysToNextElection` < 0 or > 1800, treat as stale and fall back to the annual cron trigger. Log the misfire in `manifest.json` under `dataVerification.electoralTriggerOverride`. |
| `intelligence/scenario-forecast.md` has < 6 scenarios on a term-outlook / election-cycle run (RED: `long-horizon-scenario-count:<count><<min>`) | Pass 1 underproduced scenarios; the long-horizon scenario-floor gate was not met. | Run Pass 3 targeting only `scenario-forecast.md`. Add scenarios until the ≥ 6 floor is met: mainline + 2 adjacent + ≥ 1 regime-change + ≥ 2 wildcard/black-swan. Each scenario requires: title, WEP band, trigger conditions, key indicators, and structural-break evaluation. See [`forward-projection-methodology.md` §4](../../analysis/methodologies/forward-projection-methodology.md). |
| Carry-forward staleness on 5-year horizon (`forward-statements` registry shows > 10 expired unresolved items) | term-outlook and election-cycle runs carry forward statements from distant prior runs; items with `horizonDate` in the past accumulate if not resolved. | Before Stage B, resolve all expired items in bulk: mark as `stale` (no evidence of delivery), `implemented` (with evidence reference), or `superseded` (newer prediction replaces). The forward-statements registry `update` command accepts `--status stale`. After bulk resolution, aim to reduce unresolved expired items to ≤ 2 as a workflow-hygiene target for long-horizon runs; this is a maintainer review guideline to limit stale carry-forward drift, not a currently automated Stage-C RED gate for `term-outlook` / `election-cycle`. |
| Recess-mode soft-fail degrades article to calendar-projection-only | > 50% of queried months in the horizon window returned zero plenary sessions (August + extended recess overlap). | This is by-design degradation (see [`07-mcp-reference.md` §14](07-mcp-reference.md) and [`10-horizon-stage-helpers.md` §8](10-horizon-stage-helpers.md)). The article still ships but with reduced forward-projection confidence. Widen WEP bands +10 pp for affected months. If the calendar-projection-only mode persists across 2+ consecutive runs, verify the EP parliamentary calendar for the term. |

## 6 · Recovery Before Calling Noop

1. Run `bash scripts/awf-firewall-diagnostic.sh`.
2. Call `get_server_health({})`.
3. Call `get_all_generated_stats({ category: "all" })` — precomputed, no
   live EP API.
4. If step 3 succeeds, the MCP server works → **ship an analysis-only PR**
   (Rule 5) instead of noop.
5. Call at least 2 other reliable tools (`get_current_meps({ limit:1 })`,
   `get_adopted_texts({ year, limit:3 })`). If ANY succeeds, avoid noop.

Only when every probe fails is `safeoutputs___noop` justified.
