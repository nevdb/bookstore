import React, { useState } from "react";
import { genreService } from "../../services/genreService";

export default function EditGenreModal({ genre, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: genre.name || "",
    description: genre.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Genre name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await genreService.updateGenre(genre.id, formData);
      onSuccess(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update genre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Genre</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="modal-actions">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={onClose} disabled={loading} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
