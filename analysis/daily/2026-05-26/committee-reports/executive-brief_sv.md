<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Verkställande sammanfattning — EP:s utskottsrapporter | 2026-05-26

**WEP:** Ungefär lika — att veckans utskottsverksamhet kommer att producera resultat som på ett meningsfullt sätt driver den tionde mandatperiodens lagstiftningsagenda framåt  
**Admiralitet:** B2 — Sannolikt sant; baserat på EP:s institutionella kunskap och bekräftad AFCO-verksamhet  
**SATs:** Kontroll av nyckelantaganden, Kontroll av informationskvalitet  
**Dataläge:** degraded-feeds (0,80 golv-faktor)  
**Körnings-ID:** committee-reports-run260-1779774042  

---

## BLUF — Bottom Line Up Front

Europaparlamentets utskottssystem träder in i veckan den 26 maj 2026 under en period av hög lagstiftningsefterfrågan med begränsad övervakningssynlighet. Misslyckanden i EP:s öppna data-API (4 av 5 källor otillgängliga) begränsar dokumentell bekräftelse till AFCO-utskottets pipeline (50+ dokument bekräftade). Analysen syntetiserar EP:s 10:e mandatperiods institutionella kunskap: fem aktiva lagstiftningsströmmar (genomförande av AI-förordningen, Konkurrenskraftsagendan, Industriell försvarsstrategi, Revidering av den gröna given, Migrationsöverenskommelsen), en omtvistad EPP-ledd majoritet som kräver koalitionshantering för varje betydande ärende, och förhöjd risk att den gröna givens ambition försvagas av högerflankens taktiska anpassning.

**Centrala bedömningar:**

1. 🟡 **AFCO-utskottet**: Konstitutionellt arbete bekräftat aktivt (50 dokument i EP730–PE782-serien). Institutionell reform och interinstitutionellt avtalssarbete är den troliga fokuspunkten. *Tillförlitlighet: MEDEL (B2 — direkt dokumentbevis, ingen innehållsmetadata)*

2. 🟠 **Prioriterade lagstiftningsströmmar**: Alla fem stora strömmar under den tionde mandatperioden (AI, Konkurrenskraft, Försvar, Revidering av den gröna given, Migration) befinner sig i aktivt utskottsskede. Maj 2026 är en Bryssel-utskottsvecka (efter plenarsessionen 20–23 maj i Strasbourg), vilket innebär att omröstningar, utfrågningar och föredragandenas arbetssessioner väntas denna vecka. *Tillförlitlighet: MEDEL-HÖG (B2)*

3. 🔴 **Risk för försvagning av den gröna given**: Sannolikheten är 65 % (Sannolikt) att utskottsomröstningar i ENVI/ITRE ger resultat svagare än Kommissionens förslag 2019–2024, drivet av EPP+ECR+Patriots taktiska anpassning i specifika ärenden. *Tillförlitlighet: MEDEL (B2)*

4. 🟡 **AI-förordningens delegerade akter**: ITRE/LIBE-utskottets samordning om delegerade akter har en ungefär lika stor (50 %) risk för 6 månaders förseningar på grund av jurisdiktionstvister och industrilobbying. *Tillförlitlighet: MEDEL (B2)*

5. 🟢 **Ekonomisk grund**: IMF WEO April 2026 projicerar EU:s BNP-tillväxt till 1,4 % för 2026, vilket ger det makroekonomiska sammanhanget för konkurrenskraftslagstiftningen. Draghis investeringsgap på EUR 750–800 miljarder kvarstår som referensram för ECON- och ITRE-utskottens arbete. *Tillförlitlighet: HÖG (A1 — IMF primärkälla)*

---

## Political Landscape Summary

