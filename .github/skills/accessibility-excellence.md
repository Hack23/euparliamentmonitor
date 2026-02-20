# ♿ Accessibility Excellence Skill

## Purpose

Ensure WCAG 2.1 AA compliance across all 14 language versions of the EU Parliament Monitor, including support for RTL languages and screen reader compatibility.

## Rules

### MUST (Critical)
1. MUST achieve Lighthouse Accessibility score ≥ 95
2. MUST comply with WCAG 2.1 AA success criteria
3. MUST support keyboard-only navigation
4. MUST provide meaningful alt text for all images
5. MUST maintain proper heading hierarchy (h1 → h2 → h3)
6. MUST ensure 4.5:1 color contrast ratio (normal text)
7. MUST ensure 3:1 color contrast ratio (large text)
8. MUST support screen readers with ARIA labels

### Semantic HTML Structure

```html
<!-- ✅ GOOD: Proper landmark regions -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li><a href="#news">News</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>
<main role="main" id="main-content">
  <article>
    <h1>EU Parliament Monitor</h1>
    <section aria-labelledby="latest-news">
      <h2 id="latest-news">Latest News</h2>
    </section>
  </article>
</main>
<footer role="contentinfo">
  <p>&copy; 2026 Hack23 AB</p>
</footer>
```

### Keyboard Navigation

```html
<!-- ✅ GOOD: Skip navigation link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- ✅ GOOD: Visible focus indicators -->
<style>
  :focus-visible {
    outline: 3px solid #003399;
    outline-offset: 2px;
  }
  .skip-link {
    position: absolute;
    left: -10000px;
  }
  .skip-link:focus {
    position: static;
    left: auto;
  }
</style>
```

### Multi-Language Accessibility

```html
<!-- ✅ GOOD: Proper language attributes -->
<html lang="en" dir="ltr">

<!-- ✅ GOOD: RTL support for Arabic -->
<html lang="ar" dir="rtl">

<!-- ✅ GOOD: Language switcher with proper labels -->
<nav aria-label="Language selection">
  <select aria-label="Select language" onchange="switchLanguage(this.value)">
    <option value="en" lang="en">English</option>
    <option value="fr" lang="fr">Français</option>
    <option value="de" lang="de">Deutsch</option>
    <option value="ar" lang="ar" dir="rtl">العربية</option>
  </select>
</nav>
```

### ARIA Best Practices

```html
<!-- ✅ GOOD: Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true" id="status-message">
  Article updated successfully
</div>

<!-- ✅ GOOD: Descriptive link text -->
<a href="article.html">Read full article about EU Parliament session on January 15</a>

<!-- ❌ BAD: Non-descriptive link text -->
<a href="article.html">Click here</a>
```

### Testing Accessibility

```bash
# Automated checks
npx lighthouse --accessibility-only index.html

# Manual checks
# 1. Tab through entire page - all interactive elements reachable
# 2. Screen reader test - content makes sense when read aloud
# 3. Zoom to 200% - no content loss or overlap
# 4. High contrast mode - all content visible
```

### WCAG 2.1 AA Quick Reference

| Principle | Key Requirements |
|-----------|-----------------|
| **Perceivable** | Alt text, captions, color contrast, text resizing |
| **Operable** | Keyboard access, skip links, no time limits, clear focus |
| **Understandable** | Clear language, consistent navigation, error prevention |
| **Robust** | Valid HTML, ARIA compatibility, future-proof markup |

## Related Resources
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe Accessibility Testing](https://www.deque.com/axe/)
