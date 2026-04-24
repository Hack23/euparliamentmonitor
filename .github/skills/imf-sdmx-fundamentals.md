<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# IMF SDMX Fundamentals Skill

> **Skill**: Understand the SDMX 3.0 dimension-and-codelist model used
> by every IMF Open Data dataflow so that agents can construct valid
> `imf-fetch-data` keys without hitting the discovery endpoints
> (`imf-get-parameter-defs`, `imf-get-parameter-codes`) on every run.
> This is a static reference; the canonical machine-readable source of
> truth remains the IMF SDMX 3.0 REST API.

**🌀 Wave:** 3 — companion skill to
[`imf-data-integration.md`](imf-data-integration.md) (the high-level
"when and how" guide) and [`mcp-gateway-configuration.md`](mcp-gateway-configuration.md)
(the transport-level configuration guide).

**🎯 Purpose:** Reduce round-trips to discovery endpoints (`imf-get-parameter-defs`,
`imf-get-parameter-codes`) during Stage-A data collection by memoising
the stable dimension grammar. The underlying SDMX 3.0 structure
changes infrequently (~quarterly, tied to WEO vintages); this skill is
the human-readable companion to
[`analysis/imf/sdmx-dimensions-reference.md`](../../analysis/imf/sdmx-dimensions-reference.md).

---

## 1. SDMX 3.0 Data-Key Grammar

Every IMF dataflow is queried with a URL of the shape:

```
GET https://dataservices.imf.org/REST/SDMX_3.0/data/{DATAFLOW}/{KEY}?startPeriod=YYYY&endPeriod=YYYY
```

The `{KEY}` is a dot-delimited tuple of dimension-code values in the
**fixed dimension order** declared by the dataflow's Data Structure
Definition (DSD). Wildcards are allowed per-position by leaving the
slot empty (`..`).

**Example (WEO — annual frequency, Germany real-GDP growth, 2020→2029):**

```
GET /data/WEO/A.DEU.NGDP_RPCH?startPeriod=2020&endPeriod=2029
```

The key decodes as:
- Position 1 = `FREQ` dimension → `A` (annual)
- Position 2 = `REF_AREA` dimension → `DEU` (ISO 3166-1 alpha-3)
- Position 3 = `INDICATOR` dimension → `NGDP_RPCH` (real GDP growth %)

---

## 2. Canonical dimension order (per database family)

| Database | Key positions | Example |
|----------|---------------|---------|
| `WEO` | FREQ . REF_AREA . INDICATOR | `A.DEU.NGDP_RPCH` |
| `FM` | FREQ . REF_AREA . INDICATOR | `A.DEU.GGXWDG_NGDP` |
| `IFS` | FREQ . REF_AREA . INDICATOR | `M.DE.FPOLM_PA` |
| `BOP_AGG` | FREQ . REF_AREA . INDICATOR | `Q.EU.BFD_BP6_USD` |
| `DOT` | FREQ . REF_AREA . COUNTERPART_AREA . INDICATOR | `A.DEU.CHN.TXG_FOB_USD` |
| `CDIS` | FREQ . REF_AREA . COUNTERPART_AREA . SECTOR . INDICATOR | `A.DEU.USA.S1.IAD_BP6_USD` |
| `CPIS` | FREQ . REF_AREA . COUNTERPART_AREA . INSTR . INDICATOR | `A.DEU.USA.F3.IAD_BP6_USD` |
| `ER` | FREQ . REF_AREA . INDICATOR | `D.DE.ENDA_XDC_USD_RATE` |
| `PCPS` | FREQ . INDICATOR | `M.PCOPP_USD` |
| `GFSR` | FREQ . REF_AREA . INDICATOR . SECTOR | `A.DEU.FA_LE_F3_T_XDC.S1` |
| `FSI` | FREQ . REF_AREA . INDICATOR | `Q.DE.NPLR_PT` |
| `GFS` | FREQ . REF_AREA . SECTOR . UNIT . INDICATOR | `A.DE.S13.XDC.GRE` |

See [`../../analysis/imf/sdmx-dimensions-reference.md`](../../analysis/imf/sdmx-dimensions-reference.md)
for the complete list and per-dimension codelists.

---

## 3. Canonical `FREQ` codelist

| Code | Meaning |
|:----:|---------|
| `A` | Annual |
| `Q` | Quarterly |
| `M` | Monthly |
| `W` | Weekly |
| `D` | Daily |
| `B` | Business (workdays) |
| `S` | Semi-annual |
| `H` | Hourly |

`A` is used by WEO/FM/GFSR/CDIS/CPIS (forecast databases). `Q` is the
natural frequency for BOP/GFS/FSI. `M` is used by IFS monetary series,
CPI, and ER. `D` is used by ER for daily exchange rates and by PCPS
for daily commodity prices.

