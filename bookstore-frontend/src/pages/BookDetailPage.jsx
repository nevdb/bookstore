import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { booksService } from "../services/booksService";
import "./BookDetailPage.css";
import collectionService from "../services/collectionService";
import ratingService from "../services/ratingService";
import StarRating from "../components/StarRating/StarRating";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inCollection, setInCollection] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState(null);

  // Rating state
  const [ratingsData, setRatingsData] = useState({ average_rating: null, ratings_count: 0, user_rating: null });
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState(null);

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

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await ratingService.getBookRatings(id);
        setRatingsData(response.data);
      } catch {
        // ratings are non-critical; silently ignore errors
      }
    };
    fetchRatings();
  }, [id, user]);

  const handleRate = async (star) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setIsSubmittingRating(true);
      setRatingMessage(null);
      const response = await ratingService.rateBook(id, star);
      setRatingsData(response.data);
      setRatingMessage({ type: "success", text: "Your rating has been saved!" });
    } catch {
      setRatingMessage({ type: "error", text: "Failed to submit rating. Please try again." });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setIsAdding(true);
      setCollectionMessage(null);
      await collectionService.addBook(book.id);
      setInCollection(true);
      setCollectionMessage({ type: "success", text: "Added to your collection!" });
    } catch (err) {
      if (err.response?.status === 409) {
        setInCollection(true);
        setCollectionMessage({ type: "info", text: "Book already in your collection" });
      } else {
        setCollectionMessage({ type: "error", text: err.response?.data?.message || "Failed to add book" });
      }
    } finally {
      setIsAdding(false);
    }
  };

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
          {!book.cover_url ? (
            <img src="/default-book.png" alt="Missing cover" />
          ) : (
            <img
              src={book.cover_url || "/default-book.png"}
              alt={book.title}
              onError={(e) => (e.target.src = "/default-book.png")}
            />
          )}
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

          <div className="book-detail-rating-section">
            <div className="book-detail-field">
              <label>Community Rating</label>
              <div className="book-rating-display">
                <StarRating value={ratingsData.average_rating ? Math.round(ratingsData.average_rating) : 0} readOnly />
                <span className="book-rating-score">
                  {ratingsData.average_rating !== null
                    ? `${ratingsData.average_rating} / 5`
                    : "No ratings yet"}
                </span>
                {ratingsData.ratings_count > 0 && (
                  <span className="book-rating-count">
                    ({ratingsData.ratings_count} {ratingsData.ratings_count === 1 ? "rating" : "ratings"})
                  </span>
                )}
              </div>
            </div>

            {user && (
              <div className="book-detail-field">
                <label>{ratingsData.user_rating ? "Your Rating" : "Rate This Book"}</label>
                <div className="book-user-rating">
                  <StarRating
                    value={ratingsData.user_rating || 0}
                    onChange={handleRate}
                    size="lg"
                  />
                  {isSubmittingRating && <span className="rating-submitting">Saving…</span>}
                </div>
                {ratingMessage && (
                  <p className={`collection-message collection-message--${ratingMessage.type}`} aria-live="polite">
                    {ratingMessage.text}
                  </p>
                )}
              </div>
            )}

            {!user && (
              <p className="book-rating-login-prompt">
                <button className="link-button" onClick={() => navigate("/login")}>Log in</button>
                {" "}to rate this book.
              </p>
            )}
          </div>

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

          {user && (
            <div className="add-to-collection-wrapper">
              <button
                onClick={handleAddToCollection}
                disabled={inCollection || isAdding}
                className="btn-add-collection"
              >
                {isAdding ? "Adding..." : inCollection ? "✓ In Your Collection" : "+ Add to Collection"}
              </button>
              {collectionMessage && (
                <p className={`collection-message collection-message--${collectionMessage.type}`} aria-live="polite">
                  {collectionMessage.text}
                </p>
              )}
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
