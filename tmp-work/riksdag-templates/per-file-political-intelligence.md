<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔍 Per-File Political Intelligence Analysis Template</h1>

<p align="center">
  <strong>📊 Deep AI-Driven Multi-Framework Analysis for Individual Parliamentary Documents</strong><br>
  <em>🎯 SWOT · Risk · Attack Trees · Kill Chain · Stakeholder · Strategic Implications</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.3-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--06--01-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.3 | **📅 Last Updated:** 2026-06-01 (UTC)  
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template Instructions:** This template is for **per-file** analysis. For each data file downloaded via MCP, the AI agent produces one analysis markdown file stored as `{id}-analysis.md` in the workflow's isolated folder. AI MUST read `analysis/methodologies/ai-driven-analysis-guide.md` (v5.0) before analyzing; consult other methodology guides only when needed for the current analysis step.
>
> **Output path:** `analysis/daily/YYYY-MM-DD/{articleType}/documents/{dok_id}-analysis.md`
>
> **The AI agent performs ALL analysis.** Scripts download data; AI reads methodologies; AI produces genuine intelligence analysis based on the actual content of each document.

> **🚨 Anti-Pattern Warning:** The following patterns indicate scripted/shallow content and are REJECTED:
> - `"_No strengths identified_"` or `"_No weaknesses identified_"` — empty SWOT quadrants
> - `"this document requires assessment of policy execution"` — generic boilerplate
> - `"this document warrants scrutiny for alignment with citizen welfare"` — template filler
> - Any analysis that could be written WITHOUT reading the actual document data
> - Analysis with 0 cross-references to other documents or MCP data
> - Analysis with 0 named politicians/parties
> - Analysis that merely restates the document title as a "finding"
>
> **MUST include:** ≥3 evidence points with dok_id, ≥1 color-coded Mermaid diagram (classification tree, risk matrix, stakeholder map, or threat taxonomy — at least one is MANDATORY), multi-framework analysis (SWOT + at least one of: Risk, Attack Tree, Kill Chain), named actors with party affiliations, forward indicators.


---

## 📋 Document Identity

| Field | Value |
|-------|-------|
| **Document ID** | `[REQUIRED: dok_id or file identifier]` |
| **Document Type** | `[REQUIRED: propositions / motions / committeeReports / votes / speeches / questions / interpellations / government / worldbank / scb]` |
| **Title** | `[REQUIRED: document title or descriptor]` |
| **Date** | `[REQUIRED: document date or fetch date]` |
| **Riksmöte** | `[REQUIRED if parliamentary: e.g. 2025/26]` |
| **Source MCP Tool** | `[REQUIRED: e.g. search_dokument, get_propositioner]` |
| **Analysis Timestamp** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Analyst** | `[REQUIRED: workflow name, e.g. news-evening-analysis]` |
| **Data Depth** | `[REQUIRED: FULL-TEXT / SUMMARY / METADATA-ONLY — see ai-driven-analysis-guide.md §Data Availability Prerequisites]` |

---

## 🎯 Executive Summary

`[REQUIRED: 3–5 sentences capturing the political significance. Intelligence-level analysis — not just what happened, but what it means for power dynamics, coalition stability, and democratic accountability. Include confidence label.]` **[VERY HIGH/HIGH/MEDIUM/LOW/VERY LOW]**

> ⚠️ **Confidence Ceiling Rule**: If `Data Depth` above is `METADATA-ONLY`, confidence MUST be `LOW` or `VERY LOW`. If `SUMMARY`, max is `MEDIUM`. Only `FULL-TEXT` documents may claim `HIGH` or `VERY HIGH`. See `ai-driven-analysis-guide.md` §Data Availability Prerequisites.

---

## 📊 Political Classification

