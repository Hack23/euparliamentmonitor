---
method: risk-matrix
date: 2026-04-13
articleType: motions
confidence: medium
generated: 2026-04-13T18:14:00Z
runId: 39
---

# ⚖️ Risk Matrix — Motions Intelligence (2026-04-13, Run 39)

## Risk Assessment Context

| Field | Value |
|-------|-------|
| **Assessment Basis** | Precomputed stats + prior analysis (no live EP API data) |
| **Risk Framework** | Likelihood x Impact (5x5 matrix) |
| **Overall Risk Level** | 🟠 HIGH (driven by trade deadline proximity) |
| **Confidence** | 🟡 MEDIUM |

## Risk Matrix Visualization

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#1565C0",
    "quadrant2Fill": "#2E7D32",
    "quadrant3Fill": "#FF9800",
    "quadrant4Fill": "#D32F2F",
    "quadrantTitleFill": "#ffffff",
    "quadrantPointFill": "#ffffff",
    "quadrantPointTextFill": "#ffffff",
    "quadrantXAxisTextFill": "#ffffff",
    "quadrantYAxisTextFill": "#ffffff"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 14,
    "titleFontSize": 22,
    "quadrantLabelFontSize": 18,
    "xAxisLabelFontSize": 16,
    "yAxisLabelFontSize": 16
  }
}}%%
quadrantChart
    title Motions Risk Matrix (Likelihood vs Impact)
    x-axis Low Likelihood --> High Likelihood
    y-axis Low Impact --> High Impact
    quadrant-1 Critical Risk
    quadrant-2 Strategic Risk
    quadrant-3 Monitor
    quadrant-4 Operational Risk
    US Tariff Escalation: [0.90, 0.95]
    Banking Trilogue Deadlock: [0.55, 0.75]
    Pipeline Congestion: [0.70, 0.60]
    Anti-Corruption Transposition Delay: [0.45, 0.65]
    EP API Data Gap: [0.85, 0.40]
    Coalition Fragmentation: [0.50, 0.70]
```

## Detailed Risk Register

### R1: US Tariff Escalation (CRITICAL)

| Parameter | Value |
|-----------|-------|
| **Risk ID** | R1-TRADE-2026-0413 |
| **Likelihood** | 5/5 — April 15 deadline in 2 days |
| **Impact** | 5/5 — Direct economic and political consequences |
| **Score** | 🔴 25/25 (CRITICAL) |
| **Trend** | ↑ Escalating |
| **Source** | TA-10-2026-0096 (adopted Mar 26) |

**Analysis**: The EU countermeasures resolution adopted March 26 authorized the Commission to implement retaliatory tariffs by April 15. With Parliament in Easter recess until April 14, there has been no parliamentary oversight of Commission preparations. The T-1 day return creates a collision between parliamentary scrutiny expectations and implementation deadlines.

**Motions implication**: Expect urgent oral questions, possible motion for resolution on implementation oversight, and INTA emergency debate within first post-Easter sitting.

### R2: Banking Union Trilogue Stalemate (HIGH)

| Parameter | Value |
|-----------|-------|
| **Risk ID** | R2-BANK-2026-0413 |
| **Likelihood** | 3/5 — Council positions diverge on DGSD2 |
| **Impact** | 4/5 — Banking union completion delayed further |
| **Score** | 🟠 12/25 (HIGH) |
| **Trend** | → Stable |
| **Source** | TA-10-2026-0090/91/92 (adopted Mar 26) |

**Analysis**: Parliament adopted all three Banking Union texts (SRMR3, BRRD3, DGSD2) in the March 26 plenary, giving ECON a strong negotiating mandate. However, Council remains divided on deposit guarantee mutualisation. The trilogue launch in late April will test whether the grand coalition (EPP+S&D+Renew) mandate holds against national government resistance.

**Motions implication**: Resolution motions on banking union timeline, possible oral questions to Council presidency on negotiation calendar.

### R3: Post-Easter Pipeline Congestion (ELEVATED)

| Parameter | Value |
|-----------|-------|
| **Risk ID** | R3-PIPE-2026-0413 |
| **Likelihood** | 4/5 — 13 COD procedures queued |
| **Impact** | 3/5 — Delayed committee assignments |
| **Score** | 🟡 12/25 (ELEVATED) |
| **Trend** | ↑ Increasing |
| **Source** | Precomputed stats: 935 procedures active in 2026 |

**Analysis**: 13 new COD procedures from Q1 2026 await rapporteur appointment and committee assignment post-Easter. Combined with the trade crisis agenda and banking trilogue prep, committee scheduling capacity is at risk. The 43.8 committee-to-plenary ratio (highest in EP history) reflects increasing workload pressure.

### R4: Anti-Corruption Transposition Risk (MODERATE)

| Parameter | Value |
|-----------|-------|
| **Risk ID** | R4-CORR-2026-0413 |
| **Likelihood** | 3/5 — Member states historically slow |
| **Impact** | 3/5 — EU credibility at stake |
| **Score** | 🟡 9/25 (MODERATE) |
| **Trend** | → Stable |
| **Source** | TA-10-2026-0094 |

**Analysis**: The Anti-Corruption Directive has a 24-month transposition deadline. Early signals of constitutional challenges in some member states could trigger parliamentary motions demanding Commission enforcement action.

### R5: EP API Data Continuity (OPERATIONAL)

| Parameter | Value |
|-----------|-------|
| **Risk ID** | R5-DATA-2026-0413 |
| **Likelihood** | 5/5 — Currently occurring |
| **Impact** | 2/5 — Operational impact on monitoring |
| **Score** | 🟡 10/25 (ELEVATED) |
| **Trend** | ↑ 12+ consecutive degraded runs |
| **Source** | This run diagnostic |

**Analysis**: The EP Open Data API has been intermittently unavailable since April 11, coinciding with Easter recess infrastructure maintenance. 12+ consecutive workflow runs across all article types have experienced degraded or failed MCP connectivity. This creates a monitoring blind spot during a critical pre-restart period.

## Aggregate Risk Dashboard

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
pie title Risk Distribution by Category
    "Trade Policy (CRITICAL)" : 25
    "Financial Regulation (HIGH)" : 12
    "Pipeline Management (ELEVATED)" : 12
    "Data Continuity (ELEVATED)" : 10
    "Rule of Law (MODERATE)" : 9
    "Coalition Dynamics (MODERATE)" : 8
```

## Risk Trend Summary

| Risk Category | Apr 10 Score | Apr 13 Score | Change | Driver |
|--------------|:-----------:|:-----------:|:------:|--------|
| Trade Escalation | 16 | 25 | ↑ +9 | Deadline now T-2 (was T-5) |
| Banking Trilogue | 12 | 12 | → 0 | No new information |
| Pipeline Congestion | 12 | 12 | → 0 | Easter recess unchanged |
| Anti-Corruption | 9 | 9 | → 0 | Stable |
| Data Continuity | N/A | 10 | NEW | EP API outage since Apr 11 |
