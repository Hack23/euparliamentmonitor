// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Builders/BreakingBuilders
 * @description Deep analysis, SWOT, dashboard, mindmap and multi-dimensional SWOT
 * builders for breaking news articles.
 */

import type {
  DeepAnalysis,
  BreakingNewsFeedData,
  LanguageCode,
  SwotAnalysis,
  DashboardConfig,
  SwotBuilderStrings,
  DashboardBuilderStrings,
  IntelligenceMindmap,
  MindmapNode,
  ActorNode,
  PolicyConnection,
  StakeholderPerspective,
  MultiDimensionalSwot,
  SwotItem,
  TemporalSwotAssessment,
  StakeholderType,
  SwotDimension,
} from '../../types/index.js';
import {
  getLocalizedString,
  BREAKING_STRINGS,
  SWOT_BUILDER_STRINGS,
  DASHBOARD_BUILDER_STRINGS,
} from '../../constants/languages.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import {
  buildOutcomeMatrix,
  buildTrendFromCounts,
  buildGenericTrendPanel,
  makeDimension,
} from './shared-builders.js';

// ─── Constant ─────────────────────────────────────────────────────────────────

/**
 * Build multi-stakeholder perspectives for a breaking news analysis.
 *
 * @param adoptedCount - Number of adopted texts in the feed
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildBreakingStakeholderPerspectives(
  adoptedCount: number,
  topic: string
): StakeholderPerspective[] {
  return buildDefaultStakeholderPerspectives(topic, {
    political_groups: 0.9,
    civil_society: adoptedCount > 0 ? 0.6 : 0.4,
    industry: adoptedCount > 0 ? 0.7 : 0.4,
    national_govts: 0.7,
    citizens: adoptedCount > 0 ? 0.6 : 0.3,
    eu_institutions: 0.9,
  });
}

/**
 * Build stakeholder views for breaking multi-dimensional SWOT.
 *
 * @param adoptedCount - Number of adopted texts
 * @param anomalyRaw - Raw anomaly text
 * @param procCount - Number of active procedures
 * @param eventCount - Number of events
 * @param coalitionRaw - Raw coalition text
 * @param s - Localized SWOT builder strings
 * @returns Stakeholder views map
 */
function buildBreakingMDStakeholders(
  adoptedCount: number,
  anomalyRaw: string,
  procCount: number,
  eventCount: number,
  coalitionRaw: string,
  s: SwotBuilderStrings
): Partial<Record<StakeholderType, SwotAnalysis>> {
  return {
    citizen: {
      strengths:
        adoptedCount > 0
          ? [{ text: s.breakingAdopted(adoptedCount), severity: 'medium' as const }]
          : [],
      weaknesses: anomalyRaw
        ? [{ text: s.breakingAnomalyWeakness, severity: 'high' as const }]
        : [],
      opportunities:
        procCount > 0
          ? [{ text: s.breakingProceduresActive(procCount), severity: 'medium' as const }]
          : [],
      threats: anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'high' as const }] : [],
    },
    media: {
      strengths:
        eventCount > 0 ? [{ text: s.breakingEvents(eventCount), severity: 'high' as const }] : [],
      weaknesses: [],
      opportunities: coalitionRaw
        ? [{ text: s.breakingCoalitionOpportunity, severity: 'medium' as const }]
        : [],
      threats: [{ text: s.breakingRapidEvents, severity: 'medium' as const }],
    },
  };
}

/**
 * Compute weakness and opportunity items for breaking news based on procedure count.
 * Returns a weakness when no procedures exist, or an opportunity when they do.
 *
 * @param procCount - Number of active procedures
 * @param s - Localized SWOT builder strings
 * @returns Tuple of weakness items and opportunity items
 */
function getBreakingProcedureItems(
  procCount: number,
  s: SwotBuilderStrings
): [SwotItem[], SwotItem[]] {
  if (procCount === 0) {
    return [[{ text: s.breakingNoProcedures, severity: 'medium' as const }], []];
  }
  return [[], [{ text: s.breakingProceduresActive(procCount), severity: 'medium' as const }]];
}

