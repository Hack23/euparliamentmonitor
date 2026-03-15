// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/intelligence-index module.
 * Tests cross-article intelligence indexing, trend detection,
 * cross-reference generation, and HTML output.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

import {
  createEmptyIndex,
  addArticleToIndex,
  findRelatedArticles,
  generateCrossReferences,
  detectTrends,
  findOrCreateSeries,
  loadIntelligenceIndex,
  saveIntelligenceIndex,
  buildRelatedArticlesHTML,
} from '../../scripts/utils/intelligence-index.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Build a minimal ArticleIndexEntry for testing */
function makeEntry(overrides = {}) {
  return {
    id: '2025-01-15-week-ahead-en',
    date: '2025-01-15',
    type: 'week-ahead',
    lang: 'en',
    keyTopics: ['digital regulation', 'AI Act'],
    keyActors: ['EPP', 'S&D'],
    procedures: ['2024/0001(COD)'],
    crossReferences: [],
    trendContributions: [],
    ...overrides,
  };
}

// ─── createEmptyIndex ─────────────────────────────────────────────────────────

describe('createEmptyIndex', () => {
  it('should return a valid empty structure', () => {
    const index = createEmptyIndex();
    expect(index.articles).toEqual([]);
    expect(index.actors).toEqual({});
    expect(index.policyDomains).toEqual({});
    expect(index.procedures).toEqual({});
    expect(index.trends).toEqual([]);
    expect(index.series).toEqual([]);
    expect(typeof index.lastUpdated).toBe('string');
  });

  it('should include a lastUpdated timestamp', () => {
    const before = Date.now();
    const index = createEmptyIndex();
    const after = Date.now();
    const ts = new Date(index.lastUpdated).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

// ─── addArticleToIndex ────────────────────────────────────────────────────────

describe('addArticleToIndex', () => {
  it('should add an entry and return an updated index', () => {
    const index = createEmptyIndex();
    const entry = makeEntry();
    const updated = addArticleToIndex(index, entry);

    expect(updated.articles).toHaveLength(1);
    expect(updated.articles[0].id).toBe(entry.id);
  });

  it('should update the actors map', () => {
    const index = createEmptyIndex();
    const entry = makeEntry({ keyActors: ['EPP', 'S&D'] });
    const updated = addArticleToIndex(index, entry);

    expect(updated.actors['EPP']).toContain(entry.id);
    expect(updated.actors['S&D']).toContain(entry.id);
  });

  it('should update the policyDomains map', () => {
    const index = createEmptyIndex();
    const entry = makeEntry({ keyTopics: ['digital regulation', 'AI Act'] });
    const updated = addArticleToIndex(index, entry);

    expect(updated.policyDomains['digital regulation']).toContain(entry.id);
    expect(updated.policyDomains['AI Act']).toContain(entry.id);
  });

  it('should update the procedures map', () => {
    const index = createEmptyIndex();
    const entry = makeEntry({ procedures: ['2024/0001(COD)'] });
    const updated = addArticleToIndex(index, entry);

    expect(updated.procedures['2024/0001(COD)']).toContain(entry.id);
  });

  it('should replace an existing entry with the same id', () => {
    const index = createEmptyIndex();
    const entry = makeEntry({ keyTopics: ['topic-a'] });
    const updated1 = addArticleToIndex(index, entry);
    const entryV2 = makeEntry({ keyTopics: ['topic-b'] });
    const updated2 = addArticleToIndex(updated1, entryV2);

    expect(updated2.articles).toHaveLength(1);
    expect(updated2.articles[0].keyTopics).toContain('topic-b');
  });

  it('should clean up stale map associations when replacing an article', () => {
    const index = createEmptyIndex();
    const entry = makeEntry({
      keyTopics: ['old-topic'],
      keyActors: ['old-actor'],
      procedures: ['old-proc'],
    });
    const updated1 = addArticleToIndex(index, entry);
    // Replace the same article id with completely different topics/actors/procedures
    const entryV2 = makeEntry({
      keyTopics: ['new-topic'],
      keyActors: ['new-actor'],
      procedures: ['new-proc'],
    });
    const updated2 = addArticleToIndex(updated1, entryV2);

    // Old keys should be removed from maps
    expect(updated2.policyDomains['old-topic']).toBeUndefined();
    expect(updated2.actors['old-actor']).toBeUndefined();
    expect(updated2.procedures['old-proc']).toBeUndefined();
    // New keys should be present
    expect(updated2.policyDomains['new-topic']).toContain(entry.id);
    expect(updated2.actors['new-actor']).toContain(entry.id);
    expect(updated2.procedures['new-proc']).toContain(entry.id);
  });

  it('should not duplicate article IDs in maps', () => {
    const index = createEmptyIndex();
    const entry = makeEntry();
    const updated1 = addArticleToIndex(index, entry);
    const updated2 = addArticleToIndex(updated1, entry);

    // Same id added twice — map should still have only 1 entry
    expect(updated2.actors['EPP']).toHaveLength(1);
  });

  it('should not mutate the original index', () => {
    const index = createEmptyIndex();
    const entry = makeEntry();
    addArticleToIndex(index, entry);

    expect(index.articles).toHaveLength(0);
  });
});

// ─── findRelatedArticles ──────────────────────────────────────────────────────

describe('findRelatedArticles', () => {
  let index;

  beforeEach(() => {
    index = createEmptyIndex();
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'article-a',
        keyTopics: ['digital regulation'],
        keyActors: ['EPP'],
      })
    );
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'article-b',
        keyTopics: ['digital regulation', 'AI Act'],
        keyActors: ['S&D'],
      })
    );
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'article-c',
        keyTopics: ['agriculture'],
        keyActors: ['Renew'],
      })
    );
  });

  it('should find articles sharing topics', () => {
    const results = findRelatedArticles(index, ['digital regulation'], []);
    const ids = results.map((a) => a.id);
    expect(ids).toContain('article-a');
    expect(ids).toContain('article-b');
    expect(ids).not.toContain('article-c');
  });

  it('should find articles sharing actors', () => {
    const results = findRelatedArticles(index, [], ['EPP']);
    expect(results.map((a) => a.id)).toContain('article-a');
  });

  it('should return empty array for empty topics and actors', () => {
    const results = findRelatedArticles(index, [], []);
    expect(results).toHaveLength(0);
  });

  it('should respect maxResults limit', () => {
    const results = findRelatedArticles(index, ['digital regulation'], [], 1);
    expect(results).toHaveLength(1);
  });

  it('should sort results by relevance score (highest first)', () => {
    // article-b has both topic and actor overlap
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'article-d',
        keyTopics: ['digital regulation'],
        keyActors: ['EPP'],
      })
    );
    const results = findRelatedArticles(index, ['digital regulation'], ['EPP'], 10);
    // Both article-a and article-d share topic+actor; article-b shares only topic
    const topId = results[0]?.id;
    expect(['article-a', 'article-d']).toContain(topId);
  });

  it('should handle empty index', () => {
    const results = findRelatedArticles(createEmptyIndex(), ['topic'], ['actor']);
    expect(results).toHaveLength(0);
  });
});

