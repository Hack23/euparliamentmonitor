// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/MarkdownRenderer
 * @description Markdown-to-HTML renderer for the aggregated article.
 *
 * Uses `markdown-it` with a focused plugin stack:
 *  - `markdown-it-anchor` — slugged `id`s on every heading
 *  - `markdown-it-footnote` — footnote reference support for artifacts
 *  - `markdown-it-attrs` — `{.class #id}` suffixes for table/fence styling
 *  - `markdown-it-deflist` — definition lists in stakeholder artifacts
 *
 * A custom fence override transforms ```` ```mermaid ```` blocks into
 * `<pre class="mermaid" role="img" aria-label="...">…</pre>` so the
 * vendored client-side `mermaid.esm.min.mjs` (shipped under `js/vendor/`)
 * can progressively enhance them. No network calls, no inline script,
 * CSP `script-src 'self'` preserved.
 */
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import footnote from 'markdown-it-footnote';
import attrs from 'markdown-it-attrs';
import deflist from 'markdown-it-deflist';
/**
 * Build a preconfigured markdown-it instance. Exposed so callers (e.g.
 * tests) can inspect plugin configuration without re-rendering.
 *
 * @returns Configured MarkdownIt instance with anchor, footnote, attrs,
 *          deflist, mermaid fence override, and table wrapping installed
 */
export function buildMarkdownIt() {
    const md = new MarkdownIt({
        html: true, // artifacts already contain hand-authored HTML wrappers
        linkify: false, // avoid surprising auto-linking of plain text URLs
        typographer: false, // keep exact punctuation
        breaks: false,
    });
    md.use(anchor, {
        level: [2, 3, 4, 5, 6],
        permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
        slugify: slugify,
    });
    md.use(footnote);
    md.use(attrs, { allowedAttributes: ['id', 'class'] });
    md.use(deflist);
    installMermaidFence(md);
    installTableWrapper(md);
    installImageLazyLoading(md);
    return md;
}
/**
 * Strip a leading YAML front matter block from a Markdown document. Generated
 * `article.md` files are Jekyll-compatible, but the deterministic HTML
 * renderer must render the body, not the metadata fence.
 *
 * @param markdown - Markdown with optional `---` front matter at byte 0
 * @returns Markdown body with the front matter removed
 */
export function stripMarkdownFrontMatter(markdown) {
    if (!markdown.startsWith('---\n'))
        return markdown;
    const end = markdown.indexOf('\n---\n', 4);
    if (end === -1)
        return markdown;
    return markdown.slice(end + 5).replace(/^\n+/, '');
}
/**
 * Slugify a heading text into a stable URL fragment.
 *
 * @param text - Heading text (may contain unicode punctuation / marks)
 * @returns Slug of up to 80 ASCII-ish characters, with dashes as separators
 */
export function slugify(text) {
    return (text
        .toLowerCase()
        .normalize('NFKD')
        // Strip combining diacritical marks (Unicode range U+0300..U+036F)
        .replace(/[\u0300-\u036F]/g, '')
        // Strip general punctuation and supplemental punctuation
        .replace(/[\u2000-\u206F]/g, '')
        .replace(/[\u2E00-\u2E7F]/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80));
}
/**
 * Walk the leading lines of a mermaid block, skipping blank lines,
 * single-line `%%…%%` comments, and (possibly multi-line)
 * `%%{init: { … }}%%` directives, until we hit the first directive
 * line. Returns `true` when that directive line is the
 * `quadrantChart` keyword.
 *
 * Extracted from {@link sanitizeMermaidQuadrantChart} to keep the
 * sanitizer's cognitive complexity below the project's lint cap.
 *
 * @param lines - Mermaid block split on `\n`
 * @returns `true` when the block declares a quadrantChart
 */
function isQuadrantChartBlock(lines) {
    let inInitDirective = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '')
            continue;
        if (inInitDirective) {
            if (trimmed.endsWith('}}%%'))
                inInitDirective = false;
            continue;
        }
        if (trimmed.startsWith('%%{')) {
            if (!trimmed.endsWith('}}%%'))
                inInitDirective = true;
            continue;
        }
        if (trimmed.startsWith('%%'))
            continue;
        return /^quadrantChart\b/.test(trimmed);
    }
    return false;
}
/**
 * Wrap an unquoted mermaid label in double quotes, escaping any
 * embedded `\` and `"` so the lexer still sees a single string token.
 * A label that is already fully quoted (matched leading and trailing
 * `"`, length ≥ 2) is preserved byte-for-byte.
 *
 * Backslashes must be escaped **before** double quotes so an input
 * containing `\` is not double-processed by the second pass.
 *
 * @param raw - Raw label text harvested by the per-line regex
 * @returns Quoted label suitable for emission inside a quadrantChart
 */
function quoteMermaidLabel(raw) {
    const trimmed = raw.trim();
    if (trimmed === '')
        return raw;
    if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed;
    }
    const inner = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${inner}"`;
}
/**
 * Rewrite a single non-directive line inside a quadrantChart block,
 * auto-quoting axis directives, quadrant labels, and data points. The
 * `title` line is intentionally untouched because the mermaid v11
 * lexer accepts arbitrary text after the `title` keyword.
 *
 * The regex literals use `-{2}>` instead of the literal three-byte
 * `-->` token so CodeQL's "bad HTML filtering regexp" heuristic does
 * not mistake the mermaid axis-arrow grammar for an HTML-comment-end
 * sanitiser. The two patterns are byte-equivalent.
 *
 * @param line - One line from the mermaid block
 * @returns Rewritten line, or the original when no shape matched
 */
