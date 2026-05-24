import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  // Parallel execution: each Playwright test gets a fresh `page` context, so
  // there is no shared state between tests. Running in parallel cuts the
  // suite from ~25 min → ~3-5 min on the CI runner. `retries: 2` masks the
  // tiny class of timing-sensitive flakes that surface under load.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI workers tuned for the 4-vCPU GitHub-hosted ubuntu-latest runner used
  // by release.yml / e2e.yml / test-and-report.yml. 3 (not 4) leaves CPU
  // headroom for axe-core scans on the large political-intelligence pages
  // (~70 k lines of HTML and growing) — running 4 axe scans in parallel on
  // the same runner caused 30 s timeouts in run #26050940168.
  workers: process.env.CI ? 3 : 2,
  // Default per-test timeout kept at the Playwright default of 30 s so that
  // genuinely hung tests (e.g. a stuck `waitForLoadState('networkidle')` or
  // a missing element on `toBeVisible()`) surface fast instead of blocking
  // a worker for 120 s × 3 retries = 6 min on red runs. axe-heavy tests on
  // the 70 k-line political-intelligence pages opt in to a longer 120 s
  // budget via `test.setTimeout(120_000)` inside their `test(...)` body —
  // see `horizon-nav.spec.js` and `accessibility.spec.js`.
  timeout: 30_000,
  reporter: [
    ['html', { outputFolder: 'builds/playwright-report' }],
    ['junit', { outputFile: 'builds/test-results/e2e-junit.xml' }],
    ['json', { outputFile: 'builds/test-results/e2e-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Other browsers commented out for faster local testing
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
