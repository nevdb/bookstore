import API from './api';

export const genreService = {
    // Get all genres
    getGenres: (page = 1, perPage = 50) =>
        API.get(`/api/genres?page=${page}&per_page=${perPage}`),

    // Get single genre
    getGenre: (genreId) =>
        API.get(`/api/genres/${genreId}`),

    // Create new genre (admin only)
    createGenre: (data) =>
        API.post(`/api/genres`, data),

    // Update genre (admin only)
    updateGenre: (genreId, data) =>
        API.put(`/api/genres/${genreId}`, data),

    // Delete genre (admin only)
    deleteGenre: (genreId) =>
        API.delete(`/api/genres/${genreId}`),

    // Get books in genre
    getGenreBooks: (genreId) =>
        API.get(`/api/genres/${genreId}/books`),
};