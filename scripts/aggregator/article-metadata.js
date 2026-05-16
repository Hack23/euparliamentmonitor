// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/ArticleMetadata
 * @description Resolve per-language `{title, description}` for an article
 * rendered by the aggregator pipeline. The resolver follows a strict
 * priority ladder that prefers *real editorial highlights* over boring,
 * repeated templates — satisfying the core SEO requirement that every
 * published article carry a unique, content-reflective headline and
 * description in every language variant.
 *
 * Priority ladder (per language, highest wins) — matches the editorial
 * contract documented in
 * [`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md) § 6.2:
 *
 * 1. **Manifest override** — `manifest.title` / `manifest.description` on
 *    the analysis-run manifest, either as a plain string (applied to every
 *    language) or a `LanguageMap<string>` object for explicit per-language
 *    values.
 * 2. **Localized executive brief** — for non-English `<lang>`, the
 *    translated sibling `executive-brief_<lang>.md` (or
 *    `extended/executive-brief_<lang>.md`) under the run directory.
 *    Resolved via `editorial-brief-resolver.ts`. This is the authoritative
 *    localized source produced by the `news-translate` workflow.
 * 3. **English executive brief, verbatim** — the English brief
 *    (`executive-brief.md` / `extended/executive-brief.md`) used as a
 *    fall-through when a locale has no translated brief yet. Recorded in
 *    `metadataFallback[<lang>] = "en"` so editors can audit which locales
 *    fell through.
 * 4. **Artefact editorial H1** — first `# …` heading from the first
 *    substantive artefact under the run directory (e.g.
 *    `intelligence/synthesis-summary.md`, `breaking-news-analysis.md`).
 *    Accepted only when the heading is not a generic
 *    `${humanize(articleType)} — ${date}` form.
 * 5. **Aggregated-markdown H1** — the first `# …` heading in the aggregator
 *    output, accepted under the same non-generic rule.
 * 6. **First strong prose paragraph** — the first line of the aggregated
 *    Markdown that survives {@link shouldSkipDescriptionLine}.
 * 7. **Localized template** — the per-article-type `*_TITLES` generator
 *    from `src/constants/language-articles.ts`. Last resort.
 *
 * Tiers 2–6 produce the same shape ({headline, summary}); the resolver
 * picks the highest-available tier per language. When a localized brief
 * (tier 2) is present, the headline replaces the localized template
 * verbatim — no concatenation. Locales without a translated brief inherit
 * the English brief content (tier 3) so SEO surfaces never fall back to
 * boring type-level templates while real editorial content exists.
 */
import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES, getLocalizedString } from '../constants/language-core.js';
import { BREAKING_NEWS_TITLES, COMMITTEE_REPORTS_TITLES, ELECTION_CYCLE_TITLES, LOCALIZED_KEYWORDS, MONTH_AHEAD_TITLES, MONTHLY_REVIEW_TITLES, MOTIONS_TITLES, PROPOSITIONS_TITLES, QUARTER_AHEAD_TITLES, QUARTER_IN_REVIEW_TITLES, TERM_OUTLOOK_TITLES, WEEK_AHEAD_TITLES, WEEKLY_REVIEW_TITLES, YEAR_AHEAD_TITLES, YEAR_IN_REVIEW_TITLES, } from '../constants/language-articles.js';
import { resolveLocalizedBriefHighlight } from './editorial-brief-resolver.js';
/** Maximum `<meta description>` length we will emit. */
const DESCRIPTION_MAX_LENGTH = 180;
/** Target minimum `<meta description>` length before we append context. */
const DESCRIPTION_MIN_LENGTH = 140;
/**
 * Length below which a raw description is considered too short to stand
 * on its own and gets enriched with date/context. Independent from
 * {@link DESCRIPTION_MIN_LENGTH} (which controls sentence-boundary
 * truncation behaviour). Set lower than DESCRIPTION_MIN_LENGTH so a
 * clean 100-140 char prose lede is preserved verbatim instead of being
 * padded with date/context boilerplate.
 */
const ENRICHMENT_TRIGGER_LENGTH = 100;
/** Maximum `<title>` length — anything longer is truncated with an ellipsis. */
const TITLE_MAX_LENGTH = 140;
/** Localized labels used to enrich short or duplicate-prone meta descriptions. */
const SEO_CONTEXT_LABELS = {
    en: {
        context: 'Context',
        date: 'Published',
        run: 'analysis run',
        evidence: 'with source-linked voting, committee and legislative intelligence',
        reader: 'for democratic-accountability readers tracking EU institutional consequences',
    },
    sv: {
        context: 'Kontext',
        date: 'Publicerad',
        run: 'analyskörning',
        evidence: 'med källänkad röstnings-, utskotts- och lagstiftningsanalys',
        reader: 'för läsare som följer EU-institutionernas demokratiska konsekvenser',
    },
    da: {
        context: 'Kontekst',
        date: 'Udgivet',
        run: 'analysekørsel',
        evidence: 'med kildebelagt afstemnings-, udvalgs- og lovgivningsindblik',
        reader: 'for læsere, der følger EU-institutionernes demokratiske konsekvenser',
    },
    no: {
        context: 'Kontekst',
        date: 'Publisert',
        run: 'analysekjøring',
        evidence: 'med kildekoblet innsikt om avstemninger, komiteer og lovgivning',
        reader: 'for lesere som følger EU-institusjonenes demokratiske konsekvenser',
    },
    fi: {
        context: 'Konteksti',
        date: 'Julkaistu',
        run: 'analyysiajo',
        evidence: 'lähdelinkitetyllä äänestys-, valiokunta- ja lainsäädäntöanalyysillä',
        reader: 'lukijoille, jotka seuraavat EU-instituutioiden demokraattisia vaikutuksia',
    },
    de: {
        context: 'Kontext',
        date: 'Veröffentlicht',
        run: 'Analyselauf',
        evidence: 'mit quellengestützter Abstimmungs-, Ausschuss- und Gesetzgebungsanalyse',
        reader: 'für Leser, die demokratische Folgen der EU-Institutionen verfolgen',
    },
    fr: {
        context: 'Contexte',
        date: 'Publié',
        run: 'cycle d’analyse',
        evidence: 'avec analyse sourcée des votes, commissions et dossiers législatifs',
        reader: 'pour suivre les conséquences démocratiques des institutions de l’UE',
    },
    es: {
        context: 'Contexto',
        date: 'Publicado',
        run: 'ejecución de análisis',
        evidence: 'con inteligencia enlazada sobre votos, comisiones y legislación',
        reader: 'para lectores que siguen consecuencias democráticas de las instituciones de la UE',
    },
    nl: {
        context: 'Context',
        date: 'Gepubliceerd',
        run: 'analyserun',
        evidence: 'met brongekoppelde stem-, commissie- en wetgevingsanalyse',
        reader: 'voor lezers die democratische gevolgen van EU-instellingen volgen',
    },
    ar: {
        context: 'السياق',
        date: 'نُشر',
        run: 'تشغيل التحليل',
        evidence: 'مع تحليل موثق للتصويت واللجان والتشريع',
        reader: 'للقراء الذين يتابعون آثار مؤسسات الاتحاد الأوروبي على المساءلة الديمقراطية',
    },
    he: {
        context: 'הקשר',
        date: 'פורסם',
        run: 'הרצת ניתוח',
        evidence: 'עם מודיעין מקושר מקורות על הצבעות, ועדות וחקיקה',
        reader: 'לקוראים העוקבים אחר השלכות מוסדות האיחוד האירופי על אחריות דמוקרטית',
    },
    ja: {
        context: '文脈',
        date: '公開日',
        run: '分析実行',
        evidence: '投票、委員会、立法に関する出典付きインテリジェンス',
        reader: 'EU機関の民主的説明責任への影響を追跡する読者向け',
    },
    ko: {
        context: '맥락',
        date: '게시일',
        run: '분석 실행',
        evidence: '투표, 위원회, 입법에 대한 출처 연결 인텔리전스',
        reader: 'EU 기관의 민주적 책임 영향을 추적하는 독자를 위해',
    },
    zh: {
        context: '背景',
        date: '发布日期',
        run: '分析运行',
        evidence: '附来源链接的投票、委员会、立法程序、政治联盟和政策影响情报',
        reader: '面向跟踪欧盟机构民主问责、透明度和成员国政策后果的读者',
    },
};
/** Ordered list of artefact filenames that typically carry the editorial H1. */
const EDITORIAL_ARTEFACT_CANDIDATES = [
    // `executive-brief.md` is the canonical Riksdagsmonitor-aligned editorial
    // artefact (see `analysis/methodologies/ai-driven-analysis-guide.md`).
    // It always carries the journalist's BLUF and a `## 60-Second Read`
    // paragraph that is the lede — preferring it over `synthesis-summary.md`
    // keeps Stage-B internal vocabulary ("Purpose: This artifact provides …")
    // out of the SEO-critical `<title>` and `<meta description>` surfaces.
    'executive-brief.md',
    'extended/executive-brief.md',
    'intelligence/synthesis-summary.md',
    'intelligence/executive-summary.md',
    'intelligence/intelligence-briefing.md',
    'executive-summary.md',
    'intelligence-briefing.md',
    'synthesis-summary.md',
    'breaking-news-analysis.md',
    'committee-activity-report.md',
    'legislative-pipeline-analysis.md',
    'weekly-outlook.md',
    'monthly-outlook.md',
    'week-in-review.md',
    'month-in-review.md',
    'motions-analysis.md',
    'propositions-analysis.md',
];
/**
 * Headings inside an editorial artefact that carry the journalist's lede
 * paragraph (a one-paragraph summary of "what happened, why it matters").
 * When the resolver sees one of these as a `## …` heading inside the
 * editorial artefact, it prefers the first prose paragraph that follows
 * it as the description (and as a title fallback) over a generic line
 * walk. Names are matched case-insensitively against the heading text
 * (after stripping inline Markdown).
 */
