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
      console.log("API Response:", response.data); // Debug
      setBooks(response.data.data || []);
      
      // Extract pagination data from response (Laravel paginate() structure)
      const paginationData = {
        total: response.data.total || 0,
        per_page: response.data.per_page || 12,
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
      };
      console.log("Pagination Data:", paginationData); // Debug
      setPagination(paginationData);
      
      setSearchQuery("");
      setFilters({});
    } catch (err) {
      console.error("Error fetching books:", err); // Debug
      setError(err.response?.data?.message || "Failed to fetch books");
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
        console.log("Search Response:", response.data); // Debug
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
        console.error("Error searching books:", err); // Debug
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
      console.log("Filter Response:", response.data); // Debug
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
      console.error("Error filtering books:", err); // Debug
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
    fetchBooks,
    searchBooks,
    filterBooks,
  };

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
};
