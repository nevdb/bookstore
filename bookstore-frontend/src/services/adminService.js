import API from './api';

export const adminService = {
    // Get all users
    getUsers: (page = 1, perPage = 15) =>
        API.get(`/api/admin/users?page=${page}&per_page=${perPage}`),

    // Get single user
    getUser: (userId) =>
        API.get(`/api/admin/users/${userId}`),

    // Promote user to admin
    promoteUserToAdmin: (userId) =>
        API.post(`/api/admin/users/${userId}/make-admin`, { user_id: userId }),

    // Demote admin to regular user
    demoteAdminUser: (userId) =>
        API.post(`/api/admin/users/${userId}/demote`, { user_id: userId }),

    // Update user
    updateUser: (userId, data) =>
        API.put(`/api/admin/users/${userId}`, data),

    // Delete user
    deleteUser: (userId) =>
        API.delete(`/api/admin/users/${userId}`),

    // Get admin statistics
    getStatistics: () =>
        API.get(`/api/admin/statistics`),
};
