<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EU Parliament Motions — 2026-05-26

**Run:** motions-run272-1779780541 | **Date:** 2026-05-26

## Execution Timeline

| Stage | Started | Status | Notes |
|-------|---------|--------|-------|
| Pre-agent prefetch | T+0 | ✅ COMPLETE | 4 feeds; 2 success, 2 404 |
| Stage A — Data Collection | T+2m | ✅ COMPLETE | 5 EP MCP calls; degraded-voting mode set |
| Stage B — Analysis Pass 1 | T+6m | ✅ COMPLETE | 14+ artifacts written |
| Stage B — Analysis Pass 2 | T+ongoing | 🔄 IN PROGRESS | Deepening and extending |
| Stage C — Completeness Gate | TBD | ⏳ PENDING | Target <minute 36 |
| Stage D — Article Render | TBD | ⏳ PENDING | npm run generate-article |
| Stage E — Single PR | TBD | ⏳ PENDING | Target minute ≤42 |

## Invocation Budget Tracking

| Stage | Calls Used | Cap | Status |
|-------|-----------|-----|--------|
| Prefetch (pre-agent) | N/A | N/A | Not counted |
| Stage A EP MCP | 5 | 5 | ✅ AT CAP |
| Stage B analysis creation | ~15 | No cap | N/A |
| Stage C/D/E | TBD | ~5 remaining budget | Monitor |

## Data Mode Justification

**degraded-voting** was selected because:
1. `get_voting_records` returned empty — confirmed 4-week RCV publication delay
2. `get_latest_votes` DOCEO XML unavailable for week 2026-05-19
3. All 14 adopted texts confirmed via `get_adopted_texts` (year=2026) and feed
4. Structural proxy methodology applied per protocol

## File System Integrity

| Directory | Created | Files | Status |
|-----------|---------|-------|--------|
| analysis/daily/2026-05-26/motions/ | ✅ | ~20 files | OK |
| .../intelligence/ | ✅ | 15 files | OK |
| .../risk-scoring/ | ✅ | Pending | Pending |
| .../existing/ | ✅ | Pending | Pending |
| .../extended/ | ✅ | Pending | Pending |
| .../data/ | Pre-existing | 5 files | OK |
| .../runs/ | ✅ | thresholds-cache.json | OK |

## Protocol Compliance

| Rule | Status | Notes |
|------|--------|-------|
| Single PR rule | ✅ Enforced | No PR called yet |
| Shell safety (no nested expansions) | ✅ Compliant | Safe two-step pattern used for ELAPSED_MIN |
| File authoring via create/edit only | ✅ Compliant | No heredocs for prose |
| Confidence labels capped at 🟡 MEDIUM | ✅ Compliant | degraded-voting protocol |
| methodology-reflection.md last | ✅ Pending | Will be written last |
| No IMF data in article (placeholder) | ✅ — IMF in economic-context | Stage D aggregates |

## Elapsed-Time Check (at workflow audit creation)

Elapsed time check: approximately ~15 minutes into the run. Stage C tripwire is at minute 36. Budget remains adequate for completing Stage B Pass 2, Stage C, D, and E by minute 45.

## Risk Flags

| Flag | Severity | Mitigation |
|------|---------|-----------|
| procedures-feed 404 | LOW | Not needed for motions analysis |
| DOCEO XML unavailable | MEDIUM | degraded-voting mode applied |
| Invocation cap reached Stage A | LOW | All critical data collected |
