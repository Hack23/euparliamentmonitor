<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔗 Cross-Reference Map Template</h1>

<p align="center">
  <strong>📊 Structural Map of Relationships Across Downloaded Documents</strong><br>
  <em>🎯 Policy Clusters · Legislative Chains · Coordinated Activity · Temporal Alignment</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-0A66C2?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--21-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-04-21 (UTC)
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

> **📌 Template instructions:** Produce one `cross-reference-map.md` per workflow folder. It connects the documents in the current run to each other and to documents from earlier runs. Save as `analysis/daily/${ARTICLE_DATE}/${DOC_TYPE}/cross-reference-map.md`.

> **✨ What to produce:** At least five concrete cross-document relationships per workflow folder, with Mermaid visualisation. Every relationship ties specific `dok_id`s to a typed relationship (policy cluster, legislative chain, opposition strategy, coalition signal, temporal alignment).

---

## 🔄 Tradecraft Context

| Field | Value |
|-------|-------|
| **F3EAD stage** | `Exploit` (connecting documents into patterns for downstream Analyze) |
| **PIRs** | `coalition-stability, democratic-norms — cross-document relationships reveal coordination` |
| **Admiralty floor** | `A1 for primary dok_id links; B2 acceptable for inferred narrative linkages` |
| **SATs used** | `Analysis of Competing Hypotheses; Link Analysis; Pattern Recognition` |
| **ICD 203 standards applied** | `sources, argumentation, visual information` |

> See [`political-style-guide.md`](../methodologies/political-style-guide.md) for canonical F3EAD / PIR catalog / Admiralty Code / ICD 203 / WEP / SATs definitions.

---

## 📋 Context

| Field | Value |
|-------|-------|
| **Map ID** | `XRF-YYYY-MM-DD-NNN` |
| **Generated** | `YYYY-MM-DD HH:MM UTC` |
| **Scope** | `e.g., propositions 2026-04-20` |
| **Documents in scope** | `N` |
| **Relationships identified** | `N` |
| **Overall Confidence** | `🟩 HIGH / 🟧 MEDIUM / 🟥 LOW` |

---

## 🗺️ Cross-Reference Overview

```mermaid
graph LR
    subgraph Fiscal["💰 Fiscal Cluster"]
        HD03100[HD03100<br/>Spring Bill]
        HD0399[HD0399<br/>Amendment Budget]
        HD03236[HD03236<br/>Fuel+Energy Support]
    end

    subgraph Energy["⚡ Energy Cluster"]
        HD03239[HD03239<br/>Wind Municipal Revenue]
        HD03238[HD03238<br/>Env Permitting]
        HD03240[HD03240<br/>Electricity Laws]
    end

    subgraph Security["🛡️ Security Cluster"]
        HD03220[HD03220<br/>NATO Finland eFP]
        HD03231[HD03231<br/>Ukraine Tribunal]
        HD03232[HD03232<br/>Ukraine Compensation]
    end

    HD03100 --> HD0399
    HD0399 --> HD03236
    HD03239 --> HD03238
    HD03238 --> HD03240
    HD03220 --> HD03231
    HD03231 --> HD03232

    style HD03100 fill:#D32F2F,color:#FFFFFF
    style HD0399 fill:#FF9800,color:#FFFFFF
    style HD03236 fill:#FF9800,color:#FFFFFF
    style HD03239 fill:#1565C0,color:#FFFFFF
    style HD03238 fill:#1565C0,color:#FFFFFF
    style HD03240 fill:#1565C0,color:#FFFFFF
    style HD03220 fill:#C2185B,color:#FFFFFF
    style HD03231 fill:#C2185B,color:#FFFFFF
    style HD03232 fill:#C2185B,color:#FFFFFF
```

---

## 🧷 Relationship Register

