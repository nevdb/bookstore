import React from "react";
import { useNavigate } from "react-router-dom";
import "./BookCard.css";

const BookCard = ({ book, isAdmin = false, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Don't navigate if clicking on admin buttons
    if (e.target.closest('.admin-actions')) {
      return;
    }
    navigate(`/books/${book.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(book);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(book);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-card-image">
        {!book.cover_url ? (
          <img src="/default-book.png" alt="Missing cover" loading="lazy" />
        ) : (
          <img
            src={book.cover_url || "/default-book.png"}
            alt={book.title}
            loading="lazy"
            onError={(e) => (e.target.src = "/default-book.png")}
          />
        )}
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        {book.author && (
          <p className="book-card-author">by {book.author.name}</p>
        )}
        {book.genre && <p className="book-card-genre">{book.genre.name}</p>}
        {book.publication_year && (
          <p className="book-card-year">{book.publication_year}</p>
        )}
        {isAdmin && (
          <div className="admin-actions">
            <button className="edit-btn" onClick={handleEdit} aria-label={`Edit ${book.title}`}>
              Edit
            </button>
            <button className="delete-btn" onClick={handleDelete} aria-label={`Delete ${book.title}`}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BookCard);
