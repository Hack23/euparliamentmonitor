// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence
 * @description Generates the localized `political-intelligence_<lang>.html`
 * pages — a curated index of every political-intelligence methodology,
 * artifact template, and daily analysis run shipped in this repository.
 *
 * Each page links to the matching Markdown source on GitHub so that readers
 * can inspect the raw tradecraft behind every published article. The English
 * variant lives at `political-intelligence.html`; all 13 other locales live
 * at `political-intelligence_<lang>.html`.
 */

import fs from 'fs';
import path from 'path';
import {
  PROJECT_ROOT,
  BASE_URL,
  createThemeToggleButton,
  THEME_TOGGLE_SCRIPT,
} from '../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  PAGE_TITLES,
  SKIP_LINK_TEXTS,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  getLocalizedString,
  getTextDirection,
} from '../constants/languages.js';
import { escapeHTML } from '../utils/file-utils.js';
import { FOOTER_SITEMAP_LABELS } from '../constants/language-ui.js';
import { buildSiteFooter } from '../templates/section-builders.js';
import type { LanguageCode } from '../types/index.js';
import { getCuratedDescription, getCuratedTitle } from './political-intelligence-descriptions.js';

/** GitHub repository slug used to build blob/tree links for analysis artifacts */
const GITHUB_REPO = 'Hack23/euparliamentmonitor';

/**
 * Build a GitHub blob URL (single file) on the main branch.
 *
 * @param relPath - Path relative to the repository root
 * @returns Absolute GitHub blob URL
 */
function githubBlobUrl(relPath: string): string {
  return `https://github.com/${GITHUB_REPO}/blob/main/${relPath.replace(/\\/g, '/')}`;
}

/**
 * Build a GitHub tree URL (directory) on the main branch.
 *
 * @param relPath - Path relative to the repository root
 * @returns Absolute GitHub tree URL
 */
function githubTreeUrl(relPath: string): string {
  return `https://github.com/${GITHUB_REPO}/tree/main/${relPath.replace(/\\/g, '/')}`;
}

/**
 * Get the political-intelligence HTML filename for a given language code.
 *
 * @param lang - Language code
 * @returns Filename string
 */
export function getPoliticalIntelligenceFilename(lang: string): string {
  return lang === 'en' ? 'political-intelligence.html' : `political-intelligence_${lang}.html`;
}

/** Metadata for a single methodology / template Markdown file */
export interface PIDocument {
  /** Path relative to the repo root (e.g. "analysis/methodologies/foo.md") */
  relPath: string;
  /** Filename stem without extension */
  stem: string;
  /** Human-readable title extracted from the first H1 heading or derived from the stem */
  title: string;
  /** Short summary (first non-empty paragraph, truncated to ~220 chars) */
  description: string;
  /** Emoji/icon that represents this document in the UI */
  icon: string;
}

/** A grouped set of daily analysis runs for one date */
export interface PIDailyDateGroup {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Runs produced on that date, sorted alphabetically */
  runs: PIDailyRun[];
}

/** A single daily analysis run directory */
export interface PIDailyRun {
  /** Run slug (e.g. "breaking-run190", "motions-run46") */
  slug: string;
  /** Number of Markdown artifacts inside the run directory (recursive) */
  artifactCount: number;
  /** Path relative to the repo root of the run directory */
  relPath: string;
  /** Emoji/icon derived from the run slug */
  icon: string;
  /** Individual Markdown artifacts inside the run, sorted by path */
  artifacts: PIDailyArtifact[];
}

/** A single Markdown artifact file inside a daily run directory */
export interface PIDailyArtifact {
  /** Path relative to the repo root (e.g. "analysis/daily/2026-04-22/breaking-run1/intelligence/swot.md") */
  relPath: string;
  /** Path relative to the run directory (e.g. "intelligence/swot.md") */
  shortPath: string;
}

/** Input payload used by {@link generatePoliticalIntelligenceHTML} */
export interface PIPageData {
  /** Methodology files from `analysis/methodologies/` */
  methodologies: PIDocument[];
  /** Template files from `analysis/templates/` */
  templates: PIDocument[];
  /**
   * Reference & data-source documentation bundling `analysis/reference/`,
   * `analysis/imf/`, and `analysis/worldbank/` — ISMS adaptations, chart
   * integration guides, indicator catalogs, EU country mappings, and use
   * cases. Ensures every authored analysis artifact surfaces on the
   * political-intelligence index.
   */
  referenceDocs: PIDocument[];
  /** Daily analysis runs grouped by date, newest date first */
  dailyGroups: PIDailyDateGroup[];
}

