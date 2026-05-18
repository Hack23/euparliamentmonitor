// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/MCP/Reports
 * @description Report-type enumeration and the `generateReport` MCP tool
 * options shape.
 */

/** Allowed report types for analytical reports */
export type ReportType =
  | 'MEP_ACTIVITY'
  | 'COMMITTEE_PERFORMANCE'
  | 'VOTING_STATISTICS'
  | 'LEGISLATION_PROGRESS';

/** Options for generating analytical reports */
export interface GenerateReportOptions {
  reportType: ReportType;
  subjectId?: string | undefined;
  dateFrom?: string | undefined;
}
