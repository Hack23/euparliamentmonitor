// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/MethodologyFrameworkLabels
 * @description Localized labels for the analytical framework explanation blocks (transparency, summary, methodology, SWOT framework, risk methodology, threat framework, classification, style guide) shown alongside deep-analysis articles.
 */

import type { LanguageMap } from '../../types/index.js';
import { HE_DEEP_ANALYSIS } from './article-category-labels.js';
export const ANALYSIS_TRANSPARENCY_LABELS: LanguageMap = {
  en: 'Analysis & Transparency',
  sv: 'Analys & transparens',
  da: 'Analyse & gennemsigtighed',
  no: 'Analyse & åpenhet',
  fi: 'Analyysi & avoimuus',
  de: 'Analyse & Transparenz',
  fr: 'Analyse & transparence',
  es: 'Análisis y transparencia',
  nl: 'Analyse & transparantie',
  ar: 'التحليل والشفافية',
  he: 'ניתוח ושקיפות',
  ja: '分析と透明性',
  ko: '분석 및 투명성',
  zh: '分析与透明度',
};

/** Labels for analysis summary link */
export const ANALYSIS_SUMMARY_LABELS: LanguageMap = {
  en: 'Analysis Summary',
  sv: 'Analyssammanfattning',
  da: 'Analyseoversigt',
  no: 'Analyseoppsummering',
  fi: 'Analyysiyhteenveto',
  de: 'Analyseübersicht',
  fr: "Résumé de l'analyse",
  es: 'Resumen del análisis',
  nl: 'Analyseoverzicht',
  ar: 'ملخص التحليل',
  he: 'סיכום ניתוח',
  ja: '分析概要',
  ko: '분석 요약',
  zh: '分析摘要',
};

/** Labels for methodology link */
export const METHODOLOGY_LABELS: LanguageMap = {
  en: 'Methodology',
  sv: 'Metodik',
  da: 'Metodik',
  no: 'Metodikk',
  fi: 'Menetelmä',
  de: 'Methodik',
  fr: 'Méthodologie',
  es: 'Metodología',
  nl: 'Methodologie',
  ar: 'المنهجية',
  he: 'מתודולוגיה',
  ja: '方法論',
  ko: '방법론',
  zh: '方法论',
};

/** Localized transparency disclosure text */
export const TRANSPARENCY_DISCLOSURE_LABELS: LanguageMap = {
  en: 'This article was generated using AI-driven political intelligence analysis. All analytical content is produced by AI following structured methodologies, while scripts handle only data formatting and HTML rendering.',
  sv: 'Denna artikel genererades med AI-driven politisk underrättelseanalys. Allt analytiskt innehåll produceras av AI enligt strukturerade metoder, medan skript bara hanterar dataformatering och HTML-rendering.',
  da: 'Denne artikel blev genereret ved hjælp af AI-drevet politisk efterretningsanalyse. Alt analytisk indhold produceres af AI efter strukturerede metoder, mens scripts kun håndterer dataformatering og HTML-rendering.',
  no: 'Denne artikkelen ble generert ved hjelp av AI-drevet politisk etterretningsanalyse. Alt analytisk innhold produseres av AI etter strukturerte metoder, mens skript bare håndterer dataformatering og HTML-rendering.',
  fi: 'Tämä artikkeli luotiin tekoälypohjaisella poliittisella tiedusteluanalyysillä. Kaikki analyyttinen sisältö tuotetaan tekoälyllä strukturoituja menetelmiä noudattaen, kun taas skriptit hoitavat vain datan muotoilun ja HTML-renderöinnin.',
  de: 'Dieser Artikel wurde mithilfe KI-gestützter politischer Geheimdienstanalyse erstellt. Alle analytischen Inhalte werden von KI nach strukturierten Methoden erstellt, während Skripte nur die Datenformatierung und HTML-Darstellung übernehmen.',
  fr: "Cet article a été généré à l'aide d'une analyse de renseignement politique pilotée par l'IA. Tout le contenu analytique est produit par l'IA selon des méthodologies structurées, tandis que les scripts ne gèrent que le formatage des données et le rendu HTML.",
  es: 'Este artículo fue generado utilizando análisis de inteligencia política impulsado por IA. Todo el contenido analítico es producido por IA siguiendo metodologías estructuradas, mientras que los scripts solo manejan el formateo de datos y la representación HTML.',
  nl: 'Dit artikel is gegenereerd met behulp van AI-gestuurde politieke inlichtingenanalyse. Alle analytische inhoud wordt geproduceerd door AI volgens gestructureerde methodologieën, terwijl scripts alleen gegevensopmaak en HTML-weergave afhandelen.',
  ar: 'تم إنشاء هذه المقالة باستخدام تحليل استخباراتي سياسي مدعوم بالذكاء الاصطناعي. يتم إنتاج جميع المحتويات التحليلية بواسطة الذكاء الاصطناعي وفقاً لمنهجيات منظمة، بينما تتولى البرامج النصية فقط تنسيق البيانات وعرض HTML.',
  he: 'מאמר זה נוצר באמצעות ניתוח מודיעין פוליטי מונע בינה מלאכותית. כל התוכן האנליטי מיוצר על ידי בינה מלאכותית בהתאם למתודולוגיות מובנות, בעוד שסקריפטים מטפלים רק בעיצוב נתונים ורינדור HTML.',
  ja: 'この記事はAI駆動の政治インテリジェンス分析を使用して生成されました。すべての分析コンテンツは構造化された方法論に従ってAIによって作成され、スクリプトはデータフォーマットとHTMLレンダリングのみを処理します。',
  ko: '이 기사는 AI 기반 정치 인텔리전스 분석을 사용하여 생성되었습니다. 모든 분석 콘텐츠는 구조화된 방법론에 따라 AI가 생산하며, 스크립트는 데이터 포맷팅과 HTML 렌더링만 처리합니다.',
  zh: '本文使用人工智能驱动的政治情报分析生成。所有分析内容均由人工智能按照结构化方法论产生，而脚本仅处理数据格式化和HTML渲染。',
};

