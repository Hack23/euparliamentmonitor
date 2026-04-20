// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ParseAnalysisStakeholders
 * @description Parser that lifts AI-authored stakeholder content from analysis
 * markdown files into the structured {@link StakeholderPerspective} /
 * {@link StakeholderOutcomeMatrix} / {@link DeepAnalysis.impactAssessment}
 * contracts consumed by the article builders.
 *
 * This closes the orphan-file gap documented in the Analysis-to-Article Data
 * Contract (see `.github/prompts/SHARED_PROMPT_PATTERNS.md`): rich analysis
 * markdown produced by intelligence-operative agents was previously loaded
 * into `LoadedAnalysisContext` for an "Insights" prose panel but never routed
 * into the `DeepAnalysis` object rendered by
 * {@link module:Generators/DeepAnalysisContent.buildDeepAnalysisSection}.
 *
 * Sources consumed (first match wins, later sources overlay):
 * - `intelligence/stakeholder-map.md` (`## Actor N: NAME` sections)
 * - `existing/stakeholder-impact.md` (`## Stakeholder N: NAME` sections)
 * - `synthesis/stakeholder-impact.md` (alternate location)
 * - `classification/impact-matrix.md` (outcome matrix scoring tables)
 * - `synthesis-summary.md` / `deep-analysis.md` (`## Impact Assessment` blocks)
 *
 * All parsers degrade gracefully: unparseable, empty, or placeholder-bearing
 * sources return `null`, and callers fall back to the default template
 * builders.  No exceptions propagate from this module.
 */

import type {
  StakeholderPerspective,
  StakeholderOutcomeMatrix,
  AnalysisStakeholderType,
  DeepAnalysis,
} from '../types/index.js';
import { ALL_STAKEHOLDER_TYPES } from '../types/index.js';
import type { LoadedAnalysisContext } from '../generators/strategies/article-strategy.js';
import type { AnalysisOverrides } from '../generators/builders/shared-builders.js';

/** Minimum word count for an AI-authored stakeholder perspective to be accepted. */
const MIN_PERSPECTIVE_WORDS = 40;

/** Minimum word count for an AI-authored impact-assessment dimension to be accepted. */
const MIN_IMPACT_WORDS = 25;

/**
 * Canonical stakeholder keyword map.
 *
 * Maps free-text actor names in analysis markdown (EPP Group, USTR, ACEA, etc.)
 * to one of the six canonical `AnalysisStakeholderType` buckets.  Keywords are
 * compared case-insensitively as substrings.  First match wins; order matters.
 *
 * Adding a keyword: pick the most specific bucket the actor belongs to when
 * assessed through the EP's institutional lens (e.g. Bundesrat → national
 * government, not eu_institutions, because it is a member state body).
 */
const STAKEHOLDER_KEYWORDS: ReadonlyArray<
  readonly [AnalysisStakeholderType, readonly string[]]
> = [
  [
    'political_groups',
    [
      'epp group',
      's&d group',
      'renew europe',
      'greens/efa',
      'the left',
      'ecr group',
      'ecr-pfe',
      'patriots for europe',
      'pfe',
      'identity and democracy',
      'political group',
      'political groups',
      'parliamentary group',
      'grand centre',
      'grand coalition',
      'opposition bloc',
    ],
  ],
  [
    'eu_institutions',
    [
      'european commission',
      'von der leyen commission',
      ' commission',
      'council of the eu',
      'european council',
      'council presidency',
      ' council',
      'coreper',
      'european central bank',
      ' ecb',
      'srb',
      'court of justice',
      ' cjeu',
      'european court',
      'european parliament',
      'eu institutions',
      'institutional',
      'european external action service',
      ' eeas',
    ],
  ],
  [
    'national_govts',
    [
      'national government',
      'national governments',
      'member state',
      'member states',
      'candidate countries',
      'candidate country',
      'bundesrat',
      'bundestag',
      'polish presidency',
      'ustr',
      'us government',
      'united states government',
      'chinese government',
      'state department',
      'ministry of commerce',
      'capital',
      'berlin',
      'paris',
      'warsaw',
      'madrid',
      'rome',
      'kyiv',
      'third country',
      'third-country',
      'diplomatic',
    ],
  ],
  [
    'industry',
    [
      'industrial associations',
      'business europe',
      'businesseurope',
      'industry',
      'industries',
      'business',
      'acea',
      'asd',
      'ert',
      'banking sector',
      'banking industry',
      'landesbanken',
      'banks',
      'digital industry',
      'tech industry',
      'automotive',
      'construction sector',
      'defence industry',
      'export industries',
      'financial industry',
      'trade bodies',
      'chambers of commerce',
      'employers',
    ],
  ],
  [
    'civil_society',
    [
      'civil society',
      'ngo',
      'ngos',
      'advocacy',
      'think tank',
      'think-tank',
      'feantsa',
      'housing europe',
      'etuc',
      'trade union',
      'trade unions',
      'watchdog',
      'transparency international',
      'foundation',
      'church',
      'academic',
      'universities',
    ],
  ],
  [
    'citizens',
    [
      'eu citizens',
      'european citizens',
      'citizens',
      'voters',
      'public opinion',
      'electorate',
      'consumers',
      'households',
      'eu residents',
      'european public',
    ],
  ],
];

