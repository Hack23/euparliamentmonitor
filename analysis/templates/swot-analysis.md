<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 💼 Political SWOT Analysis Template — European Parliament

> **📌 Template Instructions:** Copy to `analysis/YYYY-MM-DD/{article-type-slug}/` and name `swot-analysis.md`. Each SWOT entry requires an EP document reference or named evidence source — opinion-only entries are prohibited. See [methodologies/political-swot-framework.md](../methodologies/political-swot-framework.md) for full methodology. The AI agent MUST use MCP data (in `analysis/YYYY-MM-DD/{article-type-slug}/data/`) as evidence sources.

> **🚨 Anti-Pattern Warning:** SWOT entries without specific evidence citations (EP document IDs, MCP tool outputs, or named sources) are REJECTED. "The EU faces challenges" is NOT a valid Weakness entry. Every entry MUST include: Statement + Evidence (EP doc ref) + Confidence + Impact. See [methodologies/ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md) for quality requirements. **Never use scripted boilerplate — AI must analyse the actual data.**

---

## 📋 SWOT Context

| Field | Value |
|-------|-------|
| **SWOT ID** | `[REQUIRED: SWT-YYYY-MM-DD-NNN]` |
| **Analysis Date** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Analysis Scope** | `[REQUIRED: e.g. "Grand Coalition (EPP+S&D+Renew)", "Climate policy domain"]` |
| **Reference Period** | `[REQUIRED: e.g. "2026-Q1" or "2026-W13"]` |
| **Produced By** | `[REQUIRED: workflow name]` |
| **Primary MCP Sources** | `[REQUIRED: list of EP MCP tools used]` |
| **Validity Window** | `[REQUIRED: entries valid until YYYY-MM-DD]` |

---

## 🏛️ Section 1: Grand Coalition SWOT (EPP + S&D + Renew)

### ✅ Strengths

| # | Strength Statement | Evidence (EP reference) | Confidence | Impact |
|---|-------------------|----------------------|:----------:|:------:|
| S1 | `[REQUIRED: e.g. "Coalition commands 401/720 seats, providing comfortable working majority"]` | `[REQUIRED: MCP data source]` | `H/M/L` | `H/M/L` |
| S2 | `[REQUIRED]` | `[EP reference]` | `H/M/L` | `H/M/L` |
| S3 | `[OPTIONAL]` | `[EP reference]` | `H/M/L` | `H/M/L` |

**Strength Summary:** `[REQUIRED: 1–2 sentences]`

### ⚠️ Weaknesses

| # | Weakness Statement | Evidence (EP reference) | Confidence | Impact |
|---|-------------------|----------------------|:----------:|:------:|
| W1 | `[REQUIRED: e.g. "Internal EPP-S&D disagreement on migration pact implementation"]` | `[REQUIRED: MCP data source]` | `H/M/L` | `H/M/L` |
| W2 | `[REQUIRED]` | `[EP reference]` | `H/M/L` | `H/M/L` |

**Weakness Summary:** `[REQUIRED: 1–2 sentences]`

### 🚀 Opportunities

| # | Opportunity Statement | Evidence (EP reference) | Confidence | Impact |
|---|---------------------|----------------------|:----------:|:------:|
| O1 | `[REQUIRED: e.g. "Green Deal implementation window with favourable committee composition"]` | `[REQUIRED: MCP data source]` | `H/M/L` | `H/M/L` |
| O2 | `[REQUIRED]` | `[EP reference]` | `H/M/L` | `H/M/L` |

**Opportunity Summary:** `[REQUIRED: 1–2 sentences]`

### 🔴 Threats

| # | Threat Statement | Evidence (EP reference) | Confidence | Impact |
|---|-----------------|----------------------|:----------:|:------:|
| T1 | `[REQUIRED: e.g. "ECR+PfE+ESN combined opposition growth threatens grand coalition majority"]` | `[REQUIRED: MCP data source]` | `H/M/L` | `H/M/L` |
| T2 | `[REQUIRED]` | `[EP reference]` | `H/M/L` | `H/M/L` |

**Threat Summary:** `[REQUIRED: 1–2 sentences]`

---

## 🏛️ Section 2: Opposition Bloc SWOT (ECR + PfE/ESN)

**Opposition Subject:** `[REQUIRED: e.g. "ECR (78 seats) + PfE (76 seats) + ESN"]`

