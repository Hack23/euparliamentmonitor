// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ForwardStatementsRegistry
 * @description Append-mostly JSONL registry for tracking forward-looking
 * statements produced by week-ahead and month-ahead analysis runs. Each row
 * records a single statement with its originating run, expected horizon, and
 * current status. Subsequent week-ahead / month-ahead Stage A reads open items
 * to seed synthesis.
 *
 * Schema per row:
 *   {
 *     id:                  string  — UUID v4 (crypto.randomUUID())
 *     topic:               string  — Short topic slug (e.g. "banking-union", "ai-act")
 *     originatingRunId:    string  — RUN_ID from the originating workflow
 *     originatingDate:     string  — YYYY-MM-DD
 *     statement:           string  — The forward-looking statement text
 *     expectedHorizon:     string  — YYYY-MM-DD or ISO week (e.g. "2026-W18")
 *     status:              "open" | "implemented" | "superseded" | "abandoned"
 *     lastObservedDate:    string  — YYYY-MM-DD of last run that touched this entry
 *     evidenceRefs:        string[] — EP document IDs or procedure IDs supporting the claim
 *   }
 *
 * File layout:
 *   analysis/forward-statements/<YYYY-MM>.jsonl   (one file per calendar month)
 *   analysis/forward-statements/README.md         (schema + lifecycle docs — static)
 *
 * The monthly sharding keeps individual files small (typical plenary generates
 * ~5–10 statements per week). Read operations scan every extant JSONL shard,
 * with optional result filtering by status, horizonFrom, and horizonTo.
 *
 * Invocation:
 *   node scripts/aggregator/forward-statements-registry.js --help
 *   node scripts/aggregator/forward-statements-registry.js append  <json-file-or-stdin>
 *   node scripts/aggregator/forward-statements-registry.js read    [--status open] [--horizon-from YYYY-MM-DD] [--horizon-to YYYY-MM-DD]
 *   node scripts/aggregator/forward-statements-registry.js update  --id <id> --status <status> [--evidence <ref>] [--date <YYYY-MM-DD>]
 *   node scripts/aggregator/forward-statements-registry.js summary
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REGISTRY_DIR = path.resolve(process.cwd(), 'analysis/forward-statements');
const VALID_STATUSES = /** @type {const} */ (['open', 'implemented', 'superseded', 'abandoned']);

// ---------------------------------------------------------------------------
// Public helpers (exported for Vitest)
// ---------------------------------------------------------------------------

/**
 * Compute the JSONL shard path for a given YYYY-MM-DD date string.
 *
 * @param {string} dateStr - YYYY-MM-DD date string
 * @param {string} [registryDir] - Override registry directory (used in tests)
 * @returns {string} Absolute path to the shard file
 */
export function shardPath(dateStr, registryDir) {
  const month = dateStr.slice(0, 7); // "YYYY-MM"
  return path.join(registryDir ?? REGISTRY_DIR, `${month}.jsonl`);
}

/**
 * Parse a single JSONL line into a forward-statement entry. Returns `null`
 * when the line is blank or cannot be parsed (corrupt shard lines are skipped
 * rather than throwing so a single bad row does not crash the read operation).
 *
 * @param {string} line - Raw JSONL line
 * @returns {Record<string, unknown> | null}
 */
export function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

/**
 * Generate a new UUID v4 string using the Node.js `crypto` module.
 *
 * @returns {string} UUID v4
 */
export function newId() {
  return crypto.randomUUID();
}

/**
 * Return true only when a string is a valid calendar date in YYYY-MM-DD form.
 *
 * @param {unknown} value - Candidate date value
 * @returns {boolean} True for valid calendar dates
 */
export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Return true only when a string is a valid ISO week reference (`YYYY-Www`).
 *
 * @param {unknown} value - Candidate ISO week value
 * @returns {boolean} True for ISO week 1–53
 */
export function isValidIsoWeekString(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!match) return false;
  const week = Number(match[2]);
  return week >= 1 && week <= 53;
}

/**
 * Validate a candidate forward-statement entry object, returning a list of
 * validation error strings. An empty array means the entry is valid.
 *
 * @param {unknown} entry - Candidate entry
 * @returns {string[]} Validation errors (empty when valid)
 */