const EDITORIAL_LEDE_HEADINGS = [
    '60-second read',
    '60 second read',
    'sixty-second read',
    'lede',
    'lead',
    'tl;dr',
    'tldr',
    'synopsis',
    'in brief',
    'at a glance',
    'bottom line',
    'bluf',
    'bluf — bottom line up front',
    'bottom line up front',
    'executive summary',
    'executive briefing',
    'master narrative',
    'overview',
    'headline judgement',
    'headline judgment',
    'key findings',
    'key judgements',
    'key judgments',
    'situation summary',
    'situation report',
    'situation update',
];
/**
 * Artifact-category prefixes that appear inside editorial-artefact H1s as
 * a structural label rather than an editorial headline (e.g. `# Synthesis
 * Summary — Week in Review (3 Apr – 1 May 2026)`). When a candidate H1
 * starts with one of these prefixes followed by a separator (em/en dash,
 * hyphen, or colon), the resolver treats it as **generic** so it does
 * not leak into the article `<title>`. Compared lower-case, with leading
 * punctuation stripped.
 */
const ARTIFACT_CATEGORY_PREFIXES = [
    'actor mapping',
    'analytical quality',
    'breaking news analysis',
    'coalition dynamics',
    'commission wp alignment',
    'committee activity report',
    'cross run continuity',
    'deep analysis',
    'economic context',
    'executive brief',
    'executive briefing',
    'executive intelligence brief',
    'executive intelligence briefing',
    'executive summary',
    'forward indicators',
    'historical baseline',
    'impact matrix',
    'intelligence assessment',
    'intelligence briefing',
    'intelligence synthesis summary',
    'legislative output analysis',
    'legislative pipeline analysis',
    'legislative pipeline forecast',
    'mandate fulfilment scorecard',
    'master intelligence synthesis',
    'mcp reliability audit',
    'methodology reflection',
    'monthly outlook',
    'motions analysis',
    'parliamentary calendar projection',
    'pestle analysis',
    'political intelligence brief',
    'political risk',
    'political threat landscape',
    'presidency trio context',
    'propositions analysis',
    'quantitative swot',
    'risk assessment',
    'risk matrix',
    'risk scoring',
    'scenario forecast',
    'seat projection',
    'significance classification',
    'situation report',
    'situation summary',
    'stakeholder analysis',
    'stakeholder impact',
    'stakeholder map',
    'swot analysis',
    'synthesis summary',
    'threat assessment',
    'threat model',
    'voting patterns',
    'weekly outlook',
    'wildcards blackswans',
];
/**
 * Emoji-banner prefixes that Stage-B agents use to decorate metadata rows
 * (e.g. `📋 Analysis Owner:`). Any line starting with one of these is
 * metadata, never prose.
 */
const EMOJI_BANNER_CHARS = [
    '📋',
    '📅',
    '🔍',
    '🏛',
    '📰',
    '📊',
    '🏷',
    '📈',
    '📉',
    '⚠',
    '🔔',
    '🎯',
    '🗳',
    '🏢',
    '📄',
];
/**
 * Label prefixes that a prose description must never start with. Every
 * entry matches case-insensitively at the start of a trimmed line, followed
 * by optional space and a colon.
 */
const METADATA_LINE_PREFIXES = [
    'Admiralty Grade',
    'Analysis Date',
    'Analysis Owner',
    'Article Type',
    'Article Window',
    'Assessment Date',
    'Briefing',
    'Briefing Date',
    'Classification',
    'Classification Date',
    'Confidence',
    'Confidence in Evidence',
    'Data Sources',
    'Date',
    'Document Type',
    'Filing Date',
    'Generated',
    'Horizon',
    'IMF Status',
    'Last Updated',
    'Parliamentary Status',
    'Parliamentary Term',
    'Period',
    'Prepared',
    'Purpose',
    'Region',
    'Reporting',
    'Reporting Period',
    'Reporting Window',
    'Run',
    'Run ID',
    'Series',
    'Series Run',
    'Source',
    'Sources',
    'SPDX-FileCopyrightText',
    'SPDX-License-Identifier',
    'Topic',
    'Type',
    'WEP Band',
    'WEP Grade',
    'Window',
];
/**
 * Return `true` when a line cannot serve as a prose description. Rejects
 * Markdown structural lines (headings, blockquotes, tables, HTML),
 * mermaid/chart directives, emoji-banner metadata rows, and the known
 * `Key: value` banners that Stage-B agents emit as artefact preamble.
 *
 * @param line - Trimmed line from the aggregated Markdown source
 * @returns `true` when the line is not prose and should be skipped
 */
export function shouldSkipDescriptionLine(line) {
    if (line.length === 0)
        return true;
    if (line.startsWith('#'))
        return true;
    if (line.startsWith('>'))
        return true;
    if (line.startsWith('<'))
        return true;
    if (line.startsWith('|'))
        return true;
    if (line.startsWith('---') || line.startsWith('==='))
        return true;
    if (line.startsWith('```') || line.startsWith('~~~'))
        return true;
    if (line.startsWith('%%'))
        return true;
    if (/^title\s/i.test(line))
        return true;
    if (EMOJI_BANNER_CHARS.some((char) => line.startsWith(char)))
        return true;
    const labelSource = line.replace(/^\*+/, '').replace(/^\*\*/, '').replace(/^_+/, '').trim();
    for (const prefix of METADATA_LINE_PREFIXES) {
        const lower = labelSource.toLowerCase();
        const prefixLower = prefix.toLowerCase();
        if (lower.startsWith(`${prefixLower}:`) ||
            lower.startsWith(`${prefixLower} :`) ||
            lower.startsWith(`${prefixLower}**:`) ||
            lower.startsWith(`${prefixLower}*:`)) {
            return true;
        }
    }
    if (/^[-*_=~.]{3,}$/.test(line))
        return true;
    if (isLocalizedBannerRow(line))
        return true;
    return false;
}
/**
 * Language-agnostic banner-row detector. Stage-B artefacts open with a
 * metadata banner of the shape
 *   `**Date:** 2026-05-15 | **Type:** Breaking | **Run:** breaking-run-001`
 * and its localized siblings — notably Japanese / Chinese / Korean briefs
 * which place the full-width colon `：` **inside** the bold span
 * (`**日付：**`) rather than after it. The `METADATA_LINE_PREFIXES` table
 * only covers the English vocabulary; this helper catches the structural
 * shape directly: a line that starts with `**`, contains at least one
 * `|` separator, and carries two-or-more bold key markers that end with
 * — or are followed by — an ASCII colon `:` or full-width colon `：`.
 * Banner rows look identical in every language we publish, so detecting
 * them here keeps localized briefs from leaking their first banner line
 * into the `<meta description>`.
 *
 * @param line - Trimmed source line
 * @returns `true` when the line is a banner row in any locale
 */
function isLocalizedBannerRow(line) {
    if (!line.startsWith('**'))
        return false;
    if (!line.includes('|'))
        return false;
    const inside = (line.match(/\*\*[^*]+[:：]\s*\*\*/g) ?? []).length;
    const after = (line.match(/\*\*[^*]+\*\*\s*[:：]/g) ?? []).length;
    return inside + after >= 2;
}
/**
 * Strip inline Markdown decorations so we can use the remaining text as
 * plain-text meta-tag content. Removes link syntax, emphasis, inline code
 * backticks, and HTML-entity fragments that the Markdown source sometimes
 * smuggles in. Keeps the visible text readable.
 *
 * @param raw - Trimmed Markdown line
 * @returns Plain-text variant
 */
