<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 08 — Infrastructure & Frontmatter

**Summary:** Required gh-aw frontmatter shared by every news workflow. MCP
gateway setup. EP MCP client activation. Everything that is configuration,
not behaviour.

## 1 · Required Frontmatter Fields

Every `news-*.md` workflow defines `runtimes:`, `network:`, `tools:`, and its
own `safe-outputs:` block directly in the workflow frontmatter. The
`mcp-servers:` block is **not** inlined per workflow — it is provided via a
shared gh-aw import so the five MCP mounts (European Parliament, World Bank,
fetch-proxy, memory, sequential-thinking) stay in lockstep across all
workflows. The IMF integration uses the **native TypeScript client** for SDMX
parsing and request construction, with the shared `fetch-proxy` MCP server as
the primary gh-aw/AWF transport because direct HTTPS from the agent sandbox can
be blocked by Squid.

```yaml
imports:
  - shared/mcp/news-mcp-servers.md    # provides mcp-servers: (all four mounts)
```

The workflow frontmatter then adds the non-MCP configuration:

```yaml
runtimes:
  node:
    version: "25"             # Runner uses Node.js 25

# Network allowlist — uses ecosystem identifiers where possible (per
# upstream docs/reference/network.md §"Ecosystem Identifiers"):
#   - `defaults` — basic infrastructure (certs, JSON schema, package mirrors)
#   - `github`   — all GitHub domains (replaces explicit github.com/api.github.com)
#   - `node`     — npm/npx (needed for MCP server boot via npx)
network:
  allowed:
    - defaults                # basic infrastructure
    - github                  # GitHub domains (replaces github.com/api.github.com)
    - node                    # npm/npx installation
    - data.europarl.europa.eu
    - "*.europa.eu"
    - dataservices.imf.org    # IMF SDMX 3.0 REST — sole authoritative economic source
    - api.worldbank.org       # WB MCP — non-economic domains
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com

# Sandbox — the MCP gateway uses its upstream default keepalive to keep
# backend HTTP sessions warm. The agent ↔ gateway streamable-HTTP session
# lifetime cannot currently be configured from frontmatter —
# `engine.mcp.session-timeout` is advertised by the gh-aw v0.71.3 compiler
# but the bundled gateway image `ghcr.io/github/gh-aw-mcpg:v0.3.1` rejects
# the field with `additionalProperties 'sessionTimeout' not allowed` (run
# #25275823699 fingerprint). Until upstream ships a compatible gateway
# image, do NOT set `engine.mcp.session-timeout`. The workflow's 60-min
# `timeout-minutes` cap and the PR-call deadline at minute ≤ 45 remain
# authoritative.
sandbox:
  agent: awf
  mcp:
    port: 8080

# Engine — `engine.mcp.session-timeout` is intentionally NOT set; see the
# comment block above. Without it, the gateway uses its upstream default
# session lifetime.
engine:
  id: copilot
  model: claude-sonnet-4.6
  max-continuations: 1

tools:
  timeout: 300                # per-tool-call cap (bash, MCP, github, edit, web-fetch)
  startup-timeout: 90         # MCP server boot via npx package-pull
  github:
    toolsets: [all]           # all read toolsets EXCEPT `dependabot` (intentional)
  bash: true
  edit:                       # explicit file-edit tool for analysis artifact authoring
  web-fetch:                  # fallback fetch for EP/IMF/WB pages when MCP misses
  agentic-workflows: true
  # Cache memory — restores partial Stage A/B work across runs so a failed
  # safe-outputs PR call does not lose 20+ minutes of analysis. Compiler
  # auto-injects restore + save steps using a workflow-scoped key; see
  # upstream `reference/cache-memory.md`.
  cache-memory:
    key: news-<type>-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".jsonl", ".txt", ".html"]
  repo-memory:
    branch-name: memory/news-generation
    allowed-extensions: [".md", ".json"]
    max-file-size: 51200
    max-file-count: 50
    max-patch-size: 51200
```

The current shared `mcp-servers:` block (imported via
`shared/mcp/news-mcp-servers.md`) is:

```yaml
mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.21", "--timeout", "180000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "180000"
  world-bank:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
  fetch-proxy:
    container: "node:25-alpine"
    entrypoint: "node"
    entrypointArgs: ["-e", "<inline IMF-only JSON-RPC fetch server>"]
  memory:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-memory"]
  sequential-thinking:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
```

Do **not** duplicate this block back into individual workflows — edit the
shared component (`.github/workflows/shared/mcp/news-mcp-servers.md`) and
recompile.

Safe-outputs block: see [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) §6.

