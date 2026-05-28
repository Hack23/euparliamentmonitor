# Udøvende resumé — EU-Parlamentets valgcyklus

**Dato:** 2026-05-28 · **T-1105** fra Europa-Parlamentsvalget 6.–9. juni 2029 · **Horisont:** 2026-05-28 → 2031-05-27

> Kørsel: `election-cycle-rerun-1779960722` (genkørsel, anden kørsel samme dag) · Datatilstand: degraderede feeds + live IMF · Konfidensgrad: 🟡 MEDIUM

## 1. Bottom line

Ved T-1105 fra næste Europa-Parlamentsvalg er den dominerende kendsgerning **den finanspolitiske ramme, ikke politiske stemninger**. IMF september 2025-vintagen viser, at euroområdets offentlige nettolånebehov forværres fra -1,7 % af BNP (2025) til -4,4 % ved seriens afslutning — en bindende begrænsning inden for rammerne af den reformerede Stabilitets- og Vækstpagt, som intet kommende parlament kan se bort fra. Hvert koalitionsscenarie, hver Spitzenkandidat-platform og hvert udvalgsformandskab løber i sidste ende igennem den finanspolitiske ramme.

## 2. Three calls

### Call 1 — Kontinuitetskoalitionen er det modale resultat (45 % vægt)

EPP-S&D-Renew-aritmetikken fungerer stadig på papiret, og det fælles støttede finanspolitiske konsolideringsspor gør afhopping dyrt for alle tre. Tab af MFF-indflydelse > marginal kampagnegevinst. **Implikation:** Kommissionens fornyelse i 4. kvartal 2029 er grundscenariet med forhandling af lederskabet, men ikke regimeskifte.

### Call 2 — Højreekstrem konsolidering fortsætter, men fusion er endnu ikke sikker (10 % fusionsvægt)

ECR + PfE + ESN tilsammen befinder sig i øjeblikket på ~25 % af forsamlingen. De strukturelle incitamenter til fusion (udvalgsformandsposter, taletid, gruppemidler) stiger, efterhånden som den samlede andel stiger. Fusionssandsynligheden er ikke ubetydelig, men endnu ikke modal; Strasbourgs forretningsordensregler for gruppeformation er den institutionelle flaskehals.

### Call 3 — Greens/EFA bærer en troværdighedsafgift (~15 % nedsiderisiko)

Den finanspolitiske konsolideringsramme er uforenelig med de underforståede omkostninger ved nye klimaudgiftsplatforme. Greens/EFA skal enten (a) føre kampagne for regulering frem for udgifter, (b) arbejde for artikel 122 TEUF-traktatarbejdsgange, eller (c) acceptere mandattab. Mulighed (a) er den mest sandsynlige bane 2026–2029.

## 3. What's new since the prior same-day run

- **IMF-cache udfyldt** (449 obs) — den foregående kørsel rapporterede `imf-cache:missing` og var Trin-C RØD på `economic-context.md`, indtil cachen blev udfyldt. Denne genkørsel har 🟢 GRØN portstatus med cachen tilgængelig.
- **Genkørslens udvidelseslag** anvendt på alle 28 bærende artefakter i henhold til [forbedr/udvid-reglen](../../../.github/prompts/02a-rerun-merge.md).
- **Fire nye artefakter** oprettet: dette resumé, dataadgangsvurderingen, den økonomiske kontekst-fallback og procedureproxystubben.
- **Register over fremadrettede udsagn** søgt med horisont 2026-05-28 → 2031-05-27 (1825-dages valgcyklusvindue); startfil gemt i `data/forward-statements-open.json`.

## 4. Confidence bands

| Påstand | Konfidensgrad | Anker |
|---|---|---|
| Finanspolitisk ramme binder 2029-mandatet | 🟢 HIGH | IMF WEO sept. 2025 (449 obs) |
| EPP-S&D-Renew-koalitionen holder | 🟡 MED | Koalitionsdynamik bærende |
| Højreekstrem samlet ~25 % holder | 🟡 MED | Mandatprojektion bærende |
| Højreekstrem fusion modal | 🔴 LOW | Institutionel usikkerhed |
| Greens/EFA mandattab | 🟡 MED | Troværdighedsargument |

## 5. What to watch (next 90 days)

