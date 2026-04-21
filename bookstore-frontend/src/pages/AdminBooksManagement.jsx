import { useState } from "react";
import BookCreateForm from "../components/Books/BookCreateForm";
import BookBrowser from "../components/Books/BookBrowser";
import { BooksProvider } from "../context/BooksContext";
import "./AdminBooksManagement.css";

export default function AdminBooksManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = (newBook) => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of book list
    alert(`Book "${newBook.title}" created successfully!`);
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  const handleEditBook = (book) => {
    // TODO: Implement edit functionality
    alert(`Edit functionality for "${book.title}" will be implemented next`);
  };

  const handleDeleteBook = (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
      // TODO: Implement delete functionality
      alert(`Delete functionality for "${book.title}" will be implemented next`);
    }
  };

  return (
    <div className="admin-books-management">
      <div className="management-header">
        <h1>Book Management</h1>
        <p>Manage the system book library</p>
        <button
          className="create-book-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New Book
        </button>
      </div>

      {showCreateForm && (
        <BookCreateForm
          onSuccess={handleCreateSuccess}
          onCancel={handleCreateCancel}
        />
      )}

      <BooksProvider>
        <BookBrowser
          key={refreshKey}
          isAdmin={true}
          onEditBook={handleEditBook}
          onDeleteBook={handleDeleteBook}
        />
      </BooksProvider>
    </div>
  );
}
