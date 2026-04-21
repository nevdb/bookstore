import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminBooksManagement from './AdminBooksManagement';

// Stub child components that fetch data so the test stays unit-level
vi.mock('../components/Books/BookBrowser', () => ({
  default: () => <div data-testid="book-browser">BookBrowser</div>,
}));

vi.mock('../context/BooksContext', () => ({
  BooksProvider: ({ children }) => <div>{children}</div>,
  useBooks: vi.fn(() => ({
    books: [],
    loading: false,
    error: null,
    pagination: {},
    fetchBooks: vi.fn(),
  })),
}));

vi.mock('../components/Books/BookCreateForm', () => ({
  default: ({ onCancel }) => (
    <div data-testid="book-create-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('../components/Books/EditBookForm', () => ({
  default: () => <div data-testid="edit-book-form">EditBookForm</div>,
}));

vi.mock('../components/AdminPanel/DeleteBookModal', () => ({
  default: () => <div data-testid="delete-book-modal">DeleteBookModal</div>,
}));

describe('AdminBooksManagement page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Book Management heading', () => {
    render(<AdminBooksManagement />);
    expect(screen.getByRole('heading', { name: 'Book Management' })).toBeInTheDocument();
  });

  it('renders the "Create New Book" button', () => {
    render(<AdminBooksManagement />);
    expect(screen.getByRole('button', { name: /create new book/i })).toBeInTheDocument();
  });

  it('does not show the create form by default', () => {
    render(<AdminBooksManagement />);
    expect(screen.queryByTestId('book-create-form')).not.toBeInTheDocument();
  });

  it('shows the create form when "Create New Book" button is clicked', () => {
    render(<AdminBooksManagement />);
    fireEvent.click(screen.getByRole('button', { name: /create new book/i }));
    expect(screen.getByTestId('book-create-form')).toBeInTheDocument();
  });

  it('hides the create form when cancel is clicked', () => {
    render(<AdminBooksManagement />);
    fireEvent.click(screen.getByRole('button', { name: /create new book/i }));
    expect(screen.getByTestId('book-create-form')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByTestId('book-create-form')).not.toBeInTheDocument();
  });

  it('renders the BookBrowser component', () => {
    render(<AdminBooksManagement />);
    expect(screen.getByTestId('book-browser')).toBeInTheDocument();
  });
});
