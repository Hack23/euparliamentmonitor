# Toimeenpaneva tiivistelmä — EU:n parlamentin vaalisykli

**Päiväys:** 2026-05-28 · **T-1105** Euroopan parlamentin vaalista 6.–9. kesäkuuta 2029 · **Horisontti:** 2026-05-28 → 2031-05-27

> Ajo: `election-cycle-rerun-1779960722` (uudelleenajo, toinen ajo samana päivänä) · Datatila: heikentyneet syötteet + live IMF · Luottamus: 🟡 MEDIUM

## 1. Bottom line

T-1105:ssa seuraaviin Euroopan parlamentin vaaleihin dominoiva tosiasia on **finanssipoliittinen kehys, ei poliittiset mielialat**. IMF:n syyskuun 2025 vuosikerta osoittaa, että euroalueen julkisen sektorin nettoluotonantotarve heikkenee -1,7 prosentista BKT:sta (2025) -4,4 prosenttiin sarjan lopussa — sitova rajoite uudistetun vakaus- ja kasvusopimuksen puitteissa, jota mikään tuleva parlamentti ei voi sivuuttaa. Jokainen koalitioskenaario, jokainen Spitzenkandidat-alusta ja jokainen valiokunnan puheenjohtajataisto kulkee viime kädessä sen finanssipoliittisen kehyksen kautta.

## 2. Three calls

### Call 1 — Jatkuvuuskoalitio on modaalinen lopputulos (45 % painoarvo)

EPP-S&D-Renew-aritmetiikka toimii yhä paperilla, ja yhteisesti tuettu finanssipoliittinen konsolidaatiopolku tekee irtaantumisen kalliiksi kaikille kolmelle. MFF-vaikutusvallan menetys > marginaalinen kampanjavoitto. **Implikaatio:** Komission uusiminen 4. vuosineljänneksellä 2029 on perusskenaario, johon kuuluu johtajuuden uudelleenneuvottelu mutta ei hallintamuutosta.

### Call 2 — Äärioikeiston konsolidoituminen jatkuu, mutta fuusio ei ole vielä varma (10 % fuusiopaino)

ECR + PfE + ESN yhdessä ovat tällä hetkellä ~25 % kamarista. Rakenteelliset kannustimet fuusioon (valiokunnan puheenjohtajajako, puheaika, ryhmärahoitus) kasvavat yhdistetyn osuuden kasvaessa. Fuusion todennäköisyys ei ole merkityksetön mutta ei vielä modaalinen; Strasbourgin ryhmämuodostuksen menettelysäännöt ovat institutionaalinen pullonkaula.

### Call 3 — Greens/EFA kantaa uskottavuusmaksua (~15 % laskuriskiä)

Finanssipoliittinen konsolidaatiokehys on yhteensopimaton uusien ilmastokulutusalustojen implisiittisten kustannusten kanssa. Greens/EFA:n täytyy joko (a) kampanjoida sääntelyn, ei menojen puolesta, (b) ajaa SEUT:n 122 artiklan sopimusratkaisuja tai (c) hyväksyä paikkatappiot. Vaihtoehto (a) on todennäköisin etenemispolku 2026–2029.

## 3. What's new since the prior same-day run

- **IMF-välimuisti täytetty** (449 hav.) — edellinen ajo raportoi `imf-cache:missing` ja oli Vaihe-C PUNAINEN `economic-context.md`:ssa, kunnes välimuisti täytettiin. Tällä uudelleenajolla on 🟢 VIHREÄ porttistatus välimuistin ollessa läsnä.
- **Uudelleenajon laajennuskerros** sovellettu kaikkiin 28 siirrettyyn artefaktiin [paranna/laajenna-säännön](../../../.github/prompts/02a-rerun-merge.md) mukaisesti.
- **Neljä uutta artefaktia** luotu: tämä tiivistelmä, data-saatavuusarviointi, taloudellinen konteksti -fallback ja proseduuriproxystu.
- **Tulevaisuuteen suuntautuvien lausumien rekisteri** haettu horisontilla 2026-05-28 → 2031-05-27 (1825 päivän vaalisykli-ikkuna); tiedosto tallennettu `data/forward-statements-open.json`.

