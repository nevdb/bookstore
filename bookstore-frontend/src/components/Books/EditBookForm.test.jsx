import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditBookForm from "./EditBookForm";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../services/booksService", () => ({
  booksService: { updateBook: vi.fn() },
}));

vi.mock("../../services/authorService", () => ({
  authorService: { getAuthors: vi.fn() },
}));

vi.mock("../../services/genreService", () => ({
  genreService: { getGenres: vi.fn() },
}));

vi.mock("../AdminPanel/CreateAuthorModal", () => ({
  default: ({ onClose }) => (
    <div data-testid="create-author-modal">
      <button onClick={onClose}>Close Author</button>
    </div>
  ),
}));

vi.mock("../AdminPanel/CreateGenreModal", () => ({
  default: ({ onClose }) => (
    <div data-testid="create-genre-modal">
      <button onClick={onClose}>Close Genre</button>
    </div>
  ),
}));

import { booksService } from "../../services/booksService";
import { authorService } from "../../services/authorService";
import { genreService } from "../../services/genreService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAuthors = [
  { id: 1, name: "George Orwell" },
  { id: 2, name: "J.K. Rowling" },
];

const mockGenres = [
  { id: 1, name: "Fiction" },
  { id: 2, name: "Fantasy" },
];

const mockBook = {
  id: 7,
  title: "1984",
  isbn: "978-0451524935",
  publication_year: 1949,
  description: "A dystopian novel.",
  pages: 328,
  genre_id: 1,
  author_id: 1,
};

const defaultProps = {
  book: mockBook,
  onSuccess: vi.fn(),
  onCancel: vi.fn(),
};

describe("EditBookForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorService.getAuthors.mockResolvedValue({ data: { data: mockAuthors } });
    genreService.getGenres.mockResolvedValue({ data: { data: mockGenres } });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Edit Book heading", () => {
    render(<EditBookForm {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /edit book/i }),
    ).toBeInTheDocument();
  });

  it("pre-fills form fields with the book data", () => {
    render(<EditBookForm {...defaultProps} />);
    expect(screen.getByLabelText(/^title/i)).toHaveValue("1984");
    expect(screen.getByLabelText(/isbn/i)).toHaveValue("978-0451524935");
    expect(screen.getByDisplayValue("1949")).toBeInTheDocument();
    expect(screen.getByLabelText(/page count/i)).toHaveValue(328);
  });

  it("renders Cancel and Update Book buttons", () => {
    render(<EditBookForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update book/i }),
    ).toBeInTheDocument();
  });

  // ── Data loading ───────────────────────────────────────────────────────────

  it("loads authors and genres on mount", async () => {
    render(<EditBookForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "George Orwell" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("option", { name: "Fiction" })).toBeInTheDocument();
  });

  // ── Cancel ─────────────────────────────────────────────────────────────────

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(<EditBookForm {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it("shows error when title is cleared and form is submitted", async () => {
    render(<EditBookForm {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText(/^title/i));
    fireEvent.submit(
      screen.getByRole("button", { name: /update book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/title is required/i),
    );
  });

  // ── Successful submit ──────────────────────────────────────────────────────

  it("calls updateBook with correct id and data on valid submit", async () => {
    booksService.updateBook.mockResolvedValue({
      data: { ...mockBook, title: "1984" },
    });
    render(<EditBookForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    fireEvent.submit(
      screen.getByRole("button", { name: /update book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(booksService.updateBook).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ title: "1984" }),
      ),
    );
  });

  it("calls onSuccess after successful update", async () => {
    const onSuccess = vi.fn();
    booksService.updateBook.mockResolvedValue({
      data: { ...mockBook },
    });
    render(<EditBookForm {...defaultProps} onSuccess={onSuccess} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    fireEvent.submit(
      screen.getByRole("button", { name: /update book/i }).closest("form"),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("shows error when updateBook fails", async () => {
    booksService.updateBook.mockRejectedValue({
      response: { data: { message: "Title already exists" } },
    });
    render(<EditBookForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    fireEvent.submit(
      screen.getByRole("button", { name: /update book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /title already exists/i,
      ),
    );
  });

  // ── Nested modals ──────────────────────────────────────────────────────────

  it("opens CreateAuthorModal when '+ New Author' is clicked", async () => {
    render(<EditBookForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /\+ new author/i }),
    );
    expect(screen.getByTestId("create-author-modal")).toBeInTheDocument();
  });

  it("opens CreateGenreModal when '+ New Genre' is clicked", async () => {
    render(<EditBookForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /\+ new genre/i }),
    );
    expect(screen.getByTestId("create-genre-modal")).toBeInTheDocument();
  });
});
