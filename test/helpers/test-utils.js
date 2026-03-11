// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Test helper utilities
 * Common functions used across tests
 */

/* eslint-disable no-undef */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Counter to ensure unique temp directory names even within the same millisecond
let tempDirCounter = 0;

/**
 * Create a temporary test directory
 * Includes process.pid to avoid collisions across parallel vitest workers
 * that each start tempDirCounter at 0.
 * @returns {string} Path to temporary directory
 */
export function createTempDir() {
  const timestamp = Date.now();
  const counter = tempDirCounter++;
  const tempDir = path.join(__dirname, '..', 'temp', `test-${timestamp}-${process.pid}-${counter}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 * @param {string} dir - Directory path to clean up
 * @returns {void}
 */
export function cleanupTempDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  try {
    // Use fs.rmSync with built-in retry logic
    // maxRetries: retry up to 5 times
    // retryDelay: wait 200ms between retries
    fs.rmSync(dir, { 
      recursive: true, 
      force: true,
      maxRetries: 5,
      retryDelay: 200
    });
  } catch (/** @type {unknown} */ error) {
    // If cleanup still fails after retries, log but don't throw
    // This prevents test failures due to file system timing issues
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Failed to cleanup ${dir}: ${message}`);
  }
}

/**
 * Read file content as string
 * @param {string} filepath - Path to file
 * @returns {string} File content
 */
export function readFile(filepath) {
  return fs.readFileSync(filepath, 'utf-8');
}

/**
 * Write content to file
 * @param {string} filepath - Path to file
 * @param {string} content - Content to write
 * @returns {void}
 */
export function writeFile(filepath, content) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, content, 'utf-8');
}

/**
 * Check if string contains XSS vulnerabilities
 * NOTE: This is a basic test helper for detecting obvious XSS patterns.
 * It is NOT a comprehensive security scanner. Production XSS prevention
 * relies on proper HTML escaping and Content Security Policy.
 * 
 * @param {string} html - HTML string to check
 * @returns {boolean} True if XSS vulnerability found
 */
export function containsXSSVulnerability(html) {
  // These patterns detect common XSS vectors for testing purposes
  // They are intentionally simplified - real security requires proper escaping
  /** @type {RegExp[]} */
  const xssPatterns = [
    /<script(\s+[^>]*)?>.*?<\/\s*script\s*>/gis, // Match script tags with optional attributes and whitespace
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(html));
}

/**
 * @typedef {{ valid: boolean, issues: string[] }} HTMLValidationResult
 */

/**
 * Validate HTML structure
 * @param {string} html - HTML string to validate
 * @returns {HTMLValidationResult} Validation result
 */
export function validateHTML(html) {
  /** @type {string[]} */
  const issues = [];

  // Check for DOCTYPE
  if (!html.includes('<!DOCTYPE html>')) {
    issues.push('Missing DOCTYPE declaration');
  }

  // Check for required meta tags
  if (!html.includes('<meta charset="UTF-8">')) {
    issues.push('Missing charset meta tag');
  }

  if (!html.includes('<meta name="viewport"')) {
    issues.push('Missing viewport meta tag');
  }

  // Check for lang attribute
  if (!html.match(/<html[^>]+lang=/i)) {
    issues.push('Missing lang attribute on html tag');
  }

  // Check for title
  if (!html.includes('<title>')) {
    issues.push('Missing title tag');
  }

  // Check for balanced tags
  const openTags = html.match(/<(\w+)[^>]*>/g) || [];
  const closeTags = html.match(/<\/(\w+)>/g) || [];
  
  /** Self-closing tags that should be excluded from balance checking */
  const VOID_ELEMENTS = ['meta', 'link', 'br', 'hr', 'img', 'input', 'source'];

  /**
   * Filter out undefined entries and void/self-closing elements
   * @param {string | undefined} tag - Tag name to check
   * @returns {boolean} True if tag should be counted for balance check
   */
  const isCountableTag = (tag) => tag !== undefined && !VOID_ELEMENTS.includes(tag);

  // Extract tag names
  const openTagNames = openTags
    .map((tag) => tag.match(/<(\w+)/)?.[1])
    .filter(isCountableTag);
  
  const closeTagNames = closeTags.map((tag) => tag.match(/<\/(\w+)>/)?.[1]);

  // Basic balance check
  if (openTagNames.length !== closeTagNames.length) {
    issues.push('Potentially unbalanced HTML tags');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * @typedef {{ title?: string, description?: string, keywords?: string[], lang?: string, date?: string }} HTMLMetadata
 */

/**
 * Extract metadata from HTML
 * @param {string} html - HTML string
 * @returns {HTMLMetadata} Extracted metadata
 */
export function extractHTMLMetadata(html) {
  /** @type {HTMLMetadata} */
  const metadata = {};

  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    metadata.title = titleMatch[1];
  }

  // Extract description
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  if (descMatch) {
    metadata.description = descMatch[1];
  }

  // Extract keywords
  const keywordsMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
  if (keywordsMatch) {
    metadata.keywords = keywordsMatch[1].split(', ');
  }

  // Extract lang
  const langMatch = html.match(/<html[^>]+lang="([^"]+)"/);
  if (langMatch) {
    metadata.lang = langMatch[1];
  }

  // Extract date
  const dateMatch = html.match(/<meta name="date" content="([^"]+)"/);
  if (dateMatch) {
    metadata.date = dateMatch[1];
  }

  return metadata;
}

/**
 * @typedef {{ log: (...args: unknown[]) => void, error: (...args: unknown[]) => void, warn: (...args: unknown[]) => void, info: (...args: unknown[]) => void }} ConsoleMethods
 */

/**
 * @typedef {{ logs: string[], errors: string[], warnings: string[], info: string[], restore: () => void }} MockConsoleResult
 */

/**
 * Mock console methods
 * @returns {MockConsoleResult} Original console methods and restore function
 */
export function mockConsole() {
  /** @type {ConsoleMethods} */
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  /** @type {string[]} */
  const logs = [];
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const info = [];

  console.log = (/** @type {unknown[]} */ ...args) => logs.push(args.join(' '));
  console.error = (/** @type {unknown[]} */ ...args) => errors.push(args.join(' '));
  console.warn = (/** @type {unknown[]} */ ...args) => warnings.push(args.join(' '));
  console.info = (/** @type {unknown[]} */ ...args) => info.push(args.join(' '));

  return {
    logs,
    errors,
    warnings,
    info,
    restore: () => {
      Object.assign(console, originalConsole);
    },
  };
}

/**
 * Wait for async operation
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if date is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Normalize whitespace in string
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export function normalizeWhitespace(str) {
  return str.replace(/\s+/g, ' ').trim();
}
