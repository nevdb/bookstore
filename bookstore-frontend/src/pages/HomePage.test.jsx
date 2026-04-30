import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext";

const renderPage = (user = null) => {
  useAuth.mockReturnValue({ user });
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
};

describe("HomePage", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Hero section ───────────────────────────────────────────────────────────

  it("renders the hero heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /welcome to bookstore/i }),
    ).toBeInTheDocument();
  });

  it("shows Get Started and Sign In links for unauthenticated user", () => {
    renderPage(null);
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("shows Go to Dashboard link for authenticated user", () => {
    renderPage({ name: "Alice" });
    expect(
      screen.getByRole("link", { name: /go to dashboard/i }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("hides Get Started and Sign In for authenticated user", () => {
    renderPage({ name: "Alice" });
    expect(
      screen.queryByRole("link", { name: /get started/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /sign in/i }),
    ).not.toBeInTheDocument();
  });

  // ── CTA section ────────────────────────────────────────────────────────────

  it("shows CTA section for unauthenticated user", () => {
    renderPage(null);
    expect(screen.getByText(/ready to start/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create account now/i }),
    ).toBeInTheDocument();
  });

  it("hides CTA section for authenticated user", () => {
    renderPage({ name: "Alice" });
    expect(screen.queryByText(/ready to start/i)).not.toBeInTheDocument();
  });

  // ── Features & steps ──────────────────────────────────────────────────────

  it("renders the four feature cards", () => {
    renderPage();
    expect(screen.getByText("Browse Library")).toBeInTheDocument();
    expect(screen.getByText("Rate & Review")).toBeInTheDocument();
    expect(screen.getByText("Organize")).toBeInTheDocument();
    expect(screen.getByText("Search & Filter")).toBeInTheDocument();
  });

  it("renders the how-it-works steps", () => {
    renderPage();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByText("Collect")).toBeInTheDocument();
    expect(screen.getByText("Track")).toBeInTheDocument();
  });
});
