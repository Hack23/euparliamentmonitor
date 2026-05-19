// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/Sections/Banner
 * @description Responsive banner, favicon and social-image helpers used by
 * the shared site header and page-level banners. Split out of
 * `section-builders.ts` (Refactor 8/8) so banner-related markup can be
 * audited and unit-tested independently of the header/footer wrappers.
 */

import { escapeHTML } from '../../utils/file-utils.js';
import { BASE_URL } from '../../constants/config.js';

const RESPONSIVE_BANNER_WIDTHS: readonly number[] = [320, 480, 768, 1200];
const ICON_SIZES: readonly number[] = [16, 32, 48, 96, 192, 512];
const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 400;
const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;
const TWITTER_CARD_WIDTH = 1200;
const TWITTER_CARD_HEIGHT = 600;

/** Options accepted by {@link buildResponsiveBannerPicture}. */
export interface ResponsiveBannerPictureOptions {
  pathPrefix: string;
  pictureClass?: string | undefined;
  imageClass: string;
  alt: string;
  sizes: string;
  loading?: 'eager' | 'lazy' | undefined;
  /**
   * When true, renders `aria-hidden="true"` on the `<img>` so screen readers
   * skip purely decorative banner imagery. Modelled as a typed flag (rather
   * than a free-form attribute string) so callers cannot inject arbitrary
   * markup into the rendered tag.
   */
  ariaHidden?: boolean | undefined;
}

function buildBannerSrcset(pathPrefix: string, format: 'avif' | 'webp' | 'jpg'): string {
  return RESPONSIVE_BANNER_WIDTHS.map(
    (width) => `${pathPrefix}images/banner-${width}.${format} ${width}w`
  ).join(', ');
}

/**
 * Build responsive banner picture markup with AVIF/WebP/JPEG fallbacks.
 *
 * @param options - Picture, image, path, and sizing options.
 * @returns HTML string for the responsive banner picture.
 */
export function buildResponsiveBannerPicture(options: ResponsiveBannerPictureOptions): string {
  const pictureClass = options.pictureClass ? ` class="${escapeHTML(options.pictureClass)}"` : '';
  const loading = options.loading ?? 'eager';
  const extraAttributes = options.ariaHidden ? ' aria-hidden="true"' : '';
  const safeSizes = escapeHTML(options.sizes);
  return `<picture${pictureClass}>
          <source srcset="${buildBannerSrcset(options.pathPrefix, 'avif')}" sizes="${safeSizes}" type="image/avif">
          <source srcset="${buildBannerSrcset(options.pathPrefix, 'webp')}" sizes="${safeSizes}" type="image/webp">
          <img class="${escapeHTML(options.imageClass)}" src="${options.pathPrefix}images/banner.jpg" srcset="${buildBannerSrcset(options.pathPrefix, 'jpg')}" sizes="${safeSizes}" alt="${escapeHTML(options.alt)}" width="${BANNER_WIDTH}" height="${BANNER_HEIGHT}" loading="${loading}" decoding="async"${extraAttributes}>
        </picture>`;
}

/**
 * Build favicon and touch-icon links for all committed icon sizes and formats.
 *
 * @param pathPrefix - Asset path prefix: `''` for root pages, `'../'` for news pages.
 * @returns HTML string containing responsive icon link tags.
 */
export function buildResponsiveIconLinks(pathPrefix: string): string {
  const pngLinks = ICON_SIZES.map(
    (size) =>
      `  <link rel="icon" type="image/png" sizes="${size}x${size}" href="${pathPrefix}images/favicon-${size}x${size}.png">`
  ).join('\n');
  const webpLinks = ICON_SIZES.map(
    (size) =>
      `  <link rel="icon" type="image/webp" sizes="${size}x${size}" href="${pathPrefix}images/favicon-${size}x${size}.webp">`
  ).join('\n');
  return `  <link rel="icon" type="image/x-icon" href="${pathPrefix}favicon.ico">
${pngLinks}
${webpLinks}
  <link rel="apple-touch-icon" sizes="180x180" href="${pathPrefix}images/apple-touch-icon.png">`;
}

/**
 * Build social preview metadata with modern and fallback image resources.
 *
 * @param alt - Accessible image alternative text for social previews.
 * @returns Open Graph and Twitter image metadata for available image formats.
 */
export function buildResponsiveSocialImageMeta(alt: string): string {
  const safeAlt = escapeHTML(alt);
  return `  <meta property="og:image" content="${BASE_URL}/images/og-image-1200.jpg">
  <meta property="og:image:secure_url" content="${BASE_URL}/images/og-image-1200.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}">
  <meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}">
  <meta property="og:image:alt" content="${safeAlt}">
  <meta property="og:image" content="${BASE_URL}/images/og-image-1200.webp">
  <meta property="og:image:type" content="image/webp">
  <meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}">
  <meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}">
  <meta property="og:image" content="${BASE_URL}/images/og-image-1200.avif">
  <meta property="og:image:type" content="image/avif">
  <meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}">
  <meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}">
  <meta name="twitter:image" content="${BASE_URL}/images/twitter-card-1200.jpg">
  <meta name="twitter:image:alt" content="${safeAlt}">
  <meta name="twitter:image:width" content="${TWITTER_CARD_WIDTH}">
  <meta name="twitter:image:height" content="${TWITTER_CARD_HEIGHT}">`;
}

/**
 * Build the full-width page banner shown below the sticky site header on every page.
 *
 * The banner image (`banner.webp` / `banner.jpg`) is 1200×400. CSS renders it
 * at its native 3:1 ratio so the full artwork remains visible on every viewport.
 *
 * @param pathPrefix - Asset path prefix: `''` for root pages, `'../'` for `news/` pages.
 * @returns HTML string for the `.page-banner` element.
 */
export function buildPageBanner(pathPrefix: string): string {
  return `<div class="page-banner" role="img" aria-label="EU Parliament Monitor">
    ${buildResponsiveBannerPicture({
      pathPrefix,
      imageClass: 'page-banner__img',
      alt: '',
      sizes: '100vw',
      ariaHidden: true,
    })}
  </div>`;
}
