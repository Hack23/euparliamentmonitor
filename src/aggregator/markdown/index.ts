// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Markdown
 * @description Public re-exports for the Markdown rendering bounded context.
 * Provides markdown-it based HTML rendering with plugin support and
 * TOC generation.
 */

export type { RenderOptions, RenderedMarkdown, TocEntry } from '../markdown-renderer.js';
export { buildMarkdownIt, renderMarkdown } from '../markdown-renderer.js';
