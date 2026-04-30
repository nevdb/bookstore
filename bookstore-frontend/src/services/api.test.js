import { describe, it, expect, beforeEach, afterEach } from "vitest";
import API from "./api";

describe("API axios instance", () => {
    afterEach(() => {
        localStorage.clear();
    });

    // ── Request interceptor ────────────────────────────────────────────────────

    it("adds Authorization header when authToken is in localStorage", () => {
        localStorage.setItem("authToken", "test-token-123");

        const interceptor = API.interceptors.request.handlers[0].fulfilled;
        const config = { headers: {} };
        const result = interceptor(config);

        expect(result.headers.Authorization).toBe("Bearer test-token-123");
    });

    it("does not add Authorization header when no token is stored", () => {
        localStorage.removeItem("authToken");

        const interceptor = API.interceptors.request.handlers[0].fulfilled;
        const config = { headers: {} };
        const result = interceptor(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it("returns the config object from the interceptor", () => {
        const interceptor = API.interceptors.request.handlers[0].fulfilled;
        const config = { headers: {}, url: "/api/test" };
        const result = interceptor(config);

        expect(result).toBe(config);
    });

    it("creates the axios instance with the correct baseURL", () => {
        expect(API.defaults.baseURL).toBe(
            import.meta.env.VITE_API_URL || "http://localhost:8000",
        );
    });

    it("creates the axios instance with withCredentials: true", () => {
        expect(API.defaults.withCredentials).toBe(true);
    });
});
