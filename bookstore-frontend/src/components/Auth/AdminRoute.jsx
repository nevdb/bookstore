import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdminRoute - Higher-order component to guard admin-only routes
 * Requires both authentication and admin role
 * Redirects to login if not authenticated, or to home if not admin
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
