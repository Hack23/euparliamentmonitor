// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/MonthInReview
 * @description Month-In-Review article: 14-language title generator and body strings.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, LangTitleSubtitle } from '../../types/index.js';
export const MONTHLY_REVIEW_TITLES: LanguageMap<(month: string) => LangTitleSubtitle> = {
  en: (month) => ({
    title: `Month in Review: ${month}`,
    subtitle:
      'Comprehensive analysis of the European Parliament — legislative output, coalition dynamics, and policy trends',
  }),
  sv: (month) => ({
    title: `Månaden i Korthet: ${month}`,
    subtitle:
      'Övergripande analys av Europaparlamentet — lagstiftningsutfall, koalitionsdynamik och policytrender',
  }),
  da: (month) => ({
    title: `Måneden i Overblik: ${month}`,
    subtitle:
      'Omfattende analyse af Europa-Parlamentet — lovgivningsresultater, koalitionsdynamik og politiktendenser',
  }),
  no: (month) => ({
    title: `Måneden i Tilbakeblikk: ${month}`,
    subtitle:
      'Omfattende analyse av Europaparlamentet — lovgivningsresultater, koalisjonsdynamikk og politiske trender',
  }),
  fi: (month) => ({
    title: `Kuukauden Katsaus: ${month}`,
    subtitle:
      'Kattava analyysi Euroopan parlamentista — lainsäädäntötulokset, koalitiodynamiikka ja politiikkatrendit',
  }),
  de: (month) => ({
    title: `Monat im Rückblick: ${month}`,
    subtitle:
      'Umfassende Analyse des Europäischen Parlaments — Gesetzgebungsleistung, Koalitionsdynamik und Politiktrends',
  }),
  fr: (month) => ({
    title: `Mois en Revue: ${month}`,
    subtitle:
      'Analyse complète du Parlement européen — production législative, dynamiques de coalition et tendances politiques',
  }),
  es: (month) => ({
    title: `Mes en Revisión: ${month}`,
    subtitle:
      'Análisis integral del Parlamento Europeo — producción legislativa, dinámicas de coalición y tendencias políticas',
  }),
  nl: (month) => ({
    title: `Maand in Overzicht: ${month}`,
    subtitle:
      'Uitgebreide analyse van het Europees Parlement — wetgevingsproductie, coalitiedynamiek en beleidstrends',
  }),
  ar: (month) => ({
    title: `مراجعة الشهر: ${month}`,
    subtitle:
      'تحليل شامل للبرلمان الأوروبي — الإنتاج التشريعي وديناميات التحالفات واتجاهات السياسات',
  }),
  he: (month) => ({
    title: `סקירת החודש: ${month}`,
    subtitle: 'ניתוח מקיף של הפרלמנט האירופי — תפוקה חקיקתית, דינמיקת קואליציות ומגמות מדיניות',
  }),
  ja: (month) => ({
    title: `月間レビュー: ${month}`,
    subtitle: '欧州議会の包括的分析 — 立法成果、連立動態、政策トレンド',
  }),
  ko: (month) => ({
    title: `월간 리뷰: ${month}`,
    subtitle: '유럽 의회 종합 분석 — 입법 성과, 연합 역학 및 정책 동향',
  }),
  zh: (month) => ({
    title: `月度回顾: ${month}`,
    subtitle: '欧洲议会综合分析 — 立法成果、联盟动态和政策趋势',
  }),
};

