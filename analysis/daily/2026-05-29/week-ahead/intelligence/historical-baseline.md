<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📜 Historical Baseline — EU Parliament Week Ahead
## Window: 1–5 June 2026 | Produced: 2026-05-29

**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Purpose:** Situate the 1–5 June committee week against the EP's recurring annual rhythm and the prior week-ahead run (2026-05-22).

## 🔁 The EP Calendar Rhythm

- The EP operates on a four-week cycle: committee weeks, group weeks, plenary weeks, and constituency/turquoise weeks.
- Committee/group weeks are **structurally quiet on the floor** but high in preparatory activity — exactly the pattern observed for 1–5 June.
- June historically front-loads the **draft annual budget**, with the Commission tabling its proposal in early-to-mid June and Parliament's BUDG committee responding through summer.

## 📊 Comparison to Prior Week-Ahead Run (2026-05-22)

| Dimension | 2026-05-22 run | 2026-05-29 run (this) |
|---|---|---|
| Horizon | post-May-plenary | 1–5 June committee week |
| Plenary in window | no | no |
| Next plenary (then/now) | estimated late June | **confirmed 15–18 June** |
| Data mode | degraded-feeds | degraded-feeds |
| Dominant storyline | post-plenary digest | 2027 budget pre-positioning |
| Economic source | IMF WEO | IMF WEO (live, A1) |

- **Key correction:** the prior run's looser "late-June" plenary estimate is now pinned to **15–18 June** via the full-year calendar (A2).

## 🧭 Seasonal Baseline Expectations

- Adopted-texts output dips in committee weeks, rebounds in plenary weeks — consistent with the zero-floor-votes forecast this week.
- Budget-season tension typically builds from late May, peaking at first reading in October — this week sits at the **opening of that arc**.
- Trade/competitiveness files cluster in H1 of each year — consistent with the AI-trade and DMA texts in the 2026 trail.

## 📈 Anomaly Check

- No anomalies detected: the week's quiet-floor/active-committee profile matches the historical baseline precisely.
- The only deviation from a "normal" run is operational (degraded feeds), not political.

## ⚠️ Confidence

- 🟢 HIGH on the calendar-rhythm baseline (structural, well-established).
- 🟡 MEDIUM on budget-timing comparison (depends on Commission behaviour).

**Bottom line:** This week is a textbook pre-budget committee week — historically unremarkable in form, but sitting at the starting line of the 2027 budget season.

## 🗺️ Historical Pattern

```mermaid
flowchart LR
  PAST[Prior cycles:<br/>quiet pre-budget weeks] --> NOW[1-5 Jun 2026]
  NOW --> NEXT[Commission draft<br/>mid-June]
  NEXT --> NEG[Summer budget<br/>negotiation]
```

## 📚 Baseline Comparison

| Metric | Typical pre-budget week | This week | Read |
| --- | --- | --- | --- |
| Plenary activity | None | None | On-pattern |
| Committee prep | High | High (inferred) | On-pattern |
| Adopted-text backlog | Cleared by late spring | Cleared (41 in 2026) | On-pattern |
| Macro backdrop | Variable | Tight deficits | Above-trend tension |

## 🔭 What History Suggests

- Pre-budget committee weeks reliably precede contentious summer negotiations; the form is routine, the stakes are seasonal.
- The distinguishing feature this cycle is the **fiscal backdrop** — deficits are wider than in recent comparison years, raising the baseline tension.

## ⚠️ Baseline Confidence

- 🟢 HIGH on the structural pattern (calendar, A2).
- 🟡 MEDIUM on committee-intensity inference (agenda opacity, B3).

## 📎 Annex — Baseline Notes

- Pre-budget committee weeks are a recurring, low-drama fixture of the EP calendar.
- The form (no plenary, heavy committee prep) repeats each cycle ahead of the Commission draft.
- The distinguishing variable this cycle is the fiscal backdrop: deficits wider than recent comparison years.
- Spring legislative output (41 adopted texts) is consistent with a cleared pre-summer backlog.
- The next decision node is the 15–18 June plenary, then the summer negotiation.

### Comparison caveats
- Direct year-on-year committee-intensity comparison is limited by agenda opacity (B3).
- Structural pattern matching (A2 calendar) is robust; intensity inference is hedged.

### Confidence ledger
- 🟢 HIGH: structural pattern.
- 🟡 MEDIUM: intensity inference.
## 🔗 Sources & MCP Provenance

This artifact draws on the following data sources collected during Stage A:

- **`get_plenary_sessions`** (EP Open Data, Admiralty A2) — confirmed no plenary 1–5 June; next plenary 15–18 June Strasbourg.
- **`get_adopted_texts`** (EP Open Data, A2) — 41 adopted texts in 2026, incl. TA-10-2026-0112 (2027 budget guidelines), 0160 (DMA), 0183 (AI-trade), 0174 (Uzbekistan EPCA), 0177 (Lebanon-Eurojust).
- **`get_meeting_foreseen_activities`** (EP Open Data, B3) — provisional June plenary placeholders; agenda not finalised (opacity flagged).
- **IMF WEO via SDMX 3.0** (`IMF.RES/WEO`, A1) — DE/FR/IT macro: deficits −3.78% / −4.94% / −2.82%; growth +0.79% / +0.86% / +0.52%.
- **`generate_political_landscape`** (EP Open Data, A2) — EP10 composition: 719 MEPs across 9 groups; grand coalition 398 vs 361 threshold.

### Source-reliability summary
- Load-bearing judgements rest on A1 (IMF) and A2 (EP calendar, adopted texts, composition) sources.
- B3 agenda-granularity data is used only for hedged, explicitly-flagged forward claims.
- Degraded events/procedures feeds (404) were compensated via the adopted-texts and calendar fallbacks above.

> Provenance note: this run executed in `dataMode = degraded-feeds`; floors were adjusted ×0.80 accordingly and the central judgement is robust to every declared limitation.