/**
 * Strip a leading all-caps prose label (e.g. `SITUATION:`, `KEY MOTION:`,
 * `BLUF:`, `BOTTOM LINE:`, `TIER-1:`) from a prose line. These labels
 * are common in BLUF-style editorial writing — they survive
 * {@link stripInlineMarkdown} (which strips the `**bold**` wrapper but
 * keeps the literal text) and would otherwise leak into the SEO
 * description as a confusing all-caps shout.
 *
 * Matches up to 4 hyphenated all-caps tokens, optionally followed by a
 * digit suffix (`TIER-1`), terminating at a colon. Returns the original
 * line when no opener is present.
 *
 * @param line - Plain prose line (post-{@link stripInlineMarkdown})
 * @returns Line with the all-caps opener removed
 */
export function stripLeadingProseLabel(line) {
    const colonIdx = line.indexOf(': ');
    if (colonIdx < 2 || colonIdx > 80)
        return line;
    const label = line.slice(0, colonIdx);
    const rest = line.slice(colonIdx + 2).trim();
    if (rest.length < 20)
        return line;
    if (!/^[A-Z][A-Z0-9 -]{1,79}$/.test(label))
        return line;
    if (label.length < 3)
        return line;
    return rest;
}
/**
 * Strip inline Markdown decorations so we can use the remaining text as
 * plain-text meta-tag content. Removes link syntax, emphasis, inline code
 * backticks, and HTML-entity fragments that the Markdown source sometimes
 * smuggles in. Keeps the visible text readable.
 *
 * @param raw - Trimmed Markdown line
 * @returns Plain-text variant
 */
export function stripInlineMarkdown(raw) {
    return raw
        .replace(/!\[([^\]\n]{0,500})\]\(([^)\n]{0,500})\)/g, '$1')
        .replace(/\[([^\]\n]{1,500})\]\(([^)\n]{0,500})\)/g, '$1')
        .replace(/`([^`\n]{1,500})`/g, '$1')
        .replace(/\*\*([^*\n]{1,500})\*\*/g, '$1')
        .replace(/__([^_\n]{1,500})__/g, '$1')
        .replace(/\*([^*\n]{1,500})\*/g, '$1')
        .replace(/_([^_\n]{1,500})_/g, '$1')
        .replace(/~~([^~\n]{1,500})~~/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}
/** Connector / determiner words that read as broken copy when they are
 *  the final token before a truncation ellipsis. */
const TRAILING_STOP_WORDS = new Set([
    'the',
    'a',
    'an',
    'of',
    'to',
    'for',
    'in',
    'on',
    'at',
    'by',
    'and',
    'or',
    'with',
    'from',
]);
/** Trailing characters we always strip before appending our own ellipsis,
 *  so we never emit double-ellipsis or stray punctuation. */
const TRAILING_PUNCT = /[.,;:—\-…\s]/u;
/**
 * Repeatedly strip trailing stop-words (separated by a single space) and
 * trailing punctuation (including any pre-existing ellipsis). Implemented
 * imperatively to avoid super-linear regex backtracking on the
 * `(?:\s+stop-word)+$` pattern flagged by `security/detect-unsafe-regex`.
 *
 * @param input - Pre-clipped string to clean up
 * @returns Cleaned string with no trailing stop-words or punctuation
 */
function stripTrailingStopWordsAndPunctuation(input) {
    let result = input;
    let changed = true;
    while (changed) {
        changed = false;
        while (result.length > 0 && TRAILING_PUNCT.test(result.charAt(result.length - 1))) {
            result = result.slice(0, -1);
            changed = true;
        }
        const lastSpace = result.lastIndexOf(' ');
        if (lastSpace >= 0) {
            const tail = result.slice(lastSpace + 1).toLowerCase();
            if (TRAILING_STOP_WORDS.has(tail)) {
                result = result.slice(0, lastSpace);
                changed = true;
            }
        }
    }
    return result;
}
/**
 * Clamp a string to `DESCRIPTION_MAX_LENGTH` characters, appending
 * an ellipsis when truncation actually happens. Does not break words if
 * avoidable — a trailing partial word is trimmed back to the previous
 * space first.
 *
 * @param text - Raw description text
 * @returns Truncated description with trailing ellipsis when clipped
 */
export function truncateDescription(text) {
    if (text.length <= DESCRIPTION_MAX_LENGTH)
        return text;
    const cut = text.slice(0, DESCRIPTION_MAX_LENGTH - 1);
    // Prefer the last full sentence terminator within the cut so we don't
    // end on a dangling determiner ("…year. The"). Period/!/? followed by
    // a space marks a clean boundary. Only honour the boundary when it
    // sits past the soft minimum so we keep enough body text to be useful.
    const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (sentenceEnd >= DESCRIPTION_MIN_LENGTH) {
        return cut.slice(0, sentenceEnd + 1).replace(/\s+$/, '');
    }
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
    // Drop dangling stop-words and trailing punctuation/ellipsis so we
    // never emit broken copy ("…year. The" → "…year.") or double-ellipsis
    // ("The……") when the upstream input already carried an ellipsis.
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return `${safe}…`;
}
/**
 * Clamp a title to `TITLE_MAX_LENGTH` characters in the same
 * word-boundary-preserving fashion as {@link truncateDescription}.
 *
 * @param text - Raw title text
 * @returns Truncated title with trailing ellipsis when clipped
 */
export function truncateTitle(text) {
    if (text.length <= TITLE_MAX_LENGTH)
        return text;
    const cut = text.slice(0, TITLE_MAX_LENGTH - 1);
    const lastSpace = cut.lastIndexOf(' ');
    let safe = lastSpace > TITLE_MAX_LENGTH - 40 ? cut.slice(0, lastSpace) : cut;
    safe = stripTrailingStopWordsAndPunctuation(safe);
    return `${safe}…`;
}
/**
 * Return the first Markdown H1 (`# …`) in the supplied text, stripped of
 * the leading `#` and trailing anchor syntax. Returns an empty string when
 * no H1 is present.
 *
 * @param markdown - Markdown source
 * @returns Plain-text H1, or empty string when none found
 */