/** Localized classification analysis labels */
export const CLASSIFICATION_ANALYSIS_LABELS: LanguageMap = {
  en: 'Classification Analysis',
  sv: 'Klassificeringsanalys',
  da: 'Klassifikationsanalyse',
  no: 'Klassifiseringsanalyse',
  fi: 'Luokitteluanalyysi',
  de: 'Klassifizierungsanalyse',
  fr: 'Analyse de classification',
  es: 'Análisis de clasificación',
  nl: 'Classificatieanalyse',
  ar: 'تحليل التصنيف',
  he: 'ניתוח סיווג',
  ja: '分類分析',
  ko: '분류 분석',
  zh: '分类分析',
};

/** Localized threat assessment labels */
export const THREAT_ASSESSMENT_LABELS: LanguageMap = {
  en: 'Threat Assessment',
  sv: 'Hotbedömning',
  da: 'Trusselsvurdering',
  no: 'Trusselvurdering',
  fi: 'Uhka-arviointi',
  de: 'Bedrohungsbewertung',
  fr: 'Évaluation des menaces',
  es: 'Evaluación de amenazas',
  nl: 'Dreigingsbeoordeling',
  ar: 'تقييم التهديدات',
  he: 'הערכת איומים',
  ja: '脅威評価',
  ko: '위협 평가',
  zh: '威胁评估',
};

/** Localized risk scoring labels */
export const RISK_SCORING_LABELS: LanguageMap = {
  en: 'Risk Scoring',
  sv: 'Riskbedömning',
  da: 'Risikovurdering',
  no: 'Risikovurdering',
  fi: 'Riskinarviointi',
  de: 'Risikobewertung',
  fr: 'Évaluation des risques',
  es: 'Evaluación de riesgos',
  nl: 'Risicobeoordeling',
  ar: 'تقييم المخاطر',
  he: 'דירוג סיכונים',
  ja: 'リスク評価',
  ko: '위험 평가',
  zh: '风险评分',
};

/** Localized deep analysis labels */
export const DEEP_ANALYSIS_LABELS: LanguageMap = {
  en: 'Deep Analysis',
  sv: 'Djupanalys',
  da: 'Dybdeanalyse',
  no: 'Dybdeanalyse',
  fi: 'Syväanalyysi',
  de: 'Tiefenanalyse',
  fr: 'Analyse approfondie',
  es: 'Análisis profundo',
  nl: 'Diepgaande analyse',
  ar: 'التحليل المعمق',
  he: HE_DEEP_ANALYSIS,
  ja: '深層分析',
  ko: '심층 분석',
  zh: '深度分析',
};

/** Localized "AI-Driven Analysis Guide" labels */
export const AI_ANALYSIS_GUIDE_LABELS: LanguageMap = {
  en: 'AI-Driven Analysis Guide',
  sv: 'AI-driven analysguide',
  da: 'AI-drevet analyseguide',
  no: 'AI-drevet analyseguide',
  fi: 'Tekoälypohjainen analyysiohje',
  de: 'KI-gestützte Analyseanleitung',
  fr: "Guide d'analyse piloté par l'IA",
  es: 'Guía de análisis impulsada por IA',
  nl: 'AI-gestuurde analysegids',
  ar: 'دليل التحليل المدعوم بالذكاء الاصطناعي',
  he: 'מדריך ניתוח מונע בינה מלאכותית',
  ja: 'AI駆動分析ガイド',
  ko: 'AI 기반 분석 가이드',
  zh: 'AI驱动分析指南',
};

