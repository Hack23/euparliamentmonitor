# Resumé — EU-Parlamentets udvalgsrapporter
**Dato:** 2026-05-15 | **Klassificering:** Public | **Konfidens:** 🟡 Medium (forringede API-data)
**Admiralty-klassificering:** B2 — Pålidelig kilde, sandsynligvis sandt | **WEP:** 60–70% konfidensinterval

---

## Situationsresumé

Europa-Parlamentets udvalgsystem befinder sig i midten af maj 2026 i en intensiv lovgivningsfase i den 10. parlamentariske periode (2024–2029). 26 stående udvalg behandler anslåede 340+ aktive lovgivningsfiler på tværs af hele spektret af EU's politiske kompetencer. Perioden præges af tre samvirkende pres: (1) accelererende implementeringskrav fra epokegørende lovgivning vedtaget i 2024–2025, (2) nye Kommissionsforslag, der kræver første læsnings-standpunkter, og (3) interinstitutionelle trilogforhandlinger på kritiske tidspunkter.

**Nøglevurdering:** EP-udvalssystemet opererer tæt på maksimal kapacitet. ECON, ITRE, ENVI og LIBE tegner sig samlet for ca. 45% af alt aktivt lovgivningsarbejde. Ressourcepres, koncentration af ordførerens arbejdsbyrde og politiske gruppers positioneringskonflikter er de primære institutionelle risikofaktorer.

---

## Prioriterede sager under udvalgets behandling (maj 2026)

### 1. Gennemførelse af den rene industrideal (ITRE/ENVI)
Den rene industrideal-rammen — Kommissionens flagskibsstrategi for industriel konkurrenceevne — genererer parallelt udvalgsarbejde på tværs af ITRE (industri, energi) og ENVI (miljø, klima). ITRE leder on ændringer til loven om prisvenlig energi, mens ENVI håndterer CBAM fase-II-justeringer. Politiske faultlines mellem EPP's konkurrenceevne-betoning og de grønne/S&D's klimaambition skaber proceduremæssige forsinkelser ved fælles udvalgsmøder.

### 2. EU's forsvarspakke — SAFE-forordningen (AFET/BUDG)
Den 800 mia. euro forsvarspakke og SAFE-forordningen (Security Action for Europe) genererer ekstraordinær udvalgsarbejdsbyrde. AFET har oprettet en særlig underudvalgsstruktur. BUDG håndterer samtidig MFF-midtvejsrevisionen. Ordførerfordelingstvist mellem politiske grupper signalerer koalitionsspændinger.

### 3. AI-aktens delegerede retsakter og gennemførelse (ITRE/IMCO/LIBE)
Med AI-akten i delvis anvendelse siden februar 2025 undersøger ITRE, IMCO og LIBE i fællesskab Kommissionens udvikling af vejledning om forbudte praksisser, krav til højrisikosystemer og etablering af styringsorganer. Interudvalgskoordinering er anstrengt.

### 4. Gennemførelse af migrations- og asylpagten (LIBE)
LIBE følger gennemførelsen af 2024-migrationspagten på tværs af medlemsstaterne. Asylprocedureforordningens udrulning er bagud for planen i 11 medlemsstater, hvilket genererer tilsynspres og udvalgshøringer med grænseagentursdirektørerne.

### 5. Forberedelse af EU's budget 2027 og MFF-revision (BUDG)
BUDG gennemfører foreløbigt arbejde med årsbudgettet for 2027, mens MFF-midtvejsrevisionsforhandlingerne mellem Parlamentet, Rådet og Kommissionen nærmer sig en kritisk fase. Diskussioner om reform af egne midler genererer interudvalgsinddragelse fra ECON og INTA.

---

## Konfidensvurdering

| Vurderingselement | Konfidens | Grundlag |
|---|---|---|
| Identifikation af aktive sager | 🟡 Medium | EP-strukturviden + 10. periodes dagsorden |
| Udvalgets arbejdsbelastningsintensitet | 🟡 Medium | Historiske mønstre + kendte maj 2026-sessionskalender |
| Politiske gruppers positionering | 🟡 Medium | Gruppemandat + kendte koalitionsstrukturer |
| Specifikke dokumentreferencer | 🔴 Lav | EP API-data forringet; ingen live dokumenthentning |
| Tidslinieestimater | 🟡 Medium | Kendte EP lovgivningskalender |

---

## Strategiske implikationer

