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

const IMF_SOURCE_FIELD_RE =
  /^\|\s*\*\*IMF Source\*\*\s*\|\s*`?([^`|\]]+?)`?\s*\|/im;

// Keep the proximity window wide enough for one short citation clause
// ("IMF WEO April 2026 reports Germany at 1.1%...") but narrow enough to
// avoid treating a generic methodology paragraph as a numeric IMF claim.
const IMF_FIGURE_CLAIM_RE =
  /\bIMF\b[\s\S]{0,160}\b\d+(?:\.\d+)?\s*(?:%|pp|percentage points|GDP|EUR|USD|billion|trillion|million)/i;

// IMF-primary editorial policy: IMF is the sole authoritative source for
// economic / fiscal / monetary / trade / FDI / exchange-rate /
// banking-soundness claims inside economic-context.md. World Bank is
// used for non-economic domains. Two complementary detectors:
//
//   1. WB economic indicator codes — surface the offending SDMX-style
//      identifier when an economic-context artifact still cites raw WB
//      economic series (NY.GDP.*, FP.CPI.*, SL.UEM.*, GC.DOD.*, NE.EXP.*,
//      NE.TRD.*, BX.KLT.*, NY.GNP.*, GC.TAX.*, NE.CON.GOVT.*).
//   2. WB economic prose claim — match "World Bank" within 120 chars of an
//      economic noun (GDP, inflation, unemployment, fiscal balance, debt,
//      trade, FDI, exchange rate). The window is intentionally narrow so
//      a sentence like "World Bank WGI governance index" (legitimate
//      non-economic domain) does not trigger.
//
// Both detectors deliberately exclude the narrative "Retired from WB
// (now IMF-primary…)" and "legacy WB economic codes (… retained for
// backward compatibility but MUST NOT…)" wording that appears in the
// methodology files themselves — those files are not validated as run
// artifacts. The detectors only run against `intelligence/economic-
// context.md` and only when the artifact is also flagged as making
// numeric IMF claims (i.e. the artifact actually carries economic
// content), see callers in `evaluateArtifact`.
const WB_ECONOMIC_INDICATOR_CODE_RE =
  /\b(NY\.GDP\.[A-Z0-9.]+|NY\.GNP\.[A-Z0-9.]+|FP\.CPI\.[A-Z0-9.]+|SL\.UEM\.[A-Z0-9.]+|GC\.DOD\.[A-Z0-9.]+|GC\.TAX\.[A-Z0-9.]+|NE\.EXP\.[A-Z0-9.]+|NE\.IMP\.[A-Z0-9.]+|NE\.TRD\.[A-Z0-9.]+|NE\.CON\.GOVT\.[A-Z0-9.]+|BX\.KLT\.[A-Z0-9.]+|BN\.KLT\.[A-Z0-9.]+|FR\.INR\.[A-Z0-9.]+)\b/;

const WB_ECONOMIC_CLAIM_RE =
  /\bWorld\s+Bank\b[\s\S]{0,120}\b(?:GDP(?:\s+growth|\s+per\s+capita)?|inflation|CPI|unemployment(?:\s+rate)?|fiscal\s+balance|primary\s+balance|government\s+debt|public\s+debt|current\s+account|trade(?:\s+balance)?|FDI|foreign\s+direct\s+investment|exchange\s+rate|REER|policy\s+rate|reserve\s+assets|capital\s+adequacy|NPL\s+ratio)\b/i;

// Bypass placeholder scan only on template-instruction blocks themselves —
// NOT on every artifact that happens to link to a methodology document.
// Matching `methodology` here would suppress placeholder detection for any
// artifact citing e.g. `political-risk-methodology.md` and let real
// `[AI_ANALYSIS_REQUIRED]` markers slip through.
const META_DOC_HINT_RE =
  /(template-instructions|placeholder reference|TODO list of)/i;

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
      // The flag may only RAISE the floor — never lower it below DEFAULT_MIN_LINES.
      opts.minLines = Math.max(DEFAULT_MIN_LINES, n);
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

function isEconomicContextArtifact(relativePath) {
  return relativePath.replace(/\\/g, '/').endsWith('economic-context.md');
}

function parseImfSourceField(content) {
  const match = content.match(IMF_SOURCE_FIELD_RE);
  if (!match) return null;
  const raw = match[1].trim().toLowerCase();
  if (raw.startsWith('live')) return 'live';
  if (raw.startsWith('cache')) return 'cache';
  if (raw.startsWith('knowledge-only')) return 'knowledge-only';
  // Unknown value (including untouched template placeholders like
  // "<live | cache | knowledge-only>") must not bypass the provenance gate.
  return null;
}

