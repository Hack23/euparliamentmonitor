<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Worked example — `risk-scoring/risk-matrix.md`

> 📎 Companion methodology: [`political-risk-methodology.md`](../political-risk-methodology.md) ·
> Companion template: [`risk-matrix.md`](../../templates/risk-matrix.md)
>
> **Illustrative excerpt only.** Likelihood and impact scores below are
> derived from a real 2026-Q1 EP run on AI-Act implementation; values are
> rounded for teaching. Do not republish.

## Frame

> **Subject of the matrix.** Adoption of Procedure 2025/0142(COD) — AI-Act-implementation Regulation — at first reading on 2026-04-23.
>
> **Risk class.** Procedural / coalition / inter-institutional risk to the file's first-reading adoption.

## Scoring rubric (anchored to `political-risk-methodology.md` §2)

| Axis | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **Likelihood** (next 14 days) | Very Unlikely (<10%) | Unlikely (10–35%) | Roughly even (35–55%) | Likely (55–80%) | Very Likely (>80%) |
| **Impact** on adoption | Negligible | Minor delay | Adoption at risk | Adoption likely fails | Adoption fails + downstream harm |

Bands map to [`osint-tradecraft-standards.md`](../osint-tradecraft-standards.md) §3.1 Words of Estimative Probability.

## Risk register (≥5 named risks)

### R1 — Hungarian Council reservation on Article 12.4 unresolved by 2026-04-21

- **Likelihood:** 4 / Likely *(Council document 9123/26 dated 2026-03-15; no withdrawal communicated as of 2026-04-09; COREPER 2026-04-17 may resolve)*
- **Impact:** 4 / Adoption likely fails *(reservation provides ECR a procedural rationale to oppose; pulls 41 votes into deficit)*
- **Trigger event(s):**
  - 2026-04-17 COREPER outcome — explicit withdrawal lowers Likelihood to 2.
  - 2026-04-19 ITRE shadow meeting — silence on Article 12.4 keeps Likelihood at 4.
- **Indicators (≥3, dated):**
  1. `get_external_documents` 2026-04-17 evening release — search for "12.4" in updated Council mandate.
  2. `get_speeches` 2026-04-22 plenary debate — Hungarian MEP intervention on Article 12.4.
  3. Politico Pro brief 2026-04-18 (graded B-3) — re-check trilogue path.
- **Mitigation owner:** EP rapporteur, Belgian Council Presidency.
- **Mitigation:** Pre-cleared compromise on Article 12.4 high-risk-system list; alternative wording delivered to COREPER on 2026-04-15.
- **Residual risk after mitigation:** Likelihood 2 / Impact 4 → mid-cell.
- **Confidence in scoring:** High (multiple independent EP MCP + Council sources).

### R2 — Greens/EFA group withholds majority of seats on Article 12.4

- **Likelihood:** 3 / Roughly even *(group whip not yet declared; Reintke speech 2026-03-12 signals dissatisfaction)*
- **Impact:** 4 / Adoption likely fails *(53 *illustrative* seats withheld → 27-vote deficit even with Renew backfill)*
- **Trigger event(s):**
  - 2026-04-19 Greens group meeting — public whip line announcement.
  - 2026-04-21 ITRE shadow concord — three-of-seven Greens amendments adopted lowers Likelihood to 1.
- **Indicators (dated):**
  1. `get_speeches` 2026-04-22 — Reintke or co-shadow tone.
  2. EP press service publication of group whip lines 2026-04-19.
  3. `analyze_voting_patterns` previous week — Greens cohesion drift.
- **Mitigation owner:** S&D shadow rapporteur, EPP rapporteur.
- **Mitigation:** Open Article 12.4 narrow concession by 2026-04-19; lock three Greens amendments.
- **Residual risk after mitigation:** Likelihood 1 / Impact 4.
- **Confidence in scoring:** High.

### R3 — ECR procedural amendments delay vote past 2026-04-23

- **Likelihood:** 2 / Unlikely *(Procaccini speech 2026-04-08 signals intent but no amendment text filed)*
- **Impact:** 3 / Adoption at risk *(slippage into May plenary delays trilogue start, raising trilogue-failure probability)*
- **Trigger event(s):**
  - 2026-04-15 amendment deadline — filing of procedural amendments.
  - Plenary President's order-of-voting decision 2026-04-22.
- **Indicators (dated):**
  1. EP amendment register 2026-04-15 — search for ECR procedural filings.
  2. `get_speeches` 2026-04-22 — opening interventions.
  3. EP Bureau scheduling note 2026-04-21.
- **Mitigation owner:** EP rapporteur, EPP comms.
- **Mitigation:** Pre-emptive procedural defence; coordinate with S&D and Renew on order-of-voting.
- **Residual risk after mitigation:** Likelihood 1 / Impact 2.
- **Confidence in scoring:** Moderate (single-source intent signal).

