# EU Parliament Monitor

European Parliament Intelligence Platform - Monitor political activity with systematic transparency

## Overview

EU Parliament Monitor is an automated news generation platform that monitors European Parliament activities and generates multi-language news articles covering:

- **Week Ahead**: Preview of upcoming parliamentary events and committee meetings
- **Committee Reports**: Analysis of committee activities and decisions
- **Propositions**: Government and parliamentary legislative proposals
- **Motions**: Parliamentary motions and resolutions
- **Breaking News**: Rapid-response coverage of significant developments

## Features

- 📰 **Automated News Generation**: Generate news articles about EU Parliament activities
- 🌍 **Multi-Language Support**: 14 languages including English, German, French, Spanish, Italian, and more
- 📅 **Week Ahead Coverage**: Preview upcoming parliamentary events
- 🤖 **GitHub Actions Integration**: Automated daily news generation
- 📊 **SEO Optimized**: Proper metadata, structured data, and sitemap generation

## Languages Supported

- **EU Core**: English (en), German (de), French (fr), Spanish (es), Italian (it), Dutch (nl)
- **Nordic**: Swedish (sv), Danish (da), Finnish (fi)
- **Eastern Europe**: Polish (pl), Romanian (ro), Hungarian (hu)
- **Other**: Portuguese (pt), Greek (el)

## Installation

```bash
# Clone the repository
git clone https://github.com/Hack23/euparliamentmonitor.git
cd euparliamentmonitor

# Install dependencies
npm install
```

## Usage

### Generate News Articles

```bash
# Generate week ahead article in English
npm run generate-news -- --types=week-ahead --languages=en

# Generate multiple article types in multiple languages
npm run generate-news -- --types=week-ahead,committee-reports --languages=en,de,fr

# Generate in all EU core languages
npm run generate-news -- --types=week-ahead --languages=eu-core

# Generate in all supported languages
npm run generate-news -- --types=week-ahead --languages=all
```

### Generate Indexes and Sitemap

```bash
# Generate language-specific index pages
npm run generate-news-indexes

# Generate sitemap.xml
npm run generate-sitemap
```

### Local Development

```bash
# Serve the site locally
npm run serve

# Open http://localhost:8080 in your browser
```

## Project Structure

```
euparliamentmonitor/
├── .github/
│   └── workflows/
│       └── news-generation.yml    # Automated news generation workflow
├── scripts/
│   ├── generate-news-enhanced.js   # Main news generation script
│   ├── generate-news-indexes.js    # Index page generator
│   ├── generate-sitemap.js         # Sitemap generator
│   └── article-template.js         # HTML template generator
├── news/                            # Generated news articles
│   └── metadata/                    # Generation metadata
├── styles.css                       # Article styling
├── index-{lang}.html               # Language-specific index pages
├── sitemap.xml                      # SEO sitemap
└── package.json                     # Project dependencies
```

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow that automatically generates news articles daily:

- **Schedule**: Runs daily at 06:00 UTC
- **Manual Trigger**: Can be triggered manually with custom parameters
- **Automatic Commit**: Commits and pushes generated articles automatically

### Workflow Inputs

- `article_types`: Comma-separated list of article types (default: `week-ahead`)
- `languages`: Languages to generate (`en`, `eu-core`, `all`, or custom list)
- `force_generation`: Force generation even if recent articles exist

## Configuration

### Language Presets

- `en` - English only
- `eu-core` - English, German, French, Spanish, Italian, Dutch
- `nordic` - English, Swedish, Danish, Finnish
- `all` - All 14 supported languages

### Article Types

- `week-ahead` - Preview of upcoming parliamentary events
- `committee-reports` - Committee activity analysis (coming soon)
- `propositions` - Legislative proposals analysis (coming soon)
- `motions` - Parliamentary motions analysis (coming soon)
- `breaking` - Breaking news coverage (coming soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache-2.0 License - see LICENSE file for details

## Credits

This project is based on the news generation implementation from [Hack23/riksdagsmonitor](https://github.com/Hack23/riksdagsmonitor).

## Author

Hack23 AB - Intelligence Operations Team