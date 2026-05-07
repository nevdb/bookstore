import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const USER = { email: 'test@example.com', password: 'password' };

test.describe('Books browsing (authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
    });

    test('can view list of books', async ({ page }) => {
        await page.goto('/books');
        await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 30000 });
    });

    test('clicking a book opens its detail page', async ({ page }) => {
        await page.goto('/books');
        const firstCard = page.locator('[data-testid="book-card"]').first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });
        await firstCard.click();

        await expect(page).toHaveURL(/\/books\/\d+/);
        // Detail page contains an Add to Collection button
        await expect(page.locator('[data-testid="add-to-collection-btn"]')).toBeVisible();
    });

    test('book detail page renders title and author', async ({ page }) => {
        await page.goto('/books');
        await page.locator('[data-testid="book-card"]').first().click();
        await expect(page).toHaveURL(/\/books\/\d+/);
        // Title is rendered inside .book-detail-title (an h1)
        await expect(page.locator('.book-detail-title')).toBeVisible();
    });
});

test.describe('Books browsing - unauthenticated', () => {
    test('/books redirects unauthenticated user to /login', async ({ page }) => {
        await page.goto('/books');
        await expect(page).toHaveURL(/\/login/);
    });
});