/**
 * Build the 5 SWOT dimensions for breaking news multi-dimensional SWOT.
 *
 * @param adoptedCount - Number of adopted texts
 * @param anomalyRaw - Raw anomaly text
 * @param coalitionRaw - Raw coalition text
 * @param procCount - Number of active procedures
 * @param eventCount - Number of events
 * @param s - Localized SWOT builder strings
 * @returns Array of 5 SwotDimension objects
 */
function buildBreakingMDDimensions(
  adoptedCount: number,
  anomalyRaw: string,
  coalitionRaw: string,
  procCount: number,
  eventCount: number,
  s: SwotBuilderStrings
): SwotDimension[] {
  const [procWeakness, procOpportunity] = getBreakingProcedureItems(procCount, s);
  const political = makeDimension(
    'political',
    adoptedCount > 0 ? [{ text: s.breakingAdopted(adoptedCount), severity: 'high' as const }] : [],
    anomalyRaw ? [{ text: s.breakingAnomalyWeakness, severity: 'high' as const }] : [],
    coalitionRaw ? [{ text: s.breakingCoalitionOpportunity, severity: 'medium' as const }] : [],
    anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'high' as const }] : []
  );
  const economic = makeDimension(
    'economic',
    adoptedCount > 0
      ? [{ text: s.breakingAdopted(adoptedCount), severity: 'medium' as const }]
      : [],
    procWeakness,
    procOpportunity,
    [{ text: s.breakingRapidEvents, severity: 'medium' as const }]
  );
  const social = makeDimension(
    'social',
    eventCount > 0 ? [{ text: s.breakingEvents(eventCount), severity: 'medium' as const }] : [],
    [],
    procOpportunity,
    [{ text: s.breakingRapidEvents, severity: 'medium' as const }]
  );
  const legal = makeDimension(
    'legal',
    adoptedCount > 0 ? [{ text: s.breakingAdopted(adoptedCount), severity: 'high' as const }] : [],
    procWeakness,
    procOpportunity,
    anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'high' as const }] : []
  );
  const geopolitical = makeDimension(
    'geopolitical',
    eventCount > 0 ? [{ text: s.breakingEvents(eventCount), severity: 'medium' as const }] : [],
    [],
    coalitionRaw ? [{ text: s.breakingCoalitionOpportunity, severity: 'medium' as const }] : [],
    anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'medium' as const }] : []
  );
  return [political, economic, social, legal, geopolitical];
}

/**
 * Build deep analysis for breaking news articles.
 *
 * @param date - Publication date
 * @param feedData - EP feed data
 * @param anomalyRaw - Raw anomaly text
 * @param coalitionRaw - Raw coalition text
 * @param lang - Target display language (default: 'en')
 * @returns Deep analysis object
 */
