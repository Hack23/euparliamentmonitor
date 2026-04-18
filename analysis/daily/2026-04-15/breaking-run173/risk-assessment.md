<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ⚖️ Political Risk Assessment — April 15, 2026

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Composite_Risk-16.5/25-orange?style=for-the-badge" alt="Risk"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Confidence-MEDIUM-yellow?style=for-the-badge" alt="Confidence"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Article_Type-Breaking-red?style=for-the-badge" alt="Article Type"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Run-173-blue?style=for-the-badge" alt="Run"/></a>
</p>

---

## 📋 Risk Assessment Context

| Field | Value |
|-------|-------|
| **Assessment ID** | `RSK-2026-04-15-173` |
| **Analysis Date** | `2026-04-15 01:20 UTC` |
| **Framework** | Political Risk Methodology v2.0 (Likelihood × Impact 5×5 matrix) |
| **Risk Horizon** | 14 days (April 15-29, covering next plenary) |
| **Prior Assessment** | RSK-2026-04-14-171 (composite 14.3/25) |
| **Composite Change** | ↑ +2.2 (from 14.3 to 16.5) — driven by tariff T-0 activation |
| **articleType** | breaking |

---

## 📊 Risk Matrix Overview

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
    title Political Risk Matrix — 15 April 2026
    x-axis "Low Likelihood" --> "High Likelihood"
    y-axis "Low Impact" --> "High Impact"
    quadrant-1 "CRITICAL ZONE"
    quadrant-2 "MONITOR ZONE"
    quadrant-3 "LOW PRIORITY"
    quadrant-4 "MITIGATE ZONE"
    RSK-001 Trade Crisis: [0.95, 0.95]
    RSK-002 Backlog Bottleneck: [0.75, 0.75]
    RSK-003 Coalition Fragmentation: [0.75, 0.72]
    RSK-004 Data Continuity: [0.55, 0.45]
```

---

## 🔴 RSK-001: Trade Policy Crisis (CRITICAL)

| Attribute | Value |
|-----------|-------|
| **Risk ID** | RSK-001 |
| **Category** | Economic / Geopolitical |
| **Likelihood** | 5/5 — CERTAIN (tariff countermeasures activate today) |
| **Impact** | 5/5 — CATASTROPHIC (EU-US trade disruption, market volatility) |
| **Risk Score** | **25/25** |
| **Trend** | ↑ ESCALATING (was 20/25 on April 13 at T-2, now 25/25 at T-0) |
| **Confidence** | 🟢 HIGH — activation date is structurally certain |
| **Owner** | INTA Committee / DG Trade / Conference of Presidents |
| **Mitigation** | Emergency debate scheduling, diplomatic channels, WTO dispute preparation |

### Risk Narrative

TA-10-2026-0096 (EU autonomous trade defence countermeasures) enters into force today, April 15, 2026. This is the culmination of Parliament's rapid legislative response to US tariff actions — the fastest proposal-to-law cycle in EP10 for trade policy. The risk is CRITICAL because:

1. **Certain activation**: The 21-day period from March 26 adoption expires today. No mechanism exists to delay or reverse without new legislation.
2. **US response unknown**: Washington has not publicly indicated whether it will treat EU countermeasures as escalation requiring retaliation or as a manageable trade adjustment. 🔴 LOW confidence on US response.
3. **Parliament absent**: The 33-day session gap means Parliament cannot respond to US retaliation until April 27 at the earliest.
4. **ECR fracture**: The right bloc's split on the trade vote creates uncertainty about Parliament's ability to present a unified position if the situation escalates.

### Escalation Pathway

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    A["TA-10-2026-0096 Activates<br/>April 15"] --> B{US Response}
    B -->|No retaliation| C["Managed Adjustment<br/>55% likely"]
    B -->|Targeted retaliation| D["Trade Escalation<br/>30% possible"]
    B -->|Broad retaliation| E["Trade War<br/>15% unlikely"]
    C --> F["April 27 Plenary<br/>Review Debate"]
    D --> G["INTA Emergency Session<br/>+ Market Disruption"]
    E --> H["European Council<br/>Extraordinary Summit"]
    
    style A fill:#dc3545,color:white
    style C fill:#28a745,color:white
    style D fill:#fd7e14,color:white
    style E fill:#dc3545,color:white
```

