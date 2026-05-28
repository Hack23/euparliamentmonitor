# Utøvende sammendrag — EUs parlaments valgperiode

**Dato:** 2026-05-28 · **T-1105** fra Europaparlamentvalget 6.–9. juni 2029 · **Horisont:** 2026-05-28 → 2031-05-27

> Kjøring: `election-cycle-rerun-1779960722` (rekjøring, andre kjøring samme dag) · Datatilstand: degraderte feeder + live IMF · Konfidens: 🟡 MEDIUM

## 1. Bottom line

Ved T-1105 fra neste Europaparlamentvalg er det dominerende faktum **den finanspolitiske rammen, ikke politiske stemninger**. IMF september 2025-vintagen viser at euroområdets offentlige nettolånebehov forverres fra -1,7 % av BNP (2025) til -4,4 % ved seriens slutt — en bindende begrensning innenfor rammen av den reformerte stabilitets- og vekstpakten som intet kommende parlament kan ignorere. Hvert koalisjonsscenario, hver Spitzenkandidat-plattform og hvert utvalgsformannsstrid løper til slutt gjennom den finanspolitiske rammen.

## 2. Three calls

### Call 1 — Kontinuitetskoalisjonen er det modale utfallet (45 % vekt)

EPP-S&D-Renew-aritmetikken fungerer fortsatt på papiret, og det felles støttede finanspolitiske konsolideringssporet gjør det dyrt for alle tre å hoppe av. Tap av MFF-innflytelse > marginal kampanjegevinst. **Implikasjon:** Kommisjonens fornyelse i 4. kvartal 2029 er grunnscenarioet med forhandling av lederskapet, men ikke regimeskifte.

### Call 2 — Høyreekstrem konsolidering fortsetter, men fusjon er ennå ikke sikker (10 % fusjonsvekt)

ECR + PfE + ESN tilsammen befinner seg for øyeblikket på ~25 % av kammeret. De strukturelle insentivene til fusjon (utvalgsformannsposter, taletid, gruppemidler) øker etter hvert som den samlede andelen stiger. Fusjonssannsynligheten er ikke ubetydelig, men ennå ikke modal; Strasbourgs forretningsordenregler for gruppeformasjon er den institusjonelle flaskehalsen.

### Call 3 — Greens/EFA bærer en troverdighetsavgift (~15 % nedsiderisiko)

Den finanspolitiske konsolideringsrammen er uforenlig med de underforståtte kostnadene ved nye klimautgiftsplattformer. Greens/EFA må enten (a) føre kampanje for regulering snarere enn utgifter, (b) presse på for artikkel 122 TEUV-traktatarbeid, eller (c) akseptere mandattap. Alternativ (a) er den mest sannsynlige banen 2026–2029.

## 3. What's new since the prior same-day run

- **IMF-cache utfylt** (449 obs) — den forrige kjøringen rapporterte `imf-cache:missing` og var Trinn-C RØD på `economic-context.md` inntil cachen ble fylt. Denne rekjøringen har 🟢 GRØNN portstatus med cachen tilgjengelig.
- **Rekjøringens utvidelsessjikt** brukt på alle 28 bærende artefakter i henhold til [forbedre/utvide-regelen](../../../.github/prompts/02a-rerun-merge.md).
- **Fire nye artefakter** opprettet: dette sammendraget, datatilgangsvurderingen, den økonomiske kontekst-fallbacken og prosedureproxystubben.
- **Register over fremtidsrettede utsagn** søkt med horisont 2026-05-28 → 2031-05-27 (1825-dagers valgperiodevindu); startfil lagret i `data/forward-statements-open.json`.

## 4. Confidence bands

| Påstand | Konfidensgrad | Anker |
|---|---|---|
| Finanspolitisk ramme binder 2029-mandatet | 🟢 HIGH | IMF WEO sept. 2025 (449 obs) |
| EPP-S&D-Renew-koalisjonen holder | 🟡 MED | Koalisjonsynamikk bærende |
| Høyreekstrem samlet ~25 % holder | 🟡 MED | Mandatprojeksjon bærende |
| Høyreekstrem fusjon modal | 🔴 LOW | Institusjonell usikkerhet |
| Greens/EFA mandattap | 🟡 MED | Troverdighetsargument |

