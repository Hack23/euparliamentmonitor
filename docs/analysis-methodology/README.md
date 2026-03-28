<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔍 EU Parliament Monitor — Political Intelligence Analysis Methodology</h1>

<p align="center">
  <strong>📊 Structured Analytical Frameworks for European Parliament Intelligence</strong><br>
  <em>🎯 Templates • Mermaid Diagrams • Color-Coded Assessments • Multi-Language Output</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-Intelligence%20Operative-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--28-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Monthly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** Intelligence Operative | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-03-28 (UTC)
**🔄 Review Cycle:** Monthly | **⏰ Next Review:** 2026-04-28
**🏷️ Classification:** Public — Political Intelligence Methodology Reference

---

## 🎯 Purpose

This directory contains **structured analytical methodology templates** that guide AI agents in producing high-quality political intelligence analysis of European Parliament data. Each template defines:

- **Analytical framework** — The structured methodology (ACH, PESTLE, STRIDE, SWOT, etc.)
- **Expected output format** — Professional markdown with Mermaid diagrams, color-coded assessments, and structured tables
- **Quality standards** — Confidence levels, source attribution, and evidence requirements
- **MCP data sources** — Which European Parliament MCP tools to query for each analysis type

These templates are referenced by agentic workflow files (`.github/workflows/news-*.md`) to ensure the AI produces **extensive, publication-quality analysis** rather than thin data scaffolding.

---

## 📚 Analysis Methodology Templates

```mermaid
mindmap
  root)🔍 Political Intelligence<br/>Analysis Methodology(
    (🏛️ Strategic Assessment)
      [Political Landscape Analysis]
      [Coalition Dynamics Analysis]
      [Committee Power Analysis]
    (⚖️ Risk & Threat)
      [Legislative Risk Assessment]
      [Political STRIDE Assessment]
    (👤 Actor Intelligence)
      [MEP Influence Scorecard]
      [Actor Mapping & Profiling]
    (📰 Reporting)
      [Weekly Intelligence Brief]
      [Monthly Strategic Review]
```

### Template Catalog

| Template | Focus | Key Frameworks | Primary MCP Tools | Output Length |
|----------|-------|----------------|-------------------|--------------|
| **[Political Landscape Analysis](political-landscape-analysis.md)** | 🏛️ Power dynamics & fragmentation | Effective Number of Parties, Seat-Share Analysis | `get_current_meps`, `generate_political_landscape`, `compare_political_groups` | 800–1,500 lines |
| **[Coalition Dynamics Analysis](coalition-dynamics-analysis.md)** | 🤝 Voting alliances & fractures | Alliance Detection, Cohesion Metrics, ACH | `analyze_coalition_dynamics`, `get_voting_records`, `detect_voting_anomalies` | 600–1,200 lines |
| **[Legislative Risk Assessment](legislative-risk-assessment.md)** | ⚖️ Passage probability & pipeline health | PESTLE, Risk Matrix, Monte Carlo-style | `monitor_legislative_pipeline`, `track_legislation`, `get_procedures` | 600–1,000 lines |
| **[MEP Influence Scorecard](mep-influence-scorecard.md)** | 👤 MEP performance & power mapping | 5-Dimension Model, Network Centrality | `assess_mep_influence`, `analyze_voting_patterns`, `network_analysis` | 400–800 lines |
| **[Weekly Intelligence Brief](weekly-intelligence-brief.md)** | 📰 Weekly situational awareness | Early Warning System, Trend Analysis | `early_warning_system`, `get_events_feed`, `get_adopted_texts_feed` | 500–1,000 lines |
| **[Committee Power Analysis](committee-power-analysis.md)** | 🏢 Committee workload & influence | Productivity Scoring, Policy Impact | `analyze_committee_activity`, `get_committee_info`, `analyze_legislative_effectiveness` | 500–900 lines |

---

## 🎨 Visual Quality Standards

All analysis output MUST follow these visual standards (matching the quality of [SWOT.md](../../SWOT.md) and [THREAT_MODEL.md](../../THREAT_MODEL.md)):

### Required Elements

