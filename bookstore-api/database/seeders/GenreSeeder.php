<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genres = [
            [
                'name' => 'Fiction',
                'description' => 'Prose narrative that describes imaginary events and people.',
            ],
            [
                'name' => 'Mystery',
                'description' => 'A genre centered on solving a puzzle or crime.',
            ],
            [
                'name' => 'Science Fiction',
                'description' => 'Fiction based on imagined future scientific or technological advances.',
            ],
            [
                'name' => 'Romance',
                'description' => 'Fiction focused on romantic relationships and emotional connections.',
            ],
            [
                'name' => 'Horror',
                'description' => 'Fiction designed to frighten and create a sense of dread.',
            ],
            [
                'name' => 'Non-Fiction',
                'description' => 'Prose writing based on facts, real events, and real people.',
            ],
            [
                'name' => 'Biography',
                'description' => 'A detailed account of a person\'s life written by another person.',
            ],
            [
                'name' => 'Historical Fiction',
                'description' => 'Fiction that incorporates historical events and settings.',
            ],
        ];

        foreach ($genres as $genre) {
            Genre::create($genre);
        }
    }
}
