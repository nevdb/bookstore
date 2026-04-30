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
import { genreService } from "./genreService";

describe("genreService", () => {
    beforeEach(() => vi.clearAllMocks());

    it("getGenres calls GET /api/genres with default page and perPage", () => {
        genreService.getGenres();
        expect(API.get).toHaveBeenCalledWith("/api/genres?page=1&per_page=50");
    });

    it("getGenres calls GET /api/genres with custom page and perPage", () => {
        genreService.getGenres(3, 20);
        expect(API.get).toHaveBeenCalledWith("/api/genres?page=3&per_page=20");
    });

    it("getGenre calls GET /api/genres/:id", () => {
        genreService.getGenre(2);
        expect(API.get).toHaveBeenCalledWith("/api/genres/2");
    });

    it("createGenre calls POST /api/genres with data", () => {
        const data = { name: "Science Fiction", description: "Sci-fi books" };
        genreService.createGenre(data);
        expect(API.post).toHaveBeenCalledWith("/api/genres", data);
    });

    it("updateGenre calls PUT /api/genres/:id with data", () => {
        const data = { name: "Sci-Fi" };
        genreService.updateGenre(4, data);
        expect(API.put).toHaveBeenCalledWith("/api/genres/4", data);
    });

    it("deleteGenre calls DELETE /api/genres/:id", () => {
        genreService.deleteGenre(6);
        expect(API.delete).toHaveBeenCalledWith("/api/genres/6");
    });

    it("getGenreBooks calls GET /api/genres/:id/books", () => {
        genreService.getGenreBooks(3);
        expect(API.get).toHaveBeenCalledWith("/api/genres/3/books");
    });
});
