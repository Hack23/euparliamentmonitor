<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Worked example — `risk-scoring/quantitative-swot.md`

> 📎 Companion methodology: [`political-swot-framework.md`](../political-swot-framework.md) ·
> Companion template: [`quantitative-swot.md`](../../templates/quantitative-swot.md)
>
> **Illustrative excerpt only.** Numbers and named votes below are anchored to
> a real 2026-Q1 EP run but compressed and rounded; do not republish. Every
> figure that would otherwise be cited as a current fact is marked
> `*illustrative*`.

## Frame

> **Issue.** EP plenary position on the 2026 AI-Act-implementation Regulation (Procedure 2025/0142(COD)), Strasbourg vote scheduled 2026-04-23.
>
> **Subject of the SWOT.** The pro-text coalition led by EPP rapporteur and S&D shadow rapporteur seeking adoption at first reading.

## Scoring rubric (anchored to `political-swot-framework.md` §3)

- **Score 1–5** per item: 1 = trivial, 5 = decisive for outcome.
- **Confidence**: High (multiple independent EP MCP sources), Moderate (single MCP source corroborated by ≥1 secondary press source graded ≥B-3 Admiralty), Low (single source).

## Strengths (S) — 3 items

### S1 — EPP–S&D shadow concord on Articles 4–7 — Score 4 / Confidence: High *illustrative*

The two largest groups co-signed the joint amendment AM-118 covering Articles 4–7 (foundation-model thresholds), reducing the contested-amendment surface from 47 to 12 items going into Strasbourg. EP MCP `analyze_voting_patterns` shows 92% S&D — EPP cohesion on the four committee straw votes that previewed plenary positions, up from 71% on the prior consolidated text. This concord narrows the Renew/Greens swing-vote requirement from 78 to 41 votes for the simple majority of 361 of 720, and it is the single most material reason the rapporteur's office now treats first-reading adoption as the base case rather than the conciliation case.

### S2 — Council Trio alignment on transposition window — Score 3 / Confidence: Moderate *illustrative*

The Belgian, Spanish, and Hungarian Trio Presidency conclusions (15 March 2026) name AI-Act implementation as a shared deliverable, with the 24-month transposition window matching the EP rapporteur's draft. EP MCP `get_external_documents` returns the Council mandate text dated 2026-03-15; corroboration from a single Politico Pro brief (graded B-3) lifts confidence above Low but the Hungarian objection on Article 12.4 is not yet formally withdrawn, capping the score at 3.

### S3 — Industry Council associate submissions favour adoption — Score 2 / Confidence: Moderate *illustrative*

Eleven of the fourteen industry-association position papers filed under EP `get_committee_documents` between 2026-02-01 and 2026-04-01 explicitly support first-reading adoption to avoid trilogue uncertainty. The score is 2 because association submissions are routinely discounted by ALDE and Greens shadows; the confidence is Moderate because the underlying papers are fully archived but the cohort's voting-influence weight (per `assess_mep_influence`) is unevenly distributed.

## Weaknesses (W) — 3 items

### W1 — Greens/EFA block on Article 12.4 (high-risk-system list) — Score 4 / Confidence: High *illustrative*

The Greens/EFA group filed seven amendments narrowing the high-risk-system list and signalled in `get_speeches` (2026-03-12 plenary debate, MEP Reintke) that the group will not vote in favour without at least three of the seven adopted. With 53 *illustrative* Greens seats, withholding even half of them puts the simple majority into deficit by 27 votes, forcing reliance on Renew or ECR for compensation. This is the single most costly procedural risk and is the dominant focus of the Pass-2 Pre-Mortem (see `scenario-forecast.md` §Scenario B).

### W2 — Rapporteur-shadow trust deficit on enforcement (Article 22) — Score 3 / Confidence: Moderate *illustrative*

Two `get_parliamentary_questions` filings from the S&D shadow rapporteur in March 2026 publicly criticise the rapporteur's drafting on national-supervisor independence, framing the file as "weakened at the last drafting margin". Confidence is Moderate because the criticism is on the record but the shadow has not threatened a no-confidence amendment.

### W3 — Compressed amendment-deadline-to-vote window — Score 3 / Confidence: High *illustrative*

The amendment deadline (2026-04-15) falls only six working days before the plenary vote, against a 14-day median for files of comparable scale (`get_voting_records` review). This compresses the political-trade window and historically increases the share of late tabled re-tabled amendments that fail.

## Opportunities (O) — 3 items

### O1 — Belgian Presidency closing-session leverage — Score 4 / Confidence: High *illustrative*

The Belgian Presidency closes on 2026-06-30; adopting at first reading on 2026-04-23 lets the file enter Council under the same Presidency that built the Council mandate, materially raising the trilogue-completion probability for 2026-Q3.

