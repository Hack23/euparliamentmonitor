<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🎭 Political Threat Analysis Template — European Parliament

> **📌 Template Instructions:** This template adapts the STRIDE threat modelling framework for EU democratic process threats. See [methodologies/political-threat-framework.md](../methodologies/political-threat-framework.md) for full methodology. Copy to `analysis/YYYY-MM-DD/` and name `threat-analysis.md`. The AI agent MUST process ALL downloaded MCP data to identify threats.

---

## 📋 Threat Analysis Context

| Field | Value |
|-------|-------|
| **Threat Analysis ID** | `[REQUIRED: THR-YYYY-MM-DD-NNN]` |
| **Analysis Date** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Analysis Period** | `[REQUIRED: e.g. "2026-W13 (2026-03-23 to 2026-03-29)"]` |
| **Produced By** | `[REQUIRED: workflow name]` |
| **Political Context** | `[REQUIRED: 2–3 sentences on current EP political situation]` |
| **Overall Threat Level** | `[REQUIRED: LOW / MODERATE / HIGH / SEVERE]` |

---

## 🎭 STRIDE-Adapted Threat Inventory

### S — Spoofing: False Narratives & Disinformation

| Threat ID | Threat Description | Threat Actor | Evidence (MCP data) | Severity (1–5) | Mitigation |
|-----------|-------------------|-------------|-------------------|:--------------:|------------|
| `S-001` | `[REQUIRED: e.g. "Disinformation campaign targeting EP Green Deal legislation"]` | `[REQUIRED]` | `[REQUIRED: MCP data file reference]` | `[#]` | `[REQUIRED]` |
| `S-002` | `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[#]` | `[OPTIONAL]` |

**S-Category Threat Level:** `[LOW / MODERATE / HIGH / SEVERE]`

---

### T — Tampering: Policy Corruption Risks

| Threat ID | Threat Description | Threat Actor | Evidence (MCP data) | Severity (1–5) | Mitigation |
|-----------|-------------------|-------------|-------------------|:--------------:|------------|
| `T-001` | `[REQUIRED: e.g. "Undisclosed lobbying influence on ENVI committee amendments"]` | `[REQUIRED]` | `[REQUIRED]` | `[#]` | `[REQUIRED]` |
| `T-002` | `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[#]` | `[OPTIONAL]` |

**T-Category Threat Level:** `[LOW / MODERATE / HIGH / SEVERE]`

---

### R — Repudiation: Accountability Evasion

| Threat ID | Threat Description | Threat Actor | Evidence (MCP data) | Severity (1–5) | Mitigation |
|-----------|-------------------|-------------|-------------------|:--------------:|------------|
| `R-001` | `[REQUIRED: e.g. "MEP voting record contradicts public position on migration"]` | `[REQUIRED]` | `[REQUIRED: voting record from MCP]` | `[#]` | `[REQUIRED]` |
| `R-002` | `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[#]` | `[OPTIONAL]` |

**R-Category Threat Level:** `[LOW / MODERATE / HIGH / SEVERE]`

---

### I — Information Disclosure: Transparency Failures

| Threat ID | Threat Description | Threat Actor | Evidence (MCP data) | Severity (1–5) | Mitigation |
|-----------|-------------------|-------------|-------------------|:--------------:|------------|
| `I-001` | `[REQUIRED: e.g. "Delayed MEP financial declaration disclosures"]` | `[REQUIRED]` | `[REQUIRED: declarations data from MCP]` | `[#]` | `[REQUIRED]` |
| `I-002` | `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[#]` | `[OPTIONAL]` |

**I-Category Threat Level:** `[LOW / MODERATE / HIGH / SEVERE]`

---

### D — Denial: Democratic Process Obstruction

| Threat ID | Threat Description | Threat Actor | Evidence (MCP data) | Severity (1–5) | Mitigation |
|-----------|-------------------|-------------|-------------------|:--------------:|------------|
| `D-001` | `[REQUIRED: e.g. "Committee blocking of key legislative report through procedural delays"]` | `[REQUIRED]` | `[REQUIRED: pipeline data from MCP]` | `[#]` | `[REQUIRED]` |
| `D-002` | `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[#]` | `[OPTIONAL]` |

**D-Category Threat Level:** `[LOW / MODERATE / HIGH / SEVERE]`

---

### E — Elevation of Privilege: Power Concentration

| Threat ID | Threat Description | Threat Actor | Evidence (MCP data) | Severity (1–5) | Mitigation |
|-----------|-------------------|-------------|-------------------|:--------------:|------------|
| `E-001` | `[REQUIRED: e.g. "Commission using delegated acts to bypass EP co-decision"]` | `[REQUIRED]` | `[REQUIRED: procedures data from MCP]` | `[#]` | `[REQUIRED]` |
| `E-002` | `[OPTIONAL]` | `[OPTIONAL]` | `[OPTIONAL]` | `[#]` | `[OPTIONAL]` |

**E-Category Threat Level:** `[LOW / MODERATE / HIGH / SEVERE]`

---

## 📊 Threat Summary Matrix

| STRIDE Category | Highest Threat | Severity | Threat Level |
|----------------|---------------|:--------:|--------------|
| S — Spoofing | `[threat ID]` | `[#]` | `[level]` |
| T — Tampering | `[threat ID]` | `[#]` | `[level]` |
| R — Repudiation | `[threat ID]` | `[#]` | `[level]` |
| I — Disclosure | `[threat ID]` | `[#]` | `[level]` |
| D — Denial | `[threat ID]` | `[#]` | `[level]` |
| E — Elevation | `[threat ID]` | `[#]` | `[level]` |

---

## 🎯 Threat Actor Mapping

| Actor Type | Specific Actor | Primary STRIDE | Intent | Capability |
|-----------|---------------|---------------|--------|------------|
| EU Institution | `[e.g. Commission President]` | `[S/T/R/I/D/E]` | `[known/suspected]` | `[HIGH/MED/LOW]` |
| Political Group | `[e.g. ECR leadership]` | `[S/T/R/I/D/E]` | `[known/suspected]` | `[HIGH/MED/LOW]` |
| External State | `[e.g. Russia]` | `[S/T/R/I/D/E]` | `[known/suspected]` | `[HIGH/MED/LOW]` |
| Media | `[e.g. specific outlet]` | `[S/T/R/I/D/E]` | `[known/suspected]` | `[HIGH/MED/LOW]` |

---

## 🛡️ Priority Mitigations

1. **[Threat ID]:** `[Mitigation action — what monitoring or editorial response]`
2. **[Threat ID]:** `[Mitigation action]`
3. **[Threat ID]:** `[Mitigation action]`

**Overall Threat Level:** `[REQUIRED: LOW / MODERATE / HIGH / SEVERE]`
**Assessment Confidence:** `[REQUIRED: HIGH / MEDIUM / LOW]`

### MCP Data Files Used

```
[REQUIRED: List all analysis/YYYY-MM-DD/data/ files consulted]
```
