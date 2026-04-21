import React, { useState, useEffect } from "react";
import { booksService } from "../../services/booksService";
import { useBooks } from "../../hooks/useBooks";
import "./BookFilter.css";

const BookFilter = () => {
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [loadingFilters, setLoadingFilters] = useState(false);

  const { filterBooks, filters } = useBooks();

  // Fetch genres and authors for filter dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilters(true);
      try {
        // We'll assume these endpoints exist or create generic ones
        // For now, fetch from the existing book list and extract unique genres/authors
        const response = await booksService.getBooks(1, 100);

        const genresMap = new Map();
        const authorsMap = new Map();

        response.data.data.forEach((book) => {
          if (book.genre) {
            genresMap.set(book.genre.id, book.genre);
          }
          if (book.author) {
            authorsMap.set(book.author.id, book.author);
          }
        });

        setGenres(Array.from(genresMap.values()));
        setAuthors(Array.from(authorsMap.values()));
      } catch (err) {
        console.error("Failed to load filter options:", err);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update selected filters when filters change
  useEffect(() => {
    setSelectedGenre(filters.genre_id || "");
    setSelectedAuthor(filters.author_id || "");
  }, [filters]);

  const handleGenreChange = (e) => {
    const newGenre = e.target.value;
    setSelectedGenre(newGenre);
    const newFilters = {};
    if (newGenre) newFilters.genre_id = newGenre;
    if (selectedAuthor) newFilters.author_id = selectedAuthor;
    filterBooks(newFilters);
  };

  const handleAuthorChange = (e) => {
    const newAuthor = e.target.value;
    setSelectedAuthor(newAuthor);
    const newFilters = {};
    if (selectedGenre) newFilters.genre_id = selectedGenre;
    if (newAuthor) newFilters.author_id = newAuthor;
    filterBooks(newFilters);
  };

  const handleClearFilters = () => {
    setSelectedGenre("");
    setSelectedAuthor("");
    filterBooks({});
  };

  return (
    <div className="book-filter">
      <div className="filter-controls">
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="filter-select"
          disabled={loadingFilters}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <select
          value={selectedAuthor}
          onChange={handleAuthorChange}
          className="filter-select"
          disabled={loadingFilters}
        >
          <option value="">All Authors</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>

        {(selectedGenre || selectedAuthor) && (
          <button onClick={handleClearFilters} className="filter-clear-button">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default BookFilter;
