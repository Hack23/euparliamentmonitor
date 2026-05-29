// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI/ProgressiveDisclosure
 * @description Localized chrome for the article progressive-disclosure
 * surface — the three reading layers (quick / full analysis / complete
 * intelligence), the visible `<summary>` expand CTAs, the reading-time
 * estimate line, and the Table-of-Contents layer badge.
 *
 * A single `PROGRESSIVE_DISCLOSURE_LABELS` map is shared by every call
 * site (the layer wrappers in `aggregator/progressive-disclosure.ts`, the
 * reading-time line in `aggregator/html/shell.ts`, and the TOC badge in
 * `aggregator/html/toc.ts`) so the layer vocabulary stays consistent and
 * each phrase is translated exactly once.
 */

import type { LanguageMap } from '../../types/index.js';

/** Per-language UI strings for the article progressive-disclosure chrome. */
export interface ProgressiveDisclosureStrings {
  /** Name of the always-visible quick-read layer (reading-time + aria). */
  readonly quickRead: string;
  /** Name of the cumulative full-analysis layer (reading-time + aria). */
  readonly fullAnalysis: string;
  /** Name of the cumulative complete-intelligence layer (reading-time + aria). */
  readonly completeIntelligence: string;
  /** Visible CTA on the analysis `<summary>` toggle (a `↓` glyph is appended in markup). */
  readonly expandAnalysis: string;
  /** Visible CTA on the intelligence `<summary>` toggle (a `↓` glyph is appended in markup). */
  readonly expandIntelligence: string;
  /** Abbreviation for minutes used in the reading-time line. */
  readonly minutesAbbr: string;
  /** Aria-label for the reading-time estimate paragraph. */
  readonly readingTimeAria: string;
  /** Aria-label prefix for the TOC layer badge (rendered as e.g. "Layer L1"). */
  readonly layerBadge: string;
}

/**
 * Localised progressive-disclosure strings across all 14 supported
 * languages. Reused by the layer wrappers, the reading-time line, and the
 * TOC layer badge so the layer vocabulary is translated only once.
 */