function claimsImfFigures(content) {
  return IMF_FIGURE_CLAIM_RE.test(content);
}

/**
 * IMF-primary editorial policy.
 *
 * Detect WB economic-policy violations inside `intelligence/economic-
 * context.md`:
 *
 *   - Any WB economic indicator code (NY.GDP.*, FP.CPI.*, SL.UEM.*,
 *     GC.DOD.*, NE.EXP.*, NE.TRD.*, BX.KLT.*, NY.GNP.*, GC.TAX.*,
 *     NE.CON.GOVT.*, FR.INR.*) — these belong in IMF SDMX form (NGDP,
 *     PCPIPCH, LUR, GGXWDG_NGDP, BCA_NGDPD, …).
 *   - Any "World Bank … <economic noun>" prose claim within 120 chars
 *     (GDP, inflation, unemployment, fiscal balance, debt, trade, FDI,
 *     exchange rate, policy rate, banking soundness).
 *
 * The detector deliberately runs only on `intelligence/economic-
 * context.md`. Other artifacts may legitimately reference WB for non-
 * economic context (governance WGI, demographics, social, environment,
 * defence-spending, agriculture, innovation, education, health) and
 * the WB methodology files themselves describe legacy codes for
 * backward-compatibility — neither path is validated here.
 *
 * Returns `{ codes, prose }` arrays of offending excerpts. Empty arrays
 * mean clean.
 */
function detectWorldBankEconomicViolations(content) {
  // Use matchAll() so callers get every offending excerpt, not just the
  // first hit — an artifact that cites several WB economic series
  // ("NY.GDP.MKTP.KD.ZG and FP.CPI.TOTL.ZG and SL.UEM.TOTL.ZS") must
  // surface all three to the editor in a single Stage-C pass.
  const codes = [];
  const codeRe = new RegExp(WB_ECONOMIC_INDICATOR_CODE_RE.source, 'gi');
  for (const m of content.matchAll(codeRe)) {
    codes.push(m[1]);
  }
  const prose = [];
  const proseRe = new RegExp(WB_ECONOMIC_CLAIM_RE.source, 'gi');
  for (const m of content.matchAll(proseRe)) {
    prose.push(m[0].replace(/\s+/g, ' ').trim().slice(0, 100));
  }
  return { codes, prose };
}

// Stage C IMF evidence gate. The probe always writes a summary JSON even
// when `available:false`, so a generic "any .json file" check is insufficient
// — it would let a failed probe satisfy the gate. Require:
//   1. At least one canonical WEO evidence file (`weo-*.json`) that is
//      non-empty, AND
//   2. If `imf-probe-summary.json` is present, it must report
//      `available:true` (the probe writes `available:false` when the live
//      fetch failed and no cache was hit).
function hasImfCacheJson(runDir) {
  const cacheDir = path.join(runDir, 'cache', 'imf');
  let entries;
  try {
    entries = fs.readdirSync(cacheDir, { withFileTypes: true });
  } catch {
    return false;
  }
  const hasWeoEvidence = entries.some((entry) => {
    if (
      !entry.isFile() ||
      !entry.name.startsWith('weo-') ||
      !entry.name.endsWith('.json')
    ) {
      return false;
    }
    try {
      return fs.statSync(path.join(cacheDir, entry.name)).size > 0;
    } catch {
      return false;
    }
  });
  if (!hasWeoEvidence) return false;
  const summaryPath = path.join(cacheDir, 'imf-probe-summary.json');
  try {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    if (summary && summary.available === false) return false;
  } catch {
    // No summary, unreadable, or malformed — fall back to the WEO evidence
    // check above. The summary is best-effort additional confirmation.
  }
  return true;
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
      if (
        rel === ''
        && (
          entry.name.toLowerCase() === 'article.md'
          || /^article\./i.test(entry.name)
        )
      ) continue;
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
    !hasSourceDiversityEvidence(content)
  ) {
    if (options.strict) result.issues.push('source-diversity:no-evidence-or-mcp-ref');
    else result.warnings.push('source-diversity:no-evidence-or-mcp-ref');
  }
  if (isEconomicContextArtifact(relativePath) && claimsImfFigures(content)) {
    const imfSource = parseImfSourceField(content);
    if (!imfSource) {
      result.issues.push('imf-source:missing');
    } else if (imfSource === 'knowledge-only') {
      result.issues.push('imf-source:knowledge-only');
    } else if ((imfSource === 'live' || imfSource === 'cache') && !hasImfCacheJson(runDir)) {
      result.issues.push('imf-cache:missing');
    }
  }
  // IMF-primary editorial policy: economic-context.md must not
  // cite World Bank for economic claims regardless of whether IMF prose
  // is also present. Run on every economic-context artifact (not gated
  // on claimsImfFigures) so an article that drops IMF entirely and
  // tries to satisfy economic context with WB alone is caught.
  if (isEconomicContextArtifact(relativePath)) {
    const { codes: wbCodes, prose: wbProse } =
      detectWorldBankEconomicViolations(content);
    // Surface every offending code (de-duplicated to keep the issue
    // list concise when the same series is cited many times in one
    // artifact). Stage-C editors get the full picture in one pass.
    for (const code of [...new Set(wbCodes)]) {
      result.issues.push(`economic-context:wb-economic-code:${code}`);
    }
    if (wbProse.length > 0) {
      result.issues.push('economic-context:wb-economic-claim');
    }
  }

  return result;
}

