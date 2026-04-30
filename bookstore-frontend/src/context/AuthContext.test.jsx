import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

// Mock the Axios instance so no real HTTP calls are made
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import API from "../services/api";

// ─── Reusable test components ────────────────────────────────────────────────

/** Displays auth state */
const DisplayConsumer = () => {
  const { user, loading } = useAuth();
  return (
    <>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.name : "null"}</div>
      <div data-testid="role">{user?.role ?? "none"}</div>
    </>
  );
};

/** Exposes login / register / logout buttons */
const ActionConsumer = () => {
  const { user, login, register, logout } = useAuth();
  return (
    <>
      <div data-testid="user">{user ? user.name : "null"}</div>
      <div data-testid="role">{user?.role ?? "none"}</div>
      <button
        onClick={() =>
          login({ email: "test@example.com", password: "password123" })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          register({
            name: "New User",
            email: "new@example.com",
            password: "pass123",
          })
        }
      >
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </>
  );
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function renderInProvider(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AuthProvider – initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("starts with loading=true and user=null before useEffect resolves", () => {
    // Keep the API call pending so the effect never settles during this test
    localStorage.setItem("authToken", "some-token");
    API.get.mockReturnValue(new Promise(() => {}));

    renderInProvider(<DisplayConsumer />);

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("sets loading=false and keeps user=null when no token is stored", async () => {
    renderInProvider(<DisplayConsumer />);

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(API.get).not.toHaveBeenCalled();
  });

  it("fetches profile and sets user when a token exists in localStorage", async () => {
    localStorage.setItem("authToken", "valid-token");
    API.get.mockResolvedValue({
      data: { id: 1, name: "Alice", email: "alice@example.com", role: "user" },
    });

    renderInProvider(<DisplayConsumer />);

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );

    expect(API.get).toHaveBeenCalledWith("/api/auth/profile");
    expect(screen.getByTestId("user")).toHaveTextContent("Alice");
    expect(screen.getByTestId("role")).toHaveTextContent("user");
  });

  it("removes the token and keeps user=null when the profile fetch fails", async () => {
    localStorage.setItem("authToken", "expired-token");
    API.get.mockRejectedValue(new Error("Unauthorized"));

    renderInProvider(<DisplayConsumer />);

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});

describe("AuthProvider – login()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("calls POST /api/auth/login with the provided credentials", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "login-token",
        user: { id: 1, name: "Bob", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);
    await userEvent.click(screen.getByText("Login"));

    expect(API.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "test@example.com",
      password: "password123",
    });
  });

  it("stores the returned token in localStorage after login", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "login-token",
        user: { id: 1, name: "Bob", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);
    await userEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(localStorage.getItem("authToken")).toBe("login-token"),
    );
  });

  it("updates user in context after successful login", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "login-token",
        user: { id: 1, name: "Bob", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    await userEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent("Bob"),
    );
  });
});

describe("AuthProvider – register()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("calls POST /api/auth/register with the provided payload", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "reg-token",
        user: { id: 2, name: "New User", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);
    await userEvent.click(screen.getByText("Register"));

    expect(API.post).toHaveBeenCalledWith("/api/auth/register", {
      name: "New User",
      email: "new@example.com",
      password: "pass123",
    });
  });

  it("stores the returned token in localStorage after registration", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "reg-token",
        user: { id: 2, name: "New User", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);
    await userEvent.click(screen.getByText("Register"));

    await waitFor(() =>
      expect(localStorage.getItem("authToken")).toBe("reg-token"),
    );
  });

  it("sets user in context after registration", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "reg-token",
        user: { id: 2, name: "New User", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);
    await userEvent.click(screen.getByText("Register"));

    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent("New User"),
    );
  });

  it('new user is assigned role "user", not "admin"', async () => {
    API.post.mockResolvedValue({
      data: {
        token: "reg-token",
        user: { id: 2, name: "New User", role: "user" },
      },
    });

    renderInProvider(<ActionConsumer />);
    await userEvent.click(screen.getByText("Register"));

    await waitFor(() =>
      expect(screen.getByTestId("role")).toHaveTextContent("user"),
    );
    expect(screen.getByTestId("role")).not.toHaveTextContent("admin");
  });
});

describe("AuthProvider – logout()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Helper: render with a pre-authenticated user
  async function renderLoggedIn() {
    localStorage.setItem("authToken", "existing-token");
    API.get.mockResolvedValue({
      data: { id: 1, name: "Alice", role: "user" },
    });
    API.post.mockResolvedValue({ data: {} });

    renderInProvider(<ActionConsumer />);

    // Wait for profile fetch to populate the user
    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent("Alice"),
    );
  }

  it("calls POST /api/auth/logout", async () => {
    await renderLoggedIn();
    await userEvent.click(screen.getByText("Logout"));

    expect(API.post).toHaveBeenCalledWith("/api/auth/logout");
  });

  it("removes the token from localStorage after logout", async () => {
    await renderLoggedIn();
    await userEvent.click(screen.getByText("Logout"));

    await waitFor(() => expect(localStorage.getItem("authToken")).toBeNull());
  });

  it("clears user from context after logout", async () => {
    await renderLoggedIn();
    await userEvent.click(screen.getByText("Logout"));

    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent("null"),
    );
  });
});

describe("useAuth()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("returns null when used outside AuthProvider", () => {
    const NullConsumer = () => {
      const auth = useAuth();
      return (
        <div data-testid="auth">{auth === null ? "null" : "has-value"}</div>
      );
    };

    render(<NullConsumer />);
    expect(screen.getByTestId("auth")).toHaveTextContent("null");
  });

  it("exposes login, register, logout, and setUser as functions", async () => {
    const ContextShapeConsumer = () => {
      const ctx = useAuth();
      return (
        <>
          <div data-testid="has-login">
            {typeof ctx.login === "function" ? "yes" : "no"}
          </div>
          <div data-testid="has-register">
            {typeof ctx.register === "function" ? "yes" : "no"}
          </div>
          <div data-testid="has-logout">
            {typeof ctx.logout === "function" ? "yes" : "no"}
          </div>
          <div data-testid="has-setUser">
            {typeof ctx.setUser === "function" ? "yes" : "no"}
          </div>
        </>
      );
    };

    renderInProvider(<ContextShapeConsumer />);

    expect(screen.getByTestId("has-login")).toHaveTextContent("yes");
    expect(screen.getByTestId("has-register")).toHaveTextContent("yes");
    expect(screen.getByTestId("has-logout")).toHaveTextContent("yes");
    expect(screen.getByTestId("has-setUser")).toHaveTextContent("yes");
  });
});
