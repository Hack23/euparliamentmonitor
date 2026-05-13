---
# SPDX-FileCopyrightText: 2024-2026 Hack23 AB
# SPDX-License-Identifier: Apache-2.0
#
# Shared `tools:` block for the 14 unified `news-*.md` article workflows.
# Every key except `cache-memory.key` is structurally identical across all
# 14 workflows; the cache-memory key is parameterized via gh-aw's
# `import-schema:` mechanism (single `slug` input).
#
# Tools rationale:
#   - timeout: 180             — per-tool-call cap covers bash, MCP, github,
#                                edit, web-fetch
#   - startup-timeout: 180     — MCP server boot window (npx package install)
#                                covers european-parliament, world-bank,
#                                memory, sequential-thinking
#   - github.toolsets: [all]   — enables every read toolset EXCEPT
#                                `dependabot` (which requires the
#                                `vulnerability-alerts: read` permission we
#                                do not grant)
#   - bash: true               — AWF-sandboxed shell, required for Stage A/D
#                                deterministic scripts (`prefetch-ep-feeds.sh`,
#                                `resolve-analysis-dir.sh`, etc.)
#   - edit                     — explicit file-edit tool (analysis artifact
#                                authoring)
#   - web-fetch                — fallback HTTP fetch for EP / IMF / WB pages
#                                when MCP misses or is unavailable
#   - agentic-workflows: true  — workflow introspection (audit + log analysis
#                                tools); used by Stage E to validate the run
#   - cache-memory             — restores partial analysis + fetched data
#                                from prior runs so a failed safe-outputs PR
#                                call does not lose Stage A/B work; the
#                                compiler auto-injects restore/save steps
#                                using the workflow-scoped key
#
# To call this shared file from an article workflow, add to `imports:`:
#   - uses: shared/config/news-tools.md
#     with:
#       slug: <article-type-slug>     # e.g. "breaking"
#
# Drift-guard: test/unit/agentic-workflows-threat-detection.test.js asserts
# every article workflow imports this file and does not re-inline the tools
# block.

import-schema:
  slug:
    type: string
    required: true
    description: Article-type slug used to scope the cache-memory key (per-workflow cache namespace prevents Stage A/B artifact cross-contamination between concurrent runs).

tools:
  timeout: 180
  startup-timeout: 180
  github:
    toolsets:
      - all
  bash: true
  edit:
  web-fetch:
  agentic-workflows: true
  cache-memory:
    key: news-${{ github.aw.import-inputs.slug }}-${{ github.repository_owner }}
    retention-days: 7
    allowed-extensions: [".md", ".json", ".jsonl", ".txt", ".html"]
---
