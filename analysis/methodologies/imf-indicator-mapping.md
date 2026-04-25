# IMF Indicator → Article Type Mapping

**Purpose**: Canonical reference that maps European Parliament Monitor
article types to the most-relevant IMF indicators sourced from WEO,
Fiscal Monitor, IFS, BOP, ER, PCPS, GFSR, EREO, FSI, GFS, DOT via the
native TypeScript IMF SDMX 3.0 REST client in
[`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)
(base URL `https://dataservices.imf.org/REST/SDMX_3.0/`).

**Scope**: The **sole authoritative source** for all economic context —
macro / fiscal / trade / monetary / exchange-rate / debt / FDI / banking
— under the **Wave-4 policy (April 2026)**. Social / health / education /
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

**Enforcement (Wave-4, April 2026)**: IMF is the required primary
source for every economic claim in policy-required articles. The legacy
runtime validator gate (`articlePolicyHasEconomicContext` OR-gate +
`articlePolicyHasIMFEconomicEvidence` strict helper, dark-launched
behind the `WAVE3_IMF_STRICT` feature flag) lived in
`src/utils/content-validator.ts` and the surrounding
`src/utils/validate-articles.ts` CLI; both were **purged in the
April-2026 aggregator-pipeline migration**. Enforcement is now editorial
at Stage-C completeness review of the markdown analysis artifacts — see
[`.github/prompts/04-article-generation.md §5`](../../.github/prompts/04-article-generation.md).
The fingerprint surface (product names, tool identifiers, SDMX indicator
codes) that the Wave-3 helpers consumed survives in
[`../imf/indicator-catalog.md §6`](../imf/indicator-catalog.md#6-fingerprint-convention)
as the editorial fingerprint list.

**Wave history**: see §10 Migration Plan.

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

These per-type indicator floors are enforced at Stage-C completeness
gate by editorial review of `analysis/daily/<run>/intelligence/economic-context.md`
— the agent counts distinct SDMX indicator codes cited against the
article-type's floor. The legacy runtime constant
`IMF_PER_ARTICLE_INDICATOR_FLOORS` in `src/utils/imf-data.ts` was
purged in the April-2026 aggregator-pipeline migration.

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

## 4. Stage-C Editorial Fingerprints

The fingerprint surface that Stage-C reviewers use to confirm "IMF is
cited" in an article is:

| Fingerprint class | Canonical source |
|---|---|
| IMF product names (`IMF`, `WEO`, `Fiscal Monitor`, `International Monetary Fund`, `data.imf.org`, `dataservices.imf.org`) | [`../imf/indicator-catalog.md §6`](../imf/indicator-catalog.md#6-fingerprint-convention) |
| Virtual tool names (`imf-list-databases`, `imf-search-databases`, `imf-get-parameter-defs`, `imf-get-parameter-codes`, `imf-fetch-data`) | `IMF_MCP_TOOLS` in [`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts) (drift-guarded by `test/integration/mcp/imf-mcp.test.js`) |
| SDMX indicator codes | Section 1 of this document + [`../imf/indicator-catalog.md §2`](../imf/indicator-catalog.md#2-policy-domain--imf-indicator-mapping) |
| World Bank equivalents (for non-economic domains) | [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md) |

Stage-C confirms the article contains ≥ 1 IMF product name **and** ≥ 1
SDMX indicator code matching the per-article-type floor in §2.

> The earlier runtime helpers (`hasIMFEvidence`, `hasWorldBankEvidence`,
> `articlePolicyHasWorldBank`, `articlePolicyHasEconomicContext`,
> `articlePolicyHasIMFEconomicEvidence`, plus the
> `IMF_STRONG_FINGERPRINTS` / `IMF_INDICATOR_CODES` /
> `WORLD_BANK_STRONG_FINGERPRINTS` / `WORLD_BANK_INDICATOR_CODES`
> tables) lived in `src/utils/content-validator.ts` and were purged in
> the April-2026 aggregator-pipeline migration. The Stage-C editorial
> review replaces them in full.

---

## 5. Forecast Labelling Rule

Articles citing an IMF forecast MUST:

1. **Forecast marker** (Stage-C editorial check): include at least one
   of the following within 30 words of the number —

    ```regex
    /\b(forecast|forecasts|forecasted|projection|projections|projected|IMF\s+projects?|IMF\s+expects?|expected\s+to\s+(reach|rise|fall|grow|shrink|contract|expand))\b/i
    ```

2. **Vintage citation**: cite the vintage inline (`WEO April 2026`,
   `Fiscal Monitor April 2026`) **and** set
   `data-vintage="WEO-April-2026"` on the enclosing
   `<section class="economic-context imf-economic-context">` block,
   if that wrapper is authored explicitly in
   `intelligence/economic-context.md`; otherwise set it on the
   artifact's top-level section element.

3. **Optimism-bias acknowledgement**: for horizons ≥3 years, include
   one sentence sized per the MAE bands in
   [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md).

All three rules are enforced at Stage-C completeness review of the
markdown artifact. The legacy Wave-2 regex helper
(`validateIMFForecastMarker`) and the Wave-3 metadata helper
(`validateIMFVintageMetadata`) in `src/utils/imf-data.ts` were purged
in the April-2026 aggregator-pipeline migration.

---

## 6. Country Code Conventions

IMF uses ISO-3166-1 alpha-3 codes for every EU member state (same as
World Bank). Aggregates: `EU` (27 members), `EA` (current Euro Area),
`G7`, `G20`. See [`../imf/eu-country-mapping.md`](../imf/eu-country-mapping.md).

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

The aggregator (`src/aggregator/**`) strips YAML front-matter, so
`data-vintage="…"` MUST be emitted in the Markdown body as explicit
HTML on the rendered container in `intelligence/economic-context.md`
(for example, the `<section>` shown above). Stage-C review confirms
its presence for any article matching the forecast-marker regex in
§5.

> The earlier `buildIMFEconomicContextHTML()` utility and the
> `validateIMFVintageMetadata(html)` check in `src/utils/imf-data.ts`
> / `src/utils/content-validator.ts` were purged in the April-2026
> aggregator-pipeline migration. The editorial requirement is unchanged.

---

## 8. Per-Article-Type Indicator Minimums

The editorial floors applied at Stage-C completeness review:

| Article type | Floor | Committee overrides |
|---|:---:|---|
| `committee-reports` | 3 | ECON ≥ 4, BUDG ≥ 3, INTA ≥ 3, AFET/SEDE ≥ 2 |
| `week-ahead` | 2 | — |
| `month-ahead` | 2 | — |
| `weekly-review` / `week-in-review` | 1 | — |
| `monthly-review` / `month-in-review` | 2 | — |
| `breaking` | 1 | — |
| `motions` | 1 | — |
| `propositions` | 1 | — |

Committee-specific overrides (ECON ≥ 4, BUDG ≥ 3, INTA ≥ 3) are
applied at Stage-C completeness gate based on the committee tag in
the manifest. The legacy runtime constant
`IMF_PER_ARTICLE_INDICATOR_FLOORS` in `src/utils/imf-data.ts` was
purged in the April-2026 aggregator-pipeline migration.

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

| Wave | Status | Enforcement | WB-for-economic policy |
|:----:|--------|-------------|-----------------------|
| 2 | ✅ shipped | Runtime `articlePolicyHasEconomicContext` OR-gate | Retained as secondary; WB economic indicators satisfied the gate |
| 3 | ✅ shipped | Same OR-gate + dark-launched `articlePolicyHasIMFEconomicEvidence` behind `WAVE3_IMF_STRICT` flag | IMF **primary** for economic; WB accepted but diagnostic flagged when used |
| 4 | ✅ **current** | **Editorial** at Stage-C review over markdown artifacts; all runtime helpers purged in April-2026 aggregator-pipeline migration | IMF **required** for economic; WB for economic blocked at Stage C |

**What changed at Wave-4**: the aggregator-pipeline migration removed
`src/utils/validate-articles.ts`, `src/utils/content-validator.ts`,
`src/utils/imf-data.ts`, and the wrapper generators. The `src/aggregator/**`
pipeline renders `analysis/daily/<run>/**` markdown artifacts as-is, so
there is no HTML-authoring hook left for runtime validation. The editorial
rules survived — they are checked during Stage-C completeness review and
blocked at PR-creation time by the agentic-workflow reviewer.

**Historical note (Wave-3 → Wave-4 transition)**: the Wave-3 dark-launch
collected two weeks of diagnostic signals showing that every scheduled
news run already cited IMF for policy-required articles. Wave-4 promoted
the policy from dark-launched helper to editorial default in April-2026
when the surrounding validator layer was removed.

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
