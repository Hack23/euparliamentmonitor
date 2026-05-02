// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Direct cli() unit tests for forward-statements-registry.js.
 *
 * These tests call cli() in-process so that v8 coverage instruments the cli
 * function body (lines 484-559) — spawnSync-based tests run in a child
 * process and are invisible to v8's coverage collector.
 *
 * Rather than mocking the module exports (which cannot intercept same-module
 * ESM closure calls), we mock the underlying fs operations so the real
 * appendEntries / readEntries / updateEntry / buildSummary functions run
 * in-process without touching the filesystem.
 *
 * process.exit is replaced with a throwing stub so the test runner does not
 * exit mid-suite.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import { cli } from '../../scripts/aggregator/forward-statements-registry.js';

// ─── helper: run cli in-process, capture I/O ────────────────────────────────

function runCli(args) {
  const stdoutChunks = [];
  const stderrChunks = [];
  let exitCode = null;

  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
    exitCode = code ?? 0;
    throw Object.assign(new Error(`process.exit(${code ?? 0})`), { exitCode: code ?? 0 });
  });
  const outSpy = vi.spyOn(process.stdout, 'write').mockImplementation((s) => {
    stdoutChunks.push(String(s));
    return true;
  });
  const errSpy = vi.spyOn(process.stderr, 'write').mockImplementation((s) => {
    stderrChunks.push(String(s));
    return true;
  });

  try {
    cli(args);
    if (exitCode === null) exitCode = 0;
  } catch (e) {
    if (e.exitCode !== undefined) {
      exitCode = e.exitCode;
    } else {
      throw e;
    }
  } finally {
    exitSpy.mockRestore();
    outSpy.mockRestore();
    errSpy.mockRestore();
  }

  return {
    exitCode,
    stdout: stdoutChunks.join(''),
    stderr: stderrChunks.join(''),
  };
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('forward-statements-registry cli() – in-process branch coverage', () => {
  // ── help / no command ──────────────────────────────────────────────────────

  describe('help / no-command path', () => {
    it('prints usage and exits 0 for --help', () => {
      const r = runCli(['--help']);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('Usage:');
      expect(r.stdout).toContain('Commands:');
    });

    it('prints usage and exits 0 for -h', () => {
      const r = runCli(['-h']);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('Usage:');
    });

    it('prints usage and exits 0 when no args given', () => {
      const r = runCli([]);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('Usage:');
    });
  });

  // ── append ─────────────────────────────────────────────────────────────────

  describe('append command', () => {
    let mkdirSpy;
    let writeSpy;

    // A fully-valid entry that passes appendEntries validation
    const VALID_ENTRY = {
      topic: 'Test topic',
      originatingDate: '2026-06-01',
      originatingRunId: 'run-2026-06-01',
      statement: 'A concrete forward statement for testing.',
      expectedHorizon: '2026-W24',
      evidenceRefs: [],
    };

    beforeEach(() => {
      // Prevent real filesystem writes (appendEntries uses appendFileSync)
      mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      writeSpy = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);
    });

    afterEach(() => {
      mkdirSpy.mockRestore();
      writeSpy.mockRestore();
    });

    it('reads from stdin (fd 0) and writes result to stdout', () => {
      const fsReadSpy = vi.spyOn(fs, 'readFileSync').mockImplementation((src) => {
        if (src === 0) return JSON.stringify([VALID_ENTRY]);
        return '';
      });

      const r = runCli(['append']);

      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('"written": 1');
      fsReadSpy.mockRestore();
    });

    it('reads from --file when flag is provided', () => {
      const fsReadSpy = vi.spyOn(fs, 'readFileSync').mockImplementation((src) => {
        if (src === '/fake/path.json') return JSON.stringify([VALID_ENTRY]);
        return JSON.stringify([]);
      });

      const r = runCli(['append', '--file', '/fake/path.json']);

      expect(fsReadSpy).toHaveBeenCalledWith('/fake/path.json', 'utf8');
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('"written": 1');
      fsReadSpy.mockRestore();
    });

    it('exits 1 when appendEntries produces validation errors (missing required fields)', () => {
      // An entry with no topic/statement/originatingRunId → validation errors → exit 1
      const fsReadSpy = vi.spyOn(fs, 'readFileSync').mockImplementation((src) => {
        if (src === 0) return JSON.stringify([{ missing: 'required_fields' }]);
        return JSON.stringify([]);
      });

      const r = runCli(['append']);

      expect(r.stdout).toContain('"written": 0');
      expect(r.exitCode).toBe(1);
      fsReadSpy.mockRestore();
    });
  });

  // ── read ───────────────────────────────────────────────────────────────────

  describe('read command', () => {
    let existsSpy;

    beforeEach(() => {
      // Make the registry dir appear empty so readEntries returns []
      existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    });

    afterEach(() => {
      existsSpy.mockRestore();
    });

    it('writes empty JSON array when registry is empty', () => {
      const r = runCli(['read']);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('[]');
    });

    it('passes --status filter (code runs)', () => {
      const r = runCli(['read', '--status', 'open']);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('[]');
    });

    it('passes --horizon-from filter (code runs)', () => {
      const r = runCli(['read', '--horizon-from', '2026-06-01']);
      expect(r.exitCode).toBe(0);
    });

    it('passes --horizon-to filter (code runs)', () => {
      const r = runCli(['read', '--horizon-to', '2026-12-31']);
      expect(r.exitCode).toBe(0);
    });

    it('passes --electoral-mode flag (code runs)', () => {
      const r = runCli(['read', '--electoral-mode']);
      expect(r.exitCode).toBe(0);
    });

    it('passes all read filters together (code runs)', () => {
      const r = runCli([
        'read',
        '--status', 'open',
        '--horizon-from', '2026-06-01',
        '--horizon-to', '2026-12-31',
        '--electoral-mode',
      ]);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('[]');
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update command', () => {
    let existsSpy;

    beforeEach(() => {
      // Empty registry → updateEntry will return { updated: false }
      existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    });

    afterEach(() => {
      existsSpy.mockRestore();
    });

    it('exits 1 when updateEntry finds no matching entry (empty registry)', () => {
      const r = runCli(['update', '--id', 'entry-1', '--status', 'resolved']);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain('"updated"');
    });

    it('passes optional --evidence and --date to updateEntry', () => {
      const r = runCli([
        'update',
        '--id', 'entry-1',
        '--status', 'resolved',
        '--evidence', 'A-10-2026-0099',
        '--date', '2026-06-01',
      ]);
      // No matching entry in empty registry → exit 1
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain('"updated"');
    });

    it('exits 2 and prints error when --id is missing', () => {
      const r = runCli(['update', '--status', 'resolved']);
      expect(r.exitCode).toBe(2);
      expect(r.stderr).toContain('update requires --id and --status');
    });

    it('exits 2 and prints error when --status is missing', () => {
      const r = runCli(['update', '--id', 'entry-1']);
      expect(r.exitCode).toBe(2);
      expect(r.stderr).toContain('update requires --id and --status');
    });
  });

  // ── update with matching entry ─────────────────────────────────────────────

  describe('update command with a matching entry in registry', () => {
    let existsSpy;
    let readdirSpy;
    let readSpy;
    let mkdirSpy;
    let writeSpy;

    beforeEach(() => {
      const entry = JSON.stringify({
        id: 'fsr-2026-001',
        topic: 'Test topic',
        status: 'open',
        originatingDate: '2026-01-01',
        originatingRunId: 'run-2026-01-01',
        statement: 'A test forward statement.',
        expectedHorizon: '2026-W24',
        evidenceRefs: [],
      });
      existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      readdirSpy = vi.spyOn(fs, 'readdirSync').mockReturnValue(['shard-2026.jsonl']);
      readSpy = vi.spyOn(fs, 'readFileSync').mockReturnValue(entry + '\n');
      mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      writeSpy = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);
    });

    afterEach(() => {
      existsSpy.mockRestore();
      readdirSpy.mockRestore();
      readSpy.mockRestore();
      mkdirSpy.mockRestore();
      writeSpy.mockRestore();
    });

    it('exits 0 when update succeeds', () => {
      const r = runCli(['update', '--id', 'fsr-2026-001', '--status', 'resolved']);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('"updated": true');
    });
  });

  // ── summary ────────────────────────────────────────────────────────────────

  describe('summary command', () => {
    let existsSpy;

    beforeEach(() => {
      existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    });

    afterEach(() => {
      existsSpy.mockRestore();
    });

    it('calls buildSummary and writes result to stdout', () => {
      const r = runCli(['summary']);
      expect(r.exitCode).toBe(0);
      expect(r.stdout).toContain('Forward-Statements Registry Summary');
    });
  });

  // ── unknown command ────────────────────────────────────────────────────────

  describe('unknown command', () => {
    it('exits 2 and writes error message for unknown command', () => {
      const r = runCli(['foobar']);
      expect(r.exitCode).toBe(2);
      expect(r.stderr).toContain('Unknown command: foobar');
    });
  });
});
