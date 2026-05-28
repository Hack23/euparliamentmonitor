<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Ledelsesoversigt — EP Ugens gennemgang: 4.–11. april 2026 (Påskeferie uge 3) | 2026-04-11

**Klassificering:** OSINT — Offentligt parlamentarisk register
**Konfidens:** 🟡 MEDIUM (ingen levende feeddata; risikoforløb udledt fra forudberegnede statistikker + 14 tidligere kørsler; **0 / 13 EP API-feeds operationelle den 10. april**)
**Kørsel:** `analysis/daily/2026-04-11/week-in-review-run8/`
**Dækning:** 2026-04-04 → 2026-04-11 (Ferie uge 3, Dag 9–16 af en 18-dages påskeferie)
**Genereret:** 2026-05-16 (retrospektivt notat, ingen nye MCP-kald)
**Primære kilder:** EP MCP forudberegnede statistikker (140 K tegn), coalition-dynamics (11,6 K tegn); 14 tidligere workflow-analysekørsler.

---

## 🎯 BLUF

**Parlamentet var i ferie hele ugen — alligevel steg den samlede politiske risikoscore 31 % på tre dage (10,10 → 13,17 den 9.–11. april).** Denne kontraintuitive eskalering under lovgivningsmæssig tavshed er notets vigtigste enkeltfund. Det drives af **tre konvergerende eksterne pres, som lovgiveren ikke kan reagere på, før udvalgsgenoptagelsen den 14. april**: (1) **USA's toldkrise nærmer sig deadline den 15. april** (Geopolitisk stående risiko **20/25 KRITISK**); (2) **Toldkriserisiko 16/25 KRITISK** — INTA-nødforanstaltninger nødvendige på Dag 1 af udvalgsgenoptagelse; (3) **Lovgivningsmæssig ophobningsrisiko 13/25 HØJ** — 18-dages ferie komprimeret til 4-dages udvalgsuge. EP API-fejltilstand er i sig selv et efterretningssignal: **alle 13 endepunkter degraderede progressivt og nåede total utilgængelighed den 10. april**, hvilket begrænser operationel overvågning på præcis det forkerte tidspunkt. Ugens strukturelle fund: **storkoalitionen (EPP+S&D+Renew = 396 sæder, 55 %) har et −5,5 % overskud-underskud** — den når ikke op til det arbejdsflertal, der er nødvendigt for konsekvent styring, hvilket betyder, at **EPP skal opbygge ad hoc-flertal pr. sagsmappe**. **Renew-ECR-sammenhæng på 0,95 om konkurrenceevne/handel** er den mest konsekvenstunge nye tilpasning i ferieperioden — *uprøvet i post-ferie-afstemninger* men hvis den holder, skaber den en 340-sæders EPP+Renew+ECR-konkurrenceevnekoalition, der **nærmer sig men ikke når flertal (361 nødvendige)**, og definerer post-ferie-koalitionsgeometrien.

---

## 🧭 3 beslutninger dette notat understøtter

| # | Beslutning | Hvem beslutter | Deadline | Bevis |
|:-:|------------|----------------|:--------:|-------|
| 1 | **Prioritering af udvalgsgenoptagelse den 14. april** — INTA skal prioritere toldsvar; ECON-INTA dobbelt flaskehals betyder, at et tredje udvalg heller ikke kan være på kritisk sti | Konference af udvalgsformænd | **14. april (T-3 ved kørsel)** | §Risikoforløbsacceleration; lovgivningsmæssig ophobning 13/25 HØJ |
| 2 | **EP API-beredskabsplan** — 0 / 13 feeds operationelle; det operationelle billede for udvalgsgenoptagelse afhænger af forudberegnede statistikker + krydsreference til tidligere kørsler snarere end levende feeds | EP-sekretariatet; datapipelineteam | løbende | §Parlamentsstatus; ledsager `existing/api-outage-diagnostic.md` |
| 3 | **Læs Renew-ECR 0,95-sammenhængsignalet som post-feriens koalitionstest** — hvis det holder i den første post-ferie-handelsafstemning, drejer EP10-koalitionsgeometrien fra storkoalitions-standard til ad-hoc-pivot-standard | EPP/Renew/ECR-gruppeledelser | første post-ferie-handelsafstemning | §Trepolet koalitionsstruktur |

