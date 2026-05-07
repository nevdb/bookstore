<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['author', 'genre']);

        $sortBy  = $request->input('sort_by', '');
        $sortDir = $request->input('sort_dir', 'asc') === 'desc' ? 'desc' : 'asc';

        switch ($sortBy) {
            case 'title':
                $query->orderBy('title', $sortDir);
                break;
            case 'year':
                $query->orderBy('publication_year', $sortDir);
                break;
            default:
                $query->orderBy('id', 'asc');
                break;
        }

        return response()->json($query->paginate(12));
    }

    public function show(Book $book)
    {
        return response()->json($book->load(['author', 'genre']));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'publication_year' => ['nullable', 'integer', 'digits:4'],
            'description' => ['nullable', 'string'],
            'genre_id' => ['required', 'exists:genres,id'],
            'author_id' => ['required', 'exists:authors,id'],
            'pages' => ['nullable', 'integer', 'min:1'],
        ]);

        $book = Book::create($data);

        return response()->json($book->load(['author', 'genre']), 201);
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'isbn' => ['sometimes', 'nullable', 'string', 'max:50'],
            'publication_year' => ['sometimes', 'nullable', 'integer', 'digits:4'],
            'description' => ['sometimes', 'nullable', 'string'],
            'genre_id' => ['sometimes', 'required', 'exists:genres,id'],
            'author_id' => ['sometimes', 'required', 'exists:authors,id'],
            'pages' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $book->update($data);

        return response()->json($book->load(['author', 'genre']));
    }

    public function destroy(Request $request, Book $book)
    {
        $book->delete();

        return response()->json(['message' => 'Book deleted']);
    }

    public function search(Request $request)
    {
        $query = trim((string) $request->get('q', ''));

        if ($query === '') {
            return response()->json([
                'message' => 'Search query is required',
                'data'    => [],
            ], 400);
        }

        // Reject queries that contain no letters or numbers (e.g. "%", "_", "***").
        // Prevents abusive LIKE-wildcard scans / unbounded queries.
        if (! preg_match('/[\p{L}\p{N}]/u', $query)) {
            return response()->json([
                'message' => 'Search query must contain letters or numbers',
                'data'    => [],
            ], 400);
        }

        // Escape SQL LIKE wildcards in user input so '%' / '_' are treated literally.
        $escaped = addcslashes($query, '%_\\');

        $books = Book::with(['author', 'genre'])
            ->where(function ($w) use ($escaped) {
                $w->where('title', 'like', "%{$escaped}%")
                  ->orWhereHas('author', fn ($q) => $q->where('name', 'like', "%{$escaped}%"))
                  ->orWhereHas('genre',  fn ($q) => $q->where('name',  'like', "%{$escaped}%"));
            })
            ->paginate(12);

        return $this->paginatedResponse($books);
    }

    public function filter(Request $request)
    {
        $query = Book::with(['author', 'genre']);

        if ($request->filled('genre_id')) {
            $query->where('genre_id', $request->get('genre_id'));
        }

        if ($request->filled('author_id')) {
            $query->where('author_id', $request->get('author_id'));
        }

        return $this->paginatedResponse($query->paginate(12));
    }

    /**
     * Return a paginated JSON response that exposes BOTH:
     *  - the flat Laravel paginator fields (current_page, last_page, total, per_page, data, ...)
     *    used by the existing frontend (BooksContext), and
     *  - a nested "meta" block expected by the API tests.
     */
    private function paginatedResponse(\Illuminate\Contracts\Pagination\LengthAwarePaginator $p)
    {
        $payload = $p->toArray();
        $payload['meta'] = [
            'total'        => $p->total(),
            'per_page'     => $p->perPage(),
            'current_page' => $p->currentPage(),
            'last_page'    => $p->lastPage(),
        ];

        return response()->json($payload);
    }
}
