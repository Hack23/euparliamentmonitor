#!/usr/bin/env node

/**
 * @module News Index Generator
 * @description Generates index.html files for each language listing all news articles
 * 
 * @author Hack23 AB
 * @license Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_DIR = path.join(__dirname, '..', 'news');
const ALL_LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];

/**
 * Get all news article files
 */
function getNewsArticles() {
  if (!fs.existsSync(NEWS_DIR)) {
    console.log('📁 News directory does not exist yet');
    return [];
  }
  
  const files = fs.readdirSync(NEWS_DIR);
  return files.filter(f => f.endsWith('.html') && !f.startsWith('index-'));
}

/**
 * Parse article filename to extract metadata
 */
function parseArticleFilename(filename) {
  // Format: YYYY-MM-DD-slug-lang.html
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/);
  
  if (!match) {
    return null;
  }
  
  return {
    date: match[1],
    slug: match[2],
    lang: match[3],
    filename
  };
}

/**
 * Group articles by language
 */
function groupArticlesByLanguage(articles) {
  const grouped = {};
  
  for (const lang of ALL_LANGUAGES) {
    grouped[lang] = [];
  }
  
  for (const article of articles) {
    const parsed = parseArticleFilename(article);
    if (parsed && grouped[parsed.lang]) {
      grouped[parsed.lang].push(parsed);
    }
  }
  
  // Sort by date (newest first)
  for (const lang in grouped) {
    grouped[lang].sort((a, b) => b.date.localeCompare(a.date));
  }
  
  return grouped;
}

/**
 * Generate index HTML for a language
 */
function generateIndexHTML(lang, articles) {
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
  
  const titles = {
    en: 'EU Parliament Monitor - News',
    de: 'EU-Parlamentsmonitor - Nachrichten',
    fr: 'Moniteur du Parlement UE - Actualités',
    es: 'Monitor del Parlamento UE - Noticias',
    it: 'Monitor del Parlamento UE - Notizie',
    nl: 'EU Parlementsmonitor - Nieuws',
    pl: 'Monitor Parlamentu UE - Wiadomości',
    pt: 'Monitor do Parlamento UE - Notícias',
    ro: 'Monitor al Parlamentului UE - Știri',
    sv: 'EU-parlamentsmonitor - Nyheter',
    da: 'EU-parlamentsmonitor - Nyheder',
    fi: 'EU-parlamentin seuranta - Uutiset',
    el: 'Παρακολούθηση Κοινοβουλίου ΕΕ - Νέα',
    hu: 'EU Parlamenti Figyelő - Hírek'
  };
  
  const descriptions = {
    en: 'Latest news and analysis about European Parliament activities',
    de: 'Neueste Nachrichten und Analysen zu den Aktivitäten des Europäischen Parlaments',
    fr: 'Dernières nouvelles et analyses sur les activités du Parlement européen',
    es: 'Últimas noticias y análisis sobre las actividades del Parlamento Europeo',
    it: 'Ultime notizie e analisi sulle attività del Parlamento europeo',
    nl: 'Laatste nieuws en analyses over activiteiten van het Europees Parlement',
    pl: 'Najnowsze wiadomości i analizy dotyczące działań Parlamentu Europejskiego',
    pt: 'Últimas notícias e análises sobre as atividades do Parlamento Europeu',
    ro: 'Ultimele știri și analize despre activitățile Parlamentului European',
    sv: 'Senaste nyheterna och analyser om Europaparlamentets verksamhet',
    da: 'Seneste nyheder og analyser om Europa-Parlamentets aktiviteter',
    fi: 'Viimeisimmät uutiset ja analyysit Euroopan parlamentin toiminnasta',
    el: 'Τελευταία νέα και αναλύσεις για τις δραστηριότητες του Ευρωπαϊκού Κοινοβουλίου',
    hu: 'Legfrissebb hírek és elemzések az Európai Parlament tevékenységeiről'
  };
  
  const headings = {
    en: 'Latest News',
    de: 'Neueste Nachrichten',
    fr: 'Dernières Actualités',
    es: 'Últimas Noticias',
    it: 'Ultime Notizie',
    nl: 'Laatste Nieuws',
    pl: 'Najnowsze Wiadomości',
    pt: 'Últimas Notícias',
    ro: 'Ultimele Știri',
    sv: 'Senaste Nyheterna',
    da: 'Seneste Nyheder',
    fi: 'Viimeisimmät Uutiset',
    el: 'Τελευταία Νέα',
    hu: 'Legfrissebb Hírek'
  };
  
  const noArticles = {
    en: 'No articles available yet.',
    de: 'Noch keine Artikel verfügbar.',
    fr: 'Aucun article disponible pour le moment.',
    es: 'Aún no hay artículos disponibles.',
    it: 'Nessun articolo disponibile al momento.',
    nl: 'Nog geen artikelen beschikbaar.',
    pl: 'Nie ma jeszcze dostępnych artykułów.',
    pt: 'Ainda não há artigos disponíveis.',
    ro: 'Nu sunt încă articole disponibile.',
    sv: 'Inga artiklar tillgängliga ännu.',
    da: 'Ingen artikler tilgængelige endnu.',
    fi: 'Ei vielä saatavilla olevia artikkeleita.',
    el: 'Δεν υπάρχουν ακόμα διαθέσιμα άρθρα.',
    hu: 'Még nincsenek elérhető cikkek.'
  };
  
  const title = titles[lang] || titles.en;
  const description = descriptions[lang] || descriptions.en;
  const heading = headings[lang] || headings.en;
  const noArticlesText = noArticles[lang] || noArticles.en;
  const languageName = langNames[lang] || 'English';
  
  const dir = (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p class="language-indicator">${languageName}</p>
  </header>
  
  <main>
    <section class="news-list">
      <h2>${heading}</h2>
      ${articles.length === 0 ? `<p>${noArticlesText}</p>` : `
      <ul class="article-list">
        ${articles.map(article => `
        <li class="article-item">
          <a href="news/${article.filename}">
            <span class="article-date">${article.date}</span>
            <span class="article-title">${formatSlug(article.slug)}</span>
          </a>
        </li>
        `).join('\n        ')}
      </ul>
      `}
    </section>
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} EU Parliament Monitor</p>
  </footer>
</body>
</html>`;
}

/**
 * Format slug for display
 */
function formatSlug(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Main execution
 */
function main() {
  console.log('📰 Generating news indexes...');
  
  const articles = getNewsArticles();
  console.log(`📊 Found ${articles.length} articles`);
  
  const grouped = groupArticlesByLanguage(articles);
  
  let generated = 0;
  for (const lang of ALL_LANGUAGES) {
    const langArticles = grouped[lang] || [];
    const html = generateIndexHTML(lang, langArticles);
    const filename = `index-${lang}.html`;
    const filepath = path.join(__dirname, '..', filename);
    
    fs.writeFileSync(filepath, html, 'utf-8');
    console.log(`  ✅ Generated ${filename} (${langArticles.length} articles)`);
    generated++;
  }
  
  console.log(`✅ Generated ${generated} index files`);
}

main();
