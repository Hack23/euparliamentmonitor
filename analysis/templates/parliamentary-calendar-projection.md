<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📅 Parliamentary Calendar Projection Template

**Template Purpose:** Plenary/committee calendar walk-forward (3- or 12-month) annotated with rapporteur deadlines, Council Presidency handovers, EU summits, Commission Work Programme milestones.

**Methodology:** [forward-projection-methodology.md §1, §5](../methodologies/forward-projection-methodology.md)

**Min Lines:** 200 (`quarter-ahead`), 240 (`year-ahead`).

**Required by:** `quarter-ahead`, `year-ahead`, `term-outlook`. Optional for `quarter-in-review`.

---

## 📋 Header Block

```markdown
# Parliamentary Calendar Projection — {Article-Type Slug} — {Run Date}

**Classification:** PUBLIC
**Horizon:** {next 90 days | next 12 months | run date → next-EP-election}
**Plenary Sessions Covered:** {N}
**Council Trio Active:** {trio designation}
**Commission WP Year:** {YYYY}
```

---

## 🗓️ Section 1 — Walk-Forward Calendar Table

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","secondaryBorderColor":"#0F3F00","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","tertiaryBorderColor":"#7F4F00","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","noteBorderColor":"#7F6000","errorBkgColor":"#D32F2F","errorTextColor":"#ffffff","fontFamily":"Inter, Helvetica, Arial, sans-serif","pie1":"#1565C0","pie2":"#2E7D32","pie3":"#FF9800","pie4":"#D32F2F","pie5":"#FFC107","pie6":"#7B1FA2","pie7":"#9E9E9E","pie8":"#0288D1","pie9":"#388E3C","pie10":"#F57C00","pie11":"#C62828","pie12":"#FBC02D","pieTitleTextSize":"18px","pieSectionTextSize":"14px","pieLegendTextSize":"13px","pieStrokeColor":"#1e1e1e","pieOuterStrokeColor":"#1e1e1e","git0":"#1565C0","git1":"#2E7D32","git2":"#FF9800","git3":"#D32F2F","gitBranchLabel0":"#ffffff","gitBranchLabel1":"#ffffff","gitBranchLabel2":"#000000","gitBranchLabel3":"#ffffff","cScale0":"#1565C0","cScale1":"#2E7D32","cScale2":"#FF9800","cScale3":"#D32F2F","cScale4":"#FFC107","cScale5":"#7B1FA2","cScale6":"#9E9E9E","cScale7":"#0288D1","xyChart":{"backgroundColor":"#1e1e1e","plotColorPalette":"#1565C0,#2E7D32,#FF9800,#D32F2F,#FFC107,#7B1FA2,#9E9E9E"}}}}%%
gantt
    title 📅 Walk-forward parliamentary calendar
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    section 🏛️ Plenary weeks
    Plenary {YYYY-W{NN}} (Strasbourg) :crit, plen1, {YYYY-MM-DD}, 4d
    Plenary {YYYY-W{NN}} (Strasbourg) :crit, plen2, after plen1, 30d
    section 📋 Committee weeks
    Committee weeks :active, comm, {YYYY-MM-DD}, 21d
    section 🤝 Council Presidency
    Trio carry-over (Council {Country}) :pres, {YYYY-MM-DD}, 90d
    section ⚖️ Trilogue windows
    Trilogue R1 {procedure} :tri1, {YYYY-MM-DD}, 14d
    Trilogue R2 {procedure} :tri2, after tri1, 21d
    section 🌴 Recess
    Recess (Aug) :rec, {YYYY-08-01}, 30d
```

> **AI Agent:** Replace `{YYYY-MM-DD}`, `{YYYY-W{NN}}`, `{Country}`, and
> `{procedure}` with values from `get_plenary_sessions`, the EU Council
> calendar, and `intelligence/legislative-pipeline-forecast.md`.

One row per plenary or committee week within the horizon:

```markdown
| Week | Plenary / Committee | Location | Key dossiers (rapporteur stage) | Council Presidency event | EUCO / summit | Commission WP milestone |
|---|---|---|---|---|---|---|
| 2026-W22 | Plenary | Strasbourg | EUDR review (rapp ITRE) | DK presidency closeout | Council 28-29 May | WP2026 quarterly review |
| 2026-W23 | Committee | Brussels | … | DK→FI handover | — | — |
| … | … | … | … | … | … | … |
```

Source for plenary dates: `get_plenary_sessions` per-month fan-out (per [`07-mcp-reference.md`](../../.github/prompts/07-mcp-reference.md)). Council Presidency / Trio data: `get_external_documents`.

---

## 🎯 Section 2 — Critical-Path Dossiers

For the top-N dossiers whose schedule sits on the critical path of the horizon:

```markdown
### {Dossier title} — {procedure ID}

- **Rapporteur:** {name, group}
- **Rapporteur deadline:** {date}
- **Plenary milestone:** {date}
- **Trilogue checkpoints:** {dates}
- **Bottleneck risk:** {WEP band, see legislative-pipeline-forecast.md row}
- **Slippage indicators:** {…}
```

---

## 🤝 Section 3 — Council Presidency / Trio Overlay

Document the active and incoming Trio Presidencies, their declared legislative priorities and handover risks. Link to [`presidency-trio-context.md`](./presidency-trio-context.md).

```markdown
| Presidency | Term | Declared priorities | Files inherited | Files to hand over | Handover risk |
|---|---|---|---|---|---|
| {Country} | H1 2026 | … | … | … | 🟢 / 🟡 / 🔴 |
| {Country} | H2 2026 | … | … | … | 🟢 / 🟡 / 🔴 |
```

---

## 📜 Section 4 — Commission WP Milestones

Cross-link Commission Work Programme line items active in the horizon to EP rapporteur stages. Link to [`commission-wp-alignment.md`](./commission-wp-alignment.md).

```markdown
| WP item | Adopted? | EP-side stage | Plenary checkpoint | Status |
|---|---|---|---|---|
| {WP-2026 #} | ✅ / 🟡 / ❌ | committee / plenary | {date} | {short} |
```

---

## 🚦 Section 5 — Slippage & Recess Risk

Mark the recess windows and predict slippage risk for dossiers crossing them.

```markdown
| Recess | Window | Affected dossiers | Slippage risk |
|---|---|---|---|
| Summer recess | {dates} | {…} | 🟢 / 🟡 / 🔴 |
| Winter recess | {dates} | {…} | 🟢 / 🟡 / 🔴 |
```

---

## 🌐 Section 6 — External Calendar Anchors

Optional but encouraged: G7/G20, NATO, US/UK calendars relevant to EP foreign-affairs dossiers.

---

## 📝 Section 7 — Pass-2 Quality Self-Audit

```markdown
- [ ] Calendar table covers every plenary week in the horizon
- [ ] Top-3 critical-path dossiers fully detailed
- [ ] Trio Presidency table populated for current + next presidency
- [ ] Recess windows marked with slippage risk
- [ ] Commission WP cross-links present where applicable
```

---

## ⚙️ Section 8 — Methodology Compliance

Note any data gaps (e.g. EP MCP calendar feed in recess mode) and the fallback applied.
