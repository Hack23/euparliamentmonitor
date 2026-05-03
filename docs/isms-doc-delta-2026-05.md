<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# 🧾 ISMS Documentation Delta Audit — May 2026

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-05-03 (UTC) | **📦 Release:** v0.8.54
**🔄 Review Cycle:** Per refresh | **🏷️ Classification:** Public

> **Scope.** This audit captures the drift found in the ISMS-required architecture, workflow, security and FUTURE_*.md document set as of 2026-05-03, against the authoritative current state of the codebase (`package.json` v0.8.54, 14 article workflows + `news-translate.md` = 15, gh-aw `v0.71.3`, EP MCP `v1.2.20`, AWS S3/CloudFront primary + GitHub Pages fallback). It is the source of truth for the ensuing refresh phases.

## 🧭 Authoritative current state (2026-05-03)

| Fact | Value | Source |
|---|---|---|
| Platform release | `v0.8.54` | `package.json` |
| Node engine | `>=25` | `package.json#engines` |
| EP MCP server | `1.2.20` | `package.json#dependencies` |
| gh-aw CLI | `v0.71.3` | `.github/workflows/compile-agentic-workflows.yml` (`GH_AW_VERSION`) |
| Article workflows | **14** unified `news-<slug>.md` + 1 `news-translate.md` = **15** | `.github/workflows/news-*.md` |
| Article slugs (14) | `breaking`, `week-ahead`, `week-in-review`, `month-ahead`, `month-in-review`, `quarter-ahead`, `quarter-in-review`, `year-ahead`, `year-in-review`, `term-outlook`, `election-cycle`, `committee-reports`, `motions`, `propositions` | `src/config/article-horizons.ts` |
| Languages | 14 (EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH) | `src/constants/language-core.ts` |
| Stage flow | A → B (2-pass) → C (completeness gate) → D (2-pass article) → E (single PR) | `.github/prompts/00-scope-and-ground-rules.md`, `04-article-generation.md` |
| PR call hard deadline | minute ≤ 45 of 60-min `timeout-minutes` cap | `src/config/article-horizons.ts` `stageBudgets` |
| Primary delivery | AWS S3 + CloudFront (OIDC federated deploy) | `.github/workflows/deploy-s3.yml`, `runbooks/github-pages-failover.md` |
| Fallback delivery | GitHub Pages | `runbooks/github-pages-failover.md` |
| Analysis artifact dir | `analysis/daily/<YYYY-MM-DD>/<slug>-run<NN>/` with `manifest.json`, `article.md`, `article-meta.json` | `src/aggregator/article-meta.ts`, `article-generator.ts` |

## 📋 Per-document drift table

> Legend — **Status**: 🔄 = needs refresh, ✅ = aligned, ⚠️ = partially aligned (mixed within doc).

### Architecture / data / flow

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `ARCHITECTURE.md` | v1.2 / `v0.8.40` | 2026-04-20 | (1) Top sections show 14/15 workflows correctly, but mid-doc table claims **9 agentic workflows** with `gh-aw v0.69.0+`; (2) component table cites `gh-aw v0.69.0` while repo pin is `v0.71.3`; (3) §"Tooling" table lists `v0.69.0` for gh-aw CLI | CEO | ⚠️ |
| `DATA_MODEL.md` | v1.2 / `v0.8.40` | 2026-04-20 | (1) Revision history claims **8 article types**; (2) `ghAwVersion: "v0.69.0"` in DataPlatform shape; (3) Cross-workflow isolation note still refers to retired `news-weekly-review-analysis.md` / `news-monthly-review-analysis.md` | CEO | 🔄 |
| `FLOWCHART.md` | v1.2 / `v0.8.40` | 2026-04-20 | (1) Opening paragraph claims **9 news workflows** and lists only 8 article slugs; (2) gh-aw compile note pinned to `v0.69.0`; (3) horizon coverage missing `quarter-/year-/term-/election-cycle` slugs | CEO | 🔄 |
| `STATEDIAGRAM.md` | v1.2 / `v0.8.40` | 2026-04-20 | (1) Mentions 14 article types but metadata still says `v0.8.40`; (2) Stage A→E budgets reference older 22–28 min envelope without per-slug budget link to `article-horizons.ts`; (3) PR deadline boundary not surfaced as minute ≤ 45 | CEO | ⚠️ |
| `MINDMAP.md` | v1.2 / `v0.8.40` | 2026-04-20 | (1) Body still labels `15 agentic news workflows` next to `gh-aw v0.69.0` (mixed truth); (2) revision history rows 1.2/1.3 enshrine the obsolete "8 article types / 9 workflows" claim; (3) `GH_AW_VERSION v0.69.0 (pinned)` callout — actual is `v0.71.3` | CEO | ⚠️ |

