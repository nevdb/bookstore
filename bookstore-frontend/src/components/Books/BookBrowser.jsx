import React, { useEffect, useRef, useState } from "react";
import BookCard from "./BookCard";
import BookSearch from "./BookSearch";
import BookFilter from "./BookFilter";
import { useBooks } from "../../hooks/useBooks";
import "./BookBrowser.css";

const BookBrowser = ({ isAdmin = false, onEditBook, onDeleteBook }) => {
  const { books, loading, error, pagination, fetchBooks, sortBooks, sort } =
    useBooks();
  const [currentPage, setCurrentPage] = useState(1);
  // Prevents the page-change useEffect from double-firing when sort changes
  const skipNextEffect = useRef(false);

  // Load books on mount and when page changes
  useEffect(() => {
    if (skipNextEffect.current) {
      skipNextEffect.current = false;
      return;
    }
    if (sort.sort_by) {
      sortBooks(sort.sort_by, sort.sort_dir, currentPage);
    } else {
      fetchBooks(currentPage);
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (e) => {
    const [sortBy, sortDir] = e.target.value.split(":");
    skipNextEffect.current = true; // suppress the useEffect triggered by setCurrentPage
    setCurrentPage(1);
    if (sortBy === "") {
      fetchBooks(1);
    } else {
      sortBooks(sortBy, sortDir, 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (!pagination.last_page || pagination.last_page === 1) {
      return null;
    }

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(
      pagination.last_page,
      startPage + maxPagesToShow - 1,
    );

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-button"
        >
          ← Previous
        </button>,
      );
    }

    // Page numbers
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-number"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots-start" className="pagination-dots">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-number ${i === currentPage ? "active" : ""}`}
        >
          {i}
        </button>,
      );
    }

    // Next button
    if (currentPage < pagination.last_page) {
      if (endPage < pagination.last_page) {
        if (endPage < pagination.last_page - 1) {
          pages.push(
            <span key="dots-end" className="pagination-dots">
              ...
            </span>,
          );
        }
        pages.push(
          <button
            key={pagination.last_page}
            onClick={() => handlePageChange(pagination.last_page)}
            className="pagination-number"
          >
            {pagination.last_page}
          </button>,
        );
      }
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-button"
        >
          Next →
        </button>,
      );
    }

    return pages;
  };

  if (error) {
    return (
      <div className="book-browser">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-browser">
      <div className="browser-header">
        <h1>Browse Our Library</h1>
        <p className="browser-subtitle">Discover thousands of books</p>
      </div>

      <div className="browser-controls">
        <BookSearch />
        <BookFilter />
        <div className="sort-control">
          <select
            value={sort.sort_by ? `${sort.sort_by}:${sort.sort_dir}` : ""}
            onChange={handleSortChange}
            className="sort-select"
            aria-label="Sort books"
          >
            <option value="">Sort: Default</option>
            <option value="title:asc">Title A → Z</option>
            <option value="title:desc">Title Z → A</option>
            <option value="year:asc">Year: Oldest first</option>
            <option value="year:desc">Year: Newest first</option>
          </select>
        </div>
      </div>

      {loading && books.length === 0 ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="no-results">
          <p>No books found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="books-stats">
            <p>
              Showing {books.length} of {pagination.total || 0} books
            </p>
          </div>
          <div className="books-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAdmin={isAdmin}
                onEdit={onEditBook}
                onDelete={onDeleteBook}
              />
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination">{renderPagination()}</div>
          )}
        </>
      )}
    </div>
  );
};

export default BookBrowser;
