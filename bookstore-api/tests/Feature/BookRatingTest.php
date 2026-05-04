<?php

namespace Tests\Feature;

use App\Models\{User, Book, BookRating};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookRatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_get_book_ratings()
    {
        $book = Book::factory()->create();
        $user = User::factory()->create();
        BookRating::create(['user_id' => $user->id, 'book_id' => $book->id, 'rating' => 4]);

        $response = $this->getJson("/api/books/{$book->id}/ratings");

        $response->assertStatus(200)
                 ->assertJsonStructure(['average_rating', 'ratings_count', 'user_rating'])
                 ->assertJsonFragment(['ratings_count' => 1, 'user_rating' => null]);
    }

    public function test_authenticated_user_gets_their_own_rating()
    {
        $book = Book::factory()->create();
        $user = User::factory()->create();
        BookRating::create(['user_id' => $user->id, 'book_id' => $book->id, 'rating' => 3]);

        $response = $this->actingAs($user)->getJson("/api/books/{$book->id}/ratings");

        $response->assertStatus(200)
                 ->assertJsonFragment(['user_rating' => 3]);
    }

    public function test_average_rating_is_calculated_correctly()
    {
        $book  = Book::factory()->create();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        BookRating::create(['user_id' => $user1->id, 'book_id' => $book->id, 'rating' => 4]);
        BookRating::create(['user_id' => $user2->id, 'book_id' => $book->id, 'rating' => 2]);

        $response = $this->getJson("/api/books/{$book->id}/ratings");

        $response->assertStatus(200)
                 ->assertJsonFragment(['average_rating' => 3.0, 'ratings_count' => 2]);
    }

    public function test_unauthenticated_user_cannot_submit_rating()
    {
        $book = Book::factory()->create();

        $response = $this->postJson("/api/books/{$book->id}/ratings", ['rating' => 5]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_submit_rating()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->postJson("/api/books/{$book->id}/ratings", ['rating' => 5]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['user_rating' => 5, 'ratings_count' => 1]);

        $this->assertDatabaseHas('book_ratings', [
            'user_id' => $user->id,
            'book_id' => $book->id,
            'rating'  => 5,
        ]);
    }

    public function test_user_can_update_their_rating()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        BookRating::create(['user_id' => $user->id, 'book_id' => $book->id, 'rating' => 3]);

        $response = $this->actingAs($user)->postJson("/api/books/{$book->id}/ratings", ['rating' => 5]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['user_rating' => 5, 'ratings_count' => 1]);
    }

    public function test_rating_must_be_between_1_and_5()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user)->postJson("/api/books/{$book->id}/ratings", ['rating' => 0])
             ->assertStatus(422);

        $this->actingAs($user)->postJson("/api/books/{$book->id}/ratings", ['rating' => 6])
             ->assertStatus(422);
    }

    public function test_rating_requires_a_value()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->postJson("/api/books/{$book->id}/ratings", []);

        $response->assertStatus(422);
    }

    public function test_no_ratings_returns_null_average()
    {
        $book = Book::factory()->create();

        $response = $this->getJson("/api/books/{$book->id}/ratings");

        $response->assertStatus(200)
                 ->assertJsonFragment(['average_rating' => null, 'ratings_count' => 0]);
    }
}
