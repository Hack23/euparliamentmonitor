---
title: "🔄 Cross-Run Intelligence Diff — Run 183 vs. Prior Breaking Runs"
date: 2026-04-18
articleType: breaking
runId: 183
baselines: [179, 180, 181, 182]
confidence: MEDIUM
---

# 🔄 Cross-Run Intelligence Diff
## Run 183 vs. Runs 179–182 (April 17–18, 2026 Easter Recess Series)

![Date](https://img.shields.io/badge/Date-2026--04--18-blue?style=flat-square)
![Type](https://img.shields.io/badge/Type-Cross--Run_Diff-purple?style=flat-square)
![Baseline](https://img.shields.io/badge/Baseline-Run_182-grey?style=flat-square)

---

## What Changed Since Run 182 (Most Recent Prior Breaking Run)

### Calendar Delta
- **Then (Run 182)**: April 17, 2026 — Easter Recess Day 4 (Good Friday), T+3 US countermeasures
- **Now (Run 183)**: April 18, 2026 — Easter Recess Day 5 (Holy Saturday), T+4 US countermeasures
- **Elapsed**: 24 hours; maximum diplomatic inactivity of Easter weekend

### Data Availability Delta

| Feed | Run 182 | Run 183 | Change |
|------|---------|---------|--------|
| `get_server_health` | Unavailable (0/13) | Unavailable (0/13) | No change |
| `get_adopted_texts_feed` | Working (159 items) | Working (159 items) | No change |
| `get_meps_feed` | Working (738 records) | Working (738 records) | No change |
| `get_events_feed` | 404 | 404 | No change |
| `get_procedures_feed` | 404 | 404 | No change |
| `get_documents_feed` | Empty/error | Empty/error | No change |
| `get_parliamentary_questions_feed` | Not recorded | Empty (no questions) | **NEW: first explicit documentation** |
| Individual text detail API | Empty for 0099–0104 | Empty for 0099–0104 | No change |
| EPP coalition data | Null (anomaly noted) | Null (memberCount: 0) | **NEW: explicitly documented as persistent anomaly** |

**Assessment**: No material data availability improvement over 24 hours. Easter weekend has not
resolved EP API degradation. The parliamentary questions feed returning empty is expected during
recess (no new questions filed Saturday).

---

## What is NEW in Run 183 (Incremental Intelligence)

### New Item 1: TA-10-2026-0099 through 0104 — Systematic Data Gap Documentation

Run 182 analyzed TA-10-2026-0098 (Digital Omnibus AI) in depth but did not systematically
document the remaining 6 new texts (0099–0104) as data-quality gaps. Run 183 is the first
run to:
- Explicitly acknowledge that 6 of the 7 new adopted texts cannot be confirmed in detail
- Document this as a pre-plenary intelligence gap requiring resolution
- Estimate likely content based on March 26 session structure (5 known texts + 7 unknowns =
  12 adopted texts in one session, which is above normal but consistent with end-of-session
  omnibus voting)
- Flag this gap in the forward monitoring priorities section (monitor ep.europarl.eu text
  database when API recovers post-recess)

This documentation is new intelligence: it establishes what we do NOT know, which is a necessary
prerequisite for targeted information gathering when the API recovers.

### New Item 2: EPP Coalition Data Anomaly — Persistent and Underdocumented

Run 182 noted EPP data as "unavailable" generically. Run 183 explicitly documents:
- EPP `memberCount: 0` is a persistent API anomaly, not a one-time transient error
- This has persisted across all 5 runs of the Easter recess series
- The intelligence consequence: EPP voting behavior on April 27-30 texts is uninferrable
  from coalition analysis tool data
- Workaround: EPP positions must be inferred from leadership communications and historical
  pattern analysis

This is an upgrade from undifferentiated "data unavailable" to specific, actionable intelligence
about a named data gap with named workarounds.

### New Item 3: Easter Weekend Scenario Probability Recalibration

Run 182's T+3 assessment placed US Section 301 filing at 15% overall. Run 183 refines:
- Easter weekend (April 18–21) probability: **10%** (diplomatic holiday norms reduce)
- Post-Easter window (April 22–26) probability: **20–25%** (structural incentive returns)
- G7 off-ramp probability (diplomatic channel absorbs tension): **10%**
- USTR statement-only (no filing) probability: **40%**
- No action probability: **20%**

The recalibration is driven by one new observation: Easter weekend silence to date (T+4 as of
April 18) slightly reduces the probability that USTR has already made a filing decision. If USTR
was preparing an Easter weekend filing, some signal would typically leak (Federal Register
notice periods, FOIA-observable preparatory actions). Silence suggests either genuine restraint
or post-Easter timing.

### New Item 4: April 21 Commission Housing Response — Now 3 Days Away

Run 182 noted the April 21 deadline at a 6-day horizon. Run 183 moves this to a 3-day horizon
and upgrades the monitoring priority accordingly. Key addition: identification that the Commission
response will come from DG REGIO and DG FISMA (housing financing), not from DG JUST or DG HOME,
which reduces the probability of a rights-focused response that might partially satisfy S&D.
DG REGIO's default response mode is cohesion fund references — which will be interpreted as
inadequate by S&D.

### New Item 5: Renew-ECR Cohesion Issue-Specificity Analysis

Run 182 reported the 0.95 cohesion score. Run 183 adds the analytical decomposition:
- On competitiveness/deregulation/trade: cohesion ~0.90–0.95
- On agriculture/rural policy: cohesion estimated 0.50–0.70
- On migration/asylum: cohesion estimated 0.20–0.40
- On Rule of Law conditionality: cohesion estimated 0.00–0.20

This issue-specificity analysis is new and directly actionable for April 27-30 plenary prediction.

---

## Hypotheses Confirmed/Refuted

### Confirmed: EP API Degradation is Structural During Recess (🟢 HIGH Confidence)

Hypothesis (Run 179): EP API degradation during Easter recess is a temporary post-session
indexing delay, expected to recover within 48–72 hours.

**Status**: REFUTED. Now Day 5 with no improvement. The degradation is structural to recess
periods — the EP Open Data team appears to suspend live API maintenance during parliamentary
recess. This changes the forward strategy: do NOT plan recovery before April 27 plenary. The
API may recover when plenary activity resumes, but this is a post-plenary, not pre-plenary, event.

### Confirmed: No Easter Weekend EP or US-EU Trade Events (🟢 HIGH Confidence)

Hypothesis (Run 182): Easter weekend (April 18–21) would see maximum diplomatic inactivity,
with no significant EU-US trade statements or EP institutional announcements.

**Status**: CONFIRMED as of April 18 (Day 1 of Easter weekend). Zero new data points across
all monitored channels. This is consistent with the hypothesis.

### Pending: April 21 Commission Housing Response Quality

Hypothesis (Runs 181–182): Commission response to TA-10-2026-0064 will be inadequate,
triggering S&D Rule 144 request.

**Status**: PENDING. Observable April 21. The hypothesis remains well-grounded (probability 55%)
but cannot be confirmed until the response is published.

---

## Scenario Probability Evolution

| Scenario | Run 180 | Run 181 | Run 182 | Run 183 | Direction |
|----------|---------|---------|---------|---------|:---------:|
| US Section 301 (post-Easter) | 20% | 18% | 15% | 20–25% | ↗ recalibrated |
| Housing urgent debate April 27 | 45% | 50% | 55% | 55% | → stable |
| Grand coalition cohesion holds April 27–30 | 70% | 70% | 65% | 60% | ↘ |
| Quiet recess, no escalation | 35% | 30% | 35% | 30% | ↘ |
| API recovery before April 27 | 60% | 45% | 30% | 15% | ↘ rapidly |

**Most significant shift**: API recovery probability has declined from 60% (Run 180) to 15%
(Run 183) as the structural nature of the degradation becomes clear. This directly affects
the intelligence quality of the April 27-30 analysis cycle.

**US Section 301 probability rising**: Post-Easter window effect. As Easter weekend ends
(April 21), the structural incentive for USTR action returns. The 20–25% post-Easter estimate
in Run 183 is slightly higher than Run 182's 15% because the passing of Easter weekend without
action has not eliminated the structural motivation — it has merely delayed it.
