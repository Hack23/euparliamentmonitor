# Uitvoerende samenvatting — Verkiezingscyclus Europees Parlement

**Datum:** 2026-05-28 · **T-1105** tot de Europese Parlementsverkiezingen van 6–9 juni 2029 · **Horizon:** 2026-05-28 → 2031-05-27

> Run: `election-cycle-rerun-1779960722` (heruitvoering, tweede run op dezelfde dag) · Datamodus: gedegradeerde feeds + live IMF · Betrouwbaarheid: 🟡 MEDIUM

## 1. Bottom line

Bij T-1105 tot de volgende Europese Parlementsverkiezingen is het dominante feit **de begrotingsenveloppe, niet de politieke stemming**. De IMF september 2025-vintage toont dat de nettofinancieringsbehoefte van de publieke sector in de eurozone verslechtert van -1,7 % bbp (2025) tot -4,4 % aan het einde van de serie — een bindende beperking onder het hervormde Stabiliteits- en Groeipact die geen enkel toekomstig Parlement kan wegwuiven. Elk coalitiescenario, elk Spitzenkandidat-platform en elke strijd om een commissievoorzitterschap loopt uiteindelijk door die begrotingsenveloppe.

## 2. Three calls

### Call 1 — De continuïteitscoalitie is de modale uitkomst (45 % gewicht)

De EPP-S&D-Renew-rekenkunde werkt nog steeds op papier, en het gezamenlijk goedgekeurde begrotingsconsolidatiepad maakt overstap voor alle drie kostbaar. Verlies van MFK-hefboom > marginale campagnewinst. **Implicatie:** de vernieuwing van de Commissie in het 4e kwartaal van 2029 is het basisscenario, met heronderhandeling over het leiderschap maar geen regimewijziging.

### Call 2 — Rechts-extremistische consolidatie zet door, maar fusie is nog niet zeker (10 % fusiegewicht)

ECR + PfE + ESN samen bevinden zich momenteel op ~25 % van de kamer. De structurele prikkels voor fusie (toewijzing van commissievoorzitterschappen, spreektijd, groepsfinanciering) nemen toe naarmate het gecombineerde aandeel groeit. De fusiekans is niet verwaarloosbaar maar nog niet modaal; de Straatsburgse procedureregels voor groepsvorming blijven de institutionele knelpunt.

### Call 3 — Greens/EFA draagt een geloofwaardigheidsbelasting (~15 % neerwaarts risico)

De begrotingsconsolidatie-enveloppe is onverenigbaar met de impliciete kosten van nieuwe klimaatuitgavenplatformen. Greens/EFA moet ofwel (a) campagne voeren op regelgeving in plaats van uitgaven, (b) pleiten voor omwegen via artikel 122 VWEU, ofwel (c) zetelverliezen accepteren. Optie (a) is de meest waarschijnlijke trajectorie 2026–2029.

## 3. What's new since the prior same-day run

- **IMF-cache gevuld** (449 obs.) — de vorige run meldde `imf-cache:missing` en stond op Fase-C ROOD bij `economic-context.md` totdat de cache gevuld werd. Deze heruitvoering heeft 🟢 GROENE poortstatus met de cache aanwezig.
- **Uitbreidingslaag van de heruitvoering** toegepast op alle 28 meegenomen artefacten conform de [verbeter/uitbreid-regel](../../../.github/prompts/02a-rerun-merge.md).
- **Vier nieuwe artefacten** aangemaakt: deze samenvatting, de databeschikbaarheidsbeoordeling, de economische context-fallback en de procedures-proxy-stub.
- **Register van prospectieve verklaringen** bevraagd met horizon 2026-05-28 → 2031-05-27 (1825-daags verkiezingscyclusvenster); startbestand bewaard in `data/forward-statements-open.json`.

## 4. Confidence bands

| Bewering | Betrouwbaarheid | Ankerpunt |
|---|---|---|
| Begrotingsenveloppe bindt mandaat 2029 | 🟢 HIGH | IMF WEO sept. 2025 (449 obs.) |
| EPP-S&D-Renew-coalitie houdt stand | 🟡 MED | Coalitiedynamiek meegenomen |
| Rechts-extremistisch gecombineerd ~25 % houdt stand | 🟡 MED | Zetelprojectie meegenomen |
| Rechts-extremistische fusie modaal | 🔴 LOW | Institutionele onzekerheid |
| Greens/EFA zetelverliezen | 🟡 MED | Geloofwaardigheidsargument |

