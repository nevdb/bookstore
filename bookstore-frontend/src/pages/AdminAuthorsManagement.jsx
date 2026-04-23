import React, { useState, useEffect, useRef } from "react";
import { authorService } from "../services/authorService";
import CreateAuthorModal from "../components/AdminPanel/CreateAuthorModal";
import EditAuthorModal from "../components/AdminPanel/EditAuthorModal";
import DeleteAuthorModal from "../components/AdminPanel/DeleteAuthorModal";
import "./AdminAuthorsManagement.css";

export default function AdminAuthorsManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [deletingAuthor, setDeletingAuthor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const editFormRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    authorService
      .getAuthors()
      .then((res) => setAuthors(res.data.data || res.data))
      .catch(() => setError("Failed to load authors"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (editingAuthor && editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editingAuthor]);

  const handleCreateSuccess = (newAuthor) => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };
  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };
  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
  };
  const handleEditSuccess = (updatedAuthor) => {
    setEditingAuthor(null);
    setRefreshKey((prev) => prev + 1);
  };
  const handleDeleteAuthor = (author) => {
    setDeletingAuthor(author);
  };
  const handleDeleteSuccess = (deletedAuthorId) => {
    setDeletingAuthor(null);
    setRefreshKey((prev) => prev + 1);
  };
  const handleDeleteCancel = () => {
    setDeletingAuthor(null);
  };

  return (
    <div className="admin-authors-management">
      <div className="management-header">
        <h1>Authors Management</h1>
        <p>Manage the system authors</p>
        <button
          className="create-author-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Add New Author
        </button>
      </div>

      {showCreateForm && (
        <CreateAuthorModal
          onClose={handleCreateCancel}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editingAuthor && (
        <div ref={editFormRef}>
          <EditAuthorModal
            author={editingAuthor}
            onClose={() => setEditingAuthor(null)}
            onSuccess={handleEditSuccess}
          />
        </div>
      )}
      {deletingAuthor && (
        <DeleteAuthorModal
          author={deletingAuthor}
          onClose={() => setDeletingAuthor(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      <div className="authors-list-section">
        {loading && <p className="authors-loading">Loading authors...</p>}
        {error && <p className="authors-error">{error}</p>}
        {!loading && !error && authors.length === 0 && (
          <p className="authors-empty">
            No authors found. Add one to get started.
          </p>
        )}
        {!loading && !error && authors.length > 0 && (
          <table className="authors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Place of Birth</th>
                <th>Born</th>
                <th>Died</th>
                <th>Books</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id}>
                  <td>{author.name}</td>
                  <td>{author.place_of_birth || "—"}</td>
                  <td>{author.date_of_birth || "—"}</td>
                  <td>{author.date_of_death || "—"}</td>
                  <td>{author.books_count ?? 0}</td>
                  <td className="authors-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditAuthor(author)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAuthor(author)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
