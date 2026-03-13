// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/LanguageArticles
 * @description Article-type-specific title generators and body-text strings per language.
 * Each article type (week-ahead, Plenary Votes & Resolutions, breaking, Committee Activity, Legislative Procedures)
 * has its own localized title template returning `LangTitleSubtitle`.
 */

import type {
  LanguageMap,
  LangTitleSubtitle,
  PropositionsStrings,
  EditorialStrings,
  MotionsStrings,
  WeekAheadStrings,
  BreakingStrings,
  DeepAnalysisStrings,
  CommitteeAnalysisContentStrings,
  SwotStrings,
  DashboardStrings,
  SwotBuilderStrings,
  DashboardBuilderStrings,
} from '../types/index.js';

import { ArticleCategory } from '../types/index.js';

/**
 * Localized base keywords per article category.
 * These provide language-appropriate SEO keywords that the article generator
 * should include (or extend) when producing articles in each language.
 * Prevents the common issue of English-only keywords in translated articles.
 */
/* eslint-disable sonarjs/no-duplicate-string -- Localized keyword dictionaries have intentional repetition across categories */
export const LOCALIZED_KEYWORDS: LanguageMap<Record<string, readonly string[]>> = {
  en: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU Parliament',
      'week ahead',
      'committee meetings',
      'plenary debate',
      'European Parliament',
      'legislation',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU Parliament',
      'month ahead',
      'legislative agenda',
      'European Parliament',
      'plenary session',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU Parliament',
      'breaking news',
      'European Parliament',
      'legislation',
      'plenary vote',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU Parliament',
      'committee activity',
      'European Parliament',
      'committee report',
      'legislation',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU Parliament',
      'legislative procedures',
      'European Parliament',
      'proposal',
      'regulation',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU Parliament',
      'plenary votes',
      'resolutions',
      'European Parliament',
      'voting record',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU Parliament',
      'week in review',
      'European Parliament',
      'summary',
      'legislation',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU Parliament',
      'month in review',
      'European Parliament',
      'summary',
      'legislative review',
    ],
  },
  sv: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-parlamentet',
      'veckan framåt',
      'utskottsmöten',
      'plenardebatt',
      'Europaparlamentet',
      'lagstiftning',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-parlamentet',
      'månaden framåt',
      'lagstiftningsagenda',
      'Europaparlamentet',
      'plenarsession',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-parlamentet',
      'senaste nytt',
      'Europaparlamentet',
      'lagstiftning',
      'omröstning',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-parlamentet',
      'utskottsverksamhet',
      'Europaparlamentet',
      'utskottsrapport',
      'lagstiftning',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-parlamentet',
      'lagstiftningsförfaranden',
      'Europaparlamentet',
      'förslag',
      'förordning',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-parlamentet',
      'omröstningar',
      'resolutioner',
      'Europaparlamentet',
      'röstprotokoll',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-parlamentet',
      'veckans sammanfattning',
      'Europaparlamentet',
      'sammanfattning',
      'lagstiftning',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-parlamentet',
      'månadens sammanfattning',
      'Europaparlamentet',
      'sammanfattning',
      'lagstiftningsöversikt',
    ],
  },
  da: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-Parlamentet',
      'ugen fremover',
      'udvalgsmøder',
      'plenardebat',
      'Europa-Parlamentet',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-Parlamentet',
      'måneden fremover',
      'lovgivningsdagsorden',
      'Europa-Parlamentet',
      'plenarsamling',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-Parlamentet',
      'seneste nyt',
      'Europa-Parlamentet',
      'lovgivning',
      'afstemning',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-Parlamentet',
      'udvalgsaktivitet',
      'Europa-Parlamentet',
      'udvalgsrapport',
      'lovgivning',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-Parlamentet',
      'lovgivningsprocedurer',
      'Europa-Parlamentet',
      'forslag',
      'forordning',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-Parlamentet',
      'plenar-afstemninger',
      'beslutninger',
      'Europa-Parlamentet',
      'stemmeoversigt',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-Parlamentet',
      'ugens overblik',
      'Europa-Parlamentet',
      'sammenfatning',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-Parlamentet',
      'månedens overblik',
      'Europa-Parlamentet',
      'sammenfatning',
      'lovgivningsoversigt',
    ],
  },
  no: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-parlamentet',
      'uken fremover',
      'komitémøter',
      'plenardebatt',
      'Europaparlamentet',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-parlamentet',
      'måneden fremover',
      'lovgivningsagenda',
      'Europaparlamentet',
      'plenarsesjon',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-parlamentet',
      'siste nytt',
      'Europaparlamentet',
      'lovgivning',
      'avstemning',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-parlamentet',
      'komitéaktivitet',
      'Europaparlamentet',
      'komitérapport',
      'lovgivning',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-parlamentet',
      'lovgivningsprosedyrer',
      'Europaparlamentet',
      'forslag',
      'forordning',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-parlamentet',
      'plenaravstemninger',
      'vedtak',
      'Europaparlamentet',
      'stemmeprotokoll',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-parlamentet',
      'ukens oppsummering',
      'Europaparlamentet',
      'sammendrag',
      'lovgivning',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-parlamentet',
      'månedens oppsummering',
      'Europaparlamentet',
      'sammendrag',
      'lovgivningsoversikt',
    ],
  },
  fi: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-parlamentti',
      'tuleva viikko',
      'valiokuntakokoukset',
      'täysistuntokeskustelu',
      'Euroopan parlamentti',
      'lainsäädäntö',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-parlamentti',
      'tuleva kuukausi',
      'lainsäädäntöohjelma',
      'Euroopan parlamentti',
      'täysistunto',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-parlamentti',
      'uusimmat uutiset',
      'Euroopan parlamentti',
      'lainsäädäntö',
      'äänestys',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-parlamentti',
      'valiokuntatoiminta',
      'Euroopan parlamentti',
      'valiokuntaraportti',
      'lainsäädäntö',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-parlamentti',
      'lainsäädäntömenettelyt',
      'Euroopan parlamentti',
      'ehdotus',
      'asetus',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-parlamentti',
      'täysistuntoäänestykset',
      'päätöslauselmat',
      'Euroopan parlamentti',
      'äänestyspöytäkirja',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-parlamentti',
      'viikon katsaus',
      'Euroopan parlamentti',
      'yhteenveto',
      'lainsäädäntö',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-parlamentti',
      'kuukauden katsaus',
      'Euroopan parlamentti',
      'yhteenveto',
      'lainsäädäntökatsaus',
    ],
  },
  de: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-Parlament',
      'Woche voraus',
      'Ausschusssitzungen',
      'Plenardebatte',
      'Europäisches Parlament',
      'Gesetzgebung',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-Parlament',
      'Monat voraus',
      'Gesetzgebungsagenda',
      'Europäisches Parlament',
      'Plenarsitzung',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-Parlament',
      'Eilmeldung',
      'Europäisches Parlament',
      'Gesetzgebung',
      'Abstimmung',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-Parlament',
      'Ausschusstätigkeit',
      'Europäisches Parlament',
      'Ausschussbericht',
      'Gesetzgebung',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-Parlament',
      'Gesetzgebungsverfahren',
      'Europäisches Parlament',
      'Vorschlag',
      'Verordnung',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-Parlament',
      'Plenar-Abstimmungen',
      'Entschließungen',
      'Europäisches Parlament',
      'Abstimmungsprotokoll',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-Parlament',
      'Wochenrückblick',
      'Europäisches Parlament',
      'Zusammenfassung',
      'Gesetzgebung',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-Parlament',
      'Monatsrückblick',
      'Europäisches Parlament',
      'Zusammenfassung',
      'Gesetzgebungsübersicht',
    ],
  },
  fr: {
    [ArticleCategory.WEEK_AHEAD]: [
      'Parlement européen',
      'semaine à venir',
      'réunions de commission',
      'débat en plénière',
      'législation',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'Parlement européen',
      'mois à venir',
      'agenda législatif',
      'session plénière',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'Parlement européen',
      'dernières nouvelles',
      'législation',
      'vote en plénière',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'Parlement européen',
      'travaux des commissions',
      'rapport de commission',
      'législation',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'Parlement européen',
      'procédures législatives',
      'proposition',
      'règlement',
    ],
    [ArticleCategory.MOTIONS]: [
      'Parlement européen',
      'votes en plénière',
      'résolutions',
      'protocole de vote',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'Parlement européen',
      'bilan de la semaine',
      'résumé',
      'législation',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'Parlement européen',
      'bilan du mois',
      'résumé',
      'revue législative',
    ],
  },
  es: {
    [ArticleCategory.WEEK_AHEAD]: [
      'Parlamento Europeo',
      'semana próxima',
      'reuniones de comisión',
      'debate plenario',
      'legislación',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'Parlamento Europeo',
      'mes próximo',
      'agenda legislativa',
      'sesión plenaria',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'Parlamento Europeo',
      'noticias de última hora',
      'legislación',
      'votación plenaria',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'Parlamento Europeo',
      'actividad de comisiones',
      'informe de comisión',
      'legislación',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'Parlamento Europeo',
      'procedimientos legislativos',
      'propuesta',
      'reglamento',
    ],
    [ArticleCategory.MOTIONS]: [
      'Parlamento Europeo',
      'votaciones plenarias',
      'resoluciones',
      'acta de votación',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'Parlamento Europeo',
      'resumen de la semana',
      'resumen',
      'legislación',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'Parlamento Europeo',
      'resumen del mes',
      'resumen',
      'revisión legislativa',
    ],
  },
  nl: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU-Parlement',
      'week vooruit',
      'commissievergaderingen',
      'plenair debat',
      'Europees Parlement',
      'wetgeving',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'EU-Parlement',
      'maand vooruit',
      'wetgevingsagenda',
      'Europees Parlement',
      'plenaire zitting',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'EU-Parlement',
      'laatste nieuws',
      'Europees Parlement',
      'wetgeving',
      'stemming',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU-Parlement',
      'commissieactiviteiten',
      'Europees Parlement',
      'commissieverslag',
      'wetgeving',
    ],
    [ArticleCategory.PROPOSITIONS]: [
      'EU-Parlement',
      'wetgevingsprocedures',
      'Europees Parlement',
      'voorstel',
      'verordening',
    ],
    [ArticleCategory.MOTIONS]: [
      'EU-Parlement',
      'plenaire stemmingen',
      'resoluties',
      'Europees Parlement',
      'stemprotocol',
    ],
    [ArticleCategory.WEEK_IN_REVIEW]: [
      'EU-Parlement',
      'weekoverzicht',
      'Europees Parlement',
      'samenvatting',
      'wetgeving',
    ],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU-Parlement',
      'maandoverzicht',
      'Europees Parlement',
      'samenvatting',
      'wetgevingsoverzicht',
    ],
  },
  ar: {
    [ArticleCategory.WEEK_AHEAD]: [
      'البرلمان الأوروبي',
      'الأسبوع القادم',
      'اجتماعات اللجان',
      'المناقشة العامة',
      'التشريع',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'البرلمان الأوروبي',
      'الشهر القادم',
      'جدول الأعمال التشريعي',
      'الجلسة العامة',
    ],
    [ArticleCategory.BREAKING_NEWS]: [
      'البرلمان الأوروبي',
      'أخبار عاجلة',
      'التشريع',
      'التصويت العام',
    ],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'البرلمان الأوروبي',
      'نشاط اللجان',
      'تقرير اللجنة',
      'التشريع',
    ],
    [ArticleCategory.PROPOSITIONS]: ['البرلمان الأوروبي', 'الإجراءات التشريعية', 'مقترح', 'تنظيم'],
    [ArticleCategory.MOTIONS]: ['البرلمان الأوروبي', 'التصويتات العامة', 'القرارات', 'سجل التصويت'],
    [ArticleCategory.WEEK_IN_REVIEW]: ['البرلمان الأوروبي', 'مراجعة الأسبوع', 'ملخص', 'التشريع'],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'البرلمان الأوروبي',
      'مراجعة الشهر',
      'ملخص',
      'مراجعة تشريعية',
    ],
  },
  he: {
    [ArticleCategory.WEEK_AHEAD]: [
      'הפרלמנט האירופי',
      'השבוע הקרוב',
      'ישיבות ועדות',
      'דיון מליאה',
      'חקיקה',
    ],
    [ArticleCategory.MONTH_AHEAD]: [
      'הפרלמנט האירופי',
      'החודש הקרוב',
      'סדר יום חקיקתי',
      'ישיבת מליאה',
    ],
    [ArticleCategory.BREAKING_NEWS]: ['הפרלמנט האירופי', 'חדשות דחופות', 'חקיקה', 'הצבעת מליאה'],
    [ArticleCategory.COMMITTEE_REPORTS]: ['הפרלמנט האירופי', 'פעילות ועדות', 'דוח ועדה', 'חקיקה'],
    [ArticleCategory.PROPOSITIONS]: ['הפרלמנט האירופי', 'הליכי חקיקה', 'הצעה', 'תקנה'],
    [ArticleCategory.MOTIONS]: ['הפרלמנט האירופי', 'הצבעות מליאה', 'החלטות', 'פרוטוקול הצבעה'],
    [ArticleCategory.WEEK_IN_REVIEW]: ['הפרלמנט האירופי', 'סיכום השבוע', 'סיכום', 'חקיקה'],
    [ArticleCategory.MONTH_IN_REVIEW]: ['הפרלמנט האירופי', 'סיכום החודש', 'סיכום', 'סקירה חקיקתית'],
  },
  ja: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU議会',
      '今週の予定',
      '委員会会議',
      '本会議討論',
      '欧州議会',
      '立法',
    ],
    [ArticleCategory.MONTH_AHEAD]: ['EU議会', '今月の予定', '立法議題', '欧州議会', '本会議'],
    [ArticleCategory.BREAKING_NEWS]: ['EU議会', '速報', '欧州議会', '立法', '本会議投票'],
    [ArticleCategory.COMMITTEE_REPORTS]: ['EU議会', '委員会活動', '欧州議会', '委員会報告', '立法'],
    [ArticleCategory.PROPOSITIONS]: ['EU議会', '立法手続', '欧州議会', '提案', '規則'],
    [ArticleCategory.MOTIONS]: ['EU議会', '本会議投票', '決議', '欧州議会', '投票記録'],
    [ArticleCategory.WEEK_IN_REVIEW]: ['EU議会', '週間レビュー', '欧州議会', '要約', '立法'],
    [ArticleCategory.MONTH_IN_REVIEW]: [
      'EU議会',
      '月間レビュー',
      '欧州議会',
      '要約',
      '立法レビュー',
    ],
  },
  ko: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU 의회',
      '다음 주 일정',
      '위원회 회의',
      '본회의 토론',
      '유럽 의회',
      '입법',
    ],
    [ArticleCategory.MONTH_AHEAD]: ['EU 의회', '다음 달 일정', '입법 의제', '유럽 의회', '본회의'],
    [ArticleCategory.BREAKING_NEWS]: ['EU 의회', '속보', '유럽 의회', '입법', '본회의 투표'],
    [ArticleCategory.COMMITTEE_REPORTS]: [
      'EU 의회',
      '위원회 활동',
      '유럽 의회',
      '위원회 보고서',
      '입법',
    ],
    [ArticleCategory.PROPOSITIONS]: ['EU 의회', '입법 절차', '유럽 의회', '제안', '규정'],
    [ArticleCategory.MOTIONS]: ['EU 의회', '본회의 투표', '결의', '유럽 의회', '투표 기록'],
    [ArticleCategory.WEEK_IN_REVIEW]: ['EU 의회', '주간 리뷰', '유럽 의회', '요약', '입법'],
    [ArticleCategory.MONTH_IN_REVIEW]: ['EU 의회', '월간 리뷰', '유럽 의회', '요약', '입법 리뷰'],
  },
  zh: {
    [ArticleCategory.WEEK_AHEAD]: [
      'EU议会',
      '下周预告',
      '委员会会议',
      '全会辩论',
      '欧洲议会',
      '立法',
    ],
    [ArticleCategory.MONTH_AHEAD]: ['EU议会', '下月预告', '立法议程', '欧洲议会', '全会'],
    [ArticleCategory.BREAKING_NEWS]: ['EU议会', '突发新闻', '欧洲议会', '立法', '全会投票'],
    [ArticleCategory.COMMITTEE_REPORTS]: ['EU议会', '委员会活动', '欧洲议会', '委员会报告', '立法'],
    [ArticleCategory.PROPOSITIONS]: ['EU议会', '立法程序', '欧洲议会', '提案', '条例'],
    [ArticleCategory.MOTIONS]: ['EU议会', '全体投票', '决议', '欧洲议会', '投票记录'],
    [ArticleCategory.WEEK_IN_REVIEW]: ['EU议会', '每周回顾', '欧洲议会', '摘要', '立法'],
    [ArticleCategory.MONTH_IN_REVIEW]: ['EU议会', '每月回顾', '欧洲议会', '摘要', '立法审查'],
  },
};
/* eslint-enable sonarjs/no-duplicate-string */

/** Week ahead title templates per language */
export const WEEK_AHEAD_TITLES: LanguageMap<(start: string, end: string) => LangTitleSubtitle> = {
  en: (start, end) => ({
    title: `Week Ahead: ${start} to ${end}`,
    subtitle:
      'European Parliament calendar, committee meetings, and plenary debates for the coming week',
  }),
  sv: (start, end) => ({
    title: `Vecka Framåt: ${start} till ${end}`,
    subtitle: 'Europaparlamentets kalender, utskottsmöten och plenardebatter för kommande vecka',
  }),
  da: (start, end) => ({
    title: `Ugen Fremover: ${start} til ${end}`,
    subtitle: 'Europa-Parlamentets kalender, udvalgsmøder og plenardebatter for den kommende uge',
  }),
  no: (start, end) => ({
    title: `Uken Fremover: ${start} til ${end}`,
    subtitle: 'Europaparlamentets kalender, komitémøter og plenardebatter for kommende uke',
  }),
  fi: (start, end) => ({
    title: `Tuleva Viikko: ${start} - ${end}`,
    subtitle:
      'Euroopan parlamentin kalenteri, valiokuntien kokoukset ja täysistuntokeskustelut tulevalle viikolle',
  }),
  de: (start, end) => ({
    title: `Woche Voraus: ${start} bis ${end}`,
    subtitle:
      'Europäischer Parlamentskalender, Ausschusssitzungen und Plenardebatten für die kommende Woche',
  }),
  fr: (start, end) => ({
    title: `Semaine à Venir: ${start} au ${end}`,
    subtitle:
      'Calendrier du Parlement européen, réunions de commission et débats pléniers pour la semaine à venir',
  }),
  es: (start, end) => ({
    title: `Semana Próxima: ${start} a ${end}`,
    subtitle:
      'Calendario del Parlamento Europeo, reuniones de comisión y debates plenarios para la próxima semana',
  }),
  nl: (start, end) => ({
    title: `Week Vooruit: ${start} tot ${end}`,
    subtitle:
      'Europees Parlement kalender, commissievergaderingen en plenaire debatten voor de komende week',
  }),
  ar: (start, end) => ({
    title: `الأسبوع القادم: ${start} إلى ${end}`,
    subtitle: 'جدول أعمال البرلمان الأوروبي واجتماعات اللجان والنقاشات العامة للأسبوع القادم',
  }),
  he: (start, end) => ({
    title: `השבוע הקרוב: ${start} עד ${end}`,
    subtitle: 'לוח הזמנים של הפרלמנט האירופי, ישיבות ועדות ודיוני מליאה לשבוע הקרוב',
  }),
  ja: (start, end) => ({
    title: `今週の予定: ${start} ～ ${end}`,
    subtitle: '欧州議会のカレンダー、委員会会合、本会議の討論',
  }),
  ko: (start, end) => ({
    title: `다음 주 일정: ${start} ~ ${end}`,
    subtitle: '유럽 의회 일정, 위원회 회의 및 본회의 토론',
  }),
  zh: (start, end) => ({
    title: `下周预告: ${start} 至 ${end}`,
    subtitle: '欧洲议会日历、委员会会议和全体辩论',
  }),
};

/** Month ahead title templates per language */
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
export const WEEKLY_REVIEW_TITLES: LanguageMap<(start: string, end: string) => LangTitleSubtitle> =
  {
    en: (start, end) => ({
      title: `Week in Review: ${start} to ${end}`,
      subtitle:
        'Analysis of the past week in the European Parliament — votes, committee decisions, and legislative developments',
    }),
    sv: (start, end) => ({
      title: `Veckan i Korthet: ${start} till ${end}`,
      subtitle:
        'Analys av den gångna veckan i Europaparlamentet — omröstningar, utskottsbeslut och lagstiftningsutvecklingar',
    }),
    da: (start, end) => ({
      title: `Ugen i Overblik: ${start} til ${end}`,
      subtitle:
        'Analyse af den forgangne uge i Europa-Parlamentet — afstemninger, udvalgsbeslutninger og lovgivningsudviklinger',
    }),
    no: (start, end) => ({
      title: `Uken i Tilbakeblikk: ${start} til ${end}`,
      subtitle:
        'Analyse av den siste uken i Europaparlamentet — avstemninger, komitébeslutninger og lovgivningsutvikling',
    }),
    fi: (start, end) => ({
      title: `Viikon Katsaus: ${start} - ${end}`,
      subtitle:
        'Analyysi kuluneesta viikosta Euroopan parlamentissa — äänestykset, valiokuntapäätökset ja lainsäädäntökehitys',
    }),
    de: (start, end) => ({
      title: `Woche im Rückblick: ${start} bis ${end}`,
      subtitle:
        'Analyse der vergangenen Woche im Europäischen Parlament — Abstimmungen, Ausschussentscheidungen und Gesetzgebungsentwicklungen',
    }),
    fr: (start, end) => ({
      title: `Semaine en Revue: ${start} au ${end}`,
      subtitle:
        'Analyse de la semaine écoulée au Parlement européen — votes, décisions de commission et évolutions législatives',
    }),
    es: (start, end) => ({
      title: `Semana en Revisión: ${start} a ${end}`,
      subtitle:
        'Análisis de la semana pasada en el Parlamento Europeo — votaciones, decisiones de comisión y desarrollos legislativos',
    }),
    nl: (start, end) => ({
      title: `Week in Overzicht: ${start} tot ${end}`,
      subtitle:
        'Analyse van de afgelopen week in het Europees Parlement — stemmingen, commissiebesluiten en wetgevingsontwikkelingen',
    }),
    ar: (start, end) => ({
      title: `مراجعة الأسبوع: ${start} إلى ${end}`,
      subtitle:
        'تحليل الأسبوع الماضي في البرلمان الأوروبي — التصويتات وقرارات اللجان والتطورات التشريعية',
    }),
    he: (start, end) => ({
      title: `סקירת השבוע: ${start} עד ${end}`,
      subtitle: 'ניתוח השבוע שחלף בפרלמנט האירופי — הצבעות, החלטות ועדות והתפתחויות חקיקתיות',
    }),
    ja: (start, end) => ({
      title: `今週の振り返り: ${start} ～ ${end}`,
      subtitle: '欧州議会における先週の分析 — 投票、委員会の決定、立法の進展',
    }),
    ko: (start, end) => ({
      title: `주간 리뷰: ${start} ~ ${end}`,
      subtitle: '유럽 의회 지난 주 분석 — 투표, 위원회 결정 및 입법 발전',
    }),
    zh: (start, end) => ({
      title: `本周回顾: ${start} 至 ${end}`,
      subtitle: '欧洲议会过去一周分析 — 投票、委员会决定和立法进展',
    }),
  };

/** Monthly review title templates per language */
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

/** Motions title templates per language */
export const MOTIONS_TITLES: LanguageMap<(date: string) => LangTitleSubtitle> = {
  en: (date) => ({
    title: `Plenary Votes & Resolutions: ${date}`,
    subtitle:
      'Recent plenary votes, adopted texts, party cohesion analysis, and detected voting anomalies in the European Parliament',
  }),
  sv: (date) => ({
    title: `Omröstningar & Resolutioner: ${date}`,
    subtitle:
      'Senaste plenarröstningar, antagna texter, analys av partikohesion och upptäckta omröstningsanomalier i Europaparlamentet',
  }),
  da: (date) => ({
    title: `Plenar-afstemninger & Beslutninger: ${date}`,
    subtitle:
      'Seneste plenarafstemninger, vedtagne tekster, analyse af partikohæsion og opdagede afstemningsanomalier i Europa-Parlamentet',
  }),
  no: (date) => ({
    title: `Plenaravstemninger & Vedtak: ${date}`,
    subtitle:
      'Siste plenaravstemninger, vedtatte tekster, partikohesjon og avvikende avstemninger i Europaparlamentet',
  }),
  fi: (date) => ({
    title: `Täysistuntoäänestykset & Päätöslauselmat: ${date}`,
    subtitle:
      'Viimeisimmät täysistuntoäänestykset, hyväksytyt tekstit, puoluekohesio-analyysi ja havaitut äänestyspoikkeamat Euroopan parlamentissa',
  }),
  de: (date) => ({
    title: `Plenar-Abstimmungen & Entschließungen: ${date}`,
    subtitle:
      'Aktuelle Plenar-Abstimmungen, angenommene Texte, Fraktionskohäsionsanalyse und erkannte Abstimmungsanomalien im Europäischen Parlament',
  }),
  fr: (date) => ({
    title: `Votes & Résolutions en Plénière: ${date}`,
    subtitle:
      'Votes pléniers récents, textes adoptés, analyse de cohésion des groupes politiques et anomalies de vote détectées au Parlement européen',
  }),
  es: (date) => ({
    title: `Votaciones y Resoluciones Plenarias: ${date}`,
    subtitle:
      'Votaciones plenarias recientes, textos adoptados, análisis de cohesión de grupos políticos y anomalías de votación detectadas en el Parlamento Europeo',
  }),
  nl: (date) => ({
    title: `Plenaire Stemmingen & Resoluties: ${date}`,
    subtitle:
      'Recente plenaire stemmingen, aangenomen teksten, fractiebinding-analyse en gedetecteerde stemanomalieën in het Europees Parlement',
  }),
  ar: (date) => ({
    title: `التصويتات والقرارات العامة: ${date}`,
    subtitle:
      'أحدث التصويتات العامة والنصوص المعتمدة وتحليل تماسك الأحزاب والشذوذ في التصويت في البرلمان الأوروبي',
  }),
  he: (date) => ({
    title: `הצבעות והחלטות מליאה: ${date}`,
    subtitle:
      'הצבעות מליאה אחרונות, טקסטים שאומצו, ניתוח לכידות מפלגתית וחריגות הצבעה בפרלמנט האירופי',
  }),
  ja: (date) => ({
    title: `本会議投票・決議: ${date}`,
    subtitle: '欧州議会における最近の本会議投票、採択テキスト、政党結束分析、投票異常',
  }),
  ko: (date) => ({
    title: `본회의 투표 및 결의: ${date}`,
    subtitle: '유럽 의회의 최근 본회의 투표, 채택 텍스트, 정당 결속 분석 및 투표 이상 감지',
  }),
  zh: (date) => ({
    title: `全体投票与决议: ${date}`,
    subtitle: '欧洲议会最近的全体投票、通过文本、政党凝聚力分析和投票异常检测',
  }),
};

/** Breaking news title templates per language */
export const BREAKING_NEWS_TITLES: LanguageMap<(date: string) => LangTitleSubtitle> = {
  en: (date) => ({
    title: `Breaking: Significant Parliamentary Developments — ${date}`,
    subtitle: 'Intelligence analysis of voting anomalies, coalition shifts, and key MEP activities',
  }),
  sv: (date) => ({
    title: `Senaste Nytt: Betydande Parlamentariska Händelser — ${date}`,
    subtitle:
      'Underrättelseanalys av röstningsanomalier, koalitionsförändringar och viktig MEP-aktivitet',
  }),
  da: (date) => ({
    title: `Seneste Nyt: Betydelige Parlamentariske Udviklinger — ${date}`,
    subtitle:
      'Efterretningsanalyse af afstemningsanomalier, koalitionsforskydninger og centrale MEP-aktiviteter',
  }),
  no: (date) => ({
    title: `Siste Nytt: Betydelige Parlamentariske Hendelser — ${date}`,
    subtitle:
      'Etterretningsanalyse av avstemningsavvik, koalisjonsendringer og viktige MEP-aktiviteter',
  }),
  fi: (date) => ({
    title: `Uusimmat Uutiset: Merkittäviä Parlamentaarisia Kehityksiä — ${date}`,
    subtitle:
      'Tiedusteluanalyysi äänestyspoikkeamista, koalitiomuutoksista ja keskeisistä MEP-toimista',
  }),
  de: (date) => ({
    title: `Eilmeldung: Bedeutende Parlamentarische Entwicklungen — ${date}`,
    subtitle:
      'Analyse von Abstimmungsanomalien, Koalitionsverschiebungen und wichtigen MEP-Aktivitäten',
  }),
  fr: (date) => ({
    title: `Dernières Nouvelles: Développements Parlementaires Significatifs — ${date}`,
    subtitle:
      'Analyse des anomalies de vote, des évolutions des coalitions et des activités clés des eurodéputés',
  }),
  es: (date) => ({
    title: `Última Hora: Desarrollos Parlamentarios Significativos — ${date}`,
    subtitle:
      'Análisis de anomalías en votaciones, cambios en coaliciones y actividades clave de eurodiputados',
  }),
  nl: (date) => ({
    title: `Laatste Nieuws: Significante Parlementaire Ontwikkelingen — ${date}`,
    subtitle: 'Analyse van stemanomalieën, coalitieverschuivingen en belangrijke MEP-activiteiten',
  }),
  ar: (date) => ({
    title: `عاجل: تطورات برلمانية هامة — ${date}`,
    subtitle: 'تحليل استخباراتي لشذوذ التصويت وتحولات التحالفات وأنشطة النواب الرئيسية',
  }),
  he: (date) => ({
    title: `חדשות דחופות: התפתחויות פרלמנטריות משמעותיות — ${date}`,
    subtitle: 'ניתוח מודיעיני של חריגות הצבעה, שינויי קואליציה ופעילויות חברי פרלמנט מרכזיות',
  }),
  ja: (date) => ({
    title: `速報: 重要な議会の動き — ${date}`,
    subtitle: '投票異常、連立変動、主要MEP活動の分析',
  }),
  ko: (date) => ({
    title: `속보: 중요한 의회 동향 — ${date}`,
    subtitle: '투표 이상, 연합 변화 및 주요 MEP 활동 분석',
  }),
  zh: (date) => ({
    title: `突发: 重大议会进展 — ${date}`,
    subtitle: '投票异常、联盟变化和关键MEP活动的情报分析',
  }),
};

/** Committee reports titles per language */
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
export const PROPOSITIONS_TITLES: LanguageMap<() => LangTitleSubtitle> = {
  en: () => ({
    title: 'Legislative Procedures: European Parliament Monitor',
    subtitle:
      'Recent legislative proposals, procedure tracking, and pipeline status in the European Parliament',
  }),
  sv: () => ({
    title: 'Lagstiftningsförfaranden: EU-parlamentsmonitor',
    subtitle:
      'Senaste lagstiftningsförslag, procedurspårning och pipeline-status i Europaparlamentet',
  }),
  da: () => ({
    title: 'Lovgivningsprocedurer: EU-parlamentsmonitor',
    subtitle:
      'Seneste lovgivningsforslag, proceduresporing og pipeline-status i Europa-Parlamentet',
  }),
  no: () => ({
    title: 'Lovgivningsprosedyrer: EU-parlamentsmonitor',
    subtitle: 'Siste lovgivningsforslag, prosedyresporing og pipeline-status i Europaparlamentet',
  }),
  fi: () => ({
    title: 'Lainsäädäntömenettelyt: EU-parlamentin seuranta',
    subtitle:
      'Viimeisimmät lainsäädäntöehdotukset, menettelyseuranta ja pipeline-tila Euroopan parlamentissa',
  }),
  de: () => ({
    title: 'Gesetzgebungsverfahren: EU-Parlamentsmonitor',
    subtitle:
      'Aktuelle Gesetzgebungsvorschläge, Verfahrensverfolgung und Pipeline-Status im Europäischen Parlament',
  }),
  fr: () => ({
    title: 'Procédures Législatives: Moniteur du Parlement Européen',
    subtitle:
      'Propositions législatives récentes, suivi des procédures et état du pipeline au Parlement européen',
  }),
  es: () => ({
    title: 'Procedimientos Legislativos: Monitor del Parlamento Europeo',
    subtitle:
      'Propuestas legislativas recientes, seguimiento de procedimientos y estado del pipeline en el Parlamento Europeo',
  }),
  nl: () => ({
    title: 'Wetgevingsprocedures: EU Parlementsmonitor',
    subtitle:
      'Recente wetgevingsvoorstellen, procedurebewaking en pipeline-status in het Europees Parlement',
  }),
  ar: () => ({
    title: 'الإجراءات التشريعية: مراقب البرلمان الأوروبي',
    subtitle:
      'المقترحات التشريعية الأخيرة ومتابعة الإجراءات وحالة خط الأنابيب في البرلمان الأوروبي',
  }),
  he: () => ({
    title: 'הליכי חקיקה: מוניטור הפרלמנט האירופי',
    subtitle: 'הצעות חקיקה אחרונות, מעקב אחר הליכים ומצב צינור החקיקה בפרלמנט האירופי',
  }),
  ja: () => ({
    title: '立法手続: EU議会モニター',
    subtitle: '欧州議会における最近の立法提案、手続き追跡、パイプライン状況',
  }),
  ko: () => ({
    title: '입법 절차: EU 의회 모니터',
    subtitle: '유럽 의회의 최근 입법 제안, 절차 추적 및 파이프라인 상태',
  }),
  zh: () => ({
    title: '立法程序: EU议会监测',
    subtitle: '欧洲议会最近的立法提案、程序跟踪和流水线状态',
  }),
};

/** Localized body text strings for propositions articles */
export const PROPOSITIONS_STRINGS: LanguageMap<PropositionsStrings> = {
  en: {
    lede: 'The European Parliament is actively processing multiple legislative proposals across key policy areas. This report tracks current proposals, their procedure status, and the overall legislative pipeline.',
    proposalsHeading: 'Recent Legislative Procedures',
    adoptedTextsHeading: 'Recently Adopted Texts',
    pipelineHeading: 'Legislative Pipeline Overview',
    procedureHeading: 'Procedure Status',
    analysisHeading: 'Impact Assessment',
    analysis:
      "Current legislative activity reflects Parliament's priorities in sustainable finance, digital governance, and environmental policy. Tracking these proposals helps citizens and stakeholders understand the EU's legislative trajectory.",
    pipelineHealthLabel: 'Pipeline Health',
    throughputRateLabel: 'Throughput Rate',
    whyThisMatters:
      'These legislative proposals directly affect EU citizens — from energy costs to digital rights. Understanding the pipeline helps stakeholders anticipate regulatory changes ahead.',
  },
  sv: {
    lede: 'Europaparlamentet bearbetar aktivt flera lagstiftningsförslag inom viktiga politikområden. Denna rapport spårar aktuella förslag, deras procedurstatus och den övergripande lagstiftningspipelinen.',
    proposalsHeading: 'Senaste Lagstiftningsförfaranden',
    adoptedTextsHeading: 'Nyligen Antagna Texter',
    pipelineHeading: 'Översikt av Lagstiftnings-Pipeline',
    procedureHeading: 'Procedurstatus',
    analysisHeading: 'Konsekvensbedömning',
    analysis:
      'Den nuvarande lagstiftningsverksamheten speglar parlamentets prioriteringar inom hållbar finansiering, digital styrning och miljöpolitik.',
    pipelineHealthLabel: 'Pipeline-hälsa',
    throughputRateLabel: 'Genomströmningshastighet',
    whyThisMatters:
      'Dessa lagstiftningsförslag påverkar direkt EU-medborgarna — från energikostnader till digitala rättigheter. Att förstå pipelinen hjälper intressenter att förutse kommande regeländringar.',
  },
  da: {
    lede: 'Europa-Parlamentet behandler aktivt adskillige lovgivningsforslag inden for vigtige politikområder.',
    proposalsHeading: 'Seneste Lovgivningsprocedurer',
    adoptedTextsHeading: 'Nyligt Vedtagne Tekster',
    pipelineHeading: 'Oversigt over Lovgivningspipeline',
    procedureHeading: 'Procedurestatus',
    analysisHeading: 'Konsekvensvurdering',
    analysis:
      'Den aktuelle lovgivningsaktivitet afspejler Parlamentets prioriteter inden for bæredygtig finansiering, digital forvaltning og miljøpolitik.',
    pipelineHealthLabel: 'Pipeline-sundhed',
    throughputRateLabel: 'Gennemstrømningshastighed',
    whyThisMatters:
      'Disse lovgivningsforslag påvirker direkte EU-borgere — fra energiomkostninger til digitale rettigheder. Forståelse af pipeline hjælper interessenter med at forudse kommende regelændringer.',
  },
  no: {
    lede: 'Europaparlamentet behandler aktivt flere lovgivningsforslag innenfor viktige politikkområder.',
    proposalsHeading: 'Siste Lovgivningsprosedyrer',
    adoptedTextsHeading: 'Nylig Vedtatte Tekster',
    pipelineHeading: 'Oversikt over Lovgivningspipeline',
    procedureHeading: 'Prosedyrestatus',
    analysisHeading: 'Konsekvensanalyse',
    analysis:
      'Dagens lovgivningsaktivitet gjenspeiler parlamentets prioriteringer innen bærekraftig finans, digital styring og miljøpolitikk.',
    pipelineHealthLabel: 'Pipeline-helse',
    throughputRateLabel: 'Gjennomstrømningshastighet',
    whyThisMatters:
      'Disse lovgivningsforslagene påvirker direkte EU-borgere — fra energikostnader til digitale rettigheter. Forståelse av pipeline hjelper interessenter med å forutse kommende regelendringer.',
  },
  fi: {
    lede: 'Euroopan parlamentti käsittelee aktiivisesti useita lainsäädäntöehdotuksia keskeisillä politiikka-alueilla.',
    proposalsHeading: 'Viimeisimmät Lainsäädäntömenettelyt',
    adoptedTextsHeading: 'Äskettäin Hyväksytyt Tekstit',
    pipelineHeading: 'Lainsäädäntöputken Yleiskatsaus',
    procedureHeading: 'Menettelyn Tila',
    analysisHeading: 'Vaikutustenarviointi',
    analysis:
      'Nykyinen lainsäädäntötoiminta heijastaa parlamentin prioriteetteja kestävässä rahoituksessa, digitaalisessa hallinnossa ja ympäristöpolitiikassa.',
    pipelineHealthLabel: 'Putkilinjan terveys',
    throughputRateLabel: 'Läpimenoaste',
    whyThisMatters:
      'Nämä lainsäädäntöehdotukset vaikuttavat suoraan EU-kansalaisiin — energiakuluista digitaalisiin oikeuksiin. Putkilinjan ymmärtäminen auttaa sidosryhmiä ennakoimaan tulevia sääntelymuutoksia.',
  },
  de: {
    lede: 'Das Europäische Parlament bearbeitet aktiv mehrere Gesetzgebungsvorschläge in wichtigen Politikbereichen.',
    proposalsHeading: 'Aktuelle Gesetzgebungsverfahren',
    adoptedTextsHeading: 'Kürzlich Angenommene Texte',
    pipelineHeading: 'Überblick über die Gesetzgebungspipeline',
    procedureHeading: 'Verfahrensstatus',
    analysisHeading: 'Folgenabschätzung',
    analysis:
      'Die aktuelle Gesetzgebungstätigkeit spiegelt die Prioritäten des Parlaments in nachhaltiger Finanzierung, digitaler Governance und Umweltpolitik wider.',
    pipelineHealthLabel: 'Pipeline-Gesundheit',
    throughputRateLabel: 'Durchsatzrate',
    whyThisMatters:
      'Diese Gesetzgebungsvorschläge betreffen EU-Bürger direkt — von Energiekosten bis zu digitalen Rechten. Das Verständnis der Pipeline hilft Interessengruppen, kommende Regulierungsänderungen vorherzusehen.',
  },
  fr: {
    lede: 'Le Parlement européen traite activement de multiples propositions législatives dans des domaines politiques clés.',
    proposalsHeading: 'Procédures Législatives Récentes',
    adoptedTextsHeading: 'Textes Récemment Adoptés',
    pipelineHeading: "Vue d'ensemble du Pipeline Législatif",
    procedureHeading: 'Statut de la Procédure',
    analysisHeading: "Évaluation de l'Impact",
    analysis:
      "L'activité législative actuelle reflète les priorités du Parlement en matière de finance durable, de gouvernance numérique et de politique environnementale.",
    pipelineHealthLabel: 'Santé du Pipeline',
    throughputRateLabel: 'Taux de Débit',
    whyThisMatters:
      'Ces propositions législatives concernent directement les citoyens européens — des coûts énergétiques aux droits numériques. Comprendre le pipeline aide les parties prenantes à anticiper les futures évolutions réglementaires.',
  },
  es: {
    lede: 'El Parlamento Europeo está procesando activamente múltiples propuestas legislativas en áreas clave de política.',
    proposalsHeading: 'Procedimientos Legislativos Recientes',
    adoptedTextsHeading: 'Textos Recientemente Adoptados',
    pipelineHeading: 'Descripción General del Pipeline Legislativo',
    procedureHeading: 'Estado del Procedimiento',
    analysisHeading: 'Evaluación de Impacto',
    analysis:
      'La actividad legislativa actual refleja las prioridades del Parlamento en finanzas sostenibles, gobernanza digital y política ambiental.',
    pipelineHealthLabel: 'Salud del Pipeline',
    throughputRateLabel: 'Tasa de Rendimiento',
    whyThisMatters:
      'Estas propuestas legislativas afectan directamente a los ciudadanos europeos — desde costes energéticos hasta derechos digitales. Comprender el pipeline ayuda a los interesados a anticipar los próximos cambios normativos.',
  },
  nl: {
    lede: 'Het Europees Parlement behandelt actief meerdere wetgevende voorstellen op belangrijke beleidsterreinen.',
    proposalsHeading: 'Recente Wetgevingsprocedures',
    adoptedTextsHeading: 'Recent Aangenomen Teksten',
    pipelineHeading: 'Overzicht van de Wetgevende Pipeline',
    procedureHeading: 'Procedurestatus',
    analysisHeading: 'Impactbeoordeling',
    analysis:
      'De huidige wetgevende activiteit weerspiegelt de prioriteiten van het Parlement op het gebied van duurzame financiering, digitaal bestuur en milieubeleid.',
    pipelineHealthLabel: 'Pipeline-gezondheid',
    throughputRateLabel: 'Doorvoersnelheid',
    whyThisMatters:
      'Deze wetgevingsvoorstellen raken EU-burgers direct — van energiekosten tot digitale rechten. Inzicht in de pipeline helpt belanghebbenden toekomstige regelgevingswijzigingen te anticiperen.',
  },
  ar: {
    lede: 'يقوم البرلمان الأوروبي بمعالجة العديد من المقترحات التشريعية في مجالات السياسة الرئيسية.',
    proposalsHeading: 'الإجراءات التشريعية الأخيرة',
    adoptedTextsHeading: 'النصوص المعتمدة مؤخراً',
    pipelineHeading: 'نظرة عامة على خط الأنابيب التشريعي',
    procedureHeading: 'حالة الإجراء',
    analysisHeading: 'تقييم الأثر',
    analysis:
      'يعكس النشاط التشريعي الحالي أولويات البرلمان في التمويل المستدام والحوكمة الرقمية والسياسة البيئية.',
    pipelineHealthLabel: 'صحة خط الأنابيب',
    throughputRateLabel: 'معدل الإنتاجية',
    whyThisMatters:
      'تؤثر هذه المقترحات التشريعية مباشرة على مواطني الاتحاد الأوروبي — من تكاليف الطاقة إلى الحقوق الرقمية. يساعد فهم خط الأنابيب أصحاب المصلحة على توقع التغييرات التنظيمية القادمة.',
  },
  he: {
    lede: 'הפרלמנט האירופי מעבד באופן פעיל הצעות חקיקה מרובות בתחומי מדיניות מרכזיים.',
    proposalsHeading: 'הליכי חקיקה אחרונים',
    adoptedTextsHeading: 'טקסטים שאומצו לאחרונה',
    pipelineHeading: 'סקירת צינור החקיקה',
    procedureHeading: 'מצב ההליך',
    analysisHeading: 'הערכת השפעה',
    analysis:
      'הפעילות החקיקתית הנוכחית משקפת את סדרי העדיפויות של הפרלמנט במימון בר-קיימא, ממשל דיגיטלי ומדיניות סביבתית.',
    pipelineHealthLabel: 'בריאות הצינור',
    throughputRateLabel: 'קצב תפוקה',
    whyThisMatters:
      'הצעות חקיקה אלו משפיעות ישירות על אזרחי האיחוד האירופי — מעלויות אנרגיה ועד לזכויות דיגיטליות. הבנת הצינור מסייעת לבעלי עניין לצפות שינויים רגולטוריים עתידיים.',
  },
  ja: {
    lede: '欧州議会は主要な政策分野にわたる複数の法案提案を積極的に処理しています。',
    proposalsHeading: '最近の立法手続き',
    adoptedTextsHeading: '最近採択されたテキスト',
    pipelineHeading: '立法パイプライン概要',
    procedureHeading: '手続き状況',
    analysisHeading: '影響評価',
    analysis:
      '現在の立法活動は、持続可能な金融、デジタルガバナンス、環境政策における議会の優先事項を反映しています。',
    pipelineHealthLabel: 'パイプライン健全性',
    throughputRateLabel: 'スループット率',
    whyThisMatters:
      'これらの法案提案はEU市民に直接影響します — エネルギーコストからデジタル権利まで。パイプラインを理解することで、利害関係者は今後の規制変更を予測できます。',
  },
  ko: {
    lede: '유럽 의회는 주요 정책 분야에 걸쳐 다수의 입법 제안을 적극적으로 처리하고 있습니다.',
    proposalsHeading: '최근 입법 절차',
    adoptedTextsHeading: '최근 채택된 텍스트',
    pipelineHeading: '입법 파이프라인 개요',
    procedureHeading: '절차 상태',
    analysisHeading: '영향 평가',
    analysis:
      '현재 입법 활동은 지속 가능한 금융, 디지털 거버넌스 및 환경 정책에서 의회의 우선순위를 반영합니다.',
    pipelineHealthLabel: '파이프라인 건전성',
    throughputRateLabel: '처리율',
    whyThisMatters:
      '이러한 입법 제안은 에너지 비용부터 디지털 권리까지 EU 시민에게 직접적인 영향을 미칩니다. 파이프라인을 이해하면 이해관계자들이 향후 규제 변화를 예측하는 데 도움이 됩니다.',
  },
  zh: {
    lede: '欧洲议会正在积极处理多项关键政策领域的立法提案。',
    proposalsHeading: '最近的立法程序',
    adoptedTextsHeading: '最近通过的文本',
    pipelineHeading: '立法管道概述',
    procedureHeading: '程序状态',
    analysisHeading: '影响评估',
    analysis: '当前的立法活动反映了议会在可持续金融、数字治理和环境政策方面的优先事项。',
    pipelineHealthLabel: '管道健康',
    throughputRateLabel: '吞吐率',
    whyThisMatters:
      '这些立法提案直接影响欧盟公民——从能源成本到数字权利。了解管道有助于利益相关者预测即将到来的监管变化。',
  },
};

/** Shared editorial strings used across article types for journalistic framing */
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
export const DEEP_ANALYSIS_STRINGS: LanguageMap<DeepAnalysisStrings> = {
  en: {
    sectionHeading: 'Deep Political Analysis',
    whatHeading: 'What Happened',
    whoHeading: 'Key Actors',
    whenHeading: 'Timeline',
    whyHeading: 'Why It Matters — Root Causes',
    stakeholderHeading: 'Winners & Losers',
    winnerLabel: 'Winner',
    loserLabel: 'Loser',
    neutralLabel: 'Neutral',
    impactHeading: 'Impact Assessment',
    politicalLabel: 'Political',
    economicLabel: 'Economic',
    socialLabel: 'Social',
    legalLabel: 'Legal',
    geopoliticalLabel: 'Geopolitical',
    consequencesHeading: 'Actions → Consequences',
    actionLabel: 'Action',
    consequenceLabel: 'Consequence',
    severityColumnLabel: 'Severity',
    mistakesHeading: 'Miscalculations & Missed Opportunities',
    alternativeLabel: 'Should have',
    outlookHeading: 'Strategic Outlook',
    severityLow: 'Low',
    severityMedium: 'Medium',
    severityHigh: 'High',
    severityCritical: 'Critical',
    /* eslint-disable sonarjs/no-duplicate-string -- EN fallback values repeated across all 14 language entries */
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
    /* eslint-enable sonarjs/no-duplicate-string */
  },
  sv: {
    sectionHeading: 'Fördjupad Politisk Analys',
    whatHeading: 'Vad Hände',
    whoHeading: 'Nyckelaktörer',
    whenHeading: 'Tidslinje',
    whyHeading: 'Varför Det Spelar Roll — Grundorsaker',
    stakeholderHeading: 'Vinnare & Förlorare',
    winnerLabel: 'Vinnare',
    loserLabel: 'Förlorare',
    neutralLabel: 'Neutral',
    impactHeading: 'Konsekvensbedömning',
    politicalLabel: 'Politisk',
    economicLabel: 'Ekonomisk',
    socialLabel: 'Social',
    legalLabel: 'Juridisk',
    geopoliticalLabel: 'Geopolitisk',
    consequencesHeading: 'Åtgärder → Konsekvenser',
    actionLabel: 'Åtgärd',
    consequenceLabel: 'Konsekvens',
    severityColumnLabel: 'Allvarlighetsgrad',
    mistakesHeading: 'Felbedömningar & Missade Möjligheter',
    alternativeLabel: 'Borde ha',
    outlookHeading: 'Strategisk Utsikt',
    severityLow: 'Låg',
    severityMedium: 'Medel',
    severityHigh: 'Hög',
    severityCritical: 'Kritisk',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  da: {
    sectionHeading: 'Dybdegående Politisk Analyse',
    whatHeading: 'Hvad Skete',
    whoHeading: 'Nøgleaktører',
    whenHeading: 'Tidslinje',
    whyHeading: 'Hvorfor Det Betyder Noget — Grundårsager',
    stakeholderHeading: 'Vindere & Tabere',
    winnerLabel: 'Vinder',
    loserLabel: 'Taber',
    neutralLabel: 'Neutral',
    impactHeading: 'Konsekvensvurdering',
    politicalLabel: 'Politisk',
    economicLabel: 'Økonomisk',
    socialLabel: 'Social',
    legalLabel: 'Juridisk',
    geopoliticalLabel: 'Geopolitisk',
    consequencesHeading: 'Handlinger → Konsekvenser',
    actionLabel: 'Handling',
    consequenceLabel: 'Konsekvens',
    severityColumnLabel: 'Alvorlighed',
    mistakesHeading: 'Fejlvurderinger & Forpassede Muligheder',
    alternativeLabel: 'Burde have',
    outlookHeading: 'Strategisk Udsigt',
    severityLow: 'Lav',
    severityMedium: 'Middel',
    severityHigh: 'Høj',
    severityCritical: 'Kritisk',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  no: {
    sectionHeading: 'Dyptgående Politisk Analyse',
    whatHeading: 'Hva Skjedde',
    whoHeading: 'Nøkkelaktører',
    whenHeading: 'Tidslinje',
    whyHeading: 'Hvorfor Det Betyr Noe — Grunnårsaker',
    stakeholderHeading: 'Vinnere & Tapere',
    winnerLabel: 'Vinner',
    loserLabel: 'Taper',
    neutralLabel: 'Nøytral',
    impactHeading: 'Konsekvensutredning',
    politicalLabel: 'Politisk',
    economicLabel: 'Økonomisk',
    socialLabel: 'Sosial',
    legalLabel: 'Juridisk',
    geopoliticalLabel: 'Geopolitisk',
    consequencesHeading: 'Handlinger → Konsekvenser',
    actionLabel: 'Handling',
    consequenceLabel: 'Konsekvens',
    severityColumnLabel: 'Alvorlighetsgrad',
    mistakesHeading: 'Feilberegninger & Tapte Muligheter',
    alternativeLabel: 'Burde ha',
    outlookHeading: 'Strategisk Utsikt',
    severityLow: 'Lav',
    severityMedium: 'Middels',
    severityHigh: 'Høy',
    severityCritical: 'Kritisk',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  fi: {
    sectionHeading: 'Syvällinen Poliittinen Analyysi',
    whatHeading: 'Mitä Tapahtui',
    whoHeading: 'Keskeiset Toimijat',
    whenHeading: 'Aikajana',
    whyHeading: 'Miksi Sillä On Merkitystä — Juurisyyt',
    stakeholderHeading: 'Voittajat & Häviäjät',
    winnerLabel: 'Voittaja',
    loserLabel: 'Häviäjä',
    neutralLabel: 'Neutraali',
    impactHeading: 'Vaikutusarviointi',
    politicalLabel: 'Poliittinen',
    economicLabel: 'Taloudellinen',
    socialLabel: 'Sosiaalinen',
    legalLabel: 'Oikeudellinen',
    geopoliticalLabel: 'Geopoliittinen',
    consequencesHeading: 'Toimet → Seuraukset',
    actionLabel: 'Toimi',
    consequenceLabel: 'Seuraus',
    severityColumnLabel: 'Vakavuus',
    mistakesHeading: 'Virhearvioinnit & Menetetyt Mahdollisuudet',
    alternativeLabel: 'Olisi pitänyt',
    outlookHeading: 'Strategiset Näkymät',
    severityLow: 'Matala',
    severityMedium: 'Keskitaso',
    severityHigh: 'Korkea',
    severityCritical: 'Kriittinen',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  de: {
    sectionHeading: 'Vertiefte Politische Analyse',
    whatHeading: 'Was Geschah',
    whoHeading: 'Schlüsselakteure',
    whenHeading: 'Zeitachse',
    whyHeading: 'Warum Es Wichtig Ist — Grundursachen',
    stakeholderHeading: 'Gewinner & Verlierer',
    winnerLabel: 'Gewinner',
    loserLabel: 'Verlierer',
    neutralLabel: 'Neutral',
    impactHeading: 'Folgenabschätzung',
    politicalLabel: 'Politisch',
    economicLabel: 'Wirtschaftlich',
    socialLabel: 'Sozial',
    legalLabel: 'Rechtlich',
    geopoliticalLabel: 'Geopolitisch',
    consequencesHeading: 'Handlungen → Konsequenzen',
    actionLabel: 'Handlung',
    consequenceLabel: 'Konsequenz',
    severityColumnLabel: 'Schweregrad',
    mistakesHeading: 'Fehleinschätzungen & Verpasste Chancen',
    alternativeLabel: 'Hätte sollen',
    outlookHeading: 'Strategischer Ausblick',
    severityLow: 'Niedrig',
    severityMedium: 'Mittel',
    severityHigh: 'Hoch',
    severityCritical: 'Kritisch',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  fr: {
    sectionHeading: 'Analyse Politique Approfondie',
    whatHeading: "Ce Qui S'est Passé",
    whoHeading: 'Acteurs Clés',
    whenHeading: 'Chronologie',
    whyHeading: "Pourquoi C'est Important — Causes Profondes",
    stakeholderHeading: 'Gagnants & Perdants',
    winnerLabel: 'Gagnant',
    loserLabel: 'Perdant',
    neutralLabel: 'Neutre',
    impactHeading: "Évaluation d'Impact",
    politicalLabel: 'Politique',
    economicLabel: 'Économique',
    socialLabel: 'Social',
    legalLabel: 'Juridique',
    geopoliticalLabel: 'Géopolitique',
    consequencesHeading: 'Actions → Conséquences',
    actionLabel: 'Action',
    consequenceLabel: 'Conséquence',
    severityColumnLabel: 'Gravité',
    mistakesHeading: 'Erreurs de Calcul & Opportunités Manquées',
    alternativeLabel: 'Aurait dû',
    outlookHeading: 'Perspectives Stratégiques',
    severityLow: 'Faible',
    severityMedium: 'Moyen',
    severityHigh: 'Élevé',
    severityCritical: 'Critique',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  es: {
    sectionHeading: 'Análisis Político Profundo',
    whatHeading: 'Qué Ocurrió',
    whoHeading: 'Actores Clave',
    whenHeading: 'Cronología',
    whyHeading: 'Por Qué Importa — Causas Raíz',
    stakeholderHeading: 'Ganadores & Perdedores',
    winnerLabel: 'Ganador',
    loserLabel: 'Perdedor',
    neutralLabel: 'Neutral',
    impactHeading: 'Evaluación de Impacto',
    politicalLabel: 'Político',
    economicLabel: 'Económico',
    socialLabel: 'Social',
    legalLabel: 'Jurídico',
    geopoliticalLabel: 'Geopolítico',
    consequencesHeading: 'Acciones → Consecuencias',
    actionLabel: 'Acción',
    consequenceLabel: 'Consecuencia',
    severityColumnLabel: 'Gravedad',
    mistakesHeading: 'Errores de Cálculo & Oportunidades Perdidas',
    alternativeLabel: 'Debería haber',
    outlookHeading: 'Perspectivas Estratégicas',
    severityLow: 'Bajo',
    severityMedium: 'Medio',
    severityHigh: 'Alto',
    severityCritical: 'Crítico',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  nl: {
    sectionHeading: 'Diepgaande Politieke Analyse',
    whatHeading: 'Wat er Gebeurde',
    whoHeading: 'Belangrijkste Actoren',
    whenHeading: 'Tijdlijn',
    whyHeading: 'Waarom Het Belangrijk Is — Grondoorzaken',
    stakeholderHeading: 'Winnaars & Verliezers',
    winnerLabel: 'Winnaar',
    loserLabel: 'Verliezer',
    neutralLabel: 'Neutraal',
    impactHeading: 'Impactbeoordeling',
    politicalLabel: 'Politiek',
    economicLabel: 'Economisch',
    socialLabel: 'Sociaal',
    legalLabel: 'Juridisch',
    geopoliticalLabel: 'Geopolitiek',
    consequencesHeading: 'Acties → Gevolgen',
    actionLabel: 'Actie',
    consequenceLabel: 'Gevolg',
    severityColumnLabel: 'Ernst',
    mistakesHeading: 'Misrekeningen & Gemiste Kansen',
    alternativeLabel: 'Had moeten',
    outlookHeading: 'Strategisch Vooruitzicht',
    severityLow: 'Laag',
    severityMedium: 'Gemiddeld',
    severityHigh: 'Hoog',
    severityCritical: 'Kritiek',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  ar: {
    sectionHeading: 'تحليل سياسي معمّق',
    whatHeading: 'ماذا حدث',
    whoHeading: 'الجهات الفاعلة الرئيسية',
    whenHeading: 'الجدول الزمني',
    whyHeading: 'لماذا هذا مهم — الأسباب الجذرية',
    stakeholderHeading: 'الرابحون والخاسرون',
    winnerLabel: 'رابح',
    loserLabel: 'خاسر',
    neutralLabel: 'محايد',
    impactHeading: 'تقييم الأثر',
    politicalLabel: 'سياسي',
    economicLabel: 'اقتصادي',
    socialLabel: 'اجتماعي',
    legalLabel: 'قانوني',
    geopoliticalLabel: 'جيوسياسي',
    consequencesHeading: 'إجراءات ← عواقب',
    actionLabel: 'إجراء',
    consequenceLabel: 'عاقبة',
    severityColumnLabel: 'شدة',
    mistakesHeading: 'أخطاء في الحسابات وفرص ضائعة',
    alternativeLabel: 'كان ينبغي',
    outlookHeading: 'النظرة الاستراتيجية',
    severityLow: 'منخفض',
    severityMedium: 'متوسط',
    severityHigh: 'مرتفع',
    severityCritical: 'حرج',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  he: {
    sectionHeading: 'ניתוח פוליטי מעמיק',
    whatHeading: 'מה קרה',
    whoHeading: 'שחקנים מרכזיים',
    whenHeading: 'ציר זמן',
    whyHeading: 'מדוע זה חשוב — סיבות שורש',
    stakeholderHeading: 'מרוויחים ומפסידים',
    winnerLabel: 'מרוויח',
    loserLabel: 'מפסיד',
    neutralLabel: 'ניטרלי',
    impactHeading: 'הערכת השפעה',
    politicalLabel: 'פוליטי',
    economicLabel: 'כלכלי',
    socialLabel: 'חברתי',
    legalLabel: 'משפטי',
    geopoliticalLabel: 'גיאופוליטי',
    consequencesHeading: 'פעולות ← השלכות',
    actionLabel: 'פעולה',
    consequenceLabel: 'השלכה',
    severityColumnLabel: 'חומרה',
    mistakesHeading: 'טעויות חישוב והזדמנויות שהוחמצו',
    alternativeLabel: 'היה צריך',
    outlookHeading: 'תחזית אסטרטגית',
    severityLow: 'נמוך',
    severityMedium: 'בינוני',
    severityHigh: 'גבוה',
    severityCritical: 'קריטי',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  ja: {
    sectionHeading: '深層政治分析',
    whatHeading: '何が起きたか',
    whoHeading: '主要関係者',
    whenHeading: 'タイムライン',
    whyHeading: 'なぜ重要か — 根本原因',
    stakeholderHeading: '勝者と敗者',
    winnerLabel: '勝者',
    loserLabel: '敗者',
    neutralLabel: '中立',
    impactHeading: '影響評価',
    politicalLabel: '政治的',
    economicLabel: '経済的',
    socialLabel: '社会的',
    legalLabel: '法的',
    geopoliticalLabel: '地政学的',
    consequencesHeading: '行動 → 結果',
    actionLabel: '行動',
    consequenceLabel: '結果',
    severityColumnLabel: '重大度',
    mistakesHeading: '誤算と逃した機会',
    alternativeLabel: 'すべきだった',
    outlookHeading: '戦略的展望',
    severityLow: '低',
    severityMedium: '中',
    severityHigh: '高',
    severityCritical: '重大',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  ko: {
    sectionHeading: '심층 정치 분석',
    whatHeading: '무엇이 일어났는가',
    whoHeading: '주요 행위자',
    whenHeading: '타임라인',
    whyHeading: '왜 중요한가 — 근본 원인',
    stakeholderHeading: '승자와 패자',
    winnerLabel: '승자',
    loserLabel: '패자',
    neutralLabel: '중립',
    impactHeading: '영향 평가',
    politicalLabel: '정치적',
    economicLabel: '경제적',
    socialLabel: '사회적',
    legalLabel: '법적',
    geopoliticalLabel: '지정학적',
    consequencesHeading: '행동 → 결과',
    actionLabel: '행동',
    consequenceLabel: '결과',
    severityColumnLabel: '심각도',
    mistakesHeading: '오판과 놓친 기회',
    alternativeLabel: '했어야 했다',
    outlookHeading: '전략적 전망',
    severityLow: '낮음',
    severityMedium: '보통',
    severityHigh: '높음',
    severityCritical: '위기',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
  zh: {
    sectionHeading: '深度政治分析',
    whatHeading: '发生了什么',
    whoHeading: '关键参与者',
    whenHeading: '时间线',
    whyHeading: '为何重要 — 根本原因',
    stakeholderHeading: '赢家与输家',
    winnerLabel: '赢家',
    loserLabel: '输家',
    neutralLabel: '中立',
    impactHeading: '影响评估',
    politicalLabel: '政治',
    economicLabel: '经济',
    socialLabel: '社会',
    legalLabel: '法律',
    geopoliticalLabel: '地缘政治',
    consequencesHeading: '行动 → 后果',
    actionLabel: '行动',
    consequenceLabel: '后果',
    severityColumnLabel: '严重程度',
    mistakesHeading: '误判与错失机会',
    alternativeLabel: '本应',
    outlookHeading: '战略展望',
    severityLow: '低',
    severityMedium: '中',
    severityHigh: '高',
    severityCritical: '严重',
    executiveSummaryHeading: 'Executive Summary',
    confidenceHigh: 'High Confidence',
    confidenceMedium: 'Medium Confidence',
    confidenceLow: 'Low Confidence',
    evidenceRefsHeading: 'Evidence',
    counterArgumentsHeading: 'Counter-arguments',
    conclusionLabel: 'Conclusion:',
    premiseLabel: 'Premise:',
    inferenceLabel: 'Inference:',
    reasoningChainsHeading: 'Reasoning Chains',
    scenarioPlanningHeading: 'Scenario Planning',
    bestCaseLabel: 'Best Case',
    worstCaseLabel: 'Worst Case',
    mostLikelyLabel: 'Most Likely',
    wildcardsLabel: 'Wildcards',
    probabilityLabel: 'Probability',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Implied Impacts',
    timelineLabel: 'Timeline',
    analysisMethodologyHeading: 'Analysis Methodology',
    iterationCountLabel: 'Iterations',
    evidenceStrengthLabel: 'Evidence Strength',
    evidenceStrong: 'Strong',
    evidenceModerate: 'Moderate',
    evidenceWeak: 'Weak',
    iterationInitial: 'Initial Assessment',
    iterationStakeholderChallenge: 'Stakeholder Challenge',
    iterationEvidenceValidation: 'Evidence Validation',
    iterationSynthesis: 'Synthesis',
  },
};

/** Localized section heading strings for motions articles */
export const MOTIONS_STRINGS: LanguageMap<MotionsStrings> = {
  en: {
    lede: 'Recent parliamentary activities reveal key voting patterns, party cohesion trends, and notable political dynamics in the European Parliament.',
    votingRecordsHeading: 'Recent Voting Records',
    partyCohesionHeading: 'Party Cohesion Analysis',
    anomaliesHeading: 'Detected Voting Anomalies',
    questionsHeading: 'Recent Parliamentary Questions',
    dateLabel: 'Date',
    resultLabel: 'Result',
    forLabel: 'For',
    againstLabel: 'Against',
    abstainLabel: 'Abstain',
    cohesionLabel: 'Cohesion',
    participationLabel: 'Participation',
    severityLabel: 'Severity',
    statusLabel: 'Status',
    keyTakeawayText:
      'Voting records and party cohesion data reveal political alignment across the European Parliament, helping citizens understand how their elected representatives make legislative decisions.',
    politicalAlignmentHeading: 'Political Alignment',
    ledeAnalysis:
      'analysis of voting records from {DATE_FROM} to {DATE_TO} provides insights into legislative decision-making and party discipline.',
  },
  sv: {
    lede: 'Senaste parlamentariska aktiviteter avslöjar viktiga röstmönster, partikohesionstrender och anmärkningsvärda politiska dynamiker i Europaparlamentet.',
    votingRecordsHeading: 'Senaste Omröstningsresultat',
    partyCohesionHeading: 'Analys av Partikohesion',
    anomaliesHeading: 'Upptäckta Omröstningsanomalier',
    questionsHeading: 'Senaste Parlamentariska Frågor',
    dateLabel: 'Datum',
    resultLabel: 'Resultat',
    forLabel: 'För',
    againstLabel: 'Emot',
    abstainLabel: 'Avstår',
    cohesionLabel: 'Kohesion',
    participationLabel: 'Deltagande',
    severityLabel: 'Allvarlighetsgrad',
    statusLabel: 'Status',
    keyTakeawayText:
      'Omröstningsresultat och partikohesionsdata avslöjar politisk samstämmighet i Europaparlamentet och hjälper medborgare att förstå hur deras valda representanter fattar lagstiftningsbeslut.',
    politicalAlignmentHeading: 'Politisk Samstämmighet',
    ledeAnalysis:
      'analys av omröstningsprotokoll från {DATE_FROM} till {DATE_TO} ger insikter om lagstiftningsbeslut och partidisciplin.',
  },
  da: {
    lede: 'Seneste parlamentariske aktiviteter afslører vigtige afstemningmønstre, partikohæsionstendenser og bemærkelsesværdige politiske dynamikker i Europa-Parlamentet.',
    votingRecordsHeading: 'Seneste Afstemningsresultater',
    partyCohesionHeading: 'Analyse af Partikohæsion',
    anomaliesHeading: 'Opdagede Afstemningsanomalier',
    questionsHeading: 'Seneste Parlamentariske Spørgsmål',
    dateLabel: 'Dato',
    resultLabel: 'Resultat',
    forLabel: 'For',
    againstLabel: 'Imod',
    abstainLabel: 'Undlader',
    cohesionLabel: 'Kohæsion',
    participationLabel: 'Deltagelse',
    severityLabel: 'Alvorlighed',
    statusLabel: 'Status',
    keyTakeawayText:
      'Afstemningsresultater og partikohæsionsdata afslører politisk tilpasning i Europa-Parlamentet og hjælper borgere med at forstå, hvordan deres valgte repræsentanter træffer lovgivningsbeslutninger.',
    politicalAlignmentHeading: 'Politisk Tilpasning',
    ledeAnalysis:
      'analyse af afstemningsoptegnelser fra {DATE_FROM} til {DATE_TO} giver indsigt i lovgivningsmæssig beslutningstagning og partidisciplin.',
  },
  no: {
    lede: 'Nylige parlamentariske aktiviteter avslører viktige avstemningsmønstre, partikohesjonstrender og bemerkelsesverdige politiske dynamikker i Europaparlamentet.',
    votingRecordsHeading: 'Siste Avstemningsresultater',
    partyCohesionHeading: 'Analyse av Partikohesjon',
    anomaliesHeading: 'Oppdagede Avstemningsavvik',
    questionsHeading: 'Siste Parlamentariske Spørsmål',
    dateLabel: 'Dato',
    resultLabel: 'Resultat',
    forLabel: 'For',
    againstLabel: 'Mot',
    abstainLabel: 'Avstår',
    cohesionLabel: 'Kohesjon',
    participationLabel: 'Deltakelse',
    severityLabel: 'Alvorlighetsgrad',
    statusLabel: 'Status',
    keyTakeawayText:
      'Avstemningsresultater og partikohesjonsdata avslører politisk samsvar i Europaparlamentet og hjelper borgere med å forstå hvordan deres valgte representanter tar lovgivningsbeslutninger.',
    politicalAlignmentHeading: 'Politisk Samsvar',
    ledeAnalysis:
      'analyse av avstemningsregistreringer fra {DATE_FROM} til {DATE_TO} gir innsikt i lovgivningsmessig beslutningstaking og partidisiplin.',
  },
  fi: {
    lede: 'Viimeaikaiset parlamentaariset toimet paljastavat keskeisiä äänestyskuvioita, puoluekohesiotrendejä ja merkittäviä poliittisia dynamiikkoja Euroopan parlamentissa.',
    votingRecordsHeading: 'Viimeisimmät Äänestystulokset',
    partyCohesionHeading: 'Puoluekohesion Analyysi',
    anomaliesHeading: 'Havaitut Äänestyspoikkeamat',
    questionsHeading: 'Viimeisimmät Parlamentaariset Kysymykset',
    dateLabel: 'Päivämäärä',
    resultLabel: 'Tulos',
    forLabel: 'Puolesta',
    againstLabel: 'Vastaan',
    abstainLabel: 'Tyhjä',
    cohesionLabel: 'Koheesio',
    participationLabel: 'Osallistuminen',
    severityLabel: 'Vakavuus',
    statusLabel: 'Tila',
    keyTakeawayText:
      'Äänestystulokset ja puoluekohesiotiedot paljastavat poliittisen linjauksen Euroopan parlamentissa ja auttavat kansalaisia ymmärtämään, miten heidän valitsemansa edustajat tekevät lainsäädäntöpäätöksiä.',
    politicalAlignmentHeading: 'Poliittinen Linjaus',
    ledeAnalysis:
      'äänestysasiakirjojen analyysi ajalta {DATE_FROM} – {DATE_TO} antaa näkemyksiä lainsäädäntöpäätöksistä ja puoluedisipliinistä.',
  },
  de: {
    lede: 'Jüngste parlamentarische Aktivitäten zeigen wichtige Abstimmungsmuster, Fraktionskohäsionstrends und bemerkenswerte politische Dynamiken im Europäischen Parlament.',
    votingRecordsHeading: 'Aktuelle Abstimmungsergebnisse',
    partyCohesionHeading: 'Analyse der Fraktionskohäsion',
    anomaliesHeading: 'Erkannte Abstimmungsanomalien',
    questionsHeading: 'Aktuelle Parlamentarische Anfragen',
    dateLabel: 'Datum',
    resultLabel: 'Ergebnis',
    forLabel: 'Dafür',
    againstLabel: 'Dagegen',
    abstainLabel: 'Enthaltung',
    cohesionLabel: 'Kohäsion',
    participationLabel: 'Beteiligung',
    severityLabel: 'Schweregrad',
    statusLabel: 'Status',
    keyTakeawayText:
      'Abstimmungsergebnisse und Fraktionskohäsionsdaten zeigen die politische Ausrichtung im Europäischen Parlament und helfen den Bürgern zu verstehen, wie ihre gewählten Vertreter Gesetzgebungsentscheidungen treffen.',
    politicalAlignmentHeading: 'Politische Ausrichtung',
    ledeAnalysis:
      'Analyse der Abstimmungsunterlagen vom {DATE_FROM} bis {DATE_TO} bietet Einblicke in die gesetzgeberische Entscheidungsfindung und Parteidisziplin.',
  },
  fr: {
    lede: 'Les activités parlementaires récentes révèlent des schémas de vote clés, des tendances de cohésion des groupes politiques et des dynamiques politiques notables au Parlement européen.',
    votingRecordsHeading: 'Résultats de Vote Récents',
    partyCohesionHeading: 'Analyse de Cohésion des Groupes',
    anomaliesHeading: 'Anomalies de Vote Détectées',
    questionsHeading: 'Questions Parlementaires Récentes',
    dateLabel: 'Date',
    resultLabel: 'Résultat',
    forLabel: 'Pour',
    againstLabel: 'Contre',
    abstainLabel: 'Abstention',
    cohesionLabel: 'Cohésion',
    participationLabel: 'Participation',
    severityLabel: 'Gravité',
    statusLabel: 'Statut',
    keyTakeawayText:
      "Les résultats de vote et les données de cohésion des groupes révèlent l'alignement politique au Parlement européen, aidant les citoyens à comprendre comment leurs représentants élus prennent des décisions législatives.",
    politicalAlignmentHeading: 'Alignement Politique',
    ledeAnalysis:
      "l'analyse des résultats de vote du {DATE_FROM} au {DATE_TO} fournit des informations sur la prise de décision législative et la discipline de parti.",
  },
  es: {
    lede: 'Las actividades parlamentarias recientes revelan patrones de votación clave, tendencias de cohesión de grupos políticos y dinámicas políticas notables en el Parlamento Europeo.',
    votingRecordsHeading: 'Resultados de Votación Recientes',
    partyCohesionHeading: 'Análisis de Cohesión de Grupos',
    anomaliesHeading: 'Anomalías de Votación Detectadas',
    questionsHeading: 'Preguntas Parlamentarias Recientes',
    dateLabel: 'Fecha',
    resultLabel: 'Resultado',
    forLabel: 'A favor',
    againstLabel: 'En contra',
    abstainLabel: 'Abstención',
    cohesionLabel: 'Cohesión',
    participationLabel: 'Participación',
    severityLabel: 'Gravedad',
    statusLabel: 'Estado',
    keyTakeawayText:
      'Los resultados de votación y los datos de cohesión de grupos revelan la alineación política en el Parlamento Europeo, ayudando a los ciudadanos a comprender cómo sus representantes electos toman decisiones legislativas.',
    politicalAlignmentHeading: 'Alineación Política',
    ledeAnalysis:
      'el análisis de registros de votación del {DATE_FROM} al {DATE_TO} proporciona información sobre la toma de decisiones legislativas y la disciplina de partido.',
  },
  nl: {
    lede: 'Recente parlementaire activiteiten onthullen belangrijke stempatronen, fractiebindingtrends en opmerkelijke politieke dynamieken in het Europees Parlement.',
    votingRecordsHeading: 'Recente Stemresultaten',
    partyCohesionHeading: 'Analyse van Fractiebinding',
    anomaliesHeading: 'Gedetecteerde Stemanomalieën',
    questionsHeading: 'Recente Parlementaire Vragen',
    dateLabel: 'Datum',
    resultLabel: 'Resultaat',
    forLabel: 'Voor',
    againstLabel: 'Tegen',
    abstainLabel: 'Onthouding',
    cohesionLabel: 'Cohesie',
    participationLabel: 'Deelname',
    severityLabel: 'Ernst',
    statusLabel: 'Status',
    keyTakeawayText:
      'Stemresultaten en fractiebindingsgegevens onthullen de politieke afstemming in het Europees Parlement en helpen burgers te begrijpen hoe hun gekozen vertegenwoordigers wetgevingsbeslissingen nemen.',
    politicalAlignmentHeading: 'Politieke Afstemming',
    ledeAnalysis:
      'analyse van stemmingsregistraties van {DATE_FROM} tot {DATE_TO} geeft inzicht in wetgevende besluitvorming en partijdiscipline.',
  },
  ar: {
    lede: 'تكشف الأنشطة البرلمانية الأخيرة أنماط تصويت رئيسية واتجاهات تماسك الأحزاب وديناميات سياسية بارزة في البرلمان الأوروبي.',
    votingRecordsHeading: 'سجلات التصويت الأخيرة',
    partyCohesionHeading: 'تحليل تماسك الأحزاب',
    anomaliesHeading: 'شذوذ التصويت المكتشف',
    questionsHeading: 'الأسئلة البرلمانية الأخيرة',
    dateLabel: 'التاريخ',
    resultLabel: 'النتيجة',
    forLabel: 'مع',
    againstLabel: 'ضد',
    abstainLabel: 'امتناع',
    cohesionLabel: 'التماسك',
    participationLabel: 'المشاركة',
    severityLabel: 'الخطورة',
    statusLabel: 'الحالة',
    keyTakeawayText:
      'تكشف سجلات التصويت وبيانات تماسك الأحزاب التوافق السياسي في البرلمان الأوروبي، مما يساعد المواطنين على فهم كيفية اتخاذ ممثليهم المنتخبين للقرارات التشريعية.',
    politicalAlignmentHeading: 'التوافق السياسي',
    ledeAnalysis:
      'يوفر تحليل سجلات التصويت من {DATE_FROM} إلى {DATE_TO} رؤى حول صنع القرار التشريعي والانضباط الحزبي.',
  },
  he: {
    lede: 'פעילויות פרלמנטריות אחרונות חושפות דפוסי הצבעה מרכזיים, מגמות לכידות מפלגתית ודינמיקות פוליטיות בולטות בפרלמנט האירופי.',
    votingRecordsHeading: 'רשומות הצבעה אחרונות',
    partyCohesionHeading: 'ניתוח לכידות מפלגתית',
    anomaliesHeading: 'חריגות הצבעה שזוהו',
    questionsHeading: 'שאילתות פרלמנטריות אחרונות',
    dateLabel: 'תאריך',
    resultLabel: 'תוצאה',
    forLabel: 'בעד',
    againstLabel: 'נגד',
    abstainLabel: 'נמנע',
    cohesionLabel: 'לכידות',
    participationLabel: 'השתתפות',
    severityLabel: 'חומרה',
    statusLabel: 'סטטוס',
    keyTakeawayText:
      'רשומות הצבעה ונתוני לכידות מפלגתית חושפים את ההתאמה הפוליטית בפרלמנט האירופי, ומסייעים לאזרחים להבין כיצד נבחריהם מקבלים החלטות חקיקה.',
    politicalAlignmentHeading: 'התאמה פוליטית',
    ledeAnalysis:
      'ניתוח רשומות ההצבעה מ-{DATE_FROM} עד {DATE_TO} מספק תובנות על קבלת החלטות חקיקתיות ועל משמעת מפלגתית.',
  },
  ja: {
    lede: '最近の議会活動は、欧州議会における主要な投票パターン、政党結束の傾向、注目すべき政治的ダイナミクスを明らかにしています。',
    votingRecordsHeading: '最近の投票記録',
    partyCohesionHeading: '政党結束分析',
    anomaliesHeading: '検出された投票異常',
    questionsHeading: '最近の議会質問',
    dateLabel: '日付',
    resultLabel: '結果',
    forLabel: '賛成',
    againstLabel: '反対',
    abstainLabel: '棄権',
    cohesionLabel: '結束率',
    participationLabel: '参加率',
    severityLabel: '深刻度',
    statusLabel: 'ステータス',
    keyTakeawayText:
      '投票記録と政党結束データは、欧州議会における政治的連携を明らかにし、市民が選出された代表者がどのように立法上の決定を行うかを理解するのに役立ちます。',
    politicalAlignmentHeading: '政治的連携',
    ledeAnalysis:
      '{DATE_FROM}から{DATE_TO}までの投票記録の分析は、立法上の意思決定と政党規律に関する洞察を提供します。',
  },
  ko: {
    lede: '최근 의회 활동은 유럽 의회의 주요 투표 패턴, 정당 결속 동향 및 주목할 만한 정치적 역학을 보여줍니다.',
    votingRecordsHeading: '최근 투표 기록',
    partyCohesionHeading: '정당 결속 분석',
    anomaliesHeading: '감지된 투표 이상',
    questionsHeading: '최근 의회 질문',
    dateLabel: '날짜',
    resultLabel: '결과',
    forLabel: '찬성',
    againstLabel: '반대',
    abstainLabel: '기권',
    cohesionLabel: '결속률',
    participationLabel: '참여율',
    severityLabel: '심각도',
    statusLabel: '상태',
    keyTakeawayText:
      '투표 기록과 정당 결속 데이터는 유럽 의회의 정치적 정렬을 보여주며, 시민들이 선출된 대표자가 입법 결정을 내리는 방식을 이해하는 데 도움을 줍니다.',
    politicalAlignmentHeading: '정치적 정렬',
    ledeAnalysis:
      '{DATE_FROM}부터 {DATE_TO}까지의 투표 기록 분석은 입법 의사결정 및 정당 규율에 대한 통찰력을 제공합니다.',
  },
  zh: {
    lede: '最近的议会活动揭示了欧洲议会中的关键投票模式、政党凝聚力趋势和值得注意的政治动态。',
    votingRecordsHeading: '最近投票记录',
    partyCohesionHeading: '政党凝聚力分析',
    anomaliesHeading: '检测到的投票异常',
    questionsHeading: '最近议会质询',
    dateLabel: '日期',
    resultLabel: '结果',
    forLabel: '赞成',
    againstLabel: '反对',
    abstainLabel: '弃权',
    cohesionLabel: '凝聚力',
    participationLabel: '参与率',
    severityLabel: '严重程度',
    statusLabel: '状态',
    keyTakeawayText:
      '投票记录和政党凝聚力数据揭示了欧洲议会中的政治一致性，帮助公民了解其当选代表如何做出立法决定。',
    politicalAlignmentHeading: '政治一致性',
    ledeAnalysis: '对{DATE_FROM}至{DATE_TO}投票记录的分析为立法决策和政党纪律提供了见解。',
  },
};

/** Localized section heading strings for week-ahead articles */
export const WEEK_AHEAD_STRINGS: LanguageMap<WeekAheadStrings> = {
  en: {
    lede: 'The European Parliament prepares for an active week ahead with multiple committee meetings and plenary sessions scheduled',
    plenarySessions: 'Plenary Sessions',
    committeeMeetings: 'Committee Meetings',
    legislativeDocuments: 'Upcoming Legislative Documents',
    legislativePipeline: 'Legislative Pipeline',
    parliamentaryQuestions: 'Parliamentary Questions',
    noPlenary: 'No plenary sessions scheduled for this period.',
    bottleneckIndicator: '⚠ Bottleneck',
    whatToWatch: 'What to Watch',
  },
  sv: {
    lede: 'Europaparlamentet förbereder sig för en aktiv vecka framåt med flera utskottsmöten och plenarsammanträden planerade',
    plenarySessions: 'Plenarsammanträden',
    committeeMeetings: 'Utskottsmöten',
    legislativeDocuments: 'Kommande Lagstiftningsdokument',
    legislativePipeline: 'Lagstiftnings-Pipeline',
    parliamentaryQuestions: 'Parlamentariska Frågor',
    noPlenary: 'Inga plenarsammanträden planerade för denna period.',
    bottleneckIndicator: '⚠ Flaskhals',
    whatToWatch: 'Att Bevaka',
  },
  da: {
    lede: 'Europa-Parlamentet forbereder sig på en aktiv uge med flere udvalgsmøder og plenarforsamlinger planlagt',
    plenarySessions: 'Plenarforsamlinger',
    committeeMeetings: 'Udvalgsmøder',
    legislativeDocuments: 'Kommende Lovgivningsdokumenter',
    legislativePipeline: 'Lovgivningspipeline',
    parliamentaryQuestions: 'Parlamentariske Spørgsmål',
    noPlenary: 'Ingen plenarforsamlinger planlagt for denne periode.',
    bottleneckIndicator: '⚠ Flaskehals',
    whatToWatch: 'Hvad Man Skal Holde Øje Med',
  },
  no: {
    lede: 'Europaparlamentet forbereder seg på en aktiv uke fremover med flere komitémøter og plenarrsamlinger planlagt',
    plenarySessions: 'Plenarsamlinger',
    committeeMeetings: 'Komitémøter',
    legislativeDocuments: 'Kommende Lovgivningsdokumenter',
    legislativePipeline: 'Lovgivningspipeline',
    parliamentaryQuestions: 'Parlamentariske Spørsmål',
    noPlenary: 'Ingen plenarsamlinger planlagt for denne perioden.',
    bottleneckIndicator: '⚠ Flaskehals',
    whatToWatch: 'Hva Man Bør Følge Med På',
  },
  fi: {
    lede: 'Euroopan parlamentti valmistautuu aktiiviseen viikkoon useilla valiokuntakokouksilla ja täysistunnoilla suunnitelmissa',
    plenarySessions: 'Täysistunnot',
    committeeMeetings: 'Valiokuntakokoukset',
    legislativeDocuments: 'Tulevat Lainsäädäntöasiakirjat',
    legislativePipeline: 'Lainsäädäntöputki',
    parliamentaryQuestions: 'Parlamentaariset Kysymykset',
    noPlenary: 'Ei täysistuntoja suunniteltu tälle jaksolle.',
    bottleneckIndicator: '⚠ Pullonkaula',
    whatToWatch: 'Mitä Seurata',
  },
  de: {
    lede: 'Das Europäische Parlament bereitet sich auf eine aktive Woche mit mehreren Ausschusssitzungen und Plenarsitzungen vor',
    plenarySessions: 'Plenarsitzungen',
    committeeMeetings: 'Ausschusssitzungen',
    legislativeDocuments: 'Anstehende Gesetzgebungsdokumente',
    legislativePipeline: 'Gesetzgebungspipeline',
    parliamentaryQuestions: 'Parlamentarische Anfragen',
    noPlenary: 'Keine Plenarsitzungen für diesen Zeitraum geplant.',
    bottleneckIndicator: '⚠ Engpass',
    whatToWatch: 'Was Zu Beachten Ist',
  },
  fr: {
    lede: 'Le Parlement européen se prépare pour une semaine active avec plusieurs réunions de commission et sessions plénières programmées',
    plenarySessions: 'Sessions Plénières',
    committeeMeetings: 'Réunions de Commission',
    legislativeDocuments: 'Documents Législatifs à Venir',
    legislativePipeline: 'Pipeline Législatif',
    parliamentaryQuestions: 'Questions Parlementaires',
    noPlenary: 'Aucune session plénière prévue pour cette période.',
    bottleneckIndicator: "⚠ Goulot d'étranglement",
    whatToWatch: 'À Suivre',
  },
  es: {
    lede: 'El Parlamento Europeo se prepara para una semana activa con múltiples reuniones de comisión y sesiones plenarias programadas',
    plenarySessions: 'Sesiones Plenarias',
    committeeMeetings: 'Reuniones de Comisión',
    legislativeDocuments: 'Documentos Legislativos Próximos',
    legislativePipeline: 'Pipeline Legislativo',
    parliamentaryQuestions: 'Preguntas Parlamentarias',
    noPlenary: 'No hay sesiones plenarias programadas para este período.',
    bottleneckIndicator: '⚠ Cuello de botella',
    whatToWatch: 'Qué Observar',
  },
  nl: {
    lede: 'Het Europees Parlement bereidt zich voor op een actieve week met meerdere commissievergaderingen en plenaire vergaderingen gepland',
    plenarySessions: 'Plenaire Vergaderingen',
    committeeMeetings: 'Commissievergaderingen',
    legislativeDocuments: 'Aankomende Wetgevende Documenten',
    legislativePipeline: 'Wetgevende Pipeline',
    parliamentaryQuestions: 'Parlementaire Vragen',
    noPlenary: 'Geen plenaire vergaderingen gepland voor deze periode.',
    bottleneckIndicator: '⚠ Knelpunt',
    whatToWatch: 'Wat Te Volgen',
  },
  ar: {
    lede: 'يستعد البرلمان الأوروبي لأسبوع نشط مع العديد من اجتماعات اللجان والجلسات العامة المجدولة',
    plenarySessions: 'الجلسات العامة',
    committeeMeetings: 'اجتماعات اللجان',
    legislativeDocuments: 'الوثائق التشريعية القادمة',
    legislativePipeline: 'خط الأنابيب التشريعي',
    parliamentaryQuestions: 'الأسئلة البرلمانية',
    noPlenary: 'لا توجد جلسات عامة مجدولة لهذه الفترة.',
    bottleneckIndicator: '⚠ عنق زجاجة',
    whatToWatch: 'ما يجب متابعته',
  },
  he: {
    lede: 'הפרלמנט האירופי מתכונן לשבוע פעיל עם מספר ישיבות ועדות וישיבות מליאה מתוכננות',
    plenarySessions: 'ישיבות מליאה',
    committeeMeetings: 'ישיבות ועדות',
    legislativeDocuments: 'מסמכים חקיקתיים קרובים',
    legislativePipeline: 'צינור חקיקה',
    parliamentaryQuestions: 'שאילתות פרלמנטריות',
    noPlenary: 'אין ישיבות מליאה מתוכננות לתקופה זו.',
    bottleneckIndicator: '⚠ צוואר בקבוק',
    whatToWatch: 'מה לעקוב',
  },
  ja: {
    lede: '欧州議会は、複数の委員会会合と本会議が予定されている活発な一週間に備えています',
    plenarySessions: '本会議',
    committeeMeetings: '委員会会合',
    legislativeDocuments: '今後の立法文書',
    legislativePipeline: '立法パイプライン',
    parliamentaryQuestions: '議会質問',
    noPlenary: 'この期間に本会議は予定されていません。',
    bottleneckIndicator: '⚠ ボトルネック',
    whatToWatch: '注目すべきポイント',
  },
  ko: {
    lede: '유럽 의회는 다수의 위원회 회의와 본회의가 예정된 활발한 한 주를 준비하고 있습니다',
    plenarySessions: '본회의',
    committeeMeetings: '위원회 회의',
    legislativeDocuments: '예정된 입법 문서',
    legislativePipeline: '입법 파이프라인',
    parliamentaryQuestions: '의회 질문',
    noPlenary: '이 기간에 예정된 본회의가 없습니다.',
    bottleneckIndicator: '⚠ 병목 현상',
    whatToWatch: '주목할 사항',
  },
  zh: {
    lede: '欧洲议会正在为活跃的一周做准备，多场委员会会议和全体会议已排定日程',
    plenarySessions: '全体会议',
    committeeMeetings: '委员会会议',
    legislativeDocuments: '即将发布的立法文件',
    legislativePipeline: '立法管道',
    parliamentaryQuestions: '议会质询',
    noPlenary: '该时段没有预定的全体会议。',
    bottleneckIndicator: '⚠ 瓶颈',
    whatToWatch: '值得关注',
  },
};

/** Localized section heading strings for breaking news articles */
export const BREAKING_STRINGS: LanguageMap<BreakingStrings> = {
  en: {
    breakingBanner: '⚡ BREAKING',
    votingAnomalyIntel: 'Voting Anomaly Intelligence',
    coalitionDynamics: 'Coalition Dynamics Assessment',
    analyticalReport: 'Analytical Report',
    keyMEPInfluence: 'Key MEP Influence Analysis',
    intelligenceBriefing: 'Intelligence Briefing',
    votingAnomalyAlert: 'Voting Anomaly Alert',
    coalitionDynamicsSection: 'Coalition Dynamics',
    keyPlayers: 'Key Parliamentary Players',
    placeholderNotice:
      'This is placeholder content generated while the European Parliament MCP Server is unavailable. Live intelligence data will appear here when the server is connected.',
    placeholderLede:
      'Significant parliamentary developments are being monitored. Connect the European Parliament MCP Server to receive real-time intelligence on voting anomalies, coalition shifts, and MEP activities.',
    lede: 'Intelligence analysis from the European Parliament MCP Server has identified significant parliamentary developments requiring immediate attention',
    feedLede: 'The latest European Parliament feed data highlights recent parliamentary activity',
    adoptedTextsHeading: 'Recently Adopted Texts',
    recentEventsHeading: 'Recent Parliamentary Events',
    procedureUpdatesHeading: 'Legislative Procedure Updates',
    mepUpdatesHeading: 'MEP Updates',
    noFeedDataNotice: 'No recent feed data available from the European Parliament.',
    asOf: 'as of',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Breaking developments on ${date}: ${adopted} newly adopted texts, ${events} events, ${procedures} procedure updates, ${meps} MEP changes.`,
    breakingWhyAnomalies:
      'Voting anomalies and coalition shifts signal realignment of political forces within Parliament. These developments may alter the legislative calculus for pending files.',
    breakingWhyNormal:
      'Parliamentary activity reflects the ongoing legislative cycle. Adopted texts create binding EU law, while procedure updates indicate the trajectory of upcoming legislation.',
    breakingWinnerActor: 'Legislative Majority',
    breakingWinnerReasonFn: (count) =>
      `${count} legislative texts have been advanced through the parliamentary process.`,
    breakingNeutralActor: 'Opposition Groups',
    breakingNeutralReason:
      'Opposition groups are monitoring developments and may propose amendments in subsequent readings.',
    breakingOutlookActiveFn: (date) =>
      `Following the parliamentary session of ${date}, expect continued legislative momentum across key committees.`,
    breakingOutlookTransitionalFn: (date) =>
      `The parliamentary calendar following ${date} suggests a transitional period as committees rebalance legislative priorities.`,
    breakingLegalObligationsConsequence:
      'New legal obligations enter into force for EU member states and regulated entities.',
    breakingProcedureConsequence:
      'Legislative trajectory altered; upcoming committee votes and plenary sessions will be pivotal.',
    breakingImpactPoliticalAnomalies:
      'Unusual voting patterns suggest internal party tensions or cross-group negotiations on key dossiers.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} legislative texts reflect the current parliamentary majority's legislative priorities.`,
    breakingImpactEconomic:
      'New regulations may affect business operations, market access, and compliance costs across the EU.',
    breakingImpactSocial:
      "Legislative changes could affect citizens' rights, public services, and social standards across member states.",
    breakingImpactLegalFn: (count) =>
      `${count} new legal instruments create binding obligations for EU member states and stakeholders.`,
    breakingImpactGeopoliticalCoalition:
      'Coalition dynamics within the Parliament signal shifts in EU external policy positions and priorities.',
    breakingImpactGeopoliticalNormal:
      "Parliamentary decisions shape the EU's international standing and its relationships with third countries.",
    breakingMistakeActor: 'Political Group Whips',
    breakingMistakeDescription:
      'Risk of insufficient scrutiny of complex legislative texts in accelerated procedures.',
    breakingMistakeAlternative:
      'Extend committee deliberation periods and commission independent legal analysis for contentious provisions.',
    breakingAdoptedPrefix: 'Adopted:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      'Detailed voting anomaly analysis is currently unavailable due to technical limitations in the source data.',
    coalitionUnavailable:
      'Detailed coalition dynamics assessment cannot be displayed at this time as the necessary underlying data is temporarily unavailable.',
    adoptedTextTypeLabel: 'Adopted text',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Showing ${shown} of ${total}`,
  },
  sv: {
    breakingBanner: '⚡ SENASTE NYTT',
    votingAnomalyIntel: 'Röstningsanomalier — Underrättelseanalys',
    coalitionDynamics: 'Bedömning av Koalitionsdynamik',
    analyticalReport: 'Analytisk Rapport',
    keyMEPInfluence: 'Analys av Viktiga MEP-Inflytanden',
    intelligenceBriefing: 'Underrättelserapport',
    votingAnomalyAlert: 'Varning för Röstningsanomalier',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentariska Nyckelaktörer',
    placeholderNotice:
      'Detta är platshållarinnehåll genererat medan EU-parlamentets MCP-server är otillgänglig.',
    placeholderLede:
      'Betydande parlamentariska händelser övervakas. Anslut EU-parlamentets MCP-server för att ta emot realtidsinformation.',
    lede: 'Underrättelseanalys från EU-parlamentets MCP-server har identifierat betydande parlamentariska händelser som kräver omedelbar uppmärksamhet',
    feedLede: 'De senaste flödena från Europaparlamentet belyser aktuell parlamentarisk verksamhet',
    adoptedTextsHeading: 'Nyligen Antagna Texter',
    recentEventsHeading: 'Senaste Parlamentariska Händelser',
    procedureUpdatesHeading: 'Uppdateringar av Lagstiftningsförfaranden',
    mepUpdatesHeading: 'Uppdateringar om Ledamöter',
    noFeedDataNotice: 'Inga nya flödesdata tillgängliga från Europaparlamentet.',
    asOf: 'per',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Senaste händelserna ${date}: ${adopted} nyligen antagna texter, ${events} händelser, ${procedures} proceduruppdateringar, ${meps} MEP-ändringar.`,
    breakingWhyAnomalies:
      'Röstningsanomalier och koalitionsförändringar signalerar en omgruppering av politiska krafter inom parlamentet. Dessa händelser kan förändra den lagstiftande kalkylen för pågående ärenden.',
    breakingWhyNormal:
      'Parlamentarisk aktivitet återspeglar den pågående lagstiftningscykeln. Antagna texter skapar bindande EU-rätt, medan procedureruppdateringar indikerar riktningen för kommande lagstiftning.',
    breakingWinnerActor: 'Lagstiftande majoritet',
    breakingWinnerReasonFn: (count) =>
      `${count} lagstiftningstexter har drivits fram i den parlamentariska processen.`,
    breakingNeutralActor: 'Oppositionsgrupper',
    breakingNeutralReason:
      'Oppositionsgrupperna övervakar händelseutvecklingen och kan föreslå ändringar i efterföljande behandlingar.',
    breakingOutlookActiveFn: (date) =>
      `Efter den parlamentariska sessionen ${date} väntas fortsatt lagstiftningsdynamik i centrala utskott.`,
    breakingOutlookTransitionalFn: (date) =>
      `Den parlamentariska kalendern efter ${date} tyder på en övergångsperiod när utskotten ombalanserar lagstiftningsprioriteringarna.`,
    breakingLegalObligationsConsequence:
      'Nya rättsliga skyldigheter träder i kraft för EU:s medlemsstater och berörda aktörer.',
    breakingProcedureConsequence:
      'Lagstiftningsinriktningen förändras; kommande utskottsomröstningar och plenarsammanträden blir avgörande.',
    breakingImpactPoliticalAnomalies:
      'Ovanliga röstningsönster tyder på interna partispänningar eller förhandlingar mellan grupper om centrala ärenden.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} lagstiftningstexter återspeglar den nuvarande parlamentsmajoritetens lagstiftningsprioriteringar.`,
    breakingImpactEconomic:
      'Nya förordningar kan påverka företagsverksamhet, marknadstillträde och regelefterlevnadskostnader i EU.',
    breakingImpactSocial:
      'Lagändringar kan påverka medborgarnas rättigheter, offentliga tjänster och sociala standarder i medlemsstaterna.',
    breakingImpactLegalFn: (count) =>
      `${count} nya rättsliga instrument skapar bindande skyldigheter för EU:s medlemsstater och intressenter.`,
    breakingImpactGeopoliticalCoalition:
      'Koalitionsdynamiken inom parlamentet signalerar förändringar i EU:s utrikespolitiska ståndpunkter och prioriteringar.',
    breakingImpactGeopoliticalNormal:
      'Parlamentariska beslut formar EU:s internationella ställning och relationerna med tredjeländer.',
    breakingMistakeActor: 'Partigruppernas piskare',
    breakingMistakeDescription:
      'Risk för otillräcklig granskning av komplexa lagstiftningstexter i accelererade förfaranden.',
    breakingMistakeAlternative:
      'Förläng utskottens överläggningsperioder och beställ oberoende juridisk analys för kontroversiella bestämmelser.',
    breakingAdoptedPrefix: 'Antagen:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      'Detaljerad analys av möjliga röstningsavvikelser är för närvarande inte tillgänglig på grund av tekniska begränsningar i källdatan.',
    coalitionUnavailable:
      'Fördjupad bedömning av koalitionsdynamik kan inte visas just nu eftersom nödvändiga underlagsdata tillfälligt saknas.',
    adoptedTextTypeLabel: 'Antagen text',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Visar ${shown} av ${total}`,
  },
  da: {
    breakingBanner: '⚡ SENESTE NYT',
    votingAnomalyIntel: 'Afstemningsanomali — Efterretningsanalyse',
    coalitionDynamics: 'Vurdering af Koalitionsdynamik',
    analyticalReport: 'Analytisk Rapport',
    keyMEPInfluence: 'Analyse af Vigtige MEP-Indflydelse',
    intelligenceBriefing: 'Efterretningsbriefing',
    votingAnomalyAlert: 'Advarsel om Afstemningsanomalier',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentariske Nøgleaktører',
    placeholderNotice:
      'Dette er pladsholderindhold genereret mens Europa-Parlamentets MCP-server er utilgængelig.',
    placeholderLede:
      'Betydelige parlamentariske udviklinger overvåges. Tilslut Europa-Parlamentets MCP-server for at modtage realtidsintelligens.',
    lede: 'Efterretningsanalyse fra Europa-Parlamentets MCP-server har identificeret betydelige parlamentariske udviklinger der kræver øjeblikkelig opmærksomhed',
    feedLede: 'De seneste feeds fra Europa-Parlamentet fremhæver aktuel parlamentarisk aktivitet',
    adoptedTextsHeading: 'Nyligt Vedtagne Tekster',
    recentEventsHeading: 'Seneste Parlamentariske Begivenheder',
    procedureUpdatesHeading: 'Opdateringer af Lovgivningsprocedurer',
    mepUpdatesHeading: 'MEP-Opdateringer',
    noFeedDataNotice: 'Ingen nye feeddata tilgængelige fra Europa-Parlamentet.',
    asOf: 'pr.',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Seneste begivenheder den ${date}: ${adopted} nyvedtagne tekster, ${events} begivenheder, ${procedures} procedureopdateringer, ${meps} MEP-ændringer.`,
    breakingWhyAnomalies:
      'Afstemningsanomalier og koalitionsforskydninger signalerer en omgruppering af politiske kræfter i parlamentet. Disse begivenheder kan ændre den lovgivningsmæssige kalkule for verserende sager.',
    breakingWhyNormal:
      'Parlamentarisk aktivitet afspejler den igangværende lovgivningscyklus. Vedtagne tekster skaber bindende EU-ret, mens procedureopdateringer angiver retningen for kommende lovgivning.',
    breakingWinnerActor: 'Lovgivningsmæssigt flertal',
    breakingWinnerReasonFn: (count) =>
      `${count} lovgivningstekster er ført frem i den parlamentariske proces.`,
    breakingNeutralActor: 'Oppositionsgrupper',
    breakingNeutralReason:
      'Oppositionsgrupper følger udviklingen og kan foreslå ændringsforslag ved efterfølgende behandlinger.',
    breakingOutlookActiveFn: (date) =>
      `Efter den parlamentariske session den ${date} forventes fortsat lovgivningsdynamik i centrale udvalg.`,
    breakingOutlookTransitionalFn: (date) =>
      `Den parlamentariske kalender efter ${date} tyder på en overgangsperiode, mens udvalgene ombalancerer lovgivningsprioriteterne.`,
    breakingLegalObligationsConsequence:
      "Nye retlige forpligtelser træder i kraft for EU's medlemsstater og berørte aktører.",
    breakingProcedureConsequence:
      'Lovgivningsindsatsen ændres; kommende udvalgsafstemninger og plenarmøder bliver afgørende.',
    breakingImpactPoliticalAnomalies:
      'Usædvanlige afstemningsm\u00f8nstre tyder på interne partispændinger eller forhandlinger på tværs af grupper om centrale sager.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} lovgivningstekster afspejler det nuværende parlamentariske flertals lovgivningsprioriteter.`,
    breakingImpactEconomic:
      'Nye regler kan påvirke erhvervslivet, markedsadgang og efterlevelsesomkostninger i EU.',
    breakingImpactSocial:
      'Lovændringer kan påvirke borgernes rettigheder, offentlige tjenester og sociale standarder i medlemsstaterne.',
    breakingImpactLegalFn: (count) =>
      `${count} nye retlige instrumenter skaber bindende forpligtelser for EU's medlemsstater og interessenter.`,
    breakingImpactGeopoliticalCoalition:
      "Koalitionsdynamikken i parlamentet signalerer forskydninger i EU's udenrigspolitiske positioner og prioriteter.",
    breakingImpactGeopoliticalNormal:
      "Parlamentariske beslutninger former EU's internationale position og forholdet til tredjelande.",
    breakingMistakeActor: 'Partigruppernes piskere',
    breakingMistakeDescription:
      'Risiko for utilstrækkelig granskning af komplekse lovgivningstekster i accelererede procedurer.',
    breakingMistakeAlternative:
      'Forlæng udvalgenes drøftelsesperioder og bestil uafhængig juridisk analyse for kontroversielle bestemmelser.',
    breakingAdoptedPrefix: 'Vedtaget:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      'Detaljeret analyse af afstemningsanomalier er i øjeblikket ikke tilgængelig på grund af tekniske begrænsninger i kildedata.',
    coalitionUnavailable:
      'Detaljeret vurdering af koalitionsdynamik kan ikke vises i øjeblikket, da de nødvendige underliggende data midlertidigt mangler.',
    adoptedTextTypeLabel: 'Vedtaget tekst',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Viser ${shown} af ${total}`,
  },
  no: {
    breakingBanner: '⚡ SISTE NYTT',
    votingAnomalyIntel: 'Avstemningsavvik — Etterretningsanalyse',
    coalitionDynamics: 'Vurdering av Koalisjonsdynamikk',
    analyticalReport: 'Analytisk Rapportering',
    keyMEPInfluence: 'Analyse av Viktige MEP-Innflytelse',
    intelligenceBriefing: 'Etterretningsbriefing',
    votingAnomalyAlert: 'Advarsel om Avstemningsavvik',
    coalitionDynamicsSection: 'Koalisjonsdynamikk',
    keyPlayers: 'Parlamentariske Nøkkelaktører',
    placeholderNotice:
      'Dette er plassholder-innhold generert mens Europaparlamentets MCP-server er utilgjengelig.',
    placeholderLede:
      'Betydelige parlamentariske hendelser overvåkes. Koble til Europaparlamentets MCP-server for å motta sanntidsinformasjon.',
    lede: 'Etterretningsanalyse fra Europaparlamentets MCP-server har identifisert betydelige parlamentariske hendelser som krever umiddelbar oppmerksomhet',
    feedLede: 'De siste feedene fra Europaparlamentet belyser nylig parlamentarisk aktivitet',
    adoptedTextsHeading: 'Nylig Vedtatte Tekster',
    recentEventsHeading: 'Siste Parlamentariske Hendelser',
    procedureUpdatesHeading: 'Oppdateringer av Lovgivningsprosedyrer',
    mepUpdatesHeading: 'MEP-Oppdateringer',
    noFeedDataNotice: 'Ingen nye feeddata tilgjengelige fra Europaparlamentet.',
    asOf: 'per',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Siste hendelser ${date}: ${adopted} nylig vedtatte tekster, ${events} hendelser, ${procedures} prosedyreoppdateringer, ${meps} MEP-endringer.`,
    breakingWhyAnomalies:
      'Avstemningsavvik og koalisjonsforskyvninger signaliserer en omgruppering av politiske krefter i parlamentet. Disse hendelsene kan endre den lovgivningsmessige kalkylen for pågående saker.',
    breakingWhyNormal:
      'Parlamentarisk aktivitet gjenspeiler den pågående lovgivningssyklusen. Vedtatte tekster skaper bindende EU-rett, mens prosedyreoppdateringer indikerer retningen for kommende lovgivning.',
    breakingWinnerActor: 'Lovgivningsmessig flertall',
    breakingWinnerReasonFn: (count) =>
      `${count} lovgivningstekster er fremmet i den parlamentariske prosessen.`,
    breakingNeutralActor: 'Opposisjonsgrupper',
    breakingNeutralReason:
      'Opposisjonsgrupper overvåker utviklingen og kan foreslå endringer i etterfølgende behandlinger.',
    breakingOutlookActiveFn: (date) =>
      `Etter den parlamentariske sesjonen ${date} forventes fortsatt lovgivningsdynamikk i sentrale komiteer.`,
    breakingOutlookTransitionalFn: (date) =>
      `Den parlamentariske kalenderen etter ${date} tyder på en overgangsperiode når komiteene ombalanserer lovgivningsprioriteringene.`,
    breakingLegalObligationsConsequence:
      'Nye rettslige forpliktelser trer i kraft for EUs medlemsstater og berørte aktører.',
    breakingProcedureConsequence:
      'Lovgivningsforløpet endres; kommende komitéavstemninger og plenarmøter vil være avgjørende.',
    breakingImpactPoliticalAnomalies:
      'Uvanlige avstemningsmønstre tyder på interne partispenninger eller forhandlinger på tvers av grupper om sentrale saker.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} lovgivningstekster gjenspeiler det nåværende parlamentariske flertalls lovgivingsprioriteter.`,
    breakingImpactEconomic:
      'Nye forskrifter kan påvirke næringsvirksomhet, markedsadgang og etterlevelseskostnader i EU.',
    breakingImpactSocial:
      'Lovendringer kan påvirke borgernes rettigheter, offentlige tjenester og sosiale standarder i medlemsstatene.',
    breakingImpactLegalFn: (count) =>
      `${count} nye rettslige instrumenter skaper bindende forpliktelser for EUs medlemsstater og interessenter.`,
    breakingImpactGeopoliticalCoalition:
      'Koalisjonsdynamikken i parlamentet signaliserer skifter i EUs utenrikspolitiske posisjoner og prioriteringer.',
    breakingImpactGeopoliticalNormal:
      'Parlamentariske beslutninger former EUs internasjonale posisjon og forholdet til tredjeland.',
    breakingMistakeActor: 'Partigruppers innpisker',
    breakingMistakeDescription:
      'Risiko for utilstrekkelig granskning av komplekse lovgivningstekster i akselererte prosedyrer.',
    breakingMistakeAlternative:
      'Forleng komiteens drøftingsperioder og bestill uavhengig juridisk analyse for kontroversielle bestemmelser.',
    breakingAdoptedPrefix: 'Vedtatt:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      'Detaljert analyse av mulige avstemningsavvik er for øyeblikket ikke tilgjengelig på grunn av tekniske begrensninger i kildedataene.',
    coalitionUnavailable:
      'Detaljert vurdering av koalisjonsdynamikk kan ikke vises for øyeblikket siden de nødvendige underliggende dataene midlertidig mangler.',
    adoptedTextTypeLabel: 'Vedtatt tekst',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Viser ${shown} av ${total}`,
  },
  fi: {
    breakingBanner: '⚡ TUOREET UUTISET',
    votingAnomalyIntel: 'Äänestyspoikkeamat — Tiedusteluanalyysi',
    coalitionDynamics: 'Koalitiodynamiikan Arviointi',
    analyticalReport: 'Analyyttinen Raportti',
    keyMEPInfluence: 'Avain-MEP-vaikutusanalyysi',
    intelligenceBriefing: 'Tiedusteluraportti',
    votingAnomalyAlert: 'Äänestyspoikkeamavaroitus',
    coalitionDynamicsSection: 'Koalitiodynamiikka',
    keyPlayers: 'Parlamentaariset Avainpelaajat',
    placeholderNotice:
      'Tämä on paikkamerkkisisältö, joka on luotu EU-parlamentin MCP-palvelimen ollessa pois käytöstä.',
    placeholderLede:
      'Merkittäviä parlamentaarisia tapahtumia seurataan. Yhdistä EU-parlamentin MCP-palvelimeen reaaliaikaisen tiedon vastaanottamiseksi.',
    lede: 'EU-parlamentin MCP-palvelimen tiedusteluanalyysi on tunnistanut merkittäviä parlamentaarisia tapahtumia, jotka vaativat välitöntä huomiota',
    feedLede:
      'Euroopan parlamentin uusimmat syötetiedot korostavat viimeaikaista parlamentaarista toimintaa',
    adoptedTextsHeading: 'Äskettäin Hyväksytyt Tekstit',
    recentEventsHeading: 'Viimeisimmät Parlamentaariset Tapahtumat',
    procedureUpdatesHeading: 'Lainsäädäntömenettelyjen Päivitykset',
    mepUpdatesHeading: 'MEP-Päivitykset',
    noFeedDataNotice: 'Ei uusia syötetietoja saatavilla Euroopan parlamentista.',
    asOf: 'tilanne',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Uusimmat tapahtumat ${date}: ${adopted} äskettäin hyväksyttyä tekstiä, ${events} tapahtumaa, ${procedures} menettelypäivitystä, ${meps} MEP-muutosta.`,
    breakingWhyAnomalies:
      'Äänestyspoikkeamat ja koalitiomuutokset viittaavat poliittisten voimien uudelleenryhmittymiseen parlamentissa. Nämä tapahtumat saattavat muuttaa vireillä olevien asioiden lainsäädännöllistä laskentaa.',
    breakingWhyNormal:
      'Parlamentaarinen toiminta heijastaa käynnissä olevaa lainsäädäntösykliä. Hyväksytyt tekstit luovat sitovaa EU-oikeutta, kun taas menettelypäivitykset osoittavat tulevan lainsäädännön suunnan.',
    breakingWinnerActor: 'Lainsäädännöllinen enemmistö',
    breakingWinnerReasonFn: (count) =>
      `${count} lainsäädäntötekstiä on edistetty parlamentaarisessa prosessissa.`,
    breakingNeutralActor: 'Oppositioryhmät',
    breakingNeutralReason:
      'Oppositioryhmät seuraavat kehitystä ja voivat ehdottaa muutoksia myöhemmissä käsittelyissä.',
    breakingOutlookActiveFn: (date) =>
      `Parlamentaarisen istunnon ${date} jälkeen odotetaan jatkuvaa lainsäädäntövauhtia keskeisillä valiokunnilla.`,
    breakingOutlookTransitionalFn: (date) =>
      `Parlamentaarinen kalenteri ${date} jälkeen viittaa siirtymäkauteen, kun valiokunnat tasapainottavat lainsäädäntöprioriteetit uudelleen.`,
    breakingLegalObligationsConsequence:
      'Uudet oikeudelliset velvoitteet tulevat voimaan EU:n jäsenvaltioille ja säännellyille toimijoille.',
    breakingProcedureConsequence:
      'Lainsäädäntöpolku muuttuu; tulevat valiokuntaäänestykset ja täysistunnot ovat ratkaisevia.',
    breakingImpactPoliticalAnomalies:
      'Epätavalliset äänestysmallit viittaavat sisäisiin puoluejännitteisiin tai ryhmien välisiin neuvotteluihin keskeisistä asiakirjoista.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} lainsäädäntötekstiä heijastaa nykyisen parlamentaarisen enemmistön lainsäädäntöprioriteetit.`,
    breakingImpactEconomic:
      'Uudet asetukset voivat vaikuttaa yritysten toimintaan, markkinapääsyyn ja vaatimustenmukaisuuskustannuksiin EU:ssa.',
    breakingImpactSocial:
      'Lakimuutokset voivat vaikuttaa kansalaisten oikeuksiin, julkisiin palveluihin ja sosiaalisiin standardeihin jäsenvaltioissa.',
    breakingImpactLegalFn: (count) =>
      `${count} uutta oikeudellista välinettä luo sitovia velvoitteita EU:n jäsenvaltioille ja sidosryhmille.`,
    breakingImpactGeopoliticalCoalition:
      'Koalitiodynamiikka parlamentissa viestii muutoksista EU:n ulkopoliittisissa kannoissa ja prioriteeteissa.',
    breakingImpactGeopoliticalNormal:
      'Parlamentaariset päätökset muovaavat EU:n kansainvälistä asemaa ja sen suhteita kolmansiin maihin.',
    breakingMistakeActor: 'Ryhmien parlamenttipiiskurit',
    breakingMistakeDescription:
      'Riski monimutkaisten lainsäädäntötekstien riittämättömälle tarkastukselle nopeutetuissa menettelyissä.',
    breakingMistakeAlternative:
      'Pidennä valiokuntien harkinta-aikoja ja tilaa riippumaton oikeudellinen analyysi kiistanalaisia säännöksiä varten.',
    breakingAdoptedPrefix: 'Hyväksytty:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      'Äänestyspoikkeamien yksityiskohtainen analyysi ei ole tällä hetkellä saatavilla lähdetietojen teknisten rajoitusten vuoksi.',
    coalitionUnavailable:
      'Koalitiodynamiikan yksityiskohtaista arviointia ei voida näyttää tällä hetkellä, koska tarvittavat taustatiedot ovat tilapäisesti poissa.',
    adoptedTextTypeLabel: 'Hyväksytty teksti',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Näytetään ${shown} / ${total}`,
  },
  de: {
    breakingBanner: '⚡ EILMELDUNG',
    votingAnomalyIntel: 'Abstimmungsanomalien — Nachrichtendienstanalyse',
    coalitionDynamics: 'Bewertung der Koalitionsdynamik',
    analyticalReport: 'Analytischer Bericht',
    keyMEPInfluence: 'Analyse des Einflusses wichtiger MdEPs',
    intelligenceBriefing: 'Nachrichtendienstbriefing',
    votingAnomalyAlert: 'Warnung vor Abstimmungsanomalien',
    coalitionDynamicsSection: 'Koalitionsdynamik',
    keyPlayers: 'Parlamentarische Schlüsselfiguren',
    placeholderNotice:
      'Dies ist Platzhalterinhalt, der generiert wurde, während der MCP-Server des EU-Parlaments nicht verfügbar ist.',
    placeholderLede:
      'Bedeutende parlamentarische Entwicklungen werden überwacht. Verbinden Sie den MCP-Server des EU-Parlaments für Echtzeit-Informationen.',
    lede: 'Die Nachrichtendienstanalyse des MCP-Servers des EU-Parlaments hat bedeutende parlamentarische Entwicklungen identifiziert, die sofortige Aufmerksamkeit erfordern',
    feedLede:
      'Die neuesten Feeds des Europäischen Parlaments beleuchten aktuelle parlamentarische Aktivitäten',
    adoptedTextsHeading: 'Kürzlich Angenommene Texte',
    recentEventsHeading: 'Aktuelle Parlamentarische Ereignisse',
    procedureUpdatesHeading: 'Aktualisierungen der Gesetzgebungsverfahren',
    mepUpdatesHeading: 'MdEP-Aktualisierungen',
    noFeedDataNotice: 'Keine neuen Feeddaten vom Europäischen Parlament verfügbar.',
    asOf: 'zum',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Neueste Entwicklungen am ${date}: ${adopted} neu angenommene Texte, ${events} Ereignisse, ${procedures} Verfahrensupdates, ${meps} MdEP-Änderungen.`,
    breakingWhyAnomalies:
      'Abstimmungsanomalien und Koalitionsverschiebungen signalisieren eine Neuausrichtung politischer Kräfte im Parlament. Diese Entwicklungen könnten die gesetzgeberische Kalkulation für laufende Akten verändern.',
    breakingWhyNormal:
      'Parlamentarische Aktivitäten spiegeln den laufenden Gesetzgebungszyklus wider. Angenommene Texte schaffen bindendes EU-Recht, während Verfahrensupdates die Richtung der kommenden Gesetzgebung anzeigen.',
    breakingWinnerActor: 'Gesetzgebende Mehrheit',
    breakingWinnerReasonFn: (count) =>
      `${count} Gesetzestexte wurden im parlamentarischen Verfahren vorangebracht.`,
    breakingNeutralActor: 'Oppositionsgruppen',
    breakingNeutralReason:
      'Oppositionsgruppen beobachten die Entwicklungen und können in nachfolgenden Lesungen Änderungsanträge einbringen.',
    breakingOutlookActiveFn: (date) =>
      `Im Anschluss an die parlamentarische Sitzung vom ${date} ist in den zentralen Ausschüssen weiterer Gesetzgebungsschwung zu erwarten.`,
    breakingOutlookTransitionalFn: (date) =>
      `Der parlamentarische Kalender nach dem ${date} deutet auf eine Übergangsphase hin, in der Ausschüsse ihre Gesetzgebungsprioritäten neu ausbalancieren.`,
    breakingLegalObligationsConsequence:
      'Neue rechtliche Verpflichtungen treten für EU-Mitgliedstaaten und regulierte Akteure in Kraft.',
    breakingProcedureConsequence:
      'Der Gesetzgebungsweg ändert sich; bevorstehende Ausschussabstimmungen und Plenartagungen werden entscheidend sein.',
    breakingImpactPoliticalAnomalies:
      'Ungewöhnliche Abstimmungsmuster deuten auf interne Parteispannungen oder fraktionsübergreifende Verhandlungen zu Schlüsseldossiers hin.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} Gesetzestexte spiegeln die Gesetzgebungsprioritäten der aktuellen parlamentarischen Mehrheit wider.`,
    breakingImpactEconomic:
      'Neue Vorschriften können Geschäftsbetrieb, Marktzugang und Compliance-Kosten in der EU beeinflussen.',
    breakingImpactSocial:
      'Gesetzesänderungen könnten Bürgerrechte, öffentliche Dienste und Sozialstandards in den Mitgliedstaaten beeinflussen.',
    breakingImpactLegalFn: (count) =>
      `${count} neue Rechtsinstrumente schaffen verbindliche Verpflichtungen für EU-Mitgliedstaaten und Interessenträger.`,
    breakingImpactGeopoliticalCoalition:
      'Die Koalitionsdynamik im Parlament signalisiert Verschiebungen in den außenpolitischen Positionen und Prioritäten der EU.',
    breakingImpactGeopoliticalNormal:
      'Parlamentarische Entscheidungen prägen die internationale Stellung der EU und ihre Beziehungen zu Drittländern.',
    breakingMistakeActor: 'Fraktionsgeschäftsführer',
    breakingMistakeDescription:
      'Risiko einer unzureichenden Prüfung komplexer Gesetzestexte in beschleunigten Verfahren.',
    breakingMistakeAlternative:
      'Ausschussberatungszeiten verlängern und unabhängige Rechtsanalysen für streitige Bestimmungen in Auftrag geben.',
    breakingAdoptedPrefix: 'Angenommen:',
    breakingMEPPrefix: 'MdEP:',
    anomalyUnavailable:
      'Detaillierte Analyse von Abstimmungsanomalien ist aufgrund technischer Einschränkungen der Quelldaten derzeit nicht verfügbar.',
    coalitionUnavailable:
      'Eine detaillierte Bewertung der Koalitionsdynamik kann derzeit nicht angezeigt werden, da die erforderlichen Grundlagendaten vorübergehend fehlen.',
    adoptedTextTypeLabel: 'Angenommener Text',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `${shown} von ${total} angezeigt`,
  },
  fr: {
    breakingBanner: '⚡ DERNIÈRES NOUVELLES',
    votingAnomalyIntel: 'Anomalies de Vote — Analyse de Renseignement',
    coalitionDynamics: 'Évaluation des Dynamiques de Coalition',
    analyticalReport: 'Rapport Analytique',
    keyMEPInfluence: "Analyse de l'Influence des Eurodéputés Clés",
    intelligenceBriefing: 'Briefing de Renseignement',
    votingAnomalyAlert: 'Alerte Anomalie de Vote',
    coalitionDynamicsSection: 'Dynamiques de Coalition',
    keyPlayers: 'Acteurs Parlementaires Clés',
    placeholderNotice:
      'Ceci est un contenu indicatif généré pendant que le serveur MCP du Parlement européen est indisponible.',
    placeholderLede:
      'Des développements parlementaires importants sont surveillés. Connectez le serveur MCP du Parlement européen pour recevoir des renseignements en temps réel.',
    lede: "L'analyse de renseignement du serveur MCP du Parlement européen a identifié des développements parlementaires significatifs nécessitant une attention immédiate",
    feedLede:
      'Les dernières données du Parlement européen mettent en lumière les activités parlementaires récentes',
    adoptedTextsHeading: 'Textes Récemment Adoptés',
    recentEventsHeading: 'Événements Parlementaires Récents',
    procedureUpdatesHeading: 'Mises à Jour des Procédures Législatives',
    mepUpdatesHeading: 'Mises à Jour des Eurodéputés',
    noFeedDataNotice: 'Aucune donnée de flux récente disponible du Parlement européen.',
    asOf: 'au',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Dernières évolutions au ${date}\u00a0: ${adopted} textes nouvellement adoptés, ${events} événements, ${procedures} mises à jour procédurales, ${meps} changements de députés.`,
    breakingWhyAnomalies:
      'Les anomalies de vote et les changements de coalition signalent une recomposition des forces politiques au sein du Parlement. Ces développements pourraient modifier les calculs législatifs des dossiers en cours.',
    breakingWhyNormal:
      "L'activité parlementaire reflète le cycle législatif en cours. Les textes adoptés créent du droit européen contraignant, tandis que les mises à jour procédurales indiquent la trajectoire de la législation à venir.",
    breakingWinnerActor: 'Majorité législative',
    breakingWinnerReasonFn: (count) =>
      `${count} textes législatifs ont été avancés dans le cadre du processus parlementaire.`,
    breakingNeutralActor: "Groupes d'opposition",
    breakingNeutralReason:
      "Les groupes d'opposition suivent les développements et peuvent proposer des amendements lors des lectures suivantes.",
    breakingOutlookActiveFn: (date) =>
      `À la suite de la session parlementaire du ${date}, un élan législatif continu est attendu dans les commissions clés.`,
    breakingOutlookTransitionalFn: (date) =>
      `Le calendrier parlementaire après le ${date} suggère une période de transition tandis que les commissions rééquilibrent leurs priorités législatives.`,
    breakingLegalObligationsConsequence:
      "De nouvelles obligations juridiques entrent en vigueur pour les États membres de l'UE et les entités réglementées.",
    breakingProcedureConsequence:
      'La trajectoire législative est modifiée\u00a0; les prochains votes en commission et les sessions plénières seront décisifs.',
    breakingImpactPoliticalAnomalies:
      'Des schémas de vote inhabituels suggèrent des tensions internes aux partis ou des négociations inter-groupes sur des dossiers clés.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} textes législatifs reflètent les priorités législatives de la majorité parlementaire actuelle.`,
    breakingImpactEconomic:
      "De nouvelles réglementations peuvent affecter les opérations commerciales, l'accès aux marchés et les coûts de conformité dans l'UE.",
    breakingImpactSocial:
      'Les changements législatifs pourraient affecter les droits des citoyens, les services publics et les normes sociales dans les États membres.',
    breakingImpactLegalFn: (count) =>
      `${count} nouveaux instruments juridiques créent des obligations contraignantes pour les États membres de l'UE et les parties prenantes.`,
    breakingImpactGeopoliticalCoalition:
      "La dynamique de coalition au sein du Parlement signale des changements dans les positions et priorités de politique étrangère de l'UE.",
    breakingImpactGeopoliticalNormal:
      "Les décisions parlementaires façonnent la position internationale de l'UE et ses relations avec les pays tiers.",
    breakingMistakeActor: 'Chefs de file des groupes politiques',
    breakingMistakeDescription:
      "Risque d'examen insuffisant des textes législatifs complexes dans les procédures accélérées.",
    breakingMistakeAlternative:
      'Prolonger les périodes de délibération en commission et commander des analyses juridiques indépendantes pour les dispositions controversées.',
    breakingAdoptedPrefix: 'Adopté\u00a0:',
    breakingMEPPrefix: 'Député\u00a0:',
    anomalyUnavailable:
      "L'analyse détaillée des anomalies de vote n'est pas disponible pour le moment en raison de limitations techniques des données sources.",
    coalitionUnavailable:
      "L'évaluation détaillée de la dynamique de coalition ne peut pas être affichée pour le moment, car les données sous-jacentes nécessaires sont temporairement indisponibles.",
    adoptedTextTypeLabel: 'Texte adopté',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Affichage de ${shown} sur ${total}`,
  },
  es: {
    breakingBanner: '⚡ ÚLTIMA HORA',
    votingAnomalyIntel: 'Anomalías de Votación — Análisis de Inteligencia',
    coalitionDynamics: 'Evaluación de Dinámicas de Coalición',
    analyticalReport: 'Informe Analítico',
    keyMEPInfluence: 'Análisis de Influencia de Eurodiputados Clave',
    intelligenceBriefing: 'Informe de Inteligencia',
    votingAnomalyAlert: 'Alerta de Anomalía de Votación',
    coalitionDynamicsSection: 'Dinámicas de Coalición',
    keyPlayers: 'Actores Parlamentarios Clave',
    placeholderNotice:
      'Este es contenido de marcador de posición generado mientras el servidor MCP del Parlamento Europeo no está disponible.',
    placeholderLede:
      'Se están monitoreando desarrollos parlamentarios significativos. Conecte el servidor MCP del Parlamento Europeo para recibir inteligencia en tiempo real.',
    lede: 'El análisis de inteligencia del servidor MCP del Parlamento Europeo ha identificado desarrollos parlamentarios significativos que requieren atención inmediata',
    feedLede:
      'Los últimos datos del Parlamento Europeo destacan la actividad parlamentaria reciente',
    adoptedTextsHeading: 'Textos Recientemente Adoptados',
    recentEventsHeading: 'Eventos Parlamentarios Recientes',
    procedureUpdatesHeading: 'Actualizaciones de Procedimientos Legislativos',
    mepUpdatesHeading: 'Actualizaciones de Eurodiputados',
    noFeedDataNotice: 'No hay datos de feeds recientes disponibles del Parlamento Europeo.',
    asOf: 'a',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Últimas novedades el ${date}: ${adopted} textos recién adoptados, ${events} eventos, ${procedures} actualizaciones de procedimientos, ${meps} cambios de eurodiputados.`,
    breakingWhyAnomalies:
      'Las anomalías de votación y los cambios en la coalición señalan una recomposición de fuerzas políticas dentro del Parlamento. Estos desarrollos pueden alterar el cálculo legislativo de los expedientes pendientes.',
    breakingWhyNormal:
      'La actividad parlamentaria refleja el ciclo legislativo en curso. Los textos adoptados crean derecho vinculante de la UE, mientras que las actualizaciones de procedimientos indican la trayectoria de la legislación venidera.',
    breakingWinnerActor: 'Mayoría legislativa',
    breakingWinnerReasonFn: (count) =>
      `${count} textos legislativos han sido avanzados en el proceso parlamentario.`,
    breakingNeutralActor: 'Grupos de oposición',
    breakingNeutralReason:
      'Los grupos de oposición están monitoreando los desarrollos y pueden proponer enmiendas en lecturas posteriores.',
    breakingOutlookActiveFn: (date) =>
      `Tras la sesión parlamentaria del ${date}, se espera un impulso legislativo continuo en las comisiones clave.`,
    breakingOutlookTransitionalFn: (date) =>
      `El calendario parlamentario posterior al ${date} sugiere un período de transición a medida que las comisiones reequilibran las prioridades legislativas.`,
    breakingLegalObligationsConsequence:
      'Nuevas obligaciones jurídicas entran en vigor para los Estados miembros de la UE y las entidades reguladas.',
    breakingProcedureConsequence:
      'La trayectoria legislativa se altera; los próximos votos en comisión y las sesiones plenarias serán fundamentales.',
    breakingImpactPoliticalAnomalies:
      'Patrones de votación inusuales sugieren tensiones internas en los partidos o negociaciones entre grupos sobre expedientes clave.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} textos legislativos reflejan las prioridades legislativas de la mayoría parlamentaria actual.`,
    breakingImpactEconomic:
      'Los nuevos reglamentos pueden afectar las operaciones empresariales, el acceso al mercado y los costos de cumplimiento en la UE.',
    breakingImpactSocial:
      'Los cambios legislativos podrían afectar los derechos de los ciudadanos, los servicios públicos y los estándares sociales en los Estados miembros.',
    breakingImpactLegalFn: (count) =>
      `${count} nuevos instrumentos jurídicos crean obligaciones vinculantes para los Estados miembros de la UE y las partes interesadas.`,
    breakingImpactGeopoliticalCoalition:
      'La dinámica de coalición dentro del Parlamento señala cambios en las posiciones y prioridades de política exterior de la UE.',
    breakingImpactGeopoliticalNormal:
      'Las decisiones parlamentarias configuran la posición internacional de la UE y sus relaciones con terceros países.',
    breakingMistakeActor: 'Jefes de delegación de grupos políticos',
    breakingMistakeDescription:
      'Riesgo de escrutinio insuficiente de textos legislativos complejos en procedimientos acelerados.',
    breakingMistakeAlternative:
      'Ampliar los períodos de deliberación en comisión y encargar análisis jurídicos independientes para las disposiciones controvertidas.',
    breakingAdoptedPrefix: 'Adoptado:',
    breakingMEPPrefix: 'Eurodiputado:',
    anomalyUnavailable:
      'El análisis detallado de anomalías de votación no está disponible actualmente debido a limitaciones técnicas en los datos fuente.',
    coalitionUnavailable:
      'La evaluación detallada de la dinámica de coalición no se puede mostrar en este momento, ya que los datos subyacentes necesarios no están disponibles temporalmente.',
    adoptedTextTypeLabel: 'Texto aprobado',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `Mostrando ${shown} de ${total}`,
  },
  nl: {
    breakingBanner: '⚡ LAATSTE NIEUWS',
    votingAnomalyIntel: 'Stemanomalieën — Inlichtingenanalyse',
    coalitionDynamics: 'Beoordeling van Coalitiedynamiek',
    analyticalReport: 'Analytisch Rapport',
    keyMEPInfluence: 'Analyse van Invloed Belangrijke Europarlementsleden',
    intelligenceBriefing: 'Inlichtingenbriefing',
    votingAnomalyAlert: 'Waarschuwing Stemanomalieën',
    coalitionDynamicsSection: 'Coalitiedynamiek',
    keyPlayers: 'Parlementaire Sleutelfiguren',
    placeholderNotice:
      'Dit is tijdelijke inhoud gegenereerd terwijl de MCP-server van het Europees Parlement niet beschikbaar is.',
    placeholderLede:
      'Significante parlementaire ontwikkelingen worden gemonitord. Verbind de MCP-server van het Europees Parlement voor realtime-informatie.',
    lede: 'Inlichtingenanalyse van de MCP-server van het Europees Parlement heeft significante parlementaire ontwikkelingen geïdentificeerd die onmiddellijke aandacht vereisen',
    feedLede:
      'De nieuwste gegevens van het Europees Parlement belichten recente parlementaire activiteiten',
    adoptedTextsHeading: 'Recent Aangenomen Teksten',
    recentEventsHeading: 'Recente Parlementaire Evenementen',
    procedureUpdatesHeading: 'Updates van Wetgevingsprocedures',
    mepUpdatesHeading: 'Updates van Europarlementsleden',
    noFeedDataNotice: 'Geen recente feedgegevens beschikbaar van het Europees Parlement.',
    asOf: 'per',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `Laatste ontwikkelingen op ${date}: ${adopted} nieuw aangenomen teksten, ${events} evenementen, ${procedures} procedurebijwerkingen, ${meps} MEP-wijzigingen.`,
    breakingWhyAnomalies:
      'Stemanomalieën en coalitieverschuivingen signaleren een hergroepering van politieke krachten binnen het Parlement. Deze ontwikkelingen kunnen de wetgevende berekening voor lopende dossiers wijzigen.',
    breakingWhyNormal:
      'Parlementaire activiteit weerspiegelt de lopende wetgevingscyclus. Aangenomen teksten creëren bindend EU-recht, terwijl procedurebijwerkingen de richting van komende wetgeving aangeven.',
    breakingWinnerActor: 'Wetgevende meerderheid',
    breakingWinnerReasonFn: (count) =>
      `${count} wetgevingsteksten zijn gevorderd in het parlementaire proces.`,
    breakingNeutralActor: 'Oppositiegroepen',
    breakingNeutralReason:
      'Oppositiegroepen volgen de ontwikkelingen en kunnen bij volgende lezingen amendementen voorstellen.',
    breakingOutlookActiveFn: (date) =>
      `Na de parlementaire zitting van ${date} wordt verdere wetgevingsdynamiek in kerncommissies verwacht.`,
    breakingOutlookTransitionalFn: (date) =>
      `De parlementaire kalender na ${date} suggereert een transitieperiode terwijl commissies wetgevingsprioriteiten opnieuw in evenwicht brengen.`,
    breakingLegalObligationsConsequence:
      'Nieuwe wettelijke verplichtingen treden in werking voor EU-lidstaten en gereguleerde entiteiten.',
    breakingProcedureConsequence:
      'De wetgevingsweg verandert; komende commissiestemmingen en plenaire vergaderingen zullen cruciaal zijn.',
    breakingImpactPoliticalAnomalies:
      'Ongewone stempatronen wijzen op interne partijspanningen of onderhandelingen tussen groepen over sleuteldossiers.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} wetgevingsteksten weerspiegelen de wetgevingsprioriteiten van de huidige parlementaire meerderheid.`,
    breakingImpactEconomic:
      'Nieuwe regelgeving kan zakelijke activiteiten, markttoegang en nalevingskosten in de EU beïnvloeden.',
    breakingImpactSocial:
      'Wetswijzigingen kunnen de rechten van burgers, openbare diensten en sociale normen in de lidstaten beïnvloeden.',
    breakingImpactLegalFn: (count) =>
      `${count} nieuwe juridische instrumenten scheppen bindende verplichtingen voor EU-lidstaten en belanghebbenden.`,
    breakingImpactGeopoliticalCoalition:
      'Coalitiedynamiek in het Parlement signaleert verschuivingen in de buitenlandse beleidsposities en prioriteiten van de EU.',
    breakingImpactGeopoliticalNormal:
      'Parlementaire beslissingen bepalen de internationale positie van de EU en haar relaties met derde landen.',
    breakingMistakeActor: 'Fractiedisciplineurs',
    breakingMistakeDescription:
      'Risico op onvoldoende controle van complexe wetgevingsteksten in versnelde procedures.',
    breakingMistakeAlternative:
      'Verleng commissieberaadslagingsperioden en bestel onafhankelijke juridische analyses voor omstreden bepalingen.',
    breakingAdoptedPrefix: 'Aangenomen:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      'Gedetailleerde analyse van stemanomalieën is momenteel niet beschikbaar vanwege technische beperkingen in de brondata.',
    coalitionUnavailable:
      'Gedetailleerde beoordeling van coalitiedynamiek kan momenteel niet worden weergegeven, omdat de benodigde onderliggende gegevens tijdelijk niet beschikbaar zijn.',
    adoptedTextTypeLabel: 'Aangenomen tekst',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `${shown} van ${total} weergegeven`,
  },
  ar: {
    breakingBanner: '⚡ عاجل',
    votingAnomalyIntel: 'شذوذ التصويت — تحليل استخباراتي',
    coalitionDynamics: 'تقييم ديناميات التحالف',
    analyticalReport: 'تقرير تحليلي',
    keyMEPInfluence: 'تحليل تأثير النواب الرئيسيين',
    intelligenceBriefing: 'ملخص استخباراتي',
    votingAnomalyAlert: 'تنبيه شذوذ التصويت',
    coalitionDynamicsSection: 'ديناميات التحالف',
    keyPlayers: 'اللاعبون البرلمانيون الرئيسيون',
    placeholderNotice: 'هذا محتوى مؤقت تم إنشاؤه أثناء عدم توفر خادم MCP للبرلمان الأوروبي.',
    placeholderLede:
      'تتم مراقبة تطورات برلمانية مهمة. قم بتوصيل خادم MCP للبرلمان الأوروبي لتلقي معلومات استخبارية في الوقت الفعلي.',
    lede: 'حدد التحليل الاستخباراتي لخادم MCP للبرلمان الأوروبي تطورات برلمانية مهمة تتطلب اهتماماً فورياً',
    feedLede: 'تسلط أحدث بيانات البرلمان الأوروبي الضوء على النشاط البرلماني الأخير',
    adoptedTextsHeading: 'النصوص المعتمدة مؤخراً',
    recentEventsHeading: 'أحداث برلمانية حديثة',
    procedureUpdatesHeading: 'تحديثات الإجراءات التشريعية',
    mepUpdatesHeading: 'تحديثات أعضاء البرلمان',
    noFeedDataNotice: 'لا تتوفر بيانات تغذية حديثة من البرلمان الأوروبي.',
    asOf: 'اعتباراً من',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `آخر التطورات في ${date}: ${adopted} نصًا معتمدًا حديثًا، ${events} أحداث، ${procedures} تحديثات إجراءات، ${meps} تغييرات في أعضاء البرلمان.`,
    breakingWhyAnomalies:
      'تشير شذوذات التصويت وتحولات الائتلاف إلى إعادة توازن القوى السياسية داخل البرلمان. قد تؤثر هذه التطورات على الحسابات التشريعية للملفات المعلقة.',
    breakingWhyNormal:
      'يعكس النشاط البرلماني الدورة التشريعية الجارية. تنشئ النصوص المعتمدة قانونًا أوروبيًا ملزمًا، فيما تشير تحديثات الإجراءات إلى مسار التشريعات القادمة.',
    breakingWinnerActor: 'الأغلبية التشريعية',
    breakingWinnerReasonFn: (count) => `تم تقديم ${count} نصًا تشريعيًا في العملية البرلمانية.`,
    breakingNeutralActor: 'مجموعات المعارضة',
    breakingNeutralReason:
      'تراقب مجموعات المعارضة التطورات ويمكنها اقتراح تعديلات في القراءات اللاحقة.',
    breakingOutlookActiveFn: (date) =>
      `في أعقاب الجلسة البرلمانية في ${date}، يُتوقع استمرار الزخم التشريعي في اللجان الرئيسية.`,
    breakingOutlookTransitionalFn: (date) =>
      `يشير التقويم البرلماني بعد ${date} إلى مرحلة انتقالية مع إعادة اللجان لتوازن أولوياتها التشريعية.`,
    breakingLegalObligationsConsequence:
      'تدخل التزامات قانونية جديدة حيز التنفيذ للدول الأعضاء في الاتحاد الأوروبي والكيانات الخاضعة للتنظيم.',
    breakingProcedureConsequence:
      'يتغير المسار التشريعي؛ ستكون تصويتات اللجان وجلسات الاجتماعات العامة القادمة محورية.',
    breakingImpactPoliticalAnomalies:
      'تشير أنماط التصويت غير المعتادة إلى توترات داخل الأحزاب أو مفاوضات بين المجموعات حول الملفات الرئيسية.',
    breakingImpactPoliticalNormalFn: (count) =>
      `تعكس ${count} نصًا تشريعيًا الأولويات التشريعية للأغلبية البرلمانية الحالية.`,
    breakingImpactEconomic:
      'قد تؤثر اللوائح الجديدة على العمليات التجارية والوصول إلى الأسواق وتكاليف الامتثال في الاتحاد الأوروبي.',
    breakingImpactSocial:
      'قد تؤثر التغييرات التشريعية على حقوق المواطنين والخدمات العامة والمعايير الاجتماعية في الدول الأعضاء.',
    breakingImpactLegalFn: (count) =>
      `تنشئ ${count} صكًا قانونيًا جديدًا التزامات ملزمة للدول الأعضاء في الاتحاد الأوروبي وأصحاب المصلحة.`,
    breakingImpactGeopoliticalCoalition:
      'تشير ديناميات الائتلاف داخل البرلمان إلى تحولات في مواقف وأولويات السياسة الخارجية للاتحاد الأوروبي.',
    breakingImpactGeopoliticalNormal:
      'تشكّل القرارات البرلمانية المكانة الدولية للاتحاد الأوروبي وعلاقاته مع الدول الثالثة.',
    breakingMistakeActor: 'مسؤولو الانضباط الحزبي',
    breakingMistakeDescription:
      'خطر عدم كفاية التدقيق في النصوص التشريعية المعقدة في الإجراءات المعجّلة.',
    breakingMistakeAlternative:
      'تمديد فترات مداولات اللجان وطلب تحليل قانوني مستقل للأحكام الخلافية.',
    breakingAdoptedPrefix: 'معتمد:',
    breakingMEPPrefix: 'عضو البرلمان:',
    anomalyUnavailable:
      'تحليل شذوذات التصويت التفصيلي غير متاح حاليًا بسبب قيود تقنية في بيانات المصدر.',
    coalitionUnavailable:
      'لا يمكن عرض التقييم التفصيلي لديناميات الائتلاف في الوقت الحالي نظرًا لعدم توفر البيانات الأساسية اللازمة مؤقتًا.',
    adoptedTextTypeLabel: 'نص معتمد',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `عرض ${shown} من ${total}`,
  },
  he: {
    breakingBanner: '⚡ חדשות דחופות',
    votingAnomalyIntel: 'חריגות הצבעה — ניתוח מודיעיני',
    coalitionDynamics: 'הערכת דינמיקת קואליציה',
    analyticalReport: 'דוח אנליטי',
    keyMEPInfluence: 'ניתוח השפעת חברי פרלמנט מרכזיים',
    intelligenceBriefing: 'תדרוך מודיעיני',
    votingAnomalyAlert: 'התראת חריגות הצבעה',
    coalitionDynamicsSection: 'דינמיקת קואליציה',
    keyPlayers: 'שחקני מפתח פרלמנטריים',
    placeholderNotice: 'זהו תוכן מציין מיקום שנוצר בזמן ששרת MCP של הפרלמנט האירופי אינו זמין.',
    placeholderLede:
      'מתבצע ניטור של התפתחויות פרלמנטריות משמעותיות. חבר את שרת MCP של הפרלמנט האירופי לקבלת מודיעין בזמן אמת.',
    lede: 'ניתוח מודיעיני משרת MCP של הפרלמנט האירופי זיהה התפתחויות פרלמנטריות משמעותיות הדורשות תשומת לב מיידית',
    feedLede: 'נתוני ההזנה האחרונים של הפרלמנט האירופי מדגישים פעילות פרלמנטרית עדכנית',
    adoptedTextsHeading: 'טקסטים שאומצו לאחרונה',
    recentEventsHeading: 'אירועים פרלמנטריים אחרונים',
    procedureUpdatesHeading: 'עדכוני הליכי חקיקה',
    mepUpdatesHeading: 'עדכוני חברי פרלמנט',
    noFeedDataNotice: 'אין נתוני הזנה עדכניים זמינים מהפרלמנט האירופי.',
    asOf: 'נכון ל-',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `ההתפתחויות האחרונות ב-${date}: ${adopted} טקסטים שאומצו לאחרונה, ${events} אירועים, ${procedures} עדכוני הליכים, ${meps} שינויים בחברי פרלמנט.`,
    breakingWhyAnomalies:
      'חריגות הצבעה ושינויים בקואליציה מסמנים ארגון מחדש של הכוחות הפוליטיים בפרלמנט. התפתחויות אלו עשויות לשנות את התחשיב החקיקתי לתיקים הממתינים.',
    breakingWhyNormal:
      'הפעילות הפרלמנטרית משקפת את מחזור החקיקה השוטף. טקסטים שאומצו יוצרים חוק אירופי מחייב, בעוד שעדכוני הליכים מצביעים על מסלול החקיקה הקרובה.',
    breakingWinnerActor: 'הרוב החקיקתי',
    breakingWinnerReasonFn: (count) => `${count} טקסטים חקיקתיים קודמו בתהליך הפרלמנטרי.`,
    breakingNeutralActor: 'קבוצות האופוזיציה',
    breakingNeutralReason:
      'קבוצות האופוזיציה עוקבות אחר ההתפתחויות ועשויות להציע תיקונים בקריאות הבאות.',
    breakingOutlookActiveFn: (date) =>
      `בעקבות הישיבה הפרלמנטרית של ${date}, צפוי מומנטום חקיקתי מתמשך בוועדות המרכזיות.`,
    breakingOutlookTransitionalFn: (date) =>
      `לוח הזמנים הפרלמנטרי לאחר ${date} מרמז על תקופת מעבר בה הוועדות מאזנות מחדש את סדרי העדיפויות החקיקתיים.`,
    breakingLegalObligationsConsequence:
      'חובות משפטיות חדשות נכנסות לתוקף עבור מדינות החברות באיחוד האירופי וגורמים מוסדרים.',
    breakingProcedureConsequence:
      'מסלול החקיקה משתנה; הצבעות ועדה ומושבי מליאה קרובים יהיו מכריעים.',
    breakingImpactPoliticalAnomalies:
      'דפוסי הצבעה חריגים מרמזים על מתחים פנים-מפלגתיים או משא ומתן בין-קבוצתי על תיקים מרכזיים.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count} טקסטים חקיקתיים משקפים את סדרי העדיפויות החקיקתיים של הרוב הפרלמנטרי הנוכחי.`,
    breakingImpactEconomic:
      'תקנות חדשות עשויות להשפיע על פעילות עסקית, גישה לשוק ועלויות ציות ברחבי האיחוד האירופי.',
    breakingImpactSocial:
      'שינויים חקיקתיים עשויים להשפיע על זכויות אזרחים, שירותים ציבוריים ותקנים חברתיים במדינות החברות.',
    breakingImpactLegalFn: (count) =>
      `${count} מכשירים משפטיים חדשים יוצרים חובות מחייבות למדינות החברות באיחוד האירופי ולבעלי עניין.`,
    breakingImpactGeopoliticalCoalition:
      'דינמיקת הקואליציה בפרלמנט מסמנת שינויים בעמדות ובסדרי העדיפויות של המדיניות החוץ-אירופית.',
    breakingImpactGeopoliticalNormal:
      'החלטות פרלמנטריות מעצבות את מעמדה הבינלאומי של האיחוד האירופי ואת יחסיו עם מדינות שלישיות.',
    breakingMistakeActor: 'מנהיגי הסיעות',
    breakingMistakeDescription:
      'סיכון לבחינה בלתי מספקת של טקסטים חקיקתיים מורכבים בהליכים מואצים.',
    breakingMistakeAlternative:
      'הארכת תקופות הדיון בוועדות והזמנת ניתוח משפטי עצמאי עבור הוראות שנויות במחלוקת.',
    breakingAdoptedPrefix: 'אומץ:',
    breakingMEPPrefix: 'חבר פרלמנט:',
    anomalyUnavailable: 'ניתוח מפורט של חריגות הצבעה אינו זמין כעת עקב מגבלות טכניות בנתוני המקור.',
    coalitionUnavailable:
      'הערכה מפורטת של דינמיקת הקואליציה אינה יכולה להיות מוצגת כעת, מכיוון שנתוני הבסיס הנחוצים אינם זמינים זמנית.',
    adoptedTextTypeLabel: 'טקסט שאומץ',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `מציג ${shown} מתוך ${total}`,
  },
  ja: {
    breakingBanner: '⚡ 速報',
    votingAnomalyIntel: '投票異常 — 情報分析',
    coalitionDynamics: '連立動態評価',
    analyticalReport: '分析レポート',
    keyMEPInfluence: '主要MEP影響力分析',
    intelligenceBriefing: 'インテリジェンスブリーフィング',
    votingAnomalyAlert: '投票異常警報',
    coalitionDynamicsSection: '連立動態',
    keyPlayers: '議会の主要人物',
    placeholderNotice:
      'これは欧州議会MCPサーバーが利用できない間に生成されたプレースホルダーコンテンツです。',
    placeholderLede:
      '重大な議会の動きを監視しています。リアルタイムの情報を受信するには、欧州議会MCPサーバーに接続してください。',
    lede: '欧州議会MCPサーバーの情報分析により、即座の注意を要する重大な議会の動きが特定されました',
    feedLede: '欧州議会の最新フィードデータが最近の議会活動を紹介しています',
    adoptedTextsHeading: '最近採択されたテキスト',
    recentEventsHeading: '最近の議会イベント',
    procedureUpdatesHeading: '立法手続きの更新',
    mepUpdatesHeading: 'MEPの更新',
    noFeedDataNotice: '欧州議会からの最新フィードデータはありません。',
    asOf: '現在',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `${date}の最新動向：新たに採択されたテキスト${adopted}件、イベント${events}件、手続き更新${procedures}件、MEP変更${meps}件。`,
    breakingWhyAnomalies:
      '投票の異常と連立の変動が、議会内の政治的勢力の再編を示しています。これらの動向は、係属中の案件の立法的計算を変える可能性があります。',
    breakingWhyNormal:
      '議会活動は進行中の立法サイクルを反映しています。採択されたテキストは拘束力のあるEU法を生み出し、手続き更新は今後の法律の方向性を示します。',
    breakingWinnerActor: '立法多数派',
    breakingWinnerReasonFn: (count) => `${count}件の立法テキストが議会プロセスで進められました。`,
    breakingNeutralActor: '野党グループ',
    breakingNeutralReason:
      '野党グループは動向を監視しており、後続の審議で修正案を提案する可能性があります。',
    breakingOutlookActiveFn: (date) =>
      `${date}の議会会期後、主要な委員会で立法の勢いが続くことが期待されます。`,
    breakingOutlookTransitionalFn: (date) =>
      `${date}以降の議会日程は、委員会が立法上の優先事項を再調整する移行期間を示唆しています。`,
    breakingLegalObligationsConsequence:
      'EU加盟国および規制対象事業体に対し、新たな法的義務が発効します。',
    breakingProcedureConsequence:
      '立法の経路が変わります；今後の委員会投票と本会議が鍵となります。',
    breakingImpactPoliticalAnomalies:
      '異例の投票パターンは、党内の緊張または主要案件に関するグループ間の交渉を示唆しています。',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count}件の立法テキストは、現在の議会多数派の立法優先事項を反映しています。`,
    breakingImpactEconomic:
      '新規制は、EU全体のビジネス運営、市場アクセス、コンプライアンスコストに影響を与える可能性があります。',
    breakingImpactSocial:
      '法制上の変更は、加盟国における市民の権利、公共サービス、社会基準に影響を与える可能性があります。',
    breakingImpactLegalFn: (count) =>
      `${count}件の新たな法的手段が、EU加盟国および利害関係者に対して拘束力のある義務を生み出します。`,
    breakingImpactGeopoliticalCoalition:
      '議会内の連立力学は、EUの対外政策の立場と優先事項の変化を示しています。',
    breakingImpactGeopoliticalNormal: '議会の決定は、EUの国際的地位と第三国との関係を形成します。',
    breakingMistakeActor: '会派院内幹事',
    breakingMistakeDescription:
      '迅速化された手続きにおける複雑な立法テキストの精査が不十分になるリスク。',
    breakingMistakeAlternative:
      '委員会の審議期間を延長し、論争的な条項については独立した法的分析を委託してください。',
    breakingAdoptedPrefix: '採択：',
    breakingMEPPrefix: 'MEP：',
    anomalyUnavailable:
      '投票異常の詳細分析は、ソースデータの技術的な制限により現在利用できません。',
    coalitionUnavailable:
      '連立力学の詳細な評価は、必要な基礎データが一時的に利用できないため、現時点では表示できません。',
    adoptedTextTypeLabel: '採択テキスト',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `${total}件中${shown}件を表示`,
  },
  ko: {
    breakingBanner: '⚡ 속보',
    votingAnomalyIntel: '투표 이상 — 정보 분석',
    coalitionDynamics: '연합 역학 평가',
    analyticalReport: '분석 보고서',
    keyMEPInfluence: '주요 MEP 영향력 분석',
    intelligenceBriefing: '정보 브리핑',
    votingAnomalyAlert: '투표 이상 경보',
    coalitionDynamicsSection: '연합 역학',
    keyPlayers: '의회 핵심 인물',
    placeholderNotice: '유럽 의회 MCP 서버를 사용할 수 없는 동안 생성된 자리 표시자 콘텐츠입니다.',
    placeholderLede:
      '중요한 의회 동향이 모니터링되고 있습니다. 실시간 정보를 수신하려면 유럽 의회 MCP 서버에 연결하세요.',
    lede: '유럽 의회 MCP 서버의 정보 분석에서 즉각적인 주의가 필요한 중요한 의회 동향이 확인되었습니다',
    feedLede: '유럽 의회의 최신 피드 데이터가 최근 의회 활동을 조명합니다',
    adoptedTextsHeading: '최근 채택된 텍스트',
    recentEventsHeading: '최근 의회 이벤트',
    procedureUpdatesHeading: '입법 절차 업데이트',
    mepUpdatesHeading: 'MEP 업데이트',
    noFeedDataNotice: '유럽 의회의 최신 피드 데이터가 없습니다.',
    asOf: '기준',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `${date} 최신 동향: 새로 채택된 텍스트 ${adopted}건, 이벤트 ${events}건, 절차 업데이트 ${procedures}건, MEP 변경 ${meps}건.`,
    breakingWhyAnomalies:
      '투표 이상과 연합 변동은 의회 내 정치적 세력의 재편을 나타냅니다. 이러한 발전은 계류 중인 안건에 대한 입법적 계산을 변경할 수 있습니다.',
    breakingWhyNormal:
      '의회 활동은 진행 중인 입법 주기를 반영합니다. 채택된 텍스트는 구속력 있는 EU 법을 생성하고, 절차 업데이트는 다가올 입법의 방향을 나타냅니다.',
    breakingWinnerActor: '입법 다수파',
    breakingWinnerReasonFn: (count) =>
      `${count}건의 입법 텍스트가 의회 절차를 통해 진행되었습니다.`,
    breakingNeutralActor: '야당 그룹',
    breakingNeutralReason:
      '야당 그룹은 동향을 모니터링하고 있으며 후속 심의에서 수정안을 제안할 수 있습니다.',
    breakingOutlookActiveFn: (date) =>
      `${date} 의회 회기 이후 주요 위원회에서 지속적인 입법 모멘텀이 예상됩니다.`,
    breakingOutlookTransitionalFn: (date) =>
      `${date} 이후의 의회 일정은 위원회가 입법 우선순위를 재조정하는 전환 기간을 시사합니다.`,
    breakingLegalObligationsConsequence:
      'EU 회원국 및 규제 대상 기업에 새로운 법적 의무가 발효됩니다.',
    breakingProcedureConsequence:
      '입법 경로가 변경됩니다; 앞으로 있을 위원회 투표와 본회의 회기가 중요합니다.',
    breakingImpactPoliticalAnomalies:
      '비정상적인 투표 패턴은 주요 안건에 대한 당내 긴장 또는 그룹 간 협상을 시사합니다.',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count}건의 입법 텍스트는 현재 의회 다수파의 입법 우선순위를 반영합니다.`,
    breakingImpactEconomic:
      '새로운 규정은 EU 전반에서 기업 운영, 시장 접근 및 규정 준수 비용에 영향을 미칠 수 있습니다.',
    breakingImpactSocial:
      '입법 변경은 회원국의 시민 권리, 공공 서비스 및 사회적 기준에 영향을 미칠 수 있습니다.',
    breakingImpactLegalFn: (count) =>
      `${count}건의 새로운 법적 수단이 EU 회원국과 이해 관계자에게 구속력 있는 의무를 부여합니다.`,
    breakingImpactGeopoliticalCoalition:
      '의회 내 연합 역학은 EU 외교 정책 입장과 우선순위의 변화를 나타냅니다.',
    breakingImpactGeopoliticalNormal: '의회 결정은 EU의 국제적 위상과 제3국과의 관계를 형성합니다.',
    breakingMistakeActor: '정치 그룹 원내총무',
    breakingMistakeDescription: '가속화된 절차에서 복잡한 입법 텍스트를 충분히 검토하지 않을 위험.',
    breakingMistakeAlternative:
      '위원회 심의 기간을 연장하고 논쟁적인 조항에 대해 독립적인 법적 분석을 의뢰하십시오.',
    breakingAdoptedPrefix: '채택:',
    breakingMEPPrefix: 'MEP:',
    anomalyUnavailable:
      '투표 이상의 상세 분석은 소스 데이터의 기술적 제한으로 현재 이용할 수 없습니다.',
    coalitionUnavailable:
      '연합 역학의 상세 평가는 필요한 기본 데이터가 일시적으로 이용 불가능하여 현재 표시할 수 없습니다.',
    adoptedTextTypeLabel: '채택 문서',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `총 ${total}개 중 ${shown}개 표시`,
  },
  zh: {
    breakingBanner: '⚡ 突发',
    votingAnomalyIntel: '投票异常 — 情报分析',
    coalitionDynamics: '联盟动态评估',
    analyticalReport: '分析报告',
    keyMEPInfluence: '关键MEP影响力分析',
    intelligenceBriefing: '情报简报',
    votingAnomalyAlert: '投票异常警报',
    coalitionDynamicsSection: '联盟动态',
    keyPlayers: '议会关键人物',
    placeholderNotice: '这是在欧洲议会MCP服务器不可用时生成的占位符内容。',
    placeholderLede: '正在监控重大议会动态。请连接欧洲议会MCP服务器以接收实时情报。',
    lede: '欧洲议会MCP服务器的情报分析已确定需要立即关注的重大议会动态',
    feedLede: '欧洲议会的最新数据动态展示了近期议会活动',
    adoptedTextsHeading: '最近通过的文本',
    recentEventsHeading: '近期议会活动',
    procedureUpdatesHeading: '立法程序更新',
    mepUpdatesHeading: 'MEP更新',
    noFeedDataNotice: '没有来自欧洲议会的最新订阅数据。',
    asOf: '截至',
    breakingWhatFn: (date, adopted, events, procedures, meps) =>
      `${date}最新动态：${adopted}项新通过文本，${events}项活动，${procedures}项程序更新，${meps}项议员变更。`,
    breakingWhyAnomalies:
      '投票异常和联盟变动表明议会内部政治力量正在重新排列。这些动态可能改变待处理议案的立法计算。',
    breakingWhyNormal:
      '议会活动反映了正在进行的立法周期。通过的文本创造了具有约束力的欧盟法律，而程序更新则表明了即将出台的立法方向。',
    breakingWinnerActor: '立法多数派',
    breakingWinnerReasonFn: (count) => `${count}项立法文本已通过议会程序推进。`,
    breakingNeutralActor: '反对派团体',
    breakingNeutralReason: '反对派团体正在监测动态，可能在后续读会中提出修订意见。',
    breakingOutlookActiveFn: (date) =>
      `在${date}议会会议之后，预计主要委员会的立法势头将持续推进。`,
    breakingOutlookTransitionalFn: (date) =>
      `${date}之后的议会日程表明，随着各委员会重新平衡立法优先事项，将进入过渡期。`,
    breakingLegalObligationsConsequence: '欧盟成员国和受监管实体将面临新的法律义务。',
    breakingProcedureConsequence: '立法路径已发生变化；即将举行的委员会投票和全体会议至关重要。',
    breakingImpactPoliticalAnomalies:
      '不寻常的投票模式表明党内存在紧张局势，或各团体就关键议案进行跨党派谈判。',
    breakingImpactPoliticalNormalFn: (count) =>
      `${count}项立法文本反映了当前议会多数派的立法优先事项。`,
    breakingImpactEconomic: '新法规可能影响欧盟各地的商业运营、市场准入和合规成本。',
    breakingImpactSocial: '立法变化可能影响成员国公民的权利、公共服务和社会标准。',
    breakingImpactLegalFn: (count) =>
      `${count}项新法律文书为欧盟成员国和利益相关者创造了具有约束力的义务。`,
    breakingImpactGeopoliticalCoalition:
      '议会内部的联盟动态表明欧盟对外政策立场和优先事项正在发生转变。',
    breakingImpactGeopoliticalNormal: '议会决定塑造了欧盟的国际地位及其与第三国的关系。',
    breakingMistakeActor: '政治团体党鞭',
    breakingMistakeDescription: '在加快程序中对复杂立法文本审查不足的风险。',
    breakingMistakeAlternative: '延长委员会审议期，并针对争议性条款委托独立法律分析。',
    breakingAdoptedPrefix: '通过：',
    breakingMEPPrefix: '议员：',
    anomalyUnavailable: '由于源数据存在技术限制，投票异常的详细分析目前不可用。',
    coalitionUnavailable: '目前无法显示联盟动态的详细评估，因为所需的基础数据暂时不可用。',
    adoptedTextTypeLabel: '通过文本',
    adoptedTextItemLabelFn: (label) => label,
    showingXofNFn: (shown, total) => `显示 ${shown} / ${total}`,
  },
};

/** Localized body-text strings for the committee-analysis deep-analysis section */
export const COMMITTEE_ANALYSIS_CONTENT_STRINGS: LanguageMap<CommitteeAnalysisContentStrings> = {
  en: {
    what: 'Committee activity report as of {date}: {total} committees monitored, {docs} documents processed, {active} committees with recent activity.',
    whatNoData:
      'Committee activity monitoring as of {date}: {total} committees tracked. No recent documents were available from the EP data feed for this reporting period.',
    reportDateLabel: 'Reporting date:',
    membersLabel: 'members',
    chairLabel: 'Chair:',
    productivityRobust: 'robust',
    productivityModerate: 'moderate',
    productivityLow: 'low',
    why: 'Committees are the legislative engine of the European Parliament — {pct}% active rate signals {descriptor} legislative productivity. Committee outputs directly shape the texts that reach plenary votes.',
    stakeholderHighlyProductive: '{n} documents — highly productive period',
    stakeholderModerateActivity: '{n} document(s) — moderate activity',
    stakeholderNoDocs: 'No recent documents — potential productivity concern',
    impactPolitical:
      'Committee chairs wield significant agenda-setting power. Active committees ({active}/{total}) are shaping the legislative pipeline for the current session.',
    impactPoliticalNone:
      'Committee chairs wield significant agenda-setting power. No committees have published recent documents in this reporting window; the legislative pipeline is under development.',
    impactEconomic:
      'Committee outputs on economic affairs, industry, and trade directly affect EU regulatory environments and business competitiveness.',
    impactSocial:
      "Social affairs, employment, and civil liberties committees produce legislation that directly impacts citizens' daily lives.",
    impactLegal:
      '{docs} documents in various stages of committee consideration will eventually create or modify EU law.',
    impactGeopolitical:
      'Foreign affairs and international trade committee activities signal evolving EU diplomatic and trade priorities.',
    actionProcessed: '{abbr} processed {n} document(s)',
    actionConsequence:
      'Legislative proposals advance to next stage; affected stakeholders should prepare for implementation',
    mistakeDescription: 'No recent documents produced — legislative backlog may be developing',
    mistakeAlternative: 'Convene additional sessions or reassign resources to clear pending files',
    outlookGood:
      'With {n} of {total} committees actively producing documents, the current pace supports a productive plenary calendar.',
    outlookConcern:
      'The legislative pipeline may face bottlenecks if committee output does not increase.',
    lede: 'European Parliament committee activity and legislative effectiveness analysis.',
    noRecentDocs: 'No recent documents available',
    committeeMetadataUnavailable:
      'Committee chair and membership data are not currently available from the EP Open Data API for this reporting period. Committee activity monitoring continues with available data sources.',
    adoptedTextsSectionHeading: 'Recent Adopted Texts by Committee Theme',
    adoptedTextsSummary:
      'The European Parliament adopted {count} texts in recent sessions, spanning environmental, economic, security, civil liberties, and agricultural policy domains.',
    adoptedTextsSummarySingular: 'The European Parliament adopted 1 text in a recent session.',
    committeeNameENVI: 'Environment, Public Health and Food Safety',
    committeeNameECON: 'Economic and Monetary Affairs',
    committeeNameAFET: 'Foreign Affairs',
    committeeNameLIBE: 'Civil Liberties, Justice and Home Affairs',
    committeeNameAGRI: 'Agriculture and Rural Development',
    committeeNameOTHER: 'Cross-Committee and Plenary',
  },
  sv: {
    what: 'Utskottsaktivitetsrapport per {date}: {total} utskott övervakade, {docs} dokument behandlade, {active} utskott med aktuell aktivitet.',
    whatNoData:
      'Utskottsaktivitetsövervakning per {date}: {total} utskott spårade. Inga aktuella dokument var tillgängliga från EP:s dataflöde för denna rapporteringsperiod.',
    reportDateLabel: 'Rapportdatum:',
    membersLabel: 'ledamöter',
    chairLabel: 'Ordförande:',
    productivityRobust: 'robust',
    productivityModerate: 'måttlig',
    productivityLow: 'låg',
    why: 'Utskotten är Europaparlamentets lagstiftningsmotor — {pct}% aktiv andel signalerar {descriptor} lagstiftningsproduktivitet. Utskottens arbete formar direkt de texter som når plenarvoteringar.',
    stakeholderHighlyProductive: '{n} dokument — mycket produktiv period',
    stakeholderModerateActivity: '{n} dokument — måttlig aktivitet',
    stakeholderNoDocs: 'Inga aktuella dokument — potentiellt produktivitetsproblem',
    impactPolitical:
      'Utskottsordföranden har betydande dagordningsmakt. Aktiva utskott ({active}/{total}) formar den lagstiftande pipeline för innevarande session.',
    impactPoliticalNone:
      'Utskottsordföranden har betydande dagordningsmakt. Inga utskott har publicerat aktuella dokument under detta rapportfönster; den lagstiftande pipeline är under uppbyggnad.',
    impactEconomic:
      'Utskottens arbete inom ekonomi, industri och handel påverkar direkt EU:s regleringsmiljöer och affärskonkurrenskraft.',
    impactSocial:
      'Utskott för sociala frågor, sysselsättning och medborgerliga friheter producerar lagstiftning som direkt påverkar medborgarnas dagliga liv.',
    impactLegal:
      '{docs} dokument i olika stadier av utskottsprövning kommer slutligen att skapa eller ändra EU-lagstiftning.',
    impactGeopolitical:
      'Utskottsaktiviteter för utrikesfrågor och internationell handel signalerar föränderliga diplomatiska och handelsmässiga EU-prioriteringar.',
    actionProcessed: '{abbr} behandlade {n} dokument',
    actionConsequence:
      'Lagstiftningsförslag går vidare till nästa steg; berörda intressenter bör förbereda sig för genomförande',
    mistakeDescription:
      'Inga aktuella dokument producerade — lagstiftningsefterskott kan hålla på att utvecklas',
    mistakeAlternative:
      'Sammankalla ytterligare sessioner eller omfördela resurser för att rensa väntande ärenden',
    outlookGood:
      'Med {n} av {total} utskott som aktivt producerar dokument stöder det nuvarande tempot en produktiv plenarkalender.',
    outlookConcern:
      'Den lagstiftande pipeline kan möta flaskhalsar om utskottens produktion inte ökar.',
    lede: 'Analys av Europaparlamentets utskottsaktivitet och lagstiftningseffektivitet.',
    noRecentDocs: 'Inga aktuella dokument tillgängliga',
    committeeMetadataUnavailable:
      'Uppgifter om utskottsordförande och medlemskap är för närvarande inte tillgängliga från EP:s Open Data API för denna rapporteringsperiod. Utskottsaktivitetsövervakning fortsätter med tillgängliga datakällor.',
    adoptedTextsSectionHeading: 'Nyligen antagna texter efter utskottsområde',
    adoptedTextsSummary:
      'Europaparlamentet antog {count} texter under de senaste sessionerna inom miljö-, ekonomi-, säkerhets-, medborgerliga friheter- och jordbrukspolitiska områden.',
    adoptedTextsSummarySingular: 'Europaparlamentet antog 1 text under en nyligen hållen session.',
    committeeNameENVI: 'Miljö, folkhälsa och livsmedelssäkerhet',
    committeeNameECON: 'Ekonomi och valutafrågor',
    committeeNameAFET: 'Utrikesfrågor',
    committeeNameLIBE: 'Medborgerliga fri- och rättigheter samt rättsliga och inrikes frågor',
    committeeNameAGRI: 'Jordbruk och landsbygdens utveckling',
    committeeNameOTHER: 'Tvärsövergripande och plenum',
  },
  da: {
    what: 'Udvalgsaktivitetsrapport pr. {date}: {total} udvalg overvåget, {docs} dokumenter behandlet, {active} udvalg med nylig aktivitet.',
    whatNoData:
      'Udvalgsaktivitetsovervågning pr. {date}: {total} udvalg sporet. Ingen nylige dokumenter var tilgængelige fra EP-datastrømmen for denne rapporteringsperiode.',
    reportDateLabel: 'Rapportdato:',
    membersLabel: 'medlemmer',
    chairLabel: 'Formand:',
    productivityRobust: 'robust',
    productivityModerate: 'moderat',
    productivityLow: 'lav',
    why: 'Udvalgene er Europa-Parlamentets lovgivningsmæssige motor — {pct}% aktiv rate signalerer {descriptor} lovgivningsmæssig produktivitet. Udvalgsresultater former direkte de tekster, der når plenarvoteringer.',
    stakeholderHighlyProductive: '{n} dokumenter — meget produktiv periode',
    stakeholderModerateActivity: '{n} dokument(er) — moderat aktivitet',
    stakeholderNoDocs: 'Ingen nylige dokumenter — potentielt produktivitetsproblem',
    impactPolitical:
      'Udvalgsformænd har betydelig dagsordensættende magt. Aktive udvalg ({active}/{total}) former den lovgivningsmæssige pipeline for den aktuelle session.',
    impactPoliticalNone:
      'Udvalgsformænd har betydelig dagsordensættende magt. Ingen udvalg har offentliggjort nylige dokumenter i dette rapportvindue; den lovgivningsmæssige pipeline er under opbygning.',
    impactEconomic:
      "Udvalgsresultater inden for økonomi, industri og handel påvirker direkte EU's reguleringsmiljøer og erhvervskonkurrenceevne.",
    impactSocial:
      'Udvalg for sociale anliggender, beskæftigelse og borgerlige friheder producerer lovgivning, der direkte påvirker borgernes daglige liv.',
    impactLegal:
      '{docs} dokumenter i forskellige stadier af udvalgsbehandling vil i sidste ende skabe eller ændre EU-lovgivning.',
    impactGeopolitical:
      'Udvalgsaktiviteter for udenrigsanliggender og international handel signalerer udviklende EU-diplomatiske og handelsmæssige prioriteter.',
    actionProcessed: '{abbr} behandlede {n} dokument(er)',
    actionConsequence:
      'Lovgivningsforslag skrider frem til næste trin; berørte interessenter bør forberede sig på gennemførelse',
    mistakeDescription:
      'Ingen nylige dokumenter produceret — lovgivningsmæssig efterslæb kan være under udvikling',
    mistakeAlternative:
      'Indkald yderligere møder eller omfordel ressourcer for at fjerne ventende sager',
    outlookGood:
      'Med {n} af {total} udvalg, der aktivt producerer dokumenter, understøtter det nuværende tempo en produktiv plenarkalender.',
    outlookConcern:
      'Den lovgivningsmæssige pipeline kan møde flaskehalse, hvis udvalgets produktion ikke øges.',
    lede: 'Analyse af Europa-Parlamentets udvalgsaktivitet og lovgivningsmæssig effektivitet.',
    noRecentDocs: 'Ingen nylige dokumenter tilgængelige',
    committeeMetadataUnavailable:
      'Data om udvalgsformand og medlemskab er i øjeblikket ikke tilgængelige fra EP Open Data API for denne rapporteringsperiode. Udvalgsaktivitetsovervågning fortsætter med tilgængelige datakilder.',
    adoptedTextsSectionHeading: 'Nylig vedtagne tekster efter udvalgsemne',
    adoptedTextsSummary:
      'Europa-Parlamentet vedtog {count} tekster under de seneste sessioner inden for miljø-, økonomi-, sikkerheds-, borgerrettigheds- og landbrugspolitiske områder.',
    adoptedTextsSummarySingular: 'Europa-Parlamentet vedtog 1 tekst under en nylig session.',
    committeeNameENVI: 'Miljø, Folkesundhed og Fødevaresikkerhed',
    committeeNameECON: 'Økonomi og Valutaspørgsmål',
    committeeNameAFET: 'Udenrigsanliggender',
    committeeNameLIBE: 'Borgernes Rettigheder og Retlige og Indre Anliggender',
    committeeNameAGRI: 'Landbrug og Landdistrikternes Udvikling',
    committeeNameOTHER: 'Tværgående og Plenarmøde',
  },
  no: {
    what: 'Komitéaktivitetsrapport per {date}: {total} komiteer overvåket, {docs} dokumenter behandlet, {active} komiteer med nylig aktivitet.',
    whatNoData:
      'Komitéaktivitetsovervåkning per {date}: {total} komiteer sporet. Ingen nylige dokumenter var tilgjengelige fra EP-datastrømmen for denne rapporteringsperioden.',
    reportDateLabel: 'Rapportdato:',
    membersLabel: 'medlemmer',
    chairLabel: 'Leder:',
    productivityRobust: 'robust',
    productivityModerate: 'moderat',
    productivityLow: 'lav',
    why: 'Komiteene er Europaparlamentets lovgivende motor — {pct}% aktiv rate signaliserer {descriptor} lovgivende produktivitet. Komitéresultater former direkte tekstene som når plenumstemmer.',
    stakeholderHighlyProductive: '{n} dokumenter — svært produktiv periode',
    stakeholderModerateActivity: '{n} dokument(er) — moderat aktivitet',
    stakeholderNoDocs: 'Ingen nylige dokumenter — potensielt produktivitetsproblem',
    impactPolitical:
      'Komitéledere har betydelig dagsordensmakt. Aktive komiteer ({active}/{total}) former den lovgivende pipeline for den nåværende sesjonen.',
    impactPoliticalNone:
      'Komitéledere har betydelig dagsordensmakt. Ingen komiteer har publisert nylige dokumenter i dette rapportvinduet; den lovgivende pipeline er under utvikling.',
    impactEconomic:
      'Komitéresultater innen økonomi, industri og handel påvirker direkte EUs reguleringsmiljøer og næringskonkurranse.',
    impactSocial:
      'Komiteer for sosiale anliggender, sysselsetting og sivile friheter produserer lovgivning som direkte påvirker borgernes daglige liv.',
    impactLegal:
      '{docs} dokumenter i ulike stadier av komitébehandling vil til slutt skape eller endre EU-lovgivning.',
    impactGeopolitical:
      'Komitéaktiviteter for utenriksanliggender og internasjonal handel signaliserer utviklende EU-diplomatiske og handelsmessige prioriteringer.',
    actionProcessed: '{abbr} behandlet {n} dokument(er)',
    actionConsequence:
      'Lovgivningsforslag går videre til neste trinn; berørte interessenter bør forberede seg på implementering',
    mistakeDescription:
      'Ingen nylige dokumenter produsert — lovgivende etterslep kan være under utvikling',
    mistakeAlternative:
      'Innkall ytterligere sesjoner eller omfordel ressurser for å rydde ventende saker',
    outlookGood:
      'Med {n} av {total} komiteer som aktivt produserer dokumenter, støtter det nåværende tempoet en produktiv plenarkalender.',
    outlookConcern:
      'Den lovgivende pipeline kan møte flaskehalser hvis komitéens produksjon ikke øker.',
    lede: 'Analyse av Europaparlamentets komitéaktivitet og lovgivningseffektivitet.',
    noRecentDocs: 'Ingen nylige dokumenter tilgjengelig',
    committeeMetadataUnavailable:
      'Data om komitéleder og medlemskap er for øyeblikket ikke tilgjengelige fra EP Open Data API for denne rapporteringsperioden. Overvåking av komitéaktivitet fortsetter med tilgjengelige datakilder.',
    adoptedTextsSectionHeading: 'Nylig vedtatte tekster etter komitétema',
    adoptedTextsSummary:
      'Europaparlamentet vedtok {count} tekster under de siste sesjonene innen miljø-, økonomi-, sikkerhets-, borgerrettighets- og landbrukspolitiske områder.',
    adoptedTextsSummarySingular: 'Europaparlamentet vedtok 1 tekst under en nylig sesjon.',
    committeeNameENVI: 'Miljø, Folkehelse og Mattrygghet',
    committeeNameECON: 'Økonomi og Valutaspørsmål',
    committeeNameAFET: 'Utenrikssaker',
    committeeNameLIBE: 'Borgerrettigheter og Rettslige og Indre Anliggender',
    committeeNameAGRI: 'Landbruk og Bygdeutvikling',
    committeeNameOTHER: 'Tverrgående og Plenarmøte',
  },
  fi: {
    what: 'Valiokuntatoimintaraportti {date}: {total} valiokuntaa seurannassa, {docs} asiakirjaa käsitelty, {active} valiokuntaa viimeaikaisella toiminnalla.',
    whatNoData:
      'Valiokuntatoiminnan seuranta {date}: {total} valiokuntaa seurannassa. EP:n datavirrasta ei ollut saatavilla uusia asiakirjoja tällä raportointijaksolla.',
    reportDateLabel: 'Raportointipäivä:',
    membersLabel: 'jäsentä',
    chairLabel: 'Puheenjohtaja:',
    productivityRobust: 'vankka',
    productivityModerate: 'kohtalainen',
    productivityLow: 'alhainen',
    why: 'Valiokunnat ovat Euroopan parlamentin lainsäädäntömoottori — {pct}%:n aktiivisuusaste merkitsee {descriptor} lainsäädäntötuottavuutta. Valiokuntien tuotokset muovaavat suoraan täysistuntoäänestyksiin päätyviä tekstejä.',
    stakeholderHighlyProductive: '{n} asiakirjaa — erittäin tuottoisa kausi',
    stakeholderModerateActivity: '{n} asiakirja(a) — kohtalainen aktiivisuus',
    stakeholderNoDocs: 'Ei viimeaikaisia asiakirjoja — mahdollinen tuottavuusongelma',
    impactPolitical:
      'Valiokuntien puheenjohtajilla on merkittävä esityslistalle asettamisen valta. Aktiiviset valiokunnat ({active}/{total}) muovaavat nykyisen istuntokauden lainsäädäntöprosessia.',
    impactPoliticalNone:
      'Valiokuntien puheenjohtajilla on merkittävä esityslistalle asettamisen valta. Yksikään valiokunta ei ole julkaissut viimeaikaisia asiakirjoja tänä raportointijaksona; lainsäädäntöprosessi on kehitysvaiheessa.',
    impactEconomic:
      'Valiokuntien tuotokset talous-, teollisuus- ja kauppa-asioissa vaikuttavat suoraan EU:n sääntelymiljöihin ja liiketoiminnan kilpailukykyyn.',
    impactSocial:
      'Sosiaali-, työllisyys- ja kansalaisvapauksien valiokunnat tuottavat lainsäädäntöä, joka vaikuttaa suoraan kansalaisten jokapäiväiseen elämään.',
    impactLegal:
      '{docs} asiakirjaa eri vaiheissa valiokuntakäsittelyä tulee lopulta luomaan tai muuttamaan EU:n lainsäädäntöä.',
    impactGeopolitical:
      'Ulkoasioiden ja kansainvälisen kaupan valiokuntien toiminta merkitsee EU:n kehittyvien diplomatia- ja kauppaprioriteetien muutoksia.',
    actionProcessed: '{abbr} käsitteli {n} asiakirja(a)',
    actionConsequence:
      'Lainsäädäntöehdotukset etenevät seuraavaan vaiheeseen; asianomaisten sidosryhmien tulisi valmistautua täytäntöönpanoon',
    mistakeDescription:
      'Ei viimeaikaisia asiakirjoja tuotettu — lainsäädäntörästejä saattaa olla kehittymässä',
    mistakeAlternative:
      'Kokoontukaa lisäistunnoille tai kohdentakaa resursseja uudelleen odottavien asioiden selvittämiseksi',
    outlookGood:
      'Kun {n}/{total} valiokuntaa tuottaa aktiivisesti asiakirjoja, nykyinen tahti tukee tuottoisaa täysistuntokalenteria.',
    outlookConcern:
      'Lainsäädäntöprosessi saattaa kohdata pullonkauloja, jos valiokuntien tuotanto ei kasva.',
    lede: 'Analyysi Euroopan parlamentin valiokuntien toiminnasta ja lainsäädäntötehokkuudesta.',
    noRecentDocs: 'Ei viimeaikaisia asiakirjoja saatavilla',
    committeeMetadataUnavailable:
      'Valiokunnan puheenjohtajan ja jäsenyyden tiedot eivät ole tällä hetkellä saatavilla EP:n Open Data -rajapinnasta tältä raportointijaksolta. Valiokuntien toiminnan seuranta jatkuu käytettävissä olevilla tietolähteillä.',
    adoptedTextsSectionHeading: 'Viimeksi hyväksytyt tekstit valiokunta-aiheen mukaan',
    adoptedTextsSummary:
      'Euroopan parlamentti hyväksyi {count} tekstiä viimeisimmissä istunnoissaan ympäristö-, talous-, turvallisuus-, kansalaisvapauksien ja maatalouspolitiikan aloilla.',
    adoptedTextsSummarySingular:
      'Euroopan parlamentti hyväksyi 1 tekstin äskettäisessä istunnossaan.',
    committeeNameENVI: 'Ympäristö, kansanterveys ja elintarvikkeiden turvallisuus',
    committeeNameECON: 'Talous- ja raha-asiat',
    committeeNameAFET: 'Ulkoasiat',
    committeeNameLIBE: 'Kansalaisvapaudet sekä oikeus- ja sisäasiat',
    committeeNameAGRI: 'Maatalous ja maaseudun kehittäminen',
    committeeNameOTHER: 'Monialatoimikunta ja täysistunto',
  },
  de: {
    what: 'Ausschussaktivitätsbericht vom {date}: {total} Ausschüsse beobachtet, {docs} Dokumente verarbeitet, {active} Ausschüsse mit aktueller Aktivität.',
    whatNoData:
      'Ausschussaktivitätsüberwachung vom {date}: {total} Ausschüsse verfolgt. Für diesen Berichtszeitraum waren keine aktuellen Dokumente aus dem EP-Datenfeed verfügbar.',
    reportDateLabel: 'Berichtsdatum:',
    membersLabel: 'Mitglieder',
    chairLabel: 'Vorsitzender:',
    productivityRobust: 'robuste',
    productivityModerate: 'moderate',
    productivityLow: 'geringe',
    why: 'Ausschüsse sind die Gesetzgebungsmaschine des Europäischen Parlaments — {pct}% Aktivitätsrate signalisiert {descriptor} Gesetzgebungsproduktivität. Ausschussergebnisse gestalten direkt die Texte, die zur Plenarvorabstimmung gelangen.',
    stakeholderHighlyProductive: '{n} Dokumente — sehr produktiver Zeitraum',
    stakeholderModerateActivity: '{n} Dokument(e) — moderate Aktivität',
    stakeholderNoDocs: 'Keine aktuellen Dokumente — mögliches Produktivitätsproblem',
    impactPolitical:
      'Ausschussvorsitzende haben erhebliche Tagesordnungsmacht. Aktive Ausschüsse ({active}/{total}) gestalten den Gesetzgebungsprozess der laufenden Session.',
    impactPoliticalNone:
      'Ausschussvorsitzende haben erhebliche Tagesordnungsmacht. Kein Ausschuss hat in diesem Berichtszeitraum aktuelle Dokumente veröffentlicht; der Gesetzgebungsprozess ist im Aufbau.',
    impactEconomic:
      'Ausschussergebnisse in Wirtschafts-, Industrie- und Handelsfragen beeinflussen direkt das EU-Regulierungsumfeld und die Wettbewerbsfähigkeit.',
    impactSocial:
      'Ausschüsse für Soziales, Beschäftigung und bürgerliche Freiheiten erarbeiten Gesetze, die das tägliche Leben der Bürger direkt betreffen.',
    impactLegal:
      '{docs} Dokumente in verschiedenen Stadien der Ausschussbehandlung werden schließlich EU-Recht schaffen oder ändern.',
    impactGeopolitical:
      'Ausschussaktivitäten in Außen- und Handelsfragen signalisieren die Entwicklung diplomatischer und handelspolitischer Prioritäten der EU.',
    actionProcessed: '{abbr} hat {n} Dokument(e) bearbeitet',
    actionConsequence:
      'Gesetzgebungsvorschläge schreiten zur nächsten Stufe voran; betroffene Interessenträger sollten sich auf die Umsetzung vorbereiten',
    mistakeDescription:
      'Keine aktuellen Dokumente erstellt — Gesetzgebungsrückstand könnte sich entwickeln',
    mistakeAlternative:
      'Zusätzliche Sitzungen einberufen oder Ressourcen umverteilen, um ausstehende Akten zu klären',
    outlookGood:
      'Mit {n} von {total} Ausschüssen, die aktiv Dokumente erstellen, unterstützt das aktuelle Tempo einen produktiven Plenarkalender.',
    outlookConcern:
      'Die Gesetzgebungspipeline könnte auf Engpässe stoßen, wenn die Ausschussproduktion nicht zunimmt.',
    lede: 'Analyse der Ausschusstätigkeit des Europäischen Parlaments und seiner Gesetzgebungswirksamkeit.',
    noRecentDocs: 'Keine aktuellen Dokumente verfügbar',
    committeeMetadataUnavailable:
      'Daten zu Ausschussvorsitz und Mitgliedschaft sind für diesen Berichtszeitraum derzeit nicht über die EP Open Data API verfügbar. Die Überwachung der Ausschusstätigkeit wird mit den verfügbaren Datenquellen fortgesetzt.',
    adoptedTextsSectionHeading: 'Kürzlich angenommene Texte nach Ausschussthema',
    adoptedTextsSummary:
      'Das Europäische Parlament hat in den letzten Sitzungsperioden {count} Texte in den Bereichen Umwelt-, Wirtschafts-, Sicherheits-, Bürgerrechte- und Agrarpolitik verabschiedet.',
    adoptedTextsSummarySingular:
      'Das Europäische Parlament hat in einer aktuellen Sitzungsperiode 1 Text verabschiedet.',
    committeeNameENVI: 'Umweltfragen, öffentliche Gesundheit und Lebensmittelsicherheit',
    committeeNameECON: 'Wirtschaft und Währung',
    committeeNameAFET: 'Auswärtige Angelegenheiten',
    committeeNameLIBE: 'Bürgerliche Freiheiten, Justiz und Inneres',
    committeeNameAGRI: 'Landwirtschaft und ländliche Entwicklung',
    committeeNameOTHER: 'Ausschussübergreifend und Plenum',
  },
  fr: {
    what: "Rapport d'activité des commissions du {date} : {total} commissions surveillées, {docs} documents traités, {active} commissions avec activité récente.",
    whatNoData:
      "Surveillance des activités des commissions du {date} : {total} commissions suivies. Aucun document récent n'était disponible depuis le flux de données du PE pour cette période de rapport.",
    reportDateLabel: 'Date du rapport :',
    membersLabel: 'membres',
    chairLabel: 'Président(e) :',
    productivityRobust: 'robuste',
    productivityModerate: 'modérée',
    productivityLow: 'faible',
    why: "Les commissions sont le moteur législatif du Parlement européen — un taux d'activité de {pct}% signale une productivité législative {descriptor}. Les résultats des commissions façonnent directement les textes soumis aux votes en séance plénière.",
    stakeholderHighlyProductive: '{n} documents — période très productive',
    stakeholderModerateActivity: '{n} document(s) — activité modérée',
    stakeholderNoDocs: 'Aucun document récent — préoccupation potentielle de productivité',
    impactPolitical:
      "Les présidents de commission exercent un pouvoir considérable sur la définition de l'ordre du jour. Les commissions actives ({active}/{total}) façonnent le pipeline législatif de la session en cours.",
    impactPoliticalNone:
      "Les présidents de commission exercent un pouvoir considérable sur la définition de l'ordre du jour. Aucune commission n'a publié de documents récents au cours de cette période ; le pipeline législatif est en cours de développement.",
    impactEconomic:
      "Les résultats des commissions sur les affaires économiques, industrielles et commerciales affectent directement les environnements réglementaires de l'UE et la compétitivité des entreprises.",
    impactSocial:
      "Les commissions chargées des affaires sociales, de l'emploi et des libertés civiles produisent des lois qui ont un impact direct sur la vie quotidienne des citoyens.",
    impactLegal:
      "{docs} documents à différents stades d'examen en commission créeront ou modifieront à terme le droit de l'UE.",
    impactGeopolitical:
      "Les activités des commissions chargées des affaires étrangères et du commerce international signalent l'évolution des priorités diplomatiques et commerciales de l'UE.",
    actionProcessed: '{abbr} a traité {n} document(s)',
    actionConsequence:
      "Les propositions législatives progressent vers l'étape suivante ; les parties prenantes concernées doivent se préparer à la mise en œuvre",
    mistakeDescription:
      'Aucun document récent produit — un arriéré législatif pourrait se développer',
    mistakeAlternative:
      'Convoquer des séances supplémentaires ou réaffecter des ressources pour traiter les dossiers en attente',
    outlookGood:
      'Avec {n} commissions sur {total} produisant activement des documents, le rythme actuel soutient un calendrier plénaire productif.',
    outlookConcern:
      "Le pipeline législatif pourrait rencontrer des goulots d'étranglement si la production des commissions n'augmente pas.",
    lede: "Analyse de l'activité des commissions du Parlement européen et de l'efficacité législative.",
    noRecentDocs: 'Aucun document récent disponible',
    committeeMetadataUnavailable:
      "Les données sur le président et les membres des commissions ne sont actuellement pas disponibles via l'API Open Data du PE pour cette période de rapport. La surveillance de l'activité des commissions se poursuit avec les sources de données disponibles.",
    adoptedTextsSectionHeading: 'Textes récemment adoptés par thème de commission',
    adoptedTextsSummary:
      'Le Parlement européen a adopté {count} textes lors des sessions récentes, couvrant les domaines de la politique environnementale, économique, sécuritaire, des libertés civiles et agricole.',
    adoptedTextsSummarySingular:
      "Le Parlement européen a adopté 1 texte lors d'une session récente.",
    committeeNameENVI: 'Environnement, santé publique et sécurité alimentaire',
    committeeNameECON: 'Affaires économiques et monétaires',
    committeeNameAFET: 'Affaires étrangères',
    committeeNameLIBE: 'Libertés civiles, justice et affaires intérieures',
    committeeNameAGRI: 'Agriculture et développement rural',
    committeeNameOTHER: 'Intercommissions et plénière',
  },
  es: {
    what: 'Informe de actividad de las comisiones a fecha {date}: {total} comisiones supervisadas, {docs} documentos procesados, {active} comisiones con actividad reciente.',
    whatNoData:
      'Monitoreo de actividad de las comisiones a fecha {date}: {total} comisiones rastreadas. No había documentos recientes disponibles del feed de datos del PE para este período de informe.',
    reportDateLabel: 'Fecha del informe:',
    membersLabel: 'miembros',
    chairLabel: 'Presidente/a:',
    productivityRobust: 'sólida',
    productivityModerate: 'moderada',
    productivityLow: 'baja',
    why: 'Las comisiones son el motor legislativo del Parlamento Europeo — una tasa de actividad del {pct}% indica una productividad legislativa {descriptor}. Los resultados de las comisiones moldean directamente los textos que llegan a las votaciones plenarias.',
    stakeholderHighlyProductive: '{n} documentos — período muy productivo',
    stakeholderModerateActivity: '{n} documento(s) — actividad moderada',
    stakeholderNoDocs: 'No hay documentos recientes — posible preocupación de productividad',
    impactPolitical:
      'Los presidentes de comisión ejercen un poder considerable en la fijación del orden del día. Las comisiones activas ({active}/{total}) están configurando el proceso legislativo para la sesión actual.',
    impactPoliticalNone:
      'Los presidentes de comisión ejercen un poder considerable en la fijación del orden del día. Ninguna comisión ha publicado documentos recientes en este período de informe; el proceso legislativo está en desarrollo.',
    impactEconomic:
      'Los resultados de las comisiones en materia económica, industrial y comercial afectan directamente a los entornos regulatorios de la UE y la competitividad empresarial.',
    impactSocial:
      'Las comisiones de asuntos sociales, empleo y libertades civiles producen legislación que afecta directamente a la vida cotidiana de los ciudadanos.',
    impactLegal:
      '{docs} documentos en diversas etapas de consideración en comisión crearán o modificarán eventualmente el derecho de la UE.',
    impactGeopolitical:
      'Las actividades de las comisiones de asuntos exteriores y comercio internacional señalan la evolución de las prioridades diplomáticas y comerciales de la UE.',
    actionProcessed: '{abbr} procesó {n} documento(s)',
    actionConsequence:
      'Las propuestas legislativas avanzan a la siguiente etapa; las partes interesadas afectadas deben prepararse para la implementación',
    mistakeDescription:
      'No se han producido documentos recientes — puede estar desarrollándose un retraso legislativo',
    mistakeAlternative:
      'Convocar sesiones adicionales o reasignar recursos para resolver los expedientes pendientes',
    outlookGood:
      'Con {n} de {total} comisiones produciendo documentos activamente, el ritmo actual sostiene un calendario plenario productivo.',
    outlookConcern:
      'El proceso legislativo puede enfrentarse a cuellos de botella si la producción de las comisiones no aumenta.',
    lede: 'Análisis de la actividad de las comisiones del Parlamento Europeo y de su efectividad legislativa.',
    noRecentDocs: 'No hay documentos recientes disponibles',
    committeeMetadataUnavailable:
      'Los datos sobre el presidente y la membresía de las comisiones no están disponibles actualmente a través de la API Open Data del PE para este período de informe. El monitoreo de la actividad de las comisiones continúa con las fuentes de datos disponibles.',
    adoptedTextsSectionHeading: 'Textos recientemente adoptados por tema de comisión',
    adoptedTextsSummary:
      'El Parlamento Europeo adoptó {count} textos en las sesiones recientes, abarcando los dominios de la política medioambiental, económica, de seguridad, de libertades civiles y agrícola.',
    adoptedTextsSummarySingular: 'El Parlamento Europeo adoptó 1 texto en una sesión reciente.',
    committeeNameENVI: 'Medio Ambiente, Salud Pública y Seguridad Alimentaria',
    committeeNameECON: 'Asuntos Económicos y Monetarios',
    committeeNameAFET: 'Asuntos Exteriores',
    committeeNameLIBE: 'Libertades Civiles, Justicia y Asuntos de Interior',
    committeeNameAGRI: 'Agricultura y Desarrollo Rural',
    committeeNameOTHER: 'Intercomisiones y Plenario',
  },
  nl: {
    what: 'Rapport commissieactiviteiten per {date}: {total} commissies gemonitord, {docs} documenten verwerkt, {active} commissies met recente activiteit.',
    whatNoData:
      'Commissieactiviteitsbewaking per {date}: {total} commissies gevolgd. Er waren geen recente documenten beschikbaar vanuit de EP-gegevensfeed voor deze rapportageperiode.',
    reportDateLabel: 'Rapportdatum:',
    membersLabel: 'leden',
    chairLabel: 'Voorzitter:',
    productivityRobust: 'robuuste',
    productivityModerate: 'matige',
    productivityLow: 'lage',
    why: 'Commissies zijn de wetgevende motor van het Europees Parlement — {pct}% activiteitsgraad duidt op {descriptor} wetgevende productiviteit. Commissieresultaten bepalen direct de teksten die ter stemming in de plenaire vergadering komen.',
    stakeholderHighlyProductive: '{n} documenten — zeer productieve periode',
    stakeholderModerateActivity: '{n} document(en) — matige activiteit',
    stakeholderNoDocs: 'Geen recente documenten — mogelijke productiviteitszorg',
    impactPolitical:
      'Commissievoorzitters hebben aanzienlijke agendavormende macht. Actieve commissies ({active}/{total}) bepalen de wetgevende pipeline voor de huidige zitting.',
    impactPoliticalNone:
      'Commissievoorzitters hebben aanzienlijke agendavormende macht. Geen enkele commissie heeft in dit rapportagevenster recente documenten gepubliceerd; de wetgevende pipeline is in ontwikkeling.',
    impactEconomic:
      'Commissieresultaten op het gebied van economische zaken, industrie en handel beïnvloeden direct de EU-regelgevingsomgevingen en het bedrijfsconcurrentievermogen.',
    impactSocial:
      'Commissies voor sociale zaken, werkgelegenheid en burgerlijke vrijheden produceren wetgeving die direct invloed heeft op het dagelijks leven van burgers.',
    impactLegal:
      '{docs} documenten in verschillende stadia van commissiebehandeling zullen uiteindelijk EU-recht creëren of wijzigen.',
    impactGeopolitical:
      'Commissieactiviteiten inzake buitenlandse zaken en internationale handel duiden op de ontwikkeling van diplomatieke en handelsmatige EU-prioriteiten.',
    actionProcessed: '{abbr} verwerkte {n} document(en)',
    actionConsequence:
      'Wetgevingsvoorstellen ronden de volgende stap af; betrokken belanghebbenden dienen zich voor te bereiden op implementatie',
    mistakeDescription:
      'Geen recente documenten geproduceerd — wetgevingsachterstand kan zich ontwikkelen',
    mistakeAlternative:
      'Extra zittingen bijeenroepen of middelen herindelen om lopende dossiers af te handelen',
    outlookGood:
      'Met {n} van {total} commissies die actief documenten produceren, ondersteunt het huidige tempo een productieve plenaire agenda.',
    outlookConcern:
      'De wetgevende pipeline kan knelpunten ondervinden als de commissieproductie niet toeneemt.',
    lede: 'Analyse van commissieactiviteiten en wetgevende effectiviteit van het Europees Parlement.',
    noRecentDocs: 'Geen recente documenten beschikbaar',
    committeeMetadataUnavailable:
      'Gegevens over de voorzitter en het lidmaatschap van commissies zijn momenteel niet beschikbaar via de EP Open Data API voor deze rapportageperiode. De monitoring van commissieactiviteiten gaat door met de beschikbare gegevensbronnen.',
    adoptedTextsSectionHeading: 'Recent aangenomen teksten per commissiethema',
    adoptedTextsSummary:
      'Het Europees Parlement nam {count} teksten aan in recente plenaire vergaderingen over milieu-, economisch, veiligheids-, burgerlijke vrijheden- en landbouwbeleid.',
    adoptedTextsSummarySingular:
      'Het Europees Parlement nam 1 tekst aan in een recente plenaire vergadering.',
    committeeNameENVI: 'Milieubeheer, volksgezondheid en voedselveiligheid',
    committeeNameECON: 'Economische en monetaire zaken',
    committeeNameAFET: 'Buitenlandse zaken',
    committeeNameLIBE: 'Burgerlijke vrijheden, justitie en binnenlandse zaken',
    committeeNameAGRI: 'Landbouw en plattelandsontwikkeling',
    committeeNameOTHER: 'Commissieoverstijgend en Plenaire',
  },
  ar: {
    what: 'تقرير نشاط اللجان بتاريخ {date}: {total} لجنة مراقبة، {docs} وثيقة معالجة، {active} لجنة ذات نشاط حديث.',
    whatNoData:
      'مراقبة نشاط اللجان بتاريخ {date}: {total} لجنة متابعة. لم تكن هناك وثائق حديثة متاحة من موجز بيانات البرلمان الأوروبي لفترة التقرير هذه.',
    reportDateLabel: 'تاريخ التقرير:',
    membersLabel: 'عضو',
    chairLabel: 'الرئيس:',
    productivityRobust: 'قوية',
    productivityModerate: 'معتدلة',
    productivityLow: 'ضعيفة',
    why: 'تُعدّ اللجان المحرك التشريعي للبرلمان الأوروبي — تُشير نسبة النشاط {pct}٪ إلى إنتاجية تشريعية {descriptor}. تُشكّل مخرجات اللجان مباشرةً النصوص التي تصل إلى تصويتات الجلسة العامة.',
    stakeholderHighlyProductive: '{n} وثيقة — فترة منتجة جداً',
    stakeholderModerateActivity: '{n} وثيقة/وثائق — نشاط معتدل',
    stakeholderNoDocs: 'لا وثائق حديثة — مخاوف إنتاجية محتملة',
    impactPolitical:
      'يتمتع رؤساء اللجان بسلطة تحديد جدول الأعمال. تُشكّل اللجان النشطة ({active}/{total}) مسار التشريع للدورة الحالية.',
    impactPoliticalNone:
      'يتمتع رؤساء اللجان بسلطة تحديد جدول الأعمال. لم تنشر أيٌّ من اللجان وثائق حديثة خلال هذه الفترة؛ مسار التشريع قيد التطوير.',
    impactEconomic:
      'تؤثر مخرجات اللجان في الشؤون الاقتصادية والصناعية والتجارية مباشرةً على بيئات اللوائح التنظيمية الأوروبية وتنافسية الأعمال.',
    impactSocial:
      'تُنتج لجان الشؤون الاجتماعية والتوظيف والحريات المدنية تشريعات تؤثر مباشرةً على الحياة اليومية للمواطنين.',
    impactLegal:
      'ستُنشئ {docs} وثيقة في مراحل مختلفة من الدراسة باللجان أو تُعدّل القانون الأوروبي في نهاية المطاف.',
    impactGeopolitical:
      'تُشير أنشطة لجان الشؤون الخارجية والتجارة الدولية إلى تطور الأولويات الدبلوماسية والتجارية للاتحاد الأوروبي.',
    actionProcessed: 'عالجت لجنة {abbr} {n} وثيقة/وثائق',
    actionConsequence:
      'تتقدم المقترحات التشريعية إلى المرحلة التالية؛ ينبغي على أصحاب المصلحة المعنيين الاستعداد للتنفيذ',
    mistakeDescription: 'لم تُنتج وثائق حديثة — قد تتشكّل متأخرات تشريعية',
    mistakeAlternative: 'عقد جلسات إضافية أو إعادة تخصيص الموارد لمعالجة الملفات المعلقة',
    outlookGood:
      'مع إنتاج {n} من {total} لجنة للوثائق بصورة نشطة، يدعم الوتيرة الحالية جدولاً جلسةً عامة منتجاً.',
    outlookConcern: 'قد يواجه المسار التشريعي اختناقات إذا لم يزداد إنتاج اللجان.',
    lede: 'تحليل نشاط لجان البرلمان الأوروبي وفعالية عملها التشريعية.',
    noRecentDocs: 'لا توجد وثائق حديثة متاحة',
    committeeMetadataUnavailable:
      'بيانات رئيس اللجنة والعضوية غير متاحة حالياً من خلال واجهة برمجة تطبيقات EP Open Data لفترة الإبلاغ هذه. تستمر مراقبة نشاط اللجان بمصادر البيانات المتاحة.',
    adoptedTextsSectionHeading: 'النصوص المعتمدة مؤخراً حسب موضوع اللجنة',
    adoptedTextsSummary:
      'اعتمد البرلمان الأوروبي {count} نصاً في الجلسات الأخيرة، تشمل مجالات السياسات البيئية والاقتصادية والأمنية والحريات المدنية والزراعية.',
    adoptedTextsSummarySingular: 'اعتمد البرلمان الأوروبي نصاً واحداً في جلسة أخيرة.',
    committeeNameENVI: 'البيئة والصحة العامة وسلامة الغذاء',
    committeeNameECON: 'الشؤون الاقتصادية والنقدية',
    committeeNameAFET: 'الشؤون الخارجية',
    committeeNameLIBE: 'الحريات المدنية والعدالة والشؤون الداخلية',
    committeeNameAGRI: 'الزراعة والتنمية الريفية',
    committeeNameOTHER: 'بين اللجان والجلسة العامة',
  },
  he: {
    what: 'דוח פעילות ועדות מתאריך {date}: {total} ועדות במעקב, {docs} מסמכים עובדו, {active} ועדות עם פעילות אחרונה.',
    whatNoData:
      'מעקב אחר פעילות ועדות מתאריך {date}: {total} ועדות במעקב. לא היו מסמכים אחרונים זמינים מעדכון הנתונים של הפרלמנט האירופי לחלון דיווח זה.',
    reportDateLabel: 'תאריך הדוח:',
    membersLabel: 'חברים',
    chairLabel: 'יו"ר:',
    productivityRobust: 'חזקה',
    productivityModerate: 'מתונה',
    productivityLow: 'נמוכה',
    why: 'הוועדות הן המנוע החקיקתי של הפרלמנט האירופי — שיעור פעילות של {pct}% מצביע על פריון חקיקתי {descriptor}. תפוקות הוועדות מעצבות ישירות את הטקסטים המגיעים להצבעות מליאה.',
    stakeholderHighlyProductive: '{n} מסמכים — תקופה פרודוקטיבית מאוד',
    stakeholderModerateActivity: '{n} מסמך/ים — פעילות מתונה',
    stakeholderNoDocs: 'אין מסמכים אחרונים — חשש פוטנציאלי לפריון',
    impactPolitical:
      'לראשי ועדות יש כוח קביעת סדר יום משמעותי. ועדות פעילות ({active}/{total}) מעצבות את צינור החקיקה לפגישה הנוכחית.',
    impactPoliticalNone:
      'לראשי ועדות יש כוח קביעת סדר יום משמעותי. אף ועדה לא פרסמה מסמכים אחרונים בחלון דיווח זה; צינור החקיקה נמצא בשלב פיתוח.',
    impactEconomic:
      'תפוקות הוועדות בענייני כלכלה, תעשייה ומסחר משפיעות ישירות על סביבות הרגולציה של האיחוד האירופי ועל תחרותיות העסקים.',
    impactSocial:
      'ועדות ענייני חברה, תעסוקה וחירויות אזרחיות מייצרות חקיקה המשפיעה ישירות על חייהם היומיומיים של האזרחים.',
    impactLegal:
      '{docs} מסמכים בשלבים שונים של דיון ועדה יצרו או ישנו בסופו של דבר את חוק האיחוד האירופי.',
    impactGeopolitical:
      'פעילויות ועדות ענייני החוץ והסחר הבינלאומי מצביעות על התפתחות עדיפויות דיפלומטיות ומסחריות של האיחוד האירופי.',
    actionProcessed: '{abbr} עיבד {n} מסמך/ים',
    actionConsequence: 'הצעות חוק מתקדמות לשלב הבא; בעלי עניין מושפעים צריכים להתכונן ליישום',
    mistakeDescription: 'לא הופקו מסמכים אחרונים — עיכוב חקיקתי עלול להתפתח',
    mistakeAlternative: 'לכנס ישיבות נוספות או להקצות מחדש משאבים לטיפול בתיקים ממתינים',
    outlookGood:
      'עם {n} מתוך {total} ועדות המייצרות מסמכים באופן פעיל, הקצב הנוכחי תומך בלוח שנה פרודוקטיבי של מליאה.',
    outlookConcern: 'צינור החקיקה עלול להיתקל בצווארי בקבוק אם תפוקת הוועדה לא תגדל.',
    lede: 'ניתוח פעילות ועדות הפרלמנט האירופי ויעילותו החקיקתית.',
    noRecentDocs: 'אין מסמכים אחרונים זמינים',
    committeeMetadataUnavailable:
      'נתוני יו"ר הוועדה וחברותה אינם זמינים כרגע דרך ממשק ה-API של EP Open Data לתקופת הדיווח זו. ניטור פעילות הוועדות ממשיך עם מקורות הנתונים הזמינים.',
    adoptedTextsSectionHeading: 'טקסטים שהתקבלו לאחרונה לפי נושא ועדה',
    adoptedTextsSummary:
      'הפרלמנט האירופי אישר {count} טקסטים בפגישות האחרונות, הכוללים תחומי מדיניות סביבתית, כלכלית, ביטחונית, חירויות אזרחיות וחקלאית.',
    adoptedTextsSummarySingular: 'הפרלמנט האירופי אישר טקסט אחד בפגישה האחרונה.',
    committeeNameENVI: 'איכות הסביבה, בריאות הציבור ובטיחות המזון',
    committeeNameECON: 'ענייני כלכלה ומטבע',
    committeeNameAFET: 'ענייני חוץ',
    committeeNameLIBE: 'חירויות אזרחיות, צדק וענייני פנים',
    committeeNameAGRI: 'חקלאות ופיתוח כפרי',
    committeeNameOTHER: 'בין-ועדתי ומליאה',
  },
  ja: {
    what: '{date}付け委員会活動報告: {total}委員会を監視中、{docs}文書処理済み、{active}委員会で最近の活動あり。',
    whatNoData:
      '{date}付け委員会活動監視：{total}委員会を追跡中。このレポート期間にEPデータフィードから入手可能な最新文書はありませんでした。',
    reportDateLabel: '報告日:',
    membersLabel: '名',
    chairLabel: '委員長:',
    productivityRobust: '堅調な',
    productivityModerate: '中程度の',
    productivityLow: '低い',
    why: '委員会は欧州議会の立法エンジンです — 活動率{pct}%は{descriptor}立法生産性を示しています。委員会の成果物は、本会議投票に提出されるテキストを直接形成します。',
    stakeholderHighlyProductive: '{n}文書 — 非常に生産的な期間',
    stakeholderModerateActivity: '{n}文書 — 中程度の活動',
    stakeholderNoDocs: '最近の文書なし — 生産性に関する懸念の可能性',
    impactPolitical:
      '委員会委員長は重要な議題設定権を持っています。活発な委員会({active}/{total})が現会期の立法パイプラインを形成しています。',
    impactPoliticalNone:
      '委員会委員長は重要な議題設定権を持っています。この報告期間中に最近の文書を公開した委員会はありません。立法パイプラインは開発中です。',
    impactEconomic:
      '経済、産業、貿易問題に関する委員会の成果物はEU規制環境とビジネス競争力に直接影響します。',
    impactSocial:
      '社会問題、雇用、市民の自由を担当する委員会は、市民の日常生活に直接影響する法律を制定しています。',
    impactLegal:
      '委員会審議のさまざまな段階にある{docs}文書は、最終的にEU法を創設または改正することになります。',
    impactGeopolitical:
      '外交問題と国際貿易の委員会活動は、EUの外交・貿易優先事項の変化を示しています。',
    actionProcessed: '{abbr}が{n}文書を処理しました',
    actionConsequence:
      '立法提案が次の段階に進みます。関係するステークホルダーは実施に向けて準備が必要です',
    mistakeDescription: '最近の文書が作成されていません — 立法の遅延が発生する可能性があります',
    mistakeAlternative:
      '追加会議を招集するか、係属中のファイルを処理するためにリソースを再配分してください',
    outlookGood:
      '{total}委員会中{n}委員会が積極的に文書を作成しており、現在のペースは生産的な本会議カレンダーを支えています。',
    outlookConcern:
      '委員会の文書作成が増加しない場合、立法パイプラインにボトルネックが生じる可能性があります。',
    lede: '欧州議会委員会の最近の立法成果と活動の有効性を分析します。',
    noRecentDocs: '最近の文書はありません',
    committeeMetadataUnavailable:
      '委員会の委員長および構成員データは、この報告期間において EP Open Data API から現在入手できません。委員会活動の監視は利用可能なデータソースで継続します。',
    adoptedTextsSectionHeading: '委員会テーマ別の最近採択されたテキスト',
    adoptedTextsSummary:
      '欧州議会は最近の会期に{count}件のテキストを採択し、環境、経済、安全保障、市民的自由、農業政策の分野をカバーしています。',
    adoptedTextsSummarySingular: '欧州議会は最近の会期に1件のテキストを採択しました。',
    committeeNameENVI: '環境・公衆衛生・食品安全',
    committeeNameECON: '経済・通貨問題',
    committeeNameAFET: '外交問題',
    committeeNameLIBE: '市民的自由・司法・内務',
    committeeNameAGRI: '農業・農村開発',
    committeeNameOTHER: '委員会横断・本会議',
  },
  ko: {
    what: '{date} 기준 위원회 활동 보고서: {total}개 위원회 모니터링, {docs}개 문서 처리, {active}개 위원회 최근 활동.',
    whatNoData:
      '{date} 기준 위원회 활동 모니터링: {total}개 위원회 추적 중. 이 보고 기간에 EP 데이터 피드에서 사용 가능한 최근 문서가 없었습니다.',
    reportDateLabel: '보고 날짜:',
    membersLabel: '명',
    chairLabel: '의장:',
    productivityRobust: '강력한',
    productivityModerate: '보통의',
    productivityLow: '낮은',
    why: '위원회는 유럽 의회의 입법 엔진입니다 — 활동률 {pct}%는 {descriptor} 입법 생산성을 나타냅니다. 위원회 결과물은 본회의 투표에 상정되는 텍스트를 직접 형성합니다.',
    stakeholderHighlyProductive: '{n}개 문서 — 매우 생산적인 기간',
    stakeholderModerateActivity: '{n}개 문서 — 보통 활동',
    stakeholderNoDocs: '최근 문서 없음 — 잠재적 생산성 우려',
    impactPolitical:
      '위원회 의장들은 의사일정 설정에 상당한 권한을 가집니다. 활동적인 위원회({active}/{total})가 현 회기의 입법 파이프라인을 형성하고 있습니다.',
    impactPoliticalNone:
      '위원회 의장들은 의사일정 설정에 상당한 권한을 가집니다. 이 보고 기간에 최근 문서를 발행한 위원회가 없습니다. 입법 파이프라인은 개발 중입니다.',
    impactEconomic:
      '경제, 산업, 무역 문제에 관한 위원회 결과물은 EU 규제 환경과 기업 경쟁력에 직접적인 영향을 미칩니다.',
    impactSocial:
      '사회 문제, 고용, 시민 자유 위원회는 시민들의 일상생활에 직접적인 영향을 미치는 법률을 제정합니다.',
    impactLegal:
      '위원회 심의의 다양한 단계에 있는 {docs}개 문서는 궁극적으로 EU 법률을 만들거나 수정할 것입니다.',
    impactGeopolitical:
      '외교 문제 및 국제 무역 위원회 활동은 EU의 외교 및 무역 우선순위의 변화를 나타냅니다.',
    actionProcessed: '{abbr}에서 {n}개 문서 처리',
    actionConsequence:
      '입법 제안이 다음 단계로 진행됩니다. 영향을 받는 이해관계자들은 이행을 준비해야 합니다',
    mistakeDescription: '최근 문서가 작성되지 않음 — 입법 지연이 발생할 수 있습니다',
    mistakeAlternative:
      '추가 회의를 소집하거나 계류 중인 파일을 처리하기 위해 리소스를 재배치하십시오',
    outlookGood:
      '{total}개 위원회 중 {n}개가 적극적으로 문서를 생산하고 있어, 현재 속도는 생산적인 본회의 일정을 지원합니다.',
    outlookConcern:
      '위원회 문서 생산이 증가하지 않으면 입법 파이프라인에 병목 현상이 발생할 수 있습니다.',
    lede: '유럽 의회의 주요 위원회 활동과 입법 효율성을 종합적으로 분석합니다.',
    noRecentDocs: '최근 문서가 없습니다',
    committeeMetadataUnavailable:
      '이 보고 기간 동안 EP Open Data API에서 위원회 위원장 및 구성원 데이터를 현재 사용할 수 없습니다. 위원회 활동 모니터링은 사용 가능한 데이터 소스로 계속됩니다.',
    adoptedTextsSectionHeading: '위원회 주제별 최근 채택된 텍스트',
    adoptedTextsSummary:
      '유럽 의회는 최근 회기에서 환경, 경제, 안보, 시민 자유 및 농업 정책 분야에 걸쳐 {count}개의 텍스트를 채택했습니다.',
    adoptedTextsSummarySingular: '유럽 의회는 최근 회기에서 1개의 텍스트를 채택했습니다.',
    committeeNameENVI: '환경, 공중보건 및 식품안전',
    committeeNameECON: '경제·통화 문제',
    committeeNameAFET: '외교 문제',
    committeeNameLIBE: '시민적 자유, 사법 및 내무',
    committeeNameAGRI: '농업 및 농촌 개발',
    committeeNameOTHER: '위원회 공통 및 본회의',
  },
  zh: {
    what: '{date}委员会活动报告：监测{total}个委员会，处理{docs}份文件，{active}个委员会有近期活动。',
    whatNoData:
      '{date}委员会活动监测：追踪{total}个委员会。本报告期内EP数据feed中没有可用的近期文件。',
    reportDateLabel: '报告日期：',
    membersLabel: '名成员',
    chairLabel: '主席：',
    productivityRobust: '强劲的',
    productivityModerate: '温和的',
    productivityLow: '低',
    why: '委员会是欧洲议会的立法引擎——{pct}%的活跃率表明{descriptor}立法生产力。委员会的成果直接塑造提交全体会议投票的文本。',
    stakeholderHighlyProductive: '{n}份文件——非常高产的时期',
    stakeholderModerateActivity: '{n}份文件——中等活跃度',
    stakeholderNoDocs: '近期无文件——潜在的生产力问题',
    impactPolitical:
      '委员会主席在制定议程方面拥有重要权力。活跃委员会({active}/{total})正在为当前会期塑造立法管道。',
    impactPoliticalNone:
      '委员会主席在制定议程方面拥有重要权力。在此报告期间没有委员会发布近期文件；立法管道处于开发阶段。',
    impactEconomic: '委员会在经济、工业和贸易事务方面的成果直接影响欧盟监管环境和商业竞争力。',
    impactSocial: '社会事务、就业及公民自由委员会制定的立法直接影响公民的日常生活。',
    impactLegal: '{docs}份文件处于委员会审议的不同阶段，最终将创建或修改欧盟法律。',
    impactGeopolitical: '外交事务和国际贸易委员会活动反映了欧盟外交和贸易优先事项的演变。',
    actionProcessed: '{abbr}处理了{n}份文件',
    actionConsequence: '立法提案进入下一阶段；受影响的利益相关方应为实施做好准备',
    mistakeDescription: '近期未产出文件——立法积压可能正在形成',
    mistakeAlternative: '召开额外会议或重新分配资源以处理待审文件',
    outlookGood: '{total}个委员会中有{n}个正在积极产出文件，当前速度支持富有成效的全体会议日历。',
    outlookConcern: '如果委员会产出不增加，立法管道可能面临瓶颈。',
    lede: '对欧洲议会各专门委员会近期活动和立法效率的系统分析。',
    noRecentDocs: '近期无可用文件',
    committeeMetadataUnavailable:
      '该报告期内委员会主席和成员数据目前无法通过欧洲议会开放数据API获取。委员会活动监测将继续使用可用数据源。',
    adoptedTextsSectionHeading: '按委员会主题的最新通过文本',
    adoptedTextsSummary:
      '欧洲议会在最近几届会议上通过了{count}项文本，涵盖环境、经济、安全、公民自由和农业政策领域。',
    adoptedTextsSummarySingular: '欧洲议会在最近一届会议上通过了1项文本。',
    committeeNameENVI: '环境、公共卫生和食品安全',
    committeeNameECON: '经济和货币事务',
    committeeNameAFET: '对外事务',
    committeeNameLIBE: '公民自由、司法和内政',
    committeeNameAGRI: '农业和农村发展',
    committeeNameOTHER: '跨委员会和全体会议',
  },
};
// ─── SWOT localization strings ───────────────────────────────────────────────

/** Shared Scandinavian/Dutch SWOT heading */
const SWOT_ANALYSE = 'SWOT-analyse';

export const SWOT_STRINGS: LanguageMap<SwotStrings> = {
  en: {
    sectionHeading: 'SWOT Analysis',
    strengthsLabel: 'Strengths',
    weaknessesLabel: 'Weaknesses',
    opportunitiesLabel: 'Opportunities',
    threatsLabel: 'Threats',
    strengthsDesc: 'Internal positive factors',
    weaknessesDesc: 'Internal negative factors',
    opportunitiesDesc: 'External positive factors',
    threatsDesc: 'External negative factors',
    internalLabel: 'Internal',
    externalLabel: 'External',
  },
  sv: {
    sectionHeading: 'SWOT-analys',
    strengthsLabel: 'Styrkor',
    weaknessesLabel: 'Svagheter',
    opportunitiesLabel: 'Möjligheter',
    threatsLabel: 'Hot',
    strengthsDesc: 'Interna positiva faktorer',
    weaknessesDesc: 'Interna negativa faktorer',
    opportunitiesDesc: 'Externa positiva faktorer',
    threatsDesc: 'Externa negativa faktorer',
    internalLabel: 'Internt',
    externalLabel: 'Externt',
  },
  da: {
    sectionHeading: SWOT_ANALYSE,
    strengthsLabel: 'Styrker',
    weaknessesLabel: 'Svagheder',
    opportunitiesLabel: 'Muligheder',
    threatsLabel: 'Trusler',
    strengthsDesc: 'Interne positive faktorer',
    weaknessesDesc: 'Interne negative faktorer',
    opportunitiesDesc: 'Eksterne positive faktorer',
    threatsDesc: 'Eksterne negative faktorer',
    internalLabel: 'Internt',
    externalLabel: 'Eksternt',
  },
  no: {
    sectionHeading: SWOT_ANALYSE,
    strengthsLabel: 'Styrker',
    weaknessesLabel: 'Svakheter',
    opportunitiesLabel: 'Muligheter',
    threatsLabel: 'Trusler',
    strengthsDesc: 'Interne positive faktorer',
    weaknessesDesc: 'Interne negative faktorer',
    opportunitiesDesc: 'Eksterne positive faktorer',
    threatsDesc: 'Eksterne negative faktorer',
    internalLabel: 'Internt',
    externalLabel: 'Eksternt',
  },
  fi: {
    sectionHeading: 'SWOT-analyysi',
    strengthsLabel: 'Vahvuudet',
    weaknessesLabel: 'Heikkoudet',
    opportunitiesLabel: 'Mahdollisuudet',
    threatsLabel: 'Uhat',
    strengthsDesc: 'Sisäiset positiiviset tekijät',
    weaknessesDesc: 'Sisäiset negatiiviset tekijät',
    opportunitiesDesc: 'Ulkoiset positiiviset tekijät',
    threatsDesc: 'Ulkoiset negatiiviset tekijät',
    internalLabel: 'Sisäinen',
    externalLabel: 'Ulkoinen',
  },
  de: {
    sectionHeading: 'SWOT-Analyse',
    strengthsLabel: 'Stärken',
    weaknessesLabel: 'Schwächen',
    opportunitiesLabel: 'Chancen',
    threatsLabel: 'Risiken',
    strengthsDesc: 'Interne positive Faktoren',
    weaknessesDesc: 'Interne negative Faktoren',
    opportunitiesDesc: 'Externe positive Faktoren',
    threatsDesc: 'Externe negative Faktoren',
    internalLabel: 'Intern',
    externalLabel: 'Extern',
  },
  fr: {
    sectionHeading: 'Analyse SWOT',
    strengthsLabel: 'Forces',
    weaknessesLabel: 'Faiblesses',
    opportunitiesLabel: 'Opportunités',
    threatsLabel: 'Menaces',
    strengthsDesc: 'Facteurs positifs internes',
    weaknessesDesc: 'Facteurs négatifs internes',
    opportunitiesDesc: 'Facteurs positifs externes',
    threatsDesc: 'Facteurs négatifs externes',
    internalLabel: 'Interne',
    externalLabel: 'Externe',
  },
  es: {
    sectionHeading: 'Análisis DAFO',
    strengthsLabel: 'Fortalezas',
    weaknessesLabel: 'Debilidades',
    opportunitiesLabel: 'Oportunidades',
    threatsLabel: 'Amenazas',
    strengthsDesc: 'Factores positivos internos',
    weaknessesDesc: 'Factores negativos internos',
    opportunitiesDesc: 'Factores positivos externos',
    threatsDesc: 'Factores negativos externos',
    internalLabel: 'Interno',
    externalLabel: 'Externo',
  },
  nl: {
    sectionHeading: SWOT_ANALYSE,
    strengthsLabel: 'Sterktes',
    weaknessesLabel: 'Zwaktes',
    opportunitiesLabel: 'Kansen',
    threatsLabel: 'Bedreigingen',
    strengthsDesc: 'Interne positieve factoren',
    weaknessesDesc: 'Interne negatieve factoren',
    opportunitiesDesc: 'Externe positieve factoren',
    threatsDesc: 'Externe negatieve factoren',
    internalLabel: 'Intern',
    externalLabel: 'Extern',
  },
  ar: {
    sectionHeading: 'تحليل SWOT',
    strengthsLabel: 'نقاط القوة',
    weaknessesLabel: 'نقاط الضعف',
    opportunitiesLabel: 'الفرص',
    threatsLabel: 'التهديدات',
    strengthsDesc: 'العوامل الإيجابية الداخلية',
    weaknessesDesc: 'العوامل السلبية الداخلية',
    opportunitiesDesc: 'العوامل الإيجابية الخارجية',
    threatsDesc: 'العوامل السلبية الخارجية',
    internalLabel: 'داخلي',
    externalLabel: 'خارجي',
  },
  he: {
    sectionHeading: 'ניתוח SWOT',
    strengthsLabel: 'חוזקות',
    weaknessesLabel: 'חולשות',
    opportunitiesLabel: 'הזדמנויות',
    threatsLabel: 'איומים',
    strengthsDesc: 'גורמים פנימיים חיוביים',
    weaknessesDesc: 'גורמים פנימיים שליליים',
    opportunitiesDesc: 'גורמים חיצוניים חיוביים',
    threatsDesc: 'גורמים חיצוניים שליליים',
    internalLabel: 'פנימי',
    externalLabel: 'חיצוני',
  },
  ja: {
    sectionHeading: 'SWOT分析',
    strengthsLabel: '強み',
    weaknessesLabel: '弱み',
    opportunitiesLabel: '機会',
    threatsLabel: '脅威',
    strengthsDesc: '内部のプラス要因',
    weaknessesDesc: '内部のマイナス要因',
    opportunitiesDesc: '外部のプラス要因',
    threatsDesc: '外部のマイナス要因',
    internalLabel: '内部',
    externalLabel: '外部',
  },
  ko: {
    sectionHeading: 'SWOT 분석',
    strengthsLabel: '강점',
    weaknessesLabel: '약점',
    opportunitiesLabel: '기회',
    threatsLabel: '위협',
    strengthsDesc: '내부 긍정적 요인',
    weaknessesDesc: '내부 부정적 요인',
    opportunitiesDesc: '외부 긍정적 요인',
    threatsDesc: '외부 부정적 요인',
    internalLabel: '내부',
    externalLabel: '외부',
  },
  zh: {
    sectionHeading: 'SWOT分析',
    strengthsLabel: '优势',
    weaknessesLabel: '劣势',
    opportunitiesLabel: '机会',
    threatsLabel: '威胁',
    strengthsDesc: '内部积极因素',
    weaknessesDesc: '内部消极因素',
    opportunitiesDesc: '外部积极因素',
    threatsDesc: '外部消极因素',
    internalLabel: '内部',
    externalLabel: '外部',
  },
};

// ─── Dashboard localization strings ──────────────────────────────────────────

export const DASHBOARD_STRINGS: LanguageMap<DashboardStrings> = {
  en: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Trend:',
    trendUp: 'increasing',
    trendDown: 'decreasing',
    trendStable: 'stable',
    noChartData: 'No chart data available',
    chartLabel: 'Chart',
    categoryLabel: 'Category',
  },
  sv: {
    sectionHeading: 'Instrumentpanel',
    trendPrefix: 'Trend:',
    trendUp: 'ökande',
    trendDown: 'minskande',
    trendStable: 'stabil',
    noChartData: 'Ingen diagramdata tillgänglig',
    chartLabel: 'Diagram',
    categoryLabel: 'Kategori',
  },
  da: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Tendens:',
    trendUp: 'stigende',
    trendDown: 'faldende',
    trendStable: 'stabil',
    noChartData: 'Ingen diagramdata tilgængelig',
    chartLabel: 'Diagram',
    categoryLabel: 'Kategori',
  },
  no: {
    sectionHeading: 'Dashbord',
    trendPrefix: 'Trend:',
    trendUp: 'stigende',
    trendDown: 'fallende',
    trendStable: 'stabil',
    noChartData: 'Ingen diagramdata tilgjengelig',
    chartLabel: 'Diagram',
    categoryLabel: 'Kategori',
  },
  fi: {
    sectionHeading: 'Koontinäyttö',
    trendPrefix: 'Trendi:',
    trendUp: 'nouseva',
    trendDown: 'laskeva',
    trendStable: 'vakaa',
    noChartData: 'Ei kaaviotietoja saatavilla',
    chartLabel: 'Kaavio',
    categoryLabel: 'Luokka',
  },
  de: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Trend:',
    trendUp: 'steigend',
    trendDown: 'fallend',
    trendStable: 'stabil',
    noChartData: 'Keine Diagrammdaten verfügbar',
    chartLabel: 'Diagramm',
    categoryLabel: 'Kategorie',
  },
  fr: {
    sectionHeading: 'Tableau de bord',
    trendPrefix: 'Tendance\u00a0:',
    trendUp: 'en hausse',
    trendDown: 'en baisse',
    trendStable: 'stable',
    noChartData: 'Aucune donnée graphique disponible',
    chartLabel: 'Graphique',
    categoryLabel: 'Catégorie',
  },
  es: {
    sectionHeading: 'Panel de control',
    trendPrefix: 'Tendencia:',
    trendUp: 'creciente',
    trendDown: 'decreciente',
    trendStable: 'estable',
    noChartData: 'No hay datos de gráfico disponibles',
    chartLabel: 'Gráfico',
    categoryLabel: 'Categoría',
  },
  nl: {
    sectionHeading: 'Dashboard',
    trendPrefix: 'Trend:',
    trendUp: 'stijgend',
    trendDown: 'dalend',
    trendStable: 'stabiel',
    noChartData: 'Geen grafiekgegevens beschikbaar',
    chartLabel: 'Grafiek',
    categoryLabel: 'Categorie',
  },
  ar: {
    sectionHeading: 'لوحة المعلومات',
    trendPrefix: 'الاتجاه:',
    trendUp: 'تصاعدي',
    trendDown: 'تنازلي',
    trendStable: 'مستقر',
    noChartData: 'لا تتوفر بيانات الرسم البياني',
    chartLabel: 'رسم بياني',
    categoryLabel: 'فئة',
  },
  he: {
    sectionHeading: 'לוח מחוונים',
    trendPrefix: 'מגמה:',
    trendUp: 'עולה',
    trendDown: 'יורד',
    trendStable: 'יציב',
    noChartData: 'אין נתוני תרשים זמינים',
    chartLabel: 'תרשים',
    categoryLabel: 'קטגוריה',
  },
  ja: {
    sectionHeading: 'ダッシュボード',
    trendPrefix: 'トレンド:',
    trendUp: '上昇',
    trendDown: '下降',
    trendStable: '安定',
    noChartData: 'チャートデータがありません',
    chartLabel: 'チャート',
    categoryLabel: 'カテゴリ',
  },
  ko: {
    sectionHeading: '대시보드',
    trendPrefix: '추세:',
    trendUp: '상승',
    trendDown: '하락',
    trendStable: '안정',
    noChartData: '차트 데이터 없음',
    chartLabel: '차트',
    categoryLabel: '카테고리',
  },
  zh: {
    sectionHeading: '仪表板',
    trendPrefix: '趋势：',
    trendUp: '上升',
    trendDown: '下降',
    trendStable: '稳定',
    noChartData: '无图表数据',
    chartLabel: '图表',
    categoryLabel: '类别',
  },
};

// ─── SWOT Builder Strings ────────────────────────────────────────────────────

/**
 * Localized strings used by the 5 SWOT builder functions in analysis-builders.
 * Template functions accept dynamic counts; plain strings are static prose.
 */
export const SWOT_BUILDER_STRINGS: LanguageMap<SwotBuilderStrings> = {
  en: {
    votingHighCohesion: (n) =>
      `${n} political groups with cohesion above 80% — disciplined voting blocs`,
    votingAdopted: (n) => `${n} texts adopted — demonstrates legislative productivity`,
    votingActiveVotes: (n) => `${n} votes recorded — active plenary engagement`,
    votingLowCohesion: (n) =>
      `${n} groups with cohesion below 50% — internal divisions weaken bargaining power`,
    votingAnomalies: (n) =>
      `${n} voting anomalies detected — signals unpredictable coalition behaviour`,
    votingCrossParty: 'Cross-party alliances on specific legislation can build broader consensus',
    votingDiverseGroups: (n) =>
      `${n} active political groups — diverse coalition formation possibilities`,
    votingHighSeverity: (n) => `${n} high-severity anomalies — risk of coalition fragmentation`,
    votingShiftingAlliances: 'Shifting alliances may delay legislative progress on key files',
    prospectiveEvents: (n) => `${n} plenary events scheduled — active legislative agenda`,
    prospectiveCommittees: (n) => `${n} committee meetings — broad policy engagement`,
    prospectiveBottlenecks: (n) => `${n} legislative procedures facing bottleneck risks`,
    prospectiveHighDensity: (n) => `High event density (${n}) risks compressed debate time`,
    prospectiveDocuments: (n) => `${n} documents under consideration — legislative momentum`,
    prospectiveQuestions: (n) =>
      `${n} parliamentary questions — MEP engagement with citizen concerns`,
    prospectiveBottleneckRisk:
      'Bottleneck procedures may force procedural shortcuts or defer key files',
    prospectiveSchedulingRisk: 'Scheduling density increases risk of last-minute amendments',
    breakingAdopted: (n) => `${n} texts adopted — Parliament demonstrating legislative capacity`,
    breakingEvents: (n) => `${n} parliamentary events — active institutional engagement`,
    breakingAnomalyWeakness: 'Voting anomalies detected — potential coalition instability',
    breakingNoProcedures: 'No new legislative procedures — limited pipeline momentum',
    breakingProceduresActive: (n) => `${n} procedures advancing — legislative pipeline active`,
    breakingCoalitionOpportunity:
      'Coalition dynamics shifting — new alliance opportunities emerging',
    breakingAnomalyThreat: 'Detected anomalies may signal deeper political realignment',
    breakingRapidEvents: 'Rapidly evolving events may outpace legislative response capacity',
    propositionsHealthStrong: (pct) => `Pipeline health at ${pct}% — strong legislative management`,
    propositionsThroughputGood: (n) => `Throughput rate ${n} — healthy processing pace`,
    propositionsHealthWeak: (pct) => `Pipeline health at ${pct}% — legislative congestion risk`,
    propositionsThroughputLow: (n) =>
      `Low throughput (${n}) — slow processing delays policy implementation`,
    propositionsPrioritisation: 'Prioritisation of flagship files can improve pipeline efficiency',
    propositionsTrilogueAcceleration: 'Trilogue acceleration on mature files can boost throughput',
    propositionsCriticalCongestion:
      'Critical pipeline congestion may force legislative file abandonment',
    propositionsOverlapping:
      'Overlapping implementation timelines strain member state transposition capacity',
    committeeActive: (active, total) =>
      `${active} of ${total} committees actively producing documents`,
    committeeDocuments: (n) => `${n} documents produced — strong legislative output`,
    committeeInactive: (n) => `${n} committees with no recent document activity`,
    committeeCrossCollaboration:
      'Cross-committee collaboration on horizontal policy files can increase impact',
    committeeHearings: 'Committee hearings provide platform for expert stakeholder engagement',
    committeeLowActivity: 'Low committee activity risks legislative bottlenecks downstream',
    committeeCompetingPriorities: 'Competing policy priorities may dilute committee focus',
  },
  sv: {
    votingHighCohesion: (n) =>
      `${n} politiska grupper med sammanhållning över 80 % — disciplinerade röstningsblock`,
    votingAdopted: (n) => `${n} texter antagna — visar lagstiftande produktivitet`,
    votingActiveVotes: (n) => `${n} röster registrerade — aktivt plenarengagemang`,
    votingLowCohesion: (n) =>
      `${n} grupper med sammanhållning under 50 % — interna splittringar försvagar förhandlingskraft`,
    votingAnomalies: (n) =>
      `${n} röstningsanomalier upptäckta — signalerar oförutsägbart koalitionsbeteende`,
    votingCrossParty:
      'Tvärgruppsallianser kring specifik lagstiftning kan bygga bredare samförstånd',
    votingDiverseGroups: (n) => `${n} aktiva politiska grupper — mångsidiga koalitionsmöjligheter`,
    votingHighSeverity: (n) => `${n} allvarliga anomalier — risk för koalitionsfragmentering`,
    votingShiftingAlliances:
      'Skiftande allianser kan fördröja lagstiftningsframsteg i viktiga ärenden',
    prospectiveEvents: (n) => `${n} plenarsessioner planerade — aktiv lagstiftningsagenda`,
    prospectiveCommittees: (n) => `${n} utskottsmöten — brett politiskt engagemang`,
    prospectiveBottlenecks: (n) => `${n} lagstiftningsförfaranden med flaskhalsrisk`,
    prospectiveHighDensity: (n) => `Hög händelsetäthet (${n}) riskerar komprimerad debattid`,
    prospectiveDocuments: (n) => `${n} dokument under behandling — lagstiftande momentum`,
    prospectiveQuestions: (n) => `${n} parlamentariska frågor — MEP-engagemang för medborgarfrågor`,
    prospectiveBottleneckRisk:
      'Flaskhalsförfaranden kan tvinga fram genvägar eller skjuta upp viktiga ärenden',
    prospectiveSchedulingRisk:
      'Hög schemaläggningstäthet ökar risken för ändringsförslag i sista minuten',
    breakingAdopted: (n) => `${n} texter antagna — parlamentet visar lagstiftningskapacitet`,
    breakingEvents: (n) => `${n} parlamentariska händelser — aktivt institutionellt engagemang`,
    breakingAnomalyWeakness: 'Röstningsanomalier upptäckta — potentiell koalitionsinstabilitet',
    breakingNoProcedures: 'Inga nya lagstiftningsförfaranden — begränsat pipelinemomentum',
    breakingProceduresActive: (n) => `${n} förfaranden framskrider — lagstiftningspipelinen aktiv`,
    breakingCoalitionOpportunity: 'Koalitionsdynamiken förändras — nya alliansmöjligheter uppstår',
    breakingAnomalyThreat: 'Upptäckta anomalier kan signalera djupare politisk omgruppering',
    breakingRapidEvents: 'Snabbt utvecklande händelser kan överskrida lagstiftningskapaciteten',
    propositionsHealthStrong: (pct) => `Pipelinehälsa på ${pct} % — stark lagstiftningshantering`,
    propositionsThroughputGood: (n) => `Genomströmning ${n} — hälsosam behandlingstakt`,
    propositionsHealthWeak: (pct) => `Pipelinehälsa på ${pct} % — risk för lagstiftningsträngsel`,
    propositionsThroughputLow: (n) =>
      `Låg genomströmning (${n}) — långsam behandling fördröjer politiska åtgärder`,
    propositionsPrioritisation:
      'Prioritering av flaggskeppsfiler kan förbättra pipelineeffektiviteten',
    propositionsTrilogueAcceleration:
      'Trilogacceleration av mogna ärenden kan öka genomströmningen',
    propositionsCriticalCongestion:
      'Kritisk pipelineträngsel kan tvinga fram att lagstiftningsfiler överges',
    propositionsOverlapping:
      'Överlappande genomförandetidslinjer belastar medlemsstaternas införlivandekapacitet',
    committeeActive: (active, total) => `${active} av ${total} utskott producerar aktivt dokument`,
    committeeDocuments: (n) => `${n} dokument producerade — stark lagstiftande produktion`,
    committeeInactive: (n) => `${n} utskott utan nylig dokumentaktivitet`,
    committeeCrossCollaboration:
      'Samarbete mellan utskott kring horisontella policyfiler kan öka genomslaget',
    committeeHearings: 'Utskottsutfrågningar ger plattform för expertintressenters engagemang',
    committeeLowActivity: 'Låg utskottsaktivitet riskerar lagstiftningsflaskhalsar nedströms',
    committeeCompetingPriorities:
      'Konkurrerande politiska prioriteringar kan späda ut utskottens fokus',
  },
  da: {
    votingHighCohesion: (n) =>
      `${n} politiske grupper med samhørighed over 80 % — disciplinerede stemmeblokke`,
    votingAdopted: (n) => `${n} tekster vedtaget — viser lovgivningsmæssig produktivitet`,
    votingActiveVotes: (n) => `${n} afstemninger registreret — aktivt plenarengagement`,
    votingLowCohesion: (n) =>
      `${n} grupper med samhørighed under 50 % — interne splittelser svækker forhandlingskraft`,
    votingAnomalies: (n) =>
      `${n} stemmeanomalier opdaget — signalerer uforudsigeligt koalitionsadfærd`,
    votingCrossParty: 'Tværpolitiske alliancer om specifik lovgivning kan skabe bredere konsensus',
    votingDiverseGroups: (n) => `${n} aktive politiske grupper — mangfoldige koalitionsmuligheder`,
    votingHighSeverity: (n) => `${n} alvorlige anomalier — risiko for koalitionsfragmentering`,
    votingShiftingAlliances:
      'Skiftende alliancer kan forsinke lovgivningsfremskridt i vigtige sager',
    prospectiveEvents: (n) => `${n} plenarmøder planlagt — aktiv lovgivningsdagsorden`,
    prospectiveCommittees: (n) => `${n} udvalgsmøder — bredt politisk engagement`,
    prospectiveBottlenecks: (n) => `${n} lovgivningsprocedurer med flaskehalsrisiko`,
    prospectiveHighDensity: (n) => `Høj begivenhedstæthed (${n}) risikerer komprimeret debattid`,
    prospectiveDocuments: (n) => `${n} dokumenter til behandling — lovgivningsmæssigt momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlamentariske spørgsmål — MEP-engagement med borgerbekymringer`,
    prospectiveBottleneckRisk:
      'Flaskehalsprocedurer kan fremtvinge proceduremæssige genveje eller udskyde vigtige sager',
    prospectiveSchedulingRisk:
      'Planlægningstæthed øger risikoen for ændringsforslag i sidste øjeblik',
    breakingAdopted: (n) => `${n} tekster vedtaget — parlamentet demonstrerer lovgivningskapacitet`,
    breakingEvents: (n) => `${n} parlamentariske begivenheder — aktivt institutionelt engagement`,
    breakingAnomalyWeakness: 'Stemmeanomalier opdaget — potentiel koalitionsinstabilitet',
    breakingNoProcedures: 'Ingen nye lovgivningsprocedurer — begrænset pipeline-momentum',
    breakingProceduresActive: (n) => `${n} procedurer fremskrider — lovgivningspipeline aktiv`,
    breakingCoalitionOpportunity: 'Koalitionsdynamikken skifter — nye alliancemuligheder opstår',
    breakingAnomalyThreat: 'Opdagede anomalier kan signalere dybere politisk omgruppering',
    breakingRapidEvents: 'Hurtigt udviklende begivenheder kan overskride lovgivningskapaciteten',
    propositionsHealthStrong: (pct) =>
      `Pipeline-sundhed på ${pct} % — stærk lovgivningsforvaltning`,
    propositionsThroughputGood: (n) => `Gennemløb ${n} — sundt behandlingstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-sundhed på ${pct} % — risiko for lovgivningsmæssig trængsel`,
    propositionsThroughputLow: (n) =>
      `Lavt gennemløb (${n}) — langsom behandling forsinker politiske tiltag`,
    propositionsPrioritisation:
      'Prioritering af flagskibsfiler kan forbedre pipeline-effektiviteten',
    propositionsTrilogueAcceleration: 'Trilogacceleration af modne sager kan øge gennemløbet',
    propositionsCriticalCongestion:
      'Kritisk pipeline-trængsel kan tvinge lovgivningsfiler til at blive opgivet',
    propositionsOverlapping:
      'Overlappende implementeringstidslinjer belaster medlemsstaternes gennemførelseskapacitet',
    committeeActive: (active, total) => `${active} af ${total} udvalg producerer aktivt dokumenter`,
    committeeDocuments: (n) => `${n} dokumenter produceret — stærk lovgivningsmæssig produktion`,
    committeeInactive: (n) => `${n} udvalg uden nylig dokumentaktivitet`,
    committeeCrossCollaboration:
      'Samarbejde på tværs af udvalg om horisontale politikfiler kan øge gennemslagskraften',
    committeeHearings: 'Udvalgshøringer giver platform for ekspertinteressenters engagement',
    committeeLowActivity: 'Lav udvalgsaktivitet risikerer lovgivningsmæssige flaskehalse nedstrøms',
    committeeCompetingPriorities: 'Konkurrerende politiske prioriteter kan udvande udvalgets fokus',
  },
  no: {
    votingHighCohesion: (n) =>
      `${n} politiske grupper med samhold over 80 % — disiplinerte stemmeblokker`,
    votingAdopted: (n) => `${n} tekster vedtatt — viser lovgivende produktivitet`,
    votingActiveVotes: (n) => `${n} avstemninger registrert — aktivt plenaraktivitet`,
    votingLowCohesion: (n) =>
      `${n} grupper med samhold under 50 % — interne splittelser svekker forhandlingskraft`,
    votingAnomalies: (n) =>
      `${n} stemmeavvik oppdaget — signaliserer uforutsigbar koalisjonsadferd`,
    votingCrossParty:
      'Tverrpolitiske allianser om spesifikk lovgivning kan bygge bredere konsensus',
    votingDiverseGroups: (n) => `${n} aktive politiske grupper — mangfoldige koalisjonsmuligheter`,
    votingHighSeverity: (n) => `${n} alvorlige avvik — risiko for koalisjonsfragmentering`,
    votingShiftingAlliances: 'Skiftende allianser kan forsinke lovgivningsframgang i viktige saker',
    prospectiveEvents: (n) => `${n} plenarmøter planlagt — aktiv lovgivningsdagsorden`,
    prospectiveCommittees: (n) => `${n} komitémøter — bredt politisk engasjement`,
    prospectiveBottlenecks: (n) => `${n} lovgivningsprosedyrer med flaskehalsrisiko`,
    prospectiveHighDensity: (n) => `Høy hendelsestetthet (${n}) risikerer komprimert debattid`,
    prospectiveDocuments: (n) => `${n} dokumenter til behandling — lovgivende momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlamentariske spørsmål — MEP-engasjement for borgernes bekymringer`,
    prospectiveBottleneckRisk:
      'Flaskehalsprosedyrer kan tvinge frem snarveier eller utsette viktige saker',
    prospectiveSchedulingRisk:
      'Planleggingstetthet øker risikoen for endringsforslag i siste liten',
    breakingAdopted: (n) => `${n} tekster vedtatt — parlamentet demonstrerer lovgivningskapasitet`,
    breakingEvents: (n) => `${n} parlamentariske hendelser — aktivt institusjonelt engasjement`,
    breakingAnomalyWeakness: 'Stemmeavvik oppdaget — potensiell koalisjonsinstabilitet',
    breakingNoProcedures: 'Ingen nye lovgivningsprosedyrer — begrenset pipeline-momentum',
    breakingProceduresActive: (n) => `${n} prosedyrer fremskrider — lovgivningspipeline aktiv`,
    breakingCoalitionOpportunity: 'Koalisjonsdynamikken skifter — nye alliansmuligheter oppstår',
    breakingAnomalyThreat: 'Oppdagede avvik kan signalisere dypere politisk omgruppering',
    breakingRapidEvents: 'Raskt utviklende hendelser kan overskride lovgivningskapasiteten',
    propositionsHealthStrong: (pct) => `Pipeline-helse på ${pct} % — sterk lovgivningsforvaltning`,
    propositionsThroughputGood: (n) => `Gjennomstrømning ${n} — sunt behandlingstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-helse på ${pct} % — risiko for lovgivningsmessig trengsel`,
    propositionsThroughputLow: (n) =>
      `Lav gjennomstrømning (${n}) — treg behandling forsinker politiske tiltak`,
    propositionsPrioritisation:
      'Prioritering av flaggskipfiler kan forbedre pipeline-effektiviteten',
    propositionsTrilogueAcceleration:
      'Trilogakselerasjon av modne saker kan øke gjennomstrømningen',
    propositionsCriticalCongestion:
      'Kritisk pipeline-trengsel kan tvinge lovgivningsfiler til å bli forlatt',
    propositionsOverlapping:
      'Overlappende implementeringstidslinjer belaster medlemsstatenes gjennomføringskapasitet',
    committeeActive: (active, total) =>
      `${active} av ${total} komiteer produserer aktivt dokumenter`,
    committeeDocuments: (n) => `${n} dokumenter produsert — sterk lovgivende produksjon`,
    committeeInactive: (n) => `${n} komiteer uten nylig dokumentaktivitet`,
    committeeCrossCollaboration:
      'Samarbeid på tvers av komiteer om horisontale policyfiler kan øke gjennomslaget',
    committeeHearings: 'Komitéhøringer gir plattform for ekspertinteressenters engasjement',
    committeeLowActivity: 'Lav komitéaktivitet risikerer lovgivningsmessige flaskehalser nedstrøms',
    committeeCompetingPriorities:
      'Konkurrerende politiske prioriteringer kan utvanne komitéens fokus',
  },
  fi: {
    votingHighCohesion: (n) =>
      `${n} poliittista ryhmää yhtenäisyydellä yli 80 % — kurinalaiset äänestyslohkot`,
    votingAdopted: (n) => `${n} tekstiä hyväksytty — osoittaa lainsäädännöllistä tuottavuutta`,
    votingActiveVotes: (n) => `${n} äänestystä kirjattu — aktiivinen täysistuntoaktiivisuus`,
    votingLowCohesion: (n) =>
      `${n} ryhmää yhtenäisyydellä alle 50 % — sisäiset jakolinjat heikentävät neuvotteluvoimaa`,
    votingAnomalies: (n) =>
      `${n} äänestyspoikkeamaa havaittu — viestii ennakoimattomasta koalitiokäyttäytymisestä`,
    votingCrossParty:
      'Puoluerajat ylittävät liittoutumat voivat rakentaa laajempaa yhteisymmärrystä',
    votingDiverseGroups: (n) =>
      `${n} aktiivista poliittista ryhmää — monipuoliset koalitiomahdollisuudet`,
    votingHighSeverity: (n) => `${n} vakavaa poikkeamaa — koalition pirstoutumisen riski`,
    votingShiftingAlliances:
      'Muuttuvat liittoutumat voivat viivästyttää lainsäädäntötyötä keskeisissä asioissa',
    prospectiveEvents: (n) =>
      `${n} täysistuntotapahtumaa aikataulutettu — aktiivinen lainsäädäntöagenda`,
    prospectiveCommittees: (n) => `${n} valiokuntakokousta — laaja poliittinen sitoutuminen`,
    prospectiveBottlenecks: (n) => `${n} lainsäädäntömenettelyä pullonkaulauhalla`,
    prospectiveHighDensity: (n) =>
      `Korkea tapahtumatiheys (${n}) uhkaa tiivistettyä keskusteluaikaa`,
    prospectiveDocuments: (n) => `${n} asiakirjaa käsittelyssä — lainsäädännöllinen vauhti`,
    prospectiveQuestions: (n) =>
      `${n} parlamentaarista kysymystä — MEP-sitoutuminen kansalaisten huoliin`,
    prospectiveBottleneckRisk:
      'Pullonkaulamenettelyt voivat pakottaa menettelylliset oikotiet tai lykätä keskeisiä asioita',
    prospectiveSchedulingRisk: 'Aikataulutiheys lisää viime hetken muutosehdotusten riskiä',
    breakingAdopted: (n) =>
      `${n} tekstiä hyväksytty — parlamentti osoittaa lainsäädäntökapasiteettia`,
    breakingEvents: (n) =>
      `${n} parlamentaarista tapahtumaa — aktiivinen institutionaalinen sitoutuminen`,
    breakingAnomalyWeakness: 'Äänestyspoikkeamia havaittu — mahdollinen koalition epävakaus',
    breakingNoProcedures: 'Ei uusia lainsäädäntömenettelyjä — rajallinen pipeline-vauhti',
    breakingProceduresActive: (n) => `${n} menettelyä edistyy — lainsäädäntöpipeline aktiivinen`,
    breakingCoalitionOpportunity:
      'Koalitiodynamiikka muuttuu — uusia liittoutumamahdollisuuksia syntyy',
    breakingAnomalyThreat:
      'Havaitut poikkeamat voivat viestittää syvemmästä poliittisesta uudelleenjärjestelystä',
    breakingRapidEvents:
      'Nopeasti kehittyvät tapahtumat voivat ylittää lainsäädännöllisen reagointikyvyn',
    propositionsHealthStrong: (pct) => `Pipeline-terveys ${pct} % — vahva lainsäädännön hallinta`,
    propositionsThroughputGood: (n) => `Läpäisyaste ${n} — terve käsittelytahti`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-terveys ${pct} % — lainsäädännöllisen ruuhkautumisen riski`,
    propositionsThroughputLow: (n) =>
      `Matala läpäisyaste (${n}) — hidas käsittely viivästyttää politiikkatoimia`,
    propositionsPrioritisation:
      'Lippulaiva-asiakirjojen priorisointi voi parantaa pipeline-tehokkuutta',
    propositionsTrilogueAcceleration:
      'Trilogikiihdytys kypsille asioille voi kasvattaa läpäisyastetta',
    propositionsCriticalCongestion:
      'Kriittinen pipeline-ruuhka voi pakottaa lainsäädäntöasiakirjojen hylkäämisen',
    propositionsOverlapping:
      'Päällekkäiset toteutusaikataulut rasittavat jäsenvaltioiden täytäntöönpanokapasiteettia',
    committeeActive: (active, total) =>
      `${active} / ${total} valiokuntaa tuottaa aktiivisesti asiakirjoja`,
    committeeDocuments: (n) => `${n} asiakirjaa tuotettu — vahva lainsäädännöllinen tuotanto`,
    committeeInactive: (n) => `${n} valiokuntaa ilman viimeaikaista asiakirja-aktiivisuutta`,
    committeeCrossCollaboration:
      'Valiokuntien välinen yhteistyö horisontaalisissa politiikka-asioissa voi lisätä vaikuttavuutta',
    committeeHearings:
      'Valiokuntakuulemiset tarjoavat alustan asiantuntijasidosryhmien osallistumiselle',
    committeeLowActivity:
      'Matala valiokuntatoiminta uhkaa lainsäädännöllisiä pullonkauloja jatkovaiheessa',
    committeeCompetingPriorities:
      'Kilpailevat poliittiset prioriteetit voivat laimentaa valiokunnan fokusta',
  },
  de: {
    votingHighCohesion: (n) =>
      `${n} Fraktionen mit Kohäsion über 80 % — disziplinierte Abstimmungsblöcke`,
    votingAdopted: (n) => `${n} Texte angenommen — zeigt gesetzgeberische Produktivität`,
    votingActiveVotes: (n) => `${n} Abstimmungen erfasst — aktives Plenarengagement`,
    votingLowCohesion: (n) =>
      `${n} Fraktionen mit Kohäsion unter 50 % — interne Spaltungen schwächen Verhandlungsmacht`,
    votingAnomalies: (n) =>
      `${n} Abstimmungsanomalien erkannt — signalisiert unvorhersehbares Koalitionsverhalten`,
    votingCrossParty:
      'Fraktionsübergreifende Allianzen bei spezifischer Gesetzgebung können breiteren Konsens schaffen',
    votingDiverseGroups: (n) =>
      `${n} aktive Fraktionen — vielfältige Koalitionsbildungsmöglichkeiten`,
    votingHighSeverity: (n) =>
      `${n} schwerwiegende Anomalien — Risiko der Koalitionsfragmentierung`,
    votingShiftingAlliances:
      'Wechselnde Allianzen können den Gesetzgebungsfortschritt bei wichtigen Dossiers verzögern',
    prospectiveEvents: (n) => `${n} Plenarveranstaltungen geplant — aktive Gesetzgebungsagenda`,
    prospectiveCommittees: (n) => `${n} Ausschusssitzungen — breites politisches Engagement`,
    prospectiveBottlenecks: (n) => `${n} Gesetzgebungsverfahren mit Engpassrisiko`,
    prospectiveHighDensity: (n) =>
      `Hohe Veranstaltungsdichte (${n}) birgt Risiko komprimierter Debattenzeit`,
    prospectiveDocuments: (n) => `${n} Dokumente in Beratung — gesetzgeberisches Momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlamentarische Anfragen — MdEP-Engagement für Bürgeranliegen`,
    prospectiveBottleneckRisk:
      'Engpassverfahren können zu Verfahrensabkürzungen zwingen oder wichtige Dossiers verzögern',
    prospectiveSchedulingRisk:
      'Terminierungsdichte erhöht das Risiko von Last-Minute-Änderungsanträgen',
    breakingAdopted: (n) => `${n} Texte angenommen — Parlament demonstriert Gesetzgebungskapazität`,
    breakingEvents: (n) =>
      `${n} parlamentarische Veranstaltungen — aktives institutionelles Engagement`,
    breakingAnomalyWeakness: 'Abstimmungsanomalien erkannt — potenzielle Koalitionsinstabilität',
    breakingNoProcedures: 'Keine neuen Gesetzgebungsverfahren — begrenztes Pipeline-Momentum',
    breakingProceduresActive: (n) => `${n} Verfahren schreiten voran — Gesetzgebungspipeline aktiv`,
    breakingCoalitionOpportunity:
      'Koalitionsdynamik verschiebt sich — neue Allianzmöglichkeiten entstehen',
    breakingAnomalyThreat:
      'Erkannte Anomalien könnten tiefere politische Neuausrichtung signalisieren',
    breakingRapidEvents:
      'Sich schnell entwickelnde Ereignisse könnten die Gesetzgebungskapazität übersteigen',
    propositionsHealthStrong: (pct) =>
      `Pipeline-Gesundheit bei ${pct} % — starkes Gesetzgebungsmanagement`,
    propositionsThroughputGood: (n) => `Durchsatz ${n} — gesundes Verarbeitungstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-Gesundheit bei ${pct} % — Risiko gesetzgeberischer Stauung`,
    propositionsThroughputLow: (n) =>
      `Niedriger Durchsatz (${n}) — langsame Verarbeitung verzögert politische Maßnahmen`,
    propositionsPrioritisation:
      'Priorisierung von Leuchtturm-Dossiers kann die Pipeline-Effizienz verbessern',
    propositionsTrilogueAcceleration:
      'Trilog-Beschleunigung reifer Dossiers kann den Durchsatz steigern',
    propositionsCriticalCongestion:
      'Kritische Pipeline-Stauung kann zum Aufgeben von Gesetzgebungsdossiers führen',
    propositionsOverlapping:
      'Überlappende Umsetzungszeitpläne belasten die Umsetzungskapazität der Mitgliedstaaten',
    committeeActive: (active, total) =>
      `${active} von ${total} Ausschüssen produzieren aktiv Dokumente`,
    committeeDocuments: (n) => `${n} Dokumente produziert — starke gesetzgeberische Produktion`,
    committeeInactive: (n) => `${n} Ausschüsse ohne jüngste Dokumentenaktivität`,
    committeeCrossCollaboration:
      'Ausschussübergreifende Zusammenarbeit bei horizontalen Politikdossiers kann die Wirkung erhöhen',
    committeeHearings: 'Ausschussanhörungen bieten Plattform für Experten-Stakeholder-Engagement',
    committeeLowActivity:
      'Niedrige Ausschussaktivität birgt Risiko gesetzgeberischer Engpässe im weiteren Verlauf',
    committeeCompetingPriorities:
      'Konkurrierende politische Prioritäten können den Ausschussfokus verwässern',
  },
  fr: {
    votingHighCohesion: (n) =>
      `${n} groupes politiques avec cohésion supérieure à 80 % — blocs de vote disciplinés`,
    votingAdopted: (n) => `${n} textes adoptés — démontre la productivité législative`,
    votingActiveVotes: (n) => `${n} votes enregistrés — engagement actif en plénière`,
    votingLowCohesion: (n) =>
      `${n} groupes avec cohésion inférieure à 50 % — divisions internes affaiblissent le pouvoir de négociation`,
    votingAnomalies: (n) =>
      `${n} anomalies de vote détectées — signale un comportement de coalition imprévisible`,
    votingCrossParty:
      'Les alliances transpartisanes sur des législations spécifiques peuvent construire un consensus plus large',
    votingDiverseGroups: (n) =>
      `${n} groupes politiques actifs — possibilités diverses de formation de coalition`,
    votingHighSeverity: (n) =>
      `${n} anomalies de haute gravité — risque de fragmentation de la coalition`,
    votingShiftingAlliances:
      'Les alliances mouvantes peuvent retarder les progrès législatifs sur les dossiers clés',
    prospectiveEvents: (n) => `${n} événements pléniers programmés — agenda législatif actif`,
    prospectiveCommittees: (n) => `${n} réunions de commission — large engagement politique`,
    prospectiveBottlenecks: (n) =>
      `${n} procédures législatives confrontées à des risques de goulot d'étranglement`,
    prospectiveHighDensity: (n) =>
      `Haute densité d'événements (${n}) risque de comprimer le temps de débat`,
    prospectiveDocuments: (n) => `${n} documents en examen — momentum législatif`,
    prospectiveQuestions: (n) =>
      `${n} questions parlementaires — engagement des députés envers les préoccupations citoyennes`,
    prospectiveBottleneckRisk:
      "Les procédures en goulot d'étranglement peuvent forcer des raccourcis ou reporter des dossiers clés",
    prospectiveSchedulingRisk:
      "La densité de programmation augmente le risque d'amendements de dernière minute",
    breakingAdopted: (n) => `${n} textes adoptés — le Parlement démontre sa capacité législative`,
    breakingEvents: (n) => `${n} événements parlementaires — engagement institutionnel actif`,
    breakingAnomalyWeakness:
      'Anomalies de vote détectées — instabilité potentielle de la coalition',
    breakingNoProcedures: 'Pas de nouvelles procédures législatives — momentum limité du pipeline',
    breakingProceduresActive: (n) => `${n} procédures en cours — pipeline législatif actif`,
    breakingCoalitionOpportunity:
      "La dynamique de coalition évolue — de nouvelles opportunités d'alliance émergent",
    breakingAnomalyThreat:
      'Les anomalies détectées peuvent signaler un réalignement politique plus profond',
    breakingRapidEvents:
      'Les événements à évolution rapide peuvent dépasser la capacité de réponse législative',
    propositionsHealthStrong: (pct) => `Santé du pipeline à ${pct} % — gestion législative solide`,
    propositionsThroughputGood: (n) => `Débit ${n} — rythme de traitement sain`,
    propositionsHealthWeak: (pct) =>
      `Santé du pipeline à ${pct} % — risque de congestion législative`,
    propositionsThroughputLow: (n) =>
      `Faible débit (${n}) — le traitement lent retarde la mise en œuvre des politiques`,
    propositionsPrioritisation:
      "La priorisation des dossiers phares peut améliorer l'efficacité du pipeline",
    propositionsTrilogueAcceleration:
      "L'accélération des trilogues sur les dossiers mûrs peut augmenter le débit",
    propositionsCriticalCongestion:
      "Une congestion critique du pipeline peut forcer l'abandon de dossiers législatifs",
    propositionsOverlapping:
      'Les calendriers de mise en œuvre qui se chevauchent mettent à rude épreuve la capacité de transposition des États membres',
    committeeActive: (active, total) =>
      `${active} sur ${total} commissions produisent activement des documents`,
    committeeDocuments: (n) => `${n} documents produits — forte production législative`,
    committeeInactive: (n) => `${n} commissions sans activité documentaire récente`,
    committeeCrossCollaboration:
      "La collaboration inter-commissions sur les dossiers politiques horizontaux peut accroître l'impact",
    committeeHearings:
      "Les auditions en commission offrent une plateforme pour l'engagement des parties prenantes expertes",
    committeeLowActivity:
      "Une faible activité des commissions risque de créer des goulots d'étranglement législatifs en aval",
    committeeCompetingPriorities:
      'Les priorités politiques concurrentes peuvent diluer la concentration des commissions',
  },
  es: {
    votingHighCohesion: (n) =>
      `${n} grupos políticos con cohesión superior al 80 % — bloques de voto disciplinados`,
    votingAdopted: (n) => `${n} textos adoptados — demuestra productividad legislativa`,
    votingActiveVotes: (n) => `${n} votos registrados — participación activa en plenario`,
    votingLowCohesion: (n) =>
      `${n} grupos con cohesión inferior al 50 % — divisiones internas debilitan el poder de negociación`,
    votingAnomalies: (n) =>
      `${n} anomalías de votación detectadas — señala comportamiento de coalición impredecible`,
    votingCrossParty:
      'Las alianzas transversales en legislación específica pueden construir un consenso más amplio',
    votingDiverseGroups: (n) =>
      `${n} grupos políticos activos — diversas posibilidades de formación de coalición`,
    votingHighSeverity: (n) =>
      `${n} anomalías de alta gravedad — riesgo de fragmentación de la coalición`,
    votingShiftingAlliances:
      'Las alianzas cambiantes pueden retrasar el progreso legislativo en expedientes clave',
    prospectiveEvents: (n) => `${n} eventos plenarios programados — agenda legislativa activa`,
    prospectiveCommittees: (n) => `${n} reuniones de comisión — amplio compromiso político`,
    prospectiveBottlenecks: (n) =>
      `${n} procedimientos legislativos con riesgo de cuello de botella`,
    prospectiveHighDensity: (n) =>
      `Alta densidad de eventos (${n}) arriesga tiempo de debate comprimido`,
    prospectiveDocuments: (n) => `${n} documentos en consideración — impulso legislativo`,
    prospectiveQuestions: (n) =>
      `${n} preguntas parlamentarias — compromiso de los eurodiputados con las preocupaciones ciudadanas`,
    prospectiveBottleneckRisk:
      'Los procedimientos con cuello de botella pueden forzar atajos o aplazar expedientes clave',
    prospectiveSchedulingRisk:
      'La densidad de programación aumenta el riesgo de enmiendas de último momento',
    breakingAdopted: (n) => `${n} textos adoptados — el Parlamento demuestra capacidad legislativa`,
    breakingEvents: (n) => `${n} eventos parlamentarios — compromiso institucional activo`,
    breakingAnomalyWeakness:
      'Anomalías de votación detectadas — potencial inestabilidad de la coalición',
    breakingNoProcedures: 'Sin nuevos procedimientos legislativos — impulso limitado del pipeline',
    breakingProceduresActive: (n) => `${n} procedimientos avanzando — pipeline legislativo activo`,
    breakingCoalitionOpportunity:
      'La dinámica de coalición está cambiando — surgen nuevas oportunidades de alianza',
    breakingAnomalyThreat:
      'Las anomalías detectadas pueden señalar un realineamiento político más profundo',
    breakingRapidEvents:
      'Los eventos en rápida evolución pueden superar la capacidad de respuesta legislativa',
    propositionsHealthStrong: (pct) =>
      `Salud del pipeline al ${pct} % — gestión legislativa sólida`,
    propositionsThroughputGood: (n) => `Rendimiento ${n} — ritmo de procesamiento saludable`,
    propositionsHealthWeak: (pct) =>
      `Salud del pipeline al ${pct} % — riesgo de congestión legislativa`,
    propositionsThroughputLow: (n) =>
      `Bajo rendimiento (${n}) — el procesamiento lento retrasa la implementación de políticas`,
    propositionsPrioritisation:
      'La priorización de expedientes emblemáticos puede mejorar la eficiencia del pipeline',
    propositionsTrilogueAcceleration:
      'La aceleración de trílogos en expedientes maduros puede aumentar el rendimiento',
    propositionsCriticalCongestion:
      'La congestión crítica del pipeline puede forzar el abandono de expedientes legislativos',
    propositionsOverlapping:
      'Los calendarios de implementación superpuestos agotan la capacidad de transposición de los Estados miembros',
    committeeActive: (active, total) =>
      `${active} de ${total} comisiones producen activamente documentos`,
    committeeDocuments: (n) => `${n} documentos producidos — fuerte producción legislativa`,
    committeeInactive: (n) => `${n} comisiones sin actividad documental reciente`,
    committeeCrossCollaboration:
      'La colaboración entre comisiones en expedientes políticos horizontales puede aumentar el impacto',
    committeeHearings:
      'Las audiencias de comisión proporcionan plataforma para la participación de expertos interesados',
    committeeLowActivity:
      'La baja actividad de las comisiones arriesga cuellos de botella legislativos posteriores',
    committeeCompetingPriorities:
      'Las prioridades políticas en competencia pueden diluir el enfoque de las comisiones',
  },
  nl: {
    votingHighCohesion: (n) =>
      `${n} fracties met cohesie boven 80 % — gedisciplineerde stemblokken`,
    votingAdopted: (n) => `${n} teksten aangenomen — toont wetgevende productiviteit`,
    votingActiveVotes: (n) => `${n} stemmingen geregistreerd — actieve plenaire betrokkenheid`,
    votingLowCohesion: (n) =>
      `${n} fracties met cohesie onder 50 % — interne verdeeldheid verzwakt onderhandelingspositie`,
    votingAnomalies: (n) =>
      `${n} stemafwijkingen gedetecteerd — signaleert onvoorspelbaar coalitiegedrag`,
    votingCrossParty:
      'Fractieoverstijgende allianties bij specifieke wetgeving kunnen bredere consensus opbouwen',
    votingDiverseGroups: (n) => `${n} actieve fracties — diverse coalitievormingsmogelijkheden`,
    votingHighSeverity: (n) => `${n} ernstige afwijkingen — risico op coalitiefragmentatie`,
    votingShiftingAlliances:
      'Verschuivende allianties kunnen wetgevende vooruitgang bij belangrijke dossiers vertragen',
    prospectiveEvents: (n) => `${n} plenaire evenementen gepland — actieve wetgevingsagenda`,
    prospectiveCommittees: (n) => `${n} commissievergaderingen — brede politieke betrokkenheid`,
    prospectiveBottlenecks: (n) => `${n} wetgevingsprocedures met knelpuntrisico`,
    prospectiveHighDensity: (n) =>
      `Hoge evenementendichtheid (${n}) riskeert gecomprimeerde debattijd`,
    prospectiveDocuments: (n) => `${n} documenten in behandeling — wetgevend momentum`,
    prospectiveQuestions: (n) =>
      `${n} parlementaire vragen — EP-lid-betrokkenheid bij burgerzorgen`,
    prospectiveBottleneckRisk:
      'Knelpuntprocedures kunnen procedurele shortcuts afdwingen of belangrijke dossiers uitstellen',
    prospectiveSchedulingRisk:
      'Planningsdichtheid verhoogt het risico op amendementen op het laatste moment',
    breakingAdopted: (n) => `${n} teksten aangenomen — Parlement toont wetgevende capaciteit`,
    breakingEvents: (n) => `${n} parlementaire evenementen — actieve institutionele betrokkenheid`,
    breakingAnomalyWeakness: 'Stemafwijkingen gedetecteerd — potentiële coalitie-instabiliteit',
    breakingNoProcedures: 'Geen nieuwe wetgevingsprocedures — beperkt pipeline-momentum',
    breakingProceduresActive: (n) => `${n} procedures vorderen — wetgevingspipeline actief`,
    breakingCoalitionOpportunity:
      'Coalitiedynamiek verschuift — nieuwe allantiemogelijkheden ontstaan',
    breakingAnomalyThreat:
      'Gedetecteerde afwijkingen kunnen diepere politieke hergroepering signaleren',
    breakingRapidEvents:
      'Snel evoluerende gebeurtenissen kunnen de wetgevingscapaciteit overschrijden',
    propositionsHealthStrong: (pct) => `Pipeline-gezondheid op ${pct} % — sterk wetgevingsbeheer`,
    propositionsThroughputGood: (n) => `Doorvoer ${n} — gezond verwerkingstempo`,
    propositionsHealthWeak: (pct) =>
      `Pipeline-gezondheid op ${pct} % — risico op wetgevingscongestie`,
    propositionsThroughputLow: (n) =>
      `Lage doorvoer (${n}) — trage verwerking vertraagt beleidsimplementatie`,
    propositionsPrioritisation:
      'Prioritering van vlaggenschipdossiers kan de pipeline-efficiëntie verbeteren',
    propositionsTrilogueAcceleration:
      'Trilogversnelling van rijpe dossiers kan de doorvoer verhogen',
    propositionsCriticalCongestion:
      'Kritische pipeline-congestie kan leiden tot het opgeven van wetgevingsdossiers',
    propositionsOverlapping:
      'Overlappende implementatietijdlijnen belasten de omzettingscapaciteit van lidstaten',
    committeeActive: (active, total) =>
      `${active} van ${total} commissies produceren actief documenten`,
    committeeDocuments: (n) => `${n} documenten geproduceerd — sterke wetgevende productie`,
    committeeInactive: (n) => `${n} commissies zonder recente documentactiviteit`,
    committeeCrossCollaboration:
      'Samenwerking tussen commissies bij horizontale beleidsdossiers kan de impact vergroten',
    committeeHearings:
      'Commissiehoorzittingen bieden platform voor betrokkenheid van deskundige belanghebbenden',
    committeeLowActivity: 'Lage commissieactiviteit riskeert wetgevende knelpunten stroomafwaarts',
    committeeCompetingPriorities:
      'Concurrerende politieke prioriteiten kunnen de commissiefocus verwateren',
  },
  ar: {
    votingHighCohesion: (n) => `${n} مجموعات سياسية بتماسك فوق 80% — كتل تصويت منضبطة`,
    votingAdopted: (n) => `${n} نصوص معتمدة — يُظهر إنتاجية تشريعية`,
    votingActiveVotes: (n) => `${n} تصويتات مسجلة — مشاركة نشطة في الجلسة العامة`,
    votingLowCohesion: (n) =>
      `${n} مجموعات بتماسك أقل من 50% — انقسامات داخلية تُضعف القدرة التفاوضية`,
    votingAnomalies: (n) => `${n} شذوذات تصويت مكتشفة — تشير إلى سلوك ائتلافي غير متوقع`,
    votingCrossParty: 'التحالفات العابرة للأحزاب حول تشريعات محددة يمكن أن تبني توافقاً أوسع',
    votingDiverseGroups: (n) => `${n} مجموعات سياسية نشطة — إمكانيات متنوعة لتشكيل الائتلاف`,
    votingHighSeverity: (n) => `${n} شذوذات عالية الخطورة — خطر تفتت الائتلاف`,
    votingShiftingAlliances: 'التحالفات المتغيرة قد تؤخر التقدم التشريعي في الملفات الرئيسية',
    prospectiveEvents: (n) => `${n} فعاليات عامة مجدولة — أجندة تشريعية نشطة`,
    prospectiveCommittees: (n) => `${n} اجتماعات لجان — مشاركة سياسية واسعة`,
    prospectiveBottlenecks: (n) => `${n} إجراءات تشريعية تواجه مخاطر اختناق`,
    prospectiveHighDensity: (n) => `كثافة أحداث عالية (${n}) تخاطر بتقليص وقت النقاش`,
    prospectiveDocuments: (n) => `${n} وثائق قيد النظر — زخم تشريعي`,
    prospectiveQuestions: (n) =>
      `${n} أسئلة برلمانية — مشاركة أعضاء البرلمان في اهتمامات المواطنين`,
    prospectiveBottleneckRisk: 'إجراءات الاختناق قد تفرض اختصارات إجرائية أو تؤجل ملفات رئيسية',
    prospectiveSchedulingRisk: 'كثافة الجدولة تزيد من خطر التعديلات في اللحظة الأخيرة',
    breakingAdopted: (n) => `${n} نصوص معتمدة — البرلمان يُظهر القدرة التشريعية`,
    breakingEvents: (n) => `${n} فعاليات برلمانية — مشاركة مؤسسية نشطة`,
    breakingAnomalyWeakness: 'شذوذات تصويت مكتشفة — عدم استقرار ائتلافي محتمل',
    breakingNoProcedures: 'لا إجراءات تشريعية جديدة — زخم محدود',
    breakingProceduresActive: (n) => `${n} إجراءات تتقدم — خط الأنابيب التشريعي نشط`,
    breakingCoalitionOpportunity: 'ديناميكيات الائتلاف تتغير — فرص تحالف جديدة تنشأ',
    breakingAnomalyThreat: 'الشذوذات المكتشفة قد تشير إلى إعادة ترتيب سياسي أعمق',
    breakingRapidEvents: 'الأحداث سريعة التطور قد تتجاوز القدرة التشريعية على الاستجابة',
    propositionsHealthStrong: (pct) => `صحة خط الأنابيب عند ${pct}% — إدارة تشريعية قوية`,
    propositionsThroughputGood: (n) => `معدل الإنتاجية ${n} — وتيرة معالجة صحية`,
    propositionsHealthWeak: (pct) => `صحة خط الأنابيب عند ${pct}% — خطر الازدحام التشريعي`,
    propositionsThroughputLow: (n) =>
      `إنتاجية منخفضة (${n}) — المعالجة البطيئة تؤخر تنفيذ السياسات`,
    propositionsPrioritisation: 'تحديد أولويات الملفات الرائدة يمكن أن يحسن كفاءة خط الأنابيب',
    propositionsTrilogueAcceleration: 'تسريع الحوار الثلاثي للملفات الناضجة يمكن أن يزيد الإنتاجية',
    propositionsCriticalCongestion: 'الازدحام الحرج قد يفرض التخلي عن ملفات تشريعية',
    propositionsOverlapping: 'الجداول الزمنية المتداخلة للتنفيذ تُرهق قدرة الدول الأعضاء على النقل',
    committeeActive: (active, total) => `${active} من ${total} لجنة تنتج وثائق بنشاط`,
    committeeDocuments: (n) => `${n} وثائق مُنتجة — إنتاج تشريعي قوي`,
    committeeInactive: (n) => `${n} لجان بدون نشاط وثائقي حديث`,
    committeeCrossCollaboration: 'التعاون بين اللجان في ملفات السياسة الأفقية يمكن أن يزيد التأثير',
    committeeHearings: 'جلسات استماع اللجان توفر منصة لمشاركة أصحاب المصلحة الخبراء',
    committeeLowActivity: 'انخفاض نشاط اللجان يخاطر باختناقات تشريعية لاحقاً',
    committeeCompetingPriorities: 'الأولويات السياسية المتنافسة قد تُضعف تركيز اللجان',
  },
  he: {
    votingHighCohesion: (n) => `${n} קבוצות פוליטיות עם לכידות מעל 80% — גושי הצבעה ממושמעים`,
    votingAdopted: (n) => `${n} טקסטים אומצו — מדגים פרודוקטיביות חקיקתית`,
    votingActiveVotes: (n) => `${n} הצבעות נרשמו — מעורבות פעילה במליאה`,
    votingLowCohesion: (n) =>
      `${n} קבוצות עם לכידות מתחת ל-50% — פיצולים פנימיים מחלישים כוח מיקוח`,
    votingAnomalies: (n) => `${n} חריגות הצבעה זוהו — מסמן התנהגות קואליציונית בלתי צפויה`,
    votingCrossParty: 'בריתות חוצות מפלגות בחקיקה ספציפית יכולות לבנות קונצנזוס רחב יותר',
    votingDiverseGroups: (n) => `${n} קבוצות פוליטיות פעילות — אפשרויות מגוונות ליצירת קואליציה`,
    votingHighSeverity: (n) => `${n} חריגות חמורות — סיכון לפירוק קואליציוני`,
    votingShiftingAlliances: 'בריתות משתנות עלולות לעכב התקדמות חקיקתית בתיקים מרכזיים',
    prospectiveEvents: (n) => `${n} אירועי מליאה מתוכננים — סדר יום חקיקתי פעיל`,
    prospectiveCommittees: (n) => `${n} ישיבות ועדה — מעורבות פוליטית רחבה`,
    prospectiveBottlenecks: (n) => `${n} הליכי חקיקה מתמודדים עם סיכוני צוואר בקבוק`,
    prospectiveHighDensity: (n) => `צפיפות אירועים גבוהה (${n}) מסכנת זמן דיון מצומצם`,
    prospectiveDocuments: (n) => `${n} מסמכים בבחינה — תנופה חקיקתית`,
    prospectiveQuestions: (n) => `${n} שאילתות פרלמנטריות — מעורבות חברי פרלמנט בדאגות אזרחים`,
    prospectiveBottleneckRisk:
      'הליכי צוואר בקבוק עלולים לכפות קיצורי דרך פרוצדורליים או לדחות תיקים מרכזיים',
    prospectiveSchedulingRisk: 'צפיפות תזמון מגבירה סיכון לתיקונים ברגע האחרון',
    breakingAdopted: (n) => `${n} טקסטים אומצו — הפרלמנט מדגים יכולת חקיקתית`,
    breakingEvents: (n) => `${n} אירועים פרלמנטריים — מעורבות מוסדית פעילה`,
    breakingAnomalyWeakness: 'חריגות הצבעה זוהו — חוסר יציבות קואליציוני אפשרי',
    breakingNoProcedures: 'אין הליכי חקיקה חדשים — תנופה מוגבלת',
    breakingProceduresActive: (n) => `${n} הליכים מתקדמים — צינור החקיקה פעיל`,
    breakingCoalitionOpportunity: 'דינמיקת הקואליציה משתנה — הזדמנויות ברית חדשות צצות',
    breakingAnomalyThreat: 'חריגות שזוהו עשויות לסמן שינוי פוליטי עמוק יותר',
    breakingRapidEvents: 'אירועים המתפתחים במהירות עלולים לעלות על יכולת התגובה החקיקתית',
    propositionsHealthStrong: (pct) => `בריאות הצינור ב-${pct}% — ניהול חקיקתי חזק`,
    propositionsThroughputGood: (n) => `קצב תפוקה ${n} — קצב עיבוד בריא`,
    propositionsHealthWeak: (pct) => `בריאות הצינור ב-${pct}% — סיכון לעומס חקיקתי`,
    propositionsThroughputLow: (n) => `תפוקה נמוכה (${n}) — עיבוד איטי מעכב יישום מדיניות`,
    propositionsPrioritisation: 'תעדוף תיקי דגל יכול לשפר את יעילות הצינור',
    propositionsTrilogueAcceleration: 'האצת טרילוג בתיקים בשלים יכולה להגביר את התפוקה',
    propositionsCriticalCongestion: 'עומס קריטי עלול לאלץ נטישת תיקי חקיקה',
    propositionsOverlapping: 'לוחות זמנים חופפים ליישום מעמיסים על יכולת ההעברה של המדינות החברות',
    committeeActive: (active, total) => `${active} מתוך ${total} ועדות מייצרות מסמכים באופן פעיל`,
    committeeDocuments: (n) => `${n} מסמכים הופקו — תפוקה חקיקתית חזקה`,
    committeeInactive: (n) => `${n} ועדות ללא פעילות מסמכים אחרונה`,
    committeeCrossCollaboration:
      'שיתוף פעולה בין ועדות בתיקי מדיניות אופקיים יכול להגביר את ההשפעה',
    committeeHearings: 'שימועי ועדות מספקים פלטפורמה למעורבות בעלי עניין מומחים',
    committeeLowActivity: 'פעילות ועדות נמוכה מסכנת צווארי בקבוק חקיקתיים בהמשך',
    committeeCompetingPriorities: 'סדרי עדיפויות פוליטיים מתחרים עלולים לדלל את מיקוד הוועדות',
  },
  ja: {
    votingHighCohesion: (n) => `${n}つの政治グループが80%以上の結束率 — 規律ある投票ブロック`,
    votingAdopted: (n) => `${n}件のテキストが採択 — 立法生産性を示す`,
    votingActiveVotes: (n) => `${n}件の投票が記録 — 活発な本会議参加`,
    votingLowCohesion: (n) => `${n}つのグループが50%未満の結束率 — 内部分裂が交渉力を弱める`,
    votingAnomalies: (n) => `${n}件の投票異常を検出 — 予測不能な連立行動を示唆`,
    votingCrossParty: '特定の法案における超党派同盟がより広い合意を構築できる',
    votingDiverseGroups: (n) => `${n}つの活動的な政治グループ — 多様な連立形成の可能性`,
    votingHighSeverity: (n) => `${n}件の重大な異常 — 連立の分裂リスク`,
    votingShiftingAlliances: '変動する同盟関係が主要案件の立法進展を遅らせる可能性',
    prospectiveEvents: (n) => `${n}件の本会議イベントが予定 — 活発な立法議題`,
    prospectiveCommittees: (n) => `${n}件の委員会会議 — 幅広い政策関与`,
    prospectiveBottlenecks: (n) => `${n}件の立法手続きがボトルネックリスクに直面`,
    prospectiveHighDensity: (n) => `高いイベント密度（${n}件）が討論時間の圧縮リスク`,
    prospectiveDocuments: (n) => `${n}件の文書が審議中 — 立法の勢い`,
    prospectiveQuestions: (n) => `${n}件の議会質問 — MEPの市民的懸念への関与`,
    prospectiveBottleneckRisk:
      'ボトルネック手続きが手続き上の近道を強制するか主要案件を延期させる可能性',
    prospectiveSchedulingRisk: 'スケジュール密度が直前の修正案リスクを高める',
    breakingAdopted: (n) => `${n}件のテキストが採択 — 議会が立法能力を発揮`,
    breakingEvents: (n) => `${n}件の議会イベント — 活発な制度的関与`,
    breakingAnomalyWeakness: '投票異常を検出 — 連立の不安定性の可能性',
    breakingNoProcedures: '新しい立法手続きなし — 限定的なパイプラインの勢い',
    breakingProceduresActive: (n) => `${n}件の手続きが進行中 — 立法パイプラインが活発`,
    breakingCoalitionOpportunity: '連立力学が変化中 — 新しい同盟機会が出現',
    breakingAnomalyThreat: '検出された異常がより深い政治的再編を示唆する可能性',
    breakingRapidEvents: '急速に発展する出来事が立法対応能力を超える可能性',
    propositionsHealthStrong: (pct) => `パイプライン健全性${pct}% — 強力な立法管理`,
    propositionsThroughputGood: (n) => `スループット率${n} — 健全な処理ペース`,
    propositionsHealthWeak: (pct) => `パイプライン健全性${pct}% — 立法渋滞リスク`,
    propositionsThroughputLow: (n) => `低スループット（${n}） — 遅い処理が政策実施を遅延`,
    propositionsPrioritisation: '主要法案の優先順位付けがパイプライン効率を向上できる',
    propositionsTrilogueAcceleration: '成熟した案件のトリローグ加速がスループットを向上できる',
    propositionsCriticalCongestion: '重大なパイプライン渋滞が立法案件の放棄を強いる可能性',
    propositionsOverlapping: '重複する実施タイムラインが加盟国の国内法化能力を圧迫',
    committeeActive: (active, total) => `${total}委員会中${active}が活発に文書を作成`,
    committeeDocuments: (n) => `${n}件の文書が作成 — 強力な立法産出`,
    committeeInactive: (n) => `${n}つの委員会が最近の文書活動なし`,
    committeeCrossCollaboration: '水平的な政策案件における委員会間協力が影響力を高められる',
    committeeHearings: '委員会公聴会が専門家ステークホルダーの参加のためのプラットフォームを提供',
    committeeLowActivity: '低い委員会活動が下流の立法ボトルネックリスク',
    committeeCompetingPriorities: '競合する政策優先事項が委員会の焦点を薄める可能性',
  },
  ko: {
    votingHighCohesion: (n) => `${n}개 정치 그룹이 80% 이상 결속력 — 규율 있는 투표 블록`,
    votingAdopted: (n) => `${n}건 텍스트 채택 — 입법 생산성 입증`,
    votingActiveVotes: (n) => `${n}건 투표 기록 — 활발한 본회의 참여`,
    votingLowCohesion: (n) => `${n}개 그룹이 50% 미만 결속력 — 내부 분열이 교섭력 약화`,
    votingAnomalies: (n) => `${n}건 투표 이상 감지 — 예측 불가능한 연합 행동 신호`,
    votingCrossParty: '특정 법안에서의 초당적 동맹이 더 넓은 합의를 구축할 수 있음',
    votingDiverseGroups: (n) => `${n}개 활동 정치 그룹 — 다양한 연합 형성 가능성`,
    votingHighSeverity: (n) => `${n}건 심각한 이상 — 연합 분열 위험`,
    votingShiftingAlliances: '변화하는 동맹이 주요 안건의 입법 진전을 지연시킬 수 있음',
    prospectiveEvents: (n) => `${n}건 본회의 일정 — 활발한 입법 의제`,
    prospectiveCommittees: (n) => `${n}건 위원회 회의 — 광범위한 정책 참여`,
    prospectiveBottlenecks: (n) => `${n}건 입법 절차 병목 위험`,
    prospectiveHighDensity: (n) => `높은 일정 밀도(${n}건)로 토론 시간 압축 위험`,
    prospectiveDocuments: (n) => `${n}건 문서 검토 중 — 입법 모멘텀`,
    prospectiveQuestions: (n) => `${n}건 의회 질의 — MEP의 시민 관심사 참여`,
    prospectiveBottleneckRisk: '병목 절차가 절차적 편법을 강제하거나 주요 안건을 연기할 수 있음',
    prospectiveSchedulingRisk: '일정 밀도가 막바지 수정안 위험을 높임',
    breakingAdopted: (n) => `${n}건 텍스트 채택 — 의회가 입법 능력 입증`,
    breakingEvents: (n) => `${n}건 의회 행사 — 활발한 제도적 참여`,
    breakingAnomalyWeakness: '투표 이상 감지 — 잠재적 연합 불안정성',
    breakingNoProcedures: '새로운 입법 절차 없음 — 제한된 파이프라인 모멘텀',
    breakingProceduresActive: (n) => `${n}건 절차 진행 중 — 입법 파이프라인 활성`,
    breakingCoalitionOpportunity: '연합 역학 변화 — 새로운 동맹 기회 출현',
    breakingAnomalyThreat: '감지된 이상이 더 깊은 정치적 재편을 시사할 수 있음',
    breakingRapidEvents: '빠르게 전개되는 사건이 입법 대응 능력을 초과할 수 있음',
    propositionsHealthStrong: (pct) => `파이프라인 건전성 ${pct}% — 강력한 입법 관리`,
    propositionsThroughputGood: (n) => `처리량 ${n} — 건전한 처리 속도`,
    propositionsHealthWeak: (pct) => `파이프라인 건전성 ${pct}% — 입법 정체 위험`,
    propositionsThroughputLow: (n) => `낮은 처리량(${n}) — 느린 처리가 정책 시행 지연`,
    propositionsPrioritisation: '주력 안건 우선순위 지정이 파이프라인 효율을 개선할 수 있음',
    propositionsTrilogueAcceleration: '성숙한 안건의 3자 협의 가속이 처리량을 높일 수 있음',
    propositionsCriticalCongestion: '심각한 파이프라인 정체가 입법 안건 포기를 강제할 수 있음',
    propositionsOverlapping: '중복되는 시행 일정이 회원국 전환 역량을 압박',
    committeeActive: (active, total) => `${total}개 위원회 중 ${active}개가 활발히 문서 생산`,
    committeeDocuments: (n) => `${n}건 문서 생산 — 강력한 입법 산출`,
    committeeInactive: (n) => `${n}개 위원회가 최근 문서 활동 없음`,
    committeeCrossCollaboration: '수평적 정책 안건에서 위원회 간 협력이 영향력을 높일 수 있음',
    committeeHearings: '위원회 청문회가 전문 이해관계자 참여를 위한 플랫폼 제공',
    committeeLowActivity: '낮은 위원회 활동이 하류 입법 병목 위험',
    committeeCompetingPriorities: '경쟁하는 정책 우선순위가 위원회 초점을 희석시킬 수 있음',
  },
  zh: {
    votingHighCohesion: (n) => `${n}个政治团体凝聚力超过80%——纪律严明的投票集团`,
    votingAdopted: (n) => `${n}项文本获通过——展示立法生产力`,
    votingActiveVotes: (n) => `${n}次投票记录——积极的全会参与`,
    votingLowCohesion: (n) => `${n}个团体凝聚力低于50%——内部分歧削弱谈判力`,
    votingAnomalies: (n) => `${n}项投票异常被检测——表明不可预测的联盟行为`,
    votingCrossParty: '在特定立法上的跨党派联盟可以建立更广泛的共识',
    votingDiverseGroups: (n) => `${n}个活跃政治团体——多元化的联盟组建可能性`,
    votingHighSeverity: (n) => `${n}项严重异常——联盟分裂风险`,
    votingShiftingAlliances: '不断变化的联盟可能延缓关键文件的立法进展',
    prospectiveEvents: (n) => `${n}场全会活动已排期——积极的立法议程`,
    prospectiveCommittees: (n) => `${n}场委员会会议——广泛的政策参与`,
    prospectiveBottlenecks: (n) => `${n}项立法程序面临瓶颈风险`,
    prospectiveHighDensity: (n) => `高活动密度（${n}项）存在压缩辩论时间风险`,
    prospectiveDocuments: (n) => `${n}份文件正在审议——立法动力`,
    prospectiveQuestions: (n) => `${n}项议会质询——议员关注公民诉求`,
    prospectiveBottleneckRisk: '瓶颈程序可能迫使采取程序性捷径或推迟关键文件',
    prospectiveSchedulingRisk: '排程密度增加了最后时刻修正案的风险',
    breakingAdopted: (n) => `${n}项文本获通过——议会展示立法能力`,
    breakingEvents: (n) => `${n}场议会活动——积极的机构参与`,
    breakingAnomalyWeakness: '投票异常被检测——潜在的联盟不稳定',
    breakingNoProcedures: '无新立法程序——有限的管道动力',
    breakingProceduresActive: (n) => `${n}项程序正在推进——立法管道活跃`,
    breakingCoalitionOpportunity: '联盟动态正在转变——新的联盟机会正在出现',
    breakingAnomalyThreat: '检测到的异常可能预示更深层的政治重组',
    breakingRapidEvents: '快速发展的事件可能超出立法应对能力',
    propositionsHealthStrong: (pct) => `管道健康度${pct}%——强有力的立法管理`,
    propositionsThroughputGood: (n) => `吞吐率${n}——健康的处理节奏`,
    propositionsHealthWeak: (pct) => `管道健康度${pct}%——立法拥堵风险`,
    propositionsThroughputLow: (n) => `低吞吐量（${n}）——缓慢处理延迟政策执行`,
    propositionsPrioritisation: '优先处理旗舰文件可以提高管道效率',
    propositionsTrilogueAcceleration: '加速成熟文件的三方谈判可以提高吞吐量',
    propositionsCriticalCongestion: '严重管道拥堵可能迫使放弃立法文件',
    propositionsOverlapping: '重叠的实施时间表给成员国转化能力带来压力',
    committeeActive: (active, total) => `${total}个委员会中${active}个积极产出文件`,
    committeeDocuments: (n) => `${n}份文件已产出——强劲的立法产出`,
    committeeInactive: (n) => `${n}个委员会近期无文件活动`,
    committeeCrossCollaboration: '跨委员会在横向政策文件上的合作可以增强影响力',
    committeeHearings: '委员会听证会为专家利益相关方参与提供平台',
    committeeLowActivity: '低委员会活动存在下游立法瓶颈风险',
    committeeCompetingPriorities: '相互竞争的政策优先事项可能稀释委员会焦点',
  },
};

// ─── Dashboard Builder Strings ───────────────────────────────────────────────

/**
 * Localized strings used by the 5 Dashboard builder functions in analysis-builders.
 * Panel titles, metric labels, and chart labels.
 */
export const DASHBOARD_BUILDER_STRINGS: LanguageMap<DashboardBuilderStrings> = {
  en: {
    votingOverview: 'Voting Overview',
    totalVotes: 'Total Votes',
    adopted: 'Adopted',
    rejected: 'Rejected',
    anomalies: 'Anomalies',
    politicalGroupCohesion: 'Political Group Cohesion',
    groupCohesionRates: 'Group Cohesion Rates',
    cohesionPct: 'Cohesion %',
    scheduledActivity: 'Scheduled Activity',
    plenaryEvents: 'Plenary Events',
    committeeMeetings: 'Committee Meetings',
    documents: 'Documents',
    pipelineProcedures: 'Pipeline Procedures',
    parliamentaryQuestions: 'Parliamentary Questions',
    questionsFiled: 'Questions Filed',
    bottleneckProcedures: 'Bottleneck Procedures',
    feedActivity: 'Feed Activity',
    adoptedTexts: 'Adopted Texts',
    events: 'Events',
    procedures: 'Procedures',
    mepUpdates: 'MEP Updates',
    activitySummary: 'Activity Summary',
    totalItems: 'Total Items',
    feedBreakdown: 'Feed Breakdown',
    items: 'Items',
    pipelineHealth: 'Pipeline Health',
    healthScore: 'Health Score',
    throughput: 'Throughput',
    status: 'Status',
    pipelineStrong: 'Strong',
    pipelineModerate: 'Moderate',
    pipelineWeak: 'Weak',
    committeeOverview: 'Committee Overview',
    totalCommittees: 'Total Committees',
    activeCommittees: 'Active Committees',
    activityRate: 'Activity Rate',
    documentsProduced: 'Documents Produced',
    documentOutputByCommittee: 'Document Output by Committee',
    documentsPerCommittee: 'Documents per Committee',
  },
  sv: {
    votingOverview: 'Röstningsöversikt',
    totalVotes: 'Totala röster',
    adopted: 'Antagna',
    rejected: 'Avvisade',
    anomalies: 'Anomalier',
    politicalGroupCohesion: 'Politisk gruppsammanhållning',
    groupCohesionRates: 'Gruppsammanhållning',
    cohesionPct: 'Sammanhållning %',
    scheduledActivity: 'Planerad aktivitet',
    plenaryEvents: 'Plenarsessioner',
    committeeMeetings: 'Utskottsmöten',
    documents: 'Dokument',
    pipelineProcedures: 'Pipelineförfaranden',
    parliamentaryQuestions: 'Parlamentariska frågor',
    questionsFiled: 'Inlämnade frågor',
    bottleneckProcedures: 'Flaskhalsförfaranden',
    feedActivity: 'Flödesaktivitet',
    adoptedTexts: 'Antagna texter',
    events: 'Händelser',
    procedures: 'Förfaranden',
    mepUpdates: 'MEP-uppdateringar',
    activitySummary: 'Aktivitetssammanfattning',
    totalItems: 'Totalt antal',
    feedBreakdown: 'Flödesfördelning',
    items: 'Objekt',
    pipelineHealth: 'Pipelinehälsa',
    healthScore: 'Hälsopoäng',
    throughput: 'Genomströmning',
    status: 'Status',
    pipelineStrong: 'Stark',
    pipelineModerate: 'Måttlig',
    pipelineWeak: 'Svag',
    committeeOverview: 'Utskottsöversikt',
    totalCommittees: 'Totala utskott',
    activeCommittees: 'Aktiva utskott',
    activityRate: 'Aktivitetsgrad',
    documentsProduced: 'Producerade dokument',
    documentOutputByCommittee: 'Dokumentproduktion per utskott',
    documentsPerCommittee: 'Dokument per utskott',
  },
  da: {
    votingOverview: 'Afstemningsoversigt',
    totalVotes: 'Samlede stemmer',
    adopted: 'Vedtaget',
    rejected: 'Afvist',
    anomalies: 'Anomalier',
    politicalGroupCohesion: 'Politisk gruppesamhørighed',
    groupCohesionRates: 'Gruppesamhørighed',
    cohesionPct: 'Samhørighed %',
    scheduledActivity: 'Planlagt aktivitet',
    plenaryEvents: 'Plenarmøder',
    committeeMeetings: 'Udvalgsmøder',
    documents: 'Dokumenter',
    pipelineProcedures: 'Pipeline-procedurer',
    parliamentaryQuestions: 'Parlamentariske spørgsmål',
    questionsFiled: 'Indsendte spørgsmål',
    bottleneckProcedures: 'Flaskehalsprocedurer',
    feedActivity: 'Feed-aktivitet',
    adoptedTexts: 'Vedtagne tekster',
    events: 'Begivenheder',
    procedures: 'Procedurer',
    mepUpdates: 'MEP-opdateringer',
    activitySummary: 'Aktivitetsoversigt',
    totalItems: 'Samlede elementer',
    feedBreakdown: 'Feed-fordeling',
    items: 'Elementer',
    pipelineHealth: 'Pipeline-sundhed',
    healthScore: 'Sundhedsscore',
    throughput: 'Gennemløb',
    status: 'Status',
    pipelineStrong: 'Stærk',
    pipelineModerate: 'Moderat',
    pipelineWeak: 'Svag',
    committeeOverview: 'Udvalgsoversigt',
    totalCommittees: 'Samlede udvalg',
    activeCommittees: 'Aktive udvalg',
    activityRate: 'Aktivitetsrate',
    documentsProduced: 'Producerede dokumenter',
    documentOutputByCommittee: 'Dokumentproduktion per udvalg',
    documentsPerCommittee: 'Dokumenter per udvalg',
  },
  no: {
    votingOverview: 'Avstemningsoversikt',
    totalVotes: 'Totale stemmer',
    adopted: 'Vedtatt',
    rejected: 'Avvist',
    anomalies: 'Avvik',
    politicalGroupCohesion: 'Politisk gruppesamhold',
    groupCohesionRates: 'Gruppesamhold',
    cohesionPct: 'Samhold %',
    scheduledActivity: 'Planlagt aktivitet',
    plenaryEvents: 'Plenarmøter',
    committeeMeetings: 'Komitémøter',
    documents: 'Dokumenter',
    pipelineProcedures: 'Pipeline-prosedyrer',
    parliamentaryQuestions: 'Parlamentariske spørsmål',
    questionsFiled: 'Innsendte spørsmål',
    bottleneckProcedures: 'Flaskehalsprosedyrer',
    feedActivity: 'Feed-aktivitet',
    adoptedTexts: 'Vedtatte tekster',
    events: 'Hendelser',
    procedures: 'Prosedyrer',
    mepUpdates: 'MEP-oppdateringer',
    activitySummary: 'Aktivitetssammendrag',
    totalItems: 'Totale elementer',
    feedBreakdown: 'Feed-fordeling',
    items: 'Elementer',
    pipelineHealth: 'Pipeline-helse',
    healthScore: 'Helsescore',
    throughput: 'Gjennomstrømning',
    status: 'Status',
    pipelineStrong: 'Sterk',
    pipelineModerate: 'Moderat',
    pipelineWeak: 'Svak',
    committeeOverview: 'Komitéoversikt',
    totalCommittees: 'Totale komiteer',
    activeCommittees: 'Aktive komiteer',
    activityRate: 'Aktivitetsrate',
    documentsProduced: 'Produserte dokumenter',
    documentOutputByCommittee: 'Dokumentproduksjon per komité',
    documentsPerCommittee: 'Dokumenter per komité',
  },
  fi: {
    votingOverview: 'Äänestyskatsaus',
    totalVotes: 'Äänestykset yhteensä',
    adopted: 'Hyväksytyt',
    rejected: 'Hylätyt',
    anomalies: 'Poikkeamat',
    politicalGroupCohesion: 'Poliittisten ryhmien yhtenäisyys',
    groupCohesionRates: 'Ryhmäyhtenäisyys',
    cohesionPct: 'Yhtenäisyys %',
    scheduledActivity: 'Aikataulutettu toiminta',
    plenaryEvents: 'Täysistuntotapahtumat',
    committeeMeetings: 'Valiokuntakokoukset',
    documents: 'Asiakirjat',
    pipelineProcedures: 'Pipeline-menettelyt',
    parliamentaryQuestions: 'Parlamentaariset kysymykset',
    questionsFiled: 'Jätetyt kysymykset',
    bottleneckProcedures: 'Pullonkaulamenettelyt',
    feedActivity: 'Syöteaktiivisuus',
    adoptedTexts: 'Hyväksytyt tekstit',
    events: 'Tapahtumat',
    procedures: 'Menettelyt',
    mepUpdates: 'MEP-päivitykset',
    activitySummary: 'Toimintayhteenveto',
    totalItems: 'Kohteet yhteensä',
    feedBreakdown: 'Syötejakauma',
    items: 'Kohteet',
    pipelineHealth: 'Pipeline-terveys',
    healthScore: 'Terveyspisteet',
    throughput: 'Läpäisyaste',
    status: 'Tila',
    pipelineStrong: 'Vahva',
    pipelineModerate: 'Kohtalainen',
    pipelineWeak: 'Heikko',
    committeeOverview: 'Valiokuntakatsaus',
    totalCommittees: 'Valiokunnat yhteensä',
    activeCommittees: 'Aktiiviset valiokunnat',
    activityRate: 'Aktiivisuusaste',
    documentsProduced: 'Tuotetut asiakirjat',
    documentOutputByCommittee: 'Asiakirjatuotanto valiokunnittain',
    documentsPerCommittee: 'Asiakirjat per valiokunta',
  },
  de: {
    votingOverview: 'Abstimmungsübersicht',
    totalVotes: 'Gesamtabstimmungen',
    adopted: 'Angenommen',
    rejected: 'Abgelehnt',
    anomalies: 'Anomalien',
    politicalGroupCohesion: 'Fraktionskohäsion',
    groupCohesionRates: 'Fraktionskohäsionsraten',
    cohesionPct: 'Kohäsion %',
    scheduledActivity: 'Geplante Aktivität',
    plenaryEvents: 'Plenarveranstaltungen',
    committeeMeetings: 'Ausschusssitzungen',
    documents: 'Dokumente',
    pipelineProcedures: 'Pipeline-Verfahren',
    parliamentaryQuestions: 'Parlamentarische Anfragen',
    questionsFiled: 'Eingereichte Anfragen',
    bottleneckProcedures: 'Engpassverfahren',
    feedActivity: 'Feed-Aktivität',
    adoptedTexts: 'Angenommene Texte',
    events: 'Veranstaltungen',
    procedures: 'Verfahren',
    mepUpdates: 'MdEP-Aktualisierungen',
    activitySummary: 'Aktivitätszusammenfassung',
    totalItems: 'Gesamtelemente',
    feedBreakdown: 'Feed-Aufschlüsselung',
    items: 'Elemente',
    pipelineHealth: 'Pipeline-Gesundheit',
    healthScore: 'Gesundheitswert',
    throughput: 'Durchsatz',
    status: 'Status',
    pipelineStrong: 'Stark',
    pipelineModerate: 'Mäßig',
    pipelineWeak: 'Schwach',
    committeeOverview: 'Ausschussübersicht',
    totalCommittees: 'Gesamtausschüsse',
    activeCommittees: 'Aktive Ausschüsse',
    activityRate: 'Aktivitätsrate',
    documentsProduced: 'Produzierte Dokumente',
    documentOutputByCommittee: 'Dokumentenproduktion je Ausschuss',
    documentsPerCommittee: 'Dokumente je Ausschuss',
  },
  fr: {
    votingOverview: 'Aperçu des votes',
    totalVotes: 'Total des votes',
    adopted: 'Adoptés',
    rejected: 'Rejetés',
    anomalies: 'Anomalies',
    politicalGroupCohesion: 'Cohésion des groupes politiques',
    groupCohesionRates: 'Taux de cohésion des groupes',
    cohesionPct: 'Cohésion %',
    scheduledActivity: 'Activité programmée',
    plenaryEvents: 'Événements pléniers',
    committeeMeetings: 'Réunions de commission',
    documents: 'Documents',
    pipelineProcedures: 'Procédures en cours',
    parliamentaryQuestions: 'Questions parlementaires',
    questionsFiled: 'Questions déposées',
    bottleneckProcedures: "Procédures en goulot d'étranglement",
    feedActivity: 'Activité du flux',
    adoptedTexts: 'Textes adoptés',
    events: 'Événements',
    procedures: 'Procédures',
    mepUpdates: 'Mises à jour des députés',
    activitySummary: "Résumé d'activité",
    totalItems: 'Total des éléments',
    feedBreakdown: 'Répartition du flux',
    items: 'Éléments',
    pipelineHealth: 'Santé du pipeline',
    healthScore: 'Score de santé',
    throughput: 'Débit',
    status: 'Statut',
    pipelineStrong: 'Fort',
    pipelineModerate: 'Modéré',
    pipelineWeak: 'Faible',
    committeeOverview: 'Aperçu des commissions',
    totalCommittees: 'Total des commissions',
    activeCommittees: 'Commissions actives',
    activityRate: "Taux d'activité",
    documentsProduced: 'Documents produits',
    documentOutputByCommittee: 'Production documentaire par commission',
    documentsPerCommittee: 'Documents par commission',
  },
  es: {
    votingOverview: 'Resumen de votaciones',
    totalVotes: 'Total de votos',
    adopted: 'Adoptados',
    rejected: 'Rechazados',
    anomalies: 'Anomalías',
    politicalGroupCohesion: 'Cohesión de grupos políticos',
    groupCohesionRates: 'Tasas de cohesión de grupos',
    cohesionPct: 'Cohesión %',
    scheduledActivity: 'Actividad programada',
    plenaryEvents: 'Eventos plenarios',
    committeeMeetings: 'Reuniones de comisión',
    documents: 'Documentos',
    pipelineProcedures: 'Procedimientos en curso',
    parliamentaryQuestions: 'Preguntas parlamentarias',
    questionsFiled: 'Preguntas presentadas',
    bottleneckProcedures: 'Procedimientos con cuello de botella',
    feedActivity: 'Actividad del feed',
    adoptedTexts: 'Textos adoptados',
    events: 'Eventos',
    procedures: 'Procedimientos',
    mepUpdates: 'Actualizaciones de eurodiputados',
    activitySummary: 'Resumen de actividad',
    totalItems: 'Total de elementos',
    feedBreakdown: 'Desglose del feed',
    items: 'Elementos',
    pipelineHealth: 'Salud del pipeline',
    healthScore: 'Puntuación de salud',
    throughput: 'Rendimiento',
    status: 'Estado',
    pipelineStrong: 'Fuerte',
    pipelineModerate: 'Moderado',
    pipelineWeak: 'Débil',
    committeeOverview: 'Resumen de comisiones',
    totalCommittees: 'Total de comisiones',
    activeCommittees: 'Comisiones activas',
    activityRate: 'Tasa de actividad',
    documentsProduced: 'Documentos producidos',
    documentOutputByCommittee: 'Producción documental por comisión',
    documentsPerCommittee: 'Documentos por comisión',
  },
  nl: {
    votingOverview: 'Stemoverzicht',
    totalVotes: 'Totaal stemmen',
    adopted: 'Aangenomen',
    rejected: 'Verworpen',
    anomalies: 'Afwijkingen',
    politicalGroupCohesion: 'Fractiecohesie',
    groupCohesionRates: 'Fractiecohesiepercentages',
    cohesionPct: 'Cohesie %',
    scheduledActivity: 'Geplande activiteit',
    plenaryEvents: 'Plenaire evenementen',
    committeeMeetings: 'Commissievergaderingen',
    documents: 'Documenten',
    pipelineProcedures: 'Pipeline-procedures',
    parliamentaryQuestions: 'Parlementaire vragen',
    questionsFiled: 'Ingediende vragen',
    bottleneckProcedures: 'Knelpuntprocedures',
    feedActivity: 'Feedactiviteit',
    adoptedTexts: 'Aangenomen teksten',
    events: 'Evenementen',
    procedures: 'Procedures',
    mepUpdates: 'EP-lid-updates',
    activitySummary: 'Activiteitssamenvatting',
    totalItems: 'Totaal items',
    feedBreakdown: 'Feedverdeling',
    items: 'Items',
    pipelineHealth: 'Pipeline-gezondheid',
    healthScore: 'Gezondheidsscore',
    throughput: 'Doorvoer',
    status: 'Status',
    pipelineStrong: 'Sterk',
    pipelineModerate: 'Matig',
    pipelineWeak: 'Zwak',
    committeeOverview: 'Commissieoverzicht',
    totalCommittees: 'Totaal commissies',
    activeCommittees: 'Actieve commissies',
    activityRate: 'Activiteitspercentage',
    documentsProduced: 'Geproduceerde documenten',
    documentOutputByCommittee: 'Documentproductie per commissie',
    documentsPerCommittee: 'Documenten per commissie',
  },
  ar: {
    votingOverview: 'نظرة عامة على التصويت',
    totalVotes: 'إجمالي الأصوات',
    adopted: 'معتمدة',
    rejected: 'مرفوضة',
    anomalies: 'شذوذات',
    politicalGroupCohesion: 'تماسك المجموعات السياسية',
    groupCohesionRates: 'معدلات تماسك المجموعات',
    cohesionPct: 'التماسك %',
    scheduledActivity: 'النشاط المجدول',
    plenaryEvents: 'فعاليات الجلسة العامة',
    committeeMeetings: 'اجتماعات اللجان',
    documents: 'الوثائق',
    pipelineProcedures: 'إجراءات خط الأنابيب',
    parliamentaryQuestions: 'الأسئلة البرلمانية',
    questionsFiled: 'الأسئلة المقدمة',
    bottleneckProcedures: 'إجراءات الاختناق',
    feedActivity: 'نشاط التغذية',
    adoptedTexts: 'النصوص المعتمدة',
    events: 'الفعاليات',
    procedures: 'الإجراءات',
    mepUpdates: 'تحديثات الأعضاء',
    activitySummary: 'ملخص النشاط',
    totalItems: 'إجمالي العناصر',
    feedBreakdown: 'توزيع التغذية',
    items: 'العناصر',
    pipelineHealth: 'صحة خط الأنابيب',
    healthScore: 'درجة الصحة',
    throughput: 'معدل الإنتاجية',
    status: 'الحالة',
    pipelineStrong: 'قوي',
    pipelineModerate: 'معتدل',
    pipelineWeak: 'ضعيف',
    committeeOverview: 'نظرة عامة على اللجان',
    totalCommittees: 'إجمالي اللجان',
    activeCommittees: 'اللجان النشطة',
    activityRate: 'معدل النشاط',
    documentsProduced: 'الوثائق المنتجة',
    documentOutputByCommittee: 'إنتاج الوثائق حسب اللجنة',
    documentsPerCommittee: 'الوثائق لكل لجنة',
  },
  he: {
    votingOverview: 'סקירת הצבעות',
    totalVotes: 'סך ההצבעות',
    adopted: 'אומצו',
    rejected: 'נדחו',
    anomalies: 'חריגות',
    politicalGroupCohesion: 'לכידות קבוצות פוליטיות',
    groupCohesionRates: 'שיעורי לכידות קבוצתית',
    cohesionPct: 'לכידות %',
    scheduledActivity: 'פעילות מתוכננת',
    plenaryEvents: 'אירועי מליאה',
    committeeMeetings: 'ישיבות ועדה',
    documents: 'מסמכים',
    pipelineProcedures: 'הליכי צינור',
    parliamentaryQuestions: 'שאילתות פרלמנטריות',
    questionsFiled: 'שאילתות שהוגשו',
    bottleneckProcedures: 'הליכי צוואר בקבוק',
    feedActivity: 'פעילות פיד',
    adoptedTexts: 'טקסטים שאומצו',
    events: 'אירועים',
    procedures: 'הליכים',
    mepUpdates: 'עדכוני חברי פרלמנט',
    activitySummary: 'סיכום פעילות',
    totalItems: 'סך הפריטים',
    feedBreakdown: 'פירוט פיד',
    items: 'פריטים',
    pipelineHealth: 'בריאות צינור',
    healthScore: 'ציון בריאות',
    throughput: 'תפוקה',
    status: 'מצב',
    pipelineStrong: 'חזק',
    pipelineModerate: 'בינוני',
    pipelineWeak: 'חלש',
    committeeOverview: 'סקירת ועדות',
    totalCommittees: 'סך הוועדות',
    activeCommittees: 'ועדות פעילות',
    activityRate: 'שיעור פעילות',
    documentsProduced: 'מסמכים שהופקו',
    documentOutputByCommittee: 'תפוקת מסמכים לפי ועדה',
    documentsPerCommittee: 'מסמכים לכל ועדה',
  },
  ja: {
    votingOverview: '投票概要',
    totalVotes: '総投票数',
    adopted: '採択',
    rejected: '否決',
    anomalies: '異常',
    politicalGroupCohesion: '政治グループ結束力',
    groupCohesionRates: 'グループ結束率',
    cohesionPct: '結束率 %',
    scheduledActivity: '予定された活動',
    plenaryEvents: '本会議イベント',
    committeeMeetings: '委員会会議',
    documents: '文書',
    pipelineProcedures: 'パイプライン手続き',
    parliamentaryQuestions: '議会質問',
    questionsFiled: '提出された質問',
    bottleneckProcedures: 'ボトルネック手続き',
    feedActivity: 'フィード活動',
    adoptedTexts: '採択テキスト',
    events: 'イベント',
    procedures: '手続き',
    mepUpdates: 'MEP更新',
    activitySummary: '活動サマリー',
    totalItems: '総項目数',
    feedBreakdown: 'フィード内訳',
    items: '項目',
    pipelineHealth: 'パイプライン健全性',
    healthScore: '健全性スコア',
    throughput: 'スループット',
    status: 'ステータス',
    pipelineStrong: '強い',
    pipelineModerate: '中程度',
    pipelineWeak: '弱い',
    committeeOverview: '委員会概要',
    totalCommittees: '委員会総数',
    activeCommittees: '活動中の委員会',
    activityRate: '活動率',
    documentsProduced: '作成された文書',
    documentOutputByCommittee: '委員会別文書産出',
    documentsPerCommittee: '委員会あたりの文書数',
  },
  ko: {
    votingOverview: '투표 개요',
    totalVotes: '총 투표 수',
    adopted: '채택',
    rejected: '거부',
    anomalies: '이상',
    politicalGroupCohesion: '정치 그룹 결속력',
    groupCohesionRates: '그룹 결속률',
    cohesionPct: '결속률 %',
    scheduledActivity: '예정된 활동',
    plenaryEvents: '본회의 일정',
    committeeMeetings: '위원회 회의',
    documents: '문서',
    pipelineProcedures: '파이프라인 절차',
    parliamentaryQuestions: '의회 질의',
    questionsFiled: '제출된 질의',
    bottleneckProcedures: '병목 절차',
    feedActivity: '피드 활동',
    adoptedTexts: '채택 텍스트',
    events: '행사',
    procedures: '절차',
    mepUpdates: 'MEP 업데이트',
    activitySummary: '활동 요약',
    totalItems: '총 항목 수',
    feedBreakdown: '피드 구성',
    items: '항목',
    pipelineHealth: '파이프라인 건전성',
    healthScore: '건전성 점수',
    throughput: '처리량',
    status: '상태',
    pipelineStrong: '강함',
    pipelineModerate: '보통',
    pipelineWeak: '약함',
    committeeOverview: '위원회 개요',
    totalCommittees: '총 위원회 수',
    activeCommittees: '활동 위원회',
    activityRate: '활동률',
    documentsProduced: '생산된 문서',
    documentOutputByCommittee: '위원회별 문서 산출',
    documentsPerCommittee: '위원회당 문서 수',
  },
  zh: {
    votingOverview: '投票概览',
    totalVotes: '总投票数',
    adopted: '通过',
    rejected: '否决',
    anomalies: '异常',
    politicalGroupCohesion: '政治团体凝聚力',
    groupCohesionRates: '团体凝聚率',
    cohesionPct: '凝聚力 %',
    scheduledActivity: '计划活动',
    plenaryEvents: '全会活动',
    committeeMeetings: '委员会会议',
    documents: '文件',
    pipelineProcedures: '管道程序',
    parliamentaryQuestions: '议会质询',
    questionsFiled: '提交的质询',
    bottleneckProcedures: '瓶颈程序',
    feedActivity: '信息流活动',
    adoptedTexts: '通过的文本',
    events: '活动',
    procedures: '程序',
    mepUpdates: '议员更新',
    activitySummary: '活动摘要',
    totalItems: '总项目数',
    feedBreakdown: '信息流构成',
    items: '项目',
    pipelineHealth: '管道健康度',
    healthScore: '健康分数',
    throughput: '吞吐量',
    status: '状态',
    pipelineStrong: '强',
    pipelineModerate: '中等',
    pipelineWeak: '弱',
    committeeOverview: '委员会概览',
    totalCommittees: '委员会总数',
    activeCommittees: '活跃委员会',
    activityRate: '活动率',
    documentsProduced: '产出文件',
    documentOutputByCommittee: '各委员会文件产出',
    documentsPerCommittee: '每委员会文件数',
  },
};
