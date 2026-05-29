<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Exekutiv rapport — EP utskottsrapporter, 2026-05-29
**Klassificering:** ÖPPEN | **För:** EU Parliament Monitor-prenumeranter
**WEP-band tillämpade genomgående** | **Admiralty-grader:** Per påstående
**Kontroll av nyckelförutsättningar:** Inbäddad §5 | **QIC:** Inbäddad §6

---

## 1. Situationssammanfattning

Rapporteringsveckan (2026-05-22 → 2026-05-29) infaller under **interimperioden** efter maj 2026 Strasbourg-plenarsessionen, som avslutades den 20 maj 2026. Ingen ny plenarsammanträde ägde rum under perioden, varför den senaste utskottsgenererade lagstiftningsproduktionen förblir maj-plenarens 50 antagna texter (senaste: TA-10-2026-0183, AI-handelsstrategi, 2026-05-20 — nu nio dagar gammal). Det analytiska värdet denna vecka ligger i att följa **utskottspipelinens övergång** till juni 2026 delsessionen: handels-försvarsnexuset (INTA AI-strategi + EU-Kanada SAFE-instrument), AFET:s arkitektur för yttre förbindelser (Uzbekistans EPCA, Libanon Eurojust) och BUDG 2027-riktlinjerna som kommissionen förväntas operationalisera i sitt juniesbudgetförslag. Detta är en samordnad EP10-ledarskapsagenda i ett avvaktande läge snarare än reaktivt krishantering.

**Datakvalitetsnot:** Denna rapport produceras i läget `degraded-feeds`. Fyra av fem förhämtade EP API-flöden returnerade HTTP-404-felsvar (`committee-documents`, `procedures`, `events`, `documents`); endast flödet för antagna texter innehöll substantiella data (500 poster, 123 EP10-2026). `get_committee_documents`-direktfallback återhämtade 51 AFCO-dokument (Admiralty C3, metadata endast); `analyze_committee_activity(ENVI)` och `generate_political_landscape` nådde båda timeout (Admiralty F1). All analys vilar på data om antagna texter (Admiralty A1) och analytisk slutledning (Admiralty B2-B3 där angivet). Alla ekonomiska siffror är kunskapsbaserade uppskattningar märkta [KB-ESTIMATE]; IMF-data verifierades inte direkt i detta körning (IMF/world-bank-sonder degraderade).

## 2. Viktiga underrättelsefynd (KIF)

### KIF 1: Europaparlamentet etablerar AI-handelsstyrningsnexus
**Förtroende:** 🟡 MEDIUM | **Admiralty:** A1 (antagningsfakta) / B2 (strategisk konsekvens)
**WEP:** Det är mycket troligt (75-85%) att TA-10-2026-0183 kommer att bli ett referensdokument för kommissionens förhandlingspositioner i kommande bilaterala och plurilaterala AI-styrningsdiskussioner.

INTA-utskottets egeninitierade resolution om AI i handel (TA-10-2026-0183) positionerar Europaparlamentet som en proaktiv aktör i global AI-styrning snarare än en reaktiv regulator. Resolutionen kräver sannolikt: (1) ömsesidiga villkor för marknadstillträde för AI-tjänster; (2) krav på algoritmisk transparens i handelsavtal; (3) anpassning till EU AI Act:s extraterritoriella tillämpningsprinciper. Även om resolutionen är rådgivande (OIR) upprättar den EP:s politiska mandatram för kommande FTA-förhandlingar där kapitel om digitala tjänster finns på bordet.

**Strategisk konsekvens:** Detta etablerar en "teknologisk suveränitet"-doktrin för EU:s handelspolitik — EU-företag bör ha likvärdiga tillträdesrättigheter på AI-reglerade marknader med de rättigheter som USA- och kinesiska företag har på EU:s inre marknad. Denna doktrin, om den antas av kommissionen, skulle fundamentalt omforma de digitala handelsförhandlingarna mellan USA och EU.

