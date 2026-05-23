<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EP Motions April–May 2026
**Stage A Data Quality Assessment**
**Analysis Date:** 2026-05-13

---

## Tool Call Summary

| Tool | Status | Records | Quality | Notes |
|------|--------|---------|---------|-------|
| `get_voting_records` | ⚠️ Empty | 0 | N/A | Expected: DOCEO roll-call 4-6 week delay |
| `get_adopted_texts_feed` | ✅ Success | 127 | 🟡 Medium | Metadata only (no full text) |
| `get_latest_votes` | ⚠️ Empty | 0 | N/A | Expected: DOCEO XML empty for current week |
| `get_adopted_texts` (year:2026) | ✅ Success | 51 | 🟢 High | Full records with titles/dates |
| `get_meps_feed` | ✅ Success | Large | 🟡 Medium | Payload too large; saved to tmp |
| `generate_political_landscape` | ✅ Success | Full | 🟢 High | Group composition confirmed |
| `get_plenary_sessions` (2026) | ✅ Partial | 10 | 🟡 Medium | Jan-Feb only; April sessions not returned |
| `get_adopted_texts` (docId) | ⚠️ 404 | 0 | N/A | April 2026 texts not yet published |
| `get_procedures_feed` | ✅ Partial | Multiple | 🔴 Low | Mixed old (1970s) + recent; unreliable |
| `get_parliamentary_questions` | ✅ Success | 31 | 🔴 Low | All placeholder content (Unknown/generic) |
| `track_legislation` (2026-2596) | ✅ Success | 1 | 🟢 High | DMA RSP timeline complete |
| `analyze_coalition_dynamics` | ✅ Success | Full | 🟡 Medium | Group-size proxy only (no vote data) |
| `get_meeting_decisions` (Apr 30) | ✅ Success | 220+ | 🟡 Medium | Type/status only; no substantive titles |
| `get_meeting_decisions` (Apr 28) | ✅ Success | 80+ | 🟡 Medium | Type/status only |
| `fetch_url` (IMF SDMX) | ✅ Success | 449 | 🟢 High | CHN/USA WEO data; EU aggregate N/A |

## Key Data Quality Findings

### High-Confidence Data
- EP10 group composition (live, confirmed)
- 2026 adopted texts list with titles (year query returns full metadata)
- DMA procedure track record (2026-2596)
- IMF WEO Sep 2025 data for China and USA

### Medium-Confidence Data  
- Political landscape analysis (group-level, not individual)
- Meeting decisions (type/status without substantive content)
- Adopted text feed (identifiers only, content unavailable)

### Low-Confidence / Unavailable
- Individual MEP voting positions (DOCEO 4-6 week delay — normal)
- Individual adopted text content (docId 404 for April 2026 — normal)
- Parliamentary questions content (placeholder data — EP API issue)
- Procedures feed (mixed historical/recent data — unreliable)

### EP API Degraded Features (expected/known)
- `get_voting_records`: empty for recent 4-6 weeks (documented EP delay)
- `get_latest_votes`: DOCEO XML empty for current plenary week (normal)
- Individual docId lookups for recent texts: 404 (publication delay)

## Overall Data Quality: 🟡 Medium
Sufficient for group-level coalition analysis and adopted text identification. Insufficient for individual MEP accountability (requires roll-call data) or full text analysis of recent resolutions.
