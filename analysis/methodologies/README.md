<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📐 EU Parliament Monitor — Analysis Methodologies</h1>

<p align="center">
  <strong>📊 Six Comprehensive Political Intelligence Frameworks for European Parliament Analysis</strong><br>
  <em>🎯 Classification · Risk · Threat Landscape · SWOT · Style · AI Quality</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-3.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--31-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 3.0 | **📅 Last Updated:** 2026-03-31 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 📚 Architecture Documentation Map

<div class="documentation-map">

| Document                                                            | Focus              | Description                                    | Documentation Link                                                                                     |
| ------------------------------------------------------------------- | ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **[Architecture](../../ARCHITECTURE.md)**                           | 🏛️ Architecture    | C4 model showing current system structure      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/ARCHITECTURE.md)                 |
| **[Future Architecture](../../FUTURE_ARCHITECTURE.md)**             | 🏛️ Architecture    | C4 model showing future system structure       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FUTURE_ARCHITECTURE.md)          |
| **[Security Architecture](../../SECURITY_ARCHITECTURE.md)**         | 🛡️ Security        | Current security implementation                | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY_ARCHITECTURE.md)        |
| **[Threat Model](../../THREAT_MODEL.md)**                           | 🎯 Security        | Threat analysis                                | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/THREAT_MODEL.md)                 |
| **[Data Model](../../DATA_MODEL.md)**                               | 📊 Data            | Current data structures and relationships      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/DATA_MODEL.md)                   |
| **[Flowcharts](../../FLOWCHART.md)**                                | 🔄 Process         | Current data processing workflows              | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/FLOWCHART.md)                    |
| **[SWOT Analysis](../../SWOT.md)**                                  | 💼 Business        | Current strategic assessment                   | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SWOT.md)                         |
| **[Workflows](../../WORKFLOWS.md)**                                 | ⚙️ DevOps          | CI/CD documentation                            | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/WORKFLOWS.md)                    |
| **[Classification](../../CLASSIFICATION.md)**                       | 🏷️ Governance      | CIA classification & BCP                       | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/CLASSIFICATION.md)               |
| **[CRA Assessment](../../CRA-ASSESSMENT.md)**                       | 🛡️ Compliance      | Cyber Resilience Act                           | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/CRA-ASSESSMENT.md)               |
| **[Business Continuity Plan](../../BCPPlan.md)**                    | 🔄 Resilience      | Recovery planning                              | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/BCPPlan.md)                      |
| **[Security Policy](../../SECURITY.md)**                            | 🔒 Security        | Vulnerability reporting & security policy      | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY.md)                     |
| **[Analysis Methodologies](README.md)**                             | 📐 Methodology     | Political intelligence analysis frameworks     | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/README.md)|

</div>

---

## 🛡️ ISMS Policy Alignment

| Policy | Description | Relevance to Analysis Methodologies |
|--------|-------------|-------------------------------------|
| **[Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)** | Organization-wide security governance and risk management | Defines risk assessment methodology adapted for political risk scoring |
| **[AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)** | Responsible AI usage, transparency, and human oversight | Governs LLM-driven analysis: quality gates, bias mitigation, evidence requirements |
| **[Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)** | Data classification scheme and handling requirements | Classification guide aligns sensitivity levels with ISMS classification tiers |
| **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** | Secure coding standards and SDLC security gates | Style guide and quality gates enforce structured, reviewable analytical output |
| **[Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)** | Open source contribution and licensing governance | All methodology documents published under project license for transparency |

---

## 🎯 Purpose

This directory contains six interconnected political intelligence analysis methodologies that govern how EU Parliament Monitor's agentic workflows produce, classify, assess, and publish European Parliament analysis. These frameworks transform raw European Parliament MCP data into structured, evidence-based political intelligence.

**Core Principle:** Every analytical claim requires verifiable evidence sourced from European Parliament open data. Opinion-based analysis, boilerplate summaries, and software-centric threat models (such as STRIDE, DREAD, or PASTA) are explicitly rejected.

**Design Philosophy:** The six methodologies form a layered analytical pipeline — classification provides the foundation, risk and threat assessments build the analytical core, SWOT synthesizes strategic implications, style standards enforce writing quality, and the AI guide orchestrates the entire pipeline with quality gates.

---

## 🔄 Methodology Pipeline — How AI Agents Apply Frameworks

The following diagram illustrates the sequential pipeline that an AI agent follows when processing an incoming European Parliament data file:

```mermaid
flowchart TD
    Start([📥 EP MCP Data Received]) --> Read[📚 Agent Reads All 6 Methodology Docs]
    Read --> Classify[🏷️ Step 1: Classify Event<br/>7-Dimension Classification]
    Classify --> Risk[⚠️ Step 2: Assess Risk<br/>Likelihood × Impact Matrix]
    Risk --> Threat[🎯 Step 3: Analyze Threats<br/>Political Threat Landscape<br/>+ 5 Supporting Frameworks]
    Threat --> SWOT[💼 Step 4: Build SWOT<br/>Evidence-Based Quadrants]
    SWOT --> Write[📝 Step 5: Write Analysis<br/>Depth Level 1/2/3]
    Write --> QualityGate{✅ Quality Gate<br/>Score ≥ 7.0/10?}
    QualityGate -->|Yes ✅| Publish([📤 Publish Analysis])
    QualityGate -->|No ❌| Revise[🔄 Revise & Re-Assess]
    Revise --> Classify

    style Start fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Read fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style Classify fill:#00695C,stroke:#004D40,color:#FFFFFF
    style Risk fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style Threat fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SWOT fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style Write fill:#4A148C,stroke:#311B92,color:#FFFFFF
    style QualityGate fill:#F57F17,stroke:#E65100,color:#FFFFFF
    style Publish fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style Revise fill:#D84315,stroke:#BF360C,color:#FFFFFF
```

---

## 📐 Methodology Architecture

