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

## 7️⃣ EP MCP Tool Inputs

| EP MCP tool | Used for which section | Notes |
|-------------|------------------------|-------|
| `get_plenary_sessions` | §1 Calendar (sitting numbers, dates, location) | Authoritative for Strasbourg vs. Brussels. |
| `get_meeting_decisions` | §2 Adopted decisions baseline | Per-sitting decision counts. |
| `get_meeting_activities` | §3 Agenda baseline | Slow endpoint — use limit ≤20 per sitting. |
| `get_adopted_texts` | §4 Adopted-text baseline | Year-filterable. |
| `get_voting_records` | §5 RCV baseline (aggregate margins) | Note 4-8 week publication delay. |
| `get_procedures` | §6 Procedure baseline | COD/CNS/APP procedure activity. |
| `get_committee_documents` | §7 Committee throughput baseline | Per ENVI/AGRI/ECON/LIBE volume. |
| `get_speeches` | §8 Speech-volume baseline | Topic-tag distribution. |
| `get_parliamentary_questions` | §9 Question-volume baseline | Pending vs. answered ratio. |
| `get_meeting_foreseen_activities` | §3 Look-ahead agenda | Slow endpoint — use limit ≤20. |

---

## 8️⃣ Worked Pass-1 → Pass-2 Example (Strasbourg-I November 2025 baseline)

**❌ Pass-1 (thin, 18 words):**
> "Strasbourg session held November 10-13. Multiple votes. Several committees met. AI Act discussed. Standard plenary week."

**✅ Pass-2 (compliant, 102 words, sourced):**
> Strasbourg-I 2025-11 (sittings #15-#18, 10-13 November) covered 47 agenda items per `get_meeting_activities` (limit=20×3 calls). 31 RCVs adopted per `get_voting_records` (lower than 38-RCV baseline for November plenaries 2022-2024 — see §6 below). Top item: AI-Office implementing-act final vote (Tue afternoon, 392/214/41). Committee meetings in margin: ENVI (CO₂ standards interim review), LIBE (data-retention scrutiny), ITRE (CRA implementation review). 89 questions tabled (baseline 95). Verbatim-record publication delay: 7 days (vs 5-day baseline — flag for transparency-deficit watch). 4 urgency-procedure motions adopted (vs baseline 2). Net: HIGHER procedural intensity, LOWER voting volume than 3-year baseline.

---

## 9️⃣ Worked 4-Day Strasbourg Plenary Calendar

| Day | Date | Sitting # | Opening | Closing | Agenda items | RCV count (est.) | Anchor item |
|:---:|------|:---------:|:-------:|:-------:|:------------:|:----------------:|-------------|
| Mon | 2025-11-10 | #15 | 17:00 | 23:00 | 6 | 0 (no votes Mon) | Resumption + commemoration + opening statements |
| Tue | 2025-11-11 | #16 | 09:00 | 22:00 | 17 | 12 | AI-Office implementing-act final vote (12:00) |
| Wed | 2025-11-12 | #17 | 09:00 | 22:00 | 16 | 14 | Council statement (BE-PL Presidency rotation) + CRA review |
| Thu | 2025-11-13 | #18 | 09:00 | 16:30 | 8 | 5 | Urgency motions + voting time |
| **Totals** | | | | | **47** | **31** | |

Estimate methodology: agenda-items proxied from `get_meeting_foreseen_activities`; RCV counts proxied from prior 3 Nov plenaries (3-year average 38 ± 6).

---

## 🔟 Anti-patterns — REJECT on Pass-2 Review

| # | Banned pattern | Why it fails |
|:-:|---------------|--------------|
| 1 | Calendar table without `get_plenary_sessions` confirmation of sitting numbers | Sitting #s must be authoritative, not narrated. |
| 2 | RCV-count claim within 4 weeks of session date without LOW-confidence flag | EP roll-call publication delay; tradecraft violation. |
| 3 | Comparing current session to "previous one" without naming sitting #s | Baseline ambiguous. |
| 4 | Anchor-item identification without `get_meeting_decisions` evidence | Could be agenda noise. |
| 5 | Calendar omits committee meetings held in plenary margin | Strasbourg week ≠ plenary alone; committees still meet. |
| 6 | "Standard plenary week" verdict — too generic, no Δ vs baseline | Verdict must be Δ-anchored. |

---

## 1️⃣1️⃣ Cross-References — Controlling Methodology

- [`../methodologies/per-artifact-methodologies.md#session-baseline`](../methodologies/per-artifact-methodologies.md) — construction rules.
- [`../methodologies/structural-metadata-methodology.md`](../methodologies/structural-metadata-methodology.md) — sitting-number + date discipline.
- [`../methodologies/osint-tradecraft-standards.md`](../methodologies/osint-tradecraft-standards.md) — Admiralty grade per session-decision claim.
- [`./historical-baseline.md`](./historical-baseline.md) — sister artifact for 30/90/365-day windows (longer than session).
- [`./cross-session-intelligence.md`](./cross-session-intelligence.md) — companion for two-session continuity.
- [`./voting-patterns.md`](./voting-patterns.md) — consumes RCV baseline established here.

---

## 1️⃣2️⃣ Stage-C Completeness Signals

`scripts/validate-analysis-completeness.js` checks for this artifact:

| Check | Threshold | Source |
|-------|-----------|--------|
| Line floor | per article-type (motions 200, month-in-review 180, breaking 130) | `reference-quality-thresholds.json` |
| Required H2 substrings | "Calendar", "Adopted", "Baseline", "Coverage" | structural contract |
| Mermaid block | ≥1 (Gantt of sittings preferred) | visual contract |
| Tradecraft markers | Admiralty grade per session-decision; LOW flag on RCVs <4 weeks old | `osint-tradecraft-standards.md` |
| Source diversity | ≥4 EP MCP tools (sessions, decisions, activities, texts) | per-artifact rule |
| Coverage discipline | All sittings in window indexed; no missing days | template logic |

---

## 1️⃣3️⃣ Worked Δ-vs-Baseline Highlights (Strasbourg-I 2025-11)

| Metric | Current | 3-y Nov-plenary baseline | Δ | Signal |
|--------|:-------:|:------------------------:|:-:|--------|
| RCVs adopted | 31 | 38 ± 6 | -7 | LOWER (within tolerance) |
| Urgency-procedure motions | 4 | 2 | +2 | HIGHER (procedural-pressure flag) |
| Verbatim-publication delay | 7 days | 5 days | +2 days | HIGHER (transparency-deficit watch) |
| Adopted-text count | 12 | 11 ± 3 | +1 | within baseline |
| Committee meetings in margin | 18 | 15 | +3 | HIGHER (committee throughput up) |

**Net signal:** procedural intensity up (urgency motions + transparency delay), voting volume slightly down — pattern consistent with "high-friction, low-throughput" plenary, frequent precursor to right-flank consolidation.

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/{existing|intelligence}/session-baseline.md` · Template v1.2 · Depth floor: per article-type minimum defined in [`reference-quality-thresholds.json`](../methodologies/reference-quality-thresholds.json) (authoritative — e.g. motions 200, month-in-review 180).
