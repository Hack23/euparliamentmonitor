// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Runs
 * @description Public re-exports for the runs bounded context.
 */

export {
  discoverAnalysisRuns,
  readRunCandidate,
  dateFromPath,
  type DiscoveredRun,
} from './discover.js';
export { groupRunsForCollision, collisionKey } from './grouping.js';