/** Localized copy strings for the political-intelligence page */
interface PICopy {
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
  /** "{count} artifacts" label for each run */
  artifactCountLabel: string;
  /** "{count} runs" label in the date-group header */
  runsCountLabel: string;
  /** Label for the expandable artifact-file list inside each run (e.g. "Show all {count} artifact files") */
  artifactsToggleLabel: string;
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

const DEFAULT_COPY: PICopy = {
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
  runsCountLabel: '{count} runs',
  artifactsToggleLabel: 'Show all {count} artifact files',
  sourceInEnglishNote: '',
  seoKeywords:
    'European Parliament, political intelligence, OSINT, SWOT, PESTLE, TOWS, STRIDE, methodology, artifact templates, coalition mathematics, risk assessment, threat model, transparency, EU',
};

/** Per-language overrides; fall back to English for any missing key */
const PI_COPY: Partial<Record<string, Partial<PICopy>>> = (() => {
  const SV_METHODOLOGIES = 'Metodologier';
  const NO_METHODOLOGIES = 'Metodologier';
  const ARTEFAKTER_COUNT = '{count} artefakter';
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
      runsCountLabel: '{count} körningar',
      artifactsToggleLabel: 'Visa alla {count} artefaktfiler',
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
      runsCountLabel: '{count} kørsler',
      artifactsToggleLabel: 'Vis alle {count} artefaktfiler',
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
      runsCountLabel: '{count} kjøringer',
      artifactsToggleLabel: 'Vis alle {count} artefaktfiler',
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
      runsCountLabel: '{count} ajoa',
      artifactsToggleLabel: 'Näytä kaikki {count} artefaktitiedostoa',
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
      runsCountLabel: '{count} Läufe',
      artifactsToggleLabel: 'Alle {count} Artefaktdateien anzeigen',
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
      runsCountLabel: '{count} exécutions',
      artifactsToggleLabel: 'Afficher les {count} fichiers d\u2019artefacts',
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
      runsCountLabel: '{count} ejecuciones',
      artifactsToggleLabel: 'Mostrar los {count} archivos de artefactos',
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
      runsCountLabel: '{count} uitvoeringen',
      artifactsToggleLabel: 'Alle {count} artefactbestanden tonen',
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
      runsCountLabel: '{count} عمليات',
      artifactsToggleLabel: 'عرض جميع ملفات القطع الأثرية ({count})',
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
      runsCountLabel: '{count} ריצות',
      artifactsToggleLabel: 'הצג את כל {count} קבצי הארטיפקטים',
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
      runsCountLabel: '{count} 件の実行',
      artifactsToggleLabel: '{count} 件のすべての成果物ファイルを表示',
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
      runsCountLabel: '{count}회 실행',
      artifactsToggleLabel: '{count}개 산출물 파일 모두 보기',
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
      runsCountLabel: '{count} 次运行',
      artifactsToggleLabel: '显示全部 {count} 个工件文件',
      sourceInEnglishNote:
        '源材料(方法论、模板和每日分析工件)以英文发布。因此标题和文件路径以英文显示 — 仅页面导航和描述进行了翻译。',
      seoKeywords:
        '欧洲议会, 政治情报, OSINT, SWOT 分析, PESTLE 分析, 方法论, 工件模板, 联盟数学, 风险评估, 威胁模型, 透明度, 欧盟',
    },
  };
})();

/**
 * Resolve the localized copy for the political-intelligence page, merging
 * the locale-specific overrides on top of the English defaults.
 *
 * @param lang - Language code
 * @returns Fully-populated {@link PICopy}
 */
function getPICopy(lang: string): PICopy {
  // eslint-disable-next-line security/detect-object-injection
  const overrides = PI_COPY[lang] ?? {};
  return { ...DEFAULT_COPY, ...overrides };
}

/**
 * Ordered icon-matching table for analysis documents. Each entry maps a list
 * of lowercase substring hints to a single emoji; the first hint that matches
 * the stem wins. Kept as data so complexity stays low.
 */
