// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/CleanArtifact
 * @description Normalise a single analysis-artifact Markdown file so it can be
 * merged into the aggregate document without producing duplicate banners,
 * competing H1 headings, or broken relative links.
 *
 * Applied transformations (in order):
 *   1. Strip leading YAML front-matter (`---\n…\n---\n`).
 *   2. Strip ISMS/owner/classification banners (emoji rows, shields.io badges,
 *      `<p align="center">` blocks, and the separator `---` that usually
 *      follows them).
 *   3. Remove the artifact's own H1; the aggregator owns the document outline.
 *   4. Demote every remaining heading by one level (H2→H3, etc.) so the
 *      aggregate has a single H1.
 *   5. Rewrite repo-relative links/images to absolute GitHub URLs so the
 *      published HTML is portable.
 *   6. Deduplicate mermaid fence bodies on a per-document basis (caller-owned
 *      state) — identical blocks are replaced with a reference comment.
 */
/** Hack23 repo slug used when building blob/raw URLs. */
const GITHUB_REPO = 'Hack23/euparliamentmonitor';
/** Default branch used in generated URLs. */
const GITHUB_BRANCH = 'main';
/**
 * Build a GitHub blob URL for a repo-relative path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute `https://github.com/.../blob/main/...` URL
 */
export function githubBlobUrl(relPath) {
    return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${relPath.replace(/\\/g, '/')}`;
}
/**
 * Build a `raw.githubusercontent.com` URL for a repo-relative path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute raw-content URL
 */
export function githubRawUrl(relPath) {
    return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${relPath.replace(/\\/g, '/')}`;
}
/**
 * Strip YAML front-matter from the head of a Markdown document. Matches
 * `---\n...\n---\n` *only* at position 0 — quoted `---` dividers deeper in
 * the document are left alone.
 *
 * @param md - Raw Markdown source
 * @returns Markdown with the leading front-matter block removed
 */
export function stripFrontMatter(md) {
    if (!md.startsWith('---'))
        return md;
    const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(md);
    return match ? md.slice(match[0].length) : md;
}
/**
 * Regex patterns identifying banner / document-owner / shields.io / center-pic
 * lines that clutter the aggregate. All are line-level patterns; the caller
 * applies them after front-matter strip.
 */
const BANNER_LINE_PATTERNS = [
    /^\s*<p\s+align="center">/i,
    /^\s*<\/p>\s*$/i,
    /^\s*<img\s+[^>]*hack23\.com\/icon-/i,
    /^\s*<h1\s+align="center">/i,
    /^\s*<\/h1>\s*$/i,
    /^\s*<a\s+href="#"><img\s+src="https:\/\/img\.shields\.io\//i,
    /^\s*\*\*\s*📋\s*Document Owner/i,
    /^\s*\*\*\s*🔄\s*Review Cycle/i,
    /^\s*\*\*\s*🏢\s*Owner/i,
    /^\s*<strong>\s*(?:📋|🔄|🏢)/i,
    // Standalone center-aligned block closings
    /^\s*<\/p>\s*$/,
];
/**
 * Line-level matcher for a standalone horizontal rule. Used to drop the
 * `---` separator that usually follows the banner block.
 */
const HR_LINE = /^\s*---\s*$/;
/**
 * Return true when the line should be stripped as banner content.
 *
 * @param line - Single line of Markdown
 * @returns `true` if the line matches any banner pattern
 */
function isBannerLine(line) {
    for (const p of BANNER_LINE_PATTERNS) {
        if (p.test(line))
            return true;
    }
    return false;
}
/**
 * Drop banner/metadata blocks from the head of the document. Rules:
 *  - A run of banner lines (contiguous, or separated only by blank lines) is
 *    removed. A trailing `---` horizontal rule immediately after the banner
 *    run is also removed.
 *  - Stops scanning as soon as we hit a line that looks like real content
 *    (headings, prose, tables, fences) that isn't a banner or blank.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, lines }` — stripped Markdown and count of removed lines
 */
