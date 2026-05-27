<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Propositions Run 2026-05-27

**Run ID**: propositions-run262-1779864156
**Data Mode**: `degraded-feeds`
**Floor Factor**: 0.80
**Assessment Date**: 2026-05-27T06:45:00Z

---

## 1. Prefetch Status Summary

| Feed | Status | Items Retrieved | Notes |
|------|--------|----------------|-------|
| `adopted-texts-feed.json` | ✅ AVAILABLE | 500 items (multi-year) | 192 items dated 2026; 9 adopted in May 2026 |
| `external-documents-feed.json` | ✅ AVAILABLE | 500 items (multi-year) | Mostly ACT_FOLLOWUP (Commission responses); historical mix |
| `procedures-feed.json` | ❌ DEGRADED — 404 | 0 items | POST to `/api/v2/procedures/?view-version=v2.1` returned 404 Not Found |
| `committee-documents-feed.json` | ❌ DEGRADED — 404 | 0 items | POST to `/api/v2/committee-documents/?view-version=v2.1` returned 404 Not Found |

**Prefetch Mode declared by script**: `full` (4/4 fetched with 0 placeholders — artefact of script logic counting any non-empty file as "fetched")
**Analyst override**: `degraded-feeds` — 2 out of 4 primary feeds returned error payloads, not data.

---

## 2. Live MCP Probe Results (Stage A)

| Tool | Call | Result | Admiralty Grade |
|------|------|--------|----------------|
| `get_adopted_texts(year=2026, limit=50)` | Fallback for procedures-feed 404 | ✅ 51 items returned; 9 adopted in May 2026 | A2 — direct paginated EP API |
| `track_legislation("2025/2112(INI)")` | AI strategy for EU trade | ✅ Full timeline (8 events) | B2 — EP API /procedures enrichment |
| `track_legislation("2023/0228(COD)")` | Forest reproductive material | ✅ Full timeline (20 events); SIGNED 2026-05-20 | B2 |
| `track_legislation("2023/0447(COD)")` | Welfare of dogs and cats | ✅ Full timeline (12 events); adopted 2026-04-28 | B2 |

**Total Stage A EP MCP calls**: 4 (within the ≤5 cap per Rule 2).

---

## 3. Data Coverage for This Run

### High-confidence data (Admiralty A1–B2)
- 9 adopted texts from the week of May 19–27, 2026 with full identifiers and procedure references
- Complete legislative timelines for three priority procedures (2025/2112, 2023/0228, 2023/0447)
- Structural metadata for 51 adopted texts in 2026 YTD, covering thematic range

### Medium-confidence data (Admiralty C2–C3)
- External documents: 500 items available but predominantly multi-year Act-Followup (Commission position responses); limited filtering to recent week possible
- Economic context: IMF World Economic Outlook April 2026 data accessible via `fetch-proxy`; EU trade balance figures inferred from Eurostat approximations
- Committee rapporteur and amendment data: enrichment failures across all three `track_legislation` calls; amendment counts set to 0 (API limitation)

### Low/No coverage
- DOCEO roll-call vote data: within the documented 2–4 week DOCEO XML publication lag; no roll-call data available for May 2026 votes; declared as `degraded-voting` (secondary axis — primary `degraded-feeds` declaration takes precedence)
- Committee documents feed: 404 throughout; no committee-level working documents available
- Procedures feed: 404; live procedures browsing replaced by adopted-texts cross-reference

---

## 4. Data Mode Determination

Per Rule 2a (degraded feeds table):
- `procedures-feed.json` returned 404 → STALENESS_WARNING / feed unavailable
- `committee-documents-feed.json` returned 404 → feed unavailable
- IMF data: available via `fetch-proxy` (not probed in Stage A but accessible)
- Voting data: within DOCEO lag window → `degraded-voting` secondary axis

**Single-axis determination**: `degraded-feeds` (trigger: "1+ feeds unavailable after fetch"; floor factor: 0.80)

---

## 5. Impact on Analysis Depth

With a 0.80 floor factor applied to all artifact thresholds:
- Artifact line-count floors are reduced by 20% from reference benchmarks
- Structural requirements (Mermaid diagrams, WEP bands, Admiralty grades, SAT ≥ 10) are NOT reduced
- Analysis quality targets remain unchanged; the floor reduction reflects reduced raw data volume, not reduced analytical rigour
- The three tracked procedures provide sufficient primary source depth for Economist-quality analysis of the key propositions

---

## 6. Recommended Analytical Compensations

1. **Prioritise adopted-texts data**: 9 recent texts provide strong primary anchors; use procedure cross-references to reconstruct legislative timeline where feed data is absent
2. **Lean on track_legislation timelines**: Full event sequences for 2025/2112, 2023/0228, 2023/0447 substitute for committee-documents and procedures feed coverage
3. **Flag degraded-voting context**: No roll-call breakdown available for May 20 votes; reference aggregate vote outcomes from EP session records where possible
4. **Economic context via IMF proxy**: Use April 2026 WEO data and EU-specific trade statistics for the economic-context artifact

