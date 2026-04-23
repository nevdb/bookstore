import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useIsAdmin from "../../hooks/useIsAdmin";
import "./Header.css";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo/Brand */}
        <Link to="/" className="header-logo">
          📚 BookStore
        </Link>

        {/* Navigation Links */}
        {!loading && (
          <nav className="header-nav">
            {user ? (
              <>
                {/* Authenticated User Links */}
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/books" className="nav-link">
                  Books
                </Link>
                <Link to="/my-collection" className="nav-link">
                  Collection
                </Link>

                {/* Admin-only Links */}
                {isAdmin && (
                  <>
                    <span className="admin-badge">Admin</span>
                    <Link
                      to="/admin/users"
                      className="nav-link admin-link"
                      title="Manage Users"
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/books"
                      className="nav-link admin-link"
                      title="Manage Books"
                    >
                      Books
                    </Link>
                    <Link
                      to="/admin/authors"
                      className="nav-link admin-link"
                      title="Manage Authors"
                    >
                      Authors
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="user-menu">
                  <span className="user-name">{user.name}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Public Links */}
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/signup" className="nav-link signup-btn">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
