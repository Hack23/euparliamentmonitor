<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🔭 Forward Projection Template

**Template Purpose:** Master forward-projection artifact for prospective horizons ≥ 90 days. Provides WEP-banded probability tables, structural-break tripwires, reference-class table, and Mermaid timeline-with-branches.

**Methodology:** [forward-projection-methodology.md](../methodologies/forward-projection-methodology.md)

**Min Lines:** 280 (`quarter-ahead`), 340 (`year-ahead`), 360 (`term-outlook`), 400 (`election-cycle`)

**Required by:** `quarter-ahead`, `year-ahead`, `term-outlook`, `election-cycle`. Optional for `quarter-in-review` (carry-forward review of prior projections).

---

## 📋 Header Block

```markdown
# Forward Projection — {Article-Type Slug} — {Run Date}

**Classification:** PUBLIC
**Horizon:** {next 90 days | next 12 months | EP10 → 2029 | EP10 → EP11 (2029)}
**Run Date:** {ISO date}
**Reference-Class Sample Size:** {N analogues}
**Structural-Break Status:** {none | armed | regime-change-branch-active}
**Linked Artifacts:** scenario-forecast.md · legislative-pipeline-forecast.md · parliamentary-calendar-projection.md · forward-indicators.md
```

---

## 🎯 Section 1 — Executive Forecast

A short BLUF block stating the **three** highest-probability outcomes for the horizon, each with a WEP band and an explicit reference-class anchor.

```markdown
**BLUF**

1. **{Outcome 1}** — {WEP band, e.g. "Likely (60–85%)"} over {horizon}. Reference class: {N analogues from historical-baseline.md}. Lead indicators: {…}.
2. **{Outcome 2}** — {WEP band}. Reference class: {…}.
3. **{Outcome 3}** — {WEP band}. Reference class: {…}.
```

---

## 🧮 Section 2 — Reference-Class Table (≥ 6 entries)

Pull from [`historical-baseline.md`](./historical-baseline.md) and `data/voting-records.json` / `data/procedures-feed.json`.

```markdown
| # | Forecast subject | Reference class | Sample size | Base rate | Source |
|---|---|---|---|---|---|
| 1 | Trilogue completion within 90d on file type X | Last 24 months trilogues, type X | N=… | … % | data/voting-records.json |
| 2 | Coalition cohesion drop > 10 pts | EP9–EP11 quarterly cohesion deltas | N=… | … % | historical-baseline.md §Coalition baselines |
| 3 | Presidency-Trio handover delay | Last 5 Trios | N=5 | … % | presidency-trio-context.md |
| 4 | Spitzenkandidaten flip | EP9–EP11 lead-candidate dynamics | N=… | … % | historical-baseline.md §Electoral baselines |
| 5 | Article-7 escalation | All Article-7 invocations to date | N=… | … % | external-documents feed |
| 6 | EP president vacancy mid-term | EP6–EP11 | N=… | … % | corporate-bodies-feed |
```

---

## 📈 Section 3 — Horizon-Conditional WEP Forecast Table

Apply the decay table from [`forward-projection-methodology.md` §3](../methodologies/forward-projection-methodology.md#3-wep-decay-table). For each forecast row, the band must match the horizon and reference-class size.

```markdown
| Forecast | Horizon | WEP band | Probability | Confidence | Reference class | Tripwires |
|---|---|---|---|---|---|---|
| {forecast} | T+90d | Likely | 60–85% | High | RC #1 | {what would push to "About even"} |
| {forecast} | T+12m | About even | 40–60% | Medium | RC #2 | {…} |
| {forecast} | T+term | Unlikely | 15–40% | Medium | RC #3 | {…} |
| {forecast} | T+election | Highly unlikely | 5–15% | Low | RC #4 | {…} |
```

At least one judgement at the horizon's floor band per [`forward-projection-methodology.md` §3](../methodologies/forward-projection-methodology.md#3-wep-decay-table) — otherwise the artifact is shallow.

---

## ⚠️ Section 4 — Structural-Break Tripwires

For each tripwire in [`forward-projection-methodology.md` §4](../methodologies/forward-projection-methodology.md#4-structural-break-detection) state the current value, threshold, and status.

```markdown
| Tripwire | Threshold | Current value | Status | Next check |
|---|---|---|---|---|
| Coalition cohesion drop | ≥ 10 pts | … | 🟢 / 🟡 / 🔴 | … |
| National-government changes | ≥ 3 within horizon | … | 🟢 / 🟡 / 🔴 | … |
| Presidency-Trio rupture | unilateral handover | none | 🟢 | next handover |
| Treaty-revision IGC | EUCO announcement | none | 🟢 | next EUCO |
| Article-7 / sanctions | trigger / formal step | … | 🟢 / 🟡 / 🔴 | … |
| EP president vacancy | resignation / removal | none | 🟢 | … |
```

If any tripwire is 🔴 or two tripwires 🟡, link to the regime-change branch in [`scenario-forecast.md`](./scenario-forecast.md).

---

## 🌳 Section 5 — Mermaid Timeline-with-Branches

Required Mermaid block. Branches correspond to scenario IDs from [`scenario-forecast.md`](./scenario-forecast.md).

```mermaid
%%{ init: { 'theme': 'default' } }%%
gitGraph
    commit id: "T+0 Run date"
    branch mainline
    commit id: "T+30d milestone"
    commit id: "T+90d milestone"
    branch alt-adjacent
    commit id: "S2 split @ T+45d"
    checkout mainline
    commit id: "T+12m milestone"
    branch regime-change
    commit id: "Tripwire fires @ T+M"
    checkout mainline
    commit id: "Term end / election"
```

---

## 🎯 Section 6 — Carry-Forward & Forward-Statement Hygiene

Reconcile this run's projections against open `forward-statements-registry` entries.

```markdown
| Open statement (id) | First seen | Original horizon | Status | Evidence |
|---|---|---|---|---|
| {id} | {run-id} | {date} | resolved / stale / extended | {citation} |
```

Stage C raises 🔴 when > 2 unresolved expired entries land here.

---

## 🔬 Section 7 — Outside-View Audit

For each headline forecast, name the **inside-view** narrative the analyst would prefer **and** the **outside-view** base rate from §2 — and explain why the outside view dominates (or doesn't).

```markdown
### Outside-View Audit Entry — {forecast}

- **Inside view (analyst narrative):** {…}
- **Outside view (reference class base rate):** {…}
- **Reconciliation:** {analyst goes with outside view because …, OR overrides with N% confidence because …}
```

---

## 🧪 Section 8 — Devil's-Advocate Alternatives

At least one paragraph per major forecast challenging the WEP band; explicitly cite [`devils-advocate-analysis.md`](./devils-advocate-analysis.md) when the alternative is fully developed there.

---

## 📝 Section 9 — Pass-2 Quality Self-Audit

Tick-box grid filled in Pass 2:

```markdown
- [ ] Reference class ≥ 6 entries
- [ ] WEP bands tighten or widen with horizon (no "About even" cluster)
- [ ] Tripwires evaluated with current value
- [ ] Mermaid timeline includes ≥ 1 alternative branch
- [ ] Carry-forward hygiene resolves all expired statements
- [ ] Outside-view audit covers every headline forecast
- [ ] Devil's-advocate alternative attached to ≥ 50% of headline forecasts
```

---

## ⚙️ Section 10 — Methodology Compliance Notes

Free-text section noting any deviation from [`forward-projection-methodology.md`](../methodologies/forward-projection-methodology.md) and the justification (data gap, sample-size constraint, etc.).
