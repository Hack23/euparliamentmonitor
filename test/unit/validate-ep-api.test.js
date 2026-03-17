// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for EP v2 API validation utility and direct fallback.
 * Tests data validation, API response parsing, and fallback behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateCommitteeEndpoint,
  validateEPAPI,
} from '../../scripts/utils/validate-ep-api.js';
import { fetchCommitteeInfoFromEPAPI } from '../../scripts/generators/pipeline/fetch-stage.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create a mock Response object */
function mockResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

/** Build a realistic EP v2 API response for a committee */
function makeEPCommitteeResponse(abbreviation, englishName) {
  return {
    data: [
      {
        id: `org/${abbreviation}`,
        type: 'Organization',
        identifier: abbreviation,
        label: abbreviation,
        prefLabel: { en: englishName, fr: `Comité ${abbreviation}` },
        altLabel: { en: abbreviation, fr: abbreviation },
        classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
        inverse_isVersionOf: ['org/101', 'org/202', 'org/303'],
      },
    ],
  };
}

/** Return a fresh CommitteeData-shaped object in placeholder state */
function placeholderData(abbreviation = 'TEST') {
  return {
    name: `${abbreviation} Committee`,
    abbreviation,
    chair: 'N/A',
    members: 0,
    documents: [],
    effectiveness: null,
  };
}

// ─── validateCommitteeEndpoint ────────────────────────────────────────────────

describe('validateCommitteeEndpoint', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return success=true when EP API returns valid committee data', async () => {
    const body = makeEPCommitteeResponse('ENVI', 'Committee on the Environment, Climate and Food Safety');
    fetch.mockResolvedValue(mockResponse(body));

    const result = await validateCommitteeEndpoint('ENVI');

    expect(result.success).toBe(true);
    expect(result.abbreviation).toBe('ENVI');
    expect(result.hasName).toBe(true);
    expect(result.hasLabel).toBe(true);
    expect(result.hasClassification).toBe(true);
    expect(result.name).toBe('Committee on the Environment, Climate and Food Safety');
    expect(result.error).toBeNull();
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should return success=false when EP API returns HTTP error', async () => {
    fetch.mockResolvedValue(mockResponse({}, 404));

    const result = await validateCommitteeEndpoint('INVALID');

    expect(result.success).toBe(false);
    expect(result.error).toBe('HTTP 404');
  });

  it('should return success=false when response has no data items', async () => {
    fetch.mockResolvedValue(mockResponse({ data: [] }));

    const result = await validateCommitteeEndpoint('EMPTY');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No data items in response');
  });

  it('should return success=false when fetch throws (e.g. timeout)', async () => {
    fetch.mockRejectedValue(new Error('Request timed out'));

    const result = await validateCommitteeEndpoint('TIMEOUT');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Request timed out');
  });

  it('should return success=false when data item has no prefLabel', async () => {
    fetch.mockResolvedValue(
      mockResponse({
        data: [{ id: 'org/X', label: 'X', classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING' }],
      })
    );

    const result = await validateCommitteeEndpoint('X');

    expect(result.success).toBe(false);
    expect(result.hasName).toBe(false);
    expect(result.hasLabel).toBe(true);
  });

  it('should use altLabel when prefLabel is missing', async () => {
    fetch.mockResolvedValue(
      mockResponse({
        data: [
          {
            id: 'org/ECON',
            label: 'ECON',
            altLabel: { en: 'Economic and Monetary Affairs' },
            classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
          },
        ],
      })
    );

    const result = await validateCommitteeEndpoint('ECON');

    expect(result.success).toBe(true);
    expect(result.name).toBe('Economic and Monetary Affairs');
  });
});

// ─── validateEPAPI ────────────────────────────────────────────────────────────

