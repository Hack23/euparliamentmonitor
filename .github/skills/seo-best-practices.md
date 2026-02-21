---
name: seo-best-practices
description: SEO optimization for multi-language EU Parliament news — hreflang, JSON-LD NewsArticle, Core Web Vitals, and GDPR-compliant analytics
license: Apache-2.0
---

# 🔍 SEO Best Practices Skill

## Purpose

Provide actionable SEO guidance for the EU Parliament Monitor — a static HTML site serving political news in 14 EU languages. Covers on-page optimization, technical SEO, structured data, hreflang implementation, and GDPR-compliant discoverability without user tracking.

## When to Use

✅ Creating or updating news article templates (article-template.js)
✅ Configuring sitemap.xml or robots.txt (generate-sitemap.js)
✅ Adding structured data (JSON-LD) to articles
✅ Implementing hreflang for language variants
✅ Optimizing Core Web Vitals for static pages
✅ Reviewing meta tags for multi-language content

❌ Paid search advertising (SEM/PPC)
❌ Social media marketing strategy
❌ Backend API optimization
❌ User behavior tracking or analytics requiring cookies

## Core Framework

### Multi-Language SEO Architecture

```
SEO Architecture:
│
├─ Technical Foundation
│   ├─ sitemap.xml (all languages, updated via generate-sitemap.js)
│   ├─ robots.txt (allow all crawlers, reference sitemap)
│   ├─ Canonical URLs (one per language variant)
│   └─ HTTPS-only (GitHub Pages / CloudFront)
│
├─ On-Page Optimization
│   ├─ Title tags: "<Topic> — EU Parliament Monitor [Lang]"
│   ├─ Meta descriptions: 150-160 chars, language-specific
│   ├─ Heading hierarchy: H1 (article title) → H2 → H3
│   └─ Open Graph + Twitter Card meta tags
│
├─ Structured Data (JSON-LD)
│   ├─ NewsArticle schema for every article
│   ├─ Organization schema for publisher
│   ├─ BreadcrumbList for navigation
│   └─ WebSite schema with SearchAction
│
├─ Hreflang Implementation
│   ├─ 14 language variants per page
│   ├─ x-default pointing to EN variant
│   └─ Bidirectional links across all variants
│
└─ Performance (Core Web Vitals)
    ├─ LCP < 2.5s (static HTML, CDN-cached)
    ├─ FID < 100ms (minimal JavaScript)
    ├─ CLS < 0.1 (stable layout, font-display: swap)
    └─ INP < 200ms (no heavy interactions)
```

### Hreflang Implementation

```html
<!-- Required in <head> for every page — all 14 language variants -->
<link rel="alternate" hreflang="en" href="https://hack23.github.io/euparliamentmonitor/index-en.html" />
<link rel="alternate" hreflang="fr" href="https://hack23.github.io/euparliamentmonitor/index-fr.html" />
<link rel="alternate" hreflang="de" href="https://hack23.github.io/euparliamentmonitor/index-de.html" />
<link rel="alternate" hreflang="es" href="https://hack23.github.io/euparliamentmonitor/index-es.html" />
<link rel="alternate" hreflang="it" href="https://hack23.github.io/euparliamentmonitor/index-it.html" />
<link rel="alternate" hreflang="pt" href="https://hack23.github.io/euparliamentmonitor/index-pt.html" />
<link rel="alternate" hreflang="nl" href="https://hack23.github.io/euparliamentmonitor/index-nl.html" />
<link rel="alternate" hreflang="el" href="https://hack23.github.io/euparliamentmonitor/index-el.html" />
<link rel="alternate" hreflang="pl" href="https://hack23.github.io/euparliamentmonitor/index-pl.html" />
<link rel="alternate" hreflang="ro" href="https://hack23.github.io/euparliamentmonitor/index-ro.html" />
<link rel="alternate" hreflang="sv" href="https://hack23.github.io/euparliamentmonitor/index-sv.html" />
<link rel="alternate" hreflang="da" href="https://hack23.github.io/euparliamentmonitor/index-da.html" />
<link rel="alternate" hreflang="fi" href="https://hack23.github.io/euparliamentmonitor/index-fi.html" />
<link rel="alternate" hreflang="cs" href="https://hack23.github.io/euparliamentmonitor/index-cs.html" />
<link rel="alternate" hreflang="x-default" href="https://hack23.github.io/euparliamentmonitor/index-en.html" />
```

