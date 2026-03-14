// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  buildDashboardSection,
  dashboardHasCharts,
  buildCoalitionPanel,
  buildPipelinePanel,
  buildTrendPanel,
  buildStakeholderScorecardPanel,
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
      const html = buildDashboardSection(SAMPLE_DASHBOARD, 'en', 'Custom Dashboard');
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

    it('should include accessible category column header in fallback table', () => {
      const html = buildDashboardSection(SAMPLE_DASHBOARD);
      expect(html).toContain('<th scope="col">Category</th>');
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

    it('should localize section heading when lang is provided', () => {
      const dashboard = { panels: [{ title: 'P1', metrics: [{ label: 'X', value: '1' }] }] };
      const html = buildDashboardSection(dashboard, 'sv');
      expect(html).toContain('Instrumentpanel');
    });

    it('should localize trend prefix in aria-label', () => {
      const dashboard = {
        panels: [{ title: 'P1', metrics: [{ label: 'X', value: '1', trend: 'up' }] }],
      };
      const html = buildDashboardSection(dashboard, 'fi');
      expect(html).toContain('Trendi:');
    });

    it('should not include raw trend enum value in aria-label', () => {
      const dashboard = {
        panels: [{ title: 'P1', metrics: [{ label: 'X', value: '1', trend: 'up', change: 5.0 }] }],
      };
      const html = buildDashboardSection(dashboard);
      // aria-label should contain prefix + change but not the raw 'up' direction
      expect(html).toContain('Trend:');
      expect(html).toContain('+5.0%');
      expect(html).not.toMatch(/aria-label="Trend:\s+up/);
    });

    it('should localize no-data message in fallback', () => {
      const dashboard = {
        panels: [{
          title: 'P1',
          chart: { type: 'bar', data: { labels: [], datasets: [] } },
        }],
      };
      const html = buildDashboardSection(dashboard, 'de');
      expect(html).toContain('Keine Diagrammdaten verfügbar');
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

  describe('extended chart types', () => {
    it('should render polarArea chart config as data attribute', () => {
      const dashboard = {
        panels: [{
          title: 'Group Coverage',
          chart: {
            type: 'polarArea',
            title: 'Political Group Seats',
            data: { labels: ['EPP', 'S&D'], datasets: [{ label: 'Seats', data: [188, 136] }] },
          },
        }],
      };
      const html = buildDashboardSection(dashboard, 'en');
      expect(html).toContain('data-chart-config');
      expect(html).toContain('polarArea');
    });

    it('should render scatter chart config as data attribute', () => {
      const dashboard = {
        panels: [{
          title: 'Correlation',
          chart: {
            type: 'scatter',
            title: 'Activity vs Attendance',
            data: {
              labels: [],
              datasets: [{
                label: 'MEPs',
                data: [
                  { x: 10, y: 20 },
                  { x: 20, y: 40 },
                  { x: 30, y: 60 },
                ],
              }],
            },
          },
        }],
      };
      const html = buildDashboardSection(dashboard, 'en');
      expect(html).toContain('data-chart-config');
      expect(html).toContain('scatter');
    });

    it('should render bubble chart config as data attribute', () => {
      const dashboard = {
        panels: [{
          title: 'Impact Matrix',
          chart: {
            type: 'bubble',
            title: 'Legislation Impact',
            data: {
              labels: [],
              datasets: [{
                label: 'Laws',
                data: [
                  { x: 1, y: 5, r: 5 },
                  { x: 2, y: 10, r: 10 },
                  { x: 3, y: 15, r: 15 },
                ],
              }],
            },
          },
        }],
      };
      const html = buildDashboardSection(dashboard, 'en');
      expect(html).toContain('data-chart-config');
      expect(html).toContain('bubble');
    });
  });
});

// ─── Political Intelligence Panel Tests ─────────────────────────────────────

const SAMPLE_COALITION = {
  alignmentScore: 72,
  votingBlocs: [
    { group: 'EPP', alignmentScore: 85 },
    { group: 'S&D', alignmentScore: 68 },
    { group: 'Renew', alignmentScore: 75 },
  ],
  shiftIndicator: 'strengthening',
};

const SAMPLE_PIPELINE = {
  healthScore: 80,
  onTrack: 12,
  delayed: 3,
  blocked: 1,
  fastTracked: 2,
  total: 18,
};

const SAMPLE_TREND = {
  period: 'weekly',
  metrics: [
    { period: 'W1', value: 10 },
    { period: 'W2', value: 14 },
    { period: 'W3', value: 12 },
    { period: 'W4', value: 18 },
  ],
  direction: 'improving',
  weekOverWeekChange: 50,
};

const SAMPLE_STAKEHOLDERS = [
  { stakeholder: 'EPP', impactScore: 85, impactDirection: 'positive', description: 'High cohesion' },
  { stakeholder: 'S&D', impactScore: 62, impactDirection: 'neutral' },
  { stakeholder: 'Minority blocs', impactScore: 30, impactDirection: 'negative' },
];

describe('buildCoalitionPanel', () => {
  it('should return empty string for null coalition', () => {
    expect(buildCoalitionPanel(null, 0)).toBe('');
  });

  it('should return empty string for undefined coalition', () => {
    expect(buildCoalitionPanel(undefined, 0)).toBe('');
  });

  it('should return empty string for coalition with no blocs', () => {
    expect(buildCoalitionPanel({ alignmentScore: 50, votingBlocs: [], shiftIndicator: 'stable' }, 0)).toBe('');
  });

  it('should render coalition panel with alignment score', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0);
    expect(html).toContain('Coalition Alignment');
    expect(html).toContain('72%');
  });

  it('should render voting blocs count', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0);
    expect(html).toContain('3');
  });

  it('should render shift indicator as strengthening', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0);
    expect(html).toContain('Strengthening');
  });

  it('should render shift indicator as weakening', () => {
    const weakening = { ...SAMPLE_COALITION, shiftIndicator: 'weakening' };
    const html = buildCoalitionPanel(weakening, 0);
    expect(html).toContain('Weakening');
  });

  it('should render shift indicator as stable', () => {
    const stable = { ...SAMPLE_COALITION, shiftIndicator: 'stable' };
    const html = buildCoalitionPanel(stable, 0);
    expect(html).toContain('Stable');
  });

  it('should embed radar chart configuration as JSON data attribute', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0);
    expect(html).toContain('data-chart-config');
    expect(html).toContain('radar');
    expect(html).toContain('EPP');
  });

  it('should include noscript fallback table with blocs', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0);
    expect(html).toContain('<noscript>');
    expect(html).toContain('EPP');
    expect(html).toContain('S&amp;D');
  });

  it('should include accessible ARIA attributes', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label=');
  });

  it('should generate unique canvas ID using panelIndex', () => {
    const html0 = buildCoalitionPanel(SAMPLE_COALITION, 0);
    const html1 = buildCoalitionPanel(SAMPLE_COALITION, 1);
    expect(html0).toContain('coalition-chart-0');
    expect(html1).toContain('coalition-chart-1');
  });

  it('should escape HTML in group names', () => {
    const xss = {
      alignmentScore: 50,
      votingBlocs: [{ group: '<script>alert(1)</script>', alignmentScore: 50 }],
      shiftIndicator: 'stable',
    };
    const html = buildCoalitionPanel(xss, 0);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should localize labels when lang is provided', () => {
    const html = buildCoalitionPanel(SAMPLE_COALITION, 0, 'de');
    expect(html).toContain('Koalitionsausrichtung');
  });
});