export const PROGRESSIVE_DISCLOSURE_LABELS: LanguageMap<ProgressiveDisclosureStrings> = {
  en: {
    quickRead: 'Quick read',
    fullAnalysis: 'Full analysis',
    completeIntelligence: 'Complete intelligence',
    expandAnalysis: 'Read full analysis',
    expandIntelligence: 'Open complete intelligence',
    minutesAbbr: 'min',
    readingTimeAria: 'Estimated reading time',
    layerBadge: 'Layer',
  },
  sv: {
    quickRead: 'Snabbläsning',
    fullAnalysis: 'Fullständig analys',
    completeIntelligence: 'Komplett underrättelse',
    expandAnalysis: 'Läs fullständig analys',
    expandIntelligence: 'Öppna komplett underrättelse',
    minutesAbbr: 'min',
    readingTimeAria: 'Uppskattad lästid',
    layerBadge: 'Nivå',
  },
  da: {
    quickRead: 'Hurtig læsning',
    fullAnalysis: 'Fuld analyse',
    completeIntelligence: 'Komplet efterretning',
    expandAnalysis: 'Læs fuld analyse',
    expandIntelligence: 'Åbn komplet efterretning',
    minutesAbbr: 'min',
    readingTimeAria: 'Anslået læsetid',
    layerBadge: 'Niveau',
  },
  no: {
    quickRead: 'Hurtiglesing',
    fullAnalysis: 'Full analyse',
    completeIntelligence: 'Komplett etterretning',
    expandAnalysis: 'Les full analyse',
    expandIntelligence: 'Åpne komplett etterretning',
    minutesAbbr: 'min',
    readingTimeAria: 'Anslått lesetid',
    layerBadge: 'Nivå',
  },
  fi: {
    quickRead: 'Pikaluku',
    fullAnalysis: 'Täysi analyysi',
    completeIntelligence: 'Täydellinen tiedustelu',
    expandAnalysis: 'Lue täysi analyysi',
    expandIntelligence: 'Avaa täydellinen tiedustelu',
    minutesAbbr: 'min',
    readingTimeAria: 'Arvioitu lukuaika',
    layerBadge: 'Taso',
  },
  de: {
    quickRead: 'Schnelllektüre',
    fullAnalysis: 'Vollständige Analyse',
    completeIntelligence: 'Vollständige Aufklärung',
    expandAnalysis: 'Vollständige Analyse lesen',
    expandIntelligence: 'Vollständige Aufklärung öffnen',
    minutesAbbr: 'Min.',
    readingTimeAria: 'Geschätzte Lesezeit',
    layerBadge: 'Ebene',
  },
  fr: {
    quickRead: 'Lecture rapide',
    fullAnalysis: 'Analyse complète',
    completeIntelligence: 'Renseignement complet',
    expandAnalysis: "Lire l'analyse complète",
    expandIntelligence: 'Ouvrir le renseignement complet',
    minutesAbbr: 'min',
    readingTimeAria: 'Temps de lecture estimé',
    layerBadge: 'Niveau',
  },
  es: {
    quickRead: 'Lectura rápida',
    fullAnalysis: 'Análisis completo',
    completeIntelligence: 'Inteligencia completa',
    expandAnalysis: 'Leer análisis completo',
    expandIntelligence: 'Abrir inteligencia completa',
    minutesAbbr: 'min',
    readingTimeAria: 'Tiempo de lectura estimado',
    layerBadge: 'Nivel',
  },
  nl: {
    quickRead: 'Snel lezen',
    fullAnalysis: 'Volledige analyse',
    completeIntelligence: 'Volledige inlichtingen',
    expandAnalysis: 'Lees volledige analyse',
    expandIntelligence: 'Volledige inlichtingen openen',
    minutesAbbr: 'min',
    readingTimeAria: 'Geschatte leestijd',
    layerBadge: 'Niveau',
  },
  ar: {
    quickRead: 'قراءة سريعة',
    fullAnalysis: 'تحليل كامل',
    completeIntelligence: 'استخبارات كاملة',
    expandAnalysis: 'اقرأ التحليل الكامل',
    expandIntelligence: 'افتح الاستخبارات الكاملة',
    minutesAbbr: 'دقيقة',
    readingTimeAria: 'وقت القراءة المقدر',
    layerBadge: 'المستوى',
  },
  he: {
    quickRead: 'קריאה מהירה',
    fullAnalysis: 'ניתוח מלא',
    completeIntelligence: 'מודיעין מלא',
    expandAnalysis: 'קראו את הניתוח המלא',
    expandIntelligence: 'פתחו מודיעין מלא',
    minutesAbbr: 'דק׳',
    readingTimeAria: 'זמן קריאה משוער',
    layerBadge: 'שכבה',
  },
  ja: {
    quickRead: 'クイックリード',
    fullAnalysis: '完全な分析',
    completeIntelligence: '完全なインテリジェンス',
    expandAnalysis: '完全な分析を読む',
    expandIntelligence: '完全なインテリジェンスを開く',
    minutesAbbr: '分',
    readingTimeAria: '推定読了時間',
    layerBadge: 'レイヤー',
  },
  ko: {
    quickRead: '빠른 읽기',
    fullAnalysis: '전체 분석',
    completeIntelligence: '완전한 인텔리전스',
    expandAnalysis: '전체 분석 읽기',
    expandIntelligence: '완전한 인텔리전스 열기',
    minutesAbbr: '분',
    readingTimeAria: '예상 읽기 시간',
    layerBadge: '레이어',
  },
  zh: {
    quickRead: '快速阅读',
    fullAnalysis: '完整分析',
    completeIntelligence: '完整情报',
    expandAnalysis: '阅读完整分析',
    expandIntelligence: '打开完整情报',
    minutesAbbr: '分钟',
    readingTimeAria: '预计阅读时间',
    layerBadge: '层级',
  },
};