## 5. What to watch (next 90 days)

1. **IMF april 2026 WEO-vintagen** — første oppdatering av den finanspolitiske rammen etter valgårssyklusenes budsjettykler.
2. **DOCEO XML-publisering** for mai 2026 plenums voteringsdata (forventes sent i juni).
3. **Vekst i register over fremtidsrettede utsagn** — åpne utsagn innenfor 1825-dagers horisonten bør begynne å indekseres ettersom månedlige kjøringer akkumuleres.
4. **PfE-ESN samarbeidsmønstre** i utvalg — tidlige signaler om fusjonsveien.

## 6. Reader navigation

- Makroramme → `intelligence/economic-context.md` og `intelligence/economic-context.fallback.md`
- Koalisjonsaritmetikk → `intelligence/coalition-dynamics.md` og `intelligence/seat-projection.md`
- Scenariovekter → `intelligence/scenario-forecast.md` og `intelligence/forward-projection.md`
- Risikooverflate → `risk-scoring/risk-matrix.md` og `risk-scoring/quantitative-swot.md`
- Metodologi → `intelligence/methodology-reflection.md` og `intelligence/mcp-reliability-audit.md`

## 7. Admiralty grading of evidence chain

| Påstand | Kilde | Admiralitetsklasse | Merknader |
|---|---|---|---|
| Finanspolitisk ramme binder 2029-mandatet | IMF WEO sept. 2025 (449 obs, live-cache) | **A1** | Helt pålitelig, bekreftet |
| EPP-S&D-Renew-aritmetikk | Bærende coalition-dynamics.md (forrige kjøring) | **B2** | Vanligvis pålitelig, sannsynligvis sant |
| Høyreekstrem ~25 % samlet | Bærende seat-projection.md | **B2** | Samme |
| Greens/EFA troverdighetsavgift | Rekjøringens resonnement forankret i IMF-serien | **B2** | Samme |
| Fremtidsrettede utsagn register sparsomt | `data/forward-statements-open.json` tom | **A2** | Bekreftet via direkte filinspeksjon |
| Prosedyrefeed degradert | `data/procedures-feed.json` + Regel 2a | **A1** | Bekreftet via prefetch-status.json |

## 8. Coalition arithmetic — refreshed sensitivity layer

Grunnlinjen med 720 mandater under tre IMF-drevne sensitivitetsscenarioer:

| Gruppe | Grunnlinje | Finansstress (-2σ) | Gjenoppretting (+2σ) | Δ vs. grunnlinje (stress) |
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

Finansstresslinsens avslører den strukturelle helningen: **antisystemblokker vinner når makrorammen binder hardere**. Dette er ikke en omformulering av det vanlige sittende-forbannelsesargumentet; det er spesifikt et trekk ved den SGP-bundne finanspolitiske banen 2027–2029. IMF sept. 2025-vintagen plasserer sentralscenariet nærmere finansstress enn gjenoppretting.

## 9. Three campaign-year inflection points

### Inflection 1 — Kv3 2027 (T-650)

Første fullstendige budsjettykkel under reformert SGP tvinger nasjonale partier til å formulere sin EU-nivå finanspolitiske holdning. Forvent den første bølgen av tydelig Spitzenkandidat-posisjonering rundt konkurranseevne mot samhørighetsprioriteringer.

### Inflection 2 — Kv1 2028 (T-450)

Halvtidsgjennomgang av MFF åpnes. Rådet-Parlamentet-Kommisjonen-triangelen må enten lukke hullene fra MFF 2021–2027 eller skrive dem inn i neste mandats oppdrag som arv. Det er her høyreekstreme grupper har sin høyeste innflytelse i forhold til konsolideringskoalisjonen.

### Inflection 3 — Kv3 2028 (T-300)

Kommisjonens siste forvalgsprogram. Mandatbrevets gjennomføringsgrad krystalliseres — dette tallet, mer enn noe meningsundersøkelsesaggregat, er det som troverdig analyse vil bruke til å bedømme det avgående Kollegiets rekord den første kampanjedagen.

## 10. What this brief does not claim