describe('buildPipelinePanel', () => {
  it('should return empty string for null pipeline', () => {
    expect(buildPipelinePanel(null, 0)).toBe('');
  });

  it('should return empty string for undefined pipeline', () => {
    expect(buildPipelinePanel(undefined, 0)).toBe('');
  });

  it('should return empty string for pipeline with zero total', () => {
    const empty = { healthScore: 100, onTrack: 0, delayed: 0, blocked: 0, fastTracked: 0, total: 0 };
    expect(buildPipelinePanel(empty, 0)).toBe('');
  });

  it('should render pipeline panel with health score', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    expect(html).toContain('Pipeline Status');
    expect(html).toContain('80%');
  });

  it('should render on-track, delayed, blocked, fast-tracked counts', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    expect(html).toContain('12');
    expect(html).toContain('3');
    expect(html).toContain('1');
    expect(html).toContain('2');
  });

  it('should apply healthy CSS class for high health score', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    expect(html).toContain('pipeline-healthy');
  });

  it('should apply moderate CSS class for mid-range health score', () => {
    const moderate = { ...SAMPLE_PIPELINE, healthScore: 55 };
    const html = buildPipelinePanel(moderate, 0);
    expect(html).toContain('pipeline-moderate');
  });

  it('should apply critical CSS class for low health score', () => {
    const critical = { ...SAMPLE_PIPELINE, healthScore: 25 };
    const html = buildPipelinePanel(critical, 0);
    expect(html).toContain('pipeline-critical');
  });

  it('should embed bar chart configuration as JSON data attribute', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    expect(html).toContain('data-chart-config');
    // JSON is HTML-escaped in the attribute value
    expect(html).toContain('&quot;bar&quot;');
  });

  it('should include noscript fallback list', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    expect(html).toContain('<noscript>');
    expect(html).toContain('On Track');
    expect(html).toContain('Delayed');
  });

  it('should include accessible ARIA attributes', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label=');
  });

  it('should generate unique canvas ID using panelIndex', () => {
    const html0 = buildPipelinePanel(SAMPLE_PIPELINE, 0);
    const html3 = buildPipelinePanel(SAMPLE_PIPELINE, 3);
    expect(html0).toContain('pipeline-chart-0');
    expect(html3).toContain('pipeline-chart-3');
  });

  it('should localize labels when lang is provided', () => {
    const html = buildPipelinePanel(SAMPLE_PIPELINE, 0, 'fr');
    expect(html).toContain('État du pipeline');
  });
});