const DOCUMENT_ICON_RULES: readonly [readonly string[], string][] = [
  [['readme'], '📘'],
  [['swot'], '🧭'],
  [['pestle'], '🌍'],
  [['threat'], '⚠️'],
  [['risk'], '📊'],
  [['coalition'], '🤝'],
  [['actor'], '👥'],
  [['impact'], '💥'],
  [['economic', 'imf', 'worldbank'], '💶'],
  [['timeline', 'historical'], '🕰️'],
  [['methodology', 'guide', 'style'], '🧭'],
  [['classification'], '🏷️'],
  [['intelligence'], '🔍'],
  [['network'], '🕸️'],
  [['velocity', 'legislative'], '⚖️'],
  [['consequence'], '🌿'],
  [['disruption'], '🌀'],
  [['reflection'], '🪞'],
  [['reliability', 'audit'], '✅'],
  [['forces'], '⚔️'],
  [['osint', 'tradecraft'], '🕵️'],
  [['catalog'], '📚'],
  [['capital'], '💼'],
  [['cross-session', 'cross-run'], '🔁'],
  [['per-file', 'per-artifact'], '🗂️'],
  [['artifact'], '📋'],
];

/**
 * Heuristically pick an icon for an analysis document/slug. The icons are
 * chosen to visually differentiate the most common artifact types without
 * depending on a heavy icon library.
 *
 * @param stem - File/directory name stem (will be lowercased internally)
 * @returns A single emoji character
 */
export function pickDocumentIcon(stem: string): string {
  const s = stem.toLowerCase();
  for (const [hints, icon] of DOCUMENT_ICON_RULES) {
    if (hints.some((h) => s.includes(h))) {
      return icon;
    }
  }
  return '📄';
}

/** Ordered slug-prefix → icon rules for daily runs. */
const RUN_ICON_RULES: readonly [readonly string[], string][] = [
  [['breaking'], '🚨'],
  [['week-ahead', 'month-ahead', 'year-ahead'], '🔭'],
  [['week-in-review', 'weekly-review'], '📅'],
  [['month-in-review', 'monthly-review'], '🗓️'],
  [['year-in-review'], '📜'],
  [['motions'], '🗳️'],
  [['propositions'], '⚖️'],
  [['committee-reports', 'committee'], '🏛️'],
  [['translate'], '🌐'],
  [['deep'], '🔬'],
];

/**
 * Pick an icon for a daily run based on its slug prefix.
 *
 * @param slug - Run slug such as `breaking-run190` or `motions-run46`
 * @returns A single emoji character
 */
export function pickRunIcon(slug: string): string {
  const s = slug.toLowerCase();
  for (const [prefixes, icon] of RUN_ICON_RULES) {
    if (prefixes.some((p) => s.startsWith(p))) {
      return icon;
    }
  }
  return '📂';
}

/**
 * Strip a leading emoji token (and trailing whitespace) from a heading line,
 * repeatedly, so headings like `🚀 ⚠️ Risk Scoring` become `Risk Scoring`.
 *
 * The implementation peels the string character-by-character via
 * `String.prototype[Symbol.iterator]` to correctly handle astral-plane
 * pictographics, VS-16 (`\uFE0F`), and ZWJ sequences — without the nested
 * quantifier patterns that would trigger `security/detect-unsafe-regex`.
 *
 * @param text - Heading text (without the leading `# `)
 * @returns Trimmed text with any leading emoji tokens removed
 */
function stripLeadingEmoji(text: string): string {
  const isPictographic = /\p{Extended_Pictographic}/u;
  const isModifier = /[\uFE0F\u200D]/u;
  const chars = [...text]; // iterates by Unicode code point
  let i = 0;
  for (const ch of chars) {
    if (isPictographic.test(ch) || isModifier.test(ch) || /\s/.test(ch)) {
      i++;
      continue;
    }
    break;
  }
  return chars.slice(i).join('').trim();
}

/**
 * Extract the first `# H1` heading from a list of lines.
 *
 * @param lines - Markdown source split on newlines
 * @param fallback - Value returned when no H1 is found
 * @returns Extracted heading text or the fallback
 */
function extractH1Title(lines: string[], fallback: string): string {
  for (const line of lines) {
    const h1 = /^#\s+(.+?)\s*$/.exec(line);
    if (h1?.[1]) {
      return stripLeadingEmoji(h1[1]);
    }
  }
  return fallback;
}