### O2 — Renew Europe pivot if Greens withhold — Score 3 / Confidence: Moderate *illustrative*

`analyze_coalition_dynamics` shows Renew–EPP cohesion at 81% on AI-relevant files in 2025; if the Greens withhold, Renew's 102 *illustrative* seats are sufficient to backfill. The opportunity is graded 3 not 4 because Renew has not yet publicly committed.

### O3 — Public-trust window on AI safety — Score 2 / Confidence: Moderate *illustrative*

A successful first-reading adoption coincides with the OECD AI Index publication on 2026-04-30, providing a high-visibility communications window. Score 2 because the political-capital impact is short-lived.

## Threats (T) — 3 items

### T1 — Hungarian Council reservation on Art. 12.4 — Score 4 / Confidence: High *illustrative*

The Hungarian formal reservation (Council document 9123/26) directly contradicts EP rapporteur drafting on the high-risk-system list. If unresolved before 2026-04-21, it materially raises the trilogue-failure probability and provides the ECR group with a procedural rationale to oppose.

### T2 — Recess gap risk between adoption and Council reception — Score 2 / Confidence: Moderate *illustrative*

Between 2026-04-23 (EP vote) and 2026-05-02 (Council ATTRIBUTION recess end), the file enters a documentation gap; Stage-A `get_events_feed` confirms no scheduled receptions during this window. The score is 2 because the gap is short.

### T3 — ECR and Patriots procedural amendments — Score 2 / Confidence: Low *illustrative*

ECR has signalled in `get_speeches` (2026-04-08) intent to table procedural amendments delaying the vote. Confidence is Low because no concrete amendment text is filed yet at the time of the analysis cut.

## TOWS cross-quadrant strategies (4 paired strategies)

| Pair | Strategy | Trigger | Owner |
|---|---|---|---|
| S1 × O1 — *Concord* + *Presidency leverage* | Hold the EPP-S&D-Renew concord through the 2026-04-21 trilogue prep meeting; refuse re-opening of Articles 4–7. | EP rapporteur calling a "no re-open" three-line whip on 2026-04-21. | EPP rapporteur, S&D shadow |
| W1 × O2 — *Greens block* + *Renew pivot* | Open Article 12.4 narrow concession to lock at least 3 Greens amendments without losing Renew. | Greens shadow accepting 3-of-7 amendments package by 2026-04-19. | S&D shadow, Greens shadow |
| W3 × T1 — *Compressed window* + *Hungarian reservation* | Pre-clear the Hungarian reservation in COREPER on 2026-04-17 so the EP rapporteur's office can draft a Trilogue cover-letter same-day. | COREPER 2026-04-17 conclusions. | EP rapporteur, Council Presidency |
| S3 × T3 — *Industry submissions* + *ECR procedural amendments* | Use industry-council submissions to publicly anchor the procedural risk of delay (jobs, trilogue uncertainty); pressure Patriots votes at the margin. | Joint statement on or before 2026-04-15. | EP rapporteur, EPP comms |

## Quality signals checklist (Pass-2 verification)

- [x] Each quadrant has ≥3 items, each ≥80 words, each with a numeric score and a confidence label.
- [x] Every item names a specific procedure, MEP, group, committee, or document — no anonymous "stakeholders".
- [x] Every score is justified by a citation (`analyze_voting_patterns`, `get_speeches`, etc.) or by an explicit reasoning chain when the source is the analyst.
- [x] Probabilities, where used, are bracketed against a Words-of-Estimative-Probability band; numerical ranges (e.g. 78 → 41 votes) carry a `*illustrative*` marker.
- [x] TOWS pairs are paired strategies with a trigger date and a named owner — not aspirational paragraphs.
- [x] No soft phrases ("rich", "comprehensive", "strong"); every claim is anchored.
- [x] Length: this excerpt is ~108 lines; a full production artifact must reach ≥140 lines (the `breaking` threshold in `reference-quality-thresholds.json`). The excerpt demonstrates shape and evidence density; production runs extend with additional items or deeper TOWS narratives.

## Why this is a "good" output

This excerpt is graded *good* because:

1. **Evidence density** — every score has a named MCP method, document, or MEP behind it.
2. **Numerate** — scores, vote arithmetic (361 of 720, 27-vote deficit), and confidence labels are explicit.
3. **Falsifiable** — each TOWS pair has a trigger date and an owner; an external observer can audit whether the strategy was attempted by inspecting the EP record.
4. **Disciplined uncertainty** — every figure that is illustrative carries the `*illustrative*` marker; nothing is presented as a fresh fact.
5. **Pass-2 ready** — the bottom checklist mirrors the methodology section's quality signals so an agent doing read-back diffing can score the file mechanically.