---

## 📰 60-sekunders læsning

- 🔴 **Samlet risiko +31 % på 3 dage** (10,10 → 13,17) i en *lovgivningsmæssig tavshed*-uge — signalet er i forløbet, ikke det absolutte niveau.
- 🟠 **Geopolitisk stående risiko 20/25 KRITISK** (USA-told 15. april deadline); toldkriserisiko 16/25 KRITISK.
- 🟢 **Rekordlovgivningstempo ÅTD:** +46,2 % YoY (114 retsakter annualiseret mod 78 i 2025).
- 🟡 **Storkoalitionens gennemførlighed:** **IKKE LEVEDYGTIG** strukturelt — EPP+S&D = 44,5 % (har brug for 50,1 %); **EPP+S&D+Renew = 55 % men med −5,5 % overskud-underskud**.
- 🔵 **Fragmenteringsindeks 6,59** — højest i EP's historie; minimum 3-gruppekoalition krævet.
- 🟣 **Renew-ECR-sammenhæng 0,95** om konkurrenceevne/handel — den mest konsekvenstunge tilpasning i ferieperioden.
- 🩷 **Højreblokens strukturelle fordel:** EPP+ECR+PfE = **348 sæder (48,3 %)** — dominerende inden for forsvar, afregulering, migration; 13 kortere end flertal.
- ⚪ **EP API:** 0 / 13 feeds operationelle den 10. april — INTERNAL_ERROR på tværs af alle endepunkter; forudberegnede statistikker er den eneste signalkilde.

---

## 🏛️ Trepolet koalitionskrystallisering

| Pol | Sammensætning | Sæder | Andel | Hvor den vinder |
|-----|---------------|:-----:|:-----:|-----------------|
| **Konservativ-højre** | EPP 185 + ECR 79 + PfE 84 | 348 | 48,3 % | Forsvar, afregulering, migration |
| **Centrum-liberal pivot** | Renew 76 | 76 | 10,6 % | **Kongemager ved enhver flagskibsafstemning** |
| **Progressiv-venstre** | S&D 135 + Greens/EFA 53 + GUE/NGL 46 | 234 | 32,5 % | Grøn pagt, socialpolitik, borgerrettigheder |

Det strukturelle fund er, at **Renew er enhver afstemnings pivot** — inget blok når flertal uden det, og ferieperiodens 0,95-sammenhæng med ECR om konkurrenceevne signalerer, hvilken vej Renew er ved at blive kureret.

---

## ⚠️ Resumé af risikoindikatorer (fra kørselsdashboard)

| Indikator | Værdi | Tendens | Konfidens |
|-----------|-------|:-------:|:---------:|
| Samlet risiko | **13,17/25 (HØJ)** | ↑ +31 % på 3 dage | 🟡 |
| EP API-tilgængelighed | 0 / 13 feeds | Degraderet | 🟢 (bekræftet) |
| Lovgivningstempo | +46,2 % YoY | Rekord | 🟢 |
| Fragmenteringsindeks | 6,59 | Stabil | 🟢 |
| Storkoalitionens gennemførlighed | IKKE LEVEDYGTIG | Strukturel | 🟢 |
| Renew-ECR-sammenhæng | 0,95 | Stabil høj | 🟡 (uprøvet efter ferie) |
| Højreblokens dominans | 52,3 % sæder | Stabil | 🟢 |
| **Toldkrise** | **16/25 KRITISK** | Nærmer sig deadline | 🟢 |

---

## 🔮 Top fremtidige udløsere (næste 7 dage)