/**
 * Extract a title and short description from the top of a Markdown file.
 * Uses the first H1 (`# …`) line as title (falling back to a humanized stem).
 *
 * The `description` field is intentionally left **empty**: for the
 * political-intelligence index we use a curated per-file, per-language
 * description table ({@link getCuratedDescription}) instead of scraping the
 * first paragraph of each Markdown file. Scraping proved fragile — it leaked
 * document-metadata headers (`📋 Document Owner: CEO | 📄 Version…`) and
 * template separators (`---`) into the rendered cards. Leaving it empty here
 * forces the renderer to go through the curated table.
 *
 * @param fullPath - Absolute path to a Markdown file
 * @param stem - Filename stem used as title fallback
 * @returns `{ title, description }` — description is always `''`
 */
export function parseMarkdownMeta(
  fullPath: string,
  stem: string
): { title: string; description: string } {
  const fallbackTitle = humanize(stem);
  let content: string;
  try {
    content = fs.readFileSync(fullPath, 'utf-8');
  } catch {
    return { title: fallbackTitle, description: '' };
  }
  const lines = content.split(/\r?\n/);
  const title = extractH1Title(lines, fallbackTitle);
  return { title, description: '' };
}

/**
 * Humanize a filename stem (e.g. `per-artifact-methodologies` →
 * `Per Artifact Methodologies`).
 *
 * @param stem - Filename stem to humanize
 * @returns Title-cased stem with dashes/underscores replaced by spaces
 */