/**
 * Detect a markdown table with a Source / Evidence / Reference header column.
 * A v2.0 template's "Data Sources & Provenance" section satisfies this.
 */
function hasEvidenceTableRow(content) {
  const lines = content.split(/\r?\n/);
  const separatorPattern = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/;
  const headerPattern = /\|\s*(source|evidence|reference)\s*\|/i;

  for (let i = 0; i < lines.length - 2; i += 1) {
    const headerLine = lines[i].trim();
    const separatorLine = lines[i + 1].trim();
    const dataLine = lines[i + 2].trim();

    if (
      headerPattern.test(headerLine) &&
      separatorPattern.test(separatorLine) &&
      /^\|.*\|$/.test(dataLine)
    ) {
      return true;
    }
  }

  return false;
}

function hasSourceDiversityEvidence(content) {
  return hasEvidenceTableRow(content) || hasMcpToolReference(content);
}

function hasOpenForwardStatementItems(runDir) {
  const openJsonPath = path.join(runDir, 'data', 'forward-statements-open.json');
  if (!fs.existsSync(openJsonPath)) return false;

  const openRaw = fs.readFileSync(openJsonPath, 'utf8').trim();
  if (!openRaw) return false;

  try {
    const openItems = JSON.parse(openRaw);
    if (Array.isArray(openItems)) return openItems.length > 0;
    // Valid JSON but unexpected shape — treat any non-empty file as open data
    // so the carried-forward section check cannot be silently bypassed.
    return true;
  } catch {
    // Malformed JSON — treat as non-empty to force the check.
    return true;
  }
}

function validateForwardStatementsRegistryCoverage(runDir, articleType) {
  const forwardStatementArticleTypes = ['week-ahead', 'month-ahead'];
  if (!forwardStatementArticleTypes.includes(articleType)) return null;
  if (!hasOpenForwardStatementItems(runDir)) return null;

  const relativePath = 'intelligence/synthesis-summary.md';
  const synthPath = path.join(runDir, relativePath);
  if (!fs.existsSync(synthPath)) return null;

  const synthContent = fs.readFileSync(synthPath, 'utf8');
  const hasCarriedSection = /##[^#\n]*carried[-\s]forward\s+forward\s+statements/i.test(synthContent);
  if (hasCarriedSection) return null;

  return {
    relativePath,
    exists: true,
    lines: countLines(synthContent),
    minLines: 0,
    issues: ['forward-registry:missing-carried-forward-section'],
    warnings: [],
    mermaid: hasMermaid(synthContent),
    placeholders: [],
  };
}

function mergeUnique(left, right) {
  return [...new Set([...(left || []), ...(right || [])])];
}

function mergeForwardRegistryResult(results, forwardRegistryResult) {
  if (!forwardRegistryResult) return;

  const existingResultIndex = results.findIndex(
    (result) => result.relativePath === forwardRegistryResult.relativePath,
  );

  if (existingResultIndex >= 0) {
    const existingResult = results[existingResultIndex];
    results[existingResultIndex] = {
      ...existingResult,
      issues: mergeUnique(existingResult.issues, forwardRegistryResult.issues),
      warnings: mergeUnique(existingResult.warnings, forwardRegistryResult.warnings),
    };
    return;
  }

  results.push(forwardRegistryResult);
}

/**
 * Count the number of scenario headings in a scenario-forecast artifact.
 * Matches `### Scenario N:` and `### Scenario N —` patterns (both numeric
 * and letter variants used in worked examples).
 */
function countScenarios(content) {
  // Match "### Scenario 1:" or "### Scenario A —" (any heading-3 scenario)
  const re = /^###\s+Scenario\s+[\w]+\s*[:—]/gm;
  const matches = content.match(re);
  return matches ? matches.length : 0;
}

