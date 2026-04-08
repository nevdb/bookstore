<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserBook;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $items = $request->user()->userBooks()
            ->with(['book.author', 'book.genre'])
            ->paginate(12);

        return response()->json($items);
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
}