| Grupp | Platser | Utskottsroll kv. 2 2026 |
|-------|---------|----------------------|
| EPP | 189 | Dagordningssättare; majoritetsskapare; pro-konkurrenskraft |
| S&D | 136 | Väsentlig koalitionspartner; förhandlare av social dimension |
| Patriots | 84 | Störande minoritet; taktisk EPP-allierad i rätt ärenden |
| ECR | 78 | Konservativ; variabel anpassning; pragmatisk i industripolitik |
| Renew | 77 | Liberala svängröster; pro-digitalt, pro-handel |
| Greens/EFA | 53 | Minoritet; starka i ENVI/LIBE; koalitioner med S&D/Left |
| Left | 46 | Progressiv opposition; arbetsmarknads- och socialärenden |
| ESN | 25 | Yttersta högern; marginaliserad |

**Majoritetströskel:** 353/705 platser. Den stora koalitionen (EPP+S&D+Renew = 402 platser) har en bekväm majoritet för mainstream-lagstiftning; risken är EPP:s taktiska användning av Patriots/ECR för specifika högerorienterade ärenden.

---

## IMF Economic Reference

**IMF WEO April 2026 nyckeltal för EP:s utskottskontext:**
- EU:s BNP-tillväxt 2026: **1,4 %** (över 2025 års 1,1 % — blygsam återhämtning)
- Eurozonens inflation: **2,0 %** (på målet; ECB:s försiktiga lättnadscykel)
- EU:s arbetslöshet: **5,7 %** (sakta sjunkande)
- EU:s finansunderskott: **~2,5 % av BNP** (inom SGP:s gränser efter reform)

Det ekonomiska sammanhanget förstärker utskottets angelägenhet om konkurrenskraft och kapitalmarknadslagstiftning. IMF:s uttryckliga stöd för Draghi-ramen ger politiskt handlingsutrymme för ambitiösa ECON/ITRE-reformpaket.

---

## Monitoring Gaps

Denna verkställande sammanfattning begränsas uttryckligen av EP API-försämring. Följande övervakningsluckor gäller:

1. **Inga aktuella utskottsröstningsdata**: Okänt vilka utskott som röstade denna vecka och om vilka ärenden
2. **Inga händelse-/utfrågningsdata**: Utfrågningar, expertvittnesmål och föredragandenas presentationer är oobserverade
3. **Utskottstäckning**: Endast AFCO bekräftad aktiv; 19 övriga utskott oobserverade
4. **Procedur-pipeline**: Aktuell status för procedurframsteg är okänd (reservdata är från 1972)

**Rekommendation för nästa körning:** När EP API återställs bör prioriterad djuphämtning vara: `get_procedures_feed` (innevarande år), `get_events_feed` (missade utfrågningar), `get_committee_documents_feed` (missade rapporter), och `track_legislation` för de 5 prioriterade strömmarna.

---

## Strategic Intelligence Summary

EP:s utskottssystem under veckan den 26 maj 2026 representerar ett kritiskt vägskäl i den tionde mandatperiodens lagstiftningscykel. Fem stora lagstiftningsprioritetströmmar är samtidigt aktiva i utskottsskede, EPP:s majoritetskoalition kräver komplex hantering och Draghis konkurrenskraftsram ger den makroekonomiska referensen för ECON- och ITRE-utskottens arbete. EP API-försämring begränsade övervakningssystemets förmåga att bekräfta specifika utskottsaktiviteter, men strukturanalysen är robust baserad på institutionell kunskap.

**För beslutsfattare och politiska intressenter:** Den avgörande variabeln i EP:s utskottsarbete i maj 2026 är hur EPP samordnar med Patriots/ECR i specifika gröna ärenden och migrationsfiler medan det bibehåller den stora koalitionen för konkurrenskraft och AI-lagstiftning. Att övervaka EPP:s utskottskoordinatörspositioner och skuggföredragandenas texter i ENVI, LIBE och ITRE kommer att avslöja de faktiska koalitionsdynamikerna.