```mermaid
graph TB
    subgraph "🏛️ Core Analysis Engine"
        GUIDE["🤖 AI-Driven Analysis Guide<br/><i>Master Protocol</i>"]
        STYLE["✍️ Political Style Guide<br/><i>Writing Standards</i>"]
    end

    subgraph "🔬 Analytical Frameworks"
        CLASS["🏷️ Classification Guide<br/><i>7-Dimension Taxonomy</i>"]
        RISK["⚠️ Risk Methodology<br/><i>Cascading Risk Model</i>"]
        SWOT["💼 SWOT Framework<br/><i>TOWS + Cross-SWOT</i>"]
        THREAT["🎭 Threat Framework<br/><i>6-Dimension + 5 Frameworks</i>"]
    end

    subgraph "📋 ISMS Reference Layer"
        ISMS1["📖 ISMS Classification"]
        ISMS2["📖 ISMS Risk Assessment"]
        ISMS3["📖 ISMS Style Guide"]
        ISMS4["📖 ISMS Threat Modeling"]
    end

    GUIDE -->|"governs"| CLASS
    GUIDE -->|"governs"| RISK
    GUIDE -->|"governs"| SWOT
    GUIDE -->|"governs"| THREAT
    STYLE -->|"standards"| CLASS
    STYLE -->|"standards"| RISK
    STYLE -->|"standards"| SWOT
    STYLE -->|"standards"| THREAT
    ISMS1 -.->|"adapted from"| CLASS
    ISMS2 -.->|"adapted from"| RISK
    ISMS3 -.->|"adapted from"| STYLE
    ISMS4 -.->|"adapted from"| THREAT

    style GUIDE fill:#0d6efd,color:#fff,stroke:#0a58ca,stroke-width:2px
    style STYLE fill:#6610f2,color:#fff,stroke:#520dc2,stroke-width:2px
    style CLASS fill:#198754,color:#fff,stroke:#146c43,stroke-width:2px
    style RISK fill:#dc3545,color:#fff,stroke:#b02a37,stroke-width:2px
    style SWOT fill:#fd7e14,color:#fff,stroke:#ca6510,stroke-width:2px
    style THREAT fill:#d63384,color:#fff,stroke:#ab296a,stroke-width:2px
    style ISMS1 fill:#e9ecef,color:#212529,stroke:#adb5bd
    style ISMS2 fill:#e9ecef,color:#212529,stroke:#adb5bd
    style ISMS3 fill:#e9ecef,color:#212529,stroke:#adb5bd
    style ISMS4 fill:#e9ecef,color:#212529,stroke:#adb5bd
```

---

## 📊 Methodology Relationship Map

This diagram shows how the six methodology documents relate to each other and feed into the final analysis output:

```mermaid
graph LR
    CG[🏷️ Classification Guide<br/>7 Dimensions] --> RG[⚠️ Risk Methodology<br/>5×5 Likelihood × Impact]
    CG --> TF[🎯 Threat Framework<br/>6 Political Threat Dimensions]
    RG --> SW[💼 SWOT Framework<br/>Evidence-Based Quadrants]
    TF --> SW
    SW --> SG[📝 Style Guide<br/>3 Depth Levels]
    SG --> AI[🤖 AI Analysis Guide<br/>Quality Gates]
    AI -->|Orchestrates all| CG
    CG -.->|Sensitivity feeds| TF
    RG -.->|Scores inform| TF
    TF -.->|Threats map to| SW

    style CG fill:#00695C,stroke:#004D40,color:#FFFFFF
    style RG fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style TF fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SW fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style SG fill:#4A148C,stroke:#311B92,color:#FFFFFF
    style AI fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
```

---

## 📋 Methodology Summary Table

| Priority | Document | Key Content | Dimensions / Frameworks | When to Apply |
|----------|----------|-------------|-------------------------|---------------|
| **1** | **[Political Classification Guide](political-classification-guide.md)** | 7-dimension event classification, sensitivity levels, policy domain taxonomy, urgency matrix | Sensitivity (4 levels), Democratic Integrity, Policy Urgency, Economic Impact, Governance Impact, Political Capital, Legislative Impact | **First** — every incoming EP event/document must be classified before any analysis begins |
| **2** | **[Political Risk Methodology](political-risk-methodology.md)** | Likelihood × Impact scoring, 6 EP risk categories, 5×5 matrix, Grand Coalition stability risk | Coalition Stability, Policy Implementation, Institutional Integrity, Economic Governance, Social Cohesion, Geopolitical Standing | **Second** — after classification, assess political risk using calibrated scoring |
| **3** | **[Political Threat Framework](political-threat-framework.md)** | Multi-framework threat analysis: Political Threat Landscape + 5 supporting frameworks | Coalition Shifts, Transparency Deficit, Policy Reversal, Institutional Pressure, Legislative Obstruction, Democratic Erosion | **Third** — apply threat analysis using political frameworks (never STRIDE/DREAD/PASTA) |
| **4** | **[Political SWOT Framework](political-swot-framework.md)** | Evidence-based SWOT, confidence levels, 180-day decay, group-to-landscape aggregation | Strengths, Weaknesses, Opportunities, Threats — each with confidence (HIGH/MEDIUM/LOW) | **Fourth** — synthesize classification + risk + threat into strategic SWOT assessment |
| **5** | **[Political Style Guide](political-style-guide.md)** | Writing standards, 3 depth levels, evidence density requirements, anti-patterns | Level 1 Surface (200–500 words), Level 2 Strategic (800–2,000 words), Level 3 Intelligence (2,000–5,000 words) | **Fifth** — apply writing standards when drafting the analysis document |
| **6** | **[AI-Driven Analysis Guide](ai-driven-analysis-guide.md)** | Per-file AI protocol, quality gates, weighted scoring (7.0/10 minimum), conflict resolution | Evidence (25%), Depth (25%), Structural (20%), Actionable (15%), Neutrality (15%) | **Always** — orchestrates the entire pipeline; AI agents must read this first |

---

## 📖 Methodology Catalog

