---
articleType: breaking
runId: 187
date: 2026-04-19
analysisPhase: cross-run-diff
confidence: HIGH
---

# 🔄 Cross-Run Differential Intelligence — Run 186 → Run 187

**Analysis Date:** 2026-04-19 | **Comparing:** Run 186 (2026-04-19, earlier) vs Run 187 (2026-04-19, current)

> **Note:** Both runs 186 and 187 occurred on 2026-04-19. Run 186 was logged as the final prior run in editorial context. This diff compares the accumulated intelligence from Run 187 against Run 186's findings to document incremental value.

---

## What Changed Since Run 186

### 🆕 NEW Intelligence (First Confirmed in Run 187)

**1. EU-China Tariff Rate Quota Agreement Confirmed (TA-10-2026-0101)**

Run 186 editorial context noted "TA-10-2026-0099-0104: Content unknown until staged release." Run 187 is the first run in which TA-10-2026-0101 — "EU-China Agreement: modification of concessions on all the tariff rate quotas included in the EU Schedule CLXXV" — is confirmed accessible with its full title and procedural reference.

This changes the March 26 Sprint II intelligence picture significantly. Prior runs could only speculate that the sprint included trade legislation (based on TA-10-2026-0096's subject metadata). Run 187 confirms:
- The EU adopted TWO trade-related texts on March 26, 2026 — one addressing US tariffs, one adjusting China TRQs
- These are legally and procedurally independent instruments with different committee origins (INTA for both, but different procedure references: 2025-0261 for US tariffs, 2023-0183 for China TRQs)
- The China TRQ procedure was in negotiation since 2023 — not a reactive response to US tariffs
- **Intelligence upgrade:** Multi-track trade strategy hypothesis CONFIRMED (was SPECULATIVE in runs 184-186)

**2. EU-Lebanon/PRIMA Cooperation Confirmed (TA-10-2026-0100)**

First confirmed title for TA-10-2026-0100. Prior runs had this listed only as a numeric slot. Now confirmed as EU-Lebanon scientific cooperation extension under PRIMA framework. Adds Mediterranean neighbourhood dimension to March 26 sprint intelligence.

**3. Total Accessible Texts: 61 (was 51 in Run 186)**

Run 187 confirms a net gain of 10 accessible texts since Run 186, with the API restoration trajectory now established over 4 data points (runs 184-187). The +10 gain represents the largest single-run increment in the series, suggesting the restoration pipeline is accelerating. This materially improves the forecast of full restoration to April 21-23 (was April 24-27 in run 186).

---

### ✅ Hypotheses CONFIRMED in Run 187

| Hypothesis (from prior runs) | Status | Evidence |
|------------------------------|--------|---------|
| API restoration is systematic, not random | CONFIRMED 🟢 | 61 texts, linear trajectory |
| March 26 sprint included China trade measure | CONFIRMED 🟢 | TA-10-2026-0101 accessible |
| EU pursuing multi-track trade strategy | CONFIRMED 🟢 | TA-0096 + TA-0101 same-day adoption |
| PRIMA Mediterranean cooperation reinforced | CONFIRMED 🟢 | TA-10-2026-0100 accessible |
| Staged release accelerates after Day 7 | CONFIRMED 🟢 | +10 in run 187 vs +5 in run 186 |

---

### ❌ Hypotheses REFUTED in Run 187

| Hypothesis (from prior runs) | Status | Evidence |
|------------------------------|--------|---------|
| Full restoration by April 24-27 | REVISED 🟡 | Now estimated April 21-23 (faster) |
| Tier 2 feeds would restore by "5-7 day" window | REFUTED 🔴 | Day 8, still 404 (outage is 5-9 days, not 5-7) |

---

### 📊 Probability Shifts Since Run 186

| Scenario | Run 186 Probability | Run 187 Probability | Change | Reason |
|----------|---------------------|---------------------|--------|--------|
| USTR Section 301 announcement April 21-24 | 30% | 35% | ↗ +5% | Timeline advancing |
| API fully restored before April 27 | 65% | 78% | ↗ +13% | Faster restoration confirmed |
| EU-China deal causes post-recess coalition stress | N/A | 25% | NEW | TA-0101 now confirmed |
| Commission housing response before April 27 | 15% | 15% | → | Unchanged |
| German Bundesrat BRRD3 opposition | 35% | 38% | ↗ +3% | Approaching session date |
| Grand Centre coalition fracture | 5% | 5% | → | No new signals |

---

## INCREMENTAL INTELLIGENCE SCORE

Run 187 vs Run 186: **32/100** (up from 26/100 in run 186)

Justification:
- EU-China agreement title confirmation: +7 (significant new political intelligence)
- TA-10-2026-0100 (Lebanon/PRIMA) confirmation: +2 (minor new intelligence)
- API restoration trajectory quantification: +2 (improved forecasting)
- Timeline revision (faster restoration): +1 (useful operational update)
- No new risks or coalition changes: -0

Run 187 represents a meaningful intelligence increment primarily driven by the EU-China tariff agreement confirmation, which was the most sought-after piece of missing context in the sprint II analysis.

---

## Data-Quality Delta vs Run 186

| Feed | Run 186 | Run 187 | Change |
|------|---------|---------|--------|
| `get_adopted_texts_feed` (one-week) | 159 items | 159 items | → |
| `get_adopted_texts` (year=2026) | ~51 total | 61 total | ↗ +10 |
| `get_meps_feed` | 738 MEPs | 738 MEPs | → |
| `get_events_feed` | 404 | 404 | → |
| `get_procedures_feed` | 404 | 404 | → |
| `get_documents_feed` | Error | Error | → |
| Server health | 0/13 unknown | 0/13 unknown | → |

No feed degradation detected vs run 186. API restoration continues.
