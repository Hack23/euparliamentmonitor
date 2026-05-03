<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Worked example — `intelligence/stakeholder-map.md`

> 📎 Companion methodology: [`per-artifact-methodologies.md §stakeholder-map`](../per-artifact-methodologies.md#stakeholder-map) ·
> Companion template: [`stakeholder-map.md`](../../templates/stakeholder-map.md)
>
> **Illustrative excerpt only.** The map below is anchored to a real
> 2026-Q1 EP run on AI-Act implementation, but power scores, alignment
> values, and seat counts are rounded for teaching. Do not republish.
> All figures carry an `*illustrative*` marker.

## Issue frame

> **Question this map answers.** On Procedure 2025/0142(COD) — AI-Act-implementation Regulation, plenary vote 2026-04-23 — who can move the outcome from `roughly even chance` to `likely-adopt`, and what does the Power × Alignment surface look like 14 days out from the vote?

## Actor roster (≥12 actors, with cited scores)

| # | Actor | Role | Power (0–10) | Alignment (-5…+5) | Score citation |
|---|---|---:|---:|---:|---|
| 1 | Manfred Weber (EPP) | EPP group chair | 9 | +4 | `assess_mep_influence` rank 3, file co-rapporteur seniority *illustrative* |
| 2 | Iratxe García Pérez (S&D) | S&D group chair | 8 | +3 | `assess_mep_influence` rank 6 *illustrative* |
| 3 | Valérie Hayer (Renew) | Renew chair | 7 | +2 | `assess_mep_influence` rank 14 *illustrative* |
| 4 | Terry Reintke (Greens) | Greens co-chair, file shadow | 6 | -1 | Co-chair role + plenary speech 2026-03-12 narrowing AI scope |
| 5 | Nicola Procaccini (ECR) | ECR co-chair | 6 | -2 | `analyze_voting_patterns` ECR cohesion 88% on AI files *illustrative* |
| 6 | Jordan Bardella (Patriots) | Patriots chair | 5 | -3 | Group seat share 84 *illustrative* + opposition speech 2026-04-08 |
| 7 | Brando Benifei (S&D shadow) | File shadow rapporteur | 7 | +3 | Shadow drafting capacity, two recent PQ filings on enforcement |
| 8 | EPP rapporteur (file) | File rapporteur | 7 | +5 | Rapporteur seat |
| 9 | ITRE chair | Lead committee chair | 6 | +3 | Committee chair authority + scheduling power |
| 10 | LIBE chair | Co-lead committee chair | 5 | +2 | Co-lead authority on Articles 12–14 |
| 11 | Belgian Council Presidency | Trio Presidency lead | 8 | +3 | Council mandate dated 2026-03-15 |
| 12 | Hungarian PermRep | Council reservation holder | 5 | -2 | Council document 9123/26 reservation on Article 12.4 |
| 13 | Commissioner (DG CNECT) | Commission file owner | 7 | +4 | Commission proposal author, defends scope |
| 14 | Industry Council (14 associations) | External coalition | 5 | +3 | 11 of 14 papers filed `get_committee_documents` favour adoption |

## Power × Alignment quadrant chart (Mermaid)

```mermaid
%%{init: {"theme":"dark"}}%%
quadrantChart
  title AI-Act Implementation — Stakeholder Map (2026-04-09 cut)
  x-axis Opposed --> Supportive
  y-axis Low Power --> High Power
  quadrant-1 Champions (high power, supportive)
  quadrant-2 Sceptics (high power, opposed)
  quadrant-3 Critics (low power, opposed)
  quadrant-4 Defenders (low power, supportive)
  Weber: [0.85, 0.95]
  Garcia: [0.78, 0.85]
  Hayer: [0.65, 0.75]
  Reintke: [0.42, 0.65]
  Procaccini: [0.32, 0.65]
  Bardella: [0.22, 0.55]
  Benifei: [0.78, 0.75]
  EPP rapp: [0.95, 0.78]
  ITRE chair: [0.78, 0.62]
  LIBE chair: [0.68, 0.55]
  BE Presidency: [0.78, 0.85]
  HU PermRep: [0.32, 0.55]
  DG CNECT: [0.88, 0.75]
  Industry: [0.78, 0.55]
```

## Quadrant narratives (≥150 words each)

### Champions (high power, supportive)

The Champions quadrant is dominated by the EPP rapporteur, Manfred Weber as EPP group chair, the Belgian Trio Presidency, and DG CNECT — the four actors whose institutional position is **most exposed** to a non-adoption outcome. The rapporteur's seat is the single highest-leverage node: she controls the order of voting, the wording of the explanatory statement, and the daily concession ladder that the EPP-S&D-Renew shadow concord stands on. EP MCP `assess_mep_influence` *illustrative* ranks Weber third in the 2026-Q1 influence index, and the joint amendment AM-118 (co-signed Weber-García) reduced contested-amendment surface from 47 to 12 — a measurable champion-quadrant effect. The Belgian Presidency, exiting on 2026-06-30, has a calendar-driven incentive to lock first-reading adoption while the Presidency mandate matches the EP draft on the 24-month transposition window. DG CNECT, as Commission file owner, faces credibility cost on the 2030 AI-strategy programme if the Regulation enters trilogue rather than first-reading adoption. The quadrant's collective alignment of `+3 to +5` and power of `≥7/10` makes it the **base for any concession ladder** — Pass-2 monitoring asks whether any Champion's alignment shifts below `+2` between 2026-04-15 and 2026-04-23.

### Sceptics (high power, opposed)

The Sceptics quadrant carries one major node — the Hungarian PermRep with its formal Council reservation on Article 12.4 — together with smaller-power but tightly aligned ECR and Patriots leaders (Procaccini, Bardella). The Hungarian reservation is the most consequential opposition node because it pre-positions a Council-side trilogue blocker even if the EP adopts at first reading; `get_external_documents` returns Council document 9123/26 dated 2026-03-15 narrowing the high-risk-system list. ECR cohesion on AI files runs at 88% per `analyze_voting_patterns` *illustrative*, and Procaccini's group has signalled procedural amendments to delay the vote (single-source `get_speeches` 2026-04-08, Admiralty grade C-3 — Low confidence). Patriots' Bardella, with a smaller seat count, derives outsized influence from group-discipline arithmetic — even partial defection from the EPP-S&D concord to the right pulls the simple-majority calculation into deficit. The dominant Pass-2 question is whether the Hungarian reservation can be cleared in COREPER on 2026-04-17, which would shift HU PermRep alignment from `-2` to `0` and remove the trilogue blocker.

### Defenders (low power, supportive)

The Defenders quadrant — ITRE chair, LIBE chair, Industry Council, and the wider rapporteur-shadow ecosystem — supplies the **procedural backbone** without commanding decisive vote arithmetic. The two committee chairs control scheduling and the order of voting, but on a Strasbourg-level file their power score sits at `5–6/10`. The 14-association Industry Council with 11-of-14 supportive submissions (`get_committee_documents` 2026-02-01 to 2026-04-01) provides extra-parliamentary cover but its voting-influence weight per `assess_mep_influence` is uneven across the 14 signatories — the legal-tech subset is materially weighted, the SME subset less so. Defenders' main contribution between 2026-04-15 and 2026-04-23 is *air cover*: public statements, committee-stage clarifications, and trilogue-prep notes that lower the political cost for any Renew or wavering Greens MEP to vote in favour. Pass-2 monitoring tracks two indicators: (1) the rate of additional industry submissions during the final week, and (2) public statements by ITRE/LIBE chairs framing first-reading adoption as the procedurally responsible outcome.

### Critics (low power, opposed)

The Critics quadrant is the smallest and least consequential at this cut, holding rank-and-file Greens and Patriots MEPs whose individual influence is `<5/10` but whose aggregate behaviour matters because Greens cohesion drops below 80% in this quadrant per `analyze_voting_patterns` *illustrative*. Critics' role in the next 14 days is signalling: they will publicly criticise the file in the plenary debate (2026-04-22) and on social media. Their direct vote-arithmetic impact is muted because Reintke, the Greens shadow, controls the group's whip line. The dominant Pass-2 question is whether Critics' public criticism succeeds in pulling Reintke's alignment down from `-1` to `-3`, which would in turn pull the entire Greens group from "withhold-some" to "vote-against" and force a Renew-only backfill — the threshold that the `scenario-forecast.md` Scenario B turns on.

## Movement since prior period (`stakeholder-map.md` v-1, 2026-03-12)

| Actor | Prior power | Prior alignment | Current power | Current alignment | Driver |
|---|---:|---:|---:|---:|---|
| Reintke (Greens shadow) | 6 | 0 | 6 | -1 | Plenary speech 2026-03-12 narrowing AI scope |
| Hungarian PermRep | 4 | -1 | 5 | -2 | Council reservation lodged 2026-03-15 |
| Industry Council | 4 | +2 | 5 | +3 | Three additional papers filed |
| BE Presidency | 7 | +2 | 8 | +3 | Council mandate dated 2026-03-15 |

## Coalition implications

- **Champions + Defenders pulling Renew into voting-favour** is the base-case path to majority. Requires Renew to absorb a 41-vote backfill if Greens withhold half their seats. Probability: `Likely (55–80%)` over a 14-day horizon.
- **Champions split by Hungarian reservation** is the principal off-ramp. Probability: `Roughly even chance (35–55%)` if COREPER 2026-04-17 fails to clear the reservation.
- **Critics + Sceptics blocking via Greens-Patriots procedural alliance** is a tail scenario. Probability: `Unlikely (10–35%)`.

> Probability bands follow [`osint-tradecraft-standards.md`](../osint-tradecraft-standards.md) §3.1 Words of Estimative Probability.

## Quality signals checklist (Pass-2)

- [x] ≥12 actors named.
- [x] Power and alignment scores carry an evidence citation.
- [x] Mermaid `quadrantChart` includes every actor with explicit `[x, y]` coordinates.
- [x] Each quadrant narrative ≥150 words.
- [x] Movement table compared to prior cut.
- [x] Coalition implications expressed in WEP bands, not soft language.

## Why this is a "good" output

1. **Roster transparency** — every actor's score is a one-line citation, not a paragraph of vague justification.
2. **Quadrant narratives drive decisions** — each quadrant ends with a Pass-2 monitoring question, not a summary.
3. **Movement-since-prior is concrete** — four named drivers, each with a calendar date.
4. **Probability discipline** — coalition implications use WEP bands (`Likely`, `Roughly even chance`, `Unlikely`) with horizon, not "may" / "could".
5. **Falsifiability** — every claim can be audited from the named MCP tool or document ID.
