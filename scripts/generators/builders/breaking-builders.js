// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, BREAKING_STRINGS, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../../constants/languages.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import { buildOutcomeMatrix, buildTrendFromCounts, buildGenericTrendPanel, makeDimension, } from './shared-builders.js';
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
 * Build multi-stakeholder perspectives for a propositions pipeline analysis.
 *
 * @param healthScore - Pipeline health score (0-1)
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildBreakingMDStakeholders(adoptedCount, anomalyRaw, procCount, eventCount, coalitionRaw, s) {
    return {
        citizen: {
            strengths: adoptedCount > 0
                ? [{ text: s.breakingAdopted(adoptedCount), severity: 'medium' }]
                : [],
            weaknesses: anomalyRaw
                ? [{ text: s.breakingAnomalyWeakness, severity: 'high' }]
                : [],
            opportunities: procCount > 0
                ? [{ text: s.breakingProceduresActive(procCount), severity: 'medium' }]
                : [],
            threats: anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'high' }] : [],
        },
        media: {
            strengths: eventCount > 0 ? [{ text: s.breakingEvents(eventCount), severity: 'high' }] : [],
            weaknesses: [],
            opportunities: coalitionRaw
                ? [{ text: s.breakingCoalitionOpportunity, severity: 'medium' }]
                : [],
            threats: [{ text: s.breakingRapidEvents, severity: 'medium' }],
        },
    };
}
/**
 * Build stakeholder views for committee multi-dimensional SWOT.
 *
 * @param active - Active committees
 * @param committees - All committees
 * @param totalDocs - Total document count
 * @param inactiveCount - Number of inactive committees
 * @param s - Localized SWOT builder strings
 * @returns Stakeholder views map
 */
function getBreakingProcedureItems(procCount, s) {
    if (procCount === 0) {
        return [[{ text: s.breakingNoProcedures, severity: 'medium' }], []];
    }
    return [[], [{ text: s.breakingProceduresActive(procCount), severity: 'medium' }]];
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
function buildBreakingMDDimensions(adoptedCount, anomalyRaw, coalitionRaw, procCount, eventCount, s) {
    const [procWeakness, procOpportunity] = getBreakingProcedureItems(procCount, s);
    const political = makeDimension('political', adoptedCount > 0 ? [{ text: s.breakingAdopted(adoptedCount), severity: 'high' }] : [], anomalyRaw ? [{ text: s.breakingAnomalyWeakness, severity: 'high' }] : [], coalitionRaw ? [{ text: s.breakingCoalitionOpportunity, severity: 'medium' }] : [], anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'high' }] : []);
    const economic = makeDimension('economic', adoptedCount > 0
        ? [{ text: s.breakingAdopted(adoptedCount), severity: 'medium' }]
        : [], procWeakness, procOpportunity, [{ text: s.breakingRapidEvents, severity: 'medium' }]);
    const social = makeDimension('social', eventCount > 0 ? [{ text: s.breakingEvents(eventCount), severity: 'medium' }] : [], [], procOpportunity, [{ text: s.breakingRapidEvents, severity: 'medium' }]);
    const legal = makeDimension('legal', adoptedCount > 0 ? [{ text: s.breakingAdopted(adoptedCount), severity: 'high' }] : [], procWeakness, procOpportunity, anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'high' }] : []);
    const geopolitical = makeDimension('geopolitical', eventCount > 0 ? [{ text: s.breakingEvents(eventCount), severity: 'medium' }] : [], [], coalitionRaw ? [{ text: s.breakingCoalitionOpportunity, severity: 'medium' }] : [], anomalyRaw ? [{ text: s.breakingAnomalyThreat, severity: 'medium' }] : []);
    return [political, economic, social, legal, geopolitical];
}
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
 * Build the "why" explanation for propositions based on pipeline health.
 * Returns AI_MARKER so the gh-aw AI agent produces real political analysis
 * instead of template-generated prose.
 *
 * @returns AI_MARKER placeholder for AI-driven analysis
 */
function buildPropositionsWhy() {
    return AI_MARKER;
}
/**
 * Localized names for the EP Conference of Presidents across supported languages.
 * Used to translate the actor name in the propositions deep-analysis mistake card.
 */
