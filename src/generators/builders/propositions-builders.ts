// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Builders/PropositionsBuilders
 * @description Deep analysis, SWOT, Dashboard, Mindmap and Multi-Dimensional SWOT
 * builders for legislative propositions/procedures articles.
 */

import type {
  DeepAnalysis,
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
  StakeholderMetric,
  MultiDimensionalSwot,
  SwotDimension,
  SwotItem,
  TemporalSwotAssessment,
  StakeholderType,
  StakeholderOutcome,
  ActionConsequence,
} from '../../types/index.js';
import type { PipelineData } from '../propositions-content.js';
import {
  getLocalizedString,
  SWOT_BUILDER_STRINGS,
  DASHBOARD_BUILDER_STRINGS,
} from '../../constants/languages.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import {
  buildOutcomeMatrix,
  buildAiMarkerImpactAssessment,
  buildStakeholderPanel,
  CIVIL_SOCIETY,
  makeDimension,
} from './shared-builders.js';

function buildPropositionsStakeholderPerspectives(
  healthScore: number,
  topic: string
): StakeholderPerspective[] {
  return buildDefaultStakeholderPerspectives(topic, {
    political_groups: 0.7,
    civil_society: healthScore < 0.5 ? 0.3 : 0.5,
    industry: healthScore < 0.5 ? 0.3 : 0.6,
    national_govts: healthScore < 0.5 ? 0.3 : 0.6,
    citizens: healthScore < 0.5 ? 0.2 : 0.5,
    eu_institutions: 0.8,
  });
}

/**
 * Build multi-stakeholder perspectives for a committee reports analysis.
 *
 * @param activePct - Percentage of committees with documents (0-100)
 * @param totalDocs - Total document count
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */

function buildPropositionsWhy(): string {
  return AI_MARKER;
}

/**
 * Localized names for the EP Conference of Presidents across supported languages.
 * Used to translate the actor name in the propositions deep-analysis mistake card.
 */
const CONFERENCE_OF_PRESIDENTS_EN = 'Conference of Presidents';

const CONFERENCE_OF_PRESIDENTS: Record<string, string> = {
  en: CONFERENCE_OF_PRESIDENTS_EN,
  sv: 'Presidentkonferensen',
  da: 'Formandskabskonferencen',
  no: 'Presidentkonferansen',
  fi: 'Puheenjohtajakonferenssi',
  de: 'Konferenz der Präsidenten',
  fr: 'Conférence des présidents',
  es: 'Conferencia de Presidentes',
  nl: 'Conferentie van voorzitters',
  ar: 'مؤتمر الرؤساء',
  he: 'ועידת הנשיאים',
  ja: '議長会議',
  ko: '의장단 회의',
  zh: '主席团会议',
};

/**
 * Get the localized Conference of Presidents name.
 *
 * @param lang - Target language code
 * @returns Localized name or English fallback
 */
function getConferenceOfPresidents(lang: string): string {
  if (!Object.hasOwn(CONFERENCE_OF_PRESIDENTS, lang)) return CONFERENCE_OF_PRESIDENTS_EN;
  // eslint-disable-next-line security/detect-object-injection -- key validated via Object.hasOwn
  return CONFERENCE_OF_PRESIDENTS[lang] ?? CONFERENCE_OF_PRESIDENTS_EN;
}

/**
 * Build the action-consequence pairs for propositions analysis.
 * Returns AI_MARKER for consequences so the AI agent writes real analysis.
 *
 * @param _pct - Pipeline health percentage as string
 * @param healthScore - Pipeline health score (0-1)
 * @param throughput - Throughput rate
 * @returns Action-consequence pairs with AI_MARKER for consequence text
 */
function buildPropositionsConsequences(
  _pct: string,
  healthScore: number,
  throughput: number
): ActionConsequence[] {
  const healthSeverity: ActionConsequence['severity'] =
    healthScore < 0.3 ? 'critical' : healthScore < 0.5 ? 'high' : 'medium';
  return [
    {
      action: `Pipeline health at ${_pct}%`,
      consequence: AI_MARKER,
      severity: healthSeverity,
    },
    {
      action: `Throughput rate at ${throughput}`,
      consequence: AI_MARKER,
      severity: throughput < 5 ? 'high' : 'low',
    },
  ];
}

