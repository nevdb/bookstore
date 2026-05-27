<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseConstraintsTest extends TestCase
{
    use RefreshDatabase;

    public function test_genres_name_must_be_unique()
    {
        Genre::factory()->create(['name' => 'Unique Genre']);

        $this->expectException(QueryException::class);

        Genre::factory()->create(['name' => 'Unique Genre']);
    }

    public function test_user_books_has_unique_user_book_pair_constraint()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        UserBook::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ]);

        $this->expectException(QueryException::class);

        UserBook::factory()->create([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ]);
    }

    public function test_deleting_author_cascades_to_books()
    {
        $author = Author::factory()->create();
        $book = Book::factory()->create(['author_id' => $author->id]);

        $author->delete();

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    public function test_deleting_genre_cascades_to_books()
    {
        $genre = Genre::factory()->create();
        $book = Book::factory()->create(['genre_id' => $genre->id]);

        $genre->delete();

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    public function test_deleting_book_cascades_to_user_books()
    {
        $userBook = UserBook::factory()->create();
        $bookId = $userBook->book_id;
        $id = $userBook->id;

        Book::findOrFail($bookId)->delete();

        $this->assertDatabaseMissing('user_books', ['id' => $id]);
    }

    public function test_deleting_user_cascades_to_user_books()
    {
        $userBook = UserBook::factory()->create();
        $userId = $userBook->user_id;
        $id = $userBook->id;

        User::findOrFail($userId)->delete();

        $this->assertDatabaseMissing('user_books', ['id' => $id]);
    }

    public function test_users_role_defaults_to_user()
    {
        // Verify database-level default role on insert when role is omitted.
        $insertedId = \DB::table('users')->insertGetId([
            'name' => 'Default Role User',
            'email' => 'defaultrole@example.com',
            'password' => bcrypt('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $inserted = User::findOrFail($insertedId);

        $this->assertSame('user', $inserted->role);
    }
}
