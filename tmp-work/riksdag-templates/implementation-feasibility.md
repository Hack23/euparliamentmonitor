<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🛠️ Implementation Feasibility Template</h1>

<p align="center">
  <strong>📊 Can the Policy Actually Be Delivered — By When, At What Cost, With What Risks?</strong><br>
  <em>🎯 Legal · Administrative · Technical · Fiscal · Workforce · Timeline</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-0A66C2?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--21-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-04-21 (UTC)
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template instructions:** Produce this document on every run. If the current bill has concrete delivery obligations (budget line, infrastructure, IT system, procurement, workforce change), assess that bill directly; otherwise, use this template to audit implementation feasibility for the relevant delivery backlog or previously announced measures. Save as `analysis/daily/${ARTICLE_DATE}/${DOC_TYPE}/implementation-feasibility.md`.

> **✨ What to produce:** A structured feasibility review across six delivery dimensions (Legal, Administrative, Technical, Fiscal, Workforce, Timeline) with evidence and a calibrated overall-feasibility verdict (READY / FEASIBLE / CONSTRAINED / HIGH-RISK / UNLIKELY).

---

## 🔄 Tradecraft Context

| Element | Value |
|---------|-------|
| **F3EAD Stage** | **ANALYZE** — delivery risk assessment |
| **PIRs Served** | **PIR-5** (Fiscal Trajectory — budget feasibility), **PIR-7** (Democratic Norms — accountability for delivery) |
| **Admiralty Floor** | Ministry statements require **[B2]**; budget figures require **[A1]** (official appropriation documents) |
| **WEP + ODNI** | Delivery-risk scenarios use **WEP** (likely/unlikely for on-time delivery); confidence **MODERATE** (ministries rarely disclose implementation challenges publicly) |
| **Source Diversity Floor** | P1 (delivery-risk claims): ≥3 sources (budget dok_id + ministry statement + expert assessment); avoid single-ministry-spokesperson claims |
| **SAT(s) Applied** | Premortem Analysis (assume failure and explain why), Key Assumptions Check (delivery assumptions) |
| **ICD 203 Standards** | 2 (uncertainties — delivery risks), 5 (customer relevance — implementation milestones), 6 (logical argumentation) |

---

## 📋 Feasibility Context

| Field | Value |
|-------|-------|
| **Feasibility ID** | `FEA-YYYY-MM-DD-NNN` |
| **Generated** | `YYYY-MM-DD HH:MM UTC` |
| **Subject measure** | `dok_id and short title` |
| **Responsible ministry / agency** | `e.g., Finansdepartementet + Skatteverket` |
| **Declared start date** | `YYYY-MM-DD` |
| **Declared completion date** | `YYYY-MM-DD` |
| **Budget envelope** | `SEK X.Y billion` |
| **Overall verdict** | `🟢 READY / 🟢 FEASIBLE / 🟡 CONSTRAINED / 🟠 HIGH-RISK / 🔴 UNLIKELY` |

---

## 🧭 Feasibility Overview

```mermaid
radar
    title Feasibility score by dimension (1–5)
    axis Legal, Administrative, Technical, Fiscal, Workforce, Timeline
    curve Current[4, 3, 4, 3, 2, 3]
```

> If Mermaid `radar` is unavailable in the renderer, replace with the following graph:

```mermaid
graph LR
    D1["⚖️ Legal<br/>4/5"] --- OUT["🏷️ Overall<br/>🟡 CONSTRAINED"]
    D2["🏛️ Administrative<br/>3/5"] --- OUT
    D3["🖥️ Technical<br/>4/5"] --- OUT
    D4["💰 Fiscal<br/>3/5"] --- OUT
    D5["👷 Workforce<br/>2/5"] --- OUT
    D6["🗓️ Timeline<br/>3/5"] --- OUT

    style D1 fill:#4CAF50,color:#FFFFFF
    style D2 fill:#FFC107,color:#000000
    style D3 fill:#4CAF50,color:#FFFFFF
    style D4 fill:#FFC107,color:#000000
    style D5 fill:#D32F2F,color:#FFFFFF
    style D6 fill:#FFC107,color:#000000
    style OUT fill:#FF9800,color:#FFFFFF
```

---

## 📊 Dimension-by-Dimension Review

### ⚖️ Legal feasibility — 4/5

| Check | Status | Evidence |
|-------|:------:|----------|
| Constitutional authority (Regeringsformen) | 🟢 | Within budgetary prerogative |
| EU compatibility | 🟡 | State-aid risk flagged; notification path open |
| Secondary-law impact | 🟢 | Skattelag amendment required, scheduled |
| Litigation exposure | 🟢 | Low |

### 🏛️ Administrative feasibility — 3/5

| Check | Status | Evidence |
|-------|:------:|----------|
| Responsible agency capacity (Skatteverket) | 🟡 | Prior surcharge adjustment completed in 4 months |
| Inter-agency coordination (SCB, Tullverket) | 🟢 | Precedent exists |
| Guidance-document turnaround | 🟡 | Normal 90-day cycle |
| Reporting / auditing | 🟢 | Standard reports available |

