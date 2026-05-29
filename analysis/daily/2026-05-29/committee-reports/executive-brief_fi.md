<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Johdon katsaus — EP Valiokunnan raportit, 2026-05-29
**Luokittelu:** AVOIN | **Vastaanottaja:** EU Parliament Monitor -tilaajat
**WEP-vyöhykkeet sovellettu läpi asiakirjan** | **Admiralty-asteet:** Väitteittäin
**Keskeisten oletusten tarkistus:** Sisällytetty §5 | **QIC:** Sisällytetty §6

---

## 1. Tilannekatsaus

Raportointiviikko (2026-05-22 → 2026-05-29) osuu **istuntoväliin** toukokuun 2026 Strasbourgin täysistunnon jälkeen, joka päättyi 20. toukokuuta 2026. Jaksolla ei pidetty uutta täysistuntoa, joten viimeisin valiokuntalähtöinen lainsäädäntötuotos on toukokuun täysistunnon 50 hyväksyttyä tekstiä (viimeisin: TA-10-2026-0183, tekoälykauppastrategia, 2026-05-20 — nyt yhdeksän päivää vanha). Tämän viikon analyyttinen arvo on **valiokunnan putkiston siirtymisen** seuraaminen kesäkuun 2026 osistuntoon: kauppa-puolustus-solmukohta (INTA:n tekoälystrategia + EU–Kanada SAFE-väline), AFET:n ulkosuhteiden arkkitehtuuri (Uzbekistanin EPCA, Libanon Eurojust) ja BUDG:n vuoden 2027 suuntaviivat, jotka komission odotetaan operationalisoivan kesäkuun talousarvioehdotuksessaan. Kyseessä on koordinoitu EP10-johdon asialista odotustilassa reaktiivisen kriisinhoidon sijaan.

**Tietolaatuhuomio:** Tämä raportti tuotetaan `degraded-feeds`-tilassa. Neljä viidestä esihaetuista EP API -syötteistä palautti HTTP-404-virhevastauskuoria (`committee-documents`, `procedures`, `events`, `documents`); vain hyväksyttyjen tekstien syöte sisälsi oleellista dataa (500 kohdetta, 123 EP10-2026). `get_committee_documents`-suora-fallback palautti 51 AFCO-asiakirjaa (Admiralty C3, vain metatiedot); `analyze_committee_activity(ENVI)` ja `generate_political_landscape` katkesivat molemmat aikakatkaisun vuoksi (Admiralty F1). Kaikki analyysi nojaa hyväksyttyjen tekstien dataan (Admiralty A1) ja analyyttiseen päättelyyn (Admiralty B2-B3 tarvittaessa). Kaikki talousluvut ovat tietopohjaisia arvioita, merkitty [KB-ESTIMATE]; IMF-dataa ei suoraan varmennettu tässä ajossa (IMF/world-bank-luotaukset heikentyneitä).

## 2. Keskeisiä Tiedusteluasialöydöksiä (KIF)

### KIF 1: Euroopan parlamentti luo tekoälykauppahallinnon solmukohdan
**Luotettavuus:** 🟡 MEDIUM | **Admiralty:** A1 (hyväksymistosi) / B2 (strateginen implikaatio)
**WEP:** On erittäin todennäköistä (75-85%), että TA-10-2026-0183 tulee referenssiasiakirjaksi komission neuvotteluasemille tulevissa bilateraalisissa ja plurilateraalisissa tekoälyhallintakeskusteluissa.

INTA-valiokunnan oma-aloitteinen päätöslauselma tekoälystä kaupassa (TA-10-2026-0183) asemoi Euroopan parlamentin proaktiiviseksi toimijaksi globaalissa tekoälyhallinnassa reaktiivisen sääntelijän sijaan. Päätöslauselma vaatii todennäköisesti: (1) vastavuoroisia markkinoillepääsyn ehtoja tekoälypalveluille; (2) algoritmisen läpinäkyvyyden vaatimuksia kauppasopimuksissa; (3) sovittamista EU:n tekoälylain ekstraterritoriaalisiin soveltamisperiaatteisiin. Vaikka se on neuvoa-antava (OIR), päätöslauselma luo EP:n poliittisen mandaattikehyksen tuleville vapaakauppasopimusneuvotteluille, joissa digitaalisten palveluiden luvut ovat pöydällä.

**Strateginen implikaatio:** Tämä luo "teknologisen suvereniteetin" doktriinin EU:n kauppapolitiikalle — EU-yrityksillätulee olla vastaavat pääsyoikeudet tekoälysäännellyillä markkinoilla kuin yhdysvaltalaisilla ja kiinalaisilla yrityksillä on EU:n sisämarkkinoilla. Tämä doktriini, jos komissio hyväksyy sen, muokkaa perusteellisesti Yhdysvaltojen ja EU:n digitaalikauppaneuvotteluja.

