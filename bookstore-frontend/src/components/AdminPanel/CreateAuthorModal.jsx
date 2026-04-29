import { useState, useEffect } from "react";
import { authorService } from "../../services/authorService";

export default function CreateAuthorModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    date_of_death: "",
    place_of_birth: "",
    biography: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Author name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await authorService.createAuthor(formData);
      onSuccess(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-title">Create New Author</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter author name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_of_death">Date of Death</label>
              <input
                id="date_of_death"
                name="date_of_death"
                type="date"
                value={formData.date_of_death}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="place_of_birth">Place of Birth</label>
            <input
              id="place_of_birth"
              name="place_of_birth"
              type="text"
              value={formData.place_of_birth}
              onChange={handleInputChange}
              placeholder="Enter place of birth"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="biography">Biography</label>
            <textarea
              id="biography"
              name="biography"
              value={formData.biography}
              onChange={handleInputChange}
              placeholder="Enter author biography (optional)"
              rows="3"
              disabled={loading}
            />
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
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Author"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
