import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BooksProvider, BooksContext } from "./BooksContext";
import { useContext } from "react";
import * as booksService from "../services/booksService";

vi.mock("../services/booksService");

const mockGetBooks = vi.fn();
const mockSearch = vi.fn();
const mockFilter = vi.fn();

// Test component that accesses context
const TestComponent = () => {
  const context = useContext(BooksContext);

  if (!context) {
    return <div>No context</div>;
  }

  const {
    books,
    loading,
    error,
    pagination,
    fetchBooks,
    searchBooks,
    filterBooks,
  } = context;

  return (
    <div>
      <div>Loading: {loading ? "true" : "false"}</div>
      <div>Error: {error || "none"}</div>
      <div>Book Count: {books.length}</div>
      <div>Current Page: {pagination?.current_page || 0}</div>
      <div>Total Books: {pagination?.total || 0}</div>

      <button onClick={() => fetchBooks(1)}>Fetch Books</button>
      <button onClick={() => searchBooks("test", 1)}>Search</button>
      <button onClick={() => filterBooks({ genre_id: "1" }, 1)}>Filter</button>

      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
};

describe("BooksContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetBooks.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            title: "The Great Gatsby",
            isbn: "123-456-789",
            publication_year: 2023,
            genre: { id: 1, name: "Fiction" },
            author: { id: 1, name: "F. Scott Fitzgerald" },
          },
          {
            id: 2,
            title: "1984",
            isbn: "987-654-321",
            publication_year: 2023,
            genre: { id: 1, name: "Fiction" },
            author: { id: 2, name: "George Orwell" },
          },
        ],
        total: 2,
        per_page: 12,
        current_page: 1,
        last_page: 1,
      },
    });

    mockSearch.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            title: "The Great Gatsby",
            author: { id: 1, name: "F. Scott Fitzgerald" },
            genre: { id: 1, name: "Fiction" },
          },
        ],
        total: 1,
        per_page: 12,
        current_page: 1,
        last_page: 1,
      },
    });

    mockFilter.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            title: "The Great Gatsby",
            genre: { id: 1, name: "Fiction" },
          },
          {
            id: 2,
            title: "1984",
            genre: { id: 1, name: "Fiction" },
          },
        ],
        total: 2,
        per_page: 12,
        current_page: 1,
        last_page: 1,
      },
    });

    booksService.booksService.getBooks = mockGetBooks;
    booksService.booksService.searchBooks = mockSearch;
    booksService.booksService.filterBooks = mockFilter;
  });

  it("initializes with empty state", () => {
    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    expect(screen.getByText("Loading: false")).toBeInTheDocument();
    expect(screen.getByText("Error: none")).toBeInTheDocument();
    expect(screen.getByText("Book Count: 0")).toBeInTheDocument();
  });

  it("fetches books and updates state", async () => {
    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const fetchButton = screen.getByRole("button", { name: /fetch books/i });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText("Book Count: 2")).toBeInTheDocument();
      expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
      expect(screen.getByText("1984")).toBeInTheDocument();
    });
  });

  it("sets loading state during fetch", async () => {
    let resolveGetBooks;
    mockGetBooks.mockReturnValue(
      new Promise((resolve) => {
        resolveGetBooks = resolve;
      }),
    );

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const fetchButton = screen.getByRole("button", { name: /fetch books/i });
    await userEvent.click(fetchButton);

    // Loading should be true while request is pending
    expect(screen.getByText("Loading: true")).toBeInTheDocument();

    resolveGetBooks({
      data: {
        data: [],
        pagination: { current_page: 1, total: 0, last_page: 1 },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
    });
  });

  it("updates pagination data", async () => {
    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const fetchButton = screen.getByRole("button", { name: /fetch books/i });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText("Current Page: 1")).toBeInTheDocument();
      expect(screen.getByText("Total Books: 2")).toBeInTheDocument();
    });
  });

  it("handles search request", async () => {
    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const searchButton = screen.getByRole("button", { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("test");
      expect(screen.getByText("Book Count: 1")).toBeInTheDocument();
      expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
    });
  });

  it("handles filter request", async () => {
    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const filterButton = screen.getByRole("button", { name: /filter/i });
    await userEvent.click(filterButton);

    await waitFor(() => {
      expect(mockFilter).toHaveBeenCalledWith({ genre_id: "1", page: 1 });
      expect(screen.getByText("Book Count: 2")).toBeInTheDocument();
    });
  });

  it("clears error after successful fetch", async () => {
    mockGetBooks.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const fetchButton = screen.getByRole("button", { name: /fetch books/i });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });

    // Reset mock to successful response
    mockGetBooks.mockResolvedValueOnce({
      data: {
        data: [],
        pagination: { current_page: 1, total: 0, last_page: 1 },
      },
    });

    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText("Error: none")).toBeInTheDocument();
    });
  });

  it("handles fetch error and displays error message", async () => {
    mockGetBooks.mockRejectedValue(new Error("API Error"));

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const fetchButton = screen.getByRole("button", { name: /fetch books/i });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      const errorElement = screen.getByText(/error:/i);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it("handles search with empty query", async () => {
    const TestComponentWithSearch = () => {
      const { searchBooks } = useContext(BooksContext);

      const handleSearch = async () => {
        await searchBooks("", 1);
      };

      return <button onClick={handleSearch}>Search Empty</button>;
    };

    render(
      <BooksProvider>
        <TestComponentWithSearch />
      </BooksProvider>,
    );

    const searchButton = screen.getByRole("button", { name: /search empty/i });
    await userEvent.click(searchButton);

    // Empty query falls back to fetchBooks, not searchBooks
    await waitFor(() => {
      expect(mockGetBooks).toHaveBeenCalled();
      expect(mockSearch).not.toHaveBeenCalled();
    });
  });

  it("handles filter with empty filters object", async () => {
    const TestComponentWithEmpty = () => {
      const { filterBooks } = useContext(BooksContext);

      const handleFilter = async () => {
        await filterBooks({}, 1);
      };

      return <button onClick={handleFilter}>Filter Empty</button>;
    };

    mockFilter.mockResolvedValue({
      data: {
        data: [],
        pagination: { current_page: 1, total: 0, last_page: 1 },
      },
    });

    render(
      <BooksProvider>
        <TestComponentWithEmpty />
      </BooksProvider>,
    );

    const filterButton = screen.getByRole("button", { name: /filter empty/i });
    await userEvent.click(filterButton);

    await waitFor(() => {
      expect(mockFilter).toHaveBeenCalledWith({ page: 1 });
    });
  });

  it("provides correct context to child components", () => {
    const ContextConsumer = () => {
      const context = useContext(BooksContext);

      const hasRequiredMethods =
        context &&
        typeof context.fetchBooks === "function" &&
        typeof context.searchBooks === "function" &&
        typeof context.filterBooks === "function" &&
        Array.isArray(context.books) &&
        typeof context.loading === "boolean" &&
        context.pagination !== undefined;

      return (
        <div>{hasRequiredMethods ? "Valid Context" : "Invalid Context"}</div>
      );
    };

    render(
      <BooksProvider>
        <ContextConsumer />
      </BooksProvider>,
    );

    expect(screen.getByText("Valid Context")).toBeInTheDocument();
  });

  it("maintains state across multiple operations", async () => {
    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>,
    );

    const fetchButton = screen.getByRole("button", { name: /fetch books/i });

    // First fetch
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText("Book Count: 2")).toBeInTheDocument();
    });

    // Reset mock to return different data
    mockGetBooks.mockResolvedValueOnce({
      data: {
        data: [{ id: 3, title: "New Book", genre: {}, author: {} }],
        total: 3,
        per_page: 12,
        current_page: 2,
        last_page: 2,
      },
    });

    // Second fetch
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText("Current Page: 2")).toBeInTheDocument();
    });
  });
});
