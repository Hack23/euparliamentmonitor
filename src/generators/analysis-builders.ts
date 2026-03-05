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
} from '../types/index.js';
import type { PipelineData } from './propositions-content.js';
import type { BreakingNewsFeedData } from '../types/index.js';

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
 * @returns Deep analysis object
 */
export function buildBreakingAnalysis(
  date: string,
  feedData: BreakingNewsFeedData | undefined,
  anomalyRaw: string,
  coalitionRaw: string
): DeepAnalysis {
  const adoptedCount = feedData?.adoptedTexts.length ?? 0;
  const eventCount = feedData?.events.length ?? 0;
  const procCount = feedData?.procedures.length ?? 0;
  const mepCount = feedData?.mepUpdates.length ?? 0;

  return {
    what: `Breaking developments on ${date}: ${adoptedCount} newly adopted texts, ${eventCount} events, ${procCount} procedure updates, ${mepCount} MEP changes.`,
    who: [
      ...(feedData?.adoptedTexts
        .slice(0, 3)
        .map((t) => `Adopted: ${t.title}${t.date ? ` (${t.date})` : ''}`) ?? []),
      ...(feedData?.mepUpdates
        .slice(0, 2)
        .map((m) => `MEP: ${m.name}${m.date ? ` (${m.date})` : ''}`) ?? []),
    ],
    when: [
      `Date: ${date}`,
      ...(feedData?.events.slice(0, 3).map((e) => `${e.title}${e.date ? ` (${e.date})` : ''}`) ??
        []),
    ],
    why: anomalyRaw
      ? 'Voting anomalies and coalition shifts signal realignment of political forces within Parliament. These developments may alter the legislative calculus for pending files.'
      : 'Current events reflect the ongoing pace of legislative activity. Feed data provides real-time visibility into parliamentary proceedings.',
    stakeholderOutcomes: [
      ...(adoptedCount > 0
        ? [
            {
              actor: 'Legislative majority',
              outcome: 'winner' as const,
              reason: `${adoptedCount} texts adopted — the governing coalition successfully advanced its agenda`,
            },
          ]
        : []),
      ...(coalitionRaw
        ? [
            {
              actor: 'Opposition groups',
              outcome: 'neutral' as const,
              reason: 'Coalition dynamics in flux — opposition groups may find new leverage points',
            },
          ]
        : []),
    ],
    impactAssessment: {
      political: anomalyRaw
        ? 'Voting anomalies detected suggest shifting alliances that could reshape committee compositions and rapporteur assignments.'
        : `${adoptedCount} adopted texts reflect the current balance of political forces.`,
      economic: `New legislation may affect regulatory compliance, market conditions, and fiscal planning for EU businesses.`,
      social: 'Citizens are directly affected by adopted texts and legislative procedure outcomes.',
      legal: `${adoptedCount} adopted texts create new legal obligations. Procedure updates may signal changes to pending legislation.`,
      geopolitical: coalitionRaw
        ? 'Coalition dynamics may influence EU external policy positions and international negotiation strategies.'
        : 'Legislative outcomes carry implications for EU international commitments and trade negotiations.',
    },
    actionConsequences: [
      ...(feedData?.adoptedTexts.slice(0, 2).map((t) => ({
        action: `Adoption of "${t.title}"${t.date ? ` (${t.date})` : ''}`,
        consequence: 'New legal obligations for member states; implementation deadlines begin',
        severity: 'high' as const,
      })) ?? []),
      ...(feedData?.procedures.slice(0, 2).map((p) => ({
        action: `Procedure update: "${p.title}"${p.date ? ` (${p.date})` : ''}`,
        consequence: 'Legislative trajectory altered; stakeholders must adjust positions',
        severity: 'medium' as const,
      })) ?? []),
    ],
    mistakes: anomalyRaw
      ? [
          {
            actor: 'Political group whips',
            description:
              'Failed to maintain voting discipline — anomalies detected in party-line votes',
            alternative:
              'Pre-vote consultations and compromise amendments could have preserved cohesion',
          },
        ]
      : [],
    outlook: `Developments on ${date} signal ${adoptedCount > 0 ? 'an active legislative phase' : 'a transitional period'}. Watch for downstream effects on pending committee files and upcoming plenary sessions.`,
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
 * @returns Deep analysis object
 */
export function buildCommitteeAnalysis(
  committees: readonly CommitteeData[],
  date: string
): DeepAnalysis {
  const totalDocs = committees.reduce((sum, c) => sum + c.documents.length, 0);
  const activeCommittees = committees.filter((c) => c.documents.length > 0);

  return {
    what: `Committee activity report as of ${date}: ${committees.length} committees monitored, ${totalDocs} documents processed, ${activeCommittees.length} committees with recent activity.`,
    who: committees.map(
      (c) => `${c.name} (${c.abbreviation}) — Chair: ${c.chair}, ${c.members} members`
    ),
    when: [
      `Reporting date: ${date}`,
      ...committees
        .slice(0, 3)
        .flatMap((c) =>
          c.documents
            .slice(0, 1)
            .map((d) => `${c.abbreviation}: ${d.title}${d.date ? ` (${d.date})` : ''}`)
        ),
    ],
    why: `Committees are the legislative engine of the European Parliament — ${((activeCommittees.length / Math.max(committees.length, 1)) * 100).toFixed(0)}% active rate signals ${activeCommittees.length >= committees.length * 0.7 ? 'robust' : 'moderate'} legislative productivity. Committee outputs directly shape the texts that reach plenary votes.`,
    stakeholderOutcomes: committees.slice(0, 4).map((c) => ({
      actor: `${c.name} (${c.abbreviation})`,
      outcome: (c.documents.length > 2
        ? 'winner'
        : c.documents.length > 0
          ? 'neutral'
          : 'loser') as 'winner' | 'loser' | 'neutral',
      reason:
        c.documents.length > 2
          ? `${c.documents.length} documents — highly productive period`
          : c.documents.length > 0
            ? `${c.documents.length} document(s) — moderate activity`
            : 'No recent documents — potential productivity concern',
    })),
    impactAssessment: {
      political: `Committee chairs wield significant agenda-setting power. Active committees (${activeCommittees.length}/${committees.length}) are shaping the legislative pipeline for the current session.`,
      economic:
        'Committee outputs on economic affairs, industry, and trade directly affect EU regulatory environments and business competitiveness.',
      social:
        "Social affairs, employment, and civil liberties committees produce legislation that directly impacts citizens' daily lives.",
      legal: `${totalDocs} documents in various stages of committee consideration will eventually create or modify EU law.`,
      geopolitical:
        'Foreign affairs and international trade committee activities signal evolving EU diplomatic and trade priorities.',
    },
    actionConsequences: activeCommittees.slice(0, 3).map((c) => ({
      action: `${c.abbreviation} processed ${c.documents.length} document(s)`,
      consequence: `Legislative proposals advance to next stage; affected stakeholders should prepare for implementation`,
      severity: (c.documents.length > 3 ? 'high' : 'medium') as 'high' | 'medium',
    })),
    mistakes: committees
      .filter((c) => c.documents.length === 0)
      .slice(0, 2)
      .map((c) => ({
        actor: `${c.name} (${c.abbreviation})`,
        description: 'No recent documents produced — legislative backlog may be developing',
        alternative: 'Convene additional sessions or reassign resources to clear pending files',
      })),
    outlook: `With ${activeCommittees.length} of ${committees.length} committees actively producing documents, the ${activeCommittees.length >= committees.length * 0.7 ? 'current pace supports a productive plenary calendar' : 'legislative pipeline may face bottlenecks if committee output does not increase'}.`,
  };
}