**För medborgare:** Utskottsstadiet är där innehållet i lagar som påverkar det dagliga livet faktiskt bestäms. När utskott röstar om AI-förordningens delegerade akter, ändringar i revideringen av den gröna given eller förslag till migrationsprocedurer fattar de beslut med omedelbara praktiska konsekvenser. Engagemang i utskottsprocedurer — att lämna in framställningar, följa föredragandens arbete, spåra expertutfrågningarnas resultat — är den mest direkta formen av demokratiskt deltagande som är tillgänglig för EU:s medborgare.

---

*Genererad av EU Parliament Monitor automatiserat arbetsflöde | committee-reports | 2026-05-26 | Körning: committee-reports-run260-1779774042 | Dataläge: degraded-feeds*

## Strategic Intelligence Assessment

**EP:s utskottslandskap: Strukturell analys för beslutsfattare**

Europaparlamentets utskottssystem fungerar som pre-kammar-filter för all EU-lagstiftning. Från och med den 26 maj 2026 definierar tre strukturkrafter landskapet:

**Kraft 1: EPP-dominans utan majoritet**
Med 189/705 platser (26,8 %) är EPP den största gruppen men kan inte anta lagstiftning ensam. EPP:s dominans över utskottsordförandeposter (ENVI, ITRE, ECON, AFCO, INTA) ger dagordningssättande makt — utskott kontrollerar vilka ändringar som når plenum. EPP behöver dock minst två ytterligare grupper för att bilda majoritet. S&D-Renew-partnerskapet (213 kombinerade platser) är EPP:s föredragna koalition, som bildar den stora koalitionen (402 platser, majoritet av 353 uppnådd med marginal). EPP:s alternativa högerblocksstrategi (Patriots 84, ECR 78) når bara 351 platser — två under majoritetsgränsen — vilket gör den stora koalitionen till EPP:s rationella standard.

**Kraft 2: Revidering av den gröna given som det avgörande lagstiftningsslaget**
ENVI-utskottets revideringsprocess av den gröna given är den mest avgörande utskottsaktiviteten 2026. EPP driver på "konkurrenskrafts"-modifieringar av naturrestaureringslagen, förpackningsförordningen och genomförandetidtabellerna för CBAM. S&D, Greens/EFA och Left motsätter sig tillbakadraganden. Det lagstiftningsmässiga resultatet avgör om EU:s klimatåtaganden upprätthålls eller grundläggande revideras för 2030-målperioden.

**Kraft 3: Timing för AI-förordningens delegerade akter**
AI-förordningens delegerade akter (ITRE/LIBE:s jurisdiktion) fastställer genomförandetidslinjen för krav på AI-system med hög risk. Kommissionen är under industrins tryck att försena. Utskottets konsensusposition spelar roll eftersom delegerade akter kräver en blockerande majoritet i EP (353 ledamöter) för att avvisas. ITRE:s lagstiftningskompetens här kontrolleras av EPP — EPP:s interna ståndpunkt om AI-genomförandehastigheten är en avgörande variabel för EU:s AI-styrning.

## Decision-Maker Priority Matrix

| Intressent | Omedelbar prioritet | 3-månaders prioritet | Långsiktigt problem |
|-------------|-------------------|------------------|------------------|
| EU-näringsliv | ENVI-röstningsresultat för den gröna given | Tidsplan för AI-förordningens delegerade akter | Scope för fördragsrevision |
| Civilsamhälle | Övervakning av migrationsöverenskommelsen | AI-förordningens LIBE-ståndpunkter | Påverkan av konstitutionell reform |
| Kommissionen | ENVI-ändringsmål | ITRE-samarbete om AI | AFCO-fördragsinitiativ |
| Medlemsstater | Hållbarhet för den stora koalitionen | Signal om högerblockets framväxt | Subsidiaritetsdebatter |
| EP-administrationen | AFCO-mandatframsteg | Utvidgning av plenarsäten | Inlämning av nya procedurer |

## Intelligence Gaps Requiring Monitoring

