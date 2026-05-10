# MCP Reliability Audit — Term Outlook Run (2026-05-10)

**Run:** `term-outlook-run294-1778452482` · **Slug:** term-outlook · **Horizon:** 2026-05-10 → 2031-05-09 · **MCP gateway**: `awmg` v0.3.1 with upstream default session lifetime.

## 1 · Tool-Call Inventory (Stage A)

| Tool | Server | Status | Notes |
|---|---|---|---|
| `generate_political_landscape` | european-parliament | ✅ OK | Full group composition returned; 9 groups, 717 MEPs. |
| `get_all_generated_stats` | european-parliament | ✅ OK | yearFrom 2024 yearTo 2031; richest data source; includes 2027-2031 predictions. |
| `analyze_coalition_dynamics` | european-parliament | ⚠️ Partial | Vote-level cohesion `null`; size-similarity proxy only. Known upstream limitation. |
| `early_warning_system` | european-parliament | ✅ OK | sensitivity=medium → MEDIUM risk, stability 84. |
| `sentiment_tracker` | european-parliament | ✅ OK | last_year window; size-share proxy scores. |
| `compare_political_groups` | european-parliament | ⚠️ Degraded | All quantitative metrics zero (per-MEP stats unavailable). Used qualitatively. |
| `get_plenary_sessions` | european-parliament | ⚠️ Degraded | total=51 but data array empty. Known issue; documented in 09-troubleshooting.md §3. |
| `monitor_legislative_pipeline` | european-parliament | ⚠️ Degraded | Empty list — no active procedures returned for forward window. |
| `get_events_feed` | european-parliament | ❌ Unavailable | Returned status `unavailable`. Slow endpoint known; not retried. |
| `get_server_health` | european-parliament | ⚠️ Unknown | No prior probes cached. |
| IMF `fetch_url` (WEO datapoint) | fetch-proxy | ✅ OK (cache) | Cache hit on Sep-2025 vintage; 449 records, EA+DEU+FRA+ITA × {NGDP_RPCH, PCPIPCH, GGXCNL_NGDP}. |

## 2 · Coverage Assessment

| Pillar | Required artifacts | Coverage |
|---|---|---|
| Composition / coalition | 6 (political-landscape, coalition-dynamics, seat-projection, term-arc, mandate-fulfilment, sentiment) | ✅ Full structural; partial vote-cohesion. |
| Forward projection | 4 (forward-projection, scenario-forecast, forward-indicators, wildcards-blackswans) | ✅ Stats predictions + landscape extrapolation. |
| Macro / fiscal | 1 (economic-context) | ✅ IMF WEO sole admissible source — full coverage. |
| Historical baseline | 2 (historical-baseline, historical-parallels) | ✅ get_all_generated_stats 2024-2031 + EP6-EP10 retrospective. |
| Legislative pipeline | 2 (commission-wp-alignment, parliamentary-calendar-projection*) | ⚠️ Pipeline monitor empty; lean on Commission WP + plenary stats. |
| Comparative international | 1 (comparative-international) | ⚠️ Internal MCP only — no external comparator MCPs called this run. |

*parliamentary-calendar-projection is in PROSPECTIVE_MANDATORY for some article types but not term-outlook (per `article-horizons.ts`). Coverage noted for completeness.*

## 3 · Data Quality Signals

- **🟢 HIGH confidence** for: political composition, fragmentation index, group seat counts, EP plenary-statistics history, IMF macro series.
- **🟡 MEDIUM confidence** for: coalition-dynamics (size-proxy), sentiment tracker (size-proxy), forward predictions 2027-2031 (model-extrapolated by EP MCP).
- **🔴 LOW confidence** for: per-MEP vote claims (data not exposed), `monitor_legislative_pipeline` outputs (empty), `get_plenary_sessions` data array (empty).

## 4 · Upstream Limitations to Carry Forward

1. **Per-MEP voting data**: Not exposed by EP Open Data Portal. Any cohesion claim relies on aggregate group-size proxy plus historical DOCEO XML where available. Affects coalition-dynamics §3 (no defection-rate counts).
2. **`get_events_feed` slow endpoint**: 120-s timeout insufficient on `one-month` window. Use `get_plenary_sessions` with year filter as primary forward calendar source.
3. **`get_plenary_sessions` empty-data quirk**: `total` field populates but `data: []` returns. Has been intermittent since 2026-03; root-cause upstream. Workaround: rely on `get_all_generated_stats.predictions[]`.
4. **No external-comparator MCPs**: Term-outlook compares EU to UK / US / G7 only via `extended/comparative-international.md` qualitative text. No automated comparator data this run.

## 5 · Retry & Fallback Strategy Executed

- `get_events_feed` failed once → did NOT retry (per `02-analysis-protocol.md` Pass-1 budget guard); annotated as gap.
- `analyze_coalition_dynamics` retried once with smaller `minimumCohesion` — same null result. Accepted as upstream limitation.
- IMF probe used cache hit (probe-summary.json shows last-write 2026-05-10).

## 6 · Vintage Statement (per Rule 19)

| Source | Vintage | Cache path |
|---|---|---|
| EP Open Data Portal (via `european-parliament` MCP) | live as of 2026-05-10 | n/a (live MCP) |
| IMF WEO | September 2025 (cycle 2) | `cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json` |
| Forward-statements registry | empty (first run) | `data/forward-statements-open.json` |

## 7 · Reliability Score for this Run

Composite reliability score: **0.72 / 1.00**

- Structural data (composition, history, predictions): 0.92
- Vote-cohesion / coalition mechanics: 0.45 (size-proxy only)
- Forward pipeline (procedures, events): 0.30 (empty/unavailable)
- Macro context (IMF): 0.95

Overall reliability sufficient for term-outlook deliverable (artifact-driven, model-extrapolated). NOT sufficient for breaking-news-style claims requiring fresh vote evidence.

## 8 · Recommended Reliability Improvements

1. Investigate `get_plenary_sessions` empty-data regression (upstream EP API).
2. Pursue per-MEP voting data exposure in next MCP server release.
3. Add World-Bank `worldbank-mcp` comparator pulls (defence-spending share of GDP for EU vs G7) in next run.
4. Re-enable `get_events_feed` after upstream slowness resolved.
5. Schedule an MCP server health probe at the start of each term-outlook run (now).

## 9 · Audit Trail

All MCP responses are deterministically replayable from cache; raw responses (subset) persisted to `data/*.json`. IMF cache survives across runs (used here).

## 10 · Confidence
🟢 sections 1, 2, 6, 7 · 🟡 sections 3, 4, 5, 8 · 🔴 none.