## 2 · MCP Server Config — Hard Rules

- ❌ **Never** add `tools: ["*"]` / `allowed: ["*"]`. The gh-aw MCP gateway
  (`awmg`) treats `*` as a literal tool name and exposes 0 tools. Omit the
  field entirely.
- ❌ Never use `node:lts-alpine` — the compile workflow normalizes it to
  `node:25-alpine` and fails if it persists.
- ✅ `EP_REQUEST_TIMEOUT_MS: "180000"` (180 s) handles slow feed endpoints.
- ✅ `fetch-proxy` must expose exactly `fetch_url`, must not use `\n` string
  literals in the inline `node -e` script (gh-aw/docker argument decoding can
  turn them into invalid embedded newlines), and must constrain fetches to
  `https://dataservices.imf.org/REST/SDMX_3.0/`.
- Other contexts (`copilot-setup-steps.yml`, `copilot-mcp.json`) use the same
  180 s EP timeout to avoid drift between local Copilot and gh-aw runs.

## 3 · MCP Gateway Setup Script

`source scripts/mcp-setup.sh` resolves gateway `domain:port` from
`/home/runner/.copilot/mcp-config.json` (default `host.docker.internal:8080`
on gh-aw v0.69+) and exports:

```
EP_MCP_GATEWAY_URL=http://host.docker.internal:8080/mcp/european-parliament
EP_MCP_GATEWAY_API_KEY=<extracted via node -e, no jq>
WORLD_BANK_MCP_SERVER_URL=http://host.docker.internal:8080/mcp/world-bank
FETCH_MCP_GATEWAY_URL=http://host.docker.internal:8080/mcp/fetch-proxy
IMF_API_BASE_URL=https://dataservices.imf.org/REST/SDMX_3.0
MCP_CLIENT_TIMEOUT_MS=180000
IMF_API_TIMEOUT_MS=120000
```

Token priority: `gateway.apiKey` → `mcpServers['european-parliament'].headers.Authorization`.
Port/domain priority: dynamic `gateway.{port,domain}` → default
`host.docker.internal:8080`. AWF allowlist has 80, 443, 8080.

## 4 · Canonical "gateway + generation" bash block

> Environment variables do NOT persist across bash blocks. `mcp-setup.sh`, the
> generation script, and `USE_EP_MCP=true` **must** be in the **same** bash block.

```bash
source scripts/mcp-setup.sh

# Fallback: stdio mode verification
if [ -z "${EP_MCP_GATEWAY_URL:-}" ]; then
  if [ -f "node_modules/.bin/european-parliament-mcp-server" ]; then
    echo "✅ EP MCP binary found for stdio mode"
  else
    npm install --no-save european-parliament-mcp-server@1.2.21
  fi
fi

export USE_EP_MCP=true
# No-op: Stage A data collection is handled within the workflow prompt body.
# Stage D article rendering uses: npm run generate-article -- --run "${ANALYSIS_DIR}"
```

**All article-generating workflows** (`news-breaking`, `news-week-in-review`,
`news-month-in-review`, `news-week-ahead`, `news-month-ahead`,
`news-committee-reports`, `news-motions`, `news-propositions`) start the
IMF live probe immediately after this setup and before EP MCP fan-out.
The probe is **mandatory** — every article type carries an IMF minimum
≥1 indicator per [`01-data-collection.md §4`](01-data-collection.md), and
Stage C fails any `economic-context.md` that cites IMF figures from agent
knowledge without `cache/imf/*.json`. The phrase "macro-context workflows"
in earlier revisions of this section was ambiguous; the rule now applies
to every article-generating workflow without exception. Only
`news-translate.md` (no analysis stage) is exempt.

```bash
mkdir -p "${ANALYSIS_DIR}/cache/imf"
scripts/imf-mcp-probe.sh > "${ANALYSIS_DIR}/cache/imf/probe-summary.json" &
IMF_PROBE_PID=$!
# Run EP MCP collection here, then:
wait "$IMF_PROBE_PID" || true
```

**Self-check before Stage B:** confirm `${ANALYSIS_DIR}/cache/imf/probe-summary.json`
exists (even when the probe returned `{"available": false}` — the file is
the provenance signal). A missing probe-summary.json is a Stage A defect:
re-run the probe synchronously before exiting Stage A.

**IMF-unavailable degraded mode (`{"available": false}`).** When the probe
file exists *and* reports `{"available": false}`, treat the run as an
explicit IMF-unavailable degraded mode:

- Provenance is satisfied by the saved probe summary (the
  `cache/imf/probe-summary.json` file is the audit record of the
  unavailability).
