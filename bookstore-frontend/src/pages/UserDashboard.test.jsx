import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserDashboard from "./UserDashboard";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../hooks/useIsAdmin", () => ({
  default: vi.fn(),
}));

vi.mock("../services/collectionService", () => ({
  default: { getStatistics: vi.fn() },
}));

import { useAuth } from "../context/AuthContext";
import useIsAdmin from "../hooks/useIsAdmin";
import collectionService from "../services/collectionService";

const mockStats = {
  total_books: 12,
  reading: 3,
  completed: 7,
  to_read: 2,
  average_rating: "4.2",
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <UserDashboard />
    </MemoryRouter>,
  );

describe("UserDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { name: "Alice", email: "alice@test.com" },
    });
    useIsAdmin.mockReturnValue(false);
    collectionService.getStatistics.mockResolvedValue({ data: mockStats });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the welcome message with the user name", () => {
    renderDashboard();
    expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
  });

  it("shows 'Regular User' for non-admin", () => {
    renderDashboard();
    expect(screen.getAllByText(/regular user/i).length).toBeGreaterThan(0);
  });

  it("shows 'Administrator' for admin", () => {
    useIsAdmin.mockReturnValue(true);
    renderDashboard();
    expect(screen.getAllByText(/administrator/i).length).toBeGreaterThan(0);
  });

  // ── Stats banner ───────────────────────────────────────────────────────────

  it("does not show stats banner while loading", () => {
    collectionService.getStatistics.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.queryByText("Books in Collection")).not.toBeInTheDocument();
  });

  it("shows collection stats after loading", async () => {
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText("Books in Collection")).toBeInTheDocument(),
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("To Read")).toBeInTheDocument();
    expect(screen.getByText("4.2 ★")).toBeInTheDocument();
  });

  it("shows '—' when average_rating is null", async () => {
    collectionService.getStatistics.mockResolvedValue({
      data: { ...mockStats, average_rating: null },
    });
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText("Books in Collection")).toBeInTheDocument(),
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("does not show stats banner when fetch fails", async () => {
    collectionService.getStatistics.mockRejectedValue(new Error("fail"));
    renderDashboard();
    await waitFor(() =>
      expect(collectionService.getStatistics).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByText("Books in Collection")).not.toBeInTheDocument();
  });

  // ── Quick actions ──────────────────────────────────────────────────────────

  it("renders My Collection and Browse Library links for all users", () => {
    renderDashboard();
    expect(
      screen.getByRole("link", { name: /view collection/i }),
    ).toHaveAttribute("href", "/my-collection");
    expect(screen.getByRole("link", { name: /browse books/i })).toHaveAttribute(
      "href",
      "/books",
    );
  });

  it("does not show admin cards for a regular user", () => {
    renderDashboard();
    expect(screen.queryByText("Manage Books")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage Authors")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage Genres")).not.toBeInTheDocument();
  });

  it("shows admin management cards for admin user", () => {
    useIsAdmin.mockReturnValue(true);
    renderDashboard();
    expect(screen.getByText("Manage Books")).toBeInTheDocument();
    expect(screen.getByText("Manage Authors")).toBeInTheDocument();
    expect(screen.getByText("Manage Genres")).toBeInTheDocument();
  });
});