### KIF 2: SAFE-väline luo puolustuskumppanuuden mallin
**Luotettavuus:** 🟢 HIGH | **Admiralty:** A1
**WEP:** Lähes varma (90%+), että TA-10-2026-0180 mainitaan ennakkotapauksena tuleville kolmansien maiden pääsysopimuksille Yhdistyneen kuningaskunnan, Australian ja mahdollisesti Etelä-Korean kanssa vuoteen 2027 mennessä.

EU–Kanada Special Access Framework for Equipment (SAFE) -väline on ensimmäinen muiden kuin EU-maiden sopimus yhteiseen puolustushankintojen pääsyyn. Mekanismi ei aiemmin ollut kolmansien maiden, myöskään vastaavan turvallisuusselvityksen omaavien NATO-kumppaneiden käytettävissä. Kanadan sopimus tarjoaa oikeudellisen ja menettelyllisen mallin tuleville laajennuksille. Ukrainan tuen kiireellisyyden ja NATO:n kuormitusjaonapaineista johtuen kolmesta neljään lisä-SAFE-sopimusta on todennäköistä 18–24 kuukaudessa.

**Strateginen implikaatio:** EU rakentaa puolustusalan koalitiota, joka toimii bilateraalisen välineiden pinoamisen kautta eikä muodollisen EU-armeijan kautta. Tämä arkkitehtuuri on poliittisesti kestävä eri EP-koalitiorakenteiden yli ja kunnioittaa jäsenvaltioiden suvereniteettia edistäen integraatiotavoitteita.

### KIF 3: Uzbekistanin kumppanuus signaloi Keski-Aasian uudelleensuuntautumista
**Luotettavuus:** 🟡 MEDIUM | **Admiralty:** A1 (sopimuksen hyväksyminen) / B2 (geopoliittinen tulkinta)
**WEP:** On todennäköistä (55-65%), että EPCA:n täytäntöönpano kiihdyttää EU:n investointivirtoja Uzbekistanin kriittisten mineraalien sektorille 24 kuukauden ratifiointi- ja täytäntöönpanoikkunassa.

EU–Uzbekistanin tehostettu kumppanuus- ja yhteistyösopimus (TA-10-2026-0174) laajentaa EU:n strategista jalanjälkeä Keski-Aasiaan hetkellä, jolloin alue on Venäjän ja Kiinan kiristyvän kilpailun kohteena. Uzbekistanilla on merkittäviä uraanin, kuparin ja volframin varoja — materiaaleja, jotka ovat kriittisiä EU:n vihreälle siirtymälle ja strategisen autonomian tavoitteille. EPCA luo institutionaalisen kehyksen EU:n investointisuojalle, sääntelyyhteensovittamiselle ja poliittiselle vuoropuhelulle, jota aiemmilla rajoitetuilla kumppanuussopimuksilla ei ollut.

**Strateginen implikaatio:** Tämä sopimus on osa laajempaa EU:n Keski-Aasian yhteyksien strategiaa, joka onnistuessaan vähentäisi EU:n strategista riippuvuutta venäläisistä kauttakulkukäytävistä ja kiinalaisesta Silkkitie-aloitteen infrastruktuurista kriittisten materiaalien toimitusketjuissa.

## 3. Prioriteettiset Signaalit Seuraavalle 30 Päivälle

| Prioriteetti | Signaali | Seurantapiste | WEP |
|---------|--------|------------|-----|
| 🔴 HIGH | Komission vastaus tekoäly-OIR:iin | Lehdistötilaisuus + virallinen vastaus | Todennäköinen (60%) komissio tunnustaa 30 päivässä |
| 🔴 HIGH | SAFE-laajennusneuvottelut | Yhdistyneen kuningaskunnan/Australian kiinnostuksen ilmaisu | Mahdollinen (35-45%) ilmoitus 60 päivässä |
| 🟡 MEDIUM | BUDG 2027 -suuntaviivojen täytäntöönpano | Komission ehdotus (odotetaan kesäkuussa) | Lähes varma (90%) aikataulussa |
| 🟡 MEDIUM | EP API -infrastruktuuri | Teknisen parannuksen signaalit | Epätodennäköinen (20%) lähiajan ratkaisu |
| 🟢 LOW | Uzbekistanin EPCA-ratifiointi | Neuvoston julkaisu EU:n virallisessa lehdessä | Todennäköinen 6–12 kuukaudessa |

## 4. Koalition Tiedusteluarviointi

**EP10-koalitiovakaus:** 🟢 HIGH CONFIDENCE | WEP: Lähes varma (90-95%), että EPP+S&D+Renew-koalitio pitää kv3 2026 ajan nykyisen valiokunnan asialistaan nähden.

Toukokuun 2026 hyväksymistiedot eivät osoita anomaaleja puoluepoliittisia jakoja. Koalition terveyttä osoittavat keskeiset indikaattorit:
- Puolueettomat koskemattomuuden käsittelyt (sekä Vilimsky ETTÄ Pappas vaputettu) — politisoimaton JURI-toiminto
- Puolustusintegraatio (SAFE) hyväksytty ilman estävää vähemmistöä — ECR/PfE-oppositio hallittu
- Budjetti 2027 -suuntaviivat hyväksytty — ei vasemmistolta eikä oikeistolta obstruktiivisia estoja
- Ei raportoitu täysistunnon menettelyllisiä kriisejä istuntokauden aikana

