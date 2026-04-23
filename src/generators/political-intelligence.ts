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
}

/** Input payload used by {@link generatePoliticalIntelligenceHTML} */
export interface PIPageData {
  /** Methodology files from `analysis/methodologies/` */
  methodologies: PIDocument[];
  /** Template files from `analysis/templates/` */
  templates: PIDocument[];
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

/** Lines that the first-paragraph scanner should skip outright. */
const SKIP_LINE_PATTERNS: readonly RegExp[] = [
  /^#/, // ATX heading
  /^(>|\|)/, // blockquote or table
  /^(-|\*|\d+\.)\s/, // list item
  /^```/, // code fence
  /^<!/, // stray HTML comment / DOCTYPE-style line
];

/**
 * Decide whether the given line should be skipped when collecting a paragraph.
 *
 * @param trimmed - The trimmed line content
 * @returns `true` if the line is a heading / list / code-fence / comment
 */
function shouldSkipParagraphLine(trimmed: string): boolean {
  return SKIP_LINE_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * State tracker for multi-line HTML/SPDX comment blocks. Encapsulating the
 * "in-comment?" toggle keeps {@link extractFirstParagraph} flat enough to
 * satisfy the cognitive-complexity lint rule.
 */
class CommentTracker {
  private inComment = false;

  /**
   * Feed one trimmed line to the tracker and report whether the line should
   * be skipped (i.e. it's either inside a comment or is a comment delimiter).
   *
   * @param trimmed - Trimmed line content
   * @returns `true` if the line should be skipped entirely
   */
  consume(trimmed: string): boolean {
    if (this.inComment) {
      if (/-->/.test(trimmed)) this.inComment = false;
      return true;
    }
    if (/^<!--/.test(trimmed)) {
      if (!/-->/.test(trimmed)) this.inComment = true;
      return true;
    }
    return false;
  }
}

/**
 * Extract the first non-heading, non-list paragraph from a Markdown file,
 * skipping SPDX/HTML comment blocks.
 *
 * @param lines - Markdown source split on newlines
 * @returns Raw paragraph text, not yet truncated or cleaned
 */
function extractFirstParagraph(lines: string[]): string {
  const paragraph: string[] = [];
  const comments = new CommentTracker();
  for (const line of lines) {
    const trimmed = line.trim();
    if (comments.consume(trimmed)) continue;
    if (!trimmed) {
      if (paragraph.length > 0) break;
      continue;
    }
    if (shouldSkipParagraphLine(trimmed)) continue;
    paragraph.push(trimmed);
    if (paragraph.join(' ').length > 240) break;
  }
  return paragraph.join(' ');
}

/**
 * Clean up markdown inline syntax (links, code, bold/italic), collapse
 * whitespace, and truncate to ~240 characters on a word boundary.
 *
 * @param raw - Raw paragraph text
 * @returns Cleaned and length-capped description
 */
function cleanAndTruncate(raw: string): string {
  let text = raw.replace(/\s+/g, ' ').trim();
  if (text.length > 240) {
    text = text.slice(0, 237).replace(/\s+\S*$/, '') + '…';
  }
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  return text;
}

/**
 * Extract a title and short description from the top of a Markdown file.
 * Uses the first H1 (`# …`) line as title (falling back to a humanized stem)
 * and the first non-heading paragraph as the description. SPDX/HTML comments
 * at the top of the file are skipped.
 *
 * @param fullPath - Absolute path to a Markdown file
 * @param stem - Filename stem used as title fallback
 * @returns `{ title, description }` — never null; description may be empty
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
  const description = cleanAndTruncate(extractFirstParagraph(lines));
  return { title, description };
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
  const dailyGroups = collectDailyGroups(path.join(rootDir, 'analysis', 'daily'), rootDir);
  return { methodologies, templates, dailyGroups };
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
      const artifactCount = countMarkdownFiles(runDir);
      if (artifactCount === 0) continue;
      const relPath = path.relative(rootDir, runDir).split(path.sep).join('/');
      runs.push({
        slug,
        artifactCount,
        relPath,
        icon: pickRunIcon(slug),
      });
    }
    if (runs.length > 0) {
      groups.push({ date, runs });
    }
  }
  return groups;
}

/**
 * Count `.md` files recursively under `dir`, safely ignoring unreadable subtrees.
 *
 * @param dir - Absolute directory path
 * @returns Number of Markdown files found
 */
function countMarkdownFiles(dir: string): number {
  let count = 0;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countMarkdownFiles(full);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      count += 1;
    }
  }
  return count;
}

/**
 * Render a single document card (used for methodologies and templates).
 *
 * @param doc - The document to render
 * @param viewOnGitHub - Localized call-to-action label
 * @returns HTML string for the card `<li>` element
 */
