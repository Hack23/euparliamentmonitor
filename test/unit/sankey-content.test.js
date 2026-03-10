// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { buildSankeySection } from '../../scripts/generators/sankey-content.js';

describe('sankey-content', () => {
  describe('buildSankeySection', () => {
    it('should return empty string for null config', () => {
      expect(buildSankeySection(null)).toBe('');
    });

    it('should return empty string for undefined config', () => {
      expect(buildSankeySection(undefined)).toBe('');
    });

    it('should return empty string for config with no flows', () => {
      expect(
        buildSankeySection({
          nodes: [{ id: 'a', label: 'A', color: 'cyan' }],
          flows: [],
        }),
      ).toBe('');
    });

    it('should render a sankey diagram with nodes and flows', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'epp', label: 'EPP', color: 'blue' },
          { id: 'sd', label: 'S&D', color: 'red' },
          { id: 'adopted', label: 'Adopted', color: 'green' },
          { id: 'rejected', label: 'Rejected', color: 'magenta' },
        ],
        flows: [
          { source: 'epp', target: 'adopted', value: 8 },
          { source: 'epp', target: 'rejected', value: 2 },
          { source: 'sd', target: 'adopted', value: 6 },
          { source: 'sd', target: 'rejected', value: 4 },
        ],
      });

      expect(html).toContain('<section class="sankey-section"');
      expect(html).toContain('<svg');
      expect(html).toContain('viewBox');
      expect(html).toContain('EPP');
      expect(html).toContain('Adopted');
      expect(html).toContain('Rejected');
      expect(html).toContain('role="region"');
      expect(html).toContain('role="img"');
    });

    it('should include accessible fallback table', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'a', label: 'Source A', color: 'cyan' },
          { id: 'b', label: 'Target B', color: 'green' },
        ],
        flows: [{ source: 'a', target: 'b', value: 10 }],
      });

      expect(html).toContain('<noscript>');
      expect(html).toContain('sankey-fallback-table');
      expect(html).toContain('Source A');
      expect(html).toContain('Target B');
      expect(html).toContain('<th>Source</th>');
      expect(html).toContain('<th>Target</th>');
      expect(html).toContain('<th>Value</th>');
    });

    it('should use English heading by default', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'a', label: 'A', color: 'cyan' },
          { id: 'b', label: 'B', color: 'green' },
        ],
        flows: [{ source: 'a', target: 'b', value: 5 }],
      });
      expect(html).toContain('Policy Flow');
    });

    it('should use localized headings', () => {
      const html = buildSankeySection(
        {
          nodes: [
            { id: 'a', label: 'A', color: 'cyan' },
            { id: 'b', label: 'B', color: 'green' },
          ],
          flows: [{ source: 'a', target: 'b', value: 5 }],
        },
        'de',
      );
      expect(html).toContain('Politikfluss');
    });

    it('should allow heading override', () => {
      const html = buildSankeySection(
        {
          nodes: [
            { id: 'a', label: 'A', color: 'cyan' },
            { id: 'b', label: 'B', color: 'green' },
          ],
          flows: [{ source: 'a', target: 'b', value: 5 }],
        },
        'en',
        'Custom Flow Title',
      );
      expect(html).toContain('Custom Flow Title');
      expect(html).not.toContain('Policy Flow');
    });

    it('should render optional summary', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'a', label: 'A', color: 'cyan' },
          { id: 'b', label: 'B', color: 'green' },
        ],
        flows: [{ source: 'a', target: 'b', value: 5 }],
        summary: 'Overview of legislative flows.',
      });
      expect(html).toContain('<p class="sankey-summary">');
      expect(html).toContain('Overview of legislative flows.');
    });

    it('should escape HTML in labels', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'a', label: '<script>xss</script>', color: 'cyan' },
          { id: 'b', label: 'Target & "safe"', color: 'green' },
        ],
        flows: [{ source: 'a', target: 'b', value: 5 }],
      });
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>xss</script>');
    });

    it('should render flow labels when provided', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'a', label: 'A', color: 'cyan' },
          { id: 'b', label: 'B', color: 'green' },
        ],
        flows: [{ source: 'a', target: 'b', value: 10, label: '10 proposals' }],
      });
      expect(html).toContain('10 proposals');
    });

    it('should handle flows referencing non-existent nodes gracefully', () => {
      const html = buildSankeySection({
        nodes: [
          { id: 'a', label: 'A', color: 'cyan' },
          { id: 'b', label: 'B', color: 'green' },
        ],
        flows: [
          { source: 'a', target: 'b', value: 5 },
          { source: 'a', target: 'missing', value: 3 },
        ],
      });
      // Should not throw - just skip the flow with missing target
      expect(html).toContain('<svg');
    });

    it('should support all 8 node colors', () => {
      const colors = ['cyan', 'magenta', 'yellow', 'green', 'purple', 'orange', 'blue', 'red'];
      for (const color of colors) {
        const html = buildSankeySection({
          nodes: [
            { id: 'src', label: 'Source', color },
            { id: 'tgt', label: 'Target', color: 'green' },
          ],
          flows: [{ source: 'src', target: 'tgt', value: 5 }],
        });
        expect(html).toContain('Source');
        expect(html).toContain('<svg');
      }
    });
  });
});
