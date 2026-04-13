// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Builders
 * @description Barrel re-export for all analysis builder modules.
 * Provides backward-compatible access to all builder functions through
 * a single import path.
 */

export { AI_MARKER } from '../../constants/analysis-constants.js';

export {
  buildVotingAnalysis,
  buildVotingSwot,
  buildVotingDashboard,
  buildVotingMindmap,
} from './voting-builders.js';

export {
  buildProspectiveAnalysis,
  buildProspectiveSwot,
  buildProspectiveDashboard,
  buildProspectiveMindmap,
} from './prospective-builders.js';

export {
  buildBreakingAnalysis,
  buildBreakingSwot,
  buildBreakingDashboard,
  buildBreakingMindmap,
} from './breaking-builders.js';

export {
  buildPropositionsAnalysis,
  buildPropositionsSwot,
  buildPropositionsDashboard,
  buildPropositionsMindmap,
} from './propositions-builders.js';

export {
  buildCommitteeAnalysis,
  buildCommitteeSwot,
  buildCommitteeDashboard,
  buildCommitteeMindmap,
} from './committee-builders.js';
