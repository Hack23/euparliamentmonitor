# Pipeline Health Report — EU Parliament Legislative Pipeline
## Propositions Analysis Context, 4 May 2026

**Purpose:** Track overall EP legislative pipeline health as background context for propositions analysis
**Date:** 4 May 2026

---

## Pipeline Health Summary

**Overall Pipeline Status:** 🟡 MIXED — High output session completed; upstream feed quality degraded

### Data Quality Assessment

| Data Source | Status | Notes |
|-------------|--------|-------|
| `get_procedures_feed` (one-week) | 🔴 DEGRADED | Returns 1970s-1980s historical items — no current-week procedures |
| `get_external_documents_feed` | 🔴 UNAVAILABLE | Returned empty |
| `get_committee_documents_feed` | 🔴 UNAVAILABLE | Returned empty (API error) |
| `get_adopted_texts` (year filter) | 🟢 HEALTHY | 101 texts from 2026; reliable paginated access |
| `get_plenary_sessions` (year filter) | 🟢 HEALTHY | Session data complete and accurate |
| `get_voting_records` (recent) | 🟡 DELAYED | EP roll-call data published with 4-6 week lag |
| `track_legislation` (by ID) | 🟢 HEALTHY | Individual procedure tracking functional |

### Legislative Output — April 2026 Sprint

The April 28–30 Strasbourg session was a high-output plenary:
- **5 ordinary procedure legislative acts** (COD) — final positions established
- **2 consent procedure texts** (APP) — Ukraine Claims Commission, bilateral agreement
- **6 own-initiative resolutions** (INI) — DMA, Armenia, Ukraine accountability, livestock, cyberbullying, proxy voting
- **5 immunity waiver decisions** (IMM) — all Polish/Romanian MEPs, all waivers granted

Total: **18 legislative and quasi-legislative acts** in 3 days — above-average session density.

### Current Pipeline Bottlenecks

1. **ETS II MSR awaiting Council vote** — Parliament's first reading position adopted; Council approval expected Q2 2026. Minor bottleneck.

2. **GHG Transport Accounting — implementing acts pending** — Commission must produce delegated regulations within 18 months of entry into force. Bottleneck risk: Commission work programme capacity.

3. **Ukraine Claims Commission — ratification pipeline** — 43 signatories must ratify. Council decision pending. Timeline: entry into force Q4 2026 at earliest optimistic estimate.

4. **GSP Recast — 40+ bilateral framework dialogues** — DG TRADE operational implementation bottleneck with major beneficiary countries.

5. **Proxy Voting Amendment — member state ratification** — Constitutional threshold; 22-36 month pipeline typical for Electoral Act amendments.

### Data Limitation Notes

- The procedures_feed endpoint returns historical data from 1970s-1980s rather than current-week items. This is a known EP Open Data portal quality issue (STALENESS_WARNING pattern documented in MCP server docs). Workaround: use `get_adopted_texts` with year filter as primary data source.
- Roll-call voting data for April 28-30 session will not be available until late May/early June 2026 (4-6 week EP publication delay).

---

*Pipeline health report produced: 4 May 2026.*
