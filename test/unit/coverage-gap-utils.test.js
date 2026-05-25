// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Targeted unit tests filling coverage gaps in small utility modules:
 *  - scripts/mcp/ep-open-data/utils.js  (unwrapLabel, wrapAsMCPResult, extractIdentifier)
 *  - scripts/mcp/imf/observations.js    (unwrapLocalisedLabel — non-English fallback)
 *  - scripts/utils/intelligence/internals.js (removeIdFromMap multi-id branch, slugify hash fallback,
 *                                             addIdToMap dedup, escape helpers, dangerous-key safeguard)
 *  - scripts/templates/icons.js          (unknown-name fallback)
 *  - scripts/mcp/transport/process.js    (handleIncomingMessage routing)
 */

import { describe, it, expect, vi } from 'vitest';

import {
  unwrapLabel,
  wrapAsMCPResult as wrapEPAsMCPResult,
  extractIdentifier,
} from '../../scripts/mcp/ep-open-data/utils.js';
import {
  unwrapLocalisedLabel,
  wrapAsMCPResult as wrapIMFAsMCPResult,
} from '../../scripts/mcp/imf/observations.js';
import {
  isSafeKey,
  createNullMap,
  removeIdFromMap,
  addIdToMap,
  slugify,
  escapeAttr,
  escapeText,
} from '../../scripts/utils/intelligence/internals.js';
import { icon } from '../../scripts/templates/icons.js';
import { handleIncomingMessage } from '../../scripts/mcp/transport/process.js';

describe('ep-open-data/utils', () => {
  describe('unwrapLabel', () => {
    it('returns empty string for empty/undefined input', () => {
      expect(unwrapLabel(undefined)).toBe('');
      expect(unwrapLabel('')).toBe('');
    });

    it('returns plain string inputs unchanged', () => {
      expect(unwrapLabel('hello')).toBe('hello');
    });

    it('prefers the English entry of a multilingual object', () => {
      expect(unwrapLabel({ en: 'English', fr: 'Anglais', de: 'Englisch' })).toBe('English');
    });

    it('falls back to the first string value when no English entry exists', () => {
      expect(unwrapLabel({ fr: 'Bonjour', de: 'Hallo' })).toBe('Bonjour');
    });

    it('returns empty string when the object contains no string values', () => {
      // Cast through unknown — types disallow this but defensive code should handle it
      expect(unwrapLabel(/** @type {any} */ ({ a: 123, b: null }))).toBe('');
    });
  });

  describe('wrapAsMCPResult', () => {
    it('embeds plain strings without JSON.stringify', () => {
      const r = wrapEPAsMCPResult('hello');
      expect(r).toEqual({ content: [{ type: 'text', text: 'hello' }] });
    });

    it('JSON-stringifies non-string payloads', () => {
      const r = wrapEPAsMCPResult({ a: 1 });
      expect(r.content[0].text).toBe('{"a":1}');
    });

    it('serialises nullish payloads as JSON null', () => {
      expect(wrapEPAsMCPResult(undefined).content[0].text).toBe('null');
      expect(wrapEPAsMCPResult(null).content[0].text).toBe('null');
    });
  });

  describe('extractIdentifier', () => {
    it('prefers the explicit identifier field', () => {
      expect(extractIdentifier({ identifier: 'X-1', '@id': 'http://example/foo/bar' })).toBe('X-1');
    });

    it('falls back to the final path segment of @id', () => {
      expect(extractIdentifier({ '@id': 'http://example.org/decisions/EN-001' })).toBe('EN-001');
    });

    it('returns the raw @id when it contains no slash', () => {
      expect(extractIdentifier({ '@id': 'plain-id' })).toBe('plain-id');
    });

    it('returns empty string when neither field is present', () => {
      expect(extractIdentifier({})).toBe('');
    });
  });
});

