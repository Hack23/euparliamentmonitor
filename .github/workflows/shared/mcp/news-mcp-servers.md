---
mcp-servers:
  european-parliament:
    container: "node:25-alpine"
    entrypoint: "npx"
    entrypointArgs: ["-y", "european-parliament-mcp-server@1.2.15", "--timeout", "120000"]
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
---

<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Shared MCP server block for EU Parliament Monitor news workflows

This file is a gh-aw **shared workflow component** (no `on:` field, so it is
never compiled to a standalone GitHub Actions workflow — only imported
into news-*.md workflows via the `imports:` field).

It mounts the four MCP servers every article-generating workflow needs:

| Server | Version | Purpose |
|---|---|---|
| `european-parliament` | `european-parliament-mcp-server@1.2.15` | 62 EP tools (see `.github/prompts/07-mcp-reference.md`) |
| `world-bank` | `worldbank-mcp@1.0.1` | **Non-economic** indicators — health, education, social, environment, demographics, defence (military expenditure), agriculture, innovation, governance (WGI). |
| `memory` | `@modelcontextprotocol/server-memory` | Run-scoped scratch memory |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Structured reasoning tool |

Do **not** add `tools: ["*"]` / `allowed: ["*"]` to any server above — the
gh-aw MCP gateway (`awmg`) treats `*` as a literal tool name. Omit the
`tools` field entirely. See `.github/prompts/08-infrastructure.md` §2 for
the canonical rule.

Importing workflows keep their own `tools:` block (bash / github /
agentic-workflows / repo-memory configuration), `network:`, `safe-outputs:`,
`permissions:`, `runtimes:`, `steps:`, and `engine:` entries — `imports:`
does not merge those fields.
