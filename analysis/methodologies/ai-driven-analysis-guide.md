<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🤖 AI-Driven Per-File Analysis Guide — European Parliament</h1>

<p align="center">
  <strong>📊 Comprehensive Methodology for Agentic Political Intelligence Analysis</strong><br>
  <em>🎯 Per-File Protocol · Quality Gates · Anti-Patterns · Document-Type Focus</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--31-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 2.0 | **📅 Last Updated:** 2026-03-31 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-30
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

This guide defines the **per-file AI analysis protocol** — the primary analysis mode for EU Parliament Monitor. For every downloaded EP MCP data file, the AI agent produces a deep analysis markdown file stored alongside it. This replaces batch summaries with systematic, per-document intelligence production.

**Critical mandate:** AI agents must READ all methodology documents, ANALYSE the specific data file using those methodologies, and PRODUCE original intelligence — never scripted or templated boilerplate.

---

## 🔴 ABSOLUTE RULES (Violations = Rejected Output)

### Rule 1: Folder Isolation — NEVER Overwrite Another Workflow's Analysis

Each agentic workflow writes ONLY to its own isolated folder:

```
analysis/{YYYY-MM-DD}/{article-type-slug}/
```

**Enforcement checklist:**
- [ ] My workflow writes ONLY to `analysis/${ARTICLE_DATE}/${ARTICLE_TYPE_SLUG}/`
- [ ] My `git add` is scoped: `git add "analysis/${ARTICLE_DATE}/${ARTICLE_TYPE_SLUG}/"`
- [ ] I do NOT touch files in any other workflow's folder
- [ ] Breaking workflows use the `breaking/` slug

### Rule 2: AI Performs ALL Analysis — Scripts ONLY Download Data

| ✅ Scripts MAY | 🚫 Scripts MUST NEVER |
|---------------|----------------------|
| Download EP MCP data files | Generate analysis prose, SWOT entries, risk scores |
| Catalog pending files | Fill template sections with content |
| Run quality gate validation | Create "placeholder" text that looks like real analysis |
| Create directory structure | Produce significance scores or classifications |

**Test:** If you can replace the "analysis" content with Lorem Ipsum and nobody notices, it's scripted crap — not genuine analysis.

### Rule 3: Read ALL Methodologies Before Analyzing

Before analyzing ANY document, the AI MUST read:
1. `analysis/methodologies/political-swot-framework.md` — Cross-SWOT interference, TOWS matrix, scenario generation
2. `analysis/methodologies/political-risk-methodology.md` — Cascading risk, Bayesian updating, risk interconnection
3. `analysis/methodologies/political-threat-framework.md` — Political Threat Landscape, Attack Trees, Diamond Model, Kill Chain, PESTLE
4. `analysis/methodologies/political-classification-guide.md` — Political Temperature, strategic significance, coalition impact vector
5. `analysis/methodologies/political-style-guide.md` — Evidence density, attribution, intelligence writing depth levels
6. ALL 8 templates in `analysis/templates/`

### Rule 4: Multi-Framework Depth Required

Every analysis file MUST demonstrate:
- **≥ 3 evidence-backed claims** per analytical section (with EP document citations)
- **≥ 1 colour-coded Mermaid diagram** with real data (not placeholders)
- **Multi-perspective analysis** (Grand Coalition, opposition, citizens, EU institutions, international)
- **Cross-document pattern identification** (how this relates to other recent EP activity)
- **Forward-looking indicators** (what to watch next, with specific triggers)
- **At least 2 analytical frameworks** applied (e.g., SWOT + Risk, or Attack Tree + Kill Chain)

### Rule 5: ALWAYS Commit Analysis — No Workflow Run Wasted

Every agentic workflow run MUST produce and commit analysis artifacts to the `analysis/` folder. **No workflow run should ever be wasted** — even when no article is generated, the analysis work must be persisted.

