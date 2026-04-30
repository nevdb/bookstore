import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("./api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

import API from "./api";
import { booksService } from "./booksService";

describe("booksService", () => {
    beforeEach(() => vi.clearAllMocks());

    // ── getBooks ───────────────────────────────────────────────────────────────

    it("getBooks calls GET /api/books with default params", () => {
        booksService.getBooks();
        expect(API.get).toHaveBeenCalledWith("/api/books?page=1&per_page=15");
    });

    it("getBooks calls GET /api/books with custom page and perPage", () => {
        booksService.getBooks(2, 30);
        expect(API.get).toHaveBeenCalledWith("/api/books?page=2&per_page=30");
    });

    it("getBooks includes sort_by and sort_dir when sortBy is provided", () => {
        booksService.getBooks(1, 15, "title", "desc");
        const call = API.get.mock.calls[0][0];
        expect(call).toContain("sort_by=title");
        expect(call).toContain("sort_dir=desc");
    });

    it("getBooks omits sort params when sortBy is empty string", () => {
        booksService.getBooks(1, 15, "", "asc");
        const call = API.get.mock.calls[0][0];
        expect(call).not.toContain("sort_by");
        expect(call).not.toContain("sort_dir");
    });

    // ── getBook ────────────────────────────────────────────────────────────────

    it("getBook calls GET /api/books/:id", () => {
        booksService.getBook(42);
        expect(API.get).toHaveBeenCalledWith("/api/books/42");
    });

    // ── createBook ─────────────────────────────────────────────────────────────

    it("createBook calls POST /api/books with data", () => {
        const data = { title: "Dune", publication_year: 1965 };
        booksService.createBook(data);
        expect(API.post).toHaveBeenCalledWith("/api/books", data);
    });

    // ── updateBook ─────────────────────────────────────────────────────────────

    it("updateBook calls PUT /api/books/:id with data", () => {
        const data = { title: "Dune Messiah" };
        booksService.updateBook(42, data);
        expect(API.put).toHaveBeenCalledWith("/api/books/42", data);
    });

    // ── deleteBook ─────────────────────────────────────────────────────────────

    it("deleteBook calls DELETE /api/books/:id", () => {
        booksService.deleteBook(10);
        expect(API.delete).toHaveBeenCalledWith("/api/books/10");
    });

    // ── searchBooks ────────────────────────────────────────────────────────────

    it("searchBooks calls GET /api/books/search with encoded query", () => {
        booksService.searchBooks("harry potter");
        expect(API.get).toHaveBeenCalledWith(
            "/api/books/search?q=harry%20potter",
        );
    });

    it("searchBooks URL-encodes special characters in query", () => {
        booksService.searchBooks("C++ & Java");
        const call = API.get.mock.calls[0][0];
        expect(call).toContain(encodeURIComponent("C++ & Java"));
    });

    // ── filterBooks ────────────────────────────────────────────────────────────

    it("filterBooks calls GET /api/books/filter with serialised filters", () => {
        booksService.filterBooks({ genre_id: "1", author_id: "2" });
        const call = API.get.mock.calls[0][0];
        expect(call).toContain("/api/books/filter?");
        expect(call).toContain("genre_id=1");
        expect(call).toContain("author_id=2");
    });
});
