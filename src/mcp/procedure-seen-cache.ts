// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ProcedureSeenCache
 * @description Persistent cache of `(procedureId, dateLastActivity)` pairs that
 * enables incremental fresh-procedure discovery without re-paginating the entire
 * EP `/procedures` corpus on every run.
 *
 * The cache is stored as a JSON file (default: `data/procedure-seen-cache.json`).
 * It is written only when at least one entry has changed (`dirty` flag), so reads
 * that find nothing new are effectively zero-cost.
 *
 * Background: the EP `/procedures/feed` endpoint's `timeframe` filter regressed
 * on or around 2026-04-19 and began returning historical-tail pagination instead
 * of date-sorted newest-first records. The workaround routes discovery through
 * `get_procedures(limit=100)` with client-side date filtering; this cache allows
 * subsequent runs to detect new and updated entries incrementally.
 *
 * @see {@link ../mcp/ep-mcp-client.ts EuropeanParliamentMCPClient.getFreshProcedures}
 */

import fs from 'fs';
import path from 'path';

/** Default path for the cache file, relative to the repository root */
export const DEFAULT_PROCEDURE_SEEN_CACHE_PATH = path.join('data', 'procedure-seen-cache.json');

/** A single entry in the cache file */
interface ProcedureCacheEntry {
  /** ISO date (`YYYY-MM-DD`) of the most recent activity, or empty string */
  dateLastActivity: string;
  /** ISO timestamp of when this entry was last written */
  seenAt: string;
}

/** Shape of the persisted JSON file */
interface ProcedureCacheFile {
  version: 1;
  /** ISO timestamp of the last write */
  updatedAt: string;
  /** Keyed by procedure ID (e.g. `"2026-0042"`) */
  entries: Record<string, ProcedureCacheEntry>;
}

/**
 * Read/write cache for EP procedure `dateLastActivity` values.
 *
 * Usage:
 * ```typescript
 * const cache = new ProcedureSeenCache();
 * const newIds = cache.getNewOrUpdatedIds(freshItems);
 * for (const item of freshItems) {
 *   cache.upsert(item.id, item.dateLastActivity);
 * }
 * cache.save();
 * ```
 */
export class ProcedureSeenCache {
  private readonly storePath: string;
  private readonly entries: Map<string, ProcedureCacheEntry>;
  private dirty = false;

  /**
   * Create a new cache instance, loading any previously-persisted data from disk.
   *
   * @param storePath - Path to the JSON cache file. Defaults to
   *   `data/procedure-seen-cache.json` (relative to cwd). Override for test isolation.
   */
  constructor(storePath?: string) {
    this.storePath = storePath ?? DEFAULT_PROCEDURE_SEEN_CACHE_PATH;
    this.entries = this._load();
  }

  /**
   * Load existing cache from disk. Returns an empty Map when the file does not
   * exist or is malformed.
   *
   * @returns Map of procedure ID → cache entry
   */
  private _load(): Map<string, ProcedureCacheEntry> {
    if (!fs.existsSync(this.storePath)) {
      return new Map<string, ProcedureCacheEntry>();
    }
    try {
      const raw = fs.readFileSync(this.storePath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        (parsed as Record<string, unknown>)['version'] !== 1
      ) {
        return new Map<string, ProcedureCacheEntry>();
      }
      const file = parsed as ProcedureCacheFile;
      const map = new Map<string, ProcedureCacheEntry>();
      for (const [id, entry] of Object.entries(file.entries ?? {})) {
        const entryObj = entry as unknown as Record<string, unknown>;
        if (
          entryObj !== null &&
          typeof entryObj === 'object' &&
          typeof entryObj['dateLastActivity'] === 'string' &&
          typeof entryObj['seenAt'] === 'string'
        ) {
          map.set(id, entry);
        }
      }
      return map;
    } catch {
      return new Map<string, ProcedureCacheEntry>();
    }
  }

  /**
   * Upsert a procedure entry. Marks the cache dirty only when the
   * `dateLastActivity` value has changed (new ID or updated activity date).
   *
   * @param procedureId - Procedure identifier (e.g. `"2026-0042"`)
   * @param dateLastActivity - ISO date string or empty string
   */
  upsert(procedureId: string, dateLastActivity: string): void {
    const existing = this.entries.get(procedureId);
    if (existing?.dateLastActivity === dateLastActivity) return;
    this.entries.set(procedureId, {
      dateLastActivity,
      seenAt: new Date().toISOString(),
    });
    this.dirty = true;
  }

  /**
   * Return the last-seen `dateLastActivity` for a procedure, or `undefined`
   * when the procedure has not been seen before.
   *
   * @param procedureId - Procedure identifier
   * @returns ISO date string or `undefined`
   */
  getDateLastActivity(procedureId: string): string | undefined {
    return this.entries.get(procedureId)?.dateLastActivity;
  }

  /**
   * Whether the cache contains an entry for the given procedure ID.
   *
   * @param procedureId - Procedure identifier
   * @returns `true` when the procedure ID is known
   */
  has(procedureId: string): boolean {
    return this.entries.has(procedureId);
  }

  /**
   * Filter a list of candidate procedures to those that are new or whose
   * `dateLastActivity` has changed since the last run.
   *
   * @param items - Candidate procedures
   * @returns IDs of procedures that are new or have an updated activity date
   */
  getNewOrUpdatedIds(
    items: ReadonlyArray<{ readonly id: string; readonly dateLastActivity: string }>
  ): readonly string[] {
    return items
      .filter((item) => this.entries.get(item.id)?.dateLastActivity !== item.dateLastActivity)
      .map((item) => item.id);
  }

  /**
   * Persist the cache to disk. No-op when nothing has changed since the last
   * save (or load).
   *
   * Creates the parent directory if it does not exist.
   */
  save(): void {
    if (!this.dirty) return;
    const dir = path.dirname(this.storePath);
    if (dir.length > 0 && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const file: ProcedureCacheFile = {
      version: 1,
      updatedAt: new Date().toISOString(),
      entries: Object.fromEntries(this.entries),
    };
    fs.writeFileSync(this.storePath, JSON.stringify(file, null, 2), 'utf-8');
    this.dirty = false;
  }

  /**
   * Number of procedure IDs currently held in the cache.
   *
   * @returns Entry count
   */
  size(): number {
    return this.entries.size;
  }
}
