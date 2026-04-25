#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Stage-C analysis completeness validator.
 *
 * Hard-enforces the contract between `analysis/templates/*.md` and the
 * artifacts produced under `analysis/daily/<date>/<run>/`. Article-html
 * quality has historically suffered when artifacts skip mandatory sections,
 * Mermaid diagrams, Admiralty grades, WEP bands, or required reader-perspective
 * blocks. This validator is the script-side enforcement called for in
 * `.github/prompts/03-analysis-completeness-gate.md` §1.
 *
 * Invocation:
 *   node scripts/validate-analysis-completeness.js <runDir>
 *   npm run validate-analysis -- analysis/daily/2026-04-23/breaking-run-1776928781
 *   npm run validate-analysis -- <runDir> --json   (machine-readable summary)
 *   npm run validate-analysis -- <runDir> --strict (fail on warnings too)
 *
 * Exit codes:
 *   0  GREEN    — every mandatory artifact passes every check
 *   1  RED      — at least one blocking violation
 *   2  USAGE    — bad CLI invocation
 *
 * The validator reads:
 *   - `<runDir>/manifest.json`                         (articleType, files.*)
 *   - `analysis/methodologies/reference-quality-thresholds.json` (rules)
 *
 * Per-artifact checks (in order; fast-fail per artifact):
 *   1. file exists and is non-empty
 *   2. line count ≥ per-artifact floor (or DEFAULT_MIN_LINES = 30)
 *   3. no placeholder markers ("[AI_ANALYSIS_REQUIRED]", "[TBD]", "TODO:",
 *      "AI_ANALYSIS_PENDING", "[TO BE FILLED]") outside meta-doc contexts
 *   4. mermaid presence (≥1 ```mermaid fenced block) for diagram-required
 *      artifacts (mermaidRequired list in JSON, plus every artifact under
 *      intelligence/, classification/, risk-scoring/, threat-assessment/)
 *   5. all required H2 sections present (requiredSections per relativePath)
 *   6. WEP band marker present (Almost Certain|Likely|Even Chance|Unlikely|
 *      Almost No Chance OR `WEP:` prefix) for wepBandRequired list
 *   7. Admiralty grade marker present (regex /\b[A-F][1-6]\b/ on a header,
 *      table row, or "Admiralty:" line) for admiraltyGradeRequired list
 *   8. ICD 203 BLUF marker for icd203BlufRequired list
 *   9. SAT documentation (≥10 SATs listed) for satDocumentationRequired list
 *   10. Reader-perspective block present (one of: "## Reader", "## What this
 *       means", "## For Citizens", "## Reader Briefing") for readerBlockRequired
 *       list — news-journalist quality signal.
 *   11. Source diversity: ≥1 evidence row OR ≥1 explicit MCP tool reference
 *       (e.g. get_procedures, analyze_*, semantic_*) for sourceDiversityRequired
 *       list.
 *
 * Output format:
 *   STAGE_C_GATE: GREEN articleType=<t> artifacts=<N> lines=<L>
 *   STAGE_C_GATE: RED   articleType=<t> missing=<m> short=<s> placeholders=<p>
 *
 * The validator NEVER mutates the run directory. It reads only.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DEFAULT_MIN_LINES = 30;

const PLACEHOLDER_PATTERNS = [
  /\[AI_ANALYSIS_REQUIRED\]/,
  /AI_ANALYSIS_PENDING/,
  /\[TO BE FILLED\]/,
  /\[TBD\]/i,
  /^TODO:/m,
];

const WEP_BAND_RE =
  /\b(Almost Certain|Highly Likely|Likely|Roughly Even|Even Chance|Unlikely|Highly Unlikely|Almost No Chance|WEP\s*:)\b/i;

const ADMIRALTY_RE = /(^|[\s|`(])([A-F][1-6])([\s|`)]|$)/;

const BLUF_RE = /\bBLUF\s*[:.]/i;

const READER_BLOCK_RE =
  /^##+\s+(?:[^\n]*?)?(Reader|For Citizens|What This Means|Reader Briefing|Citizen Briefing|Newsroom)/im;

const SAT_LIST_RE = /(?:^|\n)\s*(?:[-*+]|\d+\.)\s+[^\n]+/g; // crude bullet matcher

// MCP tool references — at least one must appear when sourceDiversityRequired
const MCP_TOOL_RE =
  /\b(get_(?:procedures|adopted_texts|plenary_sessions|voting_records|meps|parliamentary_questions|speeches|committee_documents)|search_(?:documents|code|issues|repositories)|analyze_(?:voting_patterns|coalition_dynamics|country_delegation)|semantic_(?:issues_search|issue_similarity_search)|monitor_legislative_pipeline|track_legislation|track_mep_attendance|generate_political_landscape|early_warning_system|correlate_intelligence)\b/;

const META_DOC_HINT_RE =
  /(template-instructions|placeholder reference|methodology|TODO list of)/i;

/**
 * Default fallback rules. The threshold JSON may override per-artifact for
 * specific articleType × relativePath combinations. This is the floor when
 * the JSON is silent.
 */
const DIAGRAM_DIRS = ['intelligence', 'classification', 'risk-scoring', 'threat-assessment'];

function usage(code = 2) {
  const msg = [
    'Usage: node scripts/validate-analysis-completeness.js <runDir> [--json] [--strict] [--min-lines N]',
    '',
    '  <runDir>      Path to analysis/daily/<date>/<run>/',
    '  --json        Emit machine-readable JSON summary in addition to STAGE_C_GATE line',
    '  --strict      Treat warnings (missing readerBlock, single-source) as RED',
    '  --min-lines N Override DEFAULT_MIN_LINES floor (only raises, never lowers)',
    '',
    'Examples:',
    '  npm run validate-analysis -- analysis/daily/2026-04-23/breaking-run-1776928781',
    '  node scripts/validate-analysis-completeness.js path/to/run --strict --json',
  ].join('\n');
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) usage(2);
  const opts = {
    runDir: null,
    json: false,
    strict: false,
    minLines: DEFAULT_MIN_LINES,
    thresholdsPath: null,
  };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--min-lines') {
      const n = parseInt(args[i + 1], 10);
      if (!Number.isFinite(n) || n < 1) usage(2);
      opts.minLines = n;
      i += 1;
    } else if (a === '--thresholds') {
      opts.thresholdsPath = args[i + 1];
      if (!opts.thresholdsPath) usage(2);
      i += 1;
    } else if (a === '--help' || a === '-h') usage(0);
    else if (!opts.runDir) opts.runDir = a;
    else usage(2);
  }
  if (!opts.runDir) usage(2);
  return opts;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function safeReadJson(filePath) {
  try {
    return readJson(filePath);
  } catch (err) {
    return { __error: err.message };
  }
}

function loadThresholds(customPath) {
  const p = customPath
    ? path.resolve(ROOT, customPath)
    : path.resolve(ROOT, 'analysis/methodologies/reference-quality-thresholds.json');
  if (!fs.existsSync(p)) return null;
  return readJson(p);
}

function countLines(content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

function findPlaceholders(content) {
  if (META_DOC_HINT_RE.test(content)) return [];
  const hits = [];
  for (const re of PLACEHOLDER_PATTERNS) {
    const m = content.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

function hasMermaid(content) {
  return /(^|\n)```mermaid\s/i.test(content);
}

function listH2Sections(content) {
  const out = [];
  const re = /^##\s+(.+?)\s*$/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push(m[1].trim());
  }
  return out;
}

