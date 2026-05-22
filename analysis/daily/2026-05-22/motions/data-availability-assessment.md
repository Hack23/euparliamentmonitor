# Data Availability Assessment: EP Motions — May 2026
**Classification:** UNCLASSIFIED | **Run:** motions-run289-1779433987

---

## Prefetch Status
- **Mode:** full (all 4 feeds fetched, 0 placeholders per prefetch-status.json)
- **Generated:** 2026-05-22T07:09:55Z

## Data Source Inventory

| Source | Available | Items | Quality | Impact |
|--------|----------|-------|---------|--------|
| EP Adopted Texts Feed | ✅ | 500 (191 for 2026) | A2/B1 | High value |
| EP MEP Feed | ✅ | 627 active MEPs | A2/B1 | High value |
| EP Procedures Feed | ⚠️ | 0 items (degraded) | C3 | Medium impact |
| EP Documents Feed | ⚠️ | 0 items (degraded) | C3 | Low impact |
| DOCEO Roll-Call (May 19-21) | 🔴 | 0 (not yet published) | N/A | High impact |
| EP Voting Records API (current week) | 🔴 | 0 (publication delay) | N/A | High impact |
| IMF WEO April 2026 | ✅ | Full dataset used | A1/A1 | High value |

## Data Mode Determination
**`degraded-feeds`** — 1+ feeds unavailable (procedures, documents returned 0 items)
**Floor factor:** 0.80 applied to all per-artifact minimum line counts

## Most Significant Gap
Roll-call vote data unavailable — all voting analysis is inferred from group size and prior patterns.
This is a **structural, expected limitation** (EP publishes RCV data 2-6 weeks after plenary).

## Compensatory Methodology

Given the roll-call data gap, this analysis used the following compensatory methods:

### Vote Estimation Methodology
- **Group-size proxy**: Applied group seat share × estimated loyalty rate to infer likely voting outcomes
- **Historical pattern matching**: Cross-referenced against T10-0100 to T10-0183 patterns for similar resolution types
- **Institutional role theory**: EPP position on rule-of-law resolutions inferred from leadership statements and June 2025 MFF debate
- **Confidence labeling**: All voting estimates are marked 🟡 (MEDIUM CONFIDENCE — inferred) per the artifact catalog requirements

### Expected Data Future Availability
| Source | Expected Publication | Action Required |
|--------|--------------------|-----------------| 
| DOCEO RCV (May 19-21) | ~June 20-30, 2026 | Future workflow run should auto-pick up via get_latest_votes |
| Procedures feed | Uncertain (upstream issue) | Escalate to ep-mcp-server maintainers if persists |
| Documents feed | Uncertain (upstream issue) | Same as procedures |

### Impact on Analysis Quality
- **HIGH confidence** preserved for: legislative categories, IMF economic context, adopted text facts, procedural inferences from text metadata
- **MEDIUM confidence** for: voting breakdowns, group alignment patterns
- **LOW confidence** for: minority party positions, abstention patterns

**Overall Quality Grade:** B1-B2 (high-quality analysis with acknowledged data gaps)

### Future Data Integration Plan

When DOCEO roll-call data becomes available (target: June 2026), a future run should:
1. Download DOCEO XML for May 19-21, 2026 via `get_latest_votes` with `date: 2026-05-21`
2. Update `voting-patterns.md` with confirmed vote counts
3. Update `coalition-dynamics.md` with actual group defection rates
4. Upgrade confidence labels from 🟡 MEDIUM to 🟢 HIGH where supported
5. Add confirmed vote tallies to `executive-brief.md` and `deep-analysis.md`

This data integration pass should take ~15 minutes of a future Stage B, and will significantly increase the analytical confidence of the voting domain.

---

*Produced: 2026-05-22 | Run: motions-run289-1779433987*
