<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Verksamhetsöversikt — EP Veckans granskning: 4–11 april 2026 (Påskuppehåll vecka 3) | 2026-04-11

**Klassificering:** OSINT — Offentligt parlamentariskt register
**Konfidensgrad:** 🟡 MEDIUM (ingen levande flödesdata; riskbana härledd från förberäknade statistik + 14 tidigare körningar; **0 / 13 EP API-flöden operativa den 10 april**)
**Körning:** `analysis/daily/2026-04-11/week-in-review-run8/`
**Täckning:** 2026-04-04 → 2026-04-11 (Uppehåll vecka 3, Dag 9–16 av ett 18-dagars påskuppehåll)
**Genererad:** 2026-05-16 (retrospektivt underlag, inga nya MCP-anrop)
**Primära källor:** EP MCP förberäknade statistik (140 K tecken), coalition-dynamics (11,6 K tecken); 14 tidigare arbetsflödesanalysomgångar.

---

## 🎯 BLUF

**Parlamentet befann sig i uppehåll hela veckan — ändå steg det sammansatta politiska riskpoänget med 31 % på tre dagar (10,10 → 13,17 den 9–11 april).** Denna kontraintuitiva eskalering under lagstiftningstidens tystnad är underlagets viktigaste enskilda fynd. Det drivs av **tre konvergerande externa påtryckningstendenser som lagstiftaren inte kan hantera förrän kommittéerna återupptar arbetet den 14 april**: (1) **USA:s tullkris som närmar sig deadlinen den 15 april** (Geopolitisk stående risk **20/25 KRITISK**); (2) **Tullkrisrisk 16/25 KRITISK** — INTA-nödåtgärder krävs dag 1 vid kommittéernas återupptagning; (3) **Lagstiftningsefterslängsrisk 13/25 HÖG** — 18 dagars uppehåll komprimerade till 4-dagars kommittévecka. EP API-felläget är i sig självt en underrättelsesignal: **alla 13 ändpunkter försämrades successivt och nådde fullständig otillgänglighet den 10 april**, vilket begränsar operativ övervakning i precis fel ögonblick. Veckans strukturella fynd: **storkoa­litionen (EPP+S&D+Renew = 396 platser, 55 %) har ett −5,5 % överskott-underskott** — den når inte upp till den rörliga majoritet som krävs för konsekvent styrning, vilket innebär att **EPP måste bygga ad hoc-majoriteter per ärende**. **Renew-ECR-sammanhållningen på 0,95 i konkurrenskraft/handel** är den mest konsekvenstyngda nya anpassningen under uppehållsperioden — *oprövad i röster efter uppehållet* men om den håller skapar den en 340-platsers EPP+Renew+ECR-konkurrenskraftskoalition som **närmar sig men inte når majoritet (361 krävs)**, vilket definierar koalitiongeometrin efter uppehållet.

---

## 🧭 3 beslut som detta underlag stöder

| # | Beslut | Vem beslutar | Deadline | Bevis |
|:-:|--------|--------------|:--------:|-------|
| 1 | **Prioritering av kommittéåterupptagning den 14 april** — INTA måste prioritera tullsvar; ECON-INTA dubbla flaskhalsar innebär att en tredje kommitté inte heller kan vara på kritisk bana | Konferensen för utskottsordföranden | **14 april (T-3 vid körning)** | §Riskbanans acceleration; lagstiftningsefterslängd 13/25 HÖG |
| 2 | **EP API-beredskapsplan** — 0 / 13 flöden operativa; den operativa bilden för kommittéåterupptagning förlitar sig på förberäknade statistik + korsreferens till tidigare körningar snarare än levande flöden | EP-sekretariatet; datapipelineteam | löpande | §Parlamentsstatus; kompanjonens `existing/api-outage-diagnostic.md` |
| 3 | **Läs Renew-ECR 0,95-sammanhållningssignalen som post-uppehållets koalitionstest** — om den håller i den första post-uppehållets handelsröst, pivoterar EP10-koalitionsgeometrin från storkoa­litions­standard till ad-hoc-pivot-standard | EPP/Renew/ECR-gruppledningar | första post-uppehållets handelsröst | §Trepol-koalitionsstruktur |

