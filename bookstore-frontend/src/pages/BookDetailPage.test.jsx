import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BookDetailPage from "./BookDetailPage";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../services/booksService", () => ({
  booksService: { getBook: vi.fn() },
}));

vi.mock("../services/collectionService", () => ({
  default: { addBook: vi.fn() },
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

import { useAuth } from "../context/AuthContext";
import { booksService } from "../services/booksService";
import collectionService from "../services/collectionService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockBook = {
  id: 1,
  title: "1984",
  isbn: "978-0451524935",
  publication_year: 1949,
  pages: 328,
  description: "A dystopian novel.",
  author: {
    name: "George Orwell",
    biography: "English novelist.",
    place_of_birth: "India",
    date_of_birth: "1903-06-25",
    date_of_death: "1950-01-21",
  },
  genre: { name: "Fiction" },
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <BookDetailPage />
    </MemoryRouter>,
  );

describe("BookDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, name: "Alice" } });
    booksService.getBook.mockResolvedValue({ data: mockBook });
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching", () => {
    booksService.getBook.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/loading book details/i)).toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it("shows error message when fetch fails", async () => {
    booksService.getBook.mockRejectedValue({
      response: { data: { message: "Book not found" } },
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Book not found")).toBeInTheDocument(),
    );
  });

  it("shows Return to Books button on error", async () => {
    booksService.getBook.mockRejectedValue(new Error("fail"));
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /return to books/i }),
      ).toBeInTheDocument(),
    );
  });

  // ── Book details ───────────────────────────────────────────────────────────

  it("renders the book title", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "1984" })).toBeInTheDocument(),
    );
  });

  it("renders author, genre, publication year, ISBN and page count", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("George Orwell").length).toBeGreaterThan(0),
    );
    expect(screen.getByText("Fiction")).toBeInTheDocument();
    expect(screen.getByText("1949")).toBeInTheDocument();
    expect(screen.getByText("978-0451524935")).toBeInTheDocument();
    expect(screen.getByText("328")).toBeInTheDocument();
  });

  it("renders the book description", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("A dystopian novel.")).toBeInTheDocument(),
    );
  });

  it("renders the author biography section", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /about the author/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("English novelist.")).toBeInTheDocument();
    expect(screen.getByText(/india/i)).toBeInTheDocument();
  });

  // ── Add to collection ──────────────────────────────────────────────────────

  it("shows Add to Collection button for logged-in user", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("+ Add to Collection")).toBeInTheDocument(),
    );
  });

  it("shows success message after adding to collection", async () => {
    collectionService.addBook.mockResolvedValue({});
    renderPage();
    const btn = await screen.findByText("+ Add to Collection");
    await userEvent.click(btn);
    await waitFor(() =>
      expect(screen.getByText(/added to your collection/i)).toBeInTheDocument(),
    );
  });

  it("shows already-in-collection message on 409 response", async () => {
    collectionService.addBook.mockRejectedValue({
      response: { status: 409, data: { message: "Duplicate" } },
    });
    renderPage();
    const btn = await screen.findByText("+ Add to Collection");
    await userEvent.click(btn);
    await waitFor(() =>
      expect(
        screen.getByText(/already in your collection/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error message when add to collection fails with non-409 error", async () => {
    collectionService.addBook.mockRejectedValue({
      response: { status: 500, data: { message: "Server error" } },
    });
    renderPage();
    const btn = await screen.findByText("+ Add to Collection");
    await userEvent.click(btn);
    await waitFor(() =>
      expect(screen.getByText("Server error")).toBeInTheDocument(),
    );
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("Back button navigates to /books", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "1984" })).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /back to library/i }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/books");
  });
});
