// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligenceDescriptions
 * @description Thin barrel re-export. The original 3324-LOC monolith was
 * split per document category and per concern under
 * `./political-intelligence/descriptions/` (Refactor 8/8) so editors of one
 * category — methodologies, templates, references, IMF/WB catalog, daily
 * artifact stems, run types — don't conflict with editors of another.
 *
 * Every public name previously exported from this file is preserved by
 * re-exporting from {@link ./political-intelligence/descriptions/index}.
 * No call site needs to change.
 *
 * @see `./political-intelligence/descriptions/index.ts` for the new
 *   per-category layout (`desc-methodologies.ts`, `desc-templates.ts`,
 *   `desc-references.ts`, `titles-methodologies.ts`,
 *   `titles-references.ts`, `titles-templates-a.ts`,
 *   `titles-templates-b.ts`, `fallback.ts`, `lookup.ts`, `run-types.ts`,
 *   `run-types-titles.ts`, `run-types-descriptions.ts`,
 *   `artifact-info.ts`).
 */

export * from './political-intelligence/descriptions/index.js';
