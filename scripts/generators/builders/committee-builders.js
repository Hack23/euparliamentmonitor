// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, COMMITTEE_ANALYSIS_CONTENT_STRINGS, SWOT_BUILDER_STRINGS, } from '../../constants/languages.js';
import { isPlaceholderCommitteeData } from '../committee-helpers.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import { buildOutcomeMatrix, makeDimension, } from './shared-builders.js';
function buildCommitteeStakeholderPerspectives(activePct, totalDocs, topic) {
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
 * Build the stakeholder outcome matrix for a list of key actions.
 * Used by all 5 analysis builders to populate the outcome matrix.
 *
 * @param actions - Array of (action, scores) pairs to include in the matrix
 * @returns Stakeholder outcome matrix rows
 */
function buildCommitteeMDStakeholders(active, committees, totalDocs, inactiveCount, s) {
    return {
        mep: {
            strengths: active.length > 0
                ? [
                    {
                        text: s.committeeActive(active.length, committees.length),
                        severity: 'high',
                    },
                ]
                : [],
            weaknesses: inactiveCount > 0
                ? [{ text: s.committeeInactive(inactiveCount), severity: 'medium' }]
                : [],
            opportunities: [{ text: s.committeeHearings, severity: 'medium' }],
            threats: [{ text: s.committeeCompetingPriorities, severity: 'medium' }],
        },
        ngo: {
            strengths: totalDocs > 0
                ? [{ text: s.committeeDocuments(totalDocs), severity: 'medium' }]
                : [],
            weaknesses: inactiveCount > committees.length * 0.3
                ? [{ text: s.committeeLowActivity, severity: 'high' }]
                : [],
            opportunities: [{ text: s.committeeCrossCollaboration, severity: 'medium' }],
            threats: [],
        },
    };
}
/**
 * Build multi-dimensional SWOT analysis for voting-based articles.
 *
 * Produces dimension-specific breakdowns (political, economic, social,
 * legal, geopolitical), temporal assessments, and stakeholder views
 * derived from voting records, patterns, and anomaly data.
 *
 * @param records - Voting records
 * @param patterns - Voting patterns
 * @param anomalies - Detected anomalies
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data
 */
export function buildCommitteeAnalysis(committees, date, lang = 'en') {
    if (isPlaceholderCommitteeData(committees))
        return null;
    const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
    const activeCommittees = committees.filter((c) => c.documents.length > 0);
    const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
    const activePct = (activeCommittees.length / Math.max(committees.length, 1)) * 100;
    return {
        what: totalDocs === 0
            ? s.whatNoData.replace('{date}', date).replace('{total}', String(committees.length))
            : s.what
                .replace('{date}', date)
                .replace('{total}', String(committees.length))
                .replace('{docs}', String(totalDocs))
                .replace('{active}', String(activeCommittees.length)),
        who: committees.map((c) => `${c.name} (${c.abbreviation}) — ${s.chairLabel} ${c.chair}, ${c.members} ${s.membersLabel}`),
        when: [
            `${s.reportDateLabel} ${date}`,
            ...committees
                .slice(0, 3)
                .flatMap((c) => c.documents
                .slice(0, 1)
                .map((d) => `${c.abbreviation}: ${d.title}${d.date ? ` (${d.date})` : ''}`)),
        ],
        why: AI_MARKER,
        stakeholderOutcomes: committees.slice(0, 4).map((c) => ({
            actor: `${c.name} (${c.abbreviation})`,
            outcome: (c.documents.length > 2
                ? 'winner'
                : c.documents.length > 0
                    ? 'neutral'
                    : 'loser'),
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
            severity: (c.documents.length > 3 ? 'high' : 'medium'),
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
        stakeholderPerspectives: buildCommitteeStakeholderPerspectives(activePct, totalDocs, committees[0]?.name ?? 'EP committees'),
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
// ─── SWOT builders ───────────────────────────────────────────────────────────
/**
 * Build SWOT analysis for voting-based articles (motions, weekly/monthly review).
 *
 * @param records - Voting records
 * @param patterns - Voting patterns
 * @param anomalies - Detected anomalies
 * @param lang - Target language code
 * @returns SWOT analysis data
 */
/**
 * Build SWOT analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @param lang - Target language code
 * @returns SWOT analysis data, or `null` when all committee data is placeholder
 */
export function buildCommitteeSwot(committees, lang = 'en') {
    if (isPlaceholderCommitteeData(committees))
        return null;
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const activeCommittees = committees.filter((c) => c.documents.length > 0);
    const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
    const inactiveCount = committees.length - activeCommittees.length;
    return {
        strengths: [
            ...(activeCommittees.length > 0
                ? [
                    {
                        text: s.committeeActive(activeCommittees.length, committees.length),
                        severity: activeCommittees.length >= committees.length * 0.7
                            ? 'high'
                            : 'medium',
                    },
                ]
                : []),
            ...(totalDocs > 0
                ? [
                    {
                        text: s.committeeDocuments(totalDocs),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        weaknesses: [
            ...(inactiveCount > 0
                ? [
                    {
                        text: s.committeeInactive(inactiveCount),
                        severity: inactiveCount > committees.length * 0.3 ? 'high' : 'medium',
                    },
                ]
                : []),
        ],
        opportunities: [
            {
                text: s.committeeCrossCollaboration,
                severity: 'medium',
            },
            ...(committees.length > 0
                ? [
                    {
                        text: s.committeeHearings,
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        threats: [
            ...(inactiveCount > committees.length * 0.3
                ? [
                    {
                        text: s.committeeLowActivity,
                        severity: 'high',
                    },
                ]
                : []),
            {
                text: s.committeeCompetingPriorities,
                severity: 'medium',
            },
        ],
    };
}
// ─── Dashboard builders ──────────────────────────────────────────────────────
// ─── Political intelligence data builders ─────────────────────────────────────
/**
 * Build coalition metrics from voting patterns data.
 * Derives alignment scores and shift indicators for the coalition radar chart.
 *
 * @param patterns - Voting pattern data
 * @returns Coalition metrics object or null if no real patterns

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

  // Trend analytics from committee document counts
  const docCounts = committees.slice(0, 6).map((c) => c.documents.length);
  const trend = docCounts.length >= 2 ? buildTrendFromCounts(docCounts, 'monthly') : null;
  const committeeLabels = committees.slice(0, 6).map((c) => c.abbreviation);
  const trendPanel = buildGenericTrendPanel(d, trend, committeeLabels, d.documentsProduced);

  const panels = [
    overviewPanel,
    ...(chartPanel ? [chartPanel] : []),
    ...(trendPanel ? [trendPanel] : []),
  ];

  return { panels };
}

// ─── Intelligence Mindmap Builders ───────────────────────────────────────────

/** Reusable stakeholder group name for civil society actors. */
const CIVIL_SOCIETY = 'Civil Society';
/**
 * Build intelligence mindmap for voting analysis articles.
 *
 * Constructs a policy domain intelligence map with political group nodes
 * as the primary domain layer, voting pattern sub-topics, and anomaly actors.
 *
 * @param records - Voting records for the period
 * @param patterns - Political group voting pattern data
 * @param anomalies - Detected voting anomalies
 * @param _lang - Reserved for future localisation (default: 'en')
 * @returns Intelligence mindmap data, or null when all data is placeholder
 */
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
export function buildCommitteeMindmap(committees, _lang = 'en') {
    void _lang;
    if (isPlaceholderCommitteeData(committees))
        return null;
    const activeCommittees = committees.filter((c) => c.documents.length > 0);
    if (activeCommittees.length === 0)
        return null;
    const domainNodes = activeCommittees.slice(0, 8).map((c, i) => {
        const influence = Math.min(1, c.documents.length / 10);
        const children = c.documents.slice(0, 3).map((doc, di) => ({
            id: `doc-${i}-${di}`,
            label: doc.title ? doc.title.slice(0, 50) : 'Committee document',
            category: 'action',
            influence: 0.6,
            color: 'blue',
            children: [],
            metadata: { committee: c.abbreviation, documentRef: doc.title?.slice(0, 30) },
        }));
        const colors = [
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
            category: 'policy_domain',
            influence,
            color: colors[i % colors.length] ?? 'cyan',
            children,
            metadata: { committee: c.abbreviation },
        };
    });
    const actorNetwork = activeCommittees.slice(0, 6).map((c, i) => ({
        id: `committee-actor-${i}`,
        name: c.abbreviation,
        type: 'committee',
        influence: Math.min(1, c.documents.length / 10),
        connections: domainNodes
            .filter((n) => n.id !== `committee-${c.abbreviation}`)
            .slice(0, 2)
            .map((n) => n.id),
    }));
    const connections = activeCommittees.slice(0, 3).flatMap((c, i) => activeCommittees.slice(i + 1, i + 2).map((c2) => ({
        from: `committee-${c.abbreviation}`,
        to: `committee-${c2.abbreviation}`,
        strength: 'moderate',
        type: 'thematic',
        evidence: `Inter-committee collaboration between ${c.abbreviation} and ${c2.abbreviation}`,
    })));
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
/**
 * Build multi-dimensional SWOT analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data, or `null` when all committee data is placeholder
 */
export function buildCommitteeMultiDimensionalSwot(committees, lang = 'en') {
    if (isPlaceholderCommitteeData(committees))
        return null;
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const base = buildCommitteeSwot(committees, lang);
    if (!base)
        return null;
    const active = committees.filter((c) => c.documents.length > 0);
    const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
    const inactiveCount = committees.length - active.length;
    const highActivity = active.length >= committees.length * 0.7;
    const political = makeDimension('political', active.length > 0
        ? [
            {
                text: s.committeeActive(active.length, committees.length),
                severity: highActivity ? 'high' : 'medium',
            },
        ]
        : [], inactiveCount > committees.length * 0.3
        ? [{ text: s.committeeInactive(inactiveCount), severity: 'high' }]
        : [], [{ text: s.committeeCrossCollaboration, severity: 'medium' }], inactiveCount > committees.length * 0.3
        ? [{ text: s.committeeLowActivity, severity: 'high' }]
        : [{ text: s.committeeCompetingPriorities, severity: 'medium' }]);
    const economic = makeDimension('economic', totalDocs > 0 ? [{ text: s.committeeDocuments(totalDocs), severity: 'medium' }] : [], inactiveCount > 0
        ? [{ text: s.committeeInactive(inactiveCount), severity: 'medium' }]
        : [], committees.length > 0 ? [{ text: s.committeeHearings, severity: 'medium' }] : [], [{ text: s.committeeCompetingPriorities, severity: 'medium' }]);
    const social = makeDimension('social', active.length > 0
        ? [{ text: s.committeeActive(active.length, committees.length), severity: 'medium' }]
        : [], [], [{ text: s.committeeCrossCollaboration, severity: 'medium' }], []);
    const legal = makeDimension('legal', totalDocs > 0 ? [{ text: s.committeeDocuments(totalDocs), severity: 'high' }] : [], inactiveCount > committees.length * 0.3
        ? [{ text: s.committeeInactive(inactiveCount), severity: 'high' }]
        : [], committees.length > 0 ? [{ text: s.committeeHearings, severity: 'medium' }] : [], inactiveCount > committees.length * 0.3
        ? [{ text: s.committeeLowActivity, severity: 'high' }]
        : []);
    const geopolitical = makeDimension('geopolitical', [], [], [{ text: s.committeeCrossCollaboration, severity: 'medium' }], [{ text: s.committeeCompetingPriorities, severity: 'medium' }]);
    const temporal = {
        shortTerm: base,
        mediumTerm: {
            strengths: base.strengths.filter((i) => i.severity === 'high'),
            weaknesses: base.weaknesses,
            opportunities: base.opportunities,
            threats: base.threats,
        },
    };
    const stakeholderViews = buildCommitteeMDStakeholders(active, committees, totalDocs, inactiveCount, s);
    return {
        dimensions: [political, economic, social, legal, geopolitical],
        temporal,
        stakeholderViews,
    };
}
//# sourceMappingURL=committee-builders.js.map