### Strategic / cross-cutting

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `SWOT.md` | v1.1 / `v0.8.40` | 2026-04-20 | (1) "8 article types" enumeration omits the 6 long-horizon types added Q2 2026; (2) "9 unified gh-aw workflows" inventory; (3) revision history v1.1 line claims 1894 articles — current state is ≥ 1927 from `SECURITY_ARCHITECTURE.md` | CEO | 🔄 |

### Security / compliance

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `SECURITY_ARCHITECTURE.md` | v2.1 / `v0.8.40` | 2026-04-20 | (1) Opening summary states **8 article types / 9 unified gh-aw agentic workflows**; (2) §"News generation workflows" lists 10 workflow names including the **deleted** `news-article-generator.md`; (3) gh-aw 5-layer model wording does not name the **shell-safety filter** parameter-transformation forbidden patterns from `00-scope-and-ground-rules.md §47` | CEO | 🔄 |
| `THREAT_MODEL.md` | v2.1 / `v0.8.40` | 2026-04-20 | (1) STRIDE row claims gh-aw break "halts 9 agentic workflows" — should be 14 article + 1 translate; (2) No explicit STRIDE row for shell-safety filter bypass; (3) MITRE ATT&CK mappings not refreshed for lock-file tampering / parameter-transformation injection | CEO | 🔄 |
| `CRA-ASSESSMENT.md` | v2.1 / `v0.8.40` | 2026-04-20 | (1) "Purpose" line states **18 gh-aw workflows (8 split-pair + generator + translator)** — entirely obsolete; (2) Dependabot/SBOM section pins `GH_AW_VERSION=v0.69.0`; (3) Lock-file recompilation policy not surfaced (must `gh aw compile` after Dependabot bumps; never merge `.lock.yml` directly) | CEO | 🔄 |
| `CLASSIFICATION.md` | v1.1 / — | 2026-02-25 | (1) Metadata is February — needs refresh footer only (scope/classification levels themselves unchanged — preserve verbatim); (2) Add ISMS-PUBLIC policy footer; (3) No content drift on data classes | CEO | ⚠️ |

### Operations / continuity / finance

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `WORKFLOWS.md` | v4.1 / `v0.8.40` | 2026-04-20 | (1) §"News generation workflows" explanatory blurb says "9 content workflows + 1 translation workflow"; (2) `news-breaking-{analysis,article}.md` example row references **deleted** split-pair files; (3) Compile workflow row pins gh-aw to `v0.69.3` — actual is `v0.71.3` | CEO | 🔄 |
| `BCPPlan.md` | v2.1 / `v0.8.40` | 2026-04-20 | (1) Scenario 11 names "10 agentic news workflows" with stale slug list (still includes `article-generator multi-type`); (2) gh-aw pin in mitigation = `v0.69.0`; (3) Asset criticality table uses `gh-aw v0.69.0` | CEO | 🔄 |
| `FinancialSecurityPlan.md` | v2.1 / `v0.8.40` | 2026-04-20 | (1) Cost narrative cites **8 article types** + 1894 articles; (2) "10 agentic news workflows" budget assumption; (3) Compile-gate reference pins `v0.69.0` | CEO | 🔄 |
| `End-of-Life-Strategy.md` | v2.2 / `v0.8.40` | 2026-04-20 | (1) Tooling table pins gh-aw at `v0.69.0`; (2) §"Workflow EOL" pins compile to `v0.69.0`; (3) Mermaid lifecycle diagram embeds `gh-aw v0.69.0` | CEO | 🔄 |