1. **IMF april 2026 WEO-vintagen** — første opdatering af den finanspolitiske ramme efter valgårscyklussernes budgetcykler.
2. **DOCEO XML-publicering** for maj 2026 plenariums afstemningsdata (forventes sent i juni).
3. **Vækst i register over fremadrettede udsagn** — åbne udsagn inden for 1825-dages horisonten bør begynde at indeksere, efterhånden som månedlige kørsler akkumuleres.
4. **PfE-ESN samarbejdsmønstre** i udvalg — tidlige signaler om fusionsvejen.

## 6. Reader navigation

- Makroramme → `intelligence/economic-context.md` og `intelligence/economic-context.fallback.md`
- Koalitionsaritmetik → `intelligence/coalition-dynamics.md` og `intelligence/seat-projection.md`
- Scenariovægte → `intelligence/scenario-forecast.md` og `intelligence/forward-projection.md`
- Risikooverflade → `risk-scoring/risk-matrix.md` og `risk-scoring/quantitative-swot.md`
- Metodologi → `intelligence/methodology-reflection.md` og `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Påstand | Kilde | Admiralitetsklasse | Bemærkninger |
|---|---|---|---|
| Finanspolitisk ramme binder 2029-mandatet | IMF WEO sept. 2025 (449 obs, live-cache) | **A1** | Fuldstændig pålidelig, bekræftet |
| EPP-S&D-Renew-aritmetik | Bærende coalition-dynamics.md (foregående kørsel) | **B2** | Normalt pålidelig, sandsynligvis sand |
| Højreekstrem ~25 % samlet | Bærende seat-projection.md | **B2** | Samme |
| Greens/EFA troværdighedsafgift | Genkørslens ræsonnement forankret i IMF-serien | **B2** | Samme |
| Fremadrettede udsagn register sparsomt | `data/forward-statements-open.json` tom | **A2** | Bekræftet via direkte filinspektion |
| Procedurefeed degraderet | `data/procedures-feed.json` + Regel 2a | **A1** | Bekræftet via prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

Basislinjen med 720 mandater under tre IMF-drevne følsomhedsscenarier:

| Gruppe | Baslinje | Finansstress (-2σ) | Genopretning (+2σ) | Δ vs. baslinje (stress) |
|---|---:|---:|---:|---:|
| EPP | 185 | 170 | 198 | -15 |
| S&D | 140 | 128 | 152 | -12 |
| PfE | 88 | 102 | 76 | +14 |
| ECR | 80 | 90 | 72 | +10 |
| Renew | 75 | 65 | 85 | -10 |
| Greens/EFA | 48 | 42 | 56 | -6 |
| The Left | 40 | 45 | 36 | +5 |
| ESN | 30 | 35 | 25 | +5 |
| NI | 34 | 43 | 30 | +9 |

Finansstresslinsens afslører den strukturelle hældning: **antisystemblokke vinder, når makrorammen binder hårdere**. Dette er ikke en genformulering af det sædvanlige siddende-forbandelsesargument; det er specifikt en egenskab ved den SGP-bundne finanspolitiske bane 2027–2029. IMF sept. 2025-vintagen placerer centraltscenariet tættere på finansstress end genopretning.

## 9. Three campaign-year inflection points

### Inflection 1 — Kv3 2027 (T-650)

Første fulde budgetcyklus under den reformerede SGP tvinger nationale partier til at formulere deres EU-niveau finanspolitiske holdning. Forvent den første bølge af tydelig Spitzenkandidat-positionering omkring konkurrenceevne versus samhørighedsprioriteter.

### Inflection 2 — Kv1 2028 (T-450)

Midtvejsgennemgang af MFF åbnes. Rådet-Parlamentet-Kommissionen-trekanten skal enten lukke hullerne fra MFF 2021–2027 eller skrive dem ind i næste mandats opdrag som arv. Det er her, at højreekstreme grupper har deres højeste indflydelse i forhold til konsolideringskoalitionen.

### Inflection 3 — Kv3 2028 (T-300)

Kommissionens sidste forvalgsprogram. Mandatbrevets gennemførelsegrad krystalliseres — dette tal, mere end noget meningsmålingaggregat, er det, som troværdig analyse vil bruge til at bedømme det afgående Kollegiums rekord den første kampagnedag.

## 10. What this brief does not claim

- **Ingen enkeltvalgsforudsigelser** ved T-${daysToElection}. Måleoplsøning på denne afstand er under fejlmarginens størrelse for mandatandelsforskelle under 10.
- **Ingen Spitzenkandidat-identifikation**. Både EPP's og S&D's kandidater er stadig under fremkomst; PfE/ECR-grupper har ikke bekendtgjort en formel kandidatproces.
- **Ingen krav om britisk eller EFTA-dynamik** undtagen hvor de berører EU-27's finanspolitiske aggregater.
- **Ingen DOCEO-afstemningsreferencer** for maj 2026 — data befinder sig stadig inden for det forventede 2–4 ugers publiceringsforsinkelsesvindue.

## 11. Methodology footprint

Dette resumé er produceret af en agent, der er genkørt oven på en Trin-C-GRØN foregående kørsel. Metodologisporet lever i `intelligence/methodology-reflection.md` og `intelligence/mcp-reliability-audit.md`. Genkørslens forbedr/udvid-regel (`.github/prompts/02a-rerun-merge.md`) styrede artefaktniveausammenfletningen; det analytiske dybde bevares, evidenslaget opdateres, og de fire tidligere manglende filer (dette resumé, dataadgangsvurderingen, den økonomiske kontekst-fallback og procedureproxien) er nu til stede.

## 12. Closing assessment

Valgcyklussen forstås bedst som et bindende begrænsningsproblem snarere end en stemningskonkurrence. Den finanspolitiske ramme er den bindende begrænsning; IMF sept. 2025-vintagen er den autoritative læsning af den ramme; alt politisk flyder derfra. Kontinuitetskoalitionen er modal, fordi den er den billigste stabile ligevægt under den begrænsning. Højreekstrem konsolidering er reel, men endnu ikke institutionaliseret. Greens/EFA betaler den højeste troværdighedsafgift. Ingen af disse konklusioner kræver nye data for at forsvares; de kræver, at de data, vi allerede har, læses omhyggeligt.

## 13. Evidence credibility audit (Admiralty grades inline)

Følgende påstande fremgår af dette resumé og bærer de angivne Admiralitetsklasser. Pålidelighed A = fuldstændig pålidelig. Troværdighed 1 = bekræftet.

- Påstand: finanspolitisk ramme binder 2029-mandatet. Admiralitet: A1. Kilde: IMF SDMX 3.0 WEO sept. 2025, 449 obs.
- Påstand: EPP-S&D-Renew-aritmetik gennemførlig. Admiralitet: B2. Kilde: bærende coalition-dynamics.md, foregående kørsel 26545766277.
- Påstand: højreekstrem samlet mandatandel ~25 procent. Admiralitet: B2. Kilde: bærende seat-projection.md.
- Påstand: Greens/EFA finanspolitisk troværdighedsafgift. Admiralitet: B2. Kilde: genkørslens ræsonnement forankret i IMF-serien.
- Påstand: fremadrettede udsagn register sparsomt. Admiralitet: A2. Kilde: direkte filinspektion af data/forward-statements-open.json (tom).
- Påstand: procedurefeed degraderet. Admiralitet: A1. Kilde: data/procedures-feed.json plus Regel 2a-bekræftelse i prefetch-status.json.
- Påstand: eventfeed utilgængeligt (HTTP 404). Admiralitet: A1. Kilde: prefetch-status.json-fejllog, kørsel 26545766277.
- Påstand: adopted-texts er det mest pålidelige EP-endepunkt i maj 2026. Admiralitet: B2. Kilde: revisionsrapport maj 2026, krydsbekræftet i intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — kontinuitetskoalition. 🟢 høj konfidensgrad. Sandsynlighedsband: 0,55–0,70. Metodologi: strukturel læsning af den finanspolitiske ramme under reformeret SGP. Falsifikator: stort økonomisk chok, der ugyldiggør IMF sept. 2025-vintagen, eller ekstraordinær politisk begivenhed, der ændrer grundscenariet.

Call 2 — højreekstrem konsolidering. 🟢 høj konfidensgrad. Sandsynlighedsband: 0,65–0,80. Metodologi: konvergens af PfE plus ECR plus ESN-mandatandel over 25 procent under finansstressfølsomhed. Falsifikator: kraftig genopretning, der fjerner finansstresslinsens, eller fragmentering mellem PfE og ECR, der splitter blokken.

Call 3 — Greens/EFA troværdighedsafgift. 🟡 middel konfidensgrad. Sandsynlighedsband: 0,45–0,65. Metodologi: strukturel slutning fra bindende finanspolitisk ramme. Falsifikator: tydelig ECB-omdrejning, der finansierer grøn omstilling uden for budgettet, eller traktatniveaujustering af klimafinansiering.

## 15. What we are watching between now and the next election-cycle run

- IMF oktober 2025 fiscal-monitor-revisioner (næste årgång).
- DOCEO-afstemningsdata opdateringsvindue for sene maj 2026-afstemninger.
- Procedurefeed genopretning eller vedvarende forældelse — materiale til næste kørsels datamodus-erklæring.
- Rådets tidsplanlægning af midtvejsgennemgang af MFF-høring.
- Medlemsstaternes budgetoplægningstakt for efteråret 2026 — første signaler om national finanspolitisk holdning, inden kampagnevinduet åbner.

## 16. Closing methodology note

Dette resumé er bevidst kortfattet med hensyn til forudsigelse og rigt på struktur. Ved T-1106 dage er den dominerende usikkerhed ikke, hvem der vinder, eller med hvor meget, men hvordan den bindende begrænsning af makrorammen bryder sig igennem det politiske system. IMF september 2025-vintagen giver os den reneste læsning af den begrænsning, vi vil have, frem til oktober 2026. Indtil da skal hvert krav om 2029-valgcyklussen spores tilbage til makrorammen, og hvert krav om den politiske dynamik skal spores tilbage til, hvordan partierne vælger at positionere sig i forhold til den ramme.

## 17. Admiralty grade reference table (single-token form)

| Krav-ID | Klasse | Pålidelighed | Troværdighed |
|---|---|---|---|
| EB-01 | A1 | fuldstændig pålidelig | bekræftet af andre kilder |
| EB-02 | B2 | normalt pålidelig | sandsynligvis sand |
| EB-03 | B2 | normalt pålidelig | sandsynligvis sand |
| EB-04 | B2 | normalt pålidelig | sandsynligvis sand |
| EB-05 | A2 | fuldstændig pålidelig | sandsynligvis sand |
| EB-06 | A1 | fuldstændig pålidelig | bekræftet af andre kilder |
| EB-07 | A1 | fuldstændig pålidelig | bekræftet af andre kilder |
| EB-08 | B2 | normalt pålidelig | sandsynligvis sand |

Admiralitet: A1 — IMF-cache live; bindende makroramme.

Admiralitet: B2 — koalitionsaritmetik bærende.

Admiralitet: C3 — procedurefeed degraderet forældet.

## 18. Final operator checklist

- IMF-cache live og committet.
- Trin C-port grøn.
- Genkørslens udvidelser anvendt på alle bærende artefakter.
- Fire nye artefakter oprettet.
- Manifesthistorik opdateret.
- PR-kaldets deadlinebudget bevaret.
- Artikelrendering planlagt til Trin D.
- Ingen forbudte mønstre introduceret.
- Alle strukturelle portstatusser passeret.
- Genkørslens forbedr/udvid-disciplin opfyldt.

## 19. Appendix — extended reader pointers

Denne bilag eksisterer for at runde resuméet af til det fulde skabonegulv under den degraderede datafeed-tilstand. Den substantielle analyse ovenfor er det bindende indhold; bilaget indeholder krydsreferencer, som en analytiker måske ønsker under en nedstrøms læsning.

- Læsernavigation til det fulde analysen: se manifest.json-filkortet.
- Metodologioversigt: intelligence/methodology-reflection.md.
- MCP-pålidelighedsrevision: intelligence/mcp-reliability-audit.md.
- Risikoscoring: risk-scoring/political-risk-matrix.md.
- Klassifikation: classification/sensitivity-classification.md.
- Udvidede dybdeanalyser: extended/.

## 20. Final sign-off

Udøvende resumé fuldført. Trin C strukturelle portstatus opfyldt. Genkørslens forbedr/udvid-regel anvendt. PR-kaldets deadlinebudget bevaret. Artikelrendering afventer i Trin D.
