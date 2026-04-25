<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📈 Political Significance Scoring Template — European Parliament

> **📌 Template Instructions:** Copy to `analysis/YYYY-MM-DD/{article-type-slug}/` and name `significance-scoring.md`. The AI agent MUST score every significant EP event from the downloaded MCP data (in `analysis/YYYY-MM-DD/{article-type-slug}/data/`). Use this for publication prioritisation decisions.

> **🚨 Anti-Pattern Warning:** Significance scores without 5-dimension breakdowns and evidence citations are REJECTED. Every score MUST show: Political Impact (1–10) + Policy Significance (1–10) + Institutional Relevance (1–10) + Public Interest (1–10) + Temporal Urgency (1–10) = Composite (weighted average). See [methodologies/ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md) for quality requirements. **Never use scripted boilerplate — AI must analyse the actual data.**

> **🔴 Data Depth Requirement (NEW):** Before scoring any event, verify that you have downloaded **full document content** — not just metadata. Political group position claims MUST cite voting records from `get_voting_records` or `get_meeting_decisions`, not inferred from general patterns. If voting data is unavailable, state confidence as LOW and note "voting records not available for this session."

---

## 🔍 Data Verification Gate (MANDATORY)

> **Complete this section BEFORE scoring any events. Scores without data verification are REJECTED.**

| Data Source | Status | Items Retrieved | Tool Used |
|-------------|--------|:---------------:|-----------|
| Adopted texts (full details) | `[OK/FAILED/SKIPPED]` | `[N]` | `[get_adopted_texts / get_adopted_texts_feed]` |
| Voting records for cited sessions | `[OK/FAILED/SKIPPED]` | `[N]` | `[get_voting_records]` |
| Meeting decisions | `[OK/FAILED/SKIPPED]` | `[N]` | `[get_meeting_decisions]` |
| Procedure tracking for cited legislation | `[OK/FAILED/SKIPPED]` | `[N]` | `[track_legislation]` |
| Committee documents | `[OK/FAILED/SKIPPED]` | `[N]` | `[get_committee_documents / feed]` |
| Parliamentary questions | `[OK/FAILED/SKIPPED]` | `[N]` | `[get_parliamentary_questions / feed]` |
| Speeches | `[OK/FAILED/SKIPPED]` | `[N]` | `[get_speeches]` |
| Coalition dynamics | `[OK/FAILED/SKIPPED]` | `[N groups]` | `[analyze_coalition_dynamics]` |
| Precomputed stats | `[OK/FAILED/SKIPPED]` | `[size KB]` | `[get_all_generated_stats]` |

**Seat Count Source:** `[REQUIRED: state which single tool provided group seat counts — e.g., "analyze_coalition_dynamics" or "get_meps_feed"]`

**Data Gaps Impact on Scoring:** `[REQUIRED: describe how missing data affects confidence levels — e.g., "No voting records available; all coalition position claims are LOW confidence inferred from prior sessions"]`

---

## 📋 Event Context

| Field | Value |
|-------|-------|
| **Score ID** | `[REQUIRED: SIG-YYYY-MM-DD-NNN]` |
| **Event / Document** | `[REQUIRED: brief event name]` |
| **Primary EP Reference** | `[REQUIRED: procedure ID, adopted text ref, or MCP data file]` |
| **Scoring Date** | `[REQUIRED: YYYY-MM-DD HH:MM UTC]` |
| **Scored By** | `[REQUIRED: workflow name]` |
| **Classification ID** | `[OPTIONAL: CLS-ID if already classified]` |

---

## 📊 Section 1: Individual Event Scoring

Score each dimension from **0 to 10**.

### Dimension 1: Parliamentary Significance (0–10)

| Sub-criterion | Score (0–3) | Rationale |
|--------------|:-----------:|-----------|
| Legislative stage (Committee=1, Plenary 1st reading=2, Final adoption=3) | `[#]` | `[REQUIRED]` |
| Institutional dimension (routine=0, oversight=1, interinstitutional=2, Treaty=3) | `[#]` | `[REQUIRED]` |
| Number of MEPs involved (1–19=1, 20–99=2, 100+=3, all 720=3) | `[#]` | `[REQUIRED]` |

