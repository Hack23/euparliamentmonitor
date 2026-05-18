// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/Editorial
 * @description Editorial article strings: 14-language body strings.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, EditorialStrings } from '../../types/index.js';
export const EDITORIAL_STRINGS: LanguageMap<EditorialStrings> = {
  en: {
    whyThisMatters: 'Why This Matters',
    keyTakeaway: 'Key Finding',
    parliamentaryContext: 'Parliamentary Context',
    sourceAttribution: 'According to European Parliament data',
    analysisNote: 'Analysis Note',
  },
  sv: {
    whyThisMatters: 'Varför Det Spelar Roll',
    keyTakeaway: 'Viktigaste Slutsats',
    parliamentaryContext: 'Parlamentarisk Kontext',
    sourceAttribution: 'Enligt Europaparlamentets uppgifter',
    analysisNote: 'Analysnot',
  },
  da: {
    whyThisMatters: 'Hvorfor Det Betyder Noget',
    keyTakeaway: 'Vigtigste Konklusion',
    parliamentaryContext: 'Parlamentarisk Kontekst',
    sourceAttribution: 'Ifølge Europa-Parlamentets data',
    analysisNote: 'Analysenotat',
  },
  no: {
    whyThisMatters: 'Hvorfor Det Betyr Noe',
    keyTakeaway: 'Viktigste Funn',
    parliamentaryContext: 'Parlamentarisk Kontekst',
    sourceAttribution: 'Ifølge Europaparlamentets data',
    analysisNote: 'Analysenotat',
  },
  fi: {
    whyThisMatters: 'Miksi Tällä On Merkitystä',
    keyTakeaway: 'Tärkein Havainto',
    parliamentaryContext: 'Parlamentaarinen Konteksti',
    sourceAttribution: 'Euroopan parlamentin tietojen mukaan',
    analysisNote: 'Analyysimerkintä',
  },
  de: {
    whyThisMatters: 'Warum Das Wichtig Ist',
    keyTakeaway: 'Wichtigste Erkenntnis',
    parliamentaryContext: 'Parlamentarischer Kontext',
    sourceAttribution: 'Laut Daten des Europäischen Parlaments',
    analysisNote: 'Analysehinweis',
  },
  fr: {
    whyThisMatters: "Pourquoi C'est Important",
    keyTakeaway: 'Constat Clé',
    parliamentaryContext: 'Contexte Parlementaire',
    sourceAttribution: 'Selon les données du Parlement européen',
    analysisNote: "Note d'analyse",
  },
  es: {
    whyThisMatters: 'Por Qué Importa',
    keyTakeaway: 'Hallazgo Clave',
    parliamentaryContext: 'Contexto Parlamentario',
    sourceAttribution: 'Según datos del Parlamento Europeo',
    analysisNote: 'Nota de Análisis',
  },
  nl: {
    whyThisMatters: 'Waarom Dit Belangrijk Is',
    keyTakeaway: 'Belangrijkste Bevinding',
    parliamentaryContext: 'Parlementaire Context',
    sourceAttribution: 'Volgens gegevens van het Europees Parlement',
    analysisNote: 'Analysenoot',
  },
  ar: {
    whyThisMatters: 'لماذا هذا مهم',
    keyTakeaway: 'الاستنتاج الرئيسي',
    parliamentaryContext: 'السياق البرلماني',
    sourceAttribution: 'وفقاً لبيانات البرلمان الأوروبي',
    analysisNote: 'ملاحظة تحليلية',
  },
  he: {
    whyThisMatters: 'מדוע זה חשוב',
    keyTakeaway: 'ממצא מרכזי',
    parliamentaryContext: 'הקשר פרלמנטרי',
    sourceAttribution: 'לפי נתוני הפרלמנט האירופי',
    analysisNote: 'הערת ניתוח',
  },
  ja: {
    whyThisMatters: 'なぜ重要か',
    keyTakeaway: '主要な発見',
    parliamentaryContext: '議会の背景',
    sourceAttribution: '欧州議会データによると',
    analysisNote: '分析メモ',
  },
  ko: {
    whyThisMatters: '왜 중요한가',
    keyTakeaway: '핵심 발견',
    parliamentaryContext: '의회 맥락',
    sourceAttribution: '유럽 의회 데이터에 따르면',
    analysisNote: '분석 메모',
  },
  zh: {
    whyThisMatters: '为何重要',
    keyTakeaway: '关键发现',
    parliamentaryContext: '议会背景',
    sourceAttribution: '根据欧洲议会数据',
    analysisNote: '分析说明',
  },
};

/** Localized strings for deep political analysis section (5W + Impact framework) */