---

## 📰 60-sekunderläsning

- 🔴 **Sammansatt risk +31 % på 3 dagar** (10,10 → 13,17) under en *lagstiftningstidens tystnad*-vecka — signalen finns i banan, inte i den absoluta nivån.
- 🟠 **Geopolitisk stående risk 20/25 KRITISK** (USA:s tull 15 april deadline); tullkrisrisk 16/25 KRITISK.
- 🟢 **Rekordlagstiftningstakt hittills i år:** +46,2 % YoY (114 akter annualiserade mot 78 år 2025).
- 🟡 **Storkoalitionens genomförbarhet:** **EJ GENOMFÖRBAR** strukturellt — EPP+S&D = 44,5 % (behöver 50,1 %); **EPP+S&D+Renew = 55 % men med −5,5 % överskott-underskott**.
- 🔵 **Fragmenteringsindex 6,59** — högst i EP:s historia; minimum 3-gruppskoalition krävs.
- 🟣 **Renew-ECR-sammanhållning 0,95** i konkurrenskraft/handel — den mest konsekvenstyngda anpassningen under uppehållsperioden.
- 🩷 **Högerblockets strukturella fördel:** EPP+ECR+PfE = **348 platser (48,3 %)** — dominerande inom försvar, avreglering, migration; 13 kortare än majoritet.
- ⚪ **EP API:** 0 / 13 flöden operativa den 10 april — INTERNAL_ERROR för alla ändpunkter; förberäknade statistik är den enda signalkällan.

---

## 🏛️ Trepols koalitionskristallisering

| Pol | Sammansättning | Platser | Andel | Var den vinner |
|-----|----------------|:-------:|:-----:|----------------|
| **Konservativ-höger** | EPP 185 + ECR 79 + PfE 84 | 348 | 48,3 % | Försvar, avreglering, migration |
| **Centrum-liberal pivot** | Renew 76 | 76 | 10,6 % | **Kungamakare vid varje flaggskeppsröst** |
| **Progressiv-vänster** | S&D 135 + Greens/EFA 53 + GUE/NGL 46 | 234 | 32,5 % | Gröna given, socialpolitik, medborgerliga friheter |

Det strukturella fyndet är att **Renew är varje rösts pivot** — inget block når majoritet utan det, och uppehållsperiodens 0,95-sammanhållning med ECR om konkurrenskraft signalerar åt vilket håll Renew görs kur till.

---

## ⚠️ Sammanfattning av riskindikatorer (från körningens instrumentpanel)

| Indikator | Värde | Trend | Konfidensgrad |
|-----------|-------|:-----:|:-------------:|
| Sammansatt risk | **13,17/25 (HÖG)** | ↑ +31 % på 3 dagar | 🟡 |
| EP API-tillgänglighet | 0 / 13 flöden | Försämrad | 🟢 (bekräftad) |
| Lagstiftningstakt | +46,2 % YoY | Rekord | 🟢 |
| Fragmenteringsindex | 6,59 | Stabil | 🟢 |
| Storkoalitionens genomförbarhet | EJ GENOMFÖRBAR | Strukturell | 🟢 |
| Renew-ECR-sammanhållning | 0,95 | Stabil hög | 🟡 (oprövad efter uppehållet) |
| Högerblockets dominans | 52,3 % platser | Stabil | 🟢 |
| **Tullkris** | **16/25 KRITISK** | Närmande deadline | 🟢 |

---

## 🔮 Topp framtida triggers (nästa 7 dagar)

