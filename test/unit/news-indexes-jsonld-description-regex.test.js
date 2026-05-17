// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Regression test for the JSON-LD `description` duplicate-tail bug.
 *
 * Before the May-2026 fix, `applyArticleSeoBackfill` used the regex
 * `"description":"[^"]*"` to replace the JSON-LD description field.
 * Because the description is a JSON string value, embedded quotes are
 * stored as the two-character escape `\"`. The greedy `[^"]*` class
 * stopped at the FIRST literal `"` character — which is the closing
 * quote of the escape sequence — leaving the tail of the previous
 * description in place. Every subsequent `npm run prebuild` then
 * inserted a new description in front of that orphaned tail, so the
 * JSON-LD payload accumulated duplicate fragments and the
 * structured-data block stopped being parseable JSON.
 *
 * The fix replaces the inner class with `(?:\\.|[^"\\])*` which
 * properly skips JSON escape sequences and matches the whole string
 * value. The test below proves the bug is gone by:
 *
 *  - replacing a description containing `\"` once and asserting JSON
 *    validity,
 *  - running the replacement a second time (simulating a re-build)
 *    and asserting the JSON-LD remains valid, the description is
 *    overwritten exactly (not accumulated), and there is no orphan
 *    tail in the script tag.
 */

/* eslint-disable no-undef */

import { describe, it, expect } from 'vitest';
import { applyArticleSeoBackfill } from '../../scripts/generators/news-indexes.js';

const HTML_TEMPLATE = (jsonLdDescription) =>
  `<!DOCTYPE html>
<html lang="en"><head>
  <meta name="description" content="placeholder">
  <meta property="og:description" content="placeholder">
  <meta name="twitter:description" content="placeholder">
  <script type="application/ld+json">[{"@context":"https://schema.org","@type":"NewsArticle","headline":"H","description":"${jsonLdDescription}","datePublished":"2026-04-17"}]</script>
</head><body></body></html>`;

function extractJsonLd(html) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u);
  if (!m) throw new Error('JSON-LD script tag not found');
  return m[1];
}

describe('applyArticleSeoBackfill — JSON-LD description regex', () => {
  it('replaces a description containing embedded quotes without leaving an orphan tail', () => {
    const initial = HTML_TEMPLATE('Old text containing \\"quoted\\" fragment that must vanish.');
    const desc =
      'Run 182 is the fourth breaking probe of 17 April and the run where the "Institutional Self-Contradiction Thesis" was first established as EP10\'s defining analytical framework.';

    const next = applyArticleSeoBackfill(initial, desc, ['k1', 'k2']);
    const jsonLd = extractJsonLd(next);

    // The JSON-LD payload must parse cleanly — the prior bug produced
    // an unparseable blob with the old description's tail spliced in
    // after the new description's closing quote.
    expect(() => JSON.parse(jsonLd)).not.toThrow();
    const parsed = JSON.parse(jsonLd);
    expect(parsed[0].description).toBe(desc);
    // No fragment from the placeholder survives in the JSON-LD.
    expect(jsonLd).not.toContain('quoted');
    expect(jsonLd).not.toContain('placeholder');
  });

  it('is idempotent across consecutive prebuild runs (no accumulating duplicates)', () => {
    const desc =
      'Run 182 is the fourth breaking probe of 17 April and the run where the "Institutional Self-Contradiction Thesis" was first established as EP10\'s defining analytical framework.';

    let html = HTML_TEMPLATE('seed');
    html = applyArticleSeoBackfill(html, desc, ['k']);
    const afterFirst = extractJsonLd(html);

    html = applyArticleSeoBackfill(html, desc, ['k']);
    const afterSecond = extractJsonLd(html);

    // Both passes must produce valid JSON.
    expect(() => JSON.parse(afterFirst)).not.toThrow();
    expect(() => JSON.parse(afterSecond)).not.toThrow();

    // The repeated phrase `Institutional Self-Contradiction Thesis`
    // must appear exactly ONCE in the JSON-LD (the prior bug
    // accumulated 15-20 copies as new fragments piled in front of the
    // orphan tail on every rebuild).
    const occurrences = (afterSecond.match(/Institutional Self-Contradiction Thesis/gu) ?? []).length;
    expect(occurrences).toBe(1);

    // And the second pass is byte-identical to the first — proves the
    // function is now a fixed point on its own output.
    expect(afterSecond).toBe(afterFirst);
  });

  it('handles backslash escapes inside the description correctly', () => {
    // A description containing a backslash followed by a quote must
    // round-trip cleanly through the regex.
    const desc = 'Description with a backslash \\ and a "quote" inside.';
    const html = applyArticleSeoBackfill(HTML_TEMPLATE('seed'), desc, ['k']);
    const jsonLd = extractJsonLd(html);
    expect(() => JSON.parse(jsonLd)).not.toThrow();
    expect(JSON.parse(jsonLd)[0].description).toBe(desc);
  });

  it('heals a previously-corrupted JSON-LD description (duplicate-tail repro)', () => {
    // Reproduce the exact corruption pattern observed in committed news
    // HTML files: the description's closing quote is followed by an
    // orphan tail repeating the trailing fragment, then `,"datePublished"`.
    const corruptedDescriptionField =
      '"description":"Run 182 is the fourth breaking probe of 17 April and the run where the \\"Institutional Self-Contradiction Thesis\\" was first established as EP10\'s defining analytical framework."Institutional Self-Contradiction Thesis\\" was first established as EP10\'s defining analytical framework."Institutional Self-Contradiction Thesis\\" was first established as EP10\'s defining analytical framework."';
    const html = `<!DOCTYPE html>
<html lang="en"><head>
  <meta name="description" content="placeholder">
  <meta property="og:description" content="placeholder">
  <meta name="twitter:description" content="placeholder">
  <script type="application/ld+json">[{"@context":"https://schema.org","@type":"NewsArticle","headline":"Run 182",${corruptedDescriptionField},"datePublished":"2026-04-17"}]</script>
</head><body></body></html>`;

    // Sanity: the corrupted JSON-LD doesn't parse before healing.
    expect(() => JSON.parse(extractJsonLd(html))).toThrow();

    const desc =
      'Run 182 is the fourth breaking probe of 17 April and the run where the "Institutional Self-Contradiction Thesis" was first established as EP10\'s defining analytical framework.';
    const next = applyArticleSeoBackfill(html, desc, ['k']);
    const jsonLd = extractJsonLd(next);

    // After healing, the JSON-LD parses cleanly and the description
    // appears exactly once (no orphan tail).
    expect(() => JSON.parse(jsonLd)).not.toThrow();
    const occurrences = (jsonLd.match(/Institutional Self-Contradiction Thesis/gu) ?? []).length;
    expect(occurrences).toBe(1);
    expect(JSON.parse(jsonLd)[0].description).toBe(desc);
  });
});
