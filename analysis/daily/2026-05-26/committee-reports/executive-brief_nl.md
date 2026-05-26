<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Uitvoerend briefingdocument voor besluitvormers — EP-commissierapporten | 2026-05-26

**WEP:** Ongeveer gelijk — dat de commissieactiviteiten van deze week resultaten zullen opleveren die de wetgevingsagenda van de 10e zittingsperiode zinvol vooruit helpen  
**Admiraliteit:** B2 — Waarschijnlijk waar; gebaseerd op institutionele kennis van het EP en bevestigde AFCO-activiteit  
**SATs:** Verificatie van kernveronderstellingen, Controle informatiekwaliteit  
**Gegevensmodus:** degraded-feeds (vloerfactor 0,80)  
**Uitvoerings-ID:** committee-reports-run260-1779774042  

---

## BLUF — Bottom Line Up Front

Het commissiestelsel van het Europees Parlement treedt de week van 26 mei 2026 in een periode van hoge wetgevingsvraag met beperkte toezichtzichtbaarheid. API-storingen bij de open data van het EP (4 van de 5 bronnen niet beschikbaar) beperken de documentaire bevestiging tot de pipeline van de AFCO-commissie (meer dan 50 documenten bevestigd). De analyse synthetiseert de institutionele kennis van de 10e zittingsperiode van het EP: vijf actieve wetgevingsstromen (implementatie van de AI-verordening, Concurrentievermogenagenda, Defensie-industriële strategie, Herziening van de Green Deal, Migratiepact), een betwiste EPP-geleide meerderheid die coalitiemanagement vereist voor elk significant dossier, en een verhoogd risico dat de ambitie van de Green Deal wordt verzwakt door tactische afstemming van de rechtervleugel.

**Kernbeoordelingen:**

1. 🟡 **AFCO-commissie**: Constitutionele zaken bevestigd actief (50 documenten in de EP730–PE782-serie). Institutionele hervorming en interinstitutioneel overeenkomstenwerk is de waarschijnlijke focus. *Vertrouwen: MIDDEL (B2 — direct documentair bewijs, geen inhoudsmetadata)*

2. 🟠 **Wetgevingsprioriteitstromen**: Alle vijf grote stromen van de 10e zittingsperiode (AI, Concurrentievermogen, Defensie, Herziening Green Deal, Migratie) zijn actief in de commissiefase. Mei 2026 is een Brusselse commissieweek (na de plenaire vergadering van 20–23 mei in Straatsburg), wat betekent dat stemmen, hoorzittingen en werksessies van rapporteurs deze week worden verwacht. *Vertrouwen: MIDDEL-HOOG (B2)*

3. 🔴 **Risico verzwakking Green Deal**: Waarschijnlijkheid op 65 % (Waarschijnlijk) ingeschat dat commissiestemmen in ENVI/ITRE resultaten opleveren die zwakker zijn dan de Commissievoorstellen 2019–2024, aangedreven door tactische afstemming van EPP+ECR+Patriots op specifieke dossiers. *Vertrouwen: MIDDEL (B2)*

4. 🟡 **Gedelegeerde handelingen AI-verordening**: De coördinatie van de ITRE/LIBE-commissie over gedelegeerde handelingen heeft een ongeveer gelijk (50 %) risico op een vertraging van 6 maanden door bevoegdheidsgeschillen en industrielobby. *Vertrouwen: MIDDEL (B2)*

5. 🟢 **Economische basis**: IMF WEO april 2026 projecteert de EU-bbp-groei op 1,4 % voor 2026, wat de macroeconomische context levert voor wetgeving over concurrentievermogen. De Draghi-investeringskloof van EUR 750–800 miljard blijft het referentiekader voor het werk van de ECON- en ITRE-commissies. *Vertrouwen: HOOG (A1 — IMF primaire bron)*

---

## Political Landscape Summary

