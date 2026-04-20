---
articleType: breaking
runId: 191
date: 2026-04-20
analysisDir: analysis/daily/2026-04-20/breaking-run191
confidenceLevel: MEDIUM
recessDay: 8
apiOutageDay: 11
---

# 📊 Significance Scoring — Run 191 (Easter Tuesday, Day 11 API Outage)

![Confidence](https://img.shields.io/badge/Confidence-Medium-yellow)
![Status](https://img.shields.io/badge/Status-Analysis--Only-blue)
![API](https://img.shields.io/badge/API-Metadata_Restored-brightgreen)
![Recess](https://img.shields.io/badge/Recess-Day_8-orange)

## Executive Summary

| Dimension | Score | Trend | Key Signal |
|-----------|-------|-------|------------|
| API Health | 6/10 | ↑ | Metadata count restored 100→104 |
| Content Access | 1/10 | → | All March 26 texts content-blocked (404) |
| External Risk | 4/10 | ↑ | USTR Section 301 window opens April 21 |
| Coalition Stability | 5/10 | → | 10 days untested (no votes since April 10) |
| Legislative Pipeline | 5/10 | → | First plenary returns April 28-30 |
| **Composite Score** | **16/50** | ↑ | First positive API signal since April 11 |

## Newsworthiness Gate

**GATE: FAIL** — No adopted texts, events, or procedures published/updated TODAY (April 20, 2026).

Parliament remains in Easter recess (April 14-26). Zero feed items qualify as breaking news under the "within last 12 hours" rule. Analysis-only PR is the mandatory output per `ai-driven-analysis-guide.md` Rule 5.

## Breaking Development: Metadata Count Restoration

**CRITICAL INCREMENTAL INTELLIGENCE — Run 191**

After three consecutive metadata count regressions (104 → 101 → 100 across Runs 188-190), the count has REVERSED to 104 in Run 191. This is the **first positive API health signal since the outage began April 11**.

### What Changed

| Run | Date | Count | Change | Interpretation |
|-----|------|-------|--------|---------------|
| 188 | 2026-04-19 | 104 | baseline | Peak before regression series |
| 189 | 2026-04-19 | 101 | -3 | First regression |
| 190 | 2026-04-20 | 100 | -1 | Second regression (triple series) |
| 191 | 2026-04-20 | 104 | +4 | **RESTORED — regression reversed** |

### Four Restored Texts

The four texts now visible at offset 100+ in the 2026 index:

1. **TA-10-2026-0011** (Jan 21): EU-Bosnia and Herzegovina Agreement on Frontex operational activities — Western Balkans border security architecture
2. **TA-10-2026-0014** (Jan 21): Human Rights and Democracy in the World — Annual Report 2025 — EP's annual human rights foreign policy position
3. **TA-10-2026-0018** (Jan 22): Conviction and imminent sentencing of Jimmy Lai in Hong Kong — critical in context of EU-China dual-track trade strategy adopted March 26
4. **TA-10-2026-0036** (Feb 11): Amending Regulation (EU) 2024/792 establishing the Ukraine Facility — €50B Ukraine support vehicle amendment

### Content Layer Status (Still Blocked)

Despite metadata restoration, ALL March 26 texts remain content-unavailable (UPSTREAM_404):
- TA-10-2026-0090 (DGSD2/deposit protection): 404
- TA-10-2026-0091 (BRRD3 resolution): 404
- TA-10-2026-0092 (SRMR3): 404
- TA-10-2026-0094 (Anti-Corruption): 404
- TA-10-2026-0096 (US tariff TRQs): 404
- TA-10-2026-0098 (Digital Omnibus AI): 404
- TA-10-2026-0101 (EU-China TRQs): 404

## Significance Score Components

### Primary Feed Results (Today)
- `get_adopted_texts_feed(timeframe: "today")`: Returned EP8/2019 data only — REGRESSION
- `get_adopted_texts(year: 2026, limit: 100)`: 104 items, max date March 26 — NO TODAY DATA
- `get_meps_feed(timeframe: "today")`: Large MEP dataset returned (current MEPs data)
- `get_events_feed`: SKIPPED (DEGRADED MODE — consistent failure over 10+ days)
- `get_procedures_feed`: SKIPPED (DEGRADED MODE — consistent failure over 10+ days)

### Advisory Feed Status
- Documents feed: DEGRADED (not attempted — conserving call budget)
- Plenary docs: DEGRADED
- Committee docs: DEGRADED
- Parliamentary questions: DEGRADED

### Analytical Tools
- `analyze_coalition_dynamics`: Executed — data quality LOW (EPP memberCount:0)
- `generate_political_landscape`: SKIPPED (DEGRADED MODE)
- `detect_voting_anomalies`: SKIPPED (DEGRADED MODE)
- `early_warning_system`: SKIPPED (DEGRADED MODE)

## Forward Monitoring Priorities

1. **April 21 (TOMORROW)**: USTR.gov — Section 301 filing window opens. Check for EU AI Act/DMA/DSA mention. Probability: 20%. 🟡 Medium confidence
2. **April 21**: EP API probe — `get_adopted_texts(docId:"TA-10-2026-0092")` — test for content restoration following metadata recovery. Expected: 50% chance of partial content availability.
3. **April 21**: European Commission housing initiative — deadline for housing market competitiveness paper
4. **April 23-25**: German Bundesrat session — BRRD3/SRMR3 ratification signals (Zustimmungsgesetz)
5. **April 23-26**: EP API content restoration window — probability increased to 50% (up from 32%) based on metadata recovery
6. **April 27**: Parliament returns from Easter recess — first MEP plenary floor presence
7. **April 28-30**: Strasbourg plenary — first Grand Centre coalition vote test since April 10
