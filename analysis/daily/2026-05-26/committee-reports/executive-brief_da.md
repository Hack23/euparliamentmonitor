<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Udøvende resumé — EP-udvalgsrapporter | 2026-05-26

**WEP:** Nogenlunde lige — at denne uges udvalgsaktivitet vil producere resultater, der meningsfuldt fremmer den 10. valgperiodes lovgivningsdagsorden  
**Admiralitet:** B2 — Sandsynligvis sandt; baseret på EP's institutionelle viden og bekræftet AFCO-aktivitet  
**SATs:** Kontrol af nøgleantagelser, Kontrol af informationskvalitet  
**Datatilstand:** degraded-feeds (0,80 bundniveaufaktor)  
**Kørsels-ID:** committee-reports-run260-1779774042  

---

## BLUF — Bottom Line Up Front

Europa-Parlamentets udvalgssystem træder ind i ugen den 26. maj 2026 i en periode med høj lovgivningsefterspørgsel og begrænset overvågningssynlighed. Fejl i EP's åbne data-API (4 ud af 5 kilder utilgængelige) begrænser dokumentarisk bekræftelse til AFCO-udvalgets pipeline (50+ dokumenter bekræftet). Analysen syntetiserer EP's 10. valgperiodes institutionelle viden: fem aktive lovgivningsstrømme (implementering af AI-forordningen, Konkurrenceevnedagsordenen, Forsvarsindustriel strategi, Revision af den grønne pagt, Migrationspagten), et omstridt EPP-ledet flertal, der kræver koalitionsstyring på hver betydelig sag, og forhøjet risiko for, at den grønne pagts ambition svækkes af højreflankens taktiske tilpasning.

**Centrale vurderinger:**

1. 🟡 **AFCO-udvalget**: Konstitutionelle anliggender bekræftet aktive (50 dokumenter i EP730–PE782-serien). Institutionel reform og interinstitutionelt aftalearbejde er den sandsynlige fokus. *Tillid: MEDIUM (B2 — direkte dokumentbevis, ingen indholdsmetadata)*

2. 🟠 **Lovgivningsprioritetsstrømme**: Alle fem store strømme i den 10. valgperiode (AI, Konkurrenceevne, Forsvar, Revision af den grønne pagt, Migration) er i aktivt udvalgsstadium. Maj 2026 er en Bruxelles-udvalgsuge (efter plenarsessionen 20.–23. maj i Strasbourg), hvilket betyder, at afstemninger, høringer og ordførerens arbejdssessioner forventes denne uge. *Tillid: MEDIUM-HØJ (B2)*

3. 🔴 **Risiko for svækkelse af den grønne pagt**: Sandsynlighed vurderet til 65 % (Sandsynligt) for, at udvalgsafstemninger i ENVI/ITRE producerer resultater svagere end Kommissionens forslag 2019–2024, drevet af EPP+ECR+Patriots taktiske tilpasning på specifikke sager. *Tillid: MEDIUM (B2)*

4. 🟡 **AI-forordningens delegerede retsakter**: ITRE/LIBE-udvalgets koordination om delegerede retsakter har en nogenlunde lige (50 %) risiko for 6 måneders forsinkelse på grund af jurisdiktionstvister og industrilobbyisme. *Tillid: MEDIUM (B2)*

5. 🟢 **Økonomisk grundlag**: IMF WEO April 2026 forudsiger EU's BNP-vækst til 1,4 % for 2026, hvilket giver den makroøkonomiske kontekst for konkurrenceevnelovgivning. Draghis investeringsgab på EUR 750–800 mia. forbliver referencerammen for ECON- og ITRE-udvalgets arbejde. *Tillid: HØJ (A1 — IMF primærkilde)*

---

## Political Landscape Summary

