import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditAuthorModal from "./EditAuthorModal";

vi.mock("../../services/authorService", () => ({
  authorService: { updateAuthor: vi.fn() },
}));

import { authorService } from "../../services/authorService";

const mockAuthor = {
  id: 1,
  name: "George Orwell",
  date_of_birth: "1903-06-25",
  date_of_death: "1950-01-21",
  place_of_birth: "India",
  biography: "English novelist.",
};

const defaultProps = {
  author: mockAuthor,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("EditAuthorModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    render(<EditAuthorModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /edit author/i }),
    ).toBeInTheDocument();
  });

  it("pre-fills the name field with the author's name", () => {
    render(<EditAuthorModal {...defaultProps} />);
    expect(screen.getByLabelText(/^name/i)).toHaveValue("George Orwell");
  });

  it("pre-fills the place of birth field", () => {
    render(<EditAuthorModal {...defaultProps} />);
    expect(screen.getByLabelText(/place of birth/i)).toHaveValue("India");
  });

  it("pre-fills the biography field", () => {
    render(<EditAuthorModal {...defaultProps} />);
    expect(screen.getByLabelText(/biography/i)).toHaveValue(
      "English novelist.",
    );
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────

  it("calls onClose when the × button is clicked", async () => {
    const onClose = vi.fn();
    render(<EditAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /close dialog/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<EditAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  it("shows error when name is cleared and form is submitted", async () => {
    render(<EditAuthorModal {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /author name is required/i,
    );
  });

  it("shows error when place of birth is cleared and form is submitted", async () => {
    render(<EditAuthorModal {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText(/place of birth/i));
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /place of birth is required/i,
    );
  });

  it("does not call updateAuthor when validation fails", async () => {
    render(<EditAuthorModal {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));
    expect(authorService.updateAuthor).not.toHaveBeenCalled();
  });

  // ── Successful submit ─────────────────────────────────────────────────────────

  it("calls updateAuthor with author id and updated data", async () => {
    authorService.updateAuthor.mockResolvedValue({
      data: { ...mockAuthor, name: "Eric Blair" },
    });
    render(<EditAuthorModal {...defaultProps} />);

    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.type(screen.getByLabelText(/^name/i), "Eric Blair");
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));

    await waitFor(() =>
      expect(authorService.updateAuthor).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: "Eric Blair" }),
      ),
    );
  });

  it("calls onSuccess with updated author data", async () => {
    const onSuccess = vi.fn();
    authorService.updateAuthor.mockResolvedValue({
      data: { ...mockAuthor, name: "Eric Blair" },
    });
    render(<EditAuthorModal {...defaultProps} onSuccess={onSuccess} />);

    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.type(screen.getByLabelText(/^name/i), "Eric Blair");
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Eric Blair" }),
      ),
    );
  });

  // ── Failed submit ─────────────────────────────────────────────────────────────

  it("shows server error message when updateAuthor fails", async () => {
    authorService.updateAuthor.mockRejectedValue({
      response: { data: { message: "Update not allowed" } },
    });
    render(<EditAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /update not allowed/i,
      ),
    );
  });

  it("shows fallback error when response has no message", async () => {
    authorService.updateAuthor.mockRejectedValue(new Error("Network Error"));
    render(<EditAuthorModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /save|update/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to update author/i,
      ),
    );
  });
});