// ─── generateCrossReferences ──────────────────────────────────────────────────

describe('generateCrossReferences', () => {
  let index;

  beforeEach(() => {
    index = createEmptyIndex();
    index = addArticleToIndex(
      index,
      makeEntry({
        id: '2025-01-10-week-ahead-en',
        date: '2025-01-10',
        keyTopics: ['digital regulation', 'AI Act'],
        keyActors: ['EPP', 'S&D'],
      })
    );
  });

  it('should generate cross-references for related articles', () => {
    const entry = makeEntry({
      id: '2025-01-20-analysis-en',
      date: '2025-01-20',
      keyTopics: ['digital regulation'],
      keyActors: ['EPP'],
    });
    const refs = generateCrossReferences(index, entry);
    expect(refs.length).toBeGreaterThan(0);
    expect(refs[0].targetArticleId).toBe('2025-01-10-week-ahead-en');
  });

  it('should not generate self-references', () => {
    const entry = makeEntry({
      id: '2025-01-10-week-ahead-en',
      date: '2025-01-10',
      keyTopics: ['digital regulation', 'AI Act'],
      keyActors: ['EPP', 'S&D'],
    });
    const refs = generateCrossReferences(index, entry);
    expect(refs.every((r) => r.targetArticleId !== entry.id)).toBe(true);
  });

  it('should assign strong strength for ≥3 shared items', () => {
    const entry = makeEntry({
      id: '2025-01-20-analysis-en',
      date: '2025-01-20',
      keyTopics: ['digital regulation', 'AI Act'],
      keyActors: ['EPP', 'S&D'],
    });
    const refs = generateCrossReferences(index, entry);
    expect(refs.some((r) => r.strength === 'strong')).toBe(true);
  });

  it('should assign follows_up for older target articles', () => {
    const entry = makeEntry({
      id: '2025-01-20-analysis-en',
      date: '2025-01-20',
      keyTopics: ['digital regulation'],
      keyActors: [],
    });
    const refs = generateCrossReferences(index, entry);
    expect(refs.some((r) => r.relationship === 'follows_up')).toBe(true);
  });

  it('should return empty array for no related articles', () => {
    const entry = makeEntry({
      id: '2025-01-20-unique-en',
      date: '2025-01-20',
      keyTopics: ['completely-unique-topic'],
      keyActors: ['completely-unique-actor'],
    });
    const refs = generateCrossReferences(createEmptyIndex(), entry);
    expect(refs).toHaveLength(0);
  });
});

