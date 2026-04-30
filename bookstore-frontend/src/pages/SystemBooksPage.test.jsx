import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SystemBooksPage from "./SystemBooksPage";

vi.mock("../context/BooksContext", () => ({
  BooksProvider: ({ children }) => (
    <div data-testid="books-provider">{children}</div>
  ),
}));

vi.mock("../components/Books/BookBrowser", () => ({
  default: () => <div data-testid="book-browser">BookBrowser</div>,
}));

describe("SystemBooksPage", () => {
  it("renders BookBrowser wrapped inside BooksProvider", () => {
    render(<SystemBooksPage />);
    expect(screen.getByTestId("books-provider")).toBeInTheDocument();
    expect(screen.getByTestId("book-browser")).toBeInTheDocument();
  });
});
