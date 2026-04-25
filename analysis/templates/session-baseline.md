<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📆 Session Baseline Template — Plenary Calendar & Adopted-Texts Roster

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/existing/session-baseline.md` (or `intelligence/session-baseline.md` for newer layouts). Used by `motions` (which covers quarterly scope), `propositions`, `week-in-review`, and `month-in-review` workflows. See [methodologies/per-artifact-methodologies.md §session-baseline](../methodologies/per-artifact-methodologies.md#session-baseline).

> **🎯 Purpose:** The comprehensive, structured fact layer of *which plenary sessions met during the period, how long they sat, where they were held, and which texts they adopted*. Distinct from `historical-baseline.md` (metric trending) — this file is the **calendar + roster**, the data-dense reference every other artifact in the run points back to.

---

## 📋 Run Context

| Field | Value |
|-------|-------|
| **Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Run ID** | `[REQUIRED]` |
| **Analysis Directory** | `[REQUIRED: analysis/daily/{date}/{type}-run{N}]` |
| **Article Type** | `[REQUIRED]` |
| **Parliament Term** | `[REQUIRED: EP9 / EP10]` |
| **Period Covered** | `[REQUIRED: e.g. Q1 2026 (January–March)]` |

---

## 1️⃣ Plenary Session Calendar

### Session 1 — `[REQUIRED: e.g. January Part-Session I]`

| Field | Detail |
|-------|--------|
| Dates | `[REQUIRED: e.g. 19-22 January 2026]` |
| Location | `[REQUIRED: Strasbourg / Brussels]` |
| Sitting Days | `[REQUIRED: #]` |
| Texts Adopted | `[REQUIRED: # (± 2)]` |
| Roll-Call Votes | `[REQUIRED: # (± 5)]` |
| Key Theme | `[REQUIRED: 1-line]` |
| EP Session ID | `[REQUIRED: if available]` |

### Session 2 — `[REQUIRED]`

| Field | Detail |
|-------|--------|
| Dates | `[REQUIRED]` |
| Location | `[REQUIRED]` |
| Sitting Days | `[REQUIRED]` |
| Texts Adopted | `[REQUIRED]` |
| Roll-Call Votes | `[REQUIRED]` |
| Key Theme | `[REQUIRED]` |
| EP Session ID | `[REQUIRED]` |

*(repeat per session in scope; most runs cover 2–4 sessions)*

---

## 2️⃣ Session Calendar Diagram

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
gantt
    title Plenary Session Calendar — [PERIOD]
    dateFormat YYYY-MM-DD
    section Strasbourg
    Session 1 : [start], [end]
    Session 3 : [start], [end]
    section Brussels
    Session 2 : [start], [end]
    Session 4 : [start], [end]
```

---

## 3️⃣ Period Totals

| Metric | Value |
|--------|:-----:|
| Total sitting days | `[REQUIRED]` |
| Total texts adopted | `[REQUIRED]` |
| Total roll-call votes | `[REQUIRED]` |
| Total resolutions (non-binding) | `[REQUIRED]` |
| Total legislative acts (binding) | `[REQUIRED]` |
| Plenary-day attendance mean | `[REQUIRED: % where available, else N/A]` |

---

## 4️⃣ Adopted Texts Roster (by session)

### Session 1 — `[REQUIRED]`

| # | Adopted-text ID | Title (first 80 chars) | Procedure Code | Committee | Domain |
|:-:|-----------------|------------------------|:--------------:|:---------:|--------|
| 1 | `[REQUIRED: TA-10-YYYY-NNNN]` | `[REQUIRED]` | `[COD/CNS/APP/INI]` | `[ENVI/AGRI/…]` | `[REQUIRED]` |
| 2 | `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[...]` | `[REQUIRED]` |
| … | | | | | |

### Session 2 — `[REQUIRED]`

*(same table shape)*

---

## 5️⃣ Committee Activity Map

| Committee | Texts Reported | Rapporteurships | Shadow Rapporteurships | Dominant Group |
|-----------|:--------------:|:---------------:|:----------------------:|----------------|
| `[REQUIRED: e.g. ENVI]` | `[#]` | `[#]` | `[#]` | `[REQUIRED]` |
| `[REQUIRED: e.g. ECON]` | `[#]` | `[#]` | `[#]` | `[REQUIRED]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[REQUIRED]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[REQUIRED]` |

≥5 committees required (or all committees active in the period, whichever is smaller).

---

## 6️⃣ Procedure-Code Distribution

| Procedure type | Count | % of total |
|----------------|:-----:|:---------:|
| COD (Ordinary legislative) | `[#]` | `[%]` |
| CNS (Consultation) | `[#]` | `[%]` |
| APP (Consent) | `[#]` | `[%]` |
| INI (Own-initiative) | `[#]` | `[%]` |
| Budget / Discharge | `[#]` | `[%]` |
| Other | `[#]` | `[%]` |

---

## 7️⃣ Historical Anchor

| Comparable period | Sitting days | Texts | RCVs | Delta |
|-------------------|:-----------:|:-----:|:----:|:-----:|
| Current period | `[#]` | `[#]` | `[#]` | — |
| Same quarter, prior year | `[#]` | `[#]` | `[#]` | `[±]` |
| Prior quarter | `[#]` | `[#]` | `[#]` | `[±]` |
| Term-to-date average | `[#]` | `[#]` | `[#]` | `[±]` |

**Narrative anchor**: `[REQUIRED: ≥100 words — is the period above, at, or below baseline, and what does that mean?]`

---

## 8️⃣ Data-Source Ledger

| MCP tool | Records fetched | Status | Notes |
|----------|:--------------:|:------:|-------|
| `get_plenary_sessions` | `[#]` | `[✅/⚠️/❌]` | `[REQUIRED]` |
| `get_adopted_texts` | `[#]` | `[✅/⚠️/❌]` | `[REQUIRED]` |
| `get_meeting_decisions` | `[#]` | `[✅/⚠️/❌]` | `[REQUIRED]` |
| `get_procedures` | `[#]` | `[✅/⚠️/❌]` | `[REQUIRED]` |
| `get_voting_records` | `[#]` | `[✅/⚠️/❌]` | `[REQUIRED: note roll-call publication delay if applicable]` |

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/{existing|intelligence}/session-baseline.md` · Template v1.1 · Depth floor: per article-type minimum defined in [`reference-quality-thresholds.json`](../methodologies/reference-quality-thresholds.json) (authoritative — e.g. motions 200, month-in-review 180).