### R4 — Industry Council coalition fragments on enforcement scope (Article 22)

- **Likelihood:** 2 / Unlikely *(11 of 14 papers favour adoption as of 2026-04-01)*
- **Impact:** 2 / Minor delay *(loss of public-cover air support; not vote-arithmetic decisive)*
- **Trigger event(s):**
  - 2026-04-12 industry-coalition steering meeting — fragmentation watchpoint.
  - Public press release from any of the 14 associations 2026-04-15 to 2026-04-22.
- **Indicators (≥3, dated):**
  1. `get_committee_documents` weekly update through 2026-04-22 — search for industry-coalition position documents.
  2. Press monitoring of EU-level association websites 2026-04-12 to 2026-04-22 (Admiralty grade C-3 typical).
  3. Politico Pro / ENDS Europe brief 2026-04-14 (graded B-3) — industry coalition cohesion signal.
- **Mitigation owner:** EP rapporteur, EPP comms.
- **Mitigation:** Joint statement signed by ≥11 associations targeting 2026-04-15.
- **Residual risk after mitigation:** Likelihood 1 / Impact 1.
- **Confidence in scoring:** Moderate.

### R5 — Renew Europe pivot to abstention on whip-line conflict

- **Likelihood:** 2 / Unlikely *(Hayer's group has not publicly conditioned the vote)*
- **Impact:** 5 / Adoption fails + downstream harm *(102 *illustrative* seats abstaining is a structural majority break)*
- **Trigger event(s):**
  - 2026-04-19 Renew group meeting — whip-line announcement.
  - 2026-04-22 plenary opening intervention by Hayer.
- **Indicators (≥3, dated):**
  1. `get_speeches` Hayer 2026-04-12 to 2026-04-22 — tone shift from positive to conditional.
  2. Renew group public statements 2026-04-14 to 2026-04-19 — any published conditions on the whip line.
  3. `analyze_voting_patterns` Renew cohesion data 2026-04-20 — cross-check for pending rebel signals.
- **Mitigation owner:** EPP rapporteur, S&D shadow.
- **Mitigation:** Maintain EPP-S&D-Renew joint amendment AM-118 unaltered through 2026-04-21; refuse re-opening of Articles 4–7.
- **Residual risk after mitigation:** Likelihood 1 / Impact 5 → cell still high-impact, monitor closely.
- **Confidence in scoring:** Moderate.

## 5×5 risk matrix (Mermaid)

```mermaid
%%{init: {"theme":"dark"}}%%
quadrantChart
  title Risk to first-reading adoption — 2026-04-23 plenary
  x-axis Low Likelihood --> High Likelihood
  y-axis Low Impact --> High Impact
  quadrant-1 Top-monitor (high impact, high likelihood)
  quadrant-2 Watch (high impact, lower likelihood)
  quadrant-3 Accept (low impact, low likelihood)
  quadrant-4 Manage (low impact, high likelihood)
  R1 HU reservation: [0.78, 0.78]
  R2 Greens block: [0.55, 0.78]
  R3 ECR delay: [0.32, 0.55]
  R4 Industry split: [0.32, 0.32]
  R5 Renew pivot: [0.32, 0.95]
```

## Monitoring cadence

| Risk | Re-score cadence | Owner |
|---|---|---|
| R1 | Daily 2026-04-15 to 2026-04-23 | EP rapporteur office |
| R2 | Daily 2026-04-15 to 2026-04-23 | S&D shadow office |
| R3 | Once 2026-04-15, once 2026-04-22 | EP rapporteur office |
| R4 | Twice weekly | EPP comms |
| R5 | Daily after 2026-04-19 group meeting | EP rapporteur office |

## Quality signals checklist (Pass-2)

- [x] ≥5 risks, each named (no "general procedural risk").
- [x] Likelihood and Impact are integers 1–5, each with a written justification.
- [x] Each risk has ≥2 dated trigger events and ≥3 dated indicators.
- [x] Each risk has a named mitigation owner and a residual-risk re-score.
- [x] Confidence labels (High/Moderate/Low) on every risk.
- [x] Mermaid `quadrantChart` shows all risks with explicit coordinates.
- [x] Length: ≥150 lines (matches `breaking` threshold of 150).

## Why this is a "good" output

1. **Named risks, not categories** — "R1 Hungarian Council reservation" is auditable, "Council risk" is not.
2. **Trigger events are dated** — every risk has a calendar event that flips its Likelihood.
3. **Indicators are MCP-grounded** — every indicator names the EP MCP tool that produces the signal.
4. **Mitigation has an owner** — risks without an owner are wishes, not mitigations.
5. **Residual-risk discipline** — the matrix shows pre- and post-mitigation cells, which is what a decision-maker needs.
6. **WEP bands, not "may"** — Likelihood is expressed in calibrated probability bands.
