// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { buildSwotSection, buildMultiDimensionalSwotSection } from '../../scripts/generators/swot-content.js';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SAMPLE_SWOT = {
  title: 'Digital Markets Act — Strategic Assessment',
  strengths: [
    { text: 'Broad political support across major groups', severity: 'high' },
    { text: 'Strong legal basis in EU Treaties', severity: 'medium' },
  ],
  weaknesses: [
    { text: 'Complex enforcement mechanisms', severity: 'medium' },
    { text: 'Limited resources for monitoring', severity: 'low' },
  ],
  opportunities: [
    { text: 'Global regulatory leadership', severity: 'high' },
    { text: 'Innovation-friendly framework potential' },
  ],
  threats: [
    { text: 'Industry lobbying resistance', severity: 'medium' },
    { text: 'Rapid technological change outpacing regulation', severity: 'high' },
  ],
};

const MINIMAL_SWOT = {
  strengths: [{ text: 'One strength' }],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

const EMPTY_SWOT = {
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

// ─── Multi-Dimensional SWOT fixtures ──────────────────────────────────────────

const SAMPLE_DIMENSION = {
  name: 'political',
  strengths: [{ text: 'Strong cross-party coalition', severity: 'high' }],
  weaknesses: [{ text: 'Opposition from far-right groups', severity: 'medium' }],
  opportunities: [{ text: 'Upcoming plenary vote window', severity: 'high' }],
  threats: [{ text: 'Council blocking risk', severity: 'medium' }],
};

const SAMPLE_MD_SWOT = {
  title: 'AI Act — Multi-Dimensional Assessment',
  dimensions: [
    SAMPLE_DIMENSION,
    {
      name: 'economic',
      strengths: [{ text: 'Budget line secured', severity: 'high' }],
      weaknesses: [{ text: 'Compliance cost for SMEs', severity: 'medium' }],
      opportunities: [{ text: 'Innovation fund alignment', severity: 'medium' }],
      threats: [{ text: 'Industry pushback on costs', severity: 'medium' }],
    },
  ],
  temporal: {
    shortTerm: {
      strengths: [{ text: 'Plenary vote this week', severity: 'high' }],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    mediumTerm: {
      strengths: [{ text: 'Committee report due this quarter', severity: 'medium' }],
      weaknesses: [{ text: 'Trilogue delays possible', severity: 'medium' }],
      opportunities: [{ text: 'Alignment window with Council', severity: 'medium' }],
      threats: [],
    },
  },
  stakeholderViews: {
    citizen: {
      strengths: [{ text: 'Enhanced data rights', severity: 'high' }],
      weaknesses: [{ text: 'Complex compliance burden', severity: 'medium' }],
      opportunities: [{ text: 'Stronger enforcement', severity: 'medium' }],
      threats: [{ text: 'Regulatory gaps in enforcement', severity: 'medium' }],
    },
    industry: {
      strengths: [{ text: 'Predictable regulatory framework', severity: 'medium' }],
      weaknesses: [{ text: 'High compliance cost', severity: 'high' }],
      opportunities: [{ text: 'Innovation-safe harbour', severity: 'medium' }],
      threats: [{ text: 'Extraterritorial scope uncertainty', severity: 'high' }],
    },
  },
  crossReferences: [
    {
      itemText: 'Strong cross-party coalition',
      documentId: 'TA-10-2024-0001',
      documentTitle: 'AI Act — First Reading Position',
      url: 'https://www.europarl.europa.eu/doceo/document/TA-10-2024-0001_EN.html',
    },
  ],
};

const EMPTY_DIMENSIONS_MD_SWOT = {
  dimensions: [],
};

const SINGLE_DIMENSION_MD_SWOT = {
  dimensions: [
    {
      name: 'political',
      strengths: [{ text: 'Only strength', severity: 'high' }],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
  ],
};

const ALL_EMPTY_DIMENSIONS_MD_SWOT = {
  dimensions: [
    { name: 'political', strengths: [], weaknesses: [], opportunities: [], threats: [] },
    { name: 'economic', strengths: [], weaknesses: [], opportunities: [], threats: [] },
  ],
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('swot-content', () => {
  describe('buildSwotSection', () => {
    it('should return empty string for null input', () => {
      expect(buildSwotSection(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(buildSwotSection(undefined)).toBe('');
    });

    it('should return empty string for SWOT with no items', () => {
      expect(buildSwotSection(EMPTY_SWOT)).toBe('');
    });

    it('should generate valid HTML with all four quadrants', () => {
      const html = buildSwotSection(SAMPLE_SWOT);

      expect(html).toContain('swot-analysis');
      expect(html).toContain('swot-matrix');
      expect(html).toContain('swot-grid');
      expect(html).toContain('swot-strengths');
      expect(html).toContain('swot-weaknesses');
      expect(html).toContain('swot-opportunities');
      expect(html).toContain('swot-threats');
    });

    it('should include SWOT title in heading', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Digital Markets Act — Strategic Assessment');
    });

    it('should use custom heading when provided', () => {
      const html = buildSwotSection(SAMPLE_SWOT, 'en', 'Custom Analysis');
      expect(html).toContain('Custom Analysis');
    });

    it('should default heading to localized "SWOT Analysis" when no title or heading', () => {
      const html = buildSwotSection(MINIMAL_SWOT);
      expect(html).toContain('SWOT Analysis');
    });

    it('should escape HTML in SWOT item text', () => {
      const swot = {
        strengths: [{ text: '<script>alert("xss")</script>' }],
        weaknesses: [],
        opportunities: [],
        threats: [],
      };
      const html = buildSwotSection(swot);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include severity badges when severity is set', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('swot-severity-high');
      expect(html).toContain('swot-severity-medium');
      expect(html).toContain('swot-severity-low');
      expect(html).toContain('swot-severity-badge');
    });

    it('should render severity badges as ARIA-only labels without visible text', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-label="high"');
      // Badge content should be empty (no visible severity text)
      expect(html).toMatch(/swot-severity-badge[^>]*><\/span>/);
    });

    it('should not include severity badges when severity is not set', () => {
      const html = buildSwotSection(MINIMAL_SWOT);
      expect(html).not.toContain('swot-severity-badge');
    });

    it('should include accessible ARIA attributes', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label=');
    });

    it('should not use invalid ARIA table roles on grid divs', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).not.toContain('role="table"');
      expect(html).not.toContain('role="row"');
    });

    it('should not have hard-coded English aria-label on SWOT grid', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).not.toContain('aria-label="SWOT Matrix"');
    });

    it('should include axis labels for internal/external dimensions', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Internal');
      expect(html).toContain('External');
    });

    it('should render all strength items', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Broad political support across major groups');
      expect(html).toContain('Strong legal basis in EU Treaties');
    });

    it('should render all weakness items', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Complex enforcement mechanisms');
      expect(html).toContain('Limited resources for monitoring');
    });

    it('should render all opportunity items', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Global regulatory leadership');
      expect(html).toContain('Innovation-friendly framework potential');
    });

    it('should render all threat items', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Industry lobbying resistance');
      expect(html).toContain('Rapid technological change outpacing regulation');
    });

    it('should render with minimal data (only one quadrant populated)', () => {
      const html = buildSwotSection(MINIMAL_SWOT);
      expect(html).toContain('swot-analysis');
      expect(html).toContain('One strength');
      expect(html).toContain('swot-strengths');
    });

    it('should include quadrant headings and descriptions', () => {
      const html = buildSwotSection(SAMPLE_SWOT);
      expect(html).toContain('Strengths');
      expect(html).toContain('Weaknesses');
      expect(html).toContain('Opportunities');
      expect(html).toContain('Threats');
      expect(html).toContain('Internal positive factors');
      expect(html).toContain('External negative factors');
    });

    it('should show placeholder for empty quadrants', () => {
      const swot = {
        strengths: [{ text: 'Has content' }],
        weaknesses: [],
        opportunities: [],
        threats: [],
      };
      const html = buildSwotSection(swot);
      expect(html).toContain('swot-empty');
      // Verify placeholder dash character in all three empty quadrants
      expect(html).toContain('—');
      // Count swot-empty occurrences (weaknesses, opportunities, threats = 3)
      const emptyCount = (html.match(/swot-empty/g) || []).length;
      expect(emptyCount).toBe(3);
    });

    it('should localize labels when lang is provided', () => {
      const html = buildSwotSection(SAMPLE_SWOT, 'sv');
      expect(html).toContain('Styrkor');
      expect(html).toContain('Svagheter');
      expect(html).toContain('Möjligheter');
      expect(html).toContain('Hot');
    });

    it('should localize section heading when lang is provided and no custom title', () => {
      const html = buildSwotSection(MINIMAL_SWOT, 'de');
      expect(html).toContain('SWOT-Analyse');
    });

    it('should localize axis labels when lang is provided', () => {
      const html = buildSwotSection(SAMPLE_SWOT, 'fr');
      expect(html).toContain('Interne');
      expect(html).toContain('Externe');
    });
  });

  // ─── Multi-Dimensional SWOT tests ──────────────────────────────────────────

  describe('buildMultiDimensionalSwotSection', () => {
    it('should return empty string for null input', () => {
      expect(buildMultiDimensionalSwotSection(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(buildMultiDimensionalSwotSection(undefined)).toBe('');
    });

    it('should return empty string when dimensions array is empty', () => {
      expect(buildMultiDimensionalSwotSection(EMPTY_DIMENSIONS_MD_SWOT)).toBe('');
    });

    it('should return empty string when all dimensions have no items', () => {
      expect(buildMultiDimensionalSwotSection(ALL_EMPTY_DIMENSIONS_MD_SWOT)).toBe('');
    });

    it('should generate valid HTML section with required class', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-analysis');
      expect(html).toContain('swot-multidimensional');
    });

    it('should include the analysis title as section heading', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('AI Act — Multi-Dimensional Assessment');
    });

    it('should use custom heading when provided', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT, 'en', 'Custom MD Heading');
      expect(html).toContain('Custom MD Heading');
    });

    it('should default to localized SWOT heading when no title or heading', () => {
      const html = buildMultiDimensionalSwotSection(SINGLE_DIMENSION_MD_SWOT);
      expect(html).toContain('SWOT Analysis');
    });

    it('should include primary aggregated 4-quadrant matrix', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-matrix');
      expect(html).toContain('swot-strengths');
      expect(html).toContain('swot-weaknesses');
      expect(html).toContain('swot-opportunities');
      expect(html).toContain('swot-threats');
    });

    it('should include axis labels', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Internal');
      expect(html).toContain('External');
    });

    it('should aggregate items from all dimensions into primary view', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      // Items from both political and economic dimensions should appear
      expect(html).toContain('Strong cross-party coalition');
      expect(html).toContain('Budget line secured');
    });

    it('should render dimension drill-down sections with <details> elements', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-dimensions');
      expect(html).toContain('swot-dimension-political');
      expect(html).toContain('swot-dimension-economic');
      expect(html).toContain('<details');
      expect(html).toContain('<summary');
    });

    it('should include "Dimensions" heading in the drill-down section', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Dimensions');
    });

    it('should localize dimension labels', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT, 'de');
      expect(html).toContain('Dimensionen');
      expect(html).toContain('Politisch');
      expect(html).toContain('Wirtschaftlich');
    });

    it('should render stakeholder perspectives when provided', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-stakeholders');
      expect(html).toContain('swot-stakeholder-citizen');
      expect(html).toContain('swot-stakeholder-industry');
    });

    it('should include "Stakeholder Perspectives" heading', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Stakeholder Perspectives');
    });

    it('should render stakeholder content items', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Enhanced data rights');
      expect(html).toContain('Predictable regulatory framework');
    });

    it('should not render stakeholder section when stakeholderViews is missing', () => {
      const html = buildMultiDimensionalSwotSection(SINGLE_DIMENSION_MD_SWOT);
      expect(html).not.toContain('swot-stakeholders');
      expect(html).not.toContain('Stakeholder Perspectives');
    });

    it('should render temporal analysis section when provided', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-temporal');
      expect(html).toContain('swot-temporal-period');
    });

    it('should include "Temporal Analysis" heading', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Temporal Analysis');
    });

    it('should render short-term and medium-term period labels', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Short-term (This week)');
      expect(html).toContain('Medium-term (This quarter)');
    });

    it('should render temporal content items', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('Plenary vote this week');
      expect(html).toContain('Committee report due this quarter');
    });

    it('should not render temporal section when temporal is missing', () => {
      const html = buildMultiDimensionalSwotSection(SINGLE_DIMENSION_MD_SWOT);
      expect(html).not.toContain('swot-temporal');
      expect(html).not.toContain('Temporal Analysis');
    });

    it('should render cross-references section when provided', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-cross-references');
      expect(html).toContain('References');
      expect(html).toContain('TA-10-2024-0001');
      expect(html).toContain('AI Act — First Reading Position');
    });

    it('should render cross-reference links when URL is provided', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('swot-ref-link');
      expect(html).toContain('href=');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it('should not render cross-references section when crossReferences is missing', () => {
      const html = buildMultiDimensionalSwotSection(SINGLE_DIMENSION_MD_SWOT);
      expect(html).not.toContain('swot-cross-references');
      expect(html).not.toContain('swot-ref-list');
    });

    it('should escape HTML in dimension item text', () => {
      const xssSwot = {
        dimensions: [
          {
            name: 'political',
            strengths: [{ text: '<script>alert("xss")</script>', severity: 'high' }],
            weaknesses: [],
            opportunities: [],
            threats: [],
          },
        ],
      };
      const html = buildMultiDimensionalSwotSection(xssSwot);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in cross-reference fields', () => {
      const xssSwot = {
        dimensions: [SAMPLE_DIMENSION],
        crossReferences: [
          {
            itemText: '<b>bold</b>',
            documentId: 'TA-<evil>',
            documentTitle: '<img src=x onerror=alert(1)>',
          },
        ],
      };
      const html = buildMultiDimensionalSwotSection(xssSwot);
      expect(html).not.toContain('<b>');
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;b&gt;');
    });

    it('should include accessible ARIA region roles', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label=');
    });

    it('should not have JavaScript in generated HTML', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT);
      expect(html).not.toContain('onclick');
      expect(html).not.toContain('onchange');
      expect(html).not.toContain('<script>');
    });

    it('should render single-dimension SWOT correctly', () => {
      const html = buildMultiDimensionalSwotSection(SINGLE_DIMENSION_MD_SWOT);
      expect(html).toContain('swot-multidimensional');
      expect(html).toContain('Only strength');
      expect(html).toContain('swot-dimension-political');
    });

    it('should localize headings for Swedish', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT, 'sv');
      expect(html).toContain('Dimensioner');
      expect(html).toContain('Intressentperspektiv');
      expect(html).toContain('Tidsanalys');
    });

    it('should localize headings for French', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT, 'fr');
      expect(html).toContain('Dimensions');
      expect(html).toContain('Analyse temporelle');
      expect(html).toContain('Court terme');
    });

    it('should localize headings for German', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT, 'de');
      expect(html).toContain('Dimensionen');
      expect(html).toContain('Akteursperspektiven');
      expect(html).toContain('Zeitliche Analyse');
    });

    it('should localize dimension names for Japanese', () => {
      const html = buildMultiDimensionalSwotSection(SAMPLE_MD_SWOT, 'ja');
      expect(html).toContain('次元');
      expect(html).toContain('政治的');
      expect(html).toContain('経済的');
    });

    it('should render cross-reference without URL as plain text ID', () => {
      const noUrlSwot = {
        dimensions: [SAMPLE_DIMENSION],
        crossReferences: [
          {
            itemText: 'Some evidence',
            documentId: 'PE-2024-001',
            documentTitle: 'Committee Report on AI',
          },
        ],
      };
      const html = buildMultiDimensionalSwotSection(noUrlSwot);
      expect(html).toContain('swot-ref-id');
      expect(html).toContain('PE-2024-001');
      expect(html).not.toContain('swot-ref-link');
    });

    it('should reject javascript: URLs and render as plain text ID', () => {
      const jsUrlSwot = {
        dimensions: [SAMPLE_DIMENSION],
        crossReferences: [
          {
            itemText: 'Some evidence',
            documentId: 'TA-10-2024-0099',
            documentTitle: 'Injected Doc',
            url: 'javascript:alert(1)',
          },
        ],
      };
      const html = buildMultiDimensionalSwotSection(jsUrlSwot);
      // Should NOT render as a link
      expect(html).not.toContain('swot-ref-link');
      expect(html).not.toContain('javascript:');
      expect(html).not.toContain('href=');
      // Should render as plain text ID instead
      expect(html).toContain('swot-ref-id');
      expect(html).toContain('TA-10-2024-0099');
    });

    it('should skip empty temporal periods', () => {
      const noLongTermSwot = {
        dimensions: [SAMPLE_DIMENSION],
        temporal: {
          shortTerm: { strengths: [{ text: 'Short item' }], weaknesses: [], opportunities: [], threats: [] },
          mediumTerm: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
          // longTerm intentionally omitted
        },
      };
      const html = buildMultiDimensionalSwotSection(noLongTermSwot);
      expect(html).toContain('Short-term (This week)');
      // Medium-term with no items should not appear
      expect(html).not.toContain('Medium-term (This quarter)');
      // Long-term not provided so should not appear
      expect(html).not.toContain('Long-term (This term)');
    });

    it('should skip stakeholder views with no items', () => {
      const emptyStakeholderSwot = {
        dimensions: [SAMPLE_DIMENSION],
        stakeholderViews: {
          citizen: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        },
      };
      const html = buildMultiDimensionalSwotSection(emptyStakeholderSwot);
      // Section should not appear since all stakeholder views are empty
      expect(html).not.toContain('swot-stakeholders');
    });
  });
});

