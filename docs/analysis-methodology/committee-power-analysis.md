<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🏢 Committee Power Analysis — Methodology Template</h1>

<p align="center">
  <strong>📊 Workload Assessment, Legislative Pipeline & Policy Influence Mapping</strong><br>
  <em>🎯 Productivity Scoring • Cross-Committee Dynamics • Rapporteur Influence • Policy Impact</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Framework-Committee%20Analysis-0A66C2?style=for-the-badge" alt="Framework"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Method-Comparative%20Metrics-brightgreen?style=for-the-badge" alt="Method"/></a>
  <a href="#"><img src="https://img.shields.io/badge/MCP-European%20Parliament-purple?style=for-the-badge" alt="Data Source"/></a>
</p>

---

## 🎯 Purpose

This template guides the AI agent in producing a comprehensive **Committee Power Analysis** that assesses European Parliament committee workloads, legislative pipelines, member engagement, and policy influence. Committees are where the real legislative work happens — this analysis reveals the power dynamics behind the plenary votes.

**When to use:** Committee report articles, monthly reviews, legislative pipeline analysis, and any content requiring understanding of committee dynamics.

---

## 📥 Required MCP Data Sources

| MCP Tool | Purpose | Key Parameters |
|----------|---------|---------------|
| `analyze_committee_activity` | Workload, meetings, document production | `committeeId`, `dateFrom`, `dateTo` |
| `get_committee_info` | Composition, chair, vice-chairs, members | `abbreviation` or `showCurrent: true` |
| `analyze_legislative_effectiveness` | Committee productivity and quality | `subjectType: "COMMITTEE"`, `subjectId` |
| `get_committee_documents_feed` | Recent committee documents | `timeframe` |
| `search_documents` | Committee-specific reports and opinions | `committee`, `documentType` |
| `monitor_legislative_pipeline` | Procedures in committee stage | `committee`, `status` |

---

## 📝 Expected Output Structure

### 1. Document Header

```markdown
# 🏢 Committee Power Analysis — European Parliament

**📅 Analysis Date:** {YYYY-MM-DD} | **📊 Confidence:** {High/Medium/Low}
**🔍 Period:** {date range} | **🏢 Committees Analyzed:** {N}

---
```

### 2. Committee Power Ranking (Required)

```markdown
## 📊 Committee Power Ranking

| Rank | Committee | Abbreviation | Productivity | Pipeline | Influence | Overall |
|------|-----------|-------------|-------------|----------|-----------|---------|
| 1 | {Name} | {ABBR} | ![Score](https://img.shields.io/badge/-{N}%2F10-{color}?style=flat-square) | ![Score](https://img.shields.io/badge/-{N}%2F10-{color}?style=flat-square) | ![Score](https://img.shields.io/badge/-{N}%2F10-{color}?style=flat-square) | ![Score](https://img.shields.io/badge/-{N}%2F10-{color}?style=flat-square) |
| 2 | {Name} | {ABBR} | ... | ... | ... | ... |
```

### 3. Committee Ecosystem Visualization (Required)

```mermaid
mindmap
  root)🏢 EP Committee<br/>Ecosystem(
    (📋 Legislative Powerhouses)
      [ECON — Economic Affairs]
      [ENVI — Environment]
      [ITRE — Industry & Research]
      [LIBE — Civil Liberties]
      [IMCO — Internal Market]
    (🌍 External Relations)
      [AFET — Foreign Affairs]
      [INTA — International Trade]
      [DEVE — Development]
    (🏛️ Institutional)
      [JURI — Legal Affairs]
      [BUDG — Budgets]
      [CONT — Budgetary Control]
      [AFCO — Constitutional Affairs]
    (👥 Social & Regional)
      [EMPL — Employment]
      [AGRI — Agriculture]
      [PECH — Fisheries]
      [REGI — Regional Development]
      [CULT — Culture & Education]
      [FEMM — Women's Rights]
      [PETI — Petitions]
      [TRAN — Transport]
```

### 4. Workload Distribution (Required)

```mermaid
pie title Committee Workload Distribution (Documents Produced)
    "ENVI" : 45
    "ECON" : 38
    "LIBE" : 35
    "ITRE" : 32
    "IMCO" : 28
    "AFET" : 25
    "Other" : 97
```

> **AI Agent Note:** Replace with actual document counts from MCP data.

### 5. Committee Deep-Dive Profiles (Required for top 5)

