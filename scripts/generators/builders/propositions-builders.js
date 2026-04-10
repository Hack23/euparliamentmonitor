// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../../constants/languages.js';
import { buildDefaultStakeholderPerspectives } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import { buildOutcomeMatrix, buildAiMarkerImpactAssessment, buildStakeholderMetricsFromPipeline, buildStakeholderPanel, makeDimension, CIVIL_SOCIETY, } from './shared-builders.js';
const CONFERENCE_OF_PRESIDENTS_EN = 'Conference of Presidents';
const CONFERENCE_OF_PRESIDENTS = {
    en: CONFERENCE_OF_PRESIDENTS_EN,
    sv: 'Talmanskonferensen',
    da: 'Formandskonferencen',
    no: 'Formannskonferansen',
    fi: 'Puheenjohtajakokous',
    de: 'Konferenz der Präsidenten',
    fr: 'Conférence des présidents',
    es: 'Conferencia de Presidentes',
    nl: 'Conferentie van voorzitters',
    ar: '\u0645\u0624\u062a\u0645\u0631 \u0627\u0644\u0631\u0624\u0633\u0627\u0621',
    he: '\u05d5\u05e2\u05d9\u05d3\u05ea \u05d4\u05e0\u05e9\u05d9\u05d0\u05d9\u05dd',
    ja: '\u8b70\u9577\u4f1a\u8b70',
    ko: '\uc758\uc7a5\ud68c\uc758',
    zh: '\u4e3b\u5e2d\u56e2\u4f1a\u8bae',
};
/**
 * Build multi-stakeholder perspectives for a propositions pipeline analysis.
 *
 * @param healthScore - Pipeline health score (0-1)
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildPropositionsStakeholderPerspectives(healthScore, topic) {
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
 * Get the localized Conference of Presidents name.
 *
 * @param lang - Target language code
 * @returns Localized name or English fallback
 */
function getConferenceOfPresidents(lang) {
    return CONFERENCE_OF_PRESIDENTS[lang] ?? CONFERENCE_OF_PRESIDENTS_EN;
}
/**
 * Build the action-consequence pairs for propositions analysis.
 * Returns AI_MARKER for consequences so the AI agent writes real analysis.
 *
 * @param pct - Pipeline health percentage as string
 * @param healthScore - Pipeline health score (0-1)
 * @param throughput - Throughput rate
 * @returns Action-consequence pairs with AI_MARKER for consequence text
 */
