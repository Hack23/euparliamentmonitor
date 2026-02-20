# ⚡ Performance Optimization Skill

## Purpose

Ensure optimal performance for the EU Parliament Monitor static site across all 14 language versions, with focus on Core Web Vitals, efficient caching, and minimal resource loading.

## Rules

### MUST (Critical)
1. MUST achieve Lighthouse Performance score >90
2. MUST meet Core Web Vitals thresholds
3. MUST implement efficient caching for MCP data
4. MUST minimize JavaScript bundle size
5. MUST optimize images and assets

### Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| FCP | < 1.5s | First Contentful Paint |
| TTI | < 3.0s | Time to Interactive |

### Static Site Optimization

```html
<!-- ✅ GOOD: Preload critical resources -->
<link rel="preload" href="styles.css" as="style">
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- ✅ GOOD: Lazy load non-critical images -->
<img src="parliament.jpg" alt="European Parliament" loading="lazy" decoding="async">

<!-- ✅ GOOD: Defer non-critical scripts -->
<script src="analytics.js" defer></script>
```

### CSS Optimization

```css
/* ✅ GOOD: Use CSS containment */
.article-card {
  contain: layout style paint;
}

/* ✅ GOOD: Use responsive images */
.hero-image {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

/* ✅ GOOD: Use clamp for responsive typography */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

### MCP Data Caching

```javascript
// ✅ GOOD: LRU cache with TTL for MCP data
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,          // Maximum 500 entries
  ttl: 1000 * 60 * 30, // 30 minute TTL
  allowStale: true,  // Serve stale while revalidating
});
```

### Build Optimization

```bash
# Minification targets
# HTML: Remove whitespace, comments
# CSS: Minify and combine
# JavaScript: Minify and tree-shake
# Images: Compress and convert to modern formats (WebP, AVIF)
```

### Performance Budgets

| Resource | Budget |
|----------|--------|
| HTML per page | < 50KB |
| CSS total | < 100KB |
| JavaScript total | < 50KB |
| Images per page | < 500KB |
| Total page weight | < 1MB |

## Related Resources
- [web.dev Performance](https://web.dev/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
