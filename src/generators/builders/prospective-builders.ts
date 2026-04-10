// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Builders/ProspectiveBuilders
 * @description Deep analysis, SWOT, dashboard, mindmap and multi-dimensional SWOT
 * builders for prospective articles (week-ahead, month-ahead).
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
  MultiDimensionalSwot,
  TemporalSwotAssessment,
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
  buildPipelineFromWeekData,
  buildCategoryDistributionPanel,
  makeDimension,
  CIVIL_SOCIETY,
} from './shared-builders.js';

/**
 * Build multi-stakeholder perspectives for a prospective (week/month-ahead) analysis.
 *
 * @param eventCount - Number of scheduled events
 * @param bottleneckCount - Number of bottlenecked procedures
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
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
 * Build deep analysis for week-ahead/month-ahead articles.
 *
 * @param weekData - Aggregated week/month data
 * @param dateRange - Date range for the preview period
 * @param label - "week" or "month"
 * @returns Deep analysis object
 */
export function buildProspectiveAnalysis(
  weekData: WeekAheadData,
  dateRange: DateRange,
  label: 'week' | 'month'
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
 * Build SWOT analysis for week-ahead / month-ahead articles.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns SWOT analysis data
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
 * Build dashboard for week-ahead / month-ahead articles.
 * Includes pipeline status bars and trend analytics panels.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns Dashboard configuration with pipeline and trend intelligence
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

  // Category distribution — shows activity counts per category (not a time-series trend)
  const activityCounts = [
    weekData.events.length,
    weekData.committees.length,
    weekData.documents.length,
    weekData.questions.length,
  ];
  const categoryLabels = [d.plenaryEvents, d.committeeMeetings, d.documents, d.questionsFiled];
  const trendPanel = buildCategoryDistributionPanel(
    d,
    categoryLabels,
    activityCounts,
    d.scheduledActivity,
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
 * Build intelligence mindmap for week-ahead / month-ahead (prospective) articles.
 *
 * Maps scheduled parliamentary activities by policy domain with committee nodes
 * and pipeline bottleneck indicators.
 *
 * @param weekData - Aggregated week/month-ahead data
 * @param _lang - Reserved for future localisation (default: 'en')
 * @param label - Whether this is a "week" or "month" mindmap (default: 'week')
 * @returns Intelligence mindmap data
 */
export function buildProspectiveMindmap(
  weekData: WeekAheadData,
  _lang: LanguageCode = 'en',
  label: 'week' | 'month' = 'week'
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
    centralTopic:
      label === 'month'
        ? 'Month Ahead: Parliamentary Priorities'
        : 'Week Ahead: Parliamentary Priorities',
    layers: [{ depth: 1, nodes: domainNodes }],
    connections,
    actorNetwork,
    stakeholderGroups: ['Parliament', 'Council', 'Commission', CIVIL_SOCIETY],
    summary: `${events.length} events scheduled. ${pipeline.filter((p) => p.bottleneck === true).length} legislative bottlenecks identified.`,
  };
}

/**
 * Build multi-dimensional SWOT analysis for prospective (week/month-ahead) articles.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data
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
