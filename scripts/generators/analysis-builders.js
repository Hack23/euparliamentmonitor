// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, COMMITTEE_ANALYSIS_CONTENT_STRINGS, BREAKING_STRINGS, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../constants/languages.js';
import { isPlaceholderCommitteeData } from './committee-helpers.js';
import { PLACEHOLDER_MARKER } from './motions-content.js';
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
        stakeholderOutcomes: [
            ...(healthScore > 0.7
                ? [
                    {
                        actor: 'Parliament presidency',
                        outcome: 'winner',
                        reason: `High pipeline health (${pct}%) demonstrates effective legislative management`,
                    },
                ]
                : [
                    {
                        actor: 'Pending legislation sponsors',
                        outcome: 'loser',
                        reason: `Low pipeline health (${pct}%) means delays and potential session carry-overs`,
                    },
                ]),
        ],
        impactAssessment: {
            political: `Legislative throughput affects each political group's ability to deliver on manifesto commitments. ${healthScore < 0.5 ? 'Current congestion benefits status-quo defenders.' : 'Current pace favours reform-oriented groups.'}`,
            economic: 'Pending legislation on digital markets, sustainability reporting, and fiscal governance carries significant economic implications for EU businesses.',
            social: 'Citizens await legislative outcomes on healthcare, education, and social protection proposals currently in the pipeline.',
            legal: throughput > 0
                ? `${throughput} procedures at various stages create a complex legal landscape. Overlapping implementation timelines may strain member state transposition capacity.`
                : `Legislative procedures at various stages create a complex legal landscape. Overlapping implementation timelines may strain member state transposition capacity.`,
            geopolitical: 'Trade, foreign aid, and sanctions-related proposals in the pipeline affect EU positioning in international negotiations.',
        },
        actionConsequences: [
            {
                action: `Pipeline health at ${pct}%`,
                consequence: healthScore < 0.5
                    ? 'Risk of legislative session overrun; may force prioritisation and file abandonment'
                    : 'Sustainable pace; Parliament can accommodate new files without delay',
                severity: healthScore < 0.3 ? 'critical' : healthScore < 0.5 ? 'high' : 'medium',
            },
            {
                action: `Throughput rate at ${throughput}`,
                consequence: throughput < 5
                    ? 'Slow processing reduces legislative output and postpones policy implementation'
                    : 'Healthy throughput enables timely delivery of policy commitments',
                severity: throughput < 5 ? 'high' : 'low',
            },
        ],
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
/**
 * Build dashboard for voting-based articles (motions, weekly/monthly review).
 *
 * @param records - Voting records
 * @param patterns - Voting patterns
 * @param anomalies - Detected anomalies
 * @param lang - Target language code
 * @returns Dashboard configuration
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
    const panels = cohesionPanel ? [overviewPanel, cohesionPanel] : [overviewPanel];
    return { panels };
}
/**
 * Build dashboard for week-ahead / month-ahead articles.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @param lang - Target language code
 * @returns Dashboard configuration
 */
export function buildProspectiveDashboard(weekData, _label, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;
    return {
        panels: [
            {
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
            },
            {
                title: d.parliamentaryQuestions,
                metrics: [
                    { label: d.questionsFiled, value: String(weekData.questions.length) },
                    {
                        label: d.bottleneckProcedures,
                        value: String(bottleneckCount),
                        trend: bottleneckCount > 0 ? 'down' : 'up',
                    },
                ],
            },
        ],
    };
}
/**
 * Build dashboard for breaking news articles.
 *
 * @param feedData - EP feed data
 * @param lang - Target language code
 * @returns Dashboard configuration
 */
export function buildBreakingDashboard(feedData, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const adoptedCount = feedData?.adoptedTexts.length ?? 0;
    const eventCount = feedData?.events.length ?? 0;
    const procCount = feedData?.procedures.length ?? 0;
    const mepCount = feedData?.mepUpdates.length ?? 0;
    const totalItems = adoptedCount + eventCount + procCount + mepCount;
    return {
        panels: [
            {
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
            },
            {
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
            },
        ],
    };
}
/**
 * Build dashboard for propositions articles.
 *
 * @param pipelineData - Pipeline metrics
 * @param lang - Target language code
 * @returns Dashboard configuration
 */
export function buildPropositionsDashboard(pipelineData, lang = 'en') {
    const d = getLocalizedString(DASHBOARD_BUILDER_STRINGS, lang);
    const healthScore = pipelineData?.healthScore ?? 0;
    const throughput = pipelineData?.throughput ?? 0;
    const pct = (healthScore * 100).toFixed(0);
    return {
        panels: [
            {
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
                        value: healthScore > 0.7
                            ? d.pipelineStrong
                            : healthScore > 0.4
                                ? d.pipelineModerate
                                : d.pipelineWeak,
                    },
                ],
            },
        ],
    };
}
/**
 * Build dashboard for committee reports articles.
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
    const panels = chartPanel ? [overviewPanel, chartPanel] : [overviewPanel];
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
    const connections = realAnomalies.slice(0, 4).map((a, i) => ({
        from: `group-${i % Math.max(1, domainNodes.length)}`,
        to: `anomaly-${i}`,
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
    const bottleneckCount = pipeline.filter((p) => p.bottleneck === true).length;
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
    const actorNetwork = [
        {
            id: 'ep-plenary',
            name: 'Plenary Session',
            type: 'committee',
            influence: 0.95,
            connections: policyDomains.map((d) => d.id),
        },
        ...pipeline.slice(0, 4).map((p, i) => ({
            id: `pipeline-${i}`,
            name: p.title ? p.title.slice(0, 40) : 'Legislative procedure',
            type: 'external',
            influence: p.bottleneck === true ? 0.85 : 0.5,
            connections: [],
        })),
    ];
    const connections = pipeline
        .filter((p) => p.bottleneck === true)
        .slice(0, 3)
        .map((p, i) => ({
        from: policyDomains[i % policyDomains.length]?.id ?? 'envi',
        to: `pipeline-${i}`,
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
            'green', 'cyan', 'blue', 'purple', 'orange', 'yellow', 'magenta', 'red',
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
    const connections = activeCommittees
        .slice(0, 3)
        .flatMap((c, i) => activeCommittees
        .slice(i + 1, i + 2)
        .map((c2) => ({
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
//# sourceMappingURL=analysis-builders.js.map