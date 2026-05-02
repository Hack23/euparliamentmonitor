// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Index page runtime helpers for EU Parliament Monitor.
 *
 * Handles two UI concerns that were previously emitted as inline
 * <script> blocks by `src/generators/news-indexes.ts`:
 *
 *   1. Filter toolbar — filters news cards by category and search query.
 *   2. Theme (dark/light) toggle backed by localStorage ("ep-theme").
 *
 * Externalising these improves CSP posture (no inline scripts needed)
 * and eliminates code duplication across 14 index pages.
 */

(function () {
  'use strict';

  /* ── News card filter toolbar ────────────────────────────────────── */

  var toolbar = document.querySelector('.filter-toolbar');
  if (toolbar) {
    var buttons = toolbar.querySelectorAll('.filter-btn');
    var search = toolbar.querySelector('.filter-search__input');
    var cards = document.querySelectorAll('.news-card');

    function filterCards() {
      var activeBtn = toolbar.querySelector('.filter-btn.active');
      var activeCat = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
      var query = search ? search.value.toLowerCase() : '';

      cards.forEach(function (card) {
        var badge = card.querySelector('.news-card__badge');
        var cardCat = badge ? badge.className.replace(/.*news-card__badge--/, '') : '';
        var titleEl = card.querySelector('.news-card__title');
        var text = (titleEl ? titleEl.textContent : '').toLowerCase();
        var excerptEl = card.querySelector('.news-card__excerpt');
        var excerptText = (excerptEl ? excerptEl.textContent : '').toLowerCase();
        var matchCat = activeCat === 'all' || cardCat === activeCat;
        var matchSearch = !query || text.indexOf(query) !== -1 || excerptText.indexOf(query) !== -1;
        card.style.display = matchCat && matchSearch ? '' : 'none';
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        filterCards();
      });
    });

    if (search) {
      search.addEventListener('input', filterCards);
    }
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
  function syncPressed() {
    var cur = docEl.getAttribute('data-theme');
    if (!cur) {
      cur =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
    btn.setAttribute('aria-pressed', cur === 'dark' ? 'true' : 'false');
  }
  syncPressed();
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
    btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) {
      mq.addEventListener('change', syncPressed);
    }
  }
})();
