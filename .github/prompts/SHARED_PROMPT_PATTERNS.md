<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# SHARED_PROMPT_PATTERNS.md — Redirect

The former 1,789-line monolith has been decomposed into ten focused prompt
files. See the new index:

➡️ **[`README.md`](README.md)** — prompt library index and import order.

| Old section | New file |
|---|---|
| Scope restriction, forbidden practices, neutrality | [`00-scope-and-ground-rules.md`](00-scope-and-ground-rules.md) |
| Data collection, feeds + direct fallbacks, deep-fetch, IMF (primary economic) / WB (non-economic) | [`01-data-collection.md`](01-data-collection.md) |
| Analysis protocol, methodologies + templates, 2-pass rule | [`02-analysis-protocol.md`](02-analysis-protocol.md) |
| Completeness-gate validator, pre-flight checklist | [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) |
| Article depth gates, title/description/keywords rules | [`04-article-generation.md`](04-article-generation.md) |
| AI-First contract (AI_MARKER sentinels, per-type inputs) | [`05-analysis-to-article-contract.md`](05-analysis-to-article-contract.md) |
| Single-PR rule, analysis-only fallback, noop diagnostics | [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) |
| EP/WB/IMF MCP tool tables, parameter corrections, reliability matrix | [`07-mcp-reference.md`](07-mcp-reference.md) |
| Frontmatter, mcp-setup.sh, EP MCP client activation | [`08-infrastructure.md`](08-infrastructure.md) |
| AWF firewall diagnostic, error → root-cause table | [`09-troubleshooting.md`](09-troubleshooting.md) |

**What changed:**

- The ambiguous multi-PR / "checkpoint PR" / "keep-alive" / "progressive safe
  output" patterns are **banned** for every article-generating workflow.
  `news-translate.md` is the one exception.
- CI lint (`scripts/lint-prompts.js`) enforces the banned-phrase list.
- Every workflow now has a fixed stage order: A · Data → B · Analysis (2 pass)
  → C · Completeness Gate → D · Article (2 pass) → Single PR.

See [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) for the single-PR
rule rationale.