### 🤖 AI-Driven Analysis Guide — `ai-driven-analysis-guide.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Master protocol governing all AI-driven political intelligence analysis |
| **Scope** | All agentic workflows, all analysis types, all output artifacts |
| **Key Rules** | Folder isolation · AI-only content · Multi-framework depth · Quality gates |
| **Version** | 3.0 |

**Core Principles:**
- **Folder Isolation**: Every workflow writes ONLY to its own `analysis/YYYY-MM-DD/{articleType}/` subfolder
- **AI-Only Content**: Scripts must NEVER generate analysis prose, SWOT entries, risk scores, or template content
- **Quality Gates**: Automated checks validate every analysis artifact before commit (minimum 7.0/10)

### 🏷️ Political Classification Guide — `political-classification-guide.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Multi-dimensional taxonomy for political document and event classification |
| **Dimensions** | 7: Public Interest · Democratic Integrity · Policy Urgency · Economic Impact · Governance · Political Capital · Legislative Impact |
| **Confidence Levels** | HIGH (≥80%) · MEDIUM (60–79%) · LOW (<60%) |
| **Version** | 3.0 |

### ⚠️ Political Risk Assessment Methodology — `political-risk-methodology.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Systematic risk identification, scoring, and cascading impact analysis |
| **Risk Categories** | 6: Coalition Stability · Policy Implementation · Institutional Integrity · Economic Governance · Social Cohesion · Geopolitical Standing |
| **Scoring Model** | Likelihood (1–5) × Impact (1–5) = Risk Score (1–25) |
| **Advanced Features** | Cascading risk chains · Grand Coalition stability risk · Risk velocity tracking |
| **Version** | 3.0 |

### 💼 Political SWOT Analysis Framework — `political-swot-framework.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Multi-stakeholder strategic analysis for political events and policy decisions |
| **Stakeholder Lenses** | Grand Coalition · Opposition Bloc · Citizens/Civil Society · Economic Actors · International Observers |
| **Advanced Features** | TOWS Matrix · Cross-SWOT Interference · 180-day Decay · Scenario Generation · Temporal Dynamics |
| **Version** | 3.0 |

### 🎭 Political Threat Analysis Framework — `political-threat-framework.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Multi-framework threat modeling for democratic process threats |
| **Frameworks** | 6: Political Threat Landscape (6D) + Diamond Model + Attack Trees + PESTLE + Scenario Planning + Kill Chain |
| **Threat Taxonomy** | 6 Dimensions: Coalition Shifts · Transparency Deficit · Policy Reversal · Institutional Pressure · Legislative Obstruction · Democratic Erosion |
| **Version** | 3.0 |

> ⚠️ **STRIDE is NOT used.** The Political Threat Landscape replaces STRIDE with politically-native dimensions designed for democratic function analysis.

### ✍️ Political Intelligence Style Guide — `political-style-guide.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Establishes writing standards for all political intelligence output |
| **Scope** | Article tone, evidence citation standards, Mermaid diagram requirements, confidence labelling |
| **Key Standards** | Evidence tables (not prose) · EP procedure citations · Colour-coded diagrams · Multi-language terminology |
| **Version** | 3.0 |

---

## 🏷️ 1. Political Classification Guide

### Purpose & Scope

The classification guide establishes the authoritative methodology for categorizing every European Parliament event and document entering the analysis pipeline. It serves as the **mandatory first step** before any other analytical framework is applied.

### Key Concepts

| Concept | Description | Scale |
|---------|-------------|-------|
| **Sensitivity Levels** | Determines publication handling requirements | 🟢 PUBLIC → 🟡 SENSITIVE → 🔴 RESTRICTED |
| **Policy Domain Taxonomy** | Categorizes events by EU policy area | Environment, Economy, Foreign Affairs, Justice, etc. |
| **Urgency Matrix** | Assesses time-sensitivity for editorial response | Immediate → Short-term → Medium-term → Long-term |
| **7 Classification Dimensions** | Multi-axis scoring across political impact areas | 4-level ordinal scale per dimension |
| **Score Thresholds** | Aggregate classification severity tiers | ≥70 CRITICAL · ≥50 HIGH · ≥30 MEDIUM · <30 LOW |

### Classification Dimension Diagram

```mermaid
graph TD
    Event([📥 Incoming EP Event]) --> S1[Public Interest<br/>Sensitivity]
    Event --> S2[Democratic Integrity<br/>Impact]
    Event --> S3[Policy Urgency]
    Event --> S4[Economic Impact]
    Event --> S5[Governance Impact]
    Event --> S6[Political Capital<br/>Impact]
    Event --> S7[Legislative Impact]

    S1 --> Score[📊 Aggregate<br/>Classification Score]
    S2 --> Score
    S3 --> Score
    S4 --> Score
    S5 --> Score
    S6 --> Score
    S7 --> Score

    Score --> T1{Score ≥ 70?}
    T1 -->|Yes| CRIT[🔴 CRITICAL]
    T1 -->|No| T2{Score ≥ 50?}
    T2 -->|Yes| HIGH[🟠 HIGH]
    T2 -->|No| T3{Score ≥ 30?}
    T3 -->|Yes| MED[🟡 MEDIUM]
    T3 -->|No| LOW[🟢 LOW]

    style Event fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Score fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style CRIT fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style HIGH fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style MED fill:#F57F17,stroke:#E65100,color:#000000
    style LOW fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style S1 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style S2 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style S3 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style S4 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style S5 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style S6 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style S7 fill:#00695C,stroke:#004D40,color:#FFFFFF
```

### Connection to Other Methodologies

- **Feeds into Risk Methodology:** Classification severity determines initial risk likelihood calibration
- **Feeds into Threat Framework:** Sensitivity level determines which threat dimensions to prioritize
- **Feeds into SWOT:** High-classification events trigger SWOT re-assessment

---

## ⚠️ 2. Political Risk Methodology

### Purpose & Scope

Provides a systematic **Likelihood × Impact** scoring framework for European Parliament political risks, adapted from the Hack23 ISMS Risk Assessment Methodology. Produces quantified risk scores across six EP-specific risk categories.

### Key Concepts

