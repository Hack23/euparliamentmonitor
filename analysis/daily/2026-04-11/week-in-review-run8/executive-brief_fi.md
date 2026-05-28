<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Johdon yhteenveto — EP Viikon katsaus: 4.–11. huhtikuuta 2026 (Pääsiäisloma viikko 3) | 2026-04-11

**Luokitus:** OSINT — Julkinen parlamentaarinen asiakirja
**Luottamus:** 🟡 MEDIUM (ei reaaliaikaista syötedataa; riskikehitys johdettu ennakkolasketuista tilastoista + 14 aiemmasta ajosta; **0 / 13 EP API -syötettä toiminnassa 10. huhtikuuta**)
**Ajo:** `analysis/daily/2026-04-11/week-in-review-run8/`
**Kattavuus:** 2026-04-04 → 2026-04-11 (Lomaviiikko 3, Päivät 9–16 18-päiväisestä pääsiäislomasta)
**Luotu:** 2026-05-16 (retrospektiivinen tiivistelmä, ei uusia MCP-kutsuja)
**Ensisijaiset lähteet:** EP MCP ennakkolasketut tilastot (140 K merkkiä), coalition-dynamics (11,6 K merkkiä); 14 aiempaa työnkulkuanalyysijoa.

---

## 🎯 BLUF

**Parlamentti oli lomalla koko viikon — silti yhdistetty poliittinen riskipisteet nousi 31 % kolmessa päivässä (10,10 → 13,17 9.–11. huhtikuuta).** Tämä vastaintuitiivinen eskaloituminen lainsäädännöllisen hiljaisuuden aikana on tiivistelmän tärkein yksittäinen löydös. Sen ajaa **kolme lähentyvää ulkoista painetta, joihin lainsäätäjä ei pysty reagoimaan ennen valiokuntien uudelleenistuntojen alkamista 14. huhtikuuta**: (1) **USA:n tullikiista lähestyy 15. huhtikuun määräaikaa** (Geopoliittinen pysyvä riski **20/25 KRIITTINEN**); (2) **Tullikiistariski 16/25 KRIITTINEN** — INTA-hätätoimenpiteitä tarvitaan valiokuntaistunnon ensimmäisenä päivänä; (3) **Lainsäädännöllinen ruuhka­riski 13/25 KORKEA** — 18-päiväinen loma puristettu 4-päiväiseksi valiokuntaviikoksi. EP API -virhetila on itsessään tiedustelumerkki: **kaikki 13 päätepistettä heikkenivät asteittain ja saavuttivat täydellisen käyttökatkon 10. huhtikuuta**, mikä rajoittaa operatiivista seurantaa juuri väärällä hetkellä. Viikon rakenteellinen löydös: **suurkoalitio (EPP+S&D+Renew = 396 paikkaa, 55 %) on −5,5 %:n ylijäämä-alijäämä** — se ei yllä johdonmukaisen hallinnon vaatimaan työskentelyenemmistöön, mikä tarkoittaa, että **EPP:n on rakennettava ad hoc -enemmistöt asian mukaan**. **Renew-ECR-koheesio 0,95 kilpailukyvyn/kaupan alalla** on loma-ajan merkittävin uusi linjaus — *kokeilematon loman jälkeisissä äänestyksissä* mutta jos se pitää, se luo 340-paikkaisen EPP+Renew+ECR-kilpailukykykoalition, joka **lähestyy mutta ei saavuta enemmistöä (tarvitaan 361)**, määrittäen loman jälkeisen koalitiogeometrian.

---

## 🧭 3 päätöstä, joita tämä tiivistelmä tukee

| # | Päätös | Kuka päättää | Määräaika | Näyttö |
|:-:|--------|--------------|:----------:|--------|
| 1 | **14. huhtikuun valiokuntaistunnon aloituksen priorisointi** — INTA:n on asetettava etusijalle tullivastaus; ECON-INTA:n kaksinkertainen pullonkaula tarkoittaa, että kolmas valiokunta ei myöskään voi olla kriittisellä polulla | Valiokuntapuheenjohtajien konferenssi | **14. huhtikuuta (T-3 ajossa)** | §Riskikehityksen kiihtyminen; lainsäädännöllinen ruuhka 13/25 KORKEA |
| 2 | **EP API -varautumissuunnitelma** — 0 / 13 syötettä toiminnassa; valiokuntaistunnon operatiivinen kuva riippuu ennakkolasketuista tilastoista + viittauksista aiempiin ajoihin eikä reaaliaikaisista syötteistä | EP-sihteeristö; dataputkitiimi | jatkuvaa | §Parlamentin status; kumppaniasiakirja `existing/api-outage-diagnostic.md` |
| 3 | **Lue Renew-ECR 0,95 -koheesiosignaali loman jälkeisenä koaliotestinä** — jos se pitää ensimmäisessä loman jälkeisessä kauppaäänestyksessä, EP10-koalitiogeometria kääntyy suurkoalitio-oletuksesta ad hoc -pivot-oletukseen | EPP/Renew/ECR-ryhmäjohdot | ensimmäinen loman jälkeinen kauppaäänestys | §Kolminapainen koalitiorakenne |

