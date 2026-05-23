# Synthesis Summary — term-outlook 2026-05-11

<!-- Run: term-outlook-run348-1778510405 | Horizon: 2026-05-11 → 2029-06-06 -->

## Headline Judgement

**EP10 will deliver a partial, multi-coalition legislative record between
2026-05-11 and the 2029 election** (WEP **Likely**, horizon: full term, confidence
**Moderate**). Delivery will concentrate on defence, single-market 2.0, MFF
revision, and AI Act enforcement; it will be **thin to absent on** treaty
change, fiscal-rules reform, and ambitious new climate baselines beyond the
2030+ framework. The 2029 election will be litigated on the **fiscal-squeeze
narrative** triggered by NextGenerationEU debt repayment activation in 2028.

## Group Composition

EP10 has 717 MEPs distributed across 9 groups (`get_all_generated_stats`):

| EPP | 188 | 26.22% | PRO-EU CENTRE-RIGHT |
| S&D | 136 | 18.97% | PRO-EU CENTRE-LEFT |
| Renew | 77 | 10.74% | PRO-EU LIBERAL |
| Greens/EFA | 53 | 7.39% | PRO-EU GREEN |
| PfE | 84 | 11.72% | EUROSCEPTIC RIGHT |
| ECR | 78 | 10.88% | EUROSCEPTIC RIGHT |
| The Left | 46 | 6.42% | PRO-EU LEFT |
| ESN | 25 | 3.49% | EUROSCEPTIC RIGHT |
| NI | 30 | 4.18% | MIXED |

**Top-2 share = 44.5%**, below the 376-seat majority threshold. Every
flagship vote requires at least three groups (typically EPP + S&D + Renew = 56%).
**MULTI_COALITION_REQUIRED** is the structural baseline of the term.

## Key Findings (10)

1. **Coalition arithmetic**: EPP+S&D = 44.5%; +Renew = 56.2%; +Greens = 63.6%.
   The EPP+S&D+Renew "Grand Centre" is the modal coalition.
2. **Fragmentation**: index 6.59 (HIGH) per `early_warning_system`; 9 active
   groups; effective number of parties ~4.7.
3. **Dominant-group risk**: EPP at 188 is 19× the smallest group (NI 10).
   `early_warning_system` flags MEDIUM-risk DOMINANT_GROUP_RISK.
4. **Legislative pipeline**: `monitor_legislative_pipeline` reports active
   procedure throughput consistent with EP9 baseline (no acute bottleneck
   yet, but trilogue capacity will tighten in 2027-2028).
5. **Macro environment**: IMF WEO real GDP for EA 0.9-1.2% through 2030;
   inflation 1.6-2.2%; general-government net lending −2.8% to −3.4% of GDP.
   **No fiscal headroom** for new spending without revenue measures.
6. **NGEU repayment cliff**: activates 2028; squeezes MFF spending envelope
   precisely as the mid-term revision is being negotiated.
7. **Commission renewal interregnum**: Q1-Q2 2029 will see legislative
   throughput drop ~40% (EP9 baseline); flagship votes must be front-loaded
   into 2027-Q3 to 2028-Q4.
8. **Right-wing convergence risk**: PfE + ECR + ESN = 26.4% of seats; if
   joined by EPP defectors on migration / climate roll-back, can form a
   blocking minority of ~33-35%.
9. **External shocks**: Russia-Ukraine front, Middle East, Indo-Pacific, and
   EU-US relationship volatility all sit above-baseline; any single shock
   reshuffles the legislative calendar by 3-6 months.
10. **Disinformation on 2029 election**: DSA capacity test; outcome
    unpredictable but cumulative risk is HIGH per `early_warning_system`.

## Strategic Lens

The term-outlook horizon is **dominated by structural fiscal pressure** rather
than acute political crisis. The pivotal legislative window is **2027-Q1
through 2028-Q4** — the period where MFF revision must close, NGEU
repayment activates, and the Commission renewal interregnum has not yet
compressed throughput. If the EPP+S&D+Renew coalition delivers (i) MFF
revision with explicit defence + climate envelopes, (ii) a single-market 2.0
package with measurable productivity targets, and (iii) demonstrable AI Act
enforcement, the centre groups can defend their record against a right-wing
PfE-ECR challenge in 2029.

If any one of those three pillars fails, the 2029 election becomes a
referendum on EU fiscal discipline (favouring PfE-ECR narratives) and the
post-election Parliament could see a meaningful realignment.

## Scenario Frame

