<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class AdminController extends Controller
{
    /**
     * Get all users (paginated)
     */
    public function getUsers(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        $users = User::paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Get a single user by ID
     */
    public function getUser($userId)
    {
        $user = User::findOrFail($userId);

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Promote a user to admin
     */
    public function makeUserAdmin(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'User is already an admin',
                'user' => $user,
            ], 400);
        }

        $user->role = 'admin';
        $user->save();

        return response()->json([
            'message' => 'User promoted to admin successfully',
            'user' => $user,
        ], 200);
    }

    /**
     * Demote an admin to regular user
     */
    public function demoteAdminUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $currentUser = $request->user();

        // Prevent demoting yourself
        if ($currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot demote yourself',
            ], 403);
        }

        if ($user->role === 'user') {
            return response()->json([
                'message' => 'User is not an admin',
                'user' => $user,
            ], 400);
        }

        $user->role = 'user';
        $user->save();

        return response()->json([
            'message' => 'Admin demoted to user successfully',
            'user' => $user,
        ], 200);
    }

    /**
     * Update user information (name, email)
     */
    public function updateUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $currentUser = $request->user();

        // Prevent deleting yourself
        if ($currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        // Delete user's collection entries (will keep system books intact due to cascade on delete)
        $user->books()->detach();

        // Delete the user
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Get admin statistics
     */
    public function getStatistics()
    {
        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'total_admins' => User::where('role', 'admin')->count(),
                'total_regular_users' => User::where('role', 'user')->count(),
            ],
        ]);
    }
}