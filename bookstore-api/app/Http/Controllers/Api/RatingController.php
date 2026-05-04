<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookRating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /**
     * Get the aggregated rating info for a book.
     * Optionally includes the authenticated user's own rating.
     */
    public function show(Request $request, Book $book)
    {
        $averageRating = $book->ratings()->avg('rating');
        $ratingsCount  = $book->ratings()->count();
        $userRating    = null;

        if ($request->user()) {
            $userRating = $book->ratings()
                ->where('user_id', $request->user()->id)
                ->value('rating');
        }

        return response()->json([
            'average_rating' => $averageRating ? round((float) $averageRating, 1) : null,
            'ratings_count'  => $ratingsCount,
            'user_rating'    => $userRating,
        ]);
    }

    /**
     * Submit or update the authenticated user's rating for a book.
     */
    public function store(Request $request, Book $book)
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
        ]);

        $bookRating = BookRating::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'book_id' => $book->id,
            ],
            ['rating' => $data['rating']]
        );

        $averageRating = $book->ratings()->avg('rating');
        $ratingsCount  = $book->ratings()->count();

        return response()->json([
            'average_rating' => round((float) $averageRating, 1),
            'ratings_count'  => $ratingsCount,
            'user_rating'    => $bookRating->rating,
        ], 200);
    }
}
