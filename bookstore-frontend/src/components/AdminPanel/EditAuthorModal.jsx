import React, { useState } from "react";
import { authorService } from "../../services/authorService";

export default function EditAuthorModal({ author, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: author.name || "",
    date_of_birth: author.date_of_birth || "",
    date_of_death: author.date_of_death || "",
    place_of_birth: author.place_of_birth || "",
    biography: author.biography || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Author name is required");
      return;
    }
    if (!formData.place_of_birth.trim()) {
      setError("Place of birth is required");
      return;
    }
    setLoading(true);
    try {
      const response = await authorService.updateAuthor(author.id, formData);
      onSuccess(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Author</h3>
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
            <label htmlFor="date_of_birth">Date of Birth</label>

            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="date_of_death">Date of Death</label>

            <input
              id="date_of_death"
              name="date_of_death"
              type="date"
              value={formData.date_of_death}
              onChange={(e) =>
                setFormData({ ...formData, date_of_death: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="place_of_birth">Place of Birth</label>

            <input
              id="place_of_birth"
              name="place_of_birth"
              value={formData.place_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, place_of_birth: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="biography">Biography</label>
            <textarea
              id="biography"
              name="biography"
              value={formData.biography}
              onChange={(e) =>
                setFormData({ ...formData, biography: e.target.value })
              }
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="primary-btn">
              Save Changes
            </button>
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