**Parliamentary Significance Score:** `[REQUIRED: normalised to 0–10]` /10

---

### Dimension 2: Policy Impact (0–10)

| Sub-criterion | Score (0–3) | Rationale |
|--------------|:-----------:|-----------|
| Scope (1=national, 2=EU-wide, 3=international) | `[#]` | `[REQUIRED]` |
| Duration (1=temporary, 2=multi-year, 3=permanent/structural) | `[#]` | `[REQUIRED]` |
| Affected population (1=<10M, 2=10M–200M, 3=>200M) | `[#]` | `[REQUIRED]` |

**Policy Impact Score:** `[REQUIRED: normalised to 0–10]` /10

---

### Dimension 3: Public Interest (0–10)

| Sub-criterion | Score (0–3) | Rationale |
|--------------|:-----------:|-----------|
| Topic salience (climate/migration/economy=3, niche=1) | `[#]` | `[REQUIRED]` |
| Controversy level (consensus=0, partisan=2, polarising=3) | `[#]` | `[REQUIRED]` |
| Citizen-facing impact (abstract=0, direct=3) | `[#]` | `[REQUIRED]` |

**Public Interest Score:** `[REQUIRED: normalised to 0–10]` /10

---

### Dimension 4: Urgency (0–10)

| Sub-criterion | Score (0–3) | Rationale |
|--------------|:-----------:|-----------|
| Time horizon (>30 days=0, 8–30 days=1, 2–7 days=2, <48h=3) | `[#]` | `[REQUIRED]` |
| Reversibility (easily reversed=0, difficult=2, irreversible=3) | `[#]` | `[REQUIRED]` |
| Cascade risk (isolated=0, single cascade=1, multiple=3) | `[#]` | `[REQUIRED]` |

**Urgency Score:** `[REQUIRED: normalised to 0–10]` /10

---

### Dimension 5: Cross-Group Relevance (0–10)

| Sub-criterion | Score (0–3) | Rationale |
|--------------|:-----------:|-----------|
| Political groups involved (1–2=1, 3–5=2, 6+=3) | `[#]` | `[REQUIRED]` |
| Grand coalition implication (none=0, tests alliance=2, fractures=3) | `[#]` | `[REQUIRED]` |
| Opposition response strength (silence=0, statement=1, formal motion=3) | `[#]` | `[REQUIRED]` |

**Cross-Group Relevance Score:** `[REQUIRED: normalised to 0–10]` /10

---

### 📐 Composite Score Calculation

```
Composite = (Parliamentary × 0.25) + (Policy × 0.25) + (Public Interest × 0.20)
          + (Urgency × 0.15) + (Cross-Group × 0.15)
```

| Dimension | Raw Score | Weight | Weighted Score |
|-----------|:---------:|:------:|:--------------:|
| Parliamentary Significance | `[#]` | 0.25 | `[#×0.25]` |
| Policy Impact | `[#]` | 0.25 | `[#×0.25]` |
| Public Interest | `[#]` | 0.20 | `[#×0.20]` |
| Urgency | `[#]` | 0.15 | `[#×0.15]` |
| Cross-Group Relevance | `[#]` | 0.15 | `[#×0.15]` |
| **COMPOSITE SCORE** | — | — | **`[sum]` / 10** |

---

### 🚦 Publication Decision Thresholds

> **Engine mapping:** The scoring engine (`src/utils/significance-scoring.ts`) produces three `PublicationDecision` values: `skip`, `hold`, and `publish`. The editorial labels below refine those three decisions for agent guidance. Always record the **engine decision** in addition to the editorial label.

