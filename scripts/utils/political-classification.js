// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/PoliticalClassification
 * @description Pure political intelligence classification utility functions for
 * structured assessment of European Parliament data.
 *
 * All classification functions are stateless, side-effect-free, and safely
 * handle malformed or missing MCP sub-fields and empty arrays within a provided
 * {@link ClassificationInput} object. Dedicated filesystem helpers in this module
 * perform explicit analysis output I/O.
 *
 * The analytical framework is inspired by ISMS classification methodologies
 * (Hack23 ISMS-PUBLIC/CLASSIFICATION.md) adapted for political intelligence:
 * - Political Significance Classification (5 levels)
 * - Political Impact Analysis Matrix (5 dimensions)
 * - Political Actor Taxonomy
 * - Political Forces Analysis (adapted from Porter's Five Forces)
 *
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md} ISMS Classification
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/STYLE_GUIDE.md} ISMS Style Guide
 */
import fs from 'fs';
import path from 'path';
import { atomicWrite } from './file-utils.js';
import { SIGNIFICANCE_ORDER, IMPACT_ORDER } from '../types/political-classification.js';
// ─── Framework version ────────────────────────────────────────────────────────
/** Semantic version of the political classification framework */
export const FRAMEWORK_VERSION = '1.0.0';
// ─── Private helpers ──────────────────────────────────────────────────────────
/**
 * Safely return a trimmed string from an unknown value
 *
 * @param val - Unknown value to coerce
 * @returns Trimmed string, or empty string for non-string input
 */
function asStr(val) {
    return typeof val === 'string' ? val.trim() : '';
}
/**
 * Safely return a finite number from an unknown value
 *
 * @param val - Unknown value to coerce
 * @param fallback - Value returned when input is not a finite number
 * @returns Finite number or fallback
 */
function asNum(val, fallback = 0) {
    return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}
/**
 * Clamp a number to [0, 1]
 *
 * @param n - Number to clamp
 * @returns Value clamped to [0, 1]
 */
function clamp01(n) {
    return Math.min(1, Math.max(0, n));
}
/**
 * Escape a string for safe embedding in a double-quoted YAML scalar.
 *
 * Escapes backslashes, double quotes, and newlines to prevent YAML injection
 * or parse errors when interpolating untrusted values into frontmatter.
 *
 * @param s - Raw string value
 * @returns Escaped string safe for YAML double-quoted context
 */
function escapeYamlString(s) {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}
/**
 * Merge `votingAnomalies` and `anomalies` fields from a ClassificationInput.
 *
 * Existing article payloads (Motions/WeeklyReview) use `anomalies` while the
 * classification framework originally used `votingAnomalies`. This helper
 * concatenates both to ensure callers don't need to remap field names.
 *
 * @param data - Classification input potentially containing both field names
 * @returns Merged array of anomaly entries from both fields
 */
function mergeAnomalies(data) {
    const a = data.votingAnomalies ?? [];
    const b = data.anomalies ?? [];
    if (b.length === 0)
        return a;
    if (a.length === 0)
        return b;
    return [...a, ...b];
}
/**
 * Resolve an ImpactLevel from a 0-1 intensity score
 *
 * @param score - Normalised intensity score in [0, 1]
 * @returns Corresponding ImpactLevel
 */
function scoreToImpact(score) {
    if (score >= 0.85)
        return 'critical';
    if (score >= 0.65)
        return 'high';
    if (score >= 0.4)
        return 'moderate';
    if (score >= 0.15)
        return 'low';
    return 'none';
}
/**
 * Map an ImpactLevel to a numeric weight for aggregation
 *
 * @param level - ImpactLevel to convert
 * @returns Numeric weight in [0, 4]
 */
function impactToWeight(level) {
    return IMPACT_ORDER.indexOf(level);
}
/**
 * Derive a PoliticalSignificance from an aggregate impact weight
 *
 * @param weight - Average impact weight across all dimensions
 * @returns Corresponding PoliticalSignificance level
 */
function weightToSignificance(weight) {
    if (weight >= 3.5)
        return 'historic';
    if (weight >= 2.6)
        return 'critical';
    if (weight >= 1.8)
        return 'significant';
    if (weight >= 1.0)
        return 'notable';
    return 'routine';
}
/**
 * Count total votes cast in a single voting record entry
 *
 * @param votes - Optional vote counts object
 * @returns Total votes cast (for + against + abstain)
 */