```mermaid
graph LR
    A[Document] --> B{Sensitivity}
    B -->|"🔴 RESTRICTED"| C[Constitutional / National Security]
    B -->|"🟡 SENSITIVE"| D[Policy Delivery Risk]
    B -->|"🟢 PUBLIC"| E[Standard Parliamentary]
    
    A --> G{Domain}
    G --> H["[REQUIRED: Primary policy domain]"]
    
    A --> I{Urgency}
    I -->|"🔴 CRITICAL"| J[Constitutional crisis — hours]
    I -->|"🟠 URGENT"| K[Formal response — days]
    I -->|"🔵 ELEVATED"| L[Monitoring — this week]
    I -->|"⚪ ROUTINE"| M[Standard processing]
    
    style C fill:#D32F2F,color:#FFFFFF
    style D fill:#FFC107,color:#000000
    style E fill:#4CAF50,color:#FFFFFF
    style J fill:#D32F2F,color:#FFFFFF
    style K fill:#FF9800,color:#FFFFFF
    style L fill:#1565C0,color:#FFFFFF
    style M fill:#9E9E9E,color:#FFFFFF
```

| Field | Assessment |
|-------|-----------|
| **Sensitivity Level** | `[REQUIRED: PUBLIC / SENSITIVE / RESTRICTED]` |
| **Primary Domain** | `[REQUIRED: e.g. Migration (MIG), Defence (DEF), Economy (ECO), Climate (ENV), Justice (JUS), Health (HEA), Education (EDU), Foreign Affairs (FOR)]` |
| **Urgency** | `[REQUIRED: ROUTINE / ELEVATED / URGENT / CRITICAL]` |
| **Significance Score** | `[REQUIRED: 0–10]` |
| **Confidence** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

---

## 💪 SWOT Impact Assessment

> *How does this document affect the political landscape? Each entry requires evidence.*

### Quadrant Overview

```mermaid
%%{init: {
  "theme": "neutral",
  "themeVariables": {
    "quadrant1Fill": "#FF9800",
    "quadrant2Fill": "#2E7D32",
    "quadrant3Fill": "#D32F2F",
    "quadrant4Fill": "#1565C0",
    "quadrantTitleFill": "#FFFFFF",
    "quadrantPointFill": "#FFFFFF",
    "quadrantPointTextFill": "#000000",
    "quadrantXAxisTextFill": "#000000",
    "quadrantYAxisTextFill": "#000000"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 12,
    "titleFontSize": 18,
    "quadrantLabelFontSize": 14,
    "xAxisLabelFontSize": 14,
    "yAxisLabelFontSize": 14
  }
}}%%
quadrantChart
    title 🎯 Political Impact Assessment
    x-axis Government --> Opposition
    y-axis Risk --> Opportunity
    quadrant-1 🚀 Opposition Opportunities
    quadrant-2 ✅ Government Opportunities
    quadrant-3 🔴 Government Risks
    quadrant-4 ⚠️ Opposition Risks

    "💡 [REQUIRED: key finding 1]": [0.30, 0.70]
    "⚡ [REQUIRED: key finding 2]": [0.70, 0.30]
```

### Government Coalition Impact

| Quadrant | Statement | Evidence | Confidence | Impact |
|----------|-----------|----------|:----------:|:------:|
| ✅ Strength | `[If this document strengthens the government position — specific claim]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |
| ⚠️ Weakness | `[If this document exposes a government vulnerability]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |
| 🚀 Opportunity | `[If this creates a government opportunity]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |
| 🔴 Threat | `[If this poses a threat to the government]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |

### Opposition Impact

