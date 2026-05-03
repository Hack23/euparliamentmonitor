// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `src/aggregator/lead-extractor` — the deterministic
 * executive-lead synthesiser.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  MAX_LEAD_CHARS,
  extractExecutiveLead,
  extractLeadParagraph,
  trimToLeadSentence,
} from '../../scripts/aggregator/lead-extractor.js';

describe('extractLeadParagraph', () => {
  it('prefers the first paragraph under "## BLUF"', () => {
    const md = [
      '# Executive Brief',
      '## Background',
      'Background paragraph that should be ignored.',
      '## BLUF',
      'Trade defence is now operative across the Union.',
    ].join('\n');
    expect(extractLeadParagraph(md)).toBe(
      'Trade defence is now operative across the Union.'
    );
  });

  it('falls back to the first paragraph anywhere in the body', () => {
    const md = [
      '# Title',
      '## Narrative',
      'A standalone narrative paragraph that anchors the lead.',
    ].join('\n');
    expect(extractLeadParagraph(md)).toBe(
      'A standalone narrative paragraph that anchors the lead.'
    );
  });

  it('skips bullets when looking for paragraph prose', () => {
    const md = [
      '## BLUF',
      '- bullet only',
      'Real paragraph after the bullets.',
    ].join('\n');
    expect(extractLeadParagraph(md)).toBe('Real paragraph after the bullets.');
  });

  it('ignores fenced code blocks', () => {
    const md = [
      '## BLUF',
      '```',
      'Inside code',
      '```',
      'Outside code paragraph.',
    ].join('\n');
    expect(extractLeadParagraph(md)).toBe('Outside code paragraph.');
  });
});

describe('trimToLeadSentence', () => {
  it('returns the first sentence', () => {
    expect(trimToLeadSentence('First sentence. Second sentence.')).toBe(
      'First sentence.'
    );
  });

  it('truncates with an ellipsis when over the cap', () => {
    const long = 'word '.repeat(200).trim();
    const out = trimToLeadSentence(long);
    expect(out.length).toBeLessThanOrEqual(MAX_LEAD_CHARS);
    expect(out.endsWith('…')).toBe(true);
  });

  it('returns "" for empty input', () => {
    expect(trimToLeadSentence('')).toBe('');
    expect(trimToLeadSentence('   ')).toBe('');
  });
});

describe('extractExecutiveLead', () => {
  it('reads from executive-brief.md when it exists', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-lead-'));
    try {
      fs.writeFileSync(
        path.join(tmp, 'executive-brief.md'),
        '## BLUF\nThe top finding here is decisive.'
      );
      expect(extractExecutiveLead(tmp)).toBe('The top finding here is decisive.');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('falls back to synthesis-summary.md when exec brief is absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-lead-'));
    try {
      fs.mkdirSync(path.join(tmp, 'intelligence'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'intelligence', 'synthesis-summary.md'),
        '## Top Findings\nThis is the synthesis lead.'
      );
      expect(extractExecutiveLead(tmp)).toBe('This is the synthesis lead.');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('returns "" when no canonical source is present', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-lead-'));
    try {
      expect(extractExecutiveLead(tmp)).toBe('');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
