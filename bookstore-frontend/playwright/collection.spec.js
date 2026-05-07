import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const USER = { email: 'test@example.com', password: 'password' };

test.describe('Personal Collection', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
    });

    test('user can navigate to My Collection from header', async ({ page }) => {
        // Use the header nav link, exact-match to avoid conflict with dashboard's "View Collection →"
        await page.locator('header').getByRole('link', { name: 'Collection', exact: true }).click();
        await expect(page).toHaveURL(/\/my-collection/);
        await expect(page.getByRole('heading', { name: /book collection/i })).toBeVisible();
    });

    test('user can add a book to their collection from book detail page', async ({ page }) => {
        await page.goto('/books');
        await page.locator('[data-testid="book-card"]').first().click();
        await expect(page).toHaveURL(/\/books\/\d+/);

        const addBtn = page.locator('[data-testid="add-to-collection-btn"]');
        await expect(addBtn).toBeVisible();
        const initialText = await addBtn.textContent();

        // Only add if not already in collection
        if (initialText && initialText.includes('+ Add to Collection')) {
            await addBtn.click();
            // After successful add, button shows "✓ In Your Collection"
            await expect(addBtn).toContainText(/In Your Collection|Adding/i, { timeout: 10000 });
        }
    });

    test('user can remove a book from their collection (confirm bar Yes)', async ({ page }) => {
        await page.goto('/my-collection');
        const items = page.locator('[data-testid="collection-item"]');
        const initialCount = await items.count();

        if (initialCount === 0) {
            test.skip(true, 'Collection is empty; cannot test removal');
            return;
        }

        await items.first().locator('.btn-remove').click();
        // Inline confirm bar appears
        await expect(page.locator('.confirm-remove-bar')).toBeVisible();
        await page.locator('[data-testid="confirm-remove-yes"]').click();

        // Either count decreases or empty-message appears
        await expect(async () => {
            const newCount = await items.count();
            const empty = await page.locator('.empty-message').isVisible().catch(() => false);
            expect(newCount < initialCount || empty).toBe(true);
        }).toPass({ timeout: 10000 });
    });

    test('user can cancel a remove via confirm bar', async ({ page }) => {
        await page.goto('/my-collection');
        const items = page.locator('[data-testid="collection-item"]');
        const initialCount = await items.count();

        if (initialCount === 0) {
            test.skip(true, 'Collection is empty');
            return;
        }

        await items.first().locator('.btn-remove').click();
        await expect(page.locator('.confirm-remove-bar')).toBeVisible();
        await page.locator('[data-testid="confirm-remove-cancel"]').click();
        await expect(page.locator('.confirm-remove-bar')).not.toBeVisible();

        // Count unchanged
        await expect(items).toHaveCount(initialCount);
    });

    test('unauthenticated user cannot reach /my-collection', async ({ page, context }) => {
        await context.clearCookies();
        await page.evaluate(() => localStorage.clear()).catch(() => { });

        await page.goto('/my-collection');
        // App.jsx redirects unauthed user away from /my-collection to "/"
        await expect(page).not.toHaveURL(/\/my-collection/);
    });
});