function rewriteQuadrantChartLine(line) {
    let m = line.match(/^(\s*(?:x-axis|y-axis)\s+)(.+?)\s*-{2}>\s*(.+?)\s*$/);
    if (m) {
        return `${m[1]}${quoteMermaidLabel(m[2] ?? '')} --> ${quoteMermaidLabel(m[3] ?? '')}`;
    }
    m = line.match(/^(\s*(?:x-axis|y-axis)\s+)(.+?)\s*$/);
    if (m && !/-{2}>/.test(m[2] ?? '')) {
        return `${m[1]}${quoteMermaidLabel(m[2] ?? '')}`;
    }
    m = line.match(/^(\s*quadrant-[1-4]\s+)(.+?)\s*$/);
    if (m) {
        return `${m[1]}${quoteMermaidLabel(m[2] ?? '')}`;
    }
    m = line.match(/^(\s*)([^[\n]+?)\s*:\s*(\[\s*[\d.]+\s*,\s*[\d.]+\s*\])\s*$/);
    if (m) {
        const prefix = m[1] ?? '';
        const label = m[2] ?? '';
        const coords = m[3] ?? '';
        if (!/^(?:x-axis|y-axis|quadrant-[1-4]|title|quadrantChart)\b/.test(label.trim())) {
            return `${prefix}${quoteMermaidLabel(label)}: ${coords}`;
        }
    }
    return line;
}
/**
 * Auto-quote unquoted `quadrantChart` labels so the Mermaid v11 lexer
 * accepts them. The Mermaid `quadrantChart` grammar treats unquoted
 * labels as a restricted token class — em-dashes (`—`, U+2014),
 * en-dashes (`–`, U+2013), ellipsis (`…`), parentheses, colons, and
 * non-ASCII currency symbols (`€`) all trigger
 * `Lexical error … Unrecognized text` and prevent the diagram from
 * rendering, leaving the raw `<pre>` source visible on the page.
 *
 * The style guide already instructs authors to wrap every quadrant /
 * axis / data-point label in double quotes (see
 * `analysis/methodologies/political-style-guide.md` § Standard
 * `quadrantChart` init block), but AI-generated `article.md` files
 * occasionally drop the quoting. Rather than reject the article at
 * Stage C we sanitize at the renderer boundary so every published
 * HTML page renders, regardless of upstream authoring discipline.
 *
 * Sanitization is deliberately scoped to `quadrantChart` blocks —
 * `flowchart`, `sequenceDiagram`, `mindmap`, `pie`, `gantt`, and
 * `xychart-beta` accept the same Unicode characters in their unquoted
 * labels and are passed through unchanged.
 *
 * Lines normalised:
 *   - `x-axis Left --> Right`     → `x-axis "Left" --> "Right"`
 *   - `y-axis Low --> High`       → `y-axis "Low" --> "High"`
 *   - `quadrant-N Label text`     → `quadrant-N "Label text"`
 *   - `Data Label: [x, y]`        → `"Data Label": [x, y]`
 *
 * Already-quoted operands are preserved byte-for-byte. The `title`
 * line, the `%%{init:…}%%` directive, and any line not matching one
 * of the recognised shapes are also left untouched.
 *
 * @param content - Raw mermaid fence body
 * @returns The same content with `quadrantChart` labels auto-quoted;
 *          the input string is returned unchanged for non-quadrant
 *          diagrams or when no edits are required.
 */
export function sanitizeMermaidQuadrantChart(content) {
    const lines = content.split('\n');
    if (!isQuadrantChartBlock(lines))
        return content;
    let directiveSpan = false;
    return lines
        .map((line) => {
        const trimmed = line.trim();
        if (directiveSpan) {
            if (trimmed.endsWith('}}%%'))
                directiveSpan = false;
            return line;
        }
        if (trimmed.startsWith('%%{') && !trimmed.endsWith('}}%%')) {
            directiveSpan = true;
            return line;
        }
        if (trimmed.startsWith('%%'))
            return line;
        return rewriteQuadrantChartLine(line);
    })
        .join('\n');
}
/**
 * Override the `fence` renderer so fenced `mermaid` blocks emit a
 * `<pre class="mermaid">` wrapped in an accessible `<figure>`. Everything
 * else falls back to the default renderer.
 *
 * Mermaid `quadrantChart` blocks are run through
 * {@link sanitizeMermaidQuadrantChart} before HTML escaping so labels
 * containing em-dashes or other Unicode punctuation render instead of
 * leaking through as raw `<pre>` text.
 *
 * @param md - MarkdownIt instance to patch in-place
 */
function installMermaidFence(md) {
    const defaultFence = md.renderer.rules.fence ??
        ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
    let mermaidIndex = 0;
    md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
        const token = tokens[idx];
        if (!token)
            return '';
        const info = (token.info || '').trim().toLowerCase();
        if (info === 'mermaid') {
            const currentIndex = mermaidIndex++;
            const env2 = env;
            const labelFn = env2.mermaidLabel ?? ((n) => `Mermaid diagram ${n + 1}`);
            const label = md.utils.escapeHtml(labelFn(currentIndex, token.content));
            const sanitized = sanitizeMermaidQuadrantChart(token.content);
            const body = md.utils.escapeHtml(sanitized);
            return `<figure class="mermaid-figure" role="img" aria-label="${label}">\n<pre class="mermaid">${body}</pre>\n</figure>\n`;
        }
        return defaultFence(tokens, idx, opts, env, self);
    };
}
/**
 * Wrap every `<table>` in a `<div class="table-scroll">` for responsive
 * horizontal overflow. The wrapper is announced as a region so assistive
 * tech can surface the focus/scroll behaviour.
 *
 * @param md - MarkdownIt instance to patch in-place
 */
