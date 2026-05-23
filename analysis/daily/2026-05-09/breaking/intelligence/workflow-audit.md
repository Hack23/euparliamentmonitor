<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — Breaking News 2026-05-09

**Run:** breaking-run-1778354174 | **Date:** 2026-05-09 | **Stage:** B/C Transition

## Executive Summary

This workflow audit documents the agentic run performance, MCP tool reliability, data collection completeness, and quality control outcomes for the EP breaking news run of 2026-05-09. It is produced in compliance with the artifact catalog's requirement for `intelligence/workflow-audit.md` in every article-generating run.

---

## Run Timeline

| Milestone | Elapsed Time | Notes |
|-----------|-------------|-------|
| Workflow start | 0m | WORKFLOW_START_EPOCH=1778354174 |
| Prior-run-diff complete | ~1m | 6 carry-forward, 35 rewrite targets identified |
| Stage A data collection | ~3m | EP API calls complete; IMF probe run |
| Stage B Pass 1 start | ~3m | Rewriting all below-floor artifacts |
| Stage B Pass 1 target end | ~12m | Hard tripwire check at ~22m |
| Stage B Pass 2 | ~12-18m | Read-back and deepen |
| Stage C gate | ~18-20m | Completeness validation |
| Stage D render | ~20-22m | `npm run generate-article` |
| Stage E PR | ≤42m (target) | Single PR call |

---

## MCP Tool Reliability Audit

### European Parliament MCP Server (`european-parliament-mcp-server@1.3.2`)

| Tool | Called | Status | Response Quality |
|------|--------|--------|-----------------|
| `get_adopted_texts_feed` | Yes | ✅ Success | 50 items returned |
| `get_adopted_texts` | Yes | ✅ Success | 51 items for year 2026 |
| `get_events_feed` | Yes | ❌ Unavailable | EP API error-in-body |
| `get_procedures_feed` | Yes | ⚠️ Degraded | Legacy data returned, not 2026 |
| `get_meps_feed` | Yes | ❌ Failed | HTTP 413 (payload too large) |
| `generate_political_landscape` | Yes | ✅ Success | 717 MEPs, 9 groups confirmed |
| `analyze_coalition_dynamics` | Yes | ✅ Partial | Size-proxy only (vote data N/A) |
| `early_warning_system` | Yes | ✅ Success | 3 warnings generated |
| `detect_voting_anomalies` | Yes | ✅ Partial | No anomalies (data limited) |
| `get_latest_votes` | Yes | ❌ Empty | No DOCEO data for current week |
| `get_plenary_sessions` | Yes | ✅ Success | 10 sessions returned for 2026 |

**EP MCP Overall Reliability: 🟡 MEDIUM (6/11 tools fully operational)**

### World Bank MCP Server (`worldbank-mcp@1.0.1`)

Not called directly in Stage A (IMF probe took priority for economic context). WB data probe not run due to IMF failure taking precedence on degraded-mode processing.

**WB MCP Overall Reliability: ⚠️ NOT PROBED**

### IMF Fetch Proxy MCP Server (inline Node.js)

| Tool | Called | Status | Notes |
|------|--------|--------|-------|
| `fetch_url` | Attempted | ❌ Failed | `available: false` in probe summary |

**IMF Fetch Proxy Reliability: 🔴 UNAVAILABLE**
**Degraded mode activated:** IMF minimums waived per `08-infrastructure.md §4`

### Memory MCP Server (`@modelcontextprotocol/server-memory`)

Available but not used for artifact storage (artifacts written to file system directly per workflow protocol).

**Memory MCP: ✅ Available (not actively used)**

---

## Data Completeness Assessment

| Data Category | Items Collected | Coverage | Quality |
|---------------|----------------|----------|---------|
| Adopted texts 2026 | 51 texts | ✅ Full year | 🟡 Metadata only (no full text) |
| Recent texts (Apr-May) | 13 items (Apr 28-30) | ✅ Complete for session | 🟢 Title + reference confirmed |
| Plenary sessions 2026 | 10 sessions (Jan-Feb) | ⚠️ Partial year | 🟡 Only first page retrieved |
| MEP data | 717 MEPs total | ✅ Full count | 🟡 Group-level only |
| Voting records | 0 records | ❌ Unavailable | 🔴 Standard EP delay |
| Committee activity | 0 records | ❌ Events feed down | 🔴 Feed error |
| Parliamentary questions | Not queried | ⚠️ Not in Stage A | N/A |
| Coalition data | 9 groups, 36 pairs | ✅ Size proxies | 🟡 No vote-level cohesion |

---

## Quality Gate Pre-Check (Pass 1)

At the end of Stage B Pass 1, this run expects to have:
- Root-level `executive-brief.md`: ✅ Created (≥180 lines)
- All mandatory intelligence artifacts: 🟡 In progress
- All mandatory extended artifact: `extended/media-framing-analysis.md`: 🟡 In progress
- Zero `[AI_ANALYSIS_REQUIRED]` placeholders: ✅ Rule followed
- 🟢/🟡/🔴 confidence labels on all key findings: ✅ Applied throughout

---

## Known Data Gaps and Deferred Items

### Deferred Deep-Fetch (budget cap reached)
- Full procedure texts for SRMR3 (2023/0111(COD))
- Full procedure texts for Anti-Corruption Directive (2023/0135(COD))
- MEP details for immunity-waiver subjects (Braun MEP-ID unknown, Jaki MEP-ID unknown)
- Committee meeting minutes for JURI immunity deliberations

### Deferred MEP Lookups (budget cap)
- Grzegorz Braun (ECR/Poland) — MEP-ID not in available data
- Patryk Jaki (ECR/Poland) — MEP-ID not in available data
- PfE topical debate speakers (person IDs 197553, 257144 — biographies unknown)

---

## Audit Conclusion

This run is executing as a re-run of an ANALYSIS_ONLY prior run from the same date. The prior run produced 27 artifacts at insufficient depth. This run targets 39+ artifacts meeting all reference quality floors. The primary constraint is time budget, not data availability — the EP data corpus is unchanged from the prior run (same 51 texts, same political landscape). Quality improvement is achieved through analytical depth extension, not data expansion.

**Audit status:** 🟡 IN PROGRESS | Will update to ✅ COMPLETE at Stage C gate
