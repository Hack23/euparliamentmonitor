# World Bank Indicator → Article Type Mapping

**Purpose**: Canonical reference that maps European Parliament Monitor article
types to the most-relevant **non-economic** World Bank Open Data indicators.
Every news workflow cites this file so the AI agent selects indicators
consistently and the validator's quality gate remains enforceable.

**⚡ Wave-2 scope (April 2026)**: World Bank is the source for **health,
education, social, environment, demographics, defence, agriculture,
innovation, and governance** indicators only. **All economic / monetary /
fiscal / trade context (GDP, inflation, unemployment, FDI, fiscal balance,
debt, monetary, exchange rates) is sourced from IMF** — see
[`imf-indicator-mapping.md`](imf-indicator-mapping.md) and
[`analysis/imf/`](../imf/). The legacy WB economic indicator codes listed in
§ 1 remain valid raw-REST identifiers (some pre-Wave-2 articles cite them
and remain green), but new articles **must** use the IMF counterpart.

**Retained WB domains**:

| Domain | Covered by WB | Primary MCP tool |
|---|---|---|
| Social / demographics | POPULATION, LIFE_EXPECTANCY, BIRTH_RATE, DEATH_RATE, migration, dependency ratios | `get-social-data` + raw-REST `SP.POP.*` |
| Health | Health expenditure, physicians, hospital beds, immunisation, disease prevalence | `get-health-data` |
| Education | Literacy, school enrolment, completion, teachers, education expenditure | `get-education-data` |
| Environment | CO₂ emissions, renewable energy, forest area, water stress | raw-REST `EN.*`, `EG.FEC.RNEW.ZS` |
| Defence | Military expenditure (% GDP), armed-forces personnel | raw-REST `MS.MIL.*` |
| Agriculture | Agriculture % GDP, cereal yield, arable land | raw-REST `AG.*`, `NV.AGR.TOTL.ZS` |
| Innovation | R&D expenditure, high-tech exports, internet users, patents | raw-REST `GB.XPD.RSDV.GD.ZS`, `IT.NET.USER.ZS` |
| Governance | Women in Parliament, gender parity, business environment | raw-REST `SG.*`, `IC.*` |

**Scope**: Applies to article types where EU legislation intersects with
measurable non-economic outcomes. Article types without a direct policy
nexus (e.g. `breaking` for institutional news) remain opt-in.

**Enforcement**: `src/utils/validate-articles.ts` calls
`articlePolicyHasEconomicContext` (the OR-gate — see
[`src/utils/content-validator.ts`](../../src/utils/content-validator.ts))
which accepts **either** WB OR IMF evidence. Pre-Wave-2 articles citing
only WB indicators remain green.

**Country-code guard**: `worldbank-mcp@1.0.1` rejects the aggregate codes
`EUU`, `EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF` and the informal `UK`
alias. Call `isMCPSupportedWBCountryCode()` from
`src/utils/world-bank-data.ts` before every MCP invocation. For EU-level
economic context use IMF `EU`/`EA` aggregates (accepted by the IMF API).

---

## 1. Indicator Codes (reference)

The MCP tool `get-economic-data` ⚠️ (deprecated for new articles — use IMF
`imf-fetch-data` instead) and siblings `get-social-data`,
`get-education-data`, `get-health-data` accept these stable codes:

