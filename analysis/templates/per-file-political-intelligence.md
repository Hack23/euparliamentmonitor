<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔍 Per-File Political Intelligence Analysis Template — European Parliament</h1>

<p align="center">
  <strong>📊 Deep AI-Driven Analysis for Individual EP Documents</strong><br>
  <em>🎯 SWOT · Risk · Threat · Stakeholder Impact · Strategic Implications</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--30-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-03-30 (UTC)
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template Instructions:** This template is for **per-file** analysis. For each data file downloaded via EP MCP (e.g., an adopted text, vote record, committee document), the AI agent produces one analysis markdown file stored alongside the data file.
>
> **Example path:** `analysis/2026-03-30/committee-reports/data/adopted-texts/P9_TA-2026-0089.json` → `analysis/2026-03-30/committee-reports/data/adopted-texts/P9_TA-2026-0089.analysis.md`

> **🚨 Anti-Pattern Warning:** Plain prose without structured tables, Mermaid diagrams, or evidence citations is REJECTED. Every analysis file MUST follow this template exactly: metadata header, structured tables with evidence columns, ≥1 color-coded Mermaid diagram, confidence labels on all claims. See [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md) for good vs. bad examples.

---

## 📋 Document Identity

| Field | Value |
|-------|-------|
| **Document ID** | `[REQUIRED: EP document reference, e.g. P9_TA(2026)0089]` |
| **Document Type** | `[REQUIRED: adopted-texts / committee-documents / procedures / votes / speeches / questions / events / meps / declarations / plenary-documents / external-documents]` |
| **Title** | `[REQUIRED: document title]` |
| **Date** | `[REQUIRED: document date or fetch date]` |
| **Parliamentary Term** | `[REQUIRED: e.g. EP10 (2024–2029)]` |
| **Committee** | `[If applicable: e.g. ENVI, ECON, LIBE]` |
| **Source MCP Tool** | `[REQUIRED: e.g. get_adopted_texts, get_voting_records, search_documents]` |
| **Analysis Timestamp** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Analyst** | `[REQUIRED: workflow name, e.g. news-committee-reports]` |

---

## 🎯 Executive Summary

`[REQUIRED: 3–5 sentences capturing the political significance at intelligence level. Not just what happened, but what it means for EP power dynamics, political group cohesion, institutional balance, and democratic accountability. Include confidence label.]` **[HIGH/MEDIUM/LOW]**

---

## 📊 Political Classification

```mermaid
graph LR
    A[EP Document] --> B{Sensitivity}
    B -->|"🔴 RESTRICTED"| C[Institutional Crisis / Legal Sensitivity]
    B -->|"🟡 SENSITIVE"| D[Political Group Fracture / Contested Policy]
    B -->|"🟢 PUBLIC"| E[Standard Parliamentary Business]

    A --> G{Domain}
    G --> H["[REQUIRED: Primary EP committee domain]"]

    A --> I{Urgency}
    I -->|"🔴 CRITICAL"| J[Treaty change / Institutional crisis — hours]
    I -->|"🟠 URGENT"| K[Key plenary vote imminent — days]
    I -->|"🔵 ELEVATED"| L[Committee stage / Trilogue — this week]
    I -->|"⚪ ROUTINE"| M[Standard legislative cycle]

    style C fill:#dc3545,color:#fff
    style D fill:#ffc107,color:#000
    style E fill:#28a745,color:#fff
    style J fill:#dc3545,color:#fff
    style K fill:#fd7e14,color:#fff
    style L fill:#0d6efd,color:#fff
    style M fill:#6c757d,color:#fff
```

| Field | Assessment |
|-------|-----------|
| **Sensitivity Level** | `[REQUIRED: PUBLIC / SENSITIVE / RESTRICTED]` |
| **Primary Domain** | `[REQUIRED: EP committee code, e.g. ENVI, ECON, LIBE, AFET]` |
| **Secondary Domain(s)** | `[OPTIONAL: up to 2 additional committee domains]` |
| **Urgency** | `[REQUIRED: ROUTINE / ELEVATED / URGENT / CRITICAL]` |
| **Significance Score** | `[REQUIRED: 0–10]` |
| **Confidence** | `[REQUIRED: HIGH / MEDIUM / LOW]` |

---

## 💪 SWOT Impact Assessment

> *How does this document affect the EP political landscape? Each entry requires evidence.*

### Quadrant Overview

