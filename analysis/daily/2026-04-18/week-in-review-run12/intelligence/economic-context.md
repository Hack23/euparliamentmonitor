---
title: "📈 Economic Context — Member-State Macro Data for Q1 2026 Dossiers (Run 12)"
date: 2026-04-18
articleType: week-in-review
runId: 12
reviewPeriod: "2026-04-11 to 2026-04-18"
framework: "Worldbank-indicator-mapping per methodology catalogue"
countries: ["DE", "FR", "IT", "PL", "NL"]
confidence: HIGH
frameworks: [WorldBankIndicatorMapping]
---

# 📈 Economic Context — Member-State Macro Profile for Q1 2026 Dossiers (Run 12)

![Framework](https://img.shields.io/badge/Framework-WB_Indicator_Mapping-blue?style=flat-square)
![Countries](https://img.shields.io/badge/Countries-DE_FR_IT_PL_NL-green?style=flat-square)
![Data](https://img.shields.io/badge/Source-World_Bank_Open_Data-brightgreen?style=flat-square)

> **Purpose**: Establish the macro-economic context for the five member states most
> consequential in the Q1 2026 dossier portfolio — Germany, France, Italy, Poland,
> the Netherlands. Economic context is essential for reading political signals: a
> Bundesrat BRRD3 opposition hearing against a backdrop of two consecutive years of
> German contraction means something different from the same signal during a growth
> period. Data drawn from World Bank Open Data indicators and cross-referenced with
> Eurostat where WB MCP coverage is thin. Per `manifest.json` §worldBankDE and
> §worldBankIT, the Run 12 manifest already carries validated DE/IT 2023-24 GDP
> growth data.

---

## Economic Snapshot Matrix (Most Recent World Bank Data)

| Indicator | Germany | France | Italy | Poland | Netherlands | EU-27 Avg |
|-----------|:-------:|:------:|:-----:|:------:|:-----------:|:---------:|
| GDP nominal 2024 (USD $bn) | 4,526 | 3,048 | 2,380 | 862 | 1,218 | — |
| GDP growth 2023 (%) | **−0.87** | 0.7 | 1.0 | 0.1 | 0.1 | 0.4 |
| GDP growth 2024 (%) | **−0.50** | 1.1 | **0.69** | 2.9 | 0.9 | 0.8 |
| GDP growth 2025 (est., %) | 0.4 | 1.2 | 0.8 | 3.2 | 1.4 | 1.2 |
| Inflation 2024 (% HICP) | 2.5 | 2.3 | 1.0 | 3.6 | 2.8 | 2.4 |
| Unemployment 2024 (%) | 3.4 | 7.3 | 6.5 | 2.9 | 3.7 | 6.0 |
| Public debt / GDP (%) | 63 | 112 | 135 | 50 | 48 | ~85 |
| Budget balance (% GDP) | −2.5 | −5.5 | −4.4 | −5.7 | −0.4 | −3.1 |
| Banking sector assets / GDP | ~250% | ~320% | ~220% | ~100% | ~410% | ~280% |

*Sources: World Bank Open Data (NY.GDP.MKTP.CD, NY.GDP.MKTP.KD.ZG, FP.CPI.TOTL.ZG,
SL.UEM.TOTL.ZS); Eurostat cross-reference for debt and banking-sector-size ratios.
Germany 2023 and 2024 GDP-growth figures are the MCP-validated values in
`manifest.json` §worldBankDE. Italy 2024 figure (0.69%) is the MCP-validated value
in `manifest.json` §worldBankIT.*

---

## 🇩🇪 Germany — The Decisive Banking-Union-Risk State

### Macro posture

- **Two consecutive GDP contractions** (−0.87% 2023; −0.50% 2024) — the longest
  German recession since 2002–2003. World Bank NY.GDP.MKTP.KD.ZG.
- **Weak 2025 recovery** projected at ~0.4% — third consecutive year of sub-trend
  growth.
- **Automotive sector exposure to US tariffs** (T+0 April 14): BMW, Mercedes, VW
  collectively ~4% of German GDP; Section-301-adjacent sectors total ~7% of GDP.
- **Fiscal consolidation pressure** from 2023 Bundesverfassungsgericht ruling
  constrains fiscal-space for banking-sector support or emergency-measures fund.
- **Inflation at 2.5%** (HICP) — roughly at ECB target, giving ECB April 17
  meeting limited pressure to act for Germany specifically.

### Banking sector characteristics

- **Sparkassen network**: ~40% of German retail banking deposits; structurally
  networked to Länder governments via municipal-ownership.
- **Volksbanken / Raiffeisenbanken cooperative sector**: ~20% of retail banking;
  vocal opposition to BRRD3 bail-in-able-liability requirements.
- **Major commercial banks** (Deutsche Bank, Commerzbank, DZ Bank): ~25% of retail
  banking; already SSM-supervised; less opposed to BRRD3.
- **Banking-sector-assets/GDP ratio ~250%** — substantially leveraged; susceptibility
  to systemic stress.

### Political-economic coupling

Weak GDP + fiscal consolidation + politically-networked Sparkassen + automotive
tariff exposure = maximum structural incentive for BRRD3 transposition delay. The
Merz CDU/CSU coalition inherits banking-lobby relationships from years in
opposition. **This is the clearest and best-evidenced political-economic coupling
in the Run 12 dataset.** See `threat-model.md` §T1 and `stakeholder-map.md` §4, §7.

**Confidence**: 🟢 HIGH.

---

## 🇫🇷 France — Moderate Banking Exposure, High Trade Exposure

### Macro posture

- **GDP growth 2024 (1.1%)** — above German, below EU average; 2025 recovery to
  ~1.2%.
- **Automotive + aerospace + pharmaceutical** exposure to US tariffs materially
  significant: Airbus supply-chain, luxury-automobile exports, vaccine manufacturing.
- **Public debt / GDP at 112%** — one of highest in EU — constrains fiscal-space
  for crisis response.
- **Cohabitation context** (fragile National Assembly) limits Élysée's domestic
  political capital for EP-level positioning.
- **Unemployment 7.3%** — structurally elevated; limits fiscal-consolidation
  maneuvering room.

### Banking sector characteristics

- **Big-four commercial banks** (BNP Paribas, Crédit Agricole, Société Générale,
  BPCE) dominate (~70% of retail deposits).
- Already substantially SSM-supervised; BRRD3 adds marginal cost rather than
  structural cost.
- Significantly **less politically mobilised** than German Sparkassen equivalent.
- Banking-sector-assets / GDP ~320% — high but concentrated in well-supervised
  institutions.

### Political-economic coupling

Moderate banking-sector friction; stronger trade-policy pull. French government's
April 28 priority is **trade-response positioning**, not Banking Union. France is a
**stabilising factor** on BRRD3 transposition (low defection risk from French MEPs
in EPP / Renew). On trade, France is pro-countermeasure-activation given exposure.

---

## 🇮🇹 Italy — Cooperative-Banking Sensitivity, Trade Exposure Secondary

### Macro posture

- **GDP growth 2024 (0.69%)** (MCP-validated value in `manifest.json` §worldBankIT)
  — modestly positive; fragile recovery.
- **Public debt / GDP at 135%** — highest large-economy ratio in EU.
- **Manufacturing exposure** to US: second-highest in EU after Germany.
- **Meloni government** maintains fiscal-discipline commitment but with ongoing
  tension on budget-deficit limits; EU-Commission Excessive Deficit Procedure
  horizon.
- **Inflation at 1.0%** (HICP) — lowest in EU-27 large economies; disinflation
  surprise.

### Banking sector characteristics

- **Banche Popolari + Banche di Credito Cooperativo (BCC)** networks: cooperative-
  banking sector with political resonance similar to German Sparkassen, smaller
  share (~25% of retail deposits vs German ~40%).
- **Two large commercial banks** (Intesa Sanpaolo, UniCredit) dominate SSM-
  supervised tier.
- **BCC coalition** with Federcasse apex body plays direct lobbying role analogous
  to DSGV role in Germany — see `threat-model.md` §T1 Diamond Model (BCC is the
  second adversary leg).

### Political-economic coupling

**Secondary BRRD3 transposition risk** — Italian cooperative-banking sector could
amplify German pressure but will not initiate opposition. Italy's primary April 28
interest is trade policy (via ECR / FdI delegation) and critical-minerals
supply-chain assurance.

---

## 🇵🇱 Poland — Growth Outlier, Banking-Union Low-Risk, Anti-Corruption High-Interest

### Macro posture

- **GDP growth 2024 (2.9%)** — **best large-economy performer in EU** (World Bank).
- **2025 projection (3.2%)** continues outperformance.
- **Unemployment 2.9%** — below EU average; tight labour market.
- **Public debt / GDP 50%** — among healthiest in EU.
- **Inflation 3.6%** — above EU average, reflecting labour-market tightness.

### Banking sector characteristics

- **Mostly commercial-bank dominated** (PKO BP, Pekao, mBank, ING Poland, Santander
  Poland, Millennium, BNP Paribas Bank Polska); limited cooperative-banking
  political resonance.
- Banking sector profitable — low stress-testing concerns.
- **Limited political opposition** to Banking Union strengthening.
- Banking-sector-assets / GDP ~100% — comparatively modest.

### Political-economic coupling

Poland is **not a BRRD3 transposition-risk country**. Its April 28 positioning is
dominated by:

1. **Anti-Corruption Directive transposition** as political utility (Tusk government
   rule-of-law rebuilding).
2. **ECR delegation positioning on trade** (PiS influence) — divergent from Tusk
   government line.

**Implication**: Polish political signal April 28 is primarily Anti-Corruption-
related, not Banking Union-related.

---

## 🇳🇱 Netherlands — High-Banking-Sector Exposure but Pro-Strictness

### Macro posture

- **GDP growth 2024 (0.9%)** — modest; 2025 expected recovery to 1.4%.
- **Unemployment 3.7%** — low.
- **Public debt / GDP 48%** — healthiest among EU-5 largest-economies.
- **Budget balance −0.4%** — close to balanced — rare in Eurozone.
- **Banking-sector-assets / GDP ~410%** — highest in our dataset; reflects
  outsized banking-financial-services specialisation (ING, ABN AMRO, Rabobank).

### Banking sector characteristics

- **Three large commercial banks** (ING, ABN AMRO, Rabobank) dominate — all
  SSM-supervised.
- Dutch banking lobby is **pro-strict BRRD3 implementation** (competitive advantage
  from rigorous supervision; structural beneficiary of single-market passporting).
- Cooperative sector (Rabobank historic, now commercial) does not mirror
  German/Italian political resonance.

### Political-economic coupling

Netherlands is a **transposition-strictness ally** — government and banking sector
jointly push for on-time BRRD3 implementation. On housing, however, Dutch government
is **sceptical of binding EU-level regulation** given Dutch housing-market political
sensitivity and preference for national-level discretion. On trade, Dutch default
posture is de-escalation given export-dependent economy.

---

## Economic-Political Risk Coupling Matrix

| Country | Economic Stress Level | BRRD3 Transposition Risk | Housing-Regulation Posture | Trade-Vote Positioning | Aggregate Q2 Impact |
|---------|:---------------------:|:-------------------------:|:--------------------------:|:---------------------:|:-------------------:|
| Germany | 🔴 HIGH | 🔴 HIGH | Against-binding | Conditional | 🔴 HIGH |
| France | 🟡 MEDIUM | 🟢 LOW | Moderate-pro | Pro-countermeasure | 🟠 MEDIUM-HIGH |
| Italy | 🟠 MEDIUM-HIGH | 🟡 MEDIUM | Neutral | Pro-industry | 🟠 MEDIUM-HIGH |
| Poland | 🟢 LOW | 🟢 LOW | Neutral | Split (PiS vs KO) | 🟡 MEDIUM (via AC) |
| Netherlands | 🟢 LOW | 🟢 LOW (pro-strict) | Against-binding | De-escalation-preferred | 🟡 MEDIUM |

**Aggregate interpretation**: Germany is the decisive economic-political variable
for the Q2 2026 Banking Union transposition risk vector. France, Italy, and the
Netherlands are moderating forces on banking. Poland is non-material for banking but
central for Anti-Corruption. On housing, Germany + Netherlands form a **structural
anti-binding-regulation bloc**, requiring S&D to secure alternative member-state
support (Italy neutral, France moderate-pro). See `scenario-forecast.md` §Scenario 2.

---

## Indicator Watch During Recess (April 21–27)

These indicators provide early-warning of economic-political shifts:

| Country | Indicator | Frequency | Trigger threshold |
|---------|-----------|-----------|-------------------|
| DE | DAX closing level | Daily | >3% drop in single session |
| DE | Bund-Bobl spread | Daily | Widening >15bp |
| DE | Ifo business-confidence index | Monthly (April release) | Decline >2 points |
| FR | CAC40 closing level | Daily | >3% drop in single session |
| FR | OAT 10-year yield | Daily | >10bp move |
| IT | FTSE-MIB closing level | Daily | >3% drop in single session |
| IT | BTP-Bund spread | Daily | Widening beyond 180bp |
| PL | WIG20 closing level | Daily | >3% drop in single session |
| PL | Zloty-EUR exchange rate | Daily | Move beyond 4.35 |
| NL | AEX closing level | Daily | >3% drop in single session |
| All | Euribor 3m | Daily | Move >5bp day |

Any **simultaneous trigger in 3+ countries** compounds Scenario-3-equivalent
probability estimates in `scenario-forecast.md`.

---

## Data Age and Confidence Notes

- **World Bank GDP data** typically has a 6-month-plus lag for official-annual
  indicators. The 2024 figures are most-recent confirmed; 2025 figures are
  estimates.
- **Germany 2023/2024 and Italy 2024 values** are MCP-validated per `manifest.json`
  §worldBankDE / §worldBankIT — confidence: 🟢 HIGH.
- **Banking-sector-assets / GDP** ratios are Eurostat-sourced cross-references
  rather than live World Bank data — confidence: 🟡 MEDIUM-HIGH.
- **Market-level daily indicators** (DAX, CAC40, BTP spreads) are not collected
  via World Bank MCP; separate market-data source required for real-time
  monitoring.
- **Political-posture attributions** (pro-strict / pro-delay / etc.) reflect Run
  12 assessment per `stakeholder-map.md` — confidence: 🟡 MEDIUM.

---

## Coupling to Q1 Dossier Portfolio

| Q1 Dossier | Primary economic driver | Decisive country | Stress direction |
|------------|-------------------------|:----------------:|:----------------:|
| Banking Union trilogy (0090 / 0092 / 0093) | Bank-sector leverage + cooperative-sector lobbying | DE (IT secondary) | ⬇ transposition risk |
| Anti-Corruption Directive (0094) | Rule-of-law political utility | PL (primary), HU/SK (challenge) | ⬇ constitutional risk |
| Housing Initiative (0091) | Housing-affordability as voter salience | DE + NL anti-binding vs S&D pro-binding | ⬇ Commission response risk |
| EU Talent Pool (0095) | Labour-market tightness | PL (tight), DE (aging demography) | ⬇ implementation-fragmentation risk |
| US Countermeasures (0096) | Exporter-economy exposure | DE, FR, IT all exposed; NL de-escalation | ⬇ activation-timing decision |

---

*Framework: World Bank Indicator Mapping per `analysis/methodologies/worldbank-indicator-mapping.md`*
*Data sources: World Bank Open Data NY.GDP.MKTP.CD, NY.GDP.MKTP.KD.ZG, FP.CPI.TOTL.ZG, SL.UEM.TOTL.ZS; Eurostat cross-reference for banking-sector-size and debt ratios; `manifest.json` §worldBankDE, §worldBankIT for MCP-validated DE/IT GDP-growth values*
*Cross-references: `threat-model.md` §T1 (Germany + Italy adversary cluster); `stakeholder-map.md` §4, §10–13 (member-state positions); `scenario-forecast.md` §Scenario 2 (housing stalemate coalition arithmetic)*
*Analysis generated: April 18, 2026 | Run 12 | Week-in-review workflow | Reference-quality retrofit*
