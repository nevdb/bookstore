import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksService } from "../services/booksService";
import "./BookDetailPage.css";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await booksService.getBook(id);
        setBook(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load book details");
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="book-detail-loading">
          <div className="spinner"></div>
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <button onClick={() => navigate("/books")} className="back-button">
          ← Back to Library
        </button>
        <div className="book-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/books")} className="cta-button">
            Return to Books
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <button onClick={() => navigate("/books")} className="back-button">
          ← Back to Library
        </button>
        <div className="book-detail-not-found">
          <h2>Book Not Found</h2>
          <p>The book you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/books")} className="cta-button">
            Return to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <button onClick={() => navigate("/books")} className="back-button">
        ← Back to Library
      </button>

      <div className="book-detail-container">
        <div className="book-detail-cover">
          <img
            src={book.cover_url || "/default-book.png"}
            alt={book.title}
            onError={(e) => (e.target.src = "/default-book.png")}
          />
        </div>

        <div className="book-detail-info">
          <h1 className="book-detail-title">{book.title}</h1>

          {book.author && (
            <div className="book-detail-field">
              <label>Author</label>
              <p className="book-detail-value">{book.author.name}</p>
            </div>
          )}

          {book.genre && (
            <div className="book-detail-field">
              <label>Genre</label>
              <p className="book-detail-value">{book.genre.name}</p>
            </div>
          )}

          {book.publication_year && (
            <div className="book-detail-field">
              <label>Publication Year</label>
              <p className="book-detail-value">{book.publication_year}</p>
            </div>
          )}

          {book.isbn && (
            <div className="book-detail-field">
              <label>ISBN</label>
              <p className="book-detail-value">{book.isbn}</p>
            </div>
          )}

          {book.pages && (
            <div className="book-detail-field">
              <label>Pages</label>
              <p className="book-detail-value">{book.pages}</p>
            </div>
          )}

          {book.description && (
            <div className="book-detail-field book-detail-description">
              <label>Description</label>
              <p className="book-detail-value">{book.description}</p>
            </div>
          )}

          {book.author &&
            (book.author.biography ||
              book.author.date_of_birth ||
              book.author.place_of_birth) && (
              <div className="book-detail-author-section">
                <h2>About the Author</h2>
                <div className="author-details">
                  <p className="author-name">{book.author.name}</p>

                  {book.author.place_of_birth && (
                    <p className="author-info">
                      <strong>Birthplace:</strong> {book.author.place_of_birth}
                    </p>
                  )}

                  {book.author.date_of_birth && (
                    <p className="author-info">
                      <strong>Born:</strong> {book.author.date_of_birth}
                    </p>
                  )}

                  {book.author.date_of_death && (
                    <p className="author-info">
                      <strong>Died:</strong> {book.author.date_of_death}
                    </p>
                  )}

                  {book.author.biography && (
                    <p className="author-bio">{book.author.biography}</p>
                  )}
                </div>
              </div>
            )}

          <div className="book-detail-actions">
            <button className="add-to-collection-button">
              + Add to My Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
