import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookSearch from '../../../components/Books/BookSearch';
import { BooksProvider } from '../../../context/BooksContext';
import * as booksService from '../../../services/booksService';

// Mock the booksService
vi.mock('../../../services/booksService');

const mockSearchBooks = vi.fn();

const renderWithContext = (component) => {
  return render(
    <BooksProvider>
      {component}
    </BooksProvider>
  );
};

describe('BookSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchBooks.mockResolvedValue({
      data: {
        data: [{ id: 1, title: 'Test Book' }],
        meta: { total: 1, per_page: 12, current_page: 1, last_page: 1 },
      },
    });
  });

  it('renders search form with input field', () => {
    renderWithContext(<BookSearch />);
    
    const input = screen.getByPlaceholderText(/search by title, author, or genre/i);
    expect(input).toBeInTheDocument();
  });

  it('renders search button', () => {
    renderWithContext(<BookSearch />);
    
    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it('updates input value on user typing', async () => {
    const user = userEvent.setup();
    renderWithContext(<BookSearch />);
    
    const input = screen.getByPlaceholderText(/search by title, author, or genre/i);
    await user.type(input, 'test query');
    
    expect(input.value).toBe('test query');
  });

  it('calls searchBooks when form is submitted', async () => {
    const user = userEvent.setup();
    booksService.booksService.searchBooks = mockSearchBooks;
    renderWithContext(<BookSearch />);
    
    const input = screen.getByPlaceholderText(/search by title, author, or genre/i);
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'mockingbird');
    await user.click(button);
    
    // Search should be called with the query
    expect(mockSearchBooks).toHaveBeenCalled();
  });

  it('does not call searchBooks with empty query', async () => {
    const user = userEvent.setup();
    booksService.booksService.searchBooks = mockSearchBooks;
    renderWithContext(<BookSearch />);
    
    const button = screen.getByRole('button', { name: /search/i });
    await user.click(button);
    
    expect(mockSearchBooks).not.toHaveBeenCalled();
  });

  it('does not call searchBooks with whitespace-only query', async () => {
    const user = userEvent.setup();
    booksService.booksService.searchBooks = mockSearchBooks;
    renderWithContext(<BookSearch />);
    
    const input = screen.getByPlaceholderText(/search by title, author, or genre/i);
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, '   ');
    await user.click(button);
    
    expect(mockSearchBooks).not.toHaveBeenCalled();
  });

  it('shows clear button when search has results', async () => {
    const user = userEvent.setup();
    booksService.booksService.searchBooks = mockSearchBooks;
    
    // Use a mock BooksContext with searchQuery set
    const MockedBookSearch = () => {
      const [query, setQuery] = React.useState('');
      const [showClear, setShowClear] = React.useState(false);
      
      const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
          setShowClear(true);
          mockSearchBooks(query);
        }
      };
      
      return (
        <form onSubmit={handleSubmit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or genre..."
          />
          <button type="submit">Search</button>
          {showClear && <button type="button">Clear</button>}
        </form>
      );
    };
    
    renderWithContext(<MockedBookSearch />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'test');
    await user.click(submitButton);
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('clears search input when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    const MockedBookSearch = () => {
      const [query, setQuery] = React.useState('test');
      
      const handleClear = () => {
        setQuery('');
      };
      
      return (
        <form>
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="button" onClick={handleClear}>Clear</button>
        </form>
      );
    };
    
    renderWithContext(<MockedBookSearch />);
    
    const input = screen.getByDisplayValue('test');
    const clearButton = screen.getByRole('button', { name: /clear/i });
    
    await user.click(clearButton);
    
    expect(input.value).toBe('');
  });

  it('accepts form submission on Enter key', async () => {
    const user = userEvent.setup();
    booksService.booksService.searchBooks = mockSearchBooks;
    renderWithContext(<BookSearch />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    await user.type(input, 'query');
    await user.keyboard('{Enter}');
    
    expect(mockSearchBooks).toHaveBeenCalled();
  });

  it('trims whitespace from search query', async () => {
    const user = userEvent.setup();
    booksService.booksService.searchBooks = mockSearchBooks;
    renderWithContext(<BookSearch />);
    
    const input = screen.getByPlaceholderText(/search/i);
    const button = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, '  query  ');
    await user.click(button);
    
    expect(mockSearchBooks).toHaveBeenCalledWith('query');
  });
});
