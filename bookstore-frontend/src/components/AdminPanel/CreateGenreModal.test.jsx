import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateGenreModal from "./CreateGenreModal";

vi.mock("../../services/genreService", () => ({
  genreService: { createGenre: vi.fn() },
}));

import { genreService } from "../../services/genreService";

const defaultProps = { onClose: vi.fn(), onSuccess: vi.fn() };

describe("CreateGenreModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    render(<CreateGenreModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /create new genre/i }),
    ).toBeInTheDocument();
  });

  it("renders name and description fields", () => {
    render(<CreateGenreModal {...defaultProps} />);
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("renders Cancel and Create Genre buttons", () => {
    render(<CreateGenreModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create genre/i }),
    ).toBeInTheDocument();
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────

  it("calls onClose when the × button is clicked", async () => {
    const onClose = vi.fn();
    render(<CreateGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /close dialog/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<CreateGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<CreateGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  it("shows validation error when name is empty on submit", async () => {
    const { container } = render(<CreateGenreModal {...defaultProps} />);
    fireEvent.submit(container.querySelector("form"));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /genre name is required/i,
      ),
    );
  });

  it("does not call createGenre when name is empty", async () => {
    render(<CreateGenreModal {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /create genre/i }),
    );
    expect(genreService.createGenre).not.toHaveBeenCalled();
  });

  // ── Successful submit ─────────────────────────────────────────────────────────

  it("calls createGenre with form data on valid submit", async () => {
    genreService.createGenre.mockResolvedValue({
      data: { id: 1, name: "Science Fiction" },
    });
    render(<CreateGenreModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Science Fiction");
    await userEvent.type(screen.getByLabelText(/description/i), "Sci-fi books");
    await userEvent.click(
      screen.getByRole("button", { name: /create genre/i }),
    );

    await waitFor(() =>
      expect(genreService.createGenre).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Science Fiction",
          description: "Sci-fi books",
        }),
      ),
    );
  });

  it("calls onSuccess with created genre data", async () => {
    const onSuccess = vi.fn();
    genreService.createGenre.mockResolvedValue({
      data: { id: 1, name: "Science Fiction" },
    });
    render(<CreateGenreModal {...defaultProps} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Science Fiction");
    await userEvent.click(
      screen.getByRole("button", { name: /create genre/i }),
    );

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Science Fiction" }),
      ),
    );
  });

  // ── Failed submit ─────────────────────────────────────────────────────────────

  it("shows server error when createGenre fails", async () => {
    genreService.createGenre.mockRejectedValue({
      response: { data: { message: "Genre already exists" } },
    });
    render(<CreateGenreModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Fiction");
    await userEvent.click(
      screen.getByRole("button", { name: /create genre/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /genre already exists/i,
      ),
    );
  });

  it("shows fallback error when response has no message", async () => {
    genreService.createGenre.mockRejectedValue(new Error("Network Error"));
    render(<CreateGenreModal {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Fiction");
    await userEvent.click(
      screen.getByRole("button", { name: /create genre/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to create genre/i,
      ),
    );
  });
});
