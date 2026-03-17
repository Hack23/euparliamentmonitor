// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/ValidateEPAPI
 * @description Validates that the European Parliament v2 API returns real data
 * for committee endpoints.  Can be run standalone as a pre-flight check or
 * imported as a library for integration tests.
 *
 * Usage:
 *   npx tsx src/utils/validate-ep-api.ts
 *   npx tsx src/utils/validate-ep-api.ts --committees=ENVI,ECON
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
/** Base URL for the EP Open Data Portal v2 API */
const EP_API_V2_BASE = 'https://data.europarl.europa.eu/api/v2';
/** Default timeout for API requests (ms) */
const REQUEST_TIMEOUT_MS = 20_000;
/** Default committees to validate */
const DEFAULT_COMMITTEES = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI'];
/**
 * Validate a single committee endpoint on the EP v2 API.
 *
 * @param abbreviation - Committee code (e.g. `"ENVI"`)
 * @returns Validation result
 */
export async function validateCommitteeEndpoint(abbreviation) {
    const url = `${EP_API_V2_BASE}/corporate-bodies/${encodeURIComponent(abbreviation)}?format=application%2Fld%2Bjson`;
    const start = Date.now();
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(url, {
                signal: controller.signal,
                headers: { Accept: 'application/ld+json' },
            });
        }
        finally {
            clearTimeout(timer);
        }
        const responseTimeMs = Date.now() - start;
        if (!response.ok) {
            return {
                abbreviation,
                success: false,
                hasName: false,
                hasLabel: false,
                hasClassification: false,
                name: null,
                error: `HTTP ${String(response.status)}`,
                responseTimeMs,
            };
        }
        const body = (await response.json());
        const items = body.data;
        if (!Array.isArray(items) || items.length === 0) {
            return {
                abbreviation,
                success: false,
                hasName: false,
                hasLabel: false,
                hasClassification: false,
                name: null,
                error: 'No data items in response',
                responseTimeMs,
            };
        }
        const item = items[0];
        const name = item?.prefLabel?.['en'] ?? item?.altLabel?.['en'] ?? null;
        const label = item?.label ?? null;
        const classification = item?.classification ?? null;
        const hasName = name !== null && name.length > 0;
        const hasLabel = label !== null && label.length > 0;
        const hasClassification = classification?.includes('COMMITTEE') ?? false;
        return {
            abbreviation,
            success: hasName && hasLabel && hasClassification,
            hasName,
            hasLabel,
            hasClassification,
            name,
            error: null,
            responseTimeMs,
        };
    }
    catch (err) {
        return {
            abbreviation,
            success: false,
            hasName: false,
            hasLabel: false,
            hasClassification: false,
            name: null,
            error: err instanceof Error ? err.message : String(err),
            responseTimeMs: Date.now() - start,
        };
    }
}
/**
 * Validate all specified committee endpoints and return a summary.
 *
 * @param committees - Array of committee abbreviations to validate
 * @returns Validation summary
 */
export async function validateEPAPI(committees = DEFAULT_COMMITTEES) {
    const results = await Promise.all(committees.map((abbr) => validateCommitteeEndpoint(abbr)));
    const totalPassed = results.filter((r) => r.success).length;
    return {
        timestamp: new Date().toISOString(),
        apiBase: EP_API_V2_BASE,
        totalChecked: results.length,
        totalPassed,
        totalFailed: results.length - totalPassed,
        results,
        allValid: totalPassed === results.length,
    };
}
// ─── CLI entry point ────────────────────────────────────────────────────────
/* c8 ignore start */
async function main() {
    const args = process.argv.slice(2);
    const committeesArg = args.find((a) => a.startsWith('--committees='));
    const committees = committeesArg
        ? committeesArg.replace('--committees=', '').split(',')
        : [...DEFAULT_COMMITTEES];
    console.log(`\n🔍 Validating EP v2 API for committees: ${committees.join(', ')}\n`);
    const summary = await validateEPAPI(committees);
    for (const r of summary.results) {
        const icon = r.success ? '✅' : '❌';
        const detail = r.success
            ? `${r.name} (${String(r.responseTimeMs)}ms)`
            : `Error: ${r.error ?? 'unknown'} (${String(r.responseTimeMs)}ms)`;
        console.log(`  ${icon} ${r.abbreviation}: ${detail}`);
    }
    console.log(`\n📊 Summary: ${String(summary.totalPassed)}/${String(summary.totalChecked)} passed`);
    if (!summary.allValid) {
        console.error('\n❌ EP v2 API validation failed — some endpoints returned no real data');
        process.exitCode = 1;
    }
    else {
        console.log('\n✅ All EP v2 API committee endpoints returned real data');
    }
}
// Only run if executed directly (not imported)
if (process.argv[1] &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main().catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Fatal error:', message);
        process.exitCode = 1;
    });
}
/* c8 ignore stop */
//# sourceMappingURL=validate-ep-api.js.map