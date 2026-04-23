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
| `INTERNAL_ERROR` | MCP server internal failure — verify `european-parliament-mcp-server@1.2.11` installed; check DNS for `data.europarl.europa.eu`. |
| `RATE_LIMIT` | Back off 5+ min; reduce call frequency. |
| `NOT_FOUND` | Tool name/params mismatch — see [`07-mcp-reference.md`](07-mcp-reference.md) §5. |
| `DNS_FAILURE` | Add `data.europarl.europa.eu` + `"*.europa.eu"` to `network.allowed`. |
| `CONNECTION_REFUSED` | AWF blocking HTTPS — verify `network.allowed` + `node` entry. |
| `UNKNOWN` | Run the full AWF diagnostic; attach output to noop. |

## 5 · Error-Pattern → Root-Cause Mapping

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| `tool call failed: session not found` (status 404 from `routed:safeoutputs`) | safeoutputs HTTP backend session reaped by its own idle timer — **not** necessarily caused by a keep-alive pattern. Observed in [run 24819497608](https://github.com/Hack23/euparliamentmonitor/actions/runs/24819497608): the agent connected to safeoutputs at 06:01:36, last interaction 06:06:41 (SSE GET closed), then worked silently on Stage A+B+C for ~29 min, and the final `create_pull_request` at 06:35:09 returned 404. `mcp-gateway.log` shows the MCP gateway sent exactly **one** ping to `/mcp/safeoutputs` (at connect time) — `sandbox.mcp.keepalive-interval: 300` does **not** proxy periodic pings to HTTP MCP backends. The bounded workaround is already the single end-of-run PR rule in `06-pr-and-safe-outputs.md`; when the session expires anyway, the analysis work committed to the local branch is lost for this run but visible in the agent logs. | You cannot recover mid-run. Do NOT add a banned keep-alive pattern to try to prevent it. Follow-ups: (1) shorten Stage B where possible; (2) surface the `SINGLE_PR_ATTESTATION` log line early so the failure is visible; (3) escalate to gh-aw upstream if it recurs — see `.github/agents/agentic-workflows.agent.md` for the upstream docs. |
| `container awf-api-proxy is unhealthy` | Transient AWF sandbox infra flake | Re-run the workflow; not a config bug. |
| `Expected ',' or '}' after property value in JSON` in Copilot `edit` | `old_str`/`new_str` > ~30 lines / ~5 KB | Regenerate via TS generator, split into ≤ 20-line edits. **Do NOT fall back to `cat > file << EOF` heredocs** — see next row. Prefer the native `create` / `Write` file tool (e.g. the Copilot CLI `Create <path>` action that successfully wrote artifacts in [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070)). |
| `Command not executed. The 'kill' command must specify at least one numeric PID. Usage: kill <PID> or kill -9 <PID>` in response to a `cat > file << 'EOF'` heredoc | **Copilot CLI bash-safety filter false-positive** — the filter scans the entire heredoc body for dangerous-command tokens. Political-analysis content routinely contains the literal word *"kill"* (e.g. *"motion to kill the bill"*, *"amendment killed in committee"*), which matches the bare-`kill`-no-PID pattern and rejects the entire write. Observed in cancelled [run 24805100070](https://github.com/Hack23/euparliamentmonitor/actions/runs/24805100070#step:27:20) at Stage B. | **Never use `cat > file << 'EOF'` to write analysis artifacts or article prose.** Use the native `create` / `Write` file tool available in the Copilot CLI — it bypasses the bash filter entirely. `cat > file` is still safe for short, keyword-free files (e.g. copying one artifact to `existing/`, writing `manifest.json` via `jq`). |
| `Base branch override is not allowed` | Missing `allowed-base-branches: ["main"]` in safe-outputs | Add to frontmatter (see [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §6). |
| `create_pull_request: No changes to commit - no commits found` | The working tree has nothing to snapshot at call time | You called the tool too early — one PR at end-of-run, after files are written. |

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
