# IMF Indicator → Article Type Mapping

**Purpose**: Canonical reference that maps European Parliament Monitor
article types to the most-relevant IMF indicators sourced from WEO,
Fiscal Monitor, IFS, BOP, ER, PCPS, GFSR, EREO, FSI, GFS, DOT via the
native TypeScript IMF SDMX 3.0 REST client in
[`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)
(base URL `https://dataservices.imf.org/REST/SDMX_3.0/`).

**Scope**: The **sole authoritative source** for all economic context —
macro / fiscal / trade / monetary / exchange-rate / debt / FDI / banking
— under the **Wave-3 policy (April 2026)**. Social / health / education /
environment / defence / agriculture / innovation / governance indicators
remain on World Bank — see
[`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md).

**Cross-reference**: IMF is the exclusive source for any economic /
fiscal / monetary / trade metric because (a) IMF WEO publishes April +
October each year with full actuals + 5-year forecasts, (b) IMF
aggregate codes `EU`, `EA`, `G7`, `G20` are accepted by the IMF API
whereas the equivalent `EUU`, `EMU` are rejected by
`worldbank-mcp@1.0.1`, (c) IMF provides a single `"IMF, World Economic
Outlook, April 2026"` provenance line with no vintage patching, and (d)
IMF is the only source that ships multi-year forecasts at EU-member-
state granularity.

**Enforcement (Wave-3, April 2026)**: The CLI validator
(`src/utils/validate-articles.ts`) enforces
`articlePolicyHasEconomicContext` as the primary gate (IMF-OR-WB), with
`articlePolicyHasIMFEconomicEvidence` **dark-launched behind the
`WAVE3_IMF_STRICT` feature flag** for data-driven promotion. When the
flag flips (Wave-4, target ~2 weeks after 2026-04-24), the strict
helper requires **IMF** specifically for policy-required types — WB-only
articles will no longer satisfy the gate and MUST add at least one IMF
citation. `articlePolicyHasWorldBank` is retained in test-only scope
for legacy fixtures.

**Wave-3 → Wave-4 migration**: see §10 Migration Plan.

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

For the complete 80-indicator inventory across 10 EP policy domains,
including FSI banking soundness, GFS revenue structure, DOT bilateral
trade, and GFSR financial-stability metrics, see
[`../imf/indicator-catalog.md`](../imf/indicator-catalog.md). Full
database enumeration in
[`../imf/database-directory.md`](../imf/database-directory.md).

---

## 2. Policy Article Types — IMF Primary Source (Wave-3)

| Article type | Primary IMF indicators | Database | Min IMF indicators | Stakeholders |
|---|---|---|:---:|---|
| `committee-reports` (ECON) | `NGDP_RPCH`, `PCPIPCH`, `LUR`, `BCA_NGDPD`, `FPOLM_PA` | WEO + IFS + GFSR + FSI | ≥ 4 | ECB, Commission, MEPs |
| `committee-reports` (BUDG) | `GGXWDG_NGDP`, `GGXONLB_NGDP`, `GGSB_NPGDP` | FM + GFS | ≥ 3 | Member-state finance ministries, Commission |
| `committee-reports` (AFET / SEDE) | `NGDPD`, `BCA_NGDPD`, DOT bilateral | WEO + DOT + EREO | ≥ 2 | Defence ministries, Council |
| `committee-reports` (INTA) | `TX_RPCH`, `BFD_BP6_USD`, `EREER_IX` | WEO + BOP_AGG + DOT + ER | ≥ 3 | DG TRADE, member states |
| `news-week-ahead` | `NGDP_RPCH`, `PCPIPCH` (forecasts) | WEO | ≥ 2 | Editors, MEPs |
| `news-month-ahead` | `NGDP_RPCH`, `PCPIPCH`, `LUR`, `GGXWDG_NGDP` (forecasts) | WEO + FM | ≥ 2 | Editors, policy analysts |
| `news-breaking` | `PCPIPCH`, `LUR` (latest actual / Q1-Q2 proxy) | IFS / CPI | ≥ 1 | Editors |
| `news-weekly-review` | Period-over-period deltas for WEO + IFS | WEO + IFS + CPI | ≥ 1 | Analysts |
| `news-monthly-review` | Period-over-period deltas + monthly PCPS/ER | WEO + IFS + PCPS + ER | ≥ 2 | Analysts |
| `news-motions` | Macro backdrop for legislative risk-assessment SWOT | WEO | ≥ 1 | Analysts |
| `news-propositions` | As motions | WEO | ≥ 1 | Analysts |

These per-type indicator floors are exposed programmatically as
`IMF_PER_ARTICLE_INDICATOR_FLOORS` in `src/utils/imf-data.ts` and
checked during Stage-C completeness gate when `WAVE3_IMF_STRICT=true`.

---

## 3. World Bank — non-economic domains only (Wave-3)

IMF does **not** cover these domains — the World Bank remains the
authoritative source:

- Social: life expectancy, birth/death rates, internet users
- Health: physicians, hospital beds, immunisation, disease prevalence
- Education: enrolment, literacy, completion, teachers
- Environment: CO₂, renewable energy, air quality
- Innovation: R&D, high-tech exports, ICT imports
- Demographics: population structure, migration
- Defence: military expenditure (MS.MIL.XPND.GD.ZS — cross-reference
  with IMF general-government expenditure where needed)
- Agriculture: agricultural value added, arable land
- Governance: regulatory quality, rule of law, voice/accountability

Articles combining economic + non-economic context cite IMF first for
the economic claim and WB additively for the non-economic one — see
[`../imf/use-cases.md §5`](../imf/use-cases.md) for the canonical
citation pattern.

---

## 4. Validator Integration

Helpers in `src/utils/content-validator.ts`:

| Helper | Returns true when… | Status |
|---|---|---|
| `hasWorldBankEvidence(text)` | Text cites "World Bank", a WB tool, or a WB indicator code with clean word boundaries. | ✅ retained |
| `hasIMFEvidence(text)` | Text cites "IMF", "WEO", "Fiscal Monitor", an IMF MCP tool, or an IMF SDMX indicator code. | ✅ retained |
| `articlePolicyHasWorldBank(html, type)` | Article type is policy-required and `hasWorldBankEvidence` returns true. | 🟡 Wave-3 test-only (retained for legacy fixtures) |
| `articlePolicyHasEconomicContext(html, type)` | Policy-required and **either** WB or IMF evidence matches (OR-gate). | ✅ **primary enforced gate (Wave-2+3)** |
| `articlePolicyHasIMFEconomicEvidence(html, type)` | Policy-required and **IMF** evidence matches (strict). | 🔴 **Wave-3 dark-launch behind `WAVE3_IMF_STRICT` flag**; will be promoted at Wave-4 |

Canonical fingerprint lists:

- `IMF_STRONG_FINGERPRINTS` — products (`IMF`, `WEO`, `Fiscal Monitor`, `International Monetary Fund`, `data.imf.org`) + five MCP tools
- `IMF_INDICATOR_CODES` — SDMX codes from Section 1
- `WORLD_BANK_STRONG_FINGERPRINTS`, `WORLD_BANK_INDICATOR_CODES` — see `worldbank-indicator-mapping.md`

---

## 5. Forecast Labelling Rule

Articles citing an IMF forecast MUST:

1. **Forecast marker** (Wave-3 validator-enforced via regex): include
   at least one of the following within 30 words of the number:

    ```regex
    /\b(forecast|forecasts|forecasted|projection|projections|projected|IMF\s+projects?|IMF\s+expects?|expected\s+to\s+(reach|rise|fall|grow|shrink|contract|expand))\b/i
    ```

    This is enforced by `validateIMFForecastMarker()` in
    `src/utils/imf-data.ts` and emits a diagnostic warning when the
    strict flag is on.

2. **Vintage citation** (editorial): cite the vintage inline (`WEO
   April 2026`, `Fiscal Monitor April 2026`). The
   `data-vintage="WEO-April-2026"` HTML attribute on the
   `economic-context` section is additionally mandatory and is
   validated by `validateIMFVintageMetadata()`.

3. **Optimism-bias acknowledgement** (editorial): for horizons ≥3
   years, include one sentence sized per the MAE bands in
   [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md).

Wave-2 extended the validator to enforce rule 1 with a regex check;
Wave-3 promotes rule 2 to the HTML-attribute check; rule 3 remains
editorial until Wave-4.

---

## 6. Country Code Conventions

IMF uses ISO-3166-1 alpha-3 codes for every EU member state (same as
World Bank). Call `getIMFCountryCode('DE')` → `'DEU'`. Aggregates:
`EU` (27 members), `EA` (current Euro Area), `G7`, `G20`. See
[`../imf/eu-country-mapping.md`](../imf/eu-country-mapping.md).

**EA membership drift**: Croatia joined the Euro Area on 2023-01-01.
WEO `EA` timeseries use the **current** membership throughout history
— articles covering pre-2023 timeseries cite "EA current membership"
in the chart caption.

---

## 7. Vintage Tracking

Every article citing an IMF number MUST embed the vintage in HTML
metadata for auditability:

```html
<section class="economic-context imf-economic-context"
         data-vintage="WEO-April-2026">
  ...
</section>
```

The `buildIMFEconomicContextHTML()` utility in `src/utils/imf-data.ts`
emits this attribute automatically when the context is built with a
`vintage` argument. `validateIMFVintageMetadata(html)` asserts the
presence of a Wave-3-compliant vintage string for any article
matching the forecast marker regex.

---

## 8. Per-Article-Type Indicator Minimums

Exported as `IMF_PER_ARTICLE_INDICATOR_FLOORS` in
`src/utils/imf-data.ts`:

```ts
export const IMF_PER_ARTICLE_INDICATOR_FLOORS: Readonly<Record<string, number>> = {
  'committee-reports': 3,  // base floor; ECON/BUDG/INTA override higher
  'week-ahead': 2,
  'month-ahead': 2,
  'weekly-review': 1,
  'week-in-review': 1,
  'monthly-review': 2,
  'month-in-review': 2,
  'breaking': 1,
  'motions': 1,
  'propositions': 1,
};
```

Committee-specific overrides (ECON ≥ 4, BUDG ≥ 3, INTA ≥ 3) are
applied at Stage-C completeness gate based on the committee tag in
the manifest.

---

## 9. Triangulation Escalation (Tier-1 articles)

When an IMF claim sits in a **Tier-1 significance** article AND cites
a high-sensitivity indicator (real GDP growth, HICP inflation, gov
debt, ECB policy rate, current account), the article MUST cross-check
against ECB SDW / Eurostat / OECD — see
[`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md).

Log the triangulation outcome in
`manifest.crossSourceTriangulation[]`. A material delta (≥0.2 pp or
≥2% relative) requires a reconciliation sentence in prose.

---

## 10. Migration Plan (Wave-2 → Wave-3 → Wave-4)

| Wave | Status | Enforced gate | WB-for-economic policy |
|:----:|--------|---------------|-----------------------|
| 2 | ✅ shipped | `articlePolicyHasEconomicContext` (OR-gate) | Retained as secondary; WB economic indicators satisfy the gate |
| 3 | ✅ **current** | Same OR-gate + diagnostic reports per-article IMF/WB split | IMF **primary** for economic; WB accepted but diagnostic flags when used | 
| 4 | planned (~2 weeks of green Wave-3 diagnostics) | `articlePolicyHasIMFEconomicEvidence` (strict) | WB for economic: **rejected**; must add IMF citation |
| 5 | planned | Same | `articlePolicyHasWorldBank` removed from production code paths; retained in test-only fixtures |

**Wave-3 → Wave-4 promotion criteria**: two full weeks of daily
scheduled news runs where the `articlePolicyHasIMFEconomicEvidence`
diagnostic emits zero FAIL signals (i.e. every policy-required article
already cites IMF) trigger the flag flip.

**`articlePolicyHasWorldBank` deprecation timeline**:

- Wave-3 (now): JSDoc `@deprecated`; retained for test fixtures and
  diagnostic reporting.
- Wave-4: removed from `validate-articles.ts` call path.
- Wave-5: removed from `content-validator.ts` exported surface; tests
  migrated to `hasWorldBankEvidence` directly.

---

## 11. See also

- [`../imf/README.md`](../imf/README.md) — directory overview
- [`../imf/database-directory.md`](../imf/database-directory.md) — all ~155 SDMX dataflows
- [`../imf/indicator-catalog.md`](../imf/indicator-catalog.md) — ~80 indicators by domain
- [`../imf/sdmx-dimensions-reference.md`](../imf/sdmx-dimensions-reference.md) — SDMX 3.0 dimensions
- [`../imf/release-calendar.md`](../imf/release-calendar.md) — vintage calendar
- [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md) — optimism-bias bands
- [`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md) — cross-source checks
- [`../imf/chart-integration-guide.md`](../imf/chart-integration-guide.md) — Chart.js patterns
- [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md) — non-economic WB scope