```mermaid
quadrantChart
    title EP Political Impact Assessment
    x-axis "Pro-Integration" --> "Sovereignist"
    y-axis "Risk" --> "Opportunity"
    quadrant-1 Sovereignist Opportunities
    quadrant-2 Pro-Integration Opportunities
    quadrant-3 Pro-Integration Risks
    quadrant-4 Sovereignist Risks

    "[REQUIRED: key finding 1]": [0.3, 0.7]
    "[REQUIRED: key finding 2]": [0.7, 0.3]
```

> ⚠️ AI Agent: Replace placeholder findings with actual data points from this document's analysis. Adjust coordinates based on real political positioning.

### Grand Coalition Impact (EPP + S&D + Renew)

| Quadrant | Statement | Evidence | Confidence | Impact |
|----------|-----------|----------|:----------:|:------:|
| ✅ Strength | `[If this strengthens grand coalition]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |
| ⚠️ Weakness | `[If this exposes grand coalition vulnerability]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |
| 🚀 Opportunity | `[If this creates grand coalition opportunity]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |
| 🔴 Threat | `[If this threatens grand coalition]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |

### Opposition / Alternative Coalition Impact (ECR + PfE + ESN + Left + Greens)

| Quadrant | Statement | Evidence | Confidence | Impact |
|----------|-----------|----------|:----------:|:------:|
| ✅ Strength | `[If this strengthens alternative formations]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |
| ⚠️ Weakness | `[If this exposes opposition vulnerability]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |
| 🚀 Opportunity | `[If this creates opposition opportunity]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |
| 🔴 Threat | `[If this threatens opposition groups]` | `[EP doc reference]` | `H/M/L` | `H/M/L` |

---

## ⚖️ Risk Assessment

```mermaid
graph TD
    subgraph "⚖️ EP Political Risk Matrix — Likelihood × Impact"
        R1["🔴 Grand Coalition Stability<br/>L:[?] × I:[?] = [?]"]
        R2["🟠 Policy Implementation<br/>L:[?] × I:[?] = [?]"]
        R3["🟡 Budget / MFF<br/>L:[?] × I:[?] = [?]"]
        R4["📊 Electoral Impact<br/>L:[?] × I:[?] = [?]"]
        R5["🏛️ Institutional Balance<br/>L:[?] × I:[?] = [?]"]
        R6["🌍 Geopolitical<br/>L:[?] × I:[?] = [?]"]
    end

    subgraph "📊 Risk Score Tiers"
        T1["🔴 CRITICAL<br/>Score 15–25"]
        T2["🟠 HIGH<br/>Score 10–14"]
        T3["🟡 MEDIUM<br/>Score 5–9"]
        T4["🟢 LOW<br/>Score 1–4"]
    end

    style R1 fill:#6c757d,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style R2 fill:#6c757d,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style R3 fill:#6c757d,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style R4 fill:#6c757d,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style R5 fill:#6c757d,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style R6 fill:#6c757d,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style T1 fill:#dc3545,color:#fff
    style T2 fill:#fd7e14,color:#fff
    style T3 fill:#ffc107,color:#000
    style T4 fill:#28a745,color:#fff
```

> **⚠️ AI Instructions:** Replace ALL `[?]` placeholders with actual numbers derived from the document data. Update node styles from grey dashed to the correct risk tier colour.

| Risk Type | Likelihood (1–5) | Impact (1–5) | Score | Assessment |
|-----------|:-----------------:|:------------:|:-----:|------------|
| Grand Coalition Stability | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: how does this affect EPP-S&D-Renew cooperation?]` |
| Policy Implementation | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: will this legislation be implemented effectively?]` |
| Budget / MFF | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: fiscal implications for EU budget?]` |
| Electoral Impact | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: how does this affect 2029 EP election positioning?]` |
| Institutional Balance | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: EP vs Council vs Commission power dynamics?]` |
| Geopolitical | `[1-5]` | `[1-5]` | `[L×I]` | `[OPTIONAL: NATO, China, Russia, US trade implications]` |

**Overall Risk Level:** `[REQUIRED: CRITICAL / HIGH / MEDIUM / LOW]`

---

## 🎭 Threat Analysis (Multi-Framework)

> *Political threats assessed using the Political Threat Landscape (6 dimensions), supplemented with Diamond Model for adversary analysis, Attack Trees for systemic threats, and PESTLE for macro-environmental factors. Severity: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe.*

### Threat Landscape Assessment

