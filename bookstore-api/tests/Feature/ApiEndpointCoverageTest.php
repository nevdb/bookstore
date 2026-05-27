<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\User;
use App\Models\UserBook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointCoverageTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_requires_authentication()
    {
        $this->postJson('/api/auth/logout')->assertStatus(401);
    }

    public function test_user_statistics_requires_authentication()
    {
        $this->getJson('/api/user/statistics')->assertStatus(401);
    }

    public function test_user_statistics_returns_expected_aggregates()
    {
        $user = User::factory()->create();

        UserBook::factory()->create([
            'user_id' => $user->id,
            'status' => 'reading',
            'personal_rating' => 4,
        ]);

        UserBook::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed',
            'personal_rating' => 2,
        ]);

        UserBook::factory()->create([
            'user_id' => $user->id,
            'status' => 'to-read',
            'personal_rating' => null,
        ]);

        $response = $this->actingAs($user)->getJson('/api/user/statistics');

        $response->assertOk()
            ->assertJsonPath('data.total_books', 3)
            ->assertJsonPath('data.reading', 1)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.to_read', 1)
            ->assertJsonPath('data.average_rating', 3);
    }

    public function test_user_statistics_returns_null_average_when_no_ratings()
    {
        $user = User::factory()->create();

        UserBook::factory()->count(2)->create([
            'user_id' => $user->id,
            'personal_rating' => null,
        ]);

        $response = $this->actingAs($user)->getJson('/api/user/statistics');

        $response->assertOk()
            ->assertJsonPath('data.total_books', 2)
            ->assertJsonPath('data.average_rating', null);
    }

    public function test_books_show_returns_404_for_missing_book()
    {
        $this->getJson('/api/books/999999')->assertStatus(404);
    }

    public function test_authors_show_returns_404_for_missing_author()
    {
        $this->getJson('/api/authors/999999')->assertStatus(404);
    }

    public function test_genres_show_returns_404_for_missing_genre()
    {
        $this->getJson('/api/genres/999999')->assertStatus(404);
    }

    public function test_books_index_supports_sorting_by_title_and_year()
    {
        $bookA = Book::factory()->create([
            'title' => 'A Title',
            'publication_year' => 1990,
        ]);
        $bookB = Book::factory()->create([
            'title' => 'Z Title',
            'publication_year' => 2000,
        ]);

        $titleSorted = $this->getJson('/api/books?sort_by=title&sort_dir=asc');
        $yearSorted = $this->getJson('/api/books?sort_by=year&sort_dir=desc');

        $titleSorted->assertOk();
        $yearSorted->assertOk();

        $titleIds = collect($titleSorted->json('data'))->pluck('id')->toArray();
        $yearIds = collect($yearSorted->json('data'))->pluck('id')->toArray();

        $this->assertLessThan(array_search($bookB->id, $titleIds), array_search($bookA->id, $titleIds));
        $this->assertLessThan(array_search($bookA->id, $yearIds), array_search($bookB->id, $yearIds));
    }
}