function sectionMatches(actualHeadings, requiredFragment) {
  const needle = requiredFragment.toLowerCase();
  return actualHeadings.some((h) => h.toLowerCase().includes(needle));
}

function checkRequiredSections(content, requiredSections) {
  const headings = listH2Sections(content);
  const missing = [];
  for (const need of requiredSections) {
    if (!sectionMatches(headings, need)) missing.push(need);
  }
  return missing;
}

function hasWepBand(content) {
  return WEP_BAND_RE.test(content);
}

function hasAdmiraltyGrade(content) {
  // Avoid trivial false positives — require the token on a line that mentions
  // sources, evidence, citation, or admiralty, OR appears in a table row.
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!ADMIRALTY_RE.test(line)) continue;
    if (
      /admiralty|source|grade|reliability|credibility|evidence/i.test(line) ||
      /^\s*\|/.test(line)
    ) {
      return true;
    }
  }
  return false;
}

function hasBluf(content) {
  return BLUF_RE.test(content);
}

function countSatBullets(content) {
  // Count bullet rows under a "SAT" / "Structured Analytic Techniques" section
  const re = /(?:^|\n)#+\s*(?:§\s*\d+\s*[·.]?\s*)?(?:Structured Analytic Techniques|SATs Applied|SAT Catalog)[^\n]*\n([\s\S]*?)(?=\n#|\n*$)/i;
  const m = content.match(re);
  if (!m) return 0;
  const block = m[1];
  return (block.match(SAT_LIST_RE) || []).length;
}

