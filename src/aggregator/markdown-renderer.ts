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
import type Token from 'markdown-it/lib/token.mjs';

/** Options controlling {@link renderMarkdown}. */
export interface RenderOptions {
  /**
   * Optional accessible label builder for mermaid figures. Receives the
   * zero-based mermaid block index and the raw mermaid source; returns
   * the `aria-label` used on the wrapping `<figure>`. Defaults to
   * `"Mermaid diagram N"`.
   */
  readonly mermaidLabel?: (index: number, body: string) => string;
}

/** Output from {@link renderMarkdown}. */
export interface RenderedMarkdown {
  /** Full HTML body fragment (no `<html>` / `<head>` wrapper). */
  readonly html: string;
  /** Table-of-contents entries harvested from the heading stream. */
  readonly toc: readonly TocEntry[];
  /** Number of mermaid blocks rendered. */
  readonly mermaidCount: number;
}

/** One entry in the generated table of contents. */
export interface TocEntry {
  /** Heading level (2–6). */
  readonly level: number;
  /** Slugged id used as the fragment anchor. */
  readonly slug: string;
  /** Heading text (escaped for display). */
  readonly text: string;
}

/**
 * Build a preconfigured markdown-it instance. Exposed so callers (e.g.
 * tests) can inspect plugin configuration without re-rendering.
 *
 * @returns Configured MarkdownIt instance with anchor, footnote, attrs,
 *          deflist, mermaid fence override, and table wrapping installed
 */
export function buildMarkdownIt(): MarkdownIt {
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
export function stripMarkdownFrontMatter(markdown: string): string {
  if (!markdown.startsWith('---\n')) return markdown;
  const end = markdown.indexOf('\n---\n', 4);
  if (end === -1) return markdown;
  return markdown.slice(end + 5).replace(/^\n+/, '');
}

/**
 * Slugify a heading text into a stable URL fragment.
 *
 * @param text - Heading text (may contain unicode punctuation / marks)
 * @returns Slug of up to 80 ASCII-ish characters, with dashes as separators
 */
export function slugify(text: string): string {
  return (
    text
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
      .slice(0, 80)
  );
}

/**
 * Override the `fence` renderer so fenced `mermaid` blocks emit a
 * `<pre class="mermaid">` wrapped in an accessible `<figure>`. Everything
 * else falls back to the default renderer.
 *
 * @param md - MarkdownIt instance to patch in-place
 */
function installMermaidFence(md: MarkdownIt): void {
  const defaultFence =
    md.renderer.rules.fence ??
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  let mermaidIndex = 0;
  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    if (!token) return '';
    const info = (token.info || '').trim().toLowerCase();
    if (info === 'mermaid') {
      const currentIndex = mermaidIndex++;
      const env2 = env as { mermaidLabel?: RenderOptions['mermaidLabel'] };
      const labelFn: RenderOptions['mermaidLabel'] =
        env2.mermaidLabel ?? ((n) => `Mermaid diagram ${n + 1}`);
      const label = md.utils.escapeHtml(labelFn(currentIndex, token.content));
      const body = md.utils.escapeHtml(token.content);
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
function installTableWrapper(md: MarkdownIt): void {
  const defaultOpen =
    md.renderer.rules.table_open ??
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  const defaultClose =
    md.renderer.rules.table_close ??
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  md.renderer.rules.table_open = (tokens, idx, opts, env, self) =>
    `<div class="table-scroll" role="region" tabindex="0">${defaultOpen(tokens, idx, opts, env, self)}`;
  md.renderer.rules.table_close = (tokens, idx, opts, env, self) =>
    `${defaultClose(tokens, idx, opts, env, self)}</div>`;
}

/**
 * Render aggregated Markdown into a sanitised HTML body fragment.
 *
 * @param markdown - Aggregated Markdown source produced by the aggregator
 * @param options - Optional render hooks (e.g. custom mermaid aria-label)
 * @returns {@link RenderedMarkdown} with HTML, TOC, and mermaid count
 */
export function renderMarkdown(markdown: string, options: RenderOptions = {}): RenderedMarkdown {
  const md = buildMarkdownIt();
  const env: { mermaidLabel?: RenderOptions['mermaidLabel'] } = {};
  if (options.mermaidLabel) env.mermaidLabel = options.mermaidLabel;
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
function escapeUppercasePlaceholders(html: string): string {
  return html.replace(/<([A-Z][A-Z0-9_-]*)>/g, '&lt;$1&gt;');
}

/**
 * Walk the token stream and collect heading entries for the TOC.
 *
 * @param tokens - Token stream produced by MarkdownIt's parser
 * @returns Flat array of {@link TocEntry} items for H2–H6 headings
 */
function harvestToc(tokens: readonly Token[]): TocEntry[] {
  const out: TocEntry[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token || token.type !== 'heading_open') continue;
    const level = Number.parseInt(token.tag.slice(1), 10);
    if (!Number.isFinite(level) || level < 2 || level > 6) continue;
    const slug = typeof token.attrGet === 'function' ? token.attrGet('id') : null;
    const inline = tokens[i + 1];
    if (!inline || inline.type !== 'inline') continue;
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
function countMermaidTokens(tokens: readonly Token[]): number {
  let n = 0;
  for (const token of tokens) {
    if (token.type === 'fence' && (token.info ?? '').trim().toLowerCase() === 'mermaid') n++;
  }
  return n;
}
