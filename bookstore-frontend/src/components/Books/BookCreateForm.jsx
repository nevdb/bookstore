import { useState, useEffect } from "react";
import { booksService } from "../../services/booksService";
import { authorService } from "../../services/authorService";
import { genreService } from "../../services/genreService";
import CreateAuthorModal from "../AdminPanel/CreateAuthorModal";
import CreateGenreModal from "../AdminPanel/CreateGenreModal";
import "./BookCreateForm.css";

export default function BookCreateForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publication_year: "",
    description: "",
    pages: "",
    genre_id: "",
    author_id: "",
  });

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);

  useEffect(() => {
    fetchAuthors();
    fetchGenres();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await authorService.getAuthors();
      console.log("Authors response:", response.data);
      setAuthors(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch authors:", err);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await genreService.getGenres();
      console.log("Genres response:", response.data);
      setGenres(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch genres:", err);
    }
  };

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

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.publication_year) {
      setError("Publication year is required");
      return;
    }
    if (!formData.genre_id) {
      setError("Please select a genre");
      return;
    }
    if (!formData.author_id) {
      setError("Please select an author");
      return;
    }

    setLoading(true);

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      isbn: formData.isbn.trim() || null,
      publication_year: formData.publication_year ? parseInt(formData.publication_year, 10) : null,
      description: formData.description.trim() || null,
      pages: formData.pages ? parseInt(formData.pages, 10) : null,
      genre_id: parseInt(formData.genre_id, 10),
      author_id: parseInt(formData.author_id, 10),
    };

    // Remove null values to avoid sending empty strings
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === null || submitData[key] === '') {
        delete submitData[key];
      }
    });

    console.log("Submitting book data:", submitData); // Debug log

    try {
      const response = await booksService.createBook(submitData);
      console.log("Book created successfully:", response.data); // Debug log
      onSuccess(response.data);
    } catch (err) {
      console.error("Error creating book:", err); // Debug log
      setError(err.response?.data?.message || "Failed to create book");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorCreated = (newAuthor) => {
    setAuthors((prev) => [...prev, newAuthor]);
    setFormData((prev) => ({ ...prev, author_id: newAuthor.id }));
    setShowAuthorModal(false);
  };

  const handleGenreCreated = (newGenre) => {
    setGenres((prev) => [...prev, newGenre]);
    setFormData((prev) => ({ ...prev, genre_id: newGenre.id }));
    setShowGenreModal(false);
  };

  return (
    <div className="book-create-form">
      <div className="form-header">
        <h2>Create New Book</h2>
        <p>Add a new book to the system library</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter book title"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="Enter ISBN (optional)"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="publication_year">Publication Year *</label>
            <input
              id="publication_year"
              name="publication_year"
              type="number"
              value={formData.publication_year}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
              min="1000"
              max={new Date().getFullYear()}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pages">Page Count</label>
            <input
              id="pages"
              name="pages"
              type="number"
              value={formData.pages}
              onChange={handleInputChange}
              placeholder="Number of pages (optional)"
              min="1"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="genre_id">Genre *</label>
          <div className="select-with-create">
            <select
              id="genre_id"
              name="genre_id"
              value={formData.genre_id}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select a genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="create-new-btn"
              onClick={() => setShowGenreModal(true)}
              disabled={loading}
            >
              + New Genre
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="author_id">Author *</label>
          <div className="select-with-create">
            <select
              id="author_id"
              name="author_id"
              value={formData.author_id}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select an author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="create-new-btn"
              onClick={() => setShowAuthorModal(true)}
              disabled={loading}
            >
              + New Author
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter book description (optional)"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            onClick={(e) => {
              console.log("Submit button clicked");
              console.log("Form data:", formData);
            }}
          >
            {loading ? "Creating..." : "Create Book"}
          </button>
        </div>
      </form>

      {showAuthorModal && (
        <CreateAuthorModal
          onClose={() => setShowAuthorModal(false)}
          onSuccess={handleAuthorCreated}
        />
      )}

      {showGenreModal && (
        <CreateGenreModal
          onClose={() => setShowGenreModal(false)}
          onSuccess={handleGenreCreated}
        />
      )}
    </div>
  );
}