| Concept | Description | Scale |
|---------|-------------|-------|
| **Likelihood Scale** | Probability of risk materializing | Rare (1) → Unlikely (2) → Possible (3) → Likely (4) → Almost Certain (5) |
| **Impact Scale** | Severity of consequences if realized | Negligible (1) → Minor (2) → Moderate (3) → Major (4) → Severe (5) |
| **Risk Score** | Quantified assessment: Likelihood × Impact | 1–25 (Low: 1–4, Medium: 5–9, High: 10–14, Critical: 15–25) |
| **Six Risk Categories** | EP-specific political risk domains | Coalition, Policy, Institutional, Economic, Social, Geopolitical |
| **Grand Coalition Risk** | Dedicated assessment of EP governing coalition stability | Composite metric from multiple indicators |

### Risk Scoring Matrix

```mermaid
quadrantChart
    title Likelihood × Impact Risk Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Likelihood --> High Likelihood
    quadrant-1 Critical Risk (15–25)
    quadrant-2 High Risk (10–14)
    quadrant-3 Low Risk (1–4)
    quadrant-4 Medium Risk (5–9)
```

### Connection to Other Methodologies

- **Receives from Classification:** Classification severity calibrates initial likelihood estimates
- **Feeds into Threat Framework:** High-risk scores trigger deeper multi-framework threat analysis
- **Feeds into SWOT:** Risk scores populate the Threats and Weaknesses quadrants

---

## 🎯 3. Political Threat Framework

### Purpose & Scope

Provides comprehensive, multi-framework political threat analysis using **purpose-built political intelligence frameworks**. This framework explicitly rejects software-centric threat models (STRIDE, DREAD, PASTA) in favor of six frameworks designed for democratic process analysis.

### Key Concepts

| Concept | Description | Frameworks |
|---------|-------------|------------|
| **Political Threat Landscape** | Core 6-dimension political threat model | Coalition Shifts, Transparency Deficit, Policy Reversal, Institutional Pressure, Legislative Obstruction, Democratic Erosion |
| **Diamond Model** | Adversary analysis identifying actors, capabilities, and motivations | Adversary → Infrastructure → Capability → Victim |
| **Attack Trees** | Goal-oriented threat decomposition for political objectives | Root goal → Sub-goals → Leaf actions |
| **PESTLE** | Macro-environmental threat scanning | Political, Economic, Social, Technological, Legal, Environmental |
| **Scenario Planning** | Forward-looking threat assessment with probability-weighted scenarios | Best Case → Base Case → Worst Case |
| **Political Kill Chain** | Sequential threat progression in political processes | Reconnaissance → Mobilization → Positioning → Execution → Exploitation |

### Political Threat Dimension Diagram

```mermaid
graph TB
    PTL([🎯 Political Threat<br/>Landscape Analysis]) --> CS[🔄 Coalition Shifts<br/>Voting bloc realignment]
    PTL --> TD[🔍 Transparency Deficit<br/>Information asymmetry]
    PTL --> PR[↩️ Policy Reversal<br/>Legislative rollback]
    PTL --> IP[🏛️ Institutional Pressure<br/>Power concentration]
    PTL --> LO[⏳ Legislative Obstruction<br/>Procedural sabotage]
    PTL --> DE[📉 Democratic Erosion<br/>Norm degradation]

    CS --> SEV{Severity 1–5}
    TD --> SEV
    PR --> SEV
    IP --> SEV
    LO --> SEV
    DE --> SEV

    SEV --> DM[💎 Diamond Model]
    SEV --> AT[🌳 Attack Trees]
    SEV --> PE[🌍 PESTLE]
    SEV --> SP[🎲 Scenario Planning]
    SEV --> KC[🔗 Kill Chain]

    style PTL fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style CS fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style TD fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style PR fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style IP fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style LO fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style DE fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style SEV fill:#F57F17,stroke:#E65100,color:#000000
    style DM fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style AT fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style PE fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style SP fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style KC fill:#4527A0,stroke:#311B92,color:#FFFFFF
```

### Connection to Other Methodologies

- **Receives from Classification:** Sensitivity levels determine which threat dimensions require analysis
- **Receives from Risk:** High-risk scores trigger multi-framework deep analysis
- **Feeds into SWOT:** Identified threats populate the Threats quadrant with evidence chains

---

## 💼 4. Political SWOT Framework

### Purpose & Scope

Establishes an **evidence-based** SWOT methodology where every entry in every quadrant must cite verifiable European Parliament data. This framework rejects opinion-based SWOT analysis and enforces confidence levels with a 180-day expiration rule.

### Key Concepts

| Concept | Description | Details |
|---------|-------------|---------|
| **Evidence Requirement** | Every SWOT entry must cite EP data sources | MCP tool calls, document references, voting records |
| **Confidence Levels** | Reliability grading for each entry | HIGH (multiple current sources) · MEDIUM (single primary) · LOW (credible but unverified) |
| **180-Day Decay** | Entries expire if not re-verified | Prevents stale assessments from persisting |
| **Group-to-Landscape Aggregation** | Individual political group SWOTs aggregate into landscape-level SWOT | Weighted by seat share and coalition significance |
| **Minimum Density** | Each quadrant must contain at least 2 entries | Prevents superficial analysis |

### SWOT Quadrant Flow

```mermaid
graph LR
    subgraph Internal
        S[✅ Strengths<br/>Legislative achievements<br/>Institutional cohesion]
        W[⚠️ Weaknesses<br/>Group fragmentation<br/>Legislative stalls]
    end

    subgraph External
        O[🚀 Opportunities<br/>Landmark legislation<br/>Cross-party consensus]
        T[🔴 Threats<br/>Far-right growth<br/>Legitimacy crisis]
    end

    S --> Synth[📊 Strategic Synthesis<br/>with Confidence Levels]
    W --> Synth
    O --> Synth
    T --> Synth

    style S fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style W fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style O fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style T fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style Synth fill:#4527A0,stroke:#311B92,color:#FFFFFF
```

### Connection to Other Methodologies

