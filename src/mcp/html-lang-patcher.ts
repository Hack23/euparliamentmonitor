// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/HtmlLangPatcher
 * @description Patches structural HTML metadata in a copied English article
 * file so that the file's language-specific markup matches the target locale.
 *
 * ## What this does
 *
 * When a new article is generated in English and then copied to language-
 * specific placeholder files (e.g. `news/2025-01-01-breaking-de.html`),
 * the copy still contains English-language metadata. This module rewrites
 * only the metadata regions of the file (NOT the article body text, which
 * is translated separately by an AI translation step):
 *
 * - `<html lang="en">` → `<html lang="<lang>">`
 * - `<html dir="ltr|rtl">` → `<html dir="<langDir>">`
 * - `<article lang="en">` → `<article lang="<lang>">`
 * - JSON-LD `"inLanguage": "en"` → `"inLanguage": "<lang>"`
 * - `<meta property="og:locale" content="...">` → target `ogLocale`
 * - Self-referential URLs in `<link rel="canonical">` and
 *   `<meta property="og:url">` tags, and JSON-LD `@id`/`url` fields: replaces
 *   the English filename component with the language-specific filename.
 *   `rel="alternate"` / hreflang links are intentionally NOT rewritten.
 *
 * ## Usage
 *
 * ```typescript
 * import { patchHtmlLang } from './html-lang-patcher.js';
 *
 * patchHtmlLang('/path/to/news/2025-01-01-breaking-de.html', {
 *   lang: 'de',
 *   langDir: 'ltr',
 *   ogLocale: 'de_DE',
 *   enBasename: '2025-01-01-breaking.html',
 *   langBasename: '2025-01-01-breaking-de.html',
 * });
 * ```
 *
 * Or use the lower-level {@link patchHtmlContent} to work with string content
 * directly (without reading/writing files).
 *
 * @author Hack23 AB
 * @license Apache-2.0
 */

import * as fs from 'node:fs';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Parameters for the HTML language patch operation. */
export interface HtmlLangPatchOptions {
  /** BCP-47 language tag for the target locale, e.g. `"de"`, `"fr"`. */
  readonly lang: string;
  /** Text direction for the target locale: `"ltr"` or `"rtl"`. */
  readonly langDir: 'ltr' | 'rtl';
  /** Open Graph locale string, e.g. `"de_DE"`, `"ar_AR"`. */
  readonly ogLocale: string;
  /** Basename of the source English HTML file, e.g. `"2025-01-01-breaking.html"`. */
  readonly enBasename: string;
  /** Basename of the target language HTML file, e.g. `"2025-01-01-breaking-de.html"`. */
  readonly langBasename: string;
}

// ─── Core logic (pure — operates on string content) ──────────────────────────

/**
 * Apply all language patches to the given HTML content string and return the
 * patched string.
 *
 * Scope is intentionally narrow: only document-level lang/dir attributes,
 * JSON-LD language fields, og:locale, and self-referential URL fields are
 * rewritten. Body content is left untouched.
 *
 * @param content - Raw HTML file content.
 * @param opts - Patch parameters.
 * @returns Patched HTML content.
 */
