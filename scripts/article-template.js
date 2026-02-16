/**
 * @module Article Template Generator
 * @description Generates HTML templates for news articles with proper structure and metadata
 * 
 * @author Hack23 AB
 * @license Apache-2.0
 */

/**
 * Generate complete HTML for a news article
 * @param {Object} options - Article options
 * @param {string} options.slug - Article filename slug
 * @param {string} options.title - Article title
 * @param {string} options.subtitle - Article subtitle
 * @param {string} options.date - Publication date (YYYY-MM-DD)
 * @param {string} options.type - Article type (prospective, retrospective, breaking)
 * @param {number} options.readTime - Estimated read time in minutes
 * @param {string} options.lang - Language code (en, de, fr, etc.)
 * @param {string} options.content - Article HTML content
 * @param {Array<string>} options.keywords - SEO keywords
 * @param {Array<Object>} options.sources - Source links
 * @returns {string} Complete HTML document
 */
export function generateArticleHTML(options) {
  const {
    slug,
    title,
    subtitle,
    date,
    type,
    readTime,
    lang,
    content,
    keywords = [],
    sources = []
  } = options;
  
  // Determine text direction (RTL for Arabic and Hebrew)
  const dir = (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr';
  
  // Format date for display
  const displayDate = new Date(date).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get language name
  const langNames = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    pt: 'Português',
    ro: 'Română',
    sv: 'Svenska',
    da: 'Dansk',
    fi: 'Suomi',
    el: 'Ελληνικά',
    hu: 'Magyar'
  };
  
  const languageName = langNames[lang] || 'English';
  
  // Article type labels
  const typeLabels = {
    en: { prospective: 'Week Ahead', retrospective: 'Analysis', breaking: 'Breaking News' },
    de: { prospective: 'Woche Voraus', retrospective: 'Analyse', breaking: 'Eilmeldung' },
    fr: { prospective: 'Semaine à Venir', retrospective: 'Analyse', breaking: 'Dernières Nouvelles' },
    es: { prospective: 'Semana Próxima', retrospective: 'Análisis', breaking: 'Noticias de Última Hora' },
    it: { prospective: 'Settimana Prossima', retrospective: 'Analisi', breaking: 'Ultime Notizie' },
    nl: { prospective: 'Week Vooruit', retrospective: 'Analyse', breaking: 'Laatste Nieuws' },
    pl: { prospective: 'Nadchodzący Tydzień', retrospective: 'Analiza', breaking: 'Najnowsze Wiadomości' },
    pt: { prospective: 'Semana Próxima', retrospective: 'Análise', breaking: 'Notícias de Última Hora' },
    ro: { prospective: 'Săptămâna Viitoare', retrospective: 'Analiză', breaking: 'Știri de Ultimă Oră' },
    sv: { prospective: 'Vecka Framåt', retrospective: 'Analys', breaking: 'Senaste Nytt' },
    da: { prospective: 'Ugen Fremover', retrospective: 'Analyse', breaking: 'Seneste Nyt' },
    fi: { prospective: 'Tuleva Viikko', retrospective: 'Analyysi', breaking: 'Uusimmat Uutiset' },
    el: { prospective: 'Επόμενη Εβδομάδα', retrospective: 'Ανάλυση', breaking: 'Τελευταία Νέα' },
    hu: { prospective: 'Következő Hét', retrospective: 'Elemzés', breaking: 'Legfrissebb Hírek' }
  };
  
  const typeLabel = (typeLabels[lang] || typeLabels.en)[type] || type;
  
  // Read time labels
  const readTimeLabels = {
    en: (time) => `${time} min read`,
    de: (time) => `${time} Min. Lesezeit`,
    fr: (time) => `${time} min de lecture`,
    es: (time) => `${time} min de lectura`,
    it: (time) => `${time} min di lettura`,
    nl: (time) => `${time} min leestijd`,
    pl: (time) => `${time} min czytania`,
    pt: (time) => `${time} min de leitura`,
    ro: (time) => `${time} min de citit`,
    sv: (time) => `${time} min läsning`,
    da: (time) => `${time} min læsetid`,
    fi: (time) => `${time} min lukuaika`,
    el: (time) => `${time} λεπτά ανάγνωσης`,
    hu: (time) => `${time} perc olvasás`
  };
  
  const readTimeLabel = (readTimeLabels[lang] || readTimeLabels.en)(readTime);
  
  // Back to news labels
  const backLabels = {
    en: '← Back to News',
    de: '← Zurück zu Nachrichten',
    fr: '← Retour aux Actualités',
    es: '← Volver a Noticias',
    it: '← Torna alle Notizie',
    nl: '← Terug naar Nieuws',
    pl: '← Powrót do Wiadomości',
    pt: '← Voltar às Notícias',
    ro: '← Înapoi la Știri',
    sv: '← Tillbaka till Nyheter',
    da: '← Tilbage til Nyheder',
    fi: '← Takaisin Uutisiin',
    el: '← Πίσω στα Νέα',
    hu: '← Vissza a Hírekhez'
  };
  
  const backLabel = backLabels[lang] || backLabels.en;
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | EU Parliament Monitor</title>
  <meta name="description" content="${subtitle}">
  <meta name="keywords" content="${keywords.join(', ')}">
  <meta name="author" content="EU Parliament Monitor">
  <meta name="date" content="${date}">
  <meta name="article:published_time" content="${date}">
  <meta name="article:author" content="EU Parliament Monitor">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${subtitle}">
  <meta property="og:site_name" content="EU Parliament Monitor">
  <meta property="og:locale" content="${lang}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${subtitle}">
  
  <link rel="stylesheet" href="../styles.css">
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${title}",
    "description": "${subtitle}",
    "datePublished": "${date}",
    "inLanguage": "${lang}",
    "author": {
      "@type": "Organization",
      "name": "EU Parliament Monitor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "EU Parliament Monitor",
      "url": "https://euparliamentmonitor.com"
    },
    "keywords": "${keywords.join(', ')}"
  }
  </script>
</head>
<body>
  <article class="news-article" lang="${lang}">
    <header class="article-header">
      <div class="article-meta">
        <span class="article-type">${typeLabel}</span>
        <span class="article-date">${displayDate}</span>
        <span class="article-read-time">${readTimeLabel}</span>
        <span class="article-lang">${languageName}</span>
      </div>
      <h1>${title}</h1>
      <p class="article-subtitle">${subtitle}</p>
    </header>
    
    ${content}
    
    ${sources.length > 0 ? `
    <footer class="article-footer">
      <section class="article-sources">
        <h2>Sources</h2>
        <ul>
          ${sources.map(source => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.title}</a></li>`).join('\n          ')}
        </ul>
      </section>
    </footer>
    ` : ''}
    
    <nav class="article-nav">
      <a href="../index-${lang}.html" class="back-to-news">${backLabel}</a>
    </nav>
  </article>
</body>
</html>`;
}