function buildPropositionsConsequences(pct, healthScore, throughput) {
    const healthSeverity = healthScore < 0.3 ? 'critical' : healthScore < 0.5 ? 'high' : 'medium';
    return [
        {
            action: `Pipeline health at ${pct}%`,
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
 * @param healthScore - Pipeline health score used for outcome classification
 * @param pct - Pipeline health percentage used as reasoning context
 * @returns Single stakeholder outcome with AI_MARKER reasoning
 */
function buildPropositionsStakeholderOutcome(healthScore, pct) {
    if (healthScore > 0.7) {
        return {
            actor: 'Parliament presidency',
            outcome: 'winner',
            reason: `${AI_MARKER} Pipeline health at ${pct}%`,
        };
    }
    return {
        actor: 'Pending legislation sponsors',
        outcome: 'loser',
        reason: `${AI_MARKER} Pipeline health at ${pct}%`,
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
 * Build legislative pipeline data from PipelineData.
 *
 * @param pipelineData - Pipeline metrics or null
 * @returns Legislative pipeline object
 */
function buildPipelineFromPipelineData(pipelineData) {
    if (!pipelineData)
        return null;
    const healthScore = Math.round(pipelineData.healthScore * 100);
    const total = pipelineData.throughput;
    if (total === 0)
        return null;
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
 * Build deep analysis for propositions articles.
 *
 * @param proposalsHtml - Proposals HTML (used to detect content presence)
 * @param pipelineData - Pipeline metrics
 * @param date - Publication date
 * @param lang - Target display language (default: 'en')
 * @param adoptedTextsHtml - Adopted texts HTML (also used to detect content presence)
 * @returns Deep analysis object
 */
export function buildPropositionsAnalysis(proposalsHtml, pipelineData, date, lang = 'en', adoptedTextsHtml = '') {
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
        mistakes: healthScore < 0.5
            ? [
                {
                    actor: getConferenceOfPresidents(lang),
                    description: `Pipeline health dropped to ${pct}%`,
                    alternative: AI_MARKER,
                },
            ]
            : [],
        outlook: AI_MARKER,
        stakeholderPerspectives: buildPropositionsStakeholderPerspectives(healthScore, `legislative pipeline as of ${date}`),
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
 * Build SWOT analysis for propositions articles.
 *
 * @param pipelineData - Pipeline metrics
 * @param lang - Target language code
 * @returns SWOT analysis data
 */
export function buildPropositionsSwot(pipelineData, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const healthScore = pipelineData?.healthScore ?? 0;
    const throughput = pipelineData?.throughput ?? 0;
    const pct = (healthScore * 100).toFixed(0);
    return {
        strengths: [
            ...(healthScore > 0.7
                ? [
                    {
                        text: s.propositionsHealthStrong(pct),
                        severity: 'high',
                    },
                ]
                : []),
            ...(throughput >= 5
                ? [
                    {
                        text: s.propositionsThroughputGood(throughput),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        weaknesses: [
            ...(healthScore < 0.5
                ? [
                    {
                        text: s.propositionsHealthWeak(pct),
                        severity: 'high',
                    },
                ]
                : []),
            ...(throughput < 5
                ? [
                    {
                        text: s.propositionsThroughputLow(throughput),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        opportunities: [
            {
                text: s.propositionsPrioritisation,
                severity: 'medium',
            },
            {
                text: s.propositionsTrilogueAcceleration,
                severity: 'medium',
            },
        ],
        threats: [
            ...(healthScore < 0.3
                ? [
                    {
                        text: s.propositionsCriticalCongestion,
                        severity: 'high',
                    },
                ]
                : []),
            {
                text: s.propositionsOverlapping,
                severity: 'medium',
            },
        ],
    };
}
/**
 * Build dashboard for propositions articles.
 * Includes color-coded pipeline status chart and stakeholder scorecard.
 *
 * @param pipelineData - Pipeline metrics
 * @param lang - Target language code
 * @returns Dashboard configuration with pipeline intelligence panels
 */
export function buildPropositionsDashboard(pipelineData, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const healthScore = pipelineData?.healthScore ?? 0;
    const throughput = pipelineData?.throughput ?? 0;
    const pct = (healthScore * 100).toFixed(0);
    const healthPanel = {
        title: d.pipelineHealth,
        metrics: [
            {
                label: d.healthScore,
                value: `${pct}%`,
                trend: (healthScore > 0.7 ? 'up' : healthScore < 0.5 ? 'down' : 'stable'),
            },
            {
                label: d.throughput,
                value: String(throughput),
                trend: throughput >= 5 ? 'up' : 'down',
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
 * Build intelligence mindmap for propositions / legislative pipeline articles.
 *
 * Maps the legislative pipeline stages as policy domain nodes with procedure
 * health and throughput indicators.
 *
 * @param pipelineData - Legislative pipeline metrics (null when unavailable)
 * @param _lang - Reserved for future localisation (default: 'en')
 * @returns Intelligence mindmap data
 */
export function buildPropositionsMindmap(pipelineData, _lang = 'en') {
    void _lang;
    const healthScore = pipelineData?.healthScore ?? 0;
    const throughput = pipelineData?.throughput ?? 0;
    const healthPct = (healthScore * 100).toFixed(0);
    const pipelineStages = [
        {
            id: 'proposal',
            label: 'Commission Proposals',
            category: 'policy_domain',
            influence: 0.9,
            color: 'cyan',
            children: [
                {
                    id: 'proposal-review',
                    label: 'Initial Committee Review',
                    category: 'action',
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
            category: 'policy_domain',
            influence: 0.85,
            color: 'green',
            children: [
                {
                    id: 'rapporteur',
                    label: 'Rapporteur Report',
                    category: 'action',
                    influence: 0.8,
                    color: 'green',
                    children: [],
                },
                {
                    id: 'amendments',
                    label: 'Amendments',
                    category: 'action',
                    influence: 0.75,
                    color: 'yellow',
                    children: [],
                },
            ],
        },
        {
            id: 'plenary',
            label: 'Plenary Vote',
            category: 'policy_domain',
            influence: healthScore,
            color: healthScore > 0.7 ? 'green' : healthScore > 0.4 ? 'yellow' : 'red',
            children: [
                {
                    id: 'plenary-debate',
                    label: 'Debate',
                    category: 'action',
                    influence: 0.7,
                    color: 'blue',
                    children: [],
                },
            ],
        },
        {
            id: 'trilogue',
            label: 'Inter-institutional Trilogue',
            category: 'policy_domain',
            influence: 0.8,
            color: 'orange',
            children: [
                {
                    id: 'council-position',
                    label: 'Council Position',
                    category: 'actor',
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
            category: 'outcome',
            influence: healthScore > 0.5 ? 0.9 : 0.4,
            color: healthScore > 0.5 ? 'green' : 'red',
            children: [],
        },
    ];
    const actorNetwork = [
        {
            id: 'commission',
            name: 'European Commission',
            type: 'external',
            influence: 0.9,
            connections: ['proposal'],
        },
        {
            id: 'parliament',
            name: 'European Parliament',
            type: 'committee',
            influence: 0.95,
            connections: ['committee', 'plenary'],
        },
        {
            id: 'council',
            name: 'Council of the EU',
            type: 'external',
            influence: 0.9,
            connections: ['trilogue', 'adoption'],
        },
    ];
    const connections = [
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
export function buildPropositionsMultiDimensionalSwot(pipelineData, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const base = buildPropositionsSwot(pipelineData, lang);
    const healthScore = pipelineData?.healthScore ?? 0;
    const throughput = pipelineData?.throughput ?? 0;
    const pct = (healthScore * 100).toFixed(0);
    const political = makeDimension('political', healthScore > 0.7 ? [{ text: s.propositionsHealthStrong(pct), severity: 'high' }] : [], healthScore < 0.5 ? [{ text: s.propositionsHealthWeak(pct), severity: 'high' }] : [], [{ text: s.propositionsPrioritisation, severity: 'medium' }], healthScore < 0.3 ? [{ text: s.propositionsCriticalCongestion, severity: 'high' }] : []);
    const economic = makeDimension('economic', throughput >= 5
        ? [{ text: s.propositionsThroughputGood(throughput), severity: 'medium' }]
        : [], throughput < 5
        ? [{ text: s.propositionsThroughputLow(throughput), severity: 'medium' }]
        : [], [{ text: s.propositionsTrilogueAcceleration, severity: 'medium' }], [{ text: s.propositionsOverlapping, severity: 'medium' }]);
    const social = makeDimension('social', [], [], [{ text: s.propositionsPrioritisation, severity: 'medium' }], healthScore < 0.3 ? [{ text: s.propositionsCriticalCongestion, severity: 'high' }] : []);
    const legal = makeDimension('legal', healthScore > 0.7 ? [{ text: s.propositionsHealthStrong(pct), severity: 'high' }] : [], healthScore < 0.5 ? [{ text: s.propositionsHealthWeak(pct), severity: 'high' }] : [], [{ text: s.propositionsTrilogueAcceleration, severity: 'medium' }], [{ text: s.propositionsOverlapping, severity: 'medium' }]);
    const geopolitical = makeDimension('geopolitical', throughput >= 5
        ? [{ text: s.propositionsThroughputGood(throughput), severity: 'medium' }]
        : [], [], [], healthScore < 0.3
        ? [{ text: s.propositionsCriticalCongestion, severity: 'high' }]
        : [{ text: s.propositionsOverlapping, severity: 'medium' }]);
    const temporal = {
        shortTerm: base,
        mediumTerm: {
            strengths: base.strengths,
            weaknesses: base.weaknesses.filter((i) => i.severity === 'high'),
            opportunities: base.opportunities,
            threats: base.threats.filter((i) => i.severity === 'high'),
        },
    };
    const stakeholderViews = {
        industry: {
            strengths: throughput >= 5
                ? [{ text: s.propositionsThroughputGood(throughput), severity: 'medium' }]
                : [],
            weaknesses: throughput < 5
                ? [{ text: s.propositionsThroughputLow(throughput), severity: 'medium' }]
                : [],
            opportunities: [{ text: s.propositionsTrilogueAcceleration, severity: 'medium' }],
            threats: [{ text: s.propositionsOverlapping, severity: 'medium' }],
        },
        government: {
            strengths: healthScore > 0.7
                ? [{ text: s.propositionsHealthStrong(pct), severity: 'high' }]
                : [],
            weaknesses: healthScore < 0.5
                ? [{ text: s.propositionsHealthWeak(pct), severity: 'high' }]
                : [],
            opportunities: [{ text: s.propositionsPrioritisation, severity: 'medium' }],
            threats: healthScore < 0.3
                ? [{ text: s.propositionsCriticalCongestion, severity: 'high' }]
                : [],
        },
    };
    return {
        dimensions: [political, economic, social, legal, geopolitical],
        temporal,
        stakeholderViews,
    };
}
//# sourceMappingURL=propositions-builders.js.map