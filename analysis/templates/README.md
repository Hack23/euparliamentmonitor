<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📋 EU Parliament Monitor — Analysis Templates</h1>

<p align="center">
  <strong>📊 39 Structured Intelligence Templates for AI-Driven Political Analysis</strong><br>
  <em>🎯 14 Agentic-Workflow Templates (incl. 6 reusable framework templates) + 25 Per-Artifact Templates — covering every unique <code>.md</code> file produced under <code>analysis/daily/</code></em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-3.1-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--06-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 3.1 | **📅 Last Updated:** 2026-04-06 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 📚 Architecture Documentation Map

<div class="documentation-map">

| Document | Focus | Description | Documentation Link |
| --- | --- | --- | --- |
| **[Architecture](../../ARCHITECTURE.md)** | 🏛️ Architecture | C4 model showing current system structure | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/ARCHITECTURE.md) |
| **[Security Architecture](../../SECURITY_ARCHITECTURE.md)** | 🛡️ Security | Security controls and compliance mapping | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY_ARCHITECTURE.md) |
| **[Workflows](../../WORKFLOWS.md)** | ⚙️ DevOps | CI/CD pipeline documentation | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/WORKFLOWS.md) |
| **[Analysis Directory](../README.md)** | 🔬 Analysis | Analysis directory overview and structure | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/README.md) |
| **[AI Analysis Guide](../methodologies/ai-driven-analysis-guide.md)** | 🤖 Methodology | 10-step analysis protocol — the authoritative guide every workflow follows | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/ai-driven-analysis-guide.md) |
| **[Artifact Catalog](../methodologies/artifact-catalog.md)** | 🗂️ Methodology | Master map of every analysis artifact → methodology + template + depth floor + Mermaid type | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/artifact-catalog.md) |
| **[Per-Artifact Methodologies](../methodologies/per-artifact-methodologies.md)** | 🧩 Methodology | One section per artifact type with construction rules, required sections, and quality signals | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/per-artifact-methodologies.md) |
| **[Threat Framework](../methodologies/political-threat-framework.md)** | 🎭 Methodology | Political Threat Landscape (6 dimensions) | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-threat-framework.md) |
| **[Risk Methodology](../methodologies/political-risk-methodology.md)** | ⚠️ Methodology | Likelihood × Impact scoring for EP events | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-risk-methodology.md) |
| **[SWOT Framework](../methodologies/political-swot-framework.md)** | 💼 Methodology | Evidence-based political SWOT quadrants | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-swot-framework.md) |
| **[Classification Guide](../methodologies/political-classification-guide.md)** | 🏷️ Methodology | 7-dimension EP event classification | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-classification-guide.md) |
| **[Style Guide](../methodologies/political-style-guide.md)** | ✍️ Methodology | Editorial and analytical style standards | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/political-style-guide.md) |
| **[OSINT Tradecraft Standards](../methodologies/osint-tradecraft-standards.md)** | 🕵️ Methodology | ICD 203 · Admiralty source grades · Kent/WEP probability bands · SAT catalog · OSINT ethics | [View Source](https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/osint-tradecraft-standards.md) |

</div>

---

## 🕵️ OSINT Tradecraft Quick Reference

All templates in this library implement professional intelligence-community discipline. The normative contract is [`osint-tradecraft-standards.md`](../methodologies/osint-tradecraft-standards.md). The style contract is [`political-style-guide.md` §Estimative Language & Source Grading](../methodologies/political-style-guide.md).

| Discipline | Standard | Where Applied in Templates |
|-----------|----------|---------------------------|
| **Estimative Language (WEP)** | Kent / ICD 203 probability bands (*Almost Certain* → *Almost No Chance*) + explicit time horizon | `synthesis-summary.md` Top Findings, `deep-analysis.md` Executive Summary, `methodology-reflection.md` §12 |
| **Source Grading (Admiralty)** | A–F reliability × 1–6 credibility (e.g. `A1` = EP plenary record, `C3` = press) | `synthesis-summary.md` Top Findings, all probabilistic artifacts |
| **Confidence Separation** | Confidence-in-evidence (HIGH / MEDIUM / LOW) tracked separately from WEP probability | All 🟢/🟡/🔴 confidence markers across templates |
| **Structured Analytic Techniques** | ≥10 SATs applied per run (e.g. ACH, Key Assumptions Check, Pre-Mortem, Scenario Analysis, Red-Team, Indicators) | `methodology-reflection.md` §12, `per-artifact-methodologies.md` SAT entries |
| **ICD 203 BLUF** | Executive Summary opens with BLUF + WEP band + confidence + rationale | `deep-analysis.md` Executive Summary |

---

## 🔐 ISMS Policy Alignment

These analysis templates implement structured intelligence production mandated by Hack23 AB's ISMS framework:

| **ISMS Policy** | **Template Implementation** |
| --- | --- |
| [🛠️ Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) | Structured templates enforce consistent analytical output; anti-pattern warnings prevent quality degradation |
| [📝 Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) | Template versioning, quarterly review cycle, document metadata tracking |
| [🔐 Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) | Classification levels (PUBLIC/SENSITIVE/RESTRICTED) in every analysis output |
| [🔓 Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) | SPDX license headers, REUSE compliance, transparent methodology documentation |
| [🤝 Third Party Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Third_Party_Management.md) | All data sourced from official European Parliament MCP Server; evidence citations required |
| [🔍 Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) | Threat analysis template identifies political risks; risk assessment quantifies exposure |

### Compliance Framework Mapping

| **Framework** | **Version** | **Relevant Controls** | **Template Implementation** |
| --- | --- | --- | --- |
| **ISO 27001** | 2022 | A.5.10, A.8.3 | Information classification via political-classification template |
| **NIST CSF** | 2.0 | ID.RA, ID.RM | Risk identification and management via risk-assessment template |
| **CIS Controls** | v8.1 | 17.1 | Threat intelligence production via threat-analysis template |
| **EU CRA** | 2024 | Art. 10, Art. 11 | Transparency and vulnerability disclosure via stakeholder-impact template |

---

## 🎯 Purpose

This directory contains **39 analysis templates** that AI agents fill when analysing European Parliament data — **6 reusable framework templates** + **8 workflow-specific templates** + **25 per-artifact templates** covering every unique `.md` file produced under `analysis/daily/`. Each template enforces a specific analytical framework, requires evidence citations from EP MCP data, and produces structured intelligence that feeds into downstream article generation.

Templates are **not** standalone outputs. They form a **composable intelligence pipeline** — individual templates feed into the daily synthesis, which aggregates into weekly and monthly intelligence reports. The per-file analysis template is the most frequently used: every downloaded EP MCP data file receives a comprehensive analysis using this template.

**Critical mandates:**

- 🔍 AI agents must **READ actual EP data** and produce original analysis — never scripted boilerplate
- 📎 Every claim requires an **evidence citation** (EP procedure ID, adopted text reference, or MCP data file path)
- 📊 All outputs require **structured tables + colour-coded Mermaid diagrams** — plain prose alone is rejected
- 🎯 Every analysis must pass a **minimum 7.0/10 quality gate** before consumption by article generators

> **Critical Rule:** AI agents MUST follow these templates. Templates define structure and required sections — the AI fills them with genuine, evidence-based analysis. Templates must NEVER be copied verbatim with placeholder text.

> 🛂 **Stage-C Enforcement (since v3.2):** Template usage is now machine-validated. Run `npm run validate-analysis -- analysis/daily/<date>/<runDir>` before opening the article PR — the script checks per-artifact line floors, mandatory Mermaid diagrams, Admiralty/WEP/SAT/BLUF tradecraft signals, required H2 sections, and placeholder leakage. RED ⇒ Pass-3 the offending artifacts; never ship an article without a green gate. See [`scripts/validate-analysis-completeness.js`](../../scripts/validate-analysis-completeness.js) and [`.github/prompts/03-analysis-completeness-gate.md`](../../.github/prompts/03-analysis-completeness-gate.md).

