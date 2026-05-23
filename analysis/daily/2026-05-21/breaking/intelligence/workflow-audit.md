# Workflow Audit — Extended — EU Parliament Breaking News 2026-05-21
**Framework**: Run Audit and Quality Control Documentation
**Date**: 2026-05-21 | **Run ID**: breaking-run258-1779351146 (prior), rerun 2026-05-21
**Admiralty**: A1 (first-party run documentation)

## Run Configuration

| Parameter | Value |
|-----------|-------|
| Article Type | breaking |
| Run Date | 2026-05-21 |
| Data Mode | degraded-voting |
| Floor Factor | 0.85 |
| Stage A Budget | ≤5 min |
| Stage B Budget | ≤28 min |
| Stage C Tripwire | 36 min |
| PR Deadline | ≤45 min |

## Stage A Execution

| Step | Status | Duration | Notes |
|------|--------|----------|-------|
| MCP Setup | ✅ SUCCESS | <1 min | EP_MCP_GATEWAY_URL configured |
| Prefetch Verification | ✅ SUCCESS | <1 min | 6 feeds, 0 placeholders |
| Feed Inventory | ✅ SUCCESS | <1 min | adopted-texts (500 items), MEPs (610) |
| Additional EP MCP Calls | MINIMAL | <1 min | Stage A completed from prefetch data |

**MCP Call Count**: ≤5 (within Stage A hard cap) — prefetched feeds used directly

## Stage B Execution

| Pass | Artifacts Written | Status | Notes |
|------|-----------------|--------|-------|
| Pass 1 | ~24 artifacts | COMPLETE | Core intelligence artifacts written |
| Pass 2 (extend) | All carryForward + missing | IN PROGRESS | This is pass 2 for prior run artifacts |

**Prior Run Diff Result**:
- CarryForward: 2 artifacts (executive-brief.md, stakeholder-map.md)
- Rewrite/Create: 37 artifacts (most missing from prior run)

## Stage C Result (Prior Run)

**Status**: RED — 9 missing, 6 mermaid_missing, significant issues
**Tripwire Triggered**: ANALYSIS_ONLY at minute 40 (tripwire: 36)

## Quality Flags

| Flag | Count | Status |
|------|-------|--------|
| Missing Artifacts | ~20 (estimated) | BEING FIXED |
| Short Artifacts | 4 | BEING FIXED |
| Missing Mermaid | 14 | BEING FIXED |
| Missing SAT Section | 1 | FIXED |
| Orphan Artifacts | 35 | ADDING TO MANIFEST |

## Remediation Plan

1. ✅ Add SAT section to methodology-reflection.md
2. ✅ Extend classification/* with mermaid + sections
3. ✅ Add mermaid to 8 intelligence artifacts
4. ✅ Extend risk-matrix, threat-model, significance-classification
5. ⬜ Create all extended/* missing artifacts
6. ⬜ Update manifest to include all artifacts
7. ⬜ Run Stage C validate-analysis

---
*Workflow Audit | Run Documentation | Admiralty A1 | 2026-05-21*

## Re-Run 2026-05-21T19:36 — Extended Audit

### Run Parameters (Re-run)
| Parameter | Value |
|-----------|-------|
| Run ID | breaking-run261-1779392184 |
| Prior Run ID | breaking-run258-1779351146 |
| Re-run Trigger | Stage C RED in prior run |
| MCP Calls (Stage A) | 4 (within ≤5 cap) |
| Feeds Pre-fetched | 6/6 (full prefetch mode) |
| Voting Data | Unavailable (degraded-voting mode) |

### Stage A — Re-run Data Collection
| Source | Items | Method |
|--------|-------|--------|
| Adopted texts feed (today) | 58 texts confirmed | MCP get_adopted_texts_feed |
| Latest votes probe | 0 records | MCP get_latest_votes (unavailable) |
| Plenary sessions probe | 0 records | MCP get_plenary_sessions (API degraded) |
| Procedures feed | Historical data (staleness warning) | Pre-fetched |

**MCP Call 1**: get_adopted_texts_feed (today) — 58 texts T10-0057 to T10-0191 confirmed ✅
**MCP Call 2**: get_latest_votes — 0 records, datesUnavailable: [2026-05-18,19,20,21] — confirms degraded-voting
**MCP Call 3**: get_plenary_sessions (May 19-21) — 0 filtered results; API degraded
**MCP Call 4**: get_adopted_texts (TA-10-2026-0183) — UPSTREAM_404; content indexed not yet available

### Re-run Prior-Run-Diff Analysis
- **carryForward targets**: 10 artifacts (≥extendFloor required)
- **rewrite targets**: 30 artifacts (below floor)
- **Total artifacts to touch**: 40
- **New artifacts created**: intelligence/voting-patterns.md, intelligence/voting-patterns.degraded.md

### Stage B — Artifact Production Status (Re-run)
| Category | Count | Target |
|----------|-------|--------|
| REWRITE completed | 30 | 30 |
| CARRY extended | 10 | 10 |
| New artifacts created | 2 | 2 |
| Total modified | 42 | 42 |

### Data Mode Declaration
- **prefetchMode**: full (6/6 feeds, 0 placeholders) — from prefetch-status.json
- **votingMode**: unavailable — DOCEO XML dates 2026-05-18/19/20/21 all return empty
- **Final dataMode**: degraded-voting (voting data unavailable; all other feeds operational)
- **Floor factor applied**: 0.85

---
*Workflow Audit — Re-run 2026-05-21T19:36 | Admiralty A1 | Updated by breaking-run261*
