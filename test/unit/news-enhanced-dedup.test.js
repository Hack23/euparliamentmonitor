// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { computeDedupSuffix } from '../../scripts/generators/news-enhanced.js';

describe('news-enhanced dedup suffix', () => {
  it('should preserve numeric run-scoped suffixes', () => {
    expect(computeDedupSuffix(['breaking'], 'breaking-run6')).toBe('-run6');
    expect(computeDedupSuffix(['breaking'], 'breaking-run6-2')).toBe('-run6-2');
  });

  it('should preserve custom alphanumeric run ids with hyphens', () => {
    expect(computeDedupSuffix(['breaking'], 'breaking-runabc-1')).toBe('-runabc-1');
    expect(computeDedupSuffix(['breaking'], 'breaking-runrelease-candidate')).toBe(
      '-runrelease-candidate'
    );
  });

  it('should preserve custom run ids combined with dedup suffixes', () => {
    expect(computeDedupSuffix(['breaking'], 'breaking-runabc-1-a1b2c3d4')).toBe(
      '-runabc-1-a1b2c3d4'
    );
  });

  it('should reject invalid suffix patterns', () => {
    expect(computeDedupSuffix(['breaking'], 'breaking/../runabc')).toBe('');
    expect(computeDedupSuffix(['breaking'], 'committee-reports-runabc-1')).toBe('');
  });
});
