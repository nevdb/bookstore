import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Navigation/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/UserDashboard";
import AdminUsersManagement from "./pages/AdminUsersManagement";
import SystemBooksPage from "./pages/SystemBooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import MyCollection from "./pages/MyCollection";
import AdminBooksManagement from "./pages/AdminBooksManagement";
import AdminAuthorsManagement from "./pages/AdminAuthorsManagement";
import AdminGenresManagement from "./pages/AdminGenresManagement";

export default function App() {
  const { user } = useAuth();
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
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminRoute>
                <AdminBooksManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/authors"
            element={
              <AdminRoute>
                <AdminAuthorsManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/genres"
            element={
              <AdminRoute>
                <AdminGenresManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <SystemBooksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <BookDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-collection"
            element={user ? <MyCollection /> : <Navigate to="/" />}
          />
          {/* Catch-all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