/**
 * Classify a free-text actor name into one of the six canonical stakeholder buckets.
 *
 * @param actorName - Human-readable actor name from analysis markdown (e.g. "EPP Group")
 * @returns Canonical stakeholder type, or `null` when no keyword matches.
 */
export function classifyStakeholder(actorName: string): AnalysisStakeholderType | null {
  const needle = ` ${actorName.toLowerCase()} `;
  for (const [type, keywords] of STAKEHOLDER_KEYWORDS) {
    for (const kw of keywords) {
      if (needle.includes(kw)) return type;
    }
  }
  return null;
}

/**
 * Extract actor/stakeholder sections from a markdown file body.
 *
 * Accepts either heading form used by the reference analyses:
 * - `## Actor N: NAME` (intelligence/stakeholder-map.md)
 * - `## Stakeholder N: NAME` (existing/stakeholder-impact.md)
 *
 * @param content - Raw markdown file content (frontmatter optional)
 * @returns Array of (actorName, sectionProse) pairs in document order.
 */
function extractActorSections(content: string): ReadonlyArray<{
  readonly name: string;
  readonly body: string;
}> {
  const sections: Array<{ name: string; body: string }> = [];
  const headingRe = /^##\s+(?:Actor|Stakeholder)\s+\d+\s*[:：]\s*(.+?)\s*$/gimu;
  const matches: Array<{ name: string; start: number; end: number }> = [];
  let m: RegExpExecArray | null = headingRe.exec(content);
  while (m !== null) {
    matches.push({
      name: m[1]?.trim() ?? '',
      start: m.index + m[0].length,
      end: content.length,
    });
    m = headingRe.exec(content);
  }
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    if (!cur) continue;
    const end = next ? next.start - next.name.length - 10 : content.length;
    // Body terminates at next `## ` heading or EOF
    const body = content.slice(cur.start, end);
    const nextHdr = body.search(/^##\s+/mu);
    const trimmed = nextHdr >= 0 ? body.slice(0, nextHdr) : body;
    sections.push({ name: cur.name, body: trimmed.trim() });
  }
  return sections;
}

/** Extract a compact summary from an actor section body, stripping markdown noise. */
function summarizeSection(body: string, maxWords: number): string {
  // Strip fenced code blocks and html comments
  let clean = body.replace(/```[\s\S]*?```/gu, '');
  clean = clean.replace(/<!--[\s\S]*?-->/gu, '');
  // Drop bullet lines with trailing colons that act as sub-headings like `**Role:** ...`
  // but keep their content by collapsing `**Label:** value` to just `value` after the colon.
  clean = clean.replace(/^\s*\*\*[^*]+:\*\*\s*/gmu, '');
  // Drop mermaid blocks (defensive — already handled by fenced-code strip)
  clean = clean.replace(/```mermaid[\s\S]*?```/gu, '');
  // Collapse markdown tables to single space (tables don't summarise well as prose)
  clean = clean.replace(/^\|.*\|$/gmu, '');
  // Replace markdown bold/italic with plain text
  clean = clean.replace(/\*\*([^*]+)\*\*/gu, '$1').replace(/\*([^*]+)\*/gu, '$1');
  // Drop empty lines, join paragraphs
  const paragraphs = clean
    .split(/\n{2,}/u)
    .map((p) => p.replace(/\s+/gu, ' ').trim())
    .filter((p) => p.length > 20 && !p.startsWith('#') && !p.startsWith('---'));
  if (paragraphs.length === 0) return '';
  const joined = paragraphs.join(' ');
  const words = joined.split(/\s+/u);
  if (words.length <= maxWords) return joined;
  return words.slice(0, maxWords).join(' ') + '…';
}

