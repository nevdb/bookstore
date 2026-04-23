import { useState } from "react";
import { authorService } from "../../services/authorService";

export default function DeleteAuthorModal({ author, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await authorService.deleteAuthor(author.id);
      onSuccess(author.id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Author</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        <p>
          Are you sure you want to delete <strong>{author.name}</strong>?
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
