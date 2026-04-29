import { useState } from "react";
import { genreService } from "../../services/genreService";

export default function DeleteGenreModal({ genre, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await genreService.deleteGenre(genre.id);
      onSuccess(genre.id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete genre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Genre</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        {error && <div className="error-message" role="alert">{error}</div>}
        <p>
          Are you sure you want to delete <strong>{genre.name}</strong>?
        </p>
        <div className="modal-actions">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="delete-btn"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button onClick={onClose} disabled={loading} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