| Quadrant | Statement | Evidence | Confidence | Impact |
|----------|-----------|----------|:----------:|:------:|
| ✅ Strength | `[If this strengthens the opposition]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |
| ⚠️ Weakness | `[If this exposes an opposition vulnerability]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |
| 🚀 Opportunity | `[If this creates an opposition opportunity]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |
| 🔴 Threat | `[If this poses a threat to the opposition]` | `[dok_id or evidence]` | `VH/H/M/L/VL` | `VH/H/M/L/VL` |

---

## ⚖️ Risk Assessment

```mermaid
graph TD
    subgraph "⚖️ Political Risk Matrix — Likelihood × Impact"
        R1["🔴 Coalition Stability<br/>L:[?] × I:[?] = [?]"]
        R2["🟠 Policy Implementation<br/>L:[?] × I:[?] = [?]"]
        R3["🟡 Budget / Fiscal<br/>L:[?] × I:[?] = [?]"]
        R4["📊 Electoral Impact<br/>L:[?] × I:[?] = [?]"]
        R5["🏛️ Democratic Process<br/>L:[?] × I:[?] = [?]"]
        R6["🌍 External / International<br/>L:[?] × I:[?] = [?]"]
    end
    
    subgraph "📊 Risk Score Tiers"
        T1["🔴 CRITICAL<br/>Score 15–25"]
        T2["🟠 HIGH<br/>Score 10–14"]
        T3["🟡 MEDIUM<br/>Score 5–9"]
        T4["🟢 LOW<br/>Score 1–4"]
    end
    
    R1 -.-> T1
    R2 -.-> T2
    R3 -.-> T3
    R4 -.-> T2
    R5 -.-> T4
    R6 -.-> T4
    
    style R1 fill:#D32F2F,color:#FFFFFF
    style R2 fill:#FF9800,color:#FFFFFF
    style R3 fill:#FFC107,color:#000000
    style R4 fill:#FF9800,color:#FFFFFF
    style R5 fill:#4CAF50,color:#FFFFFF
    style R6 fill:#4CAF50,color:#FFFFFF
    style T1 fill:#D32F2F,color:#FFFFFF
    style T2 fill:#FF9800,color:#FFFFFF
    style T3 fill:#FFC107,color:#000000
    style T4 fill:#4CAF50,color:#FFFFFF
```

> **Scoring Reference:** Risk Score = Likelihood × Impact (product, not sum). Both are scored 1–5, giving a range of 1–25. Score tiers: 1–4 🟢 Low, 5–9 🟡 Medium, 10–14 🟠 High, 15–25 🔴 Critical. See [political-risk-methodology.md](../methodologies/political-risk-methodology.md) for calibration examples.
> 
> **⚠️ AI Instructions:** Replace ALL `[?]` placeholders with actual numbers derived from the document data. The Mermaid diagram above is a TEMPLATE — when you fill it in, the node labels should show real scores like `"🔴 Coalition Stability<br/>L:2 × I:3 = 6"` and the dotted arrows should point to the correct tier.

| Risk Type | Likelihood (1–5) | Impact (1–5) | Score | Assessment |
|-----------|:-----------------:|:------------:|:-----:|------------|
| Coalition Stability | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: specific risk statement]` |
| Policy Implementation | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: specific risk statement]` |
| Budget / Fiscal | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: specific risk statement]` |
| Electoral Impact | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: specific risk statement]` |
| Democratic Process | `[1-5]` | `[1-5]` | `[L×I]` | `[REQUIRED: specific risk statement]` |
| External / International | `[1-5]` | `[1-5]` | `[L×I]` | `[OPTIONAL: EU, NATO, Nordic impact]` |

**Overall Risk Level:** `[REQUIRED: CRITICAL / HIGH / MEDIUM / LOW / NEGLIGIBLE]`  
**Risk-to-SWOT:** Any score ≥15 → add as SWOT Threat entry. Any score 10–14 → add as SWOT Weakness or Threat.

### Anomaly Flags

`[List any detected anomalies — unusual voting patterns, unexpected coalition breaks, procedural irregularities]`

---

## 🎭 Threat Analysis (Political Threat Taxonomy)

> *Political threats mapped to the 6 democratic function categories. Severity: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe. See [political-threat-framework.md](../methodologies/political-threat-framework.md) for full calibration table.*

```mermaid
graph LR
    subgraph "Political Threat Taxonomy"
        NI["🎭 Narrative Integrity<br/>Disinformation"]
        LI["📝 Legislative Integrity<br/>Manipulation"]
        AC["🚫 Accountability<br/>Evasion"]
        TR["🔇 Transparency<br/>Suppression"]
        DP["⛔ Democratic Process<br/>Obstruction"]
        PB["👑 Power Balance<br/>Overreach"]
    end
    
    NI --> NI1["[If applicable: specific threat]"]
    LI --> LI1["[If applicable: specific threat]"]
    AC --> AC1["[If applicable: specific threat]"]
    TR --> TR1["[If applicable: specific threat]"]
    DP --> DP1["[If applicable: specific threat]"]
    PB --> PB1["[If applicable: specific threat]"]
    
    style NI fill:#7B1FA2,color:#FFFFFF
    style LI fill:#D32F2F,color:#FFFFFF
    style AC fill:#FF9800,color:#FFFFFF
    style TR fill:#FFC107,color:#000000
    style DP fill:#4CAF50,color:#FFFFFF
    style PB fill:#1565C0,color:#FFFFFF
