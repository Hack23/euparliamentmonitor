# IMF Indicator → Article Type Mapping

**Purpose**: Canonical reference that maps European Parliament Monitor
article types to the most-relevant IMF indicators sourced from WEO,
Fiscal Monitor, IFS, BOP, ER, and PCPS via the native TypeScript IMF
SDMX 3.0 REST client in [`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)
(base URL `https://dataservices.imf.org/REST/SDMX_3.0/`).

**Scope**: Applies to the macro/fiscal/trade/monetary subset of policy
article types. Social / health / education / environment / innovation
indicators remain on World Bank — see
[`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md).

**Enforcement (current)**: `articlePolicyHasEconomicContext` is the
default gate in `src/utils/validate-articles.ts`. A policy-required
article satisfies the rule when **either** `hasWorldBankEvidence()` or
`hasIMFEvidence()` in `src/utils/content-validator.ts` matches — so IMF
citations alone are now sufficient to pass the strict validator.
`articlePolicyHasWorldBank` is retained as a legacy helper for the
non-breaking transition.

**Deferred (Wave 3 / 4)**: Wave 3 deprecates the WB macro subset after
two weeks of green Wave 2 runs; Wave 4 removes the WB macro path
entirely if Wave 3 holds — see the migration plan §5.

---

## 1. Indicator Codes (reference)

The IMF MCP tool `imf-fetch-data` expects the database ID + SDMX
indicator code in the `filters` map. Canonical EU-Parliament-relevant
codes:

### World Economic Outlook (annual + forecasts)

| Code | Description |
|---|---|
| `NGDPD` | GDP, current USD |
| `NGDP_RPCH` | Real GDP growth, annual % |
| `NGDPDPC` | GDP per capita, current USD |
| `PCPIPCH` | CPI inflation, annual % |
| `LUR` | Unemployment rate, % of labour force |
| `LP` | Population, millions |
| `BCA_NGDPD` | Current account balance, % of GDP |
| `TX_RPCH` | Export volume growth, annual % |

### Fiscal Monitor (annual + forecasts)

| Code | Description |
|---|---|
| `GGXWDG_NGDP` | General government gross debt, % of GDP |
| `GGXONLB_NGDP` | Primary balance, % of GDP |
| `GGSB_NPGDP` | Structural balance, % of potential GDP |

### International Financial Statistics

| Code | Description | Frequency |
|---|---|---|
| `FPOLM_PA` | Monetary policy rate | Monthly |

### Balance of Payments (`BOP_AGG`)

| Code | Description | Frequency |
|---|---|---|
| `BFD_BP6_USD` | FDI inflow, current USD | Quarterly |

### Exchange Rates

| Code | Description | Frequency |
|---|---|---|
| `EREER_IX` | Real effective exchange rate | Monthly |

---

## 2. Policy Article Types — IMF Primary Source

| Article type | Primary IMF indicators | Database | Stakeholders |
|---|---|---|---|
| `committee-reports` (ECON) | `NGDP_RPCH`, `PCPIPCH`, `LUR`, `BCA_NGDPD`, `FPOLM_PA` | WEO + IFS | ECB, Commission, MEPs |
| `committee-reports` (BUDG) | `GGXWDG_NGDP`, `GGXONLB_NGDP`, `GGSB_NPGDP` | FM | Member-state finance ministries, Commission |
| `committee-reports` (AFET / SEDE) | `NGDPD`, `BCA_NGDPD` | WEO | Defence ministries, Council |
| `committee-reports` (INTA) | `TX_RPCH`, `BFD_BP6_USD`, `EREER_IX` | WEO + BOP + ER | DG TRADE, member states |
| `news-week-ahead` | `NGDP_RPCH`, `PCPIPCH` (forecasts) | WEO | Editors, MEPs |
| `news-month-ahead` | `NGDP_RPCH`, `PCPIPCH`, `LUR`, `GGXWDG_NGDP` (forecasts) | WEO + FM | Editors, policy analysts |
| `news-breaking` | `PCPIPCH`, `LUR` (latest actual / Q1-Q2 proxy) | IFS / CPI | Editors |
| `news-weekly-review` / `news-monthly-review` | Period-over-period deltas for WEO + IFS | WEO + IFS | Analysts |

---

## 3. World Bank Fallback (unchanged from `worldbank-indicator-mapping.md`)

IMF does **not** cover these domains — retain World Bank as the
authoritative source:

- Social: life expectancy, birth/death rates, internet users
- Health: physicians, hospital beds, immunisation, disease
- Education: enrolment, literacy, completion, teachers
- Environment: CO₂, renewable energy
- Innovation: R&D, high-tech exports, ICT imports

---

## 4. Validator Integration

Both gates are available in `src/utils/content-validator.ts`:

| Helper | Returns true when… |
|---|---|
| `hasWorldBankEvidence(text)` | Text cites "World Bank", a WB tool, or a WB indicator code with clean word boundaries. |
| `hasIMFEvidence(text)` | Text cites "IMF", "WEO", "Fiscal Monitor", an IMF MCP tool, or an IMF SDMX indicator code. |
| `articlePolicyHasWorldBank(html, type)` | Article type is policy-required and `hasWorldBankEvidence` returns true. |
| `articlePolicyHasEconomicContext(html, type)` | Article type is policy-required and **either** `hasWorldBankEvidence` OR `hasIMFEvidence` returns true. (OR-gate; used once Wave 2 lands.) |

Canonical fingerprint lists:

- `IMF_STRONG_FINGERPRINTS` — products (`IMF`, `WEO`, `Fiscal Monitor`) + MCP tools
- `IMF_INDICATOR_CODES` — SDMX codes from Section 1
- `WORLD_BANK_STRONG_FINGERPRINTS`, `WORLD_BANK_INDICATOR_CODES` — see `worldbank-indicator-mapping.md`

---

## 5. Forecast Labelling Rule

Articles citing an IMF forecast MUST:

1. Include the word "forecast", "projection", "IMF projects",
   "projected", or "forecasts" adjacent to the number.
2. Cite the vintage (`WEO April 2026`, `Fiscal Monitor April 2026`).
3. For horizons ≥3 years: include one sentence acknowledging IMF's
   documented medium-term optimism bias.

Wave 2 will extend the validator to enforce rule 1 with a regex check;
rules 2 and 3 remain editorial.

---

## 6. Country Code Conventions

IMF uses ISO-3166-1 alpha-3 codes for every EU member state (same as
World Bank). Call `getIMFCountryCode('DE')` → `'DEU'`. Aggregates:
`EU` (27 members), `EA` (current Euro Area), `G7`, `G20`. See
[`../imf/eu-country-mapping.md`](../imf/eu-country-mapping.md).

---

## 7. Vintage Tracking

Every article citing an IMF number SHOULD embed the vintage in HTML
metadata for auditability:

```html
<section class="economic-context imf-economic-context"
         data-vintage="WEO-April-2026">
  ...
</section>
```

The `buildIMFEconomicContextHTML()` utility in `src/utils/imf-data.ts`
emits this attribute automatically when the context is built with a
`vintage` argument.
