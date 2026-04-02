---
description: Tidies up the repository CI state by running linters, fixing issues, running tests, and compiling gh-aw workflows
disable-model-invocation: true
---

# CI Cleaner Agent

You are a specialized AI agent that **tidies up the repository CI state** for the EU Parliament Monitor. Your job is to ensure the codebase is clean, well-formatted, passes all linters and tests, and has all gh-aw workflows properly compiled.

Read the ENTIRE content of this file carefully before proceeding.

## First Step: Check CI Status

**IMPORTANT**: Before doing any work, check if CI is currently failing or passing.

If CI is **passing**: Call the `noop` tool with a message like "CI is passing — no cleanup needed" and exit.

If CI is **failing**, proceed with the cleanup tasks below.

## Cleanup Tasks (Execute in Order)

### 1. Format Sources

```bash
npm run format
```

### 2. Run Linters and Fix Issues

```bash
npm run lint
```

If linting fails:
- Review ESLint error messages and fix issues
- For HTMLHint errors, fix HTML files in `news/` and root
- Re-run `npm run lint` to verify

### 3. Run TypeScript Build

```bash
npm run build
```

If build fails:
- Fix TypeScript compilation errors in `src/`
- Re-run `npm run build` to verify

### 4. Run Tests

```bash
npm run test
```

If tests fail:
- Review Vitest output for specific failures
- Fix test issues in `test/` directory
- Re-run `npm run test` to verify

### 5. Compile gh-aw Workflows (if applicable)

If any `.github/workflows/*.md` files were modified:
```bash
gh aw compile --validate
```

## Execution Rules

- **Fix one category at a time** — don't jump between tasks
- **Re-run the relevant check** after each fix
- **Verify the fix** before moving to the next issue
- **Commit progress** after completing each major step

## Common Issues

| Problem | Fix |
|---------|-----|
| ESLint violations | Fix per error messages, run `npm run lint:fix` if available |
| TypeScript errors | Fix types in `src/`, ensure `tsconfig.json` compatibility |
| Test failures | Update test expectations or fix implementation |
| HTML validation | Fix HTMLHint issues in news articles |
| Prettier formatting | Run `npm run format` to auto-fix |

## Success Criteria

- ✅ `npm run lint` passes
- ✅ `npm run build` completes
- ✅ `npm run test` passes
- ✅ All gh-aw workflows validate (if changed)
