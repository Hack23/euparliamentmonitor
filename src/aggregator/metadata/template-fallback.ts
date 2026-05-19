// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/TemplateFallback
 * @description Last-resort template tier of the metadata resolver. When
 * no editorial highlight (translated brief, English brief, artefact H1,
 * aggregated H1, strong-prose lede) is available, the resolver falls
 * back to the localized `*_TITLES` generators from
 * `src/constants/language-articles.ts` to produce a per-language
 * `{title, subtitle}` pair parameterised by date / week / month /
 * committee. Extracted from `article-metadata.ts` so the template
 * dispatch lives next to its supporting localized labels and is
 * independently testable.
 */

import { ALL_LANGUAGES, getLocalizedString } from '../../constants/language-core.js';
import {
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  ELECTION_CYCLE_TITLES,
  MONTH_AHEAD_TITLES,
  MONTHLY_REVIEW_TITLES,
  MOTIONS_TITLES,
  PROPOSITIONS_TITLES,
  QUARTER_AHEAD_TITLES,
  QUARTER_IN_REVIEW_TITLES,
  TERM_OUTLOOK_TITLES,
  WEEK_AHEAD_TITLES,
  WEEKLY_REVIEW_TITLES,
  YEAR_AHEAD_TITLES,
  YEAR_IN_REVIEW_TITLES,
} from '../../constants/language-articles.js';
import type { LangTitleSubtitle, LanguageCode, LanguageMap } from '../../types/index.js';
import {
  deriveElectionCycleLabel,
  deriveMonthLabel,
  deriveQuarterLabel,
  deriveReportingWindowForWeekInReview,
  deriveTermLabel,
  deriveWeekRange,
  deriveYearLabel,
} from './date-labels.js';
import { humanizeSlug } from './slug.js';

/** Localized labels used to enrich short or duplicate-prone meta descriptions. */
export const SEO_CONTEXT_LABELS: LanguageMap<{
  readonly context: string;
  readonly date: string;
  readonly run: string;
  readonly evidence: string;
  readonly reader: string;
}> = {
  en: {
    context: 'Context',
    date: 'Published',
    run: 'analysis run',
    evidence: 'with source-linked voting, committee and legislative intelligence',
    reader: 'for democratic-accountability readers tracking EU institutional consequences',
  },
  sv: {
    context: 'Kontext',
    date: 'Publicerad',
    run: 'analyskörning',
    evidence: 'med källänkad röstnings-, utskotts- och lagstiftningsanalys',
    reader: 'för läsare som följer EU-institutionernas demokratiska konsekvenser',
  },
  da: {
    context: 'Kontekst',
    date: 'Udgivet',
    run: 'analysekørsel',
    evidence: 'med kildebelagt afstemnings-, udvalgs- og lovgivningsindblik',
    reader: 'for læsere, der følger EU-institutionernes demokratiske konsekvenser',
  },
  no: {
    context: 'Kontekst',
    date: 'Publisert',
    run: 'analysekjøring',
    evidence: 'med kildekoblet innsikt om avstemninger, komiteer og lovgivning',
    reader: 'for lesere som følger EU-institusjonenes demokratiske konsekvenser',
  },
  fi: {
    context: 'Konteksti',
    date: 'Julkaistu',
    run: 'analyysiajo',
    evidence: 'lähdelinkitetyllä äänestys-, valiokunta- ja lainsäädäntöanalyysillä',
    reader: 'lukijoille, jotka seuraavat EU-instituutioiden demokraattisia vaikutuksia',
  },
  de: {
    context: 'Kontext',
    date: 'Veröffentlicht',
    run: 'Analyselauf',
    evidence: 'mit quellengestützter Abstimmungs-, Ausschuss- und Gesetzgebungsanalyse',
    reader: 'für Leser, die demokratische Folgen der EU-Institutionen verfolgen',
  },
  fr: {
    context: 'Contexte',
    date: 'Publié',
    run: 'cycle d’analyse',
    evidence: 'avec analyse sourcée des votes, commissions et dossiers législatifs',
    reader: 'pour suivre les conséquences démocratiques des institutions de l’UE',
  },
  es: {
    context: 'Contexto',
    date: 'Publicado',
    run: 'ejecución de análisis',
    evidence: 'con inteligencia enlazada sobre votos, comisiones y legislación',
    reader: 'para lectores que siguen consecuencias democráticas de las instituciones de la UE',
  },
  nl: {
    context: 'Context',
    date: 'Gepubliceerd',
    run: 'analyserun',
    evidence: 'met brongekoppelde stem-, commissie- en wetgevingsanalyse',
    reader: 'voor lezers die democratische gevolgen van EU-instellingen volgen',
  },
  ar: {
    context: 'السياق',
    date: 'نُشر',
    run: 'تشغيل التحليل',
    evidence: 'مع تحليل موثق للتصويت واللجان والتشريع',
    reader: 'للقراء الذين يتابعون آثار مؤسسات الاتحاد الأوروبي على المساءلة الديمقراطية',
  },
  he: {
    context: 'הקשר',
    date: 'פורסם',
    run: 'הרצת ניתוח',
    evidence: 'עם מודיעין מקושר מקורות על הצבעות, ועדות וחקיקה',
    reader: 'לקוראים העוקבים אחר השלכות מוסדות האיחוד האירופי על אחריות דמוקרטית',
  },
  ja: {
    context: '文脈',
    date: '公開日',
    run: '分析実行',
    evidence: '投票、委員会、立法に関する出典付きインテリジェンス',
    reader: 'EU機関の民主的説明責任への影響を追跡する読者向け',
  },
  ko: {
    context: '맥락',
    date: '게시일',
    run: '분석 실행',
    evidence: '투표, 위원회, 입법에 대한 출처 연결 인텔리전스',
    reader: 'EU 기관의 민주적 책임 영향을 추적하는 독자를 위해',
  },
  zh: {
    context: '背景',
    date: '发布日期',
    run: '分析运行',
    evidence: '附来源链接的投票、委员会、立法程序、政治联盟和政策影响情报',
    reader: '面向跟踪欧盟机构民主问责、透明度和成员国政策后果的读者',
  },
};

