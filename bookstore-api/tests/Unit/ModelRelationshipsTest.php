<?php

namespace Tests\Unit;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_book_belongs_to_author_and_genre()
    {
        $author = Author::factory()->create();
        $genre = Genre::factory()->create();
        $book = Book::factory()->create([
            'author_id' => $author->id,
            'genre_id' => $genre->id,
        ]);

        $this->assertEquals($author->id, $book->author->id);
        $this->assertEquals($genre->id, $book->genre->id);
    }

    public function test_author_and_genre_have_many_books()
    {
        $author = Author::factory()->create();
        $genre = Genre::factory()->create();

        Book::factory()->count(3)->create([
            'author_id' => $author->id,
            'genre_id' => $genre->id,
        ]);

        $this->assertCount(3, $author->books);
        $this->assertCount(3, $genre->books);
    }

    public function test_user_books_many_to_many_exposes_expected_pivot_fields()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        UserBook::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'personal_rating' => 4,
            'status' => 'reading',
            'notes' => 'Interesting read',
        ]);

        $userBook = $user->books()->first();

        $this->assertNotNull($userBook);
        $this->assertEquals(4, $userBook->pivot->personal_rating);
        $this->assertEquals('reading', $userBook->pivot->status);
        $this->assertEquals('Interesting read', $userBook->pivot->notes);
    }

    public function test_user_book_casts_personal_rating_to_integer()
    {
        $userBook = UserBook::factory()->create([
            'personal_rating' => '5',
        ]);

        $this->assertIsInt($userBook->personal_rating);
        $this->assertSame(5, $userBook->personal_rating);
    }

    public function test_user_has_user_books_relation()
    {
        $user = User::factory()->create();
        UserBook::factory()->count(2)->create([
            'user_id' => $user->id,
        ]);

        $this->assertCount(2, $user->userBooks);
    }
}
