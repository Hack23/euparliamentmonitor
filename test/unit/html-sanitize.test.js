// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Test/HtmlSanitize
 * @description Unit tests for html-sanitize utility functions.
 * Covers edge cases for script stripping including malformed tags,
 * nested scripts, missing closing tags, and empty input.
 */

import { describe, it, expect } from 'vitest';
import { stripScriptBlocks } from '../../scripts/utils/html-sanitize.js';

describe('html-sanitize', () => {
  describe('stripScriptBlocks', () => {
    it('should return empty string for empty input', () => {
      expect(stripScriptBlocks('')).toBe('');
    });

    it('should return the same string when no script tags are present', () => {
      const html = '<div>Hello <b>world</b></div>';
      expect(stripScriptBlocks(html)).toBe(html);
    });

    it('should strip a simple script block', () => {
      const html = '<div>Before</div><script>alert("xss")</script><div>After</div>';
      const result = stripScriptBlocks(html);
      expect(result).toContain('<div>Before</div>');
      expect(result).toContain('<div>After</div>');
      expect(result).not.toContain('alert');
      expect(result).not.toContain('<script');
    });

    it('should strip multiple script blocks', () => {
      const html =
        '<p>A</p><script>x()</script><p>B</p><script type="text/javascript">y()</script><p>C</p>';
      const result = stripScriptBlocks(html);
      expect(result).toContain('<p>A</p>');
      expect(result).toContain('<p>B</p>');
      expect(result).toContain('<p>C</p>');
      expect(result).not.toContain('x()');
      expect(result).not.toContain('y()');
    });

    it('should handle script tag with attributes', () => {
      const html = '<script type="text/javascript" src="evil.js"></script>';
      const result = stripScriptBlocks(html);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('evil.js');
    });

    it('should be case-insensitive for script tags', () => {
      const html = '<SCRIPT>malicious()</SCRIPT>';
      const result = stripScriptBlocks(html);
      expect(result).not.toContain('malicious');
    });

    it('should handle mixed case script tags', () => {
      const html = '<Script>bad()</Script>';
      const result = stripScriptBlocks(html);
      expect(result).not.toContain('bad');
    });

    it('should handle malformed opening script tag without closing >', () => {
      const html = '<div>Before</div><script no-close-bracket';
      const result = stripScriptBlocks(html);
      // Malformed tag: no closing `>`, keep rest as-is
      expect(result).toContain('<div>Before</div>');
      expect(result).toContain('<script no-close-bracket');
    });

    it('should handle script tag without closing </script> tag', () => {
      const html = '<div>Before</div><script>orphan code';
      const result = stripScriptBlocks(html);
      expect(result).toContain('<div>Before</div>');
      // No closing tag — drop the rest, add space
      expect(result).not.toContain('orphan code');
    });

    it('should handle </script tag without closing >', () => {
      const html = '<script>code</script no-close';
      const result = stripScriptBlocks(html);
      // closeEnd < 0 case — drop the rest
      expect(result).not.toContain('code');
    });

    it('should preserve content before and after script blocks', () => {
      const html = 'Hello <script>x</script> World';
      const result = stripScriptBlocks(html);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should handle empty script tags', () => {
      const html = '<script></script>';
      const result = stripScriptBlocks(html);
      expect(result).not.toContain('<script');
    });

    it('should handle script with newlines', () => {
      const html = '<script>\nconst x = 1;\nconsole.log(x);\n</script>';
      const result = stripScriptBlocks(html);
      expect(result).not.toContain('console.log');
    });

    it('should handle adjacent script blocks', () => {
      const html = '<script>a()</script><script>b()</script>';
      const result = stripScriptBlocks(html);
      expect(result).not.toContain('a()');
      expect(result).not.toContain('b()');
    });

    it('should handle script at the very beginning', () => {
      const html = '<script>x()</script><p>After</p>';
      const result = stripScriptBlocks(html);
      expect(result).toContain('<p>After</p>');
      expect(result).not.toContain('x()');
    });

    it('should handle script at the very end', () => {
      const html = '<p>Before</p><script>y()</script>';
      const result = stripScriptBlocks(html);
      expect(result).toContain('<p>Before</p>');
      expect(result).not.toContain('y()');
    });

    it('should handle plain text without HTML', () => {
      const text = 'Just some plain text without any HTML tags';
      expect(stripScriptBlocks(text)).toBe(text);
    });
  });
});
