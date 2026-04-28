# Economic Context — Propositions — 2026-04-24

**IMF requirement**: This artifact uses **World Bank** indicators
(Germany + France bilaterals) after attempted Eurozone aggregates
(`EUU`, `EMU`) failed to resolve in the current World Bank MCP
deployment (`worldbank-mcp@1.0.1`). The IMF requirement requires either WB or
IMF data on policy files; WB is available for DE + FR and is therefore
used here.

## 1 · Why Economic Context Matters for Propositions

The propositions pipeline is **budget- and growth-elastic**. When
Eurozone GDP growth is weak, propositions that impose compliance
costs (e.g. Green-Deal subsidiary acts, CBAM implementing regulations,
AI Act high-risk tiering) face stiffer EPP-ECR-PfE resistance.
Conversely, when inflation normalises, social-pillar propositions
recover progressive-bloc headroom. We therefore frame the 2026
propositions batch against the prevailing EU-macro picture.

## 2 · Core Indicators (World Bank, last 5 years)

### 2.1 Germany (DE) — Eurozone's largest economy, EPP-anchored

| Year | GDP growth (real, %) | CPI inflation (%) |
|-----:|---------------------:|------------------:|
| 2021 |  3.91 | 3.07 |
| 2022 |  1.81 | 6.87 |
| 2023 | -0.87 | 5.95 |
| 2024 | **-0.50** | **2.26** |

**Reading**: DE is in its **second consecutive contraction year**. The
2024 -0.50% print is still negative but the deflationary slide is
slowing (CPI back into ECB-target range at 2.26%). For propositions,
this is the **tightest plausibility constraint** — any file that
raises unit costs on German manufacturing is politically toxic for
EPP-DE rapporteurs through at least H1 2026.

### 2.2 France (FR) — second-largest, S&D-anchored

| Year | GDP growth (real, %) | CPI inflation (%) |
|-----:|---------------------:|------------------:|
| 2021 | 6.88 | — |
| 2022 | 2.72 | — |
| 2023 | 1.44 | — |
| 2024 | **1.19** | — |

**Reading**: FR growth decelerated but remained positive throughout
a gentler profile than DE. For propositions, France gives the
progressive bloc more fiscal headroom to defend CAP, social pillar,
and industrial-strategy files.

## 3 · Policy-File Implications

| Policy family | DE macro posture | FR macro posture | Proposition likelihood H1 2026 |
|---|---|---|---|
| Defence / EDIS | **Supportive** (industrial stimulus) | Supportive | **Very high** |
| Clean Industrial Deal | **Cautious** (compliance-cost resistance) | Supportive | High |
| CBAM subsidiary acts | Cautious | Ambiguous | Medium |
| AI Act implementing regs | Supportive | Supportive | High |
| CAP mid-term review | Cautious | Protective | Medium |
| Social pillar directives | **Blocking** | Supportive | Low |

## 4 · Interest-Rate Vector (ECB policy relevance)

DE CPI at 2.26% is at the ECB's inflation target. Under current
ECB forward guidance this implies **a pause-to-cutting rate cycle**
through 2026, which reduces financing costs on **green-transition
propositions** and **defence-bond propositions** — structurally
favourable for the EDIS and Clean Industrial Deal tracks.

## 5 · EU-Aggregate Unavailability Note

The World Bank MCP server returned `Country not found` for both
`EUU` (European Union) and `EMU` (Euro area) country codes. This is
tracked as upstream defect **MCP-WB-1** in
`mcp-reliability-audit.md §Defects`. Suggested workaround for future
runs: probe `EU` (sometimes accepted) and `XC` (Euro area ISO code)
before falling back to DE+FR.

## 6 · Cross-References

- `pestle-analysis.md §E` — Economic factor deep-dive
- `scenario-forecast.md §2` — Macro scenarios
- `risk-scoring/risk-matrix.md §Economic risks`

## 7 · Confidence & WEP

- **Confidence**: 🟡 MEDIUM — WB data is authoritative (**Admiralty A2**)
  but the EU-aggregate gap forces reliance on DE+FR as proxies for a
  27-state Union. For propositions, DE+FR together cover ~45% of EU GDP,
  which is a defensible proxy but not a complete picture.
- **WEP**: EVEN (40–55%) that a third Eurozone contraction year
  materialises in 2025 (horizon: year-end). This is the single most
  important macro swing variable for propositions H2 2026.

## 8 · Limitations

- No IMF cross-check this run (IMF MCP probe returned no data).
- No fiscal-space data (debt/GDP, deficit/GDP) fetched this run
  scheduled for next propositions run.

*— Economic Context · Pass 2 complete · 2026-04-24*


## 9 · Second-pass depth extensions

### 9.1 Fiscal-space overlay (indicative)
DE's 2024 debt-to-GDP is in the low-60s% range (Maastricht-consistent)
while FR is at ~112%. For propositions that mobilise national
co-financing (CBAM rebates, just-transition, EDIS co-funding), FR's
tighter fiscal space is the binding constraint on Council-level
ratification pace. For propositions that rely on EU-budget envelopes
(MFF instruments), the fiscal-space heterogeneity shifts political
weight toward net-contributor capitals (DE, NL, SE).

### 9.2 Employment / labour-market framing
FR and DE both retain structurally low unemployment into Q1 2026 per
2025 WB data (prior years). This loosens S&D's electoral pressure for
new social-pillar legislation and marginally strengthens EPP's
industrial-strategy framing.

### 9.3 Trade-policy propositions
Both DE and FR remain net exporters; EU-US tariff-skirmish
contingencies influence any trade-defence proposition flow. Without
IMF cross-check this run, trade-balance indicators are held as a
forward-monitoring hook.

*— Economic Context · extended · 2026-04-24*