- **Receives from Classification, Risk, and Threat:** All three upstream frameworks feed evidence into SWOT quadrants
- **Feeds into Style Guide:** SWOT depth determines the appropriate writing depth level
- **Feeds into AI Guide:** SWOT completeness is a quality gate criterion (≥2 entries per quadrant)

---

## 📝 5. Political Style Guide

### Purpose & Scope

Establishes mandatory writing standards for all political intelligence analysis produced by EU Parliament Monitor's agentic workflows. Defines three depth levels calibrated to the classification severity and audience needs.

### Key Concepts

| Concept | Description | Specification |
|---------|-------------|---------------|
| **Level 1 — Surface** | News summary for breaking events | 200–500 words, min. 2 citations, daily scores |
| **Level 2 — Strategic** | Analysis article for weekly/committee briefs | 800–2,000 words, min. 5 citations, policy recommendations |
| **Level 3 — Intelligence** | Deep analysis for monthly reports and MEP scorecards | 2,000–5,000 words, min. 10 citations, scenario projections |
| **Evidence Density** | Minimum citations per artifact type | Varies by depth level: EP document refs + MCP data points |
| **Anti-Patterns** | Prohibited writing behaviors | No tables-only, no uncited claims, no opinions without evidence, no STRIDE |
| **Multi-Language** | Standards for 14-language output | Consistent analytical structure across all supported languages |

### Writing Depth Selection

```mermaid
flowchart TD
    Input([📥 Classified Event]) --> Sev{Classification<br/>Severity?}
    Sev -->|CRITICAL or HIGH| L3[📚 Level 3 — Intelligence<br/>2,000–5,000 words<br/>≥10 citations]
    Sev -->|MEDIUM| L2[📰 Level 2 — Strategic<br/>800–2,000 words<br/>≥5 citations]
    Sev -->|LOW| L1[📋 Level 1 — Surface<br/>200–500 words<br/>≥2 citations]

    L3 --> Review[✍️ Apply Style Standards]
    L2 --> Review
    L1 --> Review

    style Input fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Sev fill:#F57F17,stroke:#E65100,color:#000000
    style L3 fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style L2 fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style L1 fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style Review fill:#4527A0,stroke:#311B92,color:#FFFFFF
```

### Connection to Other Methodologies

- **Receives from Classification:** Severity determines depth level (Level 1, 2, or 3)
- **Receives from SWOT:** Strategic synthesis informs the narrative structure
- **Feeds into AI Guide:** Style compliance is a quality gate criterion

---

## 🤖 6. AI-Driven Analysis Guide

### Purpose & Scope

Defines the comprehensive per-file AI analysis protocol. This is the **orchestrator** document that AI agents must read before processing any European Parliament data file. It specifies the analysis pipeline, document-type focus templates, quality gates, and conflict resolution for parallel workflows.

### Key Concepts

| Concept | Description | Specification |
|---------|-------------|---------------|
| **Per-File Protocol** | Each EP MCP data file receives its own analysis | Dedicated markdown output per source file |
| **Document-Type Templates** | Tailored analysis focus per EP document type | Adopted texts, procedures, votes, speeches, questions, events, etc. |
| **Quality Score Formula** | Weighted multi-criteria self-assessment | Evidence (25%) + Depth (25%) + Structural (20%) + Actionable (15%) + Neutrality (15%) |
| **Minimum Score** | Hard quality gate for publication | **7.0/10 weighted score** — below threshold requires revision |
| **Conflict Resolution** | Rules for parallel workflow outputs | Deduplication, merge strategy, timestamp-based precedence |
| **Methodology Reading Order** | Agents must internalize all 6 methodology docs | This guide → Classification → Risk → Threat → SWOT → Style |

### AI Quality Gate Process

```mermaid
flowchart TD
    Data([📥 EP MCP Data File]) --> Read[📚 Read All 6 Methodologies]
    Read --> Analyze[🔬 Execute Analysis Pipeline<br/>Classify → Risk → Threat → SWOT → Write]
    Analyze --> Self[🔍 Self-Assessment Scoring]

    Self --> E[Evidence<br/>Weight: 25%]
    Self --> D[Depth<br/>Weight: 25%]
    Self --> St[Structural<br/>Weight: 20%]
    Self --> A[Actionable<br/>Weight: 15%]
    Self --> N[Neutrality<br/>Weight: 15%]

    E --> Calc[📊 Calculate<br/>Weighted Score]
    D --> Calc
    St --> Calc
    A --> Calc
    N --> Calc

    Calc --> Gate{Score ≥ 7.0?}
    Gate -->|✅ Pass| Publish([📤 Publish])
    Gate -->|❌ Fail| Revise[🔄 Revise Analysis]
    Revise --> Analyze

    style Data fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Read fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style Analyze fill:#00695C,stroke:#004D40,color:#FFFFFF
    style Self fill:#F57F17,stroke:#E65100,color:#000000
    style E fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style D fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style St fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style A fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style N fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style Calc fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style Gate fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style Publish fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style Revise fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
```

### Connection to Other Methodologies

- **Orchestrates all frameworks:** AI Guide is the entry point that invokes Classification → Risk → Threat → SWOT → Style in sequence
- **Enforces quality gates:** Validates outputs from every upstream methodology meet minimum standards
- **Handles conflicts:** Resolves parallel workflow collisions via timestamp-based precedence rules

---

## 🌳 Methodology Selection Decision Tree

Use this flowchart to determine which methodology to apply for a given analytical task:

