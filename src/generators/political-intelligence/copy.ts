// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Copy
 * @description Localized copy strings for the political-intelligence
 * landing page (14 languages). Lifted verbatim out of the monolithic
 * `political-intelligence.ts` so the language tables can be audited
 * and unit-tested in isolation.
 *
 * Per-language overrides fall back to English defaults via
 * {@link getPICopy}. Adding a new key requires:
 *   1. extending the {@link PICopy} interface,
 *   2. providing the English default in {@link DEFAULT_COPY}, and
 *   3. translating every entry in {@link PI_COPY} (the build will fall
 *      back to English silently if a translation is missing — there is
 *      no compile-time exhaustiveness check on `Partial<PICopy>`).
 */

/** Localized copy strings for the political-intelligence page */
export interface PICopy {
  title: string;
  intro: string;
  heroSubtitle: string;
  home: string;
  breadcrumbCurrent: string;
  breadcrumbLabel: string;
  methodologiesHeading: string;
  methodologiesDescription: string;
  templatesHeading: string;
  templatesDescription: string;
  referenceHeading: string;
  referenceDescription: string;
  statReferenceLabel: string;
  dailyHeading: string;
  dailyDescription: string;
  statMethodologiesLabel: string;
  statTemplatesLabel: string;
  statRunsLabel: string;
  statArtifactsLabel: string;
  viewOnGitHub: string;
  /** "{count} artifacts" label for each run (plural, count > 1) */
  artifactCountLabel: string;
  /** Singular form used when artifactCount === 1 (e.g. "1 artifact") */
  artifactCountLabelSingular: string;
  /** "{count} runs" label in the date-group header (plural, count > 1) */
  runsCountLabel: string;
  /** Singular form used when runs.length === 1 (e.g. "1 run") */
  runsCountLabelSingular: string;
  /** Label for the expandable artifact-file list inside each run (plural, count > 1) */
  artifactsToggleLabel: string;
  /** Singular form of the toggle label used when artifactCount === 1 */
  artifactsToggleLabelSingular: string;
  /**
   * Localized note shown at the top of the methodology/template/reference
   * sections on non-English pages, explaining that the source tradecraft
   * materials themselves are in English. Empty string on English pages.
   */
  sourceInEnglishNote: string;
  /**
   * Comma-separated SEO keywords list in the page language. Emitted as
   * `<meta name="keywords" content="…">`. Each language ships keywords in
   * its own script so search engines index the page under native-language
   * terms (e.g. Japanese `政治インテリジェンス`, Arabic `الاستخبارات السياسية`).
   */
  seoKeywords: string;
}

export const DEFAULT_COPY: PICopy = {
  title: 'Political Intelligence',
  intro:
    'Every political analysis published on this site is backed by a transparent chain of methodologies, artifact templates, and run-level analysis data. This page gives you a single, fully-linked index into every piece of tradecraft used to produce the news. All sources open in GitHub so you can audit the analysis behind the prose.',
  heroSubtitle: 'Methodologies, templates & daily analysis transparency',
  home: 'Home',
  breadcrumbCurrent: 'Political Intelligence',
  breadcrumbLabel: 'Breadcrumb',
  methodologiesHeading: 'Methodologies',
  methodologiesDescription:
    'Authoritative tradecraft guides — risk frameworks, style standards, and the 10-step AI-driven analysis protocol that every article follows.',
  templatesHeading: 'Analysis Templates',
  templatesDescription:
    'The catalog of artifact templates produced in every daily analysis run — SWOT, PESTLE, threat matrices, coalition dynamics, consequence trees, and more.',
  referenceHeading: 'Reference & Data Sources',
  referenceDescription:
    'ISMS reference adaptations, indicator catalogs, EU country mappings, chart-integration guides, and use-cases from the IMF and World Bank data pipelines — the authoritative sources behind every economic, governance, and risk chart.',
  statReferenceLabel: 'References',
  dailyHeading: 'Daily Analysis Runs',
  dailyDescription:
    'Every published analysis run, grouped by date and ordered newest first. Each run links to the full GitHub tree so you can inspect every artifact file that fed the corresponding article.',
  statMethodologiesLabel: 'Methodologies',
  statTemplatesLabel: 'Templates',
  statRunsLabel: 'Analysis runs',
  statArtifactsLabel: 'Artifacts',
  viewOnGitHub: 'View on GitHub',
  artifactCountLabel: '{count} artifacts',
  artifactCountLabelSingular: '1 artifact',
  runsCountLabel: '{count} runs',
  runsCountLabelSingular: '1 run',
  artifactsToggleLabel: 'Show all {count} artifact files',
  artifactsToggleLabelSingular: 'Show the 1 artifact file',
  sourceInEnglishNote: '',
  seoKeywords:
    'European Parliament, political intelligence, OSINT, SWOT, PESTLE, TOWS, STRIDE, methodology, artifact templates, coalition mathematics, risk assessment, threat model, transparency, EU',
};

