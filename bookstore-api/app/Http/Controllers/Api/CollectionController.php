<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserBook;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->userBooks()
            ->with(['book.author', 'book.genre']);

        // Free-text search: book title, author name, or genre name
        if ($q = $request->input('q')) {
            $query->whereHas('book', function ($bookQuery) use ($q) {
                $bookQuery->where('title', 'like', '%' . $q . '%')
                    ->orWhereHas('author', function ($authorQuery) use ($q) {
                        $authorQuery->where('name', 'like', '%' . $q . '%');
                    })
                    ->orWhereHas('genre', function ($genreQuery) use ($q) {
                        $genreQuery->where('name', 'like', '%' . $q . '%');
                    });
            });
        }

        // Filter by reading status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by genre
        if ($genreId = $request->input('genre_id')) {
            $query->whereHas('book', function ($bookQuery) use ($genreId) {
                $bookQuery->where('genre_id', $genreId);
            });
        }

        // Filter by author
        if ($authorId = $request->input('author_id')) {
            $query->whereHas('book', function ($bookQuery) use ($authorId) {
                $bookQuery->where('author_id', $authorId);
            });
        }

        // Filter by personal rating
        if ($request->filled('rating')) {
            $query->where('personal_rating', (int) $request->input('rating'));
        }

        // Sorting
        $sortBy  = $request->input('sort_by', 'date_added');
        $sortDir = $request->input('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc';

        switch ($sortBy) {
            case 'title':
                $query->join('books as sort_books', 'user_books.book_id', '=', 'sort_books.id')
                      ->orderBy('sort_books.title', $sortDir)
                      ->select('user_books.*');
                break;
            case 'year':
                $query->join('books as sort_books', 'user_books.book_id', '=', 'sort_books.id')
                      ->orderBy('sort_books.publication_year', $sortDir)
                      ->select('user_books.*');
                break;
            case 'rating':
                $query->orderBy('personal_rating', $sortDir);
                break;
            case 'date_added':
            default:
                $query->orderBy('user_books.created_at', $sortDir);
                break;
        }

        return response()->json($query->paginate(12));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'personal_rating' => ['nullable', 'integer', 'between:1,5'],
            'status' => ['nullable', 'in:to-read,reading,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $userBook = $request->user()->userBooks()->updateOrCreate(
            ['book_id' => $data['book_id']],
            [
                'personal_rating' => $data['personal_rating'] ?? null,
                'status' => $data['status'] ?? 'to-read',
                'notes' => $data['notes'] ?? null,
            ]
        );

        return response()->json($userBook, 201);
    }

    public function update(Request $request, $id)
    {
        $userBook = $request->user()->userBooks()->findOrFail($id);

        $data = $request->validate([
            'personal_rating' => ['nullable', 'integer', 'between:1,5'],
            'status' => ['nullable', 'in:to-read,reading,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $userBook->update($data);

        return response()->json($userBook);
    }

    public function destroy(Request $request, $id)
    {
        $userBook = $request->user()->userBooks()->findOrFail($id);
        $userBook->delete();

        return response()->json(['message' => 'Removed from collection']);
    }

    public function statistics(Request $request)
    {
        $userBooks = $request->user()->userBooks();

        $totalBooks    = (clone $userBooks)->count();
        $reading       = (clone $userBooks)->where('status', 'reading')->count();
        $completed     = (clone $userBooks)->where('status', 'completed')->count();
        $toRead        = (clone $userBooks)->where('status', 'to-read')->count();
        $averageRating = (clone $userBooks)->whereNotNull('personal_rating')->avg('personal_rating');

        return response()->json([
            'data' => [
                'total_books'    => $totalBooks,
                'reading'        => $reading,
                'completed'      => $completed,
                'to_read'        => $toRead,
                'average_rating' => $averageRating ? round($averageRating, 1) : null,
            ],
        ]);
    }
}