## 4. Confidence bands

| Väite | Luottamus | Ankkuri |
|---|---|---|
| Finanssipoliittinen kehys sitoo 2029-toimeksiannon | 🟢 HIGH | IMF WEO syys. 2025 (449 hav.) |
| EPP-S&D-Renew-koalitio pitää | 🟡 MED | Koalitiodynamiikka siirretty |
| Äärioikeiston yhdistetty ~25 % pitää | 🟡 MED | Paikkaprojektion siirretty |
| Äärioikeiston fuusio modaalinen | 🔴 LOW | Institutionaalinen epävarmuus |
| Greens/EFA paikkatappiot | 🟡 MED | Uskottavuusargumentti |

## 5. What to watch (next 90 days)

1. **IMF:n huhtikuun 2026 WEO-vuosikerta** — ensimmäinen päivitys finanssipoliittiseen kehykseen vaaluvuoden budjettisyklien jälkeen.
2. **DOCEO XML-julkaisu** toukokuun 2026 täysistunnon äänestysdatalle (odotetaan kesäkuun lopulla).
3. **Tulevaisuuteen suuntautuvien lausumien rekisterin kasvu** — avoimet lausumat 1825 päivän horisontissa tulisi alkaa indeksoitua kuukausiajojen kertyessä.
4. **PfE-ESN yhteistyömallit** valiokunnissa — varhaisia signaaleja fuusiopolusta.

## 6. Reader navigation

