<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🛰️ MCP Reliability Audit Template — Endpoint Health & Uptime Report

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/mcp-reliability-audit.md`. Endpoint-by-endpoint record of EP MCP availability and data freshness during the run. See [methodologies/per-artifact-methodologies.md §mcp-reliability-audit](../methodologies/per-artifact-methodologies.md#mcp-reliability-audit).

> **🎯 Purpose:** Comprehensive MCP server health assessment tracking which endpoints succeeded, which failed, which were degraded, and what workarounds were applied. First-class product concern — this is the deepest breaking-run artifact.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: MCP-YYYY-MM-DD-runNN]` |
| **Run Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Endpoints Attempted** | `[REQUIRED: count]` |
| **Endpoints Succeeded** | `[REQUIRED: count]` |
| **Reliability Score (0-100)** | `[REQUIRED: #]` |
| **Overall Status** | `[REQUIRED: ✅ Full / ⚠️ Degraded / 🔴 Unavailable]` |

---

## 1️⃣ Endpoint Scoreboard

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    EP1[get_meps] --> OK1[✅ OK]
    EP2[get_plenary_sessions] --> OK2[✅ OK]
    EP3[get_voting_records] --> DEG[⚠️ Degraded]
    EP4[get_procedures] --> FAIL[🔴 Failed]
    EP5[get_adopted_texts] --> OK5[✅ OK]
    
    style OK1 fill:#2E7D32,color:#ffffff
    style OK2 fill:#2E7D32,color:#ffffff
    style DEG fill:#FF9800,color:#000000
    style FAIL fill:#D32F2F,color:#ffffff
    style OK5 fill:#2E7D32,color:#ffffff
```

| Tool Name | Attempts | Successes | 4xx Errors | 5xx Errors | Timeouts | Latency (avg) | Data Age | Status |
|-----------|:--------:|:---------:|:----------:|:----------:|:--------:|:-------------:|:--------:|:------:|
| `get_meps` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED: e.g. "2 days old" or "N/A"]` | `[✅/⚠️/🔴]` |
| `get_plenary_sessions` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_voting_records` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_adopted_texts` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_procedures` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_committee_info` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_speeches` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_parliamentary_questions` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `analyze_coalition_dynamics` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `assess_mep_influence` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `compare_political_groups` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |
| `get_all_generated_stats` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | `[ms]` | `[REQUIRED]` | `[✅/⚠️/🔴]` |

**Status definitions:**
- ✅ OK: 100% success rate, latency <5s, data fresh
- ⚠️ Degraded: 50-99% success rate OR latency 5-30s OR data stale but usable
- 🔴 Failed: <50% success rate OR timeouts >50% OR data unavailable

---

## 2️⃣ Per-Endpoint Findings

### `[REQUIRED: Endpoint 1 — name failing or degraded endpoint]`

**Status:** `[⚠️ Degraded / 🔴 Failed]`

**Symptom:**

`[REQUIRED: ≥60 words describing what went wrong. Include error messages, HTTP status codes, timeout durations, or data-quality issues observed.]`

**Likely root cause:**

`[REQUIRED: ≥60 words analyzing the probable cause. Examples: "EP Open Data Portal upstream 503 errors", "Feed publication delay (known issue for RCV data)", "MCP server timeout configuration too aggressive for large result sets", "Authentication token expiry".]`

**Repro attempt:**

`[REQUIRED: ≥40 words describing what steps were taken to reproduce or diagnose. Did retry succeed? Did parameter adjustment help? Was fallback endpoint tested?]`

**Workaround used in this run:**

`[REQUIRED: ≥60 words explaining how the run compensated. Examples: "Used prior-run cached data from run{N-1}", "Switched to direct EP API endpoint bypass", "Applied IMF (primary economic) data as context bridge per Wave-4 policy", "Reduced query scope from year-filter to month-filter".]`

---

### `[REQUIRED: Endpoint 2]`

*(Repeat structure for every failing or degraded endpoint. Target ≥3 detailed subsections.)*

---

## 3️⃣ Upstream Issues

**Linked issues on `Hack23/European-Parliament-MCP-Server`:**

| Issue # | Title | Status | URL | Filed This Run? |
|:-------:|-------|:------:|-----|:---------------:|
| `[#123]` | `[REQUIRED: issue title]` | `[Open / Closed]` | `[REQUIRED: https://github.com/Hack23/European-Parliament-MCP-Server/issues/123]` | `[Yes / No]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[REQUIRED]` | `[Yes / No]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[REQUIRED]` | `[Yes / No]` |