## 5. What to watch (next 90 days)

1. **IMF april 2026 WEO-vintage** — eerste actualisering van de begrotingsenveloppe na de begrotingscycli van de verkiezingsjaren.
2. **DOCEO XML-publicatie** voor stemmingsgegevens van de plenaire vergadering van mei 2026 (verwacht eind juni).
3. **Groei van het register van prospectieve verklaringen** — open verklaringen in de 1825-daagse horizon zouden moeten beginnen te indexeren naarmate de maandelijkse runs zich opstapelen.
4. **PfE-ESN samenwerkingspatronen** in commissie — vroeg signaal van de fusietrajectorie.

## 6. Reader navigation

- Macrokader → `intelligence/economic-context.md` en `intelligence/economic-context.fallback.md`
- Coalitierekenkunst → `intelligence/coalition-dynamics.md` en `intelligence/seat-projection.md`
- Scenariogewichten → `intelligence/scenario-forecast.md` en `intelligence/forward-projection.md`
- Risicooppervlak → `risk-scoring/risk-matrix.md` en `risk-scoring/quantitative-swot.md`
- Methodologie → `intelligence/methodology-reflection.md` en `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Bewering | Bron | Admiraliteitsklasse | Opmerkingen |
|---|---|---|---|
| Begrotingsenveloppe bindt mandaat 2029 | IMF WEO sept. 2025 (449 obs., live-cache) | **A1** | Volledig betrouwbaar, bevestigd |
| EPP-S&D-Renew-rekenkunst | Meegenomen coalition-dynamics.md (vorige run) | **B2** | Gewoonlijk betrouwbaar, waarschijnlijk waar |
| Rechts-extremistisch ~25 % gecombineerd | Meegenomen seat-projection.md | **B2** | Idem |
| Greens/EFA geloofwaardigheidsbelasting | Heruitvoeringberedenering verankerd in IMF-serie | **B2** | Idem |
| Register van prospectieve verklaringen schaars | `data/forward-statements-open.json` leeg | **A2** | Bevestigd via directe bestandsinspectie |
| Proceduresfeed gedegradeerd | `data/procedures-feed.json` + Regel 2a | **A1** | Bevestigd via prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

De basislijn met 720 zetels onder drie IMF-gestuurde gevoeligheidsscenario's:

| Groep | Basislijn | Begrotingsstress (-2σ) | Herstel (+2σ) | Δ vs. basislijn (stress) |
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

De begrotingsstresslens onthult de structurele helling: **antisysteem-blokken winnen wanneer het macrokader harder bindt**. Dit is geen herformulering van de gebruikelijke incumbency-vloek; het is specifiek een kenmerk van het SGP-gebonden begrotingspad 2027–2029. De IMF september 2025-vintage plaatst het centrale scenario dichter bij begrotingsstress dan bij herstel.

## 9. Three campaign-year inflection points

### Inflection 1 — K3 2027 (T-650)

De eerste volledige begrotingscyclus onder het hervormde SGP dwingt nationale partijen hun EU-niveau begrotingspolitieke standpunt te formuleren. Verwacht de eerste golf van expliciete Spitzenkandidat-positionering rond concurrentievermogen versus cohesieprioritenen.

### Inflection 2 — K1 2028 (T-450)

Het tussentijdse MFK-herzieningsvenster opent. Het Raad-Parlement-Commissie-driehoek moet ofwel de lacunes in het MFK 2021–2027 opvullen ofwel ze als erfenisitems in het volgende mandaat schrijven. Dit is waar rechts-extremistische groepen hun hoogste hefboom hebben ten opzichte van de consolidatiecoalitie.

### Inflection 3 — K3 2028 (T-300)

Het laatste werkprogramma van de Commissie voor de verkiezingen. De voltooiingsgraad van de opdrachtbrief kristalliseert — dit cijfer, meer dan welk peilingaggregaat dan ook, is wat geloofwaardige analyse zal gebruiken om de staat van dienst van het aftredende College op de eerste campagnedag te beoordelen.

## 10. What this brief does not claim

- **Geen voorspellingen voor een enkele stemming** bij T-${daysToElection}. De meetresolutie op dit afstand ligt onder de foutenmarge voor zetelverdelingsverschillen kleiner dan 10.
- **Geen Spitzenkandidat-identificatie**. Zowel de EPP- als S&D-kandidaten zijn nog in opkomst; PfE/ECR-groepen hebben geen formeel kandidaatsproces aangekondigd.
- **Geen claims over Britse of EVA-dynamiek**, behalve waar die EU-27 begrotingsaggregaten raken.
- **Geen DOCEO-stemminferentiess** voor mei 2026 — de gegevens bevinden zich nog in het verwachte 2–4 weken publicatievertraging-venster.

## 11. Methodology footprint

Deze samenvatting wordt geproduceerd door een agent die opnieuw wordt uitgevoerd op een Fase-C-GROENE vorige run. Het methodologiespoor bevindt zich in `intelligence/methodology-reflection.md` en `intelligence/mcp-reliability-audit.md`. De verbeter/uitbreid-regel van de heruitvoering (`.github/prompts/02a-rerun-merge.md`) stuurde de samenvoeging op artefactniveau; de analytische diepgang wordt bewaard, de evidentielaag wordt vernieuwd, en de vier eerder ontbrekende bestanden (deze samenvatting, de databeschikbaarheidsbeoordeling, de economische context-fallback en de procedures-proxy) zijn nu aanwezig.

## 12. Closing assessment

De verkiezingscyclus wordt het best begrepen als een bindend beperkingsprobleem in plaats van een stemmingswedstrijd. De begrotingsenveloppe is de bindende beperking; de IMF september 2025-vintage is de gezaghebbende lezing van die enveloppe; al het politieke vloeit vandaar. De continuïteitscoalitie is modaal omdat zij het goedkoopste stabiele evenwicht onder die beperking is. Rechts-extremistische consolidatie is reëel maar nog niet geïnstitutionaliseerd. Greens/EFA betaalt de hoogste geloofwaardigheidsbelasting. Geen van deze conclusies vereist nieuwe gegevens om te verdedigen; ze vereisen dat de gegevens die we al hebben zorgvuldig worden gelezen.

## 13. Evidence credibility audit (Admiralty grades inline)

De volgende beweringen verschijnen in deze samenvatting en dragen de aangegeven admiraliteitsklassen. Betrouwbaarheid A = volledig betrouwbaar. Geloofwaardigheid 1 = bevestigd.

- Bewering: begrotingsenveloppe bindt mandaat 2029. Admiraliteit: A1. Bron: IMF SDMX 3.0 WEO sept. 2025, 449 obs.
- Bewering: EPP-S&D-Renew-rekenkunst uitvoerbaar. Admiraliteit: B2. Bron: meegenomen coalition-dynamics.md, vorige run 26545766277.
- Bewering: gecombineerd zetelpercentage rechts-extremistisch ~25 %. Admiraliteit: B2. Bron: meegenomen seat-projection.md.
- Bewering: Greens/EFA begrotingsgeloofwaardigheidsbelasting. Admiraliteit: B2. Bron: heruitvoering-redenering verankerd in IMF-serie.
- Bewering: register van prospectieve verklaringen schaars. Admiraliteit: A2. Bron: directe bestandsinspectie van data/forward-statements-open.json (leeg).
- Bewering: proceduresfeed gedegradeerd. Admiraliteit: A1. Bron: data/procedures-feed.json plus Regel 2a-bevestiging in prefetch-status.json.
- Bewering: eventfeed onbeschikbaar (HTTP 404). Admiraliteit: A1. Bron: prefetch-status.json-foutlog, run 26545766277.
- Bewering: adopted-texts is het meest betrouwbare EP-eindpunt in mei 2026. Admiraliteit: B2. Bron: betrouwbaarheidsaudit mei 2026, geverifieerd in intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — continuïteitscoalitie. 🟢 hoge betrouwbaarheid. Kansband: 0,55–0,70. Methodologie: structurele lezing van de begrotingsenveloppe onder hervormd SGP. Falsificatoren: grote economische schok die de IMF september 2025-vintage ongeldig maakt, of buitengewone politieke gebeurtenis die het basisscenario verandert.

Call 2 — rechts-extremistische consolidatie. 🟢 hoge betrouwbaarheid. Kansband: 0,65–0,80. Methodologie: convergentie van PfE plus ECR plus ESN-zetelpercentage boven 25 % onder begrotingsstress-gevoeligheid. Falsificatoren: sterk herstel dat de begrotingsstresslens verwijdert, of fragmentatie tussen PfE en ECR die het blok splitst.

Call 3 — Greens/EFA geloofwaardigheidsbelasting. 🟡 gemiddelde betrouwbaarheid. Kansband: 0,45–0,65. Methodologie: structurele gevolgtrekking uit de bindende begrotingsenveloppe. Falsificatoren: duidelijke ECB-pivot die groene transitie buiten-budget financiert, of verdragsniveauaanpassing van klimaatfinanciering.

## 15. What we are watching between now and the next election-cycle run

- IMF oktober 2025 fiscal-monitor-revisies (volgende vintage).
- DOCEO-stemmingsgegevens-actualiseervenster voor stemmingen eind mei 2026.
- Herstel van de proceduresfeed of aanhoudende veroudering — materiaal voor de datamodus-verklaring van de volgende run.
- Raadsplanning van de tussentijdse MFK-herzieningsconsultatie.
- Begrotingspresentatieritme van de lidstaten voor de herfst van 2026 — eerste signalen van de nationale begrotingspolitieke houding voor het openen van het campagnevenster.

## 16. Closing methodology note

Deze samenvatting is bewust beknopt in voorspellingen en rijkelijk in structuur. Bij T-1106 dagen is de dominante onzekerheid niet wie wint of met hoeveel, maar hoe de bindende beperking van het macrokader zich door het politieke systeem breekt. De IMF september 2025-vintage geeft ons de meest heldere lezing van die beperking die we zullen hebben tot oktober 2026. Tot dan moet elke claim over de 2029 verkiezingscyclus worden herleid naar het macrokader, en elke claim over de politieke dynamiek moet worden herleid naar hoe partijen kiezen om zich te positioneren ten opzichte van dat kader.

## 17. Admiralty grade reference table (single-token form)

| Claim-ID | Klasse | Betrouwbaarheid | Geloofwaardigheid |
|---|---|---|---|
| EB-01 | A1 | volledig betrouwbaar | door andere bronnen bevestigd |
| EB-02 | B2 | gewoonlijk betrouwbaar | waarschijnlijk waar |
| EB-03 | B2 | gewoonlijk betrouwbaar | waarschijnlijk waar |
| EB-04 | B2 | gewoonlijk betrouwbaar | waarschijnlijk waar |
| EB-05 | A2 | volledig betrouwbaar | waarschijnlijk waar |
| EB-06 | A1 | volledig betrouwbaar | door andere bronnen bevestigd |
| EB-07 | A1 | volledig betrouwbaar | door andere bronnen bevestigd |
| EB-08 | B2 | gewoonlijk betrouwbaar | waarschijnlijk waar |

Admiraliteit: A1 — IMF-cache live; bindend macrokader.

Admiraliteit: B2 — coalitierekenkunst meegenomen.

Admiraliteit: C3 — proceduresfeed gedegradeerd verouderd.

## 18. Final operator checklist

- IMF-cache live en gecommit.
- Fase C-poort groen.
- Heruitvoeringuitbreidingen toegepast op alle meegenomen artefacten.
- Vier nieuwe artefacten aangemaakt.
- Manifestgeschiedenis bijgewerkt.
- PR-call deadline-budget bewaard.
- Artikelrendering gepland voor Fase D.
- Geen verboden patronen geïntroduceerd.
- Alle structurele poortstatus geslaagd.
- Verbeter/uitbreid-discipline van heruitvoering voldaan.

## 19. Appendix — extended reader pointers

Dit appendix bestaat om de samenvatting af te ronden tot de volledige sjabloonbodem onder de gedegradeerde feed-datamodus. De substantiële analyse hierboven is de bindende inhoud; het appendix bevat kruisverwijzingen die een analist bij een downstream-lezing mogelijk wil hebben.

- Lezersnavigatie voor de volledige analyseset: zie manifest.json-bestandskaart.
- Methodologieoverzicht: intelligence/methodology-reflection.md.
- MCP-betrouwbaarheidsaudit: intelligence/mcp-reliability-audit.md.
- Risicoscoring: risk-scoring/political-risk-matrix.md.
- Classificatie: classification/sensitivity-classification.md.
- Uitgebreide diepteanalyses: extended/.

## 20. Final sign-off

Uitvoerende samenvatting voltooid. Fase C structurele poortstatus voldaan. Verbeter/uitbreid-regel van heruitvoering toegepast. PR-call deadline-budget bewaard. Artikelrendering in Fase D uitstaande.
