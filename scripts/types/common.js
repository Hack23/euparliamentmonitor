// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Article category — the primary classifier for content generation.
 * Each value represents a distinct article type with its own data pipeline,
 * template structure, and editorial voice.
 */
export var ArticleCategory;
(function (ArticleCategory) {
    // Prospective — looking ahead
    ArticleCategory["WEEK_AHEAD"] = "week-ahead";
    ArticleCategory["MONTH_AHEAD"] = "month-ahead";
    ArticleCategory["YEAR_AHEAD"] = "year-ahead";
    // Retrospective — looking back
    ArticleCategory["WEEK_IN_REVIEW"] = "week-in-review";
    ArticleCategory["MONTH_IN_REVIEW"] = "month-in-review";
    ArticleCategory["YEAR_IN_REVIEW"] = "year-in-review";
    // Real-time
    ArticleCategory["BREAKING_NEWS"] = "breaking";
    // Domain-specific
    ArticleCategory["COMMITTEE_REPORTS"] = "committee-reports";
    ArticleCategory["MOTIONS"] = "motions";
    ArticleCategory["PROPOSITIONS"] = "propositions";
    // Analytical
    ArticleCategory["DEEP_ANALYSIS"] = "deep-analysis";
})(ArticleCategory || (ArticleCategory = {}));
/**
 * Temporal perspective of an article — derived from its category.
 * Determines the editorial framing and verb tense.
 */
export var ArticlePerspective;
(function (ArticlePerspective) {
    /** Forward-looking: previews, agendas, upcoming events */
    ArticlePerspective["PROSPECTIVE"] = "prospective";
    /** Backward-looking: reviews, summaries, retrospectives */
    ArticlePerspective["RETROSPECTIVE"] = "retrospective";
    /** Live/current: breaking news, urgent developments */
    ArticlePerspective["REAL_TIME"] = "real-time";
    /** Deep dive: multi-perspective analysis, root cause */
    ArticlePerspective["ANALYTICAL"] = "analytical";
})(ArticlePerspective || (ArticlePerspective = {}));
/**
 * Time period scope for periodic articles (look-ahead or in-review).
 */
export var TimePeriod;
(function (TimePeriod) {
    TimePeriod["WEEK"] = "week";
    TimePeriod["MONTH"] = "month";
    TimePeriod["YEAR"] = "year";
})(TimePeriod || (TimePeriod = {}));
/**
 * Analysis perspective for "5 Whys" deep analysis articles.
 * Each perspective frames the same events through a different lens,
 * asking "why" iteratively to uncover root causes.
 */
export var AnalysisPerspective;
(function (AnalysisPerspective) {
    /** Party dynamics, power shifts, political strategy */
    AnalysisPerspective["POLITICAL"] = "political";
    /** Budget impact, market effects, fiscal policy */
    AnalysisPerspective["ECONOMIC"] = "economic";
    /** Citizen impact, public opinion, social equity */
    AnalysisPerspective["SOCIAL"] = "social";
    /** Treaty basis, legal competence, compliance */
    AnalysisPerspective["LEGAL"] = "legal";
    /** Climate, sustainability, green transition */
    AnalysisPerspective["ENVIRONMENTAL"] = "environmental";
    /** EU external relations, global positioning */
    AnalysisPerspective["GEOPOLITICAL"] = "geopolitical";
    /** EU institutional mechanics, inter-institutional balance */
    AnalysisPerspective["INSTITUTIONAL"] = "institutional";
})(AnalysisPerspective || (AnalysisPerspective = {}));
/** Mapping from ArticleCategory to its inherent ArticlePerspective */
export const CATEGORY_PERSPECTIVE = {
    [ArticleCategory.WEEK_AHEAD]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.MONTH_AHEAD]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.YEAR_AHEAD]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.WEEK_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.MONTH_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.YEAR_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.BREAKING_NEWS]: ArticlePerspective.REAL_TIME,
    [ArticleCategory.COMMITTEE_REPORTS]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.MOTIONS]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.PROPOSITIONS]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.DEEP_ANALYSIS]: ArticlePerspective.ANALYTICAL,
};
/** Mapping from periodic categories to their time period scope */
export const CATEGORY_TIME_PERIOD = {
    [ArticleCategory.WEEK_AHEAD]: TimePeriod.WEEK,
    [ArticleCategory.MONTH_AHEAD]: TimePeriod.MONTH,
    [ArticleCategory.YEAR_AHEAD]: TimePeriod.YEAR,
    [ArticleCategory.WEEK_IN_REVIEW]: TimePeriod.WEEK,
    [ArticleCategory.MONTH_IN_REVIEW]: TimePeriod.MONTH,
    [ArticleCategory.YEAR_IN_REVIEW]: TimePeriod.YEAR,
};
//# sourceMappingURL=common.js.map