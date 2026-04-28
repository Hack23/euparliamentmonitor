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
 *   4. Semantic article color coding based on existing text markers.
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
            bar.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 + '%' : '0%';
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ── Mobile TOC compaction ───────────────────────────────────────── */

  var narrowViewport = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
  if (narrowViewport) {
    document.querySelectorAll('.article-toc-details[open]').forEach(function (toc) {
      toc.removeAttribute('open');
    });
  }

  /* ── Semantic article color coding ───────────────────────────────── */

  var article = document.querySelector('.article-body, .article-content');
  if (article) {
    var toneRules = [
      {
        className: 'intel-tone-critical',
        pattern: /🔴|critical|severe|acute|blocked|crisis|threat|high risk|very high/i,
      },
      {
        className: 'intel-tone-high',
        pattern: /🟠|high|winner|opportunity|accelerat|breakthrough|adopted/i,
      },
      {
        className: 'intel-tone-medium',
        pattern: /🟡|medium|moderate|watch|monitor|uncertain|mixed|neutral/i,
      },
      {
        className: 'intel-tone-low',
        pattern: /🟢|low|stable|resilien|mitigat|on track|confidence/i,
      },
      {
        className: 'intel-tone-source',
        pattern: /source|evidence|admiralty|confidence|methodolog|provenance|audit/i,
      },
    ];
    var toneTargets = article.querySelectorAll('p, li, td, th, blockquote, strong');
    toneTargets.forEach(function (node) {
      if (node.closest('.article-hero')) {
        return;
      }
      var text = node.textContent || '';
      for (var i = 0; i < toneRules.length; i++) {
        if (toneRules[i].pattern.test(text)) {
          node.classList.add(toneRules[i].className);
          break;
        }
      }
    });
    article.querySelectorAll('table').forEach(function (table) {
      table.classList.add('article-intel-table');
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
