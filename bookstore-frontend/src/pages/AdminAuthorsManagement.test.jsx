import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminAuthorsManagement from "./AdminAuthorsManagement";

// jsdom 29 does not implement scrollIntoView — stub it globally
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../services/authorService", () => ({
  authorService: { getAuthors: vi.fn() },
}));

// Stub modals so we can test the page in isolation
vi.mock("../components/AdminPanel/CreateAuthorModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="create-author-modal">
      <button onClick={onClose}>Close Create</button>
      <button onClick={() => onSuccess({ id: 99, name: "New Author" })}>
        Submit Create
      </button>
    </div>
  ),
}));
vi.mock("../components/AdminPanel/EditAuthorModal", () => ({
  default: ({ author, onClose, onSuccess }) => (
    <div data-testid="edit-author-modal">
      <span>Editing: {author.name}</span>
      <button onClick={onClose}>Close Edit</button>
      <button onClick={() => onSuccess({ ...author, name: "Updated" })}>
        Submit Edit
      </button>
    </div>
  ),
}));
vi.mock("../components/AdminPanel/DeleteAuthorModal", () => ({
  default: ({ author, onClose, onSuccess }) => (
    <div data-testid="delete-author-modal">
      <span>Deleting: {author.name}</span>
      <button onClick={onClose}>Cancel Delete</button>
      <button onClick={() => onSuccess(author.id)}>Confirm Delete</button>
    </div>
  ),
}));

import { authorService } from "../services/authorService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAuthors = [
  {
    id: 1,
    name: "George Orwell",
    place_of_birth: "India",
    date_of_birth: "1903-06-25",
    date_of_death: "1950-01-21",
    books_count: 5,
  },
  {
    id: 2,
    name: "J.K. Rowling",
    place_of_birth: "England",
    date_of_birth: "1965-07-31",
    date_of_death: null,
    books_count: 7,
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AdminAuthorsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorService.getAuthors.mockResolvedValue({ data: mockAuthors });
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  it("renders the page heading", async () => {
    render(<AdminAuthorsManagement />);
    expect(
      screen.getByRole("heading", { name: /authors management/i }),
    ).toBeInTheDocument();
  });

  it("renders the Add New Author button", async () => {
    render(<AdminAuthorsManagement />);
    expect(
      screen.getByRole("button", { name: /add new author/i }),
    ).toBeInTheDocument();
  });

  // ── Loading & data ────────────────────────────────────────────────────────────

  it("shows loading state while fetching", () => {
    authorService.getAuthors.mockReturnValue(new Promise(() => {}));
    render(<AdminAuthorsManagement />);
    expect(screen.getByText(/loading authors/i)).toBeInTheDocument();
  });

  it("renders the authors table after loading", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    expect(screen.getByText("J.K. Rowling")).toBeInTheDocument();
  });

  it("shows author place of birth in the table", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    expect(screen.getByText("India")).toBeInTheDocument();
    expect(screen.getByText("England")).toBeInTheDocument();
  });

  it("shows '—' for null date_of_death", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("J.K. Rowling")).toBeInTheDocument(),
    );
    // J.K. Rowling has no death date — there should be at least one "—"
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows empty state when no authors exist", async () => {
    authorService.getAuthors.mockResolvedValue({ data: [] });
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText(/no authors found/i)).toBeInTheDocument(),
    );
  });

  it("shows error message when fetch fails", async () => {
    authorService.getAuthors.mockRejectedValue(new Error("Network Error"));
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText(/failed to load authors/i)).toBeInTheDocument(),
    );
  });

  // ── Create modal ──────────────────────────────────────────────────────────────

  it("does not show create modal initially", async () => {
    render(<AdminAuthorsManagement />);
    expect(screen.queryByTestId("create-author-modal")).not.toBeInTheDocument();
  });

  it("opens create modal when Add New Author is clicked", async () => {
    render(<AdminAuthorsManagement />);
    await userEvent.click(
      screen.getByRole("button", { name: /add new author/i }),
    );
    expect(screen.getByTestId("create-author-modal")).toBeInTheDocument();
  });

  it("closes create modal when onClose is called", async () => {
    render(<AdminAuthorsManagement />);
    await userEvent.click(
      screen.getByRole("button", { name: /add new author/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /close create/i }),
    );
    expect(screen.queryByTestId("create-author-modal")).not.toBeInTheDocument();
  });

  it("closes create modal and refreshes list on success", async () => {
    render(<AdminAuthorsManagement />);
    await userEvent.click(
      screen.getByRole("button", { name: /add new author/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /submit create/i }),
    );
    expect(screen.queryByTestId("create-author-modal")).not.toBeInTheDocument();
    // refresh triggered — getAuthors called again
    await waitFor(() =>
      expect(authorService.getAuthors).toHaveBeenCalledTimes(2),
    );
  });

  // ── Edit modal ────────────────────────────────────────────────────────────────

  it("does not show edit modal initially", async () => {
    render(<AdminAuthorsManagement />);
    expect(screen.queryByTestId("edit-author-modal")).not.toBeInTheDocument();
  });

  it("opens edit modal with the correct author when Edit is clicked", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    const editBtns = screen.getAllByRole("button", { name: /^edit$/i });
    await userEvent.click(editBtns[0]);
    await waitFor(() =>
      expect(screen.getByTestId("edit-author-modal")).toBeInTheDocument(),
    );
    expect(screen.getByText(/editing: george orwell/i)).toBeInTheDocument();
  });

  it("closes edit modal when onClose is called", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^edit$/i })[0],
    );
    await waitFor(() =>
      expect(screen.getByTestId("edit-author-modal")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /close edit/i }));
    expect(screen.queryByTestId("edit-author-modal")).not.toBeInTheDocument();
  });

  it("closes edit modal and refreshes on success", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^edit$/i })[0],
    );
    await waitFor(() =>
      expect(screen.getByTestId("edit-author-modal")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /submit edit/i }));
    expect(screen.queryByTestId("edit-author-modal")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(authorService.getAuthors).toHaveBeenCalledTimes(2),
    );
  });

  // ── Delete modal ──────────────────────────────────────────────────────────────

  it("does not show delete modal initially", async () => {
    render(<AdminAuthorsManagement />);
    expect(screen.queryByTestId("delete-author-modal")).not.toBeInTheDocument();
  });

  it("opens delete modal with the correct author when Delete is clicked", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i });
    await userEvent.click(deleteBtns[0]);
    expect(screen.getByTestId("delete-author-modal")).toBeInTheDocument();
    expect(screen.getByText(/deleting: george orwell/i)).toBeInTheDocument();
  });

  it("closes delete modal when Cancel is clicked", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^delete$/i })[0],
    );
    await userEvent.click(
      screen.getByRole("button", { name: /cancel delete/i }),
    );
    expect(screen.queryByTestId("delete-author-modal")).not.toBeInTheDocument();
  });

  it("closes delete modal and refreshes on successful delete", async () => {
    render(<AdminAuthorsManagement />);
    await waitFor(() =>
      expect(screen.getByText("George Orwell")).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /^delete$/i })[0],
    );
    await userEvent.click(
      screen.getByRole("button", { name: /confirm delete/i }),
    );
    expect(screen.queryByTestId("delete-author-modal")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(authorService.getAuthors).toHaveBeenCalledTimes(2),
    );
  });
});
