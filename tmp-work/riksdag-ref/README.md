<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📚 Analysis Methodologies — Political Intelligence Framework</h1>

<p align="center">
  <strong>📊 Comprehensive Methodology Library for Riksdagsmonitor Political Analysis</strong><br>
  <em>🎯 Evidence-Based · Multi-Framework · ISMS-Compliant · AI-Driven</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-4.2-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--06--01-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 4.2 | **📅 Last Updated:** 2026-06-01 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30  
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 📚 Architecture Documentation Map

<table class="documentation-map">
  <thead>
    <tr>
      <th>Document</th>
      <th>Focus</th>
      <th>Description</th>
      <th>Documentation Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong><a href="../../ARCHITECTURE.md">Architecture</a></strong></td>
      <td>🏛️ Architecture</td>
      <td>C4 model showing current system structure</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/ARCHITECTURE.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../FUTURE_ARCHITECTURE.md">Future Architecture</a></strong></td>
      <td>🏛️ Architecture</td>
      <td>C4 model showing future system structure</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/FUTURE_ARCHITECTURE.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../SECURITY_ARCHITECTURE.md">Security Architecture</a></strong></td>
      <td>🛡️ Security</td>
      <td>Current security implementation</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/SECURITY_ARCHITECTURE.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../THREAT_MODEL.md">Threat Model</a></strong></td>
      <td>🎯 Security</td>
      <td>Threat analysis</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/THREAT_MODEL.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../DATA_MODEL.md">Data Model</a></strong></td>
      <td>📊 Data</td>
      <td>Current data structures and relationships</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/DATA_MODEL.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../FLOWCHART.md">Flowcharts</a></strong></td>
      <td>🔄 Process</td>
      <td>Current data processing workflows</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/FLOWCHART.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../SWOT.md">SWOT Analysis</a></strong></td>
      <td>💼 Business</td>
      <td>Current strategic assessment</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/SWOT.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../../WORKFLOWS.md">Workflows</a></strong></td>
      <td>⚙️ DevOps</td>
      <td>CI/CD documentation</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/WORKFLOWS.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../README.md">Analysis Directory</a></strong></td>
      <td>🔬 Analysis</td>
      <td>Analysis directory overview and structure</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/README.md">View Source</a></td>
    </tr>
    <tr>
      <td><strong><a href="../templates/README.md">Analysis Templates</a></strong></td>
      <td>📋 Templates</td>
      <td>23 structured analysis output templates (8 core single-type + 15 extended / Tier-C)</td>
      <td><a href="https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/templates/README.md">View Source</a></td>
    </tr>
  </tbody>
</table>

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

## 🤖 How agentic workflows consume these methodologies

The 12 agentic news workflows in `.github/workflows/news-*.md` are the **primary consumer** of these methodologies. The authoritative workflow contract lives in [`.github/prompts/`](../../.github/prompts/) — see [`.github/prompts/README.md`](../../.github/prompts/README.md) for the full module catalogue.

| Methodology | Read in Pass 1 (mandatory) | Read in Pass 2 (improvement) | Enforced by |
|-------------|---------------------------|------------------------------|-------------|
| [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) | ✅ role, DIW weighting, pass structure | — | `05-analysis-gate.md` check 1 (artifact presence) |
| [`per-document-methodology.md`](per-document-methodology.md) | ✅ one `{dok_id}-analysis.md` per document | — | `05-analysis-gate.md` check 2 (per-doc coverage) |
| [`political-classification-guide.md`](political-classification-guide.md) | ✅ produces `classification-results.md` | — | `05-analysis-gate.md` check 1 |
| [`political-swot-framework.md`](political-swot-framework.md) | ✅ produces `swot-analysis.md` + TOWS matrix | ✅ tighten evidence tables | `05-analysis-gate.md` check 4 (evidence) |
| [`political-risk-methodology.md`](political-risk-methodology.md) | ✅ produces `risk-assessment.md` | ✅ sensitivity & posterior probabilities | `05-analysis-gate.md` check 1 |
| [`political-threat-framework.md`](political-threat-framework.md) | ✅ produces `threat-analysis.md` | ✅ kill-chain depth | `05-analysis-gate.md` check 1 |
| [`political-style-guide.md`](political-style-guide.md) | — | ✅ tone, neutrality, evidence citations | Article Pass-2 review |
| [`strategic-extensions-methodology.md`](strategic-extensions-methodology.md) | ✅ every run, all 5 Family C artifacts (`executive-brief.md`, `scenario-analysis.md`, `comparative-international.md`, `devils-advocate.md`, `intelligence-assessment.md`, `methodology-reflection.md`) | ✅ scenario probabilities, ICD 203 audit | `05-analysis-gate.md` checks 1 + 7 (Family C structure) |
| [`structural-metadata-methodology.md`](structural-metadata-methodology.md) | ✅ cross-reference continuity contracts | — | `05-analysis-gate.md` check 1 (artifact presence) |
| [`synthesis-methodology.md`](synthesis-methodology.md) | ✅ produces `synthesis-summary.md` with DIW-weighted ranking | ✅ lead-story justification | `05-analysis-gate.md` checks 1 + 5 (Mermaid) |
| [`electoral-domain-methodology.md`](electoral-domain-methodology.md) | ✅ Election 2026 lens paragraph | — | Article-generation mandatory section |
| [`osint-tradecraft-standards.md`](osint-tradecraft-standards.md) | ✅ ICD 203 + Admiralty + WEP + SAT catalog + OSINT ethics + DIW alignment + PIR handoff | ✅ ICD 203 audit, SAT attestation (≥10), DIW–Admiralty reconciliation | `05-analysis-gate.md` checks 4 (evidence), 5 (Mermaid), 7 (Family C structure), 8 (Family D horizons) |

**Upstream gh-aw documentation** (link-out only — these methodologies own the political-analysis content; gh-aw owns the workflow runtime):

- Abridged: <https://github.github.com/gh-aw/llms-small.txt>
- Complete: <https://github.github.com/gh-aw/llms-full.txt>
- Agentic-workflows blog series: <https://github.github.com/gh-aw/_llms-txt/agentic-workflows.txt>

---

## 🎯 Purpose

This directory contains the **authoritative methodology library** for all political intelligence analysis performed by Riksdagsmonitor's AI-driven agentic workflows. Each methodology document defines the analytical framework, evaluation criteria, evidence standards, and quality requirements that AI agents MUST follow when producing political intelligence.

> **Key Principle:** Scripts download data ONLY. AI performs ALL analytical content generation. These methodologies guide AI agents — they are never executed by scripts.

