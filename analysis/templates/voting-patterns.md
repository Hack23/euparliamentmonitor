<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🗳️ Voting Patterns Template — European Parliament

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/voting-patterns.md`. Replace every `[REQUIRED]` marker with analysis derived from `get_voting_records`, `analyze_voting_patterns`, `analyze_coalition_dynamics`, and `compare_political_groups`. See [methodologies/per-artifact-methodologies.md §voting-patterns](../methodologies/per-artifact-methodologies.md#voting-patterns).

> **🎯 Purpose:** Group-by-group coalition arithmetic for the period. Answers "how did each political group behave, where did blocs cohere, where did they fracture, and which cross-group coalitions carried majorities?" Distinct from `coalition-dynamics.md` (alliance-pair focused) — this file is bloc-behaviour focused.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: VP-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: e.g. Q1 2026 (2026-01-01 to 2026-03-31)]` |
| **Roll-Call Votes Covered** | `[REQUIRED: count]` |
| **Plenary Sessions Covered** | `[REQUIRED: list of part-sessions]` |
| **Confidence** | `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW — explain in body if not HIGH]` |

---

## 1️⃣ Group Size & Theoretical Coalition Arithmetic

| Group | Seats | % of 720 | Role |
|-------|:-----:|:--------:|------|
| EPP | `[#]` | `[%]` | `[REQUIRED: one-line strategic role]` |
| S&D | `[#]` | `[%]` | `[REQUIRED]` |
| PfE | `[#]` | `[%]` | `[REQUIRED]` |
| ECR | `[#]` | `[%]` | `[REQUIRED]` |
| Renew | `[#]` | `[%]` | `[REQUIRED]` |
| Greens/EFA | `[#]` | `[%]` | `[REQUIRED]` |
| The Left | `[#]` | `[%]` | `[REQUIRED]` |
| ESN | `[#]` | `[%]` | `[REQUIRED]` |
| NI | `[#]` | `[%]` | `[REQUIRED]` |

**Majority threshold**: 361 votes (of 720). **Simple majority of votes cast**: varies by attendance.

---

