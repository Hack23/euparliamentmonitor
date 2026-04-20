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

The TypeScript map is `IMF_EU_COUNTRY_CODES` in
[`src/utils/imf-data.ts`](../../src/utils/imf-data.ts). The codes match
the ISO-3 standard and are identical to the World Bank map for the
EU-27. Use `getIMFCountryCode('DE')` → `'DEU'` in code.

---

## 2. EU and Euro Area Aggregates

| IMF code | Label | Notes |
|:---:|---|---|
| `EU` | European Union | Current membership (post-Brexit, 27 members) |
| `EA` | Euro Area | Current membership; historical membership NOT backfilled |
| `EA19` | Euro Area (19 members) | Legacy code; deprecated after Croatia joined |

The `IMF_AGGREGATE_LABELS` constant in `src/utils/imf-data.ts` holds the
labels used by the article/HTML templates.

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

IMF and World Bank generally share ISO-3 codes. Known drifts — kept in
`IMF_COUNTRY_CODE_OVERRIDES` in `src/utils/imf-data.ts`:

| ISO α-2 | IMF | World Bank | Notes |
|:---:|:---:|:---:|---|
| XK | `UVK` | `XKX` | Kosovo; IMF uses `UVK` on some legacy datasets. |

Add entries here (and in the TypeScript map) as additional drifts are
discovered.

---

## 5. Usage Pattern

```ts
import { getIMFCountryCode, isIMFEUMemberState } from '../utils/imf-data.js';

const code = getIMFCountryCode('DE'); // → 'DEU'
const ok = isIMFEUMemberState('DE'); // → true
```

When calling `imf-fetch-data`, pass the ISO-3 code through the `country`
filter:

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
