import API from './api';

export const booksService = {
    // Get all books (supports sort_by and sort_dir params)
    getBooks: (page = 1, perPage = 15, sortBy = '', sortDir = 'asc') => {
        const params = new URLSearchParams({ page, per_page: perPage });
        if (sortBy) {
            params.set('sort_by', sortBy);
            params.set('sort_dir', sortDir);
        }
        return API.get(`/api/books?${params.toString()}`);
    },

    // Get single book
    getBook: (bookId) =>
        API.get(`/api/books/${bookId}`),

    // Create new book (admin only)
    createBook: (data) =>
        API.post(`/api/books`, data),

    // Update book (admin only)
    updateBook: (bookId, data) =>
        API.put(`/api/books/${bookId}`, data),

    // Delete book (admin only)
    deleteBook: (bookId) =>
        API.delete(`/api/books/${bookId}`),

    // Search books by title, author, or genre
    searchBooks: (query) =>
        API.get(`/api/books/search?q=${encodeURIComponent(query)}`),

    // Filter books by author, genre, or rating
    filterBooks: (filters) => {
        const queryParams = new URLSearchParams(filters).toString();
        return API.get(`/api/books/filter?${queryParams}`);
    },
};