/** Derive impact direction from a section body via emoji / keyword cues. */
function deriveImpact(body: string): StakeholderPerspective['impact'] {
  const lower = body.toLowerCase();
  const hasPositive = /🟢|positive|net positive|beneficial|win|supports|advances/u.test(lower);
  const hasNegative = /🔴|negative|harm|loser|damages|threatens|adversely/u.test(lower);
  if (hasPositive && hasNegative) return 'mixed';
  if (hasPositive) return 'positive';
  if (hasNegative) return 'negative';
  if (/🟡|mixed|ambivalent|cautiously|uncertain/u.test(lower)) return 'mixed';
  return 'neutral';
}

/** Derive severity from a section body via emoji / keyword cues. */
function deriveSeverity(body: string): StakeholderPerspective['severity'] {
  const lower = body.toLowerCase();
  if (/🔴|very high|high exposure|high impact|significant|critical|transformative/u.test(lower))
    return 'high';
  if (/🟠|medium-high|moderate/u.test(lower)) return 'medium';
  if (/🟢|low exposure|limited impact|marginal|negligible/u.test(lower)) return 'low';
  return 'medium';
}

/** Choose the "better" of two candidate sections for a stakeholder bucket. */
function pickBetter(
  a: { name: string; body: string; summary: string },
  b: { name: string; body: string; summary: string }
): { name: string; body: string; summary: string } {
  return b.summary.length > a.summary.length ? b : a;
}

/**
 * Parse AI-authored stakeholder perspectives from loaded analysis context.
 *
 * Looks up the following files (first-hit order) and merges actor-level
 * sections into the canonical six-bucket StakeholderPerspective[] output:
 *
 * 1. `stakeholder-map` (intelligence/stakeholder-map.md — breaking/month-ahead convention)
 * 2. `stakeholder-analysis` (frontmatter alias for stakeholder-impact.md)
 * 3. `stakeholder-impact` (existing/stakeholder-impact.md — motions convention)
 *
 * @param ctx - Loaded analysis context from
 *   {@link module:Generators/Strategies/ArticleStrategy.loadAnalysisContext}, or `null`.
 * @returns Six-bucket perspective array, or `null` when no source file has
 *   substantive AI-authored content.  Buckets without a matching actor are
 *   omitted; callers must merge with defaults.
 */
export function parseStakeholderPerspectives(
  ctx: LoadedAnalysisContext | null | undefined
): StakeholderPerspective[] | null {
  if (!ctx) return null;
  const candidateKeys = [
    'stakeholder-map',
    'stakeholder-analysis',
    'stakeholder-impact',
  ] as const;
  // Merge actor sections across all available sources — richer content wins.
  const byBucket = new Map<
    AnalysisStakeholderType,
    { name: string; body: string; summary: string }
  >();
  let sourceCount = 0;
  for (const key of candidateKeys) {
    const file = ctx.files.get(key);
    if (!file) continue;
    const sections = extractActorSections(file.content);
    if (sections.length === 0) continue;
    sourceCount++;
    for (const sec of sections) {
      const bucket = classifyStakeholder(sec.name);
      if (!bucket) continue;
      const summary = summarizeSection(sec.body, 180);
      const wordCount = summary.split(/\s+/u).filter(Boolean).length;
      if (wordCount < MIN_PERSPECTIVE_WORDS) continue;
      const candidate = { name: sec.name, body: sec.body, summary };
      const existing = byBucket.get(bucket);
      byBucket.set(bucket, existing ? pickBetter(existing, candidate) : candidate);
    }
  }
  if (sourceCount === 0 || byBucket.size === 0) return null;

  const out: StakeholderPerspective[] = [];
  for (const bucket of ALL_STAKEHOLDER_TYPES) {
    const hit = byBucket.get(bucket);
    if (!hit) continue;
    out.push({
      stakeholder: bucket,
      impact: deriveImpact(hit.body),
      severity: deriveSeverity(hit.body),
      reasoning: hit.summary,
      evidence: [`AI-authored analysis: ${hit.name}`],
    });
  }
  return out.length > 0 ? out : null;
}

