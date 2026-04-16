import React, { createContext, useState, useCallback } from "react";
import { booksService } from "../services/booksService";

export const BooksContext = createContext();

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});

  // Fetch all books
  const fetchBooks = useCallback(async (page = 1, perPage = 12) => {
    setLoading(true);
    setError(null);
    try {
      const response = await booksService.getBooks(page, perPage);
      setBooks(response.data.data || response.data);
      setPagination(response.data.meta || {});
      setSearchQuery("");
      setFilters({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch books");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search books
  const searchBooks = useCallback(
    async (query, page = 1) => {
      if (!query.trim()) {
        fetchBooks(page);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await booksService.searchBooks(query);
        setBooks(response.data.data || response.data);
        setPagination(response.data.meta || {});
        setSearchQuery(query);
        setFilters({});
      } catch (err) {
        setError(err.response?.data?.message || "Search failed");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchBooks],
  );

  // Filter books
  const filterBooks = useCallback(async (newFilters, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await booksService.filterBooks({
        ...newFilters,
        page,
      });
      setBooks(response.data.data || response.data);
      setPagination(response.data.meta || {});
      setFilters(newFilters);
      setSearchQuery("");
    } catch (err) {
      setError(err.response?.data?.message || "Filter failed");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    books,
    loading,
    error,
    pagination,
    searchQuery,
    filters,
    fetchBooks,
    searchBooks,
    filterBooks,
  };

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
};
