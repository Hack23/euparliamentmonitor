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
    proposalsHeading: 'Recent Legislative Proposals',
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
    proposalsHeading: 'Senaste Lagstiftningsförslag',
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
    proposalsHeading: 'Seneste Lovgivningsforslag',
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
    proposalsHeading: 'Siste Lovgivningsforslag',
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
    proposalsHeading: 'Viimeisimmät Lainsäädäntöehdotukset',
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
    proposalsHeading: 'Aktuelle Gesetzgebungsvorschläge',
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
    proposalsHeading: 'Propositions Législatives Récentes',
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
    proposalsHeading: 'Propuestas Legislativas Recientes',
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
    proposalsHeading: 'Recente Wetgevingsvoorstellen',
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
    proposalsHeading: 'المقترحات التشريعية الأخيرة',
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
    proposalsHeading: 'הצעות חקיקה אחרונות',
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
    proposalsHeading: '最近の法案提案',
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
    proposalsHeading: '최근 입법 제안',
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
    proposalsHeading: '最近的立法提案',
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
    mistakesHeading: 'Miscalculations & Missed Opportunities',
    alternativeLabel: 'Should have',
    outlookHeading: 'Strategic Outlook',
    severityLow: 'Low',
    severityMedium: 'Medium',
    severityHigh: 'High',
    severityCritical: 'Critical',
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
    mistakesHeading: 'Felbedömningar & Missade Möjligheter',
    alternativeLabel: 'Borde ha',
    outlookHeading: 'Strategisk Utsikt',
    severityLow: 'Låg',
    severityMedium: 'Medel',
    severityHigh: 'Hög',
    severityCritical: 'Kritisk',
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
    mistakesHeading: 'Fejlvurderinger & Forpassede Muligheder',
    alternativeLabel: 'Burde have',
    outlookHeading: 'Strategisk Udsigt',
    severityLow: 'Lav',
    severityMedium: 'Middel',
    severityHigh: 'Høj',
    severityCritical: 'Kritisk',
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
    mistakesHeading: 'Feilberegninger & Tapte Muligheter',
    alternativeLabel: 'Burde ha',
    outlookHeading: 'Strategisk Utsikt',
    severityLow: 'Lav',
    severityMedium: 'Middels',
    severityHigh: 'Høy',
    severityCritical: 'Kritisk',
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
    mistakesHeading: 'Virhearvioinnit & Menetetyt Mahdollisuudet',
    alternativeLabel: 'Olisi pitänyt',
    outlookHeading: 'Strategiset Näkymät',
    severityLow: 'Matala',
    severityMedium: 'Keskitaso',
    severityHigh: 'Korkea',
    severityCritical: 'Kriittinen',
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
    mistakesHeading: 'Fehleinschätzungen & Verpasste Chancen',
    alternativeLabel: 'Hätte sollen',
    outlookHeading: 'Strategischer Ausblick',
    severityLow: 'Niedrig',
    severityMedium: 'Mittel',
    severityHigh: 'Hoch',
    severityCritical: 'Kritisch',
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
    mistakesHeading: 'Erreurs de Calcul & Opportunités Manquées',
    alternativeLabel: 'Aurait dû',
    outlookHeading: 'Perspectives Stratégiques',
    severityLow: 'Faible',
    severityMedium: 'Moyen',
    severityHigh: 'Élevé',
    severityCritical: 'Critique',
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
    mistakesHeading: 'Errores de Cálculo & Oportunidades Perdidas',
    alternativeLabel: 'Debería haber',
    outlookHeading: 'Perspectivas Estratégicas',
    severityLow: 'Bajo',
    severityMedium: 'Medio',
    severityHigh: 'Alto',
    severityCritical: 'Crítico',
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
    mistakesHeading: 'Misrekeningen & Gemiste Kansen',
    alternativeLabel: 'Had moeten',
    outlookHeading: 'Strategisch Vooruitzicht',
    severityLow: 'Laag',
    severityMedium: 'Gemiddeld',
    severityHigh: 'Hoog',
    severityCritical: 'Kritiek',
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
    mistakesHeading: 'أخطاء في الحسابات وفرص ضائعة',
    alternativeLabel: 'كان ينبغي',
    outlookHeading: 'النظرة الاستراتيجية',
    severityLow: 'منخفض',
    severityMedium: 'متوسط',
    severityHigh: 'مرتفع',
    severityCritical: 'حرج',
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
    mistakesHeading: 'טעויות חישוב והזדמנויות שהוחמצו',
    alternativeLabel: 'היה צריך',
    outlookHeading: 'תחזית אסטרטגית',
    severityLow: 'נמוך',
    severityMedium: 'בינוני',
    severityHigh: 'גבוה',
    severityCritical: 'קריטי',
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
    mistakesHeading: '誤算と逃した機会',
    alternativeLabel: 'すべきだった',
    outlookHeading: '戦略的展望',
    severityLow: '低',
    severityMedium: '中',
    severityHigh: '高',
    severityCritical: '重大',
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
    mistakesHeading: '오판과 놓친 기회',
    alternativeLabel: '했어야 했다',
    outlookHeading: '전략적 전망',
    severityLow: '낮음',
    severityMedium: '보통',
    severityHigh: '높음',
    severityCritical: '위기',
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
    mistakesHeading: '误判与错失机会',
    alternativeLabel: '本应',
    outlookHeading: '战略展望',
    severityLow: '低',
    severityMedium: '中',
    severityHigh: '高',
    severityCritical: '严重',
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
  },
};

