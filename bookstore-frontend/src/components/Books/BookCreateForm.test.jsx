import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookCreateForm from "./BookCreateForm";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../services/booksService", () => ({
  booksService: { createBook: vi.fn() },
}));

vi.mock("../../services/authorService", () => ({
  authorService: { getAuthors: vi.fn() },
}));

vi.mock("../../services/genreService", () => ({
  genreService: { getGenres: vi.fn() },
}));

// Stub nested modals so they don't interfere
vi.mock("../AdminPanel/CreateAuthorModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="create-author-modal">
      <button onClick={() => onSuccess({ id: 99, name: "New Author" })}>
        Submit Author
      </button>
      <button onClick={onClose}>Close Author</button>
    </div>
  ),
}));

vi.mock("../AdminPanel/CreateGenreModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="create-genre-modal">
      <button onClick={() => onSuccess({ id: 88, name: "New Genre" })}>
        Submit Genre
      </button>
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

const defaultProps = { onSuccess: vi.fn(), onCancel: vi.fn() };

describe("BookCreateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorService.getAuthors.mockResolvedValue({ data: { data: mockAuthors } });
    genreService.getGenres.mockResolvedValue({ data: { data: mockGenres } });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Create New Book heading", () => {
    render(<BookCreateForm {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /create new book/i }),
    ).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<BookCreateForm {...defaultProps} />);
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/isbn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publication year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/page count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("renders Cancel and Create Book buttons", () => {
    render(<BookCreateForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create book/i }),
    ).toBeInTheDocument();
  });

  // ── Data loading ───────────────────────────────────────────────────────────

  it("loads and displays authors in the select after mount", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "George Orwell" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("option", { name: "J.K. Rowling" }),
    ).toBeInTheDocument();
  });

  it("loads and displays genres in the select after mount", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("option", { name: "Fantasy" })).toBeInTheDocument();
  });

  // ── Cancel ─────────────────────────────────────────────────────────────────

  it("calls onCancel when Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<BookCreateForm {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it("shows error when title is empty on submit", async () => {
    render(<BookCreateForm {...defaultProps} />);
    fireEvent.submit(
      screen.getByRole("button", { name: /create book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/title is required/i),
    );
  });

  it("shows error when publication year is missing", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await userEvent.type(screen.getByLabelText(/^title/i), "My Book");
    fireEvent.submit(
      screen.getByRole("button", { name: /create book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /publication year is required/i,
      ),
    );
  });

  it("shows error when no genre is selected", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await userEvent.type(screen.getByLabelText(/^title/i), "My Book");
    await userEvent.type(screen.getByLabelText(/publication year/i), "2024");
    fireEvent.submit(
      screen.getByRole("button", { name: /create book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /please select a genre/i,
      ),
    );
  });

  it("shows error when no author is selected", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    await userEvent.type(screen.getByLabelText(/^title/i), "My Book");
    await userEvent.type(screen.getByLabelText(/publication year/i), "2024");
    await userEvent.selectOptions(screen.getByLabelText(/genre/i), "1");
    fireEvent.submit(
      screen.getByRole("button", { name: /create book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /please select an author/i,
      ),
    );
  });

  // ── Successful submit ──────────────────────────────────────────────────────

  it("calls createBook and onSuccess on valid submit", async () => {
    booksService.createBook.mockResolvedValue({
      data: { id: 10, title: "My Book" },
    });
    const onSuccess = vi.fn();
    render(<BookCreateForm {...defaultProps} onSuccess={onSuccess} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    await userEvent.type(screen.getByLabelText(/^title/i), "My Book");
    await userEvent.type(screen.getByLabelText(/publication year/i), "2024");
    await userEvent.selectOptions(screen.getByLabelText(/genre/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/author/i), "1");
    fireEvent.submit(
      screen.getByRole("button", { name: /create book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(booksService.createBook).toHaveBeenCalledWith(
        expect.objectContaining({ title: "My Book", publication_year: 2024 }),
      ),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows error when createBook fails", async () => {
    booksService.createBook.mockRejectedValue({
      response: { data: { message: "ISBN already taken" } },
    });
    render(<BookCreateForm {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Fiction" }),
      ).toBeInTheDocument(),
    );
    await userEvent.type(screen.getByLabelText(/^title/i), "My Book");
    await userEvent.type(screen.getByLabelText(/publication year/i), "2024");
    await userEvent.selectOptions(screen.getByLabelText(/genre/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/author/i), "1");
    fireEvent.submit(
      screen.getByRole("button", { name: /create book/i }).closest("form"),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /isbn already taken/i,
      ),
    );
  });

  // ── Nested modals ──────────────────────────────────────────────────────────

  it("opens CreateAuthorModal when '+ New Author' is clicked", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /\+ new author/i }),
    );
    expect(screen.getByTestId("create-author-modal")).toBeInTheDocument();
  });

  it("opens CreateGenreModal when '+ New Genre' is clicked", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /\+ new genre/i }),
    );
    expect(screen.getByTestId("create-genre-modal")).toBeInTheDocument();
  });

  it("adds new author to select and selects it after author modal success", async () => {
    render(<BookCreateForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /\+ new author/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /submit author/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "New Author" }),
      ).toBeInTheDocument(),
    );
  });
});