function humanize(stem: string): string {
  return stem.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Scan the repository for all methodology and template Markdown files and
 * build the list of daily analysis runs.
 *
 * @param rootDir - Repository root (defaults to PROJECT_ROOT)
 * @returns Fully-populated {@link PIPageData}
 */
export function collectPoliticalIntelligenceData(rootDir: string = PROJECT_ROOT): PIPageData {
  const methodologies = collectDocumentList(
    path.join(rootDir, 'analysis', 'methodologies'),
    rootDir
  );
  const templates = collectDocumentList(path.join(rootDir, 'analysis', 'templates'), rootDir);
  const referenceDocs = collectReferenceDocs(rootDir);
  const dailyGroups = collectDailyGroups(path.join(rootDir, 'analysis', 'daily'), rootDir);
  return { methodologies, templates, referenceDocs, dailyGroups };
}

/**
 * Collect documentation from the auxiliary reference directories:
 * `analysis/reference/`, `analysis/imf/`, and `analysis/worldbank/`.
 *
 * Each collected file's stem is prefixed with the source directory name
 * (e.g. `imf/indicator-catalog`) so the icon picker can disambiguate and
 * readers can see the source in the PIDocument listing.
 *
 * @param rootDir - Repository root
 * @returns Merged list of reference PIDocument entries, sorted by source then name
 */
function collectReferenceDocs(rootDir: string): PIDocument[] {
  const sources = ['reference', 'imf', 'worldbank'] as const;
  const result: PIDocument[] = [];
  for (const source of sources) {
    const dir = path.join(rootDir, 'analysis', source);
    if (!fs.existsSync(dir)) continue;
    const docs = collectDocumentList(dir, rootDir);
    // Tag the stem with source so duplicates (e.g. `indicator-catalog` exists
    // in both `imf/` and `worldbank/`) sort and render distinctly.
    for (const doc of docs) {
      result.push({
        ...doc,
        stem: `${source}/${doc.stem}`,
      });
    }
  }
  // Source-group ordering: reference, imf, worldbank (preserve insertion order)
  // and within each group keep README-first alphabetical from collectDocumentList.
  return result;
}

/**
 * Collect every `.md` file in `dir` (non-recursive) and build PIDocument entries.
 *
 * @param dir - Absolute directory path to scan
 * @param rootDir - Repository root used to build relative paths
 * @returns Array of PIDocument entries sorted with README first, then alphabetical
 */
function collectDocumentList(dir: string, rootDir: string): PIDocument[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result: PIDocument[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.md')) continue;
    const fullPath = path.join(dir, entry.name);
    const stem = entry.name.replace(/\.md$/i, '');
    const { title, description } = parseMarkdownMeta(fullPath, stem);
    const relPath = path.relative(rootDir, fullPath).split(path.sep).join('/');
    result.push({
      relPath,
      stem,
      title,
      description,
      icon: pickDocumentIcon(stem),
    });
  }
  // README first, then alphabetical
  result.sort((a, b) => {
    const aReadme = /readme/i.test(a.stem);
    const bReadme = /readme/i.test(b.stem);
    if (aReadme !== bReadme) return aReadme ? -1 : 1;
    return a.stem.localeCompare(b.stem);
  });
  return result;
}

/**
 * Collect daily analysis runs grouped by date, newest date first.
 * Only directories that look like a run (contain at least one Markdown artifact)
 * are listed.
 *
 * @param dailyDir - Absolute path to the `analysis/daily` directory
 * @param rootDir - Repository root used to build relative paths
 * @returns Array of date-grouped runs, newest date first
 */
function collectDailyGroups(dailyDir: string, rootDir: string): PIDailyDateGroup[] {
  if (!fs.existsSync(dailyDir)) return [];
  const dateDirs = fs
    .readdirSync(dailyDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.name))
    .map((d) => d.name);
  // Newest first
  dateDirs.sort((a, b) => b.localeCompare(a));

  const groups: PIDailyDateGroup[] = [];
  for (const date of dateDirs) {
    const dateDir = path.join(dailyDir, date);
    const runDirs = fs
      .readdirSync(dateDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    const runs: PIDailyRun[] = [];
    for (const slug of runDirs) {
      const runDir = path.join(dateDir, slug);
      const artifacts = collectRunArtifacts(runDir, rootDir);
      if (artifacts.length === 0) continue;
      const relPath = path.relative(rootDir, runDir).split(path.sep).join('/');
      runs.push({
        slug,
        artifactCount: artifacts.length,
        relPath,
        icon: pickRunIcon(slug),
        artifacts,
      });
    }
    if (runs.length > 0) {
      groups.push({ date, runs });
    }
  }
  return groups;
}

/**
 * Recursively collect every Markdown artifact file under a run directory,
 * returning both the repo-relative path (used to build GitHub blob URLs)
 * and the run-relative short path (used for compact display).
 *
 * The caller guarantees `runDir` is a run directory such as
 * `analysis/daily/2026-04-22/breaking-run1`. Unreadable subtrees are
 * silently skipped so a single permission error can't blow up the page
 * generation for an entire date group.
 *
 * @param runDir - Absolute path to the run directory
 * @param rootDir - Repository root used to build relative paths
 * @returns Artifact entries sorted alphabetically by short path
 */
function collectRunArtifacts(runDir: string, rootDir: string): PIDailyArtifact[] {
  const artifacts: PIDailyArtifact[] = [];
  walkMarkdownFiles(runDir, (full) => {
    const relPath = path.relative(rootDir, full).split(path.sep).join('/');
    const shortPath = path.relative(runDir, full).split(path.sep).join('/');
    artifacts.push({ relPath, shortPath });
  });
  artifacts.sort((a, b) => a.shortPath.localeCompare(b.shortPath));
  return artifacts;
}

/**
 * Walk `dir` recursively and invoke `visit` for every `.md` file found.
 * Shared traversal used by {@link collectRunArtifacts}. Unreadable subtrees
 * are silently skipped.
 *
 * @param dir - Absolute directory path to walk
 * @param visit - Callback invoked with each Markdown file's absolute path
 */
function walkMarkdownFiles(dir: string, visit: (fullPath: string) => void): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(full, visit);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      visit(full);
    }
  }
}

/**
 * Render a single document card (used for methodologies, templates, references).
 *
 * The description comes from the curated per-file, per-language table
 * ({@link getCuratedDescription}) — not from the Markdown source file —
 * so every language page carries a meaningful, hand-written summary.
 *
 * @param doc - The document to render
 * @param lang - Target language code (drives per-language description lookup)
 * @param viewOnGitHub - Localized call-to-action label
 * @returns HTML string for the card `<li>` element
 */
