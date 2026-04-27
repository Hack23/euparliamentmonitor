// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test: European Parliament MCP tool surface drift guard.
 *
 * The `EP_MCP_TOOLS` array exported from `src/mcp/ep-mcp-client.ts` is the
 * single source of truth for the tools the EP MCP client can call on
 * `european-parliament-mcp-server@1.2.11`. This test asserts:
 *
 *   1. `EP_MCP_TOOLS` is in sync with the actual `this.safeCallTool(...)`
 *      and manual `this.callToolWithRetry(...)`
 *      invocations found in the TypeScript client source at
 *      `src/mcp/ep-mcp-client.ts` (so a method that wraps a new tool can
 *      never ship without updating the exported list).
 *   2. Every entry in `EP_MCP_TOOLS` is documented in
 *      `.github/prompts/07-mcp-reference.md` (prompt-library tables), which
 *      is the canonical reference cited by all news workflows.
 *
 * The equivalent drift guards exist for World Bank
 * (`test/integration/mcp/worldbank-mcp.test.js`) and IMF
 * (`test/integration/mcp/imf-mcp.test.js`) — this test mirrors that
 * pattern.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EP_MCP_TOOLS } from '../../../scripts/mcp/ep-mcp-client.js';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(THIS_DIR, '..', '..', '..');

/**
 * Extract every tool name passed as the first argument to wrapper calls in the
 * EP MCP client TypeScript source (`src/mcp/ep-mcp-client.ts`). Handles both
 * `safeCallTool('name', ...)` and manually wrapped `callToolWithRetry('name', ...)`
 * calls where a method needs bespoke post-processing/error handling.
 *
 * @param {string} source - Full file contents
 * @returns {Set<string>} unique tool names
 */
function extractWrappedToolNames(source) {
  const names = new Set();
  const re = /(?:safeCallTool|callToolWithRetry)\s*\(\s*'([a-z_]+)'/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    names.add(match[1]);
  }
  return names;
}

describe('EP MCP tool surface (drift guard)', () => {
  it('exports a non-empty canonical tool list', () => {
    expect(Array.isArray(EP_MCP_TOOLS)).toBe(true);
    expect(EP_MCP_TOOLS.length).toBeGreaterThan(0);
  });

  it('EP_MCP_TOOLS equals the set of tools actually wrapped by ep-mcp-client.ts', () => {
    const clientSource = fs.readFileSync(
      path.join(REPO_ROOT, 'src', 'mcp', 'ep-mcp-client.ts'),
      'utf8'
    );
    const wrapped = extractWrappedToolNames(clientSource);

    const exported = new Set(EP_MCP_TOOLS);
    const missingFromExport = [...wrapped].filter((t) => !exported.has(t)).sort();
    const extraInExport = [...exported].filter((t) => !wrapped.has(t)).sort();

    expect(
      missingFromExport,
      `Tools wrapped in ep-mcp-client.ts but missing from EP_MCP_TOOLS: ${missingFromExport.join(', ')}`
    ).toEqual([]);
    expect(
      extraInExport,
      `Tools in EP_MCP_TOOLS but not wrapped in ep-mcp-client.ts: ${extraInExport.join(', ')}`
    ).toEqual([]);
  });

  it('every EP_MCP_TOOLS entry is documented in .github/prompts/07-mcp-reference.md', () => {
    const referenceDoc = fs.readFileSync(
      path.join(REPO_ROOT, '.github', 'prompts', '07-mcp-reference.md'),
      'utf8'
    );

    // Use word-boundary regex to avoid false positives where one tool name is
    // a substring of another (e.g. `get_events` vs `get_events_feed`).
    const undocumented = EP_MCP_TOOLS.filter((tool) => {
      const pattern = new RegExp(`\\b${tool}\\b`);
      return !pattern.test(referenceDoc);
    }).sort();

    expect(
      undocumented,
      `EP MCP tools missing from .github/prompts/07-mcp-reference.md tables: ${undocumented.join(', ')}`
    ).toEqual([]);
  });

  it('EP_MCP_TOOLS is sorted alphabetically (stable review diffs)', () => {
    const sorted = [...EP_MCP_TOOLS].sort();
    expect(EP_MCP_TOOLS).toEqual(sorted);
  });
});
