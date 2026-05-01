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
