import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateAuthorModal from "./CreateAuthorModal";

vi.mock("../../services/authorService", () => ({
  authorService: { createAuthor: vi.fn() },
}));

import { authorService } from "../../services/authorService";

const defaultProps = { onClose: vi.fn(), onSuccess: vi.fn() };

describe("CreateAuthorModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    render(<CreateAuthorModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /create new author/i }),
    ).toBeInTheDocument();
  });

  it("renders name, place of birth, biography fields", () => {
    render(<CreateAuthorModal {...defaultProps} />);
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/biography/i)).toBeInTheDocument();
  });

  it("renders date of birth and date of death fields", () => {
    render(<CreateAuthorModal {...defaultProps} />);
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of death/i)).toBeInTheDocument();
  });

  it("renders Cancel and Create Author buttons", () => {
    render(<CreateAuthorModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create author/i }),
    ).toBeInTheDocument();
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────

  it("calls onClose when the × button is clicked", async () => {
    const onClose = vi.fn();
    render(<CreateAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /close dialog/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const onClose = vi.fn();
    render(<CreateAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<CreateAuthorModal {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  it("shows validation error when name is empty on submit", async () => {
    const { container } = render(<CreateAuthorModal {...defaultProps} />);
    fireEvent.submit(container.querySelector("form"));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /author name is required/i,
      ),
    );
  });

  it("does not call createAuthor when name is empty", async () => {
    render(<CreateAuthorModal {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /create author/i }),
    );
    expect(authorService.createAuthor).not.toHaveBeenCalled();
  });

  // ── Successful submit ─────────────────────────────────────────────────────────

  it("calls createAuthor with form data on valid submit", async () => {
    authorService.createAuthor.mockResolvedValue({
      data: { id: 1, name: "Leo Tolstoy" },
    });
    render(<CreateAuthorModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Leo Tolstoy");
    await userEvent.type(screen.getByLabelText(/place of birth/i), "Russia");
    await userEvent.click(
      screen.getByRole("button", { name: /create author/i }),
    );

    await waitFor(() =>
      expect(authorService.createAuthor).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Leo Tolstoy",
          place_of_birth: "Russia",
        }),
      ),
    );
  });

  it("calls onSuccess with created author data", async () => {
    const onSuccess = vi.fn();
    authorService.createAuthor.mockResolvedValue({
      data: { id: 1, name: "Leo Tolstoy" },
    });
    render(<CreateAuthorModal {...defaultProps} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Leo Tolstoy");
    await userEvent.click(
      screen.getByRole("button", { name: /create author/i }),
    );

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Leo Tolstoy" }),
      ),
    );
  });

  // ── Failed submit ─────────────────────────────────────────────────────────────

  it("shows server error message when createAuthor fails", async () => {
    authorService.createAuthor.mockRejectedValue({
      response: { data: { message: "Name already taken" } },
    });
    render(<CreateAuthorModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Duplicate");
    await userEvent.click(
      screen.getByRole("button", { name: /create author/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /name already taken/i,
      ),
    );
  });

  it("shows fallback error message when response has no message", async () => {
    authorService.createAuthor.mockRejectedValue(new Error("Network Error"));
    render(<CreateAuthorModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Someone");
    await userEvent.click(
      screen.getByRole("button", { name: /create author/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to create author/i,
      ),
    );
  });
});