| Groep | Zetels | Commissierol K2 2026 |
|-------|--------|----------------------|
| EPP | 189 | Agenda-setter; meerderheidsbouwer; pro-concurrentievermogen |
| S&D | 136 | Essentiële coalitiepartner; onderhandelaar sociale dimensie |
| Patriots | 84 | Ontwrichtende minderheid; tactische EPP-bondgenoot op juiste dossiers |
| ECR | 78 | Conservatief; variabele afstemming; pragmatisch in industriebeleid |
| Renew | 77 | Liberale zwaaistemen; pro-digitaal, pro-handel |
| Greens/EFA | 53 | Minderheid; sterk in ENVI/LIBE; coalities met S&D/Left |
| Left | 46 | Progressieve oppositie; arbeidsmarkt- en sociale dossiers |
| ESN | 25 | Uiterst rechts; gemarginaliseerd |

**Meerderheidsdrempel:** 353/705 zetels. De Grote Coalitie (EPP+S&D+Renew = 402 zetels) heeft een comfortabele meerderheid voor reguliere wetgeving; het risico is EPP's tactisch gebruik van Patriots/ECR voor specifieke rechtse dossiers.

---

## IMF Economic Reference

**Sleutelfiguren IMF WEO april 2026 voor EP-commissiecontext:**
- EU-bbp-groei 2026: **1,4 %** (boven de 1,1 % van 2025 — bescheiden herstel)
- Inflatie eurozone: **2,0 %** (op streefwaarde; voorzichtige versoepelingscyclus ECB)
- EU-werkloosheid: **5,7 %** (langzaam dalend)
- EU-begrotingstekort: **~2,5 % van het bbp** (binnen SGP-grenzen na hervorming)

De economische context versterkt de urgentie van de commissie voor wetgeving over concurrentievermogen en kapitaalmarkten. IMF's expliciete steun voor het Draghi-kader biedt politieke dekking voor ambitieuze ECON/ITRE-hervormingspakketten.

---

## Monitoring Gaps

Dit uitvoerend briefingdocument is uitdrukkelijk beperkt door EP API-degradatie. De volgende toezichtslacunes zijn van toepassing:

1. **Geen actuele commissiestemmingsgegevens**: Onbekend welke commissies deze week over welke dossiers hebben gestemd
2. **Geen gegevens over evenementen/hoorzittingen**: Hoorzittingen, getuigenissen van deskundigen en presentaties van rapporteurs zijn niet geobserveerd
3. **Commissiedekking**: Alleen AFCO bevestigd actief; 19 andere commissies niet geobserveerd
4. **Procedurepipeline**: Huidige status van procedurevoortgang is onbekend (reservegegevens dateren uit 1972)

**Aanbeveling voor de volgende uitvoering:** Wanneer de EP API is hersteld, moet de prioritaire diepte-ophaling zijn: `get_procedures_feed` (lopend jaar), `get_events_feed` (gemiste hoorzittingen), `get_committee_documents_feed` (gemiste rapporten), en `track_legislation` voor de 5 prioritaire stromen.

---

## Strategic Intelligence Summary

Het commissiestelsel van het EP in de week van 26 mei 2026 vertegenwoordigt een kritiek keerpunt in de wetgevingscyclus van de 10e zittingsperiode. Vijf grote wetgevingsprioriteitstromen zijn gelijktijdig actief in de commissiefase, de meerderheidcoalitie van het EPP vereist complex management, en het Draghi-concurrentievermogenskader levert de macroeconomische referentie voor het werk van de ECON- en ITRE-commissies. EP API-degradatie beperkte het vermogen van het bewakingssysteem om specifieke commissieactiviteiten te bevestigen, maar de structurele analyse blijft robuust op basis van institutionele kennis.

**Voor besluitvormers en politieke belanghebbenden:** De sleutelvariabele in het commissiewerk van het EP in mei 2026 is hoe EPP coördineert met Patriots/ECR op specifieke groene en migratiedossiers terwijl het de Grote Coalitie voor concurrentievermogen en AI-wetgeving handhaaft. Het bijhouden van de posities van EPP-commissiecoördinatoren en schaduwrapporteurteksten in ENVI, LIBE en ITRE zal de werkelijke coalitiedynamieken onthullen.

**Voor burgers:** De commissiefase is waar de inhoud van wetten die het dagelijks leven beïnvloeden daadwerkelijk wordt bepaald. Wanneer commissies stemmen over gedelegeerde handelingen van de AI-verordening, amendementen op de herziening van de Green Deal of voorstellen voor migratieprocedures, nemen zij beslissingen met onmiddellijke praktische gevolgen. Betrokkenheid bij commissieprocedures — het indienen van verzoekschriften, het volgen van rapporteurwerk, het bijhouden van de resultaten van experthoorzittingen — is de meest directe vorm van democratische participatie die beschikbaar is voor EU-burgers.

