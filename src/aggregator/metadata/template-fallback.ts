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

// Re-export from the neutral-zone constants so existing consumers are unaffected.
export { SEO_CONTEXT_LABELS } from '../../constants/seo/context-labels.js';

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