export function buildBreakingAnalysis(
  date: string,
  feedData: BreakingNewsFeedData | undefined,
  anomalyRaw: string,
  coalitionRaw: string,
  lang: LanguageCode = 'en'
): DeepAnalysis {
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;
  const mepCount = feedData?.mepUpdates.length ?? 0;
  const s = getLocalizedString(BREAKING_STRINGS, lang);

  return {
    what: s.breakingWhatFn(date, adoptedCount, eventCount, procCount, mepCount),
    who: [
      ...(feedData?.adoptedTexts
        .slice(0, 3)
        .map((t) => `${s.breakingAdoptedPrefix} ${t.title}${t.date ? ` (${t.date})` : ''}`) ?? []),
      ...(feedData?.mepUpdates
        .slice(0, 2)
        .map((m) => `${s.breakingMEPPrefix} ${m.name}${m.date ? ` (${m.date})` : ''}`) ?? []),
    ],
    when: [
      `${date}`,
      ...(feedData?.events.slice(0, 3).map((e) => `${e.title}${e.date ? ` (${e.date})` : ''}`) ??
        []),
    ],
    why: AI_MARKER,
    stakeholderOutcomes: [
      ...(adoptedCount > 0
        ? [
            {
              actor: s.breakingWinnerActor,
              outcome: 'winner' as const,
              reason: AI_MARKER,
            },
          ]
        : []),
      ...(coalitionRaw
        ? [
            {
              actor: s.breakingNeutralActor,
              outcome: 'neutral' as const,
              reason: AI_MARKER,
            },
          ]
        : []),
    ],
    impactAssessment: {
      political: AI_MARKER,
      economic: AI_MARKER,
      social: AI_MARKER,
      legal: AI_MARKER,
      geopolitical: AI_MARKER,
    },
    actionConsequences: [
      ...(feedData?.adoptedTexts.slice(0, 2).map((t) => ({
        action: `${s.breakingAdoptedPrefix} "${t.title}"${t.date ? ` (${t.date})` : ''}`,
        consequence: AI_MARKER,
        severity: 'high' as const,
      })) ?? []),
      ...(feedData?.procedures.slice(0, 2).map((p) => ({
        action: `${p.title}${p.date ? ` (${p.date})` : ''}`,
        consequence: AI_MARKER,
        severity: 'medium' as const,
      })) ?? []),
    ],
    mistakes: anomalyRaw
      ? [
          {
            actor: s.breakingMistakeActor,
            description: `Voting anomaly detected: ${anomalyRaw.slice(0, 200)}`,
            alternative: AI_MARKER,
          },
        ]
      : [],
    outlook: AI_MARKER,
    stakeholderPerspectives: buildBreakingStakeholderPerspectives(
      adoptedCount,
      feedData?.adoptedTexts[0]?.title ?? `EP activity ${date}`
    ),
    stakeholderOutcomeMatrix: buildOutcomeMatrix([
      {
        action: `EP breaking news ${date}`,
        scores: {
          political_groups: 0.9,
          civil_society: adoptedCount > 0 ? 0.6 : 0.4,
          industry: adoptedCount > 0 ? 0.7 : 0.4,
          national_govts: 0.7,
          citizens: adoptedCount > 0 ? 0.6 : 0.3,
          eu_institutions: 0.9,
        },
        confidence: adoptedCount > 0 ? 'high' : 'medium',
      },
    ]),
  };
}

/**
 * Build SWOT analysis for breaking news articles.
 *
 * @param feedData - EP feed data
 * @param anomalyRaw - Raw anomaly text
 * @param coalitionRaw - Raw coalition text
 * @param lang - Target language code
 * @returns SWOT analysis data
 */
