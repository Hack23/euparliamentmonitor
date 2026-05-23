---
title: "📋 Analysis Index — Easter Recess Day 5 (Run 185) — Stable API Plateau & Pre-Plenary Countdown"
date: 2026-04-18
articleType: breaking
runId: 185
confidence: MEDIUM
degradedMode: true
feedsOperational: "2/13 (server reports 0/13; direct testing confirms adopted_texts + meps feeds working)"
recessDay: 5
---

# 📋 Analysis Index — Run 185 (April 18, 2026)

> **Status**: Easter Recess Day 5 — Parliament returns April 27; Strasbourg plenary April 28–30.  
> **Key finding**: API plateau confirmed — no Tier 2 recovery yet (events/procedures still 404).  
> TA-10-2026-0099–0104 individual endpoint tests confirm continued content inaccessibility.

## Analysis Artifacts — Run 185

| File | Category | Status | Key Finding |
|------|----------|--------|-------------|
| `intelligence/analysis-index.md` | Meta | ✅ Complete | This file — overview and index |
| `intelligence/synthesis-summary.md` | Synthesis | ✅ Complete | Stable plateau; forward monitoring updated |
| `intelligence/cross-run-diff.md` | Differential | ✅ Complete | Run 185 vs 184 — minimal delta, plateau confirmed |
| `classification/significance-scoring.md` | Classification | ✅ Complete | Newsworthiness gate FAIL — Easter recess |
| `risk/risk-matrix.md` | Risk | ✅ Complete | 6-risk-vector matrix; composite score 17.5/50 |
| `threats/political-threat-landscape.md` | Threats | ✅ Complete | 9-day countdown threat analysis |
| `documents/document-analysis-index.md` | Documents | ✅ Complete | TA-10-2026-0099–0104 content inaccessibility confirmed |
| `manifest.json` | Meta | ✅ Complete | Run 185 manifest |

## Data Sources

| Source | Status | Items Retrieved |
|--------|--------|----------------|
| `get_adopted_texts_feed` (today) | Empty (Easter recess) | 0 items |
| `get_adopted_texts_feed` (one-week) | ✅ Working | 159 items |
| `get_meps_feed` (today) | ✅ Working | 738 MEPs |
| `get_events_feed` (today) | 404 (Tier 2 not yet restored) | 0 |
| `get_procedures_feed` (today) | 404 (Tier 2 not yet restored) | 0 |
| `get_parliamentary_questions_feed` | Error (upstream enrichment) | 0 |
| `get_server_health` | 0/13 (monitoring lag confirmed) | N/A |
| `analyze_coalition_dynamics` | ✅ Working | 9 groups; EPP still memberCount=0 |
| `get_all_generated_stats` | ✅ Working (precomputed) | Full historical context |
| Individual texts TA-10-2026-0099 to 0101 | 404 — "indexed but content not yet available" | 0 |

## Run Series Context

This is Run 185 in the Easter 2026 recess monitoring series (Runs 179–185). Run 184 was the designated reference-quality analysis for this recess period. Run 185 serves as:
1. **Confirmation run**: Validates that API plateau remains stable (no premature Tier 2 recovery)
2. **Individual endpoint test**: Confirms TA-10-2026-0099–0104 still inaccessible via direct calls
3. **Calendar milestone**: Sets the 9-day countdown to April 27 plenary return
4. **Series closure**: Marks the natural conclusion of the Easter recess analysis series

## Intelligence Gap Register

| Gap | Status | Resolution Expected |
|-----|--------|-------------------|
| TA-10-2026-0099–0104 content | Inaccessible (confirmed Run 185) | April 25–27 (Tier 3 restore) |
| EPP memberCount=0 | Persistent across all runs | Post-recess API verification |
| Events/procedures feed (Tier 2) | 404 | April 21–23 |
| Commission housing response | Pending (deadline April 26) | April 26 |
| April 28–30 plenary agenda | Not yet published | April 25–27 |
