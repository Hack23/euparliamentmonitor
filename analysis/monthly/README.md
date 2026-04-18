<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📅 Monthly Analysis Directory — European Parliament</h1>

<p align="center">
  <strong>📊 Monthly Strategic Intelligence Briefs for EU Parliamentary Monitoring</strong><br>
  <em>🎯 YYYY-MM naming · Strategic intelligence · Long-term pattern analysis</em>
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

The `analysis/monthly/` directory stores monthly strategic intelligence briefs — the **highest-level analytical synthesis** in the EU Parliament Monitor analysis hierarchy. These aggregate all weekly analyses into strategic assessments with a 30-day horizon.

Monthly briefs serve:
1. **Strategic intelligence**: Month-over-month pattern analysis for EU political dynamics
2. **Archive anchor**: Canonical record as daily/weekly files age out
3. **Trend baseline**: Baselines against which future months are compared

---

## 📅 Naming Convention

```
analysis/monthly/
├── YYYY-MM/              ← ISO 8601 year-month (zero-padded)
│   ├── monthly-intelligence-brief.md
│   ├── monthly-swot-consolidated.md
│   ├── monthly-risk-register.md
│   ├── monthly-significance-report.md
│   └── monthly-threat-landscape.md
```

---

## 📁 Files Created Per Month

| File | Purpose | Source Data |
|------|---------|-------------|
| `monthly-intelligence-brief.md` | Executive strategic analysis; top 5 EP political developments | Weekly SWOT + risk register |
| `monthly-swot-consolidated.md` | Full SWOT synthesis with confidence decay applied | Weekly SWOT files; expired entries removed |
| `monthly-risk-register.md` | Complete risk register with trajectories (rising/stable/falling) | Weekly risk registers with trend analysis |
| `monthly-significance-report.md` | Top 10 most significant EU political events of the month | Daily significance scores for the month |
| `monthly-threat-landscape.md` | Multi-framework threat inventory (Threat Landscape + Attack Trees + Diamond Model) | Daily threat assessments for the month |

---

## 📊 Aggregation Flow

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    W1["Week 1 weekly artifacts"] --> MAGG
    W2["Week 2 weekly artifacts"] --> MAGG
    W3["Week 3 weekly artifacts"] --> MAGG
    W4["Week 4 weekly artifacts"] --> MAGG

    MAGG["End-of-month aggregation"] --> M1["monthly-intelligence-brief.md"]
    MAGG --> M2["monthly-swot-consolidated.md"]
    MAGG --> M3["monthly-risk-register.md"]
    MAGG --> M4["monthly-significance-report.md"]
    MAGG --> M5["monthly-threat-landscape.md"]
```

---

## 🗑️ Retention Policy

| Age | Status |
|-----|--------|
| 0–6 months | **Active** — regularly referenced |
| 7–12 months | **Recent** — primary historical reference |
| 13+ months | **Long-term archive** |

---

**Document Control:**
- **Path:** `/analysis/monthly/README.md`
- **Classification:** Public
- **Next Review:** 2026-06-30