function totalVotes(votes) {
    if (!votes)
        return 0;
    return asNum(votes.for) + asNum(votes.against) + asNum(votes.abstain);
}
// ─── Significance Assessment ──────────────────────────────────────────────────
/**
 * Assess the overall political significance of parliamentary data.
 *
 * Combines signals from voting activity, legislative pipeline complexity,
 * detected anomalies, and coalition dynamics to produce a 5-level significance
 * classification aligned with the Political Significance Classification system.
 *
 * @param data - Parliamentary data from any article type
 * @returns Political significance level
 *
 * @example
 * ```ts
 * const level = assessPoliticalSignificance({ votingRecords: [...], procedures: [...] });
 * // Returns: 'significant'
 * ```
 */
export function assessPoliticalSignificance(data) {
    const votes = data.votingRecords ?? [];
    const procedures = data.procedures ?? [];
    const anomalies = mergeAnomalies(data);
    const coalitions = data.coalitions ?? [];
    // Signal 1: Volume and controversy of votes (0–1)
    const voteScore = clamp01(votes.length / 10);
    const controversialVotes = votes.filter((v) => {
        const t = totalVotes(v.votes);
        if (t === 0)
            return false;
        const against = asNum(v.votes?.against);
        return against / t > 0.35; // >35% opposition → controversial
    });
    const controversyScore = clamp01(controversialVotes.length / Math.max(votes.length, 1));
    // Signal 2: Legislative pipeline complexity (0–1)
    const bottlenecks = procedures.filter((p) => p.bottleneck === true).length;
    const pipelineScore = clamp01(procedures.length / 15 + bottlenecks * 0.2);
    // Signal 3: Severity of voting anomalies (0–1)
    const highSeverityAnomalies = anomalies.filter((a) => asStr(a.severity).toLowerCase() === 'critical' || asStr(a.severity).toLowerCase() === 'high').length;
    const anomalyScore = clamp01(highSeverityAnomalies / 3 + anomalies.length / 10);
    // Signal 4: Coalition instability (0–1)
    const lowCohesionCoalitions = coalitions.filter((c) => asNum(c.cohesionScore, 1) < 0.6).length;
    const highRiskCoalitions = coalitions.filter((c) => asStr(c.riskLevel).toLowerCase() === 'high').length;
    const coalitionScore = clamp01(lowCohesionCoalitions * 0.25 + highRiskCoalitions * 0.4);
    // Aggregate with equal weights across five signals
    const aggregate = (voteScore + controversyScore + pipelineScore + anomalyScore + coalitionScore) / 5;
    return weightToSignificance(aggregate * 4);
}
// ─── Impact Matrix ────────────────────────────────────────────────────────────
/**
 * Build a multi-dimensional Political Impact Assessment Matrix.
 *
 * Inspired by the ISMS Business Impact Analysis Matrix, this function evaluates
 * five political dimensions independently and then derives an overall significance
 * from the aggregate impact weight.
 *
 * @param data - Parliamentary data from any article type
 * @returns Multi-dimensional impact assessment with overall significance
 *
 * @example
 * ```ts
 * const matrix = buildImpactMatrix({ votingRecords: [...], coalitions: [...] });
 * console.log(matrix.legislativeImpact); // 'high'
 * ```
 */
