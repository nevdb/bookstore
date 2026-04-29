import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import "./UsersListTable.css";

export default function UsersListTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { userId, type: 'demote'|'delete' }

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
    setSuccess("");
    try {
      await adminService.promoteUserToAdmin(userId);
      setError("");
      fetchUsers(currentPage);
      setSuccess("User promoted to admin successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteUser = async (userId) => {
    setConfirmAction({ userId, type: "demote" });
  };

  const handleDeleteUser = async (userId) => {
    setConfirmAction({ userId, type: "delete" });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { userId, type } = confirmAction;
    setConfirmAction(null);
    setActionLoading(true);
    setSuccess("");
    try {
      if (type === "demote") {
        await adminService.demoteAdminUser(userId);
        setError("");
        fetchUsers(currentPage);
        setSuccess("Admin demoted to user successfully!");
      } else if (type === "delete") {
        await adminService.deleteUser(userId);
        setError("");
        fetchUsers(currentPage);
        setSuccess("User deleted successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${type} user`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading users...</div>;
  }

  return (
    <div className="users-table-container">
      {error && <div className="error-message" role="alert">{error}</div>}
      {success && <div className="success-message" aria-live="polite">{success}</div>}

      {confirmAction && (
        <div className="confirm-action-bar" aria-live="polite">
          <span>
            {confirmAction.type === "delete"
              ? "Delete this user? This action cannot be undone."
              : "Demote this admin to regular user?"}
          </span>
          <button className="btn-confirm-yes" onClick={handleConfirmAction} disabled={actionLoading}>
            Yes, {confirmAction.type === "delete" ? "delete" : "demote"}
          </button>
          <button className="btn-confirm-cancel" onClick={() => setConfirmAction(null)} disabled={actionLoading}>
            Cancel
          </button>
        </div>
      )}

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