/**
 * Build the primary stakeholder outcome for propositions analysis.
 * Reasoning text is deferred to the AI agent via AI_MARKER.
 *
 * @param _healthScore - Pipeline health score (used for outcome classification only)
 * @param _pct - Pipeline health percentage (unused — AI generates reasoning)
 * @returns Single stakeholder outcome with AI_MARKER reasoning
 */
function buildPropositionsStakeholderOutcome(
  _healthScore: number,
  _pct: string
): StakeholderOutcome {
  if (_healthScore > 0.7) {
    return {
      actor: 'Parliament presidency',
      outcome: 'winner',
      reason: AI_MARKER,
    };
  }
  return {
    actor: 'Pending legislation sponsors',
    outcome: 'loser',
    reason: AI_MARKER,
  };
}

/**
 * Build deep analysis for propositions articles.
 *
 * @param proposalsHtml - Proposals HTML (used to detect content presence)
 * @param pipelineData - Pipeline metrics
 * @param date - Publication date
 * @param lang - Target display language (default: 'en')
 * @param adoptedTextsHtml - Adopted texts HTML (also used to detect content presence)
 * @returns Deep analysis object
 */

function buildPipelineFromPipelineData(
  pipelineData: { healthScore: number; throughput: number } | null
): LegislativePipeline | null {
  if (!pipelineData) return null;
  const healthScore = Math.round(pipelineData.healthScore * 100);
  const total = pipelineData.throughput;
  if (total === 0) return null;

  const onTrack = Math.round(total * pipelineData.healthScore);
  const remaining = total - onTrack;
  const blocked = Math.round(remaining * 0.3);
  const delayed = remaining - blocked;

  return {
    healthScore,
    onTrack,
    delayed,
    blocked,
    fastTracked: 0,
    total,
  };
}

/**
 * Build trend analytics from feed data counts using the last 4 items as periods.
 *
 * @param counts - Array of activity counts per period
 * @param period - Trend period label
 * @returns Trend analytics object or null if no data
 */

function buildStakeholderMetricsFromPipeline(
  pipeline: LegislativePipeline | null
): StakeholderMetric[] {
  if (!pipeline || pipeline.total === 0) return [];
  return [
    {
      stakeholder: 'Legislators',
      impactScore: pipeline.healthScore,
      impactDirection:
        pipeline.healthScore > 70 ? 'positive' : pipeline.healthScore < 40 ? 'negative' : 'neutral',
    },
    {
      stakeholder: 'Pending proposals',
      impactScore: pipeline.total > 0 ? Math.round((pipeline.blocked / pipeline.total) * 100) : 0,
      impactDirection: pipeline.blocked > 0 ? 'negative' : 'neutral',
      description:
        pipeline.blocked > 0
          ? `${pipeline.blocked} blocked procedure${pipeline.blocked > 1 ? 's' : ''}`
          : undefined,
    },
  ];
}


