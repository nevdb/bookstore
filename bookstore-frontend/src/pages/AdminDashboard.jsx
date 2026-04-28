import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../services/adminService";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getStatistics()
      .then((res) => setStats(res.data.data))
      .catch(() => setError("Failed to load statistics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="management-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and quick navigation</p>
      </div>

      {/* Statistics */}
      {loading && <p className="loading-text">Loading statistics...</p>}
      {error && <div className="error-alert">{error}</div>}

      {!loading && stats && (
        <>
          <section className="admin-stats-section">
            <h2>System Statistics</h2>
            <div className="admin-stats-grid">
              <div className="admin-stat-card books">
                <div className="admin-stat-number">{stats.total_books}</div>
                <div className="admin-stat-label">Total Books</div>
              </div>
              <div className="admin-stat-card authors">
                <div className="admin-stat-number">{stats.total_authors}</div>
                <div className="admin-stat-label">Total Authors</div>
              </div>
              <div className="admin-stat-card genres">
                <div className="admin-stat-number">{stats.total_genres}</div>
                <div className="admin-stat-label">Total Genres</div>
              </div>
              <div className="admin-stat-card users">
                <div className="admin-stat-number">{stats.total_users}</div>
                <div className="admin-stat-label">Total Users</div>
              </div>
              <div className="admin-stat-card admins">
                <div className="admin-stat-number">{stats.total_admins}</div>
                <div className="admin-stat-label">Administrators</div>
              </div>
              <div className="admin-stat-card regular">
                <div className="admin-stat-number">
                  {stats.total_regular_users}
                </div>
                <div className="admin-stat-label">Regular Users</div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Quick Navigation */}
      <section className="admin-nav-section">
        <h2>Management Areas</h2>
        <div className="admin-nav-grid">
          <Link to="/admin/books" className="admin-nav-card">
            <div className="admin-nav-icon">📖</div>
            <div className="admin-nav-content">
              <h3>Books</h3>
              <p>Create, edit, and delete books in the system library</p>
            </div>
            <span className="admin-nav-arrow">→</span>
          </Link>

          <Link to="/admin/authors" className="admin-nav-card">
            <div className="admin-nav-icon">✍️</div>
            <div className="admin-nav-content">
              <h3>Authors</h3>
              <p>Manage author profiles and biographies</p>
            </div>
            <span className="admin-nav-arrow">→</span>
          </Link>

          <Link to="/admin/genres" className="admin-nav-card">
            <div className="admin-nav-icon">🏷️</div>
            <div className="admin-nav-content">
              <h3>Genres</h3>
              <p>Create and manage book genre categories</p>
            </div>
            <span className="admin-nav-arrow">→</span>
          </Link>

          <Link to="/admin/users" className="admin-nav-card">
            <div className="admin-nav-icon">👥</div>
            <div className="admin-nav-content">
              <h3>Users</h3>
              <p>View users and manage admin roles</p>
            </div>
            <span className="admin-nav-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