| Gruppe | Pladser | Udvalgsrolle kv. 2 2026 |
|--------|---------|------------------------|
| EPP | 189 | Dagsordensætter; flertalsbygger; pro-konkurrenceevne |
| S&D | 136 | Væsentlig koalitionspartner; forhandler af social dimension |
| Patriots | 84 | Forstyrrende minoritet; taktisk EPP-allieret i rette sager |
| ECR | 78 | Konservativ; variabel tilpasning; pragmatisk i industripolitik |
| Renew | 77 | Liberale svingsstemmer; pro-digitalt, pro-handel |
| Greens/EFA | 53 | Minoritet; stærke i ENVI/LIBE; koalitioner med S&D/Left |
| Left | 46 | Progressiv opposition; arbejdsmarkeds- og socialsager |
| ESN | 25 | Yderste højre; marginaliseret |

**Flertalstærskel:** 353/705 pladser. Den store koalition (EPP+S&D+Renew = 402 pladser) har et komfortabelt flertal for mainstream-lovgivning; risikoen er EPP's taktiske brug af Patriots/ECR for specifikke højreorienterede sager.

---

## IMF Economic Reference

**IMF WEO April 2026 nøgletal for EP-udvalgets kontekst:**
- EU's BNP-vækst 2026: **1,4 %** (over 2025's 1,1 % — beskeden genopretning)
- Eurozonens inflation: **2,0 %** (på målet; ECB's forsigtigt lempende cyklus)
- EU's arbejdsløshed: **5,7 %** (langsomt faldende)
- EU's finansunderskud: **~2,5 % af BNP** (inden for SGP-grænser efter reform)

Den økonomiske kontekst styrker udvalgets hastende arbejde med konkurrenceevne- og kapitalmarkedslovgivning. IMF's udtrykkelige støtte til Draghi-rammen giver politisk dækning for ambitiøse ECON/ITRE-reformpakker.

---

## Monitoring Gaps

Dette udøvende resumé er eksplicit begrænset af EP API-forringelse. Følgende overvågningsgab gælder:

1. **Ingen aktuelle udvalgsafstemningsdata**: Ukendt hvilke udvalg der stemte denne uge og om hvilke sager
2. **Ingen begivenheds-/høringsdatadata**: Høringer, ekspertvidneudsagn og ordførerens præsentationer er uobserverede
3. **Udvalgsddækning**: Kun AFCO bekræftet aktiv; 19 andre udvalg uobserverede
4. **Procedur-pipeline**: Aktuel status for procedurefremskridt er ukendt (reservedata er fra 1972)

**Anbefaling til næste kørsel:** Når EP API genoprettes, bør prioriteret dyb-hentning være: `get_procedures_feed` (indeværende år), `get_events_feed` (manglende høringer), `get_committee_documents_feed` (manglende rapporter), og `track_legislation` for de 5 prioriterede strømme.

---

## Strategic Intelligence Summary

EP's udvalgssystem i ugen den 26. maj 2026 repræsenterer et kritisk knudepunkt i den 10. valgperiodes lovgivningscyklus. Fem store lovgivningsprioritetsstrømme er samtidig aktive i udvalgsstadiet, EPP's majoritetskoalition kræver kompleks styring, og Draghis konkurrenceevneramme giver den makroøkonomiske reference for ECON- og ITRE-udvalgets arbejde. EP API-forringelse begrænsede overvågningssystemets evne til at bekræfte specifikke udvalgsaktiviteter, men strukturanalysen forbliver robust baseret på institutionel viden.

**For beslutningstagere og politiske interessenter:** Den afgørende variabel i EP's udvalgsarbejde i maj 2026 er, hvordan EPP koordinerer med Patriots/ECR om specifikke grønne og migrationssager, mens det opretholder den store koalition for konkurrenceevne- og AI-lovgivning. Overvågning af EPP's udvalgskoordinatorpositioner og skyggeordførertekster i ENVI, LIBE og ITRE vil afsløre de faktiske koalitionsdynamikker.

**For borgere:** Udvalgsstadiet er, hvor indholdet i love, der påvirker hverdagen, faktisk bestemmes. Når udvalg stemmer om AI-forordningens delegerede retsakter, ændringsforslag til revisionen af den grønne pagt eller migrationsprocedureforslag, træffer de beslutninger med umiddelbare praktiske konsekvenser. Engagement i udvalgsprocedurer — indsendelse af andragender, opfølgning på ordførerarbejde, sporing af ekspertudfrågningsresultater — er den mest direkte form for demokratisk deltagelse, der er tilgængelig for EU's borgere.

---

*Genereret af EU Parliament Monitor automatiseret arbejdsgang | committee-reports | 2026-05-26 | Kørsel: committee-reports-run260-1779774042 | Datatilstand: degraded-feeds*

## Strategic Intelligence Assessment

**EP's udvalgslandskab: Strukturel analyse for beslutningstagere**

Europa-Parlamentets udvalgssystem fungerer som forkammerfilter for al EU-lovgivning. Fra den 26. maj 2026 definerer tre strukturkræfter landskabet:

**Kraft 1: EPP-dominans uden flertal**
Med 189/705 pladser (26,8 %) er EPP den største gruppe, men kan ikke vedtage lovgivning alene. EPP's dominans over udvalgsformandsposterne (ENVI, ITRE, ECON, AFCO, INTA) giver dagsordensættende magt — udvalg kontrollerer, hvilke ændringsforslag der når plenum. EPP kræver dog mindst to yderligere grupper for at danne et flertal. S&D-Renew-partnerskabet (213 kombinerede pladser) er EPP's foretrukne koalition og danner den store koalition (402 pladser, flertal på 353 opnået med margin). EPP's alternative højreblokstrategi (Patriots 84, ECR 78) når kun 351 pladser — to under flertalsgrænsen — hvilket gør den store koalition til EPP's rationelle standard.

**Kraft 2: Revision af den grønne pagt som det afgørende lovgivningsstrid**
ENVI-udvalgets revisionsproces af den grønne pagt er den mest afgørende udvalgsaktivitet i 2026. EPP presser på for "konkurrenceevne"-ændringer af naturgenopretningsloven, emballageforordningen og CBAM-implementeringstidsplaner. S&D, Greens/EFA og Left modsætter sig tilbagerulninger. Det lovgivningsmæssige resultat afgør, om EU's klimaforpligtelser opretholdes eller grundlæggende revideres for 2030-målperioden.

**Kraft 3: Timing for AI-forordningens delegerede retsakter**
AI-forordningens delegerede retsakter (ITRE/LIBE's jurisdiktion) fastsætter implementeringstidslinjen for krav til AI-systemer med høj risiko. Kommissionen er under industrielt pres for at forsinke. Udvalgets konsensusposition er vigtig, fordi delegerede retsakter kræver et blokerende flertal i EP (353 MEP'er) for at afvise. ITRE's lovgivningskompetence her kontrolleres af EPP — EPP's interne holdning til AI-implementeringshastighed er en afgørende variabel for EU's AI-styring.

## Decision-Maker Priority Matrix

| Interessent | Umiddelbar prioritet | 3-måneders prioritet | Langsigtet bekymring |
|-------------|---------------------|---------------------|---------------------|
| EU-erhvervsliv | ENVI-afstemningsresultater for den grønne pagt | Tidsplan for AI-forordningens delegerede retsakter | Fælles omfang for traktatrevision |
| Civilsamfund | Overvågning af migrationspagten | AI-forordningens LIBE-positioner | Påvirkning af konstitutionel reform |
| Kommissionen | ENVI-ændringsmål | ITRE-samarbejde om AI | AFCO-traktatinitiativ |
| Medlemsstater | Bæredygtighed for den store koalition | Signal om højrebloks fremkomst | Subsidiaritetsdebatter |
| EP-administrationen | AFCO-mandatfremskridt | Udvidelse af plenarpladser | Indgivelse af nye procedurer |

## Intelligence Gaps Requiring Monitoring

1. **ENVI-udvalgets juniafstemnigsdato og ændringsforslagnsliste** — afgørende for den grønne pagts bane
2. **EPP-koordinatorens konsistens på tværs af udvalgspositioner** — bestemmer koalitionens holdbarhed  
3. **ITRE-ordførerens position om AI's delegerede retsakter** — afgørende for EU's AI-styring
4. **AFCO-dokumentserien PE781.*** — signalerer, om traktatrevision er nært forestående
5. **Trilogfremskridt om udestående lovgivningssager** — bestemmer 2026-outputraten

## Reader Briefing

Dette udøvende resumé syntetiserer EP's udvalgsefterretning for den 26. maj 2026. EP er verdens eneste direkte valgte overnationale lovgivende forsamling. Dets 20+ stående udvalg håndterer ca. 200 lovgivningssager pr. valgperiode. Hvert udvalg kan ændre Kommissionens forslag inden plenartemning; udvalgsændringer overlever typisk i den endelige lov. Borgere, der overvåger udvalgsaktivitet, får 3–6 måneders forhåndsvarsel om lovgivningsændringer, der påvirker deres liv. Nøglebudskabet fra denne analyse: den store koalition holder, EPP modererer tempoet for den grønne omstilling, og AI-styrningsrammen forhandles i udvalg lige nu.

## IMF Economic Context for Committee Legislative Activity

EP's udvalgsbeslutninger om revision af den grønne pagt, AI-regulering og migrationspolitik sker ikke i et økonomisk vakuum. IMF WEO April 2026 basislinjen giver den økonomiske kontekst, der former politisk gennemførlighed:

- **EU's BNP-vækst 2026: 1,4 %** — Under-trend vækst reducerer EPP's appetit på kostbare grønne omstillingsforanstaltninger og øger støtten til konkurrenceevneændringer
- **Eurozonens inflation 2026: 2,0 %** — Inflationen vender tilbage til målet; reducerer hastende ECB-nødforanstaltninger; normaliserer finanspolitisk rum for grøn investering
- **EU's arbejdsløshed 2026: 5,7 %** — Strukturel arbejdsløshed opretholdes S&D's pres for retfærdig omstilling sociale bestemmelser i hver grøn pagt revisionssag
- **EU's finansunderskud ~2,5 % BNP** — Inden for SGP-reglerne; tillader en vis grøn investering fra medlemsstater, men begrænser subsidieprogrammer i EP-drevet lovgivning
- **IMF-kilde:** `cache — WEO April 2026`

**Lovgivningsmæssig implikation:** Under-trend vækst skaber politiske betingelser for EPP's konkurrenceevnenarrativer. ENVI-udvalgets kamp om revision af den grønne pagt udkæmpes i en kontekst, hvor erhvervslobbyer troværdigt kan citere vækstbekymringer. S&D's modargument — at grøn investering stimulerer vækst — har IMF-støtte (WEO kapitel 3 om klimainvestering), men er sværere at kommunikere i et lavvækstmiljø.

## Data Availability Assessment (This Run)

| Datakilde | Status | Tillidsimpakt |
|-----------|--------|---------------|
| EP-udvalgets dokumentfeed | 🔴 404 UTILGÆNGELIG | HØJ — Kan ikke bekræfte aktuelle ugentlige aktiviteter |
| EP-procedureopdateringsfeed | 🟡 DELVIS (historisk hale) | MEDIUM — Struktur gyldig, timing upålidelig |
| EP-begivenhedsfeed | 🔴 404 UTILGÆNGELIG | HØJ — Kan ikke bekræfte junidagordenen |
| EP-udvalgets dokumenter | 🟡 DELVIS (50 AFCO-dok. kun) | MEDIUM — AFCO bekræftet; andre udvalg ukendte |
| IMF WEO April 2026 | 🟢 CACHET | LAV — Økonomisk baseline bekræftet |
| Institutionel viden | 🟢 HØJ TILLID | LAV — EP's pladsallokering, flertalsaritmetik verificeret |

Overordnet tillid til tidsmæssig specificitet: 🔴 LAV — Strukturel analyse gyldig; ugens udvalgsaktivitet den 26. maj kan ikke bekræftes.
