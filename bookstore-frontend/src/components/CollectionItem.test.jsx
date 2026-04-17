import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionItem from './CollectionItem';

describe('CollectionItem', () => {
  const mockUserBook = {
    id: 1,
    book: {
      id: 1,
      title: 'The Great Gatsby',
      author: { name: 'F. Scott Fitzgerald' },
      genre: { name: 'Fiction' }
    },
    personal_rating: 5,
    status: 'completed',
    notes: 'An amazing classic novel'
  };

  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders book information in view mode', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
  });

  it('displays rating in view mode', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('⭐ 5/5')).toBeInTheDocument();
  });

  it('displays reading status', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Status: completed')).toBeInTheDocument();
  });

  it('displays notes', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('"An amazing classic novel"')).toBeInTheDocument();
  });

  it('shows "Not rated" when no rating', () => {
    const unratedBook = {
      ...mockUserBook,
      personal_rating: null
    };

    render(
      <CollectionItem
        userBook={unratedBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Not rated')).toBeInTheDocument();
  });

  it('shows Edit and Remove buttons in view mode', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
  });

  it('switches to edit mode when Edit button clicked', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('combobox')).toBeInTheDocument(); // status select
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // notes textarea
  });

  it('displays star rating selector in edit mode', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const stars = screen.getAllByText('★');
    expect(stars.length).toBe(5);
  });

  it('can change rating by clicking stars', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const stars = screen.getAllByText('★');
    fireEvent.click(stars[2]); // Click third star (3/5)

    // After clicking, expect the filled stars to update
    expect(stars[0]).toHaveClass('filled');
    expect(stars[1]).toHaveClass('filled');
    expect(stars[2]).toHaveClass('filled');
  });

  it('can change reading status', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'reading' } });

    expect(statusSelect.value).toBe('reading');
  });

  it('can edit notes', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const notesTextarea = screen.getByRole('textbox');
    fireEvent.change(notesTextarea, { target: { value: 'Updated notes' } });

    expect(notesTextarea.value).toBe('Updated notes');
  });

  it('calls onUpdate when Save button clicked', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      mockUserBook.id,
      expect.objectContaining({
        personal_rating: 5,
        status: 'completed'
      })
    );
  });

  it('exits edit mode when Cancel button clicked', () => {
    const { rerender } = render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    rerender(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // After cancel, should be back in view mode with Edit button visible
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('calls onRemove when Remove button clicked', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith(mockUserBook.id);
  });

  it('displays character count for notes', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const noteLength = mockUserBook.notes.length;
    expect(screen.getByText(`${noteLength}/1000`)).toBeInTheDocument();
  });

  it('restricts notes to 1000 characters', () => {
    render(
      <CollectionItem
        userBook={mockUserBook}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    const notesTextarea = screen.getByRole('textbox');
    expect(notesTextarea.maxLength).toBe(1000);
  });
});
