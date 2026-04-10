// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../../constants/languages.js';
import { PLACEHOLDER_MARKER } from '../motions-content.js';
import { buildDefaultStakeholderPerspectives, computeVotingIntensity, computePolarizationIndex, } from '../../utils/intelligence-analysis.js';
import { AI_MARKER } from '../../constants/analysis-constants.js';
import { buildOutcomeMatrix, buildAiMarkerImpactAssessment, buildCoalitionMetricsFromPatterns, buildStakeholderMetricsFromVoting, buildStakeholderPanel, makeDimension, EP_BLUE_TRANSPARENT, EP_BLUE_BORDER, CIVIL_SOCIETY, } from './shared-builders.js';
/**
 * Derive stakeholder outcomes from voting records.
 * Groups with high cohesion (>0.8) and high participation (>0.7) are treated as
 * "winners"; groups with low cohesion (<0.5) are flagged as "at risk".
 * Returns `{actor, outcome, reason}` where `reason` is set to `AI_MARKER`
 * so the AI enrichment step provides substantive political reasoning.
 *
 * @param records - Voting records
 * @param patterns - Voting pattern data
 * @returns Stakeholder outcome assessments with `reason` set to `AI_MARKER`
 */
function deriveStakeholderOutcomesFromVoting(records, patterns) {
    const outcomes = [];
    // High-cohesion groups that vote with majority are winners
    for (const pattern of patterns) {
        if (pattern.cohesion > 0.8 && pattern.participation > 0.7) {
            outcomes.push({
                actor: pattern.group,
                outcome: 'winner',
                reason: AI_MARKER,
            });
        }
        else if (pattern.cohesion < 0.5) {
            outcomes.push({
                actor: pattern.group,
                outcome: 'loser',
                reason: AI_MARKER,
            });
        }
    }
    // Adopted motions → the proposing side wins
    for (const record of records.slice(0, 3)) {
        if (record.result?.toLowerCase().includes('adopt')) {
            outcomes.push({
                actor: 'Majority coalition',
                outcome: 'winner',
                reason: AI_MARKER,
            });
        }
    }
    return outcomes;
}
/**
 * Derive action→consequence chains from voting records and anomalies.
 *
 * @param records - Voting records
 * @param anomalies - Detected anomalies
 * @returns Action-consequence pairs
 */
function deriveConsequencesFromVoting(records, anomalies) {
    const consequences = [];
    for (const record of records.slice(0, 3)) {
        if (record.result === PLACEHOLDER_MARKER)
            continue;
        consequences.push({
            action: `Vote on "${record.title}" (result: ${record.result}; ${record.votes.for} for, ${record.votes.against} against, ${record.votes.abstain} abstentions)`,
            consequence: AI_MARKER,
            severity: Math.abs(record.votes.for - record.votes.against) >
                (record.votes.for + record.votes.against) / 2
                ? 'high'
                : 'medium',
        });
    }
    for (const anomaly of anomalies.slice(0, 2)) {
        if (/placeholder/i.test(anomaly.type))
            continue;
        const anomalyDescription = anomaly.description?.trim() ?? '';
        consequences.push({
            action: anomalyDescription.length > 0
                ? `${anomaly.type} detected: ${anomalyDescription}`
                : `${anomaly.type} detected`,
            consequence: AI_MARKER,
            severity: anomaly.severity?.toLowerCase() === 'high' ? 'high' : 'medium',
        });
    }
    return consequences;
}
/**
 * Derive political mistakes from anomalies — defections signal miscalculations.
 *
 * @param anomalies - Detected voting anomalies
 * @returns Political mistake assessments
 */
