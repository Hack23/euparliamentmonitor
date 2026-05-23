---
articleType: week-in-review
analysisDate: 2026-04-11
runId: 8
confidence: HIGH
producedBy: news-weekly-review
---

# EP API Outage Diagnostic - Easter Recess Day 16

> **Diagnostic ID:** DIAG-2026-04-11-008
> **Analysis Date:** 2026-04-11 10:50 UTC
> **MCP Server:** european-parliament-mcp-server v1.2.1 (62 tools available)
> **EP API Status:** Unavailable (all 13 feeds returning INTERNAL_ERROR)
> **Produced By:** news-weekly-review workflow (Run 8)

---

## EP API Connectivity Test Results

### Step 0: HTTP Pre-Check

| Endpoint | Method | HTTP Status | Result |
|----------|--------|:-----------:|--------|
| `data.europarl.europa.eu/api/v2/meps` | GET (curl) | **200** | MEP list endpoint responsive |

**Assessment:** EP API base infrastructure is online (HTTP 200 for MEP endpoint). Feed/session endpoints used by MCP server return errors, indicating selective endpoint degradation during Easter recess.

### Step 1: MCP Health Gate (3 attempts)

| Attempt | Tool | Wait Before | Result | Error Code |
|:-------:|------|:-----------:|--------|:----------:|
| 1 | `get_plenary_sessions({ limit: 1 })` | 0s | FAILED | INTERNAL_ERROR |
| 2 | `get_plenary_sessions({ limit: 1 })` | 30s | FAILED | INTERNAL_ERROR |
| 3 | `get_plenary_sessions({ limit: 1 })` | 30s | FAILED | INTERNAL_ERROR |

### Feed Endpoint Failures (>=3 consecutive)

| Feed | Result | Error Type |
|------|:------:|:----------:|
| `get_adopted_texts_feed({ timeframe: "one-week" })` | FAILED | INTERNAL_ERROR |
| `get_procedures_feed({ timeframe: "one-week" })` | FAILED | INTERNAL_ERROR |
| `get_plenary_documents_feed({ timeframe: "one-week" })` | FAILED | INTERNAL_ERROR |
| `get_parliamentary_questions_feed({ timeframe: "one-week" })` | FAILED | INTERNAL_ERROR |
| `get_voting_records({ dateFrom: "2026-04-04" })` | FAILED | INTERNAL_ERROR |
| `detect_voting_anomalies({ dateFrom: "2026-04-04" })` | FAILED | INTERNAL_ERROR |
| `generate_political_landscape({})` | FAILED | INTERNAL_ERROR |

### Successful MCP Tools

| Tool | Data Size | Content |
|------|:---------:|---------|
| `get_all_generated_stats` | 140,273 chars | Yearly stats 2004-2026, predictions to 2028 |
| `analyze_coalition_dynamics` | 11,635 chars | Group structure (metrics null - API limitation) |
| `get_server_health` | ~1,200 chars | Server v1.2.1, status: unhealthy, 0/13 feeds operational |

### Server Health Report

Server version: 1.2.1, Status: unhealthy. Availability: 0/13 operational feeds. Level: Unavailable.

---

## Root Cause Assessment

**Determination:** Easter recess selective endpoint degradation. Confidence: HIGH.

**Evidence chain:**
1. EP API base infrastructure online (HTTP 200 for MEP endpoint)
2. Feed/session endpoints returning INTERNAL_ERROR - consistent with recess maintenance pattern
3. Precomputed statistics tool functional (does not require live API)
4. Coalition dynamics tool returns structure but null metrics (partial API access)
5. Pattern matches Easter 2025 and Christmas 2025 recess outage patterns documented in prior analysis

**Expected recovery:** 12-13 April 2026 (T-1 to T-0 before committee restart)

---

## Impact on Weekly Review

This diagnostic was triggered because the week-in-review workflow could not obtain live feed data needed for a feed-first article. The FEED-FIRST CONTENT RULE requires specific adopted texts, voting results, and procedure updates with concrete dates and IDs from the past week's feed data.

**Available data for analysis-only artifacts:**
- Precomputed stats (140K chars, generated 2026-04-08)
- Coalition dynamics (11K chars, null group metrics)
- Prior analysis from 14 workflow runs during April 4-11
- Key EP references from prior runs: TA-10-2026-0092, 0094, 0096, 0088, 0103, 0099
- Key procedures: 2023/0135(COD), 2023/0111(COD), 2025/0261(COD)
- Risk trajectory: 10.10/25 to 13.17/25 (rising over 3 days)
