<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EP Breaking News: April 28–30, 2026

**Generated:** 2026-04-30T07:24:00Z | **Run:** breaking-2026-04-30  
**Classification:** PUBLIC

---

## Workflow Parameters

| Parameter | Value |
|-----------|-------|
| Workflow | `news-breaking.md` (unified) |
| Run ID | `breaking-run-1777532537` |
| TODAY | 2026-04-30 |
| WORKFLOW_START_EPOCH | 1777532537 |
| ANALYSIS_DIR | `analysis/daily/2026-04-30/breaking/` |
| Engine | Claude Sonnet (GitHub Copilot) |
| Timeout | 45 minutes |

---

## Stage Execution Audit

| Stage | Planned Budget | Status | Issues |
|-------|---------------|--------|--------|
| A: Data Collection | ≤ 4 min | ✅ COMPLETE | Events feed unavailable; fallback used |
| B: Analysis Pass 1 | ≤ 12 min | 🔄 IN PROGRESS | Context compaction mid-run; resumed |
| B: Analysis Pass 2 | ≥ 4 min | ⏳ PENDING | Scheduled after Pass 1 complete |
| C: Completeness Gate | ≤ 3 min | ⏳ PENDING | |
| D: Article Render | ≤ 2 min | ⏳ PENDING | |
| E: PR Creation | ≤ 2 min | ⏳ PENDING | |

---

## Known Issues This Run

1. **Context compaction at ~8 min elapsed:** Agent context was compacted mid-Stage B Pass 1 after creating 8 intelligence artifacts. Run resumed from summary with correct state.
2. **Events feed unavailable:** `get_events_feed(today)` returned API error in body; fallback to `get_adopted_texts_feed(one-week)` used.
3. **Procedures feed RECESS_MODE:** Returned 1972–1980 historical archive; not usable for current procedures.
4. **Voting records empty:** 4–6 week EP API publication delay; proxy analysis used.
5. **TA-10-2026-0146 document 404:** Newly published April 30 text not yet accessible via direct EP API lookup.

---

## MCP Tool Reliability Summary

See `intelligence/mcp-reliability-audit.md` for full tool call registry.  
**Summary:** 23 MCP calls made in Stage A; 4 endpoints degraded or unavailable; data collection successful via fallback sources.

---

## Elapsed Time Audit

| Checkpoint | Elapsed (min est.) | Action |
|-----------|-------------------|--------|
| Workflow start | 0 | WORKFLOW_START_EPOCH set |
| Stage A complete | ~4 | All primary feeds called |
| Context compaction | ~8 | Resumed from summary |
| Stage B Pass 1 resumption | ~11 | Artifact creation continuing |
| Pass 2 target | ~16 | Planned |
| Stage C target | ~19–22 | Planned |
| PR deadline | ≤ 25 | Hard deadline |

---

*Classification: PUBLIC.*
