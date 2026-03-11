// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Common
 * @description Core shared types — language codes, article enums, and category mappings.
 * These foundational types are used across all bounded contexts.
 */

/** Supported language codes */
export type LanguageCode =
  | 'en'
  | 'sv'
  | 'da'
  | 'no'
  | 'fi'
  | 'de'
  | 'fr'
  | 'es'
  | 'nl'
  | 'ar'
  | 'he'
  | 'ja'
  | 'ko'
  | 'zh';

/** RTL language codes */
export type RTLLanguageCode = 'ar' | 'he';

/** All possible language codes (including RTL) */
export type AnyLanguageCode = LanguageCode;

/**
 * Article category — the primary classifier for content generation.
 * Each value represents a distinct article type with its own data pipeline,
 * template structure, and editorial voice.
 */
export enum ArticleCategory {
  // Prospective — looking ahead
  WEEK_AHEAD = 'week-ahead',
  MONTH_AHEAD = 'month-ahead',
  YEAR_AHEAD = 'year-ahead',

  // Retrospective — looking back
  WEEK_IN_REVIEW = 'week-in-review',
  MONTH_IN_REVIEW = 'month-in-review',
  YEAR_IN_REVIEW = 'year-in-review',

  // Real-time
  BREAKING_NEWS = 'breaking',

  // Domain-specific
  COMMITTEE_REPORTS = 'committee-reports',
  MOTIONS = 'motions',
  PROPOSITIONS = 'propositions',

  // Analytical
  DEEP_ANALYSIS = 'deep-analysis',
}

/**
 * Temporal perspective of an article — derived from its category.
 * Determines the editorial framing and verb tense.
 */
export enum ArticlePerspective {
  /** Forward-looking: previews, agendas, upcoming events */
  PROSPECTIVE = 'prospective',
  /** Backward-looking: reviews, summaries, retrospectives */
  RETROSPECTIVE = 'retrospective',
  /** Live/current: breaking news, urgent developments */
  REAL_TIME = 'real-time',
  /** Deep dive: multi-perspective analysis, root cause */
  ANALYTICAL = 'analytical',
}

/**
 * Time period scope for periodic articles (look-ahead or in-review).
 */
export enum TimePeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * Analysis perspective for "5 Whys" deep analysis articles.
 * Each perspective frames the same events through a different lens,
 * asking "why" iteratively to uncover root causes.
 */
export enum AnalysisPerspective {
  /** Party dynamics, power shifts, political strategy */
  POLITICAL = 'political',
  /** Budget impact, market effects, fiscal policy */
  ECONOMIC = 'economic',
  /** Citizen impact, public opinion, social equity */
  SOCIAL = 'social',
  /** Treaty basis, legal competence, compliance */
  LEGAL = 'legal',
  /** Climate, sustainability, green transition */
  ENVIRONMENTAL = 'environmental',
  /** EU external relations, global positioning */
  GEOPOLITICAL = 'geopolitical',
  /** EU institutional mechanics, inter-institutional balance */
  INSTITUTIONAL = 'institutional',
}

