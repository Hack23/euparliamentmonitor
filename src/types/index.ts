// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types
 * @description Shared TypeScript type definitions for EU Parliament Monitor
 */

/** Supported language codes */
export type LanguageCode =
  | 'en'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'sv'
  | 'da'
  | 'fi'
  | 'el'
  | 'hu';

/** RTL language codes */
export type RTLLanguageCode = 'ar' | 'he';

/** All possible language codes (including RTL) */
export type AnyLanguageCode = LanguageCode | RTLLanguageCode;

/** Article type identifiers */
export type ArticleType = 'prospective' | 'retrospective' | 'breaking';

/** Valid article generation types */
export type ArticleGenerationType =
  | 'week-ahead'
  | 'committee-reports'
  | 'propositions'
  | 'motions'
  | 'breaking';

/** Language preset names */
export type LanguagePreset = 'all' | 'eu-core' | 'nordic';

/** Map from language code to translated string */
export type LanguageMap<T = string> = Record<LanguageCode, T>;

/** Parsed article metadata from filename */
export interface ParsedArticle {
  date: string;
  slug: string;
  lang: string;
  filename: string;
}

/** Article source reference */
export interface ArticleSource {
  title: string;
  url: string;
}

/** Options for generating article HTML */
export interface ArticleOptions {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  type: ArticleType | string;
  readTime: number;
  lang: string;
  content: string;
  keywords?: string[];
  sources?: ArticleSource[];
}

/** Sitemap URL entry */
export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/** News article metadata entry */
export interface ArticleMetadataEntry {
  filename: string;
  date: string;
  slug: string;
  lang: string;
  title: string;
  type?: string;
}

/** News metadata database */
export interface NewsMetadataDatabase {
  lastUpdated: string;
  articles: ArticleMetadataEntry[];
}

/** MCP client options */
export interface MCPClientOptions {
  serverPath?: string;
  maxConnectionAttempts?: number;
  connectionRetryDelay?: number;
}

/** MCP tool call result content item */
export interface MCPContentItem {
  type: string;
  text: string;
}

/** MCP tool call result */
export interface MCPToolResult {
  content?: MCPContentItem[];
}

/** JSON-RPC 2.0 request */
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: Record<string, unknown>;
}

/** JSON-RPC 2.0 response */
export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/** Pending request handler */
export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

/** Event data from MCP or fallback */
export interface ParliamentEvent {
  date: string;
  title: string;
  type: string;
  description: string;
}

/** Date range for article generation */
export interface DateRange {
  start: string;
  end: string;
}

/** Generation statistics */
export interface GenerationStats {
  generated: number;
  errors: number;
  articles: string[];
  timestamp: string;
}

/** Generation result */
export interface GenerationResult {
  success: boolean;
  files?: number;
  slug?: string;
  error?: string;
}

/** Article type labels for a single language */
export interface ArticleTypeLabels {
  prospective: string;
  retrospective: string;
  breaking: string;
}

/** Language-specific title and subtitle */
export interface LangTitleSubtitle {
  title: string;
  subtitle: string;
}

/** Options for getting MEP details */
export interface MEPDetailsOptions {
  id: string;
}

/** Options for getting voting records */
export interface VotingRecordsOptions {
  mepId?: string;
  sessionId?: string;
  topic?: string;
  dateFrom?: string;
  [key: string]: unknown;
}

/** Options for getting committee information (exactly one identifier is required) */
export interface CommitteeInfoByIdOptions {
  id: string;
  abbreviation?: never;
}

export interface CommitteeInfoByAbbreviationOptions {
  id?: never;
  abbreviation: string;
}

export type CommitteeInfoOptions = CommitteeInfoByIdOptions | CommitteeInfoByAbbreviationOptions;

/** Options for analyzing voting patterns */
export interface VotingPatternsOptions {
  mepId: string;
  dateFrom?: string;
  compareWithGroup?: boolean;
  [key: string]: unknown;
}

/** Options for tracking legislation */
export interface TrackLegislationOptions {
  procedureId: string;
}

/** Options for generating analytical reports */
export interface GenerateReportOptions {
  reportType: string;
  subjectId?: string;
  dateFrom?: string;
  [key: string]: unknown;
}
