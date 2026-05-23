<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📅 Daily Analysis Directory — European Parliament</h1>

<p align="center">
  <strong>📊 Per-Day Analysis Artifacts from Agentic Workflows</strong><br>
  <em>🎯 YYYY-MM-DD naming · Per-article-type isolation · Never overwrite</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--30-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-03-30 (UTC)
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🎯 Purpose

The `analysis/daily/` directory stores per-day analysis artifacts produced by EU Parliament Monitor's agentic workflows. Each day, each workflow creates its own isolated subdirectory. These are **intermediate products** that feed into article generation and weekly aggregation.

---

## 📅 Directory Structure

```
analysis/daily/
├── YYYY-MM-DD/                        ← ISO 8601 date (always zero-padded)
│   ├── breaking/                      ← news-breaking workflow output
│   │   ├── classification/
│   │   ├── risk-scoring/
│   │   ├── threat-assessment/
│   │   ├── data/                      ← MCP data for this workflow
│   │   └── synthesis-summary.md
│   ├── committee-reports/             ← news-committee-reports workflow output
│   │   ├── classification/
│   │   ├── risk-scoring/
│   │   ├── threat-assessment/
│   │   ├── data/
│   │   └── synthesis-summary.md
│   ├── week-in-review/                ← news-weekly-review workflow output
│   │   └── ...
│   ├── week-ahead/                    ← news-week-ahead workflow output
│   │   └── ...
│   └── ai-*.md                        ← Cross-workflow AI synthesis (shared)
```

### Critical Rules

1. **Never overwrite another workflow's analysis.** Each workflow writes only to its own `{article-type-slug}/` directory.
2. **Always use `YYYY-MM-DD`** — never `DD-MM-YYYY`, `MM/DD/YYYY`, or named months.
3. **Zero-pad** day and month: `2026-03-05` not `2026-3-5`.
4. **AI synthesis files** (`ai-*.md`) live at the date root because they synthesise across workflows.
5. **MCP data** is scoped per-workflow under `{article-type-slug}/data/`.

---

## 🔗 Workflow → Directory Mapping

| Workflow | Article Type Slug | Output Directory |
|----------|-------------------|------------------|
| `news-breaking` | `breaking` | `analysis/daily/YYYY-MM-DD/breaking/` |
| `news-committee-reports` | `committee-reports` | `analysis/daily/YYYY-MM-DD/committee-reports/` |
| `news-propositions` | `propositions` | `analysis/daily/YYYY-MM-DD/propositions/` |
| `news-motions` | `motions` | `analysis/daily/YYYY-MM-DD/motions/` |
| `news-week-ahead` | `week-ahead` | `analysis/daily/YYYY-MM-DD/week-ahead/` |
| `news-weekly-review` | `week-in-review` | `analysis/daily/YYYY-MM-DD/week-in-review/` |
| `news-month-ahead` | `month-ahead` | `analysis/daily/YYYY-MM-DD/month-ahead/` |
| `news-monthly-review` | `month-in-review` | `analysis/daily/YYYY-MM-DD/month-in-review/` |
| `news-article-generator` | `article-generator` | `analysis/daily/YYYY-MM-DD/article-generator/` |

---

## 🗑️ Retention Policy

| Age | Status | Storage |
|-----|--------|---------|
| 0–30 days | **Active** | Full git history |
| 31–90 days | **Recent** | Retained; weekly aggregation is primary reference |
| 91+ days | **Archive** | External storage; not required in working tree |

---

**Document Control:**
- **Path:** `/analysis/daily/README.md`
- **Classification:** Public
- **Next Review:** 2026-06-30
