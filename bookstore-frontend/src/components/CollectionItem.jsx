import React, { useState, memo } from "react";
import "./CollectionItem.css";

function CollectionItem({ userBook, onUpdate, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(userBook.personal_rating || 0);
  const [status, setStatus] = useState(userBook.status);
  const [notes, setNotes] = useState(userBook.notes || "");

  const handleSave = () => {
    onUpdate(userBook.id, {
      personal_rating: rating || null,
      status,
      notes: notes || null,
    });
    setIsEditing(false);
  };

  const renderStars = () => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "filled" : ""}
            onClick={() => setRating(star)}
            style={{ cursor: "pointer" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="collection-item">
      <div className="book-info">
        <h3>{userBook.book.title}</h3>
        <p className="author">by {userBook.book.author.name}</p>
        <p className="genre">{userBook.book.genre.name}</p>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label>Rating</label>
            {renderStars()}
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="to-read">To Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts about the book..."
              maxLength="1000"
              rows="4"
            />
            <small>{notes.length}/1000</small>
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="btn-save">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="view-info">
          <div className="rating">
            {userBook.personal_rating
              ? `⭐ ${userBook.personal_rating}/5`
              : "Not rated"}
          </div>
          <div className="status">
            Status: <strong>{userBook.status}</strong>
          </div>
          {userBook.notes && <div className="notes">"{userBook.notes}"</div>}

          <div className="actions">
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              Edit
            </button>
            <button
              onClick={() => onRemove(userBook.id)}
              className="btn-remove"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CollectionItem);
