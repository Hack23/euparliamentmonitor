// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for MCP integration
 * Tests MCP client with mock server and data flow
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMockMCPClient } from '../helpers/mock-mcp-server.js';
import { generateArticleHTML } from '../../scripts/templates/article-template.js';
import { mockPlenarySession } from '../fixtures/ep-data.js';

describe('MCP Integration', () => {
  let mcpClient;

  beforeEach(async () => {
    mcpClient = createMockMCPClient();
    await mcpClient.connect();
  });

  afterEach(() => {
    if (mcpClient) {
      mcpClient.disconnect();
    }
  });

  describe('MCP Client Connection', () => {
    it('should connect to mock MCP server', async () => {
      expect(mcpClient.connected).toBe(true);
    });

    it('should handle connection failure gracefully', async () => {
      const failingClient = createMockMCPClient();
      failingClient.setFailure(true, 'Connection refused');

      await expect(failingClient.connect()).rejects.toThrow('Connection refused');
    });

    it('should disconnect cleanly', () => {
      mcpClient.disconnect();
      expect(mcpClient.connected).toBe(false);
    });
  });

  describe('Data Retrieval from MCP Server', () => {
    it('should fetch plenary sessions', async () => {
      const result = await mcpClient.getPlenarySessions({
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      expect(result).toBeTruthy();
      expect(result.content).toBeDefined();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.sessions).toBeDefined();
      expect(data.sessions[0].id).toBe(mockPlenarySession.id);
    });

    it('should fetch parliamentary questions', async () => {
      const result = await mcpClient.getParliamentaryQuestions({
        type: 'written',
        limit: 10,
      });

      expect(result).toBeTruthy();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.questions).toBeDefined();
      expect(data.questions.length).toBeGreaterThan(0);
    });

    it('should search documents', async () => {
      const result = await mcpClient.searchDocuments({
        query: 'climate',
        type: 'proposal',
      });

      expect(result).toBeTruthy();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.documents).toBeDefined();
      expect(data.documents.length).toBeGreaterThan(0);
    });

    it('should fetch MEPs', async () => {
      const result = await mcpClient.getMEPs({
        country: 'DE',
        limit: 10,
      });

      expect(result).toBeTruthy();
      
      const data = JSON.parse(result.content[0].text);
      expect(data.meps).toBeDefined();
      expect(data.meps.length).toBeGreaterThan(0);
    });
  });

  describe('Article Generation with MCP Data', () => {
    it('should generate article from plenary session data', async () => {
      // Fetch data from MCP
      const sessionResult = await mcpClient.getPlenarySessions();
      const sessionData = JSON.parse(sessionResult.content[0].text);
      const session = sessionData.sessions[0];

      // Generate article content from MCP data
      const articleContent = `
        <section class="article-content">
          <h2>Plenary Session: ${session.date}</h2>
          <p><strong>Location:</strong> ${session.location}</p>
          
          <h3>Agenda</h3>
          <ul>
            ${session.agenda.map((item) => `<li>${item.title} (${item.type})</li>`).join('')}
          </ul>
        </section>
      `;

      // Generate article
      const articleOptions = {
        slug: 'plenary-session-january',
        title: session.title,
        subtitle: `Parliamentary session in ${session.location}`,
        date: session.date,
        category: 'week-ahead',
        readTime: 5,
        lang: 'en',
        content: articleContent,
        keywords: ['plenary', 'session', 'parliament'],
        sources: [],
      };

      const html = generateArticleHTML(articleOptions);

      expect(html).toBeTruthy();
      expect(html).toContain(session.title);
      expect(html).toContain(session.location);
      expect(html).toContain(session.agenda[0].title);
    });

    it('should generate article from parliamentary questions', async () => {
      // Fetch questions
      const questionsResult = await mcpClient.getParliamentaryQuestions();
      const questionsData = JSON.parse(questionsResult.content[0].text);
      const questions = questionsData.questions;

      // Generate article content
      const articleContent = `
        <section class="article-content">
          <h2>Recent Parliamentary Questions</h2>
          ${questions.map((q) => `
            <article class="question">
              <h3>${q.subject}</h3>
              <p><strong>By:</strong> ${q.author} (${q.group}, ${q.country})</p>
              <p><strong>Type:</strong> ${q.type}</p>
              <p>${q.text}</p>
            </article>
          `).join('')}
        </section>
      `;

      const articleOptions = {
        slug: 'parliamentary-questions-january',
        title: 'Recent Parliamentary Questions',
        subtitle: 'Latest questions from MEPs',
        date: '2025-01-15',
        category: 'motions',
        readTime: 7,
        lang: 'en',
        content: articleContent,
        keywords: ['questions', 'MEPs', 'parliament'],
        sources: [],
      };

      const html = generateArticleHTML(articleOptions);

      expect(html).toBeTruthy();
      expect(html).toContain(questions[0].subject);
      expect(html).toContain(questions[0].author);
    });

    it('should generate article from legislative documents', async () => {
      // Fetch documents
      const docsResult = await mcpClient.searchDocuments({ query: 'regulation' });
      const docsData = JSON.parse(docsResult.content[0].text);
      const documents = docsData.documents;

      // Generate article content
      const articleContent = `
        <section class="article-content">
          <h2>Legislative Documents Update</h2>
          ${documents.map((doc) => `
            <article class="document">
              <h3>${doc.title}</h3>
              <p><strong>Document ID:</strong> ${doc.id}</p>
              <p><strong>Type:</strong> ${doc.type}</p>
              <p><strong>Committee:</strong> ${doc.committee}</p>
              <p><strong>Status:</strong> ${doc.status}</p>
            </article>
          `).join('')}
        </section>
      `;

      const articleOptions = {
        slug: 'legislative-documents-january',
        title: 'Legislative Documents Update',
        subtitle: 'Recent proposals and reports',
        date: '2025-01-15',
        category: 'motions',
        readTime: 6,
        lang: 'en',
        content: articleContent,
        keywords: ['legislation', 'documents', 'proposals'],
        sources: [],
      };

      const html = generateArticleHTML(articleOptions);

      expect(html).toBeTruthy();
      expect(html).toContain(documents[0].title);
      expect(html).toContain(documents[0].id);
    });
  });

  describe('Fallback Mode', () => {
    it('should generate placeholder article when MCP unavailable', async () => {
      // Simulate MCP failure
      mcpClient.setFailure(true, 'MCP server unavailable');
      mcpClient.disconnect();

      // Generate article without MCP data
      const articleOptions = {
        slug: 'week-ahead-fallback',
        title: 'Week Ahead: Parliamentary Activities',
        subtitle: 'Placeholder content - MCP server unavailable',
        date: '2025-01-15',
        category: 'week-ahead',
        readTime: 3,
        lang: 'en',
        content: `
          <section class="article-content">
            <div class="notice">
              <p><strong>Note:</strong> This article contains placeholder content as the European Parliament MCP Server is currently unavailable.</p>
            </div>
            <h2>Upcoming Activities</h2>
            <p>The European Parliament will convene for important sessions this week.</p>
          </section>
        `,
        keywords: ['parliament', 'placeholder'],
        sources: [],
      };

      const html = generateArticleHTML(articleOptions);

      expect(html).toBeTruthy();
      expect(html).toContain('placeholder content');
      expect(html).toContain('MCP Server is currently unavailable');
    });

    it('should handle partial MCP failure gracefully', async () => {
      // Mock one endpoint failing
      const originalGetSessions = mcpClient.getPlenarySessions;
      mcpClient.getPlenarySessions = vi.fn().mockRejectedValue(new Error('Endpoint unavailable'));

      // Should still be able to get other data
      const questionsResult = await mcpClient.getParliamentaryQuestions();
      expect(questionsResult).toBeTruthy();

      // Restore
      mcpClient.getPlenarySessions = originalGetSessions;
    });
  });

  describe('Data Transformation', () => {
    it('should transform MCP data for multi-language articles', async () => {
      const sessionResult = await mcpClient.getPlenarySessions();
      const sessionData = JSON.parse(sessionResult.content[0].text);
      const session = sessionData.sessions[0];

      // Generate for multiple languages
      const languages = ['en', 'de', 'fr'];
      
      languages.forEach((lang) => {
        const articleContent = `
          <section class="article-content">
            <h2>${session.title}</h2>
            <p>${session.location}</p>
          </section>
        `;

        const articleOptions = {
          slug: 'multi-lang-mcp-test',
          title: session.title,
          subtitle: session.location,
          date: session.date,
          category: 'week-ahead',
          readTime: 5,
          lang,
          content: articleContent,
        };

        const html = generateArticleHTML(articleOptions);

        expect(html).toBeTruthy();
        expect(html).toContain(`lang="${lang}"`);
      });
    });

    it('should handle empty MCP responses', async () => {
      // Mock empty response
      mcpClient.getPlenarySessions = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '{"sessions": []}' }],
      });

      const result = await mcpClient.getPlenarySessions();
      const data = JSON.parse(result.content[0].text);

      expect(data.sessions).toEqual([]);
    });
  });

  describe('Request Tracking', () => {
    it('should track all MCP requests', async () => {
      mcpClient.clearRequests();

      await mcpClient.getPlenarySessions();
      await mcpClient.getParliamentaryQuestions();
      await mcpClient.searchDocuments({ query: 'test' });

      const requests = mcpClient.getRequests();

      expect(requests.length).toBe(3);
      expect(requests[0].method).toBe('tools/call');
      expect(requests[0].params.name).toBe('get_plenary_sessions');
    });

    it('should clear request history', async () => {
      await mcpClient.getPlenarySessions();
      
      let requests = mcpClient.getRequests();
      expect(requests.length).toBeGreaterThan(0);

      mcpClient.clearRequests();
      
      requests = mcpClient.getRequests();
      expect(requests.length).toBe(0);
    });
  });

  describe('Error Handling in Integration', () => {
    it('should handle malformed MCP responses', async () => {
      mcpClient.getPlenarySessions = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'invalid json' }],
      });

      await expect(async () => {
        const result = await mcpClient.getPlenarySessions();
        JSON.parse(result.content[0].text);
      }).rejects.toThrow();
    });

    it('should handle network timeout', async () => {
      mcpClient.sendRequest = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      await expect(mcpClient.sendRequest('test')).rejects.toThrow('Request timeout');
    });

    it('should retry failed requests', async () => {
      let callCount = 0;
      mcpClient.sendRequest = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ success: true });
      });

      // Implement retry logic
      const maxRetries = 3;
      let result;
      for (let i = 0; i < maxRetries; i++) {
        try {
          result = await mcpClient.sendRequest('test');
          break;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      expect(result).toEqual({ success: true });
      expect(callCount).toBe(3);
    });
  });

  describe('Performance', () => {
    it('should retrieve data efficiently', async () => {
      const startTime = Date.now();

      await Promise.all([
        mcpClient.getPlenarySessions(),
        mcpClient.getParliamentaryQuestions(),
        mcpClient.searchDocuments({ query: 'test' }),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 1 second (mock server)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => 
        mcpClient.getPlenarySessions()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toBeTruthy();
      });
    });
  });
});