---

*Gegenereerd door EU Parliament Monitor geautomatiseerde workflow | committee-reports | 2026-05-26 | Uitvoering: committee-reports-run260-1779774042 | Gegevensmodus: degraded-feeds*

## Strategic Intelligence Assessment

**EP-commissielandschap: Structurele analyse voor besluitvormers**

Het commissiestelsel van het Europees Parlement fungeert als voorkamerfilter voor alle EU-wetgeving. Vanaf 26 mei 2026 definiëren drie structurele krachten het landschap:

**Kracht 1: EPP-dominantie zonder meerderheid**
Met 189/705 zetels (26,8 %) is EPP de grootste groep maar kan geen wetgeving alleen aannemen. EPP's dominantie over commissievoorzitterschappen (ENVI, ITRE, ECON, AFCO, INTA) geeft het agenda-settende macht — commissies bepalen welke amendementen het plenaire debat bereiken. EPP heeft echter minstens twee extra groepen nodig om een meerderheid te vormen. Het S&D-Renew-partnerschap (213 gecombineerde zetels) is EPP's voorkeurscoalitie, die de Grote Coalitie vormt (402 zetels, meerderheid van 353 bereikt met marge). EPP's alternatieve rechtsblokstrategie (Patriots 84, ECR 78) bereikt slechts 351 zetels — twee onder de meerderheidsdrempel — waardoor de Grote Coalitie EPP's rationele standaard wordt.

**Kracht 2: Herziening van de Green Deal als de beslissende wetgevingsstrijd**
Het herzieningsproces van de Green Deal van de ENVI-commissie is de meest ingrijpende commissieactiviteit in 2026. EPP dringt aan op 'concurrentievermogen'-wijzigingen van de Natuurherstelwet, de Verpakkingsverordening en de CBAM-implementatietijdschema's. S&D, Greens/EFA en Left verzetten zich tegen terugdraaien. De wetgevingsuitkomst bepaalt of de EU-klimaatengagementen worden gehandhaafd of fundamenteel herzien voor de doelperiode 2030.