---

## 📰 60 sekunnin lukeminen

- 🔴 **Yhdistetty riski +31 % 3 päivässä** (10,10 → 13,17) *lainsäädännöllisen hiljaisuuden* viikolla — merkki on kehityksessä, ei absoluuttisessa tasossa.
- 🟠 **Geopoliittinen pysyvä riski 20/25 KRIITTINEN** (USA:n tulli 15. huhtikuuta määräaika); tullikiistariski 16/25 KRIITTINEN.
- 🟢 **Ennätyksellinen lainsäädäntötahti NYTD:** +46,2 % YoY (114 säädöstä vuositasolle laskettuna vs. 78 vuonna 2025).
- 🟡 **Suurkoalition toteuttamiskelpoisuus:** **EI TOIMIVA** rakenteellisesti — EPP+S&D = 44,5 % (tarvitaan 50,1 %); **EPP+S&D+Renew = 55 % mutta −5,5 %:n ylijäämä-alijäämällä**.
- 🔵 **Fragmentaatioindeksi 6,59** — korkein EP:n historiassa; vähintään 3 ryhmän koalitio tarvitaan.
- 🟣 **Renew-ECR-koheesio 0,95** kilpailukyvyn/kaupan alalla — loma-ajan merkittävin linjaus.
- 🩷 **Oikeistosiiven rakenteellinen etu:** EPP+ECR+PfE = **348 paikkaa (48,3 %)** — hallitseva puolustuksessa, sääntelyn purkamisessa, maahanmuutossa; 13 enemmistöstä vajaa.
- ⚪ **EP API:** 0 / 13 syötettä toiminnassa 10. huhtikuuta — INTERNAL_ERROR kaikissa päätepisteissä; ennakkolasketut tilastot ovat ainoa signaalilähde.

---

## 🏛️ Kolminapainen koalitiokiteytyminen

| Napa | Kokoonpano | Paikat | Osuus | Missä voittaa |
|------|------------|:------:|:-----:|---------------|
| **Konservatiivi-oikeisto** | EPP 185 + ECR 79 + PfE 84 | 348 | 48,3 % | Puolustus, sääntelyn purku, maahanmuutto |
| **Keskusta-liberaali pivot** | Renew 76 | 76 | 10,6 % | **Kuningastekijä jokaisessa lippulaiva-äänestyksessä** |
| **Progressiivi-vasemmisto** | S&D 135 + Greens/EFA 53 + GUE/NGL 46 | 234 | 32,5 % | Vihreä sopimus, sosiaalipolitiikka, kansalaisvapaudet |

Rakenteellinen löydös on, että **Renew on jokaisen äänestyksen pivot** — mikään lohko ei saavuta enemmistöä ilman sitä, ja loma-ajan 0,95-koheesio ECR:n kanssa kilpailukyvystä signaloi, mihin suuntaan Renew'ta kosiskellaan.

---

## ⚠️ Riskiindikaattoreiden yhteenveto (ajon kojelauta)

| Indikaattori | Arvo | Trendi | Luottamus |
|--------------|------|:------:|:---------:|
| Yhdistetty riski | **13,17/25 (KORKEA)** | ↑ +31 % 3 päivässä | 🟡 |
| EP API -saatavuus | 0 / 13 syötettä | Heikentynyt | 🟢 (vahvistettu) |
| Lainsäädäntötahti | +46,2 % YoY | Ennätys | 🟢 |
| Fragmentaatioindeksi | 6,59 | Vakaa | 🟢 |
| Suurkoalition toteuttamiskelpoisuus | EI TOIMIVA | Rakenteellinen | 🟢 |
| Renew-ECR-koheesio | 0,95 | Vakaasti korkea | 🟡 (kokeilematon loman jälkeen) |
| Oikeistosiiven dominanssi | 52,3 % paikkoja | Vakaa | 🟢 |
| **Tullikiista** | **16/25 KRIITTINEN** | Lähestymässä määräaikaa | 🟢 |

---

## 🔮 Tärkeimmät tulevat laukaisijat (seuraavat 7 päivää)

