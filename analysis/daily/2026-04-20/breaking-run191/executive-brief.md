<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Executive Brief — Run 191 | 2026-04-20

**Classification:** OSINT | Public Parliamentary Record
**Confidence:** 🔴 Low (retrospective back-fill — synthesised from in-tree article and sibling artifacts; not a re-analysis)
**Generated:** 2026-04-20T00:00:00Z (retrospective brief)
**Article Type:** breaking
**Source folder:** `analysis/daily/2026-04-20/breaking-run191`
**Source:** European Parliament Open Data Portal

---

## 🎯 BLUF

**The EP API's metadata layer has fully restored** — after three consecutive count regressions (104→101→100 across Runs 188-190), the count returned to 104 in Run 191. Four previously invisible texts are now confirmed in the index: EU-Bosnia Frontex agreement, Human Rights Annual Report 2025, Jimmy Lai conviction statement, and Ukraine Facility amendment. This is the **first positive API health signal since the outage began April 11** and upgrades the probability of full content restoration before Parliament returns April 27 from 40% to **50%**.

---

## 🧭 3 Decisions This Brief Supports

| # | Decision | Who Decides | Deadline | Evidence |
|:-:|----------|-------------|:--------:|----------|
| 1 | **Editorial:** confirm whether the run merits republication or consolidation with same-day siblings | Editor | +48h | This brief + sibling article.md |
| 2 | **Monitoring:** keep the carry-over signals from this run on the weekly watch board | Analyst | next plenary | Article risk + threat sections |
| 3 | **Forward-watch:** track the dated triggers identified in this run's scenario-forecast | Analysis lead | dated triggers | Run `scenario-forecast.md` |

---

## 📰 60-Second Read

- 🔴 **Run classification:** ROUTINE. (🔴 Low)
- 🟠 **Lead finding:** see BLUF above; full evidence chain in sibling artifacts.
- 🟢 **Procedure references identified:** TA-10-2026-0011, TA-10-2026-0014, TA-10-2026-0018, TA-10-2026-0036, TA-10-2026-0090.
- 🟡 **Confidence:** 🔴 Low — retrospective synthesis; no new MCP calls.
- 🔵 **Economic context:** see `economic-context.md` in run folder if present.
- 🟣 **Cross-reference:** see same-date sibling runs for triangulation.
- 🩷 **Disruption vector:** see `political-threat-landscape.md` if present.
- ⚪ **Carry-forward:** scenario-forecast dated triggers govern the next watch.

---

## 🗂️ Top Documents / Procedures Table

| Rank | EP reference | Title (short) | Confidence |
|:----:|--------------|---------------|:----------:|
| 1 | TA-10-2026-0011 | (see source artifacts) | 🟡 MEDIUM |
| 2 | TA-10-2026-0014 | (see source artifacts) | 🟡 MEDIUM |
| 3 | TA-10-2026-0018 | (see source artifacts) | 🟡 MEDIUM |
| 4 | TA-10-2026-0036 | (see source artifacts) | 🟡 MEDIUM |
| 5 | TA-10-2026-0090 | (see source artifacts) | 🟡 MEDIUM |

---

## ⚠️ Risk & Threat Snapshot

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#1565C0",
    "quadrant2Fill": "#2E7D32",
    "quadrant3Fill": "#FF9800",
    "quadrant4Fill": "#D32F2F",
    "quadrantTitleFill": "#ffffff",
    "quadrantPointFill": "#ffffff",
    "quadrantPointTextFill": "#ffffff",
    "quadrantXAxisTextFill": "#ffffff",
    "quadrantYAxisTextFill": "#ffffff"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 14,
    "titleFontSize": 22,
    "quadrantLabelFontSize": 18,
    "xAxisLabelFontSize": 16,
    "yAxisLabelFontSize": 16
  }
}}%%
quadrantChart
    title 🎯 EP Parliament Risk Matrix (Run 191)
    x-axis "Low Impact" --> "High Impact"
    y-axis "Low Probability" --> "High Probability"
    quadrant-1 "🔵 Manage Closely"
    quadrant-2 "🟢 Key Players"
    quadrant-3 "🟠 Monitor"
    quadrant-4 "🔴 Keep Informed"
    "🚨 USTR Section 301": [0.75, 0.22]
    "🚨 API Content Blockage": [0.70, 0.85]
    "🏛️ Coalition Instability": [0.60, 0.15]
    "⚖️ BRRD3 Council Delay": [0.55, 0.35]
    "📋 Housing Initiative Gap": [0.45, 0.55]
    "⏰ EP Return Readiness": [0.30, 0.90]
```

| Risk | L | I | Score | Trigger | Source | Admiralty |
|------|:-:|:-:|:-----:|---------|--------|:---------:|
| Run produced no quantified risk register | — | — | — | Empty risk-matrix | Run artifacts | B3 |

---

## 🔮 Top Forward Trigger

See `scenario-forecast.md` / `forward-indicators.md` in the run folder for dated trigger events. Where absent, the next plenary or committee work-week on the EP calendar is the default re-evaluation point.

---

## 🛡️ Source Quality Assessment

- **Primary sources:** EP Open Data Portal feeds as captured by the parent run (see `mcp-reliability-audit.md` if present).
- **Data limitations:** Retrospective back-fill — no new MCP probing. Brief reflects the article and artifact state at run time.
- **Confidence:** 🔴 Low.

## 🧩 Synthesis Excerpt (from `synthesis-summary.md`)

The API's two-phase recovery pattern is now empirically confirmed. Phase 1 (metadata) is complete. Phase 2 (content) is expected within 1-3 days based on historical EP API recovery patterns. If content restores by April 23-24, there is a 4-day window for comprehensive substantive coverage before Parliament returns.

The restoration of TA-10-2026-0018 (Jimmy Lai, Jan 22) creates a new analytical lens: Parliament's China strategy operates on a two-track system where human rights condemnations (January) and trade quota modifications (March) run in parallel but independent tracks. The Ukraine Facility amendment (Feb 11) confirms concurrent EU global engagement — supporting Ukraine militarily while trading with China and condemning human rights violations.

---

## 📎 Links

| Link | Path |
|------|------|
| Article | `./article.md` |
| Manifest | `./manifest.json` |
| Sibling runs | `analysis/daily/2026-04-20/` |

---

**Document Control**
- **Template:** `/analysis/templates/executive-brief.md`
- **Artifact path:** `analysis/daily/2026-04-20/breaking-run191/executive-brief.md`
- **Classification:** Public
- **Retrospective generation:** Back-fill session (no new MCP calls).
