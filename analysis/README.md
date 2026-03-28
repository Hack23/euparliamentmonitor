<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔬 EU Parliament Monitor — Analysis Directory</h1>

<p align="center">
  <strong>📊 Intermediate Analysis Artifacts for Agentic Political Intelligence Workflows</strong><br>
  <em>🎯 Daily · Templates · Methodologies · Full Data Analysis</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--28-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-03-28 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-06-28
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

The `analysis/` directory stores **intermediate analysis artifacts** produced and consumed by EU Parliament Monitor's agentic workflows. These artifacts bridge raw European Parliament data (sourced via the European Parliament MCP Server) and the final published political intelligence articles, news summaries, and dashboards.

Analysis artifacts are **not** final content — they are structured intermediate products that enable:

- 🔄 **Workflow composition**: Upstream agents deposit analysis; downstream agents consume it
- 📐 **Consistent methodology**: Templates enforce analytical rigor across 14 languages
- 📊 **Full data analysis**: Every downloaded MCP file receives comprehensive analysis
- 🧠 **Reusable intelligence**: Cross-workflow pattern sharing and knowledge accumulation
- 🎯 **Quality assurance**: Structured templates enable validation before article generation
- 🔀 **Merge conflict avoidance**: Single date-level directory shared by all workflows

---

## 📁 Directory Structure

```
analysis/
├── README.md                          ← This file
├── methodologies/                     ← Detailed methodology guides
│   ├── political-classification-guide.md  ← 7-dimension EP event classification
│   ├── political-risk-methodology.md      ← Likelihood × Impact scoring for EP
│   ├── political-threat-framework.md      ← STRIDE-adapted democratic threat framework
│   └── political-swot-framework.md        ← Evidence-based SWOT for EP landscape
├── templates/                         ← Reusable analysis templates (AI fills these)
│   ├── political-classification.md    ← Event classification template
│   ├── risk-assessment.md             ← Political risk template
│   ├── threat-analysis.md             ← STRIDE-inspired threat template
│   ├── swot-analysis.md               ← SWOT quadrant template
│   ├── stakeholder-impact.md          ← Stakeholder impact template
│   └── significance-scoring.md        ← Significance scoring template
├── YYYY-MM-DD/                        ← Date-stamped analysis output (shared by all workflows)
│   ├── manifest.json                  ← Run metadata (methods, timing, confidence)
│   ├── classification/                ← Political classification results
│   │   ├── significance-assessment.md
│   │   ├── impact-matrix.md
│   │   ├── actor-mapping.md
│   │   └── forces-analysis.md
│   ├── threat-assessment/             ← Threat analysis results
│   │   ├── political-stride-assessment.md
│   │   ├── actor-threat-profiles.md
│   │   ├── consequence-trees.md
│   │   └── legislative-disruption.md
│   ├── risk-scoring/                  ← Risk assessment results
│   │   ├── risk-matrix.md
│   │   ├── political-capital-risk.md
│   │   ├── quantitative-swot.md
│   │   ├── legislative-velocity-risk.md
│   │   └── agent-risk-workflow.md
│   ├── existing/                      ← Existing analysis method outputs
│   │   ├── deep-analysis.md
│   │   ├── stakeholder-analysis.md
│   │   ├── coalition-analysis.md
│   │   ├── voting-patterns.md
│   │   └── cross-session-intelligence.md
│   ├── documents/                     ← Per-document analysis (when enabled)
│   │   └── document-analysis-index.md
│   └── data/                          ← Persistent MCP data repository
│       ├── adopted-texts/             ← EP adopted legislative texts
│       ├── committee-documents/       ← Committee reports and opinions
│       ├── corporate-bodies/          ← EP institutional bodies data
│       ├── declarations/              ← MEP financial declarations
│       ├── events/                    ← EP calendar events
│       ├── external-documents/        ← Council positions, Commission proposals
│       ├── mcp-responses/             ← Raw MCP tool call responses
│       ├── meps/                      ← MEP profiles and mandates
│       ├── osint/                     ← OSINT analytical outputs
│       │   ├── political-landscape.json
│       │   ├── voting-anomalies.json
│       │   ├── coalition-dynamics.json
│       │   ├── early-warning.json
│       │   └── legislative-pipeline.json
│       ├── plenary-documents/         ← Plenary session documents
│       ├── plenary-session-documents/ ← Session agendas and minutes
│       ├── procedures/                ← Legislative procedures
│       ├── questions/                 ← Parliamentary questions
│       ├── speeches/                  ← Plenary speeches
│       ├── votes/                     ← Voting records
│       └── world-bank/                ← World Bank economic indicators
```

---

## 🤖 Full Data Analysis Mandate

> **⚠️ CRITICAL**: Analysis MUST be performed for **every file downloaded** from MCP sources — not per session, not per day summary, but for **every individual piece of content**. This ensures:

1. **Complete coverage**: No downloaded document goes unanalysed
2. **Merge conflict avoidance**: All workflows write to `analysis/{date}/` (no per-article-type scoping)
3. **Full traceability**: Every analysis artifact traces back to specific MCP data files

