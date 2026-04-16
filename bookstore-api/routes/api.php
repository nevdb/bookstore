<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/search', [BookController::class, 'search']);
    Route::get('/books/filter', [BookController::class, 'filter']);
    Route::get('/books/{book}', [BookController::class, 'show']);
    Route::get('/authors', [AuthorController::class, 'index']);
    Route::get('/authors/{author}', [AuthorController::class, 'show']);
    Route::get('/genres', [GenreController::class, 'index']);
    Route::get('/genres/{genre}', [GenreController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/profile', [AuthController::class, 'profile']);

        Route::middleware('role:admin')->group(function () {
            // Book management
            Route::post('/books', [BookController::class, 'store']);
            Route::put('/books/{book}', [BookController::class, 'update']);
            Route::delete('/books/{book}', [BookController::class, 'destroy']);

            // Author management
            Route::post('/authors', [AuthorController::class, 'store']);
            Route::put('/authors/{author}', [AuthorController::class, 'update']);
            Route::delete('/authors/{author}', [AuthorController::class, 'destroy']);

            // Genre management
            Route::post('/genres', [GenreController::class, 'store']);
            Route::put('/genres/{genre}', [GenreController::class, 'update']);
            Route::delete('/genres/{genre}', [GenreController::class, 'destroy']);

            // Admin user management
            Route::get('/admin/users', [AdminController::class, 'getUsers']);
            Route::get('/admin/users/{userId}', [AdminController::class, 'getUser']);
            Route::post('/admin/users/{userId}/make-admin', [AdminController::class, 'makeUserAdmin']);
            Route::post('/admin/users/{userId}/demote', [AdminController::class, 'demoteAdminUser']);
            Route::put('/admin/users/{userId}', [AdminController::class, 'updateUser']);
            Route::delete('/admin/users/{userId}', [AdminController::class, 'deleteUser']);
            Route::get('/admin/statistics', [AdminController::class, 'getStatistics']);
        });

        Route::get('/user/collection', [CollectionController::class, 'index']);
        Route::post('/user/collection', [CollectionController::class, 'store']);
        Route::put('/user/collection/{id}', [CollectionController::class, 'update']);
        Route::delete('/user/collection/{id}', [CollectionController::class, 'destroy']);
    });
});
