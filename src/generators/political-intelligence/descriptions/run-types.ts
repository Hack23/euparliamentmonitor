// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Descriptions/RunTypes
 * @description Canonical run-type slugs (breaking, week-in-review, motions,
 * …), their aliases (e.g. `weekly-review` → `week-in-review`), and the
 * lookup helpers `parseRunSlug` and `getRunTypeInfo`. Also hosts the
 * `canonicalizeArtifactStem` helper used by `getArtifactInfo` to normalize
 * raw filename stems under `analysis/daily/**` to their canonical template
 * names.
 *
 * Split out of the monolithic `political-intelligence-descriptions.ts`
 * (Refactor 8/8). Data tables live in `run-types-titles.ts` and
 * `run-types-descriptions.ts`.
 */

import type { LanguageCode } from '../../../types/index.js';
import { getFromRecord, stripEmojiAndPunct } from './fallback.js';
import { RUN_TYPE_TITLES } from './run-types-titles.js';
import { RUN_TYPE_DESCRIPTIONS } from './run-types-descriptions.js';

const RUN_TYPE_SLUGS = [
  /* eslint-disable sonarjs/no-duplicate-string --
     Slug literals legitimately repeat across the SLUGS array, ALIASES
     record, and SYNONYMS table — they identify the same canonical
     run-type and extracting a shared constant would obscure that. */
  'breaking',
  'week-in-review',
  'weekly-review',
  'month-in-review',
  'monthly-review',
  'quarter-in-review',
  'week-ahead',
  'month-ahead',
  'quarter-ahead',
  'year-ahead',
  'year-in-review',
  'term-outlook',
  'election-cycle',
  'committee-reports',
  'committee',
  'motions',
  'propositions',
  'translate',
  'deep',
] as const;

type RunTypeSlug = (typeof RUN_TYPE_SLUGS)[number];

/** Canonical run-type slugs mapped from aliases. */
const RUN_TYPE_ALIASES: Readonly<Record<RunTypeSlug, RunTypeSlug>> = {
  breaking: 'breaking',
  'week-in-review': 'week-in-review',
  'weekly-review': 'week-in-review',
  'month-in-review': 'month-in-review',
  'monthly-review': 'month-in-review',
  'quarter-in-review': 'quarter-in-review',
  'week-ahead': 'week-ahead',
  'month-ahead': 'month-ahead',
  'quarter-ahead': 'quarter-ahead',
  'year-ahead': 'year-ahead',
  'year-in-review': 'year-in-review',
  'term-outlook': 'term-outlook',
  'election-cycle': 'election-cycle',
  'committee-reports': 'committee-reports',
  committee: 'committee-reports',
  motions: 'motions',
  propositions: 'propositions',
  translate: 'translate',
  deep: 'deep',
};

/**
 * Parse a run slug such as `breaking-run192`, `week-in-review-run45` or
 * `committee-reports-run07` into its canonical run-type slug (e.g.
 * `breaking`, `week-in-review`, `committee-reports`) plus the run index
 * (e.g. `192`, `45`, `07`). When the slug doesn't match any known prefix
 * the caller receives `type: null` and the raw slug as `runId`.
 *
 * @param slug - Run directory slug
 * @returns Object with the canonical type (or `null`) and run-id tail
 */
export function parseRunSlug(slug: string): { type: RunTypeSlug | null; runId: string } {
  const lower = slug.toLowerCase();
  const sorted = [...RUN_TYPE_SLUGS].sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (lower === prefix || lower.startsWith(`${prefix}-`) || lower.startsWith(`${prefix}_`)) {
      const canonical = RUN_TYPE_ALIASES[prefix];
      const tail = slug.slice(prefix.length).replace(/^[-_]+/, '');
      return { type: canonical, runId: tail };
    }
  }
  return { type: null, runId: slug };
}

/**
 * Resolve a localized title + description for a daily analysis run.
 *
 * @param slug - Run directory slug (e.g. `breaking-run192`)
 * @param lang - Target language code
 * @returns `{ title, description, runId }` — `title` is always non-empty
 *   (falls back to a humanized slug when no run-type prefix matches);
 *   `description` may be an empty string for unknown run-type slugs or
 *   when the descriptions table has no entry for a recognized type.
 *   `runId` is the run-index tail (`'192'`) or the raw slug when no
 *   run-type prefix matched.
 */
export function getRunTypeInfo(
  slug: string,
  lang: LanguageCode
): { title: string; description: string; runId: string } {
  const { type, runId } = parseRunSlug(slug);
  if (type) {
    const titleRecord = RUN_TYPE_TITLES[type];

    const descRecord = RUN_TYPE_DESCRIPTIONS[type];
    const title = titleRecord ? getFromRecord(titleRecord, lang) : stripEmojiAndPunct(slug);
    const description = descRecord ? getFromRecord(descRecord, lang) : '';
    return { title, description, runId };
  }
  return { title: stripEmojiAndPunct(slug), description: '', runId };
}

