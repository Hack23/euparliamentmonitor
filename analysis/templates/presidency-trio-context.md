<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🇪🇺 Presidency Trio Context Template

**Template Purpose:** Council Trio Presidency overlay — legislative priorities, completed/pending files, handover timeline. Required for every horizon ≥ quarter.

**Methodology:** [forward-projection-methodology.md §4 (Trio rupture tripwire)](../methodologies/forward-projection-methodology.md#4-structural-break-detection) and [electoral-cycle-methodology.md §6](../methodologies/electoral-cycle-methodology.md)

**Min Lines:** 180 (`quarter-ahead`), 220 (`year-ahead`, `year-in-review`, `term-outlook`), 240 (`election-cycle`).

**Required by:** `quarter-ahead`, `year-ahead`, `year-in-review`, `term-outlook`, `election-cycle`. Optional for `quarter-in-review`.

---

## 📋 Header Block

```markdown
# Presidency Trio Context — {Trio designation} — {Run Date}

**Classification:** PUBLIC
**Active Trio:** {Country A → Country B → Country C} ({term-start} → {term-end})
**Current Presidency:** {Country, half-year}
**Trio Programme:** {URL or external-document ID}
**Source:** get_external_documents (workType: trio-programme, presidency-priorities)
```

---

## 🎯 Section 1 — Active-Trio Summary

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
timeline
    title 🇪🇺 Active Council Trio rotation (18 months)
    {H1 YYYY} : 🏛️ Trio[0] {Country A} — {headline priority}
    {H2 YYYY} : 🏛️ Trio[1] {Country B} — {headline priority}
    {H1 YYYY+1} : 🏛️ Trio[2] {Country C} — {headline priority}
    {H2 YYYY+1} : 🔄 Handover to next Trio
```

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
flowchart LR
    TRIO["🇪🇺 Trio programme"] --> PRI1["⚖️ Priority 1<br/>{Country sponsor}"]
    TRIO --> PRI2["⚖️ Priority 2<br/>{Country sponsor}"]
    TRIO --> PRI3["⚖️ Priority 3<br/>{Country sponsor}"]
    PRI1 --> EP1["📋 EP rapporteur<br/>(committee, group)"]
    PRI2 --> EP2["📋 EP rapporteur<br/>(committee, group)"]
    PRI3 --> EP3["📋 EP rapporteur<br/>(committee, group)"]
    EP1 --> ADOPT1["✅ Adoption window<br/>🟢/🟡/🔴"]
    EP2 --> ADOPT2["✅ Adoption window<br/>🟢/🟡/🔴"]
    EP3 --> ADOPT3["✅ Adoption window<br/>🟢/🟡/🔴"]

    style TRIO fill:#1565C0,color:#ffffff
    style PRI1 fill:#2E7D32,color:#ffffff
    style PRI2 fill:#FF9800,color:#000000
    style PRI3 fill:#7B1FA2,color:#ffffff
    style EP1 fill:#0288D1,color:#ffffff
    style EP2 fill:#0288D1,color:#ffffff
    style EP3 fill:#0288D1,color:#ffffff
    style ADOPT1 fill:#388E3C,color:#ffffff
    style ADOPT2 fill:#FFC107,color:#000000
    style ADOPT3 fill:#D32F2F,color:#ffffff
```

```markdown
| Slot | Country | Term | Lead minister(s) | Headline priority |
|---|---|---|---|---|
| Trio[0] (current) | {C} | H1/H2 YYYY | … | … |
| Trio[1] (next) | {C} | H1/H2 YYYY | … | … |
| Trio[2] (after) | {C} | H1/H2 YYYY | … | … |
```

---

## 📋 Section 2 — Trio Programme — Legislative Priorities

For each of the active Trio's declared headline priorities, document EP-side rapporteur and stage:

```markdown
| Priority | Trio sponsor | Procedure ID | EP rapporteur | Current stage | Adoption window | Status (🟢/🟡/🔴) |
|---|---|---|---|---|---|---|
| {priority} | {country} | {2024/...} | {name, group} | trilogue | Q3 2026 | 🟢 |
| … | … | … | … | … | … | … |
```

---

## 🔁 Section 3 — Files Inherited / Files to Hand Over

```markdown
### Inherited from previous Trio

| Procedure ID | Title | Stage at handover | Notes |
|---|---|---|---|
| 2024/0001(COD) | … | trilogue | Carried over from {prior Trio} — {months overdue} |

### To hand over to next Trio

| Procedure ID | Title | Expected stage at handover | Risk |
|---|---|---|---|
| 2024/0042(COD) | … | trilogue | 🟡 — likely to slip past handover |
```

---

## ⚠️ Section 4 — Handover Risk Assessment

```markdown
| Handover transition | Risk drivers | Likelihood × Impact (WEP) | Mitigation |
|---|---|---|---|
| {Country A → Country B}, {date} | {drivers — election overlap, programme misalignment, …} | Likely × High | {…} |
```

Trigger the **Trio rupture** structural-break tripwire (per [`forward-projection-methodology.md` §4](../methodologies/forward-projection-methodology.md#4-structural-break-detection)) when:

- Unilateral handover change announced.
- Programme suspension or formal repudiation by the incoming presidency.
- Lead minister resignation < 30 days before handover.

---

## 🤝 Section 5 — EP-Council Alignment Heatmap

For each Trio priority cross-referenced in §2, score the alignment between EP committee position and Council trilogue position on a 1–5 stress scale.

```markdown
| Priority | EP committee position | Council position | Stress (1–5) |
|---|---|---|---|
| {priority} | … | … | 3 |
```

---

## 🪞 Section 6 — Drift vs Prior Run

Compare against the previous `presidency-trio-context.md`. Surface any priority whose stage changed by ≥ 1 step or whose handover risk colour changed.

---

## 📝 Section 7 — Pass-2 Quality Self-Audit

```markdown
- [ ] All three Trio slots populated
- [ ] ≥ 3 declared priorities mapped to procedure IDs
- [ ] Inherited / to-hand-over tables populated
- [ ] Handover-risk WEP assessed for ≥ 1 upcoming handover
- [ ] EP-Council alignment heatmap populated
- [ ] Drift vs prior run reconciled
```

---

## ⚙️ Section 8 — Methodology Compliance

Cite the Trio programme document IDs (from `get_external_documents`) and any divergence from the published programme attributed to in-flight Council compromise.
