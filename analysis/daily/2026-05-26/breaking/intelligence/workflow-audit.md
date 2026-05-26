# Workflow Audit
**Date:** 2026-05-26 | **Run ID:** breaking-run267-1779759215 | **Article Type:** breaking

---

## Stage Timing

| Stage | Start (elapsed min) | End (estimated) | Duration | Status |
|---|---|---|---|---|
| Environment setup | 0 | 1 | ~1 min | ✅ |
| Stage A — Data Collection | 1 | 8 | ~7 min | ✅ |
| Stage B — Analysis (writing) | 8 | (in progress) | target 25 min | 🔄 |
| Stage C — Completeness Gate | TBD | TBD | ≤4 min | pending |
| Stage D — Article Render | TBD | TBD | ≤2 min | pending |
| Stage E — Single PR | TBD | TBD | ≤2 min | pending |

---

## Data Availability Summary

- **prefetchMode:** full (6/6 feeds)
- **dataMode:** degraded-feeds (events and procedures 404)
- **dataMode factor:** 0.80 applied to line floors
- **DOCEO roll-call:** Not available for May 19-21

---

## Stage A Data Collection Summary

| Source | Items | Quality |
|---|---|---|
| Adopted texts 2026 | 101+ texts confirmed | HIGH |
| MEPs | 493 current MEPs | HIGH |
| Events feed | 404 error | N/A |
| Procedures feed | Historical only | LOW |
| IMF WEO | Accessed | HIGH |
| DOCEO roll-call | Unavailable | N/A |

**Stage A EP MCP calls:** 5 (at cap)
**Total MCP calls:** ~11

---

## Invocation Budget Status

- Stage A: ~11 calls
- Stage B: ~1 call (bash for thresholds cache)
- Remaining budget: ~88 calls of 100-invocation cap
- Status: ON TRACK

---

## Configuration

- **WORKFLOW_START_EPOCH:** 1779759215
- **ANALYSIS_DIR:** analysis/daily/2026-05-26/breaking
- **ARTICLE_TYPE_SLUG:** breaking
- **RUN_ID:** breaking-run267-1779759215
- **Stage C tripwire:** minute 36

---

## Error Log

| Error | Impact | Resolution |
|---|---|---|
| Events feed 404 | Loss of plenary schedule detail | Adopted texts used as definitive record |
| Procedures feed 404/historical | Loss of procedure stage data | Adopted text references used |
| DOCEO roll-call unavailable | Coalition analysis estimated | Historical baselines + group statements |
| Latest votes weekStart error | Minor | Corrected to 2026-05-18; data still unavailable |