### ✅ Strengths

| # | Strength Statement | Evidence | Confidence | Impact |
|---|-------------------|---------|:----------:|:------:|
| S1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

### ⚠️ Weaknesses

| # | Weakness Statement | Evidence | Confidence | Impact |
|---|-------------------|---------|:----------:|:------:|
| W1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

### 🚀 Opportunities

| # | Opportunity Statement | Evidence | Confidence | Impact |
|---|---------------------|---------|:----------:|:------:|
| O1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

### 🔴 Threats

| # | Threat Statement | Evidence | Confidence | Impact |
|---|-----------------|---------|:----------:|:------:|
| T1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

---

## 🏛️ Section 3: Policy Domain SWOT

**Policy Domain:** `[REQUIRED: e.g. "Environment & Climate (ENVI)"]`

### ✅ Strengths

| # | Strength Statement | Evidence | Confidence | Impact |
|---|-------------------|---------|:----------:|:------:|
| S1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

### ⚠️ Weaknesses

| # | Weakness Statement | Evidence | Confidence | Impact |
|---|-------------------|---------|:----------:|:------:|
| W1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

### 🚀 Opportunities

| # | Opportunity | Evidence | Confidence | Impact |
|---|-----------|---------|:----------:|:------:|
| O1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

### 🔴 Threats

| # | Threat | Evidence | Confidence | Impact |
|---|-------|---------|:----------:|:------:|
| T1 | `[REQUIRED]` | `[MCP data]` | `H/M/L` | `H/M/L` |

---

## 🔑 Strategic Implications

`[REQUIRED: 3–5 sentences identifying the most critical SWOT interactions. How does a coalition weakness intersect with an opposition opportunity? What are the system-level risks? Reference specific EP evidence.]`

**Key Watch Items:**
1. `[REQUIRED: specific event or indicator to monitor]`
2. `[REQUIRED]`
3. `[OPTIONAL]`

### MCP Data Files Used

```
[REQUIRED: List all analysis/YYYY-MM-DD/{article-type-slug}/data/ files consulted]
```

---

## 🔄 Cross-SWOT Interference Analysis

> *How do SWOT elements from different actors (Grand Coalition, Opposition, swing groups) amplify or counteract each other?*

| GC/Opposition SWOT Element | Interfering Element | Effect | Net Political Impact |
|:--------------------:|:------------------:|:------:|---------------------|
| `[e.g. GC W1: Policy disagreements]` | `[e.g. Opp S1: United front on reform]` | Amplifies vulnerability | `[REQUIRED: Specific implication]` |
| `[e.g. GC S1: Legislative majority]` | `[e.g. ECR W1: Internal divisions]` | Fragile dependency | `[REQUIRED: Specific implication]` |
| `[REQUIRED: At least 2 interference pairs]` | `[...]` | `[...]` | `[...]` |

---

## 📊 TOWS Strategic Options

> *Convert SWOT findings into strategic options — answering "So what?"*

| TOWS Cell | Strategy | Specific Action | Evidence |
|:---------:|---------|-----------------|---------|
| **SO** (Strength × Opportunity) | `[REQUIRED: How to use a strength to exploit an opportunity]` | `[Specific action with timeline]` | `[EP procedure ID]` |
| **WO** (Weakness × Opportunity) | `[REQUIRED: How to use an opportunity to address a weakness]` | `[Specific action]` | `[EP procedure ID]` |
| **ST** (Strength × Threat) | `[OPTIONAL: How to use a strength to counter a threat]` | `[Specific action]` | `[EP procedure ID]` |
| **WT** (Weakness × Threat) | `[OPTIONAL: How to minimise vulnerability]` | `[Specific action]` | `[EP procedure ID]` |

---

## 🔮 Forward Indicators & Scenario Outlook

**90-Day Scenario Outlook:**

| Scenario | Probability | Key Trigger | SWOT Elements Driving It |
|----------|:----------:|------------|-------------------------|
| `[REQUIRED: Most likely scenario]` | `[%]` | `[Specific EP trigger event]` | `[S1+O2, T1+W1, etc.]` |
| `[REQUIRED: Alternative scenario]` | `[%]` | `[Specific EP trigger event]` | `[SWOT elements]` |
| `[OPTIONAL: Worst case]` | `[%]` | `[EP trigger]` | `[SWOT elements]` |
