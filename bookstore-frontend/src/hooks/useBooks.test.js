import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { useBooks } from "./useBooks";
import { BooksProvider } from "../context/BooksContext";

vi.mock("../services/booksService");

// Wrapper without JSX so this file can stay as .js
const wrapper = ({ children }) => createElement(BooksProvider, null, children);

describe("useBooks", () => {
    it("throws when used outside BooksProvider", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

        expect(() => renderHook(() => useBooks())).toThrow(
            "useBooks must be used within BooksProvider",
        );

        consoleSpy.mockRestore();
    });

    it("returns context values when used inside BooksProvider", () => {
        const { result } = renderHook(() => useBooks(), { wrapper });

        expect(Array.isArray(result.current.books)).toBe(true);
        expect(typeof result.current.fetchBooks).toBe("function");
        expect(typeof result.current.searchBooks).toBe("function");
        expect(typeof result.current.filterBooks).toBe("function");
    });

    it("returns an empty books array on initial render", () => {
        const { result } = renderHook(() => useBooks(), { wrapper });

        expect(result.current.books).toHaveLength(0);
    });
});