function deriveMistakesFromAnomalies(anomalies) {
    return anomalies
        .filter((a) => a.type?.toLowerCase().includes('defect') || a.severity?.toUpperCase() === 'HIGH')
        .slice(0, 3)
        .map((a) => ({
        actor: 'Political group leadership',
        description: `${a.type}: ${a.description}`,
        alternative: AI_MARKER,
    }));
}
/**
 * Build multi-stakeholder perspectives for a voting analysis.
 * Derives per-group importance scores based on adopted/rejected counts and
 * cohesion anomalies.
 *
 * @param adoptedCount - Number of adopted texts
 * @param anomalies - Detected voting anomalies
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildVotingStakeholderPerspectives(adoptedCount, anomalies, topic) {
    const hasHighAnomalies = anomalies.some((a) => a.severity?.toUpperCase() === 'HIGH');
    return buildDefaultStakeholderPerspectives(topic, {
        political_groups: hasHighAnomalies ? 0.9 : adoptedCount > 0 ? 0.8 : 0.5,
        civil_society: adoptedCount > 0 ? 0.6 : 0.4,
        industry: adoptedCount > 0 ? 0.7 : 0.4,
        national_govts: 0.7,
        citizens: adoptedCount > 0 ? 0.6 : 0.3,
        eu_institutions: 0.8,
    });
}
/**
 * Build the "what" summary for a voting analysis, including intensity metrics.
 *
 * @param dateFrom - Period start
 * @param dateTo - Period end
 * @param recordCount - Real voting record count
 * @param adoptedCount - Adopted count
 * @param rejectedCount - Rejected count
 * @param anomalyCount - Anomaly count
 * @param patternCount - Pattern count
 * @param questionCount - Question count
 * @param intensity - Voting intensity metrics (may be null)
 * @param polarization - Polarization index (may be null)
 * @returns Summary text
 */
function buildVotingWhatText(dateFrom, dateTo, recordCount, adoptedCount, rejectedCount, anomalyCount, patternCount, questionCount, intensity, polarization) {
    if (recordCount === 0 && patternCount === 0 && questionCount === 0) {
        return `Parliamentary activity from ${dateFrom} to ${dateTo}. Detailed roll-call data unavailable for this period.`;
    }
    const base = `${recordCount} votes recorded between ${dateFrom} and ${dateTo}: ${adoptedCount} adopted, ${rejectedCount} rejected. ${anomalyCount} voting anomalies detected across ${patternCount} political groups. ${questionCount} parliamentary questions filed.`;
    if (!intensity || recordCount === 0)
        return base;
    return `${base} Voting intensity: ${intensity.closeVoteCount} close ${intensity.closeVoteCount === 1 ? 'vote' : 'votes'}, ${intensity.decisiveVoteCount} decisive ${intensity.decisiveVoteCount === 1 ? 'vote' : 'votes'}. Polarization index: ${polarization?.assessment ?? 'N/A'}.`;
}
/**
 * Build the "why" text for a voting analysis.
 * Returns AI_MARKER so the AI agent provides real political analysis.
 *
 * @returns AI_MARKER placeholder for AI-driven analysis
 */
function buildVotingWhyText() {
    return AI_MARKER;
}
/**
 * Build outlook text for voting analysis.
 * Returns AI_MARKER — the AI agent provides real forward-looking analysis.
 *
 * @returns AI_MARKER placeholder
 */
function buildVotingOutlook() {
    return AI_MARKER;
}
/**
 * Build the coalition alignment panel for a voting dashboard.
 *
 * @param d - Localized dashboard strings
 * @param coalition - Coalition metrics
 * @returns Panel object or null
 */
function buildVotingCoalitionPanel(d, coalition) {
    if (!coalition)
        return null;
    const shiftLabel = coalition.shiftIndicator === 'strengthening'
        ? d.coalitionStrengthening
        : coalition.shiftIndicator === 'weakening'
            ? d.coalitionWeakening
            : d.coalitionStable;
    const shiftTrend = coalition.shiftIndicator === 'strengthening'
        ? 'up'
        : coalition.shiftIndicator === 'weakening'
            ? 'down'
            : 'stable';
    return {
        title: d.coalitionAlignment,
        metrics: [
            { label: d.alignmentScore, value: `${coalition.alignmentScore}%`, trend: shiftTrend },
            { label: d.coalitionShift, value: shiftLabel },
        ],
        chart: {
            type: 'radar',
            title: d.coalitionRadarChart,
            data: {
                labels: coalition.votingBlocs.map((b) => b.group),
                datasets: [
                    {
                        label: d.alignmentScore,
                        data: coalition.votingBlocs.map((b) => b.alignmentScore),
                        backgroundColor: EP_BLUE_TRANSPARENT,
                        borderColor: EP_BLUE_BORDER,
                    },
                ],
            },
        },
    };
}
/**
 * Build the trend panel for a voting dashboard.
 *
 * @param d - Localized dashboard strings
 * @param realRecords - Filtered real voting records
 * @param adoptedCount - Number of adopted votes
 * @param rejectedCount - Number of rejected votes
 * @returns Panel object or null
 */
