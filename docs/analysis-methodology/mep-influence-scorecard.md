<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">👤 MEP Influence Scorecard — Methodology Template</h1>

<p align="center">
  <strong>📊 Multi-Dimensional MEP Performance, Influence & Network Analysis</strong><br>
  <em>🎯 5-Dimension Model • Voting Patterns • Committee Engagement • Network Centrality</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Framework-Influence%20Scoring-0A66C2?style=for-the-badge" alt="Framework"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Dimensions-5%20Weighted-brightgreen?style=for-the-badge" alt="Dimensions"/></a>
  <a href="#"><img src="https://img.shields.io/badge/MCP-European%20Parliament-purple?style=for-the-badge" alt="Data Source"/></a>
</p>

---

## 🎯 Purpose

This template guides the AI agent in producing comprehensive **MEP Influence Scorecards** that assess individual Members of European Parliament across multiple performance dimensions. The analysis uses only public data and maintains strict political neutrality.

**When to use:** MEP profiling for article context, committee reports, national delegation analysis, and any content requiring understanding of individual MEP influence.

**GDPR Compliance:** All data is from public European Parliament records. Analysis covers public roles and voting records only — no personal profiling.

---

## 📥 Required MCP Data Sources

| MCP Tool | Purpose | Key Parameters |
|----------|---------|---------------|
| `assess_mep_influence` | 5-dimension influence score | `mepId`, `includeDetails: true` |
| `analyze_voting_patterns` | Voting behavior and group alignment | `mepId`, `dateFrom`, `dateTo` |
| `get_mep_details` | Biography, committees, contact info | `id` |
| `network_analysis` | Committee co-membership centrality | `mepId` |
| `comparative_intelligence` | Cross-MEP comparison | `mepIds` (2-10 MEPs) |
| `track_mep_attendance` | Attendance patterns and trends | `mepId` |
| `analyze_legislative_effectiveness` | Legislative output quality | `subjectType: "MEP"`, `subjectId` |

---

## 📝 Expected Output Structure

### 1. Document Header

```markdown
# 👤 MEP Influence Scorecard — {MEP Name}

**📅 Analysis Date:** {YYYY-MM-DD} | **📊 Confidence:** {High/Medium/Low}
**🏛️ Political Group:** {group} | **🇪🇺 Country:** {country} | **📋 Committees:** {list}

---
```

### 2. Influence Score Overview (Required)

```markdown
## 📊 Influence Score Summary

**Overall Score:** {N}/100 — ![Rating](https://img.shields.io/badge/-{rating}-{color}?style=for-the-badge)
**Rank:** #{N} of {total} MEPs | **Percentile:** Top {N}%

| Dimension | Weight | Score | Rating | Trend |
|-----------|--------|-------|--------|-------|
| 🗳️ **Voting Activity** | 25% | {N}/100 | ![Rating](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| 📝 **Legislative Output** | 25% | {N}/100 | ![Rating](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| 🏢 **Committee Engagement** | 20% | {N}/100 | ![Rating](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| 🔍 **Parliamentary Oversight** | 15% | {N}/100 | ![Rating](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
| 🤝 **Coalition Building** | 15% | {N}/100 | ![Rating](https://img.shields.io/badge/-{level}-{color}?style=flat-square) | {↑↗→↘↓} |
```

### 3. Performance Radar Visualization (Required)

> **Note:** Mermaid does not natively support radar/spider charts. Use a quadrant chart as a proxy or describe the radar dimensions narratively.

```mermaid
quadrantChart
    title MEP Performance Profile
    x-axis Legislative Focus --> Oversight Focus
    y-axis Individual Actor --> Coalition Builder
    quadrant-1 Legislative Leader
    quadrant-2 Coalition Architect
    quadrant-3 Committee Specialist
    quadrant-4 Oversight Champion
    MEP Position: [0.6, 0.7]
    Group Average: [0.5, 0.5]
```

### 4. Voting Behavior Analysis (Required)

```markdown
### 🗳️ Voting Behavior Profile

| Metric | Value | Group Average | Comparison |
|--------|-------|--------------|------------|
| **Participation Rate** | {N}% | {N}% | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Group Loyalty** | {N}% | {N}% | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Cross-Party Voting** | {N}% | {N}% | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
| **Abstention Rate** | {N}% | {N}% | ![Comparison](https://img.shields.io/badge/-{above/below}-{color}?style=flat-square) |
```

