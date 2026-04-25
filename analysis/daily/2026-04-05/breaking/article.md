---
title: "Breaking News Intelligence Brief - European Parliament"
description: "analyst: EU Parliament Monitor Agentic Workflow"
date: 2026-04-05
article_type: breaking
slug: 2026-04-05-breaking-breaking
source_folder: analysis/daily/2026-04-05/breaking
generated_at: 2026-04-05T00:00:00.000Z
language: en
layout: article
---
# Breaking — 2026-04-05

<!-- Aggregated analysis — do not edit; regenerate via `npm run generate-article`. -->

> **Provenance**
>
> - **Article type:** `breaking`
> - **Run date:** 2026-04-05
> - **Run id:** `breaking`
> - **Gate result:** `PENDING`
> - **Analysis tree:** [analysis/daily/2026-04-05/breaking](https://github.com/Hack23/euparliamentmonitor/tree/main/analysis/daily/2026-04-05/breaking)
> - **Manifest:** [manifest.json](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/manifest.json)

<h2 id="section-supplementary-intelligence">Supplementary Intelligence</h2>

### Intelligence Brief

<p class="artifact-source"><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/intelligence-brief.md" rel="noopener">View source: <code>intelligence-brief.md</code></a></p>

### Situation Overview

| Domain | Activity Level | Key Signal | Alert Status |
|--------|---------------|------------|-------------|
| **Plenary Activity** | None | Easter recess (27 March - 13 April) | Inactive |
| **Legislative Pipeline** | Low | 85 pre-recess adopted texts in one-week feed | Monitoring |
| **Committee Work** | None | Resumes 14 April (committee week) | Inactive |
| **Political Dynamics** | Low | PPE dominance risk HIGH; stability 84/100 | Watch |
| **Data Availability** | Degraded | 6/8 EP API feed endpoints returning 404 | Degraded |

---

### Executive Summary

The European Parliament remains in Easter recess (27 March - 13 April 2026). No parliamentary sessions, committee meetings, or votes are scheduled. The EP Open Data API continues to show degraded performance, with 6 of 8 feed endpoints returning 404 errors - a recurring pattern during recess periods first observed in this monitoring cycle on 28 March.

**Key finding:** The one-week adopted texts feed reveals 85 items, including 70 EP10 texts (TA-10-2026-0035 through TA-10-2026-0104) and 15 EP9/EP10-2025 texts (updates to earlier adopted texts). This pre-recess legislative push represents significant output that merits post-recess implementation monitoring. Confidence: HIGH - direct EP data.

**Analytical value of this run:** Continuing to document the EP API degradation pattern during recess periods. This is a continuing observation (since 28 March) of reduced API availability, confirming a systematic pattern rather than isolated failures.

---

### Parliamentary Calendar Context

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
gantt
    title EP10 Easter Period 2026
    dateFormat YYYY-MM-DD
    axisFormat %d %b

    section Plenary
    Pre-Easter Plenary (Strasbourg)   :done, 2026-03-23, 2026-03-26
    Post-Easter Plenary (Strasbourg)  :active, 2026-04-20, 2026-04-23

    section Recess
    Easter Recess                      :crit, 2026-03-27, 2026-04-13

    section Committee
    Committee Week                     :2026-04-14, 2026-04-17

    section Today
    TODAY (5 April)                    :milestone, 2026-04-05, 0d
```

Parliament is at the midpoint of the 18-day Easter recess. The next institutional activity is the committee week beginning 14 April, followed by the Strasbourg plenary session 20-23 April. Confidence: HIGH - EP calendar.

---

### Pre-Recess Legislative Output Analysis

#### Adopted Texts Inventory (One-Week Feed)

The one-week feed contains **85 adopted texts** spanning two parliamentary terms:

| Term | Range | Count | Significance |
|------|-------|-------|-------------|
| EP10 (2026) | TA-10-2026-0035 to TA-10-2026-0104 | 70 | Current term legislative output |
| EP10 (2025) | TA-10-2025-0279 to TA-10-2025-0314 | 8 | Late-2025 texts updated in feed |
| EP9 (2024) | TA-9-2024-0177 to TA-9-2024-0186 | 7 | Historical texts with metadata updates |

**Analysis:** The 70 EP10-2026 adopted texts represent a significant pre-recess legislative push. At this pace (104 texts in Q1 2026 alone), the projected annual output of approximately 114 legislative acts identified in prior analyses appears on track. This is a +46% increase over 2025 (78 acts). Confidence: MEDIUM - projection based on Q1 data.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
pie title Adopted Texts by Parliamentary Term (One-Week Feed)
    "EP10 (2026)" : 70
    "EP10 (2025)" : 8
    "EP9 (2024)" : 7
```

---

### EP API Health Assessment

#### Feed Endpoint Status Matrix

| Endpoint | Today | One-Week | Status |
|----------|-------|----------|--------|
| get_adopted_texts_feed | Error | 85 items | Partial |
| get_events_feed | 404 | 404 | **Down** |
| get_procedures_feed | 404 | 404 | **Down** |
| get_meps_feed | 737 MEPs | - | Operational |
| get_documents_feed | - | 404 | **Down** |
| get_plenary_documents_feed | - | 404 | **Down** |
| get_committee_documents_feed | - | 404 | **Down** |
| get_parliamentary_questions_feed | - | 404 | **Down** |

**Pattern analysis:** The MEPs feed and adopted texts feed (one-week) remain operational, while activity-related feeds (events, procedures, documents, questions) consistently return 404. This suggests the EP API feed infrastructure deprioritises activity endpoints during recess periods, while static/roster data remains available. Confidence: MEDIUM - pattern observed across multiple monitoring runs.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    subgraph Operational
        A["MEPs Feed - 737 active"]
        B["Adopted Texts - 85 items"]
    end

    subgraph Down_During_Recess
        C["Events Feed"]
        D["Procedures Feed"]
        E["Documents Feed"]
        F["Plenary Docs"]
        G["Committee Docs"]
        H["Questions"]
    end

    style A fill:#198754,color:#fff
    style B fill:#198754,color:#fff
    style C fill:#dc3545,color:#fff
    style D fill:#dc3545,color:#fff
    style E fill:#dc3545,color:#fff
    style F fill:#dc3545,color:#fff
    style G fill:#dc3545,color:#fff
    style H fill:#dc3545,color:#fff
```

**Recommendation:** Automated monitoring should implement a recess mode that: (a) reduces feed polling frequency during known recess periods, (b) focuses on MEP roster and adopted texts feeds which remain available, (c) resumes full-frequency polling 2 days before scheduled committee activity. Confidence: MEDIUM.

---

### Political Landscape Snapshot

#### Current Group Composition

| Group | Seat Share | Bloc | Role |
|-------|-----------|------|------|
| **PPE** | 38.0% | Centre-Right | Dominant group |
| **S&D** | 22.0% | Centre-Left | Junior coalition partner |
| **PfE** | 11.0% | Right | Third force |
| **Verts/ALE** | 10.0% | Green-Left | Opposition |
| **ECR** | 8.0% | Conservative | Swing group |
| **Renew** | 5.0% | Liberal | Small group |
| **NI** | 4.0% | Non-attached | Mixed |
| **The Left** | 2.0% | Left | Smallest group |

**Grand coalition arithmetic:** PPE (38%) + S&D (22%) = 60% - viable majority above the approximately 51% threshold. However, this relies on both groups maintaining internal discipline. Confidence: MEDIUM.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
pie title EP10 Political Group Seat Distribution (April 2026)
    "PPE" : 38
    "S&D" : 22
    "PfE" : 11
    "Verts/ALE" : 10
    "ECR" : 8
    "Renew" : 5
    "NI" : 4
    "The Left" : 2
```

#### Bloc Analysis

| Bloc | Groups | Combined Share | Viability |
|------|--------|---------------|-----------|
| Grand Coalition | PPE + S&D | 60% | Viable majority |
| Centre-Right Broad | PPE + ECR + PfE | 57% | Viable but ideological tensions |
| Progressive | S&D + Verts/ALE + Renew + Left | 39% | Insufficient for majority |
| Right-of-Centre | PPE + ECR + PfE + NI | 61% | Viable but NI unreliable |

---

### Early Warning Indicators

#### Active Warnings

| Severity | Type | Description | Recommended Action |
|----------|------|-------------|-------------------|
| HIGH | PPE Dominance Risk | PPE is 19x the size of the smallest group | Monitor minority group coalition formation; track committee chair distribution |
| MEDIUM | High Fragmentation | 8 political groups - complex coalition building | Watch for cross-group voting patterns post-Easter |
| LOW | Small Group Quorum | Renew, NI, The Left (5% or less) may struggle | Monitor post-Easter attendance rates |

#### Stability Assessment

- **Overall stability score:** 84/100 (MEDIUM confidence)
- **Parliamentary fragmentation:** 4.04 effective parties (moderate-high)
- **Grand coalition viability:** POSITIVE - 60% combined seat share
- **Minority representation:** Healthy - 6% in groups with less than 5% seat share
- **Key risk factor:** PPE dominance - 38% approaching threshold where single-group vetoes become frequent

---

### Forward-Looking Scenarios

#### Scenario A: Smooth Return - LIKELY (approximately 60%)
Parliament resumes 14 April with committee week. EP API recovers to full operational status. Pre-recess legislative momentum continues seamlessly. PPE-S&D grand coalition holds on key files in the 20-23 April Strasbourg plenary. No significant coalition shifts.

**Indicators to watch:** API feed recovery on 14 April; committee meeting agendas published by 10 April; no MEP group-switching announcements during recess.

#### Scenario B: Post-Easter Realignment - POSSIBLE (approximately 25%)
Right-of-centre groups (PPE + ECR + PfE) used recess bilateral talks to build issue-specific alliances, particularly on migration and trade policy. This becomes visible in the first post-Easter roll-call votes. S&D pushed towards Greens/EFA on social policy in response.

**Indicators to watch:** Joint EPP-ECR-PfE statements during recess; S&D-Greens joint press events; first post-Easter roll-call vote alignment patterns.

#### Scenario C: Legislative Bottleneck - UNLIKELY (approximately 15%)
Committee week overwhelmed by backlog from pre-recess push. Key legislative files delayed into May. Smaller groups exploit procedural tools (quorum calls, referral back to committee) to slow the dominant PPE agenda.

**Indicators to watch:** Committee agenda density 14-17 April; Rule 144 (referral back) requests; delayed rapporteur nominations.

---

### Monitoring Priorities - Week of 7-13 April 2026

1. **EP API Recovery Watch** - Check daily for feed endpoint restoration (expected approximately 14 April)
2. **April Plenary Agenda** - Expected publication approximately 10 April; critical for week-ahead intelligence
3. **MEP Roster Changes** - Monitor for group-switching or departures announced during recess
4. **Commission Proposals** - External document feed may contain new legislative proposals tabled during recess
5. **Pre-Plenary Positioning** - Watch for political group statements previewing April plenary positions

---

### Sources and Attribution

| Source | Tool / Endpoint | Data Point | Confidence |
|--------|----------------|------------|------------|
| EP Adopted Texts Feed | get_adopted_texts_feed(one-week) | 85 adopted texts | HIGH |
| EP MEPs Feed | get_meps_feed(today) | 737 active MEPs | HIGH |
| Voting Anomalies | detect_voting_anomalies | 0 anomalies, stability 100 | LOW |
| Coalition Dynamics | analyze_coalition_dynamics | Size-ratio cohesion only | LOW |
| Political Landscape | generate_political_landscape | 8 groups, PPE 38% | MEDIUM |
| Early Warning System | early_warning_system | Stability 84, 3 warnings | MEDIUM |
| Precomputed Stats | get_all_generated_stats | Historical context 2004-2026 | HIGH |
| Editorial Memory | Repo memory (prior runs) | Recess dates, monitoring patterns | HIGH |

**Methodology:** 4-pass analysis refinement cycle per ai-driven-analysis-guide.md v4.0. All 6 methodology documents consulted. Political Threat Landscape + Risk Assessment + SWOT frameworks applied.

---

*Generated by EU Parliament Monitor Agentic Workflow - 5 April 2026 00:20 UTC*
*Data source: European Parliament Open Data Portal - data.europarl.europa.eu*

### Political Landscape Analysis

<p class="artifact-source"><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/political-landscape-analysis.md" rel="noopener">View source: <code>political-landscape-analysis.md</code></a></p>

### Current Political Configuration

The 10th European Parliament (EP10) operates with 8 political groups spanning 23 member states. The current configuration, assessed at the midpoint of the Easter recess, shows a PPE-dominant landscape with high fragmentation requiring multi-party coalitions for every major vote.

#### Group Strength and Positioning

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    subgraph Centre_Right["Centre-Right Bloc (57%)"]
        PPE["PPE
38% | Dominant"]
        ECR["ECR
8% | Conservative"]
        PfE["PfE
11% | Right"]
    end

    subgraph Centre_Left["Progressive Bloc (39%)"]
        SD["S&D
22% | Centre-Left"]
        VERTS["Verts/ALE
10% | Green"]
        RENEW["Renew
5% | Liberal"]
        LEFT["The Left
2% | Left"]
    end

    subgraph Other["Non-Attached (4%)"]
        NI["NI
4% | Mixed"]
    end

    PPE -.->|"Grand Coalition (60%)"| SD
    PPE -.->|"Centre-Right (57%)"| ECR
    PPE -.->|"Centre-Right (57%)"| PfE

    style PPE fill:#003399,color:#fff
    style SD fill:#cc0000,color:#fff
    style RENEW fill:#FFD700,color:#000
    style ECR fill:#FF6600,color:#fff
    style VERTS fill:#009933,color:#fff
    style PfE fill:#2B3856,color:#fff
    style LEFT fill:#8B0000,color:#fff
    style NI fill:#808080,color:#fff
```

#### Seat Distribution by Group

| Rank | Group | Seat Share | Change vs EP9 | EP Colour | Ideological Family |
|------|-------|-----------|---------------|-----------|-------------------|
| 1 | PPE | 38.0% | Increased | #003399 | Christian Democracy / Centre-Right |
| 2 | S&D | 22.0% | Stable | #cc0000 | Social Democracy / Centre-Left |
| 3 | PfE | 11.0% | New (from ID) | #2B3856 | Eurosceptic Right |
| 4 | Verts/ALE | 10.0% | Decreased | #009933 | Green / Regionalist |
| 5 | ECR | 8.0% | Stable | #FF6600 | Conservative / Eurosceptic |
| 6 | Renew | 5.0% | Decreased | #FFD700 | Liberal / Centrist |
| 7 | NI | 4.0% | Stable | #808080 | Non-attached |
| 8 | The Left | 2.0% | Decreased | #8B0000 | Socialist / Communist |

---

### Coalition Arithmetic and Majority Scenarios

The majority threshold in EP10 is approximately 51% of seats (approximately 361 of 705 MEPs in the full Parliament). Current coalition scenarios:

#### Viable Majority Coalitions

| Coalition | Groups | Combined Share | Surplus | Stability Assessment |
|-----------|--------|---------------|---------|---------------------|
| **Grand Coalition** | PPE + S&D | 60% | +9% | Most stable; tested in EP9; ideological tensions on social policy |
| **Centre-Right Broad** | PPE + ECR + PfE | 57% | +6% | Mathematically viable; deep divisions on EU integration, rule of law |
| **Right + NI** | PPE + ECR + PfE + NI | 61% | +10% | Unreliable; NI lack group discipline |
| **Ursula Coalition** | PPE + S&D + Renew | 65% | +14% | Most comfortable margin; Renew declining relevance |

#### Non-Viable Configurations

| Coalition | Groups | Combined Share | Deficit | Notes |
|-----------|--------|---------------|---------|-------|
| Progressive Bloc | S&D + Verts + Renew + Left | 39% | -12% | Cannot reach majority even with full unity |
| Opposition Bloc | All non-PPE | 62% | N/A | PPE cannot be outvoted if it holds firm |
| Left Alliance | S&D + Verts + Left | 34% | -17% | Structurally insufficient |

---

### Fragmentation and Power Concentration Analysis

#### Fragmentation Metrics

| Metric | Value | Interpretation |
|--------|-------|---------------|
| Effective Number of Parties (ENP) | 4.04 | Moderate-high fragmentation |
| Herfindahl-Hirschman Index (HHI) | ~0.248 | Concentrated (PPE dominant) |
| PPE Dominance Ratio | 19:1 vs smallest group | Asymmetric power distribution |
| Groups Below 5% Threshold | 3 (Renew, NI, Left) | Quorum risk for 30% of groups |

**Analysis:** EP10 exhibits a paradoxical combination of high fragmentation (8 groups, ENP 4.04) and high concentration (PPE alone holds 38%). This means that while many groups exist, power is heavily skewed. PPE can effectively veto any legislative initiative while needing only one medium-sized partner to form a majority. This structural asymmetry is the defining feature of EP10 power dynamics. Confidence: MEDIUM.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
pie title Power Concentration: PPE vs Rest of Parliament
    "PPE" : 38
    "All Other Groups" : 62
```

---

### Coalition Dynamics During Recess

#### Current Cohesion Signals (Methodological Caveat)

The coalition dynamics tool reports cohesion scores based on group size ratios rather than actual voting data (per-MEP voting statistics unavailable from EP API). These should be interpreted as structural similarity indicators, not behavioural cohesion measures.

| Pair | Cohesion Score | Alliance Signal | Trend | Interpretation |
|------|---------------|-----------------|-------|---------------|
| Renew-ECR | 0.95 | Yes | Strengthening | Size similarity; NOT ideological alignment |
| The Left-NI | 0.65 | Yes | Strengthening | Small group structural similarity |
| S&D-ECR | 0.60 | Yes | Stable | Moderate size proximity |
| Renew-The Left | 0.60 | Yes | Stable | Small group structural similarity |
| S&D-Renew | 0.57 | Yes | Stable | Historical coalition partners |
| EPP-S&D | 0.00 | No | Weakening | Size disparity artifact |

**Critical caveat:** The EPP-S&D cohesion of 0.00 is a methodological artifact of the size-ratio approach, NOT evidence of coalition breakdown. In practice, EPP and S&D remain the core grand coalition partners. Confidence: LOW for all cohesion scores due to methodology limitations.

---

### Post-Easter Outlook: What to Watch

#### Committee Week (14-17 April)

The committee week is the first opportunity for observable political activity after the 18-day recess. Key indicators:

1. **Agenda density** - If committees schedule more than 15 meetings, signals legislative pressure
2. **Rapporteur assignments** - New assignments reveal group priorities for the April-June period
3. **Cross-group amendments** - Co-signed amendments between PPE and ECR/PfE would confirm right-of-centre alignment
4. **Small group interventions** - Rule of Procedure challenges from Renew, Left, or NI signal marginalisation pushback

#### Strasbourg Plenary (20-23 April)

The first post-Easter plenary is the critical test for coalition dynamics:

1. **Roll-call vote alignment** - Compare PPE-S&D alignment rate with pre-recess baseline
2. **Resolution debates** - Watch for positioning statements previewing committee-level negotiations
3. **Attendance patterns** - Post-recess attendance often dips 5-10%; monitor small groups especially
4. **Emergency debates** - Any emergency item would reveal real-time coalition formation patterns

---

### Sources

| Data Source | Endpoint | Key Metric | Confidence |
|------------|----------|-----------|------------|
| Political Landscape | generate_political_landscape | 8 groups, PPE 38% | MEDIUM |
| Coalition Dynamics | analyze_coalition_dynamics | Renew-ECR 0.95, ENP 4.04 | LOW |
| Early Warning System | early_warning_system | Stability 84, PPE dominance HIGH | MEDIUM |
| MEPs Feed | get_meps_feed(today) | 737 active MEPs | HIGH |
| Precomputed Stats | get_all_generated_stats | Historical 2004-2026 | HIGH |

**Methodology:** Political Landscape Analysis template applied. Coalition dynamics analysed with explicit methodology caveats. 4-pass refinement cycle completed.

---

*Generated by EU Parliament Monitor Agentic Workflow - 5 April 2026 00:30 UTC*

### Risk Assessment

<p class="artifact-source"><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/risk-assessment.md" rel="noopener">View source: <code>risk-assessment.md</code></a></p>

### Executive Risk Summary

During the Easter recess, the European Parliament faces primarily structural and monitoring risks rather than active political threats. The dominant risk is the EP API transparency deficit (Score: 10, HIGH band), followed by medium-band risks around legislative bottlenecks and coalition dynamics. No critical-band risks are identified.

---

### Risk Matrix

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
    title Political Risk Matrix - Easter Recess 2026
    x-axis Low Impact --> High Impact
    y-axis Low Likelihood --> High Likelihood
    quadrant-1 Monitor Closely
    quadrant-2 Critical Action
    quadrant-3 Accept
    quadrant-4 Active Monitoring
    API Transparency Deficit: [0.35, 0.92]
    Legislative Bottleneck: [0.55, 0.48]
    PPE Coalition Manipulation: [0.55, 0.28]
    Small Group Marginalisation: [0.35, 0.48]
    Right-Centre Formalisation: [0.75, 0.28]
```

---

### Detailed Risk Register

#### R1: EP API Transparency Deficit

| Attribute | Value |
|-----------|-------|
| **Category** | institutional-integrity |
| **Likelihood** | 5 (Almost Certain) - actively observed |
| **Impact** | 2 (Minor) - temporary, recoverable |
| **Risk Score** | 10 (HIGH) |
| **Trend** | Stable (recurring during every recess period) |
| **Affected Stakeholders** | EU Citizens, Civil Society, Media |

**Description:** 6 of 8 EP Open Data API feed endpoints return 404 during the Easter recess. This reduces real-time democratic monitoring capability for watchdog organisations, journalists, and citizen platforms. While the data is not lost (it becomes available when feeds recover), the temporary blackout creates information asymmetries.

**Evidence:** Direct feed call failures across events, procedures, documents, plenary documents, committee documents, and parliamentary questions endpoints. Only MEPs feed and adopted texts feed (one-week) remain operational.

**Mitigation:** (a) Implement recess-aware monitoring schedules; (b) Pre-cache data before known recess periods; (c) Advocate for EP API reliability SLA improvements.

**Confidence:** HIGH - directly observed in multiple consecutive monitoring runs.

---

#### R2: Post-Easter Legislative Bottleneck

| Attribute | Value |
|-----------|-------|
| **Category** | policy-implementation |
| **Likelihood** | 3 (Possible) |
| **Impact** | 3 (Moderate) |
| **Risk Score** | 9 (MEDIUM) |
| **Trend** | Unknown (depends on committee agenda density) |
| **Affected Stakeholders** | Political Groups, Legislative Rapporteurs, Industry |

**Description:** The pre-recess legislative push produced 70 EP10-2026 adopted texts. When committees resume on 14 April, they face accumulated dossiers requiring follow-up, implementation planning, and potential amendment work. If the April committee week agenda is overpacked, key files may be delayed into May.

**Evidence:** Adopted texts feed shows high pre-recess output volume. Historical pattern: post-recess committee weeks typically see 20-30% higher meeting density than regular weeks.

**Mitigation:** (a) Monitor committee agenda publication (expected approximately 10 April); (b) Track rapporteur availability and substitution patterns; (c) Flag any procedural delay requests.

**Confidence:** MEDIUM - based on historical patterns and current output volume.

---

#### R3: PPE Coalition Manipulation During Recess

| Attribute | Value |
|-----------|-------|
| **Category** | grand-coalition-stability |
| **Likelihood** | 2 (Unlikely) |
| **Impact** | 3 (Moderate) |
| **Risk Score** | 6 (MEDIUM) |
| **Trend** | Stable |
| **Affected Stakeholders** | S&D, Smaller Groups, EU Citizens |

**Description:** With Parliament in recess and no plenary scrutiny, PPE (38% seat share, 19x the smallest group) could use bilateral talks to pre-arrange voting deals with ECR or PfE that bypass normal coalition negotiation processes. While standard practice in parliamentary politics, the information vacuum during recess amplifies the risk of opaque deal-making.

**Evidence:** Early warning system flags PPE dominance as HIGH severity. Political landscape shows PPE can form alternative majorities without S&D (PPE + ECR + PfE = 57%).

**Mitigation:** (a) Monitor for joint group statements during recess; (b) Track post-Easter voting alignment changes; (c) Compare pre- and post-recess coalition patterns.

**Confidence:** MEDIUM - structural risk based on seat distribution; actual occurrence unverifiable during recess.

---

#### R4: Small Group Marginalisation

| Attribute | Value |
|-----------|-------|
| **Category** | social-cohesion |
| **Likelihood** | 3 (Possible) |
| **Impact** | 2 (Minor) |
| **Risk Score** | 6 (MEDIUM) |
| **Trend** | Stable |
| **Affected Stakeholders** | Renew, NI, The Left, EU Citizens |

**Description:** Three political groups (Renew 5%, NI 4%, The Left 2%) hold 11% of seats combined. Their small size creates quorum challenges in committees and limits their ability to table amendments or demand debates. Post-Easter, if attendance dips below pre-recess levels, these groups face further marginalisation.

**Evidence:** Early warning system: SMALL_GROUP_QUORUM_RISK (LOW severity). Political landscape: 3 groups below 5% seat share threshold.

**Mitigation:** (a) Monitor post-Easter attendance rates for small groups; (b) Track committee quorum challenges; (c) Flag any rules changes affecting small group rights.

**Confidence:** MEDIUM - structural risk clearly evidenced by seat distribution.

---

#### R5: Right-of-Centre Bloc Formalisation

| Attribute | Value |
|-----------|-------|
| **Category** | grand-coalition-stability |
| **Likelihood** | 2 (Unlikely) |
| **Impact** | 4 (Major) |
| **Risk Score** | 8 (MEDIUM) |
| **Trend** | Unknown |
| **Affected Stakeholders** | All Political Groups, EU Institutions, Civil Society |

**Description:** The Renew-ECR cohesion signal (0.95) from coalition dynamics analysis, combined with PPE-ECR-PfE combined 57% seat share, hints at a potential right-of-centre bloc that could bypass the traditional grand coalition. If formalised, this would fundamentally alter EP10 power dynamics. However, deep ideological divisions (especially on rule of law, EU integration, and social policy) make this unlikely in the current term.

**Evidence:** Coalition dynamics: Renew-ECR 0.95 cohesion (CAVEAT: size-ratio based, not vote-based). Political landscape: PPE + ECR + PfE = 57%.

**Mitigation:** (a) Monitor post-Easter roll-call votes for systematic PPE-ECR-PfE alignment; (b) Track joint statements or cross-group amendments; (c) Compare voting patterns on migration, trade, and rule-of-law files.

**Confidence:** LOW - cohesion signal is methodologically weak (derived from group size ratios, not actual voting data).

---

### Political Threat Landscape Assessment (6 Dimensions)

| Dimension | Current Level | Trend | Evidence | Confidence |
|-----------|--------------|-------|----------|------------|
| Coalition Shifts | STABLE | Neutral | No voting activity during recess = no observable shifts | MEDIUM |
| Transparency Deficit | ELEVATED | Stable | 6/8 EP API feeds returning 404 | HIGH |
| Policy Reversal | LOW | Neutral | Adopted texts are final; no rollback mechanism during recess | HIGH |
| Institutional Pressure | LOW | Neutral | Standard parliamentary calendar; no extraordinary sessions | HIGH |
| Legislative Obstruction | N/A | N/A | No active legislative sessions during recess | HIGH |
| Democratic Erosion | LOW-MEDIUM | Stable | Short-term but recurrent transparency gap during recesses | MEDIUM |

---

### Recommendations

1. **Immediate (this week):** Continue daily API health monitoring; prepare comprehensive data collection scripts for 14 April API recovery window
2. **Short-term (14-17 April):** Deploy full-spectrum monitoring during committee week; compare pre- and post-recess group alignment patterns
3. **Medium-term (20-23 April):** Analyse first post-Easter plenary votes for coalition shift signals; track attendance rates across all groups

---

### Sources

- EP Adopted Texts Feed (one-week): 85 items
- EP MEPs Feed (today): 737 active MEPs
- Voting Anomalies: 0 detected, stability 100
- Coalition Dynamics: size-ratio analysis, Renew-ECR 0.95
- Political Landscape: 8 groups, PPE 38%
- Early Warning: stability 84/100, 3 warnings
- Editorial Memory: recess dates, historical patterns

**Methodology:** Political Risk Methodology v2.0 (5x5 Likelihood x Impact matrix). Political Threat Landscape v3.0 (6-dimension model). 4-pass refinement cycle applied.

---

*Generated by EU Parliament Monitor Agentic Workflow - 5 April 2026 00:25 UTC*

### Swot Analysis

<p class="artifact-source"><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/swot-analysis.md" rel="noopener">View source: <code>swot-analysis.md</code></a></p>

### SWOT Matrix

#### Strengths

| ID | Finding | Evidence | Confidence | Severity |
|----|---------|----------|------------|----------|
| S1 | **EP10 legislative output accelerating** - 70 EP10-2026 adopted texts (TA-10-2026-0035 to TA-10-2026-0104) in one-week feed shows pre-recess productivity push | EP adopted texts feed (one-week): 85 items total, 70 from current term | HIGH | High |
| S2 | **Full MEP roster operational** - 737 active MEPs with no mass departures or group collapses | EP MEPs feed (today): 737 records | HIGH | Medium |
| S3 | **Grand coalition mathematically viable** - PPE (38%) + S&D (22%) = 60% seat share exceeds majority threshold | Political landscape: generate_political_landscape | MEDIUM | High |
| S4 | **Institutional stability score healthy** - 84/100 stability with no critical warnings | Early warning system: stability 84, 0 critical warnings | MEDIUM | Medium |

#### Weaknesses

| ID | Finding | Evidence | Confidence | Severity |
|----|---------|----------|------------|----------|
| W1 | **EP API degradation during recess** - 6/8 feed endpoints returning 404, reducing democratic transparency during non-session periods | Direct observation: events, procedures, documents, plenary docs, committee docs, questions all 404 | HIGH | Medium |
| W2 | **Coalition dynamics data unavailable** - Per-MEP voting statistics not available from EP API, making real cohesion analysis impossible | Coalition dynamics tool: all dataAvailability UNAVAILABLE | HIGH | Medium |
| W3 | **Small group quorum risk** - Renew (5%), NI (4%), The Left (2%) may struggle for committee quorum in post-Easter sessions | Early warning system: 3 groups below 5% threshold | MEDIUM | Low |
| W4 | **High fragmentation index** - 4.04 effective parties across 8 groups requires complex coalition arithmetic for every major vote | Coalition dynamics: fragmentationIndex 4.04 | MEDIUM | Medium |

#### Opportunities

| ID | Finding | Evidence | Confidence | Severity |
|----|---------|----------|------------|----------|
| O1 | **Post-Easter committee week** (14-17 April) provides first activity window for strategic group positioning | EP calendar; editorial context from prior monitoring runs | MEDIUM | Medium |
| O2 | **Pre-recess legislative push data** - 70 EP10-2026 texts provide rich implementation monitoring baseline for post-Easter analysis | Adopted texts feed: TA-10-2026-0035 to TA-10-2026-0104 | HIGH | Medium |
| O3 | **EP API recovery window** - Expected restoration by 14 April enables improved monitoring for committee week | Historical pattern from editorial context (observed in prior recess cycles) | MEDIUM | Low |

#### Threats

| ID | Finding | Evidence | Confidence | Severity |
|----|---------|----------|------------|----------|
| T1 | **PPE dominance risk (HIGH)** - 38% seat share is 19x smallest group, risking democratic deficit if smaller groups are marginalised | Early warning system: DOMINANT_GROUP_RISK severity HIGH; political landscape: PPE 38% | HIGH | High |
| T2 | **Information vacuum during recess** - 2-week gap in parliamentary activity monitoring creates blind spots for policy tracking and public accountability | Direct observation: 6/8 feeds returning 404 for 9+ consecutive days | HIGH | Medium |
| T3 | **Potential right-of-centre realignment** - Renew-ECR cohesion signal (0.95) and PPE-ECR-PfE combined 57% may indicate emerging alliance patterns | Coalition dynamics: Renew-ECR pair 0.95 cohesion (methodological caveat: size-ratio based) | LOW | High |

---

### TOWS Strategic Matrix

| | **Strengths** | **Weaknesses** |
|---|---|---|
| **Opportunities** | **SO Strategy:** Leverage pre-recess legislative output data (S1) during committee week (O1) to produce comprehensive implementation tracking articles | **WO Strategy:** Use EP API recovery window (O3) to compensate for current data gaps (W1); prepare comprehensive data collection scripts for 14 April |
| **Threats** | **ST Strategy:** Document PPE dominance patterns (T1) against institutional stability score (S4) to provide balanced democratic health assessment | **WT Strategy:** Address information vacuum (T2) and API degradation (W1) by maintaining recess monitoring cadence; flag transparency concerns in editorial content |

---

### Cross-SWOT Interference Analysis

1. **S3 + T1 Tension:** Grand coalition viability (60%) depends on PPE-S&D cooperation, but PPE dominance (38%) creates asymmetric power dynamics within the coalition. PPE can more easily find alternative partners (ECR, PfE) than S&D can.

2. **W1 + T2 Reinforcement:** API degradation (W1) directly amplifies the information vacuum threat (T2). Both are structural issues during recess periods that compound to reduce democratic monitoring capacity.

3. **S1 + O2 Synergy:** The pre-recess legislative push (S1) provides the exact data needed for post-Easter implementation monitoring opportunities (O2). The 85 adopted texts are a rich analytical baseline.

4. **W4 + T3 Risk Cascade:** High fragmentation (W4) combined with potential right-of-centre realignment (T3) could create unpredictable voting outcomes in the April plenary if ECR pivots from issue-by-issue cooperation to systematic alliance with PPE.

---

### Risk Register (Likelihood x Impact)

| Risk | Likelihood | Impact | Score | Band | Trend |
|------|-----------|--------|-------|------|-------|
| PPE coalition manipulation during recess | 2 (Unlikely) | 3 (Moderate) | 6 | MEDIUM | Stable |
| Transparency deficit from API degradation | 5 (Almost Certain) | 2 (Minor) | 10 | HIGH | Stable |
| Post-Easter legislative bottleneck | 3 (Possible) | 3 (Moderate) | 9 | MEDIUM | Unknown |
| Small group marginalisation | 3 (Possible) | 2 (Minor) | 6 | MEDIUM | Stable |
| Right-of-centre bloc formalisation | 2 (Unlikely) | 4 (Major) | 8 | MEDIUM | Unknown |

---

### Sources

- EP Adopted Texts Feed (one-week): 85 items - get_adopted_texts_feed
- EP MEPs Feed (today): 737 MEPs - get_meps_feed
- Political Landscape: 8 groups - generate_political_landscape
- Coalition Dynamics: size-ratio analysis - analyze_coalition_dynamics
- Early Warning System: stability 84/100 - early_warning_system
- Voting Anomalies: 0 detected - detect_voting_anomalies
- Precomputed Statistics: 2004-2026 historical context - get_all_generated_stats

**Methodology:** Political SWOT Framework v2.0 with evidence-based entries. Risk scoring per Political Risk Methodology v2.0 (Likelihood x Impact, 5x5 matrix). Cross-SWOT interference analysis applied.

---

*Generated by EU Parliament Monitor Agentic Workflow - 5 April 2026 00:25 UTC*

<h2 id="aggregator-tradecraft-references">Tradecraft References</h2>

This article is produced under the [Hack23 AB](https://hack23.com) intelligence tradecraft library. Every methodology and artifact template applied to this run is linked below.

### Methodologies

- [README](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/README.md)
- [Ai Driven Analysis Guide](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/ai-driven-analysis-guide.md)
- [Artifact Catalog](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/artifact-catalog.md)
- [Electoral Domain Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/electoral-domain-methodology.md)
- [Imf Indicator Mapping](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/imf-indicator-mapping.md)
- [Osint Tradecraft Standards](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/osint-tradecraft-standards.md)
- [Per Artifact Methodologies](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/per-artifact-methodologies.md)
- [Per Document Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/per-document-methodology.md)
- [Political Classification Guide](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-classification-guide.md)
- [Political Risk Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-risk-methodology.md)
- [Political Style Guide](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-style-guide.md)
- [Political Swot Framework](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-swot-framework.md)
- [Political Threat Framework](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-threat-framework.md)
- [Strategic Extensions Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/strategic-extensions-methodology.md)
- [Structural Metadata Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/structural-metadata-methodology.md)
- [Synthesis Methodology](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/synthesis-methodology.md)
- [Worldbank Indicator Mapping](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/worldbank-indicator-mapping.md)

### Artifact templates

- [README](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/README.md)
- [Actor Mapping](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/actor-mapping.md)
- [Actor Threat Profiles](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/actor-threat-profiles.md)
- [Analysis Index](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/analysis-index.md)
- [Coalition Dynamics](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/coalition-dynamics.md)
- [Coalition Mathematics](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/coalition-mathematics.md)
- [Comparative International](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/comparative-international.md)
- [Consequence Trees](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/consequence-trees.md)
- [Cross Reference Map](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/cross-reference-map.md)
- [Cross Run Diff](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/cross-run-diff.md)
- [Cross Session Intelligence](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/cross-session-intelligence.md)
- [Data Download Manifest](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/data-download-manifest.md)
- [Deep Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/deep-analysis.md)
- [Devils Advocate Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/devils-advocate-analysis.md)
- [Economic Context](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/economic-context.md)
- [Executive Brief](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/executive-brief.md)
- [Forces Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/forces-analysis.md)
- [Forward Indicators](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/forward-indicators.md)
- [Historical Baseline](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/historical-baseline.md)
- [Historical Parallels](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/historical-parallels.md)
- [Imf Vintage Audit](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/imf-vintage-audit.md)
- [Impact Matrix](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/impact-matrix.md)
- [Implementation Feasibility](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/implementation-feasibility.md)
- [Intelligence Assessment](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/intelligence-assessment.md)
- [Legislative Disruption](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/legislative-disruption.md)
- [Legislative Velocity Risk](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/legislative-velocity-risk.md)
- [Mcp Reliability Audit](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/mcp-reliability-audit.md)
- [Media Framing Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/media-framing-analysis.md)
- [Methodology Reflection](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/methodology-reflection.md)
- [Per File Political Intelligence](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/per-file-political-intelligence.md)
- [Pestle Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/pestle-analysis.md)
- [Political Capital Risk](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/political-capital-risk.md)
- [Political Classification](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/political-classification.md)
- [Political Threat Landscape](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/political-threat-landscape.md)
- [Quantitative Swot](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/quantitative-swot.md)
- [Reference Analysis Quality](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/reference-analysis-quality.md)
- [Risk Assessment](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/risk-assessment.md)
- [Risk Matrix](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/risk-matrix.md)
- [Scenario Forecast](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/scenario-forecast.md)
- [Session Baseline](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/session-baseline.md)
- [Significance Classification](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/significance-classification.md)
- [Significance Scoring](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/significance-scoring.md)
- [Stakeholder Impact](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/stakeholder-impact.md)
- [Stakeholder Map](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/stakeholder-map.md)
- [Swot Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/swot-analysis.md)
- [Synthesis Summary](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/synthesis-summary.md)
- [Threat Analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/threat-analysis.md)
- [Threat Model](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/threat-model.md)
- [Voter Segmentation](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/voter-segmentation.md)
- [Voting Patterns](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/voting-patterns.md)
- [Wildcards Blackswans](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/wildcards-blackswans.md)
- [Workflow Audit](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/workflow-audit.md)

<h2 id="aggregator-analysis-index">Analysis Index</h2>

Every artifact below was read by the aggregator and contributed to this article. The raw [manifest.json](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/manifest.json) carries the full machine-readable list, including gate-result history.

| Section | Artifact | Path |
|---|---|---|
| section-supplementary-intelligence | [intelligence-brief](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/intelligence-brief.md) | `intelligence-brief.md` |
| section-supplementary-intelligence | [political-landscape-analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/political-landscape-analysis.md) | `political-landscape-analysis.md` |
| section-supplementary-intelligence | [risk-assessment](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/risk-assessment.md) | `risk-assessment.md` |
| section-supplementary-intelligence | [swot-analysis](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-04-05/breaking/swot-analysis.md) | `swot-analysis.md` |