const CONFERENCE_OF_PRESIDENTS_EN = 'Conference of Presidents';
const CONFERENCE_OF_PRESIDENTS = {
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
function getConferenceOfPresidents(lang) {
    if (!Object.hasOwn(CONFERENCE_OF_PRESIDENTS, lang))
        return CONFERENCE_OF_PRESIDENTS_EN;
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
function buildPropositionsConsequences(_pct, healthScore, throughput) {
    const healthSeverity = healthScore < 0.3 ? 'critical' : healthScore < 0.5 ? 'high' : 'medium';
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
function buildPropositionsStakeholderOutcome(_healthScore, _pct) {
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
 * Build SWOT analysis for propositions articles.
 *
 * @param pipelineData - Pipeline metrics
 * @param lang - Target language code
 * @returns SWOT analysis data
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
    // Trend analytics from feed counts
    const feedCounts = [adoptedCount, eventCount, procCount, mepCount];
    const trend = buildTrendFromCounts(feedCounts, 'weekly');
    const trendPanel = buildGenericTrendPanel(d, trend, [d.adoptedTexts, d.events, d.procedures, d.mepUpdates], d.feedActivity);
    const panels = [feedPanel, summaryPanel, ...(trendPanel ? [trendPanel] : [])];
    return { panels };
}
/**
 * Build a stakeholder panel from stakeholder metric array.
 *
 * @param d - Localized strings
 * @param stakeholderMetrics - Stakeholder metric data
 * @returns Panel object or null
 */
function buildStakeholderPanel(d, stakeholderMetrics) {
    if (stakeholderMetrics.length === 0)
        return null;
    return {
        title: d.stakeholderImpact,
        metrics: stakeholderMetrics.map((s) => ({
            label: s.stakeholder,
            value: `${s.impactScore}/100`,
            trend: (s.impactDirection === 'positive'
                ? 'up'
                : s.impactDirection === 'negative'
                    ? 'down'
                    : 'stable'),
        })),
    };
}
/**
 * Build a pipeline status breakdown panel for propositions dashboard.
 *
 * @param d - Localized strings
 * @param pipeline - Legislative pipeline data
 * @returns Panel object or null
 */
function buildPropositionsPipelinePanel(d, pipeline) {
    if (!pipeline)
        return null;
    return {
        title: d.pipelineStatus,
        metrics: [
            {
                label: d.onTrack,
                value: String(pipeline.onTrack),
                trend: (pipeline.onTrack > 0 ? 'up' : 'stable'),
            },
            {
                label: d.delayed,
                value: String(pipeline.delayed),
                trend: (pipeline.delayed > 0 ? 'down' : 'stable'),
            },
            {
                label: d.blocked,
                value: String(pipeline.blocked),
                trend: (pipeline.blocked > 0 ? 'down' : 'stable'),
            },
        ],
        chart: {
            type: 'bar',
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
function resolvePipelineStrengthLabel(d, healthScore) {
    if (healthScore > 0.7)
        return d.pipelineStrong;
    if (healthScore > 0.4)
        return d.pipelineModerate;
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
/**
 * Build intelligence mindmap for propositions / legislative pipeline articles.
 *
 * Maps the legislative pipeline stages as policy domain nodes with procedure
 * health and throughput indicators.
 *
 * @param pipelineData - Legislative pipeline metrics (null when unavailable)
 * @param _lang - Reserved for future localisation (default: 'en')
 * @returns Intelligence mindmap data
 */
/**
 * Build multi-dimensional SWOT analysis for breaking news articles.
 *
 * @param feedData - EP feed data
 * @param anomalyRaw - Raw anomaly text
 * @param coalitionRaw - Raw coalition text
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data
 */
export function buildBreakingMultiDimensionalSwot(feedData, anomalyRaw, coalitionRaw, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const base = buildBreakingSwot(feedData, anomalyRaw, coalitionRaw, lang);
    const adoptedCount = feedData?.adoptedTexts.length ?? 0;
    const eventCount = feedData?.events.length ?? 0;
    const procCount = feedData?.procedures.length ?? 0;
    const dimensions = buildBreakingMDDimensions(adoptedCount, anomalyRaw, coalitionRaw, procCount, eventCount, s);
    const temporal = {
        shortTerm: base,
        mediumTerm: {
            strengths: base.strengths.filter((i) => i.severity === 'high'),
            weaknesses: base.weaknesses,
            opportunities: base.opportunities,
            threats: base.threats.filter((i) => i.severity === 'high'),
        },
    };
    const stakeholderViews = buildBreakingMDStakeholders(adoptedCount, anomalyRaw, procCount, eventCount, coalitionRaw, s);
    return {
        dimensions,
        temporal,
        stakeholderViews,
    };
}
//# sourceMappingURL=breaking-builders.js.map