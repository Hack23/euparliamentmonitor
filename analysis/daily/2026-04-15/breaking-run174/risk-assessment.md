<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ⚖️ Political Risk Assessment — 15 April 2026 (Run 174)

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Confidence-MEDIUM-yellow?style=for-the-badge" alt="Confidence"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Risk_Level-HIGH-orange?style=for-the-badge" alt="Risk"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Article_Type-Breaking-red?style=for-the-badge" alt="Article Type"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Methodology-5x5_Matrix-purple?style=for-the-badge" alt="Methodology"/></a>
</p>

---

articleType: breaking

---

## 📋 Risk Assessment Context

| Field | Value |
|-------|-------|
| **Assessment ID** | `RSK-2026-04-15-174` |
| **Assessment Date** | 2026-04-15 07:20 UTC |
| **Methodology** | 5×5 Likelihood × Impact matrix (per political-risk-methodology.md) |
| **Data Sources** | 41 adopted texts, 737 MEPs, precomputed stats (85KB), coalition dynamics |
| **EP API Status** | DEGRADED MODE — 2/13 feeds operational |
| **Prior Assessment** | Run 173: Composite 16.5/25 |
| **Current Assessment** | **Composite 13.0/25 (↓ from 16.5)** |
| **Trend Rationale** | Tariff activation reduces anticipatory uncertainty but realizes trade risk |

---

## 📊 Risk Heat Map

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
    title Risk Heat Map — Likelihood vs Impact
    x-axis Low Impact --> Critical Impact
    y-axis Low Likelihood --> Certain
    quadrant-1 Monitor
    quadrant-2 Extreme Risk
    quadrant-3 Accept
    quadrant-4 Mitigate
    RSK-001 Trade Crisis: [0.95, 0.95]
    RSK-002 Coalition Gridlock: [0.55, 0.75]
    RSK-003 Implementation Backlog: [0.55, 0.55]
    RSK-004 API Infrastructure: [0.35, 0.55]
```

---

## 🔴 RSK-001: Trade Policy Crisis — Tariff Activation

| Dimension | Rating | Detail |
|-----------|:------:|--------|
| **Likelihood** | 5/5 CERTAIN | TA-10-2026-0096 activates today (April 15). Legal entry into force confirmed. |
| **Impact** | 5/5 CRITICAL | EU-US trade disruption. Affected sectors: agriculture, industrial goods, consumer products. Market volatility expected. Supply chain reconfiguration for trans-Atlantic trade flows. |
| **Risk Score** | **25/25 EXTREME** | 🔴 Maximum risk — certain event with critical impact |
| **Category** | External + Policy | Externally triggered by US trade policy; EP response now in implementation phase |
| **Velocity** | Immediate | Tariffs become legally enforceable today |

### Mitigants & Controls

| Mitigant | Effectiveness | Confidence |
|----------|:------------:|:----------:|
| Commission has pre-authorised negotiation mandate | 🟡 MEDIUM | 🟢 HIGH — TA-10-2026-0096 text confirms |
| Parliament can vote additional countermeasures if needed | 🟡 MEDIUM | 🟢 HIGH — COD procedure available |
| WTO dispute resolution channels remain open | 🔴 LOW | 🟡 MEDIUM — WTO backlog makes this slow |

### Escalation Pathways

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    A["TA-10-2026-0096<br/>Activated April 15"] --> B{US Response}
    B -->|Negotiate| C["De-escalation<br/>55% probability"]
    B -->|Retaliate| D["Round 2 Tariffs<br/>30% probability"]
    B -->|Ignore| E["Status Quo<br/>15% probability"]
    D --> F{Parliament Action}
    F -->|Emergency debate| G["Additional countermeasures<br/>vote needed"]
    F -->|Committee review| H["INTA oversight<br/>hearing scheduled"]
    G --> I{Coalition Test}
    I -->|EPP+S&D+Renew| J["Majority achieved<br/>323+77=400"]
    I -->|EPP+ECR split| K["Majority uncertain<br/>depends on ECR cohesion"]

    style A fill:#dc3545,color:white
    style D fill:#fd7e14,color:white
    style G fill:#ffc107,color:black
    style K fill:#dc3545,color:white
    style J fill:#28a745,color:white
```

### Trend Analysis

| Period | Risk Score | Trend | Driver |
|--------|:---------:|:-----:|--------|
| Apr 11 (Run 157) | 20/25 | ↑ | T-4 anticipation |
| Apr 13 (Run 168) | 25/25 | ↑ | T-2 peak uncertainty |
| Apr 14 (Run 171) | 25/25 | → | T-1 maintained |
| Apr 15 (Run 173) | 25/25 | → | T-0 activation |
| **Apr 15 (Run 174)** | **25/25** | **→** | **T-0 activated — realized risk** |

---

## 🟠 RSK-002: Legislative Gridlock — Coalition Arithmetic Deficit

