<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🤝 Coalition Dynamics Analysis — Methodology Template</h1>

<p align="center">
  <strong>📊 Voting Alliances, Cross-Party Networks & Grand Coalition Viability</strong><br>
  <em>🎯 Alliance Detection • Cohesion Metrics • Defection Tracking • ACH Framework</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Framework-Coalition%20Analysis-0A66C2?style=for-the-badge" alt="Framework"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Method-ACH%20%2B%20Network-brightgreen?style=for-the-badge" alt="Method"/></a>
  <a href="#"><img src="https://img.shields.io/badge/MCP-European%20Parliament-purple?style=for-the-badge" alt="Data Source"/></a>
</p>

---

## 🎯 Purpose

This template guides the AI agent in producing a comprehensive **Coalition Dynamics Analysis** that maps voting alliances, detects emerging cross-party alignments, and assesses the stability of coalition formations in the European Parliament.

**When to use:** Weekly reviews, motion analysis, any article requiring understanding of how groups vote together or apart.

**Key Analytical Framework:** Analysis of Competing Hypotheses (ACH) — evaluate multiple explanations for observed coalition patterns.

---

## 📥 Required MCP Data Sources

| MCP Tool | Purpose | Key Parameters |
|----------|---------|---------------|
| `analyze_coalition_dynamics` | Cohesion rates, cross-party alliances, defection rates | `dateFrom`, `dateTo`, `groupIds` |
| `get_voting_records` | Individual vote breakdowns | `dateFrom`, `dateTo`, `topic` |
| `detect_voting_anomalies` | Unusual patterns, defections, abstention spikes | `dateFrom`, `dateTo`, `sensitivityThreshold` |
| `compare_political_groups` | Multi-dimensional group comparison | `groupIds`, `dimensions` |
| `correlate_intelligence` | Cross-tool intelligence correlation | `mepIds`, `groups` |

---

## 📝 Expected Output Structure

### 1. Document Header

```markdown
# 🤝 Coalition Dynamics Analysis — European Parliament

**📅 Analysis Date:** {YYYY-MM-DD} | **📊 Confidence:** {High/Medium/Low}
**🔍 Period:** {date range} | **🗳️ Votes Analyzed:** {N}

---
```

### 2. Executive Summary

```markdown
## 📋 Executive Summary

| Coalition Metric | Value | Status | Trend |
|-----------------|-------|--------|-------|
| **Grand Coalition Cohesion** | {N}% | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| **EPP-S&D Alignment** | {N}% | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| **Cross-Party Defection Rate** | {N}% | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| **Fragmentation Index** | {N.NN} | ![Status](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| **Key Stress Point** | {topic} | ![Alert](https://img.shields.io/badge/-{severity}-{color}?style=flat-square) | — |
```

### 3. Coalition Network Visualization (Required)

```mermaid
flowchart TD
    subgraph "🔵 Centre-Right Bloc"
        EPP["🔵 EPP<br/>Cohesion: {N}%"]
        ECR["🟠 ECR<br/>Cohesion: {N}%"]
    end

    subgraph "🔴 Centre-Left Bloc"
        SD["🔴 S&D<br/>Cohesion: {N}%"]
        GR["🟢 Greens<br/>Cohesion: {N}%"]
        LF["🟣 Left<br/>Cohesion: {N}%"]
    end

    subgraph "🟡 Liberal Centre"
        RN["🟡 Renew<br/>Cohesion: {N}%"]
    end

    EPP ==>|"Strong alliance<br/>{N}% alignment"| SD
    EPP -->|"Moderate<br/>{N}%"| RN
    SD -->|"Progressive<br/>{N}%"| GR
    EPP -.->|"Issue-specific<br/>{N}%"| ECR
    RN -.->|"Selective<br/>{N}%"| GR

    style EPP fill:#003399,color:#fff,stroke:#003399
    style SD fill:#cc0000,color:#fff,stroke:#cc0000
    style RN fill:#FFD700,color:#000,stroke:#FFD700
    style ECR fill:#FF6600,color:#fff,stroke:#FF6600
    style GR fill:#009933,color:#fff,stroke:#009933
    style LF fill:#990000,color:#fff,stroke:#990000
```

> **Line thickness convention:**
> - `==>` (thick arrow): Strong alliance (>75% voting alignment)
> - `-->` (normal arrow): Moderate alliance (50-75% alignment)
> - `-.->` (dashed arrow): Weak/issue-specific alignment (<50%)

### 4. Voting Alignment Heatmap (Required)

Present pairwise alignment scores:

| | EPP | S&D | Renew | ECR | Greens | Left | PfE | ESN |
|---|---|---|---|---|---|---|---|---|
| **EPP** | — | {N}% | {N}% | {N}% | {N}% | {N}% | {N}% | {N}% |
| **S&D** | {N}% | — | {N}% | {N}% | {N}% | {N}% | {N}% | {N}% |
| **Renew** | {N}% | {N}% | — | {N}% | {N}% | {N}% | {N}% | {N}% |
| **ECR** | {N}% | {N}% | {N}% | — | {N}% | {N}% | {N}% | {N}% |
| **Greens** | {N}% | {N}% | {N}% | {N}% | — | {N}% | {N}% | {N}% |
| **Left** | {N}% | {N}% | {N}% | {N}% | {N}% | — | {N}% | {N}% |