// ─── detectTrends ─────────────────────────────────────────────────────────────

describe('detectTrends', () => {
  it('should detect trends when ≥2 articles share topics', () => {
    let index = createEmptyIndex();
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'art-1',
        keyTopics: ['climate policy'],
      })
    );
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'art-2',
        keyTopics: ['climate policy'],
      })
    );

    const trends = detectTrends(index);
    expect(trends.some((t) => t.name.includes('climate policy'))).toBe(true);
  });

  it('should NOT detect a trend when only 1 article covers a topic', () => {
    let index = createEmptyIndex();
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'art-single',
        keyTopics: ['rare-topic'],
      })
    );

    const trends = detectTrends(index);
    expect(trends.every((t) => !t.name.includes('rare-topic'))).toBe(true);
  });

  it('should detect procedure-based trends', () => {
    let index = createEmptyIndex();
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'art-1',
        procedures: ['2024/0001(COD)'],
      })
    );
    index = addArticleToIndex(
      index,
      makeEntry({
        id: 'art-2',
        procedures: ['2024/0001(COD)'],
      })
    );

    const trends = detectTrends(index);
    expect(trends.some((t) => t.category === 'legislative')).toBe(true);
  });

  it('should return empty array for empty index', () => {
    const trends = detectTrends(createEmptyIndex());
    expect(trends).toHaveLength(0);
  });

  it('should set confidence based on article count', () => {
    let index = createEmptyIndex();
    // 2 articles → low confidence
    for (let i = 0; i < 2; i++) {
      index = addArticleToIndex(index, makeEntry({ id: `art-low-${i}`, keyTopics: ['low-conf'] }));
    }
    // 5 articles → high confidence
    for (let i = 0; i < 5; i++) {
      index = addArticleToIndex(
        index,
        makeEntry({ id: `art-high-${i}`, keyTopics: ['high-conf'] })
      );
    }
    const trends = detectTrends(index);
    const lowTrend = trends.find((t) => t.name.includes('low-conf'));
    const highTrend = trends.find((t) => t.name.includes('high-conf'));
    expect(lowTrend?.confidence).toBe('low');
    expect(highTrend?.confidence).toBe('high');
  });

  it('should set direction to strengthening when ≥4 articles', () => {
    let index = createEmptyIndex();
    for (let i = 0; i < 4; i++) {
      index = addArticleToIndex(
        index,
        makeEntry({ id: `art-str-${i}`, keyTopics: ['strong-topic'] })
      );
    }
    const trends = detectTrends(index);
    const t = trends.find((t) => t.name.includes('strong-topic'));
    expect(t?.direction).toBe('strengthening');
  });

  it('should produce non-colliding trend IDs for non-Latin scripts', () => {
    let index = createEmptyIndex();
    // Arabic topic
    index = addArticleToIndex(index, makeEntry({ id: 'art-ar-1', keyTopics: ['سياسة المناخ'] }));
    index = addArticleToIndex(index, makeEntry({ id: 'art-ar-2', keyTopics: ['سياسة المناخ'] }));
    // Japanese topic
    index = addArticleToIndex(index, makeEntry({ id: 'art-ja-1', keyTopics: ['気候政策'] }));
    index = addArticleToIndex(index, makeEntry({ id: 'art-ja-2', keyTopics: ['気候政策'] }));

    const trends = detectTrends(index);
    const arTrend = trends.find((t) => t.name.includes('سياسة المناخ'));
    const jaTrend = trends.find((t) => t.name.includes('気候政策'));
    expect(arTrend).toBeDefined();
    expect(jaTrend).toBeDefined();
    // IDs should be distinct (not both collapsing to "trend-topic-")
    expect(arTrend?.id).not.toBe(jaTrend?.id);
  });
});

