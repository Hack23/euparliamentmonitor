// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/BriefingHighlight
 * @description Highlight extractor specialised on the executive-brief
 * style guide introduced for the May-2026 EP10 briefing series. Where
 * {@link editorial-highlight.ts} treats every Stage-B artefact uniformly
 * (first non-generic H1 → headline; first prose paragraph → summary),
 * this module knows that an `executive-brief.md` carries two strong
 * editorial sections that should outrank a generic `## Key Findings`
 * walk:
 *
 *   1. `## Strategic Intelligence Summary` — the synthesis paragraph.
 *      The first `### Sub-section` heading underneath it (e.g.
 *      "The Three-Coalition Paradox") makes a clean, journalistic
 *      `<title>`. The first prose paragraph that follows that
 *      sub-heading makes a clean `<meta description>`.
 *
 *   2. `## Reader Briefing` (a.k.a. `Reader Briefing (Plain Language)`)
 *      — the actionable priority list. When the section is structured
 *      as a numbered list (`1. **Immediate priority**: …`), the bold
 *      label + tail of the first item makes a strong `<title>`. When
 *      it is structured as a single prose paragraph (the
 *      term-outlook style), the paragraph is used verbatim as
 *      description and the first sentence becomes the headline.
 *
 * Both extractors are tolerant of missing sections — they return
 * `null` so the resolver can fall back to the existing
 * `extractArtifactHighlight` ladder for the 200+ historical briefs
 * that pre-date this style guide.
 *
 * Pure leaf module under `metadata/` — depends only on
 * {@link stripInlineMarkdown}, {@link truncateTitle},
 * {@link truncateDescription}, and {@link truncateExtendedDescription}
 * from `text-utils`. No I/O, no upward imports.
 */
import { EXTENDED_DESCRIPTION_MAX_LENGTH, shouldSkipDescriptionLine, stripInlineMarkdown, stripLeadingBoldLabel, stripLeadingProseLabel, truncateDescription, truncateExtendedDescription, truncateTitle, } from './text-utils.js';
/** Heading text that opens the Strategic Intelligence Summary block. */
const STRATEGIC_SECTION_HEADINGS = [
    'strategic intelligence summary',
    'strategic assessment',
    'intelligence assessment',
    'headline assessment',
    'bluf',
    'bottom line up front',
    'top line assessment',
    'top line',
    'critical findings',
    'key judgements',
    'key judgments',
    'five key judgments',
    'five key judgements',
    'situation assessment',
    'priority intelligence requirements',
    'most significant breaking development',
    'most significant',
    'principal intelligence assessment',
    'summary assessment',
    'strategic synthesis',
    'wep assessment summary',
    'strategic context',
    'conclusion',
];
/** Heading text that opens the Reader Briefing block. */
const READER_BRIEFING_HEADINGS = [
    'reader briefing',
    'reader briefing (plain language)',
    'reader briefing — plain language',
];
/**
 * Classify a trimmed Markdown line into one of the structural buckets
 * the section walker cares about. Extracted from the inline walker
 * loops to keep their cognitive complexity below the 15-point limit.
 *
 * @param line - Trimmed Markdown line
 * @returns Line kind sentinel
 */
function classifyLine(line) {
    if (line.startsWith('```') || line.startsWith('~~~'))
        return 'fence';
    if (line.startsWith('## '))
        return 'h2';
    if (line.startsWith('### '))
        return 'h3';
    if (line === '')
        return 'blank';
    if (line.startsWith('|') || line.startsWith('>') || line.startsWith('<'))
        return 'structural';
    if (line.startsWith('---') || line.startsWith('==='))
        return 'structural';
    if (/^\d+\.\s+/u.test(line))
        return 'numbered';
    if (line.startsWith('-') || line.startsWith('*'))
        return 'bullet';
    return 'prose';
}
/**
 * Compare a raw `## …` heading line against a whitelist of expected
 * section names. The comparison strips inline Markdown decorations and
 * leading non-alphanumeric characters (emoji, punctuation) so a brief
 * that writes the heading as `## 🧭 Strategic Intelligence Summary`
 * still matches.
 *
 * @param raw - Heading text without the leading `#`s
 * @param needles - Lower-case whitelist entries
 * @returns `true` when the heading text matches any whitelist entry
 */
