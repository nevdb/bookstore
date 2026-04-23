import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookFilter from "./BookFilter";
import { BooksProvider } from "../../context/BooksContext";
import * as booksService from "../../services/booksService";

vi.mock("../../services/booksService");

const mockGetBooks = vi.fn();
const mockFilterBooks = vi.fn();

const renderWithContext = (component) => {
  return render(<BooksProvider>{component}</BooksProvider>);
};

describe("BookFilter Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetBooks.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            title: "Book 1",
            genre: { id: 1, name: "Fiction" },
            author: { id: 1, name: "Author 1" },
          },
          {
            id: 2,
            title: "Book 2",
            genre: { id: 2, name: "Mystery" },
            author: { id: 2, name: "Author 2" },
          },
        ],
      },
    });

    booksService.booksService.getBooks = mockGetBooks;
    booksService.booksService.filterBooks = mockFilterBooks;
  });

  it("renders filter select dropdowns", async () => {
    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('displays "All Genres" option by default', async () => {
    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const options = screen.getAllByText(/all genres/i);
      expect(options.length).toBeGreaterThan(0);
    });
  });

  it('displays "All Authors" option by default', async () => {
    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const options = screen.getAllByText(/all authors/i);
      expect(options.length).toBeGreaterThan(0);
    });
  });

  it("loads and displays genres from API response", async () => {
    renderWithContext(<BookFilter />);

    await waitFor(() => {
      expect(screen.getByText("Fiction")).toBeInTheDocument();
      expect(screen.getByText("Mystery")).toBeInTheDocument();
    });
  });

  it("loads and displays authors from API response", async () => {
    renderWithContext(<BookFilter />);

    await waitFor(() => {
      expect(screen.getByText("Author 1")).toBeInTheDocument();
      expect(screen.getByText("Author 2")).toBeInTheDocument();
    });
  });

  it("calls filterBooks when genre is selected", async () => {
    const user = userEvent.setup();
    mockFilterBooks.mockResolvedValue({
      data: { data: [{ id: 1, title: "Book 1" }] },
    });

    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    const genreSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(genreSelect, "1");

    await waitFor(() => {
      expect(mockFilterBooks).toHaveBeenCalledWith({ genre_id: "1", page: 1 });
    });
  });

  it("calls filterBooks when author is selected", async () => {
    const user = userEvent.setup();
    mockFilterBooks.mockResolvedValue({
      data: { data: [{ id: 1, title: "Book 1" }] },
    });

    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    const authorSelect = screen.getAllByRole("combobox")[1];
    await user.selectOptions(authorSelect, "2");

    await waitFor(() => {
      expect(mockFilterBooks).toHaveBeenCalledWith({ author_id: "2", page: 1 });
    });
  });

  it("calls filterBooks with both filters when both are selected", async () => {
    const user = userEvent.setup();
    mockFilterBooks.mockResolvedValue({
      data: { data: [] },
    });

    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    const [genreSelect, authorSelect] = screen.getAllByRole("combobox");

    await user.selectOptions(genreSelect, "1");

    await waitFor(() => {
      expect(mockFilterBooks).toHaveBeenCalledWith({ genre_id: "1", page: 1 });
    });

    await user.selectOptions(authorSelect, "2");

    await waitFor(() => {
      expect(mockFilterBooks).toHaveBeenCalledWith({
        genre_id: "1",
        author_id: "2",
        page: 1,
      });
    });
  });

  it("shows clear filters button when filters are active", async () => {
    const user = userEvent.setup();
    mockFilterBooks.mockResolvedValue({
      data: { data: [] },
    });

    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    const genreSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(genreSelect, "1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /clear filters/i }),
      ).toBeInTheDocument();
    });
  });

  it("clears filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    mockFilterBooks.mockResolvedValue({
      data: { data: [] },
    });

    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    const genreSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(genreSelect, "1");

    await waitFor(() => {
      expect(mockFilterBooks).toHaveBeenCalledWith({ genre_id: "1", page: 1 });
    });

    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(mockFilterBooks).toHaveBeenCalledWith({ page: 1 });
    });
  });

  it("disables selects while loading filter options", async () => {
    vi.useFakeTimers();

    mockGetBooks.mockReturnValue(
      new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            data: {
              data: [
                {
                  id: 1,
                  genre: { id: 1, name: "Fiction" },
                  author: { id: 1, name: "Author 1" },
                },
              ],
            },
          });
        }, 100),
      ),
    );

    renderWithContext(<BookFilter />);

    const selects = screen.getAllByRole("combobox");
    expect(selects.some((s) => s.disabled)).toBe(true);

    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("handles API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetBooks.mockRejectedValue(new Error("API Error"));

    renderWithContext(<BookFilter />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("does not show clear button when no filters are selected", async () => {
    renderWithContext(<BookFilter />);

    await waitFor(() => {
      const clearButtons = screen.queryAllByRole("button", {
        name: /clear filters/i,
      });
      expect(clearButtons.length).toBe(0);
    });
  });
});
