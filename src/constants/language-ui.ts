// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/LanguageUI
 * @description UI-facing localized strings — page titles, descriptions, section headings,
 * accessibility labels, article type labels, and read-time formatters.
 */

import type { LanguageMap, ArticleCategoryLabels } from '../types/index.js';
import { ArticleCategory } from '../types/index.js';

/** Page titles per language */
export const PAGE_TITLES: LanguageMap = {
  en: 'EU Parliament Monitor - News',
  sv: 'EU-parlamentsmonitor - Nyheter',
  da: 'EU-parlamentsmonitor - Nyheder',
  no: 'EU-parlamentsmonitor - Nyheter',
  fi: 'EU-parlamentin seuranta - Uutiset',
  de: 'EU-Parlamentsmonitor - Nachrichten',
  fr: 'Moniteur du Parlement UE - Actualités',
  es: 'Monitor del Parlamento UE - Noticias',
  nl: 'EU Parlementsmonitor - Nieuws',
  ar: 'مراقب البرلمان الأوروبي - أخبار',
  he: 'מוניטור הפרלמנט האירופי - חדשות',
  ja: 'EU議会モニター - ニュース',
  ko: 'EU 의회 모니터 - 뉴스',
  zh: 'EU议会监测 - 新闻',
};

/** Page descriptions per language */
export const PAGE_DESCRIPTIONS: LanguageMap = {
  en: 'Latest news and analysis about European Parliament activities',
  sv: 'Senaste nyheterna och analyser om Europaparlamentets verksamhet',
  da: 'Seneste nyheder og analyser om Europa-Parlamentets aktiviteter',
  no: 'Siste nytt og analyser om Europaparlamentets aktiviteter',
  fi: 'Viimeisimmät uutiset ja analyysit Euroopan parlamentin toiminnasta',
  de: 'Neueste Nachrichten und Analysen zu den Aktivitäten des Europäischen Parlaments',
  fr: 'Dernières nouvelles et analyses sur les activités du Parlement européen',
  es: 'Últimas noticias y análisis sobre las actividades del Parlamento Europeo',
  nl: 'Laatste nieuws en analyses over activiteiten van het Europees Parlement',
  ar: 'آخر الأخبار والتحليلات حول أنشطة البرلمان الأوروبي',
  he: 'חדשות ואנליזות עדכניות על פעילויות הפרלמנט האירופי',
  ja: '欧州議会活動に関する最新ニュースと分析',
  ko: '유럽 의회 활동에 관한 최신 뉴스 및 분석',
  zh: '关于欧洲议会活动的最新新闻和分析',
};

/** Section headings per language */
export const SECTION_HEADINGS: LanguageMap = {
  en: 'Latest News',
  sv: 'Senaste Nyheterna',
  da: 'Seneste Nyheder',
  no: 'Siste Nytt',
  fi: 'Viimeisimmät Uutiset',
  de: 'Neueste Nachrichten',
  fr: 'Dernières Actualités',
  es: 'Últimas Noticias',
  nl: 'Laatste Nieuws',
  ar: 'آخر الأخبار',
  he: 'חדשות אחרונות',
  ja: '最新ニュース',
  ko: '최신 뉴스',
  zh: '最新新闻',
};

/** "No articles" messages per language */
export const NO_ARTICLES_MESSAGES: LanguageMap = {
  en: 'No articles available yet.',
  sv: 'Inga artiklar tillgängliga ännu.',
  da: 'Ingen artikler tilgængelige endnu.',
  no: 'Ingen artikler tilgjengelige ennå.',
  fi: 'Ei vielä saatavilla olevia artikkeleita.',
  de: 'Noch keine Artikel verfügbar.',
  fr: 'Aucun article disponible pour le moment.',
  es: 'Aún no hay artículos disponibles.',
  nl: 'Nog geen artikelen beschikbaar.',
  ar: 'لا توجد مقالات متاحة بعد.',
  he: 'אין עדיין מאמרים זמינים.',
  ja: 'まだ記事がありません。',
  ko: '아직 이용 가능한 기사가 없습니다.',
  zh: '暂无文章。',
};

