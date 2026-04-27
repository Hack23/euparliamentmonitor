// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Cli
 * @description Public re-exports for the CLI bounded context.
 */

export {
  parseCliArgsSafe,
  HELP_TEXT,
  type ParsedCli,
  type ParsedOptions,
  type ParsedHelp,
  type ParsedError,
} from './parse.js';