// ─── findOrCreateSeries ───────────────────────────────────────────────────────

describe('findOrCreateSeries', () => {
  it('should create a new series when none exists', () => {
    const index = createEmptyIndex();
    const series = findOrCreateSeries(index, '2024/0001(COD)', 'AI Act Series');
    expect(series.procedureRef).toBe('2024/0001(COD)');
    expect(series.name).toBe('AI Act Series');
    expect(series.status).toBe('ongoing');
    expect(series.articles).toEqual([]);
  });

  it('should find an existing series by procedureRef', () => {
    const index = createEmptyIndex();
    const first = findOrCreateSeries(index, '2024/0001(COD)', 'AI Act Series');
    const second = findOrCreateSeries(index, '2024/0001(COD)', 'Different Name');
    expect(second.id).toBe(first.id);
  });

  it('should add the series to the index', () => {
    const index = createEmptyIndex();
    findOrCreateSeries(index, '2024/0001(COD)', 'AI Act Series');
    expect(index.series).toHaveLength(1);
  });

  it('should generate a stable id from procedureRef', () => {
    const index = createEmptyIndex();
    const series = findOrCreateSeries(index, '2024/0001(COD)', 'Test');
    expect(series.id).toMatch(/^series-/);
  });
});

// ─── loadIntelligenceIndex / saveIntelligenceIndex ────────────────────────────

describe('loadIntelligenceIndex', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });
  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should return empty index if file not found', () => {
    const index = loadIntelligenceIndex(path.join(tempDir, 'nonexistent.json'));
    expect(index.articles).toEqual([]);
    expect(index.trends).toEqual([]);
  });

  it('should return empty index if file is malformed JSON', () => {
    const badPath = path.join(tempDir, 'bad.json');
    fs.writeFileSync(badPath, 'not-json', 'utf-8');
    const index = loadIntelligenceIndex(badPath);
    expect(index.articles).toEqual([]);
  });

  it('should normalize partial JSON (missing fields) to a complete index', () => {
    const partialPath = path.join(tempDir, 'partial.json');
    fs.writeFileSync(partialPath, JSON.stringify({ articles: [{ id: 'test' }] }), 'utf-8');
    const index = loadIntelligenceIndex(partialPath);
    // articles loaded from file
    expect(index.articles).toHaveLength(1);
    // missing lookup maps are rebuilt (empty here since the article has no topics/actors/procedures)
    expect(index.actors).toEqual({});
    expect(index.policyDomains).toEqual({});
    expect(index.procedures).toEqual({});
    expect(index.trends).toEqual([]);
    expect(index.series).toEqual([]);
    expect(typeof index.lastUpdated).toBe('string');
  });

  it('should rebuild lookup maps from articles when maps are missing', () => {
    const partialPath = path.join(tempDir, 'maps-missing.json');
    // Articles with topics/actors but no lookup maps in the persisted JSON
    fs.writeFileSync(
      partialPath,
      JSON.stringify({
        articles: [
          {
            id: 'a1',
            date: '2025-01-01',
            keyTopics: ['climate'],
            keyActors: ['EPP'],
            procedures: ['COD/2024/0001'],
          },
          {
            id: 'a2',
            date: '2025-02-01',
            keyTopics: ['climate', 'energy'],
            keyActors: [],
            procedures: [],
          },
        ],
      }),
      'utf-8'
    );
    const index = loadIntelligenceIndex(partialPath);
    // Lookup maps should be rebuilt from articles
    expect(index.policyDomains['climate']).toEqual(expect.arrayContaining(['a1', 'a2']));
    expect(index.policyDomains['energy']).toEqual(['a2']);
    expect(index.actors['EPP']).toEqual(['a1']);
    expect(index.procedures['COD/2024/0001']).toEqual(['a1']);
  });

  it('should normalize article entries missing required arrays', () => {
    const partialPath = path.join(tempDir, 'entry-partial.json');
    // Article entry with only id and date — all arrays are missing
    fs.writeFileSync(
      partialPath,
      JSON.stringify({ articles: [{ id: 'a1', date: '2025-01-01' }] }),
      'utf-8'
    );
    const index = loadIntelligenceIndex(partialPath);
    const entry = index.articles[0];
    expect(entry.id).toBe('a1');
    expect(entry.date).toBe('2025-01-01');
    expect(entry.keyTopics).toEqual([]);
    expect(entry.keyActors).toEqual([]);
    expect(entry.procedures).toEqual([]);
    expect(entry.crossReferences).toEqual([]);
    expect(entry.trendContributions).toEqual([]);
    expect(entry.lang).toBe('en'); // default
  });
});

