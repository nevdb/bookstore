import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-card-image">
        <img 
          src={book.cover_url || '/default-book.png'} 
          alt={book.title}
          onError={(e) => e.target.src = '/default-book.png'}
        />
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        {book.author && (
          <p className="book-card-author">by {book.author.name}</p>
        )}
        {book.genre && (
          <p className="book-card-genre">{book.genre.name}</p>
        )}
        {book.publication_year && (
          <p className="book-card-year">{book.publication_year}</p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
