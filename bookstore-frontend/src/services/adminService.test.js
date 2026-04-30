import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("./api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

import API from "./api";
import { adminService } from "./adminService";

describe("adminService", () => {
    beforeEach(() => vi.clearAllMocks());

    it("getUsers calls GET /api/admin/users with default page and perPage", () => {
        adminService.getUsers();
        expect(API.get).toHaveBeenCalledWith("/api/admin/users?page=1&per_page=15");
    });

    it("getUsers calls GET /api/admin/users with custom page and perPage", () => {
        adminService.getUsers(2, 25);
        expect(API.get).toHaveBeenCalledWith(
            "/api/admin/users?page=2&per_page=25",
        );
    });

    it("getUser calls GET /api/admin/users/:id", () => {
        adminService.getUser(9);
        expect(API.get).toHaveBeenCalledWith("/api/admin/users/9");
    });

    it("promoteUserToAdmin calls POST /api/admin/users/:id/make-admin", () => {
        adminService.promoteUserToAdmin(3);
        expect(API.post).toHaveBeenCalledWith(
            "/api/admin/users/3/make-admin",
            { user_id: 3 },
        );
    });

    it("demoteAdminUser calls POST /api/admin/users/:id/demote", () => {
        adminService.demoteAdminUser(5);
        expect(API.post).toHaveBeenCalledWith(
            "/api/admin/users/5/demote",
            { user_id: 5 },
        );
    });

    it("updateUser calls PUT /api/admin/users/:id with data", () => {
        const data = { name: "New Name" };
        adminService.updateUser(7, data);
        expect(API.put).toHaveBeenCalledWith("/api/admin/users/7", data);
    });

    it("deleteUser calls DELETE /api/admin/users/:id", () => {
        adminService.deleteUser(11);
        expect(API.delete).toHaveBeenCalledWith("/api/admin/users/11");
    });

    it("getStatistics calls GET /api/admin/statistics", () => {
        adminService.getStatistics();
        expect(API.get).toHaveBeenCalledWith("/api/admin/statistics");
    });
});