1. **14 april (T-3 från körning) — kommittéåterupptagning.** INTA:s dag-1-nödtullsession är den binära utlösaren för huruvida det parlamentariska svaret är snabbt eller symboliskt.
2. **15 april — USA:s tullimplementeringsdeadline.** Aktiverar TA-10-2026-0096-motåtgärder; ECR:s röstbeteende kommer att vara det första post-uppehållets frakturtest.
3. **Första post-uppehållets röst med Renew om en handelsfil** — falsifikat för Renew-ECR 0,95-sammanhållningssignalen.
4. **27–30 april Strasbourgs plenarsession** — Q2-agendasättning; kompanjonens månadsframåt-underlag täcker detta i detalj.

---

## 🧭 ACH — "Stilla men laddat"-läsningen

- **H1 — "Rutinmässigt uppehåll + externt brus."** Riskbanan är artefakt av konvergerande externa händelser som lagstiftaren inte orsakade; kommittéåterupptagning den 14 april absorberar belastningen på schema. *Stöds av* rekordtakt hittills i år, strukturell stabilitetspoäng (84/100 från kompanjonkörningar).
- **H2 — "Förbrottsbelastning."** Renew-ECR 0,95-sammanhållning är förelöparen till en konkurrenskraftspivot; storkoalitionens −5,5 % överskott-underskott är den underliggande svagheten, inte de externa trycken. *Stöds av* tidigare körningens riskbana + fragmentering 6,59 + strukturellt EJ-GENOMFÖRBAR-fynd om storkoalitionen.

Underlaget läser H1 som planeringens basscenario och H2 som det operativt relevanta stressfallet — *den första post-uppehållets handelsröst* är falsifikatet mellan dem.

---

## 🛡️ Bedömning av källkvalitet

- **Inga levande flödesdata denna vecka — 0 / 13 EP API-flöden operativa den 10 april.** Varje indikator är förberäknad statistik eller härledd från tidigare körningar; detta är underlagets viktigaste förbehåll.
- **MCP-serverhälsorapport** (bekräftad i körning) ger 🟢 HÖG konfidensgrad för API-avbrottet i sig.
- **Riskbana** använder 7 tidigare dagliga körningar (Körningarna 3, 4, 5, 6, 12, 157, 158); konvergens mellan oberoende körningar är det primära kompensationsbeviset.
- **Nettokonfidensgrad:** 🟡 MEDIUM för syntes; 🟢 HÖG för tullrisk (extern publikationspost); 🟡 MEDIUM för Renew-ECR-anpassning (sammanhållningsdata är strukturell, beteende oprövat efter uppehållet).

---

## 📎 Körningsartefakter (läs-innan-beslut)

| Lager | Artefakt | Varför |
|-------|----------|--------|
| Artikel | `article.md` | Offentlig berättelse om uppehållsveckan |
| Syntes | `existing/synthesis-summary.md` | 8 indikatorer + 3-polsstruktur (auktoritativ) |
| Signifikans | `classification/significance-scoring.md` | Händelseinventering (uppehåll, tull, Renew-ECR) |
| Risk | `risk-scoring/risk-assessment.md` | Sammansatt 13,17/25, 7-källsbana |
| Hot | `threat-assessment/threat-analysis.md` | Externtrycks-hotyta |
| Intressenter | `existing/stakeholder-impact.md` | INTA, EU-industri, EPP:s affärsvinge |
| API-avbrott | `existing/api-outage-diagnostic.md` | 0 / 13 flöden — konfidensgrad-golv |
| SWOT | `existing/swot-analysis.md` | Styrkor/svagheter genom uppehållet |
| Kompanjon | `analysis/daily/2026-04-13/month-ahead-run4/` | Framåtblickande par till detta retrospektiv |

---

**Dokumentkontroll**
- **Mallreferens:** `analysis/templates/executive-brief.md`
- **Artefaktsökväg:** `analysis/daily/2026-04-11/week-in-review-run8/executive-brief.md`
- **Klassificering:** Offentlig
- **Retrospektiv:** Underlaget skrevs 2026-05-16 från körningens sparade artefakter; **inga nya MCP-anrop gjordes**. Den 🟡 MEDIUM-konfidensgraden för syntes bevaras, uppgraderas inte, eftersom det underliggande API-avbrottet under körningsperioden är en permanent begränsning för den veckans datakvalitet.