```

| Threat Category | Applicable? | Threat Description | Severity (1–5) | Evidence |
|----------------|:-----------:|-------------------|:--------------:|----------|
| 🎭 Narrative Integrity | `[Y/N]` | `[Disinformation, false framing, misleading rhetoric]` | `[1-5]` | `[dok_id]` |
| 📝 Legislative Integrity | `[Y/N]` | `[Policy corruption, undisclosed lobbying, manipulation]` | `[1-5]` | `[dok_id]` |
| 🚫 Accountability | `[Y/N]` | `[Oversight evasion, KU obstruction, blame-shifting]` | `[1-5]` | `[dok_id]` |
| 🔇 Transparency | `[Y/N]` | `[Information suppression, FOI obstruction, secrecy]` | `[1-5]` | `[dok_id]` |
| ⛔ Democratic Process | `[Y/N]` | `[Parliamentary obstruction, filibuster, quorum games]` | `[1-5]` | `[dok_id]` |
| 👑 Power Balance | `[Y/N]` | `[Executive overreach, bypassing parliament, concentration]` | `[1-5]` | `[dok_id]` |

---

## 👥 Stakeholder Impact Matrix

> *Six analytical lenses applied to this document. The AI must assess each stakeholder based on actual document content.*

```mermaid
graph TD
    subgraph "📄 Document Impact Assessment"
        DOC["📄 This Document"]
    end
    
    subgraph "🏛️ Political Actors"
        GOV["🏛️ Government Coalition<br/>M + KD + L (+ SD)"]
        OPP["⚖️ Opposition<br/>S, V, MP, C"]
    end
    
    subgraph "👥 Society & Economy"
        CIT["👥 Citizens<br/>Public services, rights"]
        ECO["💰 Economic Actors<br/>Business, labour, fiscal"]
    end
    
    subgraph "🌍 External & Media"
        INT["🌍 International<br/>EU, Nordic, NATO"]
        MED["📰 Media<br/>Narrative, newsworthiness"]
    end
    
    DOC --> GOV
    DOC --> OPP
    DOC --> CIT
    DOC --> ECO
    DOC --> INT
    DOC --> MED
    
    style DOC fill:#1565C0,color:#FFFFFF
    style GOV fill:#4CAF50,color:#FFFFFF
    style OPP fill:#D32F2F,color:#FFFFFF
    style CIT fill:#7B1FA2,color:#FFFFFF
    style ECO fill:#FF9800,color:#FFFFFF
    style INT fill:#1565C0,color:#FFFFFF
    style MED fill:#FFC107,color:#000000
```

| Stakeholder | Impact Level | Key Assessment | Confidence |
|------------|:------------:|----------------|:----------:|
| 🏛️ Government | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: How does this affect government's position, agenda, and coalition stability?]` | `[VH/H/M/L/VL]` |
| ⚖️ Opposition | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: How does this create opportunities or challenges for opposition parties?]` | `[VH/H/M/L/VL]` |
| 👥 Citizens | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: How does this affect public services, rights, daily life?]` | `[VH/H/M/L/VL]` |
| 💰 Economic | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: Fiscal impact, business implications, labour market effects?]` | `[VH/H/M/L/VL]` |
| 🌍 International | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: EU compliance, Nordic cooperation, foreign relations?]` | `[VH/H/M/L/VL]` |
| 📰 Media | `[HIGH/MEDIUM/LOW/NONE]` | `[REQUIRED: Newsworthiness, narrative potential, public attention?]` | `[VH/H/M/L/VL]` |

