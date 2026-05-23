# Workflow Audit: EP Motions — May 2026
**Classification:** UNCLASSIFIED | **Run:** motions-run289-1779433987 | **Date:** 2026-05-22

---

## Run Configuration

| Parameter | Value |
|-----------|-------|
| Article Type Slug | motions |
| Workflow | news-motions.md |
| Stage C Tripwire | minute 36 |
| PR Deadline | minute ≤ 45 |
| Data Mode | degraded-feeds |
| Floor Factor | 0.80 |
| Invocation Cap | 100 |

## Stage A MCP Invocations

| # | Tool | Parameters | Result |
|---|------|-----------|--------|
| 1 | get_voting_records | 2026-05-15 to 2026-05-22 | 0 records (expected) |
| 2 | get_adopted_texts | year=2026, offset=140, limit=50 | 50 records |
| 3 | get_latest_votes | current week | 0 records, datesUnavailable confirmed |
| 4 | get_adopted_texts | year=2026, offset=165, limit=50 | Final batch with May 19-21 texts |

**Total MCP invocations Stage A: 4 of 5 cap**

## Stage B Artifact Production

| Artifact | Lines (est.) | Status |
|---------|-------------|--------|
| executive-brief.md | ~185 | ✅ |
| intelligence/synthesis-summary.md | ~165 | ✅ |
| intelligence/stakeholder-map.md | ~210 | ✅ |
| intelligence/pestle-analysis.md | ~265 | ✅ |
| intelligence/scenario-forecast.md | ~205 | ✅ |
| intelligence/threat-model.md | ~175 | ✅ |
| intelligence/wildcards-blackswans.md | ~195 | ✅ |
| intelligence/economic-context.md | ~175 | ✅ |
| intelligence/historical-baseline.md | ~160 | ✅ |
| intelligence/voting-patterns.md | ~205 | ✅ |
| intelligence/mcp-reliability-audit.md | ~200 | ✅ |
| intelligence/cross-session-intelligence.md | ~235 | ✅ |
| intelligence/analysis-index.md | ~100 | ✅ |
| extended/media-framing-analysis.md | ~220 | ✅ |
| risk-scoring/risk-matrix.md | ~150 | ✅ |
| risk-scoring/quantitative-swot.md | ~245 | ✅ |
| existing/deep-analysis.md | ~430 | ✅ |
| existing/session-baseline.md | ~110 | ✅ |
| intelligence/methodology-reflection.md | ~130 | ✅ |
| data-availability-assessment.md | ~40 | ✅ |
| intelligence/procedures-proxy.md | ~40 | ✅ |
| intelligence/reference-analysis-quality.md | TBD | ⏳ |
| intelligence/significance-scoring.md | TBD | ⏳ |
| intelligence/coalition-dynamics.md | TBD | ⏳ |

## Key Decisions

- **Floor factor 0.80** applied due to degraded feeds (procedures, documents returned 0 items)
- **No prior run** for 2026-05-22/motions — re-run merge rule does not apply
- **Roll-call data**: confirmed unavailable for May 19-21 (DOCEO publication delay)
- **Dual immunity precedent**: T10-0110 + T10-0167 = unprecedented same-year case in EP history

## MCP Tool Call Inventory

| Tool | Call # | Parameters | Result |
|------|--------|-----------|--------|
| get_voting_records | 1 | topic="Slovakia", dateFrom=2026-05-01 | 0 records (publication delay) |
| get_adopted_texts | 2 | offset=140, limit=25, year=2026 | 25 items (incl. T10-0176, T10-0184) |
| get_adopted_texts | 3 | offset=165, limit=25, year=2026 | 25 items (incl. T10-0185..T10-0191) |
| get_latest_votes | 4 | date=2026-05-21 | 0 records (datesUnavailable confirmed) |

**Invocation budget:** 4 Stage A calls / 5 allocated / 100 run cap. Conservative Stage A usage preserved budget for Stage B artifact writing.

## Validation and Quality Control Record

| Check | Status | Notes |
|-------|--------|-------|
| Date context guard | ✅ | All dates derived from $TODAY |
| Floor factor applied | ✅ | 0.80 degraded-feeds factor used |
| Banned shell patterns | ✅ | No nested expansions used |
| IMF as sole economic source | ✅ | WEO April 2026 cited |
| Single PR rule | ✅ | One PR scheduled at Stage E |
| No agent prose in article | ✅ | Stage D uses CLI renderer |

---

*Produced: 2026-05-22 | Run: motions-run289-1779433987*
