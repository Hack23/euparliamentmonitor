// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for committee reports helper functions
 * Tests MCP payload parsing, type coercion, and graceful degradation
 */

import { describe, it, expect } from 'vitest';
import {
  applyCommitteeInfo,
  applyDocuments,
  applyEffectiveness,
} from '../../scripts/generators/news-enhanced.js';
import { isPlaceholderCommitteeData } from '../../scripts/generators/committee-helpers.js';

/**
 * Build a minimal MCPToolResult from a plain object
 * @param {object} payload
 * @returns {{ content: Array<{ type: string, text: string }> }}
 */
function mcpResult(payload) {
  return { content: [{ type: 'text', text: JSON.stringify(payload) }] };
}

/** Return a fresh CommitteeData-shaped object */
function defaultData() {
  return {
    name: 'TEST Committee',
    abbreviation: 'TEST',
    chair: 'N/A',
    members: 0,
    documents: [],
    effectiveness: null,
  };
}

describe('committee-reports helpers', () => {
  describe('applyCommitteeInfo', () => {
    it('should populate name, chair and members from MCP response', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ committee: { name: 'Environment', abbreviation: 'ENVI', chair: 'Jane Doe', memberCount: 42 } }),
        data,
        'ENVI'
      );
      expect(data.name).toBe('Environment');
      expect(data.chair).toBe('Jane Doe');
      expect(data.members).toBe(42);
    });

    it('should coerce string memberCount to number', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ committee: { memberCount: '27' } }),
        data,
        'TEST'
      );
      expect(data.members).toBe(27);
    });

    it('should default members to 0 for non-numeric memberCount', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ committee: { memberCount: 'unknown' } }),
        data,
        'TEST'
      );
      expect(data.members).toBe(0);
    });

    it('should leave data unchanged when committee key is absent', () => {
      const data = defaultData();
      applyCommitteeInfo(mcpResult({ other: {} }), data, 'TEST');
      expect(data.name).toBe('TEST Committee');
      expect(data.members).toBe(0);
    });

    it('should degrade gracefully on invalid JSON', () => {
      const data = defaultData();
      applyCommitteeInfo({ content: [{ type: 'text', text: 'not-json' }] }, data, 'TEST');
      expect(data.name).toBe('TEST Committee');
    });

    it('should degrade gracefully on empty result', () => {
      const data = defaultData();
      applyCommitteeInfo({ content: [] }, data, 'TEST');
      expect(data.name).toBe('TEST Committee');
    });

    it('should populate data from flat EP MCP response format (no committee wrapper)', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ name: 'ENVI Committee', abbreviation: 'ENVI', chair: 'Alice Smith', memberCount: 88 }),
        data,
        'ENVI'
      );
      expect(data.name).toBe('ENVI Committee');
      expect(data.chair).toBe('Alice Smith');
      expect(data.members).toBe(88);
      expect(data.abbreviation).toBe('ENVI');
    });

    it('should fall back to parameter abbreviation when response has org/-prefixed abbreviation', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ name: 'ENVI Committee', abbreviation: 'org/ENVI', chair: 'Alice Smith' }),
        data,
        'ENVI'
      );
      expect(data.abbreviation).toBe('ENVI');
    });

    it('should compute memberCount from members array length in flat format', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ name: 'ENVI Committee', members: [{ id: 1 }, { id: 2 }, { id: 3 }] }),
        data,
        'ENVI'
      );
      expect(data.members).toBe(3);
    });

    it('should set chair to PLACEHOLDER_CHAIR when flat format has empty chair string', () => {
      const data = defaultData();
      applyCommitteeInfo(
        mcpResult({ name: 'ENVI Committee', chair: '', members: [] }),
        data,
        'ENVI'
      );
      expect(data.chair).toBe('N/A');
    });

    it('should ignore flat format when both name and abbreviation are absent', () => {
      const data = defaultData();
      applyCommitteeInfo(mcpResult({ chair: 'Alice' }), data, 'TEST');
      expect(data.name).toBe('TEST Committee');
      expect(data.chair).toBe('N/A');
    });
  });

  describe('applyDocuments', () => {
    it('should map documents using d.type field', () => {
      const data = defaultData();
      applyDocuments(
        mcpResult({
          documents: [
            { title: 'Climate Report', type: 'REPORT', date: '2025-01-01' },
          ],
        }),
        data
      );
      expect(data.documents).toHaveLength(1);
      expect(data.documents[0].type).toBe('REPORT');
      expect(data.documents[0].title).toBe('Climate Report');
      expect(data.documents[0].date).toBe('2025-01-01');
    });

    it('should fall back to documentType when type is absent', () => {
      const data = defaultData();
      applyDocuments(
        mcpResult({
          documents: [{ title: 'Resolution', documentType: 'RESOLUTION' }],
        }),
        data
      );
      expect(data.documents[0].type).toBe('RESOLUTION');
    });

    it('should use "Document" when both type and documentType are absent', () => {
      const data = defaultData();
      applyDocuments(mcpResult({ documents: [{ title: 'Unnamed' }] }), data);
      expect(data.documents[0].type).toBe('Document');
    });

    it('should leave documents empty when response has no documents array', () => {
      const data = defaultData();
      applyDocuments(mcpResult({ other: [] }), data);
      expect(data.documents).toHaveLength(0);
    });

    it('should degrade gracefully on invalid JSON', () => {
      const data = defaultData();
      applyDocuments({ content: [{ type: 'text', text: '{bad json' }] }, data);
      expect(data.documents).toHaveLength(0);
    });

    it('should populate documents from EP MCP data[] response format', () => {
      const data = defaultData();
      applyDocuments(
        mcpResult({
          data: [
            { title: 'Green Deal Report', type: 'Report' },
            { title: 'Budget Resolution', type: 'Resolution' },
          ],
        }),
        data
      );
      expect(data.documents).toHaveLength(2);
      expect(data.documents[0].title).toBe('Green Deal Report');
      expect(data.documents[0].type).toBe('Report');
      expect(data.documents[1].title).toBe('Budget Resolution');
    });
  });

  describe('applyEffectiveness', () => {
    it('should format effectiveness score as string', () => {
      const data = defaultData();
      applyEffectiveness(
        mcpResult({ effectiveness: { overallScore: 7.456, rank: 'Top 10%' } }),
        data
      );
      expect(data.effectiveness).toBe('Score: 7.5 Top 10%');
    });

    it('should trim trailing whitespace when rank is empty', () => {
      const data = defaultData();
      applyEffectiveness(mcpResult({ effectiveness: { overallScore: 5.0, rank: '' } }), data);
      expect(data.effectiveness).toBe('Score: 5.0');
    });

    it('should set effectiveness to null for non-number score', () => {
      const data = defaultData();
      applyEffectiveness(mcpResult({ effectiveness: { overallScore: 'high' } }), data);
      expect(data.effectiveness).toBeNull();
    });

    it('should set effectiveness to null for NaN score', () => {
      const data = defaultData();
      applyEffectiveness(mcpResult({ effectiveness: { overallScore: NaN } }), data);
      expect(data.effectiveness).toBeNull();
    });

    it('should leave effectiveness null when effectiveness key is absent', () => {
      const data = defaultData();
      applyEffectiveness(mcpResult({ other: {} }), data);
      expect(data.effectiveness).toBeNull();
    });

    it('should degrade gracefully on invalid JSON', () => {
      const data = defaultData();
      applyEffectiveness({ content: [{ type: 'text', text: 'not-json' }] }, data);
      expect(data.effectiveness).toBeNull();
    });
  });
});

