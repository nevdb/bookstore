import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useIsAdmin from "../hooks/useIsAdmin";
import collectionService from "../services/collectionService";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    collectionService
      .getStatistics()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p className="user-role">
            {isAdmin ? (
              <span className="admin-role">✨ Administrator</span>
            ) : (
              <span className="user-role-text">Regular User</span>
            )}
          </p>
        </div>

        {/* Collection Stats Banner */}
        {!statsLoading && stats && (
          <div className="collection-stats-banner">
            <div className="collection-stat">
              <span className="collection-stat-number">{stats.total_books}</span>
              <span className="collection-stat-label">Books in Collection</span>
            </div>
            <div className="collection-stat">
              <span className="collection-stat-number reading">{stats.reading}</span>
              <span className="collection-stat-label">Reading</span>
            </div>
            <div className="collection-stat">
              <span className="collection-stat-number completed">{stats.completed}</span>
              <span className="collection-stat-label">Completed</span>
            </div>
            <div className="collection-stat">
              <span className="collection-stat-number to-read">{stats.to_read}</span>
              <span className="collection-stat-label">To Read</span>
            </div>
            <div className="collection-stat">
              <span className="collection-stat-number rating">
                {stats.average_rating !== null ? `${stats.average_rating} ★` : "—"}
              </span>
              <span className="collection-stat-label">Avg Rating</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>My Collection</h3>
              <p>View and manage your personal book collection</p>
              <Link to="/my-collection" className="stat-link">
                View Collection →
              </Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <h3>Browse Library</h3>
              <p>Discover new books from our system library</p>
              <Link to="/books" className="stat-link">
                Browse Books →
              </Link>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="stat-card admin-card">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <h3>Manage Books</h3>
                  <p>Create, edit, and delete books in the system</p>
                  <Link to="/admin/books" className="stat-link">
                    Manage Books →
                  </Link>
                </div>
              </div>

              <div className="stat-card admin-card">
                <div className="stat-icon">✍️</div>
                <div className="stat-content">
                  <h3>Manage Authors</h3>
                  <p>Create and manage author information</p>
                  <Link to="/admin/authors" className="stat-link">
                    Manage Authors →
                  </Link>
                </div>
              </div>

              <div className="stat-card admin-card">
                <div className="stat-icon">🏷️</div>
                <div className="stat-content">
                  <h3>Manage Genres</h3>
                  <p>Create and manage book genres</p>
                  <Link to="/admin/genres" className="stat-link">
                    Manage Genres →
                  </Link>
                </div>
              </div>

              <div className="stat-card admin-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Admin Dashboard</h3>
                  <p>View system statistics and analytics</p>
                  <Link to="/admin/dashboard" className="stat-link">
                    View Stats →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="user-info-section">
          <h2>Your Account</h2>
          <div className="info-card">
            <div className="info-row">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-row">
              <label>Role:</label>
              <span className={isAdmin ? "role-admin" : "role-user"}>
                {isAdmin ? "Administrator" : "Regular User"}
              </span>
            </div>
            <div className="info-row">
              <label>Member Since:</label>
              <span>{new Date(user?.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