| Threat Dimension | Applicable? | Threat Description | Severity (1–5) | Evidence |
|----------------|:-----------:|-------------------|:--------------:|----------|
| 🎭 S — Disinformation | `[Y/N]` | `[Misrepresentation of positions, false attributions in EP debates]` | `[1-5]` | `[EP ref]` |
| 🔧 T — Process Manipulation | `[Y/N]` | `[Procedural manipulation, fast-tracking, rule bending in committee]` | `[1-5]` | `[EP ref]` |
| 📝 R — Accountability Evasion | `[Y/N]` | `[Voting record contradictions, position reversals by MEPs/groups]` | `[1-5]` | `[EP ref]` |
| 🔓 I — Transparency Failure | `[Y/N]` | `[Trilogue opacity, undisclosed lobbying, classification abuse]` | `[1-5]` | `[EP ref]` |
| 🚫 D — Democratic Obstruction | `[Y/N]` | `[Quorum manipulation, committee delays, amendment flooding]` | `[1-5]` | `[EP ref]` |
| ⬆️ E — Power Concentration | `[Y/N]` | `[Commission overreach, Council bypassing EP, group leader dominance]` | `[1-5]` | `[EP ref]` |

### Attack Tree Assessment

`[If applicable: Identify systemic threat paths — e.g., "Coalition destabilisation via migration policy disagreement → ECR-PfE alliance → grand coalition fracture". Include at least one attack tree if threat level is MODERATE or above.]`

### LINDDUN Privacy Assessment

`[If applicable: Data protection threats related to MEP declarations, lobbying transparency, citizen data in petitions. Reference GDPR compliance dimensions.]`

---

## 👥 Stakeholder Impact Matrix

> *Seven analytical lenses applied to this document, covering the EU institutional ecosystem.*

| Stakeholder | Impact Level | Key Assessment | Confidence |
|------------|:------------:|----------------|:----------:|
| 🇪🇺 EU Citizens (500M+) | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: How does this affect citizens' rights, services, daily life?]` | `[H/M/L]` |
| 🏛️ EP Political Groups | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: Which groups gain/lose from this? Grand coalition vs. opposition dynamics?]` | `[H/M/L]` |
| ⚖️ EU Institutions | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: Commission, Council, CJEU impact? Institutional balance shift?]` | `[H/M/L]` |
| 🇪🇺 Member States | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: Differential impact across member states? East-West or North-South dynamics?]` | `[H/M/L]` |
| 💰 Economic Actors | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: Business, trade, fiscal, labour market implications?]` | `[H/M/L]` |
| 🤝 Civil Society | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: NGOs, advocacy groups, unions — engagement and impact?]` | `[H/M/L]` |
| 🌍 International Partners | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: US, UK, NATO, UN, developing countries — geopolitical implications?]` | `[H/M/L]` |

---

## 🔮 Forward Indicators

> *What to monitor as a consequence of this document.*

| # | Indicator | Timeline | Trigger Condition | Watch Priority |
|---|-----------|----------|-------------------|:--------------:|
| 1 | `[REQUIRED: specific future EP event or metric to monitor]` | `[days/weeks/months]` | `[what would trigger escalation]` | `🔴/🟠/🟡/🟢` |
| 2 | `[REQUIRED]` | `[timeline]` | `[trigger]` | `🔴/🟠/🟡/🟢` |
| 3 | `[OPTIONAL]` | `[timeline]` | `[trigger]` | `🔴/🟠/🟡/🟢` |

---

## 🔗 Cross-References

| Related Document | Relationship | EP Reference |
|-----------------|-------------|--------------|
| `[If related documents exist]` | `[supports / contradicts / amends / supersedes / responds-to]` | `[EP doc ref]` |

---

## 📊 Data Quality Assessment

| Metric | Value |
|--------|-------|
| **Source Completeness** | `[REQUIRED: Full text / Metadata only / Summary only]` |
| **Evidence Density** | `[REQUIRED: N evidence points cited]` |
| **Temporal Currency** | `[REQUIRED: Current / Recent (30d) / Dated (90d) / Stale (180d+)]` |
| **Analytical Confidence** | `[REQUIRED: HIGH / MEDIUM / LOW]` |

---

## 📂 MCP Data Files Used

`[REQUIRED: List all EP MCP data file paths consulted for this analysis]`

---

**Document Control:**
- **Template Path:** `/analysis/templates/per-file-political-intelligence.md`
- **Output Path:** Same directory as the JSON source file, named `{id}.analysis.md`
- **Framework References:** [SWOT.md](../../SWOT.md), [THREAT_MODEL.md](../../THREAT_MODEL.md)
- **Methodology:** [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md)
- **Classification:** Public
- **Next Review:** 2026-06-30
