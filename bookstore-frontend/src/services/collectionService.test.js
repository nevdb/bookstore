import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// collectionService uses axios directly (not the shared API instance)
vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

import axios from "axios";
import collectionService from "./collectionService";

const TOKEN = "test-auth-token";
const BASE = "http://localhost:8000/api/user/collection";
const AUTH_HEADER = { Authorization: `Bearer ${TOKEN}` };

describe("collectionService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem("authToken", TOKEN);
        // Each axios method returns a promise resolving with { data: 'ok' }
        axios.get.mockResolvedValue({ data: "ok" });
        axios.post.mockResolvedValue({ data: "ok" });
        axios.put.mockResolvedValue({ data: "ok" });
        axios.delete.mockResolvedValue({ data: "ok" });
    });

    afterEach(() => {
        localStorage.clear();
    });

    // ── getCollection ──────────────────────────────────────────────────────────

    it("getCollection calls axios.get with default page/perPage", async () => {
        await collectionService.getCollection();
        expect(axios.get).toHaveBeenCalledWith(
            `${BASE}?page=1&per_page=12`,
            { headers: AUTH_HEADER },
        );
    });

    it("getCollection calls axios.get with custom params", async () => {
        await collectionService.getCollection(2, 6, { status: "reading" });
        const [url] = axios.get.mock.calls[0];
        expect(url).toContain("page=2");
        expect(url).toContain("per_page=6");
        expect(url).toContain("status=reading");
    });

    it("getCollection returns response.data (unwrapped)", async () => {
        axios.get.mockResolvedValue({ data: { books: [] } });
        const result = await collectionService.getCollection();
        expect(result).toEqual({ books: [] });
    });

    // ── addBook ────────────────────────────────────────────────────────────────

    it("addBook calls axios.post with correct body and default values", async () => {
        await collectionService.addBook(5);
        expect(axios.post).toHaveBeenCalledWith(
            BASE,
            { book_id: 5, status: "to-read", personal_rating: null, notes: null },
            { headers: AUTH_HEADER },
        );
    });

    it("addBook passes custom status, rating and notes", async () => {
        await collectionService.addBook(5, "reading", 4, "Great book");
        expect(axios.post).toHaveBeenCalledWith(
            BASE,
            { book_id: 5, status: "reading", personal_rating: 4, notes: "Great book" },
            { headers: AUTH_HEADER },
        );
    });

    it("addBook returns response.data", async () => {
        axios.post.mockResolvedValue({ data: { id: 1 } });
        const result = await collectionService.addBook(5);
        expect(result).toEqual({ id: 1 });
    });

    // ── updateBook ─────────────────────────────────────────────────────────────

    it("updateBook calls axios.put with correct url and data", async () => {
        const data = { personal_rating: 5, status: "completed" };
        await collectionService.updateBook(3, data);
        expect(axios.put).toHaveBeenCalledWith(
            `${BASE}/3`,
            data,
            { headers: AUTH_HEADER },
        );
    });

    it("updateBook returns response.data", async () => {
        axios.put.mockResolvedValue({ data: { updated: true } });
        const result = await collectionService.updateBook(3, {});
        expect(result).toEqual({ updated: true });
    });

    // ── removeBook ─────────────────────────────────────────────────────────────

    it("removeBook calls axios.delete with correct url", async () => {
        await collectionService.removeBook(8);
        expect(axios.delete).toHaveBeenCalledWith(
            `${BASE}/8`,
            { headers: AUTH_HEADER },
        );
    });

    it("removeBook returns response.data", async () => {
        axios.delete.mockResolvedValue({ data: { deleted: true } });
        const result = await collectionService.removeBook(8);
        expect(result).toEqual({ deleted: true });
    });

    // ── getStatistics ──────────────────────────────────────────────────────────

    it("getStatistics calls axios.get on the statistics endpoint", async () => {
        await collectionService.getStatistics();
        expect(axios.get).toHaveBeenCalledWith(
            "http://localhost:8000/api/user/statistics",
            { headers: AUTH_HEADER },
        );
    });

    it("getStatistics returns response.data", async () => {
        axios.get.mockResolvedValue({ data: { total_books: 10 } });
        const result = await collectionService.getStatistics();
        expect(result).toEqual({ total_books: 10 });
    });
});
