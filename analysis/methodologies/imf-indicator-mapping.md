<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# IMF Indicator → Article Type Mapping

**📋 Document Owner:** CEO | **📄 Version:** 1.1 | **📅 Last Updated:** 2026-04-25 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-31  
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public  
**🔗 Mirror file:** [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md) (non-economic domains — Wave-4 partition)  
**📥 Feeds artifact:** [`economic-context.md`](../templates/economic-context.md) (Stage B.6, [`strategic-extensions-methodology.md`](strategic-extensions-methodology.md) §Economic Context)  
**🛂 Wave-4 IMF-primary gate (April 2026):** A policy-required article passes the economic-context gate when **every** economic / fiscal / monetary / trade / FDI / exchange-rate / banking-soundness claim cites an IMF indicator from this mapping (with SDMX code + vintage prose + `data-vintage` HTML attribute + forecast marker within 30 words of any projected number). The Admiralty grade is A1/A2 for IMF WEO/FM actuals and B2 for IMF staff estimates. World Bank is **not an acceptable substitute** for any economic claim — it is reserved for non-economic domains only (see the mirror file). The legacy Wave-2 OR-gate ("WB **or** IMF satisfies the gate") is **retired** under Wave-4.

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

## 2. Policy Article Types — IMF Primary Source (Wave-4)

| Article type | Primary IMF indicators | Database | Min IMF indicators | Stakeholders |
|---|---|---|:---:|---|
| `committee-reports` (ECON) | `NGDP_RPCH`, `PCPIPCH`, `LUR`, `BCA_NGDPD`, `FPOLM_PA` | WEO + IFS + GFSR + FSI | ≥ 4 | ECB, Commission, MEPs |
| `committee-reports` (BUDG) | `GGXWDG_NGDP`, `GGXONLB_NGDP`, `GGSB_NPGDP` | FM + GFS | ≥ 3 | Member-state finance ministries, Commission |
| `committee-reports` (AFET / SEDE) | `NGDPD`, `BCA_NGDPD`, DOT bilateral | WEO + DOT + EREO | ≥ 2 | Defence ministries, Council |
| `committee-reports` (INTA) | `TX_RPCH`, `BFD_BP6_USD`, `EREER_IX` | WEO + BOP_AGG + DOT + ER | ≥ 3 | DG TRADE, member states |
| `week-ahead` | `NGDP_RPCH`, `PCPIPCH` (forecasts) | WEO | ≥ 2 | Editors, MEPs |
| `month-ahead` | `NGDP_RPCH`, `PCPIPCH`, `LUR`, `GGXWDG_NGDP` (forecasts) | WEO + FM | ≥ 2 | Editors, policy analysts |
| `breaking` | `PCPIPCH`, `LUR` (latest actual / Q1-Q2 proxy) | IFS / CPI | ≥ 1 | Editors |
| `week-in-review` | Period-over-period deltas for WEO + IFS | WEO + IFS + CPI | ≥ 1 | Analysts |
| `month-in-review` | Period-over-period deltas + monthly PCPS/ER | WEO + IFS + PCPS + ER | ≥ 2 | Analysts |
| `motions` | Macro backdrop for legislative risk-assessment SWOT | WEO | ≥ 1 | Analysts |
| `propositions` | As motions | WEO | ≥ 1 | Analysts |

These per-type indicator floors are enforced at Stage-C completeness
gate by editorial review of `analysis/daily/<run>/intelligence/economic-context.md`
— the agent counts distinct SDMX indicator codes cited against the
article-type's floor. The legacy runtime constant
`IMF_PER_ARTICLE_INDICATOR_FLOORS` in `src/utils/imf-data.ts` was
purged in the April-2026 aggregator-pipeline migration.

---

## 3. World Bank — non-economic domains only (Wave-4)

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

