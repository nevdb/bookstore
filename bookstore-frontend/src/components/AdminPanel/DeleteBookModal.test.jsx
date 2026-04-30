import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteBookModal from "./DeleteBookModal";

vi.mock("../../services/booksService", () => ({
  booksService: { deleteBook: vi.fn() },
}));

import { booksService } from "../../services/booksService";

const mockBook = {
  id: 5,
  title: "Dune",
  publication_year: 1965,
  author: { name: "Frank Herbert" },
  user_collections_count: 0,
};

const defaultProps = {
  book: mockBook,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("DeleteBookModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Delete Book heading", () => {
    render(<DeleteBookModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /delete book/i }),
    ).toBeInTheDocument();
  });

  it("renders the book title", () => {
    render(<DeleteBookModal {...defaultProps} />);
    expect(screen.getByText("Dune")).toBeInTheDocument();
  });

  it("renders the author name", () => {
    render(<DeleteBookModal {...defaultProps} />);
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
  });

  it("renders the publication year", () => {
    render(<DeleteBookModal {...defaultProps} />);
    expect(screen.getByText(/1965/)).toBeInTheDocument();
  });

  it("shows collection count warning when book is in user collections", () => {
    render(
      <DeleteBookModal
        {...defaultProps}
        book={{ ...mockBook, user_collections_count: 4 }}
      />,
    );
    expect(screen.getByText(/4/)).toBeInTheDocument();
    expect(screen.getByText(/user collection/i)).toBeInTheDocument();
  });

  it("does not show collection warning when count is 0", () => {
    render(<DeleteBookModal {...defaultProps} />);
    expect(screen.queryByText(/user collection\(s\)/i)).not.toBeInTheDocument();
  });

  // ── Close behaviour ────────────────────────────────────────────────────────

  it("calls onClose when the × button is clicked", async () => {
    const onClose = vi.fn();
    render(<DeleteBookModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /close dialog/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const onClose = vi.fn();
    render(<DeleteBookModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<DeleteBookModal {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  // ── Delete action ──────────────────────────────────────────────────────────

  it("calls booksService.deleteBook with the book id on confirm", async () => {
    booksService.deleteBook.mockResolvedValue({});
    render(<DeleteBookModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /delete book/i }));
    await waitFor(() =>
      expect(booksService.deleteBook).toHaveBeenCalledWith(5),
    );
  });

  it("calls onSuccess with the book id after successful delete", async () => {
    const onSuccess = vi.fn();
    booksService.deleteBook.mockResolvedValue({});
    render(<DeleteBookModal {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /delete book/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(5));
  });

  it("shows error message when delete fails", async () => {
    booksService.deleteBook.mockRejectedValue({
      response: { data: { message: "Cannot delete this book" } },
    });
    render(<DeleteBookModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /delete book/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /cannot delete this book/i,
      ),
    );
  });

  it("disables buttons while deleting", async () => {
    booksService.deleteBook.mockReturnValue(new Promise(() => {}));
    render(<DeleteBookModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /delete book/i }));
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });
});
