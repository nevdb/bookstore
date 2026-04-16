<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authors = [
            [
                'name' => 'F. Scott Fitzgerald',
                'date_of_birth' => '1896-09-24',
                'date_of_death' => '1940-12-21',
                'place_of_birth' => 'Saint Paul, Minnesota, USA',
                'biography' => 'American writer, novelist, and short story author of the Jazz Age.',
            ],
            [
                'name' => 'George Orwell',
                'date_of_birth' => '1903-06-25',
                'date_of_death' => '1950-01-21',
                'place_of_birth' => 'Motihari, Bengal, British India',
                'biography' => 'English writer and political commentator, known for dystopian novels.',
            ],
            [
                'name' => 'Jane Austen',
                'date_of_birth' => '1775-12-16',
                'date_of_death' => '1817-07-18',
                'place_of_birth' => 'Steventon, Hampshire, England',
                'biography' => 'English novelist known for her romantic fiction and social commentary.',
            ],
            [
                'name' => 'Harper Lee',
                'date_of_birth' => '1926-04-28',
                'date_of_death' => '2016-02-19',
                'place_of_birth' => 'Monroeville, Alabama, USA',
                'biography' => 'American author who won the Pulitzer Prize for To Kill a Mockingbird.',
            ],
            [
                'name' => 'Stephen King',
                'date_of_birth' => '1947-09-21',
                'date_of_death' => null,
                'place_of_birth' => 'Portland, Maine, USA',
                'biography' => 'American horror and suspense author, prolific writer of bestselling novels.',
            ],
            [
                'name' => 'Agatha Christie',
                'date_of_birth' => '1890-01-15',
                'date_of_death' => '1976-01-12',
                'place_of_birth' => 'Torquay, Devon, England',
                'biography' => 'British writer and best-selling novelist, master of mystery crime novels.',
            ],
        ];

        foreach ($authors as $author) {
            Author::create($author);
        }
    }
}