**Issues needing creation:**

`[REQUIRED: list any degraded endpoints that DO NOT have an upstream GitHub issue and SHOULD have one. For each, provide: endpoint name, symptom summary, repro steps. Or note "all issues filed".]`

---

## 4️⃣ Data-Source Bridge

**Alternative sources compensating for EP MCP failures:**

| Failed EP MCP Tool | Alternative Source Used | Data Quality | Coverage |
|-------------------|------------------------|:------------:|:--------:|
| `[REQUIRED: tool name]` | `[REQUIRED: e.g. "Direct EP API endpoint", "IMF SDMX REST (primary economic)", "World Bank MCP (non-economic)", "Prior-run cache"]` | `[🟢 Equal / 🟡 Reduced / 🔴 Insufficient]` | `[% of needed data recovered]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[...]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[...]` |

**Bridge narrative:**

`[REQUIRED: ≥100 words explaining the overall data-source strategy when EP MCP was degraded. What was the fallback order? (EP MCP → direct EP API → IMF SDMX REST (primary economic, Wave-4) → World Bank MCP (non-economic only) → prior-run cache → degraded analysis with LOW confidence marker). Which artifacts were affected? Where are gaps acknowledged?]`

---

## 5️⃣ Reliability Index

**Calculation methodology:**

```
Reliability Score = (
  (Successful calls / Total calls) × 50 +
  max(0, min(1, 1 - (Avg latency / 30s))) × 25 +
  (Data freshness score) × 25
)
```

> **Latency clamp:** the latency term is bounded to `[0, 1]` before weighting — a call slower than 30 s contributes `0` (never negative), and an instant call contributes `1`. This prevents pathological MCP latencies from driving the total reliability score below 0 when success-rate and freshness are reasonable.

**Component scores:**

| Component | Weight | Raw Score | Weighted Score |
|-----------|:------:|:---------:|:--------------:|
| Success rate | 50% | `[REQUIRED: %]` | `[REQUIRED: #/50]` |
| Latency | 25% | `[REQUIRED: normalized 0-1]` | `[REQUIRED: #/25]` |
| Data freshness | 25% | `[REQUIRED: 1.0=same-day, 0.5=week-old, 0.0=month-old]` | `[REQUIRED: #/25]` |
| **Total** | **100%** | — | **`[REQUIRED: #/100]`** |

**Reliability breakdown by category:**

| Category | Tools | Score (0-100) |
|----------|-------|:-------------:|
| Data Retrieval (get_*) | `[REQUIRED: list]` | `[#]` |
| Analysis (analyze_*, assess_*, compare_*) | `[REQUIRED: list]` | `[#]` |
| Historical Stats | `[REQUIRED: list]` | `[#]` |

---

## 6️⃣ Trend vs. Prior Runs

| Run | Date | Reliability Score | Endpoints Failed | Notable Issues |
|:---:|:----:|:-----------------:|:----------------:|----------------|
| `[REQUIRED: current run]` | `[YYYY-MM-DD]` | `[#]` | `[#]` | `[REQUIRED: one-line]` |
| `[REQUIRED: run{N-1}]` | `[YYYY-MM-DD]` | `[#]` | `[#]` | `[REQUIRED]` |
| `[REQUIRED: run{N-2}]` | `[YYYY-MM-DD]` | `[#]` | `[#]` | `[REQUIRED]` |
| `[REQUIRED: run{N-3}]` | `[YYYY-MM-DD]` | `[#]` | `[#]` | `[REQUIRED]` |

**Trend narrative:**

`[REQUIRED: ≥80 words analyzing whether MCP reliability is improving, stable, or degrading over recent runs. What chronic issues persist? What recent fixes have helped?]`

---

## 7️⃣ Recommendations for Next Run

**Immediate actions:**

1. `[REQUIRED: specific action — e.g. "File GitHub issue for get_voting_records timeout behavior"]`
2. `[REQUIRED]`
3. `[REQUIRED]`

**Configuration adjustments:**

`[REQUIRED: list any MCP client timeout, retry, or parameter settings to adjust for next run]`

**Fallback-source readiness:**

`[REQUIRED: which alternative data sources should be pre-tested or pre-cached before next run to minimize degradation impact?]`

---

## 8️⃣ Confidence Assessment

**Overall confidence in EP MCP data quality this run:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence rationale:** `[REQUIRED: ≥60 words explaining where data is trustworthy vs. where workarounds introduce uncertainty or staleness.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/mcp-reliability-audit.md` · Template v1.0 · Depth floor: 385 lines.