/**
 * Normalize an artifact stem by stripping well-known suffixes and mapping
 * synonyms to a canonical template name. Keeps the `getArtifactInfo`
 * lookup table small while still covering every variant we observe under
 * `analysis/daily/**`.
 *
 * Stripped suffixes:
 *   - `.analysis` (e.g. `political-landscape.analysis.md` → `political-landscape`)
 *   - trailing `-analysis`, `-assessment`, `-context`, `-deep-dive`,
 *     `-brief`, `-intelligence` when the stripped stem has a curated template
 *
 * Synonyms (non-exhaustive — extend as new stems appear):
 *   - `coalition-analysis` / `coalition-intelligence` / `coalition-sentiment-analysis`
 *       → `coalition-dynamics`
 *   - `threat-landscape` / `political-threat-landscape` / `coalition-threat-assessment`
 *       → `threat-analysis`
 *   - `ai-<x>` / `political-<x>` → `<x>` when `<x>` has a template
 *   - `actor-threat-profile` → `actor-threat-profiles`
 *
 * @param stem - Raw filename stem (extension already stripped)
 * @returns Canonical template stem to feed into the curated tables
 */
export function canonicalizeArtifactStem(stem: string): string {
  const s = stem.replace(/\.analysis$/, '');

  const SYNONYMS: Record<string, string> = {
    'coalition-analysis': 'coalition-dynamics',
    'coalition-intelligence': 'coalition-dynamics',
    'coalition-sentiment-analysis': 'coalition-dynamics',
    'coalition-threat-assessment': 'threat-analysis',
    'coalition-dynamics-assessment': 'coalition-dynamics',
    'threat-landscape': 'threat-analysis',
    'threat-landscape-analysis': 'threat-analysis',
    'political-threat-landscape': 'threat-analysis',
    'threat-assessment': 'threat-analysis',
    'political-risk-assessment': 'risk-assessment',
    'formal-risk-assessment': 'risk-assessment',
    'political-risk-matrix': 'risk-matrix',
    'political-stride-assessment': 'threat-model',
    'political-swot-analysis': 'swot-analysis',
    'political-landscape': 'intelligence-assessment',
    'political-landscape-analysis': 'intelligence-assessment',
    'political-landscape-assessment': 'intelligence-assessment',
    'political-landscape-context': 'intelligence-assessment',
    'actor-threat-profile': 'actor-threat-profiles',
    'actor-threat-profiling': 'actor-threat-profiles',
    'stakeholder-analysis': 'stakeholder-impact',
    'stakeholder-impact-assessment': 'stakeholder-impact',
    'significance-assessment': 'significance-scoring',
    'committee-power-analysis': 'intelligence-assessment',
    'legislative-pipeline-analysis': 'legislative-velocity-risk',
    'legislative-productivity-analysis': 'legislative-velocity-risk',
    'recent-legislation-review': 'historical-baseline',
    'trade-policy-assessment': 'pestle-analysis',
    'trade-policy-deep-dive': 'deep-analysis',
    'anti-corruption-reform-intelligence': 'intelligence-assessment',
    'early-warning-deep-dive': 'wildcards-blackswans',
    'recess-pattern-analysis': 'historical-baseline',
    'strategic-recess-assessment': 'scenario-forecast',
    'post-recess-preparedness': 'scenario-forecast',
    'pre-restart-intelligence-brief': 'executive-brief',
    'breaking-news-analysis': 'executive-brief',
    'breaking-intelligence-brief': 'executive-brief',
    'weekly-intelligence-brief': 'executive-brief',
    'intelligence-brief': 'executive-brief',
    'cross-daily-synthesis': 'synthesis-summary',
    'cross-session-intelligence': 'cross-session-intelligence',
    'document-analysis-index': 'analysis-index',
    'attack-surface-map': 'threat-model',
    'api-outage-diagnostic': 'mcp-reliability-audit',
    'api-reliability-assessment': 'mcp-reliability-audit',
    'agent-risk-workflow': 'workflow-audit',
    forces: 'forces-analysis',
    voting: 'voting-patterns',
    'ai-actor-mapping': 'actor-mapping',
    'ai-coalition-dynamics': 'coalition-dynamics',
    'ai-cross-session-intelligence': 'cross-session-intelligence',
    'ai-deep-analysis': 'deep-analysis',
    'ai-political-landscape': 'intelligence-assessment',
    'ai-risk-assessment': 'risk-assessment',
    'ai-significance-scoring': 'significance-scoring',
    'ai-stakeholder-impact': 'stakeholder-impact',
    'ai-swot-analysis': 'swot-analysis',
    'ai-threat-assessment': 'threat-analysis',
    'ai-voting-patterns': 'voting-patterns',
  };
  if (Object.prototype.hasOwnProperty.call(SYNONYMS, s)) {
    const synonym = SYNONYMS[s];
    if (typeof synonym === 'string') return synonym;
  }
  return s;
}
