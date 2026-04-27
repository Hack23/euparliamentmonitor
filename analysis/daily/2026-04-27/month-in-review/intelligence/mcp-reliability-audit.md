<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EU Parliament Month in Review: 2026-04-27

**Run Date:** 2026-04-27 | **Type:** month-in-review | **Audit Scope:** Stage A data collection tools

---

## Tool Health Summary

| Tool | Status | Items | Quality Warnings | Verdict |
|------|--------|-------|-----------------|---------|
| `get_adopted_texts_feed` | ✅ Operational | 292 items (one-month) | None | 🟢 HEALTHY |
| `get_adopted_texts` (year:2026) | ✅ Operational | 100 items | None | 🟢 HEALTHY |
| `get_procedures_feed` | ⚠️ Degraded | Historical 1972 data | ENRICHMENT_FAILED, recess mode | 🟡 KNOWN ISSUE §11 row #5 |
| `get_voting_records` | ⚠️ Empty | 0 records | Roll-call delay | 🔵 EXPECTED BEHAVIOR |
| `get_speeches` | ⚠️ Empty | 0 records | Publication delay | 🔵 EXPECTED BEHAVIOR |
| `analyze_coalition_dynamics` | ✅ Operational | Full group data | Proxy scores (no per-MEP data) | 🟢 HEALTHY |
| `generate_political_landscape` | ✅ Operational | Full landscape | None | 🟢 HEALTHY |
| `world-bank get-economic-data` | ⚠️ Partial | DE/FR only | EU aggregate codes rejected | 🟡 KNOWN LIMITATION |

---

## Triage Against `.github/prompts/07-mcp-reference.md §11`

### `get_procedures_feed` — 🟡 KNOWN ISSUE (§11 row #5)

**Observed behavior:** Feed returned 50 items all dated 1972, indicating historical archive ordering. `detectProceduresFeedRecessMode()` logic applies: all items ≤1995 → recess mode flag.

**Triage result:** NOT a new bug. Documented at §11 row #5 as `STALENESS_WARNING / recessMode:true` — a known degraded-upstream pattern where the EP API falls back to historical archive ordering. Mitigation applied: used `get_adopted_texts` direct endpoint instead.

**Upstream issue warranted:** No — documented behavior.

---

### `get_voting_records` — 🔵 EXPECTED BEHAVIOR

**Observed behavior:** Returned `{"votes": []}` for dateFrom=2026-03-28 to dateTo=2026-04-27.

**Triage result:** Standard EP roll-call publication delay of 4–6 weeks. Queries for the most recent 1–2 months will typically return empty. Documented in tool description. `freshnessLabel: ep-rollcall-delayed` applied per protocol; WEP bands widened +10pp.

**Upstream issue warranted:** No — documented expected behavior.

---

### `get_speeches` — 🔵 EXPECTED BEHAVIOR

**Observed behavior:** Returned empty set for recent date range.

**Triage result:** EP speech metadata has similar publication delay to roll-call votes. Expected for near-real-time queries.

**Upstream issue warranted:** No — expected behavior.

---

### World Bank `get-economic-data` EU codes — 🟡 KNOWN LIMITATION

**Observed behavior:** Queries using `EU`, `EAU`, `EMU` codes returned errors.

**Triage result:** The World Bank API uses `XC` (Euro area) and does not support `EU` as a composite code in all contexts. Individual member state codes (DE, FR, PL) work correctly. EU-aggregate framing must use IMF EA designations. Not an MCP server bug — a World Bank API design choice.

**Mitigation applied:** Used DE (Germany) and FR (France) as representative member states; applied IMF WEO April 2026 projections for EA-level aggregates.

**Upstream issue warranted:** No — World Bank API limitation, not MCP server defect.

---

## Tool Call Volume

| Phase | Tool Calls Made | Successful | Degraded | Empty (expected) |
|-------|----------------|------------|----------|-----------------|
| Stage A | ~12 tool calls | 8 | 2 | 2 |

---

## Data Quality Assessment

| Data Type | Source | Quality | Notes |
|-----------|--------|---------|-------|
| Adopted texts | EP MCP `get_adopted_texts_feed` + `get_adopted_texts` | 🟢 HIGH | 292 items from feed; 100 from direct endpoint; cross-validated |
| Coalition/political | EP MCP `analyze_coalition_dynamics` + `generate_political_landscape` | 🟢 HIGH | Size-proxy scores, not vote-level cohesion; labelled accordingly |
| Procedures | Direct endpoint fallback | 🟡 MEDIUM | Feed degraded; direct `get_procedures` used; limited metadata |
| Voting records | Unavailable | 🔴 N/A - Delayed | Standard delay; proxy analysis applied with widened uncertainty bands |
| Economic | World Bank (DE, FR) + IMF WEO institutional knowledge | 🟡 MEDIUM | No EU aggregate; IMF context via WEO April 2026; vintage labelled |

---

## Recommendations

1. **Procedures feed degradation** — recurring issue at §11 row #5. EP API temporal consistency issue should be monitored across runs; if persistent, file upstream issue with `european-parliament-mcp-server` repo.

2. **Voting records baseline** — the consistent 4–6 week delay means month-in-review articles will structurally lack vote-level data. Consider building a 6-week lookback as the standard data window for voting analysis in this article type.

3. **World Bank EU codes** — standardise on `XC` (Euro area) or explicit member state lists in future Stage A data collection for EU economic analysis.

---

## Compliance Attestation

- ✅ All tool calls used legitimate documented parameters
- ✅ No `tools: ["*"]` or wildcard tool specifications used
- ✅ ENRICHMENT_FAILED warnings properly logged and not re-raised as bugs
- ✅ Empty voting/speech results handled per protocol (not treated as errors)
- ✅ IMF institutional knowledge applied with proper vintage labelling per Wave-2 OR-gate policy
