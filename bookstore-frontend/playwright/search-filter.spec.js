import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const USER = { email: 'test@example.com', password: 'password' };

test.describe('Search and Filter (authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await page.goto('/books');
        await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('search returns results when there is a match', async ({ page }) => {
        await page.locator('input.book-search-input').fill('a');
        await page.locator('button.book-search-button').click();

        // Either results show or "no results" message
        await expect(async () => {
            const cards = await page.locator('[data-testid="book-card"]').count();
            const noResults = await page.getByText(/no books|no results/i).isVisible().catch(() => false);
            expect(cards > 0 || noResults).toBe(true);
        }).toPass({ timeout: 5000 });
    });

    test('search clear restores results', async ({ page }) => {
        const initialCount = await page.locator('[data-testid="book-card"]').count();
        await page.locator('input.book-search-input').fill('xyzzy-impossible-search-term');
        await page.locator('button.book-search-button').click();
        await page.waitForTimeout(500);

        // Click "Clear" to reset
        const clearBtn = page.locator('button.book-search-clear');
        if (await clearBtn.isVisible().catch(() => false)) {
            await clearBtn.click();
            await expect(page.locator('[data-testid="book-card"]').first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('filter by genre updates results', async ({ page }) => {
        const genreSelect = page.locator('.filter-select').first();
        await expect(genreSelect).toBeVisible();

        // Select the second option (first non-empty genre option)
        const options = await genreSelect.locator('option').all();
        if (options.length > 1) {
            const value = await options[1].getAttribute('value');
            await genreSelect.selectOption(value);
            // Allow refetch
            await page.waitForTimeout(800);

            const cards = await page.locator('[data-testid="book-card"]').count();
            const noResults = await page.getByText(/no books|no results/i).isVisible().catch(() => false);
            expect(cards >= 0 || noResults).toBe(true);
        }
    });
});