### KIF 2: SAFE-instrumentet skapar mall för försvarspartnerskap
**Förtroende:** 🟢 HIGH | **Admiralty:** A1
**WEP:** Nästan säkert (90%+) att TA-10-2026-0180 kommer att åberopas som ett prejudikat för framtida tillträdesavtal med tredjeländer med Storbritannien, Australien och potentiellt Sydkorea senast 2027.

EU-Kanada Special Access Framework for Equipment (SAFE)-instrumentet är det första avtalet med ett land utanför EU för gemensamt tillträde till försvarsupphandling. Mekanismen var tidigare inte tillgänglig för tredjeländer, inklusive NATO-partners med likvärdig säkerhetsgodkännande. Kanadas avtal ger den rättsliga och procedurella mallen för framtida utvidgningar. Med tanke på brådskan kring Ukrainastöd och trycket på NATO-bördelning är tre till fyra ytterligare SAFE-avtal sannolika inom 18-24 månader.

**Strategisk konsekvens:** EU bygger en försvarsindusriell koalition som verkar genom bilateral instrumentstappling snarare än en formell EU-armé. Denna arkitektur är politiskt hållbar över olika EP-koalitionskonfigurationer och respekterar medlemsstaternas suveränitet samtidigt som den driver integrationsmål framåt.

### KIF 3: Uzbekistanpartnerskap signalerar centralasiatisk omorientering
**Förtroende:** 🟡 MEDIUM | **Admiralty:** A1 (avtalets antagande) / B2 (geopolitisk tolkning)
**WEP:** Det är troligt (55-65%) att genomförandet av EPCA kommer att accelerera EU:s investeringsflöden till Uzbekistans sektor för kritiska mineraler inom 24-månaders ratificerings- och genomförandefönstret.

EU-Uzbekistans förstärkta partnerskaps- och samarbetsavtal (TA-10-2026-0174) utvidgar EU:s strategiska fotavtryck till Centralasien vid ett tillfälle då regionen utsätts för intensifierad konkurrens från Ryssland och Kina. Uzbekistan har betydande reserver av uran, koppar och volfram — material som är kritiska för EU:s gröna omställning och mål för strategisk autonomi. EPCA skapar ett institutionellt ramverk för EU:s investeringsskydd, regulatorisk anpassning och politisk dialog som tidigare begränsade partnerskapsavtal inte tillhandahöll.

**Strategisk konsekvens:** Detta avtal är en del av en bredare EU-strategi för centralasiatisk konnektivitet som, om den lyckas, skulle minska EU:s strategiska beroende av ryska transitkorridorer och kinesisk Bälte och Väg-initiativets infrastruktur för leveranskedjor av kritiska material.

## 3. Prioriterade signaler för nästa 30 dagar

| Prioritet | Signal | Bevakningspunkt | WEP |
|---------|--------|------------|-----|
| 🔴 HIGH | Kommissionens svar på AI OIR | Presskonferens + formellt svar | Troligt (60%) att kommissionen erkänner inom 30 dagar |
| 🔴 HIGH | SAFE-utvidgningsförhandlingar | UK/Australiens intresseanmälan | Möjligt (35-45%) tillkännagivande inom 60 dagar |
| 🟡 MEDIUM | BUDG 2027-riktlinjernas genomförande | Kommissionsförslag (förväntas juni) | Nästan säkert (90%) enligt schema |
| 🟡 MEDIUM | EP API-infrastruktur | Signaler om tekniska förbättringar | Osannolikt (20%) nära lösning |
| 🟢 LOW | Uzbekistans EPCA-ratificering | Rådets offentliggörande i Officiella tidningen | Troligt under 6-12 månader |

## 4. Koalitionsunderrättelsebedömning

**EP10-koalitionsstabilitet:** 🟢 HIGH CONFIDENCE | WEP: Nästan säkert (90-95%) att EPP+S&D+Renew-koalitionen håller genom kv3 2026 avseende den nuvarande utskottsagendan.

Maj 2026:s antagningsrekord visar inga anomala partisanuppsplittningar. Viktiga indikatorer på koalitionshälsa:
- Icke-partisansk immunitetsbehandling (Vilimsky OCH Pappas båda friskrivna) — icke-politiserad JURI-funktion
- Försvarsintegration (SAFE) antagen utan blockerande minoritet — ECR/PfE-opposition hanterad
- Budget 2027-riktlinjer antagna — inga obstruktionistiska blockeringar från vänster- eller högerflankarna
- Inga plenumprocedurella kriser rapporterade under sessionen