// ─── Outcome matrix parser ────────────────────────────────────────────────────

/**
 * Parse a winner/loser/neutral outcome matrix from the aggregate stakeholder
 * impact table.
 *
 * Accepts both heading conventions:
 * - `## Aggregate Stakeholder Impact Matrix` (motions/existing convention)
 * - `## Stakeholder Dynamics Matrix` (breaking/intelligence convention)
 *
 * The parser reads the rightmost "Overall" / "Net" / "Impact" column and maps
 * it to an outcome class by keyword (green/positive → winner, red/negative →
 * loser, else neutral).
 *
 * @param ctx - Loaded analysis context, or `null`.
 * @returns Single-row StakeholderOutcomeMatrix with `action` derived from
 *   the source file heading, or `null` when no table is found.
 */
export function parseStakeholderOutcomeMatrix(
  ctx: LoadedAnalysisContext | null | undefined
): StakeholderOutcomeMatrix[] | null {
  if (!ctx) return null;
  const sources: readonly string[] = [
    'stakeholder-impact',
    'stakeholder-analysis',
    'stakeholder-map',
    'impact-matrix',
  ];
  for (const key of sources) {
    const file = ctx.files.get(key);
    if (!file) continue;
    const matrix = parseAggregateMatrixTable(file.content);
    if (matrix) return [matrix];
  }
  return null;
}

/** Classify a cell value as winner / loser / neutral by keyword/emoji cues. */
function cellToOutcome(cell: string): 'winner' | 'loser' | 'neutral' {
  const lower = cell.toLowerCase();
  if (/🟢|win|positive|net positive|beneficial|strong positive/u.test(lower)) return 'winner';
  if (/🔴|lose|loser|negative|net negative|adverse|damages/u.test(lower)) return 'loser';
  return 'neutral';
}

/** Find and parse the aggregate stakeholder outcome table in analysis markdown. */
function parseAggregateMatrixTable(content: string): StakeholderOutcomeMatrix | null {
  // Locate an aggregate-table heading.
  const headingMatch =
    /^##\s+(Aggregate Stakeholder Impact Matrix|Stakeholder Dynamics Matrix|Stakeholder Impact Summary)/imu.exec(
      content
    );
  if (!headingMatch) return null;
  const afterHeading = content.slice(headingMatch.index + headingMatch[0].length);
  // Capture the first markdown table block under the heading.
  const tableMatch =
    /\|([^\n]+)\|\s*\n\|[\s:|-]+\|\s*\n((?:\|[^\n]*\|\s*\n?)+)/u.exec(afterHeading);
  if (!tableMatch) return null;
  const headerRow = tableMatch[1] ?? '';
  const bodyRows = tableMatch[2] ?? '';
  const headers = headerRow
    .split('|')
    .map((h) => h.trim().toLowerCase())
    .filter((h) => h.length > 0);
  // Prefer the "Overall" column, then "Net", then the last column.
  let valueIdx = headers.findIndex((h) => /overall|^net|net $|impact$/u.test(h));
  if (valueIdx < 0) valueIdx = headers.length - 1;
  const outcomes: Partial<Record<AnalysisStakeholderType, 'winner' | 'loser' | 'neutral'>> = {};
  for (const rawRow of bodyRows.split('\n')) {
    const row = rawRow.trim();
    if (!row.startsWith('|')) continue;
    const cells = row
      .split('|')
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);
    const label = cells[0] ?? '';
    const value = cells[valueIdx] ?? cells[cells.length - 1] ?? '';
    if (!label) continue;
    const bucket = classifyStakeholder(label);
    if (!bucket) continue;
    // Only set each bucket once (first matching row wins).
    if (outcomes[bucket] !== undefined) continue;
    outcomes[bucket] = cellToOutcome(value);
  }
  // Require coverage of at least four canonical buckets to consider the table usable.
  if (Object.keys(outcomes).length < 4) return null;
  const full: Record<AnalysisStakeholderType, 'winner' | 'loser' | 'neutral'> = {
    political_groups: outcomes.political_groups ?? 'neutral',
    civil_society: outcomes.civil_society ?? 'neutral',
    industry: outcomes.industry ?? 'neutral',
    national_govts: outcomes.national_govts ?? 'neutral',
    citizens: outcomes.citizens ?? 'neutral',
    eu_institutions: outcomes.eu_institutions ?? 'neutral',
  };
  return {
    action: 'Aggregate stakeholder outcomes (AI-authored analysis)',
    outcomes: full,
    confidence: 'medium',
  };
}

