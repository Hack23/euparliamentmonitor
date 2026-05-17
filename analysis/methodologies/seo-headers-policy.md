<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# SEO Headers Policy

Authoritative contract for `<head>`, OpenGraph, Twitter-card, and JSON-LD
output emitted by the **four** generators that ship public HTML on
[euparliamentmonitor.com](https://euparliamentmonitor.com):

| # | Surface | Generator entry point | LOC owner |
|---|---------|-----------------------|-----------|
| 1 | News article (~5,000/yr) | `src/aggregator/article-html.ts` :: `wrapArticleHtml` | aggregator pipeline |
| 2 | News index (14 langs) | `src/generators/news-indexes.ts` :: `renderNewsIndex` | static-site generators |
| 3 | Sitemap (14 langs) | `src/generators/sitemap/html.ts` :: `generateSitemapHTML` | static-site generators |
| 4 | Political-intelligence landing (14 langs) | `src/generators/political-intelligence/html.ts` :: `renderPoliticalIntelligenceHTML` | static-site generators |

All four surfaces share the same canonical header set so a social-card
preview, a search snippet, and an RSS feed item resolve identically
regardless of where a reader entered the site.

The single source of truth for this contract is
[`test/unit/seo-headers-contract.test.js`](../../test/unit/seo-headers-contract.test.js).
Drift breaks CI immediately — no manual visual-regression audit needed.

---

## 1 Core meta block (all 4 surfaces)

Every page MUST emit, in this order:

```
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Content-Language" content="<lang>">
<meta name="referrer" content="no-referrer">
<title>… | EU Parliament Monitor</title>
<meta name="description" content="…"> <!-- ≤ 180 chars -->
<meta name="keywords"   content="…"> <!-- localized -->
<meta name="author"     content="Hack23 AB">
<meta name="publisher"  content="Hack23 AB">
<meta name="robots"     content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical"   href="<absolute-https-url>">
<link rel="alternate" type="application/rss+xml"
      title="EU Parliament Monitor RSS"
      href="<rss-href>">
<link rel="preconnect" href="https://hack23.com" crossorigin>
```

### 1.1 Title rules

* English uses ` | ` (space-pipe-space) as the separator.
* RTL locales (`ar`, `he`) use ` ׀ ` (Hebrew paseq U+05C0, padded with
  spaces) so the title doesn't reverse direction mid-string in
  bidirectional renderers — see `getTitleSeparator()`.
* CJK locales use the full-width middle dot ` ・ ` for typographic
  parity with native publications.

### 1.2 Description rules

* `<meta name="description">` ≤ **180 chars** — matches Google's
  desktop SERP truncation budget.
* `<meta property="og:description">` / `<meta name="twitter:description">`
  use the **extendedDescription** (≤ 300 chars) when the brief carries
  a longer BLUF paragraph. Falls back to the short description when
  the brief is short.
* Both are extracted from the **per-language executive brief** before
  the resolver falls back to the manifest's pre-baked summary. The
  manifest summary is the safety net, not the headline source.

### 1.3 Keywords rules

* Localized per surface in `src/generators/seo-copy.ts`. Each of the
  13 non-English locales has its own keyword string — no English
  fallthrough.

---

## 2 OpenGraph block

```
<meta property="og:type" content="website|article">
<meta property="og:title" content="…">
<meta property="og:description" content="<extendedDescription or description>">
<meta property="og:url" content="<canonical>">
<meta property="og:site_name" content="EU Parliament Monitor">
<meta property="og:locale" content="<BCP-47>">                <!-- e.g. en_GB -->
<meta property="og:locale:alternate" content="…"> × 13         <!-- one per other lang -->
<meta property="og:image" content="<absolute-https>">          <!-- ≥ 1200×630 -->
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="<localized alt>">
```

* `og:locale` is the **BCP-47 underscore form** (`en_GB`, `sv_SE`,
  `nb_NO`, …), **not** the bare ISO 639-1 code. The mapping table is
  in `src/constants/og-locales.ts`. Facebook silently falls back to
  `en_US` when the bare form is emitted, breaking the Hebrew/Arabic
  card previews discovered in the April-2026 SEO audit.
* English defaults to **`en_GB`** because the editorial voice is
  European English (Eurostat / EUR-Lex style).
* Norwegian → `nb_NO` (Bokmål) — matches the translation pipeline.
* Chinese → `zh_CN` (Simplified) — matches the translation pipeline.

### 2.1 Article-only properties

News articles MUST emit:

```
<meta property="article:published_time" content="<ISO-8601>">
<meta property="article:modified_time"  content="<ISO-8601>">
<meta property="article:section"        content="<localized article type>">
<meta property="article:author"         content="Hack23 AB">
<meta property="article:publisher"      content="Hack23 AB">
```

The `article:*` namespace is the **only** permitted form — the legacy
`<meta name="article:published_time">` is banned and a contract test
fails CI on the legacy form.

---

## 3 Twitter / X block

```
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="…">
<meta name="twitter:description" content="<extendedDescription or description>">
<meta name="twitter:image" content="<absolute-https>">
<meta name="twitter:image:alt" content="<localized alt>">
<!-- Optional: only emitted when provisioned -->
<meta name="twitter:site"    content="@…">
<meta name="twitter:creator" content="@…">
```

Handles live in `src/constants/social-handles.ts`. They ship empty in
the public repository (no verified org account as of May 2026). The
helper `buildTwitterAttributionTags()` skips empty handles so the
public deployment never emits a malformed empty-value tag.

---

## 4 Theme & color-scheme

```
<meta name="color-scheme" content="light dark">
<meta name="theme-color"   content="#003399" media="(prefers-color-scheme: light)">
<meta name="theme-color"   content="#0a1a38" media="(prefers-color-scheme: dark)">
```

* `color-scheme` declares both schemes so the browser pre-paints the
  correct background before CSS loads, eliminating the white-flash
  on first paint in dark-mode.
* Two `theme-color` tags (one per scheme) is the W3C-recommended form;
  iOS Safari, Chrome Android and Edge all respect it.

---

## 5 JSON-LD graph (every surface)

Each generator emits a fixed set of structured-data blocks:

| Type | Required on | Notes |
|------|-------------|-------|
| `WebSite` | All 4 | Carries `inLanguage`, publisher reference |
| `NewsMediaOrganization` | All 4 | `@id`, `logo` (ImageObject), `sameAs` from `ORG_SAME_AS` |
| `BreadcrumbList` | News-index, sitemap, PI | Two-level (home → current) |
| `CollectionPage` | News-index, sitemap, PI | Lists articles, holds breadcrumb |
| `FAQPage` | All 4 (where applicable) | `mainEntity[]` matches visible `<details>` byte-for-byte |
| `NewsArticle` | Article | Headline ≤ 110 chars, `wordCount`, `image[]`, `mainEntityOfPage`, `speakable`, localized `articleSection` |

### 5.1 NewsArticle specifics

* **`headline`** ≤ **110 chars** — Google Top Stories eligibility rule.
  Truncation is delegated to `truncateHeadline()` in
  `article-metadata.ts`.
* **`image`** is an array of three `ImageObject` entries: the 1200×630
  PNG (OG), the 1200×630 WebP, and the 1200×630 AVIF — Google ranks
  modern formats higher for Discover surfaces.
* **`speakable`** points at the `.bluf` CSS selector so Google
  Assistant / Voice Search can read the lede aloud.
* **`mainEntityOfPage`** is the canonical URL wrapped in a `WebPage`
  node — required for the Top Stories carousel.
* **`wordCount`** is computed from the rendered body (post-HTML-strip),
  not from the markdown source — keeps the value honest after the
  Stage-D HTML enrichment passes.
* **`articleSection`** is the **localized** label of the article type
  (`Breaking`, `Plenarsessioner`, `週次レビュー`, …) — `articleType`
  is the slug, `articleSection` is the prose form.

### 5.2 Publisher graph

* Every publisher / author reference is a `NewsMediaOrganization`
  (not bare `Organization`) so Google Top Stories and the
  Google News Publisher Center accept the site.
* `sameAs` is exported as a frozen array from
  `src/constants/social-handles.ts :: ORG_SAME_AS` and is
  HTTPS-only.

---

## 6 hreflang block

```
<link rel="alternate" hreflang="<each lang>" href="<absolute>">
<link rel="alternate" hreflang="x-default" href="<English canonical>">
```

* 14 `hreflang` entries (one per supported language) + 1 `x-default`
  pointing at the English URL.
* `x-default` is mandatory — without it Google routes non-targeted
  locales to the highest-traffic variant, which in practice is German.

---

## 7 Localization rules

* **All four surfaces** emit the same set of localized fields:
  `<title>`, `<meta description>`, `<meta keywords>`, `og:image:alt`,
  breadcrumb labels, FAQ heading, RSS title, JSON-LD `inLanguage`.
* The FAQ Q/A bodies themselves are **still rendered in English** so
  the visible-text / structured-data byte-equivalence guarantee
  remains trivial to audit. Full per-language FAQ translation is
  tracked as a follow-up — see the comment block above
  `NEWS_INDEX_OVERLAYS` in `src/generators/seo-copy.ts`.
* The fallback chain for any missing localized field is
  **brief → manifest → English copy** — never silent default to a
  hard-coded English string in the generator.

---

## 8 What is **explicitly** banned

| Banned pattern | Reason |
|----------------|--------|
| `<meta name="article:published_time">` | Wrong namespace (must be `property=`) |
| `<meta property="og:locale" content="en">` | Wrong shape (must be `en_GB`) |
| `"@type":"Organization"` for the publisher | Google Top Stories requires `NewsMediaOrganization` |
| `<meta name="twitter:site" content="">` | Empty value — Twitter rejects |
| Headline > 110 chars in JSON-LD | Disqualifies Top Stories carousel |
| `articleSection` carrying a slug (`breaking`) | Must be the prose form (`Breaking news`) |
| Inline `<style>` in `<head>` outside the audited theme-toggle | CSP-violation risk |

CI enforces every row in `test/unit/seo-headers-contract.test.js` and
in the surface-specific tests
(`test/unit/article-html.test.js`,
`test/unit/sitemap-html.test.js`,
`test/unit/news-indexes-backfill-description.test.js`).

---

## 9 Adding a new SEO field

1. Edit the localized copy in `src/generators/seo-copy.ts` (or
   `src/constants/og-locales.ts` for locale-shape additions, or
   `src/constants/social-handles.ts` for verified-handle additions).
2. Thread the field through the four generators **in the order listed
   in the table at the top of this file**.
3. Extend `test/unit/seo-headers-contract.test.js` with a new
   contract assertion that verifies the field on each surface that
   emits it.
4. Run `npm run prebuild && npm test` — golden-file byte-equality
   tests for the sitemap & news-index will need fresh fixtures if
   the field changes their byte layout.
5. Update this document with the new row in §1–§5 plus, when
   relevant, a new banned-pattern row in §8.
