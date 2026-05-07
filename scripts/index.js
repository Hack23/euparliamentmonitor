// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module euparliamentmonitor
 * @description European Parliament Intelligence Platform — npm package entry point.
 *
 * This barrel re-exports the library surface of the EU Parliament Monitor
 * so that other projects can consume types, MCP clients, utilities, generators,
 * and constants.
 *
 * @example
 * ```ts
 * import {
 *   EuropeanParliamentMCPClient,
 *   getEPMCPClient,
 *   buildMetadataDatabase,
 *   detectCategory,
 *   generateSitemap,
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
export { MCPConnection, MCPSessionExpiredError, MCPRateLimitError, isRetriableError, formatRetryAfter, parseSSEResponse, } from './mcp/mcp-connection.js';
export { EuropeanParliamentMCPClient, getEPMCPClient, closeEPMCPClient, } from './mcp/ep-mcp-client.js';
export { WorldBankMCPClient, getWBMCPClient, closeWBMCPClient } from './mcp/wb-mcp-client.js';
export { IMFMCPClient, IMF_MCP_TOOLS, getIMFMCPClient, closeIMFMCPClient, } from './mcp/imf-mcp-client.js';
export { CircuitBreaker, withRetry, } from './mcp/mcp-retry.js';
export { MCPHealthMonitor } from './mcp/mcp-health.js';
// ─── Intelligence Index ──────────────────────────────────────────────────────
export { createEmptyIndex, addArticleToIndex, buildIndexFromEntries, findRelatedArticles, generateCrossReferences, detectTrends, findOrCreateSeries, buildRelatedArticlesHTML, } from './utils/intelligence-index.js';
// ─── News Metadata ───────────────────────────────────────────────────────────
export { buildMetadataDatabase, writeMetadataDatabase, readMetadataDatabase, updateMetadataDatabase, updateIntelligenceIndex, } from './utils/news-metadata.js';
// ─── Article Category ────────────────────────────────────────────────────────
export { detectCategory } from './utils/article-category.js';
// ─── Content Metadata ────────────────────────────────────────────────────────
export { enrichMetadataFromContent } from './utils/content-metadata.js';
// ─── File Utils ──────────────────────────────────────────────────────────────
export { getNewsArticles, parseArticleFilename, formatSlug, extractArticleMeta, } from './utils/file-utils.js';
// ─── HTML Sanitize ───────────────────────────────────────────────────────────
export { stripHtmlTags, stripScriptBlocks } from './utils/html-sanitize.js';
// ─── Templates ───────────────────────────────────────────────────────────────
export { computeArticleQualityScore, buildTableOfContents, buildQualityScoreBadge, } from './templates/section-builders.js';
// ─── Index & Sitemap Generators ──────────────────────────────────────────────
export { getIndexFilename, generateIndexHTML } from './generators/news-indexes.js';
export { collectDocsHtmlFiles, generateSitemap, getSitemapFilename, generateSitemapHTML, generateRssFeed, } from './generators/sitemap.js';
export { getPoliticalIntelligenceFilename, generatePoliticalIntelligenceHTML, } from './generators/political-intelligence.js';
export { CURATED_DESCRIPTIONS, CURATED_TITLES, } from './generators/political-intelligence-descriptions.js';
// ─── Aggregator ──────────────────────────────────────────────────────────────
export { ARTIFACT_SECTIONS, SUPPLEMENTARY_SECTION_ID, SUPPLEMENTARY_SECTION_TITLE, TRADECRAFT_SECTION_ID, } from './aggregator/artifact-order.js';
export { cleanArtifact } from './aggregator/clean-artifact.js';
export { aggregateAnalysisRun } from './aggregator/analysis-aggregator.js';
export { renderMarkdown, slugify, buildMarkdownIt } from './aggregator/markdown-renderer.js';
export { getArticleFilename, buildArticleHreflangLinks, wrapArticleHtml, localizeArticleBody, } from './aggregator/article-html.js';
export { generateArticle } from './aggregator/article-generator.js';
// ─── Constants ───────────────────────────────────────────────────────────────
export { PROJECT_ROOT, NEWS_DIR, METADATA_DIR, BASE_URL, ARTICLE_FILENAME_PATTERN, } from './constants/config.js';
//# sourceMappingURL=index.js.map