describe('saveIntelligenceIndex + loadIntelligenceIndex (round-trip)', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });
  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should persist and reload an index correctly', () => {
    const indexPath = path.join(tempDir, 'intelligence-index.json');
    let index = createEmptyIndex();
    index = addArticleToIndex(index, makeEntry());

    saveIntelligenceIndex(index, indexPath);
    const loaded = loadIntelligenceIndex(indexPath);

    expect(loaded.articles).toHaveLength(1);
    expect(loaded.articles[0].id).toBe(index.articles[0].id);
    expect(loaded.actors).toEqual(index.actors);
    expect(loaded.policyDomains).toEqual(index.policyDomains);
    expect(loaded.procedures).toEqual(index.procedures);
  });

  it('should create parent directories if they do not exist', () => {
    const nestedPath = path.join(tempDir, 'sub', 'dir', 'index.json');
    saveIntelligenceIndex(createEmptyIndex(), nestedPath);
    expect(fs.existsSync(nestedPath)).toBe(true);
  });
});

// ─── buildRelatedArticlesHTML ─────────────────────────────────────────────────

describe('buildRelatedArticlesHTML', () => {
  const articleEntry = makeEntry({
    id: '2025-01-10-week-ahead-en',
    date: '2025-01-10',
    keyTopics: ['digital regulation'],
    keyActors: ['EPP'],
    type: 'week-ahead',
    lang: 'en',
  });

  const crossRef = {
    targetArticleId: '2025-01-10-week-ahead-en',
    relationship: 'follows_up',
    context: 'Shares 2 topic(s)',
    strength: 'moderate',
  };

  const trend = {
    id: 'trend-topic-digital-regulation',
    name: 'digital regulation trend',
    category: 'political',
    direction: 'emerging',
    firstSeen: '2025-01-01',
    lastUpdated: '2025-01-10',
    articleReferences: ['2025-01-10-week-ahead-en', '2025-01-15-week-ahead-en'],
    evidence: ['Topic covered in 2 articles'],
    confidence: 'low',
  };

  it('should return empty string when no related articles or trends', () => {
    const html = buildRelatedArticlesHTML([], [], []);
    expect(html).toBe('');
  });

  it('should generate a section element with aria-label', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [crossRef], []);
    expect(html).toContain('<section class="related-articles" aria-label="Related Analysis">');
  });

  it('should include rel="noopener noreferrer" on links', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [crossRef], []);
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('should include links to article HTML files', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [crossRef], []);
    expect(html).toContain('2025-01-10-week-ahead-en.html');
  });

  it('should render trend blocks when trends are provided', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [], [trend]);
    expect(html).toContain('emerging-trends');
    expect(html).toContain('digital regulation trend');
    expect(html).toContain('confidence');
    expect(html).toContain('low');
  });

  it('should include the article count in the trend description', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [], [trend]);
    // trend has 2 article references
    expect(html).toContain('2 ');
    expect(html).toContain('article tracking');
  });

  it('should show "Related" links when there are articles but no explicit cross-refs', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [], []);
    expect(html).toContain('Related:');
  });

  it('should escape HTML special characters in context', () => {
    const dangerousRef = {
      ...crossRef,
      context: '<script>alert("xss")</script>',
    };
    const html = buildRelatedArticlesHTML([articleEntry], [dangerousRef], []);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should localise UI strings when a non-English lang is passed', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [crossRef], [], 'fr');
    expect(html).toContain('aria-label="Analyse connexe"');
    expect(html).toContain('<h3>Analyse connexe</h3>');
    expect(html).toContain('Précédent:');
  });

  it('should localise trend labels for German', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [], [trend], 'de');
    expect(html).toContain('Aufkommender Trend');
    expect(html).toContain('Konfidenz');
  });

  it('should fall back to English for unknown language codes', () => {
    const html = buildRelatedArticlesHTML([articleEntry], [crossRef], [], 'xx');
    expect(html).toContain('aria-label="Related Analysis"');
    expect(html).toContain('Previous:');
  });
});
