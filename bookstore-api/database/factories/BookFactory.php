<?php

namespace Database\Factories;

use App\Models\Author;
use App\Models\Genre;
use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'isbn' => fake()->isbn13(),
            'publication_year' => fake()->year(),
            'description' => fake()->paragraph(5),
            'author_id' => Author::factory(),
            'genre_id' => Genre::factory(),
            'pages' => fake()->numberBetween(100, 800),
        ];
    }
}
