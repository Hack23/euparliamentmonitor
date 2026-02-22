// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for week-ahead data aggregation
 * Tests parallel MCP data fetching and graceful degradation
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EuropeanParliamentMCPClient } from '../../scripts/mcp/ep-mcp-client.js';

describe('Week-Ahead Data Integration', () => {
  let client;
  let mockCallTool;

  beforeEach(() => {
    client = new EuropeanParliamentMCPClient();
    
    // Mock the callTool method
    mockCallTool = vi.spyOn(client, 'callTool');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (client?.connected) {
      client.disconnect();
    }
  });

  describe('Parallel Data Fetching', () => {
    it('should fetch all data sources in parallel using Promise.allSettled', async () => {
      // Mock successful responses for all tools
      mockCallTool.mockImplementation((toolName) => {
        switch (toolName) {
          case 'get_plenary_sessions':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"sessions": [{"date": "2024-01-15", "title": "Plenary Session", "type": "Plenary", "description": "Full session"}]}' }],
            });
          case 'get_committee_info':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"committees": [{"committee": "ENVI", "committeeName": "Environment Committee", "date": "2024-01-16"}]}' }],
            });
          case 'search_documents':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"documents": [{"title": "Climate Action Report", "type": "REPORT"}]}' }],
            });
          case 'monitor_legislative_pipeline':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"procedures": [{"title": "Green Deal Regulation", "stage": "Committee"}]}' }],
            });
          case 'get_parliamentary_questions':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"questions": [{"subject": "Climate Policy", "type": "WRITTEN"}]}' }],
            });
          default:
            return Promise.reject(new Error('Unknown tool'));
        }
      });

      const dateRange = { start: '2024-01-15', end: '2024-01-22' };

      // Simulate parallel fetching like fetchWeekAheadData does
      const [plenarySessions, committeeInfo, documents, pipeline, questions] =
        await Promise.allSettled([
          client.getPlenarySessions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 50 }),
          client.getCommitteeInfo({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.searchDocuments({ keyword: 'parliament', dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.monitorLegislativePipeline({ dateFrom: dateRange.start, dateTo: dateRange.end, status: 'ACTIVE', limit: 20 }),
          client.getParliamentaryQuestions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
        ]);

      // All should be fulfilled
      expect(plenarySessions.status).toBe('fulfilled');
      expect(committeeInfo.status).toBe('fulfilled');
      expect(documents.status).toBe('fulfilled');
      expect(pipeline.status).toBe('fulfilled');
      expect(questions.status).toBe('fulfilled');

      // Verify data structure
      const plenaryData = JSON.parse(plenarySessions.value.content[0].text);
      expect(plenaryData.sessions).toHaveLength(1);
      expect(plenaryData.sessions[0].title).toBe('Plenary Session');

      const committeeData = JSON.parse(committeeInfo.value.content[0].text);
      expect(committeeData.committees).toHaveLength(1);
      expect(committeeData.committees[0].committee).toBe('ENVI');

      const documentData = JSON.parse(documents.value.content[0].text);
      expect(documentData.documents).toHaveLength(1);
      expect(documentData.documents[0].title).toBe('Climate Action Report');

      const pipelineData = JSON.parse(pipeline.value.content[0].text);
      expect(pipelineData.procedures).toHaveLength(1);
      expect(pipelineData.procedures[0].title).toBe('Green Deal Regulation');

      const questionData = JSON.parse(questions.value.content[0].text);
      expect(questionData.questions).toHaveLength(1);
      expect(questionData.questions[0].subject).toBe('Climate Policy');
    });

    it('should handle partial failures gracefully', async () => {
      // Mock mixed success/failure responses
      mockCallTool.mockImplementation((toolName) => {
        switch (toolName) {
          case 'get_plenary_sessions':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"sessions": [{"date": "2024-01-15", "title": "Plenary Session", "type": "Plenary", "description": "Full session"}]}' }],
            });
          case 'get_committee_info':
            return Promise.reject(new Error('Committee API unavailable'));
          case 'search_documents':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"documents": [{"title": "Report", "type": "REPORT"}]}' }],
            });
          case 'monitor_legislative_pipeline':
            return Promise.reject(new Error('Pipeline API unavailable'));
          case 'get_parliamentary_questions':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"questions": []}' }],
            });
          default:
            return Promise.reject(new Error('Unknown tool'));
        }
      });

      const dateRange = { start: '2024-01-15', end: '2024-01-22' };

      const [plenarySessions, committeeInfo, documents, pipeline, questions] =
        await Promise.allSettled([
          client.getPlenarySessions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 50 }),
          client.getCommitteeInfo({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.searchDocuments({ keyword: 'parliament', dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.monitorLegislativePipeline({ dateFrom: dateRange.start, dateTo: dateRange.end, status: 'ACTIVE', limit: 20 }),
          client.getParliamentaryQuestions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
        ]);

      // Check statuses
      expect(plenarySessions.status).toBe('fulfilled');
      expect(committeeInfo.status).toBe('fulfilled'); // Method catches errors and returns fallback
      expect(documents.status).toBe('fulfilled');
      expect(pipeline.status).toBe('fulfilled'); // Method catches errors and returns fallback
      expect(questions.status).toBe('fulfilled');

      // Verify successful data
      const plenaryData = JSON.parse(plenarySessions.value.content[0].text);
      expect(plenaryData.sessions).toHaveLength(1);

      // Verify fallback data for failed requests
      const committeeData = JSON.parse(committeeInfo.value.content[0].text);
      expect(committeeData.committees).toEqual([]);

      const pipelineData = JSON.parse(pipeline.value.content[0].text);
      expect(pipelineData.procedures).toEqual([]);
    });
  });

  describe('Data Aggregation', () => {
    it('should aggregate data from multiple sources', async () => {
      mockCallTool.mockImplementation((toolName) => {
        switch (toolName) {
          case 'get_plenary_sessions':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"sessions": [{"date": "2024-01-15", "title": "Session 1", "type": "Plenary", "description": "Desc 1"}, {"date": "2024-01-16", "title": "Session 2", "type": "Plenary", "description": "Desc 2"}]}' }],
            });
          case 'get_committee_info':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"committees": [{"committee": "ENVI", "date": "2024-01-17"}, {"committee": "ECON", "date": "2024-01-18"}]}' }],
            });
          case 'search_documents':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"documents": [{"title": "Doc 1"}, {"title": "Doc 2"}, {"title": "Doc 3"}]}' }],
            });
          case 'monitor_legislative_pipeline':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"procedures": [{"title": "Proc 1"}]}' }],
            });
          case 'get_parliamentary_questions':
            return Promise.resolve({
              content: [{ type: 'text', text: '{"questions": [{"subject": "Q1"}, {"subject": "Q2"}]}' }],
            });
          default:
            return Promise.reject(new Error('Unknown tool'));
        }
      });

      const dateRange = { start: '2024-01-15', end: '2024-01-22' };

      const [plenarySessions, committeeInfo, documents, pipeline, questions] =
        await Promise.allSettled([
          client.getPlenarySessions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 50 }),
          client.getCommitteeInfo({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.searchDocuments({ keyword: 'parliament', dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.monitorLegislativePipeline({ dateFrom: dateRange.start, dateTo: dateRange.end, status: 'ACTIVE', limit: 20 }),
          client.getParliamentaryQuestions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
        ]);

      // Count total items across all sources
      const plenaryData = JSON.parse(plenarySessions.value.content[0].text);
      const committeeData = JSON.parse(committeeInfo.value.content[0].text);
      const documentData = JSON.parse(documents.value.content[0].text);
      const pipelineData = JSON.parse(pipeline.value.content[0].text);
      const questionData = JSON.parse(questions.value.content[0].text);

      const totalItems =
        plenaryData.sessions.length +
        committeeData.committees.length +
        documentData.documents.length +
        pipelineData.procedures.length +
        questionData.questions.length;

      expect(totalItems).toBe(10); // 2 + 2 + 3 + 1 + 2
    });
  });

  describe('Fallback Behavior', () => {
    it('should provide fallback when all MCP tools fail', async () => {
      mockCallTool.mockRejectedValue(new Error('MCP unavailable'));

      const dateRange = { start: '2024-01-15', end: '2024-01-22' };

      const [plenarySessions, committeeInfo, documents, pipeline, questions] =
        await Promise.allSettled([
          client.getPlenarySessions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 50 }),
          client.getCommitteeInfo({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.searchDocuments({ keyword: 'parliament', dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
          client.monitorLegislativePipeline({ dateFrom: dateRange.start, dateTo: dateRange.end, status: 'ACTIVE', limit: 20 }),
          client.getParliamentaryQuestions({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
        ]);

      // All should be fulfilled with fallback data
      expect(plenarySessions.status).toBe('fulfilled');
      expect(committeeInfo.status).toBe('fulfilled');
      expect(documents.status).toBe('fulfilled');
      expect(pipeline.status).toBe('fulfilled');
      expect(questions.status).toBe('fulfilled');

      // Verify fallback structure
      const plenaryData = JSON.parse(plenarySessions.value.content[0].text);
      expect(plenaryData.sessions).toEqual([]);

      const committeeData = JSON.parse(committeeInfo.value.content[0].text);
      expect(committeeData.committees).toEqual([]);

      const documentData = JSON.parse(documents.value.content[0].text);
      expect(documentData.documents).toEqual([]);

      const pipelineData = JSON.parse(pipeline.value.content[0].text);
      expect(pipelineData.procedures).toEqual([]);

      const questionData = JSON.parse(questions.value.content[0].text);
      expect(questionData.questions).toEqual([]);
    });
  });
});