---

## 🗳️ Election 2026 Implications

| Dimension | Assessment | Evidence |
|-----------|------------|----------|
| **Electoral Impact** | `[REQUIRED: How does this document affect September 2026 election positioning?]` | `[Specific evidence from document]` |
| **Coalition Scenarios** | `[REQUIRED: Which coalition configurations benefit/suffer from this policy?]` | `[Evidence]` |
| **Voter Salience** | `[REQUIRED: Which voter segments are most affected? By how much?]` | `[Evidence]` |
| **Campaign Vulnerability** | `[REQUIRED: Does this create campaign attack vectors for opposition?]` | `[Evidence]` |
| **Policy Legacy** | `[REQUIRED: Will this become an electoral asset or liability by Sept 2026?]` | `[Evidence]` |

**Overall Electoral Significance**: `[REQUIRED: CRITICAL/HIGH/MODERATE/LOW/NEGLIGIBLE]`

**Most Likely Narrative**: `[REQUIRED: How will this be framed in the 2026 campaign?]`

---

## 🔮 Forward Indicators

> *What to monitor as a consequence of this document.*

| # | Indicator | Timeline | Trigger Condition | Watch Priority |
|---|-----------|----------|-------------------|:--------------:|
| 1 | `[REQUIRED: specific future event or metric to monitor]` | `[days/weeks/months]` | `[what would trigger escalation]` | `🔴/🟠/🟡/🟢` |
| 2 | `[REQUIRED]` | `[timeline]` | `[trigger]` | `🔴/🟠/🟡/🟢` |
| 3 | `[OPTIONAL]` | `[timeline]` | `[trigger]` | `🔴/🟠/🟡/🟢` |

---

## 🔗 Cross-References

| Related Document | Relationship | dok_id |
|-----------------|-------------|--------|
| `[If related documents exist]` | `[supports / contradicts / amends / supersedes / responds-to]` | `[dok_id]` |

### Same-Day Document Cross-Reference Table

> **AI Instructions:** List all other documents analyzed on the same day for the same article type. This enables cross-document pattern detection.

| # | dok_id | Title | Document Type | Significance | Key Connection to This Document |
|:-:|--------|-------|--------------|:-----------:|-------------------------------|
| 1 | `[OPTIONAL: another same-day dok_id]` | `[title]` | `[type]` | `[score]` | `[How does it relate?]` |
| 2 | `[OPTIONAL]` | `[title]` | `[type]` | `[score]` | `[relationship]` |

### Hack23 Ecosystem Cross-Reference

> **AI Instructions:** When CIA platform data is available, cross-reference this document analysis with relevant CIA intelligence products (risk summaries, party analyses, election forecasts, etc.).

| CIA Product | Data Point | Relevance to This Document |
|-------------|-----------|---------------------------|
| `[OPTIONAL: e.g. cia-data/exports/risk-summary.json]` | `[e.g. Coalition stability score: 62%]` | `[How this document analysis relates to CIA data]` |
| `[OPTIONAL: e.g. cia-data/exports/party-metrics.json]` | `[e.g. SD voting discipline: 94%]` | `[relevance]` |

---

## 📊 Data Quality Assessment

| Metric | Value |
|--------|-------|
| **Source Completeness** | `[REQUIRED: Full text / Metadata only / Summary only]` |
| **Evidence Density** | `[REQUIRED: N evidence points cited]` |
| **Temporal Currency** | `[REQUIRED: Current / Recent (30d) / Dated (90d) / Stale (180d+)]` |
| **Analytical Confidence** | `[REQUIRED: VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW]` |