/** Quarter ahead title templates per language. `quarter` is a label like "Q2 2026". */
export const MONTH_IN_REVIEW_STRINGS: LanguageMap<{
  readonly overview: string;
  readonly keyVotes: string;
  readonly legislativeProgress: string;
  readonly committeeHighlights: string;
  readonly politicalDynamics: string;
  readonly outlook: string;
}> = {
  en: {
    overview: 'Monthly Overview',
    keyVotes: 'Key Votes',
    legislativeProgress: 'Legislative Progress',
    committeeHighlights: 'Committee Highlights',
    politicalDynamics: 'Political Dynamics',
    outlook: 'Outlook',
  },
  sv: {
    overview: 'Månadens Översikt',
    keyVotes: 'Viktiga Omröstningar',
    legislativeProgress: 'Lagstiftningsframsteg',
    committeeHighlights: 'Utskottshöjdpunkter',
    politicalDynamics: 'Politisk Dynamik',
    outlook: 'Utsikter',
  },
  da: {
    overview: 'Månedsoversigt',
    keyVotes: 'Vigtige Afstemninger',
    legislativeProgress: 'Lovgivningsforløb',
    committeeHighlights: 'Udvalgshøjdepunkter',
    politicalDynamics: 'Politisk Dynamik',
    outlook: 'Udsigter',
  },
  no: {
    overview: 'Månedsoversikt',
    keyVotes: 'Viktige Avstemninger',
    legislativeProgress: 'Lovgivningsframgang',
    committeeHighlights: 'Komitéhøydepunkter',
    politicalDynamics: 'Politisk Dynamikk',
    outlook: 'Utsikter',
  },
  fi: {
    overview: 'Kuukausikatsaus',
    keyVotes: 'Tärkeät Äänestykset',
    legislativeProgress: 'Lainsäädännön Edistyminen',
    committeeHighlights: 'Valiokuntien Kohokohdat',
    politicalDynamics: 'Poliittinen Dynamiikka',
    outlook: 'Näkymät',
  },
  de: {
    overview: 'Monatsübersicht',
    keyVotes: 'Wichtige Abstimmungen',
    legislativeProgress: 'Gesetzgebungsfortschritte',
    committeeHighlights: 'Ausschusshöhepunkte',
    politicalDynamics: 'Politische Dynamik',
    outlook: 'Ausblick',
  },
  fr: {
    overview: 'Aperçu Mensuel',
    keyVotes: 'Votes Clés',
    legislativeProgress: 'Avancées Législatives',
    committeeHighlights: 'Points Forts des Commissions',
    politicalDynamics: 'Dynamiques Politiques',
    outlook: 'Perspectives',
  },
  es: {
    overview: 'Resumen Mensual',
    keyVotes: 'Votaciones Clave',
    legislativeProgress: 'Progreso Legislativo',
    committeeHighlights: 'Puntos Destacados de Comisiones',
    politicalDynamics: 'Dinámicas Políticas',
    outlook: 'Perspectivas',
  },
  nl: {
    overview: 'Maandoverzicht',
    keyVotes: 'Belangrijke Stemmingen',
    legislativeProgress: 'Wetgevingsvoortgang',
    committeeHighlights: 'Hoogtepunten Commissies',
    politicalDynamics: 'Politieke Dynamiek',
    outlook: 'Vooruitzichten',
  },
  ar: {
    overview: 'نظرة شهرية عامة',
    keyVotes: 'التصويتات الرئيسية',
    legislativeProgress: 'التقدم التشريعي',
    committeeHighlights: 'أبرز أنشطة اللجان',
    politicalDynamics: 'الديناميات السياسية',
    outlook: 'التوقعات',
  },
  he: {
    overview: 'סקירה חודשית',
    keyVotes: 'הצבעות מרכזיות',
    legislativeProgress: 'התקדמות חקיקתית',
    committeeHighlights: 'דגשי ועדות',
    politicalDynamics: 'דינמיקה פוליטית',
    outlook: 'תחזית',
  },
  ja: {
    overview: '月間概要',
    keyVotes: '主要投票',
    legislativeProgress: '立法の進展',
    committeeHighlights: '委員会のハイライト',
    politicalDynamics: '政治的動向',
    outlook: '見通し',
  },
  ko: {
    overview: '월간 개요',
    keyVotes: '주요 투표',
    legislativeProgress: '입법 진행',
    committeeHighlights: '위원회 하이라이트',
    politicalDynamics: '정치적 역학',
    outlook: '전망',
  },
  zh: {
    overview: '月度概览',
    keyVotes: '关键投票',
    legislativeProgress: '立法进展',
    committeeHighlights: '委员会要点',
    politicalDynamics: '政治动态',
    outlook: '展望',
  },
};

// ─── Analysis quality indicator labels ────────────────────────────────────────

/** Quality indicator labels for analysis articles, localized to all 14 languages */
