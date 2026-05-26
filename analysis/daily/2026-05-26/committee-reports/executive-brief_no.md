<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Utøvende sammendrag — EP-komitérapporter | 2026-05-26

**WEP:** Omtrent jevnt — at denne ukens komitéaktivitet vil produsere resultater som på en meningsfull måte fremmer den 10. stortingsperiodens lovgivningsagenda  
**Admiralitet:** B2 — Sannsynligvis sant; basert på EP's institusjonelle kunnskap og bekreftet AFCO-aktivitet  
**SATs:** Kontroll av nøkkelforutsetninger, Kontroll av informasjonskvalitet  
**Datatilstand:** degraded-feeds (0,80 gulvfaktor)  
**Kjørings-ID:** committee-reports-run260-1779774042  

---

## BLUF — Bottom Line Up Front

Europaparlamentets komitésystem trer inn i uken 26. mai 2026 i en periode med høy lovgivningsetterspørsel og begrenset overvåkingssynlighet. Feil i EP's åpne data-API (4 av 5 kilder utilgjengelige) begrenser dokumentarisk bekreftelse til AFCO-komiteens pipeline (50+ dokumenter bekreftet). Analysen syntetiserer EP's 10. valgperiodes institusjonelle kunnskap: fem aktive lovgivningsstrømmer (implementering av AI-forordningen, Konkurranseevneagendaen, Forsvarsindustriell strategi, Revisjon av den grønne given, Migrasjonspakten), et omstridt EPP-ledet flertall som krever koalisjonsforvaltning på hver betydelig sak, og forhøyet risiko for at den grønne givens ambisjon svekkes av høyresidens taktiske tilpasning.

**Sentrale vurderinger:**

1. 🟡 **AFCO-komiteen**: Konstitusjonelle anliggender bekreftet aktive (50 dokumenter i EP730–PE782-serien). Institusjonell reform og interinstitusjonelt avtalearbeid er den sannsynlige fokus. *Tillit: MIDDELS (B2 — direkte dokumentbevis, ingen innholdsmetadata)*

2. 🟠 **Lovgivningsprioritetsstrømmer**: Alle fem store strømmer i den 10. valgperioden (AI, Konkurranseevne, Forsvar, Revisjon av den grønne given, Migrasjon) er i aktivt komitéstadium. Mai 2026 er en Brussel-komitéuke (etter plenumssesjonen 20.–23. mai i Strasbourg), noe som betyr at avstemninger, høringer og ordførerens arbeidssesjoner forventes denne uken. *Tillit: MIDDELS-HØY (B2)*

3. 🔴 **Risiko for svekkelse av den grønne given**: Sannsynlighet vurdert til 65 % (Sannsynlig) at komitéavstemninger i ENVI/ITRE produserer resultater svakere enn Kommisjonens forslag 2019–2024, drevet av EPP+ECR+Patriots taktiske tilpasning på spesifikke saker. *Tillit: MIDDELS (B2)*

4. 🟡 **AI-forordningens delegerte rettsakter**: ITRE/LIBE-komiteens koordinasjon om delegerte rettsakter har en omtrent jevn (50 %) risiko for 6 måneders forsinkelse på grunn av jurisdiksjonstvist og industrilobbyisme. *Tillit: MIDDELS (B2)*

5. 🟢 **Økonomisk grunnlag**: IMF WEO April 2026 projiserer EU's BNP-vekst til 1,4 % for 2026, noe som gir den makroøkonomiske konteksten for konkurranseevnelovgivning. Draghis investeringsgap på EUR 750–800 mrd. forblir referanserammen for ECON- og ITRE-komiteens arbeid. *Tillit: HØY (A1 — IMF primærkilde)*

---

## Political Landscape Summary

