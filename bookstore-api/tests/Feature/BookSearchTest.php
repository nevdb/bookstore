<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Author;
use App\Models\Genre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedTestData();
    }

    private function seedTestData(): void
    {
        // Create test authors
        $author1 = Author::create([
            'name' => 'Harper Lee',
            'date_of_birth' => '1926-04-28',
            'place_of_birth' => 'Monroeville, Alabama',
            'biography' => 'American novelist author of To Kill a Mockingbird',
        ]);

        $author2 = Author::create([
            'name' => 'George Orwell',
            'date_of_birth' => '1903-06-25',
            'place_of_birth' => 'Motihari, India',
            'biography' => 'English writer and journalist',
        ]);

        // Create test genres
        $genre1 = Genre::create([
            'name' => 'Classic Fiction',
            'description' => 'Timeless literary works',
        ]);

        $genre2 = Genre::create([
            'name' => 'Dystopian',
            'description' => 'Dystopian science fiction',
        ]);

        // Create test books
        Book::create([
            'title' => 'To Kill a Mockingbird',
            'isbn' => '978-0061120084',
            'publication_year' => 1960,
            'description' => 'A classic novel about racial injustice in the American South',
            'author_id' => $author1->id,
            'genre_id' => $genre1->id,
            'pages' => 281,
        ]);

        Book::create([
            'title' => '1984',
            'isbn' => '978-0451524935',
            'publication_year' => 1949,
            'description' => 'A dystopian social science fiction novel',
            'author_id' => $author2->id,
            'genre_id' => $genre2->id,
            'pages' => 328,
        ]);

        Book::create([
            'title' => 'Animal Farm',
            'isbn' => '978-0451526342',
            'publication_year' => 1945,
            'description' => 'An allegorical novella',
            'author_id' => $author2->id,
            'genre_id' => $genre1->id,
            'pages' => 112,
        ]);
    }

    /** @test */
    public function search_by_book_title()
    {
        $response = $this->getJson('/api/books/search?q=mockingbird');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', 'To Kill a Mockingbird');
    }

    /** @test */
    public function search_by_partial_title_is_case_insensitive()
    {
        $response = $this->getJson('/api/books/search?q=ANIMAL');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', 'Animal Farm');
    }

    /** @test */
    public function search_by_author_name()
    {
        $response = $this->getJson('/api/books/search?q=harper');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', 'To Kill a Mockingbird');
    }

    /** @test */
    public function search_by_author_returns_all_author_books()
    {
        $response = $this->getJson('/api/books/search?q=orwell');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $bookTitles = collect($response->json('data'))->pluck('title')->toArray();
        $this->assertContains('1984', $bookTitles);
        $this->assertContains('Animal Farm', $bookTitles);
    }

    /** @test */
    public function search_by_genre_name()
    {
        $response = $this->getJson('/api/books/search?q=dystopian');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', '1984');
    }

    /** @test */
    public function search_returns_books_with_matching_title_author_or_genre()
    {
        // "Fiction" appears in genre "Classic Fiction"
        $response = $this->getJson('/api/books/search?q=fiction');

        $response->assertStatus(200);
        // Should return books in "Classic Fiction" genre
        $this->assertGreaterThan(0, count($response->json('data')));
    }

    /** @test */
    public function search_returns_empty_results_for_no_matches()
    {
        $response = $this->getJson('/api/books/search?q=nonexistent');

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    /** @test */
    public function search_requires_query_parameter()
    {
        $response = $this->getJson('/api/books/search');

        $response->assertStatus(400);
    }

    /** @test */
    public function search_returns_paginated_results()
    {
        $response = $this->getJson('/api/books/search?q=a&page=1');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'meta' => ['total', 'per_page', 'current_page', 'last_page'],
        ]);
    }

    /** @test */
    public function search_results_include_author_and_genre_relations()
    {
        $response = $this->getJson('/api/books/search?q=mockingbird');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'title',
                    'author' => ['id', 'name'],
                    'genre' => ['id', 'name'],
                ],
            ],
        ]);
    }

    /** @test */
    public function search_with_empty_query_returns_error()
    {
        $response = $this->getJson('/api/books/search?q=');

        $response->assertStatus(400);
        $response->assertJsonPath('message', 'Search query is required');
    }

    /** @test */
    public function search_with_special_characters()
    {
        // Test that special characters don't break the search
        $response = $this->getJson('/api/books/search?q=%');

        $response->assertStatus(400);
    }

    /** @test */
    public function search_is_public_endpoint_no_auth_required()
    {
        // Verify endpoint works without authentication
        $response = $this->getJson('/api/books/search?q=mockingbird');

        $response->assertStatus(200);
    }
}
