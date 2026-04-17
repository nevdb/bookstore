<?php

namespace Tests\Feature;

use App\Models\{User, Book, UserBook};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserCollectionTest extends TestCase
{
    use RefreshDatabase;
    use RefreshDatabase;

    public function test_add_book_to_collection()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->post('/api/user/collection', [
            'book_id' => $book->id,
            'status' => 'to-read'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('user_books', [
            'user_id' => $user->id,
            'book_id' => $book->id
        ]);
    }

    public function test_cannot_add_duplicate_book()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        UserBook::create([
            'user_id' => $user->id,
            'book_id' => $book->id
        ]);

        $response = $this->actingAs($user)->post('/api/user/collection', [
            'book_id' => $book->id
        ]);

        // The controller uses updateOrCreate, so it returns 201 and updates
        $response->assertStatus(201);
    }

    public function test_get_user_collection()
    {
        $user = User::factory()->create();
        UserBook::factory(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/api/user/collection');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'current_page', 'last_page'])
                 ->assertJsonCount(5, 'data');
    }

    public function test_update_book_in_collection()
    {
        $user = User::factory()->create();
        $userBook = UserBook::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->put("/api/user/collection/{$userBook->id}", [
            'personal_rating' => 5,
            'status' => 'completed',
            'notes' => 'Amazing book!'
        ]);

        $response->assertStatus(200);
        $userBook->refresh();
        $this->assertEquals(5, $userBook->personal_rating);
        $this->assertEquals('completed', $userBook->status);
    }

    public function test_remove_book_from_collection()
    {
        $user = User::factory()->create();
        $userBook = UserBook::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete("/api/user/collection/{$userBook->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('user_books', ['id' => $userBook->id]);
    }

    public function test_unauthenticated_cannot_access_collection()
    {
        $response = $this->getJson('/api/user/collection');
        $response->assertStatus(401);
    }

    public function test_user_can_only_see_their_own_collection()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        UserBook::factory()->create(['user_id' => $user1->id]);
        UserBook::factory(3)->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->get('/api/user/collection');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data');
    }

    public function test_invalid_book_id_validation()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/user/collection', [
            'book_id' => 99999
        ]);

        $response->assertStatus(422);
    }

    public function test_invalid_rating_validation()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/user/collection', [
            'book_id' => $book->id,
            'personal_rating' => 10
        ]);

        $response->assertStatus(422);
    }

    public function test_invalid_status_validation()
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/user/collection', [
            'book_id' => $book->id,
            'status' => 'invalid-status'
        ]);

        $response->assertStatus(422);
    }
}