- IMF minimums for this run are **waived** — Stage C does not RED on a
  missing per-article-type IMF count when probe-summary records
  `available: false`.
- `economic-context.md` MUST NOT cite IMF figures from agent knowledge,
  MUST NOT claim IMF-backed completeness, and MUST surface the
  unavailability with a 🔴 marker plus the full probe error message in
  §"Data freshness".
- Downstream stages (Stage D article render) MUST NOT inject IMF
  citations into prose.
- **Fail-early exception:** if the planned article type cannot remain
  valid without IMF-backed data — currently `committee-reports` runs
  scoped to ECON / BUDG / INTA, where the IMF minimum is ≥3 indicators —
  fail early in Stage A after writing the probe summary, set
  `GATE_RESULT=ANALYSIS_ONLY`, and record the unavailability as the
  justification in `runs/stage-a-fail.log`. All other article types
  proceed in degraded mode.

The waiver applies *only* to runs where `available: false` is the
authentic probe outcome. Any IMF-cited prose must still be backed by
`cache/imf/*.json` files when the probe reports `available: true`.

`${ARTICLE_TYPE_SLUG}`, `${ANALYSIS_DIR}`, and `${TODAY}` are set by the
workflow's own Date Context Establishment block (see each `news-*.md` §Date
Context). Title/description are AI-generated per
[`04-article-generation.md`](04-article-generation.md) §Keywords/Title rules.

## 4b · Stable Same-Day Folder Layout

All unified workflow runs write to the canonical stable folder:

```
analysis/daily/${DATE}/${ARTICLE_TYPE_SLUG}/
```

Use the `scripts/resolve-analysis-dir.sh` helper to echo this path and create
the standard subdirectories (no nested parameter expansion, AWF-safe):

```bash
TODAY=$(date -u +%Y-%m-%d)
ANALYSIS_DIR=$(scripts/resolve-analysis-dir.sh "$TODAY" "$ARTICLE_TYPE_SLUG")
echo "ANALYSIS_DIR=$ANALYSIS_DIR" >> "$GITHUB_ENV"
```

Workflows pass this path to `npm run generate-article -- --run "$ANALYSIS_DIR"`,
which reads the committed analysis artifacts and renders the article HTML.

## 5 · EP MCP TypeScript Client

Source: [`src/mcp/ep-mcp-client.ts`](../../src/mcp/ep-mcp-client.ts) → compiled
to `scripts/mcp/ep-mcp-client.js`.

| Mode | When | Activation |
|------|------|-----------|
| Gateway (HTTP) | AWF sandbox / agentic workflows | `EP_MCP_GATEWAY_URL` env var (set by `mcp-setup.sh`) |
| Stdio | Local dev / standard CI | Default when `EP_MCP_GATEWAY_URL` unset |

Env vars read by the client:

| Var | Purpose | Default |
|-----|---------|---------|
| `EP_MCP_GATEWAY_URL` | Gateway URL | — (stdio if unset) |
| `EP_MCP_GATEWAY_API_KEY` | Gateway auth | — |
| `EP_REQUEST_TIMEOUT_MS` | Per-request timeout (ms) | `120000` |
| `MCP_CLIENT_TIMEOUT_MS` | Client-level timeout | `120000` |
| `EP_MCP_SERVER_PATH` | Binary path (stdio only) | `european-parliament-mcp-server` |

## 6 · Bash Tool Call Contract

Every `bash`/shell tool call MUST include both `command` AND `description`
fields. Missing either field fails validation, wastes a turn, and can stall
the workflow.

Sandbox-safe patterns:
- ❌ `$($(...))` nested substitution — assign to a variable first.
- ❌ `${VAR:-$(cmd || cmd2)}` default-with-fallback — use `if/else`.
- ❌ Adjacent `${RANDOM}${RANDOM}` — use `$$` and `$(date +%s)` on separate lines.
- ❌ `$(cmd < file)` input redirection inside substitution — use `cmd file` or pipe.

## 7 · gh-aw CLI Version

Pinned in [`compile-agentic-workflows.yml`](../workflows/compile-agentic-workflows.yml)
(`GH_AW_VERSION: "v0.69.3"`). If this drifts, verify the current value in
that workflow file. Harden Runner pinned by SHA.

## 8 · `gh aw mcp inspect` (debugging)

```bash
gh aw mcp inspect                                                # list all
gh aw mcp inspect news-breaking                                  # one workflow
gh aw mcp inspect news-breaking --server european-parliament     # one server
gh aw mcp inspect news-breaking --server european-parliament --tool get_plenary_sessions
```