export function buildImpactMatrix(data) {
    const votes = data.votingRecords ?? [];
    const procedures = data.procedures ?? [];
    const coalitions = data.coalitions ?? [];
    const questions = data.questions ?? [];
    const documents = data.documents ?? [];
    // Legislative Impact — votes scheduled + procedure complexity
    const legislativeScore = clamp01(votes.length / 12 + procedures.filter((p) => p.bottleneck === true).length * 0.2);
    const legislativeImpact = scoreToImpact(legislativeScore);
    // Coalition Impact — cohesion deficits + alignment drift
    const avgCohesion = coalitions.length > 0
        ? coalitions.reduce((sum, c) => sum + asNum(c.cohesionScore, 0.8), 0) / coalitions.length
        : 0.8;
    const driftingCoalitions = coalitions.filter((c) => asStr(c.alignmentTrend).toLowerCase() === 'weakening').length;
    const coalitionScore = clamp01((1 - avgCohesion) * 0.6 + driftingCoalitions * 0.2);
    const coalitionImpact = scoreToImpact(coalitionScore);
    // Public Opinion Impact — oral questions + high-visibility votes
    const oralQuestions = questions.filter((q) => asStr(q.type).toLowerCase() === 'oral').length;
    const highProfileVotes = votes.filter((v) => {
        const t = totalVotes(v.votes);
        return t > 500;
    }).length;
    const publicScore = clamp01(oralQuestions / 8 + highProfileVotes * 0.15);
    const publicOpinionImpact = scoreToImpact(publicScore);
    // Institutional Impact — formal documents + procedures in advanced stages
    const advancedStages = procedures.filter((p) => {
        const stage = asStr(p.stage).toLowerCase();
        return stage === 'plenary' || stage === 'trilogue' || stage === 'adoption';
    }).length;
    const institutionalScore = clamp01(documents.length / 20 + advancedStages * 0.25);
    const institutionalImpact = scoreToImpact(institutionalScore);
    // Economic Impact — economic/fiscal committee documents or procedures
    const economicProcedures = procedures.filter((p) => ECONOMIC_KEYWORDS.some((kw) => asStr(p.title).toLowerCase().includes(kw))).length;
    const economicDocs = documents.filter((d) => ECONOMIC_KEYWORDS.some((kw) => asStr(d.title).toLowerCase().includes(kw) ||
        asStr(d.committee).toLowerCase().includes('econ') ||
        asStr(d.committee).toLowerCase().includes('budg'))).length;
    const economicScore = clamp01(economicProcedures * 0.3 + economicDocs * 0.15);
    const economicImpact = scoreToImpact(economicScore);
    // Derive overall significance from average impact weight
    const avgWeight = [legislativeImpact, coalitionImpact, publicOpinionImpact, institutionalImpact, economicImpact]
        .map(impactToWeight)
        .reduce((a, b) => a + b, 0) / 5;
    const overallSignificance = weightToSignificance(avgWeight);
    return {
        legislativeImpact,
        coalitionImpact,
        publicOpinionImpact,
        institutionalImpact,
        economicImpact,
        overallSignificance,
    };
}
// ─── Actor Classification ─────────────────────────────────────────────────────
/** EU institution identifiers (lowercase substring match) */
const EU_INSTITUTION_KEYWORDS = [
    'european commission',
    'european council',
    'council of the eu',
    'court of justice',
    'european central bank',
    'ecb',
    'ecj',
    'cjeu',
    'eib',
    'european investment bank',
];
/** Political group identifiers used in the European Parliament */
const EP_POLITICAL_GROUPS = [
    'epp',
    'ecr',
    's&d',
    'renew',
    'greens',
    'id',
    'the left',
    'gue/ngl',
    'efdd',
    'patriots',
    'esn',
    'non-attached',
    'ni',
];
/** ISO 3166-1 alpha-2 EU member state codes (lowercase) */
const EU_MEMBER_STATE_CODES = new Set([
    'at',
    'be',
    'bg',
    'cy',
    'cz',
    'de',
    'dk',
    'ee',
    'es',
    'fi',
    'fr',
    'gr',
    'hr',
    'hu',
    'ie',
    'it',
    'lt',
    'lu',
    'lv',
    'mt',
    'nl',
    'pl',
    'pt',
    'ro',
    'se',
    'si',
    'sk',
]);
/** Economic/fiscal keyword list used by impact and forces analysis */
const ECONOMIC_KEYWORDS = ['economic', 'fiscal', 'budget', 'finance', 'trade', 'market'];
/** External/geopolitical keyword list used by forces analysis */
const EXTERNAL_KEYWORDS = [
    'international',
    'global',
    'foreign',
    'geopolit',
    'nato',
    'us ',
    'china',
    'russia',
    'ukraine',
    'g7',
    'g20',
    'wto',
    'imf',
    'world bank',
];
/**
 * Infer the PoliticalActorType from a name string using keyword heuristics.
 *
 * @param name - Actor name or identifier to classify
 * @returns Inferred actor type
 */