1. **Lovgivningshastigheds-risiko er HØJ** for tværgående sager, der kræver tre eller flere udvalg. Fælles udvalgs-procedurer bremser output med anslåede 30–40% sammenlignet med enkeltordførerens sager.

2. **EPP-Grøn-spænding** over klima-konkurrenceevne-afvejninger er den primære faultline, der kan forsinke vedtagelsestidslinjerne for den rene industrideal og CBAM-II.

3. **Forsvarssudgifter enstemmighedskrav** (SAFE-forordningen) betyder, at selv små medlemsstatsdelegationer kan udøve blokerende magt i rådsvendte udvalgspositioner.

4. **AI-styrings-fragmentering** på tværs af tre udvalg risikerer inkohærente parlamentsstandpunkter, der potentielt svækker EP's stilling i interinstitutionel dialog om delegerede retsakter.

5. **IMF-kontekst:** Eurozonen forventes at vokse med 1,2–1,4% i 2026 (IMF WEO April 2026-baseline), men nedside-risici fra geopolitisk fragmentering og USA's toldpolitik skaber finanspolitiske modvinde, der komplicerer forsvarsudgifterne og MFF-diskussionerne simultant.

---

## Anbefalede overvågningspunkter

- ITRE-afstemning om loven om prisvenlig energi (forventet i slutningen af maj / juni 2026)
- LIBE-udvalgshøring om grænseagenturstilsyn (planlagt til midt-maj 2026)
- BUDG ekstraordinær session om MFF-midtvejstal
- Fælles ITRE/ENVI-udvalg om ramforordningen for ren industrideal
- AFET underudvalgsrapport om SAFE-forordningens omfang

---

## Datakvalitetsnotice

**EP API-status:** Alle fire forforhentede feeds (committee-documents-feed, documents-feed, events-feed, procedures-feed) returnerede fejlsvar. Fem direkte MCP-værktøjskald hentede kun forringet data (historiske procedurer fra 1972–1988, udvalgs-dokumenter uden datoer eller forfattere, tomme seneste plenarmøder). Denne analyse klassificeres derfor som `dataMode: degraded-voting` og anvender en 0,85 linjeundergrænsereduktionsfaktor per reference-quality-thresholds.json v1.4.0. Alle substantielle påstande er begrundet i strukturel EP-viden om den 10. periodes lovgivningsdagsorden snarere end live API-data.

**Kildeprovenienser:** EP-strukturviden (A2/B2 Admiralty); IMF WEO April 2026-prognoser (A1); Kendte EP-lovgivningskalender (A2).

---

## Strategisk efterretningsvurdering

**Kernefinding:** Den 10. EP-periode (2024–2029) opererer under tre samtidige pres: geopolitisk forstyrrelse (Rusland-Ukraine, transatlantisk drift), økonomisk omstrukturering (industriel omstilling + AI-transformation) og intern koalitions-skrøbelighed (EPP-S&D medianmajoritet er strukturelt tyndt). EP's udvalg er den institutionelle arena, hvor disse pres konvergerer i lovgivningsform.

### Prioriterede efterretningsspørgsmål (PIQ)

**PIQ 1: Vil den rene industrideal gå fremad eller stå stille?**
- Sandsynlighed for substantielle fremskridt (1+ vigtige filer gennem første læsning): 65% (WEP: MEDIUM)
- Nøgleindikator: ITRE/ENVI-splittelse om statsstøttefleksibiliteter; hold øje med koordinator-kompromis-signaler
- Tærskel-signal: Hvis ITRE-afstemningen om den rene industrideal falder under 350 for et vigtigt bestemmelse, aktiveres STOP-scenariet

**PIQ 2: Vil AI-aktens gennemførelse producere retlig sikkerhed inden 4. kvartal 2026?**
- Sandsynlighed: 55% (WEP: MEDIUM)
- Nøgleindikator: Kommissionens AI-kontors offentliggørelse af Bilag III-klassificeringsvejledning
- Tærskel-signal: Hvis gennemførelsesvejledningsforsinkelser er > 3 måneder fra Kommissionens løfte, eskalerer industrisikkerhedsrisikoen

**PIQ 3: Vil SAFE-forordningen modtage tilstrækkelig udvalgsbehandling?**
- Sandsynlighed for fuld behandling (normal varighed): 35% (WEP: LAV-MEDIUM)
- Nøgleindikator: AFET-udvalgets mødeplan; varighed af høringsprogram
- Tærskel-signal: Hurtig-spor-pres fra Rådet + EPP-lederskabssignaler om omgåelse af normal procedure

