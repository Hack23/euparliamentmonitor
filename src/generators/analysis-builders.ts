// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/AnalysisBuilders
 * @description Barrel re-export — the implementation has been refactored into
 * bounded-context modules under {@link module:Generators/Builders}.
 *
 * **Note:** Multi-dimensional SWOT builders, standard mindmap/sankey section
 * builders, and related helpers were removed as dead code in v0.8.27+.
 * Only the actively-used analysis, SWOT, dashboard, and intelligence mindmap
 * builders are exported below.
 */

export {
  AI_MARKER,
  buildVotingAnalysis,
  buildVotingSwot,
  buildVotingDashboard,
  buildVotingMindmap,
  buildProspectiveAnalysis,
  buildProspectiveSwot,
  buildProspectiveDashboard,
  buildProspectiveMindmap,
  buildBreakingAnalysis,
  buildBreakingSwot,
  buildBreakingDashboard,
  buildBreakingMindmap,
  buildPropositionsAnalysis,
  buildPropositionsSwot,
  buildPropositionsDashboard,
  buildPropositionsMindmap,
  buildCommitteeAnalysis,
  buildCommitteeSwot,
  buildCommitteeDashboard,
  buildCommitteeMindmap,
} from './builders/index.js';
