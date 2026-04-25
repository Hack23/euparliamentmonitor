<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📊 Historical Baseline Template — Metric Trending & Anchoring

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/historical-baseline.md`. Anchor every current metric to 30-day and 90-day baselines to distinguish rising from stable from declining trends. See [methodologies/per-artifact-methodologies.md §historical-baseline](../methodologies/per-artifact-methodologies.md#historical-baseline).

> **🎯 Purpose:** Comprehensive baseline comparison showing where the current run sits relative to recent history. Enables trend detection, anomaly identification, and "first occurrence" claims.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: HB-YYYY-MM-DD-runNN]` |
| **Current Run Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Baseline Window** | `[REQUIRED: 30-day and 90-day lookback]` |
| **Metrics Tracked** | `[REQUIRED: count]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Metric Roster

| Metric | Current | 30-Day Avg | 90-Day Avg | Trajectory | Confidence |
|--------|:-------:|:----------:|:----------:|:----------:|:----------:|
| `[REQUIRED: e.g. "Plenary sessions per month"]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |
| `[REQUIRED: e.g. "Texts adopted per session"]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |
| `[REQUIRED: e.g. "Roll-call votes per session"]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |
| `[REQUIRED: e.g. "EPP-S&D cohesion %"]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |
| `[REQUIRED: e.g. "Legislative pipeline velocity"]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |
| `[REQUIRED: e.g. "Committee meetings per week"]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |
| `[REQUIRED]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |

**Trajectory definitions:**
- ↑ Rising: Current > 90-day avg + 1 std dev
- → Stable: Current within ±1 std dev of 90-day avg
- ↓ Declining: Current < 90-day avg - 1 std dev

---

## 2️⃣ Metric Timeline Chart

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
xychart-beta
    title "[LEADING METRIC NAME] — 90-Day Trend"
    x-axis ["[date]", "[date]", "[date]", "[date]", "[date]", "[CURRENT]"]
    y-axis "[UNIT]" 0 --> 100
    line [[value], [value], [value], [value], [value], [CURRENT VALUE]]
```

**Chart note:** Highlight current run with distinct marker. Plot ≥6 data points spanning 90 days.

---

## 3️⃣ Records and Rarities

**Highest/Lowest since…**

| Category | Value | Record | Last Occurrence | Interpretation |
|----------|:-----:|--------|:---------------:|----------------|
| `[REQUIRED: e.g. "Highest texts adopted per session"]` | `[#]` | `[REQUIRED: "Highest since YYYY-MM-DD" OR "All-time record for EP10"]` | `[YYYY-MM-DD]` | `[REQUIRED: ≥30 words explaining significance]` |
| `[REQUIRED: e.g. "Lowest coalition cohesion"]` | `[%]` | `[REQUIRED]` | `[YYYY-MM-DD]` | `[REQUIRED]` |
| `[REQUIRED]` | `[value]` | `[REQUIRED]` | `[YYYY-MM-DD]` | `[REQUIRED]` |

**First occurrence in EP10:**

`[REQUIRED: list any metrics or events happening for the first time in this parliamentary term, or note "none identified". Justify against at least two prior periods.]`

**Return to baseline after anomaly:**

`[REQUIRED: list any metrics returning to 90-day baseline after deviation, or note "none". Explain what caused the deviation and return.]`

---

## 4️⃣ Cohort Comparisons

**Current run vs. comparable prior runs:**

| Cohort | Run IDs | Metric 1 | Metric 2 | Metric 3 | Notable Difference |
|--------|---------|:--------:|:--------:|:--------:|-------------------|
| `[REQUIRED: e.g. "Same quarter, prior year"]` | `[REQUIRED: list run IDs]` | `[value]` | `[value]` | `[value]` | `[REQUIRED: ≥30 words]` |
| `[REQUIRED: e.g. "Prior quarter, same year"]` | `[REQUIRED]` | `[value]` | `[value]` | `[value]` | `[REQUIRED]` |
| `[REQUIRED: e.g. "Term-to-date average"]` | `[REQUIRED]` | `[value]` | `[value]` | `[value]` | `[REQUIRED]` |

**Cohort narrative:**

`[REQUIRED: ≥100 words analyzing how the current run compares to its natural comparison groups. Is it representative, exceptional, or anomalous? What factors explain divergence?]`

---

## 5️⃣ Anomaly Highlights

**Metrics ≥2 standard deviations from 90-day mean:**

| Metric | Current | 90-Day Mean | Std Dev | Z-Score | Anomaly Type |
|--------|:-------:|:-----------:|:-------:|:-------:|:------------:|
| `[REQUIRED]` | `[value]` | `[value]` | `[σ]` | `[z]` | `[Positive / Negative]` |
| `[REQUIRED]` | `[value]` | `[value]` | `[σ]` | `[z]` | `[Positive / Negative]` |

**Anomaly narrative:**

`[REQUIRED: ≥100 words explaining each anomaly. Is it signal or noise? What upstream event or condition likely caused it? Should it trigger investigation or is it expected variation?]`

---

## 6️⃣ Confidence Caveats

**Where baselines are thin:**

`[REQUIRED: ≥80 words identifying metrics where 30-day or 90-day baseline has insufficient data points (<5 prior runs). Explain why baseline is incomplete and what this means for trajectory interpretation.]`

**Where baselines are unavailable:**

`[REQUIRED: list metrics tracked in this run but not in prior runs, making baseline comparison impossible. Note when baseline will stabilize (e.g. "after 5 runs").]`

**Data-source consistency:**

`[REQUIRED: note any changes in MCP endpoint behavior, data collection methodology, or calculation formulas between baseline period and current run that affect comparability.]`

> **⚠️ `monitor_legislative_pipeline` period calibration (Defect #6):** Runs
> produced before the v1.2.14+ MCP server upgrade (or any run where no
> `dateFrom`/`dateTo` was passed to v1.2.13) reported
> `period: { from: "2024-01-01", to: "2024-12-31" }` and
> `summary.totalProcedures: 0`. Any legislative-velocity or pipeline-health
> metric collected under the old default is **not comparable** to metrics from
> runs that supplied explicit rolling-window dates. Flag affected runs in the
> cohort table (§4) and exclude them from trajectory calculations until a
> consistent 5-run baseline is re-established.

---

## 7️⃣ Data Sources

**EP MCP tools used:** `get_all_generated_stats`, `monitor_legislative_pipeline({ dateFrom: $LAST_MONTH, dateTo: $TODAY })`, `compare_political_groups`
> **Note:** Pass explicit `dateFrom`/`dateTo` to `monitor_legislative_pipeline` — v1.2.13 defaults to calendar 2024 (empty pipeline). See §6️⃣ data-source consistency note.

**Prior runs consulted:**

| Run ID | Date | Path | Metrics Extracted |
|--------|:----:|------|-------------------|
| `[REQUIRED]` | `[YYYY-MM-DD]` | `[analysis/daily/{date}/{type}-runNN/]` | `[REQUIRED: list which metrics]` |
| `[REQUIRED]` | `[YYYY-MM-DD]` | `[path]` | `[REQUIRED]` |
| `[REQUIRED]` | `[YYYY-MM-DD]` | `[path]` | `[REQUIRED]` |

---

## 8️⃣ Forward Monitors

**Metrics to watch in next run:**

1. `[REQUIRED: metric name + what threshold would signal trend change]`
2. `[REQUIRED]`
3. `[REQUIRED]`

**Expected trajectory continuation:**

`[REQUIRED: ≥60 words predicting which metrics are likely to continue current trajectory vs. which may revert to mean.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/historical-baseline.md` · Template v1.0 · Depth floor: 190 lines.