function inferActorType(name) {
    const lower = name.toLowerCase();
    if (EU_INSTITUTION_KEYWORDS.some((kw) => lower.includes(kw)))
        return 'eu_institution';
    if (EP_POLITICAL_GROUPS.some((g) => lower === g || lower.startsWith(g + ' '))) {
        return 'political_group';
    }
    if (lower.startsWith('mep-') || lower.includes('mep'))
        return 'individual_mep';
    // Two-letter country code → national_delegation
    if (EU_MEMBER_STATE_CODES.has(lower.slice(0, 2)) && lower.length === 2) {
        return 'national_delegation';
    }
    return 'eu_institution'; // Safe default for unknown actors
}
/**
 * Register an actor in the registry, ignoring duplicates (by lowercased name).
 *
 * @param registry - Deduplication registry
 * @param name - Actor name
 * @param role - Actor's role in this context
 * @param actorType - Structural actor category
 * @param influence - Actor's influence level
 */
function addActor(registry, name, role, actorType, influence) {
    const key = name.toLowerCase().trim();
    if (!key || registry.has(key))
        return;
    registry.set(key, { name, actorType, role, influence, position: 'ambiguous' });
}
/**
 * Add actors extracted from legislative documents (rapporteurs and committees).
 *
 * @param registry - Deduplication registry
 * @param documents - Legislative documents from MCP
 */
function addDocumentActors(registry, documents) {
    for (const doc of documents ?? []) {
        const rapporteur = asStr(doc.rapporteur);
        if (rapporteur) {
            addActor(registry, rapporteur, `Rapporteur for: ${asStr(doc.title)}`, 'individual_mep', 'high');
        }
        const committee = asStr(doc.committee);
        if (committee) {
            addActor(registry, committee, 'Responsible committee', 'eu_institution', 'moderate');
        }
    }
}
/**
 * Add actors extracted from voting patterns (political groups).
 *
 * @param registry - Deduplication registry
 * @param patterns - Voting patterns from MCP
 */
function addVotingPatternActors(registry, patterns) {
    for (const pattern of patterns ?? []) {
        const group = asStr(pattern.group);
        if (!group)
            continue;
        const cohesion = asNum(pattern.cohesion, 0.5);
        const influence = cohesion > 0.8 ? 'high' : cohesion > 0.6 ? 'moderate' : 'low';
        addActor(registry, group, 'Voting group (cohesion analysis)', 'political_group', influence);
    }
}
/**
 * Add actors extracted from coalition data (member political groups).
 *
 * @param registry - Deduplication registry
 * @param coalitions - Coalition intelligence data
 */
function addCoalitionActors(registry, coalitions) {
    for (const coalition of coalitions ?? []) {
        for (const group of coalition.groups ?? []) {
            const g = asStr(group);
            if (g)
                addActor(registry, g, 'Coalition member', 'political_group', 'high');
        }
    }
}
/**
 * Add actors extracted from MEP influence scores.
 *
 * @param registry - Deduplication registry
 * @param mepScores - MEP influence scores from MCP
 */
function addMEPActors(registry, mepScores) {
    for (const mep of mepScores ?? []) {
        const name = asStr(mep.mepName);
        if (!name)
            continue;
        const score = asNum(mep.overallScore, 0);
        const influence = score > 75 ? 'high' : score > 50 ? 'moderate' : 'low';
        addActor(registry, name, 'Individual MEP (influence scored)', 'individual_mep', influence);
    }
}
/**
 * Add actors extracted from committee meetings (EU institution bodies).
 *
 * @param registry - Deduplication registry
 * @param committees - Committee meetings from MCP
 */
function addCommitteeActors(registry, committees) {
    for (const meeting of committees ?? []) {
        const name = asStr(meeting.committeeName) || asStr(meeting.committee);
        if (name) {
            addActor(registry, name, 'Parliamentary committee', 'eu_institution', 'moderate');
        }
    }
}
/**
 * Add actors extracted from parliamentary questions (question authors).
 *
 * @param registry - Deduplication registry
 * @param questions - Parliamentary questions from MCP
 */
function addQuestionActors(registry, questions) {
    for (const q of questions ?? []) {
        const author = asStr(q.author);
        if (!author)
            continue;
        const actorType = inferActorType(author);
        const topic = asStr(q.subject) || asStr(q.topic);
        addActor(registry, author, `Author of parliamentary question: ${topic}`, actorType, 'low');
    }
}
/**
 * Classify political actors identified in parliamentary data.
 *
 * Combines rapporteurs, voting group names, committee names, and MEP identifiers
 * into a unified actor taxonomy. Deduplicates by name (case-insensitive).
 *
 * @param data - Parliamentary data from any article type
 * @returns Array of classified political actors, deduplicated by name
 *
 * @example
 * ```ts
 * const actors = classifyPoliticalActors({ documents: [...], votingPatterns: [...] });
 * actors.forEach(a => console.log(a.name, a.actorType));
 * ```
 */