### AI Agent Analysis Requirements

When running analysis, the AI agent (Opus) MUST:

1. **Read ALL methodology guides** in `analysis/methodologies/` before starting
2. **Read ALL templates** in `analysis/templates/` to understand output format
3. **Process EVERY downloaded file** in `analysis/{date}/data/` systematically
4. **Apply the full template** for each analysis type — no shortcuts or summaries
5. **Cross-reference** data across categories (e.g., voting records ↔ MEP profiles ↔ procedures)
6. **Cite evidence** with specific EP document IDs, procedure references, or MCP tool calls

### Template Selection by Data Category

| MCP Data Category | Primary Template | Supporting Templates |
|------------------|-----------------|---------------------|
| `adopted-texts/` | Political Classification + Risk Assessment | Significance Scoring |
| `committee-documents/` | Stakeholder Impact + Risk Assessment | Political Classification |
| `procedures/` | Risk Assessment + SWOT Analysis | Significance Scoring |
| `votes/` | Political Classification + SWOT | Threat Analysis |
| `speeches/` | Stakeholder Impact + Significance Scoring | Political Classification |
| `questions/` | Political Classification | Significance Scoring |
| `events/` | Significance Scoring | Risk Assessment |
| `meps/` | Stakeholder Impact | Political Classification |
| `declarations/` | Threat Analysis (I-Disclosure) | Risk Assessment |
| `plenary-documents/` | Political Classification + Risk Assessment | All templates |
| `osint/` | SWOT Analysis + Threat Analysis | Risk Assessment |
| `world-bank/` | Risk Assessment (economic dimension) | SWOT Analysis |

---

## 📐 Template Usage Guide

### Using a Template

1. **Read** the methodology guide in `analysis/methodologies/` for context
2. **Copy** the template structure from `analysis/templates/`
3. **Fill** all `[REQUIRED]` fields with evidence from MCP data
4. **Complete** `[OPTIONAL]` fields where evidence is available
5. **Validate** against the methodology guide before writing output

### Template Quick Reference

| Template | When to Use | Key Output |
|----------|-------------|------------|
| `political-classification.md` | New EP event or document arrives | Sensitivity + urgency + domain classification |
| `risk-assessment.md` | Coalition/policy/institutional risk spike | Risk scores + mitigation map |
| `threat-analysis.md` | STRIDE-format democratic threat review | Threat inventory + actor mapping |
| `swot-analysis.md` | Strategic political landscape assessment | Quadrant entries with EP evidence |
| `stakeholder-impact.md` | Policy decision or legislative action | Impact by stakeholder group |
| `significance-scoring.md` | Deciding what to publish/prioritise | Composite score → publish/skip |

---

## 📅 Naming Conventions

| Scope | Format | Example | Description |
|-------|--------|---------|-------------|
| Daily | `YYYY-MM-DD` | `2026-03-28/` | ISO 8601 calendar date |
| Ad-hoc | descriptive | `coalition-risk/` | Named topic directories when needed |

**Rules:**
- All directory names use ISO 8601 dates
- Never use locale-specific date formats
- All workflows share a single date-level directory (no per-article-type subdirectories)

---

## 🤖 Workflow Integration

All 9 agentic news workflows write analysis artifacts to `analysis/{date}/` before article generation:

| Workflow | Primary Output | Key MCP Data |
|----------|---------------|-------------|
| `news-week-ahead` | Week-ahead prospective articles | Events, procedures, plenary sessions |
| `news-weekly-review` | Week-in-review retrospective | Adopted texts, votes, speeches |
| `news-month-ahead` | Month-ahead strategic outlook | Procedures, events, committee docs |
| `news-monthly-review` | Month-in-review comprehensive | All data categories |
| `news-breaking` | Breaking news articles | Feed endpoints, voting anomalies |
| `news-committee-reports` | Committee report analysis | Committee documents, procedures |
| `news-propositions` | Legislative proposition analysis | Procedures, adopted texts |
| `news-motions` | Parliamentary motion analysis | Procedures, votes, MEP data |
| `news-article-generator` | Generic article generation | All data categories |

---

## 📚 Related Documentation

- [📐 docs/analysis-methodology/](../docs/analysis-methodology/) — Higher-level methodology guides for article generation
- [📐 ARCHITECTURE.md](../ARCHITECTURE.md) — System architecture overview
- [🧠 MINDMAP.md](../MINDMAP.md) — Conceptual relationship map
- [🔄 FLOWCHART.md](../FLOWCHART.md) — Data flow diagrams
- [🛡️ THREAT_MODEL.md](../THREAT_MODEL.md) — Platform threat analysis
- [💼 SWOT.md](../SWOT.md) — Platform strategic analysis
- [🔐 SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md) — Security controls

---

**Document Control:**
- **Repository:** https://github.com/Hack23/euparliamentmonitor
- **Path:** `/analysis/README.md`
- **Format:** Markdown
- **Classification:** Public
- **Next Review:** 2026-06-28