| Score Range | Engine Decision | Editorial Label | Action |
|-------------|:--------------:|-----------------|--------|
| **0.0 – 3.4** | `skip` | 🗄️ **Archive** | Log for trend analysis; do not publish |
| **3.5 – 5.4** | `hold` | 📋 **Monitor** | Track for follow-up; consider weekly digest |
| **5.5 – 7.4** | `publish` | 📰 **Publish** | Publish in standard news cycle (EP in session) |
| **5.5 – 7.4** | `hold` | ⏸️ **Hold** | Queue for next session (EP in recess) |
| **7.5 – 8.9** | `publish` | 📰 **Priority** | Priority in daily news; prominent placement |
| **9.0 – 10.0** | `publish` | ⚡ **Breaking** | Publish immediately; all-language deployment |

**Engine Decision:** `[REQUIRED: skip / hold / publish]`
**Editorial Label:** `[REQUIRED: Archive / Monitor / Publish / Hold / Priority / Breaking]`
**Decision Rationale:** `[REQUIRED: 1–2 sentences]`

### 🌳 Publication Decision Tree

> **AI Instructions:** Walk through this decision tree for every scored event. Follow the path from top to bottom. The first matching terminal node is the decision. **Use the raw composite score for the ≥9.0 check (step 1), then apply calendar adjustments for all subsequent checks.**

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart TD
    START["📊 Raw Composite Score Calculated"] --> Q1{"Raw score ≥ 9.0?"}
    Q1 -->|"YES"| BRK["⚡ BREAKING<br/>Engine: publish<br/>All 14 languages"]
    Q1 -->|"NO"| ADJ["🗓️ Apply EP Calendar Adjustment<br/>(→ adjusted score)"]
    ADJ --> Q2{"Adjusted score ≥ 7.5?"}
    Q2 -->|"YES"| Q2A{"Urgency dimension ≥ 8?"}
    Q2A -->|"YES"| BRK
    Q2A -->|"NO"| PRI["📰 PRIORITY<br/>Engine: publish<br/>Prominent placement"]
    Q2 -->|"NO"| Q3{"Adjusted score ≥ 5.5?"}
    Q3 -->|"YES"| Q3A{"EP in recess?"}
    Q3A -->|"YES"| HOLD["⏸️ HOLD<br/>Engine: hold<br/>Queue for next session"]
    Q3A -->|"NO"| PUB["📰 PUBLISH<br/>Engine: publish<br/>Standard news cycle"]
    Q3 -->|"NO"| Q4{"Adjusted score ≥ 3.5?"}
    Q4 -->|"YES"| MON["📋 MONITOR<br/>Engine: hold<br/>Track; weekly digest"]
    Q4 -->|"NO"| ARC["🗄️ ARCHIVE<br/>Engine: skip<br/>Log for trend analysis"]

    style BRK fill:#dc3545,color:#fff
    style PRI fill:#fd7e14,color:#fff
    style PUB fill:#28a745,color:#fff
    style HOLD fill:#0d6efd,color:#fff
    style MON fill:#ffc107,color:#000
    style ARC fill:#6c757d,color:#fff