// ─── Impact assessment parser ────────────────────────────────────────────────

/** Canonical order of impact-assessment dimensions rendered in the article. */
const IMPACT_DIMENSIONS = [
  'political',
  'economic',
  'social',
  'legal',
  'geopolitical',
] as const;

type ImpactDimension = (typeof IMPACT_DIMENSIONS)[number];

/**
 * Parse the five-dimension impact assessment from `synthesis-summary.md` or
 * `deep-analysis.md`.
 *
 * Matches headings of the form:
 *   `### Political Impact` / `### Political:` / `### Political` / `**Political:**`
 * under a parent `## Impact Assessment` / `## Impact` section.
 *
 * @param ctx - Loaded analysis context, or `null`.
 * @returns Populated `impactAssessment` object, or `null` when no source yields
 *   a sufficiently detailed block.
 */
export function parseImpactAssessment(
  ctx: LoadedAnalysisContext | null | undefined
): DeepAnalysis['impactAssessment'] | null {
  if (!ctx) return null;
  const sources = ['synthesis-summary', 'deep-analysis', 'synthesis'] as const;
  for (const key of sources) {
    const file = ctx.files.get(key);
    if (!file) continue;
    const parsed = parseImpactSection(file.content);
    if (parsed) return parsed;
  }
  return null;
}

/** Locate `## Impact Assessment` (or variants) and parse its subsections. */
function parseImpactSection(content: string): DeepAnalysis['impactAssessment'] | null {
  const hdr = /^##\s+(?:Impact Assessment|Impact Analysis|Multi-?Dimensional Impact)\s*$/mu.exec(
    content
  );
  if (!hdr) return null;
  const start = hdr.index + hdr[0].length;
  const rest = content.slice(start);
  const nextHdr = rest.search(/^##\s+/mu);
  const block = nextHdr >= 0 ? rest.slice(0, nextHdr) : rest;

  const out: Partial<Record<ImpactDimension, string>> = {};
  for (const dim of IMPACT_DIMENSIONS) {
    const sub = extractDimensionBody(block, dim);
    if (!sub) continue;
    const wordCount = sub.split(/\s+/u).filter(Boolean).length;
    if (wordCount < MIN_IMPACT_WORDS) continue;
    out[dim] = sub;
  }
  // Require at least three dimensions to replace the fallback marker set.
  if (Object.keys(out).length < 3) return null;
  return {
    political: out.political ?? '',
    economic: out.economic ?? '',
    social: out.social ?? '',
    legal: out.legal ?? '',
    geopolitical: out.geopolitical ?? '',
  };
}

/**
 * Extract the prose body for one impact dimension within the `## Impact
 * Assessment` block.
 */