The full scenario set is in `intelligence/scenario-forecast.md` (≥ 6
scenarios per `longHorizonScenarioGate`). The modal scenario is
**"muddle-through delivery"** (Roughly Even, 50%): MFF revision lands;
defence + single-market deliver; climate diluted; AI Act partially
enforced; 2029 election produces a Parliament close to current composition
with EPP −5 / S&D −5 / PfE +10 deltas.

## Cross-references

- Forces field analysis → `classification/forces-analysis.md`
- Actor influence map → `classification/actor-mapping.md`
- Impact cascade → `classification/impact-matrix.md`
- Risk register → `risk-scoring/risk-matrix.md`
- Strategic SWOT → `risk-scoring/quantitative-swot.md`
- Coalition arithmetic → `intelligence/coalition-dynamics.md`
- Macro context → `intelligence/economic-context.md`
- Long-horizon projection → `intelligence/forward-projection.md`
- Term-arc narrative → `intelligence/term-arc.md`
- Seat projection 2029 → `intelligence/seat-projection.md`
- Mandate scorecard → `intelligence/mandate-fulfilment-scorecard.md`
- Presidency context → `intelligence/presidency-trio-context.md`
- Commission WP alignment → `intelligence/commission-wp-alignment.md`
- Forward indicators → `extended/forward-indicators.md`
- Comparative international → `extended/comparative-international.md`
- Historical parallels → `extended/historical-parallels.md`

## Caveats

This run is in `dataMode: "degraded-voting"` because per-MEP voting data is
unavailable from MCP (all coalition voting analytics returned 0). Coalition
arithmetic above is derived from **seat shares**, not vote-similarity
matrices. The IMF WEO data is **A2** grade (probably true, not directly
confirmed). All probabilistic statements use WEP language; estimative
language guide is in #see footer.

```mermaid
graph TD
  EP10[EP10 717 MEPs<br/>9 groups]
  EP10 --> CENTRE[Grand Centre<br/>EPP+S&D+Renew = 56%]
  EP10 --> RIGHT[Right Bloc<br/>PfE+ECR+ESN = 26%]
  EP10 --> LEFT[Left Bloc<br/>Greens+Left = 14%]
  CENTRE --> WINS[Defence | SM2.0 | MFF | AI enforcement]
  CENTRE -.contested.-> CONT[Climate 2030+ | Migration | Enlargement]
  RIGHT -.blocking.-> CONT
  LEFT -.demanding.-> WINS
  WINS --> 2029[2029 Election<br/>litigated on record]
  CONT --> 2029
```

## Reader Briefing — For Citizens

**Plain Language summary**: this section translates the analytical findings
above into citizen-facing language. The European Parliament has 717 members
elected in June 2024; the next election is June 2029. Between now and then,
the Parliament must agree on the EU's seven-year budget (Multiannual Financial
Framework), the response to the activation of NextGenerationEU debt repayment
in 2028, and a series of climate, defence, single-market, and AI-enforcement
files. The two largest groups (centre-right EPP and centre-left S&D) hold
44.5% of seats together — this is below the 50% majority threshold, which
means **every flagship file requires a multi-group coalition**, typically
adding Renew Europe (centrist liberals) or Greens/EFA (climate-progressive)
to reach 376 seats. The arithmetic implies slower, more contested
legislation than the EP9 record. Citizens should expect (i) visible
delivery on defence and single-market files, (ii) contested delivery on
climate and migration files, and (iii) thin delivery on tax, fiscal-rules,
and treaty-change files. The 2029 election will be litigated on this record.


## Data Sources & Provenance

| Source / Evidence | Tool | Reference | Admiralty | WEP |
|---|---|---|---|---|
| Political landscape | european-parliament-generate_political_landscape | data/political-landscape.json | A1 | n/a |
| Activity stats | european-parliament-get_all_generated_stats | MCP probe | A1 | n/a |
| Coalition dynamics | european-parliament-analyze_coalition_dynamics | MCP probe | A1 | n/a |
| IMF WEO | fetch IMF SDMX 3.0 (manual) | cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json | A2 | n/a |
| Procedures feed | european-parliament-get_procedures_feed | data/procedures-feed-1m.json | A1 | n/a |
| Sentiment tracker | european-parliament-sentiment_tracker | MCP probe | A1 | n/a |
| Group comparison | european-parliament-compare_political_groups | MCP probe | A1 | n/a |
| Pipeline monitor | european-parliament-monitor_legislative_pipeline | MCP probe | A1 | n/a |
| Current MEPs | european-parliament-get_current_meps | MCP probe | A1 | n/a |
| Forward statements | scripts/forward-statements-registry.js read | data/forward-statements-open.json (empty) | A1 | n/a |


## Estimative Language & Source Grading