1. **Professional Header** — Centered title with emoji, subtitle, date/confidence badges
2. **Executive Summary** — Key findings table with color-coded risk/impact levels
3. **Mermaid Diagrams** — At minimum 3 per analysis document:
   - One **overview diagram** (mindmap, quadrant chart, or pie chart)
   - One **relationship diagram** (flowchart, sequence, or network graph)
   - One **assessment diagram** (quadrant chart, risk matrix, or radar/spider)
4. **Color-Coded Assessments** — Using badge shields:
   - 🟢 `![Low Risk](https://img.shields.io/badge/Risk-Low-brightgreen)` / High Confidence / Strong
   - 🟡 `![Medium Risk](https://img.shields.io/badge/Risk-Medium-yellow)` / Medium Confidence / Moderate
   - 🔴 `![High Risk](https://img.shields.io/badge/Risk-High-red)` / Low Confidence / Weak
   - 🔵 `![Info](https://img.shields.io/badge/Info-Context-blue)` / Background / Neutral
5. **Structured Tables** — For comparisons, rankings, and multi-dimensional assessments
6. **Source Attribution** — Every claim linked to specific EP MCP data with dates
7. **Confidence Levels** — Explicit on every analytical judgment

### Mermaid Color Coding Convention

```mermaid
quadrantChart
    title Risk Assessment Color Convention
    x-axis Low Probability --> High Probability
    y-axis Low Impact --> High Impact
    quadrant-1 🔴 Critical Risk
    quadrant-2 🟡 Monitor Closely
    quadrant-3 🟢 Acceptable Risk
    quadrant-4 🟡 Emerging Risk
```

### Badge Color Reference

