// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Ambient module declarations for markdown-it plugins that ship without
 * first-party TypeScript types. Each plugin takes a `MarkdownIt` instance
 * and optional options; that's the full API we consume.
 */

declare module 'markdown-it-footnote' {
  import type MarkdownIt from 'markdown-it';
  const plugin: (md: MarkdownIt) => void;
  export default plugin;
}

declare module 'markdown-it-attrs' {
  import type MarkdownIt from 'markdown-it';
  interface AttrsOptions {
    readonly leftDelimiter?: string;
    readonly rightDelimiter?: string;
    readonly allowedAttributes?: readonly string[];
  }
  const plugin: (md: MarkdownIt, options?: AttrsOptions) => void;
  export default plugin;
}

declare module 'markdown-it-deflist' {
  import type MarkdownIt from 'markdown-it';
  const plugin: (md: MarkdownIt) => void;
  export default plugin;
}