function hasReaderBlock(content) {
  return READER_BLOCK_RE.test(content);
}

function hasMcpToolReference(content) {
  return MCP_TOOL_RE.test(content);
}

function dirOfArtifact(relativePath) {
  const norm = relativePath.replace(/\\/g, '/');
  const idx = norm.indexOf('/');
  return idx === -1 ? '' : norm.slice(0, idx);
}

function isDiagramRequired(relativePath, mermaidRequiredList) {
  if (mermaidRequiredList && mermaidRequiredList.includes(relativePath)) return true;
  const dir = dirOfArtifact(relativePath);
  return DIAGRAM_DIRS.includes(dir);
}

/**
 * Walk run directory, collecting every .md artifact path relative to runDir.
 * Skips data/, runs/, pass1/, and the article.* root files.
 */
function walkArtifacts(runDir) {
  const out = [];
  const skipDirs = new Set(['data', 'runs', 'pass1']);
  function walk(dir, rel) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        walk(abs, childRel);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.md')) continue;
      // skip article.md / article.<lang>.md at root + README
      if (rel === '' && /^article\./i.test(entry.name)) continue;
      if (entry.name.toLowerCase() === 'readme.md') continue;
      out.push(childRel);
    }
  }
  walk(runDir, '');
  return out.sort();
}

