import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    // Keep test artifacts separate from the HTML report folder.
    // This avoids Playwright's reporter/outputDir clash that can delete artifacts.
    outputDir: 'test-results/artifacts',
    timeout: 60000,
    expect: {
        timeout: 10000,
    },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        ['list'],
        ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ],
    use: {
        actionTimeout: 30000,
        navigationTimeout: 30000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'ui-tests',
            testDir: './tests/ui',
            use: {
                baseURL: 'https://opensource-demo.orangehrmlive.com',
                browserName: 'chromium',
                headless: true,
                viewport: { width: 1280, height: 720 },
            },
        },
        {
            name: 'api-tests',
            testDir: './tests/api',
            use: {
                baseURL: 'https://petstore.swagger.io/v2',
                extraHTTPHeaders: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            },
        },
    ],
});