```

| Editorial Label | Engine Decision | Score Range | Additional Condition | Action |
|-----------------|:--------------:|:-----------:|---------------------|--------|
| ⚡ BREAKING | `publish` | ≥ 9.0 OR (≥ 7.5 + Urgency ≥ 8) | — | Publish immediately; all-language deployment |
| 📰 PRIORITY | `publish` | 7.5 – 8.9 | Urgency < 8 | Daily news; prominent placement |
| 📰 PUBLISH | `publish` | 5.5 – 7.4 | EP in session | Standard news cycle |
| ⏸️ HOLD | `hold` | 5.5 – 7.4 | EP in recess | Queue for next plenary week |
| 📋 MONITOR | `hold` | 3.5 – 5.4 | — | Track for follow-up; weekly digest |
| 🗄️ ARCHIVE | `skip` | 0.0 – 3.4 | — | Log for trend analysis only |

---

## 📊 Section 2: Batch Scoring Table

*Use when scoring multiple events from a single MCP data download.*

| Event | EP Reference | Parl. | Policy | Public | Urgency | X-Group | **Composite** | Decision |
|-------|-------------|:-----:|:------:|:------:|:-------:|:-------:|:-------------:|----------|
| `[event 1]` | `[ref]` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | **`[score]`** | `[action]` |
| `[event 2]` | `[ref]` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | **`[score]`** | `[action]` |
| `[event 3]` | `[ref]` | `[#]` | `[#]` | `[#]` | `[#]` | `[#]` | **`[score]`** | `[action]` |

---

## 📚 Calibration Examples

| Event Type | Parl. | Policy | Public | Urgency | X-Group | Composite | Notes |
|------------|:-----:|:------:|:------:|:-------:|:-------:|:---------:|-------|
| Routine committee opinion (no controversy) | 3 | 2 | 2 | 1 | 2 | **2.5** | Archive |
| New Commission AI regulation proposal | 5 | 7 | 7 | 3 | 6 | **5.8** | Monitor |
| Grand coalition agreement on migration pact | 8 | 9 | 8 | 6 | 9 | **8.2** | Priority |
| Motion of censure against Commission | 10 | 8 | 10 | 10 | 10 | **9.6** | Breaking |
| Minor technical amendment to regulation | 2 | 2 | 1 | 1 | 1 | **1.5** | Archive |
| EP resolution on Ukraine support | 7 | 8 | 9 | 5 | 8 | **7.7** | Priority |
| EP President election (new term) | 9 | 5 | 7 | 8 | 10 | **7.8** | Priority |
| ECR-PfE joint opposition on climate target | 8 | 7 | 8 | 9 | 10 | **8.3** | Priority |

### Filled Calibration Example

> *This example demonstrates how to complete the template for a real EP event. Use it as a scoring anchor.*

**Event:** Plenary adoption of EU AI Act trilogue compromise

| Field | Value |
|-------|-------|
| **Score ID** | `SIG-2026-03-13-001` |
| **Event / Document** | AI Act final plenary vote |
| **Primary EP Reference** | `P9_TA(2026)0089` |
| **Scoring Date** | `2026-03-13 14:30 UTC` |
| **Scored By** | `news-breaking` |
| **Classification ID** | `CLS-2026-03-13-001` |

| Dimension | Raw Score | Weight | Weighted Score |
|-----------|:---------:|:------:|:--------------:|
| Parliamentary Significance | 9 | 0.25 | 2.25 |
| Policy Impact | 10 | 0.25 | 2.50 |
| Public Interest | 9 | 0.20 | 1.80 |
| Urgency | 7 | 0.15 | 1.05 |
| Cross-Group Relevance | 8 | 0.15 | 1.20 |
| **COMPOSITE SCORE** | — | — | **8.8 / 10** |

**Decision:** 📰 **Priority** (significance 8.8 ≥ 7.5, below 9.0 breaking threshold)
**Rationale:** Landmark regulation with EU-wide impact on AI industry; strong cross-group support (412–156) but below breaking threshold as trilogue outcome was expected.

---

## 📊 Section 4: Significance Trend Tracking

*When multiple scoring sessions are available for related events, track the trajectory:*

| Date | Event | Composite | Δ (change) | Trend |
|------|-------|:---------:|:----------:|:-----:|
| `[date 1]` | `[event]` | `[score]` | — | — |
| `[date 2]` | `[event]` | `[score]` | `[+/-#]` | `[↑/↓/→]` |
| `[date 3]` | `[event]` | `[score]` | `[+/-#]` | `[↑/↓/→]` |

**Trend Assessment:** `[REQUIRED: Is significance rising, falling, or stable? What does this indicate about the political cycle?]`

---

## 📏 Section 5: Historical Significance Baseline Comparison — New in v2.2

> **AI Instructions:** Significance scores only acquire full analytical value when compared against historical baselines. A composite score of 8.4/10 means little in isolation — but "8.4/10, the highest trade-related score since EP10 inauguration" is actionable intelligence. **Every significance score ≥ 7.0 MUST include a historical baseline comparison.** For scores below 7.0, baseline comparison is strongly recommended.

### Baseline Comparison Table

For each scored event, look back through prior synthesis summaries and significance scores in the `analysis/` folder and complete this table:

| Baseline Dimension | This Event | Previous High | Previous High Date | Context |
|:------------------:|:----------:|:-------------:|:-----------------:|---------|
| **Domain-specific baseline** | `[score]` | `[highest prior score for this domain, e.g. ENVI/trade]` | `[YYYY-MM-DD]` | `[brief description of that event]` |
| **EP term (EP10) baseline** | `[score]` | `[highest score in EP10]` | `[YYYY-MM-DD]` | `[what was that event?]` |
| **Article-type baseline** | `[score]` | `[highest score for this article type, e.g. breaking/committee-reports]` | `[YYYY-MM-DD]` | `[what was that event?]` |
| **30-day rolling average** | `[score]` | `[avg. composite over last 30 days]` | `[30-day window]` | `[above/below/at average?]` |

### Baseline Comparison Narrative

**Mandatory Format:** `[Score] / 10 — [superlative/comparison, e.g., "highest trade-related score since EP10 inauguration" OR "above EP10 average of 6.2 for committee-reports" OR "ties with CBAM final adoption as highest environmental score this term"]`

**❌ BAD (score without context):**
```markdown
Composite significance: 8.4/10. Decision: Priority.
```

**✅ GOOD (score anchored to historical baseline):**
```markdown
Composite significance: **8.4/10** — the highest trade-related significance score since EP10 
inauguration (June 2024), surpassing the CBAM final adoption (8.1/10, SIG-2026-02-18-001) 
and 35% above the EP10 average for INTA committee documents (6.2/10). This score reflects 
the convergence of high cross-group relevance (9/10 — ECR and S&D both issuing public positions) 
and structural policy impact (9/10 — permanent MFN tariff change with no sunset clause).
Decision: **Priority** (≥7.5 threshold met; urgency dimension 6/10 below BREAKING threshold of 8).
```

### Domain-Specific Baseline Tables

> **AI Instructions:** Use the calibration examples in Section 3 as rough anchors, then compare against actual analysis files in the `analysis/` folder for your specific domain. Calibration examples are illustrative only — use real historical data wherever available.

#### EP Domain Significance Anchors (Reference Calibration)

| Domain | Typical Range | High-End Anchor Event | High-End Score |
|--------|:------------:|----------------------|:--------------:|
| Climate / Environment (ENVI) | 5.5–8.5 | CBAM final plenary adoption | ~8.1 |
| Digital / Technology (ITRE/IMCO) | 5.0–8.0 | AI Act final vote | ~8.8 |
| Migration / Asylum (LIBE) | 6.0–9.0 | Pact on Migration final adoption | ~9.0 |
| Trade / INTA | 5.5–8.5 | US-EU trade agreement rejection | ~8.4 |
| Budget / MFF (BUDG) | 6.0–9.5 | MFF revision/rejection | ~9.2 |
| Defence / Security (AFET) | 5.5–9.0 | Defence support package vote | ~8.9 |
| Economic Governance (ECON) | 5.0–8.0 | Stability Pact reform | ~7.8 |
| Health / Food Safety (ENVI/AGRI) | 4.0–7.5 | Emergency health mandate | ~7.5 |
| Social Policy (EMPL) | 4.5–7.5 | Platform workers directive | ~7.2 |
| Institutional / Procedural | 5.0–9.5 | Motion of censure | ~9.6 |

> **⚠️ Note:** These are **calibration anchors only**, derived from the calibration examples in Section 3. Use actual historical analysis files in `analysis/` for precise baselines. If no prior data exists for a domain, note "No EP10 baseline available — using calibration anchor."

### Significance Percentile Assessment

After establishing the baseline, assess the percentile position of this score:

| Percentile | Meaning | Action |
|:----------:|---------|--------|
| **Top 5%** (≥9.0 for most domains) | Historically significant event — landmark EP10 moment | BREAKING consideration; ensure multi-language coverage |
| **Top 15%** (≥8.0 for most domains) | Major event; likely to appear in weekly/monthly rollups | Priority publication; flag in synthesis summary |
| **Top 35%** (≥7.0 for most domains) | Above-average significance; worth publishing | Standard publish in session week |
| **Below top 35%** (<7.0) | Routine or minor event | Monitor or archive based on thresholds |

**Percentile Assessment:** `[REQUIRED: e.g., "Score 8.4/10 places this in the top 15% of INTA domain events in EP10. Only 3 prior INTA events have scored higher: US-EU tariff rejection (8.6), Mercosur agreement vote (8.5), and Supply Chain Directive final adoption (8.4 — tied)."]`

---

## 🗓️ EP Calendar Awareness

> **AI Instructions:** Before finalizing the publication decision, check the current EP calendar context. Recess periods, upcoming plenary weeks, and election cycles significantly affect scoring thresholds.
>
> **⚠️ Evaluation Order:**
> 1. Compute the **raw composite score** using the 5-dimension formula above.
> 2. If raw score **≥ 9.0** → decision is **⚡ BREAKING** regardless of calendar context (skip step 3).
> 3. Apply calendar adjustments from the table below to produce the **adjusted composite score**.
> 4. Use the **adjusted score** in the decision tree / thresholds table for the final publication decision.

### EP Session Calendar Reference

> **Adjustment method:** All adjustments below apply **directly to the composite score** (not to individual dimensions). This is a post-hoc editorial adjustment — the raw dimension scores remain unchanged for trend analysis.

| Period Type | Composite Adjustment | Rationale |
|-------------|:------------------:|-----------|
| **Plenary Session Week** | No adjustment | Normal editorial cycle; full audience attention |
| **Committee Week** | −0.5 | Lower time pressure; committee outputs mature over weeks |
| **Constituency Week** | −1.0 | Reduced EP activity; audiences less engaged with EP news |
| **Recess Period** (Aug, Dec–Jan) | Cap at min(raw, 7.4); bypassed if raw ≥ 9.0 | No plenary votes; HOLD events for return week. Raw ≥ 9.0 overrides cap (→ BREAKING) |
| **Pre-Election Period** (6 months before EP elections) | +1.0 | Heightened political positioning; coalition moves are electorally significant |
| **Post-Election Transition** (first 3 months of new term) | +0.5 | New committee formations, group negotiations, leadership elections |

### Current EP Calendar Context

| Field | Value |
|-------|-------|
| **Current EP Period** | `[REQUIRED: e.g. "Plenary Session Week" / "Committee Week" / "Recess"]` |
| **Next Plenary Session** | `[REQUIRED: YYYY-MM-DD]` |
| **Days Until Next Plenary** | `[REQUIRED: N days]` |
| **Scoring Adjustment Applied** | `[REQUIRED: e.g. "None" or "−1.5 recess cap applied"]` |
| **Adjusted Composite Score** | `[REQUIRED: original score ± adjustment]` |

---

### MCP Data Files Used

```
[REQUIRED: List all analysis/YYYY-MM-DD/{article-type-slug}/data/ files consulted]
```

---

**Document Control:**
- **Template Path:** `/analysis/templates/significance-scoring.md`
- **Version:** 2.3
- **Advanced Features (v2.2):** Historical Significance Baseline Comparison (Section 5), domain-specific baseline anchors, significance percentile assessment, mandatory baseline narrative for scores ≥7.0
- **Advanced Features (v2.1):** Composite Score Calculation, Publication Decision Thresholds, Publication Decision Tree (Mermaid), EP Calendar Awareness, Significance Trend Tracking
- **Framework Reference:** [methodologies/ai-driven-analysis-guide.md](../methodologies/ai-driven-analysis-guide.md)
- **Classification:** Public
- **Next Review:** 2026-07-31
