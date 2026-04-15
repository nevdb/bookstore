<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private $adminUser;
    private $regularUser;

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

        // Create additional users for testing
        User::create([
            'name' => 'Another Admin',
            'email' => 'admin2@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'name' => "Test User {$i}",
                'email' => "testuser{$i}@test.com",
                'password' => bcrypt('password123'),
                'role' => 'user',
            ]);
        }
    }

    // ==================== GET /api/admin/users Tests ====================

    public function test_get_users_requires_authentication()
    {
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(401);
    }

    public function test_get_users_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/admin/users');
        $response->assertStatus(403);
    }

    public function test_admin_can_get_users_with_pagination()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/users?page=1&per_page=15');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'email', 'role', 'created_at']
            ],
            'pagination' => ['total', 'per_page', 'current_page', 'last_page']
        ]);

        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(1, $response->json('pagination.current_page'));
        $this->assertEquals(15, $response->json('pagination.per_page'));
    }

    public function test_get_users_pagination_second_page()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/users?page=2&per_page=15');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('pagination.current_page'));
        $this->assertEquals(8, count($response->json('data'))); // 23 total users - 15 on first page = 8 on second
    }

    public function test_get_users_default_per_page()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/users');

        $response->assertStatus(200);
        $this->assertEquals(15, $response->json('pagination.per_page'));
    }

    // ==================== GET /api/admin/users/{userId} Tests ====================

    public function test_get_single_user_requires_authentication()
    {
        $response = $this->getJson("/api/admin/users/{$this->regularUser->id}");
        $response->assertStatus(401);
    }

    public function test_get_single_user_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson("/api/admin/users/{$this->adminUser->id}");
        $response->assertStatus(403);
    }

    public function test_admin_can_get_single_user()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/admin/users/{$this->regularUser->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'id' => $this->regularUser->id,
                'name' => $this->regularUser->name,
                'email' => $this->regularUser->email,
                'role' => 'user',
            ]
        ]);
    }

    public function test_get_nonexistent_user_returns_404()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/users/99999');

        $response->assertStatus(404);
    }

    // ==================== POST /api/admin/users/{userId}/make-admin Tests ====================

    public function test_promote_user_requires_authentication()
    {
        $response = $this->postJson("/api/admin/users/{$this->regularUser->id}/make-admin", [
            'user_id' => $this->regularUser->id
        ]);
        $response->assertStatus(401);
    }

    public function test_promote_user_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson("/api/admin/users/{$this->adminUser->id}/make-admin", [
                'user_id' => $this->adminUser->id
            ]);
        $response->assertStatus(403);
    }

    public function test_admin_can_promote_regular_user_to_admin()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admin/users/{$this->regularUser->id}/make-admin", [
                'user_id' => $this->regularUser->id
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'User promoted to admin successfully',
            'user' => [
                'id' => $this->regularUser->id,
                'role' => 'admin'
            ]
        ]);

        $this->regularUser->refresh();
        $this->assertEquals('admin', $this->regularUser->role);
    }

    public function test_cannot_promote_user_already_admin()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admin/users/{$this->adminUser->id}/make-admin", [
                'user_id' => $this->adminUser->id
            ]);

        $response->assertStatus(400);
        $response->assertJson([
            'message' => 'User is already an admin'
        ]);
    }

    public function test_promote_nonexistent_user_fails()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/admin/users/99999/make-admin', [
                'user_id' => 99999
            ]);

        $response->assertStatus(422); // Validation error
    }

    // ==================== POST /api/admin/users/{userId}/demote Tests ====================

    public function test_demote_admin_requires_authentication()
    {
        $response = $this->postJson("/api/admin/users/{$this->adminUser->id}/demote", [
            'user_id' => $this->adminUser->id
        ]);
        $response->assertStatus(401);
    }

    public function test_demote_admin_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson("/api/admin/users/{$this->adminUser->id}/demote", [
                'user_id' => $this->adminUser->id
            ]);
        $response->assertStatus(403);
    }

    public function test_admin_can_demote_another_admin()
    {
        $anotherAdmin = User::where('email', 'admin2@test.com')->first();

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admin/users/{$anotherAdmin->id}/demote", [
                'user_id' => $anotherAdmin->id
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Admin demoted to user successfully',
            'user' => [
                'id' => $anotherAdmin->id,
                'role' => 'user'
            ]
        ]);

        $anotherAdmin->refresh();
        $this->assertEquals('user', $anotherAdmin->role);
    }

    public function test_admin_cannot_demote_themselves()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admin/users/{$this->adminUser->id}/demote", [
                'user_id' => $this->adminUser->id
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'You cannot demote yourself'
        ]);

        $this->adminUser->refresh();
        $this->assertEquals('admin', $this->adminUser->role);
    }

    public function test_cannot_demote_regular_user()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/admin/users/{$this->regularUser->id}/demote", [
                'user_id' => $this->regularUser->id
            ]);

        $response->assertStatus(400);
        $response->assertJson([
            'message' => 'User is not an admin'
        ]);
    }

    // ==================== PUT /api/admin/users/{userId} Tests ====================

    public function test_update_user_requires_authentication()
    {
        $response = $this->putJson("/api/admin/users/{$this->regularUser->id}", [
            'name' => 'Updated Name'
        ]);
        $response->assertStatus(401);
    }

    public function test_update_user_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->putJson("/api/admin/users/{$this->adminUser->id}", [
                'name' => 'Updated Name'
            ]);
        $response->assertStatus(403);
    }

    public function test_admin_can_update_user_name()
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => 'New Name'
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $this->regularUser->id,
                'name' => 'New Name'
            ]
        ]);

        $this->regularUser->refresh();
        $this->assertEquals('New Name', $this->regularUser->name);
    }

    public function test_admin_can_update_user_email()
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'email' => 'newemail@test.com'
            ]);

        $response->assertStatus(200);
        $this->regularUser->refresh();
        $this->assertEquals('newemail@test.com', $this->regularUser->email);
    }

    public function test_admin_can_update_both_name_and_email()
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => 'New Name',
                'email' => 'newemail@test.com'
            ]);

        $response->assertStatus(200);
        $this->regularUser->refresh();
        $this->assertEquals('New Name', $this->regularUser->name);
        $this->assertEquals('newemail@test.com', $this->regularUser->email);
    }

    public function test_cannot_update_to_duplicate_email()
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'email' => $this->adminUser->email
            ]);

        $response->assertStatus(422); // Validation error
    }

    // ==================== DELETE /api/admin/users/{userId} Tests ====================

    public function test_delete_user_requires_authentication()
    {
        $userToDelete = User::where('email', 'testuser1@test.com')->first();
        $response = $this->deleteJson("/api/admin/users/{$userToDelete->id}");
        $response->assertStatus(401);
    }

    public function test_delete_user_requires_admin_role()
    {
        $userToDelete = User::where('email', 'testuser1@test.com')->first();
        $response = $this->actingAs($this->regularUser)
            ->deleteJson("/api/admin/users/{$userToDelete->id}");
        $response->assertStatus(403);
    }

    public function test_admin_can_delete_user()
    {
        $userToDelete = User::where('email', 'testuser1@test.com')->first();
        $userId = $userToDelete->id;

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/admin/users/{$userId}");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'User deleted successfully'
        ]);

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_cannot_delete_themselves()
    {
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/admin/users/{$this->adminUser->id}");

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'You cannot delete your own account'
        ]);

        $this->assertDatabaseHas('users', ['id' => $this->adminUser->id]);
    }

    public function test_delete_nonexistent_user_returns_404()
    {
        $response = $this->actingAs($this->adminUser)
            ->deleteJson('/api/admin/users/99999');

        $response->assertStatus(404);
    }

    // ==================== GET /api/admin/statistics Tests ====================

    public function test_statistics_requires_authentication()
    {
        $response = $this->getJson('/api/admin/statistics');
        $response->assertStatus(401);
    }

    public function test_statistics_requires_admin_role()
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/admin/statistics');
        $response->assertStatus(403);
    }

    public function test_admin_can_get_statistics()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/statistics');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => ['total_users', 'total_admins', 'total_regular_users']
        ]);

        $this->assertEquals(23, $response->json('data.total_users'));
        $this->assertEquals(2, $response->json('data.total_admins'));
        $this->assertEquals(21, $response->json('data.total_regular_users'));
    }

    public function test_statistics_update_after_promotion()
    {
        // Get initial stats
        $response1 = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/statistics');

        $initialAdmins = $response1->json('data.total_admins');
        $initialUsers = $response1->json('data.total_regular_users');

        // Promote a user
        $this->actingAs($this->adminUser)
            ->postJson("/api/admin/users/{$this->regularUser->id}/make-admin", [
                'user_id' => $this->regularUser->id
            ]);

        // Get updated stats
        $response2 = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/statistics');

        $this->assertEquals($initialAdmins + 1, $response2->json('data.total_admins'));
        $this->assertEquals($initialUsers - 1, $response2->json('data.total_regular_users'));
    }
}