/** Skip link text per language */
export const SKIP_LINK_TEXTS: LanguageMap = {
  en: 'Skip to main content',
  sv: 'Hoppa till huvudinnehåll',
  da: 'Spring til hovedindhold',
  no: 'Hopp til hovedinnhold',
  fi: 'Siirry pääsisältöön',
  de: 'Zum Hauptinhalt springen',
  fr: 'Aller au contenu principal',
  es: 'Ir al contenido principal',
  nl: 'Ga naar hoofdinhoud',
  ar: 'انتقل إلى المحتوى الرئيسي',
  he: 'דלג לתוכן הראשי',
  ja: 'メインコンテンツへスキップ',
  ko: '본문으로 건너뛰기',
  zh: '跳至主要内容',
};

/** Article category labels per language — covers all ArticleCategory values */
export const ARTICLE_TYPE_LABELS: LanguageMap<ArticleCategoryLabels> = {
  en: {
    [ArticleCategory.WEEK_AHEAD]: 'Week Ahead',
    [ArticleCategory.MONTH_AHEAD]: 'Month Ahead',
    [ArticleCategory.YEAR_AHEAD]: 'Year Ahead',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Week in Review',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Month in Review',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Year in Review',
    [ArticleCategory.BREAKING_NEWS]: 'Breaking News',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Committee Reports',
    [ArticleCategory.MOTIONS]: 'Parliamentary Motions',
    [ArticleCategory.PROPOSITIONS]: 'Legislative Proposals',
    [ArticleCategory.DEEP_ANALYSIS]: 'Deep Analysis',
  },
  sv: {
    [ArticleCategory.WEEK_AHEAD]: 'Vecka Framåt',
    [ArticleCategory.MONTH_AHEAD]: 'Månad Framåt',
    [ArticleCategory.YEAR_AHEAD]: 'År Framåt',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Veckans Sammanfattning',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Månadens Sammanfattning',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Årets Sammanfattning',
    [ArticleCategory.BREAKING_NEWS]: 'Senaste Nytt',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Utskottsrapporter',
    [ArticleCategory.MOTIONS]: 'Parlamentariska Motioner',
    [ArticleCategory.PROPOSITIONS]: 'Lagstiftningsförslag',
    [ArticleCategory.DEEP_ANALYSIS]: 'Djupanalys',
  },
  da: {
    [ArticleCategory.WEEK_AHEAD]: 'Ugen Fremover',
    [ArticleCategory.MONTH_AHEAD]: 'Måneden Fremover',
    [ArticleCategory.YEAR_AHEAD]: 'Året Fremover',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Ugens Overblik',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Månedens Overblik',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Årets Overblik',
    [ArticleCategory.BREAKING_NEWS]: 'Seneste Nyt',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Udvalgsrapporter',
    [ArticleCategory.MOTIONS]: 'Parlamentariske Motioner',
    [ArticleCategory.PROPOSITIONS]: 'Lovgivningsforslag',
    [ArticleCategory.DEEP_ANALYSIS]: 'Dybdeanalyse',
  },
  no: {
    [ArticleCategory.WEEK_AHEAD]: 'Uken Fremover',
    [ArticleCategory.MONTH_AHEAD]: 'Måneden Fremover',
    [ArticleCategory.YEAR_AHEAD]: 'Året Fremover',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Ukens Oppsummering',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Månedens Oppsummering',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Årets Oppsummering',
    [ArticleCategory.BREAKING_NEWS]: 'Siste Nytt',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Komitérapporter',
    [ArticleCategory.MOTIONS]: 'Parlamentariske Forslag',
    [ArticleCategory.PROPOSITIONS]: 'Lovgivningsforslag',
    [ArticleCategory.DEEP_ANALYSIS]: 'Dybdeanalyse',
  },
  fi: {
    [ArticleCategory.WEEK_AHEAD]: 'Tuleva Viikko',
    [ArticleCategory.MONTH_AHEAD]: 'Tuleva Kuukausi',
    [ArticleCategory.YEAR_AHEAD]: 'Tuleva Vuosi',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Viikon Katsaus',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Kuukauden Katsaus',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Vuoden Katsaus',
    [ArticleCategory.BREAKING_NEWS]: 'Uusimmat Uutiset',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Valiokuntaraportit',
    [ArticleCategory.MOTIONS]: 'Parlamentaariset Esitykset',
    [ArticleCategory.PROPOSITIONS]: 'Lainsäädäntöehdotukset',
    [ArticleCategory.DEEP_ANALYSIS]: 'Syväanalyysi',
  },
  de: {
    [ArticleCategory.WEEK_AHEAD]: 'Woche Voraus',
    [ArticleCategory.MONTH_AHEAD]: 'Monat Voraus',
    [ArticleCategory.YEAR_AHEAD]: 'Jahr Voraus',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Wochenrückblick',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Monatsrückblick',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Jahresrückblick',
    [ArticleCategory.BREAKING_NEWS]: 'Eilmeldung',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Ausschussberichte',
    [ArticleCategory.MOTIONS]: 'Parlamentarische Anträge',
    [ArticleCategory.PROPOSITIONS]: 'Gesetzgebungsvorschläge',
    [ArticleCategory.DEEP_ANALYSIS]: 'Tiefenanalyse',
  },
  fr: {
    [ArticleCategory.WEEK_AHEAD]: 'Semaine à Venir',
    [ArticleCategory.MONTH_AHEAD]: 'Mois à Venir',
    [ArticleCategory.YEAR_AHEAD]: 'Année à Venir',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Bilan de la Semaine',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Bilan du Mois',
    [ArticleCategory.YEAR_IN_REVIEW]: "Bilan de l'Année",
    [ArticleCategory.BREAKING_NEWS]: 'Dernières Nouvelles',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Rapports de Commission',
    [ArticleCategory.MOTIONS]: 'Motions Parlementaires',
    [ArticleCategory.PROPOSITIONS]: 'Propositions Législatives',
    [ArticleCategory.DEEP_ANALYSIS]: 'Analyse Approfondie',
  },
  es: {
    [ArticleCategory.WEEK_AHEAD]: 'Semana Próxima',
    [ArticleCategory.MONTH_AHEAD]: 'Mes Próximo',
    [ArticleCategory.YEAR_AHEAD]: 'Año Próximo',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Resumen de la Semana',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Resumen del Mes',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Resumen del Año',
    [ArticleCategory.BREAKING_NEWS]: 'Noticias de Última Hora',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Informes de Comisión',
    [ArticleCategory.MOTIONS]: 'Mociones Parlamentarias',
    [ArticleCategory.PROPOSITIONS]: 'Propuestas Legislativas',
    [ArticleCategory.DEEP_ANALYSIS]: 'Análisis Profundo',
  },
  nl: {
    [ArticleCategory.WEEK_AHEAD]: 'Week Vooruit',
    [ArticleCategory.MONTH_AHEAD]: 'Maand Vooruit',
    [ArticleCategory.YEAR_AHEAD]: 'Jaar Vooruit',
    [ArticleCategory.WEEK_IN_REVIEW]: 'Weekoverzicht',
    [ArticleCategory.MONTH_IN_REVIEW]: 'Maandoverzicht',
    [ArticleCategory.YEAR_IN_REVIEW]: 'Jaaroverzicht',
    [ArticleCategory.BREAKING_NEWS]: 'Laatste Nieuws',
    [ArticleCategory.COMMITTEE_REPORTS]: 'Commissierapporten',
    [ArticleCategory.MOTIONS]: 'Parlementaire Moties',
    [ArticleCategory.PROPOSITIONS]: 'Wetgevingsvoorstellen',
    [ArticleCategory.DEEP_ANALYSIS]: 'Diepgaande Analyse',
  },
  ar: {
    [ArticleCategory.WEEK_AHEAD]: 'الأسبوع القادم',
    [ArticleCategory.MONTH_AHEAD]: 'الشهر القادم',
    [ArticleCategory.YEAR_AHEAD]: 'العام القادم',
    [ArticleCategory.WEEK_IN_REVIEW]: 'مراجعة الأسبوع',
    [ArticleCategory.MONTH_IN_REVIEW]: 'مراجعة الشهر',
    [ArticleCategory.YEAR_IN_REVIEW]: 'مراجعة العام',
    [ArticleCategory.BREAKING_NEWS]: 'أخبار عاجلة',
    [ArticleCategory.COMMITTEE_REPORTS]: 'تقارير اللجان',
    [ArticleCategory.MOTIONS]: 'اقتراحات برلمانية',
    [ArticleCategory.PROPOSITIONS]: 'مقترحات تشريعية',
    [ArticleCategory.DEEP_ANALYSIS]: 'تحليل معمّق',
  },
  he: {
    [ArticleCategory.WEEK_AHEAD]: 'השבוע הקרוב',
    [ArticleCategory.MONTH_AHEAD]: 'החודש הקרוב',
    [ArticleCategory.YEAR_AHEAD]: 'השנה הקרובה',
    [ArticleCategory.WEEK_IN_REVIEW]: 'סיכום השבוע',
    [ArticleCategory.MONTH_IN_REVIEW]: 'סיכום החודש',
    [ArticleCategory.YEAR_IN_REVIEW]: 'סיכום השנה',
    [ArticleCategory.BREAKING_NEWS]: 'חדשות דחופות',
    [ArticleCategory.COMMITTEE_REPORTS]: 'דוחות ועדות',
    [ArticleCategory.MOTIONS]: 'הצעות פרלמנטריות',
    [ArticleCategory.PROPOSITIONS]: 'הצעות חקיקה',
    [ArticleCategory.DEEP_ANALYSIS]: 'ניתוח מעמיק',
  },
  ja: {
    [ArticleCategory.WEEK_AHEAD]: '今週の予定',
    [ArticleCategory.MONTH_AHEAD]: '今月の予定',
    [ArticleCategory.YEAR_AHEAD]: '年間展望',
    [ArticleCategory.WEEK_IN_REVIEW]: '週間レビュー',
    [ArticleCategory.MONTH_IN_REVIEW]: '月間レビュー',
    [ArticleCategory.YEAR_IN_REVIEW]: '年間レビュー',
    [ArticleCategory.BREAKING_NEWS]: '速報',
    [ArticleCategory.COMMITTEE_REPORTS]: '委員会報告',
    [ArticleCategory.MOTIONS]: '議会動議',
    [ArticleCategory.PROPOSITIONS]: '法案提案',
    [ArticleCategory.DEEP_ANALYSIS]: '深層分析',
  },
  ko: {
    [ArticleCategory.WEEK_AHEAD]: '다음 주 일정',
    [ArticleCategory.MONTH_AHEAD]: '다음 달 일정',
    [ArticleCategory.YEAR_AHEAD]: '연간 전망',
    [ArticleCategory.WEEK_IN_REVIEW]: '주간 리뷰',
    [ArticleCategory.MONTH_IN_REVIEW]: '월간 리뷰',
    [ArticleCategory.YEAR_IN_REVIEW]: '연간 리뷰',
    [ArticleCategory.BREAKING_NEWS]: '속보',
    [ArticleCategory.COMMITTEE_REPORTS]: '위원회 보고서',
    [ArticleCategory.MOTIONS]: '의회 동의안',
    [ArticleCategory.PROPOSITIONS]: '입법 제안',
    [ArticleCategory.DEEP_ANALYSIS]: '심층 분석',
  },
  zh: {
    [ArticleCategory.WEEK_AHEAD]: '下周预告',
    [ArticleCategory.MONTH_AHEAD]: '下月预告',
    [ArticleCategory.YEAR_AHEAD]: '年度展望',
    [ArticleCategory.WEEK_IN_REVIEW]: '每周回顾',
    [ArticleCategory.MONTH_IN_REVIEW]: '每月回顾',
    [ArticleCategory.YEAR_IN_REVIEW]: '年度回顾',
    [ArticleCategory.BREAKING_NEWS]: '突发新闻',
    [ArticleCategory.COMMITTEE_REPORTS]: '委员会报告',
    [ArticleCategory.MOTIONS]: '议会动议',
    [ArticleCategory.PROPOSITIONS]: '立法提案',
    [ArticleCategory.DEEP_ANALYSIS]: '深度分析',
  },
};