function renderDocumentCard(doc: PIDocument, lang: LanguageCode, viewOnGitHub: string): string {
  const url = githubBlobUrl(doc.relPath);
  const title = getCuratedTitle(doc.relPath, lang, doc.title);
  const description = getCuratedDescription(doc.relPath, lang, doc.title);
  const desc = description ? `<span class="pi-card__desc">${escapeHTML(description)}</span>` : '';
  return `          <li class="pi-card">
            <a class="pi-card__link" href="${escapeHTML(url)}" rel="noopener external" target="_blank">
              <span class="pi-card__icon" aria-hidden="true">${doc.icon}</span>
              <span class="pi-card__body">
                <span class="pi-card__title">${escapeHTML(title)}</span>
                <span class="pi-card__path"><code>${escapeHTML(doc.relPath)}</code></span>
                ${desc}
                <span class="pi-card__cta">${escapeHTML(viewOnGitHub)} <span aria-hidden="true">↗</span></span>
              </span>
            </a>
          </li>`;
}

/**
 * Render one daily date group (header + run cards).
 *
 * Each run card is a flex row that links to the run folder on GitHub; below
 * it a collapsed `<details>` lists every individual artifact file with a
 * direct blob URL, so readers can deep-link to a single artifact without
 * first navigating the folder tree.
 *
 * @param group - The date group to render
 * @param copy - Localized copy for labels inside the group
 * @returns HTML string for the `<section>` containing all runs for the date
 */
function renderDailyGroup(group: PIDailyDateGroup, copy: PICopy): string {
  const runsCountText = copy.runsCountLabel.replace('{count}', String(group.runs.length));
  const runCards = group.runs.map((run) => renderDailyRun(run, copy)).join('\n');
  return `        <section class="pi-date-group" aria-labelledby="date-${escapeHTML(group.date)}">
          <h3 id="date-${escapeHTML(group.date)}" class="pi-date-group__heading">
            <time datetime="${escapeHTML(group.date)}">${escapeHTML(group.date)}</time>
            <span class="pi-date-group__count">${escapeHTML(runsCountText)}</span>
          </h3>
          <ul class="pi-run-list">
${runCards}
          </ul>
        </section>`;
}

/**
 * Render a single daily-run entry: the run-folder link plus a collapsed
 * `<details>` list of every Markdown artifact inside the run, each linking
 * to its GitHub blob URL.
 *
 * @param run - Run descriptor produced by {@link collectDailyGroups}
 * @param copy - Localized copy for artifact-count and toggle labels
 * @returns HTML string for the `<li>` element
 */
function renderDailyRun(run: PIDailyRun, copy: PICopy): string {
  const url = githubTreeUrl(run.relPath);
  const countLabel = copy.artifactCountLabel.replace('{count}', String(run.artifactCount));
  const toggleLabel = copy.artifactsToggleLabel.replace('{count}', String(run.artifactCount));
  const artifactLinks = run.artifacts
    .map(
      (art) =>
        `                    <li><a href="${escapeHTML(githubBlobUrl(art.relPath))}" rel="noopener external" target="_blank"><code>${escapeHTML(art.shortPath)}</code></a></li>`
    )
    .join('\n');
  // The artifact <details> is rendered OUTSIDE the top-level <a> so the
  // disclosure triangle remains independently keyboard-focusable and the
  // run-link click target stays unambiguous.
  return `            <li class="pi-run">
              <a class="pi-run__link" href="${escapeHTML(url)}" rel="noopener external" target="_blank">
                <span class="pi-run__icon" aria-hidden="true">${run.icon}</span>
                <span class="pi-run__body">
                  <span class="pi-run__slug">${escapeHTML(run.slug)}</span>
                  <span class="pi-run__meta">${escapeHTML(countLabel)}</span>
                </span>
                <span class="pi-run__cta" aria-hidden="true">↗</span>
              </a>
              <details class="pi-run__artifacts">
                <summary class="pi-run__artifacts-toggle">${escapeHTML(toggleLabel)}</summary>
                <ul class="pi-run__artifacts-list">
${artifactLinks}
                </ul>
              </details>
            </li>`;
}

/**
 * Generate the HTML document for one language version of the
 * political-intelligence page.
 *
 * @param lang - Language code
 * @param data - Page data (see {@link collectPoliticalIntelligenceData})
 * @returns Complete HTML document string
 */
