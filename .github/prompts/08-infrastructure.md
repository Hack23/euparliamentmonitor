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
shared gh-aw import so the four MCP mounts (European Parliament, World Bank,
memory, sequential-thinking) stay in lockstep across all workflows:

```yaml
imports:
  - shared/mcp/news-mcp-servers.md    # provides mcp-servers: (all four mounts)
```

The workflow frontmatter then adds the non-MCP configuration:

```yaml
runtimes:
  node:
    version: "25"             # Runner uses Node.js 25

network:
  allowed:
    - node                    # npm/npx installation
    - github.com
    - api.github.com
    - data.europarl.europa.eu
    - "*.europa.eu"
    - api.worldbank.org
    - dataservices.imf.org
    - hack23.com
    - www.hack23.com
    - riksdagsmonitor.com
    - www.riksdagsmonitor.com
    - euparliamentmonitor.com
    - www.euparliamentmonitor.com
    - defaults                # GitHub Actions runtime

tools:
  github:
    toolsets: [all]
  bash: true
  agentic-workflows: true
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
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.13", "--timeout", "120000"]
    env:
      EP_REQUEST_TIMEOUT_MS: "120000"
  world-bank:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "worldbank-mcp@1.0.1"]
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
- ✅ `EP_REQUEST_TIMEOUT_MS: "120000"` (120 s) handles slow feed endpoints.
- Other contexts (`copilot-setup-steps.yml`, `copilot-mcp.json`) may use 90 s.

## 3 · MCP Gateway Setup Script

`source scripts/mcp-setup.sh` resolves gateway `domain:port` from
`/home/runner/.copilot/mcp-config.json` (default `host.docker.internal:8080`
on gh-aw v0.69+) and exports:

```
EP_MCP_GATEWAY_URL=http://host.docker.internal:8080/mcp/european-parliament
EP_MCP_GATEWAY_API_KEY=<extracted via node -e, no jq>
WORLD_BANK_MCP_SERVER_URL=http://host.docker.internal:8080/mcp/world-bank
IMF_API_BASE_URL=https://dataservices.imf.org/REST/SDMX_3.0/
MCP_CLIENT_TIMEOUT_MS=120000
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
    npm install --no-save european-parliament-mcp-server@1.2.13
  fi
fi

export USE_EP_MCP=true
# No-op: Stage A data collection is handled within the workflow prompt body.
# Stage D article rendering uses: npm run generate-article -- --run "${ANALYSIS_DIR}"
```

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