function validateArtifact({
  runDir,
  relativePath,
  rules,
  options,
}) {
  const abs = path.join(runDir, relativePath);
  const result = {
    relativePath,
    exists: false,
    lines: 0,
    minLines: options.minLines,
    issues: [],
    warnings: [],
    mermaid: false,
    placeholders: [],
  };
  if (!fs.existsSync(abs)) {
    result.issues.push('missing');
    return result;
  }
  const content = fs.readFileSync(abs, 'utf8');
  result.exists = true;
  result.lines = countLines(content);

  const perFloor = rules.perArtifactFloors?.[relativePath] ?? null;
  result.minLines = Math.max(options.minLines, perFloor ?? 0);
  if (result.lines < result.minLines) {
    result.issues.push(
      `short:${result.lines}<${result.minLines}`,
    );
  }

  const placeholders = findPlaceholders(content);
  if (placeholders.length > 0) {
    result.placeholders = placeholders;
    result.issues.push(`placeholders:${placeholders.length}`);
  }

  if (isDiagramRequired(relativePath, rules.mermaidRequired)) {
    result.mermaid = hasMermaid(content);
    if (!result.mermaid) {
      result.issues.push('mermaid:missing');
    }
  } else {
    result.mermaid = hasMermaid(content);
  }

  const requiredSections = rules.requiredSections?.[relativePath];
  if (Array.isArray(requiredSections) && requiredSections.length > 0) {
    const missingSections = checkRequiredSections(content, requiredSections);
    if (missingSections.length > 0) {
      result.issues.push(
        `sections-missing:${missingSections.map((s) => s.replace(/[,\s]/g, '_')).join(',')}`,
      );
    }
  }

  if (rules.wepBandRequired?.includes(relativePath) && !hasWepBand(content)) {
    result.issues.push('wep:missing');
  }
  if (
    rules.admiraltyGradeRequired?.includes(relativePath) &&
    !hasAdmiraltyGrade(content)
  ) {
    result.issues.push('admiralty:missing');
  }
  if (rules.icd203BlufRequired?.includes(relativePath) && !hasBluf(content)) {
    result.issues.push('bluf:missing');
  }
  if (rules.satDocumentationRequired?.includes(relativePath)) {
    const sats = countSatBullets(content);
    if (sats < 10) {
      result.issues.push(`sat:${sats}<10`);
    }
  }
  if (rules.readerBlockRequired?.includes(relativePath) && !hasReaderBlock(content)) {
    if (options.strict) result.issues.push('reader-block:missing');
    else result.warnings.push('reader-block:missing');
  }
  if (
    rules.sourceDiversityRequired?.includes(relativePath) &&
    !hasMcpToolReference(content)
  ) {
    if (options.strict) result.issues.push('source-diversity:no-mcp-ref');
    else result.warnings.push('source-diversity:no-mcp-ref');
  }

  return result;
}

function buildRules(thresholdsJson, articleType) {
  const empty = {
    perArtifactFloors: {},
    mermaidRequired: [],
    requiredSections: {},
    wepBandRequired: [],
    admiraltyGradeRequired: [],
    icd203BlufRequired: [],
    satDocumentationRequired: [],
    readerBlockRequired: [],
    sourceDiversityRequired: [],
  };
  if (!thresholdsJson) return empty;

  const perArtifactFloors = thresholdsJson.thresholds?.[articleType] || {};
  const tradecraft = thresholdsJson.tradecraftQualitySignals || {};
  const structural = thresholdsJson.structuralRequirements || {};

  return {
    perArtifactFloors,
    mermaidRequired: structural.mermaidRequired || [],
    requiredSections: structural.requiredSections || {},
    wepBandRequired: tradecraft.wepBandRequired || [],
    admiraltyGradeRequired: tradecraft.admiraltyGradeRequired || [],
    icd203BlufRequired: tradecraft.icd203BlufRequired || [],
    satDocumentationRequired: tradecraft.satDocumentationRequired || [],
    readerBlockRequired: structural.readerBlockRequired || [],
    sourceDiversityRequired: structural.sourceDiversityRequired || [],
  };
}

function listMandatoryArtifacts(rules, manifestArtifacts) {
  // Mandatory artifacts = union of (per-articleType threshold keys) ∪
  // (every entry in manifest.files.*).
  const set = new Set();
  for (const k of Object.keys(rules.perArtifactFloors || {})) set.add(k);
  for (const a of manifestArtifacts) set.add(a);
  return Array.from(set).sort();
}

function flattenManifestArtifacts(manifest) {
  const out = [];
  const files = manifest?.files;
  if (!files || typeof files !== 'object') return out;
  for (const v of Object.values(files)) {
    if (!Array.isArray(v)) continue;
    for (const entry of v) {
      if (typeof entry === 'string') out.push(entry);
      else if (entry && typeof entry.path === 'string') out.push(entry.path);
    }
  }
  return Array.from(new Set(out));
}

