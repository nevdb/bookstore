import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../hooks/useIsAdmin", () => ({
  default: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useAuth } from "../../context/AuthContext";
import useIsAdmin from "../../hooks/useIsAdmin";

const mockLogout = vi.fn().mockResolvedValue(undefined);

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
    useIsAdmin.mockReturnValue(false);
  });

  // ── Logo ───────────────────────────────────────────────────────────────────

  it("renders the BookStore logo link", () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout, loading: false });
    renderHeader();
    expect(screen.getByRole("link", { name: /bookstore/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  // ── Unauthenticated ────────────────────────────────────────────────────────

  it("shows Login and Sign Up links for unauthenticated user", () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout, loading: false });
    renderHeader();
    expect(screen.getByRole("link", { name: /^login$/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("does not show Dashboard/Collection for unauthenticated user", () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout, loading: false });
    renderHeader();
    expect(
      screen.queryByRole("link", { name: /dashboard/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /collection/i }),
    ).not.toBeInTheDocument();
  });

  // ── Authenticated regular user ─────────────────────────────────────────────

  it("shows Dashboard, Books, Collection links for authenticated user", () => {
    useAuth.mockReturnValue({
      user: { name: "Alice" },
      logout: mockLogout,
      loading: false,
    });
    renderHeader();
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /^books$/i })).toHaveAttribute(
      "href",
      "/books",
    );
    expect(screen.getByRole("link", { name: /collection/i })).toHaveAttribute(
      "href",
      "/my-collection",
    );
  });

  it("shows the logged-in user's name", () => {
    useAuth.mockReturnValue({
      user: { name: "Alice" },
      logout: mockLogout,
      loading: false,
    });
    renderHeader();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("does not show admin badge for regular user", () => {
    useAuth.mockReturnValue({
      user: { name: "Alice" },
      logout: mockLogout,
      loading: false,
    });
    renderHeader();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  // ── Authenticated admin ────────────────────────────────────────────────────

  it("shows admin badge and admin links for admin user", () => {
    useIsAdmin.mockReturnValue(true);
    useAuth.mockReturnValue({
      user: { name: "AdminUser" },
      logout: mockLogout,
      loading: false,
    });
    renderHeader();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    const allLinks = screen.getAllByRole("link");
    const hrefs = allLinks.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/admin/books");
    expect(hrefs).toContain("/admin/genres");
    expect(hrefs).toContain("/admin/authors");
    expect(hrefs).toContain("/admin/users");
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it("hides nav while loading", () => {
    useAuth.mockReturnValue({
      user: { name: "Alice" },
      logout: mockLogout,
      loading: true,
    });
    renderHeader();
    expect(
      screen.queryByRole("link", { name: /dashboard/i }),
    ).not.toBeInTheDocument();
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  it("calls logout and navigates to / when Logout is clicked", async () => {
    useAuth.mockReturnValue({
      user: { name: "Alice" },
      logout: mockLogout,
      loading: false,
    });
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