1. **14. huhtikuuta (T-3 ajosta) — valiokuntien uudelleenistunto.** INTA:n päivä-1-hätätulliistunto on binaarinen laukaisin sille, onko parlamentaarinen vastaus oikea-aikainen vai symbolinen.
2. **15. huhtikuuta — USA:n tullien toimeenpanomääräaika.** Aktivoi TA-10-2026-0096-vastatoimet; ECR:n äänestyskäyttäytyminen on ensimmäinen loman jälkeinen murtumistesti.
3. **Ensimmäinen loman jälkeinen äänestys Renewin kanssa kauppa-asiasta** — falsifikaattori Renew-ECR 0,95 -koheesiosignaalille.
4. **27.–30. huhtikuuta Strasbourgin täysistunto** — Q2-asialistanlaadinta; kumppanin kuukauden ennakkokatsaus kattaa tämän yksityiskohtaisesti.

---

## 🧭 ACH — "Hiljainen mutta ladattu" -tulkinta

- **H1 — "Rutiinitauot + ulkoinen kohina."** Riskikehitys on artefakti konvergoivista ulkoisista tapahtumista, joita lainsäätäjä ei aiheuttanut; valiokuntien uudelleenistunto 14. huhtikuuta absorboi kuorman aikataulun mukaisesti. *Suositaan* ennätystahti NYTD, rakenteellinen vakausluku (84/100 kumppaniajosta).
- **H2 — "Esihalkeama-kuormitus."** Renew-ECR 0,95-koheesio on kilpailukykykoalitiopivottauksen edeltäjä; suurkoalition −5,5 %:n ylijäämä-alijäämä on taustalla oleva heikkous, ei ulkoiset paineet. *Suositaan* aiemman ajon riskikehitys + fragmentaatio 6,59 + rakenteellinen EI-TOIMIVA-löydös suurkoalitiosta.

Tiivistelmä lukee H1:n suunnittelun perusskenaarioksi ja H2:n operatiivisesti relevanttina stressitapauksena — *ensimmäinen loman jälkeinen kauppaäänestys* on niiden välinen falsifikaattori.

---

## 🛡️ Lähdekvaliteetin arviointi

- **Ei reaaliaikaista syötedataa tällä viikolla — 0 / 13 EP API -syötettä toiminnassa 10. huhtikuuta.** Jokainen indikaattori on ennakkolaskettu tilasto tai johdettu aiemmista ajoista; tämä on tiivistelmän tärkein varauma.
- **MCP-palvelimen terveysraportti** (vahvistettu ajossa) antaa 🟢 KORKEA luottamus itse API-käyttökatkon osalta.
- **Riskikehitys** käyttää 7 aiempaa päivittäisajoa (Ajot 3, 4, 5, 6, 12, 157, 158); konvergenssi itsenäisten ajojen kesken on pääasiallinen kompensoiva näyttö.
- **Nettojaottelu:** 🟡 MEDIUM synteesille; 🟢 KORKEA tulliriskille (ulkoinen julkaisurekisteri); 🟡 MEDIUM Renew-ECR-linjaukselle (koheesiodata on rakenteellinen, käyttäytyminen kokeilematon loman jälkeen).

---

## 📎 Ajon artefaktit (lue-ennen-päätöstä)

| Kerros | Artefakti | Miksi |
|--------|-----------|-------|
| Artikkeli | `article.md` | Julkinen lomaviikkokertaus |
| Synteesi | `existing/synthesis-summary.md` | 8 indikaattoria + 3-naparakenne (auktoritatiivinen) |
| Merkittävyys | `classification/significance-scoring.md` | Tapahtumaluettelo (loma, tulli, Renew-ECR) |
| Riski | `risk-scoring/risk-assessment.md` | Yhdistetty 13,17/25, 7-lähteen kehitys |
| Uhka | `threat-assessment/threat-analysis.md` | Ulkoisen paineen uhkapinta |
| Sidosryhmät | `existing/stakeholder-impact.md` | INTA, EU-teollisuus, EPP:n yrityssiipi |
| API-käyttökatkos | `existing/api-outage-diagnostic.md` | 0 / 13 syötettä — luottamuslattia |
| SWOT | `existing/swot-analysis.md` | Vahvuudet/heikkoudet loman aikana |
| Kumppani | `analysis/daily/2026-04-13/month-ahead-run4/` | Eteenpäin katsova pari tälle retrospektiivitiivis­telmälle |

---

**Asiakirjanhallinta**
- **Malliviite:** `analysis/templates/executive-brief.md`
- **Artefaktipolku:** `analysis/daily/2026-04-11/week-in-review-run8/executive-brief.md`
- **Luokitus:** Julkinen
- **Retrospektiivinen:** Tiivistelmä kirjoitettu 2026-05-16 ajon tallennetuista artefakteista; **uusia MCP-kutsuja ei tehty**. 🟡 MEDIUM-luottamus synteesille säilytetään, sitä ei koroteta, koska taustalla oleva API-käyttökatkos ajokaudella on pysyvä rajoite kyseisen viikon datanlaadulle.