export function classifyPoliticalActors(data) {
    const registry = new Map();
    addDocumentActors(registry, data.documents);
    addVotingPatternActors(registry, data.votingPatterns);
    addCoalitionActors(registry, data.coalitions);
    addMEPActors(registry, data.mepScores);
    addCommitteeActors(registry, data.committees);
    addQuestionActors(registry, data.questions);
    return Array.from(registry.values());
}
// ─── Political Forces Analysis ────────────────────────────────────────────────
/**
 * Build a ForceAssessment for a named political force.
 *
 * @param description - Qualitative description of the force
 * @param strength - Normalised strength in [0, 1]
 * @param trend - Direction of the force
 * @param keyActors - Names of actors driving the force
 * @param confidence - Confidence in the assessment
 * @returns Immutable ForceAssessment
 */
function makeForceAssessment(description, strength, trend, keyActors, confidence) {
    return { description, strength: clamp01(strength), trend, keyActors, confidence };
}
/**
 * Analyze political forces shaping a parliamentary event.
 *
 * Adapted from Porter's Five Forces as referenced in the ISMS Classification
 * framework, mapping parliamentary power dynamics to five structural forces:
 * coalition power, opposition power, institutional barriers, public pressure,
 * and external influences.
 *
 * @param data - Parliamentary data from any article type
 * @returns Political forces analysis with strength and trend per force
 *
 * @example
 * ```ts
 * const forces = analyzePoliticalForces({ coalitions: [...], votingAnomalies: [...] });
 * console.log(forces.coalitionPower.strength); // 0.82
 * ```
 */
