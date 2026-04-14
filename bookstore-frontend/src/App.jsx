import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Navigation/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (Authenticated Users) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-Only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <div>Admin Dashboard - Coming Soon</div>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminRoute>
                <div>Admin Books Management - Coming Soon</div>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/authors"
            element={
              <AdminRoute>
                <div>Admin Authors Management - Coming Soon</div>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/genres"
            element={
              <AdminRoute>
                <div>Admin Genres Management - Coming Soon</div>
              </AdminRoute>
            }
          />

          {/* Placeholder Routes for Phase 3+ */}
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <div>Browse System Books - Coming in Phase 3</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-collection"
            element={
              <ProtectedRoute>
                <div>My Collection - Coming in Phase 4</div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
