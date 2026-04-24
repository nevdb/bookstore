import React, { useState, useEffect, useRef } from "react";
import CreateGenreForm from "../components/AdminPanel/CreateGenreModal";
import EditGenreModal from "../components/AdminPanel/EditGenreModal";
import DeleteGenreModal from "../components/AdminPanel/DeleteGenreModal";
import { genreService } from "../services/genreService";
import "./AdminGenreManagement.css";

export default function AdminGenresManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const editFormRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    genreService
      .getGenres()
      .then((res) => setGenres(res.data.data || res.data))
      .catch(() => setError("Failed to load genres"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (editingGenre && editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editingGenre]);

  const handleCreateSuccess = (newGenre) => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };
  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };
  const handleEditGenre = (genre) => {
    setEditingGenre(genre);
  };
  const handleEditSuccess = (updatedGenre) => {
    setEditingGenre(null);
    setRefreshKey((prev) => prev + 1);
  };
  const handleEditCancel = () => {
    setEditingGenre(null);
  };
  const handleDeleteGenre = (genre) => {
    setDeletingGenre(genre);
  };
  const handleDeleteSuccess = (deletedGenreId) => {
    setDeletingGenre(null);
    setRefreshKey((prev) => prev + 1);
  };
  const handleDeleteCancel = () => {
    setDeletingGenre(null);
  };

  return (
    <div className="admin-genres-management">
      <div className="management-header">
        <h1>Genres Management</h1>
        <p>Manage the system book genres</p>
        <button
          className="create-genre-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Add New Genre
        </button>
      </div>

      {showCreateForm && (
        <CreateGenreForm
          onClose={handleCreateCancel}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editingGenre && (
        <div ref={editFormRef}>
          <EditGenreModal
            genre={editingGenre}
            onClose={() => setEditingGenre(null)}
            onSuccess={handleEditSuccess}
          />
        </div>
      )}
      {deletingGenre && (
        <DeleteGenreModal
          genre={deletingGenre}
          onClose={() => setDeletingGenre(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      <div className="genres-table-container">
        {loading ? (
          <p>Loading genres...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table className="genres-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Books</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id}>
                  <td>{genre.name}</td>
                  <td>{genre.description || "—"}</td>
                  <td>{genre.books_count ?? 0}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditGenre(genre)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteGenre(genre)}
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
