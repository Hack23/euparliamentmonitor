---
title: "Johdon tiedote — EP Juokseva Ajo 156, 10. huhtikuuta 2026 (Pääsiäisloma Päivä 15)"
description: "Pääsiäisloma päivä 15; T-5 ennen tariffiaktivointia; 28 minuutin analyysiikkuna 18:17–18:45 UTC."
date: 2026-04-10
article_type: breaking-run156
slug: 2026-04-10-breaking-run156
source_folder: analysis/daily/2026-04-10/breaking-run156
generated_at: 2026-04-10T18:17:00.000Z
language: fi
layout: brief
---

# Johdon tiedote — Ajo 156, 10. huhtikuuta 2026 (Pääsiäisloma Päivä 15, T-5)

## BLUF

Ajo 156 on **Pääsiäisloma Päivä 15, T-5** -katkosluotaus, toteutettu 28 minuutin analyysi-ikkunan aikana (18:17–18:45 UTC). T-5 = 5 päivää ennen TA-0096 / TA-0097:n lakisääteistä aktivointia 15. huhtikuuta. Päivä-15-sijainti on lomaklusterin rakenteellinen keskipiste; seuraavat ajot lähestyvät progressiivisesti aktivointipäivämäärää. *Luottamustaso: KESKITASO; Admiralty: B2.*

## Three Decisions

1. **Dokumentoi 28 minuutin analyysikkunan telemetria operatiivisesti terveeksi.** Analyyttinen suoritusaika kirjekuoren sisällä vahvistaa pipeline-tehokkuuden heikentyneissä syötetiloissa. *Luottamustaso: KORKEA.*
2. **Ankkuroi T-5-lukema loman puolivälin esiaktivoinnin lähtötasoksi.** Tulevat ajot mittaavat liikeradan T-0:aa vasten tätä ankkuripistettä vasten. *Luottamustaso: KESKI-KORKEA.*
3. **Ylläpidä ANALYSIS_ONLY-kuriini T-5:n läpi.** Mitään uuden signaalin kynnysylitystä ei odoteta; porttitoiminnon on pidettävä. *Luottamustaso: KORKEA.*

## 60-Second Read

T-5 loman puolivälin luotaukset ovat operatiivisesti rutiininomaisia, mutta menettelyllisesti tärkeitä: ne ylläpitävät analyysipipelinen päivittäistä tahtia ja osoittavat, että jopa loman puolivälipäivät voivat tuottaa viitetason artefakteja heikentyneillä syötteillä.

## Risk Snapshot

| Riski | Todennäköisyys | Vaikutus |
|---|---:|---:|
| ANALYSIS_ONLY-portti epäonnistuu T-N-kalenterissa | MATALA | MATALA |
| Pipeline-telemetria liukuu kirjekuoren ulkopuolelle | MATALA | KESKI |
| T-5-lukema epäjohdonmukainen aiempien T-N-pisteiden kanssa | MATALA | MATALA–KESKI |

## Source Quality

- Pipeline-telemetria (18:17–18:45 UTC): **A1**
- T-N-ankkurilukema: **B2**

## Provenance

- Ajo: `breaking-run156` (2026-04-10, Lomapäivä 15, T-5)
- Vaatimustenmukaisuus: Vain EP Open Data Portal -syötteet. GDPR-yhteensopiva.

---
*Analyyttinen puolueettomuus: T-N-kehys merkitty.*
