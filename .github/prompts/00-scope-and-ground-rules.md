<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 00 — Scope and Ground Rules

**Summary:** Where you may write. What you may not touch. Political neutrality.
The single-PR rule. No shortcuts.

## 1 · Workspace Scope

News-generating workflows write ONLY to these directories:

| Directory | Purpose | Which workflow family |
|-----------|---------|------------------------|
| `news/` | Article HTML files | `news-<type>-article.md` only |
| `analysis/daily/` | Analysis artifacts (`.md`, `manifest.json`) | `news-<type>-analysis.md` (writes) + `news-<type>-article.md` (reads, optional top-up) |
| `/tmp/gh-aw/repo-memory/default/memory/news-generation/` | Cross-run editorial memory | both |

**Split-workflow scope guardrails:**

- `news-<type>-analysis.md` MUST edit only `analysis/**`. It may not touch `news/**`.
- `news-<type>-article.md` MUST edit only `news/**`, plus append-only updates to `analysis/daily/${DATE}/${TYPE}/manifest.json.history[]` and `analysis/daily/${DATE}/${TYPE}/data/` (Stage-A top-up).

## 1b · Stable Same-Day Analysis Folder (canonical path)

Every analysis workflow writes to the deterministic path:

```
analysis/daily/${DATE}/${ARTICLE_TYPE_SLUG}/
```

No `run*` suffix. Repeated runs against the same folder:

- **Upgrade** artifacts still below their `reference-quality-thresholds.json` floor.
- **Carry forward** every artifact that already passed.
- **Append** a new entry to `manifest.json.history[]` (never clobber prior runs).

See `02-analysis-protocol.md` §2 and `08-infrastructure.md` § Stable Folder Layout.

## 2 · Forbidden Modifications

| Path | Rule |
|------|------|
| `.github/` | ❌ Never |
| `index*.html` | ❌ Never (generated separately) |
| `package.json` / `package-lock.json` | ❌ Never |
| `test/`, `e2e/` | ⚠️ Only when tied to a narrow `src/`/`scripts/` fix (see §3) |

## 3 · Conditional Allow — Minor `src/`/`scripts/` Fixes

You MAY patch `src/` or `scripts/` **only** to unblock news generation:

- ✅ Fix a TS compile error that blocks `npm run build`
- ✅ Fix a runtime error in a generator script
- ✅ Add a missing constant/enum causing pipeline failure
- ✅ Correct a wrong language code / URL pattern

**Constraints:** ≤ 20 lines in `src/`+`scripts/`; ≤ 30 lines in `test/`+`e2e/` if
needed to keep suite green; run `npm run build && npm run test` and report both
results in the PR body; no refactors, no renames, no weakened assertions, no new
dependencies, no standalone test-only edits.

## 4 · Forbidden Practices

| Practice | Why |
|----------|-----|
| Python / Ruby / Perl scripts | Use only the Node.js + TypeScript toolchain |
| Dangerous shell expansion: `${var@P}`, `${!var}`, nested `$($(..))`, `$(cmd < file)`, `${var:+...${#other}...}`, adjacent `${RANDOM}${RANDOM}` | Blocked by AWF sandbox — use `if/else` blocks |
| Metadata-only analysis (titles + TA numbers) | Must download FULL document content |
| New standalone helper scripts | Use existing pipeline in `scripts/` |
| Deciding article topic before analysis is complete | Always finish Stage B first |
| Calling `safeoutputs___create_pull_request` more than once | One PR per run — see `06-pr-and-safe-outputs.md` |
| "Checkpoint PR", "keep-alive", "heartbeat", "progressive safe output" | All banned. Lint will fail the build |

## 5 · Political Neutrality

- Objectivity: no partisan conclusions
- Rigor: structured analytic techniques over intuition
- Transparency: explicit confidence levels (🟢 High / 🟡 Medium / 🔴 Low)
- Every claim cites an EP data source or a methodology
- Present competing hypotheses fairly (ACH)

## 6 · Data Ethics (GDPR)

- Only public European Parliament data via MCP tools
- MEPs analysed in their public parliamentary role only
- No psychographic profiling, no private-life analysis
- Attribute every source

## 7 · The Single-PR Rule (one-liner)

> Every article-generating workflow calls `safeoutputs___create_pull_request`
> **exactly once**, at the end, after all files are written. See
> [`06-pr-and-safe-outputs.md`](06-pr-and-safe-outputs.md) for full rationale.

## 8 · Stage Order (non-negotiable)

Split-workflow families run the stages across **two** workflows, each of which
calls `safeoutputs___create_pull_request` exactly once:

```
── Workflow 1: news-<type>-analysis.md (timeout-minutes: 45) ──
Stage A · Data Collection → Stage B · Analysis (2 passes) →
Stage C · Completeness Gate → Analysis PR (single)

── Workflow 2: news-<type>-article.md (timeout-minutes: 45) ──
(triggered by merged analysis PR)
Optional Stage-A top-up → Stage D · Article (2 passes) → Validators → Article PR (single)
```

No article drafting before Stage C exits 0. No PR before every file is staged
for that workflow. The article workflow reads the analysis folder from `HEAD`
of `main` after the analysis PR merges.

## 9 · ISMS Compliance (short)

- **ISO 27001:2022** A.5.10, A.5.12, A.5.23, A.8.11, A.8.28
- **GDPR** data minimization + purpose limitation
- **NIST CSF 2.0** Identify / Protect / Detect / Respond / Recover

Full policies: [ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC).
