<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Historical Baseline — Week Ahead (2026-05-31)

**Purpose:** Establish the structural reference class against which the upcoming week
(1–7 June 2026) and the approaching June II Strasbourg part-session (15–18 June) are
judged. A forecast is only as good as its base rate; this artifact fixes the base rates.

## 1 · The EP Calendar Rhythm

The European Parliament operates on a fixed monthly cadence of **one four-day
Strasbourg part-session** plus interleaved **committee weeks**, **political-group
weeks**, and (roughly monthly) **mini-plenaries in Brussels**. The 2026 calendar
recovered this run confirms the pattern:

| Month | Strasbourg part-session days (2026) |
|-------|--------------------------------------|
| January | 19–22 (+27 Brussels mini) |
| February | 9–12 (+24 Brussels mini) |
| March | 9–12, 25–26 |
| April | 27–30 |
| May | 18–21 |
| **June** | **15–18** |
| July | 6–7 (+ following days) |

**Structural fact:** the week of **1–7 June** sits between the May (18–21) and June
(15–18) part-sessions. It is therefore a **committee- and group-week**, not a plenary
week. This is the single most important framing constraint on the article.

## 2 · Base Rate — What a Pre-Session Committee Week Looks Like

Across the 2026 calendar, every part-session is preceded by ~2 weeks of committee and
group activity in which:

1. Committees **adopt reports and table amendments** destined for the next plenary.
2. Political groups **finalise voting lines** and negotiate cross-group compromises.
3. The Conference of Presidents **fixes the draft order of business** (typically the
   Thursday before the session week).

The week of 1–7 June is the *first* of these two run-up weeks. Expect committee-level
signal (report adoptions, shadow-rapporteur negotiations) rather than floor votes.

## 3 · Base Rate — Single-Day Voting Block Size

The 17 June draft agenda already lists **13 votes** with `hasMore: true`. Historically,
the Wednesday of a Strasbourg week is the heaviest voting day, frequently carrying
20–40 final votes once the order of business is consolidated. A 13-and-rising count
**three weeks out** is therefore consistent with a **normal-to-heavy** Wednesday block,
not an anomaly. 🟢 High confidence.

## 4 · Base Rate — Legislative Output Pace 2026

The 41 adopted texts recovered for Jan–20 May 2026 imply a running pace of roughly
**8–9 adopted texts per part-session**. Distribution by month:

- January: ~5 texts (TA-0004 → TA-0024) — financial stability, electoral reform, Mercosur opinion
- February: ~10 texts — labour rights, UN CSW, foreign-policy resolutions
- March: ~7 texts — ECB VP, better law-making, EGF mobilisations
- April: ~9 texts — DMA enforcement, budget guidelines, animal welfare, Ukraine
- May (to 20th): ~9 texts — AI trade strategy, fisheries protocols, Uzbekistan EPCA

This steady ~8–9/session cadence is the reference class for predicting June output.

## 5 · Base Rate — Thematic Persistence

Three themes recur in *every* recent part-session and are near-certain to feature again
in June (🟢 High):

- **Digital regulation enforcement** (DMA, AI, platform accountability)
- **Economic governance** (budget, ECB scrutiny, EGF/structural funds)
- **Foreign-policy / human-rights urgency resolutions** (Ukraine, Georgia, Armenia,
  Middle East)

Two themes are episodic (🟡 Medium): **trade-agreement consents** (appear when the
ratification queue is non-empty — it currently is) and **MEP immunity waivers** (appear
when JURI has pending requests).

## 6 · Deviation Watch

The current week deviates from a "quiet" recess baseline in one respect: the
**economic backdrop is unusually salient**. With France's general-government deficit at
~4.9 % of GDP (IMF WEO 2026) and euro-area growth below 1 %, the June **2027-budget**
and **ECB** threads carry more political weight than in a typical pre-session week. This
elevates the economic-governance cluster from "routine" to "headline-eligible".

## 7 · Confidence Summary

🟢 High: calendar structure, committee-week framing, output pace.
🟡 Medium: precise June voting-block size, episodic-theme appearance.
🔴 Low: any specific file-level prediction (titles not yet upstream).

## 5 · Reference-Class Pace Detail

The 41 adopted texts recovered for 2026 (through 20 May) establish the legislative tempo:

| Window | Texts | Sessions | Pace |
|--------|:-----:|:--------:|:----:|
| 2026 YTD (Jan–20 May) | 41 | ~5 part-sessions | ~8–9/session |
| Projected June | ~8–9 | 1 (15–18 June) | Consistent |

This reference-class anchor lets us forecast **volume** (the June session will likely
adopt 8–9 texts) even though we cannot forecast **content** (titles empty).

## 6 · Historical Session-Shape Pattern

```mermaid
flowchart LR
    A[Pre-session week] --> B[Committee/group prep]
    B --> C[OOB consolidation]
    C --> D[Part-session votes]
    D --> E[Adopted texts]
    E --> F[Next-cycle prep]
```

Every EP cycle follows this rhythm. The week of 1–7 June sits at node A→B; the 15–18 June
session at node D. This is **structurally certain** (🟢 High), independent of the feed
degradation.

## 7 · Thematic Continuity Baseline

The recurring theme clusters in the 2026 corpus — digital enforcement, AI-trade,
budget/fiscal, ECB, foreign-policy urgencies, trade consents, immunity housekeeping — form
a **stable baseline** that the June session will almost certainly draw from. 🟢 High on
theme persistence; 🔴 Low on specific files.

## 8 · Baseline Bottom Line

History tells us the **shape** of June with high confidence: ~8–9 adopted texts, a
Wednesday vote block, themes from the established clusters, and a foreign-policy urgency at
the corpus base rate. It tells us **nothing** about specific 17 June subjects — those
remain 🔴 Low until the order of business publishes. Cross-ref
`intelligence/scenario-forecast.md` and `intelligence/forward-projection.md`.

🔴 Low: any specific file-level prediction (titles not yet upstream).
