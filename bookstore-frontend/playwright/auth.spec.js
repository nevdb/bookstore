import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const ADMIN = { email: 'admin@example.com', password: 'password' };
const USER = { email: 'test@example.com', password: 'password' };

const API_BASE = 'http://localhost:8000/api';

// ─── Registration ──────────────────────────────────────────────────────────

test.describe('User Registration', () => {
    test('new user can register with valid credentials', async ({ page }) => {
        const uniqueEmail = `e2e-${Date.now()}@example.com`;

        await page.goto('/signup');
        await page.fill('input#name', 'E2E Tester');
        await page.fill('input#email', uniqueEmail);
        await page.fill('input#password', 'Test@1234');
        await page.fill('input#password_confirmation', 'Test@1234');
        await page.getByRole('button', { name: /create account/i }).click();
        await page.waitForURL('**/dashboard', { timeout: 10_000 });
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('new user is assigned user role by default (not admin)', async ({ request }) => {
        const uniqueEmail = `e2e-role-${Date.now()}@example.com`;

        const res = await request.post(`${API_BASE}/auth/register`, {
            data: {
                name: 'Role Tester',
                email: uniqueEmail,
                password: 'Test@1234',
                password_confirmation: 'Test@1234',
            },
        });
        expect(res.status()).toBe(201);
        const body = await res.json();
        expect(body.user.role).toBe('user');
    });

    test('registration fails with duplicate email', async ({ page }) => {
        await page.goto('/signup');
        await page.fill('input#name', 'Duplicate');
        await page.fill('input#email', USER.email);
        await page.fill('input#password', 'Test@1234');
        await page.fill('input#password_confirmation', 'Test@1234');
        await page.getByRole('button', { name: /create account/i }).click();

        // Should remain on signup OR show error message
        await expect(async () => {
            const stayedOnSignup = page.url().includes('/signup');
            const errorVisible = await page.locator('.error-message').isVisible().catch(() => false);
            expect(stayedOnSignup || errorVisible).toBe(true);
        }).toPass({ timeout: 5000 });
    });

    test('registration is blocked for invalid email format', async ({ page }) => {
        await page.goto('/signup');
        await page.fill('input#name', 'Bad Email');
        await page.fill('input#email', 'not-an-email');
        await page.fill('input#password', 'Test@1234');
        await page.fill('input#password_confirmation', 'Test@1234');
        await page.getByRole('button', { name: /create account/i }).click();

        // HTML5 validation prevents submission
        await expect(page).toHaveURL(/\/signup/);
    });
});

// ─── Login ─────────────────────────────────────────────────────────────────

test.describe('User Login', () => {
    test('login with valid regular user credentials succeeds', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await expect(page).not.toHaveURL(/\/login/);
    });

    test('login with valid admin credentials succeeds', async ({ page }) => {
        await loginAs(page, ADMIN.email, ADMIN.password);
        await expect(page).not.toHaveURL(/\/login/);
    });

    test('login with wrong password shows error', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input#email', USER.email);
        await page.fill('input#password', 'wrongpassword');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('login with non-existent email shows error', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input#email', 'nobody@nowhere.com');
        await page.fill('input#password', 'password');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });
});

// ─── Logout ────────────────────────────────────────────────────────────────

test.describe('Logout', () => {
    test('logout clears session and shows login link', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await page.locator('.logout-btn').click();

        await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    });

    test('after logout, /dashboard redirects to /login', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await page.locator('.logout-btn').click();
        // Wait for logout to complete (login link reappears in nav)
        await expect(page.getByRole('link', { name: /login/i })).toBeVisible();

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);
    });
});
