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
import { authorService } from "./authorService";

describe("authorService", () => {
    beforeEach(() => vi.clearAllMocks());

    it("getAuthors calls GET /api/authors with default page and perPage", () => {
        authorService.getAuthors();
        expect(API.get).toHaveBeenCalledWith("/api/authors?page=1&per_page=50");
    });

    it("getAuthors calls GET /api/authors with custom page and perPage", () => {
        authorService.getAuthors(2, 10);
        expect(API.get).toHaveBeenCalledWith("/api/authors?page=2&per_page=10");
    });

    it("getAuthor calls GET /api/authors/:id", () => {
        authorService.getAuthor(5);
        expect(API.get).toHaveBeenCalledWith("/api/authors/5");
    });

    it("createAuthor calls POST /api/authors with data", () => {
        const data = { name: "George Orwell", place_of_birth: "India" };
        authorService.createAuthor(data);
        expect(API.post).toHaveBeenCalledWith("/api/authors", data);
    });

    it("updateAuthor calls PUT /api/authors/:id with data", () => {
        const data = { name: "Updated Name" };
        authorService.updateAuthor(3, data);
        expect(API.put).toHaveBeenCalledWith("/api/authors/3", data);
    });

    it("deleteAuthor calls DELETE /api/authors/:id", () => {
        authorService.deleteAuthor(7);
        expect(API.delete).toHaveBeenCalledWith("/api/authors/7");
    });

    it("getAuthorBooks calls GET /api/authors/:id/books", () => {
        authorService.getAuthorBooks(4);
        expect(API.get).toHaveBeenCalledWith("/api/authors/4/books");
    });
});