function headingMatches(raw, needles) {
    const normalized = stripInlineMarkdown(raw)
        .replace(/[*_`#]+/g, '')
        .replace(/^[^A-Za-z0-9]+/, '')
        // Strip leading numeric list prefix (e.g. "1. ", "7. ")
        .replace(/^\d+\.\s+/, '')
        .trim()
        .toLowerCase();
    for (const needle of needles) {
        if (normalized === needle)
            return true;
        if (normalized.startsWith(`${needle} `))
            return true;
        if (normalized.startsWith(`${needle}:`))
            return true;
        if (normalized.startsWith(`${needle}(`))
            return true;
        // Em-dash, en-dash, hyphen separators.
        if (normalized.startsWith(`${needle} —`))
            return true;
        if (normalized.startsWith(`${needle} –`))
            return true;
        if (normalized.startsWith(`${needle} -`))
            return true;
    }
    return false;
}
/**
 * Build an empty walker state.
 *
 * @returns Fresh, fence-aware {@link WalkerState} with empty buffers.
 */
function newState() {
    return { inFence: false, inSection: false, subHeading: '', lines: [], byteCount: 0 };
}
/**
 * Push a prose line into the walker's collected buffer.
 *
 * @param state - Walker state (mutated)
 * @param line - Cleaned line to append
 */
function appendLine(state, line) {
    state.lines.push(line);
    state.byteCount += line.length + 1;
}
/**
 * Strip intelligence tradecraft labels (WEP probability bands, KJ-N
 * prefixes, Admiralty grades) from a paragraph so they don't pollute
 * reader-facing headlines. These are analyst-internal markers that
 * readers find confusing.
 *
 * @param text - Raw paragraph text
 * @returns Text with tradecraft labels removed
 */
function stripTradecraftLabels(text) {
    return text
        // "KJ-1 [WEP: HIGHLY LIKELY, 90–95%]: " prefix
        .replace(/^KJ-?\d+\s*\[.*?\]:\s*/iu, '')
        // "[WEP: LIKELY (60-75%)]" or "(WEP Probable, 60–75% confidence)" inline
        .replace(/\[WEP:?\s*[^\]]+\]\s*/giu, '')
        .replace(/\(WEP\s+[^)]+\)\s*/giu, '')
        // "Admiralty Grade: B2" or similar
        .replace(/Admiralty\s+(?:Source\s+)?Grade:?\s*[A-Z]\d\s*/giu, '')
        // Leading numbered list prefix "1. ", "2. " etc.
        .replace(/^\d+\.\s+/, '')
        // "(Admiralty B2)" or "*(Admiralty B2)*" trailing references
        .replace(/\*?\(Admiralty\s+[A-Z]\d\)\*?\s*$/giu, '')
        .trim();
}
/**
 * Boilerplate sentence patterns that should never surface as headlines
 * or descriptions. These are self-referential meta-prose that describes
 * the brief itself rather than the substantive intelligence content.
 */
const BOILERPLATE_PATTERNS = [
    /^this (?:executive )?brief (?:synthesi[sz]es|provides|covers|summariz|presents|contains|offers)/iu,
    /^this (?:report|document|analysis|assessment) (?:synthesi[sz]es|provides|covers|summariz|presents)/iu,
    /^the brief is designed to be read/iu,
    /^all forward-looking assessments are/iu,
    /^confidence:/iu,
    /^admiralty (?:source )?grade/iu,
    /^classification:/iu,
    /^data[\s-]?mode/iu,
    /^key assessments?\s*\(/iu,
    /^overall (?:admiralty|assessment) grade/iu,
    /^sats? applied/iu,
    /^generated by (?:eu parliament|automated)/iu,
    /^subject:/iu,
];
function normalizeBriefingLine(line, preserveLeadingLabel = false) {
    if (shouldSkipDescriptionLine(line))
        return '';
    const withoutMarkdown = stripInlineMarkdown(line);
    if (BOILERPLATE_PATTERNS.some((re) => re.test(withoutMarkdown.trim())))
        return '';
    // Strip tradecraft labels from the normalized output.
    const stripped = stripTradecraftLabels(withoutMarkdown);
    const normalized = preserveLeadingLabel
        ? stripped
        : stripLeadingProseLabel(stripLeadingBoldLabel(stripped));
    return normalized.replace(/^[:;—–-]\s+/u, '').trim();
}
/**
 * Decide what to do when the walker sees a `## …` heading.
 *
 * @param state - Walker state
 * @param raw - Raw heading line (already trimmed)
 * @param needles - Lower-case section whitelist
 * @returns `'enter'` when the heading opens the target section,
 *          `'leave'` when it closes an already-open target section,
 *          `'skip'` otherwise.
 */
function transitionForH2(state, raw, needles) {
    const headingText = raw.replace(/^##\s+/, '');
    if (headingMatches(headingText, needles))
        return 'enter';
    if (state.inSection)
        return 'leave';
    return 'skip';
}
/**
 * Handle a `## …` line for the sub-section walker. Returns `true`
 * when the caller should stop walking.
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed `## …` line
 * @param needles - Section whitelist
 * @returns `true` to stop walking
 */
function handleH2ForSubsection(state, line, needles) {
    const t = transitionForH2(state, line, needles);
    if (t === 'enter') {
        state.inSection = true;
        state.subHeading = '';
        state.lines.length = 0;
        state.byteCount = 0;
        return false;
    }
    if (t === 'leave') {
        if (state.subHeading && state.lines.length > 0)
            return true;
        state.inSection = false;
    }
    return false;
}
/**
 * Walk the brief body line-by-line and return the first `### …`
 * heading + its first prose paragraph that occur **inside** the
 * matched `## …` block. Returns `null` when the matched block does
 * not contain a `### …` sub-heading.
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param sectionNeedles - Lower-case `## …` whitelist
 * @returns First `{subHeading, paragraph}` pair under the matched
 *          section, or `null` when no sub-heading exists
 */
function extractFirstSubsectionUnderSection(markdown, sectionNeedles) {
    const state = newState();
    for (const raw of markdown.split('\n')) {
        const line = raw.trim();
        const kind = classifyLine(line);
        if (kind === 'fence') {
            state.inFence = !state.inFence;
            continue;
        }
        if (state.inFence)
            continue;
        if (kind === 'h2') {
            if (handleH2ForSubsection(state, line, sectionNeedles))
                break;
            continue;
        }
        if (!state.inSection)
            continue;
        if (collectSubsectionLine(state, line, kind))
            break;
    }
    if (!state.subHeading || state.lines.length === 0)
        return null;
    return {
        subHeading: state.subHeading.trim(),
        paragraph: state.lines.join(' ').trim(),
    };
}
/**
 * Process one non-heading line inside the matched section for the
 * sub-section extractor. Returns `true` to signal the caller should
 * stop walking (paragraph boundary reached or budget exceeded).
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed line being processed
 * @param kind - Pre-classified line kind from {@link classifyLine}
 * @returns `true` to stop walking
 */
function collectSubsectionLine(state, line, kind) {
    if (kind === 'h3') {
        if (state.subHeading && state.lines.length > 0)
            return true;
        state.subHeading = stripInlineMarkdown(line.replace(/^###\s+/, ''));
        state.lines.length = 0;
        state.byteCount = 0;
        return false;
    }
    if (!state.subHeading)
        return false;
    if (kind === 'blank' || kind === 'structural') {
        return state.lines.length > 0;
    }
    const clean = normalizeBriefingLine(line);
    if (!clean)
        return state.lines.length > 0;
    appendLine(state, clean);
    return state.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH;
}
/**
 * Walk the brief body and return the first prose paragraph that occurs
 * **inside** the matched `## …` block (ignoring any `### …`
 * sub-headings). Used as the fallback extractor when the section is a
 * single-paragraph block (the term-outlook Reader Briefing style).
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @param sectionNeedles - Lower-case `## …` whitelist
 * @returns First prose paragraph, or empty string when absent
 */
function extractFirstParagraphUnderSection(markdown, sectionNeedles) {
    const state = newState();
    for (const raw of markdown.split('\n')) {
        const line = raw.trim();
        const kind = classifyLine(line);
        if (kind === 'fence') {
            state.inFence = !state.inFence;
            continue;
        }
        if (state.inFence)
            continue;
        if (kind === 'h2') {
            if (handleH2ForParagraph(state, line, sectionNeedles))
                break;
            continue;
        }
        if (!state.inSection || kind === 'h3')
            continue;
        if (collectParagraphLine(state, line, kind))
            break;
    }
    return state.lines.length === 0 ? '' : state.lines.join(' ').trim();
}
/**
 * Handle a `## …` line for the first-paragraph walker. Returns `true`
 * when the caller should stop walking (a complete paragraph was
 * already captured in a prior matched section).
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed `## …` line
 * @param needles - Section whitelist
 * @returns `true` to stop walking
 */
function handleH2ForParagraph(state, line, needles) {
    if (state.inSection && state.lines.length > 0)
        return true;
    const t = transitionForH2(state, line, needles);
    state.inSection = t === 'enter';
    return false;
}
/**
 * Process one non-heading line inside the matched section for the
 * first-paragraph extractor. Returns `true` when the caller should
 * stop walking.
 *
 * @param state - Walker state (mutated)
 * @param line - Trimmed line being processed
 * @param kind - Pre-classified line kind from {@link classifyLine}
 * @returns `true` to stop walking
 */
function collectParagraphLine(state, line, kind) {
    if (kind === 'blank' || kind === 'structural') {
        return state.lines.length > 0;
    }
    const clean = normalizeBriefingLine(line);
    if (!clean)
        return state.lines.length > 0;
    appendLine(state, clean);
    return state.byteCount >= EXTENDED_DESCRIPTION_MAX_LENGTH;
}
/**
 * Walk the brief body and return the first numbered-list item that
 * appears **inside** the matched `## …` block. Recognises the
 * `1. **Immediate priority**: …` shape used by the May-2026
 * Reader Briefing style guide. The bold label and tail are joined into
 * a single headline-shaped string.
 *
 * @param markdown - Brief body
 * @param sectionNeedles - `## …` whitelist
 * @returns Flattened first list item, or empty string when absent
 */
function extractFirstNumberedItemUnderSection(markdown, sectionNeedles) {
    const state = { inFence: false, inSection: false, item: [] };
    for (const raw of markdown.split('\n')) {
        const line = raw.trim();
        const kind = classifyLine(line);
        if (kind === 'fence') {
            state.inFence = !state.inFence;
            continue;
        }
        if (state.inFence)
            continue;
        if (kind === 'h2') {
            if (state.inSection && state.item.length > 0)
                break;
            const headingText = line.replace(/^##\s+/, '');
            state.inSection = headingMatches(headingText, sectionNeedles);
            continue;
        }
        if (!state.inSection)
            continue;
        if (handleNumberedLine(state, line, kind))
            break;
    }
    return state.item.join(' ').trim();
}
/**
 * Process one line inside the matched section for the numbered-item
 * extractor. Returns `true` when the caller should stop walking.
 *
 * @param state - Numbered-item walker state (mutated)
 * @param line - Trimmed line being processed
 * @param kind - Pre-classified line kind from {@link classifyLine}
 * @returns `true` to stop walking
 */
function handleNumberedLine(state, line, kind) {
    if (state.item.length === 0) {
        if (kind !== 'numbered')
            return false;
        const m = /^1\.\s+(.*)$/u.exec(line);
        const clean = m?.[1] ? normalizeBriefingLine(m[1], true) : '';
        if (clean)
            state.item.push(clean);
        return false;
    }
    if (kind === 'blank' || kind === 'numbered' || kind === 'bullet')
        return true;
    if (kind === 'h2' || kind === 'h3')
        return true;
    const clean = normalizeBriefingLine(line);
    if (!clean)
        return state.item.length > 0;
    state.item.push(clean);
    return false;
}
/**
 * Extract the {@link BriefingHighlight} for a `## Strategic
 * Intelligence Summary` (or compatible) section. Prefers the first
 * `### Sub-section` heading as headline; falls back to the section's
 * first prose paragraph when no sub-heading exists.
 *
 * @param markdown - Brief body
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractStrategicSynthesisHighlight(markdown) {
    const sub = extractFirstSubsectionUnderSection(markdown, STRATEGIC_SECTION_HEADINGS);
    if (sub) {
        return {
            headline: truncateTitle(stripTradecraftLabels(sub.subHeading)),
            summary: truncateDescription(sub.paragraph),
            extendedSummary: truncateExtendedDescription(sub.paragraph),
        };
    }
    const paragraph = extractFirstParagraphUnderSection(markdown, STRATEGIC_SECTION_HEADINGS);
    if (!paragraph)
        return null;
    // Derive a headline from the paragraph. Try the first sentence first;
    // if truncateTitle returns '' (sentence too long with no clean clause
    // boundary), try progressively shorter sub-clauses separated by commas
    // or dashes that still clear the HEADLINE_HARD_MIN floor (30 chars).
    const headline = deriveHeadlineFromParagraph(paragraph);
    return {
        headline,
        summary: truncateDescription(paragraph),
        extendedSummary: truncateExtendedDescription(paragraph),
    };
}
/**
 * Patterns that indicate a "news hook" — the most compelling claim in a
 * paragraph. Journalist editors call this the "nut graf" or "top line."
 * We extract the sentence or clause containing these signals.
 */
const NEWS_HOOK_PATTERNS = [
    /\blandmark\b/i,
    /\bmost (?:significant|consequential|ambitious|contentious|comprehensive)\b/i,
    /\bunprecedented\b/i,
    /\bhistoric(?:ally)?\b/i,
    /\bfirst[\s-](?:ever|time)\b/i,
    /\boverhaul\b/i,
    /\breshape[sd]?\b/i,
    /\brecord[\s-]/i,
    /\bsweeping\b/i,
    /\bbreakthrough\b/i,
    /\bparadox\b/i,
    /\bgame[\s-]chang/i,
    /\bturning[\s-]point\b/i,
    /\bcrisis\b/i,
    /\bshowdown\b/i,
    /\bfracture[sd]?\b/i,
];
/**
 * Extract the most newsworthy sentence from a paragraph. Looks for
 * sentences containing strong editorial signals (superlatives, novelty
 * claims, dramatic verbs) rather than always taking the first sentence
 * which is typically bland context-setting.
 *
 * @param paragraph - Cleaned paragraph text
 * @returns The most compelling sentence, or '' if none found
 */
function extractNewsHookSentence(paragraph) {
    // Split into sentences (handles ". ", "! ", "? " boundaries)
    const sentences = paragraph
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.length > 20);
    // Find the first sentence with a news hook signal
    for (const sentence of sentences) {
        if (NEWS_HOOK_PATTERNS.some((re) => re.test(sentence))) {
            const result = truncateTitle(sentence);
            if (result)
                return result;
        }
    }
    return '';
}
/**
 * Derive a usable headline from a paragraph when no explicit `### …`
 * sub-heading is available. Uses a journalist's editorial hierarchy:
 *
 * 1. Find the sentence with the strongest news hook (superlatives, novelty)
 * 2. Fall back to the first sentence via `truncateTitle`
 * 3. Extract a clause at a natural boundary (comma, semicolon, dash)
 * 5. Hard-cut at word boundary as last resort
 *
 * @param paragraph - Source paragraph (already normalized)
 * @returns Headline string, or `''` when no usable clause can be derived
 */
function deriveHeadlineFromParagraph(paragraph) {
    // Strip tradecraft labels before headline derivation.
    const cleaned = stripTradecraftLabels(paragraph);
    // Priority 1: Find the most newsworthy sentence (superlatives, drama).
    const newsHook = extractNewsHookSentence(cleaned);
    if (newsHook)
        return newsHook;
    // Priority 3: First sentence via truncateTitle.
    const direct = truncateTitle(cleaned);
    if (direct)
        return direct;
    // Priority 4: Extract the first sentence and try truncateTitle.
    const sentenceMatch = /^(.*?[.!?])(?:\s|$)/.exec(cleaned);
    if (sentenceMatch?.[1]) {
        const sentenceResult = truncateTitle(sentenceMatch[1]);
        if (sentenceResult)
            return sentenceResult;
    }
    // Priority 5: Take text up to first significant clause separator.
    const CLAUSE_SEPARATORS = [', ', '; ', ' — ', ' – ', ' - '];
    for (const sep of CLAUSE_SEPARATORS) {
        const idx = cleaned.indexOf(sep, 30);
        if (idx > 0 && idx <= 140) {
            return cleaned.slice(0, idx).trim();
        }
    }
    // Final fallback: hard-cut at 120 chars on a word boundary.
    if (cleaned.length > 120) {
        const slice = cleaned.slice(0, 120);
        const lastSpace = slice.lastIndexOf(' ');
        if (lastSpace > 60)
            return slice.slice(0, lastSpace).trim();
    }
    return cleaned.length <= 140 ? cleaned : '';
}
/**
 * Extract the {@link BriefingHighlight} for a `## Reader Briefing` (or
 * compatible) section. Prefers the first numbered-list item as
 * headline when the section is structured as a priority list; falls
 * back to the first prose paragraph when it is written as plain prose
 * (the term-outlook style).
 *
 * @param markdown - Brief body
 * @returns Resolved highlight, or `null` when the section is absent
 */
export function extractReaderBriefingHighlight(markdown) {
    const firstItem = extractFirstNumberedItemUnderSection(markdown, READER_BRIEFING_HEADINGS);
    const paragraph = extractFirstParagraphUnderSection(markdown, READER_BRIEFING_HEADINGS);
    if (!firstItem && !paragraph)
        return null;
    const headlineSource = firstItem || paragraph;
    const headline = headlineSource ? truncateTitle(headlineSource) : '';
    const summary = paragraph
        ? truncateDescription(paragraph)
        : firstItem
            ? truncateDescription(firstItem)
            : '';
    const extendedSummary = paragraph
        ? truncateExtendedDescription(paragraph)
        : truncateExtendedDescription(firstItem);
    if (!headline && !summary)
        return null;
    return { headline, summary, extendedSummary };
}
/**
 * Combined extractor that runs the Strategic Intelligence Summary path
 * first (highest editorial value) and falls back to Reader Briefing
 * when Strategic Intelligence Summary is absent. Merges the two so a
 * brief that contains **both** sections can use the strategic
 * sub-heading as headline and the reader-briefing prose as the
 * extended description.
 *
 * @param markdown - Brief body (SPDX preamble already stripped)
 * @returns Best `{headline, summary, extendedSummary}`, or `null`
 *          when neither section exists
 */
export function extractBriefingHighlight(markdown) {
    const strategic = extractStrategicSynthesisHighlight(markdown);
    const reader = extractReaderBriefingHighlight(markdown);
    if (!strategic && !reader)
        return null;
    if (strategic && reader) {
        return {
            headline: strategic.headline || reader.headline,
            summary: strategic.summary || reader.summary,
            extendedSummary: strategic.extendedSummary || reader.extendedSummary,
        };
    }
    return strategic ?? reader;
}
//# sourceMappingURL=briefing-highlight.js.map