| # | Type | Documents | Significance (1–10) | Confidence | Summary |
|:-:|------|-----------|:-------------------:|:----------:|---------|
| XR-01 | 📦 Policy cluster | HD03100, HD0399, HD03236 | 9 | 🟩 HIGH | Fiscal package: spring bill → amendment → cost-of-living relief |
| XR-02 | ⚙️ Legislative chain | HD03239 → HD03238 → HD03240 | 8 | 🟩 HIGH | Municipal wind revenue requires permitting agency and new electricity-market rules |
| XR-03 | ⚔️ Opposition strategy | HD11680, HD11683, HD11679 | 7 | 🟧 MEDIUM | Coordinated S-party interpellations on foreign policy filed same day |
| XR-04 | 🧩 Coalition signal | HD03237, HD03246 | 8 | 🟩 HIGH | Two justice bills fulfil SD coalition commitments |
| XR-05 | ⏱️ Temporal alignment | HD01CU22, HD01CU27, HD01CU28 | 6 | 🟧 MEDIUM | Three CU reports land same day — committee clear-out pattern |

> **Each relationship must be backed by at least one concrete cross-cited element** (shared policy domain keyword, shared sponsor, shared committee, shared date, or explicit textual reference).

---

## 🔀 Relationship Types — When to Use Each

| Type | Definition | Evidence Standard |
|------|------------|-------------------|
| 📦 **Policy cluster** | ≥ 2 documents addressing the same policy area within a short window | Shared keyword + shared committee or common political domain |
| ⚙️ **Legislative chain** | Proposition → committee report → vote sequence | Explicit textual references or identical bill numbers |
| ⚔️ **Opposition strategy** | Coordinated motions, interpellations, or written questions | Same filer / party group and shared topic |
| 🧩 **Coalition signal** | Documents revealing coalition tension or alignment | Shared co-sponsors or party-group votes |
| ⏱️ **Temporal alignment** | Same-day or same-week clustering suggesting coordinated timing | Publication date alignment |
| 🌍 **External parallel** | Document aligns with EU, NATO, OECD, or peer-country action | Named external instrument or directive |
| 🕰️ **Historical parallel** | Document mirrors a prior riksmöte's action | Named prior dok_id with outcome |

---

## 📊 Cluster Deep-Dive — Example Structure (repeat per cluster)

### Cluster XR-01 — Fiscal Cluster

- **Documents:** HD03100 (Spring Bill), HD0399 (Amendment Budget), HD03236 (Fuel + Energy Support)
- **Political domain:** Fiscal / Cost-of-living
- **Sponsors:** Finance Minister **Elisabeth Svantesson (M)**
- **Committee referral:** Finansutskottet (FiU)
- **Legislative path:** Prop → FiU → Kammaren, expected vote `YYYY-MM-DD`
- **Why this cluster matters:** The three documents together form the government's April 2026 cost-of-living package — the fiscal credibility test before the September 2026 election.
- **Cross-link impact:** Voter-segment impact concentrated in Segments 1 & 2 (rural drivers, suburban homeowners); policy effect measurable by pump-price by early July 2026.
- **Confidence:** 🟩 HIGH — all three documents confirmed via `get_propositioner` with full text.

---

## 🧭 Coverage Check

| Relationship Count | Verdict |
|:------------------:|---------|
| 0 | 🔴 FAIL — rerun with broader search window |
| 1–4 | 🟡 THIN — try adding temporal alignment or external parallels |
| 5–9 | 🟢 ADEQUATE |
| ≥ 10 | 🟢🟢 RICH — use in synthesis as narrative anchor |

---

## 🔁 Update Triggers

| Trigger | Action |
|---------|--------|
| New document arrives that matches an existing cluster | Add to relationship register, bump significance if warranted |
| Vote outcome lands | Update `Legislative chain` entry with result |
| Related document from prior riksmöte surfaces | Add `Historical parallel` entry |

---

**Document Control**
- **Template path:** `/analysis/templates/cross-reference-map.md`
- **Referenced by:** [ai-driven-analysis-guide.md § Step 4](../methodologies/ai-driven-analysis-guide.md#step-4--core-synthesis-family-a-always-produced)
- **Classification:** Public
- **Next Review:** 2026-07-21