```mermaid
flowchart TD
    Start([🎯 New Analysis Task]) --> Q1{What is the<br/>primary need?}

    Q1 -->|Categorize an EP event| CG[🏷️ Classification Guide<br/>Apply 7 dimensions]
    Q1 -->|Quantify political risk| RM[⚠️ Risk Methodology<br/>Likelihood × Impact]
    Q1 -->|Identify political threats| TF[🎯 Threat Framework<br/>6 Political Threat Dimensions]
    Q1 -->|Strategic assessment| SW[💼 SWOT Framework<br/>Evidence-based quadrants]
    Q1 -->|Write analysis article| SG[📝 Style Guide<br/>Select depth level]
    Q1 -->|Full pipeline analysis| AI[🤖 AI Analysis Guide<br/>Orchestrate all frameworks]

    CG --> Q2{Severity ≥ HIGH?}
    Q2 -->|Yes| RM
    Q2 -->|No| SG

    RM --> Q3{Risk Score ≥ 10?}
    Q3 -->|Yes| TF
    Q3 -->|No| SW

    TF --> SW
    SW --> SG
    SG --> AI

    AI --> Gate{Quality Gate<br/>≥ 7.0/10?}
    Gate -->|✅ Pass| Done([✅ Analysis Complete])
    Gate -->|❌ Fail| Revise[🔄 Revise from<br/>Weakest Dimension]
    Revise --> Q1

    style Start fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Q1 fill:#F57F17,stroke:#E65100,color:#000000
    style CG fill:#00695C,stroke:#004D40,color:#FFFFFF
    style RM fill:#E65100,stroke:#BF360C,color:#FFFFFF
    style TF fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SW fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style SG fill:#4A148C,stroke:#311B92,color:#FFFFFF
    style AI fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Q2 fill:#F57F17,stroke:#E65100,color:#000000
    style Q3 fill:#F57F17,stroke:#E65100,color:#000000
    style Gate fill:#F57F17,stroke:#E65100,color:#000000
    style Done fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style Revise fill:#D84315,stroke:#BF360C,color:#FFFFFF
```

---

## 🔄 Methodology Integration Flow

```mermaid
sequenceDiagram
    participant WF as 🔄 Agentic Workflow
    participant DL as 📥 Data Download
    participant CLASS as 🏷️ Classification
    participant RISK as ⚠️ Risk Assessment
    participant SWOT as 💼 SWOT Analysis
    participant THREAT as 🎭 Threat Analysis
    participant SIG as 📈 Significance
    participant SYNTH as 🧩 Synthesis
    participant QG as ✅ Quality Gate
    participant ART as 📰 Article Generation

    WF->>DL: Fetch EP MCP feed data
    DL->>CLASS: Raw documents + metadata

    Note over CLASS,THREAT: AI performs ALL analysis<br/>(never scripted)

    CLASS->>RISK: Classification results
    CLASS->>SWOT: Document classification
    CLASS->>THREAT: Document classification

    par Parallel Analysis
        RISK->>SIG: Risk scores + cascading analysis
        SWOT->>SIG: SWOT matrices + strategic implications
        THREAT->>SIG: Threat profiles + kill chains
    end

    SIG->>SYNTH: Significance scores
    SYNTH->>QG: Synthesis summary

    QG-->>QG: Validate structure,<br/>evidence, Mermaid,<br/>confidence, citations
    QG->>ART: Approved analysis
    ART->>WF: HTML article + 14 translations

    Note over QG: Quality gate checks:<br/>✓ Evidence tables<br/>✓ Mermaid diagrams<br/>✓ EP procedure citations<br/>✓ Confidence labels<br/>✓ No stub content
```

---

## 🎯 Article-Type-Specific Methodology Selection

Different EP document types require **different analytical emphasis**. This matrix maps which methodologies are PRIMARY vs SUPPORTING for each workflow type:

| Article Type | Classification | Risk | SWOT | Threat | Significance | Stakeholder | Unique Focus |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Breaking News** | 🔴 PRIMARY | 🔴 PRIMARY | ✅ | ✅ | 🔴 PRIMARY | ✅ | Real-time urgency scoring, political temperature spike detection |
| **Motions** | 🔴 PRIMARY | ✅ | ✅ | 🔴 PRIMARY | ✅ | ✅ | Per-resolution vote breakdown by group, defection pattern analysis |
| **Propositions** | ✅ | 🔴 PRIMARY | 🔴 PRIMARY | ✅ | ✅ | 🔴 PRIMARY | Legislative pipeline stage, rapporteur influence, amendment success rates |
| **Committee Reports** | 🔴 PRIMARY | 🔴 PRIMARY | ✅ | ✅ | ✅ | 🔴 PRIMARY | Committee productivity, document classification by committee domain |
| **Week Ahead** | ✅ | 🔴 PRIMARY | 🔴 PRIMARY | 🔴 PRIMARY | ✅ | ✅ | Prospective risk landscape, scheduled debate preview, expected vote outcomes |
| **Weekly Review** | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | ✅ | Cross-type trend detection, week-over-week pattern shifts |
| **Month Ahead** | ✅ | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | ✅ | ✅ | Strategic political calendar, major policy decision forecast |
| **Monthly Review** | ✅ | ✅ | 🔴 PRIMARY | ✅ | ✅ | 🔴 PRIMARY | Legislative throughput, political group productivity, Grand Coalition scorecard |

> **Reading the matrix:** ✅ = always required for all types. 🔴 PRIMARY = the methodology that should receive the most analytical depth and word count for this article type. Each workflow must apply ALL methodologies but allocate **more time and depth** to PRIMARY ones.

### Unique Analytical Sections Per Article Type

Each article type should produce unique analytical sections in its synthesis that **no other workflow can produce**:

| Article Type | Template | Unique Section Name | What Makes It Unique |
|---|---|---|---|
| **Breaking News** | Significance | **Breaking Urgency Rating** | Real-time significance assessment with 6-hour refresh — only breaking workflow has this cadence |
| **Motions** | Threat | **Defection Pattern Dashboard** | Political group voting discipline per-resolution — only motion workflow analyses individual votes |
| **Propositions** | Risk | **Legislative Pipeline Risk** | Where the procedure sits (committee → plenary → trilogue → adoption) and risk of delay/amendment |
| **Propositions** | Stakeholder | **Rapporteur Influence Scorecard** | Rapporteur and shadow rapporteur influence mapping — unique to procedure-level analysis |
| **Committee Reports** | Stakeholder | **Committee Productivity Matrix** | Per-committee output volume, meeting frequency, document production rate |
| **Committee Reports** | Classification | **Cross-Committee Comparison** | Relative workload and output comparison across EP committees |
| **Week Ahead** | SWOT | **Pre-Plenary Intelligence Brief** | Forward-looking SWOT for upcoming plenary agenda — only week-ahead can provide this prospective view |
| **Weekly Review** | SWOT | **Week-over-Week Trend Delta** | How did this week's political temperature differ from last week? Only weekly scope enables this |
| **Month Ahead** | Risk | **Strategic Calendar Risk Map** | Forward-looking risk landscape tied to specific scheduled events (budget debates, EU summits) |
| **Monthly Review** | Synthesis | **Grand Coalition Scorecard** | Comprehensive monthly assessment of Grand Coalition legislative effectiveness and cohesion |