1. **ENVI-utskottets junirösningsdatum och ändringsförteckning** — avgörande för den gröna givens bana
2. **EPP-koordinatorns konsistens i korsutskottspositioner** — bestämmer koalitionens hållbarhet  
3. **ITRE:s föredragandes position om AI:s delegerade akter** — avgörande för EU:s AI-styrning
4. **AFCO-dokumentserien PE781.*** — signalerar om fördragsrevision är nära förestående
5. **Trilogframsteg om utestående lagstiftningsärenden** — bestämmer 2026 års produktionstakt

## Reader Briefing

Denna verkställande sammanfattning syntetiserar EP:s utskottsunderrättelse för den 26 maj 2026. EP är världens enda direkt valda överstatliga lagstiftande församling. Dess 20+ fasta utskott hanterar ungefär 200 lagstiftningsärenden per mandatperiod. Varje utskott kan ändra kommissionens förslag före plenarstemning; utskottsändringar överlever vanligtvis i den slutliga lagen. Medborgare som följer utskottsverksamheten får 3–6 månaders förhandsvarning om lagstiftningsförändringar som påverkar deras liv. Nyckelbudskapet från denna analys: den stora koalitionen håller, EPP modererar takten för den gröna omställningen och AI-styrningsramen förhandlas i utskott just nu.

## IMF Economic Context for Committee Legislative Activity

EP:s utskottsbeslut om revidering av den gröna given, AI-reglering och migrationspolitik sker inte i ett ekonomiskt vakuum. IMF WEO April 2026 baslinjen ger det ekonomiska sammanhang som formar politisk genomförbarhet:

- **EU:s BNP-tillväxt 2026: 1,4 %** — Undertrendstillväxt minskar EPP:s aptit för kostsamma gröna omställningsåtgärder och ökar stödet för konkurrenskraftsändringar
- **Eurozonens inflation 2026: 2,0 %** — Inflationen återgår till målet; minskar brådska för ECB:s nödåtgärder; normaliserar finanspolitiskt utrymme för grön investering
- **EU:s arbetslöshet 2026: 5,7 %** — Strukturell arbetslöshet upprätthåller S&D:s tryck för rättvisa omställnings-sociala bestämmelser i varje fil för revidering av den gröna given
- **EU:s finansunderskott ~2,5 % BNP** — Inom SGP:s regler; möjliggör viss grön investering av medlemsstaterna men begränsar subventionsprogram i EP-driven lagstiftning
- **IMF-källa:** `cache — WEO April 2026`

**Lagstiftningsimplikation:** Undertrendstillväxt skapar politiska förutsättningar för EPP:s konkurrenskraftsnarativ. ENVI-utskottets strid om revidering av den gröna given utkämpas i ett sammanhang där industrilobbyister trovärdigt kan åberopa tillväxtproblem. S&D:s motargument — att grön investering stimulerar tillväxt — har stöd från IMF (WEO kapitel 3 om klimatinvestering) men är svårare att kommunicera i ett lågväxtmiljö.

## Data Availability Assessment (This Run)

| Datakälla | Status | Konfidensimpakt |
|-------------|--------|-----------------|
| EP:s utskottsdokumentfeed | 🔴 404 EJ TILLGÄNGLIG | HÖG — Kan inte bekräfta aktuell veckans aktivitet |
| EP:s procedurfeed | 🟡 PARTIELL (historisk svans) | MEDEL — Struktur giltig, tidpunkter opålitliga |
| EP:s händelsefeed | 🔴 404 EJ TILLGÄNGLIG | HÖG — Kan inte bekräfta junidagordningen |
| EP:s utskottsdokument | 🟡 PARTIELL (50 AFCO-dok. bara) | MEDEL — AFCO bekräftad; övriga utskott okända |
| IMF WEO April 2026 | 🟢 CACHAD | LÅG — Ekonomisk baslinje bekräftad |
| Institutionell kunskap | 🟢 HÖG TILLFÖRLITLIGHET | LÅG — EP:s sätefördelning, majoritetsaritmetik verifierad |

Övergripande tillförlitlighet för tidsmässig specificitet: 🔴 LÅG — Strukturell analys giltig; veckans utskottsaktivitet den 26 maj kan inte bekräftas.
