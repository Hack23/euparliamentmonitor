// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  buildDashboardSection,
  dashboardHasCharts,
} from '../../scripts/generators/dashboard-content.js';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SAMPLE_METRICS = [
  { label: 'Total Votes', value: '1,234', trend: 'up', change: 5.2 },
  { label: 'Participation', value: '87%', trend: 'stable', change: 0.0 },
  { label: 'Amendments', value: '42', trend: 'down', change: -3.1 },
];

const SAMPLE_CHART = {
  type: 'bar',
  title: 'Votes by Group',
  data: {
    labels: ['EPP', 'S&D', 'Renew', 'Greens/EFA'],
    datasets: [
      {
        label: 'Votes Cast',
        data: [400, 350, 200, 150],
        backgroundColor: ['#003399', '#ED1B24', '#FFD700', '#00A651'],
      },
    ],
  },
};

const SAMPLE_DASHBOARD = {
  title: 'Legislative Activity Overview',
  panels: [
    {
      title: 'Voting Statistics',
      metrics: SAMPLE_METRICS,
      chart: SAMPLE_CHART,
    },
    {
      title: 'Committee Activity',
      metrics: [
        { label: 'Active Committees', value: '20' },
        { label: 'Reports Adopted', value: '15', unit: 'reports' },
      ],
    },
  ],
};

const METRICS_ONLY_DASHBOARD = {
  title: 'Simple Dashboard',
  panels: [
    {
      title: 'Key Metrics',
      metrics: [{ label: 'Score', value: '95' }],
    },
  ],
};

const CHART_ONLY_DASHBOARD = {
  panels: [
    {
      title: 'Chart Panel',
      chart: {
        type: 'pie',
        data: {
          labels: ['Yes', 'No', 'Abstain'],
          datasets: [{ label: 'Votes', data: [60, 30, 10] }],
        },
      },
    },
  ],
};

const EMPTY_DASHBOARD = {
  panels: [],
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('dashboard-content', () => {
  describe('buildDashboardSection', () => {
    it('should return empty string for null input', () => {
      expect(buildDashboardSection(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(buildDashboardSection(undefined)).toBe('');
    });

    it('should return empty string for dashboard with no panels', () => {
      expect(buildDashboardSection(EMPTY_DASHBOARD)).toBe('');
    });

    it('should generate valid dashboard HTML with panels', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);

      expect(html).toContain('dashboard');
      expect(html).toContain('dashboard-grid');
      expect(html).toContain('dashboard-panel');
    });

    it('should include dashboard title in heading', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('Legislative Activity Overview');
    });

    it('should use custom heading when provided', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD, 'Custom Dashboard');
      expect(html).toContain('Custom Dashboard');
    });

    it('should default heading to "Dashboard" when no title or heading', () => {
      const html = buildDashboardSection(CHART_ONLY_DASHBOARD);
      expect(html).toContain('Dashboard');
    });

    it('should render metric cards with labels and values', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('metric-card');
      expect(html).toContain('Total Votes');
      expect(html).toContain('1,234');
      expect(html).toContain('Participation');
      expect(html).toContain('87%');
    });

    it('should render trend indicators', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('metric-trend-up');
      expect(html).toContain('metric-trend-stable');
      expect(html).toContain('metric-trend-down');
      expect(html).toContain('↑');
      expect(html).toContain('↓');
    });

    it('should render change percentages', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('+5.2%');
      expect(html).toContain('-3.1%');
    });

    it('should render metric units when provided', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('metric-unit');
      expect(html).toContain('reports');
    });

    it('should render chart containers with canvas elements', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('<canvas');
      expect(html).toContain('dashboard-chart');
      expect(html).toContain('data-chart-config=');
    });

    it('should include chart title', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('Votes by Group');
    });

    it('should embed chart configuration as escaped JSON', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('data-chart-config=');
      // The JSON should be HTML-escaped
      expect(html).toContain('&quot;');
    });

    it('should include noscript fallback table', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('<noscript>');
      expect(html).toContain('chart-fallback-table');
      expect(html).toContain('EPP');
      expect(html).toContain('400');
    });

    it('should escape HTML in metric values', () => {
      const dashboard = {
        panels: [
          {
            title: 'Test',
            metrics: [{ label: '<b>Label</b>', value: '<script>bad</script>' }],
          },
        ],
      };
      const html = buildDashboardSection(dashboard);
      expect(html).not.toContain('<script>bad</script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include accessible ARIA attributes', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label=');
    });

    it('should render metrics-only panels without chart container', () => {
      const html = buildDashboardSection(METRICS_ONLY_DASHBOARD);
      expect(html).toContain('metric-card');
      expect(html).not.toContain('<canvas');
    });

    it('should render chart-only panels without metrics grid', () => {
      const html = buildDashboardSection(CHART_ONLY_DASHBOARD);
      expect(html).toContain('<canvas');
      expect(html).not.toContain('metrics-grid');
    });

    it('should generate unique canvas IDs per panel', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('dashboard-chart-0');
      // SAMPLE_DASHBOARD only has one chart panel (index 0), second panel has no chart
      // Verify the ID pattern is present and unique
      const idMatches = html.match(/dashboard-chart-\d+/g) || [];
      const uniqueIds = new Set(idMatches);
      expect(uniqueIds.size).toBe(idMatches.length);
    });

    it('should generate distinct canvas IDs for multi-chart dashboards', () => {
      const multiChart = {
        panels: [
          {
            title: 'Panel A',
            chart: { type: 'bar', data: { labels: ['A'], datasets: [{ label: 'X', data: [1] }] } },
          },
          {
            title: 'Panel B',
            chart: { type: 'line', data: { labels: ['B'], datasets: [{ label: 'Y', data: [2] }] } },
          },
        ],
      };
      const html = buildDashboardSection(multiChart);
      expect(html).toContain('dashboard-chart-0');
      expect(html).toContain('dashboard-chart-1');
    });

    it('should render multiple panels', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('Voting Statistics');
      expect(html).toContain('Committee Activity');
    });

    it('should skip empty panels', () => {
      const dashboard = {
        panels: [
          { title: 'Empty Panel' },
          { title: 'Full Panel', metrics: [{ label: 'X', value: '1' }] },
        ],
      };
      const html = buildDashboardSection(dashboard);
      expect(html).not.toContain('Empty Panel');
      expect(html).toContain('Full Panel');
    });
  });

  describe('dashboardHasCharts', () => {
    it('should return false for null input', () => {
      expect(dashboardHasCharts(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(dashboardHasCharts(undefined)).toBe(false);
    });

    it('should return true when dashboard has charts', () => {
      expect(dashboardHasCharts(SAMPLE_DASHBOARD)).toBe(true);
    });

    it('should return false when dashboard has no charts', () => {
      expect(dashboardHasCharts(METRICS_ONLY_DASHBOARD)).toBe(false);
    });

    it('should return true for chart-only dashboard', () => {
      expect(dashboardHasCharts(CHART_ONLY_DASHBOARD)).toBe(true);
    });
  });
});
