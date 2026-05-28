# Data Availability Assessment — Term Outlook 2026-05-28

> Article type: `term-outlook` · Run window: 2026-05-28 → 2029-06-XX (next EP election) · Horizon ≈ 1500 days.

## 1. Headline assessment

**Declared `dataMode`: `degraded-feeds` (line-floor factor 0.80).** Of the four
European Parliament Open Data Portal feeds pre-fetched for this run, **three
returned HTTP 404** from the `view-version=v2.1` endpoint (`procedures`,
`documents`, `events`) and only `external-documents` returned a payload (500
ACT_FOLLOWUP work records). IMF live SDMX data was retrieved successfully
(DEU/FRA/ITA macro and fiscal indicators, 2020–2030 horizon, 449 records).
World-Bank probe succeeded. Memory MCP unused for this run.

The aggregate effect is that **forward-looking EP procedural and event data is
unavailable** for the next-3-year horizon and the term-outlook artifacts must
rely on (a) institutional-calendar reasoning from publicly known EP10 / vdL II
mandates, (b) IMF macro context for the policy backdrop, and (c) prior-run
forward-statements registry mining where available. The data degradation is a
**continuation** of the pattern observed in the May 2026 runs of the
sister workflows (see `intelligence/mcp-reliability-audit.md` §3).

## 2. Per-source matrix

| Source | Status | Records | Notes |
|---|---|---|---|
| EP `/procedures` feed | ❌ 404 | 0 | `view-version=v2.1` rejects POST — no procedural-pipeline data |
| EP `/documents` feed | ❌ 404 | 0 | Same root cause as procedures |
| EP `/events` feed | ❌ 404 | 0 | Same root cause — no forward calendar data |
| EP `/external-documents` feed | ✅ 200 | 500 | All `ACT_FOLLOWUP` (Commission SP-series); mostly historic (2013–2026) |
| EP `track_legislation` deep-fetch | ⏸️ not attempted | 0 | Would require procedure IDs from broken feeds |
| EP `get_voting_records` | ⏸️ not attempted | 0 | Forward-looking workflow — voting data orthogonal |
| EP `get_plenary_sessions` | ⏸️ not attempted | 0 | Could backfill calendar; deferred to budget |
| IMF SDMX (live) | ✅ 200 | 449 obs | DEU/FRA/ITA NGDP_RPCH + PCPIPCH + GGXCNL_NGDP 2020-2030 |
| World Bank | ✅ probed | n/a | Available; not pulled for this horizon |
| Memory MCP | ⏸️ unused | n/a | No prior-run merge needed (first run today) |

## 3. Analytical impact

The three-feed 404 cluster materially degrades **only** the artifacts that
depend on near-term procedural inflow (`legislative-pipeline-forecast` would
have used `/procedures`; `parliamentary-calendar-projection` would have used
`/events`). For term-outlook, the **dominant analytical leverage** is
institutional-mandate reasoning (EP10 runs to June 2029; vdL II Commission to
December 2029; rotating Council Presidency schedule already publicly fixed
through end-2030) plus IMF macro context — and both substrates are intact.

Stage C is run with the `degraded-feeds` factor (0.80) so that per-artifact
line floors recognise the data scarcity without lowering structural quality
gates (WEP bands, Admiralty grades, SAT citations, Mermaid diagrams remain
unconditionally enforced).

## 4. Mitigations applied this run

- **EP procedural inflow** reconstructed via `intelligence/procedures-proxy.md`
  (sources: EP9 baseline, vdL II WP25, Council Presidency trio schedule).
- **EP calendar** reconstructed from publicly known EP10 sitting weeks
  (12 Strasbourg + 6 Brussels per year through Apr-2029, then dissolution).
- **Forward-looking macro envelope** sourced from the live IMF SDMX feed
  (annual frequency, DEU/FRA/ITA, 2020–2030). See
  `intelligence/economic-context.md` for the full vintage audit.
- **Confidence labels** ⬆️ tightened: every forward judgement carries a WEP
  band, a time horizon, and a confidence-in-evidence grade so degraded
  inputs do not silently propagate to the article.

## 5. Re-fetch plan (next checkpoint)

- 2026-07-01 (cron `0 8 1 1,7 *`) — re-attempt the three 404'd feeds and,
  on success, regenerate the proxy artifact set with authoritative data.
- If the 404 persists into Q3, escalate to the European Parliament
  Open Data Portal admin contact and document the regression in the
  cross-run `intelligence/mcp-reliability-audit.md` series.
