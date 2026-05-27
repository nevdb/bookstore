<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicReadEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_books_index_is_public_and_paginated()
    {
        $author = Author::factory()->create();
        $genre = Genre::factory()->create();
        Book::factory()->count(15)->create([
            'author_id' => $author->id,
            'genre_id' => $genre->id,
        ]);

        $response = $this->getJson('/api/books?page=1');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);

        $this->assertCount(12, $response->json('data'));
    }

    public function test_books_show_is_public_and_includes_relations()
    {
        $book = Book::factory()->create();

        $response = $this->getJson('/api/books/' . $book->id);

        $response->assertOk()
            ->assertJsonPath('id', $book->id)
            ->assertJsonStructure([
                'id',
                'title',
                'author' => ['id', 'name'],
                'genre' => ['id', 'name'],
            ]);
    }

    public function test_authors_index_is_public_and_paginated_with_books_count()
    {
        Author::factory()->count(13)->create();

        $response = $this->getJson('/api/authors?page=1');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'name',
                        'books_count',
                    ],
                ],
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);

        $this->assertCount(12, $response->json('data'));
    }

    public function test_authors_show_is_public_and_includes_books()
    {
        $author = Author::factory()->create();
        Book::factory()->count(2)->create(['author_id' => $author->id]);

        $response = $this->getJson('/api/authors/' . $author->id);

        $response->assertOk()
            ->assertJsonPath('id', $author->id)
            ->assertJsonCount(2, 'books');
    }

    public function test_genres_index_is_public_and_paginated_with_books_count()
    {
        for ($i = 1; $i <= 13; $i++) {
            Genre::create([
                'name' => 'Genre ' . $i,
                'description' => 'Description ' . $i,
            ]);
        }

        $response = $this->getJson('/api/genres?page=1');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'name',
                        'books_count',
                    ],
                ],
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);

        $this->assertCount(12, $response->json('data'));
    }

    public function test_genres_show_is_public_and_includes_books()
    {
        $genre = Genre::factory()->create();
        Book::factory()->count(2)->create(['genre_id' => $genre->id]);

        $response = $this->getJson('/api/genres/' . $genre->id);

        $response->assertOk()
            ->assertJsonPath('id', $genre->id)
            ->assertJsonCount(2, 'books');
    }
}