### JSON-LD NewsArticle Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "EU Parliament Adopts New Climate Legislation",
  "description": "Analysis of the European Parliament plenary vote on...",
  "datePublished": "2025-01-15T08:00:00+01:00",
  "dateModified": "2025-01-15T10:30:00+01:00",
  "author": {
    "@type": "Organization",
    "name": "EU Parliament Monitor",
    "url": "https://hack23.github.io/euparliamentmonitor/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Hack23",
    "url": "https://www.hack23.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://hack23.github.io/euparliamentmonitor/logo.png"
    }
  },
  "inLanguage": "en",
  "isAccessibleForFree": true,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://hack23.github.io/euparliamentmonitor/news/2025/climate-vote-en.html"
  },
  "about": [
    { "@type": "GovernmentOrganization", "name": "European Parliament" }
  ]
}
</script>
```

### Sitemap Generation Integration

```javascript
/**
 * Generate SEO-optimized sitemap entries for multi-language articles.
 * Integrates with scripts/generate-sitemap.js.
 *
 * @param {Object} article - Article metadata
 * @param {string} article.slug - URL slug for the article
 * @param {string} article.datePublished - ISO 8601 date
 * @param {string[]} article.languages - Array of language codes
 * @returns {string} Sitemap XML entries with xhtml:link alternates
 */
