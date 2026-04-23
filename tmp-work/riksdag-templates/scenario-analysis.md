<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔮 Scenario Analysis Template</h1>

<p align="center">
  <strong>📊 Structured Future-State Analysis: Base · Upside · Downside · Wildcard</strong><br>
  <em>🎯 Probability-Weighted · Trigger-Conditioned · Decision-Supporting</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-0A66C2?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--21-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-04-21 (UTC)
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template instructions:** Produce on every run and save as `analysis/daily/${ARTICLE_DATE}/${DOC_TYPE}/scenario-analysis.md`. On lighter days, keep the scenario set concise but still complete; when a day's documents carry multi-path uncertainty or the run includes P0/P1-significance material, expand the analysis depth, evidence, and trigger detail. Uses the 5-level confidence scale and DIW weighting defined in [ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md).

> **✨ What to produce:** Four named scenarios (Base, Upside, Downside, Wildcard), each with explicit probability, trigger conditions, early warning signals, and a decision-playbook paragraph. Probabilities sum to 100%.

---

## 🔄 Tradecraft Context

| Field | Value |
|-------|-------|
| **F3EAD stage** | `Analyze / Disseminate` |
| **PIRs** | `list the priority intelligence requirements this scenario set answers` |
| **Admiralty floor** | `B2 for trigger conditions; A1 for anchor evidence from primary MCP sources` |
| **SATs used** | `Alternative Futures Analysis; Key Assumptions Check; Indicators & Signposts; Premortem` |
| **ICD 203 standards applied** | `uncertainty, alternative analysis, confidence, argumentation, customer relevance` |

> See [`political-style-guide.md`](../methodologies/political-style-guide.md) for canonical F3EAD / PIR catalog / Admiralty Code / ICD 203 / WEP / SATs definitions.

---

## 📋 Scenario Context

| Field | Value |
|-------|-------|
| **Scenario ID** | `SCN-YYYY-MM-DD-NNN` |
| **Generated** | `YYYY-MM-DD HH:MM UTC` |
| **Question** | `e.g., "Will the September 2026 election return the current coalition?"` |
| **Time horizon** | `e.g., 2026-09-13 (election day) / 6-month / 12-month` |
| **Decision supported** | `e.g., "Editorial coverage weight through Q3 2026"` |
| **Source documents** | `list of dok_ids` |
| **Overall Confidence** | `🟦 VERY HIGH / 🟩 HIGH / 🟧 MEDIUM / 🟥 LOW / ⬛ VERY LOW` — pair with WEP probability term (e.g., "likely / about even / unlikely") per [political-style-guide.md](../methodologies/political-style-guide.md) |

---

## 🧭 Scenario Quadrant

```mermaid
quadrantChart
    title Scenario Probability × Impact (y-coordinate ≈ probability; x-coordinate ≈ relative impact)
    x-axis Low Impact --> High Impact
    y-axis Low Probability --> High Probability
    quadrant-1 Plan For
    quadrant-2 Prepare Resilience
    quadrant-3 Monitor
    quadrant-4 Consider Opportunistically
    "🟢 Base: Coalition holds (40%)": [0.55, 0.40]
    "🟡 Upside: Opposition wins cleanly (25%)": [0.75, 0.25]
    "🟠 Downside: Hung result (25%)": [0.80, 0.25]
    "🔴 Wildcard: Mid-cycle crisis (10%)": [0.90, 0.10]
```

---

## 📊 Scenario Set

> [!WARNING]
> **Illustrative example — replace before publishing.** The quadrant, the four scenarios below, every probability, every named actor/committee/dok_id, every trigger condition, and every early-warning signal are worked-example values from a prior reference run. Replace them with run-specific scenario content (or explicitly reuse and re-justify them) before committing this file.

### 🟢 Scenario A — Base Case (probability **40 %**)

| Field | Value |
|-------|-------|
| **Name** | Base — Coalition holds with SD confidence & supply |
| **Probability** | 40 % (confidence 🟩 HIGH) |
| **Headline** | Kristersson government retains office with modified mandate |
| **Trigger conditions** | Coalition + SD sustain ≥ 47 % polling through August 2026; no crisis event |
| **Early warning signals** | (a) cost-of-living package lands within voter segments 1 & 2 by July; (b) no major KU scandal; (c) SD keeps confidence posture |
| **Outcome on key dimensions** | Budget continuity, justice agenda continues, climate pace moderated |
| **Decision implication** | Editorial: maintain standard coverage weighting; prepare for post-election budget continuity scenario |

### 🟡 Scenario B — Upside (probability **25 %**)

| Field | Value |
|-------|-------|
| **Name** | Upside — S-led opposition wins outright |
| **Probability** | 25 % (WEP: "unlikely" — confidence 🟧 MEDIUM); roughly level with Scenario C |
| **Headline** | Social Democrats return with C + MP partners |
| **Trigger conditions** | Opposition block polls ≥ 52 % by Aug 2026; ULA (unemployment-linked affordability) narrative dominates |
| **Early warning signals** | (a) Q2 2026 SIFO gap ≥ 6 points; (b) SCB AKU June unemployment > 8.6 %; (c) EU-Commission rebuke on fuel-tax cut |
| **Outcome on key dimensions** | Budget redirection to welfare; green-transition acceleration; migration policy recalibration |
| **Decision implication** | Editorial: prepare policy-pivot coverage; commission expert-panel content on transition continuity |

