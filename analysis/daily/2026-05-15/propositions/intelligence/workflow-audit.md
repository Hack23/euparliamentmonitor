# Workflow Audit — EU Parliament Propositions 2026-05-15

## 🔍 Run Audit Summary

| Metric | Value | Status |
|--------|-------|--------|
| Run ID | propositions-run264-1778825897 | — |
| Workflow | news-propositions | — |
| Agent | GitHub Copilot (Claude Sonnet 4.6) | — |
| Session start | 2026-05-15T06:18 UTC | — |
| Stage A EP MCP calls | 5 | ✅ At budget cap |
| Stage B artifacts written (Pass 1) | 22+ | ✅ Progress |
| Stage B pass 2 | In progress | ⏳ |
| Data quality | SEVERELY DEGRADED | 🔴 |
| Primary data source | get_adopted_texts | ✅ |
| IMF data | Knowledge base (no SDMX call) | 🟡 |
| Elapsed at Stage B midpoint | ~16 min | ✅ On schedule |

## 📋 EP MCP Call Log

| # | Tool | Parameters | Result | Quality |
|---|------|-----------|--------|---------|
| 1 | `get_procedures_feed` | timeframe: "one-week" | 🔴 DEGRADED: 1972-87 data | Historical only |
| 2 | `get_adopted_texts` | year: 2026, limit: 50 | 🟢 SUCCESS: 51 items | Primary data |
| 3 | `get_procedures` | limit: 20 | 🔴 DEGRADED: same historical | Unusable |
| 4 | `monitor_legislative_pipeline` | status: "ACTIVE" | 🔴 EMPTY: 0 procedures | No data |
| 5 | `get_latest_votes` | limit: 30 | 🔴 UNAVAILABLE: May dates | No data |

**Budget exhausted: 5/5 calls used. No more EP MCP calls in this run.**

## 🏗️ Analysis Architecture

**Artifact completion tracking:**

| Artifact | Status | Lines (est.) |
|---------|--------|-------------|
| executive-brief.md | ✅ | ~200 |
| intelligence/analysis-index.md | ✅ | ~100 |
| intelligence/synthesis-summary.md | ✅ | ~160 |
| intelligence/historical-baseline.md | ✅ | ~120 |
| intelligence/economic-context.md | ✅ | ~120 |
| intelligence/pestle-analysis.md | ✅ | ~180 |
| intelligence/stakeholder-map.md | ✅ | ~200 |
| intelligence/scenario-forecast.md | ✅ | ~180 |
| intelligence/threat-model.md | ✅ | ~160 |
| intelligence/wildcards-blackswans.md | ✅ | ~180 |
| intelligence/mcp-reliability-audit.md | ✅ | ~200 |
| intelligence/reference-analysis-quality.md | ✅ | ~140 |
| risk-scoring/risk-matrix.md | ✅ | ~100 |
| risk-scoring/quantitative-swot.md | ✅ | ~100 |
| intelligence/coalition-dynamics.md | ✅ | ~145 |
| intelligence/voting-patterns.md | ✅ | ~150 |
| intelligence/significance-scoring.md | ✅ | ~50 |
| intelligence/forward-projection.md | ✅ | ~65 |
| intelligence/cross-run-diff.md | ✅ | ~45 |
| risk-scoring/political-capital-risk.md | ✅ | ~30 |
| risk-scoring/legislative-velocity-risk.md | ✅ | ~30 |
| classification/significance-classification.md | ✅ | ~30 |
| classification/actor-mapping.md | ✅ | ~45 |
| classification/forces-analysis.md | ✅ | ~50 |
| classification/impact-matrix.md | ✅ | ~40 |
| threat-assessment/political-threat-landscape.md | ✅ | ~90 |
| threat-assessment/actor-threat-profiles.md | ✅ | ~60 |
| threat-assessment/consequence-trees.md | ✅ | ~65 |
| threat-assessment/legislative-disruption.md | ✅ | ~40 |
| documents/document-analysis-index.md | ✅ | ~55 |
| existing/pipeline-health.md | ✅ | ~100 |
| extended/media-framing-analysis.md | ⏳ | TBD |
| intelligence/methodology-reflection.md | ⏳ | TBD (LAST) |

---

*Workflow Audit v1.0 | 2026-05-15 | EU Parliament Monitor | Apache-2.0*
