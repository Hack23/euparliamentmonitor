// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/EPMCPClient
 * @description Re-exports all European Parliament MCP client symbols from submodule directories.
 * @see ./ep/fallbacks.js
 * @see ./ep/parse.js
 * @see ./ep/error-classifier.js
 * @see ./ep/staleness.js
 * @see ./ep/reliability.js
 * @see ./ep/election-calendar.js
 * @see ./ep/client.js
 */
export * from './ep/fallbacks.js';
export * from './ep/parse.js';
export * from './ep/error-classifier.js';
export * from './ep/staleness.js';
export * from './ep/reliability.js';
export * from './ep/election-calendar.js';
export * from './ep/tools-list.js';
export * from './ep/client.js';
// Side-effect mixin imports (augment EuropeanParliamentMCPClient prototype)
import './ep/tools-data.js';
import './ep/tools-procedures.js';
import './ep/tools-documents.js';
import './ep/tools-feeds.js';
//# sourceMappingURL=ep-mcp-client.js.map