export function generatePoliticalIntelligenceHTML(lang: string, data: PIPageData): string {
  const copy = getPICopy(lang);
  const siteTitle =
    getLocalizedString(PAGE_TITLES, lang).split(' - ')[0] ?? 'EU Parliament Monitor';
  const pageTitle = `${siteTitle} - ${copy.title}`;
  const description = copy.intro;
  const skipLinkText = getLocalizedString(SKIP_LINK_TEXTS, lang);
  const headerSubtitle = escapeHTML(getLocalizedString(HEADER_SUBTITLE_LABELS, lang));
  const themeToggleLabel = escapeHTML(getLocalizedString(THEME_TOGGLE_LABELS, lang));
  const dir = getTextDirection(lang);
  const canonicalUrl = `${BASE_URL}/${getPoliticalIntelligenceFilename(lang)}`;
  const indexHref = lang === 'en' ? 'index.html' : `index-${lang}.html`;
  const sitemapHref = lang === 'en' ? 'sitemap.html' : `sitemap_${lang}.html`;

  // Cross-language <link rel="alternate"> block
  const hreflangLinks = [
    ...ALL_LANGUAGES.map(
      (code) =>
        `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/${getPoliticalIntelligenceFilename(code)}">`
    ),
    `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/political-intelligence.html">`,
  ].join('\n');

  // Stats (totals)
  const totalRuns = data.dailyGroups.reduce((acc, g) => acc + g.runs.length, 0);
  const totalArtifacts = data.dailyGroups.reduce(
    (acc, g) => acc + g.runs.reduce((a, r) => a + r.artifactCount, 0),
    0
  );

  // Language switcher (mirrors sitemap layout)
  const langSwitcher = ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const active = code === lang ? ' active' : '';
    const ariaCurrent = code === lang ? ' aria-current="page"' : '';
    const href = getPoliticalIntelligenceFilename(code);
    return `<a href="${href}" class="lang-link${active}" hreflang="${code}" title="${escapeHTML(name)}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
  }).join('\n        ');

  // Methodologies, templates & reference cards.
  // Descriptions are sourced from the curated per-file, per-language table
  // ({@link getCuratedDescription}) — every language page renders a
  // meaningful, hand-written summary, not scraped Markdown metadata.
  const langCode = lang as LanguageCode;
  const methodologiesList = data.methodologies
    .map((d) => renderDocumentCard(d, langCode, copy.viewOnGitHub))
    .join('\n');
  const templatesList = data.templates
    .map((d) => renderDocumentCard(d, langCode, copy.viewOnGitHub))
    .join('\n');
  const referenceList = data.referenceDocs
    .map((d) => renderDocumentCard(d, langCode, copy.viewOnGitHub))
    .join('\n');
  const dailyBody =
    data.dailyGroups.length === 0
      ? ''
      : data.dailyGroups.map((g) => renderDailyGroup(g, copy)).join('\n');

  // Localized source-in-English note (non-English pages only)
  const sourceNote = copy.sourceInEnglishNote
    ? `      <p class="pi-source-note" role="note">${escapeHTML(copy.sourceInEnglishNote)}</p>`
    : '';

  // JSON-LD structured data (CollectionPage with BreadcrumbList + publisher)
  const publisher = {
    '@type': 'Organization',
    name: 'Hack23 AB',
    url: 'https://hack23.com',
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy.title,
    url: canonicalUrl,
    description: copy.intro,
    inLanguage: lang,
    author: publisher,
    publisher,
    isPartOf: {
      '@type': 'WebSite',
      name: 'EU Parliament Monitor',
      url: BASE_URL,
      publisher,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: copy.home, item: `${BASE_URL}/${indexHref}` },
        { '@type': 'ListItem', position: 2, name: copy.breadcrumbCurrent, item: canonicalUrl },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      // numberOfItems must match the number of `itemListElement` entries
      // we actually emit (one per top-level page section), not the document
      // total — otherwise structured-data validators flag the mismatch.
      numberOfItems: 4,
      name: copy.title,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: copy.methodologiesHeading,
          item: `${canonicalUrl}#pi-methodologies`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: copy.templatesHeading,
          item: `${canonicalUrl}#pi-templates`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: copy.referenceHeading,
          item: `${canonicalUrl}#pi-reference`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: copy.dailyHeading,
          item: `${canonicalUrl}#pi-daily`,
        },
      ],
    },
  };
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Language" content="${lang}">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="keywords" content="${escapeHTML(copy.seoKeywords)}">
  <meta name="author" content="Hack23 AB">
  <meta name="publisher" content="Hack23 AB">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(copy.title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  <meta property="og:image" content="https://hack23.github.io/euparliamentmonitor/images/og-image.jpg">
  <meta property="og:image:alt" content="${escapeHTML(copy.title)} — EU Parliament Monitor">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(copy.title)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">
  <meta name="twitter:image" content="https://hack23.github.io/euparliamentmonitor/images/og-image.jpg">
  <meta name="twitter:image:alt" content="${escapeHTML(copy.title)} — EU Parliament Monitor">
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#003399">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${jsonLdString}</script>
</head>
<body>
  <a href="#main" class="skip-link">${escapeHTML(skipLinkText)}</a>

  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="${indexHref}" class="site-header__brand" aria-label="${escapeHTML(siteTitle)}">
        <picture class="site-header__logo-picture">
          <source srcset="images/favicon-96x96.webp" type="image/webp">
          <img class="site-header__logo" src="images/favicon-96x96.png" alt="" width="36" height="36" aria-hidden="true">
        </picture>
        <span>
          <span class="site-header__title">${escapeHTML(siteTitle)}</span>
          <span class="site-header__subtitle">${headerSubtitle}</span>
        </span>
      </a>
      ${createThemeToggleButton(themeToggleLabel)}
    </div>
  </header>

  <nav class="language-switcher" role="navigation" aria-label="Language selection">
    ${langSwitcher}
  </nav>

  <main id="main" class="site-main">
    <section class="sitemap-hero pi-hero" aria-labelledby="pi-heading">
      <h1 id="pi-heading">🧭 ${escapeHTML(copy.title)}</h1>
      <p class="sitemap-hero__subtitle">${escapeHTML(copy.heroSubtitle)}</p>
      <p class="sitemap-hero__intro">${escapeHTML(copy.intro)}</p>
      <dl class="sitemap-stats" aria-label="${escapeHTML(copy.title)}">
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statMethodologiesLabel)}</dt>
          <dd>${data.methodologies.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statTemplatesLabel)}</dt>
          <dd>${data.templates.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statReferenceLabel)}</dt>
          <dd>${data.referenceDocs.length}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statRunsLabel)}</dt>
          <dd>${totalRuns}</dd>
        </div>
        <div class="sitemap-stats__item">
          <dt>${escapeHTML(copy.statArtifactsLabel)}</dt>
          <dd>${totalArtifacts}</dd>
        </div>
      </dl>
    </section>

    <nav class="breadcrumb" aria-label="${escapeHTML(copy.breadcrumbLabel)}">
      <ol>
        <li><a href="${indexHref}">${escapeHTML(copy.home)}</a></li>
        <li><a href="${sitemapHref}">${escapeHTML(getLocalizedString(FOOTER_SITEMAP_LABELS, lang))}</a></li>
        <li aria-current="page">${escapeHTML(copy.breadcrumbCurrent)}</li>
      </ol>
    </nav>