> **Color coding in narrative:** 🟢 >75% alignment | 🟡 50-75% | 🔴 <50%

### 5. Analysis of Competing Hypotheses (ACH) — Coalition Shifts

For each significant coalition shift detected, apply ACH:

```markdown
### 🔍 ACH: {Observed Pattern — e.g., "EPP-ECR alignment increase on migration votes"}

| Hypothesis | Consistency with Evidence | Assessment |
|-----------|-------------------------|------------|
| H1: Strategic rapprochement on shared policy priorities | {Supporting evidence from votes} | ![Likely](https://img.shields.io/badge/-Most%20Likely-brightgreen?style=flat-square) |
| H2: Temporary tactical alliance for specific legislation | {Evidence} | ![Possible](https://img.shields.io/badge/-Possible-yellow?style=flat-square) |
| H3: Structural realignment reflecting national election outcomes | {Evidence} | ![Less Likely](https://img.shields.io/badge/-Less%20Likely-orange?style=flat-square) |
| H4: Leadership-driven initiative without broad group support | {Evidence} | ![Unlikely](https://img.shields.io/badge/-Unlikely-red?style=flat-square) |

**Key Diagnostic Evidence:** {What specific vote or event best distinguishes between hypotheses}
**Recommended Monitoring:** {What to watch to confirm/disconfirm the leading hypothesis}
```

### 6. Defection & Anomaly Analysis (Required)

```mermaid
pie title Voting Anomaly Types Detected ({period})
    "Party-Line Defections" : {n}
    "Abstention Spikes" : {n}
    "Cross-Bloc Voting" : {n}
    "Low Attendance" : {n}
```

For each significant anomaly:

| Anomaly | Group | Severity | Description | Implications |
|---------|-------|----------|-------------|-------------|
| {Type} | {Group} | ![Severity](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {What happened} | {What it means for coalition stability} |

### 7. Policy-Area Coalition Patterns (Required)

```mermaid
mindmap
  root)🗳️ Coalition Patterns<br/>by Policy Area(
    (🌍 Environment & Climate)
      [EPP + S&D + Greens + Renew]
      [Cohesion: {N}%]
      [Key votes: {N}]
    (💰 Economic & Trade)
      [EPP + Renew + ECR]
      [Cohesion: {N}%]
      [Key votes: {N}]
    (🔒 Security & Defense)
      [EPP + S&D + Renew + ECR]
      [Cohesion: {N}%]
      [Key votes: {N}]
    (👥 Migration & Asylum)
      [Variable coalitions]
      [Most contentious area]
      [Key votes: {N}]
    (🖥️ Digital & Technology)
      [Broad consensus typical]
      [Cohesion: {N}%]
      [Key votes: {N}]
```

### 8. Grand Coalition Stress Test (Required)

```mermaid
quadrantChart
    title Grand Coalition Stability Assessment
    x-axis Low Policy Consensus --> High Policy Consensus
    y-axis Low Internal Cohesion --> High Internal Cohesion
    quadrant-1 Stable & United
    quadrant-2 Cohesive but Divergent
    quadrant-3 Fragmented & Divergent
    quadrant-4 Consensus but Fragile
    Environment: [0.6, 0.7]
    Economy: [0.5, 0.6]
    Security: [0.7, 0.8]
    Migration: [0.3, 0.4]
    Digital: [0.8, 0.7]
    Social: [0.4, 0.5]
```

### 9. Early Warning Indicators (Required)

| Indicator | Current Level | Threshold | Status |
|-----------|--------------|-----------|--------|
| Grand coalition alignment rate | {N}% | <60% = alert | ![Status](https://img.shields.io/badge/-{status}-{color}?style=flat-square) |
| Cross-party defection frequency | {N}/week | >5/week = watch | ![Status](https://img.shields.io/badge/-{status}-{color}?style=flat-square) |
| Abstention rate (major votes) | {N}% | >15% = concern | ![Status](https://img.shields.io/badge/-{status}-{color}?style=flat-square) |
| New alliance formation signals | {description} | Any = monitor | ![Status](https://img.shields.io/badge/-{status}-{color}?style=flat-square) |

### 10. Strategic Outlook

| Scenario | Probability | Impact | Description |
|----------|-------------|--------|-------------|
| **Continuity** | ![Likely](https://img.shields.io/badge/-Likely-brightgreen?style=flat-square) | Medium | Grand coalition holds on most dossiers |
| **Selective fracture** | ![Possible](https://img.shields.io/badge/-Possible-yellow?style=flat-square) | High | Migration/climate splits force alternative majorities |
| **Realignment** | ![Unlikely](https://img.shields.io/badge/-Unlikely-red?style=flat-square) | Very High | Major group shift fundamentally changes coalition math |

---

## 🔒 Methodology Notes

- **Alliance detection threshold:** Groups voting together >60% of the time on >10 votes
- **Defection definition:** MEP voting against >70% of their group on a given vote
- **Abstention spike:** Group abstention rate >2× their average
- **Confidence depends on:** Number of votes analyzed, data completeness, temporal coverage

---

**Last Updated:** 2026-03-28 | **Template Version:** 1.0
