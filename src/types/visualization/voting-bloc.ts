// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization/VotingBloc
 * @description Voting-bloc / coalition-dynamics data structures used by
 * the political-intelligence dashboard (coalition radar chart, defining
 * votes, bloc alignment scores).
 */

/**
 * A single voting bloc within a coalition.
 */
export interface VotingBloc {
  /** Name of the political group */
  readonly group: string;
  /** Alignment score with the coalition (0–100) */
  readonly alignmentScore: number;
  /** Optional seat count */
  readonly seats?: number | undefined;
}

/**
 * A defining vote that shaped coalition dynamics.
 */
export interface VoteHighlight {
  /** Vote title or description */
  readonly title: string;
  /** Outcome of the vote */
  readonly outcome: 'adopted' | 'rejected' | 'split';
  /** Votes in favour */
  readonly votesFor: number;
  /** Votes against */
  readonly votesAgainst: number;
}

/**
 * Coalition dynamics metrics for a parliamentary period.
 * Used to build coalition radar charts and alignment visualizations.
 */
export interface CoalitionMetrics {
  /** Overall alignment score (0–100) */
  readonly alignmentScore: number;
  /** Identified voting blocs and their cohesion */
  readonly votingBlocs: readonly VotingBloc[];
  /** Overall trend direction */
  readonly shiftIndicator: 'strengthening' | 'weakening' | 'stable';
  /** Defining votes that illustrate coalition dynamics */
  readonly keyVotes?: readonly VoteHighlight[] | undefined;
}
