import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersListTable from "./UsersListTable";

vi.mock("../../services/adminService", () => ({
  adminService: {
    getUsers: vi.fn(),
    promoteUserToAdmin: vi.fn(),
    demoteAdminUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

import { adminService } from "../../services/adminService";

const mockUsers = [
  {
    id: 1,
    name: "Alice Regular",
    email: "alice@test.com",
    role: "user",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Bob Admin",
    email: "bob@test.com",
    role: "admin",
    created_at: "2024-02-01T00:00:00Z",
  },
];

const mockPagination = { current_page: 1, last_page: 1 };

describe("UsersListTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getUsers.mockResolvedValue({
      data: { data: mockUsers, pagination: mockPagination },
    });
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it("shows loading spinner while fetching users", () => {
    adminService.getUsers.mockReturnValue(new Promise(() => {}));
    render(<UsersListTable />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  // ── Table rendering ────────────────────────────────────────────────────────

  it("renders the users table with user data", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByText("Alice Regular")).toBeInTheDocument(),
    );
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Admin")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  it("shows role badges for each user", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByText("Alice Regular")).toBeInTheDocument(),
    );
    const roleBadges = screen.getAllByText(/^(user|admin)$/i);
    expect(roleBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("shows Promote button for regular users", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByText("Alice Regular")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /promote/i }),
    ).toBeInTheDocument();
  });

  it("shows Demote button for admin users", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByText("Bob Admin")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /demote/i })).toBeInTheDocument();
  });

  it("shows empty state when no users exist", async () => {
    adminService.getUsers.mockResolvedValue({
      data: { data: [], pagination: mockPagination },
    });
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByText(/no users found/i)).toBeInTheDocument(),
    );
  });

  // ── Promote ────────────────────────────────────────────────────────────────

  it("calls promoteUserToAdmin when Promote is clicked", async () => {
    adminService.promoteUserToAdmin.mockResolvedValue({});
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /promote/i }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /promote/i }));
    await waitFor(() =>
      expect(adminService.promoteUserToAdmin).toHaveBeenCalledWith(1),
    );
  });

  it("shows success message after promoting user", async () => {
    adminService.promoteUserToAdmin.mockResolvedValue({});
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /promote/i }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /promote/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/promoted to admin successfully/i),
      ).toBeInTheDocument(),
    );
  });

  // ── Demote (confirm flow) ──────────────────────────────────────────────────

  it("shows confirm bar when Demote is clicked", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /demote/i }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /demote/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/demote this admin to regular user/i),
      ).toBeInTheDocument(),
    );
  });

  it("calls demoteAdminUser when demote is confirmed", async () => {
    adminService.demoteAdminUser.mockResolvedValue({});
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /demote/i }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /demote/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /yes, demote/i }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /yes, demote/i }));
    await waitFor(() =>
      expect(adminService.demoteAdminUser).toHaveBeenCalledWith(2),
    );
  });

  // ── Delete (confirm flow) ──────────────────────────────────────────────────

  it("shows confirm bar when Delete is clicked", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: /delete/i })[0],
      ).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /delete/i })[0],
    );
    await waitFor(() =>
      expect(screen.getByText(/delete this user/i)).toBeInTheDocument(),
    );
  });

  it("calls deleteUser when delete is confirmed", async () => {
    adminService.deleteUser.mockResolvedValue({});
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: /delete/i })[0],
      ).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: /delete/i })[0],
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /yes, delete/i }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() =>
      expect(adminService.deleteUser).toHaveBeenCalledWith(1),
    );
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("shows error alert when fetch fails", async () => {
    adminService.getUsers.mockRejectedValue({
      response: { data: { message: "Access denied" } },
    });
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/access denied/i),
    );
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it("does not show pagination when only one page", async () => {
    render(<UsersListTable />);
    await waitFor(() =>
      expect(screen.getByText("Alice Regular")).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /^first$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows pagination when multiple pages exist", async () => {
    adminService.getUsers.mockResolvedValue({
      data: {
        data: mockUsers,
        pagination: { current_page: 1, last_page: 3 },
      },
    });
    render(<UsersListTable />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /^first$/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /^last$/i })).toBeInTheDocument();
  });
});