| Scenario | Required Action |
|----------|----------------|
| Article generated | Include analysis artifacts in the article PR alongside `news/` files |
| No article (quiet period) | Create an **analysis-only PR** with collected data analysis instead of discarding work |
| Existing analysis found | **Improve, extend, correct, or complete** the existing analysis — never skip or overwrite blindly |
| Translation workflow | Perform translation coverage and terminology quality analysis |
| MCP server unavailable | Document the connection failure and any partial data in analysis; commit what was gathered |

**Enforcement checklist:**
- [ ] Analysis artifacts are included in `git add` alongside article files — never deleted before PR creation
- [ ] Raw MCP data files (`data/` subdirectories) may be cleaned to control PR size, but analysis markdown is ALWAYS committed
- [ ] On noop scenarios, create an analysis-only PR (`safeoutputs___create_pull_request`) instead of discarding analysis with `safeoutputs___noop`
- [ ] Before producing new analysis, check for existing analysis in `analysis/${ARTICLE_DATE}/${ARTICLE_TYPE_SLUG}/` and **improve/extend** it rather than replacing from scratch
- [ ] Every workflow references this guide (`analysis/methodologies/ai-driven-analysis-guide.md`) as the authoritative analysis protocol

**Anti-patterns (REJECTED):**
- ❌ `rm -rf analysis/` before PR creation — this destroys valuable intelligence
- ❌ `safeoutputs___noop` when analysis artifacts have been produced — use `safeoutputs___create_pull_request` for analysis-only PRs instead
- ❌ Ignoring existing analysis files — always read, evaluate, and improve them
- ❌ Skipping analysis because "there's no news" — analysis of quiet periods reveals patterns too

---

## 🏗️ Architecture: Per-File vs. Per-Day Analysis

### Why Per-File?

```mermaid
graph LR
    subgraph "❌ Old: Per-Day Batch Analysis"
        A1["Download 50 files"] --> A2["Script runs batch analysis"]
        A2 --> A3["Generic daily summary<br/>⚠️ Shallow, empty tables"]
        A3 --> A4["Merge conflicts<br/>when multiple workflows run"]
    end

    subgraph "✅ New: Per-File AI Analysis"
        B1["Download file X.json"] --> B2["AI reads methodology docs"]
        B2 --> B3["AI produces X.analysis.md<br/>✅ Deep, evidence-based"]
        B3 --> B4["No merge conflicts<br/>each file = independent"]
    end

    style A3 fill:#dc3545,color:#fff
    style A4 fill:#dc3545,color:#fff
    style B3 fill:#28a745,color:#fff
    style B4 fill:#28a745,color:#fff
```

| Dimension | Per-Day (Old) | Per-File (New) |
|-----------|:------------:|:--------------:|
| **Analysis depth** | Shallow (script-generated) | Deep (AI-driven, methodology-guided) |
| **Output quality** | Empty tables, generic text | SWOT.md-quality with Mermaid diagrams |
| **Merge conflicts** | Frequent (shared daily files) | None (each file independent) |
| **Coverage** | Session-based (misses files) | 100% (every downloaded file) |
| **Reusability** | Daily snapshot only | Persistent per-document intelligence |
| **Incremental** | Must re-run entire day | Only analyse new/changed files |

---

## 🔄 Analysis Pipeline

```mermaid
flowchart LR
    A["📥 EP MCP Download"] --> B["📋 Catalog<br/>pending files"]
    B --> C["📖 AI reads ALL<br/>methodology docs"]
    C --> D["🔍 Per-file deep analysis<br/>following template"]
    D --> E["💾 Save analysis<br/>alongside data"]
    E --> F["📊 Compose<br/>daily synthesis"]
    F --> G["📅 Weekly / Monthly<br/>aggregation"]

    style A fill:#0d6efd,color:#fff
    style C fill:#6f42c1,color:#fff
    style D fill:#28a745,color:#fff
    style F fill:#fd7e14,color:#fff
```

### Step-by-Step Protocol