function renderDocumentCard(doc: PIDocument, viewOnGitHub: string): string {
  const url = githubBlobUrl(doc.relPath);
  const desc = doc.description ? `<p class="pi-card__desc">${escapeHTML(doc.description)}</p>` : '';
  return `          <li class="pi-card">
            <a class="pi-card__link" href="${escapeHTML(url)}" rel="noopener external" target="_blank">
              <span class="pi-card__icon" aria-hidden="true">${doc.icon}</span>
              <span class="pi-card__body">
                <span class="pi-card__title">${escapeHTML(doc.title)}</span>
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
 * @param group - The date group to render
 * @param copy - Localized copy for labels inside the group
 * @returns HTML string for the `<section>` containing all runs for the date
 */
function renderDailyGroup(group: PIDailyDateGroup, copy: PICopy): string {
  const runsCountText = copy.runsCountLabel.replace('{count}', String(group.runs.length));
  const runCards = group.runs
    .map((run) => {
      const url = githubTreeUrl(run.relPath);
      const countLabel = copy.artifactCountLabel.replace('{count}', String(run.artifactCount));
      return `            <li class="pi-run">
              <a class="pi-run__link" href="${escapeHTML(url)}" rel="noopener external" target="_blank">
                <span class="pi-run__icon" aria-hidden="true">${run.icon}</span>
                <span class="pi-run__body">
                  <span class="pi-run__slug">${escapeHTML(run.slug)}</span>
                  <span class="pi-run__meta">${escapeHTML(countLabel)}</span>
                </span>
                <span class="pi-run__cta" aria-hidden="true">↗</span>
              </a>
            </li>`;
    })
    .join('\n');
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
  const today = new Date().toISOString().slice(0, 10);
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

  const footerLangGrid = ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const href = code === 'en' ? 'index.html' : `index-${code}.html`;
    const active = code === lang ? ' class="active"' : '';
    return `<a href="${href}"${active} hreflang="${code}">${flag} ${escapeHTML(name)}</a>`;
  }).join('\n            ');

  // Methodologies & templates cards
  const methodologiesList = data.methodologies
    .map((d) => renderDocumentCard(d, copy.viewOnGitHub))
    .join('\n');
  const templatesList = data.templates
    .map((d) => renderDocumentCard(d, copy.viewOnGitHub))
    .join('\n');
  const dailyBody =
    data.dailyGroups.length === 0
      ? ''
      : data.dailyGroups.map((g) => renderDailyGroup(g, copy)).join('\n');

  // JSON-LD structured data (CollectionPage with BreadcrumbList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy.title,
    url: canonicalUrl,
    description: copy.intro,
    inLanguage: lang,
    isPartOf: {
      '@type': 'WebSite',
      name: 'EU Parliament Monitor',
      url: BASE_URL,
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
      numberOfItems: data.methodologies.length + data.templates.length,
      name: copy.title,
    },
  };
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="keywords" content="European Parliament, political intelligence, OSINT, SWOT, PESTLE, methodology, artifact templates, transparency, EU">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangLinks}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(copy.title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  <meta property="og:image" content="https://hack23.github.io/euparliamentmonitor/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(copy.title)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">
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
        <li><a href="${sitemapHref}">${escapeHTML(
          lang === 'en' ? 'Sitemap' : copy.breadcrumbCurrent === 'Site Map' ? 'Sitemap' : 'Sitemap'
        )}</a></li>
        <li aria-current="page">${escapeHTML(copy.breadcrumbCurrent)}</li>
      </ol>
    </nav>

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

    <section class="sitemap-section pi-section" aria-labelledby="pi-daily">
      <h2 id="pi-daily"><span aria-hidden="true">📅</span> ${escapeHTML(copy.dailyHeading)}</h2>
      <p class="section-description">${escapeHTML(copy.dailyDescription)}</p>
${dailyBody}
    </section>
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About EU Parliament Monitor</h3>
        <p>European Parliament Intelligence Platform — monitoring political activity with systematic transparency. Powered by European Parliament open data.</p>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="${indexHref}">${escapeHTML(copy.home)}</a></li>
          <li><a href="${sitemapHref}">Sitemap</a></li>
          <li><a href="rss.xml">RSS Feed</a></li>
          <li><a href="sitemap.xml">XML Sitemap</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor">GitHub Repository</a></li>
          <li><a href="https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE">Apache-2.0 License</a></li>
          <li><a href="https://www.europarl.europa.eu/">European Parliament</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Built by Hack23 AB</h3>
        <ul>
          <li><a href="https://hack23.com">hack23.com</a></li>
          <li><a href="https://www.linkedin.com/company/hack23">LinkedIn</a></li>
          <li><a href="https://github.com/Hack23/ISMS-PUBLIC">Security &amp; Privacy Policy</a></li>
          <li><a href="mailto:james@hack23.com">Contact</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Languages</h3>
        <div class="language-grid">
          ${footerLangGrid}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2008-${new Date().getFullYear()} <a href="https://hack23.com">Hack23 AB</a> (Org.nr 5595347807) | Gothenburg, Sweden</p>
      <p><time datetime="${today}">${today}</time></p>
    </div>
  </footer>${THEME_TOGGLE_SCRIPT}
</body>
</html>`;
}