### Future-state set (Phase 3 scope)

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `FUTURE_ARCHITECTURE.md` | — | — / 2026-03-19-ish | (1) Re-baseline against refreshed `ARCHITECTURE.md`; (2) Future deltas should focus on **post-aggregator** items (e.g., Lambda-on-Edge personalisation, EP MCP v1.3, Stage-F translation auto-trigger); (3) Drop already-shipped items now in current state | CEO | 🔄 |
| `FUTURE_DATA_MODEL.md` | — | 2026-03-19-ish | Same — restate deltas on top of refreshed `DATA_MODEL.md` (ADR-007 horizon registry already shipped) | CEO | 🔄 |
| `FUTURE_FLOWCHART.md` | — | 2026-03-19-ish | Same — Stage A→E spine is current state; future items: Stage-F translation auto-trigger, evidence-bundle attestation | CEO | 🔄 |
| `FUTURE_MINDMAP.md` | — | 2026-03-19-ish | Same — adopt Q2-2026 Look-Ahead set as baseline; future = Stage-F + multi-region S3 | CEO | 🔄 |
| `FUTURE_SECURITY_ARCHITECTURE.md` | — | 2026-03-19-ish | Future delta = post-`v0.71.3` gh-aw (egress-allowlist split, AWS verified-permissions integration); the 5-layer model is current state | CEO | 🔄 |
| `FUTURE_STATEDIAGRAM.md` | — | 2026-03-19-ish | Same — current state already supports Stage A→E in 60-min unified session | CEO | 🔄 |
| `FUTURE_SWOT.md` | — | 2026-03-19-ish | Same — re-baseline T/O quadrants against the long-horizon expansion now shipped | CEO | 🔄 |
| `FUTURE_THREAT_MODEL.md` | — | 2026-03-19-ish | Same — add prompt-injection-via-translation-helper as future threat (mitigated by Stage-F gating) | CEO | 🔄 |
| `FUTURE_WORKFLOWS.md` | v4.0 / — | 2026-03-31 | gh-aw ≥ `v0.69.3` is now baseline; future = `v0.72+` Lambda-runner experiment, Stage-F auto-translate fan-out | CEO | 🔄 |

### Operational docs (Phase 4 scope)

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `Article-Generation.md` | v1.0 | 2026-04-25 | Mostly current; refresh metadata + cross-link to `src/config/article-horizons.ts` long-horizon entries; add minute ≤ 45 PR deadline | CEO | ⚠️ |
| `LOOK_AHEAD_DATA_FLOW.md` | — | — | Add metadata header; align to current 5-stage flow; cite `forward-projection-methodology.md` | CEO | 🔄 |
| `WEEK_AHEAD_DATA_FLOW.md` | — | — | Add metadata header; align to D-36/D-8 reporting window | CEO | 🔄 |

### README

| Doc | Version (stated) | Last Updated (stated) | Top 3 deltas | Owner | Status |
|---|---|---|---|---|---|
| `README.md` | — | — | Already references 14 article types + `news-translate`. Verify version badges / quick-start / `npm run …` script set match `package.json` v0.8.54 | CEO | ⚠️ |

## 🛠️ Refresh policy applied in Phases 2–6

- **Metadata-only changes** for docs marked ⚠️: bump `📦 Release` / `📅 Last Updated` / `⏰ Next Review` and rewrite only the drifted lines.
- **Targeted content edits** for docs marked 🔄: surgical `edit` calls on the specific stale paragraphs / tables identified above; preserve untouched sections verbatim.
- **No classification changes** — `🏷️ Classification` levels are preserved as-is.
- **No structural diagram regeneration** unless a Mermaid diagram embeds an objectively wrong fact (e.g., `9 workflows` count or `gh-aw v0.69.0` pin).
- **ISMS-PUBLIC footer** added to every refreshed doc, linking to the relevant `https://github.com/Hack23/ISMS-PUBLIC/blob/main/<Policy>.md` page (mapped in `docs/isms-doc-index.md`).

## 🔗 Related ISMS-PUBLIC policies

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — overarching ISMS framing
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — documentation requirements
- [Compliance Checklist](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Compliance_Checklist.md) — review cadence
- [CLASSIFICATION](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) — classification framework