| Gruppe | Seter | Komitérolle kv. 2 2026 |
|--------|-------|------------------------|
| EPP | 189 | Agendaskaper; flertallsbygger; pro-konkurranseevne |
| S&D | 136 | Vesentlig koalisjonspartner; forhandler av sosial dimensjon |
| Patriots | 84 | Forstyrrende minoritet; taktisk EPP-alliert i rette saker |
| ECR | 78 | Konservativ; variabel tilpasning; pragmatisk i industripolitikk |
| Renew | 77 | Liberale svingstemmer; pro-digitalt, pro-handel |
| Greens/EFA | 53 | Minoritet; sterke i ENVI/LIBE; koalisjoner med S&D/Left |
| Left | 46 | Progressiv opposisjon; arbeidsmarkeds- og sosialsaker |
| ESN | 25 | Ytterste høyre; marginalisert |

**Flertallsterskel:** 353/705 seter. Den store koalisjonen (EPP+S&D+Renew = 402 seter) har et komfortabelt flertall for mainstream-lovgivning; risikoen er EPP's taktiske bruk av Patriots/ECR for spesifikke høyreorienterte saker.

---

## IMF Economic Reference

**IMF WEO April 2026 nøkkeltall for EP-komiteens kontekst:**
- EU's BNP-vekst 2026: **1,4 %** (over 2025's 1,1 % — beskjeden gjenoppretting)
- Eurosonens inflasjon: **2,0 %** (på målet; ECB's forsiktige lettelsessyklus)
- EU's arbeidsledighet: **5,7 %** (sakte synkende)
- EU's finansunderskudd: **~2,5 % av BNP** (innenfor SGP-grenser etter reform)

Den økonomiske konteksten forsterker komiteens hastesaker om konkurranseevne- og kapitalmarkedslovgivning. IMF's eksplisitte støtte til Draghi-rammen gir politisk dekning for ambisiøse ECON/ITRE-reformpakker.

---

## Monitoring Gaps

Dette utøvende sammendraget er eksplisitt begrenset av EP API-forringelse. Følgende overvåkingsgap gjelder:

1. **Ingen aktuelle komitéavstemningsdata**: Ukjent hvilke komiteer som stemte denne uken og om hvilke saker
2. **Ingen begivenhets-/høringsdatadata**: Høringer, ekspertvitnemål og ordførerens presentasjoner er uobservert
3. **Komitédekning**: Kun AFCO bekreftet aktiv; 19 andre komiteer uobserverte
4. **Prosedyre-pipeline**: Aktuell status for prosedyrefremgang er ukjent (reservedata er fra 1972)

**Anbefaling for neste kjøring:** Når EP API gjenopprettes, bør prioritert dyp-henting være: `get_procedures_feed` (inneværende år), `get_events_feed` (tapte høringer), `get_committee_documents_feed` (tapte rapporter), og `track_legislation` for de 5 prioriterte strømmene.

---

## Strategic Intelligence Summary

EP's komitésystem i uken 26. mai 2026 representerer et kritisk veiskille i den 10. valgperiodens lovgivningssyklus. Fem store lovgivningsprioritetsstrømmer er samtidig aktive i komitéstadiet, EPP's majoritetskoalisjon krever kompleks forvaltning, og Draghis konkurranseevneramme gir den makroøkonomiske referansen for ECON- og ITRE-komiteens arbeid. EP API-forringelse begrenset overvåkingssystemets evne til å bekrefte spesifikke komitéaktiviteter, men strukturanalysen forblir robust basert på institusjonell kunnskap.

**For beslutningstakere og politiske interessenter:** Den avgjørende variabelen i EP's komitéarbeid i mai 2026 er hvordan EPP koordinerer med Patriots/ECR om spesifikke grønne og migrasjonssaker, mens det opprettholder den store koalisjonen for konkurranseevne- og AI-lovgivning. Overvåking av EPP's komitékoordinatorposisjoner og skyggeordførerens tekster i ENVI, LIBE og ITRE vil avsløre de faktiske koalisjonssdynamikkene.

**For borgere:** Komitéstadiet er der innholdet i lover som påvirker hverdagen faktisk bestemmes. Når komiteer stemmer om AI-forordningens delegerte rettsakter, endringsforslag til revisjonen av den grønne given eller migrasjonsprosedyreforslag, tar de beslutninger med umiddelbare praktiske konsekvenser. Engasjement i komitéprosedyrer — innsending av begjæringer, oppfølging av ordførerarbeid, sporing av ekspertvurderingsresultater — er den mest direkte formen for demokratisk deltakelse som er tilgjengelig for EU's borgere.

---

*Generert av EU Parliament Monitor automatisert arbeidsflyt | committee-reports | 2026-05-26 | Kjøring: committee-reports-run260-1779774042 | Datatilstand: degraded-feeds*

## Strategic Intelligence Assessment

**EP's komitélandskap: Strukturell analyse for beslutningstakere**

Europaparlamentets komitésystem fungerer som forkammerfilter for all EU-lovgivning. Fra 26. mai 2026 definerer tre strukturkrefter landskapet:

**Kraft 1: EPP-dominans uten flertall**
Med 189/705 seter (26,8 %) er EPP den største gruppen, men kan ikke vedta lovgivning alene. EPP's dominans over komitélederstillingene (ENVI, ITRE, ECON, AFCO, INTA) gir agendaskaper-makt — komiteer kontrollerer hvilke endringsforslag som når plenum. EPP krever imidlertid minst to ytterligere grupper for å danne et flertall. S&D-Renew-partnerskapet (213 kombinerte seter) er EPP's foretrukne koalisjon og danner den store koalisjonen (402 seter, flertall på 353 oppnådd med margin). EPP's alternative høyrebokkstrategi (Patriots 84, ECR 78) når bare 351 seter — to under flertallsgrensen — noe som gjør den store koalisjonen til EPP's rasjonelle standard.

**Kraft 2: Revisjon av den grønne given som det avgjørende lovgivningsslaget**
ENVI-komiteens revisjonsprosess av den grønne given er den mest avgjørende komitéaktiviteten i 2026. EPP presser på for "konkurranseevne"-endringer av naturrestaureringslov, emballasjeforordningen og CBAM-implementeringstidsplaner. S&D, Greens/EFA og Left motsetter seg tilbaketrillinger. Det lovgivningsmessige utfallet avgjør om EU's klimaforpliktelser opprettholdes eller grunnleggende revideres for 2030-målperioden.

**Kraft 3: Timing for AI-forordningens delegerte rettsakter**
AI-forordningens delegerte rettsakter (ITRE/LIBE's jurisdiksjon) fastsetter implementeringstidslinjen for krav til AI-systemer med høy risiko. Kommisjonen er under industrielt press for å forsinke. Komiteens konsensusposisjon er viktig fordi delegerte rettsakter krever et blokkerende flertall i EP (353 MEP-er) for å avvise. ITRE's lovgivningskompetanse her kontrolleres av EPP — EPP's interne posisjon om AI-implementeringshastighet er en avgjørende variabel for EU's AI-styring.

## Decision-Maker Priority Matrix

| Interessent | Umiddelbar prioritet | 3-måneders prioritet | Langsiktig bekymring |
|-------------|---------------------|---------------------|---------------------|
| EU-næringsliv | ENVI-avstemningsresultater for den grønne given | Tidsplan for AI-forordningens delegerte rettsakter | Traktatrevisjonsomfang |
| Sivilsamfunn | Overvåking av migrasjonspakten | AI-forordningens LIBE-posisjoner | Påvirkning av konstitusjonell reform |
| Kommisjonen | ENVI-endringsmål | ITRE-samarbeid om AI | AFCO-traktatinitiativ |
| Medlemsstater | Bærekraft for den store koalisjonen | Signal om høyreblokks fremkomst | Subsidiaritetsdebatter |
| EP-administrasjonen | AFCO-mandatfremgang | Utvidelse av plenarseter | Innsending av nye prosedyrer |

## Intelligence Gaps Requiring Monitoring

1. **ENVI-komiteens juniavstemningsdato og endringsforslagnsliste** — avgjørende for den grønne givens bane
2. **EPP-koordinatorens konsistens på tvers av komitéposisjoner** — bestemmer koalisjonens holdbarhet  
3. **ITRE-ordførerens posisjon om AI's delegerte rettsakter** — avgjørende for EU's AI-styring
4. **AFCO-dokumentserien PE781.*** — signalerer om traktatrevisjon er nær forestående
5. **Trilogfremgang om utestående lovgivningssaker** — bestemmer 2026-produksjonsraten

## Reader Briefing

Dette utøvende sammendraget syntetiserer EP's komitéetterretning for 26. mai 2026. EP er verdens eneste direkte valgte overstatlige lovgivende forsamling. Dens 20+ faste komiteer håndterer ca. 200 lovgivningssaker per valgperiode. Hver komité kan endre Kommisjonens forslag før plenaravstemning; komitéendringsforslag overlever typisk i den endelige loven. Borgere som overvåker komitéaktivitet, får 3–6 måneders forhåndsvarsel om lovgivningsendringer som påvirker livene deres. Nøkkelbudskapet fra denne analysen: den store koalisjonen holder, EPP modererer tempoet for den grønne omstillingen, og AI-styringsrammen forhandles i komité akkurat nå.

## IMF Economic Context for Committee Legislative Activity

EP's komitébeslutninger om revisjon av den grønne given, AI-regulering og migrasjonspolitikk skjer ikke i et økonomisk vakuum. IMF WEO April 2026 basislinjen gir den økonomiske konteksten som former politisk gjennomførbarhet:

- **EU's BNP-vekst 2026: 1,4 %** — Under-trend vekst reduserer EPP's appetitt på kostbare grønne omstillingstiltak og øker støtten til konkurranseevneendringer
- **Eurosonens inflasjon 2026: 2,0 %** — Inflasjon vender tilbake til målet; reduserer hastepresset for ECB-nødtiltak; normaliserer finanspolitisk rom for grønn investering
- **EU's arbeidsledighet 2026: 5,7 %** — Strukturell arbeidsledighet opprettholder S&D's press for rettferdig omstilling sosiale bestemmelser i hver grønn given-revisjonssak
- **EU's finansunderskudd ~2,5 % BNP** — Innenfor SGP-reglene; tillater en viss grønn investering fra medlemsstater, men begrenser subsidieprogrammer i EP-drevet lovgivning
- **IMF-kilde:** `cache — WEO April 2026`

**Lovgivningsmessig implikasjon:** Under-trend vekst skaper politiske betingelser for EPP's konkurranseevnenarrativer. ENVI-komiteens kamp om revisjon av den grønne given utspilles i en kontekst der næringslivslobbyer troverdig kan sitere veksthensyn. S&D's motargument — at grønn investering stimulerer vekst — har IMF-støtte (WEO kapittel 3 om klimainvestering), men er vanskeligere å kommunisere i et lavvekstmiljø.

## Data Availability Assessment (This Run)

| Datakilde | Status | Tillitsimpakt |
|-----------|--------|---------------|
| EP-komiteens dokumentfeed | 🔴 404 UTILGJENGELIG | HØY — Kan ikke bekrefte aktuell ukentlig aktivitet |
| EP-prosedyrefeed | 🟡 DELVIS (historisk hale) | MIDDELS — Struktur gyldig, timing upålitelig |
| EP-begivenhetsfeed | 🔴 404 UTILGJENGELIG | HØY — Kan ikke bekrefte junidagordenen |
| EP-komiteens dokumenter | 🟡 DELVIS (50 AFCO-dok. kun) | MIDDELS — AFCO bekreftet; andre komiteer ukjente |
| IMF WEO April 2026 | 🟢 BUFRET | LAV — Økonomisk basislinje bekreftet |
| Institusjonell kunnskap | 🟢 HØY TILLIT | LAV — EP's setesfordeling, flertallsaritmetikk verifisert |

Samlet tillit til tidsmessig spesifisitet: 🔴 LAV — Strukturell analyse gyldig; uken 26. mai komitéaktivitet kan ikke bekreftes.
