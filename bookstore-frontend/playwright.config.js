import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './playwright',
    fullyParallel: false,    // serial across files
    workers: 1,              // until backend supports concurrency
    retries: process.env.CI ? 2 : 1,
    reporter: [['list'], ['html']],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: [
        {
            command: 'npm run dev',
            url: 'http://localhost:3000',
            reuseExistingServer: true,
            timeout: 120_000,
        },
        {
            command: 'php artisan migrate:fresh --seed --force && php artisan serve --port=8000',
            cwd: '../bookstore-api',
            url: 'http://localhost:8000/api/books',
            reuseExistingServer: true,
            timeout: 180_000,
        },
    ],
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
});