| Step | Action | Reference | Output |
|:----:|--------|-----------|--------|
| 1 | **Read ALL methodology docs** before any analysis | `analysis/methodologies/*.md` (6 files) | Mental model of analytical framework |
| 2 | **Load data file** and extract key fields | Downloaded EP MCP JSON/response | Structured data extract |
| 3 | **Classify** — Sensitivity, domain, urgency | [political-classification-guide.md](political-classification-guide.md) | PUBLIC/SENSITIVE/RESTRICTED + domain code |
| 4 | **SWOT analysis** — Evidence-based quadrant assessment | [political-swot-framework.md](political-swot-framework.md) | 4-quadrant impact with citations |
| 5 | **Risk assessment** — 5×5 Likelihood × Impact | [political-risk-methodology.md](political-risk-methodology.md) | Risk scores per category |
| 6 | **Threat analysis** — Multi-framework (Threat Landscape + Attack Trees + Diamond Model) | [political-threat-framework.md](political-threat-framework.md) | Threat inventory |
| 7 | **Stakeholder impact** — 6-lens assessment | Template: [stakeholder-impact.md](../templates/stakeholder-impact.md) | Impact by stakeholder group |
| 8 | **Significance scoring** — 5-dimension composite | Template: [significance-scoring.md](../templates/significance-scoring.md) | Score 0–10 with publish decision |
| 9 | **Write per-file analysis** using template | [per-file-political-intelligence.md](../templates/per-file-political-intelligence.md) | `{id}.analysis.md` |
| 10 | **Quality gate** — Self-assess against checklist | Quality checklist below | Pass/Fail |

---

## 📋 Document-Type Analysis Focus

Different EP document types require different analytical emphasis. The AI agent must adapt its analysis based on the document type:

### EP Document Type → Primary Analysis Templates

| Document Type | MCP Data Category | Primary Templates | Key MCP Cross-Reference Tools |
|--------------|------------------|-------------------|-------------------------------|
| **Adopted texts** (legislative resolutions) | `adopted-texts/` | Political Classification + Risk Assessment | `get_voting_records`, `get_plenary_sessions` |
| **Committee documents** (reports, opinions) | `committee-documents/` | Stakeholder Impact + Risk Assessment | `get_committee_info`, `search_documents` |
| **Legislative procedures** | `procedures/` | Risk Assessment + SWOT Analysis | `track_legislation`, `get_procedure_events` |
| **Plenary votes** (roll-call) | `votes/` | Political Classification + SWOT + Threat Analysis | `get_voting_records`, `analyze_voting_patterns` |
| **Speeches** (plenary debates) | `speeches/` | Stakeholder Impact + Significance Scoring | `get_speeches`, `get_mep_details` |
| **Parliamentary questions** | `questions/` | Political Classification + Significance Scoring | `get_parliamentary_questions` |
| **Events** (hearings, conferences) | `events/` | Significance Scoring + Risk Assessment | `get_events`, `get_plenary_sessions` |
| **MEP profiles** | `meps/` | Stakeholder Impact + Political Classification | `get_mep_details`, `assess_mep_influence` |
| **MEP declarations** | `declarations/` | Threat Analysis (Disclosure) + Risk Assessment | `get_mep_declarations` |
| **Plenary documents** | `plenary-documents/` | All templates (comprehensive) | `get_plenary_documents`, `get_plenary_sessions` |
| **External documents** (Commission, Council) | `external-documents/` | SWOT + Risk Assessment | `get_external_documents` |
| **World Bank data** | `world-bank/` | Risk Assessment (economic) + SWOT | World Bank MCP tools |

### Document-Specific Analysis Depth

```mermaid
graph TD
    subgraph "📊 Analysis Depth by Document Type"
        direction TB
        L3["Level 3: Intelligence<br/>Adopted texts, Procedures,<br/>Committee reports"]
        L2["Level 2: Strategic<br/>Votes, Speeches,<br/>Questions, Events"]
        L1["Level 1: Surface<br/>Declarations, External docs,<br/>World Bank data"]
    end

    L3 --> Q3["Full 6-template analysis<br/>2000–5000 words<br/>≥10 citations"]
    L2 --> Q2["3–4 template analysis<br/>800–2000 words<br/>≥5 citations"]
    L1 --> Q1["2 template analysis<br/>200–800 words<br/>≥3 citations"]

    style L3 fill:#dc3545,color:#fff
    style L2 fill:#fd7e14,color:#fff
    style L1 fill:#28a745,color:#fff
```