/** Read time label formatters per language */
export const READ_TIME_LABELS: LanguageMap<(time: number) => string> = {
  en: (time: number) => `${time} min read`,
  sv: (time: number) => `${time} min läsning`,
  da: (time: number) => `${time} min læsetid`,
  no: (time: number) => `${time} min lesetid`,
  fi: (time: number) => `${time} min lukuaika`,
  de: (time: number) => `${time} Min. Lesezeit`,
  fr: (time: number) => `${time} min de lecture`,
  es: (time: number) => `${time} min de lectura`,
  nl: (time: number) => `${time} min leestijd`,
  ar: (time: number) => `${time} دقائق قراءة`,
  he: (time: number) => `${time} דקות קריאה`,
  ja: (time: number) => `${time}分で読了`,
  ko: (time: number) => `${time}분 읽기`,
  zh: (time: number) => `${time}分钟阅读`,
};

/** Back to news link labels per language */
export const BACK_TO_NEWS_LABELS: LanguageMap = {
  en: '← Back to News',
  sv: '← Tillbaka till Nyheter',
  da: '← Tilbage til Nyheder',
  no: '← Tilbake til Nyheter',
  fi: '← Takaisin Uutisiin',
  de: '← Zurück zu Nachrichten',
  fr: '← Retour aux Actualités',
  es: '← Volver a Noticias',
  nl: '← Terug naar Nieuws',
  ar: '→ العودة إلى الأخبار',
  he: '→ חזרה לחדשות',
  ja: '← ニュースに戻る',
  ko: '← 뉴스로 돌아가기',
  zh: '← 返回新闻',
};