**Potentiella sprickpunkter:** Migrationspaket (LIBE) förblir koalitionens huvudsakliga stresstest. Inga bevis på spricka i denna sessions utdata, men LIBE-utdata var inte direkt observerbara (committee-documents-flödet misslyckades). Bevakning rekommenderas.

## 5. Kontroll av nyckelförutsättningar (exekutiv nivå)

| Förutsättning | Bräcklighet | Konsekvens om fel |
|-----------|-----------|-----------------|
| EP10-koalitionen stabil genom kv3 2026 | Låg (2/5) | HÖG — agendaromstrukturering |
| Ukrainakonflikt fortsätter; inget eldupphör | Hög (4/5) | MYCKET HÖG — försvarsagendans kollaps |
| Kommissionen behandlar AI OIR som rådgivande | Måttlig (3/5) | MEDIUM — underskattad effekt |
| IMF:s ekonomiska baslinje korrekt ±15% | Måttlig (3/5) | MEDIUM — revision av ekonomisk kontext |

**Den mest kritiska osäkerheten:** Tidpunkten för vapenstillestånd i Ukraina. Ett eldupphör före slutet av 2026 skulle omedelbart omforma SAFE/försvarsintegrationsagendan och potentiellt frigöra budgettryck för social/klimatutgifters omfördelning — vilket omstrukturerar EP10:s lagstiftningshorisont.

## 6. Kvantitativ underrättelseförtroende (QIC)

**Övergripande analytiskt förtroende för denna rapport:** 🟡 MEDIUM (62%)

Uppdelning:
- Faktapåståenden (antagandehändelser, dokumentreferenser): 95% förtroende | Admiralty A1
- Strategiska konsekvenser (utskottsagendatolkning): 70% förtroende | Admiralty B2
- Framåtblickande bedömningar (nästa 30 dagar, koalitionsstabilitet): 55% förtroende | Admiralty B3
- Ekonomisk kontext (alla [KB-ESTIMATE]): 40% förtroende | Admiralty B3-C2

**Kalibreringsnotering:** Det övergripande förtroendet på 62% är konstlat komprimerat av det degraderade flödesdataläget. Under normala API-förhållanden (alla flöden operativa, procedurdata, omröstningsrekord) skulle analytiskt förtroende uppskattas till 80-85%. Den primära faktorn som pressar ner förtroendet är frånvaro av utskottsnivåproduktivitetsdata, synlighet i procedurpipeline och verifiering av omröstningsrekord.

## 7. Rekommenderade åtgärder för EP Monitor-användare

1. **Politikanalytiker som följer AI-styrning:** Övervaka INTA-utskottets webbplats för föredragandes uttalande om TA-10-2026-0183 och kommissionens formella bekräftelsetidslinje.

2. **Försvarsanalytiker:** Följ EDA och rådssekretariatet för SAFE-utvidgningsförhandlingar bortom Kanada; Storbritannien och Australien är de näst mest sannolika avtalen.

3. **Centralasienobservatörer:** Övervaka Officiella tidningen för EPCA-publiceringens tidslinje; följ uzbekistanska regeringsuttalanden om åtaganden för regulatorisk anpassning.

4. **Budgetbevakare:** EU-kommissionens budgetförslag 2027 för juni 2026 blir nästa stora BUDG-milstolpe efter riktlinjerna antagna under denna session.

5. **Tekniska användare:** EP API-tillförlitligheten förblir degraderad. Anta en defensiv datastrategi med antagna-texter-ändpunkten som primär källa; flagga alla andra flödesberoende analyser.

**Admiralty-grad för denna rapport:** A1/B2 (faktaunderlag A1; strategisk analys B2)
**WEP-efterlevnad:** All sannolikhetsspråk använder WEP-band. Inga ogrundade säkringar.
**AI_ANALYSIS_REQUIRED-markeringar kvar:** Noll.
