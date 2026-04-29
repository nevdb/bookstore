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
  const [sort, setSort] = useState({ sort_by: '', sort_dir: 'asc' });

  // Fetch all books
  const fetchBooks = useCallback(async (page = 1, perPage = 12) => {
    setLoading(true);
    setError(null);
    try {
      const response = await booksService.getBooks(page, perPage);
      setBooks(response.data.data || []);
      
      // Extract pagination data from response (Laravel paginate() structure)
      const paginationData = {
        total: response.data.total || 0,
        per_page: response.data.per_page || 12,
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
      };
      setPagination(paginationData);
      
      setSearchQuery("");
      setFilters({});
      setSort({ sort_by: '', sort_dir: 'asc' });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch books");
      setBooks([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Sort books (re-fetches with sort params, clears search/filters)
  const sortBooks = useCallback(async (sortBy, sortDir = 'asc', page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await booksService.getBooks(page, 12, sortBy, sortDir);
      setBooks(response.data.data || []);
      setPagination({
        total: response.data.total || 0,
        per_page: response.data.per_page || 12,
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
      });
      setSort({ sort_by: sortBy, sort_dir: sortDir });
      setSearchQuery("");
      setFilters({});
    } catch (err) {
      setError(err.response?.data?.message || "Sort failed");
      setBooks([]);
      setPagination({});
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
        setBooks(response.data.data || []);
        
        // Extract pagination data from response
        const paginationData = {
          total: response.data.total || 0,
          per_page: response.data.per_page || 12,
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
        };
        setPagination(paginationData);
        
        setSearchQuery(query);
        setFilters({});
      } catch (err) {
        setError(err.response?.data?.message || "Search failed");
        setBooks([]);
        setPagination({});
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
      setBooks(response.data.data || []);
      
      // Extract pagination data from response
      const paginationData = {
        total: response.data.total || 0,
        per_page: response.data.per_page || 12,
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
      };
      setPagination(paginationData);
      
      setFilters(newFilters);
      setSearchQuery("");
    } catch (err) {
      setError(err.response?.data?.message || "Filter failed");
      setBooks([]);
      setPagination({});
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
    sort,
    fetchBooks,
    searchBooks,
    filterBooks,
    sortBooks,
  };

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
};
