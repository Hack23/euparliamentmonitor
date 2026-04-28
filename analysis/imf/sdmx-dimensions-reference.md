<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🧬 IMF SDMX 3.0 Dimensions Reference — EU Parliament Monitor

> **Purpose**: Canonical reference for the SDMX 3.0 dimensions that
> appear across IMF dataflows, with codelist conventions, example
> values, and notes on how each dimension is handled by the native
> TypeScript client (`src/mcp/imf-mcp-client.ts`).

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 4

> SDMX (Statistical Data and Metadata eXchange) is an ISO standard for
> exchanging statistical data. The IMF REST surface is SDMX 3.0 (v2.1
> message schema); queries are expressed as a key (slash-separated
> dimension values) against a dataflow. This document explains each
> dimension from the EP editorial perspective — for the authoritative
> spec see [sdmx.org](https://sdmx.org/).

---

## 1. Dimensions Glossary

| Dimension | Appears on | Required? | Example values | EP handling |
|-----------|------------|:---------:|----------------|-------------|
| `FREQ` | All | ✅ | `A` / `Q` / `M` | Encoded as first path segment after dataflow ID |
| `REF_AREA` | All | ✅ | `DEU`, `FRA`, `EU`, `EA` | ISO-3 country or IMF aggregate — see `eu-country-mapping.md` |
| `INDICATOR` | WEO, FM, IFS, FSI, PCPS, SRF | ✅ | `NGDP_RPCH`, `GGXWDG_NGDP` | Canonical SDMX code; see `indicator-catalog.md §2` |
| `COUNTERPART_AREA` | BOP, DOT, CDIS, CPIS | ✅ | `W00` (World), `USA`, `CHN` | Bilateral partner for flow data |
| `UNIT_MEASURE` | All | optional | `USD`, `EUR`, `PT` (percent), `IX` (index) | Stored on observation but rarely filtered |
| `OBS_STATUS` | All (observation-level) | — | `A`, `F`, `E`, `B`, `P` | See `indicator-catalog.md §4` |
| `SCALE` | All (observation-level) | — | `0`, `3`, `6`, `9` | Power-of-10 multiplier for the observation value |
| `METHODOLOGY` | GFS, BOP | optional | `GFSM2014`, `BPM6` | Methodological-vintage tag |
| `TIME_PERIOD` | All | ✅ (in query range) | `2026`, `2026-Q1`, `2026-03` | Emitted as `startPeriod` / `endPeriod` query params |
| `TRANSFORMATION` | WEO forecasts | optional | `LEVEL`, `PCH`, `Y2Y` | Some indicators are distributed in both level and change form |
| `ECONOMY_REF` | IFS | optional | `D` (domestic), `F` (foreign) | Monetary-statistics context |
| `SECTOR` | FSI, GFS | optional | `S1` (total economy), `S11` (non-financial corps) | ESA 2010 sector codes |

---

## 2. Dimension ordering in the SDMX key

The SDMX key is a **slash-separated concatenation** of dimension
values in the order defined by the dataflow's
`datastructure`. The TypeScript client's `imf-fetch-data` builds this
automatically from the `filters` map; agents should supply filters by
name, not by position.

Example for WEO:

```
GET /data/WEO/A.DEU.NGDP_RPCH?startPeriod=2020&endPeriod=2028
         │ │    │
         │ │    └── INDICATOR
         │ └──────── REF_AREA
         └────────── FREQ
```

Example for BOP:

```
GET /data/BOP_AGG/Q.DEU.W00.BFD_BP6_USD?startPeriod=2024
                 │ │    │    │
                 │ │    │    └── INDICATOR
                 │ │    └──────── COUNTERPART_AREA (W00 = World)
                 │ └────────── REF_AREA
                 └──────────── FREQ
```

Wildcard segments are legal: `A..NGDP_RPCH` means "all countries, WEO
GDP growth". The client forbids this for data-fetch calls (keep the
request scoped) but `imf-search-databases` / `imf-get-parameter-codes`
may use wildcards freely.

---

## 3. Codelist discovery

Each dimension's valid values come from an SDMX **codelist** referenced
by the data-structure definition. The client exposes codelists via
`imf-get-parameter-codes(db, dimension, search?)`:

```ts
// Fetch the list of valid INDICATOR codes for WEO
await client.getParameterCodes('WEO', 'INDICATOR');

// Search within the codelist
await client.getParameterCodes('WEO', 'INDICATOR', 'inflation');
```