function extractDimensionBody(block: string, dim: ImpactDimension): string | null {
  const escaped = dim.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  // Accept either a markdown sub-heading or a bold-label line.
  const patterns: readonly RegExp[] = [
    new RegExp(`^###\\s+${escaped}(?:\\s+Impact)?\\s*:?\\s*$`, 'imu'),
    new RegExp(`^\\*\\*${escaped}(?:\\s+Impact)?\\s*:\\*\\*`, 'imu'),
    new RegExp(`^####\\s+${escaped}(?:\\s+Impact)?\\s*:?\\s*$`, 'imu'),
  ];
  for (const re of patterns) {
    const m = re.exec(block);
    if (!m) continue;
    const rest = block.slice(m.index + m[0].length);
    // Terminate at next sub-heading / bold-label of any dimension or higher-level heading.
    const endIdx = rest.search(
      /^(?:###\s+|####\s+|\*\*\w+(?:\s+Impact)?\s*:\*\*|##\s+)/mu
    );
    const body = endIdx >= 0 ? rest.slice(0, endIdx) : rest;
    const summary = summarizeSection(body, 160);
    if (summary.length > 0) return summary;
  }
  return null;
}

// ─── Validator helpers ────────────────────────────────────────────────────────

/**
 * Regex patterns that indicate a rendered article contains fallback template
 * strings from {@link module:Utils/IntelligenceAnalysis.buildDefaultStakeholderPerspectives}
 * or {@link module:Generators/Builders/SharedBuilders.buildFallbackImpactAssessment}.
 *
 * When any of these patterns appears in the `.article-content` of a generated
 * HTML article, the Analysis-to-Article contract has been bypassed and the
 * AI-authored stakeholder markdown did not flow through to the rendered page.
 *
 * Used by `src/utils/validate-analysis-completeness.ts` in `--article-html`
 * mode.
 */
export const FALLBACK_TEMPLATE_PATTERNS: readonly RegExp[] = [
  // `deriveStakeholderReasoning` / `buildDefaultStakeholderPerspectives`
  /has (?:significant|moderate|limited) implications for political group dynamics/iu,
  /face (?:significant|moderate|limited) impact on transparency, democratic participation/iu,
  /observe (?:significant|moderate|limited) regulatory implications from/iu,
  /assess (?:significant|moderate|limited) impact from ".+?" on subsidiarity/iu,
  /experience (?:significant|moderate|limited) consequences from ".+?" in terms of rights/iu,
  /show (?:significant|moderate|limited) effects from ".+?", influencing inter-institutional/iu,
  // `buildVotingAnalysis` stakeholder-topic placeholder leak
  /voting period \d{4}-\d{2}-\d{2}[–-]\d{4}-\d{2}-\d{2}/iu,
  /Voting outcomes \d{4}-\d{2}-\d{2}[–-]\d{4}-\d{2}-\d{2}/u,
  // `buildBreakingStakeholderPerspectives` topic fallback
  /EP activity \d{4}-\d{2}-\d{2}/u,
  // `AI_MARKER` leaks that made it to published HTML
  /\[AI_ANALYSIS_REQUIRED\]/u,
];

/**
 * Scan an article's HTML body for fallback template leaks.
 *
 * @param html - Rendered HTML string (full page or `.article-content` fragment)
 * @returns Array of matched fallback-template patterns (empty when clean)
 */
export function findFallbackTemplateLeaks(html: string): readonly string[] {
  const hits: string[] = [];
  for (const re of FALLBACK_TEMPLATE_PATTERNS) {
    const m = re.exec(html);
    if (m) hits.push(m[0]);
  }
  return hits;
}

// ─── One-call convenience: context → AnalysisOverrides ───────────────────────

/**
 * Derive an {@link AnalysisOverrides} bundle from a
 * {@link LoadedAnalysisContext}.
 *
 * Runs all three parsers ({@link parseStakeholderPerspectives},
 * {@link parseStakeholderOutcomeMatrix}, {@link parseImpactAssessment}) and
 * returns their combined output.  Each parser degrades independently to
 * `null` when its source markdown is absent or not parseable, so callers
 * always receive a safe-to-spread object.
 *
 * Strategies should call this in `buildContent()` and pass the result to the
 * relevant `build*Analysis()` function.  This is the single-line integration
 * point that closes the motions stakeholder-leak regression.
 *
 * @param ctx - Loaded analysis context from
 *   {@link module:Generators/Strategies/ArticleStrategy.loadAnalysisContext},
 *   or `null` when no analysis directory was found.
 * @returns Combined overrides (always non-null; individual fields are
 *   `null | undefined` when the source wasn't found).
 */
export function deriveAnalysisOverrides(
  ctx: LoadedAnalysisContext | null | undefined
): AnalysisOverrides {
  return {
    stakeholderPerspectives: parseStakeholderPerspectives(ctx) ?? undefined,
    stakeholderOutcomeMatrix: parseStakeholderOutcomeMatrix(ctx) ?? undefined,
    impactAssessment: parseImpactAssessment(ctx) ?? undefined,
  };
}
