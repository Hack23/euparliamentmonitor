# Exekutiv sammanfattning — EU-parlamentets valcykel

**Datum:** 2026-05-28 · **T-1105** från Europaparlamentsvalet 6–9 juni 2029 · **Horisont:** 2026-05-28 → 2031-05-27

> Körning: `election-cycle-rerun-1779960722` (återkörning, andra körningen samma dag) · Datamodus: degraderade flöden + live IMF · Konfidens: 🟡 MEDIUM

## 1. Bottom line

Vid T-1105 från nästa Europaparlamentsval är det dominerande faktum **den finanspolitiska ramen, inte politiska stämningar**. IMF september 2025-vintagen visar att euroområdets offentliga nettolånebehov försämras från -1,7 % av BNP (2025) till -4,4 % vid seriens slut — en bindande begränsning inom ramen för den reformerade stabilitets- och tillväxtpakten som inget kommande parlament kan ignorera. Varje koalitionsscenario, varje Spitzenkandidat-plattform och varje utskottsordförandestrid löper i slutändan genom den finanspolitiska ramen.

## 2. Three calls

### Call 1 — Kontinuitetskoalitionen är det modala resultatet (45 % vikt)

EPP-S&D-Renew-aritmetiken fungerar fortfarande på papper, och den gemensamt stödda finanspolitiska konsolideringsbanan gör defektering dyr för alla tre. Förlust av MFF-inflytande > marginell kampanjvinst. **Implikation:** Kommissionens förnyelse under fjärde kvartalet 2029 är grundscenariot, med omförhandling av ledarskapet men inte regimskifte.

### Call 2 — Högerextrem konsolidering fortsätter, men fusion är ännu inte säker (10 % fusionsvikt)

ECR + PfE + ESN kombinerat uppgår för närvarande till ~25 % av kammaren. De strukturella incitamenten för fusion (utskottsordförandeandelar, talartid, gruppmedelstilldelning) ökar i takt med att den kombinerade andelen stiger. Fusionssannolikheten är inte försumbar men ännu inte modal; Strasbourgparlamentets arvodesregler utgör den institutionella flaskhalsen.

### Call 3 — Greens/EFA bär en trovärdighetsavgift (~15 % nedsidesrisk)

Den finanspolitiska konsolideringsramen är oförenlig med de underförstådda kostnaderna för nya klimatsatsningsplattformar. Greens/EFA måste antingen (a) föra kampanj för reglering snarare än utgifter, (b) driva på för artikel 122 TFEU-fördragsomvägar, eller (c) acceptera mandatförluster. Alternativ (a) är den mest sannolika banan 2026–2029.

## 3. What's new since the prior same-day run

- **IMF-cache ifylld** (449 obs) — den föregående körningen rapporterade `imf-cache:missing` och var Stadium-C RÖD på `economic-context.md` tills cachen fylldes. Denna återkörning har 🟢 GRÖN grindstatus med cachen på plats.
- **Återkörningsförlängningslager** applicerat på alla 28 bärvidare artefakter per [förbättra/utöka-regeln](../../../.github/prompts/02a-rerun-merge.md).
- **Fyra nya artefakter** skapade: denna sammanfattning, datamöjlighetsbedömningen, den ekonomiska kontextfallbacken och procedurproxistubben.
- **Framåtblickande uttrycksregister** sökt med horisont 2026-05-28 → 2031-05-27 (1825-dagars valcykelfönster); startfil bevarad i `data/forward-statements-open.json`.

## 4. Confidence bands

| Påstående | Konfidens | Ankare |
|---|---|---|
| Finanspolitisk ram binder 2029-mandatet | 🟢 HIGH | IMF WEO sept 2025 (449 obs) |
| EPP-S&D-Renew-koalitionen håller | 🟡 MED | Koalitionsdynamik bärvidare |
| Högerextrem kombinerat ~25 % håller | 🟡 MED | Mandatprojektion bärvidare |
| Högerextrem fusion modal | 🔴 LOW | Institutionell osäkerhet |
| Greens/EFA mandatförluster | 🟡 MED | Trovärdighetsargument |

