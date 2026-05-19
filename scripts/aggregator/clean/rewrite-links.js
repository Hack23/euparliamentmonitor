// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Clean/RewriteLinks
 * @description Rewrite repo-relative Markdown links/images to absolute
 * GitHub URLs so the published HTML is portable.
 */
import { blobUrl as _blobUrl, rawUrl as _rawUrl } from '../infra/github-urls.js';
/**
 * Build a GitHub blob URL for a repo-relative path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute `https://github.com/.../blob/main/...` URL
 */
export function githubBlobUrl(relPath) {
    return _blobUrl(relPath);
}
/**
 * Build a `raw.githubusercontent.com` URL for a repo-relative path.
 *
 * @param relPath - Repo-relative file path
 * @returns Absolute raw-content URL
 */
export function githubRawUrl(relPath) {
    return _rawUrl(relPath);
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
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target) ||
        target.startsWith('//') ||
        target.startsWith('#') ||
        target.startsWith('mailto:') ||
        target.startsWith('tel:') ||
        target.startsWith('data:')) {
        return target;
    }
    const artifactDir = artifactRelPath.split('/').slice(0, -1).join('/');
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
//# sourceMappingURL=rewrite-links.js.map