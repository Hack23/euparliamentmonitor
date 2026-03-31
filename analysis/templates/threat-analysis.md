<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🎭 Political Threat Landscape Analysis Template — European Parliament

> **📌 Template Instructions:** This template uses the **Political Threat Landscape** as the primary framework — a purpose-built 6-dimension model for EU democratic threats. Layer Diamond Model, Attack Trees, PESTLE, Scenario Planning, and Kill Chain for threats rated MODERATE or above. See [methodologies/political-threat-framework.md](../methodologies/political-threat-framework.md) for full methodology. Copy to `analysis/YYYY-MM-DD/{article-type-slug}/` and name `threat-analysis.md`. The AI agent MUST process ALL downloaded MCP data (in `analysis/YYYY-MM-DD/{article-type-slug}/data/`) to identify threats.

> **🚨 Anti-Pattern Warning:** Generic scripted analysis is REJECTED. Statements like "Coalition stability appears maintained" or "No significant signals detected" indicate the agent has NOT analysed the data. Every threat finding MUST cite specific EP MCP data. The AI must READ actual data, IDENTIFY specific threats, and PRODUCE original analysis with evidence. See [methodologies/ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md) for quality requirements.

---

## 📋 Threat Analysis Context

| Field | Value |
|-------|-------|
| **Threat Analysis ID** | `[REQUIRED: THR-YYYY-MM-DD-NNN]` |
| **Analysis Date** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Analysis Period** | `[REQUIRED: e.g. "2026-W13 (2026-03-23 to 2026-03-29)"]` |
| **Produced By** | `[REQUIRED: workflow name]` |
| **Political Context** | `[REQUIRED: 2–3 sentences on current EP political situation based on MCP data]` |
| **Overall Threat Level** | `[REQUIRED: MINIMAL / LOW / MODERATE / HIGH / SEVERE]` |

---

## 🏛️ Political Threat Landscape Assessment (6 Dimensions)

### 🔄 Dimension 1: Coalition Shifts

| Threat ID | Finding | Evidence (EP MCP Data) | Severity (1–5) | Trend |
|-----------|---------|----------------------|:--------------:|:-----:|
| `CS-001` | `[REQUIRED: Specific finding from voting patterns, coalition dynamics data]` | `[REQUIRED: MCP tool + data reference]` | `[#]` | `[↑/→/↓]` |
| `CS-002` | `[OPTIONAL]` | `[EP MCP reference]` | `[#]` | `[↑/→/↓]` |

**Dimension Assessment:** `[MINIMAL / LOW / MODERATE / HIGH / SEVERE]` — `[1-2 sentence summary with confidence level]`

---

### 🔍 Dimension 2: Transparency Deficit

| Threat ID | Finding | Evidence (EP MCP Data) | Severity (1–5) | Trend |
|-----------|---------|----------------------|:--------------:|:-----:|
| `TD-001` | `[REQUIRED: Specific transparency gap identified from committee, declaration, or procedure data]` | `[REQUIRED: MCP tool + data reference]` | `[#]` | `[↑/→/↓]` |
| `TD-002` | `[OPTIONAL]` | `[EP MCP reference]` | `[#]` | `[↑/→/↓]` |

**Dimension Assessment:** `[MINIMAL / LOW / MODERATE / HIGH / SEVERE]` — `[1-2 sentence summary with confidence level]`

---

### ↩️ Dimension 3: Policy Reversal

| Threat ID | Finding | Evidence (EP MCP Data) | Severity (1–5) | Trend |
|-----------|---------|----------------------|:--------------:|:-----:|
| `PR-001` | `[REQUIRED: Specific policy reversal or contradiction identified from voting/procedure data]` | `[REQUIRED: MCP tool + data reference]` | `[#]` | `[↑/→/↓]` |
| `PR-002` | `[OPTIONAL]` | `[EP MCP reference]` | `[#]` | `[↑/→/↓]` |

**Dimension Assessment:** `[MINIMAL / LOW / MODERATE / HIGH / SEVERE]` — `[1-2 sentence summary with confidence level]`

---

### 🏛️ Dimension 4: Institutional Pressure

| Threat ID | Finding | Evidence (EP MCP Data) | Severity (1–5) | Trend |
|-----------|---------|----------------------|:--------------:|:-----:|
| `IP-001` | `[REQUIRED: Specific institutional overreach or power concentration from procedure/committee data]` | `[REQUIRED: MCP tool + data reference]` | `[#]` | `[↑/→/↓]` |
| `IP-002` | `[OPTIONAL]` | `[EP MCP reference]` | `[#]` | `[↑/→/↓]` |

**Dimension Assessment:** `[MINIMAL / LOW / MODERATE / HIGH / SEVERE]` — `[1-2 sentence summary with confidence level]`

---

### ⏳ Dimension 5: Legislative Obstruction