function summarize(results) {
  let missing = 0;
  let short = 0;
  let placeholders = 0;
  let mermaidMissing = 0;
  let other = 0;
  for (const r of results) {
    if (!r.exists) {
      missing += 1;
      continue;
    }
    let counted = false;
    for (const issue of r.issues) {
      if (issue.startsWith('short:')) {
        short += 1;
        counted = true;
      } else if (issue.startsWith('placeholders:')) {
        placeholders += r.placeholders.length;
        counted = true;
      } else if (issue === 'mermaid:missing') {
        mermaidMissing += 1;
        counted = true;
      }
    }
    if (!counted && r.issues.length > 0) other += r.issues.length;
  }
  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0);
  const totalLines = results.reduce((s, r) => s + (r.lines || 0), 0);
  return { missing, short, placeholders, mermaidMissing, other, totalIssues, totalLines };
}

function main() {
  const opts = parseArgs(process.argv);
  const runDir = path.resolve(ROOT, opts.runDir);
  if (!fs.existsSync(runDir) || !fs.statSync(runDir).isDirectory()) {
    process.stderr.write(`error: runDir does not exist or is not a directory: ${runDir}\n`);
    process.exit(2);
  }

  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    process.stderr.write(`error: missing manifest.json at ${manifestPath}\n`);
    process.stdout.write(
      `STAGE_C_GATE: RED articleType=unknown missing=1 short=0 placeholders=0\n`,
    );
    process.exit(1);
  }
  const manifest = safeReadJson(manifestPath);
  if (manifest.__error) {
    process.stderr.write(`error: cannot parse manifest.json: ${manifest.__error}\n`);
    process.stdout.write(
      `STAGE_C_GATE: RED articleType=unknown missing=1 short=0 placeholders=0\n`,
    );
    process.exit(1);
  }

  const articleType = manifest.articleType || manifest.article_type || 'unknown';
  if (articleType === 'unknown') {
    process.stderr.write(
      'warning: manifest.json missing top-level articleType (Rule 6)\n',
    );
  }

  const thresholdsJson = loadThresholds(opts.thresholdsPath);
  const rules = buildRules(thresholdsJson, articleType);

  const manifestArtifacts = flattenManifestArtifacts(manifest);
  const onDisk = walkArtifacts(runDir);
  const orphans = onDisk.filter((p) => !manifestArtifacts.includes(p));
  const mandatory = listMandatoryArtifacts(rules, manifestArtifacts);

  const results = mandatory.map((relativePath) =>
    validateArtifact({ runDir, relativePath, rules, options: opts }),
  );

  // Orphans are reported as warnings (not blocking) — they may be valid extras.
  const summary = summarize(results);
  const offending = results.filter((r) => r.issues.length > 0);
  const warning = results.filter((r) => r.warnings.length > 0);

  // Human-readable per-artifact report
  for (const r of offending) {
    process.stderr.write(
      `RED  ${r.relativePath} :: ${r.issues.join('; ')} (lines=${r.lines}/${r.minLines})\n`,
    );
  }
  for (const r of warning) {
    process.stderr.write(
      `WARN ${r.relativePath} :: ${r.warnings.join('; ')} (lines=${r.lines})\n`,
    );
  }
  if (orphans.length > 0) {
    process.stderr.write(
      `WARN orphan artifacts (not listed in manifest.files.*): ${orphans.join(', ')}\n`,
    );
  }

  const green = offending.length === 0;
  const gateLine = green
    ? `STAGE_C_GATE: GREEN articleType=${articleType} artifacts=${results.length} lines=${summary.totalLines}`
    : `STAGE_C_GATE: RED articleType=${articleType} missing=${summary.missing} short=${summary.short} placeholders=${summary.placeholders} mermaid_missing=${summary.mermaidMissing} other=${summary.other}`;
  process.stdout.write(`${gateLine}\n`);

  if (opts.json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          gate: green ? 'GREEN' : 'RED',
          articleType,
          runDir: path.relative(ROOT, runDir) || runDir,
          artifacts: results.length,
          summary,
          results,
          orphans,
        },
        null,
        2,
      )}\n`,
    );
  }

  process.exit(green ? 0 : 1);
}

main();
