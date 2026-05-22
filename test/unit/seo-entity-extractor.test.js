// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  extractStakeholderNames,
  extractMediaOutletNames,
  extractRunMentions,
} from '../../scripts/aggregator/seo-entity-extractor.js';

describe('seo-entity-extractor', () => {
  describe('extractStakeholderNames', () => {
    it('extracts names from H3 headings split on em-dash', () => {
      const md = [
        '## Top Stakeholders',
        '',
        '### EPP — Manfred Weber / 185 MEPs (25.73%)',
        '',
        '### European Commission — Ursula von der Leyen (EPP)',
        '',
        '### S&D — Iratxe García Pérez / 135 MEPs',
        '',
      ].join('\n');
      const names = extractStakeholderNames(md);
      expect(names).toEqual(['EPP', 'European Commission', 'S&D']);
    });

    it('filters out risk-scenario headings', () => {
      const md = [
        '### Risk 1: PfE Internal Split — high impact',
        '### Risk 2: Coalition fracture',
        '### EPP — Manfred Weber',
      ].join('\n');
      const names = extractStakeholderNames(md);
      expect(names).toEqual(['EPP']);
    });

    it('deduplicates case-insensitively while preserving first-seen casing', () => {
      const md = [
        '### EPP — first occurrence',
        '### epp — second occurrence',
        '### EPP / variant',
      ].join('\n');
      expect(extractStakeholderNames(md)).toEqual(['EPP']);
    });

    it('returns empty array for markdown with no H3 headings', () => {
      expect(extractStakeholderNames('## Just an H2\n\nSome prose.')).toEqual([]);
    });
  });

  describe('extractMediaOutletNames', () => {
    it('extracts comma-separated outlets from `**…Media (X, Y, Z):**` lines', () => {
      const md = [
        '**Centre-Left Media (Le Monde, Der Spiegel, Guardian EU section):** framing',
        '**Tech-Beat Media (TechCrunch EU, The Verge, Politico Tech):** angle',
      ].join('\n');
      const names = extractMediaOutletNames(md);
      expect(names).toEqual([
        'Le Monde',
        'Der Spiegel',
        'Guardian EU section',
        'TechCrunch EU',
        'The Verge',
        'Politico Tech',
      ]);
    });

    it('ignores lines without `Media (` anchor', () => {
      const md = [
        '**Political groups (EPP, S&D):** unrelated parenthetical',
        '**Centre-Left Media (Le Monde):** ok',
      ].join('\n');
      expect(extractMediaOutletNames(md)).toEqual(['Le Monde']);
    });

    it('deduplicates outlets across multiple framing buckets', () => {
      const md = [
        '**Centre-Left Media (Le Monde, Guardian):** a',
        '**Liberal Media (Guardian, Reuters):** b',
      ].join('\n');
      expect(extractMediaOutletNames(md)).toEqual(['Le Monde', 'Guardian', 'Reuters']);
    });
  });

  describe('extractRunMentions', () => {
    let tmpRoot;

    beforeAll(() => {
      tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-mentions-'));
    });

    afterAll(() => {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    });

    function makeRun(name, files) {
      const runDir = path.join(tmpRoot, name);
      for (const [rel, content] of Object.entries(files)) {
        const abs = path.join(runDir, rel);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, content, 'utf8');
      }
      return runDir;
    }

    it('combines stakeholder + media outlets, dedupes, and caps at 30', () => {
      const stakeholders = [
        '## Top Stakeholders',
        '### EPP — Manfred Weber',
        '### European Commission — Ursula von der Leyen',
      ].join('\n');
      const media = '**Centre-Left Media (Le Monde, Der Spiegel):** framing';
      const runDir = makeRun('combined', {
        'intelligence/stakeholder-map.md': stakeholders,
        'extended/media-framing-analysis.md': media,
      });
      const mentions = extractRunMentions(runDir);
      expect(mentions).toEqual(['EPP', 'European Commission', 'Le Monde', 'Der Spiegel']);
    });

    it('returns empty list when neither file exists', () => {
      const runDir = makeRun('empty', {});
      expect(extractRunMentions(runDir)).toEqual([]);
    });

    it('caps mention count at 30 entries', () => {
      const headings = [];
      for (let i = 0; i < 50; i++) {
        headings.push(`### Stakeholder ${i} — description`);
      }
      const runDir = makeRun('capped', {
        'intelligence/stakeholder-map.md': headings.join('\n'),
      });
      const mentions = extractRunMentions(runDir);
      expect(mentions.length).toBe(30);
      expect(mentions[0]).toBe('Stakeholder 0');
    });
  });
});