### 🟠 Scenario C — Downside (probability **25 %**)

| Field | Value |
|-------|-------|
| **Name** | Downside — Hung parliament / protracted formation |
| **Probability** | 25 % (WEP: "unlikely" — confidence 🟧 MEDIUM); roughly level with Scenario B |
| **Headline** | No bloc reaches 175 seats; multi-week government formation |
| **Trigger conditions** | No bloc > 48 % in final polls; SD shifts position during campaign |
| **Early warning signals** | (a) fragmented polling by late July; (b) leadership challenges in smaller parties; (c) late-campaign defections |
| **Outcome on key dimensions** | Interim government; budget via caretaker rules; institutional stress |
| **Decision implication** | Editorial: activate constitutional-crisis playbook; commission KU + Statsrätt analyses; boost capacity |

### 🔴 Scenario D — Wildcard (probability **10 %**)

| Field | Value |
|-------|-------|
| **Name** | Wildcard — Mid-cycle crisis (scandal / external shock / health event) |
| **Probability** | 10 % (WEP: "very unlikely" — confidence 🟥 LOW) |
| **Headline** | External event reshapes the race |
| **Trigger conditions** | One of: major KU reprimand, Riksbank crisis action, NATO escalation, public-health emergency |
| **Early warning signals** | (a) unusual opinion-poll volatility; (b) government-agency resignations; (c) regional escalations |
| **Outcome on key dimensions** | Unpredictable; likely short-term rally-around-the-flag then realignment |
| **Decision implication** | Editorial: pre-draft crisis explainers; maintain rapid-response editorial shift capacity |

**Probability check: 40 + 25 + 25 + 10 = 100 %** ✅

---

## 🧩 Drivers & Dependencies

| Driver | Current signal | Confidence | Scenarios affected |
|--------|----------------|:----------:|--------------------|
| GDP growth trajectory (SCB + IMF WEO) | +0.82 % 2024, +1.8 % 2026 proj | 🟦 VERY HIGH | A, B, C |
| SIFO/Novus polling gap | −4 pt government disadvantage Apr 2026 | 🟩 HIGH | A, B, C |
| SD confidence-supply posture | Stable through FiU48 | 🟩 HIGH | A, C |
| EU-Commission Green-Deal response | Awaited, 0–30 d horizon | 🟧 MEDIUM | A, B |
| NATO/Ukraine situation | Active, escalation risk moderate | 🟧 MEDIUM | D |

---

## 🔮 Early-Warning Dashboard

```mermaid
graph TD
    W1["📅 2026-04-24<br/>FiU48 chamber vote"] --> A["🟢 Base holds<br/>if unified Ja"]
    W1 --> B["🟠 Downside<br/>if coalition Avstår"]
    W2["📅 2026-06-30<br/>Q2 SIFO"] --> A
    W2 --> B
    W3["📅 2026-07-15<br/>Pump-price effect"] --> A
    W4["📅 2026-08-15<br/>Final-push polling"] --> A
    W4 --> B
    W4 --> C["🔴 Hung parliament<br/>fragmentation"]

    style W1 fill:#FF9800,color:#FFFFFF
    style W2 fill:#FFC107,color:#000000
    style W3 fill:#FFC107,color:#000000
    style W4 fill:#D32F2F,color:#FFFFFF
    style A fill:#4CAF50,color:#FFFFFF
    style B fill:#FF9800,color:#FFFFFF
    style C fill:#D32F2F,color:#FFFFFF
```

---

## 📘 Decision Playbook

| Scenario | Action 1 | Action 2 | Action 3 |
|----------|----------|----------|----------|
| A (Base) | Maintain normal coverage cadence | Prepare post-election budget-continuity explainer | Track SD confidence-supply signals |
| B (Upside) | Commission policy-pivot explainer series | Stand up transition-team coverage | Prepare international-reaction pieces |
| C (Downside) | Activate constitutional-crisis playbook | Commission Statsrätt / KU analyses | Expand multilingual-explainer capacity |
| D (Wildcard) | Pre-draft crisis templates | Maintain real-time monitoring intensified by 2× | Prepare coordinated EN + SV rapid response |

---

## 🔁 Update Cadence

| Interval | Action |
|----------|--------|
| Weekly (Sunday) | Update probabilities from polling + macro signals |
| On-trigger (any W-signal) | Immediate rerun of affected scenarios + downstream analyses |
| Monthly | Full rewrite with pass-2 deep review |

---

**Document Control**
- **Template path:** `/analysis/templates/scenario-analysis.md`
- **Referenced by:** [ai-driven-analysis-guide.md § Step 5](../methodologies/ai-driven-analysis-guide.md#step-5--extensions-f3ead-analyze-continued)
- **Classification:** Public
- **Next Review:** 2026-07-21