function buildVotingTrendPanel(d, realRecords, adoptedCount, rejectedCount) {
    if (realRecords.length < 2)
        return null;
    return {
        title: d.trendAnalysis,
        metrics: [
            {
                label: d.adopted,
                value: String(adoptedCount),
                trend: (adoptedCount > rejectedCount ? 'up' : 'stable'),
            },
        ],
        chart: {
            type: 'line',
            title: d.activityTrendChart,
            data: {
                labels: realRecords.slice(0, 6).map((r) => r.date ?? ''),
                datasets: [
                    {
                        label: d.adopted,
                        data: realRecords
                            .slice(0, 6)
                            .map((r) => (r.result?.toLowerCase().includes('adopt') ? 1 : 0)),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40,167,69,0.1)',
                    },
                ],
            },
        },
    };
}
/**
 * Build the stakeholder panel for a voting dashboard.
 *
 * @param d - Localized dashboard strings
 * @param patterns - Voting patterns
 * @param anomalyCount - Number of voting anomalies
 * @returns Panel object or null
 */
function buildVotingStakeholderPanel(d, patterns, anomalyCount) {
    const stakeholderMetrics = buildStakeholderMetricsFromVoting(patterns, anomalyCount);
    return buildStakeholderPanel(d, stakeholderMetrics);
}
/**
 * Build stakeholder views for voting multi-dimensional SWOT.
 *
 * @param adoptedCount - Number of adopted votes
 * @param realAnomalies - Non-placeholder anomalies
 * @param highSeverity - High-severity anomalies
 * @param highCohesion - High-cohesion patterns
 * @param lowCohesion - Low-cohesion patterns
 * @param realPatterns - Non-placeholder patterns
 * @param s - Localized SWOT builder strings
 * @returns Stakeholder views map
 */
function buildVotingMDStakeholders(adoptedCount, realAnomalies, highSeverity, highCohesion, lowCohesion, realPatterns, s) {
    return {
        citizen: {
            strengths: adoptedCount > 0
                ? [{ text: s.votingAdopted(adoptedCount), severity: 'medium' }]
                : [],
            weaknesses: realAnomalies.length > 0
                ? [{ text: s.votingAnomalies(realAnomalies.length), severity: 'medium' }]
                : [],
            opportunities: [{ text: s.votingCrossParty, severity: 'medium' }],
            threats: highSeverity.length > 0
                ? [{ text: s.votingHighSeverity(highSeverity.length), severity: 'high' }]
                : [],
        },
        mep: {
            strengths: highCohesion.length > 0
                ? [{ text: s.votingHighCohesion(highCohesion.length), severity: 'high' }]
                : [],
            weaknesses: lowCohesion.length > 0
                ? [{ text: s.votingLowCohesion(lowCohesion.length), severity: 'high' }]
                : [],
            opportunities: realPatterns.length > 0
                ? [{ text: s.votingDiverseGroups(realPatterns.length), severity: 'medium' }]
                : [],
            threats: [{ text: s.votingShiftingAlliances, severity: 'medium' }],
        },
    };
}
/**
 * Build deep analysis for voting-based articles (motions, weekly/monthly review).
 *
 * @param dateFrom - Period start date
 * @param dateTo - Period end date
 * @param records - Voting records
 * @param patterns - Voting patterns
 * @param anomalies - Anomalies detected
 * @param questions - Parliamentary questions
 * @returns Deep analysis object
 */
