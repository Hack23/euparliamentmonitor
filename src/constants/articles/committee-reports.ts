// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/CommitteeReports
 * @description Committee-reports article: 14-language title generator and committee analysis content strings.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, LangTitleSubtitle, CommitteeAnalysisContentStrings } from '../../types/index.js';
export const COMMITTEE_REPORTS_TITLES: LanguageMap<(committee: string) => LangTitleSubtitle> = {
  en: (committee) => ({
    title: `EU Parliament Committee Activity Report: ${committee}`,
    subtitle:
      'Analysis of recent legislative output, effectiveness metrics, and key committee activities',
  }),
  sv: (committee) => ({
    title: `Aktivitetsrapport för Europaparlamentets utskott: ${committee}`,
    subtitle:
      'Analys av nylig lagstiftningsproduktion, effektivitetsmätningar och viktigaste utskottsaktiviteter',
  }),
  da: (committee) => ({
    title: `Aktivitetsrapport for Europa-Parlamentets udvalg: ${committee}`,
    subtitle:
      'Analyse af den seneste lovgivningsproduktion, effektivitetsmålinger og vigtigste udvalgsaktiviteter',
  }),
  no: (committee) => ({
    title: `Aktivitetsrapport for Europaparlamentets komiteer: ${committee}`,
    subtitle:
      'Analyse av nylig lovgivningsproduksjon, effektivitetsmålinger og viktigste komitéaktiviteter',
  }),
  fi: (committee) => ({
    title: `Euroopan parlamentin valiokuntien toimintaraportti: ${committee}`,
    subtitle:
      'Analyysi viimeaikaisesta lainsäädäntötuotannosta, tehokkuusmittareista ja tärkeimmistä valiokuntatoiminnoista',
  }),
  de: (committee) => ({
    title: `EU-Parlament Ausschussbericht: ${committee}`,
    subtitle:
      'Analyse der Gesetzgebungsleistung, Effektivitätskennzahlen und wichtiger Ausschussaktivitäten',
  }),
  fr: (committee) => ({
    title: `Rapport d'activité des commissions du Parlement européen: ${committee}`,
    subtitle:
      "Analyse de la production législative récente, des indicateurs d'efficacité et des activités clés des commissions",
  }),
  es: (committee) => ({
    title: `Informe de actividad de comisiones del Parlamento Europeo: ${committee}`,
    subtitle:
      'Análisis de la producción legislativa reciente, métricas de efectividad y actividades clave de las comisiones',
  }),
  nl: (committee) => ({
    title: `Activiteitenrapport commissies Europees Parlement: ${committee}`,
    subtitle:
      'Analyse van recente wetgevingsoutput, effectiviteitsmetrieken en belangrijkste commissieactiviteiten',
  }),
  ar: (committee) => ({
    title: `تقرير نشاط لجان البرلمان الأوروبي: ${committee}`,
    subtitle: 'تحليل الإنتاج التشريعي الأخير ومقاييس الفعالية والأنشطة الرئيسية للجان',
  }),
  he: (committee) => ({
    title: `דוח פעילות ועדות הפרלמנט האירופי: ${committee}`,
    subtitle: 'ניתוח תפוקה חקיקתית אחרונה, מדדי אפקטיביות ופעילויות ועדה מרכזיות',
  }),
  ja: (committee) => ({
    title: `EU議会委員会活動報告: ${committee}`,
    subtitle: '最近の立法成果、有効性指標、主要な委員会活動の分析',
  }),
  ko: (committee) => ({
    title: `EU 의회 위원회 활동 보고서: ${committee}`,
    subtitle: '최근 입법 산출물, 효과성 지표 및 주요 위원회 활동 분석',
  }),
  zh: (committee) => ({
    title: `EU议会委员会活动报告: ${committee}`,
    subtitle: '最近立法成果、效能指标和关键委员会活动分析',
  }),
};

/** Propositions title templates per language */
import { COMMITTEE_ANALYSIS_CONTENT_STRINGS_EU } from './committee-reports-content-eu.js';
import { COMMITTEE_ANALYSIS_CONTENT_STRINGS_GLOBAL } from './committee-reports-content-global.js';

export const COMMITTEE_ANALYSIS_CONTENT_STRINGS: LanguageMap<CommitteeAnalysisContentStrings> = {
  ...COMMITTEE_ANALYSIS_CONTENT_STRINGS_EU,
  ...COMMITTEE_ANALYSIS_CONTENT_STRINGS_GLOBAL,
};
/**
 * Localized SWOT heading and label strings indexed by ISO 639-1 language code.
 *
 * Consumed by the SWOT builder in `src/aggregator/swot-builder.ts` to render
 * the four-quadrant analysis section in each of the 14 supported article
 * languages.
 */