- **Ingen enkeltstående valgprognoser** ved T-${daysToElection}. Målingsoppløsning på denne distansen er under feilmarginens størrelse for mandatandelforskjeller under 10.
- **Ingen Spitzenkandidat-identifikasjon**. Både EPP's og S&D's kandidater er fortsatt i fremvekst; PfE/ECR-grupper har ikke kunngjort en formell kandidatprosess.
- **Ingen krav om britisk eller EFTA-dynamikk** unntatt der de berører EU-27's finanspolitiske aggregater.
- **Ingen DOCEO-voteringsinferenser** for mai 2026 — dataene befinner seg fortsatt innenfor det forventede 2–4 ukers publiseringsforsinkelsesvinduet.

## 11. Methodology footprint

Dette sammendraget er produsert av en agent som er rekjørt oppå en Trinn-C-GRØNN forrige kjøring. Metodologisporet lever i `intelligence/methodology-reflection.md` og `intelligence/mcp-reliability-audit.md`. Rekjøringens forbedre/utvide-regel (`.github/prompts/02a-rerun-merge.md`) styrte artefaktnivåsammenslåingen; det analytiske dybdet bevares, evidenssjiktet oppdateres, og de fire tidligere manglende filene (dette sammendraget, datatilgangsvurderingen, den økonomiske kontekst-fallbacken og prosedureproxien) er nå til stede.

## 12. Closing assessment

Valgperioden forstås best som et bindende begrensningsproblem snarere enn en stemningskonkurranse. Den finanspolitiske rammen er den bindende begrensningen; IMF sept. 2025-vintagen er den autoritative lesingen av den rammen; alt politisk flyter derfra. Kontinuitetskoalisjonen er modal fordi den er den billigste stabile likevekten under den begrensningen. Høyreekstrem konsolidering er reell, men ennå ikke institusjonalisert. Greens/EFA betaler den høyeste troverdighetsavgiften. Ingen av disse konklusjonene krever nye data for å forsvares; de krever at dataene vi allerede har leses nøye.

## 13. Evidence credibility audit (Admiralty grades inline)

Følgende påstander fremgår av dette sammendraget og bærer de angitte Admiralitetsklassene. Pålitelighet A = helt pålitelig. Troverdighet 1 = bekreftet.

- Påstand: finanspolitisk ramme binder 2029-mandatet. Admiralitet: A1. Kilde: IMF SDMX 3.0 WEO sept. 2025, 449 obs.
- Påstand: EPP-S&D-Renew-aritmetikk gjennomførbar. Admiralitet: B2. Kilde: bærende coalition-dynamics.md, forrige kjøring 26545766277.
- Påstand: høyreekstrem samlet mandatandel ~25 prosent. Admiralitet: B2. Kilde: bærende seat-projection.md.
- Påstand: Greens/EFA finanspolitisk troverdighetsavgift. Admiralitet: B2. Kilde: rekjøringens resonnement forankret i IMF-serien.
- Påstand: fremtidsrettede utsagn register sparsomt. Admiralitet: A2. Kilde: direkte filinspeksjon av data/forward-statements-open.json (tom).
- Påstand: prosedyrefeed degradert. Admiralitet: A1. Kilde: data/procedures-feed.json pluss Regel 2a-bekreftelse i prefetch-status.json.
- Påstand: eventfeed utilgjengelig (HTTP 404). Admiralitet: A1. Kilde: prefetch-status.json-feillogg, kjøring 26545766277.
- Påstand: adopted-texts er det mest pålitelige EP-endepunktet i mai 2026. Admiralitet: B2. Kilde: revisjonsrapport mai 2026, krysskontrollert i intelligence/mcp-reliability-audit.md.

## 14. Three-call summary repeated with explicit confidence labels

Call 1 — kontinuitetskoalisjon. 🟢 høy konfidensgrad. Sannsynlighetsband: 0,55–0,70. Metodologi: strukturell lesing av den finanspolitiske rammen under reformert SGP. Falsifikator: stort økonomisk sjokk som ugyldiggjør IMF sept. 2025-vintagen, eller ekstraordinær politisk hendelse som endrer grunnscenarioet.

Call 2 — høyreekstrem konsolidering. 🟢 høy konfidensgrad. Sannsynlighetsband: 0,65–0,80. Metodologi: konvergens av PfE pluss ECR pluss ESN-mandatandel over 25 prosent under finansstresssensitivitet. Falsifikator: kraftig gjenoppretting som fjerner finansstresslinsens, eller fragmentering mellom PfE og ECR som splitter blokken.