describe('isPlaceholderCommitteeData', () => {
  it('returns true when all committees have chair=N/A, members=0, docs=[]', () => {
    const placeholder = [defaultData(), defaultData()];
    expect(isPlaceholderCommitteeData(placeholder)).toBe(true);
  });

  it('returns false for an empty array', () => {
    expect(isPlaceholderCommitteeData([])).toBe(false);
  });

  it('returns false when at least one committee has a real chair', () => {
    const mixed = [defaultData(), { ...defaultData(), chair: 'Jane Doe' }];
    expect(isPlaceholderCommitteeData(mixed)).toBe(false);
  });

  it('returns false when at least one committee has members > 0', () => {
    const mixed = [defaultData(), { ...defaultData(), members: 42 }];
    expect(isPlaceholderCommitteeData(mixed)).toBe(false);
  });

  it('returns false when at least one committee has documents', () => {
    const mixed = [
      defaultData(),
      { ...defaultData(), documents: [{ title: 'Test', type: 'Report', date: '2026-01-01' }] },
    ];
    expect(isPlaceholderCommitteeData(mixed)).toBe(false);
  });

  it('returns false for a single committee with real data', () => {
    const real = [{ ...defaultData(), chair: 'Carlos Tavares', members: 60 }];
    expect(isPlaceholderCommitteeData(real)).toBe(false);
  });
});