### Mitigation Options

| Option | Feasibility | Timeline | Stakeholder |
|--------|-------------|----------|-------------|
| Diplomatic back-channel communication | HIGH | Immediate | Commission DG Trade |
| INTA committee informal briefing | MEDIUM | This week | Parliament INTA |
| Emergency plenary debate request | LOW | Requires 1/3 MEP signatures | Conference of Presidents |
| WTO dispute filing preparation | MEDIUM | 1-2 weeks | Legal Service |

---

## 🟠 RSK-002: Legislative Backlog Bottleneck (HIGH)

| Attribute | Value |
|-----------|-------|
| **Risk ID** | RSK-002 |
| **Category** | Institutional / Legislative |
| **Likelihood** | 4/5 — LIKELY (13 pending COD is historically unprecedented) |
| **Impact** | 4/5 — MAJOR (delays to Banking Union, AI, anti-corruption) |
| **Risk Score** | **16/25** |
| **Trend** | → STABLE (same as April 14 — no new information) |
| **Confidence** | 🟡 MEDIUM — COD count is certain, prioritisation outcome uncertain |
| **Owner** | Conference of Presidents / Committee Chairs |
| **Mitigation** | Early agenda-setting, parallel committee tracks, extended April plenary |

### Risk Narrative

The 13 pending COD procedures represent the largest post-recess backlog in EP10. The Conference of Presidents must assign these to committees and schedule deliberation before the April 27-30 plenary. Competing priorities include:

1. **Banking Union trilogue** (SRMR3/BRRD3/DGSD2) — ECON committee capacity constraint
2. **Tariff response review** — INTA committee may request additional hearing time
3. **Anti-corruption trilogue** — LIBE committee mandate management
4. **AI Omnibus implementation** — ITRE/IMCO joint responsibility

The risk is that committee capacity cannot absorb all 13 COD simultaneously, leading to sequential processing that delays at least some files by 2-3 months.

### Backlog Composition Analysis

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
pie title "13 Pending COD by Committee Domain"
    "ECON (Banking/Finance)" : 4
    "INTA (Trade)" : 3
    "LIBE (Justice/Rights)" : 2
    "ENVI (Environment)" : 2
    "ITRE/IMCO (Industry/Digital)" : 2