describe('imf/observations', () => {
  describe('unwrapLocalisedLabel', () => {
    it('returns empty string for empty/undefined input', () => {
      expect(unwrapLocalisedLabel(undefined)).toBe('');
      expect(unwrapLocalisedLabel('')).toBe('');
    });

    it('passes through plain string values', () => {
      expect(unwrapLocalisedLabel('World Economic Outlook')).toBe('World Economic Outlook');
    });

    it('prefers English when available', () => {
      expect(unwrapLocalisedLabel({ en: 'WEO', fr: 'PEM' })).toBe('WEO');
    });

    it('falls back to first string value when English is missing', () => {
      expect(unwrapLocalisedLabel({ fr: 'PEM', de: 'WWA' })).toBe('PEM');
    });

    it('returns empty string when object has no string entries', () => {
      expect(unwrapLocalisedLabel(/** @type {any} */ ({ a: 1, b: false }))).toBe('');
    });
  });

  describe('wrapAsMCPResult', () => {
    it('produces the canonical MCP shape for objects', () => {
      const r = wrapIMFAsMCPResult({ k: 'v' });
      expect(r).toEqual({ content: [{ type: 'text', text: '{"k":"v"}' }] });
    });
  });
});

describe('utils/intelligence/internals', () => {
  describe('isSafeKey', () => {
    it('rejects prototype-pollution keys', () => {
      expect(isSafeKey('__proto__')).toBe(false);
      expect(isSafeKey('constructor')).toBe(false);
      expect(isSafeKey('prototype')).toBe(false);
    });

    it('accepts normal keys', () => {
      expect(isSafeKey('safe')).toBe(true);
      expect(isSafeKey('')).toBe(true); // empty string is technically safe; map will just use it
    });
  });

  describe('createNullMap', () => {
    it('returns a null-prototype object', () => {
      const m = createNullMap();
      expect(Object.getPrototypeOf(m)).toBeNull();
      expect(Object.keys(m)).toEqual([]);
    });
  });

  describe('removeIdFromMap', () => {
    it('removes the id but keeps the key when other ids remain (covers reassignment branch)', () => {
      const map = { topic: ['a', 'b', 'c'] };
      removeIdFromMap(map, ['topic'], 'b');
      expect(map['topic']).toEqual(['a', 'c']);
    });

    it('deletes the key entirely when the last id is removed', () => {
      const map = { topic: ['only'] };
      removeIdFromMap(map, ['topic'], 'only');
      expect('topic' in map).toBe(false);
    });

    it('ignores missing keys', () => {
      const map = { topic: ['a'] };
      removeIdFromMap(map, ['missing'], 'a');
      expect(map['topic']).toEqual(['a']);
    });

    it('skips dangerous keys without crashing', () => {
      const map = { safe: ['a'] };
      removeIdFromMap(map, ['__proto__', 'constructor', 'prototype', 'safe'], 'a');
      expect('safe' in map).toBe(false);
      // Critically — Object.prototype is untouched
      expect(Object.prototype).not.toHaveProperty('polluted');
    });
  });

  describe('addIdToMap', () => {
    it('adds a new id under each key', () => {
      const map = {};
      addIdToMap(map, ['topic-a', 'topic-b'], 'art1');
      expect(map).toEqual({ 'topic-a': ['art1'], 'topic-b': ['art1'] });
    });

    it('deduplicates existing ids', () => {
      const map = { topic: ['art1'] };
      addIdToMap(map, ['topic'], 'art1');
      expect(map['topic']).toEqual(['art1']);
    });

    it('appends to an existing list', () => {
      const map = { topic: ['art1'] };
      addIdToMap(map, ['topic'], 'art2');
      expect(map['topic']).toEqual(['art1', 'art2']);
    });

    it('skips dangerous keys (no prototype pollution)', () => {
      const map = {};
      addIdToMap(map, ['__proto__', 'constructor', 'prototype'], 'evil');
      expect(map).toEqual({});
      expect(/** @type {any} */ ({}).polluted).toBeUndefined();
    });
  });

  describe('slugify', () => {
    it('slugifies plain ASCII text', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('trims leading/trailing dashes', () => {
      expect(slugify('  ---foo--- ')).toBe('foo');
    });

    it('preserves non-Latin Unicode letters', () => {
      // Cyrillic, CJK, etc. should slug to lowercase letters not collapse to empty
      const s = slugify('Привет Мир');
      expect(s.length).toBeGreaterThan(0);
      expect(s).toContain('-');
    });

    it('returns a deterministic hash for purely punctuation input', () => {
      const a = slugify('!!!---???');
      const b = slugify('!!!---???');
      expect(a).toBe(b);
      expect(a).toMatch(/^h[0-9a-z]+$/);
    });

    it('returns different hashes for different punctuation inputs', () => {
      const a = slugify('!!!');
      const b = slugify('???');
      expect(a).not.toBe(b);
    });

    it('returns a hash fallback for the empty string', () => {
      const s = slugify('');
      expect(s).toMatch(/^h[0-9a-z]+$/);
    });
  });

  describe('escapeAttr', () => {
    it('escapes all HTML-attribute special characters', () => {
      expect(escapeAttr(`<a href="x" & 'y' > z`)).toBe(
        '&lt;a href=&quot;x&quot; &amp; &#39;y&#39; &gt; z'
      );
    });

    it('returns plain text unchanged', () => {
      expect(escapeAttr('plain')).toBe('plain');
    });
  });

  describe('escapeText', () => {
    it('escapes &, <, > only (single/double quotes preserved)', () => {
      expect(escapeText(`<b>"a&b"</b>`)).toBe('&lt;b&gt;"a&amp;b"&lt;/b&gt;');
    });
  });
});

describe('templates/icons', () => {
  it('returns an inert span for unknown icon names', () => {
    // @ts-expect-error - intentionally passing an invalid name to exercise the fallback branch
    const html = icon('not-a-real-icon');
    expect(html).toBe('<span class="icon icon-inline" aria-hidden="true"></span>');
  });

  it('renders a real icon as an SVG with default sizing', () => {
    const html = icon('external');
    expect(html).toContain('<svg ');
    expect(html).toContain('width="18"');
    expect(html).toContain('height="18"');
    expect(html).toContain('class="icon icon-inline"');
  });

  it('honours custom size and className options', () => {
    const html = icon('external', { size: 24, className: 'custom' });
    expect(html).toContain('width="24"');
    expect(html).toContain('class="icon icon-inline custom"');
  });

  it('falls back to default size for non-positive numbers', () => {
    const html = icon('external', { size: 0 });
    expect(html).toContain('width="18"');
  });
});

describe('mcp/transport/process: handleIncomingMessage', () => {
  it('resolves a pending request with the result payload', () => {
    const pending = new Map();
    const resolve = vi.fn();
    const reject = vi.fn();
    pending.set(1, { resolve, reject });

    handleIncomingMessage(JSON.stringify({ id: 1, result: { ok: true } }), pending);
    expect(resolve).toHaveBeenCalledWith({ ok: true });
    expect(reject).not.toHaveBeenCalled();
    expect(pending.has(1)).toBe(false);
  });

  it('rejects a pending request when the JSON-RPC envelope carries an error', () => {
    const pending = new Map();
    const resolve = vi.fn();
    const reject = vi.fn();
    pending.set(2, { resolve, reject });

    handleIncomingMessage(
      JSON.stringify({ id: 2, error: { code: -32000, message: 'boom' } }),
      pending
    );
    expect(reject).toHaveBeenCalledTimes(1);
    const err = reject.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('boom');
    expect(pending.has(2)).toBe(false);
  });

  it('uses a fallback message when JSON-RPC error has no message field', () => {
    const pending = new Map();
    const reject = vi.fn();
    pending.set(3, { resolve: vi.fn(), reject });

    handleIncomingMessage(JSON.stringify({ id: 3, error: { code: -32001 } }), pending);
    expect(reject.mock.calls[0][0].message).toBe('MCP server error');
  });

  it('logs notifications (id missing, method present) without touching pending', () => {
    const pending = new Map();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleIncomingMessage(JSON.stringify({ method: 'notifications/progress' }), pending);
    expect(spy).toHaveBeenCalledWith('MCP Notification: notifications/progress');
    spy.mockRestore();
  });

  it('logs and swallows malformed JSON without throwing', () => {
    const pending = new Map();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => handleIncomingMessage('this is not json', pending)).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('ignores responses for ids that are not in the pending map', () => {
    const pending = new Map();
    // Should be a silent no-op — no exception, no console output expected
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    handleIncomingMessage(JSON.stringify({ id: 999, result: 'orphan' }), pending);
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
