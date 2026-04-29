// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/infra/github-urls — repo slug, blob/raw/tree
 * URL builders, and POSIX-path normalisation. Verifies that the centralised
 * helpers match the historic hard-coded URLs they replaced.
 */

import { describe, it, expect } from 'vitest';
import {
  REPO_SLUG,
  REPO_BRANCH,
  blobUrl,
  rawUrl,
  treeUrl,
} from '../../scripts/aggregator/infra/github-urls.js';
import {
  githubBlobUrl,
  githubRawUrl,
} from '../../scripts/aggregator/clean-artifact.js';

describe('infra/github-urls — constants', () => {
  it('exports the canonical repo slug', () => {
    expect(REPO_SLUG).toBe('Hack23/euparliamentmonitor');
  });

  it('exports the canonical default branch', () => {
    expect(REPO_BRANCH).toBe('main');
  });
});

describe('infra/github-urls — blobUrl', () => {
  it('builds a blob URL for a POSIX path', () => {
    expect(blobUrl('analysis/daily/2026-01-15/breaking/manifest.json')).toBe(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-01-15/breaking/manifest.json'
    );
  });

  it('normalises Windows-style separators to POSIX', () => {
    expect(blobUrl('analysis\\daily\\2026-01-15\\breaking\\manifest.json')).toBe(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-01-15/breaking/manifest.json'
    );
  });

  it('handles a single-segment path', () => {
    expect(blobUrl('README.md')).toBe(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/README.md'
    );
  });

  it('matches the historic githubBlobUrl shim byte-for-byte', () => {
    const path = 'analysis/templates/synthesis-summary.md';
    expect(blobUrl(path)).toBe(githubBlobUrl(path));
  });
});

describe('infra/github-urls — rawUrl', () => {
  it('builds a raw.githubusercontent URL', () => {
    expect(rawUrl('docs/architecture.png')).toBe(
      'https://raw.githubusercontent.com/Hack23/euparliamentmonitor/main/docs/architecture.png'
    );
  });

  it('normalises backslashes to forward slashes', () => {
    expect(rawUrl('a\\b\\c.png')).toBe(
      'https://raw.githubusercontent.com/Hack23/euparliamentmonitor/main/a/b/c.png'
    );
  });

  it('matches the historic githubRawUrl shim byte-for-byte', () => {
    const path = 'images/euparliamentmonitor-logo.png';
    expect(rawUrl(path)).toBe(githubRawUrl(path));
  });
});

describe('infra/github-urls — treeUrl', () => {
  it('builds a tree URL for a directory path', () => {
    expect(treeUrl('analysis/daily/2026-01-15/breaking')).toBe(
      'https://github.com/Hack23/euparliamentmonitor/tree/main/analysis/daily/2026-01-15/breaking'
    );
  });

  it('normalises Windows-style separators', () => {
    expect(treeUrl('analysis\\daily\\2026-01-15')).toBe(
      'https://github.com/Hack23/euparliamentmonitor/tree/main/analysis/daily/2026-01-15'
    );
  });
});
