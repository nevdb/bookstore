import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteGenreModal from "./DeleteGenreModal";

vi.mock("../../services/genreService", () => ({
  genreService: { deleteGenre: vi.fn() },
}));

import { genreService } from "../../services/genreService";

const mockGenre = { id: 5, name: "Fiction" };

const defaultProps = {
  genre: mockGenre,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("DeleteGenreModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    render(<DeleteGenreModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /delete genre/i }),
    ).toBeInTheDocument();
  });

  it("renders the genre name in the confirmation text", () => {
    render(<DeleteGenreModal {...defaultProps} />);
    expect(screen.getByText(/fiction/i)).toBeInTheDocument();
  });

  it("renders Yes, Delete and Cancel buttons", () => {
    render(<DeleteGenreModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /yes, delete/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<DeleteGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call deleteGenre when Cancel is clicked", async () => {
    render(<DeleteGenreModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(genreService.deleteGenre).not.toHaveBeenCalled();
  });

  // ── Successful delete ─────────────────────────────────────────────────────────

  it("calls deleteGenre with the genre id when confirmed", async () => {
    genreService.deleteGenre.mockResolvedValue({});
    render(<DeleteGenreModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(genreService.deleteGenre).toHaveBeenCalledWith(5),
    );
  });

  it("calls onSuccess with the genre id after deletion", async () => {
    const onSuccess = vi.fn();
    genreService.deleteGenre.mockResolvedValue({});
    render(<DeleteGenreModal {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(5));
  });

  it("disables buttons while deleting", async () => {
    genreService.deleteGenre.mockReturnValue(new Promise(() => {}));
    render(<DeleteGenreModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  // ── Failed delete ─────────────────────────────────────────────────────────────

  it("shows server error message when deleteGenre fails", async () => {
    genreService.deleteGenre.mockRejectedValue({
      response: { data: { message: "Genre has associated books" } },
    });
    render(<DeleteGenreModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /genre has associated books/i,
      ),
    );
  });

  it("shows fallback error when response has no message", async () => {
    genreService.deleteGenre.mockRejectedValue(new Error("Network Error"));
    render(<DeleteGenreModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to delete genre/i,
      ),
    );
  });

  it("does not call onSuccess when deleteGenre fails", async () => {
    const onSuccess = vi.fn();
    genreService.deleteGenre.mockRejectedValue(new Error("Error"));
    render(<DeleteGenreModal {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