| Threat ID | Finding | Evidence (EP MCP Data) | Severity (1–5) | Trend |
|-----------|---------|----------------------|:--------------:|:-----:|
| `LO-001` | `[REQUIRED: Specific obstruction/delay from legislative pipeline or committee data]` | `[REQUIRED: MCP tool + data reference]` | `[#]` | `[↑/→/↓]` |
| `LO-002` | `[OPTIONAL]` | `[EP MCP reference]` | `[#]` | `[↑/→/↓]` |

**Dimension Assessment:** `[MINIMAL / LOW / MODERATE / HIGH / SEVERE]` — `[1-2 sentence summary with confidence level]`

---

### 📉 Dimension 6: Democratic Erosion

| Threat ID | Finding | Evidence (EP MCP Data) | Severity (1–5) | Trend |
|-----------|---------|----------------------|:--------------:|:-----:|
| `DE-001` | `[REQUIRED: Specific democratic norm concern from attendance, question quality, or Article 7 data]` | `[REQUIRED: MCP tool + data reference]` | `[#]` | `[↑/→/↓]` |
| `DE-002` | `[OPTIONAL]` | `[EP MCP reference]` | `[#]` | `[↑/→/↓]` |

**Dimension Assessment:** `[MINIMAL / LOW / MODERATE / HIGH / SEVERE]` — `[1-2 sentence summary with confidence level]`

---

## 📊 Threat Landscape Summary

| Dimension | Highest Threat | Severity | Assessment | Trend |
|-----------|---------------|:--------:|:----------:|:-----:|
| 🔄 Coalition Shifts | `[threat ID]` | `[#]` | `[level]` | `[↑/→/↓]` |
| 🔍 Transparency Deficit | `[threat ID]` | `[#]` | `[level]` | `[↑/→/↓]` |
| ↩️ Policy Reversal | `[threat ID]` | `[#]` | `[level]` | `[↑/→/↓]` |
| 🏛️ Institutional Pressure | `[threat ID]` | `[#]` | `[level]` | `[↑/→/↓]` |
| ⏳ Legislative Obstruction | `[threat ID]` | `[#]` | `[level]` | `[↑/→/↓]` |
| 📉 Democratic Erosion | `[threat ID]` | `[#]` | `[level]` | `[↑/→/↓]` |

---

## 💎 Diamond Model Analysis (for MODERATE+ threats)

> *Apply Diamond Model when specific adversaries are identified with clear motivation. Skip if all dimensions are LOW or MINIMAL.*

| Element | Actor 1 | Actor 2 |
|---------|---------|---------|
| **Adversary** | `[Political actor with identified motivation]` | `[OPTIONAL]` |
| **Capability** | `[Resources, votes, procedural knowledge]` | `[OPTIONAL]` |
| **Infrastructure** | `[Institutional channels used]` | `[OPTIONAL]` |
| **Victim** | `[Democratic process under threat]` | `[OPTIONAL]` |

---

## 🎯 Threat Actor Mapping

| Actor Type | Specific Actor | Primary Dimension | Intent | Capability | Evidence |
|-----------|---------------|:-----------------:|--------|:----------:|----------|
| Political Group | `[e.g. ECR leadership]` | `[CS/TD/PR/IP/LO/DE]` | `[known/suspected]` | `[H/M/L]` | `[EP MCP ref]` |
| EU Institution | `[e.g. Commission]` | `[CS/TD/PR/IP/LO/DE]` | `[known/suspected]` | `[H/M/L]` | `[EP MCP ref]` |
| External State | `[e.g. Russia]` | `[CS/TD/PR/IP/LO/DE]` | `[known/suspected]` | `[H/M/L]` | `[EP MCP ref]` |
| Lobby/Industry | `[e.g. specific sector]` | `[CS/TD/PR/IP/LO/DE]` | `[known/suspected]` | `[H/M/L]` | `[EP MCP ref]` |

---

## 🛡️ Priority Mitigations

1. **[Threat ID]:** `[Mitigation action — what monitoring or editorial response]`
2. **[Threat ID]:** `[Mitigation action]`
3. **[Threat ID]:** `[Mitigation action]`

---

## 🔮 Forward Indicators

| # | Indicator | Timeline | Trigger Condition | Watch Priority |
|---|-----------|----------|-------------------|:--------------:|
| 1 | `[REQUIRED: specific EP event or metric to monitor]` | `[days/weeks]` | `[what would escalate this threat]` | `🔴/🟠/🟡/🟢` |
| 2 | `[REQUIRED]` | `[timeline]` | `[trigger]` | `🔴/🟠/🟡/🟢` |

**Overall Threat Level:** `[REQUIRED: MINIMAL / LOW / MODERATE / HIGH / SEVERE]`
**Assessment Confidence:** `[REQUIRED: HIGH / MEDIUM / LOW]`

### MCP Data Files Used

```
[REQUIRED: List all analysis/YYYY-MM-DD/{article-type-slug}/data/ files consulted]
```