## 2️⃣ Observed Coalition Patterns (Period)

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
graph LR
    %% Palette note: this diagram uses political-group colours (EPP blue, S&D red, Renew orange, Greens green, ECR light-blue)
    %% which intentionally differ from the general Hack23 semantic palette defined in ai-driven-analysis-guide.md §Colour legend.
    %% Party colours take precedence over the semantic palette whenever a diagram depicts named political groups.
    EPP[EPP<br/>[#]] ---|[agreement %]| SD[S&D<br/>[#]]
    SD ---|[agreement %]| REN[Renew<br/>[#]]
    EPP ---|[agreement %]| REN
    EPP -.-|[agreement %]| ECR[ECR<br/>[#]]
    REN ---|[agreement %]| GRE[Greens/EFA<br/>[#]]

    style EPP fill:#1565C0,color:#ffffff
    style SD fill:#D32F2F,color:#ffffff
    style REN fill:#FF9800,color:#000000
    style GRE fill:#2E7D32,color:#ffffff
    style ECR fill:#0288D1,color:#ffffff
```

| Coalition | Groups | Typical Majority | Use Cases | Cohesion (%) | Evidence |
|-----------|--------|:----------------:|-----------|:------------:|----------|
| Grand Centre | EPP + S&D + Renew | `[# votes]` | `[REQUIRED: policy domains]` | `[%]` | `[REQUIRED: ≥1 RCV ID]` |
| Progressive-Centrist | S&D + Renew + Greens/EFA + Left | `[# votes]` | `[REQUIRED]` | `[%]` | `[REQUIRED]` |
| Conservative-Right | EPP + ECR + selective PfE | `[# votes]` | `[REQUIRED]` | `[%]` | `[REQUIRED]` |
| Opposition Blocs | PfE + ECR + ESN | `[# votes]` | `[REQUIRED]` | `[%]` | `[REQUIRED]` |

---

## 3️⃣ Per-Group Behaviour

For each group: cohesion, defection highlights, sample votes.

### EPP
- **Internal cohesion**: `[REQUIRED: % with evidence — e.g. 91% across 567 RCVs]`
- **Dominant position**: `[REQUIRED: 1-2 sentences]`
- **Notable defections**: `[REQUIRED: ≥1 named MEP + RCV ID, or note "none observed this period"]`
- **Cross-group alliances**: `[REQUIRED: most frequent partners]`

### S&D
- **Internal cohesion**: `[REQUIRED]`
- **Dominant position**: `[REQUIRED]`
- **Notable defections**: `[REQUIRED]`
- **Cross-group alliances**: `[REQUIRED]`

### Renew
- **Internal cohesion**: `[REQUIRED]`
- **Dominant position**: `[REQUIRED]`
- **Notable defections**: `[REQUIRED]`
- **Cross-group alliances**: `[REQUIRED]`

### Greens/EFA
- **Internal cohesion**: `[REQUIRED]`
- **Dominant position**: `[REQUIRED]`
- **Notable defections**: `[REQUIRED]`
- **Cross-group alliances**: `[REQUIRED]`

### ECR
- **Internal cohesion**: `[REQUIRED]`
- **Dominant position**: `[REQUIRED]`
- **Notable defections**: `[REQUIRED]`
- **Cross-group alliances**: `[REQUIRED]`

### PfE
- **Internal cohesion**: `[REQUIRED]`
- **Dominant position**: `[REQUIRED]`
- **Notable defections**: `[REQUIRED]`
- **Cross-group alliances**: `[REQUIRED]`

### The Left
- **Internal cohesion**: `[REQUIRED]`
- **Dominant position**: `[REQUIRED]`
- **Notable defections**: `[REQUIRED]`
- **Cross-group alliances**: `[REQUIRED]`

### ESN / NI
- **Behaviour notes**: `[REQUIRED: aggregate position given fragmentation]`

---

## 4️⃣ Bloc-Behaviour Index

| Bloc | Members | Votes Won | Votes Lost | Win Rate | Trend vs. Prior Period |
|------|---------|:--------:|:--------:|:--------:|:---------------------:|
| Grand Centre | `[EPP+S&D+Renew]` | `[#]` | `[#]` | `[%]` | `[↑ / → / ↓]` |
| Progressive-Centrist | `[S&D+Renew+Greens+Left]` | `[#]` | `[#]` | `[%]` | `[↑ / → / ↓]` |
| National-Right | `[PfE+ECR+ESN]` | `[#]` | `[#]` | `[%]` | `[↑ / → / ↓]` |
| EPP-led right | `[EPP+ECR±PfE]` | `[#]` | `[#]` | `[%]` | `[↑ / → / ↓]` |

---

## 5️⃣ Stress Points & Outlier Votes

| RCV ID | Topic | Outcome | Why outlier? | Coalition flipped? |
|--------|-------|---------|--------------|:------------------:|
| `[REQUIRED]` | `[REQUIRED]` | `[For/Against/Abstain counts]` | `[REQUIRED: ≥30 words]` | `[yes/no]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[REQUIRED]` | `[...]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` | `[REQUIRED]` | `[...]` |

≥3 outlier votes required.

---

## 6️⃣ Forward Implications

| Upcoming Vote | Expected Coalition | Confidence | What would flip it |
|---------------|--------------------|:----------:|--------------------|
| `[REQUIRED: plenary date + topic]` | `[REQUIRED]` | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[🟢/🟡/🔴]` | `[REQUIRED]` |

≥3 forward forecasts.

---

## 7️⃣ Confidence Ledger

- ✅ **Roll-call IDs present**: `[count cited in this file]`
- ⚠️ **Aggregate vs. per-MEP**: `[REQUIRED: note where EP roll-call delay limits claims to LOW]`
- 🔬 **Tools used**: `analyze_voting_patterns`, `analyze_coalition_dynamics`, `compare_political_groups`, `get_voting_records` (per session)

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/voting-patterns.md` · Template v1.1 · Depth floor: per article-type minimum defined in [`../methodologies/reference-quality-thresholds.json`](../methodologies/reference-quality-thresholds.json) (authoritative — e.g. breaking 150, week-in-review 150, month-in-review 180, motions 200).
