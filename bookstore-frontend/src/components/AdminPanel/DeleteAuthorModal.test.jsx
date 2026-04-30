import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteAuthorModal from "./DeleteAuthorModal";

vi.mock("../../services/authorService", () => ({
  authorService: { deleteAuthor: vi.fn() },
}));

import { authorService } from "../../services/authorService";

const mockAuthor = { id: 3, name: "George Orwell" };

const defaultProps = {
  author: mockAuthor,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("DeleteAuthorModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    render(<DeleteAuthorModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /delete author/i }),
    ).toBeInTheDocument();
  });

  it("renders the author name in the confirmation text", () => {
    render(<DeleteAuthorModal {...defaultProps} />);
    expect(screen.getByText(/george orwell/i)).toBeInTheDocument();
  });

  it("renders Yes, Delete and Cancel buttons", () => {
    render(<DeleteAuthorModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /yes, delete/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<DeleteAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the × button is clicked", async () => {
    const onClose = vi.fn();
    render(<DeleteAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /close dialog/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<DeleteAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call deleteAuthor when Cancel is clicked", async () => {
    render(<DeleteAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(authorService.deleteAuthor).not.toHaveBeenCalled();
  });

  // ── Successful delete ─────────────────────────────────────────────────────────

  it("calls deleteAuthor with the author id when confirmed", async () => {
    authorService.deleteAuthor.mockResolvedValue({});
    render(<DeleteAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(authorService.deleteAuthor).toHaveBeenCalledWith(3),
    );
  });

  it("calls onSuccess with the author id after deletion", async () => {
    const onSuccess = vi.fn();
    authorService.deleteAuthor.mockResolvedValue({});
    render(<DeleteAuthorModal {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(3));
  });

  it("disables buttons while deleting", async () => {
    authorService.deleteAuthor.mockReturnValue(new Promise(() => {}));
    render(<DeleteAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  // ── Failed delete ─────────────────────────────────────────────────────────────

  it("shows server error message when deleteAuthor fails", async () => {
    authorService.deleteAuthor.mockRejectedValue({
      response: { data: { message: "Author has associated books" } },
    });
    render(<DeleteAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /author has associated books/i,
      ),
    );
  });

  it("shows fallback error when response has no message", async () => {
    authorService.deleteAuthor.mockRejectedValue(new Error("Network Error"));
    render(<DeleteAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to delete author/i,
      ),
    );
  });

  it("does not call onSuccess when deleteAuthor fails", async () => {
    const onSuccess = vi.fn();
    authorService.deleteAuthor.mockRejectedValue(new Error("Error"));
    render(<DeleteAuthorModal {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
