// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/DeepAnalysis
 * @description Deep-analysis article strings and quality labels (14 languages).
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap } from '../../types/index.js';
import { DEEP_ANALYSIS_STRINGS } from './deep-analysis/index.js';

export { DEEP_ANALYSIS_STRINGS };

/** Analysis quality labels for deep-analysis articles */
export const ANALYSIS_QUALITY_LABELS: LanguageMap<{
  readonly dataCompleteness: string;
  readonly sourceReliability: string;
  readonly analyticalDepth: string;
  readonly timeliness: string;
  readonly high: string;
  readonly medium: string;
  readonly low: string;
}> = {
  en: {
    dataCompleteness: 'Data Completeness',
    sourceReliability: 'Source Reliability',
    analyticalDepth: 'Analytical Depth',
    timeliness: 'Timeliness',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  sv: {
    dataCompleteness: 'Datatäckning',
    sourceReliability: 'Källtillförlitlighet',
    analyticalDepth: 'Analysdjup',
    timeliness: 'Aktualitet',
    high: 'Hög',
    medium: 'Medel',
    low: 'Låg',
  },
  da: {
    dataCompleteness: 'Datadækning',
    sourceReliability: 'Kildepålidelighed',
    analyticalDepth: 'Analysedybde',
    timeliness: 'Aktualitet',
    high: 'Høj',
    medium: 'Middel',
    low: 'Lav',
  },
  no: {
    dataCompleteness: 'Datadekning',
    sourceReliability: 'Kildepålitelighet',
    analyticalDepth: 'Analysedybde',
    timeliness: 'Aktualitet',
    high: 'Høy',
    medium: 'Middels',
    low: 'Lav',
  },
  fi: {
    dataCompleteness: 'Datan Kattavuus',
    sourceReliability: 'Lähteen Luotettavuus',
    analyticalDepth: 'Analyysin Syvyys',
    timeliness: 'Ajankohtaisuus',
    high: 'Korkea',
    medium: 'Keskitaso',
    low: 'Matala',
  },
  de: {
    dataCompleteness: 'Datenvollständigkeit',
    sourceReliability: 'Quellenzuverlässigkeit',
    analyticalDepth: 'Analysetiefe',
    timeliness: 'Aktualität',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
  },
  fr: {
    dataCompleteness: 'Complétude des Données',
    sourceReliability: 'Fiabilité des Sources',
    analyticalDepth: "Profondeur d'Analyse",
    timeliness: 'Actualité',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  },
  es: {
    dataCompleteness: 'Completitud de Datos',
    sourceReliability: 'Fiabilidad de Fuentes',
    analyticalDepth: 'Profundidad Analítica',
    timeliness: 'Actualidad',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  },
  nl: {
    dataCompleteness: 'Datavolledigheid',
    sourceReliability: 'Bronbetrouwbaarheid',
    analyticalDepth: 'Analysediepte',
    timeliness: 'Actualiteit',
    high: 'Hoog',
    medium: 'Gemiddeld',
    low: 'Laag',
  },
  ar: {
    dataCompleteness: 'اكتمال البيانات',
    sourceReliability: 'موثوقية المصدر',
    analyticalDepth: 'عمق التحليل',
    timeliness: 'حداثة البيانات',
    high: 'مرتفع',
    medium: 'متوسط',
    low: 'منخفض',
  },
  he: {
    dataCompleteness: 'שלמות נתונים',
    sourceReliability: 'אמינות מקור',
    analyticalDepth: 'עומק אנליטי',
    timeliness: 'עדכניות',
    high: 'גבוה',
    medium: 'בינוני',
    low: 'נמוך',
  },
  ja: {
    dataCompleteness: 'データ完全性',
    sourceReliability: '出典の信頼性',
    analyticalDepth: '分析の深度',
    timeliness: '適時性',
    high: '高',
    medium: '中',
    low: '低',
  },
  ko: {
    dataCompleteness: '데이터 완전성',
    sourceReliability: '출처 신뢰도',
    analyticalDepth: '분석 깊이',
    timeliness: '적시성',
    high: '높음',
    medium: '보통',
    low: '낮음',
  },
  zh: {
    dataCompleteness: '数据完整性',
    sourceReliability: '来源可靠性',
    analyticalDepth: '分析深度',
    timeliness: '时效性',
    high: '高',
    medium: '中',
    low: '低',
  },
};

// ─── Analysis Insights heading ───────────────────────────────────────────────

/**
 * Localized heading for the analysis pipeline insights section.
 */
export const ANALYSIS_INSIGHTS_HEADING: LanguageMap = {
  en: 'Analysis Pipeline Insights',
  sv: 'Insikter från analyspipeline',
  da: 'Indsigter fra analysepipeline',
  no: 'Innsikter fra analysepipeline',
  fi: 'Analyysiputken tulokset',
  de: 'Erkenntnisse der Analysepipeline',
  fr: 'Résultats du pipeline d\u2019analyse',
  es: 'Resultados del pipeline de análisis',
  nl: 'Inzichten uit de analysepipeline',
  ar: '\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u062E\u0637 \u0627\u0644\u062A\u062D\u0644\u064A\u0644',
  he: '\u05EA\u05D5\u05D1\u05E0\u05D5\u05EA \u05DE\u05DF \u05E6\u05D9\u05E0\u05D5\u05E8 \u05D4\u05E0\u05D9\u05EA\u05D5\u05D7',
  ja: '\u5206\u6790\u30D1\u30A4\u30D7\u30E9\u30A4\u30F3\u306E\u6D1E\u5BDF',
  ko: '\uBD84\uC11D \uD30C\uC774\uD504\uB77C\uC778 \uC778\uC0AC\uC774\uD2B8',
  zh: '\u5206\u6790\u7BA1\u9053\u6D1E\u5BDF',
};
