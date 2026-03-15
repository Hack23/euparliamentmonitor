// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, COMMITTEE_ANALYSIS_CONTENT_STRINGS, BREAKING_STRINGS, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../constants/languages.js';
import { isPlaceholderCommitteeData } from './committee-helpers.js';
import { PLACEHOLDER_MARKER } from './motions-content.js';
import { buildDefaultStakeholderPerspectives, buildStakeholderOutcomeMatrix, } from '../utils/intelligence-analysis.js';
// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Derive stakeholder outcomes from voting records.
 * Groups that win votes are "winners"; groups on the losing side are "losers".
 *
 * @param records - Voting records
 * @param patterns - Voting pattern data
 * @returns Stakeholder outcome assessments
 */
function deriveStakeholderOutcomesFromVoting(records, patterns) {
    const outcomes = [];
    // High-cohesion groups that vote with majority are winners
    for (const pattern of patterns) {
        if (pattern.cohesion > 0.8 && pattern.participation > 0.7) {
            outcomes.push({
                actor: pattern.group,
                outcome: 'winner',
                reason: `High cohesion (${(pattern.cohesion * 100).toFixed(0)}%) with strong participation — disciplined bloc that shapes outcomes`,
            });
        }
        else if (pattern.cohesion < 0.5) {
            outcomes.push({
                actor: pattern.group,
                outcome: 'loser',
                reason: `Low cohesion (${(pattern.cohesion * 100).toFixed(0)}%) — internal divisions weaken bargaining power`,
            });
        }
    }
    // Adopted motions → the proposing side wins
    for (const record of records.slice(0, 3)) {
        if (record.result?.toLowerCase().includes('adopt')) {
            outcomes.push({
                actor: 'Majority coalition',
                outcome: 'winner',
                reason: `"${record.title}" adopted (${record.votes.for} for vs ${record.votes.against} against)`,
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
            action: `Vote on "${record.title}"`,
            consequence: `Result: ${record.result} (${record.votes.for}+ / ${record.votes.against}− / ${record.votes.abstain} abstain)`,
            severity: record.votes.for > record.votes.against * 2 ? 'high' : 'medium',
        });
    }
    for (const anomaly of anomalies.slice(0, 2)) {
        if (/placeholder/i.test(anomaly.type))
            continue;
        consequences.push({
            action: `${anomaly.type} detected`,
            consequence: anomaly.description,
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
        alternative: 'Stronger whip coordination or earlier compromise negotiation could have maintained party discipline',
    }));
}
// ─── Stakeholder perspective builders ────────────────────────────────────────
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
 * Build multi-stakeholder perspectives for a prospective (week/month-ahead) analysis.
 *
 * @param eventCount - Number of scheduled events
 * @param bottleneckCount - Number of bottlenecked procedures
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
function buildProspectiveStakeholderPerspectives(eventCount, bottleneckCount, topic) {
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
 * Build multi-stakeholder perspectives for a committee reports analysis.
 *
 * @param activePct - Percentage of committees with documents (0-100)
 * @param totalDocs - Total document count
 * @param topic - Primary topic string for context
 * @returns Array of stakeholder perspectives
 */
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
function buildOutcomeMatrix(actions) {
    return actions.map(({ action, scores, confidence }) => buildStakeholderOutcomeMatrix(action, scores, confidence));
}
// ─── Strategy-specific builders ──────────────────────────────────────────────
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
    return {
        what: realRecords.length > 0 || realPatterns.length > 0 || realQuestions.length > 0
            ? `${realRecords.length} votes recorded between ${dateFrom} and ${dateTo}: ${adoptedCount} adopted, ${rejectedCount} rejected. ${realAnomalies.length} voting anomalies detected across ${realPatterns.length} political groups. ${realQuestions.length} parliamentary questions filed.`
            : `Parliamentary activity from ${dateFrom} to ${dateTo}. Detailed roll-call data unavailable for this period.`,
        who: [
            ...realPatterns.map((p) => `${p.group} — cohesion: ${(p.cohesion * 100).toFixed(0)}%, participation: ${(p.participation * 100).toFixed(0)}%`),
            ...realQuestions.slice(0, 3).map((q) => `${q.author} — question on "${q.topic}"`),
        ],
        when: [
            `Period: ${dateFrom} to ${dateTo}`,
            ...realRecords.slice(0, 3).map((r) => `${r.date}: Vote on "${r.title}" — ${r.result}`),
        ],
        why: realPatterns.length > 0
            ? `Voting behaviour reveals the balance of power: groups with high cohesion (${realPatterns.filter((p) => p.cohesion > 0.8).length} groups above 80%) can form blocking minorities or drive legislation. Anomalies signal shifting alliances and emerging fault lines that may reshape future coalition dynamics.`
            : 'Voting patterns in this period reflect ongoing legislative negotiations and inter-institutional bargaining positions.',
        stakeholderOutcomes: deriveStakeholderOutcomesFromVoting(realRecords, realPatterns),
        impactAssessment: {
            political: realRecords.length > 0
                ? `${adoptedCount} adopted texts will shape EU policy. ${realAnomalies.length} anomalies suggest internal disagreements that may affect future negotiations.`
                : 'Legislative outcomes in this period will shape EU policy priorities and inter-institutional dynamics.',
            economic: topTopics.length > 0
                ? `Legislation on ${topTopics.join(', ')} may affect regulatory environments, compliance costs, and market conditions across member states.`
                : 'The legislative outcomes in this period carry potential economic implications for EU businesses and citizens.',
            social: realQuestions.length > 0
                ? `Parliamentary questions on ${realQuestions
                    .slice(0, 2)
                    .map((q) => q.topic)
                    .join(' and ')} highlight citizen concerns that MEPs are bringing to the legislative agenda.`
                : 'Parliamentary questions in this period reflect citizens\u2019 concerns and MEPs\u2019 oversight role.',
            legal: realRecords.length > 0
                ? `${adoptedCount} adopted texts enter the EU legal framework. Rejected proposals (${rejectedCount}) may return in amended form, creating legal uncertainty in affected policy areas.`
                : 'Adopted texts from this period will enter the EU legal framework, while any rejected proposals may be reintroduced in amended form.',
            geopolitical: 'Voting patterns reflect evolving EU positions on international affairs, trade relationships, and global governance commitments.',
        },
        actionConsequences: deriveConsequencesFromVoting(realRecords, realAnomalies),
        mistakes: deriveMistakesFromAnomalies(realAnomalies),
        outlook: realAnomalies.length > 0
            ? `Watch for coalition realignment: ${realAnomalies.length} anomalies detected. Groups with declining cohesion may seek new alliance partners. Upcoming committee votes will test whether these shifts are temporary or structural.`
            : 'The legislative trajectory suggests continued consensus-building with potential pressure points in the weeks ahead.',
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
 * Build deep analysis for week-ahead/month-ahead articles.
 *
 * @param weekData - Aggregated week/month data
 * @param dateRange - Date range for the preview period
 * @param label - "week" or "month"
 * @returns Deep analysis object
 */
export function buildProspectiveAnalysis(weekData, dateRange, label) {
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
        why: bottleneckProcedures.length > 0
            ? `${bottleneckProcedures.length} legislative procedures face bottleneck risks. These delays affect the EU's ability to respond to pressing policy challenges and may create downstream scheduling conflicts.`
            : `With ${eventCount} events and ${pipelineCount} active procedures, this ${label} represents a significant workload. Scheduling density increases the risk of compressed debate time and last-minute amendments.`,
        stakeholderOutcomes: [
            ...(bottleneckProcedures.length > 0
                ? [
                    {
                        actor: 'Legislative pipeline',
                        outcome: 'loser',
                        reason: `${bottleneckProcedures.length} procedures bottlenecked — delays impact legislative throughput`,
                    },
                ]
                : []),
            ...(weekData.committees.length > 3
                ? [
                    {
                        actor: 'Committee system',
                        outcome: 'neutral',
                        reason: `${committeeCount} committees active — heavy workload demands efficient agenda management`,
                    },
                ]
                : []),
        ],
        impactAssessment: {
            political: `${eventCount} plenary events will test political group discipline and coalition stability. Watch for amendment battles in key legislative files.`,
            economic: docCount > 0
                ? `${docCount} legislative documents under consideration may reshape market regulations, trade policies, or fiscal rules.`
                : 'No major economic legislation currently flagged, though committee discussions may surface new regulatory proposals.',
            social: questionCount > 0
                ? `${questionCount} parliamentary questions signal MEP engagement with citizen concerns on policy implementation and accountability.`
                : 'Social impact depends on the outcomes of plenary debates and committee decisions.',
            legal: pipelineCount > 0
                ? `${pipelineCount} pipeline procedures advancing through legislative stages — each vote creates binding legal obligations for member states.`
                : 'The legal landscape awaits legislative outcomes from scheduled proceedings.',
            geopolitical: 'External affairs debates and foreign policy questions may signal evolving EU positioning on global matters.',
        },
        actionConsequences: [
            ...bottleneckProcedures.slice(0, 2).map((p) => ({
                action: `"${p.title}" in ${p.stage ?? 'committee'} stage`,
                consequence: 'Bottleneck risk may cause delay or force procedural shortcuts',
                severity: 'high',
            })),
            ...weekData.events.slice(0, 2).map((e) => ({
                action: `${e.type} on "${e.title}"`,
                consequence: e.description || 'Outcome will shape legislative direction',
                severity: 'medium',
            })),
        ],
        mistakes: bottleneckProcedures.slice(0, 2).map((p) => ({
            actor: 'Legislative coordinators',
            description: `"${p.title}" has reached bottleneck status at ${p.stage ?? 'committee'} stage`,
            alternative: 'Earlier trilogue engagement or simplified procedure could have prevented delay',
        })),
        outlook: `The coming ${label} will test Parliament's capacity to manage ${eventCount} events and ${pipelineCount} active files simultaneously. Key decisions on ${weekData.events[0]?.title ?? 'pending matters'} may set the tone for the legislative session.`,
        stakeholderPerspectives: buildProspectiveStakeholderPerspectives(eventCount, bottleneckProcedures.length, weekData.events[0]?.title ?? `${label} ahead`),
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
        why: anomalyRaw ? s.breakingWhyAnomalies : s.breakingWhyNormal,
        stakeholderOutcomes: [
            ...(adoptedCount > 0
                ? [
                    {
                        actor: s.breakingWinnerActor,
                        outcome: 'winner',
                        reason: s.breakingWinnerReasonFn(adoptedCount),
                    },
                ]
                : []),
            ...(coalitionRaw
                ? [
                    {
                        actor: s.breakingNeutralActor,
                        outcome: 'neutral',
                        reason: s.breakingNeutralReason,
                    },
                ]
                : []),
        ],
        impactAssessment: {
            political: anomalyRaw
                ? s.breakingImpactPoliticalAnomalies
                : s.breakingImpactPoliticalNormalFn(adoptedCount),
            economic: s.breakingImpactEconomic,
            social: s.breakingImpactSocial,
            legal: s.breakingImpactLegalFn(adoptedCount),
            geopolitical: coalitionRaw
                ? s.breakingImpactGeopoliticalCoalition
                : s.breakingImpactGeopoliticalNormal,
        },
        actionConsequences: [
            ...(feedData?.adoptedTexts.slice(0, 2).map((t) => ({
                action: `${s.breakingAdoptedPrefix} "${t.title}"${t.date ? ` (${t.date})` : ''}`,
                consequence: s.breakingLegalObligationsConsequence,
                severity: 'high',
            })) ?? []),
            ...(feedData?.procedures.slice(0, 2).map((p) => ({
                action: `${p.title}${p.date ? ` (${p.date})` : ''}`,
                consequence: s.breakingProcedureConsequence,
                severity: 'medium',
            })) ?? []),
        ],
        mistakes: anomalyRaw
            ? [
                {
                    actor: s.breakingMistakeActor,
                    description: s.breakingMistakeDescription,
                    alternative: s.breakingMistakeAlternative,
                },
            ]
            : [],
        outlook: adoptedCount > 0 ? s.breakingOutlookActiveFn(date) : s.breakingOutlookTransitionalFn(date),
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
 * Classify pipeline health status.
 *
 * @param score - Health score between 0 and 1
 * @returns Human-readable health label
 */
function pipelineHealthLabel(score) {
    if (score > 0.7)
        return 'strong';
    if (score > 0.4)
        return 'moderate';
    return 'weak';
}
/**
 * Build the "why" explanation for propositions based on pipeline health.
 *
 * @param healthScore - 0-1 score
 * @param throughput - Throughput rate
 * @returns Explanation string
 */
function buildPropositionsWhy(healthScore, throughput) {
    const pct = (healthScore * 100).toFixed(0);
    if (healthScore < 0.5) {
        return `Pipeline health at ${pct}% signals legislative congestion. Low throughput (${throughput}) suggests inter-institutional negotiations are stalling, with knock-on effects for the legislative cycle.`;
    }
    const quality = healthScore > 0.7 ? 'healthy' : 'moderate';
    return `Pipeline health at ${pct}% with throughput ${throughput} indicates ${quality} legislative progress. The co-decision process is functioning within normal parameters.`;
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
 *
 * @param pct - Pipeline health percentage as string
 * @param healthScore - Pipeline health score (0-1)
 * @param throughput - Throughput rate
 * @returns Action-consequence pairs
 */
function buildPropositionsConsequences(pct, healthScore, throughput) {
    const healthConsequence = healthScore < 0.5
        ? 'Risk of legislative session overrun; may force prioritisation and file abandonment'
        : 'Sustainable pace; Parliament can accommodate new files without delay';
    const healthSeverity = healthScore < 0.3 ? 'critical' : healthScore < 0.5 ? 'high' : 'medium';
    const throughputConsequence = throughput < 5
        ? 'Slow processing reduces legislative output and postpones policy implementation'
        : 'Healthy throughput enables timely delivery of policy commitments';
    return [
        {
            action: `Pipeline health at ${pct}%`,
            consequence: healthConsequence,
            severity: healthSeverity,
        },
        {
            action: `Throughput rate at ${throughput}`,
            consequence: throughputConsequence,
            severity: throughput < 5 ? 'high' : 'low',
        },
    ];
}
/**
 * Build the impact assessment for propositions analysis.
 *
 * @param healthScore - Pipeline health score (0-1)
 * @param throughput - Throughput rate
 * @returns Impact assessment object
 */
function buildPropositionsImpact(healthScore, throughput) {
    const politicalTail = healthScore < 0.5
        ? 'Current congestion benefits status-quo defenders.'
        : 'Current pace favours reform-oriented groups.';
    const legalText = throughput > 0
        ? `${throughput} procedures at various stages create a complex legal landscape. Overlapping implementation timelines may strain member state transposition capacity.`
        : 'Legislative procedures at various stages create a complex legal landscape. Overlapping implementation timelines may strain member state transposition capacity.';
    return {
        political: `Legislative throughput affects each political group's ability to deliver on manifesto commitments. ${politicalTail}`,
        economic: 'Pending legislation on digital markets, sustainability reporting, and fiscal governance carries significant economic implications for EU businesses.',
        social: 'Citizens await legislative outcomes on healthcare, education, and social protection proposals currently in the pipeline.',
        legal: legalText,
        geopolitical: 'Trade, foreign aid, and sanctions-related proposals in the pipeline affect EU positioning in international negotiations.',
    };
}
/**
 * Build the primary stakeholder outcome for propositions analysis.
 *
 * @param healthScore - Pipeline health score (0-1)
 * @param pct - Pipeline health percentage as string
 * @returns Single stakeholder outcome
 */
function buildPropositionsStakeholderOutcome(healthScore, pct) {
    if (healthScore > 0.7) {
        return {
            actor: 'Parliament presidency',
            outcome: 'winner',
            reason: `High pipeline health (${pct}%) demonstrates effective legislative management`,
        };
    }
    return {
        actor: 'Pending legislation sponsors',
        outcome: 'loser',
        reason: `Low pipeline health (${pct}%) means delays and potential session carry-overs`,
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
        what: `Legislative pipeline assessment as of ${date}: Health score ${pct}%, throughput rate ${throughput}. ${hasProposals ? 'Active proposals under consideration.' : 'No new proposals detected in this period.'}`,
        who: [
            'European Commission (proposal originator)',
            'Rapporteurs (responsible for steering through committee)',
            'Shadow rapporteurs (political group negotiators)',
            'Council of the EU (co-legislator)',
        ],
        when: [`Assessment date: ${date}`, 'Pipeline health reflects cumulative legislative progress'],
        why: buildPropositionsWhy(healthScore, throughput),
        stakeholderOutcomes: [buildPropositionsStakeholderOutcome(healthScore, pct)],
        impactAssessment: buildPropositionsImpact(healthScore, throughput),
        actionConsequences: buildPropositionsConsequences(pct, healthScore, throughput),
        mistakes: healthScore < 0.5
            ? [
                {
                    actor: getConferenceOfPresidents(lang),
                    description: `Pipeline health dropped to ${pct}% — legislative agenda may be overloaded`,
                    alternative: 'Prioritise flagship files and defer low-priority proposals to maintain pipeline flow',
                },
            ]
            : [],
        outlook: `The legislative pipeline's ${pipelineHealthLabel(healthScore)} health will determine whether current proposals reach plenary before session breaks. Key trilogues and committee votes in the coming weeks will be decisive.`,
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
 * Build deep analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @param date - Publication date
 * @param lang - Target language code for localized content
 * @returns Deep analysis object, or `null` when all committee data is placeholder
 */
export function buildCommitteeAnalysis(committees, date, lang = 'en') {
    if (isPlaceholderCommitteeData(committees))
        return null;
    const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
    const activeCommittees = committees.filter((c) => c.documents.length > 0);
    const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
    const pct = ((activeCommittees.length / Math.max(committees.length, 1)) * 100).toFixed(0);
    const descriptor = activeCommittees.length === 0
        ? s.productivityLow
        : committees.length > 0 && activeCommittees.length >= committees.length * 0.7
            ? s.productivityRobust
            : s.productivityModerate;
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
        why: s.why.replace('{pct}', pct).replace('{descriptor}', descriptor),
        stakeholderOutcomes: committees.slice(0, 4).map((c) => ({
            actor: `${c.name} (${c.abbreviation})`,
            outcome: (c.documents.length > 2
                ? 'winner'
                : c.documents.length > 0
                    ? 'neutral'
                    : 'loser'),
            reason: c.documents.length > 2
                ? s.stakeholderHighlyProductive.replace('{n}', String(c.documents.length))
                : c.documents.length > 0
                    ? s.stakeholderModerateActivity.replace('{n}', String(c.documents.length))
                    : s.stakeholderNoDocs,
        })),
        impactAssessment: {
            political: activeCommittees.length === 0
                ? s.impactPoliticalNone
                : s.impactPolitical
                    .replace('{active}', String(activeCommittees.length))
                    .replace('{total}', String(committees.length)),
            economic: s.impactEconomic,
            social: s.impactSocial,
            legal: s.impactLegal.replace('{docs}', String(totalDocs)),
            geopolitical: s.impactGeopolitical,
        },
        actionConsequences: activeCommittees.slice(0, 3).map((c) => ({
            action: s.actionProcessed
                .replace('{abbr}', c.abbreviation)
                .replace('{n}', String(c.documents.length)),
            consequence: s.actionConsequence,
            severity: (c.documents.length > 3 ? 'high' : 'medium'),
        })),
        mistakes: committees
            .filter((c) => c.documents.length === 0)
            .slice(0, 2)
            .map((c) => ({
            actor: `${c.name} (${c.abbreviation})`,
            description: s.mistakeDescription,
            alternative: s.mistakeAlternative,
        })),
        outlook: committees.length > 0 && activeCommittees.length >= committees.length * 0.7
            ? s.outlookGood
                .replace('{n}', String(activeCommittees.length))
                .replace('{total}', String(committees.length))
            : s.outlookConcern,
        stakeholderPerspectives: buildCommitteeStakeholderPerspectives(Number(pct), totalDocs, committees[0]?.name ?? 'EP committees'),
        stakeholderOutcomeMatrix: buildOutcomeMatrix([
            {
                action: `Committee activity as of ${date} (${activeCommittees.length}/${committees.length} active)`,
                scores: {
                    political_groups: Number(pct) > 70 ? 0.8 : 0.5,
                    civil_society: totalDocs > 5 ? 0.6 : 0.4,
                    industry: totalDocs > 5 ? 0.7 : 0.4,
                    national_govts: Number(pct) > 70 ? 0.7 : 0.4,
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
 * Build SWOT analysis for week-ahead / month-ahead articles.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns SWOT analysis data
 */
export function buildProspectiveSwot(weekData, _label, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;
    return {
        strengths: [
            ...(weekData.events.length > 0
                ? [
                    {
                        text: s.prospectiveEvents(weekData.events.length),
                        severity: 'high',
                    },
                ]
                : []),
            ...(weekData.committees.length > 0
                ? [
                    {
                        text: s.prospectiveCommittees(weekData.committees.length),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        weaknesses: [
            ...(bottleneckCount > 0
                ? [
                    {
                        text: s.prospectiveBottlenecks(bottleneckCount),
                        severity: 'high',
                    },
                ]
                : []),
            ...(weekData.events.length > 5
                ? [
                    {
                        text: s.prospectiveHighDensity(weekData.events.length),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        opportunities: [
            ...(weekData.documents.length > 0
                ? [
                    {
                        text: s.prospectiveDocuments(weekData.documents.length),
                        severity: 'medium',
                    },
                ]
                : []),
            ...(weekData.questions.length > 0
                ? [
                    {
                        text: s.prospectiveQuestions(weekData.questions.length),
                        severity: 'medium',
                    },
                ]
                : []),
        ],
        threats: [
            ...(bottleneckCount > 0
                ? [
                    {
                        text: s.prospectiveBottleneckRisk,
                        severity: 'high',
                    },
                ]
                : []),
            {
                text: s.prospectiveSchedulingRisk,
                severity: 'medium',
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
 */
function buildCoalitionMetricsFromPatterns(patterns) {
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    if (realPatterns.length === 0)
        return null;
    const avgCohesion = realPatterns.reduce((sum, p) => sum + p.cohesion, 0) / realPatterns.length;
    const alignmentScore = Math.round(avgCohesion * 100);
    // Detect shift from cohesion spread
    const maxCohesion = Math.max(...realPatterns.map((p) => p.cohesion));
    const minCohesion = Math.min(...realPatterns.map((p) => p.cohesion));
    const spread = maxCohesion - minCohesion;
    const shiftIndicator = spread > 0.3 ? 'weakening' : avgCohesion > 0.7 ? 'strengthening' : 'stable';
    return {
        alignmentScore,
        votingBlocs: realPatterns.slice(0, 6).map((p) => ({
            group: p.group,
            alignmentScore: Math.round(p.cohesion * 100),
        })),
        shiftIndicator,
    };
}
/**
 * Build legislative pipeline data from WeekAheadData.
 *
 * @param weekData - Aggregated week/month data
 * @returns Legislative pipeline object
 */
function buildPipelineFromWeekData(weekData) {
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
 * Build trend analytics from feed data counts using the last 4 items as periods.
 *
 * @param counts - Array of activity counts per period
 * @param period - Trend period label
 * @returns Trend analytics object or null if no data
 */
function buildTrendFromCounts(counts, period) {
    if (counts.length === 0 || counts.every((c) => c === 0))
        return null;
    const periodLabels = counts.map((_, i) => {
        if (period === 'weekly')
            return `W${i + 1}`;
        if (period === 'monthly')
            return `M${i + 1}`;
        return `Q${i + 1}`;
    });
    const metrics = counts.map((value, i) => ({ period: periodLabels[i] ?? `${i + 1}`, value }));
    const last = counts.at(-1) ?? 0;
    const prev = counts.at(-2) ?? last;
    const change = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    const direction = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
    return {
        period,
        metrics,
        direction,
        weekOverWeekChange: period === 'weekly' ? Math.round(change * 10) / 10 : undefined,
        monthOverMonthChange: period === 'monthly' ? Math.round(change * 10) / 10 : undefined,
    };
}
/**
 * Build stakeholder metrics from voting patterns.
 *
 * @param patterns - Voting patterns
 * @param anomalyCount - Number of anomalies
 * @returns Stakeholder metric array
 */
function buildStakeholderMetricsFromVoting(patterns, anomalyCount) {
    const realPatterns = patterns.filter((p) => !/placeholder/i.test(p.group));
    const metrics = realPatterns.slice(0, 4).map((p) => ({
        stakeholder: p.group,
        impactScore: Math.round(p.cohesion * 100),
        impactDirection: (p.cohesion > 0.7 ? 'positive' : p.cohesion < 0.4 ? 'negative' : 'neutral'),
    }));
    if (anomalyCount > 0) {
        metrics.push({
            stakeholder: 'Coalition stability',
            impactScore: Math.max(0, 100 - anomalyCount * 15),
            impactDirection: anomalyCount > 3 ? 'negative' : 'neutral',
        });
    }
    return metrics;
}
/**
 * Build stakeholder metrics for legislative pipeline actors.
 *
 * @param pipeline - Legislative pipeline data
 * @returns Stakeholder metric array
 */
function buildStakeholderMetricsFromPipeline(pipeline) {
    if (!pipeline || pipeline.total === 0)
        return [];
    return [
        {
            stakeholder: 'Legislators',
            impactScore: pipeline.healthScore,
            impactDirection: pipeline.healthScore > 70 ? 'positive' : pipeline.healthScore < 40 ? 'negative' : 'neutral',
        },
        {
            stakeholder: 'Pending proposals',
            impactScore: pipeline.total > 0 ? Math.round((pipeline.blocked / pipeline.total) * 100) : 0,
            impactDirection: pipeline.blocked > 0 ? 'negative' : 'neutral',
            description: pipeline.blocked > 0
                ? `${pipeline.blocked} blocked procedure${pipeline.blocked > 1 ? 's' : ''}`
                : undefined,
        },
    ];
}
// ─── Dashboard builders ──────────────────────────────────────────────────────
/** EP blue transparent color used for chart backgrounds */
const EP_BLUE_TRANSPARENT = 'rgba(0,51,153,0.1)';
/** EP blue border color used for chart lines */
const EP_BLUE_BORDER = '#003399';
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
 * Resolve a direction label from trend direction.
 *
 * @param d - Localized strings
 * @param direction - Trend direction
 * @returns Localized direction label
 */
function resolveTrendDirectionLabel(d, direction) {
    if (direction === 'improving')
        return d.trendImproving;
    if (direction === 'declining')
        return d.trendDeclining;
    return d.trendStableLabel;
}
/**
 * Build a generic trend panel from a trend object.
 *
 * @param d - Localized strings
 * @param trend - Trend analytics
 * @param labels - Labels for x-axis
 * @param datasetLabel - Label for the dataset
 * @returns Panel object or null
 */
function buildGenericTrendPanel(d, trend, labels, datasetLabel) {
    if (!trend)
        return null;
    return {
        title: d.trendAnalysis,
        metrics: [
            {
                label: d.trendAnalysis,
                value: resolveTrendDirectionLabel(d, trend.direction),
            },
        ],
        chart: {
            type: 'line',
            title: d.activityTrendChart,
            data: {
                labels,
                datasets: [
                    {
                        label: datasetLabel,
                        data: trend.metrics.map((m) => m.value),
                        borderColor: EP_BLUE_BORDER,
                        backgroundColor: EP_BLUE_TRANSPARENT,
                    },
                ],
            },
        },
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
export function buildProspectiveDashboard(weekData, _label, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
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
                trend: bottleneckCount > 0 ? 'down' : 'stable',
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
                trend: bottleneckCount > 0 ? 'down' : 'up',
            },
        ],
    };
    // Pipeline status panel
    const pipeline = buildPipelineFromWeekData(weekData);
    const pipelinePanel = pipeline.total > 0
        ? {
            title: d.pipelineStatus,
            metrics: [
                {
                    label: d.onTrack,
                    value: String(pipeline.onTrack),
                    trend: pipeline.onTrack > pipeline.delayed ? 'up' : 'stable',
                },
                {
                    label: d.delayed,
                    value: String(pipeline.delayed),
                    trend: pipeline.delayed > 0 ? 'down' : 'stable',
                },
                { label: d.healthScore, value: `${pipeline.healthScore}%` },
            ],
            chart: {
                type: 'bar',
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
    const trendPanel = buildGenericTrendPanel(d, trend, [d.plenaryEvents, d.committeeMeetings, d.documents, d.questionsFiled], d.scheduledActivity);
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
 * Build dashboard for committee reports articles.
 * Includes document trend analytics alongside committee activity metrics.
 *
 * @param committees - Committee data list
 * @param lang - Target language code
 * @returns Dashboard configuration, or `null` when all committee data is placeholder
 */
export function buildCommitteeDashboard(committees, lang = 'en') {
    if (isPlaceholderCommitteeData(committees))
        return null;
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const activeCommittees = committees.filter((c) => c.documents.length > 0);
    const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
    const activePct = committees.length > 0 ? ((activeCommittees.length / committees.length) * 100).toFixed(0) : '0';
    const overviewPanel = {
        title: d.committeeOverview,
        metrics: [
            { label: d.totalCommittees, value: String(committees.length) },
            {
                label: d.activeCommittees,
                value: String(activeCommittees.length),
                trend: activeCommittees.length >= committees.length * 0.7 ? 'up' : 'down',
            },
            { label: d.activityRate, value: `${activePct}%` },
            { label: d.documentsProduced, value: String(totalDocs) },
        ],
    };
    const chartPanel = committees.length > 0
        ? (() => {
            const topCommittees = [...committees]
                .sort((a, b) => b.documents.length - a.documents.length)
                .slice(0, 6);
            return {
                title: d.documentOutputByCommittee,
                chart: {
                    type: 'bar',
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
export function buildVotingMindmap(records, patterns, anomalies, _lang = 'en') {
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
 * Build intelligence mindmap for week-ahead / month-ahead (prospective) articles.
 *
 * Maps scheduled parliamentary activities by policy domain with committee nodes
 * and pipeline bottleneck indicators.
 *
 * @param weekData - Aggregated week/month-ahead data
 * @param _lang - Reserved for future localisation (default: 'en')
 * @returns Intelligence mindmap data
 */
export function buildProspectiveMindmap(weekData, _lang = 'en') {
    const policyDomains = [
        { id: 'envi', label: 'Environment & Climate', color: 'green' },
        { id: 'econ', label: 'Economy & Finance', color: 'cyan' },
        { id: 'afet', label: 'Foreign Affairs', color: 'blue' },
        { id: 'libe', label: 'Civil Liberties', color: 'purple' },
        { id: 'agri', label: 'Agriculture', color: 'yellow' },
    ];
    const events = weekData.events ?? [];
    const pipeline = weekData.pipeline ?? [];
    const pipelineSlice = pipeline.slice(0, 4);
    const bottleneckCount = pipelineSlice.filter((p) => p.bottleneck === true).length;
    const domainNodes = policyDomains.map((domain, i) => {
        const relatedEvents = events.slice(i * 2, i * 2 + 2);
        const children = relatedEvents.map((ev, ei) => ({
            id: `event-${i}-${ei}`,
            label: ev.title ? ev.title.slice(0, 50) : 'Scheduled event',
            category: 'action',
            influence: 0.6,
            color: 'orange',
            children: [],
        }));
        return {
            id: domain.id,
            label: domain.label,
            category: 'policy_domain',
            influence: 0.5 + (relatedEvents.length > 0 ? 0.3 : 0),
            color: domain.color,
            children,
        };
    });
    // Build pipeline actor nodes preserving original indices as stable IDs
    const actorNetwork = [
        {
            id: 'ep-plenary',
            name: 'Plenary Session',
            type: 'committee',
            influence: 0.95,
            connections: policyDomains.map((d) => d.id),
        },
        ...pipelineSlice.map((p, i) => ({
            id: `pipeline-${i}`,
            name: p.title ? p.title.slice(0, 40) : 'Legislative procedure',
            type: 'external',
            influence: p.bottleneck === true ? 0.85 : 0.5,
            connections: [],
        })),
    ];
    // Filter bottlenecks from the same slice, keeping original index for stable IDs
    const connections = pipelineSlice
        .map((p, origIdx) => ({ p, origIdx }))
        .filter(({ p }) => p.bottleneck === true)
        .slice(0, 3)
        .map(({ p, origIdx }, i) => ({
        from: policyDomains[i % policyDomains.length]?.id ?? 'envi',
        to: `pipeline-${origIdx}`,
        strength: 'strong',
        type: 'legislative',
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
export function buildBreakingMindmap(feedData, _lang = 'en') {
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
export function buildPropositionsMindmap(pipelineData, _lang = 'en') {
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
// ─── Multi-dimensional SWOT builders ────────────────────────────────────────
/**
 * Build a dimension object from sets of pre-computed SWOT items.
 *
 * @param name - Dimension name
 * @param strengths - Strength items for this dimension
 * @param weaknesses - Weakness items for this dimension
 * @param opportunities - Opportunity items for this dimension
 * @param threats - Threat items for this dimension
 * @returns Typed SwotDimension
 */
function makeDimension(name, strengths, weaknesses, opportunities, threats) {
    return { name, strengths, weaknesses, opportunities, threats };
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
/**
 * Build multi-dimensional SWOT analysis for prospective (week/month-ahead) articles.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns Multi-dimensional SWOT data
 */
export function buildProspectiveMultiDimensionalSwot(weekData, _label, lang = 'en') {
    const s = getLocalizedString(SWOT_BUILDER_STRINGS, lang);
    const base = buildProspectiveSwot(weekData, _label, lang);
    const bottlenecks = weekData.pipeline.filter((p) => p.bottleneck === true).length;
    const political = makeDimension('political', weekData.events.length > 0
        ? [{ text: s.prospectiveEvents(weekData.events.length), severity: 'high' }]
        : [], bottlenecks > 0
        ? [{ text: s.prospectiveBottlenecks(bottlenecks), severity: 'high' }]
        : [], [], bottlenecks > 0 ? [{ text: s.prospectiveBottleneckRisk, severity: 'high' }] : []);
    const economic = makeDimension('economic', [], weekData.events.length > 5
        ? [{ text: s.prospectiveHighDensity(weekData.events.length), severity: 'medium' }]
        : [], weekData.documents.length > 0
        ? [{ text: s.prospectiveDocuments(weekData.documents.length), severity: 'medium' }]
        : [], [{ text: s.prospectiveSchedulingRisk, severity: 'medium' }]);
    const social = makeDimension('social', weekData.committees.length > 0
        ? [{ text: s.prospectiveCommittees(weekData.committees.length), severity: 'medium' }]
        : [], [], weekData.questions.length > 0
        ? [{ text: s.prospectiveQuestions(weekData.questions.length), severity: 'medium' }]
        : [], []);
    const legal = makeDimension('legal', [], bottlenecks > 0
        ? [{ text: s.prospectiveBottlenecks(bottlenecks), severity: 'high' }]
        : [], weekData.documents.length > 0
        ? [{ text: s.prospectiveDocuments(weekData.documents.length), severity: 'medium' }]
        : [], bottlenecks > 0 ? [{ text: s.prospectiveBottleneckRisk, severity: 'high' }] : []);
    const geopolitical = makeDimension('geopolitical', weekData.events.length > 0
        ? [{ text: s.prospectiveEvents(weekData.events.length), severity: 'medium' }]
        : [], [], [], [{ text: s.prospectiveSchedulingRisk, severity: 'medium' }]);
    const temporal = {
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
/**
 * Compute weakness and opportunity items for breaking news based on procedure count.
 * Returns a weakness when no procedures exist, or an opportunity when they do.
 *
 * @param procCount - Number of active procedures
 * @param s - Localized SWOT builder strings
 * @returns Tuple of weakness items and opportunity items
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
//# sourceMappingURL=analysis-builders.js.map