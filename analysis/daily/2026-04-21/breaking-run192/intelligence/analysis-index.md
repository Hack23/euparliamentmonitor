---
articleType: breaking
runId: 192
date: 2026-04-21
analysisPhase: full
recessDay: 8
apiOutageDay: 12
seriesRun: 14
mode: ANALYSIS_ONLY
---

# Analysis Index — EP Breaking News Run 192 (April 21, 2026)

**Generated**: 2026-04-21T01:26:00Z
**Run ID**: 192
**Analysis Dir**: `analysis/daily/2026-04-21/breaking-run192/`
**Mode**: ANALYSIS_ONLY (newsworthiness gate FAILED — Parliament in Easter recess until April 27)
**Series**: Run 14 of Easter Recess Intelligence Series (Runs 179–192)

## Key Context

Today is **Tuesday, April 21, 2026** — the first working day after Easter Monday. The European Parliament remains on Easter recess until **April 27 (Strasbourg plenary)**. No breaking news events occurred today. This analysis continues the cross-run intelligence accumulation series initiated on April 14 (Easter Monday) when recess began.

### Critical Intelligence for Today

1. **USTR Section 301 Annual Review Window Opens TODAY** — The US Trade Representative's statutory review period for Section 301 tariff actions began April 21. No formal notice has been detected in EP API feeds. Probability of formal Section 301 notice targeting EU sectors this week: 20% (maintained from prior runs).

2. **EP API Tier-2 Content Outage: Day 12** — Phase 1 (metadata restoration to 104 texts) confirmed April 20 (Run 191). Phase 2 (content restoration: TA-10-2026-0087 through TA-10-2026-0104) has NOT occurred as of April 21 08:00 UTC. All 18 March 26 texts return 404.

3. **Parliament Returns in 6 Days** — April 27-30 Strasbourg plenary confirmed in EP API (MTG-PL-2026-04-27 through MTG-PL-2026-04-30). Agenda: 0 items (not yet published). Expected publication: April 22-23.

4. **March 26 Roll-Call Votes: T+26 Days Overdue** — EP standard publication window is ~3 weeks. Votes should appear any day, enabling coalition behaviour analysis for Banking Union and Trade texts.

## Analysis Files in This Run

| File | Category | Lines | Status |
|------|----------|-------|--------|
| `intelligence/analysis-index.md` | Navigation | ~80 | ✅ |
| `intelligence/synthesis-summary.md` | Synthesis | ~300 | ✅ |
| `intelligence/cross-run-diff.md` | Cross-run | ~200 | ✅ |
| `intelligence/stakeholder-map.md` | Stakeholders | ~300 | ✅ |
| `intelligence/scenario-forecast.md` | Scenarios | ~200 | ✅ |
| `risk-scoring/quantitative-swot.md` | SWOT | ~400 | ✅ |
| `risk-scoring/risk-matrix.md` | Risk | ~250 | ✅ |
| `classification/significance-scoring.md` | Classification | ~200 | ✅ |
| `existing/coalition-dynamics.md` | Coalition | ~200 | ✅ |
| `manifest.json` | Manifest | — | ✅ |

## Data Sources Accessed

| Tool | Status | Data Returned |
|------|--------|--------------|
| `get_all_generated_stats` | ✅ Working | 2004–2026 statistics |
| `get_adopted_texts_feed` (today) | ⚠️ Empty | 0 items (recess) |
| `get_adopted_texts_feed` (one-week) | ✅ Working | 203 items (historical) |
| `get_adopted_texts` (offset 89, 2026) | ✅ Working | 104 total (stable) |
| `get_events_feed` | ❌ Error | Tier-2 outage |
| `get_procedures_feed` | ❌ Error | Tier-2 outage |
| `get_meps_feed` | ✅ Working | Large dataset |
| `get_documents_feed` | ❌ Error | Tier-2 outage |
| `get_committee_documents_feed` | ❌ Error | Tier-2 outage |
| `get_parliamentary_questions_feed` | ❌ Error | Tier-2 outage |
| `get_speeches` (Easter recess) | ✅ Working | 0 speeches |
| `get_voting_records` | ✅ Working | 0 records (delay) |
| `get_plenary_sessions` (2026) | ✅ Working | 20 sessions confirmed |
| `analyze_coalition_dynamics` | ✅ Working | Structural data only |
| `get_meeting_decisions` (Mar 26) | ✅ Working | 124 decisions |
| Content probe TA-0087, 0090, 0097, 0098, 0101 | ❌ All 404 | Content unavailable |
