// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Builders/ProspectiveBuilders
 * @description Deep analysis, SWOT, Dashboard, Mindmap and Multi-Dimensional SWOT
 * builders for prospective (week-ahead / month-ahead) articles.
 */

import type {
  DeepAnalysis,
  WeekAheadData,
  DateRange,
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
  StakeholderOutcomeMatrix,
  LegislativePipeline,
  TrendAnalytics,
  MultiDimensionalSwot,
  SwotDimension,
  SwotItem,
  TemporalSwotAssessment,
  StakeholderType,
} from '../../types/index.js';
import {
  getLocalizedString,
  SWOT_BUILDER_STRINGS,
  DASHBOARD_BUILDER_STRINGS,
} from '../../constants/languages.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import {
  buildOutcomeMatrix,
  buildTrendFromCounts,
  buildGenericTrendPanel,
  CIVIL_SOCIETY,
  makeDimension,
} from './shared-builders.js';

function buildProspectiveStakeholderPerspectives(
  eventCount: number,
  bottleneckCount: number,
  topic: string
): StakeholderPerspective[] {
  return buildDefaultStakeholderPerspectives(topic, {
    political_groups: eventCount > 5 ? 0.8 : 0.6,
    civil_society: 0.5,
    industry: bottleneckCount > 0 ? 0.3 : 0.6,
    national_govts: 0.7,
    citizens: 0.5,
    eu_institutions: 0.8,
  });
}

/**
 * Build multi-stakeholder perspectives for a breaking news analysis.
 *
 * @param adoptedCount - Number of adopted texts in the feed
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */

function buildPipelineFromWeekData(weekData: WeekAheadData): LegislativePipeline {
  const bottlenecked = weekData.pipeline.filter((p) => p.bottleneck === true).length;
  const total = weekData.pipeline.length;
  const onTrack = total - bottlenecked;
  const healthScore = total > 0 ? Math.round((onTrack / total) * 100) : 100;

  return {
    healthScore,
    onTrack,
    delayed: bottlenecked,
    blocked: 0,
    fastTracked: 0,
    total,
  };
}

/**
 * Build legislative pipeline data from PipelineData.
 *
 * @param pipelineData - Pipeline metrics or null
 * @returns Legislative pipeline object
 */

