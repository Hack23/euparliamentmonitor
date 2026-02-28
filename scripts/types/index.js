// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Types
 * @description Barrel re-export for all EU Parliament Monitor type definitions.
 *
 * Bounded contexts:
 * - **common** — Language codes, article enums, category mappings
 * - **parliament** — Domain entities (events, committees, documents, voting)
 * - **generation** — Article pipeline (options, metadata, stats)
 * - **mcp** — MCP client transport and tool option interfaces
 * - **world-bank** — World Bank economic data types for article enrichment
 */
export { ArticleCategory, ArticlePerspective, TimePeriod, AnalysisPerspective, CATEGORY_PERSPECTIVE, CATEGORY_TIME_PERIOD, } from './common.js';
//# sourceMappingURL=index.js.map