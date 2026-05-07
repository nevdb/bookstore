import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const ADMIN = { email: 'admin@example.com', password: 'password' };

test.describe('Admin: Books Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN.email, ADMIN.password);
        await page.goto('/admin/books');
        await expect(page).toHaveURL(/\/admin\/books/);
    });

    test('admin can open Create Book form', async ({ page }) => {
        await page.locator('button.create-book-btn').click();
        await expect(page.getByRole('heading', { name: /create.*book/i })).toBeVisible();
        // Form fields
        await expect(page.locator('input[name="title"]')).toBeVisible();
        await expect(page.locator('select[name="genre_id"]')).toBeVisible();
        await expect(page.locator('select[name="author_id"]')).toBeVisible();
    });

    test('admin can create a new book', async ({ page }) => {
        // Open the form AND wait for its data to load before interacting
        const [genresResponse, authorsResponse] = await Promise.all([
            page.waitForResponse(r => r.url().includes('/api/genres') && r.ok()),
            page.waitForResponse(r => r.url().includes('/api/authors') && r.ok()),
            page.locator('button.create-book-btn').click(),
        ]);

        const uniqueTitle = `E2E Book ${Date.now()}`;
        await page.fill('input[name="title"]', uniqueTitle);
        await page.fill('input[name="publication_year"]', '2024');

        const genreSelect = page.locator('select[name="genre_id"]');
        const authorSelect = page.locator('select[name="author_id"]');

        // Web-first assertion with auto-retry — replaces expect.poll
        await expect(genreSelect.locator('option').nth(1)).toBeAttached({ timeout: 15_000 });
        await expect(authorSelect.locator('option').nth(1)).toBeAttached({ timeout: 15_000 });

        await genreSelect.selectOption({ index: 1 });
        await authorSelect.selectOption({ index: 1 });

        await page.locator('.book-create-form button[type="submit"]').click();
        await expect(page.locator('.book-create-form')).toHaveCount(0, { timeout: 15_000 });
    });

    test('books list renders as cards in admin view', async ({ page }) => {
        await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 10000 });
    });
});