export function buildBreakingSwot(
  feedData: BreakingNewsFeedData | undefined,
  anomalyRaw: string,
  coalitionRaw: string,
  lang: LanguageCode = 'en'
): SwotAnalysis {
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;

  return {
    strengths: [
      ...(adoptedCount > 0
        ? [
            {
              text: s.breakingAdopted(adoptedCount),
              severity: 'high' as const,
            },
          ]
        : []),
      ...(eventCount > 0
        ? [
            {
              text: s.breakingEvents(eventCount),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(anomalyRaw
        ? [
            {
              text: s.breakingAnomalyWeakness,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(procCount === 0
        ? [
            {
              text: s.breakingNoProcedures,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      ...(procCount > 0
        ? [
            {
              text: s.breakingProceduresActive(procCount),
              severity: 'medium' as const,
            },
          ]
        : []),
      ...(coalitionRaw
        ? [
            {
              text: s.breakingCoalitionOpportunity,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(anomalyRaw
        ? [
            {
              text: s.breakingAnomalyThreat,
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: s.breakingRapidEvents,
        severity: 'medium' as const,
      },
    ],
  };
}

/**
 * Build dashboard for breaking news articles.
 * Includes activity trend sparklines for cross-article analysis.
 *
 * @param feedData - EP feed data
 * @param lang - Target language code
 * @returns Dashboard configuration with trend intelligence
 */
export function buildBreakingDashboard(
  feedData: BreakingNewsFeedData | undefined,
  lang: LanguageCode = 'en'
): DashboardConfig {
  const d: DashboardBuilderStrings = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;
  const mepCount = feedData?.mepUpdates.length ?? 0;
  const totalItems = adoptedCount + eventCount + procCount + mepCount;

  const feedPanel = {
    title: d.feedActivity,
    metrics: [
      {
        label: d.adoptedTexts,
        value: String(adoptedCount),
        trend: adoptedCount > 0 ? ('up' as const) : ('stable' as const),
      },
      { label: d.events, value: String(eventCount) },
      { label: d.procedures, value: String(procCount) },
      { label: d.mepUpdates, value: String(mepCount) },
    ],
  };

  const summaryPanel = {
    title: d.activitySummary,
    metrics: [{ label: d.totalItems, value: String(totalItems) }],
    ...(totalItems > 0
      ? {
          chart: {
            type: 'doughnut' as const,
            title: d.feedBreakdown,
            data: {
              labels: [d.adoptedTexts, d.events, d.procedures, d.mepUpdates],
              datasets: [
                {
                  label: d.items,
                  data: [adoptedCount, eventCount, procCount, mepCount],
                },
              ],
            },
          },
        }
      : {}),
  };

  // Trend analytics from feed counts
  const feedCounts = [adoptedCount, eventCount, procCount, mepCount];
  const trend = buildTrendFromCounts(feedCounts, 'weekly');
  const trendPanel = buildGenericTrendPanel(
    d,
    trend,
    [d.adoptedTexts, d.events, d.procedures, d.mepUpdates],
    d.feedActivity
  );

  const panels = [feedPanel, summaryPanel, ...(trendPanel ? [trendPanel] : [])];

  return { panels };
}

/**
 * Build intelligence mindmap for breaking news articles.
 *
 * Maps EP feed categories (adopted texts, events, procedures, MEP updates)
 * as policy domain nodes with recent activity sub-nodes.
 *
 * @param feedData - Breaking news EP feed data
 * @param _lang - Reserved for future localisation (default: 'en')
 * @returns Intelligence mindmap data
 */
export function buildBreakingMindmap(
  feedData: BreakingNewsFeedData | undefined,
  _lang: LanguageCode = 'en'
): IntelligenceMindmap | null {
  void _lang;
  const adoptedTexts = feedData?.adoptedTexts ?? [];
  const events = feedData?.events ?? [];
  const procedures = feedData?.procedures ?? [];
  const mepUpdates = feedData?.mepUpdates ?? [];

  const domainNodes: MindmapNode[] = [
    {
      id: 'adopted',
      label: 'Adopted Texts',
      category: 'policy_domain' as const,
      influence: Math.min(1, adoptedTexts.length / 5),
      color: 'green' as const,
      children: adoptedTexts.slice(0, 3).map((t, i) => ({
        id: `adopted-${i}`,
        label: t.title ? t.title.slice(0, 50) : 'Adopted measure',
        category: 'outcome' as const,
        influence: 0.7,
        color: 'green' as const,
        children: [],
        metadata: { documentRef: t.title?.slice(0, 30) },
      })),
    },
    {
      id: 'events',
      label: 'Parliamentary Events',
      category: 'policy_domain' as const,
      influence: Math.min(1, events.length / 5),
      color: 'blue' as const,
      children: events.slice(0, 3).map((ev, i) => ({
        id: `event-${i}`,
        label: ev.title ? ev.title.slice(0, 50) : 'Parliamentary event',
        category: 'action' as const,
        influence: 0.6,
        color: 'blue' as const,
        children: [],
      })),
    },
    {
      id: 'procedures',
      label: 'Active Procedures',
      category: 'policy_domain' as const,
      influence: Math.min(1, procedures.length / 5),
      color: 'orange' as const,
      children: procedures.slice(0, 3).map((p, i) => ({
        id: `procedure-${i}`,
        label: p.title ? p.title.slice(0, 50) : 'Legislative procedure',
        category: 'action' as const,
        influence: 0.65,
        color: 'orange' as const,
        children: [],
      })),
    },
    {
      id: 'meps',
      label: 'MEP Updates',
      category: 'policy_domain' as const,
      influence: Math.min(1, mepUpdates.length / 5),
      color: 'purple' as const,
      children: mepUpdates.slice(0, 2).map((m, i) => ({
        id: `mep-${i}`,
        label: m.name ? m.name.slice(0, 50) : 'MEP activity',
        category: 'actor' as const,
        influence: 0.55,
        color: 'purple' as const,
        children: [],
      })),
    },
  ].filter((n) => n.influence > 0 || n.children.length > 0);

  if (domainNodes.length === 0) {
    return null;
  }

  const actorNetwork: ActorNode[] = [
    {
      id: 'ep-parliament',
      name: 'European Parliament',
      type: 'committee' as const,
      influence: 1.0,
      connections: domainNodes.map((n) => n.id),
    },
    ...mepUpdates.slice(0, 3).map((m, i) => ({
      id: `mep-actor-${i}`,
      name: m.name ? m.name.slice(0, 40) : 'MEP',
      type: 'mep' as const,
      influence: 0.6,
      connections: ['meps'],
    })),
  ];

  const connections: PolicyConnection[] = [
    ...(adoptedTexts.length > 0 && procedures.length > 0
      ? [
          {
            from: 'adopted',
            to: 'procedures',
            strength: 'strong' as const,
            type: 'legislative' as const,
            evidence: 'Adopted texts conclude active legislative procedures',
          },
        ]
      : []),
    ...(events.length > 0 && procedures.length > 0
      ? [
          {
            from: 'events',
            to: 'procedures',
            strength: 'moderate' as const,
            type: 'procedural' as const,
            evidence: 'Parliamentary events drive procedure progression',
          },
        ]
      : []),
  ];

  const totalItems = adoptedTexts.length + events.length + procedures.length + mepUpdates.length;

  return {
    centralTopic: 'Breaking News Intelligence',
    layers: [{ depth: 1, nodes: domainNodes }],
    connections,
    actorNetwork,
    stakeholderGroups: ['Parliament', 'Commission', 'Council', 'Public'],
    summary: `${totalItems} feed items detected across ${domainNodes.length} activity categories.`,
  };
}

/**
 * Build multi-dimensional SWOT analysis for breaking news articles.
 *
 * @param feedData - EP feed data
 * @param anomalyRaw - Raw anomaly text
 * @param coalitionRaw - Raw coalition text
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data
 */
export function buildBreakingMultiDimensionalSwot(
  feedData: BreakingNewsFeedData | undefined,
  anomalyRaw: string,
  coalitionRaw: string,
  lang: LanguageCode = 'en'
): MultiDimensionalSwot {
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const base = buildBreakingSwot(feedData, anomalyRaw, coalitionRaw, lang);
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;

  const dimensions = buildBreakingMDDimensions(
    adoptedCount,
    anomalyRaw,
    coalitionRaw,
    procCount,
    eventCount,
    s
  );

  const temporal: TemporalSwotAssessment = {
    shortTerm: base,
    mediumTerm: {
      strengths: base.strengths.filter((i) => i.severity === 'high'),
      weaknesses: base.weaknesses,
      opportunities: base.opportunities,
      threats: base.threats.filter((i) => i.severity === 'high'),
    },
  };

  const stakeholderViews = buildBreakingMDStakeholders(
    adoptedCount,
    anomalyRaw,
    procCount,
    eventCount,
    coalitionRaw,
    s
  );

  return {
    dimensions,
    temporal,
    stakeholderViews,
  };
}