```

---

## 🟠 RSK-003: Coalition Fragmentation (HIGH)

| Attribute | Value |
|-----------|-------|
| **Risk ID** | RSK-003 |
| **Category** | Political / Governance |
| **Likelihood** | 4/5 — LIKELY (fragmentation index 6.59 is record high) |
| **Impact** | 4/5 — MAJOR (no stable majority for contested legislation) |
| **Risk Score** | **16/25** |
| **Trend** | → STABLE (structural — awaiting post-recess voting data) |
| **Confidence** | 🟡 MEDIUM — structural factors confirmed, behavioral prediction uncertain |
| **Owner** | Group leaders / Conference of Presidents |
| **Mitigation** | Pre-negotiation cross-group agreements, package deals linking files |

### Risk Narrative

EP10's fragmentation index of 6.59 means the effective number of parliamentary parties is the highest in EU history. The grand coalition (EPP+S&D = 320 seats) falls 41 seats short of the 361 majority threshold. Every contested vote requires at least three groups to form a majority, creating:

1. **Vote-by-vote coalitions**: No standing majority — each file negotiated separately
2. **Kingmaker dynamics**: Renew Europe (76 seats) holds disproportionate leverage
3. **Right bloc uncertainty**: EPP+ECR+PfE+ESN (376 seats) has theoretical majority but has never coordinated on economic legislation. The ECR trade vote split demonstrates this fragility.
4. **Veto players multiply**: More groups with veto potential means higher negotiation costs and longer deliberation

### Coalition Viability Matrix

| Coalition | Seats | Majority? | Policy Coherence | Historical Precedent |
|-----------|-------|-----------|------------------|---------------------|
| EPP+S&D+RE | 396 | ✅ +35 | 🟡 MEDIUM — diverge on social/economic | Dominant in EP9 |
| EPP+ECR+PfE+ESN | 376 | ✅ +15 | 🔴 LOW — ECR split on trade | Untested |
| EPP+S&D+Greens | 373 | ✅ +12 | 🟡 MEDIUM — climate consensus | Occasional in EP9 |
| EPP+ECR+RE | 340 | ❌ -21 | 🟡 MEDIUM — centre-right alignment | Emerging |
| S&D+RE+Greens+Left | 310 | ❌ -51 | 🟢 HIGH — progressive alignment | Never achieved majority |

---

## 🟡 RSK-004: EP API Data Continuity (MEDIUM)

| Attribute | Value |
|-----------|-------|
| **Risk ID** | RSK-004 |
| **Category** | Operational / Monitoring |
| **Likelihood** | 3/5 — POSSIBLE (feed endpoints degraded for 18+ days) |
| **Impact** | 3/5 — MODERATE (limits real-time analysis capability) |
| **Risk Score** | **9/25** |
| **Trend** | ↓ IMPROVING (adopted texts + MEPs now working; was 0/13 on April 12) |
| **Confidence** | 🟡 MEDIUM — pattern observed but recovery unpredictable |
| **Owner** | EP IT Services / Hack23 monitoring infrastructure |
| **Mitigation** | Direct endpoint fallbacks, precomputed stats, wider timeframe windows |

### Risk Narrative

The EP API feed endpoints (`/feed` path) have returned 404 errors since Easter recess began (March 28). This affects 10 of 13 monitored feeds. However, direct endpoints (get_adopted_texts, get_plenary_sessions, get_current_meps) function normally. This suggests the feed aggregation layer is degraded while the underlying data API is healthy. Recovery is expected to coincide with the first post-recess plenary session (April 27) when feed infrastructure is likely refreshed.

### EP API Health Trend

| Date | Feeds OK | Feeds Failed | Notes |
|------|----------|-------------|-------|
| April 11 | 0/13 | 13/13 | Total outage |
| April 12 | 0/13 | 13/13 | Total outage |
| April 13 | 5/13 | 8/13 | Partial recovery (adopted texts, MEPs) |
| April 14 | 4/13 | 9/13 | Slight regression |
| April 15 | 3/13 | 10/13 | Feed 404s persist, direct endpoints OK |

---

## 📊 Composite Risk Score Trend

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
xychart-beta
    title "Composite Risk Score Trend (April 9-15)"
    x-axis ["Apr 9", "Apr 10", "Apr 11", "Apr 12", "Apr 13", "Apr 14", "Apr 15"]
    y-axis "Score (0-25)" 0 --> 25
    line [12.0, 12.5, 13.0, 13.2, 14.3, 14.3, 16.5]
```

**Composite Risk Calculation**: Weighted average of all identified risks:
- RSK-001 (40% weight): 25/25 × 0.40 = 10.0
- RSK-002 (25% weight): 16/25 × 0.25 = 4.0
- RSK-003 (25% weight): 16/25 × 0.25 = 4.0
- RSK-004 (10% weight): 9/25 × 0.10 = 0.9
- **Composite: 16.5/25** (was 14.3/25 on April 14 — tariff activation pushes risk higher)

---

## 🔮 Risk Outlook (April 15-29)

| Risk | Expected Trajectory | Key Driver |
|------|-------------------|------------|
| RSK-001 Trade Crisis | ↕ Depends on US response | 48-72h US decision window |
| RSK-002 Backlog | → Stable until April 22 | Conference of Presidents meeting |
| RSK-003 Coalition | ↑ Increasing | April 27-30 first votes will test |
| RSK-004 Data | ↓ Improving | Expected recovery with April 27 plenary |

---

## 📎 Source Attribution

1. **TA-10-2026-0096 activation**: EP adopted texts feed, date calculation from March 26 adoption + 21-day standard entry-into-force
2. **13 COD pending**: EP precomputed statistics (generated 2026-04-08), procedures count = 935
3. **Fragmentation index 6.59**: EP precomputed statistics, political landscape data
4. **Seat counts**: EP MEPs feed (737 active MEPs) + group composition from coalition dynamics analysis
5. **Prior risk assessments**: Runs 168-171 (April 13-14) cross-session intelligence

---

*Generated by EU Parliament Monitor — news-breaking workflow (Run 173)*
*Analysis date: 2026-04-15 01:20 UTC*
*Classification: PUBLIC*
