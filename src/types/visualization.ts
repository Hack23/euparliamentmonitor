// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization
 * @description Thin re-export barrel — preserves the legacy
 * `from '../types/visualization.js'` import path while the underlying type
 * definitions live in dedicated bounded-context sub-modules:
 *
 * - {@link ./visualization/swot.ts} — SWOT analysis structures and strings
 * - {@link ./visualization/charts.ts} — Chart.js-aligned chart configuration
 * - {@link ./visualization/dashboard.ts} — Dashboard panels, metrics, strings,
 *   trend analytics, legislative-pipeline status, stakeholder-impact metrics
 * - {@link ./visualization/mindmap.ts} — Intelligence-mindmap (layers, actors,
 *   policy connections, influence weights)
 * - {@link ./visualization/voting-bloc.ts} — Voting blocs and coalition metrics
 *
 * Consumers SHOULD import from `../types/index.js` instead — this file
 * exists for backwards compatibility only and may be removed in a
 * follow-up refactor once all direct importers are migrated.
 */

export type {
  SwotItem,
  SwotAnalysis,
  SwotStrings,
  SwotBuilderStrings,
} from './visualization/swot.js';

export type {
  ScatterPoint,
  BubblePoint,
  ChartDataset,
  ChartData,
  ChartConfig,
} from './visualization/charts.js';

export type {
  DashboardMetric,
  DashboardPanel,
  DashboardConfig,
  DashboardStrings,
  DashboardBuilderStrings,
  LegislativePipeline,
  TrendMetric,
  TrendAnalytics,
  StakeholderMetric,
} from './visualization/dashboard.js';

export type {
  MindmapNodeCategory,
  PolicyConnectionType,
  PolicyConnectionStrength,
  ActorType,
  MindmapBranchColor,
  MindmapNode,
  MindmapLayer,
  PolicyConnection,
  ActorNode,
  InfluenceWeight,
  IntelligenceMindmap,
} from './visualization/mindmap.js';

export type {
  VotingBloc,
  VoteHighlight,
  CoalitionMetrics,
} from './visualization/voting-bloc.js';
