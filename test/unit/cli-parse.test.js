// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/cli — non-exiting CLI parser. Verifies
 * every flag form, every error path, and the `--help` / `-h` short-circuit
 * without spying on `process.exit`.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import {
  parseCliArgsSafe,
  HELP_TEXT,
} from '../../scripts/aggregator/cli/index.js';

const REPO_ROOT = path.resolve('.');
const FIXTURE_RUN = path.resolve('test/fixtures/analysis/2026-01-15/breaking-run-test');

describe('parseCliArgsSafe — kind:"options" happy paths', () => {
  it('accepts --run with a space-separated value', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN], REPO_ROOT);
    expect(r.kind).toBe('options');
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.runDir).toBe(FIXTURE_RUN);
    expect(r.value.all).toBe(false);
  });

  it('accepts --run=PATH inline-style', () => {
    const r = parseCliArgsSafe([`--run=${FIXTURE_RUN}`], REPO_ROOT);
    expect(r.kind).toBe('options');
  });

  it('accepts the --analysis-dir alias', () => {
    const r = parseCliArgsSafe(['--analysis-dir', FIXTURE_RUN], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.runDir).toBe(FIXTURE_RUN);
  });

  it('accepts --all without --run', () => {
    const r = parseCliArgsSafe(['--all'], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.all).toBe(true);
    expect(r.value.runDir).toBeNull();
  });

  it('always renders all 14 languages — langs scope is no longer configurable from the CLI', () => {
    // --lang / --language flags were removed in the always-14-languages
    // contract. The parser populates `langs` with all supported languages
    // unconditionally.
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.langs.length).toBeGreaterThanOrEqual(14);
  });

  it('always emits HTML — markdownOnly is not configurable from the CLI', () => {
    // --markdown-only was removed in the always-HTML contract. The parser
    // forces `markdownOnly: false` unconditionally.
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.markdownOnly).toBe(false);
  });

  it('honours --since', () => {
    const r = parseCliArgsSafe(['--all', '--since', '2026-04-01'], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.since).toBe('2026-04-01');
  });

  it('honours --title and --description', () => {
    const r = parseCliArgsSafe(
      ['--run', FIXTURE_RUN, '--title', 'Headline', '--description', 'Lede'],
      REPO_ROOT
    );
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.title).toBe('Headline');
    expect(r.value.description).toBe('Lede');
  });

  it('honours the --output alias for --out-dir', () => {
    const r = parseCliArgsSafe(['--all', '--output', '/tmp/news'], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.outDir).toBe(path.resolve('/tmp/news'));
  });

  it('defaults langs to ALL_LANGUAGES when no language flags are passed', () => {
    const r = parseCliArgsSafe(['--all'], REPO_ROOT);
    if (r.kind !== 'options') throw new Error('not options');
    expect(r.value.langs.length).toBeGreaterThanOrEqual(14);
  });
});

describe('parseCliArgsSafe — kind:"help"', () => {
  it('returns kind:"help" for --help', () => {
    const r = parseCliArgsSafe(['--help'], REPO_ROOT);
    expect(r.kind).toBe('help');
  });

  it('returns kind:"help" for -h shorthand', () => {
    const r = parseCliArgsSafe(['-h'], REPO_ROOT);
    expect(r.kind).toBe('help');
  });

  it('short-circuits even when other flags follow --help', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN, '--help'], REPO_ROOT);
    expect(r.kind).toBe('help');
  });

  it('exposes HELP_TEXT as a non-empty string with all documented aliases', () => {
    expect(typeof HELP_TEXT).toBe('string');
    expect(HELP_TEXT.length).toBeGreaterThan(50);
    expect(HELP_TEXT).toMatch(/--run, --analysis-dir/);
    expect(HELP_TEXT).toMatch(/--out-dir, --output/);
    expect(HELP_TEXT).toMatch(/--all/);
    // The always-14-languages-always-HTML contract is documented in HELP_TEXT.
    expect(HELP_TEXT).toMatch(/all 14/);
  });

  it('does NOT advertise the removed --lang / --markdown-only flags', () => {
    expect(HELP_TEXT).not.toMatch(/--lang/);
    expect(HELP_TEXT).not.toMatch(/--language/);
    expect(HELP_TEXT).not.toMatch(/--markdown-only/);
  });
});

describe('parseCliArgsSafe — kind:"error"', () => {
  it('errors when neither --run nor --all is provided', () => {
    const r = parseCliArgsSafe([], REPO_ROOT);
    expect(r.kind).toBe('error');
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/--run .* or --all/);
  });

  it('errors when --run path does not exist', () => {
    const r = parseCliArgsSafe(['--run', '/does/not/exist/123'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/does not exist/);
  });

  it('errors on unknown flags', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN, '--wat'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/Unknown argument: --wat/);
  });

  it('rejects the removed --lang flag with a clear migration message', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN, '--lang', 'sv'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/--lang has been removed/);
    expect(r.message).toMatch(/all 14 languages/);
  });

  it('rejects the removed --language alias with a clear migration message', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN, '--language', 'de'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/--language has been removed/);
  });

  it('rejects the removed --markdown-only flag with a clear migration message', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN, '--markdown-only'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/--markdown-only has been removed/);
  });

  it('errors on malformed --since date', () => {
    const r = parseCliArgsSafe(['--all', '--since', 'not-a-date'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/--since expects/);
  });

  it('errors when a value-bearing flag has no value', () => {
    const r = parseCliArgsSafe(['--run'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/Missing value for --run/);
  });

  it('errors when --title is provided without a value', () => {
    const r = parseCliArgsSafe(['--run', FIXTURE_RUN, '--title'], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/Missing value for --title/);
  });

  it('errors when an inline `--flag=` form has an empty value', () => {
    // Empty inline values (e.g. `--run=`) must be rejected just like the
    // space-separated missing-value case — otherwise an empty string
    // resolves to surprising defaults (e.g. `path.resolve('')` →
    // `process.cwd()`).
    const r = parseCliArgsSafe(['--run='], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/Missing value for --run/);
  });

  it('errors on empty inline value for --since=', () => {
    const r = parseCliArgsSafe(['--all', '--since='], REPO_ROOT);
    if (r.kind !== 'error') throw new Error('not error');
    expect(r.message).toMatch(/Missing value for --since/);
  });

  it('does not call process.exit on --help (testable without spy)', () => {
    // The whole point of parseCliArgsSafe: we can call it without
    // shadowing process.exit and the test process keeps running.
    const r = parseCliArgsSafe(['--help'], REPO_ROOT);
    expect(r.kind).toBe('help');
  });
});