/** Per-language overrides; fall back to English for any missing key */
export const PI_COPY: Partial<Record<string, Partial<PICopy>>> = (() => {
  const SV_METHODOLOGIES = 'Metodologier';
  const NO_METHODOLOGIES = 'Metodologier';
  const ARTEFAKTER_COUNT = '{count} artefakter';
  const ARTEFAKT_SINGULAR = '1 artefakt';
  return {
    en: {},
    sv: {
      title: 'Politisk underrättelse',
      intro:
        'Varje politisk analys som publiceras på denna webbplats stöds av en transparent kedja av metodologier, artefaktmallar och analysdata på körningsnivå. Denna sida ger dig ett enda, fullt länkat index till all tradecraft som används för att producera nyheterna. Alla källor öppnas i GitHub så att du kan granska analysen bakom texten.',
      heroSubtitle: `${SV_METHODOLOGIES}, mallar och daglig analysöppenhet`,
      home: 'Hem',
      breadcrumbCurrent: 'Politisk underrättelse',
      breadcrumbLabel: 'Brödsmulor',
      methodologiesHeading: SV_METHODOLOGIES,
      methodologiesDescription:
        'Auktoritativa tradecraft-guider — riskramverk, stilstandarder och det 10-stegs AI-drivna analysprotokollet som varje artikel följer.',
      templatesHeading: 'Analysmallar',
      templatesDescription:
        'Katalogen över artefaktmallar som produceras i varje daglig analyskörning — SWOT, PESTLE, hotmatriser, koalitionsdynamik, konsekvensträd med mera.',
      referenceHeading: 'Referenser och datakällor',
      referenceDescription:
        'ISMS-referensanpassningar, indikatorkataloger, EU-landkartläggningar och diagramguider bakom varje IMF- och Världsbanken-källa.',
      statReferenceLabel: 'Referenser',
      dailyHeading: 'Dagliga analyskörningar',
      dailyDescription:
        'Varje publicerad analyskörning, grupperad efter datum och ordnad med nyaste först. Varje körning länkar till hela GitHub-trädet så att du kan granska varje artefaktfil som matade motsvarande artikel.',
      statMethodologiesLabel: SV_METHODOLOGIES,
      statTemplatesLabel: 'Mallar',
      statRunsLabel: 'Analyskörningar',
      statArtifactsLabel: 'Artefakter',
      viewOnGitHub: 'Visa på GitHub',
      artifactCountLabel: ARTEFAKTER_COUNT,
      artifactCountLabelSingular: ARTEFAKT_SINGULAR,
      runsCountLabel: '{count} körningar',
      runsCountLabelSingular: '1 körning',
      artifactsToggleLabel: 'Visa alla {count} artefaktfiler',
      artifactsToggleLabelSingular: 'Visa 1 artefaktfil',
      sourceInEnglishNote:
        'Källmaterialet (metodologier, mallar och dagliga analysartefakter) publiceras på engelska. Titlar och filvägar är därför på engelska — endast sidans navigation och beskrivningar är översatta.',
      seoKeywords:
        'Europaparlamentet, politisk underrättelse, OSINT, SWOT-analys, PESTLE-analys, metodologi, artefaktmallar, koalitionsmatematik, riskbedömning, hotmodell, öppenhet, EU',
    },
    da: {
      title: 'Politisk efterretning',
      intro:
        'Hver politisk analyse, der udgives på denne side, understøttes af en gennemsigtig kæde af metoder, artefaktskabeloner og kørselsspecifikke analysedata. Denne side giver dig et enkelt, fuldt linket indeks til hele det håndværk, der bruges til at producere nyhederne.',
      heroSubtitle: 'Metoder, skabeloner og daglig analyseåbenhed',
      home: 'Hjem',
      breadcrumbCurrent: 'Politisk efterretning',
      breadcrumbLabel: 'Brødkrummer',
      methodologiesHeading: 'Metoder',
      methodologiesDescription:
        'Autoritative tradecraft-guider — risikorammer, stilstandarder og den 10-trins AI-drevne analyseprotokol, som hver artikel følger.',
      templatesHeading: 'Analyseskabeloner',
      templatesDescription:
        'Kataloget over artefaktskabeloner, der produceres i hver daglig analysekørsel — SWOT, PESTLE, trusselsmatricer, koalitionsdynamikker, konsekvenstræer med mere.',
      referenceHeading: 'Referencer og datakilder',
      referenceDescription:
        'ISMS-referencetilpasninger, indikatorkataloger, EU-landkortlægninger og diagramguider bag hver IMF- og Verdensbanken-kilde.',
      statReferenceLabel: 'Referencer',
      dailyHeading: 'Daglige analysekørsler',
      dailyDescription:
        'Hver udgivet analysekørsel, grupperet efter dato og ordnet nyeste først. Hver kørsel linker til hele GitHub-træet.',
      statMethodologiesLabel: 'Metoder',
      statTemplatesLabel: 'Skabeloner',
      statRunsLabel: 'Analysekørsler',
      statArtifactsLabel: 'Artefakter',
      viewOnGitHub: 'Vis på GitHub',
      artifactCountLabel: ARTEFAKTER_COUNT,
      artifactCountLabelSingular: ARTEFAKT_SINGULAR,
      runsCountLabel: '{count} kørsler',
      runsCountLabelSingular: '1 kørsel',
      artifactsToggleLabel: 'Vis alle {count} artefaktfiler',
      artifactsToggleLabelSingular: 'Vis 1 artefaktfil',
      sourceInEnglishNote:
        'Kildematerialet (metoder, skabeloner og daglige analyseartefakter) udgives på engelsk. Titler og filstier er derfor på engelsk — kun sidens navigation og beskrivelser er oversat.',
      seoKeywords:
        'Europa-Parlamentet, politisk efterretning, OSINT, SWOT-analyse, PESTLE-analyse, metode, artefaktskabeloner, koalitionsmatematik, risikovurdering, trusselmodel, åbenhed, EU',
    },
    no: {
      title: 'Politisk etterretning',
      intro:
        'Hver politiske analyse som publiseres på dette nettstedet støttes av en transparent kjede av metodologier, artefaktmaler og kjøringsnivå-analysedata. Denne siden gir deg en enkelt, fullt lenket indeks til alt håndverket som brukes for å produsere nyhetene.',
      heroSubtitle: `${NO_METHODOLOGIES}, maler og daglig analyseåpenhet`,
      home: 'Hjem',
      breadcrumbCurrent: 'Politisk etterretning',
      breadcrumbLabel: 'Brødsmuler',
      methodologiesHeading: NO_METHODOLOGIES,
      methodologiesDescription:
        'Autoritative tradecraft-guider — risikorammer, stilstandarder og den 10-stegs AI-drevne analyseprotokollen som hver artikkel følger.',
      templatesHeading: 'Analysemaler',
      templatesDescription:
        'Katalogen over artefaktmaler som produseres i hver daglige analysekjøring — SWOT, PESTLE, trusselmatriser, koalisjonsdynamikk, konsekvenstrær og mer.',
      referenceHeading: 'Referanser og datakilder',
      referenceDescription:
        'ISMS-referansetilpasninger, indikatorkataloger, EU-landkartlegginger og diagramveiledere bak hver IMF- og Verdensbanken-kilde.',
      statReferenceLabel: 'Referanser',
      dailyHeading: 'Daglige analysekjøringer',
      dailyDescription:
        'Hver publiserte analysekjøring, gruppert etter dato og sortert nyeste først. Hver kjøring lenker til hele GitHub-treet.',
      statMethodologiesLabel: NO_METHODOLOGIES,
      statTemplatesLabel: 'Maler',
      statRunsLabel: 'Analysekjøringer',
      statArtifactsLabel: 'Artefakter',
      viewOnGitHub: 'Vis på GitHub',
      artifactCountLabel: ARTEFAKTER_COUNT,
      artifactCountLabelSingular: ARTEFAKT_SINGULAR,
      runsCountLabel: '{count} kjøringer',
      runsCountLabelSingular: '1 kjøring',
      artifactsToggleLabel: 'Vis alle {count} artefaktfiler',
      artifactsToggleLabelSingular: 'Vis 1 artefaktfil',
      sourceInEnglishNote:
        'Kildematerialet (metodologier, maler og daglige analyseartefakter) publiseres på engelsk. Titler og filstier er derfor på engelsk — bare sidens navigasjon og beskrivelser er oversatt.',
      seoKeywords:
        'Europaparlamentet, politisk etterretning, OSINT, SWOT-analyse, PESTLE-analyse, metodologi, artefaktmaler, koalisjonsmatematikk, risikovurdering, trusselmodell, åpenhet, EU',
    },
    fi: {
      title: 'Poliittinen tiedustelu',
      intro:
        'Jokainen sivustolla julkaistava poliittinen analyysi perustuu läpinäkyvään metodologioiden, artefaktipohjien ja ajokohtaisten analyysidataiden ketjuun. Tämä sivu tarjoaa yhden, täysin linkitetyn indeksin kaikkeen uutisten tuottamisessa käytettyyn käsityötaitoon.',
      heroSubtitle: 'Metodologiat, mallit ja päivittäinen analyysin läpinäkyvyys',
      home: 'Etusivu',
      breadcrumbCurrent: 'Poliittinen tiedustelu',
      breadcrumbLabel: 'Navigointipolku',
      methodologiesHeading: 'Metodologiat',
      methodologiesDescription:
        'Arvovaltaiset tradecraft-oppaat — riskinarviointikehykset, tyylistandardit ja 10-vaiheinen tekoälypohjainen analyysiprotokolla.',
      templatesHeading: 'Analyysipohjat',
      templatesDescription:
        'Jokaisessa päivittäisessä analyysiajossa tuotettujen artefaktipohjien luettelo — SWOT, PESTLE, uhkamatriisit, koalitiodynamiikka ja konsekvenssipuut.',
      referenceHeading: 'Viitteet ja tietolähteet',
      referenceDescription:
        'ISMS-viiteadaptaatiot, indikaattoriluettelot, EU-maakartoitukset ja kaavio-integraatio-oppaat jokaisen IMF- ja Maailmanpankki-lähteen takana.',
      statReferenceLabel: 'Viitteet',
      dailyHeading: 'Päivittäiset analyysiajot',
      dailyDescription:
        'Jokainen julkaistu analyysiajo, ryhmiteltynä päivämäärän mukaan uusimmasta vanhimpaan. Jokainen ajo linkitetään GitHub-puuhun.',
      statMethodologiesLabel: 'Metodologiat',
      statTemplatesLabel: 'Pohjat',
      statRunsLabel: 'Analyysiajot',
      statArtifactsLabel: 'Artefaktit',
      viewOnGitHub: 'Näytä GitHubissa',
      artifactCountLabel: '{count} artefaktia',
      artifactCountLabelSingular: '1 artefakti',
      runsCountLabel: '{count} ajoa',
      runsCountLabelSingular: '1 ajo',
      artifactsToggleLabel: 'Näytä kaikki {count} artefaktitiedostoa',
      artifactsToggleLabelSingular: 'Näytä 1 artefaktitiedosto',
      sourceInEnglishNote:
        'Lähdemateriaali (metodologiat, pohjat ja päivittäiset analyysiartefaktit) julkaistaan englanniksi. Otsikot ja tiedostopolut ovat siksi englanniksi — vain sivun navigointi ja kuvaukset on käännetty.',
      seoKeywords:
        'Euroopan parlamentti, poliittinen tiedustelu, OSINT, SWOT-analyysi, PESTLE-analyysi, metodologia, artefaktipohjat, koalitiomatematiikka, riskiarviointi, uhkamalli, avoimuus, EU',
    },
    de: {
      title: 'Politische Aufklärung',
      intro:
        'Jede auf dieser Website veröffentlichte politische Analyse wird durch eine transparente Kette von Methodologien, Artefaktvorlagen und laufbezogenen Analysedaten gestützt. Diese Seite bietet einen einzigen, vollständig verlinkten Index aller Handwerkskunst, die zur Produktion der Nachrichten verwendet wird.',
      heroSubtitle: 'Methodologien, Vorlagen und tägliche Analyse-Transparenz',
      home: 'Startseite',
      breadcrumbCurrent: 'Politische Aufklärung',
      breadcrumbLabel: 'Breadcrumb',
      methodologiesHeading: 'Methodologien',
      methodologiesDescription:
        'Autoritative Tradecraft-Leitfäden — Risikorahmen, Stilstandards und das 10-Schritte-KI-gestützte Analyseprotokoll.',
      templatesHeading: 'Analysevorlagen',
      templatesDescription:
        'Der Katalog der Artefaktvorlagen, die in jedem täglichen Analyselauf erstellt werden — SWOT, PESTLE, Bedrohungsmatrizen, Koalitionsdynamik und Konsequenzbäume.',
      referenceHeading: 'Referenzen und Datenquellen',
      referenceDescription:
        'ISMS-Referenzanpassungen, Indikatorkataloge, EU-Länderzuordnungen und Diagramm-Integrationsleitfäden hinter jeder IMF- und Weltbank-Quelle.',
      statReferenceLabel: 'Referenzen',
      dailyHeading: 'Tägliche Analyseläufe',
      dailyDescription:
        'Jeder veröffentlichte Analyselauf, nach Datum gruppiert und neueste zuerst sortiert. Jeder Lauf verlinkt auf den vollständigen GitHub-Baum.',
      statMethodologiesLabel: 'Methodologien',
      statTemplatesLabel: 'Vorlagen',
      statRunsLabel: 'Analyseläufe',
      statArtifactsLabel: 'Artefakte',
      viewOnGitHub: 'Auf GitHub ansehen',
      artifactCountLabel: '{count} Artefakte',
      artifactCountLabelSingular: '1 Artefakt',
      runsCountLabel: '{count} Läufe',
      runsCountLabelSingular: '1 Lauf',
      artifactsToggleLabel: 'Alle {count} Artefaktdateien anzeigen',
      artifactsToggleLabelSingular: '1 Artefaktdatei anzeigen',
      sourceInEnglishNote:
        'Die Quellmaterialien (Methodologien, Vorlagen und tägliche Analyseartefakte) werden auf Englisch veröffentlicht. Titel und Dateipfade sind daher auf Englisch — nur die Seitennavigation und Beschreibungen sind übersetzt.',
      seoKeywords:
        'Europäisches Parlament, politische Aufklärung, OSINT, SWOT-Analyse, PESTLE-Analyse, Methodologie, Artefaktvorlagen, Koalitionsmathematik, Risikobewertung, Bedrohungsmodell, Transparenz, EU',
    },
    fr: {
      title: 'Intelligence politique',
      intro:
        "Chaque analyse politique publiée sur ce site s'appuie sur une chaîne transparente de méthodologies, de modèles d'artefacts et de données d'analyse par exécution. Cette page vous offre un index unique, entièrement lié, vers tout le savoir-faire utilisé pour produire les actualités.",
      heroSubtitle: 'Méthodologies, modèles et transparence des analyses quotidiennes',
      home: 'Accueil',
      breadcrumbCurrent: 'Intelligence politique',
      breadcrumbLabel: "Fil d'Ariane",
      methodologiesHeading: 'Méthodologies',
      methodologiesDescription:
        "Guides de savoir-faire faisant autorité — cadres de risque, normes de style et le protocole d'analyse en 10 étapes piloté par IA.",
      templatesHeading: "Modèles d'analyse",
      templatesDescription:
        "Catalogue des modèles d'artefacts produits dans chaque exécution d'analyse quotidienne — SWOT, PESTLE, matrices de menaces, dynamiques de coalition et arbres de conséquences.",
      referenceHeading: 'Références et sources de données',
      referenceDescription:
        "Adaptations de référence ISMS, catalogues d'indicateurs, mappages des pays de l'UE et guides d'intégration de graphiques derrière chaque source FMI et Banque mondiale.",
      statReferenceLabel: 'Références',
      dailyHeading: 'Exécutions d\u2019analyse quotidiennes',
      dailyDescription:
        "Chaque exécution d'analyse publiée, regroupée par date et triée du plus récent au plus ancien. Chaque exécution renvoie à l'arbre GitHub complet.",
      statMethodologiesLabel: 'Méthodologies',
      statTemplatesLabel: 'Modèles',
      statRunsLabel: 'Analyses',
      statArtifactsLabel: 'Artefacts',
      viewOnGitHub: 'Voir sur GitHub',
      artifactCountLabel: '{count} artefacts',
      artifactCountLabelSingular: '1 artefact',
      runsCountLabel: '{count} exécutions',
      runsCountLabelSingular: '1 exécution',
      artifactsToggleLabel: 'Afficher les {count} fichiers d\u2019artefacts',
      artifactsToggleLabelSingular: 'Afficher le fichier d\u2019artefact',
      sourceInEnglishNote:
        "Les documents sources (méthodologies, modèles et artefacts d'analyse quotidiens) sont publiés en anglais. Les titres et chemins de fichiers sont donc en anglais — seuls la navigation et les descriptions de la page sont traduits.",
      seoKeywords:
        'Parlement européen, renseignement politique, OSINT, analyse SWOT, analyse PESTLE, méthodologie, modèles d’artefacts, mathématiques de coalition, évaluation des risques, modèle de menace, transparence, UE',
    },
    es: {
      title: 'Inteligencia política',
      intro:
        'Cada análisis político publicado en este sitio se respalda con una cadena transparente de metodologías, plantillas de artefactos y datos de análisis por ejecución. Esta página proporciona un único índice totalmente enlazado con todo el oficio empleado para producir las noticias.',
      heroSubtitle: 'Metodologías, plantillas y transparencia del análisis diario',
      home: 'Inicio',
      breadcrumbCurrent: 'Inteligencia política',
      breadcrumbLabel: 'Ruta de navegación',
      methodologiesHeading: 'Metodologías',
      methodologiesDescription:
        'Guías autorizadas de oficio — marcos de riesgo, estándares de estilo y el protocolo de análisis impulsado por IA de 10 pasos.',
      templatesHeading: 'Plantillas de análisis',
      templatesDescription:
        'Catálogo de plantillas de artefactos producidas en cada ejecución diaria — SWOT, PESTLE, matrices de amenazas, dinámicas de coalición y árboles de consecuencias.',
      referenceHeading: 'Referencias y fuentes de datos',
      referenceDescription:
        'Adaptaciones de referencia ISMS, catálogos de indicadores, mapeos de países de la UE y guías de integración de gráficos detrás de cada fuente del FMI y del Banco Mundial.',
      statReferenceLabel: 'Referencias',
      dailyHeading: 'Ejecuciones de análisis diarias',
      dailyDescription:
        'Cada ejecución de análisis publicada, agrupada por fecha y ordenada de más reciente a más antigua. Cada ejecución enlaza al árbol completo de GitHub.',
      statMethodologiesLabel: 'Metodologías',
      statTemplatesLabel: 'Plantillas',
      statRunsLabel: 'Ejecuciones',
      statArtifactsLabel: 'Artefactos',
      viewOnGitHub: 'Ver en GitHub',
      artifactCountLabel: '{count} artefactos',
      artifactCountLabelSingular: '1 artefacto',
      runsCountLabel: '{count} ejecuciones',
      runsCountLabelSingular: '1 ejecución',
      artifactsToggleLabel: 'Mostrar los {count} archivos de artefactos',
      artifactsToggleLabelSingular: 'Mostrar el archivo de artefacto',
      sourceInEnglishNote:
        'Los materiales fuente (metodologías, plantillas y artefactos de análisis diarios) se publican en inglés. Los títulos y las rutas de archivo están, por tanto, en inglés — solo la navegación y las descripciones de la página están traducidas.',
      seoKeywords:
        'Parlamento Europeo, inteligencia política, OSINT, análisis SWOT, análisis PESTLE, metodología, plantillas de artefactos, matemáticas de coaliciones, evaluación de riesgos, modelo de amenazas, transparencia, UE',
    },
    nl: {
      title: 'Politieke intelligentie',
      intro:
        'Elke politieke analyse op deze website wordt ondersteund door een transparante keten van methodologieën, artefactsjablonen en analysegegevens per uitvoering. Deze pagina biedt een enkele, volledig gekoppelde index naar al het vakmanschap dat wordt gebruikt om het nieuws te produceren.',
      heroSubtitle: 'Methodologieën, sjablonen en dagelijkse analysetransparantie',
      home: 'Home',
      breadcrumbCurrent: 'Politieke intelligentie',
      breadcrumbLabel: 'Broodkruimelpad',
      methodologiesHeading: 'Methodologieën',
      methodologiesDescription:
        'Gezaghebbende vakhandboeken — risicoframeworks, stijlstandaarden en het 10-staps AI-gedreven analyseprotocol.',
      templatesHeading: 'Analysesjablonen',
      templatesDescription:
        'De catalogus met artefactsjablonen die in elke dagelijkse analyse-uitvoering worden geproduceerd — SWOT, PESTLE, dreigingsmatrices, coalitiedynamiek en consequentiebomen.',
      referenceHeading: 'Referenties en gegevensbronnen',
      referenceDescription:
        'ISMS-referentieadaptaties, indicatorcatalogi, EU-landmappings en grafiekintegratiegidsen achter elke IMF- en Wereldbank-bron.',
      statReferenceLabel: 'Referenties',
      dailyHeading: 'Dagelijkse analyse-uitvoeringen',
      dailyDescription:
        'Elke gepubliceerde analyse-uitvoering, gegroepeerd op datum en gesorteerd van nieuwste naar oudste. Elke uitvoering linkt naar de volledige GitHub-boom.',
      statMethodologiesLabel: 'Methodologieën',
      statTemplatesLabel: 'Sjablonen',
      statRunsLabel: 'Uitvoeringen',
      statArtifactsLabel: 'Artefacten',
      viewOnGitHub: 'Op GitHub bekijken',
      artifactCountLabel: '{count} artefacten',
      artifactCountLabelSingular: '1 artefact',
      runsCountLabel: '{count} uitvoeringen',
      runsCountLabelSingular: '1 uitvoering',
      artifactsToggleLabel: 'Alle {count} artefactbestanden tonen',
      artifactsToggleLabelSingular: '1 artefactbestand tonen',
      sourceInEnglishNote:
        'De bronmaterialen (methodologieën, sjablonen en dagelijkse analyse-artefacten) worden in het Engels gepubliceerd. Titels en bestandspaden staan daarom in het Engels — alleen de paginanavigatie en beschrijvingen zijn vertaald.',
      seoKeywords:
        'Europees Parlement, politieke inlichtingen, OSINT, SWOT-analyse, PESTLE-analyse, methodologie, artefactsjablonen, coalitiewiskunde, risicobeoordeling, dreigingsmodel, transparantie, EU',
    },
    ar: {
      title: 'الاستخبارات السياسية',
      intro:
        'كل تحليل سياسي يُنشر على هذا الموقع مدعوم بسلسلة شفافة من المنهجيات وقوالب القطع الأثرية وبيانات التحليل على مستوى التشغيل. توفر هذه الصفحة فهرسًا واحدًا مرتبطًا بالكامل بكل المهارة المستخدمة لإنتاج الأخبار.',
      heroSubtitle: 'المنهجيات والقوالب وشفافية التحليل اليومي',
      home: 'الرئيسية',
      breadcrumbCurrent: 'الاستخبارات السياسية',
      breadcrumbLabel: 'مسار التنقل',
      methodologiesHeading: 'المنهجيات',
      methodologiesDescription:
        'أدلة احترافية موثوقة — أطر المخاطر ومعايير الأسلوب وبروتوكول التحليل المدعوم بالذكاء الاصطناعي المكون من 10 خطوات.',
      templatesHeading: 'قوالب التحليل',
      templatesDescription:
        'كتالوج قوالب القطع الأثرية المنتجة في كل تشغيل تحليل يومي — SWOT و PESTLE ومصفوفات التهديد وديناميكيات التحالف وأشجار العواقب.',
      referenceHeading: 'المراجع ومصادر البيانات',
      referenceDescription:
        'تكييفات مرجعية ISMS وكتالوجات المؤشرات وخرائط دول الاتحاد الأوروبي وأدلة دمج المخططات خلف كل مصدر من صندوق النقد الدولي والبنك الدولي.',
      statReferenceLabel: 'المراجع',
      dailyHeading: 'عمليات التحليل اليومية',
      dailyDescription:
        'كل عملية تحليل منشورة، مجمعة حسب التاريخ ومرتبة من الأحدث إلى الأقدم. يربط كل تشغيل بشجرة GitHub الكاملة.',
      statMethodologiesLabel: 'المنهجيات',
      statTemplatesLabel: 'القوالب',
      statRunsLabel: 'عمليات التحليل',
      statArtifactsLabel: 'القطع الأثرية',
      viewOnGitHub: 'عرض على GitHub',
      artifactCountLabel: '{count} قطعة أثرية',
      artifactCountLabelSingular: 'قطعة أثرية واحدة',
      runsCountLabel: '{count} عمليات',
      runsCountLabelSingular: 'عملية واحدة',
      artifactsToggleLabel: 'عرض جميع ملفات القطع الأثرية ({count})',
      artifactsToggleLabelSingular: 'عرض ملف القطعة الأثرية',
      sourceInEnglishNote:
        'تُنشر المواد المصدر (المنهجيات والقوالب والقطع الأثرية للتحليل اليومي) باللغة الإنجليزية. لذلك تظهر العناوين ومسارات الملفات بالإنجليزية — فقط تنقل الصفحة والأوصاف مترجمة.',
      seoKeywords:
        'البرلمان الأوروبي, الاستخبارات السياسية, OSINT, تحليل SWOT, تحليل PESTLE, منهجية, قوالب الأدلة, رياضيات التحالف, تقييم المخاطر, نموذج التهديد, الشفافية, الاتحاد الأوروبي',
    },
    he: {
      title: 'מודיעין פוליטי',
      intro:
        'כל ניתוח פוליטי המתפרסם באתר זה נתמך בשרשרת שקופה של מתודולוגיות, תבניות ארטיפקטים ונתוני ניתוח ברמת ריצה. עמוד זה מספק אינדקס יחיד ומקושר במלואו לכל המלאכה המשמשת להפקת החדשות.',
      heroSubtitle: 'מתודולוגיות, תבניות ושקיפות ניתוח יומי',
      home: 'בית',
      breadcrumbCurrent: 'מודיעין פוליטי',
      breadcrumbLabel: 'נתיב ניווט',
      methodologiesHeading: 'מתודולוגיות',
      methodologiesDescription:
        'מדריכי מלאכה מוסמכים — מסגרות סיכון, סטנדרטי סגנון ופרוטוקול ניתוח מונחה בינה מלאכותית בן 10 שלבים.',
      templatesHeading: 'תבניות ניתוח',
      templatesDescription:
        'קטלוג תבניות ארטיפקטים המיוצרות בכל ריצת ניתוח יומית — SWOT, PESTLE, מטריצות איום, דינמיקות קואליציה ועצי השלכות.',
      referenceHeading: 'הפניות ומקורות נתונים',
      referenceDescription:
        'התאמות ייחוס ISMS, קטלוגי אינדיקטורים, מיפויי מדינות האיחוד האירופי ומדריכי שילוב תרשימים מאחורי כל מקור של קרן המטבע הבינלאומית והבנק העולמי.',
      statReferenceLabel: 'הפניות',
      dailyHeading: 'ריצות ניתוח יומיות',
      dailyDescription:
        'כל ריצת ניתוח שפורסמה, מקובצת לפי תאריך ומסודרת מהחדש ביותר. כל ריצה מקושרת לעץ GitHub המלא.',
      statMethodologiesLabel: 'מתודולוגיות',
      statTemplatesLabel: 'תבניות',
      statRunsLabel: 'ריצות ניתוח',
      statArtifactsLabel: 'ארטיפקטים',
      viewOnGitHub: 'הצג ב-GitHub',
      artifactCountLabel: '{count} ארטיפקטים',
      artifactCountLabelSingular: 'ארטיפקט אחד',
      runsCountLabel: '{count} ריצות',
      runsCountLabelSingular: 'ריצה אחת',
      artifactsToggleLabel: 'הצג את כל {count} קבצי הארטיפקטים',
      artifactsToggleLabelSingular: 'הצג את קובץ הארטיפקט',
      sourceInEnglishNote:
        'חומרי המקור (מתודולוגיות, תבניות וארטיפקטי ניתוח יומיים) מתפרסמים באנגלית. הכותרות ונתיבי הקבצים מופיעים אפוא באנגלית — רק הניווט והתיאורים בדף תורגמו.',
      seoKeywords:
        'הפרלמנט האירופי, מודיעין פוליטי, OSINT, ניתוח SWOT, ניתוח PESTLE, מתודולוגיה, תבניות ארטיפקט, מתמטיקה של קואליציות, הערכת סיכונים, מודל איום, שקיפות, האיחוד האירופי',
    },
    ja: {
      title: '政治インテリジェンス',
      intro:
        '当サイトで公開されるすべての政治分析は、透明な方法論・成果物テンプレート・実行レベルの分析データの連鎖に裏付けられています。このページは、ニュースを生み出すために使用されるすべてのトレードクラフトへの単一の、完全にリンクされたインデックスを提供します。',
      heroSubtitle: '方法論、テンプレート、日次分析の透明性',
      home: 'ホーム',
      breadcrumbCurrent: '政治インテリジェンス',
      breadcrumbLabel: 'パンくずリスト',
      methodologiesHeading: '方法論',
      methodologiesDescription:
        '権威あるトレードクラフトガイド — リスクフレームワーク、スタイル基準、10 ステップの AI 駆動分析プロトコル。',
      templatesHeading: '分析テンプレート',
      templatesDescription:
        '毎日の分析実行で生成される成果物テンプレートのカタログ — SWOT、PESTLE、脅威マトリックス、連携ダイナミクス、結果ツリーなど。',
      referenceHeading: '参照とデータソース',
      referenceDescription:
        'ISMS参照適応、指標カタログ、EU各国マッピング、および IMF と世界銀行のデータパイプラインの背後にあるチャート統合ガイド。',
      statReferenceLabel: '参照',
      dailyHeading: '日次分析実行',
      dailyDescription:
        '公開されたすべての分析実行を日付でグループ化し、新しい順に並べています。各実行は完全な GitHub ツリーにリンクします。',
      statMethodologiesLabel: '方法論',
      statTemplatesLabel: 'テンプレート',
      statRunsLabel: '分析実行',
      statArtifactsLabel: '成果物',
      viewOnGitHub: 'GitHub で表示',
      artifactCountLabel: '{count} 件の成果物',
      artifactCountLabelSingular: '1 件の成果物',
      runsCountLabel: '{count} 件の実行',
      runsCountLabelSingular: '1 件の実行',
      artifactsToggleLabel: '{count} 件のすべての成果物ファイルを表示',
      artifactsToggleLabelSingular: '1 件の成果物ファイルを表示',
      sourceInEnglishNote:
        'ソース資料(方法論・テンプレート・日次分析成果物)は英語で公開されています。そのためタイトルとファイルパスは英語で表示されます。ページのナビゲーションと説明のみが翻訳されています。',
      seoKeywords:
        '欧州議会, 政治インテリジェンス, OSINT, SWOT分析, PESTLE分析, 方法論, 成果物テンプレート, 連立数学, リスク評価, 脅威モデル, 透明性, EU',
    },
    ko: {
      title: '정치 정보',
      intro:
        '본 사이트에 게시되는 모든 정치 분석은 방법론, 산출물 템플릿, 실행 수준 분석 데이터의 투명한 사슬에 의해 뒷받침됩니다. 이 페이지는 뉴스를 제작하는 데 사용된 모든 기술을 단일하고 완전히 링크된 인덱스로 제공합니다.',
      heroSubtitle: '방법론, 템플릿 및 일일 분석 투명성',
      home: '홈',
      breadcrumbCurrent: '정치 정보',
      breadcrumbLabel: '이동 경로',
      methodologiesHeading: '방법론',
      methodologiesDescription:
        '권위 있는 트레이드크래프트 가이드 — 위험 프레임워크, 스타일 표준, 10단계 AI 기반 분석 프로토콜.',
      templatesHeading: '분석 템플릿',
      templatesDescription:
        '매일 분석 실행에서 생성되는 산출물 템플릿 카탈로그 — SWOT, PESTLE, 위협 매트릭스, 연합 역학, 결과 트리.',
      referenceHeading: '참조 및 데이터 출처',
      referenceDescription:
        'ISMS 참조 적응, 지표 카탈로그, EU 국가 매핑, IMF 및 세계은행 데이터 파이프라인의 차트 통합 가이드.',
      statReferenceLabel: '참조',
      dailyHeading: '일일 분석 실행',
      dailyDescription:
        '게시된 모든 분석 실행을 날짜별로 그룹화하여 최신순으로 정렬합니다. 각 실행은 전체 GitHub 트리로 연결됩니다.',
      statMethodologiesLabel: '방법론',
      statTemplatesLabel: '템플릿',
      statRunsLabel: '분석 실행',
      statArtifactsLabel: '산출물',
      viewOnGitHub: 'GitHub에서 보기',
      artifactCountLabel: '{count}개 산출물',
      artifactCountLabelSingular: '1개 산출물',
      runsCountLabel: '{count}회 실행',
      runsCountLabelSingular: '1회 실행',
      artifactsToggleLabel: '{count}개 산출물 파일 모두 보기',
      artifactsToggleLabelSingular: '1개 산출물 파일 보기',
      sourceInEnglishNote:
        '원본 자료(방법론, 템플릿, 일일 분석 산출물)는 영어로 게시됩니다. 따라서 제목과 파일 경로는 영어로 표시되며, 페이지 탐색 및 설명만 번역되어 있습니다.',
      seoKeywords:
        '유럽의회, 정치 정보, OSINT, SWOT 분석, PESTLE 분석, 방법론, 산출물 템플릿, 연정 수학, 위험 평가, 위협 모델, 투명성, EU',
    },
    zh: {
      title: '政治情报',
      intro:
        '本网站上发布的每一篇政治分析都由方法论、工件模板和运行级分析数据的透明链条所支撑。本页面提供了一个单一、完全链接的索引,指向用于生成新闻的所有工艺。',
      heroSubtitle: '方法论、模板和每日分析透明度',
      home: '首页',
      breadcrumbCurrent: '政治情报',
      breadcrumbLabel: '面包屑导航',
      methodologiesHeading: '方法论',
      methodologiesDescription:
        '权威的工艺指南 — 风险框架、风格标准,以及每篇文章遵循的 10 步 AI 驱动分析协议。',
      templatesHeading: '分析模板',
      templatesDescription:
        '每次日常分析运行中产生的工件模板目录 — SWOT、PESTLE、威胁矩阵、联盟动态和后果树。',
      referenceHeading: '参考与数据源',
      referenceDescription:
        'ISMS 参考适配、指标目录、欧盟国家映射以及 IMF 和世界银行数据管道背后的图表集成指南。',
      statReferenceLabel: '参考',
      dailyHeading: '每日分析运行',
      dailyDescription:
        '每次发布的分析运行,按日期分组并按最新优先排序。每次运行都链接到完整的 GitHub 树。',
      statMethodologiesLabel: '方法论',
      statTemplatesLabel: '模板',
      statRunsLabel: '分析运行',
      statArtifactsLabel: '工件',
      viewOnGitHub: '在 GitHub 上查看',
      artifactCountLabel: '{count} 个工件',
      artifactCountLabelSingular: '1 个工件',
      runsCountLabel: '{count} 次运行',
      runsCountLabelSingular: '1 次运行',
      artifactsToggleLabel: '显示全部 {count} 个工件文件',
      artifactsToggleLabelSingular: '显示 1 个工件文件',
      sourceInEnglishNote:
        '源材料(方法论、模板和每日分析工件)以英文发布。因此标题和文件路径以英文显示 — 仅页面导航和描述进行了翻译。',
      seoKeywords:
        '欧洲议会, 政治情报, OSINT, SWOT 分析, PESTLE 分析, 方法论, 工件模板, 联盟数学, 风险评估, 威胁模型, 透明度, 欧盟',
    },
  };
})();

/**
 * Resolve the localized copy for the political-intelligence page,
 * merging the locale-specific overrides on top of the English
 * defaults. Unknown language codes (including prototype-pollution
 * payloads like `__proto__`) silently fall back to English — the
 * caller is responsible for validating `lang` against the supported
 * language allow-list.
 *
 * @param lang - Language code
 * @returns Fully-populated {@link PICopy}
 */
export function getPICopy(lang: string): PICopy {
   
  const overrides = PI_COPY[lang] ?? {};
  return { ...DEFAULT_COPY, ...overrides };
}
