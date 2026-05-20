// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module swot-builder-eu
 * @description Per-language entries (en, sv, da, no, fi, de, fr) for SWOT_BUILDER_STRINGS.
 */

import type { LanguageMap, SwotBuilderStrings } from '../../types/index.js';

export const SWOT_BUILDER_STRINGS_EU: Pick<LanguageMap<SwotBuilderStrings>, 'en' | 'sv' | 'da' | 'no' | 'fi' | 'de' | 'fr'> = {
  en: {
    votingHighCohesion: (n) =>
      `${n} political groups with cohesion above 80% — disciplined voting blocs`,
    votingAdopted: (n) => `${n} texts adopted — demonstrates legislative productivity`,
    votingActiveVotes: (n) => `${n} votes recorded — active plenary engagement`,
    votingLowCohesion: (n) =>
      `${n} groups with cohesion below 50% — internal divisions weaken bargaining power`,
    votingAnomalies: (n) =>
      `${n} voting anomalies detected — signals unpredictable coalition behaviour`,
    votingCrossParty: 'Cross-party alliances on specific legislation can build broader consensus',
    votingDiverseGroups: (n) =>
      `${n} active political groups — diverse coalition formation possibilities`,
    votingHighSeverity: (n) => `${n} high-severity anomalies — risk of coalition fragmentation`,
    votingShiftingAlliances: 'Shifting alliances may delay legislative progress on key files',
    prospectiveEvents: (n) => `${n} plenary events scheduled — active legislative agenda`,
    prospectiveCommittees: (n) => `${n} committee meetings — broad policy engagement`,
    prospectiveBottlenecks: (n) => `${n} legislative procedures facing bottleneck risks`,
    prospectiveHighDensity: (n) => `High event density (${n}) risks compressed debate time`,
    prospectiveDocuments: (n) => `${n} documents under consideration — legislative momentum`,
    prospectiveQuestions: (n) =>
      `${n} parliamentary questions — MEP engagement with citizen concerns`,
    prospectiveBottleneckRisk:
      'Bottleneck procedures may force procedural shortcuts or defer key files',
    prospectiveSchedulingRisk: 'Scheduling density increases risk of last-minute amendments',
    breakingAdopted: (n) => `${n} texts adopted — Parliament demonstrating legislative capacity`,
    breakingEvents: (n) => `${n} parliamentary events — active institutional engagement`,
    breakingAnomalyWeakness: 'Voting anomalies detected — potential coalition instability',
    breakingNoProcedures: 'No new legislative procedures — limited pipeline momentum',
    breakingProceduresActive: (n) => `${n} procedures advancing — legislative pipeline active`,
    breakingCoalitionOpportunity:
      'Coalition dynamics shifting — new alliance opportunities emerging',
    breakingAnomalyThreat: 'Detected anomalies may signal deeper political realignment',
    breakingRapidEvents: 'Rapidly evolving events may outpace legislative response capacity',
    propositionsHealthStrong: (pct) => `Pipeline health at ${pct}% — strong legislative management`,
    propositionsThroughputGood: (n) => `Throughput rate ${n} — healthy processing pace`,
    propositionsHealthWeak: (pct) => `Pipeline health at ${pct}% — legislative congestion risk`,
    propositionsThroughputLow: (n) =>
      `Low throughput (${n}) — slow processing delays policy implementation`,
    propositionsPrioritisation: 'Prioritisation of flagship files can improve pipeline efficiency',
    propositionsTrilogueAcceleration: 'Trilogue acceleration on mature files can boost throughput',
    propositionsCriticalCongestion:
      'Critical pipeline congestion may force legislative file abandonment',
    propositionsOverlapping:
      'Overlapping implementation timelines strain member state transposition capacity',
    committeeActive: (active, total) =>
      `${active} of ${total} committees actively producing documents`,
    committeeDocuments: (n) => `${n} documents produced — strong legislative output`,
    committeeInactive: (n) => `${n} committees with no recent document activity`,
    committeeCrossCollaboration:
      'Cross-committee collaboration on horizontal policy files can increase impact',
    committeeHearings: 'Committee hearings provide platform for expert stakeholder engagement',
    committeeLowActivity: 'Low committee activity risks legislative bottlenecks downstream',
    committeeCompetingPriorities: 'Competing policy priorities may dilute committee focus',
  },
  sv: {
    votingHighCohesion: (n) =>
      `${n} politiska grupper med sammanhållning över 80 % — disciplinerade röstningsblock`,
    votingAdopted: (n) => `${n} texter antagna — visar lagstiftande produktivitet`,
    votingActiveVotes: (n) => `${n} röster registrerade — aktivt plenarengagemang`,
    votingLowCohesion: (n) =>
      `${n} grupper med sammanhållning under 50 % — interna splittringar försvagar förhandlingskraft`,
    votingAnomalies: (n) =>
      `${n} röstningsanomalier upptäckta — signalerar oförutsägbart koalitionsbeteende`,
    votingCrossParty:
      'Tvärgruppsallianser kring specifik lagstiftning kan bygga bredare samförstånd',
    votingDiverseGroups: (n) => `${n} aktiva politiska grupper — mångsidiga koalitionsmöjligheter`,
    votingHighSeverity: (n) => `${n} allvarliga anomalier — risk för koalitionsfragmentering`,
    votingShiftingAlliances:
      'Skiftande allianser kan fördröja lagstiftningsframsteg i viktiga ärenden',
    prospectiveEvents: (n) => `${n} plenarsessioner planerade — aktiv lagstiftningsagenda`,
    prospectiveCommittees: (n) => `${n} utskottsmöten — brett politiskt engagemang`,
    prospectiveBottlenecks: (n) => `${n} lagstiftningsförfaranden med flaskhalsrisk`,
    prospectiveHighDensity: (n) => `Hög händelsetäthet (${n}) riskerar komprimerad debattid`,
    prospectiveDocuments: (n) => `${n} dokument under behandling — lagstiftande momentum`,
    prospectiveQuestions: (n) => `${n} parlamentariska frågor — MEP-engagemang för medborgarfrågor`,
    prospectiveBottleneckRisk:
      'Flaskhalsförfaranden kan tvinga fram genvägar eller skjuta upp viktiga ärenden',
    prospectiveSchedulingRisk:
      'Hög schemaläggningstäthet ökar risken för ändringsförslag i sista minuten',
    breakingAdopted: (n) => `${n} texter antagna — parlamentet visar lagstiftningskapacitet`,
    breakingEvents: (n) => `${n} parlamentariska händelser — aktivt institutionellt engagemang`,
    breakingAnomalyWeakness: 'Röstningsanomalier upptäckta — potentiell koalitionsinstabilitet',
    breakingNoProcedures: 'Inga nya lagstiftningsförfaranden — begränsat pipelinemomentum',
    breakingProceduresActive: (n) => `${n} förfaranden framskrider — lagstiftningspipelinen aktiv`,
    breakingCoalitionOpportunity: 'Koalitionsdynamiken förändras — nya alliansmöjligheter uppstår',
    breakingAnomalyThreat: 'Upptäckta anomalier kan signalera djupare politisk omgruppering',
    breakingRapidEvents: 'Snabbt utvecklande händelser kan överskrida lagstiftningskapaciteten',
    propositionsHealthStrong: (pct) => `Pipelinehälsa på ${pct} % — stark lagstiftningshantering`,
    propositionsThroughputGood: (n) => `Genomströmning ${n} — hälsosam behandlingstakt`,
    propositionsHealthWeak: (pct) => `Pipelinehälsa på ${pct} % — risk för lagstiftningsträngsel`,
    propositionsThroughputLow: (n) =>
      `Låg genomströmning (${n}) — långsam behandling fördröjer politiska åtgärder`,
    propositionsPrioritisation:
      'Prioritering av flaggskeppsfiler kan förbättra pipelineeffektiviteten',
    propositionsTrilogueAcceleration:
      'Trilogacceleration av mogna ärenden kan öka genomströmningen',
    propositionsCriticalCongestion:
      'Kritisk pipelineträngsel kan tvinga fram att lagstiftningsfiler överges',
    propositionsOverlapping:
      'Överlappande genomförandetidslinjer belastar medlemsstaternas införlivandekapacitet',
    committeeActive: (active, total) => `${active} av ${total} utskott producerar aktivt dokument`,
    committeeDocuments: (n) => `${n} dokument producerade — stark lagstiftande produktion`,
    committeeInactive: (n) => `${n} utskott utan nylig dokumentaktivitet`,
    committeeCrossCollaboration:
      'Samarbete mellan utskott kring horisontella policyfiler kan öka genomslaget',
    committeeHearings: 'Utskottsutfrågningar ger plattform för expertintressenters engagemang',
    committeeLowActivity: 'Låg utskottsaktivitet riskerar lagstiftningsflaskhalsar nedströms',
    committeeCompetingPriorities:
      'Konkurrerande politiska prioriteringar kan späda ut utskottens fokus',
  },
  da: {
    votingHighCohesion: (n) =>
      `${n} politiske grupper med samhørighed over 80 % — disciplinerede stemmeblokke`,
    votingAdopted: (n) => `${n} tekster vedtaget — viser lovgivningsmæssig produktivitet`,
    votingActiveVotes: (n) => `${n} afstemninger registreret — aktivt plenarengagement`,
    votingLowCohesion: (n) =>
      `${n} grupper med samhørighed under 50 % — interne splittelser svækker forhandlingskraft`,
    votingAnomalies: (n) =>
      `${n} stemmeanomalier opdaget — signalerer uforudsigeligt koalitionsadfærd`,
    votingCrossParty: 'Tværpolitiske alliancer om specifik lovgivning kan skabe bredere konsensus',
    votingDiverseGroups: (n) => `${n} aktive politiske grupper — mangfoldige koalitionsmuligheder`,
    votingHighSeverity: (n) => `${n} alvorlige anomalier — risiko for koalitionsfragmentering`,
    votingShiftingAlliances:
      'Skiftende alliancer kan forsinke lovgivningsfremskridt i vigtige sager',
    prospectiveEvents: (n) => `${n} plenarmøder planlagt — aktiv lovgivningsdagsorden`,
    prospectiveCommittees: (n) => `${n} udvalgsmøder — bredt politisk engagement`,
    prospectiveBottlenecks: (n) => `${n} lovgivningsprocedurer med flaskehalsrisiko`,
    prospectiveHighDensity: (n) => `Høj begivenhedstæthed (${n}) risikerer komprimeret debattid`,
    prospectiveDocuments: (n) => `${n} dokumenter til behandling — lovgivningsmæssigt momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlamentariske spørgsmål — MEP-engagement med borgerbekymringer`,
    prospectiveBottleneckRisk:
      'Flaskehalsprocedurer kan fremtvinge proceduremæssige genveje eller udskyde vigtige sager',
    prospectiveSchedulingRisk:
      'Planlægningstæthed øger risikoen for ændringsforslag i sidste øjeblik',
    breakingAdopted: (n) => `${n} tekster vedtaget — parlamentet demonstrerer lovgivningskapacitet`,
    breakingEvents: (n) => `${n} parlamentariske begivenheder — aktivt institutionelt engagement`,
    breakingAnomalyWeakness: 'Stemmeanomalier opdaget — potentiel koalitionsinstabilitet',
    breakingNoProcedures: 'Ingen nye lovgivningsprocedurer — begrænset pipeline-momentum',
    breakingProceduresActive: (n) => `${n} procedurer fremskrider — lovgivningspipeline aktiv`,
    breakingCoalitionOpportunity: 'Koalitionsdynamikken skifter — nye alliancemuligheder opstår',
    breakingAnomalyThreat: 'Opdagede anomalier kan signalere dybere politisk omgruppering',
    breakingRapidEvents: 'Hurtigt udviklende begivenheder kan overskride lovgivningskapaciteten',
    propositionsHealthStrong: (pct) =>
      `Pipeline-sundhed på ${pct} % — stærk lovgivningsforvaltning`,
    propositionsThroughputGood: (n) => `Gennemløb ${n} — sundt behandlingstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-sundhed på ${pct} % — risiko for lovgivningsmæssig trængsel`,
    propositionsThroughputLow: (n) =>
      `Lavt gennemløb (${n}) — langsom behandling forsinker politiske tiltag`,
    propositionsPrioritisation:
      'Prioritering af flagskibsfiler kan forbedre pipeline-effektiviteten',
    propositionsTrilogueAcceleration: 'Trilogacceleration af modne sager kan øge gennemløbet',
    propositionsCriticalCongestion:
      'Kritisk pipeline-trængsel kan tvinge lovgivningsfiler til at blive opgivet',
    propositionsOverlapping:
      'Overlappende implementeringstidslinjer belaster medlemsstaternes gennemførelseskapacitet',
    committeeActive: (active, total) => `${active} af ${total} udvalg producerer aktivt dokumenter`,
    committeeDocuments: (n) => `${n} dokumenter produceret — stærk lovgivningsmæssig produktion`,
    committeeInactive: (n) => `${n} udvalg uden nylig dokumentaktivitet`,
    committeeCrossCollaboration:
      'Samarbejde på tværs af udvalg om horisontale politikfiler kan øge gennemslagskraften',
    committeeHearings: 'Udvalgshøringer giver platform for ekspertinteressenters engagement',
    committeeLowActivity: 'Lav udvalgsaktivitet risikerer lovgivningsmæssige flaskehalse nedstrøms',
    committeeCompetingPriorities: 'Konkurrerende politiske prioriteter kan udvande udvalgets fokus',
  },
  no: {
    votingHighCohesion: (n) =>
      `${n} politiske grupper med samhold over 80 % — disiplinerte stemmeblokker`,
    votingAdopted: (n) => `${n} tekster vedtatt — viser lovgivende produktivitet`,
    votingActiveVotes: (n) => `${n} avstemninger registrert — aktivt plenaraktivitet`,
    votingLowCohesion: (n) =>
      `${n} grupper med samhold under 50 % — interne splittelser svekker forhandlingskraft`,
    votingAnomalies: (n) =>
      `${n} stemmeavvik oppdaget — signaliserer uforutsigbar koalisjonsadferd`,
    votingCrossParty:
      'Tverrpolitiske allianser om spesifikk lovgivning kan bygge bredere konsensus',
    votingDiverseGroups: (n) => `${n} aktive politiske grupper — mangfoldige koalisjonsmuligheter`,
    votingHighSeverity: (n) => `${n} alvorlige avvik — risiko for koalisjonsfragmentering`,
    votingShiftingAlliances: 'Skiftende allianser kan forsinke lovgivningsframgang i viktige saker',
    prospectiveEvents: (n) => `${n} plenarmøter planlagt — aktiv lovgivningsdagsorden`,
    prospectiveCommittees: (n) => `${n} komitémøter — bredt politisk engasjement`,
    prospectiveBottlenecks: (n) => `${n} lovgivningsprosedyrer med flaskehalsrisiko`,
    prospectiveHighDensity: (n) => `Høy hendelsestetthet (${n}) risikerer komprimert debattid`,
    prospectiveDocuments: (n) => `${n} dokumenter til behandling — lovgivende momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlamentariske spørsmål — MEP-engasjement for borgernes bekymringer`,
    prospectiveBottleneckRisk:
      'Flaskehalsprosedyrer kan tvinge frem snarveier eller utsette viktige saker',
    prospectiveSchedulingRisk:
      'Planleggingstetthet øker risikoen for endringsforslag i siste liten',
    breakingAdopted: (n) => `${n} tekster vedtatt — parlamentet demonstrerer lovgivningskapasitet`,
    breakingEvents: (n) => `${n} parlamentariske hendelser — aktivt institusjonelt engasjement`,
    breakingAnomalyWeakness: 'Stemmeavvik oppdaget — potensiell koalisjonsinstabilitet',
    breakingNoProcedures: 'Ingen nye lovgivningsprosedyrer — begrenset pipeline-momentum',
    breakingProceduresActive: (n) => `${n} prosedyrer fremskrider — lovgivningspipeline aktiv`,
    breakingCoalitionOpportunity: 'Koalisjonsdynamikken skifter — nye alliansmuligheter oppstår',
    breakingAnomalyThreat: 'Oppdagede avvik kan signalisere dypere politisk omgruppering',
    breakingRapidEvents: 'Raskt utviklende hendelser kan overskride lovgivningskapasiteten',
    propositionsHealthStrong: (pct) => `Pipeline-helse på ${pct} % — sterk lovgivningsforvaltning`,
    propositionsThroughputGood: (n) => `Gjennomstrømning ${n} — sunt behandlingstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-helse på ${pct} % — risiko for lovgivningsmessig trengsel`,
    propositionsThroughputLow: (n) =>
      `Lav gjennomstrømning (${n}) — treg behandling forsinker politiske tiltak`,
    propositionsPrioritisation:
      'Prioritering av flaggskipfiler kan forbedre pipeline-effektiviteten',
    propositionsTrilogueAcceleration:
      'Trilogakselerasjon av modne saker kan øke gjennomstrømningen',
    propositionsCriticalCongestion:
      'Kritisk pipeline-trengsel kan tvinge lovgivningsfiler til å bli forlatt',
    propositionsOverlapping:
      'Overlappende implementeringstidslinjer belaster medlemsstatenes gjennomføringskapasitet',
    committeeActive: (active, total) =>
      `${active} av ${total} komiteer produserer aktivt dokumenter`,
    committeeDocuments: (n) => `${n} dokumenter produsert — sterk lovgivende produksjon`,
    committeeInactive: (n) => `${n} komiteer uten nylig dokumentaktivitet`,
    committeeCrossCollaboration:
      'Samarbeid på tvers av komiteer om horisontale policyfiler kan øke gjennomslaget',
    committeeHearings: 'Komitéhøringer gir plattform for ekspertinteressenters engasjement',
    committeeLowActivity: 'Lav komitéaktivitet risikerer lovgivningsmessige flaskehalser nedstrøms',
    committeeCompetingPriorities:
      'Konkurrerende politiske prioriteringer kan utvanne komitéens fokus',
  },
  fi: {
    votingHighCohesion: (n) =>
      `${n} poliittista ryhmää yhtenäisyydellä yli 80 % — kurinalaiset äänestyslohkot`,
    votingAdopted: (n) => `${n} tekstiä hyväksytty — osoittaa lainsäädännöllistä tuottavuutta`,
    votingActiveVotes: (n) => `${n} äänestystä kirjattu — aktiivinen täysistuntoaktiivisuus`,
    votingLowCohesion: (n) =>
      `${n} ryhmää yhtenäisyydellä alle 50 % — sisäiset jakolinjat heikentävät neuvotteluvoimaa`,
    votingAnomalies: (n) =>
      `${n} äänestyspoikkeamaa havaittu — viestii ennakoimattomasta koalitiokäyttäytymisestä`,
    votingCrossParty:
      'Puoluerajat ylittävät liittoutumat voivat rakentaa laajempaa yhteisymmärrystä',
    votingDiverseGroups: (n) =>
      `${n} aktiivista poliittista ryhmää — monipuoliset koalitiomahdollisuudet`,
    votingHighSeverity: (n) => `${n} vakavaa poikkeamaa — koalition pirstoutumisen riski`,
    votingShiftingAlliances:
      'Muuttuvat liittoutumat voivat viivästyttää lainsäädäntötyötä keskeisissä asioissa',
    prospectiveEvents: (n) =>
      `${n} täysistuntotapahtumaa aikataulutettu — aktiivinen lainsäädäntöagenda`,
    prospectiveCommittees: (n) => `${n} valiokuntakokousta — laaja poliittinen sitoutuminen`,
    prospectiveBottlenecks: (n) => `${n} lainsäädäntömenettelyä pullonkaulauhalla`,
    prospectiveHighDensity: (n) =>
      `Korkea tapahtumatiheys (${n}) uhkaa tiivistettyä keskusteluaikaa`,
    prospectiveDocuments: (n) => `${n} asiakirjaa käsittelyssä — lainsäädännöllinen vauhti`,
    prospectiveQuestions: (n) =>
      `${n} parlamentaarista kysymystä — MEP-sitoutuminen kansalaisten huoliin`,
    prospectiveBottleneckRisk:
      'Pullonkaulamenettelyt voivat pakottaa menettelylliset oikotiet tai lykätä keskeisiä asioita',
    prospectiveSchedulingRisk: 'Aikataulutiheys lisää viime hetken muutosehdotusten riskiä',
    breakingAdopted: (n) =>
      `${n} tekstiä hyväksytty — parlamentti osoittaa lainsäädäntökapasiteettia`,
    breakingEvents: (n) =>
      `${n} parlamentaarista tapahtumaa — aktiivinen institutionaalinen sitoutuminen`,
    breakingAnomalyWeakness: 'Äänestyspoikkeamia havaittu — mahdollinen koalition epävakaus',
    breakingNoProcedures: 'Ei uusia lainsäädäntömenettelyjä — rajallinen pipeline-vauhti',
    breakingProceduresActive: (n) => `${n} menettelyä edistyy — lainsäädäntöpipeline aktiivinen`,
    breakingCoalitionOpportunity:
      'Koalitiodynamiikka muuttuu — uusia liittoutumamahdollisuuksia syntyy',
    breakingAnomalyThreat:
      'Havaitut poikkeamat voivat viestittää syvemmästä poliittisesta uudelleenjärjestelystä',
    breakingRapidEvents:
      'Nopeasti kehittyvät tapahtumat voivat ylittää lainsäädännöllisen reagointikyvyn',
    propositionsHealthStrong: (pct) => `Pipeline-terveys ${pct} % — vahva lainsäädännön hallinta`,
    propositionsThroughputGood: (n) => `Läpäisyaste ${n} — terve käsittelytahti`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-terveys ${pct} % — lainsäädännöllisen ruuhkautumisen riski`,
    propositionsThroughputLow: (n) =>
      `Matala läpäisyaste (${n}) — hidas käsittely viivästyttää politiikkatoimia`,
    propositionsPrioritisation:
      'Lippulaiva-asiakirjojen priorisointi voi parantaa pipeline-tehokkuutta',
    propositionsTrilogueAcceleration:
      'Trilogikiihdytys kypsille asioille voi kasvattaa läpäisyastetta',
    propositionsCriticalCongestion:
      'Kriittinen pipeline-ruuhka voi pakottaa lainsäädäntöasiakirjojen hylkäämisen',
    propositionsOverlapping:
      'Päällekkäiset toteutusaikataulut rasittavat jäsenvaltioiden täytäntöönpanokapasiteettia',
    committeeActive: (active, total) =>
      `${active} / ${total} valiokuntaa tuottaa aktiivisesti asiakirjoja`,
    committeeDocuments: (n) => `${n} asiakirjaa tuotettu — vahva lainsäädännöllinen tuotanto`,
    committeeInactive: (n) => `${n} valiokuntaa ilman viimeaikaista asiakirja-aktiivisuutta`,
    committeeCrossCollaboration:
      'Valiokuntien välinen yhteistyö horisontaalisissa politiikka-asioissa voi lisätä vaikuttavuutta',
    committeeHearings:
      'Valiokuntakuulemiset tarjoavat alustan asiantuntijasidosryhmien osallistumiselle',
    committeeLowActivity:
      'Matala valiokuntatoiminta uhkaa lainsäädännöllisiä pullonkauloja jatkovaiheessa',
    committeeCompetingPriorities:
      'Kilpailevat poliittiset prioriteetit voivat laimentaa valiokunnan fokusta',
  },
  de: {
    votingHighCohesion: (n) =>
      `${n} Fraktionen mit Kohäsion über 80 % — disziplinierte Abstimmungsblöcke`,
    votingAdopted: (n) => `${n} Texte angenommen — zeigt gesetzgeberische Produktivität`,
    votingActiveVotes: (n) => `${n} Abstimmungen erfasst — aktives Plenarengagement`,
    votingLowCohesion: (n) =>
      `${n} Fraktionen mit Kohäsion unter 50 % — interne Spaltungen schwächen Verhandlungsmacht`,
    votingAnomalies: (n) =>
      `${n} Abstimmungsanomalien erkannt — signalisiert unvorhersehbares Koalitionsverhalten`,
    votingCrossParty:
      'Fraktionsübergreifende Allianzen bei spezifischer Gesetzgebung können breiteren Konsens schaffen',
    votingDiverseGroups: (n) =>
      `${n} aktive Fraktionen — vielfältige Koalitionsbildungsmöglichkeiten`,
    votingHighSeverity: (n) =>
      `${n} schwerwiegende Anomalien — Risiko der Koalitionsfragmentierung`,
    votingShiftingAlliances:
      'Wechselnde Allianzen können den Gesetzgebungsfortschritt bei wichtigen Dossiers verzögern',
    prospectiveEvents: (n) => `${n} Plenarveranstaltungen geplant — aktive Gesetzgebungsagenda`,
    prospectiveCommittees: (n) => `${n} Ausschusssitzungen — breites politisches Engagement`,
    prospectiveBottlenecks: (n) => `${n} Gesetzgebungsverfahren mit Engpassrisiko`,
    prospectiveHighDensity: (n) =>
      `Hohe Veranstaltungsdichte (${n}) birgt Risiko komprimierter Debattenzeit`,
    prospectiveDocuments: (n) => `${n} Dokumente in Beratung — gesetzgeberisches Momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlamentarische Anfragen — MdEP-Engagement für Bürgeranliegen`,
    prospectiveBottleneckRisk:
      'Engpassverfahren können zu Verfahrensabkürzungen zwingen oder wichtige Dossiers verzögern',
    prospectiveSchedulingRisk:
      'Terminierungsdichte erhöht das Risiko von Last-Minute-Änderungsanträgen',
    breakingAdopted: (n) => `${n} Texte angenommen — Parlament demonstriert Gesetzgebungskapazität`,
    breakingEvents: (n) =>
      `${n} parlamentarische Veranstaltungen — aktives institutionelles Engagement`,
    breakingAnomalyWeakness: 'Abstimmungsanomalien erkannt — potenzielle Koalitionsinstabilität',
    breakingNoProcedures: 'Keine neuen Gesetzgebungsverfahren — begrenztes Pipeline-Momentum',
    breakingProceduresActive: (n) => `${n} Verfahren schreiten voran — Gesetzgebungspipeline aktiv`,
    breakingCoalitionOpportunity:
      'Koalitionsdynamik verschiebt sich — neue Allianzmöglichkeiten entstehen',
    breakingAnomalyThreat:
      'Erkannte Anomalien könnten tiefere politische Neuausrichtung signalisieren',
    breakingRapidEvents:
      'Sich schnell entwickelnde Ereignisse könnten die Gesetzgebungskapazität übersteigen',
    propositionsHealthStrong: (pct) =>
      `Pipeline-Gesundheit bei ${pct} % — starkes Gesetzgebungsmanagement`,
    propositionsThroughputGood: (n) => `Durchsatz ${n} — gesundes Verarbeitungstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-Gesundheit bei ${pct} % — Risiko gesetzgeberischer Stauung`,
    propositionsThroughputLow: (n) =>
      `Niedriger Durchsatz (${n}) — langsame Verarbeitung verzögert politische Maßnahmen`,
    propositionsPrioritisation:
      'Priorisierung von Leuchtturm-Dossiers kann die Pipeline-Effizienz verbessern',
    propositionsTrilogueAcceleration:
      'Trilog-Beschleunigung reifer Dossiers kann den Durchsatz steigern',
    propositionsCriticalCongestion:
      'Kritische Pipeline-Stauung kann zum Aufgeben von Gesetzgebungsdossiers führen',
    propositionsOverlapping:
      'Überlappende Umsetzungszeitpläne belasten die Umsetzungskapazität der Mitgliedstaaten',
    committeeActive: (active, total) =>
      `${active} von ${total} Ausschüssen produzieren aktiv Dokumente`,
    committeeDocuments: (n) => `${n} Dokumente produziert — starke gesetzgeberische Produktion`,
    committeeInactive: (n) => `${n} Ausschüsse ohne jüngste Dokumentenaktivität`,
    committeeCrossCollaboration:
      'Ausschussübergreifende Zusammenarbeit bei horizontalen Politikdossiers kann die Wirkung erhöhen',
    committeeHearings: 'Ausschussanhörungen bieten Plattform für Experten-Stakeholder-Engagement',
    committeeLowActivity:
      'Niedrige Ausschussaktivität birgt Risiko gesetzgeberischer Engpässe im weiteren Verlauf',
    committeeCompetingPriorities:
      'Konkurrierende politische Prioritäten können den Ausschussfokus verwässern',
  },
  fr: {
    votingHighCohesion: (n) =>
      `${n} groupes politiques avec cohésion supérieure à 80 % — blocs de vote disciplinés`,
    votingAdopted: (n) => `${n} textes adoptés — démontre la productivité législative`,
    votingActiveVotes: (n) => `${n} votes enregistrés — engagement actif en plénière`,
    votingLowCohesion: (n) =>
      `${n} groupes avec cohésion inférieure à 50 % — divisions internes affaiblissent le pouvoir de négociation`,
    votingAnomalies: (n) =>
      `${n} anomalies de vote détectées — signale un comportement de coalition imprévisible`,
    votingCrossParty:
      'Les alliances transpartisanes sur des législations spécifiques peuvent construire un consensus plus large',
    votingDiverseGroups: (n) =>
      `${n} groupes politiques actifs — possibilités diverses de formation de coalition`,
    votingHighSeverity: (n) =>
      `${n} anomalies de haute gravité — risque de fragmentation de la coalition`,
    votingShiftingAlliances:
      'Les alliances mouvantes peuvent retarder les progrès législatifs sur les dossiers clés',
    prospectiveEvents: (n) => `${n} événements pléniers programmés — agenda législatif actif`,
    prospectiveCommittees: (n) => `${n} réunions de commission — large engagement politique`,
    prospectiveBottlenecks: (n) =>
      `${n} procédures législatives confrontées à des risques de goulot d'étranglement`,
    prospectiveHighDensity: (n) =>
      `Haute densité d'événements (${n}) risque de comprimer le temps de débat`,
    prospectiveDocuments: (n) => `${n} documents en examen — momentum législatif`,
    prospectiveQuestions: (n) =>
      `${n} questions parlementaires — engagement des députés envers les préoccupations citoyennes`,
    prospectiveBottleneckRisk:
      "Les procédures en goulot d'étranglement peuvent forcer des raccourcis ou reporter des dossiers clés",
    prospectiveSchedulingRisk:
      "La densité de programmation augmente le risque d'amendements de dernière minute",
    breakingAdopted: (n) => `${n} textes adoptés — le Parlement démontre sa capacité législative`,
    breakingEvents: (n) => `${n} événements parlementaires — engagement institutionnel actif`,
    breakingAnomalyWeakness:
      'Anomalies de vote détectées — instabilité potentielle de la coalition',
    breakingNoProcedures: 'Pas de nouvelles procédures législatives — momentum limité du pipeline',
    breakingProceduresActive: (n) => `${n} procédures en cours — pipeline législatif actif`,
    breakingCoalitionOpportunity:
      "La dynamique de coalition évolue — de nouvelles opportunités d'alliance émergent",
    breakingAnomalyThreat:
      'Les anomalies détectées peuvent signaler un réalignement politique plus profond',
    breakingRapidEvents:
      'Les événements à évolution rapide peuvent dépasser la capacité de réponse législative',
    propositionsHealthStrong: (pct) => `Santé du pipeline à ${pct} % — gestion législative solide`,
    propositionsThroughputGood: (n) => `Débit ${n} — rythme de traitement sain`,
    propositionsHealthWeak: (pct) =>
      `Santé du pipeline à ${pct} % — risque de congestion législative`,
    propositionsThroughputLow: (n) =>
      `Faible débit (${n}) — le traitement lent retarde la mise en œuvre des politiques`,
    propositionsPrioritisation:
      "La priorisation des dossiers phares peut améliorer l'efficacité du pipeline",
    propositionsTrilogueAcceleration:
      "L'accélération des trilogues sur les dossiers mûrs peut augmenter le débit",
    propositionsCriticalCongestion:
      "Une congestion critique du pipeline peut forcer l'abandon de dossiers législatifs",
    propositionsOverlapping:
      'Les calendriers de mise en œuvre qui se chevauchent mettent à rude épreuve la capacité de transposition des États membres',
    committeeActive: (active, total) =>
      `${active} sur ${total} commissions produisent activement des documents`,
    committeeDocuments: (n) => `${n} documents produits — forte production législative`,
    committeeInactive: (n) => `${n} commissions sans activité documentaire récente`,
    committeeCrossCollaboration:
      "La collaboration inter-commissions sur les dossiers politiques horizontaux peut accroître l'impact",
    committeeHearings:
      "Les auditions en commission offrent une plateforme pour l'engagement des parties prenantes expertes",
    committeeLowActivity:
      "Une faible activité des commissions risque de créer des goulots d'étranglement législatifs en aval",
    committeeCompetingPriorities:
      'Les priorités politiques concurrentes peuvent diluer la concentration des commissions',
  },
};
