import axios from 'axios';

const API_URL = 'http://localhost:8000/api/user/collection';

const collectionService = {
    // Get user's collection
    getCollection: (page = 1, perPage = 12) => {
        return axios.get(`${API_URL}?page=${page}&per_page=${perPage}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        }).then(res => res.data);
    },

    // Add book to collection
    addBook: (bookId, status = 'to-read', rating = null, notes = null) => {
        return axios.post(`${API_URL}`, {
            book_id: bookId,
            status,
            personal_rating: rating,
            notes
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        }).then(res => res.data);
    },

    // Update collection item
    updateBook: (userBookId, data) => {
        return axios.put(`${API_URL}/${userBookId}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        }).then(res => res.data);
    },

    // Remove book from collection
    removeBook: (userBookId) => {
        return axios.delete(`${API_URL}/${userBookId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        }).then(res => res.data);
    }
};

export default collectionService;