---

## ✅ Quality Gate Requirements

All analysis produced under these methodologies must meet the following minimum quality requirements before publication:

### Weighted Quality Score (Minimum 7.0/10)

| Dimension | Weight | Criteria | Fail Indicators |
|-----------|--------|----------|-----------------|
| **Evidence** | 25% | Every claim cites EP MCP data; confidence levels stated; no opinion-only entries | Uncited claims, missing confidence, assertions without data |
| **Depth** | 25% | Appropriate depth level (L1/L2/L3) applied; word count within range; citation count met | Wrong depth level, under minimum citations, superficial coverage |
| **Structural** | 20% | Hack23 header present; metadata complete; Mermaid diagram included; structured tables used | Missing header, no diagram, placeholder content, broken formatting |
| **Actionable** | 15% | Analysis includes concrete implications; stakeholder impact identified; forward-looking recommendations | Purely descriptive without implications, no stakeholder analysis |
| **Neutrality** | 15% | Balanced perspective; no partisan framing; multiple viewpoints acknowledged; factual tone | One-sided framing, loaded language, missing counter-perspectives |

### Structural Checklist

- [ ] Hack23 header with metadata (Owner, Version, Date, Classification)
- [ ] At least one color-coded Mermaid diagram
- [ ] Classification completed across all 7 dimensions
- [ ] SWOT with ≥2 evidence-based entries per quadrant
- [ ] Risk score calculated using 5×5 Likelihood × Impact matrix
- [ ] Threat analysis using Political Threat Landscape (not STRIDE/DREAD/PASTA)
- [ ] Appropriate depth level selected and word/citation counts met
- [ ] Significance score (1–10) with justification

---

## 🚫 Anti-Patterns — What NOT To Do

The following practices are **explicitly prohibited** across all methodologies:

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|-------------|------------------|
| **Using STRIDE, DREAD, or PASTA** | These are software security threat models, not political intelligence frameworks | Use Political Threat Landscape (6 dimensions), Diamond Model, Attack Trees, PESTLE, Scenario Planning, Kill Chain |
| **Boilerplate summaries** | Generic text adds no analytical value; wastes reader attention | Every paragraph must contain at least one EP data citation or concrete analytical insight |
| **Claims without confidence levels** | Ungraded assertions cannot be evaluated for reliability | Assign HIGH / MEDIUM / LOW confidence with source justification |
| **Tables-only analysis** | Data without narrative interpretation is not analysis | Tables must be accompanied by explanatory prose interpreting the data |
| **Opinion without evidence** | Subjective assertions undermine analytical credibility | All opinions must cite verifiable EP MCP data sources |
| **Hardcoded Mermaid values** | Static diagrams become stale and misleading | Use data-driven values sourced from EP MCP tool results |
| **Shallow classification** | Single-dimension classification misses complexity | Apply all 7 classification dimensions; score each independently |
| **Stale SWOT entries** | Entries older than 180 days without re-verification are unreliable | Enforce 180-day decay rule; re-verify or remove expired entries |
| **Missing stakeholder analysis** | Analysis without impact assessment has no actionable value | Identify affected political groups, MEPs, committees, and citizens |
| **Ignoring multi-language requirements** | Analysis must serve 14-language platform | Structure content for translation; avoid idioms and culture-specific references |

---

## 🔗 ISMS Reference Adaptations

The analysis methodologies are adapted from Hack23's ISO 27001/NIST CSF/CIS Controls ISMS framework. The `reference/` directory contains mapping documents showing how cybersecurity risk concepts translate to political intelligence:

| Reference Document | ISMS Source | Political Adaptation |
|---|---|---|
| [`isms-classification-adaptation.md`](../reference/isms-classification-adaptation.md) | ISO 27001 A.5.12–A.5.13 | Multi-dimensional political event classification |
| [`isms-risk-assessment-adaptation.md`](../reference/isms-risk-assessment-adaptation.md) | ISO 27001 A.8.8, NIST CSF ID.RA | Cascading political risk assessment |
| [`isms-style-guide-adaptation.md`](../reference/isms-style-guide-adaptation.md) | ISO 27001 A.5.37 | Evidence-based political writing standards |
| [`isms-threat-modeling-adaptation.md`](../reference/isms-threat-modeling-adaptation.md) | ISO 27001 A.5.7, NIST CSF ID.RA-3 | Multi-framework political threat modeling |

---

## 🔒 ISMS Compliance Framework Mapping

### ISO 27001:2022 Controls

| Control | Title | Methodology Relevance |
|---------|-------|----------------------|
| **A.5.1** | Policies for information security | All methodologies align with Hack23 ISMS policy framework |
| **A.5.10** | Acceptable use of information | Classification guide defines sensitivity-based data handling |
| **A.5.33** | Protection of records | Style guide enforces evidence citation and audit trail |
| **A.8.3** | Information access restriction | Sensitivity levels (PUBLIC/SENSITIVE/RESTRICTED) gate access |
| **A.8.10** | Information deletion | 180-day SWOT decay rule ensures stale data is removed |
| **A.8.28** | Secure coding | AI analysis guide enforces structured, reviewable output with quality gates |

### NIST CSF 2.0 Functions

