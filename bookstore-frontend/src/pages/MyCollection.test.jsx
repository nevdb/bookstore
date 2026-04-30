import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MyCollection from "./MyCollection";
import * as collectionService from "../services/collectionService";

vi.mock("../services/collectionService");

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", email: "test@example.com" },
  }),
}));

vi.mock("../components/CollectionItem", () => ({
  default: ({ userBook, onUpdate, onRemove }) => (
    <div data-testid={`collection-item-${userBook.id}`}>
      <h3>{userBook.book.title}</h3>
      <button
        data-testid={`edit-${userBook.id}`}
        onClick={() => onUpdate(userBook.id, {})}
      >
        Edit
      </button>
      <button
        data-testid={`remove-${userBook.id}`}
        onClick={() => onRemove(userBook.id)}
      >
        Remove
      </button>
    </div>
  ),
}));

describe("MyCollection", () => {
  const mockUserBooks = [
    {
      id: 1,
      book: {
        id: 1,
        title: "Book 1",
        author: { name: "Author 1" },
        genre: { name: "Fiction" },
      },
      personal_rating: 5,
      status: "completed",
      notes: "Great book",
    },
    {
      id: 2,
      book: {
        id: 2,
        title: "Book 2",
        author: { name: "Author 2" },
        genre: { name: "Mystery" },
      },
      personal_rating: 4,
      status: "reading",
      notes: "Still reading",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders collection page title", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 12,
    });

    render(<MyCollection />);

    await waitFor(() => {
      expect(screen.getByText("My Book Collection")).toBeInTheDocument();
    });
  });

  it("loads and displays user collection", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: mockUserBooks,
      current_page: 1,
      last_page: 1,
      total: 2,
      per_page: 12,
    });

    render(<MyCollection />);

    await waitFor(() => {
      expect(screen.getByText("2 books in collection")).toBeInTheDocument();
      expect(screen.getByTestId("collection-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("collection-item-2")).toBeInTheDocument();
    });
  });

  it("displays empty message when collection is empty", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 12,
    });

    render(<MyCollection />);

    await waitFor(() => {
      expect(
        screen.getByText("Your collection is empty. Start adding books!"),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    collectionService.default.getCollection.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: [],
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: 12,
              }),
            100,
          ),
        ),
    );

    render(<MyCollection />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("calls removeBook when remove button clicked", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: mockUserBooks,
      current_page: 1,
      last_page: 1,
      total: 2,
      per_page: 12,
    });
    collectionService.default.removeBook.mockResolvedValue({});

    render(<MyCollection />);

    // Click the remove button on the first collection item
    await waitFor(() => {
      fireEvent.click(screen.getByTestId("remove-1"));
    });

    // Component shows a confirm bar — click "Yes, remove" to proceed
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /yes, remove/i }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /yes, remove/i }));

    await waitFor(() => {
      expect(collectionService.default.removeBook).toHaveBeenCalledWith(1);
    });
  });

  it("calls updateBook when update button clicked", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: mockUserBooks,
      current_page: 1,
      last_page: 1,
      total: 2,
      per_page: 12,
    });
    collectionService.default.updateBook.mockResolvedValue({});

    render(<MyCollection />);

    await waitFor(() => {
      fireEvent.click(screen.getByTestId("edit-1"));
    });

    await waitFor(() => {
      expect(collectionService.default.updateBook).toHaveBeenCalledWith(1, {});
    });
  });

  it("displays pagination when last_page > 1", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: mockUserBooks.slice(0, 1),
      current_page: 1,
      last_page: 2,
      total: 2,
      per_page: 1,
    });

    render(<MyCollection />);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("switches pages when pagination button clicked", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: mockUserBooks.slice(0, 1),
      current_page: 1,
      last_page: 2,
      total: 2,
      per_page: 1,
    });

    render(<MyCollection />);

    await waitFor(() => {
      const pageButton = screen.getByRole("button", { name: "2" });
      fireEvent.click(pageButton);
    });

    await waitFor(() => {
      expect(collectionService.default.getCollection).toHaveBeenLastCalledWith(
        2,
      );
    });
  });

  it("displays error message when fetch fails", async () => {
    collectionService.default.getCollection.mockRejectedValue(
      new Error("API Error"),
    );

    render(<MyCollection />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load collection")).toBeInTheDocument();
    });
  });

  it("displays collection stats", async () => {
    collectionService.default.getCollection.mockResolvedValue({
      data: mockUserBooks,
      current_page: 1,
      last_page: 1,
      total: 2,
      per_page: 12,
    });

    render(<MyCollection />);

    await waitFor(() => {
      expect(screen.getByText("2 books in collection")).toBeInTheDocument();
    });
  });
});
