<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📅 IMF Release Calendar — EU Parliament Monitor

> **Purpose**: Rolling 18-month calendar of IMF flagship vintages
> (WEO, FM, GFSR, EREO, IFS, CPI, BOP) with EP editorial triggers
> i.e. which article types must refresh their economic-context block
> within 14 days of each release.

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 3

> Dates below are indicative — IMF occasionally shifts by 1–2 weeks.
> The authoritative source is
> [imf.org/en/Publications/SPROLLs/calendar](https://www.imf.org/en/Publications/SPROLLs/calendar).
> Agents and workflow schedulers MUST NOT hard-code these dates
> always query the live calendar and use this file as an editorial
> relevance map.

---

## 1. Flagship Vintages — Rolling 18-Month Window

| Vintage | Typical window | Cadence | Forecast horizon | EP editorial trigger |
|---------|---------------|:-------:|:----------------:|----------------------|
| **WEO April 2026** | Mid-April 2026 | S | Current + 5y | ✅ published — all ECON/BUDG/AFET articles use this as default vintage from 2026-04-15 |
| **FM April 2026** | Mid-April 2026 (same week as WEO) | S | Current + 5y | ✅ published — BUDG debt/deficit context |
| **GFSR April 2026** | Mid-April 2026 | S | — | ✅ published — ECON financial-stability callouts |
| **EREO (Europe) May 2026** | Mid-May 2026 | S | Current + 3y | ⏳ upcoming — Europe-specific narrative refresh; ECON/AFET `month-in-review` May 2026 MUST cite |
| **GFSM / FM October 2026** | Mid-October 2026 | S | Current + 5y | ⏳ scheduled — BUDG Q4 2026 refresh |
| **WEO October 2026** | Mid-October 2026 | S | Current + 5y | ⏳ scheduled — autumn forecast refresh |
| **GFSR October 2026** | Mid-October 2026 | S | — | ⏳ scheduled |
| **EREO November 2026** | Mid-November 2026 | S | +3y | ⏳ scheduled |
| **WEO April 2027** | Mid-April 2027 | S | Current + 5y | ⏳ scheduled |
| **FM April 2027** | Mid-April 2027 | S | +5y | ⏳ scheduled |

---

## 2. High-Frequency Series — Monthly / Quarterly Cadence

| Database | Cadence | Typical lag | EP editorial trigger |
|----------|:-------:|:-----------:|----------------------|
| `IFS` (monetary + quarterly growth) | M | 4–8 weeks (Q) | `news-breaking` inflation/rate moves; weekly-review delta |
| `CPI` (consumer price index) | M | 4–6 weeks | `news-breaking` EU-27 inflation prints |
| `ER` (REER / NEER) | M | ~2 weeks | Monthly ECON FX competitiveness section |
| `PCPS` (commodity prices) | M | ~2 weeks | ITRE / ENVI / AGRI commodity-price context |
| `BOP_AGG` | Q | ~10–13 weeks | INTA trade-balance + FDI quarterly |
| `DOT` (Direction of Trade) | M (+Q summary) | ~6 weeks | INTA bilateral-flow updates |
| `FSI` | Q | ~10 weeks | ECON banking-soundness callouts |

---

## 3. Editorial-Trigger Matrix

Each vintage/release should trigger a refresh of the articles below
within the stated SLA. Agents running a scheduled workflow check the
vintage embedded in the article's `data-vintage` attribute and flag a
refresh if the vintage is older than the current live vintage.

| Vintage / release | Articles that MUST refresh | SLA |
|-------------------|---------------------------|:----:|
| WEO spring or fall | `news-week-ahead`, `news-month-ahead`, `news-monthly-review`, `committee-reports` (ECON/BUDG/AFET/INTA) | 14 days |
| FM spring or fall | `committee-reports` (BUDG), `news-monthly-review` | 14 days |
| GFSR | `committee-reports` (ECON), `news-weekly-review` if systemic-risk content | 7 days |
| EREO (Europe) | `news-monthly-review`, `committee-reports` (ECON/AFET) | 14 days |
| Monthly CPI | `news-breaking` (inflation print), `news-weekly-review` | 48 hours |
| Monthly IFS rate / money | `news-breaking` (rate move) | 48 hours |
| Quarterly BOP / FSI | `committee-reports` (ECON/INTA), `news-monthly-review` | 14 days |

---

## 4. Embargo & Provenance Rules

- **Embargo**: IMF flagship vintages are under embargo until the
  public launch press briefing (typically ~09:00 ET). Workflows MUST
  NOT fetch before the embargo lifts; the native client returns HTTP
  404 for embargoed endpoints and the retry logic treats this as a
  hard stop (no backoff loop).
- **Provenance attribution**: articles citing an IMF flagship MUST
  quote the vintage in prose (e.g. "IMF *World Economic Outlook*,
  April 2026") AND embed `data-vintage="WEO-April-2026"` on the
  economic-context section.
- **Vintage drift**: when an article is re-generated for a later date
  but the underlying analysis artifacts were produced under a prior
  vintage, the article's vintage string SHOULD reflect the **analysis
  vintage**, not the generation date. The `imf-vintage-audit.md`
  optional artifact captures the delta when this applies.

---

## 5. Working with Pre-release Data

IMF publishes a "Country Data" preview for some WEO indicators a few
days before the full vintage. EP Parliament Monitor does not consume
the preview — articles published in the 48-hour window before a new
WEO vintage cite the **prior** vintage and are refreshed within 48
hours of the new vintage going live.

---

## 6. Machine-readable Vintage Discovery

Query the live vintage tag via the SDMX metadata endpoint:

```
GET /dataflow/IMF/WEO?references=all
```

The response's `<structure:Dataflow>` element carries
`version="April-2026"` (or equivalent) which the parser exposes as
`currentVintage` on the `DataflowSummary` object. Agents should use
this to auto-populate the `data-vintage` attribute rather than hard-
coding strings.

---

## 7. See also

- [`database-directory.md`](database-directory.md) — which databases exist
- [`forecast-accuracy-baseline.md`](forecast-accuracy-baseline.md) — how to size the optimism-bias acknowledgement
- [`../methodologies/imf-indicator-mapping.md §5. Forecast Labelling Rule`](../methodologies/imf-indicator-mapping.md) — mandatory labelling