export function stripBanners(md) {
    const lines = md.split('\n');
    let i = 0;
    let bannerEnd = 0;
    let stripped = 0;
    while (i < lines.length) {
        const line = lines[i] ?? '';
        if (isBannerLine(line)) {
            bannerEnd = i + 1;
            stripped++;
            i++;
            continue;
        }
        if (line.trim() === '') {
            // blank line — keep scanning for more banner lines
            i++;
            continue;
        }
        // Real content reached — but absorb a trailing HR if it immediately
        // follows a banner run.
        if (bannerEnd > 0 && HR_LINE.test(line)) {
            bannerEnd = i + 1;
            stripped++;
        }
        break;
    }
    if (bannerEnd === 0)
        return { md, lines: 0 };
    return { md: lines.slice(bannerEnd).join('\n').replace(/^\n+/, ''), lines: stripped };
}
/**
 * Remove every H1 (`^# ` and the setext H1 form) and demote every other
 * ATX heading by one level. Setext H2 (`----` underline) stays as H2 because
 * converting it to H3 would require replacing the underline form.
 *
 * Skips changes inside fenced code blocks.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, h1Count }` — transformed Markdown and number of H1s removed
 */
/**
 * Track open/close of a fenced code block. Returns the updated fence state
 * and the original line (unmodified). Centralising the state machine keeps
 * callers simple and makes cognitive complexity linear.
 *
 * @param line - Current line of Markdown
 * @param inFence - Whether the previous line was inside a fenced block
 * @param fenceMarker - Opening marker for the current fence (or `""`)
 * @returns `{ inFence, fenceMarker, matched }` reflecting the state after
 *          processing `line`; `matched` is `true` when the line itself is a
 *          fence boundary (and should therefore be passed through verbatim)
 */