| Dimension | Rating | Detail |
|-----------|:------:|--------|
| **Likelihood** | 4/5 LIKELY | EPP (188) + S&D (135) = 323 seats — 38 below 361 majority. Mathematical constraint, not political failure. Every major vote requires 3+ group coalition. |
| **Impact** | 3/5 MODERATE | Delays legislation but doesn't prevent it. Issue-specific coalitions remain viable (EPP+Renew+ECR on trade; EPP+S&D+Greens on environment). |
| **Risk Score** | **12/25 ELEVATED** | 🟠 Structural risk — persistent throughout EP10 term |
| **Category** | Internal + Structural | EP composition constraint since July 2024 elections |
| **Velocity** | Slow-burn | Chronic condition; acute moments at each plenary vote |

### Coalition Arithmetic

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
pie title Seats Needed for Majority (361)
    "EPP" : 188
    "S&D" : 135
    "Gap to majority" : 38
```

| Coalition Option | Seats | Viable? | Policy Domain |
|-----------------|:-----:|:-------:|---------------|
| EPP + S&D + Renew | 400 | ✅ Yes | Environment, digital, social |
| EPP + S&D + Greens | 376 | ✅ Yes | Climate, Green Deal |
| EPP + ECR + Renew | 346 | ❌ No (-15) | — |
| EPP + ECR + PfE | 355 | ❌ No (-6) | — |
| EPP + S&D + ECR | 404 | ✅ Yes | Trade, defence, security |
| S&D + Renew + Greens + Left | 311 | ❌ No (-50) | — |

---

## 🟡 RSK-003: Implementation Backlog — Post-Recess Pipeline Pressure

| Dimension | Rating | Detail |
|-----------|:------:|--------|
| **Likelihood** | 3/5 POSSIBLE | 13 new COD procedures + Banking Union trilogue + anti-corruption trilogue + water pollutants all restart simultaneously after 18-day Easter recess. |
| **Impact** | 3/5 MODERATE | Delays transposition timelines. If Banking Union delayed, eurozone financial stability framework incomplete. If anti-corruption delayed, institutional credibility cost. |
| **Risk Score** | **9/25 MODERATE** | 🟡 Manageable with committee scheduling coordination |
| **Category** | Internal + Procedural | Calendar constraint amplified by record Q1 output |
| **Velocity** | Medium | Effects materialise over weeks as committees reconvene |

### Pipeline Status

| Legislative File | EP Reference | Stage | Next Step | Risk |
|-----------------|-------------|-------|-----------|------|
| SRMR3 — Single Resolution Mechanism Reform | TA-10-2026-0092 | Trilogue | Council common position | 🟡 |
| BRRD3 — Bank Recovery and Resolution | TA-10-2026-0091 | Trilogue | Council common position | 🟡 |
| DGSD2 — Deposit Guarantee Scheme | TA-10-2026-0090 | Trilogue | Council common position | 🟡 |
| Anti-Corruption Directive | TA-10-2026-0094 | Trilogue | Compromise text | 🟡 |
| US Tariff Countermeasures | TA-10-2026-0096 | Activated | Commission implementation | 🟢 |
| Water Pollutants Revision | TA-10-2026-0097 | Committee | Rapporteur assignment | 🟡 |

---

## 🟢 RSK-004: EP API Infrastructure Degradation

| Dimension | Rating | Detail |
|-----------|:------:|--------|
| **Likelihood** | 3/5 POSSIBLE | 8+ consecutive days of degraded service during Easter recess. 2/13 feeds operational in current assessment. Pattern: feed endpoints use /feed API path which is more fragile than direct endpoints. |
| **Impact** | 2/5 LOW | Affects monitoring and analysis capability only. Does not impact EP governance or legislative process. Workaround available via precomputed stats. |
| **Risk Score** | **6/25 LOW** | 🟢 Operational nuisance, not governance risk |
| **Category** | Technical + Infrastructure | EP Open Data Portal maintenance/reliability issue |
| **Velocity** | Variable | Can resolve suddenly when EP IT team addresses; or persist for weeks |

---

## 📊 Composite Risk Assessment

| Risk ID | Description | Score | Trend | Category |
|---------|-------------|:-----:|:-----:|----------|
| RSK-001 | Trade Policy Crisis (Tariff T-0) | 25/25 | → | External |
| RSK-002 | Coalition Gridlock | 12/25 | → | Structural |
| RSK-003 | Implementation Backlog | 9/25 | ↗ | Procedural |
| RSK-004 | API Infrastructure | 6/25 | → | Technical |
| **COMPOSITE** | **Weighted Average** | **13.0/25** | **↓** | **Mixed** |

### Composite Trend

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
xychart-beta
    title "Composite Risk Score — Runs 157-174"
    x-axis ["R157", "R168", "R169", "R171", "R173", "R174"]
    y-axis "Score (0-25)" 0 --> 25
    line [20, 17, 16, 16.5, 16.5, 13]
```

**Trend Interpretation:** The composite risk score decreased from 16.5 to 13.0 between Run 173 and Run 174. This decrease reflects the transformation of tariff risk from anticipatory (uncertain) to realized (certain but now manageable). The trade policy risk score remains at maximum 25/25, but its character has shifted from "will it happen?" to "how will it be managed?" — which reduces compound uncertainty across other risk factors.

---

*Risk assessment produced by EU Parliament Monitor — news-breaking Run 174. Methodology: 5×5 Likelihood × Impact matrix per analysis/methodologies/political-risk-methodology.md. Data: EP Open Data Portal (DEGRADED MODE).*
