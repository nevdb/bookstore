import { lazy, Suspense } from "react";
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

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminBooksManagement = lazy(() => import("./pages/AdminBooksManagement"));
const AdminAuthorsManagement = lazy(() => import("./pages/AdminAuthorsManagement"));
const AdminGenresManagement = lazy(() => import("./pages/AdminGenresManagement"));
const AdminUsersManagement_Lazy = lazy(() => import("./pages/AdminUsersManagement"));

export default function App() {
  const { user } = useAuth();
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Suspense fallback={<div className="spinner">Loading...</div>}>
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
          {/* Admin-Only Routes (lazy-loaded) */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
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
        </Suspense>
      </main>
    </div>
  );
}
