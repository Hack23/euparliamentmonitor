// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module euparliamentmonitor
 * @description European Parliament Intelligence Platform — npm package entry point.
 *
 * This barrel re-exports the reusable library surface of the EU Parliament
 * Monitor so that other projects can consume types, MCP clients, analysis
 * utilities, templates, and language constants without duplicating code.
 *
 * @example
 * ```ts
 * import {
 *   EuropeanParliamentMCPClient,
 *   getEPMCPClient,
 *   ALL_LANGUAGES,
 *   scoreVotingAnomaly,
 *   generateArticleHTML,
 * } from 'euparliamentmonitor';
 * ```
 *
 * @see {@link https://github.com/Hack23/euparliamentmonitor | GitHub Repository}
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md | Secure Development Policy}
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
export { CircuitBreaker, withRetry } from './mcp/mcp-retry.js';
export { MCPHealthMonitor } from './mcp/mcp-health.js';
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
// ─── Political Threat Assessment ─────────────────────────────────────────────
export {
  assessPoliticalThreats,
  buildActorThreatProfiles,
  buildConsequenceTree,
  analyzeLegislativeDisruption,
  generateThreatAssessmentMarkdown,
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
  COMMITTEE_INDICATOR_MAP,
  CATEGORY_INDICATOR_MAP,
  getCommitteeIndicators,
  getCommitteePrimaryIndicators,
  getCategoryIndicators,
  getIndicatorIdsForCommittees,
  getAllCategoryIndicatorIds,
} from './constants/committee-indicator-map.js';
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
// ─── Analysis Pipeline Stage ──────────────────────────────────────────────────
export { ALL_ANALYSIS_METHODS, runAnalysisStage } from './generators/pipeline/analysis-stage.js';
// ─── Political Intelligence Classification ────────────────────────────────────
export {
  FRAMEWORK_VERSION,
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
//# sourceMappingURL=index.js.map