/** Localized SWOT framework labels */
export const SWOT_FRAMEWORK_LABELS: LanguageMap = {
  en: 'Political SWOT Framework',
  sv: 'Politiskt SWOT-ramverk',
  da: 'Politisk SWOT-ramme',
  no: 'Politisk SWOT-rammeverk',
  fi: 'Poliittinen SWOT-kehys',
  de: 'Politisches SWOT-Framework',
  fr: 'Cadre SWOT politique',
  es: 'Marco SWOT político',
  nl: 'Politiek SWOT-raamwerk',
  ar: 'إطار SWOT السياسي',
  he: 'מסגרת SWOT פוליטית',
  ja: '政治SWOT分析フレームワーク',
  ko: '정치 SWOT 프레임워크',
  zh: '政治SWOT框架',
};

/** Localized risk methodology labels */
export const RISK_METHODOLOGY_LABELS: LanguageMap = {
  en: 'Political Risk Methodology',
  sv: 'Metodik för politisk risk',
  da: 'Politisk risikometodik',
  no: 'Politisk risikometodikk',
  fi: 'Poliittinen riskimenetelmä',
  de: 'Methodik politischer Risiken',
  fr: 'Méthodologie des risques politiques',
  es: 'Metodología de riesgo político',
  nl: 'Methodologie politieke risico',
  ar: 'منهجية المخاطر السياسية',
  he: 'מתודולוגיית סיכונים פוליטיים',
  ja: '政治リスク方法論',
  ko: '정치 리스크 방법론',
  zh: '政治风险方法论',
};

/** Localized threat framework labels */
export const THREAT_FRAMEWORK_LABELS: LanguageMap = {
  en: 'Political Threat Framework',
  sv: 'Politiskt hotramverk',
  da: 'Politisk trusselramme',
  no: 'Politisk trusselrammeverk',
  fi: 'Poliittinen uhkakehys',
  de: 'Politisches Bedrohungs-Framework',
  fr: 'Cadre des menaces politiques',
  es: 'Marco de amenazas políticas',
  nl: 'Politiek dreigingsraamwerk',
  ar: 'إطار التهديدات السياسية',
  he: 'מסגרת איומים פוליטיים',
  ja: '政治脅威フレームワーク',
  ko: '정치 위협 프레임워크',
  zh: '政治威胁框架',
};

/** Localized classification guide labels */
export const CLASSIFICATION_GUIDE_LABELS: LanguageMap = {
  en: 'Political Classification Guide',
  sv: 'Politisk klassificeringsguide',
  da: 'Politisk klassifikationsguide',
  no: 'Politisk klassifiseringsguide',
  fi: 'Poliittinen luokitteluopas',
  de: 'Politischer Klassifizierungsleitfaden',
  fr: 'Guide de classification politique',
  es: 'Guía de clasificación política',
  nl: 'Politieke classificatiegids',
  ar: 'دليل التصنيف السياسي',
  he: 'מדריך סיווג פוליטי',
  ja: '政治分類ガイド',
  ko: '정치 분류 가이드',
  zh: '政治分类指南',
};

/** Common Scandinavian translation for "Political Style Guide" (sv, da, no) */
const POLITISK_STILGUIDE = 'Politisk stilguide';

/** Localized style guide labels */
export const STYLE_GUIDE_LABELS: LanguageMap = {
  en: 'Political Style Guide',
  sv: POLITISK_STILGUIDE,
  da: POLITISK_STILGUIDE,
  no: POLITISK_STILGUIDE,
  fi: 'Poliittinen tyyliopas',
  de: 'Politischer Stilleitfaden',
  fr: 'Guide de style politique',
  es: 'Guía de estilo político',
  nl: 'Politieke stijlgids',
  ar: 'دليل الأسلوب السياسي',
  he: 'מדריך סגנון פוליטי',
  ja: '政治スタイルガイド',
  ko: '정치 스타일 가이드',
  zh: '政治风格指南',
};

// ─── Per-file analysis link labels ────────────────────────────────────────────

/** Localized "Significance Classification" labels */
export const SIGNIFICANCE_CLASSIFICATION_LABELS: LanguageMap = {
  en: 'Significance Classification',
  sv: 'Betydelseklassificering',
  da: 'Betydningsklassificering',
  no: 'Betydningsklassifisering',
  fi: 'Merkittävyysluokittelu',
  de: 'Bedeutsamkeitsklassifizierung',
  fr: 'Classification de la signification',
  es: 'Clasificación de significancia',
  nl: 'Significantieclassificatie',
  ar: 'تصنيف الأهمية',
  he: 'סיווג חשיבות',
  ja: '重要性分類',
  ko: '중요도 분류',
  zh: '重要性分类',
};

/** Localized "Actor Mapping" labels */
