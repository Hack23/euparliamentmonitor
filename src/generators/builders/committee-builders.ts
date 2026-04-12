// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Builders/CommitteeBuilders
 * @description Deep analysis, SWOT, dashboard and mindmap
 * builders for committee report articles.
 */

import type {
  DeepAnalysis,
  CommitteeData,
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
  MindmapBranchColor,
} from '../../types/index.js';
import {
  getLocalizedString,
  COMMITTEE_ANALYSIS_CONTENT_STRINGS,
  SWOT_BUILDER_STRINGS,
  DASHBOARD_BUILDER_STRINGS,
} from '../../constants/languages.js';
import { isPlaceholderCommitteeData } from '../committee-helpers.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import {
  buildOutcomeMatrix,
  buildCategoryDistributionPanel,
} from './shared-builders.js';

// ─── Constant ─────────────────────────────────────────────────────────────────

/**
 * Build multi-stakeholder perspectives for a committee reports analysis.
 *
 * @param activePct - Percentage of committees with documents (0-100)
 * @param totalDocs - Total document count
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildCommitteeStakeholderPerspectives(
  activePct: number,
  totalDocs: number,
  topic: string
): StakeholderPerspective[] {
  return buildDefaultStakeholderPerspectives(topic, {
    political_groups: activePct > 70 ? 0.8 : 0.5,
    civil_society: totalDocs > 5 ? 0.6 : 0.4,
    industry: totalDocs > 5 ? 0.7 : 0.4,
    national_govts: activePct > 70 ? 0.7 : 0.4,
    citizens: totalDocs > 5 ? 0.5 : 0.3,
    eu_institutions: 0.8,
  });
}

/**
 * Build deep analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @param date - Publication date
 * @param lang - Target language code for localized content
 * @returns Deep analysis object, or `null` when all committee data is placeholder
 */
export function buildCommitteeAnalysis(
  committees: readonly CommitteeData[],
  date: string,
  lang: LanguageCode = 'en'
): DeepAnalysis | null {
  if (isPlaceholderCommitteeData(committees)) return null;
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
  const activePct = (activeCommittees.length / Math.max(committees.length, 1)) * 100;

  return {
    what:
      totalDocs === 0
        ? s.whatNoData.replace('{date}', date).replace('{total}', String(committees.length))
        : s.what
            .replace('{date}', date)
            .replace('{total}', String(committees.length))
            .replace('{docs}', String(totalDocs))
            .replace('{active}', String(activeCommittees.length)),
    who: committees.map(
      (c) =>
        `${c.name} (${c.abbreviation}) — ${s.chairLabel} ${c.chair}, ${c.members} ${s.membersLabel}`
    ),
    when: [
      `${s.reportDateLabel} ${date}`,
      ...committees
        .slice(0, 3)
        .flatMap((c) =>
          c.documents
            .slice(0, 1)
            .map((d) => `${c.abbreviation}: ${d.title}${d.date ? ` (${d.date})` : ''}`)
        ),
    ],
    why: AI_MARKER,
    stakeholderOutcomes: committees.slice(0, 4).map((c) => ({
      actor: `${c.name} (${c.abbreviation})`,
      outcome: (c.documents.length > 2
        ? 'winner'
        : c.documents.length > 0
          ? 'neutral'
          : 'loser') as 'winner' | 'loser' | 'neutral',
      reason: AI_MARKER,
    })),
    impactAssessment: {
      political: AI_MARKER,
      economic: AI_MARKER,
      social: AI_MARKER,
      legal: AI_MARKER,
      geopolitical: AI_MARKER,
    },
    actionConsequences: activeCommittees.slice(0, 3).map((c) => ({
      action: s.actionProcessed
        .replace('{abbr}', c.abbreviation)
        .replace('{n}', String(c.documents.length)),
      consequence: AI_MARKER,
      severity: (c.documents.length > 3 ? 'high' : 'medium') as 'high' | 'medium',
    })),
    mistakes: committees
      .filter((c) => c.documents.length === 0)
      .slice(0, 2)
      .map((c) => ({
        actor: `${c.name} (${c.abbreviation})`,
        description: `${c.name} (${c.abbreviation}) produced no documents in this period despite having ${c.members} members.`,
        alternative: AI_MARKER,
      })),
    outlook: AI_MARKER,
    stakeholderPerspectives: buildCommitteeStakeholderPerspectives(
      activePct,
      totalDocs,
      committees[0]?.name ?? 'EP committees'
    ),
    stakeholderOutcomeMatrix: buildOutcomeMatrix([
      {
        action: `Committee activity as of ${date} (${activeCommittees.length}/${committees.length} active)`,
        scores: {
          political_groups: activePct > 70 ? 0.8 : 0.5,
          civil_society: totalDocs > 5 ? 0.6 : 0.4,
          industry: totalDocs > 5 ? 0.7 : 0.4,
          national_govts: activePct > 70 ? 0.7 : 0.4,
          citizens: totalDocs > 5 ? 0.5 : 0.3,
          eu_institutions: 0.8,
        },
        confidence: committees.length > 0 ? 'high' : 'low',
      },
    ]),
  };
}

