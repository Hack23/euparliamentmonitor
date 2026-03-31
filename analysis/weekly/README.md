<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📅 Weekly Analysis Directory — European Parliament</h1>

<p align="center">
  <strong>📊 Per-Week Aggregated Analysis from Daily Agentic Workflow Artifacts</strong><br>
  <em>🎯 YYYY-WNN ISO naming · Week-ahead intelligence · Aggregated risk & SWOT</em>
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

The `analysis/weekly/` directory stores weekly aggregated analysis artifacts. Each week that `news-week-ahead` or `news-weekly-review` runs, a new subdirectory is created using the ISO 8601 week number format `YYYY-WNN`. Weekly artifacts aggregate the week's daily analyses into strategic intelligence for the upcoming EP session week.

---

## 📅 Naming Convention

```
analysis/weekly/
├── YYYY-WNN/           ← ISO 8601 week number (zero-padded)
│   ├── week-summary-swot.md
│   ├── week-ahead-risk-register.md
│   ├── week-significance-trends.md
│   └── week-ahead-calendar.md
```

**Rules:**
- Always use `YYYY-WNN` — zero-pad: `2026-W03` not `2026-W3`
- ISO 8601 weeks start **Monday**, end **Sunday**
- Never use locale-specific week numbering

---

## 📁 Files Created Per Week

| File | Purpose | Source Data |
|------|---------|-------------|
| `week-summary-swot.md` | Aggregated SWOT from the week's daily artifacts | Daily SWOT analyses merged and deduplicated |
| `week-ahead-risk-register.md` | Forward-looking risk register for the coming EP plenary week | Daily risk snapshots + EP plenary calendar |
| `week-significance-trends.md` | Trending EU political topics by significance score | Daily significance scores aggregated |
| `week-ahead-calendar.md` | Key EP events, votes, and committee meetings for the coming week | EP MCP `get_plenary_sessions`, `get_events` |

---

## 🔗 Aggregation Flow

```mermaid
flowchart TD
    D1["Mon daily artifacts"] --> AGG
    D2["Tue daily artifacts"] --> AGG
    D3["Wed daily artifacts"] --> AGG
    D4["Thu daily artifacts"] --> AGG
    D5["Fri daily artifacts"] --> AGG

    AGG["news-week-ahead<br/>Aggregation"] --> W1["week-summary-swot.md"]
    AGG --> W2["week-ahead-risk-register.md"]
    AGG --> W3["week-significance-trends.md"]
    AGG --> W4["week-ahead-calendar.md"]

    W1 --> PUB["Weekly News Article<br/>+ 14-language publication"]
```

---

## 🗑️ Retention Policy

| Age | Status |
|-----|--------|
| 0–12 weeks | **Active** — all files present |
| 13–26 weeks | **Recent** — monthly aggregation is primary reference |
| 27+ weeks | **Archive** — external archival |

---

**Document Control:**
- **Path:** `/analysis/weekly/README.md`
- **Classification:** Public
- **Next Review:** 2026-06-30
