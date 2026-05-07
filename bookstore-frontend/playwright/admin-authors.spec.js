import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const ADMIN = { email: 'admin@example.com', password: 'password' };

test.describe('Admin: Authors Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, ADMIN.email, ADMIN.password);
        await page.goto('/admin/authors');
        await expect(page).toHaveURL(/\/admin\/authors/);
    });

    test('admin can open Create Author form', async ({ page }) => {
        await page.locator('button.create-author-btn').click();
        await expect(page.getByRole('heading', { name: /create new author/i })).toBeVisible();
        await expect(page.locator('input#name')).toBeVisible();
    });

    test('admin can create a new author', async ({ page }) => {
        await page.locator('button.create-author-btn').click();

        const uniqueName = `E2E Author ${Date.now()}`;
        await page.fill('input#name', uniqueName);
        await page.fill('input#place_of_birth', 'Testville');
        await page.getByRole('button', { name: /create author/i }).click();

        // Modal closes after successful creation
        await expect(page.locator('.modal-overlay')).toHaveCount(0, { timeout: 10000 });
    });

    test('authors list shows as a table', async ({ page }) => {
        await expect(page.locator('table.authors-table')).toBeVisible();
        // At least 1 row OR empty-state message
        const rowCount = await page.locator('.authors-table tbody tr').count();
        const empty = await page.locator('.authors-empty').isVisible().catch(() => false);
        expect(rowCount > 0 || empty).toBe(true);
    });

    test('admin can cancel deletion of an author via modal', async ({ page }) => {
        const rows = page.locator('.authors-table tbody tr');
        const count = await rows.count();
        if (count === 0) {
            test.skip(true, 'No authors to delete');
            return;
        }

        await rows.first().locator('button.delete-btn').click();
        // Delete confirmation modal opens
        await expect(page.locator('.modal-overlay')).toBeVisible();
        await page.locator('.modal-overlay button.cancel-btn').click();
        await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });
});