export function validateEntry(entry) {
  const errors = [];
  if (!entry || typeof entry !== 'object') {
    return ['Entry must be a non-null object'];
  }
  const e = /** @type {Record<string, unknown>} */ (entry);

  if (typeof e.topic !== 'string' || !e.topic.trim()) errors.push('topic is required');
  if (typeof e.originatingRunId !== 'string' || !e.originatingRunId.trim())
    errors.push('originatingRunId is required');
  if (!isValidDateString(e.originatingDate))
    errors.push('originatingDate must be YYYY-MM-DD');
  if (typeof e.statement !== 'string' || !e.statement.trim())
    errors.push('statement is required');
  if (
    typeof e.expectedHorizon !== 'string' ||
    (!isValidDateString(e.expectedHorizon) && !isValidIsoWeekString(e.expectedHorizon))
  )
    errors.push('expectedHorizon must be a valid YYYY-MM-DD date or ISO week YYYY-Www');
  if (!VALID_STATUSES.includes(/** @type {never} */ (e.status)))
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  if (!Array.isArray(e.evidenceRefs)) errors.push('evidenceRefs must be an array');

  return errors;
}

/**
 * Append one or more forward-statement entries to the appropriate monthly
 * JSONL shards.  Each entry receives a generated `id` and
 * `lastObservedDate` (set to `originatingDate`) if not already present.
 *
 * @param {unknown[]} entries - Candidate entries to append
 * @param {string} [registryDir] - Override registry directory (used in tests)
 * @returns {{ written: number; errors: string[] }} Summary
 */
export function appendEntries(entries, registryDir) {
  const dir = registryDir ?? REGISTRY_DIR;
  fs.mkdirSync(dir, { recursive: true });

  let written = 0;
  const errors = [];

  for (const raw of entries) {
    const entry = /** @type {Record<string, unknown>} */ (
      raw && typeof raw === 'object' ? { .../** @type {object} */ (raw) } : {}
    );

    // Fill in generated fields
    if (!entry.id || typeof entry.id !== 'string') entry.id = newId();
    if (!entry.status) entry.status = 'open';
    if (!Array.isArray(entry.evidenceRefs)) entry.evidenceRefs = [];
    if (!entry.lastObservedDate) entry.lastObservedDate = entry.originatingDate;

    const errs = validateEntry(entry);
    if (errs.length > 0) {
      errors.push(`Entry "${entry.topic ?? '(no topic)'}" invalid: ${errs.join('; ')}`);
      continue;
    }

    const shard = shardPath(/** @type {string} */ (entry.originatingDate), dir);
    fs.appendFileSync(shard, JSON.stringify(entry) + '\n', 'utf8');
    written += 1;
  }

  return { written, errors };
}

/**
 * Read all forward-statement entries from every JSONL shard, with optional
 * filters.
 *
 * @param {object} [opts] - Filter options
 * @param {string} [opts.status] - Filter by status (e.g. "open")
 * @param {string} [opts.horizonFrom] - ISO date; entries with expectedHorizon < this are excluded
 * @param {string} [opts.horizonTo] - ISO date; entries with expectedHorizon > this are excluded
 * @param {string} [opts.registryDir] - Override registry directory (used in tests)
 * @returns {Record<string, unknown>[]} All matching entries
 */
export function readEntries(opts) {
  const dir = opts?.registryDir ?? REGISTRY_DIR;
  if (!fs.existsSync(dir)) return [];

  const shards = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .sort();

  const results = [];
  for (const shard of shards) {
    const content = fs.readFileSync(path.join(dir, shard), 'utf8');
    for (const line of content.split('\n')) {
      const entry = parseLine(line);
      if (!entry) continue;
      if (opts?.status && entry.status !== opts.status) continue;

      let horizon;
      if ((opts?.horizonFrom || opts?.horizonTo) && typeof entry.expectedHorizon === 'string') {
        try {
          // Normalise ISO week to YYYY-MM-DD (first day of week) for comparison.
          horizon = normaliseHorizon(entry.expectedHorizon);
        } catch (error) {
          process.stderr.write(
            `Skipping forward-statement entry with invalid expectedHorizon "${entry.expectedHorizon}" ` +
            `in shard "${shard}": ${error instanceof Error ? error.message : String(error)}\n`,
          );
          continue;
        }
      }

      if (opts?.horizonFrom && typeof horizon === 'string' && horizon < opts.horizonFrom) continue;
      if (opts?.horizonTo && typeof horizon === 'string' && horizon > opts.horizonTo) continue;
      results.push(entry);
    }
  }
  return results;
}

