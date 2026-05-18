// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/MonthAhead
 * @description Month-Ahead article: 14-language title generator.
 *
 * Per-language strings live together so a translator can update one language
 * for this article type without touching any other article type.
 */

import type { LanguageMap, LangTitleSubtitle } from '../../types/index.js';
export const MONTH_AHEAD_TITLES: LanguageMap<(month: string) => LangTitleSubtitle> = {
  en: (month) => ({
    title: `Month Ahead: ${month}`,
    subtitle:
      'European Parliament strategic outlook — legislative milestones, committee calendar, and policy agenda for the coming month',
  }),
  sv: (month) => ({
    title: `Månaden Framåt: ${month}`,
    subtitle:
      'Europaparlamentets strategiska utsikt — lagstiftningsmilstolpar, utskottskalender och politisk agenda för kommande månad',
  }),
  da: (month) => ({
    title: `Måneden Fremover: ${month}`,
    subtitle:
      'Europa-Parlamentets strategiske udsigt — lovgivningsmilepæle, udvalgskalender og politisk dagsorden for den kommende måned',
  }),
  no: (month) => ({
    title: `Måneden Fremover: ${month}`,
    subtitle:
      'Europaparlamentets strategiske utsikt — lovgivningsmilestener, komitékalender og politisk agenda for kommende måned',
  }),
  fi: (month) => ({
    title: `Tuleva Kuukausi: ${month}`,
    subtitle:
      'Euroopan parlamentin strateginen katsaus — lainsäädännölliset virstanpylväät, valiokuntakalenteri ja poliittinen agenda tulevalle kuukaudelle',
  }),
  de: (month) => ({
    title: `Monat Voraus: ${month}`,
    subtitle:
      'Strategischer Ausblick des Europäischen Parlaments — Gesetzgebungsmeilensteine, Ausschusskalender und politische Agenda für den kommenden Monat',
  }),
  fr: (month) => ({
    title: `Mois à Venir: ${month}`,
    subtitle:
      'Perspectives stratégiques du Parlement européen — jalons législatifs, calendrier des commissions et agenda politique pour le mois à venir',
  }),
  es: (month) => ({
    title: `Mes Próximo: ${month}`,
    subtitle:
      'Perspectiva estratégica del Parlamento Europeo — hitos legislativos, calendario de comisiones y agenda política para el próximo mes',
  }),
  nl: (month) => ({
    title: `Maand Vooruit: ${month}`,
    subtitle:
      'Strategische vooruitblik Europees Parlement — wetgevingsmijlpalen, commissiekalender en politieke agenda voor de komende maand',
  }),
  ar: (month) => ({
    title: `الشهر القادم: ${month}`,
    subtitle:
      'نظرة استراتيجية للبرلمان الأوروبي — معالم تشريعية وجدول أعمال اللجان والأجندة السياسية للشهر القادم',
  }),
  he: (month) => ({
    title: `החודש הקרוב: ${month}`,
    subtitle:
      'תחזית אסטרטגית של הפרלמנט האירופי — אבני דרך חקיקתיות, לוח ועדות ואג׳נדה פוליטית לחודש הקרוב',
  }),
  ja: (month) => ({
    title: `来月の展望: ${month}`,
    subtitle: '欧州議会の戦略的展望 — 立法上のマイルストーン、委員会カレンダー、政策アジェンダ',
  }),
  ko: (month) => ({
    title: `다음 달 전망: ${month}`,
    subtitle: '유럽 의회 전략적 전망 — 입법 이정표, 위원회 일정 및 정책 의제',
  }),
  zh: (month) => ({
    title: `下月展望: ${month}`,
    subtitle: '欧洲议会战略展望 — 立法里程碑、委员会日程和政策议程',
  }),
};

/** Weekly review title templates per language */