export function buildVotingAnalysis(dateFrom, dateTo, records, patterns, anomalies, questions) {
    const realRecords = records.filter((r) => r.result !== PLACEHOLDER_MARKER);
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const realAnomalies = anomalies.filter((a) => !/placeholder/i.test(a.type));
    const realQuestions = questions.filter((q) => q.status !== PLACEHOLDER_MARKER);
    const adoptedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const rejectedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('reject')).length;
    const topTopics = realRecords.slice(0, 3).map((r) => r.title);
    // ── Advanced political intelligence ────────────────────────────────────────
    const intensity = computeVotingIntensity(realRecords);
    const polarization = computePolarizationIndex(realPatterns);
    return {
        what: buildVotingWhatText(dateFrom, dateTo, realRecords.length, adoptedCount, rejectedCount, realAnomalies.length, realPatterns.length, realQuestions.length, intensity, polarization),
        who: [
            ...realPatterns.map((p) => `${p.group} — cohesion: ${(p.cohesion * 100).toFixed(0)}%, participation: ${(p.participation * 100).toFixed(0)}%`),
            ...realQuestions.slice(0, 3).map((q) => `${q.author} — question on "${q.topic}"`),
        ],
        when: [
            `Period: ${dateFrom} to ${dateTo}`,
            ...realRecords.slice(0, 3).map((r) => `${r.date}: Vote on "${r.title}" — ${r.result}`),
        ],
        why: buildVotingWhyText(),
        stakeholderOutcomes: deriveStakeholderOutcomesFromVoting(realRecords, realPatterns),
        impactAssessment: buildAiMarkerImpactAssessment(),
        actionConsequences: deriveConsequencesFromVoting(realRecords, realAnomalies),
        mistakes: deriveMistakesFromAnomalies(realAnomalies),
        outlook: buildVotingOutlook(),
        stakeholderPerspectives: buildVotingStakeholderPerspectives(adoptedCount, realAnomalies, topTopics[0] ?? `voting period ${dateFrom}–${dateTo}`),
        stakeholderOutcomeMatrix: buildOutcomeMatrix([
            {
                action: `Voting outcomes ${dateFrom}–${dateTo}`,
                scores: {
                    political_groups: realAnomalies.length > 0 ? 0.8 : 0.6,
                    civil_society: adoptedCount > 0 ? 0.6 : 0.4,
                    industry: adoptedCount > 0 ? 0.7 : 0.4,
                    national_govts: 0.7,
                    citizens: adoptedCount > 0 ? 0.6 : 0.3,
                    eu_institutions: 0.8,
                },
                confidence: realRecords.length > 0 ? 'high' : 'low',
            },
        ]),
    };
}
/**
 * Build SWOT analysis for voting-based articles (motions, weekly/monthly review).
 *
 * @param records - Voting records
 * @param patterns - Voting patterns
 * @param anomalies - Detected anomalies
 * @param lang - Target language code
 * @returns SWOT analysis data
 */
