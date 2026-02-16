#!/usr/bin/env node

/**
 * @module Sitemap Generator
 * @description Generates sitemap.xml for all news articles
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
const BASE_URL = 'https://euparliamentmonitor.com';

/**
 * Get all news article files
 */
function getNewsArticles() {
  if (!fs.existsSync(NEWS_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(NEWS_DIR);
  return files.filter(f => f.endsWith('.html') && !f.startsWith('index-'));
}

/**
 * Get file modification time
 */
function getModifiedDate(filepath) {
  const stats = fs.statSync(filepath);
  return stats.mtime.toISOString().split('T')[0];
}

/**
 * Generate sitemap XML
 */
function generateSitemap(articles) {
  const urls = [];
  
  // Add home pages for each language
  const languages = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];
  for (const lang of languages) {
    urls.push({
      loc: `${BASE_URL}/index-${lang}.html`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    });
  }
  
  // Add news articles
  for (const article of articles) {
    const filepath = path.join(NEWS_DIR, article);
    const lastmod = getModifiedDate(filepath);
    
    urls.push({
      loc: `${BASE_URL}/news/${article}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.8'
    });
  }
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
}

/**
 * Main execution
 */
function main() {
  console.log('🗺️ Generating sitemap...');
  
  const articles = getNewsArticles();
  console.log(`📊 Found ${articles.length} articles`);
  
  const sitemap = generateSitemap(articles);
  const filepath = path.join(__dirname, '..', 'sitemap.xml');
  
  fs.writeFileSync(filepath, sitemap, 'utf-8');
  console.log(`✅ Generated sitemap.xml with ${articles.length + 14} URLs`);
}

main();
