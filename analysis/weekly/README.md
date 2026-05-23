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
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
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