---

## 📂 MCP Data Files Used

> *List all data files from the analysis pipeline that were consulted to produce this analysis. This enables reproducibility and audit trails.*

`[REQUIRED: List all analysis/daily/YYYY-MM-DD/{articleType}/data/ files consulted for this analysis]`

| # | File Path | Source MCP Tool | Data Type | Freshness |
|---|-----------|----------------|-----------|:---------:|
| 1 | `[REQUIRED: e.g. analysis/daily/2026-03-30/propositions/data/H901FiU1.json]` | `[e.g. get_dokument]` | `[e.g. proposition / motion / vote]` | `[Current / Cached]` |
| 2 | `[REQUIRED: additional data file]` | `[MCP tool]` | `[data type]` | `[freshness]` |
| 3 | `[OPTIONAL: additional data file]` | `[MCP tool]` | `[data type]` | `[freshness]` |

---

## ✅ Quality Self-Check Checklist

> **Pre-commit validation — every item MUST be checked before finalising this per-file analysis.**

- [ ] **Document Identity complete:** dok_id, type, title, date, riksmöte, MCP source, timestamp, analyst all filled
- [ ] **Executive Summary written:** 3–5 sentences of intelligence-level analysis (not document summary) with confidence label
- [ ] **≥1 Mermaid diagram rendered:** At least one color-coded Mermaid diagram present (classification, risk, stakeholder, or threat)
- [ ] **SWOT Impact Assessment filled:** At least 2 quadrants (S/W/O/T) have evidence-backed entries for government or opposition
- [ ] **Risk Assessment scored:** All 5 political risk dimensions (Coalition, Policy, Budget, Electoral, External) have L×I scores (not `[?]` placeholders)
- [ ] **≥3 evidence points:** At least 3 claims cite specific dok_ids or named evidence sources
- [ ] **Named actors:** ≥2 named politicians/parties with party affiliations cited
- [ ] **Forward Indicators present:** ≥2 forward indicators with timelines and watch priorities
- [ ] **Data Quality Assessment filled:** Source completeness, evidence density, temporal currency, confidence all assessed
- [ ] **MCP Data Files listed:** All consulted data files recorded with source MCP tool and freshness
- [ ] **No placeholder text remaining:** Search for `[REQUIRED` — zero hits expected
- [ ] **No anti-pattern content:** No "No strengths identified", no generic boilerplate, no title-only restatements
- [ ] **Election 2026 Implications present:** All 5 dimensions assessed (Electoral Impact, Coalition Scenarios, Voter Salience, Campaign Vulnerability, Policy Legacy)
- [ ] **5-level confidence applied:** Confidence fields use VERY HIGH/HIGH/MEDIUM/LOW/VERY LOW scale
- [ ] **Cross-references linked:** Related documents and same-day cross-references populated

---

**Document Control:**  
- **Template Path:** `/analysis/templates/per-file-political-intelligence.md`  
- **Output Path:** `analysis/daily/YYYY-MM-DD/{articleType}/documents/{dok_id}-analysis.md`  
- **Version:** 2.3  
- **Effective Date:** 2026-06-01 (UTC)  
- **Key Changes v2.3:** Added Election 2026 Implications section, 5-level confidence scale (VERY HIGH/HIGH/MEDIUM/LOW/VERY LOW) replacing binary H/M/L, improved differentiated per-document insights  
- **Frameworks:** SWOT, Risk, Attack Trees, Kill Chain, Diamond Model, Stakeholder  
- **Framework References:** [SWOT.md](../../SWOT.md), [THREAT_MODEL.md](../../THREAT_MODEL.md)  
- **Methodology:** [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md)  
- **ISMS Alignment:** ISO 27001:2022 A.5.7 (Threat Intelligence), NIST CSF 2.0 ID.RA (Risk Assessment)  
- **Classification:** Public  
- **Owner:** Hack23 AB (Org.nr 5595347807)  
- **Next Review:** 2026-06-30
