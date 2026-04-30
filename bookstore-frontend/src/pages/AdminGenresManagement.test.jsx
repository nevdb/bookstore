import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminGenresManagement from "./AdminGenresManagement";

// jsdom 29 does not implement scrollIntoView — stub it globally
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../services/genreService", () => ({
  genreService: { getGenres: vi.fn() },
}));

vi.mock("../components/AdminPanel/CreateGenreModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="create-genre-modal">
      <button onClick={onClose}>Close Create</button>
      <button onClick={() => onSuccess({ id: 99, name: "New Genre" })}>
        Submit Create
      </button>
    </div>
  ),
}));
vi.mock("../components/AdminPanel/EditGenreModal", () => ({
  default: ({ genre, onClose, onSuccess }) => (
    <div data-testid="edit-genre-modal">
      <span>Editing: {genre.name}</span>
      <button onClick={onClose}>Close Edit</button>
      <button onClick={() => onSuccess({ ...genre, name: "Updated" })}>
        Submit Edit
      </button>
    </div>
  ),
}));
vi.mock("../components/AdminPanel/DeleteGenreModal", () => ({
  default: ({ genre, onClose, onSuccess }) => (
    <div data-testid="delete-genre-modal">
      <span>Deleting: {genre.name}</span>
      <button onClick={onClose}>Cancel Delete</button>
      <button onClick={() => onSuccess(genre.id)}>Confirm Delete</button>
    </div>
  ),
}));

import { genreService } from "../services/genreService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockGenres = [
  { id: 1, name: "Fiction", description: "Fictional works", books_count: 12 },
  { id: 2, name: "History", description: null, books_count: 5 },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AdminGenresManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    genreService.getGenres.mockResolvedValue({ data: mockGenres });
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the page heading", async () => {
    render(<AdminGenresManagement />);
    expect(
      screen.getByRole("heading", { name: /genres management/i }),
    ).toBeInTheDocument();
  });

  it("renders the Add New Genre button", () => {
    render(<AdminGenresManagement />);
    expect(
      screen.getByRole("button", { name: /add new genre/i }),
    ).toBeInTheDocument();
  });

  // ── Loading & data ────────────────────────────────────────────────────────────

  it("shows loading state while fetching", () => {
    genreService.getGenres.mockReturnValue(new Promise(() => {}));
    render(<AdminGenresManagement />);
    expect(screen.getByText(/loading genres/i)).toBeInTheDocument();
  });

  it("renders genres in the table after loading", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("renders genre descriptions", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fictional works")).toBeInTheDocument(),
    );
  });

  it("shows '—' for null description", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("History")).toBeInTheDocument(),
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows error alert when fetch fails", async () => {
    genreService.getGenres.mockRejectedValue(new Error("Network Error"));
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to load genres/i,
      ),
    );
  });

  // ── Create modal ──────────────────────────────────────────────────────────────

  it("does not show create modal initially", () => {
    render(<AdminGenresManagement />);
    expect(screen.queryByTestId("create-genre-modal")).not.toBeInTheDocument();
  });

  it("opens create modal when Add New Genre is clicked", async () => {
    render(<AdminGenresManagement />);
    await userEvent.click(
      screen.getByRole("button", { name: /add new genre/i }),
    );
    expect(screen.getByTestId("create-genre-modal")).toBeInTheDocument();
  });

  it("closes create modal when onClose is called", async () => {
    render(<AdminGenresManagement />);
    await userEvent.click(
      screen.getByRole("button", { name: /add new genre/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /close create/i }),
    );
    expect(screen.queryByTestId("create-genre-modal")).not.toBeInTheDocument();
  });

  it("closes create modal and refreshes list on success", async () => {
    render(<AdminGenresManagement />);
    await userEvent.click(
      screen.getByRole("button", { name: /add new genre/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /submit create/i }),
    );
    expect(screen.queryByTestId("create-genre-modal")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(genreService.getGenres).toHaveBeenCalledTimes(2),
    );
  });

  // ── Edit modal ────────────────────────────────────────────────────────────────

  it("does not show edit modal initially", () => {
    render(<AdminGenresManagement />);
    expect(screen.queryByTestId("edit-genre-modal")).not.toBeInTheDocument();
  });

  it("opens edit modal with the correct genre when Edit is clicked", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    const editBtns = screen.getAllByRole("button", { name: /^edit$/i });
    await userEvent.click(editBtns[0]);
    await waitFor(() =>
      expect(screen.getByTestId("edit-genre-modal")).toBeInTheDocument(),
    );
    expect(screen.getByText(/editing: fiction/i)).toBeInTheDocument();
  });

  it("closes edit modal when onClose is called", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^edit$/i })[0],
    );
    await waitFor(() =>
      expect(screen.getByTestId("edit-genre-modal")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /close edit/i }));
    expect(screen.queryByTestId("edit-genre-modal")).not.toBeInTheDocument();
  });

  it("closes edit modal and refreshes on success", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^edit$/i })[0],
    );
    await waitFor(() =>
      expect(screen.getByTestId("edit-genre-modal")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /submit edit/i }));
    expect(screen.queryByTestId("edit-genre-modal")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(genreService.getGenres).toHaveBeenCalledTimes(2),
    );
  });

  // ── Delete modal ──────────────────────────────────────────────────────────────

  it("does not show delete modal initially", () => {
    render(<AdminGenresManagement />);
    expect(screen.queryByTestId("delete-genre-modal")).not.toBeInTheDocument();
  });

  it("opens delete modal with the correct genre when Delete is clicked", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i });
    await userEvent.click(deleteBtns[0]);
    expect(screen.getByTestId("delete-genre-modal")).toBeInTheDocument();
    expect(screen.getByText(/deleting: fiction/i)).toBeInTheDocument();
  });

  it("closes delete modal when Cancel is clicked", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^delete$/i })[0],
    );
    await userEvent.click(
      screen.getByRole("button", { name: /cancel delete/i }),
    );
    expect(screen.queryByTestId("delete-genre-modal")).not.toBeInTheDocument();
  });

  it("closes delete modal and refreshes on successful delete", async () => {
    render(<AdminGenresManagement />);
    await waitFor(() =>
      expect(screen.getByText("Fiction")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^delete$/i })[0],
    );
    await userEvent.click(
      screen.getByRole("button", { name: /confirm delete/i }),
    );
    expect(screen.queryByTestId("delete-genre-modal")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(genreService.getGenres).toHaveBeenCalledTimes(2),
    );
  });
});
