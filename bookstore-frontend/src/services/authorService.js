import API from './api';

export const authorService = {
    // Get all authors
    getAuthors: (page = 1, perPage = 50) =>
        API.get(`/api/authors?page=${page}&per_page=${perPage}`),

    // Get single author
    getAuthor: (authorId) =>
        API.get(`/api/authors/${authorId}`),

    // Create new author (admin only)
    createAuthor: (data) =>
        API.post(`/api/authors`, data),

    // Update author (admin only)
    updateAuthor: (authorId, data) =>
        API.put(`/api/authors/${authorId}`, data),

    // Delete author (admin only)
    deleteAuthor: (authorId) =>
        API.delete(`/api/authors/${authorId}`),

    // Get books by author
    getAuthorBooks: (authorId) =>
        API.get(`/api/authors/${authorId}/books`),
};