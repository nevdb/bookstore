import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const ADMIN = { email: 'admin@example.com', password: 'password' };

test.describe('Admin: Genres Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN.email, ADMIN.password);
        await page.goto('/admin/genres');
        await expect(page).toHaveURL(/\/admin\/genres/);
    });

    test('admin can open Create Genre form', async ({ page }) => {
        await page.locator('button.create-genre-btn').click();
        await expect(page.getByRole('heading', { name: /create new genre/i })).toBeVisible();
        await expect(page.locator('input#name')).toBeVisible();
    });

    test('admin can create a new genre', async ({ page }) => {
        await page.locator('button.create-genre-btn').click();

        const uniqueName = `E2E Genre ${Date.now()}`;
        await page.fill('input#name', uniqueName);
        await page.fill('textarea#description', 'Created by Playwright E2E test');
        await page.getByRole('button', { name: /create genre/i }).click();

        // Modal closes after successful creation
        await expect(page.locator('.modal-overlay')).toHaveCount(0, { timeout: 10000 });
    });

    test('genres list shows as a table', async ({ page }) => {
        await expect(page.locator('table.genres-table')).toBeVisible();
    });

    test('admin can cancel deletion of a genre via modal', async ({ page }) => {
        const rows = page.locator('.genres-table tbody tr');
        const count = await rows.count();
        if (count === 0) {
            test.skip(true, 'No genres to delete');
            return;
        }

        await rows.first().locator('button.delete-btn').click();
        await expect(page.locator('.modal-overlay')).toBeVisible();
        await page.locator('.modal-overlay button.cancel-btn').click();
        await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });
});
