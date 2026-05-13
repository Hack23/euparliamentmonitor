#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Generate responsive image variants for the static site.
 *
 * Source assets remain the canonical artwork; this script derives optimized
 * AVIF/WebP/JPEG renditions used by the HTML `srcset` markup and deploy
 * workflow. It is intentionally deterministic so deploys can regenerate
 * variants before upload and local contributors can refresh them after artwork
 * changes with `npm run image:generate`.
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Quality targets keep banner/social images below the 500 KB page-image budget
// while preserving sharp text and logo edges: AVIF 55/WebP 78 are visually close
// to mozjpeg 82 for this artwork, with materially smaller transfer sizes.
const jpegOptions = { quality: 82, mozjpeg: true };
const webpOptions = { quality: 78, effort: 6 };
const avifOptions = { quality: 55, effort: 7 };

const assets = [
  {
    source: 'images/banner.png',
    basename: 'banner',
    aspectRatio: 3 / 1,
    widths: [320, 480, 768, 1200],
    formats: ['avif', 'webp', 'jpg'],
  },
  {
    source: 'images/og-image.png',
    basename: 'og-image',
    aspectRatio: 1200 / 630,
    widths: [600, 1200],
    formats: ['avif', 'webp', 'jpg'],
  },
  {
    source: 'images/twitter-card.png',
    basename: 'twitter-card',
    aspectRatio: 2 / 1,
    widths: [600, 1200],
    formats: ['avif', 'webp', 'jpg'],
  },
  {
    source: 'images/logo-full.png',
    basename: 'logo-full',
    aspectRatio: 3 / 2,
    widths: [384, 768, 1536],
    formats: ['avif', 'webp'],
  },
];

function outputPathFor(asset, width, format) {
  const extension = format === 'jpg' ? 'jpg' : format;
  return path.join(repoRoot, 'images', `${asset.basename}-${width}.${extension}`);
}

function applyFormat(pipeline, format) {
  if (format === 'avif') {
    return pipeline.avif(avifOptions);
  }

  if (format === 'webp') {
    return pipeline.webp(webpOptions);
  }

  return pipeline.jpeg(jpegOptions);
}

async function generateAsset(asset) {
  const sourcePath = path.join(repoRoot, asset.source);
  for (const width of asset.widths) {
    const height = Math.round(width / asset.aspectRatio);
    for (const format of asset.formats) {
      const target = outputPathFor(asset, width, format);
      const pipeline = sharp(sourcePath)
        .rotate()
        .resize({
          width,
          height,
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: true,
        });

      await applyFormat(pipeline, format).toFile(target);
      console.log(`Generated ${path.relative(repoRoot, target)} (${width}x${height})`);
    }
  }
}

await mkdir(path.join(repoRoot, 'images'), { recursive: true });

for (const asset of assets) {
  await generateAsset(asset);
}
