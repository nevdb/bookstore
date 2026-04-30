import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminUsersManagement from "./AdminUsersManagement";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../services/adminService", () => ({
  adminService: { getStatistics: vi.fn() },
}));

// Stub the child component that has its own async behaviour
vi.mock("../components/AdminPanel/UsersListTable", () => ({
  default: () => <div data-testid="users-list-table">UsersListTable</div>,
}));

import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";

const mockStats = {
  total_users: 100,
  total_admins: 3,
  total_regular_users: 97,
};

describe("AdminUsersManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, name: "Admin", role: "admin" } });
    adminService.getStatistics.mockResolvedValue({
      data: { data: mockStats },
    });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the User Management heading", () => {
    render(<AdminUsersManagement />);
    expect(
      screen.getByRole("heading", { name: /user management/i }),
    ).toBeInTheDocument();
  });

  it("renders statistics cards after load", async () => {
    render(<AdminUsersManagement />);
    await waitFor(() => expect(screen.getByText("100")).toBeInTheDocument());
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Administrators")).toBeInTheDocument();
    expect(screen.getByText("97")).toBeInTheDocument();
    expect(screen.getByText("Regular Users")).toBeInTheDocument();
  });

  it("shows error alert when fetch fails", async () => {
    adminService.getStatistics.mockRejectedValue({
      response: { data: { message: "Unauthorized" } },
    });
    render(<AdminUsersManagement />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/unauthorized/i),
    );
  });

  it("renders the UsersListTable component", () => {
    render(<AdminUsersManagement />);
    expect(screen.getByTestId("users-list-table")).toBeInTheDocument();
  });

  it("renders the instructions section", () => {
    render(<AdminUsersManagement />);
    expect(
      screen.getByRole("heading", { name: /how to use/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/promote user/i)).toBeInTheDocument();
    expect(screen.getByText(/demote admin/i)).toBeInTheDocument();
    expect(screen.getByText(/delete user/i)).toBeInTheDocument();
  });
});
