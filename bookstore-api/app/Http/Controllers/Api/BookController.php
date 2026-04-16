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
        $books = Book::with(['author', 'genre'])->paginate(12);

        return response()->json($books);
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

        return response()->json($book, 201);
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

        return response()->json($book);
    }

    public function destroy(Request $request, Book $book)
    {
        $book->delete();

        return response()->json(['message' => 'Book deleted']);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if (empty($query)) {
            return response()->json([
                'message' => 'Search query is required',
                'data' => [],
            ], 400);
        }

        $books = Book::with(['author', 'genre'])
            ->where('title', 'like', "%{$query}%")
            ->orWhereHas('author', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orWhereHas('genre', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->paginate(12);

        return response()->json($books);
    }

    public function filter(Request $request)
    {
        $query = Book::with(['author', 'genre']);

        if ($request->has('genre_id') && !empty($request->get('genre_id'))) {
            $query->where('genre_id', $request->get('genre_id'));
        }

        if ($request->has('author_id') && !empty($request->get('author_id'))) {
            $query->where('author_id', $request->get('author_id'));
        }

        $books = $query->paginate(12);

        return response()->json($books);
    }
}