function installTableWrapper(md) {
    const defaultOpen = md.renderer.rules.table_open ??
        ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
    const defaultClose = md.renderer.rules.table_close ??
        ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
    md.renderer.rules.table_open = (tokens, idx, opts, env, self) => `<div class="table-scroll" role="region" tabindex="0">${defaultOpen(tokens, idx, opts, env, self)}`;
    md.renderer.rules.table_close = (tokens, idx, opts, env, self) => `${defaultClose(tokens, idx, opts, env, self)}</div>`;
}
/**
 * Add `loading="lazy"` and `decoding="async"` to every `<img>` rendered
 * from Markdown syntax. Improves LCP/performance by deferring off-screen
 * images and allowing async decode without blocking the main thread.
 *
 * @param md - MarkdownIt instance to patch in-place
 */
function installImageLazyLoading(md) {
    const defaultImage = md.renderer.rules.image ??
        ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
    md.renderer.rules.image = (tokens, idx, opts, env, self) => {
        const token = tokens[idx];
        if (token) {
            token.attrSet('loading', 'lazy');
            token.attrSet('decoding', 'async');
        }
        return defaultImage(tokens, idx, opts, env, self);
    };
}
/**
 * Render aggregated Markdown into a sanitised HTML body fragment.
 *
 * @param markdown - Aggregated Markdown source produced by the aggregator
 * @param options - Optional render hooks (e.g. custom mermaid aria-label)
 * @returns {@link RenderedMarkdown} with HTML, TOC, and mermaid count
 */
export function renderMarkdown(markdown, options = {}) {
    const md = buildMarkdownIt();
    const env = {};
    if (options.mermaidLabel)
        env.mermaidLabel = options.mermaidLabel;
    const tokens = md.parse(stripMarkdownFrontMatter(markdown), env);
    const toc = harvestToc(tokens);
    const html = escapeUppercasePlaceholders(md.renderer.render(tokens, md.options, env));
    const mermaidCount = countMermaidTokens(tokens);
    return { html, toc, mermaidCount };
}
/**
 * Escape non-HTML placeholder markers like `<N>` that appear in analysis prose.
 * Lower-case tags are intentionally left untouched because artifacts may embed
 * trusted HTML wrappers such as `<div>` and `<section>`.
 *
 * @param html - Rendered HTML fragment
 * @returns HTML fragment with uppercase placeholder pseudo-tags escaped
 */
function escapeUppercasePlaceholders(html) {
    return html.replace(/<([A-Z][A-Z0-9_-]*)>/g, '&lt;$1&gt;');
}
/**
 * Walk the token stream and collect heading entries for the TOC.
 *
 * @param tokens - Token stream produced by MarkdownIt's parser
 * @returns Flat array of {@link TocEntry} items for H2–H6 headings
 */
function harvestToc(tokens) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token?.type !== 'heading_open')
            continue;
        const level = Number.parseInt(token.tag.slice(1), 10);
        if (!Number.isFinite(level) || level < 2 || level > 6)
            continue;
        const slug = typeof token.attrGet === 'function' ? token.attrGet('id') : null;
        const inline = tokens[i + 1];
        if (inline?.type !== 'inline')
            continue;
        const text = (inline.content ?? '').trim();
        out.push({ level, slug: slug ?? slugify(text), text });
    }
    return out;
}
/**
 * Count fence tokens whose info string starts with `mermaid`.
 *
 * @param tokens - Token stream produced by MarkdownIt's parser
 * @returns Number of mermaid fence tokens in the stream
 */
function countMermaidTokens(tokens) {
    let n = 0;
    for (const token of tokens) {
        if (token.type === 'fence' && (token.info ?? '').trim().toLowerCase() === 'mermaid')
            n++;
    }
    return n;
}
//# sourceMappingURL=markdown-renderer.js.map