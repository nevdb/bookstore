import React, { useState } from "react";
import { useBooks } from "../../hooks/useBooks";
import "./BookSearch.css";

const BookSearch = () => {
  const [query, setQuery] = useState("");
  const { searchBooks, searchQuery } = useBooks();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchBooks(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="book-search">
      <input
        type="text"
        placeholder="Search by title, author, or genre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="book-search-input"
      />
      <button type="submit" className="book-search-button">
        Search
      </button>
      {searchQuery && (
        <button
          type="button"
          className="book-search-clear"
          onClick={handleClear}
        >
          Clear
        </button>
      )}
    </form>
  );
};

export default BookSearch;