---

## 4. Canonical `REF_AREA` codelist (subset)

IMF accepts both ISO 3166-1 alpha-2 and alpha-3 codes **depending on
the database** (a notable inconsistency — always verify via
`imf-get-parameter-codes` when uncertain):

| Scope | Accepted codes | Database families that use them |
|-------|----------------|---------------------------------|
| Member states | `DEU`, `FRA`, `ITA`, `ESP`, `POL`, … (alpha-3) | WEO, FM, GFSR, CDIS, CPIS, DOT |
| Member states | `DE`, `FR`, `IT`, `ES`, `PL`, … (alpha-2) | IFS, ER, FSI, GFS |
| Eurozone aggregate | `EA` (alpha-2) / `U2` (legacy) | IFS, ER, BOP_AGG |
| European Union aggregate | `EU` | WEO, BOP_AGG |
| G7 aggregate | `G7` | WEO |
| G20 aggregate | `G20` | WEO |
| World | `WORLD` / `001` / `W` | WEO, PCPS |

**Always use the IMF aggregates above for EU-level analysis** — the
World Bank `EUU`/`EMU` aggregates are rejected by the WB MCP client
(see the `worldbank-mcp country codes` memory).

---

## 5. Vintage identifiers

IMF vintages are tied to **flagship publications**, not calendar
dates. The canonical WEO vintages are:

| Vintage ID | Typical release window |
|------------|------------------------|
| `WEO-April-YYYY` | First half of April |
| `WEO-October-YYYY` | First half of October |
| `WEO-Update-January-YYYY` | Late January (interim) |
| `WEO-Update-July-YYYY` | Mid-July (interim) |

`FM` (Fiscal Monitor) ships April + October vintages twinned with WEO.
`GFSR` (Global Financial Stability Report) ships April + October.
`EREO` (External Risks and Early-warning Observatory) ships April.
`IFS`/`BOP`/`GFS`/`FSI` are monthly/quarterly databases updated on a
rolling basis without a vintage concept — use
`retrievedAt` (fetch timestamp) as the vintage surrogate.

See [`../../analysis/imf/release-calendar.md`](../../analysis/imf/release-calendar.md)
for the rolling 18-month vintage calendar.

---

## 6. SDMX error-code reference

Errors returned by the IMF REST endpoint are SDMX standard codes:

| HTTP | SDMX | Meaning | Recovery |
|:----:|:----:|---------|----------|
| 404 | 100 | No data available for that key | Check key shape + dimension order |
| 404 | 110 | Dataflow not found | Verify dataflow ID via `imf-list-databases` |
| 400 | 130 | Invalid query parameter | Check `startPeriod`/`endPeriod` format |
| 403 | 150 | Rate limit | Retry with exponential backoff; default client uses 500ms + jitter |
| 500 | 500 | Internal error | One retry then fall back to prior-run cache |
| 503 | 503 | Service unavailable | Honour `Retry-After`; fall back to prior-run cache on repeat |

`src/mcp/imf-mcp-client.ts` maps all these to a structured
`MCPToolResult` envelope with `isError=true` and the SDMX code in
`content[0].text` — never throws.

---

## 7. Client-side memoisation rules

To avoid unnecessary round-trips, agents SHOULD:

1. Call `imf-list-databases` at most once per workflow run.
2. Call `imf-get-parameter-defs` at most once per dataflow per run.
3. Call `imf-get-parameter-codes` at most once per (dataflow, dimension) per run.
4. Cache results in `analysis/daily/<date>/<run>/data/imf/discovery/`.
5. Never re-call discovery endpoints on Stage-C or Stage-D (article stage).

The `scripts/mcp/ep-mcp-client.js` wrapper does not currently persist
discovery caches between runs — this is a Wave-5 enhancement target.

---

## 8. Validation hooks

The runtime fingerprint tables (`IMF_STRONG_FINGERPRINTS`,
`IMF_INDICATOR_CODES`) previously lived in
`src/utils/content-validator.ts` and were drift-guarded by
`test/unit/content-validator-imf.test.js`. Both were removed in the
April-2026 aggregator-pipeline purge. The canonical fingerprint /
indicator-code catalog is now
[`../../analysis/imf/indicator-catalog.md`](../../analysis/imf/indicator-catalog.md),
and enforcement is editorial (Stage-C completeness review).

---

## 9. References

- [`imf-data-integration.md`](imf-data-integration.md) — high-level "when and how"
- [`../../analysis/imf/`](../../analysis/imf/) — machine-readable reference set
- [`../../analysis/methodologies/imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md) — per-article-type floors
- IMF SDMX 3.0 standard: https://sdmx.org/?page_id=5008
