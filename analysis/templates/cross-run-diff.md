<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🔄 Cross-Run Diff Template — Bayesian Delta Analysis

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/cross-run-diff.md`. Bayesian delta vs. the previous run of the same article type: what changed in data and assessment. See [methodologies/per-artifact-methodologies.md §cross-run-diff](../methodologies/per-artifact-methodologies.md#cross-run-diff).

> **🎯 Purpose:** Track evolution of political assessment across runs. For each prior-run finding, apply Bayesian update based on new evidence to produce posterior assessment.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: XRD-YYYY-MM-DD-runNN]` |
| **Current Run** | `[REQUIRED: {type}-run{N}, YYYY-MM-DD]` |
| **Prior Run** | `[REQUIRED: {type}-run{N-1}, YYYY-MM-DD]` |
| **Days Between Runs** | `[REQUIRED: # days]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Prior-Run Header

**Prior run:** `[REQUIRED: path to analysis/daily/{date}/{type}-run{N-1}/]`  
**Prior run date:** `[REQUIRED: YYYY-MM-DD]`  
**Prior run number:** `[REQUIRED: run{N-1}]`

**Key findings from prior run:**

1. `[REQUIRED: finding 1 from prior synthesis-summary]`
2. `[REQUIRED: finding 2]`
3. `[REQUIRED: finding 3]`
4. `[REQUIRED: finding 4]`
5. `[REQUIRED: finding 5]`

**Key scores from prior run:**

| Metric | Prior Value |
|--------|:-----------:|
| Overall risk score | `[#]` |
| Coalition stability | `[%]` |
| Pipeline health | `[#/10]` |
| Top threat severity | `[#]` |

---

## 2️⃣ Data Delta

**New documents since prior run:** `[REQUIRED: count]`  
**New votes since prior run:** `[REQUIRED: count]`  
**New events since prior run:** `[REQUIRED: count]`  
**New procedures since prior run:** `[REQUIRED: count]`

**Significant new data:**

| Data Type | ID | Title/Topic | Significance |
|-----------|-----|-------------|--------------|
| `[REQUIRED: Document/Vote/Event/Procedure]` | `[ID]` | `[REQUIRED]` | `[REQUIRED: one-line explanation]` |
| `[REQUIRED]` | `[ID]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[ID]` | `[REQUIRED]` | `[REQUIRED]` |

**MCP endpoint refresh status:**

| Endpoint | Records Prior Run | Records This Run | Delta |
|----------|:-----------------:|:----------------:|:-----:|
| `get_plenary_sessions` | `[#]` | `[#]` | `[±#]` |
| `get_voting_records` | `[#]` | `[#]` | `[±#]` |
| `get_adopted_texts` | `[#]` | `[#]` | `[±#]` |
| `get_procedures` | `[#]` | `[#]` | `[±#]` |

---

## 3️⃣ Assessment Delta — Bayesian Update

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    PRIOR1[Prior Finding 1:<br/>[SUMMARY]] -->|new evidence| EV1{Evidence<br/>Class}
    EV1 -->|supporting| POST1A[Posterior:<br/>Confirmed/Upgraded]
    EV1 -->|contradicting| POST1B[Posterior:<br/>Downgraded/Reversed]
    EV1 -->|orthogonal| POST1C[Posterior:<br/>Unchanged]
    
    style PRIOR1 fill:#1565C0,color:#ffffff
    style POST1A fill:#2E7D32,color:#ffffff
    style POST1B fill:#D32F2F,color:#ffffff
    style POST1C fill:#FFC107,color:#000000
```

**Per-finding Bayesian updates:**

### Finding 1: `[REQUIRED: prior finding text]`

**Prior confidence:** `[REQUIRED: 🟢/🟡/🔴]`  
**Status:** `[REQUIRED: ✅ Confirmed / ⬆️ Upgraded / ⬇️ Downgraded / ❌ Reversed]`  
**Posterior confidence:** `[REQUIRED: 🟢/🟡/🔴]`

**New evidence:**

| Evidence Source | Evidence Class | Description |
|----------------|:--------------:|-------------|
| `[REQUIRED: document/vote/event ID]` | `[Supporting / Contradicting / Orthogonal]` | `[REQUIRED: one-line]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |

**Bayesian posterior:**

`[REQUIRED: ≥80 words explaining how new evidence updates the prior assessment. If supporting → why confidence rises or claim is confirmed. If contradicting → what changed and why. If orthogonal → why finding remains valid despite new data. Cite political-risk-methodology.md §Bayesian Update.]`

---

### Finding 2: `[REQUIRED: prior finding text]`

**Prior confidence:** `[🟢/🟡/🔴]`  
**Status:** `[✅ Confirmed / ⬆️ Upgraded / ⬇️ Downgraded / ❌ Reversed]`  
**Posterior confidence:** `[🟢/🟡/🔴]`

**New evidence:** `[REQUIRED: table as above]`

**Bayesian posterior:** `[REQUIRED: ≥80 words]`

---

### Finding 3: `[REQUIRED]`

*(repeat structure for all top-5 findings from prior run)*

---

## 4️⃣ Confidence Migration

**Claims that moved from 🔴 LOW to 🟡 MEDIUM or 🟢 HIGH:**

1. `[REQUIRED: claim + explanation for upgrade]`
2. `[REQUIRED]`

**Claims that moved from 🟢 HIGH to 🟡 MEDIUM or 🔴 LOW:**

1. `[REQUIRED: claim + explanation for downgrade]`
2. `[REQUIRED]`

**Claims that remain at same confidence level but with strengthened evidence:**

`[REQUIRED: list or note "none"]`

---

## 5️⃣ Open Questions for Next Run

**What the next same-type run should investigate:**

1. `[REQUIRED: specific question or data gap to address in next run]`
2. `[REQUIRED]`
3. `[REQUIRED]`
4. `[REQUIRED]`

**Recommended follow-up MCP queries:**

`[REQUIRED: list specific EP MCP tools to call with parameters, or note monitoring triggers]`

---

## 6️⃣ Data Sources

**Prior run artifacts read:** `[REQUIRED: list manifest.json, synthesis-summary.md, risk-matrix.md paths]`  
**EP MCP tools re-queried:** `[REQUIRED: list which endpoints were called fresh vs. which used cached prior-run data]`

---

## 7️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence rationale:** `[REQUIRED: ≥60 words explaining where Bayesian updates are data-backed vs. expert judgment. Note any gaps in roll-call data, document availability, or MCP reliability.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/cross-run-diff.md` · Template v1.1 · Depth floor: 100 lines.