function buildPropositionsPipelinePanel(
  d: DashboardBuilderStrings,
  pipeline: LegislativePipeline | null
): DashboardPanel | null {
  if (!pipeline) return null;
  return {
    title: d.pipelineStatus,
    metrics: [
      {
        label: d.onTrack,
        value: String(pipeline.onTrack),
        trend: (pipeline.onTrack > 0 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
      },
      {
        label: d.delayed,
        value: String(pipeline.delayed),
        trend: (pipeline.delayed > 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      },
      {
        label: d.blocked,
        value: String(pipeline.blocked),
        trend: (pipeline.blocked > 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      },
    ],
    chart: {
      type: 'bar' as const,
      title: d.pipelineStatusChart,
      data: {
        labels: [d.onTrack, d.delayed, d.blocked],
        datasets: [
          {
            label: d.procedures,
            data: [pipeline.onTrack, pipeline.delayed, pipeline.blocked],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          },
        ],
      },
    },
  };
}

/**
 * Resolve the pipeline strength label from a health score.
 *
 * @param d - Localized strings
 * @param healthScore - Health score 0-1
 * @returns Localized pipeline strength label
 */
function resolvePipelineStrengthLabel(d: DashboardBuilderStrings, healthScore: number): string {
  if (healthScore > 0.7) return d.pipelineStrong;
  if (healthScore > 0.4) return d.pipelineModerate;
  return d.pipelineWeak;
}

/**
 * Build dashboard for propositions articles.
 * Includes color-coded pipeline status chart and stakeholder scorecard.
 *
 * @param pipelineData - Pipeline metrics
 * @param lang - Target language code
 * @returns Dashboard configuration with pipeline intelligence panels
 */

export function buildPropositionsAnalysis(
  proposalsHtml: string,
  pipelineData: PipelineData | null,
  date: string,
  lang = 'en',
  adoptedTextsHtml = ''
): DeepAnalysis {
  const hasProposals = proposalsHtml.length > 0 || adoptedTextsHtml.length > 0;
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const pct = (healthScore * 100).toFixed(0);

  return {
    what: hasProposals
      ? `Legislative pipeline assessment as of ${date}: Active proposals under consideration.`
      : `Legislative pipeline assessment as of ${date}: No new proposals detected in this period.`,
    who: [
      'European Commission (proposal originator)',
      'Rapporteurs (responsible for steering through committee)',
      'Shadow rapporteurs (political group negotiators)',
      'Council of the EU (co-legislator)',
    ],
    when: [`Assessment date: ${date}`, 'Pipeline health reflects cumulative legislative progress'],
    why: buildPropositionsWhy(),
    stakeholderOutcomes: [buildPropositionsStakeholderOutcome(healthScore, pct)],
    impactAssessment: buildAiMarkerImpactAssessment(),
    actionConsequences: buildPropositionsConsequences(pct, healthScore, throughput),
    mistakes:
      healthScore < 0.5
        ? [
            {
              actor: getConferenceOfPresidents(lang),
              description: `Pipeline health dropped to ${pct}%`,
              alternative: AI_MARKER,
            },
          ]
        : [],
    outlook: AI_MARKER,
    stakeholderPerspectives: buildPropositionsStakeholderPerspectives(
      healthScore,
      `legislative pipeline as of ${date}`
    ),
    stakeholderOutcomeMatrix: buildOutcomeMatrix([
      {
        action: `Pipeline health at ${pct}% (throughput ${throughput})`,
        scores: {
          political_groups: 0.7,
          civil_society: healthScore < 0.5 ? 0.3 : 0.5,
          industry: healthScore < 0.5 ? 0.3 : 0.6,
          national_govts: healthScore < 0.5 ? 0.3 : 0.6,
          citizens: healthScore < 0.5 ? 0.2 : 0.5,
          eu_institutions: 0.8,
        },
        confidence: pipelineData !== null ? 'high' : 'low',
      },
    ]),
  };
}

/**
 * Build deep analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @param date - Publication date
 * @param lang - Target language code for localized content
 * @returns Deep analysis object, or `null` when all committee data is placeholder
 */

export function buildPropositionsSwot(
  pipelineData: PipelineData | null,
  lang: LanguageCode = 'en'
): SwotAnalysis {
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const pct = (healthScore * 100).toFixed(0);

  return {
    strengths: [
      ...(healthScore > 0.7
        ? [
            {
              text: s.propositionsHealthStrong(pct),
              severity: 'high' as const,
            },
          ]
        : []),
      ...(throughput >= 5
        ? [
            {
              text: s.propositionsThroughputGood(throughput),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(healthScore < 0.5
        ? [
            {
              text: s.propositionsHealthWeak(pct),
              severity: 'high' as const,
            },
          ]
        : []),
      ...(throughput < 5
        ? [
            {
              text: s.propositionsThroughputLow(throughput),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      {
        text: s.propositionsPrioritisation,
        severity: 'medium' as const,
      },
      {
        text: s.propositionsTrilogueAcceleration,
        severity: 'medium' as const,
      },
    ],
    threats: [
      ...(healthScore < 0.3
        ? [
            {
              text: s.propositionsCriticalCongestion,
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: s.propositionsOverlapping,
        severity: 'medium' as const,
      },
    ],
  };
}

export function buildPropositionsDashboard(
  pipelineData: PipelineData | null,
  lang: LanguageCode = 'en'
): DashboardConfig {
  const d: DashboardBuilderStrings = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const pct = (healthScore * 100).toFixed(0);

  const healthPanel = {
    title: d.pipelineHealth,
    metrics: [
      {
        label: d.healthScore,
        value: `${pct}%`,
        trend: (healthScore > 0.7 ? 'up' : healthScore < 0.5 ? 'down' : 'stable') as
          | 'up'
          | 'down'
          | 'stable',
      },
      {
        label: d.throughput,
        value: String(throughput),
        trend: throughput >= 5 ? ('up' as const) : ('down' as const),
      },
      {
        label: d.status,
        value: resolvePipelineStrengthLabel(d, healthScore),
      },
    ],
  };

  // Pipeline status breakdown panel
  const pipeline = buildPipelineFromPipelineData(pipelineData);
  const pipelinePanel = buildPropositionsPipelinePanel(d, pipeline);

  // Stakeholder impact scorecard for pipeline actors
  const stakeholderMetrics = buildStakeholderMetricsFromPipeline(pipeline);
  const stakeholderPanel = buildStakeholderPanel(d, stakeholderMetrics);

  const panels = [
    healthPanel,
    ...(pipelinePanel ? [pipelinePanel] : []),
    ...(stakeholderPanel ? [stakeholderPanel] : []),
  ];

  return { panels };
}

/**
 * Build dashboard for committee reports articles.
 * Includes document trend analytics alongside committee activity metrics.
 *
 * @param committees - Committee data list
 * @param lang - Target language code
 * @returns Dashboard configuration, or `null` when all committee data is placeholder
 */

export function buildPropositionsMindmap(
  pipelineData: { healthScore: number; throughput: number } | null,
  _lang: LanguageCode = 'en'
): IntelligenceMindmap {
  void _lang;
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const healthPct = (healthScore * 100).toFixed(0);

  const pipelineStages: MindmapNode[] = [
    {
      id: 'proposal',
      label: 'Commission Proposals',
      category: 'policy_domain' as const,
      influence: 0.9,
      color: 'cyan',
      children: [
        {
          id: 'proposal-review',
          label: 'Initial Committee Review',
          category: 'action' as const,
          influence: 0.7,
          color: 'cyan',
          children: [],
          metadata: { committee: 'Lead Committee' },
        },
      ],
    },
    {
      id: 'committee',
      label: 'Committee Stage',
      category: 'policy_domain' as const,
      influence: 0.85,
      color: 'green',
      children: [
        {
          id: 'rapporteur',
          label: 'Rapporteur Report',
          category: 'action' as const,
          influence: 0.8,
          color: 'green',
          children: [],
        },
        {
          id: 'amendments',
          label: 'Amendments',
          category: 'action' as const,
          influence: 0.75,
          color: 'yellow',
          children: [],
        },
      ],
    },
    {
      id: 'plenary',
      label: 'Plenary Vote',
      category: 'policy_domain' as const,
      influence: healthScore,
      color: healthScore > 0.7 ? 'green' : healthScore > 0.4 ? 'yellow' : 'red',
      children: [
        {
          id: 'plenary-debate',
          label: 'Debate',
          category: 'action' as const,
          influence: 0.7,
          color: 'blue',
          children: [],
        },
      ],
    },
    {
      id: 'trilogue',
      label: 'Inter-institutional Trilogue',
      category: 'policy_domain' as const,
      influence: 0.8,
      color: 'orange',
      children: [
        {
          id: 'council-position',
          label: 'Council Position',
          category: 'actor' as const,
          influence: 0.85,
          color: 'orange',
          children: [],
          metadata: { committee: 'Council of the EU' },
        },
      ],
    },
    {
      id: 'adoption',
      label: 'Final Adoption',
      category: 'outcome' as const,
      influence: healthScore > 0.5 ? 0.9 : 0.4,
      color: healthScore > 0.5 ? 'green' : 'red',
      children: [],
    },
  ];

  const actorNetwork: ActorNode[] = [
    {
      id: 'commission',
      name: 'European Commission',
      type: 'external' as const,
      influence: 0.9,
      connections: ['proposal'],
    },
    {
      id: 'parliament',
      name: 'European Parliament',
      type: 'committee' as const,
      influence: 0.95,
      connections: ['committee', 'plenary'],
    },
    {
      id: 'council',
      name: 'Council of the EU',
      type: 'external' as const,
      influence: 0.9,
      connections: ['trilogue', 'adoption'],
    },
  ];

  const connections: PolicyConnection[] = [
    {
      from: 'proposal',
      to: 'committee',
      strength: 'strong',
      type: 'legislative',
      evidence: 'Formal referral to committee',
    },
    {
      from: 'committee',
      to: 'plenary',
      strength: 'strong',
      type: 'procedural',
      evidence: 'Committee report referred to plenary',
    },
    {
      from: 'plenary',
      to: 'trilogue',
      strength: throughput > 5 ? 'strong' : 'moderate',
      type: 'legislative',
      evidence: 'Parliament position triggers inter-institutional negotiations',
    },
    {
      from: 'trilogue',
      to: 'adoption',
      strength: healthScore > 0.6 ? 'strong' : 'weak',
      type: 'legislative',
      evidence: `Pipeline health: ${healthPct}%`,
    },
  ];

  return {
    centralTopic: 'Legislative Pipeline Intelligence',
    layers: [{ depth: 1, nodes: pipelineStages }],
    connections,
    actorNetwork,
    stakeholderGroups: ['Commission', 'Parliament', 'Council', 'Businesses', CIVIL_SOCIETY],
    summary: `Pipeline health: ${healthPct}%. Throughput rate: ${throughput}. ${throughput > 5 ? 'Strong legislative momentum.' : 'Moderate legislative pace.'}`,
  };
}

/**
 * Build multi-dimensional SWOT analysis for propositions articles.
 *
 * @param pipelineData - Pipeline metrics
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data
 */
export function buildPropositionsMultiDimensionalSwot(
  pipelineData: PipelineData | null,
  lang: LanguageCode = 'en'
): MultiDimensionalSwot {
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const base = buildPropositionsSwot(pipelineData, lang);
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const pct = (healthScore * 100).toFixed(0);

  const political = makeDimension(
    'political',
    healthScore > 0.7 ? [{ text: s.propositionsHealthStrong(pct), severity: 'high' as const }] : [],
    healthScore < 0.5 ? [{ text: s.propositionsHealthWeak(pct), severity: 'high' as const }] : [],
    [{ text: s.propositionsPrioritisation, severity: 'medium' as const }],
    healthScore < 0.3 ? [{ text: s.propositionsCriticalCongestion, severity: 'high' as const }] : []
  );

  const economic = makeDimension(
    'economic',
    throughput >= 5
      ? [{ text: s.propositionsThroughputGood(throughput), severity: 'medium' as const }]
      : [],
    throughput < 5
      ? [{ text: s.propositionsThroughputLow(throughput), severity: 'medium' as const }]
      : [],
    [{ text: s.propositionsTrilogueAcceleration, severity: 'medium' as const }],
    [{ text: s.propositionsOverlapping, severity: 'medium' as const }]
  );

  const social = makeDimension(
    'social',
    [],
    [],
    [{ text: s.propositionsPrioritisation, severity: 'medium' as const }],
    healthScore < 0.3 ? [{ text: s.propositionsCriticalCongestion, severity: 'high' as const }] : []
  );

  const legal = makeDimension(
    'legal',
    healthScore > 0.7 ? [{ text: s.propositionsHealthStrong(pct), severity: 'high' as const }] : [],
    healthScore < 0.5 ? [{ text: s.propositionsHealthWeak(pct), severity: 'high' as const }] : [],
    [{ text: s.propositionsTrilogueAcceleration, severity: 'medium' as const }],
    [{ text: s.propositionsOverlapping, severity: 'medium' as const }]
  );

  const geopolitical = makeDimension(
    'geopolitical',
    throughput >= 5
      ? [{ text: s.propositionsThroughputGood(throughput), severity: 'medium' as const }]
      : [],
    [],
    [],
    healthScore < 0.3
      ? [{ text: s.propositionsCriticalCongestion, severity: 'high' as const }]
      : [{ text: s.propositionsOverlapping, severity: 'medium' as const }]
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

  const stakeholderViews: Partial<Record<StakeholderType, SwotAnalysis>> = {
    industry: {
      strengths:
        throughput >= 5
          ? [{ text: s.propositionsThroughputGood(throughput), severity: 'medium' as const }]
          : [],
      weaknesses:
        throughput < 5
          ? [{ text: s.propositionsThroughputLow(throughput), severity: 'medium' as const }]
          : [],
      opportunities: [{ text: s.propositionsTrilogueAcceleration, severity: 'medium' as const }],
      threats: [{ text: s.propositionsOverlapping, severity: 'medium' as const }],
    },
    government: {
      strengths:
        healthScore > 0.7
          ? [{ text: s.propositionsHealthStrong(pct), severity: 'high' as const }]
          : [],
      weaknesses:
        healthScore < 0.5
          ? [{ text: s.propositionsHealthWeak(pct), severity: 'high' as const }]
          : [],
      opportunities: [{ text: s.propositionsPrioritisation, severity: 'medium' as const }],
      threats:
        healthScore < 0.3
          ? [{ text: s.propositionsCriticalCongestion, severity: 'high' as const }]
          : [],
    },
  };

  return {
    dimensions: [political, economic, social, legal, geopolitical],
    temporal,
    stakeholderViews,
  };
}

