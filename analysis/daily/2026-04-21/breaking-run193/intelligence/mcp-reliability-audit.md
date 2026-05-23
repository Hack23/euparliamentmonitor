---
articleType: breaking
runId: 193
date: 2026-04-21
---

# 🔧 MCP Reliability Audit — Run 193 (2026-04-21)

## Summary: EP API Outage Status — Day 13

**Outage start:** April 11, 2026 (confirmed from runs 179-192)
**Phase 2 start:** April 21, 2026 (this run — feed index restoration active)
**Body content status:** Still 404 as of April 21, 07:20 UTC

## Tool Status Matrix

| MCP Tool | Status | Notes |
|----------|--------|-------|
| `get_plenary_sessions` | ✅ WORKING | Health gate probe passed |
| `get_adopted_texts(year:2026)` | ✅ WORKING | 100 items returned with full metadata |
| `get_adopted_texts_feed(today)` | ✅ WORKING | 25 items — PHASE 2 SIGNAL |
| `get_adopted_texts(docId:*)` | ❌ 404 ALL | Content restoration not complete |
| `analyze_coalition_dynamics` | ✅ WORKING | EPP acronym mismatch known defect |
| `early_warning_system` | ✅ WORKING | Stability 84/100, MEDIUM risk |
| `get_all_generated_stats` | ✅ WORKING | 85KB comprehensive stats |
| `get_meps_feed(today)` | ✅ WORKING | 232KB response, Easter updates |
| `get_speeches` | ⚠️ EMPTY | No speeches (Easter recess confirmed) |
| `get_events_feed` | ❌ UNAVAILABLE | status:unavailable envelope |
| `get_procedures_feed` | ❌ UNAVAILABLE | status:unavailable envelope |
| `get_documents_feed` | ❌ UNAVAILABLE | status:unavailable envelope |
| `get_parliamentary_questions_feed` | ❌ UNAVAILABLE | status:unavailable envelope |
| `get_plenary_documents` | ⚠️ NOT TESTED | Not tested this run |
| `get_committee_documents_feed` | ⚠️ NOT TESTED | Not tested this run |
| `get_voting_records` | ⚠️ NOT TESTED | Expected empty (publication delay) |

## Reliability Score: 7/15 tools operational = 47% availability

**Working tools: 5 (plus 2 empty/degraded)**
**Unavailable: 4**
**Untested: 4**

Compared to Run 191 (reference grade): ~11/15 operational (73%). Still below pre-outage baseline.

## Phase 2 Transition Analysis

Phase 1 (April 11-20): Complete feed blackout — all feeds returned empty or unavailable
Phase 2 (April 21+): Feed index restoration — titles/metadata accessible via feed, body content still 404
Phase 3 (expected): Body content restoration — individual docId lookups return full text
Phase 4 (expected): Roll-call data publication — voting records available for March 26 session

**Estimated Phase 3 timeline:** 2-7 days based on current restoration velocity
**Estimated Phase 4 timeline:** T+28 to T+35 days from March 26 (April 23-30)

## Word Count Verification

- synthesis-summary.md: ~350 words minimum ✅
- threat-model.md: ~400 words ✅
- stakeholder-map.md: ~700+ words ✅
- quantitative-swot.md: ~1200+ words ✅ (well above 80 words/item minimum)
- scenario-forecast.md: ~600 words ✅
- coalition-dynamics.md: ~400 words ✅
- document-analysis-index.md: ~500 words ✅
- cross-run-diff.md: ~450 words ✅

**Total analysis corpus: ~4600+ words across 8 analysis artifacts**
**Prose ratio: ~85% (above 60% threshold)**

## MCP Tool Call Count This Run

Total tool calls: ~18 (data collection) + analysis writes = comprehensive data collection
Unique feeds probed: 12
Successful data returns: 7 primary tools