Stage-C confirms `intelligence/economic-context.md` contains ≥ 1 IMF product
name **and** enough distinct SDMX indicator codes to satisfy the
per-article-type floor in §2 / §8. The same IMF-backed facts may inform
`manifest.title` and `manifest.description`, but only when the artifact also
contains the EP policy bridge described in `economic-context.md` and
`Article-Generation.md`'s SEO metadata contract.

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
| 2 | 🗄️ historical | Runtime `articlePolicyHasEconomicContext` OR-gate (purged in April-2026 aggregator-pipeline migration) | Historical only — WB-for-economic is **retired** under Wave-4 and was never editorially endorsed for new articles |
| 3 | 🗄️ historical | Same OR-gate + dark-launched `articlePolicyHasIMFEconomicEvidence` behind `WAVE3_IMF_STRICT` flag (purged April-2026) | Transitional only — IMF promoted to primary; WB-for-economic flagged diagnostic; **retired** at Wave-4 |
| 4 | ✅ **current** | **Editorial** at Stage-C review over markdown artifacts; all runtime helpers purged in April-2026 aggregator-pipeline migration; `scripts/validate-analysis-completeness.js` rejects WB economic indicator codes (`NY.GDP.*`, `FP.CPI.*`, `SL.UEM.*`, …) and WB economic prose claims inside `intelligence/economic-context.md`; `scripts/lint-prompts.js` rejects "World Bank or IMF" / "IMF or World Bank" / "economic context (… World Bank …)" phrasing in workflow prompts | IMF **required** for every economic claim; **World Bank is never acceptable** for economic context (not primary, not secondary, not fallback) |

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

## 12. Worked vintage-selection scenarios

The vintage decision is the most error-prone part of IMF integration.
Below are six EP-domain scenarios showing how to pick the right vintage
for the article date.

### Scenario 12.1 — `weekly-review` published 2026-04-25

**Required**: WEO `NGDP_RPCH` real GDP growth EU/EA, `PCPI_PCH` headline
inflation, IFS `FPOLM_PA` ECB policy rate.

**Latest IMF vintages on 2026-04-25**:

| Series | Latest data | Latest forecast | Vintage tag |
|---|---|---|---|
| WEO 2026-04 | 2025 actual | 2026, 2027, 2028, 2029, 2030, 2031 | "WEO Apr 2026" |
| FM 2025-10 | 2024 actual | 2025-2030 | "FM Oct 2025" |
| IFS monthly | 2026-03 actual | n/a | "IFS Mar 2026" |
| BOP quarterly | 2025-Q4 | n/a | "BOP 2025-Q4" |

**Decision**: cite WEO Apr 2026 for growth/inflation forecasts; explicitly
distinguish 2025 *actual* from 2026 *projection*. IFS Mar 2026 for the
ECB policy rate sequence.

### Scenario 12.2 — `month-ahead` for May 2026 plenary

**Required**: forward-looking IMF projections to anchor the policy outlook.

**Decision**: WEO Apr 2026 forecasts dominate. Use **fan-chart language**
("IMF projects 1.4% real growth ± 0.4 pp"); do NOT present projections as
hard numbers. Cite the WEO database release date in `manifest.dataVintage[]`.

### Scenario 12.3 — `breaking` on ECON committee push for fiscal-rule reform

**Required**: Member-state fiscal headroom; gross debt; primary balance.

**Decision**: FM Oct 2025 vintages OK because Apr 2026 FM not yet
published (next FM release is October). Mention this constraint in the
data-source footer; cite both the IMF FM and Eurostat MIP scoreboard for
triangulation per §9.

### Scenario 12.4 — `committee-reports` on ECB independence

**Required**: ECB policy-rate path, monetary aggregates, REER.

**Decision**: IFS monthly is authoritative; WEO and FM lag. IFS Mar 2026
vintage acceptable. Cross-check vs ECB SDW because IMF mirrors ECB with a
1-week lag for euro-area policy-rate changes.

### Scenario 12.5 — `propositions` on EU enlargement (UKR, MDA, GEO)