> 🌍 **EU multi‑national extension over Riksdagsmonitor.** Where Riksdagsmonitor templates ([`Article-Generation.md`](https://github.com/Hack23/riksdagsmonitor/blob/main/Article-Generation.md), [`templates/README.md`](https://github.com/Hack23/riksdagsmonitor/blob/main/analysis/templates/README.md)) are sized for one parliament, EUPM templates carry mandatory EU‑27 member‑state cluster tags ({Northern, Western, Southern, Central‑Eastern}), explicit citizen‑segment translation blocks, and dual‑Mermaid pipelines (one institutional, one cross‑cluster). v2.0 templates (`impact-matrix`, `forces-analysis`, `actor-mapping`) demonstrate the pattern.

> 🎨 **Mermaid is rendered same‑origin.** All diagrams ship via the vendored bundle `js/vendor/mermaid/mermaid.esm.min.mjs` (copied by `npm run copy-vendor`, deployed to S3/CloudFront as `text/javascript`). No external CDN — `script-src 'self'` is the contract. If your template uses a quadrant chart, use the **dedicated quadrant init block** ([`political-style-guide.md §Standard Mermaid init blocks`](../methodologies/political-style-guide.md)); for every other diagram type use the **universal init block**.

---

## 📐 Template Architecture

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TB
    subgraph "📥 Input Layer"
        RAW["📄 Raw EP Parliamentary<br/>Documents"]
        META["📊 Document<br/>Metadata"]
    end

    subgraph "🔬 Per-Document Analysis"
        T1["🔍 Per-File Political<br/>Intelligence Template"]
    end

    subgraph "🧪 Analytical Dimension Templates"
        T2["🏷️ Political<br/>Classification"]
        T3["⚠️ Risk<br/>Assessment"]
        T4["💼 SWOT<br/>Analysis"]
        T5["🎭 Threat<br/>Analysis"]
        T6["📈 Significance<br/>Scoring"]
        T7["👥 Stakeholder<br/>Impact"]
    end

    subgraph "📰 Synthesis Layer"
        T8["🧩 Synthesis<br/>Summary"]
    end

    RAW --> T1
    META --> T1
    T1 --> T2 & T3 & T4 & T5 & T6 & T7
    T2 & T3 & T4 & T5 & T6 & T7 --> T8

    style RAW fill:#6c757d,color:#fff,stroke:#495057,stroke-width:2px
    style META fill:#6c757d,color:#fff,stroke:#495057,stroke-width:2px
    style T1 fill:#0d6efd,color:#fff,stroke:#0a58ca,stroke-width:3px
    style T2 fill:#198754,color:#fff,stroke:#146c43,stroke-width:2px
    style T3 fill:#dc3545,color:#fff,stroke:#b02a37,stroke-width:2px
    style T4 fill:#fd7e14,color:#fff,stroke:#ca6510,stroke-width:2px
    style T5 fill:#d63384,color:#fff,stroke:#ab296a,stroke-width:2px
    style T6 fill:#6f42c1,color:#fff,stroke:#59359a,stroke-width:2px
    style T7 fill:#0dcaf0,color:#000,stroke:#0aa2c0,stroke-width:2px
    style T8 fill:#ffc107,color:#000,stroke:#cc9a06,stroke-width:3px
```

---

## 🔄 Template Usage Workflow

The following diagram shows the end-to-end pipeline from EP MCP data download through template-driven analysis to final publication:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    A["📥 EP MCP Server<br/>Data Download"] --> B["📂 Store in<br/>analysis/YYYY-MM-DD/data/"]
    B --> C{"📖 AI Agent Reads<br/>6 Methodology Docs"}
    C --> D["🔍 Per-File Analysis<br/>(per-file-political-intelligence.md)"]
    D --> E["🏷️ Classification<br/>(political-classification.md)"]
    D --> F["⚠️ Risk Assessment<br/>(risk-assessment.md)"]
    D --> G["🎭 Threat Analysis<br/>(threat-analysis.md)"]
    D --> H["💼 SWOT Analysis<br/>(swot-analysis.md)"]
    D --> I["👥 Stakeholder Impact<br/>(stakeholder-impact.md)"]
    D --> J["📈 Significance Scoring<br/>(significance-scoring.md)"]
    E & F & G & H & I & J --> K["🧩 Daily Synthesis<br/>(synthesis-summary.md)"]
    K --> L{"✅ Quality Gate<br/>≥ 7.0/10?"}
    L -->|Pass| META["📝 AI Generates<br/>Title & Description"]
    META --> M["📰 Article Generation<br/>(--title, --description flags)"]
    L -->|Fail| N["🔄 Revise Analysis"]
    N --> D
    M --> O["🌐 Publish to<br/>GitHub Pages"]

    style A fill:#0d6efd,color:#fff,stroke:#0a58ca
    style C fill:#6f42c1,color:#fff,stroke:#59359a
    style D fill:#28a745,color:#fff,stroke:#1e7e34
    style K fill:#fd7e14,color:#fff,stroke:#c96009
    style L fill:#ffc107,color:#000,stroke:#d39e00
    style M fill:#003399,color:#fff,stroke:#002266
    style O fill:#20c997,color:#fff,stroke:#199d76
    style N fill:#dc3545,color:#fff,stroke:#bd2130
```

### Template Usage Flow — Detailed Sequence

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
sequenceDiagram
    participant WF as 🔄 Workflow
    participant PRE as 📥 Pre-Analysis Script
    participant AI as 🤖 AI Agent
    participant QG as ✅ Quality Gate

    WF->>PRE: Trigger analysis
    PRE->>PRE: Download data + non-analytical validation/housekeeping
    PRE->>AI: Prepared documents + stub files (no analytical content)

    Note over AI: AI reads methodology +<br/>template + prompt

    AI->>AI: Apply per-file-political-intelligence.md
    AI->>AI: Apply political-classification.md
    AI->>AI: Apply risk-assessment.md
    AI->>AI: Apply swot-analysis.md
    AI->>AI: Apply threat-analysis.md
    AI->>AI: Apply significance-scoring.md
    AI->>AI: Apply stakeholder-impact.md
    AI->>AI: Apply synthesis-summary.md

    AI->>QG: Completed analysis files

    QG->>QG: Check 1: Evidence tables present?
    QG->>QG: Check 2: Mermaid diagrams present?
    QG->>QG: Check 3: Confidence labels present?
    QG->>QG: Check 4: EP procedure citations present?
    QG->>QG: Check 5: Template structure compliant?
    QG->>QG: Check 6: No stub content remaining?

    alt All checks pass
        QG->>WF: ✅ Analysis approved
    else Any check fails
        QG->>AI: ❌ Revision required
    end
```

---

## 🗺️ Template Interconnection Map

The framework and workflow-specific templates form an integrated intelligence network. The per-file analysis template consumes outputs from the specialist templates, and the synthesis template aggregates all per-file analyses:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph LR
    subgraph "📋 Specialist Templates"
        CLS["🏷️ Political<br/>Classification"]
        RSK["⚠️ Risk<br/>Assessment"]
        THR["🎭 Threat<br/>Analysis"]
        SWT["💼 SWOT<br/>Analysis"]
        STK["👥 Stakeholder<br/>Impact"]
        SIG["📈 Significance<br/>Scoring"]
    end

    subgraph "📦 Integrating Templates"
        PFI["🔍 Per-File<br/>Intelligence"]
        SYN["🧩 Daily<br/>Synthesis"]
    end

    CLS -->|"sensitivity + domain"| PFI
    RSK -->|"L×I scores"| PFI
    THR -->|"6-dimension threats"| PFI
    SWT -->|"quadrant findings"| PFI
    STK -->|"impact assessments"| PFI
    SIG -->|"composite score"| PFI

    PFI -->|"per-document analysis"| SYN
    SYN -->|"editorial direction"| ART["📰 Article<br/>Generator"]

    style CLS fill:#6f42c1,color:#fff,stroke:#59359a
    style RSK fill:#dc3545,color:#fff,stroke:#bd2130
    style THR fill:#343a40,color:#fff,stroke:#23272b
    style SWT fill:#0d6efd,color:#fff,stroke:#0a58ca
    style STK fill:#20c997,color:#fff,stroke:#199d76
    style SIG fill:#ffc107,color:#000,stroke:#d39e00
    style PFI fill:#28a745,color:#fff,stroke:#1e7e34
    style SYN fill:#fd7e14,color:#fff,stroke:#c96009
    style ART fill:#003399,color:#fff,stroke:#002266
```

---

## 📑 Master Template Catalog

| # | Template | Purpose | Key Sections | MCP Data Sources | Output Format | Priority |
|:-:|----------|---------|-------------|------------------|---------------|:--------:|
| 1 | [🏷️ Political Classification](political-classification.md) | 7-dimension EP event classification (sensitivity, domain, urgency, scope, actor, impact, temporal) | Sensitivity Level, Policy Domain, Urgency Level, Geographic Scope, Actor Mapping, Impact Vector, Temporal Window | `get_plenary_sessions`, `get_procedures`, `get_adopted_texts`, `get_events` | Metadata table + checkbox dimensions + colour-coded Mermaid radar | 🔴 HIGH |
| 2 | [⚠️ Risk Assessment](risk-assessment.md) | Quantified political risk using 5×5 Likelihood × Impact matrix across 6 risk categories | Risk Context, Risk Register (6 categories), Heat Map, Mitigation Strategies, Monitoring Indicators | `get_voting_records`, `track_legislation`, `analyze_coalition_dynamics`, `detect_voting_anomalies` | Risk register table + L×I heat map Mermaid + trend arrows | 🔴 HIGH |
| 3 | [🎭 Threat Analysis](threat-analysis.md) | Multi-framework political threat assessment: Political Threat Landscape (6D) + Diamond Model + Attack Trees + PESTLE + Scenario Planning + Kill Chain | 6 Threat Dimensions, Diamond Model Profiles, Attack Tree Decomposition, PESTLE Matrix, Scenario Projections, Kill Chain Stages | `analyze_coalition_dynamics`, `detect_voting_anomalies`, `compare_political_groups`, `get_mep_declarations` | Dimension tables + severity ratings + trend indicators + Mermaid threat landscape | 🔴 HIGH |
| 4 | [💼 SWOT Analysis](swot-analysis.md) | Evidence-based political SWOT quadrant assessment for EU democratic landscape | SWOT Context, Strengths, Weaknesses, Opportunities, Threats, Strategic Implications, Cross-Quadrant Analysis | `get_adopted_texts`, `get_voting_records`, `get_procedures`, `compare_political_groups` | 4-quadrant tables with evidence columns + Mermaid quadrant chart | 🟡 MEDIUM |
| 5 | [👥 Stakeholder Impact](stakeholder-impact.md) | 7-lens stakeholder impact assessment across EU institutional actors and civil society | Assessment Context, 7 Stakeholder Groups (Council, Commission, EP Groups, National Parliaments, Civil Society, Industry, Citizens), Cross-Impact Matrix | `get_meps`, `get_committee_info`, `analyze_country_delegation`, `assess_mep_influence` | Stakeholder tables with impact direction + confidence labels + Mermaid impact diagram | 🟡 MEDIUM |
| 6 | [📈 Significance Scoring](significance-scoring.md) | 5-dimension composite score (0–10) for publication prioritisation decisions | Event Context, 5 Scoring Dimensions (Parliamentary Significance, Policy Impact, Institutional Relevance, Public Interest, Temporal Urgency), Composite Score, Publish Decision | `get_adopted_texts`, `get_plenary_sessions`, `get_procedures`, `get_events` | Scoring table (5 dimensions) + weighted composite + publish/hold/skip decision | 🔴 HIGH |
| 7 | [🧩 Synthesis Summary](synthesis-summary.md) | Daily intelligence synthesis aggregating all per-file analyses into editorial direction | Synthesis Context, Headline Intelligence, SWOT Summary, Risk Overview, Threat Dashboard, Stakeholder Map, Forward Indicators, Editorial Recommendations | All MCP tools (aggregated from per-file outputs) | Dashboard tables + Mermaid intelligence overview + 3 editorial decision points | 🔴 HIGH |
| 8 | [🔍 Per-File Intelligence](per-file-political-intelligence.md) | Deep per-document AI analysis — the **most used template** (every downloaded EP data file receives this) | Document Identity, Executive Summary, Political Classification, SWOT (Grand Coalition + Opposition), Risk Matrix, Threat Landscape, Stakeholder Assessment, Significance Score, Forward Indicators | Depends on document type (see [Document-Type Matrix](#-template-selection-by-mcp-data-category)) | Comprehensive `.analysis.md` file stored alongside data file | 🔴 CRITICAL |
| 9 | [🗳️ Voting Patterns](voting-patterns.md) | Group-by-group coalition arithmetic for the period — cohesion per group, observed coalitions, bloc win-rate, outlier votes, forward-vote forecasts | Group Size Arithmetic, Observed Coalitions, Per-Group Behaviour (≥7 groups), Bloc Win Rate, Outlier Votes, Forward Implications, Confidence Ledger | `get_voting_records`, `analyze_voting_patterns`, `analyze_coalition_dynamics`, `compare_political_groups`, `track_mep_attendance` | Group roster + coalition table + per-group narratives + Mermaid agreement network | 🔴 HIGH |
| 10 | [⚙️ Workflow Audit](workflow-audit.md) | End-of-run self-audit of workflow execution — phases completed, MCP tools called, Core Principles compliance, time budget, issues and recommendations | YAML metadata, 6-Phase Execution, MCP Tool Call Log, 11 Core Principles Scorecard, Artifact Production, Time Budget, Issues & Deviations, Next-Run Recommendations | None (reads workflow log and filesystem) | 6-phase Mermaid flowchart + compliance scorecard + MCP call table | 🟡 MEDIUM |
| 11 | [🔄 Cross-Session Intelligence](cross-session-intelligence.md) | Session-over-session narrative across plenary sessions within a period — themes, crystallisation moment, momentum indicators, next-session outlook | Session Overview, Progression Timeline, Session-by-Session Progression (≥200 words each), Cross-Session Themes (≥4), Crystallisation Moment (≥250 words), Momentum Indicators, Next-Session Outlook | `get_plenary_sessions`, `get_meeting_decisions`, `get_meeting_activities`, `get_adopted_texts`, `get_voting_records` | Mermaid timeline + session narratives + momentum table | 🔴 HIGH |
| 12 | [📜 Deep Analysis](deep-analysis.md) | Long-form (4 000–10 000 word) Economist-style political intelligence prose — the 30-minute read complement to synthesis-summary | Executive Summary, Structural Thesis, Crystallisation Moment, Coalition Dynamics, Policy Dimensions (≥4 sub-sections), Institutional Dynamics, Geopolitical Context, Forward Trajectory, Confidence & Method | Consumes run's `session-baseline`, `voting-patterns`, `cross-session-intelligence`, `coalition-dynamics`, `stakeholder-map` | ≥3 diagrams + named text / RCV citations inline + ≥15 named procedures | 🔴 HIGH |
| 13 | [📆 Session Baseline](session-baseline.md) | Structured calendar + adopted-texts roster for every plenary session in scope — the data-dense reference other artifacts cite | Run Context, Plenary Session Calendar (per session), Session Calendar Diagram, Period Totals, Adopted Texts Roster, Committee Activity Map, Procedure-Code Distribution, Historical Anchor, Data-Source Ledger | `get_plenary_sessions`, `get_adopted_texts`, `get_procedures`, `get_committee_info`, `track_mep_attendance` | Gantt calendar + adopted-texts tables + committee activity map | 🟡 MEDIUM |
| 14 | [🪞 Methodology Reflection](methodology-reflection.md) | Continuous-improvement retrospective — pipeline, data provenance, SATs applied, AI-FIRST iteration log, strengths, limitations, lessons, biases, update plan. **Final** artifact of every run. | Pipeline Diagram, Data Sources & Provenance, SATs Applied (≥10), AI-FIRST Iteration Log (Pass 1 / 2 / optional 3), Strengths (≥5), Limitations (≥5), Lessons (≥5), Biases & Mitigations (≥6), Peer Review, Update Plan, References | None directly (reads completed run + workflow-audit + MCP log) | Colour-coded `graph TD` pipeline + data-provenance table + SATs table + biases table | 🔴 HIGH |

### 🧩 Per-Artifact Templates (25 additional — one per unique methodology section)

Every artifact under `analysis/daily/*/` has a 1:1 template in `analysis/templates/`. These compact fill-in skeletons (60–200 lines each) mirror their section in [`per-artifact-methodologies.md`](../methodologies/per-artifact-methodologies.md):

| Folder | Templates |
|---|---|
| `intelligence/` | [analysis-index](analysis-index.md) · [stakeholder-map](stakeholder-map.md) · [scenario-forecast](scenario-forecast.md) · [pestle-analysis](pestle-analysis.md) · [threat-model](threat-model.md) · [coalition-dynamics](coalition-dynamics.md) · [cross-run-diff](cross-run-diff.md) · [economic-context](economic-context.md) · [historical-baseline](historical-baseline.md) · [mcp-reliability-audit](mcp-reliability-audit.md) · [political-threat-landscape](political-threat-landscape.md) · [wildcards-blackswans](wildcards-blackswans.md) · [reference-analysis-quality](reference-analysis-quality.md) · [voting-patterns](voting-patterns.md) · [workflow-audit](workflow-audit.md) · [cross-session-intelligence](cross-session-intelligence.md) · [methodology-reflection](methodology-reflection.md) |
| `classification/` | [significance-classification](significance-classification.md) · [actor-mapping](actor-mapping.md) · [forces-analysis](forces-analysis.md) · [impact-matrix](impact-matrix.md) |
| `risk-scoring/` | [risk-matrix](risk-matrix.md) · [quantitative-swot](quantitative-swot.md) · [political-capital-risk](political-capital-risk.md) · [legislative-velocity-risk](legislative-velocity-risk.md) |
| `threat-assessment/` | [consequence-trees](consequence-trees.md) · [legislative-disruption](legislative-disruption.md) · [actor-threat-profiles](actor-threat-profiles.md) |
| run root *(required first article artifact)* | [executive-brief](executive-brief.md) — BLUF, three decisions, 60-second read, top trigger |
| `extended/` *(optional — not gated by default)* | [devils-advocate-analysis](devils-advocate-analysis.md) · [historical-parallels](historical-parallels.md) · [coalition-mathematics](coalition-mathematics.md) · [forward-indicators](forward-indicators.md) · [intelligence-assessment](intelligence-assessment.md) · [implementation-feasibility](implementation-feasibility.md) · [media-framing-analysis](media-framing-analysis.md) · [comparative-international](comparative-international.md) · [cross-reference-map](cross-reference-map.md) · [data-download-manifest](data-download-manifest.md) · [voter-segmentation](voter-segmentation.md) |

### 🧱 Framework Templates (6 reusable)

These six templates codify the reusable EP-domain methodologies — every downloaded MCP data file receives one or more of them (especially `per-file-political-intelligence.md`), and the other templates compose their fragments.

| # | Template | Role |
|---|----------|------|
| F1 | [🏷️ political-classification](political-classification.md) | 7-dimension event classification (sensitivity, domain, urgency, scope, actors, impact, temporal) — the foundation every other template cites. |
| F2 | [⚠️ risk-assessment](risk-assessment.md) | 5×5 Likelihood × Impact matrix across 6 risk categories; produces the `risk-scoring/` artifacts. |
| F3 | [🎭 threat-analysis](threat-analysis.md) | Multi-framework threat assessment (Political Threat Landscape 6D + Diamond + Attack Trees + PESTLE + Scenarios + Kill Chain); produces the `threat-assessment/` artifacts. |
| F4 | [💼 swot-analysis](swot-analysis.md) | Evidence-based political SWOT with TOWS cross-quadrant strategies; reusable inside `deep-analysis`, `synthesis-summary`, `quantitative-swot`. |
| F5 | [👥 stakeholder-impact](stakeholder-impact.md) | 7-lens institutional-actor + civil-society impact lens; reusable inside `stakeholder-map`, `deep-analysis`, article stakeholder sections. |
| F6 | [🔍 per-file-political-intelligence](per-file-political-intelligence.md) | The **most-used** template: every downloaded EP data file receives a per-file `.analysis.md` applying classification + SWOT + risk + threat + significance in one pass. |

> Artifact catalogue: [`../methodologies/artifact-catalog.md`](../methodologies/artifact-catalog.md) maps every `analysis/daily/<run>/…` path to one of these six framework templates **or** one of the 25 per-artifact templates below **or** one of the 14 agentic-workflow templates listed in the master catalogue above. The README + `analysis-index.md` are the only two `.md` files in this directory not subject to the drift-guard test `test/unit/analysis-templates-referenced.test.js`, which enforces that every other template is referenced by basename under `.github/prompts/` or `.github/agents/`.

---

## 📄 Template Details

### 1. 🏷️ Political Classification (`political-classification.md`)

**Produces:** A structured 7-dimension classification of an EP political event, determining sensitivity, policy domain, urgency, geographic scope, key actors, impact vectors, and temporal relevance.

**When to use:** As the **first step** in any analysis — classification determines which subsequent templates are required and at what depth. Every significant EP event must be classified before risk, threat, or SWOT analysis proceeds.

| Section | Content | Required? |
|---------|---------|:---------:|
| Document Metadata | Classification ID, event date, EP reference, classifier workflow | ✅ |
| Sensitivity Level | PUBLIC / SENSITIVE / RESTRICTED with rationale | ✅ |
| Policy Domain | Primary + secondary EP committee codes (ECON, LIBE, ENVI, etc.) | ✅ |
| Urgency Level | ROUTINE / ELEVATED / URGENT / CRITICAL | ✅ |
| Geographic Scope | EU-wide / Regional / National / Bilateral | ✅ |
| Actor Mapping | Key MEPs, political groups, committees involved | ✅ |
| Impact Vector | Legislative / Regulatory / Political / Economic | ✅ |
| Temporal Window | Short-term / Medium-term / Long-term horizon | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    EP["📥 EP MCP Data"] --> CLS["🏷️ Classification<br/>7 Dimensions"]
    CLS --> S["Sensitivity"]
    CLS --> D["Domain"]
    CLS --> U["Urgency"]
    CLS --> G["Scope"]
    CLS --> A["Actors"]
    CLS --> I["Impact"]
    CLS --> T["Temporal"]
    S & D & U --> ROUTE{"Route to<br/>Templates"}

    style EP fill:#0d6efd,color:#fff,stroke:#0a58ca
    style CLS fill:#6f42c1,color:#fff,stroke:#59359a
    style ROUTE fill:#ffc107,color:#000,stroke:#d39e00
```

**Methodology:** [political-classification-guide.md](../methodologies/political-classification-guide.md)

---

### 2. ⚠️ Risk Assessment (`risk-assessment.md`)

**Produces:** A quantified risk register using a 5×5 Likelihood × Impact matrix across six political risk categories: Coalition Risk, Legislative Risk, Institutional Risk, Reputational Risk, Economic Risk, and Democratic Risk.

**When to use:** For events classified as ELEVATED urgency or above, or when legislative procedures enter critical stages (committee vote, plenary vote, trilogue). Also triggered by voting anomalies or coalition shift signals.

| Section | Content | Required? |
|---------|---------|:---------:|
| Risk Context | Analysis period, political context, overall risk level | ✅ |
| Risk Register | 6 categories with L×I scores (1–5 each) | ✅ |
| Heat Map | Colour-coded 5×5 Mermaid matrix | ✅ |
| Mitigation Strategies | Recommended monitoring and response actions | ✅ |
| Monitoring Indicators | Leading indicators to track risk trajectory | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    DATA["📥 Voting Records<br/>Coalition Dynamics"] --> RISK["⚠️ Risk Assessment"]
    RISK --> L["Likelihood<br/>(1–5)"]
    RISK --> I["Impact<br/>(1–5)"]
    L & I --> SCORE["L×I Score"]
    SCORE --> HEAT["🟥🟧🟨🟩<br/>Heat Map"]

    style DATA fill:#0d6efd,color:#fff,stroke:#0a58ca
    style RISK fill:#dc3545,color:#fff,stroke:#bd2130
    style SCORE fill:#ffc107,color:#000,stroke:#d39e00
    style HEAT fill:#fd7e14,color:#fff,stroke:#c96009
```

**Methodology:** [political-risk-methodology.md](../methodologies/political-risk-methodology.md)

---

### 3. 🎭 Threat Analysis (`threat-analysis.md`)

**Produces:** A multi-framework political threat assessment using the **Political Threat Landscape** as the primary model — a purpose-built 6-dimension framework for EU democratic threats. Additional frameworks (Diamond Model, Attack Trees, PESTLE, Scenario Planning, Kill Chain) layer on for threats rated MODERATE or above.

> **⚠️ Important:** This template uses **Political Threat Landscape** analysis — NOT STRIDE, DREAD, or PASTA. Those frameworks are designed for software security, not political intelligence. The 6 dimensions are purpose-built for EU parliamentary democracy.

**When to use:** For all periodic analysis cycles (daily, weekly, monthly) and for events that trigger coalition shifts, transparency concerns, or democratic erosion signals.

**The 6 Political Threat Landscape Dimensions:**

| # | Dimension | Focus Area | Severity Scale |
|:-:|-----------|------------|:--------------:|
| 1 | 🔄 Coalition Shifts | Voting pattern changes, alliance realignments, political group defections | 1–5 |
| 2 | 🔍 Transparency Deficit | Disclosure gaps, declaration irregularities, committee opacity | 1–5 |
| 3 | ↩️ Policy Reversal | Adopted position reversals, legislative rollbacks, commitment abandonment | 1–5 |
| 4 | 🏛️ Institutional Pressure | Inter-institutional tensions, competence disputes, procedural manipulation | 1–5 |
| 5 | 🚧 Legislative Obstruction | Procedure delays, amendment flooding, committee bottlenecks | 1–5 |
| 6 | 🗳️ Democratic Erosion | Participation decline, mandate violations, electoral integrity concerns | 1–5 |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    DATA["📥 Coalition + Voting<br/>+ Declaration Data"] --> TL["🎭 Political Threat<br/>Landscape (6D)"]
    TL --> CS["🔄 Coalition Shifts"]
    TL --> TD["🔍 Transparency Deficit"]
    TL --> PR["↩️ Policy Reversal"]
    TL --> IP["🏛️ Institutional Pressure"]
    TL --> LO["🚧 Legislative Obstruction"]
    TL --> DE["🗳️ Democratic Erosion"]
    CS & TD & PR & IP & LO & DE --> SEV{"Severity<br/>≥ MODERATE?"}
    SEV -->|Yes| DEEP["Layer: Diamond Model<br/>+ Attack Trees + PESTLE<br/>+ Scenario Planning<br/>+ Kill Chain"]
    SEV -->|No| LOG["Log finding<br/>+ monitor"]

    style DATA fill:#0d6efd,color:#fff,stroke:#0a58ca
    style TL fill:#343a40,color:#fff,stroke:#23272b
    style SEV fill:#ffc107,color:#000,stroke:#d39e00
    style DEEP fill:#dc3545,color:#fff,stroke:#bd2130
    style LOG fill:#6c757d,color:#fff,stroke:#545b62
```

**Methodology:** [political-threat-framework.md](../methodologies/political-threat-framework.md)

---

### 4. 💼 SWOT Analysis (`swot-analysis.md`)

**Produces:** An evidence-based political SWOT assessment for the EU democratic landscape, with separate quadrants for Grand Coalition and Opposition dynamics. Every entry requires an EP document reference — opinion-only entries are prohibited.

**When to use:** For strategic landscape assessment during periodic analysis cycles, and for events with cross-party implications or institutional significance.

| Section | Content | Required? |
|---------|---------|:---------:|
| SWOT Context | Analysis period, political context, scope | ✅ |
| Strengths | Positive factors with EP evidence citations | ✅ |
| Weaknesses | Negative internal factors with evidence | ✅ |
| Opportunities | External positive developments with evidence | ✅ |
| Threats | External negative developments with evidence | ✅ |
| Strategic Implications | Cross-quadrant analysis and recommendations | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    DATA["📥 Adopted Texts<br/>+ Procedures<br/>+ Voting Records"] --> SWOT["💼 SWOT<br/>Analysis"]
    SWOT --> S["💪 Strengths"]
    SWOT --> W["⚡ Weaknesses"]
    SWOT --> O["🌟 Opportunities"]
    SWOT --> T["⚠️ Threats"]

    style DATA fill:#0d6efd,color:#fff,stroke:#0a58ca
    style SWOT fill:#0d6efd,color:#fff,stroke:#0a58ca
    style S fill:#28a745,color:#fff,stroke:#1e7e34
    style W fill:#dc3545,color:#fff,stroke:#bd2130
    style O fill:#0d6efd,color:#fff,stroke:#0a58ca
    style T fill:#ffc107,color:#000,stroke:#d39e00
```

**Methodology:** [political-swot-framework.md](../methodologies/political-swot-framework.md)

---

### 5. 👥 Stakeholder Impact (`stakeholder-impact.md`)

**Produces:** A 7-lens stakeholder impact assessment covering all major EU institutional actors and civil society groups. Each stakeholder receives an impact rating (HIGH/MEDIUM/LOW/NONE), direction (positive/negative/neutral), and confidence level.

**When to use:** For legislative events affecting multiple EU actors, committee decisions with cross-institutional implications, and adopted texts with broad societal impact.

| Section | Content | Required? |
|---------|---------|:---------:|
| Assessment Context | Event reference, scope, analysis date | ✅ |
| European Council / Council of the EU | Impact, direction, evidence | ✅ |
| European Commission | Impact, direction, evidence | ✅ |
| EP Political Groups | Per-group impact assessment | ✅ |
| National Parliaments | Subsidiarity and transposition impact | ✅ |
| Civil Society / NGOs | Democratic participation impact | ✅ |
| Industry / Business | Regulatory and economic impact | ✅ |
| Citizens / Public | Direct citizen impact assessment | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    DATA["📥 MEP Data<br/>+ Committee Info<br/>+ Country Delegation"] --> STK["👥 Stakeholder<br/>Impact"]
    STK --> INST["🏛️ EU Institutions"]
    STK --> POL["🗳️ Political Groups"]
    STK --> CIV["👤 Civil Society"]
    STK --> PUB["🌍 Citizens"]

    style DATA fill:#0d6efd,color:#fff,stroke:#0a58ca
    style STK fill:#20c997,color:#fff,stroke:#199d76
    style INST fill:#6f42c1,color:#fff,stroke:#59359a
    style POL fill:#fd7e14,color:#fff,stroke:#c96009
    style CIV fill:#28a745,color:#fff,stroke:#1e7e34
    style PUB fill:#003399,color:#fff,stroke:#002266
```

**Methodology:** Template is self-contained; cross-reference [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md) for quality standards.

---

### 6. 📈 Significance Scoring (`significance-scoring.md`)

**Produces:** A 5-dimension composite score (0–10) that determines publication priority. Scores drive the editorial decision: **PUBLISH** (≥7.0), **HOLD** (5.0–6.9), or **SKIP** (<5.0).

**When to use:** For every event under consideration for article generation. Significance scoring is the **gatekeeper** between analysis and publication — no article should be generated for events scoring below 7.0.

| Section | Content | Required? |
|---------|---------|:---------:|
| Event Context | Score ID, event name, EP reference, classification ID | ✅ |
| Parliamentary Significance (0–10) | Legislative weight, procedural importance | ✅ |
| Policy Impact (0–10) | Regulatory and policy change magnitude | ✅ |
| Institutional Relevance (0–10) | Cross-institutional importance | ✅ |
| Public Interest (0–10) | Citizen engagement and media attention potential | ✅ |
| Temporal Urgency (0–10) | Time sensitivity and news cycle alignment | ✅ |
| Composite Score | Weighted average with publish/hold/skip decision | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    DATA["📥 EP Events<br/>+ Sessions<br/>+ Adopted Texts"] --> SIG["📈 Significance<br/>Scoring"]
    SIG --> PS["Parliamentary<br/>Significance"]
    SIG --> PI["Policy<br/>Impact"]
    SIG --> IR["Institutional<br/>Relevance"]
    SIG --> PU["Public<br/>Interest"]
    SIG --> TU["Temporal<br/>Urgency"]
    PS & PI & IR & PU & TU --> C["📊 Composite<br/>(0–10)"]
    C -->|"≥ 7.0"| PUB["✅ PUBLISH"]
    C -->|"5.0–6.9"| HOLD["⏸️ HOLD"]
    C -->|"< 5.0"| SKIP["⏭️ SKIP"]

    style DATA fill:#0d6efd,color:#fff,stroke:#0a58ca
    style SIG fill:#ffc107,color:#000,stroke:#d39e00
    style C fill:#fd7e14,color:#fff,stroke:#c96009
    style PUB fill:#28a745,color:#fff,stroke:#1e7e34
    style HOLD fill:#6c757d,color:#fff,stroke:#545b62
    style SKIP fill:#dc3545,color:#fff,stroke:#bd2130
```

**Methodology:** Scoring dimensions defined in [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md).

---

### 7. 🧩 Synthesis Summary (`synthesis-summary.md`)

**Produces:** A daily intelligence synthesis that aggregates all per-file analyses into a single editorial briefing. This is the template consumed directly by article generators to determine narrative direction, headline selection, and publication priority across all 14 languages.

**When to use:** Once per analysis cycle (daily, weekly, or monthly) after all per-file analyses are complete. The synthesis serves as the **single source of truth** for downstream article generation.

| Section | Content | Required? |
|---------|---------|:---------:|
| Synthesis Context | Synthesis ID, analysis date, document count, data sources | ✅ |
| Headline Intelligence | Top 3–5 findings ranked by significance score | ✅ |
| Aggregated SWOT Summary | Cross-document strength/weakness/opportunity/threat counts | ✅ |
| Risk Overview | Risk category ranges with trend arrows | ✅ |
| Threat Dashboard | Multi-framework summary across all documents | ✅ |
| Stakeholder Map | Aggregated stakeholder impacts with direction indicators | ✅ |
| Forward Indicators | 3 editorial decision points for the next analysis cycle | ✅ |
| Editorial Recommendations | Narrative direction and article type suggestions | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    PF1["🔍 Per-File #1"] --> SYN["🧩 Daily Synthesis"]
    PF2["🔍 Per-File #2"] --> SYN
    PF3["🔍 Per-File #3"] --> SYN
    PFN["🔍 Per-File #N"] --> SYN
    SYN --> HL["📰 Headlines"]
    SYN --> RS["📊 Risk Summary"]
    SYN --> ED["✍️ Editorial<br/>Recommendations"]
    ED --> ART["📰 Article<br/>Generation<br/>(14 languages)"]

    style PF1 fill:#28a745,color:#fff,stroke:#1e7e34
    style PF2 fill:#28a745,color:#fff,stroke:#1e7e34
    style PF3 fill:#28a745,color:#fff,stroke:#1e7e34
    style PFN fill:#28a745,color:#fff,stroke:#1e7e34
    style SYN fill:#fd7e14,color:#fff,stroke:#c96009
    style ED fill:#6f42c1,color:#fff,stroke:#59359a
    style ART fill:#003399,color:#fff,stroke:#002266
```

**Methodology:** Aggregation rules defined in [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md).

---

### 8. 🔍 Per-File Political Intelligence (`per-file-political-intelligence.md`)

**Produces:** A comprehensive per-document analysis covering all six specialist frameworks in a single integrated output. This is the **most used template** — every downloaded EP MCP data file receives a `.analysis.md` file generated from this template, stored alongside the data file.

**When to use:** For **every** EP MCP data file downloaded during an analysis cycle. The per-file template is mandatory: no data file should exist without a corresponding analysis.

| Section | Content | Required? |
|---------|---------|:---------:|
| Document Identity | EP doc ref, type, date, committee, MCP tool source | ✅ |
| Executive Summary | 3–5 sentence intelligence summary with confidence labels | ✅ |
| Political Classification | Inline 7-dimension classification (from classification template) | ✅ |
| SWOT Assessment | Grand Coalition + Opposition quadrant analysis | ✅ |
| Risk Matrix | Likelihood × Impact scores for applicable risk categories | ✅ |
| Threat Landscape | Applicable dimensions from 6D Political Threat Landscape | ✅ |
| Stakeholder Assessment | 7-lens impact assessment for affected stakeholder groups | ✅ |
| Significance Score | 5-dimension composite with publish decision | ✅ |
| Forward Indicators | Timeline-based monitoring metrics | ✅ |

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    MCP["📥 Single EP<br/>MCP Data File"] --> PFI["🔍 Per-File<br/>Intelligence"]
    PFI --> CLS["🏷️ Classify"]
    PFI --> SWT["💼 SWOT"]
    PFI --> RSK["⚠️ Risk"]
    PFI --> THR["🎭 Threat"]
    PFI --> STK["👥 Stakeholder"]
    PFI --> SIG["📈 Score"]
    CLS & SWT & RSK & THR & STK & SIG --> OUT[".analysis.md<br/>saved alongside<br/>data file"]
    OUT --> SYN["🧩 Feed into<br/>Daily Synthesis"]

    style MCP fill:#0d6efd,color:#fff,stroke:#0a58ca
    style PFI fill:#28a745,color:#fff,stroke:#1e7e34
    style OUT fill:#fd7e14,color:#fff,stroke:#c96009
    style SYN fill:#fd7e14,color:#fff,stroke:#c96009
    style CLS fill:#6f42c1,color:#fff,stroke:#59359a
    style RSK fill:#dc3545,color:#fff,stroke:#bd2130
    style THR fill:#343a40,color:#fff,stroke:#23272b
```

**Methodology:** Full per-file protocol defined in [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md).

---

## 📊 Template Selection by MCP Data Category

Use this matrix to determine which templates apply to each EP data category. **Per-File Intelligence** always applies — additional specialist templates are triggered by the data type:

| MCP Data Category | Directory | Per-File | Classification | Risk | Threat | SWOT | Stakeholder | Significance |
|-------------------|-----------|:--------:|:--------------:|:----:|:------:|:----:|:-----------:|:------------:|
| **Adopted texts** (legislative resolutions) | `adopted-texts/` | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ |
| **Committee documents** (reports, opinions) | `committee-documents/` | ✅ | ⬜ | ✅ | ⬜ | ⬜ | ✅ | ⬜ |
| **Legislative procedures** | `procedures/` | ✅ | ⬜ | ✅ | ⬜ | ✅ | ⬜ | ⬜ |
| **Plenary votes** (roll-call) | `votes/` | ✅ | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ |
| **Speeches** (plenary debates) | `speeches/` | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ |
| **Parliamentary questions** | `questions/` | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| **Events** (hearings, conferences) | `events/` | ✅ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ✅ |
| **MEP profiles** | `meps/` | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| **MEP declarations** | `declarations/` | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| **Plenary documents** | `plenary-documents/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **External documents** (Commission, Council) | `external-documents/` | ✅ | ⬜ | ✅ | ⬜ | ✅ | ⬜ | ⬜ |
| **IMF data** (primary economic, Wave-4) | `imf/` | ✅ | ⬜ | ✅ | ⬜ | ✅ | ⬜ | ⬜ |
| **World Bank data** (non-economic only) | `world-bank/` | ✅ | ⬜ | ✅ | ⬜ | ✅ | ⬜ | ⬜ |

> **Legend:** ✅ = Primary template for this data type | ⬜ = Optional / use if relevant

---

## 🔀 Template Composition Pipeline

Analysis templates compose into a temporal aggregation pipeline. Per-file analyses feed daily synthesis, which aggregates into weekly intelligence, then monthly strategic reports:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    subgraph "Per-File Layer"
        F1["🔍 file-1.analysis.md"]
        F2["🔍 file-2.analysis.md"]
        FN["🔍 file-N.analysis.md"]
    end

    subgraph "Daily Layer"
        DS["🧩 Daily Synthesis<br/>synthesis-summary.md"]
    end

    subgraph "Weekly Layer"
        WS["📅 Weekly<br/>Intelligence Brief"]
    end

    subgraph "Monthly Layer"
        MS["📊 Monthly<br/>Strategic Report"]
    end

    F1 & F2 & FN --> DS
    DS --> WS
    WS --> MS
    MS --> PUB["📰 Published<br/>Articles<br/>(14 languages)"]

    style F1 fill:#28a745,color:#fff,stroke:#1e7e34
    style F2 fill:#28a745,color:#fff,stroke:#1e7e34
    style FN fill:#28a745,color:#fff,stroke:#1e7e34
    style DS fill:#fd7e14,color:#fff,stroke:#c96009
    style WS fill:#6f42c1,color:#fff,stroke:#59359a
    style MS fill:#003399,color:#fff,stroke:#002266
    style PUB fill:#20c997,color:#fff,stroke:#199d76
```

| Pipeline Stage | Input | Output | Frequency | Storage Location |
|----------------|-------|--------|-----------|------------------|
| **Per-File Analysis** | Single EP MCP data file | `{id}.analysis.md` alongside data | Per file download | `analysis/YYYY-MM-DD/{slug}/data/` |
| **Daily Synthesis** | All per-file analyses from one day | `synthesis-summary.md` | Daily | `analysis/YYYY-MM-DD/{slug}/` |
| **Weekly Brief** | 5–7 daily syntheses | Weekly intelligence report | Weekly | `analysis/daily/` |
| **Monthly Report** | 4–5 weekly briefs | Monthly strategic report | Monthly | `analysis/monthly/` |

---

## ✅ Quality Requirements

All template outputs must meet the quality gate defined in the [AI-Driven Analysis Guide](../methodologies/ai-driven-analysis-guide.md):

| Requirement | Threshold | Enforcement |
|-------------|-----------|-------------|
| **Overall Quality Score** | ≥ 7.0 / 10 | Self-assessed by AI agent; failed analyses must be revised |
| **Evidence Citations** | 100% of claims | Every factual assertion cites an EP document, MCP data file, or named source |
| **Structured Output** | Tables + Mermaid diagrams | Plain prose without structure is rejected |
| **Confidence Labels** | All assertions | HIGH / MEDIUM / LOW confidence on every finding |
| **Mermaid Diagrams** | Colour-coded with `style` directives | Unlabelled or unstyled diagrams are rejected |
| **Anti-Boilerplate** | Zero tolerance | Generic statements without data-specific analysis trigger revision |
| **Metadata Completeness** | All `[REQUIRED]` fields filled | Placeholder text in output is automatically rejected |
| **Template Compliance** | Exact section structure preserved | Sections must not be added, removed, or reordered |

### Quality Score Dimensions

The 7.0/10 quality gate is assessed across five dimensions:

1. **Analytical Depth** (weight: 30%) — Does the analysis go beyond surface-level observations?
2. **Evidence Quality** (weight: 25%) — Are citations specific (EP doc IDs, MCP data refs) rather than vague?
3. **Structural Compliance** (weight: 20%) — Does the output follow the template exactly?
4. **Insight Originality** (weight: 15%) — Does the analysis produce novel intelligence, not regurgitate input data?
5. **Presentation Quality** (weight: 10%) — Are Mermaid diagrams colour-coded and tables properly formatted?

---

## 🚫 Anti-Pattern Warnings

Templates enforce strict anti-patterns to prevent low-quality intelligence production:

| ❌ Anti-Pattern | Why It Fails | ✅ Correct Approach |
|----------------|-------------|-------------------|
| **Generic scripted prose** ("Coalition stability appears maintained") | Indicates the AI has NOT read the actual data | Cite specific voting records, coalition dynamics data, or anomaly detection outputs |
| **Using STRIDE, DREAD, or PASTA** for threat analysis | These are software security frameworks, not political intelligence models | Use **Political Threat Landscape** (6 dimensions: Coalition Shifts, Transparency Deficit, Policy Reversal, Institutional Pressure, Legislative Obstruction, Democratic Erosion) |
| **Placeholder text in output** (`[REQUIRED]`, `[TBD]`, `[TODO]`) | Indicates incomplete analysis | Fill every required field with actual data-driven content |
| **Unstyled Mermaid diagrams** | Missing colour coding makes diagrams unreadable and non-compliant | Add `style` directives with hex colours to every Mermaid node |
| **Opinion without evidence** ("The EU faces challenges") | Unsubstantiated claims violate evidence-based methodology | Every claim must cite: EP procedure ID, adopted text ref, or MCP data path |
| **Scores without dimension breakdowns** (e.g., "Risk: Medium") | Undimensioned scores are unverifiable and unreproducible | Provide full breakdown: L×I for risk, 5-dimension for significance, 6D for threat |
| **Copy-paste from previous analyses** | Recycled content misses document-specific intelligence | Analyse each data file independently; cross-reference prior work but never copy |
| **Missing confidence labels** | Without confidence tags, consumers cannot assess reliability | Tag every assertion: `[HIGH confidence]`, `[MEDIUM confidence]`, or `[LOW confidence]` |

### ⚠️ STRIDE Anti-Pattern — Correct vs Wrong Approach

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TD
    subgraph "🚫 WRONG Approach"
        STRIDE["STRIDE Categories<br/>(cybersecurity)"]
        STRIDE_OUT["❌ Superficial<br/>categorisation"]
        STRIDE --> STRIDE_OUT
    end

    subgraph "✅ CORRECT Approach"
        MULTI["Multi-Framework<br/>Integration"]
        PTL["🎯 Political Threat<br/>Landscape (6D)"]
        AT["🌳 Attack Trees"]
        DM["💎 Diamond Model"]
        KC["⚔️ Kill Chain"]
        MULTI --> PTL & AT & DM & KC
        PTL & AT & DM & KC --> DEEP["✅ Actionable<br/>intelligence"]
    end

    style STRIDE fill:#dc3545,color:#fff,stroke:#b02a37
    style STRIDE_OUT fill:#dc3545,color:#fff,stroke:#b02a37
    style MULTI fill:#198754,color:#fff,stroke:#146c43,stroke-width:2px
    style PTL fill:#0d6efd,color:#fff,stroke:#0a58ca
    style AT fill:#fd7e14,color:#fff,stroke:#ca6510
    style DM fill:#6f42c1,color:#fff,stroke:#59359a
    style KC fill:#d63384,color:#fff,stroke:#ab296a
    style DEEP fill:#198754,color:#fff,stroke:#146c43
```

---

## 📰 Workflow-Specific Template Routing

Each agentic workflow uses a **tailored subset** of templates. This ensures every article type produces analytics unique to its focus area:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    subgraph "📋 8 Templates"
        T1["🏷️ Classification"]
        T2["⚠️ Risk Assessment"]
        T3["🎭 Threat Analysis"]
        T4["💼 SWOT"]
        T5["👥 Stakeholder Impact"]
        T6["📈 Significance"]
        T7["🧩 Synthesis"]
        T8["🔍 Per-File Intel"]
    end

    subgraph "📰 Workflows"
        BK["🔴 Breaking"]
        MO["📋 Motions"]
        PR["📜 Propositions"]
        CR["🏛️ Committee"]
        WA["📅 Week Ahead"]
        WR["📊 Weekly Review"]
        MA["📆 Month Ahead"]
        MR["📈 Monthly Review"]
    end

    T1 --> BK & MO & WR
    T2 --> BK & CR & PR & MR
    T3 --> MO & MA & MR
    T4 --> PR & WA & WR & MA & MR
    T5 --> CR & MO & MA
    T6 --> BK & WA & WR
    T7 --> WR & MR
    T8 --> BK & MO & PR & CR & WA & WR & MA & MR

    style BK fill:#dc3545,stroke:#b02a37,color:#fff
    style MO fill:#fd7e14,stroke:#ca6510,color:#fff
    style PR fill:#ffc107,stroke:#cc9a06,color:#000
    style CR fill:#198754,stroke:#146c43,color:#fff
    style WA fill:#0d6efd,stroke:#0a58ca,color:#fff
    style WR fill:#6f42c1,stroke:#59359a,color:#fff
    style MA fill:#d63384,stroke:#ab296a,color:#fff
    style MR fill:#0dcaf0,stroke:#0aa2c0,color:#000
    style T8 fill:#20c997,stroke:#1aa179,color:#fff
```

### Template Coverage Per Workflow

| Workflow | Primary Templates | Unique Analytics Produced |
|----------|------------------|--------------------------|
| **Breaking News** | Classification + Risk + Significance + Per-File | ⚡ Real-time urgency rating; today-only significance scoring; breaking alert classification |
| **Motions** | Classification + Threat + Stakeholder + Per-File | 🗳️ Per-resolution threat dimension mapping; political group impact analysis; defection tracking |
| **Propositions** | Risk + SWOT + Per-File | 📜 Legislative pipeline risk scoring; opportunity analysis for upcoming procedures |
| **Committee Reports** | Risk + Classification + Stakeholder + Per-File | 🏛️ Committee-level stakeholder mapping; document classification by committee domain |
| **Week Ahead** | SWOT + Risk + Significance + Per-File | 📅 Forward-looking SWOT for upcoming agenda; vote risk pre-assessment |
| **Weekly Review** | Classification + SWOT + Significance + Synthesis + Per-File | 📊 Outcome classification; week-level SWOT synthesis; performance metrics |
| **Month Ahead** | SWOT + Threat + Stakeholder + Per-File | 📆 Strategic SWOT outlook; emerging threat landscape; institutional stakeholder analysis |
| **Monthly Review** | ALL templates | 📈 Comprehensive analysis applying every template in the catalog; inter-temporal trend synthesis |

> **Per-File Intelligence** (`per-file-political-intelligence.md`) is applied to **every workflow** because every downloaded MCP data file receives individual deep analysis.

---

## 🎯 Article-Type-Specific Template Customisation

While every template in the catalog applies to every document, certain templates produce **richer, more unique output** depending on the document type. The AI agent should allocate proportionally more depth to the highlighted templates:

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
graph TB
    subgraph "🔴 Breaking News"
        BK_T1["🔍 Per-File Intel<br/><b>Focus: urgency assessment</b>"]
        BK_T2["📈 Significance<br/><b>Focus: real-time scoring</b>"]
        BK_T3["⚠️ Risk<br/><b>Focus: impact severity</b>"]
    end

    subgraph "📋 Motions"
        MO_T1["🔍 Per-File Intel<br/><b>Focus: vote breakdown</b>"]
        MO_T2["🎭 Threat<br/><b>Focus: defection patterns</b>"]
        MO_T3["👥 Stakeholder<br/><b>Focus: group alignment</b>"]
    end

    subgraph "📜 Propositions"
        PR_T1["🔍 Per-File Intel<br/><b>Focus: legislative pipeline</b>"]
        PR_T2["⚠️ Risk<br/><b>Focus: procedure risk</b>"]
        PR_T3["👥 Stakeholder<br/><b>Focus: rapporteur influence</b>"]
    end

    subgraph "🏛️ Committee Reports"
        CR_T1["🔍 Per-File Intel<br/><b>Focus: committee output</b>"]
        CR_T2["⚠️ Risk<br/><b>Focus: committee risk</b>"]
        CR_T3["👥 Stakeholder<br/><b>Focus: committee dynamics</b>"]
    end

    style BK_T1 fill:#dc3545,color:#fff,stroke:#b02a37
    style BK_T2 fill:#dc3545,color:#fff,stroke:#b02a37
    style BK_T3 fill:#dc3545,color:#fff,stroke:#b02a37
    style MO_T1 fill:#fd7e14,color:#fff,stroke:#ca6510
    style MO_T2 fill:#fd7e14,color:#fff,stroke:#ca6510
    style MO_T3 fill:#fd7e14,color:#fff,stroke:#ca6510
    style PR_T1 fill:#0d6efd,color:#fff,stroke:#0a58ca
    style PR_T2 fill:#0d6efd,color:#fff,stroke:#0a58ca
    style PR_T3 fill:#0d6efd,color:#fff,stroke:#0a58ca
    style CR_T1 fill:#198754,color:#fff,stroke:#146c43
    style CR_T2 fill:#198754,color:#fff,stroke:#146c43
    style CR_T3 fill:#198754,color:#fff,stroke:#146c43
```

### Unique Template Sections by Article Type

Each article type should produce unique analytical sections in its synthesis that **no other workflow can produce**:

| Article Type | Template | Unique Section Name | What Makes It Unique |
|---|---|---|---|
| **Breaking News** | Significance | **Breaking Urgency Rating** | Real-time significance assessment with 6-hour refresh — only breaking workflow has this cadence |
| **Breaking News** | Risk | **Political Temperature Spike** | Immediate impact assessment for events published today — no other workflow operates at this tempo |
| **Motions** | Threat | **Defection Pattern Dashboard** | Political group voting discipline per-resolution — only motion workflow analyses individual vote breakdowns |
| **Motions** | Stakeholder | **Cross-Group Alignment Map** | Which groups vote together on this resolution — unique cross-party cooperation/opposition analysis |
| **Propositions** | Risk | **Legislative Pipeline Risk** | Where the procedure sits (committee → plenary → trilogue → adoption) and risk of delay/amendment |
| **Propositions** | Stakeholder | **Rapporteur Influence Scorecard** | Rapporteur and shadow rapporteur influence mapping, amendment success rate — unique to procedure analysis |
| **Committee Reports** | Per-File Intel | **Committee Productivity Matrix** | Per-committee output volume, meeting frequency, document production rate |
| **Committee Reports** | Stakeholder | **Cross-Committee Comparison** | Relative workload and output comparison across EP committees — only committee workflow has this breadth |
| **Week Ahead** | SWOT | **Pre-Plenary Intelligence Brief** | Forward-looking SWOT for upcoming plenary agenda — only week-ahead can provide this prospective view |
| **Week Ahead** | Risk | **Scheduled Vote Risk Pre-Assessment** | Vote-by-vote risk prediction for upcoming plenary — unique forward-looking risk assessment |
| **Weekly Review** | SWOT | **Week-over-Week Trend Delta** | How did this week's political temperature differ from last week? Only weekly scope enables this |
| **Weekly Review** | Synthesis | **Weekly Parliamentary Pulse** | Aggregated activity index combining all document types into a single weekly metric |
| **Month Ahead** | Risk | **Strategic Calendar Risk Map** | Forward-looking risk landscape tied to specific scheduled events (budget debates, EU summits) |
| **Monthly Review** | Synthesis | **Grand Coalition Scorecard** | Monthly assessment of Grand Coalition legislative effectiveness, cohesion, and political group performance rankings |

---

## 🔗 Related Documentation

| Document | Relationship |
|----------|-------------|
| [📖 Analysis Directory README](../README.md) | Parent directory overview; describes full analysis directory structure |
| [🤖 AI-Driven Analysis Guide](../methodologies/ai-driven-analysis-guide.md) | Master guide for per-file analysis protocol, quality gates, and anti-patterns |
| [🏷️ Classification Guide](../methodologies/political-classification-guide.md) | Full methodology for 7-dimension political event classification |
| [⚠️ Risk Methodology](../methodologies/political-risk-methodology.md) | Full methodology for 5×5 Likelihood × Impact political risk scoring |
| [🎭 Threat Framework](../methodologies/political-threat-framework.md) | Full methodology for 6-dimension Political Threat Landscape + layered frameworks |
| [💼 SWOT Framework](../methodologies/political-swot-framework.md) | Full methodology for evidence-based political SWOT quadrant analysis |
| [✍️ Style Guide](../methodologies/political-style-guide.md) | Editorial and analytical writing standards for EP intelligence |
| [📐 Architecture](../../ARCHITECTURE.md) | System architecture context for the analysis pipeline |
| [🔄 Workflows](../../WORKFLOWS.md) | CI/CD workflows that trigger and consume analysis template outputs |
| [🛡️ Security Architecture](../../SECURITY_ARCHITECTURE.md) | Security controls governing analysis data handling |

---

## 📝 Document Control

| Field | Value |
|-------|-------|
| **Document ID** | `TMPL-README-001` |
| **Title** | Analysis Templates — Directory Documentation |
| **Owner** | CEO |
| **Version** | 3.1 |
| **Classification** | Public |
| **Created** | 2026-03-30 |
| **Last Updated** | 2026-04-06 |
| **Review Cycle** | Quarterly |
| **Next Review** | 2026-06-30 |
| **Organisation** | Hack23 AB (Org.nr 5595347807) |
| **Approved By** | CEO |

### Changelog

| Version | Date | Changes |
|:-------:|------|---------|
| **3.1** | 2026-04-06 | Cross-session intelligence & quality gate enhancements across all 8 templates — see details below |
| **3.0** | 2026-03-31 | Initial master README consolidating all 8 templates with ISMS alignment |

#### v3.1 Changelog Details

| Template | Version | Enhancement |
|----------|:-------:|-------------|
| `per-file-political-intelligence.md` | 1.0→1.1 | Added EP MCP Tool Mapping per section; added Cross-Session Delta Tracking section |
| `significance-scoring.md` | 2.0→2.1 | Added Publication Decision Tree (Mermaid flowchart with HOLD/SKIP); added EP Calendar Awareness with recess scoring adjustments |
| `synthesis-summary.md` | 1.0→1.1 | Added Temporal Aggregation Rollup Guidance (daily→weekly→monthly hierarchy); added Cross-Session Intra-Day Aggregation rules |
| `stakeholder-impact.md` | 2.0→2.1 | Added EU Institutional Hierarchy Awareness (Mermaid cascade diagram); added Cross-Committee Stakeholder Mapping |
| `threat-analysis.md` | 2.0→2.1 | Added Cross-Session Bayesian Update section (prior/posterior severity tracking per dimension) |
| `risk-assessment.md` | 2.0→2.1 | Added Risk Register Continuity section (carry-forward, trajectory visualization, lifecycle rules) |
| `swot-analysis.md` | 2.0→2.1 | Expanded TOWS Strategic Matrix with Mermaid diagram, detailed options table, and Strategic Priority Ranking |
| `political-classification.md` | 2.0→2.1 | Added Recess-Period Classification Rules (recess detection, urgency overrides, calendar context) |

---

<p align="center">
  <em>📋 EU Parliament Monitor Analysis Templates — Structured Intelligence for Democratic Transparency</em><br>
  <strong>© 2024-2026 Hack23 AB</strong> — <a href="https://hack23.com">hack23.com</a>
</p>