/** Mapping from ArticleCategory to its inherent ArticlePerspective */
export const CATEGORY_PERSPECTIVE: Record<ArticleCategory, ArticlePerspective> = {
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
export const CATEGORY_TIME_PERIOD: Partial<Record<ArticleCategory, TimePeriod>> = {
  [ArticleCategory.WEEK_AHEAD]: TimePeriod.WEEK,
  [ArticleCategory.MONTH_AHEAD]: TimePeriod.MONTH,
  [ArticleCategory.YEAR_AHEAD]: TimePeriod.YEAR,
  [ArticleCategory.WEEK_IN_REVIEW]: TimePeriod.WEEK,
  [ArticleCategory.MONTH_IN_REVIEW]: TimePeriod.MONTH,
  [ArticleCategory.YEAR_IN_REVIEW]: TimePeriod.YEAR,
};

/** Language preset names */
export type LanguagePreset = 'all' | 'eu-core' | 'nordic';

/** Map from language code to translated string */
export type LanguageMap<T = string> = Record<LanguageCode, T>;

/** Article category labels for a single language — one entry per ArticleCategory */
export type ArticleCategoryLabels = Record<ArticleCategory, string>;

/** Language-specific title and subtitle */
export interface LangTitleSubtitle {
  title: string;
  subtitle: string;
}

/** Localized strings for propositions articles */
export interface PropositionsStrings {
  lede: string;
  proposalsHeading: string;
  adoptedTextsHeading: string;
  pipelineHeading: string;
  procedureHeading: string;
  analysisHeading: string;
  analysis: string;
  pipelineHealthLabel: string;
  throughputRateLabel: string;
  whyThisMatters: string;
}

/** Localized editorial strings shared across article types */
export interface EditorialStrings {
  /** Heading for "Why This Matters" citizen-impact section */
  whyThisMatters: string;
  /** Heading for key analytical finding */
  keyTakeaway: string;
  /** Heading for parliamentary context section */
  parliamentaryContext: string;
  /** Source attribution phrase (e.g. "According to European Parliament records") */
  sourceAttribution: string;
  /** Analytical note label */
  analysisNote: string;
}

/** Localized section heading strings for motions articles */
export interface MotionsStrings {
  lede: string;
  votingRecordsHeading: string;
  partyCohesionHeading: string;
  anomaliesHeading: string;
  questionsHeading: string;
  dateLabel: string;
  resultLabel: string;
  forLabel: string;
  againstLabel: string;
  abstainLabel: string;
  cohesionLabel: string;
  participationLabel: string;
  severityLabel: string;
  statusLabel: string;
  keyTakeawayText: string;
  politicalAlignmentHeading: string;
  ledeAnalysis: string;
}

/** Localized section heading strings for week-ahead articles */
export interface WeekAheadStrings {
  lede: string;
  plenarySessions: string;
  committeeMeetings: string;
  legislativeDocuments: string;
  legislativePipeline: string;
  parliamentaryQuestions: string;
  noPlenary: string;
  bottleneckIndicator: string;
  whatToWatch: string;
}

/** Localized section heading strings for breaking news articles */
export interface BreakingStrings {
  breakingBanner: string;
  votingAnomalyIntel: string;
  coalitionDynamics: string;
  analyticalReport: string;
  keyMEPInfluence: string;
  intelligenceBriefing: string;
  votingAnomalyAlert: string;
  coalitionDynamicsSection: string;
  keyPlayers: string;
  placeholderNotice: string;
  placeholderLede: string;
  lede: string;
  /** Neutral feed-first lede used when analytical data is absent */
  feedLede: string;
  /** Section heading for recently adopted texts from EP feeds */
  adoptedTextsHeading: string;
  /** Section heading for recent EP events from feeds */
  recentEventsHeading: string;
  /** Section heading for legislative procedure updates from feeds */
  procedureUpdatesHeading: string;
  /** Section heading for MEP updates from feeds */
  mepUpdatesHeading: string;
  /** Label for the no-feed-data notice */
  noFeedDataNotice: string;
  /** Localized "as of" phrase used in lede section (e.g. "as of", "zum", "au") */
  asOf: string;
  /** Template function for "what happened" deep-analysis text */
  breakingWhatFn: (
    date: string,
    adopted: number,
    events: number,
    procedures: number,
    meps: number
  ) => string;
  /** "Why it matters" text when voting anomalies are present */
  breakingWhyAnomalies: string;
  /** "Why it matters" text for normal parliamentary activity */
  breakingWhyNormal: string;
  /** Localized name for the legislative majority stakeholder */
  breakingWinnerActor: string;
  /** Template function for winner stakeholder reason */
  breakingWinnerReasonFn: (count: number) => string;
  /** Localized name for the opposition groups stakeholder */
  breakingNeutralActor: string;
  /** Neutral stakeholder reason text */
  breakingNeutralReason: string;
  /** Template function for active-legislative-phase outlook */
  breakingOutlookActiveFn: (date: string) => string;
  /** Template function for transitional-period outlook */
  breakingOutlookTransitionalFn: (date: string) => string;
  /** Consequence text for adopted texts ("New legal obligations…") */
  breakingLegalObligationsConsequence: string;
  /** Consequence text for procedure updates ("Legislative trajectory altered…") */
  breakingProcedureConsequence: string;
  /** Political impact text when voting anomalies are present */
  breakingImpactPoliticalAnomalies: string;
  /** Template function for political impact text in normal activity */
  breakingImpactPoliticalNormalFn: (count: number) => string;
  /** Economic impact text */
  breakingImpactEconomic: string;
  /** Social impact text */
  breakingImpactSocial: string;
  /** Template function for legal impact text */
  breakingImpactLegalFn: (count: number) => string;
  /** Geopolitical impact text when coalition data available */
  breakingImpactGeopoliticalCoalition: string;
  /** Geopolitical impact text for normal activity */
  breakingImpactGeopoliticalNormal: string;
  /** "Political group whips" mistake actor name */
  breakingMistakeActor: string;
  /** Mistake description text */
  breakingMistakeDescription: string;
  /** Mistake alternative text */
  breakingMistakeAlternative: string;
  /** Localized prefix for adopted text items in the "Who" list (e.g. "Adopted:", "Angenommen:") */
  breakingAdoptedPrefix: string;
  /** Localized prefix for MEP items in the "Who" list (e.g. "MEP:", "MdEP:") */
  breakingMEPPrefix: string;
  /** User-friendly fallback shown when voting anomaly data is unavailable */
  anomalyUnavailable: string;
  /** User-friendly fallback shown when coalition dynamics data is unavailable */
  coalitionUnavailable: string;
  /** Human-readable localized label for the adopted-text type (replaces raw "[TEXT_ADOPTED]" token) */
  adoptedTextTypeLabel: string;
  /** Template to format an adopted-text item title from its label/identifier (e.g. "T10-0315/2025") */
  adoptedTextItemLabelFn: (label: string) => string;
  /** Template to show truncation note: "Showing {shown} of {total}" */
  showingXofNFn: (shown: number, total: number) => string;
}

// ─── Deep Analysis types ───────────────────────────────────────────────────

/**
 * Single consequence resulting from a parliamentary action.
 * Maps an action to its downstream political, economic, or social effects.
 */
export interface ActionConsequence {
  /** The parliamentary action taken */
  readonly action: string;
  /** The resulting consequence or ripple effect */
  readonly consequence: string;
  /** How significant is this consequence: low, medium, high, critical */
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Political stakeholder assessment: winners, losers, and their reasons.
 */
export interface StakeholderOutcome {
  /** Name of stakeholder, political group, institution, or member state */
  readonly actor: string;
  /** Whether this actor benefits or is disadvantaged */
  readonly outcome: 'winner' | 'loser' | 'neutral';
  /** Explanation of why */
  readonly reason: string;
}

/**
 * A single identified mistake, miscalculation, or missed opportunity
 * in parliamentary proceedings.
 */
export interface PoliticalMistake {
  /** Who made the mistake */
  readonly actor: string;
  /** What the mistake or miscalculation was */
  readonly description: string;
  /** What they should have done differently */
  readonly alternative: string;
}

/**
 * Comprehensive deep political analysis using the "5W + Impact" framework.
 * Every article type populates this from its available data to provide
 * parliament-intelligence-grade analysis for sophisticated readers.
 *
 * Fields map to the framework:
 * - **What**: What happened / what is proposed
 * - **Who**: Key actors, political groups, rapporteurs, shadows
 * - **When**: Timeline, deadlines, key dates
 * - **Why**: Root causes, political motivations, strategic calculations
 * - **Winners/Losers**: Who benefits, who loses, stakeholder impact
 * - **Impact**: Multi-perspective consequences (political, economic, social, legal)
 * - **Actions → Consequences**: Causal chains from decisions to outcomes
 * - **Mistakes**: Miscalculations, missed opportunities
 * - **Outlook**: What happens next, strategic implications
 */
export interface DeepAnalysis {
  /** WHAT: Core subject — what happened or is being proposed */
  readonly what: string;
  /** WHO: Key actors — political groups, rapporteurs, MEPs, institutions */
  readonly who: readonly string[];
  /** WHEN: Key dates — timeline, deadlines, procedural milestones */
  readonly when: readonly string[];
  /** WHY: Root causes — political motivations, strategic calculations */
  readonly why: string;
  /** WINNERS & LOSERS: Stakeholder impact assessment */
  readonly stakeholderOutcomes: readonly StakeholderOutcome[];
  /** IMPACT: Multi-perspective analysis of consequences */
  readonly impactAssessment: {
    readonly political: string;
    readonly economic: string;
    readonly social: string;
    readonly legal: string;
    readonly geopolitical: string;
  };
  /** ACTIONS → CONSEQUENCES: Causal chains */
  readonly actionConsequences: readonly ActionConsequence[];
  /** MISTAKES: Miscalculations and missed opportunities */
  readonly mistakes: readonly PoliticalMistake[];
  /** OUTLOOK: What happens next — strategic forward look */
  readonly outlook: string;
}

/** Localized strings for deep analysis section headings */
export interface DeepAnalysisStrings {
  /** Main section heading */
  readonly sectionHeading: string;
  /** Sub-heading for "What" */
  readonly whatHeading: string;
  /** Sub-heading for "Who" */
  readonly whoHeading: string;
  /** Sub-heading for "When" */
  readonly whenHeading: string;
  /** Sub-heading for "Why" */
  readonly whyHeading: string;
  /** Sub-heading for Winners & Losers */
  readonly stakeholderHeading: string;
  /** Label for winner outcome */
  readonly winnerLabel: string;
  /** Label for loser outcome */
  readonly loserLabel: string;
  /** Label for neutral outcome */
  readonly neutralLabel: string;
  /** Sub-heading for impact assessment */
  readonly impactHeading: string;
  /** Impact perspective labels */
  readonly politicalLabel: string;
  readonly economicLabel: string;
  readonly socialLabel: string;
  readonly legalLabel: string;
  readonly geopoliticalLabel: string;
  /** Sub-heading for actions → consequences */
  readonly consequencesHeading: string;
  /** Label for action column */
  readonly actionLabel: string;
  /** Label for consequence column */
  readonly consequenceLabel: string;
  /** Label for severity column header */
  readonly severityColumnLabel: string;
  /** Sub-heading for mistakes */
  readonly mistakesHeading: string;
  /** Label for "should have" alternative */
  readonly alternativeLabel: string;
  /** Sub-heading for outlook */
  readonly outlookHeading: string;
  /** Severity labels */
  readonly severityLow: string;
  readonly severityMedium: string;
  readonly severityHigh: string;
  readonly severityCritical: string;
}

/** Localized content strings for the committee analysis deep analysis body text */
export interface CommitteeAnalysisContentStrings {
  /** Template: what happened. {date}, {total}, {docs}, {active} placeholders */
  readonly what: string;
  /** Template: what happened when no documents are available. {date}, {total} placeholders */
  readonly whatNoData: string;
  /** "Reporting date:" label prefix */
  readonly reportDateLabel: string;
  /** "members" label */
  readonly membersLabel: string;
  /** "Chair:" label */
  readonly chairLabel: string;
  /** "robust" productivity descriptor */
  readonly productivityRobust: string;
  /** "moderate" productivity descriptor */
  readonly productivityModerate: string;
  /** "low" productivity descriptor used when 0% of committees have recent documents */
  readonly productivityLow: string;
  /** Why section text. {pct}, {descriptor} placeholders */
  readonly why: string;
  /** Impact political text when no committees are active. */
  readonly impactPoliticalNone: string;
  /** Stakeholder reason: highly productive. {n} placeholder */
  readonly stakeholderHighlyProductive: string;
  /** Stakeholder reason: moderate activity. {n} placeholder */
  readonly stakeholderModerateActivity: string;
  /** Stakeholder reason: no documents */
  readonly stakeholderNoDocs: string;
  /** Impact political text. {active}, {total} placeholders */
  readonly impactPolitical: string;
  /** Impact economic text */
  readonly impactEconomic: string;
  /** Impact social text */
  readonly impactSocial: string;
  /** Impact legal text. {docs} placeholder */
  readonly impactLegal: string;
  /** Impact geopolitical text */
  readonly impactGeopolitical: string;
  /** Action label. {abbr}, {n} placeholders */
  readonly actionProcessed: string;
  /** Consequence text */
  readonly actionConsequence: string;
  /** Mistake description */
  readonly mistakeDescription: string;
  /** Mistake alternative */
  readonly mistakeAlternative: string;
  /** Outlook when pipeline is healthy. {n}, {total} placeholders */
  readonly outlookGood: string;
  /** Outlook when pipeline has concerns */
  readonly outlookConcern: string;
  /** Lede paragraph for the committee-reports article overview */
  readonly lede: string;
  /** "No recent documents available" fallback list item */
  readonly noRecentDocs: string;
  /** Notice shown in committee cards when all committee metadata is unavailable from the EP API */
  readonly committeeMetadataUnavailable: string;
  /** Section heading for the adopted texts overview in feed-enriched articles */
  readonly adoptedTextsSectionHeading: string;
  /** Summary paragraph for adopted texts section (plural). {count} placeholder is replaced with the number of texts */
  readonly adoptedTextsSummary: string;
  /** Summary paragraph for adopted texts section when exactly one text was adopted (singular form) */
  readonly adoptedTextsSummarySingular: string;
  /** Full name of the ENVI committee */
  readonly committeeNameENVI: string;
  /** Full name of the ECON committee */
  readonly committeeNameECON: string;
  /** Full name of the AFET committee */
  readonly committeeNameAFET: string;
  /** Full name of the LIBE committee */
  readonly committeeNameLIBE: string;
  /** Full name of the AGRI committee */
  readonly committeeNameAGRI: string;
  /** Label for texts not fitting the named committee themes */
  readonly committeeNameOTHER: string;
}