---

## ⏱️ Time Budget & Prioritisation Protocol

### Time Budget Per File

Not all EP documents need the same analysis depth. Prioritise by document type:

| Document Type | Analysis Time Budget | Analysis Depth | Sections Required |
|--------------|:--------------------:|:--------------:|------------------|
| **Adopted texts** | 3–5 minutes | Full (all sections) | Classification + SWOT + Risk + Threat + Stakeholder + Forward |
| **Plenary votes** | 2–4 minutes | Full (all sections) | Classification + SWOT + Risk + Stakeholder + Forward |
| **Committee documents** | 2–3 minutes | Standard | Classification + SWOT + Risk + Forward |
| **Legislative procedures** | 2–3 minutes | Standard | Classification + Risk + Stakeholder + Forward |
| **Speeches** | 1–2 minutes | Quick | Classification + Stakeholder + Forward |
| **Parliamentary questions** | 1–2 minutes | Quick | Classification + Significance + Forward |
| **Events** | 1–2 minutes | Quick | Classification + Significance + Forward |
| **MEP profiles/declarations** | 1–2 minutes | Context | Classification + Stakeholder + Significance |
| **External documents** | 1–2 minutes | Context | Classification + Risk + SWOT |
| **World Bank data** | 1–2 minutes | Context | Classification + Economic context note |

### Prioritisation When Time-Constrained

When the workflow time budget is limited:

1. **Sort pending files by expected significance** — Adopted texts and votes first, then committee reports, then everything else
2. **Analyse highest-priority files first** — Complete full analysis for top-priority documents
3. **Quick-classify remaining files** — At minimum, assign classification level and significance score
4. **Stop at time limit** — Whatever is analysed is committed; remaining files are flagged as "pending" for next run

### Maximum Files Per Workflow Run

| Workflow | Typical Download | Analysis Target | Time Budget |
|----------|:----------------:|:---------------:|:-----------:|
| Breaking news | 1–5 files | All files (full depth) | 5 minutes |
| Committee reports | 5–20 files | All files (single type) | 8 minutes |
| Propositions | 5–15 files | All files (full depth) | 8 minutes |
| Motions | 10–30 files | Top 10 full + rest quick-classified | 10 minutes |
| Week in review | 50–200 files | Top 20 full + rest aggregated | 15 minutes |
| Month in review | 200–500 files | Top 30 full + rest aggregated | 20 minutes |
| Week ahead | 10–30 files | All files (forward-looking) | 10 minutes |
| Month ahead | 20–50 files | All files (strategic) | 12 minutes |

---

## 📄 Document-Type-Specific Analysis Focus Areas

### Adopted Texts (Legislative Resolutions, Positions)

Focus areas:
- **Coalition dynamics**: How did the political groups vote? Any surprising alliances?
- **Policy impact**: What changes for EU citizens, businesses, member states?
- **Trilogue outcome**: Did the EP position survive? What concessions were made?
- **Implementation timeline**: Transposition deadlines, phased implementation

### Committee Documents (Reports, Opinions)

Focus areas:
- **Committee vote splits**: Which political groups supported/opposed?
- **Rapporteur strategy**: How did the rapporteur build a majority?
- **Shadow rapporteur dynamics**: Cross-group negotiation patterns
- **Amendment adoption rate**: How many amendments survived?

### Legislative Procedures

Focus areas:
- **Pipeline stage**: Where is this in the EU legislative process?
- **Trilogue status**: Has trilogue started? How many rounds?
- **Timeline risk**: Is the procedure at risk of expiring before term ends?
- **Institutional tension**: EP vs. Council vs. Commission positions

### Plenary Votes (Roll-Call)