/**
 * Validate the long-horizon scenario-count gate.
 *
 * When the article type is in `longHorizonScenarioGate.articleTypes`,
 * `intelligence/scenario-forecast.md` MUST contain at least
 * `longHorizonScenarioGate.minScenarios` scenario headings.
 * Returns a synthetic result object if the gate fires, or null if it passes.
 */
function validateLongHorizonScenarioGate(runDir, rules) {
  if (!rules.longHorizonScenarioGate) return null;
  const { artifact, minScenarios } = rules.longHorizonScenarioGate;
  const absPath = path.join(runDir, artifact);
  if (!fs.existsSync(absPath)) return null; // already caught as missing artifact
  const content = fs.readFileSync(absPath, 'utf8');
  const count = countScenarios(content);
  if (count >= minScenarios) return null; // gate passes

  return {
    relativePath: artifact,
    exists: true,
    lines: countLines(content),
    minLines: 0,
    issues: [`long-horizon-scenario-count:${count}<${minScenarios}`],
    warnings: [],
    mermaid: hasMermaid(content),
    placeholders: [],
  };
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
    longHorizonScenarioGate: null,
  };
  if (!thresholdsJson) return empty;

  const perArtifactFloors = thresholdsJson.thresholds?.[articleType] || {};
  const tradecraft = thresholdsJson.tradecraftQualitySignals || {};
  const structural = thresholdsJson.structuralRequirements || {};

  // Load long-horizon scenario gate config from JSON if present.
  const lhGateCfg = structural.longHorizonScenarioGate || null;
  const longHorizonScenarioGate =
    lhGateCfg &&
    Array.isArray(lhGateCfg.articleTypes) &&
    lhGateCfg.articleTypes.includes(articleType)
      ? { artifact: lhGateCfg.artifact || 'intelligence/scenario-forecast.md', minScenarios: lhGateCfg.minScenarios || 6 }
      : null;

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
    longHorizonScenarioGate,
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
    // Count placeholders exactly once per artifact, regardless of how many
    // issue strings reference them — the artifact owns the placeholders array.
    placeholders += (r.placeholders?.length ?? 0);
    let counted = false;
    for (const issue of r.issues) {
      if (issue.startsWith('short:')) {
        short += 1;
        counted = true;
      } else if (issue.startsWith('placeholders:')) {
        // Already counted above; just mark that we accounted for this issue
        // string so it doesn't fall through to `other`.
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

  const forwardRegistryResult = validateForwardStatementsRegistryCoverage(runDir, articleType);
  mergeForwardRegistryResult(results, forwardRegistryResult);

  // ── Long-horizon scenario-count gate ─────────────────────────────────────
  // For term-outlook and election-cycle article types, scenario-forecast.md
  // MUST contain >= 6 scenario headings. See analysis/templates/scenario-forecast.md
  // §0 and analysis/methodologies/reference-quality-thresholds.json
  // structuralRequirements.longHorizonScenarioGate.
  const longHorizonScenarioResult = validateLongHorizonScenarioGate(runDir, rules);
  if (longHorizonScenarioResult) {
    mergeForwardRegistryResult(results, longHorizonScenarioResult);
  }

  // ── Re-run improve/extend enforcement ────────────────────────────────────
  // Detect whether this is a re-run of an existing same-day analysis by
  // checking manifest.history[]. When prior runs exist the agent MUST extend
  // every artifact (rewriteCount must equal total artifact count, and each
  // carry-forward artifact must reach its extendFloor). These are hard-RED
  // violations, not warnings. See `.github/prompts/02-analysis-protocol.md`
  // §"Re-run improve/extend rule".
  const isRerun =
    Array.isArray(manifest.history) && manifest.history.length > 0;

  // Load prior-run-diff.json if present (produced unconditionally by
  // `npm run prior-run-diff` in Stage A). Use a safeReadJson wrapper so a
  // corrupt file degrades gracefully.
  let priorRunDiff = null;
  const priorRunDiffPath = path.join(runDir, 'runs', 'prior-run-diff.json');
  if (fs.existsSync(priorRunDiffPath)) {
    const raw = safeReadJson(priorRunDiffPath);
    if (!raw.__error) priorRunDiff = raw;
  }

  // Build a quick lookup: relativePath → extendFloor, used below.
  const extendFloorByPath = new Map();
  if (priorRunDiff?.carryForward && Array.isArray(priorRunDiff.carryForward)) {
    for (const entry of priorRunDiff.carryForward) {
      if (entry.relativePath && typeof entry.extendFloor === 'number') {
        extendFloorByPath.set(entry.relativePath, entry.extendFloor);
      }
    }
  }

  // On re-runs, check every carry-forward artifact's new line count against
  // its extendFloor. Failures are hard-RED violations injected directly into
  // the per-artifact result (not warnings) because a skip-write on a
  // carry-forward target defeats the never-no-op contract.
  if (isRerun && extendFloorByPath.size > 0) {
    for (const r of results) {
      const extendFloor = extendFloorByPath.get(r.relativePath);
      if (extendFloor === undefined) continue;
      if (!r.exists) continue; // already flagged as missing
      if (r.lines < extendFloor) {
        r.issues.push(`extend:below-extendFloor(${r.lines}<${extendFloor})`);
      }
    }
  }

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

  // ── pass2 rewriteCount enforcement ───────────────────────────────────────
  // Pass-2-skipped heuristic: warn when manifest.pass2 is absent, malformed,
  // or `rewriteCount === 0` AND at least one artifact sits at exactly its
  // line floor. On a re-run, `rewriteCount === 0` is a hard-RED violation
  // (not a warning) because every artifact must be extended — a zero count
  // means Stage B was a no-op. See `.github/prompts/02-analysis-protocol.md`
  // §"Re-run improve/extend rule".
  //
  // A malformed pass2 block (non-numeric, non-finite, negative, non-integer
  // rewriteCount, or missing/non-string startedAt/endedAt timestamps) is
  // treated like an absent block so the enforcement can't be bypassed by
  // typos or malformed values.
  const pass2 = manifest.pass2;
  const pass2Absent = pass2 == null;
  const pass2RewriteCount = pass2?.rewriteCount;
  const pass2RewriteCountValid =
    typeof pass2RewriteCount === 'number' &&
    Number.isFinite(pass2RewriteCount) &&
    Number.isInteger(pass2RewriteCount) &&
    pass2RewriteCount >= 0;
  const pass2StartedAtValid =
    typeof pass2?.startedAt === 'string' && pass2.startedAt.length > 0;
  const pass2EndedAtValid =
    typeof pass2?.endedAt === 'string' && pass2.endedAt.length > 0;
  const pass2SchemaValid =
    pass2RewriteCountValid && pass2StartedAtValid && pass2EndedAtValid;
  const pass2Invalid = !pass2Absent && !pass2SchemaValid;
  const pass2ZeroRewrites = pass2SchemaValid && pass2RewriteCount === 0;

  if (pass2Invalid) {
    const reasons = [];
    if (!pass2RewriteCountValid) {
      reasons.push(
        `rewriteCount must be a non-negative integer (received ${JSON.stringify(
          pass2RewriteCount,
        )})`,
      );
    }
    if (!pass2StartedAtValid) {
      reasons.push(
        `startedAt must be a non-empty string (received ${JSON.stringify(pass2?.startedAt)})`,
      );
    }
    if (!pass2EndedAtValid) {
      reasons.push(
        `endedAt must be a non-empty string (received ${JSON.stringify(pass2?.endedAt)})`,
      );
    }
    process.stderr.write(
      `WARN manifest.pass2 invalid schema: ${reasons.join('; ')}\n`,
    );
  }

  // On re-runs, a zero-rewrite pass2 is a hard-RED gate violation because
  // every artifact must be extended. On first runs, it remains a warning.
  let rerunZeroRewritesRed = false;
  if (isRerun && pass2ZeroRewrites) {
    rerunZeroRewritesRed = true;
    process.stderr.write(
      `RED rerun-no-op: manifest.pass2.rewriteCount === 0 on a re-run ` +
        `(history[] non-empty) — Stage B must extend every artifact. ` +
        `See .github/prompts/02-analysis-protocol.md §"Re-run improve/extend rule".\n`,
    );
  }

  if (!rerunZeroRewritesRed && (pass2Absent || pass2Invalid || pass2ZeroRewrites)) {
    const atFloor = results.filter(
      (r) => r.exists && r.lines > 0 && r.lines === r.minLines,
    );
    if (atFloor.length > 0) {
      let label;
      if (pass2Absent) label = 'pass2-block-missing';
      else if (pass2Invalid) label = 'pass2-schema-invalid';
      else label = 'pass2.rewriteCount=0';
      process.stderr.write(
        `WARN pass2-skipped-heuristic: ${label} and ${atFloor.length} artifact(s) ` +
          `at exactly their line floor: ${atFloor.map((r) => r.relativePath).join(', ')}\n`,
      );
    }
  }

  const green = offending.length === 0 && !rerunZeroRewritesRed;

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
          isRerun,
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
