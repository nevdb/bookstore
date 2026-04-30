import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditGenreModal from "./EditGenreModal";

vi.mock("../../services/genreService", () => ({
  genreService: { updateGenre: vi.fn() },
}));

import { genreService } from "../../services/genreService";

const mockGenre = { id: 2, name: "Fiction", description: "Fictional works" };

const defaultProps = {
  genre: mockGenre,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("EditGenreModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    render(<EditGenreModal {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /edit genre/i }),
    ).toBeInTheDocument();
  });

  it("pre-fills the name field with the genre name", () => {
    render(<EditGenreModal {...defaultProps} />);
    expect(screen.getByLabelText(/^name/i)).toHaveValue("Fiction");
  });

  it("pre-fills the description field", () => {
    render(<EditGenreModal {...defaultProps} />);
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      "Fictional works",
    );
  });

  it("renders Save Changes and Cancel buttons", () => {
    render(<EditGenreModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  // ── Close behaviour ───────────────────────────────────────────────────────────

  it("calls onClose when the × button is clicked", async () => {
    const onClose = vi.fn();
    render(<EditGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /close dialog/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<EditGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<EditGenreModal {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  it("shows validation error when name is cleared and form is submitted", async () => {
    render(<EditGenreModal {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /genre name is required/i,
    );
  });

  it("does not call updateGenre when validation fails", async () => {
    render(<EditGenreModal {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );
    expect(genreService.updateGenre).not.toHaveBeenCalled();
  });

  // ── Successful submit ─────────────────────────────────────────────────────────

  it("calls updateGenre with genre id and updated data", async () => {
    genreService.updateGenre.mockResolvedValue({
      data: { ...mockGenre, name: "Sci-Fi" },
    });
    render(<EditGenreModal {...defaultProps} />);

    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.type(screen.getByLabelText(/^name/i), "Sci-Fi");
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    await waitFor(() =>
      expect(genreService.updateGenre).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ name: "Sci-Fi" }),
      ),
    );
  });

  it("calls onSuccess with updated genre data", async () => {
    const onSuccess = vi.fn();
    genreService.updateGenre.mockResolvedValue({
      data: { ...mockGenre, name: "Sci-Fi" },
    });
    render(<EditGenreModal {...defaultProps} onSuccess={onSuccess} />);

    await userEvent.clear(screen.getByLabelText(/^name/i));
    await userEvent.type(screen.getByLabelText(/^name/i), "Sci-Fi");
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Sci-Fi" }),
      ),
    );
  });

  // ── Failed submit ─────────────────────────────────────────────────────────────

  it("shows server error message when updateGenre fails", async () => {
    genreService.updateGenre.mockRejectedValue({
      response: { data: { message: "Name already taken" } },
    });
    render(<EditGenreModal {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /name already taken/i,
      ),
    );
  });

  it("shows fallback error when response has no message", async () => {
    genreService.updateGenre.mockRejectedValue(new Error("Network Error"));
    render(<EditGenreModal {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to update genre/i,
      ),
    );
  });
});
