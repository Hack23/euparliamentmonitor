// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/MCPProbe
 * @description MCP reliability probe that exercises EP, IMF, and World Bank
 * tool surfaces and emits a machine-readable health matrix.
 */

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import {
  EP_MCP_TOOLS,
  closeEPMCPClient,
  getEPMCPClient,
  type EuropeanParliamentMCPClient,
} from '../mcp/ep-mcp-client.js';
import {
  IMF_MCP_TOOLS,
  closeIMFMCPClient,
  getIMFMCPClient,
  type IMFMCPClient,
} from '../mcp/imf-mcp-client.js';
import {
  WORLD_BANK_MCP_TOOLS,
  closeWBMCPClient,
  getWBMCPClient,
  type WorldBankMCPClient,
} from '../mcp/wb-mcp-client.js';
import type { MCPToolResult } from '../types/index.js';

type ProbeSeverity = 'green' | 'yellow' | 'red';

interface ProbeResult {
  readonly server: 'ep' | 'imf' | 'world-bank';
  readonly tool: string;
  readonly severity: ProbeSeverity;
  readonly durationMs: number;
  readonly message: string;
}

interface ProbeReport {
  readonly generatedAt: string;
  readonly timeoutMs: number;
  readonly timeoutRetries: number;
  readonly summary: {
    readonly total: number;
    readonly green: number;
    readonly yellow: number;
    readonly red: number;
  };
  readonly results: readonly ProbeResult[];
}

const TOOL_TIMEOUT_MS = 15_000;
const TOOL_TIMEOUT_RETRIES = 1;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._\-+/=]+/gi;
const API_KEY_PATTERN = /(api[_-]?key"?\s*[:=]\s*")([^"]+)(")/gi;
const SAMPLE_MEP_ID = 'MEP-124810';
const SAMPLE_PROCEDURE_ID = '2024/0001(COD)';

/**
 * Redact bearer tokens and API keys from probe output strings.
 *
 * @param value - Free-form log or error string
 * @returns Redacted string safe for CI logs
 */
export function redactSecrets(value: string): string {
  return value
    .replace(BEARER_PATTERN, 'Bearer [REDACTED]')
    .replace(API_KEY_PATTERN, '$1[REDACTED]$3');
}

/**
 * Build deterministic JSON output for snapshot testing and CI consumers.
 *
 * @param report - Probe report
 * @returns Pretty-printed JSON report
 */
export function formatProbeReport(report: ProbeReport): string {
  return JSON.stringify(report, null, 2);
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, tool: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`UPSTREAM_TIMEOUT: ${tool} exceeded ${String(timeoutMs)}ms`)),
      timeoutMs
    );
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function callWithTimeoutRetry<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutRetries: number,
  tool: string
): Promise<T> {
  let lastError: Error = new Error(`Failed to call ${tool}`);
  for (let attempt = 0; attempt <= timeoutRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs, tool);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!lastError.message.toLowerCase().includes('timeout') || attempt >= timeoutRetries) {
        throw lastError;
      }
    }
  }
  throw lastError;
}

export function classifyProbeResult(result: MCPToolResult): ProbeSeverity {
  const text = result.content?.[0]?.text ?? '';
  if (result.isError === true) return 'red';
  if (!text || text.trim().length === 0) return 'yellow';
  if (text.includes('"status":"unavailable"') || text.includes('"status": "unavailable"')) {
    return 'yellow';
  }
  return 'green';
}

export function classifyProbeError(message: string): ProbeSeverity {
  const lower = message.toLowerCase();
  if (
    lower.includes('timeout') ||
    lower.includes('not found') ||
    lower.includes('unavailable') ||
    lower.includes('invalid') ||
    lower.includes('required')
  ) {
    return 'yellow';
  }
  return 'red';
}

export function getEPArgs(tool: string): Record<string, unknown> | null {
  if (tool.endsWith('_feed')) return { timeframe: 'one-week' };

  const byName: Record<string, Record<string, unknown> | null> = {
    get_mep_details: { id: SAMPLE_MEP_ID },
    get_procedure_events: { processId: SAMPLE_PROCEDURE_ID },
    get_procedure_event_by_id: { processId: SAMPLE_PROCEDURE_ID, eventId: '1' },
    track_legislation: { procedureId: SAMPLE_PROCEDURE_ID },
    get_meeting_activities: null,
    get_meeting_decisions: null,
    get_meeting_foreseen_activities: null,
    get_meeting_plenary_session_documents: null,
    get_meeting_plenary_session_document_items: null,
    analyze_committee_activity: { committeeId: 'ENVI' },
    analyze_country_delegation: { country: 'DE' },
    analyze_voting_patterns: { mepId: SAMPLE_MEP_ID },
    assess_mep_influence: { mepId: SAMPLE_MEP_ID },
    comparative_intelligence: { mepIds: [124810, 197443] },
    compare_political_groups: { groupIds: ['EPP', 'S&D'] },
    correlate_intelligence: { mepIds: [SAMPLE_MEP_ID] },
    analyze_legislative_effectiveness: { subjectType: 'COMMITTEE', subjectId: 'ENVI' },
    detect_voting_anomalies: { groupId: 'EPP' },
    track_mep_attendance: { country: 'DE' },
    generate_report: { reportType: 'VOTING_STATISTICS' },
    analyze_coalition_dynamics: { groupIds: ['EPP', 'S&D'] },
    search_documents: { keyword: 'climate', limit: 1 },
  };

  if (Object.prototype.hasOwnProperty.call(byName, tool)) {
    const entry = byName[tool];
    if (entry === null) return null;
    return entry ?? { limit: 1 };
  }

  return { limit: 1 };
}