export function extractFirstH1(markdown) {
    for (const raw of markdown.split('\n')) {
        const line = raw.trim();
        if (!line.startsWith('#'))
            continue;
        if (!/^#\s+/.test(line))
            continue;
        let text = line.replace(/^#\s+/, '').trimEnd();
        while (text.endsWith('#'))
            text = text.slice(0, -1).trimEnd();
        return stripInlineMarkdown(text);
    }
    return '';
}
/**
 * Process one Markdown line against the in-progress paragraph buffer.
 * Returns the desired loop control: `'continue'` (skip silently),
 * `'break'` (paragraph terminated — emit), or `'collected'` (line was
 * pushed into the buffer; caller checks the cap separately).
 *
 * Factored out of the two extractors to reduce cognitive complexity.
 *
 * @param line - Trimmed Markdown line
 * @param buf - In-progress paragraph buffer (mutated on `'collected'`)
 * @returns Loop control directive
 */
function collectProseLine(line, buf) {
    const hasBuffer = buf.lines.length > 0;
    if (hasBuffer && line === '')
        return 'break';
    if (line === '')
        return 'continue';
    if (shouldSkipDescriptionLine(line))
        return hasBuffer ? 'break' : 'continue';
    const plain = stripLeadingProseLabel(stripInlineMarkdown(line));
    if (!hasBuffer && plain.length < 40)
        return 'continue';
    buf.lines.push(plain);
    buf.byteCount += plain.length + 1;
    return 'collected';
}
/**
 * Walk every line of the Markdown source and return the first paragraph
 * that survives {@link shouldSkipDescriptionLine}. Consecutive non-blank
 * prose lines are joined with a single space so hard-wrapped ledes
 * (column-95 conventional wrap) produce a clean 140-180-character
 * description rather than just the first 60-90-char line.
 *
 * Inline Markdown decorations are stripped and the result is truncated
 * to fit `<meta description>`.
 *
 * @param markdown - Markdown source
 * @returns Prose description, or empty string when nothing qualifies
 */
export function extractStrongProseLine(markdown) {
    let inFence = false;
    const buf = { lines: [], byteCount: 0 };
    for (const raw of markdown.split('\n')) {
        const line = raw.trim();
        if (line.startsWith('```') || line.startsWith('~~~')) {
            inFence = !inFence;
            continue;
        }
        if (inFence)
            continue;
        const directive = collectProseLine(line, buf);
        if (directive === 'continue')
            continue;
        if (directive === 'break')
            break;
        if (buf.byteCount >= DESCRIPTION_MAX_LENGTH)
            break;
    }
    if (buf.lines.length === 0)
        return '';
    return truncateDescription(buf.lines.join(' '));
}
/**
 * Classify one Markdown line for the {@link extractLedeAfterHeading}
 * walker. The returned directive is then applied to walker state by
 * {@link applyLedeDirective}.
 *
 * @param line - Trimmed Markdown line
 * @param isInFence - True when the previous line opened a fenced block
 * @param inLede - True when the previous line was inside a lede heading block
 * @param hasBuffered - True when at least one prose line has been collected
 * @returns Directive describing how the walker should treat this line
 */
function classifyLedeLine(line, isInFence, inLede, hasBuffered) {
    if (line.startsWith('```') || line.startsWith('~~~'))
        return { kind: 'fence' };
    if (isInFence)
        return { kind: 'pause' };
    if (/^#{2,3}\s+/.test(line)) {
        if (hasBuffered)
            return { kind: 'pause' };
        const headingText = normaliseHeadingText(line.replace(/^#{2,3}\s+/, ''));
        const match = EDITORIAL_LEDE_HEADINGS.some((h) => isLedeHeadingMatch(headingText, h));
        return { kind: 'heading', inLede: match };
    }
    return inLede ? { kind: 'collect' } : { kind: 'pause' };
}
/**
 * Apply one directive emitted by {@link classifyLedeLine} to the walk
 * state. Returns `'break'` to stop the walk, `'continue'` to skip to
 * the next line, or `'collect'` when the caller should now run
 * {@link collectProseLine}. Mutates `state` for fence/in-lede toggles.
 *
 * @param directive - Classification of the current line
 * @param state - Walk state (mutated in place)
 * @param state.inFence - True when the current line is inside a fenced block
 * @param state.inLede - True when the current line is inside a lede heading block
 * @param hasBuffered - Whether any prose has already been collected
 * @returns Loop control directive
 */
function applyLedeDirective(directive, state, hasBuffered) {
    if (directive.kind === 'fence') {
        state.inFence = !state.inFence;
        return 'continue';
    }
    if (directive.kind === 'heading') {
        if (hasBuffered)
            return 'break';
        state.inLede = directive.inLede;
        return 'continue';
    }
    if (directive.kind === 'pause')
        return 'continue';
    return 'collect';
}
export function extractLedeAfterHeading(markdown) {
    const state = { inFence: false, inLede: false };
    const buf = { lines: [], byteCount: 0 };
    for (const raw of markdown.split('\n')) {
        const line = raw.trim();
        const directive = classifyLedeLine(line, state.inFence, state.inLede, buf.lines.length > 0);
        const action = applyLedeDirective(directive, state, buf.lines.length > 0);
        if (action === 'break')
            break;
        if (action === 'continue')
            continue;
        const collect = collectProseLine(line, buf);
        if (collect === 'continue')
            continue;
        if (collect === 'break')
            break;
        if (buf.byteCount >= DESCRIPTION_MAX_LENGTH)
            break;
    }
    if (buf.lines.length === 0)
        return '';
    return truncateDescription(buf.lines.join(' '));
}
/**
 * Normalise a Markdown heading's text for comparison against the
 * editorial-lede heading whitelist. Strips inline Markdown decorations
 * (`*`, `_`, `` ` ``, `#`), then strips any leading non-alphanumeric
 * characters (emoji, punctuation, spaces) so a heading like
 * `🎯 Headline Judgement` compares equal to `headline judgement`.
 *
 * @param raw - Raw heading text (no leading hashes)
 * @returns Lower-cased, decoration-stripped heading text
 */
function normaliseHeadingText(raw) {
    return stripInlineMarkdown(raw)
        .replace(/[*_`#]+/g, '')
        .replace(/^[^A-Za-z0-9]+/, '')
        .trim()
        .toLowerCase();
}
/**
 * Word-boundary match against an editorial-lede whitelist entry. Matches
 * when the normalised heading equals the whitelist entry exactly, or when
 * the entry is followed by any non-alphanumeric character — covering
 * localized parenthetical glosses written with ASCII or full-width
 * punctuation (e.g. `bluf (bottom line up front)`, `bluf（結論先出し）`,
 * `bluf — 핵심 결론`, `60-second read — what happened`).
 *
 * @param headingText - Normalised heading text (lower-case, decoration-stripped)
 * @param whitelistEntry - Lower-case whitelist entry from
 *                        {@link EDITORIAL_LEDE_HEADINGS}
 * @returns `true` when `headingText` begins with `whitelistEntry` at a
 *          word boundary
 */
function isLedeHeadingMatch(headingText, whitelistEntry) {
    if (headingText === whitelistEntry)
        return true;
    if (!headingText.startsWith(whitelistEntry))
        return false;
    const next = headingText.charAt(whitelistEntry.length);
    // Word boundary — anything that is not an ASCII letter/digit is a
    // separator we accept. This works uniformly across ASCII parentheses,
    // CJK full-width brackets `（`, dashes `— – -`, colons `:`, and the
    // ideographic full-width colon `：`.
    return next === '' || !/[a-z0-9]/.test(next);
}
/**
 * Return `true` when an artefact-H1 begins with one of the
 * `ARTIFACT_CATEGORY_PREFIXES` followed by a separator. Such H1s
 * carry the artefact's structural label rather than a journalist's
 * headline (e.g. `# Synthesis Summary — Week in Review (3 Apr – 1 May
 * 2026)`) and must not leak into the article `<title>`.
 *
 * @param heading - Plain-text H1 (after `stripInlineMarkdown`)
 * @returns `true` when the heading is an artefact-category label
 */
export function isArtifactCategoryHeading(heading) {
    const normalized = normaliseCategoryHeading(heading);
    if (normalized === '')
        return false;
    for (const prefix of ARTIFACT_CATEGORY_PREFIXES) {
        if (normalized === prefix)
            return true;
        if (normalized.startsWith(`${prefix} —`) ||
            normalized.startsWith(`${prefix} –`) ||
            normalized.startsWith(`${prefix} -`) ||
            normalized.startsWith(`${prefix}:`)) {
            return true;
        }
        if (normalized.endsWith(` — ${prefix}`) ||
            normalized.endsWith(` – ${prefix}`) ||
            normalized.endsWith(` - ${prefix}`) ||
            normalized.endsWith(`: ${prefix}`)) {
            return true;
        }
    }
    return false;
}
/**
 * Strip a leading or trailing artifact-category label from a heading and
 * return the editorial-topic core. When neither end carries a category
 * label, the heading is returned unchanged. When the category label is
 * the **entire** heading (e.g. `# Executive Brief`) the result is the
 * empty string.
 *
 * Examples:
 * - `Executive Brief — EU Parliament Motions` → `EU Parliament Motions`
 * - `EU Parliament Propositions — Executive Brief` → `EU Parliament Propositions`
 * - `EP10 Term Outlook — Executive Brief` → `EP10 Term Outlook`
 * - `Key Legislative Developments — Deep Analysis (2026-05-08)` → `Key Legislative Developments`
 * - `Synthesis Summary — EP Motions & Adopted Texts` → `EP Motions & Adopted Texts`
 *
 * Trailing parenthesised metadata (`(2026-05-08)`, `(May 2026)`) is also
 * stripped because it functions as a date stamp rather than editorial
 * copy. The returned core is trimmed of whitespace and trailing
 * punctuation.
 *
 * @param heading - Raw heading text (post-{@link stripInlineMarkdown})
 * @returns Editorial-topic core, or empty string when only the category survived
 */
export function stripArtifactCategoryAffix(heading) {
    const trimmed = heading.trim();
    if (trimmed === '')
        return '';
    const sortedPrefixes = [...ARTIFACT_CATEGORY_PREFIXES].sort((a, b) => b.length - a.length);
    const normalized = normaliseCategoryHeading(trimmed);
    const skip = trimmed.length - normalized.length;
    const visible = trimmed.slice(skip < 0 ? 0 : skip);
    const visibleClean = visible.replace(/\s*\([^)]{1,80}\)\s*$/u, '').trim();
    const normalizedClean = normaliseCategoryHeading(visibleClean);
    for (const prefix of sortedPrefixes) {
        for (const sep of [' — ', ' – ', ' - ', ': ']) {
            const candidate = `${prefix}${sep}`;
            if (normalizedClean.startsWith(candidate)) {
                const core = visibleClean.slice(candidate.length).trim();
                return cleanupAffixCore(core);
            }
        }
        for (const sep of [' — ', ' – ', ' - ', ': ']) {
            const candidate = `${sep}${prefix}`;
            if (normalizedClean.endsWith(candidate)) {
                const core = visibleClean.slice(0, visibleClean.length - candidate.length).trim();
                return cleanupAffixCore(core);
            }
        }
        if (normalizedClean === prefix)
            return '';
    }
    return trimmed;
}
/**
 * Tidy the editorial-topic core returned by
 * {@link stripArtifactCategoryAffix}: drop trailing parenthesised
 * metadata (`(2026-05-08)`, `(May 2026)`) and trailing punctuation. When
 * stripping leaves the string too short to be meaningful (<5 chars),
 * return the empty string so callers fall through to lower tiers.
 *
 * @param core - Heading with the category label already stripped
 * @returns Cleaned editorial-topic core, or empty string when too short
 */
function cleanupAffixCore(core) {
    const withoutTrailingParens = core.replace(/\s*\([^)]{1,80}\)\s*$/u, '').trim();
    const withoutTrailingPunct = withoutTrailingParens.replace(/[—–:;,.\s-]+$/u, '').trim();
    if (withoutTrailingPunct.length < 5)
        return '';
    return withoutTrailingPunct;
}
/**
 * Lower-case, decoration-stripped form used by the artifact-category
 * matchers. Strips inline Markdown, leading non-alphanumeric runs (emoji,
 * decoration), and collapses whitespace to a single space.
 *
 * @param raw - Raw heading text
 * @returns Lower-case normalised form
 */
function normaliseCategoryHeading(raw) {
    return stripInlineMarkdown(raw)
        .trim()
        .toLowerCase()
        .replace(/^[^a-z0-9]+/, '')
        .replace(/\s+/g, ' ');
}
/**
 * Humanise an `article-type` slug the same way the aggregator does (see
 * `src/aggregator/analysis-aggregator.ts:humanize`). Kept in sync by value
 * — we deliberately do not import the private helper.
 *
 * @param slug - Slug like `week-ahead` or `breaking_news`
 * @returns Title-cased humanised form (`Week Ahead`, `Breaking News`)
 */
export function humanizeSlug(slug) {
    return slug
        .split(/[-_]/g)
        .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg))
        .join(' ')
        .trim();
}
/**
 * Return `true` when the supplied heading matches the generic
 * `${humanize(articleType)} — ${date}` form that the aggregator writes as
 * its default document title. Accepts em-dash, en-dash, and ASCII hyphen
 * separators, and matches the `breaking-breaking` variant that some
 * same-day collision runs produce.
 *
 * @param heading - Plain-text heading (post-{@link stripInlineMarkdown})
 * @param articleType - Article type slug
 * @param date - ISO date string
 * @returns `true` when the heading carries no editorial information
 */
export function isGenericHeading(heading, articleType, date) {
    const normalized = heading.trim().replace(/\s+/g, ' ');
    if (normalized === '')
        return true;
    if (isArtifactCategoryHeading(normalized))
        return true;
    const human = humanizeSlug(articleType);
    const patterns = [
        `${human} — ${date}`,
        `${human} - ${date}`,
        `${human} – ${date}`,
        `${human}: ${date}`,
        `${human} ${date}`,
    ];
    const humanRedundant = `${human} ${human}`;
    for (const p of patterns) {
        if (normalized === p)
            return true;
        if (normalized === `EU Parliament ${p}`)
            return true;
        if (normalized === `${humanRedundant} — ${date}`)
            return true;
    }
    const trailingDateOnly = new RegExp(`^${escapeRegex(human)}\\s*[—–-]\\s*[\\d-]+$`, 'u');
    if (trailingDateOnly.test(normalized)) {
        return true;
    }
    if (isCategoryNounHeading(normalized, articleType))
        return true;
    return false;
}
/**
 * Curated category-noun whitelist per article-type slug. These are the
 * boring "EU Parliament &lt;Type&gt;" / "EP10 &lt;Type&gt;" headings that the
 * executive-brief authoring conventions allow as decorative H1s but
 * which carry **no editorial information** — they merely restate the
 * article category. When such a heading reaches the metadata resolver
 * it must be flagged generic so the resolver falls through to the
 * BLUF / lede summary instead of using the category noun as `<title>`.
 *
 * Keys are slugs (`article-type` form). Values are lowercase category
 * cores, matched after stripping institutional prefixes
 * (`eu parliament `, `european parliament `, `ep `, `ep10 `, `ep11 `)
 * and trailing date qualifiers (`· 2026-05-15`, `— 2026-05-15`,
 * `(May 2026)`, `: 19–22 May 2026` is **kept** because date ranges
 * carry editorial info — only single-date suffixes are stripped).
 */
const CATEGORY_NOUN_CORES = {
    breaking: ['breaking', 'breaking news'],
    'week-in-review': ['week in review'],
    'week-ahead': ['week ahead'],
    'month-in-review': ['month in review'],
    'month-ahead': ['month ahead'],
    'quarter-in-review': ['quarter in review'],
    'quarter-ahead': ['quarter ahead'],
    'year-in-review': ['year in review'],
    'year-ahead': ['year ahead'],
    'committee-reports': [
        'committee reports',
        'committee activity',
        'committee activity report',
        'committee activity reports',
    ],
    motions: [
        'motions',
        'motions and adopted texts',
        'plenary votes and resolutions',
        'plenary votes resolutions',
    ],
    propositions: ['propositions', 'legislative propositions', 'legislative procedures'],
    'election-cycle': ['election cycle'],
    'term-outlook': ['term outlook'],
};
/**
 * Return `true` when the heading is a bare category-noun string for the
 * supplied `articleType` slug, regardless of the institutional prefix
 * (`EU Parliament `, `European Parliament `, `EP `, `EP10 `, `EP11 `).
 * Strips a trailing single-date qualifier (` · YYYY-MM-DD`,
 * ` — YYYY-MM-DD`, `(May 2026)`, `(2026)`) before matching; date-range
 * qualifiers (`: 19–22 May 2026`) carry editorial information and are
 * NOT stripped, so headings like `EP Week Ahead: 19–22 May 2026` are
 * preserved as legitimate editorial headlines.
 *
 * @param normalized - Heading text after whitespace collapse
 * @param articleType - Article-type slug
 * @returns `true` when the heading is category-noun boilerplate
 */
function isCategoryNounHeading(normalized, articleType) {
    const cores = CATEGORY_NOUN_CORES[articleType];
    if (!cores || cores.length === 0)
        return false;
    let core = normalized.toLowerCase();
    // Strip institutional prefix (longest-first match).
    const prefixes = [
        "the european parliament's ",
        'european parliament ',
        'eu parliament ',
        'ep11 ',
        'ep10 ',
        'ep ',
    ];
    for (const p of prefixes) {
        if (core.startsWith(p)) {
            core = core.slice(p.length);
            break;
        }
    }
    // Strip trailing single-date qualifier. We deliberately do NOT strip
    // date *ranges* (`19–22 may 2026`, `28-30 april 2026`) because those
    // identify a specific reporting window — that IS editorial content.
    // Patterns stripped:
    //   ` · 2026-05-15`, ` — 2026-05-15`, ` - 2026-05-15`, `: 2026-05-15`
    //   ` (may 2026)`, ` (2026)`
    core = core.replace(/\s*[·:—–-]\s*\d{4}-\d{2}-\d{2}\s*$/u, '');
    core = core.replace(/\s*\(\s*[a-z]{3,9}\s+\d{4}\s*\)\s*$/u, '');
    core = core.replace(/\s*\(\s*\d{4}\s*\)\s*$/u, '');
    // Trailing punctuation residue.
    core = core.replace(/[\s\-—–:·]+$/u, '').trim();
    return cores.includes(core);
}
/**
 * Escape regex metacharacters so a dynamic string can be embedded safely
 * in a pattern built at runtime.
 *
 * @param input - Raw string
 * @returns Regex-safe form of {@link input}
 */
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Attempt to read the first H1 and first prose paragraph from the first
 * existing artefact under `EDITORIAL_ARTEFACT_CANDIDATES`. Returns
 * `null` when no candidate artefact exists.
 *
 * @param runDir - Absolute run directory path
 * @param articleType - Article type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
export function extractArtifactHighlight(runDir, articleType, date) {
    if (!runDir || !fs.existsSync(runDir))
        return null;
    const direct = scanCandidatesForHighlight(runDir, EDITORIAL_ARTEFACT_CANDIDATES, articleType, date);
    if (direct.headline)
        return { headline: direct.headline, summary: direct.summary };
    const topLevel = safeReaddir(runDir).filter((f) => f.endsWith('.md') && f !== 'manifest.json');
    const fallback = scanCandidatesForHighlight(runDir, topLevel, articleType, date);
    if (fallback.headline)
        return { headline: fallback.headline, summary: fallback.summary };
    const summaryOnly = direct.summary || fallback.summary;
    if (summaryOnly) {
        return { headline: '', summary: summaryOnly };
    }
    return null;
}
/**
 * Walk a list of candidate artefact paths and return the first
 * non-generic headline + summary pair, plus the first usable lede
 * summary seen along the way. Extracted from
 * {@link extractArtifactHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory path
 * @param candidates - Run-relative candidate filenames to probe
 * @param articleType - Article-type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
function scanCandidatesForHighlight(runDir, candidates, articleType, date) {
    let bestSummaryOnly = '';
    for (const rel of candidates) {
        const probe = probeCandidateForHighlight(runDir, rel, articleType, date);
        if (probe.cleanHighlight)
            return probe.cleanHighlight;
        if (probe.strippedHeadline) {
            return { headline: probe.strippedHeadline, summary: probe.summary ?? bestSummaryOnly };
        }
        if (!bestSummaryOnly && probe.summary) {
            bestSummaryOnly = probe.summary;
        }
    }
    return { headline: '', summary: bestSummaryOnly };
}
/**
 * Read a single candidate artefact and classify what it can contribute
 * to the highlight resolver. Extracted from
 * {@link scanCandidatesForHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory
 * @param rel - Run-relative artefact path
 * @param articleType - Article-type slug for {@link isGenericHeading}
 * @param date - ISO run date for {@link isGenericHeading}
 * @returns
 *   - `cleanHighlight` when the artefact has a non-generic H1 (caller may
 *     return it directly)
 *   - `strippedHeadline` when the H1 is generic but yields an editorial
 *     core after {@link stripArtifactCategoryAffix}
 *   - `summary` when the artefact carries a usable lede or strong prose
 *     line (independent of the headline outcome)
 */
function probeCandidateForHighlight(runDir, rel, articleType, date) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs))
        return {};
    const body = readArtefactBody(abs);
    const headline = extractFirstH1(body);
    const lede = extractLedeAfterHeading(body);
    const summary = lede || extractStrongProseLine(body);
    if (headline && !isGenericHeading(headline, articleType, date)) {
        return { cleanHighlight: { headline: truncateTitle(headline), summary } };
    }
    if (headline) {
        const stripped = stripArtifactCategoryAffix(headline);
        if (stripped && !isGenericHeading(stripped, articleType, date)) {
            return { strippedHeadline: truncateTitle(stripped), summary };
        }
    }
    return { summary };
}
/**
 * Read an artefact file, skipping any SPDX HTML-comment header rows so the
 * first-H1 / first-prose logic is never derailed by the REUSE preamble.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped
 */