**Kracht 3: Timing van gedelegeerde handelingen AI-verordening**
De gedelegeerde handelingen van de AI-verordening (ITRE/LIBE-bevoegdheid) stellen het implementatietijdschema vast voor vereisten voor AI-systemen met een hoog risico. De Commissie staat onder industriële druk om te vertragen. De consensuspositie van de commissie is belangrijk omdat gedelegeerde handelingen een blokkeringsmeerderheid in het EP (353 MEP's) vereisen om te worden afgewezen. ITRE's wetgevende bevoegdheid hier wordt gecontroleerd door EPP — EPP's interne positie over de implementatiesnelheid van AI is een beslissende variabele voor EU-AI-governance.

## Decision-Maker Priority Matrix

| Belanghebbende | Onmiddellijke prioriteit | Prioriteit 3 maanden | Langetermijnzorg |
|----------------|-------------------------|---------------------|-----------------|
| EU-bedrijfsleven | ENVI-stemresultaten Green Deal | Tijdschema gedelegeerde handelingen AI-verordening | Reikwijdte verdragsherziening |
| Maatschappelijk middenveld | Toezicht Migratiepact | AI-verordening LIBE-posities | Impact constitutionele hervorming |
| Commissie | ENVI-wijzigingsdoelen | ITRE-samenwerking bij AI | AFCO-verdragsinitiatief |
| Lidstaten | Duurzaamheid Grote Coalitie | Signaal opkomst rechtsblok | Subsidiariteitsdebats |
| EP-administratie | AFCO-mandaatvoortgang | Uitbreiding plenaire zetels | Indiening nieuwe procedures |

## Intelligence Gaps Requiring Monitoring

1. **ENVI-commissie junistemdatum en amendementslijst** — beslissend voor de richting van de Green Deal
2. **Consistentie EPP-coördinator in cross-commissieposities** — bepaalt coalitieduurzaamheid  
3. **Positie ITRE-rapporteur over gedelegeerde handelingen AI** — beslissend voor EU-AI-governance
4. **AFCO-documentenserie PE781.*** — signaleert of verdragsherziening nakende is
5. **Trilogsvoortgang bij uitstaande wetgevingsdossiers** — bepaalt productiesnelheid 2026

## Reader Briefing

Dit uitvoerend briefingdocument synthetiseert EP-commissie-inlichtingen voor 26 mei 2026. Het EP is het enige rechtstreeks gekozen supranationale wetgevende orgaan ter wereld. Zijn meer dan 20 vaste commissies behandelen circa 200 wetgevingsdossiers per zittingsperiode. Elke commissie kan Commissievoorstellen amenderen vóór de plenaire stemming; commissieamendementen overleven doorgaans in de definitieve wet. Burgers die commissieactiviteiten bijhouden, krijgen 3–6 maanden voorafgaande waarschuwing over wetgevingswijzigingen die hun leven beïnvloeden. De kernboodschap van deze analyse: de Grote Coalitie houdt stand, EPP matig het tempo van de groene transitie, en het AI-governance-kader wordt momenteel in de commissie onderhandeld.

## IMF Economic Context for Committee Legislative Activity

EP-commissiebeslissingen over de herziening van de Green Deal, AI-regulering en migratiebeleid vinden niet plaats in een economisch vacuüm. De basisreferentie IMF WEO april 2026 levert de economische context die de politieke haalbaarheid bepaalt:

- **EU-bbp-groei 2026: 1,4 %** — Onder-trendgroei vermindert EPP's bereidheid voor kostbare groene transitiemaatregelen en vergroot steun voor concurrentievermogensamendementen
- **Inflatie eurozone 2026: 2,0 %** — Inflatie terugkerend naar streefwaarde vermindert urgentie voor ECB-noodmaatregelen; normaliseert begrotingsruimte voor groene investeringen
- **EU-werkloosheid 2026: 5,7 %** — Structurele werkloosheid handhaaft S&D's druk voor rechtvaardige transitie sociale bepalingen in elk Green Deal herzieningsdossier
- **EU-begrotingstekort ~2,5 % bbp** — Binnen SGP-regels; maakt enige groene investering door lidstaten mogelijk maar beperkt subsidieprogramma's in EP-gedreven wetgeving
- **IMF-bron:** `cache — WEO April 2026`

**Wetgevingsimplicatie:** Onder-trendgroei creëert politieke condities voor EPP's concurrentievermogensnarratief. De strijd van de ENVI-commissie over de herziening van de Green Deal speelt zich af in een context waarbij bedrijfslobbys geloofwaardig groeizorgen kunnen aanvoeren. S&D's tegenargument — dat groene investeringen de groei stimuleren — heeft IMF-steun (WEO Hoofdstuk 3 over klimaatinvesteringen) maar is moeilijker te communiceren in een laaggroei-omgeving.

## Data Availability Assessment (This Run)

| Gegevensbron | Status | Impact op vertrouwen |
|--------------|--------|---------------------|
| EP-commissiedocumentenvoer | 🔴 404 NIET BESCHIKBAAR | HOOG — Kan huidige weekactiviteiten niet bevestigen |
| EP-procedurenvoer | 🟡 GEDEELTELIJK (historische staart) | MIDDEL — Structuur geldig, timing onbetrouwbaar |
| EP-evenementenvoer | 🔴 404 NIET BESCHIKBAAR | HOOG — Kan agenda juni niet bevestigen |
| EP-commissiedocumenten | 🟡 GEDEELTELIJK (50 AFCO-doc. alleen) | MIDDEL — AFCO bevestigd; andere commissies onbekend |
| IMF WEO april 2026 | 🟢 GECACHED | LAAG — Economische basisreferentie bevestigd |
| Institutionele kennis | 🟢 HOOG VERTROUWEN | LAAG — EP-zetelsverdeling, meerderheidrekensommen geverifieerd |

Algeheel vertrouwen in temporele specificiteit: 🔴 LAAG — Structurele analyse geldig; commissieactiviteiten in de week van 26 mei kunnen niet worden bevestigd.
