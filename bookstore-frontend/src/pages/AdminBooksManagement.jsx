import { useState, useRef, useEffect } from "react";
import BookCreateForm from "../components/Books/BookCreateForm";
import EditBookForm from "../components/Books/EditBookForm";
import DeleteBookModal from "../components/AdminPanel/DeleteBookModal";
import BookBrowser from "../components/Books/BookBrowser";
import { BooksProvider } from "../context/BooksContext";
import "./AdminBooksManagement.css";

export default function AdminBooksManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const editFormRef = useRef(null);

  useEffect(() => {
    if (editingBook && editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [editingBook]);

  const handleCreateSuccess = (newBook) => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
  };

  const handleEditSuccess = (updatedBook) => {
    setEditingBook(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEditCancel = () => {
    setEditingBook(null);
  };

  const handleDeleteBook = (book) => {
    setDeletingBook(book);
  };

  const handleDeleteSuccess = (bookId) => {
    setDeletingBook(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteCancel = () => {
    setDeletingBook(null);
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

      {editingBook && (
        <div ref={editFormRef}>
          <EditBookForm
            book={editingBook}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </div>
      )}

      {deletingBook && (
        <DeleteBookModal
          book={deletingBook}
          onClose={handleDeleteCancel}
          onSuccess={handleDeleteSuccess}
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