The search is a simple substring match against `code_description`; the
client does not perform fuzzy matching.

---

## 4. REF_AREA conventions

- **Countries**: ISO-3 (`DEU`, `FRA`, `ITA`) for every EU-27 member.
- **EU aggregates**: `EU` (27 members, current), `EA` (Euro Area,
  current membership), `EFTA` (4 members), `SM` (single market — EU +
  EFTA).
- **Global aggregates**: `WLD` (World), `G7`, `G20`, `ADV`
  (advanced economies), `EMDE` (emerging/developing).

**EA membership drift**: Croatia joined the Euro Area on 2023-01-01.
WEO `EA` timeseries use the **current** membership throughout history
— there is no automatic back-splicing. Articles covering pre-2023
timeseries MUST cite "EA current membership" in the chart caption.

For EP-level framing (where WB aggregate codes `EUU`/`EMU` are
rejected), always use IMF `EU` or `EA`.

---

## 5. TIME_PERIOD formats

| Frequency (`FREQ`) | TIME_PERIOD format | Example |
|:------:|---------------------|---------|
| `A` | `YYYY` | `2026` |
| `S` | `YYYY-S1` / `YYYY-S2` | `2026-S1` |
| `Q` | `YYYY-Q1..4` | `2026-Q2` |
| `M` | `YYYY-MM` | `2026-03` |
| `D` (rare) | `YYYY-MM-DD` | `2026-04-24` |

The client accepts numeric `startYear` / `endYear` integers and
converts them per the frequency. For sub-annual series the query is
expanded to the full year range.

---

## 6. Observation attributes (beyond `OBS_STATUS`)

| Attribute | Meaning | EP handling |
|-----------|---------|-------------|
| `OBS_CONF` | Confidentiality (C = confidential, F = free) | Only `F` observations are ingested; `C` is filtered by the parser |
| `TIME_FORMAT` | ISO-8601 time precision of the observation | Informational; not surfaced to articles |
| `COMMENT` | Free-text annotation from the source | Captured in the manifest when present |
| `OBS_PRE_BREAK` | Value before a structural break | Cited in prose when a `B` status is encountered |
| `UNIT_MULT` | Power-of-10 multiplier | Applied by the parser during normalisation |

---

## 7. Editorial dimensions (Stage-C review)

 editorial review requires that every IMF citation in a
policy-required article carries:

1. `INDICATOR` code (word-bounded SDMX code from
   [`indicator-catalog.md §2`](indicator-catalog.md#2-policy-domain--imf-indicator-mapping)).
2. `REF_AREA` either as an ISO-3 country, `EU`/`EA`, or a named EU
   member state in prose.
3. Vintage string when `OBS_STATUS` is `F` (forecast) — e.g.
   `IMF WEO April 2026` in prose **and** `data-vintage="WEO-April-2026"`
   on the enclosing `<section class="economic-context imf-economic-context">`.
4. `FREQ` is inferred from the cadence and is not gated.

Missing `REF_AREA` context (e.g. "inflation is 3.2%" with no country
or aggregate) fails Stage-C review per
[`.github/prompts/04-article-generation.md §5`](../../.github/prompts/04-article-generation.md).

---

## 8. Client API surface (for reference)

| Method | Dimensions involved | Returns |
|--------|---------------------|---------|
| `listDatabases` | — | `MCPToolResult<DataflowSummary[]>` |
| `searchDatabases(keyword)` | dataflow names & descriptions | `MCPToolResult<DataflowSummary[]>` |
| `getParameterDefs(databaseId)` | all dimensions for a dataflow | `MCPToolResult<DataStructureDefinition>` |
| `getParameterCodes(db, dim, search?)` | codelist for one dimension | `MCPToolResult<Codelist>` |
| `fetchData({ databaseId, startYear, endYear, filters })` | all dimensions + `TIME_PERIOD` | `MCPToolResult<TimeSeries[]>` |

---

## 9. See also

- [`database-directory.md`](database-directory.md) — full database list
- [`indicator-catalog.md`](indicator-catalog.md) — SDMX indicator codes
- [`eu-country-mapping.md`](eu-country-mapping.md) — REF_AREA values
- [`release-calendar.md`](release-calendar.md) — vintage timing
- [SDMX 3.0 specification (ISO 17369:2013)](https://sdmx.org/?page_id=5008)
