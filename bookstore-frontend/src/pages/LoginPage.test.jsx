import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useAuth } from "../context/AuthContext";

// ─── Helper ──────────────────────────────────────────────────────────────────

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: not loading, login fn is a no-op spy
    useAuth.mockReturnValue({ login: vi.fn(), loading: false });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the heading and subheading", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign in to your bookstore account/i),
    ).toBeInTheDocument();
  });

  it("renders email and password input fields", () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the submit button with label "Sign In"', () => {
    renderLoginPage();

    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders a link to the signup page", () => {
    renderLoginPage();

    expect(
      screen.getByRole("link", { name: /sign up here/i }),
    ).toBeInTheDocument();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it('disables inputs and shows "Signing in…" while loading=true', () => {
    useAuth.mockReturnValue({ login: vi.fn(), loading: true });
    renderLoginPage();

    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it("shows validation error when both fields are empty", async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /please fill in all fields/i,
    );
  });

  it("shows validation error when only email is filled", async () => {
    renderLoginPage();

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "test@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /please fill in all fields/i,
    );
  });

  it("shows validation error when only password is filled", async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /please fill in all fields/i,
    );
  });

  it("does not call login() when validation fails", async () => {
    const mockLogin = vi.fn();
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).not.toHaveBeenCalled();
  });

  // ── Successful login ───────────────────────────────────────────────────────

  it("calls login() with the entered email and password", async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "alice@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "password123",
      }),
    );
  });

  it("navigates to /dashboard after successful login", async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "alice@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard"),
    );
  });

  it("clears any previous error when a new submission starts", async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();

    // First — trigger a validation error
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Then — fill in fields and submit successfully
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "alice@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });

  // ── Failed login ───────────────────────────────────────────────────────────

  it("shows server error message from err.response.data.message", async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: {
        data: { message: "These credentials do not match our records." },
      },
    });
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "wrong@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /these credentials do not match our records/i,
      ),
    );
  });

  it("shows a fallback error message when err.response is undefined", async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error("Network Error"));
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "alice@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /login failed. please try again/i,
      ),
    );
  });

  it("does not navigate on login failure", async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error("Fail"));
    useAuth.mockReturnValue({ login: mockLogin, loading: false });

    renderLoginPage();

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "alice@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
