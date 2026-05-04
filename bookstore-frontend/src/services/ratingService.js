import API from './api';

const ratingService = {
    // Get average rating, count and (if authenticated) user's own rating for a book
    getBookRatings: (bookId) =>
        API.get(`/api/books/${bookId}/ratings`),

    // Submit or update the authenticated user's rating for a book
    rateBook: (bookId, rating) =>
        API.post(`/api/books/${bookId}/ratings`, { rating }),
};

export default ratingService;
