import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

vi.mock("../services/adminService", () => ({
  adminService: { getStatistics: vi.fn() },
}));

import { adminService } from "../services/adminService";

const mockStats = {
  total_books: 50,
  total_authors: 20,
  total_genres: 10,
  total_users: 100,
  total_admins: 3,
  total_regular_users: 97,
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>,
  );

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getStatistics.mockResolvedValue({ data: { data: mockStats } });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Admin Dashboard heading", () => {
    renderDashboard();
    expect(
      screen.getByRole("heading", { name: /admin dashboard/i }),
    ).toBeInTheDocument();
  });

  it("shows loading text while fetching stats", () => {
    adminService.getStatistics.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  it("shows all stat cards after successful fetch", async () => {
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText("Total Books")).toBeInTheDocument(),
    );
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Total Authors")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Total Genres")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Administrators")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Regular Users")).toBeInTheDocument();
    expect(screen.getByText("97")).toBeInTheDocument();
  });

  it("shows error alert when fetch fails", async () => {
    adminService.getStatistics.mockRejectedValue(new Error("Server error"));
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to load statistics/i,
      ),
    );
  });

  it("renders all management area navigation links with correct hrefs", () => {
    renderDashboard();
    const allLinks = screen.getAllByRole("link");
    const hrefs = allLinks.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/admin/books");
    expect(hrefs).toContain("/admin/authors");
    expect(hrefs).toContain("/admin/genres");
    expect(hrefs).toContain("/admin/users");
  });
});