export function buildProspectiveAnalysis(
  weekData: WeekAheadData,
  dateRange: DateRange,
  label: string
): DeepAnalysis {
  const eventCount = weekData.events.length;
  const committeeCount = weekData.committees.length;
  const docCount = weekData.documents.length;
  const pipelineCount = weekData.pipeline.length;
  const questionCount = weekData.questions.length;
  const bottleneckProcedures = weekData.pipeline.filter((p) => p.bottleneck === true);

  return {
    what: `European Parliament ${label} ahead (${dateRange.start} to ${dateRange.end}): ${eventCount} plenary events, ${committeeCount} committee meetings, ${docCount} legislative documents, ${pipelineCount} pipeline procedures, ${questionCount} parliamentary questions scheduled.`,
    who: [
      ...weekData.events.slice(0, 3).map((e) => `${e.type}: ${e.title}`),
      ...weekData.committees
        .slice(0, 3)
        .map((c) => `${c.committeeName ?? c.committee} — ${c.agenda?.length ?? 0} agenda items`),
    ],
    when: [
      `Period: ${dateRange.start} to ${dateRange.end}`,
      ...weekData.events.slice(0, 4).map((e) => `${e.date}: ${e.title}`),
    ],
    why: AI_MARKER,
    stakeholderOutcomes: [
      ...(bottleneckProcedures.length > 0
        ? [
            {
              actor: 'Legislative pipeline',
              outcome: 'loser' as const,
              reason: AI_MARKER,
            },
          ]
        : []),
      ...(weekData.committees.length > 3
        ? [
            {
              actor: 'Committee system',
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
      ...bottleneckProcedures.slice(0, 2).map((p) => ({
        action: `"${p.title}" in ${p.stage ?? 'committee'} stage`,
        consequence: AI_MARKER,
        severity: 'high' as const,
      })),
      ...weekData.events.slice(0, 2).map((e) => ({
        action: `${e.type} on "${e.title}"`,
        consequence: AI_MARKER,
        severity: 'medium' as const,
      })),
    ],
    mistakes: bottleneckProcedures.slice(0, 2).map((p) => ({
      actor: 'Legislative coordinators',
      description: `"${p.title}" has reached bottleneck status at ${p.stage ?? 'committee'} stage`,
      alternative: AI_MARKER,
    })),
    outlook: AI_MARKER,
    stakeholderPerspectives: buildProspectiveStakeholderPerspectives(
      eventCount,
      bottleneckProcedures.length,
      weekData.events[0]?.title ?? `${label} ahead`
    ),
    stakeholderOutcomeMatrix: buildOutcomeMatrix([
      {
        action: `${label}-ahead schedule (${dateRange.start}–${dateRange.end})`,
        scores: {
          political_groups: eventCount > 5 ? 0.8 : 0.6,
          civil_society: 0.5,
          industry: bottleneckProcedures.length > 0 ? 0.3 : 0.6,
          national_govts: 0.7,
          citizens: questionCount > 0 ? 0.6 : 0.4,
          eu_institutions: 0.8,
        },
        confidence: eventCount > 0 ? 'medium' : 'low',
      },
    ]),
  };
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

export function buildProspectiveSwot(
  weekData: WeekAheadData,
  _label: string,
  lang: LanguageCode = 'en'
): SwotAnalysis {
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;
  return {
    strengths: [
      ...(weekData.events.length > 0
        ? [
            {
              text: s.prospectiveEvents(weekData.events.length),
              severity: 'high' as const,
            },
          ]
        : []),
      ...(weekData.committees.length > 0
        ? [
            {
              text: s.prospectiveCommittees(weekData.committees.length),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(bottleneckCount > 0
        ? [
            {
              text: s.prospectiveBottlenecks(bottleneckCount),
              severity: 'high' as const,
            },
          ]
        : []),
      ...(weekData.events.length > 5
        ? [
            {
              text: s.prospectiveHighDensity(weekData.events.length),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      ...(weekData.documents.length > 0
        ? [
            {
              text: s.prospectiveDocuments(weekData.documents.length),
              severity: 'medium' as const,
            },
          ]
        : []),
      ...(weekData.questions.length > 0
        ? [
            {
              text: s.prospectiveQuestions(weekData.questions.length),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(bottleneckCount > 0
        ? [
            {
              text: s.prospectiveBottleneckRisk,
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: s.prospectiveSchedulingRisk,
        severity: 'medium' as const,
      },
    ],
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

export function buildProspectiveDashboard(
  weekData: WeekAheadData,
  _label: string,
  lang: LanguageCode = 'en'
): DashboardConfig {
  const d: DashboardBuilderStrings = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
  const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;

  const scheduledPanel = {
    title: d.scheduledActivity,
    metrics: [
      { label: d.plenaryEvents, value: String(weekData.events.length) },
      { label: d.committeeMeetings, value: String(weekData.committees.length) },
      { label: d.documents, value: String(weekData.documents.length) },
      {
        label: d.pipelineProcedures,
        value: String(weekData.pipeline.length),
        trend: bottleneckCount > 0 ? ('down' as const) : ('stable' as const),
      },
    ],
  };

  const questionsPanel = {
    title: d.parliamentaryQuestions,
    metrics: [
      { label: d.questionsFiled, value: String(weekData.questions.length) },
      {
        label: d.bottleneckProcedures,
        value: String(bottleneckCount),
        trend: bottleneckCount > 0 ? ('down' as const) : ('up' as const),
      },
    ],
  };

  // Pipeline status panel
  const pipeline = buildPipelineFromWeekData(weekData);
  const pipelinePanel =
    pipeline.total > 0
      ? {
          title: d.pipelineStatus,
          metrics: [
            {
              label: d.onTrack,
              value: String(pipeline.onTrack),
              trend: pipeline.onTrack > pipeline.delayed ? ('up' as const) : ('stable' as const),
            },
            {
              label: d.delayed,
              value: String(pipeline.delayed),
              trend: pipeline.delayed > 0 ? ('down' as const) : ('stable' as const),
            },
            { label: d.healthScore, value: `${pipeline.healthScore}%` },
          ],
          chart: {
            type: 'bar' as const,
            title: d.pipelineStatusChart,
            data: {
              labels: [d.onTrack, d.delayed],
              datasets: [
                {
                  label: d.procedures,
                  data: [pipeline.onTrack, pipeline.delayed],
                  backgroundColor: ['#28a745', '#ffc107'],
                },
              ],
            },
          },
        }
      : null;

  // Trend analytics from activity counts
  const activityCounts = [
    weekData.events.length,
    weekData.committees.length,
    weekData.documents.length,
    weekData.questions.length,
  ].filter((c) => c > 0);
  const trend = activityCounts.length >= 2 ? buildTrendFromCounts(activityCounts, 'weekly') : null;
  const trendPanel = buildGenericTrendPanel(
    d,
    trend,
    [d.plenaryEvents, d.committeeMeetings, d.documents, d.questionsFiled],
    d.scheduledActivity
  );

  const panels = [
    scheduledPanel,
    questionsPanel,
    ...(pipelinePanel ? [pipelinePanel] : []),
    ...(trendPanel ? [trendPanel] : []),
  ];

  return { panels };
}

/**
 * Build dashboard for breaking news articles.
 * Includes activity trend sparklines for cross-article analysis.
 *
 * @param feedData - EP feed data
 * @param lang - Target language code
 * @returns Dashboard configuration with trend intelligence
 */

export function buildProspectiveMindmap(
  weekData: WeekAheadData,
  _lang: LanguageCode = 'en'
): IntelligenceMindmap {
  void _lang;
  const policyDomains = [
    { id: 'envi', label: 'Environment & Climate', color: 'green' as const },
    { id: 'econ', label: 'Economy & Finance', color: 'cyan' as const },
    { id: 'afet', label: 'Foreign Affairs', color: 'blue' as const },
    { id: 'libe', label: 'Civil Liberties', color: 'purple' as const },
    { id: 'agri', label: 'Agriculture', color: 'yellow' as const },
  ];

  const events = weekData.events ?? [];
  const pipeline = weekData.pipeline ?? [];
  const pipelineSlice = pipeline.slice(0, 4);
  const bottleneckCount = pipelineSlice.filter((p) => p.bottleneck === true).length;

  const domainNodes: MindmapNode[] = policyDomains.map((domain, i) => {
    const relatedEvents = events.slice(i * 2, i * 2 + 2);
    const children: MindmapNode[] = relatedEvents.map((ev, ei) => ({
      id: `event-${i}-${ei}`,
      label: ev.title ? ev.title.slice(0, 50) : 'Scheduled event',
      category: 'action' as const,
      influence: 0.6,
      color: 'orange',
      children: [],
    }));

    return {
      id: domain.id,
      label: domain.label,
      category: 'policy_domain' as const,
      influence: 0.5 + (relatedEvents.length > 0 ? 0.3 : 0),
      color: domain.color,
      children,
    };
  });

  // Build pipeline actor nodes preserving original indices as stable IDs
  const actorNetwork: ActorNode[] = [
    {
      id: 'ep-plenary',
      name: 'Plenary Session',
      type: 'committee' as const,
      influence: 0.95,
      connections: policyDomains.map((d) => d.id),
    },
    ...pipelineSlice.map((p, i) => ({
      id: `pipeline-${i}`,
      name: p.title ? p.title.slice(0, 40) : 'Legislative procedure',
      type: 'external' as const,
      influence: p.bottleneck === true ? 0.85 : 0.5,
      connections: [],
    })),
  ];

  // Filter bottlenecks from the same slice, keeping original index for stable IDs
  const connections: PolicyConnection[] = pipelineSlice
    .map((p, origIdx) => ({ p, origIdx }))
    .filter(({ p }) => p.bottleneck === true)
    .slice(0, 3)
    .map(({ p, origIdx }, i) => ({
      from: policyDomains[i % policyDomains.length]?.id ?? 'envi',
      to: `pipeline-${origIdx}`,
      strength: 'strong' as const,
      type: 'legislative' as const,
      evidence: p.title ? p.title.slice(0, 60) : 'Legislative bottleneck',
    }));

  return {
    centralTopic: 'Week Ahead: Parliamentary Priorities',
    layers: [{ depth: 1, nodes: domainNodes }],
    connections,
    actorNetwork,
    stakeholderGroups: ['Parliament', 'Council', 'Commission', CIVIL_SOCIETY],
    summary: `${events.length} events scheduled. ${bottleneckCount} legislative bottlenecks identified.`,
  };
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

export function buildProspectiveMultiDimensionalSwot(
  weekData: WeekAheadData,
  _label: string,
  lang: LanguageCode = 'en'
): MultiDimensionalSwot {
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const base = buildProspectiveSwot(weekData, _label, lang);
  const bottlenecks = weekData.pipeline.filter((p) => p.bottleneck === true).length;

  const political = makeDimension(
    'political',
    weekData.events.length > 0
      ? [{ text: s.prospectiveEvents(weekData.events.length), severity: 'high' as const }]
      : [],
    bottlenecks > 0
      ? [{ text: s.prospectiveBottlenecks(bottlenecks), severity: 'high' as const }]
      : [],
    [],
    bottlenecks > 0 ? [{ text: s.prospectiveBottleneckRisk, severity: 'high' as const }] : []
  );

  const economic = makeDimension(
    'economic',
    [],
    weekData.events.length > 5
      ? [{ text: s.prospectiveHighDensity(weekData.events.length), severity: 'medium' as const }]
      : [],
    weekData.documents.length > 0
      ? [{ text: s.prospectiveDocuments(weekData.documents.length), severity: 'medium' as const }]
      : [],
    [{ text: s.prospectiveSchedulingRisk, severity: 'medium' as const }]
  );

  const social = makeDimension(
    'social',
    weekData.committees.length > 0
      ? [{ text: s.prospectiveCommittees(weekData.committees.length), severity: 'medium' as const }]
      : [],
    [],
    weekData.questions.length > 0
      ? [{ text: s.prospectiveQuestions(weekData.questions.length), severity: 'medium' as const }]
      : [],
    []
  );

  const legal = makeDimension(
    'legal',
    [],
    bottlenecks > 0
      ? [{ text: s.prospectiveBottlenecks(bottlenecks), severity: 'high' as const }]
      : [],
    weekData.documents.length > 0
      ? [{ text: s.prospectiveDocuments(weekData.documents.length), severity: 'medium' as const }]
      : [],
    bottlenecks > 0 ? [{ text: s.prospectiveBottleneckRisk, severity: 'high' as const }] : []
  );

  const geopolitical = makeDimension(
    'geopolitical',
    weekData.events.length > 0
      ? [{ text: s.prospectiveEvents(weekData.events.length), severity: 'medium' as const }]
      : [],
    [],
    [],
    [{ text: s.prospectiveSchedulingRisk, severity: 'medium' as const }]
  );

  const temporal: TemporalSwotAssessment = {
    shortTerm: base,
    mediumTerm: {
      strengths: base.strengths,
      weaknesses: base.weaknesses.filter((i) => i.severity === 'high'),
      opportunities: base.opportunities,
      threats: base.threats.filter((i) => i.severity === 'high'),
    },
  };

  return {
    dimensions: [political, economic, social, legal, geopolitical],
    temporal,
  };
}

