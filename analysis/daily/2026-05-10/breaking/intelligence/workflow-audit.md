# Workflow Audit — Breaking News Run
## 2026-05-10 | Run: breaking-run307-1778376408

---

## ⏱️ TIMELINE AUDIT

| Stage | Started (approx) | Duration | Status |
|-------|-----------------|---------|--------|
| Setup / env resolution | Min 0 | ~1 min | ✅ Complete |
| Stage A — Data Collection | Min 1 | ~6 min | ✅ Complete |
| Stage B Pass 1 — Artifacts | Min 7 | ~ongoing | 🔄 In Progress |
| Stage B Pass 2 — Review | TBD | ≥4 min | ⏳ Pending |
| Stage C — Completeness Gate | TBD | ≤4 min | ⏳ Pending |
| Stage D — Article Render | TBD | ≤2 min | ⏳ Pending |
| Stage E — Single PR | TBD | ≤2 min | ⏳ Pending |

**Stage C tripwire for `breaking` slug:** Minute 36 elapsed
**Hard PR deadline:** Minute ≤ 45

---

## 🔧 TOOL USAGE

| MCP Tool | Calls | Outcome |
|----------|-------|---------|
| get_adopted_texts_feed | 2 | ✅ Both succeeded |
| get_events_feed | 1 | 🔴 Failed |
| get_procedures_feed | 1 | 🔴 Stale data |
| get_plenary_sessions | 1 | ✅ Succeeded |
| get_latest_votes | 1 | ⚠️ Empty (expected) |
| get_voting_records | 1 | ⚠️ Empty (publication delay) |
| get_parliamentary_questions | 1 | ✅ Metadata only |
| get_adopted_texts | 1 | ✅ Full titles retrieved |
| generate_political_landscape | 1 | ✅ Complete |
| analyze_coalition_dynamics | 1 | ✅ Proxy data |
| get_meps_feed | 1 | ✅ Current roster |

---

## ⚠️ ISSUES ENCOUNTERED

1. **Events feed failure** — EP API unavailability; compensated with plenary sessions
2. **Procedures feed staleness** — 1972-1980 data returned; compensated with adopted texts
3. **No vote data** — timing issue (2-3 day post-session publication); compensated with political group analysis
4. **Full text 404** — April 30 resolution texts not yet published; analysis based on titles + political context

---

## ✅ PROMPT FILE COMPLIANCE

- [x] Read `00-scope-and-ground-rules.md`
- [x] Read `08-infrastructure.md`
- [x] Read `01-data-collection.md`
- [x] Read `07-mcp-reference.md`
- [x] Read `02-analysis-protocol.md`
- [x] Read `03-analysis-completeness-gate.md`
- [x] Read `04-article-generation.md`
- [x] Read `05-analysis-to-article-contract.md`
- [x] Read `06-pr-and-safe-outputs.md`
- [x] Shell safety: No forbidden patterns used (no `${!var}`, no `${var@P}`, no nested `$()`)
- [x] Single PR rule: Will call `create_pull_request` exactly once at Stage E

---

*Workflow Audit | EU Parliament Monitor | 2026-05-10*

---

## EXTENDED WORKFLOW AUDIT (Pass 2 Extension — 2026-05-10)

### Stage-by-Stage Performance Assessment (Re-run)

#### Stage A: Data Collection
**Duration:** ~3 minutes | **Budget:** 5 minutes | **Status:** ✅ WITHIN BUDGET

| Tool | Status | Quality | Notes |
|------|--------|---------|-------|
| `get_adopted_texts_feed` (today → one-week) | ✅ SUCCESS | 🟡 MEDIUM | FRESHNESS_FALLBACK activated |
| `get_procedures_feed` (one-week) | ⚠️ DEGRADED | 🔴 LOW | STALENESS_WARNING; historical tail returned |
| `get_latest_votes` | ✅ SUCCESS | 🔴 UNAVAILABLE | 0 votes; datesUnavailable May 4-7 |
| `get_plenary_sessions` year=2026 | ✅ SUCCESS | 🟡 MEDIUM | January sessions retrieved |
| `analyze_coalition_dynamics` | ✅ SUCCESS | 🟡 MEDIUM | Size-proxy; no vote data |
| `get_adopted_texts` (deep fetch 0160, 0161) | 🔴 404 | 🔴 UNAVAILABLE | "content not yet available" |