**Core Principle:** Every analytical claim requires verifiable evidence sourced from Swedish parliamentary open data. Opinion-based analysis, boilerplate summaries, and software-centric threat models (such as STRIDE, DREAD, or PASTA) are explicitly rejected.

**Design Philosophy:** The six methodologies form a layered analytical pipeline — classification provides the foundation, risk and threat assessments build the analytical core, SWOT synthesizes strategic implications, style standards enforce writing quality, and the AI guide orchestrates the entire pipeline with quality gates.

---

## 🔄 Methodology Pipeline — How AI Agents Apply Frameworks

The following diagram illustrates the sequential pipeline that an AI agent follows when processing an incoming Riksdag data file:

```mermaid
flowchart TD
    Start([📥 Riksdag MCP Data Received]) --> Read[📚 Agent Reads All 6 Methodology Docs]
    Read --> Classify[🏷️ Step 1: Classify Event<br/>7-Dimension Classification]
    Classify --> Risk[⚠️ Step 2: Assess Risk<br/>Likelihood × Impact Matrix]
    Risk --> Threat[🎯 Step 3: Analyze Threats<br/>Political Threat Taxonomy<br/>+ 3 Supporting Frameworks]
    Threat --> SWOT[💼 Step 4: Build SWOT<br/>Evidence-Based Quadrants]
    SWOT --> Write[📝 Step 5: Write Analysis<br/>Depth Level 1/2/3]
    Write --> QualityGate{✅ Quality Gate<br/>Score ≥ 7.0/10?}
    QualityGate -->|Yes ✅| Publish([📤 Publish Analysis])
    QualityGate -->|No ❌| Revise[🔄 Revise & Re-Assess]
    Revise --> Classify

    style Start fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Read fill:#4527A0,stroke:#311B92,color:#FFFFFF
    style Classify fill:#00695C,stroke:#004D40,color:#FFFFFF
    style Risk fill:#E65100,stroke:#E65100,color:#FFFFFF
    style Threat fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SWOT fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style Write fill:#4A148C,stroke:#311B92,color:#FFFFFF
    style QualityGate fill:#F57C00,stroke:#E65100,color:#FFFFFF
    style Publish fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style Revise fill:#E65100,stroke:#E65100,color:#FFFFFF
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
    style RG fill:#E65100,stroke:#E65100,color:#FFFFFF
    style TF fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SW fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style SG fill:#4A148C,stroke:#311B92,color:#FFFFFF
    style AI fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
```

---

## 📋 Methodology Summary Table

> **🎯 Start here:** the **[AI-Driven Analysis Guide](ai-driven-analysis-guide.md)** is the single, canonical entry point for every agentic workflow. It defines the 7-step protocol and the Family A–E output matrix that every methodology below feeds into.

> **🔄 Tradecraft anchors (v4.2):** Every methodology now includes a **Tradecraft Anchors** block referencing the doctrinal standards in [`political-style-guide.md`](political-style-guide.md): **F3EAD** intelligence cycle stage, **PIR/EEI** mapping, **Admiralty Code** floor, **WEP + ODNI** confidence requirements, **ICD 203** gate, **SAT(s)** applied, **Collection Management Matrix** (MCP tool → evidence → template), and **Source Diversity Rule** (≥3 primary + ≥1 secondary per P0/P1 claim; single-source = `[unconfirmed]`). See the style guide for canonical definitions.

| Priority | Document | Key Content | F3EAD Stage | Dimensions / Frameworks | When to Apply |
|----------|----------|-------------|:-----------:|-------------------------|---------------|
| **★ Start** | **[AI-Driven Analysis Guide](ai-driven-analysis-guide.md)** | 7-step protocol, Family A–E output matrix, color-coded Mermaid palette, 5-level confidence scale, DIW weighting, quality gate | ALL | Evidence (25%), Depth (25%), Structural (20%), Actionable (15%), Neutrality (15%), ICD 203 (pass/fail) | **Always read first** — orchestrates every other methodology and names every output file with its template |
| **☆ Tradecraft** | **[Political Style Guide](political-style-guide.md)** | **Tradecraft anchors:** F3EAD, PIR/EEI, Admiralty Code, ICD 203, WEP + ODNI, SATs, Collection Management Matrix | ALL | Writing standards, 4 depth tiers, evidence density, Mermaid conventions | **Read second** — defines all tradecraft standards referenced by other methodologies |
| **🕵️ Tradecraft Canon** | **[OSINT / INTOP Tradecraft Standards](osint-tradecraft-standards.md)** | ICD 203 (9 standards) · Admiralty Code (6×6 → 5-level confidence) · WEP / Kent Scale (7 bands, EN+SV) · SAT catalog (10 core + 5 supporting) · OSINT ethics (GDPR Art. 9) · DIW–Admiralty reconciliation · PIR handoff | ALL | Source grading, estimative vocabulary, technique attestation, ethics & scope, DIW alignment, cross-cycle continuity | **Read alongside style guide** — canonical reference for every evidence citation, confidence marker, and `methodology-reflection.md §ICD 203 audit` |
| **Family A** | **[Synthesis & Scoring Methodology](synthesis-methodology.md)** | Step-by-step production of significance-scoring, synthesis-summary, stakeholder-perspectives, stakeholder-impact, executive-brief | ANALYZE→DISSEMINATE | DIW 6-dimension weighting, Confidence (5-level), Winner/loser quantification, 400–600 word brief budget | Every workflow — 5 Family A core files |
| **Family B** | **[Structural Metadata Methodology](structural-metadata-methodology.md)** | Step-by-step production of data-download-manifest and cross-reference-map with SLA table and relationship taxonomy | FIND→FIX | Freshness SLA per source, Relationship taxonomy (7 edge types), Coordinated-activity detection | Every workflow — 2 Family B provenance files |
| **Family C** | **[Strategic Extensions Methodology](strategic-extensions-methodology.md)** | Step-by-step production of scenario-analysis, comparative-international, devils-advocate (ACH), intelligence-assessment, ⭐ methodology-reflection (VITAL run-audit) | ANALYZE | Scenario probability ≤ 100%, ACH evidence matrix, Peer-country benchmark, Key Judgments + PIR | **Core — every run produces all 5** |
| **Family D** | **[Electoral & Domain Methodology](electoral-domain-methodology.md)** | Step-by-step production of election-2026, voter-segmentation, coalition-mathematics, historical-parallels, media-framing, implementation-feasibility, forward-indicators | ANALYZE→DISSEMINATE | Sainte-Laguë seat math, SCB segment cuts, Coalition arithmetic, 4-horizon forward indicators | **Core — every run produces all 7** |
| **Family E** | **[Per-Document Methodology](per-document-methodology.md)** | Step-by-step production of `{dok_id}-analysis.md` and `{theme}-cluster-analysis.md` with doctype-specific Mermaid taxonomy | FINISH | DIW 6-dimension scoring, Cluster decision rule (4 conditions), Citation format canon | Every workflow — one file per document or qualifying cluster |
| **1** | **[Political Classification Guide](political-classification-guide.md)** | 7-dimension event classification, sensitivity levels, policy domain taxonomy, urgency matrix | FINISH | Sensitivity (4 levels), Democratic Integrity, Policy Urgency, Economic Impact, Governance Impact, Political Capital, Legislative Impact | Step 3 — every incoming Riksdag document is classified before analysis begins |
| **2** | **[Political Risk Methodology](political-risk-methodology.md)** | Likelihood × Impact scoring, 8 risk categories, 5×5 matrix, cascading risk analysis | EXPLOIT | Policy, Legislative, Economic, Social, Security, Diplomatic, Coalition, Constitutional | Step 3–4 — assess political risk using calibrated scoring |
| **3** | **[Political Threat Framework](political-threat-framework.md)** | Multi-framework threat analysis: Political Threat Taxonomy + Diamond Model + Attack Trees + Kill Chain | EXPLOIT→ANALYZE | Narrative Integrity, Legislative Integrity, Accountability, Transparency, Democratic Process, Power Balance | Step 4 — apply threat analysis using political frameworks |
| **4** | **[Political SWOT Framework](political-swot-framework.md)** | Evidence-based SWOT with TOWS + cross-SWOT; confidence levels; 180-day decay; group-to-landscape aggregation | EXPLOIT | Strengths, Weaknesses, Opportunities, Threats — each with confidence (VERY HIGH / HIGH / MEDIUM / LOW / VERY LOW) | Step 4 — synthesize classification + risk + threat into strategic SWOT assessment |

