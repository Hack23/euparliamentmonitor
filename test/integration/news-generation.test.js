// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for full news generation flow
 * Tests end-to-end article generation with placeholder content
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateArticleHTML } from '../../scripts/article-template.js';
import { createTempDir, cleanupTempDir, validateHTML, extractHTMLMetadata, writeFile } from '../helpers/test-utils.js';
import { mockArticleMetadata, mockArticleContent, mockSources } from '../fixtures/ep-data.js';

describe('News Generation Integration', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Full Article Generation Flow', () => {
    it('should generate complete article from start to finish', () => {
      // Arrange: Prepare article data
      const articleOptions = {
        ...mockArticleMetadata,
        content: mockArticleContent,
        sources: mockSources,
      };

      // Act: Generate HTML
      const html = generateArticleHTML(articleOptions);

      // Assert: Validate output
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(0);

      const validation = validateHTML(html);
      expect(validation.valid).toBe(true);
    });

    it('should generate and save article to filesystem', () => {
      // Arrange
      const newsDir = path.join(tempDir, 'news');

      const articleOptions = {
        slug: 'week-ahead-test',
        title: 'Test Week Ahead',
        subtitle: 'Test subtitle',
        date: '2025-01-15',
        type: 'prospective',
        readTime: 5,
        lang: 'en',
        content: '<p>Test content</p>',
        keywords: ['test'],
        sources: [],
      };

      // Act: Generate and save using writeFile helper
      const html = generateArticleHTML(articleOptions);
      const filename = `${articleOptions.date}-${articleOptions.slug}-${articleOptions.lang}.html`;
      const filepath = path.join(newsDir, filename);
      
      // Use writeFile helper which automatically creates directories
      writeFile(filepath, html);

      // Assert: Verify file exists and is valid
      expect(fs.existsSync(filepath)).toBe(true);
      
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(html);
      
      const validation = validateHTML(savedContent);
      expect(validation.valid).toBe(true);
    });

    it('should generate articles for multiple languages', () => {
      const languages = ['en', 'de', 'fr', 'es'];
      const newsDir = path.join(tempDir, 'news');
      const expectedFiles = [];

      languages.forEach((lang) => {
        // Arrange
        const articleOptions = {
          slug: 'multi-lang-test',
          title: 'Multi-language Test',
          subtitle: 'Testing multi-language support',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang,
          content: '<p>Test content</p>',
          keywords: ['test'],
          sources: [],
        };

        // Act: Generate and save using writeFile helper
        const html = generateArticleHTML(articleOptions);
        const filename = `${articleOptions.date}-${articleOptions.slug}-${lang}.html`;
        const filepath = path.join(newsDir, filename);
        expectedFiles.push(filename);
        writeFile(filepath, html);

        // Assert
        expect(fs.existsSync(filepath)).toBe(true);
        
        const metadata = extractHTMLMetadata(html);
        expect(metadata.lang).toBe(lang);
      });

      // Verify all expected files exist
      const files = fs.readdirSync(newsDir);
      expectedFiles.forEach((expectedFile) => {
        expect(files).toContain(expectedFile);
      });
      // Verify we created the expected number of files (4 languages)
      expect(expectedFiles).toHaveLength(4);
    });
  });

  describe('Article Metadata Generation', () => {
    it('should generate metadata file alongside article', () => {
      const newsDir = path.join(tempDir, 'news');
      const metadataDir = path.join(newsDir, 'metadata');

      const articleOptions = {
        slug: 'metadata-test',
        title: 'Metadata Test',
        subtitle: 'Testing metadata generation',
        date: '2025-01-15',
        type: 'prospective',
        readTime: 5,
        lang: 'en',
        content: '<p>Test content</p>',
        keywords: ['test', 'metadata'],
        sources: mockSources,
      };

      // Generate article using writeFile helper
      const html = generateArticleHTML(articleOptions);
      const articleFilename = `${articleOptions.date}-${articleOptions.slug}-${articleOptions.lang}.html`;
      const articleFilepath = path.join(newsDir, articleFilename);
      writeFile(articleFilepath, html);

      // Generate metadata using writeFile helper
      const metadata = {
        ...articleOptions,
        generatedAt: new Date().toISOString(),
        filename: articleFilename,
      };
      const metadataFilename = `${articleOptions.date}-${articleOptions.slug}-${articleOptions.lang}.json`;
      const metadataFilepath = path.join(metadataDir, metadataFilename);
      writeFile(metadataFilepath, JSON.stringify(metadata, null, 2));

      // Assert
      expect(fs.existsSync(articleFilepath)).toBe(true);
      expect(fs.existsSync(metadataFilepath)).toBe(true);

      const savedMetadata = JSON.parse(fs.readFileSync(metadataFilepath, 'utf-8'));
      expect(savedMetadata.slug).toBe(articleOptions.slug);
      expect(savedMetadata.lang).toBe(articleOptions.lang);
      expect(savedMetadata.keywords).toContain('test');
    });
  });

  describe('Article Content Validation', () => {
    it('should generate article with all required sections', () => {
      const articleOptions = {
        ...mockArticleMetadata,
        content: `
          <section class="article-content">
            <h2>Introduction</h2>
            <p>Introduction paragraph</p>
            
            <h3>Key Points</h3>
            <ul>
              <li>Point 1</li>
              <li>Point 2</li>
            </ul>
            
            <h3>Analysis</h3>
            <p>Analysis paragraph</p>
            
            <h2>Conclusion</h2>
            <p>Conclusion paragraph</p>
          </section>
        `,
        sources: mockSources,
      };

      const html = generateArticleHTML(articleOptions);

      // Assert: Check for all sections
      expect(html).toContain('<h2>Introduction</h2>');
      expect(html).toContain('<h3>Key Points</h3>');
      expect(html).toContain('<h3>Analysis</h3>');
      expect(html).toContain('<h2>Conclusion</h2>');
      expect(html).toContain('<section class="article-sources">');
    });

    it('should properly format dates across all sections', () => {
      const testDate = '2025-01-15';
      const articleOptions = {
        ...mockArticleMetadata,
        date: testDate,
        content: mockArticleContent,
      };

      const html = generateArticleHTML(articleOptions);

      // Check meta tag
      expect(html).toContain(`<meta name="date" content="${testDate}">`);
      
      // Check structured data
      expect(html).toContain(`"datePublished": "${testDate}"`);
    });
  });

  describe('Placeholder Content Mode', () => {
    it('should generate article with placeholder when MCP unavailable', () => {
      const articleOptions = {
        slug: 'placeholder-test',
        title: 'Week Ahead: Placeholder Content',
        subtitle: 'This article uses placeholder content while MCP server is unavailable',
        date: '2025-01-15',
        type: 'prospective',
        readTime: 3,
        lang: 'en',
        content: `
          <section class="article-content">
            <div class="notice">
              <p><strong>Note:</strong> This is placeholder content generated while the European Parliament MCP Server is unavailable.</p>
            </div>
            <h2>Upcoming Parliamentary Activities</h2>
            <p>The European Parliament will convene this week for important sessions and debates.</p>
          </section>
        `,
        keywords: ['parliament', 'placeholder'],
        sources: [],
      };

      const html = generateArticleHTML(articleOptions);

      expect(html).toContain('placeholder content');
      expect(html).toContain('MCP Server is unavailable');
      
      const validation = validateHTML(html);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should handle missing optional fields gracefully', () => {
      const minimalOptions = {
        slug: 'minimal-test',
        title: 'Minimal Article',
        subtitle: 'Testing minimal configuration',
        date: '2025-01-15',
        type: 'prospective',
        readTime: 2,
        lang: 'en',
        content: '<p>Minimal content</p>',
        // No keywords, no sources
      };

      const html = generateArticleHTML(minimalOptions);

      expect(html).toBeTruthy();
      
      const validation = validateHTML(html);
      expect(validation.valid).toBe(true);
      
      // Should not include sources section
      expect(html).not.toContain('<section class="article-sources">');
    });

    it('should continue generation if one article fails', () => {
      const newsDir = path.join(tempDir, 'news');

      const articles = [
        { slug: 'article-1', lang: 'en' },
        { slug: 'article-2', lang: 'de' },
        { slug: 'article-3', lang: 'fr' },
      ];

      const successCount = articles.reduce((count, article) => {
        try {
          const articleOptions = {
            ...article,
            title: `Test ${article.slug}`,
            subtitle: 'Test subtitle',
            date: '2025-01-15',
            type: 'prospective',
            readTime: 5,
            content: '<p>Content</p>',
          };

          const html = generateArticleHTML(articleOptions);
          const filename = `${articleOptions.date}-${article.slug}-${article.lang}.html`;
          writeFile(path.join(newsDir, filename), html);
          return count + 1;
        } catch (error) {
          console.error(`Failed to generate ${article.slug}:`, error);
          return count;
        }
      }, 0);

      // All articles should succeed
      expect(successCount).toBe(3);
      
      const files = fs.readdirSync(newsDir);
      expect(files).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('should generate article in reasonable time', () => {
      const startTime = Date.now();

      const html = generateArticleHTML({
        ...mockArticleMetadata,
        content: mockArticleContent,
        sources: mockSources,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(html).toBeTruthy();
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle batch generation efficiently', () => {
      const startTime = Date.now();
      const count = 50;

      for (let i = 0; i < count; i++) {
        generateArticleHTML({
          slug: `article-${i}`,
          title: `Article ${i}`,
          subtitle: 'Test',
          date: '2025-01-15',
          type: 'prospective',
          readTime: 5,
          lang: 'en',
          content: '<p>Content</p>',
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 50 articles in less than 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('File System Integration', () => {
    it('should create proper directory structure', () => {
      const newsDir = path.join(tempDir, 'news');
      const metadataDir = path.join(newsDir, 'metadata');

      // Create directories by writing a file (writeFile will create them)
      writeFile(path.join(metadataDir, 'test.txt'), 'test');

      expect(fs.existsSync(newsDir)).toBe(true);
      expect(fs.existsSync(metadataDir)).toBe(true);

      const newsDirStat = fs.statSync(newsDir);
      expect(newsDirStat.isDirectory()).toBe(true);
    });

    it('should handle existing files correctly', () => {
      const newsDir = path.join(tempDir, 'news');

      const filename = '2025-01-15-test-article-en.html';
      const filepath = path.join(newsDir, filename);

      // Create initial file
      const html1 = generateArticleHTML({
        slug: 'test-article',
        title: 'Test Article v1',
        subtitle: 'Version 1',
        date: '2025-01-15',
        type: 'prospective',
        readTime: 5,
        lang: 'en',
        content: '<p>Version 1</p>',
      });
      writeFile(filepath, html1);

      // Overwrite with updated version
      const html2 = generateArticleHTML({
        slug: 'test-article',
        title: 'Test Article v2',
        subtitle: 'Version 2',
        date: '2025-01-15',
        type: 'prospective',
        readTime: 5,
        lang: 'en',
        content: '<p>Version 2</p>',
      });
      writeFile(filepath, html2);

      // Verify latest version is saved
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toContain('Version 2');
      expect(savedContent).not.toContain('Version 1');
    });
  });
});