### 5. Voting Pattern Visualization (Required)

```mermaid
pie title Voting Pattern Breakdown
    "With Group Majority" : {N}
    "Against Group Majority" : {N}
    "Abstained" : {N}
    "Absent" : {N}
```

> **⚠️ AI Agent**: Replace all `{N}` placeholders above with actual computed values from `analyze_voting_patterns` MCP data. Do NOT use the template defaults.

### 6. Legislative Output Assessment (Required)

| Output Type | Count | Period | Quality Score |
|------------|-------|--------|--------------|
| Reports authored | {N} | {period} | ![Quality](https://img.shields.io/badge/-{level}-{color}?style=flat-square) |
| Opinions drafted | {N} | {period} | ![Quality](https://img.shields.io/badge/-{level}-{color}?style=flat-square) |
| Amendments tabled | {N} | {period} | ![Quality](https://img.shields.io/badge/-{level}-{color}?style=flat-square) |
| Amendments adopted | {N} ({N}%) | {period} | ![Quality](https://img.shields.io/badge/-{level}-{color}?style=flat-square) |
| Parliamentary questions | {N} | {period} | ![Quality](https://img.shields.io/badge/-{level}-{color}?style=flat-square) |

### 7. Committee Engagement Profile (Required)

```mermaid
flowchart TD
    MEP["👤 {MEP Name}"]

    MEP --> C1["🏢 {Committee 1}<br/>Role: {role}"]
    MEP --> C2["🏢 {Committee 2}<br/>Role: {role}"]
    MEP --> C3["🏢 {Committee 3}<br/>Role: {role}"]

    C1 --> A1["📊 Attendance: {N}%<br/>Reports: {N}"]
    C2 --> A2["📊 Attendance: {N}%<br/>Reports: {N}"]
    C3 --> A3["📊 Attendance: {N}%<br/>Reports: {N}"]

    style MEP fill:#003399,color:#fff
    style C1 fill:#FF9800,color:#fff
    style C2 fill:#FF9800,color:#fff
    style C3 fill:#FF9800,color:#fff
```

### 8. Network Centrality (Required)

```markdown
### 🤝 Network Position

| Network Metric | Score | Interpretation |
|---------------|-------|---------------|
| **Centrality Score** | {N.NN} | {How connected within EP} |
| **Bridging Index** | {N.NN} | {Cross-group connection ability} |
| **Cluster Position** | {description} | {Where in the network} |
| **Key Connections** | {N} committees | {Breadth of influence} |
```

### 9. Comparative Context (Required)

When comparing multiple MEPs:

```markdown
### 📊 Peer Comparison

| Dimension | {MEP 1} | {MEP 2} | {MEP 3} | Group Avg |
|-----------|---------|---------|---------|-----------|
| Overall Score | {N}/100 | {N}/100 | {N}/100 | {N}/100 |
| Voting Activity | {N} | {N} | {N} | {N} |
| Legislative Output | {N} | {N} | {N} | {N} |
| Committee Engagement | {N} | {N} | {N} | {N} |
| Oversight | {N} | {N} | {N} | {N} |
| Coalition Building | {N} | {N} | {N} | {N} |
```

### 10. Assessment & Outlook

```markdown
## 🔍 Assessment

**Strengths:**
- {Key strength with evidence}
- {Key strength with evidence}

**Areas of Lower Activity:**
- {Area with context — NOT a value judgment, just factual comparison}

**Notable Patterns:**
- {Pattern with analytical interpretation}

**Confidence Statement:** This scorecard is based on {N} data points from European Parliament MCP public records. All metrics reflect public parliamentary activity only.
```

---

## ⚠️ Important Constraints

- **NO personal judgments** — Present data and let readers draw conclusions
- **NO ranking as "best" or "worst"** — Use comparative metrics without value labels
- **Political neutrality** — Equal analytical rigor regardless of political group
- **Context matters** — A committee chair naturally has higher engagement than a backbencher; always note role context
- **GDPR compliance** — Public parliamentary data only; no personal life information

---

**Last Updated:** 2026-03-28 | **Template Version:** 1.0