### 🖥️ Technical feasibility — 4/5

| Check | Status | Evidence |
|-------|:------:|----------|
| IT systems change (Skatteverket) | 🟢 | Tax-rate parameter update |
| Fuel-monitoring system integration | 🟢 | Petrol-station price reporting already in place |
| Data pipeline / reporting | 🟢 | Existing telemetry |
| Cyber-risk exposure | 🟡 | Standard elevated-attention review |

### 💰 Fiscal feasibility — 3/5

| Check | Status | Evidence |
|-------|:------:|----------|
| Budget envelope sufficient | 🟡 | SEK 2.8 B annualised vs. estimated SEK 2.4 B |
| Revenue offset identified | 🟠 | Not explicitly earmarked |
| Debt-ceiling impact | 🟢 | Within surplus-target tolerance |
| Future-year commitments | 🟡 | Sunset clause at 12 months but renewal risk |

### 👷 Workforce feasibility — 2/5

| Check | Status | Evidence |
|-------|:------:|----------|
| Staff available at Skatteverket | 🟠 | Existing hiring freeze |
| Skill mix (policy + IT + call-centre) | 🟠 | Call-centre surge capacity limited |
| Contractor routes | 🟡 | *Ramavtal* (framework agreements) available but slow |
| Training needs | 🟢 | Minimal |

### 🗓️ Timeline feasibility — 3/5

```mermaid
gantt
    title HD03236 Implementation Timeline
    dateFormat YYYY-MM-DD
    section Legal
    FiU committee process    :done,   l1, 2026-04-15, 2026-04-21
    Chamber vote             :active, l2, 2026-04-22, 3d
    SFS publication          :        l3, after l2, 5d
    section Administrative
    Skatteverket guidance    :        a1, 2026-05-01, 30d
    Call-centre scaling      :        a2, 2026-05-15, 45d
    section Technical
    IT parameter update      :        t1, 2026-05-10, 10d
    Price-reporting update   :        t2, 2026-05-20, 14d
    section Effect
    Pump-price drop visible  :milestone, pe, 2026-07-15, 0d
```

---

## 🚦 Critical Dependencies

| # | Dependency | Owner | Risk if missed |
|:-:|-----------|-------|----------------|
| D1 | Chamber vote passes by 2026-04-24 | Kammaren | Entire package delayed |
| D2 | SFS publication within 5 days post-vote | Regeringskansliet | Delays IT update |
| D3 | Skatteverket IT parameter change | Skatteverket | Implementation date slips |
| D4 | Call-centre staffing | Skatteverket HR | Citizen complaints surge |
| D5 | EU-Commission non-intervention | Commission | Formal review forces 6-12 m delay |

---

## 🧯 Risk Register (feasibility-specific)

| # | Risk | L | I | Score | Mitigation |
|:-:|------|:-:|:-:|:-----:|------------|
| FR-1 | EU state-aid review opens before SFS | 3 | 5 | 15 | Pre-notify Commission now |
| FR-2 | Call-centre capacity overwhelmed | 4 | 3 | 12 | Activate framework contract |
| FR-3 | Price-reporting integrity issues | 2 | 4 | 8 | Independent pump-price audit |
| FR-4 | Revenue-offset gap breaks surplus target | 3 | 4 | 12 | Identify offset before Q3 budget |
| FR-5 | Workforce gap at Skatteverket | 4 | 3 | 12 | Emergency hiring authorisation |

---

## 📊 Comparable Delivery Benchmarks

| Comparable measure | Delivery time | Outcome |
|--------------------|:-------------:|---------|
| 2022 Electricity-price support | 6 months to first payment | Delivered but with CRM overload |
| 2019 Reduced VAT on e-books | 5 months | On-time, minimal issues |
| Norway Strømstøtte 2023 | 3 months | Delivered with price-cap simplification |

---

## ✅ Verdict and Preconditions

**Overall:** 🟡 **CONSTRAINED** — deliverable by declared date only if D1, D3, D4 land on schedule and EU Commission does not intervene.

| Precondition | Status | Action required |
|--------------|:------:|-----------------|
| EU pre-notification submitted | 🔴 Not done | Open dialogue this week |
| Call-centre surge contract triggered | 🔴 Not done | Authorise by 2026-05-01 |
| Revenue-offset identified | 🔴 Not done | Include in Q3 budget bill |

---

## 📎 Links

| Link | Path |
|------|------|
| Risk register | `risk-assessment.md` |
| Scenario analysis | `scenario-analysis.md` |
| Comparative international | `comparative-international.md` |
| Per-document analysis | `documents/HD03236-analysis.md` |

---

**Document Control**
- **Template path:** `/analysis/templates/implementation-feasibility.md`
- **Referenced by:** [ai-driven-analysis-guide.md § Step 5](../methodologies/ai-driven-analysis-guide.md#step-5--extensions-f3ead-analyze-continued)
- **Classification:** Public
- **Next Review:** 2026-07-21