| Code                    | Description                                    | Tool            |
| ----------------------- | ---------------------------------------------- | --------------- |
| `GDP`                   | Gross Domestic Product (current USD)           | economic        |
| `GDP_GROWTH`            | GDP growth rate (annual %)                     | economic        |
| `GDP_PER_CAPITA`        | GDP per capita (current USD)                   | economic        |
| `GNI`                   | Gross National Income (current USD)            | economic        |
| `GNI_PER_CAPITA`        | GNI per capita (current USD)                   | economic        |
| `EXPORTS_GDP`           | Exports of goods and services (% of GDP)       | economic        |
| `FDI_NET`               | FDI, net inflows (BoP, current USD)            | economic        |
| `INFLATION`             | Inflation, consumer prices (annual %)          | economic        |
| `UNEMPLOYMENT`          | Unemployment, total (% of labour force)        | economic        |
| `POPULATION`            | Total population                               | social          |
| `LIFE_EXPECTANCY`       | Life expectancy at birth (years)               | social          |
| `BIRTH_RATE`            | Crude birth rate (per 1,000 people)            | social          |
| `DEATH_RATE`            | Crude death rate (per 1,000 people)            | social          |
| `INTERNET_USERS`        | Individuals using the Internet (% of pop.)     | social          |
| `LITERACY_RATE`         | Adult literacy rate (%)                        | education       |
| `SCHOOL_ENROLLMENT`     | Primary enrolment (gross, %)                   | education       |
| `SCHOOL_COMPLETION`     | Primary completion rate (% of relevant age)    | education       |
| `TEACHERS_PRIMARY`      | Primary education teachers                     | education       |
| `EDUCATION_EXPENDITURE` | Government expenditure on education (% of GDP) | education       |
| `HEALTH_EXPENDITURE`    | Current health expenditure (% of GDP)          | health          |
| `PHYSICIANS`            | Physicians (per 1,000 people)                  | health          |
| `HOSPITAL_BEDS`         | Hospital beds (per 1,000 people)               | health          |
| `IMMUNIZATION`          | Measles immunisation rate (% of children)      | health          |
| `HIV_PREVALENCE`        | Prevalence of HIV, total (% pop. 15–49)        | health          |
| `MALNUTRITION`          | Prevalence of undernourishment (% of pop.)     | health          |
| `TUBERCULOSIS`          | Incidence of tuberculosis (per 100,000)        | health          |

## 2. Mandatory — policy article types

The validator **fails** when none of these indicators appears in the article
body or its analysis artifacts.

| Article type        | Primary indicators                                                | Typical stakeholders            |
| ------------------- | ----------------------------------------------------------------- | ------------------------------- |
| `committee-reports` | Committee-specific: EMPL→`UNEMPLOYMENT`, `EDUCATION_EXPENDITURE`; ECON→`GDP_GROWTH`, `INFLATION`, `FDI_NET`; ENVI→`HEALTH_EXPENDITURE`, `LIFE_EXPECTANCY`; LIBE→`INTERNET_USERS`, `LITERACY_RATE`; INTA→`EXPORTS_GDP`, `GDP` | Member states, sectoral lobbies |
| `propositions`      | `GDP_GROWTH`, `UNEMPLOYMENT`, `INFLATION` (baseline) + topic-specific indicators | Council, Commission, MEPs      |
| `motions`           | Same as `propositions`; emphasise distributional indicators: `GDP_PER_CAPITA`, `UNEMPLOYMENT` | Civil society, national parties |
| `month-ahead`       | `GDP_GROWTH`, `UNEMPLOYMENT`, `INFLATION`, `EXPORTS_GDP` for EU27 context | Institutional actors           |
| `weekly-review`     | At least one economic indicator per policy cluster discussed      | General public, researchers     |
| `monthly-review`    | Same as `weekly-review` plus `POPULATION`, `LIFE_EXPECTANCY` when relevant | Subscribers, press            |

## 3. Optional — situational inclusion

| Article type | When to include                                                    |
| ------------ | ------------------------------------------------------------------ |
| `breaking`   | Only when the breaking event has direct economic consequence (market-moving decision, sanctions, trade disruption) |
| `week-ahead` | When the week's agenda includes economic or social legislation     |

## 4. Committee → indicator quick-lookup

Used by the `news-committee-reports` workflow to pick defaults when the AI
hasn't specified indicators for each featured committee:

| Committee                                       | Indicators                                     |
| ----------------------------------------------- | ---------------------------------------------- |
| AFET (Foreign Affairs)                          | `GDP`, `EXPORTS_GDP`, `FDI_NET`                |
| AGRI (Agriculture & Rural Development)          | `GDP_PER_CAPITA`, `MALNUTRITION`               |
| BUDG (Budgets)                                  | `GDP`, `GDP_GROWTH`, `INFLATION`               |
| CONT (Budgetary Control)                        | `GDP`, `GDP_GROWTH`                            |
| CULT (Culture & Education)                      | `EDUCATION_EXPENDITURE`, `LITERACY_RATE`       |
| DEVE (Development)                              | `GNI_PER_CAPITA`, `MALNUTRITION`, `IMMUNIZATION` |
| DROI (Human Rights subcommittee)                | `LIFE_EXPECTANCY`, `LITERACY_RATE`             |
| ECON (Economic & Monetary Affairs)              | `GDP_GROWTH`, `INFLATION`, `UNEMPLOYMENT`, `FDI_NET` |
| EMPL (Employment & Social Affairs)              | `UNEMPLOYMENT`, `EDUCATION_EXPENDITURE`        |
| ENVI (Environment, Public Health & Food Safety) | `HEALTH_EXPENDITURE`, `LIFE_EXPECTANCY`, `PHYSICIANS` |
| FEMM (Women's Rights & Gender Equality)         | `LIFE_EXPECTANCY`, `SCHOOL_ENROLLMENT`         |
| IMCO (Internal Market & Consumer Protection)    | `GDP`, `EXPORTS_GDP`                           |
| INTA (International Trade)                      | `EXPORTS_GDP`, `GDP`, `FDI_NET`                |
| ITRE (Industry, Research & Energy)              | `GDP_GROWTH`, `INTERNET_USERS`                 |
| JURI (Legal Affairs)                            | `INTERNET_USERS`                               |
| LIBE (Civil Liberties, Justice & Home Affairs)  | `INTERNET_USERS`, `LITERACY_RATE`              |
| PECH (Fisheries)                                | `GDP_PER_CAPITA`                               |
| PETI (Petitions)                                | None (procedural committee)                    |
| REGI (Regional Development)                     | `GDP_PER_CAPITA`, `UNEMPLOYMENT`               |
| SEDE (Security & Defence subcommittee)          | `GDP`, `EXPORTS_GDP`                           |
| TAX3 (Tax rulings special committee)            | `GDP`, `FDI_NET`                               |
| TRAN (Transport & Tourism)                      | `GDP_GROWTH`, `INFLATION`                      |

## 5. Degradation policy

When `WB_MCP_OK=false` (see `scripts/wb-mcp-probe.sh`), workflows **must**:

1. Log the probe error in the analysis manifest (`wbMcpDegraded: true`).
2. Still satisfy the validator gate by including the phrase "World Bank"
   plus a note explaining the degradation in the article's
   *Data source* footer paragraph.
3. Use precomputed statistics (`analysis/precomputed-stats/**`) as fallback
   context — never fabricate figures.

## 6. Visualisation pattern

World Bank series MUST be rendered as a declarative Chart.js canvas using
the standard pattern emitted by `src/templates/section-builders.ts`:

```html
<canvas data-chart-config="{&quot;type&quot;:&quot;line&quot;, ... }"></canvas>
```

See `js/chart-init.js` for the hydration logic. Inline Canvas API scripts are
forbidden (violates CSP `script-src 'self'`).

---

**Maintained by**: Hack23 AB
**Version**: 1.0 (2026-04-17)
**Cross-references**:
- `.github/prompts/SHARED_PROMPT_PATTERNS.md` (World Bank Integration section)
- `.github/skills/ai-first-quality.md` (Quality Gates table)
- `src/utils/validate-articles.ts` (checkWorldBankEvidence)
- `scripts/wb-mcp-probe.sh` (connectivity probe)