/**
 * Build the per-language `{title, description}` pair using the
 * article-type–specific `*_TITLES` generator from
 * `src/constants/language-articles.ts`. This is the last-resort tier and
 * is always parameterised by date (or equivalent), so even when it fires
 * the result is not identical across runs of the same type.
 *
 * @param articleType - Article type slug
 * @param date - ISO run date
 * @param committee - Optional committee code (used by `committee-reports`)
 * @returns Per-language `LangTitleSubtitle`
 */
export function buildTemplateFallback(
  articleType: string,
  date: string,
  committee?: string
): LanguageMap<LangTitleSubtitle> {
  const map: Record<LanguageCode, LangTitleSubtitle> = Object.create(null) as Record<
    LanguageCode,
    LangTitleSubtitle
  >;
  const weekRange =
    articleType === 'week-in-review'
      ? deriveReportingWindowForWeekInReview(date)
      : deriveWeekRange(date);
  const monthLabel = deriveMonthLabel(date);
  const committeeLabel = committee && committee.trim().length > 0 ? committee : 'Main Committees';
  const quarterLabel = deriveQuarterLabel(date);
  const yearLabel = deriveYearLabel(date);
  const termLabel = deriveTermLabel(date);
  const cycleLabel = deriveElectionCycleLabel(date);

  for (const lang of ALL_LANGUAGES) {
    const entry = templateForType(lang, articleType, {
      date,
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      month: monthLabel,
      committee: committeeLabel,
      quarter: quarterLabel,
      year: yearLabel,
      term: termLabel,
      cycle: cycleLabel,
    });
    Object.defineProperty(map, lang, {
      value: entry,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return map;
}

/** Inputs for {@link templateForType}. */
interface TemplateInputs {
  readonly date: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly month: string;
  readonly committee: string;
  readonly quarter: string;
  readonly year: string;
  readonly term: string;
  readonly cycle: string;
}

/**
 * Dispatch an article-type slug to the matching localized template
 * generator. Unknown types get a uniform fallback built from
 * {@link humanizeSlug} and the run date.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param inputs - Pre-derived inputs used by the generators
 * @returns `LangTitleSubtitle` for the requested language
 */
function templateForType(
  lang: LanguageCode,
  articleType: string,
  inputs: TemplateInputs
): LangTitleSubtitle {
  switch (articleType) {
    case 'breaking':
    case 'breaking-breaking':
      return getLocalizedString(BREAKING_NEWS_TITLES, lang)(inputs.date);
    case 'committee-reports':
      return getLocalizedString(COMMITTEE_REPORTS_TITLES, lang)(inputs.committee);
    case 'motions':
      return getLocalizedString(MOTIONS_TITLES, lang)(inputs.date);
    case 'propositions':
      return getLocalizedString(PROPOSITIONS_TITLES, lang)();
    case 'week-ahead':
      return getLocalizedString(WEEK_AHEAD_TITLES, lang)(inputs.weekStart, inputs.weekEnd);
    case 'month-ahead':
      return getLocalizedString(MONTH_AHEAD_TITLES, lang)(inputs.month);
    case 'week-in-review':
      return getLocalizedString(WEEKLY_REVIEW_TITLES, lang)(inputs.weekStart, inputs.weekEnd);
    case 'month-in-review':
      return getLocalizedString(MONTHLY_REVIEW_TITLES, lang)(inputs.month);
    case 'quarter-ahead':
      return getLocalizedString(QUARTER_AHEAD_TITLES, lang)(inputs.quarter);
    case 'quarter-in-review':
      return getLocalizedString(QUARTER_IN_REVIEW_TITLES, lang)(inputs.quarter);
    case 'year-ahead':
      return getLocalizedString(YEAR_AHEAD_TITLES, lang)(inputs.year);
    case 'year-in-review':
      return getLocalizedString(YEAR_IN_REVIEW_TITLES, lang)(inputs.year);
    case 'term-outlook':
      return getLocalizedString(TERM_OUTLOOK_TITLES, lang)(inputs.term);
    case 'election-cycle':
      return getLocalizedString(ELECTION_CYCLE_TITLES, lang)(inputs.cycle);
    default:
      return {
        title: `${humanizeSlug(articleType)} — ${inputs.date}`,
        subtitle: `EU Parliament analysis — ${inputs.date}`,
      };
  }
}
