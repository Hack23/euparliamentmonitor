<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">⚖️ Legislative Risk Assessment — Methodology Template</h1>

<p align="center">
  <strong>📊 Passage Probability, Pipeline Health & PESTLE Impact Analysis</strong><br>
  <em>🎯 Risk Matrix • Amendment Tracking • Timeline Forecasting • Stakeholder Impact</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Framework-PESTLE%20%2B%20Risk%20Matrix-0A66C2?style=for-the-badge" alt="Framework"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Method-Quantitative%20Risk-brightgreen?style=for-the-badge" alt="Method"/></a>
  <a href="#"><img src="https://img.shields.io/badge/MCP-European%20Parliament-purple?style=for-the-badge" alt="Data Source"/></a>
</p>

---

## 🎯 Purpose

This template guides the AI agent in producing a comprehensive **Legislative Risk Assessment** that evaluates the passage probability, political risk dimensions, and policy impact of active legislative procedures in the European Parliament.

**When to use:** Proposition tracking, month-ahead outlooks, committee reports, and any analysis of legislative pipeline health.

**Key Analytical Frameworks:**
- **PESTLE** — Political, Economic, Social, Technological, Legal, Environmental factor analysis
- **Risk Matrix** — Probability × Impact scoring
- **Stakeholder Mapping** — Interest, influence, and position assessment

---

## 📥 Required MCP Data Sources

| MCP Tool | Purpose | Key Parameters |
|----------|---------|---------------|
| `monitor_legislative_pipeline` | Pipeline health, bottlenecks, stalled procedures | `status`, `committee`, `dateFrom` |
| `track_legislation` | Individual procedure progress and timeline | `procedureId` |
| `get_procedures` | Active legislative procedures | `year`, `limit` |
| `get_procedures_feed` | Recently updated procedures | `timeframe` |
| `search_documents` | Committee reports, opinions, amendments | `keyword`, `documentType`, `committee` |
| `analyze_legislative_effectiveness` | Committee/MEP legislative output quality | `subjectType`, `subjectId` |

---

## 📝 Expected Output Structure

### 1. Document Header

```markdown
# ⚖️ Legislative Risk Assessment — European Parliament

**📅 Analysis Date:** {YYYY-MM-DD} | **📊 Confidence:** {High/Medium/Low}
**🔍 Period:** {date range} | **📋 Procedures Analyzed:** {N}

---
```

### 2. Executive Summary — Pipeline Health Dashboard

```markdown
## 📋 Pipeline Health Dashboard

| Metric | Value | Status | Benchmark |
|--------|-------|--------|-----------|
| **Active Procedures** | {N} | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | vs. {N} same period last year |
| **Pipeline Throughput** | {N}/month | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | Target: {N}/month |
| **Stalled Procedures** | {N} ({N}%) | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | Alert threshold: >20% |
| **Average Time-to-Adoption** | {N} months | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | EP average: {N} months |
| **Bottleneck Stage** | {stage} | ![Alert](https://img.shields.io/badge/-{severity}-{color}?style=flat-square) | {explanation} |
```

### 3. Legislative Pipeline Flow (Required)

```mermaid
flowchart LR
    A["📝 Proposal<br/>{N} procedures"] --> B["🏢 Committee<br/>{N} procedures"]
    B --> C["📋 Plenary 1st<br/>{N} procedures"]
    C --> D["🤝 Trilogue<br/>{N} procedures"]
    D --> E["✅ Adoption<br/>{N} adopted"]

    A2["⏸️ Stalled<br/>{N} procedures"] -.-> B
    B2["❌ Withdrawn<br/>{N} procedures"] -.-> A

    style A fill:#2196F3,color:#fff
    style B fill:#FF9800,color:#fff
    style C fill:#9C27B0,color:#fff
    style D fill:#F44336,color:#fff
    style E fill:#4CAF50,color:#fff
    style A2 fill:#999,color:#fff
    style B2 fill:#666,color:#fff
```

### 4. Risk Matrix — Top Legislative Dossiers (Required)

```mermaid
quadrantChart
    title Legislative Risk Matrix — Key Dossiers
    x-axis Low Political Risk --> High Political Risk
    y-axis Low Societal Impact --> High Societal Impact
    quadrant-1 🔴 Critical Priority
    quadrant-2 🟡 Strategic Watch
    quadrant-3 🟢 Routine Processing
    quadrant-4 🟠 Technical Complexity
```

For the top 5-10 legislative dossiers:

| # | Procedure | Stage | Political Risk | Societal Impact | Passage Probability | Timeline |
|---|-----------|-------|---------------|-----------------|-------------------|----------|
| 1 | {Title} ({reference}) | {Committee/Plenary/Trilogue} | ![Risk](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | ![Impact](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {N}% | Q{N} {YYYY} |
| 2 | {Title} ({reference}) | {stage} | ![Risk](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | ![Impact](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {N}% | Q{N} {YYYY} |

### 5. PESTLE Analysis — Legislative Environment (Required)

```mermaid
mindmap
  root)⚖️ PESTLE Analysis<br/>EU Legislative Environment(
    (🏛️ Political)
      [Grand coalition stability]
      [National election spillovers]
      [EP group dynamics]
      [Commission priorities]
    (💰 Economic)
      [Eurozone performance]
      [Trade policy shifts]
      [Budget negotiations]
      [Industrial competitiveness]
    (👥 Social)
      [Public trust in EU institutions]
      [Migration pressures]
      [Cost of living concerns]
      [Demographic shifts]
    (🖥️ Technological)
      [AI regulation momentum]
      [Digital sovereignty]
      [Cybersecurity requirements]
      [Green tech incentives]
    (⚖️ Legal)
      [ECJ rulings impact]
      [Treaty reform discussions]
      [Subsidiarity challenges]
      [Regulatory harmonization]
    (🌍 Environmental)
      [Green Deal implementation]
      [Climate targets pressure]
      [Energy transition pace]
      [Biodiversity framework]
```

For each PESTLE dimension, provide:

```markdown
### 🏛️ Political Factors

| Factor | Assessment | Impact on Pipeline | Confidence |
|--------|-----------|-------------------|------------|
| {Factor} | ![Level](https://img.shields.io/badge/-{assessment}-{color}?style=flat-square) | {How it affects legislation} | 🟢/🟡/🔴 |

**Analysis:** {2-3 paragraph narrative assessment of political factors affecting the legislative pipeline}
```

### 6. Dossier Deep-Dive (Required for top 3 dossiers)

For each top-priority dossier:

```markdown
### 📋 {Dossier Title} — {Reference Number}

**Stage:** {Current stage} | **Lead Committee:** {committee} | **Rapporteur:** {name, group}

```mermaid
flowchart LR
    P["📝 Commission<br/>Proposal<br/>{date}"] --> C["🏢 Committee<br/>{status}<br/>{date}"]
    C --> R["📄 Report<br/>{status}"]
    R --> V["🗳️ Plenary Vote<br/>{status}"]
    V --> T["🤝 Trilogue<br/>{status}"]
    T --> A["✅ Adoption<br/>{projected}"]

    style P fill:#4CAF50,color:#fff
    style C fill:#FF9800,color:#fff
    style R fill:#999,color:#fff
    style V fill:#999,color:#fff
    style T fill:#999,color:#fff
    style A fill:#999,color:#fff
```

**Passage Probability:** {N}% — ![Assessment](https://img.shields.io/badge/-{level}-{color}?style=flat-square)

**Key Risks:**
1. {Risk with impact description}
2. {Risk with impact description}

**Stakeholder Positions:**

| Stakeholder | Position | Influence | Key Concern |
|-------------|----------|-----------|-------------|
| {Group/Actor} | ![For](https://img.shields.io/badge/-Support-brightgreen?style=flat-square) | High | {concern} |
| {Group/Actor} | ![Against](https://img.shields.io/badge/-Oppose-red?style=flat-square) | Medium | {concern} |
| {Group/Actor} | ![Neutral](https://img.shields.io/badge/-Neutral-blue?style=flat-square) | High | {concern} |
```

### 7. Bottleneck Identification (Required)

| Bottleneck | Stage | Procedures Affected | Cause | Recommended Action |
|-----------|-------|-------------------|-------|-------------------|
| {Description} | {Pipeline stage} | {N} | {Root cause analysis} | {What would unblock it} |

### 8. Timeline Risk Assessment (Required)

```mermaid
gantt
    title Legislative Timeline Forecast — Priority Dossiers
    dateFormat YYYY-MM
    axisFormat %Y-%m

    section Dossier 1
    Committee Stage    :done, d1, 2026-01, 2026-03
    Plenary Vote       :active, d2, 2026-04, 2026-05
    Trilogue           :d3, 2026-06, 2026-09
    Adoption           :d4, 2026-10, 2026-11

    section Dossier 2
    Committee Stage    :active, e1, 2026-02, 2026-05
    Plenary Vote       :e2, 2026-06, 2026-07
    Trilogue           :e3, 2026-08, 2026-12
```

> **AI Agent Note:** Replace with actual dossier timelines from `track_legislation`. Color code stages: done=green, active=blue, future=grey.

### 9. Passage Probability Methodology

```markdown
## 🔢 Passage Probability Scoring

Composite score from 5 dimensions (each 0-20 points):

| Dimension | Weight | Scoring Criteria |
|-----------|--------|-----------------|
| **Political Group Alignment** | 20% | How many groups' positions are known and supportive |
| **Committee Stage Progress** | 20% | How far through the committee stage |
| **Amendment Density** | 20% | Fewer contested amendments = higher probability |
| **Historical Precedent** | 20% | Similar legislation passage rates |
| **External Pressure** | 20% | Commission priority level, public attention, deadline pressure |

**Score Interpretation:**
- 80-100%: ![Very Likely](https://img.shields.io/badge/-Very%20Likely-brightgreen?style=flat-square) — Strong consensus, advanced stage
- 60-79%: ![Likely](https://img.shields.io/badge/-Likely-green?style=flat-square) — Good momentum, manageable opposition
- 40-59%: ![Uncertain](https://img.shields.io/badge/-Uncertain-yellow?style=flat-square) — Significant political risks
- 20-39%: ![Difficult](https://img.shields.io/badge/-Difficult-orange?style=flat-square) — Major opposition or structural barriers
- 0-19%: ![Unlikely](https://img.shields.io/badge/-Unlikely-red?style=flat-square) — Stalled, withdrawn, or fundamentally blocked
```

### 10. Strategic Recommendations

| Priority | Recommendation | Rationale | Timeline |
|----------|---------------|-----------|----------|
| ![High](https://img.shields.io/badge/-High-red?style=flat-square) | {Recommendation} | {Why} | {When} |
| ![Medium](https://img.shields.io/badge/-Medium-orange?style=flat-square) | {Recommendation} | {Why} | {When} |
| ![Low](https://img.shields.io/badge/-Low-brightgreen?style=flat-square) | {Recommendation} | {Why} | {When} |

---

**Last Updated:** 2026-03-28 | **Template Version:** 1.0
