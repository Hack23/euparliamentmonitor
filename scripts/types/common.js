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
    /** Rolling 90-day (≈ one Strasbourg cycle plus mini-sessions) horizon */
    ArticleCategory["QUARTER_AHEAD"] = "quarter-ahead";
    ArticleCategory["YEAR_AHEAD"] = "year-ahead";
    // Retrospective — looking back
    ArticleCategory["WEEK_IN_REVIEW"] = "week-in-review";
    ArticleCategory["MONTH_IN_REVIEW"] = "month-in-review";
    /** Trailing 90-day quarter retrospective */
    ArticleCategory["QUARTER_IN_REVIEW"] = "quarter-in-review";
    ArticleCategory["YEAR_IN_REVIEW"] = "year-in-review";
    // Real-time
    ArticleCategory["BREAKING_NEWS"] = "breaking";
    // Domain-specific
    ArticleCategory["COMMITTEE_REPORTS"] = "committee-reports";
    ArticleCategory["MOTIONS"] = "motions";
    ArticleCategory["PROPOSITIONS"] = "propositions";
    // Electoral / multi-year horizon
    /** Mid-term to next-EP-election horizon (today → June 2029 for EP10) */
    ArticleCategory["TERM_OUTLOOK"] = "term-outlook";
    /** EP-election window ± 6 months — dual retrospective + forecast */
    ArticleCategory["ELECTION_CYCLE"] = "election-cycle";
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
    /** Multi-year electoral horizon: term outlook, election cycle */
    ArticlePerspective["ELECTORAL"] = "electoral";
})(ArticlePerspective || (ArticlePerspective = {}));
/**
 * Time period scope for periodic articles (look-ahead or in-review).
 */
export var TimePeriod;
(function (TimePeriod) {
    TimePeriod["WEEK"] = "week";
    TimePeriod["MONTH"] = "month";
    /** Rolling 90-day horizon — quarter / parliamentary cycle */
    TimePeriod["QUARTER"] = "quarter";
    TimePeriod["YEAR"] = "year";
    /** Multi-year electoral / term horizon */
    TimePeriod["TERM"] = "term";
    /** EP election cycle (5-year democratic cycle) */
    TimePeriod["ELECTION_CYCLE"] = "election-cycle";
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
    [ArticleCategory.QUARTER_AHEAD]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.YEAR_AHEAD]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.WEEK_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.MONTH_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.QUARTER_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.YEAR_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.BREAKING_NEWS]: ArticlePerspective.REAL_TIME,
    [ArticleCategory.COMMITTEE_REPORTS]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.MOTIONS]: ArticlePerspective.RETROSPECTIVE,
    [ArticleCategory.PROPOSITIONS]: ArticlePerspective.PROSPECTIVE,
    [ArticleCategory.TERM_OUTLOOK]: ArticlePerspective.ELECTORAL,
    [ArticleCategory.ELECTION_CYCLE]: ArticlePerspective.ELECTORAL,
    [ArticleCategory.DEEP_ANALYSIS]: ArticlePerspective.ANALYTICAL,
};
/** Mapping from periodic categories to their time period scope */
export const CATEGORY_TIME_PERIOD = {
    [ArticleCategory.WEEK_AHEAD]: TimePeriod.WEEK,
    [ArticleCategory.MONTH_AHEAD]: TimePeriod.MONTH,
    [ArticleCategory.QUARTER_AHEAD]: TimePeriod.QUARTER,
    [ArticleCategory.YEAR_AHEAD]: TimePeriod.YEAR,
    [ArticleCategory.WEEK_IN_REVIEW]: TimePeriod.WEEK,
    [ArticleCategory.MONTH_IN_REVIEW]: TimePeriod.MONTH,
    [ArticleCategory.QUARTER_IN_REVIEW]: TimePeriod.QUARTER,
    [ArticleCategory.YEAR_IN_REVIEW]: TimePeriod.YEAR,
    [ArticleCategory.TERM_OUTLOOK]: TimePeriod.TERM,
    [ArticleCategory.ELECTION_CYCLE]: TimePeriod.ELECTION_CYCLE,
};
//# sourceMappingURL=common.js.map