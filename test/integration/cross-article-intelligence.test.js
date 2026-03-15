// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for cross-article intelligence architecture.
 * Tests the full flow: generate article entry → add to index →
 * generate second related article → verify cross-references exist.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

import {
  createEmptyIndex,
  addArticleToIndex,
  generateCrossReferences,
  detectTrends,
  findRelatedArticles,
  saveIntelligenceIndex,
  loadIntelligenceIndex,
  buildRelatedArticlesHTML,
} from '../../scripts/utils/intelligence-index.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEntry(overrides = {}) {
  return {
    id: '2025-01-15-week-ahead-en',
    date: '2025-01-15',
    type: 'week-ahead',
    lang: 'en',
    keyTopics: ['digital regulation'],
    keyActors: ['EPP'],
    procedures: ['2024/0001(COD)'],
    crossReferences: [],
    trendContributions: [],
    ...overrides,
  };
}

// ─── Integration Tests ────────────────────────────────────────────────────────

describe('Cross-Article Intelligence Integration', () => {
  let tempDir;
  let indexPath;

  beforeEach(() => {
    tempDir = createTempDir();
    indexPath = path.join(tempDir, 'intelligence-index.json');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should produce cross-references when a second related article is indexed', () => {
    // Step 1: Generate first article entry and add to index
    const firstEntry = makeEntry({
      id: '2025-01-10-motions-en',
      date: '2025-01-10',
      type: 'motions',
      keyTopics: ['digital regulation', 'AI Act'],
      keyActors: ['EPP', 'S&D'],
      procedures: ['2024/0001(COD)'],
    });

    let index = createEmptyIndex();
    index = addArticleToIndex(index, firstEntry);

    // Step 2: Generate second article entry with overlapping content
    const secondEntry = makeEntry({
      id: '2025-01-20-week-ahead-en',
      date: '2025-01-20',
      type: 'week-ahead',
      keyTopics: ['digital regulation', 'AI Act'],
      keyActors: ['EPP'],
      procedures: ['2024/0001(COD)'],
    });

    // Step 3: Generate cross-references for the second article using the index
    const crossRefs = generateCrossReferences(index, secondEntry);

    // Verify cross-references exist
    expect(crossRefs.length).toBeGreaterThan(0);
    const ref = crossRefs.find((r) => r.targetArticleId === firstEntry.id);
    expect(ref).toBeDefined();
    expect(ref?.relationship).toBe('follows_up');
    expect(ref?.strength).toBe('strong'); // 3+ shared items
  });

  it('should persist intelligence across save/load cycle and maintain cross-references', () => {
    const firstEntry = makeEntry({
      id: '2025-01-10-motions-en',
      date: '2025-01-10',
      keyTopics: ['coalition dynamics', 'EPP strategy'],
      keyActors: ['EPP', 'Renew'],
    });

    let index = createEmptyIndex();
    index = addArticleToIndex(index, firstEntry);

    // Save to disk
    saveIntelligenceIndex(index, indexPath);

    // Load from disk (simulating second pipeline run)
    const loadedIndex = loadIntelligenceIndex(indexPath);

    // Add second article to loaded index
    const secondEntry = makeEntry({
      id: '2025-01-25-analysis-en',
      date: '2025-01-25',
      keyTopics: ['coalition dynamics'],
      keyActors: ['EPP'],
    });
    const updatedIndex = addArticleToIndex(loadedIndex, secondEntry);

    // Cross-references from second article should point back to first
    const crossRefs = generateCrossReferences(updatedIndex, secondEntry);
    expect(crossRefs.some((r) => r.targetArticleId === firstEntry.id)).toBe(true);
  });

  it('should detect trends once two articles share the same topic', () => {
    let index = createEmptyIndex();
    index = addArticleToIndex(index, makeEntry({
      id: 'art-1',
      keyTopics: ['green transition'],
    }));

    // No trend yet — only one article
    expect(detectTrends(index)).toHaveLength(0);

    index = addArticleToIndex(index, makeEntry({
      id: 'art-2',
      keyTopics: ['green transition'],
    }));

    // Trend should appear now
    const trends = detectTrends(index);
    expect(trends.some((t) => t.name.includes('green transition'))).toBe(true);
  });

  it('should generate a valid "Related Analysis" HTML section end-to-end', () => {
    // Build an index with a prior article
    let index = createEmptyIndex();
    const priorEntry = makeEntry({
      id: '2025-03-07-motions-en',
      date: '2025-03-07',
      keyTopics: ['LIBE committee', 'voting patterns'],
      keyActors: ['EPP', 'S&D'],
    });
    index = addArticleToIndex(index, priorEntry);

    // Current article
    const currentEntry = makeEntry({
      id: '2025-03-14-week-ahead-en',
      date: '2025-03-14',
      keyTopics: ['LIBE committee', 'digital regulation'],
      keyActors: ['EPP'],
    });

    const related = findRelatedArticles(index, currentEntry.keyTopics, currentEntry.keyActors);
    const crossRefs = generateCrossReferences(index, currentEntry);
    index = addArticleToIndex(index, currentEntry);
    const trends = detectTrends(index);

    const html = buildRelatedArticlesHTML(related, crossRefs, trends, 'en');

    // Should be a valid section element
    expect(html).toContain('<section class="related-articles" aria-label="Related Analysis">');
    expect(html).toContain('</section>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('2025-03-07-motions-en.html');
  });

  it('should produce no cross-references for a single article with no related content', () => {
    const index = createEmptyIndex();
    const entry = makeEntry({
      id: '2025-01-01-unique-en',
      keyTopics: ['completely-unique-topic'],
      keyActors: ['Unknown Actor'],
    });

    const crossRefs = generateCrossReferences(index, entry);
    expect(crossRefs).toHaveLength(0);

    const html = buildRelatedArticlesHTML([], crossRefs, []);
    expect(html).toBe('');
  });

  it('should build and persist a complete intelligence cycle', () => {
    let index = createEmptyIndex();

    // Add 3 articles with shared topics
    const entries = [
      makeEntry({ id: 'art-a', date: '2025-01-01', keyTopics: ['AI regulation', 'tech policy'] }),
      makeEntry({ id: 'art-b', date: '2025-01-08', keyTopics: ['AI regulation'] }),
      makeEntry({ id: 'art-c', date: '2025-01-15', keyTopics: ['AI regulation', 'digital single market'] }),
    ];

    for (const e of entries) {
      index = addArticleToIndex(index, e);
    }

    const trends = detectTrends(index);
    index = { ...index, trends };

    saveIntelligenceIndex(index, indexPath);

    const reloaded = loadIntelligenceIndex(indexPath);
    expect(reloaded.articles).toHaveLength(3);
    expect(reloaded.trends.some((t) => t.name.includes('AI regulation'))).toBe(true);

    // Verify the JSON file was written
    expect(fs.existsSync(indexPath)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    expect(raw.articles).toHaveLength(3);
  });
});
