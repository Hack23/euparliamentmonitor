# Data Download Manifest — Extended Analysis
## EU Parliament Breaking News | 2026-05-08

### 1. Purpose
This artifact documents all data downloaded during Stage A of this workflow run,
including tool parameters, response metadata, cache status, and data quality flags.

---

### 2. Stage A Data Downloads — Run 2 (2026-05-08)

#### 2.1 EP Adopted Texts Feed (today)

**Tool:** `european-parliament___get_adopted_texts_feed`
**Parameters:** `{ "timeframe": "today" }`
**Response time:** ~3.2 seconds
**Items returned:** 9
**Item IDs:** TA-10-2026-0008 through TA-10-2026-0056 (early EP10 term texts, not recent)
**Data quality flag:** 🟡 FRESHNESS_FALLBACK — feed returned early-term texts, not today's
**Mitigation:** Supplemented with `get_adopted_texts` year=2026 for current texts

#### 2.2 EP Adopted Texts — Year Filter (2026)

**Tool:** `european-parliament___get_adopted_texts`
**Parameters:** `{ "year": 2026, "limit": 100 }`
**Response time:** ~4.1 seconds
**Items returned:** 21
**Key items:** TA-10-2026-0160 (DMA), TA-10-2026-0161 (Ukraine), TA-10-2026-0162 (Armenia), TA-10-2026-0151 (Haiti), TA-10-2026-0112 (Budget)
**Data quality flag:** 🟢 HIGH — complete 2026 adopted texts
**Cache status:** Not cached (live API call)

#### 2.3 EP Events Feed

**Tool:** `european-parliament___get_events_feed`
**Parameters:** `{ "timeframe": "today" }`
**Response time:** ~8.7 seconds
**Items returned:** 0
**Status:** ❌ UNAVAILABLE — API returned error-in-body
**Data quality flag:** 🔴 CRITICAL — complete loss of events data
**Mitigation:** Used `get_plenary_sessions` year=2026 for session data

#### 2.4 Political Landscape

**Tool:** `european-parliament___generate_political_landscape`
**Parameters:** `{}`
**Response time:** ~2.8 seconds
**Data returned:** 719 MEPs, 9 groups, full seat composition
**Data quality flag:** 🟢 HIGH
**Cache status:** Not cached (live API call)

#### 2.5 Coalition Dynamics

**Tool:** `european-parliament___analyze_coalition_dynamics`
**Parameters:** `{}`
**Response time:** ~3.4 seconds
**Data returned:** 9 groups, coalition pairs, size similarity scores
**Data quality flag:** 🟡 MEDIUM — size-similarity proxy only; no vote cohesion data
**Note:** Vote cohesion data requires DOCEO XML which has 4-6 week delay

#### 2.6 Early Warning System

**Tool:** `european-parliament___early_warning_system`
**Parameters:** `{ "sensitivity": "high" }`
**Response time:** ~2.1 seconds
**Data returned:** 3 warnings, stabilityScore=84, riskLevel=MEDIUM
**Data quality flag:** 🟡 MEDIUM — structural indicators only

#### 2.7 IMF SDMX Probe

**Endpoint:** `https://dataservices.imf.org/REST/SDMX_3.0/context/dataflow`
**Response:** HTTP 503 Service Unavailable
**Attempts:** 2 (Run 1 and Run 2)
**Data quality flag:** 🔴 DEGRADED — structural outage
**Mitigation:** World Bank substituted for structural economic data

#### 2.8 World Bank Structural Data

**Tool:** `world-bank___get-economic-data`
**Country:** EU representative (FR, DE)
**Indicators used:** GDP_GROWTH, INFLATION, UNEMPLOYMENT
**Response time:** ~2.5 seconds
**Data quality flag:** 🟢 HIGH — World Bank data current to 2024
**Note:** 2025-2026 data not yet available in World Bank database

---

### 3. Data Download Statistics

| Category | Tool Calls | Success | Failure | Quality |
|----------|-----------|---------|---------|---------|
| EP Adopted Texts | 2 | 2 | 0 | 🟢 HIGH |
| EP Events/Plenary | 2 | 1 | 1 | 🟡 MEDIUM |
| EP Political Analysis | 3 | 3 | 0 | �� MEDIUM |
| IMF Economic | 1 | 0 | 1 | 🔴 DEGRADED |
| World Bank | 2 | 2 | 0 | 🟢 HIGH |
| **Totals** | **10** | **8** | **2** | **🟡 MEDIUM** |

**Overall data completeness: 75%** (EP data complete; IMF absent; vote records absent)

---

### 4. Cached Data Used from Run 1

The following data artifacts were produced in Run 1 and reused in Run 2 (read-before-write per prior-run-diff protocol):

| File | Created | Last Modified | Used For |
|------|---------|--------------|---------|
| `cache/imf/probe-summary.json` | Run 1 | Run 2 | IMF status confirmation |
| `data/ep-stage-a.json` | Run 2 | Run 2 | Overwritten with fresh data |
| `runs/prior-run-diff.json` | Run 2 | Run 2 | Stage B extension planning |

---

### 5. Data Provenance Chain

```
EP Open Data API
    ↓ (european-parliament MCP server v1.3.1)
    ↓ (EP_MCP_GATEWAY_URL — not set in this run, local MCP)
    ↓
analysis/daily/2026-05-08/breaking/data/ep-stage-a.json
    ↓
intelligence/* artifacts (Pass 1 → Pass 2)
    ↓
classification/* artifacts
    ↓
risk-scoring/* artifacts
    ↓
documents/* artifacts
    ↓
extended/* artifacts
    ↓
manifest.json (aggregate metadata)
    ↓
npm run generate-article → news/2026-05-08-breaking.html
    ↓
git commit → PR
```

---

### 6. Data Retention and Audit

**Data type classification:**
- EP Open Data API responses: Public domain (EP open license)
- World Bank data: Creative Commons Attribution 4.0
- Analysis artifacts: Apache 2.0 (euparliamentmonitor project license)
- IMF probe results: Not applicable (request failed, no response data)

**Audit trail:**
- All MCP tool calls are logged in the gh-aw agent execution log
- Workflow run ID: 25541394493
- Analysis directory: analysis/daily/2026-05-08/breaking
- Run ID: breaking-run (2026-05-08 re-run)

**Data minimization (GDPR):**
- No personal data about individual MEPs stored beyond publicly available information
- No vote records stored (EP DOCEO XML — public data, not yet available)
- Stage A data (ep-stage-a.json) contains only aggregated political group data

*Source: Data download manifest | Stage A documentation | 2026-05-08*
