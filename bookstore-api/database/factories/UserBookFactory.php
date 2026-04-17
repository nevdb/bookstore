<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Book;
use App\Models\UserBook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserBook>
 */
class UserBookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'personal_rating' => fake()->optional()->numberBetween(1, 5),
            'status' => fake()->randomElement(['to-read', 'reading', 'completed']),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
