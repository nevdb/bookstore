<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $roles)
    {
        $user = $request->user();

        if (! $user) {
            Log::warning('Unauthenticated access attempt', [
                'route'  => $request->path(),
                'method' => $request->method(),
                'ip'     => $request->ip(),
            ]);

            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $allowedRoles = preg_split('/[,|]/', $roles, -1, PREG_SPLIT_NO_EMPTY);

        if (! in_array($user->role, $allowedRoles, true)) {
            Log::warning('Forbidden access attempt', [
                'user_id'        => $user->id,
                'user_role'      => $user->role,
                'required_roles' => $allowedRoles,
                'route'          => $request->path(),
                'method'         => $request->method(),
                'ip'             => $request->ip(),
            ]);

            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
