---
articleType: breaking
runId: 191
date: 2026-04-20
---

# 📂 Analysis Index — Breaking Run 191 (2026-04-20)

## Run Metadata

| Field | Value |
|-------|-------|
| Run ID | 191 |
| Date | 2026-04-20 (Easter Monday) |
| Recess Day | 8 (of 13, April 14-26) |
| API Outage Day | 11 |
| Article Generated | NO (analysis-only) |
| Significance Score | 16/50 |

## Artifact Registry

### Classification
- [`classification/significance-scoring.md`](../classification/significance-scoring.md)
  - Composite significance scoring (16/50)
  - Forward monitoring priorities
  - Newsworthiness gate decision

### Risk Scoring
- [`risk-scoring/risk-matrix.md`](../risk-scoring/risk-matrix.md)
  - 12-item risk register across 4 categories
  - Quadrant visualisation
  - Trend indicators vs prior runs

- [`risk-scoring/quantitative-swot.md`](../risk-scoring/quantitative-swot.md)
  - Full SWOT with 4 items per quadrant
  - All items ≥80 words with evidence
  - Confidence levels documented

### Threat Assessment
- [`threat-assessment/political-threat-landscape.md`](../threat-assessment/political-threat-landscape.md)
  - Threat classification matrix
  - USTR Section 301 deep analysis
  - Coalition risk vectors
  - Gantt timeline (April 20-30)

### Intelligence
- [`intelligence/coalition-dynamics.md`](../intelligence/coalition-dynamics.md)
  - Grand Centre stability: 84/100
  - Alliance signals
  - Post-recess risk vectors

- [`intelligence/cross-run-diff.md`](../intelligence/cross-run-diff.md)
  - Run 190 → Run 191 delta analysis
  - Hypothesis status updates (H1-H4)
  - Probability distribution revision

- [`intelligence/synthesis-summary.md`](../intelligence/synthesis-summary.md) ← **MASTER DOCUMENT**
  - 5 headline intelligence signals
  - Updated probability model
  - Stakeholder intelligence
  - Forward monitoring calendar (7 items)

### Documents
- [`documents/document-analysis-index.md`](../documents/document-analysis-index.md)
  - Full corpus: 22 texts (18 from March 26 + 4 restored)
  - Content availability status table
  - API call efficiency log

## Feed Endpoint Status (Run 191)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `get_plenary_sessions` | ✅ OK | Health gate passed |
| `get_adopted_texts(year:2026)` | ✅ OK | Returns 104 items |
| `get_adopted_texts_feed(today)` | ⚠️ DEGRADED | Returns EP8/2019 data |
| `get_adopted_texts_feed(one-week)` | ✅ OK | 203 items mixed |
| `get_meps_feed` | ✅ OK | Large dataset |
| `analyze_coalition_dynamics` | ⚠️ PARTIAL | EPP memberCount=0 (known gap) |
| `get_events_feed` | ❌ SKIPPED | Tier-2 outage |
| `get_procedures_feed` | ❌ SKIPPED | Tier-2 outage |
| `get_parliamentary_questions_feed` | ❌ SKIPPED | Tier-2 outage |
| `get_all_generated_stats` | ✅ OK | Historical context retrieved |

## Run Comparison Table

| Run | Date | Score | Article | API Count | Key Finding |
|-----|------|-------|---------|-----------|-------------|
| 188 | 2026-04-18 | ~14 | NO | 104 | Recess begins |
| 189 | 2026-04-19 | ~14 | NO | 101 | First regression |
| 190 | 2026-04-20 | 15 | NO | 100 | Second regression, same day |
| **191** | **2026-04-20** | **16** | **NO** | **104** | **Metadata restored** |

## Quality Gates Status

- [x] 7 standard analysis artifacts present
- [x] Cross-run diff documented
- [x] SWOT items ≥80 words each
- [x] Forward monitoring ≥5 items
- [x] Data quality delta section present
- [x] Zero `[AI_ANALYSIS_REQUIRED]` markers
- [x] ELAPSED_MINUTES footer in synthesis
- [x] API endpoint status table present
- [x] Significance scoring ≤20% of analysis-only threshold exceeded