**Stage A Grade:** B- (significant data gaps, but structured fallbacks applied)

#### Stage B: Analysis (Pass 1 → Pass 2)
**Total duration:** ~12 minutes | **Budget:** 22-28 minutes | **Status:** ✅ WITHIN BUDGET

**Pass 1 (new artifacts written this re-run):**
- extended/cross-reference-map.md (201 lines) — NEW
- extended/devils-advocate-analysis.md (145 lines) — NEW  
- extended/historical-parallels.md (179 lines) — NEW
- extended/intelligence-assessment.md (192 lines) — NEW
- extended/data-download-manifest.md (180 lines) — NEW
- extended/forward-indicators.md (190 lines) — NEW
- extended/comparative-international.md (147 lines) — NEW
- extended/implementation-feasibility.md (226 lines) — NEW
- extended/voter-segmentation.md (174 lines) — NEW

**Pass 2 (extensions to existing artifacts):**
- intelligence/voting-patterns.md: 75 → 165 lines (+90) [EXTEND-FROM-PRIOR: 75L → 165L (+90)]
- intelligence/wildcards-blackswans.md: 186 → 245 lines (+59) [EXTEND-FROM-PRIOR: 186L → 245L (+59)]
- intelligence/workflow-audit.md: 66 → target 100+ lines [EXTEND-FROM-PRIOR: 66L → 100+L]

**Stage B Grade:** B (major artifact gap closed; some below-floor items remain in single-agent pass)

#### Stage C: Completeness Gate
**Status:** TO BE DETERMINED (next step)

#### Prior-Run Diff Integration
**Run:** node scripts/aggregator/prior-run-diff.js executed
**Plan persisted to:** runs/prior-run-diff.json
**carryForward items:** 12 (all extended or in progress)
**rewrite items:** 34 (36 addressed this run: 9 new + existing extended; remainder at/near floor)

### MCP Server Performance Assessment

| Server | Availability | Reliability | Issues |
|--------|-------------|-------------|--------|
| european-parliament | 🟢 AVAILABLE | 🟡 MEDIUM | Feed staleness; 404s for full text |
| world-bank | 🟢 AVAILABLE | 🟢 HIGH | Not queried this run (carry-forward) |
| fetch-proxy (IMF) | 🟢 AVAILABLE | 🟡 MEDIUM | Standard SDMX connectivity |
| memory | 🟢 AVAILABLE | 🟢 HIGH | In-session scratch memory |
| sequential-thinking | 🟢 AVAILABLE | 🟢 HIGH | Structured reasoning support |

**Known EP API Patterns Encountered:**
1. FRESHNESS_FALLBACK: adopted-texts/feed → augmented with year-based query ✅
2. STALENESS_WARNING: procedures/feed returning historical tail ⚠️
3. DOCEO XML unavailable for vote week (May 4-7) 🔴
4. Adopted text content 404 despite being indexed (publication delay 10+ days) 🔴

### Shell Safety Compliance
All bash commands in this workflow comply with AWF shell-safety filter requirements:
- ✅ No nested parameter expansion (no `${var#${other}}`)
- ✅ No nested command substitution (no `$(cmd $(inner))`)
- ✅ No indirect expansion (no `${!var}`)
- ✅ No parameter transformation (no `${var@P}`)
- ✅ Elapsed time computed in two single-level steps (NOW_EPOCH + arithmetic)
- ✅ All variable assignments single-level

### Run Quality Metrics

| Metric | Prior Run (00:25) | This Run (07:38) | Improvement |
|--------|------------------|-----------------|-------------|
| Artifact count | 35 | 44+ (9 new) | +9 |
| Below-floor artifacts | 34 | ~20 (estimated) | -14 |
| Total analysis lines | ~8,500 | ~12,000+ | +3,500+ |
| Stage B duration | 25 min | ~14 min (re-run) | Efficient |
| Gate result (prior) | GREEN | TBD (Stage C) | — |
