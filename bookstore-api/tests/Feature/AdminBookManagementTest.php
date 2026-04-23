<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Book;
use App\Models\Author;
use App\Models\Genre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBookManagementTest extends TestCase
{
    use RefreshDatabase;

    private $adminUser;
    private $regularUser;
    private $author;
    private $genre;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // Create regular user
        $this->regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'user@test.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
        ]);

        // Create test author and genre
        $this->author = Author::create([
            'name' => 'Test Author',
            'date_of_birth' => '1980-01-01',
            'place_of_birth' => 'Test City',
            'biography' => 'A test author',
        ]);

        $this->genre = Genre::create([
            'name' => 'Test Genre',
            'description' => 'A test genre',
        ]);
    }

    // ==================== POST /api/books (Create) Tests ====================

    public function test_create_book_requires_authentication()
    {
        $response = $this->postJson('/api/books', [
            'title' => 'New Book',
            'isbn' => '978-0123456789',
            'publication_year' => 2024,
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response->assertStatus(401);
    }

    public function test_create_book_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson('/api/books', [
                'title' => 'New Book',
                'isbn' => '978-0123456789',
                'publication_year' => 2024,
                'author_id' => $this->author->id,
                'genre_id' => $this->genre->id,
            ]);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Forbidden']);
    }

    public function test_admin_can_create_book()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'New Book Title',
                'isbn' => '978-0123456789',
                'publication_year' => 2024,
                'description' => 'An interesting book description',
                'author_id' => $this->author->id,
                'genre_id' => $this->genre->id,
                'pages' => 320,
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'id',
            'title',
            'isbn',
            'publication_year',
            'description',
            'pages',
            'created_at',
            'updated_at',
            'author' => ['id', 'name'],
            'genre' => ['id', 'name'],
        ]);

        $response->assertJson([
            'title' => 'New Book Title',
            'isbn' => '978-0123456789',
            'publication_year' => 2024,
            'pages' => 320,
        ]);

        $this->assertDatabaseHas('books', [
            'title' => 'New Book Title',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);
    }

    public function test_create_book_with_minimal_fields()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'Minimal Book',
                'author_id' => $this->author->id,
                'genre_id' => $this->genre->id,
            ]);

        $response->assertStatus(201);
        $response->assertJson(['title' => 'Minimal Book']);

        $this->assertDatabaseHas('books', ['title' => 'Minimal Book']);
    }

    public function test_create_book_missing_title()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'isbn' => '978-0123456789',
                'author_id' => $this->author->id,
                'genre_id' => $this->genre->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    public function test_create_book_missing_author_id()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'Book Without Author',
                'genre_id' => $this->genre->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['author_id']);
    }

    public function test_create_book_missing_genre_id()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'Book Without Genre',
                'author_id' => $this->author->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['genre_id']);
    }

    public function test_create_book_invalid_author_id()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'Book',
                'author_id' => 99999,
                'genre_id' => $this->genre->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['author_id']);
    }

    public function test_create_book_invalid_genre_id()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'Book',
                'author_id' => $this->author->id,
                'genre_id' => 99999,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['genre_id']);
    }

    public function test_create_book_invalid_publication_year()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => 'Book',
                'author_id' => $this->author->id,
                'genre_id' => $this->genre->id,
                'publication_year' => 'not-a-year',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['publication_year']);
    }

    public function test_create_book_title_too_long()
    {
        $longTitle = str_repeat('A', 256);
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/books', [
                'title' => $longTitle,
                'author_id' => $this->author->id,
                'genre_id' => $this->genre->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    // ==================== PUT /api/books/{id} (Update) Tests ====================

    public function test_update_book_requires_authentication()
    {
        $book = Book::create([
            'title' => 'Original Title',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->putJson("/api/books/{$book->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(401);
    }

    public function test_update_book_requires_admin_role()
    {
        $book = Book::create([
            'title' => 'Original Title',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->actingAs($this->regularUser)
            ->putJson("/api/books/{$book->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Forbidden']);
    }

    public function test_admin_can_update_book_title()
    {
        $book = Book::create([
            'title' => 'Original Title',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/books/{$book->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['title' => 'Updated Title']);

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_admin_can_update_book_all_fields()
    {
        $book = Book::create([
            'title' => 'Original Book',
            'isbn' => '978-0000000000',
            'publication_year' => 2020,
            'description' => 'Original description',
            'pages' => 100,
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $newAuthor = Author::create([
            'name' => 'New Author',
            'place_of_birth' => 'Somewhere',
        ]);

        $newGenre = Genre::create([
            'name' => 'New Genre',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/books/{$book->id}", [
                'title' => 'Updated Book',
                'isbn' => '978-1234567890',
                'publication_year' => 2024,
                'description' => 'Updated description',
                'pages' => 350,
                'author_id' => $newAuthor->id,
                'genre_id' => $newGenre->id,
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'title',
            'isbn',
            'publication_year',
            'description',
            'pages',
            'author' => ['id', 'name'],
            'genre' => ['id', 'name'],
        ]);

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'title' => 'Updated Book',
            'isbn' => '978-1234567890',
            'publication_year' => 2024,
            'pages' => 350,
            'author_id' => $newAuthor->id,
            'genre_id' => $newGenre->id,
        ]);
    }

    public function test_update_book_not_found()
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson('/api/books/99999', [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(404);
    }

    public function test_update_book_invalid_author_id()
    {
        $book = Book::create([
            'title' => 'Book',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/books/{$book->id}", [
                'author_id' => 99999,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['author_id']);
    }

    public function test_update_book_invalid_genre_id()
    {
        $book = Book::create([
            'title' => 'Book',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/books/{$book->id}", [
                'genre_id' => 99999,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['genre_id']);
    }

    // ==================== DELETE /api/books/{id} Tests ====================

    public function test_delete_book_requires_authentication()
    {
        $book = Book::create([
            'title' => 'Book to Delete',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->deleteJson("/api/books/{$book->id}");

        $response->assertStatus(401);
    }

    public function test_delete_book_requires_admin_role()
    {
        $book = Book::create([
            'title' => 'Book to Delete',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->actingAs($this->regularUser)
            ->deleteJson("/api/books/{$book->id}");

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Forbidden']);

        // Verify book still exists
        $this->assertDatabaseHas('books', ['id' => $book->id]);
    }

    public function test_admin_can_delete_book()
    {
        $book = Book::create([
            'title' => 'Book to Delete',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/books/{$book->id}");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Book deleted']);

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    public function test_delete_book_not_found()
    {
        $response = $this->actingAs($this->adminUser)
            ->deleteJson('/api/books/99999');

        $response->assertStatus(404);
    }

    public function test_delete_book_user_collection_still_valid()
    {
        // Create a book and add it to user's collection
        $book = Book::create([
            'title' => 'Book in Collection',
            'author_id' => $this->author->id,
            'genre_id' => $this->genre->id,
        ]);

        $this->regularUser->books()->attach($book->id, [
            'personal_rating' => 4,
            'status' => 'reading',
            'notes' => 'Great book',
        ]);

        // Verify the collection entry exists
        $this->assertDatabaseHas('user_books', [
            'user_id' => $this->regularUser->id,
            'book_id' => $book->id,
        ]);

        // Admin deletes the book
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/books/{$book->id}");

        $response->assertStatus(200);

        // Verify book is deleted
        $this->assertDatabaseMissing('books', ['id' => $book->id]);

        // Verify collection entry is also deleted (cascade)
        $this->assertDatabaseMissing('user_books', [
            'user_id' => $this->regularUser->id,
            'book_id' => $book->id,
        ]);
    }
}
