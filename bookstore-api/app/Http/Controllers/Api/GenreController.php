<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    public function index()
    {
        return response()->json(Genre::withCount('books')->paginate(12));
    }

    public function show(Genre $genre)
    {
        return response()->json($genre->load('books'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:genres,name'],
            'description' => ['nullable', 'string'],
        ]);

        $genre = Genre::create($data);

        return response()->json($genre, 201);
    }

    public function update(Request $request, Genre $genre)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', 'unique:genres,name,' . $genre->id],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $genre->update($data);

        return response()->json($genre);
    }

    public function destroy(Request $request, Genre $genre)
    {
        $genre->delete();

        return response()->json(['message' => 'Genre deleted']);
    }
}
