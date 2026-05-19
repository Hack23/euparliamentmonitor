// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/ArticleGenerator
 * @description Barrel + thin CLI entry point for the article generator.
 *
 * The library was split (Refactor 7/8) into focused sub-modules under
 * `./generator/` so the public API is importable without CLI
 * side-effects:
 *
 *   - `./generator/cli.ts`                   — `parseCliArgs`, `CliOptions`
 *   - `./generator/slug.ts`                  — slug + default-description helpers
 *   - `./generator/discovery.ts`             — `discoverAnalysisRuns`, grouping
 *   - `./generator/reader-guide-insertion.ts`— Reader guide splice helper
 *   - `./generator/render-one.ts`            — `generateArticle(...)` single-run
 *   - `./generator/render-batch.ts`          — `generateAllArticles(opts)`
 *
 * This file remains the compiled CLI entry — `npm run generate-article`
 * resolves to `scripts/aggregator/article-generator.js`. The
 * `process.exit`, `console.log`, and `process.argv` side-effects live
 * inside the `isMain` block below so that programmatic importers
 * (production aggregator code, the test suite, downstream curators)
 * see only the pure barrel exports.
 *
 * **Always-14-languages-always-HTML contract**: every CLI invocation
 * renders every supported language to HTML. The legacy `--lang` /
 * `--language` / `--markdown-only` flags have been removed. The
 * programmatic `generateArticle()` API still accepts `langs` and
 * `markdownOnly` for tests that need to scope a render for speed.
 */
import path from 'path';
import { pathToFileURL } from 'url';
// CLI parsing
export { parseCliArgs } from './generator/cli.js';
// Slug + default description
export { buildArticleSlug, sanitizeRunSuffix, extractDefaultDescription, } from './generator/slug.js';
// Discovery + grouping
export { discoverAnalysisRuns, groupRunsForCollision, } from './generator/discovery.js';
// Reader guide insertion
export { insertReaderGuideAfterExecutiveBrief } from './generator/reader-guide-insertion.js';
// Single-run + batch orchestrators
export { generateArticle } from './generator/render-one.js';
export { generateAllArticles } from './generator/render-batch.js';
import { parseCliArgs } from './generator/cli.js';
import { generateArticle } from './generator/render-one.js';
import { generateAllArticles } from './generator/render-batch.js';
/**
 * Main entry when invoked as a script. Uses `process.argv.slice(2)` and the
 * current working directory as repo root unless overridden by `REPO_ROOT`.
 *
 * @param argv - Argument list (defaults to `process.argv.slice(2)`)
 */
export async function main(argv = process.argv.slice(2)) {
    const repoRoot = process.env.REPO_ROOT ? path.resolve(process.env.REPO_ROOT) : process.cwd();
    const opts = parseCliArgs(argv, repoRoot);
    if (opts.all) {
        const results = generateAllArticles(opts);
        let totalFiles = 0;
        let totalArtifacts = 0;
        for (const r of results) {
            totalFiles += r.writtenFiles.length;
            totalArtifacts += r.aggregated.includedArtifacts.length;
            process.stdout.write(`  [${r.aggregated.date}/${r.aggregated.articleType}] ${r.writtenFiles.length} file(s) · ${r.aggregated.includedArtifacts.length} artifact(s) · gate ${r.aggregated.gateResult}\n`);
        }
        process.stdout.write(`Generated ${totalFiles} file(s) across ${results.length} run(s) from ${totalArtifacts} total artifact(s)\n`);
        return;
    }
    const result = generateArticle(opts);
    process.stdout.write(`Generated ${result.writtenFiles.length} file(s) from ${result.aggregated.includedArtifacts.length} artifact(s) — gate: ${result.aggregated.gateResult}\n`);
    for (const f of result.writtenFiles)
        process.stdout.write(`  ${f}\n`);
}
// Only run when invoked directly, not when imported by tests.
const isMain = (() => {
    const entry = process.argv[1];
    if (!entry)
        return false;
    try {
        return import.meta.url === pathToFileURL(entry).href;
    }
    catch {
        return false;
    }
})();
if (isMain) {
    main().catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(`generate-article: ${msg}\n`);
        process.exit(1);
    });
}
//# sourceMappingURL=article-generator.js.map