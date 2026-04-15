import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import "./UsersListTable.css";

export default function UsersListTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getUsers(page, 15);
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminService.promoteUserToAdmin(userId);
      setError("");
      // Refresh users list
      fetchUsers(currentPage);
      alert("User promoted to admin successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to demote this admin?")) return;

    setActionLoading(true);
    try {
      await adminService.demoteAdminUser(userId);
      setError("");
      fetchUsers(currentPage);
      alert("Admin demoted to user successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to demote admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    setActionLoading(true);
    try {
      await adminService.deleteUser(userId);
      setError("");
      fetchUsers(currentPage);
      alert("User deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading users...</div>;
  }

  return (
    <div className="users-table-container">
      {error && <div className="error-message">{error}</div>}

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-state">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {user.role === "user" ? (
                      <button
                        className="btn-promote"
                        onClick={() => handlePromoteUser(user.id)}
                        disabled={actionLoading}
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        className="btn-demote"
                        onClick={() => handleDemoteUser(user.id)}
                        disabled={actionLoading}
                      >
                        Demote
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(pagination.last_page)}
            disabled={currentPage === pagination.last_page}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