/** Localized body-text strings for the committee-analysis deep-analysis section */
export const COMMITTEE_ANALYSIS_CONTENT_STRINGS: LanguageMap<CommitteeAnalysisContentStrings> = {
  en: {
    what: 'Committee activity report as of {date}: {total} committees monitored, {docs} documents processed, {active} committees with recent activity.',
    reportDateLabel: 'Reporting date:',
    membersLabel: 'members',
    chairLabel: 'Chair:',
    productivityRobust: 'robust',
    productivityModerate: 'moderate',
    why: 'Committees are the legislative engine of the European Parliament — {pct}% active rate signals {descriptor} legislative productivity. Committee outputs directly shape the texts that reach plenary votes.',
    stakeholderHighlyProductive: '{n} documents — highly productive period',
    stakeholderModerateActivity: '{n} document(s) — moderate activity',
    stakeholderNoDocs: 'No recent documents — potential productivity concern',
    impactPolitical:
      'Committee chairs wield significant agenda-setting power. Active committees ({active}/{total}) are shaping the legislative pipeline for the current session.',
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
      'the legislative pipeline may face bottlenecks if committee output does not increase',
  },
  sv: {
    what: 'Utskottsaktivitetsrapport per {date}: {total} utskott övervakade, {docs} dokument behandlade, {active} utskott med aktuell aktivitet.',
    reportDateLabel: 'Rapportdatum:',
    membersLabel: 'ledamöter',
    chairLabel: 'Ordförande:',
    productivityRobust: 'robust',
    productivityModerate: 'måttlig',
    why: 'Utskotten är Europaparlamentets lagstiftningsmotor — {pct}% aktiv andel signalerar {descriptor} lagstiftningsproduktivitet. Utskottens arbete formar direkt de texter som når plenarvoteringar.',
    stakeholderHighlyProductive: '{n} dokument — mycket produktiv period',
    stakeholderModerateActivity: '{n} dokument — måttlig aktivitet',
    stakeholderNoDocs: 'Inga aktuella dokument — potentiellt produktivitetsproblem',
    impactPolitical:
      'Utskottsordföranden har betydande dagordningsmakt. Aktiva utskott ({active}/{total}) formar den lagstiftande pipeline för innevarande session.',
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
      'den lagstiftande pipeline kan möta flaskhalsar om utskottens produktion inte ökar',
  },
  da: {
    what: 'Udvalgsaktivitetsrapport pr. {date}: {total} udvalg overvåget, {docs} dokumenter behandlet, {active} udvalg med nylig aktivitet.',
    reportDateLabel: 'Rapportdato:',
    membersLabel: 'medlemmer',
    chairLabel: 'Formand:',
    productivityRobust: 'robust',
    productivityModerate: 'moderat',
    why: 'Udvalgene er Europa-Parlamentets lovgivningsmæssige motor — {pct}% aktiv rate signalerer {descriptor} lovgivningsmæssig produktivitet. Udvalgsresultater former direkte de tekster, der når plenarvoteringe.',
    stakeholderHighlyProductive: '{n} dokumenter — meget produktiv periode',
    stakeholderModerateActivity: '{n} dokument(er) — moderat aktivitet',
    stakeholderNoDocs: 'Ingen nylige dokumenter — potentielt produktivitetsproblem',
    impactPolitical:
      'Udvalgsformænd har betydelig dagsordensættende magt. Aktive udvalg ({active}/{total}) former den lovgivningsmæssige pipeline for den aktuelle session.',
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
      'den lovgivningsmæssige pipeline kan møde flaskehalse, hvis udvalgets produktion ikke øges',
  },
  no: {
    what: 'Komitéaktivitetsrapport per {date}: {total} komiteer overvåket, {docs} dokumenter behandlet, {active} komiteer med nylig aktivitet.',
    reportDateLabel: 'Rapportdato:',
    membersLabel: 'medlemmer',
    chairLabel: 'Leder:',
    productivityRobust: 'robust',
    productivityModerate: 'moderat',
    why: 'Komiteene er Europaparlamentets lovgivende motor — {pct}% aktiv rate signaliserer {descriptor} lovgivende produktivitet. Komitéresultater former direkte tekstene som når plenumstemmer.',
    stakeholderHighlyProductive: '{n} dokumenter — svært produktiv periode',
    stakeholderModerateActivity: '{n} dokument(er) — moderat aktivitet',
    stakeholderNoDocs: 'Ingen nylige dokumenter — potensielt produktivitetsproblem',
    impactPolitical:
      'Komitéledere har betydelig dagsordensmakt. Aktive komiteer ({active}/{total}) former den lovgivende pipeline for den nåværende sesjonen.',
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
      'den lovgivende pipeline kan møte flaskehalser hvis komitéens produksjon ikke øker',
  },
  fi: {
    what: 'Valiokuntatoimintaraportti {date}: {total} valiokuntaa seurannassa, {docs} asiakirjaa käsitelty, {active} valiokuntaa viimeaikaisella toiminnalla.',
    reportDateLabel: 'Raportointipäivä:',
    membersLabel: 'jäsentä',
    chairLabel: 'Puheenjohtaja:',
    productivityRobust: 'vankka',
    productivityModerate: 'kohtalainen',
    why: 'Valiokunnat ovat Euroopan parlamentin lainsäädäntömoottori — {pct}%:n aktiivisuusaste merkitsee {descriptor} lainsäädäntötuottavuutta. Valiokuntien tuotokset muovaavat suoraan täysistuntoäänestyksiin päätyviä tekstejä.',
    stakeholderHighlyProductive: '{n} asiakirjaa — erittäin tuottoisa kausi',
    stakeholderModerateActivity: '{n} asiakirja(a) — kohtalainen aktiivisuus',
    stakeholderNoDocs: 'Ei viimeaikaisia asiakirjoja — mahdollinen tuottavuusongelma',
    impactPolitical:
      'Valiokuntien puheenjohtajilla on merkittävä esityslistalle asettamisen valta. Aktiiviset valiokunnat ({active}/{total}) muovaavat nykyisen istuntokauden lainsäädäntöprosessia.',
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
      'lainsäädäntöprosessi saattaa kohdata pullonkauloja, jos valiokuntien tuotanto ei kasva',
  },
  de: {
    what: 'Ausschussaktivitätsbericht vom {date}: {total} Ausschüsse beobachtet, {docs} Dokumente verarbeitet, {active} Ausschüsse mit aktueller Aktivität.',
    reportDateLabel: 'Berichtsdatum:',
    membersLabel: 'Mitglieder',
    chairLabel: 'Vorsitzender:',
    productivityRobust: 'robuste',
    productivityModerate: 'moderate',
    why: 'Ausschüsse sind die Gesetzgebungsmaschine des Europäischen Parlaments — {pct}% Aktivitätsrate signalisiert {descriptor} Gesetzgebungsproduktivität. Ausschussergebnisse gestalten direkt die Texte, die zur Plenarvorabstimmung gelangen.',
    stakeholderHighlyProductive: '{n} Dokumente — sehr produktiver Zeitraum',
    stakeholderModerateActivity: '{n} Dokument(e) — moderate Aktivität',
    stakeholderNoDocs: 'Keine aktuellen Dokumente — mögliches Produktivitätsproblem',
    impactPolitical:
      'Ausschussvorsitzende haben erhebliche Tagesordnungsmacht. Aktive Ausschüsse ({active}/{total}) gestalten den Gesetzgebungsprozess der laufenden Session.',
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
      'die Gesetzgebungspipeline könnte auf Engpässe stoßen, wenn die Ausschussproduktion nicht zunimmt',
  },
  fr: {
    what: "Rapport d'activité des commissions du {date} : {total} commissions surveillées, {docs} documents traités, {active} commissions avec activité récente.",
    reportDateLabel: 'Date du rapport :',
    membersLabel: 'membres',
    chairLabel: 'Président(e) :',
    productivityRobust: 'robuste',
    productivityModerate: 'modérée',
    why: "Les commissions sont le moteur législatif du Parlement européen — un taux d'activité de {pct}% signale une productivité législative {descriptor}. Les résultats des commissions façonnent directement les textes soumis aux votes en séance plénière.",
    stakeholderHighlyProductive: '{n} documents — période très productive',
    stakeholderModerateActivity: '{n} document(s) — activité modérée',
    stakeholderNoDocs: 'Aucun document récent — préoccupation potentielle de productivité',
    impactPolitical:
      "Les présidents de commission exercent un pouvoir considérable sur la définition de l'ordre du jour. Les commissions actives ({active}/{total}) façonnent le pipeline législatif de la session en cours.",
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
      "le pipeline législatif pourrait rencontrer des goulots d'étranglement si la production des commissions n'augmente pas",
  },
  es: {
    what: 'Informe de actividad de las comisiones a fecha {date}: {total} comisiones supervisadas, {docs} documentos procesados, {active} comisiones con actividad reciente.',
    reportDateLabel: 'Fecha del informe:',
    membersLabel: 'miembros',
    chairLabel: 'Presidente/a:',
    productivityRobust: 'sólida',
    productivityModerate: 'moderada',
    why: 'Las comisiones son el motor legislativo del Parlamento Europeo — una tasa de actividad del {pct}% indica una productividad legislativa {descriptor}. Los resultados de las comisiones moldean directamente los textos que llegan a las votaciones plenarias.',
    stakeholderHighlyProductive: '{n} documentos — período muy productivo',
    stakeholderModerateActivity: '{n} documento(s) — actividad moderada',
    stakeholderNoDocs: 'No hay documentos recientes — posible preocupación de productividad',
    impactPolitical:
      'Los presidentes de comisión ejercen un poder considerable en la fijación del orden del día. Las comisiones activas ({active}/{total}) están configurando el proceso legislativo para la sesión actual.',
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
      'el proceso legislativo puede enfrentarse a cuellos de botella si la producción de las comisiones no aumenta',
  },
  nl: {
    what: 'Rapport commissieactiviteiten per {date}: {total} commissies gemonitord, {docs} documenten verwerkt, {active} commissies met recente activiteit.',
    reportDateLabel: 'Rapportdatum:',
    membersLabel: 'leden',
    chairLabel: 'Voorzitter:',
    productivityRobust: 'robuuste',
    productivityModerate: 'matige',
    why: 'Commissies zijn de wetgevende motor van het Europees Parlement — {pct}% activiteitsgraad duidt op {descriptor} wetgevende productiviteit. Commissieresultaten bepalen direct de teksten die ter stemming in de plenaire vergadering komen.',
    stakeholderHighlyProductive: '{n} documenten — zeer productieve periode',
    stakeholderModerateActivity: '{n} document(en) — matige activiteit',
    stakeholderNoDocs: 'Geen recente documenten — mogelijke productiviteitszorg',
    impactPolitical:
      'Commissievoorzitters hebben aanzienlijke agendavormende macht. Actieve commissies ({active}/{total}) bepalen de wetgevende pipeline voor de huidige zitting.',
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
      'de wetgevende pipeline kan knelpunten ondervinden als de commissieproductie niet toeneemt',
  },
  ar: {
    what: 'تقرير نشاط اللجان بتاريخ {date}: {total} لجنة مراقبة، {docs} وثيقة معالجة، {active} لجنة ذات نشاط حديث.',
    reportDateLabel: 'تاريخ التقرير:',
    membersLabel: 'عضو',
    chairLabel: 'الرئيس:',
    productivityRobust: 'قوية',
    productivityModerate: 'معتدلة',
    why: 'تُعدّ اللجان المحرك التشريعي للبرلمان الأوروبي — تُشير نسبة النشاط {pct}٪ إلى إنتاجية تشريعية {descriptor}. تُشكّل مخرجات اللجان مباشرةً النصوص التي تصل إلى تصويتات الجلسة العامة.',
    stakeholderHighlyProductive: '{n} وثيقة — فترة منتجة جداً',
    stakeholderModerateActivity: '{n} وثيقة/وثائق — نشاط معتدل',
    stakeholderNoDocs: 'لا وثائق حديثة — مخاوف إنتاجية محتملة',
    impactPolitical:
      'يتمتع رؤساء اللجان بسلطة تحديد جدول الأعمال. تُشكّل اللجان النشطة ({active}/{total}) مسار التشريع للدورة الحالية.',
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
    outlookConcern: 'قد يواجه المسار التشريعي اختناقات إذا لم يزداد إنتاج اللجان',
  },
  he: {
    what: 'דוח פעילות ועדות מתאריך {date}: {total} ועדות במעקב, {docs} מסמכים עובדו, {active} ועדות עם פעילות אחרונה.',
    reportDateLabel: 'תאריך הדוח:',
    membersLabel: 'חברים',
    chairLabel: 'יו"ר:',
    productivityRobust: 'חזקה',
    productivityModerate: 'מתונה',
    why: 'הוועדות הן המנוע החקיקתי של הפרלמנט האירופי — שיעור פעילות של {pct}% מצביע על פריון חקיקתי {descriptor}. תפוקות הוועדות מעצבות ישירות את הטקסטים המגיעים להצבעות מליאה.',
    stakeholderHighlyProductive: '{n} מסמכים — תקופה פרודוקטיבית מאוד',
    stakeholderModerateActivity: '{n} מסמך/ים — פעילות מתונה',
    stakeholderNoDocs: 'אין מסמכים אחרונים — חשש פוטנציאלי לפריון',
    impactPolitical:
      'לראשי ועדות יש כוח קביעת סדר יום משמעותי. ועדות פעילות ({active}/{total}) מעצבות את צינור החקיקה לפגישה הנוכחית.',
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
    outlookConcern: 'צינור החקיקה עלול להיתקל בצווארי בקבוק אם תפוקת הוועדה לא תגדל',
  },
  ja: {
    what: '{date}付け委員会活動報告: {total}委員会を監視中、{docs}文書処理済み、{active}委員会で最近の活動あり。',
    reportDateLabel: '報告日:',
    membersLabel: '名',
    chairLabel: '委員長:',
    productivityRobust: '堅調な',
    productivityModerate: '中程度の',
    why: '委員会は欧州議会の立法エンジンです — 活動率{pct}%は{descriptor}立法生産性を示しています。委員会の成果物は、本会議投票に提出されるテキストを直接形成します。',
    stakeholderHighlyProductive: '{n}文書 — 非常に生産的な期間',
    stakeholderModerateActivity: '{n}文書 — 中程度の活動',
    stakeholderNoDocs: '最近の文書なし — 生産性に関する懸念の可能性',
    impactPolitical:
      '委員会委員長は重要な議題設定権を持っています。活発な委員会({active}/{total})が現会期の立法パイプラインを形成しています。',
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
      '委員会の文書作成が増加しない場合、立法パイプラインにボトルネックが生じる可能性があります',
  },
  ko: {
    what: '{date} 기준 위원회 활동 보고서: {total}개 위원회 모니터링, {docs}개 문서 처리, {active}개 위원회 최근 활동.',
    reportDateLabel: '보고 날짜:',
    membersLabel: '명',
    chairLabel: '의장:',
    productivityRobust: '강력한',
    productivityModerate: '보통의',
    why: '위원회는 유럽 의회의 입법 엔진입니다 — 활동률 {pct}%는 {descriptor} 입법 생산성을 나타냅니다. 위원회 결과물은 본회의 투표에 상정되는 텍스트를 직접 형성합니다.',
    stakeholderHighlyProductive: '{n}개 문서 — 매우 생산적인 기간',
    stakeholderModerateActivity: '{n}개 문서 — 보통 활동',
    stakeholderNoDocs: '최근 문서 없음 — 잠재적 생산성 우려',
    impactPolitical:
      '위원회 의장들은 의사일정 설정에 상당한 권한을 가집니다. 활동적인 위원회({active}/{total})가 현 회기의 입법 파이프라인을 형성하고 있습니다.',
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
      '위원회 문서 생산이 증가하지 않으면 입법 파이프라인에 병목 현상이 발생할 수 있습니다',
  },
  zh: {
    what: '{date}委员会活动报告：监测{total}个委员会，处理{docs}份文件，{active}个委员会有近期活动。',
    reportDateLabel: '报告日期：',
    membersLabel: '名成员',
    chairLabel: '主席：',
    productivityRobust: '强劲的',
    productivityModerate: '温和的',
    why: '委员会是欧洲议会的立法引擎——{pct}%的活跃率表明{descriptor}立法生产力。委员会的成果直接塑造提交全体会议投票的文本。',
    stakeholderHighlyProductive: '{n}份文件——非常高产的时期',
    stakeholderModerateActivity: '{n}份文件——中等活跃度',
    stakeholderNoDocs: '近期无文件——潜在的生产力问题',
    impactPolitical:
      '委员会主席在制定议程方面拥有重要权力。活跃委员会({active}/{total})正在为当前会期塑造立法管道。',
    impactEconomic: '委员会在经济、工业和贸易事务方面的成果直接影响欧盟监管环境和商业竞争力。',
    impactSocial: '社会事务、就业及公民自由委员会制定的立法直接影响公民的日常生活。',
    impactLegal: '{docs}份文件处于委员会审议的不同阶段，最终将创建或修改欧盟法律。',
    impactGeopolitical: '外交事务和国际贸易委员会活动反映了欧盟外交和贸易优先事项的演变。',
    actionProcessed: '{abbr}处理了{n}份文件',
    actionConsequence: '立法提案进入下一阶段；受影响的利益相关方应为实施做好准备',
    mistakeDescription: '近期未产出文件——立法积压可能正在形成',
    mistakeAlternative: '召开额外会议或重新分配资源以处理待审文件',
    outlookGood: '{total}个委员会中有{n}个正在积极产出文件，当前速度支持富有成效的全体会议日历。',
    outlookConcern: '如果委员会产出不增加，立法管道可能面临瓶颈',
  },
};