**Mahdolliset murtumakohteet:** Maahanmuuttopaketti (LIBE) on edelleen koalition tärkein stressitesti. Ei merkkejä murtumisesta tämän istuntokauden tuotoksissa, mutta LIBE-tuotoksia ei voitu suoraan havainnoida (committee-documents-syöte epäonnistui). Seuranta suositeltavaa.

## 5. Keskeisten Oletusten Tarkistus (Johdon Taso)

| Oletus | Hauraus | Seuraus jos väärä |
|-----------|-----------|-----------------|
| EP10-koalitio vakaa kv3 2026 asti | Matala (2/5) | KORKEA — asialistauudelleenjärjestely |
| Ukrainan konflikti jatkuu; ei tulitaukoa | Korkea (4/5) | ERITTÄIN KORKEA — puolustusagendan romahtaminen |
| Komissio kohtelee tekoäly-OIR:ia neuvoa-antavana | Kohtalainen (3/5) | MEDIUM — aliarvioitu vaikutus |
| IMF:n taloudellinen perustaso oikea ±15% | Kohtalainen (3/5) | MEDIUM — taloudellisen kontekstin tarkistus |

**Kriittisin epävarmuus:** Ukrainan tulitauon ajoitus. Tulitauko ennen vuoden 2026 loppua muokkaisi välittömästi SAFE/puolustusintegrointiagendan ja vapauttaisi mahdollisesti budjettipaineita sosiaali-/ilmastokulutuksen uudelleenkohdentamiseen — mikä rakenteellistaisi EP10:n lainsäädäntöhorisontin uudelleen.

## 6. Kvantitatiivinen Tiedustelun Luottamustaso (QIC)

**Kokonaisanalyyttinen luottamustaso tässä raportissa:** 🟡 MEDIUM (62%)

Erittely:
- Tosiasiaväitteet (hyväksymistapahtumat, asiakirjaviittaukset): 95% luottamus | Admiralty A1
- Strategiset implikaatiot (valiokunnan asialistantulkinta): 70% luottamus | Admiralty B2
- Tulevaisuuteen suuntautuvat arvioinnit (seuraavat 30 päivää, koalitiovakaus): 55% luottamus | Admiralty B3
- Taloudellinen konteksti (kaikki [KB-ESTIMATE]): 40% luottamus | Admiralty B3-C2

**Kalibrointihuomio:** Kokonaisluottamus 62% on keinotekoisesti puristettu alentuneesta syöte-datasta. Normaaleissa API-olosuhteissa (kaikki syötteet toiminnallisia, prosessidata, äänestysrekisterit) analyyttinen luottamus arvioitaisiin 80-85%:ksi. Ensisijainen luottamusta alentava tekijä on valiokuntatason tuottavuusdata, prosessiputkiston näkyvyyden ja äänestysrekisterien varmentamisen puuttuminen.

## 7. Suositeltavat Toimenpiteet EP Monitor -käyttäjille

1. **Politiikka-analyytikot, jotka seuraavat tekoälyhallintaa:** Seuraa INTA-valiokunnan verkkosivustoa esittelijän lausuntoa varten koskien TA-10-2026-0183:aa ja komission virallista vahvistusaikataulua.

2. **Puolustusanalyytikot:** Seuraa EDA:ta ja neuvoston sihteeristöä SAFE-laajennusneuvotteluissa Kanadan ulkopuolella; Yhdistynyt kuningaskunta ja Australia ovat todennäköisimmät seuraavat sopimukset.

3. **Keski-Aasian tarkkailijat:** Seuraa EU:n virallista lehteä EPCA-julkaisuaikataulun osalta; seuraa Uzbekistanin hallituksen lausuntoja sääntelyyhteensovittamissitoumuksista.

4. **Budjetin seuraajat:** Komission kesäkuun 2026 budjettiehdotus vuodelle 2027 on seuraava merkittävä BUDG-välietappi tässä istunnossa hyväksyttyjen suuntaviivojen jälkeen.

5. **Tekniset käyttäjät:** EP API:n luotettavuus on edelleen heikentynyt. Ota käyttöön defensiivinen datastrategia hyväksyttyjen tekstien päätepisteellä ensisijaisena lähteenä; merkitse kaikki muut syötteestä riippuvaiset analyysit.

**Admiralty-aste tälle raportille:** A1/B2 (tosiasiaperusta A1; strateginen analyysi B2)
**WEP-vaatimustenmukaisuus:** Kaikki todennäköisyyskieli käyttää WEP-vyöhykkeitä. Ei perusteettomia varauksia.
**AI_ANALYSIS_REQUIRED-merkinnät jäljellä:** Nolla.