/**
 * Update an existing entry's status, lastObservedDate, and optionally append
 * an evidence reference. The update is written as a new JSONL line in the
 * **current month's** shard (append-mostly pattern — old lines are kept for
 * audit trail; readers use the last occurrence of each `id`).
 *
 * @param {object} opts - Update options
 * @param {string} opts.id - ID of the entry to update
 * @param {string} opts.status - New status
 * @param {string} [opts.evidence] - Evidence reference to append
 * @param {string} [opts.date] - lastObservedDate (defaults to today UTC)
 * @param {string} [opts.registryDir] - Override registry directory (used in tests)
 * @returns {{ updated: boolean; reason?: string }} Result
 */
export function updateEntry(opts) {
  const dir = opts?.registryDir ?? REGISTRY_DIR;

  if (!VALID_STATUSES.includes(/** @type {never} */ (opts.status))) {
    return { updated: false, reason: `Invalid status: ${opts.status}` };
  }

  // Find the latest version of the entry
  const all = readEntries({ registryDir: dir });
  // Build a map keyed by id — last occurrence wins (append-mostly semantics)
  const byId = new Map();
  for (const e of all) {
    if (typeof e.id === 'string') byId.set(e.id, e);
  }

  const existing = byId.get(opts.id);
  if (!existing) {
    return { updated: false, reason: `No entry found with id=${opts.id}` };
  }

  const today = opts.date ?? new Date().toISOString().slice(0, 10);
  const existingRefs = Array.isArray(existing.evidenceRefs) ? existing.evidenceRefs : [];
  const updatedRefs = opts.evidence
    ? Array.from(new Set([...existingRefs, opts.evidence]))
    : [...existingRefs];
  const updated = {
    ...existing,
    status: opts.status,
    lastObservedDate: today,
    evidenceRefs: updatedRefs,
  };

  fs.mkdirSync(dir, { recursive: true });
  const shard = shardPath(today, dir);
  fs.appendFileSync(shard, JSON.stringify(updated) + '\n', 'utf8');
  return { updated: true };
}

/**
 * Produce a human-readable summary string of all entries, grouped by status.
 * Useful for Stage A manifests and `--summary` CLI.
 *
 * @param {string} [registryDir] - Override registry directory (used in tests)
 * @returns {string} Formatted summary
 */
export function buildSummary(registryDir) {
  const all = readEntries({ registryDir });
  const byStatus = {};
  for (const status of VALID_STATUSES) {
    byStatus[status] = all.filter((e) => e.status === status).length;
  }

  const lines = [
    `## Forward-Statements Registry Summary`,
    `Total entries: ${all.length}`,
    ...VALID_STATUSES.map((s) => `  ${s}: ${byStatus[s]}`),
  ];
  return lines.join('\n');
}

/**
 * Generate an array of EP plenary sitting IDs for consecutive session days.
 * The format is `MTG-PL-YYYY-MM-DD` — the canonical sitting ID pattern used
 * by the EP MCP `get_meeting_foreseen_activities` endpoint.
 *
 * @param {string} startDateStr - YYYY-MM-DD date of the first session day
 * @param {number} numDays - Number of consecutive session days (typically 4 for Strasbourg, 2 for Brussels mini)
 * @returns {string[]} Array of sitting IDs
 */
export function generateSessionDayIds(startDateStr, numDays) {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const startMs = Date.UTC(year, month - 1, day);
  const ids = [];
  for (let i = 0; i < numDays; i++) {
    const ms = startMs + i * 24 * 60 * 60 * 1000;
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    ids.push(`MTG-PL-${y}-${m}-${dd}`);
  }
  return ids;
}

/**
 * Return `true` when the given date string falls on a Monday (UTC).
 * Used to determine whether the Monday urgency motion sweep should run.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
export function isMondayRun(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 1;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalise an ISO week string (`YYYY-Www`) to its Monday date as `YYYY-MM-DD`
 * for lexicographic horizon comparisons. Valid `YYYY-MM-DD` dates pass through
 * unchanged.
 *
 * @param {string} horizon - expectedHorizon value
 * @returns {string} YYYY-MM-DD date string
 * @throws {Error} When the horizon is not a valid `YYYY-MM-DD` date or ISO week
 */
