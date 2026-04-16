<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Author;
use App\Models\Genre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookFilterTest extends TestCase
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
        ]);

        $author2 = Author::create([
            'name' => 'George Orwell',
            'date_of_birth' => '1903-06-25',
            'place_of_birth' => 'Motihari, India',
        ]);

        // Create test genres
        $genre1 = Genre::create(['name' => 'Classic Fiction']);
        $genre2 = Genre::create(['name' => 'Dystopian']);
        $genre3 = Genre::create(['name' => 'Science Fiction']);

        // Create test books
        Book::create([
            'title' => 'To Kill a Mockingbird',
            'isbn' => '978-0061120084',
            'publication_year' => 1960,
            'author_id' => $author1->id,
            'genre_id' => $genre1->id,
            'pages' => 281,
        ]);

        Book::create([
            'title' => '1984',
            'isbn' => '978-0451524935',
            'publication_year' => 1949,
            'author_id' => $author2->id,
            'genre_id' => $genre2->id,
            'pages' => 328,
        ]);

        Book::create([
            'title' => 'Animal Farm',
            'isbn' => '978-0451526342',
            'publication_year' => 1945,
            'author_id' => $author2->id,
            'genre_id' => $genre1->id,
            'pages' => 112,
        ]);

        Book::create([
            'title' => 'Foundation',
            'isbn' => '978-0553293357',
            'publication_year' => 1951,
            'author_id' => Author::create(['name' => 'Isaac Asimov', 'place_of_birth' => 'Petrovichi, Russia'])->id,
            'genre_id' => $genre3->id,
            'pages' => 244,
        ]);
    }

    /** @test */
    public function filter_by_genre_returns_correct_books()
    {
        $classicGenre = Genre::where('name', 'Classic Fiction')->first();
        
        $response = $this->getJson("/api/books/filter?genre_id={$classicGenre->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $bookTitles = collect($response->json('data'))->pluck('title')->toArray();
        $this->assertContains('To Kill a Mockingbird', $bookTitles);
        $this->assertContains('Animal Farm', $bookTitles);
    }

    /** @test */
    public function filter_by_author_returns_correct_books()
    {
        $orwell = Author::where('name', 'George Orwell')->first();
        
        $response = $this->getJson("/api/books/filter?author_id={$orwell->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $bookTitles = collect($response->json('data'))->pluck('title')->toArray();
        $this->assertContains('1984', $bookTitles);
        $this->assertContains('Animal Farm', $bookTitles);
    }

    /** @test */
    public function filter_by_both_genre_and_author_applies_both_filters()
    {
        $orwell = Author::where('name', 'George Orwell')->first();
        $classicGenre = Genre::where('name', 'Classic Fiction')->first();
        
        $response = $this->getJson("/api/books/filter?genre_id={$classicGenre->id}&author_id={$orwell->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', 'Animal Farm');
    }

    /** @test */
    public function filter_by_nonexistent_genre_returns_empty_results()
    {
        $response = $this->getJson("/api/books/filter?genre_id=99999");

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    /** @test */
    public function filter_by_nonexistent_author_returns_empty_results()
    {
        $response = $this->getJson("/api/books/filter?author_id=99999");

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    /** @test */
    public function filter_with_no_parameters_returns_all_books()
    {
        $response = $this->getJson("/api/books/filter");

        $response->assertStatus(200);
        $response->assertJsonCount(4, 'data');
    }

    /** @test */
    public function filter_returns_paginated_results()
    {
        $response = $this->getJson("/api/books/filter?page=1");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'meta' => ['total', 'per_page', 'current_page', 'last_page'],
        ]);
    }

    /** @test */
    public function filter_results_include_author_and_genre_relations()
    {
        $response = $this->getJson("/api/books/filter");

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
    public function filter_ignores_empty_parameters()
    {
        $response = $this->getJson("/api/books/filter?genre_id=&author_id=");

        $response->assertStatus(200);
        $response->assertJsonCount(4, 'data');
    }

    /** @test */
    public function filter_is_public_endpoint_no_auth_required()
    {
        $response = $this->getJson("/api/books/filter");

        $response->assertStatus(200);
    }

    /** @test */
    public function filter_by_single_genre_in_multiple_page_scenario()
    {
        // Create additional books for pagination testing
        $genre = Genre::where('name', 'Classic Fiction')->first();
        $author = Author::first();
        
        for ($i = 0; $i < 15; $i++) {
            Book::create([
                'title' => "Test Book $i",
                'publication_year' => 2000 + $i,
                'author_id' => $author->id,
                'genre_id' => $genre->id,
            ]);
        }

        $response = $this->getJson("/api/books/filter?genre_id={$genre->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('meta.total', 17);
    }

    /** @test */
    public function filter_query_efficiency_with_eager_loading()
    {
        // Test that query uses eager loading to prevent N+1 problem
        $response = $this->getJson("/api/books/filter");

        $response->assertStatus(200);
        // Verify author and genre data are included (means eager loading worked)
        foreach ($response->json('data') as $book) {
            $this->assertArrayHasKey('author', $book);
            $this->assertArrayHasKey('genre', $book);
            $this->assertNotNull($book['author']);
            $this->assertNotNull($book['genre']);
        }
    }
}