function generateSitemapEntry(article) {
  const baseUrl = 'https://hack23.github.io/euparliamentmonitor';
  const languages = article.languages || [
    'en', 'fr', 'de', 'es', 'it', 'pt', 'nl',
    'el', 'pl', 'ro', 'sv', 'da', 'fi', 'cs'
  ];

  return languages.map(lang => {
    const url = `${baseUrl}/news/${article.slug}-${lang}.html`;
    const alternates = languages
      .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}/news/${article.slug}-${l}.html" />`)
      .join('\n');

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${article.datePublished}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
${alternates}
  </url>`;
  }).join('\n');
}
```

### Meta Tag Template

```html
<!-- Essential meta tags for EU Parliament articles -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EU Parliament Votes on Digital Markets Act — EU Parliament Monitor</title>
<meta name="description" content="Analysis of the European Parliament plenary vote on the Digital Markets Act, including voting patterns by political group and country.">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="https://hack23.github.io/euparliamentmonitor/news/2025/dma-vote-en.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="EU Parliament Votes on Digital Markets Act">
<meta property="og:description" content="Analysis of the European Parliament plenary vote...">
<meta property="og:url" content="https://hack23.github.io/euparliamentmonitor/news/2025/dma-vote-en.html">
<meta property="og:site_name" content="EU Parliament Monitor">
<meta property="og:locale" content="en_GB">
<meta property="article:published_time" content="2025-01-15T08:00:00+01:00">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="EU Parliament Votes on Digital Markets Act">
<meta name="twitter:description" content="Analysis of the European Parliament plenary vote...">
```

### Core Web Vitals Optimization

```
Performance Targets (Static HTML Site):
│
├─ LCP (Largest Contentful Paint) < 2.5s
│   ├─ Serve pre-rendered HTML (no client-side rendering)
│   ├─ Use CDN (CloudFront / GitHub Pages CDN)
│   ├─ Inline critical CSS in <head>
│   ├─ Preload key resources: <link rel="preload">
│   └─ Optimize images: WebP format, width/height attributes
│
├─ FID (First Input Delay) < 100ms
│   ├─ Minimal JavaScript (static site)
│   ├─ Defer non-critical scripts: <script defer>
│   └─ No heavy framework bundles
│
├─ CLS (Cumulative Layout Shift) < 0.1
│   ├─ Set width/height on all images
│   ├─ Use font-display: swap for web fonts
│   ├─ Reserve space for dynamic content
│   └─ Avoid inserting content above existing content
│
└─ INP (Interaction to Next Paint) < 200ms
    ├─ Minimal event handlers
    ├─ No long-running JavaScript tasks
    └─ Use CSS for visual interactions where possible
```

### Keyword Strategy for EU Parliament Topics

```
Keyword Research Framework:
│
├─ Primary Keywords (high volume)
│   ├─ "European Parliament" + [topic]
│   ├─ "EU legislation" + [policy area]
│   ├─ "MEP voting" + [country/group]
│   └─ Translate for each of 14 languages
│
├─ Long-tail Keywords (high intent)
│   ├─ "How did [MEP name] vote on [topic]"
│   ├─ "[Country] MEPs voting record [year]"
│   ├─ "European Parliament [committee] report"
│   └─ "[Political group] position on [policy]"
│
├─ Topical Authority Clusters
│   ├─ Legislation tracking (OLP stages, trilogue)
│   ├─ Voting analysis (patterns, attendance)
│   ├─ Committee work (reports, opinions)
│   ├─ Political groups (coalitions, splits)
│   └─ Country delegations (national positions)
│
└─ Multilingual Considerations
    ├─ Translate keywords natively (not machine-translate)
    ├─ Use locale-specific EU Parliament terminology
    ├─ Match local search intent per language
    └─ Consider language-specific search engines
```

### GDPR-Compliant Analytics

```
Analytics Without Tracking:
│
├─ ✅ Allowed
│   ├─ Server-side log analysis (CloudFront logs)
│   ├─ Aggregate page view counts (no PII)
│   ├─ Referrer analysis (aggregate only)
│   ├─ Search Console performance data
│   └─ GitHub traffic insights (repo-level)
│
├─ ❌ Not Allowed
│   ├─ Third-party tracking cookies
│   ├─ Google Analytics with user identification
│   ├─ Facebook Pixel or ad tracking
│   ├─ Fingerprinting or device identification
│   └─ Cross-site tracking of any kind
│
└─ Recommended Tools
    ├─ Google Search Console (no cookies, server-side)
    ├─ GitHub Pages traffic (built-in, aggregate)
    └─ Lighthouse CI (synthetic performance monitoring)
```

### SEO Checklist for New Articles

| Check | Requirement | Tool |
|-------|------------|------|
| Title tag | ≤ 60 chars, includes primary keyword | HTMLHint |
| Meta description | 150-160 chars, compelling, keyword-rich | Manual |
| H1 tag | Exactly one per page, matches title | HTMLHint |
| Canonical URL | Set for each language variant | Automated |
| Hreflang tags | All 14 languages + x-default | generate-sitemap.js |
| JSON-LD | NewsArticle schema, valid | Schema validator |
| Open Graph | og:title, og:description, og:type | Manual |
| Image alt text | Descriptive, keyword-relevant | axe-core |
| Internal links | Link to related articles/language variants | Manual |
| Sitemap update | New URL added to sitemap.xml | generate-sitemap.js |
| robots.txt | No accidental noindex/disallow | Manual |
| Page speed | LCP < 2.5s, CLS < 0.1 | Lighthouse CI |

## ISMS Compliance Mapping

### ISO 27001:2022
- **A.5.10**: Acceptable use of information — SEO practices must not deceive
- **A.8.9**: Configuration management — sitemap and robots.txt versioned
- **A.8.12**: Data leakage prevention — no PII in URLs or structured data

### NIST CSF 2.0
- **PR.DS-01**: Data-at-rest protection — no sensitive data in public HTML
- **PR.DS-02**: Data-in-transit protection — HTTPS-only serving

### CIS Controls v8.1
- **CIS-4**: Secure configuration — security headers alongside SEO meta
- **CIS-3**: Data protection — no PII exposure in structured data or URLs

### GDPR
- **Article 5**: Data minimization — no unnecessary data in analytics
- **Article 25**: Data protection by design — privacy-first SEO approach
- **Article 6**: Lawful basis — no consent needed (no personal data processed)

## Hack23 ISMS Policy References

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Classification_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)

## References

- [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org NewsArticle](https://schema.org/NewsArticle)
- [Google Hreflang Guide](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Core Web Vitals](https://web.dev/vitals/)
- [GDPR Official Text](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [EU Parliament Open Data Portal](https://data.europarl.europa.eu/)
