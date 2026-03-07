// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getLocalizedString, COMMITTEE_ANALYSIS_CONTENT_STRINGS, BREAKING_STRINGS, SWOT_BUILDER_STRINGS, DASHBOARD_BUILDER_STRINGS, } from '../constants/languages.js';
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
        consequences.push({
            action: `Vote on "${record.title}"`,
            consequence: `Result: ${record.result} (${record.votes.for}+ / ${record.votes.against}− / ${record.votes.abstain} abstain)`,
            severity: record.votes.for > record.votes.against * 2 ? 'high' : 'medium',
        });
    }
    for (const anomaly of anomalies.slice(0, 2)) {
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
    const adoptedCount = records.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const rejectedCount = records.filter((r) => r.result?.toLowerCase().includes('reject')).length;
    const topTopics = records.slice(0, 3).map((r) => r.title);
    return {
        what: `${records.length} votes recorded between ${dateFrom} and ${dateTo}: ${adoptedCount} adopted, ${rejectedCount} rejected. ${anomalies.length} voting anomalies detected across ${patterns.length} political groups. ${questions.length} parliamentary questions filed.`,
        who: [
            ...patterns.map((p) => `${p.group} — cohesion: ${(p.cohesion * 100).toFixed(0)}%, participation: ${(p.participation * 100).toFixed(0)}%`),
            ...questions.slice(0, 3).map((q) => `${q.author} — question on "${q.topic}"`),
        ],
        when: [
            `Period: ${dateFrom} to ${dateTo}`,
            ...records.slice(0, 3).map((r) => `${r.date}: Vote on "${r.title}" — ${r.result}`),
        ],
        why: patterns.length > 0
            ? `Voting behaviour reveals the balance of power: groups with high cohesion (${patterns.filter((p) => p.cohesion > 0.8).length} groups above 80%) can form blocking minorities or drive legislation. Anomalies signal shifting alliances and emerging fault lines that may reshape future coalition dynamics.`
            : 'Voting patterns in this period reflect ongoing legislative negotiations and inter-institutional bargaining positions.',
        stakeholderOutcomes: deriveStakeholderOutcomesFromVoting(records, patterns),
        impactAssessment: {
            political: `${adoptedCount} adopted texts will shape EU policy. ${anomalies.length} anomalies suggest internal disagreements that may affect future negotiations.`,
            economic: topTopics.length > 0
                ? `Legislation on ${topTopics.join(', ')} may affect regulatory environments, compliance costs, and market conditions across member states.`
                : 'The legislative outcomes in this period carry potential economic implications for EU businesses and citizens.',
            social: `Parliamentary questions on ${questions
                .slice(0, 2)
                .map((q) => q.topic)
                .join(' and ') || 'key policy areas'} highlight citizen concerns that MEPs are bringing to the legislative agenda.`,
            legal: `${adoptedCount} adopted texts enter the EU legal framework. Rejected proposals (${rejectedCount}) may return in amended form, creating legal uncertainty in affected policy areas.`,
            geopolitical: 'Voting patterns reflect evolving EU positions on international affairs, trade relationships, and global governance commitments.',
        },
        actionConsequences: deriveConsequencesFromVoting(records, anomalies),
        mistakes: deriveMistakesFromAnomalies(anomalies),
        outlook: anomalies.length > 0
            ? `Watch for coalition realignment: ${anomalies.length} anomalies detected. Groups with declining cohesion may seek new alliance partners. Upcoming committee votes will test whether these shifts are temporary or structural.`
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
const CONFERENCE_OF_PRESIDENTS = {
    en: 'Conference of Presidents',
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
 * Build deep analysis for propositions articles.
 *
 * @param proposalsHtml - Proposals HTML (used to detect content presence)
 * @param pipelineData - Pipeline metrics
 * @param date - Publication date
 * @param lang - Target display language (default: 'en')
 * @returns Deep analysis object
 */
export function buildPropositionsAnalysis(proposalsHtml, pipelineData, date, lang = 'en') {
    const hasProposals = proposalsHtml.length > 0;
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
            legal: `${throughput} procedures at various stages create a complex legal landscape. Overlapping implementation timelines may strain member state transposition capacity.`,
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
                    actor: CONFERENCE_OF_PRESIDENTS[lang] ?? CONFERENCE_OF_PRESIDENTS['en'],
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
 * @returns Deep analysis object
 */
export function buildCommitteeAnalysis(committees, date, lang = 'en') {
    const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
    const activeCommittees = committees.filter((c) => c.documents.length > 0);
    const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
    const pct = ((activeCommittees.length / Math.max(committees.length, 1)) * 100).toFixed(0);
    const descriptor = committees.length > 0 && activeCommittees.length >= committees.length * 0.7
        ? s.productivityRobust
        : s.productivityModerate;
    return {
        what: s.what
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
            political: s.impactPolitical
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
    const adoptedCount = records.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const highCohesionGroups = patterns.filter((p) => p.cohesion > 0.8);
    const lowCohesionGroups = patterns.filter((p) => p.cohesion < 0.5);
    const highSeverityAnomalies = anomalies.filter((a) => a.severity?.toUpperCase() === 'HIGH');
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
            ...(records.length > 0
                ? [
                    {
                        text: s.votingActiveVotes(records.length),
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
            ...(anomalies.length > 0
                ? [
                    {
                        text: s.votingAnomalies(anomalies.length),
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
            ...(patterns.length > 0
                ? [
                    {
                        text: s.votingDiverseGroups(patterns.length),
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
 * @returns SWOT analysis data
 */
export function buildCommitteeSwot(committees, lang = 'en') {
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
    const adoptedCount = records.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
    const rejectedCount = records.filter((r) => r.result?.toLowerCase().includes('reject')).length;
    const overviewPanel = {
        title: d.votingOverview,
        metrics: [
            { label: d.totalVotes, value: String(records.length), trend: 'stable' },
            {
                label: d.adopted,
                value: String(adoptedCount),
                trend: adoptedCount > 0 ? 'up' : 'stable',
            },
            { label: d.rejected, value: String(rejectedCount) },
            { label: d.anomalies, value: String(anomalies.length) },
        ],
    };
    const cohesionPanel = patterns.length > 0
        ? {
            title: d.politicalGroupCohesion,
            metrics: patterns.slice(0, 4).map((p) => ({
                label: p.group,
                value: `${(p.cohesion * 100).toFixed(0)}%`,
                trend: (p.cohesion > 0.8 ? 'up' : p.cohesion < 0.5 ? 'down' : 'stable'),
            })),
            chart: {
                type: 'bar',
                title: d.groupCohesionRates,
                data: {
                    labels: patterns.slice(0, 6).map((p) => p.group),
                    datasets: [
                        {
                            label: d.cohesionPct,
                            data: patterns.slice(0, 6).map((p) => Math.round(p.cohesion * 100)),
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
                        value: pipelineHealthLabel(healthScore),
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
 * @returns Dashboard configuration
 */
export function buildCommitteeDashboard(committees, lang = 'en') {
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
//# sourceMappingURL=analysis-builders.js.map