1. **14. april (T-3 fra kørsel) — udvalgsgenoptagelse.** INTA's dag-1-nødtoldsession er den binære udløser for, om det parlamentariske svar er rettidig eller symbolsk.
2. **15. april — USA's toldimplementeringsdeadline.** Aktiverer TA-10-2026-0096-modforanstaltninger; ECR's adfærd vil være den første post-ferie-frakturtest.
3. **Første post-ferie-afstemning med Renew om en handelsfil** — falsifikator for Renew-ECR 0,95-sammenhængsignalet.
4. **27.–30. april Strasbourg plenarsession** — Q2-agendasætning; ledsagerens månedsfremsyn-noter dækker dette i detaljer.

---

## 🧭 ACH — "Stille men ladet"-læsningen

- **H1 — "Rutineferie + ekstern støj."** Risikoforløbet er artefakt af konvergerende eksterne hændelser, som lovgiveren ikke forårsagede; udvalgsgenoptagelse den 14. april absorberer belastningen efter planen. *Favoriseret af* rekordtempo ÅTD, strukturel stabilitetscore (84/100 fra ledsagerkørsler).
- **H2 — "Præfrakturbelastning."** Renew-ECR 0,95-sammenhæng er forløberen til en konkurrenceevne-koalitionspivot; storkoalitionens −5,5 % overskud-underskud er den underliggende svaghed, ikke de eksterne pres. *Favoriseret af* tidligere kørsels risikoforløb + fragmentering 6,59 + strukturelt IKKE-LEVEDYGTIG-fund om storkoalitionen.

Notatet læser H1 som planlægningens basislinje og H2 som det operationelt relevante stresstilfælde — *den første post-ferie-handelsafstemning* er falsifikatoren mellem dem.

---

## 🛡️ Vurdering af kildekvalitet

- **Ingen levende feeddata denne uge — 0 / 13 EP API-feeds operationelle den 10. april.** Enhver indikator er forudberegnet statistik eller afledt fra tidligere kørsler; dette er notets vigtigste forbehold.
- **MCP-serverhealthrapport** (bekræftet i kørsel) giver 🟢 HØJ konfidens om API-udfaldets art.
- **Risikoforløb** bruger 7 tidligere daglige kørsler (Kørsler 3, 4, 5, 6, 12, 157, 158); konvergens på tværs af uafhængige kørsler er det primære kompenserende bevis.
- **Nettokonfidens:** 🟡 MEDIUM for syntese; 🟢 HØJ for toldrisiko (ekstern publikationsrekord); 🟡 MEDIUM for Renew-ECR-tilpasning (sammenhængsdata er strukturel, adfærd uprøvet efter ferie).

---

## 📎 Kørselsartefakter (læs-inden-beslutning)

| Lag | Artefakt | Hvorfor |
|-----|----------|---------|
| Artikel | `article.md` | Offentlig fortælling om ferieuge |
| Syntese | `existing/synthesis-summary.md` | 8 indikatorer + 3-polstruktur (autoritativ) |
| Signifikans | `classification/significance-scoring.md` | Hændelsesinventar (ferie, told, Renew-ECR) |
| Risiko | `risk-scoring/risk-assessment.md` | Samlet 13,17/25, 7-kildeforløb |
| Trussel | `threat-assessment/threat-analysis.md` | Eksternpres-trusselflade |
| Interessenter | `existing/stakeholder-impact.md` | INTA, EU-industri, EPP's forretningsvinge |
| API-udfald | `existing/api-outage-diagnostic.md` | 0 / 13 feeds — konfidensgrænse |
| SWOT | `existing/swot-analysis.md` | Styrker/svagheder gennem ferien |
| Ledsager | `analysis/daily/2026-04-13/month-ahead-run4/` | Fremadskuende par til dette retrospektiv |

---

**Dokumentkontrol**
- **Skabelonreference:** `analysis/templates/executive-brief.md`
- **Artefaktsti:** `analysis/daily/2026-04-11/week-in-review-run8/executive-brief.md`
- **Klassificering:** Offentlig
- **Retrospektiv:** Notat skrevet 2026-05-16 fra kørslens committede artefakter; **ingen nye MCP-kald blev foretaget**. Den 🟡 MEDIUM-konfidens for syntese bevares, opgraderes ikke, fordi det underliggende API-udfald i kørelsesperioden er en permanent begrænsning for den uges datakvalitet.