/**
 * Build SWOT analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @param lang - Target language code
 * @returns SWOT analysis data, or `null` when all committee data is placeholder
 */
export function buildCommitteeSwot(
  committees: readonly CommitteeData[],
  lang: LanguageCode = 'en'
): SwotAnalysis | null {
  if (isPlaceholderCommitteeData(committees)) return null;
  const s: SwotBuilderStrings = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const inactiveCount = committees.length - activeCommittees.length;

  return {
    strengths: [
      ...(activeCommittees.length > 0
        ? [
            {
              text: s.committeeActive(activeCommittees.length, committees.length),
              severity:
                activeCommittees.length >= committees.length * 0.7
                  ? ('high' as const)
                  : ('medium' as const),
            },
          ]
        : []),
      ...(totalDocs > 0
        ? [
            {
              text: s.committeeDocuments(totalDocs),
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(inactiveCount > 0
        ? [
            {
              text: s.committeeInactive(inactiveCount),
              severity:
                inactiveCount > committees.length * 0.3 ? ('high' as const) : ('medium' as const),
            },
          ]
        : []),
    ],
    opportunities: [
      {
        text: s.committeeCrossCollaboration,
        severity: 'medium' as const,
      },
      ...(committees.length > 0
        ? [
            {
              text: s.committeeHearings,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(inactiveCount > committees.length * 0.3
        ? [
            {
              text: s.committeeLowActivity,
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: s.committeeCompetingPriorities,
        severity: 'medium' as const,
      },
    ],
  };
}

/**
 * Build dashboard for committee reports articles.
 * Includes document trend analytics alongside committee activity metrics.
 *
 * @param committees - Committee data list
 * @param lang - Target language code
 * @returns Dashboard configuration, or `null` when all committee data is placeholder
 */
export function buildCommitteeDashboard(
  committees: readonly CommitteeData[],
  lang: LanguageCode = 'en'
): DashboardConfig | null {
  if (isPlaceholderCommitteeData(committees)) return null;
  const d: DashboardBuilderStrings = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const activePct =
    committees.length > 0 ? ((activeCommittees.length / committees.length) * 100).toFixed(0) : '0';

  const overviewPanel = {
    title: d.committeeOverview,
    metrics: [
      { label: d.totalCommittees, value: String(committees.length) },
      {
        label: d.activeCommittees,
        value: String(activeCommittees.length),
        trend:
          activeCommittees.length >= committees.length * 0.7 ? ('up' as const) : ('down' as const),
      },
      { label: d.activityRate, value: `${activePct}%` },
      { label: d.documentsProduced, value: String(totalDocs) },
    ],
  };

  const chartPanel =
    committees.length > 0
      ? (() => {
          const topCommittees = [...committees]
            .sort((a, b) => b.documents.length - a.documents.length)
            .slice(0, 6);
          return {
            title: d.documentOutputByCommittee,
            chart: {
              type: 'bar' as const,
              title: d.documentsPerCommittee,
              data: {
                labels: topCommittees.map((c) => c.abbreviation),
                datasets: [
                  {
                    label: d.documents,
                    data: topCommittees.map((c) => c.documents.length),
                  },
                ],
              },
            },
          };
        })()
      : null;

  // Category distribution — shows document counts per committee (not a time-series trend)
  const docCounts = committees.slice(0, 6).map((c) => c.documents.length);
  const committeeLabels = committees.slice(0, 6).map((c) => c.abbreviation);
  const trendPanel = buildCategoryDistributionPanel(
    d,
    committeeLabels,
    docCounts,
    d.documents,
    d.documentsProduced
  );

  const panels = [
    overviewPanel,
    ...(chartPanel ? [chartPanel] : []),
    ...(trendPanel ? [trendPanel] : []),
  ];

  return { panels };
}

/**
 * Build intelligence mindmap for committee reports articles.
 *
 * Maps committee activity as policy domain nodes with document output
 * and inter-committee relationship indicators.
 *
 * @param committees - Committee data list
 * @param _lang - Reserved for future localisation (default: 'en')
 * @returns Intelligence mindmap data, or null when all data is placeholder
 */
export function buildCommitteeMindmap(
  committees: readonly CommitteeData[],
  _lang: LanguageCode = 'en'
): IntelligenceMindmap | null {
  void _lang;
  if (isPlaceholderCommitteeData(committees)) return null;

  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  if (activeCommittees.length === 0) return null;

  const domainNodes: MindmapNode[] = activeCommittees.slice(0, 8).map((c, i) => {
    const influence = Math.min(1, c.documents.length / 10);
    const children: MindmapNode[] = c.documents.slice(0, 3).map((doc, di) => ({
      id: `doc-${i}-${di}`,
      label: doc.title ? doc.title.slice(0, 50) : 'Committee document',
      category: 'action' as const,
      influence: 0.6,
      color: 'blue' as const,
      children: [],
      metadata: { committee: c.abbreviation, documentRef: doc.title?.slice(0, 30) },
    }));

    const colors: readonly MindmapBranchColor[] = [
      'green',
      'cyan',
      'blue',
      'purple',
      'orange',
      'yellow',
      'magenta',
      'red',
    ];
    return {
      id: `committee-${c.abbreviation}`,
      label: c.abbreviation,
      category: 'policy_domain' as const,
      influence,
      color: colors[i % colors.length] ?? 'cyan',
      children,
      metadata: { committee: c.abbreviation },
    };
  });

  const actorNetwork: ActorNode[] = activeCommittees.slice(0, 6).map((c, i) => ({
    id: `committee-actor-${i}`,
    name: c.abbreviation,
    type: 'committee' as const,
    influence: Math.min(1, c.documents.length / 10),
    connections: domainNodes
      .filter((n) => n.id !== `committee-${c.abbreviation}`)
      .slice(0, 2)
      .map((n) => n.id),
  }));

  const connections: PolicyConnection[] = activeCommittees.slice(0, 3).flatMap((c, i) =>
    activeCommittees.slice(i + 1, i + 2).map((c2) => ({
      from: `committee-${c.abbreviation}`,
      to: `committee-${c2.abbreviation}`,
      strength: 'moderate' as const,
      type: 'thematic' as const,
      evidence: `Inter-committee collaboration between ${c.abbreviation} and ${c2.abbreviation}`,
    }))
  );

  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);

  return {
    centralTopic: 'Committee Intelligence Network',
    layers: [{ depth: 1, nodes: domainNodes }],
    connections,
    actorNetwork,
    stakeholderGroups: ['MEPs', 'Political Groups', 'Secretariat', 'External Experts'],
    summary: `${activeCommittees.length} active committees producing ${totalDocs} documents.`,
  };
}
