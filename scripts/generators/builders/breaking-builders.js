// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, BREAKING_STRINGS, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../../constants/languages.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import { buildOutcomeMatrix, buildCategoryDistributionPanel, } from './shared-builders.js';
// ─── Constant ─────────────────────────────────────────────────────────────────
/**
 * Build multi-stakeholder perspectives for a breaking news analysis.
 *
 * @param adoptedCount - Number of adopted texts in the feed
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildBreakingStakeholderPerspectives(adoptedCount, topic) {
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
 * Build deep analysis for breaking news articles.
 *
 * @param date - Publication date
 * @param feedData - EP feed data
 * @param anomalyRaw - Raw anomaly text
 * @param coalitionRaw - Raw coalition text
 * @param lang - Target display language (default: 'en')
 * @returns Deep analysis object
 */
export function buildBreakingAnalysis(date, feedData, anomalyRaw, coalitionRaw, lang = 'en') {
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
                        outcome: 'winner',
                        reason: AI_MARKER,
                    },
                ]
                : []),
            ...(coalitionRaw
                ? [
                    {
                        actor: s.breakingNeutralActor,
                        outcome: 'neutral',
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
                severity: 'high',
            })) ?? []),
            ...(feedData?.procedures.slice(0, 2).map((p) => ({
                action: `${p.title}${p.date ? ` (${p.date})` : ''}`,
                consequence: AI_MARKER,
                severity: 'medium',
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
        stakeholderPerspectives: buildBreakingStakeholderPerspectives(adoptedCount, feedData?.adoptedTexts[0]?.title ?? `EP activity ${date}`),
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
export function buildBreakingSwot(feedData, anomalyRaw, coalitionRaw, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const adoptedCount = feedData?.adoptedTexts.length ?? 0;
    const eventCount = feedData?.events.length ?? 0;
    const procCount = feedData?.procedures.length ?? 0;
    return {
        strengths: [
            ...(adoptedCount > 0
                ? [
                    {
                        text: s.breakingAdopted(adoptedCount),
                        severity: 'high',
                    },
                ]
                : []),
            ...(eventCount > 0
                ? [
                    {
                        text: s.breakingEvents(eventCount),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        weaknesses: [
            ...(anomalyRaw
                ? [
                    {
                        text: s.breakingAnomalyWeakness,
                        severity: 'high',
                    },
                ]
                : []),
            ...(procCount === 0
                ? [
                    {
                        text: s.breakingNoProcedures,
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        opportunities: [
            ...(procCount > 0
                ? [
                    {
                        text: s.breakingProceduresActive(procCount),
                        severity: 'medium',
                    },
                ]
                : []),
            ...(coalitionRaw
                ? [
                    {
                        text: s.breakingCoalitionOpportunity,
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        threats: [
            ...(anomalyRaw
                ? [
                    {
                        text: s.breakingAnomalyThreat,
                        severity: 'high',
                    },
                ]
                : []),
            {
                text: s.breakingRapidEvents,
                severity: 'medium',
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
export function buildBreakingDashboard(feedData, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
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
                trend: adoptedCount > 0 ? 'up' : 'stable',
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
                    type: 'doughnut',
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
    // Category distribution — shows feed counts per category (not a time-series trend)
    const feedCounts = [adoptedCount, eventCount, procCount, mepCount];
    const feedLabels = [d.adoptedTexts, d.events, d.procedures, d.mepUpdates];
    const trendPanel = buildCategoryDistributionPanel(d, feedLabels, feedCounts, d.feedActivity, d.feedActivity);
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
export function buildBreakingMindmap(feedData, _lang = 'en') {
    void _lang;
    const adoptedTexts = feedData?.adoptedTexts ?? [];
    const events = feedData?.events ?? [];
    const procedures = feedData?.procedures ?? [];
    const mepUpdates = feedData?.mepUpdates ?? [];
    const domainNodes = [
        {
            id: 'adopted',
            label: 'Adopted Texts',
            category: 'policy_domain',
            influence: Math.min(1, adoptedTexts.length / 5),
            color: 'green',
            children: adoptedTexts.slice(0, 3).map((t, i) => ({
                id: `adopted-${i}`,
                label: t.title ? t.title.slice(0, 50) : 'Adopted measure',
                category: 'outcome',
                influence: 0.7,
                color: 'green',
                children: [],
                metadata: { documentRef: t.title?.slice(0, 30) },
            })),
        },
        {
            id: 'events',
            label: 'Parliamentary Events',
            category: 'policy_domain',
            influence: Math.min(1, events.length / 5),
            color: 'blue',
            children: events.slice(0, 3).map((ev, i) => ({
                id: `event-${i}`,
                label: ev.title ? ev.title.slice(0, 50) : 'Parliamentary event',
                category: 'action',
                influence: 0.6,
                color: 'blue',
                children: [],
            })),
        },
        {
            id: 'procedures',
            label: 'Active Procedures',
            category: 'policy_domain',
            influence: Math.min(1, procedures.length / 5),
            color: 'orange',
            children: procedures.slice(0, 3).map((p, i) => ({
                id: `procedure-${i}`,
                label: p.title ? p.title.slice(0, 50) : 'Legislative procedure',
                category: 'action',
                influence: 0.65,
                color: 'orange',
                children: [],
            })),
        },
        {
            id: 'meps',
            label: 'MEP Updates',
            category: 'policy_domain',
            influence: Math.min(1, mepUpdates.length / 5),
            color: 'purple',
            children: mepUpdates.slice(0, 2).map((m, i) => ({
                id: `mep-${i}`,
                label: m.name ? m.name.slice(0, 50) : 'MEP activity',
                category: 'actor',
                influence: 0.55,
                color: 'purple',
                children: [],
            })),
        },
    ].filter((n) => n.influence > 0 || n.children.length > 0);
    if (domainNodes.length === 0) {
        return null;
    }
    const actorNetwork = [
        {
            id: 'ep-parliament',
            name: 'European Parliament',
            type: 'committee',
            influence: 1.0,
            connections: domainNodes.map((n) => n.id),
        },
        ...mepUpdates.slice(0, 3).map((m, i) => ({
            id: `mep-actor-${i}`,
            name: m.name ? m.name.slice(0, 40) : 'MEP',
            type: 'mep',
            influence: 0.6,
            connections: ['meps'],
        })),
    ];
    const connections = [
        ...(adoptedTexts.length > 0 && procedures.length > 0
            ? [
                {
                    from: 'adopted',
                    to: 'procedures',
                    strength: 'strong',
                    type: 'legislative',
                    evidence: 'Adopted texts conclude active legislative procedures',
                },
            ]
            : []),
        ...(events.length > 0 && procedures.length > 0
            ? [
                {
                    from: 'events',
                    to: 'procedures',
                    strength: 'moderate',
                    type: 'procedural',
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
//# sourceMappingURL=breaking-builders.js.map