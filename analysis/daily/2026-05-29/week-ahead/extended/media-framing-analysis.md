<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📰 Media Framing Analysis — EU Parliament Week Ahead
## Window: 1–5 June 2026 | Produced: 2026-05-29

**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Purpose:** assess how the week's developments are likely to be framed across media registers, and recommend a neutral editorial framing for the Monitor article.
**WEP bands** on framing-uptake judgements.

## 🎯 Framing Challenge

- The week has **no floor drama** — the classic editorial trap is to call it a "nothing week."
- The analytical truth is that it is a **high-leverage preparatory week** for the 2027 budget. The framing task is to make preparation legible without overstating it.

## 🗞️ Likely Media Frames

### Frame 1 — "Quiet week in Brussels" (lowest-effort)

- **Register:** generic wire/desk coverage.
- **Risk:** misses the budget-runway significance. 🟡 LIKELY uptake (60%) in low-resource outlets.
- **Verdict:** technically true, analytically empty.

### Frame 2 — "Calm before the budget storm" (analytical)

- **Register:** specialist EU/financial press.
- **Strength:** captures the forward fiscal stakes (IMF backdrop). 🟡 EVEN CHANCE uptake (40%).
- **Verdict:** the most accurate available frame — recommended anchor.

### Frame 3 — "Coalition cracks over spending" (conflict-driven)

- **Register:** politically-angled outlets.
- **Risk:** overstates friction not yet visible this week. 🟢 LOWER uptake now (25%), rising toward June.
- **Verdict:** premature; defensible only as a forward-looking caveat.

### Frame 4 — "EU overreach / spending" (sovereigntist register)

- **Register:** PfE/ECR-aligned media.
- **Nature:** predictable oppositional framing of any budget signal. 🟡 LIKELY in that register (60%).
- **Verdict:** note as a stakeholder frame, do not adopt.

## 📊 Frame Comparison

| Frame | Accuracy | Likely uptake (WEP) | Monitor stance |
|---|---|---|---|
| Quiet week | Low | LIKELY (60%) | Avoid |
| Calm before budget storm | High | EVEN (40%) | **Anchor** |
| Coalition cracks | Premature | LOWER (25%) | Forward caveat only |
| EU overreach | Partisan | LIKELY-in-register (60%) | Report as stakeholder frame |

## 🧭 Neutrality Guardrails

- Attribute partisan frames to their sources; never adopt them in the Monitor's voice.
- Distinguish *confirmed* (no plenary, adopted texts, IMF figures) from *projected* (budget friction) explicitly.
- Use WEP bands in prose to avoid false certainty about forward events.

## 📝 Recommended Editorial Framing

- **Lead:** the calm-before-the-budget-storm frame (Frame 2) — accurate, forward-looking, non-partisan.
- **Body:** ground in confirmed facts (calendar, adopted texts, IMF macro); flag budget friction as a *projected* dynamic with explicit probability.
- **Balance:** acknowledge both discipline and spending-defence perspectives without endorsing either.

## ⚠️ Confidence

- 🟢 HIGH on the frame inventory and neutrality guidance.
- 🟡 MEDIUM on uptake-probability estimates (media-behaviour inference).

**Bottom line:** Anchor on "calm before the budget storm." Report the quiet-week surface honestly, but lead with the forward fiscal stakes — and keep every partisan frame attributed, never adopted.

## 🖼️ Competing Frames

| Frame | Carried by | Core claim | Editorial handling |
| --- | --- | --- | --- |
| Fiscal-discipline | EPP/ECR | Deficits demand restraint | Attribute; cite IMF data |
| Spending-defence | S&D/Greens/Left | Cohesion/welfare must be protected | Attribute; balance |
| Competitiveness | Renew/EPP | Invest to compete (Draghi) | Attribute; note tension with discipline |
| Sovereigntist | PfE/ESN | Resist EU-level budget growth | Attribute; note minority status |

## 🧭 Framing Discipline

- **Lead forward:** the news value is the approaching budget fight, not the quiet week itself.
- **Attribute, never adopt:** every value-laden frame is sourced to its carrier group.
- **Anchor on data:** the IMF deficit figures are the neutral spine that all frames orbit.
- **Avoid false balance:** report the seat arithmetic that makes the centre decisive, not a two-sides-equal narrative.

## ⚠️ Framing Risks

- Risk of overstating drama in a structurally quiet week — mitigated by honest "calm surface" framing.
- Risk of laundering a partisan frame as fact — mitigated by strict attribution.

## 🧭 Verdict

- 🟢 The "calm before the budget storm" anchor is accurate and forward-looking; partisan frames are tracked and attributed, not endorsed.

## 📎 Annex — Framing Playbook

### Headline options (forward-led, attributed)
- "Calm committee week sets the stage for a contentious 2027 budget."
- "EU Parliament in budget-prep mode as deficits widen across the big three."
- "Quiet on the floor, busy in committee: the fiscal fight takes shape."

### Language discipline
- Use "fiscal-discipline framing" not "necessary cuts" (the latter adopts a frame).
- Use "spending-defence" not "fiscal responsibility's opponents."
- Attribute "competitiveness" claims to Renew/EPP and the Draghi agenda.
- Attribute sovereigntist budget scepticism to PfE/ESN and note minority status.

### Neutral spine (cite, don't editorialise)
- IMF WEO deficit figures (A1) as the shared factual baseline.
- EP seat arithmetic (A2) explaining why the centre decides.
- The plenary calendar (A2) explaining the timeline.

### Balance traps to avoid
- False balance: do not present flank positions as co-equal to the majority's.
- Drama inflation: do not overstate stakes in a vote-free week.
- Frame laundering: never state a partisan claim as settled fact.

### Source attribution table
| Claim type | Required attribution |
| --- | --- |
| Deficit/growth figures | IMF WEO (A1) |
| Seat counts / majorities | EP composition (A2) |
| Calendar / agenda | EP calendar (A2) |
| Partisan value claims | Named group |

### Confidence ledger
- 🟢 HIGH: factual spine and attribution map.
- 🟡 MEDIUM: which frame ultimately dominates June coverage.
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