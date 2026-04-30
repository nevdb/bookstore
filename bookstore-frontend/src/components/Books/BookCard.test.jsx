import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BookCard from './BookCard';

// ─── Mock ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseBook = {
  id: 42,
  title: 'The Great Gatsby',
  author: { name: 'F. Scott Fitzgerald' },
  genre: { name: 'Classic' },
  publication_year: 1925,
  cover_url: null,
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <BookCard book={baseBook} {...props} />
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BookCard', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the book title', () => {
    renderCard();
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
  });

  it('renders the author name', () => {
    renderCard();
    expect(screen.getByText(/f\. scott fitzgerald/i)).toBeInTheDocument();
  });

  it('renders the genre name', () => {
    renderCard();
    expect(screen.getByText('Classic')).toBeInTheDocument();
  });

  it('renders the publication year', () => {
    renderCard();
    expect(screen.getByText('1925')).toBeInTheDocument();
  });

  it('renders a default cover image when cover_url is null', () => {
    renderCard();
    const img = screen.getByAltText('Missing cover');
    expect(img).toHaveAttribute('src', '/default-book.png');
  });

  it('renders the cover image when cover_url is provided', () => {
    renderCard({ book: { ...baseBook, cover_url: 'http://example.com/cover.jpg' } });
    const img = screen.getByAltText('The Great Gatsby');
    expect(img).toHaveAttribute('src', 'http://example.com/cover.jpg');
  });

  it('does not render author section when author is absent', () => {
    renderCard({ book: { ...baseBook, author: null } });
    expect(screen.queryByText(/f\. scott fitzgerald/i)).not.toBeInTheDocument();
  });

  it('does not render genre section when genre is absent', () => {
    renderCard({ book: { ...baseBook, genre: null } });
    expect(screen.queryByText('Classic')).not.toBeInTheDocument();
  });

  // ── Navigation ────────────────────────────────────────────────────────────────

  it('navigates to the book detail page when clicked', async () => {
    renderCard();
    await userEvent.click(screen.getByText('The Great Gatsby'));
    expect(mockNavigate).toHaveBeenCalledWith('/books/42');
  });

  // ── Admin controls ────────────────────────────────────────────────────────────

  it('does not show Edit/Delete buttons by default (isAdmin=false)', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows Edit and Delete buttons when isAdmin=true', () => {
    renderCard({ isAdmin: true, onEdit: vi.fn(), onDelete: vi.fn() });
    expect(screen.getByRole('button', { name: /edit the great gatsby/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete the great gatsby/i })).toBeInTheDocument();
  });

  it('calls onEdit with the book when Edit button is clicked', async () => {
    const onEdit = vi.fn();
    renderCard({ isAdmin: true, onEdit, onDelete: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(baseBook);
  });

  it('calls onDelete with the book when Delete button is clicked', async () => {
    const onDelete = vi.fn();
    renderCard({ isAdmin: true, onEdit: vi.fn(), onDelete });

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith(baseBook);
  });

  it('does not navigate when Edit button is clicked', async () => {
    renderCard({ isAdmin: true, onEdit: vi.fn(), onDelete: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when Delete button is clicked', async () => {
    renderCard({ isAdmin: true, onEdit: vi.fn(), onDelete: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