**Required**: candidate-country macro context.

**Decision**: WEO Apr 2026 covers all three. Note that UKR data has a
`*` suffix in the WEO indicating staff estimates rather than national
authorities — this counts as Admiralty B2 (usually reliable, fairly
likely) rather than A2.

### Scenario 12.6 — `propositions` on common defence financing

**Required**: Defence expenditure + fiscal capacity per MS.

**Decision**: For defence-as-percent-of-GDP use WB (`MS.MIL.XPND.GD.ZS`,
SIPRI mirror) per Wave-4 split; for fiscal capacity use IMF FM
`G_XWDG_G01_GDP_PT` (general government gross debt). Combined view in
`economic-context.md` references both source files.

## 13. Anti-patterns (Stage-C editorial blocks)

| Anti-pattern | Why blocked | Correct approach |
|---|---|---|
| Citing IMF without vintage | Vintage is mandatory per §7 | "IMF WEO Apr 2026" |
| Mixing actual + projection without tagging | Misleads reader | Use "actual" vs "projection" labels |
| Citing WEO for monthly inflation | WEO is annual | Use IFS for monthly data |
| Single-year point comparison | Loses context | Show 5-year trend or 3-year forecast horizon |
| Stale FM data when newer publication exists | Outdated context | FM is semi-annual; check release calendar |
| Ignoring confidence band on forecasts | Treats forecasts as facts | Add "± X pp" or fan-chart language |
| `EUU` aggregate (WB code) used for IMF call | Incompatible code system | Use `EU` or `EA` IMF aggregates |
| Missing Admiralty grade on IMF citation | Stage-C tradecraft fail | Default A2 for IMF-source EU-27, B2 for staff estimates |
| Using deprecated WEO codes | Codes change between vintages | Use the SDMX 3.0 canonical codes (e.g. `NGDP_RPCH` not `NGDP_R`) |
| Ratio computed inline without sourcing | Reproducibility fail | Cite numerator + denominator IMF series separately |

## 14. MCP tool quick-reference

| Tool | Purpose | Key parameter |
|---|---|---|
| `imf-mcp/imf-fetch-data` | Generic SDMX REST | `dataflow=WEO\|FM\|IFS\|BOP\|ER\|PCPS`, `key=` |
| `imf-mcp/imf-list-dataflows` | Catalogue SDMX dataflows | n/a |
| `imf-mcp/imf-data-availability` | Vintage check | `dataflow`, `country` |
| `imf-mcp/imf-vintage` | Get current vintage label | `dataflow` |
| `imf-mcp/imf-mcp-probe` | Stage A health check | n/a |
| `worldbank-mcp/raw-rest` | Defence (SIPRI mirror), other non-economic | `indicator` |

Each tool call **must** record the SDMX dataflow, indicator key, vintage
year/release, country panel, and Admiralty grade in
`manifest.dataSources[]`.

---

## 15. See also

- [`../imf/README.md`](../imf/README.md) — directory overview
- [`../imf/database-directory.md`](../imf/database-directory.md) — all ~155 SDMX dataflows
- [`../imf/indicator-catalog.md`](../imf/indicator-catalog.md) — ~80 indicators by domain
- [`../imf/sdmx-dimensions-reference.md`](../imf/sdmx-dimensions-reference.md) — SDMX 3.0 dimensions
- [`../imf/release-calendar.md`](../imf/release-calendar.md) — vintage calendar
- [`../imf/forecast-accuracy-baseline.md`](../imf/forecast-accuracy-baseline.md) — optimism-bias bands
- [`../imf/cross-source-triangulation.md`](../imf/cross-source-triangulation.md) — cross-source checks
- [`../imf/chart-integration-guide.md`](../imf/chart-integration-guide.md) — Chart.js patterns
- [`worldbank-indicator-mapping.md`](worldbank-indicator-mapping.md) — non-economic WB scope
