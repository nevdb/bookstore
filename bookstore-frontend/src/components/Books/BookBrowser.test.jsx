import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BookBrowser from "./BookBrowser";

// ─── Mock the BooksContext hook ───────────────────────────────────────────────

vi.mock("../../hooks/useBooks", () => ({
  useBooks: vi.fn(),
}));

// Mock child components to isolate BookBrowser logic
vi.mock("./BookSearch", () => ({
  default: () => <div data-testid="book-search" />,
}));
vi.mock("./BookFilter", () => ({
  default: () => <div data-testid="book-filter" />,
}));

import { useBooks } from "../../hooks/useBooks";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockBooks = [
  {
    id: 1,
    title: "Book One",
    author: { name: "Author A" },
    genre: { name: "Fiction" },
    publication_year: 2020,
    cover_url: null,
  },
  {
    id: 2,
    title: "Book Two",
    author: { name: "Author B" },
    genre: { name: "History" },
    publication_year: 2021,
    cover_url: null,
  },
];

const defaultContext = {
  books: mockBooks,
  loading: false,
  error: null,
  pagination: { total: 2, last_page: 1, current_page: 1 },
  fetchBooks: vi.fn(),
  sortBooks: vi.fn(),
  sort: {},
};

function renderBrowser(props = {}) {
  return render(
    <MemoryRouter>
      <BookBrowser {...props} />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("BookBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBooks.mockReturnValue({ ...defaultContext });
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the heading", () => {
    renderBrowser();
    expect(
      screen.getByRole("heading", { name: /browse our library/i }),
    ).toBeInTheDocument();
  });

  it("renders the search and filter controls", () => {
    renderBrowser();
    expect(screen.getByTestId("book-search")).toBeInTheDocument();
    expect(screen.getByTestId("book-filter")).toBeInTheDocument();
  });

  it("renders a sort dropdown", () => {
    renderBrowser();
    expect(
      screen.getByRole("combobox", { name: /sort books/i }),
    ).toBeInTheDocument();
  });

  it("renders a card for each book", () => {
    renderBrowser();
    expect(screen.getByText("Book One")).toBeInTheDocument();
    expect(screen.getByText("Book Two")).toBeInTheDocument();
  });

  it("shows book count stats", () => {
    renderBrowser();
    expect(screen.getByText(/showing 2 of 2 books/i)).toBeInTheDocument();
  });

  // ── Loading state ─────────────────────────────────────────────────────────────

  it("shows loading spinner when loading=true and books list is empty", () => {
    useBooks.mockReturnValue({ ...defaultContext, loading: true, books: [] });
    renderBrowser();
    expect(screen.getByText(/loading books/i)).toBeInTheDocument();
  });

  it("does not show loading spinner when books are already loaded", () => {
    useBooks.mockReturnValue({ ...defaultContext, loading: true });
    renderBrowser();
    expect(screen.queryByText(/loading books/i)).not.toBeInTheDocument();
    expect(screen.getByText("Book One")).toBeInTheDocument();
  });

  // ── Empty state ───────────────────────────────────────────────────────────────

  it("shows empty state message when no books are found", () => {
    useBooks.mockReturnValue({
      ...defaultContext,
      loading: false,
      books: [],
      pagination: { total: 0, last_page: 1, current_page: 1 },
    });
    renderBrowser();
    expect(screen.getByText(/no books found/i)).toBeInTheDocument();
  });

  // ── Error state ───────────────────────────────────────────────────────────────

  it("shows error message when error is set", () => {
    useBooks.mockReturnValue({
      ...defaultContext,
      error: "Failed to load books.",
    });
    renderBrowser();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Failed to load books.")).toBeInTheDocument();
  });

  it("does not render book grid when there is an error", () => {
    useBooks.mockReturnValue({
      ...defaultContext,
      error: "Something went wrong.",
    });
    renderBrowser();
    expect(screen.queryByText("Book One")).not.toBeInTheDocument();
  });

  // ── fetchBooks on mount ───────────────────────────────────────────────────────

  it("calls fetchBooks on mount", async () => {
    const fetchBooks = vi.fn();
    useBooks.mockReturnValue({ ...defaultContext, fetchBooks });
    renderBrowser();
    await waitFor(() => expect(fetchBooks).toHaveBeenCalledWith(1));
  });

  // ── Pagination ────────────────────────────────────────────────────────────────

  it("does not render pagination when there is only one page", () => {
    renderBrowser();
    expect(
      screen.queryByRole("button", { name: /next/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /previous/i }),
    ).not.toBeInTheDocument();
  });

  it("renders Next button when there are multiple pages", async () => {
    useBooks.mockReturnValue({
      ...defaultContext,
      pagination: { total: 24, last_page: 2, current_page: 1 },
    });
    renderBrowser();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("calls fetchBooks with page 2 when Next is clicked", async () => {
    const fetchBooks = vi.fn();
    useBooks.mockReturnValue({
      ...defaultContext,
      fetchBooks,
      pagination: { total: 24, last_page: 2, current_page: 1 },
    });
    renderBrowser();

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => expect(fetchBooks).toHaveBeenCalledWith(2));
  });

  // ── Sorting ───────────────────────────────────────────────────────────────────

  it("calls sortBooks when a sort option is selected", async () => {
    const sortBooks = vi.fn();
    useBooks.mockReturnValue({ ...defaultContext, sortBooks });
    renderBrowser();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /sort books/i }),
      "title:asc",
    );

    expect(sortBooks).toHaveBeenCalledWith("title", "asc", 1);
  });

  it("calls fetchBooks when sort is reset to default", async () => {
    const fetchBooks = vi.fn();
    const sortBooks = vi.fn();
    useBooks.mockReturnValue({
      ...defaultContext,
      fetchBooks,
      sortBooks,
      sort: { sort_by: "title", sort_dir: "asc" },
    });
    renderBrowser();
    // Wait for mount effect to settle (calls sortBooks because sort.sort_by is set)
    await waitFor(() => expect(sortBooks).toHaveBeenCalledTimes(1));
    vi.clearAllMocks();
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /sort books/i }),
      "",
    );

    expect(fetchBooks).toHaveBeenCalledWith(1);
    expect(sortBooks).not.toHaveBeenCalled();
  });

  // ── Admin controls ────────────────────────────────────────────────────────────

  it("does not pass admin props to cards by default", () => {
    renderBrowser();
    // Admin edit buttons should not appear
    expect(
      screen.queryByRole("button", { name: /edit book one/i }),
    ).not.toBeInTheDocument();
  });

  it("passes isAdmin=true to book cards when isAdmin prop is set", () => {
    renderBrowser({
      isAdmin: true,
      onEditBook: vi.fn(),
      onDeleteBook: vi.fn(),
    });
    expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(
      mockBooks.length,
    );
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(
      mockBooks.length,
    );
  });
});