/** Article navigation aria-label per language */
export const ARTICLE_NAV_LABELS: LanguageMap = {
  en: 'Article navigation',
  sv: 'Artikelnavigering',
  da: 'Artikelnavigation',
  no: 'Artikkelnavigasjon',
  fi: 'Artikkelin navigointi',
  de: 'Artikelnavigation',
  fr: "Navigation de l'article",
  es: 'Navegación del artículo',
  nl: 'Artikelnavigatie',
  ar: 'التنقل في المقالة',
  he: 'ניווט מאמר',
  ja: '記事ナビゲーション',
  ko: '기사 탐색',
  zh: '文章导航',
};

/* ─── AI Section Localized Strings ───────────────────────────────── */

/** Shared language codes display string */
const LANG_CODES_LIST = 'EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH';

/** Shared Nordic agent label (sv/da/no) */
const NORDIC_AGENTS = '8 AI-agenter';

/** AI section interface for structured localized content */
export interface AISection {
  heading: string;
  quote: string;
  description: string;
  featureAgents: string;
  featureAgentsDesc: string;
  featureLanguages: string;
  featureLanguagesDesc: string;
  featureHuman: string;
  featureHumanDesc: string;
  featureData: string;
  featureDataDesc: string;
}

/** AI section localized content for all 14 languages */
export const AI_SECTION_CONTENT: LanguageMap<AISection> = {
  en: {
    heading: 'AI-Powered Parliamentary Intelligence',
    quote:
      'Real-time European Parliament monitoring powered by 8 autonomous AI agents delivering investigative political intelligence in 14 languages.',
    description:
      'EU Parliament Monitor autonomously generates deep political analysis at machine speed. Every article is researched, written, and localized by AI agents operating on live European Parliament data via the MCP Server.',
    featureAgents: '8 AI Agents',
    featureAgentsDesc: 'News, data, frontend, quality, security, docs, DevOps, product',
    featureLanguages: '14 Languages',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Human-in-the-Loop',
    featureHumanDesc: 'AI drafts, humans review and publish',
    featureData: 'Live Parliament Data',
    featureDataDesc: 'European Parliament Open Data via MCP Server',
  },
  sv: {
    heading: 'AI-driven parlamentarisk intelligens',
    quote:
      'Realtidsövervakning av Europaparlamentet driven av 8 autonoma AI-agenter som levererar politisk underrättelseanalys på 14 språk.',
    description:
      'EU Parliament Monitor genererar autonomt djup politisk analys i maskinhastighet. Varje artikel forskas, skrivs och lokaliseras av AI-agenter som arbetar med Europaparlamentets livedata via MCP-servern.',
    featureAgents: NORDIC_AGENTS,
    featureAgentsDesc: 'Nyheter, data, frontend, kvalitet, säkerhet, dokumentation, DevOps, produkt',
    featureLanguages: '14 språk',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Människa i loopen',
    featureHumanDesc: 'AI skriver utkast, människor granskar och publicerar',
    featureData: 'Parlamentsdata i realtid',
    featureDataDesc: 'Europaparlamentets öppna data via MCP-server',
  },
  da: {
    heading: 'AI-drevet parlamentarisk efterretning',
    quote:
      'Realtidsovervågning af Europa-Parlamentet drevet af 8 autonome AI-agenter, der leverer politisk efterretningsanalyse på 14 sprog.',
    description:
      'EU Parliament Monitor genererer autonomt dybdegående politisk analyse med maskinhastighed. Hver artikel researches, skrives og lokaliseres af AI-agenter, der opererer på Europa-Parlamentets livedata via MCP-serveren.',
    featureAgents: NORDIC_AGENTS,
    featureAgentsDesc: 'Nyheder, data, frontend, kvalitet, sikkerhed, dokumentation, DevOps, produkt',
    featureLanguages: '14 sprog',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Menneske i kredsløbet',
    featureHumanDesc: 'AI udkaster, mennesker gennemgår og udgiver',
    featureData: 'Parlamentsdata i realtid',
    featureDataDesc: 'Europa-Parlamentets åbne data via MCP-server',
  },
  no: {
    heading: 'AI-drevet parlamentarisk etterretning',
    quote:
      'Sanntidsovervåking av Europaparlamentet drevet av 8 autonome AI-agenter som leverer politisk etterretningsanalyse på 14 språk.',
    description:
      'EU Parliament Monitor genererer autonomt dyptgående politisk analyse i maskinhastighet. Hver artikkel forskes, skrives og lokaliseres av AI-agenter som opererer på Europaparlamentets sanntidsdata via MCP-serveren.',
    featureAgents: NORDIC_AGENTS,
    featureAgentsDesc: 'Nyheter, data, frontend, kvalitet, sikkerhet, dokumentasjon, DevOps, produkt',
    featureLanguages: '14 språk',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Menneske i loopen',
    featureHumanDesc: 'AI skriver utkast, mennesker gjennomgår og publiserer',
    featureData: 'Parlamentsdata i sanntid',
    featureDataDesc: 'Europaparlamentets åpne data via MCP-server',
  },
  fi: {
    heading: 'Tekoälyohjattu parlamentaarinen tiedustelu',
    quote:
      'Euroopan parlamentin reaaliaikainen seuranta 8 autonomisen tekoälyagentin avulla, jotka tuottavat poliittista tiedusteluanalyysiä 14 kielellä.',
    description:
      'EU Parliament Monitor tuottaa autonomisesti syvällistä poliittista analyysiä konenopeudella. Jokainen artikkeli tutkitaan, kirjoitetaan ja lokalisoidaan tekoälyagenteilla, jotka käyttävät Euroopan parlamentin reaaliaikaista dataa MCP-palvelimen kautta.',
    featureAgents: '8 tekoälyagenttia',
    featureAgentsDesc: 'Uutiset, data, frontend, laatu, turvallisuus, dokumentaatio, DevOps, tuote',
    featureLanguages: '14 kieltä',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Ihminen mukana prosessissa',
    featureHumanDesc: 'Tekoäly luonnostelee, ihmiset tarkistavat ja julkaisevat',
    featureData: 'Reaaliaikainen parlamenttidata',
    featureDataDesc: 'Euroopan parlamentin avoin data MCP-palvelimen kautta',
  },
  de: {
    heading: 'KI-gestützte parlamentarische Aufklärung',
    quote:
      'Echtzeit-Überwachung des Europäischen Parlaments durch 8 autonome KI-Agenten, die investigative politische Analysen in 14 Sprachen liefern.',
    description:
      'EU Parliament Monitor generiert autonom tiefgreifende politische Analysen in Maschinengeschwindigkeit. Jeder Artikel wird von KI-Agenten recherchiert, verfasst und lokalisiert, die mit Echtdaten des Europäischen Parlaments über den MCP-Server arbeiten.',
    featureAgents: '8 KI-Agenten',
    featureAgentsDesc: 'Nachrichten, Daten, Frontend, Qualität, Sicherheit, Dokumentation, DevOps, Produkt',
    featureLanguages: '14 Sprachen',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Mensch in der Schleife',
    featureHumanDesc: 'KI entwirft, Menschen prüfen und veröffentlichen',
    featureData: 'Echtzeit-Parlamentsdaten',
    featureDataDesc: 'Offene Daten des Europäischen Parlaments via MCP-Server',
  },
  fr: {
    heading: 'Intelligence parlementaire par IA',
    quote:
      "Surveillance en temps réel du Parlement européen par 8 agents IA autonomes fournissant des analyses politiques d'investigation en 14 langues.",
    description:
      "EU Parliament Monitor génère de manière autonome des analyses politiques approfondies à la vitesse machine. Chaque article est recherché, rédigé et localisé par des agents IA opérant sur les données en direct du Parlement européen via le serveur MCP.",
    featureAgents: '8 agents IA',
    featureAgentsDesc: 'Actualités, données, frontend, qualité, sécurité, documentation, DevOps, produit',
    featureLanguages: '14 langues',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: "Humain dans la boucle",
    featureHumanDesc: "L'IA rédige, les humains révisent et publient",
    featureData: 'Données parlementaires en direct',
    featureDataDesc: 'Données ouvertes du Parlement européen via serveur MCP',
  },
  es: {
    heading: 'Inteligencia parlamentaria impulsada por IA',
    quote:
      'Monitoreo en tiempo real del Parlamento Europeo impulsado por 8 agentes de IA autónomos que proporcionan inteligencia política investigativa en 14 idiomas.',
    description:
      'EU Parliament Monitor genera de forma autónoma análisis político profundo a velocidad de máquina. Cada artículo es investigado, escrito y localizado por agentes de IA que operan con datos en vivo del Parlamento Europeo a través del servidor MCP.',
    featureAgents: '8 agentes de IA',
    featureAgentsDesc: 'Noticias, datos, frontend, calidad, seguridad, documentación, DevOps, producto',
    featureLanguages: '14 idiomas',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Humano en el proceso',
    featureHumanDesc: 'La IA redacta, los humanos revisan y publican',
    featureData: 'Datos parlamentarios en vivo',
    featureDataDesc: 'Datos abiertos del Parlamento Europeo vía servidor MCP',
  },
  nl: {
    heading: 'AI-gestuurde parlementaire intelligence',
    quote:
      'Realtime monitoring van het Europees Parlement aangedreven door 8 autonome AI-agenten die onderzoeksjournalistieke politieke analyses leveren in 14 talen.',
    description:
      'EU Parliament Monitor genereert autonoom diepgaande politieke analyses op machinesnelheid. Elk artikel wordt onderzocht, geschreven en gelokaliseerd door AI-agenten die werken met live data van het Europees Parlement via de MCP-server.',
    featureAgents: '8 AI-agenten',
    featureAgentsDesc: 'Nieuws, data, frontend, kwaliteit, beveiliging, documentatie, DevOps, product',
    featureLanguages: '14 talen',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'Mens in de kring',
    featureHumanDesc: 'AI schrijft concepten, mensen beoordelen en publiceren',
    featureData: 'Live parlementaire data',
    featureDataDesc: 'Open data Europees Parlement via MCP-server',
  },
  ar: {
    heading: 'استخبارات برلمانية مدعومة بالذكاء الاصطناعي',
    quote:
      'مراقبة البرلمان الأوروبي في الوقت الفعلي بواسطة 8 وكلاء ذكاء اصطناعي مستقلين يقدمون تحليلات سياسية استقصائية بـ 14 لغة.',
    description:
      'يقوم EU Parliament Monitor بإنشاء تحليلات سياسية عميقة بشكل مستقل بسرعة الآلة. يتم البحث في كل مقال وكتابته وتوطينه بواسطة وكلاء الذكاء الاصطناعي العاملين على بيانات البرلمان الأوروبي المباشرة عبر خادم MCP.',
    featureAgents: '8 وكلاء ذكاء اصطناعي',
    featureAgentsDesc: 'أخبار، بيانات، واجهة أمامية، جودة، أمان، توثيق، DevOps، منتج',
    featureLanguages: '14 لغة',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'الإنسان في الحلقة',
    featureHumanDesc: 'الذكاء الاصطناعي يكتب المسودات، البشر يراجعون وينشرون',
    featureData: 'بيانات برلمانية مباشرة',
    featureDataDesc: 'البيانات المفتوحة للبرلمان الأوروبي عبر خادم MCP',
  },
  he: {
    heading: 'מודיעין פרלמנטרי מונע בינה מלאכותית',
    quote:
      'ניטור בזמן אמת של הפרלמנט האירופי באמצעות 8 סוכני בינה מלאכותית אוטונומיים המספקים ניתוח מודיעיני פוליטי חוקר ב-14 שפות.',
    description:
      'EU Parliament Monitor מייצר באופן אוטונומי ניתוח פוליטי מעמיק במהירות מכונה. כל מאמר נחקר, נכתב ומותאם על ידי סוכני AI הפועלים על נתונים חיים של הפרלמנט האירופי דרך שרת MCP.',
    featureAgents: '8 סוכני AI',
    featureAgentsDesc: 'חדשות, נתונים, ממשק, איכות, אבטחה, תיעוד, DevOps, מוצר',
    featureLanguages: '14 שפות',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'אדם בלולאה',
    featureHumanDesc: 'AI כותב טיוטות, בני אדם בודקים ומפרסמים',
    featureData: 'נתוני פרלמנט בזמן אמת',
    featureDataDesc: 'נתונים פתוחים של הפרלמנט האירופי דרך שרת MCP',
  },
  ja: {
    heading: 'AI駆動の議会インテリジェンス',
    quote:
      '8つの自律型AIエージェントによる欧州議会のリアルタイム監視。14言語で調査報道レベルの政治分析を提供します。',
    description:
      'EU Parliament Monitorは機械速度で深い政治分析を自律的に生成します。すべての記事はMCPサーバー経由で欧州議会のライブデータを使用するAIエージェントによって調査、執筆、ローカライズされます。',
    featureAgents: '8つのAIエージェント',
    featureAgentsDesc: 'ニュース、データ、フロントエンド、品質、セキュリティ、ドキュメント、DevOps、プロダクト',
    featureLanguages: '14言語対応',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: 'ヒューマン・イン・ザ・ループ',
    featureHumanDesc: 'AIが草稿を作成、人間がレビューして公開',
    featureData: 'リアルタイム議会データ',
    featureDataDesc: 'MCPサーバー経由の欧州議会オープンデータ',
  },
  ko: {
    heading: 'AI 기반 의회 인텔리전스',
    quote:
      '8개의 자율 AI 에이전트가 14개 언어로 탐사 보도 수준의 정치 분석을 제공하는 유럽 의회 실시간 모니터링.',
    description:
      'EU Parliament Monitor는 기계 속도로 심층 정치 분석을 자율적으로 생성합니다. 모든 기사는 MCP 서버를 통해 유럽 의회 실시간 데이터로 작동하는 AI 에이전트에 의해 조사, 작성 및 현지화됩니다.',
    featureAgents: '8개 AI 에이전트',
    featureAgentsDesc: '뉴스, 데이터, 프론트엔드, 품질, 보안, 문서, DevOps, 제품',
    featureLanguages: '14개 언어',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: '휴먼 인 더 루프',
    featureHumanDesc: 'AI가 초안을 작성하고, 사람이 검토 후 게시',
    featureData: '실시간 의회 데이터',
    featureDataDesc: 'MCP 서버를 통한 유럽 의회 오픈 데이터',
  },
  zh: {
    heading: 'AI驱动的议会情报',
    quote:
      '8个自主AI代理驱动的欧洲议会实时监控，以14种语言提供调查性政治分析。',
    description:
      'EU Parliament Monitor以机器速度自主生成深度政治分析。每篇文章均由通过MCP服务器使用欧洲议会实时数据的AI代理进行研究、撰写和本地化。',
    featureAgents: '8个AI代理',
    featureAgentsDesc: '新闻、数据、前端、质量、安全、文档、DevOps、产品',
    featureLanguages: '14种语言',
    featureLanguagesDesc: LANG_CODES_LIST,
    featureHuman: '人机协同',
    featureHumanDesc: 'AI起草，人工审核发布',
    featureData: '实时议会数据',
    featureDataDesc: '通过MCP服务器获取欧洲议会开放数据',
  },
};
