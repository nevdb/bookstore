import { useState, useEffect } from "react";
import { booksService } from "../../services/booksService";

export default function DeleteBookModal({ book, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDelete = async () => {
    setError("");
    setLoading(true);

    try {
      await booksService.deleteBook(book.id);
      onSuccess(book.id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title">Delete Book</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>

        <div className="delete-modal-content">
          <div className="book-preview">
            <div className="book-info">
              <h4>{book.title}</h4>
              {book.author && (
                <p>
                  by <strong>{book.author.name}</strong>
                </p>
              )}
              {book.publication_year && (
                <p>Published: {book.publication_year}</p>
              )}
            </div>
          </div>

          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <p>
              Are you sure you want to delete this book? This action{" "}
              <strong>cannot be undone</strong>.
            </p>
            {book.user_collections_count > 0 && (
              <p className="info-text">
                This book is in <strong>{book.user_collections_count}</strong>{" "}
                user collection(s) and will be removed from all of them.
              </p>
            )}
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-confirm-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