describe('validateEPAPI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate all committees and return summary', async () => {
    fetch.mockImplementation(async (url) => {
      const abbr = url.split('/corporate-bodies/')[1]?.split('?')[0] ?? '';
      return mockResponse(makeEPCommitteeResponse(abbr, `Committee ${abbr}`));
    });

    const summary = await validateEPAPI(['ENVI', 'ECON']);

    expect(summary.totalChecked).toBe(2);
    expect(summary.totalPassed).toBe(2);
    expect(summary.totalFailed).toBe(0);
    expect(summary.allValid).toBe(true);
    expect(summary.results).toHaveLength(2);
  });

  it('should report failures in summary', async () => {
    fetch.mockResolvedValue(mockResponse({}, 500));

    const summary = await validateEPAPI(['ENVI']);

    expect(summary.totalChecked).toBe(1);
    expect(summary.totalPassed).toBe(0);
    expect(summary.totalFailed).toBe(1);
    expect(summary.allValid).toBe(false);
  });

  it('should validate default committees when none specified', async () => {
    fetch.mockImplementation(async () =>
      mockResponse(makeEPCommitteeResponse('ENVI', 'Environment'))
    );

    const summary = await validateEPAPI();

    expect(summary.totalChecked).toBe(5); // ENVI, ECON, AFET, LIBE, AGRI
    expect(summary.apiBase).toContain('data.europarl.europa.eu');
  });
});

// ─── fetchCommitteeInfoFromEPAPI ──────────────────────────────────────────────

describe('fetchCommitteeInfoFromEPAPI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should populate committee data from EP v2 API response', async () => {
    const body = makeEPCommitteeResponse(
      'ENVI',
      'Committee on the Environment, Climate and Food Safety'
    );
    fetch.mockResolvedValue(mockResponse(body));

    const data = placeholderData('ENVI');
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.name).toBe('Committee on the Environment, Climate and Food Safety');
    expect(data.abbreviation).toBe('ENVI');
    expect(data.members).toBe(3); // inverse_isVersionOf has 3 items
  });

  it('should not overwrite existing non-placeholder members', async () => {
    const body = makeEPCommitteeResponse('ENVI', 'Environment');
    fetch.mockResolvedValue(mockResponse(body));

    const data = placeholderData('ENVI');
    data.members = 42;
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.members).toBe(42); // not overwritten
  });

  it('should handle HTTP error gracefully', async () => {
    fetch.mockResolvedValue(mockResponse({}, 503));

    const data = placeholderData('ENVI');
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.name).toBe('ENVI Committee'); // unchanged
  });

  it('should handle empty data array gracefully', async () => {
    fetch.mockResolvedValue(mockResponse({ data: [] }));

    const data = placeholderData('ENVI');
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.name).toBe('ENVI Committee'); // unchanged
  });

  it('should handle fetch error (network timeout) gracefully', async () => {
    fetch.mockRejectedValue(new Error('AbortError: signal timed out'));

    const data = placeholderData('ENVI');
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.name).toBe('ENVI Committee'); // unchanged
  });

  it('should not set abbreviation when label starts with org/', async () => {
    fetch.mockResolvedValue(
      mockResponse({
        data: [
          {
            id: 'org/ENVI',
            label: 'org/ENVI',
            prefLabel: { en: 'Environment' },
          },
        ],
      })
    );

    const data = placeholderData('ENVI');
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.abbreviation).toBe('ENVI'); // kept original, not 'org/ENVI'
  });

  it('should use altLabel when prefLabel is missing', async () => {
    fetch.mockResolvedValue(
      mockResponse({
        data: [
          {
            id: 'org/ECON',
            label: 'ECON',
            altLabel: { en: 'Economic and Monetary Affairs' },
          },
        ],
      })
    );

    const data = placeholderData('ECON');
    await fetchCommitteeInfoFromEPAPI('ECON', data);

    expect(data.name).toBe('Economic and Monetary Affairs');
    expect(data.abbreviation).toBe('ECON');
  });

  it('should fall back to label when both prefLabel and altLabel are missing', async () => {
    fetch.mockResolvedValue(
      mockResponse({
        data: [
          {
            id: 'org/LIBE',
            label: 'LIBE',
          },
        ],
      })
    );

    const data = placeholderData('LIBE');
    await fetchCommitteeInfoFromEPAPI('LIBE', data);

    expect(data.name).toBe('LIBE');
    expect(data.abbreviation).toBe('LIBE');
  });

  it('should handle response with no data property', async () => {
    fetch.mockResolvedValue(mockResponse({}));

    const data = placeholderData('ENVI');
    await fetchCommitteeInfoFromEPAPI('ENVI', data);

    expect(data.name).toBe('ENVI Committee'); // unchanged
  });
});