| Function | Relevance to Methodologies |
|----------|---------------------------|
| **Identify (ID)** | Classification guide identifies and categorizes EP events by sensitivity and impact |
| **Protect (PR)** | Style guide protects analytical quality through evidence requirements and anti-patterns |
| **Detect (DE)** | Threat framework detects political threats across 6 dimensions using multiple analytical models |
| **Respond (RS)** | Risk methodology provides quantified risk scores enabling proportionate response |
| **Recover (RC)** | SWOT framework supports strategic recovery planning through forward-looking opportunity analysis |

### CIS Controls v8.1

| Control | Title | Methodology Relevance |
|---------|-------|----------------------|
| **Control 1** | Inventory and Control of Enterprise Assets | Classification guide inventories and categorizes all EP data assets |
| **Control 3** | Data Protection | Sensitivity levels enforce appropriate handling for each data classification |
| **Control 8** | Audit Log Management | AI analysis guide requires documented quality gate assessments (audit trail) |
| **Control 14** | Security Awareness and Skills Training | Methodology documents serve as training material for AI agents and analysts |
| **Control 16** | Application Software Security | Quality gates enforce structured, validated analytical output |

---

## 📰 Workflow-Specific Analytical Approach

Each agentic workflow applies the 6 methodologies with **unique emphasis** tailored to its article type. The following shows which methodologies are primary vs. supporting for each workflow:

```mermaid
flowchart TD
    subgraph "🏷️ Classification"
        CG["Political Classification Guide"]
    end
    subgraph "⚠️ Risk"
        RM["Risk Methodology"]
    end
    subgraph "🎯 Threat"
        TF["Political Threat Framework"]
    end
    subgraph "💼 SWOT"
        SW["SWOT Framework"]
    end

    subgraph "📰 Workflow Article Types"
        BK["🔴 Breaking\n= CG + RM primary"]
        MO["📋 Motions\n= CG + TF primary"]
        PR["📜 Propositions\n= RM + SW primary"]
        CR["🏛️ Committee\n= RM + CG primary"]
        WA["📅 Week Ahead\n= SW + RM primary"]
        WR["📊 Weekly Review\n= CG + SW primary"]
        MA["📆 Month Ahead\n= SW + TF primary"]
        MR["📈 Monthly Review\n= ALL primary"]
    end

    CG --> BK & MO & CR & WR
    RM --> BK & PR & CR & WA & MR
    TF --> MO & MA & MR
    SW --> PR & WA & WR & MA & MR

    style CG fill:#00695C,stroke:#004D40,color:#fff
    style RM fill:#E65100,stroke:#BF360C,color:#fff
    style TF fill:#B71C1C,stroke:#880E4F,color:#fff
    style SW fill:#1B5E20,stroke:#1B5E20,color:#fff
    style BK fill:#dc3545,stroke:#b02a37,color:#fff
    style MO fill:#fd7e14,stroke:#ca6510,color:#fff
    style PR fill:#ffc107,stroke:#cc9a06,color:#000
    style CR fill:#198754,stroke:#146c43,color:#fff
    style WA fill:#0d6efd,stroke:#0a58ca,color:#fff
    style WR fill:#6f42c1,stroke:#59359a,color:#fff
    style MA fill:#d63384,stroke:#ab296a,color:#fff
    style MR fill:#0dcaf0,stroke:#0aa2c0,color:#000
```

### Unique Analytics Per Article Type

| Workflow | Primary Methodology Focus | Unique Analytical Requirements |
|----------|--------------------------|-------------------------------|
| **Breaking News** | Classification (urgency rating) + Risk (impact severity) | ⚡ Real-time significance scoring; only TODAY's items qualify; 6-hour refresh cycle |
| **Motions** | Classification (resolution type) + Threat (coalition shifts) | 🗳️ Per-resolution vote breakdown by political group; defection pattern analysis |
| **Propositions** | Risk (legislative pipeline risk) + SWOT (strategic implications) | 📜 Procedure stage tracking; committee assignment impact; rapporteur influence mapping |
| **Committee Reports** | Risk (committee output risk) + Classification (document type) | 🏛️ Per-committee productivity analysis; cross-committee comparison; meeting agenda review |
| **Week Ahead** | SWOT (opportunity identification) + Risk (upcoming vote risks) | 📅 Forward-looking agenda analysis; scheduled vote significance; pre-plenary intelligence |
| **Weekly Review** | Classification (outcome categorization) + SWOT (accomplishment assessment) | 📊 Vote outcome impact; legislative progress measurement; political group performance |
| **Month Ahead** | SWOT (strategic outlook) + Threat (emerging democratic threats) | 📆 Legislative calendar analysis; cross-institutional dynamics; emerging policy trends |
| **Monthly Review** | ALL methodologies at equal weight | 📈 Comprehensive trend analysis; inter-temporal pattern detection; political landscape evolution |

> **Key principle:** Every article type must produce analysis that is **unique and specific** to its focus area. A breaking news analysis looks fundamentally different from a monthly review analysis — different data sources, different methodology emphasis, different analytical depth.

---

## 🔗 Related Documentation

- **[Architecture](../../ARCHITECTURE.md)** — C4 system architecture and deployment model
- **[Security Architecture](../../SECURITY_ARCHITECTURE.md)** — Security controls and compliance mapping
- **[Data Model](../../DATA_MODEL.md)** — European Parliament data structures and relationships
- **[Flowcharts](../../FLOWCHART.md)** — Data processing workflows and analysis pipelines
- **[SWOT Analysis](../../SWOT.md)** — Platform-level strategic assessment
- **[Threat Model](../../THREAT_MODEL.md)** — System-level threat analysis
- **[Workflows](../../WORKFLOWS.md)** — CI/CD pipelines including analysis generation
- **[Analysis README](../README.md)** — Parent analysis directory documentation
- **[Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)** — Hack23 ISMS data classification policy
- **[AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md)** — Hack23 ISMS AI governance policy

---

<div class="architecture-footer">

**Document Status:** Living Document
**Last Updated:** 2026-03-31
**Next Review:** 2026-06-30
**Owner:** CEO

This methodology documentation complies with
[Hack23 ISMS AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) and
[Hack23 ISMS Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md).

</div>