| Level | Badge | Usage |
|-------|-------|-------|
| Critical / Very High | ![Critical](https://img.shields.io/badge/-Critical-darkred?style=flat-square) | Immediate action required |
| High | ![High](https://img.shields.io/badge/-High-red?style=flat-square) | Significant concern |
| Medium | ![Medium](https://img.shields.io/badge/-Medium-orange?style=flat-square) | Monitor and plan |
| Low | ![Low](https://img.shields.io/badge/-Low-brightgreen?style=flat-square) | Acceptable level |
| Info | ![Info](https://img.shields.io/badge/-Info-blue?style=flat-square) | Background context |

---

## 🔄 Integration with Agentic Workflows

### How Templates Are Used

```mermaid
flowchart TD
    A["📥 MCP Data Fetch<br/><em>fetch-stage.ts</em>"] --> B["📊 Data Preparation<br/><em>analysis-stage.ts</em>"]
    B --> C{"🤖 AI Agent<br/>reads methodology<br/>templates"}
    C --> D["📝 Rich Analysis Markdown<br/><em>analysis/{date}/</em>"]
    D --> E["📰 Article Generation<br/><em>generate-stage.ts</em>"]
    E --> F["🌐 Multi-Language HTML<br/><em>news/*.html</em>"]

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
    style F fill:#00BCD4,color:#fff
```

### Workflow Integration Points

All news workflows share a single `analysis/{date}/` directory. This ensures:
- **Comprehensive analysis** — every downloaded MCP file is analyzed once
- **No merge conflicts** — concurrent workflows write to the same directory with `skipCompleted` reuse
- **Full coverage** — all 19 analysis methods including per-document analysis run by default

Each news workflow `.md` file references these templates:

1. **Data Download Phase** — Scripts fetch EP MCP data (keep existing `fetch-stage.ts`)
2. **AI Analysis Phase** — Agent reads methodology templates + fetched data → produces rich markdown analysis of ALL downloaded files
3. **Article Generation Phase** — Agent uses analysis markdown to write news articles

### Template Selection by Article Type

| Article Type | Primary Template | Supporting Templates |
|-------------|-----------------|---------------------|
| `week-ahead` | Weekly Intelligence Brief | Political Landscape, Coalition Dynamics |
| `month-ahead` | Political Landscape Analysis | Legislative Risk, Committee Power |
| `week-in-review` | Weekly Intelligence Brief | Coalition Dynamics, MEP Scorecard |
| `month-in-review` | Political Landscape Analysis | All templates |
| `committee-reports` | Committee Power Analysis | Legislative Risk |
| `propositions` | Legislative Risk Assessment | Coalition Dynamics |
| `motions` | Coalition Dynamics Analysis | MEP Scorecard |
| `breaking` | Weekly Intelligence Brief | Political Landscape |

---

## 📐 Structured Analysis Templates & Methodologies

In addition to the higher-level methodology guides in this directory, EU Parliament Monitor provides **detailed structured analysis templates** and **methodology guides** adapted from the [Riksdagsmonitor analysis framework](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/README.md) for the EU Parliament context:

### Analysis Methodology Guides (`analysis/methodologies/`)

| Methodology | File | ISMS Inspiration | Purpose |
|------------|------|-----------------|---------|
| **Political Classification** | [`analysis/methodologies/political-classification-guide.md`](../../analysis/methodologies/political-classification-guide.md) | [CLASSIFICATION.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) | 7-dimension classification of EP events (sensitivity, urgency, impact) |
| **Political Risk Assessment** | [`analysis/methodologies/political-risk-methodology.md`](../../analysis/methodologies/political-risk-methodology.md) | [Risk_Assessment_Methodology.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md) | Likelihood × Impact scoring across 6 EP risk categories |
| **Political Threat Framework** | [`analysis/methodologies/political-threat-framework.md`](../../analysis/methodologies/political-threat-framework.md) | [Threat_Modeling.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) | STRIDE-adapted framework for EU democratic process threats |
| **Political SWOT Framework** | [`analysis/methodologies/political-swot-framework.md`](../../analysis/methodologies/political-swot-framework.md) | [CIA SWOT.md](https://github.com/Hack23/cia/blob/master/SWOT.md) | Evidence-based SWOT requiring EP document citations |

### Fillable Analysis Templates (`analysis/templates/`)

These templates are designed to be filled by the AI agent (Opus) during the analysis stage:

| Template | File | When to Use |
|----------|------|-------------|
| **Political Classification** | [`analysis/templates/political-classification.md`](../../analysis/templates/political-classification.md) | First step for every new EP event/document |
| **Risk Assessment** | [`analysis/templates/risk-assessment.md`](../../analysis/templates/risk-assessment.md) | Coalition/policy/institutional risk spikes |
| **Threat Analysis** | [`analysis/templates/threat-analysis.md`](../../analysis/templates/threat-analysis.md) | STRIDE-format democratic threat review |
| **SWOT Analysis** | [`analysis/templates/swot-analysis.md`](../../analysis/templates/swot-analysis.md) | Strategic political landscape assessment |
| **Stakeholder Impact** | [`analysis/templates/stakeholder-impact.md`](../../analysis/templates/stakeholder-impact.md) | Policy decision or legislative action impact |
| **Significance Scoring** | [`analysis/templates/significance-scoring.md`](../../analysis/templates/significance-scoring.md) | Publication priority decisions |

> **⚠️ AI Agent Mandate:** When creating analysis artifacts, the AI MUST read the appropriate methodology guide **and** fill the corresponding template for **every downloaded MCP data file**. This ensures complete, evidence-based analysis of all EP data.

---

## 📏 Quality Metrics

### Minimum Output Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Total lines | 400 | 800+ |
| Mermaid diagrams | 3 | 5–8 |
| Structured tables | 2 | 4–6 |
| Confidence assessments | 5 | 10+ |
| Source citations | 10 | 20+ |
| Stakeholder perspectives | 3 | 5–6 |
| Color-coded badges | 5 | 10+ |
| Forward-looking scenarios | 2 | 3–4 |

### Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Approach |
|----------------|-------------------|
| "0 procedures tracked" | "No new procedures detected in the monitoring window — this may indicate a parliamentary recess or data lag" |
| Empty risk matrix | "Risk assessment deferred — insufficient data for the current period. Priority monitoring items identified for next cycle." |
| Generic STRIDE with all "Low" | Context-specific threat assessment with explanations of WHY the level is what it is |
| Tables with only headers | Narrative analysis explaining data gaps and their implications |
| Hardcoded synthetic IDs | Real EP document references with dates and URLs |

---

## 🔒 GDPR & Data Ethics

All analysis templates enforce:

- **Public data only** — European Parliament MCP provides only publicly available data
- **No personal profiling** — MEP analysis covers public roles and voting records only
- **Political neutrality** — No partisan conclusions; present evidence and let citizens decide
- **Methodology transparency** — All analytical frameworks are documented and reproducible
- **Temporal accuracy** — All data citations include specific dates

---

**Last Updated:** 2026-03-28 | **Version:** 1.0 | **Next Review:** 2026-04-28
