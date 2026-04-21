<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Genre;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminGenreManagementTest extends TestCase
{
    use RefreshDatabase;

    private $adminUser;
    private $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::create([
            'name' => 'Admin',
            'email' => 'admin-genre@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->regularUser = User::create([
            'name' => 'User',
            'email' => 'user-genre@test.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
        ]);
    }

    public function test_create_genre_requires_authentication()
    {
        $response = $this->postJson('/api/genres', [
            'name' => 'New Genre',
        ]);

        $response->assertStatus(401);
    }

    public function test_create_genre_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson('/api/genres', [
                'name' => 'New Genre',
            ]);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Forbidden']);
    }

    public function test_admin_can_create_update_delete_genre()
    {
        $create = $this->actingAs($this->adminUser)
            ->postJson('/api/genres', [
                'name' => 'Created Genre',
            ]);

        $create->assertStatus(201);
        $genreId = $create->json('id');

        $this->assertDatabaseHas('genres', ['id' => $genreId, 'name' => 'Created Genre']);

        $update = $this->actingAs($this->adminUser)
            ->putJson("/api/genres/{$genreId}", [
                'name' => 'Updated Genre',
            ]);

        $update->assertStatus(200);
        $this->assertDatabaseHas('genres', ['id' => $genreId, 'name' => 'Updated Genre']);

        $delete = $this->actingAs($this->adminUser)
            ->deleteJson("/api/genres/{$genreId}");

        $delete->assertStatus(200);
        $this->assertDatabaseMissing('genres', ['id' => $genreId]);
    }
}
