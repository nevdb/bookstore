<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Author;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorManagementTest extends TestCase
{
    use RefreshDatabase;

    private $adminUser;
    private $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::create([
            'name' => 'Admin',
            'email' => 'admin-auth@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->regularUser = User::create([
            'name' => 'User',
            'email' => 'user-auth@test.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
        ]);
    }

    public function test_create_author_requires_authentication()
    {
        $response = $this->postJson('/api/authors', [
            'name' => 'New Author',
            'place_of_birth' => 'Somewhere',
        ]);

        $response->assertStatus(401);
    }

    public function test_create_author_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson('/api/authors', [
                'name' => 'New Author',
                'place_of_birth' => 'Somewhere',
            ]);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Forbidden']);
    }

    public function test_admin_can_create_update_delete_author()
    {
        $create = $this->actingAs($this->adminUser)
            ->postJson('/api/authors', [
                'name' => 'Created Author',
                'place_of_birth' => 'City',
            ]);

        $create->assertStatus(201);
        $authorId = $create->json('id');

        $this->assertDatabaseHas('authors', ['id' => $authorId, 'name' => 'Created Author']);

        $update = $this->actingAs($this->adminUser)
            ->putJson("/api/authors/{$authorId}", [
                'name' => 'Updated Author',
            ]);

        $update->assertStatus(200);
        $this->assertDatabaseHas('authors', ['id' => $authorId, 'name' => 'Updated Author']);

        $delete = $this->actingAs($this->adminUser)
            ->deleteJson("/api/authors/{$authorId}");

        $delete->assertStatus(200);
        $this->assertDatabaseMissing('authors', ['id' => $authorId]);
    }
}
