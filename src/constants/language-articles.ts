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
  PropositionsAnalysisContentStrings,
  StakeholderReasoningStrings,
  VotingAnalysisContentStrings,
  ProspectiveAnalysisContentStrings,
  BreakingAnalysisContentStrings,
  EditorialStrings,
  MotionsStrings,
  WeekAheadStrings,
  WeekAheadStakeholderStrings,
  BreakingStrings,
  DeepAnalysisStrings,
  CommitteeAnalysisContentStrings,
  SwotStrings,
  DashboardStrings,
  SwotBuilderStrings,
  DashboardBuilderStrings,
  MultiDimensionalSwotStrings,
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

// ─── Propositions deep-analysis localized content ─────────────────────────────

export const PROPOSITIONS_ANALYSIS_CONTENT_STRINGS: LanguageMap<PropositionsAnalysisContentStrings> =
  {
    en: {
      what: 'Legislative pipeline assessment as of {date}: Health score {pct}%, throughput rate {throughput}. Active proposals under consideration.',
      whatNoProposals:
        'Legislative pipeline assessment as of {date}: Health score {pct}%, throughput rate {throughput}. No new proposals detected in this period.',
      whoCommission: 'European Commission (proposal originator)',
      whoRapporteurs: 'Rapporteurs (responsible for steering through committee)',
      whoShadowRapporteurs: 'Shadow rapporteurs (political group negotiators)',
      whoCouncil: 'Council of the EU (co-legislator)',
      whenAssessment: 'Assessment date: {date}',
      whenCumulative: 'Pipeline health reflects cumulative legislative progress',
      whyStrong:
        'The legislative pipeline operates at {pct}% health with a throughput of {throughput} procedures, indicating strong institutional capacity to process pending proposals. Political group coordination and committee efficiency drive this productive legislative tempo.',
      whyModerate:
        'Pipeline health at {pct}% with throughput of {throughput} reflects moderate legislative processing capacity. Some procedures face delays at committee or trilogue stages, requiring enhanced political coordination.',
      whyWeak:
        'Legislative pipeline health at {pct}% with throughput of {throughput} signals significant processing challenges. Bottlenecked procedures and political disagreements are constraining legislative output.',
      impactPolitical:
        'Legislative pipeline at {pct}% health shapes political group bargaining dynamics.',
      impactPoliticalStrong: 'Strong throughput enables coalition-building on priority files.',
      impactPoliticalWeak: 'Bottleneck pressure may force compromise negotiations.',
      impactEconomic:
        '{throughput} procedures in the pipeline carry potential economic regulatory implications.',
      impactEconomicStrong: 'Efficient processing supports predictable business planning horizons.',
      impactEconomicWeak: 'Delayed procedures create regulatory uncertainty for affected sectors.',
      impactSocial:
        'Pipeline processing capacity directly affects the pace of social policy legislation reaching citizens. Current throughput of {throughput} procedures shapes the timeline for rights-related legislation.',
      impactLegal:
        'Legislative pipeline at {pct}% health influences the volume and pace of new EU legal instruments entering the official journal, with implications for national transposition deadlines.',
      impactGeopolitical:
        "EU legislative output capacity at {pct}% health affects the Parliament's credibility and influence in international negotiations and trade discussions.",
      outlookGood:
        'Legislative pipeline at {pct}% health with throughput of {throughput} positions the Parliament for continued productive output. Likely scenario: sustained legislative momentum with efficient committee-to-plenary progression. Possible scenario: new Commission proposals may strain processing capacity.',
      outlookConcern:
        'Pipeline health at {pct}% requires attention from legislative coordinators. Likely scenario: selective prioritisation of key files to improve throughput. Possible scenario: political impasse on contentious files may further reduce pipeline efficiency.',
      mistakeDescription: 'Pipeline health dropped to {pct}%',
      mistakeAlternative:
        'Earlier intervention through prioritised scheduling and pre-negotiation sessions between political groups could have maintained pipeline health above 50%.',
      actionHealth: 'Pipeline health at {pct}%',
      actionThroughput: 'Throughput rate at {throughput}',
      consequenceStrong:
        'Strong pipeline health ({pct}%) indicates efficient legislative processing capacity, affecting the pace of regulatory and policy adoption.',
      consequenceModerate:
        'Moderate pipeline health ({pct}%) indicates moderate legislative processing capacity, affecting the pace of regulatory and policy adoption.',
      consequenceWeak:
        'Weak pipeline health ({pct}%) indicates constrained legislative processing capacity, affecting the pace of regulatory and policy adoption.',
      consequenceThroughputHigh:
        'Throughput of {throughput} procedures reflects productive legislative output.',
      consequenceThroughputMedium:
        'Throughput of {throughput} procedures indicates moderate processing capacity.',
      consequenceThroughputLow:
        'Throughput of {throughput} procedures signals potential bottleneck conditions requiring attention from committee coordinators.',
      stakeholderWinnerActor: 'Parliament presidency',
      stakeholderWinnerReason:
        'Pipeline health at {pct}% demonstrates effective legislative coordination by the Parliament presidency, enabling timely processing of priority files.',
      stakeholderLoserActor: 'Pending legislation sponsors',
      stakeholderLoserReason:
        'Pipeline health at {pct}% means pending legislation faces delays, disadvantaging sponsors whose proposals require timely adoption to address policy needs.',
      stakeholderTopic: 'legislative pipeline as of {date}',
    },
    sv: {
      what: 'Lagstiftningspipelinebedömning per {date}: Hälsopoäng {pct}%, genomströmningshastighet {throughput}. Aktiva förslag under behandling.',
      whatNoProposals:
        'Lagstiftningspipelinebedömning per {date}: Hälsopoäng {pct}%, genomströmningshastighet {throughput}. Inga nya förslag upptäckta under denna period.',
      whoCommission: 'Europeiska kommissionen (förslagsställare)',
      whoRapporteurs: 'Föredragande (ansvarig för utskottsbehandling)',
      whoShadowRapporteurs: 'Skuggföredragande (politiska gruppförhandlare)',
      whoCouncil: 'Europeiska unionens råd (medlagstiftare)',
      whenAssessment: 'Bedömningsdatum: {date}',
      whenCumulative: 'Pipelinens hälsa återspeglar kumulativa lagstiftningsframsteg',
      whyStrong:
        'Lagstiftningspipelinen fungerar med {pct}% hälsa och en genomströmning på {throughput} förfaranden, vilket indikerar stark institutionell kapacitet att bearbeta väntande förslag. Politisk gruppsamordning och utskottseffektivitet driver detta produktiva lagstiftningstempo.',
      whyModerate:
        'Pipelinens hälsa på {pct}% med genomströmning på {throughput} återspeglar måttlig lagstiftningsbearbetningskapacitet. Vissa förfaranden möter förseningar vid utskotts- eller trilogstadiet, vilket kräver förstärkt politisk samordning.',
      whyWeak:
        'Lagstiftningspipelinens hälsa på {pct}% med genomströmning på {throughput} signalerar betydande bearbetningsutmaningar. Blockerade förfaranden och politiska meningsskiljaktigheter begränsar lagstiftningsproduktionen.',
      impactPolitical:
        'Lagstiftningspipelinen på {pct}% hälsa formar politiska gruppers förhandlingsdynamik.',
      impactPoliticalStrong:
        'Stark genomströmning möjliggör koalitionsbyggande kring prioriterade ärenden.',
      impactPoliticalWeak: 'Flaskhalstryck kan tvinga fram kompromissförhandlingar.',
      impactEconomic:
        '{throughput} förfaranden i pipelinen medför potentiella ekonomiska regleringskonsekvenser.',
      impactEconomicStrong: 'Effektiv bearbetning stödjer förutsägbara affärsplaneringshorisoner.',
      impactEconomicWeak:
        'Försenade förfaranden skapar regulatorisk osäkerhet för berörda sektorer.',
      impactSocial:
        'Pipelinens bearbetningskapacitet påverkar direkt takten för socialpolitisk lagstiftning som når medborgarna. Nuvarande genomströmning på {throughput} förfaranden formar tidslinjen för rättighetsrelaterad lagstiftning.',
      impactLegal:
        'Lagstiftningspipelinen på {pct}% hälsa påverkar volymen och takten för nya EU-rättsliga instrument som publiceras i EU:s officiella tidning, med konsekvenser för nationella genomförandefrister.',
      impactGeopolitical:
        'EU:s lagstiftningskapacitet på {pct}% hälsa påverkar parlamentets trovärdighet och inflytande i internationella förhandlingar och handelsdiskussioner.',
      outlookGood:
        'Lagstiftningspipelinen på {pct}% hälsa med genomströmning på {throughput} positionerar parlamentet för fortsatt produktiv output. Sannolikt scenario: bibehållen lagstiftningsmomentum med effektiv progression från utskott till plenum. Möjligt scenario: nya kommissionsförslag kan belasta bearbetningskapaciteten.',
      outlookConcern:
        'Pipelinens hälsa på {pct}% kräver uppmärksamhet från lagstiftningssamordnare. Sannolikt scenario: selektiv prioritering av nyckelärenden för att förbättra genomströmningen. Möjligt scenario: politiskt dödläge i kontroversiella ärenden kan ytterligare minska pipelinens effektivitet.',
      mistakeDescription: 'Pipelinens hälsa sjönk till {pct}%',
      mistakeAlternative:
        'Tidigare ingripande genom prioriterad schemaläggning och förförhandlingssessioner mellan politiska grupper kunde ha upprätthållit pipelinens hälsa över 50%.',
      actionHealth: 'Pipelinens hälsa på {pct}%',
      actionThroughput: 'Genomströmningshastighet på {throughput}',
      consequenceStrong:
        'Stark pipelinehälsa ({pct}%) indikerar effektiv lagstiftningsbearbetningskapacitet som påverkar takten för reglerings- och policyantagen.',
      consequenceModerate:
        'Måttlig pipelinehälsa ({pct}%) indikerar måttlig lagstiftningsbearbetningskapacitet som påverkar takten för reglerings- och policyantagen.',
      consequenceWeak:
        'Svag pipelinehälsa ({pct}%) indikerar begränsad lagstiftningsbearbetningskapacitet som påverkar takten för reglerings- och policyantagen.',
      consequenceThroughputHigh:
        'Genomströmning på {throughput} förfaranden återspeglar produktiv lagstiftningsproduktion.',
      consequenceThroughputMedium:
        'Genomströmning på {throughput} förfaranden indikerar måttlig bearbetningskapacitet.',
      consequenceThroughputLow:
        'Genomströmning på {throughput} förfaranden signalerar potentiella flaskhalsförhållanden som kräver uppmärksamhet från utskottssamordnare.',
      stakeholderWinnerActor: 'Parlamentets presidium',
      stakeholderWinnerReason:
        'Pipelinens hälsa på {pct}% visar effektiv lagstiftningssamordning av parlamentets presidium, vilket möjliggör snabb behandling av prioriterade ärenden.',
      stakeholderLoserActor: 'Sponsorer av väntande lagstiftning',
      stakeholderLoserReason:
        'Pipelinens hälsa på {pct}% innebär att väntande lagstiftning möter förseningar, vilket missgynnar sponsorer vars förslag kräver snabb antagning.',
      stakeholderTopic: 'lagstiftningspipeline per {date}',
    },
    da: {
      what: 'Lovgivningspipelinevurdering pr. {date}: Sundhedsscore {pct}%, gennemstrømningshastighed {throughput}. Aktive forslag under behandling.',
      whatNoProposals:
        'Lovgivningspipelinevurdering pr. {date}: Sundhedsscore {pct}%, gennemstrømningshastighed {throughput}. Ingen nye forslag opdaget i denne periode.',
      whoCommission: 'Europa-Kommissionen (forslagsstiller)',
      whoRapporteurs: 'Ordførere (ansvarlig for udvalgsbehandling)',
      whoShadowRapporteurs: 'Skyggeordførere (politiske gruppeforhandlere)',
      whoCouncil: 'Rådet for Den Europæiske Union (medlovgiver)',
      whenAssessment: 'Vurderingsdato: {date}',
      whenCumulative: 'Pipelinesundhed afspejler kumulativ lovgivningsmæssig fremgang',
      whyStrong:
        'Lovgivningspipelinen opererer med {pct}% sundhed og en gennemstrømning på {throughput} procedurer, hvilket indikerer stærk institutionel kapacitet.',
      whyModerate:
        'Pipelinesundhed på {pct}% med gennemstrømning på {throughput} afspejler moderat lovgivningsmæssig behandlingskapacitet.',
      whyWeak:
        'Lovgivningspipelinesundhed på {pct}% med gennemstrømning på {throughput} signalerer betydelige behandlingsudfordringer.',
      impactPolitical:
        'Lovgivningspipelinen på {pct}% sundhed former politiske gruppers forhandlingsdynamik.',
      impactPoliticalStrong:
        'Stærk gennemstrømning muliggør koalitionsbygning om prioriterede filer.',
      impactPoliticalWeak: 'Flaskehals kan fremtvinge kompromisforhandlinger.',
      impactEconomic:
        '{throughput} procedurer i pipelinen medfører potentielle økonomiske reguleringskonsekvenser.',
      impactEconomicStrong:
        'Effektiv behandling understøtter forudsigelige forretningsplanlægningshorisonter.',
      impactEconomicWeak:
        'Forsinkede procedurer skaber regulatorisk usikkerhed for berørte sektorer.',
      impactSocial:
        'Pipelinens behandlingskapacitet påvirker direkte tempoet for socialpolitisk lovgivning, der når borgerne. Nuværende gennemstrømning på {throughput} procedurer former tidslinjen.',
      impactLegal:
        'Lovgivningspipelinen på {pct}% sundhed påvirker mængden og tempoet af nye EU-retslige instrumenter, der indgår i EU-Tidende.',
      impactGeopolitical:
        "EU's lovgivningskapacitet på {pct}% sundhed påvirker Parlamentets troværdighed i internationale forhandlinger.",
      outlookGood:
        'Lovgivningspipelinen på {pct}% sundhed med gennemstrømning på {throughput} positionerer Parlamentet for fortsat produktiv output.',
      outlookConcern: 'Pipelinesundhed på {pct}% kræver opmærksomhed fra lovgivningskoordinatorer.',
      mistakeDescription: 'Pipelinesundhed faldt til {pct}%',
      mistakeAlternative:
        'Tidligere indgriben gennem prioriteret planlægning og forforhandlingssessioner mellem politiske grupper kunne have opretholdt pipelinesundheden over 50%.',
      actionHealth: 'Pipelinesundhed på {pct}%',
      actionThroughput: 'Gennemstrømningshastighed på {throughput}',
      consequenceStrong:
        'Stærk pipelinesundhed ({pct}%) indikerer effektiv lovgivningsmæssig behandlingskapacitet.',
      consequenceModerate:
        'Moderat pipelinesundhed ({pct}%) indikerer moderat lovgivningsmæssig behandlingskapacitet.',
      consequenceWeak:
        'Svag pipelinesundhed ({pct}%) indikerer begrænset lovgivningsmæssig behandlingskapacitet.',
      consequenceThroughputHigh:
        'Gennemstrømning på {throughput} procedurer afspejler produktiv lovgivningsmæssig output.',
      consequenceThroughputMedium:
        'Gennemstrømning på {throughput} procedurer indikerer moderat behandlingskapacitet.',
      consequenceThroughputLow:
        'Gennemstrømning på {throughput} procedurer signalerer potentielle flaskehalse.',
      stakeholderWinnerActor: 'Parlamentets præsidium',
      stakeholderWinnerReason:
        'Pipelinesundhed på {pct}% demonstrerer effektiv lovgivningsmæssig koordinering.',
      stakeholderLoserActor: 'Sponsorer af afventende lovgivning',
      stakeholderLoserReason:
        'Pipelinesundhed på {pct}% betyder, at afventende lovgivning står over for forsinkelser.',
      stakeholderTopic: 'lovgivningspipeline pr. {date}',
    },
    no: {
      what: 'Lovgivningspipelinevurdering per {date}: Helsepoeng {pct}%, gjennomstrømningshastighet {throughput}. Aktive forslag under behandling.',
      whatNoProposals:
        'Lovgivningspipelinevurdering per {date}: Helsepoeng {pct}%, gjennomstrømningshastighet {throughput}. Ingen nye forslag oppdaget i denne perioden.',
      whoCommission: 'Europakommisjonen (forslagsstiller)',
      whoRapporteurs: 'Saksordførere (ansvarlig for komitébehandling)',
      whoShadowRapporteurs: 'Skyggesaksordførere (politiske gruppeforhandlere)',
      whoCouncil: 'Rådet for Den europeiske union (medlovgiver)',
      whenAssessment: 'Vurderingsdato: {date}',
      whenCumulative: 'Pipelinehelse gjenspeiler kumulativ lovgivningsmessig fremgang',
      whyStrong:
        'Lovgivningspipelinen opererer med {pct}% helse og en gjennomstrømning på {throughput} prosedyrer, noe som indikerer sterk institusjonell kapasitet.',
      whyModerate:
        'Pipelinehelse på {pct}% med gjennomstrømning på {throughput} gjenspeiler moderat lovgivningsmessig behandlingskapasitet.',
      whyWeak:
        'Lovgivningspipelinens helse på {pct}% med gjennomstrømning på {throughput} signaliserer betydelige behandlingsutfordringer.',
      impactPolitical:
        'Lovgivningspipelinen på {pct}% helse former politiske gruppers forhandlingsdynamikk.',
      impactPoliticalStrong:
        'Sterk gjennomstrømning muliggjør koalisjonsbygging rundt prioriterte saker.',
      impactPoliticalWeak: 'Flaskehals kan fremtvinge kompromissforhandlinger.',
      impactEconomic:
        '{throughput} prosedyrer i pipelinen medfører potensielle økonomiske reguleringskonsekvenser.',
      impactEconomicStrong:
        'Effektiv behandling støtter forutsigbare forretningsplanleggingshorisonter.',
      impactEconomicWeak:
        'Forsinkede prosedyrer skaper regulatorisk usikkerhet for berørte sektorer.',
      impactSocial:
        'Pipelinens behandlingskapasitet påvirker direkte tempoet for sosialpolitisk lovgivning. Nåværende gjennomstrømning på {throughput} prosedyrer former tidslinjen.',
      impactLegal:
        'Lovgivningspipelinen på {pct}% helse påvirker volumet og tempoet for nye EU-rettslige instrumenter.',
      impactGeopolitical:
        'EUs lovgivningskapasitet på {pct}% helse påvirker Parlamentets troverdighet i internasjonale forhandlinger.',
      outlookGood:
        'Lovgivningspipelinen på {pct}% helse med gjennomstrømning på {throughput} posisjonerer Parlamentet for fortsatt produktiv output.',
      outlookConcern: 'Pipelinehelse på {pct}% krever oppmerksomhet fra lovgivningskoordinatorer.',
      mistakeDescription: 'Pipelinehelsen falt til {pct}%',
      mistakeAlternative:
        'Tidligere inngripen gjennom prioritert planlegging kunne ha opprettholdt pipelinens helse over 50%.',
      actionHealth: 'Pipelinehelse på {pct}%',
      actionThroughput: 'Gjennomstrømningshastighet på {throughput}',
      consequenceStrong:
        'Sterk pipelinehelse ({pct}%) indikerer effektiv lovgivningsmessig behandlingskapasitet.',
      consequenceModerate:
        'Moderat pipelinehelse ({pct}%) indikerer moderat lovgivningsmessig behandlingskapasitet.',
      consequenceWeak:
        'Svak pipelinehelse ({pct}%) indikerer begrenset lovgivningsmessig behandlingskapasitet.',
      consequenceThroughputHigh:
        'Gjennomstrømning på {throughput} prosedyrer gjenspeiler produktiv lovgivningsmessig output.',
      consequenceThroughputMedium:
        'Gjennomstrømning på {throughput} prosedyrer indikerer moderat behandlingskapasitet.',
      consequenceThroughputLow:
        'Gjennomstrømning på {throughput} prosedyrer signaliserer potensielle flaskehalser.',
      stakeholderWinnerActor: 'Parlamentets presidium',
      stakeholderWinnerReason:
        'Pipelinehelse på {pct}% demonstrerer effektiv lovgivningsmessig koordinering.',
      stakeholderLoserActor: 'Sponsorer av ventende lovgivning',
      stakeholderLoserReason:
        'Pipelinehelse på {pct}% betyr at ventende lovgivning møter forsinkelser.',
      stakeholderTopic: 'lovgivningspipeline per {date}',
    },
    fi: {
      what: 'Lainsäädäntöputken arviointi {date}: Terveyspistemäärä {pct}%, läpimenoaste {throughput}. Aktiivisia ehdotuksia käsittelyssä.',
      whatNoProposals:
        'Lainsäädäntöputken arviointi {date}: Terveyspistemäärä {pct}%, läpimenoaste {throughput}. Ei uusia ehdotuksia havaittu tällä kaudella.',
      whoCommission: 'Euroopan komissio (ehdotuksen tekijä)',
      whoRapporteurs: 'Esittelijät (vastuussa valiokuntakäsittelystä)',
      whoShadowRapporteurs: 'Varjoesittelijät (poliittisten ryhmien neuvottelijat)',
      whoCouncil: 'Euroopan unionin neuvosto (rinnakkaislainsäätäjä)',
      whenAssessment: 'Arviointipäivä: {date}',
      whenCumulative: 'Putkilinjan terveys heijastaa kumulatiivista lainsäädännöllistä edistymistä',
      whyStrong:
        'Lainsäädäntöputki toimii {pct}% terveydellä ja {throughput} menettelyjen läpimenolla, mikä osoittaa vahvaa institutionaalista kapasiteettia.',
      whyModerate:
        'Putkilinjan terveys {pct}% ja läpimeno {throughput} heijastaa kohtalaista lainsäädännöllistä käsittelykapasiteettia.',
      whyWeak:
        'Lainsäädäntöputken terveys {pct}% ja läpimeno {throughput} signaloi merkittäviä käsittelyhaasteita.',
      impactPolitical:
        'Lainsäädäntöputki {pct}% terveydellä muokkaa poliittisten ryhmien neuvotteludynamiikkaa.',
      impactPoliticalStrong:
        'Vahva läpimeno mahdollistaa koalitionrakentamisen prioriteettitiedostojen ympärille.',
      impactPoliticalWeak: 'Pullonkaulapaine voi pakottaa kompromissineuvotteluja.',
      impactEconomic:
        '{throughput} menettelyä putkessa aiheuttaa mahdollisia taloudellisia sääntelyvaikutuksia.',
      impactEconomicStrong:
        'Tehokas käsittely tukee ennakoitavia liiketoiminnan suunnitteluhorisontteja.',
      impactEconomicWeak:
        'Viivästyneet menettelyt luovat sääntelyepävarmuutta asianomaisille sektoreille.',
      impactSocial:
        'Putkilinjan käsittelykapasiteetti vaikuttaa suoraan sosiaalipolitiikan lainsäädännön tahtiin. Nykyinen läpimeno {throughput} menettelyä muokkaa aikataulua.',
      impactLegal:
        'Lainsäädäntöputki {pct}% terveydellä vaikuttaa uusien EU:n oikeudellisten välineiden määrään ja tahtiin.',
      impactGeopolitical:
        'EU:n lainsäädäntökapasiteetti {pct}% terveydellä vaikuttaa parlamentin uskottavuuteen kansainvälisissä neuvotteluissa.',
      outlookGood:
        'Lainsäädäntöputki {pct}% terveydellä ja {throughput} läpimenolla asemoi parlamentin jatkuvaan tuottavaan tuotantoon.',
      outlookConcern: 'Putkilinjan terveys {pct}% vaatii huomiota lainsäädäntökoordinaattoreilta.',
      mistakeDescription: 'Putkilinjan terveys putosi {pct}%:iin',
      mistakeAlternative:
        'Aikaisempi puuttuminen priorisoidulla aikataulutuksella olisi voinut ylläpitää putkilinjan terveyttä yli 50%.',
      actionHealth: 'Putkilinjan terveys {pct}%',
      actionThroughput: 'Läpimenoaste {throughput}',
      consequenceStrong:
        'Vahva putkilinjan terveys ({pct}%) osoittaa tehokasta lainsäädännöllistä käsittelykapasiteettia.',
      consequenceModerate:
        'Kohtalainen putkilinjan terveys ({pct}%) osoittaa kohtalaista lainsäädännöllistä käsittelykapasiteettia.',
      consequenceWeak:
        'Heikko putkilinjan terveys ({pct}%) osoittaa rajoitettua lainsäädännöllistä käsittelykapasiteettia.',
      consequenceThroughputHigh:
        '{throughput} menettelyn läpimeno heijastaa tuottavaa lainsäädännöllistä tuotantoa.',
      consequenceThroughputMedium:
        '{throughput} menettelyn läpimeno osoittaa kohtalaista käsittelykapasiteettia.',
      consequenceThroughputLow:
        '{throughput} menettelyn läpimeno signaloi mahdollisia pullonkauloja.',
      stakeholderWinnerActor: 'Parlamentin puhemiehistö',
      stakeholderWinnerReason:
        'Putkilinjan terveys {pct}% osoittaa tehokasta lainsäädännöllistä koordinointia.',
      stakeholderLoserActor: 'Odottavan lainsäädännön sponsorit',
      stakeholderLoserReason:
        'Putkilinjan terveys {pct}% tarkoittaa, että odottava lainsäädäntö kohtaa viivästyksiä.',
      stakeholderTopic: 'lainsäädäntöputkilinja {date}',
    },
    de: {
      what: 'Bewertung der Gesetzgebungspipeline am {date}: Gesundheitswert {pct}%, Durchsatzrate {throughput}. Aktive Vorschläge in Bearbeitung.',
      whatNoProposals:
        'Bewertung der Gesetzgebungspipeline am {date}: Gesundheitswert {pct}%, Durchsatzrate {throughput}. Keine neuen Vorschläge in diesem Zeitraum festgestellt.',
      whoCommission: 'Europäische Kommission (Vorschlagsgeberin)',
      whoRapporteurs: 'Berichterstatter (verantwortlich für die Ausschussbehandlung)',
      whoShadowRapporteurs: 'Schattenberichterstatter (Verhandlungsführer der Fraktionen)',
      whoCouncil: 'Rat der Europäischen Union (Mitgesetzgeber)',
      whenAssessment: 'Bewertungsdatum: {date}',
      whenCumulative:
        'Der Gesundheitszustand der Pipeline spiegelt den kumulativen Gesetzgebungsfortschritt wider',
      whyStrong:
        'Die Gesetzgebungspipeline arbeitet mit {pct}% Gesundheit und einem Durchsatz von {throughput} Verfahren, was auf eine starke institutionelle Kapazität hinweist.',
      whyModerate:
        'Die Pipeline-Gesundheit von {pct}% mit einem Durchsatz von {throughput} spiegelt eine moderate gesetzgeberische Verarbeitungskapazität wider.',
      whyWeak:
        'Die Gesundheit der Gesetzgebungspipeline von {pct}% mit einem Durchsatz von {throughput} signalisiert erhebliche Verarbeitungsherausforderungen.',
      impactPolitical:
        'Die Gesetzgebungspipeline mit {pct}% Gesundheit prägt die Verhandlungsdynamik der Fraktionen.',
      impactPoliticalStrong:
        'Starker Durchsatz ermöglicht Koalitionsbildung bei Prioritätsdossiers.',
      impactPoliticalWeak: 'Engpassdruck kann Kompromissverhandlungen erzwingen.',
      impactEconomic:
        '{throughput} Verfahren in der Pipeline bergen potenzielle wirtschaftliche Regulierungsfolgen.',
      impactEconomicStrong:
        'Effiziente Verarbeitung unterstützt vorhersehbare Geschäftsplanungshorizonte.',
      impactEconomicWeak:
        'Verzögerte Verfahren schaffen regulatorische Unsicherheit für betroffene Sektoren.',
      impactSocial:
        'Die Verarbeitungskapazität der Pipeline beeinflusst direkt das Tempo der Sozialgesetzgebung. Der aktuelle Durchsatz von {throughput} Verfahren prägt den Zeitplan.',
      impactLegal:
        'Die Gesetzgebungspipeline mit {pct}% Gesundheit beeinflusst Umfang und Tempo neuer EU-Rechtsinstrumente.',
      impactGeopolitical:
        'Die EU-Gesetzgebungskapazität mit {pct}% Gesundheit beeinflusst die Glaubwürdigkeit des Parlaments in internationalen Verhandlungen.',
      outlookGood:
        'Die Gesetzgebungspipeline mit {pct}% Gesundheit und Durchsatz von {throughput} positioniert das Parlament für eine weiterhin produktive Leistung.',
      outlookConcern:
        'Die Pipeline-Gesundheit von {pct}% erfordert Aufmerksamkeit der Gesetzgebungskoordinatoren.',
      mistakeDescription: 'Pipeline-Gesundheit fiel auf {pct}%',
      mistakeAlternative:
        'Früheres Eingreifen durch priorisierte Terminplanung hätte die Pipeline-Gesundheit über 50% halten können.',
      actionHealth: 'Pipeline-Gesundheit bei {pct}%',
      actionThroughput: 'Durchsatzrate bei {throughput}',
      consequenceStrong:
        'Starke Pipeline-Gesundheit ({pct}%) zeigt effiziente gesetzgeberische Verarbeitungskapazität.',
      consequenceModerate:
        'Moderate Pipeline-Gesundheit ({pct}%) zeigt moderate gesetzgeberische Verarbeitungskapazität.',
      consequenceWeak:
        'Schwache Pipeline-Gesundheit ({pct}%) zeigt eingeschränkte gesetzgeberische Verarbeitungskapazität.',
      consequenceThroughputHigh:
        'Durchsatz von {throughput} Verfahren spiegelt produktive gesetzgeberische Leistung wider.',
      consequenceThroughputMedium:
        'Durchsatz von {throughput} Verfahren zeigt moderate Verarbeitungskapazität.',
      consequenceThroughputLow:
        'Durchsatz von {throughput} Verfahren signalisiert potenzielle Engpässe.',
      stakeholderWinnerActor: 'Parlamentspräsidium',
      stakeholderWinnerReason:
        'Pipeline-Gesundheit von {pct}% demonstriert effektive gesetzgeberische Koordinierung.',
      stakeholderLoserActor: 'Sponsoren ausstehender Gesetzgebung',
      stakeholderLoserReason:
        'Pipeline-Gesundheit von {pct}% bedeutet Verzögerungen für ausstehende Gesetzgebung.',
      stakeholderTopic: 'Gesetzgebungspipeline zum {date}',
    },
    fr: {
      what: "Évaluation du pipeline législatif au {date}: Score de santé {pct}%, taux de débit {throughput}. Propositions actives en cours d'examen.",
      whatNoProposals:
        'Évaluation du pipeline législatif au {date}: Score de santé {pct}%, taux de débit {throughput}. Aucune nouvelle proposition détectée durant cette période.',
      whoCommission: 'Commission européenne (auteur de la proposition)',
      whoRapporteurs: 'Rapporteurs (responsables du pilotage en commission)',
      whoShadowRapporteurs: 'Rapporteurs fictifs (négociateurs des groupes politiques)',
      whoCouncil: "Conseil de l'Union européenne (co-législateur)",
      whenAssessment: "Date d'évaluation: {date}",
      whenCumulative: 'La santé du pipeline reflète les progrès législatifs cumulés',
      whyStrong:
        'Le pipeline législatif fonctionne à {pct}% de santé avec un débit de {throughput} procédures, indiquant une forte capacité institutionnelle.',
      whyModerate:
        'La santé du pipeline à {pct}% avec un débit de {throughput} reflète une capacité de traitement législatif modérée.',
      whyWeak:
        'La santé du pipeline législatif à {pct}% avec un débit de {throughput} signale des défis de traitement significatifs.',
      impactPolitical:
        'Le pipeline législatif à {pct}% de santé façonne la dynamique de négociation des groupes politiques.',
      impactPoliticalStrong:
        'Un fort débit permet la construction de coalitions sur les dossiers prioritaires.',
      impactPoliticalWeak: 'La pression des goulots peut imposer des négociations de compromis.',
      impactEconomic:
        '{throughput} procédures dans le pipeline comportent des implications réglementaires économiques potentielles.',
      impactEconomicStrong:
        "Un traitement efficace soutient des horizons de planification d'entreprise prévisibles.",
      impactEconomicWeak:
        'Les procédures retardées créent une incertitude réglementaire pour les secteurs concernés.',
      impactSocial:
        'La capacité de traitement du pipeline affecte directement le rythme de la législation sociale. Le débit actuel de {throughput} procédures façonne le calendrier.',
      impactLegal:
        "Le pipeline législatif à {pct}% de santé influence le volume et le rythme des nouveaux instruments juridiques de l'UE.",
      impactGeopolitical:
        "La capacité législative de l'UE à {pct}% de santé affecte la crédibilité du Parlement dans les négociations internationales.",
      outlookGood:
        'Le pipeline législatif à {pct}% de santé avec un débit de {throughput} positionne le Parlement pour une production continue.',
      outlookConcern:
        'La santé du pipeline à {pct}% nécessite une attention des coordinateurs législatifs.',
      mistakeDescription: 'La santé du pipeline est tombée à {pct}%',
      mistakeAlternative:
        'Une intervention plus précoce par une programmation prioritaire aurait pu maintenir la santé du pipeline au-dessus de 50%.',
      actionHealth: 'Santé du pipeline à {pct}%',
      actionThroughput: 'Taux de débit à {throughput}',
      consequenceStrong:
        'Une forte santé du pipeline ({pct}%) indique une capacité de traitement législatif efficace.',
      consequenceModerate:
        'Une santé modérée du pipeline ({pct}%) indique une capacité de traitement législatif modérée.',
      consequenceWeak:
        'Une faible santé du pipeline ({pct}%) indique une capacité de traitement législatif contrainte.',
      consequenceThroughputHigh:
        'Un débit de {throughput} procédures reflète une production législative productive.',
      consequenceThroughputMedium:
        'Un débit de {throughput} procédures indique une capacité de traitement modérée.',
      consequenceThroughputLow:
        "Un débit de {throughput} procédures signale des goulots d'étranglement potentiels.",
      stakeholderWinnerActor: 'Présidence du Parlement',
      stakeholderWinnerReason:
        'La santé du pipeline à {pct}% démontre une coordination législative efficace.',
      stakeholderLoserActor: 'Promoteurs de la législation en attente',
      stakeholderLoserReason:
        'La santé du pipeline à {pct}% signifie des retards pour la législation en attente.',
      stakeholderTopic: 'pipeline législatif au {date}',
    },
    es: {
      what: 'Evaluación del pipeline legislativo a {date}: Puntuación de salud {pct}%, tasa de rendimiento {throughput}. Propuestas activas en consideración.',
      whatNoProposals:
        'Evaluación del pipeline legislativo a {date}: Puntuación de salud {pct}%, tasa de rendimiento {throughput}. No se detectaron nuevas propuestas en este período.',
      whoCommission: 'Comisión Europea (originadora de la propuesta)',
      whoRapporteurs: 'Ponentes (responsables de la tramitación en comisión)',
      whoShadowRapporteurs: 'Ponentes alternativos (negociadores de los grupos políticos)',
      whoCouncil: 'Consejo de la Unión Europea (colegislador)',
      whenAssessment: 'Fecha de evaluación: {date}',
      whenCumulative: 'La salud del pipeline refleja el progreso legislativo acumulado',
      whyStrong:
        'El pipeline legislativo opera con {pct}% de salud y un rendimiento de {throughput} procedimientos, indicando una fuerte capacidad institucional.',
      whyModerate:
        'La salud del pipeline al {pct}% con rendimiento de {throughput} refleja una capacidad de procesamiento legislativo moderada.',
      whyWeak:
        'La salud del pipeline legislativo al {pct}% con rendimiento de {throughput} señala desafíos significativos de procesamiento.',
      impactPolitical:
        'El pipeline legislativo al {pct}% de salud configura la dinámica de negociación de los grupos políticos.',
      impactPoliticalStrong:
        'Un fuerte rendimiento permite la construcción de coaliciones en expedientes prioritarios.',
      impactPoliticalWeak:
        'La presión de los cuellos de botella puede forzar negociaciones de compromiso.',
      impactEconomic:
        '{throughput} procedimientos en el pipeline conllevan implicaciones regulatorias económicas potenciales.',
      impactEconomicStrong:
        'Un procesamiento eficiente apoya horizontes de planificación empresarial predecibles.',
      impactEconomicWeak:
        'Los procedimientos retrasados crean incertidumbre regulatoria para los sectores afectados.',
      impactSocial:
        'La capacidad de procesamiento del pipeline afecta directamente el ritmo de la legislación social. El rendimiento actual de {throughput} procedimientos configura el cronograma.',
      impactLegal:
        'El pipeline legislativo al {pct}% de salud influye en el volumen y ritmo de los nuevos instrumentos jurídicos de la UE.',
      impactGeopolitical:
        'La capacidad legislativa de la UE al {pct}% de salud afecta la credibilidad del Parlamento en negociaciones internacionales.',
      outlookGood:
        'El pipeline legislativo al {pct}% de salud con rendimiento de {throughput} posiciona al Parlamento para una producción continua.',
      outlookConcern:
        'La salud del pipeline al {pct}% requiere atención de los coordinadores legislativos.',
      mistakeDescription: 'La salud del pipeline cayó al {pct}%',
      mistakeAlternative:
        'Una intervención más temprana mediante programación priorizada podría haber mantenido la salud del pipeline por encima del 50%.',
      actionHealth: 'Salud del pipeline al {pct}%',
      actionThroughput: 'Tasa de rendimiento en {throughput}',
      consequenceStrong:
        'Una fuerte salud del pipeline ({pct}%) indica una capacidad de procesamiento legislativo eficiente.',
      consequenceModerate:
        'Una salud moderada del pipeline ({pct}%) indica una capacidad de procesamiento legislativo moderada.',
      consequenceWeak:
        'Una salud débil del pipeline ({pct}%) indica una capacidad de procesamiento legislativo restringida.',
      consequenceThroughputHigh:
        'Un rendimiento de {throughput} procedimientos refleja una producción legislativa productiva.',
      consequenceThroughputMedium:
        'Un rendimiento de {throughput} procedimientos indica una capacidad de procesamiento moderada.',
      consequenceThroughputLow:
        'Un rendimiento de {throughput} procedimientos señala posibles cuellos de botella.',
      stakeholderWinnerActor: 'Presidencia del Parlamento',
      stakeholderWinnerReason:
        'La salud del pipeline al {pct}% demuestra una coordinación legislativa efectiva.',
      stakeholderLoserActor: 'Promotores de legislación pendiente',
      stakeholderLoserReason:
        'La salud del pipeline al {pct}% significa retrasos para la legislación pendiente.',
      stakeholderTopic: 'pipeline legislativo al {date}',
    },
    nl: {
      what: 'Wetgevingspijplijnbeoordeling per {date}: Gezondheidsscore {pct}%, doorvoersnelheid {throughput}. Actieve voorstellen in behandeling.',
      whatNoProposals:
        'Wetgevingspijplijnbeoordeling per {date}: Gezondheidsscore {pct}%, doorvoersnelheid {throughput}. Geen nieuwe voorstellen gedetecteerd in deze periode.',
      whoCommission: 'Europese Commissie (initiator van het voorstel)',
      whoRapporteurs: 'Rapporteurs (verantwoordelijk voor de commissiebehandeling)',
      whoShadowRapporteurs: 'Schaduwrapporteurs (onderhandelaars van de politieke fracties)',
      whoCouncil: 'Raad van de Europese Unie (medewetgever)',
      whenAssessment: 'Beoordelingsdatum: {date}',
      whenCumulative:
        'De gezondheid van de pijplijn weerspiegelt de cumulatieve wetgevingsvoortgang',
      whyStrong:
        'De wetgevingspijplijn functioneert met {pct}% gezondheid en een doorvoer van {throughput} procedures, wat wijst op sterke institutionele capaciteit.',
      whyModerate:
        'De pijplijngezondheid van {pct}% met een doorvoer van {throughput} weerspiegelt een matige wetgevende verwerkingscapaciteit.',
      whyWeak:
        'De gezondheid van de wetgevingspijplijn van {pct}% met een doorvoer van {throughput} signaleert aanzienlijke verwerkingsuitdagingen.',
      impactPolitical:
        'De wetgevingspijplijn met {pct}% gezondheid vormt de onderhandelingsdynamiek van de politieke fracties.',
      impactPoliticalStrong:
        'Sterke doorvoer maakt coalitievorming rond prioritaire dossiers mogelijk.',
      impactPoliticalWeak: 'Knelpuntdruk kan compromisonderhandelingen afdwingen.',
      impactEconomic:
        '{throughput} procedures in de pijplijn hebben potentiële economische regelgevingsgevolgen.',
      impactEconomicStrong:
        'Efficiënte verwerking ondersteunt voorspelbare bedrijfsplanningshorizonten.',
      impactEconomicWeak:
        'Vertraagde procedures creëren regelgevingsonzekerheid voor getroffen sectoren.',
      impactSocial:
        'De verwerkingscapaciteit van de pijplijn beïnvloedt rechtstreeks het tempo van het sociaal beleid. De huidige doorvoer van {throughput} procedures bepaalt het tijdschema.',
      impactLegal:
        'De wetgevingspijplijn met {pct}% gezondheid beïnvloedt het volume en tempo van nieuwe EU-rechtsinstrumenten.',
      impactGeopolitical:
        'De EU-wetgevingscapaciteit met {pct}% gezondheid beïnvloedt de geloofwaardigheid van het Parlement in internationale onderhandelingen.',
      outlookGood:
        'De wetgevingspijplijn met {pct}% gezondheid en doorvoer van {throughput} positioneert het Parlement voor aanhoudende productieve output.',
      outlookConcern:
        'De pijplijngezondheid van {pct}% vereist aandacht van wetgevingscoördinatoren.',
      mistakeDescription: 'Pijplijngezondheid daalde naar {pct}%',
      mistakeAlternative:
        'Eerdere interventie door geprioriteerde planning had de pijplijngezondheid boven 50% kunnen houden.',
      actionHealth: 'Pijplijngezondheid op {pct}%',
      actionThroughput: 'Doorvoersnelheid op {throughput}',
      consequenceStrong:
        'Sterke pijplijngezondheid ({pct}%) duidt op efficiënte wetgevende verwerkingscapaciteit.',
      consequenceModerate:
        'Matige pijplijngezondheid ({pct}%) duidt op matige wetgevende verwerkingscapaciteit.',
      consequenceWeak:
        'Zwakke pijplijngezondheid ({pct}%) duidt op beperkte wetgevende verwerkingscapaciteit.',
      consequenceThroughputHigh:
        'Doorvoer van {throughput} procedures weerspiegelt productieve wetgevende output.',
      consequenceThroughputMedium:
        'Doorvoer van {throughput} procedures duidt op matige verwerkingscapaciteit.',
      consequenceThroughputLow:
        'Doorvoer van {throughput} procedures signaleert potentiële knelpunten.',
      stakeholderWinnerActor: 'Parlementspresidium',
      stakeholderWinnerReason:
        'Pijplijngezondheid van {pct}% demonstreert effectieve wetgevende coördinatie.',
      stakeholderLoserActor: 'Sponsoren van hangende wetgeving',
      stakeholderLoserReason:
        'Pijplijngezondheid van {pct}% betekent vertragingen voor hangende wetgeving.',
      stakeholderTopic: 'wetgevingspijplijn per {date}',
    },
    ar: {
      what: 'تقييم خط أنابيب التشريع في {date}: درجة الصحة {pct}%، معدل الإنتاجية {throughput}. مقترحات نشطة قيد الدراسة.',
      whatNoProposals:
        'تقييم خط أنابيب التشريع في {date}: درجة الصحة {pct}%، معدل الإنتاجية {throughput}. لم يتم الكشف عن مقترحات جديدة في هذه الفترة.',
      whoCommission: 'المفوضية الأوروبية (مقدمة المقترح)',
      whoRapporteurs: 'المقررون (المسؤولون عن التوجيه عبر اللجنة)',
      whoShadowRapporteurs: 'مقررون ظل (مفاوضو المجموعات السياسية)',
      whoCouncil: 'مجلس الاتحاد الأوروبي (المشرع المشارك)',
      whenAssessment: 'تاريخ التقييم: {date}',
      whenCumulative: 'تعكس صحة خط الأنابيب التقدم التشريعي التراكمي',
      whyStrong:
        'يعمل خط أنابيب التشريع بصحة {pct}% وإنتاجية {throughput} إجراء، مما يشير إلى قدرة مؤسسية قوية.',
      whyModerate:
        'صحة خط الأنابيب عند {pct}% مع إنتاجية {throughput} تعكس قدرة معالجة تشريعية معتدلة.',
      whyWeak:
        'صحة خط أنابيب التشريع عند {pct}% مع إنتاجية {throughput} تشير إلى تحديات معالجة كبيرة.',
      impactPolitical:
        'خط أنابيب التشريع بصحة {pct}% يشكل ديناميكيات التفاوض بين المجموعات السياسية.',
      impactPoliticalStrong: 'الإنتاجية القوية تمكن من بناء التحالفات حول الملفات ذات الأولوية.',
      impactPoliticalWeak: 'ضغط الاختناقات قد يفرض مفاوضات تسوية.',
      impactEconomic: '{throughput} إجراء في خط الأنابيب يحمل آثاراً تنظيمية اقتصادية محتملة.',
      impactEconomicStrong: 'المعالجة الفعالة تدعم آفاق تخطيط الأعمال القابلة للتنبؤ.',
      impactEconomicWeak: 'الإجراءات المتأخرة تخلق حالة من عدم اليقين التنظيمي للقطاعات المتأثرة.',
      impactSocial:
        'تؤثر قدرة معالجة خط الأنابيب مباشرة على وتيرة التشريعات الاجتماعية. الإنتاجية الحالية البالغة {throughput} إجراء تشكل الجدول الزمني.',
      impactLegal:
        'خط أنابيب التشريع بصحة {pct}% يؤثر على حجم ووتيرة الصكوك القانونية الجديدة للاتحاد الأوروبي.',
      impactGeopolitical:
        'القدرة التشريعية للاتحاد الأوروبي بصحة {pct}% تؤثر على مصداقية البرلمان في المفاوضات الدولية.',
      outlookGood:
        'خط أنابيب التشريع بصحة {pct}% وإنتاجية {throughput} يضع البرلمان في موقع لاستمرار الإنتاج.',
      outlookConcern: 'صحة خط الأنابيب عند {pct}% تتطلب اهتمام منسقي التشريع.',
      mistakeDescription: 'انخفضت صحة خط الأنابيب إلى {pct}%',
      mistakeAlternative:
        'التدخل المبكر من خلال الجدولة ذات الأولوية كان يمكن أن يحافظ على صحة خط الأنابيب فوق 50%.',
      actionHealth: 'صحة خط الأنابيب عند {pct}%',
      actionThroughput: 'معدل الإنتاجية عند {throughput}',
      consequenceStrong: 'صحة قوية لخط الأنابيب ({pct}%) تشير إلى قدرة معالجة تشريعية فعالة.',
      consequenceModerate: 'صحة معتدلة لخط الأنابيب ({pct}%) تشير إلى قدرة معالجة تشريعية معتدلة.',
      consequenceWeak: 'صحة ضعيفة لخط الأنابيب ({pct}%) تشير إلى قدرة معالجة تشريعية مقيدة.',
      consequenceThroughputHigh: 'إنتاجية {throughput} إجراء تعكس إنتاجاً تشريعياً منتجاً.',
      consequenceThroughputMedium: 'إنتاجية {throughput} إجراء تشير إلى قدرة معالجة معتدلة.',
      consequenceThroughputLow: 'إنتاجية {throughput} إجراء تشير إلى اختناقات محتملة.',
      stakeholderWinnerActor: 'رئاسة البرلمان',
      stakeholderWinnerReason: 'صحة خط الأنابيب عند {pct}% تُظهر تنسيقاً تشريعياً فعالاً.',
      stakeholderLoserActor: 'رعاة التشريعات المعلقة',
      stakeholderLoserReason: 'صحة خط الأنابيب عند {pct}% تعني تأخيرات للتشريعات المعلقة.',
      stakeholderTopic: 'خط الأنابيب التشريعي في {date}',
    },
    he: {
      what: 'הערכת צינור חקיקה נכון ל-{date}: ציון בריאות {pct}%, קצב תפוקה {throughput}. הצעות פעילות בבחינה.',
      whatNoProposals:
        'הערכת צינור חקיקה נכון ל-{date}: ציון בריאות {pct}%, קצב תפוקה {throughput}. לא זוהו הצעות חדשות בתקופה זו.',
      whoCommission: 'הנציבות האירופית (יוזמת ההצעה)',
      whoRapporteurs: 'מדווחים (אחראים על הניווט בוועדה)',
      whoShadowRapporteurs: 'מדווחי צל (מנהלי משא ומתן של הקבוצות הפוליטיות)',
      whoCouncil: 'מועצת האיחוד האירופי (מחוקק-שותף)',
      whenAssessment: 'תאריך הערכה: {date}',
      whenCumulative: 'בריאות הצינור משקפת התקדמות חקיקתית מצטברת',
      whyStrong:
        'צינור החקיקה פועל בבריאות {pct}% עם תפוקה של {throughput} הליכים, המצביע על יכולת מוסדית חזקה.',
      whyModerate:
        'בריאות הצינור ב-{pct}% עם תפוקה של {throughput} משקפת יכולת עיבוד חקיקתית מתונה.',
      whyWeak: 'בריאות צינור החקיקה ב-{pct}% עם תפוקה של {throughput} מסמנת אתגרי עיבוד משמעותיים.',
      impactPolitical:
        'צינור החקיקה בבריאות {pct}% מעצב את דינמיקת המשא ומתן של הקבוצות הפוליטיות.',
      impactPoliticalStrong: 'תפוקה חזקה מאפשרת בניית קואליציות סביב תיקים מועדפים.',
      impactPoliticalWeak: 'לחץ צוואר בקבוק עלול לכפות משא ומתן על פשרות.',
      impactEconomic: '{throughput} הליכים בצינור נושאים השלכות רגולטוריות כלכליות פוטנציאליות.',
      impactEconomicStrong: 'עיבוד יעיל תומך באופקי תכנון עסקי צפויים.',
      impactEconomicWeak: 'הליכים מעוכבים יוצרים אי-ודאות רגולטורית למגזרים המושפעים.',
      impactSocial:
        'יכולת העיבוד של הצינור משפיעה ישירות על קצב החקיקה החברתית. התפוקה הנוכחית של {throughput} הליכים מעצבת את לוח הזמנים.',
      impactLegal:
        'צינור החקיקה בבריאות {pct}% משפיע על היקף וקצב המכשירים המשפטיים החדשים של האיחוד.',
      impactGeopolitical:
        'יכולת החקיקה של האיחוד בבריאות {pct}% משפיעה על אמינות הפרלמנט במשא ומתן בינלאומי.',
      outlookGood:
        'צינור החקיקה בבריאות {pct}% עם תפוקה של {throughput} ממקם את הפרלמנט להמשך תפוקה פרודוקטיבית.',
      outlookConcern: 'בריאות הצינור ב-{pct}% דורשת תשומת לב מרכזי חקיקה.',
      mistakeDescription: 'בריאות הצינור ירדה ל-{pct}%',
      mistakeAlternative:
        'התערבות מוקדמת יותר באמצעות תזמון מועדף הייתה יכולה לשמר את בריאות הצינור מעל 50%.',
      actionHealth: 'בריאות הצינור ב-{pct}%',
      actionThroughput: 'קצב תפוקה ב-{throughput}',
      consequenceStrong: 'בריאות חזקה של הצינור ({pct}%) מצביעה על יכולת עיבוד חקיקתית יעילה.',
      consequenceModerate: 'בריאות מתונה של הצינור ({pct}%) מצביעה על יכולת עיבוד חקיקתית מתונה.',
      consequenceWeak: 'בריאות חלשה של הצינור ({pct}%) מצביעה על יכולת עיבוד חקיקתית מוגבלת.',
      consequenceThroughputHigh: 'תפוקה של {throughput} הליכים משקפת תפוקה חקיקתית פרודוקטיבית.',
      consequenceThroughputMedium: 'תפוקה של {throughput} הליכים מצביעה על יכולת עיבוד מתונה.',
      consequenceThroughputLow: 'תפוקה של {throughput} הליכים מסמנת צווארי בקבוק פוטנציאליים.',
      stakeholderWinnerActor: 'נשיאות הפרלמנט',
      stakeholderWinnerReason: 'בריאות הצינור ב-{pct}% מדגימה תיאום חקיקתי אפקטיבי.',
      stakeholderLoserActor: 'נותני חסות לחקיקה תלויה ועומדת',
      stakeholderLoserReason: 'בריאות הצינור ב-{pct}% משמעה עיכובים עבור חקיקה תלויה ועומדת.',
      stakeholderTopic: 'צינור חקיקה נכון ל-{date}',
    },
    ja: {
      what: '{date}時点の立法パイプライン評価：健全性スコア{pct}%、スループット率{throughput}。審議中の法案あり。',
      whatNoProposals:
        '{date}時点の立法パイプライン評価：健全性スコア{pct}%、スループット率{throughput}。この期間に新規提案は検出されませんでした。',
      whoCommission: '欧州委員会（提案者）',
      whoRapporteurs: '報告者（委員会での審議を担当）',
      whoShadowRapporteurs: '影の報告者（政治グループの交渉者）',
      whoCouncil: 'EU理事会（共同立法者）',
      whenAssessment: '評価日：{date}',
      whenCumulative: 'パイプラインの健全性は累積的な立法進捗を反映',
      whyStrong:
        '立法パイプラインは健全性{pct}%、スループット{throughput}手続きで運用されており、強力な制度的処理能力を示しています。',
      whyModerate:
        'パイプライン健全性{pct}%、スループット{throughput}は中程度の立法処理能力を反映しています。',
      whyWeak:
        '立法パイプライン健全性{pct}%、スループット{throughput}は重大な処理課題を示しています。',
      impactPolitical: '健全性{pct}%の立法パイプラインは政治グループの交渉力学を形成しています。',
      impactPoliticalStrong: '強力なスループットは優先法案に関する連立形成を可能にします。',
      impactPoliticalWeak: 'ボトルネック圧力は妥協交渉を強いる可能性があります。',
      impactEconomic: 'パイプライン内の{throughput}手続きは潜在的な経済規制への影響を伴います。',
      impactEconomicStrong: '効率的な処理は予測可能なビジネス計画水平を支援します。',
      impactEconomicWeak: '遅延した手続きは影響を受けるセクターに規制上の不確実性を生み出します。',
      impactSocial:
        'パイプラインの処理能力は社会政策立法の進行速度に直接影響します。現在の{throughput}手続きのスループットがスケジュールを形成しています。',
      impactLegal:
        '健全性{pct}%の立法パイプラインは、EU官報に掲載される新しいEU法的文書の量とペースに影響を与えます。',
      impactGeopolitical:
        '健全性{pct}%のEU立法能力は、国際交渉における議会の信頼性に影響を与えます。',
      outlookGood:
        '健全性{pct}%、スループット{throughput}の立法パイプラインは、議会を継続的に生産的な状態に位置づけています。',
      outlookConcern: 'パイプライン健全性{pct}%は立法コーディネーターの注意を必要としています。',
      mistakeDescription: 'パイプラインの健全性が{pct}%に低下',
      mistakeAlternative:
        '優先的なスケジューリングによる早期介入により、パイプラインの健全性を50%以上に維持できた可能性があります。',
      actionHealth: 'パイプライン健全性{pct}%',
      actionThroughput: 'スループット率{throughput}',
      consequenceStrong: '強力なパイプライン健全性（{pct}%）は効率的な立法処理能力を示しています。',
      consequenceModerate:
        '中程度のパイプライン健全性（{pct}%）は中程度の立法処理能力を示しています。',
      consequenceWeak: '弱いパイプライン健全性（{pct}%）は制約された立法処理能力を示しています。',
      consequenceThroughputHigh:
        '{throughput}手続きのスループットは生産的な立法成果を反映しています。',
      consequenceThroughputMedium:
        '{throughput}手続きのスループットは中程度の処理能力を示しています。',
      consequenceThroughputLow:
        '{throughput}手続きのスループットは潜在的なボトルネックを示唆しています。',
      stakeholderWinnerActor: '議会議長団',
      stakeholderWinnerReason: 'パイプライン健全性{pct}%は効果的な立法調整を実証しています。',
      stakeholderLoserActor: '保留中の法案スポンサー',
      stakeholderLoserReason: 'パイプライン健全性{pct}%は保留中の法案に遅延をもたらします。',
      stakeholderTopic: '{date}時点の立法パイプライン',
    },
    ko: {
      what: '{date} 기준 입법 파이프라인 평가: 건강 점수 {pct}%, 처리율 {throughput}. 심의 중인 활성 제안.',
      whatNoProposals:
        '{date} 기준 입법 파이프라인 평가: 건강 점수 {pct}%, 처리율 {throughput}. 이 기간 동안 새로운 제안이 감지되지 않았습니다.',
      whoCommission: '유럽 위원회 (제안 기관)',
      whoRapporteurs: '보고관 (위원회 심의 담당)',
      whoShadowRapporteurs: '그림자 보고관 (정치 그룹 교섭가)',
      whoCouncil: 'EU 이사회 (공동 입법자)',
      whenAssessment: '평가일: {date}',
      whenCumulative: '파이프라인 건강은 누적 입법 진행 상황을 반영',
      whyStrong:
        '입법 파이프라인이 건강 {pct}%, 처리량 {throughput} 절차로 운영되어 강력한 제도적 역량을 나타냅니다.',
      whyModerate:
        '파이프라인 건강 {pct}%, 처리량 {throughput}은 보통의 입법 처리 역량을 반영합니다.',
      whyWeak: '입법 파이프라인 건강 {pct}%, 처리량 {throughput}은 상당한 처리 과제를 나타냅니다.',
      impactPolitical: '건강 {pct}%의 입법 파이프라인은 정치 그룹의 협상 역학을 형성합니다.',
      impactPoliticalStrong: '강력한 처리율은 우선 법안에 대한 연합 구축을 가능하게 합니다.',
      impactPoliticalWeak: '병목 압력은 타협 협상을 강요할 수 있습니다.',
      impactEconomic: '파이프라인 내 {throughput} 절차는 잠재적인 경제 규제 영향을 수반합니다.',
      impactEconomicStrong: '효율적인 처리는 예측 가능한 사업 계획 수평을 지원합니다.',
      impactEconomicWeak: '지연된 절차는 영향 받는 부문에 규제 불확실성을 야기합니다.',
      impactSocial:
        '파이프라인의 처리 역량은 사회 정책 입법의 속도에 직접 영향을 미칩니다. 현재 {throughput} 절차의 처리율이 일정을 형성합니다.',
      impactLegal:
        '건강 {pct}%의 입법 파이프라인은 EU 관보에 게재되는 새로운 EU 법적 문서의 양과 속도에 영향을 미칩니다.',
      impactGeopolitical:
        '건강 {pct}%의 EU 입법 역량은 국제 협상에서 의회의 신뢰도에 영향을 미칩니다.',
      outlookGood:
        '건강 {pct}%, 처리량 {throughput}의 입법 파이프라인은 의회를 지속적으로 생산적인 위치에 놓습니다.',
      outlookConcern: '파이프라인 건강 {pct}%는 입법 조정관의 주의가 필요합니다.',
      mistakeDescription: '파이프라인 건강이 {pct}%로 하락',
      mistakeAlternative:
        '우선 일정 조정을 통한 조기 개입으로 파이프라인 건강을 50% 이상으로 유지할 수 있었습니다.',
      actionHealth: '파이프라인 건강 {pct}%',
      actionThroughput: '처리율 {throughput}',
      consequenceStrong: '강력한 파이프라인 건강({pct}%)은 효율적인 입법 처리 역량을 나타냅니다.',
      consequenceModerate: '보통의 파이프라인 건강({pct}%)은 보통의 입법 처리 역량을 나타냅니다.',
      consequenceWeak: '약한 파이프라인 건강({pct}%)은 제한된 입법 처리 역량을 나타냅니다.',
      consequenceThroughputHigh: '{throughput} 절차의 처리율은 생산적인 입법 성과를 반영합니다.',
      consequenceThroughputMedium: '{throughput} 절차의 처리율은 보통의 처리 역량을 나타냅니다.',
      consequenceThroughputLow: '{throughput} 절차의 처리율은 잠재적 병목을 시사합니다.',
      stakeholderWinnerActor: '의회 의장단',
      stakeholderWinnerReason: '파이프라인 건강 {pct}%는 효과적인 입법 조정을 보여줍니다.',
      stakeholderLoserActor: '보류 중인 법안 후원자',
      stakeholderLoserReason: '파이프라인 건강 {pct}%는 보류 중인 법안에 지연을 의미합니다.',
      stakeholderTopic: '{date} 기준 입법 파이프라인',
    },
    zh: {
      what: '{date}立法管道评估：健康分数{pct}%，吞吐率{throughput}。正在审议的活跃提案。',
      whatNoProposals:
        '{date}立法管道评估：健康分数{pct}%，吞吐率{throughput}。本期间未检测到新提案。',
      whoCommission: '欧盟委员会（提案发起方）',
      whoRapporteurs: '报告人（负责委员会审议）',
      whoShadowRapporteurs: '影子报告人（政治团体谈判代表）',
      whoCouncil: '欧盟理事会（共同立法者）',
      whenAssessment: '评估日期：{date}',
      whenCumulative: '管道健康反映累积立法进展',
      whyStrong: '立法管道以{pct}%健康度和{throughput}程序的吞吐量运行，表明强大的机构处理能力。',
      whyModerate: '管道健康{pct}%、吞吐量{throughput}反映中等的立法处理能力。',
      whyWeak: '立法管道健康{pct}%、吞吐量{throughput}表明重大处理挑战。',
      impactPolitical: '健康度{pct}%的立法管道塑造了政治团体的谈判动态。',
      impactPoliticalStrong: '强劲的吞吐量使优先法案的联盟建设成为可能。',
      impactPoliticalWeak: '瓶颈压力可能迫使妥协谈判。',
      impactEconomic: '管道中的{throughput}程序带来潜在的经济监管影响。',
      impactEconomicStrong: '高效处理支持可预测的商业规划。',
      impactEconomicWeak: '延迟的程序为受影响部门造成监管不确定性。',
      impactSocial:
        '管道的处理能力直接影响社会政策立法的速度。当前{throughput}程序的吞吐量塑造了时间表。',
      impactLegal: '健康度{pct}%的立法管道影响新欧盟法律文书进入官方公报的数量和速度。',
      impactGeopolitical: '健康度{pct}%的欧盟立法能力影响议会在国际谈判中的可信度。',
      outlookGood: '健康度{pct}%、吞吐量{throughput}的立法管道使议会处于持续高产的位置。',
      outlookConcern: '管道健康{pct}%需要立法协调员的关注。',
      mistakeDescription: '管道健康下降至{pct}%',
      mistakeAlternative: '通过优先调度的早期干预本可将管道健康维持在50%以上。',
      actionHealth: '管道健康{pct}%',
      actionThroughput: '吞吐率{throughput}',
      consequenceStrong: '强劲的管道健康（{pct}%）表明高效的立法处理能力。',
      consequenceModerate: '中等的管道健康（{pct}%）表明中等的立法处理能力。',
      consequenceWeak: '薄弱的管道健康（{pct}%）表明受限的立法处理能力。',
      consequenceThroughputHigh: '{throughput}程序的吞吐量反映了富有成效的立法产出。',
      consequenceThroughputMedium: '{throughput}程序的吞吐量表明中等的处理能力。',
      consequenceThroughputLow: '{throughput}程序的吞吐量暗示潜在的瓶颈。',
      stakeholderWinnerActor: '议会主席团',
      stakeholderWinnerReason: '管道健康{pct}%展示了有效的立法协调。',
      stakeholderLoserActor: '待审立法的支持者',
      stakeholderLoserReason: '管道健康{pct}%意味着待审立法面临延迟。',
      stakeholderTopic: '{date}立法管道',
    },
  };

// ─── Stakeholder reasoning localized templates ────────────────────────────────

export const STAKEHOLDER_REASONING_STRINGS: LanguageMap<StakeholderReasoningStrings> = {
  en: {
    politicalGroups:
      'This parliamentary activity on "{topic}" has {impact} implications for political group dynamics, affecting coalition-building strategies and inter-group negotiation positions.',
    civilSociety:
      'Civil society organisations monitoring "{topic}" face {impact} impact on transparency, democratic participation, and citizens\' rights advocacy.',
    industry:
      'Industry and business stakeholders observe {impact} regulatory implications from "{topic}", affecting compliance requirements and market conditions.',
    nationalGovts:
      'National governments assess {impact} impact from "{topic}" on subsidiarity, implementation requirements, and member state policy alignment.',
    citizens:
      'EU citizens experience {impact} consequences from "{topic}" in terms of rights, services, and democratic representation.',
    euInstitutions:
      'EU institutional dynamics show {impact} effects from "{topic}", influencing inter-institutional relations between Parliament, Commission, and Council.',
    impactSignificant: 'significant',
    impactModerate: 'moderate',
    impactLimited: 'limited',
    genericFallback:
      'This parliamentary activity on "{topic}" has {impact} implications for stakeholders involved in EU legislative processes.',
  },
  sv: {
    politicalGroups:
      'Denna parlamentariska aktivitet om "{topic}" har {impact} konsekvenser för politiska gruppers dynamik, vilket påverkar koalitionsbyggande och förhandlingspositioner.',
    civilSociety:
      'Civilsamhällesorganisationer som övervakar "{topic}" påverkas {impact} gällande transparens, demokratiskt deltagande och medborgarrättsarbete.',
    industry:
      'Bransch- och företagsintressenter observerar {impact} regulatoriska konsekvenser av "{topic}", vilket påverkar efterlevnadskrav och marknadsförhållanden.',
    nationalGovts:
      'Nationella regeringar bedömer {impact} påverkan från "{topic}" på subsidiaritet, genomförandekrav och medlemsstaternas policysamstämmighet.',
    citizens:
      'EU-medborgare upplever {impact} konsekvenser av "{topic}" gällande rättigheter, tjänster och demokratisk representation.',
    euInstitutions:
      'EU:s institutionella dynamik visar {impact} effekter av "{topic}", vilket påverkar interinstitutionella relationer mellan parlament, kommission och råd.',
    impactSignificant: 'betydande',
    impactModerate: 'måttliga',
    impactLimited: 'begränsade',
    genericFallback:
      'Denna parlamentariska aktivitet om "{topic}" har {impact} konsekvenser för intressenter involverade i EU:s lagstiftningsprocesser.',
  },
  da: {
    politicalGroups:
      'Denne parlamentariske aktivitet om "{topic}" har {impact} konsekvenser for politiske gruppers dynamik.',
    civilSociety:
      'Civilsamfundsorganisationer, der overvåger "{topic}", står over for {impact} indvirkning på gennemsigtighed og demokratisk deltagelse.',
    industry:
      'Erhvervs- og industriinteressenter observerer {impact} reguleringsmæssige konsekvenser af "{topic}".',
    nationalGovts:
      'Nationale regeringer vurderer {impact} indvirkning fra "{topic}" på subsidiaritet og gennemførelseskrav.',
    citizens:
      'EU-borgere oplever {impact} konsekvenser af "{topic}" med hensyn til rettigheder og demokratisk repræsentation.',
    euInstitutions: 'EU\'s institutionelle dynamik viser {impact} virkninger af "{topic}".',
    impactSignificant: 'betydelige',
    impactModerate: 'moderate',
    impactLimited: 'begrænsede',
    genericFallback:
      'Denne parlamentariske aktivitet om "{topic}" har {impact} konsekvenser for interessenter involveret i EU\'s lovgivningsprocesser.',
  },
  no: {
    politicalGroups:
      'Denne parlamentariske aktiviteten om "{topic}" har {impact} konsekvenser for politiske gruppers dynamikk.',
    civilSociety:
      'Sivilsamfunnsorganisasjoner som overvåker "{topic}" møter {impact} påvirkning på åpenhet og demokratisk deltakelse.',
    industry:
      'Bransje- og næringslivsinteressenter observerer {impact} regulatoriske konsekvenser av "{topic}".',
    nationalGovts:
      'Nasjonale regjeringer vurderer {impact} påvirkning fra "{topic}" på subsidiaritet og gjennomføringskrav.',
    citizens:
      'EU-borgere opplever {impact} konsekvenser av "{topic}" med hensyn til rettigheter og demokratisk representasjon.',
    euInstitutions: 'EUs institusjonelle dynamikk viser {impact} effekter av "{topic}".',
    impactSignificant: 'betydelige',
    impactModerate: 'moderate',
    impactLimited: 'begrensede',
    genericFallback:
      'Denne parlamentariske aktiviteten om "{topic}" har {impact} konsekvenser for interessenter involvert i EUs lovgivningsprosesser.',
  },
  fi: {
    politicalGroups:
      'Tämä parlamentaarinen toiminta aiheesta "{topic}" vaikuttaa {impact} poliittisten ryhmien dynamiikkaan.',
    civilSociety:
      'Kansalaisyhteiskunnan organisaatiot, jotka seuraavat "{topic}", kohtaavat {impact} vaikutuksia avoimuuteen ja demokraattiseen osallistumiseen.',
    industry:
      'Teollisuus- ja yrityssidosryhmät havaitsevat {impact} sääntelyn vaikutuksia aiheesta "{topic}".',
    nationalGovts:
      'Kansalliset hallitukset arvioivat {impact} vaikutuksia aiheesta "{topic}" toissijaisuuteen ja täytäntöönpanovaatimuksiin.',
    citizens:
      'EU-kansalaiset kokevat {impact} seurauksia aiheesta "{topic}" oikeuksien ja demokraattisen edustuksen osalta.',
    euInstitutions: 'EU:n toimielindynamiikka osoittaa {impact} vaikutuksia aiheesta "{topic}".',
    impactSignificant: 'merkittäviä',
    impactModerate: 'kohtalaisia',
    impactLimited: 'rajallisia',
    genericFallback:
      'Tämä parlamentaarinen toiminta aiheesta "{topic}" vaikuttaa {impact} EU:n lainsäädäntöprosesseihin osallistuviin sidosryhmiin.',
  },
  de: {
    politicalGroups:
      'Diese parlamentarische Aktivität zu "{topic}" hat {impact} Auswirkungen auf die Dynamik der Fraktionen.',
    civilSociety:
      'Zivilgesellschaftliche Organisationen, die "{topic}" beobachten, sehen sich {impact} Auswirkungen auf Transparenz und demokratische Teilhabe gegenüber.',
    industry:
      'Wirtschafts- und Industrieakteure beobachten {impact} regulatorische Auswirkungen von "{topic}".',
    nationalGovts:
      'Nationale Regierungen bewerten {impact} Auswirkungen von "{topic}" auf Subsidiarität und Umsetzungsanforderungen.',
    citizens:
      'EU-Bürger erfahren {impact} Auswirkungen von "{topic}" auf Rechte und demokratische Vertretung.',
    euInstitutions: 'Die institutionelle Dynamik der EU zeigt {impact} Auswirkungen von "{topic}".',
    impactSignificant: 'erhebliche',
    impactModerate: 'moderate',
    impactLimited: 'begrenzte',
    genericFallback:
      'Diese parlamentarische Aktivität zu "{topic}" hat {impact} Auswirkungen auf die an EU-Gesetzgebungsprozessen beteiligten Interessengruppen.',
  },
  fr: {
    politicalGroups:
      'Cette activité parlementaire sur "{topic}" a des implications {impact} pour la dynamique des groupes politiques.',
    civilSociety:
      'Les organisations de la société civile surveillant "{topic}" font face à un impact {impact} sur la transparence et la participation démocratique.',
    industry:
      'Les acteurs industriels et économiques observent des implications réglementaires {impact} de "{topic}".',
    nationalGovts:
      'Les gouvernements nationaux évaluent un impact {impact} de "{topic}" sur la subsidiarité et les exigences de mise en œuvre.',
    citizens:
      'Les citoyens de l\'UE subissent des conséquences {impact} de "{topic}" en termes de droits et de représentation démocratique.',
    euInstitutions:
      'La dynamique institutionnelle de l\'UE montre des effets {impact} de "{topic}".',
    impactSignificant: 'significatives',
    impactModerate: 'modérées',
    impactLimited: 'limitées',
    genericFallback:
      'Cette activité parlementaire sur "{topic}" a des implications {impact} pour les parties prenantes impliquées dans les processus législatifs de l\'UE.',
  },
  es: {
    politicalGroups:
      'Esta actividad parlamentaria sobre "{topic}" tiene implicaciones {impact} para la dinámica de los grupos políticos.',
    civilSociety:
      'Las organizaciones de la sociedad civil que monitorean "{topic}" enfrentan un impacto {impact} en la transparencia y la participación democrática.',
    industry:
      'Los actores industriales y empresariales observan implicaciones regulatorias {impact} de "{topic}".',
    nationalGovts:
      'Los gobiernos nacionales evalúan un impacto {impact} de "{topic}" sobre la subsidiariedad y los requisitos de implementación.',
    citizens:
      'Los ciudadanos de la UE experimentan consecuencias {impact} de "{topic}" en términos de derechos y representación democrática.',
    euInstitutions: 'La dinámica institucional de la UE muestra efectos {impact} de "{topic}".',
    impactSignificant: 'significativas',
    impactModerate: 'moderadas',
    impactLimited: 'limitadas',
    genericFallback:
      'Esta actividad parlamentaria sobre "{topic}" tiene implicaciones {impact} para las partes interesadas involucradas en los procesos legislativos de la UE.',
  },
  nl: {
    politicalGroups:
      'Deze parlementaire activiteit over "{topic}" heeft {impact} gevolgen voor de dynamiek van de politieke fracties.',
    civilSociety:
      'Maatschappelijke organisaties die "{topic}" monitoren, ondervinden {impact} impact op transparantie en democratische participatie.',
    industry:
      'Bedrijfs- en industriebelanghebbenden observeren {impact} regelgevingsgevolgen van "{topic}".',
    nationalGovts:
      'Nationale regeringen beoordelen {impact} impact van "{topic}" op subsidiariteit en uitvoeringsverplichtingen.',
    citizens:
      'EU-burgers ervaren {impact} gevolgen van "{topic}" voor rechten en democratische vertegenwoordiging.',
    euInstitutions: 'De institutionele dynamiek van de EU toont {impact} effecten van "{topic}".',
    impactSignificant: 'aanzienlijke',
    impactModerate: 'gematigde',
    impactLimited: 'beperkte',
    genericFallback:
      'Deze parlementaire activiteit over "{topic}" heeft {impact} implicaties voor belanghebbenden betrokken bij EU-wetgevingsprocessen.',
  },
  ar: {
    politicalGroups:
      'هذا النشاط البرلماني حول "{topic}" له تأثيرات {impact} على ديناميكيات المجموعات السياسية.',
    civilSociety:
      'تواجه منظمات المجتمع المدني التي تراقب "{topic}" تأثيراً {impact} على الشفافية والمشاركة الديمقراطية.',
    industry: 'يلاحظ أصحاب المصلحة في الصناعة والأعمال آثاراً تنظيمية {impact} من "{topic}".',
    nationalGovts:
      'تقيّم الحكومات الوطنية تأثيراً {impact} من "{topic}" على مبدأ التبعية ومتطلبات التنفيذ.',
    citizens:
      'يواجه مواطنو الاتحاد الأوروبي عواقب {impact} من "{topic}" فيما يتعلق بالحقوق والتمثيل الديمقراطي.',
    euInstitutions: 'تُظهر الديناميكيات المؤسسية للاتحاد الأوروبي تأثيرات {impact} من "{topic}".',
    impactSignificant: 'كبيرة',
    impactModerate: 'معتدلة',
    impactLimited: 'محدودة',
    genericFallback:
      'هذا النشاط البرلماني حول "{topic}" له تداعيات {impact} على أصحاب المصلحة المشاركين في العمليات التشريعية للاتحاد الأوروبي.',
  },
  he: {
    politicalGroups:
      'פעילות פרלמנטרית זו בנושא "{topic}" יש לה השלכות {impact} על דינמיקת הקבוצות הפוליטיות.',
    civilSociety:
      'ארגוני חברה אזרחית העוקבים אחר "{topic}" מתמודדים עם השפעה {impact} על שקיפות והשתתפות דמוקרטית.',
    industry: 'בעלי עניין בתעשייה ובעסקים מבחינים בהשלכות רגולטוריות {impact} של "{topic}".',
    nationalGovts:
      'ממשלות לאומיות מעריכות השפעה {impact} של "{topic}" על עקרון הסובסידיאריות ודרישות יישום.',
    citizens: 'אזרחי האיחוד חווים השלכות {impact} של "{topic}" מבחינת זכויות וייצוג דמוקרטי.',
    euInstitutions: 'הדינמיקה המוסדית של האיחוד מראה השפעות {impact} של "{topic}".',
    impactSignificant: 'משמעותיות',
    impactModerate: 'מתונות',
    impactLimited: 'מוגבלות',
    genericFallback:
      'פעילות פרלמנטרית זו בנושא "{topic}" יש לה השלכות {impact} על בעלי עניין המעורבים בתהליכי החקיקה של האיחוד האירופי.',
  },
  ja: {
    politicalGroups:
      '「{topic}」に関するこの議会活動は、政治グループの力学に{impact}影響を及ぼしています。',
    civilSociety:
      '「{topic}」を監視する市民社会組織は、透明性と民主的参加に対する{impact}影響に直面しています。',
    industry:
      '産業界および企業の利害関係者は、「{topic}」による{impact}規制上の影響を観察しています。',
    nationalGovts:
      '各国政府は、「{topic}」による補完性と実施要件への{impact}影響を評価しています。',
    citizens: 'EU市民は、「{topic}」による権利と民主的代表に関する{impact}影響を経験しています。',
    euInstitutions: 'EUの制度的力学は、「{topic}」による{impact}影響を示しています。',
    impactSignificant: '重大な',
    impactModerate: '中程度の',
    impactLimited: '限定的な',
    genericFallback:
      '"{topic}"に関するこの議会活動は、EU立法プロセスに関与する利害関係者に{impact}影響を及ぼします。',
  },
  ko: {
    politicalGroups: '"{topic}"에 관한 이 의회 활동은 정치 그룹 역학에 {impact} 영향을 미칩니다.',
    civilSociety:
      '"{topic}"를 모니터링하는 시민 사회 조직은 투명성과 민주적 참여에 대한 {impact} 영향에 직면합니다.',
    industry: '산업계 및 기업 이해관계자는 "{topic}"로 인한 {impact} 규제 영향을 관찰합니다.',
    nationalGovts:
      '국가 정부는 "{topic}"로 인한 보충성 원칙과 시행 요건에 대한 {impact} 영향을 평가합니다.',
    citizens: 'EU 시민은 "{topic}"로 인한 권리와 민주적 대표에 관한 {impact} 결과를 경험합니다.',
    euInstitutions: 'EU 기관 역학은 "{topic}"로 인한 {impact} 효과를 보여줍니다.',
    impactSignificant: '상당한',
    impactModerate: '보통의',
    impactLimited: '제한적인',
    genericFallback:
      '"{topic}"에 관한 이 의회 활동은 EU 입법 과정에 관여하는 이해관계자에게 {impact} 영향을 미칩니다.',
  },
  zh: {
    politicalGroups: '关于"{topic}"的议会活动对政治团体动态产生了{impact}影响。',
    civilSociety: '监测"{topic}"的公民社会组织面临对透明度和民主参与的{impact}影响。',
    industry: '行业和商业利益相关者观察到"{topic}"带来的{impact}监管影响。',
    nationalGovts: '各国政府评估"{topic}"对辅助性原则和实施要求的{impact}影响。',
    citizens: '欧盟公民在权利和民主代表方面感受到"{topic}"的{impact}后果。',
    euInstitutions: '欧盟机构动态显示"{topic}"的{impact}影响。',
    impactSignificant: '重大',
    impactModerate: '中等',
    impactLimited: '有限',
    genericFallback: '关于"{topic}"的这项议会活动对参与欧盟立法过程的利益相关方具有{impact}影响。',
  },
};

/* eslint-disable sonarjs/no-duplicate-string -- Translated analysis strings share common template patterns across languages */
export const VOTING_ANALYSIS_CONTENT_STRINGS: LanguageMap<VotingAnalysisContentStrings> = {
  en: {
    what: '{records} votes recorded between {dateFrom} and {dateTo}: {adopted} adopted, {rejected} rejected. {anomalies} voting anomalies detected across {patterns} political groups. {questions} parliamentary questions filed.',
    whatNoData:
      'Parliamentary activity from {dateFrom} to {dateTo}. Detailed roll-call data unavailable for this period.',
    whenPeriod: 'Period: {dateFrom} to {dateTo}',
    whenVote: '{date}: Vote on "{title}" — {result}',
    whyPatterns:
      'Voting patterns across {patterns} political groups show {cohesionDesc} (average {pct}%). Polarization assessment: {assessment}. These dynamics reflect ongoing legislative priorities and inter-group negotiations on the current parliamentary agenda.',
    whyNoData:
      'Detailed voting pattern data is not yet available for this period. Parliamentary activity during this period reflects the standard legislative agenda.',
    notAvailable: 'N/A',
    cohesionHigh: 'high cohesion',
    cohesionModerate: 'moderate cohesion',
    cohesionFragmented: 'fragmented positions',
    impactPolitical:
      'Political group dynamics shaped by {records} votes — {adopted} adopted, {rejected} rejected.',
    impactPoliticalAnomaly: '{anomalies} voting anomalies signal potential coalition shifts.',
    impactPoliticalStable: 'Voting patterns indicate stable coalition behaviour.',
    impactPoliticalNone:
      'Limited voting activity during this period constrains political impact assessment.',
    impactEconomic:
      '{adopted} adopted legislative measures may affect regulatory frameworks, market conditions, and business compliance requirements across EU member states.',
    impactEconomicNone:
      'No adopted texts in this period limits immediate economic impact from parliamentary activity.',
    impactSocial:
      'Parliamentary engagement at {activity} level with {questions} questions filed, reflecting legislative attention to citizen concerns and social policy priorities.',
    impactLegal:
      '{adopted} adopted texts advance through the legislative process, with potential implications for EU legal frameworks and member state transposition requirements.',
    impactLegalNone:
      'Limited legislative output during this period reduces immediate legal framework impact.',
    impactGeopolitical:
      'European Parliament activity at {activity} level positions the EU in ongoing international policy discussions, particularly regarding trade, security, and environmental commitments.',
    activityHigh: 'high',
    activityModerate: 'moderate',
    activityLimited: 'limited',
    outlookProductive:
      'The {trend} legislative period ({dateFrom}–{dateTo}) with {adopted} adopted texts sets the trajectory for upcoming parliamentary sessions.',
    outlookMeasured:
      'The {trend} legislative period ({dateFrom}–{dateTo}) with {adopted} adopted texts sets the trajectory for upcoming parliamentary sessions.',
    outlookNoData:
      'The period {dateFrom}–{dateTo} showed limited parliamentary voting activity. Upcoming sessions are likely to address accumulated legislative items, potentially leading to concentrated voting periods.',
    outlookAnomalyNote:
      ' Detected voting anomalies ({anomalies}) warrant monitoring as they may signal evolving coalition dynamics.',
    trendProductive: 'productive',
    trendMeasured: 'measured',
    stakeholderWinnerReason:
      '{group} demonstrated strong internal cohesion ({pct}%) with high participation ({participation}%), enabling effective bloc voting.',
    stakeholderLoserReason:
      '{group} showed internal division with low cohesion ({pct}%), weakening their collective bargaining position.',
    stakeholderMajorityActor: 'Majority coalition',
    stakeholderGroupLeadership: 'Political group leadership',
    consequenceAdopted:
      '{result} by {margin} ({for} for, {against} against, {abstain} abstentions). This outcome shapes the legislative trajectory of this policy area.',
    consequenceAnomaly:
      'Voting anomaly "{description}" signals potential shifts in political group alignment, requiring monitoring of subsequent coalition behaviour.',
    marginStrong: 'strong',
    marginModerate: 'moderate',
    marginNarrow: 'narrow',
    marginTied: 'tied vote with no clear majority',
    marginFavour: 'majority in favour',
    marginAgainst: 'majority against',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Group leadership could have addressed internal dissent through pre-vote consultations and compromise amendments to prevent the {type} and maintain cohesion.',
  },
  sv: {
    what: '{records} omröstningar registrerade mellan {dateFrom} och {dateTo}: {adopted} antagna, {rejected} avvisade. {anomalies} röstningsavvikelser upptäckta i {patterns} politiska grupper. {questions} parlamentariska frågor inlämnade.',
    whatNoData:
      'Parlamentarisk verksamhet från {dateFrom} till {dateTo}. Detaljerade namnuppropningsdata är inte tillgängliga för denna period.',
    whenPeriod: 'Period: {dateFrom} till {dateTo}',
    whenVote: '{date}: Omröstning om "{title}" — {result}',
    whyPatterns:
      'Röstmönster i {patterns} politiska grupper visar {cohesionDesc} (genomsnitt {pct}%). Polariseringsbedömning: {assessment}. Denna dynamik återspeglar pågående lagstiftningsprioriteringar och förhandlingar mellan grupper inom den nuvarande parlamentariska dagordningen.',
    whyNoData:
      'Detaljerade röstmönsterdata är ännu inte tillgängliga för denna period. Parlamentarisk verksamhet under denna period återspeglar den ordinarie lagstiftningsdagordningen.',
    notAvailable: 'Ej tillgänglig',
    cohesionHigh: 'hög sammanhållning',
    cohesionModerate: 'måttlig sammanhållning',
    cohesionFragmented: 'fragmenterade ståndpunkter',
    impactPolitical:
      'Politisk gruppdynamik formad av {records} omröstningar — {adopted} antagna, {rejected} avvisade.',
    impactPoliticalAnomaly:
      '{anomalies} röstningsavvikelser signalerar potentiella koalitionsförskjutningar.',
    impactPoliticalStable: 'Röstmönster indikerar stabilt koalitionsbeteende.',
    impactPoliticalNone:
      'Begränsad röstningsaktivitet under denna period begränsar den politiska konsekvensbedömningen.',
    impactEconomic:
      '{adopted} antagna lagstiftningsåtgärder kan påverka regelverk, marknadsförhållanden och efterlevnadskrav för företag i EU:s medlemsstater.',
    impactEconomicNone:
      'Inga antagna texter under denna period begränsar den omedelbara ekonomiska påverkan från parlamentarisk verksamhet.',
    impactSocial:
      'Parlamentariskt engagemang på {activity} nivå med {questions} inlämnade frågor, vilket återspeglar lagstiftningsuppmärksamhet på medborgarnas intressen och socialpolitiska prioriteringar.',
    impactLegal:
      '{adopted} antagna texter avancerar genom lagstiftningsprocessen med potentiella konsekvenser för EU:s rättsliga ramar och medlemsstaternas införlivandekrav.',
    impactLegalNone:
      'Begränsad lagstiftningsproduktion under denna period minskar den omedelbara påverkan på rättsliga ramar.',
    impactGeopolitical:
      'Europaparlamentets verksamhet på {activity} nivå positionerar EU i pågående internationella policydiskussioner, särskilt avseende handel, säkerhet och miljöåtaganden.',
    activityHigh: 'hög',
    activityModerate: 'måttlig',
    activityLimited: 'begränsad',
    outlookProductive:
      'Den {trend} lagstiftningsperioden ({dateFrom}–{dateTo}) med {adopted} antagna texter anger riktningen för kommande parlamentariska sessioner.',
    outlookMeasured:
      'Den {trend} lagstiftningsperioden ({dateFrom}–{dateTo}) med {adopted} antagna texter anger riktningen för kommande parlamentariska sessioner.',
    outlookNoData:
      'Perioden {dateFrom}–{dateTo} visade begränsad parlamentarisk röstningsaktivitet. Kommande sessioner kommer sannolikt att behandla ackumulerade lagstiftningsärenden, vilket potentiellt leder till koncentrerade röstningsperioder.',
    outlookAnomalyNote:
      ' Upptäckta röstningsavvikelser ({anomalies}) motiverar övervakning då de kan signalera föränderlig koalitionsdynamik.',
    trendProductive: 'produktiva',
    trendMeasured: 'avvägda',
    stakeholderWinnerReason:
      '{group} visade stark intern sammanhållning ({pct}%) med högt deltagande ({participation}%), vilket möjliggjorde effektiv blockomröstning.',
    stakeholderLoserReason:
      '{group} visade intern splittring med låg sammanhållning ({pct}%), vilket försvagade deras kollektiva förhandlingsposition.',
    stakeholderMajorityActor: 'Majoritetskoalitionen',
    stakeholderGroupLeadership: 'Politisk gruppledning',
    consequenceAdopted:
      '{result} med {margin} ({for} för, {against} emot, {abstain} nedlagda röster). Detta resultat formar den lagstiftningsmässiga utvecklingen inom detta politikområde.',
    consequenceAnomaly:
      'Röstningsavvikelsen "{description}" signalerar potentiella skiften i politisk gruppanpassning, vilket kräver övervakning av efterföljande koalitionsbeteende.',
    marginStrong: 'stark',
    marginModerate: 'måttlig',
    marginNarrow: 'knapp',
    marginTied: 'lika röstetal utan tydlig majoritet',
    marginFavour: 'majoritet för',
    marginAgainst: 'majoritet emot',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Gruppledningen kunde ha hanterat intern oenighet genom förhandssamråd och kompromissändringsförslag för att förebygga {type} och upprätthålla sammanhållningen.',
  },
  da: {
    what: '{records} afstemninger registreret mellem {dateFrom} og {dateTo}: {adopted} vedtaget, {rejected} forkastet. {anomalies} afstemningsanomalier opdaget på tværs af {patterns} politiske grupper. {questions} parlamentariske spørgsmål indgivet.',
    whatNoData:
      'Parlamentarisk aktivitet fra {dateFrom} til {dateTo}. Detaljerede afstemningsdata er ikke tilgængelige for denne periode.',
    whenPeriod: 'Periode: {dateFrom} til {dateTo}',
    whenVote: '{date}: Afstemning om "{title}" — {result}',
    whyPatterns:
      'Afstemningsmønstre på tværs af {patterns} politiske grupper viser {cohesionDesc} (gennemsnit {pct}%). Polariseringsvurdering: {assessment}. Denne dynamik afspejler igangværende lovgivningsprioriteter og forhandlinger mellem grupper på den nuværende parlamentariske dagsorden.',
    whyNoData:
      'Detaljerede afstemningsdata er endnu ikke tilgængelige for denne periode. Parlamentarisk aktivitet i denne periode afspejler den ordinære lovgivningsdagsorden.',
    notAvailable: 'Ikke tilgængelig',
    cohesionHigh: 'høj samhørighed',
    cohesionModerate: 'moderat samhørighed',
    cohesionFragmented: 'fragmenterede holdninger',
    impactPolitical:
      'Politisk gruppedynamik formet af {records} afstemninger — {adopted} vedtaget, {rejected} forkastet.',
    impactPoliticalAnomaly:
      '{anomalies} afstemningsanomalier signalerer potentielle koalitionsskift.',
    impactPoliticalStable: 'Afstemningsmønstre indikerer stabil koalitionsadfærd.',
    impactPoliticalNone:
      'Begrænset afstemningsaktivitet i denne periode begrænser den politiske konsekvensvurdering.',
    impactEconomic:
      '{adopted} vedtagne lovgivningsmæssige foranstaltninger kan påvirke reguleringsrammer, markedsforhold og virksomheders overholdelseskrav på tværs af EU-medlemsstater.',
    impactEconomicNone:
      'Ingen vedtagne tekster i denne periode begrænser den umiddelbare økonomiske indvirkning fra parlamentarisk aktivitet.',
    impactSocial:
      'Parlamentarisk engagement på {activity} niveau med {questions} indgivne spørgsmål, der afspejler lovgivningsmæssig opmærksomhed på borgernes bekymringer og socialpolitiske prioriteter.',
    impactLegal:
      "{adopted} vedtagne tekster avancerer gennem lovgivningsprocessen med potentielle konsekvenser for EU's retlige rammer og medlemsstaternes gennemførelseskrav.",
    impactLegalNone:
      'Begrænset lovgivningsmæssig produktion i denne periode reducerer den umiddelbare indvirkning på retlige rammer.',
    impactGeopolitical:
      'Europa-Parlamentets aktivitet på {activity} niveau positionerer EU i igangværende internationale politiske drøftelser, navnlig vedrørende handel, sikkerhed og miljøforpligtelser.',
    activityHigh: 'højt',
    activityModerate: 'moderat',
    activityLimited: 'begrænset',
    outlookProductive:
      'Den {trend} lovgivningsperiode ({dateFrom}–{dateTo}) med {adopted} vedtagne tekster sætter kursen for kommende parlamentariske sessioner.',
    outlookMeasured:
      'Den {trend} lovgivningsperiode ({dateFrom}–{dateTo}) med {adopted} vedtagne tekster sætter kursen for kommende parlamentariske sessioner.',
    outlookNoData:
      'Perioden {dateFrom}–{dateTo} viste begrænset parlamentarisk afstemningsaktivitet. Kommende sessioner vil sandsynligvis behandle akkumulerede lovgivningsemner, hvilket potentielt fører til koncentrerede afstemningsperioder.',
    outlookAnomalyNote:
      ' Opdagede afstemningsanomalier ({anomalies}) berettiger overvågning, da de kan signalere udviklende koalitionsdynamik.',
    trendProductive: 'produktive',
    trendMeasured: 'afmålte',
    stakeholderWinnerReason:
      '{group} demonstrerede stærk intern samhørighed ({pct}%) med høj deltagelse ({participation}%), der muliggjorde effektiv blokafstemning.',
    stakeholderLoserReason:
      '{group} viste intern uenighed med lav samhørighed ({pct}%), hvilket svækkede deres kollektive forhandlingsposition.',
    stakeholderMajorityActor: 'Flertalskoalitionen',
    stakeholderGroupLeadership: 'Politisk gruppeledelse',
    consequenceAdopted:
      '{result} med {margin} ({for} for, {against} imod, {abstain} afståelser). Dette resultat former den lovgivningsmæssige udvikling inden for dette politikområde.',
    consequenceAnomaly:
      'Afstemningsanomalien "{description}" signalerer potentielle skift i politisk gruppetilpasning, hvilket kræver overvågning af efterfølgende koalitionsadfærd.',
    marginStrong: 'stærkt',
    marginModerate: 'moderat',
    marginNarrow: 'snævert',
    marginTied: 'stemmelighed uden klart flertal',
    marginFavour: 'flertal for',
    marginAgainst: 'flertal imod',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Gruppeledelsen kunne have adresseret intern uenighed gennem forhåndskonsultationer og kompromisændringsforslag for at forhindre {type} og opretholde samhørigheden.',
  },
  no: {
    what: '{records} avstemninger registrert mellom {dateFrom} og {dateTo}: {adopted} vedtatt, {rejected} avvist. {anomalies} avstemningsavvik oppdaget på tvers av {patterns} politiske grupper. {questions} parlamentariske spørsmål innlevert.',
    whatNoData:
      'Parlamentarisk aktivitet fra {dateFrom} til {dateTo}. Detaljerte navneoppropdata er ikke tilgjengelige for denne perioden.',
    whenPeriod: 'Periode: {dateFrom} til {dateTo}',
    whenVote: '{date}: Avstemning om "{title}" — {result}',
    whyPatterns:
      'Avstemningsmønstre på tvers av {patterns} politiske grupper viser {cohesionDesc} (gjennomsnitt {pct}%). Polariseringsvurdering: {assessment}. Denne dynamikken gjenspeiler pågående lovgivningsprioriteringer og forhandlinger mellom grupper på den nåværende parlamentariske dagsordenen.',
    whyNoData:
      'Detaljerte avstemningsmønsterdata er ennå ikke tilgjengelige for denne perioden. Parlamentarisk aktivitet i denne perioden gjenspeiler den ordinære lovgivningsdagsordenen.',
    notAvailable: 'Ikke tilgjengelig',
    cohesionHigh: 'høy samhold',
    cohesionModerate: 'moderat samhold',
    cohesionFragmented: 'fragmenterte posisjoner',
    impactPolitical:
      'Politisk gruppedynamikk formet av {records} avstemninger — {adopted} vedtatt, {rejected} avvist.',
    impactPoliticalAnomaly:
      '{anomalies} avstemningsavvik signaliserer potensielle koalisjonsskifter.',
    impactPoliticalStable: 'Avstemningsmønstre indikerer stabil koalisjonsatferd.',
    impactPoliticalNone:
      'Begrenset avstemningsaktivitet i denne perioden begrenser den politiske konsekvensvurderingen.',
    impactEconomic:
      '{adopted} vedtatte lovgivningstiltak kan påvirke reguleringsrammer, markedsforhold og virksomheters etterlevelseskrav på tvers av EUs medlemsstater.',
    impactEconomicNone:
      'Ingen vedtatte tekster i denne perioden begrenser den umiddelbare økonomiske virkningen fra parlamentarisk aktivitet.',
    impactSocial:
      'Parlamentarisk engasjement på {activity} nivå med {questions} innleverte spørsmål, som gjenspeiler lovgivningsmessig oppmerksomhet på borgernes bekymringer og sosialpolitiske prioriteringer.',
    impactLegal:
      '{adopted} vedtatte tekster avanserer gjennom lovgivningsprosessen med potensielle konsekvenser for EUs rettslige rammer og medlemsstatenes gjennomføringskrav.',
    impactLegalNone:
      'Begrenset lovgivningsproduksjon i denne perioden reduserer den umiddelbare påvirkningen på rettslige rammer.',
    impactGeopolitical:
      'Europaparlamentets aktivitet på {activity} nivå posisjonerer EU i pågående internasjonale politiske diskusjoner, særlig angående handel, sikkerhet og miljøforpliktelser.',
    activityHigh: 'høyt',
    activityModerate: 'moderat',
    activityLimited: 'begrenset',
    outlookProductive:
      'Den {trend} lovgivningsperioden ({dateFrom}–{dateTo}) med {adopted} vedtatte tekster setter kursen for kommende parlamentariske sesjoner.',
    outlookMeasured:
      'Den {trend} lovgivningsperioden ({dateFrom}–{dateTo}) med {adopted} vedtatte tekster setter kursen for kommende parlamentariske sesjoner.',
    outlookNoData:
      'Perioden {dateFrom}–{dateTo} viste begrenset parlamentarisk avstemningsaktivitet. Kommende sesjoner vil sannsynligvis behandle akkumulerte lovgivningssaker, noe som potensielt fører til konsentrerte avstemningsperioder.',
    outlookAnomalyNote:
      ' Oppdagede avstemningsavvik ({anomalies}) rettferdiggjør overvåking da de kan signalisere utviklende koalisjonsdynamikk.',
    trendProductive: 'produktive',
    trendMeasured: 'avmålte',
    stakeholderWinnerReason:
      '{group} demonstrerte sterkt internt samhold ({pct}%) med høy deltakelse ({participation}%), noe som muliggjorde effektiv blokkavtemning.',
    stakeholderLoserReason:
      '{group} viste intern splittelse med lavt samhold ({pct}%), noe som svekket deres kollektive forhandlingsposisjon.',
    stakeholderMajorityActor: 'Flertallskoalisjonen',
    stakeholderGroupLeadership: 'Politisk gruppeledelse',
    consequenceAdopted:
      '{result} med {margin} ({for} for, {against} mot, {abstain} avholdende). Dette resultatet former den lovgivningsmessige utviklingen innen dette politikkområdet.',
    consequenceAnomaly:
      'Avstemningsavviket "{description}" signaliserer potensielle skifter i politisk gruppetilpasning, noe som krever overvåking av påfølgende koalisjonsatferd.',
    marginStrong: 'sterkt',
    marginModerate: 'moderat',
    marginNarrow: 'knapt',
    marginTied: 'stemmelikhet uten klart flertall',
    marginFavour: 'flertall for',
    marginAgainst: 'flertall mot',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Gruppeledelsen kunne ha adressert intern uenighet gjennom forhåndskonsultasjoner og kompromissendringsforslag for å forhindre {type} og opprettholde samholdet.',
  },
  fi: {
    what: '{records} äänestystä kirjattu välillä {dateFrom} ja {dateTo}: {adopted} hyväksytty, {rejected} hylätty. {anomalies} äänestyspoikkeamaa havaittu {patterns} poliittisessa ryhmässä. {questions} parlamentaarista kysymystä jätetty.',
    whatNoData:
      'Parlamentaarinen toiminta {dateFrom}–{dateTo}. Yksityiskohtaiset nimenhuutoäänestystiedot eivät ole saatavilla tälle ajanjaksolle.',
    whenPeriod: 'Ajanjakso: {dateFrom}–{dateTo}',
    whenVote: '{date}: Äänestys aiheesta "{title}" — {result}',
    whyPatterns:
      'Äänestysmallit {patterns} poliittisessa ryhmässä osoittavat {cohesionDesc} (keskiarvo {pct}%). Polarisaatioarvio: {assessment}. Tämä dynamiikka heijastaa meneillään olevia lainsäädäntöprioriteetteja ja ryhmien välisiä neuvotteluja nykyisellä parlamentaarisella asialistalla.',
    whyNoData:
      'Yksityiskohtaiset äänestysmallit eivät ole vielä saatavilla tälle ajanjaksolle. Parlamentaarinen toiminta tänä aikana heijastaa tavanomaista lainsäädäntöohjelmaa.',
    notAvailable: 'Ei saatavilla',
    cohesionHigh: 'korkea yhtenäisyys',
    cohesionModerate: 'kohtalainen yhtenäisyys',
    cohesionFragmented: 'hajanaiset kannat',
    impactPolitical:
      'Poliittisten ryhmien dynamiikkaa muovasivat {records} äänestystä — {adopted} hyväksytty, {rejected} hylätty.',
    impactPoliticalAnomaly:
      '{anomalies} äänestyspoikkeamaa viittaa mahdollisiin koalitiomuutoksiin.',
    impactPoliticalStable: 'Äänestysmallit osoittavat vakaata koalitiokäyttäytymistä.',
    impactPoliticalNone:
      'Rajallinen äänestystoiminta tänä aikana rajoittaa poliittisen vaikutuksen arviointia.',
    impactEconomic:
      '{adopted} hyväksyttyä lainsäädäntötoimenpidettä voi vaikuttaa sääntelykehyksiin, markkinaolosuhteisiin ja yritysten vaatimustenmukaisuusvaatimuksiin EU:n jäsenvaltioissa.',
    impactEconomicNone:
      'Ei hyväksyttyjä tekstejä tänä aikana, mikä rajoittaa parlamentaarisen toiminnan välitöntä taloudellista vaikutusta.',
    impactSocial:
      'Parlamentaarinen sitoutuminen {activity} tasolla ja {questions} jätettyä kysymystä heijastavat lainsäädännöllistä huomiota kansalaisten huolenaiheisiin ja sosiaalipoliittisiin painopisteisiin.',
    impactLegal:
      '{adopted} hyväksyttyä tekstiä etenee lainsäädäntöprosessissa mahdollisine vaikutuksineen EU:n oikeudellisiin kehyksiin ja jäsenvaltioiden täytäntöönpanovaatimuksiin.',
    impactLegalNone:
      'Rajallinen lainsäädäntötuotanto tänä aikana vähentää välitöntä vaikutusta oikeudellisiin kehyksiin.',
    impactGeopolitical:
      'Euroopan parlamentin toiminta {activity} tasolla asemoi EU:ta käynnissä olevissa kansainvälisissä politiikkakeskusteluissa, erityisesti kauppaan, turvallisuuteen ja ympäristösitoumuksiin liittyen.',
    activityHigh: 'korkea',
    activityModerate: 'kohtalainen',
    activityLimited: 'rajallinen',
    outlookProductive:
      '{trend} lainsäädäntökausi ({dateFrom}–{dateTo}) ja {adopted} hyväksyttyä tekstiä määrittävät suunnan tuleville parlamentaarisille istunnoille.',
    outlookMeasured:
      '{trend} lainsäädäntökausi ({dateFrom}–{dateTo}) ja {adopted} hyväksyttyä tekstiä määrittävät suunnan tuleville parlamentaarisille istunnoille.',
    outlookNoData:
      'Ajanjakso {dateFrom}–{dateTo} osoitti rajallista parlamentaarista äänestystoimintaa. Tulevat istunnot käsittelevät todennäköisesti kertyneitä lainsäädäntöasioita, mikä voi johtaa keskittyneisiin äänestysjaksoihin.',
    outlookAnomalyNote:
      ' Havaitut äänestyspoikkeamat ({anomalies}) edellyttävät seurantaa, sillä ne voivat viitata kehittyvään koalitiodynamiikkaan.',
    trendProductive: 'tuottelias',
    trendMeasured: 'maltillinen',
    stakeholderWinnerReason:
      '{group} osoitti vahvaa sisäistä yhtenäisyyttä ({pct}%) korkealla osallistumisella ({participation}%), mikä mahdollisti tehokkaan blokkiäänestyksen.',
    stakeholderLoserReason:
      '{group} osoitti sisäistä jakautumista alhaisella yhtenäisyydellä ({pct}%), mikä heikensi heidän kollektiivista neuvotteluasemaansa.',
    stakeholderMajorityActor: 'Enemmistökoalitio',
    stakeholderGroupLeadership: 'Poliittisten ryhmien johto',
    consequenceAdopted:
      '{result} äänin {margin} ({for} puolesta, {against} vastaan, {abstain} pidättäytyneitä). Tämä tulos muokkaa tämän politiikka-alueen lainsäädännöllistä suuntaa.',
    consequenceAnomaly:
      'Äänestyspoikkeama "{description}" viittaa mahdollisiin muutoksiin poliittisten ryhmien linjauksissa, mikä edellyttää myöhemmän koalitiokäyttäytymisen seurantaa.',
    marginStrong: 'vahva',
    marginModerate: 'kohtalainen',
    marginNarrow: 'niukka',
    marginTied: 'tasatulos ilman selvää enemmistöä',
    marginFavour: 'enemmistö puolesta',
    marginAgainst: 'enemmistö vastaan',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Ryhmäjohto olisi voinut käsitellä sisäistä erimielisyyttä ennakkokuulemisilla ja kompromissitarkistuksilla estääkseen {type} ja ylläpitääkseen yhtenäisyyttä.',
  },
  de: {
    what: '{records} Abstimmungen aufgezeichnet zwischen {dateFrom} und {dateTo}: {adopted} angenommen, {rejected} abgelehnt. {anomalies} Abstimmungsanomalien in {patterns} Fraktionen festgestellt. {questions} parlamentarische Anfragen eingereicht.',
    whatNoData:
      'Parlamentarische Tätigkeit von {dateFrom} bis {dateTo}. Detaillierte namentliche Abstimmungsdaten sind für diesen Zeitraum nicht verfügbar.',
    whenPeriod: 'Zeitraum: {dateFrom} bis {dateTo}',
    whenVote: '{date}: Abstimmung über "{title}" — {result}',
    whyPatterns:
      'Abstimmungsmuster in {patterns} Fraktionen zeigen {cohesionDesc} (Durchschnitt {pct}%). Polarisierungsbewertung: {assessment}. Diese Dynamik spiegelt laufende Gesetzgebungsprioritäten und fraktionsübergreifende Verhandlungen auf der aktuellen parlamentarischen Tagesordnung wider.',
    whyNoData:
      'Detaillierte Abstimmungsmusterdaten sind für diesen Zeitraum noch nicht verfügbar. Die parlamentarische Tätigkeit in diesem Zeitraum spiegelt die reguläre Gesetzgebungsagenda wider.',
    notAvailable: 'Nicht verfügbar',
    cohesionHigh: 'hoher Zusammenhalt',
    cohesionModerate: 'mäßiger Zusammenhalt',
    cohesionFragmented: 'fragmentierte Positionen',
    impactPolitical:
      'Fraktionsdynamik geprägt durch {records} Abstimmungen — {adopted} angenommen, {rejected} abgelehnt.',
    impactPoliticalAnomaly:
      '{anomalies} Abstimmungsanomalien signalisieren mögliche Koalitionsverschiebungen.',
    impactPoliticalStable: 'Abstimmungsmuster deuten auf stabiles Koalitionsverhalten hin.',
    impactPoliticalNone:
      'Begrenzte Abstimmungstätigkeit in diesem Zeitraum schränkt die politische Folgenabschätzung ein.',
    impactEconomic:
      '{adopted} angenommene Gesetzgebungsmaßnahmen können Regulierungsrahmen, Marktbedingungen und Compliance-Anforderungen für Unternehmen in den EU-Mitgliedstaaten beeinflussen.',
    impactEconomicNone:
      'Keine angenommenen Texte in diesem Zeitraum begrenzen die unmittelbare wirtschaftliche Auswirkung parlamentarischer Tätigkeit.',
    impactSocial:
      'Parlamentarisches Engagement auf {activity} Niveau mit {questions} eingereichten Anfragen, was die gesetzgeberische Aufmerksamkeit für Bürgeranliegen und sozialpolitische Prioritäten widerspiegelt.',
    impactLegal:
      '{adopted} angenommene Texte durchlaufen den Gesetzgebungsprozess mit potenziellen Auswirkungen auf den EU-Rechtsrahmen und die Umsetzungsanforderungen der Mitgliedstaaten.',
    impactLegalNone:
      'Begrenzte Gesetzgebungsproduktion in diesem Zeitraum verringert die unmittelbaren Auswirkungen auf den Rechtsrahmen.',
    impactGeopolitical:
      'Die Tätigkeit des Europäischen Parlaments auf {activity} Niveau positioniert die EU in laufenden internationalen Politikdiskussionen, insbesondere in Bezug auf Handel, Sicherheit und Umweltverpflichtungen.',
    activityHigh: 'hohem',
    activityModerate: 'mäßigem',
    activityLimited: 'begrenztem',
    outlookProductive:
      'Die {trend} Gesetzgebungsperiode ({dateFrom}–{dateTo}) mit {adopted} angenommenen Texten gibt die Richtung für kommende parlamentarische Sitzungen vor.',
    outlookMeasured:
      'Die {trend} Gesetzgebungsperiode ({dateFrom}–{dateTo}) mit {adopted} angenommenen Texten gibt die Richtung für kommende parlamentarische Sitzungen vor.',
    outlookNoData:
      'Der Zeitraum {dateFrom}–{dateTo} zeigte begrenzte parlamentarische Abstimmungstätigkeit. Kommende Sitzungen werden voraussichtlich angesammelte Gesetzgebungspunkte behandeln, was möglicherweise zu konzentrierten Abstimmungsperioden führt.',
    outlookAnomalyNote:
      ' Festgestellte Abstimmungsanomalien ({anomalies}) rechtfertigen eine Überwachung, da sie sich entwickelnde Koalitionsdynamiken signalisieren könnten.',
    trendProductive: 'produktive',
    trendMeasured: 'gemessene',
    stakeholderWinnerReason:
      '{group} zeigte starken internen Zusammenhalt ({pct}%) bei hoher Beteiligung ({participation}%), was eine effektive Blockabstimmung ermöglichte.',
    stakeholderLoserReason:
      '{group} zeigte interne Spaltung mit geringem Zusammenhalt ({pct}%), was ihre kollektive Verhandlungsposition schwächte.',
    stakeholderMajorityActor: 'Mehrheitskoalition',
    stakeholderGroupLeadership: 'Fraktionsführung',
    consequenceAdopted:
      '{result} mit {margin} ({for} dafür, {against} dagegen, {abstain} Enthaltungen). Dieses Ergebnis prägt den gesetzgeberischen Verlauf in diesem Politikbereich.',
    consequenceAnomaly:
      'Die Abstimmungsanomalie "{description}" signalisiert potenzielle Verschiebungen in der Fraktionsausrichtung, was eine Überwachung des nachfolgenden Koalitionsverhaltens erfordert.',
    marginStrong: 'stark',
    marginModerate: 'mäßig',
    marginNarrow: 'knapp',
    marginTied: 'Stimmengleichheit ohne klare Mehrheit',
    marginFavour: 'Mehrheit dafür',
    marginAgainst: 'Mehrheit dagegen',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Die Fraktionsführung hätte interne Meinungsverschiedenheiten durch Vorabkonsultationen und Kompromissänderungsanträge ansprechen können, um {type} zu verhindern und den Zusammenhalt zu wahren.',
  },
  fr: {
    what: '{records} votes enregistrés entre le {dateFrom} et le {dateTo} : {adopted} adoptés, {rejected} rejetés. {anomalies} anomalies de vote détectées dans {patterns} groupes politiques. {questions} questions parlementaires déposées.',
    whatNoData:
      'Activité parlementaire du {dateFrom} au {dateTo}. Les données détaillées des votes par appel nominal ne sont pas disponibles pour cette période.',
    whenPeriod: 'Période : {dateFrom} au {dateTo}',
    whenVote: '{date} : Vote sur « {title} » — {result}',
    whyPatterns:
      "Les schémas de vote dans {patterns} groupes politiques montrent {cohesionDesc} (moyenne {pct}%). Évaluation de la polarisation : {assessment}. Ces dynamiques reflètent les priorités législatives en cours et les négociations intergroupes sur l'ordre du jour parlementaire actuel.",
    whyNoData:
      "Les données détaillées des schémas de vote ne sont pas encore disponibles pour cette période. L'activité parlementaire durant cette période reflète l'agenda législatif ordinaire.",
    notAvailable: 'Non disponible',
    cohesionHigh: 'forte cohésion',
    cohesionModerate: 'cohésion modérée',
    cohesionFragmented: 'positions fragmentées',
    impactPolitical:
      'Dynamique des groupes politiques façonnée par {records} votes — {adopted} adoptés, {rejected} rejetés.',
    impactPoliticalAnomaly:
      '{anomalies} anomalies de vote signalent des changements potentiels de coalition.',
    impactPoliticalStable: 'Les schémas de vote indiquent un comportement de coalition stable.',
    impactPoliticalNone:
      "L'activité de vote limitée durant cette période contraint l'évaluation de l'impact politique.",
    impactEconomic:
      "{adopted} mesures législatives adoptées peuvent affecter les cadres réglementaires, les conditions de marché et les exigences de conformité des entreprises dans les États membres de l'UE.",
    impactEconomicNone:
      "L'absence de textes adoptés durant cette période limite l'impact économique immédiat de l'activité parlementaire.",
    impactSocial:
      "Engagement parlementaire à un niveau {activity} avec {questions} questions déposées, reflétant l'attention législative portée aux préoccupations des citoyens et aux priorités de politique sociale.",
    impactLegal:
      "{adopted} textes adoptés progressent dans le processus législatif, avec des implications potentielles pour les cadres juridiques de l'UE et les exigences de transposition des États membres.",
    impactLegalNone:
      "La production législative limitée durant cette période réduit l'impact immédiat sur les cadres juridiques.",
    impactGeopolitical:
      "L'activité du Parlement européen à un niveau {activity} positionne l'UE dans les discussions politiques internationales en cours, notamment en matière de commerce, de sécurité et d'engagements environnementaux.",
    activityHigh: 'élevé',
    activityModerate: 'modéré',
    activityLimited: 'limité',
    outlookProductive:
      'La période législative {trend} ({dateFrom}–{dateTo}) avec {adopted} textes adoptés détermine la trajectoire des prochaines sessions parlementaires.',
    outlookMeasured:
      'La période législative {trend} ({dateFrom}–{dateTo}) avec {adopted} textes adoptés détermine la trajectoire des prochaines sessions parlementaires.',
    outlookNoData:
      'La période {dateFrom}–{dateTo} a montré une activité de vote parlementaire limitée. Les prochaines sessions sont susceptibles de traiter les éléments législatifs accumulés, conduisant potentiellement à des périodes de vote concentrées.',
    outlookAnomalyNote:
      ' Les anomalies de vote détectées ({anomalies}) justifient une surveillance car elles peuvent signaler une dynamique de coalition en évolution.',
    trendProductive: 'productive',
    trendMeasured: 'mesurée',
    stakeholderWinnerReason:
      '{group} a démontré une forte cohésion interne ({pct}%) avec une participation élevée ({participation}%), permettant un vote de bloc efficace.',
    stakeholderLoserReason:
      '{group} a montré des divisions internes avec une faible cohésion ({pct}%), affaiblissant leur position de négociation collective.',
    stakeholderMajorityActor: 'Coalition majoritaire',
    stakeholderGroupLeadership: 'Direction des groupes politiques',
    consequenceAdopted:
      '{result} par {margin} ({for} pour, {against} contre, {abstain} abstentions). Ce résultat façonne la trajectoire législative de ce domaine politique.',
    consequenceAnomaly:
      "L'anomalie de vote « {description} » signale des changements potentiels dans l'alignement des groupes politiques, nécessitant une surveillance du comportement de coalition ultérieur.",
    marginStrong: 'forte',
    marginModerate: 'modérée',
    marginNarrow: 'étroite',
    marginTied: 'vote à égalité sans majorité claire',
    marginFavour: 'majorité en faveur',
    marginAgainst: 'majorité contre',
    mistakeDescription: '{type} : {description}',
    mistakeAlternative:
      'La direction du groupe aurait pu traiter la dissidence interne par des consultations préalables au vote et des amendements de compromis pour prévenir le {type} et maintenir la cohésion.',
  },
  es: {
    what: '{records} votaciones registradas entre {dateFrom} y {dateTo}: {adopted} adoptadas, {rejected} rechazadas. {anomalies} anomalías de votación detectadas en {patterns} grupos políticos. {questions} preguntas parlamentarias presentadas.',
    whatNoData:
      'Actividad parlamentaria desde {dateFrom} hasta {dateTo}. Los datos detallados de votación nominal no están disponibles para este período.',
    whenPeriod: 'Período: {dateFrom} a {dateTo}',
    whenVote: '{date}: Votación sobre "{title}" — {result}',
    whyPatterns:
      'Los patrones de votación en {patterns} grupos políticos muestran {cohesionDesc} (promedio {pct}%). Evaluación de polarización: {assessment}. Estas dinámicas reflejan las prioridades legislativas en curso y las negociaciones intergrupales en la agenda parlamentaria actual.',
    whyNoData:
      'Los datos detallados de patrones de votación aún no están disponibles para este período. La actividad parlamentaria durante este período refleja la agenda legislativa ordinaria.',
    notAvailable: 'No disponible',
    cohesionHigh: 'alta cohesión',
    cohesionModerate: 'cohesión moderada',
    cohesionFragmented: 'posiciones fragmentadas',
    impactPolitical:
      'Dinámica de grupos políticos configurada por {records} votaciones — {adopted} adoptadas, {rejected} rechazadas.',
    impactPoliticalAnomaly:
      '{anomalies} anomalías de votación señalan posibles cambios de coalición.',
    impactPoliticalStable:
      'Los patrones de votación indican un comportamiento de coalición estable.',
    impactPoliticalNone:
      'La actividad de votación limitada durante este período restringe la evaluación del impacto político.',
    impactEconomic:
      '{adopted} medidas legislativas adoptadas pueden afectar los marcos regulatorios, las condiciones de mercado y los requisitos de cumplimiento empresarial en los Estados miembros de la UE.',
    impactEconomicNone:
      'La ausencia de textos adoptados en este período limita el impacto económico inmediato de la actividad parlamentaria.',
    impactSocial:
      'Compromiso parlamentario a nivel {activity} con {questions} preguntas presentadas, reflejando la atención legislativa a las preocupaciones ciudadanas y las prioridades de política social.',
    impactLegal:
      '{adopted} textos adoptados avanzan en el proceso legislativo, con posibles implicaciones para los marcos jurídicos de la UE y los requisitos de transposición de los Estados miembros.',
    impactLegalNone:
      'La producción legislativa limitada durante este período reduce el impacto inmediato en los marcos jurídicos.',
    impactGeopolitical:
      'La actividad del Parlamento Europeo a nivel {activity} posiciona a la UE en las discusiones políticas internacionales en curso, particularmente en relación con el comercio, la seguridad y los compromisos medioambientales.',
    activityHigh: 'alto',
    activityModerate: 'moderado',
    activityLimited: 'limitado',
    outlookProductive:
      'El período legislativo {trend} ({dateFrom}–{dateTo}) con {adopted} textos adoptados establece la trayectoria para las próximas sesiones parlamentarias.',
    outlookMeasured:
      'El período legislativo {trend} ({dateFrom}–{dateTo}) con {adopted} textos adoptados establece la trayectoria para las próximas sesiones parlamentarias.',
    outlookNoData:
      'El período {dateFrom}–{dateTo} mostró actividad de votación parlamentaria limitada. Las próximas sesiones probablemente abordarán los asuntos legislativos acumulados, lo que podría conducir a períodos de votación concentrados.',
    outlookAnomalyNote:
      ' Las anomalías de votación detectadas ({anomalies}) justifican un seguimiento ya que pueden señalar dinámicas de coalición en evolución.',
    trendProductive: 'productivo',
    trendMeasured: 'mesurado',
    stakeholderWinnerReason:
      '{group} demostró una fuerte cohesión interna ({pct}%) con alta participación ({participation}%), posibilitando una votación en bloque eficaz.',
    stakeholderLoserReason:
      '{group} mostró división interna con baja cohesión ({pct}%), debilitando su posición de negociación colectiva.',
    stakeholderMajorityActor: 'Coalición mayoritaria',
    stakeholderGroupLeadership: 'Liderazgo de los grupos políticos',
    consequenceAdopted:
      '{result} por {margin} ({for} a favor, {against} en contra, {abstain} abstenciones). Este resultado configura la trayectoria legislativa de esta área política.',
    consequenceAnomaly:
      'La anomalía de votación "{description}" señala posibles cambios en la alineación de grupos políticos, requiriendo el seguimiento del comportamiento de coalición posterior.',
    marginStrong: 'fuerte',
    marginModerate: 'moderado',
    marginNarrow: 'ajustado',
    marginTied: 'empate sin mayoría clara',
    marginFavour: 'mayoría a favor',
    marginAgainst: 'mayoría en contra',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'El liderazgo del grupo podría haber abordado la disidencia interna mediante consultas previas a la votación y enmiendas de compromiso para prevenir el {type} y mantener la cohesión.',
  },
  nl: {
    what: '{records} stemmingen geregistreerd tussen {dateFrom} en {dateTo}: {adopted} aangenomen, {rejected} verworpen. {anomalies} stemanomalieën gedetecteerd in {patterns} fracties. {questions} parlementaire vragen ingediend.',
    whatNoData:
      'Parlementaire activiteit van {dateFrom} tot {dateTo}. Gedetailleerde hoofdelijke stemgegevens zijn niet beschikbaar voor deze periode.',
    whenPeriod: 'Periode: {dateFrom} tot {dateTo}',
    whenVote: '{date}: Stemming over "{title}" — {result}',
    whyPatterns:
      'Stempatronen in {patterns} fracties tonen {cohesionDesc} (gemiddeld {pct}%). Polarisatiebeoordeling: {assessment}. Deze dynamiek weerspiegelt lopende wetgevingsprioriteiten en interfractieonderhandelingen op de huidige parlementaire agenda.',
    whyNoData:
      'Gedetailleerde stempatroongegevens zijn nog niet beschikbaar voor deze periode. Parlementaire activiteit gedurende deze periode weerspiegelt de reguliere wetgevingsagenda.',
    notAvailable: 'Niet beschikbaar',
    cohesionHigh: 'hoge cohesie',
    cohesionModerate: 'gematigde cohesie',
    cohesionFragmented: 'gefragmenteerde standpunten',
    impactPolitical:
      'Fractiedynamiek gevormd door {records} stemmingen — {adopted} aangenomen, {rejected} verworpen.',
    impactPoliticalAnomaly:
      '{anomalies} stemanomalieën signaleren mogelijke coalitieverschuivingen.',
    impactPoliticalStable: 'Stempatronen wijzen op stabiel coalitiegedrag.',
    impactPoliticalNone:
      'Beperkte stemactiviteit gedurende deze periode beperkt de politieke impactbeoordeling.',
    impactEconomic:
      '{adopted} aangenomen wetgevingsmaatregelen kunnen regelgevingskaders, marktomstandigheden en nalevingsvereisten voor bedrijven in de EU-lidstaten beïnvloeden.',
    impactEconomicNone:
      'Geen aangenomen teksten in deze periode beperkt de directe economische impact van parlementaire activiteit.',
    impactSocial:
      'Parlementaire betrokkenheid op {activity} niveau met {questions} ingediende vragen, wat de wetgevingsaandacht voor burgerbelangen en sociaal beleidsprioriteiten weerspiegelt.',
    impactLegal:
      '{adopted} aangenomen teksten vorderen in het wetgevingsproces met mogelijke gevolgen voor het EU-rechtskader en de omzettingsvereisten van lidstaten.',
    impactLegalNone:
      'Beperkte wetgevingsproductie gedurende deze periode vermindert de directe impact op het rechtskader.',
    impactGeopolitical:
      'De activiteit van het Europees Parlement op {activity} niveau positioneert de EU in lopende internationale beleidsdiscussies, met name op het gebied van handel, veiligheid en milieuverplichtingen.',
    activityHigh: 'hoog',
    activityModerate: 'gematigd',
    activityLimited: 'beperkt',
    outlookProductive:
      'De {trend} wetgevingsperiode ({dateFrom}–{dateTo}) met {adopted} aangenomen teksten bepaalt de koers voor komende parlementaire vergaderingen.',
    outlookMeasured:
      'De {trend} wetgevingsperiode ({dateFrom}–{dateTo}) met {adopted} aangenomen teksten bepaalt de koers voor komende parlementaire vergaderingen.',
    outlookNoData:
      'De periode {dateFrom}–{dateTo} toonde beperkte parlementaire stemactiviteit. Komende vergaderingen zullen waarschijnlijk opgestapelde wetgevingsitems behandelen, wat mogelijk tot geconcentreerde stemperioden leidt.',
    outlookAnomalyNote:
      ' Gedetecteerde stemanomalieën ({anomalies}) rechtvaardigen monitoring aangezien zij evolutionaire coalitiedynamiek kunnen signaleren.',
    trendProductive: 'productieve',
    trendMeasured: 'gemeten',
    stakeholderWinnerReason:
      '{group} toonde sterke interne cohesie ({pct}%) met hoge participatie ({participation}%), wat effectieve blokstemming mogelijk maakte.',
    stakeholderLoserReason:
      '{group} toonde interne verdeeldheid met lage cohesie ({pct}%), wat hun collectieve onderhandelingspositie verzwakte.',
    stakeholderMajorityActor: 'Meerderheidscoalitie',
    stakeholderGroupLeadership: 'Fractieleiding',
    consequenceAdopted:
      '{result} met {margin} ({for} voor, {against} tegen, {abstain} onthoudingen). Dit resultaat bepaalt de wetgevingstrajectorie van dit beleidsterrein.',
    consequenceAnomaly:
      'De stemanomalie "{description}" signaleert mogelijke verschuivingen in fractieafstemming, wat monitoring van het daaropvolgende coalitiegedrag vereist.',
    marginStrong: 'sterk',
    marginModerate: 'gematigd',
    marginNarrow: 'nipt',
    marginTied: 'gelijke stemmen zonder duidelijke meerderheid',
    marginFavour: 'meerderheid voor',
    marginAgainst: 'meerderheid tegen',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'Het fractieleiderschap had interne onenigheid kunnen aanpakken door voorafgaande consultaties en compromisamendementen om {type} te voorkomen en de cohesie te behouden.',
  },
  ar: {
    what: '{records} تصويت مسجل بين {dateFrom} و{dateTo}: {adopted} معتمد، {rejected} مرفوض. {anomalies} حالة شاذة في التصويت مكتشفة عبر {patterns} مجموعة سياسية. {questions} سؤال برلماني مقدم.',
    whatNoData:
      'النشاط البرلماني من {dateFrom} إلى {dateTo}. بيانات التصويت بنداء الأسماء التفصيلية غير متاحة لهذه الفترة.',
    whenPeriod: 'الفترة: {dateFrom} إلى {dateTo}',
    whenVote: '{date}: تصويت على "{title}" — {result}',
    whyPatterns:
      'أنماط التصويت عبر {patterns} مجموعة سياسية تُظهر {cohesionDesc} (متوسط {pct}%). تقييم الاستقطاب: {assessment}. تعكس هذه الديناميكيات أولويات التشريع الجارية والمفاوضات بين المجموعات في جدول الأعمال البرلماني الحالي.',
    whyNoData:
      'بيانات أنماط التصويت التفصيلية ليست متاحة بعد لهذه الفترة. يعكس النشاط البرلماني خلال هذه الفترة جدول الأعمال التشريعي المعتاد.',
    notAvailable: 'غير متوفر',
    cohesionHigh: 'تماسك عالٍ',
    cohesionModerate: 'تماسك معتدل',
    cohesionFragmented: 'مواقف مجزأة',
    impactPolitical:
      'ديناميكيات المجموعات السياسية شكّلتها {records} تصويت — {adopted} معتمد، {rejected} مرفوض.',
    impactPoliticalAnomaly: '{anomalies} حالة شاذة في التصويت تشير إلى تحولات ائتلافية محتملة.',
    impactPoliticalStable: 'أنماط التصويت تشير إلى سلوك ائتلافي مستقر.',
    impactPoliticalNone: 'النشاط التصويتي المحدود خلال هذه الفترة يقيّد تقييم الأثر السياسي.',
    impactEconomic:
      '{adopted} إجراء تشريعي معتمد قد يؤثر على الأطر التنظيمية وظروف السوق ومتطلبات امتثال الشركات في الدول الأعضاء في الاتحاد الأوروبي.',
    impactEconomicNone:
      'عدم وجود نصوص معتمدة في هذه الفترة يحد من الأثر الاقتصادي المباشر للنشاط البرلماني.',
    impactSocial:
      'المشاركة البرلمانية عند مستوى {activity} مع {questions} سؤال مقدم، مما يعكس الاهتمام التشريعي بمخاوف المواطنين وأولويات السياسة الاجتماعية.',
    impactLegal:
      '{adopted} نص معتمد يتقدم عبر العملية التشريعية مع آثار محتملة على الأطر القانونية للاتحاد الأوروبي ومتطلبات التحويل في الدول الأعضاء.',
    impactLegalNone:
      'الإنتاج التشريعي المحدود خلال هذه الفترة يقلل من الأثر المباشر على الأطر القانونية.',
    impactGeopolitical:
      'نشاط البرلمان الأوروبي عند مستوى {activity} يضع الاتحاد الأوروبي في المناقشات السياسية الدولية الجارية، لا سيما فيما يتعلق بالتجارة والأمن والالتزامات البيئية.',
    activityHigh: 'مرتفع',
    activityModerate: 'معتدل',
    activityLimited: 'محدود',
    outlookProductive:
      'الفترة التشريعية {trend} ({dateFrom}–{dateTo}) مع {adopted} نص معتمد ترسم المسار للجلسات البرلمانية القادمة.',
    outlookMeasured:
      'الفترة التشريعية {trend} ({dateFrom}–{dateTo}) مع {adopted} نص معتمد ترسم المسار للجلسات البرلمانية القادمة.',
    outlookNoData:
      'أظهرت الفترة {dateFrom}–{dateTo} نشاط تصويت برلماني محدوداً. من المرجح أن تعالج الجلسات القادمة البنود التشريعية المتراكمة، مما قد يؤدي إلى فترات تصويت مكثفة.',
    outlookAnomalyNote:
      ' الحالات الشاذة في التصويت المكتشفة ({anomalies}) تستدعي المراقبة لأنها قد تشير إلى ديناميكيات ائتلافية متطورة.',
    trendProductive: 'المنتجة',
    trendMeasured: 'المتوازنة',
    stakeholderWinnerReason:
      'أظهرت {group} تماسكاً داخلياً قوياً ({pct}%) مع مشاركة عالية ({participation}%)، مما مكّن من تصويت كتلة فعال.',
    stakeholderLoserReason:
      'أظهرت {group} انقساماً داخلياً بتماسك منخفض ({pct}%)، مما أضعف موقفهم التفاوضي الجماعي.',
    stakeholderMajorityActor: 'ائتلاف الأغلبية',
    stakeholderGroupLeadership: 'قيادة المجموعات السياسية',
    consequenceAdopted:
      '{result} بـ{margin} ({for} مؤيد، {against} معارض، {abstain} ممتنع). يشكّل هذا الناتج المسار التشريعي لهذا المجال السياسي.',
    consequenceAnomaly:
      'الحالة الشاذة في التصويت "{description}" تشير إلى تحولات محتملة في توافق المجموعات السياسية، مما يستدعي مراقبة سلوك الائتلاف اللاحق.',
    marginStrong: 'قوي',
    marginModerate: 'معتدل',
    marginNarrow: 'ضيق',
    marginTied: 'تعادل في الأصوات بدون أغلبية واضحة',
    marginFavour: 'أغلبية مؤيدة',
    marginAgainst: 'أغلبية معارضة',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'كان بإمكان قيادة المجموعة معالجة الخلاف الداخلي من خلال مشاورات ما قبل التصويت وتعديلات توافقية لمنع {type} والحفاظ على التماسك.',
  },
  he: {
    what: '{records} הצבעות נרשמו בין {dateFrom} ל-{dateTo}: {adopted} אושרו, {rejected} נדחו. {anomalies} חריגות הצבעה זוהו ב-{patterns} סיעות פוליטיות. {questions} שאילתות פרלמנטריות הוגשו.',
    whatNoData:
      'פעילות פרלמנטרית מ-{dateFrom} עד {dateTo}. נתוני הצבעה שמית מפורטים אינם זמינים לתקופה זו.',
    whenPeriod: 'תקופה: {dateFrom} עד {dateTo}',
    whenVote: '{date}: הצבעה על "{title}" — {result}',
    whyPatterns:
      'דפוסי הצבעה ב-{patterns} סיעות פוליטיות מראים {cohesionDesc} (ממוצע {pct}%). הערכת קיטוב: {assessment}. דינמיקה זו משקפת עדיפויות חקיקה מתמשכות ומשא ומתן בין-סיעתי בסדר היום הפרלמנטרי הנוכחי.',
    whyNoData:
      'נתוני דפוסי הצבעה מפורטים אינם זמינים עדיין לתקופה זו. הפעילות הפרלמנטרית בתקופה זו משקפת את סדר היום החקיקתי הרגיל.',
    notAvailable: 'לא זמין',
    cohesionHigh: 'לכידות גבוהה',
    cohesionModerate: 'לכידות מתונה',
    cohesionFragmented: 'עמדות מפוצלות',
    impactPolitical:
      'דינמיקת סיעות פוליטיות עוצבה על ידי {records} הצבעות — {adopted} אושרו, {rejected} נדחו.',
    impactPoliticalAnomaly: '{anomalies} חריגות הצבעה מסמנות שינויי קואליציה אפשריים.',
    impactPoliticalStable: 'דפוסי הצבעה מצביעים על התנהגות קואליציונית יציבה.',
    impactPoliticalNone: 'פעילות הצבעה מוגבלת בתקופה זו מגבילה את הערכת ההשפעה הפוליטית.',
    impactEconomic:
      '{adopted} צעדי חקיקה מאושרים עשויים להשפיע על מסגרות רגולטוריות, תנאי שוק ודרישות תאימות עסקית במדינות החברות באיחוד האירופי.',
    impactEconomicNone:
      'היעדר טקסטים מאושרים בתקופה זו מגביל את ההשפעה הכלכלית המיידית של הפעילות הפרלמנטרית.',
    impactSocial:
      'מעורבות פרלמנטרית ברמה {activity} עם {questions} שאילתות שהוגשו, המשקפת תשומת לב חקיקתית לדאגות אזרחים ולעדיפויות מדיניות חברתית.',
    impactLegal:
      '{adopted} טקסטים מאושרים מתקדמים בתהליך החקיקתי עם השלכות אפשריות על מסגרות משפטיות של האיחוד האירופי ודרישות היישום של מדינות חברות.',
    impactLegalNone: 'תפוקה חקיקתית מוגבלת בתקופה זו מפחיתה את ההשפעה המיידית על מסגרות משפטיות.',
    impactGeopolitical:
      'פעילות הפרלמנט האירופי ברמה {activity} ממצבת את האיחוד האירופי בדיונים בינלאומיים מתמשכים בנושאי מדיניות, בפרט בנוגע לסחר, ביטחון והתחייבויות סביבתיות.',
    activityHigh: 'גבוהה',
    activityModerate: 'מתונה',
    activityLimited: 'מוגבלת',
    outlookProductive:
      'תקופת החקיקה ה{trend} ({dateFrom}–{dateTo}) עם {adopted} טקסטים מאושרים קובעת את המסלול למושבים הפרלמנטריים הקרובים.',
    outlookMeasured:
      'תקופת החקיקה ה{trend} ({dateFrom}–{dateTo}) עם {adopted} טקסטים מאושרים קובעת את המסלול למושבים הפרלמנטריים הקרובים.',
    outlookNoData:
      'התקופה {dateFrom}–{dateTo} הראתה פעילות הצבעה פרלמנטרית מוגבלת. מושבים קרובים צפויים לטפל בסעיפי חקיקה שנצברו, מה שעשוי להוביל לתקופות הצבעה מרוכזות.',
    outlookAnomalyNote:
      ' חריגות הצבעה שזוהו ({anomalies}) מצדיקות ניטור מכיוון שהן עשויות לסמן דינמיקת קואליציה מתפתחת.',
    trendProductive: 'פרודוקטיבית',
    trendMeasured: 'מדודה',
    stakeholderWinnerReason:
      '{group} הפגינה לכידות פנימית חזקה ({pct}%) עם השתתפות גבוהה ({participation}%), שאפשרה הצבעת גוש יעילה.',
    stakeholderLoserReason:
      '{group} הראתה פיצול פנימי עם לכידות נמוכה ({pct}%), שהחלישה את עמדת המיקוח הקולקטיבית שלהם.',
    stakeholderMajorityActor: 'קואליציית הרוב',
    stakeholderGroupLeadership: 'הנהגת הסיעות הפוליטיות',
    consequenceAdopted:
      '{result} ב-{margin} ({for} בעד, {against} נגד, {abstain} נמנעים). תוצאה זו מעצבת את המסלול החקיקתי של תחום מדיניות זה.',
    consequenceAnomaly:
      'חריגת ההצבעה "{description}" מסמנת שינויים אפשריים בהתאמה של סיעות פוליטיות, המחייבת ניטור של התנהגות קואליציונית עוקבת.',
    marginStrong: 'חזק',
    marginModerate: 'מתון',
    marginNarrow: 'צר',
    marginTied: 'שוויון קולות ללא רוב ברור',
    marginFavour: 'רוב בעד',
    marginAgainst: 'רוב נגד',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      'הנהגת הסיעה יכלה לטפל במחלוקת פנימית באמצעות התייעצויות טרום-הצבעה ותיקוני פשרה למניעת {type} ולשמירה על הלכידות.',
  },
  ja: {
    what: '{dateFrom}から{dateTo}の間に{records}件の投票が記録されました：{adopted}件採択、{rejected}件否決。{patterns}の政治グループにわたり{anomalies}件の投票異常が検出されました。{questions}件の議会質問が提出されました。',
    whatNoData:
      '{dateFrom}から{dateTo}の議会活動。この期間の詳細な記名投票データは利用できません。',
    whenPeriod: '期間：{dateFrom}から{dateTo}',
    whenVote: '{date}：「{title}」に関する投票 — {result}',
    whyPatterns:
      '{patterns}の政治グループにわたる投票パターンは{cohesionDesc}（平均{pct}%）を示しています。分極化評価：{assessment}。これらの動態は、現在の議会議題における進行中の立法優先事項とグループ間交渉を反映しています。',
    whyNoData:
      'この期間の詳細な投票パターンデータはまだ利用できません。この期間の議会活動は通常の立法議題を反映しています。',
    notAvailable: '該当なし',
    cohesionHigh: '高い結束',
    cohesionModerate: '中程度の結束',
    cohesionFragmented: '断片化した立場',
    impactPolitical:
      '{records}件の投票によって形成された政治グループの動態 — {adopted}件採択、{rejected}件否決。',
    impactPoliticalAnomaly: '{anomalies}件の投票異常は潜在的な連立変動を示唆しています。',
    impactPoliticalStable: '投票パターンは安定した連立行動を示しています。',
    impactPoliticalNone: 'この期間の限定的な投票活動は、政治的影響評価を制約しています。',
    impactEconomic:
      '{adopted}件の採択された立法措置は、EU加盟国全体の規制枠組み、市場環境、企業コンプライアンス要件に影響を与える可能性があります。',
    impactEconomicNone:
      'この期間に採択されたテキストがないため、議会活動からの即時的な経済的影響は限定的です。',
    impactSocial:
      '{activity}レベルの議会関与と{questions}件の提出された質問は、市民の関心事項と社会政策優先事項への立法的注意を反映しています。',
    impactLegal:
      '{adopted}件の採択されたテキストは、EU法的枠組みと加盟国の国内法化要件に潜在的な影響を伴いながら立法プロセスを進んでいます。',
    impactLegalNone: 'この期間の限定的な立法産出は、法的枠組みへの即時的な影響を減少させています。',
    impactGeopolitical:
      '欧州議会の{activity}レベルの活動は、特に貿易、安全保障、環境コミットメントに関する進行中の国際政策議論においてEUを位置づけています。',
    activityHigh: '高い',
    activityModerate: '中程度',
    activityLimited: '限定的',
    outlookProductive:
      '{trend}立法期間（{dateFrom}–{dateTo}）における{adopted}件の採択テキストは、今後の議会会期の方向性を定めています。',
    outlookMeasured:
      '{trend}立法期間（{dateFrom}–{dateTo}）における{adopted}件の採択テキストは、今後の議会会期の方向性を定めています。',
    outlookNoData:
      '{dateFrom}–{dateTo}の期間は限定的な議会投票活動を示しました。今後の会期では蓄積された立法事項が処理される可能性が高く、集中的な投票期間につながる可能性があります。',
    outlookAnomalyNote:
      ' 検出された投票異常（{anomalies}件）は、進化する連立動態を示唆する可能性があるため、監視が必要です。',
    trendProductive: '生産的な',
    trendMeasured: '慎重な',
    stakeholderWinnerReason:
      '{group}は高い参加率（{participation}%）とともに強い内部結束（{pct}%）を示し、効果的なブロック投票を可能にしました。',
    stakeholderLoserReason:
      '{group}は低い結束（{pct}%）で内部分裂を示し、集団的交渉力を弱めました。',
    stakeholderMajorityActor: '多数派連立',
    stakeholderGroupLeadership: '政治グループ指導部',
    consequenceAdopted:
      '{result}、{margin}（賛成{for}、反対{against}、棄権{abstain}）。この結果はこの政策分野の立法的軌道を形成します。',
    consequenceAnomaly:
      '投票異常「{description}」は政治グループの連携における潜在的な変化を示唆しており、その後の連立行動の監視が必要です。',
    marginStrong: '強い',
    marginModerate: '中程度',
    marginNarrow: '僅差',
    marginTied: '明確な多数のない同数',
    marginFavour: '賛成多数',
    marginAgainst: '反対多数',
    mistakeDescription: '{type}：{description}',
    mistakeAlternative:
      'グループ指導部は事前協議と妥協修正案を通じて内部の異論に対処し、{type}を防止して結束を維持することができたはずです。',
  },
  ko: {
    what: '{dateFrom}부터 {dateTo}까지 {records}건의 투표가 기록되었습니다: {adopted}건 채택, {rejected}건 부결. {patterns}개 정치 그룹에서 {anomalies}건의 투표 이상이 감지되었습니다. {questions}건의 의회 질의가 제출되었습니다.',
    whatNoData:
      '{dateFrom}부터 {dateTo}까지의 의회 활동. 이 기간의 상세한 기명 투표 데이터는 이용할 수 없습니다.',
    whenPeriod: '기간: {dateFrom}부터 {dateTo}까지',
    whenVote: '{date}: "{title}"에 대한 투표 — {result}',
    whyPatterns:
      '{patterns}개 정치 그룹의 투표 패턴은 {cohesionDesc}(평균 {pct}%)를 보여줍니다. 양극화 평가: {assessment}. 이러한 역학은 현재 의회 의제에서 진행 중인 입법 우선순위와 그룹 간 협상을 반영합니다.',
    whyNoData:
      '이 기간의 상세한 투표 패턴 데이터는 아직 이용할 수 없습니다. 이 기간의 의회 활동은 표준 입법 의제를 반영합니다.',
    notAvailable: '해당 없음',
    cohesionHigh: '높은 응집력',
    cohesionModerate: '중간 수준의 응집력',
    cohesionFragmented: '분열된 입장',
    impactPolitical:
      '{records}건의 투표로 형성된 정치 그룹 역학 — {adopted}건 채택, {rejected}건 부결.',
    impactPoliticalAnomaly: '{anomalies}건의 투표 이상은 잠재적인 연합 변화를 시사합니다.',
    impactPoliticalStable: '투표 패턴은 안정적인 연합 행동을 나타냅니다.',
    impactPoliticalNone: '이 기간의 제한적인 투표 활동은 정치적 영향 평가를 제한합니다.',
    impactEconomic:
      '{adopted}건의 채택된 입법 조치는 EU 회원국 전체의 규제 프레임워크, 시장 조건 및 기업 준수 요구 사항에 영향을 미칠 수 있습니다.',
    impactEconomicNone:
      '이 기간에 채택된 텍스트가 없어 의회 활동의 즉각적인 경제적 영향이 제한됩니다.',
    impactSocial:
      '{activity} 수준의 의회 참여와 {questions}건의 제출된 질의는 시민 관심사항과 사회 정책 우선순위에 대한 입법적 관심을 반영합니다.',
    impactLegal:
      '{adopted}건의 채택된 텍스트는 EU 법적 프레임워크와 회원국 국내법 전환 요구 사항에 잠재적 영향을 미치며 입법 과정을 진행합니다.',
    impactLegalNone:
      '이 기간의 제한적인 입법 산출은 법적 프레임워크에 대한 즉각적인 영향을 줄입니다.',
    impactGeopolitical:
      '유럽의회의 {activity} 수준 활동은 특히 무역, 안보 및 환경 약속과 관련하여 진행 중인 국제 정책 논의에서 EU를 자리매김합니다.',
    activityHigh: '높은',
    activityModerate: '중간',
    activityLimited: '제한적인',
    outlookProductive:
      '{trend} 입법 기간({dateFrom}–{dateTo})에서 {adopted}건의 채택 텍스트는 향후 의회 회기의 궤적을 설정합니다.',
    outlookMeasured:
      '{trend} 입법 기간({dateFrom}–{dateTo})에서 {adopted}건의 채택 텍스트는 향후 의회 회기의 궤적을 설정합니다.',
    outlookNoData:
      '{dateFrom}–{dateTo} 기간은 제한적인 의회 투표 활동을 보였습니다. 향후 회기에서는 축적된 입법 항목을 다룰 가능성이 높으며, 이는 잠재적으로 집중적인 투표 기간으로 이어질 수 있습니다.',
    outlookAnomalyNote:
      ' 감지된 투표 이상({anomalies}건)은 진화하는 연합 역학을 시사할 수 있으므로 모니터링이 필요합니다.',
    trendProductive: '생산적인',
    trendMeasured: '신중한',
    stakeholderWinnerReason:
      '{group}은(는) 높은 참여율({participation}%)과 함께 강한 내부 응집력({pct}%)을 보여 효과적인 블록 투표를 가능하게 했습니다.',
    stakeholderLoserReason:
      '{group}은(는) 낮은 응집력({pct}%)으로 내부 분열을 보여 집단적 협상 위치를 약화시켰습니다.',
    stakeholderMajorityActor: '다수파 연합',
    stakeholderGroupLeadership: '정치 그룹 지도부',
    consequenceAdopted:
      '{result}, {margin}({for} 찬성, {against} 반대, {abstain} 기권). 이 결과는 이 정책 영역의 입법적 궤적을 형성합니다.',
    consequenceAnomaly:
      '투표 이상 "{description}"은(는) 정치 그룹 정렬의 잠재적 변화를 시사하며, 이후 연합 행동의 모니터링이 필요합니다.',
    marginStrong: '강한',
    marginModerate: '중간',
    marginNarrow: '근소한',
    marginTied: '명확한 다수 없는 동점',
    marginFavour: '찬성 다수',
    marginAgainst: '반대 다수',
    mistakeDescription: '{type}: {description}',
    mistakeAlternative:
      '그룹 지도부는 사전 투표 협의와 타협 수정안을 통해 내부 이견을 해결하여 {type}을(를) 방지하고 응집력을 유지할 수 있었습니다.',
  },
  zh: {
    what: '{dateFrom}至{dateTo}期间记录了{records}次投票：{adopted}项通过，{rejected}项否决。在{patterns}个政治团体中检测到{anomalies}项投票异常。提交了{questions}项议会质询。',
    whatNoData: '{dateFrom}至{dateTo}的议会活动。该期间的详细记名投票数据不可用。',
    whenPeriod: '期间：{dateFrom}至{dateTo}',
    whenVote: '{date}：关于"{title}"的投票 — {result}',
    whyPatterns:
      '{patterns}个政治团体的投票模式显示{cohesionDesc}（平均{pct}%）。极化评估：{assessment}。这些动态反映了当前议会议程中正在进行的立法优先事项和团体间谈判。',
    whyNoData: '该期间的详细投票模式数据尚不可用。该期间的议会活动反映了常规立法议程。',
    notAvailable: '不适用',
    cohesionHigh: '高度凝聚',
    cohesionModerate: '中度凝聚',
    cohesionFragmented: '立场分裂',
    impactPolitical: '{records}次投票塑造了政治团体动态 — {adopted}项通过，{rejected}项否决。',
    impactPoliticalAnomaly: '{anomalies}项投票异常信号表明潜在的联盟转变。',
    impactPoliticalStable: '投票模式表明联盟行为稳定。',
    impactPoliticalNone: '该期间有限的投票活动限制了政治影响评估。',
    impactEconomic:
      '{adopted}项通过的立法措施可能影响欧盟成员国的监管框架、市场条件和企业合规要求。',
    impactEconomicNone: '该期间没有通过的文本，限制了议会活动的直接经济影响。',
    impactSocial:
      '议会参与处于{activity}水平，提交了{questions}项质询，反映了对公民关切和社会政策优先事项的立法关注。',
    impactLegal:
      '{adopted}项通过的文本在立法程序中推进，对欧盟法律框架和成员国转化要求具有潜在影响。',
    impactLegalNone: '该期间有限的立法产出减少了对法律框架的直接影响。',
    impactGeopolitical:
      '欧洲议会在{activity}水平的活动将欧盟定位于正在进行的国际政策讨论中，特别是在贸易、安全和环境承诺方面。',
    activityHigh: '高',
    activityModerate: '中等',
    activityLimited: '有限',
    outlookProductive:
      '{trend}立法期间（{dateFrom}–{dateTo}）通过了{adopted}项文本，为即将到来的议会会议确定了方向。',
    outlookMeasured:
      '{trend}立法期间（{dateFrom}–{dateTo}）通过了{adopted}项文本，为即将到来的议会会议确定了方向。',
    outlookNoData:
      '{dateFrom}–{dateTo}期间显示了有限的议会投票活动。即将到来的会议可能会处理积累的立法事项，这可能导致集中的投票期。',
    outlookAnomalyNote:
      ' 检测到的投票异常（{anomalies}项）值得监测，因为它们可能表明不断演变的联盟动态。',
    trendProductive: '高效的',
    trendMeasured: '审慎的',
    stakeholderWinnerReason:
      '{group}展示了强大的内部凝聚力（{pct}%），参与率高（{participation}%），实现了有效的集团投票。',
    stakeholderLoserReason: '{group}显示了内部分裂，凝聚力低（{pct}%），削弱了其集体谈判地位。',
    stakeholderMajorityActor: '多数联盟',
    stakeholderGroupLeadership: '政治团体领导层',
    consequenceAdopted:
      '{result}，以{margin}（{for}赞成，{against}反对，{abstain}弃权）。这一结果塑造了该政策领域的立法轨迹。',
    consequenceAnomaly:
      '投票异常"{description}"信号表明政治团体联盟可能发生变化，需要监测后续联盟行为。',
    marginStrong: '强',
    marginModerate: '中等',
    marginNarrow: '微弱',
    marginTied: '票数持平，无明确多数',
    marginFavour: '多数赞成',
    marginAgainst: '多数反对',
    mistakeDescription: '{type}：{description}',
    mistakeAlternative:
      '团体领导层本可以通过投票前协商和妥协修正案来解决内部异议，以防止{type}并维护凝聚力。',
  },
};

export const PROSPECTIVE_ANALYSIS_CONTENT_STRINGS: LanguageMap<ProspectiveAnalysisContentStrings> =
  {
    en: {
      what: 'European Parliament {label} ahead ({start} to {end}): {events} plenary events, {committees} committee meetings, {documents} legislative documents, {pipeline} pipeline procedures, {questions} parliamentary questions scheduled.',
      whenPeriod: 'Period: {start} to {end}',
      whyActive:
        'The upcoming {label} features {events} parliamentary events including {committees} committee meetings, reflecting the current legislative programme.',
      whyBottleneck:
        '{bottlenecks} procedures face bottleneck conditions requiring political coordination.',
      whyNoBottleneck: 'No critical bottlenecks identified in the legislative pipeline.',
      whyReduced:
        'Reduced parliamentary activity for the coming {label} — {events} events scheduled, suggesting a lighter agenda or recess period.',
      impactPolitical: '{events} scheduled events will shape political group positioning.',
      impactPoliticalBottleneck:
        'Key pressure points include {bottlenecks} bottlenecked procedure(s).',
      impactPoliticalStable: 'Stable coalition dynamics expected.',
      impactEconomic:
        '{documents} legislative documents and {pipeline} pipeline procedures may impact economic regulation and market frameworks in the coming {label}.',
      impactSocial:
        'Parliamentary agenda includes {questions} filed questions reflecting citizen and NGO advocacy on social policy priorities.',
      impactLegal:
        '{pipeline} active legislative procedures continue through the EU co-decision process, with potential implications for legal frameworks.',
      impactGeopolitical:
        "European Parliament activity during this {label} contributes to the EU's legislative capacity and international positioning on policy commitments.",
      outlookActive:
        'The upcoming {label} ({start}–{end}) features {events} events and {pipeline} pipeline procedures. Likely scenario: productive committee work advancing key files.',
      outlookBottleneckNote:
        'Possible scenario: breakthrough on {bottlenecks} bottlenecked procedure(s) through renewed negotiations.',
      outlookNoBottleneckNote:
        'Possible scenario: introduction of new legislative proposals expanding the policy agenda.',
      outlookReduced:
        'Light parliamentary schedule for {start}–{end}. Likely scenario: focus shifts to inter-institutional negotiations and informal consultations.',
      stakeholderBottleneckReason:
        '{bottlenecks} procedure(s) in bottleneck status may delay legislative progress and require additional negotiation rounds.',
      stakeholderCommitteeReason:
        '{committees} committees active this {label}, maintaining standard workload distribution across parliamentary bodies.',
      consequenceBottleneck:
        'Continued bottleneck at {stage} stage risks delay in legislative completion, potentially requiring expedited procedures or inter-institutional negotiations.',
      consequenceEvent:
        'Scheduled {type} on "{title}" will advance this policy area through the parliamentary process, influencing future voting and amendment cycles.',
      mistakeActor: 'Legislative coordinators',
      mistakeDescription: '"{title}" has reached bottleneck status at {stage} stage',
      mistakeAlternative:
        'Earlier cross-party pre-negotiation and structured rapporteur consultations could have prevented bottleneck status on "{title}".',
    },
    sv: {
      what: 'Europaparlamentets {label} framåt ({start} till {end}): {events} plenarsammanträden, {committees} utskottsmöten, {documents} lagstiftningsdokument, {pipeline} pipelineförfaranden, {questions} parlamentariska frågor planerade.',
      whenPeriod: 'Period: {start} till {end}',
      whyActive:
        'Den kommande {label} omfattar {events} parlamentariska händelser inklusive {committees} utskottsmöten, vilket återspeglar det aktuella lagstiftningsprogrammet.',
      whyBottleneck:
        '{bottlenecks} förfaranden står inför flaskhalsförhållanden som kräver politisk samordning.',
      whyNoBottleneck: 'Inga kritiska flaskhalsar identifierade i lagstiftningspipelinen.',
      whyReduced:
        'Minskad parlamentarisk aktivitet för den kommande {label} — {events} händelser planerade, vilket antyder en lättare dagordning eller uppehållsperiod.',
      impactPolitical:
        '{events} planerade händelser kommer att forma politiska gruppers positionering.',
      impactPoliticalBottleneck:
        'Viktiga tryckpunkter inkluderar {bottlenecks} flaskhalsförfarande(n).',
      impactPoliticalStable: 'Stabil koalitionsdynamik förväntas.',
      impactEconomic:
        '{documents} lagstiftningsdokument och {pipeline} pipelineförfaranden kan påverka ekonomisk reglering och marknadsramar under den kommande {label}.',
      impactSocial:
        'Den parlamentariska dagordningen inkluderar {questions} inlämnade frågor som återspeglar medborgares och icke-statliga organisationers opinionsbildning om socialpolitiska prioriteringar.',
      impactLegal:
        '{pipeline} aktiva lagstiftningsförfaranden fortsätter genom EU:s medbeslutandeförfarande med potentiella konsekvenser för rättsliga ramar.',
      impactGeopolitical:
        'Europaparlamentets verksamhet under denna {label} bidrar till EU:s lagstiftningskapacitet och internationella positionering i policyfrågor.',
      outlookActive:
        'Den kommande {label} ({start}–{end}) omfattar {events} händelser och {pipeline} pipelineförfaranden. Troligt scenario: produktivt utskottsarbete som driver viktiga ärenden framåt.',
      outlookBottleneckNote:
        'Möjligt scenario: genombrott i {bottlenecks} flaskhalsförfarande(n) genom förnyade förhandlingar.',
      outlookNoBottleneckNote:
        'Möjligt scenario: införande av nya lagstiftningsförslag som utvidgar den politiska dagordningen.',
      outlookReduced:
        'Lätt parlamentariskt schema för {start}–{end}. Troligt scenario: fokus skiftar till interinstitutionella förhandlingar och informella samråd.',
      stakeholderBottleneckReason:
        '{bottlenecks} förfarande(n) i flaskhalsläge kan fördröja lagstiftningsframsteg och kräva ytterligare förhandlingsomgångar.',
      stakeholderCommitteeReason:
        '{committees} utskott aktiva denna {label}, vilket upprätthåller standardmässig arbetsbelastningsfördelning mellan parlamentariska organ.',
      consequenceBottleneck:
        'Fortsatt flaskhals vid {stage}-stadiet riskerar att fördröja lagstiftningens slutförande, vilket potentiellt kräver påskyndade förfaranden eller interinstitutionella förhandlingar.',
      consequenceEvent:
        'Planerad {type} om "{title}" kommer att föra detta politikområde framåt genom den parlamentariska processen och påverka framtida omröstnings- och ändringscykler.',
      mistakeActor: 'Lagstiftningssamordnare',
      mistakeDescription: '"{title}" har nått flaskhalsläge vid {stage}-stadiet',
      mistakeAlternative:
        'Tidigare tvärpolitiska förförhandlingar och strukturerade föredragandesamråd kunde ha förhindrat flaskhalsläge för "{title}".',
    },
    da: {
      what: 'Europa-Parlamentets {label} fremad ({start} til {end}): {events} plenarsamlinger, {committees} udvalgsmøder, {documents} lovgivningsdokumenter, {pipeline} pipelineprocedurer, {questions} parlamentariske spørgsmål planlagt.',
      whenPeriod: 'Periode: {start} til {end}',
      whyActive:
        'Den kommende {label} omfatter {events} parlamentariske begivenheder, herunder {committees} udvalgsmøder, der afspejler det aktuelle lovgivningsprogram.',
      whyBottleneck:
        '{bottlenecks} procedurer står over for flaskehalsforhold, der kræver politisk koordinering.',
      whyNoBottleneck: 'Ingen kritiske flaskehalse identificeret i lovgivningspipelinen.',
      whyReduced:
        'Reduceret parlamentarisk aktivitet for den kommende {label} — {events} begivenheder planlagt, hvilket antyder en lettere dagsorden eller ferieperiode.',
      impactPolitical:
        '{events} planlagte begivenheder vil forme politiske gruppers positionering.',
      impactPoliticalBottleneck:
        'Vigtige trykpunkter inkluderer {bottlenecks} flaskehals-procedure(r).',
      impactPoliticalStable: 'Stabil koalitionsdynamik forventes.',
      impactEconomic:
        '{documents} lovgivningsdokumenter og {pipeline} pipelineprocedurer kan påvirke økonomisk regulering og markedsrammer i den kommende {label}.',
      impactSocial:
        "Den parlamentariske dagsorden inkluderer {questions} indgivne spørgsmål, der afspejler borgernes og NGO'ers fortalervirksomhed inden for socialpolitiske prioriteter.",
      impactLegal:
        "{pipeline} aktive lovgivningsprocedurer fortsætter gennem EU's fælles beslutningsprocedure med potentielle konsekvenser for retlige rammer.",
      impactGeopolitical:
        "Europa-Parlamentets aktivitet i denne {label} bidrager til EU's lovgivningskapacitet og internationale positionering i politiske forpligtelser.",
      outlookActive:
        'Den kommende {label} ({start}–{end}) omfatter {events} begivenheder og {pipeline} pipelineprocedurer. Sandsynligt scenario: produktivt udvalgsarbejde, der fremmer vigtige sager.',
      outlookBottleneckNote:
        'Muligt scenario: gennembrud i {bottlenecks} flaskehals-procedure(r) gennem fornyede forhandlinger.',
      outlookNoBottleneckNote:
        'Muligt scenario: introduktion af nye lovgivningsforslag, der udvider den politiske dagsorden.',
      outlookReduced:
        'Let parlamentarisk program for {start}–{end}. Sandsynligt scenario: fokus skifter til interinstitutionelle forhandlinger og uformelle konsultationer.',
      stakeholderBottleneckReason:
        '{bottlenecks} procedure(r) i flaskehalsstatus kan forsinke lovgivningsfremdrift og kræve yderligere forhandlingsrunder.',
      stakeholderCommitteeReason:
        '{committees} udvalg aktive denne {label}, hvilket opretholder standardarbejdsbelastningsfordeling på tværs af parlamentariske organer.',
      consequenceBottleneck:
        'Fortsat flaskehals ved {stage}-stadiet risikerer at forsinke lovgivningens fuldførelse, hvilket potentielt kræver hasteprocedurer eller interinstitutionelle forhandlinger.',
      consequenceEvent:
        'Planlagt {type} om "{title}" vil fremme dette politikområde gennem den parlamentariske proces og påvirke fremtidige afstemnings- og ændringscyklusser.',
      mistakeActor: 'Lovgivningskoordinatorer',
      mistakeDescription: '"{title}" har nået flaskehalsstatus ved {stage}-stadiet',
      mistakeAlternative:
        'Tidligere tværpolitiske forforhandlinger og strukturerede ordførerkonsultationer kunne have forhindret flaskehalsstatus for "{title}".',
    },
    no: {
      what: 'Europaparlamentets {label} fremover ({start} til {end}): {events} plenarhendelser, {committees} utvalgsmøter, {documents} lovgivningsdokumenter, {pipeline} pipelineprosedyrer, {questions} parlamentariske spørsmål planlagt.',
      whenPeriod: 'Periode: {start} til {end}',
      whyActive:
        'Den kommende {label} omfatter {events} parlamentariske hendelser inkludert {committees} utvalgsmøter, som gjenspeiler det nåværende lovgivningsprogrammet.',
      whyBottleneck:
        '{bottlenecks} prosedyrer står overfor flaskehalsforhold som krever politisk samordning.',
      whyNoBottleneck: 'Ingen kritiske flaskehalser identifisert i lovgivningspipelinen.',
      whyReduced:
        'Redusert parlamentarisk aktivitet for den kommende {label} — {events} hendelser planlagt, noe som antyder en lettere dagsorden eller ferieperiode.',
      impactPolitical: '{events} planlagte hendelser vil forme politiske gruppers posisjonering.',
      impactPoliticalBottleneck:
        'Viktige trykkpunkter inkluderer {bottlenecks} flaskehalsprosedyre(r).',
      impactPoliticalStable: 'Stabil koalisjonsdynamikk forventes.',
      impactEconomic:
        '{documents} lovgivningsdokumenter og {pipeline} pipelineprosedyrer kan påvirke økonomisk regulering og markedsrammer i den kommende {label}.',
      impactSocial:
        'Den parlamentariske dagsordenen inkluderer {questions} innleverte spørsmål som gjenspeiler borgeres og NGO-ers påvirkningsarbeid for sosialpolitiske prioriteringer.',
      impactLegal:
        '{pipeline} aktive lovgivningsprosedyrer fortsetter gjennom EUs medbestemmelsesprosedyre med potensielle konsekvenser for rettslige rammer.',
      impactGeopolitical:
        'Europaparlamentets aktivitet i denne {label} bidrar til EUs lovgivningskapasitet og internasjonale posisjonering i politiske forpliktelser.',
      outlookActive:
        'Den kommende {label} ({start}–{end}) omfatter {events} hendelser og {pipeline} pipelineprosedyrer. Sannsynlig scenario: produktivt utvalgsarbeid som driver viktige saker fremover.',
      outlookBottleneckNote:
        'Mulig scenario: gjennombrudd i {bottlenecks} flaskehalsprosedyre(r) gjennom fornyede forhandlinger.',
      outlookNoBottleneckNote:
        'Mulig scenario: introduksjon av nye lovgivningsforslag som utvider den politiske dagsordenen.',
      outlookReduced:
        'Lett parlamentarisk program for {start}–{end}. Sannsynlig scenario: fokus skifter til interinstitusjonelle forhandlinger og uformelle konsultasjoner.',
      stakeholderBottleneckReason:
        '{bottlenecks} prosedyre(r) i flaskehalsstatus kan forsinke lovgivningsfremdrift og kreve ytterligere forhandlingsrunder.',
      stakeholderCommitteeReason:
        '{committees} utvalg aktive denne {label}, noe som opprettholder standard arbeidsbelastningsfordeling på tvers av parlamentariske organer.',
      consequenceBottleneck:
        'Fortsatt flaskehals ved {stage}-stadiet risikerer å forsinke lovgivningens fullføring, noe som potensielt krever fremskyndede prosedyrer eller interinstitusjonelle forhandlinger.',
      consequenceEvent:
        'Planlagt {type} om "{title}" vil føre dette politikkområdet fremover gjennom den parlamentariske prosessen og påvirke fremtidige avstemnings- og endringssykluser.',
      mistakeActor: 'Lovgivningskoordinatorer',
      mistakeDescription: '"{title}" har nådd flaskehalsstatus ved {stage}-stadiet',
      mistakeAlternative:
        'Tidligere tverrpolitiske forforhandlinger og strukturerte ordførerkonsultasjoner kunne ha forhindret flaskehalsstatus for "{title}".',
    },
    fi: {
      what: 'Euroopan parlamentin {label} edessä ({start}–{end}): {events} täysistuntotapahtumaa, {committees} valiokuntakokousta, {documents} lainsäädäntöasiakirjaa, {pipeline} pipeline-menettelyä, {questions} parlamentaarista kysymystä aikataulutettu.',
      whenPeriod: 'Ajanjakso: {start}–{end}',
      whyActive:
        'Tuleva {label} sisältää {events} parlamentaarista tapahtumaa, mukaan lukien {committees} valiokuntakokousta, mikä heijastaa nykyistä lainsäädäntöohjelmaa.',
      whyBottleneck:
        '{bottlenecks} menettelyä kohtaa pullonkaulaolosuhteita, jotka vaativat poliittista koordinointia.',
      whyNoBottleneck: 'Ei kriittisiä pullonkauloja tunnistettu lainsäädäntöpipelinessa.',
      whyReduced:
        'Vähentynyt parlamentaarinen toiminta tulevalle {label} — {events} tapahtumaa aikataulutettu, mikä viittaa kevyempään asialistaan tai istuntotaukoon.',
      impactPolitical:
        '{events} aikataulutettua tapahtumaa muovaavat poliittisten ryhmien asemointia.',
      impactPoliticalBottleneck:
        'Keskeiset painepisteet sisältävät {bottlenecks} pullonkaulamenettely(ä).',
      impactPoliticalStable: 'Vakaata koalitiodynamiikkaa odotetaan.',
      impactEconomic:
        '{documents} lainsäädäntöasiakirjaa ja {pipeline} pipeline-menettelyä voi vaikuttaa taloudelliseen sääntelyyn ja markkinakehyksiin tulevana {label}.',
      impactSocial:
        'Parlamentaarinen asialista sisältää {questions} jätettyä kysymystä, jotka heijastavat kansalaisten ja kansalaisjärjestöjen vaikuttamistyötä sosiaalipoliittisissa painopisteissä.',
      impactLegal:
        '{pipeline} aktiivista lainsäädäntömenettelyä jatkuu EU:n yhteispäätösmenettelyn kautta mahdollisine vaikutuksineen oikeudellisiin kehyksiin.',
      impactGeopolitical:
        'Euroopan parlamentin toiminta tänä {label} edistää EU:n lainsäädäntökapasiteettia ja kansainvälistä asemointia politiikkasitoumuksissa.',
      outlookActive:
        'Tuleva {label} ({start}–{end}) sisältää {events} tapahtumaa ja {pipeline} pipeline-menettelyä. Todennäköinen skenaario: tuottava valiokuntetyö, joka edistää keskeisiä asioita.',
      outlookBottleneckNote:
        'Mahdollinen skenaario: läpimurto {bottlenecks} pullonkaulamenettely(ssä) uusien neuvottelujen kautta.',
      outlookNoBottleneckNote:
        'Mahdollinen skenaario: uusien lainsäädäntöehdotusten esittely, joka laajentaa poliittista asialistaa.',
      outlookReduced:
        'Kevyt parlamentaarinen aikataulu {start}–{end}. Todennäköinen skenaario: painopiste siirtyy toimielinten välisiin neuvotteluihin ja epävirallisiin kuulemisiin.',
      stakeholderBottleneckReason:
        '{bottlenecks} menettely(ä) pullonkaulatilassa voi viivästyttää lainsäädännön etenemistä ja vaatia lisäneuvottelukierroksia.',
      stakeholderCommitteeReason:
        '{committees} valiokuntaa aktiivisena tänä {label}, mikä ylläpitää standardityökuorman jakautumista parlamentaaristen elinten välillä.',
      consequenceBottleneck:
        'Jatkuva pullonkaula {stage}-vaiheessa uhkaa viivästyttää lainsäädännön valmistumista, mikä voi vaatia nopeutettuja menettelyjä tai toimielinten välisiä neuvotteluja.',
      consequenceEvent:
        'Aikataulutettu {type} aiheesta "{title}" edistää tätä politiikka-aluetta parlamentaarisen prosessin kautta ja vaikuttaa tuleviin äänestys- ja muutossykleihin.',
      mistakeActor: 'Lainsäädäntökoordinaattorit',
      mistakeDescription: '"{title}" on saavuttanut pullonkaulatilan {stage}-vaiheessa',
      mistakeAlternative:
        'Aikaisemmat puoluerajat ylittävät esineuvottelut ja rakenteellinen esittelijäkuuleminen olisivat voineet estää pullonkaulatilan aiheessa "{title}".',
    },
    de: {
      what: 'Die {label} des Europäischen Parlaments voraus ({start} bis {end}): {events} Plenarsitzungen, {committees} Ausschusssitzungen, {documents} Gesetzgebungsdokumente, {pipeline} Pipeline-Verfahren, {questions} parlamentarische Anfragen geplant.',
      whenPeriod: 'Zeitraum: {start} bis {end}',
      whyActive:
        'Die kommende {label} umfasst {events} parlamentarische Veranstaltungen einschließlich {committees} Ausschusssitzungen, was das aktuelle Gesetzgebungsprogramm widerspiegelt.',
      whyBottleneck:
        '{bottlenecks} Verfahren stehen vor Engpassbedingungen, die politische Koordinierung erfordern.',
      whyNoBottleneck: 'Keine kritischen Engpässe in der Gesetzgebungspipeline identifiziert.',
      whyReduced:
        'Reduzierte parlamentarische Aktivität für die kommende {label} — {events} Veranstaltungen geplant, was auf eine leichtere Tagesordnung oder Ruhepause hindeutet.',
      impactPolitical:
        '{events} geplante Veranstaltungen werden die Positionierung der Fraktionen formen.',
      impactPoliticalBottleneck: 'Wichtige Druckpunkte umfassen {bottlenecks} Engpass-Verfahren.',
      impactPoliticalStable: 'Stabile Koalitionsdynamik wird erwartet.',
      impactEconomic:
        '{documents} Gesetzgebungsdokumente und {pipeline} Pipeline-Verfahren können die Wirtschaftsregulierung und Marktrahmen in der kommenden {label} beeinflussen.',
      impactSocial:
        'Die parlamentarische Tagesordnung umfasst {questions} eingereichte Anfragen, die das Engagement von Bürgern und NGOs für sozialpolitische Prioritäten widerspiegeln.',
      impactLegal:
        '{pipeline} aktive Gesetzgebungsverfahren laufen im EU-Mitentscheidungsverfahren weiter mit potenziellen Auswirkungen auf die Rechtsrahmen.',
      impactGeopolitical:
        'Die Tätigkeit des Europäischen Parlaments während dieser {label} trägt zur Gesetzgebungskapazität der EU und ihrer internationalen Positionierung bei politischen Verpflichtungen bei.',
      outlookActive:
        'Die kommende {label} ({start}–{end}) umfasst {events} Veranstaltungen und {pipeline} Pipeline-Verfahren. Wahrscheinliches Szenario: produktive Ausschussarbeit, die wichtige Dossiers vorantreibt.',
      outlookBottleneckNote:
        'Mögliches Szenario: Durchbruch bei {bottlenecks} Engpass-Verfahren durch erneuerte Verhandlungen.',
      outlookNoBottleneckNote:
        'Mögliches Szenario: Einführung neuer Gesetzgebungsvorschläge, die die politische Agenda erweitern.',
      outlookReduced:
        'Leichter parlamentarischer Zeitplan für {start}–{end}. Wahrscheinliches Szenario: Fokus verlagert sich auf interinstitutionelle Verhandlungen und informelle Konsultationen.',
      stakeholderBottleneckReason:
        '{bottlenecks} Verfahren im Engpassstatus können den Gesetzgebungsfortschritt verzögern und zusätzliche Verhandlungsrunden erfordern.',
      stakeholderCommitteeReason:
        '{committees} Ausschüsse aktiv in dieser {label}, was eine standardmäßige Arbeitsbelastungsverteilung über die parlamentarischen Organe aufrechterhält.',
      consequenceBottleneck:
        'Anhaltender Engpass in der {stage}-Phase birgt das Risiko einer Verzögerung des Gesetzgebungsabschlusses, was möglicherweise beschleunigte Verfahren oder interinstitutionelle Verhandlungen erfordert.',
      consequenceEvent:
        'Geplante {type} zu "{title}" wird diesen Politikbereich durch den parlamentarischen Prozess vorantreiben und zukünftige Abstimmungs- und Änderungszyklen beeinflussen.',
      mistakeActor: 'Gesetzgebungskoordinatoren',
      mistakeDescription: '"{title}" hat den Engpassstatus in der {stage}-Phase erreicht',
      mistakeAlternative:
        'Frühere fraktionsübergreifende Vorverhandlungen und strukturierte Berichterstatterkonsultationen hätten den Engpassstatus bei "{title}" verhindern können.',
    },
    fr: {
      what: 'Le {label} du Parlement européen à venir ({start} au {end}) : {events} événements pléniers, {committees} réunions de commission, {documents} documents législatifs, {pipeline} procédures en cours, {questions} questions parlementaires programmées.',
      whenPeriod: 'Période : {start} au {end}',
      whyActive:
        'Le {label} à venir comprend {events} événements parlementaires dont {committees} réunions de commission, reflétant le programme législatif actuel.',
      whyBottleneck:
        "{bottlenecks} procédures font face à des conditions de goulet d'étranglement nécessitant une coordination politique.",
      whyNoBottleneck:
        "Aucun goulet d'étranglement critique identifié dans le pipeline législatif.",
      whyReduced:
        'Activité parlementaire réduite pour le {label} à venir — {events} événements programmés, suggérant un ordre du jour allégé ou une période de vacances.',
      impactPolitical:
        '{events} événements programmés façonneront le positionnement des groupes politiques.',
      impactPoliticalBottleneck:
        "Les points de pression clés comprennent {bottlenecks} procédure(s) en goulet d'étranglement.",
      impactPoliticalStable: 'Dynamique de coalition stable attendue.',
      impactEconomic:
        '{documents} documents législatifs et {pipeline} procédures en cours peuvent affecter la réglementation économique et les cadres de marché durant le {label} à venir.',
      impactSocial:
        "L'agenda parlementaire comprend {questions} questions déposées reflétant le plaidoyer des citoyens et des ONG sur les priorités de politique sociale.",
      impactLegal:
        "{pipeline} procédures législatives actives se poursuivent dans le cadre de la procédure de codécision de l'UE, avec des implications potentielles pour les cadres juridiques.",
      impactGeopolitical:
        "L'activité du Parlement européen durant ce {label} contribue à la capacité législative de l'UE et à son positionnement international sur les engagements politiques.",
      outlookActive:
        'Le {label} à venir ({start}–{end}) comprend {events} événements et {pipeline} procédures en cours. Scénario probable : travail productif en commission faisant avancer les dossiers clés.',
      outlookBottleneckNote:
        "Scénario possible : percée sur {bottlenecks} procédure(s) en goulet d'étranglement grâce à des négociations renouvelées.",
      outlookNoBottleneckNote:
        "Scénario possible : introduction de nouvelles propositions législatives élargissant l'agenda politique.",
      outlookReduced:
        'Programme parlementaire léger pour {start}–{end}. Scénario probable : le focus se déplace vers les négociations interinstitutionnelles et les consultations informelles.',
      stakeholderBottleneckReason:
        "{bottlenecks} procédure(s) en statut de goulet d'étranglement peuvent retarder le progrès législatif et nécessiter des tours de négociation supplémentaires.",
      stakeholderCommitteeReason:
        '{committees} commissions actives ce {label}, maintenant une répartition standard de la charge de travail entre les organes parlementaires.',
      consequenceBottleneck:
        "Le maintien du goulet d'étranglement à l'étape {stage} risque de retarder l'achèvement législatif, nécessitant potentiellement des procédures accélérées ou des négociations interinstitutionnelles.",
      consequenceEvent:
        "Le {type} programmé sur « {title} » fera avancer ce domaine politique à travers le processus parlementaire, influençant les futurs cycles de vote et d'amendement.",
      mistakeActor: 'Coordinateurs législatifs',
      mistakeDescription:
        "« {title} » a atteint le statut de goulet d'étranglement à l'étape {stage}",
      mistakeAlternative:
        "Des prénégociations transpartisanes plus précoces et des consultations structurées du rapporteur auraient pu prévenir le statut de goulet d'étranglement pour « {title} ».",
    },
    es: {
      what: 'El {label} del Parlamento Europeo por delante ({start} a {end}): {events} eventos plenarios, {committees} reuniones de comisión, {documents} documentos legislativos, {pipeline} procedimientos en curso, {questions} preguntas parlamentarias programadas.',
      whenPeriod: 'Período: {start} a {end}',
      whyActive:
        'El próximo {label} incluye {events} eventos parlamentarios, incluidas {committees} reuniones de comisión, reflejando el programa legislativo actual.',
      whyBottleneck:
        '{bottlenecks} procedimientos enfrentan condiciones de cuello de botella que requieren coordinación política.',
      whyNoBottleneck: 'No se identificaron cuellos de botella críticos en el proceso legislativo.',
      whyReduced:
        'Actividad parlamentaria reducida para el próximo {label} — {events} eventos programados, sugiriendo una agenda más ligera o período de receso.',
      impactPolitical:
        '{events} eventos programados configurarán el posicionamiento de los grupos políticos.',
      impactPoliticalBottleneck:
        'Los puntos de presión clave incluyen {bottlenecks} procedimiento(s) en cuello de botella.',
      impactPoliticalStable: 'Se espera una dinámica de coalición estable.',
      impactEconomic:
        '{documents} documentos legislativos y {pipeline} procedimientos en curso pueden impactar la regulación económica y los marcos de mercado en el próximo {label}.',
      impactSocial:
        'La agenda parlamentaria incluye {questions} preguntas presentadas que reflejan la defensa de ciudadanos y ONG sobre prioridades de política social.',
      impactLegal:
        '{pipeline} procedimientos legislativos activos continúan a través del proceso de codecisión de la UE, con posibles implicaciones para los marcos jurídicos.',
      impactGeopolitical:
        'La actividad del Parlamento Europeo durante este {label} contribuye a la capacidad legislativa de la UE y su posicionamiento internacional en compromisos políticos.',
      outlookActive:
        'El próximo {label} ({start}–{end}) incluye {events} eventos y {pipeline} procedimientos en curso. Escenario probable: trabajo productivo en comisión avanzando expedientes clave.',
      outlookBottleneckNote:
        'Escenario posible: avance en {bottlenecks} procedimiento(s) en cuello de botella a través de negociaciones renovadas.',
      outlookNoBottleneckNote:
        'Escenario posible: introducción de nuevas propuestas legislativas que amplían la agenda política.',
      outlookReduced:
        'Programa parlamentario ligero para {start}–{end}. Escenario probable: el enfoque se desplaza hacia negociaciones interinstitucionales y consultas informales.',
      stakeholderBottleneckReason:
        '{bottlenecks} procedimiento(s) en estado de cuello de botella pueden retrasar el progreso legislativo y requerir rondas de negociación adicionales.',
      stakeholderCommitteeReason:
        '{committees} comisiones activas este {label}, manteniendo la distribución estándar de carga de trabajo entre los órganos parlamentarios.',
      consequenceBottleneck:
        'El cuello de botella continuo en la etapa {stage} arriesga retrasar la finalización legislativa, requiriendo potencialmente procedimientos acelerados o negociaciones interinstitucionales.',
      consequenceEvent:
        'El {type} programado sobre "{title}" avanzará esta área política a través del proceso parlamentario, influyendo en futuros ciclos de votación y enmienda.',
      mistakeActor: 'Coordinadores legislativos',
      mistakeDescription:
        '"{title}" ha alcanzado el estado de cuello de botella en la etapa {stage}',
      mistakeAlternative:
        'Prenegociaciones transversales más tempranas y consultas estructuradas del ponente podrían haber prevenido el estado de cuello de botella en "{title}".',
    },
    nl: {
      what: 'De {label} van het Europees Parlement vooruit ({start} tot {end}): {events} plenaire evenementen, {committees} commissievergaderingen, {documents} wetgevingsdocumenten, {pipeline} pipelineprocedures, {questions} parlementaire vragen gepland.',
      whenPeriod: 'Periode: {start} tot {end}',
      whyActive:
        'De komende {label} omvat {events} parlementaire evenementen waaronder {committees} commissievergaderingen, als weerspiegeling van het huidige wetgevingsprogramma.',
      whyBottleneck:
        '{bottlenecks} procedures kampen met knelpuntomstandigheden die politieke coördinatie vereisen.',
      whyNoBottleneck: 'Geen kritieke knelpunten geïdentificeerd in de wetgevingspipeline.',
      whyReduced:
        'Verminderde parlementaire activiteit voor de komende {label} — {events} evenementen gepland, wat wijst op een lichtere agenda of recessperiode.',
      impactPolitical:
        '{events} geplande evenementen zullen de positionering van fracties vormgeven.',
      impactPoliticalBottleneck:
        'Belangrijke drukpunten omvatten {bottlenecks} knelpuntprocedure(s).',
      impactPoliticalStable: 'Stabiele coalitiedynamiek verwacht.',
      impactEconomic:
        '{documents} wetgevingsdocumenten en {pipeline} pipelineprocedures kunnen de economische regulering en marktkaders in de komende {label} beïnvloeden.',
      impactSocial:
        "De parlementaire agenda omvat {questions} ingediende vragen die de belangenbehartiging van burgers en NGO's op het gebied van sociaal beleidsprioriteiten weerspiegelen.",
      impactLegal:
        '{pipeline} actieve wetgevingsprocedures lopen door via de medebeslissingsprocedure van de EU, met mogelijke gevolgen voor de rechtskaders.',
      impactGeopolitical:
        'De activiteit van het Europees Parlement gedurende deze {label} draagt bij aan de wetgevingscapaciteit van de EU en haar internationale positionering inzake beleidsverplichtingen.',
      outlookActive:
        'De komende {label} ({start}–{end}) omvat {events} evenementen en {pipeline} pipelineprocedures. Waarschijnlijk scenario: productief commissiewerk dat belangrijke dossiers vooruit helpt.',
      outlookBottleneckNote:
        'Mogelijk scenario: doorbraak bij {bottlenecks} knelpuntprocedure(s) door hernieuwde onderhandelingen.',
      outlookNoBottleneckNote:
        'Mogelijk scenario: introductie van nieuwe wetgevingsvoorstellen die de beleidsagenda uitbreiden.',
      outlookReduced:
        'Licht parlementair schema voor {start}–{end}. Waarschijnlijk scenario: focus verschuift naar interinstitutionele onderhandelingen en informele consultaties.',
      stakeholderBottleneckReason:
        '{bottlenecks} procedure(s) in knelpuntstatus kunnen de wetgevingsvoortgang vertragen en aanvullende onderhandelingsrondes vereisen.',
      stakeholderCommitteeReason:
        '{committees} commissies actief deze {label}, wat de standaardwerklastverdeling over parlementaire organen handhaaft.',
      consequenceBottleneck:
        'Aanhoudend knelpunt in de {stage}-fase riskeert vertraging van de wetgevingsafronding, wat mogelijk versnelde procedures of interinstitutionele onderhandelingen vereist.',
      consequenceEvent:
        'Gepland {type} over "{title}" zal dit beleidsterrein door het parlementaire proces vooruit helpen en toekomstige stem- en amendementscycli beïnvloeden.',
      mistakeActor: 'Wetgevingscoördinatoren',
      mistakeDescription: '"{title}" heeft de knelpuntstatus bereikt in de {stage}-fase',
      mistakeAlternative:
        'Eerdere interfractieonderhandelingen en gestructureerde rapporteurconsultaties hadden de knelpuntstatus voor "{title}" kunnen voorkomen.',
    },
    ar: {
      what: '{label} البرلمان الأوروبي القادم ({start} إلى {end}): {events} جلسة عامة، {committees} اجتماع لجنة، {documents} وثيقة تشريعية، {pipeline} إجراء في خط الأنابيب، {questions} سؤال برلماني مجدول.',
      whenPeriod: 'الفترة: {start} إلى {end}',
      whyActive:
        'يتضمن {label} القادم {events} حدثاً برلمانياً بما في ذلك {committees} اجتماع لجنة، مما يعكس البرنامج التشريعي الحالي.',
      whyBottleneck: '{bottlenecks} إجراء يواجه ظروف اختناق تتطلب تنسيقاً سياسياً.',
      whyNoBottleneck: 'لم يتم تحديد اختناقات حرجة في خط الأنابيب التشريعي.',
      whyReduced:
        'نشاط برلماني مخفض لـ{label} القادم — {events} حدث مجدول، مما يشير إلى جدول أعمال أخف أو فترة عطلة.',
      impactPolitical: '{events} حدث مجدول سيشكل تموضع المجموعات السياسية.',
      impactPoliticalBottleneck: 'تشمل نقاط الضغط الرئيسية {bottlenecks} إجراء(ات) في حالة اختناق.',
      impactPoliticalStable: 'يُتوقع ديناميكيات ائتلافية مستقرة.',
      impactEconomic:
        '{documents} وثيقة تشريعية و{pipeline} إجراء في خط الأنابيب قد تؤثر على التنظيم الاقتصادي وأطر السوق في {label} القادم.',
      impactSocial:
        'يتضمن جدول الأعمال البرلماني {questions} سؤال مقدم يعكس مناصرة المواطنين والمنظمات غير الحكومية لأولويات السياسة الاجتماعية.',
      impactLegal:
        '{pipeline} إجراء تشريعي نشط يستمر عبر عملية القرار المشترك في الاتحاد الأوروبي، مع آثار محتملة على الأطر القانونية.',
      impactGeopolitical:
        'يسهم نشاط البرلمان الأوروبي خلال هذا {label} في القدرة التشريعية للاتحاد الأوروبي وتموضعه الدولي في الالتزامات السياسية.',
      outlookActive:
        '{label} القادم ({start}–{end}) يتضمن {events} حدث و{pipeline} إجراء في خط الأنابيب. السيناريو المرجح: عمل لجان منتج يدفع الملفات الرئيسية قدماً.',
      outlookBottleneckNote:
        'سيناريو محتمل: اختراق في {bottlenecks} إجراء(ات) مختنقة من خلال مفاوضات متجددة.',
      outlookNoBottleneckNote:
        'سيناريو محتمل: تقديم مقترحات تشريعية جديدة توسع جدول الأعمال السياسي.',
      outlookReduced:
        'جدول برلماني خفيف لـ{start}–{end}. السيناريو المرجح: ينتقل التركيز إلى المفاوضات المؤسسية والمشاورات غير الرسمية.',
      stakeholderBottleneckReason:
        '{bottlenecks} إجراء(ات) في حالة اختناق قد تؤخر التقدم التشريعي وتتطلب جولات تفاوض إضافية.',
      stakeholderCommitteeReason:
        '{committees} لجنة نشطة هذا {label}، مما يحافظ على توزيع عبء العمل المعياري عبر الهيئات البرلمانية.',
      consequenceBottleneck:
        'استمرار الاختناق في مرحلة {stage} يخاطر بتأخير إنجاز التشريع، مما قد يتطلب إجراءات معجلة أو مفاوضات مؤسسية.',
      consequenceEvent:
        '{type} المجدول حول "{title}" سيدفع هذا المجال السياسي قدماً عبر العملية البرلمانية، مؤثراً على دورات التصويت والتعديل المستقبلية.',
      mistakeActor: 'منسقو التشريع',
      mistakeDescription: 'وصل "{title}" إلى حالة الاختناق في مرحلة {stage}',
      mistakeAlternative:
        'كان من الممكن أن تمنع المفاوضات المسبقة عبر الأحزاب والمشاورات المنظمة للمقرر حالة الاختناق في "{title}".',
    },
    he: {
      what: 'הפרלמנט האירופי {label} קדימה ({start} עד {end}): {events} אירועי מליאה, {committees} ישיבות ועדה, {documents} מסמכי חקיקה, {pipeline} הליכי pipeline, {questions} שאילתות פרלמנטריות מתוכננות.',
      whenPeriod: 'תקופה: {start} עד {end}',
      whyActive:
        'ה-{label} הקרוב כולל {events} אירועים פרלמנטריים כולל {committees} ישיבות ועדה, המשקפים את תוכנית החקיקה הנוכחית.',
      whyBottleneck: '{bottlenecks} הליכים מתמודדים עם תנאי צוואר בקבוק הדורשים תיאום פוליטי.',
      whyNoBottleneck: 'לא זוהו צווארי בקבוק קריטיים בצנרת החקיקתית.',
      whyReduced:
        'פעילות פרלמנטרית מופחתת ל-{label} הקרוב — {events} אירועים מתוכננים, המרמזים על סדר יום קל יותר או תקופת פגרה.',
      impactPolitical: '{events} אירועים מתוכננים יעצבו את מיצוב הסיעות הפוליטיות.',
      impactPoliticalBottleneck: 'נקודות לחץ מפתח כוללות {bottlenecks} הליך(ים) בצוואר בקבוק.',
      impactPoliticalStable: 'דינמיקת קואליציה יציבה צפויה.',
      impactEconomic:
        '{documents} מסמכי חקיקה ו-{pipeline} הליכי pipeline עשויים להשפיע על הרגולציה הכלכלית ומסגרות השוק ב-{label} הקרוב.',
      impactSocial:
        'סדר היום הפרלמנטרי כולל {questions} שאילתות שהוגשו המשקפות הסברה של אזרחים וארגונים לא ממשלתיים בנושא עדיפויות מדיניות חברתית.',
      impactLegal:
        '{pipeline} הליכי חקיקה פעילים ממשיכים דרך הליך ההחלטה המשותפת של האיחוד האירופי, עם השלכות אפשריות על מסגרות משפטיות.',
      impactGeopolitical:
        'פעילות הפרלמנט האירופי במהלך {label} זה תורמת ליכולת החקיקתית של האיחוד האירופי ולמיצובו הבינלאומי בהתחייבויות מדיניות.',
      outlookActive:
        'ה-{label} הקרוב ({start}–{end}) כולל {events} אירועים ו-{pipeline} הליכי pipeline. תרחיש סביר: עבודת ועדה פרודוקטיבית המקדמת תיקים מרכזיים.',
      outlookBottleneckNote:
        'תרחיש אפשרי: פריצת דרך ב-{bottlenecks} הליך(ים) בצוואר בקבוק באמצעות משא ומתן מחודש.',
      outlookNoBottleneckNote: 'תרחיש אפשרי: הצגת הצעות חקיקה חדשות המרחיבות את סדר היום המדיני.',
      outlookReduced:
        'לוח זמנים פרלמנטרי קל ל-{start}–{end}. תרחיש סביר: המיקוד עובר למשא ומתן בין-מוסדי והתייעצויות בלתי פורמליות.',
      stakeholderBottleneckReason:
        '{bottlenecks} הליך(ים) בסטטוס צוואר בקבוק עלולים לעכב את התקדמות החקיקה ולדרוש סבבי משא ומתן נוספים.',
      stakeholderCommitteeReason:
        '{committees} ועדות פעילות ב-{label} זה, תוך שמירה על חלוקת עומס עבודה תקנית בין הגופים הפרלמנטריים.',
      consequenceBottleneck:
        'צוואר בקבוק מתמשך בשלב {stage} מסכן בעיכוב השלמת החקיקה, מה שעשוי לדרוש הליכים מזורזים או משא ומתן בין-מוסדי.',
      consequenceEvent:
        '{type} מתוכנן בנושא "{title}" יקדם תחום מדיניות זה דרך התהליך הפרלמנטרי, וישפיע על מחזורי הצבעה ותיקונים עתידיים.',
      mistakeActor: 'מתאמי חקיקה',
      mistakeDescription: '"{title}" הגיע לסטטוס צוואר בקבוק בשלב {stage}',
      mistakeAlternative:
        'משא ומתן מוקדם חוצה-סיעות והתייעצויות מובנות של המדווח יכלו למנוע את סטטוס צוואר הבקבוק ב-"{title}".',
    },
    ja: {
      what: '欧州議会の{label}先（{start}から{end}）：{events}件の本会議、{committees}件の委員会会議、{documents}件の立法文書、{pipeline}件のパイプライン手続き、{questions}件の議会質問が予定されています。',
      whenPeriod: '期間：{start}から{end}',
      whyActive:
        '今後の{label}には{committees}件の委員会会議を含む{events}件の議会イベントが予定されており、現在の立法プログラムを反映しています。',
      whyBottleneck:
        '{bottlenecks}件の手続きが政治的調整を必要とするボトルネック状態に直面しています。',
      whyNoBottleneck: '立法パイプラインにおいて重大なボトルネックは確認されていません。',
      whyReduced:
        '今後の{label}の議会活動は減少しています — {events}件のイベントが予定されており、軽い議題または休会期間を示唆しています。',
      impactPolitical: '{events}件の予定イベントが政治グループの位置づけを形成します。',
      impactPoliticalBottleneck:
        '主要な圧力ポイントには{bottlenecks}件のボトルネック手続きが含まれます。',
      impactPoliticalStable: '安定した連立動態が予想されます。',
      impactEconomic:
        '{documents}件の立法文書と{pipeline}件のパイプライン手続きは、今後の{label}における経済規制と市場枠組みに影響を与える可能性があります。',
      impactSocial:
        '議会の議題には、社会政策優先事項に関する市民およびNGOの提唱を反映する{questions}件の提出された質問が含まれています。',
      impactLegal:
        '{pipeline}件の活動中の立法手続きがEU共同決定プロセスを通じて継続しており、法的枠組みへの潜在的な影響があります。',
      impactGeopolitical:
        'この{label}における欧州議会の活動は、EUの立法能力と政策コミットメントにおける国際的位置づけに貢献しています。',
      outlookActive:
        '今後の{label}（{start}–{end}）には{events}件のイベントと{pipeline}件のパイプライン手続きが含まれます。想定シナリオ：主要案件を推進する生産的な委員会作業。',
      outlookBottleneckNote:
        '想定されるシナリオ：再開された交渉による{bottlenecks}件のボトルネック手続きの突破。',
      outlookNoBottleneckNote: '想定されるシナリオ：政策課題を拡大する新しい立法提案の導入。',
      outlookReduced:
        '{start}–{end}の軽い議会日程。想定シナリオ：機関間交渉と非公式協議にフォーカスが移行します。',
      stakeholderBottleneckReason:
        '{bottlenecks}件のボトルネック状態の手続きは立法の進展を遅らせ、追加の交渉ラウンドを必要とする可能性があります。',
      stakeholderCommitteeReason:
        'この{label}に{committees}件の委員会が活動しており、議会機関間の標準的な作業負荷分配を維持しています。',
      consequenceBottleneck:
        '{stage}段階でのボトルネックの継続は立法完了の遅延リスクを伴い、迅速化手続きまたは機関間交渉が必要になる可能性があります。',
      consequenceEvent:
        '「{title}」に関する予定された{type}はこの政策分野を議会プロセスを通じて前進させ、将来の投票および修正サイクルに影響を与えます。',
      mistakeActor: '立法コーディネーター',
      mistakeDescription: '「{title}」が{stage}段階でボトルネック状態に達しました',
      mistakeAlternative:
        'より早い段階での超党派事前交渉と体系的な報告者協議により、「{title}」のボトルネック状態を防ぐことができたはずです。',
    },
    ko: {
      what: '유럽의회 {label} 전망 ({start}부터 {end}까지): {events}건의 본회의, {committees}건의 위원회 회의, {documents}건의 입법 문서, {pipeline}건의 파이프라인 절차, {questions}건의 의회 질의가 예정되어 있습니다.',
      whenPeriod: '기간: {start}부터 {end}까지',
      whyActive:
        '다가오는 {label}에는 {committees}건의 위원회 회의를 포함하여 {events}건의 의회 행사가 예정되어 있으며, 현재 입법 프로그램을 반영합니다.',
      whyBottleneck: '{bottlenecks}건의 절차가 정치적 조율을 요구하는 병목 상태에 직면해 있습니다.',
      whyNoBottleneck: '입법 파이프라인에서 중대한 병목 현상이 확인되지 않았습니다.',
      whyReduced:
        '다가오는 {label}의 의회 활동이 축소되었습니다 — {events}건의 행사가 예정되어 있으며, 이는 가벼운 의제 또는 휴회 기간을 시사합니다.',
      impactPolitical: '{events}건의 예정된 행사가 정치 그룹의 입지를 형성할 것입니다.',
      impactPoliticalBottleneck: '핵심 압박 지점에는 {bottlenecks}건의 병목 절차가 포함됩니다.',
      impactPoliticalStable: '안정적인 연합 역학이 예상됩니다.',
      impactEconomic:
        '{documents}건의 입법 문서와 {pipeline}건의 파이프라인 절차는 다가오는 {label}의 경제 규제 및 시장 프레임워크에 영향을 미칠 수 있습니다.',
      impactSocial:
        '의회 의제에는 사회 정책 우선순위에 대한 시민 및 NGO의 옹호를 반영하는 {questions}건의 제출된 질의가 포함됩니다.',
      impactLegal:
        '{pipeline}건의 활성 입법 절차가 EU 공동결정 과정을 통해 계속되며, 법적 프레임워크에 잠재적 영향을 미칩니다.',
      impactGeopolitical:
        '이 {label} 동안의 유럽의회 활동은 EU의 입법 역량과 정책 약속에 대한 국제적 위상 정립에 기여합니다.',
      outlookActive:
        '다가오는 {label}({start}–{end})에는 {events}건의 행사와 {pipeline}건의 파이프라인 절차가 포함됩니다. 예상 시나리오: 핵심 안건을 추진하는 생산적인 위원회 작업.',
      outlookBottleneckNote:
        '가능한 시나리오: 재개된 협상을 통한 {bottlenecks}건의 병목 절차 돌파.',
      outlookNoBottleneckNote: '가능한 시나리오: 정책 의제를 확대하는 새로운 입법 제안 도입.',
      outlookReduced:
        '{start}–{end}의 가벼운 의회 일정. 예상 시나리오: 기관 간 협상과 비공식 협의로 초점이 이동합니다.',
      stakeholderBottleneckReason:
        '{bottlenecks}건의 병목 상태 절차가 입법 진행을 지연시키고 추가 협상 라운드를 요구할 수 있습니다.',
      stakeholderCommitteeReason:
        '이 {label}에 {committees}개 위원회가 활동하여 의회 기관 간 표준 업무량 배분을 유지합니다.',
      consequenceBottleneck:
        '{stage} 단계에서의 지속적인 병목은 입법 완료 지연 위험을 수반하며, 잠재적으로 신속 절차 또는 기관 간 협상이 필요할 수 있습니다.',
      consequenceEvent:
        '"{title}"에 관한 예정된 {type}은(는) 이 정책 영역을 의회 과정을 통해 진전시키며, 향후 투표 및 수정 주기에 영향을 미칩니다.',
      mistakeActor: '입법 조정관',
      mistakeDescription: '"{title}"이(가) {stage} 단계에서 병목 상태에 도달했습니다',
      mistakeAlternative:
        '더 이른 초당적 사전 협상과 체계적인 보고관 협의가 "{title}"의 병목 상태를 방지할 수 있었습니다.',
    },
    zh: {
      what: '欧洲议会{label}展望（{start}至{end}）：{events}场全体会议，{committees}场委员会会议，{documents}份立法文件，{pipeline}项管线程序，{questions}项议会质询已安排。',
      whenPeriod: '期间：{start}至{end}',
      whyActive:
        '即将到来的{label}包括{events}场议会活动，其中包括{committees}场委员会会议，反映了当前的立法计划。',
      whyBottleneck: '{bottlenecks}项程序面临需要政治协调的瓶颈状况。',
      whyNoBottleneck: '立法管线中未发现重大瓶颈。',
      whyReduced:
        '即将到来的{label}议会活动减少 — {events}场活动已安排，表明议程较轻或处于休会期。',
      impactPolitical: '{events}场预定活动将塑造政治团体的定位。',
      impactPoliticalBottleneck: '关键压力点包括{bottlenecks}项瓶颈程序。',
      impactPoliticalStable: '预计联盟动态稳定。',
      impactEconomic:
        '{documents}份立法文件和{pipeline}项管线程序可能影响即将到来的{label}的经济监管和市场框架。',
      impactSocial:
        '议会议程包括{questions}项已提交的质询，反映了公民和非政府组织对社会政策优先事项的倡导。',
      impactLegal:
        '{pipeline}项活跃的立法程序通过欧盟共同决定程序继续推进，对法律框架具有潜在影响。',
      impactGeopolitical:
        '在此{label}期间欧洲议会的活动有助于欧盟的立法能力和在政策承诺方面的国际定位。',
      outlookActive:
        '即将到来的{label}（{start}–{end}）包括{events}场活动和{pipeline}项管线程序。可能情景：富有成效的委员会工作推动关键文件进展。',
      outlookBottleneckNote: '可能情景：通过重新谈判在{bottlenecks}项瓶颈程序上取得突破。',
      outlookNoBottleneckNote: '可能情景：引入新的立法提案以扩大政策议程。',
      outlookReduced: '{start}–{end}议会日程较轻。可能情景：重点转向机构间谈判和非正式磋商。',
      stakeholderBottleneckReason:
        '{bottlenecks}项处于瓶颈状态的程序可能延迟立法进展并需要额外的谈判轮次。',
      stakeholderCommitteeReason:
        '{committees}个委员会在此{label}期间活跃，维持议会机构间的标准工作量分配。',
      consequenceBottleneck:
        '{stage}阶段的持续瓶颈有延迟立法完成的风险，可能需要加速程序或机构间谈判。',
      consequenceEvent:
        '关于"{title}"的预定{type}将通过议会程序推进该政策领域，影响未来的投票和修正周期。',
      mistakeActor: '立法协调员',
      mistakeDescription: '"{title}"在{stage}阶段已达到瓶颈状态',
      mistakeAlternative:
        '更早的跨党派预先谈判和结构化的报告人协商本可以防止"{title}"出现瓶颈状态。',
    },
  };

export const BREAKING_ANALYSIS_CONTENT_STRINGS: LanguageMap<BreakingAnalysisContentStrings> = {
  en: {
    whyAdopted:
      'Breaking parliamentary developments on {date} driven by {adopted} newly adopted text(s), {events} events, and {procedures} active procedures. These developments reflect accelerated legislative activity requiring stakeholder attention.',
    whyRoutine:
      'Parliamentary activity update for {date}: {events} events and {procedures} procedures in progress.',
    impactPolitical:
      'Breaking developments on {date} with {adopted} adoptions and {events} events shape political group dynamics and coalition calculations for upcoming legislative sessions.',
    impactEconomicAdopted:
      '{adopted} adopted legislative text(s) introduce potential regulatory changes affecting economic operators and market conditions across EU member states.',
    impactEconomicNone:
      'Current parliamentary activity has limited immediate economic impact, though ongoing procedures may affect future regulatory frameworks.',
    impactSocial: 'Parliamentary activity on {date} reflects institutional engagement.',
    impactSocialEvents: 'Scheduled events addressing citizen concerns.',
    impactSocialRoutine: 'Routine proceedings.',
    impactLegalAdopted:
      '{adopted} adopted text(s) advance through the EU legislative process, with potential implications for legal frameworks and national transposition requirements.',
    impactLegalNone:
      'No new legal instruments adopted in this period; ongoing procedures continue through standard legislative stages.',
    impactGeopolitical:
      "EU Parliament's legislative activity on {date} contributes to the bloc's institutional credibility and capacity for international engagement.",
    stakeholderWinnerReason:
      'Successfully advanced {adopted} legislative text(s) through the adoption process, demonstrating effective coalition coordination.',
    stakeholderNeutralReason:
      'Coalition dynamics remain in flux with ongoing negotiations across political groups. Current positioning reflects strategic patience rather than decisive alignment.',
    consequenceAdopted:
      'Adoption of "{title}" advances this policy area through the legislative process, establishing new regulatory parameters and political precedents.',
    consequenceProcedure:
      'Progress on "{title}" moves this procedure toward adoption, requiring continued political coordination among involved groups.',
    mistakeDescription: 'Voting anomaly detected: {description}',
    mistakeAlternative:
      'Pre-vote consultation and early warning mechanisms within political groups could have anticipated and addressed internal dissent before the floor vote.',
    outlookAdopted:
      'Breaking developments on {date} set the stage for continued legislative activity. Likely scenario: adopted texts proceed to implementation phase. Possible scenario: political reactions trigger additional amendments or challenges in subsequent sessions.',
    outlookRoutine:
      'Parliamentary activity on {date} continues at routine pace. Likely scenario: standard progression of pending procedures. Possible scenario: emerging developments may accelerate specific policy files.',
  },
  sv: {
    whyAdopted:
      'Senaste parlamentariska utvecklingen den {date} drivs av {adopted} nyligen antagna text(er), {events} händelser och {procedures} aktiva förfaranden. Denna utveckling återspeglar intensifierad lagstiftningsverksamhet som kräver intressenternas uppmärksamhet.',
    whyRoutine:
      'Uppdatering av parlamentarisk aktivitet för {date}: {events} händelser och {procedures} pågående förfaranden.',
    impactPolitical:
      'Senaste utvecklingen den {date} med {adopted} antaganden och {events} händelser formar politisk gruppdynamik och koalitionsberäkningar inför kommande lagstiftningssessioner.',
    impactEconomicAdopted:
      '{adopted} antagna lagstiftningstext(er) inför potentiella regulatoriska förändringar som påverkar ekonomiska aktörer och marknadsförhållanden i EU:s medlemsstater.',
    impactEconomicNone:
      'Nuvarande parlamentarisk aktivitet har begränsad omedelbar ekonomisk påverkan, men pågående förfaranden kan påverka framtida regelverk.',
    impactSocial: 'Parlamentarisk aktivitet den {date} återspeglar institutionellt engagemang.',
    impactSocialEvents: 'Planerade händelser som behandlar medborgarnas angelägenheter.',
    impactSocialRoutine: 'Rutinmässiga förfaranden.',
    impactLegalAdopted:
      '{adopted} antagna text(er) avancerar genom EU:s lagstiftningsprocess med potentiella konsekvenser för rättsliga ramar och nationella införlivandekrav.',
    impactLegalNone:
      'Inga nya rättsinstrument antagna under denna period; pågående förfaranden fortsätter genom ordinarie lagstiftningsstadier.',
    impactGeopolitical:
      'EU-parlamentets lagstiftningsverksamhet den {date} bidrar till blockets institutionella trovärdighet och kapacitet för internationellt engagemang.',
    stakeholderWinnerReason:
      'Framgångsrikt drivit {adopted} lagstiftningstext(er) genom antagandeprocessen, vilket visar effektiv koalitionssamordning.',
    stakeholderNeutralReason:
      'Koalitionsdynamiken förblir i förändring med pågående förhandlingar mellan politiska grupper. Nuvarande positionering återspeglar strategiskt tålamod snarare än avgörande anpassning.',
    consequenceAdopted:
      'Antagandet av "{title}" driver detta politikområde framåt genom lagstiftningsprocessen och fastställer nya regulatoriska parametrar och politiska prejudikat.',
    consequenceProcedure:
      'Framsteg i "{title}" för detta förfarande mot antagande, vilket kräver fortsatt politisk samordning mellan involverade grupper.',
    mistakeDescription: 'Röstningsavvikelse upptäckt: {description}',
    mistakeAlternative:
      'Förhandssamråd och tidiga varningsmekanismer inom politiska grupper kunde ha förutsett och hanterat intern oenighet före plenarröstningen.',
    outlookAdopted:
      'Senaste utvecklingen den {date} bäddar för fortsatt lagstiftningsverksamhet. Troligt scenario: antagna texter övergår till genomförandefasen. Möjligt scenario: politiska reaktioner utlöser ytterligare ändringsförslag eller utmaningar i efterföljande sessioner.',
    outlookRoutine:
      'Parlamentarisk aktivitet den {date} fortsätter i ordinarie takt. Troligt scenario: standardmässig progression av pågående förfaranden. Möjligt scenario: nya utvecklingar kan påskynda specifika policyärenden.',
  },
  da: {
    whyAdopted:
      'Seneste parlamentariske udviklinger den {date} drevet af {adopted} nyligt vedtagne tekst(er), {events} begivenheder og {procedures} aktive procedurer. Disse udviklinger afspejler accelereret lovgivningsaktivitet, der kræver interessenternes opmærksomhed.',
    whyRoutine:
      'Parlamentarisk aktivitetsopdatering for {date}: {events} begivenheder og {procedures} igangværende procedurer.',
    impactPolitical:
      'Seneste udviklinger den {date} med {adopted} vedtagelser og {events} begivenheder former politisk gruppedynamik og koalitionsberegninger for kommende lovgivningssessioner.',
    impactEconomicAdopted:
      '{adopted} vedtagne lovgivningstekst(er) introducerer potentielle regulatoriske ændringer, der påvirker økonomiske aktører og markedsforhold i EU-medlemsstater.',
    impactEconomicNone:
      'Nuværende parlamentarisk aktivitet har begrænset umiddelbar økonomisk indvirkning, selvom igangværende procedurer kan påvirke fremtidige reguleringsrammer.',
    impactSocial: 'Parlamentarisk aktivitet den {date} afspejler institutionelt engagement.',
    impactSocialEvents: 'Planlagte begivenheder, der adresserer borgernes bekymringer.',
    impactSocialRoutine: 'Rutineprocedurer.',
    impactLegalAdopted:
      "{adopted} vedtagne tekst(er) avancerer gennem EU's lovgivningsproces med potentielle konsekvenser for retlige rammer og nationale gennemførelseskrav.",
    impactLegalNone:
      'Ingen nye retlige instrumenter vedtaget i denne periode; igangværende procedurer fortsætter gennem standard lovgivningsstadier.',
    impactGeopolitical:
      'EU-Parlamentets lovgivningsaktivitet den {date} bidrager til blokkens institutionelle troværdighed og kapacitet for internationalt engagement.',
    stakeholderWinnerReason:
      'Succesfuldt fremmet {adopted} lovgivningstekst(er) gennem vedtagelsesprocessen, hvilket demonstrerer effektiv koalitionskoordinering.',
    stakeholderNeutralReason:
      'Koalitionsdynamikken forbliver i bevægelse med igangværende forhandlinger på tværs af politiske grupper. Nuværende positionering afspejler strategisk tålmodighed snarere end afgørende tilpasning.',
    consequenceAdopted:
      'Vedtagelsen af "{title}" fremmer dette politikområde gennem lovgivningsprocessen og fastlægger nye regulatoriske parametre og politiske præcedenser.',
    consequenceProcedure:
      'Fremskridt med "{title}" bevæger denne procedure mod vedtagelse, hvilket kræver fortsat politisk koordinering blandt involverede grupper.',
    mistakeDescription: 'Afstemningsanomali opdaget: {description}',
    mistakeAlternative:
      'Forhåndskonsultation og tidlige advarselmekanismer inden for politiske grupper kunne have forudset og adresseret intern uenighed før plenarfstemningen.',
    outlookAdopted:
      'Seneste udviklinger den {date} baner vejen for fortsat lovgivningsaktivitet. Sandsynligt scenario: vedtagne tekster overgår til implementeringsfasen. Muligt scenario: politiske reaktioner udløser yderligere ændringer eller udfordringer i efterfølgende sessioner.',
    outlookRoutine:
      'Parlamentarisk aktivitet den {date} fortsætter i rutinepace. Sandsynligt scenario: standardprogression af igangværende procedurer. Muligt scenario: nye udviklinger kan accelerere specifikke politiksager.',
  },
  no: {
    whyAdopted:
      'Siste parlamentariske utvikling den {date} drevet av {adopted} nylig vedtatte tekst(er), {events} hendelser og {procedures} aktive prosedyrer. Denne utviklingen gjenspeiler akselerert lovgivningsaktivitet som krever interessentenes oppmerksomhet.',
    whyRoutine:
      'Oppdatering av parlamentarisk aktivitet for {date}: {events} hendelser og {procedures} pågående prosedyrer.',
    impactPolitical:
      'Siste utvikling den {date} med {adopted} vedtak og {events} hendelser former politisk gruppedynamikk og koalisjonsberegninger for kommende lovgivningssesjoner.',
    impactEconomicAdopted:
      '{adopted} vedtatte lovgivningstekst(er) introduserer potensielle regulatoriske endringer som påvirker økonomiske aktører og markedsforhold i EUs medlemsstater.',
    impactEconomicNone:
      'Nåværende parlamentarisk aktivitet har begrenset umiddelbar økonomisk innvirkning, selv om pågående prosedyrer kan påvirke fremtidige reguleringsrammer.',
    impactSocial: 'Parlamentarisk aktivitet den {date} gjenspeiler institusjonelt engasjement.',
    impactSocialEvents: 'Planlagte hendelser som adresserer borgernes bekymringer.',
    impactSocialRoutine: 'Rutineprosedyrer.',
    impactLegalAdopted:
      '{adopted} vedtatte tekst(er) avanserer gjennom EUs lovgivningsprosess med potensielle konsekvenser for rettslige rammer og nasjonale gjennomføringskrav.',
    impactLegalNone:
      'Ingen nye rettslige instrumenter vedtatt i denne perioden; pågående prosedyrer fortsetter gjennom standard lovgivningsstadier.',
    impactGeopolitical:
      'EU-parlamentets lovgivningsaktivitet den {date} bidrar til blokkens institusjonelle troverdighet og kapasitet for internasjonalt engasjement.',
    stakeholderWinnerReason:
      'Vellykket fremmet {adopted} lovgivningstekst(er) gjennom vedtakelsesprosessen, noe som demonstrerer effektiv koalisjonskoordinering.',
    stakeholderNeutralReason:
      'Koalisjonsdynamikken forblir i endring med pågående forhandlinger på tvers av politiske grupper. Nåværende posisjonering gjenspeiler strategisk tålmodighet snarere enn avgjørende tilpasning.',
    consequenceAdopted:
      'Vedtaket av "{title}" driver dette politikkområdet fremover gjennom lovgivningsprosessen og fastsetter nye regulatoriske parametere og politiske presedenser.',
    consequenceProcedure:
      'Fremgang i "{title}" flytter denne prosedyren mot vedtak, noe som krever fortsatt politisk koordinering blant involverte grupper.',
    mistakeDescription: 'Avstemningsavvik oppdaget: {description}',
    mistakeAlternative:
      'Forhåndskonsultasjon og tidlige varslingsmekanismer innen politiske grupper kunne ha forutsett og adressert intern uenighet før plenaravstemmingen.',
    outlookAdopted:
      'Siste utvikling den {date} legger grunnlaget for fortsatt lovgivningsaktivitet. Sannsynlig scenario: vedtatte tekster går videre til implementeringsfasen. Mulig scenario: politiske reaksjoner utløser ytterligere endringer eller utfordringer i påfølgende sesjoner.',
    outlookRoutine:
      'Parlamentarisk aktivitet den {date} fortsetter i normalt tempo. Sannsynlig scenario: standard progresjon av pågående prosedyrer. Mulig scenario: nye utviklinger kan akselerere spesifikke politikkfiler.',
  },
  fi: {
    whyAdopted:
      'Tuoreet parlamentaariset kehityskulut {date} perustuvat {adopted} äskettäin hyväksyttyyn tekstiin, {events} tapahtumaan ja {procedures} aktiiviseen menettelyyn. Nämä kehityskulut heijastavat kiihtynyttä lainsäädäntötoimintaa, joka vaatii sidosryhmien huomiota.',
    whyRoutine:
      'Parlamentaarisen toiminnan päivitys {date}: {events} tapahtumaa ja {procedures} meneillään olevaa menettelyä.',
    impactPolitical:
      'Tuoreet kehityskulut {date} ja {adopted} hyväksymistä sekä {events} tapahtumaa muovaavat poliittisten ryhmien dynamiikkaa ja koalitiolaskelmia tulevia lainsäädäntöistuntoja varten.',
    impactEconomicAdopted:
      '{adopted} hyväksyttyä lainsäädäntötekstiä tuovat mahdollisia sääntelymuutoksia, jotka vaikuttavat taloudellisiin toimijoihin ja markkinaolosuhteisiin EU:n jäsenvaltioissa.',
    impactEconomicNone:
      'Nykyisellä parlamentaarisella toiminnalla on rajallinen välitön taloudellinen vaikutus, vaikka meneillään olevat menettelyt voivat vaikuttaa tuleviin sääntelykehyksiin.',
    impactSocial: 'Parlamentaarinen toiminta {date} heijastaa institutionaalista sitoutumista.',
    impactSocialEvents: 'Aikataulutetut tapahtumat, jotka käsittelevät kansalaisten huolenaiheita.',
    impactSocialRoutine: 'Rutiinimenettelyt.',
    impactLegalAdopted:
      '{adopted} hyväksyttyä tekstiä etenee EU:n lainsäädäntöprosessissa mahdollisine vaikutuksineen oikeudellisiin kehyksiin ja kansallisiin täytäntöönpanovaatimuksiin.',
    impactLegalNone:
      'Ei uusia oikeudellisia instrumentteja hyväksytty tänä aikana; meneillään olevat menettelyt jatkuvat tavanomaisten lainsäädäntövaiheiden kautta.',
    impactGeopolitical:
      'EU-parlamentin lainsäädäntötoiminta {date} edistää yhteisön institutionaalista uskottavuutta ja kykyä kansainväliseen sitoutumiseen.',
    stakeholderWinnerReason:
      'Onnistuneesti edistänyt {adopted} lainsäädäntötekstiä hyväksymisprosessin läpi, osoittaen tehokasta koalitiokoordinointia.',
    stakeholderNeutralReason:
      'Koalitiodynamiikka pysyy liikkeessä meneillään olevien poliittisten ryhmien välisten neuvottelujen myötä. Nykyinen asemointi heijastaa strategista kärsivällisyyttä pikemminkin kuin ratkaisevaa linjausta.',
    consequenceAdopted:
      '"{title}" hyväksyminen edistää tätä politiikka-aluetta lainsäädäntöprosessin kautta ja luo uusia sääntelyparametreja ja poliittisia ennakkotapauksia.',
    consequenceProcedure:
      '"{title}" edistyminen siirtää tätä menettelyä kohti hyväksymistä, mikä vaatii jatkuvaa poliittista koordinointia osallisten ryhmien kesken.',
    mistakeDescription: 'Äänestyspoikkeama havaittu: {description}',
    mistakeAlternative:
      'Ennakkoäänestyskonsultaatio ja varhaiset varoitusmekanismit poliittisten ryhmien sisällä olisivat voineet ennakoida ja käsitellä sisäistä erimielisyyttä ennen täysistuntoäänestystä.',
    outlookAdopted:
      'Tuoreet kehityskulut {date} luovat pohjan jatkuvalle lainsäädäntötoiminnalle. Todennäköinen skenaario: hyväksytyt tekstit etenevät täytäntöönpanovaiheeseen. Mahdollinen skenaario: poliittiset reaktiot laukaisevat lisämuutoksia tai haasteita seuraavissa istunnoissa.',
    outlookRoutine:
      'Parlamentaarinen toiminta {date} jatkuu tavanomaisessa tahdissa. Todennäköinen skenaario: vireillä olevien menettelyjen standardieteneminen. Mahdollinen skenaario: uudet kehityskulut voivat nopeuttaa tiettyjä politiikka-asioita.',
  },
  de: {
    whyAdopted:
      'Aktuelle parlamentarische Entwicklungen am {date}, angetrieben durch {adopted} neu angenommene(n) Text(e), {events} Veranstaltungen und {procedures} aktive Verfahren. Diese Entwicklungen spiegeln beschleunigte Gesetzgebungstätigkeit wider, die die Aufmerksamkeit der Interessengruppen erfordert.',
    whyRoutine:
      'Aktualisierung der parlamentarischen Aktivität für {date}: {events} Veranstaltungen und {procedures} laufende Verfahren.',
    impactPolitical:
      'Aktuelle Entwicklungen am {date} mit {adopted} Annahmen und {events} Veranstaltungen formen die Fraktionsdynamik und Koalitionsberechnungen für kommende Gesetzgebungssitzungen.',
    impactEconomicAdopted:
      '{adopted} angenommene(r) Gesetzgebungstext(e) führen potenzielle regulatorische Änderungen ein, die Wirtschaftsakteure und Marktbedingungen in den EU-Mitgliedstaaten betreffen.',
    impactEconomicNone:
      'Die aktuelle parlamentarische Tätigkeit hat begrenzte unmittelbare wirtschaftliche Auswirkungen, obwohl laufende Verfahren zukünftige Regulierungsrahmen beeinflussen können.',
    impactSocial:
      'Parlamentarische Tätigkeit am {date} spiegelt institutionelles Engagement wider.',
    impactSocialEvents: 'Geplante Veranstaltungen, die Bürgeranliegen behandeln.',
    impactSocialRoutine: 'Routineverfahren.',
    impactLegalAdopted:
      '{adopted} angenommene(r) Text(e) durchlaufen den EU-Gesetzgebungsprozess mit potenziellen Auswirkungen auf Rechtsrahmen und nationale Umsetzungsanforderungen.',
    impactLegalNone:
      'Keine neuen Rechtsinstrumente in diesem Zeitraum angenommen; laufende Verfahren durchlaufen weiterhin die regulären Gesetzgebungsphasen.',
    impactGeopolitical:
      'Die Gesetzgebungstätigkeit des EU-Parlaments am {date} trägt zur institutionellen Glaubwürdigkeit des Blocks und seiner Kapazität für internationales Engagement bei.',
    stakeholderWinnerReason:
      '{adopted} Gesetzgebungstext(e) erfolgreich durch den Annahmeprozess gebracht, was effektive Koalitionskoordinierung demonstriert.',
    stakeholderNeutralReason:
      'Die Koalitionsdynamik bleibt mit laufenden Verhandlungen zwischen den Fraktionen im Fluss. Die aktuelle Positionierung spiegelt strategische Geduld wider, nicht entscheidende Ausrichtung.',
    consequenceAdopted:
      'Die Annahme von "{title}" treibt diesen Politikbereich durch den Gesetzgebungsprozess voran und legt neue regulatorische Parameter und politische Präzedenzfälle fest.',
    consequenceProcedure:
      'Fortschritte bei "{title}" bringen dieses Verfahren der Annahme näher, was eine fortgesetzte politische Koordinierung zwischen den beteiligten Gruppen erfordert.',
    mistakeDescription: 'Abstimmungsanomalie festgestellt: {description}',
    mistakeAlternative:
      'Vorabkonsultationen und Frühwarnsysteme innerhalb der Fraktionen hätten interne Meinungsverschiedenheiten vor der Plenarfabstimmung vorhersehen und ansprechen können.',
    outlookAdopted:
      'Aktuelle Entwicklungen am {date} bereiten den Boden für fortgesetzte Gesetzgebungstätigkeit. Wahrscheinliches Szenario: angenommene Texte gehen in die Umsetzungsphase über. Mögliches Szenario: politische Reaktionen lösen zusätzliche Änderungsanträge oder Anfechtungen in nachfolgenden Sitzungen aus.',
    outlookRoutine:
      'Parlamentarische Tätigkeit am {date} setzt sich im Routinetempo fort. Wahrscheinliches Szenario: regulärer Fortschritt laufender Verfahren. Mögliches Szenario: aufkommende Entwicklungen können bestimmte Politikdossiers beschleunigen.',
  },
  fr: {
    whyAdopted:
      "Derniers développements parlementaires le {date} portés par {adopted} texte(s) nouvellement adopté(s), {events} événements et {procedures} procédures actives. Ces développements reflètent une activité législative accélérée nécessitant l'attention des parties prenantes.",
    whyRoutine:
      "Mise à jour de l'activité parlementaire pour le {date} : {events} événements et {procedures} procédures en cours.",
    impactPolitical:
      'Les derniers développements le {date} avec {adopted} adoptions et {events} événements façonnent la dynamique des groupes politiques et les calculs de coalition pour les prochaines sessions législatives.',
    impactEconomicAdopted:
      "{adopted} texte(s) législatif(s) adopté(s) introduisent des changements réglementaires potentiels affectant les opérateurs économiques et les conditions de marché dans les États membres de l'UE.",
    impactEconomicNone:
      "L'activité parlementaire actuelle a un impact économique immédiat limité, bien que les procédures en cours puissent affecter les cadres réglementaires futurs.",
    impactSocial: "L'activité parlementaire le {date} reflète l'engagement institutionnel.",
    impactSocialEvents: 'Événements programmés traitant des préoccupations des citoyens.',
    impactSocialRoutine: 'Procédures de routine.',
    impactLegalAdopted:
      "{adopted} texte(s) adopté(s) progressent dans le processus législatif de l'UE, avec des implications potentielles pour les cadres juridiques et les exigences de transposition nationale.",
    impactLegalNone:
      'Aucun nouvel instrument juridique adopté durant cette période ; les procédures en cours se poursuivent à travers les étapes législatives standard.',
    impactGeopolitical:
      "L'activité législative du Parlement européen le {date} contribue à la crédibilité institutionnelle du bloc et à sa capacité d'engagement international.",
    stakeholderWinnerReason:
      "{adopted} texte(s) législatif(s) avancé(s) avec succès dans le processus d'adoption, démontrant une coordination de coalition efficace.",
    stakeholderNeutralReason:
      "La dynamique de coalition reste mouvante avec des négociations en cours entre les groupes politiques. Le positionnement actuel reflète une patience stratégique plutôt qu'un alignement décisif.",
    consequenceAdopted:
      "L'adoption de « {title} » fait progresser ce domaine politique dans le processus législatif, établissant de nouveaux paramètres réglementaires et des précédents politiques.",
    consequenceProcedure:
      "Les progrès sur « {title} » rapprochent cette procédure de l'adoption, nécessitant une coordination politique continue entre les groupes impliqués.",
    mistakeDescription: 'Anomalie de vote détectée : {description}',
    mistakeAlternative:
      "Des consultations préalables au vote et des mécanismes d'alerte précoce au sein des groupes politiques auraient pu anticiper et traiter la dissidence interne avant le vote en plénière.",
    outlookAdopted:
      'Les derniers développements le {date} préparent le terrain pour une activité législative continue. Scénario probable : les textes adoptés passent à la phase de mise en œuvre. Scénario possible : des réactions politiques déclenchent des amendements supplémentaires ou des contestations lors des sessions suivantes.',
    outlookRoutine:
      "L'activité parlementaire le {date} se poursuit à un rythme de routine. Scénario probable : progression standard des procédures en cours. Scénario possible : des développements émergents peuvent accélérer certains dossiers politiques.",
  },
  es: {
    whyAdopted:
      'Últimos desarrollos parlamentarios el {date} impulsados por {adopted} texto(s) recientemente adoptado(s), {events} eventos y {procedures} procedimientos activos. Estos desarrollos reflejan una actividad legislativa acelerada que requiere la atención de las partes interesadas.',
    whyRoutine:
      'Actualización de la actividad parlamentaria para el {date}: {events} eventos y {procedures} procedimientos en curso.',
    impactPolitical:
      'Los últimos desarrollos el {date} con {adopted} adopciones y {events} eventos configuran la dinámica de grupos políticos y los cálculos de coalición para las próximas sesiones legislativas.',
    impactEconomicAdopted:
      '{adopted} texto(s) legislativo(s) adoptado(s) introducen cambios regulatorios potenciales que afectan a los operadores económicos y las condiciones de mercado en los Estados miembros de la UE.',
    impactEconomicNone:
      'La actividad parlamentaria actual tiene un impacto económico inmediato limitado, aunque los procedimientos en curso pueden afectar los marcos regulatorios futuros.',
    impactSocial: 'La actividad parlamentaria el {date} refleja el compromiso institucional.',
    impactSocialEvents: 'Eventos programados que abordan las preocupaciones de los ciudadanos.',
    impactSocialRoutine: 'Procedimientos de rutina.',
    impactLegalAdopted:
      '{adopted} texto(s) adoptado(s) avanzan en el proceso legislativo de la UE, con posibles implicaciones para los marcos jurídicos y los requisitos de transposición nacional.',
    impactLegalNone:
      'No se adoptaron nuevos instrumentos jurídicos en este período; los procedimientos en curso continúan a través de las etapas legislativas estándar.',
    impactGeopolitical:
      'La actividad legislativa del Parlamento Europeo el {date} contribuye a la credibilidad institucional del bloque y su capacidad de compromiso internacional.',
    stakeholderWinnerReason:
      '{adopted} texto(s) legislativo(s) avanzado(s) exitosamente a través del proceso de adopción, demostrando una coordinación de coalición eficaz.',
    stakeholderNeutralReason:
      'La dinámica de coalición permanece en movimiento con negociaciones en curso entre grupos políticos. El posicionamiento actual refleja paciencia estratégica más que alineación decisiva.',
    consequenceAdopted:
      'La adopción de "{title}" avanza esta área política a través del proceso legislativo, estableciendo nuevos parámetros regulatorios y precedentes políticos.',
    consequenceProcedure:
      'El progreso en "{title}" acerca este procedimiento a la adopción, requiriendo coordinación política continua entre los grupos involucrados.',
    mistakeDescription: 'Anomalía de votación detectada: {description}',
    mistakeAlternative:
      'Consultas previas a la votación y mecanismos de alerta temprana dentro de los grupos políticos podrían haber anticipado y abordado la disidencia interna antes de la votación en el pleno.',
    outlookAdopted:
      'Los últimos desarrollos el {date} preparan el escenario para una actividad legislativa continuada. Escenario probable: los textos adoptados proceden a la fase de implementación. Escenario posible: las reacciones políticas desencadenan enmiendas adicionales o impugnaciones en sesiones posteriores.',
    outlookRoutine:
      'La actividad parlamentaria el {date} continúa a ritmo rutinario. Escenario probable: progresión estándar de los procedimientos pendientes. Escenario posible: desarrollos emergentes pueden acelerar expedientes políticos específicos.',
  },
  nl: {
    whyAdopted:
      'Laatste parlementaire ontwikkelingen op {date} gedreven door {adopted} nieuw aangenomen tekst(en), {events} evenementen en {procedures} actieve procedures. Deze ontwikkelingen weerspiegelen versnelde wetgevingsactiviteit die aandacht van belanghebbenden vereist.',
    whyRoutine:
      'Parlementaire activiteitenupdate voor {date}: {events} evenementen en {procedures} lopende procedures.',
    impactPolitical:
      'Laatste ontwikkelingen op {date} met {adopted} aannames en {events} evenementen vormen fractiedynamiek en coalitieberekeningen voor komende wetgevingssessies.',
    impactEconomicAdopted:
      '{adopted} aangenomen wetgevingstekst(en) introduceren potentiële regelgevingswijzigingen die economische operatoren en marktomstandigheden in EU-lidstaten beïnvloeden.',
    impactEconomicNone:
      'Huidige parlementaire activiteit heeft beperkte directe economische impact, hoewel lopende procedures toekomstige regelgevingskaders kunnen beïnvloeden.',
    impactSocial: 'Parlementaire activiteit op {date} weerspiegelt institutionele betrokkenheid.',
    impactSocialEvents: 'Geplande evenementen die burgerbelangen behandelen.',
    impactSocialRoutine: 'Routineprocedures.',
    impactLegalAdopted:
      '{adopted} aangenomen tekst(en) vorderen in het EU-wetgevingsproces met mogelijke gevolgen voor rechtskaders en nationale omzettingsvereisten.',
    impactLegalNone:
      'Geen nieuwe rechtsinstrumenten aangenomen in deze periode; lopende procedures gaan door via standaard wetgevingsfasen.',
    impactGeopolitical:
      'De wetgevingsactiviteit van het EU-Parlement op {date} draagt bij aan de institutionele geloofwaardigheid van het blok en het vermogen tot internationaal engagement.',
    stakeholderWinnerReason:
      '{adopted} wetgevingstekst(en) succesvol door het aannemingsproces geloodst, wat effectieve coalitiecoördinatie demonstreert.',
    stakeholderNeutralReason:
      'Coalitiedynamiek blijft in beweging met lopende onderhandelingen tussen fracties. Huidige positionering weerspiegelt strategisch geduld in plaats van beslissende afstemming.',
    consequenceAdopted:
      'De aanname van "{title}" brengt dit beleidsterrein verder in het wetgevingsproces en stelt nieuwe regelgevingsparameters en politieke precedenten vast.',
    consequenceProcedure:
      'Voortgang met "{title}" brengt deze procedure dichter bij aanname, wat voortdurende politieke coördinatie tussen betrokken fracties vereist.',
    mistakeDescription: 'Stemanomalie gedetecteerd: {description}',
    mistakeAlternative:
      'Voorafgaande consultatie en vroegtijdige waarschuwingsmechanismen binnen fracties hadden interne onenigheid kunnen voorzien en aanpakken vóór de plenaire stemming.',
    outlookAdopted:
      'Laatste ontwikkelingen op {date} bereiden de weg voor voortdurende wetgevingsactiviteit. Waarschijnlijk scenario: aangenomen teksten gaan naar de implementatiefase. Mogelijk scenario: politieke reacties veroorzaken aanvullende amendementen of uitdagingen in volgende sessies.',
    outlookRoutine:
      'Parlementaire activiteit op {date} gaat in routinematig tempo door. Waarschijnlijk scenario: standaardvoortgang van lopende procedures. Mogelijk scenario: opkomende ontwikkelingen kunnen specifieke beleidsdossiers versnellen.',
  },
  ar: {
    whyAdopted:
      'أحدث التطورات البرلمانية في {date} مدفوعة بـ{adopted} نص(وص) معتمد(ة) حديثاً، و{events} حدث، و{procedures} إجراء نشط. تعكس هذه التطورات نشاطاً تشريعياً متسارعاً يتطلب اهتمام أصحاب المصلحة.',
    whyRoutine: 'تحديث النشاط البرلماني لـ{date}: {events} حدث و{procedures} إجراء قيد التنفيذ.',
    impactPolitical:
      'أحدث التطورات في {date} مع {adopted} اعتماد و{events} حدث تشكّل ديناميكيات المجموعات السياسية وحسابات الائتلاف للجلسات التشريعية القادمة.',
    impactEconomicAdopted:
      '{adopted} نص(وص) تشريعي(ة) معتمد(ة) تقدم تغييرات تنظيمية محتملة تؤثر على المشغلين الاقتصاديين وظروف السوق في الدول الأعضاء في الاتحاد الأوروبي.',
    impactEconomicNone:
      'النشاط البرلماني الحالي له تأثير اقتصادي مباشر محدود، رغم أن الإجراءات الجارية قد تؤثر على الأطر التنظيمية المستقبلية.',
    impactSocial: 'النشاط البرلماني في {date} يعكس الالتزام المؤسسي.',
    impactSocialEvents: 'أحداث مجدولة تعالج مخاوف المواطنين.',
    impactSocialRoutine: 'إجراءات روتينية.',
    impactLegalAdopted:
      '{adopted} نص(وص) معتمد(ة) يتقدم(تتقدم) عبر العملية التشريعية للاتحاد الأوروبي مع آثار محتملة على الأطر القانونية ومتطلبات التحويل الوطنية.',
    impactLegalNone:
      'لم تُعتمد أدوات قانونية جديدة في هذه الفترة؛ الإجراءات الجارية تستمر عبر المراحل التشريعية المعتادة.',
    impactGeopolitical:
      'النشاط التشريعي للبرلمان الأوروبي في {date} يسهم في المصداقية المؤسسية للكتلة وقدرتها على المشاركة الدولية.',
    stakeholderWinnerReason:
      'نجح في دفع {adopted} نص(وص) تشريعي(ة) عبر عملية الاعتماد، مما يُظهر تنسيقاً ائتلافياً فعالاً.',
    stakeholderNeutralReason:
      'ديناميكيات الائتلاف تبقى في حالة تغير مع المفاوضات الجارية عبر المجموعات السياسية. التموضع الحالي يعكس صبراً استراتيجياً بدلاً من توافق حاسم.',
    consequenceAdopted:
      'اعتماد "{title}" يدفع هذا المجال السياسي قدماً عبر العملية التشريعية، مرسياً معايير تنظيمية جديدة وسوابق سياسية.',
    consequenceProcedure:
      'التقدم في "{title}" يقرّب هذا الإجراء من الاعتماد، مما يتطلب تنسيقاً سياسياً مستمراً بين المجموعات المعنية.',
    mistakeDescription: 'شذوذ في التصويت مكتشف: {description}',
    mistakeAlternative:
      'كان من الممكن أن تتوقع المشاورات قبل التصويت وآليات الإنذار المبكر داخل المجموعات السياسية المعارضة الداخلية وتعالجها قبل التصويت في الجلسة العامة.',
    outlookAdopted:
      'أحدث التطورات في {date} تمهد الطريق لنشاط تشريعي مستمر. السيناريو المرجح: النصوص المعتمدة تنتقل إلى مرحلة التنفيذ. سيناريو محتمل: ردود الفعل السياسية تؤدي إلى تعديلات إضافية أو طعون في الجلسات اللاحقة.',
    outlookRoutine:
      'النشاط البرلماني في {date} يستمر بوتيرة روتينية. السيناريو المرجح: تقدم معياري للإجراءات المعلقة. سيناريو محتمل: تطورات ناشئة قد تسرّع ملفات سياسية محددة.',
  },
  he: {
    whyAdopted:
      'התפתחויות פרלמנטריות אחרונות ב-{date} מונעות על ידי {adopted} טקסט(ים) שאושר(ו) לאחרונה, {events} אירועים, ו-{procedures} הליכים פעילים. התפתחויות אלו משקפות פעילות חקיקתית מואצת הדורשת תשומת לב של בעלי עניין.',
    whyRoutine: 'עדכון פעילות פרלמנטרית ל-{date}: {events} אירועים ו-{procedures} הליכים בהתקדמות.',
    impactPolitical:
      'התפתחויות אחרונות ב-{date} עם {adopted} אישורים ו-{events} אירועים מעצבות דינמיקת סיעות פוליטיות וחישובי קואליציה למושבי חקיקה קרובים.',
    impactEconomicAdopted:
      '{adopted} טקסט(ים) חקיקתי(ים) שאושר(ו) מציג(ים) שינויים רגולטוריים פוטנציאליים המשפיעים על גורמים כלכליים ותנאי שוק במדינות החברות באיחוד האירופי.',
    impactEconomicNone:
      'לפעילות הפרלמנטרית הנוכחית השפעה כלכלית מיידית מוגבלת, אם כי הליכים מתמשכים עשויים להשפיע על מסגרות רגולטוריות עתידיות.',
    impactSocial: 'פעילות פרלמנטרית ב-{date} משקפת מעורבות מוסדית.',
    impactSocialEvents: 'אירועים מתוכננים המטפלים בדאגות אזרחים.',
    impactSocialRoutine: 'הליכים שגרתיים.',
    impactLegalAdopted:
      '{adopted} טקסט(ים) שאושר(ו) מתקדם(ים) בתהליך החקיקתי של האיחוד האירופי, עם השלכות אפשריות על מסגרות משפטיות ודרישות יישום לאומיות.',
    impactLegalNone:
      'לא אושרו מכשירים משפטיים חדשים בתקופה זו; הליכים מתמשכים ממשיכים דרך שלבי חקיקה תקניים.',
    impactGeopolitical:
      'הפעילות החקיקתית של הפרלמנט האירופי ב-{date} תורמת לאמינות המוסדית של הגוש וליכולתו למעורבות בינלאומית.',
    stakeholderWinnerReason:
      'קידם בהצלחה {adopted} טקסט(ים) חקיקתי(ים) דרך תהליך האישור, המדגים תיאום קואליציוני יעיל.',
    stakeholderNeutralReason:
      'דינמיקת הקואליציה נותרת בתנועה עם משא ומתן מתמשך בין סיעות פוליטיות. המיצוב הנוכחי משקף סבלנות אסטרטגית ולא התיישרות מכרעת.',
    consequenceAdopted:
      'אישור "{title}" מקדם תחום מדיניות זה בתהליך החקיקתי, מבסס פרמטרים רגולטוריים חדשים ותקדימים פוליטיים.',
    consequenceProcedure:
      'התקדמות ב-"{title}" מקרבת הליך זה לאישור, מה שדורש תיאום פוליטי מתמשך בין הסיעות המעורבות.',
    mistakeDescription: 'חריגת הצבעה זוהתה: {description}',
    mistakeAlternative:
      'התייעצויות טרום-הצבעה ומנגנוני התרעה מוקדמת בתוך סיעות פוליטיות יכלו לצפות ולטפל במחלוקת פנימית לפני ההצבעה במליאה.',
    outlookAdopted:
      'התפתחויות אחרונות ב-{date} מכינות את הקרקע לפעילות חקיקתית מתמשכת. תרחיש סביר: טקסטים מאושרים עוברים לשלב היישום. תרחיש אפשרי: תגובות פוליטיות מעוררות תיקונים נוספים או אתגרים במושבים הבאים.',
    outlookRoutine:
      'פעילות פרלמנטרית ב-{date} ממשיכה בקצב שגרתי. תרחיש סביר: התקדמות תקנית של הליכים תלויים ועומדים. תרחיש אפשרי: התפתחויות מתהוות עשויות להאיץ תיקי מדיניות ספציפיים.',
  },
  ja: {
    whyAdopted:
      '{date}の最新議会動向は、{adopted}件の新たに採択されたテキスト、{events}件のイベント、{procedures}件の進行中の手続きに牽引されています。これらの動向は、利害関係者の注意を必要とする加速的な立法活動を反映しています。',
    whyRoutine: '{date}の議会活動更新：{events}件のイベントと{procedures}件の進行中の手続き。',
    impactPolitical:
      '{date}の最新動向は、{adopted}件の採択と{events}件のイベントにより、今後の立法会期に向けた政治グループの動態と連立計算を形成しています。',
    impactEconomicAdopted:
      '{adopted}件の採択された立法テキストは、EU加盟国全体の経済事業者と市場環境に影響する潜在的な規制変更を導入しています。',
    impactEconomicNone:
      '現在の議会活動は即時的な経済的影響が限定的ですが、進行中の手続きは将来の規制枠組みに影響する可能性があります。',
    impactSocial: '{date}の議会活動は制度的関与を反映しています。',
    impactSocialEvents: '市民の関心事項に対応する予定のイベント。',
    impactSocialRoutine: '通常の手続き。',
    impactLegalAdopted:
      '{adopted}件の採択されたテキストは、法的枠組みと国内法化要件への潜在的な影響を伴いながらEU立法プロセスを進んでいます。',
    impactLegalNone:
      'この期間に新たな法的手段は採択されていません。進行中の手続きは標準的な立法段階を通じて継続しています。',
    impactGeopolitical:
      '{date}のEU議会の立法活動は、ブロックの制度的信頼性と国際的関与能力に貢献しています。',
    stakeholderWinnerReason:
      '{adopted}件の立法テキストを採択プロセスを通じて成功裏に推進し、効果的な連立調整を実証しました。',
    stakeholderNeutralReason:
      '連立の動態は政治グループ間の進行中の交渉により流動的な状態が続いています。現在の位置づけは決定的な整列というよりも戦略的忍耐を反映しています。',
    consequenceAdopted:
      '「{title}」の採択はこの政策分野を立法プロセスを通じて前進させ、新たな規制パラメータと政治的先例を確立します。',
    consequenceProcedure:
      '「{title}」の進展はこの手続きを採択に近づけ、関係グループ間の継続的な政治的調整が必要です。',
    mistakeDescription: '投票異常が検出されました：{description}',
    mistakeAlternative:
      '政治グループ内の事前投票協議と早期警告メカニズムにより、本会議投票前に内部の異論を予測し対処することができたはずです。',
    outlookAdopted:
      '{date}の最新動向は継続的な立法活動の基盤を整えています。想定シナリオ：採択テキストが実施段階に移行。想定されるシナリオ：政治的反応が後続の会期で追加修正案や異議を引き起こす。',
    outlookRoutine:
      '{date}の議会活動は通常のペースで続いています。想定シナリオ：保留中の手続きの標準的な進行。想定されるシナリオ：新たな展開が特定の政策案件を加速させる可能性。',
  },
  ko: {
    whyAdopted:
      '{date}의 최신 의회 동향은 {adopted}건의 새로 채택된 텍스트, {events}건의 행사, {procedures}건의 활성 절차에 의해 주도되고 있습니다. 이러한 동향은 이해관계자의 관심을 요구하는 가속화된 입법 활동을 반영합니다.',
    whyRoutine: '{date} 의회 활동 업데이트: {events}건의 행사와 {procedures}건의 진행 중인 절차.',
    impactPolitical:
      '{date}의 최신 동향은 {adopted}건의 채택과 {events}건의 행사로 향후 입법 회기를 위한 정치 그룹 역학과 연합 계산을 형성하고 있습니다.',
    impactEconomicAdopted:
      '{adopted}건의 채택된 입법 텍스트는 EU 회원국 전체의 경제 운영자와 시장 조건에 영향을 미치는 잠재적 규제 변경을 도입합니다.',
    impactEconomicNone:
      '현재 의회 활동의 즉각적인 경제적 영향은 제한적이지만, 진행 중인 절차가 향후 규제 프레임워크에 영향을 미칠 수 있습니다.',
    impactSocial: '{date}의 의회 활동은 제도적 참여를 반영합니다.',
    impactSocialEvents: '시민의 관심사를 다루는 예정된 행사.',
    impactSocialRoutine: '일상적인 절차.',
    impactLegalAdopted:
      '{adopted}건의 채택된 텍스트는 법적 프레임워크와 국내법 전환 요구 사항에 잠재적 영향을 미치며 EU 입법 과정을 진행합니다.',
    impactLegalNone:
      '이 기간에 새로운 법적 수단이 채택되지 않았습니다. 진행 중인 절차는 표준 입법 단계를 통해 계속됩니다.',
    impactGeopolitical:
      '{date}의 EU 의회 입법 활동은 블록의 제도적 신뢰성과 국제적 참여 역량에 기여합니다.',
    stakeholderWinnerReason:
      '{adopted}건의 입법 텍스트를 채택 과정을 통해 성공적으로 추진하여 효과적인 연합 조정을 입증했습니다.',
    stakeholderNeutralReason:
      '연합 역학은 정치 그룹 간 진행 중인 협상으로 유동적인 상태를 유지합니다. 현재의 위치는 결정적 정렬이 아닌 전략적 인내를 반영합니다.',
    consequenceAdopted:
      '"{title}"의 채택은 이 정책 영역을 입법 과정을 통해 진전시키며, 새로운 규제 매개변수와 정치적 선례를 확립합니다.',
    consequenceProcedure:
      '"{title}"의 진전은 이 절차를 채택에 가까이 이동시키며, 관련 그룹 간의 지속적인 정치적 조정이 필요합니다.',
    mistakeDescription: '투표 이상 감지: {description}',
    mistakeAlternative:
      '정치 그룹 내 사전 투표 협의와 조기 경보 메커니즘이 본회의 투표 전에 내부 이견을 예측하고 해결할 수 있었습니다.',
    outlookAdopted:
      '{date}의 최신 동향은 지속적인 입법 활동의 기반을 마련합니다. 예상 시나리오: 채택된 텍스트가 이행 단계로 진행. 가능한 시나리오: 정치적 반응이 후속 회기에서 추가 수정안이나 이의를 촉발.',
    outlookRoutine:
      '{date}의 의회 활동은 일상적인 속도로 계속됩니다. 예상 시나리오: 계류 중인 절차의 표준 진행. 가능한 시나리오: 새로운 전개가 특정 정책 파일을 가속화할 수 있음.',
  },
  zh: {
    whyAdopted:
      '{date}的最新议会动态由{adopted}项新通过的文本、{events}场活动和{procedures}项活跃程序推动。这些动态反映了需要利益相关方关注的加速立法活动。',
    whyRoutine: '{date}议会活动更新：{events}场活动和{procedures}项进行中的程序。',
    impactPolitical:
      '{date}的最新动态包括{adopted}项通过和{events}场活动，塑造了政治团体动态和即将到来的立法会议的联盟计算。',
    impactEconomicAdopted:
      '{adopted}项通过的立法文本引入了影响欧盟成员国经济运营商和市场条件的潜在监管变化。',
    impactEconomicNone: '当前议会活动的即时经济影响有限，但正在进行的程序可能影响未来的监管框架。',
    impactSocial: '{date}的议会活动反映了机构参与。',
    impactSocialEvents: '处理公民关切的预定活动。',
    impactSocialRoutine: '常规程序。',
    impactLegalAdopted:
      '{adopted}项通过的文本在欧盟立法程序中推进，对法律框架和国内转化要求具有潜在影响。',
    impactLegalNone: '本期间未通过新的法律文书；正在进行的程序通过标准立法阶段继续推进。',
    impactGeopolitical: '欧盟议会在{date}的立法活动有助于该集团的机构信誉和国际参与能力。',
    stakeholderWinnerReason: '成功推动{adopted}项立法文本通过采纳过程，展示了有效的联盟协调。',
    stakeholderNeutralReason:
      '联盟动态随着政治团体间持续的谈判而保持流动。当前定位反映的是战略耐心而非决定性的结盟。',
    consequenceAdopted:
      '"{title}"的通过推动了该政策领域在立法程序中的进展，确立了新的监管参数和政治先例。',
    consequenceProcedure: '"{title}"的进展推动该程序走向通过，需要相关团体之间的持续政治协调。',
    mistakeDescription: '检测到投票异常：{description}',
    mistakeAlternative: '政治团体内的投票前协商和预警机制本可以在全体投票前预见并解决内部异议。',
    outlookAdopted:
      '{date}的最新动态为持续的立法活动奠定了基础。可能情景：通过的文本进入实施阶段。可能情景：政治反应在后续会议中触发额外修正案或质疑。',
    outlookRoutine:
      '{date}的议会活动以常规节奏继续。可能情景：待处理程序的标准推进。可能情景：新的发展可能加速特定政策文件。',
  },
};
/* eslint-enable sonarjs/no-duplicate-string */

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
    /* eslint-disable sonarjs/no-duplicate-string -- Translated analysis strings share common terms across languages */
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
    overallConfidenceLabel: 'Overall Confidence',
    pendingNotice:
      'Analysis pending — this section will be completed by the editorial intelligence workflow.',
    perspectivesHeading: 'Multi-Stakeholder Perspectives',
    outcomeMatrixHeading: 'Stakeholder Outcome Matrix',
    confidenceLabel: 'Confidence',
    politicalGroupsLabel: 'Political Groups',
    civilSocietyLabel: 'Civil Society',
    industryLabel: 'Industry',
    nationalGovtsLabel: 'National Governments',
    citizensLabel: 'Citizens',
    euInstitutionsLabel: 'EU Institutions',
    positiveLabel: 'Positive',
    negativeLabel: 'Negative',
    mixedLabel: 'Mixed',
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
    executiveSummaryHeading: 'Sammanfattning',
    confidenceHigh: 'Hög Tillförlitlighet',
    confidenceMedium: 'Medel Tillförlitlighet',
    confidenceLow: 'Låg Tillförlitlighet',
    evidenceRefsHeading: 'Bevisning',
    counterArgumentsHeading: 'Motargument',
    conclusionLabel: 'Slutsats:',
    premiseLabel: 'Premiss:',
    inferenceLabel: 'Slutledning:',
    reasoningChainsHeading: 'Resonemangskedjor',
    scenarioPlanningHeading: 'Scenarioplanering',
    bestCaseLabel: 'Bästa Scenario',
    worstCaseLabel: 'Värsta Scenario',
    mostLikelyLabel: 'Mest Troligt',
    wildcardsLabel: 'Jokerkort',
    probabilityLabel: 'Sannolikhet',
    triggersLabel: 'Utlösare',
    impliedImpactsLabel: 'Förväntade Effekter',
    timelineLabel: 'Tidslinje',
    analysisMethodologyHeading: 'Analysmetodik',
    iterationCountLabel: 'Iterationer',
    evidenceStrengthLabel: 'Bevisstyrka',
    evidenceStrong: 'Stark',
    evidenceModerate: 'Måttlig',
    evidenceWeak: 'Svag',
    iterationInitial: 'Inledande Bedömning',
    iterationStakeholderChallenge: 'Intressentutmaning',
    iterationEvidenceValidation: 'Bevisvalidering',
    iterationSynthesis: 'Syntes',
    overallConfidenceLabel: 'Övergripande Tillförlitlighet',
    pendingNotice:
      'Analys väntar — denna sektion kommer att slutföras av det redaktionella analysarbetsflödet.',
    perspectivesHeading: 'Intressentperspektiv',
    outcomeMatrixHeading: 'Intressentutfallsmatris',
    confidenceLabel: 'Konfidens',
    politicalGroupsLabel: 'Politiska grupper',
    civilSocietyLabel: 'Civilsamhälle',
    industryLabel: 'Industri',
    nationalGovtsLabel: 'Nationella regeringar',
    citizensLabel: 'Medborgare',
    euInstitutionsLabel: 'EU-institutioner',
    positiveLabel: 'Positiv',
    negativeLabel: 'Negativ',
    mixedLabel: 'Blandad',
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
    executiveSummaryHeading: 'Resumé',
    confidenceHigh: 'Høj Tillid',
    confidenceMedium: 'Middel Tillid',
    confidenceLow: 'Lav Tillid',
    evidenceRefsHeading: 'Beviser',
    counterArgumentsHeading: 'Modargumenter',
    conclusionLabel: 'Konklusion:',
    premiseLabel: 'Præmis:',
    inferenceLabel: 'Slutning:',
    reasoningChainsHeading: 'Ræsonnementskæder',
    scenarioPlanningHeading: 'Scenarieplanlægning',
    bestCaseLabel: 'Bedste Scenarie',
    worstCaseLabel: 'Værste Scenarie',
    mostLikelyLabel: 'Mest Sandsynligt',
    wildcardsLabel: 'Jokere',
    probabilityLabel: 'Sandsynlighed',
    triggersLabel: 'Udløsere',
    impliedImpactsLabel: 'Forventede Konsekvenser',
    timelineLabel: 'Tidslinje',
    analysisMethodologyHeading: 'Analysemetodik',
    iterationCountLabel: 'Iterationer',
    evidenceStrengthLabel: 'Bevisstyrke',
    evidenceStrong: 'Stærk',
    evidenceModerate: 'Moderat',
    evidenceWeak: 'Svag',
    iterationInitial: 'Indledende Vurdering',
    iterationStakeholderChallenge: 'Interessentudfordring',
    iterationEvidenceValidation: 'Bevisvalidering',
    iterationSynthesis: 'Syntese',
    overallConfidenceLabel: 'Samlet Tillid',
    pendingNotice:
      'Analyse afventer — denne sektion vil blive udfyldt af det redaktionelle analyse-workflow.',
    perspectivesHeading: 'Interessentperspektiver',
    outcomeMatrixHeading: 'Interessentresultatmatrix',
    confidenceLabel: 'Konfidens',
    politicalGroupsLabel: 'Politiske grupper',
    civilSocietyLabel: 'Civilsamfund',
    industryLabel: 'Industri',
    nationalGovtsLabel: 'Nationale regeringer',
    citizensLabel: 'Borgere',
    euInstitutionsLabel: 'EU-institutioner',
    positiveLabel: 'Positiv',
    negativeLabel: 'Negativ',
    mixedLabel: 'Blandet',
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
    executiveSummaryHeading: 'Sammendrag',
    confidenceHigh: 'Høy Tillit',
    confidenceMedium: 'Middels Tillit',
    confidenceLow: 'Lav Tillit',
    evidenceRefsHeading: 'Bevis',
    counterArgumentsHeading: 'Motargumenter',
    conclusionLabel: 'Konklusjon:',
    premiseLabel: 'Premiss:',
    inferenceLabel: 'Slutning:',
    reasoningChainsHeading: 'Resonnementsrekker',
    scenarioPlanningHeading: 'Scenarioplanlegging',
    bestCaseLabel: 'Beste Scenario',
    worstCaseLabel: 'Verste Scenario',
    mostLikelyLabel: 'Mest Sannsynlig',
    wildcardsLabel: 'Jokere',
    probabilityLabel: 'Sannsynlighet',
    triggersLabel: 'Utløsere',
    impliedImpactsLabel: 'Forventede Konsekvenser',
    timelineLabel: 'Tidslinje',
    analysisMethodologyHeading: 'Analysemetodikk',
    iterationCountLabel: 'Iterasjoner',
    evidenceStrengthLabel: 'Bevisstyrke',
    evidenceStrong: 'Sterk',
    evidenceModerate: 'Moderat',
    evidenceWeak: 'Svak',
    iterationInitial: 'Innledende Vurdering',
    iterationStakeholderChallenge: 'Interessentutfordring',
    iterationEvidenceValidation: 'Bevisvalidering',
    iterationSynthesis: 'Syntese',
    overallConfidenceLabel: 'Samlet Tillit',
    pendingNotice:
      'Analyse avventer — denne seksjonen vil bli fullført av den redaksjonelle analyse-arbeidsflyten.',
    perspectivesHeading: 'Interessentperspektiver',
    outcomeMatrixHeading: 'Interessentutfallsmatrise',
    confidenceLabel: 'Konfidens',
    politicalGroupsLabel: 'Politiske grupper',
    civilSocietyLabel: 'Sivilsamfunn',
    industryLabel: 'Industri',
    nationalGovtsLabel: 'Nasjonale regjeringer',
    citizensLabel: 'Borgere',
    euInstitutionsLabel: 'EU-institusjoner',
    positiveLabel: 'Positiv',
    negativeLabel: 'Negativ',
    mixedLabel: 'Blandet',
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
    executiveSummaryHeading: 'Yhteenveto',
    confidenceHigh: 'Korkea Luotettavuus',
    confidenceMedium: 'Keskitason Luotettavuus',
    confidenceLow: 'Matala Luotettavuus',
    evidenceRefsHeading: 'Todisteet',
    counterArgumentsHeading: 'Vasta-argumentit',
    conclusionLabel: 'Johtopäätös:',
    premiseLabel: 'Lähtökohta:',
    inferenceLabel: 'Päätelmä:',
    reasoningChainsHeading: 'Päättelyketjut',
    scenarioPlanningHeading: 'Skenaarion Suunnittelu',
    bestCaseLabel: 'Paras Skenaario',
    worstCaseLabel: 'Pahin Skenaario',
    mostLikelyLabel: 'Todennäköisin',
    wildcardsLabel: 'Jokerikortit',
    probabilityLabel: 'Todennäköisyys',
    triggersLabel: 'Laukaisijat',
    impliedImpactsLabel: 'Odotetut Vaikutukset',
    timelineLabel: 'Aikajana',
    analysisMethodologyHeading: 'Analyysimenetelmä',
    iterationCountLabel: 'Iteraatiot',
    evidenceStrengthLabel: 'Todistusvoima',
    evidenceStrong: 'Vahva',
    evidenceModerate: 'Kohtalainen',
    evidenceWeak: 'Heikko',
    iterationInitial: 'Alustava Arviointi',
    iterationStakeholderChallenge: 'Sidosryhmähaaste',
    iterationEvidenceValidation: 'Todisteiden Validointi',
    iterationSynthesis: 'Synteesi',
    overallConfidenceLabel: 'Kokonaisluotettavuus',
    pendingNotice:
      'Analyysi odottaa — tämä osio täydennetään toimituksellisen analyysin työnkulussa.',
    perspectivesHeading: 'Sidosryhmänäkökulmat',
    outcomeMatrixHeading: 'Sidosryhmätulosmatriisi',
    confidenceLabel: 'Luotettavuus',
    politicalGroupsLabel: 'Poliittiset ryhmät',
    civilSocietyLabel: 'Kansalaisyhteiskunta',
    industryLabel: 'Teollisuus',
    nationalGovtsLabel: 'Kansalliset hallitukset',
    citizensLabel: 'Kansalaiset',
    euInstitutionsLabel: 'EU:n toimielimet',
    positiveLabel: 'Positiivinen',
    negativeLabel: 'Negatiivinen',
    mixedLabel: 'Sekalainen',
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
    executiveSummaryHeading: 'Zusammenfassung',
    confidenceHigh: 'Hohe Konfidenz',
    confidenceMedium: 'Mittlere Konfidenz',
    confidenceLow: 'Niedrige Konfidenz',
    evidenceRefsHeading: 'Belege',
    counterArgumentsHeading: 'Gegenargumente',
    conclusionLabel: 'Schlussfolgerung:',
    premiseLabel: 'Prämisse:',
    inferenceLabel: 'Ableitung:',
    reasoningChainsHeading: 'Argumentationsketten',
    scenarioPlanningHeading: 'Szenarioplanung',
    bestCaseLabel: 'Bester Fall',
    worstCaseLabel: 'Schlimmster Fall',
    mostLikelyLabel: 'Wahrscheinlichster Fall',
    wildcardsLabel: 'Unbekannte Faktoren',
    probabilityLabel: 'Wahrscheinlichkeit',
    triggersLabel: 'Auslöser',
    impliedImpactsLabel: 'Erwartete Auswirkungen',
    timelineLabel: 'Zeitachse',
    analysisMethodologyHeading: 'Analysemethodik',
    iterationCountLabel: 'Iterationen',
    evidenceStrengthLabel: 'Beweisstärke',
    evidenceStrong: 'Stark',
    evidenceModerate: 'Mäßig',
    evidenceWeak: 'Schwach',
    iterationInitial: 'Erstbewertung',
    iterationStakeholderChallenge: 'Stakeholder-Herausforderung',
    iterationEvidenceValidation: 'Beweisvalidierung',
    iterationSynthesis: 'Synthese',
    overallConfidenceLabel: 'Gesamtkonfidenz',
    pendingNotice:
      'Analyse ausstehend — dieser Abschnitt wird durch den redaktionellen Analyse-Workflow vervollständigt.',
    perspectivesHeading: 'Stakeholder-Perspektiven',
    outcomeMatrixHeading: 'Stakeholder-Ergebnismatrix',
    confidenceLabel: 'Konfidenz',
    politicalGroupsLabel: 'Politische Fraktionen',
    civilSocietyLabel: 'Zivilgesellschaft',
    industryLabel: 'Industrie',
    nationalGovtsLabel: 'Nationale Regierungen',
    citizensLabel: 'Bürger',
    euInstitutionsLabel: 'EU-Institutionen',
    positiveLabel: 'Positiv',
    negativeLabel: 'Negativ',
    mixedLabel: 'Gemischt',
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
    executiveSummaryHeading: 'Synthèse',
    confidenceHigh: 'Confiance Élevée',
    confidenceMedium: 'Confiance Moyenne',
    confidenceLow: 'Confiance Faible',
    evidenceRefsHeading: 'Preuves',
    counterArgumentsHeading: 'Contre-arguments',
    conclusionLabel: 'Conclusion :',
    premiseLabel: 'Prémisse :',
    inferenceLabel: 'Inférence :',
    reasoningChainsHeading: 'Chaînes de Raisonnement',
    scenarioPlanningHeading: 'Planification de Scénarios',
    bestCaseLabel: 'Meilleur Scénario',
    worstCaseLabel: 'Pire Scénario',
    mostLikelyLabel: 'Plus Probable',
    wildcardsLabel: 'Imprévus',
    probabilityLabel: 'Probabilité',
    triggersLabel: 'Déclencheurs',
    impliedImpactsLabel: 'Impacts Attendus',
    timelineLabel: 'Chronologie',
    analysisMethodologyHeading: "Méthodologie d'Analyse",
    iterationCountLabel: 'Itérations',
    evidenceStrengthLabel: 'Force des Preuves',
    evidenceStrong: 'Fort',
    evidenceModerate: 'Modéré',
    evidenceWeak: 'Faible',
    iterationInitial: 'Évaluation Initiale',
    iterationStakeholderChallenge: 'Défi des Parties Prenantes',
    iterationEvidenceValidation: 'Validation des Preuves',
    iterationSynthesis: 'Synthèse',
    overallConfidenceLabel: 'Confiance Globale',
    pendingNotice:
      "Analyse en attente — cette section sera complétée par le flux de travail d'analyse éditoriale.",
    perspectivesHeading: 'Perspectives des Parties Prenantes',
    outcomeMatrixHeading: 'Matrice des Résultats des Parties Prenantes',
    confidenceLabel: 'Confiance',
    politicalGroupsLabel: 'Groupes politiques',
    civilSocietyLabel: 'Société civile',
    industryLabel: 'Industrie',
    nationalGovtsLabel: 'Gouvernements nationaux',
    citizensLabel: 'Citoyens',
    euInstitutionsLabel: "Institutions de l'UE",
    positiveLabel: 'Positif',
    negativeLabel: 'Négatif',
    mixedLabel: 'Mixte',
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
    executiveSummaryHeading: 'Resumen Ejecutivo',
    confidenceHigh: 'Confianza Alta',
    confidenceMedium: 'Confianza Media',
    confidenceLow: 'Confianza Baja',
    evidenceRefsHeading: 'Evidencias',
    counterArgumentsHeading: 'Contraargumentos',
    conclusionLabel: 'Conclusión:',
    premiseLabel: 'Premisa:',
    inferenceLabel: 'Inferencia:',
    reasoningChainsHeading: 'Cadenas de Razonamiento',
    scenarioPlanningHeading: 'Planificación de Escenarios',
    bestCaseLabel: 'Mejor Escenario',
    worstCaseLabel: 'Peor Escenario',
    mostLikelyLabel: 'Más Probable',
    wildcardsLabel: 'Factores Imprevistos',
    probabilityLabel: 'Probabilidad',
    triggersLabel: 'Desencadenantes',
    impliedImpactsLabel: 'Impactos Previstos',
    timelineLabel: 'Cronología',
    analysisMethodologyHeading: 'Metodología de Análisis',
    iterationCountLabel: 'Iteraciones',
    evidenceStrengthLabel: 'Fuerza de la Evidencia',
    evidenceStrong: 'Fuerte',
    evidenceModerate: 'Moderada',
    evidenceWeak: 'Débil',
    iterationInitial: 'Evaluación Inicial',
    iterationStakeholderChallenge: 'Desafío de Partes Interesadas',
    iterationEvidenceValidation: 'Validación de Evidencia',
    iterationSynthesis: 'Síntesis',
    overallConfidenceLabel: 'Confianza Global',
    pendingNotice:
      'Análisis pendiente — esta sección será completada por el flujo de trabajo de análisis editorial.',
    perspectivesHeading: 'Perspectivas de las Partes Interesadas',
    outcomeMatrixHeading: 'Matriz de Resultados de Partes Interesadas',
    confidenceLabel: 'Confianza',
    politicalGroupsLabel: 'Grupos políticos',
    civilSocietyLabel: 'Sociedad civil',
    industryLabel: 'Industria',
    nationalGovtsLabel: 'Gobiernos nacionales',
    citizensLabel: 'Ciudadanos',
    euInstitutionsLabel: 'Instituciones de la UE',
    positiveLabel: 'Positivo',
    negativeLabel: 'Negativo',
    mixedLabel: 'Mixto',
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
    executiveSummaryHeading: 'Samenvatting',
    confidenceHigh: 'Hoog Vertrouwen',
    confidenceMedium: 'Gemiddeld Vertrouwen',
    confidenceLow: 'Laag Vertrouwen',
    evidenceRefsHeading: 'Bewijs',
    counterArgumentsHeading: 'Tegenargumenten',
    conclusionLabel: 'Conclusie:',
    premiseLabel: 'Premisse:',
    inferenceLabel: 'Gevolgtrekking:',
    reasoningChainsHeading: 'Redeneerketens',
    scenarioPlanningHeading: 'Scenarioplanning',
    bestCaseLabel: 'Beste Scenario',
    worstCaseLabel: 'Slechtste Scenario',
    mostLikelyLabel: 'Meest Waarschijnlijk',
    wildcardsLabel: 'Onverwachte Factoren',
    probabilityLabel: 'Waarschijnlijkheid',
    triggersLabel: 'Triggers',
    impliedImpactsLabel: 'Verwachte Effecten',
    timelineLabel: 'Tijdlijn',
    analysisMethodologyHeading: 'Analysemethodologie',
    iterationCountLabel: 'Iteraties',
    evidenceStrengthLabel: 'Bewijskracht',
    evidenceStrong: 'Sterk',
    evidenceModerate: 'Matig',
    evidenceWeak: 'Zwak',
    iterationInitial: 'Eerste Beoordeling',
    iterationStakeholderChallenge: 'Stakeholderuitdaging',
    iterationEvidenceValidation: 'Bewijsvalidatie',
    iterationSynthesis: 'Synthese',
    overallConfidenceLabel: 'Algeheel Vertrouwen',
    pendingNotice:
      'Analyse in afwachting — deze sectie wordt aangevuld door de redactionele analyse-workflow.',
    perspectivesHeading: 'Stakeholdersperspectieven',
    outcomeMatrixHeading: 'Stakeholdersresultaatmatrix',
    confidenceLabel: 'Vertrouwen',
    politicalGroupsLabel: 'Politieke fracties',
    civilSocietyLabel: 'Maatschappelijk middenveld',
    industryLabel: 'Industrie',
    nationalGovtsLabel: 'Nationale regeringen',
    citizensLabel: 'Burgers',
    euInstitutionsLabel: 'EU-instellingen',
    positiveLabel: 'Positief',
    negativeLabel: 'Negatief',
    mixedLabel: 'Gemengd',
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
    executiveSummaryHeading: 'ملخص تنفيذي',
    confidenceHigh: 'ثقة عالية',
    confidenceMedium: 'ثقة متوسطة',
    confidenceLow: 'ثقة منخفضة',
    evidenceRefsHeading: 'الأدلة',
    counterArgumentsHeading: 'حجج مضادة',
    conclusionLabel: 'استنتاج:',
    premiseLabel: 'مقدمة:',
    inferenceLabel: 'استدلال:',
    reasoningChainsHeading: 'سلاسل الاستدلال',
    scenarioPlanningHeading: 'تخطيط السيناريوهات',
    bestCaseLabel: 'أفضل سيناريو',
    worstCaseLabel: 'أسوأ سيناريو',
    mostLikelyLabel: 'الأكثر احتمالاً',
    wildcardsLabel: 'عوامل غير متوقعة',
    probabilityLabel: 'الاحتمالية',
    triggersLabel: 'المحفزات',
    impliedImpactsLabel: 'التأثيرات المتوقعة',
    timelineLabel: 'الجدول الزمني',
    analysisMethodologyHeading: 'منهجية التحليل',
    iterationCountLabel: 'التكرارات',
    evidenceStrengthLabel: 'قوة الأدلة',
    evidenceStrong: 'قوي',
    evidenceModerate: 'معتدل',
    evidenceWeak: 'ضعيف',
    iterationInitial: 'التقييم الأولي',
    iterationStakeholderChallenge: 'تحدي أصحاب المصلحة',
    iterationEvidenceValidation: 'التحقق من الأدلة',
    iterationSynthesis: 'التوليف',
    overallConfidenceLabel: 'الثقة الإجمالية',
    pendingNotice: 'التحليل معلق — سيتم استكمال هذا القسم بواسطة سير العمل التحريري التحليلي.',
    perspectivesHeading: 'وجهات نظر أصحاب المصلحة',
    outcomeMatrixHeading: 'مصفوفة نتائج أصحاب المصلحة',
    confidenceLabel: 'الثقة',
    politicalGroupsLabel: 'المجموعات السياسية',
    civilSocietyLabel: 'المجتمع المدني',
    industryLabel: 'الصناعة',
    nationalGovtsLabel: 'الحكومات الوطنية',
    citizensLabel: 'المواطنون',
    euInstitutionsLabel: 'مؤسسات الاتحاد الأوروبي',
    positiveLabel: 'إيجابي',
    negativeLabel: 'سلبي',
    mixedLabel: 'مختلط',
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
    executiveSummaryHeading: 'תקציר מנהלים',
    confidenceHigh: 'ביטחון גבוה',
    confidenceMedium: 'ביטחון בינוני',
    confidenceLow: 'ביטחון נמוך',
    evidenceRefsHeading: 'ראיות',
    counterArgumentsHeading: 'טענות נגד',
    conclusionLabel: 'מסקנה:',
    premiseLabel: 'הנחה:',
    inferenceLabel: 'היסק:',
    reasoningChainsHeading: 'שרשראות היסק',
    scenarioPlanningHeading: 'תכנון תרחישים',
    bestCaseLabel: 'תרחיש אופטימי',
    worstCaseLabel: 'תרחיש גרוע',
    mostLikelyLabel: 'הסביר ביותר',
    wildcardsLabel: 'גורמים בלתי צפויים',
    probabilityLabel: 'הסתברות',
    triggersLabel: 'טריגרים',
    impliedImpactsLabel: 'השפעות צפויות',
    timelineLabel: 'ציר זמן',
    analysisMethodologyHeading: 'מתודולוגיית ניתוח',
    iterationCountLabel: 'איטרציות',
    evidenceStrengthLabel: 'עוצמת הראיות',
    evidenceStrong: 'חזק',
    evidenceModerate: 'בינוני',
    evidenceWeak: 'חלש',
    iterationInitial: 'הערכה ראשונית',
    iterationStakeholderChallenge: 'אתגר בעלי עניין',
    iterationEvidenceValidation: 'אימות ראיות',
    iterationSynthesis: 'סינתזה',
    overallConfidenceLabel: 'ביטחון כולל',
    pendingNotice: 'ניתוח ממתין — חלק זה יושלם על ידי תהליך העבודה של הניתוח העורכי.',
    perspectivesHeading: 'נקודות מבט של בעלי עניין',
    outcomeMatrixHeading: 'מטריצת תוצאות בעלי עניין',
    confidenceLabel: 'ביטחון',
    politicalGroupsLabel: 'קבוצות פוליטיות',
    civilSocietyLabel: 'חברה אזרחית',
    industryLabel: 'תעשייה',
    nationalGovtsLabel: 'ממשלות לאומיות',
    citizensLabel: 'אזרחים',
    euInstitutionsLabel: 'מוסדות האיחוד האירופי',
    positiveLabel: 'חיובי',
    negativeLabel: 'שלילי',
    mixedLabel: 'מעורב',
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
    executiveSummaryHeading: 'エグゼクティブサマリー',
    confidenceHigh: '高い信頼度',
    confidenceMedium: '中程度の信頼度',
    confidenceLow: '低い信頼度',
    evidenceRefsHeading: '証拠',
    counterArgumentsHeading: '反論',
    conclusionLabel: '結論:',
    premiseLabel: '前提:',
    inferenceLabel: '推論:',
    reasoningChainsHeading: '推論チェーン',
    scenarioPlanningHeading: 'シナリオプランニング',
    bestCaseLabel: '最良シナリオ',
    worstCaseLabel: '最悪シナリオ',
    mostLikelyLabel: '最も可能性が高い',
    wildcardsLabel: '不確定要素',
    probabilityLabel: '確率',
    triggersLabel: 'トリガー',
    impliedImpactsLabel: '予想される影響',
    timelineLabel: 'タイムライン',
    analysisMethodologyHeading: '分析手法',
    iterationCountLabel: 'イテレーション',
    evidenceStrengthLabel: '証拠の強度',
    evidenceStrong: '強い',
    evidenceModerate: '中程度',
    evidenceWeak: '弱い',
    iterationInitial: '初期評価',
    iterationStakeholderChallenge: 'ステークホルダーの検証',
    iterationEvidenceValidation: '証拠の検証',
    iterationSynthesis: '総合',
    overallConfidenceLabel: '総合信頼度',
    pendingNotice: '分析保留中 — このセクションは編集分析ワークフローによって完了されます。',
    perspectivesHeading: 'ステークホルダーの視点',
    outcomeMatrixHeading: 'ステークホルダー結果マトリックス',
    confidenceLabel: '信頼度',
    politicalGroupsLabel: '政治グループ',
    civilSocietyLabel: '市民社会',
    industryLabel: '産業界',
    nationalGovtsLabel: '各国政府',
    citizensLabel: '市民',
    euInstitutionsLabel: 'EU機関',
    positiveLabel: '肯定的',
    negativeLabel: '否定的',
    mixedLabel: '混合',
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
    executiveSummaryHeading: '핵심 요약',
    confidenceHigh: '높은 신뢰도',
    confidenceMedium: '중간 신뢰도',
    confidenceLow: '낮은 신뢰도',
    evidenceRefsHeading: '증거',
    counterArgumentsHeading: '반론',
    conclusionLabel: '결론:',
    premiseLabel: '전제:',
    inferenceLabel: '추론:',
    reasoningChainsHeading: '추론 체인',
    scenarioPlanningHeading: '시나리오 계획',
    bestCaseLabel: '최선 시나리오',
    worstCaseLabel: '최악 시나리오',
    mostLikelyLabel: '가장 가능성 높은',
    wildcardsLabel: '불확실 요소',
    probabilityLabel: '확률',
    triggersLabel: '촉발 요인',
    impliedImpactsLabel: '예상 영향',
    timelineLabel: '타임라인',
    analysisMethodologyHeading: '분석 방법론',
    iterationCountLabel: '반복',
    evidenceStrengthLabel: '증거 강도',
    evidenceStrong: '강함',
    evidenceModerate: '보통',
    evidenceWeak: '약함',
    iterationInitial: '초기 평가',
    iterationStakeholderChallenge: '이해관계자 검증',
    iterationEvidenceValidation: '증거 검증',
    iterationSynthesis: '종합',
    overallConfidenceLabel: '종합 신뢰도',
    pendingNotice: '분석 대기 중 — 이 섹션은 편집 분석 워크플로에 의해 완성됩니다.',
    perspectivesHeading: '이해관계자 관점',
    outcomeMatrixHeading: '이해관계자 결과 매트릭스',
    confidenceLabel: '신뢰도',
    politicalGroupsLabel: '정치 그룹',
    civilSocietyLabel: '시민사회',
    industryLabel: '산업계',
    nationalGovtsLabel: '각국 정부',
    citizensLabel: '시민',
    euInstitutionsLabel: 'EU 기관',
    positiveLabel: '긍정적',
    negativeLabel: '부정적',
    mixedLabel: '혼합',
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
    executiveSummaryHeading: '执行摘要',
    confidenceHigh: '高置信度',
    confidenceMedium: '中等置信度',
    confidenceLow: '低置信度',
    evidenceRefsHeading: '证据',
    counterArgumentsHeading: '反驳论点',
    conclusionLabel: '结论：',
    premiseLabel: '前提：',
    inferenceLabel: '推理：',
    reasoningChainsHeading: '推理链',
    scenarioPlanningHeading: '情景规划',
    bestCaseLabel: '最佳情景',
    worstCaseLabel: '最坏情景',
    mostLikelyLabel: '最可能情景',
    wildcardsLabel: '不确定因素',
    probabilityLabel: '概率',
    triggersLabel: '触发因素',
    impliedImpactsLabel: '预期影响',
    timelineLabel: '时间线',
    analysisMethodologyHeading: '分析方法论',
    iterationCountLabel: '迭代次数',
    evidenceStrengthLabel: '证据强度',
    evidenceStrong: '强',
    evidenceModerate: '中等',
    evidenceWeak: '弱',
    iterationInitial: '初始评估',
    iterationStakeholderChallenge: '利益相关方审查',
    iterationEvidenceValidation: '证据验证',
    iterationSynthesis: '综合',
    overallConfidenceLabel: '整体置信度',
    pendingNotice: '分析待定 — 本节将由编辑分析工作流完成。',
    /* eslint-enable sonarjs/no-duplicate-string */
    perspectivesHeading: '利益相关方视角',
    outcomeMatrixHeading: '利益相关方结果矩阵',
    confidenceLabel: '置信度',
    politicalGroupsLabel: '政治团体',
    civilSocietyLabel: '公民社会',
    industryLabel: '工商界',
    nationalGovtsLabel: '各国政府',
    citizensLabel: '公民',
    euInstitutionsLabel: '欧盟机构',
    positiveLabel: '积极',
    negativeLabel: '消极',
    mixedLabel: '混合',
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

/** Localized strings for the week-ahead stakeholder impact section */
export const WEEK_AHEAD_STAKEHOLDER_STRINGS: LanguageMap<WeekAheadStakeholderStrings> = {
  en: {
    heading: 'Stakeholder Impact Analysis',
    temperatureLabel: 'Political Temperature',
    impactHeader: 'Impact',
    stakeholderHeader: 'Stakeholder',
    reasonHeader: 'Reason',
    tempLow: 'Low',
    tempModerate: 'Moderate',
    tempHigh: 'High',
    tempVeryHigh: 'Very High',
    stakeholderPoliticalGroups: 'Political Groups',
    stakeholderCivilSociety: 'Civil Society',
    stakeholderIndustry: 'Industry',
    stakeholderEuCitizens: 'EU Citizens',
    stakeholderNationalGovernments: 'National Governments',
    stakeholderEuInstitutions: 'EU Institutions',
    reasonEventsScheduled: '{count} parliamentary event(s) scheduled',
    reasonDocumentsUnderReview: '{count} legislative document(s) under review',
    reasonIndustryRegulatoryAgenda: 'Regulatory agenda may affect business environment',
    reasonCitizensDecisionsShapePolicy: 'Parliamentary decisions shape EU-wide policy',
    reasonDocumentsRequireTransposition: '{count} document(s) may require national transposition',
    reasonInstitutionsCoordination: 'Cross-institutional coordination required',
  },
  sv: {
    heading: 'Intressentanalys',
    temperatureLabel: 'Politisk Temperatur',
    impactHeader: 'Påverkan',
    stakeholderHeader: 'Intressent',
    reasonHeader: 'Anledning',
    tempLow: 'Låg',
    tempModerate: 'Måttlig',
    tempHigh: 'Hög',
    tempVeryHigh: 'Mycket hög',
    stakeholderPoliticalGroups: 'Politiska grupper',
    stakeholderCivilSociety: 'Civilsamhället',
    stakeholderIndustry: 'Industri',
    stakeholderEuCitizens: 'EU-medborgare',
    stakeholderNationalGovernments: 'Nationella regeringar',
    stakeholderEuInstitutions: 'EU-institutioner',
    reasonEventsScheduled: '{count} parlamentarisk(a) händelse(r) planerad(e)',
    reasonDocumentsUnderReview: '{count} lagstiftningsdokument under granskning',
    reasonIndustryRegulatoryAgenda: 'Regleringsagendan kan påverka företagsmiljön',
    reasonCitizensDecisionsShapePolicy: 'Parlamentariska beslut formar EU-omfattande politik',
    reasonDocumentsRequireTransposition: '{count} dokument kan kräva nationell införlivning',
    reasonInstitutionsCoordination: 'Interinstitutionell samordning krävs',
  },
  da: {
    heading: 'Interessentanalyse',
    temperatureLabel: 'Politisk Temperatur',
    impactHeader: 'Indvirkning',
    stakeholderHeader: 'Interessent',
    reasonHeader: 'Begrundelse',
    tempLow: 'Lav',
    tempModerate: 'Moderat',
    tempHigh: 'Høj',
    tempVeryHigh: 'Meget høj',
    stakeholderPoliticalGroups: 'Politiske grupper',
    stakeholderCivilSociety: 'Civilsamfundet',
    stakeholderIndustry: 'Industri',
    stakeholderEuCitizens: 'EU-borgere',
    stakeholderNationalGovernments: 'Nationale regeringer',
    stakeholderEuInstitutions: 'EU-institutioner',
    reasonEventsScheduled: '{count} parlamentarisk(e) begivenhed(er) planlagt',
    reasonDocumentsUnderReview: '{count} lovgivningsdokument(er) under gennemgang',
    reasonIndustryRegulatoryAgenda: 'Reguleringsagendaen kan påvirke erhvervsmiljøet',
    reasonCitizensDecisionsShapePolicy: 'Parlamentariske beslutninger former EU-dækkende politik',
    reasonDocumentsRequireTransposition: '{count} dokument(er) kan kræve national gennemførelse',
    reasonInstitutionsCoordination: 'Tværinstitutionel koordinering påkrævet',
  },
  no: {
    heading: 'Interessentanalyse',
    temperatureLabel: 'Politisk temperatur',
    impactHeader: 'Innvirkning',
    stakeholderHeader: 'Interessent',
    reasonHeader: 'Begrunnelse',
    tempLow: 'Lav',
    tempModerate: 'Moderat',
    tempHigh: 'Høy',
    tempVeryHigh: 'Svært høy',
    stakeholderPoliticalGroups: 'Politiske grupper',
    stakeholderCivilSociety: 'Sivilsamfunnet',
    stakeholderIndustry: 'Industri',
    stakeholderEuCitizens: 'EU-borgere',
    stakeholderNationalGovernments: 'Nasjonale regjeringer',
    stakeholderEuInstitutions: 'EU-institusjoner',
    reasonEventsScheduled: '{count} parlamentarisk(e) hendelse(r) planlagt',
    reasonDocumentsUnderReview: '{count} lovgivningsdokument(er) under behandling',
    reasonIndustryRegulatoryAgenda: 'Reguleringsagendaen kan påvirke næringslivet',
    reasonCitizensDecisionsShapePolicy: 'Parlamentariske beslutninger former EU-politikk',
    reasonDocumentsRequireTransposition: '{count} dokument(er) kan kreve nasjonal gjennomføring',
    reasonInstitutionsCoordination: 'Tverrinstitusjonell koordinering nødvendig',
  },
  fi: {
    heading: 'Sidosryhmäanalyysi',
    temperatureLabel: 'Poliittinen Lämpötila',
    impactHeader: 'Vaikutus',
    stakeholderHeader: 'Sidosryhmä',
    reasonHeader: 'Perustelu',
    tempLow: 'Matala',
    tempModerate: 'Kohtalainen',
    tempHigh: 'Korkea',
    tempVeryHigh: 'Erittäin korkea',
    stakeholderPoliticalGroups: 'Poliittiset ryhmät',
    stakeholderCivilSociety: 'Kansalaisyhteiskunta',
    stakeholderIndustry: 'Teollisuus',
    stakeholderEuCitizens: 'EU-kansalaiset',
    stakeholderNationalGovernments: 'Kansalliset hallitukset',
    stakeholderEuInstitutions: 'EU-toimielimet',
    reasonEventsScheduled: '{count} parlamentaarista tapahtumaa ajoitettu',
    reasonDocumentsUnderReview: '{count} lainsäädäntöasiakirjaa käsittelyssä',
    reasonIndustryRegulatoryAgenda: 'Sääntelyohjelma voi vaikuttaa liiketoimintaympäristöön',
    reasonCitizensDecisionsShapePolicy:
      'Parlamentaariset päätökset muovaavat EU-laajuista politiikkaa',
    reasonDocumentsRequireTransposition:
      '{count} asiakirjaa voi edellyttää kansallista täytäntöönpanoa',
    reasonInstitutionsCoordination: 'Toimielinten välinen koordinointi tarpeen',
  },
  de: {
    heading: 'Stakeholder-Auswirkungsanalyse',
    temperatureLabel: 'Politische Temperatur',
    impactHeader: 'Auswirkung',
    stakeholderHeader: 'Stakeholder',
    reasonHeader: 'Begründung',
    tempLow: 'Niedrig',
    tempModerate: 'Mäßig',
    tempHigh: 'Hoch',
    tempVeryHigh: 'Sehr hoch',
    stakeholderPoliticalGroups: 'Politische Gruppen',
    stakeholderCivilSociety: 'Zivilgesellschaft',
    stakeholderIndustry: 'Industrie',
    stakeholderEuCitizens: 'EU-Bürger',
    stakeholderNationalGovernments: 'Nationale Regierungen',
    stakeholderEuInstitutions: 'EU-Institutionen',
    reasonEventsScheduled: '{count} parlamentarische(s) Ereignis(se) geplant',
    reasonDocumentsUnderReview: '{count} Gesetzgebungsdokument(e) in Prüfung',
    reasonIndustryRegulatoryAgenda: 'Regulierungsagenda kann Geschäftsumfeld beeinflussen',
    reasonCitizensDecisionsShapePolicy:
      'Parlamentarische Entscheidungen gestalten EU-weite Politik',
    reasonDocumentsRequireTransposition: '{count} Dokument(e) können nationale Umsetzung erfordern',
    reasonInstitutionsCoordination: 'Interinstitutionelle Koordinierung erforderlich',
  },
  fr: {
    heading: 'Analyse d\u2019Impact des Parties Prenantes',
    temperatureLabel: 'Température Politique',
    impactHeader: 'Impact',
    stakeholderHeader: 'Partie Prenante',
    reasonHeader: 'Raison',
    tempLow: 'Faible',
    tempModerate: 'Modéré',
    tempHigh: 'Élevé',
    tempVeryHigh: 'Très élevé',
    stakeholderPoliticalGroups: 'Groupes politiques',
    stakeholderCivilSociety: 'Société civile',
    stakeholderIndustry: 'Industrie',
    stakeholderEuCitizens: 'Citoyens de l\u2019UE',
    stakeholderNationalGovernments: 'Gouvernements nationaux',
    stakeholderEuInstitutions: 'Institutions de l\u2019UE',
    reasonEventsScheduled: '{count} événement(s) parlementaire(s) prévu(s)',
    reasonDocumentsUnderReview: '{count} document(s) législatif(s) en cours d\u2019examen',
    reasonIndustryRegulatoryAgenda:
      'L\u2019agenda réglementaire peut affecter l\u2019environnement commercial',
    reasonCitizensDecisionsShapePolicy:
      'Les décisions parlementaires façonnent la politique à l\u2019échelle de l\u2019UE',
    reasonDocumentsRequireTransposition:
      '{count} document(s) peuvent nécessiter une transposition nationale',
    reasonInstitutionsCoordination: 'Coordination interinstitutionnelle requise',
  },
  es: {
    heading: 'Análisis de Impacto en Partes Interesadas',
    temperatureLabel: 'Temperatura Política',
    impactHeader: 'Impacto',
    stakeholderHeader: 'Parte Interesada',
    reasonHeader: 'Razón',
    tempLow: 'Baja',
    tempModerate: 'Moderada',
    tempHigh: 'Alta',
    tempVeryHigh: 'Muy alta',
    stakeholderPoliticalGroups: 'Grupos políticos',
    stakeholderCivilSociety: 'Sociedad civil',
    stakeholderIndustry: 'Industria',
    stakeholderEuCitizens: 'Ciudadanos de la UE',
    stakeholderNationalGovernments: 'Gobiernos nacionales',
    stakeholderEuInstitutions: 'Instituciones de la UE',
    reasonEventsScheduled: '{count} evento(s) parlamentario(s) programado(s)',
    reasonDocumentsUnderReview: '{count} documento(s) legislativo(s) en revisión',
    reasonIndustryRegulatoryAgenda: 'La agenda regulatoria puede afectar el entorno empresarial',
    reasonCitizensDecisionsShapePolicy:
      'Las decisiones parlamentarias configuran la política a nivel de la UE',
    reasonDocumentsRequireTransposition:
      '{count} documento(s) pueden requerir transposición nacional',
    reasonInstitutionsCoordination: 'Se requiere coordinación interinstitucional',
  },
  nl: {
    heading: 'Stakeholder-Impactanalyse',
    temperatureLabel: 'Politieke Temperatuur',
    impactHeader: 'Impact',
    stakeholderHeader: 'Stakeholder',
    reasonHeader: 'Reden',
    tempLow: 'Laag',
    tempModerate: 'Gematigd',
    tempHigh: 'Hoog',
    tempVeryHigh: 'Zeer hoog',
    stakeholderPoliticalGroups: 'Politieke groepen',
    stakeholderCivilSociety: 'Maatschappelijk middenveld',
    stakeholderIndustry: 'Industrie',
    stakeholderEuCitizens: 'EU-burgers',
    stakeholderNationalGovernments: 'Nationale regeringen',
    stakeholderEuInstitutions: 'EU-instellingen',
    reasonEventsScheduled: '{count} parlementaire evenement(en) gepland',
    reasonDocumentsUnderReview: '{count} wetgevingsdocument(en) in behandeling',
    reasonIndustryRegulatoryAgenda: 'Regelgevingsagenda kan het bedrijfsklimaat beïnvloeden',
    reasonCitizensDecisionsShapePolicy: 'Parlementaire beslissingen vormen EU-breed beleid',
    reasonDocumentsRequireTransposition: '{count} document(en) kunnen nationale omzetting vereisen',
    reasonInstitutionsCoordination: 'Interinstitutionele coördinatie vereist',
  },
  ar: {
    heading: 'تحليل تأثير أصحاب المصلحة',
    temperatureLabel: 'الحرارة السياسية',
    impactHeader: 'التأثير',
    stakeholderHeader: 'صاحب المصلحة',
    reasonHeader: 'السبب',
    tempLow: 'منخفضة',
    tempModerate: 'معتدلة',
    tempHigh: 'مرتفعة',
    tempVeryHigh: 'مرتفعة جداً',
    stakeholderPoliticalGroups: 'المجموعات السياسية',
    stakeholderCivilSociety: 'المجتمع المدني',
    stakeholderIndustry: 'الصناعة',
    stakeholderEuCitizens: 'مواطنو الاتحاد الأوروبي',
    stakeholderNationalGovernments: 'الحكومات الوطنية',
    stakeholderEuInstitutions: 'مؤسسات الاتحاد الأوروبي',
    reasonEventsScheduled: '{count} حدث/أحداث برلمانية مجدولة',
    reasonDocumentsUnderReview: '{count} وثيقة/وثائق تشريعية قيد المراجعة',
    reasonIndustryRegulatoryAgenda: 'قد يؤثر جدول الأعمال التنظيمي على بيئة الأعمال',
    reasonCitizensDecisionsShapePolicy:
      'القرارات البرلمانية تشكل السياسة على مستوى الاتحاد الأوروبي',
    reasonDocumentsRequireTransposition: '{count} وثيقة/وثائق قد تتطلب نقلاً وطنياً',
    reasonInstitutionsCoordination: 'التنسيق بين المؤسسات مطلوب',
  },
  he: {
    heading: 'ניתוח השפעה על בעלי עניין',
    temperatureLabel: 'טמפרטורה פוליטית',
    impactHeader: 'השפעה',
    stakeholderHeader: 'בעל עניין',
    reasonHeader: 'סיבה',
    tempLow: 'נמוכה',
    tempModerate: 'מתונה',
    tempHigh: 'גבוהה',
    tempVeryHigh: 'גבוהה מאוד',
    stakeholderPoliticalGroups: 'קבוצות פוליטיות',
    stakeholderCivilSociety: 'חברה אזרחית',
    stakeholderIndustry: 'תעשייה',
    stakeholderEuCitizens: 'אזרחי האיחוד האירופי',
    stakeholderNationalGovernments: 'ממשלות לאומיות',
    stakeholderEuInstitutions: 'מוסדות האיחוד האירופי',
    reasonEventsScheduled: '{count} אירוע/ים פרלמנטרי/ים מתוכנן/ים',
    reasonDocumentsUnderReview: '{count} מסמך/ים חקיקתי/ים בבדיקה',
    reasonIndustryRegulatoryAgenda: 'סדר היום הרגולטורי עשוי להשפיע על סביבת העסקים',
    reasonCitizensDecisionsShapePolicy: 'החלטות פרלמנטריות מעצבות מדיניות ברחבי האיחוד האירופי',
    reasonDocumentsRequireTransposition: '{count} מסמך/ים עשויים לדרוש אימוץ לאומי',
    reasonInstitutionsCoordination: 'נדרש תיאום בין-מוסדי',
  },
  ja: {
    heading: 'ステークホルダー影響分析',
    temperatureLabel: '政治的温度',
    impactHeader: '影響度',
    stakeholderHeader: 'ステークホルダー',
    reasonHeader: '理由',
    tempLow: '低い',
    tempModerate: '中程度',
    tempHigh: '高い',
    tempVeryHigh: '非常に高い',
    stakeholderPoliticalGroups: '政治グループ',
    stakeholderCivilSociety: '市民社会',
    stakeholderIndustry: '産業界',
    stakeholderEuCitizens: 'EU市民',
    stakeholderNationalGovernments: '各国政府',
    stakeholderEuInstitutions: 'EU機関',
    reasonEventsScheduled: '{count}件の議会イベントが予定',
    reasonDocumentsUnderReview: '{count}件の立法文書が審査中',
    reasonIndustryRegulatoryAgenda: '規制アジェンダがビジネス環境に影響する可能性',
    reasonCitizensDecisionsShapePolicy: '議会の決定がEU全体の政策を形成',
    reasonDocumentsRequireTransposition: '{count}件の文書が国内法化を必要とする可能性',
    reasonInstitutionsCoordination: '機関間の調整が必要',
  },
  ko: {
    heading: '이해관계자 영향 분석',
    temperatureLabel: '정치적 온도',
    impactHeader: '영향',
    stakeholderHeader: '이해관계자',
    reasonHeader: '사유',
    tempLow: '낮음',
    tempModerate: '보통',
    tempHigh: '높음',
    tempVeryHigh: '매우 높음',
    stakeholderPoliticalGroups: '정치 그룹',
    stakeholderCivilSociety: '시민사회',
    stakeholderIndustry: '산업계',
    stakeholderEuCitizens: 'EU 시민',
    stakeholderNationalGovernments: '각국 정부',
    stakeholderEuInstitutions: 'EU 기관',
    reasonEventsScheduled: '{count}건의 의회 행사 예정',
    reasonDocumentsUnderReview: '{count}건의 입법 문서 검토 중',
    reasonIndustryRegulatoryAgenda: '규제 의제가 비즈니스 환경에 영향을 줄 수 있음',
    reasonCitizensDecisionsShapePolicy: '의회 결정이 EU 전체 정책을 형성',
    reasonDocumentsRequireTransposition: '{count}건의 문서가 국내 이행을 요구할 수 있음',
    reasonInstitutionsCoordination: '기관 간 조정 필요',
  },
  zh: {
    heading: '利益相关方影响分析',
    temperatureLabel: '政治温度',
    impactHeader: '影响',
    stakeholderHeader: '利益相关方',
    reasonHeader: '原因',
    tempLow: '低',
    tempModerate: '中等',
    tempHigh: '高',
    tempVeryHigh: '非常高',
    stakeholderPoliticalGroups: '政治团体',
    stakeholderCivilSociety: '公民社会',
    stakeholderIndustry: '产业界',
    stakeholderEuCitizens: '欧盟公民',
    stakeholderNationalGovernments: '各国政府',
    stakeholderEuInstitutions: '欧盟机构',
    reasonEventsScheduled: '{count}项议会活动已安排',
    reasonDocumentsUnderReview: '{count}份立法文件正在审查',
    reasonIndustryRegulatoryAgenda: '监管议程可能影响商业环境',
    reasonCitizensDecisionsShapePolicy: '议会决定塑造欧盟范围的政策',
    reasonDocumentsRequireTransposition: '{count}份文件可能需要国内转化',
    reasonInstitutionsCoordination: '需要机构间协调',
  },
};

// ─── AI analysis marker — all analysis text is produced by the AI agent (Opus 4.6) ───
const AI_ANALYSIS_MARKER = '[AI_ANALYSIS_REQUIRED]';
const BRK_WHY_ANOMALIES = AI_ANALYSIS_MARKER;
const BRK_WHY_NORMAL = AI_ANALYSIS_MARKER;
const BRK_NEUTRAL_REASON = AI_ANALYSIS_MARKER;
const BRK_LEGAL_CONSEQUENCE = AI_ANALYSIS_MARKER;
const BRK_PROC_CONSEQUENCE = AI_ANALYSIS_MARKER;
const BRK_IMPACT_ECONOMIC = AI_ANALYSIS_MARKER;
const BRK_IMPACT_SOCIAL = AI_ANALYSIS_MARKER;
const BRK_IMPACT_GEO_COALITION = AI_ANALYSIS_MARKER;
const BRK_IMPACT_GEO_NORMAL = AI_ANALYSIS_MARKER;
const BRK_MISTAKE_DESC = AI_ANALYSIS_MARKER;
const BRK_MISTAKE_ALT = AI_ANALYSIS_MARKER;

const CMT_WHY = AI_ANALYSIS_MARKER;
const CMT_NO_DOCS = AI_ANALYSIS_MARKER;
const CMT_IMPACT_POLITICAL = AI_ANALYSIS_MARKER;
const CMT_IMPACT_LEGAL = AI_ANALYSIS_MARKER;
const CMT_ACTION_CONSEQUENCE = AI_ANALYSIS_MARKER;
const CMT_MISTAKE_DESC = AI_ANALYSIS_MARKER;
const CMT_MISTAKE_ALT = AI_ANALYSIS_MARKER;
const CMT_OUTLOOK_GOOD = AI_ANALYSIS_MARKER;
const CMT_OUTLOOK_CONCERN = AI_ANALYSIS_MARKER;

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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Legislative Majority',
    breakingWinnerReasonFn: (count) =>
      `${count} legislative texts have been advanced through the parliamentary process.`,
    breakingNeutralActor: 'Opposition Groups',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Political Group Whips',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Lagstiftande majoritet',
    breakingWinnerReasonFn: (count) =>
      `${count} lagstiftningstexter har drivits fram i den parlamentariska processen.`,
    breakingNeutralActor: 'Oppositionsgrupper',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Partigruppernas piskare',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Lovgivningsmæssigt flertal',
    breakingWinnerReasonFn: (count) =>
      `${count} lovgivningstekster er ført frem i den parlamentariske proces.`,
    breakingNeutralActor: 'Oppositionsgrupper',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Partigruppernes piskere',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Lovgivningsmessig flertall',
    breakingWinnerReasonFn: (count) =>
      `${count} lovgivningstekster er fremmet i den parlamentariske prosessen.`,
    breakingNeutralActor: 'Opposisjonsgrupper',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Partigruppers innpisker',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Lainsäädännöllinen enemmistö',
    breakingWinnerReasonFn: (count) =>
      `${count} lainsäädäntötekstiä on edistetty parlamentaarisessa prosessissa.`,
    breakingNeutralActor: 'Oppositioryhmät',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Ryhmien parlamenttipiiskurit',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Gesetzgebende Mehrheit',
    breakingWinnerReasonFn: (count) =>
      `${count} Gesetzestexte wurden im parlamentarischen Verfahren vorangebracht.`,
    breakingNeutralActor: 'Oppositionsgruppen',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Fraktionsgeschäftsführer',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Majorité législative',
    breakingWinnerReasonFn: (count) =>
      `${count} textes législatifs ont été avancés dans le cadre du processus parlementaire.`,
    breakingNeutralActor: "Groupes d'opposition",
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Chefs de file des groupes politiques',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Mayoría legislativa',
    breakingWinnerReasonFn: (count) =>
      `${count} textos legislativos han sido avanzados en el proceso parlamentario.`,
    breakingNeutralActor: 'Grupos de oposición',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Jefes de delegación de grupos políticos',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'Wetgevende meerderheid',
    breakingWinnerReasonFn: (count) =>
      `${count} wetgevingsteksten zijn gevorderd in het parlementaire proces.`,
    breakingNeutralActor: 'Oppositiegroepen',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'Fractiedisciplineurs',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'الأغلبية التشريعية',
    breakingWinnerReasonFn: (count) => `تم تقديم ${count} نصًا تشريعيًا في العملية البرلمانية.`,
    breakingNeutralActor: 'مجموعات المعارضة',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'مسؤولو الانضباط الحزبي',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: 'הרוב החקיקתי',
    breakingWinnerReasonFn: (count) => `${count} טקסטים חקיקתיים קודמו בתהליך הפרלמנטרי.`,
    breakingNeutralActor: 'קבוצות האופוזיציה',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: 'מנהיגי הסיעות',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: '立法多数派',
    breakingWinnerReasonFn: (count) => `${count}件の立法テキストが議会プロセスで進められました。`,
    breakingNeutralActor: '野党グループ',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: '会派院内幹事',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: '입법 다수파',
    breakingWinnerReasonFn: (count) =>
      `${count}건의 입법 텍스트가 의회 절차를 통해 진행되었습니다.`,
    breakingNeutralActor: '야당 그룹',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: '정치 그룹 원내총무',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    breakingWhyAnomalies: BRK_WHY_ANOMALIES,
    breakingWhyNormal: BRK_WHY_NORMAL,
    breakingWinnerActor: '立法多数派',
    breakingWinnerReasonFn: (count) => `${count}项立法文本已通过议会程序推进。`,
    breakingNeutralActor: '反对派团体',
    breakingNeutralReason: BRK_NEUTRAL_REASON,
    breakingOutlookActiveFn: (date) => `session_date=${date}`,
    breakingOutlookTransitionalFn: (date) => `session_date=${date} transitional=true`,
    breakingLegalObligationsConsequence: BRK_LEGAL_CONSEQUENCE,
    breakingProcedureConsequence: BRK_PROC_CONSEQUENCE,
    breakingImpactPoliticalAnomalies: BRK_WHY_ANOMALIES,
    breakingImpactPoliticalNormalFn: (count) => `legislative_texts=${count}`,
    breakingImpactEconomic: BRK_IMPACT_ECONOMIC,
    breakingImpactSocial: BRK_IMPACT_SOCIAL,
    breakingImpactLegalFn: (count) => `legal_instruments=${count}`,
    breakingImpactGeopoliticalCoalition: BRK_IMPACT_GEO_COALITION,
    breakingImpactGeopoliticalNormal: BRK_IMPACT_GEO_NORMAL,
    breakingMistakeActor: '政治团体党鞭',
    breakingMistakeDescription: BRK_MISTAKE_DESC,
    breakingMistakeAlternative: BRK_MISTAKE_ALT,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} documents — highly productive period',
    stakeholderModerateActivity: '{n} document(s) — moderate activity',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} processed {n} document(s)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} dokument — mycket produktiv period',
    stakeholderModerateActivity: '{n} dokument — måttlig aktivitet',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} behandlade {n} dokument',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} dokumenter — meget produktiv periode',
    stakeholderModerateActivity: '{n} dokument(er) — moderat aktivitet',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} behandlede {n} dokument(er)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} dokumenter — svært produktiv periode',
    stakeholderModerateActivity: '{n} dokument(er) — moderat aktivitet',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} behandlet {n} dokument(er)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} asiakirjaa — erittäin tuottoisa kausi',
    stakeholderModerateActivity: '{n} asiakirja(a) — kohtalainen aktiivisuus',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} käsitteli {n} asiakirja(a)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} Dokumente — sehr produktiver Zeitraum',
    stakeholderModerateActivity: '{n} Dokument(e) — moderate Aktivität',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} hat {n} Dokument(e) bearbeitet',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} a traité {n} document(s)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} documentos — período muy productivo',
    stakeholderModerateActivity: '{n} documento(s) — actividad moderada',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} procesó {n} documento(s)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} documenten — zeer productieve periode',
    stakeholderModerateActivity: '{n} document(en) — matige activiteit',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} verwerkte {n} document(en)',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} وثيقة — فترة منتجة جداً',
    stakeholderModerateActivity: '{n} وثيقة/وثائق — نشاط معتدل',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: 'عالجت لجنة {abbr} {n} وثيقة/وثائق',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n} מסמכים — תקופה פרודוקטיבית מאוד',
    stakeholderModerateActivity: '{n} מסמך/ים — פעילות מתונה',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr} עיבד {n} מסמך/ים',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n}文書 — 非常に生産的な期間',
    stakeholderModerateActivity: '{n}文書 — 中程度の活動',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr}が{n}文書を処理しました',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n}개 문서 — 매우 생산적인 기간',
    stakeholderModerateActivity: '{n}개 문서 — 보통 활동',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr}에서 {n}개 문서 처리',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    why: CMT_WHY,
    stakeholderHighlyProductive: '{n}份文件——非常高产的时期',
    stakeholderModerateActivity: '{n}份文件——中等活跃度',
    stakeholderNoDocs: CMT_NO_DOCS,
    impactPolitical: CMT_IMPACT_POLITICAL,
    impactPoliticalNone: 'active=0',
    impactEconomic: BRK_IMPACT_ECONOMIC,
    impactSocial: BRK_IMPACT_SOCIAL,
    impactLegal: CMT_IMPACT_LEGAL,
    impactGeopolitical: BRK_IMPACT_GEO_NORMAL,
    actionProcessed: '{abbr}处理了{n}份文件',
    actionConsequence: CMT_ACTION_CONSEQUENCE,
    mistakeDescription: CMT_MISTAKE_DESC,
    mistakeAlternative: CMT_MISTAKE_ALT,
    outlookGood: CMT_OUTLOOK_GOOD,
    outlookConcern: CMT_OUTLOOK_CONCERN,
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
    coalitionAlignment: 'Coalition Alignment',
    alignmentScore: 'Alignment Score',
    votingBlocs: 'Voting Blocs',
    coalitionShift: 'Coalition Shift',
    coalitionStrengthening: 'Strengthening',
    coalitionWeakening: 'Weakening',
    coalitionStable: 'Stable',
    coalitionRadarChart: 'Coalition Radar',
    pipelineStatus: 'Pipeline Status',
    onTrack: 'On Track',
    delayed: 'Delayed',
    blocked: 'Blocked',
    fastTracked: 'Fast-Tracked',
    pipelineStatusChart: 'Pipeline Status Chart',
    trendAnalysis: 'Trend Analysis',
    weekOverWeek: 'Week-over-Week',
    monthOverMonth: 'Month-over-Month',
    trendImproving: 'Improving',
    trendDeclining: 'Declining',
    trendStableLabel: 'Stable',
    activityTrendChart: 'Activity Trend',
    stakeholderImpact: 'Stakeholder Impact',
    impactScore: 'Impact Score',
    impactPositive: 'Positive',
    impactNegative: 'Negative',
    impactNeutral: 'Neutral',
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
    coalitionAlignment: 'Koalitionsinriktning',
    alignmentScore: 'Inriktningsmätning',
    votingBlocs: 'Röstningsblock',
    coalitionShift: 'Koalitionsskifte',
    coalitionStrengthening: 'Stärks',
    coalitionWeakening: 'Försvagas',
    coalitionStable: 'Stabil',
    coalitionRadarChart: 'Koalitionsradar',
    pipelineStatus: 'Pipelinestatus',
    onTrack: 'På rätt spår',
    delayed: 'Försenad',
    blocked: 'Blockerad',
    fastTracked: 'Snabbspårad',
    pipelineStatusChart: 'Pipelinestatusdiagram',
    trendAnalysis: 'Trendanalys',
    weekOverWeek: 'Vecka-till-vecka',
    monthOverMonth: 'Månad-till-månad',
    trendImproving: 'Förbättras',
    trendDeclining: 'Försämras',
    trendStableLabel: 'Stabil',
    activityTrendChart: 'Aktivitetstrend',
    stakeholderImpact: 'Intressentpåverkan',
    impactScore: 'Påverkanspoäng',
    impactPositive: 'Positiv',
    impactNegative: 'Negativ',
    impactNeutral: 'Neutral',
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
    coalitionAlignment: 'Koalitionsafstemning',
    alignmentScore: 'Indretningsscore',
    votingBlocs: 'Afstemningsblokke',
    coalitionShift: 'Koalitionsskift',
    coalitionStrengthening: 'Styrkelse',
    coalitionWeakening: 'Svækkelse',
    coalitionStable: 'Stabil',
    coalitionRadarChart: 'Koalitionsradar',
    pipelineStatus: 'Pipeline-status',
    onTrack: 'På sporet',
    delayed: 'Forsinket',
    blocked: 'Blokeret',
    fastTracked: 'Fremskyndet',
    pipelineStatusChart: 'Pipeline-statusdiagram',
    trendAnalysis: 'Trendanalyse',
    weekOverWeek: 'Uge-til-uge',
    monthOverMonth: 'Måned-til-måned',
    trendImproving: 'Forbedring',
    trendDeclining: 'Fald',
    trendStableLabel: 'Stabil',
    activityTrendChart: 'Aktivitetstrend',
    stakeholderImpact: 'Interessentpåvirkning',
    impactScore: 'Påvirkningsscore',
    impactPositive: 'Positiv',
    impactNegative: 'Negativ',
    impactNeutral: 'Neutral',
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
    coalitionAlignment: 'Koalisjonsretting',
    alignmentScore: 'Retningsscore',
    votingBlocs: 'Stemmeblokker',
    coalitionShift: 'Koalisjonsskifte',
    coalitionStrengthening: 'Styrking',
    coalitionWeakening: 'Svekkelse',
    coalitionStable: 'Stabil',
    coalitionRadarChart: 'Koalisjonsradar',
    pipelineStatus: 'Pipeline-status',
    onTrack: 'På rett spor',
    delayed: 'Forsinket',
    blocked: 'Blokkert',
    fastTracked: 'Hurtigspor',
    pipelineStatusChart: 'Pipeline-statusdiagram',
    trendAnalysis: 'Trendanalyse',
    weekOverWeek: 'Uke-til-uke',
    monthOverMonth: 'Måned-til-måned',
    trendImproving: 'Forbedring',
    trendDeclining: 'Nedgang',
    trendStableLabel: 'Stabil',
    activityTrendChart: 'Aktivitetstrend',
    stakeholderImpact: 'Interessentpåvirkning',
    impactScore: 'Påvirkningsscore',
    impactPositive: 'Positiv',
    impactNegative: 'Negativ',
    impactNeutral: 'Nøytral',
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
    coalitionAlignment: 'Koalition suuntaus',
    alignmentScore: 'Suuntauspisteet',
    votingBlocs: 'Äänestysblokki',
    coalitionShift: 'Koalitiomuutos',
    coalitionStrengthening: 'Vahvistuminen',
    coalitionWeakening: 'Heikkeneminen',
    coalitionStable: 'Vakaa',
    coalitionRadarChart: 'Koalitiotutkataulukko',
    pipelineStatus: 'Pipeline-tila',
    onTrack: 'Aikataulussa',
    delayed: 'Viivästynyt',
    blocked: 'Estetty',
    fastTracked: 'Pikakaistalla',
    pipelineStatusChart: 'Pipeline-tila kaavio',
    trendAnalysis: 'Trendikatsaus',
    weekOverWeek: 'Viikko edelliseen',
    monthOverMonth: 'Kuukausi edelliseen',
    trendImproving: 'Paranee',
    trendDeclining: 'Heikentyy',
    trendStableLabel: 'Vakaa',
    activityTrendChart: 'Toimintakäyrä',
    stakeholderImpact: 'Sidosryhmävaikutus',
    impactScore: 'Vaikutuspisteet',
    impactPositive: 'Positiivinen',
    impactNegative: 'Negatiivinen',
    impactNeutral: 'Neutraali',
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
    coalitionAlignment: 'Koalitionsausrichtung',
    alignmentScore: 'Ausrichtungswert',
    votingBlocs: 'Abstimmungsblöcke',
    coalitionShift: 'Koalitionswandel',
    coalitionStrengthening: 'Stärkung',
    coalitionWeakening: 'Schwächung',
    coalitionStable: 'Stabil',
    coalitionRadarChart: 'Koalitionsradar',
    pipelineStatus: 'Pipeline-Status',
    onTrack: 'Im Zeitplan',
    delayed: 'Verzögert',
    blocked: 'Blockiert',
    fastTracked: 'Beschleunigt',
    pipelineStatusChart: 'Pipeline-Statusdiagramm',
    trendAnalysis: 'Trendanalyse',
    weekOverWeek: 'Woche-zu-Woche',
    monthOverMonth: 'Monat-zu-Monat',
    trendImproving: 'Verbesserung',
    trendDeclining: 'Rückgang',
    trendStableLabel: 'Stabil',
    activityTrendChart: 'Aktivitätstrend',
    stakeholderImpact: 'Stakeholder-Einfluss',
    impactScore: 'Einflusswert',
    impactPositive: 'Positiv',
    impactNegative: 'Negativ',
    impactNeutral: 'Neutral',
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
    coalitionAlignment: 'Alignement de coalition',
    alignmentScore: "Score d'alignement",
    votingBlocs: 'Blocs de vote',
    coalitionShift: 'Évolution de coalition',
    coalitionStrengthening: 'Renforcement',
    coalitionWeakening: 'Affaiblissement',
    coalitionStable: 'Stable',
    coalitionRadarChart: 'Radar de coalition',
    pipelineStatus: 'État du pipeline',
    onTrack: 'Dans les délais',
    delayed: 'Retardé',
    blocked: 'Bloqué',
    fastTracked: 'Accéléré',
    pipelineStatusChart: 'Diagramme du pipeline',
    trendAnalysis: 'Analyse des tendances',
    weekOverWeek: 'Semaine sur semaine',
    monthOverMonth: 'Mois sur mois',
    trendImproving: 'Amélioration',
    trendDeclining: 'Déclin',
    trendStableLabel: 'Stable',
    activityTrendChart: "Tendance d'activité",
    stakeholderImpact: 'Impact sur les parties prenantes',
    impactScore: "Score d'impact",
    impactPositive: 'Positif',
    impactNegative: 'Négatif',
    impactNeutral: 'Neutre',
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
    coalitionAlignment: 'Alineación de coalición',
    alignmentScore: 'Puntuación de alineación',
    votingBlocs: 'Bloques de votación',
    coalitionShift: 'Cambio de coalición',
    coalitionStrengthening: 'Fortalecimiento',
    coalitionWeakening: 'Debilitamiento',
    coalitionStable: 'Estable',
    coalitionRadarChart: 'Radar de coalición',
    pipelineStatus: 'Estado del proceso',
    onTrack: 'En plazo',
    delayed: 'Retrasado',
    blocked: 'Bloqueado',
    fastTracked: 'Acelerado',
    pipelineStatusChart: 'Diagrama de proceso',
    trendAnalysis: 'Análisis de tendencias',
    weekOverWeek: 'Semana a semana',
    monthOverMonth: 'Mes a mes',
    trendImproving: 'Mejora',
    trendDeclining: 'Declive',
    trendStableLabel: 'Estable',
    activityTrendChart: 'Tendencia de actividad',
    stakeholderImpact: 'Impacto en partes interesadas',
    impactScore: 'Puntuación de impacto',
    impactPositive: 'Positivo',
    impactNegative: 'Negativo',
    impactNeutral: 'Neutral',
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
    coalitionAlignment: 'Coalitieafstemming',
    alignmentScore: 'Afstemmingsscore',
    votingBlocs: 'Stemblokken',
    coalitionShift: 'Coalitieverschuiving',
    coalitionStrengthening: 'Versterking',
    coalitionWeakening: 'Verzwakking',
    coalitionStable: 'Stabiel',
    coalitionRadarChart: 'Coalitieradar',
    pipelineStatus: 'Pipelinestatus',
    onTrack: 'Op schema',
    delayed: 'Vertraagd',
    blocked: 'Geblokkeerd',
    fastTracked: 'Versneld',
    pipelineStatusChart: 'Pipelinestatusdiagram',
    trendAnalysis: 'Trendanalyse',
    weekOverWeek: 'Week-op-week',
    monthOverMonth: 'Maand-op-maand',
    trendImproving: 'Verbetering',
    trendDeclining: 'Achteruitgang',
    trendStableLabel: 'Stabiel',
    activityTrendChart: 'Activiteitstrend',
    stakeholderImpact: 'Stakeholderimpact',
    impactScore: 'Impactscore',
    impactPositive: 'Positief',
    impactNegative: 'Negatief',
    impactNeutral: 'Neutraal',
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
    coalitionAlignment: 'توافق التحالف',
    alignmentScore: 'درجة التوافق',
    votingBlocs: 'كتل التصويت',
    coalitionShift: 'تحول التحالف',
    coalitionStrengthening: 'تعزيز',
    coalitionWeakening: 'إضعاف',
    coalitionStable: 'مستقر',
    coalitionRadarChart: 'رادار التحالف',
    pipelineStatus: 'حالة الإجراءات',
    onTrack: 'في المسار',
    delayed: 'متأخر',
    blocked: 'محظور',
    fastTracked: 'مسار سريع',
    pipelineStatusChart: 'مخطط حالة الإجراءات',
    trendAnalysis: 'تحليل الاتجاهات',
    weekOverWeek: 'أسبوع إلى أسبوع',
    monthOverMonth: 'شهر إلى شهر',
    trendImproving: 'تحسن',
    trendDeclining: 'تراجع',
    trendStableLabel: 'مستقر',
    activityTrendChart: 'اتجاه النشاط',
    stakeholderImpact: 'تأثير أصحاب المصلحة',
    impactScore: 'درجة التأثير',
    impactPositive: 'إيجابي',
    impactNegative: 'سلبي',
    impactNeutral: 'محايد',
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
    coalitionAlignment: 'יישור קואליציה',
    alignmentScore: 'ציון יישור',
    votingBlocs: 'גושי הצבעה',
    coalitionShift: 'שינוי קואליציוני',
    coalitionStrengthening: 'התחזקות',
    coalitionWeakening: 'התחלשות',
    coalitionStable: 'יציב',
    coalitionRadarChart: 'מכ"ם קואליציוני',
    pipelineStatus: 'סטטוס צינור',
    onTrack: 'על המסלול',
    delayed: 'מאוחר',
    blocked: 'חסום',
    fastTracked: 'מסלול מהיר',
    pipelineStatusChart: 'תרשים צינור',
    trendAnalysis: 'ניתוח מגמות',
    weekOverWeek: 'שבוע לשבוע',
    monthOverMonth: 'חודש לחודש',
    trendImproving: 'שיפור',
    trendDeclining: 'ירידה',
    trendStableLabel: 'יציב',
    activityTrendChart: 'מגמת פעילות',
    stakeholderImpact: 'השפעה על בעלי עניין',
    impactScore: 'ציון השפעה',
    impactPositive: 'חיובי',
    impactNegative: 'שלילי',
    impactNeutral: 'ניטרלי',
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
    coalitionAlignment: '連立調整',
    alignmentScore: '調整スコア',
    votingBlocs: '投票ブロック',
    coalitionShift: '連立変化',
    coalitionStrengthening: '強化',
    coalitionWeakening: '弱体化',
    coalitionStable: '安定',
    coalitionRadarChart: '連立レーダー',
    pipelineStatus: 'パイプライン状況',
    onTrack: '予定通り',
    delayed: '遅延',
    blocked: '停滞',
    fastTracked: '加速',
    pipelineStatusChart: 'パイプライン状況図',
    trendAnalysis: 'トレンド分析',
    weekOverWeek: '週次比較',
    monthOverMonth: '月次比較',
    trendImproving: '改善',
    trendDeclining: '低下',
    trendStableLabel: '安定',
    activityTrendChart: '活動トレンド',
    stakeholderImpact: '利害関係者への影響',
    impactScore: '影響スコア',
    impactPositive: 'ポジティブ',
    impactNegative: 'ネガティブ',
    impactNeutral: '中立',
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
    coalitionAlignment: '연립 정렬',
    alignmentScore: '정렬 점수',
    votingBlocs: '투표 블록',
    coalitionShift: '연립 변화',
    coalitionStrengthening: '강화',
    coalitionWeakening: '약화',
    coalitionStable: '안정',
    coalitionRadarChart: '연립 레이더',
    pipelineStatus: '파이프라인 현황',
    onTrack: '정상 진행',
    delayed: '지연',
    blocked: '차단',
    fastTracked: '신속 처리',
    pipelineStatusChart: '파이프라인 현황 차트',
    trendAnalysis: '추세 분석',
    weekOverWeek: '주 대비 주',
    monthOverMonth: '월 대비 월',
    trendImproving: '개선',
    trendDeclining: '하락',
    trendStableLabel: '안정',
    activityTrendChart: '활동 추세',
    stakeholderImpact: '이해관계자 영향',
    impactScore: '영향 점수',
    impactPositive: '긍정적',
    impactNegative: '부정적',
    impactNeutral: '중립',
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
    coalitionAlignment: '联盟对齐',
    alignmentScore: '对齐分数',
    votingBlocs: '投票集团',
    coalitionShift: '联盟转变',
    coalitionStrengthening: '加强',
    coalitionWeakening: '削弱',
    coalitionStable: '稳定',
    coalitionRadarChart: '联盟雷达图',
    pipelineStatus: '流程状态',
    onTrack: '按时',
    delayed: '延误',
    blocked: '阻塞',
    fastTracked: '加速',
    pipelineStatusChart: '流程状态图',
    trendAnalysis: '趋势分析',
    weekOverWeek: '周环比',
    monthOverMonth: '月环比',
    trendImproving: '改善',
    trendDeclining: '下降',
    trendStableLabel: '稳定',
    activityTrendChart: '活动趋势',
    stakeholderImpact: '利益相关方影响',
    impactScore: '影响分数',
    impactPositive: '正面',
    impactNegative: '负面',
    impactNeutral: '中立',
  },
};

// ─── Multi-Dimensional SWOT strings ──────────────────────────────────────────

/**
 * Localized strings for multi-dimensional SWOT analysis visualization.
 * Covers dimension names, stakeholder labels, temporal headings, and evidence labels
 * across all 14 supported languages.
 */
export const MULTI_DIMENSIONAL_SWOT_STRINGS: LanguageMap<MultiDimensionalSwotStrings> = {
  en: {
    dimensionsLabel: 'Dimensions',
    stakeholderPerspectivesLabel: 'Stakeholder Perspectives',
    temporalAnalysisLabel: 'Temporal Analysis',
    shortTermLabel: 'Short-term (This week)',
    mediumTermLabel: 'Medium-term (This quarter)',
    longTermLabel: 'Long-term (This term)',
    dimensionPolitical: 'Political',
    dimensionEconomic: 'Economic',
    dimensionSocial: 'Social',
    dimensionLegal: 'Legal',
    dimensionGeopolitical: 'Geopolitical',
    stakeholderCitizen: 'Citizens',
    stakeholderIndustry: 'Industry',
    stakeholderNgo: 'Civil Society',
    stakeholderMep: 'MEPs',
    stakeholderGovernment: 'Governments',
    stakeholderMedia: 'Media',
    evidenceLabel: 'Evidence',
    crossReferencesLabel: 'References',
  },
  sv: {
    dimensionsLabel: 'Dimensioner',
    stakeholderPerspectivesLabel: 'Intressentperspektiv',
    temporalAnalysisLabel: 'Tidsanalys',
    shortTermLabel: 'Kortsiktigt (denna vecka)',
    mediumTermLabel: 'Medellång sikt (detta kvartal)',
    longTermLabel: 'Lång sikt (denna mandatperiod)',
    dimensionPolitical: 'Politisk',
    dimensionEconomic: 'Ekonomisk',
    dimensionSocial: 'Social',
    dimensionLegal: 'Juridisk',
    dimensionGeopolitical: 'Geopolitisk',
    stakeholderCitizen: 'Medborgare',
    stakeholderIndustry: 'Industri',
    stakeholderNgo: 'Civilsamhälle',
    stakeholderMep: 'Ledamöter',
    stakeholderGovernment: 'Regeringar',
    stakeholderMedia: 'Media',
    evidenceLabel: 'Bevis',
    crossReferencesLabel: 'Referenser',
  },
  da: {
    dimensionsLabel: 'Dimensioner',
    stakeholderPerspectivesLabel: 'Interessentperspektiver',
    temporalAnalysisLabel: 'Tidsanalyse',
    shortTermLabel: 'Kortsigtet (denne uge)',
    mediumTermLabel: 'Mellemlang sigt (dette kvartal)',
    longTermLabel: 'Langsigtet (denne periode)',
    dimensionPolitical: 'Politisk',
    dimensionEconomic: 'Økonomisk',
    dimensionSocial: 'Social',
    dimensionLegal: 'Juridisk',
    dimensionGeopolitical: 'Geopolitisk',
    stakeholderCitizen: 'Borgere',
    stakeholderIndustry: 'Industri',
    stakeholderNgo: 'Civilsamfund',
    stakeholderMep: "MEP'er",
    stakeholderGovernment: 'Regeringer',
    stakeholderMedia: 'Medier',
    evidenceLabel: 'Beviser',
    crossReferencesLabel: 'Referencer',
  },
  no: {
    dimensionsLabel: 'Dimensjoner',
    stakeholderPerspectivesLabel: 'Interessentperspektiver',
    temporalAnalysisLabel: 'Tidsanalyse',
    shortTermLabel: 'Kortsiktig (denne uken)',
    mediumTermLabel: 'Mellomlang sikt (dette kvartalet)',
    longTermLabel: 'Langsiktig (denne perioden)',
    dimensionPolitical: 'Politisk',
    dimensionEconomic: 'Økonomisk',
    dimensionSocial: 'Sosial',
    dimensionLegal: 'Juridisk',
    dimensionGeopolitical: 'Geopolitisk',
    stakeholderCitizen: 'Borgere',
    stakeholderIndustry: 'Industri',
    stakeholderNgo: 'Sivilsamfunn',
    stakeholderMep: 'MEP-er',
    stakeholderGovernment: 'Regjeringer',
    stakeholderMedia: 'Medier',
    evidenceLabel: 'Bevis',
    crossReferencesLabel: 'Referanser',
  },
  fi: {
    dimensionsLabel: 'Dimensiot',
    stakeholderPerspectivesLabel: 'Sidosryhmien näkökulmat',
    temporalAnalysisLabel: 'Aikaanalyysi',
    shortTermLabel: 'Lyhytaikainen (tämä viikko)',
    mediumTermLabel: 'Keskipitkä aikaväli (tämä vuosineljännes)',
    longTermLabel: 'Pitkäaikainen (tämä toimikausi)',
    dimensionPolitical: 'Poliittinen',
    dimensionEconomic: 'Taloudellinen',
    dimensionSocial: 'Sosiaalinen',
    dimensionLegal: 'Oikeudellinen',
    dimensionGeopolitical: 'Geopoliittinen',
    stakeholderCitizen: 'Kansalaiset',
    stakeholderIndustry: 'Teollisuus',
    stakeholderNgo: 'Kansalaisyhteiskunta',
    stakeholderMep: 'MEP:t',
    stakeholderGovernment: 'Hallitukset',
    stakeholderMedia: 'Media',
    evidenceLabel: 'Todisteet',
    crossReferencesLabel: 'Viitteet',
  },
  de: {
    dimensionsLabel: 'Dimensionen',
    stakeholderPerspectivesLabel: 'Akteursperspektiven',
    temporalAnalysisLabel: 'Zeitliche Analyse',
    shortTermLabel: 'Kurzfristig (diese Woche)',
    mediumTermLabel: 'Mittelfristig (dieses Quartal)',
    longTermLabel: 'Langfristig (diese Wahlperiode)',
    dimensionPolitical: 'Politisch',
    dimensionEconomic: 'Wirtschaftlich',
    dimensionSocial: 'Sozial',
    dimensionLegal: 'Rechtlich',
    dimensionGeopolitical: 'Geopolitisch',
    stakeholderCitizen: 'Bürger',
    stakeholderIndustry: 'Industrie',
    stakeholderNgo: 'Zivilgesellschaft',
    stakeholderMep: 'Abgeordnete',
    stakeholderGovernment: 'Regierungen',
    stakeholderMedia: 'Medien',
    evidenceLabel: 'Belege',
    crossReferencesLabel: 'Referenzen',
  },
  fr: {
    dimensionsLabel: 'Dimensions',
    stakeholderPerspectivesLabel: 'Perspectives des parties prenantes',
    temporalAnalysisLabel: 'Analyse temporelle',
    shortTermLabel: 'Court terme (cette semaine)',
    mediumTermLabel: 'Moyen terme (ce trimestre)',
    longTermLabel: 'Long terme (cette législature)',
    dimensionPolitical: 'Politique',
    dimensionEconomic: 'Économique',
    dimensionSocial: 'Social',
    dimensionLegal: 'Juridique',
    dimensionGeopolitical: 'Géopolitique',
    stakeholderCitizen: 'Citoyens',
    stakeholderIndustry: 'Industrie',
    stakeholderNgo: 'Société civile',
    stakeholderMep: 'Eurodéputés',
    stakeholderGovernment: 'Gouvernements',
    stakeholderMedia: 'Médias',
    evidenceLabel: 'Preuves',
    crossReferencesLabel: 'Références',
  },
  es: {
    dimensionsLabel: 'Dimensiones',
    stakeholderPerspectivesLabel: 'Perspectivas de partes interesadas',
    temporalAnalysisLabel: 'Análisis temporal',
    shortTermLabel: 'Corto plazo (esta semana)',
    mediumTermLabel: 'Medio plazo (este trimestre)',
    longTermLabel: 'Largo plazo (esta legislatura)',
    dimensionPolitical: 'Político',
    dimensionEconomic: 'Económico',
    dimensionSocial: 'Social',
    dimensionLegal: 'Jurídico',
    dimensionGeopolitical: 'Geopolítico',
    stakeholderCitizen: 'Ciudadanos',
    stakeholderIndustry: 'Industria',
    stakeholderNgo: 'Sociedad civil',
    stakeholderMep: 'Eurodiputados',
    stakeholderGovernment: 'Gobiernos',
    stakeholderMedia: 'Medios',
    evidenceLabel: 'Evidencia',
    crossReferencesLabel: 'Referencias',
  },
  nl: {
    dimensionsLabel: 'Dimensies',
    stakeholderPerspectivesLabel: 'Stakeholderperspectief',
    temporalAnalysisLabel: 'Tijdanalyse',
    shortTermLabel: 'Korte termijn (deze week)',
    mediumTermLabel: 'Middellange termijn (dit kwartaal)',
    longTermLabel: 'Lange termijn (deze termijn)',
    dimensionPolitical: 'Politiek',
    dimensionEconomic: 'Economisch',
    dimensionSocial: 'Sociaal',
    dimensionLegal: 'Juridisch',
    dimensionGeopolitical: 'Geopolitiek',
    stakeholderCitizen: 'Burgers',
    stakeholderIndustry: 'Industrie',
    stakeholderNgo: 'Maatschappelijk middenveld',
    stakeholderMep: 'EP-leden',
    stakeholderGovernment: 'Overheden',
    stakeholderMedia: 'Media',
    evidenceLabel: 'Bewijs',
    crossReferencesLabel: 'Referenties',
  },
  ar: {
    dimensionsLabel: 'الأبعاد',
    stakeholderPerspectivesLabel: 'وجهات نظر أصحاب المصلحة',
    temporalAnalysisLabel: 'التحليل الزمني',
    shortTermLabel: 'قصير الأمد (هذا الأسبوع)',
    mediumTermLabel: 'متوسط الأمد (هذا الربع)',
    longTermLabel: 'طويل الأمد (هذه الفترة)',
    dimensionPolitical: 'سياسي',
    dimensionEconomic: 'اقتصادي',
    dimensionSocial: 'اجتماعي',
    dimensionLegal: 'قانوني',
    dimensionGeopolitical: 'جيوسياسي',
    stakeholderCitizen: 'المواطنون',
    stakeholderIndustry: 'الصناعة',
    stakeholderNgo: 'المجتمع المدني',
    stakeholderMep: 'أعضاء البرلمان',
    stakeholderGovernment: 'الحكومات',
    stakeholderMedia: 'وسائل الإعلام',
    evidenceLabel: 'الأدلة',
    crossReferencesLabel: 'المراجع',
  },
  he: {
    dimensionsLabel: 'ממדים',
    stakeholderPerspectivesLabel: 'נקודות מבט של בעלי עניין',
    temporalAnalysisLabel: 'ניתוח זמני',
    shortTermLabel: 'טווח קצר (השבוע)',
    mediumTermLabel: 'טווח בינוני (הרבעון הנוכחי)',
    longTermLabel: 'טווח ארוך (הכהונה הנוכחית)',
    dimensionPolitical: 'פוליטי',
    dimensionEconomic: 'כלכלי',
    dimensionSocial: 'חברתי',
    dimensionLegal: 'משפטי',
    dimensionGeopolitical: 'גיאופוליטי',
    stakeholderCitizen: 'אזרחים',
    stakeholderIndustry: 'תעשייה',
    stakeholderNgo: 'חברה אזרחית',
    stakeholderMep: 'חברי פרלמנט',
    stakeholderGovernment: 'ממשלות',
    stakeholderMedia: 'תקשורת',
    evidenceLabel: 'ראיות',
    crossReferencesLabel: 'מקורות',
  },
  ja: {
    dimensionsLabel: '次元',
    stakeholderPerspectivesLabel: '利害関係者の視点',
    temporalAnalysisLabel: '時間的分析',
    shortTermLabel: '短期（今週）',
    mediumTermLabel: '中期（今四半期）',
    longTermLabel: '長期（今会期）',
    dimensionPolitical: '政治的',
    dimensionEconomic: '経済的',
    dimensionSocial: '社会的',
    dimensionLegal: '法的',
    dimensionGeopolitical: '地政学的',
    stakeholderCitizen: '市民',
    stakeholderIndustry: '産業',
    stakeholderNgo: '市民社会',
    stakeholderMep: 'MEP',
    stakeholderGovernment: '政府',
    stakeholderMedia: 'メディア',
    evidenceLabel: '根拠',
    crossReferencesLabel: '参考文献',
  },
  ko: {
    dimensionsLabel: '차원',
    stakeholderPerspectivesLabel: '이해관계자 관점',
    temporalAnalysisLabel: '시간적 분석',
    shortTermLabel: '단기(이번 주)',
    mediumTermLabel: '중기(이번 분기)',
    longTermLabel: '장기(이번 임기)',
    dimensionPolitical: '정치적',
    dimensionEconomic: '경제적',
    dimensionSocial: '사회적',
    dimensionLegal: '법적',
    dimensionGeopolitical: '지정학적',
    stakeholderCitizen: '시민',
    stakeholderIndustry: '산업',
    stakeholderNgo: '시민사회',
    stakeholderMep: '유럽의원',
    stakeholderGovernment: '정부',
    stakeholderMedia: '미디어',
    evidenceLabel: '증거',
    crossReferencesLabel: '참고문헌',
  },
  zh: {
    dimensionsLabel: '维度',
    stakeholderPerspectivesLabel: '利益相关者视角',
    temporalAnalysisLabel: '时间维度分析',
    shortTermLabel: '短期（本周）',
    mediumTermLabel: '中期（本季度）',
    longTermLabel: '长期（本届任期）',
    dimensionPolitical: '政治',
    dimensionEconomic: '经济',
    dimensionSocial: '社会',
    dimensionLegal: '法律',
    dimensionGeopolitical: '地缘政治',
    stakeholderCitizen: '公民',
    stakeholderIndustry: '工业',
    stakeholderNgo: '公民社会',
    stakeholderMep: '议员',
    stakeholderGovernment: '政府',
    stakeholderMedia: '媒体',
    evidenceLabel: '证据',
    crossReferencesLabel: '参考文献',
  },
};

// ─── Month-in-Review section heading strings ──────────────────────────────────

/** Section headings for month-in-review articles, localized to all 14 languages */
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