Focus areas:
- **Grand Coalition discipline**: Did EPP-S&D-Renew vote together?
- **ECR/PfE behavior**: Support, opposition, or abstention pattern?
- **Cross-party voting**: Unexpected alliances or defections?
- **Margin analysis**: Close vote = instability indicator

### Speeches (Plenary Debates)

Focus areas:
- **Rhetorical signals**: New policy positions announced? Tone shifts?
- **Accountability probes**: Commissioners challenged on record?
- **Consensus vs. confrontation**: Cross-group appeals or partisan rhetoric?
- **Media potential**: Quotable statements for news coverage?

### Parliamentary Questions

Focus areas:
- **Accountability pressure**: What are MEPs demanding answers on?
- **Commission responsiveness**: Timely and substantive responses?
- **Policy gaps**: Issues the Commission hasn't addressed?
- **Pattern detection**: Coordinated questioning campaigns across political groups?

---

## 🚫 Anti-Pattern Gallery

### ❌ Pattern 1: Scripted Boilerplate

```markdown
## Analysis
This document contains important legislative content. The European Parliament has
taken significant action. Further monitoring is recommended.
```

**Why rejected:** Zero analytical content. No evidence. No classification. No risk scoring. This is "scripted crap content" — the AI did not actually analyse the document.

### ✅ Correct Approach

```markdown
## 🎯 Executive Summary

The ENVI committee's adoption of the revised ETS extension report (PE-745.123/2026)
marks a critical inflection point in EU climate policy [HIGH confidence]. The 38–22
committee vote reveals a fracture in the EPP group (7 EPP members voted against their
group's official position per EP MCP voting data), creating a potential grand coalition
realignment on environmental legislation. Risk score: Coalition Stability L=3 × I=4 = 12
(🟠 HIGH) based on vote margin analysis and EPP internal dynamics.
```

### ❌ Pattern 2: Summary Without Structure

```markdown
Several things happened in the European Parliament this week. There were votes
on trade, environment, and defence matters. The political groups showed mixed
levels of unity.
```

**Why rejected:** No tables. No Mermaid diagrams. No evidence citations. No risk scores. No significance assessment.

### ✅ Correct Approach

Use the structured template with tables, Mermaid diagrams, evidence columns, and confidence labels for every section.

### ❌ Pattern 3: Overwriting Previous Analysis

A workflow running on Tuesday overwrites Monday's analysis file in the same location.

**Why rejected:** Destroys audit trail. Loses temporal context needed for trend detection. Violates isolation mandate.

### ✅ Correct Approach

Each workflow writes to its own directory: `analysis/{date}/{article-type-slug}/`. Monday's `news-breaking` writes to `analysis/2026-03-30/breaking/`, Tuesday's `news-committee-reports` writes to `analysis/2026-03-31/committee-reports/`. Never overwrite.

---

## ✅ Quality Gate Checklist

Before finalising any analysis artifact, the AI agent must verify:

### Structural Quality
- [ ] Hack23 header with logo and badge row present
- [ ] Document metadata complete (date, classification, workflow, confidence)
- [ ] At least 1 colour-coded Mermaid diagram included
- [ ] All sections use structured tables with evidence columns
- [ ] No placeholder text remains (`[REQUIRED]`, `[?]`, `{N}` all replaced)

### Analytical Quality
- [ ] Classification complete (sensitivity + domain + urgency)
- [ ] SWOT analysis has ≥ 2 entries per quadrant with evidence
- [ ] Risk assessment uses 5×5 matrix with specific scores (not generic "medium")
- [ ] Threat analysis uses multiple frameworks — includes attack trees, Diamond Model, or scenario planning
- [ ] Stakeholder impact covers all 6 lenses with specific assessments
- [ ] Significance score calculated with 5-dimension breakdown

### Evidence Quality
- [ ] Every factual claim has a source citation (EP document ID, MCP tool, or named source)
- [ ] Confidence levels stated for all non-factual claims
- [ ] No opinion-only entries in SWOT or risk tables
- [ ] Cross-references to related EP documents included
- [ ] MCP Data Files Used section present with specific file paths

