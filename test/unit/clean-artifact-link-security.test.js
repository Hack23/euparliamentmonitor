// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * XSS-hardening tests for rewriteLinks / resolveLink. Documents the
 * defanging behaviour of the link rewriter: dangerous URI schemes that are
 * NOT in the explicit pass-through allowlist (`javascript:`) are treated as
 * relative paths and rewritten to broken GitHub blob URLs — neutralising
 * the original payload. Schemes in the allowlist (`data:`, `mailto:`,
 * `tel:`, anchors, absolute URLs) are left untouched.
 */

import { describe, it, expect } from 'vitest';
import { rewriteLinks, resolveLink } from '../../scripts/aggregator/clean-artifact.js';

describe('rewriteLinks — XSS hardening', () => {
  it('defangs javascript: links by rewriting them to a GitHub blob URL path', () => {
    const md = '[click](javascript:alert(1))';
    const out = rewriteLinks(md, 'analysis/daily/2026-01-15/breaking/foo.md');
    // Not in the pass-through allowlist → treated as relative path and
    // rewritten so the link target is an https://github.com/... URL.
    // The browser will navigate to GitHub (404), not execute javascript:.
    expect(out).not.toBe(md);
    expect(out).toMatch(/^\[click\]\(https:\/\/github\.com\//);
    // The link href no longer begins with the javascript: scheme.
    const hrefMatch = /\(([^)]*)\)/.exec(out);
    expect(hrefMatch?.[1] ?? '').not.toMatch(/^javascript:/i);
  });
  it('passes through data: URIs unchanged (allowlisted scheme)', () => {
    expect(resolveLink('data:text/html,<script>x</script>', 'a/b.md', false)).toBe(
      'data:text/html,<script>x</script>'
    );
  });
  it('passes through anchor-only links unchanged', () => {
    expect(resolveLink('#section', 'a/b.md', false)).toBe('#section');
  });
  it('passes through absolute https links unchanged', () => {
    expect(resolveLink('https://example.com/x', 'a/b.md', false)).toBe('https://example.com/x');
  });
  it('rewrites a relative .md link to a GitHub blob URL', () => {
    const out = resolveLink('./sibling.md', 'analysis/daily/2026-01-15/breaking/parent.md', false);
    expect(out).toMatch(/^https:\/\/github\.com\/.*\/blob\/.*sibling\.md$/);
  });
});
