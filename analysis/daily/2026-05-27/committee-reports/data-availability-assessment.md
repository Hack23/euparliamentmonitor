# Data Availability Assessment — Committee Reports (2026-05-27)

**Run ID**: committee-reports-run271-1779861057
**Analysis Date**: 2026-05-27
**Data Window**: 2026-05-20 to 2026-05-27
**Data Mode**: `degraded-feeds` (floor factor: 0.80)

---

## Feed Availability Summary

| Feed | Status | Items Retrieved | Fallback Used |
|------|--------|----------------|---------------|
| `adopted-texts-feed.json` | ✅ OK | 500 items (EP9+EP10) | None |
| `committee-documents-feed.json` | ❌ 404 Error | 0 | `get_committee_documents(limit=50)` |
| `procedures-feed.json` | ❌ 404 Error | 0 | `get_adopted_texts(year=2026)` |
| `events-feed.json` | ❌ 404 Error | 0 | `get_plenary_sessions` (empty) |
| `documents-feed.json` | ❌ 404 Error | 0 | Adopted texts used as proxy |

**Prefetch mode declared**: `full` (by prefetch-ep-feeds.sh)
**Actual mode after agent inspection**: `degraded-feeds`

---

## MCP Call Log (Stage A)

| Call # | Tool | Parameters | Result |
|--------|------|-----------|--------|
| 1 (pre-fetched) | `adopted-texts-feed` | timeframe=one-week | 500 items |
| 2 | `get_committee_documents` | limit=50 | 50 AFCO docs returned |
| 3 | `get_plenary_sessions` | dateFrom=2026-05-13 | 0 recent sessions (data gap) |
| 4 | `get_adopted_texts` | year=2026, limit=50 | 51 EP10 2026 adopted texts |

**Total Stage A MCP calls**: 3 live (+ 1 pre-fetched) = within ≤5 cap

---

## Data Mode Rationale

The `degraded-feeds` declaration is driven by:
- `committee-documents-feed`: 404 Not Found from EP v2.1 API
- `procedures-feed`: 404 Not Found (historical-tail ordering fallback unavailable)
- `events-feed`: 404 Not Found from `/events/?view-version=v2.1`
- `documents-feed`: 404 Not Found

Only `adopted-texts-feed` delivered full data (500 items). The `get_adopted_texts(year=2026)` 
fallback recovered 51 adopted texts for EP10/2026, providing substantive legislative evidence
for Stage B analysis (Admiralty Grade: B2 — reliable source, corroborated through cross-reference).

**Analytical impact**: Committee-level granularity (rapporteur names, vote tallies, in-committee debates)
is unavailable due to the procedures/events feed degradation. The analysis relies on final adopted texts
and committee document reference IDs. Attribution to specific committee workflows is inferred from
subject-matter codes rather than direct committee vote records.

---

## Key Legislative Evidence Recovered

| Reference | Title | Date | Subject |
|-----------|-------|------|---------|
| TA-10-2026-0183 | AI Strategy for EU Trade | 2026-05-20 | TECN, INFQ |
| TA-10-2026-0182 | Recommendation on 81st UNGA | 2026-05-20 | EXT |
| TA-10-2026-0179 | EU–Cook Islands Fisheries Partnership | 2026-05-20 | PECH, EXT |
| TA-10-2026-0178 | EC–São Tomé Fisheries Partnership | 2026-05-20 | PECH, EXT |
| TA-10-2026-0177 | EU–Lebanon Eurojust Agreement | 2026-05-20 | EXT, COJP |
| TA-10-2026-0174 | EU–Uzbekistan Enhanced Partnership | 2026-05-20 | EXT |
| TA-10-2026-0168 | Forest Reproductive Material | 2026-05-19 | SILV, SEME |
| TA-10-2026-0166 | Immunity Waiver — Nikos Pappas | 2026-05-19 | PRIV |
| TA-10-2026-0164 | Immunity Waiver — Harald Vilimsky | 2026-05-19 | PRIV |

---

## Confidence Assessment

**Overall data confidence**: 🟡 MEDIUM
- Legislative output data from adopted-texts is high-quality (Admiralty A1)
- Committee-level procedural data is inferred (Admiralty C3)
- Voting tallies are unavailable (DOCEO lag + feed degradation)
- Economic/IMF context not yet integrated (Stage B task)

**Analytical floor**: Sufficient for political intelligence synthesis, scenario forecasting,
and stakeholder mapping based on legislative output signals. Insufficient for detailed
procedural analysis (vote margins, rapporteur identification, committee composition).