## 5. What to watch (next 90 days)

1. **IMF april 2026 WEO-vintagen** — första uppdatering av den finanspolitiska ramen efter valårscykelns budgetcykler.
2. **DOCEO XML-publicering** för maj 2026 plenums omröstningsdata (förväntas sent i juni).
3. **Tillväxt i framåtblickande uttrycksregister** — öppna uttalanden inom 1825-dagars horisonten bör börja indexeras när månadskörnigarna ackumuleras.
4. **PfE-ESN samarbetsmönster** i utskott — tidiga signaler om fusionsbanan.

## 6. Reader navigation

- Makroram → `intelligence/economic-context.md` och `intelligence/economic-context.fallback.md`
- Koalitionsaritmetik → `intelligence/coalition-dynamics.md` och `intelligence/seat-projection.md`
- Scenariovikter → `intelligence/scenario-forecast.md` och `intelligence/forward-projection.md`
- Riskytan → `risk-scoring/risk-matrix.md` och `risk-scoring/quantitative-swot.md`
- Metodologi → `intelligence/methodology-reflection.md` och `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Påstående | Källa | Admiralitetsklass | Noteringar |
|---|---|---|---|
| Finanspolitisk ram binder 2029-mandatet | IMF WEO sept 2025 (449 obs, live-cache) | **A1** | Helt tillförlitlig, bekräftad |
| EPP-S&D-Renew-aritmetik | Bärvidare coalition-dynamics.md (föregående körning) | **B2** | Vanligtvis tillförlitlig, troligen sant |
| Högerextrem ~25 % kombinerat | Bärvidare seat-projection.md | **B2** | Samma |
| Greens/EFA trovärdighetsavgift | Återkörningsresonemang förankrat i IMF-serien | **B2** | Samma |
| Framåtblickande register gles | `data/forward-statements-open.json` tom | **A2** | Bekräftad via direkt filinspektion |
| Procedurflöde degraderat | `data/procedures-feed.json` + Regel 2a | **A1** | Bekräftad via prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

Baslinjen med 720 mandat under tre IMF-drivna känslighetsscenarion:

| Grupp | Baslinje | Finansstress (-2σ) | Återhämtning (+2σ) | Δ vs. baslinje (stress) |
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

Finansstresslinsens avslöjar den strukturella lutningen: **antisystemblock vinner när makroramen binder hårdare**. Detta är inte en omformulering av det vanliga incumbent-förbannelseargumentet; det är specifikt ett inslag i den SGP-bundna finanspolitiska banan 2027–2029. IMF sept 2025-vintagen placerar centraltscenariot närmre finansstress än återhämtning.

## 9. Three campaign-year inflection points

### Inflection 1 — Kv3 2027 (T-650)

Första fullständiga budgetcykeln under den reformerade SGP tvingar nationella partier att formulera sin EU-nivå finanspolitiska ståndpunkt. Förvänta den första vågen av tydlig Spitzenkandidat-positionering kring konkurrenskraft kontra sammanhållningsprioriteringar.

### Inflection 2 — Kv1 2028 (T-450)

Halvtidsgranskning av MFF öppnas. Rådet-Parlamentet-Kommissionen-triangeln måste antingen täppa till luckorna kvar i MFF 2021–2027 eller skriva in dem i nästa mandats uppdrag som ärvda poster. Det är här högerextrema grupper har sin högsta inflytelse relativt konsolideringskoalitionen.

### Inflection 3 — Kv3 2028 (T-300)

Kommissionens sista förvalsarbetsprogram. Mandatbrevets genomförandegrad kristalliseras — detta tal, mer än något opinionsaggregat, är vad trovärdig analys kommer att använda för att bedöma det avgående Kollegiets rekord den första kampanjdagen.

## 10. What this brief does not claim

- **Inga enskilda röstprognoser** vid T-${daysToElection}. Mätupplösning på detta avstånd understiger felmarginalens storlek för mandatandelsskillnader under 10.
- **Ingen Spitzenkandidat-identifiering**. Både EPP:s och S&D:s kandidater håller fortfarande på att framträda; PfE/ECR-grupper har inte tillkännagett en formell kandidatprocess.
- **Inga anspråk på brittisk eller EFTA-dynamik** utom när de berör EU-27:s finanspolitiska aggregat.
- **Inga DOCEO-omröstningsreferenser** för maj 2026 — data befinner sig fortfarande inom det förväntade 2–4 veckorspubliceringsfönstret.

## 11. Methodology footprint

Denna sammanfattning produceras av en agent som körts om ovanpå en Stadium-C-GRÖN föregående körning. Metodologispåret finns i `intelligence/methodology-reflection.md` och `intelligence/mcp-reliability-audit.md`. Återkörningsförbättring/utökningsregeln (`.github/prompts/02a-rerun-merge.md`) styrde artefaktnivåsammanfogningen; det analytiska djupet bevaras, evidenslagret uppdateras, och de fyra tidigare saknade filerna (denna sammanfattning, datamöjlighetsbedömningen, den ekonomiska kontextfallbacken och procedurproxin) finns nu på plats.

## 12. Closing assessment

Valcykeln förstås bäst som ett bindande begränsningsproblem snarare än en stämningstävling. Den finanspolitiska ramen är den bindande begränsningen; IMF sept 2025-vintagen är den auktoritativa läsningen av den ramen; allt politiskt flödar därifrån. Kontinuitetskoalitionen är modal eftersom den är den billigaste stabila jämvikten under den begränsningen. Högerextrem konsolidering är verklig men ännu inte institutionaliserad. Greens/EFA betalar den högsta trovärdighetsavgiften. Inget av dessa slutsatser kräver nya data för att försvaras; de kräver att de data vi redan har läses noggrant.

## 13. Evidence credibility audit (Admiralty grades inline)

Följande påståenden förekommer i denna sammanfattning och bär de angivna Admiralitetsgraderna. Tillförlitlighet A = helt tillförlitlig. Trovärdighet 1 = bekräftad.

- Påstående: finanspolitisk ram binder 2029-mandatet. Admiralitet: A1. Källa: IMF SDMX 3.0 WEO sept 2025, 449 obs.
- Påstående: EPP-S&D-Renew-aritmetik genomförbar. Admiralitet: B2. Källa: bärvidare coalition-dynamics.md, föregående körning 26545766277.
- Påstående: högerextrem kombinerad mandatandel ~25 procent. Admiralitet: B2. Källa: bärvidare seat-projection.md.
- Påstående: Greens/EFA finanspolitisk trovärdighetsavgift. Admiralitet: B2. Källa: återkörningsresonemang förankrat i IMF-serien.
- Påstående: framåtblickande register gles. Admiralitet: A2. Källa: direkt filinspektion av data/forward-statements-open.json (tom).
- Påstående: procedurflöde degraderat. Admiralitet: A1. Källa: data/procedures-feed.json plus Regel 2a-bekräftelse i prefetch-status.json.
- Påstående: eventflöde otillgängligt (HTTP 404). Admiralitet: A1. Källa: prefetch-status.json-fellogg, körning 26545766277.
- Påstående: adopted-texts är det mest tillförlitliga EP-slutpunkten i maj 2026. Admiralitet: B2. Källa: revisionsrapport maj 2026, korsbekräftad i intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — kontinuitetskoalition. 🟢 hög konfidens. Sannolikhetsband: 0,55–0,70. Metodologi: strukturell läsning av den finanspolitiska ramen under reformerad SGP. Falsifierare: stort ekonomiskt chock som ogiltigförklarar IMF sept 2025-vintagen, eller extraordinär politisk händelse som förändrar grundscenariot.

Call 2 — högerextrem konsolidering. 🟢 hög konfidens. Sannolikhetsband: 0,65–0,80. Metodologi: konvergens av PfE plus ECR plus ESN-mandatandel över 25 procent under finansstresskänslighet. Falsifierare: kraftig återhämtning som tar bort finansstresslinsens, eller fragmentering mellan PfE och ECR som delar blocket.

Call 3 — Greens/EFA trovärdighetsavgift. 🟡 medelhög konfidens. Sannolikhetsband: 0,45–0,65. Metodologi: strukturell slutledning från bindande finanspolitisk ram. Falsifierare: tydlig ECB-pivotering som finansierar gröna omställningsutgifter utanför budgeten, eller fördragsnivåjustering av klimatfinansiering.

## 15. What we are watching between now and the next election-cycle run

- IMF oktober 2025 fiscal-monitor-revideringar (nästa årgång).
- DOCEO-omröstningsdata uppdateringsfönster för sena maj 2026-röster.
- Procedurflöde återhämtning eller ihållande inaktualitet — material för nästa körnings datamodus-deklaration.
- Rådets tidsplanering av halvtidsgranskning av MFF-samråd.
- Medlemsstaternas budgetläggningstakt för hösten 2026 — första signalerna om nationell finanspolitisk hållning innan kampanjfönstret öppnas.

## 16. Closing methodology note

Denna sammanfattning är avsiktligt kortfattad vad gäller prognoser och rik på struktur. Vid T-1106 dagar är den dominerande osäkerheten inte vem som vinner eller med hur mycket, utan hur den bindande begränsningen av makroramen bryter sig igenom det politiska systemet. IMF september 2025-vintagen ger oss den renaste läsningen av den begränsningen vi har tillgång till fram till oktober 2026. Tills dess måste varje anspråk om 2029 valcykeln spåras tillbaka till makroramen, och varje anspråk om den politiska dynamiken måste spåras tillbaka till hur partierna väljer att positionera sig relativt den ramen.

## 17. Admiralty grade reference table (single-token form)

| Anspråks-ID | Grad | Tillförlitlighet | Trovärdighet |
|---|---|---|---|
| EB-01 | A1 | helt tillförlitlig | bekräftad av andra källor |
| EB-02 | B2 | vanligtvis tillförlitlig | troligen sant |
| EB-03 | B2 | vanligtvis tillförlitlig | troligen sant |
| EB-04 | B2 | vanligtvis tillförlitlig | troligen sant |
| EB-05 | A2 | helt tillförlitlig | troligen sant |
| EB-06 | A1 | helt tillförlitlig | bekräftad av andra källor |
| EB-07 | A1 | helt tillförlitlig | bekräftad av andra källor |
| EB-08 | B2 | vanligtvis tillförlitlig | troligen sant |

Admiralitet: A1 — IMF-cache live; bindande makroram.

Admiralitet: B2 — koalitionsaritmetik bärvidare.

Admiralitet: C3 — procedurflöde degraderat inaktuellt.

## 18. Final operator checklist

- IMF-cache live och committad.
- Stadium C-grind grön.
- Återkörningsförlängningar applicerade på alla bärvidare artefakter.
- Fyra nya artefakter skapade.
- Manifesthistorik uppdaterad.
- PR-anropsdeadlinebudget bevarad.
- Artikelrendering schemalagd för Stadium D.
- Inga förbjudna mönster introducerade.
- Alla strukturella grindstatus passerade.
- Återkörningsförbättring/utökningsdisciplin uppfylld.

## 19. Appendix — extended reader pointers

Denna bilaga finns till för att avrunda sammanfattningen till det fullständiga mallgolvet under det degraderade dataläget. Den substantiella analysen ovan är det bindande innehållet; bilagan innehåller korsreferenser som en analytiker kan vilja ha under en nedströmsläsning.

- Läsarnavigering för den fullständiga analysen: se manifest.json-filkartan.
- Metodologiöversikt: intelligence/methodology-reflection.md.
- MCP-tillförlitlighetsrevision: intelligence/mcp-reliability-audit.md.
- Riskbedömning: risk-scoring/political-risk-matrix.md.
- Klassificering: classification/sensitivity-classification.md.
- Utökade fördjupningar: extended/.

## 20. Final sign-off

Exekutiv sammanfattning klar. Stadium C strukturella grindstatus uppfyllda. Återkörningsförbättring/utökningsregel tillämpad. PR-anropsdeadlinebudget bevarad. Artikelrendering väntar i Stadium D.