export function getWBArgs(tool: string): Record<string, unknown> {
  switch (tool) {
    case 'search-indicators':
      return { keyword: 'health' };
    case 'get-countries':
      return {};
    case 'get-country-info':
      return { countryCode: 'DE' };
    case 'get-economic-data':
      return { countryCode: 'DE', indicator: 'GDP', years: 1 };
    case 'get-social-data':
      return { countryCode: 'DE', indicator: 'POPULATION', years: 1 };
    case 'get-education-data':
      return { countryCode: 'DE', indicator: 'SCHOOL_ENROLLMENT', years: 1 };
    case 'get-health-data':
      return { countryCode: 'DE', indicator: 'HEALTH_EXPENDITURE', years: 1 };
    default:
      return {};
  }
}

async function probeEPTool(
  client: EuropeanParliamentMCPClient,
  tool: string
): Promise<MCPToolResult> {
  const args = getEPArgs(tool);
  if (args === null) {
    return {
      content: [
        {
          type: 'text',
          text: '{"status":"unavailable","reason":"requires contextual sittingId"}',
        },
      ],
    };
  }
  return client.callTool(tool, args);
}

async function probeIMFTool(client: IMFMCPClient, tool: string): Promise<MCPToolResult> {
  switch (tool) {
    case 'imf-list-databases':
      return client.listDatabases();
    case 'imf-search-databases':
      return client.searchDatabases('weo');
    case 'imf-get-parameter-defs':
      return client.getParameterDefs('WEO');
    case 'imf-get-parameter-codes':
      return client.getParameterCodes('WEO', 'COUNTRY', 'DEU');
    case 'imf-fetch-data':
      return client.fetchData({
        databaseId: 'WEO',
        startYear: 2024,
        endYear: 2024,
        filters: {
          COUNTRY: ['DEU'],
          INDICATOR: ['NGDP_RPCH'],
          FREQUENCY: ['A'],
        },
      });
    default:
      return { content: [{ type: 'text', text: '' }], isError: true };
  }
}

async function probeWBTool(client: WorldBankMCPClient, tool: string): Promise<MCPToolResult> {
  return client.callTool(tool, getWBArgs(tool));
}

async function runProbe(): Promise<ProbeReport> {
  const results: ProbeResult[] = [];

  const epClient = await getEPMCPClient();
  const imfClient = await getIMFMCPClient();
  const wbClient = await getWBMCPClient();

  const probeOne = async (
    server: ProbeResult['server'],
    tool: string,
    invoker: () => Promise<MCPToolResult>
  ): Promise<void> => {
    const startedAt = Date.now();
    try {
      const result = await callWithTimeoutRetry(
        invoker,
        TOOL_TIMEOUT_MS,
        TOOL_TIMEOUT_RETRIES,
        tool
      );
      const message = redactSecrets(result.content?.[0]?.text ?? 'ok').slice(0, 240);
      results.push({
        server,
        tool,
        severity: classifyProbeResult(result),
        durationMs: Date.now() - startedAt,
        message,
      });
    } catch (error) {
      const message = redactSecrets(error instanceof Error ? error.message : String(error));
      results.push({
        server,
        tool,
        severity: classifyProbeError(message),
        durationMs: Date.now() - startedAt,
        message: message.slice(0, 240),
      });
    }
  };

  for (const tool of EP_MCP_TOOLS) {
    await probeOne('ep', tool, () => probeEPTool(epClient, tool));
  }
  for (const tool of IMF_MCP_TOOLS) {
    await probeOne('imf', tool, () => probeIMFTool(imfClient, tool));
  }
  for (const tool of WORLD_BANK_MCP_TOOLS) {
    await probeOne('world-bank', tool, () => probeWBTool(wbClient, tool));
  }

  await closeEPMCPClient();
  await closeIMFMCPClient();
  await closeWBMCPClient();

  const summary = {
    total: results.length,
    green: results.filter((r) => r.severity === 'green').length,
    yellow: results.filter((r) => r.severity === 'yellow').length,
    red: results.filter((r) => r.severity === 'red').length,
  };

  return {
    generatedAt: new Date().toISOString(),
    timeoutMs: TOOL_TIMEOUT_MS,
    timeoutRetries: TOOL_TIMEOUT_RETRIES,
    summary,
    results,
  };
}

/**
 * Render a compact console matrix with emoji health markers.
 *
 * @param report - Probe report
 * @returns Human-readable text output
 */
export function renderHealthMatrix(report: ProbeReport): string {
  const lines = ['MCP Reliability Probe'];
  for (const item of report.results) {
    const icon = item.severity === 'green' ? '🟢' : item.severity === 'yellow' ? '🟡' : '🔴';
    lines.push(`${icon} [${item.server}] ${item.tool} (${String(item.durationMs)}ms)`);
  }
  lines.push(
    `Summary: total=${String(report.summary.total)} green=${String(report.summary.green)} yellow=${String(report.summary.yellow)} red=${String(report.summary.red)}`
  );
  return lines.join('\n');
}

/* c8 ignore start */
async function main(): Promise<void> {
  const report = await runProbe();
  const jsonOnly = process.argv.includes('--json-only');
  if (!jsonOnly) {
    console.log(renderHealthMatrix(report));
  }
  console.log(formatProbeReport(report));
  if (process.argv.includes('--strict') && report.summary.red > 0) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => {
    const message = redactSecrets(error instanceof Error ? error.message : String(error));
    console.error(`MCP probe failed: ${message}`);
    process.exitCode = 1;
  });
}
/* c8 ignore stop */