### Family A–E output matrix (authoritative definition lives in the [AI-Driven Analysis Guide](ai-driven-analysis-guide.md#-output-matrix--every-file-every-family))

| Family | Purpose | Produced by |
|:------:|---------|-------------|
| 📘 **A** — Core Synthesis | 9 always-produced files (executive brief, synthesis, significance, classification, SWOT, risk, threat, stakeholder, folder README) | Every workflow |
| 📗 **B** — Structural Metadata | 2 always-produced files (data-download manifest, cross-reference map) | Every workflow |
| 📙 **C** — Strategic Extensions | 5 always-produced files (scenario, comparative-international, devil's advocate, intelligence assessment, ⭐ methodology-reflection — **vital run-audit**) | Every workflow |
| 📕 **D** — Electoral & Domain Lenses | 7 always-produced files (election-2026, voter-segmentation, coalition-mathematics, historical parallels, media framing, implementation feasibility, forward indicators) | Every workflow |
| 📒 **E** — Per-Document | 1 file per document (per-file-political-intelligence), plus cluster files for theme-grouped batches | Every workflow |

---

## 📐 Methodology Architecture

```mermaid
graph TB
    subgraph "🏛️ Core Analysis Engine"
        GUIDE["🤖 AI-Driven Analysis Guide<br/><i>Master Protocol · entry point</i>"]
        STYLE["✍️ Political Style Guide<br/><i>Writing Standards</i>"]
    end

    subgraph "🗂️ Family Production Methodologies"
        FAMA["📘 Synthesis & Scoring<br/><i>Family A — 5 files</i>"]
        FAMB["📗 Structural Metadata<br/><i>Family B — 2 files</i>"]
        FAMC["📙 Strategic Extensions<br/><i>Family C — 5 files</i>"]
        FAMD["📕 Electoral & Domain<br/><i>Family D — 7 files</i>"]
        FAME["📒 Per-Document<br/><i>Family E — N files</i>"]
    end

    subgraph "🔬 Analytical Frameworks"
        CLASS["🏷️ Classification Guide<br/><i>7-Dimension Taxonomy</i>"]
        RISK["⚠️ Risk Methodology<br/><i>Cascading Risk Model</i>"]
        SWOT["💼 SWOT Framework<br/><i>TOWS + Cross-SWOT</i>"]
        THREAT["🎭 Threat Framework<br/><i>4-Framework Approach</i>"]
    end

    subgraph "📋 ISMS Reference Layer"
        ISMS1["📖 ISMS Classification"]
        ISMS2["📖 ISMS Risk Assessment"]
        ISMS3["📖 ISMS Style Guide"]
        ISMS4["📖 ISMS Threat Modeling"]
    end

    GUIDE -->|"orchestrates"| FAMA
    GUIDE -->|"orchestrates"| FAMB
    GUIDE -->|"orchestrates"| FAMC
    GUIDE -->|"orchestrates"| FAMD
    GUIDE -->|"orchestrates"| FAME

    FAME -->|"feeds"| FAMA
    FAMB -->|"feeds"| FAMA
    FAMA -->|"feeds"| FAMC
    FAMA -->|"feeds"| FAMD

    STYLE -->|"standards"| FAMA
    STYLE -->|"standards"| FAMB
    STYLE -->|"standards"| FAMC
    STYLE -->|"standards"| FAMD
    STYLE -->|"standards"| FAME

    CLASS -->|"invoked in"| FAME
    RISK -->|"invoked in"| FAMA
    RISK -->|"invoked in"| FAMC
    SWOT -->|"invoked in"| FAMA
    THREAT -->|"invoked in"| FAMA

    ISMS1 -.->|"adapted from"| CLASS
    ISMS2 -.->|"adapted from"| RISK
    ISMS3 -.->|"adapted from"| STYLE
    ISMS4 -.->|"adapted from"| THREAT

    style GUIDE fill:#1565C0,color:#FFFFFF,stroke:#0D47A1,stroke-width:2px
    style STYLE fill:#7B1FA2,color:#FFFFFF,stroke:#4A148C,stroke-width:2px
    style FAMA fill:#4CAF50,color:#FFFFFF,stroke:#1B5E20,stroke-width:2px
    style FAMB fill:#1565C0,color:#FFFFFF,stroke:#0D47A1,stroke-width:2px
    style FAMC fill:#FF9800,color:#FFFFFF,stroke:#E65100,stroke-width:2px
    style FAMD fill:#D32F2F,color:#FFFFFF,stroke:#B71C1C,stroke-width:2px
    style FAME fill:#FFC107,color:#3E2723,stroke:#F57F17,stroke-width:2px
    style CLASS fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32,stroke-width:2px
    style RISK fill:#D32F2F,color:#FFFFFF,stroke:#B71C1C,stroke-width:2px
    style SWOT fill:#FF9800,color:#FFFFFF,stroke:#F57C00,stroke-width:2px
    style THREAT fill:#C2185B,color:#FFFFFF,stroke:#880E4F,stroke-width:2px
    style ISMS1 fill:#EEEEEE,color:#212121,stroke:#BDBDBD
    style ISMS2 fill:#EEEEEE,color:#212121,stroke:#BDBDBD
    style ISMS3 fill:#EEEEEE,color:#212121,stroke:#BDBDBD
    style ISMS4 fill:#EEEEEE,color:#212121,stroke:#BDBDBD
```

---

## 📖 Methodology Catalog

### 🤖 AI-Driven Analysis Guide — `ai-driven-analysis-guide.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Master protocol governing all AI-driven political intelligence analysis |
| **Scope** | All agentic workflows, all analysis types, all output artifacts |
| **Key Rules** | Folder isolation · AI-only content · Multi-framework depth · Quality gates |
| **Version** | 2.0 |

**Core Principles:**
- **Folder Isolation**: Every workflow writes ONLY to its own `analysis/daily/YYYY-MM-DD/{articleType}/` subfolder
- **AI-Only Content**: Scripts must NEVER generate analysis prose, SWOT entries, risk scores, or template content
- **15-Minute Minimum**: Every deep analysis cycle must invest ≥15 minutes of AI reasoning time
- **Quality Gates**: Automated bash checks validate every analysis artifact before commit

---

### 🏷️ Political Classification Guide — `political-classification-guide.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Multi-dimensional taxonomy for political document and event classification |
| **Dimensions** | 7: Public Interest · Democratic Integrity · Policy Urgency · Economic Impact · Governance · Political Capital · Legislative Impact |
| **Confidence Levels** | HIGH (≥80%) · MEDIUM (60–79%) · LOW (<60%) |
| **Version** | 2.0 |

```mermaid
graph LR
    DOC["📄 Parliamentary<br/>Document"] --> C1["🔍 Public Interest<br/>Sensitivity"]
    DOC --> C2["🏛️ Democratic<br/>Integrity Impact"]
    DOC --> C3["⏰ Policy<br/>Urgency"]
    DOC --> C4["💰 Economic<br/>Impact"]
    DOC --> C5["⚙️ Governance<br/>Impact"]
    DOC --> C6["🎯 Political<br/>Capital Impact"]
    DOC --> C7["📜 Legislative<br/>Impact"]
    C1 --> OUT["🏷️ Overall<br/>Classification"]
    C2 --> OUT
    C3 --> OUT
    C4 --> OUT
    C5 --> OUT
    C6 --> OUT
    C7 --> OUT

    style DOC fill:#1565C0,color:#FFFFFF,stroke:#0D47A1,stroke-width:2px
    style OUT fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32,stroke-width:2px
    style C1 fill:#FF9800,color:#FFFFFF,stroke:#F57C00
    style C2 fill:#D32F2F,color:#FFFFFF,stroke:#B71C1C
    style C3 fill:#7B1FA2,color:#FFFFFF,stroke:#4A148C
    style C4 fill:#4CAF50,color:#000000,stroke:#2E7D32
    style C5 fill:#2196F3,color:#000000,stroke:#0097A7
    style C6 fill:#C2185B,color:#FFFFFF,stroke:#880E4F
    style C7 fill:#FFC107,color:#000000,stroke:#FFA000
```

---

### ⚠️ Political Risk Assessment Methodology — `political-risk-methodology.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Systematic risk identification, scoring, and cascading impact analysis |
| **Risk Categories** | 8: Policy · Legislative · Economic · Social · Security · Diplomatic · Coalition · Constitutional |
| **Scoring Model** | Likelihood (1–5) × Impact (1–5) = Risk Score (1–25) |
| **Advanced Features** | Cascading risk chains · Political Temperature Index · Risk velocity tracking |
| **Version** | 2.0 |

```mermaid
graph TD
    ID["🔍 Risk<br/>Identification"] --> ASSESS["📊 Risk<br/>Assessment"]
    ASSESS --> SCORE["🎯 Risk<br/>Scoring"]
    SCORE --> CASCADE["⛓️ Cascading<br/>Impact Analysis"]
    CASCADE --> TEMP["🌡️ Political<br/>Temperature Index"]
    TEMP --> PRIOR["🏆 Risk<br/>Prioritisation"]
    PRIOR --> MITIG["🛡️ Mitigation<br/>Strategies"]

    ID -->|"8 categories"| CAT["Policy · Legislative<br/>Economic · Social<br/>Security · Diplomatic<br/>Coalition · Constitutional"]

    style ID fill:#1565C0,color:#FFFFFF,stroke:#0D47A1,stroke-width:2px
    style ASSESS fill:#7B1FA2,color:#FFFFFF,stroke:#4A148C,stroke-width:2px
    style SCORE fill:#FF9800,color:#FFFFFF,stroke:#F57C00,stroke-width:2px
    style CASCADE fill:#D32F2F,color:#FFFFFF,stroke:#B71C1C,stroke-width:2px
    style TEMP fill:#C2185B,color:#FFFFFF,stroke:#880E4F,stroke-width:2px
    style PRIOR fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32,stroke-width:2px
    style MITIG fill:#4CAF50,color:#000000,stroke:#2E7D32,stroke-width:2px
    style CAT fill:#EEEEEE,color:#212121,stroke:#BDBDBD
```

---

### 💼 Political SWOT Analysis Framework — `political-swot-framework.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Multi-stakeholder strategic analysis for political events and policy decisions |
| **Stakeholder Lenses** | Government Coalition · Opposition Bloc · Citizens/Civil Society · Economic Actors · International Observers |
| **Advanced Features** | TOWS Matrix · Cross-SWOT Interference · Scenario Generation · Temporal Dynamics |
| **Version** | 2.0 |

```mermaid
%%{init: {
  "theme": "neutral",
  "themeVariables": {
    "quadrant1Fill": "#2E7D32",
    "quadrant2Fill": "#D32F2F",
    "quadrant3Fill": "#1565C0",
    "quadrant4Fill": "#FF9800",
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
    "titleFontSize": 20,
    "quadrantLabelFontSize": 16,
    "xAxisLabelFontSize": 14,
    "yAxisLabelFontSize": 14
  }
}}%%
quadrantChart
    title 🎯 POLITICAL SWOT STRATEGIC QUADRANT
    x-axis Internal Weaknesses --> Internal Strengths
    y-axis External Threats --> External Opportunities
    quadrant-1 SO Strategies (Leverage)
    quadrant-2 WO Strategies (Improve)
    quadrant-3 WT Strategies (Defend)
    quadrant-4 ST Strategies (Diversify)
```

---

### 🎭 Political Threat Analysis Framework — `political-threat-framework.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Multi-framework threat modeling for democratic process threats |
| **Frameworks** | 4: Attack Trees + Political Kill Chain + Diamond Model + Actor Profiling |
| **Threat Taxonomy** | 6 Categories: Narrative Integrity · Legislative Integrity · Accountability · Transparency · Democratic Process · Power Balance |
| **Threat Agents** | 6: Ruling Coalition · Opposition · External Actors · Special Interests · Media · Institutional |
| **Version** | 3.0 |

> ⚠️ **STRIDE is NOT used.** The Political Threat Taxonomy replaces STRIDE with politically-native categories designed for democratic function analysis.

```mermaid
graph TB
    subgraph "🎯 Multi-Framework Threat Analysis"
        AT["🌳 Attack Trees<br/><i>HOW threats succeed</i>"]
        KC["⚔️ Political Kill Chain<br/><i>WHERE in lifecycle</i>"]
        DM["💎 Diamond Model<br/><i>WHO is involved</i>"]
        AP["👤 Actor Profiling<br/><i>WHY they act</i>"]
    end

    subgraph "🏛️ Political Threat Taxonomy"
        NI["📰 Narrative<br/>Integrity"]
        LI["📜 Legislative<br/>Integrity"]
        AC["🔍 Accountability"]
        TR["🔓 Transparency"]
        DP["🗳️ Democratic<br/>Process"]
        PB["⚖️ Power<br/>Balance"]
    end

    AT --> NI & LI & AC & TR & DP & PB
    KC --> NI & LI & AC & TR & DP & PB
    DM --> NI & LI & AC & TR & DP & PB
    AP --> NI & LI & AC & TR & DP & PB

    style AT fill:#D32F2F,color:#FFFFFF,stroke:#B71C1C,stroke-width:2px
    style KC fill:#FF9800,color:#FFFFFF,stroke:#F57C00,stroke-width:2px
    style DM fill:#1565C0,color:#FFFFFF,stroke:#0D47A1,stroke-width:2px
    style AP fill:#7B1FA2,color:#FFFFFF,stroke:#4A148C,stroke-width:2px
    style NI fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32
    style LI fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32
    style AC fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32
    style TR fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32
    style DP fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32
    style PB fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32
```

---

### ✍️ Political Intelligence Style Guide — `political-style-guide.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Establishes writing standards for all political intelligence output |
| **Scope** | Article tone, evidence citation standards, Mermaid diagram requirements, confidence labeling |
| **Key Standards** | Evidence tables (not prose) · dok_id citations · Color-coded diagrams · Swedish political terminology |
| **Version** | 2.0 |

---

### 🕵️ OSINT / INTOP Tradecraft Standards — `osint-tradecraft-standards.md`

| Attribute | Value |
|-----------|-------|
| **Purpose** | Single canonical reference for professional intelligence tradecraft applied across every artifact in `analysis/daily/$ARTICLE_DATE/$SUBFOLDER/`. Anchors the source-grading, estimative-vocabulary, technique-attestation, DIW–Admiralty reconciliation, and PIR-handoff practices already referenced in prose by every other methodology. |
| **Scope** | Every analytical artifact (Family A–E) + every article generated from those artifacts. Mandatory reading during Pass 1. |
| **Seven Pillars** | §1 ICD 203 (9 ODNI analytic standards) · §2 Admiralty Code (6×6 matrix → 5-level confidence) · §3 WEP / Kent Scale (7 bands, EN + SV phrasing, 4 horizons) · §4 SAT Catalog (10 core + 5 supporting) · §5 OSINT Ethics & Scope (GDPR Art. 9, Offentlighetsprincipen) · §6 DIW Weighting Alignment (Admiralty floors per DIW tier) · §7 PIR Handoff (standing Riksdag PIR-1–7 + Tier-C continuity contract) |
| **Key Concepts** | Source grade `[A-F][1-6]` · 🟦/🟩/🟧/🟥/⬛ confidence · WEP bands (`almost no chance` → `almost certain`, each with Swedish equivalent) · SAT attestation in `methodology-reflection.md` (≥ 10 techniques) · Source Diversity Rule (≥ 3 primary + ≥ 1 secondary per P0/P1 claim) · Standing PIR catalogue (coalition stability, opposition cohesion, position drift, Election 2026 pathway, institutional risk, economic transmission, foreign-policy alignment) |
| **Enforced by** | `05-analysis-gate.md` checks 4 (evidence), 5 (Mermaid), 7 (Family C structure — ACH ≥ 3 hypotheses, ICD 203 audit), 8 (Family D structure — ≥ 10 dated forward indicators across 4 horizons). Tier-C additive gate (`ext/tier-c-aggregation.md`) enforces §7 PIR handoff. |
| **Cross-References** | Cited in prose by `political-style-guide.md`, `ai-driven-analysis-guide.md`, `synthesis-methodology.md`, `strategic-extensions-methodology.md`, `electoral-domain-methodology.md`. Cited by the template `methodology-reflection.md` and by `04-analysis-pipeline.md` supporting-frameworks list. |
| **Version** | 1.0 |

---

## 🗂️ Family Production Methodologies — one per Family A–E

These five methodology documents tell an agentic workflow **exactly how to produce each output file**, with step-by-step protocols, color-coded Mermaid, evidence rules, quality gates, and template bindings.

### 📘 Synthesis & Scoring Methodology — `synthesis-methodology.md` (Family A)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Step-by-step production of the 5 Family A core synthesis outputs |
| **Covers** | `significance-scoring.md`, `synthesis-summary.md`, `stakeholder-perspectives.md`, `stakeholder-impact.md`, `executive-brief.md` |
| **Key rules** | DIW 6-dimension formula · Tier mapping (P0/P1/P2/P3) · 400–600 word executive-brief budget · Quantified winners/losers · Equity-lens cuts |
| **Gates** | Per-output checklist; evidence-reconciliation gate between significance-scoring and per-doc Family E |

### 📗 Structural Metadata Methodology — `structural-metadata-methodology.md` (Family B)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Step-by-step production of provenance ledger + relational graph |
| **Covers** | `data-download-manifest.md`, `cross-reference-map.md` |
| **Key rules** | Freshness SLA per source (Riksdag ≤24h, SCB ≤90d, World Bank ≤24mo) · 7-edge relationship taxonomy · Coordinated-activity detection rule |
| **Gates** | Manifest reconciles with Family E doc count; every edge has dok_id pair |

### 📙 Strategic Extensions Methodology — `strategic-extensions-methodology.md` (Family C)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Step-by-step production of 5 always-produced depth products |
| **Covers** | `scenario-analysis.md`, `comparative-international.md`, `devils-advocate.md`, `intelligence-assessment.md`, ⭐ `methodology-reflection.md` (VITAL run-audit gate) |
| **Key rules** | Scenario probabilities sum to 100% · ACH ≥3 hypotheses · ≥5 peer countries · 3–7 Key Judgments with PIRs · Bias-audit quantification · methodology-reflection names ≥3 concrete improvements |
| **Cadence** | **Core — every run produces all 5**; depth per file adapts to DIW tier of the day's lead items |

### 📕 Electoral & Domain Methodology — `electoral-domain-methodology.md` (Family D)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Step-by-step production of 7 always-produced domain-specific analytical lenses |
| **Covers** | `election-2026-analysis.md`, `voter-segmentation.md`, `coalition-mathematics.md`, `historical-parallels.md`, `media-framing-analysis.md`, `implementation-feasibility.md`, `forward-indicators.md` |
| **Key rules** | Sainte-Laguë modified seat math + 4% threshold · Segment privacy (no sub-1000 cohorts) · Historical parallels ≤40 years with similarity score (or explicit no-precedent finding) · ≥10 forward indicators across 4 horizons |
| **Cadence** | **Core — every run produces all 7**; substance adapts (baseline context on light days, full scenario depth on P0-dense days) |

### 📒 Per-Document Methodology — `per-document-methodology.md` (Family E)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Step-by-step production of atomic per-document and cluster analyses |
| **Covers** | `{dok_id}-analysis.md`, `{theme}-cluster-analysis.md` (both use template `per-file-political-intelligence.md`) |
| **Key rules** | DIW 6-dimension scoring · Doctype-specific Mermaid taxonomy (prop→flowchart, mot→network, bet→flowchart, ip→timeline, SOU/Ds→flowchart, skr→flowchart) · Cluster 4-condition decision rule · Citation canon |
| **Gates** | Every dok_id in manifest has a Family E file; cluster files preserve per-dok_id differential notes |

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

    WF->>DL: Fetch Riksdag/Regeringen data
    DL->>CLASS: Raw documents + metadata
    
    Note over CLASS,THREAT: AI performs ALL analysis<br/>(never scripted)
    
    CLASS->>RISK: Classification results
    CLASS->>SWOT: Document classification
    CLASS->>THREAT: Document classification
    
    par Parallel Analysis
        RISK->>SIG: Risk scores + cascading analysis
        SWOT->>SIG: SWOT matrices + TOWS
        THREAT->>SIG: Threat profiles + kill chains
    end
    
    SIG->>SYNTH: Significance scores
    SYNTH->>QG: Synthesis summary
    
    QG-->>QG: Validate structure,<br/>evidence, Mermaid,<br/>confidence, citations
    QG->>ART: Approved analysis
    ART->>WF: HTML article + translations

    Note over QG: Quality gate checks:<br/>✓ Evidence tables<br/>✓ Mermaid diagrams<br/>✓ dok_id citations<br/>✓ Confidence labels<br/>✓ No stub content
```

---

## 🎯 Article-Type-Specific Methodology Selection

Different parliamentary document types require **different analytical emphasis**. This matrix maps which methodologies are PRIMARY vs SUPPORTING for each workflow type:

```mermaid
graph LR
    subgraph "🔴 Always Required"
        CLASS["🏷️ Classification"]
        RISK["⚠️ Risk Assessment"]
    end

    subgraph "🟠 Context-Dependent Primary"
        SWOT["💼 SWOT"]
        THREAT["🎭 Threat Analysis"]
        SIG["📈 Significance"]
        STAKE["👥 Stakeholder"]
    end

    CR["📋 Committee<br/>Reports"] -->|"PRIMARY"| SWOT
    CR -->|"PRIMARY"| THREAT
    PR["📜 Propositions"] -->|"PRIMARY"| RISK
    PR -->|"PRIMARY"| STAKE
    MO["✊ Motions"] -->|"PRIMARY"| SWOT
    MO -->|"PRIMARY"| SIG
    IP["❓ Interpellations"] -->|"PRIMARY"| THREAT
    IP -->|"PRIMARY"| STAKE

    style CR fill:#2E7D32,color:#FFFFFF,stroke:#2E7D32,stroke-width:2px
    style PR fill:#1565C0,color:#FFFFFF,stroke:#0D47A1,stroke-width:2px
    style MO fill:#FF9800,color:#FFFFFF,stroke:#F57C00,stroke-width:2px
    style IP fill:#D32F2F,color:#FFFFFF,stroke:#B71C1C,stroke-width:2px
    style CLASS fill:#9E9E9E,color:#FFFFFF,stroke:#616161,stroke-width:2px
    style RISK fill:#9E9E9E,color:#FFFFFF,stroke:#616161,stroke-width:2px
    style SWOT fill:#FFC107,color:#000000,stroke:#FFA000,stroke-width:2px
    style THREAT fill:#C2185B,color:#FFFFFF,stroke:#880E4F,stroke-width:2px
    style SIG fill:#7B1FA2,color:#FFFFFF,stroke:#4A148C,stroke-width:2px
    style STAKE fill:#2196F3,color:#000000,stroke:#0097A7,stroke-width:2px
```

| Article Type | Classification | Risk | SWOT | Threat | Significance | Stakeholder | Unique Focus |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Committee Reports** | ✅ | ✅ | 🔴 PRIMARY | 🔴 PRIMARY | ✅ | ✅ | Voting splits, reservation analysis, committee composition effects |
| **Propositions** | ✅ | 🔴 PRIMARY | ✅ | ✅ | ✅ | 🔴 PRIMARY | Legislative pipeline stage, budget impact, policy domain cascading effects |
| **Motions** | ✅ | ✅ | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | ✅ | Opposition strategy patterns, signalverdi, cross-party co-sponsorship |
| **Interpellations** | ✅ | ✅ | ✅ | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | Minister accountability scoring, response quality, evasion detection |
| **Evening Analysis** | ✅ | ✅ | 🔴 PRIMARY | ✅ | ✅ | ✅ | Daily political pulse, vote results, debate intensity metrics |
| **Realtime Monitor** | ✅ | 🔴 PRIMARY | ✅ | ✅ | 🔴 PRIMARY | ✅ | Breaking event urgency, political temperature spike detection |
| **Weekly Review** | ✅ | ✅ | 🔴 PRIMARY | ✅ | ✅ | ✅ | Cross-type trend detection, week-over-week pattern shifts |
| **Week Ahead** | ✅ | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | ✅ | ✅ | Prospective risk landscape, scheduled debates, expected vote outcomes |
| **Monthly Review** | ✅ | ✅ | 🔴 PRIMARY | ✅ | ✅ | 🔴 PRIMARY | Legislative throughput, party productivity, government scorecard |
| **Month Ahead** | ✅ | 🔴 PRIMARY | ✅ | 🔴 PRIMARY | ✅ | ✅ | Strategic political calendar, major policy decision forecast |

> **Reading the matrix:** ✅ = always required for all types. 🔴 PRIMARY = the methodology that should receive the most analytical depth and word count for this article type. Each workflow must apply ALL methodologies but allocate **more time and depth** to PRIMARY ones.

---

## 📏 Quality Standards

Every analysis artifact produced using these methodologies MUST contain:

| Requirement | Description | Enforcement |
|-------------|-------------|-------------|
| **Evidence Tables** | Structured tables with dok_id citations, not free-form prose | Quality gate Check 1 |
| **Mermaid Diagrams** | ≥1 color-coded diagram with `style` directives per analysis file | Quality gate Check 2 |
| **Confidence Labels** | HIGH/MEDIUM/LOW confidence on every assessment | Quality gate Check 3 |
| **dok_id Citations** | Every claim linked to specific parliamentary document IDs | Quality gate Check 4 |
| **Template Compliance** | Must follow the corresponding template in `analysis/templates/` | Quality gate Check 5 |
| **No Stub Content** | No boilerplate phrases like "_No strengths identified_" | Quality gate Check 6 |

---

## ✅ Quality Gate Requirements

All analysis produced under these methodologies must meet the following minimum quality requirements before publication:

### Weighted Quality Score (Minimum 7.0/10)

| Dimension | Weight | Criteria | Fail Indicators |
|-----------|--------|----------|-----------------|
| **Evidence** | 25% | Every claim cites Riksdag MCP data; confidence levels stated; no opinion-only entries | Uncited claims, missing confidence, assertions without data |
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
- [ ] Threat analysis using Political Threat Taxonomy (not STRIDE/DREAD/PASTA)
- [ ] Appropriate depth level selected and word/citation counts met
- [ ] Significance score (1–10) with justification

---

## 🌳 Methodology Selection Decision Tree

Use this flowchart to determine which methodology to apply for a given analytical task:

```mermaid
flowchart TD
    Start([🎯 New Analysis Task]) --> Q1{What is the<br/>primary need?}

    Q1 -->|Categorize a Riksdag event| CG[🏷️ Classification Guide<br/>Apply 7 dimensions]
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
    style Q1 fill:#F57C00,stroke:#E65100,color:#000000
    style CG fill:#00695C,stroke:#004D40,color:#FFFFFF
    style RM fill:#E65100,stroke:#E65100,color:#FFFFFF
    style TF fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SW fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style SG fill:#4A148C,stroke:#311B92,color:#FFFFFF
    style AI fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style Q2 fill:#F57C00,stroke:#E65100,color:#000000
    style Q3 fill:#F57C00,stroke:#E65100,color:#000000
    style Gate fill:#F57C00,stroke:#E65100,color:#000000
    style Done fill:#2E7D32,stroke:#1B5E20,color:#FFFFFF
    style Revise fill:#E65100,stroke:#E65100,color:#FFFFFF
```

---

## ✅ Required Practices — What Every Analysis Delivers

Every methodology produces output that satisfies these ten positive standards. Each row states the practice, why it raises quality, and where the protocol enforces it.

| Practice | Why it raises quality | Where enforced |
|---------|----------------------|----------------|
| **Use the Political Threat Taxonomy** (6 dimensions: authoritarian tendencies, corruption, institutional capture, information manipulation, violence/intimidation, external interference) | Political intelligence needs a political model, not a software one | [`political-threat-framework.md`](political-threat-framework.md) |
| **Every paragraph cites evidence** — one Riksdag data citation, vote count, named actor, or primary URL per paragraph | Evidence density is the single strongest predictor of downstream credibility | [`ai-driven-analysis-guide.md` Step 4 & Quality Gate](ai-driven-analysis-guide.md#step-6--quality-gate-self-audit-blocking) |
| **Assign a 5-level confidence label** (VERY LOW / LOW / MEDIUM / HIGH / VERY HIGH) to every analytical claim | Confidence makes claims evaluable and reversible | [`ai-driven-analysis-guide.md` § 5-Level Confidence Scale](ai-driven-analysis-guide.md#-5-level-confidence-scale) |
| **Pair tables with narrative interpretation** — a short prose paragraph above or below every data table | Narrative converts data into intelligence | All templates |
| **Source every opinion from MCP data** — link to `search_voteringar`, `get_betankanden`, SCB, World Bank, or IMF queries | Opinions sourced to authoritative data defend against accusations of bias | Templates + `political-style-guide.md` |
| **Populate Mermaid values from MCP tool output** — vote counts, poll figures, SEK sums, years | Data-driven diagrams stay current automatically | `ai-driven-analysis-guide.md` § Color-Coded Mermaid |
| **Apply all 7 classification dimensions** for every P0/P1 document — each dimension scored independently | Multi-dimensional classification catches complex documents | [`political-classification-guide.md`](political-classification-guide.md) |
| **Re-verify SWOT entries within 180 days** — each entry carries its last-verified date | 180-day freshness prevents stale narratives | `political-swot-framework.md` decay rule |
| **Include stakeholder impact** — affected parties, opposition blocs, committees, citizen groups | Actionable intelligence names who is affected and how | Family A `stakeholder-perspectives.md` |
| **Structure content for 14-language translation** — complete sentences, defined terms, no idioms | The platform serves 14 audiences; clear source text translates cleanly | `political-style-guide.md` + `language-expertise` skill |

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
| **Identify (ID)** | Classification guide identifies and categorizes Riksdag events by sensitivity and impact |
| **Protect (PR)** | Style guide protects analytical quality through evidence requirements and anti-patterns |
| **Detect (DE)** | Threat framework detects political threats across 6 dimensions using multiple analytical models |
| **Respond (RS)** | Risk methodology provides quantified risk scores enabling proportionate response |
| **Recover (RC)** | SWOT framework supports strategic recovery planning through forward-looking opportunity analysis |

### CIS Controls v8.1

| Control | Title | Methodology Relevance |
|---------|-------|----------------------|
| **Control 1** | Inventory and Control of Enterprise Assets | Classification guide inventories and categorizes all Riksdag data assets |
| **Control 3** | Data Protection | Sensitivity levels enforce appropriate handling for each data classification |
| **Control 8** | Audit Log Management | AI analysis guide requires documented quality gate assessments (audit trail) |
| **Control 14** | Security Awareness and Skills Training | Methodology documents serve as training material for AI agents and analysts |
| **Control 16** | Application Software Security | Quality gates enforce structured, validated analytical output |

---

## 📰 Workflow-Specific Analytical Approach

Each agentic workflow applies the 6 methodologies with **unique emphasis** tailored to its article type:

```mermaid
flowchart TD
    subgraph "🏷️ Classification"
        CG2["Political Classification Guide"]
    end
    subgraph "⚠️ Risk"
        RM2["Risk Methodology"]
    end
    subgraph "🎯 Threat"
        TF2["Political Threat Framework"]
    end
    subgraph "💼 SWOT"
        SW2["SWOT Framework"]
    end

    subgraph "📰 Workflow Article Types"
        CR2["📋 Committee Reports\n= CG + SWOT primary"]
        PR2["📜 Propositions\n= RISK + STAKE primary"]
        MO2["✊ Motions\n= SWOT + SIG primary"]
        IP2["❓ Interpellations\n= THREAT + STAKE primary"]
        EV2["🌙 Evening Analysis\n= SWOT + ALL primary"]
        WR2["📊 Weekly Review\n= CG + SWOT primary"]
        MR2["📈 Monthly Review\n= ALL primary"]
    end

    CG2 --> CR2 & MO2 & WR2
    RM2 --> PR2 & EV2 & MR2
    TF2 --> IP2 & MR2
    SW2 --> CR2 & MO2 & EV2 & WR2 & MR2

    style CG2 fill:#00695C,stroke:#004D40,color:#FFFFFF
    style RM2 fill:#E65100,stroke:#E65100,color:#FFFFFF
    style TF2 fill:#B71C1C,stroke:#880E4F,color:#FFFFFF
    style SW2 fill:#1B5E20,stroke:#1B5E20,color:#FFFFFF
    style CR2 fill:#2E7D32,stroke:#2E7D32,color:#FFFFFF
    style PR2 fill:#1565C0,stroke:#0D47A1,color:#FFFFFF
    style MO2 fill:#FF9800,stroke:#F57C00,color:#FFFFFF
    style IP2 fill:#D32F2F,stroke:#B71C1C,color:#FFFFFF
    style EV2 fill:#7B1FA2,stroke:#4A148C,color:#FFFFFF
    style WR2 fill:#4CAF50,stroke:#2E7D32,color:#FFFFFF
    style MR2 fill:#2196F3,stroke:#0097A7,color:#000000
```

### Unique Analytics Per Article Type

| Workflow | Primary Methodology Focus | Unique Analytical Requirements |
|----------|--------------------------|-------------------------------|
| **Committee Reports** | Classification (document type) + SWOT (coalition dynamics) | 🏛️ Per-committee voting splits, reservation analysis, committee-to-policy-domain mapping |
| **Propositions** | Risk (legislative pipeline risk) + Stakeholder (affected populations) | 📜 Procedure stage tracking; budget impact analysis; policy domain cascading effects |
| **Motions** | SWOT (opposition strategy) + Significance (signalverdi) | ✊ Opposition strategy patterns, cross-party co-sponsorship, signal value assessment |
| **Interpellations** | Threat (accountability gaps) + Stakeholder (minister responses) | ❓ Minister accountability scoring, response quality analysis, evasion detection |
| **Evening Analysis** | ALL methodologies at equal weight | 🌙 Daily parliamentary pulse, vote results + debate intensity, party discipline metrics |
| **Weekly Review** | Classification (outcome categorization) + SWOT (trend assessment) | 📊 Cross-type trend detection, week-over-week pattern shifts, political narrative arc |
| **Monthly Review** | ALL methodologies at equal weight | 📈 Comprehensive legislative throughput, party productivity, government scorecard |

> **Key principle:** Every article type must produce analysis that is **unique and specific** to its focus area. A committee report analysis looks fundamentally different from a monthly review — different data sources, different methodology emphasis, different analytical depth.

---

## 📚 Related Documentation

| Document | Focus | Link |
|----------|-------|------|
| **Analysis README** | Directory overview and critical rules | [analysis/README.md](../README.md) |
| **Templates README** | Template catalog and usage guide | [analysis/templates/README.md](../templates/README.md) |
| **Prompts v2** | AI prompt library for analysis generation | [scripts/prompts/v2/](../../scripts/prompts/v2/) |
| **WORKFLOWS.md** | CI/CD and agentic workflow documentation | [WORKFLOWS.md](../../WORKFLOWS.md) |
| **ISMS-PUBLIC** | Hack23 Information Security Management System | [Hack23/ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) |

---

## 🆕 v4.1 Methodology Upgrades (2026-06-01)

All methodology guides were updated in v4.1 with the following cross-cutting improvements:

### 🗳️ Election 2026 Coverage
- `ai-driven-analysis-guide.md` v5.0: Mandatory Election 2026 lens with 5-dimension electoral assessment for ALL analyses
- `political-classification-guide.md` v2.3: Election 2026 urgency boost rules for pre-election period
- `political-swot-framework.md` v2.3: Election 2026 as mandatory SWOT dimension with electoral quadrant requirements
- `political-style-guide.md` v2.2: Election 2026 framing requirements with approved vocabulary and confidence standards

### 🎯 5-Level Confidence Scale
All methodology guides now use a unified **5-level confidence scale**:
- ⬛ VERY LOW → 🟥 LOW → 🟧 MEDIUM → 🟩 HIGH → 🟦 VERY HIGH
- `political-swot-framework.md`: Updated decay table from 3-level to 5-level
- `political-risk-methodology.md`: Added confidence scale mapping + election proximity factor

### 📊 Mermaid Diagram Mandates
- `ai-driven-analysis-guide.md` v5.0: Specifies required diagram type per analysis context (flowchart/timeline/quadrantChart/mindmap for each scenario)

### 📋 Historical Comparison
- `ai-driven-analysis-guide.md` v5.0: Mandatory historical comparison with 3 time periods + precedents table for all synthesis analyses

---

<p align="center">
  <em>📊 Hack23 AB — Political Intelligence Through Rigorous Methodology</em>
</p>
