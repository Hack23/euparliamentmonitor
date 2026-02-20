# 💎 Code Quality Excellence Skill

## Purpose

Ensure high code quality through consistent coding standards, linting, formatting, and best practices for the EU Parliament Monitor JavaScript/HTML/CSS codebase.

## Rules

### MUST (Critical)
1. MUST pass ESLint with zero errors before committing
2. MUST pass HTMLHint validation for all HTML files
3. MUST follow existing code patterns and conventions
4. MUST use semantic HTML5 elements
5. MUST maintain consistency across all 14 language versions

### JavaScript Standards (ES Modules)

```javascript
// ✅ GOOD: ES module imports
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// ✅ GOOD: Async/await pattern
async function generateArticle(data, language) {
  const template = await readFile(join('templates', `${language}.html`), 'utf-8');
  return template.replace('{{content}}', escapeHtml(data.content));
}

// ✅ GOOD: Error handling
try {
  const result = await generateArticle(data, 'en');
} catch (error) {
  console.error('Article generation failed:', error.message);
  // Graceful degradation
}

// ✅ GOOD: JSDoc documentation
/**
 * Generates a news article from parliamentary data.
 * @param {Object} data - Parliamentary session data
 * @param {string} language - ISO 639-1 language code
 * @returns {Promise<string>} Generated HTML article
 */
```

### HTML Standards

```html
<!-- ✅ GOOD: Semantic HTML5 -->
<article>
  <header>
    <h2>Parliamentary Session Report</h2>
    <time datetime="2026-01-15">January 15, 2026</time>
  </header>
  <section>
    <p>Session content...</p>
  </section>
  <footer>
    <p>Source: European Parliament</p>
  </footer>
</article>

<!-- ✅ GOOD: Proper lang and dir attributes -->
<html lang="fr" dir="ltr">

<!-- ✅ GOOD: Accessible images -->
<img src="parliament.jpg" alt="European Parliament building in Strasbourg" loading="lazy">
```

### CSS Standards

```css
/* ✅ GOOD: CSS custom properties */
:root {
  --color-primary: #003399;
  --color-secondary: #ffcc00;
  --font-sans: 'Inter', system-ui, sans-serif;
  --spacing-md: 1rem;
}

/* ✅ GOOD: Mobile-first responsive */
.article-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ✅ GOOD: Accessible focus styles */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Linting Configuration

```bash
# Run before every commit
npm run lint          # ESLint + HTMLHint
npm run format        # Prettier formatting
```

### Code Review Checklist

- [ ] No ESLint errors
- [ ] HTMLHint passes
- [ ] Functions have JSDoc comments
- [ ] Error handling implemented
- [ ] No console.log in production code
- [ ] Tests written for new functionality
- [ ] Multi-language consistency verified
- [ ] Accessibility maintained

## Related Resources
- [ESLint Documentation](https://eslint.org/)
- [HTMLHint Rules](https://htmlhint.com/docs/user-guide/list-rules)