export function buildVotingSwot(records, patterns, anomalies, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const realRecords = records.filter((r) => r.result !== PLACEHOLDER_MARKER);
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const realAnomalies = anomalies.filter((a) => !/placeholder/i.test(a.type));
    const adoptedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const highCohesionGroups = realPatterns.filter((p) => p.cohesion > 0.8);
    const lowCohesionGroups = realPatterns.filter((p) => p.cohesion < 0.5);
    const highSeverityAnomalies = realAnomalies.filter((a) => a.severity?.toUpperCase() === 'HIGH');
    return {
        strengths: [
            ...(highCohesionGroups.length > 0
                ? [
                    {
                        text: s.votingHighCohesion(highCohesionGroups.length),
                        severity: 'high',
                    },
                ]
                : []),
            ...(adoptedCount > 0
                ? [
                    {
                        text: s.votingAdopted(adoptedCount),
                        severity: 'medium',
                    },
                ]
                : []),
            ...(realRecords.length > 0
                ? [
                    {
                        text: s.votingActiveVotes(realRecords.length),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        weaknesses: [
            ...(lowCohesionGroups.length > 0
                ? [
                    {
                        text: s.votingLowCohesion(lowCohesionGroups.length),
                        severity: 'high',
                    },
                ]
                : []),
            ...(realAnomalies.length > 0
                ? [
                    {
                        text: s.votingAnomalies(realAnomalies.length),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        opportunities: [
            {
                text: s.votingCrossParty,
                severity: 'medium',
            },
            ...(realPatterns.length > 0
                ? [
                    {
                        text: s.votingDiverseGroups(realPatterns.length),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        threats: [
            ...(highSeverityAnomalies.length > 0
                ? [
                    {
                        text: s.votingHighSeverity(highSeverityAnomalies.length),
                        severity: 'high',
                    },
                ]
                : []),
            {
                text: s.votingShiftingAlliances,
                severity: 'medium',
            },
        ],
    };
}
/**
 * Build dashboard for voting-based articles (motions, weekly/monthly review).
 * Includes a coalition alignment radar chart and stakeholder impact scorecard.
 *
 * @param records - Voting records
 * @param patterns - Voting patterns
 * @param anomalies - Detected anomalies
 * @param lang - Target language code
 * @returns Dashboard configuration with coalition and stakeholder intelligence
 */
export function buildVotingDashboard(records, patterns, anomalies, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const realRecords = records.filter((r) => r.result !== PLACEHOLDER_MARKER);
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const realAnomalies = anomalies.filter((a) => !/placeholder/i.test(a.type));
    const adoptedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const rejectedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('reject')).length;
    const overviewPanel = {
        title: d.votingOverview,
        metrics: [
            { label: d.totalVotes, value: String(realRecords.length), trend: 'stable' },
            {
                label: d.adopted,
                value: String(adoptedCount),
                trend: adoptedCount > 0 ? 'up' : 'stable',
            },
            { label: d.rejected, value: String(rejectedCount) },
            { label: d.anomalies, value: String(realAnomalies.length) },
        ],
    };
    const cohesionPanel = realPatterns.length > 0
        ? {
            title: d.politicalGroupCohesion,
            metrics: realPatterns.slice(0, 4).map((p) => ({
                label: p.group,
                value: `${(p.cohesion * 100).toFixed(0)}%`,
                trend: (p.cohesion > 0.8 ? 'up' : p.cohesion < 0.5 ? 'down' : 'stable'),
            })),
            chart: {
                type: 'bar',
                title: d.groupCohesionRates,
                data: {
                    labels: realPatterns.slice(0, 6).map((p) => p.group),
                    datasets: [
                        {
                            label: d.cohesionPct,
                            data: realPatterns.slice(0, 6).map((p) => Math.round(p.cohesion * 100)),
                        },
                    ],
                },
            },
        }
        : null;
    const coalition = buildCoalitionMetricsFromPatterns(realPatterns);
    const coalitionPanel = buildVotingCoalitionPanel(d, coalition);
    const trendPanel = buildVotingTrendPanel(d, realRecords, adoptedCount, rejectedCount);
    const stakeholderPanel = buildVotingStakeholderPanel(d, realPatterns, realAnomalies.length);
    const panels = [
        overviewPanel,
        ...(cohesionPanel ? [cohesionPanel] : []),
        ...(coalitionPanel ? [coalitionPanel] : []),
        ...(trendPanel ? [trendPanel] : []),
        ...(stakeholderPanel ? [stakeholderPanel] : []),
    ];
    return { panels };
}
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
export function buildVotingMindmap(records, patterns, anomalies, _lang = 'en') {
    void _lang;
    const realRecords = records.filter((r) => r.result !== PLACEHOLDER_MARKER);
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const realAnomalies = anomalies.filter((a) => !/placeholder/i.test(a.type));
    if (realRecords.length === 0 && realPatterns.length === 0)
        return null;
    if (realPatterns.length === 0)
        return null;
    const domainNodes = realPatterns.slice(0, 8).map((p, i) => {
        const cohesion = p.cohesion ?? 0;
        const children = realRecords
            .filter((r) => r.result !== PLACEHOLDER_MARKER)
            .slice(0, 3)
            .map((r, ri) => ({
            id: `record-${i}-${ri}`,
            label: r.title.slice(0, 50),
            category: 'action',
            influence: r.votes.for / Math.max(1, r.votes.for + r.votes.against + r.votes.abstain),
            color: r.result?.toLowerCase().includes('adopt') ? 'green' : 'red',
            children: [],
            metadata: { documentRef: r.title.slice(0, 30) },
        }));
        return {
            id: `group-${i}`,
            label: p.group,
            category: 'policy_domain',
            influence: cohesion,
            color: cohesion > 0.8 ? 'green' : cohesion > 0.5 ? 'cyan' : 'red',
            children,
            metadata: { politicalGroup: p.group },
        };
    });
    const actorNetwork = [
        ...realPatterns.slice(0, 6).map((p, i) => ({
            id: `actor-group-${i}`,
            name: p.group,
            type: 'group',
            influence: p.cohesion ?? 0,
            connections: realAnomalies
                .filter((a) => a.type && !a.type.includes('placeholder'))
                .slice(0, 2)
                .map((_, ai) => `anomaly-${ai}`),
        })),
        ...realAnomalies.slice(0, 3).map((a, i) => ({
            id: `anomaly-${i}`,
            name: a.type,
            type: 'external',
            influence: a.severity?.toUpperCase() === 'HIGH' ? 0.9 : 0.5,
            connections: [],
        })),
    ];
    const anomalyActorCount = Math.min(realAnomalies.length, 3);
    const connections = realAnomalies.slice(0, anomalyActorCount).map((a, i) => ({
        from: `anomaly-${i}`,
        to: `group-${i % Math.max(1, domainNodes.length)}`,
        strength: a.severity?.toUpperCase() === 'HIGH' ? 'strong' : 'moderate',
        type: 'political',
        evidence: a.type,
    }));
    const adoptedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    return {
        centralTopic: 'Voting Intelligence Analysis',
        layers: [{ depth: 1, nodes: domainNodes }],
        connections,
        actorNetwork,
        stakeholderGroups: ['Political Groups', CIVIL_SOCIETY, 'Member States'],
        summary: `Analysing ${realRecords.length} votes across ${realPatterns.length} political groups. ${adoptedCount} measures adopted.`,
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
export function buildVotingMultiDimensionalSwot(records, patterns, anomalies, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const base = buildVotingSwot(records, patterns, anomalies, lang);
    const realRecords = records.filter((r) => r.result !== PLACEHOLDER_MARKER);
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const realAnomalies = anomalies.filter((a) => !/placeholder/i.test(a.type));
    const adoptedCount = realRecords.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const highCohesion = realPatterns.filter((p) => p.cohesion > 0.8);
    const lowCohesion = realPatterns.filter((p) => p.cohesion < 0.5);
    const highSeverity = realAnomalies.filter((a) => a.severity?.toUpperCase() === 'HIGH');
    const political = makeDimension('political', highCohesion.length > 0
        ? [{ text: s.votingHighCohesion(highCohesion.length), severity: 'high' }]
        : [], lowCohesion.length > 0
        ? [{ text: s.votingLowCohesion(lowCohesion.length), severity: 'high' }]
        : [], [{ text: s.votingCrossParty, severity: 'medium' }], highSeverity.length > 0
        ? [{ text: s.votingHighSeverity(highSeverity.length), severity: 'high' }]
        : []);
    const economic = makeDimension('economic', adoptedCount > 0 ? [{ text: s.votingAdopted(adoptedCount), severity: 'medium' }] : [], [], realPatterns.length > 0
        ? [{ text: s.votingDiverseGroups(realPatterns.length), severity: 'medium' }]
        : [], [{ text: s.votingShiftingAlliances, severity: 'medium' }]);
    const social = makeDimension('social', realRecords.length > 0
        ? [{ text: s.votingActiveVotes(realRecords.length), severity: 'medium' }]
        : [], realAnomalies.length > 0
        ? [{ text: s.votingAnomalies(realAnomalies.length), severity: 'medium' }]
        : [], [], []);
    const legal = makeDimension('legal', adoptedCount > 0 ? [{ text: s.votingAdopted(adoptedCount), severity: 'medium' }] : [], [], [], highSeverity.length > 0
        ? [{ text: s.votingHighSeverity(highSeverity.length), severity: 'high' }]
        : []);
    const geopolitical = makeDimension('geopolitical', [], lowCohesion.length > 0
        ? [{ text: s.votingLowCohesion(lowCohesion.length), severity: 'medium' }]
        : [], highCohesion.length > 0
        ? [{ text: s.votingHighCohesion(highCohesion.length), severity: 'medium' }]
        : [], [{ text: s.votingShiftingAlliances, severity: 'medium' }]);
    const temporal = {
        shortTerm: base,
        mediumTerm: {
            strengths: base.strengths.filter((i) => i.severity === 'high'),
            weaknesses: base.weaknesses.filter((i) => i.severity === 'high'),
            opportunities: base.opportunities,
            threats: base.threats.filter((i) => i.severity === 'high'),
        },
    };
    const stakeholderViews = buildVotingMDStakeholders(adoptedCount, realAnomalies, highSeverity, highCohesion, lowCohesion, realPatterns, s);
    return {
        title: base.title,
        dimensions: [political, economic, social, legal, geopolitical],
        temporal,
        stakeholderViews,
    };
}
//# sourceMappingURL=voting-builders.js.map