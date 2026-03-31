// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module euparliamentmonitor
 * @description European Parliament Intelligence Platform — npm package entry point.
 *
 * This barrel re-exports the full library surface of the EU Parliament
 * Monitor so that other projects can consume types, MCP clients, analysis
 * utilities, templates, generators, strategies, and language constants
 * without duplicating code.
 *
 * @example
 * ```ts
 * import {
 *   EuropeanParliamentMCPClient,
 *   getEPMCPClient,
 *   ALL_LANGUAGES,
 *   scoreVotingAnomaly,
 *   generateArticleHTML,
 *   BreakingNewsStrategy,
 *   buildBreakingNewsContent,
 * } from 'euparliamentmonitor';
 * ```
 *
 * @see {@link https://github.com/Hack23/euparliamentmonitor | GitHub Repository}
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md | Secure Development Policy}
 * @see {@link https://github.com/Hack23/euparliamentmonitor/blob/main/ARCHITECTURE.md | Architecture}
 * @see {@link https://github.com/Hack23/euparliamentmonitor/blob/main/SECURITY_ARCHITECTURE.md | Security Architecture}
 */

// ─── Types ───────────────────────────────────────────────────────────────────
export * from './types/index.js';

// ─── MCP Clients ─────────────────────────────────────────────────────────────
export {
  MCPConnection,
  MCPSessionExpiredError,
  MCPRateLimitError,
  isRetriableError,
  formatRetryAfter,
  parseSSEResponse,
} from './mcp/mcp-connection.js';

export {
  EuropeanParliamentMCPClient,
  getEPMCPClient,
  closeEPMCPClient,
} from './mcp/ep-mcp-client.js';

export { WorldBankMCPClient, getWBMCPClient, closeWBMCPClient } from './mcp/wb-mcp-client.js';

export {
  type CircuitState,
  type CircuitBreakerOptions,
  CircuitBreaker,
  type MCPRetryPolicy,
  withRetry,
} from './mcp/mcp-retry.js';

export { type ToolHealthEntry, type HealthSnapshot, MCPHealthMonitor } from './mcp/mcp-health.js';

// ─── Intelligence Analysis ───────────────────────────────────────────────────
export {
  scoreVotingAnomaly,
  analyzeCoalitionCohesion,
  scoreMEPInfluence,
  calculateLegislativeVelocity,
  rankBySignificance,
  buildIntelligenceSection,
  buildDefaultStakeholderPerspectives,
  scoreStakeholderInfluence,
  buildStakeholderOutcomeMatrix,
  rankStakeholdersByInfluence,
  computeVotingIntensity,
  detectCoalitionShifts,
  computePolarizationIndex,
  detectVotingTrends,
  computeCrossSessionCoalitionStability,
  rankMEPInfluenceByTopic,
  buildLegislativeVelocityReport,
} from './utils/intelligence-analysis.js';

// ─── Intelligence Index ──────────────────────────────────────────────────────
export {
  createEmptyIndex,
  addArticleToIndex,
  buildIndexFromEntries,
  findRelatedArticles,
  generateCrossReferences,
  detectTrends,
  findOrCreateSeries,
  buildRelatedArticlesHTML,
} from './utils/intelligence-index.js';

// ─── Article Quality ─────────────────────────────────────────────────────────
export {
  assessAnalysisDepth,
  assessStakeholderCoverage,
  assessVisualizationQuality,
  calculateOverallScore,
  generateRecommendations,
  scoreArticleQuality,
} from './utils/article-quality-scorer.js';

// ─── Content Validation ──────────────────────────────────────────────────────
export {
  validateArticleContent,
  validateTranslationCompleteness,
} from './utils/content-validator.js';

// ─── Content Metadata ────────────────────────────────────────────────────────
export { enrichMetadataFromContent } from './utils/content-metadata.js';

// ─── News Metadata ───────────────────────────────────────────────────────────
export {
  buildMetadataDatabase,
  writeMetadataDatabase,
  readMetadataDatabase,
  updateMetadataDatabase,
  updateIntelligenceIndex,
} from './utils/news-metadata.js';

// ─── Metadata Utilities ──────────────────────────────────────────────────────
export { pl } from './utils/metadata-utils.js';

// ─── Political Threat Assessment ─────────────────────────────────────────────
export {
  assessPoliticalThreats,
  buildActorThreatProfiles,
  buildConsequenceTree,
  analyzeLegislativeDisruption,
  generateThreatAssessmentMarkdown,
  ALL_THREAT_LANDSCAPE_DIMENSIONS,
  ALL_POLITICAL_STRIDE_CATEGORIES,
} from './utils/political-threat-assessment.js';

// ─── HTML Utilities ──────────────────────────────────────────────────────────
export { stripScriptBlocks } from './utils/html-sanitize.js';

export {
  parseArticleFilename,
  formatSlug,
  calculateReadTime,
  escapeHTML,
  isSafeURL,
  validateArticleHTML,
  type ArticleValidationResult,
} from './utils/file-utils.js';

// ─── Article Category Detection ──────────────────────────────────────────────
export { detectCategory } from './utils/article-category.js';

// ─── World Bank Data Utilities ───────────────────────────────────────────────
export {
  EU_COUNTRY_CODES,
  EU_AGGREGATE_CODE,
  POLICY_INDICATORS,
  parseWorldBankCSV,
  formatIndicatorValue,
  getMostRecentValue,
  buildEconomicContext,
  getWorldBankCountryCode,
  isEUMemberState,
  buildEconomicContextHTML,
} from './utils/world-bank-data.js';

// ─── Templates ───────────────────────────────────────────────────────────────
export { generateArticleHTML } from './templates/article-template.js';

export {
  computeArticleQualityScore,
  buildTableOfContents,
  buildQualityScoreBadge,
} from './templates/section-builders.js';

// ─── Constants & Languages ───────────────────────────────────────────────────
export {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  getLocalizedString,
  isSupportedLanguage,
  getTextDirection,
} from './constants/language-core.js';

export {
  WB_INDICATORS,
  type WBIndicatorId,
  type IndicatorMapping,
  type CommitteeIndicatorEntry,
  COMMITTEE_INDICATOR_MAP,
  type CategoryIndicatorEntry,
  CATEGORY_INDICATOR_MAP,
  getCommitteeIndicators,
  getCommitteePrimaryIndicators,
  getCategoryIndicators,
  getIndicatorIdsForCommittees,
  getAllCategoryIndicatorIds,
} from './constants/committee-indicator-map.js';

// ─── Configuration Constants ─────────────────────────────────────────────────
export {
  PROJECT_ROOT,
  NEWS_DIR,
  METADATA_DIR,
  BASE_URL,
  ARTICLE_FILENAME_PATTERN,
  WORDS_PER_MINUTE,
  VALID_ARTICLE_CATEGORIES,
  ARTICLE_TYPE_WEEK_AHEAD,
  ARTICLE_TYPE_BREAKING,
  ARTICLE_TYPE_COMMITTEE_REPORTS,
  ARTICLE_TYPE_PROPOSITIONS,
  ARTICLE_TYPE_MOTIONS,
  ARTICLE_TYPE_MONTH_AHEAD,
  ARTICLE_TYPE_WEEK_IN_REVIEW,
  ARTICLE_TYPE_MONTH_IN_REVIEW,
  ARG_SEPARATOR,
  APP_VERSION,
  createThemeToggleButton,
  THEME_TOGGLE_SCRIPT_CONTENT,
  THEME_TOGGLE_SCRIPT,
} from './constants/config.js';

// ─── Analysis Constants ──────────────────────────────────────────────────────
export { AI_MARKER } from './constants/analysis-constants.js';

// ─── Language UI Strings ─────────────────────────────────────────────────────
export {
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  SECTION_HEADINGS,
  NO_ARTICLES_MESSAGES,
  SKIP_LINK_TEXTS,
  ARTICLE_TYPE_LABELS,
  READ_TIME_LABELS,
  BACK_TO_NEWS_LABELS,
  ARTICLE_NAV_LABELS,
  AI_SECTION_CONTENT,
  FILTER_LABELS,
  SOURCES_HEADING_LABELS,
  HEADER_SUBTITLE_LABELS,
  THEME_TOGGLE_LABELS,
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  TOC_ARIA_LABELS,
  RELATED_ANALYSIS_LABELS,
  type AISection,
  type RelationshipLabels,
  type RelatedAnalysisStrings,
} from './constants/language-ui.js';

// ─── Language Article Strings ────────────────────────────────────────────────
export {
  LOCALIZED_KEYWORDS,
  WEEK_AHEAD_TITLES,
  MONTH_AHEAD_TITLES,
  WEEKLY_REVIEW_TITLES,
  MONTHLY_REVIEW_TITLES,
  MOTIONS_TITLES,
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  PROPOSITIONS_TITLES,
  PROPOSITIONS_STRINGS,
  EDITORIAL_STRINGS,
  DEEP_ANALYSIS_STRINGS,
  MOTIONS_STRINGS,
  WEEK_AHEAD_STRINGS,
  WEEK_AHEAD_STAKEHOLDER_STRINGS,
  BREAKING_STRINGS,
  COMMITTEE_ANALYSIS_CONTENT_STRINGS,
  SWOT_STRINGS,
  DASHBOARD_STRINGS,
  SWOT_BUILDER_STRINGS,
  DASHBOARD_BUILDER_STRINGS,
  MULTI_DIMENSIONAL_SWOT_STRINGS,
  MONTH_IN_REVIEW_STRINGS,
  ANALYSIS_QUALITY_LABELS,
} from './constants/language-articles.js';

// ─── Political Risk Assessment ───────────────────────────────────────────────
export {
  calculatePoliticalRiskScore,
  assessPoliticalCapitalAtRisk,
  buildQuantitativeSWOT,
  assessLegislativeVelocityRisk,
  runAgentRiskAssessment,
  generateRiskAssessmentMarkdown,
  generatePoliticalRiskSummary,
  createScoredSWOTItem,
  createScoredOpportunityOrThreat,
  createRiskDriver,
} from './utils/political-risk-assessment.js';

// ─── Analysis Pipeline Stages ─────────────────────────────────────────────────
export {
  ALL_ANALYSIS_METHODS,
  VALID_ANALYSIS_METHODS,
  runAnalysisStage,
} from './generators/pipeline/analysis-stage.js';

export type {
  AnalysisMethod,
  AnalysisStageOptions,
  AnalysisMethodStatus,
  AnalysisManifest,
  AnalysisContext,
} from './generators/pipeline/analysis-stage.js';

export {
  mcpCircuitBreaker,
  computeRollingDateRange,
  initializeMCPClient,
  loadFeedDataFromFile,
  loadEPFeedDataFromFile,
  fetchWeekAheadData,
  fetchVotingAnomalies,
  fetchCoalitionDynamics,
  fetchVotingReport,
  fetchMEPInfluence,
  loadCommitteeDataFromFile,
  fetchCommitteeInfoFromEPAPI,
  fetchCommitteeData,
  fetchVotingRecords,
  fetchVotingPatterns,
  fetchMotionsAnomalies,
  fetchParliamentaryQuestionsForMotions,
  fetchMotionsData,
  fetchProposalsFromMCP,
  fetchPipelineFromMCP,
  fetchProcedureStatusFromMCP,
  fetchAdoptedTextsFeed,
  fetchEventsFeed,
  fetchProceduresFeed,
  fetchMEPsFeed,
  fetchMEPsFeedWithTotal,
  fetchDocumentsFeed,
  fetchPlenaryDocumentsFeed,
  fetchCommitteeDocumentsFeed,
  fetchPlenarySessionDocumentsFeed,
  fetchExternalDocumentsFeed,
  fetchQuestionsFeed,
  fetchDeclarationsFeed,
  fetchCorporateBodiesFeed,
  fetchBreakingNewsFeedData,
  fetchEPFeedData,
} from './generators/pipeline/fetch-stage.js';

export {
  type ValidationResult,
  validateMCPResponse,
  normalizeISO8601Date,
  sanitizeText,
  isValidCountryCode,
  isValidLanguageCode,
} from './generators/pipeline/transform-stage.js';

export {
  type StrategyRegistry,
  createStrategyRegistry,
  generateArticleForStrategy,
} from './generators/pipeline/generate-stage.js';

export {
  type OutputOptions,
  writeArticleFile,
  writeSingleArticle,
  writeGenerationMetadata,
} from './generators/pipeline/output-stage.js';

// ─── Article Strategies ──────────────────────────────────────────────────────
export type {
  ArticleData,
  ArticleMetadata,
  ArticleStrategyBase,
  ArticleStrategy,
} from './generators/strategies/article-strategy.js';

export {
  type BreakingNewsArticleData,
  BreakingNewsStrategy,
  breakingNewsStrategy,
} from './generators/strategies/breaking-news-strategy.js';

export {
  type CommitteeReportsArticleData,
  type CommitteeTheme,
  AFET_KEYWORDS,
  LIBE_KEYWORDS,
  AGRI_KEYWORDS,
  ENVI_KEYWORDS,
  ECON_KEYWORDS,
  categorizeAdoptedText,
  CommitteeReportsStrategy,
  committeeReportsStrategy,
} from './generators/strategies/committee-reports-strategy.js';

export {
  type MonthAheadArticleData,
  MonthAheadStrategy,
  monthAheadStrategy,
} from './generators/strategies/month-ahead-strategy.js';

export {
  type MonthlyReviewArticleData,
  MonthlyReviewStrategy,
  monthlyReviewStrategy,
} from './generators/strategies/monthly-review-strategy.js';

export {
  type MotionsArticleData,
  MotionsStrategy,
  motionsStrategy,
} from './generators/strategies/motions-strategy.js';

export {
  type PropositionsArticleData,
  PropositionsStrategy,
  propositionsStrategy,
} from './generators/strategies/propositions-strategy.js';

export {
  type WeekAheadArticleData,
  WeekAheadStrategy,
  weekAheadStrategy,
} from './generators/strategies/week-ahead-strategy.js';

export {
  type WeeklyReviewArticleData,
  WeeklyReviewStrategy,
  weeklyReviewStrategy,
} from './generators/strategies/weekly-review-strategy.js';

// ─── Content Generators ──────────────────────────────────────────────────────
export {
  buildVotingAnalysis,
  buildProspectiveAnalysis,
  buildBreakingAnalysis,
  buildPropositionsAnalysis,
  buildCommitteeAnalysis,
  buildVotingSwot,
  buildProspectiveSwot,
  buildBreakingSwot,
  buildPropositionsSwot,
  buildCommitteeSwot,
  buildVotingDashboard,
  buildProspectiveDashboard,
  buildBreakingDashboard,
  buildPropositionsDashboard,
  buildCommitteeDashboard,
  buildVotingMindmap,
  buildProspectiveMindmap,
  buildBreakingMindmap,
  buildPropositionsMindmap,
  buildCommitteeMindmap,
  buildVotingMultiDimensionalSwot,
  buildProspectiveMultiDimensionalSwot,
  buildBreakingMultiDimensionalSwot,
  buildPropositionsMultiDimensionalSwot,
  buildCommitteeMultiDimensionalSwot,
} from './generators/analysis-builders.js';

export {
  SIGNIFICANCE_THRESHOLD,
  scoreBreakingNewsSignificance,
  buildBreakingNewsContent,
} from './generators/breaking-content.js';

export {
  FEATURED_COMMITTEES,
  PLACEHOLDER_CHAIR,
  PLACEHOLDER_MEMBERS,
  applyCommitteeInfo,
  applyDocuments,
  isPlaceholderCommitteeData,
  applyEffectiveness,
} from './generators/committee-helpers.js';

export {
  buildCoalitionPanel,
  buildPipelinePanel,
  buildTrendPanel,
  buildStakeholderScorecardPanel,
  buildDashboardSection,
  dashboardHasCharts,
  buildEconomicContextPanel,
} from './generators/dashboard-content.js';

export { buildDeepAnalysisSection } from './generators/deep-analysis-content.js';

export {
  type MindmapBranch,
  type MindmapConfig,
  buildMindmapSection,
  buildIntelligenceMindmapSection,
} from './generators/mindmap-content.js';

export {
  PLACEHOLDER_MARKER,
  getMotionsFallbackData,
  generateMotionsContent,
  buildPoliticalAlignmentSection,
  buildAdoptedTextsSection,
} from './generators/motions-content.js';

export {
  type SankeyNodeColor,
  type SankeyNode,
  type SankeyFlow,
  type SankeyConfig,
  buildSankeySection,
} from './generators/sankey-content.js';

export {
  buildSwotSection,
  buildMultiDimensionalSwotSection,
} from './generators/swot-content.js';

export {
  PLACEHOLDER_EVENTS,
  parsePlenarySessions,
  parseEPEvents,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  parseParliamentaryQuestions,
  computeWeekPoliticalTemperature,
  buildStakeholderImpactMatrix,
  buildWeekAheadContent,
  buildKeywords,
  buildWhatToWatchSection,
} from './generators/week-ahead-content.js';

export {
  type PipelineData,
  buildPropositionsContent,
} from './generators/propositions-content.js';

// ─── Index & Sitemap Generators ──────────────────────────────────────────────
export {
  getIndexFilename,
  generateIndexHTML,
} from './generators/news-indexes.js';

export {
  collectDocsHtmlFiles,
  generateSitemap,
  getSitemapFilename,
  generateSitemapHTML,
  generateRssFeed,
} from './generators/sitemap.js';

// ─── Political Intelligence Classification ────────────────────────────────────
export {
  FRAMEWORK_VERSION,
  type ClassificationInput,
  assessPoliticalSignificance,
  buildImpactMatrix,
  classifyPoliticalActors,
  analyzePoliticalForces,
  initializeAnalysisDirectory,
  serializeFrontmatter,
  writeAnalysisFile,
  writeAnalysisManifest,
  compareSignificance,
  maxSignificance,
} from './utils/political-classification.js';