### Writing Quality
- [ ] Written at appropriate depth level (1/2/3) per document type
- [ ] Active voice throughout
- [ ] EP-specific terminology used correctly
- [ ] No generic filler ("significant", "important", "various" without specifics)
- [ ] Multi-language friendly (no idioms, abbreviations spelled out)

### Score the Analysis (1–10)

| Dimension | Weight | Score |
|-----------|:------:|:-----:|
| Evidence density (citations per 100 words) | 0.25 | `[1-10]` |
| Analytical depth (beyond surface observation) | 0.25 | `[1-10]` |
| Structural compliance (tables, Mermaid, template adherence) | 0.20 | `[1-10]` |
| Actionable intelligence (forward indicators, probability assessments) | 0.15 | `[1-10]` |
| Political neutrality (no partisan conclusions) | 0.15 | `[1-10]` |

**Weighted Score Formula:** `Final = (Evidence × 0.25) + (Depth × 0.25) + (Structural × 0.20) + (Actionable × 0.15) + (Neutrality × 0.15)`

**Minimum passing score: 7.0/10.** Analysis scoring below 7.0 must be revised before consumption by downstream workflows.

---

## 🔄 Conflict Resolution for Parallel Workflows

When multiple agentic workflows run simultaneously:

### Isolation Rules

| Artifact Type | Isolation Strategy | Location |
|--------------|-------------------|----------|
| Per-file analysis | Inherently conflict-free (one file per document) | `analysis/{date}/{article-type-slug}/data/{id}.analysis.md` |
| Workflow-specific analysis | Per-workflow directory | `analysis/{date}/{article-type-slug}/` |
| Daily synthesis | Last-write-wins (later workflows produce better synthesis) | `analysis/{date}/synthesis-summary.md` |
| AI-driven cross-article analysis | Date root (shared across workflows) | `analysis/{date}/ai-*.md` |
| Weekly aggregation | Composed from daily analyses, not workflow outputs | `analysis/weekly/YYYY-WNN/` |

### Critical Rule: Never Overwrite Another Workflow's Analysis

```
✅ news-breaking   → analysis/2026-03-30/breaking/
✅ news-weekly-review → analysis/2026-03-30/weekly-review/
✅ news-committee-reports → analysis/2026-03-30/committee-reports/
❌ news-breaking overwrites news-weekly-review output → PROHIBITED
```

---

## 📚 Methodology Documents (AI Must Read Before Analysing)

| Priority | Document | Key Content |
|:--------:|----------|-------------|
| 🔴 1 | [political-swot-framework.md](political-swot-framework.md) | Evidence hierarchy, confidence levels, temporal decay, aggregation |
| 🔴 2 | [political-risk-methodology.md](political-risk-methodology.md) | 5×5 Likelihood × Impact matrix, coalition risk index |
| 🔴 3 | [political-threat-framework.md](political-threat-framework.md) | Multi-framework threat analysis: Threat Landscape + Attack Trees + Diamond Model + PESTLE |
| 🟠 4 | [political-classification-guide.md](political-classification-guide.md) | Sensitivity levels, domain taxonomy, urgency matrix |
| 🟠 5 | [political-style-guide.md](political-style-guide.md) | Writing standards, evidence density, depth levels, attribution |
| 🟠 6 | This document | Per-file protocol, quality gates, anti-patterns |

---

## 🔗 Related Documents

- [templates/per-file-political-intelligence.md](../templates/per-file-political-intelligence.md) — Per-file output template
- [templates/synthesis-summary.md](../templates/synthesis-summary.md) — Daily synthesis template
- [SWOT.md](../../SWOT.md) — Platform SWOT (**formatting exemplar**)
- [THREAT_MODEL.md](../../THREAT_MODEL.md) — Platform threat model (**formatting exemplar**)

---

**Document Control:**
- **Path:** `/analysis/methodologies/ai-driven-analysis-guide.md`
- **Classification:** Public
- **Next Review:** 2026-06-30
