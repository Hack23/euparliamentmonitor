# 🇪🇺 IMF Country & Aggregation Codelist — EU Parliament Monitor

> IMF-specific country and aggregate codes used by EU Parliament Monitor
> when calling `imf-fetch-data`. Complements `analysis/worldbank/eu-country-mapping.md`.

**📅 Last Updated:** 2026-04-20 | **🏷️ Classification:** Public

---

## 1. EU-27 Member States

| ISO 3166-1 α-2 | IMF code | Country |
|:---:|:---:|---|
| AT | AUT | Austria |
| BE | BEL | Belgium |
| BG | BGR | Bulgaria |
| HR | HRV | Croatia |
| CY | CYP | Cyprus |
| CZ | CZE | Czechia |
| DK | DNK | Denmark |
| EE | EST | Estonia |
| FI | FIN | Finland |
| FR | FRA | France |
| DE | DEU | Germany |
| GR | GRC | Greece |
| HU | HUN | Hungary |
| IE | IRL | Ireland |
| IT | ITA | Italy |
| LV | LVA | Latvia |
| LT | LTU | Lithuania |
| LU | LUX | Luxembourg |
| MT | MLT | Malta |
| NL | NLD | Netherlands |
| PL | POL | Poland |
| PT | PRT | Portugal |
| RO | ROU | Romania |
| SK | SVK | Slovakia |
| SI | SVN | Slovenia |
| ES | ESP | Spain |
| SE | SWE | Sweden |

The canonical ISO-3 → IMF country-code mapping for EU-27 is maintained
in this document (single source of truth). The codes match the ISO-3
standard and are identical to the World Bank map for the EU-27.

---

## 2. EU and Euro Area Aggregates

| IMF code | Label | Notes |
|:---:|---|---|
| `EU` | European Union | Current membership (post-Brexit, 27 members) |
| `EA` | Euro Area | Current membership; historical membership NOT backfilled |
| `EA19` | Euro Area (19 members) | Legacy code; deprecated after Croatia joined |

Labels (e.g. "European Union", "Euro Area") used in article prose and
chart captions are defined in this document; the article agent copies
them verbatim when constructing the `economic-context.md` artifact.

---

## 3. Comparison Groups

### G7 (non-EU)

| ISO | IMF code | Country |
|:---:|:---:|---|
| US | USA | United States |
| GB | GBR | United Kingdom |
| JP | JPN | Japan |
| CA | CAN | Canada |

### G20 (beyond G7 ∪ EU)

| ISO | IMF code | Country |
|:---:|:---:|---|
| AU | AUS | Australia |
| BR | BRA | Brazil |
| CN | CHN | China |
| IN | IND | India |
| ID | IDN | Indonesia |
| KR | KOR | Korea (Republic of) |
| MX | MEX | Mexico |
| RU | RUS | Russia |
| SA | SAU | Saudi Arabia |
| ZA | ZAF | South Africa |
| TR | TUR | Türkiye |
| AR | ARG | Argentina |

### EU Candidate / Accession

| ISO | IMF code | Country | Status |
|:---:|:---:|---|---|
| UA | UKR | Ukraine | Candidate |
| TR | TUR | Türkiye | Candidate (frozen) |
| RS | SRB | Serbia | Candidate |
| ME | MNE | Montenegro | Candidate |
| AL | ALB | Albania | Candidate |
| MK | MKD | North Macedonia | Candidate |
| MD | MDA | Moldova | Candidate |
| BA | BIH | Bosnia and Herzegovina | Candidate |
| GE | GEO | Georgia | Candidate |
| XK | UVK | Kosovo | Potential candidate (see § 4) |

### EEA / EFTA

| ISO | IMF code | Country |
|:---:|:---:|---|
| NO | NOR | Norway |
| CH | CHE | Switzerland |
| IS | ISL | Iceland |
| LI | LIE | Liechtenstein |

---

## 4. Codelist Drift vs World Bank

IMF and World Bank generally share ISO-3 codes. Known drifts:

| ISO α-2 | IMF | World Bank | Notes |
|:---:|:---:|:---:|---|
| XK | `UVK` | `XKX` | Kosovo; IMF uses `UVK` on some legacy datasets. |

Add entries here as additional drifts are discovered — the agent reads
this table directly at Stage A when resolving `REF_AREA` for any
article covering Kosovo or other non-ISO-3-clean codes. The earlier
`IMF_COUNTRY_CODE_OVERRIDES` TypeScript constant in
`src/utils/imf-data.ts` was purged in the April-2026 aggregator-pipeline
migration.

---

## 5. Usage Pattern

When calling the IMF SDMX 3.0 REST API via the native client
(`src/mcp/imf-mcp-client.ts`), pass the ISO-3 code through the `country`
filter on `fetchData()`:

```ts
await client.fetchData({
  databaseId: 'WEO',
  startYear: 2020,
  endYear: 2030,
  filters: {
    country: ['DEU', 'FRA', 'ITA', 'POL', 'SWE'],
    indicator: ['NGDP_RPCH'],
  },
});
```