export function analyzePoliticalForces(data) {
    const coalitions = data.coalitions ?? [];
    const anomalies = mergeAnomalies(data);
    const procedures = data.procedures ?? [];
    const questions = data.questions ?? [];
    const votes = data.votingRecords ?? [];
    const patterns = data.votingPatterns ?? [];
    // ── Coalition Power ──────────────────────────────────────────────────────────
    const avgCohesion = coalitions.length > 0
        ? clamp01(coalitions.reduce((sum, c) => sum + asNum(c.cohesionScore, 0.7), 0) / coalitions.length)
        : 0.5;
    const coalitionTrend = coalitions.some((c) => asStr(c.alignmentTrend).toLowerCase() === 'strengthening')
        ? 'increasing'
        : coalitions.some((c) => asStr(c.alignmentTrend).toLowerCase() === 'weakening')
            ? 'decreasing'
            : 'stable';
    const coalitionActors = coalitions
        .flatMap((c) => c.groups ?? [])
        .slice(0, 5)
        .map(String);
    const coalitionPower = makeForceAssessment('Governing coalition strength — ability to pass or block legislation', avgCohesion, coalitionTrend, coalitionActors, coalitions.length > 0 ? 'high' : 'low');
    // ── Opposition Power ─────────────────────────────────────────────────────────
    const oppositionVotes = votes.filter((v) => {
        const t = totalVotes(v.votes);
        if (t === 0)
            return false;
        return asNum(v.votes?.against) / t > 0.3; // ≥30% against = meaningful opposition
    }).length;
    const oppositionStrength = clamp01((oppositionVotes / Math.max(votes.length, 1)) * 1.5);
    const oppositionTrend = anomalies.some((a) => asStr(a.severity).toLowerCase() === 'critical')
        ? 'increasing'
        : 'stable';
    const lowCohesionGroups = patterns
        .filter((p) => asNum(p.cohesion, 0.8) < 0.6)
        .map((p) => asStr(p.group))
        .filter(Boolean)
        .slice(0, 4);
    const oppositionPower = makeForceAssessment('Opposition effectiveness — capacity to challenge or delay proceedings', oppositionStrength, oppositionTrend, lowCohesionGroups, votes.length > 0 ? 'medium' : 'low');
    // ── Institutional Barriers ───────────────────────────────────────────────────
    const bottlenecks = procedures.filter((p) => p.bottleneck === true).length;
    const earlyStages = procedures.filter((p) => {
        const stage = asStr(p.stage).toLowerCase();
        return stage === 'committee' || stage === 'first reading';
    }).length;
    const barrierStrength = clamp01(bottlenecks * 0.35 + earlyStages * 0.1);
    const barrierTrend = bottlenecks > 2 ? 'increasing' : 'stable';
    const stalledProcedures = procedures
        .filter((p) => p.bottleneck === true)
        .map((p) => asStr(p.title))
        .filter(Boolean)
        .slice(0, 3);
    const institutionalBarriers = makeForceAssessment('Procedural and institutional constraints on political action', barrierStrength, barrierTrend, stalledProcedures, procedures.length > 0 ? 'medium' : 'low');
    // ── Public Pressure ──────────────────────────────────────────────────────────
    const oralQuestions = questions.filter((q) => asStr(q.type).toLowerCase() === 'oral').length;
    const publicScore = clamp01(oralQuestions / 8 + anomalies.length / 10);
    const publicActors = questions
        .map((q) => asStr(q.author))
        .filter(Boolean)
        .slice(0, 4);
    const publicPressure = makeForceAssessment('Civil society and media pressure on political actors', publicScore, oralQuestions > 3 ? 'increasing' : 'stable', publicActors, questions.length > 0 ? 'medium' : 'low');
    // ── External Influences ──────────────────────────────────────────────────────
    const externalProcedures = procedures.filter((p) => EXTERNAL_KEYWORDS.some((kw) => asStr(p.title).toLowerCase().includes(kw))).length;
    const externalEvents = (data.events ?? []).filter((e) => EXTERNAL_KEYWORDS.some((kw) => asStr(e.title).toLowerCase().includes(kw) || asStr(e.description).toLowerCase().includes(kw))).length;
    const externalScore = clamp01(externalProcedures * 0.3 + externalEvents * 0.2);
    const externalInfluences = makeForceAssessment('External geopolitical factors influencing internal EU dynamics', externalScore, externalProcedures > 0 ? 'increasing' : 'stable', [], externalProcedures + externalEvents > 0 ? 'medium' : 'low');
    return {
        coalitionPower,
        oppositionPower,
        institutionalBarriers,
        publicPressure,
        externalInfluences,
    };
}
// ─── Analysis directory & file utilities ─────────────────────────────────────
/**
 * Initialize the `analysis-output/{date}/` directory structure.
 *
 * Creates the following sub-directories if they do not already exist:
 * - `classification/`  — Political classification results
 * - `data/`            — Raw downloaded data cache
 *
 * @param baseDir - Base directory for analysis output (typically `analysis-output/`)
 * @param date - ISO date string used as the run folder name (YYYY-MM-DD).
 *   Must match `^\d{4}-\d{2}-\d{2}$`; rejects path-separator or traversal values.
 * @returns Path to the date-stamped run directory (relative or absolute depending on baseDir)
 * @throws {Error} If `date` does not match `YYYY-MM-DD` format
 *
 * @example
 * ```ts
 * const runDir = initializeAnalysisDirectory('./analysis-output', '2026-03-26');
 * // Creates: ./analysis-output/2026-03-26/classification/
 * //          ./analysis-output/2026-03-26/data/
 * ```
 */
export function initializeAnalysisDirectory(baseDir, date) {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
        throw new Error(`Invalid date format: "${date}" — expected YYYY-MM-DD`);
    }
    const runDir = path.join(baseDir, date);
    const subdirs = ['classification', 'data'];
    for (const sub of subdirs) {
        fs.mkdirSync(path.join(runDir, sub), { recursive: true });
    }
    return runDir;
}
// ─── YAML Frontmatter ─────────────────────────────────────────────────────────
/**
 * Serialize an AnalysisFrontmatter object to a YAML block string.
 *
 * Produces a deterministic, human-readable YAML block suitable for prepending
 * to markdown analysis files. Array values are written as YAML sequences.
 *
 * @param fm - Frontmatter data to serialize
 * @returns YAML block string delimited by `---` markers
 *
 * @example
 * ```ts
 * const yaml = serializeFrontmatter({ title: 'Assessment', date: '2026-03-26', ... });
 * // Returns: "---\ntitle: \"Assessment\"\ndate: \"2026-03-26\"\n..."
 * ```
 */