For each key committee:

```markdown
### 🏢 {Committee Full Name} ({ABBREVIATION})

**Chair:** {Name} ({Group}, {Country}) | **Vice-Chairs:** {names}

| Metric | Value | EP Average | Comparison |
|--------|-------|-----------|------------|
| **Members** | {N} | {N} | — |
| **Documents produced** | {N} | {N} | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Meetings held** | {N} | {N} | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Reports adopted** | {N} | {N} | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Active procedures** | {N} | {N} | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Avg. time to report** | {N} days | {N} days | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |

**Key Dossiers:**
1. {Dossier title} — {stage} — ![Priority](https://img.shields.io/badge/-{level}-{color}?style=flat-square)
2. {Dossier title} — {stage} — ![Priority](https://img.shields.io/badge/-{level}-{color}?style=flat-square)

**Political Dynamics:** {Which groups dominate this committee and why it matters}

**Policy Impact Assessment:** {How this committee's work affects EU citizens and markets}
```

### 6. Committee Pipeline Flow (Required)

```mermaid
flowchart LR
    subgraph "ENVI"
        E1["📝 {N} in progress"]
        E2["✅ {N} adopted"]
    end
    subgraph "ECON"
        EC1["📝 {N} in progress"]
        EC2["✅ {N} adopted"]
    end
    subgraph "LIBE"
        L1["📝 {N} in progress"]
        L2["✅ {N} adopted"]
    end
    subgraph "ITRE"
        I1["📝 {N} in progress"]
        I2["✅ {N} adopted"]
    end

    style E1 fill:#009933,color:#fff
    style E2 fill:#006622,color:#fff
    style EC1 fill:#003399,color:#fff
    style EC2 fill:#002266,color:#fff
    style L1 fill:#cc0000,color:#fff
    style L2 fill:#990000,color:#fff
    style I1 fill:#FF9800,color:#fff
    style I2 fill:#CC7A00,color:#fff
```

### 7. Cross-Committee Dynamics (Required)

```markdown
### 🔄 Cross-Committee Relationships

| Committee Pair | Relationship | Frequency | Key Issue Area |
|---------------|-------------|-----------|---------------|
| ENVI ↔ ITRE | Joint procedure/opinion | {frequency} | Green transition / industrial policy |
| ECON ↔ LIBE | Competing jurisdiction | {frequency} | Financial data regulation |
| AFET ↔ INTA | Complementary mandates | {frequency} | Trade and foreign policy alignment |
| LIBE ↔ JURI | Legal framework overlap | {frequency} | Fundamental rights in legislation |
```

### 8. Rapporteur Influence Mapping (Required)

| Rapporteur | Committee | Dossier | Group | Influence Score |
|-----------|-----------|---------|-------|----------------|
| {Name} | {ABBR} | {Title} | {Group} | ![Score](https://img.shields.io/badge/-{level}-{color}?style=flat-square) |

### 9. Committee Bottleneck Analysis (Required)

```mermaid
quadrantChart
    title Committee Efficiency Assessment
    x-axis Low Output --> High Output
    y-axis Slow Processing --> Fast Processing
    quadrant-1 High Performers
    quadrant-2 Fast but Limited
    quadrant-3 Underperforming
    quadrant-4 Productive but Slow
```

| Committee | Bottleneck | Impact | Recommendation |
|-----------|-----------|--------|---------------|
| {ABBR} | {Description} | ![Impact](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {Recommendation} |

### 10. Strategic Assessment

```markdown
## 🔍 Strategic Assessment

**Most Influential Committee This Period:** {committee} — {why}

**Emerging Trends:**
- {Trend 1 with evidence}
- {Trend 2 with evidence}

**Committees to Watch:**
- {Committee and why it's gaining/losing influence}

**Policy Implications:**
- {How committee dynamics affect policy outcomes}
```

---

## 🎨 Committee Color Coding

| Category | Committees | Color |
|----------|-----------|-------|
| Legislative Core | ECON, ENVI, ITRE, LIBE, IMCO | Blue/Green tones |
| External | AFET, INTA, DEVE | Red/Orange tones |
| Institutional | JURI, BUDG, CONT, AFCO | Purple tones |
| Social/Regional | EMPL, AGRI, CULT, etc. | Teal/Gold tones |

---

**Last Updated:** 2026-03-28 | **Template Version:** 1.0