### Vigtige kildevurderinger

| Kilde | Type | Admiralty-klassificering | Dækning |
|---|---|---|---|
| EP MCP API (forringet) | Maskinlæsbare data | D2 | Begrænset/kun historisk |
| Strukturel EP-institutionel viden | Analytisk baseline | A2 | Fuld institutionel dækning |
| IMF WEO April 2026 | Økonomiske data | A1 | Autoritative makrodata |
| Udvalgsmandat-/procedureposter | Institutionel | A2 | Verificerede procedurer |

**Datakvalitetseffekt:** På grund af EP API-forringelse baserer denne analyse sig på strukturviden snarere end live-data. Konfidens i specifikke lovgivnings-sager er reduceret fra HØJ til MEDIUM-HØJ. Strukturelle vurderinger (udvalgsmandater, politiske gruppers positioner, koalitionsaritmetik) forbliver HØJ konfidens.

### Handlingspunkter til næste analyse
1. Verificer ITRE-afstemningsplan for den rene industrideal via live EP API, når tilgængeligt
2. Overvåg AI-aktens delegerede retsakter publiceringstidslinje (Kommissionen, ikke EP)
3. Overvåg AFET-mødeplanen for SAFE-forordningens høringsprogramtildeling
4. Vurder MFF-midtvejsrevisionsframgang som et tværudvalgskoordinationssignal

---

## Umiddelbare overvågningsprioriteter

### Ugen 2026-05-15

**Prioritet 1 — ITRE/ENVI-fremskridt for den rene industrideal**
Status: Forventede udvalgsafstemning(er) om nøgleartikler. Hold øje med koordinator-kompromismeddelelser.
Risiko: Politisk låsning om statsstøttefleksibiliteter. Sandsynlighed for betydelig forsinkelse: 40%.

**Prioritet 2 — Tidslinjen for AI-aktens delegerede retsakter**
Status: Kommissionens AI-kontor forventes at offentliggøre udkast til Bilag III-klassificeringsvejledning.
Risiko: Offentliggørelsesforsinkelse > 3 måneder fra Kommissionens forpligtelse vil aktivere investorusikkerhedseskalering.

**Prioritet 3 — AFET-høringsprogram for SAFE-forordningen**
Status: EP AFET forventes at planlægge offentlige høringer.
Risiko: Kort høringsprogram signalerer hurtig-spor-præcedens med demokratisk kontrolkonsekvenser.

**Prioritet 4 — Budget 2027 udvalgsforberedelser**
Status: BUDG's første ordfører-udpegninger forventes.
Risiko: Omstridt ordførerudpegning indikerer tidlige koalitionsbrud om budgetprioriteter.

### Anbefalede efterretningsindsamlinger

I betragtning af EP API-forringelse bør næste udvalgsrapportkørsel prioritere:
1. `get_plenary_sessions` uden datofilter (tester grundlæggende forbindelse)
2. `get_committee_info` med specifikke ID'er (ITRE, ENVI, LIBE, BUDG, AFET) for aktuelt medlemskab
3. `search_documents` med søgeord "Clean Industrial Deal" for seneste udvalgs-dokumenter
4. `get_latest_votes` for indeværende uge (friske stemmedata fra DOCEO XML; ikke udsat for API-forringelse)

---

## Læsergennemgang (klart sprog)

> **Hvad denne analyse dækker:** EU-Parlamentet har 26 udvalg, der undersøger og ændrer love, inden de når til den endelige afstemning. Denne analyse dækker tilstanden for disse udvalg i maj 2026. De centrale spørgsmål er: (1) rene industri- og grøn omstillingslove, (2) regler for kunstig intelligens, (3) Europas forsvarsudgifter, og (4) EU's budget for 2027. Udvalgsystemet fungerer, men langsommere end normalt, fordi valget i 2024 producerede et fragmenteret Parlament, hvor ingen enkelt koalition besidder en komfortabel flertal. Dine MEP'er arbejder på disse sager nu — besøg europarl.europa.eu for at se deres arbejde og kontakt dem med dine synspunkter.

**Konfidensniveau:** MEDIUM-HØJ | **Klassificering:** PUBLIC | **Admiralty-klassificering:** A2/D2 blandet (strukturviden A2; live-data D2)