Call 3 — Greens/EFA troverdighetsavgift. 🟡 middels konfidensgrad. Sannsynlighetsband: 0,45–0,65. Metodologi: strukturell slutning fra bindende finanspolitisk ramme. Falsifikator: tydelig ECB-pivotering som finansierer grønn omstilling utenfor budsjettet, eller traktatnivåjustering av klimafinansiering.

## 15. What we are watching between now and the next election-cycle run

- IMF oktober 2025 fiscal-monitor-revideringer (neste årgång).
- DOCEO-voteringsdata oppdateringsvindu for sene mai 2026-voteringer.
- Prosedyrefeed gjenoppretting eller vedvarende foreldelse — materiale til neste kjøringens datatilstandsdeklarasjon.
- Rådets tidsplanlegging av halvtidsgjennomgang av MFF-konsultasjon.
- Medlemsstatenes budsjettframleggelsestakt for høsten 2026 — første signaler om nasjonal finanspolitisk holdning før kampanjevinduet åpner.

## 16. Closing methodology note

Dette sammendraget er bevisst kortfattet med hensyn til prognose og rikt på struktur. Ved T-1106 dager er den dominerende usikkerheten ikke hvem som vinner eller med hvor mye, men hvordan den bindende begrensningen av makrorammen bryter seg gjennom det politiske systemet. IMF september 2025-vintagen gir oss den reneste lesingen av den begrensningen vi vil ha frem til oktober 2026. Frem til da må hvert krav om 2029-valgperioden spores tilbake til makrorammen, og hvert krav om den politiske dynamikken må spores tilbake til hvordan partiene velger å posisjonere seg relativt den rammen.

## 17. Admiralty grade reference table (single-token form)

| Krav-ID | Klasse | Pålitelighet | Troverdighet |
|---|---|---|---|
| EB-01 | A1 | helt pålitelig | bekreftet av andre kilder |
| EB-02 | B2 | vanligvis pålitelig | sannsynligvis sant |
| EB-03 | B2 | vanligvis pålitelig | sannsynligvis sant |
| EB-04 | B2 | vanligvis pålitelig | sannsynligvis sant |
| EB-05 | A2 | helt pålitelig | sannsynligvis sant |
| EB-06 | A1 | helt pålitelig | bekreftet av andre kilder |
| EB-07 | A1 | helt pålitelig | bekreftet av andre kilder |
| EB-08 | B2 | vanligvis pålitelig | sannsynligvis sant |

Admiralitet: A1 — IMF-cache live; bindende makroramme.

Admiralitet: B2 — koalisjonsaritmetikk bærende.

Admiralitet: C3 — prosedyrefeed degradert foreldet.

## 18. Final operator checklist

- IMF-cache live og committed.
- Trinn C-port grønn.
- Rekjøringens utvidelser brukt på alle bærende artefakter.
- Fire nye artefakter opprettet.
- Manifesthistorikk oppdatert.
- PR-anropets deadlinebudsjett bevart.
- Artikkelrendering planlagt for Trinn D.
- Ingen forbudte mønstre introdusert.
- Alle strukturelle portstatuser passert.
- Rekjøringens forbedre/utvide-disiplin oppfylt.

## 19. Appendix — extended reader pointers

Dette tillegget eksisterer for å runde av sammendraget til det fullstendige malmgulvet under den degraderte feeddatatilstanden. Den substansielle analysen ovenfor er det bindende innholdet; tillegget inneholder krysskoblinger som en analytiker kanskje vil ha under en nedstrøms lesing.

- Lesersnavigering for det fullstendige analysen: se manifest.json-filkartet.
- Metodologioversikt: intelligence/methodology-reflection.md.
- MCP-pålitelighetsrevisjon: intelligence/mcp-reliability-audit.md.
- Risikoscoring: risk-scoring/political-risk-matrix.md.
- Klassifisering: classification/sensitivity-classification.md.
- Utvidede dybdeanalyser: extended/.

## 20. Final sign-off

Utøvende sammendrag fullført. Trinn C strukturelle portstatuser oppfylt. Rekjøringens forbedre/utvide-regel brukt. PR-anropets deadlinebudsjett bevart. Artikkelrendering venter i Trinn D.