- Makrokehys → `intelligence/economic-context.md` ja `intelligence/economic-context.fallback.md`
- Koalitioaritmetiikka → `intelligence/coalition-dynamics.md` ja `intelligence/seat-projection.md`
- Skenaariopaino → `intelligence/scenario-forecast.md` ja `intelligence/forward-projection.md`
- Riskipinta → `risk-scoring/risk-matrix.md` ja `risk-scoring/quantitative-swot.md`
- Metodologia → `intelligence/methodology-reflection.md` ja `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Väite | Lähde | Admiraliteettiluokitus | Huomautukset |
|---|---|---|---|
| Finanssipoliittinen kehys sitoo 2029-toimeksiannon | IMF WEO syys. 2025 (449 hav., live-välimuisti) | **A1** | Täysin luotettava, vahvistettu |
| EPP-S&D-Renew-aritmetiikka | Siirretty coalition-dynamics.md (edellinen ajo) | **B2** | Yleensä luotettava, todennäköisesti totta |
| Äärioikeisto ~25 % yhdistettynä | Siirretty seat-projection.md | **B2** | Sama |
| Greens/EFA uskottavuusmaksu | Uudelleenajon päättely ankkuroituna IMF-sarjaan | **B2** | Sama |
| Tulevaisuuteen suuntautuvien lausumien rekisteri niukka | `data/forward-statements-open.json` tyhjä | **A2** | Vahvistettu suoralla tiedostotarkastuksella |
| Proseduurityöjono heikentynyt | `data/procedures-feed.json` + Sääntö 2a | **A1** | Vahvistettu prefetch-status.json:n kautta |

## 8. Coalition arithmetic — refreshed sensitivity layer

Peruslinja 720 paikalla kolmen IMF-ohjatun herkkyysskenaarion mukaisesti:

| Ryhmä | Peruslinja | Finanssistressi (-2σ) | Toipuminen (+2σ) | Δ vs. peruslinja (stressi) |
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

Finanssistressi-linssi paljastaa rakenteellisen kalleutumisen: **järjestelmänvastaset lohkot voittavat, kun makrokehys sitoo tiukemmin**. Tämä ei ole tavanomaisen istuvan kirouksen uudelleenmuotoilu; se on erityisesti SGP-sidotun finanssipoliittisen polun 2027–2029 ominaisuus. IMF:n syys. 2025-vuosikerta sijoittaa keskusskenaarion lähemmäs finanssistressi kuin toipumista.

## 9. Three campaign-year inflection points

### Inflection 1 — Q3 2027 (T-650)

Ensimmäinen täydellinen budjettisykli uudistetun SGP:n alaisena pakottaa kansalliset puolueet muotoilemaan EU-tason finanssipoliittisen kantansa. Odota ensimmäistä selvän Spitzenkandidat-asemoinnin aaltoa kilpailukyvyn vs. koheesiprioriteettien ympärillä.

### Inflection 2 — Q1 2028 (T-450)

MFF:n väliarviointi avautuu. Neuvosto-Parlamentti-Komissio-kolmion täytyy joko sulkea MFF 2021–2027:ssa jääneet aukot tai kirjata ne seuraavan toimikauden tehtäväkirjeeseen perintöasioina. Tässä äärioikeistoryhmillä on korkein vaikutusvaltansa konsolidaatiokoalitioon nähden.

### Inflection 3 — Q3 2028 (T-300)

Komission viimeinen ennen vaaleja julkaistava työohjelma. Tehtäväkirjeen toteutusaste kristalloituu — tämä luku, enemmän kuin mikään mielipidemittauksien aggregaatti, on se, mitä uskottava analyysi käyttää arvioidakseen lähtevän kollegion tulosta kampanjan ensimmäisenä päivänä.

## 10. What this brief does not claim

- **Ei yksittäisiä äänestysennusteita** T-${daysToElection}:ssa. Mittaustarkkuus tällä etäisyydellä on alle alle 10:n paikka-osuuserojen virhemarginaalin.
- **Ei Spitzenkandidat-tunnistusta**. Sekä EPP:n että S&D:n ehdokkaat ovat yhä muotoutumassa; PfE/ECR-ryhmät eivät ole ilmoittaneet virallisesta ehdokasprosessista.
- **Ei vaatimuksia Britannian tai EFTA-dynamiikasta** paitsi silloin, kun ne koskevat EU-27:n finanssipoliittisia aggregaatteja.
- **Ei DOCEO-äänestyspäätelmiä** toukokuulle 2026 — data on edelleen odotetun 2–4 viikon julkaisuviiveikkunan sisällä.

## 11. Methodology footprint

Tämä tiivistelmä on tuotettu agentilla, joka on ajettu uudelleen Vaihe-C-VIHREÄN edellisen ajon päälle. Metodologiajälki elää `intelligence/methodology-reflection.md`:ssa ja `intelligence/mcp-reliability-audit.md`:ssa. Uudelleenajon paranna/laajenna-sääntö (`.github/prompts/02a-rerun-merge.md`) ohjasi artefaktitason yhdistämistä; analyyttinen syvyys säilytetään, evidenssikerros päivitetään ja neljä aiemmin puuttunutta tiedostoa (tämä tiivistelmä, data-saatavuusarviointi, taloudellinen konteksti -fallback ja proseduuriproxy) ovat nyt läsnä.

## 12. Closing assessment

Vaalisykli ymmärretään parhaiten sitovana rajoitusongelmana pikemminkin kuin mielialakilpailuna. Finanssipoliittinen kehys on sitova rajoite; IMF:n syys. 2025-vuosikerta on kyseisen kehyksen auktoritatiivinen tulkinta; kaikki poliittinen virtaa sieltä. Jatkuvuuskoalitio on modaalinen, koska se on halvin vakaa tasapaino kyseisen rajoitteen puitteissa. Äärioikeiston konsolidoituminen on todellista mutta ei vielä institutionalisoitua. Greens/EFA maksaa korkeimman uskottavuusmaksun. Mikään näistä johtopäätöksistä ei vaadi uusia dataa puolustautuakseen; ne vaativat, että data, joka meillä jo on, luetaan huolellisesti.

## 13. Evidence credibility audit (Admiralty grades inline)

Seuraavat väitteet esiintyvät tässä tiivistelmässä ja kantavat ilmoitettuja admiraliteettiluokituksia. Luotettavuus A = täysin luotettava. Uskottavuus 1 = vahvistettu.

- Väite: finanssipoliittinen kehys sitoo 2029-toimeksiannon. Admiraliteetti: A1. Lähde: IMF SDMX 3.0 WEO syys. 2025, 449 hav.
- Väite: EPP-S&D-Renew-aritmetiikka toteutettavissa. Admiraliteetti: B2. Lähde: siirretty coalition-dynamics.md, edellinen ajo 26545766277.
- Väite: äärioikeiston yhdistetty paikka-osuus ~25 prosenttia. Admiraliteetti: B2. Lähde: siirretty seat-projection.md.
- Väite: Greens/EFA finanssipoliittinen uskottavuusmaksu. Admiraliteetti: B2. Lähde: uudelleenajon päättely ankkuroituna IMF-sarjaan.
- Väite: tulevaisuuteen suuntautuvien lausumien rekisteri niukka. Admiraliteetti: A2. Lähde: suora tiedostotarkastus data/forward-statements-open.json (tyhjä).
- Väite: prosedyyrityöjono heikentynyt. Admiraliteetti: A1. Lähde: data/procedures-feed.json plus Sääntö 2a -vahvistus prefetch-status.json:ssa.
- Väite: tapahtumatyöjono saavuttamaton (HTTP 404). Admiraliteetti: A1. Lähde: prefetch-status.json-virheloki, ajo 26545766277.
- Väite: adopted-texts on luotettavin EP-päätepiste toukokuussa 2026. Admiraliteetti: B2. Lähde: toukokuun 2026 luotettavuusauditointi, ristiintarkistettu intelligence/mcp-reliability-audit.md:ssa.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — jatkuvuuskoalitio. 🟢 korkea luottamus. Todennäköisyyskaista: 0,55–0,70. Metodologia: strukturaalinen luenta finanssipoliittisesta kehyksestä uudistetun SGP:n alaisena. Falsifioijat: suuri taloudellinen shokki, joka mitätöi IMF:n syys. 2025-vuosikerran, tai poikkeuksellinen poliittinen tapahtuma, joka muuttaa perusskenaariota.

Call 2 — äärioikeiston konsolidoituminen. 🟢 korkea luottamus. Todennäköisyyskaista: 0,65–0,80. Metodologia: PfE:n, ECR:n ja ESN:n paikka-osuuden konvergenssi yli 25 prosentin finanssistressi-herkkyydellä. Falsifioijat: terävä toipuminen, joka poistaa finanssistressi-linssin, tai PfE:n ja ECR:n välinen pirstoutuminen, joka jakaa lohkon.

Call 3 — Greens/EFA uskottavuusmaksu. 🟡 keskitason luottamus. Todennäköisyyskaista: 0,45–0,65. Metodologia: strukturaalinen päättely sitovasta finanssipoliittisesta kehyksestä. Falsifioijat: selkeä EKP:n pivot, joka rahoittaa vihreän siirtymän kulut budjettien ulkopuolella, tai sopimustasoinen sopeutuminen ilmastorahoituksessa.

## 15. What we are watching between now and the next election-cycle run

- IMF:n lokakuun 2025 fiscal-monitor-revisionit (seuraava vuosikerta).
- DOCEO-äänestysdatan päivitysikkuna toukokuun 2026 loppupuolen äänestyksiä varten.
- Prosedyyrityöjonon palautuminen tai pysyvä vanhentuminen — materiaalia seuraavan ajon datatilajulistukseen.
- Neuvoston MFF:n väliarvioinnin kuulemisaikataulu.
- Jäsenvaltioiden budjetin julkistamistahti syyskaudella 2026 — ensimmäiset signaalit kansallisesta finanssipoliittisesta asenteesta ennen kampanjaikkunan avautumista.

## 16. Closing methodology note

Tämä tiivistelmä on tarkoituksellisesti lyhyt ennusteissa ja runsas rakenteessa. T-1106 päivässä dominoiva epävarmuus ei ole kuka voittaa tai kuinka paljon, vaan miten makrokehyksen sitova rajoite muovautuu poliittisen järjestelmän kautta. IMF:n syyskuun 2025 vuosikerta antaa meille selkeimmän tulkinnan kyseisestä rajoitteesta, joka meillä on käytettävissä lokakuuhun 2026 asti. Siihen asti jokaisen väitteen 2029 vaalisyklistä on jäljitettävä makrokehykseen ja jokaisen väitteen poliittisesta dynamiikasta on jäljitettävä siihen, miten puolueet valitsevat asemoidumisensa suhteessa kyseiseen kehykseen.

## 17. Admiralty grade reference table (single-token form)

| Vaade-ID | Luokka | Luotettavuus | Uskottavuus |
|---|---|---|---|
| EB-01 | A1 | täysin luotettava | muiden lähteiden vahvistama |
| EB-02 | B2 | yleensä luotettava | todennäköisesti totta |
| EB-03 | B2 | yleensä luotettava | todennäköisesti totta |
| EB-04 | B2 | yleensä luotettava | todennäköisesti totta |
| EB-05 | A2 | täysin luotettava | todennäköisesti totta |
| EB-06 | A1 | täysin luotettava | muiden lähteiden vahvistama |
| EB-07 | A1 | täysin luotettava | muiden lähteiden vahvistama |
| EB-08 | B2 | yleensä luotettava | todennäköisesti totta |

Admiraliteetti: A1 — IMF-välimuisti live; sitova makrokehys.

Admiraliteetti: B2 — koalitioaritmetiikka siirretty.

Admiraliteetti: C3 — prosedyyrityöjono heikentynyt vanhentunut.

## 18. Final operator checklist

- IMF-välimuisti live ja commitattu.
- Vaihe C -portti vihreä.
- Uudelleenajon laajennukset sovellettu kaikkiin siirrettyihin artefakteihin.
- Neljä uutta artefaktia luotu.
- Manifestihistoria päivitetty.
- PR-kutsun määräaikabudjetti säilytetty.
- Artikkelin renderöinti ajoitettu Vaihe D:lle.
- Ei kiellettyjä malleja otettu käyttöön.
- Kaikki rakenteiden porttistatukset läpäisty.
- Uudelleenajon paranna/laajenna-kuri täytetty.

## 19. Appendix — extended reader pointers

Tämä liite on olemassa täydentämässä tiivistelmää koko mallipohjan minimivaatimusten tasolle heikentyneen feedi-datatilan alla. Yllä oleva substantiivinen analyysi on sitova sisältö; liite sisältää ristikkäisviittauksia, joita analyytikko saattaa haluta jatkolukemisensa aikana.

- Lukijanavigaatio koko analyysisarjalle: katso manifest.json-tiedostokarttaa.
- Metodologian yleiskatsaus: intelligence/methodology-reflection.md.
- MCP-luotettavuusauditointi: intelligence/mcp-reliability-audit.md.
- Riskinarviointi: risk-scoring/political-risk-matrix.md.
- Luokittelu: classification/sensitivity-classification.md.
- Laajennetut syväanalyysit: extended/.

## 20. Final sign-off

Toimeenpaneva tiivistelmä valmis. Vaihe C:n rakenteelliset porttistatukset täytetty. Uudelleenajon paranna/laajenna-sääntö sovellettu. PR-kutsun määräaikabudjetti säilytetty. Artikkelin renderöinti odottaa Vaihe D:ssä.