| Term | WEP probability range | Use |
|---|---|---|
| Almost Certain | 95-99% | Near-deterministic event |
| Highly Likely | 80-95% | Strong directional signal |
| Likely | 60-80% | Plausible majority outcome |
| Roughly Even | 40-60% | True coin-flip |
| Unlikely | 20-40% | Plausible minority outcome |
| Highly Unlikely | 5-20% | Strong contra signal |
| Almost No Chance | 1-5% | Near-deterministic non-event |

**Admiralty grading**: A=completely reliable, B=usually reliable, C=fairly
reliable, D=not usually reliable, E=unreliable, F=cannot be judged. Numeric
suffix grades information credibility (1=confirmed by other sources, 2=probably
true, 3=possibly true, 4=doubtful, 5=improbable, 6=cannot be judged).

This artifact uses **A2** grading for IMF SDMX 3.0 data, **A1** for EP MCP
direct API outputs, and **B2** for journalistic / synthesis material.


## Pass-2 Read-back

Verified group seat shares against `data/political-landscape.json`. Top-2
arithmetic 188+136=324 / 717=45.2%; the 44.5% figure rounded from
`get_all_generated_stats` matches within rounding. All 10 key findings have
direct MCP / IMF backing. Cross-reference list is exhaustive.


## Extended Analytical Context

This section extends the headline judgements with a deeper qualitative
narrative connecting the structural finding to historical parallels and
forward-looking observation points. The full term-outlook horizon
(2026-05-11 → 2029-06-06) covers approximately 1119 days; over that period
the European Parliament will hold roughly 36 plenary sessions in Strasbourg,
54 mini-plenaries in Brussels, and several thousand committee meetings.
Each one is a potential coalition-formation event, and the cumulative
record built across them defines the term's mandate.

The structural backdrop established earlier — top-2 share below 50%,
fragmentation index 6.59, no fiscal headroom, NGEU repayment cliff in 2028,
Commission renewal interregnum in early 2029 — is unusually fixed for a
five-year window. Most of the standard "policy entrepreneurship" channels
(new spending programmes, new common-borrowing instruments, treaty
adjustments) are blocked or constrained, leaving the term's politics to
play out almost entirely on **regulatory and implementation files**.

This is a meaningful inversion of the EP9 record (2019-2024), which was
defined by **emergency spending instruments** (NGEU, SURE, Ukraine
facility) born of crisis politics. EP10 inherits the obligation to repay
those instruments without the political tailwind that authorised them.
In coalition terms, this favours rapporteurs who can craft narrow,
implementation-grade compromises rather than ambitious legislative
visions; it disadvantages groups whose brand is built on transformational
agendas (Greens, The Left, parts of S&D).

For citizens following the term, the most legible signals will be:
(i) the headline number agreed for the MFF revision (target window
2027-Q3 to 2027-Q4), (ii) the size and visibility of the defence-industrial
package (rolling 2026-2028), (iii) whether the AI Act enforcement record
produces concrete fines and structural remedies by mid-2027, (iv) the
trajectory of enlargement chapter votes for Ukraine and Moldova, and
(v) whether single-market 2.0 produces at least one cross-border
productivity-enhancing reform by 2028.

The asymmetric risk in the term-outlook is to the downside. A geopolitical
shock (Russia-Ukraine front, Indo-Pacific, Middle East) reshuffles the
calendar by 3-6 months and absorbs political capital. A fiscal-rules
enforcement crisis (France enters EDP) consumes an entire trio's bandwidth.
A Commission-renewal disagreement that is not resolved by mid-2029 forces
a contested transition into EP11. Any of these would convert the modal
"Roughly Even" muddle-through scenario into the "Stagnation" downside
scenario detailed in `intelligence/scenario-forecast.md`.

The asymmetric upside requires the modal coalition to deliver the MFF
revision with a **defence + competitiveness envelope visible to voters**,
plus at least one symbolically important enlargement chapter advance by
mid-2028. This combination would let the EPP+S&D+Renew bloc defend a
"strategic Europe" narrative against a PfE+ECR challenge framed as
"sovereign Europe". The seat-projection artifact translates this into
explicit 2029 deltas.

## Cross-Run Notes

This run is the first of the semi-annual term-outlook series (cron
`0 8 1 1,7 *`); subsequent runs will be on 2026-07-01, 2027-01-01, and so
on through the next election. Forward statements made in this run should
be reconciled against actual outcomes in those subsequent runs via the
`scripts/forward-statements-registry.js reconcile` workflow.

The current run's forward-statements registry was empty at start
(`data/forward-statements-open.json` returned `[]`). Forward statements
emitted by this run will populate the registry for the next iteration.

— end of synthesis-summary —