function readArtefactBody(abs) {
    let text;
    try {
        text = fs.readFileSync(abs, 'utf8');
    }
    catch {
        return '';
    }
    const lines = text.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = (lines[i] ?? '').trim();
        if (line === '') {
            i++;
            continue;
        }
        if (line.startsWith('<!--') && line.endsWith('-->')) {
            i++;
            continue;
        }
        break;
    }
    return lines.slice(i).join('\n');
}
/**
 * `fs.readdirSync` wrapped to never throw for missing or unreadable
 * directories.
 *
 * @param dir - Absolute directory path
 * @returns Entries in {@link dir} or `[]` when unreadable
 */
function safeReaddir(dir) {
    try {
        return fs.readdirSync(dir);
    }
    catch {
        return [];
    }
}
/**
 * Build the per-language `{title, description}` pair using the
 * article-type–specific `*_TITLES` generator from
 * `src/constants/language-articles.ts`. This is the last-resort tier and
 * is always parameterised by date (or equivalent), so even when it fires
 * the result is not identical across runs of the same type.
 *
 * @param articleType - Article type slug
 * @param date - ISO run date
 * @param committee - Optional committee code (used by `committee-reports`)
 * @returns Per-language `LangTitleSubtitle`
 */
export function buildTemplateFallback(articleType, date, committee) {
    const map = Object.create(null);
    const weekRange = articleType === 'week-in-review'
        ? deriveReportingWindowForWeekInReview(date)
        : deriveWeekRange(date);
    const monthLabel = deriveMonthLabel(date);
    const committeeLabel = committee && committee.trim().length > 0 ? committee : 'Main Committees';
    const quarterLabel = deriveQuarterLabel(date);
    const yearLabel = deriveYearLabel(date);
    const termLabel = deriveTermLabel(date);
    const cycleLabel = deriveElectionCycleLabel(date);
    for (const lang of ALL_LANGUAGES) {
        const entry = templateForType(lang, articleType, {
            date,
            weekStart: weekRange.start,
            weekEnd: weekRange.end,
            month: monthLabel,
            committee: committeeLabel,
            quarter: quarterLabel,
            year: yearLabel,
            term: termLabel,
            cycle: cycleLabel,
        });
        Object.defineProperty(map, lang, {
            value: entry,
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    return map;
}
/**
 * Dispatch an article-type slug to the matching localized template
 * generator. Unknown types get a uniform fallback built from
 * {@link humanizeSlug} and the run date.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param inputs - Pre-derived inputs used by the generators
 * @returns `LangTitleSubtitle` for the requested language
 */
function templateForType(lang, articleType, inputs) {
    switch (articleType) {
        case 'breaking':
        case 'breaking-breaking':
            return getLocalizedString(BREAKING_NEWS_TITLES, lang)(inputs.date);
        case 'committee-reports':
            return getLocalizedString(COMMITTEE_REPORTS_TITLES, lang)(inputs.committee);
        case 'motions':
            return getLocalizedString(MOTIONS_TITLES, lang)(inputs.date);
        case 'propositions':
            return getLocalizedString(PROPOSITIONS_TITLES, lang)();
        case 'week-ahead':
            return getLocalizedString(WEEK_AHEAD_TITLES, lang)(inputs.weekStart, inputs.weekEnd);
        case 'month-ahead':
            return getLocalizedString(MONTH_AHEAD_TITLES, lang)(inputs.month);
        case 'week-in-review':
            return getLocalizedString(WEEKLY_REVIEW_TITLES, lang)(inputs.weekStart, inputs.weekEnd);
        case 'month-in-review':
            return getLocalizedString(MONTHLY_REVIEW_TITLES, lang)(inputs.month);
        case 'quarter-ahead':
            return getLocalizedString(QUARTER_AHEAD_TITLES, lang)(inputs.quarter);
        case 'quarter-in-review':
            return getLocalizedString(QUARTER_IN_REVIEW_TITLES, lang)(inputs.quarter);
        case 'year-ahead':
            return getLocalizedString(YEAR_AHEAD_TITLES, lang)(inputs.year);
        case 'year-in-review':
            return getLocalizedString(YEAR_IN_REVIEW_TITLES, lang)(inputs.year);
        case 'term-outlook':
            return getLocalizedString(TERM_OUTLOOK_TITLES, lang)(inputs.term);
        case 'election-cycle':
            return getLocalizedString(ELECTION_CYCLE_TITLES, lang)(inputs.cycle);
        default:
            return {
                title: `${humanizeSlug(articleType)} — ${inputs.date}`,
                subtitle: `EU Parliament analysis — ${inputs.date}`,
            };
    }
}
/** Milliseconds in one UTC day — used by date-window derivation helpers. */
const MS_PER_DAY = 86_400_000;
/**
 * Parse an ISO date and return the `[start, end]` week range as ISO
 * strings. Week starts on Monday and ends on the following Sunday.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @returns `{ start, end }` both in `YYYY-MM-DD` form
 */
export function deriveWeekRange(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return { start: date, end: date };
    const day = parsed.getUTCDay();
    const shift = (day + 6) % 7;
    const startMs = parsed.getTime() - shift * MS_PER_DAY;
    const endMs = startMs + 6 * MS_PER_DAY;
    return { start: formatIsoDate(new Date(startMs)), end: formatIsoDate(new Date(endMs)) };
}
/**
 * Return the D-36 → D-8 reporting window for the `week-in-review`
 * article type. EP roll-call voting data is published with a 2–6 week
 * lag, so using the most-recent 7 days structurally produces a
 * vote-empty dataset. Shifting 8 days back and widening to 28 days
 * (start = D-36, end = D-8) ensures the window always contains at
 * least one full EP plenary week with published roll-call data
 * (ADR-006). Direction is consistent with the workflow's
 * `DATE_FROM` (start = D-36) → `DATE_TO` (end = D-8) variables.
 *
 * @param date - ISO article date string (`YYYY-MM-DD`) — typically TODAY
 * @returns `{ start: D-36, end: D-8 }` both as `YYYY-MM-DD` ISO strings
 */
export function deriveReportingWindowForWeekInReview(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return { start: date, end: date };
    return {
        start: formatIsoDate(new Date(parsed.getTime() - 36 * MS_PER_DAY)),
        end: formatIsoDate(new Date(parsed.getTime() - 8 * MS_PER_DAY)),
    };
}
/**
 * Return a human-friendly month label for an ISO date — English month
 * name + four-digit year (e.g. `April 2026`). The non-English template
 * generators accept this same label verbatim because they interpolate it
 * into a localized sentence rather than translating the month itself.
 *
 * @param date - ISO date string
 * @returns Month label, or the input when parsing fails
 */
export function deriveMonthLabel(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return date;
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const name = monthNames[parsed.getUTCMonth()] ?? '';
    return `${name} ${parsed.getUTCFullYear()}`.trim();
}
/**
 * Return a quarter label for an ISO date — `Q<n> <YYYY>` (e.g. `Q2 2026`).
 * Used by `quarter-ahead` and `quarter-in-review` title generators.
 *
 * @param date - ISO date string
 * @returns Quarter label, or the input when parsing fails
 */
export function deriveQuarterLabel(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return date;
    const quarter = Math.floor(parsed.getUTCMonth() / 3) + 1;
    return `Q${quarter} ${parsed.getUTCFullYear()}`;
}
/**
 * Return a four-digit year label for an ISO date. Used by `year-ahead`
 * and `year-in-review` title generators.
 *
 * @param date - ISO date string
 * @returns Year label, or the input when parsing fails
 */
export function deriveYearLabel(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return date;
    return String(parsed.getUTCFullYear());
}
/**
 * EP-term constants — keep these in sync with
 * {@link analysis/methodologies/electoral-cycle-methodology.md}.
 *  - EP10: 16 Jul 2024 → ~end of June 2029
 *  - EP11: ~Jul 2029 → ~Jun 2034
 */
const EP10_START_YEAR = 2024;
const EP10_END_YEAR = 2029;
const EP11_END_YEAR = 2034;
const EP_ELECTION_MONTH = 6; // June
/**
 * Return the EP-term label for an ISO date — `EP10 → 2029` or `EP11 → 2034`.
 * Used by `term-outlook` title generator.
 *
 * @param date - ISO date string
 * @returns Term label, or the input when parsing fails
 */
export function deriveTermLabel(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return date;
    const year = parsed.getUTCFullYear();
    const month = parsed.getUTCMonth() + 1;
    if (year < EP10_START_YEAR)
        return `EP9 → ${EP10_START_YEAR}`;
    if (year < EP10_END_YEAR || (year === EP10_END_YEAR && month <= EP_ELECTION_MONTH)) {
        return `EP10 → ${EP10_END_YEAR}`;
    }
    if (year < EP11_END_YEAR || (year === EP11_END_YEAR && month <= EP_ELECTION_MONTH)) {
        return `EP11 → ${EP11_END_YEAR}`;
    }
    const yearsBeyond = year - EP11_END_YEAR;
    const offset = month <= EP_ELECTION_MONTH ? 0 : 1;
    const termsBeyond = Math.floor((yearsBeyond - 1 + offset) / 5) + 1;
    const termIndex = 11 + termsBeyond;
    const termEnd = EP11_END_YEAR + 5 * termsBeyond;
    return `EP${termIndex} → ${termEnd}`;
}
/**
 * Return the election-cycle label for an ISO date — pairs the outgoing
 * and incoming EP terms with the election year (e.g. `EP10 → EP11 (2029)`).
 * Used by the `election-cycle` title generator.
 *
 * @param date - ISO date string
 * @returns Cycle label, or the input when parsing fails
 */
export function deriveElectionCycleLabel(date) {
    const parsed = parseIsoDate(date);
    if (!parsed)
        return date;
    const year = parsed.getUTCFullYear();
    if (year <= EP10_END_YEAR)
        return `EP10 → EP11 (${EP10_END_YEAR})`;
    if (year <= EP11_END_YEAR)
        return `EP11 → EP12 (${EP11_END_YEAR})`;
    const cyclesBeyond = Math.ceil((year - EP11_END_YEAR) / 5);
    const electionYear = EP11_END_YEAR + 5 * cyclesBeyond;
    const out = 11 + cyclesBeyond;
    return `EP${out} → EP${out + 1} (${electionYear})`;
}
/**
 * Parse an ISO date string as UTC midnight. Returns `null` for malformed
 * input so callers can skip month/week derivation gracefully.
 *
 * @param iso - ISO date string
 * @returns Parsed `Date` or `null`
 */
function parseIsoDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso))
        return null;
    const parsed = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
/**
 * Format a `Date` as `YYYY-MM-DD` in UTC.
 *
 * @param d - Date object
 * @returns ISO date string
 */
function formatIsoDate(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
/**
 * Extract a manifest override value for a single language. Accepts either
 * a plain string (applied to every language) or a `LanguageMap` object.
 *
 * @param value - Raw manifest value (string or per-lang object)
 * @param lang - Target language code
 * @returns Override string, or empty string when absent
 */
function manifestOverrideFor(value, lang) {
    if (typeof value === 'string')
        return value.trim();
    if (!value)
        return '';
    const map = new Map();
    for (const key of Object.keys(value)) {
        const v = value[key];
        if (typeof v === 'string')
            map.set(key, v);
    }
    const entry = map.get(lang);
    return typeof entry === 'string' ? entry.trim() : '';
}
/**
 * Internal: best editorial `{headline, summary}` pair available from the
 * aggregator output and artefacts, independent of language. Used for
 * tiers 2–4.
 *
 * @param opts - Resolver inputs
 * @returns Editorial content derived from English source
 */
function resolveEditorialContent(opts) {
    const { articleType, date, markdown, runDir } = opts;
    let artefactSummary = '';
    if (runDir) {
        const highlight = extractArtifactHighlight(runDir, articleType, date);
        if (highlight?.headline) {
            return {
                headline: highlight.headline,
                summary: highlight.summary,
            };
        }
        if (highlight?.summary) {
            artefactSummary = highlight.summary;
        }
    }
    const aggregatedH1 = extractFirstH1(markdown);
    const aggregatedSummary = extractStrongProseLine(markdown);
    if (aggregatedH1 && !isGenericHeading(aggregatedH1, articleType, date)) {
        return {
            headline: truncateTitle(aggregatedH1),
            summary: artefactSummary || aggregatedSummary,
        };
    }
    const summary = artefactSummary || aggregatedSummary;
    if (summary) {
        return { headline: truncateTitle(summary), summary };
    }
    return { headline: '', summary: '' };
}
/**
 * Pick the per-language SEO title from the resolved editorial pair and
 * the localized template fallback. The decision tree mirrors the priority
 * ladder in the module header:
 *
 *   - When an editorial headline exists (either translated brief or
 *     English brief / aggregated source), use it **verbatim** — no
 *     concatenation with the localized type/date template. Concatenation
 *     historically produced strings like
 *     `Senaste Nytt: Betydande Parlamentariska Händelser — 2026-05-15 — Breaking News: EP April 2026 Plenary Outcomes`
 *     which mix two languages in a single `<title>` and are blocked by
 *     `scripts/validate-manifest-seo.js`'s `english-fallthrough` gate.
 *   - When no editorial headline exists at all, fall back to the
 *     localized type/date template plus a run qualifier so same-type pages
 *     remain distinguishable.
 *
 * @param fallbackTitle - Localized article-type template title
 * @param editorialHeadline - Editorial headline (localized or English)
 * @param runId - Optional run id used only when no editorial headline exists
 * @returns SEO title candidate
 */
function composeContextualTitle(fallbackTitle, editorialHeadline, runId) {
    if (editorialHeadline)
        return editorialHeadline;
    return withRunQualifier(fallbackTitle, runId);
}
/**
 * Add localized article context to short or duplicate-prone meta
 * descriptions. This turns generic type-level subtitles into
 * page-specific descriptions suitable for search snippets.
 *
 * Internal artefact identifiers (`runId`) are deliberately NOT included
 * in the description: they leak into Google snippets as opaque tokens
 * like `breaking-run255-1778894853` and provide no value to readers.
 * The verbose `evidence` boilerplate (`with source-linked voting,
 * committee and legislative intelligence`) is also dropped — it pads
 * bytes without adding editorial information and was the dominant
 * source of mid-sentence ellipsis truncation observed in production.
 *
 * The reader-hint suffix (`labels.reader`) is preserved because it
 * supplies a stable localized intent signal even when the lede is
 * very short.
 *
 * @param lang - Target language code
 * @param baseDescription - Best description from manifest/editorial/template
 * @param editorial - Artifact-derived headline and summary
 * @param editorial.headline - Artifact-derived headline
 * @param editorial.summary - Artifact-derived summary
 * @param date - ISO article date
 * @param _runId - Reserved (formerly emitted; no longer used)
 * @returns Description in the target language context, capped for SEO snippets
 */
function composeContextualDescription(lang, baseDescription, editorial, date, _runId) {
    const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
    const parts = [baseDescription.trim()];
    parts.push(`${labels.date} ${date}.`);
    const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
    if (context && !containsNormalized(parts[0] ?? '', context)) {
        parts.push(`${labels.context}: ${context}`);
    }
    parts.push(labels.reader);
    return truncateDescription(parts.join(' '));
}
/**
 * Append a short run qualifier to otherwise duplicate-prone fallback
 * titles. Sanitizes the raw `runId` (which is an internal artefact
 * identifier of the shape `<slug>-run<N>[-<unix-ts>]`) so user-facing
 * `<title>` strings never expose Unix timestamps or the full opaque
 * token. Only the short ordinal `N` is retained.
 *
 * Examples:
 * - `breaking-run255-1778894853` → `Run 255`
 * - `committee-reports-run330-1778735854` → `Run 330`
 * - `breaking-run-001` → `Run 001`
 *
 * When the runId does not match the canonical shape, the qualifier is
 * omitted entirely rather than leak an unknown-format token into SEO
 * surfaces.
 *
 * @param title - Base title
 * @param runId - Optional run id (sanitized before use)
 * @returns Title with short run qualifier, or unchanged when sanitization fails
 */
function withRunQualifier(title, runId) {
    if (!runId)
        return title;
    // Walk segments backwards: find the last `run<digits>` token. The
    // runId shape is `<slug>-run<N>[-<unix-ts>]` — we explicitly avoid a
    // single regex with overlapping `\d+` groups, which the SonarJS
    // unsafe-regex rule flags as catastrophic-backtracking-prone.
    const segments = runId.split('-');
    for (const seg of segments) {
        const m = /^run(\d+)$/u.exec(seg);
        if (m)
            return `${title} — Run ${m[1]}`;
        const m2 = /^run$/u.exec(seg);
        if (m2) {
            const idx = segments.indexOf(seg);
            const next = segments[idx + 1];
            if (next && /^\d+$/u.test(next))
                return `${title} — Run ${next}`;
        }
    }
    return title;
}
/**
 * Case-insensitive containment check after whitespace normalization.
 *
 * @param haystack - Text to search
 * @param needle - Text to locate
 * @returns True when `needle` is already present in `haystack`
 */
function containsNormalized(haystack, needle) {
    const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
    const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
    return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}
/**
 * Build a stable, localized keyword list from the article type plus the
 * resolved title/description context.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param date - ISO article date
 * @param runId - Optional run id
 * @param title - Resolved title
 * @param description - Resolved description
 * @returns De-duplicated keywords for `<meta name="keywords">`
 */
export function buildSeoKeywords(lang, articleType, date, runId, title, description) {
    const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
    const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value;
    const fallback = ['EU Parliament', 'European Parliament', 'political intelligence'];
    const candidates = [
        ...(base ?? fallback),
        humanizeSlug(articleType),
        date,
        ...(runId ? [`run ${runId}`] : []),
        ...extractKeywordTerms(`${title} ${description}`),
    ];
    return dedupeKeywords(candidates).slice(0, 16);
}
/**
 * Extract short keyword terms from resolved SEO copy.
 *
 * @param text - Title and description text
 * @returns Candidate terms
 */
function extractKeywordTerms(text) {
    return text
        .split(/[^\p{L}\p{N}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 4 && !/^\d+$/.test(token))
        .slice(0, 18);
}
/**
 * De-duplicate keywords case-insensitively while preserving original order.
 *
 * @param candidates - Raw keyword candidates
 * @returns De-duplicated keyword list
 */
function dedupeKeywords(candidates) {
    const seen = new Set();
    const out = [];
    for (const candidate of candidates) {
        const trimmed = candidate.trim();
        if (!trimmed)
            continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(trimmed);
    }
    return out;
}
/**
 * Resolve per-language `{title, description}` for one article following
 * the priority ladder documented at the top of this module.
 *
 * @param opts - Resolver inputs ({@link ResolveMetadataOptions})
 * @returns One `{title, description}` entry per supported language
 */
export function resolveArticleMetadata(opts) {
    const manifest = opts.manifest ?? {};
    const englishEditorial = resolveEditorialContent(opts);
    const template = buildTemplateFallback(opts.articleType, opts.date, manifest.committee);
    const runId = manifest.runId?.trim() ?? '';
    const result = Object.create(null);
    for (const lang of ALL_LANGUAGES) {
        const entry = resolveOneLanguage({
            lang,
            manifest,
            englishEditorial,
            template: template[lang],
            runDir: opts.runDir,
            articleType: opts.articleType,
            date: opts.date,
            runId,
        });
        Object.defineProperty(result, lang, {
            value: entry,
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    return result;
}
/**
 * Resolve `{title, description, keywords, source}` for one language. The
 * priority ladder is:
 *
 *   1. manifest override (per-language wins, then string fall-through)
 *   2. localized executive brief (`executive-brief_<lang>.md`) headline +
 *      summary — only for non-English `<lang>`
 *   3. English executive brief / aggregated editorial — verbatim for
 *      non-English locales that have no translated brief yet, so the
 *      SEO surfaces never collapse to a boring type/date template while a
 *      real editorial highlight exists
 *   4. localized template fallback
 *
 * @param input - Per-language inputs
 * @returns One resolved metadata entry
 */
function resolveOneLanguage(input) {
    const manifestTitle = manifestOverrideFor(input.manifest.title, input.lang);
    const manifestDescription = manifestOverrideFor(input.manifest.description, input.lang);
    const perLanguage = resolvePerLanguageEditorial(input);
    const editorial = perLanguage.editorial;
    const contextualTitle = composeContextualTitle(input.template.title, editorial.headline, input.runId);
    const title = pickFirstNonEmpty([manifestTitle, contextualTitle, input.template.title]);
    const rawDescription = pickFirstNonEmpty([
        manifestDescription,
        editorial.summary,
        input.template.subtitle,
    ]);
    const description = rawDescription.length >= ENRICHMENT_TRIGGER_LENGTH
        ? rawDescription
        : composeContextualDescription(input.lang, rawDescription, editorial, input.date, input.runId);
    const truncatedTitle = truncateTitle(title);
    const truncatedDescription = truncateDescription(description);
    const source = manifestTitle || manifestDescription ? 'manifest' : perLanguage.source;
    return {
        title: truncatedTitle,
        description: truncatedDescription,
        keywords: buildSeoKeywords(input.lang, input.articleType, input.date, input.runId, truncatedTitle, truncatedDescription),
        source,
    };
}
/**
 * Select the editorial `{headline, summary}` pair for one language,
 * preferring the translated `executive-brief_<lang>.md` over the English
 * brief. Records which tier provided the content so the caller can wire
 * up the editorial fallback note and the manifest-SEO validator without
 * re-scanning the run directory.
 *
 * - For `lang === 'en'`: always returns the English `englishEditorial`
 *   pair (whose source is the canonical English brief / aggregated
 *   Markdown / artefact ladder in {@link resolveEditorialContent}).
 * - For non-English `<lang>`: probes `runDir` for
 *   `executive-brief_<lang>.md` (and the `extended/` sibling) and
 *   prefers its headline + lede. Falls through to the English editorial
 *   when no translated brief exists.
 *
 * @param input - Per-language inputs
 * @returns Editorial pair plus the tier that produced it
 */
function resolvePerLanguageEditorial(input) {
    if (input.lang !== 'en' && input.runDir) {
        const localized = resolveLocalizedBriefHighlight(input.runDir, input.lang, input.articleType, input.date);
        if (localized && (localized.headline || localized.summary)) {
            // Prefer the localized headline; if missing, allow the localized
            // summary to drive the title via {@link composeContextualTitle}'s
            // `editorialHeadline || fallbackTitle` path while still feeding the
            // localized summary into the description.
            return {
                editorial: {
                    headline: localized.headline,
                    summary: localized.summary,
                },
                source: 'localized-brief',
            };
        }
    }
    // No localized brief — fall through to the English editorial pair.
    if (input.englishEditorial.headline || input.englishEditorial.summary) {
        return {
            editorial: input.englishEditorial,
            source: input.lang === 'en' ? 'english-editorial' : 'english-brief',
        };
    }
    // Nothing editorial at all → caller will fall back to the localized
    // template.
    return {
        editorial: { headline: '', summary: '' },
        source: 'template',
    };
}
/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-empty entry
 */
function pickFirstNonEmpty(candidates) {
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0)
            return c.trim();
    }
    return '';
}
//# sourceMappingURL=article-metadata.js.map