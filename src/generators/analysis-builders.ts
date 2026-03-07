// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/AnalysisBuilders
 * @description Pure functions that construct {@link DeepAnalysis} objects from
 * strategy-specific article data. Each builder extracts the "5W + Impact"
 * framework fields from raw parliamentary data so the HTML renderer can
 * produce a uniform deep-analysis section across all article types.
 *
 * These mappers never fetch data or produce side effects — they only transform.
 */

import type {
  DeepAnalysis,
  StakeholderOutcome,
  ActionConsequence,
  PoliticalMistake,
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
  WeekAheadData,
  DateRange,
  CommitteeData,
  LanguageCode,
  BreakingNewsFeedData,
  SwotAnalysis,
  DashboardConfig,
} from '../types/index.js';
import type { PipelineData } from './propositions-content.js';
import {
  getLocalizedString,
  COMMITTEE_ANALYSIS_CONTENT_STRINGS,
  BREAKING_STRINGS,
} from '../constants/languages.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive stakeholder outcomes from voting records.
 * Groups that win votes are "winners"; groups on the losing side are "losers".
 *
 * @param records - Voting records
 * @param patterns - Voting pattern data
 * @returns Stakeholder outcome assessments
 */
function deriveStakeholderOutcomesFromVoting(
  records: readonly VotingRecord[],
  patterns: readonly VotingPattern[]
): StakeholderOutcome[] {
  const outcomes: StakeholderOutcome[] = [];
  // High-cohesion groups that vote with majority are winners
  for (const pattern of patterns) {
    if (pattern.cohesion > 0.8 && pattern.participation > 0.7) {
      outcomes.push({
        actor: pattern.group,
        outcome: 'winner',
        reason: `High cohesion (${(pattern.cohesion * 100).toFixed(0)}%) with strong participation — disciplined bloc that shapes outcomes`,
      });
    } else if (pattern.cohesion < 0.5) {
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
function deriveConsequencesFromVoting(
  records: readonly VotingRecord[],
  anomalies: readonly VotingAnomaly[]
): ActionConsequence[] {
  const consequences: ActionConsequence[] = [];
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
function deriveMistakesFromAnomalies(anomalies: readonly VotingAnomaly[]): PoliticalMistake[] {
  return anomalies
    .filter((a) => a.type?.toLowerCase().includes('defect') || a.severity?.toUpperCase() === 'HIGH')
    .slice(0, 3)
    .map((a) => ({
      actor: 'Political group leadership',
      description: `${a.type}: ${a.description}`,
      alternative:
        'Stronger whip coordination or earlier compromise negotiation could have maintained party discipline',
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
export function buildVotingAnalysis(
  dateFrom: string,
  dateTo: string,
  records: readonly VotingRecord[],
  patterns: readonly VotingPattern[],
  anomalies: readonly VotingAnomaly[],
  questions: readonly MotionsQuestion[]
): DeepAnalysis {
  const adoptedCount = records.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
  const rejectedCount = records.filter((r) => r.result?.toLowerCase().includes('reject')).length;
  const topTopics = records.slice(0, 3).map((r) => r.title);

  return {
    what: `${records.length} votes recorded between ${dateFrom} and ${dateTo}: ${adoptedCount} adopted, ${rejectedCount} rejected. ${anomalies.length} voting anomalies detected across ${patterns.length} political groups. ${questions.length} parliamentary questions filed.`,
    who: [
      ...patterns.map(
        (p) =>
          `${p.group} — cohesion: ${(p.cohesion * 100).toFixed(0)}%, participation: ${(p.participation * 100).toFixed(0)}%`
      ),
      ...questions.slice(0, 3).map((q) => `${q.author} — question on "${q.topic}"`),
    ],
    when: [
      `Period: ${dateFrom} to ${dateTo}`,
      ...records.slice(0, 3).map((r) => `${r.date}: Vote on "${r.title}" — ${r.result}`),
    ],
    why:
      patterns.length > 0
        ? `Voting behaviour reveals the balance of power: groups with high cohesion (${patterns.filter((p) => p.cohesion > 0.8).length} groups above 80%) can form blocking minorities or drive legislation. Anomalies signal shifting alliances and emerging fault lines that may reshape future coalition dynamics.`
        : 'Voting patterns in this period reflect ongoing legislative negotiations and inter-institutional bargaining positions.',
    stakeholderOutcomes: deriveStakeholderOutcomesFromVoting(records, patterns),
    impactAssessment: {
      political: `${adoptedCount} adopted texts will shape EU policy. ${anomalies.length} anomalies suggest internal disagreements that may affect future negotiations.`,
      economic:
        topTopics.length > 0
          ? `Legislation on ${topTopics.join(', ')} may affect regulatory environments, compliance costs, and market conditions across member states.`
          : 'The legislative outcomes in this period carry potential economic implications for EU businesses and citizens.',
      social: `Parliamentary questions on ${
        questions
          .slice(0, 2)
          .map((q) => q.topic)
          .join(' and ') || 'key policy areas'
      } highlight citizen concerns that MEPs are bringing to the legislative agenda.`,
      legal: `${adoptedCount} adopted texts enter the EU legal framework. Rejected proposals (${rejectedCount}) may return in amended form, creating legal uncertainty in affected policy areas.`,
      geopolitical:
        'Voting patterns reflect evolving EU positions on international affairs, trade relationships, and global governance commitments.',
    },
    actionConsequences: deriveConsequencesFromVoting(records, anomalies),
    mistakes: deriveMistakesFromAnomalies(anomalies),
    outlook:
      anomalies.length > 0
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
export function buildProspectiveAnalysis(
  weekData: WeekAheadData,
  dateRange: DateRange,
  label: string
): DeepAnalysis {
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
    why:
      bottleneckProcedures.length > 0
        ? `${bottleneckProcedures.length} legislative procedures face bottleneck risks. These delays affect the EU's ability to respond to pressing policy challenges and may create downstream scheduling conflicts.`
        : `With ${eventCount} events and ${pipelineCount} active procedures, this ${label} represents a significant workload. Scheduling density increases the risk of compressed debate time and last-minute amendments.`,
    stakeholderOutcomes: [
      ...(bottleneckProcedures.length > 0
        ? [
            {
              actor: 'Legislative pipeline',
              outcome: 'loser' as const,
              reason: `${bottleneckProcedures.length} procedures bottlenecked — delays impact legislative throughput`,
            },
          ]
        : []),
      ...(weekData.committees.length > 3
        ? [
            {
              actor: 'Committee system',
              outcome: 'neutral' as const,
              reason: `${committeeCount} committees active — heavy workload demands efficient agenda management`,
            },
          ]
        : []),
    ],
    impactAssessment: {
      political: `${eventCount} plenary events will test political group discipline and coalition stability. Watch for amendment battles in key legislative files.`,
      economic:
        docCount > 0
          ? `${docCount} legislative documents under consideration may reshape market regulations, trade policies, or fiscal rules.`
          : 'No major economic legislation currently flagged, though committee discussions may surface new regulatory proposals.',
      social:
        questionCount > 0
          ? `${questionCount} parliamentary questions signal MEP engagement with citizen concerns on policy implementation and accountability.`
          : 'Social impact depends on the outcomes of plenary debates and committee decisions.',
      legal:
        pipelineCount > 0
          ? `${pipelineCount} pipeline procedures advancing through legislative stages — each vote creates binding legal obligations for member states.`
          : 'The legal landscape awaits legislative outcomes from scheduled proceedings.',
      geopolitical:
        'External affairs debates and foreign policy questions may signal evolving EU positioning on global matters.',
    },
    actionConsequences: [
      ...bottleneckProcedures.slice(0, 2).map((p) => ({
        action: `"${p.title}" in ${p.stage ?? 'committee'} stage`,
        consequence: 'Bottleneck risk may cause delay or force procedural shortcuts',
        severity: 'high' as const,
      })),
      ...weekData.events.slice(0, 2).map((e) => ({
        action: `${e.type} on "${e.title}"`,
        consequence: e.description || 'Outcome will shape legislative direction',
        severity: 'medium' as const,
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
export function buildBreakingAnalysis(
  date: string,
  feedData: BreakingNewsFeedData | undefined,
  anomalyRaw: string,
  coalitionRaw: string,
  lang = 'en'
): DeepAnalysis {
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
              outcome: 'winner' as const,
              reason: s.breakingWinnerReasonFn(adoptedCount),
            },
          ]
        : []),
      ...(coalitionRaw
        ? [
            {
              actor: s.breakingNeutralActor,
              outcome: 'neutral' as const,
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
        severity: 'high' as const,
      })) ?? []),
      ...(feedData?.procedures.slice(0, 2).map((p) => ({
        action: `${p.title}${p.date ? ` (${p.date})` : ''}`,
        consequence: s.breakingProcedureConsequence,
        severity: 'medium' as const,
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
    outlook:
      adoptedCount > 0 ? s.breakingOutlookActiveFn(date) : s.breakingOutlookTransitionalFn(date),
  };
}

/**
 * Classify pipeline health status.
 *
 * @param score - Health score between 0 and 1
 * @returns Human-readable health label
 */
function pipelineHealthLabel(score: number): string {
  if (score > 0.7) return 'strong';
  if (score > 0.4) return 'moderate';
  return 'weak';
}

/**
 * Build the "why" explanation for propositions based on pipeline health.
 *
 * @param healthScore - 0-1 score
 * @param throughput - Throughput rate
 * @returns Explanation string
 */
function buildPropositionsWhy(healthScore: number, throughput: number): string {
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
const CONFERENCE_OF_PRESIDENTS: Record<string, string> = {
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
export function buildPropositionsAnalysis(
  proposalsHtml: string,
  pipelineData: PipelineData | null,
  date: string,
  lang = 'en'
): DeepAnalysis {
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
              outcome: 'winner' as const,
              reason: `High pipeline health (${pct}%) demonstrates effective legislative management`,
            },
          ]
        : [
            {
              actor: 'Pending legislation sponsors',
              outcome: 'loser' as const,
              reason: `Low pipeline health (${pct}%) means delays and potential session carry-overs`,
            },
          ]),
    ],
    impactAssessment: {
      political: `Legislative throughput affects each political group's ability to deliver on manifesto commitments. ${healthScore < 0.5 ? 'Current congestion benefits status-quo defenders.' : 'Current pace favours reform-oriented groups.'}`,
      economic:
        'Pending legislation on digital markets, sustainability reporting, and fiscal governance carries significant economic implications for EU businesses.',
      social:
        'Citizens await legislative outcomes on healthcare, education, and social protection proposals currently in the pipeline.',
      legal: `${throughput} procedures at various stages create a complex legal landscape. Overlapping implementation timelines may strain member state transposition capacity.`,
      geopolitical:
        'Trade, foreign aid, and sanctions-related proposals in the pipeline affect EU positioning in international negotiations.',
    },
    actionConsequences: [
      {
        action: `Pipeline health at ${pct}%`,
        consequence:
          healthScore < 0.5
            ? 'Risk of legislative session overrun; may force prioritisation and file abandonment'
            : 'Sustainable pace; Parliament can accommodate new files without delay',
        severity: healthScore < 0.3 ? 'critical' : healthScore < 0.5 ? 'high' : 'medium',
      },
      {
        action: `Throughput rate at ${throughput}`,
        consequence:
          throughput < 5
            ? 'Slow processing reduces legislative output and postpones policy implementation'
            : 'Healthy throughput enables timely delivery of policy commitments',
        severity: throughput < 5 ? 'high' : 'low',
      },
    ],
    mistakes:
      healthScore < 0.5
        ? [
            {
              actor: CONFERENCE_OF_PRESIDENTS[lang] ?? CONFERENCE_OF_PRESIDENTS['en']!,
              description: `Pipeline health dropped to ${pct}% — legislative agenda may be overloaded`,
              alternative:
                'Prioritise flagship files and defer low-priority proposals to maintain pipeline flow',
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
export function buildCommitteeAnalysis(
  committees: readonly CommitteeData[],
  date: string,
  lang: LanguageCode = 'en'
): DeepAnalysis {
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  const s = getLocalizedString(COMMITTEE_ANALYSIS_CONTENT_STRINGS, lang);
  const pct = ((activeCommittees.length / Math.max(committees.length, 1)) * 100).toFixed(0);
  const descriptor =
    committees.length > 0 && activeCommittees.length >= committees.length * 0.7
      ? s.productivityRobust
      : s.productivityModerate;

  return {
    what: s.what
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
    why: s.why.replace('{pct}', pct).replace('{descriptor}', descriptor),
    stakeholderOutcomes: committees.slice(0, 4).map((c) => ({
      actor: `${c.name} (${c.abbreviation})`,
      outcome: (c.documents.length > 2
        ? 'winner'
        : c.documents.length > 0
          ? 'neutral'
          : 'loser') as 'winner' | 'loser' | 'neutral',
      reason:
        c.documents.length > 2
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
      severity: (c.documents.length > 3 ? 'high' : 'medium') as 'high' | 'medium',
    })),
    mistakes: committees
      .filter((c) => c.documents.length === 0)
      .slice(0, 2)
      .map((c) => ({
        actor: `${c.name} (${c.abbreviation})`,
        description: s.mistakeDescription,
        alternative: s.mistakeAlternative,
      })),
    outlook:
      committees.length > 0 && activeCommittees.length >= committees.length * 0.7
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
 * @returns SWOT analysis data
 */
export function buildVotingSwot(
  records: readonly VotingRecord[],
  patterns: readonly VotingPattern[],
  anomalies: readonly VotingAnomaly[]
): SwotAnalysis {
  const adoptedCount = records.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
  const highCohesionGroups = patterns.filter((p) => p.cohesion > 0.8);
  const lowCohesionGroups = patterns.filter((p) => p.cohesion < 0.5);

  const highSeverityAnomalies = anomalies.filter((a) => a.severity?.toUpperCase() === 'HIGH');

  return {
    strengths: [
      ...(highCohesionGroups.length > 0
        ? [
            {
              text: `${highCohesionGroups.length} political groups with cohesion above 80% — disciplined voting blocs`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(adoptedCount > 0
        ? [
            {
              text: `${adoptedCount} texts adopted — demonstrates legislative productivity`,
              severity: 'medium' as const,
            },
          ]
        : []),
      ...(records.length > 0
        ? [
            {
              text: `${records.length} votes recorded — active plenary engagement`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(lowCohesionGroups.length > 0
        ? [
            {
              text: `${lowCohesionGroups.length} groups with cohesion below 50% — internal divisions weaken bargaining power`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(anomalies.length > 0
        ? [
            {
              text: `${anomalies.length} voting anomalies detected — signals unpredictable coalition behaviour`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      {
        text: 'Cross-party alliances on specific legislation can build broader consensus',
        severity: 'medium' as const,
      },
      ...(patterns.length > 0
        ? [
            {
              text: `${patterns.length} active political groups — diverse coalition formation possibilities`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(highSeverityAnomalies.length > 0
        ? [
            {
              text: `${highSeverityAnomalies.length} high-severity anomalies — risk of coalition fragmentation`,
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: 'Shifting alliances may delay legislative progress on key files',
        severity: 'medium' as const,
      },
    ],
  };
}

/**
 * Build SWOT analysis for week-ahead / month-ahead articles.
 *
 * @param weekData - Aggregated week/month data
 * @param _label - "week" or "month" (reserved for future localisation)
 * @returns SWOT analysis data
 */
export function buildProspectiveSwot(weekData: WeekAheadData, _label: string): SwotAnalysis {
  const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;
  return {
    strengths: [
      ...(weekData.events.length > 0
        ? [
            {
              text: `${weekData.events.length} plenary events scheduled — active legislative agenda`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(weekData.committees.length > 0
        ? [
            {
              text: `${weekData.committees.length} committee meetings — broad policy engagement`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(bottleneckCount > 0
        ? [
            {
              text: `${bottleneckCount} legislative procedures facing bottleneck risks`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(weekData.events.length > 5
        ? [
            {
              text: `High event density (${weekData.events.length}) risks compressed debate time`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      ...(weekData.documents.length > 0
        ? [
            {
              text: `${weekData.documents.length} documents under consideration — legislative momentum`,
              severity: 'medium' as const,
            },
          ]
        : []),
      ...(weekData.questions.length > 0
        ? [
            {
              text: `${weekData.questions.length} parliamentary questions — MEP engagement with citizen concerns`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(bottleneckCount > 0
        ? [
            {
              text: `Bottleneck procedures may force procedural shortcuts or defer key files`,
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: 'Scheduling density increases risk of last-minute amendments',
        severity: 'medium' as const,
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
 * @returns SWOT analysis data
 */
export function buildBreakingSwot(
  feedData: BreakingNewsFeedData | undefined,
  anomalyRaw: string,
  coalitionRaw: string
): SwotAnalysis {
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;

  return {
    strengths: [
      ...(adoptedCount > 0
        ? [
            {
              text: `${adoptedCount} texts adopted — Parliament demonstrating legislative capacity`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(eventCount > 0
        ? [
            {
              text: `${eventCount} parliamentary events — active institutional engagement`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(anomalyRaw
        ? [
            {
              text: 'Voting anomalies detected — potential coalition instability',
              severity: 'high' as const,
            },
          ]
        : []),
      ...(procCount === 0
        ? [
            {
              text: 'No new legislative procedures — limited pipeline momentum',
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      ...(procCount > 0
        ? [
            {
              text: `${procCount} procedures advancing — legislative pipeline active`,
              severity: 'medium' as const,
            },
          ]
        : []),
      ...(coalitionRaw
        ? [
            {
              text: 'Coalition dynamics shifting — new alliance opportunities emerging',
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(anomalyRaw
        ? [
            {
              text: 'Detected anomalies may signal deeper political realignment',
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: 'Rapidly evolving events may outpace legislative response capacity',
        severity: 'medium' as const,
      },
    ],
  };
}

/**
 * Build SWOT analysis for propositions articles.
 *
 * @param pipelineData - Pipeline metrics
 * @returns SWOT analysis data
 */
export function buildPropositionsSwot(pipelineData: PipelineData | null): SwotAnalysis {
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const pct = (healthScore * 100).toFixed(0);

  return {
    strengths: [
      ...(healthScore > 0.7
        ? [
            {
              text: `Pipeline health at ${pct}% — strong legislative management`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(throughput >= 5
        ? [
            {
              text: `Throughput rate ${throughput} — healthy processing pace`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(healthScore < 0.5
        ? [
            {
              text: `Pipeline health at ${pct}% — legislative congestion risk`,
              severity: 'high' as const,
            },
          ]
        : []),
      ...(throughput < 5
        ? [
            {
              text: `Low throughput (${throughput}) — slow processing delays policy implementation`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    opportunities: [
      {
        text: 'Prioritisation of flagship files can improve pipeline efficiency',
        severity: 'medium' as const,
      },
      {
        text: 'Trilogue acceleration on mature files can boost throughput',
        severity: 'medium' as const,
      },
    ],
    threats: [
      ...(healthScore < 0.3
        ? [
            {
              text: 'Critical pipeline congestion may force legislative file abandonment',
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: 'Overlapping implementation timelines strain member state transposition capacity',
        severity: 'medium' as const,
      },
    ],
  };
}

/**
 * Build SWOT analysis for committee reports articles.
 *
 * @param committees - Committee data list
 * @returns SWOT analysis data
 */
export function buildCommitteeSwot(committees: readonly CommitteeData[]): SwotAnalysis {
  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const inactiveCount = committees.length - activeCommittees.length;

  return {
    strengths: [
      ...(activeCommittees.length > 0
        ? [
            {
              text: `${activeCommittees.length} of ${committees.length} committees actively producing documents`,
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
              text: `${totalDocs} documents produced — strong legislative output`,
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    weaknesses: [
      ...(inactiveCount > 0
        ? [
            {
              text: `${inactiveCount} committees with no recent document activity`,
              severity:
                inactiveCount > committees.length * 0.3 ? ('high' as const) : ('medium' as const),
            },
          ]
        : []),
    ],
    opportunities: [
      {
        text: 'Cross-committee collaboration on horizontal policy files can increase impact',
        severity: 'medium' as const,
      },
      ...(committees.length > 0
        ? [
            {
              text: 'Committee hearings provide platform for expert stakeholder engagement',
              severity: 'medium' as const,
            },
          ]
        : []),
    ],
    threats: [
      ...(inactiveCount > committees.length * 0.3
        ? [
            {
              text: 'Low committee activity risks legislative bottlenecks downstream',
              severity: 'high' as const,
            },
          ]
        : []),
      {
        text: 'Competing policy priorities may dilute committee focus',
        severity: 'medium' as const,
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
 * @returns Dashboard configuration
 */
export function buildVotingDashboard(
  records: readonly VotingRecord[],
  patterns: readonly VotingPattern[],
  anomalies: readonly VotingAnomaly[]
): DashboardConfig {
  const adoptedCount = records.filter((r) => r.result?.toLowerCase().includes('adopt')).length;
  const rejectedCount = records.filter((r) => r.result?.toLowerCase().includes('reject')).length;

  const overviewPanel = {
    title: 'Voting Overview',
    metrics: [
      { label: 'Total Votes', value: String(records.length), trend: 'stable' as const },
      {
        label: 'Adopted',
        value: String(adoptedCount),
        trend: adoptedCount > 0 ? ('up' as const) : ('stable' as const),
      },
      { label: 'Rejected', value: String(rejectedCount) },
      { label: 'Anomalies', value: String(anomalies.length) },
    ],
  };

  const cohesionPanel =
    patterns.length > 0
      ? {
          title: 'Political Group Cohesion',
          metrics: patterns.slice(0, 4).map((p) => ({
            label: p.group,
            value: `${(p.cohesion * 100).toFixed(0)}%`,
            trend: (p.cohesion > 0.8 ? 'up' : p.cohesion < 0.5 ? 'down' : 'stable') as
              | 'up'
              | 'down'
              | 'stable',
          })),
          chart: {
            type: 'bar' as const,
            title: 'Group Cohesion Rates',
            data: {
              labels: patterns.slice(0, 6).map((p) => p.group),
              datasets: [
                {
                  label: 'Cohesion %',
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
 * @returns Dashboard configuration
 */
export function buildProspectiveDashboard(
  weekData: WeekAheadData,
  _label: string
): DashboardConfig {
  const bottleneckCount = weekData.pipeline.filter((p) => p.bottleneck === true).length;

  return {
    panels: [
      {
        title: 'Scheduled Activity',
        metrics: [
          { label: 'Plenary Events', value: String(weekData.events.length) },
          { label: 'Committee Meetings', value: String(weekData.committees.length) },
          { label: 'Documents', value: String(weekData.documents.length) },
          {
            label: 'Pipeline Procedures',
            value: String(weekData.pipeline.length),
            trend: bottleneckCount > 0 ? ('down' as const) : ('stable' as const),
          },
        ],
      },
      {
        title: 'Parliamentary Questions',
        metrics: [
          { label: 'Questions Filed', value: String(weekData.questions.length) },
          {
            label: 'Bottleneck Procedures',
            value: String(bottleneckCount),
            trend: bottleneckCount > 0 ? ('down' as const) : ('up' as const),
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
 * @returns Dashboard configuration
 */
export function buildBreakingDashboard(
  feedData: BreakingNewsFeedData | undefined
): DashboardConfig {
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;
  const mepCount = feedData?.mepUpdates.length ?? 0;
  const totalItems = adoptedCount + eventCount + procCount + mepCount;

  return {
    panels: [
      {
        title: 'Feed Activity',
        metrics: [
          {
            label: 'Adopted Texts',
            value: String(adoptedCount),
            trend: adoptedCount > 0 ? ('up' as const) : ('stable' as const),
          },
          { label: 'Events', value: String(eventCount) },
          { label: 'Procedures', value: String(procCount) },
          { label: 'MEP Updates', value: String(mepCount) },
        ],
      },
      {
        title: 'Activity Summary',
        metrics: [{ label: 'Total Items', value: String(totalItems) }],
        ...(totalItems > 0
          ? {
              chart: {
                type: 'doughnut' as const,
                title: 'Feed Breakdown',
                data: {
                  labels: ['Adopted Texts', 'Events', 'Procedures', 'MEP Updates'],
                  datasets: [
                    {
                      label: 'Items',
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
 * @returns Dashboard configuration
 */
export function buildPropositionsDashboard(pipelineData: PipelineData | null): DashboardConfig {
  const healthScore = pipelineData?.healthScore ?? 0;
  const throughput = pipelineData?.throughput ?? 0;
  const pct = (healthScore * 100).toFixed(0);

  return {
    panels: [
      {
        title: 'Pipeline Health',
        metrics: [
          {
            label: 'Health Score',
            value: `${pct}%`,
            trend: (healthScore > 0.7 ? 'up' : healthScore < 0.5 ? 'down' : 'stable') as
              | 'up'
              | 'down'
              | 'stable',
          },
          {
            label: 'Throughput',
            value: String(throughput),
            trend: throughput >= 5 ? ('up' as const) : ('down' as const),
          },
          {
            label: 'Status',
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
 * @returns Dashboard configuration
 */
export function buildCommitteeDashboard(committees: readonly CommitteeData[]): DashboardConfig {
  const activeCommittees = committees.filter((c) => c.documents.length > 0);
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const activePct =
    committees.length > 0 ? ((activeCommittees.length / committees.length) * 100).toFixed(0) : '0';

  const overviewPanel = {
    title: 'Committee Overview',
    metrics: [
      { label: 'Total Committees', value: String(committees.length) },
      {
        label: 'Active Committees',
        value: String(activeCommittees.length),
        trend:
          activeCommittees.length >= committees.length * 0.7 ? ('up' as const) : ('down' as const),
      },
      { label: 'Activity Rate', value: `${activePct}%` },
      { label: 'Documents Produced', value: String(totalDocs) },
    ],
  };

  const chartPanel =
    committees.length > 0
      ? (() => {
          const topCommittees = [...committees]
            .sort((a, b) => b.documents.length - a.documents.length)
            .slice(0, 6);
          return {
            title: 'Document Output by Committee',
            chart: {
              type: 'bar' as const,
              title: 'Documents per Committee',
              data: {
                labels: topCommittees.map((c) => c.abbreviation),
                datasets: [
                  {
                    label: 'Documents',
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