export function serializeFrontmatter(fm) {
    const lines = ['---'];
    lines.push(`title: "${escapeYamlString(fm.title)}"`);
    lines.push(`date: "${escapeYamlString(fm.date)}"`);
    lines.push(`analysisType: "${escapeYamlString(fm.analysisType)}"`);
    lines.push(`significance: "${escapeYamlString(fm.significance)}"`);
    lines.push(`confidence: "${escapeYamlString(fm.confidence)}"`);
    if (fm.methods.length > 0) {
        lines.push('methods:');
        for (const m of fm.methods) {
            lines.push(`  - "${escapeYamlString(m)}"`);
        }
    }
    else {
        lines.push('methods: []');
    }
    if (fm.articleTypes.length > 0) {
        lines.push('articleTypes:');
        for (const t of fm.articleTypes) {
            lines.push(`  - "${escapeYamlString(t)}"`);
        }
    }
    else {
        lines.push('articleTypes: []');
    }
    lines.push('---');
    return lines.join('\n');
}
// ─── Markdown writer ──────────────────────────────────────────────────────────
/**
 * Write an analysis markdown file with YAML frontmatter.
 *
 * Creates parent directories as needed. The file is written atomically via
 * temp-file-then-rename (see {@link atomicWrite}) to avoid partial writes on
 * crash or interruption. Any existing file at the path will be overwritten.
 *
 * @param filePath - Absolute or relative path of the markdown file to write
 * @param frontmatter - Structured frontmatter metadata
 * @param content - Markdown body content (without frontmatter)
 *
 * @example
 * ```ts
 * writeAnalysisFile('./analysis-output/2026-03-26/classification/significance-assessment.md', fm, body);
 * ```
 */
export function writeAnalysisFile(filePath, frontmatter, content) {
    const yaml = serializeFrontmatter(frontmatter);
    atomicWrite(filePath, `${yaml}\n\n${content}`);
}
// ─── Manifest writer ──────────────────────────────────────────────────────────
/**
 * Write the analysis run manifest to `{runDir}/manifest.json`.
 *
 * The manifest records the run metadata for downstream consumers of the
 * analysis output, including the framework version, article types analysed,
 * and methods applied.
 *
 * @param runDir - Date-stamped run directory (from {@link initializeAnalysisDirectory})
 * @param articleTypes - Article types included in this run
 * @param methodsUsed - Classification methods applied
 * @param startDate - Optional ISO timestamp for when the run started; defaults to now
 * @returns The completed manifest object
 *
 * @example
 * ```ts
 * const manifest = writeAnalysisManifest(
 *   runDir,
 *   [ArticleCategory.COMMITTEE_REPORTS],
 *   ['impact-matrix']
 * );
 * ```
 */
export function writeAnalysisManifest(runDir, articleTypes, methodsUsed, startDate) {
    const now = new Date().toISOString();
    const manifest = {
        runDate: startDate ?? now,
        frameworkVersion: FRAMEWORK_VERSION,
        articleTypes: [...articleTypes],
        methodsUsed: [...methodsUsed],
        completedAt: now,
    };
    fs.mkdirSync(runDir, { recursive: true });
    atomicWrite(path.join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    return manifest;
}
// ─── Significance rank helpers ────────────────────────────────────────────────
/**
 * Compare two PoliticalSignificance levels.
 *
 * @param a - First significance level
 * @param b - Second significance level
 * @returns Positive if a > b, negative if a < b, 0 if equal
 *
 * @example
 * ```ts
 * compareSignificance('critical', 'notable'); // > 0
 * ```
 */
export function compareSignificance(a, b) {
    return SIGNIFICANCE_ORDER.indexOf(a) - SIGNIFICANCE_ORDER.indexOf(b);
}
/**
 * Return the highest significance level from an array of levels.
 * Returns `'routine'` for an empty array.
 *
 * @param levels - Array of significance levels to compare
 * @returns Highest significance level found
 *
 * @example
 * ```ts
 * maxSignificance(['notable', 'critical', 'significant']); // 'critical'
 * ```
 */
export function maxSignificance(levels) {
    if (levels.length === 0)
        return 'routine';
    return levels.reduce((max, cur) => SIGNIFICANCE_ORDER.indexOf(cur) > SIGNIFICANCE_ORDER.indexOf(max) ? cur : max);
}
//# sourceMappingURL=political-classification.js.map