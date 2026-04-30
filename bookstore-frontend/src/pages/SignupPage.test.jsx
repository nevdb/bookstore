import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "./SignupPage";

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

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  );
}

async function fillForm({ name = "", email = "", password = "", confirm = "" } = {}) {
  if (name) await userEvent.type(screen.getByLabelText(/full name/i), name);
  if (email) await userEvent.type(screen.getByLabelText(/email address/i), email);
  if (password) await userEvent.type(screen.getByLabelText(/^password$/i), password);
  if (confirm) await userEvent.type(screen.getByLabelText(/confirm password/i), confirm);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ register: vi.fn(), loading: false });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the heading and subheading", () => {
    renderSignupPage();

    expect(screen.getByRole("heading", { name: /join bookstore/i })).toBeInTheDocument();
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it("renders all four input fields", () => {
    renderSignupPage();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders the submit button with label "Create Account"', () => {
    renderSignupPage();

    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders a link to the login page", () => {
    renderSignupPage();

    expect(screen.getByRole("link", { name: /sign in here/i })).toBeInTheDocument();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it('disables all inputs and shows "Creating account…" while loading=true', () => {
    useAuth.mockReturnValue({ register: vi.fn(), loading: true });
    renderSignupPage();

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
  });

  // ── Validation – empty fields ──────────────────────────────────────────────

  it("shows validation error when all fields are empty", async () => {
    renderSignupPage();

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/please fill in all fields/i);
  });

  it("shows validation error when name is missing", async () => {
    renderSignupPage();

    await fillForm({ email: "alice@example.com", password: "password123", confirm: "password123" });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/please fill in all fields/i);
  });

  it("shows validation error when email is missing", async () => {
    renderSignupPage();

    await fillForm({ name: "Alice", password: "password123", confirm: "password123" });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/please fill in all fields/i);
  });

  it("shows validation error when password is missing", async () => {
    renderSignupPage();

    await fillForm({ name: "Alice", email: "alice@example.com", confirm: "password123" });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/please fill in all fields/i);
  });

  // ── Validation – password rules ────────────────────────────────────────────

  it("shows error when password is shorter than 8 characters", async () => {
    renderSignupPage();

    await fillForm({ name: "Alice", email: "alice@example.com", password: "short", confirm: "short" });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/at least 8 characters/i);
  });

  it("shows error when passwords do not match", async () => {
    renderSignupPage();

    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "different123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/passwords do not match/i);
  });

  it("does not call register() when validation fails", async () => {
    const mockRegister = vi.fn();
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── Successful registration ────────────────────────────────────────────────

  it("calls register() with correct payload on valid submission", async () => {
    const mockRegister = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();

    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "password123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        password_confirmation: "password123",
      }),
    );
  });

  it("navigates to /dashboard after successful registration", async () => {
    const mockRegister = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();

    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "password123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("clears any previous error when a new valid submission starts", async () => {
    const mockRegister = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();

    // First — trigger a validation error
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Then — fill in valid data and submit
    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "password123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  // ── Failed registration ────────────────────────────────────────────────────

  it("shows server error message from err.response.data.message", async () => {
    const mockRegister = vi.fn().mockRejectedValue({
      response: { data: { message: "The email has already been taken." } },
    });
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();

    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "password123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /the email has already been taken/i,
      ),
    );
  });

  it("shows fallback error message when err.response is undefined", async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error("Network Error"));
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();

    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "password123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /signup failed. please try again/i,
      ),
    );
  });

  it("does not navigate on registration failure", async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error("Fail"));
    useAuth.mockReturnValue({ register: mockRegister, loading: false });

    renderSignupPage();

    await fillForm({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      confirm: "password123",
    });
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
