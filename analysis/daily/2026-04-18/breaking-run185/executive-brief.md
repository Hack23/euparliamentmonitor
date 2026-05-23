---
title: "Executive Brief — EP Breaking Probe Run 185, 18 April 2026"
description: "API plateau stability probe (composite 17.5/50): TA-10-2026-0099–0104 staged-release confirmed; documents-feed parameter error documented; T-9 countdown."
date: 2026-04-18
article_type: breaking
slug: 2026-04-18-breaking-run185
source_folder: analysis/daily/2026-04-18/breaking-run185
generated_at: 2026-04-18T20:00:00.000Z
language: en
layout: brief
---

# Executive Brief — Run 185, 18 April 2026 (Evening)

## BLUF

Run 185 (evening probe, Easter Recess Day 5) confirms **API plateau stability** at the post-Tier-1 state: composite **17.5/50**, mode ANALYSIS_ONLY, feeds 2/13 (direct-test confirmed). The probe's three operational contributions: (i) **TA-10-2026-0099 to -0104 individual endpoint tests confirm a staged-release pattern** rather than a fresh-publication delay; (ii) a **`get_documents_feed` parameter error is documented**, isolating it from the broader outage as a separate upstream issue; (iii) **T-9 countdown to plenary return** is calibrated. The plateau-stability signal reduces the likelihood that Tier-1 was a false positive. *Confidence: MEDIUM; Admiralty: B2.*

## Three Decisions

1. **Treat the Tier-1 plateau (~ 17–18/50) as the operationally stable state until Tier-2 transition.** With three consecutive probes (183, 184, 185) clustered in the 17.5–24/50 band, the post-Tier-1 plateau is empirically confirmed. Pipeline expectation: continued ANALYSIS_ONLY until 22–24 April Tier-2 window. *Confidence: HIGH.*
2. **Separate the documents-feed parameter error from the broader outage.** The error is a *parameter validation* issue (not an upstream availability issue) and should be routed to the gateway team rather than treated as part of the EP-backend recovery cycle. *Confidence: HIGH.*
3. **Confirm staged-release pattern as the recovery dynamic.** TA-10-2026-0099 through -0104 returning individually at staggered intervals (not as a bulk drop) is consistent with a backend re-indexing that prioritises older / lower-volume documents first. *Confidence: MEDIUM-HIGH.*

## 60-Second Read

The evening probe captures the **plateau-after-inflection** dynamic: post-Tier-1 recovery, before Tier-2, with composite-risk stable in the high teens. The probe's three operational findings (staged-release confirmation, parameter-error isolation, T-9 calibration) are individually small but collectively confirm that the recovery dynamic is on-trajectory.

The 9-day countdown to plenary return becomes the dominant forward-planning horizon: by 27 April, the analytical pipeline must be operating at full feed parity to handle expected plenary-week signal volume.

## Risk Snapshot (T-9 to T-0)

| Risk | Likelihood | Impact |
|---|---:|---:|
| Tier-1 plateau extends past 24 April (no Tier-2) | LOW–MED | MED |
| Documents-feed parameter error masks other issues | LOW | LOW–MED |
| Plenary return arrives before full Tier-2 recovery | LOW–MED | MED |

## Source Quality

- EP feeds (2/13 direct-test confirmed): **B3**
- Staged-release pattern observation: **B2**
- Parameter-error categorisation: **A2**

## Provenance

- Run: `breaking-run185` (2026-04-18, evening, recess Day 5)
- Compliance: EP Open Data Portal feeds only. GDPR-compliant.

---
*Analytical neutrality: plateau-stability reading flagged as empirical, not predictive.*