function advanceFenceState(line, inFence, fenceMarker) {
    const fenceMatch = /^(\s*)(```+|~~~+)(.*)$/.exec(line);
    if (!fenceMatch || !fenceMatch[2])
        return { inFence, fenceMarker, matched: false };
    const marker = fenceMatch[2];
    if (!inFence) {
        return { inFence: true, fenceMarker: marker, matched: true };
    }
    if (marker.startsWith(fenceMarker.charAt(0)) && marker.length >= fenceMarker.length) {
        return { inFence: false, fenceMarker: '', matched: true };
    }
    return { inFence, fenceMarker, matched: true };
}
/**
 * Transform one non-fence heading line: setext H1, ATX H1, or ATX H2-H6.
 * Returns the processed output plus how many source lines it consumed and
 * whether an H1 was removed.
 *
 * @param lines - All source lines (used to peek at the next line for setext)
 * @param index - Zero-based index of the line under consideration
 * @returns `{ output, consumed, h1Removed }` — `consumed` is how many lines
 *          the caller should advance by (1 for ATX; 2 for setext H1; 0 when
 *          the line is not a heading at all)
 */
function processHeadingLine(lines, index) {
    const line = lines[index] ?? '';
    // Setext H1: current line has text, next line is `===+`
    const nextLine = lines[index + 1] ?? '';
    if (/^\s*=+\s*$/.test(nextLine) && /\S/.test(line)) {
        return { output: null, consumed: 2, h1Removed: true };
    }
    const atx = /^(\s*)(#{1,6})(\s.*)$/.exec(line);
    if (!atx || !atx[2]) {
        return { output: line, consumed: 1, h1Removed: false };
    }
    const level = atx[2].length;
    if (level === 1) {
        return { output: null, consumed: 1, h1Removed: true };
    }
    const demoted = level === 6 ? '######' : '#'.repeat(level + 1);
    return {
        output: `${atx[1] ?? ''}${demoted}${atx[3] ?? ''}`,
        consumed: 1,
        h1Removed: false,
    };
}
/**
 * Remove every H1 (`^# ` and the setext H1 form) and demote every other
 * ATX heading by one level. Setext H2 (`----` underline) stays as H2 because
 * converting it to H3 would require replacing the underline form.
 *
 * Skips changes inside fenced code blocks.
 *
 * @param md - Raw Markdown source
 * @returns `{ md, h1Count }` — transformed Markdown and number of H1s removed
 */
export function demoteHeadings(md) {
    const lines = md.split('\n');
    const out = [];
    let inFence = false;
    let fenceMarker = '';
    let h1Count = 0;
    let i = 0;
    while (i < lines.length) {
        const line = lines[i] ?? '';
        const fence = advanceFenceState(line, inFence, fenceMarker);
        if (fence.matched || inFence) {
            inFence = fence.inFence;
            fenceMarker = fence.fenceMarker;
            out.push(line);
            i++;
            continue;
        }
        const result = processHeadingLine(lines, i);
        if (result.h1Removed)
            h1Count++;
        if (result.output !== null)
            out.push(result.output);
        i += result.consumed;
    }
    return { md: out.join('\n'), h1Count };
}
/**
 * Resolve a relative link target against the artifact's directory and
 * return an absolute GitHub URL.
 *
 * @param target - Original link target (e.g. `../templates/foo.md`)
 * @param artifactRelPath - Repo-relative path of the artifact
 * @param raw - When true, produce a raw.githubusercontent URL (for images)
 * @returns Absolute URL (or the original target for anchors/absolute links)
 */
export function resolveLink(target, artifactRelPath, raw) {
    // Preserve absolute URLs, anchors, mailto/tel, and protocol-relative
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target) ||
        target.startsWith('//') ||
        target.startsWith('#') ||
        target.startsWith('mailto:') ||
        target.startsWith('tel:') ||
        target.startsWith('data:')) {
        return target;
    }
    const artifactDir = artifactRelPath.split('/').slice(0, -1).join('/');
    // Split off an optional `#fragment` or `?query` suffix for re-attachment.
    const suffixMatch = /[#?].*$/.exec(target);
    const suffix = suffixMatch ? suffixMatch[0] : '';
    const bare = suffix ? target.slice(0, -suffix.length) : target;
    const resolved = posixResolve(artifactDir, bare);
    const url = raw ? githubRawUrl(resolved) : githubBlobUrl(resolved);
    return `${url}${suffix}`;
}
/**
 * POSIX path-resolve over `/`-separated strings. Mirrors `path.posix.resolve`
 * on a virtual absolute root so we don't depend on `path` for pure string ops.
 *
 * @param baseDir - Directory portion of the base path (POSIX separators)
 * @param rel - Relative path to resolve against `baseDir`
 * @returns Resolved path with `.` / `..` segments collapsed
 */
function posixResolve(baseDir, rel) {
    const parts = `${baseDir}/${rel}`.split('/');
    const stack = [];
    for (const part of parts) {
        if (part === '' || part === '.')
            continue;
        if (part === '..') {
            stack.pop();
            continue;
        }
        stack.push(part);
    }
    return stack.join('/');
}
/**
 * Rewrite `[text](relative.md)` and `![alt](img.png)` links to GitHub URLs.
 *
 * @param md - Markdown source (may contain fenced code blocks, left untouched)
 * @param artifactRelPath - Repo-relative path of the artifact
 * @returns Markdown with every non-fence-local link rewritten
 */
export function rewriteLinks(md, artifactRelPath) {
    const lines = md.split('\n');
    let inFence = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (/^\s*(```+|~~~+)/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence)
            continue;
        lines[i] = rewriteLinksInLine(line, artifactRelPath);
    }
    return lines.join('\n');
}
/**
 * Rewrite every `[text](target)` occurrence in a single non-fenced line.
 * Uses a manual scanner instead of a global regex to avoid catastrophic
 * backtracking on nested brackets.
 *
 * @param line - One line of Markdown, outside any fenced code block
 * @param artifactRelPath - Repo-relative path of the source artifact
 * @returns Line with every local `.md` target rewritten to a GitHub URL
 */
/**
 * Attempt to parse a Markdown link starting at `line[index]`. Returns
 * `null` when no valid `[text](target)` / `![alt](target)` link is present.
 *
 * @param line - Source line being scanned
 * @param index - Zero-based index of the candidate `[` or `!`
 * @param artifactRelPath - Repo-relative path of the source artifact
 * @returns `{ replacement, nextIndex }` when a link was rewritten, else `null`
 */
function tryParseLinkAt(line, index, artifactRelPath) {
    const ch = line.charAt(index);
    const isImage = ch === '!' && line.charAt(index + 1) === '[';
    const isLink = ch === '[';
    if (!isImage && !isLink)
        return null;
    const start = isImage ? index + 1 : index;
    const closeText = findMatchingBracket(line, start);
    if (closeText === -1 || line.charAt(closeText + 1) !== '(')
        return null;
    const openParen = closeText + 1;
    const closeParen = findMatchingParen(line, openParen);
    if (closeParen === -1)
        return null;
    const label = line.slice(start, closeText + 1);
    const rawTarget = line.slice(openParen + 1, closeParen).trim();
    const { target, title } = splitTargetAndTitle(rawTarget);
    const newTarget = resolveLink(target, artifactRelPath, isImage);
    const replacement = (isImage ? '!' : '') + label + '(' + newTarget + title + ')';
    return { replacement, nextIndex: closeParen + 1 };
}
/**
 * Rewrite every `[text](target)` occurrence in a single non-fenced line.
 * Uses a manual scanner instead of a global regex to avoid catastrophic
 * backtracking on nested brackets.
 *
 * @param line - One line of Markdown, outside any fenced code block
 * @param artifactRelPath - Repo-relative path of the source artifact
 * @returns Line with every local `.md` target rewritten to a GitHub URL
 */
function rewriteLinksInLine(line, artifactRelPath) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const parsed = tryParseLinkAt(line, i, artifactRelPath);
        if (parsed) {
            out += parsed.replacement;
            i = parsed.nextIndex;
            continue;
        }
        out += line.charAt(i);
        i++;
    }
    return out;
}
/**
 * Split a raw Markdown link target into its URL and optional `"title"`
 * suffix. Uses a linear scanner instead of a regex to avoid catastrophic
 * backtracking on pathological input.
 *
 * @param raw - Raw contents between the parentheses of a Markdown link
 * @returns `{ target, title }` where `title` is `""` when absent, or the
 *          leading whitespace + `"..."` suffix when present
 */
function splitTargetAndTitle(raw) {
    let i = 0;
    while (i < raw.length && !/\s/.test(raw.charAt(i)))
        i++;
    if (i === raw.length)
        return { target: raw, title: '' };
    const target = raw.slice(0, i);
    const rest = raw.slice(i);
    // Accept only exactly-matched `"..."` title; otherwise treat whole thing
    // as part of the target so we don't silently drop content.
    const trimmed = rest.trimStart();
    if (trimmed.length >= 2 &&
        trimmed.charAt(0) === '"' &&
        trimmed.charAt(trimmed.length - 1) === '"') {
        return { target, title: rest };
    }
    return { target: raw, title: '' };
}
/**
 * Index of the matching `]` for a `[` at position `start`, or `-1` if none.
 *
 * @param line - Line being scanned
 * @param start - Zero-based index of the opening `[`
 * @returns Zero-based index of the matching `]`, or `-1`
 */
function findMatchingBracket(line, start) {
    let depth = 0;
    for (let i = start; i < line.length; i++) {
        const ch = line.charAt(i);
        if (ch === '\\') {
            i++;
            continue;
        }
        if (ch === '[')
            depth++;
        else if (ch === ']') {
            depth--;
            if (depth === 0)
                return i;
        }
    }
    return -1;
}
/**
 * Index of the matching `)` for a `(` at position `start`, or `-1` if none.
 *
 * @param line - Line being scanned
 * @param start - Zero-based index of the opening `(`
 * @returns Zero-based index of the matching `)`, or `-1`
 */
function findMatchingParen(line, start) {
    let depth = 0;
    for (let i = start; i < line.length; i++) {
        const ch = line.charAt(i);
        if (ch === '\\') {
            i++;
            continue;
        }
        if (ch === '(')
            depth++;
        else if (ch === ')') {
            depth--;
            if (depth === 0)
                return i;
        }
    }
    return -1;
}
/**
 * Deduplicate identical mermaid fence blocks by body hash. The caller owns
 * the `seen` Set so dedup state persists across artifacts in the same
 * aggregate.
 *
 * When a duplicate is found the fence is replaced with a single-line HTML
 * comment pointing at the earlier occurrence. Non-mermaid fences are left
 * untouched.
 *
 * @param md - Markdown source that may contain mermaid fences
 * @param seen - Shared set of mermaid-body hashes (caller-owned)
 * @returns `{ md, deduped }` — cleaned Markdown and count of replacements
 */
/**
 * Scan forward from `start` to find the body and closing fence of a
 * mermaid block whose opening was detected on `lines[start - 1]`.
 *
 * @param lines - Source lines
 * @param start - Index of the first body line after the opening fence
 * @returns `{ body, closeIndex }` — body lines and index of the closing
 *          fence (or `lines.length` if no closing fence is present)
 */
function scanMermaidBody(lines, start) {
    const body = [];
    let j = start;
    while (j < lines.length) {
        const candidate = lines[j] ?? '';
        if (/^\s*```+\s*$/.test(candidate))
            break;
        body.push(candidate);
        j++;
    }
    return { body, closeIndex: j };
}
/**
 * Deduplicate identical mermaid fence blocks by body hash. The caller owns
 * the `seen` Set so dedup state persists across artifacts in the same
 * aggregate.
 *
 * When a duplicate is found the fence is replaced with a single-line HTML
 * comment pointing at the earlier occurrence. Non-mermaid fences are left
 * untouched.
 *
 * @param md - Markdown source that may contain mermaid fences
 * @param seen - Shared set of mermaid-body hashes (caller-owned)
 * @returns `{ md, deduped }` — cleaned Markdown and count of replacements
 */
export function dedupMermaid(md, seen) {
    const lines = md.split('\n');
    const out = [];
    let deduped = 0;
    let i = 0;
    while (i < lines.length) {
        const line = lines[i] ?? '';
        if (!/^\s*```+\s*mermaid\s*$/i.test(line)) {
            out.push(line);
            i++;
            continue;
        }
        const { body, closeIndex } = scanMermaidBody(lines, i + 1);
        const hash = hashString(body.join('\n').trim());
        if (seen.has(hash)) {
            out.push(`<!-- mermaid block deduplicated: identical to earlier occurrence (hash=${hash}) -->`);
            deduped++;
        }
        else {
            seen.add(hash);
            out.push(line);
            out.push(...body);
            if (closeIndex < lines.length)
                out.push(lines[closeIndex] ?? '');
        }
        i = closeIndex + 1;
    }
    return { md: out.join('\n'), deduped };
}
/**
 * 32-bit FNV-1a hash rendered as hex. Not cryptographic — used only to
 * identify identical mermaid bodies within one aggregate document. The
 * surface is entirely derived from committed repo content.
 *
 * @param input - String to hash
 * @returns 8-character lowercase hex digest
 */
function hashString(input) {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
}
/**
 * Apply all cleanup passes and return the normalised Markdown plus
 * simple counters for telemetry/tests.
 *
 * @param source - Raw Markdown contents of the artifact file
 * @param options - Cleanup options (artifact path, shared mermaid dedup set)
 * @returns {@link CleanArtifactResult} with the normalised Markdown
 */
export function cleanArtifact(source, options) {
    const seen = options.seenMermaidHashes ?? new Set();
    let md = stripFrontMatter(source);
    const { md: mdAfterBanners, lines: strippedBannerLines } = stripBanners(md);
    md = mdAfterBanners;
    const { md: mdAfterHeadings, h1Count } = demoteHeadings(md);
    md = mdAfterHeadings;
    md = rewriteLinks(md, options.artifactRelPath);
    const { md: mdAfterMermaid, deduped } = dedupMermaid(md, seen);
    md = mdAfterMermaid;
    // Collapse excessive blank lines to at most 2 consecutive blanks
    md = md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
    return {
        markdown: md,
        strippedH1s: h1Count,
        strippedBannerLines,
        dedupedMermaidBlocks: deduped,
    };
}
//# sourceMappingURL=clean-artifact.js.map