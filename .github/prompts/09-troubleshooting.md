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
| `INTERNAL_ERROR` | MCP server internal failure — verify `european-parliament-mcp-server@1.3.9` installed; check DNS for `data.europarl.europa.eu`. |
| `RATE_LIMIT` | Back off 5+ min; reduce call frequency. |
| `NOT_FOUND` | Tool name/params mismatch — see [`07-mcp-reference.md`](07-mcp-reference.md) §5. |
| `DNS_FAILURE` | Add `data.europarl.europa.eu` + `"*.europa.eu"` to `network.allowed`. |
| `CONNECTION_REFUSED` | AWF blocking HTTPS — verify `network.allowed` + `node` entry. |
| `UNKNOWN` | Run the full AWF diagnostic; attach output to noop. |

## 5 · Error-Pattern → Root-Cause Mapping

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| `Streamable HTTP error: session not found` / `tool call failed: session not found` (HTTP 404 from `routed:safeoutputs`) on `safeoutputs___create_pull_request` at end-of-run | safeoutputs MCP HTTP session (`localhost:3001`) reaped after the upstream gateway default session lifetime, OR killed earlier by a banned keep-alive pattern. **Note:** the per-workflow `engine.mcp.session-timeout` knob advertised in gh-aw v0.71.3 is currently non-functional — the bundled gateway image v0.3.1 rejects the field (see next row, run #25275823699 fingerprint), so workflows cannot extend the session lifetime from frontmatter. See [§5a](#5a--safeoutputs-session-not-found--extended-context) for evidence and levers. | You cannot recover mid-run. **Hard limit: total wall-clock from agent start to the single PR call ≤ 45 min (target ≤ 42 min) — well within the 60-min `timeout-minutes` cap.** Surface `SINGLE_PR_ATTESTATION` early. Do NOT add a keep-alive pattern. |
| **MCP gateway schema validation failure** — `additionalProperties 'sessionTimeout' not allowed` from gateway v0.3.1, agent job exits at minute ≤ 2 with no inference. Fingerprint: `config:validation_schema Schema validation failed`, `failed to load config: Configuration validation error (MCP Gateway version: v0.3.1)`. Run #25275823699 example. | gh-aw v0.71.3 compiler bug — the `engine.mcp.session-timeout` field is advertised in the v0.71.3 release notes but the bundled gateway image `ghcr.io/github/gh-aw-mcpg:v0.3.1` references the v0.71.1 schema which does not include `sessionTimeout`. | Remove `engine.mcp.session-timeout` from frontmatter (already done in this repo as of run #25275823699 fix). Recompile lock files with `gh aw compile`. The MCP gateway falls back to its upstream default session lifetime; the MCP gateway default keepalive keeps backends warm. |
| `container awf-api-proxy is unhealthy` | Transient AWF sandbox infra flake | Re-run the workflow; not a config bug. |
| **Engine Failure** — `copilot engine terminated unexpectedly` (agent job).<br>Fingerprint: `exitCode: 1`, `stdout: undefined`, `stderr: undefined`, agent-job duration < 3 min, MCP gateway healthy, post-step prints `No token usage data found, skipping summary`. | Transient gh-aw sandbox cold-start flake — Copilot CLI exits between MCP gateway init and first inference call. **Distinct fingerprint** from the `parse_error` flake but **same root-cause family**. | Confirm `lint:prompts` + `shell-safety` are green, then re-run the workflow once. Escalate only after 3 consecutive same-fingerprint runs — see [unified maintainer triage rule](../agents/agentic-workflows.agent.md#maintainer-triage--transient-gh-aw-sandbox-flakes). Forensic example: [run 25072577594](https://github.com/Hack23/euparliamentmonitor/actions/runs/25072577594). |
| **Engine Failure — long-run Copilot crash with 429 reflection / `Maximum LLM invocations exceeded (100 / 100)`** — `copilot engine terminated unexpectedly` after a **long run (> 20 min)**.<br>Fingerprint: `exitCode: 1`, `hasOutput: true`, `stdout: 0B`, `stderr: ~259B`, all 3 process retries exhausted quickly, `awf-reflect: models fetch returned 429`, effective-tokens counter very high (> 50 M ET), and/or the final CAPI error says `429 Maximum LLM invocations exceeded (100 / 100)`. Forensic examples: [run 25757187347](https://github.com/Hack23/euparliamentmonitor/actions/runs/25757187347) (`news-breaking`, 109.3 M ET), [run 25781685994](https://github.com/Hack23/euparliamentmonitor/actions/runs/25781685994) (`news-propositions`, 112.1 M ET), [run 25786243743](https://github.com/Hack23/euparliamentmonitor/actions/runs/25786243743) (`news-propositions`, max invocations 100/100), and [run 25799686522](https://github.com/Hack23/euparliamentmonitor/actions/runs/25799686522) (`news-propositions`, 105.2 M ET, 99/100 invocations used, 3 296 lines written but 2 artifacts incomplete). `gh aw audit` for run 25799686522: `agentic_fraction=0.50` — ~50 % of the 99 turns were EP MCP data-gathering; agent used `track_legislation` ×7 (deep-fetching 7 procedures) plus 15 other EP MCP calls; used all 100 invocations before finishing the final 2 artifacts (`quantitative-swot.md`, `risk-matrix.md`). Contrast with successful run [25455279318](https://github.com/Hack23/euparliamentmonitor/actions/runs/25455279318): EP API was down → agent skipped data collection → completed within invocation budget. | **Root cause (precise)**: When the EP API is healthy the agent spends ~50 of its 100 invocations on data-gathering (MCP tool calls + in-context processing), leaving only ~50 for artifact writing. 38+ artifacts × ~1.5 invocations/artifact ≈ 57 invocations needed — so total = 50 + 57 = 107 > 100. The check-then-extend pattern (write short stub → wc -l check → cat >> extend) wastes 2+ invocations per under-floor artifact. The `gh aw audit` recommendation: "Move data-fetching work to frontmatter steps (pre-agent) writing to `/tmp/gh-aw/agent/`." | **(a) Deterministic pre-agent feed fetch (universal)**: every `news-*.md` article workflow has a pre-agent step that runs `bash scripts/prefetch-ep-feeds.sh <slug> <feeds…>`. The script curls EP Open Data feed endpoints (`procedures`, `documents`, `external-documents`, `committee-documents`, `events`, `adopted-texts`, `meps`) directly into `${ANALYSIS_DIR}/data/<feed>-feed.json` and writes a `{"items":[]}` placeholder on fetch failure. **(b) Universal invocation-budget discipline** lives in [`shared/prompts/news-unified-runtime.md`](../workflows/shared/prompts/news-unified-runtime.md) "Invocation Budget Discipline": Stage A hard cap (≤ 5 EP MCP calls; skip calls for any feed already on disk), Stage B write-first rule (read `reference-quality-thresholds.json` once; meet line floors in a single write; no check-then-extend). The shared runtime is imported by every article workflow, so adding the rules in **one** place applies them to all 14. Recompile with `gh aw compile --validate`. Drift-guarded by `test/unit/agentic-workflows-threat-detection.test.js` ("pre-fetches EP feeds via the shared script in every article workflow"). Do NOT downgrade the model (`claude-sonnet-4.6` / `claude-opus-4.7` are correct). |
| `create_pull_request` fails in the safe_outputs job with `Failed to apply bundle` and `Repository lacks these prerequisite commits` | Main advanced after the agent started, while the generated safe_outputs job later checked out the current base branch with shallow history. The PR bundle was based on the older triggering commit, so the shallow checkout did not contain the prerequisite commit. Forensic example: run #25547974250 (`news-term-outlook`). | Before the Stage-E attestation, run `bash scripts/gh-aw-refresh-pr-base.sh` on the final clean `news/*` branch, then call the single PR tool. The host-side PAT fallback can still recover a PR if the race recurs between that refresh and the write job, but the refresh prevents the normal safe_outputs path from failing in the common case. |
| **Duplicate fallback PR after a successful safe_outputs PR** — the bundle-path PR was created successfully (e.g. PR #1902), but the host-side `pat-pr-fallback` job then created a second `news/<date>-<slug>` PR (e.g. PR #1903) with the same content. | The post-step `gh-aw-capture-agent-patch.sh` always writes `/tmp/gh-aw/aw-agent-recovery.patch` when the agent committed to a `news/*` branch, and the old fallback trigger logic activated on the recovery-patch presence alone. The downstream "is the bundle PR already on GitHub?" API check used a branch-prefix pattern that could miss the bundle PR when the safe_outputs salt format drifted, so the fallback proceeded to publish a duplicate. | Fixed in `scripts/gh-aw-pat-pr-fallback.sh` by adding a primary authoritative short-circuit: when `GH_AW_SAFE_OUTPUTS_RESULT == "success"` (plumbed as `${{ needs.safe_outputs.result }}` in every `news-*.md` `pat-pr-fallback` job), the script exits 0 immediately with `safe_outputs job reported success; fallback skipped`. PAT recovery now runs **only when safe_outputs failed**. Drift-guarded by `test/unit/gh-aw-pat-pr-fallback.test.js` ("skips fallback when safe_outputs reported success, even if a recovery patch is present"). |
| `Expected ',' or '}' after property value in JSON` in Copilot `edit` | `old_str`/`new_str` > ~30 lines / ~5 KB | Regenerate via TS generator, split into ≤ 20-line edits. **Do NOT fall back to `cat > file << EOF` heredocs** — see next row. Prefer the native `create` / `Write` file tool (e.g. the Copilot CLI `Create <path>` action that successfully wrote artifacts in [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070)). |
| `Command not executed. The 'kill' command must specify at least one numeric PID. Usage: kill <PID> or kill -9 <PID>` in response to a `cat > file << 'EOF'` heredoc | **Copilot CLI bash-safety filter false-positive** — the filter scans the entire heredoc body for dangerous-command tokens. Political-analysis content routinely contains the literal word *"kill"* (e.g. *"motion to kill the bill"*, *"amendment killed in committee"*), which matches the bare-`kill`-no-PID pattern and rejects the entire write. Observed in cancelled [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070#step:27:20) at Stage B. | **Never use `cat > file << 'EOF'` to write analysis artifacts or article prose.** Use the native `create` / `Write` file tool available in the Copilot CLI — it bypasses the bash filter entirely. `cat > file` is still safe for short, keyword-free files (e.g. copying one artifact to `existing/`, writing `manifest.json` via `jq`). |
| `Base branch override is not allowed` | Missing `allowed-base-branches: ["main"]` in safe-outputs | Add to frontmatter (see [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §6). |
| `create_pull_request: No changes to commit - no commits found` | The working tree has nothing to snapshot at call time | You called the tool too early — one PR at end-of-run, after files are written. |
| **Pre-fetched feeds silently empty** — all 4+ `${ANALYSIS_DIR}/data/*-feed.json` files exist but contain `{"status":"unavailable"}` placeholders; `${ANALYSIS_DIR}/data/prefetch-status.json` shows `"prefetchMode":"minimal"` or `"prefetchMode":"degraded-feeds"`. The agent does not see a step failure (the prefetch step exits 0) so it proceeds with all-placeholder data, burning 5+ Stage A MCP calls chasing live fallback data — which costs invocations and may hit the 100-cap. | The pre-fetch step ran before the EP API was responsive (EP API returns 404 / 5xx during early-morning maintenance windows, ~04:00–06:00 UTC), OR the backoff retries (3 attempts, 5s → 15s → 45s) were all exhausted. This pattern appears in 4/6 runs on 2026-05-14 (committee-reports, motions, propositions, year-ahead, election-cycle): `scripts/prefetch-ep-feeds.sh` wrote placeholders with retry warnings visible in the step output. | **(1) Read `prefetch-status.json` at Stage A start.** Copy the `prefetchMode` value directly from the JSON (or from `$PREFETCH_DATA_MODE` env var) into `manifest.dataMode` — do NOT re-derive the mode by counting placeholders yourself. If `prefetchMode` is `"degraded-feeds"` or `"minimal"`, switch to degraded-mode: skip MCP calls for feeds that returned placeholders; call only the 2–3 most critical MCP tools (e.g. `get_adopted_texts`, `get_current_meps`). **(2) Set `manifest.dataMode`** to the value from `prefetchMode` — Stage C will auto-reduce line floors (the validator also accepts `"green"` as an alias for `"full"`). **(3) Log** the degraded state in `intelligence/mcp-reliability-audit.md`. **(4) Escalation path:** if the run hits the 100-invocation cap after degraded-mode handling, re-run the workflow (EP API recovers within 1–2 hours); do NOT re-inline curl logic in workflow bodies. The retry logic lives in `scripts/prefetch-ep-feeds.sh` — run `npm run test -- test/unit/prefetch-ep-feeds.test.js` after any edit. |
| **`prefetch-ep-feeds.sh` reports `All N feed(s) failed — agent will proceed with placeholders`** — the pre-agent step still exits 0 (the workflow continues) and the agent starts in a data-degraded run. | EP Open Data API was unreachable at workflow start. Per-feed retries (3× with 5s/15s/45s exponential backoff) all exhausted, so every feed file is now a `status:"unavailable"` placeholder. The HEAD readiness probe is advisory only and does not block per-feed fetches (HEAD can 405 independently of GET). | This is the intended recovery contract — the agent reads `status:"unavailable"` placeholders, falls back to EP MCP for live data, and uses prior-run analysis where available. Do NOT add `continue-on-error: true` to the prefetch step; the script intentionally returns 0 so the existing `news-*.md` step shape (no `continue-on-error`) is preserved (drift-guarded by `test/unit/agentic-workflows-threat-detection.test.js`). The script exits non-zero only on workflow-configuration bugs (exit 2 for unknown feed name). Drift-guarded by `test/unit/prefetch-ep-feeds.test.js`. |
| **`scrape-doceo-votes.js` returns `publicationLag: true`** — the script exits 0 but no `roll-call-votes.json` was written. | DOCEO XML for the requested date is not yet published (HTTP 404). Roll-call vote XML typically becomes available 24–48 hours after a plenary sitting. The 4–6 week lag applies to the EP Open Data API, not DOCEO direct; 404 on DOCEO usually means the document hasn't been published yet (< 48 h), not that it will never appear. | Re-run after 48 hours. Log the publication-lag event in `manifest.json` under `dataVerification.votingDataLag`. Use `get_all_generated_stats` to retrieve aggregate voting statistics (which have a shorter publication window) as a fallback for voting-pattern analysis. |
| **`imf-fallback-ladder.js` exits 1 with `IMF fallback ladder exhausted`** — all four rungs failed and no `economic-context-data.json` was written. | SDMX 3.0 endpoint mismatch (common after IMF API migrations), DataMapper API down, World Bank country-proxy returned no numeric data, and no cached vintage file was found. | Check `--vintage-file` argument — the cached-vintage rung requires an explicit path to a previously-saved `economic-context-data.json`. For first-run bootstrap, pass `--vintage-file analysis/cache/imf/economic-context-data.json` (populated automatically after the first successful rung-1 or rung-2 run). If all live rungs are down, create a hand-curated vintage file from IMF.org website data and pass it as `--vintage-file`. |
| **`cache-thresholds.js` exits 1 with `Thresholds file not found`** | `analysis/methodologies/reference-quality-thresholds.json` is missing from the workspace — likely a shallow checkout or the file was deleted by a PR. | Run `git fetch --unshallow && git checkout HEAD -- analysis/methodologies/reference-quality-thresholds.json` to restore the file. The thresholds file is committed to the repo and must always be present; Stage B cannot function without it. |

## 5a · safeoutputs `session not found` — quick reference

The `session not found` row above is the most load-bearing entry in §5. The
**preventive rules and time budget are authoritative in
[`02-analysis-protocol.md` §3](02-analysis-protocol.md)** (per-family
B1→B2 / Stage-C-exit / PR-call tripwires; standard slugs: 22 / 36 / ≤45;
electoral: 28 / 42 / ≤47). The **post-run recovery path** (host-side PAT
fallback) is authoritative in [`06-pr-and-safe-outputs.md` §4a](06-pr-and-safe-outputs.md).
Do NOT re-state those rules here — link to them.

**Two known triggers** (see 02 §3 for the time budget that prevents both):

- **(a) Banned keep-alive / heartbeat pattern** — lint-banned by
  `scripts/lint-prompts.js`; never reintroduce.
- **(b) Pure idle past upstream gateway default session lifetime** —
  agent activity on EP MCP, bash, `create`, or `edit` does **not**
  refresh the safeoutputs session. the MCP gateway default keepalive
  does **not** help — it pings HTTP MCP backends (gateway → backend),
  not the agent ↔ gateway streamable-HTTP session that emits `session
  not found`. The per-workflow `engine.mcp.session-timeout` knob
  advertised in gh-aw v0.71.3 is currently non-functional (bundled
  gateway image v0.3.1 rejects the field — see §5 row, run
  #25275823699), so the only effective lever is the time-budget
  discipline in 02 §3 (PR call by minute ≤ 45).

**Forensic runs** (kept here because the link economy is unique):

- [Run 24818921747](https://github.com/Hack23/euparliamentmonitor/actions/runs/24818921747) (news-propositions-analysis): ~28 min Stage B → end-of-run PR call failed.
- [Run 24819497608](https://github.com/Hack23/euparliamentmonitor/actions/runs/24819497608) (news-motions-analysis): connect 06:01:36, last SSE 06:06:41, PR call 06:35:09 → HTTP 404 every retry.
- [Run 24963129839](https://github.com/Hack23/euparliamentmonitor/actions/runs/24963129839) (news-week-in-review): elapsed-time tripwire fired at minute 28; PR landed at minute 29:13 → `session not found`. Motivated the original 22 / ≤25 budget under the old 45-min schedule; the v0.71.3 refactor supersedes that schedule with a 60-min `timeout-minutes` cap (the planned `engine.mcp.session-timeout: 65m` extension is currently non-functional, see §5 row).
- [Run 25275823699](https://github.com/Hack23/euparliamentmonitor/actions/runs/25275823699) (news-year-ahead): gateway v0.3.1 rejected `sessionTimeout` at config validation; agent job exited at minute ≤ 2. Fix: removed `engine.mcp.session-timeout: 65m` from all news-*.md frontmatter and recompiled lock files.

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