export function normaliseHorizon(horizon) {
  if (isValidDateString(horizon)) return horizon;
  if (/^\d{4}-\d{2}-\d{2}$/.test(horizon)) {
    throw new Error(`Invalid calendar date in expectedHorizon: "${horizon}"`);
  }

  const isoWeek = /^(\d{4})-W(\d{2})$/.exec(horizon);
  if (!isoWeek) {
    throw new Error(`expectedHorizon must be YYYY-MM-DD or YYYY-Www: "${horizon}"`);
  }
  const year = Number(isoWeek[1]);
  const week = Number(isoWeek[2]);
  if (week < 1 || week > 53) {
    throw new Error(`Invalid ISO week number: ${week} in "${horizon}" (must be 1–53)`);
  }
  // ISO week 1 starts on the Monday of the week containing Jan 4.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4);
  // Move back to the Monday of the Jan-4 week, then forward by (week - 1) weeks.
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (week - 1) * 7);
  return monday.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

/**
 * Parse and dispatch CLI sub-commands.
 *
 * @param {string[]} argv - `process.argv` (slice from index 2 for args)
 */
export function cli(argv) {
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    process.stdout.write(
      [
        'Usage: node scripts/aggregator/forward-statements-registry.js <command> [options]',
        '',
        'Commands:',
        '  append  [--file <path>]  Append entries from a JSON array file (or stdin)',
        '  read    [--status open|implemented|superseded|abandoned]',
        '          [--horizon-from YYYY-MM-DD] [--horizon-to YYYY-MM-DD]',
        '                           Read and print matching entries as JSON array',
        '  update  --id <id> --status <status> [--evidence <ref>] [--date YYYY-MM-DD]',
        '                           Update an existing entry',
        '  summary                  Print status counts',
        '',
      ].join('\n'),
    );
    process.exit(0);
  }

  if (cmd === 'append') {
    const fileFlag = rest.indexOf('--file');
    let rawJson;
    if (fileFlag !== -1 && rest[fileFlag + 1]) {
      rawJson = fs.readFileSync(rest[fileFlag + 1], 'utf8');
    } else {
      rawJson = fs.readFileSync('/dev/stdin', 'utf8');
    }
    const entries = JSON.parse(rawJson);
    const result = appendEntries(Array.isArray(entries) ? entries : [entries]);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (result.errors.length > 0) process.exit(1);
    return;
  }

  if (cmd === 'read') {
    const statusFlag = rest.indexOf('--status');
    const fromFlag = rest.indexOf('--horizon-from');
    const toFlag = rest.indexOf('--horizon-to');
    const opts = {};
    if (statusFlag !== -1 && rest[statusFlag + 1]) opts.status = rest[statusFlag + 1];
    if (fromFlag !== -1 && rest[fromFlag + 1]) opts.horizonFrom = rest[fromFlag + 1];
    if (toFlag !== -1 && rest[toFlag + 1]) opts.horizonTo = rest[toFlag + 1];
    process.stdout.write(JSON.stringify(readEntries(opts), null, 2) + '\n');
    return;
  }

  if (cmd === 'update') {
    const parseFlag = (flag) => {
      const idx = rest.indexOf(flag);
      return idx !== -1 ? rest[idx + 1] : undefined;
    };
    const id = parseFlag('--id');
    const status = parseFlag('--status');
    const evidence = parseFlag('--evidence');
    const date = parseFlag('--date');
    if (!id || !status) {
      process.stderr.write('update requires --id and --status\n');
      process.exit(2);
    }
    const result = updateEntry({ id, status, evidence, date });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (!result.updated) process.exit(1);
    return;
  }

  if (cmd === 'summary') {
    process.stdout.write(buildSummary() + '\n');
    return;
  }

  process.stderr.write(`Unknown command: ${cmd}\n`);
  process.exit(2);
}

// Run CLI when invoked directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith('forward-statements-registry.js') ||
    process.argv[1].endsWith('forward-statements-registry'))
) {
  cli(process.argv.slice(2));
}