describe('buildTrendPanel', () => {
  it('should return empty string for null trend', () => {
    expect(buildTrendPanel(null, 0)).toBe('');
  });

  it('should return empty string for undefined trend', () => {
    expect(buildTrendPanel(undefined, 0)).toBe('');
  });

  it('should return empty string for trend with no metrics', () => {
    const empty = { period: 'weekly', metrics: [], direction: 'stable' };
    expect(buildTrendPanel(empty, 0)).toBe('');
  });

  it('should render trend panel with direction label', () => {
    const html = buildTrendPanel(SAMPLE_TREND, 0);
    expect(html).toContain('Trend Analysis');
    expect(html).toContain('Improving');
  });

  it('should render declining direction', () => {
    const declining = { ...SAMPLE_TREND, direction: 'declining' };
    const html = buildTrendPanel(declining, 0);
    expect(html).toContain('Declining');
  });

  it('should render stable direction', () => {
    const stable = { ...SAMPLE_TREND, direction: 'stable' };
    const html = buildTrendPanel(stable, 0);
    expect(html).toContain('Stable');
  });

  it('should render week-over-week change when provided', () => {
    const html = buildTrendPanel(SAMPLE_TREND, 0);
    expect(html).toContain('Week-over-Week');
    expect(html).toContain('+50%');
  });

  it('should render month-over-month change when provided', () => {
    const monthly = { ...SAMPLE_TREND, period: 'monthly', weekOverWeekChange: undefined, monthOverMonthChange: -5 };
    const html = buildTrendPanel(monthly, 0);
    expect(html).toContain('Month-over-Month');
    expect(html).toContain('-5%');
  });

  it('should embed line chart configuration as JSON data attribute', () => {
    const html = buildTrendPanel(SAMPLE_TREND, 0);
    expect(html).toContain('data-chart-config');
    // JSON is HTML-escaped in the attribute value
    expect(html).toContain('&quot;line&quot;');
    expect(html).toContain('W1');
  });

  it('should include noscript fallback table with period data', () => {
    const html = buildTrendPanel(SAMPLE_TREND, 0);
    expect(html).toContain('<noscript>');
    expect(html).toContain('W1');
    expect(html).toContain('10');
  });

  it('should include accessible ARIA attributes', () => {
    const html = buildTrendPanel(SAMPLE_TREND, 0);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label=');
  });

  it('should generate unique canvas ID using panelIndex', () => {
    const html2 = buildTrendPanel(SAMPLE_TREND, 2);
    expect(html2).toContain('trend-chart-2');
  });

  it('should localize labels when lang is provided', () => {
    const html = buildTrendPanel(SAMPLE_TREND, 0, 'sv');
    expect(html).toContain('Trendanalys');
  });

  it('should not render week-over-week when undefined', () => {
    const noWow = { ...SAMPLE_TREND, weekOverWeekChange: undefined };
    const html = buildTrendPanel(noWow, 0);
    expect(html).not.toContain('Week-over-Week');
  });
});

describe('buildStakeholderScorecardPanel', () => {
  it('should return empty string for null stakeholders', () => {
    expect(buildStakeholderScorecardPanel(null, 0)).toBe('');
  });

  it('should return empty string for undefined stakeholders', () => {
    expect(buildStakeholderScorecardPanel(undefined, 0)).toBe('');
  });

  it('should return empty string for empty stakeholders array', () => {
    expect(buildStakeholderScorecardPanel([], 0)).toBe('');
  });

  it('should render stakeholder scorecard panel', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('Stakeholder Impact');
    expect(html).toContain('stakeholder-scorecard');
  });

  it('should render all stakeholder names', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('EPP');
    expect(html).toContain('S&amp;D');
    expect(html).toContain('Minority blocs');
  });

  it('should render impact scores', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('85/100');
    expect(html).toContain('62/100');
    expect(html).toContain('30/100');
  });

  it('should apply positive CSS class for positive impact', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('impact-positive');
  });

  it('should apply negative CSS class for negative impact', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('impact-negative');
  });

  it('should apply neutral CSS class for neutral impact', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('impact-neutral');
  });

  it('should render direction labels (Positive, Negative, Neutral)', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('Positive');
    expect(html).toContain('Negative');
    expect(html).toContain('Neutral');
  });

  it('should render description when provided', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('High cohesion');
  });

  it('should include noscript fallback table', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('<noscript>');
    expect(html).toContain('chart-fallback-table');
  });

  it('should include accessible ARIA attributes', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label=');
  });

  it('should generate unique ID using panelIndex', () => {
    const html0 = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    const html5 = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 5);
    expect(html0).toContain('stakeholder-scorecard-0');
    expect(html5).toContain('stakeholder-scorecard-5');
  });

  it('should escape HTML in stakeholder names', () => {
    const xss = [
      { stakeholder: '<script>xss()</script>', impactScore: 50, impactDirection: 'neutral' },
    ];
    const html = buildStakeholderScorecardPanel(xss, 0);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should localize labels when lang is provided', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0, 'de');
    expect(html).toContain('Stakeholder-Einfluss');
  });

  it('should render stakeholder-grid with list role', () => {
    const html = buildStakeholderScorecardPanel(SAMPLE_STAKEHOLDERS, 0);
    expect(html).toContain('stakeholder-grid');
    expect(html).toContain('role="list"');
  });
});
