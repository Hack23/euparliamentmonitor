// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { buildMindmapSection } from '../../scripts/generators/mindmap-content.js';

describe('mindmap-content', () => {
  describe('buildMindmapSection', () => {
    it('should return empty string for null config', () => {
      expect(buildMindmapSection(null)).toBe('');
    });

    it('should return empty string for undefined config', () => {
      expect(buildMindmapSection(undefined)).toBe('');
    });

    it('should return empty string for config with no branches', () => {
      expect(buildMindmapSection({ topic: 'Test', branches: [] })).toBe('');
    });

    it('should render a mindmap with a central topic and branches', () => {
      const html = buildMindmapSection({
        topic: 'EU Digital Policy',
        branches: [
          { label: 'Key Actors', color: 'cyan', items: ['European Commission', 'ITRE Committee'] },
          { label: 'Risks', color: 'magenta', items: ['Fragmented regulation'] },
          { label: 'Opportunities', color: 'green' },
        ],
      });

      expect(html).toContain('<section class="mindmap-section"');
      expect(html).toContain('EU Digital Policy');
      expect(html).toContain('Key Actors');
      expect(html).toContain('European Commission');
      expect(html).toContain('ITRE Committee');
      expect(html).toContain('Risks');
      expect(html).toContain('Fragmented regulation');
      expect(html).toContain('Opportunities');
      expect(html).toContain('mindmap-center');
      expect(html).toContain('mindmap-branch');
      expect(html).toContain('role="list"');
      expect(html).toContain('role="region"');
    });

    it('should use English heading by default', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'A', color: 'cyan' }],
      });

      expect(html).toContain('Policy Mindmap');
    });

    it('should use localized headings for supported languages', () => {
      const html = buildMindmapSection(
        { topic: 'Test', branches: [{ label: 'A', color: 'cyan' }] },
        'sv',
      );
      expect(html).toContain('Policykarta');
    });

    it('should allow heading override', () => {
      const html = buildMindmapSection(
        { topic: 'Test', branches: [{ label: 'A', color: 'cyan' }] },
        'en',
        'Custom Heading',
      );
      expect(html).toContain('Custom Heading');
      expect(html).not.toContain('Policy Mindmap');
    });

    it('should render optional summary paragraph', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'A', color: 'cyan' }],
        summary: 'This is an overview of the topic.',
      });
      expect(html).toContain('<p class="mindmap-summary">');
      expect(html).toContain('This is an overview of the topic.');
    });

    it('should render branch icons when provided', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'Actors', color: 'cyan', icon: '👥' }],
      });
      expect(html).toContain('👥');
    });

    it('should escape HTML in topic, labels, and items', () => {
      const html = buildMindmapSection({
        topic: '<script>alert("xss")</script>',
        branches: [
          { label: '<b>Bold</b>', color: 'red', items: ['Item & "more"'] },
        ],
      });
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
      expect(html).toContain('Item &amp; &quot;more&quot;');
      expect(html).not.toContain('<script>');
    });

    it('should set CSS custom properties on branch elements', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [{ label: 'A', color: 'green' }],
      });
      expect(html).toContain('--branch-bg:');
      expect(html).toContain('--branch-border:');
      expect(html).toContain('--branch-text:');
    });

    it('should include data-branch-count attribute', () => {
      const html = buildMindmapSection({
        topic: 'Test',
        branches: [
          { label: 'A', color: 'cyan' },
          { label: 'B', color: 'magenta' },
          { label: 'C', color: 'green' },
        ],
      });
      expect(html).toContain('data-branch-count="3"');
    });

    it('should support all 8 branch colors', () => {
      const colors = ['cyan', 'magenta', 'yellow', 'green', 'purple', 'orange', 'blue', 'red'];
      for (const color of colors) {
        const html = buildMindmapSection({
          topic: 'Test',
          branches: [{ label: `Color ${color}`, color }],
        });
        expect(html).toContain(`Color ${color}`);
        expect(html).toContain('mindmap-branch');
      }
    });
  });
});
