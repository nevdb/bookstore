<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        return response()->json(Author::withCount('books')->paginate(12));
    }

    public function show(Author $author)
    {
        return response()->json($author->load('books'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'date_of_death' => ['nullable', 'date', 'after:date_of_birth'],
            'place_of_birth' => ['required', 'string', 'max:255'],
            'biography' => ['nullable', 'string'],
        ]);

        $author = Author::create($data);

        return response()->json($author, 201);
    }

    public function update(Request $request, Author $author)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'date_of_death' => ['sometimes', 'nullable', 'date', 'after:date_of_birth'],
            'place_of_birth' => ['sometimes', 'required', 'string', 'max:255'],
            'biography' => ['sometimes', 'nullable', 'string'],
        ]);

        $author->update($data);

        return response()->json($author);
    }

    public function destroy(Request $request, Author $author)
    {
        $author->delete();

        return response()->json(['message' => 'Author deleted']);
    }
}
