import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import UsersListTable from "../components/AdminPanel/UsersListTable";
import "./AdminUsersManagement.css";

export default function AdminUsersManagement() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getStatistics();
      setStatistics(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users-management">
      {/* Header */}
      <div className="management-header">
        <h1>User Management</h1>
        <p>Manage all users and control admin roles</p>
      </div>

      {/* Statistics Cards */}
      {!loading && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{statistics.total_users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card admin-stat">
            <div className="stat-number">{statistics.total_admins}</div>
            <div className="stat-label">Administrators</div>
          </div>
          <div className="stat-card user-stat">
            <div className="stat-number">{statistics.total_regular_users}</div>
            <div className="stat-label">Regular Users</div>
          </div>
        </div>
      )}

      {error && <div className="error-alert" role="alert">{error}</div>}

      {/* Users Table */}
      <div className="table-section">
        <h2>All Users</h2>
        <p className="section-description">
          View all users and manage their roles
        </p>
        <UsersListTable />
      </div>

      {/* Instructions */}
      <div className="instructions-section">
        <h3>How to Use</h3>
        <div className="instructions-content">
          <div className="instruction-item">
            <span className="instruction-icon">🟢</span>
            <div>
              <strong>Promote User:</strong> Click the "Promote" button next to
              a regular user to make them an administrator
            </div>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🟠</span>
            <div>
              <strong>Demote Admin:</strong> Click "Demote" to remove admin
              privileges from an administrator (they become a regular user)
            </div>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🔴</span>
            <div>
              <strong>Delete User:</strong> Click "Delete" to permanently remove
              a user. This cannot be undone. Their personal collection will be
              deleted, but system books remain intact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