export function patchHtmlContent(content: string, opts: HtmlLangPatchOptions): string {
  const { lang, langDir, ogLocale, enBasename, langBasename } = opts;

  let c = content;

  // 1. Document-level <html> and <article> lang/dir attributes
  c = c.replace(/(<html\b[^>]*\s)lang="en"/, `$1lang="${lang}"`);
  c = c.replace(/(<html\b[^>]*\s)dir="(?:ltr|rtl)"/, `$1dir="${langDir}"`);
  c = c.replace(/(<article\b[^>]*\s)lang="en"/, `$1lang="${lang}"`);

  // 2. JSON-LD inLanguage
  c = c.replace(/("inLanguage"\s*:\s*")en(")/g, `$1${lang}$2`);

  // 3. og:locale meta tag
  c = c.replace(/(<meta\s+property="og:locale"\s+content=")[^"]*(")/g, `$1${ogLocale}$2`);

  // 3b. Content-Language meta tag
  c = c.replace(/(<meta\s+http-equiv="Content-Language"\s+content=")[^"]*(")/g, `$1${lang}$2`);

  // 4. Self-referential URL fields.
  // Restricted to rel="canonical" links and property="og:url" meta only —
  // rel="alternate"/hreflang links are intentionally excluded.
  const enEsc = enBasename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 4a. <link rel="canonical" href="..."> (any attribute order; lookahead guards rel value)
  c = c.replace(
    /(<link\b(?=[^>]*\brel="canonical")[^>]*\shref=")([^"]*)(")/g,
    (_, p1: string, p2: string, p3: string) =>
      p1 + p2.replace(new RegExp(enEsc, 'g'), langBasename) + p3
  );

  // 4b. <meta property="og:url" content="..."> (any attribute order)
  c = c.replace(
    /(<meta\b(?=[^>]*\bproperty="og:url")[^>]*\scontent=")([^"]*)(")/g,
    (_, p1: string, p2: string, p3: string) =>
      p1 + p2.replace(new RegExp(enEsc, 'g'), langBasename) + p3
  );

  // 4c. JSON-LD @id, url, mainEntityOfPage fields
  c = c.replace(
    /("(?:@id|url|mainEntityOfPage)"\s*:\s*")([^"]*)(")/g,
    (_, j1: string, j2: string, j3: string) =>
      j1 + j2.replace(new RegExp(enEsc, 'g'), langBasename) + j3
  );

  return c;
}

// ─── File I/O wrapper ─────────────────────────────────────────────────────────

/**
 * Read an HTML file, apply language patches, and write the result back to the
 * same file (in-place).
 *
 * @param filePath - Absolute path to the target HTML file.
 * @param opts - Patch parameters.
 * @param readFileImpl - Injectable read function (default: `fs.readFileSync`).
 * @param writeFileImpl - Injectable write function (default: `fs.writeFileSync`).
 * @throws If the file cannot be read or written.
 */
export function patchHtmlLang(
  filePath: string,
  opts: HtmlLangPatchOptions,
  readFileImpl: (p: string, enc: BufferEncoding) => string = fs.readFileSync,
  writeFileImpl: (p: string, data: string, enc: BufferEncoding) => void = fs.writeFileSync
): void {
  const original = readFileImpl(filePath, 'utf8');
  const patched = patchHtmlContent(original, opts);
  writeFileImpl(filePath, patched, 'utf8');
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

/**
 * CLI entry point. Positional argument order:
 *
 * ```
 * node html-lang-patcher.js <filePath> <lang> <langDir> <ogLocale> <enBasename> <langBasename>
 * ```
 *
 * @param argv - `process.argv` array (or equivalent for testing).
 */
export function runCli(argv: string[] = process.argv): void {
  const [, , filePath, lang, langDir, ogLocale, enBasename, langBasename] = argv;

  if (!filePath || !lang || !langDir || !ogLocale || !enBasename || !langBasename) {
    process.stderr.write(
      'Usage: html-lang-patcher <filePath> <lang> <langDir> <ogLocale> <enBasename> <langBasename>' +
        String.fromCharCode(10)
    );
    process.exit(1);
    return;
  }

  if (langDir !== 'ltr' && langDir !== 'rtl') {
    process.stderr.write(
      `Error: langDir must be "ltr" or "rtl", got "${langDir}"` + String.fromCharCode(10)
    );
    process.exit(1);
    return;
  }

  patchHtmlLang(filePath, {
    lang,
    langDir: langDir as 'ltr' | 'rtl',
    ogLocale,
    enBasename,
    langBasename,
  });
}

// Run when executed directly
if (
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('html-lang-patcher.js') ||
    process.argv[1].endsWith('html-lang-patcher.ts'))
) {
  runCli();
}
