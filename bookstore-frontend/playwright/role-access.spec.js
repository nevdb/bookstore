import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

const ADMIN = { email: 'admin@example.com', password: 'password' };
const USER = { email: 'test@example.com', password: 'password' };

const API_BASE = 'http://localhost:8000/api';

// ─── Frontend: Navigation visibility ───────────────────────────────────────

test.describe('Role-based navigation visibility', () => {
    test('admin sees Users admin link in navigation', async ({ page }) => {
        await loginAs(page, ADMIN.email, ADMIN.password);
        // Header renders <Link> to /admin/users for admins
        await expect(page.locator('header a[href="/admin/users"]')).toBeVisible();
        // Admin badge present
        await expect(page.locator('.admin-badge')).toBeVisible();
    });

    test('regular user does NOT see admin Users link', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await expect(page.locator('header a[href="/admin/users"]')).toHaveCount(0);
        await expect(page.locator('.admin-badge')).toHaveCount(0);
    });
});

// ─── Frontend: Admin route protection ──────────────────────────────────────

test.describe('Admin route protection', () => {
    test('regular user is redirected away from /admin/books', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await page.goto('/admin/books');
        await expect(page).not.toHaveURL(/\/admin\/books/);
    });

    test('regular user is redirected away from /admin/authors', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await page.goto('/admin/authors');
        await expect(page).not.toHaveURL(/\/admin\/authors/);
    });

    test('regular user is redirected away from /admin/genres', async ({ page }) => {
        await loginAs(page, USER.email, USER.password);
        await page.goto('/admin/genres');
        await expect(page).not.toHaveURL(/\/admin\/genres/);
    });

    test('unauthenticated user is redirected to login for admin routes', async ({ page }) => {
        await page.goto('/admin/books');
        await expect(page).toHaveURL(/\/login/);
    });

    test('admin can access /admin/books', async ({ page }) => {
        await loginAs(page, ADMIN.email, ADMIN.password);
        await page.goto('/admin/books');
        await expect(page).toHaveURL(/\/admin\/books/);
    });
});

// ─── API: Admin-only book endpoints ────────────────────────────────────────

test.describe('API authorization - Books (admin only write)', () => {
    let userToken;
    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API_BASE}/auth/login`, {
            data: { email: USER.email, password: USER.password },
        });
        userToken = (await res.json()).token;
    });

    test('regular user receives 403 on POST /api/books', async ({ request }) => {
        const res = await request.post(`${API_BASE}/books`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
            data: { title: 'Hacked Book', publication_year: 2024, author_id: 1, genre_id: 1 },
        });
        expect(res.status()).toBe(403);
    });

    test('regular user receives 403 on PUT /api/books/1', async ({ request }) => {
        const res = await request.put(`${API_BASE}/books/1`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
            data: { title: 'Tampered Title' },
        });
        expect(res.status()).toBe(403);
    });

    test('regular user receives 403 on DELETE /api/books/1', async ({ request }) => {
        const res = await request.delete(`${API_BASE}/books/1`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
        });
        expect(res.status()).toBe(403);
    });
});

// ─── API: Admin-only author endpoints ──────────────────────────────────────

test.describe('API authorization - Authors (admin only write)', () => {
    let userToken;
    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API_BASE}/auth/login`, {
            data: { email: USER.email, password: USER.password },
        });
        userToken = (await res.json()).token;
    });

    test('regular user receives 403 on POST /api/authors', async ({ request }) => {
        const res = await request.post(`${API_BASE}/authors`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
            data: { name: 'Hacked Author', place_of_birth: 'Nowhere' },
        });
        expect(res.status()).toBe(403);
    });

    test('regular user receives 403 on PUT /api/authors/1', async ({ request }) => {
        const res = await request.put(`${API_BASE}/authors/1`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
            data: { name: 'Tampered Name' },
        });
        expect(res.status()).toBe(403);
    });

    test('regular user receives 403 on DELETE /api/authors/1', async ({ request }) => {
        const res = await request.delete(`${API_BASE}/authors/1`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
        });
        expect(res.status()).toBe(403);
    });
});

// ─── API: Admin-only genre endpoints ───────────────────────────────────────

test.describe('API authorization - Genres (admin only write)', () => {
    let userToken;
    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API_BASE}/auth/login`, {
            data: { email: USER.email, password: USER.password },
        });
        userToken = (await res.json()).token;
    });

    test('regular user receives 403 on POST /api/genres', async ({ request }) => {
        const res = await request.post(`${API_BASE}/genres`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
            data: { name: 'Hacked Genre' },
        });
        expect(res.status()).toBe(403);
    });

    test('regular user receives 403 on PUT /api/genres/1', async ({ request }) => {
        const res = await request.put(`${API_BASE}/genres/1`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
            data: { name: 'Tampered Name' },
        });
        expect(res.status()).toBe(403);
    });

    test('regular user receives 403 on DELETE /api/genres/1', async ({ request }) => {
        const res = await request.delete(`${API_BASE}/genres/1`, {
            headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
        });
        expect(res.status()).toBe(403);
    });
});
