// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Article runtime helpers for EU Parliament Monitor news articles.
 *
 * Handles two small UI concerns that used to be emitted as inline
 * <script> blocks by `src/templates/article-template.ts`:
 *
 *   1. Reading-progress bar width driven by scroll position.
 *   2. Theme (dark/light) toggle backed by localStorage ("ep-theme").
 *   3. Mobile article table-of-contents compaction.
 *
 * Externalising these removes the need for per-article SHA-256 CSP
 * hashes — the article CSP can stay at `script-src 'self'`.
 */

(function () {
  'use strict';

  /* ── Reading progress bar ────────────────────────────────────────── */

  var bar = document.querySelector('.reading-progress');
  if (bar) {
    bar.style.display = 'block';
    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            var h = document.documentElement;
            var scrollTop = h.scrollTop || document.body.scrollTop;
            var scrollHeight = h.scrollHeight - h.clientHeight;
            bar.style.width =
              scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 + '%' : '0%';
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ── Mobile TOC compaction ───────────────────────────────────────── */

  var narrowViewport =
    window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
  if (narrowViewport) {
    document.querySelectorAll('.article-toc-details[open]').forEach(function (toc) {
      toc.removeAttribute('open');
    });
  }

  /* ── Theme toggle ────────────────────────────────────────────────── */

  var docEl = document.documentElement;
  var t = null;
  try {
    t = localStorage.getItem('ep-theme');
  } catch (_err) {
    /* localStorage disabled — continue without persistence */
  }
  var storedTheme = t === 'light' ? 'light' : t === 'dark' ? 'dark' : null;
  if (storedTheme) {
    docEl.setAttribute('data-theme', storedTheme);
  } else if (t) {
    try {
      localStorage.removeItem('ep-theme');
    } catch (_err) {
      /* ignore */
    }
  }

  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var cur = docEl.getAttribute('data-theme');
    if (!cur) {
      cur =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
    var next = cur === 'dark' ? 'light' : 'dark';
    docEl.setAttribute('data-theme', next);
    try {
      localStorage.setItem('ep-theme', next);
    } catch (_err) {
      /* ignore */
    }
  });
})();