${sourceNote}
    <section class="sitemap-section pi-section" aria-labelledby="pi-methodologies">
      <h2 id="pi-methodologies"><span aria-hidden="true">🧭</span> ${escapeHTML(copy.methodologiesHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.methodologiesDescription)}</p>
      <ul class="pi-card-grid">
${methodologiesList}
      </ul>
    </section>

    <section class="sitemap-section pi-section" aria-labelledby="pi-templates">
      <h2 id="pi-templates"><span aria-hidden="true">📋</span> ${escapeHTML(copy.templatesHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.templatesDescription)}</p>
      <ul class="pi-card-grid">
${templatesList}
      </ul>
    </section>

    <section class="sitemap-section pi-section" aria-labelledby="pi-reference">
      <h2 id="pi-reference"><span aria-hidden="true">📚</span> ${escapeHTML(copy.referenceHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.referenceDescription)}</p>
      <ul class="pi-card-grid">
${referenceList}
      </ul>
    </section>

    <section class="sitemap-section pi-section" aria-labelledby="pi-daily">
      <h2 id="pi-daily"><span aria-hidden="true">📅</span> ${escapeHTML(copy.dailyHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.dailyDescription)}</p>
${dailyBody}
    </section>
  </main>

  ${buildSiteFooter({ lang: lang as LanguageCode, pathPrefix: '' })}${THEME_TOGGLE_SCRIPT}
</body>
</html>`;
}
