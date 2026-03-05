// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { buildSwotSection } from '../../scripts/generators/swot-content.js';

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
});
